// V5.10 · Cauchemar lot 1 : moteur des élites (Berserker, Gardien, Régénérateur, Explosif).
import test from 'node:test';
import assert from 'node:assert/strict';
const r=await import('../src/rules.js'),E=await import('../src/elites.js'),{HER,ZONES,SP,zlen}=await import('../src/data.js');
const hs=lvl=>HER.map((_,i)=>r.heroStats({lvl,items:[],up:{},sp:[null,null,null,null,null,null]},i));
// combat de la région zi, étape i ; cm = description Cauchemar ou rien
function battle(zi,i,cm,lvl=50,rs=11){const F0=r.fightSpec(zi,i,zi*1000+i*97),F=cm?{...F0,lvl,cm}:F0,s=r.newBattle(r.mulberry(rs)),{hs:h,es}=r.genMap(s,F.seed,F.th,F.cry);r.mkUnits(s,F,h,es,hs(cm?50:F.lvl+2));return s}
const elite=s=>s.units.find(u=>u.mods);
const heroes=s=>s.units.filter(u=>u.team==='h');
const clear=(s,keep)=>{for(const u of s.units)if(!keep.includes(u)){u.x=u.gx=99;u.y=u.gy=99+s.units.indexOf(u)}}; // écarte les autres unités du plateau

test('campagne normale : aucun modificateur, aucun drapeau Cauchemar, sur les 120 missions',()=>{
 for(const[zi,Z]of ZONES.entries())for(let i=0;i<zlen(Z);i++){const s=battle(zi,i);assert.ok(!s.cmOn,`${Z.id} ${i}`);assert.ok(s.units.every(u=>!u.mods),`${Z.id} ${i}`)}});

test('le tirage Cauchemar a sa propre graine : le hasard du combat est inchangé, le même tirage se reproduit',()=>{
 const a=battle(1,4),b=battle(1,4,{seed:5,pool:E.MOD_IDS});assert.equal(a.rng(),b.rng(),'hasard du combat intact');
 const c=battle(1,4,{seed:5,pool:E.MOD_IDS});assert.deepEqual(elite(b).mods,elite(c).mods);assert.equal(elite(b).id,elite(c).id);
 const ids=new Set();for(let k=0;k<40;k++)ids.add(elite(battle(2,3,{seed:k,pool:E.MOD_IDS})).mods[0]);assert.equal(ids.size,E.MOD_IDS.length,'tous les modificateurs sortent (6 depuis la V5.15)');
 // une seule élite, jamais le boss, le chef, une élite historique, un renfort
 for(const[zi,i]of[[0,4],[1,1],[2,7],[2,9],[1,9]]){const s=battle(zi,i,{seed:3,pool:E.MOD_IDS});const m=s.units.filter(u=>u.mods);assert.ok(m.length<=1);for(const u of m)assert.ok(!u.boss&&!u.chief&&!u.elite&&!u.reinf)}});

test('composition : compatibilités, cumul à 2, budget, plafonds PV ×1,35 et dégâts ×1,15',()=>{
 assert.ok(E.compatible(['berserk']));assert.ok(E.compatible(['berserk','bombe']));
 assert.ok(!E.compatible(['garde','regen']),'exclusion');assert.ok(!E.compatible(['berserk','bombe','regen']),'MOD_MAX');
 assert.ok(!E.compatible(['berserk','berserk']));assert.ok(!E.compatible(['inconnu']));assert.ok(!E.compatible([]));
 for(const a of E.MOD_IDS)for(const b of [null,...E.MOD_IDS]){const ids=b?[a,b]:[a];if(!E.compatible(ids))continue;const k=E.statK(ids);assert.ok(k.hp<=E.CAP.hp&&k.dmg<=E.CAP.dmg,ids.join('+'))}
 const s=battle(0,3),m=s.units.find(u=>u.team==='m'),hp=m.max,d=m.atk.dmg[1];assert.ok(E.applyMods(m,['garde']));
 assert.equal(m.max,Math.round(hp*1.35));assert.equal(m.atk.dmg[1],d);assert.ok(m.n.includes('(Gardien)'));
 assert.ok(!E.applyMods(s.units.find(u=>u.team==='h'),['berserk']),'jamais sur un héros')});

