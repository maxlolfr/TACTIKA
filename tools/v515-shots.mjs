import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v515';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
// V5.15 · Cauchemar lot 3 (copie adaptée de v514-shots) : R4–R6, Vampirique et Venimeux, pilotes Reine puis Briseur.
// V5.14 · Cauchemar lot 2 : parcours réel. Sans épilogue : Cristal verrouillé. Avec épilogue : « Entrer dans le Cauchemar »,
// rechargement, mode réel (même sauvegarde, progression save.cm), boss pilotes verrouillés puis ouverts, combat R1 et boss
// pilote (Titan) avec leur paquet, retour au monde normal. node tools/v514-shots.mjs [dossier]
const vp={width:404,height:900},sv=o=>({v:2,fight:30,lvl:50,xp:0,gold:900,items:[0,1,2,3],z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:10},st:{},up:{},tuto:1,...o});
const ALL={prologue:1,epilogue:1,r12_end:1,r12_end_k:1,r12_pre:1};
async function page(seed,flag){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2});await ctx.addInitScript(([s,f])=>{if(!sessionStorage.getItem('init')){sessionStorage.setItem('init',1);localStorage.setItem('landeTactique1',JSON.stringify(s));if(f)localStorage.setItem('landeTactique1_mode','cm')}},[seed,flag]);
 const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});await pg.goto(BASE);await pg.waitForTimeout(1800);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));return{ctx,pg,errs}}
const expe=pg=>pg.evaluate(async()=>{const H=await import('/src/home.js');H.show('expe');await new Promise(r=>setTimeout(r,300));return document.getElementById('vpanel').innerText});
// 1. sans épilogue
{const{ctx,pg,errs}=await page(sv({storySeen:{prologue:1}}));const t=await expe(pg);ok(/Termine l’histoire/.test(t),'sans épilogue : Cauchemar verrouillé');ok(!/Entrer dans le Cauchemar/.test(t),'sans épilogue : pas de bouton');
 await pg.screenshot({path:OUT+'/1-cristal-verrouille.png'});ok(!errs.length,'sans épilogue : aucune erreur '+errs.join('|'));await ctx.close()}
