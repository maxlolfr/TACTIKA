// Sauvegarde locale (localStorage). `save` est un objet unique, modifié sur place.
import {ZONES,zlen,PREVIEW,CM_DEV,CM_ZONES,CM_PILOTS,CM_FLAG,cmEligible} from './data.js';
import {normalizeLanguage} from './locales/languages.js';
import {cleanSp} from './talents.js';
import {cleanMast} from './mastery.js';
import {cleanStory} from './story.js';
import {cleanChron} from './chronicle.js';
import {cleanCmRewards} from './cmrewards.js';
import {pickSave,parseSave} from './savecore.js';
import {cleanAttr,migratePrairie,migrateBois,migrateCote,migrateMonts,migrateChateau} from './rules.js';
export const save={v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:null,st:{},up:{}};
// V5.01 : lecture sûre. Principal -> copie de secours (_bak) ; un texte abîmé est mis de côté (_corrupt), jamais écrasé en silence.
// V4.29 : l'aperçu de la région 7 a sa propre sauvegarde, copiée de la vraie à la première ouverture : la vraie n'est jamais écrite
export const KEY=CM_DEV?.dev?'landeTactique1_cauchemar':PREVIEW?'landeTactique1_braise':'landeTactique1'; // V5.10 : l'accès Cauchemar a sa propre sauvegarde
export const KB=KEY+'_bak',KC=KEY+'_corrupt';
export const storeState={ok:true,err:null,loadFrom:'new'}; // loadFrom : new | main | backup | corrupt
const rd=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const wr=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
let lastGood=null,lastBak=0;
{const main=rd(KEY)||rd('landeTactique1'),r=pickSave([main,rd(KB)]);
 if(r){Object.assign(save,r.s,{v:2});storeState.loadFrom=r.from?'backup':'main';
  if(r.from===0){lastGood=main;wr(KB,main)} // point de retour : l'état au début de cette session
  else{lastGood=rd(KB);if(main)wr(KC,main)}} // le principal était abîmé : on le garde de côté, la copie de secours est restaurée
 else if(main){storeState.loadFrom='corrupt';wr(KC,main)}} // illisible et sans secours : valeurs par défaut, mais l'original reste récupérable
save.sp=cleanSp(save.sp); // spécialisations (V2.5) : absentes ou invalides = aucune
save.attr=cleanAttr(save.attr,save.lvl); // caractéristiques (V4.7c) : absentes = tous les points libres
if(!save.z)save.z={prairie:Math.min(4,save.fight-1)}; // reprise des anciennes sauvegardes
migratePrairie(save);migrateBois(save);migrateCote(save);migrateMonts(save);migrateChateau(save);
if(PREVIEW){save.lvl=Math.max(save.lvl,21);save.attr=cleanAttr(save.attr,save.lvl);for(const z of ZONES)if(!z.map)save.z[z.id]=zlen(z)} // carte I terminée, équipe niveau 21 au moins
if(CM_DEV?.dev){save.lvl=50;save.xp=0;save.attr=cleanAttr(save.attr,save.lvl);for(const z of ZONES)save.z[z.id]=zlen(z)} // V5.10 : équipe de fin de campagne, toutes les régions ouvertes
// V5.14 : progression Cauchemar (champ additif cm : z = étapes par région, st = étoiles, b = boss pilotes vaincus), jamais mêlée à save.z
{const c=save.cm&&typeof save.cm==='object'?save.cm:{},n=o=>o&&typeof o==='object'&&!Array.isArray(o)?o:{};save.cm={z:n(c.z),st:n(c.st),b:n(c.b),k:c.k,tr:c.tr,t:c.t};cleanCmRewards(save); // V5.24 : + k (compteurs), tr (trophées Cauchemar), t (titre porté)
 for(const k of Object.keys(save.cm.z))if(!Number.isFinite(save.cm.z[k])||save.cm.z[k]<0)delete save.cm.z[k];
 if(CM_DEV?.dev)for(let i=0;i<CM_ZONES;i++)save.cm.z[ZONES[i].id]=zlen(ZONES[i])} // bac à sable : régions 1 à 3 et boss pilotes ouverts
