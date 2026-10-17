import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.className = ''; this.style = { setProperty() {} }; this._text = ''; }
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set innerHTML(_) { throw new Error('Diagram must never interpret HTML'); }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute(key, value) { this.attributes[key] = value; }
}
const model = { kind: 'mixed', caption: 'Private model <script>attack()</script>', stages: [
  { label: 'Inputs', nodes: [{ title: '<img src=x onerror=attack()>', detail: 'Evidence & context', state: 'documented' }] },
  { label: 'Decision', nodes: [{ title: 'Choose', detail: 'A proposed decision', state: 'proposed' }] },
  { label: 'Outcome', nodes: [{ title: 'Review', detail: 'Needs verification', state: 'unverified' }] },
], feedback: 'Use review to refine the next decision.' };
async function renderer() {
  const result = await build({ entryPoints: ['src/lib/mental-model.ts'], bundle: true, write: false, format: 'iife', globalName: 'diagram', platform: 'browser', tsconfigRaw: {} });
  const context = { document: { createElement: tag => new Element(tag) } }; vm.runInNewContext(result.outputFiles[0].text, context); return context.diagram;
}
test('mental model preserves reading order and renders labels as text, never HTML', async () => {
  const { renderMentalModel } = await renderer(); const figure = renderMentalModel(model);
  assert.equal(figure.tagName, 'figure');
  assert.ok(figure.textContent.includes(model.caption));
  assert.ok(figure.textContent.includes(model.stages[0].nodes[0].title));
  assert.ok(figure.textContent.includes('Documented')); assert.ok(figure.textContent.includes('Proposed')); assert.ok(figure.textContent.includes('To verify'));
  const stages = figure.children.find(child => child.tagName === 'ol');
  assert.deepEqual(stages.children.map(stage => stage.children[0].textContent), ['01 / Inputs', '02 / Decision', '03 / Outcome']);
  assert.ok(figure.textContent.includes(model.feedback));
});
test('optional feedback does not leave an empty loop or invented relationship', async () => {
  const { renderMentalModel } = await renderer(); const figure = renderMentalModel({ ...model, feedback: undefined });
  assert.ok(!figure.children.some(child => child.className === 'mental-model-feedback'));
});

test('a displayed private model is removed when the diary session loses access', async () => {
  class PageElement extends Element {
    constructor(tag = 'div') { super(tag); this.dataset = {}; this.hidden = false; this.handlers = {}; this.classList = { toggle() {} }; }
    set innerHTML(value) { this._html = value; this.children = []; }
    get innerHTML() { return this._html || ''; }
    replaceChildren(...nodes) { this._html = ''; this._text = ''; this.children = nodes; }
    querySelectorAll() { return []; }
    addEventListener(type, fn) { this.handlers[type] = fn; }
  }
  const names = ['project-page','private-area','public-area','session-bar','session-description','login-message','page-message','project-programmes','project-title','project-summary','project-area','project-stage','project-evidence','project-reading','project-updated','project-contributors','project-publication','project-overview','guide-section','guide-nav','project-guide','guide-visibility','project-outline','project-months','project-related','project-related-section','project-sources','project-sources-section','project-model','model-section','model-nav'];
  const nodes = new Map(names.map(name => [`[data-${name}]`, new PageElement()])); nodes.get('[data-project-page]').dataset = { projectPage: 'detail', mirror: 'false' };
  const handlers = {};
  const document = { visibilityState: 'visible', querySelector: selector => nodes.get(selector) ?? null, createElement: tag => new PageElement(tag), addEventListener(type, fn) { handlers[type] = fn; } };
  const fetch = async url => url.endsWith('/session') ? Response.json({user:{email:'owner@example.com',role:'owner',expiresAt:new Date(Date.now()+60000).toISOString()}}) : Response.json({project:{slug:'example',title:'Example',summary:'Example',area:'Research',stage:'Prototype',evidenceDate:'2026-10-17',updatedAt:new Date().toISOString(),readingMinutes:1,contributors:[],relatedProjects:[],entries:[],guideAvailable:false,overviewHtml:'<p>Overview</p>',mentalModel:model}});
  const result = await build({entryPoints:['src/lib/diary-projects.ts'],bundle:true,write:false,format:'iife',platform:'browser',tsconfigRaw:{}});
  vm.runInNewContext(result.outputFiles[0].text,{document,window:{addEventListener(){}},location:{pathname:'/diary/projects/example/'},fetch,Headers,Response,Intl,Date,setTimeout(){return 1;},clearTimeout(){},setInterval(){}});
  await new Promise(resolve => setImmediate(resolve)); await new Promise(resolve => setImmediate(resolve));
  assert.ok(nodes.get('[data-project-model]').textContent.includes(model.caption));
  assert.equal(nodes.get('[data-model-section]').hidden,false);
  handlers['diary:unauthorised']();
  assert.equal(nodes.get('[data-project-model]').textContent,'');
  assert.equal(nodes.get('[data-model-section]').hidden,true); assert.equal(nodes.get('[data-model-nav]').hidden,true);
});
