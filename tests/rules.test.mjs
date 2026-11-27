// Tests des règles de combat (Node, sans navigateur) : npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SP,HER,MON,ZONES,ITEMS,THEMES,addOrion} from '../src/data.js';
import {talentFx,cleanSp,SPECS,tiersOf} from '../src/talents.js';
import {K,mulberry,newBattle,cell,occ,passable,genMap,mkUnits,heroStats,gainXp,xpNeed,reach,pathTo,los,okTarget,selCells,
 hurt,payCost,applySpell,stepOn,beginTurn,poisonTick,endTurn,outcome,aiStep,pushPlan,push,stars,starList,intent,upgrade,upCost,itemVal,targetsFrom,guideSetup,approach,carryPA,forecast,zoneCells,zoneCenter,teamOf,swapTeam,knownSpells,loadoutOf,swapSpell,iceTick} from '../src/rules.js';

// petit terrain vide 12x12, sans obstacle
function arena(){const s=newBattle(()=>0.5);for(let x=0;x<12;x++)for(let y=0;y<12;y++)s.map.set(K(x,y),{x,y,t:0});return s}
let uid=0;
function unit(s,team,x,y,o={}){const u={id:(team==='h'?'h':'m')+(uid++),team,x,y,gx:x,gy:y,hp:50,max:50,maxPA:6,maxPM:3,pa:6,pm:3,cd:{},dir:0,...o};s.units.push(u);return u}
const seqRng=a=>{let i=0;return()=>a[i++%a.length]};
const FIGHT={lvl:1,pool:['slime','boar'],boss:null};
const HS=[0,1,2].map(i=>({hp:HER[i].hp,dmg:0,heal:0,mult:1}));

test('données : chaque sort de héros et chaque monstre de zone existent', () => {
 for(const h of HER)for(const id of h.sp)assert.ok(SP[id],id);
 for(const z of ZONES){for(const m of z.pool)assert.ok(MON[m],m);assert.ok(MON[z.boss.k],z.boss.k);for(const t of z.th)assert.ok(THEMES[t])}
 for(const it of ITEMS)for(const w of (Array.isArray(it.who)?it.who:[it.who]))assert.ok(HER[w]);
});

test('carte : même graine = même carte, tous les départs sont joignables', () => {
 for(let seed=0;seed<60;seed++){const th=seed%THEMES.length,a=newBattle(),b=newBattle();
  const ra=genMap(a,seed*97,th),rb=genMap(b,seed*97,th);
  assert.ok(ra,'carte générée seed '+seed);
  assert.deepEqual([...a.map.values()],[...b.map.values()]);
  const u={x:ra.hs[1].x,y:ra.hs[1].y},d=reach(a,u,99).dist;
  for(const p of [...ra.hs,...ra.es])assert.ok(d.has(K(p.x,p.y)),`départ ${p.x},${p.y} injoignable (seed ${seed})`)}
});

test('unités : 3 héros, monstres proportionnels au niveau, boss renforcé', () => {
 const s=newBattle(),{hs,es}=genMap(s,5,0);
 mkUnits(s,{lvl:1,pool:['slime'],boss:null},hs,es,HS);
 assert.equal(s.units.filter(u=>u.team==='h').length,3);
 assert.equal(s.units.filter(u=>u.team==='m').length,3);
 const s2=newBattle(),g2=genMap(s2,5,0);mkUnits(s2,{lvl:20,pool:['slime'],boss:null},g2.hs,g2.es,HS);
 assert.equal(s2.units.filter(u=>u.team==='m').length,8,'8 monstres au maximum');
 const s3=newBattle(),g3=genMap(s3,5,0);mkUnits(s3,{lvl:1,pool:['slime'],boss:ZONES[0].boss},g3.hs,g3.es,HS);
 const boss=s3.units.find(u=>u.id==='m0');assert.equal(boss.n,'Roi Gelée');assert.ok(boss.hp>MON.slime.hp*3);
 assert.equal(s3.order.length,6);
 for(let i=1;i<s3.order.length;i++)assert.ok(s3.order[i-1].init>=s3.order[i].init,'ordre par initiative');
});

test('PM : reach respecte la limite, les obstacles, l\'eau et les unités', () => {
 const s=arena(),u=unit(s,'h',5,5);
 const d=reach(s,u,3).dist;
 assert.equal(d.get(K(5,5)),0);assert.equal(d.get(K(8,5)),3);assert.ok(!d.has(K(9,5)));assert.ok(!d.has(K(7,7)),'4 pas en diagonale');assert.equal(d.get(K(6,6)),2);
 s.map.get(K(6,5)).block=1;s.map.get(K(5,6)).water=1;unit(s,'m',4,5);
 const d2=reach(s,u,3).dist;
 assert.ok(!d2.has(K(6,5))&&!d2.has(K(5,6))&&!d2.has(K(4,5)));
 assert.ok(d2.has(K(5,4)));
 assert.equal(d2.get(K(7,5)),4>3?undefined:3,'contournement trop long');
});
test('PM : pathTo suit les pas jusqu\'à la case', () => {
 const s=arena(),u=unit(s,'h',2,2),r=reach(s,u,3),p=pathTo(u,K(4,3),r.prev);
 assert.equal(p.length,3);assert.deepEqual(p.at(-1),[4,3]);
 let c=[2,2];for(const q of p){assert.equal(Math.abs(q[0]-c[0])+Math.abs(q[1]-c[1]),1);c=q}
});

test('ligne de vue : obstacle et unité bloquent, case adjacente toujours vue', () => {
 const s=arena(),a=unit(s,'h',2,5),b={x:8,y:5};
 assert.ok(los(s,a,b,a));
 s.map.get(K(5,5)).block=1;assert.ok(!los(s,a,b,a));s.map.get(K(5,5)).block=0;
 const mid=unit(s,'m',5,5);assert.ok(!los(s,a,b,a));assert.ok(los(s,a,b,mid),'unité ignorée');
 s.units.pop();assert.ok(los(s,a,b,a));
 s.map.get(K(3,5)).block=1;assert.ok(los(s,a,{x:3,y:5},a),'une case adjacente (ou la cible) n\'est jamais bloquante');
});

test('portée et cibles : okTarget', () => {
 const s=arena(),k=unit(s,'h',5,5),en=unit(s,'m',4,5),far=unit(s,'m',5,9),ally=unit(s,'h',6,5);
 assert.ok(okTarget(s,k,SP.slash,en),'corps à corps');assert.ok(!okTarget(s,k,SP.slash,far),'trop loin');assert.ok(!okTarget(s,k,SP.slash,ally),'pas un allié');
 assert.ok(okTarget(s,k,SP.shot,far),'tir à distance');assert.ok(!okTarget(s,k,SP.shot,en),'portée mini 2');
 assert.ok(okTarget(s,k,SP.heal,ally));assert.ok(okTarget(s,k,SP.heal,k),'soin sur soi (portée 0)');assert.ok(!okTarget(s,k,SP.heal,en));
 assert.ok(okTarget(s,k,SP.guard,k));assert.ok(!okTarget(s,k,SP.guard,ally));
 assert.ok(okTarget(s,k,SP.volley,{x:5,y:8}),'volée sur case vide');assert.ok(!okTarget(s,k,SP.volley,{x:5,y:20}));
 s.map.get(K(5,7)).block=1;assert.ok(!okTarget(s,k,SP.shot,far),'obstacle sur la ligne');
 const cells=selCells(s,k,SP.shot);assert.ok(cells.some(c=>c.x===5&&c.y===9&&!c.ok&&!c.los),'case hors de vue marquée');
});

test('PA : payCost retire les PA et pose la recharge ; beginTurn remet PA/PM et fait baisser les recharges', () => {
 const s=arena(),u=unit(s,'h',5,5);
 payCost(u,SP.smash,{x:5,y:6});assert.equal(u.pa,2);assert.equal(u.cd[SP.smash.n],1);assert.equal(u.dir,1,'tourné vers la cible');
 payCost(u,SP.guard,u);assert.equal(u.pa,0);assert.equal(u.cd[SP.guard.n],3);
 u.pm=0;beginTurn(u);assert.equal(u.pa,6);assert.equal(u.pm,3);assert.equal(u.cd[SP.smash.n],0);assert.equal(u.cd[SP.guard.n],2);
 beginTurn(u);beginTurn(u);assert.equal(u.cd[SP.guard.n],0);beginTurn(u);assert.equal(u.cd[SP.guard.n],0,'jamais négatif');
});

test('dégâts : bouclier ÷2, armure, minimum 1, mort et XP', () => {
 const s=arena(),t=unit(s,'m',5,5,{hp:40,max:40,xp:9});
 let e=hurt(s,t,10);assert.equal(e.amt,10);assert.equal(t.hp,30);
 t.shield=1;e=hurt(s,t,10);assert.equal(e.amt,5,'bouclier ÷2');assert.equal(t.hp,25);
 t.shield=0;t.armor=.25;e=hurt(s,t,10);assert.equal(e.amt,8,'armure 25 % : 7,5 arrondi');
 e=hurt(s,t,1);assert.equal(e.amt,1,'au moins 1');
 const hp=t.hp;e=hurt(s,t,999);assert.ok(e.killed);assert.equal(t.hp,0);assert.ok(t.dead);assert.equal(s.killedXp,9);
 assert.equal(hurt(s,t,5),null,'un mort ne reçoit plus de dégâts');assert.equal(s.killedXp,9);assert.ok(hp>0);
 const h=unit(s,'h',1,1,{hp:5,max:50});hurt(s,h,50);assert.equal(s.killedXp,9,'la mort d\'un héros ne donne pas d\'XP');
});

test('sort de dégâts : fourchette, bonus d\'objet, niveau, bonus de dégâts, critique ×1,5', () => {
 const s=arena();s.rng=seqRng([0.9,0]); // jet de crit 0.9 (non), dégâts min
 const u=unit(s,'h',5,5),t=unit(s,'m',5,6,{hp:100,max:100});
 applySpell(s,u,SP.slash,t);assert.equal(t.hp,100-10,'Taillade 10 au minimum');
 s.rng=seqRng([0.9,0.999]);applySpell(s,u,SP.slash,t);assert.equal(t.hp,90-14,'14 au maximum');
 s.rng=seqRng([0.05,0]);const ev=applySpell(s,u,SP.slash,t);assert.equal(t.hp,76-15,'critique : 10×1,5');assert.ok(ev.some(e=>e.type==='shake'));assert.ok(ev.find(e=>e.type==='hurt').crit);
 u.dmgB=2;u.mult=1.5;u.buff={pct:.3,turns:2};s.rng=seqRng([0.9,0]);const hp=t.hp;applySpell(s,u,SP.slash,t);
 assert.equal(hp-t.hp,Math.round((10+2)*1.5*1.3),'(dés+objet)×niveau×aura');
});

test('soin : plafonné aux PV max, bonus de bâton', () => {
 const s=arena();s.rng=seqRng([0]);const a=unit(s,'h',5,5),al=unit(s,'h',5,6,{hp:40,max:50});
 let ev=applySpell(s,a,SP.heal,al);assert.equal(al.hp,50,'13 soins mais seulement 10 manquants');assert.equal(ev.find(e=>e.type==='heal').amt,10);
 al.hp=10;a.healB=3;applySpell(s,a,SP.heal,al);assert.equal(al.hp,10+13+3);
});

test('poison : posé par Épine, dégâts à chaque début de tour pendant 2 tours', () => {
 const s=arena();s.rng=seqRng([0.9,0]);const a=unit(s,'h',5,5),t=unit(s,'m',5,7,{hp:100,max:100});
 applySpell(s,a,SP.venom,t);assert.equal(t.hp,100-5);assert.deepEqual(t.poison,{d:4,turns:2});
 let ev=poisonTick(s,t);assert.equal(t.hp,91);assert.equal(t.poison.turns,1);assert.ok(ev.some(e=>e.type==='fx'));
 poisonTick(s,t);assert.equal(t.hp,87);assert.equal(t.poison,undefined,'expiré après 2 tours');
 assert.deepEqual(poisonTick(s,t),[]);
 const tiny=unit(s,'m',1,1,{hp:3,max:3,xp:4,poison:{d:4,turns:2}});poisonTick(s,tiny);assert.ok(tiny.dead&&s.killedXp===4,'le poison peut tuer');
});

test('bouclier : Rempart dure jusqu\'au prochain tour du lanceur et divise les dégâts par 2', () => {
 const s=arena(),k=unit(s,'h',5,5);
 applySpell(s,k,SP.guard,k);assert.equal(k.shield,1);
 assert.equal(hurt(s,k,11).amt,6);
 beginTurn(k);assert.equal(k.shield,0);assert.equal(hurt(s,k,11).amt,11);
});

test('aura et bottes : durée 2 tours, +2 PM', () => {
 const s=arena(),h=unit(s,'h',5,5),k=unit(s,'h',5,6);
 applySpell(s,h,SP.aura,k);assert.deepEqual(k.buff,{pct:.3,turns:2});endTurn(k);assert.ok(k.buff);endTurn(k);assert.equal(k.buff,undefined);
 applySpell(s,k,SP.boots,k);assert.equal(k.pm,5);
});

test('Volée : touche la case visée et les 4 voisines, ennemis seulement', () => {
 const s=arena();s.rng=seqRng([0.9,0]);const a=unit(s,'h',5,2),e1=unit(s,'m',5,6,{hp:50}),e2=unit(s,'m',6,6,{hp:50}),e3=unit(s,'m',7,7,{hp:50}),al=unit(s,'h',4,6,{hp:50});
 const ev=applySpell(s,a,SP.volley,{x:5,y:6});
 assert.equal(ev.filter(e=>e.type==='fx').length,5);
 assert.equal(e1.hp,50-7);assert.equal(e2.hp,50-7);assert.equal(e3.hp,50,'trop loin');assert.equal(al.hp,50,'allié épargné');
});

test('fin de combat : victoire, défaite, en cours', () => {
 const s=arena(),h=unit(s,'h',1,1),m=unit(s,'m',5,5);
 assert.equal(outcome(s),null);m.dead=true;assert.equal(outcome(s),'win');m.dead=false;h.dead=true;assert.equal(outcome(s),'lose');
});

test('IA : attaque si en portée, sinon avance vers un héros, archer reste à distance', () => {
 const s=arena(),h=unit(s,'h',5,5,{hp:30,max:30}),mob=unit(s,'m',5,6,{maxPM:3,pm:3,pa:4,atk:{n:'Attaque',pa:4,r:[1,1],t:'enemy',dmg:[5,6]}});
 let a=aiStep(s,mob);assert.equal(a.type,'cast');assert.equal(a.target,h);
 mob.pa=0;mob.pm=0;assert.equal(aiStep(s,mob),null,'plus de PA ni de PM');
 const far=unit(s,'m',5,10,{maxPM:3,pm:3,pa:4,atk:{n:'Attaque',pa:4,r:[1,1],t:'enemy',dmg:[5,6]}});
 a=aiStep(s,far);assert.equal(a.type,'move');const [x,y]=a.to.split(',').map(Number);assert.ok(Math.abs(x-5)+Math.abs(y-5)<5,'se rapproche');
 const archer=unit(s,'m',5,12,{maxPM:3,pm:3,pa:4,atk:{n:'Attaque',pa:4,r:[1,4],t:'enemy',los:1,dmg:[5,6],proj:1}});
 a=aiStep(s,archer);assert.equal(a.type,'move');const [,y2]=a.to.split(',').map(Number);assert.ok(Math.abs(y2-5)>=2,'un tireur ne se colle pas au héros');
 a=aiStep(s,Object.assign(archer,{x:7,y:7}));assert.equal(a.type,'cast');
 const lone=newBattle();assert.equal(aiStep(lone,mob),null,'pas de héros vivant');
});

test('progression : XP, niveaux multiples, stats avec objets', () => {
 const sv={lvl:1,xp:0,items:[]};
 assert.equal(gainXp(sv,59),0);assert.equal(sv.xp,59);assert.equal(gainXp(sv,1),1);assert.equal(sv.lvl,2);assert.equal(sv.xp,0);
 assert.equal(gainXp(sv,xpNeed(2)+xpNeed(3)+5),2);assert.equal(sv.lvl,4);assert.equal(sv.xp,5);
 const st1=heroStats({lvl:1,items:[]},0);assert.equal(st1.hp,62);assert.equal(st1.mult,1);
 const st=heroStats({lvl:4,items:[0,2]},0);assert.equal(st.hp,Math.round(62*1.3)+8);assert.equal(st.dmg,2);assert.ok(Math.abs(st.mult-1.18)<1e-9);
 assert.equal(heroStats({lvl:1,items:[7]},2).heal,3);assert.equal(heroStats({lvl:1,items:[7]},0).heal,0,'objet d\'un autre héros ignoré');
});

test('combat simulé : une partie complète IA contre IA se termine sans erreur', () => {
 for(let seed=0;seed<12;seed++){const s=newBattle(),zi=seed%5,Z=ZONES[zi],{hs,es}=genMap(s,seed*31,Z.th[0]);
  mkUnits(s,{lvl:Z.lvl,pool:Z.pool,boss:seed%2?Z.boss:null},hs,es,HS);s.rng=mulberry(seed);
  // les héros jouent comme des monstres (attaque de base) : on vérifie seulement que la boucle de règles progresse
  for(const u of s.units)if(u.team==='h')Object.assign(u,{atk:{n:'Coup',pa:3,r:[1,1],t:'enemy',dmg:[20,26]}});
  let rounds=0;
  while(!outcome(s)&&rounds<200){rounds++;for(const u of s.order){if(u.dead||outcome(s))continue;beginTurn(u);for(const e of poisonTick(s,u));
   for(let g=0;g<6&&!u.dead;g++){const a=aiStep(s,u);if(!a)break;
    if(a.type==='cast'){payCost(u,a.sp,a.target);applySpell(s,u,a.sp,a.target)}
    else{const p=pathTo(u,a.to,a.prev);for(const[x,y]of p){u.x=x;u.y=y;u.pm--}}}
   endTurn(u)}}
  assert.ok(outcome(s),'combat fini (seed '+seed+')');}
});

// ---------- V2.3 ----------
test('poussée : Fracas repousse de 2 cases sur terrain libre', () => {
 const s=arena(),k=unit(s,'h',2,5),m=unit(s,'m',3,5,{hp:99,max:99});
 const ev=applySpell(s,k,SP.smash,m);
 assert.deepEqual([m.x,m.y],[5,5]);assert.ok(ev.some(e=>e.type==='push'));assert.ok(!ev.some(e=>e.type==='collision'));
});
test('poussée : obstacle après 1 case = 5 dégâts, unité percutée = 5 aussi', () => {
 const s=arena(),k=unit(s,'h',2,5),m=unit(s,'m',3,5,{hp:99,max:99});cell(s,5,5).block=1;
 let p=pushPlan(s,k,m,2);assert.deepEqual(p,{to:{x:4,y:5},left:1,hit:null,k:5});
 push(s,m,p);assert.equal(m.hp,94);assert.deepEqual([m.x,m.y],[4,5]);
 const s2=arena(),k2=unit(s2,'h',2,5),a=unit(s2,'m',3,5,{hp:99,max:99}),b=unit(s2,'m',4,5,{hp:99,max:99});
 p=pushPlan(s2,k2,a,2);assert.equal(p.left,2);assert.equal(p.hit,b);push(s2,a,p);assert.equal(a.hp,89);assert.equal(b.hp,94);
});
test('poussée : bord de carte et eau bloquent, la cible déjà morte ne bouge pas', () => {
 const s=arena(),k=unit(s,'h',9,5),m=unit(s,'m',10,5,{hp:99,max:99});
 assert.equal(pushPlan(s,k,m,2).left,1);
 cell(s,11,5).water=1;assert.equal(pushPlan(s,k,m,2).left,2);
 const s2=arena(),k2=unit(s2,'h',2,5),m2=unit(s2,'m',3,5,{hp:1,max:1});applySpell(s2,k2,SP.smash,m2);
 assert.ok(m2.dead);assert.deepEqual([m2.x,m2.y],[3,5]);
});
test('combos : 2e héros +15 %, 3e héros +30 %, remis à zéro quand le monstre joue', () => {
 const s=arena();s.rng=()=>0.5; // dégâts fixes, jamais de critique
 const a=unit(s,'h',2,5),b=unit(s,'h',4,4),c=unit(s,'h',4,6),m=unit(s,'m',3,5,{hp:999,max:999});
 const hit=(u,sp)=>applySpell(s,u,sp,m).find(e=>e.type==='hurt').amt;
 const base=hit(a,SP.slash);assert.equal(base,12);
 const ev=applySpell(s,b,SP.slash,m);assert.equal(ev.find(e=>e.type==='hurt').amt,Math.round(12*1.15));assert.equal(ev.find(e=>e.type==='combo').n,2);
 assert.equal(hit(c,SP.slash),Math.round(12*1.3));
 assert.equal(hit(a,SP.slash),Math.round(12*1.3),'le même héros qui refrappe garde le bonus, sans nouvelle annonce');
 beginTurn(m);assert.equal(hit(b,SP.slash),12);
});
test('étoiles (V4.5f) : victoire, aucun KO, objectif de maîtrise selon la mission', () => {
 const s=arena();unit(s,'h',0,0);const h2=unit(s,'h',1,0);
 s.round=12;assert.equal(stars(s,false),3); // la durée ne compte plus
 h2.hp=24;assert.equal(stars(s,false),2);h2.hp=25;assert.equal(stars(s,true),3); // 50 % de PV au moins
 s.sigUsed=1;s.sigHit=1;assert.equal(stars(s,true),2);assert.equal(star3(s,true)[0],'sig');s.sigHit=0;assert.equal(stars(s,true),3); // boss : signature évitée
 h2.dead=true;h2.wasKO=1;assert.equal(stars(s,false),1);
});
test('intention : le monstre vise le héros qu\'il frapperait, sans rien changer à l\'état', () => {
 const s=arena(),h=unit(s,'h',2,2,{hp:30}),far=unit(s,'h',10,10),m=unit(s,'m',5,2,{maxPA:4,maxPM:3,pa:0,pm:0,atk:{pa:4,r:[1,1],t:'enemy',dmg:[7,10]}});
 const it=intent(s,m);assert.equal(it.target,h);assert.deepEqual(it.dmg,[7,10]);assert.deepEqual(it.from,{x:3,y:2});
 assert.deepEqual([m.x,m.y,m.pa,m.pm],[5,2,0,0]);
 const m2=unit(s,'m',11,0,{maxPA:4,maxPM:1,pa:4,pm:1,atk:{pa:4,r:[1,1],t:'enemy',dmg:[1,2]}});assert.equal(intent(s,m2),null,'trop loin : aucune attaque');
});

