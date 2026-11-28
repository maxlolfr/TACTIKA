// QA-03: reuse the existing deterministic pilot simulator, no gameplay changes.
import {spawnSync} from 'node:child_process';
import {ZONES,zlen,CM_ZONES} from '../src/data.js';
import assert from 'node:assert/strict';
const missions=ZONES.flatMap((z,zi)=>Array.from({length:zlen(z)},(_,i)=>zi+'.'+i));
assert.equal(missions.length,120);
let failures=0;
for(const profile of ['mid','opti'])for(const mode of ['normal','nightmare']){
 const list=mode==='normal'?missions:missions.filter(m=>Number(m.split('.')[0])<CM_ZONES);
 console.log('PROFILE',profile,'MODE',mode,'MISSIONS',list.length);
 for(let zi=0;zi<ZONES.length;zi++){
  const group=list.filter(m=>m.startsWith(zi+'.'));if(!group.length)continue;
  const env={...process.env,PROF:profile};
  delete env.CMSPEC;if(mode==='nightmare'){env.CMSPEC='1';env.TLVL='50';}
  const r=spawnSync(process.execPath,['tools/sim.mjs','pilote','10',group.join(',')],{env,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
  console.log('REGION',zi+1,r.stdout);if(r.status!==0){failures++;console.error(r.error||r.stderr);}
 }
}
process.exitCode=failures?1:0;
