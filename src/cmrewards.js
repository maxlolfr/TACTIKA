import {cmLabel} from './locales/nightmare-rewards.js';
// V5.24 : récompenses du Cauchemar, purement honorifiques (aucun gain de puissance : ni PV, ni dégâts, ni or, ni objet en plus).
// Sceaux : un par région, obtenu en battant son boss du Cauchemar (lu dans save.cm.z, rien à stocker).
// Trophées Cauchemar : liste à part (save.cm.tr), les 40 trophées de la Chronique et leur platine ne changent pas.
// Titres : débloqués par les sceaux et les trophées ; le joueur en porte un au plus (save.cm.t), affiché au camp et au Cristal.
// Compteurs (save.cm.k) : w victoires, ch champions vaincus, el élites vaincues. Rien n'est compté dans le bac à sable (?cauchemar).
import {ZONES,zlen,CM_ZONES} from './data.js';

const CZ=()=>ZONES.slice(0,CM_ZONES);
// couleur de chaque sceau (une par région, dans l'ordre de la carte)
export const SEAL_C=['#7ed957','#3fa34d','#4fc3f7','#b0bec5','#a1887f','#ce93d8','#ff7043','#ffca28','#80cbc4','#90caf9','#e0f7fa','#d9a6ff'];
export const sealOk=(save,zi)=>(save.cm?.z?.[ZONES[zi].id]||0)>=zlen(ZONES[zi]);
export const sealCount=save=>CZ().filter((_,i)=>sealOk(save,i)).length;
export const cmStars=save=>CZ().reduce((a,z)=>a+(save.cm?.st?.[z.id]||[]).reduce((x,y)=>x+(y||0),0),0);
export const cmStarsMax=()=>CZ().reduce((a,z)=>a+3*zlen(z),0);
const K=(s,k)=>s.cm?.k?.[k]||0,seals=n=>s=>sealCount(s)>=n,boss3=s=>CZ().some(z=>((s.cm?.st?.[z.id]||[])[zlen(z)-1]||0)>=3);
const map1=s=>[0,1,2,3,4,5].every(i=>sealOk(s,i));

// ---------- 12 trophées Cauchemar : 4 bronze, 4 argent, 3 or, 1 platine. Identifiants stables (ne jamais renuméroter). ----------
export const CM_TROPHIES=[
 {id:'cm_eveil',t:'b',n:'Premier pas dans l’ombre',ne:'First step into the dark',d:'Gagner un combat du Cauchemar',de:'Win a Nightmare fight',ok:s=>K(s,'w')>=1},
 {id:'cm_champion',t:'b',n:'Tueur de champion',ne:'Champion slayer',d:'Vaincre un champion',de:'Defeat a champion',ok:s=>K(s,'ch')>=1},
 {id:'cm_sceau1',t:'b',n:'Premier sceau',ne:'First seal',d:'Obtenir un sceau (boss de région du Cauchemar)',de:'Earn a seal (Nightmare region boss)',ok:seals(1)},
 {id:'cm_elites50',t:'b',n:'Chasseur d’élites',ne:'Elite hunter',d:'Vaincre 50 élites',de:'Defeat 50 elites',ok:s=>K(s,'el')>=50},
 {id:'cm_sceau3',t:'a',n:'Trois sceaux',ne:'Three seals',d:'Obtenir 3 sceaux',de:'Earn 3 seals',ok:seals(3)},
 {id:'cm_carte1',t:'a',n:'Carte I purifiée',ne:'Map I cleansed',d:'Obtenir les 6 sceaux de la carte I',de:'Earn the 6 seals of map I',ok:map1},
 {id:'cm_champ25',t:'a',n:'Fléau des champions',ne:'Bane of champions',d:'Vaincre 25 champions',de:'Defeat 25 champions',ok:s=>K(s,'ch')>=25},
 {id:'cm_boss3',t:'a',n:'Boss sans faute',ne:'Flawless boss',d:'Vaincre un boss du Cauchemar avec 3 ★',de:'Defeat a Nightmare boss with 3 ★',ok:boss3},
 {id:'cm_sceau12',t:'o',n:'Cauchemar vaincu',ne:'Nightmare vanquished',d:'Obtenir les 12 sceaux',de:'Earn all 12 seals',ok:seals(12)},
 {id:'cm_elites300',t:'o',n:'Brise-élites',ne:'Elite breaker',d:'Vaincre 300 élites',de:'Defeat 300 elites',ok:s=>K(s,'el')>=300},
 {id:'cm_etoiles',t:'o',n:'Étoiles noires',ne:'Black stars',d:'Réunir 300 ★ dans le Cauchemar',de:'Gather 300 ★ in the Nightmare',ok:s=>cmStars(s)>=300},
 {id:'cm_platine',t:'p',n:'Seigneur du Cauchemar',ne:'Lord of the Nightmare',d:'Obtenir tous les autres trophées du Cauchemar',de:'Earn every other Nightmare trophy',ok:s=>CM_TROPHIES.every(t=>t.id==='cm_platine'||s.cm?.tr?.[t.id])}];

