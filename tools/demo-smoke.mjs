// Démo publique (V5.33) : node tools/demo-smoke.mjs [dossier]   (Chrome + paquet « playwright », comme smoke.mjs)
// Vérifie ?demo en vrai navigateur : aucune erreur, mention DÉMO, régions 3+ verrouillées « Version complète »,
// partie complète jamais lue, jeu normal (sans ?demo) inchangé ; fait les captures pour la fiche de vente.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/tactika-demo';
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
await new Promise(r=>srv.on('listening',r));
const BASE=`http://localhost:${srv.address().port}/index.html`;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'ECHEC ')+m);if(!c)fails++};
const click=(pg,s)=>pg.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('absent '+s);e.click()},s);
async function page(vp,init){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2});if(init)await ctx.addInitScript(init);
 const pg=await ctx.newPage();pg.errs=[];
 pg.on('pageerror',e=>pg.errs.push('PAGEERR '+e.message));
 pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g/.test(m.text()))pg.errs.push('CONSOLE '+m.text())});
 pg.on('response',r=>{if(r.status()>=400)pg.errs.push(r.status()+' '+r.url())});
 return pg}
const FULL=JSON.stringify({v:2,fight:3,lvl:30,xp:0,gold:999,items:[],z:{prairie:10,bois:10,cote:10,monts:10},st:{},up:{},tuto:1,storySeen:{epilogue:1}});
const seedFull=`if(!localStorage.getItem('seeded')){localStorage.setItem('landeTactique1',${JSON.stringify(FULL)});localStorage.setItem('seeded','1')}`;

// 1) démo, portrait, avec une partie complète présente dans le navigateur
{const pg=await page({width:412,height:915},seedFull);await pg.goto(BASE+'?demo');await pg.waitForSelector('.v-go',{timeout:20000});await pg.waitForTimeout(1500);
 ok(await pg.evaluate(()=>document.getElementById('vtag')?.textContent.includes('DÉMO')),'pastille de version « DÉMO » visible');
 ok(await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')).lvl===30),'la partie complète du navigateur est intacte');
 await pg.screenshot({path:OUT+'/demo-camp.png'});
 await click(pg,'.v-go');await pg.waitForTimeout(900);
 const zones=await pg.evaluate(()=>[...document.querySelectorAll('.zone')].map(z=>({lock:z.classList.contains('lock'),t:z.textContent.trim()})));
 ok(zones.length>=6,'carte I : '+zones.length+' régions');
 ok(!zones[0].lock&&!zones[1].lock||!zones[0].lock,'région 1 ouverte');
 ok(zones.slice(2).every(z=>z.lock&&/Version complète/.test(z.t)),'régions 3+ verrouillées « Version complète » : '+JSON.stringify(zones.slice(2).map(z=>z.t)));
 await pg.screenshot({path:OUT+'/demo-carte.png'});
 await pg.evaluate(()=>{const z=document.querySelectorAll('.zone')[2];if(z)z.click()});await pg.waitForTimeout(500);
 ok(await pg.evaluate(()=>/version complète/i.test(document.body.innerText)),'toucher une région verrouillée explique la démo');
 await pg.screenshot({path:OUT+'/demo-region-verrouillee.png'});
 ok(pg.errs.length===0,'aucune erreur (démo, carte) '+pg.errs.join(' ; '));await pg.context().close()}

// 2) démo, combat de la région 1 (paysage)
{const pg=await page({width:915,height:412});await pg.goto(BASE+'?demo');await pg.waitForSelector('.v-go',{timeout:20000});await pg.waitForTimeout(1200);
 ok(await pg.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1_demo')||'{"lvl":1}').lvl===1),'démo : partie neuve, sauvegarde à part');
 await click(pg,'.v-go');await pg.waitForTimeout(800);await click(pg,'.zone');await pg.waitForTimeout(600);await click(pg,'#zsheet .btn');await pg.waitForTimeout(2500);
 for(let i=0;i<8;i++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto.on .btn');if(e){e.click();return 1}return 0});if(!t)break;await pg.waitForTimeout(400)}
 await pg.waitForTimeout(1500);await pg.screenshot({path:OUT+'/demo-combat.png'});
 ok(await pg.evaluate(()=>!!document.getElementById('end')&&document.getElementById('end').offsetParent!==null),'combat lancé depuis la démo');
 ok(pg.errs.length===0,'aucune erreur (démo, combat) '+pg.errs.join(' ; '));await pg.context().close()}

// 3) jeu normal avec la même partie complète : régions 3+ ouvertes, pas de mention DÉMO
{const pg=await page({width:412,height:915},seedFull);await pg.goto(BASE);await pg.waitForSelector('.v-go',{timeout:20000});await pg.waitForTimeout(1500);
 ok(await pg.evaluate(()=>!document.getElementById('vtag')?.textContent.includes('DÉMO')),'jeu normal : pas de « DÉMO »');
 await click(pg,'.v-go');await pg.waitForTimeout(900);
 const z=await pg.evaluate(()=>[...document.querySelectorAll('.zone')].map(e=>e.classList.contains('lock')));
 ok(!z[2],'jeu normal : région 3 ouverte');ok(pg.errs.length===0,'aucune erreur (jeu normal) '+pg.errs.join(' ; '));await pg.context().close()}
await b.close();srv.close();console.log(fails?fails+' ÉCHEC(S)':'TOUT EST OK');process.exit(fails?1:0);
