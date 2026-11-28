// V5.33 : démo publique (?demo). Régions 1 et 2 seulement, sauvegarde à part, pas de Cauchemar ; le jeu normal ne change pas. npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';

function fakeStorage(init={}){const m=new Map(Object.entries(init));
 return{m,getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v))},removeItem:k=>m.delete(k)}}
let n=0;
async function load(search,init){
 globalThis.location={search};globalThis.localStorage=fakeStorage(init);
 const q='?case='+(n++);
 const data=await import('../src/data.js'+q),save=await import('../src/save.js'+q),rules=await import('../src/rules.js'+q),quests=await import('../src/quests.js'+q);
 return{data,save,rules,quests};
}
const full={v:2,fight:3,lvl:12,xp:0,gold:99,items:[],z:{prairie:10,bois:10,cote:10,monts:10},st:{},up:{},storySeen:{epilogue:1}};

test('démo : seules les régions 1 et 2 sont ouvertes, même avec une partie complète', async()=>{
 const {data,save}=await load('?demo');
 assert.equal(data.DEMO,true);assert.equal(data.DEMO_ZONES,2);
 const all=data.ZONES.map((_,i)=>save.unlocked(i));
 assert.equal(all[0],true);
 assert.ok(all.slice(2).every(v=>v===false),'les régions 3 à 12 restent verrouillées');
});
test('démo : la région 2 s’ouvre en finissant la région 1', async()=>{
 const {data,save}=await load('?demo');
 assert.equal(save.unlocked(1),false);
 save.setProg(data.ZONES[0].id,data.zlen(data.ZONES[0]));
 assert.equal(save.unlocked(1),true);
 save.setProg(data.ZONES[1].id,data.zlen(data.ZONES[1]));
 assert.equal(save.unlocked(2),false,'finir la région 2 n’ouvre pas la 3 en démo');
});
test('démo : sauvegarde à part et partie complète jamais lue', async()=>{
 const {save}=await load('?demo',{landeTactique1:JSON.stringify(full)});
 assert.equal(save.KEY,'landeTactique1_demo');
 assert.equal(save.save.lvl,1,'on repart de zéro, la vraie partie n’est pas reprise');
 assert.equal(globalThis.localStorage.getItem('landeTactique1'),JSON.stringify(full),'la vraie sauvegarde n’est pas touchée');
});
test('démo : pas de Cauchemar, même avec le drapeau et l’épilogue vus', async()=>{
 const {data,save}=await load('?demo&cauchemar',{landeTactique1:JSON.stringify(full),landeTactique1_mode:'cm'});
 assert.equal(data.CM_DEV,null);assert.equal(save.canNightmare(),false);
});
test('démo : quêtes des régions 3+ fermées, celles des régions 1 et 2 ouvertes', async()=>{
 const {data,rules,quests}=await load('?demo');
 const s={z:{prairie:10,bois:10,cote:10,monts:10},q:{}};
 for(const q of quests.QUESTS){const ok=rules.questOpen(s,q);
  if(q.z>=data.DEMO_ZONES)assert.equal(ok,false,q.id+' doit être fermée en démo');}
 assert.ok(quests.QUESTS.filter(q=>q.z<2).some(q=>rules.questOpen(s,q)),'les quêtes des régions 1 et 2 s’ouvrent');
});
test('démo : le défi du jour reste dans les régions 1 et 2', async()=>{
 const {data,rules}=await load('?demo');
 const s={z:Object.fromEntries(data.ZONES.map(z=>[z.id,data.zlen(z)]))};
 for(let d=0;d<10;d++)assert.ok(rules.dailyFight(s,d).zi<2);
});
