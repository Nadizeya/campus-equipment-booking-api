import { execFileSync } from 'node:child_process';
import { writeEvidence } from './evidence.mjs';
import assert from 'node:assert/strict';

const results = [];
const persist = `.wrangler/review-db-${Date.now()}`;
const run = args => execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args], { encoding: 'utf8', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
run(['d1', 'migrations', 'apply', 'campus-booking', '--local', '--persist-to', persist]);
run(['d1', 'execute', 'campus-booking', '--local', '--persist-to', persist, '--file', 'seeds/equipment.sql']);
for (const [name, equipment, start, end, expected] of [
  ['Foreign key rejects unknown equipment', 'missing', '1000', '2000', 'FOREIGN KEY'],
  ['Chronology constraint rejects reversed interval', 'eq-1', '2000', '1000', 'CHECK constraint'],
  ['Integer constraint rejects text timestamp', 'eq-1', "'not-a-time'", '2000', 'CHECK constraint']
]) {
  // All values are fixed test fixtures, never HTTP input.
  const sql = `INSERT INTO bookings VALUES ('review-id', '${equipment}', 'Review', ${start}, ${end}, 'Constraint check')`;
  let output = '';
  try { run(['d1', 'execute', 'campus-booking', '--local', '--persist-to', persist, '--command', sql]); }
  catch (error) { output = String(error.stdout) + String(error.stderr); }
  assert.ok(output.includes(expected), `${name}: expected rejection missing`);
  results.push({ name, sql, expectedError: expected, actualOutput: output, result: 'PASS' });
}
const countOutput = run(['d1', 'execute', 'campus-booking', '--local', '--persist-to', persist, '--command', 'SELECT COUNT(*) AS count FROM bookings', '--json']);
assert.equal(JSON.parse(countOutput)[0].results[0].count, 0);
await writeEvidence('database', 'Database constraint cases', `# Database Constraint Evidence\n\nExecuted: ${new Date().toISOString()} UTC.\nCommand: npm run test:db.\nIsolated local D1 directory: ${persist}.\nApplication database was not modified. All three invalid inserts were rejected; final booking count was zero.\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`);
console.log('Passed 3 database constraint cases; invalid writes left zero bookings');
