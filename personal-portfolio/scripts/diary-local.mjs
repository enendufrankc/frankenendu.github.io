/**
 * Local browser QA only. Runs the production Worker against ephemeral D1/R2,
 * actual built assets, and a fake mail transport. No .env files or real keys.
 * Start after `npm run build`: node scripts/diary-local.mjs
 */
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { execFileSync } from 'node:child_process';
import { chmod, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProjectDrafts, parseMonthlyDraft, projectImportPlan, monthlyImportPlan } from './project-drafts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = resolve(root, 'dist');
const mailPath = resolve(root, '.private/test-mail.json');
const port = Number(process.env.DIARY_LOCAL_PORT ?? 8787);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('DIARY_LOCAL_PORT must be an integer from 1024 to 65535.');
const localOrigin = `http://localhost:${port}`;
const fakeKey = 'local-test-mail-key-not-a-real-credential';

try { execFileSync('git', ['check-ignore', '-q', relative(root, mailPath)], { cwd: root, stdio: 'ignore' }); }
catch { throw new Error('Add .private/ to .gitignore before using the local diary QA harness.'); }
await stat(resolve(assetsRoot, 'diary/index.html')).catch(() => { throw new Error('Build the diary pages first with npm run build.'); });
await mkdir(dirname(mailPath), { recursive: true, mode: 0o700 });
await writeFile(mailPath, '[]\n', { mode: 0o600 });
await chmod(mailPath, 0o600);

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.pdf': 'application/pdf',
};
async function staticAssets(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
  const url = new URL(request.url);
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Not found', { status: 404 }); }
  let file = resolve(assetsRoot, `.${pathname}`);
  if (file !== assetsRoot && !file.startsWith(`${assetsRoot}${sep}`)) return new Response('Not found', { status: 404 });
  let info = await stat(file).catch(() => null);
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) { url.pathname += '/'; return Response.redirect(url.toString(), 308); }
    file = resolve(file, 'index.html');
    info = await stat(file).catch(() => null);
  }
  let status = 200;
  if (!info?.isFile()) { file = resolve(assetsRoot, '404.html'); status = 404; }
  const bytes = await readFile(file).catch(() => null);
  if (!bytes) return new Response('Not found', { status: 404 });
  return new Response(request.method === 'HEAD' ? null : bytes, { status, headers: {
    'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'public, max-age=0',
  } });
}

const bundle = await build({
  absWorkingDir: root, entryPoints: ['worker/index.ts'], bundle: true, write: false,
  format: 'esm', platform: 'browser', target: 'es2022',
  conditions: ['workerd', 'worker', 'browser'], tsconfigRaw: {},
});
const mail = [];
let writeQueue = Promise.resolve();
const mf = new Miniflare(convertV4MiniflareOptions({
  host: '127.0.0.1', port, modules: true,
  script: bundle.outputFiles[0].text, compatibilityDate: '2026-09-24',
  d1Databases: ['DIARY_DB'], r2Buckets: ['DIARY_FILES'],
  bindings: {
    DIARY_ORIGIN: localOrigin, DIARY_OWNER_EMAIL: 'owner@example.com',
    DIARY_FROM_EMAIL: 'Local diary <diary@example.com>', RESEND_API_KEY: fakeKey,
  },
  serviceBindings: { ASSETS: staticAssets },
  outboundService: async request => {
    if (request.url !== 'https://api.resend.com/emails' || request.method !== 'POST' || request.headers.get('Authorization') !== `Bearer ${fakeKey}`) {
      // Deliberately terminate: silently swallowing unexpected egress could
      // make a future harness change look safe when it is not.
      console.error('Local QA refused an unexpected outbound request.');
      setTimeout(() => { void mf.dispose().finally(() => process.exit(1)); }, 0);
      throw new Error('Unexpected outbound request blocked.');
    }
    const message = await request.json();
    const id = crypto.randomUUID();
    mail.push({ id, createdAt: new Date().toISOString(), ...message });
    writeQueue = writeQueue.then(() => writeFile(mailPath, `${JSON.stringify(mail, null, 2)}\n`, { mode: 0o600 }));
    await writeQueue;
    return Response.json({ id });
  },
}));

try {
  const db = await mf.getD1Database('DIARY_DB');
  for (const name of (await readdir(resolve(root, 'migrations'))).filter(name => /^\d+.*\.sql$/.test(name)).sort()) {
    const migration = await readFile(resolve(root, 'migrations', name), 'utf8');
    for (const statement of migration.replace(/--[^\n]*/g, '').split(';').map(value => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
  if (process.env.DIARY_SEED_PRIVATE === '1') {
    const projectPath = resolve(root, '.private/projects.json');
    const monthlyPath = resolve(root, '.private/2026-10-draft.json');
    for (const path of [projectPath, monthlyPath]) {
      try { execFileSync('git', ['check-ignore', '-q', relative(root, path)], { cwd: root, stdio: 'ignore' }); }
      catch { throw new Error('Private seed files must be ignored by Git.'); }
    }
    const [projectSource, monthlySource] = await Promise.all([readFile(projectPath, 'utf8'), readFile(monthlyPath, 'utf8')]);
    const projects = parseProjectDrafts(projectSource), monthly = parseMonthlyDraft(monthlySource);
    const [projectRows, monthRows] = await Promise.all([db.prepare('SELECT slug FROM diary_projects').all(), db.prepare('SELECT slug FROM diary_entries').all()]);
    const existingMonths = monthRows.results.map(row => row.slug), now = Date.now();
    const monthlyPlan = monthlyImportPlan(monthly, { existingMonths, now });
    const projectPlan = projectImportPlan(projects, {
      existingProjectSlugs: projectRows.results.map(row => row.slug), existingMonths: [...new Set([...existingMonths, monthly.month])], now,
    });
    const statements = [...monthlyPlan.statements, ...projectPlan.statements];
    if (statements.length) await db.batch(statements.map(statement => db.prepare(statement)));
    console.log(`Private seed: ${monthlyPlan.createdCount} monthly draft, ${projectPlan.createdCount} project drafts; ${monthlyPlan.skippedCount + projectPlan.skippedCount} existing records preserved.`);
  }
  await mf.ready;
  console.log(`Local diary QA: ${localOrigin}/diary/`);
  console.log('Owner: owner@example.com. Use the normal email-code sign-in form.');
  console.log('Fake mail only: .private/test-mail.json. D1/R2 are ephemeral; no external email can be sent.');
} catch { await mf.dispose(); throw new Error('Local diary initialization failed. Check migrations and ignored private seed files. No private contents were logged.'); }

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await writeQueue;
  await mf.dispose();
}
process.once('SIGINT', () => { void stop(); });
process.once('SIGTERM', () => { void stop(); });
