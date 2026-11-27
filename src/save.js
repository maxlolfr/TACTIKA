// Sauvegarde locale (localStorage). `save` est un objet unique, modifié sur place.
import {ZONES,zlen,PREVIEW} from './data.js';
import {cleanSp} from './talents.js';
import {cleanMast} from './mastery.js';
import {cleanAttr,migratePrairie,migrateBois,migrateCote,migrateMonts,migrateChateau} from './rules.js';
export const save={v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:null,st:{},up:{}};
// sauvegarde illisible ou abîmée : on garde les valeurs par défaut plutôt que de planter
// V4.29 : l'aperçu de la région 7 a sa propre sauvegarde, copiée de la vraie à la première ouverture : la vraie n'est jamais écrite
export const KEY=PREVIEW?'landeTactique1_braise':'landeTactique1';
try{const s=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('landeTactique1'));if(s&&typeof s==='object'&&Number.isFinite(s.lvl)&&Array.isArray(s.items))Object.assign(save,s,{v:2})}catch(e){}
save.sp=cleanSp(save.sp); // spécialisations (V2.5) : absentes ou invalides = aucune
save.attr=cleanAttr(save.attr,save.lvl); // caractéristiques (V4.7c) : absentes = tous les points libres
if(!save.z)save.z={prairie:Math.min(4,save.fight-1)}; // reprise des anciennes sauvegardes
migratePrairie(save);migrateBois(save);migrateCote(save);migrateMonts(save);migrateChateau(save);
if(PREVIEW){save.lvl=Math.max(save.lvl,21);save.attr=cleanAttr(save.attr,save.lvl);for(const z of ZONES)if(!z.map)save.z[z.id]=zlen(z)} // carte I terminée, équipe niveau 21 au moins
cleanMast(save); // V4.39 : maîtrise des sorts (champ facultatif ms), après le niveau de l'aperçu
export const prog=id=>save.z[id]||0,unlocked=zi=>!ZONES[zi].soon&&(zi===0||prog(ZONES[zi-1].id)>=zlen(ZONES[zi-1]));
export function store(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}
export function resetSave(){for(const k of Object.keys(save))delete save[k];Object.assign(save,{v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:{},st:{},up:{},sp:cleanSp(),pot:0,attr:cleanAttr(null,1),p10:1,b10:1,c10:1,m10:1,h10:1});store()}
