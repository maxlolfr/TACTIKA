// V5.01 : robustesse de la sauvegarde (lecture sûre, copie de secours, validation, export/import, erreurs de stockage). npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeSave,parseSave,encodeCode,decodeCode,pickSave,MAX_RAW} from '../src/savecore.js';

let n=0;
function fakeStorage(init={},opt={}){const m=new Map(Object.entries(init));
 return{m,getItem:k=>{if(opt.noRead)throw new Error('blocked');return m.has(k)?m.get(k):null},
  setItem:(k,v)=>{if(opt.noWrite)throw new Error('QuotaExceededError');m.set(k,String(v))},removeItem:k=>m.delete(k)}}
async function load(init,opt){globalThis.localStorage=fakeStorage(init,opt);return {ls:globalThis.localStorage,mod:await import('../src/save.js?case='+(n++))}}
const good=(o={})=>JSON.stringify({v:2,fight:3,lvl:7,xp:10,gold:250,items:[1,2],z:{prairie:5},st:{},up:{},...o});

test('sanitizeSave : refuse ce qui n’est pas une sauvegarde, répare les champs numériques', () => {
 for(const bad of [null,undefined,0,'x',[],{},{lvl:3},{items:[]},{lvl:'3',items:[]},{lvl:NaN,items:[]}])assert.equal(sanitizeSave(bad),null);
 const s=sanitizeSave({lvl:2.7,items:[],gold:'beaucoup',xp:-5,fight:0,z:{a:3,b:'x',c:-1,d:NaN},st:5,up:null});
 assert.equal(s.lvl,2);assert.equal(s.gold,0);assert.equal(s.xp,0);assert.equal(s.fight,1);
 assert.deepEqual(s.z,{a:3});assert.deepEqual(s.st,{});assert.deepEqual(s.up,{});
 assert.equal(sanitizeSave({lvl:1,items:[]}).z,undefined,'z absent (ancienne sauvegarde) reste absent');
});
test('sanitizeSave : clés dangereuses retirées, contenu additif conservé', () => {
 const s=sanitizeSave(JSON.parse('{"lvl":1,"items":[],"__proto__":{"x":1},"constructor":{"y":1},"cr":{"t":[1]},"ms":{"a":2}}'));
 assert.equal(Object.getPrototypeOf(s),Object.prototype);assert.ok(!Object.hasOwn(s,'__proto__'));assert.ok(!Object.hasOwn(s,'constructor'));
 assert.deepEqual(s.cr,{t:[1]});assert.deepEqual(s.ms,{a:2});assert.equal({}.x,undefined);
});
test('parseSave : texte vide, trop gros, tronqué ou invalide = null', () => {
 for(const r of [null,'','{',good().slice(0,40),'[]','null','{"lvl":1}',' '.repeat(10),'x'.repeat(MAX_RAW+1)])assert.equal(parseSave(r),null);
 assert.equal(parseSave(good()).lvl,7);
});
test('export / import : code base64 aller-retour, fichier JSON brut, accents', () => {
 const o={v:2,lvl:12,items:['é',{a:'ü'}],gold:5,lang:'fr',z:{prairie:2}};
 assert.deepEqual(decodeCode(encodeCode(o)),sanitizeSave(o));
 assert.equal(decodeCode(JSON.stringify(o)).lvl,12);assert.equal(decodeCode('  '+encodeCode(o)+'\n').lvl,12);
 for(const bad of ['','!!!',encodeCode({lvl:1}),'{"lvl":1}',null,42,'x'.repeat(MAX_RAW*2)])assert.equal(decodeCode(bad),null);
});
test('pickSave : principal d’abord, sinon secours', () => {
 assert.equal(pickSave([good({lvl:9}),good({lvl:3})]).from,0);
 const r=pickSave(['{abîmé',good({lvl:3})]);assert.equal(r.from,1);assert.equal(r.s.lvl,3);
 assert.equal(pickSave(['{abîmé',null]),null);
});

