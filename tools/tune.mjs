// V4.85 (lot 5) : réglage automatique de DIFF (data.js) région par région, par dichotomie, avec le simulateur.
// Usage : node tools/tune.mjs <zones=0,1,2> [graines=4] [missions=4,7,8] [cible PV=0.45]
// Pour chaque région : k (PV et dégâts des monstres ×k) tel que le profil mid gagne au moins 75 % des missions avec ~45 % de PV restants.
// 4 essais × graines × missions combats par région (48 avec les valeurs par défaut) : respecte le budget de 100 combats par étape.
import {execFileSync} from 'node:child_process';
const [zs='0',N='4',ms='4,7,8',tg='0.45']=process.argv.slice(2),T=+tg,sim=new URL('./sim.mjs',import.meta.url).pathname;
function measure(z,k){const out=execFileSync('node',[sim,'pilote',N,ms.split(',').map(i=>z+'.'+i).join(',')],{env:{...process.env,PROF:'mid',DZ:`${z}=${k}/${k}`},encoding:'utf8'});
 const rows=out.split('\n').filter(l=>/^\| [A-Z]/.test(l)&&l.includes('| mid |')).map(l=>l.split('|').map(x=>x.trim()));
 const w=rows.reduce((a,r)=>a+ +r[4].split('/')[0],0)/(rows.length*+N),hp=rows.reduce((a,r)=>a+parseInt(r[7]),0)/rows.length/100;return{w,hp}}
for(const z of zs.split(',').map(Number)){let lo=.9,hi=2.4,k=1.3,best=null;
 for(let it=0;it<4;it++){const r=measure(z,k.toFixed(2));console.log(`région ${z} k=${k.toFixed(2)} victoires ${Math.round(100*r.w)} % PV ${Math.round(100*r.hp)} %`);
  const ok=r.w>=.75&&Math.abs(r.hp-T)<=.07;if(ok&&(!best||k>best))best=k;
  if(r.w<.75||r.hp<T-.05)hi=k;else lo=k;k=(lo+hi)/2}
 console.log(`=> région ${z} : k ≈ ${(best??(lo+hi)/2).toFixed(2)}${best?'':' (non convergé)'}`)}