// ---------- V2.4a ----------
test('étoiles : le détail est juste (rapide mais avec un KO)', () => {
 const s=arena();unit(s,'h',0,0,{hp:10});unit(s,'h',1,0);s.round=3;
 assert.deepEqual(starList(s,false),[true,true,false]);assert.equal(stars(s,false),2);
 assert.equal(fightSpec(2,7,1).wave.add[2][2],'knightB');assert.equal(fightSpec(1,7,1).wave.add[2][2],'wolf'); // survie généralisée
});
test('carte : jamais d\'échec, même sur 300 graines', () => {
 for(let seed=0;seed<300;seed++)assert.ok(genMap(newBattle(),seed*7919,seed%THEMES.length),'graine '+seed);
});

// ---------- V2.4b forge ----------
test('forge : coûts 25/60/120, bonus +50 % par niveau, maximum 3', () => {
 const save={lvl:1,xp:0,gold:300,items:[0,4],z:{}}; // Épée courte (+2 dég. Kael), Arc long (+2 dég. Fenn)
 assert.equal(heroStats(save,0).dmg,2);assert.equal(upCost(save,0),25);
 assert.equal(upgrade(save,0),1);assert.equal(save.gold,275);assert.equal(heroStats(save,0).dmg,3);
 upgrade(save,0);upgrade(save,0);assert.equal(save.gold,95);assert.equal(heroStats(save,0).dmg,5);
 assert.equal(upCost(save,0),null);assert.equal(upgrade(save,0),0,'déjà au maximum');assert.equal(save.gold,95);
 assert.equal(heroStats(save,1).dmg,2,'Fenn non touché');
});
test('forge : refus sans or ou sans objet ; ancienne sauvegarde sans up', () => {
 const save={lvl:1,gold:24,items:[2]};
 assert.equal(upgrade(save,2),0);assert.equal(save.gold,24);
 save.gold=100;assert.equal(upgrade(save,3),0,'objet non possédé');assert.equal(save.gold,100);
 assert.equal(heroStats(save,0).hp,Math.round(HER[0].hp)+8);assert.equal(upgrade(save,2),1);assert.equal(heroStats(save,0).hp,HER[0].hp+12);
 assert.equal(itemVal(ITEMS[7],'heal',3),8,'Bâton de saule 3 → 8 au niveau 3');
});

test('Roi Gelée : invoque 2 gelées une seule fois sous 50 % de PV, sans XP, en fin d\'ordre', () => {
 const s=arena(),b=unit(s,'m',5,5,{hp:100,max:100,xp:40,summon:ZONES[0].boss.summon});s.order=[b];
 hurt(s,b,40);assert.equal(s.units.length,1);
 const e=hurt(s,b,15);assert.equal(e.spawn.length,2);assert.equal(s.units.length,3);
 for(const m of e.spawn){assert.equal(m.hp,12);assert.equal(m.maxPM,2);assert.deepEqual(m.atk.dmg,[3,5]);assert.equal(m.xp,0);assert.equal(Math.abs(m.x-5)+Math.abs(m.y-5),1)}
 assert.deepEqual(s.order.slice(1),e.spawn);
 assert.ok(!hurt(s,b,10).spawn);assert.equal(s.units.length,3);
 for(const m of e.spawn)hurt(s,m,99);assert.equal(s.killedXp,0);
});
test('Roi Gelée : pas d\'invocation s\'il meurt d\'un coup, places limitées par les cases libres', () => {
 const s=arena(),b=unit(s,'m',0,0,{hp:100,max:100,summon:ZONES[0].boss.summon});unit(s,'h',1,0);s.order=[];
 assert.ok(!hurt(s,b,200).spawn);
 const s2=arena(),b2=unit(s2,'m',0,0,{hp:100,max:100,summon:ZONES[0].boss.summon});unit(s2,'h',1,0);unit(s2,'h',1,1);unit(s2,'h',0,2);s2.order=[];
 const e=hurt(s2,b2,60);assert.equal(e.spawn.length,1);assert.deepEqual([e.spawn[0].x,e.spawn[0].y],[0,1]);
 assert.equal(outcome(s2),null);for(const u of s2.units.filter(u=>u.team==='m'))u.dead=true;assert.equal(outcome(s2),'win');
});

// ---------- V2.5a : spécialisations, palier 1 ----------
const SV=(sp,lvl=3)=>({lvl,items:[],up:{},sp});
function team(sp,lvl=3){const s=arena(),hs=[{x:1,y:1},{x:2,y:1},{x:3,y:1}],es=[{x:9,y:9},{x:10,y:9},{x:9,y:10}];
 mkUnits(s,FIGHT,hs,es,HER.map((_,i)=>heroStats(SV(sp,lvl),i)));return s}
test('talents : rien avant le niveau 3, sauvegarde validée', () => {
 const s=team(['berserk','eclaireur','druide'],2),[k,f,a]=s.units;
 assert.equal(k.dmgMul,1);assert.equal(f.maxPM,3);assert.deepEqual(a.S.venom.poison,SP.venom.poison);
 assert.deepEqual(cleanSp(['berserk','zzz',7]),['berserk',null,null,null,null,null]);assert.deepEqual(cleanSp(undefined),[null,null,null,null,null,null]);
 assert.equal(SPECS.flat().length,18);
});
test('talents Kael : Fureur ×1,15, Robustesse PV ×1,15, Onde de choc 3 cases', () => {
 const s=team(['berserk',null,null]),k=s.units[0],t=unit(s,'m',5,5,{hp:99,max:99});k.dmgB=0;k.mult=1;s.rng=()=>.5;
 applySpell(s,k,{...SP.slash,dmg:[20,20]},t);assert.equal(t.hp,99-23);
 const base=heroStats(SV([null,null,null]),0).hp;assert.equal(heroStats(SV(['gardien',null,null]),0).hp,Math.round(base*1.15));
 assert.equal(team(['briseur',null,null]).units[0].S.smash.push,3);assert.equal(SP.smash.push,2);
});
test('talents Fenn : portée 7, Tir entravant non cumulable, Agilité 4 PM', () => {
 assert.deepEqual(team([null,'tireur',null]).units[1].S.shot.r,[2,7]);assert.deepEqual(SP.shot.r,[2,6]);
 const s=team([null,'chasseur',null]),f=s.units[1],t=unit(s,'m',5,5,{maxPM:3});s.rng=()=>.5;
 applySpell(s,f,f.S.shot,t);applySpell(s,f,f.S.shot,t);beginTurn(t);assert.equal(t.pm,2);beginTurn(t);assert.equal(t.pm,3);
 const e=team([null,'eclaireur',null]).units[1];assert.equal(e.maxPM,4);assert.equal(e.pm,4);
});
test('talents Aelis : soin ×1,2, poison 6, Aura +40 %', () => {
 const s=team([null,null,'guerisseuse']),a=s.units[2],k=s.units[0];a.healB=0;a.mult=1;k.hp=1;s.rng=()=>.5;
 applySpell(s,a,{...a.S.heal,heal:[15,15]},k);assert.equal(k.hp,1+18);
 assert.deepEqual(team([null,null,'druide']).units[2].S.venom.poison,[6,2]);
 const s2=team([null,null,'enchant']),a2=s2.units[2],k2=s2.units[0],t=unit(s2,'m',5,5,{hp:99,max:99});s2.rng=()=>.5;k2.dmgB=0;k2.mult=1;
 applySpell(s2,a2,a2.S.aura,k2);applySpell(s2,k2,{...SP.slash,dmg:[20,20]},t);assert.equal(t.hp,99-28);
});

// ---------- V2.5b : palier 2 (niveau 7) ----------
test('talents niv 7 : rien de plus au niveau 6, Rage et Précision 22 %', () => {
 assert.equal(team(['berserk','tireur',null],6).units[0].crit,.12);
 const s=team(['berserk','tireur',null],7),[k,f]=s.units;assert.equal(k.crit,.22);assert.equal(f.crit,.22);assert.equal(s.units[2].crit,.12);
 const t=unit(s,'m',5,5,{hp:99,max:99});k.dmgB=0;k.mult=1;s.rng=()=>.2;applySpell(s,k,{...SP.slash,dmg:[20,20]},t);assert.equal(t.hp,99-Math.round(20*1.15*1.5));
});
test('talents niv 7 : Forteresse 65 %, Impact brutal 7', () => {
 const s=team(['gardien',null,null],7),k=s.units[0];k.shield=1;const hp=k.hp;hurt(s,k,20);assert.equal(k.hp,hp-7);
 const s2=team(['briseur',null,null],7),b=s2.units[0],t=unit(s2,'m',b.x+1,b.y,{hp:99,max:99});
 for(let i=2;i<=4;i++)s2.map.delete(K(b.x+i,b.y)); // mur juste derrière la cible : poussée de 3 bloquée
 const p=pushPlan(s2,b,t,3);assert.equal(p.left,3);push(s2,t,p);assert.equal(t.hp,99-21);
});
test('talents niv 7 : Volée ralentit, Bottes +3, Soin portée 5, poison 3 tours, Aura 3 tours', () => {
 const s=team([null,'chasseur',null],7),f=s.units[1],t=unit(s,'m',6,6,{maxPM:3});s.rng=()=>.5;applySpell(s,f,f.S.volley,{x:6,y:5});beginTurn(t);assert.equal(t.pm,2);
 const se=team([null,'eclaireur',null],7),e=se.units[1];assert.equal(e.S.boots.pmBonus,3);beginTurn(e);applySpell(se,e,e.S.boots,e);assert.equal(e.pm,7);
 assert.deepEqual(team([null,null,'guerisseuse'],7).units[2].S.heal.r,[0,5]);
 assert.deepEqual(team([null,null,'druide'],7).units[2].S.venom.poison,[6,3]);
 const s3=team([null,null,'enchant'],7),a=s3.units[2];applySpell(s3,a,a.S.aura,s3.units[0]);assert.deepEqual(s3.units[0].buff,{pct:.4,turns:3});
});

// ---------- V2.5c : palier 3 (niveau 11) ----------
test('niv 11 Kael : Exécution sous 30 %, Dernier rempart une fois, Fracas affaiblissant', () => {
 const s=team(['berserk',null,null],11),k=s.units[0];k.dmgB=0;k.mult=1;s.rng=()=>.5;
 const a=unit(s,'m',5,5,{hp:29,max:100}),b=unit(s,'m',6,6,{hp:30,max:100});
 applySpell(s,k,{...SP.slash,dmg:[10,10]},a);assert.equal(a.hp,29-Math.round(10*1.15*1.25));
 applySpell(s,k,{...SP.slash,dmg:[10,10]},b);assert.equal(b.hp,30-Math.round(10*1.15));
 const s2=team(['gardien',null,null],11),g=s2.units[0];const e=hurt(s2,g,9999);assert.equal(g.hp,1);assert.ok(e.saved&&!g.dead);hurt(s2,g,5);assert.ok(g.dead);
 assert.equal(team(['briseur',null,null],11).units[0].S.smash.slow,1);
});
test('niv 11 Fenn : Flèche perforante, Piège, Insaisissable', () => {
 const s=team([null,'tireur',null],11),f=s.units[1];f.dmgB=0;f.mult=1;s.rng=()=>.5;const t=unit(s,'m',5,5,{hp:99,max:99,armor:.2});
 applySpell(s,f,{...f.S.shot,dmg:[20,20]},t);assert.equal(t.hp,99-18);
 const s2=team([null,'chasseur',null],11),c=s2.units[1];assert.ok(c.sp.includes('trap'));
 const free={x:c.x,y:c.y+2};assert.ok(okTarget(s2,c,c.S.trap,free));
 applySpell(s2,c,c.S.trap,{x:c.x+2,y:c.y+2});applySpell(s2,c,c.S.trap,free);assert.deepEqual(c.trap,{x:c.x,y:c.y+2,left:3}); // un seul piège
 const m=unit(s2,'m',c.x,c.y+2,{hp:50,max:50,maxPM:3});const ev=stepOn(s2,m);assert.equal(m.hp,40);assert.ok(!c.trap);beginTurn(m);assert.equal(m.pm,2);assert.equal(stepOn(s2,m).length,0);
 const k=s2.units[0];applySpell(s2,c,c.S.trap,{x:c.x+3,y:c.y});k.x=c.x+3;assert.equal(stepOn(s2,k).length,0); // un allié ne le déclenche pas
 beginTurn(c);beginTurn(c);assert.ok(c.trap);beginTurn(c);assert.ok(!c.trap); // 3 tours de Fenn
 const s3=team([null,'eclaireur',null],11),e=s3.units[1];assert.equal(e.dodge,.15);const mo=unit(s3,'m',e.x+1,e.y);s3.rng=()=>.1;const hp=e.hp;
 const r=applySpell(s3,mo,{...SP.slash,t:'enemy'},e);assert.equal(e.hp,hp);assert.ok(r.some(x=>x.text==='Esquive !'));
});
test('niv 11 Aelis : Renaissance, étoile « aucun KO », Contagion, Bénédiction collective', () => {
 const s=team([null,null,'guerisseuse'],11),[k,f,a]=s.units;assert.ok(a.sp.includes('revive'));
 hurt(s,k,9999);assert.ok(k.dead);assert.ok(okTarget(s,a,a.S.revive,k));assert.ok(!okTarget(s,a,a.S.revive,f));
 applySpell(s,a,a.S.revive,{x:k.x,y:k.y});assert.ok(!k.dead);assert.equal(k.hp,Math.round(k.max*.25));
 assert.equal(starList(s,false)[1],false); // KO pendant le combat, même relevé
 const s2=team([null,null,'druide'],11),d=s2.units[2],m=unit(s2,'m',5,5,{hp:50,max:50}),n=unit(s2,'m',6,5,{hp:50,max:50}),o=unit(s2,'m',8,8,{hp:50,max:50});s2.rng=()=>.5;
 applySpell(s2,d,d.S.venom,m);assert.ok(m.poison.spread);hurt(s2,m,999);assert.deepEqual(n.poison,{d:6,turns:2});assert.ok(!o.poison);
 hurt(s2,n,999); // poison transmis : pas de nouvelle contagion
 const s3=team([null,null,'enchant'],11),e=s3.units[2];applySpell(s3,e,e.S.aura,s3.units[0]);assert.ok(s3.units.filter(h=>h.team==='h').every(h=>h.buff&&h.buff.pct===.4));
});

// ---------- V2.6a marchand ----------
import {shopStock,buy,sell,sellPrice,buyPot} from '../src/rules.js';
test('marchand : stock sans objets possédés, achat, revente avec forge, potions', ()=>{
 const sv={gold:500,items:[0,1],up:{0:2}};const st=shopStock(sv,20000);
 assert.equal(st.length,3);assert.ok(!st.includes(0)&&!st.includes(1));assert.deepEqual(shopStock(sv,20000),st);
 assert.equal(buy(sv,2),1);assert.equal(sv.gold,410);assert.equal(buy(sv,2),0);
 assert.equal(sellPrice(sv,0),Math.round(.5*(60+25+60)));const g=sv.gold;sell(sv,0);assert.equal(sv.gold,g+73);assert.ok(!sv.items.includes(0)&&!sv.up[0]);
 for(let i=0;i<4;i++)buyPot(sv);assert.equal(sv.pot,3);
});
test('potion : soigne 40 % une fois, rien sans potion', ()=>{
 const s={units:[],rng:()=>.5,pot:1},u={team:'h',x:0,y:0,hp:10,max:100};
 const ev=applySpell(s,u,SP.potion,{x:0,y:0});assert.equal(u.hp,50);assert.equal(s.pot,0);assert.ok(ev.some(e=>e.type==='heal'));
 assert.deepEqual(applySpell(s,u,SP.potion,{x:0,y:0}),[]);assert.equal(u.hp,50);
});

// ---------- V2.6b taverne ----------
import {contracts,ctUpdate,claim,dailyFight} from '../src/rules.js';
test('taverne : contrats du jour stables, progression, récompense une seule fois', ()=>{
 const sv={lvl:3,xp:0,gold:0,z:{prairie:1}},a=contracts(sv,500);
 assert.equal(a.length,3);assert.ok(['slime','boar'].includes(a[1].m));assert.equal(contracts(sv,500),a);assert.equal(a[2].k,'star');
 assert.deepEqual(ctUpdate(sv,500,{win:0,st:3,kills:{}}),[]);
 for(let i=0;i<a[0].n;i++)ctUpdate(sv,500,{win:1,st:1,kills:{}});assert.equal(a[0].p,a[0].n);
 assert.equal(claim(sv,500,1),0);assert.ok(claim(sv,500,0)>=1);assert.equal(sv.gold,44);assert.equal(claim(sv,500,0),0);
 const b=contracts(sv,501);assert.notEqual(b,a);assert.equal(b[0].p,0);
});
test('défi du jour : zone la plus avancée, sans boss', ()=>{
 const F=dailyFight({z:{prairie:10,bois:2}},10);assert.equal(F.zi,1);assert.equal(F.lvl,ZONES[1].lvl+4);assert.equal(F.boss,null);assert.equal(F.daily,1);
 assert.equal(dailyFight({z:{}},10).zi,0);
});

// ---------- V2.6c boss ----------
import {bossTurn,bossNext} from '../src/rules.js';
test('boss : hurlement, carapace, séisme, fureur', ()=>{
 const mk=(o)=>({team:'m',x:0,y:0,hp:100,max:100,maxPM:3,pm:3,atk:{dmg:[10,10]},...o});
 const w=mk({bs:'howl'}),m2=mk({x:5}),h={team:'h',x:1,y:1,hp:50,max:50},s={units:[w,m2,h],rng:()=>.5};
 assert.equal(bossNext(w),2);bossTurn(s,w);assert.ok(!w.buff);assert.equal(bossNext(w),1);bossTurn(s,w);assert.equal(m2.buff.pct,.3);assert.equal(w.buff.turns,2);
 const c=mk({bs:'shell'});bossTurn({units:[c]},c);assert.equal(c.shield,1);
 const g=mk({bs:'quake'}),near={team:'h',x:2,y:1,hp:50,max:50},far={team:'h',x:4,y:4,hp:50,max:50},sg={units:[g,near,far],rng:()=>.5};
 bossTurn(sg,g);bossTurn(sg,g);assert.equal(near.hp,50);bossTurn(sg,g);assert.equal(near.hp,44);assert.equal(far.hp,50);
 const k=mk({bs:'rage'});assert.deepEqual(bossTurn({units:[k]},k),[]);k.hp=50;bossTurn({units:[k]},k);assert.equal(k.maxPM,4);assert.equal(k.dmgMul,1.3);assert.deepEqual(bossTurn({units:[k]},k),[]);
});

// ---------- V2.6d raretés et objectifs ----------
import {rollRare,rarOf,SURVIVE} from '../src/rules.js';
test('raretés : bonus multiplié, revente plus chère, tirage', ()=>{
 const sv={lvl:1,items:[0],up:{},rr:{0:2},sp:[null,null,null]};
 assert.equal(heroStats(sv,0).dmg,4);assert.equal(sellPrice(sv,0),60);assert.equal(rarOf(sv,0),2);
 assert.equal(rollRare(()=>.9,0),0);assert.equal(rollRare(()=>.9,1),1);assert.equal(rollRare(()=>.01,0),2);
 sell(sv,0);assert.equal(sv.rr[0],undefined);
});
test('objectifs : chef abattu = victoire, survie', ()=>{
 const h={team:'h'},c={team:'m',chief:1,dead:1},m={team:'m'};
 assert.equal(outcome({units:[h,c,m],goal:'chief',round:1}),'win');assert.equal(outcome({units:[h,{...c,dead:0},m],goal:'chief',round:1}),null);
 assert.equal(outcome({units:[h,m],goal:'survive',round:SURVIVE}),null);assert.equal(outcome({units:[h,m],goal:'survive',round:SURVIVE+1}),'win');
 assert.equal(outcome({units:[{team:'h',dead:1},m],goal:'survive',round:9}),'lose');
});

// ---------- V3.0b ciblage : raisons ----------
import {whyNot,losBlock} from '../src/rules.js';
test('whyNot : portée, obstacle, allié bloquant, cohérent avec okTarget', ()=>{
 const s=newBattle(()=>.5);for(let x=0;x<8;x++)for(let y=0;y<3;y++)s.map.set(K(x,y),{x,y,block:0});
 const f={team:'h',x:0,y:0,n:'Fenn',hp:9,max:9},al={team:'h',x:2,y:0,n:'Kael',hp:9,max:9},e={team:'m',x:5,y:0,n:'Gelée',hp:9,max:9},far={team:'m',x:7,y:2,n:'Gelée B',hp:9,max:9};
 s.units=[f,al,e,far];const shot=SP.shot;
 assert.equal(whyNot(s,f,shot,e).t,'Kael bloque le tir');{const b=losBlock(s,f,e,f);assert.ok(b.x===2&&b.y==0&&b.u===al)}
 assert.match(whyNot(s,f,shot,far).t,/À 9 cases, portée max. 6/);assert.match(whyNot(s,f,shot,al).t,/Trop près|allié/);
 s.map.get(K(3,0)).block=1;al.x=0;al.y=2;assert.equal(whyNot(s,f,shot,e).t,'Un obstacle haut bloque le tir');
 s.map.get(K(3,0)).block=0;assert.equal(whyNot(s,f,shot,e),null);assert.ok(okTarget(s,f,shot,e));
});

