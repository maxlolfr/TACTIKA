// Mesures de finition (V5.03) : node tools/perf.mjs [dossier]   — nécessite Chrome et playwright (comme tools/smoke.mjs)
// Pour chaque format (portrait, paysage, presque carré) et 2 combats (Prairie 1 et un combat chargé de la Forteresse de braise) :
// temps de chargement jusqu'au camp, puis jusqu'au combat prêt, images/s moyennes sur 6 s, image la plus longue, % d'images > 33 ms, mémoire JS.
// CPU=4 ralentit le processeur ×4 ; mesure fiable = « script_ms » et « style_ms » par image (coût du code du jeu), les i/s dépendant de la machine.
// Attention : Chrome sans carte graphique (rendu logiciel) : comparer avant/après, pas en valeur absolue avec un téléphone.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/tactika-perf';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const URL0=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--enable-precise-memory-info']});
const VPS={carre:[924,805]};
const FIGHTS={braise:[6,8]};const rows=[];
for(const quality of [0,1,2])for(const[vn,[w,h]]of Object.entries(VPS))for(const[fn,[zi,fi]]of Object.entries(FIGHTS)){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true});
 await ctx.addInitScript(quality=>{localStorage.setItem('landeTactique1',JSON.stringify({v:2,gq:quality,fight:60,lvl:30,xp:0,gold:999,items:[],z:{},st:{},up:{},tuto:1,storySeen:{all:1}}))},quality);
 const pg=await ctx.newPage();const errs=[];const RATE=+(process.env.CPU||1);if(RATE>1){const cdp=await ctx.newCDPSession(pg);await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE})}pg.on('pageerror',e=>errs.push(e.message));
 const t0=Date.now();await pg.goto(URL0);await pg.waitForSelector('.v-go',{timeout:20000});const tCamp=Date.now()-t0;
 const t1=Date.now();
 await pg.evaluate(async([zi,fi])=>{const u=await import('./src/ui.js');await u.startFight(zi,fi)},[zi,fi]);
 for(let i=0;i<6;i++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn');if(e){e.click();return 1}return 0});if(!t)break;await pg.waitForTimeout(200)}
 for(let i=0;i<30;i++){const ready=await pg.evaluate(async()=>{const {G}=await import('/src/game.js');return G.phase==='fight'&&G.cur?.team==='h'&&!!G.endTurnResolve&&!G.busy});if(ready)break;const story=pg.locator('#story .sp'),tuto=pg.locator('#tuto.on .btn').first();if(await story.isVisible())await story.click();else if(await tuto.isVisible())await tuto.click();else await pg.waitForTimeout(500)}
 await pg.waitForFunction(async()=>{const {G}=await import('/src/game.js');return G.phase==='fight'&&G.cur?.team==='h'&&!!G.endTurnResolve&&!G.busy},null,{timeout:45000});
 const tFight=Date.now()-t1;
 const cd=await ctx.newCDPSession(pg);await cd.send('Performance.enable');const g0=Object.fromEntries((await cd.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
 const heapStart=await pg.evaluate(()=>performance.memory?.usedJSHeapSize/1048576||null);
 const m=await pg.evaluate(()=>new Promise(ok=>{const d=[];let l=performance.now();const s=l;const f=t=>{d.push(t-l);l=t;t-s<20000?requestAnimationFrame(f):ok(d)};requestAnimationFrame(f)}).then(d=>{d.shift();const s=d.reduce((a,b)=>a+b,0);return{fps:+(d.length/(s/1000)).toFixed(1),max:Math.round(Math.max(...d)),slow:+(100*d.filter(x=>x>33.4).length/d.length).toFixed(1),mem:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,units:document.querySelectorAll('#tl > *').length}}));
 const g1=Object.fromEntries((await cd.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value])),nf=m.fps*20;m.script_ms=+((g1.ScriptDuration-g0.ScriptDuration)*1000/nf).toFixed(2);m.style_ms=+(((g1.RecalcStyleDuration-g0.RecalcStyleDuration)+(g1.LayoutDuration-g0.LayoutDuration))*1000/nf).toFixed(2);
 await pg.screenshot({path:`${OUT}/${quality}-${vn}-${fn}.png`});
 rows.push({quality,format:vn,combat:fn,camp_ms:tCamp,combat_ms:tFight,...m,heapStart,erreurs:errs.length});await ctx.close()}
await b.close();srv.close();if(rows.some(r=>r.erreurs))process.exitCode=1;console.table(rows);fs.writeFileSync(OUT+'/mesures.json',JSON.stringify(rows,null,1));
