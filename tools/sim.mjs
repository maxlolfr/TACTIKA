// Simulateur d'équilibrage : joue la campagne complète N fois avec les vraies règles (rules.js).
// Héros = joueur automatique simple (glouton : meilleur sort atteignable, soins sous 55 % de PV) ; monstres = aiStep du jeu.
// Usage : node tools/sim.mjs [campagnes=100] > rapport.md
// Limite connue : le bot joue moins bien qu'un bon joueur (pas de placement défensif ni de poussée vers un obstacle).
import {SP,HER,ZONES,ITEMS} from '../src/data.js';
import {newBattle,genMap,mkUnits,heroStats,gainXp,reach,okTarget,occ,man,payCost,applySpell,beginTurn,poisonTick,endTurn,outcome,aiStep,stars,pick,ri} from '../src/rules.js';

const N=+process.argv[2]||100,MAXR=30;
const alive=(s,t)=>s.units.filter(u=>u.team===t&&!u.dead);
const avg=a=>(a.reduce((x,y)=>x+y,0)/a.length)||0;

// Valeur d'un sort sur la case c (0 = inutile).
function value(s,u,sp,c){const t=occ(s,c.x,c.y),buff=u.buff?1+u.buff.pct:1;
 if(sp.heal){if(!t)return 0;const miss=t.max-t.hp;return t.hp<t.max*.55?Math.min(miss,15)*1.5:0}
 if(sp.buff)return t&&t.hi===0&&!t.buff&&alive(s,'m').length>1?8:0;
 if(sp.shield)return alive(s,'m').filter(m=>man(m,u)<=2).length>=2?7:0;
 if(sp.pmBonus)return 0;
 const tg=sp.zone?[c,{x:c.x+1,y:c.y},{x:c.x-1,y:c.y},{x:c.x,y:c.y+1},{x:c.x,y:c.y-1}]:[c];let v=0;
 for(const p of tg){const m=occ(s,p.x,p.y);if(!m||m.team===u.team)continue;const d=(sp.dmg[0]+sp.dmg[1])/2*(u.mult||1)*buff*(1-(m.armor||0));v+=Math.min(d,m.hp)+(d>=m.hp?10:0)+(sp.poison?4:0)}
 return v}
// Meilleure action : {p (case d'où lancer), sp, c, v}.
function best(s,u){const rc=reach(s,u,u.pm);let b=null;
 const cells=s.units.filter(x=>!x.dead).map(x=>({x:x.x,y:x.y}));
 for(const[k,d]of rc.dist){const[x,y]=k.split(',').map(Number),p={x,y};
  for(const id of u.sp){const sp=SP[id];if(u.pa<sp.pa||u.cd[sp.n]>0)continue;
   for(const c of sp.t==='self'?[p]:cells){if(!okTarget(s,u,sp,c,p))continue;const v=value(s,u,sp,c)-d*.5;if(v>0&&(!b||v>b.v))b={p,d,sp,c,v}}}}
 return b}
function heroTurn(s,u){
 for(let g=0;g<6;g++){const b=best(s,u);if(!b)break;if(b.d){u.pm-=b.d;u.x=b.p.x;u.y=b.p.y}payCost(u,b.sp,b.c);applySpell(s,u,b.sp,b.c);if(outcome(s))return}
 if(u.pm>0){const rc=reach(s,u,u.pm),ms=alive(s,'m');let bk=null,bd=1e9; // se rapprocher (l'archer garde 3 cases)
  for(const[k,d]of rc.dist){const[x,y]=k.split(',').map(Number),dd=Math.min(...ms.map(m=>Math.abs(m.x-x)+Math.abs(m.y-y))),sc=Math.abs(dd-(u.hi===1?3:1));if(sc<bd){bd=sc;bk=[x,y,d]}}
  if(bk){u.x=bk[0];u.y=bk[1];u.pm-=bk[2]}}}
function monTurn(s,u){for(let g=0;g<6&&!u.dead;g++){const a=aiStep(s,u);if(!a)return;
 if(a.type==='cast'){payCost(u,a.sp,a.target);applySpell(s,u,a.sp,a.target);if(outcome(s))return;continue}
 const[x,y]=a.to.split(',').map(Number);u.pm-=reach(s,u,u.pm).dist.get(a.to);u.x=x;u.y=y}}

