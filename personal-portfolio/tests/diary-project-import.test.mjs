import assert from 'node:assert/strict';
import { before, beforeEach, after, test } from 'node:test';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { parseProjectDrafts, parseMonthlyDraft, projectImportPlan, monthlyImportPlan, parseImportArguments, sqlQuote } from '../scripts/project-drafts.mjs';

let mf, db;
before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response(null, { status: 404 }); } };', compatibilityDate: '2026-09-24', d1Databases: ['DIARY_DB'], outboundService: () => { throw new Error('Import tests must not access the network.'); } }));
  db = await mf.getD1Database('DIARY_DB');
  for (const name of (await readdir('migrations')).filter(name => /^\d+.*\.sql$/.test(name)).sort()) {
    const sql = await readFile(`migrations/${name}`, 'utf8');
    for (const statement of sql.replace(/--[^\n]*/g, '').split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
});
after(async () => { await mf?.dispose(); });
beforeEach(async () => {
  await db.batch(['diary_project_entries', 'diary_projects', 'diary_entries'].map(table => db.prepare(`DELETE FROM ${table}`)));
});
const fixture = (slug, overrides = {}) => ({ slug, title: `Fictional ${slug}`, evidenceDate: '2026-10-17', overviewMarkdown: 'A fictional overview.', guideMarkdown: 'A fictional build guide.', ...overrides });
const parsed = entries => parseProjectDrafts(JSON.stringify(entries));
const context = overrides => ({ existingProjectSlugs: [], existingMonths: [], now: 1792238400000, ...overrides });
async function execute(plan) { if (plan.statements.length) await db.batch(plan.statements.map(statement => db.prepare(statement))); }
async function month(slug) { await db.prepare("INSERT INTO diary_entries (slug, month, title, updated_at) VALUES (?, ?, 'Fictional month', 1)").bind(slug, slug).run(); }

test('private project parser validates the JSON array and always forces draft, owner-only defaults', () => {
  const input = parsed([fixture('example', { status: 'published', guideVisibility: 'readers', sourceNotes: 'Fictional private note' })]);
  assert.equal(input.length, 1); assert.equal(input[0].status, 'draft'); assert.equal(input[0].guideVisibility, 'owner');
  assert.deepEqual(input[0].contributors, []); assert.deepEqual(input[0].aliases, []); assert.deepEqual(input[0].months, []); assert.deepEqual(input[0].relatedSlugs, []);
  assert.equal(input[0].summary, ''); assert.equal(input[0].area, ''); assert.equal(input[0].stage, '');
  assert.equal(input[0].sourceNotes, 'Fictional private note');
  assert.equal(input[0].evidenceDate, '2026-10-17');
});

test('parser rejects invalid fields, duplicate identities, invalid JSON, and preserves no input in diagnostics', () => {
  const secret = 'DO_NOT_ECHO_PRIVATE_TEXT';
  for (const input of ['{broken', '{}', JSON.stringify([null]), JSON.stringify([fixture('same'), fixture('same')]), JSON.stringify([fixture('BAD-SLUG')])]) assert.throws(() => parseProjectDrafts(input));
  for (const override of [
    { title: '' }, { title: secret.repeat(20) }, { summary: 'x'.repeat(601) }, { area: 'x'.repeat(81) }, { stage: 'x'.repeat(121) },
    { contributors: Array(16).fill('A') }, { contributors: ['x'.repeat(121)] }, { aliases: Array(21).fill('A') }, { aliases: [false] },
    { evidenceDate: '2026-02-29' }, { evidenceDate: '2026-13-01' }, { overviewMarkdown: 'x'.repeat(120001) }, { guideMarkdown: 'x'.repeat(120001) }, { sourceNotes: 'x'.repeat(16001) },
    { months: ['2026-13'] }, { months: ['2026-10', '2026-10'] }, { relatedSlugs: ['bad--slug'] }, { relatedSlugs: ['example'] }, { title: 'NUL\u0000text' },
  ]) {
    assert.throws(() => parsed([fixture('example', override)]), error => !error.message.includes(secret));
  }
  assert.equal(parsed([fixture('leap', { evidenceDate: '2024-02-29' })])[0].evidenceDate, '2024-02-29');
});

test('plans validate forward project relations, known existing projects, and actual available months', () => {
  const drafts = parsed([fixture('first', { relatedSlugs: ['second', 'existing'], months: ['2026-10'] }), fixture('second')]);
  const plan = projectImportPlan(drafts, context({ existingProjectSlugs: ['existing'], existingMonths: ['2026-10'] }));
  assert.equal(plan.inputCount, 2); assert.equal(plan.createdCount, 2); assert.equal(plan.skippedCount, 0); assert.ok(plan.statements.length > 0);
  assert.throws(() => projectImportPlan(drafts, context({ existingMonths: ['2026-10'] })), /related/i);
  assert.throws(() => projectImportPlan(drafts, context({ existingProjectSlugs: ['existing'] })), /month/i);
});