save.lang=normalizeLanguage(save.lang);
cleanStory(save); // V4.80 : scènes du scénario V2 déjà vues (additif, ids validés, anciennes sauvegardes : rien à rejouer)
cleanChron(save); // V4.86 : Chronique (champ additif cr : statistiques, bestiaire, collection, trophées)
cleanMast(save); // V4.39 : maîtrise des sorts (champ facultatif ms), après le niveau de l'aperçu
export const zmap=()=>CM_DEV?save.cm.z:save.z; // V5.14 : en Cauchemar, la carte lit la progression Cauchemar
export const prog=id=>zmap()[id]||0,unlocked=zi=>!ZONES[zi].soon&&!(CM_DEV&&zi>=CM_ZONES)&&(zi===0||prog(ZONES[zi-1].id)>=zlen(ZONES[zi-1]));
export const setProg=(id,v)=>{zmap()[id]=v};
// boss pilotes : le premier quand les 3 régions du Cauchemar sont finies, puis chacun après le précédent (tous ouverts en bac à sable)
export const cmDone=()=>ZONES.slice(0,CM_ZONES).every(z=>(save.cm.z[z.id]||0)>=zlen(z));
export const cmBossOpen=k=>!!CM_DEV&&(CM_DEV.dev||cmDone()&&CM_PILOTS.slice(0,k).every(b=>save.cm.b[b.id]));
export const canNightmare=()=>!PREVIEW&&cmEligible(save);
// passage d'un monde à l'autre : drapeau puis rechargement (le mode est fixé au démarrage)
export function setNightmare(on){try{if(on)localStorage.setItem(CM_FLAG,'cm');else localStorage.removeItem(CM_FLAG)}catch(e){}}
// avertissement non bloquant quand l'écriture échoue (stockage plein ou bloqué) : au plus une fois par minute
let warnAt=0;
function warn(){if(typeof document==='undefined'||Date.now()-warnAt<60000)return;warnAt=Date.now();
 try{let d=document.getElementById('svwarn');if(!d){d=document.createElement('div');d.id='svwarn';d.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#7a1f12;color:#fff;font:700 14px system-ui,sans-serif;padding:10px 14px;border-radius:10px;text-align:center';d.onclick=()=>d.remove();document.body.append(d)}
  d.textContent=save.lang==='en'?'⚠ Cannot save (storage full or blocked). Export your game in Settings → Save, then tap to close.':'⚠ Sauvegarde impossible (stockage plein ou bloqué). Exporte ta partie dans Réglages → Sauvegarde, puis touche ici pour fermer.'}catch(e){}}
export function store(){
 let txt;
 try{txt=JSON.stringify(save)}catch(e){storeState.ok=false;storeState.err=e;warn();return false}
 const now=Date.now();
 if(lastGood&&now-lastBak>45000){if(wr(KB,lastGood))lastBak=now} // copie de secours = état précédent, rafraîchie au plus toutes les 45 s
 let ok=wr(KEY,txt);
 if(!ok){try{localStorage.removeItem(KC)}catch(e){}ok=wr(KEY,txt)} // plein : on libère la copie du texte abîmé et on réessaie une fois
 if(ok){lastGood=txt;storeState.ok=true;storeState.err=null;const d=typeof document!=='undefined'&&document.getElementById('svwarn');if(d)d.remove();return true}
 storeState.ok=false;storeState.err='write';warn();return false}
// copie de secours : existe-t-elle et est-elle lisible ? la restauration remplace le principal puis l'appelant recharge
export const hasBackup=()=>!!parseSave(rd(KB));
export function restoreBackup(){const b=rd(KB);if(!parseSave(b))return false;const cur=rd(KEY);if(cur)wr(KC,cur);return wr(KEY,b)}
// import validé (code ou fichier) : la partie actuelle devient la copie de secours, donc l'import est annulable
export function importSave(o){const txt=JSON.stringify(o),cur=rd(KEY);if(cur&&parseSave(cur))wr(KB,cur);return wr(KEY,txt)}
export function resetSave(){for(const k of Object.keys(save))delete save[k];Object.assign(save,{v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:{},st:{},up:{},sp:cleanSp(),pot:0,attr:cleanAttr(null,1),p10:1,b10:1,c10:1,m10:1,h10:1,storySeen:{}});cleanChron(save);store()}
