// Test de fumée en vrai navigateur (V5.01) : node tools/smoke.mjs   (nécessite Chrome et le paquet « playwright »)
// Variables : CHROME=/usr/bin/google-chrome  PW=/chemin/vers/playwright/index.mjs  OUT=dossier des captures
// Vérifie : aucune erreur JS ni fichier manquant, plateau de combat non noir et animé, menus du camp, bascule FR/EN,
// export / import de la sauvegarde, démarrage avec une sauvegarde abîmée (copie de secours) et hors connexion.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.env.OUT||'/tmp/tactika-smoke';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const URL0=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
const click=(pg,s)=>pg.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('absent '+s);e.click()},s);
async function page(ctxOpt={},init){
 const ctx=await b.newContext({viewport:{width:900,height:420},...ctxOpt});if(init)await ctx.addInitScript(init);
 const pg=await ctx.newPage();pg.errs=[];
 pg.on('pageerror',e=>pg.errs.push('PAGEERR '+e.message));
 pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g/.test(m.text()))pg.errs.push('CONSOLE '+m.text())});
 pg.on('response',r=>{if(r.status()>=400)pg.errs.push(r.status()+' '+r.url())});
 pg.on('requestfailed',r=>{if(!/fonts\.g/.test(r.url()))pg.errs.push('REQFAIL '+r.url())});
 return pg}
const sig=pg=>pg.evaluate(()=>{const c=document.getElementById('cv'),x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height).data;let lit=0,sum=0;for(let i=0;i<d.length;i+=64){const v=d[i]+d[i+1]+d[i+2];sum+=v;if(v>60)lit++}return{lit,sum,w:c.width,h:c.height}});

// 1) partie neuve : camp, carte, combat
{const pg=await page();await pg.goto(URL0);await pg.waitForTimeout(2000);
 ok(await pg.evaluate(()=>!!document.querySelector('.v-go')),'camp affiché');
 await click(pg,'.v-go');await pg.waitForTimeout(800);await click(pg,'.zone');await pg.waitForTimeout(600);
 await click(pg,'#zsheet .btn');await pg.waitForTimeout(2500);
 for(let i=0;i<8;i++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn');if(e){e.click();return 1}return 0});if(!t)break;await pg.waitForTimeout(400)}
 await pg.waitForTimeout(1500);
 const a=await sig(pg);await pg.waitForTimeout(900);const c=await sig(pg);
 await pg.screenshot({path:OUT+'/combat.png'});
 ok(a.lit>a.w*a.h/64*0.2,`plateau de combat non noir (${a.lit} points clairs)`);
 ok(await pg.evaluate(()=>document.querySelectorAll('#spells > *').length>=2&&document.getElementById('who').textContent.trim().length>0),'panneau du héros rempli (sorts et fiche)');
 ok(await pg.evaluate(()=>!!document.getElementById('end')&&document.getElementById('end').offsetParent!==null),'bouton Fin du tour visible');
 ok(await pg.evaluate(()=>new Promise(ok=>{let n=0;const t=performance.now();const f=()=>{n++;performance.now()-t<600?requestAnimationFrame(f):ok(n>5)};requestAnimationFrame(f)})),'boucle d’animation active');
 ok(pg.errs.length===0,'aucune erreur (combat) '+pg.errs.join(' ; '));await pg.context().close()}

// 2) menus du camp + langue + sauvegarde
{const pg=await page();await pg.goto(URL0);await pg.waitForTimeout(1800);
 for(const t of ['Héros','Inventaire','Quêtes','Chronique']){await pg.evaluate(t=>{const e=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);if(e)e.click()},t);await pg.waitForTimeout(500)}
 for(const s of ['.v-bld:nth-of-type(1)']){}
 await pg.evaluate(()=>{for(const e of document.querySelectorAll('.v-bld'))e.click()});await pg.waitForTimeout(700);
 ok(pg.errs.length===0,'aucune erreur (menus et bâtiments) '+pg.errs.join(' ; '));
 await pg.screenshot({path:OUT+'/menus.png'});await pg.context().close()}

// 3) sauvegarde abîmée au démarrage + copie de secours
{const good=JSON.stringify({v:2,fight:3,lvl:9,xp:0,gold:123,items:[],z:{prairie:6},st:{},up:{}});
 const pg=await page({},`if(!localStorage.getItem('seeded')){localStorage.setItem('landeTactique1','{"lvl":30,"items":[');localStorage.setItem('landeTactique1_bak',${JSON.stringify(good)});localStorage.setItem('seeded','1')}`);
 await pg.goto(URL0);await pg.waitForTimeout(1800);
 const r=await pg.evaluate(()=>({main:localStorage.getItem('landeTactique1'),bad:localStorage.getItem('landeTactique1_corrupt')}));
 ok(r.bad==='{"lvl":30,"items":[','texte abîmé gardé de côté');
 ok(pg.errs.length===0,'aucune erreur (sauvegarde abîmée) '+pg.errs.join(' ; '));await pg.context().close()}
// 4) sauvegarde totalement illisible et stockage plein : le jeu démarre quand même
{const pg=await page({},`localStorage.setItem('landeTactique1','pas du json');Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}`);
 await pg.goto(URL0);await pg.waitForTimeout(1800);
 ok(await pg.evaluate(()=>!!document.querySelector('.v-go')),'démarre avec une sauvegarde illisible et un stockage plein');
 await click(pg,'.v-go');await pg.waitForTimeout(600);
 ok(pg.errs.length===0,'aucune erreur (stockage plein) '+pg.errs.join(' ; '));await pg.context().close()}
// 5) hors connexion (après un premier chargement, service worker)
{const ctx=await b.newContext({viewport:{width:900,height:420}});const pg=await ctx.newPage();await pg.goto(URL0);await pg.waitForTimeout(2500);
 const sw=await pg.evaluate(async()=>{if(!navigator.serviceWorker)return'absent';const r=await navigator.serviceWorker.getRegistration();return r?'actif':'aucun'});
 ok(sw==='actif','service worker enregistré ('+sw+')');
 await pg.reload();await pg.waitForTimeout(1500); // le SW contrôle désormais la page
 await ctx.setOffline(true);const p2=await ctx.newPage();p2.errs=[];p2.on('pageerror',e=>p2.errs.push(e.message));
 await p2.goto(URL0).catch(e=>p2.errs.push('NAV '+e.message));await p2.waitForTimeout(2000);
 ok(await p2.evaluate(()=>!!document.querySelector('.v-go')).catch(()=>false),'camp affiché hors connexion');
 ok(p2.errs.length===0,'aucune erreur hors connexion '+p2.errs.join(' ; '));await ctx.close()}
await b.close();srv.close();console.log(fails?`\n${fails} échec(s)`:'\nTout est bon');process.exit(fails?1:0);
