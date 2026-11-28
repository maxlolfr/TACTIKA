// Rendu : canvas du combat (sol, décors, unités, effets, particules) et images de l'atlas.
import {tr} from './i18n.js';
import {G} from './game.js';
import {$,HUD2} from './util.js';
import {DEC,DECO_W,CMAX,R,ZONES,MON,THEMES,VET_LVL,VET_FORCE} from './data.js';
import {save} from './save.js';
import {drawAmb,resetAmb} from './ambiance.js';
import {MODS,booms} from './elites.js'; // V5.10 : élites Cauchemar
import {dprFor,hiFx} from './gfx.js'; // V5.11 : réglage graphique Faible / Moyen / Haut
import {K,mulberry,pick,cell,occ,pushPlan,prismOn,prismHits,prismDmg,man,zoneCells,hitCells,forecast,soak} from './rules.js';

export const cv=$('cv'),ctx=cv.getContext('2d');
export let AT=null;export const IMG={};
// anciennes planches gardées pour legacy/ et comme références, inutiles ici
// planches au nouveau style (boss et monstres refaits) : 6 cases (+4 de marche pour les monstres)
const BS=['slimeT','knightB','knightR','knightN','roiG','golemK','crabK','wolfK','knightK','slimeN','boarN','batN','wolfN','shroomN','crabN','gullN','golemN','goblinN','ghostN','skelN','crygolem','qspider','prisbat','titan','obsid','salam','fireel','ignaros','mummy','scorp','anubis','pharaoh','toad','ent','wraith','queen','cguard','griffin','astral','aetherion','polarwolf','yeti','frostel','frostking','etherbeast','etherknight','sanctguard','breaker'];
const OLD=['tiles','tiles2','tiles3','aelisX','aelisB','fennX','fennB','kaelW','kaelX','kaelK','warrior','archer','healer','kaelF','kaelB','kaelP','fennF','fennP','aelisF','aelisP'];
// V4.0a : les planches de monstres (MS) ne sont chargées que pour la zone où l'on combat ; celles des autres zones sont libérées
const MS=new Set(),LD={};
function tint(src,rgba){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=rgba;x.fillRect(0,0,c.width,c.height);return c}
function load(n){
 if(n==='slimeT')return IMG[n]?Promise.resolve():load('slimeN').then(()=>{IMG[n]=tint(IMG.slimeN,'rgba(150,40,200,.5)')}); // V4.13 : gelée toxique = gelée recolorée
 return IMG[n]?Promise.resolve():LD[n]||(LD[n]=new Promise((ok,ko)=>{const i=new Image();i.onload=()=>{IMG[n]=i;delete LD[n];ok()};i.onerror=()=>{delete LD[n];ko(n)};i.src='assets/'+n+'.webp'}))}
