import assert from 'node:assert/strict';
import { writeEvidence } from './evidence.mjs';

import { BASE_URL, REMOTE } from './config.mjs';
const base = BASE_URL;
const results = [];
const created = new Set();
let failure;
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
  assert.deepEqual(await request('Fetch booking', 'GET', `/bookings/${first.id}`, undefined, 200), first);
  const patched = await request('Purpose-only patch excludes itself', 'PATCH', `/bookings/${first.id}`, { purpose: 'Updated' }, 200);
  assert.deepEqual(patched, { ...first, purpose: 'Updated' });
  const full = await request('Full payload update from instructor guide', 'PATCH', `/bookings/${first.id}`, {
    ...payload('12:00', '14:00'), borrowerName: 'Somchai Jaidee', purpose: 'Updated class presentation'
  }, 200);
  assert.deepEqual(full, { id: first.id, ...payload('12:00', '14:00'), borrowerName: 'Somchai Jaidee', purpose: 'Updated class presentation' });
  assert.deepEqual(await request('Read after full update', 'GET', `/bookings/${first.id}`, undefined, 200), full);
  await request('Restore initial interval', 'PATCH', `/bookings/${first.id}`, payload(), 200);
  for (const [name, start, end] of [['Identical', '09:00', '11:00'], ['Partial', '10:00', '12:00'], ['Contained', '09:30', '10:00'], ['Enclosing', '08:00', '12:00']]) {
    await request(`${name} conflict`, 'POST', '/bookings', payload(start, end), 409);
  }
  const adjacent = await request('Touching end boundary', 'POST', '/bookings', payload('11:00', '12:00'), 201);
  await request('Touching start boundary', 'POST', '/bookings', payload('08:00', '09:00'), 201);
  const other = await request('Different equipment may overlap', 'POST', '/bookings', payload('09:00', '11:00', 'eq-2'), 201);
  await request('Time update conflict', 'PATCH', `/bookings/${adjacent.id}`, { startAt: `${day}T10:00:00Z` }, 409);
  assert.deepEqual(await request('Failed update preserves original', 'GET', `/bookings/${adjacent.id}`, undefined, 200), adjacent);
  await request('Equipment update conflict', 'PATCH', `/bookings/${other.id}`, { equipmentId: 'eq-1' }, 409);
  assert.deepEqual(await request('Failed equipment update preserves all fields', 'GET', `/bookings/${other.id}`, undefined, 200), other);
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
  assert.equal(utc.endAt, '2036-10-21T03:00:00.000Z');
  // Use unasserted requests so completion order cannot hide either concurrent result.
  const concurrent = await Promise.all([1, 2].map(async () => {
    const response = await fetch(base + '/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload('14:00', '15:00')) });
    const data = await response.json();
    if (response.status === 201) created.add(data.id);
    return { status: response.status, body: data };
  }));
  assert.deepEqual(concurrent.map(r => r.status).sort(), [201, 409]);
  results.push({ name: 'Concurrent conflicting creates', expected: [201, 409], actual: concurrent.map(r => r.status).sort(), response: concurrent });
  const saved = await request('Concurrent creates leave exactly one reservation', 'GET', '/bookings', undefined, 200);
  assert.equal(saved.filter(b => b.equipmentId === 'eq-1' && b.startAt === `${day}T14:00:00.000Z`).length, 1);
  await request('Delete booking', 'DELETE', `/bookings/${first.id}`, undefined, 204);
  created.delete(first.id);
  await request('Fetch deleted booking', 'GET', `/bookings/${first.id}`, undefined, 404);
  console.log(`Passed ${results.length} HTTP cases`);
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  for (const id of created) await fetch(`${base}/bookings/${id}`, { method: 'DELETE' });
  const evidence = `# HTTP Test Evidence\n\nExecuted: ${new Date().toISOString()} (UTC).\nBase URL: \`${base}\`.\nClient: Node.js fetch HTTP client.\nCommand: \`npm run test:http\`.\nOverall result: ${failure ? `FAIL: ${failure}` : 'PASS'}.\nUses 2036-10-20/21 with seeded equipment. Created test bookings are removed afterward.\n\nThe original Phase 2 evidence, including restart persistence, remains in Git commit e5fdb85.\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`;
  await writeEvidence(REMOTE ? 'remote-http' : 'http', REMOTE ? 'Deployed API HTTP cases' : 'HTTP regression cases', evidence);
}
