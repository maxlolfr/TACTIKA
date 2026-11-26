// Règles du combat : aucune dépendance au navigateur (ni DOM, ni canvas, ni son, ni horloge).
// Tout l'état d'un combat vit dans un objet `s` (voir newBattle). Les fonctions qui changent
// quelque chose renvoient des « événements » que l'affichage rejoue (texte, effet, son…).
import {DIRS,R,CMAX,THEMES,HER,MON,ITEMS,PUSH_DMG,COMBO,STAR_ROUNDS,FORGE_COST,FORGE_STEP} from './data.js';

export const K=(x,y)=>x+','+y;
export const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function mulberry(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const ri=(rng,a,b)=>a+Math.floor(rng()*(b-a+1));
export const pick=(rng,a)=>a[Math.floor(rng()*a.length)];

// ---------- état et grille ----------
export const newBattle=(rng=Math.random)=>({map:new Map(),units:[],order:[],theme:null,rng,killedXp:0,round:1});
export const cell=(s,x,y)=>s.map.get(K(x,y));
export const occ=(s,x,y)=>s.units.find(u=>!u.dead&&u.x===x&&u.y===y);
export const passable=(s,x,y)=>{const c=cell(s,x,y);return !!c&&!c.block&&!c.water};

// Génère la carte (graine fixe = même carte) ; renvoie les cases de départ {hs,es}.
export function genMap(s,seed,th){
 for(let tries=0;tries<40;tries++){
  const rng=s.rng=mulberry(seed+tries*31);s.theme=THEMES[th];const theme=s.theme;s.map=new Map();
  for(let r=0;r<=R;r++)for(let c=-CMAX;c<=CMAX;c++){if((r+c)&1)continue;const x=(r+c)/2,y=(r-c)/2;s.map.set(K(x,y),{x,y,t:pick(rng,theme.g)})}
  const all=[...s.map.values()];
  const hs=[[14,-2],[14,0],[14,2]].map(([r,c])=>({x:(r+c)/2,y:(r-c)/2}));
  const es=[[2,-4],[2,-2],[2,0],[2,2],[2,4],[3,-3],[3,-1],[3,1],[3,3],[4,0],[4,-2],[4,2]].map(([r,c])=>({x:(r+c)/2,y:(r-c)/2}));
  const safe=p=>[...hs,...es].some(q=>Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<=1);
  for(let w=0;w<theme.water;w++){let p=pick(rng,all);for(let k=0;k<5;k++){const c=cell(s,p.x,p.y);if(c&&!safe(c)){c.water=1;c.t=4}const d=pick(rng,DIRS);p={x:p.x+d[0],y:p.y+d[1]}}}
  for(let w=0;w<(theme.rock||0);w++){let p=pick(rng,all);for(let k=0;k<3;k++){const c=cell(s,p.x,p.y);if(c&&!safe(c)){c.block=1;c.t=8}const d=pick(rng,DIRS);p={x:p.x+d[0],y:p.y+d[1]}}}
  for(const c of all){if(c.water||c.block||safe(c))continue;if(rng()<.13){c.block=1;c.d=pick(rng,theme.obs)}else if(!theme.noflower&&rng()<.07)c.flower=1}
  // tous les ennemis doivent être joignables
  const seen=new Set([K(hs[1].x,hs[1].y)]),q=[hs[1]];
  while(q.length){const p=q.shift();for(const d of DIRS){const nx=p.x+d[0],ny=p.y+d[1],k=K(nx,ny);if(!seen.has(k)&&passable(s,nx,ny)){seen.add(k);q.push({x:nx,y:ny})}}}
  if([...hs,...es].every(p=>seen.has(K(p.x,p.y))))return{hs,es};
  if(tries===39){for(const c of s.map.values()){delete c.block;delete c.water;delete c.d;if(c.t===4||c.t===8)c.t=theme.g[0]}return{hs,es}} // secours : plateau dégagé
 }
}

// ---------- progression ----------
export const xpNeed=l=>60*l;
// ---------- forge ----------
// Niveau d'amélioration d'un objet (0 à 3), valeur d'une caractéristique à un niveau donné, coût du niveau suivant (null = maximum).
export const upLvl=(save,j)=>(save.up&&save.up[j])||0;
export const itemVal=(o,k,l)=>o[k]?Math.round(o[k]*(1+FORGE_STEP*l)):0;
export const upCost=(save,j)=>FORGE_COST[upLvl(save,j)]??null;
// Améliore l'objet j si possédé, pas au maximum et assez d'or. Renvoie le nouveau niveau, ou 0 si refusé.
export function upgrade(save,j){const c=upCost(save,j);if(!save.items.includes(j)||c==null||save.gold<c)return 0;
 save.gold-=c;(save.up||(save.up={}))[j]=upLvl(save,j)+1;return save.up[j]}
export function heroStats(save,i){const h=HER[i],it=save.items.filter(j=>ITEMS[j].who===i),m=1+.1*(save.lvl-1);
 const sum=k=>it.reduce((a,j)=>a+itemVal(ITEMS[j],k,upLvl(save,j)),0);return{hp:Math.round(h.hp*m)+sum('hp'),dmg:sum('dmg'),heal:sum('heal'),mult:1+.06*(save.lvl-1)}}
// Ajoute de l'XP, renvoie le nombre de niveaux gagnés.
export function gainXp(save,xp){save.xp+=xp;let up=0;while(save.xp>=xpNeed(save.lvl)){save.xp-=xpNeed(save.lvl);save.lvl++;up++}return up}

// ---------- unités ----------
// hstats = heroStats de chacun des 3 héros. L'affichage ajoute ensuite `ref` (hauteur du sprite).
export function mkUnits(s,F,hs,es,hstats){const n=F.lvl,rng=s.rng;
 s.units=[];s.killedXp=0;
 HER.forEach((h,i)=>{const st=hstats[i];s.units.push({id:'h'+i,team:'h',k:h.k,n:h.n,hi:i,x:hs[i].x,y:hs[i].y,gx:hs[i].x,gy:hs[i].y,hp:st.hp,max:st.hp,maxPA:6,maxPM:3,pa:6,pm:3,init:h.init+rng(),
  sp:h.sp,cd:{},dmgB:st.dmg,healB:st.heal,mult:st.mult,dir:2,h:1.3})});
 const pool=F.pool,cnt=Math.min(3+Math.floor((n-1)/2),8),sc=1+.12*(n-1);
 const spots=[...es].sort(()=>rng()-.5);
 for(let i=0;i<cnt;i++){const B=i===0&&F.boss,t=B?B.k:pick(rng,pool),m=MON[t],boss=!!B,p=spots[i];
  const hp=Math.round(m.hp*sc*(boss?B.hp:1)),dm=m.dmg.map(v=>Math.round(v*(1+.1*(n-1))*(boss?B.dmg:1)));
  s.units.push({id:'m'+i,team:'m',k:t,s:m.s,row:m.row,n:boss?B.n:m.n,x:p.x,y:p.y,gx:p.x,gy:p.y,hp,max:hp,maxPA:4,maxPM:m.pm,pa:4,pm:m.pm,init:m.init+rng(),
   cd:{},armor:m.armor||0,fly:m.fly,dir:1,h:boss?m.h*B.h:m.h,xp:Math.round(m.xp*(1+.2*(n-1))*(boss?4:1)),
   atk:{snd:m.snd,n:'Attaque',pa:4,r:m.r||[1,1],t:'enemy',los:m.los,dmg:dm,poison:m.poison,fx:m.fx??0,proj:m.r?1:0}})}
 s.order=[...s.units].sort((a,b)=>b.init-a.init);
}
export function face(u,x,y){const dx=x-u.x,dy=y-u.y;if(!dx&&!dy)return;u.dir=Math.abs(dx)>=Math.abs(dy)?(dx>0?0:3):(dy>0?1:2)}

// ---------- déplacement, portée, ligne de vue ----------
// Cases atteignables en au plus maxd pas (obstacles, eau et unités bloquent).
export function reach(s,u,maxd){const dist=new Map([[K(u.x,u.y),0]]),prev=new Map(),q=[[u.x,u.y]];
 while(q.length){const[x,y]=q.shift(),d=dist.get(K(x,y));if(d>=maxd)continue;
  for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy,k=K(nx,ny);if(dist.has(k)||!passable(s,nx,ny)||occ(s,nx,ny))continue;dist.set(k,d+1);prev.set(k,K(x,y));q.push([nx,ny])}}
 return{dist,prev}}
