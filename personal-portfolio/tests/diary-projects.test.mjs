import assert from 'node:assert/strict';
import { before, beforeEach, after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const origin = 'https://diary.example';
let mf, db, mail = [], nextIp = 1;
before(async () => {
  const bundle = await build({ entryPoints: ['worker/index.ts'], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022', conditions: ['workerd', 'worker', 'browser'], tsconfigRaw: {} });
  mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text, compatibilityDate: '2026-09-24',
    d1Databases: ['DIARY_DB'], r2Buckets: ['DIARY_FILES'],
    bindings: { DIARY_ORIGIN: origin, DIARY_OWNER_EMAIL: 'owner@example.com', DIARY_FROM_EMAIL: 'Diary <diary@example.com>', RESEND_API_KEY: 'fake-mail-key' },
    serviceBindings: { ASSETS: request => new Response(`shell:${new URL(request.url).pathname}`, { headers: { 'Content-Type': 'text/html' } }) },
    outboundService: async request => {
      assert.equal(request.url, 'https://api.resend.com/emails', 'Unexpected outgoing request');
      mail.push(await request.json()); return Response.json({ id: 'mock-message' });
    },
  }));
  db = await mf.getD1Database('DIARY_DB');
  for (const name of ['0001_diary.sql', '0002_projects.sql']) {
    const migration = await readFile(`migrations/${name}`, 'utf8');
    for (const statement of migration.replace(/--[^\n]*/g, '').split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
});
after(async () => { await mf?.dispose(); });
beforeEach(async () => {
  const { results } = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'diary_%' ORDER BY CASE WHEN name = 'diary_project_entries' THEN 0 WHEN name = 'diary_attachments' THEN 1 ELSE 2 END, name").all();
  for (const { name } of results) await db.prepare(`DELETE FROM ${name}`).run();
  mail = [];
});
function browser() {
  const cookies = new Map(), ip = `192.0.2.${nextIp++}`;
  return { async request(path, { method = 'GET', json, crossOrigin } = {}) {
    const headers = new Headers({ 'CF-Connecting-IP': ip });
    if (cookies.size) headers.set('Cookie', [...cookies].map(([name, value]) => `${name}=${value}`).join('; '));
    if (!['GET', 'HEAD'].includes(method)) headers.set('Origin', crossOrigin ?? origin);
    if (json !== undefined) headers.set('Content-Type', 'application/json');
    const response = await mf.dispatchFetch(`${origin}${path}`, { method, headers, body: json === undefined ? undefined : JSON.stringify(json) });
    for (const cookie of response.headers.getSetCookie()) {
      const [name, value] = cookie.split(';')[0].split('=');
      if (value) cookies.set(name, value); else cookies.delete(name);
    }
    return response;
  } };
}
async function login(client, email = 'owner@example.com') {
  const previousMail = mail.length;
  const response = await client.request('/api/diary/auth/request', { method: 'POST', json: { email } });
  assert.equal(response.status, 202); const { challengeId } = await response.json();
  const deadline = Date.now() + 1500;
  let code;
  while (!code && Date.now() < deadline) {
    code = mail.slice(previousMail).find(message => message.to.includes(email) && /\b\d{8}\b/.test(message.text))?.text.match(/\b\d{8}\b/)[0];
    if (!code) await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.ok(code, 'Expected mocked sign-in email');
  const verified = await client.request('/api/diary/auth/verify', { method: 'POST', json: { email, challengeId, code } });
  assert.equal(verified.status, 200, await verified.clone().text());
}
async function participants() {
  const owner = browser(), reader = browser(); await login(owner);
  const invited = await owner.request('/api/diary/admin/invitations', { method: 'POST', json: { email: 'reader@example.com', name: 'Example reader' } });
  assert.equal(invited.status, 201); const { invitation } = await invited.json();
  await login(reader, invitation.email);
  return { owner, reader, invitation };
}
const projectInput = (slug, overrides = {}) => ({
  slug, title: `Example ${slug}`, summary: 'A fictional project for integration testing.', area: 'Example area', stage: 'Prototype',
  contributors: ['Example contributor'], aliases: ['Example alias'], evidenceDate: '2026-10-17',
  overviewMarkdown: '# Core idea\n\nA short fictional overview.', guideMarkdown: '# Build guide\n\nStart with an example.', sourceNotes: 'OWNER ONLY EVIDENCE',
  relatedSlugs: [], months: [], ...overrides,
});
async function createProject(owner, slug, overrides) {
  const response = await owner.request('/api/diary/admin/projects', { method: 'POST', json: projectInput(slug, overrides) });
  assert.equal(response.status, 201, await response.clone().text()); return (await response.json()).project;
}
async function createMonth(owner, month, status = 'published') {
  const response = await owner.request('/api/diary/admin/entries', { method: 'POST', json: { slug: month, month, title: `Fictional ${month}`, summary: 'Fictional month', markdown: 'A short entry.', status } });
  assert.equal(response.status, 201, await response.clone().text());
}
function privateHeaders(response) {
  assert.match(response.headers.get('Cache-Control'), /private.*no-store/); assert.match(response.headers.get('Vary'), /Cookie/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow'); assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
}

test('project routes use private generic shells and enforce server-side authentication', async () => {
  const anonymous = browser();
  for (const [path, shell] of [
    ['/diary/projects/', '/diary/projects/'], ['/diary/project/', '/diary/project/'],
    ['/diary/projects/example-project/', '/diary/project/'], ['/diary/admin/projects/', '/diary/admin/projects/'],
  ]) {
    const response = await anonymous.request(path); assert.equal(response.status, 200); privateHeaders(response); assert.equal(await response.text(), `shell:${shell}`);
    assert.equal((await anonymous.request(path, { method: 'POST', json: {} })).status, 404);
    const head = await anonymous.request(path, { method: 'HEAD' }); assert.equal(head.status, 200); privateHeaders(head);
  }
  assert.equal((await anonymous.request('/diary/projects/INVALID/')).status, 404);
  assert.equal((await anonymous.request('/diary/projects/example/extra/')).status, 404);
  for (const path of ['/api/diary/projects', '/api/diary/projects/example', '/api/diary/admin/projects']) {
    const response = await anonymous.request(path); assert.equal(response.status, 401); privateHeaders(response);
  }
  const { reader } = await participants();
  assert.equal((await reader.request('/api/diary/admin/projects')).status, 403);
  assert.equal((await reader.request('/api/diary/admin/projects', { method: 'POST', json: projectInput('forbidden') })).status, 403);
  assert.equal((await reader.request('/api/diary/admin/projects/forbidden', { method: 'PUT', json: { title: 'Forbidden' } })).status, 403);
});

test('projects default to drafts with owner-only guides and expose editable records only to owner', async () => {
  const { owner, reader } = await participants(); const saved = await createProject(owner, 'example-project');
  assert.equal(saved.status, 'draft'); assert.equal(saved.guideVisibility, 'owner');
  assert.equal(saved.evidenceDate, '2026-10-17'); assert.deepEqual(saved.months, []); assert.deepEqual(saved.relatedSlugs, []);
  assert.equal(saved.sourceNotes, 'OWNER ONLY EVIDENCE'); assert.ok(saved.overviewMarkdown); assert.ok(saved.guideMarkdown);
  const list = await owner.request('/api/diary/projects'); assert.equal(list.status, 200); privateHeaders(list);
  const { projects } = await list.json(); assert.equal(projects.length, 1); assert.equal(projects[0].status, 'draft'); assert.equal(projects[0].guideVisibility, 'owner');
  assert.ok(!('sourceNotes' in projects[0])); assert.ok(!('guideMarkdown' in projects[0]));
  assert.deepEqual(await (await reader.request('/api/diary/projects')).json(), { projects: [] });
  assert.equal((await reader.request('/api/diary/projects/example-project')).status, 404);
  const admin = await (await owner.request('/api/diary/admin/projects')).json(); assert.equal(admin.projects[0].sourceNotes, saved.sourceNotes);
  const detail = await (await owner.request('/api/diary/projects/example-project')).json(); assert.equal(detail.project.guideAvailable, true); assert.ok(detail.project.guideHtml.includes('Build guide'));
});

test('hidden guides and source notes never enter reader bodies or reading estimates', async () => {
  const { owner, reader } = await participants();
  await createProject(owner, 'restricted-guide', { status: 'published', overviewMarkdown: 'Brief overview.', guideMarkdown: `OWNER GUIDE SECRET ${'word '.repeat(4000)}` });
  const readerList = await (await reader.request('/api/diary/projects')).json();
  assert.equal(readerList.projects[0].readingMinutes, 1); assert.ok(!('status' in readerList.projects[0])); assert.ok(!('guideVisibility' in readerList.projects[0]));
  const response = await reader.request('/api/diary/projects/restricted-guide'); privateHeaders(response);
  const raw = await response.text(), { project } = JSON.parse(raw);
  assert.equal(project.guideAvailable, false); assert.ok(!('guideHtml' in project)); assert.ok(!('sourceNotes' in project));
  assert.ok(!raw.includes('OWNER GUIDE SECRET')); assert.ok(!raw.includes('OWNER ONLY EVIDENCE')); assert.equal(project.readingMinutes, 1);
  const ownerDetail = await (await owner.request('/api/diary/projects/restricted-guide')).json();
  assert.ok(ownerDetail.project.guideHtml.includes('OWNER GUIDE SECRET')); assert.ok(ownerDetail.project.readingMinutes > 1); assert.equal(ownerDetail.project.sourceNotes, 'OWNER ONLY EVIDENCE');
  const updated = await owner.request('/api/diary/admin/projects/restricted-guide', { method: 'PUT', json: { guideVisibility: 'readers' } }); assert.equal(updated.status, 200);
  const shared = await (await reader.request('/api/diary/projects/restricted-guide')).json(); assert.equal(shared.project.guideAvailable, true); assert.ok(shared.project.guideHtml.includes('OWNER GUIDE SECRET')); assert.ok(shared.project.readingMinutes > 1); assert.ok(!('sourceNotes' in shared.project));
});

test('project relations filter draft projects and draft months and add filtered backlinks to entries', async () => {
  const { owner, reader } = await participants();
  await createMonth(owner, '2026-10'); await createMonth(owner, '2026-09', 'draft');
  await createProject(owner, 'related-public', { status: 'published' }); await createProject(owner, 'related-draft');
  await createProject(owner, 'main-project', { status: 'published', relatedSlugs: ['related-public', 'related-draft'], months: ['2026-09', '2026-10'] });
  await createProject(owner, 'draft-project', { months: ['2026-10'] });
  const readers = await (await reader.request('/api/diary/projects/main-project')).json();
  assert.deepEqual(readers.project.relatedProjects.map(project => project.slug), ['related-public']);
  assert.deepEqual(readers.project.entries.map(entry => entry.slug), ['2026-10']); assert.ok(readers.project.entries[0].publishedAt);
  const owners = await (await owner.request('/api/diary/projects/main-project')).json();
  assert.equal(owners.project.relatedProjects.length, 2); assert.equal(owners.project.entries.length, 2);
  const readerMonth = await (await reader.request('/api/diary/entries/2026-10')).json(); assert.deepEqual(readerMonth.entry.projects.map(project => project.slug), ['main-project']);
  const ownerMonth = await (await owner.request('/api/diary/entries/2026-10')).json(); assert.deepEqual(ownerMonth.entry.projects.map(project => project.slug).sort(), ['draft-project', 'main-project']);
  const changed = await owner.request('/api/diary/admin/projects/main-project', { method: 'PUT', json: { months: ['2026-09'] } }); assert.equal(changed.status, 200);
  assert.deepEqual((await (await reader.request('/api/diary/entries/2026-10')).json()).entry.projects, []);
});

test('invalid relations and immutable slug changes leave project and junction records unchanged', async () => {
  const { owner } = await participants(); await createMonth(owner, '2026-10'); await createProject(owner, 'related');
  await createProject(owner, 'stable', { months: ['2026-10'], relatedSlugs: ['related'] });
  const original = await db.prepare('SELECT * FROM diary_projects WHERE slug = ?').bind('stable').first();
  for (const change of [
    { months: ['2026-08'] }, { relatedSlugs: ['missing-project'] }, { relatedSlugs: ['stable'] },
    { months: ['2026-10', '2026-10'] }, { relatedSlugs: ['related', 'related'] }, { slug: 'renamed' },
  ]) {
    const response = await owner.request('/api/diary/admin/projects/stable', { method: 'PUT', json: { title: 'Should not persist', ...change } });
    assert.equal(response.status, 400, await response.clone().text());
    assert.deepEqual(await db.prepare('SELECT * FROM diary_projects WHERE slug = ?').bind('stable').first(), original);
    assert.deepEqual((await db.prepare('SELECT entry_slug FROM diary_project_entries WHERE project_slug = ?').bind('stable').all()).results, [{ entry_slug: '2026-10' }]);
  }
  const badCreate = await owner.request('/api/diary/admin/projects', { method: 'POST', json: projectInput('bad-create', { months: ['2026-08'] }) });
  assert.equal(badCreate.status, 400); assert.equal(await db.prepare("SELECT * FROM diary_projects WHERE slug = 'bad-create'").first(), null);
});

test('project validation enforces text/array limits, valid dates and strict identifiers', async () => {
  const { owner } = await participants();
  const invalidFields = [
    { slug: 'Bad-Slug' }, { slug: '-bad' }, { slug: 'bad--slug' }, { slug: 'x'.repeat(81) },
    { title: 'x'.repeat(161) }, { summary: 'x'.repeat(601) }, { area: 'x'.repeat(81) }, { stage: 'x'.repeat(121) },
    { contributors: Array(16).fill('A') }, { contributors: ['x'.repeat(121)] }, { aliases: Array(21).fill('A') }, { aliases: [false] },
    { overviewMarkdown: 'x'.repeat(120001) }, { guideMarkdown: 'x'.repeat(120001) }, { sourceNotes: 'x'.repeat(16001) },
    { relatedSlugs: Array(81).fill('one') }, { months: Array(121).fill('2026-10') }, { months: ['2026-13'] },
    { evidenceDate: '2026-02-29' }, { evidenceDate: '2026-02-30' }, { evidenceDate: '2026-1-01' }, { evidenceDate: 'not-a-date' },
    { status: 'public' }, { guideVisibility: 'everyone' },
  ];
  for (const fields of invalidFields) {
    const response = await owner.request('/api/diary/admin/projects', { method: 'POST', json: projectInput('validation', fields) });
    assert.equal(response.status, 400, `Expected invalid ${Object.keys(fields).join(',')}: ${await response.text()}`);
  }
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_projects').first()).n, 0);
  const valid = await createProject(owner, 'valid-leap-date', { evidenceDate: '2024-02-29', contributors: [], aliases: [] }); assert.equal(valid.evidenceDate, '2024-02-29');
});

test('a failed junction write rolls back project changes and previously linked months', async () => {
  const { owner } = await participants(); await createMonth(owner, '2026-10'); await createMonth(owner, '2026-09');
  await createProject(owner, 'atomic-project', { months: ['2026-10'] });
  const original = await db.prepare("SELECT * FROM diary_projects WHERE slug = 'atomic-project'").first();
  await db.prepare("CREATE TRIGGER project_test_reject BEFORE INSERT ON diary_project_entries WHEN NEW.entry_slug = '2026-09' BEGIN SELECT RAISE(ABORT, 'Test junction write failure'); END").run();
  try {
    const response = await owner.request('/api/diary/admin/projects/atomic-project', { method: 'PUT', json: { title: 'Must roll back', months: ['2026-09'] } });
    assert.equal(response.status, 503);
    assert.deepEqual(await db.prepare("SELECT * FROM diary_projects WHERE slug = 'atomic-project'").first(), original);
    assert.deepEqual((await db.prepare("SELECT entry_slug FROM diary_project_entries WHERE project_slug = 'atomic-project'").all()).results, [{ entry_slug: '2026-10' }]);
  } finally { await db.prepare('DROP TRIGGER project_test_reject').run(); }
});

test('concurrent duplicate creation cannot overwrite the winning project or its month links', async () => {
  const { owner } = await participants(); await createMonth(owner, '2026-10'); await createMonth(owner, '2026-09');
  const payloads = [projectInput('one-project', { title: 'October version', months: ['2026-10'] }), projectInput('one-project', { title: 'September version', months: ['2026-09'] })];
  const responses = await Promise.all(payloads.map(json => owner.request('/api/diary/admin/projects', { method: 'POST', json })));
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
  const winner = payloads[responses.findIndex(response => response.status === 201)];
  const stored = await db.prepare("SELECT * FROM diary_projects WHERE slug = 'one-project'").first(); assert.equal(stored.title, winner.title);
  assert.deepEqual((await db.prepare("SELECT entry_slug FROM diary_project_entries WHERE project_slug = 'one-project'").all()).results, [{ entry_slug: winner.months[0] }]);
});

test('project reads and backlinks immediately enforce revocation and expiry for existing sessions', async () => {
  const { owner, reader, invitation } = await participants(); await createMonth(owner, '2026-10'); await createProject(owner, 'access', { status: 'published', guideVisibility: 'readers', months: ['2026-10'] });
  assert.equal((await reader.request('/api/diary/projects/access')).status, 200);
  await db.prepare('UPDATE diary_invitations SET expires_at = ? WHERE id = ?').bind(Date.now() - 1, invitation.id).run();
  for (const path of ['/api/diary/projects', '/api/diary/projects/access', '/api/diary/entries/2026-10']) assert.equal((await reader.request(path)).status, 401);
  await db.prepare('UPDATE diary_invitations SET expires_at = ?, revoked_at = ? WHERE id = ?').bind(Date.now() + 60000, Date.now(), invitation.id).run();
  for (const path of ['/api/diary/projects', '/api/diary/projects/access', '/api/diary/entries/2026-10']) assert.equal((await reader.request(path)).status, 401);
});

test('overview and guide rendering retain the safe Markdown policy and writes require exact origin', async () => {
  const { owner, reader } = await participants();
  const unsafe = '# Safe heading\n\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29) ![remote](https://evil.example/pixel)\n\n[good](https://example.com)';
  await createProject(owner, 'safe-html', { status: 'published', guideVisibility: 'readers', overviewMarkdown: unsafe, guideMarkdown: unsafe });
  const { project } = await (await reader.request('/api/diary/projects/safe-html')).json();
  for (const html of [project.overviewHtml, project.guideHtml]) {
    assert.ok(html.includes('<h1>Safe heading</h1>')); assert.ok(!html.includes('<script')); assert.ok(!html.includes('href="javascript:')); assert.ok(!html.includes('<img')); assert.ok(html.includes('rel="noreferrer noopener"'));
  }
  const crossSite = await owner.request('/api/diary/admin/projects/safe-html', { method: 'PUT', crossOrigin: 'https://evil.example', json: { title: 'Changed' } }); assert.equal(crossSite.status, 403);
  const publicList = await (await browser().request('/api/diary/public')).json(); assert.deepEqual(publicList, { entries: [] });
});
