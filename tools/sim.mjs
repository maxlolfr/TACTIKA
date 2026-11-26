// Simulateur d'équilibrage : joue la campagne complète N fois avec les vraies règles (rules.js).
// Héros = joueur automatique simple (glouton : meilleur sort atteignable, soins sous 55 % de PV) ; monstres = aiStep du jeu.
// Usage : node tools/sim.mjs pilote [graines=10] [missions=bois1,bois3,loup]  (3 profils × graines × missions : les 3 missions pilotes V4.5)
//         node tools/sim.mjs [campagnes]   (campagne entière : très coûteux, seulement avec l'accord de Max)
// Règle de Max (V4.5) : au plus 100 combats simulés par étape. Le total est affiché à la fin.
// Limite connue : le bot joue moins bien qu'un bon joueur (pas de placement défensif ni de poussée vers un obstacle).
import {SP,HER,ZONES,ITEMS,zlen,PA_RULE} from '../src/data.js';
if(process.env.VAR_A||process.env.NO_B)PA_RULE.recast=0;
import {newBattle,genMap,mkUnits,heroStats,gainXp,reach,okTarget,occ,man,payCost,applySpell,beginTurn,poisonTick,endTurn,outcome,aiStep,stars,pick,ri,fightSpec,bossTurn,mulberry,waveTick,waveEmpty,costOf} from '../src/rules.js';

const PILOT=process.argv[2]==='pilote',N=+process.argv[PILOT?3:2]||(PILOT?10:100),MAXR=30;let FIGHTS=0;
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
  for(const id of u.sp){const sp=SP[id];if(u.pa<costOf(u,sp)||u.cd[sp.n]>0)continue;
   for(const c of sp.t==='self'?[p]:cells){if(!okTarget(s,u,sp,c,p))continue;const v=value(s,u,sp,c)-d*.5;if(v>0&&(!b||v>b.v))b={p,d,sp,c,v}}}}
 return b}
function heroTurn(s,u){
 for(let g=0;g<6;g++){const b=best(s,u);if(!b)break;if(b.d){u.pm-=b.d;u.x=b.p.x;u.y=b.p.y}payCost(u,b.sp,b.c);tally(s,applySpell(s,u,b.sp,b.c));if(outcome(s))return}
 if(u.pm>0){const rc=reach(s,u,u.pm),ms=alive(s,'m');let bk=null,bd=1e9; // se rapprocher (l'archer garde 3 cases)
  for(const[k,d]of rc.dist){const[x,y]=k.split(',').map(Number),dd=Math.min(...ms.map(m=>Math.abs(m.x-x)+Math.abs(m.y-y))),sc=Math.abs(dd-(u.hi===1?3:1));if(sc<bd){bd=sc;bk=[x,y,d]}}
  if(bk){u.x=bk[0];u.y=bk[1];u.pm-=bk[2]}}}
function monTurn(s,u){tally(s,bossTurn(s,u));if(outcome(s))return;for(let g=0;g<6&&!u.dead;g++){const a=aiStep(s,u);if(!a)return;
 if(a.type==='cast'){payCost(u,a.sp,a.target);tally(s,applySpell(s,u,a.sp,a.target));if(outcome(s))return;continue}
 const[x,y]=a.to.split(',').map(Number);u.pm-=reach(s,u,u.pm).dist.get(a.to);u.x=x;u.y=y}}

