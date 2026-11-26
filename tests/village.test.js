import {test} from 'node:test';import assert from 'node:assert/strict';
import {crystalState} from '../src/rules.js';import {ZONES,zlen} from '../src/data.js';
test('cristal : 5 états selon les régions terminées',()=>{
 const s=n=>crystalState({z:Object.fromEntries(ZONES.slice(0,n).map(z=>[z.id,zlen(z)]))});
 assert.deepEqual([0,1,2,3,4,5,6].map(s),[1,2,3,3,4,4,5]);assert.equal(crystalState({}),1)});
