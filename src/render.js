// Rendu : canvas du combat (sol, décors, unités, effets, particules) et images de l'atlas.
import {G} from './game.js';
import {$} from './util.js';
import {DEC,DECO_W,CMAX,R,ZONES,MON,THEMES} from './data.js';
import {K,mulberry,pick,cell,occ,pushPlan,prismOn,prismHits,prismDmg,man} from './rules.js';

export const cv=$('cv'),ctx=cv.getContext('2d');
export let AT=null;export const IMG={};
// anciennes planches gardées pour legacy/ et comme références, inutiles ici
// planches au nouveau style (boss et monstres refaits) : 6 cases (+4 de marche pour les monstres)
const BS=['knightB','knightR','knightN','roiG','golemK','crabK','wolfK','knightK','slimeN','boarN','batN','wolfN','shroomN','crabN','gullN','golemN','goblinN','ghostN','skelN','crygolem','qspider','prisbat'];
const OLD=['tiles','tiles2','tiles3','aelisX','aelisB','fennX','fennB','kaelW','kaelX','kaelK','warrior','archer','healer','kaelF','kaelB','kaelP','fennF','fennP','aelisF','aelisP'];
// V4.0a : les planches de monstres (MS) ne sont chargées que pour la zone où l'on combat ; celles des autres zones sont libérées
const MS=new Set(),LD={};
function load(n){return IMG[n]?Promise.resolve():LD[n]||(LD[n]=new Promise((ok,ko)=>{const i=new Image();i.onload=()=>{IMG[n]=i;delete LD[n];ok()};i.onerror=()=>{delete LD[n];ko(n)};i.src='assets/'+n+'.webp'}))}
export async function loadAssets(){
 AT=await(await fetch('assets/atlas.json')).json();
 for(const k of[...Object.values(MON).map(m=>m.s),...ZONES.map(z=>z.boss.s)])for(const n of[k,k+'m',k+'w'])if(AT[n])MS.add(n);
 for(const t of THEMES)if(t.ts)MS.add(t.ts); // sols par région : chargés aussi à l'entrée de la zone
 await Promise.all(Object.keys(AT).filter(n=>!OLD.includes(n)&&!MS.has(n)).map(load));
}
export function zoneAssets(F){const want=new Set([THEMES[F.th].ts].filter(Boolean));for(const k of[...F.pool,...(F.en||[]),F.elite,F.boss&&F.boss.k].filter(Boolean))want.add(MON[k].s);if(F.boss&&F.boss.s)want.add(F.boss.s);
 for(const n of[...want])for(const v of[n+'m',n+'w'])if(AT[v])want.add(v);
 for(const n of MS)if(!want.has(n))delete IMG[n];return Promise.all([...want].map(load))}

// ---------- images ----------
export function drawF(c,s,i,x,y,sc,flip,alpha){const f=AT[s][i];c.save();c.globalAlpha=alpha??1;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(IMG[s],f[0],f[1],f[2],f[3],-f[4]*sc,-f[5]*sc,f[2]*sc,f[3]*sc);c.restore()}
const UIC={};export function uiURL(i){if(UIC[i])return UIC[i];const f=AT.ui[i],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.ui,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return UIC[i]=c.toDataURL()}
export function logoURL(){const f=AT.logo[0],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.logo,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return c.toDataURL()}
export function skin(){const st=document.createElement('style');st.textContent=`.btn{background:url(${uiURL(5)}) center/100% 100% no-repeat;box-shadow:none;border-radius:0;text-shadow:0 1px 0 #fff6;padding:14px 22px}.btn:active{background-image:url(${uiURL(7)})}
 .btn.dark{background-image:url(${uiURL(10)});color:#f3ead8;text-shadow:0 1px 2px #000}
 .btn.dark{padding:12px 28px}#top .btn{background:#2a1b10dd;border:1px solid #7a5a32;border-radius:10px;padding:6px 9px;color:#f3ead8}
 #panel{background:url(${uiURL(11)}) center/100% 100% no-repeat,#2a1b10;border-top:0}`;document.head.appendChild(st)}
export function icon(s,i,px,top){const cv=document.createElement('canvas'),d=2;cv.width=cv.height=px*d;const c=cv.getContext('2d'),f=AT[s][i];
 const sh=top?f[3]*top:f[3],k=Math.min(px*d/f[2],px*d/sh),paint=()=>c.drawImage(IMG[s],f[0],f[1],f[2],sh,(px*d-f[2]*k)/2,(px*d-sh*k)/2,f[2]*k,sh*k);
 IMG[s]?paint():load(s).then(paint,()=>{});return cv} // planche pas encore chargée : l'icône se dessine à son arrivée
// Hauteur de référence du sprite de chaque unité (sert à les mettre à l'échelle).
export function addRefs(units){for(const u of units)u.ref=u.team==='h'?AT[HN[u.k].i[0]][HN[u.k].i[1]][3]:AT[u.s][u.row*3][3]}