test('chargement normal : la partie est lue et une copie de secours est créée', async () => {
 const {ls,mod}=await load({landeTactique1:good()});
 assert.equal(mod.save.lvl,7);assert.equal(mod.storeState.loadFrom,'main');assert.equal(ls.m.get('landeTactique1_bak'),good());
});
test('aucune sauvegarde : partie neuve, rien n’est écrit', async () => {
 const {ls,mod}=await load({});assert.equal(mod.storeState.loadFrom,'new');assert.equal(mod.save.lvl,1);assert.equal(ls.m.size,0);
});
test('principal abîmé + secours valide : secours restauré, original gardé à part', async () => {
 const {ls,mod}=await load({landeTactique1:'{"lvl":7,"items":[',landeTactique1_bak:good({lvl:5})});
 assert.equal(mod.storeState.loadFrom,'backup');assert.equal(mod.save.lvl,5);assert.equal(ls.m.get('landeTactique1_corrupt'),'{"lvl":7,"items":[');
 assert.ok(mod.store());assert.equal(JSON.parse(ls.m.get('landeTactique1')).lvl,5);
});
test('principal abîmé sans secours : partie neuve mais l’original n’est jamais écrasé', async () => {
 const raw='{"lvl":30,"items":[1,2,3],"gold":99999';
 const {ls,mod}=await load({landeTactique1:raw});
 assert.equal(mod.storeState.loadFrom,'corrupt');assert.equal(mod.save.lvl,1);mod.store();
 assert.equal(ls.m.get('landeTactique1_corrupt'),raw);assert.equal(JSON.parse(ls.m.get('landeTactique1')).lvl,1);
});
test('sauvegarde incomplète ou aux champs faux : réparée sans planter', async () => {
 const {mod}=await load({landeTactique1:JSON.stringify({lvl:4,items:[],gold:'x',z:{prairie:'?'},sp:'oups',attr:7,lang:'de',cr:12,storySeen:[1]})});
 assert.equal(mod.save.lvl,4);assert.equal(mod.save.gold,0);assert.equal(mod.save.lang,'fr');assert.equal(typeof mod.prog('prairie'),'number');
});
test('anciennes sauvegardes minimales (V1) : chargées, progression de la prairie reprise', async () => {
 const {mod}=await load({landeTactique1:JSON.stringify({fight:4,lvl:3,xp:0,gold:20,items:[]})});
 assert.equal(mod.save.lvl,3);assert.equal(mod.storeState.loadFrom,'main');assert.equal(mod.prog('prairie'),3);
});
test('erreur d’écriture : store() renvoie false, ne lève rien, signale l’état', async () => {
 const {mod}=await load({landeTactique1:good()},{noWrite:true});
 assert.equal(mod.store(),false);assert.equal(mod.storeState.ok,false);
 globalThis.localStorage=fakeStorage({});assert.equal(mod.store(),true);assert.equal(mod.storeState.ok,true);
});
test('stockage bloqué en lecture : partie neuve sans plantage', async () => {
 const {mod}=await load({landeTactique1:good()},{noRead:true});assert.equal(mod.save.lvl,1);assert.equal(mod.storeState.loadFrom,'new');
});
test('plein : l’écriture réessaie après avoir libéré la copie du texte abîmé', async () => {
 const ls=fakeStorage({landeTactique1:good(),landeTactique1_corrupt:'x'});let full=true;
 const set=ls.setItem;ls.setItem=(k,v)=>{if(full&&ls.m.has('landeTactique1_corrupt'))throw new Error('Quota');set(k,v)};
 globalThis.localStorage=ls;const mod=await import('../src/save.js?case='+(n++));
 mod.save.gold=777;assert.equal(mod.store(),true);assert.equal(JSON.parse(ls.m.get('landeTactique1')).gold,777);
});
test('copie de secours rafraîchie avec l’état précédent, restaurable', async () => {
 const {ls,mod}=await load({landeTactique1:good()});assert.equal(mod.hasBackup(),true);
 ls.m.set('landeTactique1','{abîmé');assert.equal(mod.restoreBackup(),true);assert.equal(JSON.parse(ls.m.get('landeTactique1')).lvl,7);assert.equal(ls.m.get('landeTactique1_corrupt'),'{abîmé');
 ls.m.delete('landeTactique1_bak');assert.equal(mod.hasBackup(),false);assert.equal(mod.restoreBackup(),false);
});
test('import : la partie actuelle devient la copie de secours (import annulable)', async () => {
 const {ls,mod}=await load({landeTactique1:good({lvl:7})});
 assert.equal(mod.importSave(sanitizeSave(JSON.parse(good({lvl:20})))),true);
 assert.equal(JSON.parse(ls.m.get('landeTactique1')).lvl,20);assert.equal(JSON.parse(ls.m.get('landeTactique1_bak')).lvl,7);
});
test('resetSave puis store : la partie est bien remise à zéro et lisible', async () => {
 const {ls,mod}=await load({landeTactique1:good()});mod.resetSave();
 const s=parseSave(ls.m.get('landeTactique1'));assert.equal(s.lvl,1);assert.deepEqual(s.items,[]);
});
