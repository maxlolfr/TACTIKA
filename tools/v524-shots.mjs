import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/v524';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
// V5.24 · récompenses du Cauchemar : sceaux, titres, trophées à part (aucun gain de puissance).
const vp={width:404,height:900},sv=o=>({v:2,fight:30,lvl:50,xp:0,gold:900,items:[0,1,2,3],z:{prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10,eter:10},st:{},up:{},tuto:1,...o});
const St=await import('../src/story.js'),seenAll=Object.fromEntries(Object.keys(St.SC).map(k=>[k,1]));
async function page(seed,flag,q='',view=vp){const ctx=await b.newContext({viewport:view,deviceScaleFactor:2});await ctx.addInitScript(([s,f])=>{if(!sessionStorage.getItem('init')){sessionStorage.setItem('init',1);localStorage.setItem('landeTactique1',JSON.stringify(s));if(f)localStorage.setItem('landeTactique1_mode','cm')}},[seed,flag]);
 const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});await pg.goto(BASE+q);await pg.waitForTimeout(1800);
 await pg.evaluate(()=>document.querySelectorAll('#story,.story').forEach(e=>e.classList.remove('on')));return{ctx,pg,errs}}
const panel=(pg,t)=>pg.evaluate(async t=>{const H=await import('/src/home.js');H.show(t);await new Promise(r=>setTimeout(r,300));return document.getElementById('vpanel').innerText},t);
const skip=async pg=>{for(let k=0;k<8;k++){const c=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn,#story.on .btn');if(e){e.click();return 1}return 0});if(!c)break;await pg.waitForTimeout(250)}};
// gagne le combat en cours : tous les monstres à terre, puis l'écran de victoire (coffre ouvert)
const winNow=async pg=>{const k=await pg.evaluate(async()=>{const{G,hooks}=await import('/src/game.js');let ch=0,el=0;for(const u of G.s.units)if(u.team==='m'){u.dead=1;u.hp=0;if(u.mods){el++;if(u.champ)ch++}}hooks.result(true);return{ch,el}});
 await pg.waitForTimeout(800);await pg.evaluate(()=>document.querySelector('.chest')?.click());await pg.waitForTimeout(7000);return k};
const fight=async(pg,zi,i)=>{await pg.evaluate(async([zi,i])=>{const ui=await import('/src/ui.js');ui.startFight(zi,i)},[zi,i]);await pg.waitForTimeout(4000);await skip(pg)};
const cmOf=pg=>pg.evaluate(async()=>{const S=await import('/src/save.js');return JSON.parse(JSON.stringify(S.save.cm))});
const z11={prairie:10,bois:10,plage:10,mont:10,chateau:10,cristal:10,braise:10,sables:10,marais:10,citadelle:10,givre:10};
{const{ctx,pg,errs}=await page(sv({storySeen:seenAll,cm:{z:{...z11,eter:9},st:{},b:{}}}),1);
 const before=await pg.evaluate(async()=>{const S=await import('/src/save.js'),R=await import('/src/rules.js');return{gold:S.save.gold,items:S.save.items.length,hp:R.heroStats(S.save,0)}});
 let t=await panel(pg,'expe');ok(/Récompenses du Cauchemar/.test(t)&&/11 \/ 12 sceaux/.test(t)&&/titre : —/.test(t),'Cristal : carte des récompenses, 11 / 12 sceaux, aucun titre');await pg.screenshot({path:OUT+'/1-cristal-recompenses.png'});
 await fight(pg,2,3);const k1=await winNow(pg);let r=await pg.evaluate(()=>document.getElementById('result').innerText);
 ok(/Premier pas dans l’ombre/.test(r)&&/Tueur de champion/.test(r)&&/Nouveau titre/.test(r),`victoire R3 (${k1.ch} champion, ${k1.el} élites) : trophées Cauchemar + titre affichés`);await pg.screenshot({path:OUT+'/2-victoire-trophees.png'});
 let c=await cmOf(pg);ok(c.k.w===1&&c.k.ch===k1.ch&&c.k.el===k1.el&&c.t==='eveille'&&c.tr.cm_eveil&&c.tr.cm_sceau3,'compteurs, titre porté d’office, trophées notés '+JSON.stringify(c.k));
 await fight(pg,11,9);const k2=await winNow(pg);r=await pg.evaluate(()=>document.getElementById('result').innerText);
 ok(/Sceau du Cauchemar/.test(r)&&/12 \/ 12 sceaux/.test(r)&&/Cauchemar vaincu/.test(r)&&/Le Cauchemar est vaincu/.test(r),'boss R12 vaincu : 12e sceau, trophée or « Cauchemar vaincu »');await pg.screenshot({path:OUT+'/3-briseur-sceau.png'});
 c=await cmOf(pg);ok(c.z.eter===10&&c.tr.cm_sceau12&&c.tr.cm_carte1,'progression et trophées : sceau 12');
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.camp()});await pg.waitForTimeout(1000);t=await panel(pg,'chronique');await pg.evaluate(async()=>{const b=[...document.querySelectorAll('#vpanel .ch-tabs button')].find(x=>/Cauchemar/.test(x.textContent));b?.click()});await pg.waitForTimeout(400);
 t=await pg.evaluate(()=>document.getElementById('vpanel').innerText);ok(/12 \/ 12/.test(t)&&/Titres/.test(t)&&/Briseur de Cauchemar/.test(t)&&/Trophées du Cauchemar/.test(t)&&/aucun gain de puissance/.test(t),'Chronique : onglet ☠ Cauchemar (sceaux, titres, trophées)');await pg.screenshot({path:OUT+'/4-chronique-cauchemar.png',fullPage:true});
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#vpanel .v-row')].find(x=>/Briseur de Cauchemar/.test(x.textContent))?.querySelector('button');b?.click()});await pg.waitForTimeout(400);c=await cmOf(pg);ok(c.t==='briseur','titre changé : Briseur de Cauchemar');
 await pg.evaluate(async()=>{const ui=await import('/src/ui.js');ui.camp()});await pg.waitForTimeout(1200);t=await pg.evaluate(()=>[...document.querySelectorAll('.v-cmd')].map(e=>e.textContent).join('|'));ok(/☠ Briseur de Cauchemar/.test(t),'camp : titre porté affiché à côté de l’équipe');await pg.screenshot({path:OUT+'/5-camp-titre.png'});
 const after=await pg.evaluate(async()=>{const S=await import('/src/save.js'),R=await import('/src/rules.js'),a=JSON.parse(JSON.stringify(S.save)),b={...a,cm:{z:a.cm.z,st:a.cm.st,b:{}}};return[0,1,2,3,4,5].every(i=>JSON.stringify(R.heroStats(a,i))===JSON.stringify(R.heroStats(b,i)))});ok(after,'aucun gain de puissance (statistiques du héros identiques)');
 const N=await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));ok(N.cm.t==='briseur'&&N.cm.k.w===2,'sauvegarde écrite (titre, compteurs)');
 ok(!errs.length,'parcours récompenses : aucune erreur JS '+errs.join(' | '));await ctx.close()}