// ---------- géométrie ----------
export let W,H,dpr,TW,TH,ox,oy;
let hudB=0; // bas de la barre du haut (frise des tours)
// places essayées pour une bulle d'attaque : [colonnes, rangées] autour de sa place normale, les plus proches d'abord
const SPOTS=[[0,0],[0,-1],[-1,0],[1,0],[-1,-1],[1,-1],[0,-2],[0,1],[-1,1],[1,1],[-2,0],[2,0],[-1,-2],[1,-2],[-2,-1],[2,-1]];
const ISO=.70; // hauteur d'une case / largeur (0,5 = isométrie classique) : vue plongeante (V3.2), les sols sont étirés, pas les personnages
const US=.93;  // taille des personnages par rapport à leur hauteur de base (V3.2 : un peu réduits pour moins se cacher)
const hgt=u=>u.h*TW*US; // hauteur d'une unité à l'écran
// décors posés sur le plateau : réduits pour ne plus cacher les héros (les grands le plus)
const DK={0:.74,1:.76,8:.76,9:.72,10:.6,20:.8}
// V : plateau pivoté d'un quart de tour (téléphone couché) : héros à gauche, ennemis à droite, cases plus grandes
export let V=false;
export const depth=(x,y)=>V?x-y:x+y; // profondeur à l'écran (ordre de dessin)
const lat=(x,y)=>V?-x-y:x-y;        // position horizontale à l'écran
export function scr(x,y){return[ox+lat(x,y)*TW/2,oy+depth(x,y)*TH/2]}
let ground=null,outer=[];
export function layout(){
 const box=cv.getBoundingClientRect();W=box.width||innerWidth;H=box.height||innerHeight;dpr=Math.min(devicePixelRatio||1,3);cv.width=W*dpr;cv.height=H*dpr;
 const side=matchMedia('(orientation:landscape)').matches,P=$('panel').getBoundingClientRect(),pad=(id,k)=>parseFloat(getComputedStyle($(id))[k])||0;
 const top=$('top').getBoundingClientRect().bottom;hudB=top;
 // paysage : le panneau est une colonne à droite ; on retire les zones sûres (encoche à gauche, barre du bas)
 const x0=side?pad('top','paddingLeft')-10:0,x1=side?P.left:W,bot=side?H-Math.max(4,pad('panel','paddingBottom')-8):P.top,avail=bot-top;
 const fit=v=>Math.min((x1-x0)/((v?R/2+1:CMAX+1)+.3),avail/((v?CMAX+1:R/2+1)*ISO+(v?1:1.05)),130); // V4.0.5 : moins de marge réservée au-dessus du plateau
 V=side&&fit(true)>fit(false)*1.05;TW=fit(V);TH=TW*ISO;
 const rows=V?CMAX+1:R/2+1,bh=rows*TH+1.1*TW,mid=R/4; // case centrale (mid,mid)
 ox=(x0+x1)/2-lat(mid,mid)*TW/2;oy=top+(avail-bh)/2+1.1*TW+rows*TH/2-depth(mid,mid)*TH/2;
 if(G.s.map.size)buildGround();
}
// numéro de tuile du jeu (data.js) -> case de la planche tiles4
const T4=[0,2,12,13,15,14,3,8,4,5,6,7,8,9,10,11];
function diamond(c,x,y,s=1){c.beginPath();c.moveTo(x,y-TH/2*s);c.lineTo(x+TW/2*s,y);c.lineTo(x,y+TH/2*s);c.lineTo(x-TW/2*s,y);c.closePath()}
const BGZ=['prairie','bois','plage','mont','chateau','cristal'],BG={};
const BGA={cristal:'mont'}; // fond provisoire des Cavernes tant que G-14/G-15 ne sont pas dans le jeu (teinté en violet)
// chaque zone a deux peintures : <zone>.webp (verticale) et <zone>-l.webp (écran plus large que haut)
function bgOf(){const z=G.F&&ZONES[G.F.zi].id;if(!BGZ.includes(z))return null;const id=(BGA[z]||z)+(W>H?'-l':'');
 if(!(id in BG)){for(const k in BG)delete BG[k]; // un seul fond en mémoire
  BG[id]=null;const i=new Image();i.onload=()=>{BG[id]=i;if(G.s.map.size&&G.F&&ZONES[G.F.zi].id===z)buildGround()};i.src='assets/bg/'+id+'.webp'}return BG[id]}