// Chemin [[x,y],…] de la position de u jusqu'à la case k, d'après `prev` de reach().
export function pathTo(u,k,prev){const path=[];while(k&&k!==K(u.x,u.y)){path.unshift(k.split(',').map(Number));k=prev.get(k)}return path}
export function los(s,a,b,ign){const n=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*4;
 for(let i=1;i<n;i++){const t=i/n,x=Math.round(a.x+(b.x-a.x)*t+1e-4),y=Math.round(a.y+(b.y-a.y)*t-1e-4);
  if((x===a.x&&y===a.y)||(x===b.x&&y===b.y))continue;const c=cell(s,x,y);if(!c||c.block)return false;const o=occ(s,x,y);if(o&&o!==ign)return false}return true}
export function okTarget(s,u,sp,c,from=u){const d=man(from,c);if(d<sp.r[0]||d>sp.r[1])return 0;if(sp.los&&d>1&&!los(s,from,c,u))return 0;const o=occ(s,c.x,c.y);
 if(sp.t==='self')return c.x===from.x&&c.y===from.y;if(sp.t==='cell')return !!cell(s,c.x,c.y);if(!o)return 0;return sp.t==='enemy'?o.team!==u.team:o.team===u.team}
export function selCells(s,u,sp){const out=[];for(const c of s.map.values()){const d=man(u,c);if(d<sp.r[0]||d>sp.r[1])continue;
 out.push({x:c.x,y:c.y,los:!sp.los||d<=1||los(s,u,c,u),ok:okTarget(s,u,sp,c)})}return out}