test('Berserker : dégâts ×1,35 sous 50 % PV, vrais aussi dans l’intention affichée',()=>{
 const s=battle(1,4,{seed:1,mods:['berserk']}),u=elite(s),h=heroes(s)[0];assert.equal(E.modOut(u,h),1);
 clear(s,[u,h]);u.x=u.gx=h.x;u.y=u.gy=h.y-1;const hi=r.intent(s,u);u.hp=Math.floor(u.max/2);const lo=r.intent(s,u);
 assert.equal(E.modOut(u,h),1.35);assert.ok(lo.dmg[1]>hi.dmg[1],`${lo.dmg} > ${hi.dmg}`);
 // dégâts réellement infligés : même tirage, ×1,35 avant armure
 const t=s.units.find(o=>o.team==='h'),s2=battle(1,4,{seed:1,mods:['berserk']});void s2;
 const hp0=t.hp;s.rng=r.mulberry(4);u.hp=u.max;r.applySpell(s,u,u.atk,t);const full=hp0-t.hp;t.hp=hp0;s.rng=r.mulberry(4);u.hp=Math.floor(u.max/2);r.applySpell(s,u,u.atk,t);const rage=hp0-t.hp;
 assert.ok(rage>=Math.floor(full*1.3)&&rage<=Math.ceil(full*1.4)+1,`${full} → ${rage}`)});

test('Gardien : −30 % aux alliés à 2 cases (pas à lui), meilleure protection seulement, au moins 1 dégât, prévision exacte',()=>{
 const s=battle(1,4,{seed:2,mods:['garde']}),g=elite(s),al=s.units.filter(u=>u.team==='m'&&u!==g),a=al[0],b=al[1],h=heroes(s)[0];
 clear(s,[g,a,b,h]);g.x=g.gx=3;g.y=g.gy=3;a.x=a.gx=4;a.y=a.gy=4;b.x=b.gx=8;b.y=b.gy=8;h.x=h.gx=5;h.y=h.gy=5;
 assert.equal(E.modIn(s,a).k,.7);assert.equal(E.modIn(s,g).k,1,'pas lui');assert.equal(E.modIn(s,b).k,1,'trop loin');assert.equal(E.modIn(s,h).k,1,'pas les héros');
 const ha=a.hp,e=r.hurt(s,a,100,'test');assert.ok(e.prot===g);assert.equal(ha-a.hp,Math.max(1,Math.round(r.soak(a,100)*.7)));
 const hb=b.hp;r.hurt(s,b,100,'test');assert.equal(hb-b.hp,r.soak(b,100),'hors aura : plein');
 a.hp=a.max;const f=r.forecast(s,h,SP.slash,a);a.hp=a.max;const f0=(()=>{const k=s.cmOn;s.cmOn=0;const v=r.forecast(s,h,SP.slash,a);s.cmOn=k;return v})();
 assert.ok(f.dmg[1]<f0.dmg[1]&&f.dmg[1]>=Math.round(f0.dmg[1]*.7)-1,`${f.dmg} < ${f0.dmg}`);
 // deux gardiens : pas de cumul
 E.applyMods(b,['garde']);b.x=b.gx=4;b.y=b.gy=2;const c=al[2]||s.units.find(u=>u.team==='m'&&![g,a,b].includes(u));if(c){c.x=c.gx=3;c.y=c.gy=2;assert.equal(E.modIn(s,c).k,.7)}
 // gardien abattu : plus de protection
 g.dead=true;assert.equal(E.modIn(s,a).k,b.dead?1:E.modIn(s,a).k);g.dead=false;
 r.hurt(s,a,1,'test');assert.ok(a.hp<a.max,'au moins 1 dégât')});

test('Régénérateur : +8 % au début de son tour, 40 % au plus par combat, bloqué par la brûlure, moitié si maudit',()=>{
 const s=battle(0,3,{seed:3,mods:['regen']}),u=elite(s),p=Math.round(u.max*.08),cap=Math.round(u.max*.4);
 assert.deepEqual(r.eliteTurn(s,u),[],'plein : rien');u.hp=1;
 const ev=r.eliteTurn(s,u);assert.equal(u.hp,1+p);assert.ok(ev.some(e=>e.type==='heal'&&e.src==='regen'&&e.amt===p));
 u.burn={d:3,turns:2};const hp=u.hp;r.eliteTurn(s,u);assert.equal(u.hp,hp,'brûlure');delete u.burn;
 u.curse=2;r.eliteTurn(s,u);assert.equal(u.hp,hp+Math.round(u.max*.08*.5));delete u.curse;
 for(let k=0;k<20;k++){u.hp=1;r.eliteTurn(s,u)}assert.equal(u.regen,cap,'plafond');u.hp=1;assert.deepEqual(r.eliteTurn(s,u),[]);
 u.regen=0;u.hp=u.max-2;r.eliteTurn(s,u);assert.equal(u.hp,u.max,'jamais au-delà du maximum')});

