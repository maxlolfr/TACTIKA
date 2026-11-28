// Ergonomie (V5.09) : node tools/ergo.mjs [dossier] [racine du jeu]
// Captures camp + combat + panneau son ouvert dans 9 formats ; mesure débordements, textes tronqués,
// boutons hors écran / trop petits, chevauchements de cartouches, portraits de frise tronqués,
// et 30 cycles ouverture/fermeture du menu ☰ (10 par ☰, 10 par le chevron, 10 par toucher extérieur). Zones des bâtiments (.v-bld) exclues : leur image déborde exprès de quelques px.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome',OUT=process.argv[2]||'/tmp/tactika-ergo';
const root=process.argv[3]||path.resolve(new URL('..',import.meta.url).pathname);
const {chromium}=await import(PW);fs.mkdirSync(OUT,{recursive:true});
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const URL0=`http://localhost:${srv.address().port}/index.html`;
const F={'honor-plie':[404,900,2.6,1],'honor-plie-pay':[900,404,2.6,1],'honor-deplie':[835,904,2.6,1],'honor-deplie-pay':[904,835,2.6,1],'iphone':[390,844,3,1],'ipad':[820,1180,2,1],'ipad-pay':[1180,820,2,1],'pc-1366':[1366,768,1,0],'pc-1920':[1920,1080,1,0]};
const only=process.env.ONLY?process.env.ONLY.split(','):null;
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
// audit DOM : éléments visibles hors écran, textes tronqués, boutons < 32 px, cartouches qui se chevauchent
const audit=()=>{const W=innerWidth,H=innerHeight,res={out:[],trunc:[],small:[],over:[],tlcut:0,tlfull:0};
 const vis=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1};
 const nm=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')+' «'+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,24)+'»';
 const scrollAnc=e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/(auto|scroll)/.test(s.overflowX+s.overflowY))return p}return null};
 for(const e of document.querySelectorAll('button,a,[data-act],.v-tab,.v-hot,.v-card,input')){if(!vis(e))continue;const r=e.getBoundingClientRect();
  if(!scrollAnc(e)&&!e.classList.contains('v-bld')&&(r.left<-1||r.right>W+1||r.top<-1||r.bottom>H+1))res.out.push(nm(e)+` [${r.left|0},${r.top|0},${r.right|0},${r.bottom|0}]`);
  if(e.tagName!=='INPUT'&&(r.width<32||r.height<32)&&!e.closest('#tl'))res.small.push(nm(e)+` ${r.width|0}x${r.height|0}`)}
 for(const e of document.querySelectorAll('body *')){if(!vis(e)||e.children.length>2)continue;const s=getComputedStyle(e);if(!(e.textContent||'').trim())continue;
  if((s.overflow+s.overflowX).includes('hidden')||s.textOverflow==='ellipsis'){if(e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+3)res.trunc.push(nm(e))}}
 const tl=document.getElementById('tl');if(tl&&vis(tl)){const R=tl.getBoundingClientRect();for(const c of tl.querySelectorAll('canvas,.rg')){if(c.tagName==='CANVAS'&&c.closest('.rg'))continue;const r=c.getBoundingClientRect();if(r.width<2)continue;if(r.right<=R.left+1||r.left>=R.right-1)continue;if(r.left<R.left-1||r.right>R.right+1)res.tlcut++;else res.tlfull++}}
 const cards=[...document.querySelectorAll('.v-hot,.v-tab,.v-card,.v-pin,[class*="v-lbl"]')].filter(vis);
 cards.forEach((a,i)=>cards.slice(i+1).forEach(c=>{const p=a.getBoundingClientRect(),q=c.getBoundingClientRect();if(a.contains(c)||c.contains(a))return;if(p.left<q.right-2&&p.right>q.left+2&&p.top<q.bottom-2&&p.bottom>q.top+2)res.over.push(nm(a)+' × '+nm(c))}));
 // cartouches du village : masqués (par un héros, un PNJ, la colonne de droite) ou hors écran
 res.plates=[];for(const pl of document.querySelectorAll('#camp.on .v-plate')){if(!vis(pl))continue;const r=pl.getBoundingClientRect();let hid=0,n=0;
  for(const[fx,fy]of[[.5,.5],[.2,.5],[.8,.5],[.5,.25],[.5,.75]]){const x=r.left+r.width*fx,y=r.top+r.height*fy;n++;if(x<0||y<0||x>=W||y>=H){hid++;continue}const e=document.elementFromPoint(x,y);if(!e||!(pl.contains(e)||e.closest('.v-plate')===pl))hid++}
  if(hid>1)res.plates.push((pl.textContent||'').trim().slice(0,14)+' '+hid+'/'+n)}
 const nav=document.querySelector('#camp.on .v-nav');if(nav){res.nav=[...nav.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return r.left>=-1&&r.right<=W+1&&r.bottom<=H+1?1:0}).reduce((a,b)=>a+b,0)}
 const dk=document.querySelector('#camp.on .v-dock');if(dk&&vis(dk)){const r=dk.getBoundingClientRect();if(r.top<H*.3)res.dock=Math.round(r.width)+'px='+Math.round(r.width/W*100)+'%'}
 const tp=document.getElementById('top'),pn=document.getElementById('panel');if(tp&&vis(tp)&&pn&&vis(pn)){const t=tp.getBoundingClientRect().bottom,p=pn.getBoundingClientRect(),land=innerWidth>innerHeight;res.board=Math.round((land?p.left*(H-t):W*(p.top-t))/(W*H)*1000)/10;res.topH=Math.round(t);res.panelH=Math.round(land?p.width:H-p.top)}
 return res};
