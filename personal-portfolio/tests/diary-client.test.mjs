import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {resolve} from 'node:path';
const root=resolve('.');
test('a delayed private response cannot restore content after access is cleared', async () => {
class Element { constructor(){this.hidden=false;this.dataset={};this.textContent='';this.innerHTML='';this.handlers={};this.classList={toggle(){},add(){}};} querySelector(s){return elements.get(s)??null;} addEventListener(t,f){this.handlers[t]=f;} replaceChildren(){this.innerHTML='';this.textContent='';} append(){} setAttribute(){} removeAttribute(){} reset(){} }
const elements=new Map();
for(const key of ['[data-diary-page]','[data-request-code]','[data-verify-code]','[data-diary-login]','[data-private-area]','[data-session-bar]','[data-public-area]','[data-owner-link]','[data-session-description]','[data-login-message]','[data-page-message]','[data-change-email]','[data-logout]','[data-entry-month]','[data-entry-title]','[data-entry-summary]','[data-entry-reading]','[data-entry-updated]','[data-entry-tags]','[data-entry-body]','[data-attachments-area]','[data-attachments-list]','[data-entry-neighbours]']) elements.set(key,new Element());
elements.get('[data-diary-page]').dataset={diaryPage:'entry',mirror:'false'};
const docHandlers={}; const document={visibilityState:'visible',querySelector:s=>elements.get(s)??null,createElement:()=>new Element(),addEventListener:(t,f)=>docHandlers[t]=f,dispatchEvent:e=>docHandlers[e.type]?.(e)};
let deliverEntry,deliverArchive;
const fetch=async url=>{
 if(url.endsWith('/session'))return Response.json({user:{email:'reader@example.com',role:'reader',expiresAt:new Date(Date.now()+60000).toISOString()}});
 if(url.endsWith('/entries/2026-10'))return new Promise(resolve=>{deliverEntry=()=>resolve(Response.json({entry:{month:'2026-10',title:'Private title',summary:'Private summary',readingMinutes:1,updatedAt:new Date().toISOString(),tags:[],html:'<p>PRIVATE_FIXTURE</p>',attachments:[]}}));});
 if(url.endsWith('/entries'))return new Promise(resolve=>{deliverArchive=()=>resolve(Response.json({entries:[]}));});
 throw Error(url);
};
const result=await build({absWorkingDir:root,entryPoints:['src/lib/diary-reader.ts'],bundle:true,write:false,format:'iife',platform:'browser',tsconfigRaw:{}});
const context={document,window:{addEventListener(){}},location:{pathname:'/diary/2026-10/'},fetch,Headers,Response,Intl,Date,setTimeout(){return 1},clearTimeout(){},setInterval(){},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail;}}};
vm.runInNewContext(result.outputFiles[0].text,context);
const tick=()=>new Promise(r=>setImmediate(r));
await tick();
docHandlers['diary:unauthorised']();
assert.equal(elements.get('[data-entry-body]').innerHTML, '');
deliverEntry(); await tick(); await tick();
assert.equal(elements.get('[data-entry-body]').innerHTML, '');
assert.equal(elements.get('[data-entry-title]').textContent, '');
assert.equal(elements.get('[data-private-area]').hidden, true);
if(deliverArchive){ deliverArchive(); await tick(); await tick(); }
assert.equal(elements.get('[data-entry-body]').innerHTML, '');
});
