import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { writeEvidence } from './evidence.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

await mkdir('.wrangler', { recursive: true });
await build({ entryPoints: ['src/index.ts'], outfile: '.wrangler/error-test-app.mjs', bundle: true, platform: 'node', format: 'esm' });
const { default: app } = await import(pathToFileURL(resolve('.wrangler/error-test-app.mjs')));
const results = [];
for (const [name, error, expected] of [
  ['Unexpected database failure is sanitized', new Error('secret SQL detail: SELECT internal'), 500],
  ['Trigger marker in nested cause becomes conflict', new Error('D1 failure', { cause: new Error('BOOKING_TIME_CONFLICT') }), 409],
  ['Unrelated constraint failure is not a booking conflict', new Error('FOREIGN KEY constraint failed'), 500]
]) {
  const db = { prepare() { throw error; } };
  const response = await app.request('http://test/api/equipment', {}, { DB: db });
  const body = await response.json();
  assert.equal(response.status, expected);
  assert.deepEqual(body, { error: expected === 500 ? 'Internal server error' : 'Equipment is already booked during this time' });
  assert.match(response.headers.get('content-type'), /application\/json/);
  results.push({ name, status: response.status, body, result: 'PASS' });
}
await writeEvidence('errors', 'Error handler cases', `# Error Handler Evidence\n\nExecuted: ${new Date().toISOString()} UTC.\nCommand: npm run test:errors.\nMethod: invoke the real Hono application with an injected failing D1 binding; no production test route or database mutation. Expected failures are logged to the terminal by the server error handler. This verifies error mapping, not live database availability.\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`);
console.log(`Passed ${results.length} error-handler cases`);
