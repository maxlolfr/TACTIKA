// V5.22 · Cauchemar lot 4 : régions 7 à 9 (carte II, boss compris) et affixes Spectral / Commandant.
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),D=await import('../src/data.js');
const {HER,ZONES,zlen,CM_BOSSES,CM_PILOTS,CM_ZONES,CM_TUNE}=D;
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
function battleF(F,rs=11){const s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(50));return s}
function battle(zi,i,cm){const F0=r.fightSpec(zi,i,zi*1000+i*97);return battleF(cm?{...F0,lvl:50,cm}:F0)}
const elite=s=>s.units.find(u=>u.mods&&!u.champ);
const heroes=s=>s.units.filter(u=>u.team==='h');
const park=(s,keep)=>{s.units.forEach((u,k)=>{if(!keep.includes(u)){u.x=u.gx=90+k;u.y=u.gy=90+k}})};
const last=zi=>zlen(ZONES[zi])-1;
const spot=(s,u,dx,dy)=>{for(let k=1;k<6;k++){const x=u.x+dx*k,y=u.y+dy*k;if(s.map.has(x+','+y))return{x,y}}return null};

test('régions 1 à 9 jouables (Ignaros, Pharaon, Reine boss de leur région) ; dernier pilote : Briseur primordial',()=>{
 assert.equal(CM_ZONES,9);assert.deepEqual(CM_PILOTS.map(b=>b.id),['eter']);
 for(const zi of [6,7,8]){assert.ok(CM_TUNE[zi],'renfort réglé');const F=E.cmSpec(r.fightSpec(zi,last(zi),1),zi,{seed:4});assert.ok(F.cm.boss);assert.equal(F.lvl,50);assert.equal(F.cm.champ,0);
  const B=battleF(F).units.find(u=>u.boss);assert.ok(B.n.startsWith('☠ ')&&B.cmBoss);assert.ok(!B.mods)}
 const Q=E.cmSpec(r.fightSpec(8,last(8),1),8,{seed:4});assert.equal(Q.cm.boss.rage,.6,'la Reine garde son paquet de pilote');
 assert.equal(E.cmSpec(r.fightSpec(6,last(6),1),6,{seed:4}).cm.n,2,'Ignaros : 2 élites d’escorte')});

test('tirage : Spectral et Commandant seulement dès la région 7 ; R4–R6 gardent leurs 6 affixes',()=>{
 for(const zi of [3,4,5]){const P=E.cmSpec(r.fightSpec(zi,2,1),zi,{}).cm.pool;assert.deepEqual(P,E.POOL6)}
 const seen=new Set();for(const zi of [6,7,8])for(let k=0;k<30;k++){const s=battleF(E.cmSpec(r.fightSpec(zi,k%9,1),zi,{seed:k}));assert.equal(s.units.filter(u=>u.champ).length,1);
  for(const u of s.units)if(u.mods){assert.ok(E.compatible(u.mods),u.mods.join());u.mods.forEach(m=>seen.add(m))}}
 assert.ok(seen.has('spectre')&&seen.has('cmdt'),[...seen].join())});

test('compatibilités : Commandant jamais avec Gardien (deux auras) ; Spectral jamais avec Gardien',()=>{
 assert.ok(!E.compatible(['garde','cmdt']));assert.ok(!E.compatible(['spectre','garde']));assert.ok(E.compatible(['spectre','cmdt']));assert.ok(E.compatible(['cmdt','berserk']));
 assert.ok(!E.pairs().some(p=>p.includes('garde')&&(p.includes('cmdt')||p.includes('spectre'))))});

test('Spectral : coups à 2 cases ou plus ×0,5, au contact dégâts normaux ; aperçu cohérent',()=>{
 const s=battle(6,3,{seed:3,mods:['spectre']}),u=elite(s),[h]=heroes(s);assert.deepEqual(u.mods,['spectre']);
 assert.equal(E.modFar(s,u,{x:u.x+1,y:u.y}),1);assert.equal(E.modFar(s,u,{x:u.x+2,y:u.y}),.5);assert.equal(E.modFar(s,u,{x:u.x,y:u.y+3}),.5);
 assert.equal(E.modFar(s,h,{x:h.x+3,y:h.y}),1,'un héros n’est jamais spectral');
 park(s,[u,h]);const sp=h.S[h.sp.find(id=>h.S[id].dmg)],near=spot(s,u,0,-1),far=spot(s,u,0,-1)&&{x:u.x,y:u.y-3};
 h.x=h.gx=near.x;h.y=h.gy=near.y;const fn=r.forecast(s,h,sp,u),ff=r.forecast(s,h,sp,u,far);
 assert.ok(ff.dmg[1]<fn.dmg[1],`loin ${ff.dmg} < près ${fn.dmg}`);
 const n0=battle(6,3,{seed:3,mods:['spectre']}),b=elite(n0);assert.equal(E.modFar({cmOn:0},b,{x:b.x+4,y:b.y}),1,'hors Cauchemar : neutre')});