test('Explosif : s’amorce (héros à 3 cases), ne bouge plus, 9 cases annoncées, explose au tour suivant ; abattu = désamorcé ; recharge 3',()=>{
 const s=battle(2,3,{seed:4,mods:['bombe']}),u=elite(s),[h1,h2,h3]=heroes(s);clear(s,[u,h1,h2,h3]);
 u.x=u.gx=5;u.y=u.gy=5;h1.x=h1.gx=9;h1.y=h1.gy=9;h2.x=h2.gx=11;h2.y=h2.gy=11;h3.x=h3.gx=12;h3.y=h3.gy=12;
 r.beginTurn(u);assert.deepEqual(r.eliteTurn(s,u),[],'héros trop loin');
 h1.x=h1.gx=6;h1.y=h1.gy=6;h2.x=h2.gx=7;h2.y=h2.gy=6; // h1 dans la zone (diagonale), h2 à 3 cases mais hors zone
 r.beginTurn(u);const ev=r.eliteTurn(s,u);assert.ok(u.prime&&ev.some(e=>e.text==='Amorçage !'));assert.equal(u.pm,0);assert.ok(E.rooted(u));
 assert.equal(u.prime.cells.length,9);assert.ok(u.prime.cells.some(c=>c.x===6&&c.y===6));
 const a=r.aiStep(s,u);assert.ok(!a||a.type==='cast','aucun déplacement une fois amorcé');
 assert.equal(E.booms(s).length,1);assert.equal(E.booms(s)[0].d,E.boomDmg(u));
 const p1=h1.hp,p2=h2.hp;r.beginTurn(u);const ev2=r.eliteTurn(s,u);assert.ok(ev2.some(e=>e.type==='boom'));
 assert.ok(h1.hp<p1,'touché dans la zone');assert.equal(h2.hp,p2,'hors zone : rien');assert.ok(!u.prime);assert.equal(u.bcd,3);
 for(let k=0;k<3;k++){r.beginTurn(u);assert.ok(!r.eliteTurn(s,u).length&&!u.prime,'recharge')}r.beginTurn(u);r.eliteTurn(s,u);assert.ok(u.prime,'se réamorce après 3 tours');
 // abattu pendant l'amorçage : rien n'explose
 const ph=h1.hp;r.hurt(s,u,9999,'test');assert.ok(u.dead);assert.deepEqual(r.eliteTurn(s,u),[]);assert.equal(h1.hp,ph);assert.equal(E.booms(s).length,0)});

test('interactions : provocation, poison sous aura, Rempart, sorts de zone, ordre des effets de début de tour',()=>{
 const s=battle(1,4,{seed:6,mods:['berserk']}),u=elite(s),[k]=heroes(s);
 u.taunt=k.id;const a=r.aiStep(s,u);if(a?.type==='cast')assert.equal(a.target,k,'provoqué : vise Kael');delete u.taunt;
 const g=battle(1,4,{seed:2,mods:['garde']}),G=elite(g),al=g.units.find(o=>o.team==='m'&&o!==G);clear(g,[G,al,...heroes(g)]);G.x=G.gx=3;G.y=G.gy=3;al.x=al.gx=3;al.y=al.gy=4;
 al.poison={d:10,turns:1};const hp=al.hp;r.poisonTick(g,al);assert.equal(hp-al.hp,7,'poison réduit par l’aura');
 al.shield=1;const h2=al.hp;r.hurt(g,al,40,'test');assert.equal(h2-al.hp,Math.max(1,Math.round(r.soak(al,40)*.7)),'Rempart puis aura');delete al.shield;
 // Explosion (sort de zone d'Orion) sur un groupe protégé : aucune erreur, dégâts réduits sur les alliés du gardien
 const o=g.units.find(x=>x.hi===0)||heroes(g)[0];o.x=o.gx=3;o.y=o.gy=6;const ev=r.applySpell(g,o,SP.slash,al);assert.ok(Array.isArray(ev));
 // ordre : le poison passe avant la régénération (turns.js) ; une élite tuée par le poison ne se soigne pas
 const R=battle(0,3,{seed:3,mods:['regen']}),q=elite(R);q.hp=2;q.poison={d:5,turns:1};r.poisonTick(R,q);assert.ok(q.dead);assert.deepEqual(r.eliteTurn(R,q),[])});

