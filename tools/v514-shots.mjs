import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v514';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
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
 t=await expe(pg);ok(/Campagne du Cauchemar/.test(t)&&/🔒 Titan prismatique/.test(t),'Cristal : boss pilotes verrouillés');await pg.screenshot({path:OUT+'/4-cristal-cauchemar.png'});
 // combat R1 étape 1
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.startFight(0,0)});await pg.waitForTimeout(3500);
 for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
 const f=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');return{cm:!!G.F.cm,lvl:G.F.lvl,ch:G.s.units.filter(u=>u.champ).length,el:G.s.units.filter(u=>u.mods&&!u.champ).length}});
 ok(f.cm&&f.lvl===50&&f.ch===1&&f.el===2,`combat R1 : Cauchemar niv. ${f.lvl}, ${f.ch} champion, ${f.el} élites`);await pg.screenshot({path:OUT+'/5-combat-r1.png'});
 // fin des 3 régions (progression Cauchemar) puis boss pilote
 await pg.evaluate(async()=>{const S=await import('/src/save.js'),D=await import('/src/data.js');for(const z of D.ZONES.slice(0,3))S.save.cm.z[z.id]=10;S.store()});
 const o=await pg.evaluate(async()=>{const S=await import('/src/save.js');return[0,1,2].map(S.cmBossOpen)});ok(o[0]&&!o[1]&&!o[2],'R1–R3 finies : seul le Titan est ouvert');
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js'),R=await import('/src/rules.js');ui.startFight(5,9,{...R.fightSpec(5,9,5000),pilot:1})});await pg.waitForTimeout(4500);
 for(let k=0;k<6;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}
 const B=await pg.evaluate(async()=>{const{G}=await import('/src/game.js');const u=G.s.units.find(x=>x.boss);return{n:u.n,rage:u.rageAt,fast:u.cmFast,esc:G.s.units.filter(x=>x.mods).length,pilot:G.F.pilot}});
 ok(B.pilot&&/☠ Titan prismatique/.test(B.n)&&B.rage===.65&&B.fast===1&&B.esc===1,`boss pilote : ${B.n}, phase ${B.rage}, ${B.esc} élite`);await pg.screenshot({path:OUT+'/6-boss-titan.png'});
 const z1=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));ok(JSON.stringify(z1.z)===JSON.stringify(z0),'progression normale intacte');ok(z1.cm&&z1.cm.z.prairie===10,'progression Cauchemar enregistrée à part');
 // retour
 await pg.evaluate(async()=>{const S=await import('/src/save.js');S.setNightmare(0)});await pg.reload();await pg.waitForTimeout(2000);
 const back=await pg.evaluate(async()=>{const D=await import('/src/data.js');return{cm:D.CM_DEV,tag:document.getElementById('vtag')?.textContent}});ok(!back.cm&&!/☠/.test(back.tag||''),'retour au monde normal : '+back.tag);
 ok(!errs.length,'parcours Cauchemar : aucune erreur JS '+errs.join(' | '));await ctx.close()}
// 3. drapeau posé sans épilogue (sauvegarde modifiée à la main) : ignoré
{const{ctx,pg,errs}=await page(sv({storySeen:{prologue:1}}),1);const c=await pg.evaluate(async()=>(await import('/src/data.js')).CM_DEV);ok(!c,'drapeau sans épilogue : ignoré');await ctx.close()}
await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