function buildGround(){const S=G.s,theme=S.theme,bg=bgOf();
 ground=document.createElement('canvas');ground.width=W*dpr;ground.height=H*dpr;const g=ground.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 g.fillStyle='#16220f';g.fillRect(0,0,W,H);
 if(bg){const k=Math.max(W/bg.width,H/bg.height);g.imageSmoothingQuality='high';g.drawImage(bg,(W-bg.width*k)/2,(H-bg.height*k)/2,bg.width*k,bg.height*k);g.fillStyle=theme.cave?'rgba(26,8,64,.5)':'rgba(0,0,0,.34)';g.fillRect(0,0,W,H)}
 // périphérie assombrie : le regard va au plateau
 {const[cx,cy]=scr(R/4,R/4),rad=Math.max(W,H)*.75,v=g.createRadialGradient(cx,cy,TW*2.5,cx,cy,rad);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=v;g.fillRect(0,0,W,H)}
 const r0=Math.floor(-oy/(TH/2))-2,r1=Math.ceil((H-oy)/(TH/2))+2,c0=Math.floor(-ox/(TW/2))-2,c1=Math.ceil((W-ox)/(TW/2))+2,rr=mulberry(G.F.seed*13);outer=[];
 // tuiles calmes (planche TU-02 de Max, tiles4) : ancrées sur les coins gauche/droit de la face du dessus ; miroir et deux herbes au hasard contre la répétition
 // thème avec sa propre planche (ts, ex. tiles5 des Cavernes) : numéros de tuile = cases de la planche
 const tl=(t,sx,sy,m,old)=>{const ts=theme.ts&&!old?theme.ts:'tiles4',f=ts!=='tiles4'?AT[ts][t]:AT.tiles4[t===0&&m?1:T4[t]],kx=TW*1.035/f[2],ky=TH*1.035/(2*f[5]);g.save();g.translate(sx,sy);if(m&&(ts!=='tiles4'||t!==14&&t!==15))g.scale(-1,1);g.drawImage(IMG[ts],f[0],f[1],f[2],f[3],-f[4]*kx,-f[5]*ky,f[2]*kx,f[3]*ky);g.restore()};
 const flipAt=(x,y)=>((x*7349+y*9151)>>>2)&1;
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){if((r+c)&1)continue;const a=(r+c)/2,b=(r-c)/2,x=V?b:a,y=V?-a:b,[sx,sy]=scr(x,y),m=cell(S,x,y);
  if(m){tl(m.t,sx,sy,flipAt(x,y),m.water||m.block&&m.d==null&&!m.cry&&m.t===8);if(m.t<2&&!theme.ts){diamond(g,sx,sy);g.fillStyle='rgba(8,24,0,.12)';g.fill()} // herbe un peu calmée : les personnages ressortent
  if((x+y)&1){diamond(g,sx,sy);g.fillStyle='rgba(0,0,0,.08)';g.fill()}}else if(!bg){const t=theme.g[Math.floor(rr()*theme.g.length)];tl(theme.ts||t!==4&&t!==8?t:theme.g[0],sx,sy,flipAt(x,y));diamond(g,sx,sy,1.02);g.fillStyle='rgba(8,14,6,.55)';g.fill();
   const dist=Math.max(Math.abs(x-y)-CMAX,-x-y,x+y-R);if(dist>=2&&rr()<.1)outer.push({x,y,d:pick(rr,theme.out||(dist>2&&rr()<.12?[10,9,11]:[0,1,1,2,0,4,7]))})}}
 for(const m of S.map.values())if(m.flower){const[sx,sy]=scr(m.x,m.y);const f=AT.deco[5];drawF(g,'deco',5,sx,sy+TH*.1,TW*.7/f[2])}
 // liseré du plateau
 for(const m of S.map.values()){const[sx,sy]=scr(m.x,m.y);diamond(g,sx,sy,.98);g.strokeStyle='rgba(20,28,10,.5)';g.lineWidth=1.5;g.stroke();diamond(g,sx,sy,.9);g.strokeStyle='rgba(255,240,200,.14)';g.lineWidth=1;g.stroke()}
 // case infranchissable avec un décor : fond sombre et ombre au pied (l'eau et la roche ont déjà leur tuile)
 // cases amplifiées : contour turquoise en tirets et chevron montant (lisible sans la couleur)
 for(const m of S.map.values())if(m.cry==='a')for(const p of prismHits(S,m)){const c=cell(S,p.x,p.y);if(c.block||c.water)continue;const[sx,sy]=scr(p.x,p.y);
  diamond(g,sx,sy,.8);g.fillStyle='rgba(60,230,215,.16)';g.fill();g.setLineDash([5,4]);g.strokeStyle='rgba(120,255,240,.85)';g.lineWidth=2;g.stroke();g.setLineDash([]);chevron(g,sx,sy,TW*.09)}
 for(const m of S.map.values())if(m.block&&m.d!=null){const[sx,sy]=scr(m.x,m.y);diamond(g,sx,sy,.94);g.fillStyle='rgba(12,14,6,.42)';g.fill();g.beginPath();g.ellipse(sx,sy+TH*.12,TW*.34,TH*.26,0,0,7);g.fillStyle='rgba(0,0,0,.4)';g.fill()}
}
function chevron(c,x,y,z){c.beginPath();c.moveTo(x-z,y+z*.2);c.lineTo(x,y-z*.7);c.lineTo(x+z,y+z*.2);c.lineWidth=2.5;c.strokeStyle='rgba(220,255,250,.9)';c.stroke()}
// cristaux dessinés par le code (en attendant C6-09) : turquoise = éclats dressés, violet = losange taillé ; éteint = gris et tours restants
function shard(c,x,y,w,h,col){c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x-w/2,y-h*.75);c.lineTo(x,y-h);c.lineTo(x+w/2,y-h*.75);c.lineTo(x+w/2,y);c.closePath();
 const g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,col[0]);g.addColorStop(.5,col[1]);g.addColorStop(1,col[2]);c.fillStyle=g;c.fill();c.strokeStyle='#2a1b10';c.lineWidth=2;c.stroke()}
