// QA-02: complementary browser scenarios; existing smoke.mjs remains unchanged.
// Run with PW pointing to Playwright index.mjs and CHROME to Chromium.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {chromium}=await import(process.env.PW||'playwright');
const out=process.env.OUT||'/tmp/tactika-qa02';
await fs.mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 const f=p===path.resolve(root)?path.join(root,'index.html'):p;
 if(!f.startsWith(root)) {res.writeHead(403).end();return}
 const data=await fs.readFile(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/index.html';
let browser,fail=0;
const waitHero=p=>p.waitForFunction(async()=>{const {G}=await import('/src/game.js');return G.phase==='fight'&&G.cur?.team==='h'&&!!G.endTurnResolve&&!G.busy},null,{timeout:45000});
async function dismiss(p){
 for(let i=0;i<15;i++){
  const story=p.locator('#story .sp'),tuto=p.locator('#tuto.on .btn').first();
  if(await story.isVisible()){await story.click();continue}
  if(await tuto.isVisible()){await tuto.click();continue}
  if(await p.evaluate(async()=>{const {G}=await import('/src/game.js');return !!G.endTurnResolve&&G.cur?.team==='h'&&!G.busy}))return;
  await p.waitForTimeout(500);
 }
}
async function scenario(name,fn,seed){
 const ctx=await browser.newContext({viewport:{width:915,height:412}});
 const p=await ctx.newPage(),errors=[];
 p.setDefaultTimeout(20000);
 p.on('pageerror',e=>errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 p.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push(r.url()+' '+r.failure()?.errorText)});
 try{
  if(seed)await ctx.addInitScript(s=>{if(!sessionStorage.getItem('qaSeed')){localStorage.setItem('landeTactique1',JSON.stringify(s));sessionStorage.setItem('qaSeed','1')}},seed);
  await p.goto(url);await p.locator('.v-go').waitFor();
  if(await p.locator('#story .sp').isVisible())await p.locator('#story .sp').click();
  await fn(p);assert.deepEqual(errors,[]);
  console.log('PASS '+name);
 }catch(e){fail++;console.error('FAIL '+name,e,errors);await p.screenshot({path:path.join(out,name+'.png')}).catch(()=>{})}
 finally{await ctx.close()}
}
try{
 browser=await chromium.launch({...(process.env.CHROME?{executablePath:process.env.CHROME}:{}),args:['--no-sandbox']});
 await scenario('fresh-first-cast',async p=>{
  await p.locator('.v-go').click();await p.locator('#map.on').waitFor();
  if(!await p.locator('#zsheet.on').isVisible())await p.locator('.zone').first().click();
  await p.locator('#zsheet.on .btn').first().click();
  await p.locator('#tuto.on .btn').first().waitFor();await dismiss(p);await waitHero(p);
  // Read state only; actual selection and targeting go through the visible UI.
  const before=await p.evaluate(async()=>{const {G}=await import('/src/game.js');const {selCells,costOf}=await import('/src/rules.js');const u=G.cur;const id=u.sp.find(id=>u.S[id].dmg&&u.pa>=costOf(u,u.S[id])&&selCells(G.s,u,u.S[id]).some(c=>c.ok&&G.s.units.some(m=>m.team==='m'&&!m.dead&&m.x===c.x&&m.y===c.y)));return {id,index:u.sp.indexOf(id),pa:u.pa,turn:G.turn}});
  assert.ok(before.id,'first hero must have a reachable damaging spell');
  const spell=p.locator('#spells button').nth(before.index);
  await spell.waitFor({state:'visible'});assert.ok(await spell.isEnabled());
  // Tutorial coach pulses continuously; freeze only its CSS animation in this test.
  await p.addStyleTag({content:'.coach { animation-play-state: paused !important; }'});
  await spell.click();
  const target=p.locator('#tl canvas.m.tg').first();await target.click();
  // First click previews, second confirms. Locator resolves again after render.
  await target.click();
  await p.waitForFunction(async b=>{const {G}=await import('/src/game.js');return G.turn===b.turn&&G.cur.pa<b.pa&&!G.busy},before);
  await p.locator('#end').click();
  await p.waitForFunction(async t=>{const {G}=await import('/src/game.js');return G.turn!==t},before.turn);
  await p.reload();await p.locator('.v-go').waitFor();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).tuto),1);
 });
 await scenario('final-boss-first-visit',async p=>{
  // Direct entry via the existing public module, not a campaign navigation test.
  await p.evaluate(()=>{import('/src/ui.js').then(u=>u.startFight(11,9))});
  await p.locator('#story .sp').waitFor();await p.locator('#story .sp').click();
  await p.locator('#tuto.on .btn').first().waitFor();await dismiss(p);await waitHero(p);
  assert.ok(await p.evaluate(async()=>{const {G}=await import('/src/game.js');return G.F.zi===11&&G.F.i===9&&!!G.F.boss&&G.s.units.some(u=>u.team==='m'&&u.boss||u.team==='m'&&u.bs==='breaker')}));
  assert.ok(await p.locator('#spells button:enabled').count()>0);
 },{v:2,lvl:50,xp:0,gold:123,items:[],z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:9},st:{},up:{},tuto:1,lang:'en',team:[4,3,5],storySeen:{prologue:1}});
 await scenario('save-import-reload',async p=>{
  await p.locator('.v-gear').click();await p.getByRole('button',{name:/Sauvegarde/}).click();
  const field=p.locator('#svt');const code=await field.inputValue();assert.ok(code.length>20);
  await field.fill('invalid');await p.getByRole('button',{name:'Importer',exact:true}).click();
  assert.match(await p.locator('#svm').innerText(),/invalide/i);
  await field.fill(code);
  await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Importer',exact:true}).click()]);
  await p.locator('.v-go').waitFor();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).gold),123);
 },{v:2,lvl:9,xp:0,gold:123,items:[],z:{prairie:6},st:{},up:{},tuto:1,storySeen:{prologue:1}});
 for(const win of [true,false])await scenario('synthetic-result-'+(win?'win':'loss'),async p=>{
  await p.evaluate(()=>{import('/src/ui.js').then(u=>u.startFight(0,0))});
  await dismiss(p);await waitHero(p);
  const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));
  // Controlled terminal state, not a real fight: exercise actual result/persistence code.
  await p.evaluate(async win=>{const {G}=await import('/src/game.js');const {end}=await import('/src/turns.js');for(const u of G.s.units)if(u.team===(win?'m':'h')){u.dead=true;u.hp=0}if(win)G.s.killedXp=20;end()},win);
  await p.locator('#result h1').waitFor({state:'visible'});
  const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));
  if(win){assert.ok(after.gold>before.gold);assert.equal(after.z.prairie,1)}
  else{assert.equal(after.gold,before.gold);assert.equal(after.z.prairie||0,before.z.prairie||0)}
  await p.reload();await p.locator('.v-go').waitFor();
  const persisted=await p.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));
  assert.equal(persisted.gold,after.gold);assert.equal(persisted.z.prairie||0,after.z.prairie||0);
 },{v:2,lvl:9,xp:0,gold:123,items:[],z:{prairie:0},st:{},up:{},tuto:1,storySeen:{prologue:1}});
}finally{await browser?.close();await new Promise(r=>server.close(r))}
process.exitCode=fail?1:0;