// 2. avec épilogue : entrée, mode réel, pilotes, combat, retour
{const{ctx,pg,errs}=await page(sv({storySeen:ALL}));let t=await expe(pg);ok(/Entrer dans le Cauchemar/.test(t),'épilogue vu : bouton « Entrer »');await pg.screenshot({path:OUT+'/2-cristal-entrer.png'});
 const z0=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).z);
 await pg.evaluate(()=>[...document.querySelectorAll('#vpanel button')].find(b=>/Entrer dans le Cauchemar/.test(b.textContent)).click());await pg.waitForTimeout(2500);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));
 const m=await pg.evaluate(async()=>{const D=await import('/src/data.js'),S=await import('/src/save.js');return{cm:D.CM_DEV,key:S.KEY,tag:document.getElementById('vtag')?.textContent,u3:S.unlocked(3),u0:S.unlocked(0),p0:S.prog('prairie')}});
 ok(m.cm&&m.cm.real===1,'après rechargement : mode Cauchemar réel');ok(m.key==='landeTactique1','même sauvegarde que la campagne');ok(/☠/.test(m.tag||''),'version marquée ☠ : '+m.tag);
 ok(m.u0&&!m.u3&&m.p0===0,'progression Cauchemar à zéro, région 4 fermée');await pg.screenshot({path:OUT+'/3-village-cauchemar.png'});
 t=await expe(pg);ok(/Campagne du Cauchemar/.test(t)&&/🔒 Reine des marécages/.test(t)&&/1 à 6/.test(t)&&!/Titan prismatique/.test(t),'Cristal : boss pilotes (Reine, Briseur) verrouillés, régions 1 à 6');await pg.screenshot({path:OUT+'/4-cristal-cauchemar.png'});
 // combat R1 étape 1
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.startFight(0,0)});await pg.waitForTimeout(3500);
 for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
 const f=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');return{cm:!!G.F.cm,lvl:G.F.lvl,ch:G.s.units.filter(u=>u.champ).length,el:G.s.units.filter(u=>u.mods&&!u.champ).length}});
 ok(f.cm&&f.lvl===50&&f.ch===1&&f.el===2,`combat R1 : Cauchemar niv. ${f.lvl}, ${f.ch} champion, ${f.el} élites`);await pg.screenshot({path:OUT+'/5-combat-r1.png'});
 // fin des 3 premières régions : la région 4 s'ouvre, pas encore de pilote
 await pg.evaluate(async()=>{const S=await import('/src/save.js'),D=await import('/src/data.js');for(const z of D.ZONES.slice(0,3))S.save.cm.z[z.id]=10;S.store()});
 const o3=await pg.evaluate(async()=>{const S=await import('/src/save.js');return{u3:S.unlocked(3),u6:S.unlocked(6),p:S.cmBossOpen(0)}});ok(o3.u3&&!o3.u6&&!o3.p,'R1–R3 finies : région 4 ouverte, pilotes fermés');
 // combats R4, R5, R6 (étape 3) : niveau 50, 1 champion + 2 élites
 for(const[zi,nm]of[[3,'monts'],[4,'chateau'],[5,'cristal']]){await pg.evaluate(async zi=>{const ui=await import('/src/ui.js');ui.startFight(zi,2)},zi);await pg.waitForTimeout(3500);
  for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
  const f=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');return{cm:!!G.F.cm,lvl:G.F.lvl,pool:G.F.cm?.pool,ch:G.s.units.filter(u=>u.champ).length,el:G.s.units.filter(u=>u.mods&&!u.champ).length}});
  ok(f.cm&&f.lvl===50&&f.ch===1&&f.el===2&&f.pool.includes('vamp')&&f.pool.includes('venin'),`combat R${zi+1} : niv. ${f.lvl}, ${f.ch} champion, ${f.el} élites, affixes ${f.pool}`);await pg.screenshot({path:OUT+`/5-combat-r${zi+1}-${nm}.png`})}
 // boss de la région 6 : Titan prismatique, avec son paquet (ce n'est plus un pilote)
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.save.cm.z.mont=10;S.save.cm.z.chateau=10;S.save.cm.z.cristal=9;S.store();const ui=await import('/src/ui.js');ui.startFight(5,9)});await pg.waitForTimeout(4500);
 for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
 const B=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');const u=G.s.units.find(x=>x.boss);return{n:u.n,rage:u.rageAt,fast:u.cmFast,esc:G.s.units.filter(x=>x.mods).length,pilot:!!G.F.pilot}});
 ok(!B.pilot&&/☠ Titan prismatique/.test(B.n)&&B.rage===.65&&B.fast===1&&B.esc===1,`boss R6 : ${B.n}, phase ${B.rage}, ${B.esc} élite`);await pg.screenshot({path:OUT+'/6-boss-r6-titan.png'});
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.save.cm.z.cristal=10;S.store()});
 const o=await pg.evaluate(async()=>{const S=await import('/src/save.js');return[0,1].map(S.cmBossOpen)});ok(o[0]&&!o[1],'R1–R6 finies : seule la Reine est ouverte');
 t=await expe(pg);ok(/☠ Reine des marécages/.test(t)&&/🔒 Briseur primordial/.test(t),'Cristal : Reine ouverte, Briseur verrouillé');await pg.screenshot({path:OUT+'/7-cristal-reine.png'});
 const z1=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));ok(JSON.stringify(z1.z)===JSON.stringify(z0),'progression normale intacte');ok(z1.cm&&z1.cm.z.prairie===10&&z1.cm.z.cristal===10,'progression Cauchemar enregistrée à part');
 // retour
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.setNightmare(0)});await pg.reload();await pg.waitForTimeout(2000);
 const back=await pg.evaluate(async()=>{const D=await import('/src/data.js');return{cm:D.CM_DEV,tag:document.getElementById('vtag')?.textContent}});ok(!back.cm&&!/☠/.test(back.tag||''),'retour au monde normal : '+back.tag);
 ok(!errs.length,'parcours Cauchemar : aucune erreur JS '+errs.join(' | '));await ctx.close()}
// 3. drapeau posé sans épilogue (sauvegarde modifiée à la main) : ignoré
{const{ctx,pg,errs}=await page(sv({storySeen:{prologue:1}}),1);const c=await pg.evaluate(async()=>(await import('/src/data.js')).CM_DEV);ok(!c,'drapeau sans épilogue : ignoré');await ctx.close()}
// 4. bac à sable ?cauchemar=vamp|venin : élites des deux nouveaux affixes (aura, badge, fiche)
for(const v of ['vamp','venin']){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2}),pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(BASE+'?cauchemar='+v);await pg.waitForTimeout(1800);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.startFight(3,4)});await pg.waitForTimeout(3500);
 for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
 const e=await pg.evaluate(async v=>{const{G}=await import('/src/game.js'),E=await import('/src/elites.js');const u=G.s.units.filter(x=>x.mods&&!x.champ);return{n:u.length,all:u.every(x=>x.mods[0]===v),txt:u[0]&&E.modText(u[0],'fr')[0]}},v);
 ok(e.n===2&&e.all&&e.txt,`bac à sable ${v} : ${e.n} élites, fiche « ${(e.txt||'').slice(0,60)}… »`);await pg.waitForTimeout(800);await pg.screenshot({path:OUT+`/8-elite-${v}.png`});ok(!errs.length,v+' : aucune erreur '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
