// V5.24 · récompenses du Cauchemar : sceaux, titres, trophées à part, aucun gain de puissance.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const R=await import('../src/cmrewards.js'),D=await import('../src/data.js'),C=await import('../src/chronicle.js'),r=await import('../src/rules.js');
const {ZONES,zlen,CM_ZONES}=D;
const mk=(o={})=>{const s={lang:'fr',cm:{z:{},st:{},b:{},...o}};R.cleanCmRewards(s);return s};
const sealAll=(s,n)=>{for(let i=0;i<n;i++)s.cm.z[ZONES[i].id]=zlen(ZONES[i])};

test('12 trophées Cauchemar (4/4/3/1), identifiants uniques, à part des 40 trophées de la Chronique',()=>{
 assert.equal(R.CM_TROPHIES.length,12);const n=t=>R.CM_TROPHIES.filter(x=>x.t===t).length;assert.deepEqual([n('b'),n('a'),n('o'),n('p')],[4,4,3,1]);
 assert.equal(new Set(R.CM_TROPHIES.map(t=>t.id)).size,12);assert.equal(C.TROPHIES.length,40,'Chronique inchangée');
 for(const t of R.CM_TROPHIES){assert.ok(!C.TROPHIES.some(x=>x.id===t.id));assert.ok(t.n&&t.ne&&t.d&&t.de,t.id)}
 for(const t of R.CM_TITLES)assert.ok(t.n&&t.ne&&t.d&&t.de,t.id)});

test('sceaux : un par région, lus dans la progression Cauchemar (boss battu), jamais dans la campagne normale',()=>{
 const s=mk();assert.equal(R.sealCount(s),0);s.cm.z.prairie=zlen(ZONES[0])-1;assert.equal(R.sealCount(s),0,'boss pas encore battu');
 s.cm.z.prairie=zlen(ZONES[0]);assert.equal(R.sealCount(s),1);s.z={prairie:99,bois:99};assert.equal(R.sealCount(s),1,'save.z ignoré');
 sealAll(s,CM_ZONES);assert.equal(R.sealCount(s),12);assert.equal(R.SEAL_C.length,CM_ZONES);
 assert.equal(R.cmStarsMax(),ZONES.slice(0,CM_ZONES).reduce((a,z)=>a+3*zlen(z),0))});

test('cmRecord : compteurs, trophées dans l’ordre, platine en dernier, premier titre porté d’office',()=>{
 const s=mk();let o=R.cmRecord(s,{win:1,ch:1,el:3,seal:-1});assert.deepEqual(o.tr,['cm_eveil','cm_champion']);assert.deepEqual(o.ti,['eveille']);assert.equal(s.cm.t,'eveille');
 assert.deepEqual(s.cm.k,{w:1,ch:1,el:3});o=R.cmRecord(s,{win:0,ch:5,el:5});assert.deepEqual(s.cm.k,{w:1,ch:1,el:3},'défaite : rien compté');assert.deepEqual(o.tr,[]);
 s.cm.t='eveille';sealAll(s,CM_ZONES);for(const z of ZONES.slice(0,CM_ZONES))s.cm.st[z.id]=Array(zlen(z)).fill(3);s.cm.k={w:400,ch:60,el:400};
 o=R.cmRecord(s,{win:1,ch:0,el:0,seal:11});assert.equal(o.tr.at(-1),'cm_platine');assert.equal(Object.keys(s.cm.tr).length,12);assert.equal(o.seal,11);
 assert.equal(s.cm.t,'eveille','le titre choisi n’est pas remplacé');assert.ok(R.titleOk(s,'seigneur'));assert.equal(R.titleName({...s,lang:'en'},'seigneur'),'Lord of the Nightmare')});

test('nettoyage : valeurs abîmées retirées, titre inconnu effacé, champs absents = vides',()=>{
 const s=mk({k:{w:-2,ch:'x',el:7.9,zz:3},tr:{cm_eveil:5,faux:1},t:'inconnu'});assert.deepEqual(s.cm.k,{el:7});assert.deepEqual(Object.keys(s.cm.tr),['cm_eveil']);assert.equal(s.cm.t,undefined);
 const e=mk({k:[1],tr:null});assert.deepEqual(e.cm.k,{});assert.deepEqual(e.cm.tr,{});assert.equal(R.titleName(e),'');
 const t=mk({t:'briseur'});assert.equal(R.titleName(t),'','titre non mérité : pas affiché')});

test('cmKills : élites et champions vaincus seulement (fuyards et vivants exclus)',()=>{
 const U=[{team:'m',mods:['ber'],dead:1},{team:'m',mods:['ber','gua'],champ:1,dead:1},{team:'m',mods:['reg'],dead:1,fled:1},{team:'m',mods:['exp']},{team:'m',dead:1},{team:'h',mods:['x'],dead:1}];
 assert.deepEqual(R.cmKills(U),{ch:1,el:2})});

test('aucun gain de puissance : le module ne touche ni statistiques, ni or, ni objets, ni XP',()=>{
 const src=readFileSync(new URL('../src/cmrewards.js',import.meta.url),'utf8');
 for(const w of ['save.gold','save.items','save.xp','save.lvl','heroStats','gainXp','.atk','.max'])assert.ok(!src.includes(w),w);
 const base={lvl:50,items:[],up:{},sp:[null,null,null,null,null,null]},s=mk();sealAll(s,CM_ZONES);R.cmRecord(s,{win:1,ch:30,el:300});
 assert.deepEqual(r.heroStats({...base,cm:s.cm},0),r.heroStats(base,0))});
