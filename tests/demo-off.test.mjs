// V5.33 : sans ?demo, le jeu complet reste identique (un fichier à part : data.js est mis en cache par processus). npm test
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

test('jeu normal : DEMO faux, clé de sauvegarde et régions inchangées', async()=>{
 const {data,save,rules,quests}=await load('',{landeTactique1:JSON.stringify(full)});
 assert.equal(data.DEMO,false);assert.equal(save.KEY,'landeTactique1');assert.equal(save.save.lvl,12);
 assert.equal(save.unlocked(2),true,'la région 3 reste ouverte hors démo');
 assert.ok(quests.QUESTS.filter(q=>q.z>=2).some(q=>rules.questOpen({z:full.z,q:{}},q)));
});
