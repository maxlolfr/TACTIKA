// Rendu : canvas du combat (sol, décors, unités, effets, particules) et images de l'atlas.
import {G} from './game.js';
import {$} from './util.js';
import {DEC,TIL,DECO_W,CMAX,R,ZONES} from './data.js';
import {K,mulberry,pick,cell,occ,pushPlan} from './rules.js';

export const cv=$('cv'),ctx=cv.getContext('2d');
export let AT=null;export const IMG={};
// anciennes planches gardées pour legacy/ et comme références, inutiles ici
const OLD=['warrior','archer','healer','kaelF','kaelB','kaelP','fennF','fennP','aelisF','aelisP'];
export async function loadAssets(){
 AT=await(await fetch('assets/atlas.json')).json();
 await Promise.all(Object.keys(AT).filter(n=>!OLD.includes(n)).map(n=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>{IMG[n]=i;ok()};i.onerror=()=>ko(n);i.src='assets/'+n+'.webp'})));
}

// ---------- images ----------
export function drawF(c,s,i,x,y,sc,flip,alpha){const f=AT[s][i];c.save();c.globalAlpha=alpha??1;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(IMG[s],f[0],f[1],f[2],f[3],-f[4]*sc,-f[5]*sc,f[2]*sc,f[3]*sc);c.restore()}
const UIC={};export function uiURL(i){if(UIC[i])return UIC[i];const f=AT.ui[i],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.ui,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return UIC[i]=c.toDataURL()}
export function logoURL(){const f=AT.logo[0],c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(IMG.logo,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return c.toDataURL()}
export function skin(){const st=document.createElement('style');st.textContent=`.btn{background:url(${uiURL(5)}) center/100% 100% no-repeat;box-shadow:none;border-radius:0;text-shadow:0 1px 0 #fff6;padding:14px 22px}.btn:active{background-image:url(${uiURL(7)})}
 .btn.dark{background-image:url(${uiURL(10)});color:#f3ead8;text-shadow:0 1px 2px #000}
 .btn.dark{padding:12px 28px}#top .btn{background:#2a1b10dd;border:1px solid #7a5a32;border-radius:10px;padding:6px 9px;color:#f3ead8}
 #panel{background:url(${uiURL(11)}) center/100% 100% no-repeat,#2a1b10;border-top:0}
 #camp{background:linear-gradient(#0c0a0844,#0c0a08bb 75%),url(assets/camp.webp) center/cover}`;document.head.appendChild(st)}
export function icon(s,i,px,top){const cv=document.createElement('canvas'),d=2;cv.width=cv.height=px*d;const c=cv.getContext('2d'),f=AT[s][i];
 const sh=top?f[3]*top:f[3];const k=Math.min(px*d/f[2],px*d/sh);c.drawImage(IMG[s],f[0],f[1],f[2],sh,(px*d-f[2]*k)/2,(px*d-sh*k)/2,f[2]*k,sh*k);return cv}
// Hauteur de référence du sprite de chaque unité (sert à les mettre à l'échelle).
export function addRefs(units){for(const u of units)u.ref=u.team==='h'?AT[HN[u.k].i[0]][HN[u.k].i[1]][3]:AT[u.s][u.row*3][3]}

// ---------- géométrie ----------
export let W,H,dpr,TW,TH,ox,oy;
const ISO=.62; // hauteur d'une case / largeur (0,5 = isométrie classique) : vue un peu plus plongeante, les sols sont étirés, pas les personnages
export function scr(x,y){return[ox+(x-y)*TW/2,oy+(x+y)*TH/2]}
let ground=null,outer=[];
export function layout(){
 W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,3);cv.width=W*dpr;cv.height=H*dpr;
 const top=$('top').getBoundingClientRect().bottom,bot=$('panel').getBoundingClientRect().top,avail=bot-top;
 TW=Math.min(W/6.3,avail/(9*ISO+1.4),130);TH=TW*ISO;ox=W/2;
 const bh=(R/2+1)*TH+1.1*TW;oy=top+(avail-bh)/2+1.1*TW+TH/2;
 if(G.s.map.size)buildGround();
}
function diamond(c,x,y,s=1){c.beginPath();c.moveTo(x,y-TH/2*s);c.lineTo(x+TW/2*s,y);c.lineTo(x,y+TH/2*s);c.lineTo(x-TW/2*s,y);c.closePath()}
const BGZ=['prairie','bois','plage','mont','chateau'],BG={};
function bgOf(){const id=G.F&&ZONES[G.F.zi].id;if(!BGZ.includes(id))return null;
 if(!(id in BG)){BG[id]=null;const i=new Image();i.onload=()=>{BG[id]=i;if(G.s.map.size&&G.F&&ZONES[G.F.zi].id===id)buildGround()};i.src='assets/bg/'+id+'.webp'}return BG[id]}