test('V3.0e aperçu : ennemis visables depuis une case, sans modifier l’état', () => {
 const s=arena(),u=unit(s,'h',0,0,{sp:['shot'],S:{shot:SP.shot}}),e=unit(s,'m',8,0);
 assert.equal(targetsFrom(s,u,u).foes.length,0);
 const t=targetsFrom(s,u,{x:3,y:0});assert.deepEqual(t.foes,[e]);assert.equal(t.list[0].n,1);
 assert.equal(u.x,0);assert.equal(u.pa,6);
 u.pa=2;assert.equal(targetsFrom(s,u,{x:3,y:0}).foes.length,0,'pas assez de PA');
});

test('V3.0e aperçu : Volée compte les ennemis couverts par la zone, une seule fois chacun', () => {
 const s=arena(),u=unit(s,'h',0,0,{sp:['shot','volley'],S:{shot:SP.shot,volley:SP.volley}});unit(s,'m',4,0);unit(s,'m',5,0);
 const t=targetsFrom(s,u,u);assert.equal(t.foes.length,2);
 assert.equal(t.list.find(l=>l.sp.n==='Tir').n,1,'le 2e est caché derrière le 1er');assert.equal(t.list.find(l=>l.sp.n==='Volée').n,2);
});

test('V3.0e première mission : Fenn tire dès le tour 1, une 2e cible s’ouvre en bougeant (toutes graines)', () => {
 for(let gold=0;gold<300;gold++){const s=newBattle(),{hs,es}=genMap(s,gold,gold%2?2:0);
  mkUnits(s,{lvl:1,pool:['slime'],boss:null},hs,es,HS);guideSetup(s);
  const f=s.units.find(u=>u.k==='archer');assert.equal(s.order.find(u=>!u.dead),f,'Fenn joue en premier');
  const now=targetsFrom(s,f,f);assert.ok(now.list.some(l=>l.sp.n==='Tir'),'tir ouvert, graine '+gold);
  const m=s.units.filter(u=>u.team==='m'),second=m[1];assert.ok(!okShot(s,f,second,f),'2e cible fermée au départ');
  assert.ok([...reach(s,f,f.pm).dist.keys()].some(k=>{const[x,y]=k.split(',').map(Number);return okShot(s,f,second,{x,y})}),'2e cible ouvrable, graine '+gold);
  const seen=new Set(s.units.map(u=>u.x+','+u.y));assert.equal(seen.size,s.units.length,'pas deux unités sur une case');
  for(const u of s.units)assert.ok(passable(s,u.x,u.y))}
});
const okShot=(s,u,t,from)=>okTarget(s,u,SP.shot,t,from);

test('V3.5 : un chevalier au plus par combat prévu, à la 2e place, et le boss ne change pas',()=>{
 for(const[zi,Z]of ZONES.entries())for(let i=0;i<4;i++){const s=newBattle(),{hs,es}=genMap(s,zi*1000+i*97,Z.th[i%Z.th.length]);s.rng=mulberry(7);
  const F={lvl:Z.lvl+i,pool:Z.pool,boss:i===3?Z.boss:null,elite:Z.elite?.[i]};mkUnits(s,F,hs,es,HER.map(h=>({hp:h.hp,dmg:0,heal:0,mult:1})));
  const k=s.units.filter(u=>u.team==='m'&&/^knight[BRN]$/.test(u.k));
  assert.equal(k.length,Z.elite?.[i]?1:0,Z.id+' '+i);if(k.length){assert.equal(k[0].id,'m1');assert.equal(k[0].k,Z.elite[i])}
  if(i===3){const b=s.units.find(u=>u.id==='m0');assert.equal(b.n,Z.boss.n);assert.equal(b.s,Z.boss.s)}}
 const[b,r,n]=['knightB','knightR','knightN'].map(k=>MON[k]);assert.ok(b.hp<r.hp&&r.hp<n.hp&&b.dmg[1]<r.dmg[1]&&r.dmg[1]<n.dmg[1]);
 assert.equal(MON.knight.hp,60);
});

test('objectif chef : la lettre de repère reste en majuscule', () => {
 const s=newBattle(),{hs,es}=genMap(s,5,0);mkUnits(s,{lvl:1,pool:['slime'],boss:null,goal:'chief'},hs,es,HS);
 const c=s.units.find(u=>u.chief);assert.match(c.n,/^Chef .+ [A-Z]$/);
});

// ---------- V4.0 : région 6 (cristaux, entrave, Titan, 10 niveaux) ----------
import {fightSpec,zoneDone,ampAt,prismOn,prismDmg,beamCells,beamPhase,beamDmg} from '../src/rules.js';
import {zlen} from '../src/data.js';
const Z6=ZONES.findIndex(z=>z.id==='cristal');
const cry=(s,x,y,k)=>Object.assign(cell(s,x,y),{block:1,cry:k});

test('région 6 : 10 combats, boss au dernier, ouverte après le Château', () => {
 assert.equal(zlen(ZONES[Z6]),10);assert.equal(zlen(ZONES[0]),10);assert.equal(zlen(ZONES[1]),10);assert.equal(zlen(ZONES[2]),10);assert.equal(zlen(ZONES[3]),10);assert.equal(zlen(ZONES[4]),10);
 assert.ok(fightSpec(Z6,9,1).boss);assert.ok(!fightSpec(Z6,8,1).boss);assert.ok(fightSpec(0,9,1).boss);assert.ok(!fightSpec(0,3,1).boss);
 assert.equal(fightSpec(Z6,4,1).goal,'chief');assert.equal(fightSpec(Z6,6,1).goal,'survive');assert.equal(fightSpec(Z6,0,1).goal,null);
 assert.equal(fightSpec(4,4,1).goal,'chief');
 const save={z:{chateau:10}};assert.ok(zoneDone(save,Z6-1));assert.ok(!zoneDone({z:{cristal:9}},Z6));assert.ok(zoneDone({z:{cristal:10}},Z6));
});

test('région 6 : 200 cartes par niveau, ennemis joignables, cristaux posés hors des départs', () => {
 for(let i=0;i<10;i++){const F=fightSpec(Z6,i,0);
  for(let seed=0;seed<200;seed++){const s=newBattle(),{hs,es}=genMap(s,seed*131+i,F.th,F.cry);mkUnits(s,{...F,seed},hs,es,HS);
   const want=(F.cry.a||0)+(F.cry.p||0),got=[...s.map.values()].filter(c=>c.cry);assert.equal(got.length,want,`niveau ${i+1} graine ${seed}`);
   for(const u of s.units){assert.ok(!cell(s,u.x,u.y).cry,'unité sur un cristal');assert.ok(!cell(s,u.x,u.y).block)}
   const h=s.units.find(u=>u.team==='h'),d=reach({...s,units:[]},h,99).dist;
   for(const u of s.units)assert.ok(d.has(K(u.x,u.y)),`niveau ${i+1} graine ${seed} : ${u.n} injoignable`);
   assert.equal(s.units.filter(u=>u.team==='m').length,F.wave?F.wave.start:F.en.length+(F.boss?1:0));assert.ok(s.units.filter(u=>u.team==='m').length<=7)}}
});

test('amplificateur : +30 % de dégâts et de soin depuis une case voisine, pas de cumul, pas sur le poison', () => {
 const s=arena();cry(s,5,5,'a');cry(s,5,7,'a');const a=unit(s,'h',5,6),b=unit(s,'m',6,6,{hp:200,max:200}),c=unit(s,'h',8,8);
 assert.equal(ampAt(s,a),1.3);assert.equal(ampAt(s,c),1);
 const sp={...SP.slash,dmg:[10,10]};s.rng=seqRng([.99]);applySpell(s,a,sp,b);assert.equal(b.hp,200-13);
 delete b.hitBy;s.rng=seqRng([.99]);applySpell(s,c,{...sp,r:[1,9]},b);assert.equal(b.hp,200-13-10);
 a.hp=10;a.max=50;applySpell(s,a,{...SP.heal,heal:[10,10]},a);assert.equal(a.hp,23);
 const v={...SP.venom,dmg:[0,0]};b.hp=100;s.rng=seqRng([.99]);applySpell(s,a,v,b);assert.deepEqual(b.poison,{d:4,turns:2}); // poison non amplifié
});

test('prisme : visable, 70 % des dégâts moyens aux 4 voisines (alliés compris), puis éteint 2 tours', () => {
 const s=arena();const p=cry(s,5,5,'p'),a=unit(s,'h',5,2),f=unit(s,'m',5,6,{hp:100,max:100}),ally=unit(s,'h',4,5,{hp:100,max:100}),far=unit(s,'m',9,9,{hp:100,max:100});
 const sp={...SP.shot,dmg:[10,14]};assert.ok(okTarget(s,a,sp,{x:5,y:5}),'prisme visable');
 assert.ok(!okTarget(s,a,SP.heal,{x:5,y:5}),'un soin ne vise pas le prisme');
 assert.equal(prismDmg(s,a,sp),8);
 payCost(a,sp,{x:5,y:5});applySpell(s,a,sp,{x:5,y:5});assert.equal(f.hp,92);assert.equal(ally.hp,92);assert.equal(far.hp,100);
 assert.ok(!prismOn(s,p));assert.ok(!okTarget(s,a,sp,{x:5,y:5}),'éteint');
 s.round+=2;assert.ok(prismOn(s,p));
 // Volée dont la zone touche le prisme : déclenché une fois
 f.hp=ally.hp=100;applySpell(s,a,{...SP.volley,dmg:[10,10]},{x:5,y:6});assert.ok(!prismOn(s,p));assert.equal(ally.hp,93);
});

test('poussée contre un cristal : collision normale, prisme non déclenché', () => {
 const s=arena();const p=cry(s,5,5,'p'),a=unit(s,'h',5,2),t=unit(s,'m',5,3,{hp:100,max:100});
 push(s,t,pushPlan(s,a,t,2));assert.equal(t.y,4);assert.equal(t.hp,95);assert.ok(prismOn(s,p));
});

test('IA : le monstre préfère une case amplifiée, et son intention inclut le bonus', () => {
 const s=arena();cry(s,3,6,'a');const h=unit(s,'h',5,5),m=unit(s,'m',2,5,{maxPA:4,pa:4,maxPM:3,pm:3,atk:{n:'A',pa:4,r:[1,3],t:'enemy',los:1,dmg:[10,10]}});
 const a=aiStep(s,m);assert.equal(a.type,'move');const[x,y]=a.to.split(',').map(Number);assert.equal(ampAt(s,{x,y}),1.3);
 const it=intent(s,m);assert.deepEqual(it.dmg,[13,13]);assert.ok(it.amp);assert.equal(m.x,2);
 // les monstres ne visent jamais un prisme
 const s2=arena();cry(s2,3,5,'p');const m2=unit(s2,'m',2,5,{maxPA:4,pa:4,atk:{n:'A',pa:4,r:[1,1],t:'enemy',dmg:[5,5]}});unit(s2,'h',9,9);
 assert.notEqual(aiStep(s2,m2)?.type,'cast');
});

test('araignée de quartz : son attaque retire 1 PM au tour suivant', () => {
 const s=newBattle(()=>.5),{hs,es}=genMap(s,5,6);mkUnits(s,{lvl:17,pool:['qspider'],boss:null,en:['qspider']},hs,es,HS);
 const sp=s.units.find(u=>u.k==='qspider'),h=s.units.find(u=>u.team==='h');assert.ok(sp.atk.slow);assert.deepEqual(sp.atk.r,[1,3]);
 applySpell(s,sp,sp.atk,h);assert.ok(h.slow);beginTurn(h);assert.equal(h.pm,h.maxPM-1);
});

test('Titan : 3 phases, ligne puis croix, tir un tour après le marquage, prisme qui éclate en phase 3', () => {
 const s=arena(),T=unit(s,'m',5,5,{hp:300,max:300,bs:'beam',atk:{dmg:[20,30]}}),h=unit(s,'h',5,9,{hp:200,max:200}),h2=unit(s,'h',8,6,{hp:200,max:200});
 assert.equal(beamPhase(T),1);let b=beamCells(s,T);assert.ok(b.cells.every(p=>p.x===5&&p.y>5));assert.equal(b.cells.length,6);
 bossTurn(s,T);assert.ok(s.beam,'marqué au 1er tour');assert.equal(h.hp,200);
 T.x=1;T.y=1; // déplacé : le tir garde les cases marquées
 bossTurn(s,T);assert.equal(s.beam,null);assert.equal(h.hp,200-beamDmg(T));assert.equal(h2.hp,200);
 bossTurn(s,T);assert.equal(s.beam,null,'repos au 3e tour');
 T.x=5;T.y=5;T.hp=150;assert.equal(beamPhase(T),2);b=beamCells(s,T);assert.ok(b.cells.some(p=>p.x>5)&&b.cells.some(p=>p.y>5)&&b.cells.some(p=>p.x<5)&&b.cells.some(p=>p.y<5));
 const ev=bossTurn(s,T);assert.ok(ev.some(e=>e.text==='Phase 2 !'));assert.ok(s.beam);
 // le rayon s'arrête au premier obstacle ou cristal
 const s3=arena(),T3=unit(s3,'m',5,5,{hp:50,max:300,bs:'beam',atk:{dmg:[20,30]}});const p=cry(s3,5,8,'p');unit(s3,'h',5,10);
 b=beamCells(s3,T3);assert.ok(!b.cells.some(q=>q.x===5&&q.y>=8&&q.y!==9),'arrêté au prisme');assert.ok(b.cells.some(q=>q.x===4&&q.y===8)&&b.cells.some(q=>q.x===5&&q.y===9),'voisines du prisme marquées');
 assert.equal(b.pr[0],p);
});

test('Cavernes niveau 4 : un ennemi à couvert derrière le prisme, toujours joignable', async () => {
 const {prismCover}=await import('../src/rules.js');let n=0;
 for(let seed=0;seed<200;seed++){const F=fightSpec(Z6,3,seed),s=newBattle(),{hs,es}=genMap(s,seed,F.th,F.cry);mkUnits(s,F,hs,es,HS);prismCover(s);
  const p=[...s.map.values()].find(c=>c.cry==='p'),m=s.units.filter(u=>u.team==='m').pop();if(Math.abs(m.x-p.x)+Math.abs(m.y-p.y)===1){n++;assert.ok(m.x+m.y<p.x+p.y)}
  assert.equal(new Set(s.units.map(u=>u.x+','+u.y)).size,s.units.length,'deux unités sur une case')}
 assert.ok(n>150,`à couvert ${n}/200`);
});

// ---------- V4.1 ----------
test('V4.1 tir en cloche : Fenn passe par-dessus un décor bas, pas par-dessus un haut, un allié ni (monstres) un décor bas', () => {
 const s=arena(),f=unit(s,'h',0,0),e=unit(s,'m',4,0),c=cell(s,2,0);
 c.block=1;c.d=2; // buisson
 assert.ok(okTarget(s,f,SP.shot,e));assert.ok(okTarget(s,f,SP.volley,e));assert.ok(!okTarget(s,f,SP.venom,e),'Épine ne passe pas');
 assert.ok(!okTarget(s,e,MON.shroom&&{r:[1,5],los:1,t:'enemy'},f),'un monstre ne tire pas par-dessus');
 c.d=0; // chêne
 assert.ok(!okTarget(s,f,SP.shot,e));assert.equal(whyNot(s,f,SP.shot,e).t,'Un obstacle haut bloque le tir');
 delete c.d; // roche
 assert.ok(!okTarget(s,f,SP.shot,e));c.block=0;unit(s,'h',2,0,{n:'Kael'});assert.ok(!okTarget(s,f,SP.shot,e));
});
test('V4.1 PA reportés : +1 par tranche de 2 PA non dépensés, au plus +2, sans cumul, héros seulement', () => {
 const s=arena(),h=unit(s,'h',0,0),m=unit(s,'m',5,5);
 for(const[left,k]of[[0,0],[1,0],[2,1],[3,1],[4,2],[6,2],[8,2]]){h.pa=left;endTurn(h);beginTurn(h);assert.equal(h.pa,6+k,'reste '+left);assert.equal(h.carried,k)}
 beginTurn(h);assert.equal(h.pa,6,'le report ne sert qu’une fois');
 m.maxPA=4;m.pa=4;assert.equal(carryPA(m),0);endTurn(m);beginTurn(m);assert.equal(m.pa,4);
});
test('V4.1 approche : case la moins chère d’où lancer le sort, rien si les PM ou les PA manquent', () => {
 const s=arena(),k=unit(s,'h',0,0),e=unit(s,'m',4,0);
 const a=approach(s,k,SP.slash,e);assert.equal(a.cost,3);assert.deepEqual([a.x,a.y],[3,0]);assert.equal(k.x,0,'rien n’est modifié');
 k.pm=2;assert.equal(approach(s,k,SP.slash,e),null);k.pm=3;k.pa=2;assert.equal(approach(s,k,SP.slash,e),null);
 k.pa=6;e.x=2;e.y=0;const b=approach(s,k,SP.slash,e);assert.equal(b.cost,1);
 e.x=1;assert.equal(approach(s,k,SP.slash,e),null,'déjà à portée : pas d’approche');
});

// ---------- V4.2 : prévision ----------
test('V4.2 prévision = résolution : arc, Aura, combo, armure, Rempart, critique, collision de Fracas', () => {
 let n=0;
 for(const spName of ['shot','smash','slash','venom'])for(const buff of [null,{pct:.3,turns:2}])for(const armor of [0,.25])for(const shield of [0,1])for(const prior of [0,1])for(const dmgB of [0,2])for(const wallBehind of [0,1]){
  const run=(roll,crit)=>{const s=arena(),sp=SP[spName],u=unit(s,'h',0,0,{dmgB,mult:1.06,dmgMul:1.15,buff:buff&&{...buff}}),t=unit(s,'m',sp.r[0]>1?3:1,0,{hp:500,max:500,armor,shield});
   if(prior)t.hitBy=new Set(['autre']);if(wallBehind)cell(s,t.x+1,0).block=1;
   const before=JSON.stringify([s.units.map(o=>({...o,hitBy:o.hitBy&&[...o.hitBy]})),s.killedXp]);let calls=0;s.rng=()=>{calls++;return 0};
   const f=forecast(s,u,sp,t);assert.equal(calls,0,'aucun hasard consommé');assert.equal(JSON.stringify([s.units.map(o=>({...o,hitBy:o.hitBy&&[...o.hitBy]})),s.killedXp]),before,'état intact');
   let i=0;s.rng=()=>i++===0?(crit?0:.999):roll;
   const ev=applySpell(s,u,sp,{x:t.x,y:t.y}),h=ev.find(e=>e.type==='hurt'&&e.src===0),col=ev.filter(e=>e.type==='hurt'&&e.src==='collision'&&e.t===t).reduce((a,e)=>a+e.amt,0);
   assert.equal(h.amt,(crit?f.crit:f.dmg)[roll?1:0],`${spName} buff${!!buff} armure${armor} rempart${shield} combo${prior}`);assert.equal(col,f.push);n++};
  for(const roll of [0,.9999])for(const crit of [false,true])run(roll,crit)}
 assert.equal(n,4*2*2*2*2*2*2*4);
});
test('V4.2 KO : garanti, possible, seulement en critique, jamais garanti avec esquive', () => {
 const s=arena(),u=unit(s,'h',0,0),t=unit(s,'m',3,0);
 const ko=hp=>{t.hp=hp;return forecast(s,u,SP.shot,t).ko};
 assert.equal(ko(8),'sure');assert.equal(ko(12),'maybe');assert.equal(ko(18),'crit');assert.equal(ko(19),null);
 t.dodge=.15;assert.equal(ko(8),'maybe');
});
test('V4.2 Volée : centre autorisé qui touche indirectement, case vide visable, alliés épargnés', () => {
 const s=arena(),f=unit(s,'h',0,0),e=unit(s,'m',6,0),al=unit(s,'h',5,1);
 assert.ok(!okTarget(s,f,SP.volley,e),'6 cases : hors portée du centre');
 const c=zoneCenter(s,f,SP.volley,e);assert.deepEqual(c,{x:5,y:0});assert.ok(okTarget(s,f,SP.volley,c));
 assert.equal(zoneCells(s,c).length,4,'au bord du plateau : seulement les voisines qui existent');
 const hp=al.hp;applySpell(s,f,SP.volley,c);assert.ok(e.hp<50);assert.equal(al.hp,hp,'allié dans la zone épargné');
 e.x=9;assert.equal(zoneCenter(s,f,SP.volley,e),null);
});

// ---------- V4.5a : survie à renforts ----------
import {man,star3,waveTick,waveEmpty,spawnCells} from '../src/rules.js';
const waveFight=(seed=3)=>{const F=fightSpec(1,7,seed),s=newBattle(),{hs,es}=genMap(s,F.seed,F.th,F.cry);mkUnits(s,F,hs,es,HER.map((_,j)=>heroStats({lvl:6,items:[],sp:[null,null,null]},j)));return{F,s}};
test('survie à renforts : départ, annonce, arrivée, plafond', ()=>{
 const{F,s}=waveFight(),mons=()=>s.units.filter(u=>u.team==='m'&&!u.dead);
 assert.equal(F.wave.turns,6);assert.equal(mons().length,3);assert.equal(s.wave.q.length,6);assert.equal(s.wave.next.length,1); // 1 annoncé pour le tour 2
 const n0=s.order.length;s.round=2;const a=waveTick(s);assert.equal(a.length,1);assert.equal(s.order.length,n0+1);assert.equal(s.order.at(-1),a[0]); // joue en fin de tour
 assert.ok(a[0].reinf&&a[0].xp>0);assert.equal(s.wave.next.length,2);
 const c=s.wave.next[0];const h=s.units.find(u=>u.team==='h');const ox=h.x,oy=h.y;h.x=c.x;h.y=c.y; // case prise : le renfort attend
 s.round=3;const b=waveTick(s);assert.equal(b.length,1);assert.ok(s.wave.q.some(q=>q.r===3));h.x=ox;h.y=oy;
 s.round=4;waveTick(s);assert.ok(mons().length<=6);assert.ok(s.units.some(u=>u.elite&&u.k==='wolf')||s.wave.q.some(q=>q.elite));
});
test('survie à renforts : pas de victoire tant qu’il reste des vagues, retraite, 3e étoile', ()=>{
 const{s}=waveFight();const kill=()=>s.units.forEach(u=>{if(u.team==='m')u.dead=true});
 kill();assert.equal(outcome(s),null);assert.equal(s.wave.next.length,1);
 s.wave.next=[];assert.equal(waveEmpty(s),1);assert.ok(s.wave.next.length>0); // la vague suivante est avancée
 s.round=7;assert.equal(outcome(s),'win');assert.equal(stars(s,false),2); // tenu, mais vagues restantes : pas de 3e étoile
 const t=waveFight().s;t.units.forEach(u=>{if(u.team==='m')u.dead=true});t.wave.q=[];assert.equal(outcome(t),'win');assert.ok(t.cleared);assert.equal(stars(t,false),3);
 assert.equal(fightSpec(1,1,1).wave,undefined); // seul Bois 3 est concerné
});

