import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:8787/api';
const results = [];
const created = new Set();
const day = '2036-10-20';
const payload = (start = '09:00', end = '11:00', equipmentId = 'eq-1') => ({
  equipmentId, borrowerName: "O'Brien; DROP TABLE bookings; --", purpose: 'HTTP verification',
  startAt: `${day}T${start}:00.000Z`, endAt: `${day}T${end}:00.000Z`
});

async function request(name, method, path, body, expected) {
  const response = await fetch(base + path, {
    method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body)
  });
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;
  results.push({ name, method, path, request: body, expected, actual: response.status, response: data });
  if (method === 'POST' && response.status === 201) created.add(data.id);
  assert.equal(response.status, expected, `${name}: ${raw}`);
  if (expected === 204) assert.equal(raw, '');
  else assert.match(response.headers.get('content-type'), /application\/json/);
  if (expected >= 400) assert.equal(typeof data.error, 'string');
  return data;
}

try {
  const equipment = await request('Seeded equipment', 'GET', '/equipment', undefined, 200);
  assert.ok(equipment.length >= 2);
  const first = await request('Create booking with SQL-like text', 'POST', '/bookings', payload(), 201);
  assert.equal(first.borrowerName, payload().borrowerName);
  assert.equal(first.startAt, payload().startAt);
  assert.ok((await request('List bookings', 'GET', '/bookings', undefined, 200)).some(b => b.id === first.id));
  await request('Fetch booking', 'GET', `/bookings/${first.id}`, undefined, 200);
  await request('Purpose-only patch excludes itself', 'PATCH', `/bookings/${first.id}`, { purpose: 'Updated' }, 200);
  for (const [name, start, end] of [['Identical', '09:00', '11:00'], ['Partial', '10:00', '12:00'], ['Contained', '09:30', '10:00'], ['Enclosing', '08:00', '12:00']]) {
    await request(`${name} conflict`, 'POST', '/bookings', payload(start, end), 409);
  }
  const adjacent = await request('Touching end boundary', 'POST', '/bookings', payload('11:00', '12:00'), 201);
  await request('Touching start boundary', 'POST', '/bookings', payload('08:00', '09:00'), 201);
  const other = await request('Different equipment may overlap', 'POST', '/bookings', payload('09:00', '11:00', 'eq-2'), 201);
  await request('Time update conflict', 'PATCH', `/bookings/${adjacent.id}`, { startAt: `${day}T10:00:00Z` }, 409);
  assert.equal((await request('Failed update preserves original', 'GET', `/bookings/${adjacent.id}`, undefined, 200)).startAt, adjacent.startAt);
  await request('Equipment update conflict', 'PATCH', `/bookings/${other.id}`, { equipmentId: 'eq-1' }, 409);
  for (const [name, body] of [
    ['Missing fields', { equipmentId: 'eq-1' }], ['Wrong field type', { ...payload(), borrowerName: 5 }],
    ['Unknown equipment', { ...payload(), equipmentId: 'missing' }],
    ['Impossible date', { ...payload(), startAt: '2036-02-30T09:00:00Z' }],
    ['Timezone missing', { ...payload(), startAt: `${day}T09:00:00` }],
    ['Equal times', payload('09:00', '09:00')], ['Reversed times', payload('11:00', '09:00')],
    ['Unknown field', { ...payload(), extra: true }], ['Malformed JSON', '{'], ['Null body', 'null']
  ]) await request(name, 'POST', '/bookings', body, 400);
  await request('Empty patch', 'PATCH', `/bookings/${first.id}`, {}, 400);
  for (const method of ['GET', 'PATCH', 'DELETE']) await request(`${method} missing booking`, method, '/bookings/missing', method === 'PATCH' ? { purpose: 'x' } : undefined, 404);
  await request('Unknown route', 'GET', '/unknown', undefined, 404);
  const utc = await request('Timezone normalization', 'POST', '/bookings', {
    ...payload(), startAt: '2036-10-21T09:00:00+07:00', endAt: '2036-10-21T10:00:00+07:00'
  }, 201);
  assert.equal(utc.startAt, '2036-10-21T02:00:00.000Z');
  // Use unasserted requests so completion order cannot hide either concurrent result.
  const concurrent = await Promise.all([1, 2].map(async () => {
    const response = await fetch(base + '/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload('14:00', '15:00')) });
    const data = await response.json();
    if (response.status === 201) created.add(data.id);
    return { status: response.status, body: data };
  }));
  assert.deepEqual(concurrent.map(r => r.status).sort(), [201, 409]);
  results.push({ name: 'Concurrent conflicting creates', expected: [201, 409], actual: concurrent.map(r => r.status).sort(), response: concurrent });
  await request('Delete booking', 'DELETE', `/bookings/${first.id}`, undefined, 204);
  created.delete(first.id);
  await request('Fetch deleted booking', 'GET', `/bookings/${first.id}`, undefined, 404);
  console.log(`Passed ${results.length} HTTP cases`);
} finally {
  for (const id of created) await fetch(`${base}/bookings/${id}`, { method: 'DELETE' });
  await writeFile('docs/TEST_EVIDENCE.md', `# Phase 2 HTTP Test Evidence\n\nExecuted: ${new Date().toISOString()} (UTC).\nBase URL: \`${base}\`.\nClient: Node.js fetch HTTP client.\nCommand: \`npm run test:http\` with the local server running and seeded equipment.\nUses 2036-10-20/21; do not reserve these times while running this test. Created test bookings are removed afterward.\n\nEvidence below records actual request/response results. The runner exits nonzero on failed assertions.\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`);
}