function buildGround(){const S=G.s,theme=S.theme,bg=bgOf();
 ground=document.createElement('canvas');ground.width=W*dpr;ground.height=H*dpr;const g=ground.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 g.fillStyle='#16220f';g.fillRect(0,0,W,H);
 if(bg){const k=Math.max(W/bg.width,H/bg.height);g.drawImage(bg,(W-bg.width*k)/2,(H-bg.height*k)/2,bg.width*k,bg.height*k);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,W,H)}
 const r0=Math.floor(-oy/(TH/2))-2,r1=Math.ceil((H-oy)/(TH/2))+2,cm=Math.ceil(W/TW)+2,rr=mulberry(G.F.seed*13);outer=[];
 const tl=(t,sx,sy)=>{const[ts,ti]=TIL(t),f=AT[ts][ti],s=TW*1.04/f[2];g.drawImage(IMG[ts],f[0],f[1],f[2],f[3],sx-TW*.52,sy-TH*.52,f[2]*s,f[3]*s*ISO*2)};
 for(let r=r0;r<=r1;r++)for(let c=-cm;c<=cm;c++){if((r+c)&1)continue;const x=(r+c)/2,y=(r-c)/2,[sx,sy]=scr(x,y),m=cell(S,x,y);
  if(m){if(bg){g.globalAlpha=.62;tl(m.t,sx,sy);g.globalAlpha=1}else tl(m.t,sx,sy)}else if(!bg){const t=theme.g[Math.floor(rr()*theme.g.length)];tl(t===4||t===8?theme.g[0]:t,sx,sy);diamond(g,sx,sy,1.02);g.fillStyle='rgba(8,14,6,.55)';g.fill();
   const dist=Math.max(Math.abs(c)-CMAX,-r,r-R);if(dist>=2&&rr()<.1)outer.push({x,y,d:pick(rr,theme.out||(dist>2&&rr()<.12?[10,9,11]:[0,1,1,2,0,4,7]))})}}
 for(const m of S.map.values())if(m.flower){const[sx,sy]=scr(m.x,m.y);const f=AT.deco[5];drawF(g,'deco',5,sx,sy+TH*.1,TW*.7/f[2])}
 // liseré du plateau
 g.strokeStyle=bg?'rgba(255,240,200,.28)':'rgba(255,240,200,.08)';g.lineWidth=1;for(const m of S.map.values()){const[sx,sy]=scr(m.x,m.y);diamond(g,sx,sy,.98);g.stroke()}
}
// Convertit un toucher (px,py) en case ; si une unité est touchée, renvoie sa case.
export function tapCell(px,py){const{sel,reachC}=G,S=G.s;
 const a=(px-ox)/(TW/2),b=(py-oy)/(TH/2),g={x:Math.round((a+b)/2),y:Math.round((b-a)/2)},k=K(g.x,g.y);
 const now=S.units.filter(u=>!u.dead).sort((a,b)=>(b.gx+b.gy)-(a.gx+a.gy)),box=(u,w)=>{const[sx,sy]=scr(u.gx,u.gy),top=sy-u.h*TW-(u.fly?TH*.7:0);return Math.abs(px-sx)<TW*w&&py<sy+TH*.4&&py>top-TW*.3?Math.abs(px-sx):null}; // jusqu'à la barre de vie
 // sort choisi : toucher le dessin d'une cible valable la vise, même si un autre personnage est devant
 if(sel){const t=now.map(u=>({u,d:box(u,.42)})).filter(o=>o.d!=null&&sel.cells.some(s=>s.ok&&s.x===o.u.x&&s.y===o.u.y)).sort((a,b)=>a.d-b.d)[0];if(t)return{x:t.u.x,y:t.u.y}}
 if(sel?sel.cells.some(s=>s.ok&&s.x===g.x&&s.y===g.y):reachC&&reachC.dist.get(k)>0)return g;
 for(const u of now){const[sx,sy]=scr(u.gx,u.gy),top=sy-u.h*TW-(u.fly?TH*.7:0);if(Math.abs(px-sx)<TW*.32&&py<sy+TH*.3&&py>top)return{x:u.x,y:u.y}}
 return g}

