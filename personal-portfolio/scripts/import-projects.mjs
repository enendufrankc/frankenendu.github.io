/** Explicit-destination import of new private drafts. Never updates existing rows. */
import { readFile, mkdtemp, stat, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DraftValidationError, MAX_PRIVATE_JSON_BYTES, parseImportArguments, parseProjectDrafts, projectImportPlan } from './project-drafts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function main() {
  if (process.argv.slice(2).join(' ') === '--help') {
    console.log('Usage: node scripts/import-projects.mjs /path/to/private-projects.json --local|--remote');
    console.log('Apply all diary migrations first. New projects import as drafts with owner-only guides; existing projects and links are preserved.');
    return;
  }
  const { file, target } = parseImportArguments(process.argv.slice(2));
  const sourcePath = resolve(file);
  if ((await stat(sourcePath)).size > MAX_PRIVATE_JSON_BYTES) throw new DraftValidationError('Private JSON exceeds the 32 MiB import limit.');
  const drafts = parseProjectDrafts(await readFile(sourcePath, 'utf8'));
  const directory = await mkdtemp(join(tmpdir(), 'private-project-import-'));
  try {
    const wrangler = args => {
      const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'DIARY_DB', target, ...args, '--yes', '--json'], {
        cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG: 'log', WRANGLER_LOG_PATH: join(directory, 'wrangler.log') },
      });
      // Both captured output and Wrangler's logs may contain SQL on failure.
      // Keep them private and erase the temporary directory on every exit path.
      if (result.status !== 0) throw new DraftValidationError('Project import failed. Check credentials, migrations, and database availability. No existing project or links are overwritten.');
      try { return JSON.parse(result.stdout); } catch { throw new DraftValidationError('The database returned an unreadable import result.'); }
    };
    const metadata = wrangler(['--command', "SELECT 'project' AS kind, slug FROM diary_projects UNION ALL SELECT 'month' AS kind, slug FROM diary_entries"]);
    if (!Array.isArray(metadata) || metadata.some(result => result.success !== true || !Array.isArray(result.results))) throw new DraftValidationError('Cannot inspect project and monthly-entry identifiers. Apply the diary migrations first.');
    const records = metadata.flatMap(result => result.results);
    const plan = projectImportPlan(drafts, {
      existingProjectSlugs: records.filter(record => record.kind === 'project').map(record => record.slug),
      existingMonths: records.filter(record => record.kind === 'month').map(record => record.slug),
    });
    if (plan.statements.length) {
      const sqlPath = join(directory, 'projects.sql');
      await writeFile(sqlPath, plan.sql, { mode: 0o600 });
      // Wrangler 4 executes a local file as a D1 batch. Its remote file-import
      // API restores the prior database state if any statement fails.
      const result = wrangler(['--file', sqlPath]);
      if (!Array.isArray(result) || result.some(item => item.success !== true)) throw new DraftValidationError('Project import did not complete successfully.');
    }
    console.log(`Processed ${plan.inputCount} project drafts for ${target.slice(2)}; preserved ${plan.skippedCount} existing projects. New projects have owner-only guides.`);
  } finally { await rm(directory, { recursive: true, force: true }); }
}
try { await main(); }
catch (error) {
  console.error(error instanceof DraftValidationError ? error.message : 'Private project import failed. Check the input file and database configuration.');
  process.exitCode = 1;
}
