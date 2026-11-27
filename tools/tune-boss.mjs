// V4.85 (lot 5) : réglage de DIFF.boss (data.js) par dichotomie : taux de victoire du profil mid sur le boss de chaque région.
// Usage : node tools/tune-boss.mjs <zones=3,4> [graines=8] ; cibles = milieu des fourchettes de NOTES.md V4.85. 5 essais × graines combats par région.
import {execFileSync} from 'node:child_process';
import {DIFF} from '../src/data.js';
const [zs='0',N='8']=process.argv.slice(2),sim=new URL('./sim.mjs',import.meta.url).pathname;
const goal=z=>z<=2?.875:z<=7?.675:z<=10?.53:.375;
function measure(z,b){const out=execFileSync('node',[sim,'pilote',N,z+'.9'],{env:{...process.env,PROF:'mid',BZ:`${z}=${b}`},encoding:'utf8'});
 const r=out.split('\n').find(l=>/^\| [A-Z]/.test(l)&&l.includes('| mid |')).split('|').map(x=>x.trim());return{w:+r[4].split('/')[0]/+N,hp:parseInt(r[7])}}
for(const z of zs.split(',').map(Number)){let lo=.4,hi=1.4,b=DIFF.boss[z],bestB=b,bestD=9;
 for(let it=0;it<5;it++){const r=measure(z,b.toFixed(2)),d=Math.abs(r.w-goal(z));console.log(`boss ${z} b=${b.toFixed(2)} victoires ${Math.round(100*r.w)} % PV ${r.hp} %`);
  if(d<bestD-1e-9||(Math.abs(d-bestD)<1e-9&&Math.abs(b-1)<Math.abs(bestB-1))){bestD=d;bestB=b}
  if(r.w<goal(z))hi=b;else lo=b;b=(lo+hi)/2}
 console.log(`=> boss ${z} : b ≈ ${bestB.toFixed(2)} (écart ${Math.round(100*bestD)} points)`)}