// mesures : dégâts infligés (hit) et reçus (taken) par les héros, soins (heal)
function tally(s,ev){for(const e of ev||[]){if(e.type==='hurt')s.T[e.t.team==='m'?'hit':'taken']+=e.amt;if(e.type==='heal')s.T.heal+=e.amt}}
// Un combat, comme startFight + runFight de l'interface. rs = graine du hasard du combat (reproductible).
function fight(save,zi,i,rs=Math.random()*1e9|0,seed=zi*1000+i*97+save.gold){FIGHTS++;const F=fightSpec(zi,i,seed);
 const s=newBattle(),{hs,es}=genMap(s,F.seed,F.th,F.cry);mkUnits(s,F,hs,es,HER.map((_,j)=>heroStats(save,j)));if(process.env.VAR_A)for(const m of s.units)if(m.team==='m'&&!m.bs&&!m.summon&&!m.chief&&!m.elite){m.maxPA=m.pa=6;m.atk={...m.atk,pa:3}} // variante A (comparaison seulement)
 s.rng=mulberry(rs);s.T={hit:0,taken:0,heal:0};
 let turn=-1;
 while(!outcome(s)&&s.round<=MAXR){const nt=(turn+1)%s.order.length;if(nt===0&&turn>=0){s.round++;if(outcome(s))break;waveTick(s)}turn=nt;const u=s.order[turn];if(u.dead)continue;
  beginTurn(u);if(u.poison){poisonTick(s,u);if(outcome(s)||u.dead)continue}
  u.team==='h'?heroTurn(s,u):monTurn(s,u);endTurn(u);waveEmpty(s)}
 const win=outcome(s)==='win';
 return{win,F,s,round:s.round,ko:s.units.filter(u=>u.team==='h'&&u.dead).length,st:win?stars(s,!!F.boss):0,hpLeft:avg(s.units.filter(u=>u.team==='h').map(u=>u.hp/u.max)),T:s.T,xp:s.killedXp,cleared:!!s.cleared}}
// Récompenses, comme result() de l'interface.
function reward(save,r){const{F,s}=r,z=ZONES[F.zi].id,first=(save.z[z]||0)===F.i,best=save.st[z]||(save.st[z]=[]),new3=r.st===3&&(best[F.i]||0)<3;
 save.gold+=Math.round(((6*F.lvl+ri(Math.random,0,8))*(first?1:.5)+(F.boss&&first?40:0))*(new3?1.5:1));gainXp(save,s.killedXp);
 const free=ITEMS.map((_,i)=>i).filter(i=>!save.items.includes(i));if(free.length&&Math.random()<(F.boss&&first?1:first?.5:.15))save.items.push(pick(Math.random,free));
 best[F.i]=Math.max(best[F.i]||0,r.st);if(first)save.z[z]=F.i+1}

// ---------- mode pilote (V4.5) : 3 missions × 3 profils × graines fixes ----------
// sous = niveau −2, sans objet ni talent · std = niveau de la mission, 4 objets communs, Gardien/Tireur/Guérisseuse · opti = niveau +2, 10 objets rares forge 2, Berserker/Tireur/Enchanteresse
const PROF={sous:{dl:-2,items:[],rr:0,up:0,sp:[null,null,null]},std:{dl:0,items:[0,4,7,5],rr:0,up:0,sp:['gardien','tireur','guerisseuse']},opti:{dl:2,items:[...ITEMS.keys()],rr:1,up:2,sp:['berserk','tireur','enchant']}};
// V4.7c : points de caractéristiques. sous : aucun · std : répartis en trois parts (attaque, Agilité, Vitalité) · opti : tout en attaque
const main=i=>i===2?'int':'for';
PROF.std.attr=(n,i)=>{const a=Math.ceil(n/3),b=Math.ceil((n-a)/2);return{[main(i)]:a,agi:b,vit:n-a-b}};
PROF.opti.attr=(n,i)=>({[main(i)]:n});
const PIL={bois1:['Bois 1 (classique)',1,0],bois3:['Bois 3 (survie)',1,2],loup:['Loup alpha (boss)',1,3],monts3:['Monts 3 (survie)',3,2],chateau3:['Château 3 (survie)',4,2],golem:['Golem ancien (boss)',3,3]};
if(PILOT){const f=x=>x.toFixed(1).replace('.',','),ms=(process.argv[4]||'bois1,bois3,loup').split(',');
 console.log('| Mission | Profil | Niv. | Victoires | Tours | Héros KO | PV restants | Dégâts infligés | Reçus | Soins | XP | Vagues éliminées |\n|---|---|---|---|---|---|---|---|---|---|---|---|');
 for(const m of ms){const[name,zi,i]=PIL[m];for(const[k,p]of Object.entries(PROF)){if(process.env.PROF&&k!==process.env.PROF)continue;const lvl=Math.max(1,ZONES[zi].lvl+i+p.dl),R=[];
  for(let g=1;g<=N;g++){const save={lvl,attr:p.attr&&[0,1,2].map(i=>p.attr(lvl-1,i)),xp:0,gold:0,wpn:[null,null,null],items:[...p.items],rr:Object.fromEntries(p.items.map(j=>[j,p.rr])),up:Object.fromEntries(p.items.map(j=>[j,p.up])),sp:p.sp,z:{},st:{}};R.push(fight(save,zi,i,g*7919,g*97))}
  const W=R.filter(r=>r.win),a=fn=>f(avg(R.map(fn)));
  console.log(`| ${name} | ${k} | ${lvl} | ${W.length}/${N} | ${f(avg(W.map(r=>r.round))||0)} | ${f(avg(R.map(r=>r.ko)))} | ${Math.round(100*avg(R.map(r=>r.hpLeft)))} % | ${a(r=>r.T.hit)} | ${a(r=>r.T.taken)} | ${a(r=>r.T.heal)} | ${a(r=>r.xp)} | ${R[0].F.wave?R.filter(r=>r.cleared).length+'/'+N:'–'} |`)}}
 console.log(`\n${FIGHTS} combats simulés (graines 1 à ${N}, identiques d'une version à l'autre).`);process.exit(0)}