// ---------- V4.5b : IA à rôles ----------
const arena5=()=>{const s=newBattle(()=>.5);for(let x=0;x<9;x++)for(let y=0;y<9;y++)s.map.set(K(x,y),{x,y,t:0});s.round=1;return s};
const unit5=(o)=>({cd:{},armor:0,maxPA:4,pa:4,pm:o.pm??0,maxPM:o.pm??0,hp:30,max:30,...o});
const atk5=(r=[1,1])=>({n:'Attaque',pa:4,r,t:'enemy',dmg:[5,5],los:r[1]>1?1:0});
test('IA : le contourneur préfère Fenn ou Aelis, la coordination achève la même cible', ()=>{
 const s=arena5(),kael=unit5({id:'h0',team:'h',hi:0,x:3,y:4,hp:10}),fenn=unit5({id:'h1',team:'h',hi:1,x:5,y:4,hp:40}),w=unit5({id:'m0',team:'m',k:'wolf',x:4,y:4,atk:atk5()});
 s.units=[kael,fenn,w];assert.equal(aiStep(s,w).target,fenn); // Kael plus faible, mais le loup vise l'archer
 const sl=unit5({id:'m1',team:'m',k:'slime',x:4,y:4,atk:atk5()});s.units=[kael,fenn,sl];assert.equal(aiStep(s,sl).target,kael); // sans rôle : le plus faible
 s.focus={id:'h1',r:1};assert.equal(aiStep(s,sl).target,fenn); // cible déjà frappée ce tour
});
test('IA : le tireur recule s’il est collé, une fois par tour', ()=>{
 const s=arena5(),k=unit5({id:'h0',team:'h',hi:0,x:4,y:4}),m=unit5({id:'m0',team:'m',k:'shroom',x:4,y:5,pm:2,atk:atk5([1,4])});s.units=[k,m];
 const a=aiStep(s,m);assert.equal(a.type,'move');const[x,y]=a.to.split(',').map(Number);assert.ok(man(k,{x,y})>=2);
 m.x=x;m.y=y;m.pm=0;assert.equal(aiStep(s,m).type,'cast');
 const r=intent(s,{...m,x:4,y:5,backed:undefined});assert.ok(r&&r.target===k); // l'intention annoncée ne consomme pas le recul
});
test('IA : le tank reste près des monstres fragiles', ()=>{
 const s=arena5(),k=unit5({id:'h0',team:'h',hi:0,x:4,y:8}),g=unit5({id:'m0',team:'m',k:'golem',x:4,y:2,pm:2,atk:atk5()}),sh=unit5({id:'m1',team:'m',k:'shroom',x:4,y:0,atk:atk5([1,4])});
 s.units=[k,g,sh];const a=aiStep(s,g);const[x,y]=a.to.split(',').map(Number);assert.ok(man({x,y},sh)<=4);
});

// ---------- V4.5c : relance du même sort ----------
import {costOf,payCost as pay5} from '../src/rules.js';
test('PA : 2e lancer du même sort dans le tour = +1 PA, remis à zéro au tour suivant', ()=>{
 const h={team:'h',pa:6,cd:{},x:0,y:0},sl=SP.slash,sh=SP.smash;
 assert.equal(costOf(h,sl),3);pay5(h,sl,{x:1,y:0});assert.equal(h.pa,3);assert.equal(costOf(h,sl),4);assert.equal(costOf(h,sh),4); // autre sort : inchangé
 beginTurn(h);assert.equal(costOf(h,sl),3);
 const m={team:'m',pa:4,cd:{},x:0,y:0};pay5(m,sl,{x:1,y:0});assert.equal(costOf(m,sl),3); // monstres : pas concernés
});

// ---------- V4.5d : une arme active ----------
import {weaponOf,equip} from '../src/rules.js';
test('arme : une seule active par héros, choix du joueur, autres objets cumulés', ()=>{
 const sv={lvl:1,items:[0,1,2],up:{},rr:{},sp:[null,null,null]};
 assert.equal(weaponOf(sv,0),1);assert.equal(heroStats(sv,0).dmg,3); // hache seule (la plus forte), pas épée + hache
 assert.equal(equip(sv,0),1);assert.equal(heroStats(sv,0).dmg,2);assert.equal(heroStats(sv,0).hp,62+8); // bouclier toujours compté
 assert.equal(equip(sv,4),0);assert.equal(weaponOf(sv,1),null);sv.items=[1];assert.equal(weaponOf(sv,0),1); // arme vendue : repli
});

// ---------- V4.5e : Loup alpha ----------
test('Loup alpha : appel de la meute à 50 % PV, une fois, puis hurlement tous les 2 tours', ()=>{
 const F=fightSpec(1,9,5),s=newBattle(),{hs,es}=genMap(s,F.seed,F.th,F.cry);mkUnits(s,F,hs,es,HER.map((_,j)=>heroStats({lvl:7,items:[],sp:[null,null,null]},j)));
 const b=s.units.find(u=>u.bs==='howl');const n=s.units.length;hurt(s,b,Math.ceil(b.max*.55));assert.equal(s.units.length,n+2);
 const w=s.units.at(-1);assert.ok(w.n.startsWith('Loup de meute')&&w.xp===0&&w.k==='wolf');hurt(s,b,1);assert.equal(s.units.length,n+2);
 b.bt=0;assert.equal(bossNext(b),2);
});

// ---------- V4.7a : quatre emplacements ----------
import {gear,isOn,compare} from '../src/rules.js';
import {ITEMS as IT,SLOTS as SL} from '../src/data.js';
const sv47=o=>({lvl:1,items:[],up:{},rr:{},sp:[null,null,null],...o});
test('emplacements : chaque objet en a un, un seul objet équipé par emplacement', ()=>{
 assert.ok(IT.every(o=>SL[o.sl]));const sv=sv47({items:[8,9]});
 assert.equal(gear(sv,2).bijou,9);assert.equal(heroStats(sv,2).hp,40+6);assert.equal(heroStats(sv,2).dmg,0); // à égalité : l'amulette (PV)
 assert.equal(equip(sv,8),1);assert.equal(heroStats(sv,2).dmg,2);assert.equal(heroStats(sv,2).hp,40);assert.equal(isOn(sv,9),false)});
test('emplacements : comparaison sans modifier la sauvegarde', ()=>{const sv=sv47({items:[8,9]}),avant=JSON.stringify(sv);
 assert.deepEqual(compare(sv,8),[['PV',46,40],['dégâts',0,2]]);assert.deepEqual(compare(sv,9),[]);assert.equal(JSON.stringify(sv),avant);
 assert.deepEqual(compare(sv47(),3),[['PV',62,68]])}); // objet pas encore possédé (marchand)
test('emplacements : ancienne sauvegarde (wpn) respectée, vente = repli', ()=>{const sv=sv47({items:[0,1,2],wpn:[0,null,null]});
 assert.equal(gear(sv,0).arme,0);equip(sv,1);assert.equal(gear(sv,0).arme,1);sv.items=[0,2];assert.equal(gear(sv,0).arme,0);assert.equal(gear(sv,0).armure,null)});

// ---------- V4.7c : caractéristiques ----------
import {attrOf,attrEff,ptsLeft,spendAttr,resetAttr,cleanAttr} from '../src/rules.js';
import {ATTR,CRIT_CAP,DODGE_CAP} from '../src/data.js';
const sv=(lvl,o={})=>({lvl,xp:0,gold:0,items:[],sp:[null,null,null],...o});

test('V4.7c : une ancienne sauvegarde garde exactement ses valeurs et reçoit ses points libres', () => {
 const old=sv(9),a=[0,1,2].map(i=>heroStats(old,i));
 old.attr=cleanAttr(old.attr,old.lvl);
 for(const i of[0,1,2]){assert.deepEqual(heroStats(old,i),a[i]);assert.equal(ptsLeft(old,i),8)}
 assert.equal(a[0].crit,.12);assert.equal(a[0].dodge,0);
});
test('V4.7c : nettoyage idempotent, points valables gardés, répartition abîmée rendue', () => {
 const good=cleanAttr([{for:3,agi:2},{vit:5},{int:4}],6);
 assert.deepEqual(cleanAttr(good,6),good);assert.equal(good[0].for,3);assert.equal(good[2].int,4);
 for(const bad of[[{for:99}],[{for:-1}],[{for:1.5}],[{int:2}],[{vit:'3'}]])assert.deepEqual(cleanAttr(bad,6)[0],attrOf({},0),JSON.stringify(bad));
 for(const v of[null,'x',{},7])assert.equal(cleanAttr(v,6).length,6);
});
test('V4.7c : dépense tout ou rien, 1 point par niveau et par héros, redistribution', () => {
 const s=sv(4);
 assert.equal(spendAttr(s,0,{for:4}),0);assert.equal(spendAttr(s,0,{int:1}),0);assert.equal(spendAttr(s,2,{for:1}),0);assert.equal(spendAttr(s,0,{for:2,vit:-1}),0);assert.equal(ptsLeft(s,0),3);
 assert.equal(spendAttr(s,0,{for:2,vit:1}),1);assert.equal(ptsLeft(s,0),0);assert.equal(ptsLeft(s,1),3);assert.equal(spendAttr(s,0,{agi:1}),0);
 s.lvl=5;assert.equal(ptsLeft(s,0),1);
 resetAttr(s,0);assert.equal(ptsLeft(s,0),4);assert.deepEqual(heroStats(s,0),heroStats(sv(5),0));
});
test('V4.7c : effets, rendements décroissants et plafonds', () => {
 assert.deepEqual([10,15,20,24,49].map(attrEff),[10,12.5,15,16,22.25]);
 const base=heroStats(sv(11),0),f=heroStats(sv(11,{attr:[{for:10}]}),0),v=heroStats(sv(11,{attr:[{vit:10}]}),0);
 assert.ok(Math.abs(f.mult/base.mult-1.10)<1e-9);assert.equal(f.hp,base.hp);
 assert.equal(v.hp,Math.round(base.hp*1.2));assert.equal(v.mult,base.mult);
 const g=heroStats(sv(50,{attr:[{agi:49}]}),0);assert.ok(g.crit<=CRIT_CAP&&g.crit>.22);assert.ok(g.dodge<=DODGE_CAP);
 const t=heroStats(sv(50,{sp:[null,'eclaireur',null],attr:[{},{agi:49}]}),1);assert.ok(t.dodge>=.15&&t.dodge<=DODGE_CAP);
 const intel=heroStats(sv(11,{attr:[{},{},{int:10}]}),2);assert.ok(intel.mult>heroStats(sv(11),2).mult);
 for(const k in ATTR)assert.ok(ATTR[k].who.length);
});
test('V4.7c : le combat utilise les valeurs des caractéristiques', () => {
 const s=newBattle(()=>.5),{hs,es}=genMap(s,7,0),sav=sv(11,{attr:[{agi:10}]}),st=[0,1,2].map(i=>heroStats(sav,i));
 mkUnits(s,{...FIGHT,lvl:11},hs,es,st);const k=s.units.find(u=>u.hi===0);
 assert.equal(k.crit,st[0].crit);assert.equal(k.dodge,st[0].dodge);assert.ok(k.dodge>0);assert.equal(k.max,st[0].hp);
});

// ---------- V4.9 : Prairie à 10 étapes ----------
import {migratePrairie} from '../src/rules.js';
test('Prairie : 10 étapes, boss à la 10e, niveaux 1 à 3, gelées et sangliers', ()=>{
 const F=[...Array(10).keys()].map(i=>fightSpec(0,i,1));
 assert.deepEqual(F.map(f=>!!f.boss),[...Array(9).fill(false),true]);assert.equal(F[0].lvl,1);assert.equal(F[9].lvl,3);
 assert.deepEqual([F[4].goal,F[7].goal],['chief','survive']);assert.equal(F[7].wave.turns,5);
 for(const f of F)for(const k of f.en)assert.ok(['slime','boar','toxslime'].includes(k));
 for(const i of [0,1,2,3])assert.ok(!F[i].en.includes('toxslime'),'étapes 1 à 4 : pas de gelée toxique');for(let i=4;i<10;i++)assert.ok(F[i].en.includes('toxslime'));
 assert.equal(dailyFight({z:{}},10).cry,undefined);
});
test('Prairie : toutes les étapes se génèrent, bon nombre d’ennemis', ()=>{
 for(let i=0;i<10;i++)for(let seed=1;seed<=20;seed++){const F=fightSpec(0,i,seed),s=newBattle(),g=genMap(s,seed,F.th);mkUnits(s,F,g.hs,g.es,HS);
  assert.equal(s.units.filter(u=>u.team==='m').length,F.wave?3:F.en.length+(F.boss?1:0))}
});
test('Prairie : ancienne sauvegarde reprise une seule fois', ()=>{
 const a=migratePrairie({z:{prairie:4},st:{prairie:[3,2,1,3]}});assert.equal(a.z.prairie,10);assert.equal(a.st.prairie[9],3);assert.equal(a.st.prairie[3],0);
 const b=migratePrairie({z:{prairie:2},st:{prairie:[3,2]}});assert.equal(b.z.prairie,2);assert.deepEqual(b.st.prairie,[3,2]);
 b.z.prairie=4;migratePrairie(b);assert.equal(b.z.prairie,4);
});

// ---------- V4.10 : lumière du village ----------
import {skyOf} from '../src/rules.js';
test('village : lumière selon l\'heure, ou choix du joueur', ()=>{
 assert.deepEqual([5,6,16,17,19,20,23].map(h=>skyOf(undefined,h)),['nuit','jour','jour','soir','soir','nuit','nuit']);
 assert.equal(skyOf('nuit',12),'nuit');assert.equal(skyOf('auto',12),'jour');assert.equal(skyOf('n’importe',12),'jour');
});

// ---------- V4.11 : trois sorts du niveau 5 ----------
import {chargeDest} from '../src/rules.js';
import {SP5_LVL} from '../src/data.js';
const H5=(lvl)=>[0,1,2].map(i=>({hp:HER[i].hp,dmg:0,heal:0,mult:1,lvl}));
test('V4.11 : Charge, Tir perforant, Soin collectif s’ouvrent au niveau 5', () => {
 assert.deepEqual(HER.slice(0,3).map(h=>h.sp5),['charge','pshot','mheal']);
 for(const id of ['charge','pshot','mheal'])assert.ok(SP[id]);
 assert.deepEqual([SP.charge.pa,SP.charge.cd,SP.charge.r,SP.charge.dmg],[4,2,[2,3],[8,11]]);
 assert.deepEqual([SP.pshot.pa,SP.pshot.cd,SP.pshot.r,SP.pshot.dmg,SP.pshot.pierce],[4,2,[2,6],[11,14],1]);
 assert.deepEqual([SP.mheal.pa,SP.mheal.cd,SP.mheal.r,SP.mheal.heal],[5,3,[0,3],[7,9]]);
 for(const[l,has]of[[SP5_LVL-1,false],[SP5_LVL,true]]){const s=newBattle(()=>.5),g=genMap(s,5,0);mkUnits(s,FIGHT,g.hs,g.es,H5(l));
  const hs=s.units.filter(u=>u.team==='h');assert.deepEqual(hs.map(u=>u.sp.includes(HER[u.hi].sp5)),[has,has,has])}
 const sv={lvl:5,xp:0,items:[],sp:[null,null,null]};assert.equal(heroStats(sv,0).lvl,5);
});
test('V4.11 : Charge avance sans PM jusqu’à une case voisine et frappe', () => {
 const s=arena(),k=unit(s,'h',0,0),m=unit(s,'m',3,0,{hp:40,max:40});
 assert.ok(okTarget(s,k,SP.charge,m));assert.deepEqual(chargeDest(s,k,SP.charge,m),{x:2,y:0,path:[[1,0],[2,0]]});
 payCost(k,SP.charge,m);applySpell(s,k,SP.charge,{x:3,y:0});
 assert.deepEqual([k.x,k.y,k.pm,k.pa,k.cd.Charge],[2,0,3,2,2]);assert.ok(m.hp<40&&m.hp>=40-11);
 const near=unit(s,'m',2,1);assert.ok(!okTarget(s,k,SP.charge,near),'au contact : portée min. 2');
});
test('V4.11 : Charge ne traverse ni unité ni obstacle, ni avance automatique', () => {
 const s=arena(),k=unit(s,'h',0,0),m=unit(s,'m',2,0);unit(s,'m',1,0); // le seul chemin court passe par (1,0)
 s.map.get(K(1,1)).block=1;
 assert.equal(chargeDest(s,k,SP.charge,m),null);assert.ok(!okTarget(s,k,SP.charge,m));
 const far=unit(s,'m',6,0);assert.equal(approach(s,k,SP.charge,far),null);
 const before=JSON.stringify([k.x,k.y]);assert.deepEqual(applySpell(s,k,SP.charge,m),[]);assert.equal(JSON.stringify([k.x,k.y]),before);
});
test('V4.11 : Tir perforant ignore toute l’armure, une seule cible', () => {
 const s=arena(),f=unit(s,'h',0,0,{crit:0}),a=unit(s,'m',4,0,{hp:80,max:80,armor:.25}),b=unit(s,'m',4,4,{hp:80,max:80});
 const fa=forecast(s,f,SP.pshot,a),fb=forecast(s,f,SP.pshot,b);assert.deepEqual(fa.dmg,fb.dmg);assert.deepEqual(fa.dmg,[11,14]);
 const nb=unit(s,'m',5,0,{hp:80,max:80});applySpell(s,f,SP.pshot,{x:4,y:0});assert.equal(nb.hp,80);assert.ok(a.hp<80);
});
test('V4.11 : Soin collectif soigne la cible et les alliés collés, sans résurrection, sans Aura', () => {
 const s=arena(),ae=unit(s,'h',0,0,{buff:{pct:.3,turns:2}}),t=unit(s,'h',2,0,{hp:20}),adj=unit(s,'h',3,0,{hp:20}),far=unit(s,'h',6,6,{hp:20}),
  ko=unit(s,'h',2,1,{hp:0,dead:true}),foe=unit(s,'m',1,0,{hp:20});
 assert.ok(okTarget(s,ae,SP.mheal,t));assert.ok(okTarget(s,ae,SP.mheal,ae),'portée 0 : sur soi');
 applySpell(s,ae,SP.mheal,{x:2,y:0});
 assert.deepEqual([t.hp,adj.hp,far.hp,ko.hp,ko.dead,foe.hp],[28,28,20,0,true,20]); // 7–9 → 8 avec rng 0,5 ; Aura ignorée
});