export async function loadAssets(){
 AT=await(await fetch('assets/atlas.json')).json();AT.slimeT=AT.slimeN;
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
// V4.86 : portrait d'une planche (bestiaire), sans la garder en mémoire du combat : l'image est relue depuis le cache du navigateur
export function sprite(s,i,px){const d=2,c=document.createElement('canvas');c.width=c.height=px*d;c.style.width=c.style.height=px+'px';const f=AT[s]?.[i]||AT[s==='slimeT'?'slimeN':s]?.[i];if(!f)return c;
 const im=new Image();im.onload=()=>{const k=Math.min(px*d/f[2],px*d/f[3]),g=c.getContext('2d');if(s==='slimeT')g.filter='hue-rotate(250deg) saturate(1.4)';g.drawImage(im,f[0],f[1],f[2],f[3],(px*d-f[2]*k)/2,px*d-f[3]*k,f[2]*k,f[3]*k)};im.src='assets/'+(s==='slimeT'?'slimeN':s)+'.webp';return c}
const UIC={};export function uiURL(i){if(UIC[i])return UIC[i];const f=AT.ui[i],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.ui,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return UIC[i]=c.toDataURL()}
export function logoURL(){const f=AT.logo[0],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.logo,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return c.toDataURL()}
export function skin(){const st=document.createElement('style');st.textContent=`.btn{background:url(${uiURL(5)}) center/100% 100% no-repeat;box-shadow:none;border-radius:0;text-shadow:0 1px 0 #fff6;padding:14px 22px}.btn:active{background-image:url(${uiURL(7)})}
 .btn.dark{background-image:url(${uiURL(10)});color:#f3ead8;text-shadow:0 1px 2px #000}
 .btn.dark{padding:12px 28px}#top .btn{background:#2a1b10dd;border:1px solid #7a5a32;border-radius:10px;padding:6px 9px;color:#f3ead8}
 #panel{background:url(${uiURL(11)}) center/100% 100% no-repeat,#2a1b10;border-top:0}`;document.head.appendChild(st)}
export function icon(s,i,px,top){const dpr=typeof devicePixelRatio==='number'?devicePixelRatio:2,d=Math.min(4,Math.max(2,Math.ceil(dpr))),cv=document.createElement('canvas');cv.width=cv.height=Math.round(px*d);cv.style.width=cv.style.height=px+'px';const c=cv.getContext('2d'),f=AT[s][i];
 // V4.71 : définition adaptée à l'écran (ratio de pixels) + réduction en deux temps avec lissage haute qualité, sinon les petits portraits sont flous/crénelés.
 const sh=top?f[3]*top:f[3],W=cv.width,k=Math.min(W/f[2],W/sh),dw=f[2]*k,dh=sh*k,paint=()=>{c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  let src=IMG[s],sx=f[0],sy=f[1],sw=f[2],shh=sh;
  if(k<.5){const t=document.createElement('canvas');t.width=Math.ceil(sw/2);t.height=Math.ceil(shh/2);const tc=t.getContext('2d');tc.imageSmoothingQuality='high';tc.drawImage(src,sx,sy,sw,shh,0,0,t.width,t.height);src=t;sx=0;sy=0;sw=t.width;shh=t.height}
  c.drawImage(src,sx,sy,sw,shh,(W-dw)/2,(W-dh)/2,dw,dh)};
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
const lift=u=>u.fly?TH*.3:0; // V4.1 : les volants planent bas, près de leur case (à .7 ils se recouvraient)
// décors posés sur le plateau : réduits pour ne plus cacher les héros (les grands le plus)
const DK={0:.74,1:.76,8:.76,9:.72,10:.6,20:.8}
// V : plateau pivoté d'un quart de tour (téléphone couché) : héros à gauche, ennemis à droite, cases plus grandes
export let V=false;
export const depth=(x,y)=>V?x-y:x+y; // profondeur à l'écran (ordre de dessin)
const lat=(x,y)=>V?-x-y:x-y;        // position horizontale à l'écran
export function scr(x,y){return[ox+lat(x,y)*TW/2,oy+depth(x,y)*TH/2]}
let ground=null,outer=[];
// V4.4 : zoom du plateau. Écran = monde × z + (x,y) ; le décor dessiné couvre toujours tout l'écran.
export const view={z:1,x:0,y:0};
export const ZMAX=2.5;
let groundK=0,sharpT=0; // résolution du sol pré-dessiné
const resFor=z=>Math.min(dpr*z,Math.max(dpr,Math.sqrt(8e6/(W*H)))); // plafond mémoire (iPhone)
export function setView(z,x,y){view.z=Math.min(ZMAX,Math.max(1,z));if(view.z<1.03)view.z=1;
 view.x=Math.min(0,Math.max(W*(1-view.z),x));view.y=Math.min(0,Math.max(H*(1-view.z),y));
 $('unzoom').classList.toggle('on',view.z>1);if(view.z>1)$('unzoom').style.top=hudB+6+'px'; // sous la barre du haut, loin des cases qu'on touche le plus
 // le sol est redessiné plus net une fois le geste fini
 clearTimeout(sharpT);sharpT=setTimeout(()=>{if(ground&&Math.abs(resFor(view.z)-groundK)>.2)buildGround()},220)}
// zoom autour d'un point de l'écran (il reste sous le doigt)
export const zoomAt=(z,px,py)=>{const k=Math.min(ZMAX,Math.max(1,z))/view.z;setView(view.z*k,px-(px-view.x)*k,py-(py-view.y)*k)};
// plateau agrandi : ramène la case (x,y) à l'écran si elle est sortie de la zone visible
export function keepInView(x,y){if(view.z===1)return;const[wx,wy]=scr(x,y),sx=wx*view.z+view.x,sy=wy*view.z+view.y,m=TW*view.z*.6,P=$('panel').getBoundingClientRect(),side=matchMedia('(orientation:landscape)').matches,r=side?P.left:W,b=side?H:P.top;
 if(sx<m||sx>r-m||sy<hudB+m*1.6||sy>b-m*.6)setView(view.z,r/2-wx*view.z,(hudB+b)/2-wy*view.z)}
export function layout(){
 const box=cv.getBoundingClientRect();if(box.width!==W||box.height!==H){view.z=1;view.x=view.y=0;$('unzoom').classList.remove('on')}W=box.width||innerWidth;H=box.height||innerHeight;dpr=dprFor(devicePixelRatio,W*H);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
 const side=matchMedia('(orientation:landscape)').matches,P=$('panel').getBoundingClientRect(),pad=(id,k)=>parseFloat(getComputedStyle($(id))[k])||0;
 const top=$('top').getBoundingClientRect().bottom;hudB=top;
 // paysage : le panneau est une colonne à droite ; on retire les zones sûres (encoche à gauche, barre du bas)
 const x0=side?pad('top','paddingLeft')-10:0,x1=side?P.left:W,bot=side?H-Math.max(4,pad('panel','paddingBottom')-8):P.top,avail=bot-top;
 const fit=v=>Math.min((x1-x0)/((v?R/2+1:CMAX+1)+.3),avail/((v?CMAX+1:R/2+1)*ISO+(v?1:1.05)),HUD2?190:130); // V4.0.5 : moins de marge réservée au-dessus du plateau
 V=side&&fit(true)>fit(false)*1.05;TW=fit(V);TH=TW*ISO;
 const rows=V?CMAX+1:R/2+1,bh=rows*TH+1.1*TW,mid=R/4; // case centrale (mid,mid)
 ox=(x0+x1)/2-lat(mid,mid)*TW/2;oy=top+(avail-bh)/2+1.1*TW+rows*TH/2-depth(mid,mid)*TH/2;
 if(G.s.map.size)buildGround();
}
// numéro de tuile du jeu (data.js) -> case de la planche tiles4
const T4=[0,2,12,13,15,14,3,8,4,5,6,7,8,9,10,11];
function diamond(c,x,y,s=1){c.beginPath();c.moveTo(x,y-TH/2*s);c.lineTo(x+TW/2*s,y);c.lineTo(x,y+TH/2*s);c.lineTo(x-TW/2*s,y);c.closePath()}
const BGZ=['prairie','bois','plage','mont','chateau','cristal','braise','sables','marais','citadelle','givre','eter'],BG={};
// chaque zone a deux peintures : <zone>.webp (verticale) et <zone>-l.webp (écran plus large que haut)
function bgOf(){const z=G.F&&ZONES[G.F.zi].id;if(!BGZ.includes(z))return null;const id=z+(W>H?'-l':'');
 if(!(id in BG)){for(const k in BG)delete BG[k]; // un seul fond en mémoire
  BG[id]=null;const i=new Image();i.onload=()=>{BG[id]=i;if(G.s.map.size&&G.F&&ZONES[G.F.zi].id===z)buildGround()};i.src='assets/bg/'+id+'.webp'}return BG[id]}
function buildGround(){const S=G.s,theme=S.theme,bg=bgOf();
 groundK=resFor(view.z);ground=document.createElement('canvas');ground.width=W*groundK;ground.height=H*groundK;const g=ground.getContext('2d');g.setTransform(groundK,0,0,groundK,0,0);
 g.fillStyle='#16220f';g.fillRect(0,0,W,H);
 if(bg){const k=Math.max(W/bg.width,H/bg.height);g.imageSmoothingQuality='high';g.drawImage(bg,(W-bg.width*k)/2,(H-bg.height*k)/2,bg.width*k,bg.height*k);g.fillStyle='rgba(0,0,0,.34)';g.fillRect(0,0,W,H)}
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
 if(hiFx())hiGround(g); /* V5.11 Haut : éclairage précalculé (coût nul par image) */
 if(G.F?.cm)nightGround(g); // V5.10.2 : ambiance Cauchemar (sol assombri, teinte pourpre ; personnages vifs)
}
// V4.37 : mur de glace (cristaux existants), barre de PV et tours restants
function iceWall(c,m){const[x,y]=scr(m.x,m.y),z=TW*1.05,i=m.ice,left=i.until-G.s.round;diamond(c,x,y,.92);c.fillStyle='rgba(120,200,255,.35)';c.fill();c.strokeStyle='#bfe8ff';c.lineWidth=2;c.stroke();
 dic(c,'fxi',3,x-z/2,y+TH*.25-z,z);const w=TW*.5,by=y-z*.82;c.fillStyle='#000c';c.fillRect(x-w/2-1,by-1,w+2,6);c.fillStyle='#8fd4ff';c.fillRect(x-w/2,by,w*i.hp/i.max,4);
 c.save();c.font=`900 ${Math.round(TW*.2)}px system-ui`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#000';c.strokeText('⏳'+left,x,by-4);c.fillStyle='#fff';c.fillText('⏳'+left,x,by-4);c.restore()}
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
// V5.10 · élites Cauchemar : aura au sol (couleur du modificateur + motif propre, lisible sans couleur) et quelques étincelles.
// « Effets réduits » : aura fixe, sans pulsation ni étincelles.
const PAT={berserk:[2,3],garde:[],regen:[1,4],bombe:[7,3]};
// V5.11 · niveau Haut : halo lumineux additif (sprite 64 px pré-rendu par couleur, aplati en ellipse au sol)
const HALO=new Map();function haloAt(c,x,y,r,col,a){let s=HALO.get(col);if(!s){s=document.createElement('canvas');s.width=s.height=64;const q=s.getContext('2d'),g=q.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,col);g.addColorStop(.35,col+'99');g.addColorStop(1,col+'00');q.fillStyle=g;q.fillRect(0,0,64,64);HALO.set(col,s)}
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.max(0,Math.min(1,a));c.drawImage(s,x-r,y-r*ISO*.9,r*2,r*2*ISO*.9);c.restore()}
// V5.11 · champion : aura plus large, trait plus épais (5,5 au lieu de 3,5), double anneau (le 2e à la couleur de sa 2e capacité,
// tournant en sens inverse), cœur sombre et 6 étincelles. Haut : halo additif sous l'unité.
function eliteAura(c,u,sx,sy,now){const m=MODS[u.mods[0]],ch=!!u.champ,m2=ch&&u.mods[1]?MODS[u.mods[1]]:m,lf=lowFx(),p=lf?0:Math.sin(now/260+u.id.charCodeAt(1)),cy=sy+TH*.1,K=ch?1.18:1;
 c.save();if(hiFx())haloAt(c,sx,cy,TW*(ch?.95:.75),m.col,.45+.12*p);
 if(ch){c.globalAlpha=.5;c.fillStyle='#120310';c.beginPath();c.ellipse(sx,cy,TW*.44*K,TH*.36*K,0,0,7);c.fill()}
 c.globalAlpha=(ch?.34:.28)+.08*p;c.fillStyle=m.col;c.beginPath();c.ellipse(sx,cy,TW*.42*K,TH*.34*K,0,0,7);c.fill();
 c.globalAlpha=.9;c.strokeStyle=m.col;c.lineWidth=ch?5.5:3.5;c.setLineDash(PAT[m.ico]||[]);c.lineDashOffset=lf?0:-now/60;c.beginPath();c.ellipse(sx,cy,TW*.4*K,TH*.32*K,0,0,7);c.stroke();
 if(ch){c.strokeStyle=m2.col;c.lineWidth=3.5;c.setLineDash(PAT[m2.ico]||[]);c.lineDashOffset=lf?0:now/50;c.beginPath();c.ellipse(sx,cy,TW*.52*K,TH*.42*K,0,0,7);c.stroke();
  c.setLineDash([]);c.globalAlpha=.85;c.strokeStyle='#1a0612';c.lineWidth=1.5;c.beginPath();c.ellipse(sx,cy,TW*.46*K,TH*.37*K,0,0,7);c.stroke()}
 c.setLineDash([]);
 if(u.prime){c.globalAlpha=.5+.4*Math.abs(Math.sin(now/120));c.lineWidth=3;c.strokeStyle='#ffe0a0';c.beginPath();c.ellipse(sx,cy,TW*.46,TH*.37,0,0,7);c.stroke()}
 if(!lf){c.globalCompositeOperation='lighter';const nk=ch?6:3;for(let k=0;k<nk;k++){c.fillStyle=k&1&&ch?m2.col:m.col;const a=now/900+k*6.28/nk+u.id.charCodeAt(1),r=TW*.36*K;c.globalAlpha=.55+.3*Math.sin(now/200+k);c.beginPath();c.arc(sx+Math.cos(a)*r,cy+Math.sin(a)*TH*.28-(m.ico==='regen'?((now/12+k*40)%30)*.6:0),2.2,0,7);c.fill()}}
 c.restore()}
// badge de 4 formes : crocs (Berserker), bouclier (Gardien), croix (Régénérateur), étoile éclatée (Explosif)
// V5.10b : pastille de niveau des héros (dorée et plus grande pour le héros actif)
function lvChip(c,lv,x,y,r,on){if(on)r*=1.15;c.save();c.fillStyle=on?'#ffd65a':'#16233a';c.strokeStyle=on?'#fff3c0':'#5aa8ff';c.lineWidth=2;c.beginPath();c.arc(x,y,r+2,0,7);c.fill();c.stroke();c.font=`900 ${Math.round(r*(lv>9?1.15:1.4))}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=on?'#2a1a00':'#fff';c.fillText(lv,x,y+1);c.restore()}
function modBadge(c,id,x,y,r){const m=MODS[id];c.save();c.fillStyle='#0d0d14';c.strokeStyle=m.col;c.lineWidth=2;c.beginPath();c.arc(x,y,r+2,0,7);c.fill();c.stroke();c.fillStyle='#fff';c.strokeStyle='#fff';c.lineWidth=Math.max(1.5,r*.28);c.lineCap='round';c.beginPath();
 if(m.ico==='berserk'){for(const d of[-1,1]){c.moveTo(x+d*r*.7,y-r*.55);c.lineTo(x+d*r*.1,y-r*.55);c.lineTo(x+d*r*.32,y+r*.7);c.closePath()}c.fill()} // deux crocs
 else if(m.ico==='garde'){c.moveTo(x-r*.6,y-r*.6);c.lineTo(x+r*.6,y-r*.6);c.lineTo(x+r*.55,y+r*.05);c.quadraticCurveTo(x+r*.35,y+r*.55,x,y+r*.75);c.quadraticCurveTo(x-r*.35,y+r*.55,x-r*.55,y+r*.05);c.closePath();c.fill()}
 else if(m.ico==='regen'){c.moveTo(x,y-r*.65);c.lineTo(x,y+r*.65);c.moveTo(x-r*.65,y);c.lineTo(x+r*.65,y);c.stroke()}
 else{for(let k=0;k<8;k++){const a=k*Math.PI/4,q=k&1?.4:.8;c.lineTo(x+Math.cos(a)*r*q,y+Math.sin(a)*r*q)}c.closePath();c.fill()}
 c.restore()}
function hatch(c,x,y,col,a){c.save();diamond(c,x,y,.9);c.globalAlpha=a;c.fillStyle=col;c.fill();c.clip();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(x+k*TW*.14-TW*.3,y+TH*.5);c.lineTo(x+k*TW*.14+TW*.3,y-TH*.5)}c.stroke();c.restore();
 diamond(c,x,y,.9);c.strokeStyle=col;c.lineWidth=2.5;c.stroke()}
// Convertit un toucher (px,py) en case ; si une unité est touchée, renvoie sa case.
export function tapCell(px,py){const{sel,reachC}=G,S=G.s;px=(px-view.x)/view.z;py=(py-view.y)/view.z;
 const a=(px-ox)/(TW/2),b=(py-oy)/(TH/2),va=Math.round((a+b)/2),vb=Math.round((b-a)/2),g=V?{x:vb,y:0-va}:{x:va,y:vb},k=K(g.x,g.y);
 const[gx,gy]=scr(g.x,g.y),core=Math.abs(px-gx)/(TW/2)+Math.abs(py-gy)/(TH/2)<.55; // appui au milieu de la case
 const now=S.units.filter(u=>!u.dead).sort((a,b)=>depth(b.gx,b.gy)-depth(a.gx,a.gy)),box=(u,w)=>{const[sx,sy]=scr(u.gx,u.gy),top=sy-hgt(u)-lift(u); // jusqu'à la barre de vie
  return Math.abs(px-sx)<TW*w&&py<sy+TH*.4&&py>top-TW*.3?Math.hypot(px-sx,(py-(sy+top)/2)*.6):null};
 // sort choisi : le milieu d'une case occupée (le socle) l'emporte ; sinon le dessin de cible le plus proche, même derrière un autre personnage
 if(sel&&sel.sp.t!=='self'){const o=occ(S,g.x,g.y);if(core&&o)return g;
  if(sel.sp.zone&&core&&S.map.has(k))return g; // sort de zone : le milieu d'une case libre reste visable
  const t=now.filter(u=>sel.sp.t==='ally'?u.team==='h':u.team==='m').map(u=>({u,d:box(u,.42),ok:sel.cells.some(s=>s.ok&&s.x===u.x&&s.y===u.y)})).filter(o=>o.d!=null).sort((a,b)=>b.ok-a.ok||a.d-b.d)[0];if(t)return{x:t.u.x,y:t.u.y}}
 if(!sel&&core){const c=cell(S,g.x,g.y);if(c&&(c.water||c.block)&&!occ(S,g.x,g.y))return g} // eau ou obstacle touché en plein milieu
 if(sel?sel.cells.some(s=>s.ok&&s.x===g.x&&s.y===g.y):reachC&&reachC.dist.get(k)>0)return g;
 for(const u of now){const[sx,sy]=scr(u.gx,u.gy),top=sy-hgt(u)-lift(u);if(Math.abs(px-sx)<TW*.32&&py<sy+TH*.3&&py>top)return{x:u.x,y:u.y}}
 return g}

// ---------- image d'une unité ----------
// Héros V2 (planches ChatGPT) : planche de marche W, planche de poses X
// poses : planches <héros>9 (ChatGPT, 26/11) ; marche et vues de dos : planches <héros>M
const P9=(n,F,B,iB)=>({F,B,iB,i:[n,0],a:[n,2],h:[n,3],c:[n,4],b:[n,5],ko:[n,6],v:[n,8]});
const HN={warrior:P9('kael9',['kaelM',[5,6,7,8]],['kaelM',[1,2,3,4]],['kaelM',0]),
 archer:P9('fenn9',['fennM',[5,6,7,8]],['fennM',[1,2,3,4]],['fennM',0]),
 healer:P9('aelis9',['aelisM',[5,6,7,8]],['aelisM',[1,2,3,4]],['aelisM',0]),
 // V5.13 : Orion et Nyra ont leur vraie planche de marche (orionM, nyraM) ; Lyria n'en a pas encore (pose fixe qui glisse, marche procédurale)
 mage:P9('orion9',['orionM',[5,6,7,8]],['orionM',[1,2,3,4]],['orionM',0]),
 rogue:P9('nyra9',['nyraM',[5,6,7,8]],['nyraM',[1,2,3,4]],['nyraM',0]),
 paladin:{...P9('lyria9',['lyria9',[0,0,0,0]],['lyria9',[0,0,0,0]],['lyria9',0]),still:1}};
// V4.32 : héros « vétérans » dès le niveau 25 (ou avec &veterans).
// V5.13 : vraies planches de marche des vétérans (kaelVM, fennVM, aelisVM) ; avant, la pose de repos glissait avec le petit rebond de chaque case.
const HV=Object.fromEntries([['warrior','kaelV'],['archer','fennV'],['healer','aelisV']].map(([k,n])=>[k,P9(n,[n+'M',[5,6,7,8]],[n+'M',[1,2,3,4]],[n+'M',0])]));
export const isVet=()=>VET_FORCE||save.lvl>=VET_LVL;
const hn=k=>isVet()&&HV[k]||HN[k];
export const heroFrame=k=>hn(k).i;
const stillWalk=u=>u.team==='h'&&u.walk&&!u.dead&&!!hn(u.k).still; // V5.12 (V5.13 : plus que Lyria)
// images de marche [planche, 4 cases], tournées vers la droite (réutilisées au village, V4.8b)
export const walkFrames=(k,back)=>hn(k)[back?'B':'F'];
// renvoie [planche, case, miroir, hauteur de référence]
function frameOf(u){const now=performance.now(),p=u.pose&&u.poseT>now?u.pose:'i',d=V?[1,3,0,2][u.dir]:u.dir,right=d===0||d===2,back=d===2||d===3;
// toutes les planches de héros (poses et marche) regardent à DROITE : miroir seulement quand l'unité regarde à gauche
 if(u.team==='h'){const h=hn(u.k),flip=!right,rf=AT[h.i[0]][h.i[1]][3];
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
let fx=[],texts=[],shakeT=0,lastA=0;
export function resetFx(){fx=[];texts=[];resetAmb();view.z=1;view.x=view.y=0;$('unzoom').classList.remove('on')}
export const addFx=(x,y,i,w,dur=550,sh='fx',dy=0)=>fx.push({x,y,i,w,sh,dy,t0:performance.now(),dur});
const dic=(c,s,i,x,y,w)=>{const f=AT[s][i],k=w/Math.max(f[2],f[3]);c.drawImage(IMG[s],f[0],f[1],f[2],f[3],x,y,f[2]*k,f[3]*k)};
// V4.0.4 : effets du Titan — rayon prismatique (traits lumineux de l'origine vers chaque case, colonnes de lumière) et onde de choc
export const addBeam=(o,cells)=>fx.push({beam:1,o,cells,t0:performance.now(),dur:750});
export const addWave=u=>fx.push({wave:1,x:u.gx,y:u.gy,t0:performance.now(),dur:700});
export const addProj=(a,b,orb)=>fx.push({proj:1,orb,a:{x:a.x,y:a.y},b,t0:performance.now(),dur:260});
// V5.03 lot 2 : sensations de combat, effets procéduraux légers (aucune image ajoutée), tous réduits par « Effets réduits »
export const impact=(u,kind,col)=>fx.push({imp:kind,u,col,t0:performance.now(),dur:kind==='boss'?1300:kind==='heal'?850:380});
let hsS=0,hsE=0;export const hitStop=ms=>{if(lowFx())return;const n=performance.now();hsS=n+30;hsE=hsS+ms};
export const dodgeMove=u=>{u.dgT=performance.now()+320};
export const lowFx=()=>typeof document!=='undefined'&&document.documentElement.classList.contains('lowfx'); // V4.88 : option « Effets réduits »
export const shake=ms=>{if(lowFx())return;shakeT=performance.now()+ms};
// impacts : zoom bref vers un point, éclats de particules (coup critique, KO, collision)
let punchE=0,punchP=null;export const punch=(u,k=.05,ms=220)=>{punchE=performance.now()+ms;punchP={x:u.gx,y:u.gy,k,ms}};
export const burst=(u,kind=1)=>{const t0=performance.now();for(let i=0;i<(lowFx()?3:hiFx()?20:12);i++){const a=Math.random()*6.28,v=.6+Math.random();fx.push({burst:1,x:u.gx,y:u.gy,k:kind,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,t0,dur:650})}};
export function say(u,s,c,big){s=tr(s);texts.push({x:u.gx,y:u.gy,s,c,big,t0:performance.now()+texts.filter(t=>t.x===u.gx&&t.y===u.gy&&performance.now()-t.t0<300).length*250})}
export function pose(u,p,ms=380){u.pose=p;u.poseT=performance.now()+ms}
// V5.08 : ambiances des 12 régions dans src/ambiance.js ; la bordure du plateau (arêtes n'appartenant qu'à une case) sert aux reflets
let rimK='',rimE=null;
function rimOf(){const S=G.s;if(!S||!S.map||!S.map.size)return null;const k=[ox|0,oy|0,TW|0,V,S.map.size].join();if(k===rimK)return rimE;rimK=k;const cnt=new Map();
 for(const m of S.map.values()){const x=m.x,y=m.y;for(const e of[[x-.5,y-.5,x+.5,y-.5],[x+.5,y-.5,x+.5,y+.5],[x-.5,y+.5,x+.5,y+.5],[x-.5,y-.5,x-.5,y+.5]]){const key=e.join();cnt.set(key,(cnt.get(key)||0)+1)}}
 const path=new Path2D(),segs=[];let ya=1e9,yb=-1e9;
 for(const[key,n]of cnt){if(n!==1)continue;const[a,b,c2,d]=key.split(',').map(Number),[x1,y1]=scr(a,b),[x2,y2]=scr(c2,d);path.moveTo(x1,y1);path.lineTo(x2,y2);segs.push([x1,y1,x2,y2]);ya=Math.min(ya,y1,y2);yb=Math.max(yb,y1,y2)}
 const[cx,cy]=scr(R/4,R/4);return rimE={path,segs,y0:ya,y1:yb,cx,cy}}
function ambient(now){const dt=Math.min(50,now-(lastA||now));lastA=now;drawAmb(ctx,G.F?G.F.th:0,now,dt,rimOf(),{W,H,TW,TH,lf:lowFx(),hi:hiFx()});if(G.F?.cm)nightFx(now,dt)}
// ---------- V5.10.2 · ambiance Cauchemar (procédurale, sans image) ----------
// Sol : teinte pourpre en multiplication + vignette rouge sombre, calculées une fois avec le sol pré-dessiné (coût nul par image).
// Par image : brume sombre qui respire sur les bords, volutes pourpres qui montent, rares éclairs rouges lointains.
// « Effets réduits » : sol teinté et vignette fixe seulement.
// V5.11 · niveau Haut : lumière douce venue du haut sur le plateau et vignette légère, calculées une fois avec le sol
function hiGround(g){g.save();const[cx,cy]=scr(R/4,R/4),r=Math.max(W,H);
 g.globalCompositeOperation='soft-light';let e=g.createRadialGradient(cx,cy-TH*2,0,cx,cy,r*.7);e.addColorStop(0,'rgba(255,236,200,.55)');e.addColorStop(.5,'rgba(255,220,170,.12)');e.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=e;g.fillRect(0,0,W,H);
 g.globalCompositeOperation='source-over';e=g.createRadialGradient(cx,cy,Math.min(W,H)*.35,cx,cy,r*.75);e.addColorStop(0,'rgba(0,0,0,0)');e.addColorStop(1,'rgba(0,0,10,.38)');g.fillStyle=e;g.fillRect(0,0,W,H);g.restore()}
function nightGround(g){g.save();g.globalCompositeOperation='multiply';g.fillStyle='#8f6f8c';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
 const v=g.createRadialGradient(W/2,H*.52,Math.min(W,H)*.28,W/2,H*.52,Math.max(W,H)*.78);v.addColorStop(0,'rgba(30,0,20,0)');v.addColorStop(1,'rgba(60,0,18,.7)');g.fillStyle=v;g.fillRect(0,0,W,H);g.restore()}
const NW=[];let nFlash=0,nVig=null,nSpr=null;
// sprites pré-rendus (une fois) : vignette à la taille de l'écran, deux volutes 32 px ; aucun dégradé recalculé par image
function nightCache(){if(nVig&&nVig.w===W&&nVig.h===H)return;const c=document.createElement('canvas');c.width=Math.max(1,Math.round(W/2));c.height=Math.max(1,Math.round(H/2));const g=c.getContext('2d'),e=g.createRadialGradient(c.width/2,c.height/2,Math.min(c.width,c.height)*.4,c.width/2,c.height/2,Math.max(c.width,c.height)*.72);
 e.addColorStop(0,'rgba(20,0,16,0)');e.addColorStop(1,'rgba(70,0,24,1)');g.fillStyle=e;g.fillRect(0,0,c.width,c.height);nVig={c,w:W,h:H};
 if(!nSpr)nSpr=['120,30,90','150,20,30'].map(h=>{const s=document.createElement('canvas');s.width=s.height=32;const q=s.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,`rgba(${h},1)`);gr.addColorStop(1,`rgba(${h},0)`);q.fillStyle=gr;q.fillRect(0,0,32,32);return s})}
function nightFx(now,dt){if(globalThis.__noNF)return;const lf=lowFx();nightCache();ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 
 if(!lf){const nN=hiFx()?36:22;if(NW.length>nN)NW.length=nN;while(NW.length<nN)NW.push({x:Math.random()*W,y:H+Math.random()*H*.6,r:6+Math.random()*16,v:.012+Math.random()*.02,ph:Math.random()*6.28,k:Math.random()<.7?0:1});
  ctx.globalCompositeOperation='lighter';for(const p of NW){p.y-=p.v*dt;p.x+=Math.sin(now/1400+p.ph)*.25;if(p.y<-30){p.y=H+20;p.x=Math.random()*W}
   ctx.globalAlpha=.10*Math.min(1,(H-p.y)/(H*.3))*Math.min(1,Math.max(0,p.y)/(H*.25));ctx.drawImage(nSpr[p.k],p.x-p.r,p.y-p.r,p.r*2,p.r*2)}
  if(now>nFlash+9000&&Math.random()<dt/6000)nFlash=now;const f=now-nFlash;if(f<420){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=`rgba(150,20,30,${.10*(1-f/420)*(f<90?f/90:1)})`;ctx.fillRect(0,0,W,H)}}
 ctx.restore()}

// ---------- boucle de dessin ----------
// mode test (V4.0.2) : ?fps dans l'adresse affiche les images par seconde (moyenne sur 1 s) et le plus long écart
const FPS=/[?&]fps/.test(location.search)&&Object.assign(document.body.appendChild(document.createElement('div')),{id:'fps'});let fN=0,fT=0,fMax=0,fLast=0;
if(FPS)FPS.style.cssText='position:fixed;left:4px;bottom:4px;z-index:99;background:#000a;color:#7f7;font:12px monospace;padding:2px 5px;border-radius:4px;pointer-events:none';
const LIS=typeof location!=='undefined'&&/[?&]lis/.test(location.search); // test : rectangles des étiquettes (tools/shots.mjs)
export function draw(now){
 requestAnimationFrame(draw);if(FPS){fN++;fMax=Math.max(fMax,now-(fLast||now));fLast=now;if(now-fT>1000){FPS.textContent=`${Math.round(fN*1000/(now-fT))} i/s · max ${Math.round(fMax)} ms`;fN=0;fT=now;fMax=0}}const{phase,cur,sel,busy,reachC}=G,S=G.s,units=S.units;if(!ground||phase==='camp')return;
 if(now>=hsS&&now<hsE)return; // arrêt bref sur les gros coups : l'image d'impact reste affichée
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality='high';
 const sh=shakeT>now?(Math.random()-.5)*6:0;ctx.translate(sh,sh*.5);ctx.translate(view.x,view.y);ctx.scale(view.z,view.z);
 if(punchE>now){const t=(punchE-now)/punchP.ms,[px,py]=scr(punchP.x,punchP.y),k=1+punchP.k*Math.sin(t*Math.PI);ctx.translate(px,py);ctx.scale(k,k);ctx.translate(-px,-py)}
 ctx.drawImage(ground,0,0,W,H);
 // surbrillances
 if(cur&&cur.team==='h'&&!busy&&phase==='fight'){
  if(G.mark&&Date.now()<G.mark.until){const[mx,my]=scr(G.mark.x,G.mark.y);diamond(ctx,mx,my,.92);ctx.fillStyle='rgba(255,60,60,.45)';ctx.fill();ctx.strokeStyle='#ff5a5a';ctx.lineWidth=3;ctx.stroke()}
  if(sel){const dim=sel.sp.zone&&G.ex&&!G.ex.bad;for(const c of sel.cells){const[sx,sy]=scr(c.x,c.y);diamond(ctx,sx,sy,.92);ctx.fillStyle=c.ok?(dim?'rgba(255,140,40,.3)':'rgba(255,140,40,.62)'):c.los?'rgba(255,170,60,.22)':'rgba(120,120,140,.28)';ctx.fill();if(c.ok&&!dim){ctx.strokeStyle='#ffe2a8';ctx.lineWidth=2;ctx.stroke()}}}
  else if(reachC)for(const[k,d]of reachC.dist){if(!d)continue;const[x,y]=k.split(',').map(Number),[sx,sy]=scr(x,y);diamond(ctx,sx,sy,.9);ctx.fillStyle=HUD2?'rgba(70,160,255,.26)':'rgba(70,160,255,.5)';ctx.fill();ctx.strokeStyle=HUD2?'rgba(200,230,255,.55)':'rgba(220,240,255,.7)';ctx.lineWidth=HUD2?1:1.5;ctx.stroke();ctx.beginPath();ctx.ellipse(sx,sy,TW*.075,TW*.075*ISO,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='rgba(10,50,110,.9)';ctx.stroke()}}
 if(sel&&cur&&!busy)for(const c of sel.cells)if(c.ok&&occ(S,c.x,c.y)){const[sx,sy]=scr(c.x,c.y),f=AT.parts[8],w=TW*.9;ctx.save();ctx.globalAlpha=.7+.3*Math.sin(now/150);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,sy-w*f[3]/f[2]/2,w,w*f[3]/f[2]);ctx.restore()}
 if(hiFx()&&cur&&!cur.dead&&phase==='fight'){const[hx,hy]=scr(cur.gx,cur.gy);haloAt(ctx,hx,hy+TH*.1,TW*.8,cur.team==='h'?'#ffd65a':'#ff5a48',.32+.08*Math.sin(now/300))} /* V5.11 Haut : lumière sous l'unité active */
 // cible visée par un monstre : losange rouge
 if(G.intents&&!busy)for(const t of new Set(G.intents.map(i=>i.target))){const[sx,sy]=scr(t.gx,t.gy);ctx.save();ctx.globalAlpha=.55+.35*Math.sin(now/170);diamond(ctx,sx,sy,.86);ctx.strokeStyle='#ff4a3a';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.stroke();ctx.restore()}
 // cible examinée : empreinte de la zone (rouge, distincte des centres orange)
 const E=sel&&cur&&!busy&&phase==='fight'?G.ex:null,exU=E?occ(S,E.tap.x,E.tap.y):null;
 if(E&&!E.bad&&sel.sp.splash)for(const p of zoneCells(S,E)){const o=occ(S,p.x,p.y);if(!o||o.team!==cur.team)continue;const[sx,sy]=scr(p.x,p.y);diamond(ctx,sx,sy,.9);ctx.fillStyle='rgba(90,220,110,.45)';ctx.fill();ctx.strokeStyle='#c8ffcf';ctx.lineWidth=2.5;ctx.stroke()}
 if(E&&!E.bad&&(sel.sp.zone||sel.sp.nova))for(const p of hitCells(S,sel.sp,E,E.ap||cur)){const[sx,sy]=scr(p.x,p.y),mid=p.x===E.x&&p.y===E.y;diamond(ctx,sx,sy,.9);ctx.fillStyle='rgba(235,40,30,.55)';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=mid?3.5:1.8;ctx.setLineDash(mid?[]:[6,4]);ctx.stroke();ctx.setLineDash([]);if(mid){diamond(ctx,sx,sy,.4);ctx.stroke()}}
 if(cur&&!cur.dead){const[sx,sy]=scr(cur.gx,cur.gy);ctx.save();ctx.globalAlpha=.22+.1*Math.sin(now/200);diamond(ctx,sx,sy,.86);ctx.fillStyle='#ffd65a';ctx.fill();ctx.globalAlpha=.75+.25*Math.sin(now/200);ctx.strokeStyle='#ffd65a';ctx.lineWidth=4.5;ctx.shadowColor='#ffb020';ctx.shadowBlur=lowFx()?0:10;ctx.stroke();ctx.restore()} // V5.10b : héros actif plus visible
 // aperçu de déplacement : trajet, case d'arrivée et coût
 const plan=!cur||busy||phase!=='fight'?null:sel?E&&(E.chg||E.ap)||null:G.plan;
 if(plan){const pts=[[cur.gx,cur.gy],...plan.path].map(([x,y])=>scr(x,y)),[ex,ey]=pts[pts.length-1];ctx.save();ctx.lineCap=ctx.lineJoin='round';
  for(const[w,c]of[[7,'rgba(0,20,50,.7)'],[3.5,'#fff']]){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash([9,7]);ctx.lineDashOffset=-now/45;ctx.stroke()}
  ctx.setLineDash([]);diamond(ctx,ex,ey,.92);ctx.fillStyle='rgba(255,255,255,.28)';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 // V4.5a : cases d'arrivée des renforts du prochain tour (hachures orange et ⚠)
 if(S.wave)for(const p of S.wave.next){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,p.q.elite?'#ffd65a':'#ff8a3a',.3+.2*Math.sin(now/200));ctx.save();ctx.font=`900 ${Math.round(TW*.3)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText('⚠',sx,sy+TW*.1);ctx.fillStyle=p.q.elite?'#ffd65a':'#ffa040';ctx.fillText('⚠',sx,sy+TW*.1);ctx.restore()}
 // V4.29 : cases qui s'embrasent au prochain tour (hachures rouges et ▲, distinctes des renforts ⚠)
 if(S.lava)for(const p of S.lava.next){const[sx,sy]=scr(p.x,p.y),tr=S.lava.trap;hatch(ctx,sx,sy,tr?'#e0b020':S.lava.toxic?'#4fcf2a':S.lava.cold?'#5ec8ff':'#ff3a12',.38+.2*Math.sin(now/220));ctx.save();ctx.font=`900 ${Math.round(TW*.26)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const gl=tr?'◆':S.lava.toxic?'☣':S.lava.cold?'❄':'▲';ctx.strokeText(gl,sx,sy+TW*.09);ctx.fillStyle=tr?'#fff0a0':S.lava.toxic?'#d8ff9a':S.lava.cold?'#e8f8ff':'#ffd23a';ctx.fillText(gl,sx,sy+TW*.09);ctx.restore()}
 for(const b of booms(S))for(const p of b.cells){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,'#ff8a1a',.34+.22*Math.sin(now/170));ctx.save();ctx.font=`900 ${Math.round(TW*.28)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText('✹',sx,sy+TW*.1);ctx.fillStyle='#ffe0a0';ctx.fillText('✹',sx,sy+TW*.1);ctx.restore()} // V5.10 : explosion annoncée (Explosif)
 // Titan : cases du rayon chargé (hachures violettes)
 if(S.beam&&!S.beam.by.dead)for(const p of S.beam.cells){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,'#b04bff',.35+.2*Math.sin(now/180))}
 // aperçu du prisme : cases voisines touchées et dégâts, tant que le sort est choisi
 const pv=[];if(sel&&sel.sp.dmg&&cur&&!busy)for(const m of S.map.values())if(prismOn(S,m)&&(G.ex&&!G.ex.bad?m.x===G.ex.x&&m.y===G.ex.y||sel.sp.zone&&man(G.ex,m)<=1:sel.cells.some(c=>c.ok&&(c.x===m.x&&c.y===m.y||sel.sp.zone&&man(c,m)<=1)))){const d=prismDmg(S,cur,sel.sp);
  for(const p of prismHits(S,m)){const[sx,sy]=scr(p.x,p.y);hatch(ctx,sx,sy,'#c98bff',.3);const o=occ(S,p.x,p.y);if(o)pv.push([o,soak(o,d)])}}
 if(E&&!E.bad&&(sel.sp.zone||sel.sp.nova))for(const p of hitCells(S,sel.sp,E,E.ap||cur)){const[sx,sy]=scr(p.x,p.y);diamond(ctx,sx,sy,.66);ctx.strokeStyle='#ff2d1f';ctx.lineWidth=3;ctx.stroke()}
 // objets triés par profondeur
 const L=[];for(const m of S.map.values())if(m.block)L.push({z:depth(m.x,m.y),m});for(const o of outer)L.push({z:depth(o.x,o.y),m:o});
 for(const u of units)if(!u.dead||u.team==='h'||now-u.deadT<(BS.includes(u.s)?1800:600))L.push({z:depth(u.gx,u.gy)+.01,u});
 L.sort((a,b)=>a.z-b.z);
 const tg=sel&&cur&&!busy?units.filter(u=>!u.dead&&sel.cells.some(c=>c.ok&&c.x===u.x&&c.y===u.y)):[];
 const focus=exU?[exU]:tg;
 const hides=u=>u!==exU&&!focus.includes(u)&&focus.some(t=>{const dz=depth(u.gx,u.gy)-depth(t.gx,t.gy);return dz>0&&dz<=3&&Math.abs(lat(u.gx,u.gy)-lat(t.gx,t.gy))<=1.2});
 for(const h of units)if(h.trap){const[sx,sy]=scr(h.trap.x,h.trap.y),z=TW*.5;ctx.globalAlpha=.6+.25*Math.sin(now/300);dic(ctx,h.trap.glyph?'spells':'spells5',h.trap.glyph?13:3,sx-z/2,sy-z*.6,z);ctx.globalAlpha=1} // piège posé
 const ghost=new Set();
 for(const o of L){if(o.m){if(o.m.cry){crystal(ctx,o.m,now);continue}if(o.m.ice){iceWall(ctx,o.m);continue}if(o.m.d==null)continue;const[sx,sy]=scr(o.m.x,o.m.y),[ds,di]=DEC(o.m.d),f=AT[ds][di],c0=lat(o.m.x,o.m.y);for(const u of units){const d=depth(u.gx,u.gy);if(!u.dead&&d<o.z&&d>=o.z-3&&Math.abs(lat(u.gx,u.gy)-c0)<=1.5)ghost.add(u)}
  drawF(ctx,ds,di,sx,sy+TH*.2,DECO_W[o.m.d]*(o.m.block?DK[o.m.d]??.84:1)*TW/f[2]);continue}
  const u=o.u,[sx,sy]=scr(u.gx,u.gy),[s,i,flip,rf]=frameOf(u),sc=hgt(u)/rf,al=u.dead&&u.team!=='h'?1-(now-u.deadT)/600:1;
  ctx.save();ctx.globalAlpha=.5*al;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.26,TH*.2,0,0,7);ctx.fill();ctx.globalAlpha=.8*al;ctx.strokeStyle=u.team==='h'?'#5aa8ff':u.elite?'#ffd65a':'#ff5a48';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.3,TH*.26,0,0,7);ctx.stroke();ctx.restore(); // ombre + anneau d'équipe
  if(u.mods&&!u.dead)eliteAura(ctx,u,sx,sy,now);
  const bob=u.fly?Math.sin(now/300+u.id.charCodeAt(1)*2)*TH*.12:0,up=lift(u),jit=u.pose==='h'&&u.poseT>now?Math.sin(now/25)*3:0+(u.dgT>now?Math.sin((u.dgT-now)/320*Math.PI)*TW*.22*(u.team==='h'?-1:1):0);
  if(u.bs==='beam'&&!u.dead){const ch=S.beam&&S.beam.by===u,k=ch?1.25+.2*Math.sin(now/90):1;ctx.save();ctx.globalAlpha=(ch?.55:.35)+.15*Math.sin(now/(ch?90:300));ctx.fillStyle=ch?'#d08bff':'#b04bff';ctx.beginPath();ctx.ellipse(sx,sy+TH*.1,TW*.48*k,TH*.36*k,0,0,7);ctx.fill();
   if(ch){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5+.3*Math.sin(now/70);const g=ctx.createRadialGradient(sx,sy-hgt(u)*.55,0,sx,sy-hgt(u)*.55,TW*.9);g.addColorStop(0,'rgba(230,190,255,.9)');g.addColorStop(1,'rgba(160,80,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy-hgt(u)*.55,TW*.9,0,7);ctx.fill()}ctx.restore()}
  const glow=tg.includes(u)||(u.mods&&!u.dead);if(glow){ctx.save();ctx.shadowColor=tg.includes(u)?'#ffb040':MODS[u.mods[0]].col;ctx.shadowBlur=TW*(tg.includes(u)?.18+.08*Math.sin(now/160):(u.champ?1.45:1)*(lowFx()?.2:.22+.07*Math.sin(now/240)))} // V5.10b : contour lumineux des élites
  /* V5.12 : héros sans planche de marche (vétérans niv. 25+, Orion, Nyra, Lyria) = marche procédurale : rebond, balancement, écrasement à chaque case */
  const sw=stillWalk(u),ph=now*Math.PI/220,fy=sy+TH*.12-up+bob-(u.hop||0)-(sw?Math.abs(Math.sin(ph))*TH*.1:0);
  if(sw){ctx.save();ctx.translate(sx+jit,fy);ctx.rotate(Math.sin(ph)*.08*(flip?-1:1));ctx.scale(1-.035*Math.cos(2*ph),1+.045*Math.cos(2*ph));ctx.translate(-(sx+jit),-fy)}
  drawF(ctx,s,i,sx+jit,fy,sc,flip,hides(u)?.4*al:al);if(sw)ctx.restore();if(glow)ctx.restore();
  if(u.flashT>now){ctx.save();ctx.globalCompositeOperation='lighter';drawF(ctx,s,i,sx+jit,sy+TH*.12-up+bob-(u.hop||0),sc,flip,.85*(u.flashT-now)/120);ctx.restore()}}
 for(const u of ghost){const[sx,sy]=scr(u.gx,u.gy),[s,i,flip,rf]=frameOf(u);drawF(ctx,s,i,sx,sy+TH*.12-lift(u)-(u.hop||0),hgt(u)/rf,flip,u===cur||tg.includes(u)?.6:.35)} // silhouette derrière un décor
 // barres de vie (leurs rectangles servent à écarter les bulles d'attaque)
 const taken=[],LB=[],ovl=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 // V5.03 : barres placées de l'avant vers l'arrière ; une barre (avec ses icônes d'état) qui en chevauche une autre remonte d'un cran (4 au plus)
 for(const u of units.filter(u=>!u.dead).sort((a,b)=>depth(b.gx,b.gy)-depth(a.gx,a.gy))){const[sx,sy]=scr(u.gx,u.gy),w=TW*.6,z=TW*.24,ni=[u.shield>0,u.buff,u.poison||u.k==='toxslime',u.burn].filter(Boolean).length;let y=sy-hgt(u)-lift(u)-4;
  const box=()=>[sx-Math.max(w/2+1+(u.mods?TW*.22*u.mods.length:0)+(u.team==='h'&&u.lv?TW*.24:0),ni*z/2+z/2),y-(ni?z+3:0)-(u.chief?18:1),sx+Math.max(w/2+(u.tag?16:1),ni*z/2),y+6];for(let k=0;k<4&&LB.some(o=>ovl(o,box()));k++)y-=Math.round(TW*.13);LB.push(box());u._by=y}
 taken.push(...LB);
 for(const u of units){if(u.dead)continue;const[sx,sy]=scr(u.gx,u.gy),y=u._by-(u.hop||0),w=TW*.6;
  ctx.fillStyle='#000c';ctx.fillRect(sx-w/2-1,y-1,w+2,7);ctx.fillStyle=u.team==='h'?'#5fd35a':u.chief?'#ffd65a':'#e0493a';if(u.tag){ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.strokeText(u.tag,sx+w/2+8,y+6);ctx.fillStyle='#fff';ctx.fillText(u.tag,sx+w/2+8,y+6);ctx.fillStyle='#e0493a'}if(u.chief){ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('♛',sx,y-4);ctx.fillStyle='#ffd65a'}ctx.fillRect(sx-w/2,y,w*Math.max(0,u.hp)/u.max,5);
  {const ss=[u.shield>0&&1,u.buff&&12,(u.poison||u.k==='toxslime')&&8,u.burn&&15].filter(Boolean),z=TW*.24;ss.forEach((i,n)=>dic(ctx,'ico',i,sx+(n-ss.length/2)*z,y-z-3,z))}
  if(u.team==='h'&&u.lv)lvChip(ctx,u.lv,sx-w/2-TW*.12,y+2,TW*.11,u===cur); // V5.10b : niveau du héros
  if(u.mods)u.mods.forEach((id,n)=>modBadge(ctx,id,sx-w/2-TW*.11-n*TW*.21,y+2,TW*.095))}
 for(const[o,d]of pv){const[sx,sy]=scr(o.gx,o.gy),y=sy-hgt(o)-lift(o)-TW*(G.ex?.42:.12);ctx.save();ctx.font=`900 ${Math.round(TW*(HUD2?.17:.22))}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const t='◆ -'+d;ctx.strokeText(t,sx,y);ctx.fillStyle=o.team==='h'?'#ff9a8a':'#e2c8ff';ctx.fillText(t,sx,y);ctx.restore()}
 // aperçu : fantôme du héros sur la case d'arrivée, viseur sur les ennemis visables de là, coût en PM
 if(plan){const{x,y}=plan,[ex,ey]=scr(x,y),[s,i,flip,rf]=frameOf(cur);drawF(ctx,s,i,ex,ey+TH*.12,hgt(cur)/rf,flip,.5);
  for(const o of plan.foes){const[sx,sy]=scr(o.gx,o.gy),f=AT.parts[8],w=TW*.9;ctx.save();ctx.globalAlpha=.75+.25*Math.sin(now/150);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,sy-w*f[3]/f[2]/2,w,w*f[3]/f[2]);ctx.restore()}
  const t=plan.chg?`Charge · ${plan.cost} case${plan.cost>1?'s':''}`:plan.sp?`${plan.cost} PM puis ${plan.sp.n}`:`${plan.cost} PM · ${plan.foes.length?'🎯 '+plan.foes.length:'aucune cible'}`;ctx.save();ctx.font=`800 ${Math.max(12,Math.round(TW*.2))}px system-ui`;ctx.textAlign='center';const w=ctx.measureText(t).width+16,by=ey+TH*.62,bx=Math.max(w/2+4,Math.min(W-w/2-4,ex));
  ctx.fillStyle='rgba(8,20,40,.92)';ctx.strokeStyle=plan.foes.length?'#ffa040':'#8aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx-w/2,by-11,w,22,8);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(t,bx,by+5);ctx.restore()}
 // trajet de poussée prévu
 if(sel&&sel.sp.push&&!sel.sp.nova&&cur&&!busy)for(const c of sel.cells){const o=c.ok&&occ(S,c.x,c.y);if(!o)continue;const p=pushPlan(S,cur,o,sel.sp.push),[ax,ay]=scr(o.x,o.y),[bx,by]=scr(p.to.x,p.to.y);
  ctx.save();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=3;ctx.globalAlpha=.9;if(p.to.x!==o.x||p.to.y!==o.y){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();const a=Math.atan2(by-ay,bx-ax);ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*8,by+Math.sin(a)*8);ctx.lineTo(bx+Math.cos(a+2.4)*10,by+Math.sin(a+2.4)*10);ctx.lineTo(bx+Math.cos(a-2.4)*10,by+Math.sin(a-2.4)*10);ctx.fill()}
  if(p.left){ctx.font=`900 ${Math.round(TW*.24)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const t='-'+p.k*p.left,z=TW*.3;dic(ctx,'fxi',1,bx-ctx.measureText(t).width/2-z-2,by-TH*.1-z*.85,z);ctx.strokeText(t,bx,by-TH*.1);ctx.fillStyle='#ffa040';ctx.fillText(t,bx,by-TH*.1)}ctx.restore()}
 if(E){const col=E.bad?'#ff5a4a':'#fff27a';
  if(exU){const[sx,sy]=scr(exU.gx,exU.gy),[s,i,flip,rf]=frameOf(exU);ctx.save();ctx.shadowColor=col;ctx.shadowBlur=TW*.22*dpr;const draw1=()=>drawF(ctx,s,i,sx,sy+TH*.12-lift(exU),hgt(exU)/rf,flip,.92);draw1();draw1();ctx.restore()}
  const[sx,sy]=scr(E.tap.x,E.tap.y);ctx.save();for(const[w,c]of[[6,'rgba(0,0,0,.75)'],[3,col]]){diamond(ctx,sx,sy,1+.05*Math.sin(now/140));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke()}ctx.restore();
  if(!E.bad&&sel.sp.dmg&&!sel.sp.all&&!sel.sp.glyph)for(const p of hitCells(S,sel.sp,E,E.ap||cur)){const o=occ(S,p.x,p.y);if(!o||o.team===cur.team)continue;const f=forecast(S,cur,sel.sp,o,E.ap||cur,E),[ex,ey]=scr(o.gx,o.gy),y=ey-hgt(o)-lift(o)-TW*.16,t=`-${f.dmg[0]}–${f.dmg[1]}${f.ko==='sure'?' KO':f.ko?' KO ?':''}`;
   ctx.save();ctx.font=`900 ${Math.max(HUD2?11:12,Math.round(TW*(HUD2?.17:.22)))}px system-ui`;ctx.textAlign='center';if(HUD2){const pw=ctx.measureText(t).width+10,ph=Math.max(16,TW*.24);ctx.fillStyle='rgba(8,14,26,.8)';ctx.beginPath();ctx.roundRect(ex-pw/2,y-ph*.72,pw,ph,ph/2);ctx.fill()}else{ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.strokeText(t,ex,y)}ctx.fillStyle=f.ko==='sure'?'#ff7a6a':'#ffe9a0';ctx.fillText(t,ex,y);ctx.restore()}}
 // V5.03 : les bulles d'attaque évitent aussi la tête des héros
 const HD=units.filter(u=>!u.dead&&u.team==='h').map(u=>{const[sx,sy]=scr(u.gx,u.gy),t=sy-hgt(u)-lift(u),hw=TW*.25;return[sx-hw,t,sx+hw,t+hgt(u)*.4]}),nB=taken.length;taken.push(...HD);
 // intentions : bulle au-dessus de chaque monstre
 if(G.intents&&!busy&&!E){ctx.font=`800 ${Math.round(TW*(HUD2?.16:.19))}px system-ui`;ctx.textAlign='center';for(const it of G.intents){const u=it.m,[sx,sy]=scr(u.gx,u.gy);let y=sy-hgt(u)-lift(u)-TW*.3;const t=it.dmg.join('–'),h=TW*(HUD2?.23:.28),iw=h*.95,w=ctx.measureText(t).width+14+iw,[tx,ty]=scr(it.target.gx,it.target.gy);
  ctx.save();ctx.strokeStyle='rgba(255,74,58,.75)';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.lineDashOffset=-now/40;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+tx)/2,Math.min(sy,ty)-TH,tx,ty);ctx.stroke();ctx.restore();
  // la bulle prend la place libre la plus proche (au-dessus, à côté ou plus bas), sans passer sous la barre du haut
  let bx=sx;{const y0=y-h*.75;let best=null;
   for(const[i,j]of SPOTS){const cx=Math.max(w/2+2,Math.min(W-w/2-2,sx+i*(w+3))),top=Math.max((hudB-view.y)/view.z,y0+j*(h+3));
    const n=taken.filter(([a,b,c,d])=>cx-w/2<c&&cx+w/2>a&&top<d&&top+h>b).length;if(!best||n<best[0])best=[n,cx,top];if(!n)break}
   bx=best[1];y=best[2]+h*.75;taken.push([bx-w/2,best[2],bx+w/2,best[2]+h])}
  ctx.fillStyle='rgba(40,8,6,.85)';ctx.strokeStyle='#ff6b5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx-w/2,y-h*.75,w,h,6);ctx.fill();ctx.stroke();dic(ctx,'ico',0,bx-w/2+4,y-h*.75+(h-iw)/2,iw);ctx.fillStyle='#ffd9d2';ctx.fillText(t,bx+iw/2,y)}}
 if(LIS)window.__lis={bars:LB,heads:HD,bub:taken.slice(nB+HD.length)};
 // effets
 if(cur&&!cur.dead&&phase==='fight'){const[sx,sy]=scr(cur.gx,cur.gy),f=AT.parts[10],w=TW*.32,y=(cur._by!=null?cur._by-TW*.06:sy-hgt(cur)-lift(cur)-TW*.42)+Math.sin(now/180)*4;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,y-w*f[3]/f[2],w,w*f[3]/f[2])}
 ambient(now);
 fx=fx.filter(e=>now-e.t0<e.dur);for(const e of fx){const t=(now-e.t0)/e.dur;
  if(e.imp){const u=e.u,[sx,sy0]=scr(u.gx,u.gy),cy=sy0-hgt(u)*.5-lift(u),R=TW*.5,lf=lowFx();ctx.save();ctx.lineCap='round';
   if(e.imp==='slash'){const a=1-t;ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';for(const[w,c]of[[TW*.12,'rgba(255,214,90,.55)'],[TW*.04,'#fff']]){ctx.strokeStyle=c;ctx.lineWidth=w*(1-t*.6);ctx.beginPath();ctx.arc(sx-R*.3,cy-R*.2,R*.9,-.35*Math.PI+t*.25,.15*Math.PI+t*.5);ctx.stroke()}}
   else if(e.imp==='pierce'){ctx.globalAlpha=1-t;ctx.strokeStyle='#fff6d0';ctx.lineWidth=2.5;for(let i=0;i<(lf?3:6);i++){const a=i/(lf?3:6)*6.28+.4,r0=R*.12,r1=R*(.3+.5*t);ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*r0,cy+Math.sin(a)*r0*.8);ctx.lineTo(sx+Math.cos(a)*r1,cy+Math.sin(a)*r1*.8);ctx.stroke()}}
   else if(e.imp==='block'){ctx.globalAlpha=(1-t)*.9;ctx.strokeStyle='#9fd8ff';ctx.lineWidth=3;ctx.fillStyle='rgba(120,190,255,.18)';const r=R*(.75+.15*t);ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*6.28+Math.PI/6;ctx[i?'lineTo':'moveTo'](sx+Math.cos(a)*r,cy+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke()}
   else if(e.imp==='dodge'){ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle='#bfe8ff';ctx.lineWidth=2;for(let i=0;i<3;i++){const y=cy-R*.4+i*R*.4,d=(u.team==='h'?1:-1)*R*(.4+t);ctx.beginPath();ctx.moveTo(sx+d*.3,y);ctx.lineTo(sx+d,y);ctx.stroke()}}
   else if(e.imp==='heal'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.sin(t*Math.PI)*.8;ctx.strokeStyle='#7dff8a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy0,TW*.42*(.6+.4*t),TH*.32*(.6+.4*t),0,0,7);ctx.stroke();if(!lf)for(let i=0;i<7;i++){const ph=(i*.37)%1,x=sx+Math.sin(i*2.1)*R*.55,y=sy0-hgt(u)*(t*.9+ph*.3);ctx.fillStyle=i%3?'#a8ffb0':'#ffe9a0';ctx.globalAlpha=(1-t)*.9;ctx.beginPath();ctx.arc(x,y,TW*.035,0,7);ctx.fill()}}
   else if(e.imp==='boss'){ctx.globalCompositeOperation='lighter';const a=t<.15?t/.15:1-(t-.15)/.85;ctx.globalAlpha=a*.85;const g=ctx.createLinearGradient(0,sy0-TW*3,0,sy0);g.addColorStop(0,'rgba(255,214,90,0)');g.addColorStop(1,'rgba(255,236,170,.85)');ctx.fillStyle=g;const cw=TW*(.5+.3*t);ctx.fillRect(sx-cw/2,sy0-TW*3,cw,TW*3);ctx.globalAlpha=a;ctx.strokeStyle='#ffd65a';ctx.lineWidth=4*(1-t)+1;ctx.beginPath();ctx.ellipse(sx,sy0,TW*(.4+2.4*t),TH*(.3+1.8*t),0,0,7);ctx.stroke()}
   else{ctx.globalCompositeOperation='lighter';const r=R*(.3+.8*t),g=ctx.createRadialGradient(sx,cy,0,sx,cy,r);g.addColorStop(0,'rgba(255,255,255,'+(.8*(1-t))+')');g.addColorStop(.5,(e.col||'#c98bff')+'aa');g.addColorStop(1,(e.col||'#c98bff')+'00');ctx.globalAlpha=1-t;ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,cy,r,0,7);ctx.fill()}
   ctx.restore();continue}
  if(e.burst){const[sx,sy]=scr(e.x,e.y),f=AT.parts[e.k],w=TW*.22*(1-t*.5),el=t*e.dur/16;ctx.save();ctx.globalAlpha=1-t;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx+e.vx*el*2.2-w/2,sy-TW*.5+(e.vy*el+.045*el*el)*1.6-w/2,w,w*f[3]/f[2]);ctx.restore();continue}
  if(e.beam){const[ox,oy]=scr(e.o.x,e.o.y),a=t<.15?t/.15:1-(t-.15)/.85,lift=TW*.55;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
   for(const[w,c]of[[TW*.42,'rgba(150,70,255,.35)'],[TW*.2,'rgba(200,150,255,.7)'],[TW*.07,'rgba(255,255,255,.95)']]){ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w*(1+.15*Math.sin(now/30));ctx.beginPath();for(const p of e.cells){const[px,py]=scr(p.x,p.y);ctx.moveTo(ox,oy-lift);ctx.lineTo(px,py-TH*.2)}ctx.stroke()}
   for(const p of e.cells){const[px,py]=scr(p.x,p.y),g=ctx.createLinearGradient(0,py-TW*1.6,0,py);g.addColorStop(0,'rgba(180,110,255,0)');g.addColorStop(1,'rgba(220,180,255,.8)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(px-TW*.16,py-TW*1.6,TW*.32,TW*1.6)}
   ctx.restore();continue}
  if(e.wave){const[sx,sy]=scr(e.x,e.y),r=TW*(.3+3.2*t);ctx.save();ctx.globalAlpha=(1-t)*.9;for(const[k,c,w]of[[1,'#c98bff',TW*.16*(1-t)+2],[.82,'#ffffff',3]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(sx,sy,r*k,r*k*ISO,0,0,7);ctx.stroke()}ctx.restore();continue}
  if(e.proj){const[ax,ay]=scr(e.a.x,e.a.y),[bx,by]=scr(e.b.x,e.b.y),x=ax+(bx-ax)*t,y=ay+(by-ay)*t-TW*.6-Math.sin(t*Math.PI)*TW*.4;
   if(e.orb){const r=TW*.2,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.4,e.orb);g.addColorStop(1,e.orb+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();continue} // V4.37 : sorts d'Orion, pas de flèche
   const f=AT.fx[6];ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(by-ay-Math.PI*Math.cos(t*Math.PI)*TW*.4,bx-ax));ctx.drawImage(IMG.fx,f[0],f[1],f[2],f[3],-TW*.45,-TW*.45*f[3]/f[2],TW*.9,TW*.9*f[3]/f[2]);ctx.restore();continue}
  const[sx,sy]=scr(e.x,e.y),f=AT[e.sh||'fx'][e.i],s=(e.w||1.3)*TW/f[2]*(.7+.4*Math.min(1,t*3));
  ctx.save();ctx.globalAlpha=t<.6?1:1-(t-.6)/.4;ctx.drawImage(IMG[e.sh||'fx'],f[0],f[1],f[2],f[3],sx-f[2]*s/2,sy+TH*.3-f[3]*s+(e.dy||0)*TW,f[2]*s,f[3]*s);ctx.restore()}
 texts=texts.filter(e=>now-e.t0<1000);ctx.textAlign='center';for(const e of texts){const t=(now-e.t0)/1000,[sx,sy]=scr(e.x,e.y);
  const pop=1+.7*Math.min(1,Math.max(0,1-(now-e.t0)/140));ctx.font=`900 ${Math.round(TW*(HUD2?(e.big?.46:.32):(e.big?.58:.42))*(HUD2?1+(pop-1)*.6:pop))}px system-ui`;ctx.globalAlpha=t<.7?1:1-(t-.7)/.3;ctx.lineWidth=4;ctx.strokeStyle='#000';const y=sy-TW*1.1-t*30;ctx.strokeText(e.s,sx,y);ctx.fillStyle=e.c;ctx.fillText(e.s,sx,y);ctx.globalAlpha=1}
}
