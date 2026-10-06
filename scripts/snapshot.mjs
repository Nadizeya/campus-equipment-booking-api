import { mkdir, cp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const timestamp = new Date().toISOString();
const target = resolve('snapshots', `phase-2-${timestamp.replaceAll(':', '-')}`);
await mkdir(target, { recursive: true });
for (const item of ['src', 'migrations', 'seeds', 'scripts', 'docs', 'package.json', 'package-lock.json', 'wrangler.jsonc', 'tsconfig.json', '.gitignore']) {
  await cp(item, resolve(target, item), { recursive: true });
}
await writeFile(resolve(target, 'SNAPSHOT.txt'), `Phase 2 first-version snapshot\nCreated: ${timestamp}\nThis is the actual capture time, not a claim of exam minute 30.\nDependencies and local database are excluded. Restore with npm ci and npm run db:setup.\n`);
console.log(target);