// campagne normale : aucun compteur, aucun trophée Cauchemar, onglet caché sans épilogue
{const{ctx,pg,errs}=await page(sv({storySeen:{prologue:1},z:{prairie:3}}),0);await fight(pg,0,3);await winNow(pg);const c=await cmOf(pg);ok(!Object.keys(c.k).length&&!Object.keys(c.tr).length,'campagne normale : rien compté pour le Cauchemar');
 await panel(pg,'chronique');const t=await pg.evaluate(()=>[...document.querySelectorAll('#vpanel .ch-tabs button')].map(b=>b.textContent).join('|'));ok(!/Cauchemar/.test(t),'campagne normale sans épilogue : pas d’onglet Cauchemar');ok(!errs.length,'normal : aucune erreur '+errs.join('|'));await ctx.close()}
// bac à sable : rien ne se gagne
{const{ctx,pg,errs}=await page(sv({storySeen:seenAll}),0,'?cauchemar');await fight(pg,0,3);await winNow(pg);const c=await cmOf(pg);ok(!c.k.w&&!Object.keys(c.tr).length,'bac à sable : aucun compteur ni trophée');let t=await panel(pg,'expe');ok(/rien ne se gagne/.test(t),'bac à sable : mention claire');ok(!errs.length,'bac à sable : aucune erreur '+errs.join('|'));await ctx.close()}
// anglais, paysage
{const{ctx,pg,errs}=await page(sv({lang:'en',storySeen:seenAll,cm:{z:{...z11,eter:10},st:{},b:{},k:{w:5,ch:2,el:9},tr:{cm_eveil:1},t:'ombre'}}),1,'',{width:900,height:404});const t=await panel(pg,'expe');ok(/Nightmare rewards/.test(t)&&/12 \/ 12 seals/.test(t)&&/Shadow walker/.test(t),'anglais : récompenses traduites');await pg.screenshot({path:OUT+'/6-en-paysage.png'});ok(!errs.length,'anglais : aucune erreur '+errs.join('|'));await ctx.close()}
await b.close();srv.close();console.log(fails?`${fails} échec(s)`:'Tout est OK');process.exit(fails?1:0);