test('Spectral en combat : un vrai coup à distance est marqué « spec » et vaut la moitié du même coup au contact',()=>{
 const mk=()=>{const s=battle(6,3,{seed:3,mods:['spectre']}),u=elite(s),h=heroes(s).find(x=>x.S[x.sp[0]]?.dmg&&x.S[x.sp[0]].r[1]>=3)||heroes(s)[1];park(s,[u,h]);u.hp=u.max=99999;return{s,u,h}};
 const A=mk(),sp=A.h.S[A.h.sp.find(id=>A.h.S[id].dmg&&A.h.S[id].r[1]>=2)];assert.ok(sp,'un sort à distance');
 A.h.x=A.h.gx=A.u.x;A.h.y=A.h.gy=A.u.y-2;A.s.rng=r.mulberry(5);const ev=r.applySpell(A.s,A.h,sp,A.u),hit=ev.find(e=>e.type==='hurt'&&e.t===A.u);
 if(hit){assert.ok(hit.spec,'marqué spectral');const B=mk();B.u.mods=null;B.h.x=B.h.gx=B.u.x;B.h.y=B.h.gy=B.u.y-2;B.s.rng=r.mulberry(5);const hb=r.applySpell(B.s,B.h,sp,B.u).find(e=>e.type==='hurt'&&e.t===B.u);
  assert.ok(Math.abs(hit.amt-Math.max(1,hb.amt*.5))<=Math.ceil(hb.amt*.05)+1,`${hit.amt} ≈ ${hb.amt}/2`)}});

test('Commandant : alliés à 2 cases ou moins +20 % (pas lui, pas les héros), le meilleur seulement, rien une fois mort',()=>{
 const s=battle(7,3,{seed:3,mods:['cmdt']}),g=elite(s),m=s.units.find(o=>o.team==='m'&&o!==g&&!o.boss),[h]=heroes(s);assert.deepEqual(g.mods,['cmdt']);
 park(s,[g,m,h]);m.x=g.x+1;m.y=g.y+1;assert.equal(E.modCmd(s,m),1.2);assert.equal(E.modCmd(s,g),1,'pas lui-même');m.x=g.x+3;m.y=g.y;assert.equal(E.modCmd(s,m),1,'trop loin');
 h.x=g.x+1;h.y=g.y;assert.equal(E.modCmd(s,h),1,'jamais un héros');
 m.x=g.x;m.y=g.y+2;const g2=s.units.find(o=>o.team==='m'&&o!==g&&o!==m);g2.mods=['cmdt'];g2.x=m.x+1;g2.y=m.y;assert.equal(E.modCmd(s,m),1.2,'non cumulable');g2.mods=null;
 g.dead=true;assert.equal(E.modCmd(s,m),1,'commandant abattu');g.dead=false;
 const t=battle(7,3,{seed:3,mods:['cmdt']}),tg=elite(t),tm=t.units.find(o=>o.team==='m'&&o!==tg&&!o.boss),[th]=heroes(t);park(t,[tg,tm,th]);
 tm.x=tm.gx=th.x;tm.y=tm.gy=th.y-1;tg.x=tg.gx=tm.x;tg.y=tg.gy=tm.y-1;th.hp=th.max=99999;t.rng=r.mulberry(2);const e1=r.applySpell(t,tm,tm.atk,th).find(e=>e.type==='hurt');
 if(e1)assert.ok(e1.cmd,'coup commandé marqué')});

test('campagne normale R7–R9 : aucun affixe, aucun boss Cauchemar ; fiches FR / EN des nouveaux affixes',()=>{
 for(const zi of [6,7,8])for(let i=0;i<zlen(ZONES[zi]);i++){const n=battle(zi,i);assert.ok(n.units.every(x=>!x.mods&&!x.cmBoss),`${zi}.${i}`);assert.ok(!n.cmOn)}
 for(const id of ['spectre','cmdt']){const M=E.MODS[id];assert.ok(M.n&&M.en&&M.d&&M.de&&M.col&&M.ico)}
 assert.ok(CM_BOSSES.some(b=>b.zi===6),'paquet propre d’Ignaros')});
