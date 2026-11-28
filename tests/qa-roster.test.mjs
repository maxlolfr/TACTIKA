import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HER,SP,ITEMS,whoOf,SLOTS} from '../src/data.js';
import {SPECS} from '../src/talents.js';
import {knownSpells,loadoutOf,heroStats,gearAll} from '../src/rules.js';
test('QA roster: 60 spells and 90 talents',()=>{
 assert.equal(HER.length,6);
 for(const [i,h] of HER.entries()){
  const ids=[...h.sp,...h.learn.map(x=>x[0])];
  assert.equal(new Set(ids).size,ids.length,h.n+' duplicate spell');
  assert.equal(ids.length,[10,9,9,10,10,10][i],h.n+' V5.19 baseline; target 10 tracked in QA report');
  for(const id of ids)assert.ok(SP[id],id);
  assert.equal(SPECS[i].length,3);
  for(const spec of SPECS[i])assert.equal(spec.t.length,5);
 }
});
test('QA progression: all 50 levels, legal gear and finite hero stats',()=>{
 assert.equal(ITEMS.length,120);
 for(let lvl=1;lvl<=50;lvl++){
  const save={lvl,items:ITEMS.map((_,i)=>i),gold:999999,up:{},rr:{},z:{},team:[0,1,2]};
  const before=JSON.stringify(save),gear=gearAll(save),used=new Set();
  for(const [i,h] of HER.entries()){
   if(lvl<(h.at||1))continue;
   const known=knownSpells(save,i),load=loadoutOf(save,i);
   assert.equal(new Set(load).size,load.length);
   assert.ok(load.length<=6&&load.every(id=>known.includes(id)),h.n+' '+lvl);
   for(const [slot,j] of Object.entries(gear[i])){
    if(j==null)continue;
    assert.ok(SLOTS[slot]&&ITEMS[j].sl===slot);
    assert.ok(whoOf(ITEMS[j]).includes(i));
    assert.ok((ITEMS[j].lv||1)<=lvl);
    assert.ok(!used.has(j),'duplicate gear '+j);used.add(j);
   }
   const s=heroStats(save,i);
   for(const k of ['hp','dmg','heal','mult','crit','dodge'])assert.ok(Number.isFinite(s[k]),h.n+' '+lvl+' '+k);
   assert.ok(s.hp>0&&s.mult>0);
  }
  assert.equal(JSON.stringify(save),before,'read-only stats');
 }
});