// ---------- image d'une unité ----------
// Héros V2 (planches ChatGPT) : planche de marche W, planche de poses X
const HN={warrior:{F:['kaelW',[0,1,2,3]],B:['kaelW',[4,5,6,7]],i:['kaelW',0],iB:['kaelW',4],a:['kaelX',1],c:['kaelX',3],b:['kaelX',2],v:['kaelX',3],ko:['kaelK',0]},
 archer:{F:['fennX',[0,1,2,1]],B:['fennB',[1,0,2,3]],i:['fennX',0],iB:['fennB',0],a:['fennX',3],c:['fennX',5],b:['fennX',0],v:['fennX',6],ko:['fennX',7]},
 healer:{F:['aelisX',[0,1,2,3]],B:['aelisB',[1,0,2,3]],i:['aelisX',0],iB:['aelisB',0],a:['aelisX',4],c:['aelisX',5],b:['aelisX',4],v:['aelisX',6],ko:['aelisX',7]}};
export const heroFrame=k=>HN[k].i;
// renvoie [planche, case, miroir, hauteur de référence]
function frameOf(u){const now=performance.now(),p=u.pose&&u.poseT>now?u.pose:'i',right=u.dir===0||u.dir===2,back=u.dir===2||u.dir===3;
 if(u.team==='h'){const h=HN[u.k],rf=AT[h.i[0]][h.i[1]][3];
  if(u.dead)return h.ko?[...h.ko,right,rf]:[...h.i,right,rf];
  if(u.walk){const w=back&&h.B?h.B:h.F;return[w[0],w[1][u.wf%4],right,rf]}
  if(h[p]&&p!=='i')return[...h[p],right,rf];
  if(u.shield>0)return[...h.b,right,rf];
  return[...(back&&h.iB?h.iB:h.i),right,rf]}
 if(u.walk&&AT[u.s+'w'])return[u.s+'w',u.row*4+u.wf%4,right,u.ref];
 if(u.dead&&u.s==='roiG')return['roiG',4,right,u.ref];
 return[u.s,u.row*3+{i:0,a:1,h:2,s:3}[p],right,u.ref]}

// ---------- effets visuels ----------
let fx=[],texts=[],shakeT=0,parts=[],lastA=0;
export function resetFx(){fx=[];texts=[];parts=[]}
export const addFx=(x,y,i,w,dur=550,sh='fx',dy=0)=>fx.push({x,y,i,w,sh,dy,t0:performance.now(),dur});
const dic=(c,s,i,x,y,w)=>{const f=AT[s][i],k=w/Math.max(f[2],f[3]);c.drawImage(IMG[s],f[0],f[1],f[2],f[3],x,y,f[2]*k,f[3]*k)};
export const addProj=(a,b)=>fx.push({proj:1,a:{x:a.x,y:a.y},b,t0:performance.now(),dur:260});
export const shake=ms=>{shakeT=performance.now()+ms};
// impacts : zoom bref vers un point, éclats de particules (coup critique, KO, collision)
let punchE=0,punchP=null;export const punch=(u,k=.05,ms=220)=>{punchE=performance.now()+ms;punchP={x:u.gx,y:u.gy,k,ms}};
export const burst=(u,kind=1)=>{const t0=performance.now();for(let i=0;i<12;i++){const a=Math.random()*6.28,v=.6+Math.random();fx.push({burst:1,x:u.gx,y:u.gy,k:kind,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,t0,dur:650})}};
export function say(u,s,c,big){texts.push({x:u.gx,y:u.gy,s,c,big,t0:performance.now()+texts.filter(t=>t.x===u.gx&&t.y===u.gy&&performance.now()-t.t0<300).length*250})}
export function pose(u,p,ms=380){u.pose=p;u.poseT=performance.now()+ms}
// particules d'ambiance par décor : 0 luciole 1 étincelle 2 feuille 3 neige 4 braise 6 feu follet
const AMB=[[0,2],[0,2,0],[1,0],[1],[3,3],[4,6,4]];
function ambient(now){const dt=Math.min(50,now-(lastA||now));lastA=now;const kinds=AMB[G.F?G.F.th:0]||[0];
 while(parts.length<26){const k=kinds[parts.length%kinds.length],fall=k===2||k===3;parts.push({k,x:Math.random()*W,y:fall?-20-Math.random()*H:Math.random()*H,vx:(Math.random()-.5)*.02,vy:fall?.03+Math.random()*.03:k===4||k===6?-.03-Math.random()*.03:(Math.random()-.5)*.01,s:.12+Math.random()*.14,ph:Math.random()*7,r:Math.random()*6})}
 ctx.save();for(const p of parts){p.x+=p.vx*dt+Math.sin(now/900+p.ph)*.15;p.y+=p.vy*dt;if(p.y>H+30||p.y<-40||p.x<-30||p.x>W+30){Object.assign(p,{x:Math.random()*W,y:p.vy>0?-20:H+20})}
  const f=AT.parts[p.k],w=TW*p.s*(p.k===2?1.4:1);ctx.globalAlpha=p.k===0?.5+.5*Math.sin(now/300+p.ph):.85;ctx.save();ctx.translate(p.x,p.y);if(p.k===2)ctx.rotate(Math.sin(now/600+p.ph)*1.2);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],-w/2,-w/2,w,w*f[3]/f[2]);ctx.restore()}
 ctx.restore()}

