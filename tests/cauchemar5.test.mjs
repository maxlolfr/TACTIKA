// V5.23 · Cauchemar lot 5 : régions 10 à 12 (fin de la carte II), Briseur primordial boss de la région 12, fin du Cauchemar.
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),D=await import('../src/data.js');
const {HER,ZONES,zlen,CM_BOSSES,CM_PILOTS,CM_ZONES,CM_TUNE}=D;
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
function battleF(F,rs=11){const s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(50));return s}
const last=zi=>zlen(ZONES[zi])-1;

test('les 12 régions sont jouables ; plus aucun boss pilote',()=>{
 assert.equal(CM_ZONES,12);assert.equal(ZONES.length>=12,true);assert.deepEqual(CM_PILOTS,[]);
 for(const zi of [9,10,11])assert.ok(CM_TUNE[zi]&&CM_TUNE[zi].hp<1.25,'renfort réglé (monstres de base déjà durs au niveau 50)')});

test('boss des régions 10 à 12 : Aetherion, Roi du Givre, Briseur primordial, marqués ☠, sans affixe',()=>{
 const want=['Aetherion','Roi du Givre','Briseur primordial'];
 [9,10,11].forEach((zi,k)=>{const F=E.cmSpec(r.fightSpec(zi,last(zi),1),zi,{seed:4});assert.ok(F.cm.boss);assert.equal(F.lvl,50);assert.equal(F.cm.champ,0);
  assert.ok(CM_BOSSES.some(b=>b.zi===zi),'paquet propre');const B=battleF(F).units.find(u=>u.boss);assert.ok(B.n.includes(want[k]),B.n);assert.ok(B.n.startsWith('☠ ')&&B.cmBoss);assert.ok(!B.mods)});
 const P=E.cmSpec(r.fightSpec(11,last(11),1),11,{seed:4});assert.equal(P.cm.boss.fast,1,'le Briseur garde son paquet (défense brisée plus fréquente)');assert.equal(P.cm.n,1)});

test('rencontres R10–R12 : 1 champion + 2 élites, les 8 affixes possibles, toutes compatibles',()=>{
 const seen=new Set();for(const zi of [9,10,11])for(let k=0;k<30;k++){const F=E.cmSpec(r.fightSpec(zi,k%9,1),zi,{seed:k});assert.deepEqual(F.cm.pool,E.MOD_IDS);
  const s=battleF(F);assert.equal(s.units.filter(u=>u.champ).length,1);assert.equal(s.units.filter(u=>u.mods&&!u.champ).length,2);
  for(const u of s.units)if(u.mods){assert.ok(E.compatible(u.mods),u.mods.join());u.mods.forEach(m=>seen.add(m))}}
 assert.equal(seen.size,E.MOD_IDS.length,[...seen].join())});

test('campagne normale R10–R12 inchangée : aucun affixe, aucun boss Cauchemar',()=>{
 for(const zi of [9,10,11])for(let i=0;i<zlen(ZONES[zi]);i++){const F=r.fightSpec(zi,i,zi*1000+i*97),n=battleF(F);assert.ok(n.units.every(x=>!x.mods&&!x.cmBoss),`${zi}.${i}`);assert.ok(!n.cmOn)}});
