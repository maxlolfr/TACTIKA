import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v522';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
// V5.22 · Cauchemar lot 4 : R7–R9 (carte II), Spectral et Commandant, Reine boss de R9, dernier pilote = Briseur.
const vp={width:404,height:900},sv=o=>({v:2,fight:30,lvl:50,xp:0,gold:900,items:[0,1,2,3],z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:10},st:{},up:{},tuto:1,...o});
const ALL={prologue:1,epilogue:1,r12_end:1,r12_end_k:1,r12_pre:1};
async function page(seed,flag,q='',view=vp){const ctx=await b.newContext({viewport:view,deviceScaleFactor:2});await ctx.addInitScript(([s,f])=>{if(!sessionStorage.getItem('init')){sessionStorage.setItem('init',1);localStorage.setItem('landeTactique1',JSON.stringify(s));if(f)localStorage.setItem('landeTactique1_mode','cm')}},[seed,flag]);
 const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});await pg.goto(BASE+q);await pg.waitForTimeout(1800);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));return{ctx,pg,errs}}
const expe=pg=>pg.evaluate(async()=>{const H=await import('/src/home.js');H.show('expe');await new Promise(r=>setTimeout(r,300));return document.getElementById('vpanel').innerText});
const skip=async pg=>{for(let k=0;k<8;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}};
const fight=async(pg,zi,i)=>{await pg.evaluate(async([zi,i])=>{const ui=await import('/src/ui.js');ui.startFight(zi,i)},[zi,i]);await pg.waitForTimeout(4000);await skip(pg);
 return pg.evaluate(async()=>{const{G}=await import('/src/game.js');const B=G.s.units.find(x=>x.boss);return{cm:!!G.F.cm,lvl:G.F.lvl,pool:G.F.cm?.pool||[],pilot:!!G.F.pilot,ch:G.s.units.filter(u=>u.champ).length,el:G.s.units.filter(u=>u.mods&&!u.champ).length,boss:B&&{n:B.n,rage:B.rageAt}}})};
{const{ctx,pg,errs}=await page(sv({storySeen:ALL,cm:{z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10},st:{},b:{}}}),1);
 const z0=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).z);
 const m=await pg.evaluate(async()=>{const D=await import('/src/data.js'),S=await import('/src/save.js');return{cm:D.CM_DEV,u6:S.unlocked(6),u7:S.unlocked(7),u9:S.unlocked(9),p:S.cmBossOpen(0)}});
 ok(m.cm&&m.cm.real===1&&m.u6&&!m.u7&&!m.u9&&!m.p,'mode réel, R1–R6 finies : région 7 ouverte, 8 fermée, 10 fermée, pilote fermé');
 await pg.evaluate(async()=>{const H=await import('/src/home.js');H.show&&H.show('carte')}).catch(()=>{});await pg.waitForTimeout(900);await pg.screenshot({path:OUT+'/1-village-ou-carte.png'});
 let t=await expe(pg);ok(/1 à 9/.test(t)&&/🔒 Briseur primordial/.test(t)&&!/Reine des marécages/.test(t)&&/Spectrales/.test(t),'Cristal : régions 1 à 9, seul pilote Briseur (verrouillé)');await pg.screenshot({path:OUT+'/2-cristal.png'});
 for(const[zi,nm]of[[6,'braise'],[7,'sables'],[8,'marais']]){if(zi>6)await pg.evaluate(async zi=>{const S=await import('/src/save.js'),D=await import('/src/data.js');S.save.cm.z[D.ZONES[zi-1].id]=10;S.store()},zi);
  const f=await fight(pg,zi,2);ok(f.cm&&f.lvl===50&&f.ch===1&&f.el===2&&f.pool.includes('spectre')&&f.pool.includes('cmdt'),`combat R${zi+1} (${nm}) : niv. ${f.lvl}, ${f.ch} champion, ${f.el} élites, ${f.pool.length} affixes`);await pg.screenshot({path:OUT+`/3-combat-r${zi+1}-${nm}.png`});
  const g=await fight(pg,zi,9);ok(g.cm&&!g.pilot&&g.boss&&/^☠ /.test(g.boss.n),`boss R${zi+1} : ${g.boss&&g.boss.n}, phase ${g.boss&&g.boss.rage}, ${g.el} élite(s)`);await pg.screenshot({path:OUT+`/4-boss-r${zi+1}-${nm}.png`})}
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.save.cm.z.marais=10;S.store()});
 const o=await pg.evaluate(async()=>{const S=await import('/src/save.js');return{p:S.cmBossOpen(0),u9:S.unlocked(9)}});ok(o.p&&!o.u9,'R1–R9 finies : Briseur ouvert, région 10 encore fermée en Cauchemar');
 t=await expe(pg);ok(/☠ Briseur primordial/.test(t),'Cristal : Briseur ouvert');await pg.screenshot({path:OUT+'/5-cristal-briseur.png'});
 const z1=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));ok(JSON.stringify(z1.z)===JSON.stringify(z0),'progression normale intacte');
 ok(!errs.length,'parcours R7–R9 : aucune erreur JS '+errs.join(' | '));await ctx.close()}
for(const[v,view,tag]of[['spectre',vp,'portrait'],['cmdt',vp,'portrait'],['spectre',{width:900,height:404},'paysage']]){const{ctx,pg,errs}=await page(sv({storySeen:ALL}),0,'?cauchemar='+v,view);
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.startFight(6,4)});await pg.waitForTimeout(3800);await skip(pg);
 const e=await pg.evaluate(async v=>{const{G}=await import('/src/game.js'),E=await import('/src/elites.js');const u=G.s.units.filter(x=>x.mods&&!x.champ);return{n:u.length,all:u.every(x=>x.mods[0]===v),txt:u[0]&&E.modText(u[0],'fr')[0]}},v);
 ok(e.n===2&&e.all&&e.txt,`bac à sable ${v} (${tag}) : ${e.n} élites, fiche « ${(e.txt||'').slice(0,55)}… »`);await pg.waitForTimeout(900);await pg.screenshot({path:OUT+`/6-elite-${v}-${tag}.png`});ok(!errs.length,v+' : aucune erreur '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
