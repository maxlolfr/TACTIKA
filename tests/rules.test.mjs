// Tests des règles de combat (Node, sans navigateur) : npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SP,HER,MON,ZONES,ITEMS,THEMES} from '../src/data.js';
import {talentFx,cleanSp,SPECS} from '../src/talents.js';
import {K,mulberry,newBattle,cell,occ,passable,genMap,mkUnits,heroStats,gainXp,xpNeed,reach,pathTo,los,okTarget,selCells,
 hurt,payCost,applySpell,beginTurn,poisonTick,endTurn,outcome,aiStep,pushPlan,push,stars,starList,intent,upgrade,upCost,itemVal} from '../src/rules.js';

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
 for(const it of ITEMS)assert.ok(HER[it.who]);
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
test('étoiles : victoire, aucun KO, rapidité', () => {
 const s=arena();unit(s,'h',0,0);const h2=unit(s,'h',1,0);
 s.round=5;assert.equal(stars(s,false),3);s.round=6;assert.equal(stars(s,false),2);assert.equal(stars(s,true),3);
 h2.dead=true;assert.equal(stars(s,true),2);s.round=9;assert.equal(stars(s,true),1);
});
test('intention : le monstre vise le héros qu\'il frapperait, sans rien changer à l\'état', () => {
 const s=arena(),h=unit(s,'h',2,2,{hp:30}),far=unit(s,'h',10,10),m=unit(s,'m',5,2,{maxPA:4,maxPM:3,pa:0,pm:0,atk:{pa:4,r:[1,1],t:'enemy',dmg:[7,10]}});
 const it=intent(s,m);assert.equal(it.target,h);assert.deepEqual(it.dmg,[7,10]);assert.deepEqual(it.from,{x:3,y:2});
 assert.deepEqual([m.x,m.y,m.pa,m.pm],[5,2,0,0]);
 const m2=unit(s,'m',11,0,{maxPA:4,maxPM:1,pa:4,pm:1,atk:{pa:4,r:[1,1],t:'enemy',dmg:[1,2]}});assert.equal(intent(s,m2),null,'trop loin : aucune attaque');
});

// ---------- V2.4a ----------
test('étoiles : le détail est juste (rapide mais avec un KO)', () => {
 const s=arena();unit(s,'h',0,0,{dead:true});unit(s,'h',1,0);s.round=3;
 assert.deepEqual(starList(s,false),[true,false,true]);assert.equal(stars(s,false),2);
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
 assert.deepEqual(cleanSp(['berserk','zzz',7]),['berserk',null,null]);assert.deepEqual(cleanSp(undefined),[null,null,null]);
 assert.equal(SPECS.flat().length,9);
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