// ---------- V4.12 : lot 3, 12 nouveaux équipements (table ChatGPT eq11-eq22) ----------
import {lootPool,lootRare,holder,gearAll,fits,lvOf} from '../src/rules.js';
import {whoOf,icOf} from '../src/data.js';
import {readFileSync} from 'node:fs';
const J=id=>ITEMS.findIndex(o=>o.id===id),SV2=(o={})=>({lvl:10,gold:1000,xp:0,items:[],sp:[null,null,null],up:{},...o});
test('V4.12 / V4.22 : 63 objets, les 10 historiques inchangés, ids et icônes valides', () => {
 assert.equal(ITEMS.slice(0,86).filter(o=>o.src!=='quest').length,79); // V4.64 (hors objets signature V4.75) : +16 (Nyra, Lyria), testés à part
 assert.deepEqual(ITEMS.slice(0,10).map(o=>[o.n,o.pr,whoOf(o).filter(i=>i<3)[0],o.sl,o.dmg||o.hp||o.heal,o.rr,o.lv,o.src]),
  [['Épée courte',60,0,'arme',2],['Hache de guerre',120,0,'arme',3],['Bouclier rond',90,0,'accessoire',8],['Heaume',70,0,'armure',6],['Arc long',60,1,'arme',2],
   ['Armure de cuir',70,1,'armure',6],['Bottes de cuir',50,1,'accessoire',4],['Bâton de saule',60,2,'arme',3],['Anneau de rubis',100,2,'bijou',2],['Amulette',70,2,'bijou',6]].map(a=>[...a,undefined,undefined,undefined]));
 const at=JSON.parse(readFileSync(new URL('../assets/atlas.json',import.meta.url)));
 ITEMS.slice(10,63).forEach((o,k)=>{assert.equal(o.id,'eq'+(11+k));assert.deepEqual(icOf(o),['equip',k]);assert.ok(at.equip[k]);assert.ok([0,1,2].includes(o.rr));assert.ok(['shop','loot'].includes(o.src));
  assert.equal([o.dmg,o.hp,o.heal].filter(Boolean).length,1,'un seul bonus');assert.ok(!o.pa&&!o.pm)});
 assert.deepEqual(whoOf(ITEMS[J('eq17')]),[0,1,2,3,4,5]);assert.deepEqual(whoOf(ITEMS[J('eq21')]),[0,1,4,5]);
});
test('V4.12 : rareté fixe, valeurs du moteur, revente au prix final', () => {
 const sv=SV2({items:[J('eq18'),J('eq12')],rr:{[J('eq18')]:0,[J('eq12')]:2}}); // save.rr ignoré pour les nouveaux
 assert.equal(rarOf(sv,J('eq18')),1);assert.equal(rarOf(sv,J('eq12')),1);
 assert.equal(itemVal(ITEMS[J('eq18')],'dmg',0,1),2,'bracelet base 1 rare : 1,5 arrondi à 2');assert.equal(itemVal(ITEMS[J('eq19')],'hp',0,1),9);
 assert.equal(sellPrice(sv,J('eq12')),63);sv.up[J('eq12')]=1;assert.equal(sellPrice(sv,J('eq12')),75);
 assert.equal(sellPrice({items:[1],rr:{1:1}},1),90,'historique : prix × rareté comme avant');
 for(let k=0;k<20;k++)assert.equal(lootRare(J('eq17'),Math.random,1),0);
});
test('V4.12 : niveau requis et source au marchand et au butin', () => {
 const lo=SV2({lvl:2}),hi=SV2({lvl:8});
 for(let d=0;d<40;d++){for(const j of shopStock(hi,d))assert.notEqual(ITEMS[j].src,'loot');for(const j of shopStock(lo,d))assert.ok(lvOf(j)<=2)}
 assert.equal(buy(lo,J('eq14')),0,'niveau 3 requis');assert.equal(buy(hi,J('eq15')),0,'butin seulement');assert.equal(buy(hi,J('eq14')),1);
 assert.ok(lootPool(hi).every(j=>ITEMS[j].src!=='shop'&&!hi.items.includes(j)));assert.ok(lootPool(hi).includes(J('eq22')));assert.ok(!lootPool(lo).includes(J('eq17')));
 assert.equal(equip(SV2({lvl:4,items:[J('eq21')]}),J('eq21'),0),0,'gants : niveau 5');
});
test('V4.12 : objet partagé, un seul porteur, transfert, sans doublon de bonus', () => {
 const a=J('eq17'),sv=SV2({lvl:6,items:[a,9]}); // anneau pour tous + amulette d'Aelis
 const G=gearAll(sv);assert.equal(G.filter(g=>g.bijou===a).length,1);assert.equal(holder(sv,a),0,'libre : premier héros sans bijou');assert.equal(G[2].bijou,9);
 const hp=i=>heroStats(sv,i).hp,base=[0,1,2].map(i=>heroStats(SV2({lvl:6}),i).hp);
 assert.deepEqual([hp(0)-base[0],hp(1)-base[1]],[4,0]);
 assert.deepEqual(compare(sv,a,1),[['PV',base[1],base[1]+4]]);
 assert.equal(equip(sv,a,1),1);assert.equal(holder(sv,a),1);assert.equal(gear(sv,0).bijou,null);assert.deepEqual([hp(0)-base[0],hp(1)-base[1]],[0,4]);
 assert.equal(equip(sv,a,2),1);assert.equal(holder(sv,a),2);assert.equal(sv.eq['1:bijou'],undefined);assert.equal(gear(sv,1).bijou,null);
 assert.ok(isOn(sv,a));assert.ok(!isOn(sv,9),'l’amulette passe en réserve');
 assert.equal(equip(sv,J('eq21'),2),0,'gants : pas pour Aelis');
 sv.eq['0:bijou']=a;sv.eq['2:bijou']=a; // sauvegarde abîmée : deux choix pour le même objet
 assert.equal(gearAll(sv).filter(g=>g.bijou===a).length,1);
 const g=sell(sv,a);assert.ok(g>0);assert.equal(holder(sv,a),-1);assert.equal(gear(sv,2).bijou,9);
});
test('V4.12 : sauvegarde d’avant le lot 3 : même équipement qu’avant', () => {
 const sv={lvl:5,items:[0,1,2,3,4,5,6,7,8,9],wpn:[0,null,null],eq:{'2:bijou':9},up:{1:1},rr:{2:2}};
 assert.deepEqual(gearAll(sv),[{arme:0,armure:3,bijou:null,accessoire:2},{arme:4,armure:5,bijou:null,accessoire:6},{arme:7,armure:null,bijou:9,accessoire:null},{},{},{}]);
 assert.equal(rarOf(sv,2),2);
});
test('V4.12 : Soin collectif, lanceur adjacent, PV plafonnés, un seul coût', () => {
 const s=arena(),ae=unit(s,'h',2,1,{hp:40,max:46,healMul:1.2}),t=unit(s,'h',2,0,{hp:45,max:50});
 payCost(ae,SP.mheal,t);applySpell(s,ae,SP.mheal,{x:2,y:0});
 assert.deepEqual([t.hp,ae.hp,ae.pa,ae.cd['Soin collectif']],[50,46,1,3]); // 8 × 1,2 = 10 → plafonné à 50 ; lanceur collé soigné une fois
});

test('V4.13 : gelée toxique, poison 2 × 2 tours, marque distincte', () => {
 const s=arena(),t=unit(s,'m',1,0),h=unit(s,'h',0,0,{hp:50,max:50,dir:0});
 const F={lvl:2,pool:['toxslime'],boss:null,en:['toxslime']};mkUnits(s,F,[{x:0,y:5},{x:1,y:5},{x:2,y:5}],[{x:5,y:5}],HS);
 const m=s.units.find(u=>u.team==='m'&&u.k==='toxslime');assert.equal(m.s,'slimeT');assert.deepEqual(m.atk.poison,[2,2]);assert.ok(m.atk.dmg[1]<=6);
 const k=s.units.find(u=>u.team==='h'),sp=m.atk;m.x=k.x+1;m.y=k.y;payCost(m,sp,k);const hp=k.hp;applySpell(s,m,sp,k);
 assert.ok(k.hp<hp);assert.deepEqual([k.poison.d,k.poison.turns],[2,2]);
 const ev=poisonTick(s,k);assert.ok(ev.length&&k.poison.turns===1);
});

// ---------- V4.14 : lot 4, Bois sombre à 10 étapes ----------
import {migrateBois} from '../src/rules.js';
test('V4.14 : Bois sombre, 10 étapes, niveaux 4 à 6, objectifs, boss au 10e', () => {
 const F=[...Array(10).keys()].map(i=>fightSpec(1,i,1));
 assert.deepEqual(F.map(f=>!!f.boss),[...Array(9).fill(false),true]);assert.deepEqual(F.map(f=>f.lvl),[4,4,4,5,5,5,5,6,6,6]);
 assert.deepEqual(F.map(f=>f.goal),[null,null,null,null,'chief',null,null,'survive',null,null]);assert.equal(F[7].wave.turns,6);
 for(const f of F)for(const k of f.en)assert.ok(['wolf','shroom','bat'].includes(k));
 for(let i=0;i<10;i++)for(let seed=1;seed<=10;seed++){const f=fightSpec(1,i,seed),s=newBattle(),g=genMap(s,seed,f.th);mkUnits(s,f,g.hs,g.es,HS);
  assert.equal(s.units.filter(u=>u.team==='m').length,f.wave?f.wave.start:f.en.length+(f.boss?1:0))}
});
test('V4.14 : sauvegarde, Bois terminé reste terminé, progression partielle gardée', () => {
 const a=migrateBois({z:{prairie:10,bois:4},st:{bois:[3,2,3,1]}});assert.equal(a.z.bois,10);assert.deepEqual([a.st.bois[3],a.st.bois[9]],[0,1]);assert.ok(zoneDone(a,1));
 const b=migrateBois({z:{bois:2},st:{}});assert.equal(b.z.bois,2);assert.equal(migrateBois({z:{bois:4},b10:1}).z.bois,4,'une seule fois');
});

// ---------- V4.15 : lot 5, Côte dorée à 10 étapes ----------
import {migrateCote} from '../src/rules.js';
test('V4.15 : Côte dorée, 10 étapes, niveaux 7 à 9, survie au 8e, Crabe royal au 10e', () => {
 const F=[...Array(10).keys()].map(i=>fightSpec(2,i,1));
 assert.deepEqual(F.map(f=>!!f.boss),[...Array(9).fill(false),true]);assert.deepEqual(F.map(f=>f.lvl),[7,7,7,8,8,8,8,9,9,9]);
 assert.deepEqual(F.map(f=>f.goal),[null,null,null,null,'chief',null,null,'survive',null,null]);assert.equal(F[7].wave.add[2][2],'knightB');
 for(let i=0;i<10;i++)for(let seed=1;seed<=10;seed++){const f=fightSpec(2,i,seed),s=newBattle(),g=genMap(s,seed,f.th);mkUnits(s,f,g.hs,g.es,HS);
  assert.equal(s.units.filter(u=>u.team==='m').length,f.wave?f.wave.start:f.en.length+(f.boss?1:0))}
 const a=migrateCote({z:{plage:4},st:{plage:[3,2,3,1]}});assert.equal(a.z.plage,10);assert.deepEqual([a.st.plage[3],a.st.plage[9]],[0,1]);assert.equal(migrateCote({z:{plage:2}}).z.plage,2);
});

// ---------- V4.16 : lot 6, Monts gris à 10 étapes ----------
import {migrateMonts} from '../src/rules.js';
test('V4.16 : Monts gris, 10 étapes, niveaux 10 à 12, survie au 8e, Golem ancien au 10e', () => {
 const F=[...Array(10).keys()].map(i=>fightSpec(3,i,1));
 assert.deepEqual(F.map(f=>!!f.boss),[...Array(9).fill(false),true]);assert.deepEqual(F.map(f=>f.lvl),[10,10,10,11,11,11,11,12,12,12]);
 assert.deepEqual(F.map(f=>f.goal),[null,null,null,null,'chief',null,null,'survive',null,null]);assert.equal(F[7].wave.add[2][2],'knightR');
 for(let i=0;i<10;i++)for(let seed=1;seed<=10;seed++){const f=fightSpec(3,i,seed),s=newBattle(),g=genMap(s,seed,f.th);mkUnits(s,f,g.hs,g.es,HS);
  assert.equal(s.units.filter(u=>u.team==='m').length,f.wave?f.wave.start:f.en.length+(f.boss?1:0))}
 const a=migrateMonts({z:{mont:4},st:{mont:[3,2,3,1]}});assert.equal(a.z.mont,10);assert.deepEqual([a.st.mont[3],a.st.mont[9]],[0,1]);assert.equal(migrateMonts({z:{mont:2}}).z.mont,2);
});

// ---------- V4.17 : lot 7, Château en ruine à 10 étapes ----------
import {migrateChateau} from '../src/rules.js';
test('V4.17 : Château, 10 étapes, niveaux 13 à 15, survie au 8e, Chevalier noir au 10e', () => {
 const F=[...Array(10).keys()].map(i=>fightSpec(4,i,1));
 assert.deepEqual(F.map(f=>!!f.boss),[...Array(9).fill(false),true]);assert.deepEqual(F.map(f=>f.lvl),[13,13,13,14,14,14,14,15,15,15]);
 assert.deepEqual(F.map(f=>f.goal),[null,null,null,null,'chief',null,null,'survive',null,null]);assert.equal(F[7].wave.add[2][2],'knightN');
 for(let i=0;i<10;i++)for(let seed=1;seed<=10;seed++){const f=fightSpec(4,i,seed),s=newBattle(),g=genMap(s,seed,f.th);mkUnits(s,f,g.hs,g.es,HS);
  assert.equal(s.units.filter(u=>u.team==='m').length,f.wave?f.wave.start:f.en.length+(f.boss?1:0))}
 const a=migrateChateau({z:{chateau:4},st:{chateau:[3,2,3,1]}});assert.equal(a.z.chateau,10);assert.deepEqual([a.st.chateau[3],a.st.chateau[9]],[0,1]);assert.equal(migrateChateau({z:{chateau:2}}).z.chateau,2);
});

test('V4.22 : eq23 à eq63, paliers de niveau et accès par le marchand ou le butin', () => {
 const lv=[[3,6],[8,11],[16,19]];
 ITEMS.slice(22,63).forEach(o=>assert.ok(o.lv>=lv[o.rr][0]&&o.lv<=lv[o.rr][1],o.id));
 const hi=SV2({lvl:19,gold:99999});
 ITEMS.forEach((o,j)=>{if(j<22||j>=63)return;if(o.src==='loot')assert.ok(lootPool(hi).includes(j),o.id);else assert.equal(buy({...hi,items:[]},j),1,o.id)});
 assert.ok(lootPool(SV2({lvl:15})).every(j=>ITEMS[j].rr!==2||j<22),'aucun épique avant 16');
});

test('V4.25 : carte II fermée avant le Titan, six repères dans l’image, sans toucher aux zones',async()=>{
 const{map2Open,zoneDone}=await import('../src/rules.js'),{MAP2,ZONES,zlen}=await import('../src/data.js');
 assert.equal(ZONES.length,12);assert.equal(map2Open({z:{}}),false);
 const z=ZONES[5];assert.equal(map2Open({z:{[z.id]:zlen(z)-1}}),false);assert.equal(map2Open({z:{[z.id]:zlen(z)}}),true);
 assert.equal(MAP2.length,6);for(const p of MAP2)assert.ok(p.x>=6&&p.x<=94&&p.y>=6&&p.y<=94&&p.lx>=6&&p.lx<=94&&p.ly>=6&&p.ly<=94);
});

test('V4.40 : région 7 ouverte, 10 missions, cases brûlantes annoncées un tour à l’avance',async()=>{
 const r=await import('../src/rules.js'),{ZONES,R7,MON,PREVIEW,HER}=await import('../src/data.js');
 assert.equal(PREVIEW,false);assert.equal(ZONES[6],R7);assert.equal(R7.fights.length,10);
 for(const f of R7.fights){assert.ok(f.lava.n>0);for(const k of f.en)assert.ok(MON[k])}
 {
  const F=r.fightSpec(6,0,1),s=r.newBattle(r.mulberry(3)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:21,items:[],up:{},sp:[null,null,null]},i)));
  assert.equal(s.lava.next.length,3);
  const h=s.units.find(u=>u.team==='h'),m=s.units.find(u=>u.k==='salam'),hp=h.hp,mhp=m.hp;
  s.lava.next=[{x:h.x,y:h.y},{x:m.x,y:m.y}];h.armor=.5;r.lavaTick(s);
  assert.equal(h.hp,hp-Math.round(h.max*.12));assert.equal(m.hp,mhp,'la salamandre ne brûle pas');
  assert.equal(s.lava.next.length,0,'un tour de calme');r.lavaTick(s);assert.equal(s.lava.next.length,3);
 }
});

// V4.33 : équipe de 3 parmi les héros disponibles, et Orion (ajouté en dernier : ces tests modifient HER)
test('équipe : valeur absente ou abîmée = Kael, Fenn, Aelis ; sauvegarde non modifiée', () => {
  for (const team of [undefined, null, [0, 1], [0, 0, 1], [0, 1, 4], [0, 1, 'a'], 'abc']) {
    const s = { lvl: 21, items: [], team }, avant = JSON.stringify(s);
    assert.deepEqual(teamOf(s), [0, 1, 2]);
    assert.equal(JSON.stringify(s), avant);
  }
});
test('Orion : ajout unique, échange d’équipe, caractéristiques, objets partagés seulement', () => {
  const avant = ITEMS.filter(o => whoOf(o).length === 6).length;
  assert.ok(avant > 0);
  addOrion(); addOrion();
  assert.equal(HER.length, 6, 'Orion, Nyra et Lyria, ajoutés une seule fois');
  assert.equal(ITEMS.filter(o => whoOf(o).length === 6).length, avant);
  assert.equal(ITEMS.slice(0, 86).filter(o => whoOf(o).includes(3) && whoOf(o).length < 6).length, 0); // V5.0 : Orion a ses 10 objets dédiés (110 à 119), testés à part
  const s = { lvl: 21, items: [], up: {}, attr: [{ vit: 3 }, {}, {}] };
  s.attr = cleanAttr(s.attr, s.lvl);
  assert.equal(s.attr.length, 6);
  assert.equal(s.attr[0].vit, 3, 'anciens points gardés');
  assert.equal(spendAttr(s, 3, { int: 20 }), 1, 'Orion a son budget complet');
  assert.equal(swapTeam(s, 1, 1), 0);
  assert.equal(swapTeam(s, 3, 0), 0);
  assert.equal(swapTeam(s, 2, 3), 1);
  assert.deepEqual(teamOf(s), [0, 1, 3]);
  assert.ok(heroStats(s, 3).hp < heroStats(s, 1).hp);
});
test('Orion : l’équipe est servie en premier par la distribution du matériel', () => {
  const j = ITEMS.findIndex(o => whoOf(o).length === 6);
  const s = { lvl: 50, items: [j], up: {}, team: [0, 1, 3] };
  assert.notEqual(holder(s, j), 2);
});
test('Orion en combat : 3 unités, bons sorts, brûlure sans cumul et insensibilité', () => {
  const st = { lvl: 25, items: [], up: {}, team: [0, 3, 1] };
  const s = newBattle(); s.pot = 0;
  const F = fightSpec(0, 0, 7), { hs, es } = genMap(s, F.seed, F.th, F.cry);
  mkUnits(s, F, hs, es, HER.map((_, i) => heroStats(st, i)), teamOf(st));
  const H = s.units.filter(u => u.team === 'h');
  assert.deepEqual(H.map(u => u.k), ['warrior', 'mage', 'archer']);
  const o = H[1];
  assert.deepEqual(o.sp, ['arcane', 'flame', 'frost', 'fireball', 'icewall', 'blink']);
  const m = s.units.find(u => u.team === 'm'); m.hp = m.max = 999;
  s.rng = () => .99;
  applySpell(s, o, o.S.flame, m); applySpell(s, o, o.S.flame, m);
  assert.deepEqual(m.burn, { d: 3, turns: 2 });
  let p = m.hp; poisonTick(s, m); assert.ok(m.hp < p); poisonTick(s, m); assert.equal(m.burn, undefined);
  p = m.hp; poisonTick(s, m); assert.equal(m.hp, p);
  m.k = 'fireel'; applySpell(s, o, o.S.flame, m); assert.equal(m.burn, undefined);
});
test('Boule de feu : 60 % autour du centre, aperçu égal à l’effet, alliés épargnés', () => {
  const st = { lvl: 25, items: [], up: {}, team: [0, 1, 3] };
  const s = newBattle(); s.pot = 0;
  const F = fightSpec(0, 0, 7), { hs, es } = genMap(s, F.seed, F.th, F.cry);
  mkUnits(s, F, hs, es, HER.map((_, i) => heroStats(st, i)), teamOf(st));
  const o = s.units.find(u => u.k === 'mage'), [a, b] = s.units.filter(u => u.team === 'm'), ami = s.units.find(u => u.k === 'warrior');
  Object.assign(a, { x: 4, y: 4, hp: 999, max: 999, armor: 0 }); Object.assign(b, { x: 5, y: 4, hp: 999, max: 999, armor: 0 }); Object.assign(ami, { x: 4, y: 5 });
  const c = { x: 4, y: 4 }, centre = forecast(s, o, o.S.fireball, a, o, c), autour = forecast(s, o, o.S.fireball, b, o, c);
  assert.ok(Math.abs(autour.dmg[1] - centre.dmg[1] * .6) <= 1);
  const pv = ami.hp; s.rng = () => .5; applySpell(s, o, o.S.fireball, c);
  assert.equal(ami.hp, pv);
  assert.ok(999 - a.hp >= centre.dmg[0] && 999 - a.hp <= centre.dmg[1]);
  assert.ok(999 - b.hp >= autour.dmg[0] && 999 - b.hp <= autour.dmg[1]);
});

// V4.37 : les 6 autres sorts d'Orion et les 6 sorts emportés
function terrain(load, lvl = 50) {
  const s = arena(); s.round = 1;
  const o = unit(s, 'h', 2, 5, { k: 'mage', hi: 3, hp: 100, max: 100, mult: 1, S: SP, sp: load, crit: 0.0001 });
  s.rng = () => .5;
  return { s, o };
}
const foe = (s, x, y, o = {}) => unit(s, 'm', x, y, { k: 'slime', hp: 200, max: 200, armor: 0, atk: { n: 'Attaque', pa: 4, r: [1, 1], t: 'enemy', dmg: [10, 10] }, maxPA: 4, pa: 4, ...o });

