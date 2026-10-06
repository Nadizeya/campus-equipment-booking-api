import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { writeEvidence } from './evidence.mjs';

import { BASE_URL, REMOTE } from './config.mjs';
const base = BASE_URL;
const stamp = new Date().toISOString().replaceAll(':', '-');
const temporary = `.wrangler/curl-${stamp}`;
await mkdir(temporary, { recursive: true });
const results = [];
let bookingId;
let failure;
async function request(name, method, path, expected, body) {
  const args = ['-sS', '-i', '-X', method, base + path];
  if (body !== undefined) {
    const file = `${temporary}/payload-${results.length + 1}.json`;
    await writeFile(file, JSON.stringify(body));
    args.push('-H', 'Content-Type: application/json', '--data-binary', `@${file}`);
  }
  const raw = execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', args, { encoding: 'utf8' });
  const status = Number(/^HTTP\/\S+ (\d+)/.exec(raw)?.[1]);
  const text = raw.split(/\r?\n\r?\n/).slice(1).join('\n\n').trim();
  const data = text ? JSON.parse(text) : null;
  results.push({ name, method, url: base + path, payload: body, expected, actual: status, raw });
  if (method === 'POST' && status === 201) bookingId = data.id;
  assert.equal(status, expected, `${name}: ${raw}`);
  if (expected === 204) assert.equal(text, '');
  else assert.match(raw, /content-type: application\/json/i);
  if (expected >= 400) assert.equal(typeof data.error, 'string');
  return data;
}

const payload = {
  equipmentId: 'eq-1', borrowerName: 'Somchai Jaidee',
  startAt: '2026-10-20T09:00:00.000Z', endAt: '2026-10-20T11:00:00.000Z', purpose: 'Class presentation'
};
try {
  assert.ok((await request('1. List equipment', 'GET', '/equipment', 200)).length >= 2);
  await request('2. List bookings', 'GET', '/bookings', 200);
  const first = await request('3. Create booking', 'POST', '/bookings', 201, payload);
  assert.deepEqual(first, { id: bookingId, ...payload });
  assert.deepEqual(await request('4. Get one booking', 'GET', `/bookings/${bookingId}`, 200), first);
  const update = { ...payload, startAt: '2026-10-20T12:00:00.000Z', endAt: '2026-10-20T14:00:00.000Z', purpose: 'Updated class presentation' };
  assert.deepEqual(await request('5. Full update', 'PATCH', `/bookings/${bookingId}`, 200, update), { id: bookingId, ...update });
  await request('6. Invalid time range', 'POST', '/bookings', 400, { ...payload, startAt: '2026-10-21T11:00:00.000Z', endAt: '2026-10-21T09:00:00.000Z', purpose: 'Invalid time range test' });
  await request('7. Overlap after update', 'POST', '/bookings', 409, { ...payload, borrowerName: 'Suda Dee', startAt: '2026-10-20T12:30:00.000Z', endAt: '2026-10-20T13:30:00.000Z', purpose: 'Conflict test' });
  await request('8. Missing booking', 'GET', '/bookings/not-found', 404);
  await request('9. Delete booking', 'DELETE', `/bookings/${bookingId}`, 204);
  bookingId = undefined;
  console.log('Passed all 9 professor-guide cURL cases');
} catch (error) {
  failure = error.message;
  throw error;
} finally {
  if (bookingId) execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', ['-sS', '-X', 'DELETE', `${base}/bookings/${bookingId}`]);
  const report = `# Professor Guide cURL Evidence\n\nExecuted: ${new Date().toISOString()} UTC.\nBase URL: ${base}.\nCommand: npm run test:curl (shared local URL in scripts/config.mjs).\nOverall result: ${failure ? `FAIL: ${failure}` : 'PASS'}.\nUses the professor guide payloads and order. Windows curl.exe receives JSON via files to avoid shell quoting differences. Expected codes and raw HTTP headers/bodies are recorded below. Run against a clean database or leave eq-1 on 2026-10-20 free; test booking is cleaned up afterward.\n\n${results.map(r => `## ${r.name}\n\n${r.method} ${r.url}\nExpected: ${r.expected}; actual: ${r.actual}.\n${r.payload ? `\nRequest payload:\n\n\`\`\`json\n${JSON.stringify(r.payload, null, 2)}\n\`\`\`\n` : ''}\nRaw response:\n\n\`\`\`http\n${r.raw}\n\`\`\`\n`).join('\n')}`;
  await writeEvidence(REMOTE ? 'remote-curl' : 'curl', REMOTE ? 'Deployed API cURL cases' : 'Professor guide cURL cases', report);
}