function crystal(c,m,now){const[x,y0]=scr(m.x,m.y),y=y0+TH*.12,on=m.cry==='a'||prismOn(G.s,m),h=TW*.7,pulse=.5+.5*Math.sin(now/400+m.x);
 if(AT.crystals){const i=m.cry==='a'?0:on?2:1,f=AT.crystals[i]; // planche C6-09 : turquoise, violet éteint, violet allumé, éclat
  c.save();if(on){c.shadowColor=m.cry==='a'?'#4ff5e5':'#c07bff';c.shadowBlur=TW*(.1+.1*pulse)}drawF(c,'crystals',i,x,y+TH*.08,TW*.82/f[3],false,on?1:.7);c.restore();
  if(!on){c.save();c.font=`900 ${Math.round(TW*.26)}px system-ui`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#000';const t='⏸'+(m.off-G.s.round);c.strokeText(t,x,y-TW*.3);c.fillStyle='#ddd';c.fillText(t,x,y-TW*.3);c.restore()}
  return}
 c.save();c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(x,y,TW*.3,TH*.22,0,0,7);c.fill();
 if(on){c.shadowColor=m.cry==='a'?'#4ff5e5':'#b37bff';c.shadowBlur=TW*(.15+.12*pulse)}
 if(m.cry==='a'){const C=['#0c6f78','#8ff8ec','#2bc3c0'];shard(c,x-TW*.13,y,TW*.15,h*.6,C);shard(c,x+TW*.14,y,TW*.14,h*.7,C);shard(c,x,y+2,TW*.2,h,C)}
 else{const C=on?['#3c1f78','#e6cbff','#8b55e8']:['#3a3842','#a9a5b4','#6a6578'],cy=y-h*.5-(on?pulse*TH*.08:0),w=TW*.3;
  c.beginPath();c.moveTo(x,cy-h*.42);c.lineTo(x+w,cy);c.lineTo(x,cy+h*.42);c.lineTo(x-w,cy);c.closePath();const g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,C[0]);g.addColorStop(.45,C[1]);g.addColorStop(1,C[2]);c.fillStyle=g;c.fill();c.strokeStyle='#2a1b10';c.lineWidth=2;c.stroke();
  c.beginPath();c.moveTo(x-w,cy);c.lineTo(x+w,cy);c.moveTo(x,cy-h*.42);c.lineTo(x,cy+h*.42);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();
  if(!on){c.shadowBlur=0;c.font=`900 ${Math.round(TW*.26)}px system-ui`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#000';const t='⏸'+(m.off-G.s.round);c.strokeText(t,x,cy+TW*.1);c.fillStyle='#ddd';c.fillText(t,x,cy+TW*.1)}}
 c.restore()}
// case marquée : hachures diagonales dans le losange (rayon du Titan, cases touchées par un prisme)
function hatch(c,x,y,col,a){c.save();diamond(c,x,y,.9);c.globalAlpha=a;c.fillStyle=col;c.fill();c.clip();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(x+k*TW*.14-TW*.3,y+TH*.5);c.lineTo(x+k*TW*.14+TW*.3,y-TH*.5)}c.stroke();c.restore();
 diamond(c,x,y,.9);c.strokeStyle=col;c.lineWidth=2.5;c.stroke()}
// Convertit un toucher (px,py) en case ; si une unité est touchée, renvoie sa case.
export function tapCell(px,py){const{sel,reachC}=G,S=G.s;
 const a=(px-ox)/(TW/2),b=(py-oy)/(TH/2),va=Math.round((a+b)/2),vb=Math.round((b-a)/2),g=V?{x:vb,y:0-va}:{x:va,y:vb},k=K(g.x,g.y);
 const now=S.units.filter(u=>!u.dead).sort((a,b)=>depth(b.gx,b.gy)-depth(a.gx,a.gy)),box=(u,w)=>{const[sx,sy]=scr(u.gx,u.gy),top=sy-hgt(u)-(u.fly?TH*.7:0);return Math.abs(px-sx)<TW*w&&py<sy+TH*.4&&py>top-TW*.3?Math.abs(px-sx):null}; // jusqu'à la barre de vie
 // sort choisi : toucher le dessin d'une cible valable la vise, même si un autre personnage est devant
 if(sel){const t=now.map(u=>({u,d:box(u,.42)})).filter(o=>o.d!=null&&sel.cells.some(s=>s.ok&&s.x===o.u.x&&s.y===o.u.y)).sort((a,b)=>a.d-b.d)[0];if(t)return{x:t.u.x,y:t.u.y}}
 if(sel?sel.cells.some(s=>s.ok&&s.x===g.x&&s.y===g.y):reachC&&reachC.dist.get(k)>0)return g;
 for(const u of now){const[sx,sy]=scr(u.gx,u.gy),top=sy-hgt(u)-(u.fly?TH*.7:0);if(Math.abs(px-sx)<TW*.32&&py<sy+TH*.3&&py>top)return{x:u.x,y:u.y}}
 return g}

// ---------- image d'une unité ----------
// Héros V2 (planches ChatGPT) : planche de marche W, planche de poses X
// poses : planches <héros>9 (ChatGPT, 26/11) ; marche et vues de dos : planches <héros>M
const P9=(n,F,B,iB)=>({F,B,iB,i:[n,0],a:[n,2],h:[n,3],c:[n,4],b:[n,5],ko:[n,6],v:[n,8]});
const HN={warrior:P9('kael9',['kaelM',[5,6,7,8]],['kaelM',[1,2,3,4]],['kaelM',0]),
 archer:P9('fenn9',['fennM',[5,6,7,8]],['fennM',[1,2,3,4]],['fennM',0]),
 healer:P9('aelis9',['aelisM',[5,6,7,8]],['aelisM',[1,2,3,4]],['aelisM',0])};
export const heroFrame=k=>HN[k].i;
// renvoie [planche, case, miroir, hauteur de référence]
function frameOf(u){const now=performance.now(),p=u.pose&&u.poseT>now?u.pose:'i',d=V?[1,3,0,2][u.dir]:u.dir,right=d===0||d===2,back=d===2||d===3;
// toutes les planches de héros (poses et marche) regardent à DROITE : miroir seulement quand l'unité regarde à gauche
 if(u.team==='h'){const h=HN[u.k],flip=!right,rf=AT[h.i[0]][h.i[1]][3];
  if(u.dead)return h.ko?[...h.ko,flip,rf]:[...h.i,flip,rf];
  if(u.walk){const w=back&&h.B?h.B:h.F;return[w[0],w[1][u.wf%4],flip,AT[w[0]][w[1][0]][3]]}
  if(h[p]&&p!=='i')return[...h[p],flip,rf];
  if(u.shield>0)return[...h.b,flip,rf];
  return back?[...h.iB,flip,AT[h.iB[0]][h.iB[1]][3]]:u.hp<u.max*.3?[h.i[0],7,flip,rf]:[...h.i,flip,rf]}
 if(u.walk&&AT[u.s+'w'])return[u.s+'w',u.row*4+u.wf%4,right,u.ref];
 // planches de boss (ChatGPT) : regard à droite, 6 cases repos, attaque, touché, spécial, KO, repos 2
 // marche en 4 images sur une planche à part <nom>m (chevaliers, V3.6)
 if(BS.includes(u.s)&&u.walk&&AT[u.s+'m'])return[u.s+'m',u.wf%4,!right,u.ref];
 if(BS.includes(u.s)&&u.walk&&AT[u.s].length>=10)return[u.s,6+u.wf%4,!right,u.ref];
 if(BS.includes(u.s))return u.dead?[u.s,4,!right,u.ref]:[u.s,{i:0,a:1,h:2,s:3}[p],!right,u.ref];
 return[u.s,u.row*3+{i:0,a:1,h:2,s:3}[p],right,u.ref]}

// ---------- effets visuels ----------
let fx=[],texts=[],shakeT=0,parts=[],lastA=0;
export function resetFx(){fx=[];texts=[];parts=[]}
export const addFx=(x,y,i,w,dur=550,sh='fx',dy=0)=>fx.push({x,y,i,w,sh,dy,t0:performance.now(),dur});
const dic=(c,s,i,x,y,w)=>{const f=AT[s][i],k=w/Math.max(f[2],f[3]);c.drawImage(IMG[s],f[0],f[1],f[2],f[3],x,y,f[2]*k,f[3]*k)};
// V4.0.4 : effets du Titan — rayon prismatique (traits lumineux de l'origine vers chaque case, colonnes de lumière) et onde de choc
export const addBeam=(o,cells)=>fx.push({beam:1,o,cells,t0:performance.now(),dur:750});
export const addWave=u=>fx.push({wave:1,x:u.gx,y:u.gy,t0:performance.now(),dur:700});
export const addProj=(a,b)=>fx.push({proj:1,a:{x:a.x,y:a.y},b,t0:performance.now(),dur:260});
export const shake=ms=>{shakeT=performance.now()+ms};
// impacts : zoom bref vers un point, éclats de particules (coup critique, KO, collision)
let punchE=0,punchP=null;export const punch=(u,k=.05,ms=220)=>{punchE=performance.now()+ms;punchP={x:u.gx,y:u.gy,k,ms}};
export const burst=(u,kind=1)=>{const t0=performance.now();for(let i=0;i<12;i++){const a=Math.random()*6.28,v=.6+Math.random();fx.push({burst:1,x:u.gx,y:u.gy,k:kind,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,t0,dur:650})}};
export function say(u,s,c,big){texts.push({x:u.gx,y:u.gy,s,c,big,t0:performance.now()+texts.filter(t=>t.x===u.gx&&t.y===u.gy&&performance.now()-t.t0<300).length*250})}
export function pose(u,p,ms=380){u.pose=p;u.poseT=performance.now()+ms}
// particules d'ambiance par décor : 0 luciole 1 étincelle 2 feuille 3 neige 4 braise 6 feu follet
const AMB=[[0,2],[0,2,0],[1,0],[1],[3,3],[4,6,4],[6,0,6]];
function ambient(now){const dt=Math.min(50,now-(lastA||now));lastA=now;const kinds=AMB[G.F?G.F.th:0]||[0];
 while(parts.length<26){const k=kinds[parts.length%kinds.length],fall=k===2||k===3;parts.push({k,x:Math.random()*W,y:fall?-20-Math.random()*H:Math.random()*H,vx:(Math.random()-.5)*.02,vy:fall?.03+Math.random()*.03:k===4||k===6?-.03-Math.random()*.03:(Math.random()-.5)*.01,s:.12+Math.random()*.14,ph:Math.random()*7,r:Math.random()*6})}
 ctx.save();for(const p of parts){p.x+=p.vx*dt+Math.sin(now/900+p.ph)*.15;p.y+=p.vy*dt;if(p.y>H+30||p.y<-40||p.x<-30||p.x>W+30){Object.assign(p,{x:Math.random()*W,y:p.vy>0?-20:H+20})}
  const f=AT.parts[p.k],w=TW*p.s*(p.k===2?1.4:1);ctx.globalAlpha=p.k===0?.5+.5*Math.sin(now/300+p.ph):.85;ctx.save();ctx.translate(p.x,p.y);if(p.k===2)ctx.rotate(Math.sin(now/600+p.ph)*1.2);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],-w/2,-w/2,w,w*f[3]/f[2]);ctx.restore()}
 ctx.restore()}

