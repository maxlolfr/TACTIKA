// V5.08 : ambiances procédurales des 12 régions (aucune image ajoutée), dessinées par-dessus le plateau.
// Principes : très discret (opacités faibles, petites particules), jamais d'effet qui masque une case ou une barre de vie,
// sprites de lueur pré-rendus (un drawImage par particule, pas de dégradé par image), peu de particules (N), « Effets réduits » : N réduit,
// pas de papillons, pas de pulsations ni de vent (lueurs fixes). Aucune règle de jeu n'est touchée.
// Régions (G.F.th) : 0/2 prairie · 1 bois · 3 plage · 4 monts · 5 château · 6 cristal · 7 braise · 8 sables · 9 marais · 10 citadelle · 11 givre · 12 éther
let W=0,H=0,TW=0,TH=0,LF=false,HI=false,E=null,SC=1; // V5.11 : HI = réglage graphique Haut (particules ×1,7)
const SPR={},rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],TAU=Math.PI*2;
// sprite de lueur : disque flou de couleur « r,g,b »
function sp(c){const k=c+'';if(SPR[k])return SPR[k];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,`rgba(${k},1)`);g.addColorStop(.35,`rgba(${k},.5)`);g.addColorStop(1,`rgba(${k},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return SPR[k]=cv}
// teinte (0–360) -> [r,g,b] clair, par pas de 15° (24 sprites au plus)
function hue(h){h=Math.round(h/15)*15%360;const f=n=>{const k=(n+h/30)%12,a=.3;return Math.round(255*(.7-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]}
// vent : de -1 à 1, irrégulier, lent
const wind=now=>LF?0:.55*Math.sin(now/2900)+.45*Math.sin(now/1100+2);
const env=p=>Math.sin(Math.PI*Math.min(1,p.life/p.max));
// ---------- fabriques de couches ----------
const L=(n,lf,init,step,draw,mode)=>({n,lf,init,step,draw,mode:mode||'source-over',a:[]});
function run(c,l,now,dt){const n=LF?l.lf:HI?Math.round(l.n*1.7):l.n;if(!n){l.a.length=0;return}
 while(l.a.length<n){const p={};l.init(p,1);l.a.push(p)}if(l.a.length>n)l.a.length=n;c.globalCompositeOperation=l.mode;
 for(const p of l.a){l.step(p,dt,now);if(p.dead){p.dead=0;l.init(p,0)}l.draw(c,p,now)}}
// grains lumineux : pollen, spores, embruns, poussière, sable, neige, particules magiques
const motes=o=>L(o.n,o.lf,(p,f)=>{p.max=rnd(...o.life);p.life=f?rnd(0,p.max):0;p.x=rnd(-.05*W,1.05*W);p.y=rnd(o.y[0],o.y[1])*H;p.vx=rnd(...o.vx);p.vy=rnd(...o.vy);
  p.r=rnd(...o.r);p.ph=rnd(0,7);p.a=rnd(...o.a);p.s=sp(pick(o.cols))},
 (p,dt,now)=>{p.life+=dt;if(p.life>p.max){p.dead=1;return}const w=1+(o.wind||0)*wind(now);p.x+=p.vx*w*dt*SC+Math.sin(now/(o.sw||800)+p.ph)*(o.sway||.1);p.y+=p.vy*dt*SC+Math.cos(now/(o.sw||800)*.8+p.ph)*(o.sway||.1)*.5},
 (c,p,now)=>{let a=env(p)*p.a;if(o.blink)a*=.5+.5*Math.sin(now/o.blink+p.ph*3);if(a<.01)return;const r=p.r*SC;c.globalAlpha=a;c.drawImage(p.s,p.x-r,p.y-r,2*r,2*r)},o.mode);
// nappes de brume / nuages / écume : grandes ellipses floues très transparentes qui dérivent
const mist=o=>L(o.n,o.lf,(p,f)=>{p.max=rnd(...o.life);p.life=f?rnd(0,p.max):0;p.w=rnd(...o.w)*W;p.h=p.w*o.hm;p.x=rnd(0,W);p.y=rnd(o.y[0],o.y[1])*H;p.vx=rnd(.4,1)*o.sp*(o.dir||(Math.random()<.5?-1:1));p.s=sp(pick(o.cols));p.a=o.a*rnd(.6,1)},
 (p,dt,now)=>{p.life+=dt;if(p.life>p.max){p.dead=1;return}p.x+=p.vx*dt*SC*(1+(o.wind||0)*wind(now))},
 (c,p)=>{c.globalAlpha=env(p)*p.a;c.drawImage(p.s,p.x-p.w/2,p.y-p.h/2,p.w,p.h)},o.mode);
// traînées de vent : fines lignes presque invisibles
const streaks=o=>L(o.n,o.lf,(p,f)=>{p.max=rnd(1800,3600);p.life=f?rnd(0,p.max):0;p.x=rnd(-.1*W,W);p.y=rnd(o.y[0],o.y[1])*H;p.len=rnd(.08,.22)*W;p.vx=rnd(.04,.09)*o.dir;p.ph=rnd(0,7)},
 (p,dt)=>{p.life+=dt;if(p.life>p.max){p.dead=1;return}p.x+=p.vx*dt*SC},
 (c,p,now)=>{c.globalAlpha=env(p)*o.a;c.strokeStyle=`rgb(${o.c})`;c.lineWidth=Math.max(1,TW*.012);c.lineCap='round';c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+p.len/2,p.y+Math.sin(now/900+p.ph)*TW*.12,p.x+p.len,p.y);c.stroke()});
// ---------- couches particulières ----------
const butterflies=L(3,0,(p,f)=>{p.max=rnd(9000,14000);p.life=f?rnd(0,p.max):0;p.x=rnd(0,W);p.y0=rnd(.3,.75)*H;p.vx=rnd(.012,.02);p.ph=rnd(0,7);p.col=pick(['#f4b24a','#9fc8f0','#f0f0e8','#e98fb0'])},
 (p,dt)=>{p.life+=dt;if(p.life>p.max){p.dead=1;return}p.x+=p.vx*dt*SC;if(p.x>W+30)p.x=-30},
 (c,p,now)=>{const s=TW*.07,f=.25+.75*Math.abs(Math.sin(now/105+p.ph)),y=p.y0+Math.sin(now/1300+p.ph)*H*.035+Math.sin(now/330+p.ph)*2;
  c.globalAlpha=.85*Math.min(1,env(p)*3);c.save();c.translate(p.x,y);c.rotate(Math.sin(now/800+p.ph)*.3);c.fillStyle=p.col;
  for(const sg of[-1,1]){c.save();c.scale(sg*f,1);c.beginPath();c.ellipse(s*.5,-s*.2,s*.5,s*.36,-.4,0,TAU);c.fill();c.beginPath();c.ellipse(s*.36,s*.3,s*.32,s*.25,.4,0,TAU);c.fill();c.restore()}
  c.fillStyle='#3a2a20';c.fillRect(-s*.04,-s*.36,s*.08,s*.72);c.restore()});
const leaves=L(9,3,(p,f)=>{p.max=rnd(9000,15000);p.life=f?rnd(0,p.max):0;p.x=rnd(0,W);p.y=f?rnd(0,H):-12;p.vy=rnd(.012,.026);p.vx=rnd(-.004,.012);p.s=rnd(.045,.075);p.ph=rnd(0,7);p.col=pick(['96,140,60','150,150,60','190,130,50','70,110,55'])},
 (p,dt,now)=>{p.life+=dt;p.y+=p.vy*dt*SC;p.x+=p.vx*dt*SC*(1+.8*wind(now))+Math.sin(now/700+p.ph)*.18;if(p.y>H+14||p.life>p.max){p.dead=1}},
 (c,p,now)=>{const s=p.s*TW,a=Math.min(1,p.y/60+.2,(H+14-p.y)/60);c.globalAlpha=.62*Math.max(0,a);c.save();c.translate(p.x,p.y);c.rotate(Math.sin(now/600+p.ph)*1.1+p.ph);c.fillStyle=`rgb(${p.col})`;c.beginPath();c.ellipse(0,0,s,s*.42,0,0,TAU);c.fill();
  c.strokeStyle='rgba(30,50,20,.45)';c.lineWidth=1;c.beginPath();c.moveTo(-s,0);c.lineTo(s,0);c.stroke();c.restore()});
const feathers=L(7,2,(p,f)=>{p.max=rnd(10000,16000);p.life=f?rnd(0,p.max):0;p.x=rnd(0,W);p.y=f?rnd(0,H):-12;p.vy=rnd(.01,.022);p.vx=rnd(-.004,.008);p.s=rnd(.06,.1);p.ph=rnd(0,7)},
 (p,dt,now)=>{p.life+=dt;p.y+=p.vy*dt*SC;p.x+=p.vx*dt*SC+Math.sin(now/900+p.ph)*.22;if(p.y>H+14||p.life>p.max)p.dead=1},
 (c,p,now)=>{const s=p.s*TW,a=Math.min(1,p.y/60+.2,(H+14-p.y)/60);c.globalAlpha=.7*Math.max(0,a);c.save();c.translate(p.x,p.y);c.rotate(Math.sin(now/1000+p.ph)*.9+.5);c.fillStyle='rgba(255,250,240,.92)';c.beginPath();c.ellipse(0,0,s,s*.17,0,0,TAU);c.fill();
  c.strokeStyle='rgba(185,175,165,.85)';c.lineWidth=1;c.beginPath();c.moveTo(-s*1.15,0);c.lineTo(s,0);c.stroke();c.restore()});
const glints=L(12,4,(p,f)=>{p.max=rnd(900,1900);p.life=f?rnd(0,p.max):0;p.x=rnd(.03*W,.97*W);p.y=rnd(.12*H,.95*H);p.r=rnd(.05,.1)*TW;p.h=rnd(0,360)},
 (p,dt)=>{p.life+=dt;if(p.life>p.max)p.dead=1},
 (c,p,now)=>{const e=Math.pow(env(p),2),r=p.r,h=hue(p.h+now/40);c.globalAlpha=e*.7;c.drawImage(sp(h),p.x-r*1.6,p.y-r*1.6,r*3.2,r*3.2);c.globalAlpha=e*.9;c.strokeStyle='rgb(255,255,255)';c.lineWidth=Math.max(1,TW*.014);c.beginPath();c.moveTo(p.x-r,p.y);c.lineTo(p.x+r,p.y);c.moveTo(p.x,p.y-r*1.3);c.lineTo(p.x,p.y+r*1.3);c.stroke()},'lighter');
const prismHaze=L(2,0,(p,f)=>{p.max=rnd(9000,14000);p.life=f?rnd(0,p.max):0;p.w=rnd(.4,.6)*W;p.x=rnd(0,W);p.y=rnd(.3,.9)*H;p.k=rnd(0,360);p.vx=rnd(.004,.01)*(Math.random()<.5?-1:1)},
 (p,dt)=>{p.life+=dt;p.x+=p.vx*dt*SC;if(p.life>p.max)p.dead=1},
 (c,p,now)=>{c.globalAlpha=env(p)*.06;c.drawImage(sp(hue(p.k+now/60)),p.x-p.w/2,p.y-p.w*.2,p.w,p.w*.4)},'lighter');
// braises de la Forteresse : trois classes (étincelle vive, braise, grosse braise lente) qui virent du jaune au rouge en montant
const embers=L(24,6,(p,f)=>{const k=Math.random(),c=k<.5?0:k<.88?1:2;p.c=c;p.max=c===0?rnd(1400,2600):c===1?rnd(2600,5200):rnd(5000,8000);p.life=f?rnd(0,p.max):0;
  p.x=rnd(0,W);p.y=f?rnd(.4*H,1.05*H):H*rnd(.78,1.02);p.vy=-(c===0?rnd(.04,.07):c===1?rnd(.02,.05):rnd(.012,.025));p.vx=rnd(-.006,.012);p.r=c===0?rnd(.5,1):c===1?rnd(.9,1.9):rnd(2.2,3.2);p.ph=rnd(0,7);p.fl=rnd(60,140)},
 (p,dt,now)=>{p.life+=dt;if(p.life>p.max||p.y<-10){p.dead=1;return}p.y+=p.vy*dt*SC;p.x+=p.vx*dt*SC*(1+.9*wind(now))+Math.sin(now/(380+p.ph*60)+p.ph)*.3*(p.c===2?1.4:1)},
 (c,p,now)=>{const t=p.life/p.max,s=t<.35?SC0:t<.7?SC1:SC2,a=Math.min(1,p.life/400)*Math.min(1,(p.max-p.life)/700)*(.5+.5*Math.sin(now/p.fl+p.ph*3))*(p.c===2?.8:.9);
  if(a<.02)return;const r=p.r*SC*3;c.globalAlpha=a;c.drawImage(s(),p.x-r,p.y-r,2*r,2*r)},'lighter');
const SC0=()=>sp([255,215,130]),SC1=()=>sp([255,125,35]),SC2=()=>sp([225,55,15]);
// reflets de bord : lueurs discrètes qui s'allument sur des segments de la bordure du plateau (moitié basse, côté lave)
const edgeGlints=(rgb,n,a)=>L(n,0,(p,f)=>{p.max=rnd(1800,4200);p.life=f?rnd(0,p.max):0;const S=E&&E.segs.length?E.segs.filter(s=>(s[1]+s[3])/2>E.y0+(E.y1-E.y0)*.45):[];const s=S.length?pick(S):null;p.sg=s;p.t=Math.random();p.ph=rnd(0,7)},
 (p,dt)=>{p.life+=dt;if(p.life>p.max)p.dead=1},
 (c,p,now)=>{const s=p.sg;if(!s)return;const x=s[0]+(s[2]-s[0])*p.t,y=s[1]+(s[3]-s[1])*p.t,r=TW*.4;c.globalAlpha=env(p)*a*(.7+.3*Math.sin(now/110+p.ph));c.drawImage(sp(rgb),x-r,y-r,2*r,2*r)},'lighter');
// ---------- bordure du plateau (reflets) ----------
function edge(c,main,light,a){if(!E)return;c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';c.globalAlpha=1;
 const g=c.createLinearGradient(0,E.y0,0,E.y1);g.addColorStop(0,`rgba(${main},${a*.3})`);g.addColorStop(.6,`rgba(${light},${a})`);g.addColorStop(1,`rgba(${light},${a*1.5})`);c.strokeStyle=g;c.lineWidth=TW*.045;c.stroke(E.path)}
// ---------- composition par région ----------
const WARM=['255,236,150','255,246,200'];
const REG={
 // R1 prairie : pollen doré, papillons, brise légère
 0:{layers:[motes({n:22,lf:6,cols:[WARM[0],WARM[1]],r:[2.6,5.2],a:[.4,.7],vx:[.008,.02],vy:[-.004,.008],life:[5000,9000],y:[.15,1],sway:.12,wind:.8,blink:900}),streaks({n:3,lf:0,c:'255,255,240',a:.05,dir:1,y:[.2,.85]}),butterflies]},
 // R2 bois : feuilles flottantes et lucioles
 1:{layers:[leaves,motes({n:10,lf:3,cols:['200,255,110','170,240,120'],r:[3,6],a:[.5,.9],vx:[-.006,.006],vy:[-.006,.004],life:[4000,8000],y:[.25,1],sway:.25,sw:1300,blink:700,mode:'lighter'})]},
 // R3 plage : écume et embruns
 3:{layers:[mist({n:4,lf:2,cols:['240,250,255'],w:[.35,.6],hm:.22,y:[.78,1],a:.09,sp:.012,life:[6000,10000],wind:.5}),motes({n:20,lf:5,cols:['235,245,255','250,252,255'],r:[1.5,3.2],a:[.3,.55],vx:[.012,.035],vy:[-.03,-.008],life:[1300,2800],y:[.45,1],sway:.15,wind:.9})]},
 // R4 monts : poussière et vent de montagne
 4:{layers:[streaks({n:4,lf:0,c:'235,230,220',a:.07,dir:1,y:[.15,.9]}),motes({n:20,lf:5,cols:['205,190,165','190,180,165'],r:[1.5,3],a:[.3,.5],vx:[.03,.07],vy:[-.004,.012],life:[2200,4200],y:[.1,1],sway:.1,wind:1,sw:600})]},
 // R5 château : brume et poussière spectrales
 5:{layers:[mist({n:3,lf:2,cols:['150,125,205'],w:[.28,.42],hm:.35,y:[.25,1],a:.11,sp:.006,life:[8000,13000],wind:.3}),mist({n:1,lf:0,cols:['90,200,200'],w:[.28,.38],hm:.35,y:[.5,1],a:.08,sp:.005,life:[8000,12000]}),
  motes({n:14,lf:4,cols:['200,185,255','170,240,240'],r:[2.5,5],a:[.3,.6],vx:[-.005,.006],vy:[-.018,-.005],life:[3500,7000],y:[.25,1],sway:.2,sw:1100,blink:500,mode:'lighter'})],rim:{main:'150,120,220',light:'210,190,255',a:.05}},
 // R6 cristal : scintillements prismatiques
 6:{layers:[prismHaze,glints]},
 // R7 braise : braises, lueur de lave qui pulse, reflets sur la bordure
 7:{layers:[embers,edgeGlints('255,140,50',3,.5)],pre:(c,now)=>{const k=LF?.5:.5+.25*Math.sin(now/1700)+.25*Math.sin(now/2900+1.3);c.globalCompositeOperation='lighter';c.globalAlpha=1;
   const g=c.createLinearGradient(0,H,0,H*.55);g.addColorStop(0,`rgba(255,90,20,${.07+.09*k})`);g.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=g;c.fillRect(0,H*.55,W,H*.45);
   for(let i=0;i<2;i++){const q=LF?.5:.5+.5*Math.sin(now/(1300+i*770)+i*2.1);c.globalAlpha=.06+.1*q;c.drawImage(sp([255,100,25]),W*(.28+.44*i)-W*.22,H*.98-H*.08,W*.44,H*.16)}
   edge(c,'255,105,30','255,175,80',LF?.14:.09+.1*k)}},
 // R8 sables : sable porté par le vent
 8:{layers:[mist({n:3,lf:1,cols:['230,200,140'],w:[.4,.6],hm:.18,y:[.5,1],a:.08,sp:.03,dir:1,life:[3500,6000],wind:1}),motes({n:26,lf:6,cols:['225,185,110','240,205,135'],r:[1.4,3],a:[.3,.55],vx:[.035,.08],vy:[.001,.014],life:[1800,3600],y:[.25,1],sway:.08,wind:1,sw:500})]},
 // R9 marais : brume rampante et spores
 9:{layers:[mist({n:5,lf:2,cols:['110,150,115'],w:[.4,.6],hm:.2,y:[.6,1],a:.11,sp:.006,life:[8000,13000]}),motes({n:16,lf:4,cols:['190,230,120','150,220,150'],r:[3,6],a:[.35,.75],vx:[-.004,.005],vy:[-.016,-.006],life:[4000,8000],y:[.35,1],sway:.2,sw:1200,blink:600,mode:'lighter'})]},
 // R10 citadelle : nuages mouvants et plumes
 10:{layers:[mist({n:4,lf:2,cols:['255,255,255'],w:[.35,.55],hm:.32,y:[0,1],a:.1,sp:.008,dir:1,life:[10000,16000]}),feathers]},
 // R11 givre : neige et vent glacial
 11:{layers:[streaks({n:4,lf:0,c:'205,230,255',a:.07,dir:1,y:[.15,.9]}),mist({n:2,lf:1,cols:['200,225,255'],w:[.4,.6],hm:.2,y:[.65,1],a:.08,sp:.01,life:[7000,11000],wind:.6}),
  motes({n:30,lf:8,cols:['240,248,255'],r:[2.2,4.6],a:[.5,.85],vx:[.008,.022],vy:[.022,.05],life:[3500,7000],y:[-.05,.6],sway:.1,wind:1.2,sw:700})],rim:{main:'160,205,255',light:'225,240,255',a:.06}},
 // R12 éther : particules magiques et pulsations dorées
 12:{layers:[motes({n:20,lf:5,cols:['255,215,110','190,140,255','255,235,170'],r:[3,6.5],a:[.45,.9],vx:[-.005,.005],vy:[-.03,-.01],life:[3500,7000],y:[.3,1],sway:.2,sw:1000,blink:600,mode:'lighter'})],
  post:(c,now)=>{const k=LF?.5:.5+.5*Math.sin(now/1800);edge(c,'255,200,90','255,235,170',.07+.09*k);
   if(!LF&&E){const t=(now%7500)/7500;if(t<.65){const u=t/.65,r=TW*(1+6.5*u);c.globalCompositeOperation='lighter';c.globalAlpha=.14*(1-u)*(1-u);c.strokeStyle='rgb(255,215,120)';c.lineWidth=TW*.06*(1-u)+1;c.beginPath();c.ellipse(E.cx,E.cy,r,r*TH/TW,0,0,TAU);c.stroke()}}}}
};
let cur=null,curTh=-1;
export const resetAmb=()=>{cur=null;curTh=-1};
// dessine l'ambiance de la région th ; rim = bordure du plateau (voir render.js), env = dimensions et « Effets réduits »
export function drawAmb(c,th,now,dt,rim,o){W=o.W;H=o.H;TW=o.TW;TH=o.TH;LF=o.lf;HI=!!o.hi;E=rim;SC=Math.max(.8,TW/70);
 if(curTh!==th||!cur){curTh=th;const d=REG[th]||REG[0];cur={layers:d.layers.map(l=>({...l,a:[]})),pre:d.pre,post:d.post,rim:d.rim}}
 c.save();if(cur.pre)cur.pre(c,now);for(const l of cur.layers)run(c,l,now,dt);if(cur.rim)edge(c,cur.rim.main,cur.rim.light,LF?cur.rim.a:cur.rim.a*(.7+.3*Math.sin(now/2300)));if(cur.post)cur.post(c,now);c.restore()}
