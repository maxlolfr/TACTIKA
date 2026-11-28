// V5.15 · Cauchemar lot 3 : régions 4 à 6 (boss compris) et affixes Vampirique / Venimeux.
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),D=await import('../src/data.js');
const {HER,ZONES,zlen,CM_BOSSES,CM_PILOTS,CM_ZONES,CM_LVL}=D;
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
function battle(zi,i,cm,rs=11){const F0=r.fightSpec(zi,i,zi*1000+i*97),F=cm?{...F0,lvl:50,cm}:F0,s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(50));return s}
function battleF(F,rs=11){const s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(50));return s}
const elite=s=>s.units.find(u=>u.mods&&!u.champ);
const heroes=s=>s.units.filter(u=>u.team==='h');
const clear=(s,keep)=>{for(const u of s.units)if(!keep.includes(u)){u.x=u.gx=99;u.y=u.gy=99+s.units.indexOf(u)}};
const last=zi=>zlen(ZONES[zi])-1;

test('régions 1 à 6 jouables ; le Titan devient le boss de la région 6 ; pilotes restants : Reine puis Briseur',()=>{
 assert.equal(CM_ZONES,6);assert.equal(CM_LVL,50);
 assert.deepEqual(CM_PILOTS.map(b=>ZONES[b.zi].boss.n),['Reine des marécages','Briseur primordial']);
 assert.ok(CM_BOSSES.some(b=>b.zi===5),'paquet du Titan conservé (boss R6)');
 for(const zi of [3,4,5]){const F=E.cmSpec(r.fightSpec(zi,last(zi),1),zi,{seed:2});assert.ok(F.cm.boss,'boss Cauchemar');assert.equal(F.lvl,50);assert.equal(F.cm.champ,0);
  const B=battleF(F).units.find(u=>u.boss);assert.ok(B.n.startsWith('☠ '));assert.ok(B.cmBoss);assert.ok(!B.champ&&!B.mods,'le boss n’est jamais une élite')}
 const T=E.cmSpec(r.fightSpec(5,last(5),1),5,{seed:2});assert.equal(T.cm.boss.rage,.65);assert.equal(T.cm.boss.fast,1)});

test('rencontres R4–R6 : 1 champion + 2 élites, Vampirique et Venimeux au tirage ; R1–R3 inchangées (4 affixes)',()=>{
 for(const zi of [0,1,2])assert.deepEqual(E.cmSpec(r.fightSpec(zi,2,1),zi,{}).cm.pool,['berserk','garde','regen','bombe']);
 const seen=new Set();
 for(const zi of [3,4,5]){const F=E.cmSpec(r.fightSpec(zi,2,1),zi,{});assert.ok(F.cm.pool.includes('vamp')&&F.cm.pool.includes('venin'));assert.equal(F.cm.champ,1);assert.equal(F.cm.n,2);
  for(let k=0;k<30;k++){const s=battleF(E.cmSpec(r.fightSpec(zi,k%9,1),zi,{seed:k}));assert.equal(s.units.filter(u=>u.champ).length,1);for(const u of s.units)if(u.mods){assert.ok(E.compatible(u.mods),u.mods.join());u.mods.forEach(m=>seen.add(m))}}}
 assert.ok(seen.has('vamp')&&seen.has('venin'),[...seen].join())});

test('compatibilités : Vampirique exclu avec Régénérateur et Gardien ; Venimeux compatible avec tous',()=>{
 assert.ok(!E.compatible(['vamp','regen']));assert.ok(!E.compatible(['garde','vamp']));
 for(const id of E.MOD_IDS)if(id!=='venin')assert.ok(E.compatible(['venin',id]),id);
 assert.ok(E.compatible(['vamp','berserk']));assert.ok(!E.pairs().some(p=>p.includes('vamp')&&(p.includes('regen')||p.includes('garde'))))});

