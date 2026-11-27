// V4.39 : maîtrise des sorts (spec : docs/studio/tactika/mecaniques/V4.39-maitrise.md du studio).
// Table par identifiant de sort : [type, bonus rang II, bonus rang III, libellé]. Les bonus sont comptés par rapport au rang I
// et ne se cumulent pas entre rangs. Ajouter un héros = ajouter ses sorts ici. Orion depuis la V4.39 ; Kael, Fenn, Aelis (sorts de dégâts, soins, bouclier) depuis la V4.45.
import {SP,HER} from './data.js';
import {knownSpells} from './rules.js';
export const MASTERY={
 arcane:['dmg',.05,.1],flame:['dmg',.05,.1,'dégâts directs'],frost:['dmg',.05,.1],fireball:['dmg',.05,.1,'dégâts directs'],
 icewall:['wall',.15,.3],blink:['range',1,2],weaken:['weak',.02,.04],nova:['dmg',.05,.1],glyph:['dmg',.05,.1],storm:['dmg',.05,.1],
 // V4.45 : Kael, Fenn, Aelis, valeurs proposées par Max et ChatGPT (dégâts directs +5/+10 %, soins individuels +5/+10 %, collectifs +3/+6 %, protections +10/+20 %).
 // Sorts utilitaires (Rempart, Provocation, Contre-attaque, Rage, Bottes, Repli, Piège, Aura, Purification) : en attente des valeurs de ChatGPT.
 slash:['dmg',.05,.1],smash:['dmg',.05,.1],charge:['dmg',.05,.1],whirl:['dmg',.05,.1],sunder:['dmg',.05,.1,'dégâts directs'],judge:['dmg',.05,.1],
 shot:['dmg',.05,.1],volley:['dmg',.05,.1],pshot:['dmg',.05,.1],venomarrow:['dmg',.05,.1,'dégâts directs'],icearrow:['dmg',.05,.1],blastarrow:['dmg',.05,.1],rain:['dmg',.05,.1],
 venom:['dmg',.05,.1,'dégâts directs'],roots:['dmg',.05,.1],moon:['dmg',.05,.1],heal:['heal',.05,.1],mheal:['heal',.03,.06],bless:['heal',.03,.06],ward:['ward',.1,.2],
 // V4.53 Nyra et V4.54 Lyria : mêmes valeurs que les autres héros (dégâts directs +5/+10 %, soins +5/+10 %, boucliers +10/+20 %). Sorts utilitaires : en attente de ChatGPT.
 dagger:['dmg',.05,.1],backstab:['dmg',.05,.1],toxin:['dmg',.05,.1,'dégâts directs'],smoke:['dmg',.05,.1,'dégâts directs'],twin:['dmg',.05,.1],execute:['dmg',.05,.1],dance:['dmg',.05,.1],
 hammer:['dmg',.05,.1],smite:['dmg',.05,.1],light:['heal',.05,.1],rescue:['heal',.05,.1],purge:['heal',.05,.1],aegis:['ward',.1,.2]};
export const MAST_COST=[0,0,2,5]; // points dépensés pour atteindre le rang r (II = 2, III = 2 + 3)
export const mastPts=lvl=>Math.max(0,Math.floor(((lvl||1)-1)/2)); // 1 point tous les 2 niveaux gagnés, 24 au niveau 50
export const nextPtLvl=lvl=>lvl%2?lvl+2:lvl+1;
export const hasMastery=i=>!!HER[i]&&[...HER[i].sp,...(HER[i].learn||[]).map(([id])=>id)].some(id=>MASTERY[id]);
const ranks=(save,i)=>save.ms?.[i]||{};
export const rankOf=(save,i,id)=>{const r=ranks(save,i)[id];return r===2||r===3?r:1};
export const mastSpent=(save,i)=>Object.keys(ranks(save,i)).reduce((a,id)=>a+MAST_COST[rankOf(save,i,id)],0);
export const mastLeft=(save,i)=>Math.max(0,mastPts(save.lvl)-mastSpent(save,i));
export const canRaise=(save,i,id)=>{const r=rankOf(save,i,id);return!!MASTERY[id]&&r<3&&knownSpells(save,i).includes(id)&&MAST_COST[r+1]-MAST_COST[r]<=mastLeft(save,i)};
export function raise(save,i,id){if(!canRaise(save,i,id))return 0;const m=save.ms||(save.ms={});m[i]={...ranks(save,i),[id]:rankOf(save,i,id)+1};return 1}
export function resetMast(save,i){if(!save.ms)return;delete save.ms[i];if(!Object.keys(save.ms).length)delete save.ms}
// sauvegarde ancienne ou abîmée : retire ce qui ne vaut rien ; budget dépassé = maîtrise du héros rendue en entier. Appliquer deux fois ne change rien.
// Les héros absents de HER (Orion hors aperçu) sont laissés tels quels.
export function cleanMast(save){const v=save.ms;if(!v||typeof v!=='object'||Array.isArray(v)){delete save.ms;return}
 for(const k of Object.keys(v)){const i=+k;if(!HER[i])continue;const o=v[k];if(!o||typeof o!=='object'){delete v[k];continue}
  const known=knownSpells(save,i),ok={};for(const id in o)if(MASTERY[id]&&known.includes(id)&&(o[id]===2||o[id]===3))ok[id]=o[id];
  v[k]=ok;if(!Object.keys(ok).length||mastSpent(save,i)>mastPts(save.lvl))delete v[k]}
 if(!Object.keys(v).length)delete save.ms}
// sort `sp` (talents déjà appliqués) au rang r. Additif sur la base du rang I : le talent et la maîtrise ne se multiplient jamais.
export function mastered(sp,id,r){const m=MASTERY[id];if(!m||(r!==2&&r!==3))return sp;const v=m[r-1],b=SP[id];
 if(m[0]==='dmg')return{...sp,k:(sp.k||1)+v}; // dégâts directs (sp.k) : brûlure et poison inchangés
 if(m[0]==='heal')return{...sp,hk:(sp.hk||1)+v}; // V4.45 : soins du sort
 if(m[0]==='ward')return{...sp,ward:[sp.ward[0]+b.ward[0]*v,sp.ward[1]]};
 if(m[0]==='wall')return{...sp,wall:{...sp.wall,hp:sp.wall.hp+b.wall.hp*v}};
 if(m[0]==='range')return{...sp,r:[sp.r[0],sp.r[1]+v]};
 if(m[0]==='weak'){const p=Math.round((sp.weaken[0]+v)*100)/100;return{...sp,weaken:[p,sp.weaken[1]],d:sp.d.replace(/\d+ %/,Math.round(p*100)+' %')}}
 return sp}
export const masteredFor=(save,i,id,sp)=>mastered(sp,id,rankOf(save,i,id));
// texte du bonus d'un rang (par rapport au rang I)
export function mastTxt(id,r){const m=MASTERY[id];if(!m||r<2)return'effet de base';const v=m[r-1];
 return m[0]==='range'?`+${v} case${v>1?'s':''} de portée`:m[0]==='weak'?`réduction ${Math.round((SP[id].weaken[0]+v)*100)} % au lieu de ${Math.round(SP[id].weaken[0]*100)} %`:`+${Math.round(v*100)} % ${m[3]||{wall:'PV du mur',heal:'soins',ward:'bouclier'}[m[0]]||'dégâts'}`}
