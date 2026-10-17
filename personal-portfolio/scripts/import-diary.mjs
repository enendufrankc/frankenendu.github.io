/** Import a new private draft, never overwrite or publish an existing entry. */
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const remote = args.includes('--remote');
const files = args.filter(arg => arg !== '--remote');
if (files.length !== 1 || files[0].startsWith('--')) {
  console.error('Usage: node scripts/import-diary.mjs /absolute/path/to/private-draft.json [--remote]');
  process.exit(1);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = JSON.parse(await readFile(resolve(files[0]), 'utf8'));
if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(entry.month) || (entry.slug && entry.slug !== entry.month)) throw new Error('Use matching YYYY-MM month and slug.');
for (const [key, max] of [['title', 160], ['summary', 600], ['markdown', 120000]]) {
  if (typeof entry[key] !== 'string' || !entry[key].trim() || entry[key].length > max) throw new Error(`Invalid ${key}.`);
}
const tags = entry.tags ?? [];
if (!Array.isArray(tags) || tags.length > 10 || tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 40)) throw new Error('Use up to ten short topic tags.');
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const sql = `INSERT INTO diary_entries (slug, month, title, summary, tags, markdown, status, public_teaser, teaser, updated_at) VALUES (${[entry.month, entry.month, entry.title, entry.summary, JSON.stringify(tags), entry.markdown, 'draft'].map(quote).join(', ')}, 0, '', ${Date.now()});`;
const directory = await mkdtemp(join(tmpdir(), 'private-diary-import-'));
try {
  const file = join(directory, 'draft.sql');
  await writeFile(file, sql, { mode: 0o600 });
  const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'DIARY_DB', remote ? '--remote' : '--local', '--file', file, '--yes'], { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  // Wrangler may echo SQL on failure: keep its output out of terminal logs.
  if (result.status !== 0) throw new Error('Draft import failed. Check the database migration and whether this month already exists. Existing entries are never overwritten.');
  console.log(`Imported ${entry.month} as a private draft into the ${remote ? 'remote' : 'local'} database.`);
} finally { await rm(directory, { recursive: true, force: true }); }