// ---------- boucle de dessin ----------
export function draw(now){
 requestAnimationFrame(draw);const{phase,cur,sel,busy,reachC}=G,S=G.s,units=S.units;if(!ground||phase==='camp')return;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality='high';
 const sh=shakeT>now?(Math.random()-.5)*6:0;ctx.translate(sh,sh*.5);
 if(punchE>now){const t=(punchE-now)/punchP.ms,[px,py]=scr(punchP.x,punchP.y),k=1+punchP.k*Math.sin(t*Math.PI);ctx.translate(px,py);ctx.scale(k,k);ctx.translate(-px,-py)}
 ctx.drawImage(ground,0,0,W,H);
 // surbrillances
 if(cur&&cur.team==='h'&&!busy&&phase==='fight'){
  if(sel){for(const c of sel.cells){const[sx,sy]=scr(c.x,c.y);diamond(ctx,sx,sy,.92);ctx.fillStyle=c.ok?'rgba(255,140,40,.62)':c.los?'rgba(255,170,60,.22)':'rgba(120,120,140,.28)';ctx.fill()}}
  else if(reachC)for(const[k,d]of reachC.dist){if(!d)continue;const[x,y]=k.split(',').map(Number),[sx,sy]=scr(x,y);diamond(ctx,sx,sy,.9);ctx.fillStyle='rgba(70,160,255,.5)';ctx.fill();ctx.strokeStyle='rgba(220,240,255,.7)';ctx.lineWidth=1.5;ctx.stroke()}}
 if(sel&&cur&&!busy)for(const c of sel.cells)if(c.ok&&occ(S,c.x,c.y)){const[sx,sy]=scr(c.x,c.y),f=AT.parts[8],w=TW*.9;ctx.save();ctx.globalAlpha=.7+.3*Math.sin(now/150);ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,sy-w*f[3]/f[2]/2,w,w*f[3]/f[2]);ctx.restore()}
 // cible visée par un monstre : losange rouge
 if(G.intents&&!busy)for(const t of new Set(G.intents.map(i=>i.target))){const[sx,sy]=scr(t.gx,t.gy);ctx.save();ctx.globalAlpha=.55+.35*Math.sin(now/170);diamond(ctx,sx,sy,.86);ctx.strokeStyle='#ff4a3a';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.stroke();ctx.restore()}
 if(cur&&!cur.dead){const[sx,sy]=scr(cur.gx,cur.gy);ctx.save();ctx.globalAlpha=.6+.3*Math.sin(now/200);diamond(ctx,sx,sy,.8);ctx.strokeStyle='#ffd65a';ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 // objets triés par profondeur
 const L=[];for(const m of S.map.values())if(m.block)L.push({z:m.x+m.y,m});for(const o of outer)L.push({z:o.x+o.y,m:o});
 for(const u of units)if(!u.dead||u.team==='h'||now-u.deadT<(u.s==='roiG'?1800:600))L.push({z:u.gx+u.gy+.01,u});
 L.sort((a,b)=>a.z-b.z);
 const tg=sel&&cur&&!busy?units.filter(u=>!u.dead&&sel.cells.some(c=>c.ok&&c.x===u.x&&c.y===u.y)):[];
 const hides=u=>!tg.includes(u)&&tg.some(t=>u.gx+u.gy>t.gx+t.gy&&u.gx+u.gy-t.gx-t.gy<=3&&Math.abs((u.gx-u.gy)-(t.gx-t.gy))<=1.2);
 for(const o of L){if(o.m){if(o.m.d==null)continue;const[sx,sy]=scr(o.m.x,o.m.y),[ds,di]=DEC(o.m.d),f=AT[ds][di];const z=o.m.x+o.m.y,c0=o.m.x-o.m.y,hide=units.some(u=>!u.dead&&u.gx+u.gy<z&&u.gx+u.gy>=z-3&&Math.abs(u.gx-u.gy-c0)<=1.5);
  drawF(ctx,ds,di,sx,sy+TH*.2,DECO_W[o.m.d]*TW/f[2],false,hide?.45:1);continue}
  const u=o.u,[sx,sy]=scr(u.gx,u.gy),[s,i,flip,rf]=frameOf(u),sc=u.h*TW/rf,al=u.dead&&u.team!=='h'?1-(now-u.deadT)/600:1;
  ctx.save();ctx.globalAlpha=.35*al;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(sx,sy+TH*.08,TW*.28,TH*.22,0,0,7);ctx.fill();ctx.restore();
  const bob=Math.sin(now/300+u.id.charCodeAt(1)*2)*(u.fly?TH*.12:1),lift=u.fly?TH*.7:0,jit=u.pose==='h'&&u.poseT>now?Math.sin(now/25)*3:0;
  const glow=tg.includes(u);if(glow){ctx.save();ctx.shadowColor='#ffb040';ctx.shadowBlur=TW*(.18+.08*Math.sin(now/160))}
  drawF(ctx,s,i,sx+jit,sy+TH*.12-lift+bob-(u.hop||0),sc,flip,hides(u)?.4*al:al);if(glow)ctx.restore();
  if(u.flashT>now){ctx.save();ctx.globalCompositeOperation='lighter';drawF(ctx,s,i,sx+jit,sy+TH*.12-lift+bob-(u.hop||0),sc,flip,.85*(u.flashT-now)/120);ctx.restore()}}
 // barres de vie
 for(const u of units){if(u.dead)continue;const[sx,sy]=scr(u.gx,u.gy),y=sy-u.h*TW-(u.fly?TH*.7:0)-4-(u.hop||0),w=TW*.6;
  ctx.fillStyle='#000c';ctx.fillRect(sx-w/2-1,y-1,w+2,7);ctx.fillStyle=u.team==='h'?'#5fd35a':'#e0493a';ctx.fillRect(sx-w/2,y,w*Math.max(0,u.hp)/u.max,5);
  {const ss=[u.shield>0&&1,u.buff&&12,u.poison&&8].filter(Boolean),z=TW*.24;ss.forEach((i,n)=>dic(ctx,'ico',i,sx+(n-ss.length/2)*z,y-z-3,z))}}
 // trajet de poussée prévu
 if(sel&&sel.sp.push&&cur&&!busy)for(const c of sel.cells){const o=c.ok&&occ(S,c.x,c.y);if(!o)continue;const p=pushPlan(S,cur,o,sel.sp.push),[ax,ay]=scr(o.x,o.y),[bx,by]=scr(p.to.x,p.to.y);
  ctx.save();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=3;ctx.globalAlpha=.9;if(p.to.x!==o.x||p.to.y!==o.y){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();const a=Math.atan2(by-ay,bx-ax);ctx.beginPath();ctx.moveTo(bx+Math.cos(a)*8,by+Math.sin(a)*8);ctx.lineTo(bx+Math.cos(a+2.4)*10,by+Math.sin(a+2.4)*10);ctx.lineTo(bx+Math.cos(a-2.4)*10,by+Math.sin(a-2.4)*10);ctx.fill()}
  if(p.left){ctx.font=`900 ${Math.round(TW*.24)}px system-ui`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';const t='-'+5*p.left,z=TW*.3;dic(ctx,'fxi',1,bx-ctx.measureText(t).width/2-z-2,by-TH*.1-z*.85,z);ctx.strokeText(t,bx,by-TH*.1);ctx.fillStyle='#ffa040';ctx.fillText(t,bx,by-TH*.1)}ctx.restore()}
 // intentions : bulle au-dessus de chaque monstre
 if(G.intents&&!busy){ctx.font=`800 ${Math.round(TW*.19)}px system-ui`;ctx.textAlign='center';for(const it of G.intents){const u=it.m,[sx,sy]=scr(u.gx,u.gy),y=sy-u.h*TW-(u.fly?TH*.7:0)-TW*.3,t=it.dmg.join('–'),h=TW*.28,iw=h*.95,w=ctx.measureText(t).width+14+iw,[tx,ty]=scr(it.target.gx,it.target.gy);
  ctx.save();ctx.strokeStyle='rgba(255,74,58,.75)';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.lineDashOffset=-now/40;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+tx)/2,Math.min(sy,ty)-TH,tx,ty);ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(40,8,6,.85)';ctx.strokeStyle='#ff6b5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(sx-w/2,y-h*.75,w,h,6);ctx.fill();ctx.stroke();dic(ctx,'ico',0,sx-w/2+4,y-h*.75+(h-iw)/2,iw);ctx.fillStyle='#ffd9d2';ctx.fillText(t,sx+iw/2,y)}}
 // effets
 if(cur&&!cur.dead&&phase==='fight'){const[sx,sy]=scr(cur.gx,cur.gy),f=AT.parts[10],w=TW*.32,y=sy-cur.h*TW-(cur.fly?TH*.7:0)-TW*.42+Math.sin(now/180)*4;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx-w/2,y-w*f[3]/f[2],w,w*f[3]/f[2])}
 ambient(now);
 fx=fx.filter(e=>now-e.t0<e.dur);for(const e of fx){const t=(now-e.t0)/e.dur;
  if(e.burst){const[sx,sy]=scr(e.x,e.y),f=AT.parts[e.k],w=TW*.22*(1-t*.5),el=t*e.dur/16;ctx.save();ctx.globalAlpha=1-t;ctx.drawImage(IMG.parts,f[0],f[1],f[2],f[3],sx+e.vx*el*2.2-w/2,sy-TW*.5+(e.vy*el+.045*el*el)*1.6-w/2,w,w*f[3]/f[2]);ctx.restore();continue}
  if(e.proj){const[ax,ay]=scr(e.a.x,e.a.y),[bx,by]=scr(e.b.x,e.b.y),x=ax+(bx-ax)*t,y=ay+(by-ay)*t-TW*.6-Math.sin(t*Math.PI)*TW*.4;
   const f=AT.fx[6];ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(by-ay-Math.PI*Math.cos(t*Math.PI)*TW*.4,bx-ax));ctx.drawImage(IMG.fx,f[0],f[1],f[2],f[3],-TW*.45,-TW*.45*f[3]/f[2],TW*.9,TW*.9*f[3]/f[2]);ctx.restore();continue}
  const[sx,sy]=scr(e.x,e.y),f=AT[e.sh||'fx'][e.i],s=(e.w||1.3)*TW/f[2]*(.7+.4*Math.min(1,t*3));
  ctx.save();ctx.globalAlpha=t<.6?1:1-(t-.6)/.4;ctx.drawImage(IMG[e.sh||'fx'],f[0],f[1],f[2],f[3],sx-f[2]*s/2,sy+TH*.3-f[3]*s+(e.dy||0)*TW,f[2]*s,f[3]*s);ctx.restore()}
 texts=texts.filter(e=>now-e.t0<1000);ctx.textAlign='center';for(const e of texts){const t=(now-e.t0)/1000,[sx,sy]=scr(e.x,e.y);
  const pop=1+.7*Math.min(1,Math.max(0,1-(now-e.t0)/140));ctx.font=`900 ${Math.round(TW*(e.big?.58:.42)*pop)}px system-ui`;ctx.globalAlpha=t<.7?1:1-(t-.7)/.3;ctx.lineWidth=4;ctx.strokeStyle='#000';const y=sy-TW*1.1-t*30;ctx.strokeText(e.s,sx,y);ctx.fillStyle=e.c;ctx.fillText(e.s,sx,y);ctx.globalAlpha=1}
}