test('SQL string quoting round-trips apostrophes, multiline text, Unicode and hostile-looking SQL literally', async () => {
  assert.equal(sqlQuote("O'Brien"), "'O''Brien'");
  const value = "Apostrophe ' and semicolon;\n雪 — '); DROP TABLE diary_projects; --\nBEGIN TRANSACTION;\nCOMMIT;";
  await execute(projectImportPlan(parsed([fixture('quoted', { title: "O'Brien’s example", overviewMarkdown: value, guideMarkdown: value, sourceNotes: value })]), context()));
  const row = await db.prepare("SELECT * FROM diary_projects WHERE slug = 'quoted'").first();
  assert.equal(row.title, "O'Brien’s example"); assert.equal(row.overview_markdown, value); assert.equal(row.guide_markdown, value); assert.equal(row.source_notes, value);
  assert.equal(row.status, 'draft'); assert.equal(row.guide_visibility, 'owner'); assert.equal(row.published_at, null);
});

test('re-imports preserve every existing project field and junction even with stale existence metadata', async () => {
  await month('2026-10'); await month('2026-09');
  const first = projectImportPlan(parsed([fixture('existing', { months: ['2026-09'] })]), context({ existingMonths: ['2026-09'] })); await execute(first);
  await db.prepare("UPDATE diary_projects SET status = 'published', guide_visibility = 'readers', published_at = 1 WHERE slug = 'existing'").run();
  const original = await db.prepare("SELECT * FROM diary_projects WHERE slug = 'existing'").first();
  const later = parsed([fixture('existing', { title: 'Must not overwrite', relatedSlugs: ['new-project'], months: ['2026-10'] }), fixture('new-project', { relatedSlugs: ['existing'], months: ['2026-10'] })]);
  const freshPlan = projectImportPlan(later, context({ existingProjectSlugs: ['existing'], existingMonths: ['2026-09', '2026-10'] }));
  assert.equal(freshPlan.skippedCount, 1); assert.equal(freshPlan.createdCount, 1);
  // Deliberately stale metadata simulates another writer creating the project
  // between CLI preflight and the transaction. SQL must still preserve it.
  await execute(projectImportPlan(later, context({ existingMonths: ['2026-09', '2026-10'] })));
  assert.deepEqual(await db.prepare("SELECT * FROM diary_projects WHERE slug = 'existing'").first(), original);
  assert.deepEqual((await db.prepare("SELECT entry_slug FROM diary_project_entries WHERE project_slug = 'existing'").all()).results, [{ entry_slug: '2026-09' }]);
  assert.deepEqual((await db.prepare("SELECT entry_slug FROM diary_project_entries WHERE project_slug = 'new-project'").all()).results, [{ entry_slug: '2026-10' }]);
});

test('a failing import rolls back every new project and junction in the shared D1 batch plan', async () => {
  await month('2026-10');
  const drafts = parsed([fixture('first', { months: ['2026-10'] }), fixture('second', { months: ['2026-09'] })]);
  const plan = projectImportPlan(drafts, context({ existingMonths: ['2026-10', '2026-09'] }));
  await assert.rejects(execute(plan));
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_projects').first()).n, 0);
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_project_entries').first()).n, 0);
});

test('local seed plans create the private monthly draft before related project drafts and never overwrite it', async () => {
  const draft = parseMonthlyDraft(JSON.stringify({ month: '2026-10', title: 'Fictional diary', summary: 'Fictional summary', markdown: 'Fictional notes.', status: 'published', publicTeaser: true, teaser: 'Must not publish' }));
  assert.equal(draft.status, 'draft'); assert.equal(draft.publicTeaser, false);
  const monthly = monthlyImportPlan(draft, context());
  const projects = projectImportPlan(parsed([fixture('linked', { months: ['2026-10'] })]), context({ existingMonths: ['2026-10'] }));
  await execute({ statements: [...monthly.statements, ...projects.statements] });
  const row = await db.prepare("SELECT * FROM diary_entries WHERE slug = '2026-10'").first(); assert.equal(row.status, 'draft'); assert.equal(row.public_teaser, 0); assert.equal(row.teaser, '');
  assert.deepEqual((await db.prepare('SELECT project_slug, entry_slug FROM diary_project_entries').all()).results, [{ project_slug: 'linked', entry_slug: '2026-10' }]);
  await execute(monthlyImportPlan({ ...draft, title: 'Must not replace' }, context()));
  assert.deepEqual(await db.prepare("SELECT * FROM diary_entries WHERE slug = '2026-10'").first(), row);
});

test('import CLI arguments require exactly one explicit destination and one private JSON file', () => {
  assert.deepEqual(parseImportArguments(['private.json', '--local']), { file: 'private.json', target: '--local' });
  assert.deepEqual(parseImportArguments(['--remote', '/tmp/private.json']), { file: '/tmp/private.json', target: '--remote' });
  for (const args of [[], ['private.json'], ['private.json', '--local', '--remote'], ['--remote'], ['--local', '--local', 'private.json'], ['--local', 'one.json', 'two.json'], ['private.json', '--delete']]) assert.throws(() => parseImportArguments(args));
});


