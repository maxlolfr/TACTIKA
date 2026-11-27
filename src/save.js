// Sauvegarde locale (localStorage). `save` est un objet unique, modifié sur place.
import {ZONES,zlen} from './data.js';
import {cleanSp} from './talents.js';
import {cleanAttr,migratePrairie,migrateBois} from './rules.js';
export const save={v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:null,st:{},up:{}};
// sauvegarde illisible ou abîmée : on garde les valeurs par défaut plutôt que de planter
try{const s=JSON.parse(localStorage.getItem('landeTactique1'));if(s&&typeof s==='object'&&Number.isFinite(s.lvl)&&Array.isArray(s.items))Object.assign(save,s,{v:2})}catch(e){}
save.sp=cleanSp(save.sp); // spécialisations (V2.5) : absentes ou invalides = aucune
save.attr=cleanAttr(save.attr,save.lvl); // caractéristiques (V4.7c) : absentes = tous les points libres
if(!save.z)save.z={prairie:Math.min(4,save.fight-1)}; // reprise des anciennes sauvegardes
migratePrairie(save);migrateBois(save);
export const prog=id=>save.z[id]||0,unlocked=zi=>!ZONES[zi].soon&&(zi===0||prog(ZONES[zi-1].id)>=zlen(ZONES[zi-1]));
export function store(){try{localStorage.setItem('landeTactique1',JSON.stringify(save))}catch(e){}}
export function resetSave(){for(const k of Object.keys(save))delete save[k];Object.assign(save,{v:2,fight:1,lvl:1,xp:0,gold:0,items:[],z:{},st:{},up:{},sp:[null,null,null],pot:0,attr:cleanAttr(null,1),p10:1,b10:1});store()}
