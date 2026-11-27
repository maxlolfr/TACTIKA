// V5.01 : cœur pur de la sauvegarde (sans DOM ni localStorage) : lecture sûre, validation, codes d'export.
// Règle : ne jamais perdre une partie. Une lecture qui échoue renvoie null, l'appelant essaie la copie de secours.
export const MAX_RAW=4e6; // taille maximale acceptée (octets de texte) : au-delà, ce n'est pas une sauvegarde
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const num=(v,d,min=0)=>Number.isFinite(v)?Math.max(min,v):d;
// nettoie un objet reçu (JSON ou import) : renvoie une copie saine, ou null si ce n'est pas une sauvegarde Tactika
export function sanitizeSave(s){
 if(!isObj(s)||!Number.isFinite(s.lvl)||!Array.isArray(s.items))return null;
 const o={};
 for(const k of Object.keys(s)){if(k==='__proto__'||k==='constructor'||k==='prototype')continue;o[k]=s[k]}
 o.lvl=Math.max(1,Math.floor(o.lvl));
 o.xp=num(o.xp,0);o.gold=num(o.gold,0);o.fight=Math.max(1,Math.floor(num(o.fight,1,1)));
 if('pot' in o)o.pot=num(o.pot,0);
 for(const k of ['z','st','up'])if(!isObj(o[k]))o[k]=k==='z'?null:{}; // z absent = ancienne sauvegarde, reprise dans save.js
 if(o.z){for(const id of Object.keys(o.z))if(!Number.isFinite(o.z[id])||o.z[id]<0)delete o.z[id]}
 if(o.z===null)delete o.z;
 return o;
}
// texte -> sauvegarde saine, ou null (texte vide, trop gros, illisible ou invalide)
export function parseSave(raw){
 if(typeof raw!=='string'||!raw||raw.length>MAX_RAW)return null;
 try{return sanitizeSave(JSON.parse(raw))}catch(e){return null}
}
// code d'export (texte collable) et fichier : même contenu, base64 UTF-8 pour le code
export const encodeCode=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o))));
export function decodeCode(t){
 if(typeof t!=='string')return null;
 t=t.trim();if(!t||t.length>MAX_RAW*1.4)return null;
 try{return sanitizeSave(JSON.parse(decodeURIComponent(escape(atob(t)))))}catch(e){}
 return parseSave(t); // un fichier .json brut est accepté aussi
}
// lit la meilleure source parmi une liste de textes (principal d'abord, puis secours) ; renvoie {s,from} ou null
export function pickSave(raws){
 for(let i=0;i<raws.length;i++){const s=parseSave(raws[i]);if(s)return{s,from:i}}
 return null;
}
