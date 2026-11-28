// V5.14 · Cauchemar lot 2 : description des combats (cmSpec), boss du Cauchemar, boss pilotes, progression à part.
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),D=await import('../src/data.js'),SV=await import('../src/save.js');
const {HER,ZONES,zlen,CM_BOSSES,CM_LVL}=D;
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
const spec=(zi,i)=>r.fightSpec(zi,i,zi*1000+i*97);
function battle(F,rs=11){const s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(50));return s}
const last=zi=>zlen(ZONES[zi])-1;

test('cmSpec : rencontre = 1 champion + 2 élites, +2 monstres, niveau 50 ; boss des régions 1 à 3 = 2 élites, sans champion',()=>{
 const F=E.cmSpec(spec(0,3),0,{seed:5});assert.equal(F.lvl,CM_LVL);assert.equal(F.cm.champ,1);assert.equal(F.cm.n,2);assert.equal(F.cm.extra,2);assert.ok(!F.cm.boss);
 for(const zi of [0,1,2]){const B=E.cmSpec(spec(zi,last(zi)),zi,{seed:5});assert.equal(B.cm.champ,0);assert.equal(B.cm.n,2);assert.equal(B.cm.extra,0);assert.equal(B.cm.boss.rage,.6);assert.equal(B.cm.boss.hp,1.15)}});

test('boss pilotes : Titan, Reine, Briseur, paquet propre, fiche normale intacte',()=>{
 assert.deepEqual(CM_BOSSES.slice(0,3).map(b=>ZONES[b.zi].boss.n),['Titan prismatique','Reine des marécages','Briseur primordial']); // V5.22 : + Ignaros (paquet de région, en fin de liste)
 for(const b of CM_BOSSES){const F0=spec(b.zi,last(b.zi)),F=E.cmSpec(F0,b.zi,{seed:3});assert.equal(F.cm.n,b.esc);assert.equal(F.cm.boss.rage,b.rage);assert.equal(F.cm.hp,b.gh);
  assert.equal(ZONES[b.zi].boss.summon?.n,F0.boss.summon?.n,'la zone normale n’est pas modifiée')}
 const T=CM_BOSSES[0],F0=spec(T.zi,last(T.zi)),F=E.cmSpec(F0,T.zi,{});if(F0.cry)assert.equal(F.cry.p,(F0.cry.p||0)+1,'un prisme de plus')});

test('boss du Cauchemar : PV en plus, nom ☠, phase plus tôt ; sans F.cm, boss inchangé',()=>{
 const b=CM_BOSSES[1],F0=spec(b.zi,last(b.zi)),n=battle(F0).units.find(u=>u.boss),s=battle(E.cmSpec(F0,b.zi,{seed:2})),B=s.units.find(u=>u.boss);
 assert.equal(n.rageAt,undefined);assert.ok(!n.n.startsWith('☠'));assert.ok(B.n.startsWith('☠ '));assert.equal(B.rageAt,b.rage);
 assert.equal(s.units.filter(u=>u.mods).length,b.esc,'escorte');
 // la phase se déclenche au seuil du Cauchemar (60 %), pas en normal
 for(const[u,S,want]of[[B,s,1],[n,battle(F0),0]]){const U=S.units.find(x=>x.boss);U.hp=Math.floor(U.max*.58);r.bossTurn(S,U);assert.equal(!!U.raged,!!want,U.n)}});

test('signature plus fréquente (cmFast) : Titan tous les 2 tours au lieu de 3, jamais moins de 2',()=>{
 const T=CM_BOSSES[0],F0=spec(T.zi,last(T.zi)),n=battle(F0).units.find(u=>u.boss),c=battle(E.cmSpec(F0,T.zi,{seed:1})).units.find(u=>u.boss);
 assert.equal(r.BOSS_P.beam[0],3);assert.equal(c.cmFast,1);
 const gaps=u=>{const o=[];for(let b=0;b<6;b++){u.bt=b;o.push(r.bossNext(u))}return o};
 assert.ok(Math.max(...gaps(c))<=2);assert.ok(Math.max(...gaps(n))===3);
 const w={bs:'howl',summoned:1,cmFast:1,bt:0};assert.ok(r.bossNext(w)>=1&&r.bossNext(w)<=2,'période 2 : pas raccourcie')});

test('cm.n = 0 : aucune élite (le défaut reste 1 si n est absent)',()=>{
 const F=spec(0,3);assert.equal(battle({...F,lvl:50,cm:{seed:1,pool:E.MOD_IDS,n:0}}).units.filter(u=>u.mods).length,0);
 assert.equal(battle({...F,lvl:50,cm:{seed:1,pool:E.MOD_IDS}}).units.filter(u=>u.mods).length,1)});

test('accès : épilogue requis ; campagne normale : progression et régions inchangées hors Cauchemar',()=>{
 assert.equal(D.cmEligible({storySeen:{epilogue:1}}),true);assert.equal(D.cmEligible({storySeen:{}}),false);assert.equal(D.cmEligible(null),false);
 assert.equal(D.CM_DEV,null,'pas de mode Cauchemar sans drapeau');assert.deepEqual(Object.keys(SV.save.cm).sort(),['b','st','z']);
 SV.save.z.prairie=10;SV.save.z.bois=10;SV.save.z.plage=10;assert.equal(SV.prog('prairie'),10);assert.equal(SV.unlocked(3),true,'région 4 ouverte en normal');
 SV.setProg('mont',2);assert.equal(SV.save.z.mont,2);assert.equal(SV.save.cm.z.mont,undefined);assert.equal(SV.cmBossOpen(0),false,'boss pilotes fermés hors Cauchemar')});
