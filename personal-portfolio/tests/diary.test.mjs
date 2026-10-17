import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const origin = 'https://diary.example';
const ownerEmail = 'owner@example.com';
let mf, db, script, mailFailure = false, mail = [];
let ipSequence = 0;

before(async () => {
  const bundle = await build({ entryPoints: ['worker/index.ts'], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022', conditions: ['workerd', 'worker', 'browser'], tsconfigRaw: {} });
  script = bundle.outputFiles[0].text;
  mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text, compatibilityDate: '2026-09-24',
    d1Databases: ['DIARY_DB'], r2Buckets: ['DIARY_FILES'],
    bindings: { DIARY_ORIGIN: origin, DIARY_OWNER_EMAIL: ownerEmail, DIARY_FROM_EMAIL: 'Diary <diary@example.com>', RESEND_API_KEY: 'test-mail-key' },
    serviceBindings: { ASSETS: request => new Response(`shell:${new URL(request.url).pathname}`, { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600' } }) },
    outboundService: async request => {
      assert.equal(request.url, 'https://api.resend.com/emails', 'Unexpected outbound network request');
      mail.push(await request.json());
      return mailFailure ? new Response('Mock delivery failure', { status: 503 }) : Response.json({ id: 'mock-message' });
    },
  }));
  db = await mf.getD1Database('DIARY_DB');
  for (const name of ['0001_diary.sql', '0002_projects.sql', '0003_mental_models.sql']) {
    const migration = await readFile(`migrations/${name}`, 'utf8');
    for (const statement of migration.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
});
after(async () => { await mf?.dispose(); });
beforeEach(async () => {
  const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'diary_%' ORDER BY name").all();
  for (const { name } of tables.results) await db.prepare(`DELETE FROM ${name}`).run();
  mail = []; mailFailure = false;
});

function browser() {
  const cookies = new Map();
  const ip = `192.0.2.${++ipSequence}`;
  return {
    cookies,
    async request(path, { method = 'GET', json, headers = {}, body, crossOrigin } = {}) {
      const h = new Headers({ 'CF-Connecting-IP': ip, ...headers });
      if (cookies.size) h.set('Cookie', [...cookies].map(([k, v]) => `${k}=${v}`).join('; '));
      if (method !== 'GET' && method !== 'HEAD') h.set('Origin', crossOrigin ?? origin);
      if (json !== undefined) { h.set('Content-Type', 'application/json'); body = JSON.stringify(json); }
      const response = await mf.dispatchFetch(`${origin}${path}`, { method, headers: h, body });
      for (const cookie of response.headers.getSetCookie()) {
        const [name, value] = cookie.split(';')[0].split('=');
        if (value) cookies.set(name, value); else cookies.delete(name);
      }
      return response;
    },
  };
}
async function delivered(predicate) {
  const deadline = Date.now() + 1500;
  while (!predicate() && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
}
async function challenge(client, email) {
  const previous = mail.length;
  const response = await client.request('/api/diary/auth/request', { method: 'POST', json: { email } });
  assert.equal(response.status, 202, await response.clone().text());
  const data = await response.json();
  await delivered(() => mail.slice(previous).some(m => m.to.includes(email.trim().toLowerCase()) && /\b\d{8}\b/.test(m.text)));
  const emailMessage = mail.slice(previous).findLast(m => m.to.includes(email.trim().toLowerCase()) && /\b\d{8}\b/.test(m.text));
  return { email, challengeId: data.challengeId, code: emailMessage?.text.match(/\b\d{8}\b/)[0] };
}
async function login(client, email = ownerEmail) {
  const proof = await challenge(client, email);
  assert.ok(proof.code, 'Sign-in code should be delivered through mocked mail');
  const response = await client.request('/api/diary/auth/verify', { method: 'POST', json: proof });
  assert.equal(response.status, 200, await response.clone().text());
  return { response, ...(await response.json()) };
}
async function invite(owner, email = 'reader@example.com', expiresAt) {
  const response = await owner.request('/api/diary/admin/invitations', { method: 'POST', json: { email, name: 'Recruiter', ...(expiresAt ? { expiresAt } : {}) } });
  assert.equal(response.status, 201, await response.clone().text());
  return (await response.json()).invitation;
}
async function writeEntry(owner, overrides = {}) {
  const entry = { slug: '2026-10', month: '2026-10', title: 'October notes', summary: 'A private summary', tags: ['Delivery'], markdown: '# Private work\n\nBuilt useful things.', status: 'published', publicTeaser: false, teaser: '', ...overrides };
  const response = await owner.request('/api/diary/admin/entries', { method: 'POST', json: entry });
  assert.equal(response.status, 201, await response.clone().text());
  return (await response.json()).entry;
}
async function ownerBrowser() { const client = browser(); await login(client); return client; }
async function readerBrowser(owner, email) { await invite(owner, email); const reader = browser(); await login(reader, email); return reader; }
function privateHeaders(response) {
  assert.match(response.headers.get('Cache-Control'), /private.*no-store/);
  assert.match(response.headers.get('Vary'), /Cookie/i);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
}

test('anonymous routes disclose no diary content and all private responses avoid caching', async () => {
  const client = browser();
  const session = await client.request('/api/diary/session');
  assert.equal(session.status, 200); assert.equal((await session.json()).user, null); privateHeaders(session);
  const protectedResponse = await client.request('/api/diary/entries');
  assert.equal(protectedResponse.status, 401); privateHeaders(protectedResponse);
  const publicResponse = await client.request('/api/diary/public');
  assert.deepEqual(await publicResponse.json(), { entries: [] });
  for (const path of ['/diary/', '/diary/admin/', '/diary/entry/', '/diary/2026-10/']) {
    const shell = await client.request(path); assert.equal(shell.status, 200); privateHeaders(shell);
    assert.equal(await shell.text(), `shell:${path === '/diary/2026-10/' ? '/diary/entry/' : path}`);
  }
  assert.equal((await client.request('/diary/secret.txt')).status, 404);
  const ordinary = await client.request('/about/'); assert.match(ordinary.headers.get('Cache-Control'), /public/);
});

test('owner authentication normalises email, issues opaque secure cookies and stores hashes only', async () => {
  const client = browser(); const { response, user } = await login(client, ' OWNER@EXAMPLE.COM ');
  assert.equal(user.email, ownerEmail); assert.equal(user.role, 'owner');
  assert.ok(Date.parse(user.expiresAt) <= Date.now() + 8 * 3600000);
  const cookie = response.headers.getSetCookie().find(c => c.includes('session'));
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Lax/); assert.match(cookie, /Path=\//);
  const rawSession = [...client.cookies].find(([name]) => name.includes('session'))[1];
  assert.match(rawSession, /^[a-f0-9]{64}$/);
  const stored = await db.prepare('SELECT * FROM diary_sessions').all();
  assert.ok(!JSON.stringify(stored.results).includes(rawSession));
  assert.equal((await (await client.request('/api/diary/session')).json()).user.role, 'owner');
});

test('uninvited and invited code requests are indistinguishable in public shape', async () => {
  const unknown = browser(), owner = browser();
  const a = await unknown.request('/api/diary/auth/request', { method: 'POST', json: { email: 'unknown@example.com' } });
  const b = await owner.request('/api/diary/auth/request', { method: 'POST', json: { email: ownerEmail } });
  assert.equal(a.status, b.status); assert.equal(a.status, 202);
  const ad = await a.json(), bd = await b.json();
  assert.deepEqual(Object.keys(ad), Object.keys(bd)); assert.equal(ad.message, bd.message);
  assert.ok(ad.challengeId && bd.challengeId); await delivered(() => mail.length === 1); assert.equal(mail.length, 1);
});

test('verification is bound to initiating browser, challenge email, and one atomic consumption', async () => {
  const client = browser(), stranger = browser(); const proof = await challenge(client, ownerEmail);
  assert.equal((await stranger.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
  assert.equal((await client.request('/api/diary/auth/verify', { method: 'POST', json: { ...proof, email: 'other@example.com' } })).status, 401);
  const attempts = await Promise.all(Array.from({ length: 5 }, () => client.request('/api/diary/auth/verify', { method: 'POST', json: proof })));
  assert.equal(attempts.filter(r => r.status === 200).length, 1);
  assert.equal((await client.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_sessions').first()).n, 1);
});

test('five incorrect code attempts exhaust a challenge even when submitted concurrently', async () => {
  const client = browser(); const proof = await challenge(client, ownerEmail);
  const incorrect = proof.code === '00000000' ? '11111111' : '00000000';
  const attempts = await Promise.all(Array.from({ length: 8 }, () => client.request('/api/diary/auth/verify', { method: 'POST', json: { ...proof, code: incorrect } })));
  assert.ok(attempts.every(r => r.status === 401));
  assert.equal((await client.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
  assert.equal((await db.prepare('SELECT attempts FROM diary_challenges WHERE id = ?').bind(proof.challengeId).first()).attempts, 5);
});

test('expired codes cannot create sessions', async () => {
  const client = browser(); const proof = await challenge(client, ownerEmail);
  await db.prepare('UPDATE diary_challenges SET expires_at = ?').bind(Date.now() - 1).run();
  assert.equal((await client.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
});

test('email and IP code-request limits are atomic under concurrency', async () => {
  const client = browser();
  const replies = await Promise.all(Array.from({ length: 12 }, () => client.request('/api/diary/auth/request', { method: 'POST', json: { email: ownerEmail } })));
  assert.ok(replies.every(r => r.status === 202)); await delivered(() => mail.length === 5); assert.equal(mail.length, 5);
  const ipClient = browser();
  await Promise.all(Array.from({ length: 30 }, (_, i) => ipClient.request('/api/diary/auth/request', { method: 'POST', json: { email: `unknown${i}@example.com` } })));
  await db.prepare('INSERT INTO diary_invitations (id, email, name, expires_at, created_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), 'different@example.com', '', Date.now() + 60000, Date.now()).run();
  await ipClient.request('/api/diary/auth/request', { method: 'POST', json: { email: 'different@example.com' } });
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(mail.length, 5);
});

test('same-origin mutations require JSON and reject cross-site and missing origins', async () => {
  const client = browser();
  assert.equal((await client.request('/api/diary/auth/request', { method: 'POST', json: { email: ownerEmail }, crossOrigin: 'https://evil.example' })).status, 403);
  assert.equal((await client.request('/api/diary/auth/request', { method: 'POST', json: { email: ownerEmail }, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await mf.dispatchFetch(`${origin}/api/diary/auth/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: ownerEmail }) })).status, 403);
  assert.equal((await client.request('/api/diary/auth/request', { method: 'POST', body: 'email=x' })).status, 415);
  assert.equal((await client.request('/api/diary/auth/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
  assert.equal((await client.request('/api/diary/auth/request', { method: 'POST', json: { email: 'x'.repeat(262145) } })).status, 413);
});

test('invitations default to seven days and reader sessions respect custom expiry', async () => {
  const owner = await ownerBrowser();
  const normal = await invite(owner); assert.ok(Math.abs(Date.parse(normal.expiresAt) - Date.now() - 7 * 86400000) < 10000);
  const expiry = new Date(Date.now() + 3600000).toISOString(); await invite(owner, 'short@example.com', expiry);
  const reader = browser(); const { user } = await login(reader, 'short@example.com');
  assert.equal(user.role, 'reader'); assert.equal(user.expiresAt, expiry);
  assert.equal((await reader.request('/api/diary/admin/invitations')).status, 403);
  assert.equal((await reader.request('/api/diary/admin/entries', { method: 'POST', json: {} })).status, 403);
  const invitationMail = mail.find(m => m.to.includes('reader@example.com'));
  assert.ok(invitationMail.text.includes(`${origin}/diary/`)); assert.ok(!invitationMail.text.includes('?'));
});

test('revoking an invitation immediately invalidates sessions and pending codes; extending never unrevokes', async () => {
  const owner = await ownerBrowser(); const invitation = await invite(owner);
  const reader = browser(); await login(reader, invitation.email); const proof = await challenge(reader, invitation.email);
  const revoked = await owner.request(`/api/diary/admin/invitations/${invitation.id}`, { method: 'PATCH', json: { revoke: true } });
  assert.equal(revoked.status, 200);
  assert.equal((await (await reader.request('/api/diary/session')).json()).user, null);
  assert.equal((await reader.request('/api/diary/entries')).status, 401);
  assert.equal((await reader.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
  const extended = await owner.request(`/api/diary/admin/invitations/${invitation.id}`, { method: 'PATCH', json: { expiresAt: new Date(Date.now() + 10 * 86400000).toISOString() } });
  assert.ok((await extended.json()).invitation.revokedAt);
  assert.equal((await reader.request('/api/diary/entries')).status, 401);
});

test('expired invitations invalidate current sessions; re-invites cannot restore old sessions or challenges', async () => {
  const owner = await ownerBrowser(); const invitation = await invite(owner); const reader = browser(); await login(reader, invitation.email);
  const proof = await challenge(reader, invitation.email);
  await db.prepare('UPDATE diary_invitations SET expires_at = ? WHERE id = ?').bind(Date.now() - 1, invitation.id).run();
  assert.equal((await reader.request('/api/diary/entries')).status, 401);
  const next = await invite(owner, invitation.email); assert.notEqual(next.id, invitation.id);
  assert.equal((await reader.request('/api/diary/entries')).status, 401);
  assert.equal((await reader.request('/api/diary/auth/verify', { method: 'POST', json: proof })).status, 401);
});

test('logout destroys the server session and expired owner sessions are refused', async () => {
  const owner = await ownerBrowser(); const saved = new Map(owner.cookies);
  assert.equal((await owner.request('/api/diary/auth/logout', { method: 'POST', json: {} })).status, 200);
  owner.cookies.clear(); for (const [k, v] of saved) owner.cookies.set(k, v);
  assert.equal((await owner.request('/api/diary/admin/entries')).status, 401);
  await login(owner); await db.prepare('UPDATE diary_sessions SET expires_at = ?').bind(Date.now() - 1).run();
  assert.equal((await (await owner.request('/api/diary/session')).json()).user, null);
});

test('only published entries reach readers and only explicit teasers reach the public', async () => {
  const owner = await ownerBrowser(); const reader = await readerBrowser(owner, 'reader@example.com');
  await writeEntry(owner); await writeEntry(owner, { slug: '2026-09', month: '2026-09', title: 'Draft title', status: 'draft', publicTeaser: true, teaser: 'Draft teaser' });
  await writeEntry(owner, { slug: '2026-08', month: '2026-08', title: 'Public title', publicTeaser: true, teaser: 'Safe teaser' });
  const list = await (await reader.request('/api/diary/entries')).json(); assert.equal(list.entries.length, 2);
  assert.equal((await reader.request('/api/diary/entries/2026-09')).status, 404);
  assert.equal((await owner.request('/api/diary/entries/2026-09')).status, 200);
  const publicList = await (await browser().request('/api/diary/public')).json();
  assert.deepEqual(publicList, { entries: [{ slug: '2026-08', month: '2026-08', title: 'Public title', teaser: 'Safe teaser' }] });
  const admin = await (await owner.request('/api/diary/admin/entries')).json(); assert.equal(admin.entries.length, 3); assert.ok(admin.entries[0].markdown);
  const changed = await owner.request('/api/diary/admin/entries/2026-10', { method: 'PUT', json: { status: 'draft' } }); assert.equal(changed.status, 200);
  assert.equal((await reader.request('/api/diary/entries/2026-10')).status, 404);
});

test('entry validation rejects mismatched months, duplicates and unsafe input lengths', async () => {
  const owner = await ownerBrowser(); await writeEntry(owner);
  assert.equal((await owner.request('/api/diary/admin/entries', { method: 'POST', json: { slug: '2026-13', month: '2026-13', title: 'Bad' } })).status, 400);
  assert.equal((await owner.request('/api/diary/admin/entries', { method: 'POST', json: { slug: '2026-11', month: '2026-12', title: 'Bad' } })).status, 400);
  assert.equal((await owner.request('/api/diary/admin/entries', { method: 'POST', json: { slug: '2026-10', month: '2026-10', title: 'Again' } })).status, 409);
  assert.equal((await owner.request('/api/diary/admin/entries/2026-10', { method: 'PUT', json: { title: 'x'.repeat(161) } })).status, 400);
});

test('Markdown rendering escapes HTML, blocks dangerous protocols and removes tracking images', async () => {
  const owner = await ownerBrowser();
  const response = await owner.request('/api/diary/admin/preview', { method: 'POST', json: { markdown: '# Hello\n\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29) ![tracker](https://evil.example/pixel)\n\n[good](https://example.com)\n\n![ref][x]\n\n[x]: https://evil.example/ref' } });
  assert.equal(response.status, 200); const { html } = await response.json();
  assert.ok(html.includes('<h1>Hello</h1>')); assert.ok(!html.includes('<script')); assert.ok(!html.includes('href="javascript:')); assert.ok(!html.includes('<img')); assert.ok(html.includes('rel="noreferrer noopener"'));
});

test('attachments live behind current authentication and parent publication state', async () => {
  const owner = await ownerBrowser(); const reader = await readerBrowser(owner, 'reader@example.com'); await writeEntry(owner);
  const body = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  const uploaded = await owner.request('/api/diary/admin/entries/2026-10/attachments', { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': 'diagram.png' }, body });
  assert.equal(uploaded.status, 201, await uploaded.clone().text()); const { attachment } = await uploaded.json();
  assert.equal(attachment.name, 'diagram.png'); assert.equal(attachment.size, body.byteLength);
  assert.equal((await browser().request(attachment.url)).status, 401);
  const downloaded = await reader.request(attachment.url); assert.equal(downloaded.status, 200); privateHeaders(downloaded);
  assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), body);
  await owner.request('/api/diary/admin/entries/2026-10', { method: 'PUT', json: { status: 'draft' } });
  assert.equal((await reader.request(attachment.url)).status, 404); assert.equal((await owner.request(attachment.url)).status, 200);
  await owner.request('/api/diary/admin/entries/2026-10', { method: 'PUT', json: { status: 'published' } });
  await db.prepare('UPDATE diary_invitations SET revoked_at = ?').bind(Date.now()).run();
  assert.equal((await reader.request(attachment.url)).status, 401);
});

test('attachment uploads reject reader writes, unsupported/spoofed content and large payloads', async () => {
  const owner = await ownerBrowser(); const reader = await readerBrowser(owner, 'reader@example.com'); await writeEntry(owner);
  const path = '/api/diary/admin/entries/2026-10/attachments';
  const upload = { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': 'a.png' }, body: 'not a png' };
  assert.equal((await reader.request(path, upload)).status, 403);
  assert.equal((await owner.request(path, upload)).status, 415);
  assert.equal((await owner.request(path, { ...upload, headers: { 'Content-Type': 'image/svg+xml', 'X-File-Name': 'bad.svg' } })).status, 415);
  assert.equal((await owner.request(path, { ...upload, body: new Uint8Array(10 * 1024 * 1024 + 1) })).status, 413);
});


test('throttled IPs cannot create unbounded email-rate-limit records', async () => {
  const client = browser();
  await Promise.all(Array.from({ length: 80 }, (_, i) => client.request('/api/diary/auth/request', { method: 'POST', json: { email: `scanning${i}@example.com` } })));
  const { n } = await db.prepare('SELECT count(*) AS n FROM diary_rate_limits').first();
  assert.ok(n <= 31, `One IP should create at most one IP counter and 30 email counters, found ${n}`);
});

test('successful code requests prune expired authentication records without removing active sessions', async () => {
  const client = await ownerBrowser();
  await db.prepare('UPDATE diary_challenges SET expires_at = ?').bind(Date.now() - 1).run();
  await db.prepare("INSERT INTO diary_sessions (token_hash, email, role, created_at, expires_at) VALUES ('expired-test-session', 'old@example.com', 'reader', 1, 2)").run();
  await db.prepare("INSERT INTO diary_rate_limits (key, window_started, count) VALUES ('expired-test-limit', 1, 100)").run();
  await challenge(client, ownerEmail);
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_challenges').first()).n, 1);
  assert.equal((await db.prepare('SELECT count(*) AS n FROM diary_sessions').first()).n, 1);
  assert.equal(await db.prepare("SELECT * FROM diary_rate_limits WHERE key = 'expired-test-limit'").first(), null);
  assert.equal((await (await client.request('/api/diary/session')).json()).user.role, 'owner');
});

test('mail delivery failures keep authentication generic and report invitation delivery separately', async () => {
  const owner = await ownerBrowser(); mailFailure = true;
  const reply = await owner.request('/api/diary/admin/invitations', { method: 'POST', json: { email: 'delivery@example.com', name: 'Recruiter' } });
  assert.equal(reply.status, 201); const body = await reply.json(); assert.equal(body.mailSent, false); assert.equal(body.invitation.email, 'delivery@example.com');
  const auth = await browser().request('/api/diary/auth/request', { method: 'POST', json: { email: 'delivery@example.com' } });
  assert.equal(auth.status, 202); assert.match((await auth.json()).message, /If this email has diary access/);
});

test('missing configuration fails closed while the generic diary shell remains accessible', async () => {
  const unconfigured = new Miniflare(convertV4MiniflareOptions({ modules: true, script, compatibilityDate: '2026-09-24',
    serviceBindings: { ASSETS: () => new Response('Sign-in shell only') },
    outboundService: () => { assert.fail('Unconfigured Worker must never send email'); },
  }));
  try {
    for (const path of ['/api/diary/session', '/api/diary/public', '/api/diary/entries']) {
      const response = await unconfigured.dispatchFetch(`${origin}${path}`);
      assert.equal(response.status, 503); privateHeaders(response);
      assert.deepEqual(Object.keys(await response.json()).sort(), ['code', 'error']);
    }
    const shell = await unconfigured.dispatchFetch(`${origin}/diary/`);
    assert.equal(shell.status, 200); privateHeaders(shell); assert.equal(await shell.text(), 'Sign-in shell only');
  } finally { await unconfigured.dispose(); }
});

test('Markdown preserves only exact private attachment image URLs and image responses remain authenticated', async () => {
  const owner = await ownerBrowser(); const reader = await readerBrowser(owner, 'image-reader@example.com'); await writeEntry(owner);
  const uploaded = await owner.request('/api/diary/admin/entries/2026-10/attachments', {
    method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': 'private-diagram.png' },
    body: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]),
  });
  assert.equal(uploaded.status, 201); const { attachment } = await uploaded.json();
  const markdown = [
    `![private diagram](${attachment.url})`,
    `![absolute same origin](${origin}${attachment.url})`,
    `![query](${attachment.url}?tracking=1)`,
    `![fragment](${attachment.url}#tracking)`,
    '![external](https://evil.example/pixel)',
    '![protocol relative](//evil.example/pixel)',
    '![data](data:image/png;base64,aGVsbG8=)',
    '![other local](/images/public.png)',
    '![invalid ID](/api/diary/attachments/not-a-uuid)',
    '![encoded slash](/api/diary/attachments%2F00000000-0000-0000-0000-000000000000)',
  ].join('\n\n');
  const saved = await owner.request('/api/diary/admin/entries/2026-10', { method: 'PUT', json: { markdown } });
  assert.equal(saved.status, 200);
  const detail = await (await reader.request('/api/diary/entries/2026-10')).json();
  assert.equal((detail.entry.html.match(/<img\b/g) ?? []).length, 1);
  assert.ok(detail.entry.html.includes(`src="${attachment.url}"`));
  assert.ok(detail.entry.html.includes('alt="private diagram"'));
  const image = await reader.request(attachment.url);
  assert.equal(image.status, 200); privateHeaders(image);
  assert.match(image.headers.get('Content-Disposition'), /^inline;/);
  assert.equal(image.headers.get('Content-Type'), 'image/png');
  assert.equal((await browser().request(attachment.url)).status, 401);
  await db.prepare('UPDATE diary_invitations SET revoked_at = ?').bind(Date.now()).run();
  assert.equal((await reader.request(attachment.url)).status, 401);
});

test('PDF attachments remain downloads while verified JPEG and WebP images render inline', async () => {
  const owner = await ownerBrowser(); await writeEntry(owner);
  for (const [type, name, body, disposition] of [
    ['application/pdf', 'report.pdf', new TextEncoder().encode('%PDF-1.7\n'), 'attachment'],
    ['image/jpeg', 'photo.jpg', new Uint8Array([255, 216, 255, 224]), 'inline'],
    ['image/webp', 'diagram.webp', new Uint8Array([82, 73, 70, 70, 12, 0, 0, 0, 87, 69, 66, 80]), 'inline'],
  ]) {
    const upload = await owner.request('/api/diary/admin/entries/2026-10/attachments', { method: 'POST', headers: { 'Content-Type': type, 'X-File-Name': name }, body });
    assert.equal(upload.status, 201); const { attachment } = await upload.json();
    const download = await owner.request(attachment.url);
    assert.equal(download.status, 200); assert.ok(download.headers.get('Content-Disposition').startsWith(`${disposition};`));
    privateHeaders(download);
  }
});