// ---------- dégâts, sorts ----------
// Bouclier : dégâts ÷2 ; armure en % ; au moins 1 dégât. Renvoie un événement, ou null si la cible est déjà morte.
export function hurt(s,t,amt,src,crit){if(t.dead)return null;if(t.shield>0)amt=Math.ceil(amt*.5);amt=Math.max(1,Math.round(amt*(1-(t.armor||0))));t.hp-=amt;
 let killed=false;if(t.hp<=0){t.hp=0;t.dead=true;killed=true;if(t.team==='m')s.killedXp+=t.xp}
 return{type:'hurt',t,amt,src,crit:!!crit,killed}}
// Paie le coût d'un sort (PA, recharge) et tourne l'unité vers la cible.
export function payCost(u,sp,c){u.pa-=sp.pa;if(sp.cd)u.cd[sp.n]=sp.cd;face(u,c.x,c.y)}
// Applique l'effet d'un sort sur la case c (après payCost). Renvoie la liste d'événements.
export function applySpell(s,u,sp,c){
 const ev=[],rng=s.rng,tg=sp.zone?[c,...DIRS.map(d=>({x:c.x+d[0],y:c.y+d[1]}))]:[c],buff=u.buff?1+u.buff.pct:1;
 for(const p of tg){const t=occ(s,p.x,p.y);
  if(sp.zone){ev.push({type:'fx',x:p.x,y:p.y,i:sp.fx,w:.9});if(!t||t.team===u.team)continue}else ev.push({type:'fx',x:p.x,y:p.y,i:sp.fx,w:sp.fx===7?1.4:1.3});
  if(!t)continue;
  let cb=1;if(sp.dmg&&u.team==='h'&&t.team!==u.team){const hb=t.hitBy||(t.hitBy=new Set()),fresh=!hb.has(u.id);hb.add(u.id);cb=COMBO[hb.size];if(fresh&&hb.size>1)ev.push({type:'combo',t,n:hb.size})}
  if(sp.dmg){const cr=rng()<.12,h=hurt(s,t,(ri(rng,...sp.dmg)+(u.dmgB||0))*(u.mult||1)*buff*cb*(cr?1.5:1),0,cr);if(h)ev.push(h);if(cr)ev.push({type:'shake',ms:220})}
  if(sp.push&&!t.dead)ev.push(...push(s,t,pushPlan(s,u,t,sp.push)));
  if(sp.heal){const v=Math.round((ri(rng,...sp.heal)+(u.healB||0))*(u.mult||1)),g=Math.min(v,t.max-t.hp);t.hp+=g;ev.push({type:'heal',t,amt:g})}
  if(sp.poison&&!t.dead)t.poison={d:sp.poison[0],turns:sp.poison[1]};
  if(sp.shield){t.shield=1;ev.push({type:'status',t,text:'Rempart',color:'#9fd0ff'})}
  if(sp.buff){t.buff={pct:sp.buff,turns:2};ev.push({type:'status',t,text:'+30 %',color:'#ffd65a'})}
  if(sp.pmBonus){t.pm+=sp.pmBonus;ev.push({type:'status',t,text:'+2 PM',color:'#7fd0ff'})}}
 if(sp.shake)ev.push({type:'shake',ms:250});
 return ev}

// ---------- poussée ----------
// Trajet d'une poussée de n cases depuis `from` : case d'arrivée, cases non parcourues, unité percutée.
export function pushPlan(s,from,t,n){const dx=Math.sign(t.x-from.x),dy=Math.sign(t.y-from.y);let x=t.x,y=t.y,left=n,hit=null;
 if(dx&&dy)return{to:{x,y},left:0,hit}; // pas de poussée en diagonale (n'arrive pas : Fracas est au corps à corps)
 while(left>0){const nx=x+dx,ny=y+dy;hit=occ(s,nx,ny)||null;if(!passable(s,nx,ny)||hit)break;x=nx;y=ny;left--}
 return{to:{x,y},left,hit:left?hit:null}}
