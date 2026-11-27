import {HER} from './data.js';
// Spécialisations (spec V2.5, ChatGPT 26/11/2026) : 3 par héros, 3 paliers débloqués aux niveaux 3, 7 et 11.
// Chaque palier est un petit objet de modificateurs appliqué au héros au début du combat (aucun état de combat sauvegardé).
// fx : dmgMul (dégâts directs des sorts), hpMul, healMul, maxPM, sp:{id:{champs du sort remplacés}}
// V4.38 : Orion a 5 paliers par voie (valeurs pilotes de ChatGPT, 27/11, non validées)
export const TIER=[3,7,11], TIER_ORION=[3,7,11,25,40];
// V4.46 : Kael (0, V4.46), Fenn (1, V4.47) et Aelis (2, V4.48) passent aussi à 5 paliers
export const FIVE=[0,1,2,3,4,5]; // V4.53 : Nyra (4) et V4.54 : Lyria (5), 5 paliers aussi
export const tiersFor=i=>FIVE.includes(i)?TIER_ORION:TIER;
export const SPECS=[
 [{id:'berserk',n:'Berserker',ic:['spec',0],d:'Frappe plus fort, achève les blessés.',t:[['Fureur','Dégâts des sorts ×1,15',{dmgMul:1.15}],['Rage','Critique 22 % au lieu de 12 %',{crit:.22}],['Exécution','Dégâts ×1,25 sur une cible sous 30 % de PV',{exec:1}],
   ['Rage tenace','Rage guerrière : 3 tours',{sp:{rage:{buffT:3,d:'+35 % de dégâts pendant 3 tours (ne se cumule pas avec Aura)'}}}],
   ['Jugement ardent','Jugement du lion : dégâts +25 %, ignore toute l’armure',{sp:{judge:{k:1.25,pierce:1,d:'Coup ultime : ignore toute l’armure et repousse d’une case. 1 fois par combat'}}}]]},
  {id:'gardien',n:'Gardien',ic:['spec',1],d:'Encaisse et protège.',t:[['Robustesse','PV maximum ×1,15',{hpMul:1.15}],['Forteresse','Rempart réduit les dégâts de 65 %',{guardK:.35,sp:{guard:{d:'Dégâts reçus −65 % jusqu’à ton prochain tour'}}}],['Dernier rempart','Une fois par combat, reste à 1 PV au lieu d’être KO',{lastStand:1}],
   ['Voix de fer','Provocation : ennemis à 5 cases ou moins',{sp:{taunt:{taunt:5,d:'Les ennemis à 5 cases ou moins ne visent que Kael à leur prochain tour'}}}],
   ['Riposte totale','Contre-attaque : renvoie une Taillade entière',{sp:{counter:{counter:1,d:'Jusqu’à ton prochain tour, chaque ennemi qui frappe Kael au contact reçoit une Taillade entière'}}}]]},
  {id:'briseur',n:'Briseur',ic:['spec',6],d:'Repousse et écrase contre les obstacles.',t:[['Onde de choc','Fracas repousse de 3 cases',{sp:{smash:{push:3,d:'Gros coup qui repousse de 3 cases, 1 fois par tour'}}}],['Impact brutal','Collisions : 7 dégâts par case au lieu de 5',{pushDmg:7}],['Fracas affaiblissant','Fracas retire 1 PM à la cible',{sp:{smash:{slow:1,d:'Gros coup qui repousse de 3 cases et retire 1 PM, 1 fois par tour'}}}],
   ['Tourbillon fracassant','Tourbillon repousse les ennemis d’une case',{sp:{whirl:{push:1,d:'Frappe tous les ennemis collés à Kael et les repousse d’une case'}}}],
   ['Jugement ravageur','Jugement du lion : repousse de 3 cases, dégâts +10 %',{sp:{judge:{push:3,k:1.1,d:'Coup ultime : ignore la moitié de l’armure et repousse de 3 cases. 1 fois par combat'}}}]]}],
 [{id:'tireur',n:'Tireur',ic:['spec',3],d:'Tire de plus loin et plus juste.',t:[['Œil de lynx','Portée de Tir : 7 au lieu de 6',{sp:{shot:{r:[2,7]}}}],['Précision','Critique 22 % au lieu de 12 %',{crit:.22}],['Flèche perforante','Tir ignore la moitié de l’armure',{sp:{shot:{pierce:.5}}}],
   ['Explosion précise','Flèche explosive : 80 % des dégâts autour du centre',{sp:{blastarrow:{side:.8,d:'Explose sur la case visée ; 80 % des dégâts sur les 4 cases voisines'}}}],
   ['Pluie dévastatrice','Pluie céleste : dégâts +20 %, 60 % autour du centre',{sp:{rain:{k:1.2,side:.6,d:'Pluie de flèches de rayon 2, 60 % autour du centre, dégâts +20 %. 1 fois par combat'}}}]]},
  {id:'chasseur',n:'Chasseur',ic:['spec',8],d:'Ralentit et piège ses proies.',t:[['Tir entravant','Tir retire 1 PM à la cible',{sp:{shot:{slow:1,d:'Flèche par-dessus les décors bas, retire 1 PM au prochain tour'}}}],['Volée affaiblissante','Volée retire 1 PM aux ennemis touchés',{sp:{volley:{slow:1,d:'Touche la case visée et les 4 autour, retire 1 PM aux ennemis touchés'}}}],['Piège naturel','Nouveau sort : Piège (10 dégâts, −1 PM)',{add:['trap']}],
   ['Poison tenace','Flèche toxique : poison 5 par tour pendant 3 tours',{sp:{venomarrow:{poison:[5,3],d:'Flèche : dégâts + poison (5 par tour) pendant 3 tours'}}}],
   ['Pluie entravante','Pluie céleste : −1 PM aux ennemis touchés',{sp:{rain:{slow:1,d:'Pluie de flèches de rayon 2, 50 % autour du centre, −1 PM aux ennemis touchés. 1 fois par combat'}}}]]},
  {id:'eclaireur',n:'Éclaireur',ic:['tal',2],d:'Bouge plus, esquive.',t:[['Agilité','4 PM au lieu de 3',{maxPM:4}],['Vent rapide','Bottes ailées : +3 PM',{sp:{boots:{pmBonus:3,d:'+3 PM pour ce tour'}}}],['Insaisissable','15 % de chances d’esquiver une attaque',{dodge:.15}],
   ['Repli vif','Repli acrobatique : recharge 2 au lieu de 3',{sp:{dodge:{cd:2}}}],
   ['Saut de l’ombre','Repli acrobatique : portée 5',{sp:{dodge:{r:[1,5],d:'Fenn saute sur une case libre en vue (jusqu’à 5 cases), sans dépenser de PM'}}}]]}],
 [{id:'guerisseuse',n:'Guérisseuse',ic:['spec',5],d:'Des soins plus forts, jusqu’à la résurrection.',t:[['Lumière bienfaitrice','Soins ×1,20',{healMul:1.2}],['Grâce','Portée de Soin : 5',{sp:{heal:{r:[0,5]}}}],['Renaissance','Nouveau sort : relève un héros KO (1 fois par combat)',{add:['revive']}],
   ['Égide lumineuse','Bouclier magique : 35 % des PV max de l’allié',{sp:{ward:{ward:[.35,2],d:'Bouclier qui absorbe des dégâts à hauteur de 35 % des PV max de l’allié, 2 tours'}}}],
   ['Bénédiction fervente','Bénédiction ancienne : soin 22–28',{sp:{bless:{heal:[22,28],d:'Soigne (22–28) et purifie tous les héros. 1 fois par combat'}}}]]},
  {id:'druide',n:'Druide',ic:['spec',7],d:'Un poison qui ronge et se propage.',t:[['Venin puissant','Poison d’Épine : 6 par tour',{sp:{venom:{poison:[6,2],d:'Dégâts + poison (6 par tour) pendant 2 tours'}}}],['Venin persistant','Poison : 3 tours',{sp:{venom:{poison:[6,3],d:'Dégâts + poison (6 par tour) pendant 3 tours'}}}],['Contagion','Le poison se propage à la mort de la cible',{sp:{venom:{spread:1,d:'Dégâts + poison (6 par tour, 3 tours), se propage à la mort'}}}],
   ['Racines épineuses','Racines : dégâts +25 %',{sp:{roots:{k:1.25}}}],
   ['Rayon vorace','Rayon lunaire : soigne 60 % des dégâts infligés',{sp:{moon:{drain:.6,d:'Ignore l’armure ; soigne l’allié le plus blessé de 60 % des dégâts infligés'}}}]]},
  {id:'enchant',n:'Enchanteresse',ic:['spec',4],d:'Renforce toute l’équipe.',t:[['Aura supérieure','Aura : +40 % de dégâts',{sp:{aura:{buff:.4,d:'+40 % de dégâts à un allié, 2 tours'}}}],['Bénédiction durable','Aura : 3 tours',{sp:{aura:{buffT:3,d:'+40 % de dégâts à un allié, 3 tours'}}}],['Bénédiction collective','Aura touche tous les héros',{sp:{aura:{all:1,d:'+40 % de dégâts à tous les héros, 3 tours'}}}],
   ['Chant rapide','Aura : recharge 2 au lieu de 3',{sp:{aura:{cd:2}}}],
   ['Aura purifiante','Aura purifie aussi les alliés touchés',{sp:{aura:{cleanse:1,d:'+40 % de dégâts à tous les héros, 3 tours, et purifie leurs maux'}}}]]}],
 [{id:'pyro',n:'Pyromancien',ic:['sico',2],d:'Brûle plus fort et plus longtemps.',t:[
   ['Braises vives','Brûlure de Flamme : 4 par tour au lieu de 3',{sp:{flame:{burn:[4,2],d:'Dégâts + brûlure (4 par tour) pendant 2 tours'}}}],
   ['Longue flamme','Portée de Flamme : 5',{sp:{flame:{r:[1,5]}}}],
   ['Grand brasier','Boule de feu : 70 % des dégâts autour du centre',{sp:{fireball:{side:.7,d:'Explose sur la case visée ; 70 % des dégâts sur les 4 autour. Épargne tes héros'}}}],
   ['Feu tenace','Brûlure : 3 tours',{sp:{flame:{burn:[4,3],d:'Dégâts + brûlure (4 par tour) pendant 3 tours'}}}],
   ['Maître du feu','Flamme et Boule de feu : dégâts +10 %',{sp:{flame:{k:1.1},fireball:{k:1.1}}}]]},
  {id:'cryo',n:'Cryomancien',ic:['sico',3],d:'Gèle et barre la route.',t:[
   ['Souffle froid','Portée de Givre : 5',{sp:{frost:{r:[1,5]}}}],
   ['Glace épaisse','Mur de glace : PV +20 %',{sp:{icewall:{wall:{turns:2,hp:.48}}}}],
   ['Givre mordant','Givre : dégâts +10 %',{sp:{frost:{k:1.1}}}],
   ['Glace durable','Mur de glace : 3 tours',{sp:{icewall:{wall:{turns:3,hp:.48},d:'Obstacle de glace sur une case libre, 3 tours. Les ennemis bloqués peuvent le casser'}}}],
   ['Gel profond','Givre : −2 PM (au moins 1 PM restant ; les boss restent à −1)',{sp:{frost:{slow:2,d:'Dégâts et −2 PM au prochain tour de la cible (boss : −1)'}}}]]},
  {id:'arcaniste',n:'Arcaniste',ic:['sico',14],d:'Maîtrise la distance et les arcanes.',t:[
   ['Trait lointain','Portée de Projectile arcanique : 6',{sp:{arcane:{r:[1,6]}}}],
   ['Grand saut','Portée de Téléportation courte : 4',{sp:{blink:{r:[1,4]}}}],
   ['Emprise','Affaiblissement : 3 tours',{sp:{weaken:{weaken:[.2,3],d:'La cible inflige 20 % de dégâts en moins pendant 3 de ses tours (sans cumul)'}}}],
   ['Glyphe renforcé','Glyphe : dégâts +10 %',{sp:{glyph:{k:1.1}}}],
   ['Œil de la tempête','Tempête arcanique : 60 % autour du centre',{sp:{storm:{side:.6,d:'Zone de rayon 2, 60 % autour du centre. Épargne tes héros. 1 fois par combat'}}}]]}],
 // V4.53 : Nyra (valeurs provisoires de Claude)
 [{id:'ombre',n:'Ombre',ic:['spec',3],d:'Rapide, insaisissable, frappe dans le dos.',t:[['Pas feutrés','4 PM au lieu de 3',{maxPM:4}],['Frappe sournoise','Frappe de dos : ×1,75 avec un autre héros contre la cible',{sp:{backstab:{flk:1.75,d:'Dégâts ×1,75 si un autre héros touche la cible'}}}],['Insaisissable','15 % de chances d’esquiver une attaque',{dodge:.15}],
   ['Ombre rapide','Pas d’ombre : recharge 2 au lieu de 3',{sp:{shadow:{cd:2}}}],
   ['Danse mortelle','Danse des ombres : dégâts +20 %',{sp:{dance:{k:1.2}}}]]},
  {id:'venimeuse',n:'Venimeuse',ic:['spec',8],d:'Empoisonne tout ce qu’elle touche.',t:[['Lame enduite','Dague : poison 3 par tour, 2 tours',{sp:{dagger:{poison:[3,2],d:'Coup de dague rapide + poison (3 par tour) pendant 2 tours'}}}],['Venin puissant','Poison : 7 par tour',{sp:{toxin:{poison:[7,3],d:'Lame empoisonnée : dégâts + poison (7 par tour) pendant 3 tours'}}}],['Contagion','Le poison se propage à la mort de la cible',{sp:{toxin:{spread:1,poison:[7,3],d:'Dégâts + poison (7 par tour, 3 tours), se propage à la mort'}}}],
   ['Dose double','Poison : 4 tours',{sp:{toxin:{poison:[7,4],spread:1,d:'Dégâts + poison (7 par tour) pendant 4 tours, se propage à la mort'}}}],
   ['Fumigène toxique','Fumigène : poison 4 par tour, 2 tours',{sp:{smoke:{poison:[4,2],d:'Nuage de rayon 1 : petits dégâts, −25 % de dégâts infligés et poison (4 par tour), 2 tours'}}}]]},
  {id:'duelliste',n:'Duelliste',ic:['spec',0],d:'Critiques et mise à mort.',t:[['Vivacité','Critique 22 % au lieu de 12 %',{crit:.22}],['Lame affûtée','Lame double : dégâts +10 %',{sp:{twin:{k:1.1}}}],['Mise à mort','Dégâts ×1,25 sur une cible sous 30 % de PV',{exec:1}],
   ['Marque tenace','Marque : 3 tours',{sp:{mark:{sunder:[.25,3],d:'La cible subit +25 % de dégâts pendant 3 tours'}}}],
   ['Exécuteur','Exécution : ×2 sous 45 % de PV',{sp:{execute:{exe:[.45,2],d:'Dégâts ×2 sur une cible sous 45 % de ses PV'}}}]]}],
 // V4.54 : Lyria (valeurs provisoires de Claude)
 [{id:'sentinelle',n:'Sentinelle',ic:['spec',1],d:'Un mur de lumière qui protège l’équipe.',t:[['Cuirasse bénie','PV maximum ×1,15',{hpMul:1.15}],['Garde solide','Protection : recharge 2 au lieu de 3',{sp:{protect:{cd:2}}}],['Forteresse','Rempart réduit les dégâts de 65 %',{guardK:.35}],
   ['Interception large','Interception : ennemis à 5 cases ou moins',{sp:{intercept:{taunt:5,d:'Rempart sur Lyria ; les ennemis à 5 cases ou moins ne visent qu’elle à leur prochain tour'}}}],
   ['Bastion éternel','Bastion : bouclier de 20 % des PV max en plus',{sp:{bastion:{ward:[.2,2],d:'Rempart et bouclier de 20 % des PV max sur tous les héros. 1 fois par combat'}}}]]},
  {id:'justiciere',n:'Justicière',ic:['spec',6],d:'Frappe fort et punit les ennemis.',t:[['Poigne sainte','Dégâts des sorts ×1,15',{dmgMul:1.15}],['Marteau étourdissant','Marteau retire 1 PM à la cible',{sp:{hammer:{slow:1,d:'Coup de marteau sacré, retire 1 PM au prochain tour de la cible'}}}],['Châtiment','Critique 22 % au lieu de 12 %',{crit:.22}],
   ['Impact amplifié','Impact sacré : 80 % autour du centre',{sp:{smite:{side:.8,d:'Explose sur la case visée ; 80 % des dégâts sur les 4 cases voisines'}}}],
   ['Jugement sacré','Impact sacré : dégâts +20 %, recharge 2',{sp:{smite:{side:.8,k:1.2,cd:2,d:'Explose sur la case visée ; 80 % autour, dégâts +20 %'}}}]]},
  {id:'luminiere',n:'Luminière',ic:['spec',5],d:'Soigne, purifie, relève les héros tombés.',t:[['Lumière vive','Soins ×1,20',{healMul:1.2}],['Grâce','Portée de Lumière : 5',{sp:{light:{r:[0,5]}}}],['Renaissance','Nouveau sort : relève un héros KO (1 fois par combat)',{add:['revive']}],
   ['Soin hâtif','Soin de secours : recharge 3 au lieu de 4',{sp:{rescue:{cd:3}}}],
   ['Serment radieux','Serment : +30 % de dégâts',{sp:{oath:{buff:.3,d:'+30 % de dégâts à tous les héros, 2 tours'}}}]]}]];
// spécialisation active du héros i (ou null) et nombre de paliers débloqués par le niveau
export const specOf=(save,i)=>SPECS[i]?.find(x=>x.id===(save.sp||[])[i])||null;
export const tiersOf=(lvl,i)=>tiersFor(i).filter(l=>lvl>=l).length;
export function talentFx(save,i){const sp=specOf(save,i),fx={sp:{}};if(!sp)return fx;
 for(const[, ,m]of sp.t.slice(0,tiersOf(save.lvl,i)))if(m)for(const k in m)k==='sp'?Object.entries(m.sp).forEach(([s,o])=>fx.sp[s]={...fx.sp[s],...o}):fx[k]=m[k];
 return fx}
// valide save.sp (anciennes sauvegardes, valeurs abîmées)
export const cleanSp=v=>HER.map((_,i)=>Array.isArray(v)&&SPECS[i].some(x=>x.id===v[i])?v[i]:null);
