// Audit de la traduction anglaise (V5.01) : node tools/en-audit.mjs  (Chrome + playwright requis, voir tools/smoke.mjs)
// Ouvre le jeu en anglais sur une partie avancée, visite les écrans et liste les textes affichés qui restent en français.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome';
const {chromium}=await import(PW);const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1000,height:520}});
await ctx.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('landeTactique1',JSON.stringify({v:2,fight:9,lvl:30,xp:0,gold:5000,items:[],z:{prairie:10,bois:10,cote:10,monts:10,chateau:3},st:{},up:{},lang:'en',tuto:1}))}});
const pg=await ctx.newPage();await pg.goto(`http://localhost:${srv.address().port}/index.html`);await pg.waitForTimeout(2500);
const FR=/[éèêàâçùûôîï«»…]|\b(le|la|les|des|du|de|ton|ta|tes|tu|pour|avec|dans|sur|une?|et|ou|qui|que|ce|cette|ces|est|sont|pas|plus|niveau|étape|héros|quête|combat|tour|dégâts)\b/i;
const seen=new Map();
const grab=async tag=>{const t=await pg.evaluate(()=>{const o=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const e=n.parentElement;if(!e||!e.offsetParent||/SCRIPT|STYLE/.test(e.tagName))continue;const s=n.textContent.trim();if(s.length>1)o.push(s)}for(const e of document.querySelectorAll('[title]'))if(e.offsetParent)o.push(e.title);return o});for(const s of t)if(FR.test(s)&&!seen.has(s))seen.set(s,tag)};
const click=(sel,txt)=>pg.evaluate(([s,t])=>{const l=[...document.querySelectorAll(s)].filter(e=>!t||e.textContent.includes(t));if(l[0])l[0].click();return l.length},[sel,txt]);
await grab('camp');
for(const t of ['Heroes','Inventory','Quests','Chronicle']){await click('button',t);await pg.waitForTimeout(500);await grab(t);await pg.evaluate(()=>{const e=document.querySelector('.ov.on .hx,#hx,.hx');if(e)e.click()});await pg.waitForTimeout(250)}
const n=await pg.evaluate(()=>document.querySelectorAll('.v-bld').length);
for(let i=0;i<n;i++){await pg.evaluate(i=>document.querySelectorAll('.v-bld')[i].click(),i);await pg.waitForTimeout(700);await grab('bâtiment '+i);await pg.evaluate(()=>{for(const e of document.querySelectorAll('button')){if(/^(Back|Close|Camp|⛺ Camp)/.test(e.textContent.trim())&&e.offsetParent){e.click();break}}});await pg.waitForTimeout(300)}
await click('.v-go');await pg.waitForTimeout(700);await grab('carte');
for(const z of [0,5]){await pg.evaluate(z=>{const e=document.querySelectorAll('.zone')[z];if(e)e.click()},z);await pg.waitForTimeout(400);await grab('zone '+z)}
await b.close();srv.close();
console.log(`${seen.size} texte(s) suspect(s) (accents ou mots français restants en anglais) :`);for(const [s,t] of seen)console.log(`[${t}] ${s.slice(0,140)}`);