// Un combat, comme startFight + runFight de l'interface.
function fight(save,zi,i){const Z=ZONES[zi],F={zi,i,lvl:Z.lvl+i,pool:Z.pool,boss:i===3?Z.boss:null,seed:zi*1000+i*97+save.gold,th:Z.th[i%Z.th.length]};
 const s=newBattle(),{hs,es}=genMap(s,F.seed,F.th);mkUnits(s,F,hs,es,HER.map((_,j)=>heroStats(save,j)));s.rng=Math.random;
 let turn=-1;
 while(!outcome(s)&&s.round<=MAXR){const nt=(turn+1)%s.order.length;if(nt===0&&turn>=0)s.round++;turn=nt;const u=s.order[turn];if(u.dead)continue;
  beginTurn(u);if(u.poison){poisonTick(s,u);if(outcome(s)||u.dead)continue}
  u.team==='h'?heroTurn(s,u):monTurn(s,u);endTurn(u)}
 const win=outcome(s)==='win';
 return{win,F,s,round:s.round,ko:s.units.filter(u=>u.team==='h'&&u.dead).length,st:win?stars(s,!!F.boss):0,hpLeft:avg(s.units.filter(u=>u.team==='h').map(u=>u.hp/u.max))}}
// Récompenses, comme result() de l'interface.
function reward(save,r){const{F,s}=r,z=ZONES[F.zi].id,first=(save.z[z]||0)===F.i,best=save.st[z]||(save.st[z]=[]),new3=r.st===3&&(best[F.i]||0)<3;
 save.gold+=Math.round(((6*F.lvl+ri(Math.random,0,8))*(first?1:.5)+(F.boss&&first?40:0))*(new3?1.5:1));gainXp(save,s.killedXp);
 const free=ITEMS.map((_,i)=>i).filter(i=>!save.items.includes(i));if(free.length&&Math.random()<(F.boss&&first?1:first?.5:.15))save.items.push(pick(Math.random,free));
 best[F.i]=Math.max(best[F.i]||0,r.st);if(first)save.z[z]=F.i+1}

// Campagne : chaque combat dans l'ordre ; après une défaite, on rejoue le dernier combat gagné (pour l'XP) puis on réessaie.
const stats=ZONES.flatMap((z,zi)=>[0,1,2,3].map(i=>({zi,i,tries:[],firstWin:0,rounds:[],st:[0,0,0,0],ko:[],hp:[],lvl:[],grind:[],stuck:0})));
for(let n=0;n<N;n++){const save={lvl:1,xp:0,gold:0,items:[],z:{},st:{}};
 for(const S of stats){let t=0,gr=0,r;S.lvl.push(save.lvl);
  while(true){t++;r=fight(save,S.zi,S.i);if(r.win)break;if(t>=25){S.stuck++;break}
   const prev=S.i?[S.zi,S.i-1]:S.zi?[S.zi-1,3]:null;if(prev){const g=fight(save,...prev);if(g.win){reward(save,g);gr++}}}
  if(!r.win)break; // campagne bloquée
  if(t===1)S.firstWin++;S.tries.push(t);S.grind.push(gr);S.rounds.push(r.round);S.st[r.st]++;S.ko.push(r.ko);S.hp.push(r.hpLeft);reward(save,r)}}

const f=(x,d=1)=>x.toFixed(d).replace('.',',');
console.log(`| Combat | Monstres | Niv. équipe | Victoire 1er essai | Essais | Rejoués | Tours | ★1/★2/★3 | Héros KO | PV restants |\n|---|---|---|---|---|---|---|---|---|---|`);
for(const S of stats){const z=ZONES[S.zi],n=S.tries.length||1;
 console.log(`| ${z.n} · ${S.i===3?'Boss':S.i+1} | ${Math.min(3+Math.floor((z.lvl+S.i-1)/2),8)} | ${f(avg(S.lvl))} | ${Math.round(100*S.firstWin/(S.lvl.length||1))} % | ${f(avg(S.tries))} | ${f(avg(S.grind))} | ${f(avg(S.rounds))} | ${S.st.slice(1).map(x=>Math.round(100*x/n)).join(' / ')} % | ${f(avg(S.ko),2)} | ${Math.round(100*avg(S.hp))} % |`+(S.stuck?` bloqué ${S.stuck}×`:''))}
console.log(`\n${N} campagnes simulées ; « bloqué » = 25 défaites de suite sur ce combat (campagne arrêtée).`)
