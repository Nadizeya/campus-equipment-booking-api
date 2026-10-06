import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Replace only this suite's report so other submission evidence remains intact.
export async function writeEvidence(section, title, report) {
  await mkdir('docs', { recursive: true });
  let document;
  try { document = await readFile('docs/TEST_EVIDENCE.md', 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    document = '# Test Evidence\n\nAPI base URL: `http://127.0.0.1:8787/api`.\n';
  }
  const begin = `<!-- BEGIN ${section} -->`;
  const end = `<!-- END ${section} -->`;
  const block = `${begin}\n## ${title}\n\n${report.replace(/^# .+\r?\n/, '')}\n${end}`;
  const start = document.indexOf(begin);
  if (start < 0) document += `\n\n${block}\n`;
  else {
    const finish = document.indexOf(end, start);
    if (finish < 0) throw new Error(`Incomplete evidence section: ${section}`);
    document = document.slice(0, start) + block + document.slice(finish + end.length);
  }
  await writeFile('docs/TEST_EVIDENCE.md', document);
}