test('sorts connus : 7 au recrutement (niveau 20), 10 au niveau 45, 6 emportés au plus', () => {
  assert.deepEqual([1, 5, 20, 24, 25, 35, 45].map(lvl => knownSpells({ lvl }, 3).length), [3, 4, 7, 7, 8, 9, 10]);
  assert.deepEqual(loadoutOf({ lvl: 20 }, 3), ['arcane', 'flame', 'frost', 'fireball', 'icewall', 'blink']);
  for (const load of [undefined, null, 'x', { 3: null }, { 3: ['storm', 'storm', 'zzz'] }]) {
    const l = loadoutOf({ lvl: 20, load }, 3);
    assert.equal(l.length, 6); assert.equal(new Set(l).size, 6); assert.ok(!l.includes('storm'));
  }
  const s = { lvl: 20 };
  assert.equal(swapSpell(s, 3, 'blink', 'storm'), 0, 'pas encore appris');
  assert.equal(swapSpell(s, 3, 'blink', 'flame'), 0, 'déjà emporté');
  assert.equal(swapSpell(s, 3, 'blink', 'weaken'), 1);
  assert.deepEqual(loadoutOf(s, 3), ['arcane', 'flame', 'frost', 'fireball', 'icewall', 'weaken']);
});
test('mur de glace : bloque le passage et la vue, expire au bon tour de table', () => {
  const { s, o } = terrain(['icewall']);
  assert.ok(okTarget(s, o, SP.icewall, { x: 4, y: 5 }));
  applySpell(s, o, SP.icewall, { x: 4, y: 5 });
  const c = cell(s, 4, 5);
  assert.deepEqual(c.ice, { hp: 40, max: 40, until: 3 });
  assert.ok(!passable(s, 4, 5));
  assert.ok(!los(s, o, { x: 6, y: 5 }));
  assert.ok(!okTarget(s, o, SP.icewall, { x: 4, y: 5 }), 'pas de second mur sur la même case');
  s.round = 2; iceTick(s); assert.ok(c.ice);
  s.round = 3; iceTick(s); assert.ok(!c.ice && !c.block && passable(s, 4, 5));
});
test('mur de glace : un ennemi bloqué le frappe et le casse ; il ne frappe pas le mur s’il peut atteindre un héros', () => {
  const { s, o } = terrain(['icewall']);
  for (let y = 0; y < 12; y++) if (y !== 5) cell(s, 4, y).block = 1;
  applySpell(s, o, SP.icewall, { x: 4, y: 5 });
  const m = foe(s, 5, 5, { pm: 3, maxPM: 3 });
  const a = aiStep(s, m);
  assert.equal(a.type, 'cast'); assert.ok(a.target.ice);
  for (let k = 0; k < 4; k++) applySpell(s, m, m.atk, a.target);
  assert.ok(passable(s, 4, 5));
  applySpell(s, o, SP.icewall, { x: 4, y: 5 });
  Object.assign(o, { x: 5, y: 4 });
  const b = aiStep(s, m);
  assert.ok(!(b && b.target && b.target.ice));
});
test('téléportation : déplace Orion sans PM, refuse une case occupée', () => {
  const { s, o } = terrain(['blink']); const m = foe(s, 3, 5);
  assert.ok(!okTarget(s, o, SP.blink, m));
  applySpell(s, o, SP.blink, { x: 2, y: 8 });
  assert.deepEqual([o.x, o.y, o.pm], [2, 8, 3]);
});
test('affaiblissement : −20 % sans cumul, deux tours de la cible', () => {
  const { s, o } = terrain(['weaken']); const m = foe(s, 4, 5);
  applySpell(s, o, SP.weaken, m); applySpell(s, o, SP.weaken, m);
  assert.deepEqual(m.weak, { pct: .2, turns: 2 });
  const pv = o.hp; applySpell(s, m, { ...m.atk, r: [1, 9] }, o); assert.equal(pv - o.hp, 8);
  assert.equal(m.hp, 200, 'aucun dégât');
  endTurn(m); assert.ok(m.weak); endTurn(m); assert.equal(m.weak, undefined);
});
test('explosion : ennemis collés seulement, repoussés d’une case ; impossible sans ennemi collé', () => {
  const { s, o } = terrain(['nova']);
  assert.ok(!okTarget(s, o, SP.nova, o));
  const a = foe(s, 3, 5), loin = foe(s, 4, 6), ami = unit(s, 'h', 2, 4);
  assert.ok(okTarget(s, o, SP.nova, o));
  const f = forecast(s, o, SP.nova, a, o);
  applySpell(s, o, SP.nova, o);
  assert.ok(200 - a.hp >= f.dmg[0] && 200 - a.hp <= f.dmg[1]);
  assert.deepEqual([a.x, a.y, loin.hp, ami.hp, ami.y, o.hp], [4, 5, 200, 50, 4, 100]);
});
test('glyphe : un seul à la fois, un seul déclenchement, disparaît si Orion tombe', () => {
  const { s, o } = terrain(['glyph']);
  applySpell(s, o, SP.glyph, { x: 4, y: 5 }); applySpell(s, o, SP.glyph, { x: 5, y: 5 });
  assert.deepEqual([o.trap.x, o.trap.y], [5, 5]);
  const m = foe(s, 5, 5);
  stepOn(s, m); assert.ok(200 - m.hp >= 12 && 200 - m.hp <= 16); assert.equal(m.slow, undefined); assert.equal(o.trap, undefined);
  m.x = 9; applySpell(s, o, SP.glyph, { x: 5, y: 5 }); hurt(s, o, 999, 'x'); assert.equal(o.trap, undefined);
});
test('tempête : rayon 2, 50 % autour, alliés épargnés, une fois par combat', () => {
  const { s, o } = terrain(['storm']);
  const c = { x: 6, y: 5 }, a = foe(s, 6, 5), b = foe(s, 7, 6), hors = foe(s, 8, 6), ami = unit(s, 'h', 6, 7);
  const centre = forecast(s, o, SP.storm, a, o, c), bord = forecast(s, o, SP.storm, b, o, c);
  assert.ok(Math.abs(bord.dmg[1] - centre.dmg[1] / 2) <= 1);
  payCost(o, SP.storm, c); applySpell(s, o, SP.storm, c);
  assert.ok(200 - a.hp > 200 - b.hp && b.hp < 200);
  assert.deepEqual([hors.hp, ami.hp], [200, 50]);
  assert.equal(zoneCells(s, c, 2).length, 13);
  for (let k = 0; k < 20; k++) beginTurn(o);
  assert.ok(o.cd[SP.storm.n] > 0);
});

// V4.38 : talents d'Orion (ces tests viennent après addOrion)
const orion = (lvl, voie) => heroStats({ lvl, items: [], up: {}, sp: [null, null, null, voie] }, 3).tal.sp;
test('talents d’Orion : 5 paliers aux niveaux 3, 7, 11, 25 et 40, une seule voie', () => {
  assert.deepEqual([2, 3, 7, 11, 24, 25, 40].map(l => tiersOf(l, 3)), [0, 1, 2, 3, 3, 4, 5]);
  assert.deepEqual([2, 11, 25, 40].map(l => tiersOf(l, 0)), [0, 3, 4, 5], 'Kael a 5 paliers (V4.46)');
  assert.deepEqual([2, 11, 25, 40].map(l => tiersOf(l, 1)), [0, 3, 4, 5], 'Fenn a 5 paliers (V4.47)');
  assert.deepEqual([2, 11, 25, 40].map(l => tiersOf(l, 2)), [0, 3, 4, 5], 'Aelis a 5 paliers (V4.48)');
  assert.deepEqual(cleanSp(['berserk', null, null]), ['berserk', null, null, null, null, null], 'ancienne sauvegarde à 3 entrées');
  assert.deepEqual(cleanSp([null, null, null, 'berserk']), [null, null, null, null, null, null]);
  assert.deepEqual(orion(50, null), {});
  assert.equal(orion(50, 'pyro').frost, undefined);
});
test('talents d’Orion : valeurs cumulées par palier', () => {
  assert.deepEqual(orion(24, 'pyro').flame.burn, [4, 2]);
  const p = orion(40, 'pyro');
  assert.deepEqual([p.flame.burn, p.flame.r, p.flame.k, p.fireball.side, p.fireball.k], [[4, 3], [1, 5], 1.1, .7, 1.1]);
  assert.deepEqual(orion(11, 'cryo').icewall.wall, { turns: 2, hp: .48 });
  const c = orion(40, 'cryo');
  assert.deepEqual([c.frost.r, c.frost.k, c.frost.slow, c.icewall.wall], [[1, 5], 1.1, 2, { turns: 3, hp: .48 }]);
  const a = orion(40, 'arcaniste');
  assert.deepEqual([a.arcane.r, a.blink.r, a.weaken.weaken, a.glyph.k, a.storm.side], [[1, 6], [1, 4], [.2, 3], 1.1, .6]);
  assert.equal(SP.frost.slow, 1, 'les sorts de base ne sont pas modifiés');
});
test('bonus de sort +10 % : aperçu et effet', () => {
  const { s, o } = terrain(['frost']), m = foe(s, 4, 5);
  const base = forecast(s, o, SP.frost, m).dmg, plus = forecast(s, o, { ...SP.frost, k: 1.1 }, m).dmg;
  assert.deepEqual([base, plus], [[8, 11], [9, 12]]);
});
test('Gel profond : −2 PM, au moins 1 restant, boss à −1, jamais affaibli par un −1', () => {
  const gel = { ...SP.frost, slow: 2 };
  for (const [maxPM, boss, attendu] of [[4, 0, 2], [3, 0, 1], [2, 0, 1], [4, 1, 3]]) {
    const { s, o } = terrain(['frost']), m = foe(s, 4, 5, { maxPM, pm: maxPM, boss });
    applySpell(s, o, gel, m); applySpell(s, o, SP.frost, m);
    beginTurn(m); assert.equal(m.pm, attendu, `${maxPM} PM, boss ${boss}`);
    beginTurn(m); assert.equal(m.pm, maxPM);
  }
});

// V4.39 : maîtrise des sorts d'Orion (après addOrion)
import {MASTERY,MAST_COST,mastPts,nextPtLvl,hasMastery,rankOf,mastLeft,mastSpent,canRaise,raise,resetMast,cleanMast,mastered,mastTxt} from '../src/mastery.js';
const ORION_SP = ['arcane', 'flame', 'frost', 'fireball', 'icewall', 'blink', 'weaken', 'nova', 'glyph', 'storm'];
test('maîtrise (V4.45) : Orion entier, Kael/Fenn/Aelis sauf les sorts utilitaires en attente de ChatGPT', () => {
  for (const id of ORION_SP) assert.ok(MASTERY[id], id);
  assert.deepEqual([0, 1, 2, 3].map(hasMastery), [true, true, true, true]);
  for (const id of ['guard','taunt','counter','rage','boots','dodge','trap','aura','cleanse','revive']) assert.equal(MASTERY[id], undefined, id);
  for (const id in MASTERY) assert.ok(SP[id], id);
  const h = mastered(SP.heal, 'heal', 3); assert.equal(h.hk, 1.1); assert.equal(mastered(SP.mheal, 'mheal', 2).hk, 1.03);
  assert.deepEqual(mastered(SP.ward, 'ward', 3).ward, [.25 * 1.2, 2]); assert.equal(mastTxt('ward', 2), '+10 % bouclier'); assert.equal(mastTxt('heal', 3), '+10 % soins');
});
test('maîtrise : points (1 tous les 2 niveaux, 24 au niveau 50), coûts 2 puis 3', () => {
  assert.deepEqual([1, 2, 3, 20, 21, 49, 50].map(mastPts), [0, 0, 1, 9, 10, 24, 24]);
  assert.deepEqual([20, 21, 49].map(nextPtLvl), [21, 23, 51]);
  assert.deepEqual(MAST_COST, [0, 0, 2, 5]);
  assert.ok(mastPts(50) < ORION_SP.length * MAST_COST[3], 'impossible de tout maîtriser');
});
test('maîtrise : les 10 sorts aux 3 rangs (bonus par rapport au rang I, sans cumul)', () => {
  const v = id => [1, 2, 3].map(r => mastered({ ...SP[id] }, id, r));
  for (const id of ['arcane', 'flame', 'frost', 'fireball', 'nova', 'glyph', 'storm']) {
    assert.deepEqual(v(id).map(s => s.k || 1), [1, 1.05, 1.1], id);
    assert.deepEqual(v(id).map(s => [s.pa, s.cd, s.r, s.zone, s.side, s.burn]), v(id).map(() => [SP[id].pa, SP[id].cd, SP[id].r, SP[id].zone, SP[id].side, SP[id].burn]), id + ' : coût, recharge, portée, zone inchangés');
  }
  assert.deepEqual(v('icewall').map(s => +s.wall.hp.toFixed(3)), [.4, .46, .52]);
  assert.deepEqual(v('blink').map(s => s.r), [[1, 3], [1, 4], [1, 5]]);
  assert.ok(v('blink').every(s => s.free && s.los && s.lob && s.pa === 3 && s.cd === 3), 'restrictions de la téléportation gardées');
  assert.deepEqual(v('weaken').map(s => s.weaken), [[.2, 2], [.22, 2], [.24, 2]]);
  assert.match(v('weaken')[2].d, /24 %/);
  assert.equal(SP.weaken.weaken[0], .2, 'sort de base non modifié');
  for (const r of [0, 4, '3', null]) assert.equal(mastered(SP.arcane, 'arcane', r), SP.arcane, 'rang invalide = rang I');
  assert.equal(mastered(SP.guard, 'guard', 3), SP.guard, 'Rempart : en attente');
  assert.deepEqual(['arcane', 'flame', 'icewall', 'blink', 'weaken'].map(id => mastTxt(id, 3)), ['+10 % dégâts', '+10 % dégâts directs', '+30 % PV du mur', '+2 cases de portée', 'réduction 24 % au lieu de 20 %']);
});
test('maîtrise et les 15 talents : additifs, jamais appliqués deux fois', () => {
  for (const voie of ['pyro', 'cryo', 'arcaniste']) {
    const tal = orion(40, voie);
    for (const id of ORION_SP) {
      const t = { ...SP[id], ...tal[id] }, m = mastered(t, id, 3), M = MASTERY[id];
      if (M[0] === 'dmg') assert.equal(+m.k.toFixed(3), +((t.k || 1) + .1).toFixed(3), `${voie} ${id}`);
      if (M[0] === 'wall') assert.equal(+m.wall.hp.toFixed(3), +(t.wall.hp + .12).toFixed(3));
      if (M[0] === 'range') assert.deepEqual(m.r, [1, t.r[1] + 2]);
      if (M[0] === 'weak') assert.deepEqual(m.weaken, [.24, t.weaken[1]]);
      for (const k of ['pa', 'cd', 'burn', 'slow', 'side', 'zone', 'free', 'los']) assert.deepEqual(m[k], t[k], `${voie} ${id} ${k}`);
    }
  }
  assert.equal(+mastered({ ...SP.frost, ...orion(40, 'cryo').frost }, 'frost', 3).k.toFixed(3), 1.2, 'Givre mordant + rang III = +20 %, pas +21 %');
  assert.equal(+mastered({ ...SP.icewall, ...orion(40, 'cryo').icewall }, 'icewall', 3).wall.hp.toFixed(3), .6);
  assert.deepEqual(mastered({ ...SP.blink, ...orion(40, 'arcaniste').blink }, 'blink', 3).r, [1, 6]);
  assert.deepEqual(mastered({ ...SP.flame, ...orion(40, 'pyro').flame }, 'flame', 3).burn, [4, 3], 'brûlure non touchée');
});
test('maîtrise : achat, budget, sorts pas encore appris, remise à zéro', () => {
  const s = { lvl: 21, items: [], up: {} };
  assert.equal(mastLeft(s, 3), 10);
  assert.equal(raise(s, 0, 'guard'), 0, 'Rempart : pas de maîtrise (en attente)');
  assert.equal(raise(s, 3, 'glyph'), 0, 'Glyphe appris au niveau 35');
  assert.equal(raise(s, 3, 'storm'), 0);
  assert.equal(raise(s, 3, 'arcane'), 1); assert.equal(raise(s, 3, 'arcane'), 1); assert.equal(raise(s, 3, 'arcane'), 0, 'rang III maximum');
  assert.deepEqual([rankOf(s, 3, 'arcane'), mastSpent(s, 3), mastLeft(s, 3)], [3, 5, 5]);
  assert.equal(raise(s, 3, 'flame'), 1); assert.equal(raise(s, 3, 'flame'), 1);
  assert.equal(mastLeft(s, 3), 0); assert.equal(canRaise(s, 3, 'frost'), false);
  assert.equal(heroStats(s, 3).mast.arcane, 3);
  resetMast(s, 3); assert.equal(mastLeft(s, 3), 10); assert.equal(rankOf(s, 3, 'arcane'), 1);
  const t = { lvl: 50, items: [], up: {} };
  for (const id of ORION_SP) { raise(t, 3, id); raise(t, 3, id) }
  assert.equal(mastSpent(t, 3), 24); assert.ok(ORION_SP.some(id => rankOf(t, 3, id) < 3), 'pas tout au rang III');
});
test('maîtrise : sauvegardes anciennes, abîmées, idempotence', () => {
  for (const ms of [undefined, null, 'x', [], {}, { 3: null }, { 3: 'a' }]) {
    const s = { lvl: 30, items: [], ms }; cleanMast(s); assert.equal(s.ms, undefined, JSON.stringify(ms));
  }
  const s = { lvl: 21, items: [], ms: { 3: { arcane: 3, flame: 4, glyph: 2, slash: 2, nope: 3, frost: '2', fireball: 2 }, 7: { x: 1 } } };
  cleanMast(s); assert.deepEqual(s.ms, { 3: { arcane: 3, fireball: 2 }, 7: { x: 1 } }, 'héros absent laissé tel quel');
  const avant = JSON.stringify(s); cleanMast(s); assert.equal(JSON.stringify(s), avant, 'deux fois = pareil');
  const trop = { lvl: 5, items: [], ms: { 3: { arcane: 3 } } }; cleanMast(trop); assert.equal(trop.ms, undefined, 'budget dépassé : points rendus');
  const vrai = { lvl: 30, items: [], sp: [null, null, null] }, v = JSON.stringify(vrai); cleanMast(vrai); assert.equal(JSON.stringify(vrai), v, 'sauvegarde sans maîtrise inchangée');
});
test('maîtrise en combat : appliquée une fois, aperçu = effet, armure et insensibilité gardées', () => {
  const st = { lvl: 50, items: [], up: {}, team: [0, 3, 1], sp: [null, null, null, 'cryo'], load: { 3: ['arcane', 'frost', 'icewall', 'blink', 'weaken', 'flame'] }, ms: { 3: { frost: 3, icewall: 3, blink: 3, weaken: 3, flame: 2 } } };
  const s = newBattle(); s.pot = 0;
  const F = fightSpec(0, 0, 7), { hs, es } = genMap(s, F.seed, F.th, F.cry);
  mkUnits(s, F, hs, es, HER.map((_, i) => heroStats(st, i)), teamOf(st));
  const o = s.units.find(u => u.k === 'mage');
  assert.deepEqual([+o.S.frost.k.toFixed(3), +o.S.icewall.wall.hp.toFixed(3), o.S.blink.r, o.S.weaken.weaken, +o.S.flame.k.toFixed(3), o.S.arcane.k], [1.2, .6, [1, 5], [.24, 2], 1.05, undefined]);
  const k = s.units.find(u => u.k === 'warrior');
  assert.deepEqual(Object.keys(k.S).map(id => k.S[id].k), Object.keys(k.S).map(id => SP[id].k), 'Kael inchangé');
  const { s: a, o: m } = terrain(['frost']), cible = foe(a, 4, 5, { armor: .3, boss: 1 });
  const sp = mastered(SP.frost, 'frost', 3), f = forecast(a, m, sp, cible), b = forecast(a, m, SP.frost, cible);
  const nu = foe(a, 4, 6); assert.ok(f.dmg[1] >= b.dmg[1] && f.dmg[1] < forecast(a, m, sp, nu).dmg[1], 'armure du boss toujours appliquée');
  assert.deepEqual(forecast(a, m, sp, nu).dmg, [Math.round(8 * 1.1), Math.round(11 * 1.1)]);
  a.rng = () => .5; applySpell(a, m, sp, cible); assert.ok(200 - cible.hp >= f.dmg[0] && 200 - cible.hp <= f.dmg[1]);
  const { s: c, o: p } = terrain(['flame']), feu = foe(c, 4, 5, { k: 'fireel' });
  applySpell(c, p, mastered(SP.flame, 'flame', 3), feu); assert.equal(feu.burn, undefined, 'insensible au feu');
  const w = foe(c, 6, 5); applySpell(c, p, mastered(SP.weaken, 'weaken', 3), w); assert.deepEqual(w.weak, { pct: .24, turns: 2 });
  const g = mastered(SP.glyph, 'glyph', 3); applySpell(c, p, g, { x: 3, y: 7 }); assert.equal(p.trap.glyph.sp.k, 1.1, 'le glyphe garde son rang');
});
test('maîtrise : la téléportation garde ligne de vue et case libre', () => {
  const { s, o } = terrain(['blink']), sp = mastered(SP.blink, 'blink', 3);
  foe(s, 7, 5);
  assert.ok(!okTarget(s, o, sp, { x: 7, y: 5 }), 'case occupée');
  assert.ok(okTarget(s, o, sp, { x: 2, y: 10 }), '5 cases');
  assert.ok(!okTarget(s, o, sp, { x: 2, y: 11 }), '6 cases : trop loin');
  cell(s, 2, 7).block = 1;
  assert.ok(!okTarget(s, o, sp, { x: 2, y: 9 }), 'décor haut : pas de ligne de vue');
});

test('V4.40 : Orion recruté au niveau 20 seulement', async () => {
  const { roster, teamOf, swapTeam } = await import('../src/rules.js');
  const s = { lvl: 19, items: [], team: [0, 1, 3] };
  assert.deepEqual(roster(s), [0, 1, 2]);
  assert.deepEqual(teamOf(s), [0, 1, 2]);
  assert.equal(swapTeam(s, 2, 3), 0);
  s.lvl = 20;
  assert.deepEqual(roster(s), [0, 1, 2, 3]);
  assert.deepEqual(teamOf(s), [0, 1, 3]);
});

test('V4.41 : Fenn a 10 sorts, appris par niveau, 6 places dont celle du Piège', async () => {
  const { knownSpells, loadoutOf, slotsOf } = await import('../src/rules.js');
  const base = lvl => ({ lvl, items: [], up: {}, sp: [null, null, null, null] });
  assert.deepEqual(knownSpells(base(4), 1), ['shot', 'volley', 'boots']);
  assert.deepEqual(loadoutOf(base(9), 1), ['shot', 'volley', 'boots', 'pshot']);
  assert.equal(knownSpells(base(35), 1).length, 9, 'le 10e est le Piège (talent)');
  assert.equal(loadoutOf(base(35), 1).length, 6);
  for (const id of knownSpells(base(35), 1)) assert.ok(SP[id]);
  const t = { ...base(35), sp: [null, 'chasseur', null, null] };
  assert.equal(slotsOf(t, 1), 5);
  const st = heroStats(t, 1);
  assert.equal(st.spells.length + st.tal.add.length, 6);
});

