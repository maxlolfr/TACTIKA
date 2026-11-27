// Lisibilité (V5.03) : node tools/shots.mjs [dossier] [racine du jeu]
// Ouvre 2 combats par région (6e et 10e), formats portrait et presque carré, attend le tour d'un héros,
// compte les chevauchements d'étiquettes (barres de vie avec icônes d'état, bulles d'attaque, têtes des héros) et fait des captures.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/tactika-shots';
const root=process.argv[3]||path.resolve(new URL('..',import.meta.url).pathname);
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const URL0=`http://localhost:${srv.address().port}/index.html?lis`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const ov=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
const tot={barbar:0,bubbar:0,bubbub:0,bubhead:0,nbub:0,nbar:0,cases:0};const per=[];
for(const[vn,[w,h]]of Object.entries({portrait:[412,915],carre:[924,805]})){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('landeTactique1'))localStorage.setItem('landeTactique1',JSON.stringify({v:2,fight:60,lvl:30,xp:0,gold:999,items:[],z:{},st:{},up:{},tuto:1}))});
 const pg=await ctx.newPage();await pg.goto(URL0);await pg.waitForSelector('.v-go');
 for(let zi=0;zi<12;zi++)for(const fi of[5,9]){
  await pg.evaluate(async([zi,fi])=>{window.__lis=null;const u=await import('./src/ui.js');u.startFight(zi,fi)},[zi,fi]);
  for(let k=0;k<12;k++){await pg.waitForTimeout(450);await pg.evaluate(()=>{for(const s of['.sp','#tuto.on .btn'])document.querySelector(s)?.click()})}
  await pg.waitForTimeout(800);
  const L=await pg.evaluate(()=>window.__lis);if(!L)continue;
  const c={barbar:0,bubbar:0,bubbub:0,bubhead:0,nbub:L.bub.length,nbar:L.bars.length};
  L.bars.forEach((a,i)=>L.bars.slice(i+1).forEach(b=>c.barbar+=ov(a,b)));
  L.bub.forEach((a,i)=>{c.bubbar+=L.bars.filter(b=>ov(a,b)).length;c.bubhead+=L.heads.filter(b=>ov(a,b)).length;c.bubbub+=L.bub.slice(i+1).filter(b=>ov(a,b)).length});
  for(const k in c)tot[k]+=c[k];tot.cases++;per.push({vn,zi,fi,...c});
  if(fi===9||c.barbar+c.bubbar+c.bubhead)await pg.screenshot({path:`${OUT}/${vn}-r${zi+1}-${fi+1}.png`})}
 await ctx.close()}
await b.close();srv.close();fs.writeFileSync(OUT+'/lisibilite.json',JSON.stringify({tot,per},null,1));console.log(JSON.stringify(tot));
