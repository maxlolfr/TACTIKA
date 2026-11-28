// Ambiances des 12 régions (V5.08) : node tools/ambiances.mjs [dossier]
// Pour chaque région et chaque format : capture du combat, coût du code par image (CDP), chevauchements d'étiquettes (?lis),
// textes tronqués dans le panneau et la barre du haut ; puis mêmes mesures avec « Effets réduits ». Écrit mesures-ambiances.json.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/tactika-amb';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
await new Promise(r=>srv.on('listening',r));
const URL0=`http://localhost:${srv.address().port}/index.html?lis`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--enable-precise-memory-info']});
const VPS=(process.env.VPS?JSON.parse(process.env.VPS):{portrait:[412,915],paysage:[915,412],carre:[924,805]});
const REGS=process.env.REGS?process.env.REGS.split(',').map(Number):[0,1,2,3,4,5,6,7,8,9,10,11];
const MODES=(process.env.MODES||'normal,reduit').split(',');
const FI=+(process.env.FI||8);const rows=[];const ov=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
for(const mode of MODES)for(const[vn,[w,h]]of Object.entries(VPS)){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true});
 await ctx.addInitScript(()=>{localStorage.setItem('landeTactique1',JSON.stringify({v:2,fight:60,lvl:30,xp:0,gold:999,items:[],z:{},st:{},up:{},tuto:1,storySeen:{all:1}}))});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));await pg.goto(URL0);await pg.waitForSelector('.v-go',{timeout:20000});
 if(mode==='reduit')await pg.evaluate(()=>document.documentElement.classList.add('lowfx'));
 const cd=await ctx.newCDPSession(pg);await cd.send('Performance.enable');
 for(const zi of REGS){
  await pg.evaluate(async([zi,fi])=>{window.__lis=null;const u=await import('./src/ui.js');await u.startFight(zi,fi)},[zi,FI]);
  for(let k=0;k<10;k++){await pg.waitForTimeout(350);await pg.evaluate(()=>{for(const s of['#story','.sp','#tuto.on .btn'])document.querySelector(s)?.click()})}
  await pg.waitForTimeout(1500);
  const g0=Object.fromEntries((await cd.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const m=await pg.evaluate(()=>new Promise(ok=>{const d=[];let l=performance.now();const s=l;const f=t=>{d.push(t-l);l=t;t-s<3000?requestAnimationFrame(f):ok(d)};requestAnimationFrame(f)}).then(d=>{d.shift();const sum=d.reduce((a,x)=>a+x,0);return{fps:+(d.length*1000/sum).toFixed(1),max:Math.round(Math.max(...d)),lent:+(100*d.filter(x=>x>33.4).length/d.length).toFixed(1)}}));
  const g1=Object.fromEntries((await cd.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));m.script_ms=+((g1.ScriptDuration-g0.ScriptDuration)*1000/(m.fps*3)).toFixed(2);
  const L=await pg.evaluate(()=>window.__lis);let c={bb:0,ba:0,bh:0,bub:0};
  if(L){L.bars.forEach((a,i)=>L.bars.slice(i+1).forEach(x=>c.bb+=ov(a,x)));L.bub.forEach((a,i)=>{c.ba+=L.bars.filter(x=>ov(a,x)).length;c.bh+=L.heads.filter(x=>ov(a,x)).length;c.bub+=L.bub.slice(i+1).filter(x=>ov(a,x)).length})}
  const tr=await pg.evaluate(()=>{const o=[];for(const el of document.querySelectorAll('#panel *,#top *')){const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).visibility==='hidden')continue;const cs=getComputedStyle(el);
    const clip=cs.overflow!=='visible'||cs.overflowX!=='visible'||cs.textOverflow==='ellipsis';if(clip&&el.children.length===0&&el.textContent.trim()&&(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+2))o.push((el.id||el.className||el.tagName)+': '+el.textContent.trim().slice(0,40))}return o.slice(0,6)});
  rows.push({mode,format:vn,region:zi+1,...m,...c,tronques:tr.length,detail:tr.join(' | ')});
  await pg.screenshot({path:`${OUT}/${mode}-${vn}-R${zi+1}.png`})}
 if(errs.length)rows.push({mode,format:vn,erreurs:errs});await ctx.close()}
await b.close();srv.close();fs.writeFileSync(OUT+'/mesures-ambiances.json',JSON.stringify(rows,null,1));
console.table(rows.filter(r=>r.region).map(({detail,...r})=>r));console.log(rows.filter(r=>r.detail).map(r=>`${r.mode}/${r.format}/R${r.region}: ${r.detail}`).join('\n'));console.log(JSON.stringify(rows.filter(r=>r.erreurs).map(r=>({...r,erreurs:[...new Set(r.erreurs)]}))));