// ---------- boucle de dessin ----------
// mode test (V4.0.2) : ?fps dans l'adresse affiche les images par seconde (moyenne sur 1 s) et le plus long écart
const FPS=/[?&]fps/.test(location.search)&&Object.assign(document.body.appendChild(document.createElement('div')),{id:'fps'});let fN=0,fT=0,fMax=0,fLast=0;
if(FPS)FPS.style.cssText='position:fixed;left:4px;bottom:4px;z-index:99;background:#000a;color:#7f7;font:12px monospace;padding:2px 5px;border-radius:4px;pointer-events:none';
export function draw(now){
 requestAnimationFrame(draw);if(FPS){fN++;fMax=Math.max(fMax,now-(fLast||now));fLast=now;if(now-fT>1000){FPS.textContent=`${Math.round(fN*1000/(now-fT))} i/s · max ${Math.round(fMax)} ms`;fN=0;fT=now;fMax=0}}const{phase,cur,sel,busy,reachC}=G,S=G.s,units=S.units;if(!ground||phase==='camp')return;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality='high';
 const sh=shakeT>now?(Math.random()-.5)*6:0;ctx.translate(sh,sh*.5);
 if(punchE>now){const t=(punchE-now)/punchP.ms,[px,py]=scr(punchP.x,punchP.y),k=1+punchP.k*Math.sin(t*Math.PI);ctx.translate(px,py);ctx.scale(k,k);ctx.translate(-px,-py)}
 ctx.drawImage(ground,0,0,W,H);
 // surbrillances
 if(cur&&cur.team==='h'&&!busy&&phase==='fight'){
  if(G.mark&&Date.now()<G.mark.until){const[mx,my]=scr(G.mark.x,G.mark.y);diamond(ctx,mx,my,.92);ctx.fillStyle='rgba(255,60,60,.45)';ctx.fill();ctx.strokeStyle='#ff5a5a';ctx.lineWidth=3;ctx.stroke()}
  if(sel){for(const c of sel.cells){const[sx,sy]=scr(c.x,c.y);diamond(ctx,sx,sy,.92);ctx.fillStyle=c.ok?'rgba(255,140,40,.62)':c.los?'rgba(255,170,60,.22)':'rgba(120,120,140,.28)';ctx.fill();if(c.ok){ctx.strokeStyle='#ffe2a8';ctx.lineWidth=2;ctx.stroke()}}}
  else if(reachC)for(const[k,d]of reachC.dist){if(!d)continue;const[x,y]=k.split(',').map(Number),[sx,sy]=scr(x,y);diamond(ctx,sx,sy,.9);ctx.fillStyle='rgba(70,160,255,.5)';ctx.fill();ctx.strokeStyle='rgba(220,240,255,.7)';ctx.lineWidth=1.5;ctx.stroke()}}
 if(sel&&cur&&!busy)for(const c of sel.cells)if(c.ok&&occ(S,c.x,c.y)){const[sx,sy]=scr(c.x,c.y),f=AT.parts[8],w=TW*.9;ctx.save();ctx.globalAlpha=.7+.3*Math.sin(now/150);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,sy-w*f[3]/f[2]/2,w,w*f[3]/f[2]);ctx.restore()}
 // cible visée par un monstre : losange rouge
 if(G.intents&&!busy)for(const t of new Set(G.intents.map(i=>i.target))){const[sx,sy]=scr(t.gx,t.gy);ctx.save();ctx.globalAlpha=.55+.35*Math.sin(now/170);diamond(ctx,sx,sy,.86);ctx.strokeStyle='#ff4a3a';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.stroke();ctx.restore()}
 if(cur&&!cur.dead){const[sx,sy]=scr(cur.gx,cur.gy);ctx.save();ctx.globalAlpha=.6+.3*Math.sin(now/200);diamond(ctx,sx,sy,.8);ctx.strokeStyle='#ffd65a';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 // aperçu de déplacement : trajet, case d'arrivée et coût
 const plan=G.plan&&cur&&!busy&&!sel&&phase==='fight'?G.plan:null;
 if(plan){const pts=[[cur.gx,cur.gy],...plan.path].map(([x,y])=>scr(x,y)),[ex,ey]=pts[pts.length-1];ctx.save();ctx.lineCap=ctx.lineJoin='round';
  for(const[w,c]of[[7,'rgba(0,20,50,.7)'],[3.5,'#fff']]){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash([9,7]);ctx.lineDashOffset=-now/45;ctx.stroke()}
  ctx.setLineDash([]);diamond(ctx,ex,ey,.92);ctx.fillStyle='rgba(255,255,255,.28)';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 // Titan : cases du rayon chargé (hachures violettes)
 if(S.beam&&!S.beam.by.dead)for(const p of S.beam.cells){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,'#b04bff',.35+.2*Math.sin(now/180))}
 // aperçu du prisme : cases voisines touchées et dégâts, tant que le sort est choisi
 const pv=[];if(sel&&sel.sp.dmg&&cur&&!busy)for(const m of S.map.values())if(prismOn(S,m)&&sel.cells.some(c=>c.ok&&(c.x===m.x&&c.y===m.y||sel.sp.zone&&man(c,m)<=1))){const d=prismDmg(S,cur,sel.sp);
  for(const p of prismHits(S,m)){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,'#c98bff',.3);const o=occ(S,p.x,p.y);if(o)pv.push([o,d])}}
 // objets triés par profondeur
 const L=[];for(const m of S.map.values())if(m.block)L.push({z:depth(m.x,m.y),m});for(const o of outer)L.push({z:depth(o.x,o.y),m:o});
 for(const u of units)if(!u.dead||u.team==='h'||now-u.deadT<(BS.includes(u.s)?1800:600))L.push({z:depth(u.gx,u.gy)+.01,u});
 L.sort((a,b)=>a.z-b.z);
 const tg=sel&&cur&&!busy?units.filter(u=>!u.dead&&sel.cells.some(c=>c.ok&&c.x===u.x&&c.y===u.y)):[];
 const hides=u=>!tg.includes(u)&&tg.some(t=>{const dz=depth(u.gx,u.gy)-depth(t.gx,t.gy);return dz>0&&dz<=3&&Math.abs(lat(u.gx,u.gy)-lat(t.gx,t.gy))<=1.2});
 for(const h of units)if(h.trap){const[sx,sy]=scr(h.trap.x,h.trap.y),z=TW*.5;ctx.globalAlpha=.6+.25*Math.sin(now/300);dic(ctx,'sico',12,sx-z/2,sy-z*.6,z);ctx.globalAlpha=1} // piège posé
 const ghost=new Set();
 for(const o of L){if(o.m){if(o.m.cry){crystal(ctx,o.m,now);continue}if(o.m.d==null)continue;const[sx,sy]=scr(o.m.x,o.m.y),[ds,di]=DEC(o.m.d),f=AT[ds][di],c0=lat(o.m.x,o.m.y);for(const u of units){const d=depth(u.gx,u.gy);if(!u.dead&&d<o.z&&d>=o.z-3&&Math.abs(lat(u.gx,u.gy)-c0)<=1.5)ghost.add(u)}
  drawF(ctx,ds,di,sx,sy+TH*.2,DECO_W[o.m.d]*(o.m.block?DK[o.m.d]??.84:1)*TW/f[2]);continue}
  const u=o.u,[sx,sy]=scr(u.gx,u.gy),[s,i,flip,rf]=frameOf(u),sc=hgt(u)/rf,al=u.dead&&u.team!=='h'?1-(now-u.deadT)/600:1;
  ctx.save();ctx.globalAlpha=.5*al;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.26,TH*.2,0,0,7);ctx.fill();ctx.globalAlpha=.8*al;ctx.strokeStyle=u.team==='h'?'#5aa8ff':'#ff5a48';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.3,TH*.26,0,0,7);ctx.stroke();ctx.restore(); // ombre + anneau d'équipe
  const bob=u.fly?Math.sin(now/300+u.id.charCodeAt(1)*2)*TH*.12:0,lift=u.fly?TH*.7:0,jit=u.pose==='h'&&u.poseT>now?Math.sin(now/25)*3:0;
  if(u.bs==='beam'&&!u.dead){const ch=S.beam&&S.beam.by===u,k=ch?1.25+.2*Math.sin(now/90):1;ctx.save();ctx.globalAlpha=(ch?.55:.35)+.15*Math.sin(now/(ch?90:300));ctx.fillStyle=ch?'#d08bff':'#b04bff';ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.48*k,TH*.36*k,0,0,7);ctx.fill();
   if(ch){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5+.3*Math.sin(now/70);const g=ctx.createRadialGradient(sx,sy-hgt(u)*.55,0,sx,sy-hgt(u)*.55,TW*.9);g.addColorStop(0,'rgba(230,190,255,.9)');g.addColorStop(1,'rgba(160,80,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy-hgt(u)*.55,TW*.9,0,7);ctx.fill()}ctx.restore()}
  const glow=tg.includes(u);if(glow){ctx.save();ctx.shadowColor='#ffb040';ctx.shadowBlur=TW*(.18+.08*Math.sin(now/160))}
  drawF(ctx,s,i,sx+jit,sy+TH*.12-lift+bob-(u.hop||0),sc,flip,hides(u)?.4*al:al);if(glow)ctx.restore();
  if(u.flashT>now){ctx.save();ctx.globalCompositeOperation='lighter';drawF(ctx,s,i,sx+jit,sy+TH*.12-lift+bob-(u.hop||0),sc,flip,.85*(u.flashT-now)/120);ctx.restore()}}
 for(const u of ghost){const[sx,sy]=scr(u.gx,u.gy),[s,i,flip,rf]=frameOf(u);drawF(ctx,s,i,sx,sy+TH*.12-(u.fly?TH*.7:0)-(u.hop||0),hgt(u)/rf,flip,u===cur||tg.includes(u)?.6:.35)} // silhouette derrière un décor
 // barres de vie (leurs rectangles servent à écarter les bulles d'attaque)
 const taken=[];
 for(const u of units){if(u.dead)continue;const[sx,sy]=scr(u.gx,u.gy),y=sy-hgt(u)-(u.fly?TH*.7:0)-4-(u.hop||0),w=TW*.6;taken.push([sx-w/2-1,y-(u.chief?18:1),sx+w/2+(u.tag?16:1),y+6]);
  ctx.fillStyle='#000c';ctx.fillRect(sx-w/2-1,y-1,w+2,7);ctx.fillStyle=u.team==='h'?'#5fd35a':u.chief?'#ffd65a':'#e0493a';if(u.tag){ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText(u.tag,sx+w/2+8,y+6);ctx.fillStyle='#fff';ctx.fillText(u.tag,sx+w/2+8,y+6);ctx.fillStyle='#e0493a'}if(u.chief){ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('♛',sx,y-4);ctx.fillStyle='#ffd65a'}ctx.fillRect(sx-w/2,y,w*Math.max(0,u.hp)/u.max,5);
  {const ss=[u.shield>0&&1,u.buff&&12,u.poison&&8].filter(Boolean),z=TW*.24;ss.forEach((i,n)=>dic(ctx,'ico',i,sx+(n-ss.length/2)*z,y-z-3,z))}}
 for(const[o,d]of pv){const[sx,sy]=scr(o.gx,o.gy),y=sy-hgt(o)-(o.fly?TH*.7:0)-TW*.12;ctx.save();ctx.font=`900 ${Math.round(TW*.22)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const t='◆ -'+d;ctx.strokeText(t,sx,y);ctx.fillStyle=o.team==='h'?'#ff9a8a':'#e2c8ff';ctx.fillText(t,sx,y);ctx.restore()}
 // aperçu : fantôme du héros sur la case d'arrivée, viseur sur les ennemis visables de là, coût en PM
 if(plan){const{x,y}=plan,[ex,ey]=scr(x,y),[s,i,flip,rf]=frameOf(cur);drawF(ctx,s,i,ex,ey+TH*.12,hgt(cur)/rf,flip,.5);
  for(const o of plan.foes){const[sx,sy]=scr(o.gx,o.gy),f=AT.parts[8],w=TW*.9;ctx.save();ctx.globalAlpha=.75+.25*Math.sin(now/150);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,sy-w*f[3]/f[2]/2,w,w*f[3]/f[2]);ctx.restore()}
  const t=`${plan.cost} PM · ${plan.foes.length?'🎯 '+plan.foes.length:'aucune cible'}`;ctx.save();ctx.font=`800 ${Math.max(12,Math.round(TW*.2))}px system-ui`;ctx.textAlign='center';const w=ctx.measureText(t).width+16,by=ey+TH*.62,bx=Math.max(w/2+4,Math.min(W-w/2-4,ex));
  ctx.fillStyle='rgba(8,20,40,.92)';ctx.strokeStyle=plan.foes.length?'#ffa040':'#8aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx-w/2,by-11,w,22,8);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(t,bx,by+5);ctx.restore()}
 // trajet de poussée prévu
 if(sel&&sel.sp.push&&cur&&!busy)for(const c of sel.cells){const o=c.ok&&occ(S,c.x,c.y);if(!o)continue;const p=pushPlan(S,cur,o,sel.sp.push),[ax,ay]=scr(o.x,o.y),[bx,by]=scr(p.to.x,p.to.y);
  ctx.save();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=3;ctx.globalAlpha=.9;if(p.to.x!==o.x||p.to.y!==o.y){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();const a=Math.atan2(by-ay,bx-ax);ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*8,by+Math.sin(a)*8);ctx.lineTo(bx+Math.cos(a+2.4)*10,by+Math.sin(a+2.4)*10);ctx.lineTo(bx+Math.cos(a-2.4)*10,by+Math.sin(a-2.4)*10);ctx.fill()}
  if(p.left){ctx.font=`900 ${Math.round(TW*.24)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const t='-'+p.k*p.left,z=TW*.3;dic(ctx,'fxi',1,bx-ctx.measureText(t).width/2-z-2,by-TH*.1-z*.85,z);ctx.strokeText(t,bx,by-TH*.1);ctx.fillStyle='#ffa040';ctx.fillText(t,bx,by-TH*.1)}ctx.restore()}
 // intentions : bulle au-dessus de chaque monstre
 if(G.intents&&!busy){ctx.font=`800 ${Math.round(TW*.19)}px system-ui`;ctx.textAlign='center';for(const it of G.intents){const u=it.m,[sx,sy]=scr(u.gx,u.gy);let y=sy-hgt(u)-(u.fly?TH*.7:0)-TW*.3;const t=it.dmg.join('–'),h=TW*.28,iw=h*.95,w=ctx.measureText(t).width+14+iw,[tx,ty]=scr(it.target.gx,it.target.gy);
  ctx.save();ctx.strokeStyle='rgba(255,74,58,.75)';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.lineDashOffset=-now/40;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+tx)/2,Math.min(sy,ty)-TH,tx,ty);ctx.stroke();ctx.restore();
  // la bulle prend la place libre la plus proche (au-dessus, à côté ou plus bas), sans passer sous la barre du haut
  let bx=sx;{const y0=y-h*.75;let best=null;
   for(const[i,j]of SPOTS){const cx=Math.max(w/2+2,Math.min(W-w/2-2,sx+i*(w+3))),top=Math.max(hudB,y0+j*(h+3));
    const n=taken.filter(([a,b,c,d])=>cx-w/2<c&&cx+w/2>a&&top<d&&top+h>b).length;if(!best||n<best[0])best=[n,cx,top];if(!n)break}
   bx=best[1];y=best[2]+h*.75;taken.push([bx-w/2,best[2],bx+w/2,best[2]+h])}
  ctx.fillStyle='rgba(40,8,6,.85)';ctx.strokeStyle='#ff6b5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx-w/2,y-h*.75,w,h,6);ctx.fill();ctx.stroke();dic(ctx,'ico',0,bx-w/2+4,y-h*.75+(h-iw)/2,iw);ctx.fillStyle='#ffd9d2';ctx.fillText(t,bx+iw/2,y)}}
 // effets
 if(cur&&!cur.dead&&phase==='fight'){const[sx,sy]=scr(cur.gx,cur.gy),f=AT.parts[10],w=TW*.32,y=sy-hgt(cur)-(cur.fly?TH*.7:0)-TW*.42+Math.sin(now/180)*4;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,y-w*f[3]/f[2],w,w*f[3]/f[2])}
 ambient(now);
 fx=fx.filter(e=>now-e.t0<e.dur);for(const e of fx){const t=(now-e.t0)/e.dur;
  if(e.burst){const[sx,sy]=scr(e.x,e.y),f=AT.parts[e.k],w=TW*.22*(1-t*.5),el=t*e.dur/16;ctx.save();ctx.globalAlpha=1-t;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx+e.vx*el*2.2-w/2,sy-TW*.5+(e.vy*el+.045*el*el)*1.6-w/2,w,w*f[3]/f[2]);ctx.restore();continue}
  if(e.beam){const[ox,oy]=scr(e.o.x,e.o.y),a=t<.15?t/.15:1-(t-.15)/.85,lift=TW*.55;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
   for(const[w,c]of[[TW*.42,'rgba(150,70,255,.35)'],[TW*.2,'rgba(200,150,255,.7)'],[TW*.07,'rgba(255,255,255,.95)']]){ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w*(1+.15*Math.sin(now/30));ctx.beginPath();for(const p of e.cells){const[px,py]=scr(p.x,p.y);ctx.moveTo(ox,oy-lift);ctx.lineTo(px,py-TH*.2)}ctx.stroke()}
   for(const p of e.cells){const[px,py]=scr(p.x,p.y),g=ctx.createLinearGradient(0,py-TW*1.6,0,py);g.addColorStop(0,'rgba(180,110,255,0)');g.addColorStop(1,'rgba(220,180,255,.8)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(px-TW*.16,py-TW*1.6,TW*.32,TW*1.6)}
   ctx.restore();continue}
  if(e.wave){const[sx,sy]=scr(e.x,e.y),r=TW*(.3+3.2*t);ctx.save();ctx.globalAlpha=(1-t)*.9;for(const[k,c,w]of[[1,'#c98bff',TW*.16*(1-t)+2],[.82,'#ffffff',3]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(sx,sy,r*k,r*k*ISO,0,0,7);ctx.stroke()}ctx.restore();continue}
  if(e.proj){const[ax,ay]=scr(e.a.x,e.a.y),[bx,by]=scr(e.b.x,e.b.y),x=ax+(bx-ax)*t,y=ay+(by-ay)*t-TW*.6-Math.sin(t*Math.PI)*TW*.4;
   const f=AT.fx[6];ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(by-ay-Math.PI*Math.cos(t*Math.PI)*TW*.4,bx-ax));ctx.drawImage(IMG.fx,f[0],f[1],f[2],f[3],-TW*.45,-TW*.45*f[3]/f[2],TW*.9,TW*.9*f[3]/f[2]);ctx.restore();continue}
  const[sx,sy]=scr(e.x,e.y),f=AT[e.sh||'fx'][e.i],s=(e.w||1.3)*TW/f[2]*(.7+.4*Math.min(1,t*3));
  ctx.save();ctx.globalAlpha=t<.6?1:1-(t-.6)/.4;ctx.drawImage(IMG[e.sh||'fx'],f[0],f[1],f[2],f[3],sx-f[2]*s/2,sy+TH*.3-f[3]*s+(e.dy||0)*TW,f[2]*s,f[3]*s);ctx.restore()}
 texts=texts.filter(e=>now-e.t0<1000);ctx.textAlign='center';for(const e of texts){const t=(now-e.t0)/1000,[sx,sy]=scr(e.x,e.y);
  const pop=1+.7*Math.min(1,Math.max(0,1-(now-e.t0)/140));ctx.font=`900 ${Math.round(TW*(e.big?.58:.42)*pop)}px system-ui`;ctx.globalAlpha=t<.7?1:1-(t-.7)/.3;ctx.lineWidth=4;ctx.strokeStyle='#000';const y=sy-TW*1.1-t*30;ctx.strokeText(e.s,sx,y);ctx.fillStyle=e.c;ctx.fillText(e.s,sx,y);ctx.globalAlpha=1}
}
