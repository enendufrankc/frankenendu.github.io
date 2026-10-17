import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const github = process.env.PORTFOLIO_TARGET === 'github';
const dist = resolve(github ? 'dist-github' : 'dist');
const base = github ? '/frankenendu.github.io/' : '/';
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]);
test('standalone build supplies approved public routes', () => {
  for (const route of ['index.html','about/index.html','cv/index.html','404.html','images/social-card.png',...['report-discovery','document-drafting','performance-analysis','game-dna','agent-skills','interview-engine','safeai','aigen'].map(s=>`work/${s}/index.html`)]) assert.ok(existsSync(join(dist,route)), `Missing built page: ${route}`);
});
test('pages keep links, assets and anchors within the Pages base path', () => {
  assert.ok(existsSync(dist), 'Build output is required');
  for (const file of walk(dist).filter(f=>f.endsWith('.html'))) {
    const html=readFileSync(file,'utf8');
    for (const [,attribute,raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|data:)/.test(raw)) continue;
      const [pathAndQuery,fragment]=raw.split('#');
      const pathname=pathAndQuery.split('?')[0];
      let target=file;
      if (pathname) {
        assert.ok(pathname.startsWith(base), `${file}: ${attribute} escapes base path: ${raw}`);
        const relative=decodeURIComponent(pathname.slice(base.length));
        target=join(dist,relative);
        if (!/\.[a-z0-9]+$/i.test(relative)) target=join(target,'index.html');
        assert.ok(existsSync(target),`${file}: missing target ${raw}`);
      }
      if(fragment && target.endsWith('.html')) assert.ok(readFileSync(target,'utf8').includes(`id="${fragment}"`),`${file}: missing anchor ${raw}`);
    }
  }
});
test('public output uses verified identity and excludes private research', () => {
  assert.ok(existsSync(dist), 'Build output is required');
  const html=walk(dist).filter(f=>f.endsWith('.html')).map(f=>readFileSync(f,'utf8')).join('\n');
  assert.match(html,/Frank Enendu/);
  assert.match(html,/University of Liverpool/);
  assert.doesNotMatch(html,/University of Salford|\[DRAFT|\[PLACEHOLDER|internal-share\.|gitlab\.ballys|\/Users\/frank|GEMINI_API_KEY|RESEND_API_KEY|ELFT|James.Hambro|PublicView|\/work\/(?:elft|james-hambro|publicview)\//i);
});

test('canonical URLs use the primary domain without the mirror base', () => {
  for (const file of walk(dist).filter(f=>f.endsWith('.html'))) {
    const html = readFileSync(file,'utf8');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/);
    assert.ok(canonical, `Missing canonical: ${file}`);
    assert.ok(canonical[1].startsWith('https://frankenendu.link/'));
    assert.ok(!canonical[1].includes('/frankenendu.github.io/'));
  }
});

test('diary has a public entrance and private-content-free reading and authoring shells', () => {
  for (const route of ['diary/index.html', 'diary/entry/index.html', 'diary/admin/index.html']) {
    assert.ok(existsSync(join(dist, route)), `Missing diary shell: ${route}`);
    const html = readFileSync(join(dist, route), 'utf8');
    assert.match(html, /Inside the Work/);
    assert.doesNotMatch(html, /DIARY_PRIVATE_TEST_CONTENT|diary_sessions|code_hash/);
    assert.doesNotMatch(html, /<script type="module">/, 'Diary CSP requires external executable modules');
  }
  const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /diary\/(?:admin|entry|20\d{2}-\d{2})/);
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.match(home, /Inside the Work/);
  if (github) assert.match(home, /href="https:\/\/frankenendu\.link\/diary\/"/);
  else assert.match(home, /href="\/diary\/"/);
});
