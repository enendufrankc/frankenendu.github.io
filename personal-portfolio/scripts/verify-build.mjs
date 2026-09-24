import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const dist = resolve('dist');
const base = '/frankenendu.github.io/';
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]);
test('standalone build supplies approved public routes', () => {
  for (const route of ['index.html','about/index.html','cv/index.html','404.html',...['elft','james-hambro','publicview','game-dna','agent-skills','interview-engine'].map(s=>`work/${s}/index.html`)]) assert.ok(existsSync(join(dist,route)), `Missing built page: ${route}`);
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
  assert.doesNotMatch(html,/University of Salford|\[DRAFT|\[PLACEHOLDER|internal-share\.|gitlab\.ballys|\/Users\/frank|GEMINI_API_KEY|RESEND_API_KEY/);
});
