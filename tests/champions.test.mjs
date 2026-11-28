// V5.11 · champions Cauchemar (2 capacités, plus gros, plafonds propres) et réglage graphique.
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),{HER,ZONES,zlen}=await import('../src/data.js'),Gx=await import('../src/gfx.js');
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
function battle(zi,i,cm,lvl=50,rs=11){const F0=r.fightSpec(zi,i,zi*1000+i*97),F=cm?{...F0,lvl,cm}:F0,s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(cm?50:F.lvl+2));return s}
const CM={pool:E.MOD_IDS,n:2,champ:1,extra:2,hp:1.25,dmg:1.2};

test('champion : un seul, 2 capacités compatibles, jamais boss / chef / élite historique / renfort ; élites inchangées',()=>{
 for(const[zi,i]of[[0,1],[0,4],[1,3],[2,2],[2,6]])for(let k=0;k<12;k++){const s=battle(zi,i,{...CM,seed:k}),ch=s.units.filter(u=>u.champ),el=s.units.filter(u=>u.mods&&!u.champ);
  assert.equal(ch.length,1,`${zi} ${i} ${k}`);const c=ch[0];assert.equal(c.mods.length,2);assert.ok(E.compatible(c.mods));
  assert.ok(!c.boss&&!c.chief&&!c.elite&&!c.reinf&&!c.minion);assert.ok(el.every(u=>u.mods.length===1),'élites à 1 modificateur');
  assert.equal(new Set(el.map(u=>u.mods[0])).size,el.length,'élites différentes entre elles')}});

test('champion : plafonds PV ×1,6 et dégâts ×1,25, taille ×1,7, nom FR/EN',()=>{
 for(const[a,b]of E.pairs()){const k=E.statK([a,b],1);assert.ok(k.hp<=E.CAP_CH.hp&&k.dmg<=E.CAP_CH.dmg,a+b);assert.ok(k.hp>E.statK([a,b]).hp-1e-9)}
 assert.ok(!E.pairs().some(p=>p.includes('garde')&&p.includes('regen')),'exclusion Gardien + Régénérateur');
 const s=battle(0,3),m=s.units.find(u=>u.team==='m'),hp=m.max,h=m.h;assert.ok(!E.applyMods(m,['berserk'],'fr',1),'un champion a 2 capacités');
 assert.ok(E.applyMods(m,['berserk','bombe'],'fr',1));assert.equal(m.champ,1);assert.equal(m.max,Math.round(hp*Math.min(1.6,1.2*1.25*1.15)));
 assert.ok(Math.abs(m.h-h*E.CH_K.h)<1e-9&&E.CH_K.h>=1.6);assert.ok(m.n.includes('(Champion : Berserker, Explosif)'),m.n);
 const t=battle(0,3).units.find(u=>u.team==='m');E.applyMods(t,['garde','bombe'],'en',1);assert.ok(t.n.includes('(Champion: Guardian, Volatile)'),t.n)});

test('champion : ses deux capacités agissent (Berserker + Gardien) et son état se sérialise',()=>{
 const s=battle(1,2,{...CM,seed:4,cmods:['berserk','garde']}),c=s.units.find(u=>u.champ);assert.deepEqual(c.mods,['berserk','garde']);
 c.hp=Math.floor(c.max*.4);assert.equal(E.modOut(c),E.MODS.berserk.k,'furie');
 const ally=s.units.find(u=>u.team==='m'&&u!==c&&!u.dead);ally.x=c.x+1;ally.y=c.y;assert.equal(E.modIn(s,ally).k,1-E.MODS.garde.k,'aura');
 const st=JSON.parse(JSON.stringify(E.modState(c)));assert.equal(st.champ,1);assert.deepEqual(st.mods,['berserk','garde'])});

test('sans champion (cm.champ absent) le tirage des élites est celui de la V5.10.2',()=>{
 for(let k=0;k<10;k++){const a=battle(2,3,{pool:E.MOD_IDS,n:2,seed:k}),b=battle(2,3,{pool:E.MOD_IDS,n:2,seed:k,champ:0});
  assert.deepEqual(a.units.filter(u=>u.mods).map(u=>[u.id,...u.mods]),b.units.filter(u=>u.mods).map(u=>[u.id,...u.mods]));assert.ok(!a.units.some(u=>u.champ))}});

test('campagne normale : aucun champion sur les 120 missions',()=>{
 for(const[zi,Z]of ZONES.entries())for(let i=0;i<zlen(Z);i++)assert.ok(battle(zi,i).units.every(u=>!u.champ&&!u.mods))});

test('réglage graphique : anciennes sauvegardes, bornes, résolution du plateau',()=>{
 assert.equal(Gx.gqOf({}),1,'défaut Moyen');assert.equal(Gx.gqOf({lowfx:1}),0,'« Effets réduits : oui » = Faible');assert.equal(Gx.gqOf({gq:2,lowfx:1}),2);assert.equal(Gx.gqOf({gq:9}),2);
 Gx.setGq(1);assert.equal(Gx.dprFor(3,400*900),3,'Moyen = V5.10 (plafond 3)');assert.equal(Gx.dprFor(1,1920*1080),1);
 Gx.setGq(0);assert.equal(Gx.dprFor(3,400*900),1.5);assert.equal(Gx.dprFor(1,1366*768),1);
 Gx.setGq(2);assert.equal(Gx.dprFor(1,1920*1080),2,'PC : suréchantillonné');assert.equal(Gx.dprFor(3,400*900),3);assert.ok(Gx.dprFor(1,3840*2160)>=1&&Gx.dprFor(1,3840*2160)<2,'4K : budget mémoire');
 assert.ok(Gx.hiFx());Gx.setGq(1);assert.ok(!Gx.hiFx())});
