// Spécialisations (spec V2.5, ChatGPT 26/11/2026) : 3 par héros, 3 paliers débloqués aux niveaux 3, 7 et 11.
// Chaque palier est un petit objet de modificateurs appliqué au héros au début du combat (aucun état de combat sauvegardé).
// fx : dmgMul (dégâts directs des sorts), hpMul, healMul, maxPM, sp:{id:{champs du sort remplacés}}
export const TIER=[3,7,11], DONE=1; // DONE : paliers déjà codés (V2.5a : le premier)
export const SPECS=[
 [{id:'berserk',n:'Berserker',ic:0,d:'Frappe plus fort, achève les blessés.',t:[['Fureur','Dégâts des sorts ×1,15',{dmgMul:1.15}],['Rage','Critique 22 % au lieu de 12 %'],['Exécution','Dégâts ×1,25 sur une cible sous 30 % de PV']]},
  {id:'gardien',n:'Gardien',ic:1,d:'Encaisse et protège.',t:[['Robustesse','PV maximum ×1,15',{hpMul:1.15}],['Forteresse','Rempart réduit les dégâts de 65 %'],['Dernier rempart','Une fois par combat, reste à 1 PV au lieu d’être KO']]},
  {id:'briseur',n:'Briseur',ic:12,d:'Repousse et écrase contre les obstacles.',t:[['Onde de choc','Fracas repousse de 3 cases',{sp:{smash:{push:3,d:'Gros coup qui repousse de 3 cases, 1 fois par tour'}}}],['Impact brutal','Collisions : 7 dégâts par case au lieu de 5'],['Fracas affaiblissant','Fracas retire 1 PM à la cible']]}],
 [{id:'tireur',n:'Tireur',ic:4,d:'Tire de plus loin et plus juste.',t:[['Œil de lynx','Portée de Tir : 7 au lieu de 6',{sp:{shot:{r:[2,7]}}}],['Précision','Critique 22 % au lieu de 12 %'],['Flèche perforante','Tir ignore la moitié de l’armure']]},
  {id:'chasseur',n:'Chasseur',ic:5,d:'Ralentit et piège ses proies.',t:[['Tir entravant','Tir retire 1 PM à la cible',{sp:{shot:{slow:1,d:'Flèche à distance, ligne de vue, retire 1 PM au prochain tour'}}}],['Volée affaiblissante','Volée retire 1 PM aux ennemis touchés'],['Piège naturel','Nouveau sort : Piège']]},
  {id:'eclaireur',n:'Éclaireur',ic:6,d:'Bouge plus, esquive.',t:[['Agilité','4 PM au lieu de 3',{maxPM:4}],['Vent rapide','Bottes ailées : +3 PM'],['Insaisissable','15 % de chances d’esquiver une attaque']]}],
 [{id:'guerisseuse',n:'Guérisseuse',ic:8,d:'Des soins plus forts, jusqu’à la résurrection.',t:[['Lumière bienfaitrice','Soins ×1,20',{healMul:1.2}],['Grâce','Portée de Soin : 5'],['Renaissance','Nouveau sort : relève un héros KO']]},
  {id:'druide',n:'Druide',ic:9,d:'Un poison qui ronge et se propage.',t:[['Venin puissant','Poison d’Épine : 6 par tour',{sp:{venom:{poison:[6,2],d:'Dégâts + poison (6 par tour) pendant 2 tours'}}}],['Venin persistant','Poison : 3 tours'],['Contagion','Le poison se propage à la mort de la cible']]},
  {id:'enchant',n:'Enchanteresse',ic:14,d:'Renforce toute l’équipe.',t:[['Aura supérieure','Aura : +40 % de dégâts',{sp:{aura:{buff:.4,d:'+40 % de dégâts à un allié, 2 tours'}}}],['Bénédiction durable','Aura : 3 tours'],['Bénédiction collective','Aura touche tous les héros']]}]];
// spécialisation active du héros i (ou null) et nombre de paliers actifs (débloqués par le niveau ET déjà codés)
export const specOf=(save,i)=>SPECS[i].find(x=>x.id===(save.sp||[])[i])||null;
export const tiersOf=lvl=>TIER.filter(l=>lvl>=l).length;
export function talentFx(save,i){const sp=specOf(save,i),fx={sp:{}};if(!sp)return fx;
 for(const[, ,m]of sp.t.slice(0,Math.min(DONE,tiersOf(save.lvl))))if(m)for(const k in m)k==='sp'?Object.entries(m.sp).forEach(([s,o])=>fx.sp[s]={...fx.sp[s],...o}):fx[k]=m[k];
 return fx}
// valide save.sp (anciennes sauvegardes, valeurs abîmées)
export const cleanSp=v=>[0,1,2].map(i=>Array.isArray(v)&&SPECS[i].some(x=>x.id===v[i])?v[i]:null);