test('V4.42 : région 8 après R7, pièges (12 % et −1 PM, monstres épargnés), malédiction (soins −50 %), Pharaon',async()=>{
 const r=await import('../src/rules.js'),{ZONES,R8,MON,HER,THEMES,DEC,CURSE_K}=await import('../src/data.js');
 assert.equal(ZONES[7],R8);assert.equal(R8.fights.length,10);assert.equal(THEMES[R8.th[0]].ts,'sol_sables');assert.deepEqual(DEC(43),['deco5',7]);
 for(const f of R8.fights){assert.ok(f.lava.trap&&f.lava.n>0);for(const k of f.en)assert.ok(MON[k])}
 const F=r.fightSpec(7,1,1),s=r.newBattle(r.mulberry(5)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:26,items:[],up:{},sp:[null,null,null]},i)));
 const h=s.units.find(u=>u.team==='h'),m=s.units.find(u=>u.team==='m'),hp=h.hp,mhp=m.hp;
 s.lava.next=[{x:h.x,y:h.y},{x:m.x,y:m.y}];r.lavaTick(s);
 assert.equal(h.hp,hp-Math.round(h.max*.12));assert.equal(h.slow,1);assert.equal(m.hp,mhp,'le gardien ne déclenche pas le piège');
 const mu=s.units.find(u=>u.k==='mummy');assert.ok(mu.atk.curse);
 h.hp=1;h.curse=2;const healer=s.units.find(u=>u.team==='h'&&u.S&&Object.values(u.S).some(sp=>sp.heal&&sp.t!=='enemy'));
 if(healer){const id=Object.keys(healer.S).find(k=>healer.S[k].heal&&healer.S[k].t!=='enemy'),sp=healer.S[id],fc=r.forecast(s,healer,sp,h);if(fc&&fc.heal){h.curse=0;const fn=r.forecast(s,healer,sp,h);assert.ok(fc.heal[1]<=Math.round(fn.heal[1]*CURSE_K)+1)}}
 h.curse=2;r.beginTurn(h);assert.equal(h.curse,1);
 const B={...m,bs:'tomb',hp:10,max:100,team:'m'};h.curse=0;r.bossTurn(s,B);assert.equal(B.raged,1);assert.equal(h.curse,2);assert.equal(s.lava.hot,1);
});
test('V4.66 : Reine des marécages : spores toxiques sous la moitié des PV, clones fragiles',async()=>{
 const {R9,MON}=await import('../src/data.js'),r=await import('../src/rules.js');
 assert.ok(MON.queenling&&MON[R9.boss.summon.k]===MON.queenling&&MON.queenling.s==='queen');
 const {HER}=await import('../src/data.js'),F=r.fightSpec(8,9,1),s=r.newBattle(r.mulberry(5)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:35,items:[],up:{},sp:[null,null,null]},i)));
 {const B=s.units.find(u=>u.boss);assert.ok(B&&B.bs==='swamp'&&B.s==='queen');const h=s.units.find(u=>u.team==='h'&&!u.dead);
  B.hp=B.max;assert.deepEqual(r.bossTurn(s,B),[]);assert.ok(!B.raged);
  B.hp=Math.floor(B.max/2);const ev=r.bossTurn(s,B);assert.equal(B.raged,1);assert.equal(B.dmgMul,1.2);assert.ok(h.poison&&h.poison.turns===2);assert.ok(ev.length>=2);
  assert.deepEqual(r.bossTurn(s,B),[],'une seule fois');
  const sp=r.summon(s,B);assert.equal(sp.length,2);assert.ok(sp.every(c=>c.minion&&c.hp===14&&c.s==='queen'))}
});
test('V4.67 : région 10 (Citadelle céleste) : 10 missions, thème, boss Aetherion, quêtes Q28–Q30',async()=>{
 const {ZONES,R9,R10,MON,THEMES,DEC,LOW,DECO_W,zlen,MAP2,HER}=await import('../src/data.js'),r=await import('../src/rules.js'),{QUESTS}=await import('../src/quests.js');
 const at=JSON.parse((await import('node:fs')).readFileSync(new URL('../assets/atlas.json',import.meta.url)));
 assert.equal(ZONES[9],R10);assert.equal(zlen(R10),10);assert.equal(R10.th[0],10);assert.ok(MAP2.some(m=>m.n===R10.n));
 for(const n of['cguard','griffin','astral','aetherion'])assert.equal(at[n].length,6,n);assert.equal(at.deco7.length,8);assert.equal(at.sol_celeste.length,8);
 assert.equal(THEMES[10].ts,'sol_celeste');assert.ok(THEMES[10].g.every(i=>at.sol_celeste[i]));assert.deepEqual(DEC(52),['deco7',0]);assert.deepEqual(DEC(59),['deco7',7]);assert.deepEqual(DEC(51),['deco6',7]);
 assert.ok(THEMES[10].obs.every(o=>at[DEC(o)[0]][DEC(o)[1]]&&DECO_W[o]>0));assert.ok(LOW.has(52)&&!LOW.has(59));
 for(const f of R10.fights){assert.ok(f.lvl>=36&&f.lvl<=40);for(const k of f.en)assert.ok(MON[k],k)}
 assert.equal(R10.boss.s,'aetherion');assert.ok(at.aetherion);assert.equal(MON[R10.boss.summon.k].s,'aetherion');
 const F=r.fightSpec(9,9,1),s=r.newBattle(r.mulberry(5)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:40,items:[],up:{},sp:[null,null,null]},i)));
 const B=s.units.find(u=>u.boss);assert.ok(B&&B.bs==='astral'&&B.s==='aetherion');B.hp=B.max;assert.deepEqual(r.bossTurn(s,B),[]);B.hp=Math.floor(B.max/2);const pm=B.maxPM;r.bossTurn(s,B);assert.equal(B.raged,1);assert.equal(B.dmgMul,1.2);assert.equal(B.maxPM,pm+1);assert.deepEqual(r.bossTurn(s,B),[]);
 const sp=r.summon(s,B);assert.equal(sp.length,2);assert.ok(sp.every(c=>c.minion&&c.hp===16));
 const q=id=>QUESTS.find(x=>x.id===id);for(const id of['Q28','Q29','Q30'])assert.equal(q(id).z,9);assert.equal(r.questOpen({z:{[R9.id]:10}},q('Q28')),true);assert.equal(r.questOpen({z:{}},q('Q28')),false);
 assert.equal(r.questFight(q('Q30'),{}).elite,'astral');
});
test('V4.68 : région 11 (Terres du Givre) : 10 missions, boss Roi du Givre (gel), quêtes Q31–Q35',async()=>{
 const {ZONES,R10,R11,MON,THEMES,DEC,zlen,MAP2,HER}=await import('../src/data.js'),r=await import('../src/rules.js'),{QUESTS}=await import('../src/quests.js');
 const at=JSON.parse((await import('node:fs')).readFileSync(new URL('../assets/atlas.json',import.meta.url)));
 assert.equal(ZONES[10],R11);assert.equal(zlen(R11),10);assert.equal(R11.th[0],11);assert.ok(MAP2.some(m=>m.n===R11.n));
 for(const n of['polarwolf','yeti','frostel','frostking'])assert.equal(at[n].length,6,n);assert.equal(at.deco8.length,8);assert.deepEqual(DEC(60),['deco8',0]);assert.deepEqual(DEC(59),['deco7',7]);
 assert.ok(THEMES[11].g.every(i=>at[THEMES[11].ts][i]));assert.ok(THEMES[11].obs.every(o=>at[DEC(o)[0]][DEC(o)[1]]));
 for(const f of R11.fights){assert.ok(f.lvl>=41&&f.lvl<=45);for(const k of f.en)assert.ok(MON[k],k)}
 assert.equal(R11.boss.s,'frostking');assert.equal(MON[R11.boss.summon.k].s,'frostking');
 const F=r.fightSpec(10,9,1),s=r.newBattle(r.mulberry(5)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:45,items:[],up:{},sp:[null,null,null]},i)));
 const B=s.units.find(u=>u.boss),h=s.units.find(u=>u.team==='h'&&!u.dead);assert.ok(B&&B.bs==='frost'&&B.s==='frostking');B.hp=B.max;assert.deepEqual(r.bossTurn(s,B),[]);assert.ok(!h.slow);
 B.hp=Math.floor(B.max/2);r.bossTurn(s,B);assert.equal(B.raged,1);assert.equal(B.dmgMul,1.2);assert.equal(h.slow,1);B.bt=0;assert.deepEqual(r.bossTurn(s,B),[]); // V4.76 : le bouclier de glace revient tous les 3 tours (testé à part)
 const sp=r.summon(s,B);assert.equal(sp.length,2);assert.ok(sp.every(c=>c.minion&&c.hp===18));
 const q=id=>QUESTS.find(x=>x.id===id);for(const id of['Q31','Q32','Q33','Q34','Q35'])assert.equal(q(id).z,10);assert.equal(r.questOpen({z:{[R10.id]:10}},q('Q31')),true);assert.equal(r.questOpen({z:{}},q('Q31')),false);
 assert.equal(r.questFight(q('Q33'),{}).elite,'frostel');
});
test('V4.73 : région 12 (Sanctuaire de l’Éther) : 10 missions niveaux 46 à 50, boss Briseur primordial (fracas)',async()=>{
 const {ZONES,R11,R12,MON,THEMES,DEC,LOW,DECO_W,zlen,MAP2,HER}=await import('../src/data.js'),r=await import('../src/rules.js');
 const at=JSON.parse((await import('node:fs')).readFileSync(new URL('../assets/atlas.json',import.meta.url)));
 assert.equal(ZONES[11],R12);assert.equal(zlen(R12),10);assert.equal(R12.th[0],12);assert.ok(MAP2.some(m=>m.n===R12.n));
 for(const n of['etherbeast','etherknight','sanctguard','breaker'])assert.equal(at[n].length,6,n);assert.equal(at.sol_eter.length,8);assert.equal(at.deco9.length,9);
 assert.deepEqual(DEC(68),['deco9',0]);assert.deepEqual(DEC(76),['deco9',8]);assert.deepEqual(DEC(67),['deco8',7]);
 assert.ok(THEMES[12].g.every(i=>at.sol_eter[i]));assert.ok(THEMES[12].obs.every(o=>at[DEC(o)[0]][DEC(o)[1]]&&DECO_W[o]>0));assert.ok(LOW.has(73)&&!LOW.has(76));
 for(const f of R12.fights){assert.ok(f.lvl>=46&&f.lvl<=50);for(const k of f.en)assert.ok(MON[k],k)}
 assert.equal(R12.boss.s,'breaker');assert.equal(MON[R12.boss.summon.k].s,'etherbeast');
 const F=r.fightSpec(11,9,1),s=r.newBattle(r.mulberry(5)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:50,items:[],up:{},sp:[null,null,null]},i)));
 const B=s.units.find(u=>u.boss),h=s.units.find(u=>u.team==='h'&&!u.dead);assert.ok(B&&B.bs==='breaker'&&B.s==='breaker');B.hp=B.max;assert.deepEqual(r.bossTurn(s,B),[]);assert.ok(!h.sunder);
 B.hp=Math.floor(B.max/2);r.bossTurn(s,B);assert.equal(B.raged,1);assert.equal(B.dmgMul,1.25);assert.equal(h.sunder.pct,.15);assert.equal(h.sunder.turns,2);assert.deepEqual(r.bossTurn(s,B),[]);
 const sp=r.summon(s,B);assert.equal(sp.length,2);assert.ok(sp.every(c=>c.minion&&c.hp===20));
 // V4.78 : fenêtre de vulnérabilité tous les 4 tours : le Briseur subit +30 % et ne bouge pas
 B.bt=2;assert.ok(!r.bossTurn(s,B).some(e=>e.text&&e.text.startsWith('Défense brisée')));B.bt=3;B.sunder=undefined;const evw=r.bossTurn(s,B);assert.ok(evw.some(e=>e.text==='Défense brisée ! +30 %'));assert.equal(B.sunder.pct,.3);assert.equal(B.pm,0);assert.ok(r.soak(B,100)>r.soak({...B,sunder:undefined},100));
 const{QUESTS}=await import('../src/quests.js'),q36=QUESTS.find(x=>x.id==='Q36');assert.equal(q36.z,11);assert.equal(r.questOpen({z:{[R11.id]:10}},q36),true);assert.equal(r.questOpen({z:{}},q36),false);
 const qf=r.questFight(q36,{});assert.equal(qf.goal,'survive');assert.equal(qf.lvl,47);assert.equal(qf.zi,11);
});
test('V4.75 : quêtes Q37 à Q40, objets signature uniquement en récompense',async()=>{
 const {ITEMS,HER,ZONES,zlen}=await import('../src/data.js'),r=await import('../src/rules.js'),{QUESTS}=await import('../src/quests.js'),q=id=>QUESTS.find(x=>x.id===id);
 const sig=ITEMS.map((o,j)=>o.src==='quest'?j:-1).filter(j=>j>=0);assert.deepEqual(sig,[79,80,81,82,83,84,85,119]);
 assert.deepEqual(QUESTS.filter(x=>x.sig).flatMap(x=>x.sig).sort((a,b)=>a-b),sig);
 for(const j of sig){assert.equal(ITEMS[j].rr,2);assert.ok(ITEMS[j].lv>=1)}
 const full=lvl=>({lvl,items:[],z:Object.fromEntries(ZONES.map(z=>[z.id,zlen(z)]))});
 assert.deepEqual(r.lootPool(full(60)).filter(j=>sig.includes(j)),[]);for(let d=0;d<30;d++)assert.deepEqual(r.shopStock(full(60),d).filter(j=>sig.includes(j)),[]);
 assert.equal(r.questOpen({lvl:60,z:{}},q('Q37')),false);assert.equal(r.questOpen({lvl:60,z:{[ZONES[4].id]:zlen(ZONES[4])}},q('Q37')),true);
 assert.equal(r.questFight(q('Q37'),{}).elite,'knightN');assert.equal(r.questFight(q('Q38'),{}).elite,'wraith');assert.equal(r.questFight(q('Q39'),{}).goal,'chief');
 const s40={lvl:60,z:Object.fromEntries(ZONES.slice(0,11).map(z=>[z.id,zlen(z)]))};assert.equal(r.questOpen(s40,q('Q40')),false);s40.z[ZONES[11].id]=zlen(ZONES[11]);assert.equal(r.questOpen(s40,q('Q40')),true);
 assert.equal(r.questFight(q('Q40'),{}).goal,'survive');assert.equal(r.questFight(q('Q40'),{}).lvl,ZONES[11].lvl+4);
});
test('V4.76 : mécaniques de boss : téléportation d’Aetherion, zones toxiques de la Reine, bouclier et fissures du Roi du Givre',async()=>{
 const {HER,ZONES}=await import('../src/data.js'),r=await import('../src/rules.js');
 const mk=(zi,i)=>{const F=r.fightSpec(zi,i,1),s=r.newBattle(r.mulberry(7)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,k)=>r.heroStats({lvl:50,items:[],up:{},sp:[null,null,null]},k)));return s};
 const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 // Aetherion (R10, indice 9) : tous les 3 tours il saute à côté du héros le plus blessé ; après sa phase, tous les 2 tours
 {const s=mk(9,9),B=s.units.find(u=>u.boss),hs=s.units.filter(u=>u.team==='h'&&!u.dead);assert.equal(B.bs,'astral');hs[1].hp=Math.floor(hs[1].max*.3);
  B.bt=2;const ev=r.bossTurn(s,B);assert.ok(ev.some(e=>e.text==='Téléportation !'));assert.equal(man(B,hs[1]),1);assert.equal(B.gx,B.x);
  B.bt=0;assert.ok(!r.bossTurn(s,B).some(e=>e.text==='Téléportation !'));
  B.hp=Math.floor(B.max/2);B.bt=0;r.bossTurn(s,B);assert.equal(B.raged,1);B.bt=1;assert.ok(r.bossTurn(s,B).some(e=>e.text==='Téléportation !'),'tous les 2 tours après la phase');assert.equal(r.bossNext(B)>0,true);}
 // Reine des marécages (R9, indice 9) : sous 50 % PV, 3 zones toxiques marquées un tour avant ; un héros dessus est empoisonné au tick
 {const s=mk(8,9),B=s.units.find(u=>u.boss),h=s.units.find(u=>u.team==='h'&&!u.dead);assert.equal(B.bs,'swamp');assert.equal(s.lava,null);
  B.hp=Math.floor(B.max/2);r.bossTurn(s,B);assert.ok(s.lava&&s.lava.toxic&&s.lava.next.length>=1&&s.lava.next.length<=3);
  const p=s.lava.next[0];for(const u of s.units.filter(u=>u.team==='h'))delete u.poison;const old={x:h.x,y:h.y};h.x=h.gx=p.x;h.y=h.gy=p.y;const hp0=h.hp;
  const ev=r.lavaTick(s);assert.deepEqual(h.poison,{d:4,turns:2});assert.equal(h.hp,hp0);assert.ok(ev.some(e=>e.text==='Empoisonné'));assert.ok(s.lava.next.length>=1,'une nouvelle vague est marquée (hot)');}
 // Roi du Givre (R11, indice 9) : bouclier de glace tous les 3 tours ; sous 50 % PV, fissures : −6 % PV et −1 PM
 {const s=mk(10,9),B=s.units.find(u=>u.boss),h=s.units.find(u=>u.team==='h'&&!u.dead);assert.equal(B.bs,'frost');
  B.bt=2;assert.ok(r.bossTurn(s,B).some(e=>e.text==='Bouclier de glace'));assert.equal(B.shield,1);
  B.hp=Math.floor(B.max/2);B.bt=0;r.bossTurn(s,B);assert.ok(s.lava&&s.lava.cold);
  const p=s.lava.next[0];h.x=h.gx=p.x;h.y=h.gy=p.y;delete h.slow;const hp0=h.hp;r.lavaTick(s);assert.equal(h.slow,1);assert.ok(h.hp<hp0&&h.hp>=hp0-Math.ceil(h.max*.07)-1);}
});
test('V4.77 : récompenses de Q37 à Q40 : attribuées, persistantes après sauvegarde, jamais en double',async()=>{
 const r=await import('../src/rules.js'),{QUESTS}=await import('../src/quests.js'),{ITEMS}=await import('../src/data.js');
 const save={lvl:60,items:[],q:{}},rng=()=>.5;
 for(const id of['Q37','Q38','Q39','Q40']){const Q=QUESTS.find(x=>x.id===id);assert.equal(r.questDone(save,Q),false);
  const before=save.items.length,got=r.grantQuest(save,Q,rng);save.q[id]=1;assert.deepEqual(got,Q.sig,id);assert.equal(save.items.length,before+Q.sig.length);for(const j of Q.sig)assert.ok(save.items.includes(j));
  assert.deepEqual(r.grantQuest(save,Q,rng),[],id+' : pas de doublon même si on rappelle');assert.equal(save.items.length,before+Q.sig.length)}
 assert.equal(new Set(save.items).size,save.items.length);assert.equal(save.items.length,8);
 const back=JSON.parse(JSON.stringify(save));assert.deepEqual(back.items.slice().sort((a,b)=>a-b),[79,80,81,82,83,84,85,119]);assert.ok(['Q37','Q38','Q39','Q40'].every(id=>back.q[id]===1));
 assert.equal(r.rarOf(back,79),2);
 // une quête à objet de butin (r:1) donne un seul objet normal, aucun objet signature
 const s2={lvl:60,items:[],q:{}},g2=r.grantQuest(s2,QUESTS.find(x=>x.id==='Q36'),rng);assert.equal(g2.length,1);assert.notEqual(ITEMS[g2[0]].src,'quest');
});
test('V4.42 : chaque obstacle de thème a une largeur et une image',async()=>{
 const {THEMES,DECO_W,DEC}=await import('../src/data.js'),A=JSON.parse((await import('node:fs')).readFileSync(new URL('../assets/atlas.json',import.meta.url)));
 for(const t of THEMES)for(const d of[...t.obs,...(t.out||[])]){assert.ok(DECO_W[d]>0,'largeur '+d);const[s,i]=DEC(d);assert.ok(A[s]&&A[s][i],'image '+d)}
});

test('V4.43 : Kael à 10 sorts (tourbillon, brise-armure, provocation, contre-attaque, rage, jugement)',async()=>{
 const r=await import('../src/rules.js'),{HER,SP}=await import('../src/data.js');
 assert.equal(HER[0].sp.length+HER[0].learn.length,10);for(const[id]of HER[0].learn)assert.ok(SP[id],id);
 assert.equal(r.knownSpells({lvl:26},0).length,8);assert.equal(r.loadoutOf({lvl:50},0).length,6);
 const F=r.fightSpec(7,0,1),s=r.newBattle(r.mulberry(9)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:30,items:[],up:{},sp:[null,null,null]},i)));
 const k=s.units.find(u=>u.id==='h0'),m=s.units.find(u=>u.team==='m');m.x=m.gx=k.x+1;m.y=m.gy=k.y;if(!r.occ(s,m.x,m.y)||r.occ(s,m.x,m.y)!==m)return;
 // brise-armure : +25 % de dégâts subis
 const a=r.soak(m,100);r.applySpell(s,k,SP.sunder,m);assert.equal(m.sunder.pct,.25);assert.equal(r.soak(m,100),Math.round(a*1.25)||r.soak(m,100));
 r.endTurn(m);r.endTurn(m);assert.ok(!m.sunder);
 // provocation : le monstre ne vise que Kael
 r.applySpell(s,k,SP.taunt,k);assert.equal(m.taunt,k.id);const st=r.aiStep(s,m);if(st&&st.type==='cast')assert.equal(st.target,k);r.endTurn(m);assert.ok(!m.taunt);
 // contre-attaque : riposte au contact
 r.applySpell(s,k,SP.counter,k);assert.ok(k.counter);const mh=m.hp;r.applySpell(s,m,m.atk,k);if(!k.dead)assert.ok(m.hp<mh);r.beginTurn(k);assert.ok(!k.counter);
});