test('Vampirique : se soigne de 40 % des dégâts infligés, plafond 50 % des PV, brûlé = rien, maudit = moitié, jamais au-delà du maximum',()=>{
 const s=battle(3,3,{seed:3,mods:['vamp']}),u=elite(s),[h]=heroes(s);assert.deepEqual(u.mods,['vamp']);
 u.hp=1;const ev=E.modHit(s,u,h,50);assert.equal(u.hp,1+20);assert.ok(ev.some(e=>e.type==='heal'&&e.src==='vamp'&&e.amt===20));
 const cap=Math.round(u.max*.5);for(let k=0;k<50;k++){u.hp=1;E.modHit(s,u,h,1000)}assert.equal(u.drain,cap,'plafond');u.hp=1;assert.deepEqual(E.modHit(s,u,h,100),[]);
 u.drain=0;u.burn={d:3,turns:2};u.hp=1;const b=E.modHit(s,u,h,100);assert.equal(u.hp,1);assert.ok(b.some(e=>e.text==='Drain bloqué'));delete u.burn;
 u.curse=2;u.hp=1;E.modHit(s,u,h,100);assert.equal(u.hp,1+Math.round(40*D.CURSE_K));delete u.curse;
 u.hp=u.max-3;E.modHit(s,u,h,100);assert.equal(u.hp,u.max)});

test('Vampirique en combat : un vrai coup porté soigne l’élite du montant attendu',()=>{
 const s=battle(3,3,{seed:3,mods:['vamp']}),u=elite(s),[h]=heroes(s);clear(s,[u,h]);u.x=u.gx=h.x;u.y=u.gy=h.y-1;u.hp=Math.floor(u.max/2);const hp0=u.hp,hh=h.hp;
 s.rng=r.mulberry(9);const ev=r.applySpell(s,u,u.atk,h),dealt=ev.filter(e=>e.type==='hurt'&&e.t===h).reduce((a,e)=>a+e.amt,0);
 if(dealt){assert.equal(hh-h.hp,dealt);assert.equal(u.hp,hp0+Math.round(dealt*.4))}else assert.equal(u.hp,hp0,'esquive : rien')});

test('Venimeux : ses coups empoisonnent (30 % du coup × 3 tours), le plus fort poison reste, jamais un allié ; Purification le retire',()=>{
 const s=battle(4,3,{seed:5,mods:['venin']}),u=elite(s),[h,f,a]=heroes(s);
 E.modHit(s,u,h,40);assert.deepEqual(h.poison,{d:12,turns:3});
 h.poison={d:20,turns:3};E.modHit(s,u,h,40);assert.equal(h.poison.d,20,'poison plus fort gardé');
 E.modHit(s,u,f,5);assert.deepEqual(f.poison,{d:3,turns:3},'au moins 3');
 const m=s.units.find(o=>o.team==='m'&&o!==u);E.modHit(s,u,m,40);assert.ok(!m.poison,'pas sur un allié');
 const hp=h.hp;h.poison={d:12,turns:1};r.poisonTick(s,h);assert.equal(h.hp,hp-Math.min(hp,12));assert.ok(!h.poison);
 assert.deepEqual(E.modHit(s,{team:'m'},h,40),[],'sans modificateur : rien')});

test('sérialisation et campagne normale : drain sauvegardé, aucun affixe hors Cauchemar',()=>{
 const s=battle(3,3,{seed:3,mods:['vamp']}),u=elite(s);u.drain=17;const j=JSON.parse(JSON.stringify(E.modState(u)));assert.equal(j.drain,17);
 for(const zi of [3,4,5])for(let i=0;i<zlen(ZONES[zi]);i++){const n=battle(zi,i);assert.ok(n.units.every(x=>!x.mods&&!x.cmBoss),`${zi}.${i}`)}
 assert.ok(E.MODS.vamp.d&&E.MODS.vamp.de&&E.MODS.venin.d&&E.MODS.venin.de,'fiches FR / EN')});
