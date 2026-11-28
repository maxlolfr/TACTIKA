// V5.11 · captures et mesures : village et cartes Cauchemar, champion, réglage graphique Faible / Moyen / Haut.
// node tools/v511-shots.mjs [dossier]   (Chrome + playwright, comme tools/smoke.mjs)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v511-shots';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
const SAVE={v:2,fight:1,lvl:3,xp:0,gold:7,items:[],z:{prairie:2},st:{},up:{},storySeen:['prologue','intro','epilogue']};
const FMT=[['portrait',{width:404,height:900}],['paysage',{width:900,height:404}],['deplie',{width:835,height:904}]];
async function open(vp,q,gq){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2});
 await ctx.addInitScript(([s,gq])=>{try{const o={...s,gq};localStorage.setItem('landeTactique1',JSON.stringify(o));localStorage.setItem('landeTactique1_cauchemar',JSON.stringify({...o,lvl:50}))}catch(e){}},[SAVE,gq]);
 const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)pg.errs.push(r.status()+' '+r.url())});
 await pg.goto(BASE+q);await pg.waitForTimeout(2200);await pg.evaluate(()=>document.querySelectorAll('#story,.story,.scene').forEach(e=>e.classList.remove('on')));return{ctx,pg}}
const fpsOf=pg=>pg.evaluate(()=>new Promise(r=>{let n=0,mx=0,l=performance.now();const t0=l;const f=t=>{n++;mx=Math.max(mx,t-l);l=t;if(t-t0<3000)requestAnimationFrame(f);else r({fps:Math.round(n/3),max:Math.round(mx)})};requestAnimationFrame(f)}));
// 1. village Cauchemar
for(const[fn,vp]of FMT){const{ctx,pg}=await open(vp,'?cauchemar',1);await pg.waitForTimeout(800);
 const v=await pg.evaluate(()=>({img:document.querySelector('.v-img')?.src||'',cry:document.querySelector('.v-cry img')?.src||'',sky:document.querySelector('.v-stage')?.dataset.sky,ok:document.querySelector('.v-cry img')?.naturalWidth>0}));
 await pg.screenshot({path:`${OUT}/village-cauchemar-${fn}.png`});ok(/assets\/cm\/village/.test(v.img)&&/assets\/cm\/crystal/.test(v.cry)&&v.ok&&v.sky==='cm',`village Cauchemar ${fn} (${v.img.split('/').slice(-2).join('/')}, ${v.cry.split('/').pop()})`);
 // carte II Cauchemar
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');document.querySelector('[data-act=go],.v-go,#go')?.click()});
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Partir/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(900);
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#maptabs button')].find(x=>/Carte II/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(1200);
 const m=await pg.evaluate(()=>({src:document.getElementById('worldimg')?.src||'',cls:document.getElementById('map').className,z:document.querySelectorAll('#mapz .zone').length}));
 await pg.evaluate(()=>document.getElementById('zsheet')?.classList.remove('on'));
 await pg.screenshot({path:`${OUT}/carte2-cauchemar-${fn}.png`});ok(/cm\/world2-l/.test(m.src)&&/cm2/.test(m.cls)&&m.z===6,`carte II Cauchemar ${fn} (${m.z} régions)`);
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#maptabs button')].find(x=>/Carte I\b/.test(x.textContent)&&!/II/.test(x.textContent));b&&b.click()});await pg.waitForTimeout(800);
 await pg.screenshot({path:`${OUT}/carte1-cauchemar-${fn}.png`});
 ok(!pg.errs.length,`village + cartes ${fn} : aucune erreur${pg.errs.length?' — '+pg.errs.join(' | '):''}`);await ctx.close()}
// 2. champion + niveaux graphiques ; 3. combat normal aux 3 niveaux
const res=[];
for(const[q,zi,i,tag]of[['?cauchemar',1,3,'cauchemar'],['',0,1,'normal']])for(const[fn,vp]of FMT.slice(0,2))for(const gq of[0,1,2]){
 const{ctx,pg}=await open(vp,q,gq);
 await pg.evaluate(async([zi,i])=>{const ui=await import('/src/ui.js');ui.startFight(zi,i)},[zi,i]);await pg.waitForTimeout(3500);
 for(let k=0;k<8;k++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn,.skip');if(e){e.click();return 1}return 0});if(!t)break;await pg.waitForTimeout(300)}
 for(let k=0;k<40;k++){const h=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');return G.cur?.team==='h'&&!G.busy});if(h)break;await pg.waitForTimeout(500)}
 const st=await pg.evaluate(async()=>{const{G}=await import('/src/game.js'),R=await import('/src/render.js');const u=G.s.units.find(o=>o.champ)||G.cur;const[wx,wy]=R.scr(u.x,u.y);if(G.s.units.some(o=>o.champ))R.setView(1.7,innerWidth/2-wx*1.7,innerHeight*.45-wy*1.7);
  return{ch:G.s.units.filter(o=>o.champ).map(o=>o.n),el:G.s.units.filter(o=>o.mods&&!o.champ).length,dpr:R.dpr,cls:document.documentElement.className,x:u.x,y:u.y}});
 await pg.waitForTimeout(500);
 if(st.ch.length){const p=await pg.evaluate(async([x,y])=>{const R=await import('/src/render.js');const[wx,wy]=R.scr(x,y);return[wx*R.view.z+R.view.x,wy*R.view.z+R.view.y]},[st.x,st.y]);await pg.mouse.click(p[0],p[1]-20);await pg.waitForTimeout(350)}
 const hint=await pg.evaluate(()=>document.getElementById('hint')?.textContent||'');
 const f=await fpsOf(pg);const file=`${OUT}/combat-${tag}-${fn}-gq${gq}.png`;await pg.screenshot({path:file});
 if(tag==='cauchemar'){ok(st.ch.length===1&&st.el===2,`${fn} gq${gq} : 1 champion (${st.ch[0]}) + ${st.el} élites`);ok(/CHAMPION/.test(hint),`${fn} gq${gq} : fiche champion`)}
 ok(!pg.errs.length,`${tag} ${fn} gq${gq} : aucune erreur${pg.errs.length?' — '+pg.errs.join(' | '):''}`);
 res.push({tag,fn,gq,dpr:+st.dpr.toFixed(2),lowfx:/lowfx/.test(st.cls),hi:/gfxhi/.test(st.cls),...f});await ctx.close()}
console.table(res);await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