// Campagne : chaque combat dans l'ordre ; après une défaite, on rejoue le dernier combat gagné (pour l'XP) puis on réessaie.
const stats=ZONES.flatMap((z,zi)=>[...Array(zlen(z)).keys()].map(i=>({zi,i,tries:[],firstWin:0,rounds:[],st:[0,0,0,0],ko:[],hp:[],lvl:[],grind:[],stuck:0})));
for(let n=0;n<N;n++){const save={lvl:1,xp:0,gold:0,items:[],z:{},st:{}};
 for(const S of stats){let t=0,gr=0,r;S.lvl.push(save.lvl);
  while(true){t++;r=fight(save,S.zi,S.i);if(r.win)break;if(t>=25){S.stuck++;break}
   const prev=S.i?[S.zi,S.i-1]:S.zi?[S.zi-1,zlen(ZONES[S.zi-1])-1]:null;if(prev){const g=fight(save,...prev);if(g.win){reward(save,g);gr++}}}
  if(!r.win)break; // campagne bloquée
  if(t===1)S.firstWin++;S.tries.push(t);S.grind.push(gr);S.rounds.push(r.round);S.st[r.st]++;S.ko.push(r.ko);S.hp.push(r.hpLeft);reward(save,r)}}

const f=(x,d=1)=>x.toFixed(d).replace('.',',');
console.log(`| Combat | Monstres | Niv. équipe | Victoire 1er essai | Essais | Rejoués | Tours | ★1/★2/★3 | Héros KO | PV restants |\n|---|---|---|---|---|---|---|---|---|---|`);
for(const S of stats){const z=ZONES[S.zi],n=S.tries.length||1;
 console.log(`| ${z.n} · ${S.i===zlen(z)-1?'Boss':S.i+1} | ${z.fights?z.fights[S.i].en.length+(S.i===zlen(z)-1):Math.min(3+Math.floor((z.lvl+S.i-1)/2),8)} | ${f(avg(S.lvl))} | ${Math.round(100*S.firstWin/(S.lvl.length||1))} % | ${f(avg(S.tries))} | ${f(avg(S.grind))} | ${f(avg(S.rounds))} | ${S.st.slice(1).map(x=>Math.round(100*x/n)).join(' / ')} % | ${f(avg(S.ko),2)} | ${Math.round(100*avg(S.hp))} % |`+(S.stuck?` bloqué ${S.stuck}×`:''))}
console.log(`\n${N} campagnes simulées, ${FIGHTS} combats ; « bloqué » = 25 défaites de suite sur ce combat (campagne arrêtée).`)