test('the explicit local CLI round-trips private SQL through Wrangler without printing content or overwriting', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'diary-import-cli-test-'));
  const root = process.cwd();
  try {
    await mkdir(join(directory, 'scripts'));
    await mkdir(join(directory, 'shared'));
    await copyFile(join(root, 'shared', 'mental-model.mjs'), join(directory, 'shared', 'mental-model.mjs'));
    await symlink(resolve(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
    await Promise.all(['project-drafts.mjs', 'import-projects.mjs', 'wrangler-result.mjs'].map(name => copyFile(join(root, 'scripts', name), join(directory, 'scripts', name))));
    await writeFile(join(directory, 'wrangler.jsonc'), JSON.stringify({ name: 'private-import-test', compatibility_date: '2026-09-24', d1_databases: [{ binding: 'DIARY_DB', database_name: 'private-import-test', database_id: '00000000-0000-0000-0000-000000000001' }] }));
    const environment = { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG: 'log', WRANGLER_LOG_PATH: join(directory, 'wrangler.log') };
    const run = args => spawnSync(process.execPath, args, { cwd: directory, env: environment, encoding: 'utf8', maxBuffer: 1024 * 1024 });
    const wrangler = args => run(['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'DIARY_DB', '--local', '--yes', '--json', ...args]);
    const migrations = await Promise.all(['0001_diary.sql', '0002_projects.sql', '0003_mental_models.sql'].map(name => readFile(join(root, 'migrations', name), 'utf8')));
    await writeFile(join(directory, 'migrations.sql'), migrations.join('\n'));
    const setup = wrangler(['--file', 'migrations.sql']); assert.equal(setup.status, 0, setup.stderr);
    const privateText = "PRIVATE TEST CONTENT: O'Brien;\nBEGIN TRANSACTION;\nCOMMIT;";
    await writeFile(join(directory, 'projects.json'), JSON.stringify([fixture('first', { overviewMarkdown: privateText, mentalModel: mentalModel(privateText), relatedSlugs: ['second'] }), fixture('second')]));
    const imported = run(['scripts/import-projects.mjs', 'projects.json', '--local']);
    assert.equal(imported.status, 0, imported.stderr);
    assert.ok(!`${imported.stdout}${imported.stderr}`.includes(privateText));
    const rows = JSON.parse(wrangler(['--command', "SELECT overview_markdown, mental_model, status, guide_visibility FROM diary_projects WHERE slug = 'first'"]).stdout)[0].results;
    assert.deepEqual(rows, [{ overview_markdown: privateText, mental_model: JSON.stringify(mentalModel(privateText)), status: 'draft', guide_visibility: 'owner' }]);
    const repeated = run(['scripts/import-projects.mjs', '--local', 'projects.json']); assert.equal(repeated.status, 0, repeated.stderr); assert.match(repeated.stdout, /preserved 2 existing projects/);
    const count = JSON.parse(wrangler(['--command', 'SELECT count(*) AS n FROM diary_projects']).stdout)[0].results[0].n; assert.equal(count, 2);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

const mentalModel = (caption = 'Fictional model') => ({ kind: 'documented', caption,
  stages: ['Input', 'Process', 'Output'].map(label => ({ label, nodes: [{ title: 'Component', detail: 'Fictional detail.', state: 'documented' }] })),
});

test('private imports validate mental models, canonicalize allowed fields, and retain legacy null defaults', async () => {
  const model = mentalModel();
  const canonical = parsed([fixture('model', { mentalModel: { ...model, caption: ' Fictional model ', ignored: 'discard' } })]);
  assert.deepEqual(canonical[0].mentalModel, model);
  assert.equal(parsed([fixture('legacy')])[0].mentalModel, null);
  assert.equal(parsed([fixture('explicit-null', { mentalModel: null })])[0].mentalModel, null);
  for (const value of [{}, [], { ...model, kind: 'unknown' }, { ...model, caption: 'PRIVATE'.repeat(100) }, { ...model, stages: [] }]) {
    assert.throws(() => parsed([fixture('invalid', { mentalModel: value })]), error => !error.message.includes('PRIVATE'));
  }
  await execute(projectImportPlan([...canonical, ...parsed([fixture('legacy')])], context()));
  assert.deepEqual(JSON.parse((await db.prepare("SELECT mental_model FROM diary_projects WHERE slug = 'model'").first()).mental_model), model);
  assert.equal((await db.prepare("SELECT mental_model FROM diary_projects WHERE slug = 'legacy'").first()).mental_model, null);
});

test('mental model imports preserve an existing model through fresh or stale metadata', async () => {
  const original = mentalModel("O'Brien’s fictional model; BEGIN TRANSACTION;"), replacement = mentalModel('Replacement');
  await execute(projectImportPlan([fixture('existing-model', { mentalModel: original })], context()));
  for (const existingProjectSlugs of [[], ['existing-model']]) {
    await execute(projectImportPlan([fixture('existing-model', { mentalModel: replacement })], context({ existingProjectSlugs })));
    assert.deepEqual(JSON.parse((await db.prepare("SELECT mental_model FROM diary_projects WHERE slug = 'existing-model'").first()).mental_model), original);
  }
});