// Applique un trajet de pushPlan : déplace t, puis 5 dégâts par case non parcourue (à t et à l'unité percutée).
export function push(s,t,p){const ev=[{type:'push',t,to:p.to}];t.x=p.to.x;t.y=p.to.y;
 if(p.left){ev.push({type:'collision',t});ev.push(hurt(s,t,PUSH_DMG*p.left,'collision'));if(p.hit)ev.push(hurt(s,p.hit,PUSH_DMG,'collision'))}
 return ev.filter(Boolean)}

// ---------- tours ----------
// Début de tour : PA/PM remis au maximum, recharges et bouclier diminuent d'un tour.
export function beginTurn(u){delete u.hitBy;u.pa=u.maxPA;u.pm=u.maxPM;for(const k in u.cd)if(u.cd[k]>0)u.cd[k]--;if(u.shield>0)u.shield--}
// Poison en début de tour : dégâts puis un tour de moins. Renvoie les événements.
export function poisonTick(s,u){if(!u.poison)return[];const ev=[{type:'fx',x:u.x,y:u.y,i:5,w:.9},hurt(s,u,u.poison.d,'poison')];if(--u.poison.turns<=0)delete u.poison;return ev.filter(Boolean)}
// Fin de tour : le bonus de dégâts diminue d'un tour.
export function endTurn(u){if(u.buff&&--u.buff.turns<=0)delete u.buff}
// null tant que le combat continue, sinon 'win' ou 'lose'.
export function outcome(s){const h=s.units.some(u=>u.team==='h'&&!u.dead),m=s.units.some(u=>u.team==='m'&&!u.dead);return h&&m?null:(h?'win':'lose')}

// Étoiles d'un combat gagné : victoire, aucun héros KO, fini en 5 tours de table (boss : 7).
export const starList=(s,boss)=>[true,!s.units.some(u=>u.team==='h'&&u.dead),s.round<=STAR_ROUNDS[boss?'boss':'fight']];
export const stars=(s,boss)=>starList(s,boss).filter(Boolean).length;

// ---------- IA ennemie ----------
// Prochaine action d'un monstre : {type:'cast',sp,target} | {type:'move',to,prev} | null (rien à faire).
export function aiStep(s,u){
 const sp=u.atk,heroes=s.units.filter(h=>h.team==='h'&&!h.dead);if(!heroes.length)return null;
 if(u.pa>=sp.pa){const t=heroes.filter(h=>okTarget(s,u,sp,h)).sort((a,b)=>a.hp-b.hp)[0];if(t)return{type:'cast',sp,target:t}}
 if(u.pm<=0)return null;
 const rc=reach(s,u,u.pm);let best=null,bs=1e9;
 // champ de distance vers les héros (les autres monstres sont ignorés)
 const fd=new Map(),q=[];for(const h of heroes){fd.set(K(h.x,h.y),0);q.push(h)}
 while(q.length){const p=q.shift(),d=fd.get(K(p.x,p.y));for(const[dx,dy]of DIRS){const nx=p.x+dx,ny=p.y+dy,k=K(nx,ny);if(fd.has(k)||!passable(s,nx,ny))continue;fd.set(k,d+1);q.push({x:nx,y:ny})}}
 for(const[k,d]of rc.dist){const[x,y]=k.split(',').map(Number),from={x,y};
  const can=u.pa>=sp.pa&&heroes.some(h=>okTarget(s,u,sp,h,from));const sc=can?d-(sp.r[1]>1?(fd.get(k)??0)*2:0):100+(fd.get(k)??99)*10+d;if(sc<bs){bs=sc;best=k}}
 return best&&best!==K(u.x,u.y)?{type:'move',to:best,prev:rc.prev}:null}
// Intention d'un monstre : ce qu'il ferait s'il jouait maintenant (simulation à blanc, l'état est remis en place).
export function intent(s,u){const keep={x:u.x,y:u.y,pa:u.pa,pm:u.pm};u.pa=u.maxPA;u.pm=u.maxPM;let r=null;
 for(let g=0;g<6;g++){const a=aiStep(s,u);if(!a)break;if(a.type==='cast'){r={target:a.target,dmg:a.sp.dmg,from:{x:u.x,y:u.y}};break}
  const[x,y]=a.to.split(',').map(Number);u.pm-=reach(s,u,u.pm).dist.get(a.to);u.x=x;u.y=y}
 Object.assign(u,keep);return r}