const rep={};
for(const[fn,[w,h,dpr,touch]]of Object.entries(F)){if(only&&!only.includes(fn))continue;
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:!!touch,isMobile:!!touch&&w<1000});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('landeTactique1'))localStorage.setItem('landeTactique1',JSON.stringify({v:2,fight:60,lvl:30,xp:0,gold:999,items:[],z:{},st:{},up:{},tuto:1}))});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(URL0);await pg.waitForSelector('.v-go');await pg.waitForTimeout(900);
 const R={};R.camp=await pg.evaluate(audit);await pg.screenshot({path:`${OUT}/${fn}-camp.png`});
 R.fold=await pg.evaluate(async()=>{const x=document.querySelector('#camp .v-cmdx');if(!x||!x.offsetWidth)return null;const w0=document.querySelector('.v-dock').getBoundingClientRect().width;x.click();await new Promise(r=>setTimeout(r,300));const w1=document.querySelector('.v-dock').getBoundingClientRect().width,o=document.querySelector('.v-cmdo'),go=document.querySelector('.v-go').getBoundingClientRect();return{w0:Math.round(w0),w1:Math.round(w1),reopen:!!o.offsetWidth,go:go.width>40}});
 if(R.fold){R.campFold=await pg.evaluate(audit);await pg.screenshot({path:`${OUT}/${fn}-camp-replie.png`});await pg.evaluate(async()=>{document.querySelector('.v-cmdo').click();await new Promise(r=>setTimeout(r,300))});R.fold.back=await pg.evaluate(()=>Math.round(document.querySelector('.v-dock').getBoundingClientRect().width))}
 await pg.evaluate(async()=>{const u=await import('./src/ui.js');u.startFight(6,9)});
 for(let k=0;k<12;k++){await pg.waitForTimeout(450);await pg.evaluate(()=>{for(const s of['.sp','#tuto.on .btn','#bossi .btn'])document.querySelector(s)?.click()})}
 await pg.waitForTimeout(700);R.combat=await pg.evaluate(audit);await pg.screenshot({path:`${OUT}/${fn}-combat.png`});
 // panneau son : ouvrir (déplier le menu si besoin), capture, puis 10 cycles par mode de fermeture
 const openP=()=>pg.evaluate(()=>{let s=document.getElementById('hson');if(s&&getComputedStyle(s).display==='none'&&!document.body.classList.contains('tmenu'))document.getElementById('tmenu')?.click();if(!s||getComputedStyle(s).display==='none')s=document.getElementById('tmenu');if(!document.getElementById('hvol').classList.contains('on'))s.click();return document.getElementById('hvol').classList.contains('on')?'on':'off'});
 const opener=()=>pg.evaluate(()=>{const s=document.getElementById('hson');const e=s&&getComputedStyle(s).display!=='none'?s:document.getElementById('tmenu');const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
 const isOn=()=>pg.evaluate(()=>document.getElementById('hvol').classList.contains('on'));
 const tlH0=await pg.evaluate(()=>document.getElementById('tl')?.getBoundingClientRect().width|0);if(touch)await pg.evaluate(()=>{document.body.classList.remove('tmenu')});
 R.open=await openP();await pg.waitForTimeout(250);const tlH1=await pg.evaluate(()=>document.getElementById('tl')?.getBoundingClientRect().width|0);R.tlSqueeze=tlH0-tlH1;
 R.panel=await pg.evaluate(()=>{const P=document.getElementById('hvol'),r=P.getBoundingClientRect(),x=P.querySelector('.hx,.hchev');const xr=x?.getBoundingClientRect();return{r:[r.left|0,r.top|0,r.right|0,r.bottom|0],inView:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,close:xr?[xr.width|0,xr.height|0,xr.left>=0&&xr.top>=0&&xr.right<=innerWidth&&xr.bottom<=innerHeight]:null}});
 await pg.screenshot({path:`${OUT}/${fn}-son.png`});
 const cyc={btn:0,x:0,ext:0};
 for(let i=0;i<10;i++){if(await isOn()||await openP()==='on'){const bb=await opener();if(touch)await pg.touchscreen.tap(...bb);else await pg.mouse.click(...bb);await pg.waitForTimeout(80);if(!await isOn())cyc.btn++}}
 for(let i=0;i<10;i++){if(await openP()==='on'){const bb=await pg.evaluate(()=>{const x=document.querySelector('#hvol .hx,#hvol .hchev').getBoundingClientRect();return[x.x+x.width/2,x.y+x.height/2]});if(touch)await pg.touchscreen.tap(...bb);else await pg.mouse.click(...bb);await pg.waitForTimeout(80);if(!await isOn())cyc.x++}}
 for(let i=0;i<10;i++){if(await openP()==='on'){const bb=await pg.evaluate(()=>{const P=document.getElementById('hvol').getBoundingClientRect();return[Math.max(20,P.left/2),Math.min(innerHeight-20,P.bottom+40)]});if(touch)await pg.touchscreen.tap(...bb);else await pg.mouse.click(...bb);await pg.waitForTimeout(80);if(!await isOn())cyc.ext++}}
 R.cycles=cyc;R.audio=await pg.evaluate(async()=>{const a=await import('./src/audio.js');return{vol:a.AU.vol,on:a.AU.on}});
 R.errs=errs;rep[fn]=R;await ctx.close();
 console.log(fn.padEnd(18),'camp out',R.camp.out.length,'nav',R.camp.nav+'/5','cartouches cachés',R.camp.plates.length,'cmd',R.camp.dock,'repli',R.fold?R.fold.w0+'→'+R.fold.w1+'→'+R.fold.back:'-','trunc',R.camp.trunc.length,'over',R.camp.over.length,'| combat out',R.combat.out.length,'trunc',R.combat.trunc.length,'small',R.combat.small.length,'tl',R.combat.tlfull+'/'+R.combat.tlcut,'plateau',R.combat.board+'%','haut',R.combat.topH,'panneau',R.combat.panelH,'| son',R.open,JSON.stringify(cyc),'squeeze',R.tlSqueeze,'| err',errs.length)}
await b.close();srv.close();fs.writeFileSync(OUT+'/ergo.json',JSON.stringify(rep,null,1));