test('sérialisation : état des élites en JSON sûr, aller-retour identique ; aucune trace dans la sauvegarde',async()=>{
 const s=battle(2,3,{seed:4,mods:['bombe']}),u=elite(s);u.prime={o:{x:1,y:1},cells:[{x:1,y:1},{x:2,y:1}],r:3};u.regen=0;
 const st=E.modState(u),j=JSON.parse(JSON.stringify(st));assert.deepEqual(j,st);assert.deepEqual(j.mods,['bombe']);
 assert.equal(E.modState(heroes(s)[0]),null);
 const txt=JSON.stringify(s.units.map(x=>({id:x.id,mods:x.mods,hp:x.hp})));assert.ok(txt.includes('"bombe"'));
 const{sanitizeSave}=await import('../src/savecore.js');const sv=sanitizeSave({v:2,lvl:50,xp:0,gold:0,items:[],z:{},st:{},up:{}});assert.ok(!JSON.stringify(sv).includes('mods'))});

test('combats Cauchemar complets (règles seules) : les 4 élites, R1 à R3, sans erreur ni combat interminable',()=>{
 for(const id of E.MOD_IDS)for(const[zi,i]of[[0,3],[1,4],[2,2]]){const s=battle(zi,i,{seed:zi*7+i,mods:[id]});let turn=-1,guard=0;
  const live=t=>s.units.filter(u=>u.team===t&&!u.dead);
  while(!r.outcome(s)&&s.round<=20&&guard++<2000){const nt=(turn+1)%s.order.length;if(nt===0&&turn>=0){s.round++;r.iceTick(s);r.lavaTick(s);r.waveTick(s)}turn=nt;const u=s.order[turn];if(u.dead)continue;r.beginTurn(u);r.poisonTick(s,u);if(u.dead)continue;
   if(u.team==='h'){const t=live('m').sort((a,b)=>r.man(a,u)-r.man(b,u))[0];if(t){const rc=r.reach(s,u,u.pm);let best=null;for(const[k]of rc.dist){const[x,y]=k.split(',').map(Number);if(r.okTarget(s,u,SP.slash,t,{x,y})){best={x,y};break}}if(best){u.x=best.x;u.y=best.y;while(u.pa>=SP.slash.pa&&!t.dead){r.payCost(u,SP.slash,t);r.applySpell(s,u,SP.slash,t)}}}}
   else{r.eliteTurn(s,u);if(!u.dead&&!r.outcome(s)){r.bossTurn(s,u);for(let g=0;g<6&&!u.dead;g++){const a=r.aiStep(s,u);if(!a)break;if(a.type==='cast'){r.payCost(u,a.sp,a.target);r.applySpell(s,u,a.sp,a.target);if(r.outcome(s))break;continue}const[x,y]=a.to.split(',').map(Number);u.pm-=r.reach(s,u,u.pm).dist.get(a.to);u.x=x;u.y=y}}}
   r.endTurn(u)}
  assert.ok(guard<2000,`${id} ${zi}.${i}`);assert.ok(s.units.every(u=>Number.isFinite(u.hp)&&u.hp>=0&&u.hp<=u.max),`${id} ${zi}.${i} PV`)}});

test('V5.10.2 : composition Cauchemar (2 élites différentes, +2 monstres, renfort global), campagne intacte',()=>{
 const a=battle(1,4,{seed:9,pool:E.MOD_IDS,n:0}),b=battle(1,4,{seed:9,pool:E.MOD_IDS,n:2,extra:2,hp:1.25,dmg:1.2});
 const ma=a.units.filter(u=>u.team==='m'),mb=b.units.filter(u=>u.team==='m'),el=mb.filter(u=>u.mods);
 assert.equal(mb.length,ma.length+2);assert.equal(el.length,2);assert.notEqual(el[0].mods[0],el[1].mods[0],'élites différentes');
 const n=mb.find(u=>!u.mods&&u.k===ma[0].k);if(n)assert.equal(n.max,Math.round(ma.find(u=>u.k===n.k).max*1.25));
 // mission à liste fixe d'ennemis : les monstres en plus viennent de la région
 const c=battle(0,0,{seed:2,pool:E.MOD_IDS,n:1,extra:2});assert.ok(c.units.filter(u=>u.team==='m').every(u=>u.k&&u.atk&&u.max>0))});
