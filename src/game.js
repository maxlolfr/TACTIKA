// État partagé de la partie en cours (lu par le rendu, les tours et l'interface).
import {newBattle} from './rules.js';
export const G={
 phase:'camp',      // camp | fight | win | lose
 busy:false,        // une animation est en cours
 s:newBattle(),     // état du combat (voir rules.js)
 F:null,            // description du combat : zone, niveau, boss, graine
 cur:null,turn:-1,  // unité qui joue, index dans l'ordre
 sel:null,          // sort choisi {sp,cells}
 reachC:null,       // cases atteignables du héros qui joue
 intents:null,      // intentions des monstres [{m,target,dmg}] pendant le tour d'un héros
 endTurnResolve:null};
// Fonctions de l'interface appelées par la boucle de tours (renseignées par ui.js).
export const hooks={render(){},renderTL(){},result(){}};