// ---------- 8 titres (honorifiques) ----------
export const CM_TITLES=[
 {id:'eveille',n:'l’Éveillé',ne:'the Awakened',d:'Gagner un combat du Cauchemar',de:'Win a Nightmare fight',ok:s=>K(s,'w')>=1},
 {id:'porteur',n:'Porteur de sceaux',ne:'Seal-bearer',d:'3 sceaux',de:'3 seals',ok:seals(3)},
 {id:'purif',n:'Purificateur',ne:'Cleanser',d:'Les 6 sceaux de la carte I',de:'The 6 seals of map I',ok:map1},
 {id:'tueur',n:'Tueur de champions',ne:'Champion slayer',d:'25 champions vaincus',de:'25 champions defeated',ok:s=>K(s,'ch')>=25},
 {id:'ombre',n:'Marcheur des ombres',ne:'Shadow walker',d:'9 sceaux',de:'9 seals',ok:seals(9)},
 {id:'briseur',n:'Briseur de Cauchemar',ne:'Nightmare breaker',d:'Les 12 sceaux',de:'All 12 seals',ok:seals(12)},
 {id:'etoile',n:'Étoile noire',ne:'Black star',d:'300 ★ dans le Cauchemar',de:'300 ★ in the Nightmare',ok:s=>cmStars(s)>=300},
 {id:'seigneur',n:'Seigneur du Cauchemar',ne:'Lord of the Nightmare',d:'Trophée platine du Cauchemar',de:'Nightmare platinum trophy',ok:s=>!!s.cm?.tr?.cm_platine}];
export const titleOk=(save,id)=>{const t=CM_TITLES.find(x=>x.id===id);return!!(t&&t.ok(save))};
export const titleName=(save,id=save.cm?.t)=>{const t=CM_TITLES.find(x=>x.id===id);return t&&t.ok(save)?tN(save,t):''};
export const tN=(save,o)=>save.lang==='en'?o.ne:cmLabel(save.lang,o.n),tD=(save,o)=>save.lang==='en'?o.de:cmLabel(save.lang,o.d);

// nettoyage additif (appelé par save.js après save.cm) : compteurs finis et positifs, trophées connus, titre connu ou aucun
export function cleanCmRewards(save){const c=save.cm,o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 c.k=o(c.k);for(const k of Object.keys(c.k))if(!['w','ch','el'].includes(k)||!Number.isFinite(c.k[k])||c.k[k]<0)delete c.k[k];else c.k[k]=Math.floor(c.k[k]);
 c.tr=o(c.tr);for(const k of Object.keys(c.tr))if(!CM_TROPHIES.some(t=>t.id===k))delete c.tr[k];
 if(typeof c.t!=='string'||!CM_TITLES.some(t=>t.id===c.t))delete c.t;return c}
// nouveaux trophées Cauchemar (dans l'ordre de la liste, platine en dernier), horodatés dans cm.tr
export function checkCmTrophies(save,now=Date.now()){const got=[];for(const t of CM_TROPHIES)if(!save.cm.tr[t.id]&&t.ok(save)){save.cm.tr[t.id]=now;got.push(t.id)}return got}
const titlesNow=s=>CM_TITLES.filter(t=>t.ok(s)).map(t=>t.id);
// fin d'un combat du Cauchemar réel : compteurs, puis ce qui vient d'être obtenu (trophées, titres, sceau)
// o = {win, ch: champions vaincus, el: élites vaincues (champions compris), seal: indice de région dont le sceau vient d'être pris ou -1}
export function cmRecord(save,o){const before=new Set(titlesNow(save)),k=save.cm.k;
 if(o.win){k.w=(k.w||0)+1;k.ch=(k.ch||0)+(o.ch||0);k.el=(k.el||0)+(o.el||0)}
 const tr=checkCmTrophies(save),ti=titlesNow(save).filter(id=>!before.has(id));
 if(ti.length&&!save.cm.t)save.cm.t=ti[0]; // premier titre : porté d'office, le joueur en change au Cristal
 return{tr,ti,seal:o.seal??-1}}
// élites et champions vaincus d'un combat (les monstres à modificateur, u.mods ; u.champ pour les champions)
export function cmKills(units){let ch=0,el=0;for(const u of units)if(u.team==='m'&&u.mods&&u.dead&&!u.fled){el++;if(u.champ)ch++}return{ch,el}}
