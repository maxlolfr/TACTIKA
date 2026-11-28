// V5.10 · Cauchemar lot 1 : captures des 4 élites en vrai Chrome, par l'accès isolé ?cauchemar=<id>.
// node tools/cauchemar-shots.mjs [dossier]   (Chrome + playwright, comme tools/smoke.mjs)
// Pour chaque élite : combat d'une mission R1–R3, zoom sur l'élite, fiche ouverte (toucher), état mis en scène
// (Berserker sous 50 %, Régénérateur blessé, Explosif amorcé) ; formats Honor plié (portrait) et paysage ; Effets réduits.
// Vérifie aussi : aucune erreur JS, sauvegarde normale jamais écrite, i/s pendant 3 s.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/cauchemar-shots';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
const CASES=[['berserk',1,4],['garde',2,3],['regen',0,6],['bombe',1,2]];
const FMT=[['portrait',{width:404,height:900}],['paysage',{width:900,height:404}]];
const res=[];
for(const[id,zi,i]of CASES)for(const[fn,vp]of FMT)for(const low of fn==='portrait'?[0,1]:[0]){
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2,hasTouch:false});
 await ctx.addInitScript(l=>{try{localStorage.setItem('landeTactique1',JSON.stringify({v:2,fight:1,lvl:3,xp:0,gold:7,items:[],z:{prairie:2},st:{},up:{},storySeen:['prologue','intro']}));if(l)document.documentElement.classList.add('lowfx')}catch(e){}},low);
 const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 await pg.goto(BASE+'?cauchemar='+id);if(process.env.NONF)await pg.evaluate(()=>globalThis.__noNF=1);await pg.waitForTimeout(1800);
 const before=await pg.evaluate(()=>localStorage.getItem('landeTactique1'));
 await pg.evaluate(async([zi,i])=>{document.querySelectorAll('.story,#story,.scene').forEach(e=>e.remove());const ui=await import('/src/ui.js');ui.startFight(zi,i)},[zi,i]);
 await pg.waitForTimeout(3500);
 for(let k=0;k<8;k++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn,.skip');if(e){e.click();return 1}return 0});if(!t)break;await pg.waitForTimeout(300)}
 const st=await pg.evaluate(async([id,low])=>{const{G}=await import('/src/game.js'),R=await import('/src/render.js'),E=await import('/src/elites.js');const S=G.s;if(!S)return{err:'pas de combat'};const u=S.units.find(o=>o.mods);if(!u)return{err:'pas d’élite'};
  if(low)document.documentElement.classList.add('lowfx');
  if(id==='berserk')u.hp=Math.floor(u.max*.45);if(id==='regen'){u.hp=Math.floor(u.max*.6);u.regen=Math.round(u.max*.08)}
  if(id==='bombe'){u.prime={o:{x:u.x,y:u.y},cells:E.boomCells(S,u),r:S.round};u.pm=0}
  if(id==='garde'){const a=S.units.filter(o=>o.team==='m'&&o!==u&&!o.dead);for(const o of a.slice(0,2)){} }
  R.setView(1.9,0,0);const[wx,wy]=R.scr(u.x,u.y);R.setView(1.9,innerWidth/2-wx*1.9,innerHeight*.45-wy*1.9);R.keepInView&&0;
  return{n:u.n,mods:u.mods,x:u.x,y:u.y,hp:u.hp,max:u.max,dmg:u.atk.dmg,allies:S.units.filter(o=>o.team==='m'&&!o.dead).length}},[id,low]);
 if(st.err){ok(false,`${id} ${fn}: ${st.err}`);await ctx.close();continue}
 for(let k=0;k<40;k++){const h=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');return G.cur?.team==='h'&&!G.busy});if(h)break;await pg.waitForTimeout(500)} // attendre le tour d'un héros
 await pg.evaluate(async([x,y])=>{const R=await import('/src/render.js');const[wx,wy]=R.scr(x,y);R.setView(1.9,innerWidth/2-wx*1.9,innerHeight*.45-wy*1.9)},[st.x,st.y]);
 await pg.waitForTimeout(400);
 const p=await pg.evaluate(async([x,y])=>{const R=await import('/src/render.js');const[wx,wy]=R.scr(x,y);return[wx*R.view.z+R.view.x,wy*R.view.z+R.view.y]},[st.x,st.y]);
 await pg.mouse.click(p[0],p[1]-20);await pg.waitForTimeout(350);
 const hint=await pg.evaluate(()=>document.getElementById('hint')?.textContent||'');
 // i/s pendant 3 s
 const fps=await pg.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(Math.round(n/3))};requestAnimationFrame(f)}));
 const file=`${OUT}/cauchemar-${id}-${fn}${low?'-effets-reduits':''}.png`;await pg.screenshot({path:file});
 const after=await pg.evaluate(()=>localStorage.getItem('landeTactique1'));
 ok(!errs.length,`${id} ${fn}${low?' effets réduits':''} : aucune erreur JS${errs.length?' — '+errs.join(' | '):''}`);
 ok(before===after,`${id} ${fn} : sauvegarde normale intacte`);
 ok(/Berserker|Gardien|Régénérateur|Explosif/.test(hint),`${id} ${fn} : fiche « ${hint.slice(0,110)}… »`);
 res.push({id,fn,low,n:st.n,hp:`${st.hp}/${st.max}`,dmg:st.dmg.join('–'),fps,file});await ctx.close()}
console.log(JSON.stringify(res,null,1));await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