test('V4.44 : Aelis à 10 sorts (bouclier, purification, racines, rayon lunaire, bénédiction)',async()=>{
 const r=await import('../src/rules.js'),{HER,SP}=await import('../src/data.js');
 assert.equal(HER[2].sp.length+HER[2].learn.length,9,'+ Renaissance par talent = 10');for(const[id]of HER[2].learn)assert.ok(SP[id],id);
 const F=r.fightSpec(7,0,1),s=r.newBattle(r.mulberry(11)),{hs,es}=r.genMap(s,F.seed,F.th);r.mkUnits(s,F,hs,es,HER.map((_,i)=>r.heroStats({lvl:35,items:[],up:{},sp:[null,null,null]},i)));
 const a=s.units.find(u=>u.id==='h2'),k=s.units.find(u=>u.id==='h0'),m=s.units.find(u=>u.team==='m');
 // bouclier : absorbe avant les PV
 r.applySpell(s,a,SP.ward,k);const w=k.ward.hp,hp=k.hp;assert.equal(w,Math.round(k.max*.25));r.hurt(s,k,w-1,'test');assert.equal(k.hp,hp);r.hurt(s,k,50,'test');assert.ok(!k.ward&&k.hp<hp);
 // purification
 k.poison={d:4,turns:2};k.curse=2;k.slow=1;r.applySpell(s,a,SP.cleanse,k);assert.ok(!k.poison&&!k.curse&&!k.slow);
 // racines : 1 PM
 r.applySpell(s,a,SP.roots,m);if(!m.dead&&!m.boss){m.maxPM=5;r.beginTurn(m);assert.equal(m.pm,1)}
 // rayon lunaire : soigne le héros le plus blessé
 k.hp=Math.round(k.max/2);const kh=k.hp;r.applySpell(s,a,SP.moon,m);assert.ok(k.hp>kh||m.dead);
 // bénédiction : tous les héros
 for(const h of s.units)if(h.team==='h'){h.hp=10;h.poison={d:3,turns:2}}r.applySpell(s,a,SP.bless,a);for(const h of s.units)if(h.team==='h')assert.ok(h.hp>10&&!h.poison);
});

// V4.46 : talents de Kael aux paliers 25 et 40
const kael = (lvl, voie) => heroStats({ lvl, items: [], up: {}, sp: [voie, null, null] }, 0).tal.sp;
test('talents de Kael V4.46 : paliers 25 et 40, une seule voie', () => {
  assert.equal(kael(24, 'berserk').rage, undefined);
  assert.equal(kael(25, 'berserk').rage.buffT, 3);
  assert.equal(kael(25, 'berserk').judge, undefined);
  assert.equal(kael(40, 'berserk').judge.k, 1.25);
  assert.equal(kael(40, 'berserk').judge.pierce, 1);
  assert.equal(kael(25, 'gardien').taunt.taunt, 5);
  assert.equal(kael(40, 'gardien').counter.counter, 1);
  assert.equal(kael(25, 'briseur').whirl.push, 1);
  assert.equal(kael(40, 'briseur').judge.push, 3);
  assert.equal(kael(40, 'gardien').judge, undefined, 'pas de cumul entre voies');
  assert.equal(SPECS[0].every(x => x.t.length === 5), true);
});

// V4.47 : talents de Fenn aux paliers 25 et 40
const fenn = (lvl, voie) => heroStats({ lvl, items: [], up: {}, sp: [null, voie, null] }, 1).tal.sp;
test('talents de Fenn V4.47 : paliers 25 et 40, une seule voie', () => {
  assert.equal(fenn(24, 'tireur').blastarrow, undefined);
  assert.equal(fenn(25, 'tireur').blastarrow.side, .8);
  assert.equal(fenn(40, 'tireur').rain.k, 1.2);
  assert.equal(fenn(25, 'chasseur').venomarrow.poison[1], 3);
  assert.equal(fenn(40, 'chasseur').rain.slow, 1);
  assert.equal(fenn(25, 'eclaireur').dodge.cd, 2);
  assert.equal(fenn(40, 'eclaireur').dodge.r[1], 5);
  assert.equal(fenn(40, 'tireur').venomarrow, undefined, 'pas de cumul entre voies');
  assert.equal(SPECS[1].every(x => x.t.length === 5), true);
});

// V4.48 : talents d'Aelis aux paliers 25 et 40
const aelis = (lvl, voie) => heroStats({ lvl, items: [], up: {}, sp: [null, null, voie] }, 2).tal.sp;
test('talents d’Aelis V4.48 : paliers 25 et 40, une seule voie', () => {
  assert.equal(aelis(24, 'guerisseuse').ward, undefined);
  assert.equal(aelis(25, 'guerisseuse').ward.ward[0], .35);
  assert.equal(aelis(40, 'guerisseuse').bless.heal[1], 28);
  assert.equal(aelis(25, 'druide').roots.k, 1.25);
  assert.equal(aelis(40, 'druide').moon.drain, .6);
  assert.equal(aelis(25, 'enchant').aura.cd, 2);
  assert.equal(aelis(40, 'enchant').aura.cleanse, 1);
  assert.equal(aelis(40, 'druide').ward, undefined, 'pas de cumul entre voies');
  assert.equal(SPECS[2].every(x => x.t.length === 5), true);
});

// ---------- V4.53 Nyra / V4.54 Lyria ----------
const idxOf=k=>HER.findIndex(h=>h.k===k);
test('Nyra et Lyria : recrues aux niveaux 30 et 40, 10 sorts chacune, tous définis, talents à 5 paliers', () => {
  const N=idxOf('rogue'),L=idxOf('paladin');
  assert.deepEqual([N,L],[4,5]);assert.equal(HER[N].at,30);assert.equal(HER[L].at,40);
  for(const i of[N,L]){const ids=[...HER[i].sp,...HER[i].learn.map(a=>a[0])];assert.equal(ids.length,10);for(const id of ids){assert.ok(SP[id],id);assert.ok(SP[id].d)}
   assert.deepEqual([24,25,40].map(l=>tiersOf(l,i)),[3,4,5]);assert.equal(SPECS[i].length,3);for(const sp of SPECS[i])assert.equal(sp.t.length,5)}
  assert.equal(knownSpells({lvl:30,items:[],up:{}},N).length,8);assert.equal(knownSpells({lvl:45,items:[],up:{}},N).length,10);
  assert.equal(mastered(SP.hammer,'hammer',2).k,1.05);assert.equal(mastered(SP.light,'light',3).hk,1.1);
});
test('Nyra : dos (héros adjacent), exécution, double coup, marque, esquive active', () => {
  const s=arena(),n=unit(s,'h',2,2,{mult:1,dmgMul:1,dmgB:0}),t=unit(s,'m',3,2,{hp:300,max:300,armor:0});
  applySpell(s,n,{...SP.backstab,dmg:[20,20]},t);assert.equal(t.hp,280,'seule, pas de bonus');
  unit(s,'h',4,2,{});applySpell(s,n,{...SP.backstab,dmg:[20,20]},t);assert.equal(t.hp,250,'×1,5 avec un héros collé à la cible');
  const w=unit(s,'m',3,5,{hp:100,max:100,armor:0});applySpell(s,n,{...SP.execute,dmg:[10,10]},w);assert.equal(w.hp,90,'sans seuil');
  const l=unit(s,'m',5,5,{hp:30,max:100,armor:0});applySpell(s,n,{...SP.execute,dmg:[10,10]},l);assert.equal(l.hp,10,'×2 sous 35 %');
  const d=unit(s,'m',6,6,{hp:100,max:100,armor:0});applySpell(s,n,{...SP.twin,dmg:[10,10]},d);assert.equal(d.hp,80,'deux coups');
  const ev=applySpell(s,n,SP.mark,t);assert.equal(t.sunder.pct,.25);assert.ok(ev.some(e=>/Marqué/.test(e.text||'')));
  applySpell(s,n,SP.evade,{x:2,y:2});assert.equal(n.evade,.5);
  const m=unit(s,'m',9,9,{});assert.equal(forecast(s,m,{...SP.slash},n).dodge,.5);
  beginTurn(n);assert.equal(n.evade,undefined,'l’esquive tient jusqu’au prochain tour de Nyra');
});
test('Lyria : protection, interception, égide, serment, bastion, purge', () => {
  const s=arena(),l=unit(s,'h',2,2,{mult:1,healMul:1}),a=unit(s,'h',3,2,{hp:20,max:50,poison:{d:3,turns:2}}),m=unit(s,'m',2,4,{});
  applySpell(s,l,SP.protect,{x:3,y:2});assert.equal(a.shield,1);
  applySpell(s,l,SP.purge,{x:3,y:2});assert.equal(a.poison,undefined);assert.ok(a.hp>20);
  applySpell(s,l,SP.intercept,{x:2,y:2});assert.equal(l.shield,1);assert.equal(m.taunt,l.id);
  applySpell(s,l,SP.aegis,{x:2,y:2});assert.equal(a.ward.hp,Math.round(a.max*.15));
  applySpell(s,l,SP.oath,{x:2,y:2});assert.deepEqual([l.buff.pct,a.buff.turns],[.2,2]);
  delete a.shield;applySpell(s,l,SP.bastion,{x:2,y:2});assert.equal(a.shield,1);
  const t=unit(s,'m',6,6,{hp:100,max:100,armor:0}),t2=unit(s,'m',7,6,{hp:100,max:100,armor:0});
  applySpell(s,l,{...SP.smite,dmg:[20,20]},{x:6,y:6});assert.ok(t.hp<100&&t2.hp<100&&t.hp<t2.hp,'zone, plein au centre');
});
test('Nyra et Lyria en combat : équipe de 3 avec les deux recrues, bons sprites et sorts', () => {
  const st={lvl:45,items:[],up:{},team:[4,5,0]},s=newBattle();s.pot=0;
  const F=fightSpec(0,0,7),{hs,es}=genMap(s,F.seed,F.th,F.cry);
  mkUnits(s,F,hs,es,HER.map((_,i)=>heroStats(st,i)),teamOf(st));
  const H=s.units.filter(u=>u.team==='h');
  assert.deepEqual(H.map(u=>u.k),['rogue','paladin','warrior']);
  assert.ok(H[0].sp.includes('dagger')&&H[1].sp.includes('hammer')&&H[0].sp.length>=6);
});

// ---------- V4.55 quêtes ----------
import {QUESTS} from '../src/quests.js';
import {questOpen,questDone,questFight} from '../src/rules.js';
test('quêtes : 18 uniques, ouvertes par région, combat jouable',()=>{
 assert.equal(new Set(QUESTS.map(q=>q.id)).size,40);
 const sv={lvl:50,z:{},items:[]};
 assert.equal(QUESTS.filter(q=>questOpen(sv,q)).length,3);
 for(const q of QUESTS){const F=questFight(q,sv);assert.equal(F.quest,q.id);assert.ok(ZONES[F.zi]);assert.equal(!!F.wave,q.g==='survive');assert.ok(q.t&&q.d&&q.c)}
 assert.equal(questDone({q:{Q01:1}},QUESTS[0]),true);assert.equal(questDone({},QUESTS[0]),false);
});

// ---------- V4.59 équipement de Nyra et Lyria ----------
test('Nyra et Lyria portent du matériel de Fenn et Kael, aucun objet ajouté', () => {
  assert.equal(ITEMS.slice(0, 86).filter(o => o.src !== 'quest').length, 79); // V4.64 (hors objets signature V4.75)
  const c = ITEMS.find(o => o.n === 'Cuirasse à épaulières'), a = ITEMS.find(o => o.n === 'Arc long'), e = ITEMS.find(o => o.n === 'Épée courte'), h = ITEMS.find(o => o.n === 'Hache de guerre');
  assert.deepEqual(whoOf(c), [0, 5]); assert.deepEqual(whoOf(a), [1]); assert.deepEqual(whoOf(e), [0, 4, 5]); assert.deepEqual(whoOf(h), [0, 5]);
  for (const hero of [4, 5]) for (const sl of ['arme', 'armure', 'accessoire', 'bijou']) assert.ok(ITEMS.some(o => o.sl === sl && whoOf(o).includes(hero)), `héros ${hero} sans ${sl}`);
});

// ---------- V4.64 équipement dédié de Nyra (4) et Lyria (5), TABLE-EQUIPEMENTS-NYRA-LYRIA.md ----------
test('V4.64 : eq64 à eq79, 79 ids uniques, exclusifs, 2 par emplacement et par héroïne', async () => {
  const { ITEMS, whoOf, icOf } = await import('../src/data.js');
  const at = JSON.parse(readFileSync(new URL('../assets/atlas.json', import.meta.url)));
  assert.equal(ITEMS.slice(0, 86).filter(o => o.src !== 'quest').length, 79); const ids = ITEMS.slice(0, 86).filter(o => o.src !== 'quest').slice(10).map(o => o.id); assert.equal(new Set(ids).size, 69); // les 10 historiques n’ont pas d’id
  ITEMS.slice(63, 79).forEach((o, k) => {
    assert.equal(o.id, 'eq' + (64 + k)); assert.deepEqual(whoOf(o), [k < 8 ? 4 : 5]);
    assert.ok(at.equip[o.ic], o.id); assert.deepEqual(icOf(o), ['equip', o.ic]);
    assert.equal([o.dmg, o.hp, o.heal].filter(Boolean).length, 1, 'une seule stat'); assert.ok(!o.pa && !o.pm);
    assert.ok([1, 2].includes(o.rr)); assert.ok(['shop', 'loot'].includes(o.src));
  });
  for (const [h, lo] of [[4, 30], [5, 40]]) for (const sl of ['arme', 'armure', 'bijou', 'accessoire']) {
    const l = ITEMS.slice(63, 79).filter(o => whoOf(o)[0] === h && o.sl === sl);
    assert.equal(l.length, 2, h + sl); assert.deepEqual(l.map(o => [o.lv, o.rr, o.src]), [[lo, 1, 'shop'], [lo + 5, 2, 'loot']]);
  }
});
test('V4.64 : seuils 29/30, 34/35, 39/40, 44/45 ; marchand avant le butin ; objets des anciens héros inchangés', async () => {
  const { ITEMS } = await import('../src/data.js'), { lootPool, shopStock, buy } = await import('../src/rules.js');
  const J = id => ITEMS.findIndex(o => o.id === id), mk = l => ({ lvl: l, gold: 99999, items: [], z: {}, rr: {}, up: {} });
  assert.equal(buy(mk(29), J('eq64')), 0); assert.equal(buy(mk(30), J('eq64')), 1);
  assert.equal(buy(mk(39), J('eq72')), 0); assert.equal(buy(mk(40), J('eq72')), 1);
  assert.ok(!lootPool(mk(34)).includes(J('eq65'))); assert.ok(lootPool(mk(35)).includes(J('eq65')));
  assert.ok(!lootPool(mk(44)).includes(J('eq73'))); assert.ok(lootPool(mk(45)).includes(J('eq73')));
  assert.equal(buy(mk(50), J('eq65')), 0, 'butin : pas au marchand');
  for (let d = 0; d < 20; d++) assert.ok(!shopStock(mk(25), d).some(j => j >= 63 && j < 79), 'rien de Nyra/Lyria avant le niveau 30');
});

test('V4.64 : quêtes Q19 à Q24 (braise, sables) : ouvertes après la région précédente, cases brûlantes et dalles piégées reprises', async () => {
  const { QUESTS } = await import('../src/quests.js'), { questOpen, questFight, zoneDone } = await import('../src/rules.js'), { ZONES, MON, zlen } = await import('../src/data.js');
  const q = id => QUESTS.find(x => x.id === id), z = i => ({ [ZONES[i].id]: zlen(ZONES[i]) });
  assert.equal(QUESTS.length, 40);
  assert.equal(questOpen({ z: {} }, q('Q19')), false); assert.equal(questOpen({ z: z(5) }, q('Q19')), true);
  assert.equal(questOpen({ z: z(5) }, q('Q22')), false); assert.equal(questOpen({ z: { ...z(5), ...z(6) } }, q('Q22')), true);
  for (const id of ['Q19', 'Q20', 'Q21', 'Q22', 'Q23', 'Q24']) {
    const Q = q(id), F = questFight(Q, {}); assert.equal(F.quest, id); assert.ok(F.lava, id + ' : lave ou dalles de la région');
    assert.equal(!!F.wave, Q.g === 'survive'); if (Q.e) assert.ok(MON[Q.e], Q.e); assert.ok(F.lvl >= ZONES[Q.z].lvl);
  }
  assert.equal(questFight(q('Q23'), {}).lava.trap, 1, 'sables : dalles piégées');
});

test('V4.64 : région 9 (Marais des âmes) : 10 missions, boss provisoire, sols et obstacles valides, ouverte après le Pharaon', async () => {
  const { ZONES, R8, R9, MON, THEMES, DEC, LOW, zlen, MAP2 } = await import('../src/data.js'), { zoneDone, fightSpec } = await import('../src/rules.js');
  const at = JSON.parse(readFileSync(new URL('../assets/atlas.json', import.meta.url)));
  assert.equal(ZONES[8], R9); assert.equal(R9.fights.length, 10); assert.equal(zlen(R9), 10); assert.equal(R9.th[0], 9);
  assert.equal(THEMES[9].ts, 'sol_marais'); assert.equal(at.sol_marais.length, 8); assert.equal(at.deco6.length, 8); assert.equal(at.toad.length, 6); assert.equal(at.toadK, undefined);
  for (const n of ['ent', 'wraith', 'queen']) assert.equal(at[n].length, 6, n);
  assert.ok(THEMES[9].g.every(i => at.sol_marais[i])); assert.deepEqual(DEC(44), ['deco6', 0]); assert.deepEqual(DEC(51), ['deco6', 7]); assert.deepEqual(DEC(43), ['deco5', 7]);
  assert.ok(THEMES[9].obs.every(o => at[DEC(o)[0]][DEC(o)[1]])); assert.ok(LOW.has(44) && !LOW.has(50));
  for (const f of R9.fights) { assert.ok(f.lvl >= 31 && f.lvl <= 35); for (const k of f.en) assert.ok(MON[k], k) }
  assert.ok(MAP2.some(m => m.n === R9.n)); assert.equal(R9.boss.s, 'queen'); assert.ok(at[R9.boss.s]); assert.equal(R9.boss.bs, 'swamp'); assert.ok(R9.fights.some(f => f.en.includes('ent')) && R9.fights.some(f => f.en.includes('wraith')) && !R9.fights.some(f => f.en.includes('ghost')));
  assert.equal(R9.boss.n, 'Reine des marécages'); assert.equal(fightSpec(8, 9, 1).boss, R9.boss);
  assert.equal(zoneDone({ z: { [R8.id]: zlen(R8) } }, 7), true);
});

test('V5.0 lot 2 : 120 équipements, paliers Kael/Fenn/Aelis 25/35, Orion dédié 20/30/40, exclusifs jamais prêtés, signature d’Orion via Q39', async () => {
  const { ITEMS, whoOf, icOf } = await import('../src/data.js'), r = await import('../src/rules.js'), { QUESTS } = await import('../src/quests.js');
  const at = JSON.parse(readFileSync(new URL('../assets/atlas.json', import.meta.url)));
  assert.equal(ITEMS.length, 120);
  assert.equal(new Set(ITEMS.slice(10).map(o => o.id)).size, 110, 'ids uniques');
  ITEMS.slice(86).forEach((o, k) => {
    assert.ok(at.equip[o.ic], o.n); assert.deepEqual(icOf(o), ['equip', o.ic]);
    assert.equal(whoOf(o).length, 1, 'exclusif : ' + o.n); assert.ok(whoOf(o)[0] <= 3, o.n);
    assert.equal([o.dmg, o.hp, o.heal].filter(Boolean).length, 1, 'une seule stat'); assert.ok(!o.pa && !o.pm);
    assert.ok([1, 2].includes(o.rr));
  });
  for (const h of [0, 1, 2]) for (const sl of ['arme', 'armure', 'bijou', 'accessoire']) {
    const l = ITEMS.slice(86).filter(o => whoOf(o)[0] === h && o.sl === sl);
    assert.deepEqual(l.map(o => [o.lv, o.rr, o.src]), [[25, 1, 'shop'], [35, 2, 'loot']], h + sl);
  }
  for (const sl of ['armure', 'bijou', 'accessoire']) assert.deepEqual(ITEMS.slice(86).filter(o => whoOf(o)[0] === 3 && o.sl === sl && o.src !== 'quest').map(o => [o.lv, o.src]), [[20, 'shop'], [30, 'loot']], 'Orion ' + sl);
  assert.deepEqual(ITEMS.slice(86).filter(o => whoOf(o)[0] === 3 && o.sl === 'arme').map(o => [o.lv, o.src]), [[20, 'shop'], [30, 'loot'], [40, 'loot'], [38, 'quest']]);
  // Orion peut s’équiper complètement ; aucun prêt aux recrues
  const s = { lvl: 40, gold: 99999, items: [], z: {}, rr: {}, up: {}, team: [0, 1, 3] };
  for (const id of ['eq111', 'eq112', 'eq113', 'eq114']) { const j = ITEMS.findIndex(o => o.id === id); assert.equal(r.buy(s, j), 1, id); assert.equal(r.equip(s, j, 3), 1, id); }
  assert.equal(r.equip(s, ITEMS.findIndex(o => o.id === 'eq87'), 3), 0, 'Orion ne porte pas l’équipement de Kael');
  assert.equal(r.equip(s, ITEMS.findIndex(o => o.id === 'eq87'), 4), 0, 'Nyra ne reçoit pas les nouveaux objets de Kael');
  assert.equal(r.equip(s, ITEMS.findIndex(o => o.id === 'eq88'), 5), 0, 'Lyria non plus');
  assert.equal(r.buy({ ...s, items: [], lvl: 24 }, ITEMS.findIndex(o => o.id === 'eq87')), 0); assert.equal(r.buy({ ...s, items: [], lvl: 25 }, ITEMS.findIndex(o => o.id === 'eq87')), 1);
  // signature d’Orion : Q39, sans doublon, sauvegarde stable
  const Q = QUESTS.find(x => x.id === 'Q39'), sv = { lvl: 60, items: [], q: {} }, got = r.grantQuest(sv, Q, () => 0.1);
  assert.ok(got.includes(119)); assert.equal(ITEMS[119].src, 'quest'); assert.deepEqual(r.grantQuest(sv, Q, () => 0.1), []);
  const sv2 = JSON.parse(JSON.stringify(sv)); assert.deepEqual(sv2.items, sv.items);
});
