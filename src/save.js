// Sauvegarde locale (localStorage). `save` est un objet unique, modifié sur place.
import {ZONES} from './data.js';
export const save={fight:1,lvl:1,xp:0,gold:0,items:[],z:null};
try{const s=JSON.parse(localStorage.getItem('landeTactique1'));if(s)Object.assign(save,s)}catch(e){}
if(!save.z)save.z={prairie:Math.min(4,save.fight-1)}; // reprise des anciennes sauvegardes
export const prog=id=>save.z[id]||0,unlocked=zi=>!ZONES[zi].soon&&(zi===0||prog(ZONES[zi-1].id)>=4);
export function store(){try{localStorage.setItem('landeTactique1',JSON.stringify(save))}catch(e){}}
export function resetSave(){for(const k of Object.keys(save))delete save[k];Object.assign(save,{fight:1,lvl:1,xp:0,gold:0,items:[],z:{}});store()}
