import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v523';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
// V5.23 · Cauchemar lot 5 : R10–R12 (fin de la carte II), Briseur boss de R12, fin du Cauchemar.
const vp={width:404,height:900},sv=o=>({v:2,fight:30,lvl:50,xp:0,gold:900,items:[0,1,2,3],z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:10},st:{},up:{},tuto:1,...o});
const ALL={prologue:1,epilogue:1,r12_end:1,r12_end_k:1,r12_pre:1};
async function page(seed,flag,q='',view=vp){const ctx=await b.newContext({viewport:view,deviceScaleFactor:2});await ctx.addInitScript(([s,f])=>{if(!sessionStorage.getItem('init')){sessionStorage.setItem('init',1);localStorage.setItem('landeTactique1',JSON.stringify(s));if(f)localStorage.setItem('landeTactique1_mode','cm')}},[seed,flag]);
 const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});await pg.goto(BASE+q);await pg.waitForTimeout(1800);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));return{ctx,pg,errs}}
const expe=pg=>pg.evaluate(async()=>{const H=await import('/src/home.js');H.show('expe');await new Promise(r=>setTimeout(r,300));return document.getElementById('vpanel').innerText});
const skip=async pg=>{for(let k=0;k<8;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}};
const fight=async(pg,zi,i)=>{await pg.evaluate(async([zi,i])=>{const ui=await import('/src/ui.js');ui.startFight(zi,i)},[zi,i]);await pg.waitForTimeout(4000);await skip(pg);
 return pg.evaluate(async()=>{const{G}=await import('/src/game.js');const B=G.s.units.find(x=>x.boss);return{cm:!!G.F.cm,lvl:G.F.lvl,pool:G.F.cm?.pool||[],pilot:!!G.F.pilot,ch:G.s.units.filter(u=>u.champ).length,el:G.s.units.filter(u=>u.mods&&!u.champ).length,boss:B&&{n:B.n,rage:B.rageAt}}})};
{const nine={prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10};const{ctx,pg,errs}=await page(sv({storySeen:ALL,cm:{z:{...nine},st:{},b:{}}}),1);
 const z0=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).z);
 const m=await pg.evaluate(async()=>{const D=await import('/src/data.js'),S=await import('/src/save.js');return{cm:D.CM_DEV,u9:S.unlocked(9),u10:S.unlocked(10),pil:D.CM_PILOTS.length,done:S.cmDone()}});
 ok(m.cm&&m.cm.real===1&&m.u9&&!m.u10&&m.pil===0&&!m.done,'mode réel, R1–R9 finies : région 10 ouverte, 11 fermée, aucun pilote, Cauchemar pas fini');
 let t=await expe(pg);ok(/1 à 12/.test(t)&&!/🔒/.test(t)&&!/Cauchemar vaincu/.test(t),'Cristal : régions 1 à 12, plus de pilote');await pg.screenshot({path:OUT+'/1-cristal.png'});
 for(const[zi,nm]of[[9,'citadelle'],[10,'givre'],[11,'eter']]){if(zi>9)await pg.evaluate(async zi=>{const S=await import('/src/save.js'),D=await import('/src/data.js');S.save.cm.z[D.ZONES[zi-1].id]=10;S.store()},zi);
  const f=await fight(pg,zi,2);ok(f.cm&&f.lvl===50&&f.ch===1&&f.el===2&&f.pool.length===8,`combat R${zi+1} (${nm}) : niv. ${f.lvl}, ${f.ch} champion, ${f.el} élites, ${f.pool.length} affixes`);await pg.screenshot({path:OUT+`/2-combat-r${zi+1}-${nm}.png`});
  const g=await fight(pg,zi,9);ok(g.cm&&!g.pilot&&g.boss&&/^☠ /.test(g.boss.n),`boss R${zi+1} : ${g.boss&&g.boss.n}, phase ${g.boss&&g.boss.rage}, ${g.el} élite(s)`);await pg.screenshot({path:OUT+`/3-boss-r${zi+1}-${nm}.png`})}
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.save.cm.z.eter=10;S.save.cm.st.eter=[3,3,2,3,3,3,1,3,3,3];S.store()});
 const o=await pg.evaluate(async()=>{const S=await import('/src/save.js');return S.cmDone()});ok(o,'R1–R12 finies : Cauchemar terminé');
 t=await expe(pg);ok(/Cauchemar vaincu/.test(t)&&/12 régions/.test(t),'Cristal : carte « Cauchemar vaincu » '+(t.match(/\d+ \/ \d+ ★/)||[''])[0]);await pg.screenshot({path:OUT+'/4-cauchemar-vaincu.png'});
 const z1=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));ok(JSON.stringify(z1.z)===JSON.stringify(z0),'progression normale intacte');
 ok(!errs.length,'parcours R10–R12 : aucune erreur JS '+errs.join(' | '));await ctx.close()}
{const z12={prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:10};const St=await import('../src/story.js'),seenAll=Object.fromEntries(Object.keys(St.SC).map(k=>[k,1]));
 const{ctx,pg,errs}=await page(sv({storySeen:seenAll,cm:{z:z12,st:{prairie:[3,3,3,3,3,3,3,3,3,3],eter:[3,2,3,3,3,3,3,3,3,3]},b:{}}}),1);const t=await expe(pg);await pg.waitForTimeout(500);
 ok(/Cauchemar vaincu/.test(t),'carte « Cauchemar vaincu » visible (capture)');await pg.screenshot({path:OUT+'/4b-cauchemar-vaincu.png'});ok(!errs.length,'fin : aucune erreur '+errs.join('|'));await ctx.close()}
{const{ctx,pg,errs}=await page(sv({storySeen:ALL}),0,'?cauchemar',{width:900,height:404});const f=await fight(pg,11,9);ok(f.cm&&f.boss&&/Briseur/.test(f.boss.n),'bac à sable paysage : Briseur R12 '+(f.boss&&f.boss.n));await pg.waitForTimeout(900);await pg.screenshot({path:OUT+'/5-briseur-paysage.png'});ok(!errs.length,'paysage : aucune erreur '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
