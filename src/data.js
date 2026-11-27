// Données du jeu : héros, sorts, monstres, zones, objets, tuiles. Aucune logique ici.
export const SP={
 slash:{snd:'slash',n:'Taillade',ic:0,pa:3,r:[1,1],t:'enemy',dmg:[10,14],fx:0,d:'Coup d’épée au corps à corps'},
 smash:{vx:'sig',snd:'kael_charge',n:'Fracas',ic:1,pa:4,r:[1,1],t:'enemy',dmg:[16,21],fx:7,cd:1,shake:1,push:2,d:'Gros coup qui repousse de 2 cases, 1 fois par tour'},
 guard:{vx:'support',snd:'guard',n:'Rempart',ic:2,pa:2,r:[0,0],t:'self',shield:1,fx:7,cd:3,d:'Dégâts reçus ÷2 jusqu’à ton prochain tour'},
 shot:{snd:'bow',n:'Tir',ic:3,pa:3,r:[2,6],t:'enemy',los:1,lob:1,dmg:[8,12],proj:1,fx:0,d:'Flèche à distance : passe par-dessus les décors bas'},
 volley:{vx:'sig',snd:'bow',n:'Volée',ic:4,pa:4,r:[2,5],t:'cell',los:1,lob:1,zone:1,dmg:[7,10],proj:1,fx:0,cd:2,d:'Touche la case visée et les 4 autour'},
 trap:{snd:'trap',n:'Piège',ic:3,pa:3,r:[1,3],t:'cell',free:1,los:1,cd:3,trap:1,fx:0,d:'Piège sur une case libre : 10 dégâts et −1 PM au premier ennemi qui y entre, 3 tours'},
 revive:{vx:'support',snd:'aelis_heal',n:'Renaissance',ic:5,pa:6,r:[1,4],t:'dead',cd:99,revive:1,fx:4,d:'Relève un héros KO avec 25 % de ses PV, 1 fois par combat'},
 potion:{snd:'aelis_heal',n:'Potion',ic:5,pa:4,r:[0,0],t:'self',potion:1,fx:4,cd:99,d:'Boit une potion du marchand : soigne 40 % des PV max, 1 fois par héros et par combat'},
 boots:{vx:'support',snd:'buff',n:'Bottes ailées',sn:'Bottes',ic:14,pa:2,r:[0,0],t:'self',pmBonus:2,fx:7,cd:3,d:'+2 PM pour ce tour'},
 heal:{vx:'support',snd:'aelis_heal',n:'Soin',ic:5,pa:3,r:[0,4],t:'ally',heal:[13,17],fx:4,cd:1,d:'Soigne un allié (ou toi)'},
 venom:{vx:'sig',snd:'poison',n:'Épine',ic:7,pa:3,r:[1,5],t:'enemy',los:1,dmg:[5,7],poison:[4,2],fx:5,d:'Dégâts + poison pendant 2 tours'},
 // V4.11 (lot 2, spec ChatGPT) : un nouveau sort par héros au niveau 5 (HER[].sp5)
 charge:{vx:'sig',snd:'kael_charge',n:'Charge',pa:4,r:[2,3],t:'enemy',dmg:[8,11],fx:7,cd:2,charge:1,shake:1,d:'Fonce sur un ennemi à 2 ou 3 cases et le frappe : Kael s’arrête sur une case libre à côté, sans dépenser de PM ni traverser d’obstacle'},
 pshot:{vx:'sig',snd:'bow',n:'Tir perforant',pa:4,r:[2,6],t:'enemy',los:1,lob:1,dmg:[11,14],pierce:1,proj:1,fx:0,cd:2,d:'Flèche qui ignore toute l’armure, une seule cible'},
 mheal:{vx:'support',snd:'aelis_heal',n:'Soin collectif',pa:5,r:[0,3],t:'ally',heal:[7,9],splash:1,fx:4,cd:3,d:'Soigne l’allié visé et les alliés collés à lui (pas de résurrection)'},
 // V4.41 : les 5 autres sorts de Fenn (valeurs provisoires de Claude, non équilibrées)
 venomarrow:{snd:'bow',n:'Flèche toxique',sn:'Toxique',pa:3,r:[2,6],t:'enemy',los:1,lob:1,dmg:[5,7],poison:[4,2],proj:1,fx:5,cd:2,d:'Flèche : dégâts + poison pendant 2 tours'},
 dodge:{vx:'support',snd:'buff',n:'Repli acrobatique',sn:'Repli',pa:2,r:[1,3],t:'cell',free:1,los:1,lob:1,blink:1,fx:7,cd:3,d:'Fenn saute sur une case libre en vue, sans dépenser de PM'},
 icearrow:{snd:'bow',n:'Flèche glaciale',sn:'Glaciale',pa:3,r:[2,6],t:'enemy',los:1,lob:1,dmg:[7,10],slow:1,proj:1,fx:2,cd:2,d:'Flèche : dégâts et −1 PM au prochain tour de la cible'},
 blastarrow:{vx:'sig',snd:'bow',n:'Flèche explosive',sn:'Explosive',pa:5,r:[2,5],t:'cell',los:1,lob:1,zone:1,side:.6,dmg:[13,17],proj:1,fx:1,cd:3,shake:1,d:'Explose sur la case visée ; 60 % des dégâts sur les 4 cases voisines'},
 rain:{vx:'sig',snd:'bow',n:'Pluie céleste',sn:'Pluie',pa:6,r:[2,5],t:'cell',los:1,lob:1,zone:2,side:.5,dmg:[17,22],proj:1,fx:3,cd:99,shake:1,d:'Pluie de flèches de rayon 2, 50 % autour du centre. 1 fois par combat'},
 aura:{snd:'buff',n:'Aura',ic:6,pa:3,r:[0,3],t:'ally',buff:.3,fx:7,cd:3,d:'+30 % de dégâts à un allié, 2 tours'},
 // V4.33 : Orion (aperçu). Valeurs pilotes de ChatGPT (27/11), non validées
 arcane:{snd:'prism_burst',n:'Projectile arcanique',sn:'Arcane',pa:3,r:[1,5],t:'enemy',los:1,dmg:[11,15],proj:1,orb:'#7fb8ff',fx:0,d:'Trait de magie à distance'},
 flame:{snd:'crystal_amp',n:'Flamme',pa:3,r:[1,4],t:'enemy',los:1,dmg:[9,12],burn:[3,2],proj:1,orb:'#ff8a20',fx:1,cd:2,d:'Dégâts + brûlure (3 par tour) pendant 2 tours'},
 frost:{snd:'crystal_amp',n:'Givre',pa:3,r:[1,4],t:'enemy',los:1,dmg:[8,11],slow:1,proj:1,orb:'#9fe4ff',fx:2,cd:2,d:'Dégâts et −1 PM au prochain tour de la cible'},
 fireball:{snd:'prism_burst',n:'Boule de feu',pa:5,r:[2,5],t:'cell',los:1,zone:1,side:.6,dmg:[16,21],proj:1,orb:'#ff6a10',fx:1,cd:3,shake:1,d:'Explose sur la case visée ; 60 % des dégâts sur les 4 autour. Épargne tes héros'},
 // V4.37 : les 6 autres sorts d'Orion. wall : {tours, part des PV max d'Orion} (PV non donnés par ChatGPT : choix à confirmer)
 icewall:{snd:'crystal_amp',n:'Mur de glace',sn:'Mur',pa:4,r:[1,4],t:'cell',free:1,los:1,wall:{turns:2,hp:.4},fx:2,cd:4,d:'Obstacle de glace sur une case libre, 2 tours. Les ennemis bloqués peuvent le casser'},
 blink:{snd:'buff',n:'Téléportation courte',sn:'Saut',pa:3,r:[1,3],t:'cell',free:1,los:1,lob:1,blink:1,fx:7,cd:3,d:'Orion saute sur une case libre en vue, sans dépenser de PM'},
 weaken:{snd:'poison',n:'Affaiblissement',sn:'Affaiblir',pa:3,r:[1,4],t:'enemy',los:1,weaken:[.2,2],fx:5,cd:3,d:'La cible inflige 20 % de dégâts en moins pendant 2 de ses tours (sans cumul)'},
 nova:{snd:'prism_burst',n:'Explosion',pa:4,r:[0,0],t:'self',nova:1,dmg:[13,17],push:1,fx:7,cd:3,shake:1,d:'Frappe les ennemis collés à Orion et les repousse d’une case'},
 glyph:{snd:'trap',n:'Glyphe',pa:4,r:[1,4],t:'cell',free:1,los:1,trap:1,glyph:1,dmg:[12,16],fx:1,cd:3,d:'Pose un glyphe sur une case libre : il explose sous le premier ennemi qui y entre. 3 tours, un seul à la fois'},
 // V4.44 : les 5 autres sorts d'Aelis (valeurs provisoires de Claude, non équilibrées)
 ward:{vx:'support',snd:'guard',n:'Bouclier magique',sn:'Bouclier',pa:3,r:[0,4],t:'ally',ward:[.25,2],fx:7,cd:3,d:'Bouclier qui absorbe des dégâts à hauteur de 25 % des PV max de l’allié, 2 tours'},
 cleanse:{vx:'support',snd:'aelis_heal',n:'Purification',sn:'Purif.',pa:2,r:[0,4],t:'ally',heal:[6,8],cleanse:1,fx:4,cd:2,d:'Retire poison, brûlure, entrave, malédiction, affaiblissement et armure brisée ; petit soin'},
 roots:{vx:'sig',snd:'poison',n:'Racines',pa:4,r:[1,5],t:'cell',los:1,zone:1,side:1,dmg:[6,8],slow:9,fx:5,cd:3,d:'Zone de rayon 1 : dégâts, et les ennemis n’ont plus qu’1 PM à leur prochain tour (−1 PM pour un boss)'},
 moon:{snd:'prism_burst',n:'Rayon lunaire',sn:'Rayon',pa:4,r:[2,6],t:'enemy',los:1,dmg:[13,17],pierce:1,drain:.4,proj:1,orb:'#9fd8ff',fx:2,cd:2,d:'Ignore l’armure ; soigne l’allié le plus blessé de 40 % des dégâts infligés'},
 bless:{vx:'sig',snd:'aelis_heal',n:'Bénédiction ancienne',sn:'Bénédiction',pa:6,r:[0,0],t:'self',all:1,heal:[16,21],cleanse:1,fx:4,cd:99,shake:1,d:'Soigne et purifie tous les héros. 1 fois par combat'},
 // V4.43 : les 6 autres sorts de Kael (valeurs provisoires de Claude, non équilibrées)
 whirl:{vx:'sig',snd:'slash',n:'Tourbillon',pa:4,r:[0,0],t:'self',nova:1,dmg:[10,13],fx:7,cd:2,shake:1,d:'Frappe tous les ennemis collés à Kael'},
 sunder:{snd:'kael_charge',n:'Brise-armure',sn:'Brise',pa:4,r:[1,1],t:'enemy',dmg:[10,13],pierce:.5,sunder:[.25,2],fx:7,cd:2,d:'Ignore la moitié de l’armure ; la cible subit +25 % de dégâts pendant 2 tours'},
 taunt:{vx:'support',snd:'guard',n:'Provocation',sn:'Provoc.',pa:2,r:[0,0],t:'self',taunt:3,fx:7,cd:3,d:'Les ennemis à 3 cases ou moins ne visent que Kael à leur prochain tour'},
 counter:{vx:'support',snd:'guard',n:'Contre-attaque',sn:'Contre',pa:2,r:[0,0],t:'self',counter:.6,fx:7,cd:3,d:'Jusqu’à ton prochain tour, chaque ennemi qui frappe Kael au contact reçoit 60 % d’une Taillade'},
 rage:{vx:'support',snd:'buff',n:'Rage guerrière',sn:'Rage',pa:2,r:[0,0],t:'self',buff:.35,buffT:2,fx:7,cd:4,d:'+35 % de dégâts pendant 2 tours (ne se cumule pas avec Aura)'},
 judge:{vx:'sig',snd:'kael_charge',n:'Jugement du lion',sn:'Jugement',pa:6,r:[1,1],t:'enemy',dmg:[30,38],pierce:.5,push:1,fx:7,cd:99,shake:1,d:'Coup ultime : ignore la moitié de l’armure et repousse d’une case. 1 fois par combat'},
 storm:{snd:'prism_burst',n:'Tempête arcanique',sn:'Tempête',pa:6,r:[2,5],t:'cell',los:1,zone:2,side:.5,dmg:[23,30],proj:1,orb:'#b98bff',fx:3,cd:99,shake:1,d:'Zone de rayon 2, 50 % autour du centre. Épargne tes héros. 1 fois par combat'},
 // V4.53 : les 10 sorts de Nyra (assassin). Valeurs provisoires de Claude, non équilibrées
 dagger:{snd:'slash',n:'Dague',pa:2,r:[1,1],t:'enemy',dmg:[8,11],fx:0,d:'Coup de dague rapide au corps à corps'},
 backstab:{snd:'slash',n:'Frappe de dos',sn:'Dos',pa:3,r:[1,1],t:'enemy',dmg:[11,15],flk:1.5,fx:7,d:'Dégâts ×1,5 si un autre héros touche la cible'},
 shadow:{vx:'support',snd:'buff',n:'Pas d’ombre',sn:'Ombre',pa:2,r:[1,4],t:'cell',free:1,los:1,lob:1,blink:1,fx:7,cd:3,d:'Nyra saute sur une case libre en vue, sans dépenser de PM'},
 toxin:{snd:'poison',n:'Poison',pa:3,r:[1,2],t:'enemy',los:1,dmg:[5,7],poison:[5,3],proj:1,fx:5,cd:2,d:'Lame empoisonnée : dégâts + poison (5 par tour) pendant 3 tours'},
 smoke:{vx:'sig',snd:'poison',n:'Fumigène',sn:'Fumi.',pa:4,r:[1,4],t:'cell',los:1,lob:1,zone:1,side:1,dmg:[3,4],weaken:[.25,2],fx:5,cd:3,d:'Nuage de rayon 1 : petits dégâts, les ennemis infligent 25 % de dégâts en moins pendant 2 tours'},
 mark:{vx:'support',snd:'buff',n:'Marque',pa:2,r:[1,5],t:'enemy',los:1,sunder:[.25,2],mk:1,fx:7,cd:3,d:'La cible subit +25 % de dégâts pendant 2 tours'},
 twin:{vx:'sig',snd:'slash',n:'Lame double',sn:'Double',pa:4,r:[1,1],t:'enemy',dmg:[8,11],twice:2,fx:7,cd:2,d:'Deux coups de dague d’affilée'},
 evade:{vx:'support',snd:'dodge',n:'Esquive active',sn:'Esquive',pa:2,r:[0,0],t:'self',evade:.5,fx:7,cd:4,d:'50 % de chances d’esquiver chaque attaque jusqu’à ton prochain tour'},
 execute:{vx:'sig',snd:'slash',n:'Exécution',sn:'Exécut.',pa:4,r:[1,1],t:'enemy',dmg:[14,18],exe:[.35,2],fx:7,cd:3,shake:1,d:'Dégâts ×2 sur une cible sous 35 % de ses PV'},
 dance:{vx:'sig',snd:'prism_burst',n:'Danse des ombres',sn:'Danse',pa:6,r:[0,0],t:'self',nova:1,dmg:[22,28],fx:7,cd:99,shake:1,d:'Frappe tous les ennemis collés à Nyra. 1 fois par combat'},
 // V4.54 : les 10 sorts de Lyria (paladine). Valeurs provisoires de Claude, non équilibrées
 hammer:{snd:'smash',n:'Marteau',pa:3,r:[1,1],t:'enemy',dmg:[11,15],fx:0,d:'Coup de marteau sacré au corps à corps'},
 protect:{vx:'support',snd:'guard',n:'Protection',sn:'Protec.',pa:3,r:[0,4],t:'ally',shield:1,fx:7,cd:3,d:'Rempart sur un allié : dégâts réduits jusqu’à son prochain tour'},
 light:{vx:'support',snd:'aelis_heal',n:'Lumière',pa:3,r:[0,4],t:'ally',heal:[10,14],fx:4,cd:1,d:'Soigne un allié'},
 intercept:{vx:'support',snd:'guard',n:'Interception',sn:'Intercep.',pa:2,r:[0,0],t:'self',taunt:3,shield:1,fx:7,cd:4,d:'Rempart sur Lyria ; les ennemis à 3 cases ou moins ne visent qu’elle à leur prochain tour'},
 purge:{vx:'support',snd:'aelis_heal',n:'Purge',pa:2,r:[0,4],t:'ally',heal:[4,6],cleanse:1,fx:4,cd:2,d:'Retire poison, brûlure, entrave, malédiction, affaiblissement et armure brisée ; petit soin'},
 smite:{vx:'sig',snd:'prism_burst',n:'Impact sacré',sn:'Impact',pa:4,r:[1,4],t:'cell',los:1,lob:1,zone:1,side:.6,dmg:[12,16],fx:1,cd:3,shake:1,d:'Explose sur la case visée ; 60 % des dégâts sur les 4 cases voisines'},
 aegis:{vx:'support',snd:'guard',n:'Aura défensive',sn:'Égide',pa:4,r:[0,0],t:'self',all:1,ward:[.15,2],fx:7,cd:4,d:'Tous les héros reçoivent un bouclier de 15 % de leurs PV max, 2 tours'},
 rescue:{vx:'support',snd:'aelis_heal',n:'Soin de secours',sn:'Secours',pa:4,r:[0,4],t:'ally',heal:[22,28],fx:4,cd:4,d:'Gros soin sur un allié'},
 oath:{vx:'support',snd:'buff',n:'Serment',pa:3,r:[0,0],t:'self',all:1,buff:.2,buffT:2,fx:7,cd:5,d:'+20 % de dégâts à tous les héros, 2 tours'},
 bastion:{vx:'sig',snd:'guard',n:'Bastion',pa:6,r:[0,0],t:'self',all:1,shield:1,fx:7,cd:99,shake:1,d:'Rempart sur tous les héros. 1 fois par combat'}};
export const HER=[
 {k:'warrior',n:'Kael',cls:'Guerrier',hp:62,init:12,sp:['slash','smash','guard'],sp5:'charge',
  learn:[['charge',5],['whirl',10],['sunder',15],['taunt',20],['counter',25],['rage',35],['judge',45]]},
 {k:'archer',n:'Fenn',cls:'Archer',hp:44,init:14,sp:['shot','volley','boots'],sp5:'pshot',
  learn:[['pshot',5],['venomarrow',10],['dodge',15],['icearrow',20],['blastarrow',25],['rain',35]]},
 {k:'healer',n:'Aelis',cls:'Soigneuse',hp:40,init:10,sp:['heal','venom','aura'],sp5:'mheal',
  learn:[['mheal',5],['ward',10],['cleanse',15],['roots',20],['moon',25],['bless',35]]}];
export const SP5_LVL=5;
export const TEAM_SIZE=3,DEF_TEAM=[0,1,2];
// V4.33 : Orion, première recrue (niveau 20). PV ≈ 85 % de ceux de Fenn. Ajouté seulement en aperçu (et par les tests et le simulateur) :
// en jeu normal il reste 3 héros. Ses objets : ceux que tous les héros peuvent porter. Talents : à venir.
// learn : sorts appris par niveau (7 au recrutement au niveau 20) ; SLOTS_SP : nombre de sorts emportés au combat
export const SLOTS_SP=6;
export const ALL_SPELLS=typeof location!=='undefined'&&location.search.includes('apercu=braise')&&location.search.includes('tous'); // &tous (aperçu) : les 10 sorts tout de suite
export const ORION={at:20,k:'mage',n:'Orion',cls:'Mage',hp:37,init:11,sp:['arcane','flame','frost'],learn:[['fireball',5],['icewall',10],['blink',15],['weaken',20],['nova',25],['glyph',35],['storm',45]]};
// V4.53 : Nyra (assassin, niveau 30) ; V4.54 : Lyria (paladine, niveau 40). Mêmes règles qu'Orion : PV ≈ 90 % de ceux de Fenn pour Nyra, 93 % de Kael pour Lyria
export const NYRA={at:30,k:'rogue',n:'Nyra',cls:'Assassin',hp:40,init:16,sp:['dagger','backstab','shadow'],learn:[['toxin',5],['smoke',10],['mark',15],['twin',20],['evade',25],['execute',35],['dance',45]]};
export const LYRIA={at:40,k:'paladin',n:'Lyria',cls:'Paladine',hp:58,init:9,sp:['hammer','protect','light'],learn:[['intercept',5],['purge',10],['smite',15],['aegis',20],['rescue',25],['oath',35],['bastion',45]]};
export function addRecruit(h,attrs){if(HER.includes(h))return HER.indexOf(h);const i=HER.length;HER.push(h);for(const a of attrs)ATTR[a].who.push(i);
 for(const o of ITEMS)if(Array.isArray(o.who)&&o.who.length===i)o.who=[...Array(i+1).keys()];return i}
export function addOrion(){if(HER.length>3)return 3;HER.push(ORION);ATTR.int.who.push(3);ATTR.vit.who.push(3);ATTR.agi.who.push(3);
 for(const o of ITEMS)if(Array.isArray(o.who)&&o.who.length===3)o.who=[0,1,2,3];return 3}
// V4.5b : ai = rôle de combat. tank : s'interpose devant les monstres fragiles et frappe le héros qui les menace · range : garde ses distances, recule s'il est collé · flank : contourne pour viser Fenn ou Aelis
export const MON={
 slime:{snd:'slime',n:'Gelée',s:'slimeN',row:0,hp:24,pm:2,init:8,dmg:[5,8],h:.62,xp:8},
 boar:{ai:'flank',snd:'hit',n:'Sanglier',s:'boarN',row:0,hp:32,pm:4,init:11,dmg:[7,10],h:.8,xp:12},
 bat:{ai:'flank',snd:'bite',n:'Chauve-souris',s:'batN',row:0,hp:18,pm:5,init:13,dmg:[4,7],h:.52,xp:9,fly:1},
 shroom:{ai:'range',snd:'poison',n:'Champignon',s:'shroomN',row:0,hp:26,pm:2,init:7,dmg:[4,6],r:[1,4],los:1,poison:[3,2],fx:5,h:.95,xp:12},
 wolf:{ai:'flank',snd:'bite',n:'Loup',s:'wolfN',row:0,hp:30,pm:5,init:12,dmg:[8,11],h:.8,xp:14},
 skel:{ai:'tank',snd:'slash',n:'Squelette',s:'skelN',row:0,hp:40,pm:3,init:9,dmg:[9,13],armor:.2,h:1.2,xp:16},
 crab:{ai:'tank',snd:'bite',n:'Crabe',s:'crabN',row:0,hp:34,pm:3,init:9,dmg:[8,11],armor:.15,h:.72,xp:14},
 gull:{ai:'flank',snd:'bite',n:'Mouette',s:'gullN',row:0,hp:22,pm:5,init:14,dmg:[6,9],h:.78,xp:12,fly:1},
 golem:{ai:'tank',snd:'smash',n:'Golem',s:'golemN',row:0,hp:52,pm:2,init:6,dmg:[11,15],armor:.25,h:1,xp:20},
 // V4.13 : gelée toxique (planche de la gelée, recolorée en violet par render.js ; crâne au-dessus de sa barre de vie) : frappe faible mais empoisonne 2 PV × 2 tours
 toxslime:{snd:'poison',n:'Gelée toxique',s:'slimeT',row:0,hp:24,pm:2,init:8,dmg:[3,5],poison:[2,2],fx:5,h:.62,xp:10},
 goblin:{snd:'slash',n:'Gobelin',s:'goblinN',row:0,hp:30,pm:4,init:13,dmg:[9,12],h:.95,xp:16},
 ghost:{ai:'range',snd:'poison',n:'Fantôme',s:'ghostN',row:0,hp:26,pm:4,init:11,dmg:[7,10],r:[1,3],los:1,fx:5,h:.95,xp:16,fly:1},
 knight:{ai:'tank',snd:'slash',n:'Chevalier',s:'monD',row:2,hp:60,pm:3,init:10,dmg:[13,17],armor:.25,h:1.25,xp:30}, // base du boss Chevalier noir
 // V3.5 : trois chevaliers de Max, du plus facile au plus dur (chiffres de départ, non équilibrés)
 knightB:{ai:'tank',snd:'slash',n:'Chevalier bleu',s:'knightB',row:0,hp:36,pm:3,init:9,dmg:[8,11],armor:.15,h:1.15,xp:20},
 knightR:{ai:'tank',snd:'slash',n:'Chevalier rouge',s:'knightR',row:0,hp:48,pm:3,init:10,dmg:[11,14],armor:.2,h:1.2,xp:28},
 knightN:{ai:'tank',snd:'smash',n:'Chevalier sombre',s:'knightN',row:0,hp:62,pm:4,init:12,dmg:[14,18],armor:.25,h:1.28,xp:40},
 // V4.0 région 6 (spec Claude du 26/11, chiffres de départ) ; araignée et chauve-souris : planches provisoires
 crygolem:{ai:'tank',snd:'golem_smash',n:'Golem cristallin',s:'crygolem',row:0,hp:56,pm:2,init:6,dmg:[11,15],armor:.25,h:1.05,xp:20},
 qspider:{ai:'range',snd:'spider_bite',n:'Araignée de quartz',s:'qspider',row:0,hp:28,pm:4,init:12,dmg:[6,9],r:[1,3],los:1,slow:1,fx:5,h:.8,xp:16},
 prisbat:{ai:'range',snd:'bat_shriek',n:'Chauve-souris prismatique',s:'prisbat',row:0,hp:22,pm:5,init:14,dmg:[6,9],r:[1,3],los:1,fx:5,h:.55,xp:14,fly:1},
 // V4.29, région 7 (aperçu caché, chiffres de départ proposés). imm = insensible aux braises. V4.32 : vraies images (tools/prep_r7.py).
 fireel:{ai:'range',snd:'poison',n:'Élémentaire de feu',s:'fireel',row:0,hp:30,pm:3,init:11,dmg:[8,11],r:[1,4],los:1,fx:5,h:.95,xp:18,fly:1,imm:1},
 obsid:{ai:'tank',snd:'smash',n:'Chevalier d’obsidienne',s:'obsid',row:0,hp:58,pm:3,init:9,dmg:[11,15],armor:.25,h:1.22,xp:26},
 salam:{ai:'flank',snd:'bite',n:'Salamandre de lave',s:'salam',row:0,hp:38,pm:5,init:12,dmg:[9,12],h:.8,xp:20,imm:1},
 // V4.42, région 8 (valeurs provisoires de Claude). curse = malédiction : soins reçus −50 % pendant 2 tours. Images : tools/prep_r8.py
 mummy:{ai:'tank',snd:'smash',n:'Gardien momifié',s:'mummy',row:0,hp:56,pm:2,init:8,dmg:[11,14],armor:.15,h:1.1,xp:26,curse:1},
 scorp:{ai:'flank',snd:'bite',n:'Scorpion doré',s:'scorp',row:0,hp:38,pm:5,init:13,dmg:[9,12],poison:[4,2],h:.75,xp:22},
 anubis:{ai:'range',snd:'poison',n:'Sentinelle antique',s:'anubis',row:0,hp:40,pm:3,init:10,dmg:[9,12],r:[1,4],los:1,fx:5,h:1.15,xp:24,imm:1,curse:1},
 // V4.64, région 9 (valeurs provisoires de Claude). Crapaud venimeux : poison 4 × 2 tours, ralentit (planche ChatGPT, tools/prep_r9.py). V4.66 : ent corrompu, spectre des marais et clone de la Reine ont leurs planches.
 toad:{ai:'tank',snd:'bite',n:'Crapaud venimeux',s:'toad',row:0,hp:50,pm:3,init:9,dmg:[10,13],armor:.1,poison:[4,2],slow:1,h:.8,xp:28},
 ent:{ai:'tank',snd:'smash',n:'Ent corrompu',s:'ent',row:0,hp:64,pm:2,init:7,dmg:[12,16],armor:.2,h:1.25,xp:30},
 wraith:{ai:'range',snd:'poison',n:'Spectre des marais',s:'wraith',row:0,hp:30,pm:4,init:12,dmg:[8,11],r:[1,3],los:1,fx:5,h:.95,xp:20,fly:1},
 // V4.67, région 10 (valeurs provisoires de Claude). Planches ChatGPT, tools/prep_r10.py. Double astral = clone fragile d'Aetherion.
 cguard:{ai:'tank',snd:'smash',n:'Gardien céleste',s:'cguard',row:0,hp:70,pm:2,init:8,dmg:[13,17],armor:.25,h:1.25,xp:34},
 griffin:{ai:'flank',snd:'bite',n:'Griffon royal',s:'griffin',row:0,hp:48,pm:5,init:14,dmg:[11,14],h:.95,xp:32,fly:1},
 astral:{ai:'range',snd:'poison',n:'Sentinelle astrale',s:'astral',row:0,hp:42,pm:3,init:11,dmg:[10,13],r:[1,4],los:1,fx:5,h:1.1,xp:30},
 astralclone:{ai:'flank',snd:'slash',n:'Double astral',s:'aetherion',row:0,hp:16,pm:4,init:10,dmg:[6,8],h:.55,xp:0},
 // V4.68, région 11 (valeurs provisoires de Claude). Planches ChatGPT, tools/prep_r11.py. Éclat de givre = clone fragile du Roi (planche `frostking`).
 polarwolf:{ai:'flank',snd:'bite',n:'Loup polaire',s:'polarwolf',row:0,hp:56,pm:5,init:14,dmg:[12,16],h:.85,xp:36},
 yeti:{ai:'tank',snd:'smash',n:'Yéti',s:'yeti',row:0,hp:82,pm:2,init:8,dmg:[14,18],armor:.2,h:1.3,xp:40},
 frostel:{ai:'tank',snd:'smash',n:'Élémentaire de givre',s:'frostel',row:0,hp:66,pm:2,init:9,dmg:[11,15],armor:.25,slow:1,h:1.2,xp:38},
 frostclone:{ai:'flank',snd:'slash',n:'Éclat de givre',s:'frostking',row:0,hp:18,pm:4,init:10,dmg:[6,8],slow:1,h:.55,xp:0},
 // V4.73, région 12 (valeurs provisoires de Claude). Planches ChatGPT, tools/prep_r12.py. Éclat d'éther = clone fragile du Briseur (planche `etherbeast`).
 etherbeast:{ai:'flank',snd:'bite',n:'Aberration d’Éther',s:'etherbeast',row:0,hp:64,pm:5,init:14,dmg:[14,18],h:.95,xp:44},
 etherknight:{ai:'tank',snd:'slash',n:'Chevalier de l’Éther',s:'etherknight',row:0,hp:74,pm:3,init:12,dmg:[15,19],armor:.2,h:1.2,xp:46},
 sanctguard:{ai:'tank',snd:'smash',n:'Gardien du Sanctuaire',s:'sanctguard',row:0,hp:96,pm:2,init:8,dmg:[16,20],armor:.3,h:1.3,xp:50},
 etherclone:{ai:'flank',snd:'bite',n:'Éclat d’éther',s:'etherbeast',row:0,hp:20,pm:4,init:10,dmg:[7,9],h:.55,xp:0},
 queenling:{ai:'flank',snd:'bite',n:'Clone de la Reine',s:'queen',row:0,hp:14,pm:4,init:10,dmg:[5,7],poison:[2,2],h:.55,xp:0}};
// zones de la carte : 3 combats + 1 boss chacune (ou `fights` : liste propre, le dernier est le boss) ; x,y en % de la carte
// fights : lvl, en (monstres, le 1er est le chef si goal='chief'), cry {a:turquoise, p:violet}, goal, tip (message guidé)
const G6=['crygolem','qspider','prisbat'],[CG,QS,PB]=G6,SL='slime',BO='boar',TX='toxslime',WO='wolf',SH='shroom',BA='bat',CR='crab',GU='gull',KB='knightB',KR='knightR',KN='knightN',GO='golem',GB='goblin',GH='ghost',SK='skel';
export const ZONES=[
 {id:'prairie',n:'Prairie de Lande',x:48,y:77,th:[0,2],lvl:1,pool:['slime','boar',TX],boss:{k:'slime',s:'roiG',n:'Roi Gelée',hp:3.2,dmg:1.4,h:2.1,summon:{k:'slime',n:2,hp:12,pm:2,dmg:[3,5]}},
  // V4.9 pilote : 10 étapes, niveaux 1 à 3, gelées et sangliers (le 1er monstre est le chef si goal='chief'). Chiffres de départ, à régler après les tests de Max
  waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,'boar']]}},
  fights:[{lvl:1,en:[SL,SL,SL]},{lvl:1,en:[SL,SL,BO]},{lvl:1,en:[SL,SL,SL,SL]},{lvl:2,en:[SL,BO,BO]},{lvl:2,en:[BO,SL,TX,BO],goal:'chief',tip:'tox'},
   {lvl:2,en:[TX,SL,BO,BO]},{lvl:2,en:[SL,SL,TX,TX,BO]},{lvl:2,en:[SL,TX,BO],goal:'survive'},{lvl:3,en:[BO,BO,TX,SL,TX]},{lvl:3,en:[TX,SL,BO,TX],tip:'king'}]},
 {id:'bois',n:'Bois sombre',x:33,y:50,th:[1],lvl:4,pool:['bat','wolf','shroom'],boss:{k:'wolf',s:'wolfK',n:'Loup alpha',hp:2.6,dmg:1.4,h:1.45,bs:'howl',summon:{k:'wolf',n:2,hp:28,pm:5,dmg:[6,9],sn:'Loup de meute',snd:'bite'}},
  // V4.14 (lot 4, liste ChatGPT) : 10 étapes, niveaux 4 à 6. Survie à renforts (V4.5a) déplacée en 8e étape.
  waves:{7:{turns:6,cap:6,start:3,add:[[2,1],[3,2],[4,1,'wolf'],[5,2]]}},
  fights:[{lvl:4,en:[BA,BA,WO]},{lvl:4,en:[WO,WO,WO]},{lvl:4,en:[SH,SH,WO],tip:'shroom'},{lvl:5,en:[BA,BA,BA,SH]},{lvl:5,en:[WO,WO,WO,BA],goal:'chief'},
   {lvl:5,en:[WO,SH,BA,SH]},{lvl:5,en:[SH,SH,SH,WO,WO]},{lvl:6,en:[WO,SH,BA],goal:'survive'},{lvl:6,en:[WO,WO,SH,SH,BA,BA]},{lvl:6,en:[WO,SH,BA]}]},
 {id:'plage',n:'Côte dorée',x:76,y:53,th:[3],lvl:7,pool:['crab','gull','slime','shroom'],elite:{7:'knightB'},boss:{k:'crab',s:'crabK',n:'Crabe royal',hp:2.8,dmg:1.4,h:1.7,bs:'shell'},
  // V4.15 (lot 5, liste ChatGPT) : 10 étapes, niveaux 7 à 9. Étape 8 = survie (pas de protection de zone), élite de renfort : Chevalier bleu.
  fights:[{lvl:7,en:[CR,CR,SL],tip:'armor'},{lvl:7,en:[CR,GU,GU]},{lvl:7,en:[CR,CR,GU]},{lvl:8,en:[GU,GU,GU,SL]},{lvl:8,en:[KB,CR,GU,CR],goal:'chief'},
   {lvl:8,en:[CR,CR,CR,GU]},{lvl:8,en:[KB,CR,GU,SL]},{lvl:9,en:[CR,GU,SL],goal:'survive'},{lvl:9,en:[CR,CR,KB,GU]},{lvl:9,en:[CR,GU,SL,CR]}]},
 {id:'mont',n:'Monts gris',x:34,y:27,th:[4],lvl:10,pool:['golem','gull','wolf','crab'],elite:{7:'knightR'},boss:{k:'golem',s:'golemK',n:'Golem ancien',hp:2.6,dmg:1.4,h:1.5,bs:'quake'},
  // V4.16 (lot 6, liste ChatGPT) : 10 étapes, niveaux 10 à 12. Étape 8 = survie, élite de renfort : Chevalier rouge.
  fights:[{lvl:10,en:[GO,GU,GU]},{lvl:10,en:[GO,WO,WO]},{lvl:10,en:[KB,GO,WO]},{lvl:11,en:[GO,GO,GU]},{lvl:11,en:[KR,GO,WO],goal:'chief'},
   {lvl:11,en:[GO,GO,KB,CR]},{lvl:11,en:[GO,GO,WO,GU,GU]},{lvl:12,en:[GO,WO,GU],goal:'survive'},{lvl:12,en:[GO,GO,KR,WO,GU]},{lvl:12,en:[GO,WO,GU],tip:'quake'}]},
 {id:'chateau',n:'Château en ruine',x:62,y:18,th:[5],lvl:13,pool:['goblin','ghost','skel','goblin'],elite:{7:'knightN'},boss:{k:'knight',s:'knightK',n:'Chevalier noir',hp:2.4,dmg:1.3,h:1.35,bs:'rage'},
  // V4.17 (lot 7) : 10 étapes, niveaux 13 à 15. Étape 8 = survie, élite de renfort : Chevalier sombre.
  fights:[{lvl:13,en:[GB,GB,SK]},{lvl:13,en:[GB,GH,GH]},{lvl:13,en:[SK,SK,GH]},{lvl:14,en:[GB,GB,GB,GH]},{lvl:14,en:[KR,SK,GH],goal:'chief'},
   {lvl:14,en:[SK,SK,KB,GB]},{lvl:14,en:[SK,GB,GB,GH,GH]},{lvl:15,en:[SK,GB,GH],goal:'survive'},{lvl:15,en:[KN,SK,SK,GH,GB]},{lvl:15,en:[SK,GB,GH],tip:'rage'}]},
 {id:'cristal',n:'Cavernes de cristal',x:14,y:33,th:[6],lvl:16,pool:G6,boss:{k:'crygolem',s:'titan',n:'Titan prismatique',hp:3.2,dmg:1.4,h:1.55,bs:'beam'},sheets:['crygolem','qspider','prisbat','titan'],
  fights:[{lvl:16,en:[CG,CG,CG],cry:{a:1},tip:'amp'},{lvl:16,en:[CG,CG,'knightB','knightB'],cry:{a:2}},{lvl:17,en:[CG,CG,QS,QS,QS],cry:{a:2}},
   {lvl:17,en:[CG,CG,QS,QS,QS],cry:{p:1},tip:'prism'},{lvl:18,en:[CG,QS,QS,QS,QS],cry:{a:1,p:1},goal:'chief'},{lvl:18,en:[CG,CG,PB,PB,PB,PB],cry:{a:2}},
   {lvl:19,en:[CG,CG,QS,QS,PB,PB],cry:{p:2},goal:'survive'},{lvl:19,en:[CG,CG,QS,QS,PB,PB],cry:{a:2,p:2}},{lvl:20,en:[QS,CG,CG,QS,PB,PB],cry:{a:2,p:2},goal:'chief'},
   {lvl:20,en:[QS,QS,PB],cry:{a:2,p:2},tip:'beam'}]}];
// V4.29 : Forteresse de braise, 10 missions (région 7, carte II). Ouverte à tous depuis la V4.40, après le Titan.
// lava = {n : cases marquées à la fois, hot : chaque tour au lieu d'un tour sur deux}
const FE='fireel',OB='obsid',SA='salam';
export const R7={id:'braise',map:2,n:'Forteresse de braise',x:20,y:64,th:[7],lvl:21,pool:[FE,OB,SA],boss:{k:OB,s:'ignaros',n:'Ignaros',hp:3.4,dmg:1.3,h:1.5,bs:'forge'},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,OB]]}},
 fights:[{lvl:21,en:[SA,SA,SA],lava:{n:3},tip:'lava'},{lvl:21,en:[SA,SA,FE,FE],lava:{n:4}},{lvl:22,en:[OB,FE,FE,SA],lava:{n:4},tip:'pushfire'},
  {lvl:22,en:[OB,OB,SA,SA],lava:{n:5}},{lvl:23,en:[OB,FE,SA,SA],lava:{n:4},goal:'chief'},{lvl:23,en:[FE,FE,FE,OB,OB],lava:{n:5,hot:1}},
  {lvl:24,en:[SA,SA,OB,FE,FE],lava:{n:6}},{lvl:24,en:[SA,FE,SA],lava:{n:4},goal:'survive'},{lvl:25,en:[OB,OB,FE,SA,SA],lava:{n:5,hot:1},goal:'chief'},
  {lvl:25,en:[SA,FE],lava:{n:4},tip:'forge'}]};
export const CURSE_K=.5; // V4.42 : soins reçus par un héros maudit
export const LAVA_DMG=.12; // part des PV max perdue sur une case qui s'embrase
export const PREVIEW=!!globalThis.location?.search.includes('apercu=braise');
ZONES.push(R7);
// V4.42 : Temple des sables, 10 missions (région 8, carte II), après Ignaros. lava.trap = dalles piégées : 12 % des PV et −1 PM, les monstres du temple ne les déclenchent pas
const MU='mummy',SC='scorp',AN='anubis',T=n=>({n,trap:1});
export const R8={id:'sables',map:2,n:'Temple des sables',x:78,y:63,th:[8],lvl:26,pool:[MU,SC,AN],boss:{k:MU,s:'pharaoh',n:'Pharaon oublié',hp:3.6,dmg:1.3,h:1.6,bs:'tomb'},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,MU]]}},
 fights:[{lvl:26,en:[SC,SC,SC],lava:T(3),tip:'trap'},{lvl:26,en:[MU,SC,SC],lava:T(4),tip:'curse'},{lvl:27,en:[AN,AN,SC,SC],lava:T(4)},
  {lvl:27,en:[MU,MU,AN,SC],lava:T(4)},{lvl:28,en:[AN,MU,SC,SC],lava:T(4),goal:'chief'},{lvl:28,en:[SC,SC,SC,AN,AN],lava:T(5)},
  {lvl:29,en:[MU,MU,SC,AN,AN],lava:T(5)},{lvl:29,en:[SC,AN,SC],lava:T(4),goal:'survive'},{lvl:30,en:[MU,AN,AN,SC,SC],lava:{n:5,trap:1,hot:1},goal:'chief'},
  {lvl:30,en:[SC,AN],lava:T(4),tip:'tomb'}]};
ZONES.push(R8);
// V4.64 : Marais des âmes, 10 missions (région 9, carte II), après le Pharaon. Niveaux 31 à 35. V4.66 : crapauds venimeux, ents corrompus, spectres des marais ; boss Reine des marécages (`bs:'swamp'`, planche `queen`, clones fragiles sous la moitié de ses PV).
const TD='toad',EN='ent',WR='wraith';
export const R9={id:'marais',map:2,n:'Marais des âmes',x:23,y:41,th:[9],lvl:31,pool:[TD,EN,WR],boss:{k:TD,s:'queen',n:'Reine des marécages',hp:3.8,dmg:1.3,h:1.5,bs:'swamp',summon:{k:'queenling',n:2,hp:14,pm:4,dmg:[5,7],sn:'Clone de la Reine',snd:'bite'}},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,TD]]}},
 fights:[{lvl:31,en:[TD,TD,WR]},{lvl:31,en:[EN,WR,WR]},{lvl:32,en:[TD,TD,EN,WR]},{lvl:32,en:[WR,WR,WR,TD,EN]},
  {lvl:33,en:[EN,TD,WR,WR],goal:'chief'},{lvl:33,en:[TD,TD,TD,WR,WR]},{lvl:34,en:[WR,WR,WR,EN,TD,TD]},{lvl:34,en:[TD,EN,TD],goal:'survive'},
  {lvl:35,en:[EN,TD,TD,WR,WR],goal:'chief'},{lvl:35,en:[TD,WR],tip:'swamp'}]};
ZONES.push(R9);
// V4.67 : Citadelle céleste, 10 missions (région 10, carte II), après le Marais. Niveaux 36 à 40. Gardiens célestes, griffons royaux, sentinelles astrales ; boss Aetherion (`bs:'astral'`, planche `aetherion`) : sous la moitié de ses PV, 2 doubles astraux fragiles et coups +20 %. Téléportation annoncée et ancrages : pas encore codés.
const CGD='cguard',GRF='griffin',AST='astral';
export const R10={id:'citadelle',map:2,n:'Citadelle céleste',x:79,y:31,th:[10],lvl:36,pool:[CGD,GRF,AST],boss:{k:CGD,s:'aetherion',n:'Aetherion',hp:3.8,dmg:1.3,h:1.6,bs:'astral',summon:{k:'astralclone',n:2,hp:16,pm:4,dmg:[6,8],sn:'Double astral',snd:'slash'}},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,GRF]]}},
 fights:[{lvl:36,en:[CGD,GRF,AST]},{lvl:36,en:[GRF,GRF,AST]},{lvl:37,en:[CGD,CGD,AST,AST]},{lvl:37,en:[GRF,GRF,GRF,AST,CGD]},
  {lvl:38,en:[CGD,GRF,AST,AST],goal:'chief'},{lvl:38,en:[CGD,CGD,GRF,AST,AST]},{lvl:39,en:[GRF,GRF,AST,AST,CGD,CGD]},{lvl:39,en:[CGD,GRF,CGD],goal:'survive'},
  {lvl:40,en:[CGD,CGD,GRF,AST,AST],goal:'chief'},{lvl:40,en:[CGD,AST],tip:'astral'}]};
ZONES.push(R10);
// V4.68 : Terres du Givre éternel, 10 missions (région 11, carte II), après la Citadelle. Niveaux 41 à 45. Loups polaires, yétis, élémentaires de givre ; boss Roi du Givre (`bs:'frost'`, planche `frostking`) : sous la moitié de ses PV, coups +20 %, équipe gelée (−1 PM) et 2 éclats de givre fragiles. Sols et obstacles provisoires (ceux des Monts gris) en attendant les planches de Gemini ; fond paysage = recadrage du fond portrait.
const PW='polarwolf',YT='yeti',FE2='frostel';
export const R11={id:'givre',map:2,n:'Terres du Givre Éternel',x:20,y:18,th:[11],lvl:41,pool:[PW,YT,FE2],boss:{k:YT,s:'frostking',n:'Roi du Givre',hp:3.8,dmg:1.3,h:1.65,bs:'frost',summon:{k:'frostclone',n:2,hp:18,pm:4,dmg:[6,8],sn:'Éclat de givre',snd:'slash'}},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,PW]]}},
 fights:[{lvl:41,en:[PW,PW,YT]},{lvl:41,en:[PW,PW,PW,FE2]},{lvl:42,en:[YT,YT,PW]},{lvl:42,en:[FE2,FE2,PW,PW]},
  {lvl:43,en:[YT,PW,PW,FE2],goal:'chief'},{lvl:43,en:[YT,YT,FE2,PW,PW]},{lvl:44,en:[PW,PW,PW,FE2,FE2,YT]},{lvl:44,en:[YT,FE2,PW],goal:'survive'},
  {lvl:45,en:[YT,YT,FE2,PW,PW],goal:'chief'},{lvl:45,en:[YT,FE2],tip:'frost'}]};
ZONES.push(R11);
// V4.73 : Sanctuaire de l'Éther, 10 missions (région 12, carte II), après les Terres du Givre. Niveaux 46 à 50. Aberrations, chevaliers de l'Éther, gardiens du Sanctuaire ; boss Briseur primordial (`bs:'breaker'`, planche `breaker`) : sous la moitié de ses PV, coups +25 %, équipe à armure brisée (+15 % de dégâts subis, 2 tours) et 2 éclats d'éther fragiles. Valeurs provisoires, pas d'équilibrage.
const AB='etherbeast',EK='etherknight',SG='sanctguard';
export const R12={id:'eter',map:2,n:'Sanctuaire de l’Éther',x:61,y:13,th:[12],lvl:46,pool:[AB,EK,SG],boss:{k:SG,s:'breaker',n:'Briseur primordial',hp:4.2,dmg:1.35,h:1.7,bs:'breaker',summon:{k:'etherclone',n:2,hp:20,pm:4,dmg:[7,9],sn:'Éclat d’éther',snd:'bite'}},
 waves:{7:{turns:5,cap:5,start:3,add:[[2,1],[3,1],[4,1,AB]]}},
 fights:[{lvl:46,en:[AB,AB,EK]},{lvl:46,en:[AB,AB,AB,SG]},{lvl:47,en:[EK,EK,AB]},{lvl:47,en:[SG,SG,AB,AB]},
  {lvl:48,en:[EK,AB,AB,SG],goal:'chief'},{lvl:48,en:[EK,EK,SG,AB,AB]},{lvl:49,en:[AB,AB,AB,SG,SG,EK]},{lvl:49,en:[EK,SG,AB],goal:'survive'},
  {lvl:50,en:[EK,EK,SG,AB,AB],goal:'chief'},{lvl:50,en:[EK,SG],tip:'breaker'}]};
ZONES.push(R12);
export const VET_LVL=25,VET_FORCE=!!globalThis.location?.search.includes('veterans');
// V4.25 : carte II (régions 7 à 12). Aucune mission encore : noms et repères seulement, hors de ZONES (sauvegarde inchangée).
// Coordonnées en % de l'image : x,y sur world2.webp (vertical), lx,ly sur world2-l.webp (écran horizontal).
export const MAP2=[{n:'Forteresse de braise',x:20,y:64,lx:23,ly:69},{n:'Temple des sables',x:78,y:63,lx:73,ly:69},
 {n:'Marais des âmes',x:23,y:41,lx:21,ly:45},{n:'Citadelle céleste',x:79,y:31,lx:76,ly:32},
 {n:'Terres du Givre Éternel',x:20,y:18,lx:25,ly:21},{n:'Sanctuaire de l’Éther',x:61,y:13,lx:52,ly:22}];
// nombre de combats d'une zone (le dernier est le boss)
export const zlen=z=>z.fights?z.fights.length:4;
// V4.7a : sl = emplacement (arme, armure, bijou, accessoire). Seul l'objet équipé dans chaque emplacement donne son bonus (save.eq).
// V4.7c : caractéristiques. 1 point par niveau et par héros (niveau 1 : 0 point). who = héros pour qui elle sert.
// Effet par point « utile » : les 10 premiers comptent en entier, les 10 suivants à moitié, le reste au quart.
export const ATTR={for:{n:'Force',who:[0,1],d:'+1 % de dégâts',dmg:.01},int:{n:'Intelligence',who:[2],d:'+1 % de dégâts et de soins',dmg:.01},
 vit:{n:'Vitalité',who:[0,1,2],d:'+2 % de PV',hp:.02},agi:{n:'Agilité',who:[0,1,2],d:'+0,5 % de critique, +0,4 % d’esquive',crit:.005,dodge:.004}};
export const CRIT_CAP=.35,DODGE_CAP=.25; // plafonds atteignables avec l'Agilité (un talent plus fort garde sa valeur)
export const SLOTS={arme:'Arme',armure:'Armure',bijou:'Bijou',accessoire:'Accessoire'};
export const ITEMS=[
 {ic:0,n:'Épée courte',pr:60,who:0,dmg:2,sl:'arme'},{ic:1,n:'Hache de guerre',pr:120,who:0,dmg:3,sl:'arme'},{ic:4,n:'Bouclier rond',pr:90,who:0,hp:8,sl:'accessoire'},{ic:5,n:'Heaume',pr:70,who:0,hp:6,sl:'armure'},
 {ic:2,n:'Arc long',pr:60,who:1,dmg:2,sl:'arme'},{ic:6,n:'Armure de cuir',pr:70,who:1,hp:6,sl:'armure'},{ic:7,n:'Bottes de cuir',pr:50,who:1,hp:4,sl:'accessoire'},
 {ic:3,n:'Bâton de saule',pr:60,who:2,heal:3,sl:'arme'},{ic:8,n:'Anneau de rubis',pr:100,who:2,dmg:2,sl:'bijou'},{ic:9,n:'Amulette',pr:70,who:2,hp:6,sl:'bijou'},
 // V4.12 (lot 3, table ChatGPT eq11-eq22) : planche « equip », rareté fixe (rr), niveau requis (lv), source (shop = marchand seul, loot = butin seul),
 // who = liste quand plusieurs héros peuvent le porter (un seul porteur à la fois). Bonus = bases avant rareté et forge. Index 10 à 21, ne jamais réordonner.
 {id:'eq11',s:'equip',ic:0,n:'Épée de recrue',pr:65,who:0,dmg:2,sl:'arme',lv:2,rr:0,src:'shop'},
 {id:'eq12',s:'equip',ic:1,n:'Arc du pisteur',pr:125,who:1,dmg:2,sl:'arme',lv:7,rr:1,src:'shop'},
 {id:'eq13',s:'equip',ic:2,n:'Bâton du guérisseur',pr:125,who:2,heal:2,sl:'arme',lv:7,rr:1,src:'shop'},
 {id:'eq14',s:'equip',ic:3,n:'Cuirasse de garde',pr:80,who:0,hp:6,sl:'armure',lv:3,rr:0,src:'shop'},
 {id:'eq15',s:'equip',ic:4,n:'Cuir du voyageur',pr:75,who:1,hp:6,sl:'armure',lv:3,rr:0,src:'loot'},
 {id:'eq16',s:'equip',ic:5,n:'Robe de l’apprentie',pr:75,who:2,hp:6,sl:'armure',lv:3,rr:0,src:'shop'},
 {id:'eq17',s:'equip',ic:6,n:'Anneau de vigueur',pr:65,who:[0,1,2],hp:4,sl:'bijou',lv:4,rr:0,src:'loot'},
 {id:'eq18',s:'equip',ic:7,n:'Bracelet de précision',pr:115,who:1,dmg:1,sl:'bijou',lv:8,rr:1,src:'loot'},
 {id:'eq19',s:'equip',ic:8,n:'Bouclier du rempart',pr:140,who:0,hp:6,sl:'accessoire',lv:8,rr:1,src:'shop'},
 {id:'eq20',s:'equip',ic:9,n:'Bottes du marcheur',pr:60,who:[0,1,2],hp:4,sl:'accessoire',lv:4,rr:0,src:'shop'},
 {id:'eq21',s:'equip',ic:10,n:'Gants de combat',pr:80,who:[0,1],dmg:1,sl:'accessoire',lv:5,rr:0,src:'loot'},
 {id:'eq22',s:'equip',ic:11,n:'Grimoire de l’aube',pr:130,who:2,heal:2,sl:'accessoire',lv:8,rr:1,src:'loot'},
 // V4.22 : les 41 restants (eq23-eq63, TABLE-EQUIPEMENTS-42.md, lancés sur demande de Max le 27/11). Index 22 à 62.
 {id:'eq23',s:'equip',ic:12,n:'Lame d’acier bleu',pr:130,who:0,dmg:2,sl:'arme',lv:8,rr:1,src:'shop'},
 {id:'eq24',s:'equip',ic:13,n:'Épée dorée',pr:220,who:0,dmg:2,sl:'arme',lv:16,rr:2,src:'loot'},
 {id:'eq25',s:'equip',ic:14,n:'Arc de chasse',pr:65,who:1,hp:4,sl:'arme',lv:3,rr:0,src:'shop'},
 {id:'eq26',s:'equip',ic:15,n:'Arc sylvestre',pr:220,who:1,dmg:2,sl:'arme',lv:16,rr:2,src:'loot'},
 {id:'eq27',s:'equip',ic:16,n:'Bâton d’écorce',pr:70,who:2,dmg:2,sl:'arme',lv:5,rr:0,src:'shop'},
 {id:'eq28',s:'equip',ic:17,n:'Sceptre cristallin',pr:230,who:2,heal:2,sl:'arme',lv:16,rr:2,src:'loot'},
 {id:'eq29',s:'equip',ic:18,n:'Cuirasse à épaulières',pr:135,who:0,hp:6,sl:'armure',lv:9,rr:1,src:'shop'},
 {id:'eq30',s:'equip',ic:19,n:'Armure du lion',pr:230,who:0,hp:6,sl:'armure',lv:17,rr:2,src:'loot'},
 {id:'eq31',s:'equip',ic:20,n:'Bouclier du lion',pr:240,who:0,hp:6,sl:'accessoire',lv:16,rr:2,src:'loot'},
 {id:'eq32',s:'equip',ic:21,n:'Heaume de duelliste',pr:70,who:0,dmg:1,sl:'armure',lv:5,rr:0,src:'shop'},
 {id:'eq33',s:'equip',ic:22,n:'Heaume à plume',pr:125,who:0,dmg:1,sl:'armure',lv:10,rr:1,src:'shop'},
 {id:'eq34',s:'equip',ic:23,n:'Heaume du commandant',pr:240,who:0,dmg:2,sl:'armure',lv:18,rr:2,src:'loot'},
 {id:'eq35',s:'equip',ic:24,n:'Cuir sombre',pr:120,who:1,hp:6,sl:'armure',lv:9,rr:1,src:'shop'},
 {id:'eq36',s:'equip',ic:25,n:'Tenue elfique',pr:220,who:1,hp:6,sl:'armure',lv:17,rr:2,src:'loot'},
 {id:'eq37',s:'equip',ic:26,n:'Robe d’améthyste',pr:125,who:2,hp:6,sl:'armure',lv:9,rr:1,src:'shop'},
 {id:'eq38',s:'equip',ic:27,n:'Robe de l’aube',pr:225,who:2,hp:6,sl:'armure',lv:17,rr:2,src:'loot'},
 {id:'eq39',s:'equip',ic:28,n:'Cape de voyage',pr:60,who:[0,1],dmg:1,sl:'armure',lv:5,rr:0,src:'loot'},
 {id:'eq40',s:'equip',ic:29,n:'Cape forestière',pr:115,who:[0,1],dmg:1,sl:'armure',lv:11,rr:1,src:'loot'},
 {id:'eq41',s:'equip',ic:30,n:'Cape d’archimage',pr:225,who:2,heal:2,sl:'armure',lv:17,rr:2,src:'loot'},
 {id:'eq42',s:'equip',ic:31,n:'Anneau de saphir',pr:115,who:[0,1,2],dmg:1,sl:'bijou',lv:9,rr:1,src:'loot'},
 {id:'eq43',s:'equip',ic:32,n:'Anneau d’émeraude',pr:200,who:[0,1,2],hp:4,sl:'bijou',lv:16,rr:2,src:'shop'},
 {id:'eq44',s:'equip',ic:33,n:'Collier de lune',pr:65,who:2,heal:1,sl:'bijou',lv:5,rr:0,src:'loot'},
 {id:'eq45',s:'equip',ic:34,n:'Collier du soleil',pr:120,who:[0,1,2],hp:4,sl:'bijou',lv:10,rr:1,src:'shop'},
 {id:'eq46',s:'equip',ic:35,n:'Collier de turquoise',pr:210,who:2,heal:2,sl:'bijou',lv:17,rr:2,src:'loot'},
 {id:'eq47',s:'equip',ic:36,n:'Bracelet clouté',pr:70,who:[0,1],dmg:1,sl:'bijou',lv:6,rr:0,src:'loot'},
 {id:'eq48',s:'equip',ic:37,n:'Bracelet d’émeraude',pr:190,who:[0,1],dmg:1,sl:'bijou',lv:17,rr:2,src:'loot'},
 {id:'eq49',s:'equip',ic:38,n:'Bottes ailées d’argent',pr:120,who:[0,1,2],hp:4,sl:'accessoire',lv:10,rr:1,src:'shop'},
 {id:'eq50',s:'equip',ic:39,n:'Bottes ailées dorées',pr:200,who:[0,1,2],hp:4,sl:'accessoire',lv:17,rr:2,src:'loot'},
 {id:'eq51',s:'equip',ic:40,n:'Gantelets d’acier',pr:120,who:[0,1],dmg:1,sl:'accessoire',lv:10,rr:1,src:'shop'},
 {id:'eq52',s:'equip',ic:41,n:'Gantelets dorés',pr:200,who:[0,1],dmg:1,sl:'accessoire',lv:17,rr:2,src:'loot'},
 {id:'eq53',s:'equip',ic:42,n:'Ceinture de cuir',pr:65,who:[0,1,2],hp:4,sl:'accessoire',lv:6,rr:0,src:'shop'},
 {id:'eq54',s:'equip',ic:43,n:'Ceinture feuillue',pr:115,who:[0,1,2],hp:4,sl:'accessoire',lv:11,rr:1,src:'loot'},
 {id:'eq55',s:'equip',ic:44,n:'Ceinture de parade',pr:200,who:[0,1,2],hp:4,sl:'accessoire',lv:18,rr:2,src:'loot'},
 {id:'eq56',s:'equip',ic:45,n:'Relique de bois',pr:65,who:[0,1,2],hp:4,sl:'accessoire',lv:5,rr:0,src:'loot'},
 {id:'eq57',s:'equip',ic:46,n:'Relique d’argent',pr:115,who:[0,1,2],hp:4,sl:'accessoire',lv:11,rr:1,src:'shop'},
 {id:'eq58',s:'equip',ic:47,n:'Relique ailée',pr:240,who:[0,1,2],hp:6,sl:'accessoire',lv:18,rr:2,src:'loot'},
 {id:'eq59',s:'equip',ic:48,n:'Livre de voyage',pr:70,who:2,heal:2,sl:'accessoire',lv:5,rr:0,src:'shop'},
 {id:'eq60',s:'equip',ic:49,n:'Grimoire violet',pr:215,who:2,heal:2,sl:'accessoire',lv:17,rr:2,src:'loot'},
 {id:'eq61',s:'equip',ic:50,n:'Cristal ardent',pr:70,who:2,dmg:1,sl:'accessoire',lv:6,rr:0,src:'shop'},
 {id:'eq62',s:'equip',ic:51,n:'Cristal de glace',pr:125,who:2,hp:6,sl:'accessoire',lv:11,rr:1,src:'loot'},
 {id:'eq63',s:'equip',ic:52,n:'Emblème ailé',pr:250,who:[0,1,2],hp:6,sl:'accessoire',lv:19,rr:2,src:'loot'},
 // V4.64 : équipement dédié de Nyra (4) et Lyria (5), TABLE-EQUIPEMENTS-NYRA-LYRIA.md (ChatGPT). Icônes réemployées, exclusifs (who 4 ou 5), paliers liés au recrutement (30 / 40), valeurs pilotes
 {id:'eq64',s:'equip',ic:12,n:'Lame de l’ombre',pr:155,who:4,dmg:3,sl:'arme',lv:30,rr:1,src:'shop'},
 {id:'eq65',s:'equip',ic:13,n:'Lame du crépuscule',pr:260,who:4,dmg:3,sl:'arme',lv:35,rr:2,src:'loot'},
 {id:'eq66',s:'equip',ic:24,n:'Cuir des ombres',pr:150,who:4,hp:8,sl:'armure',lv:30,rr:1,src:'shop'},
 {id:'eq67',s:'equip',ic:29,n:'Cape de la nuit',pr:245,who:4,dmg:2,sl:'armure',lv:35,rr:2,src:'loot'},
 {id:'eq68',s:'equip',ic:36,n:'Bracelet du duelliste',pr:140,who:4,dmg:2,sl:'bijou',lv:30,rr:1,src:'shop'},
 {id:'eq69',s:'equip',ic:31,n:'Anneau du voile',pr:230,who:4,hp:6,sl:'bijou',lv:35,rr:2,src:'loot'},
 {id:'eq70',s:'equip',ic:38,n:'Bottes du rôdeur',pr:140,who:4,hp:6,sl:'accessoire',lv:30,rr:1,src:'shop'},
 {id:'eq71',s:'equip',ic:40,n:'Gants de l’assassin',pr:235,who:4,dmg:2,sl:'accessoire',lv:35,rr:2,src:'loot'},
 {id:'eq72',s:'equip',ic:12,n:'Épée du serment',pr:155,who:5,dmg:3,sl:'arme',lv:40,rr:1,src:'shop'},
 {id:'eq73',s:'equip',ic:13,n:'Épée de l’aurore',pr:260,who:5,dmg:3,sl:'arme',lv:45,rr:2,src:'loot'},
 {id:'eq74',s:'equip',ic:18,n:'Cuirasse de la sentinelle',pr:165,who:5,hp:8,sl:'armure',lv:40,rr:1,src:'shop'},
 {id:'eq75',s:'equip',ic:19,n:'Armure du bastion',pr:270,who:5,hp:8,sl:'armure',lv:45,rr:2,src:'loot'},
 {id:'eq76',s:'equip',ic:34,n:'Collier du serment',pr:145,who:5,hp:6,sl:'bijou',lv:40,rr:1,src:'shop'},
 {id:'eq77',s:'equip',ic:35,n:'Collier de la lumière',pr:235,who:5,heal:2,sl:'bijou',lv:45,rr:2,src:'loot'},
 {id:'eq78',s:'equip',ic:20,n:'Bouclier de la gardienne',pr:165,who:5,hp:8,sl:'accessoire',lv:40,rr:1,src:'shop'},
 {id:'eq79',s:'equip',ic:47,n:'Relique de l’aurore',pr:245,who:5,heal:2,sl:'accessoire',lv:45,rr:2,src:'loot'},
  // V4.75 : objets signature (src 'quest' : ni boutique ni butin, uniquement en récompense des quêtes Q37 à Q40). Icônes réutilisées, aucun nouvel art. Épiques, un cran au-dessus des objets de butin.
  {id:'sg79',s:'equip',ic:13,n:'Lame de l’honneur',pr:300,who:0,dmg:4,sl:'arme',lv:20,rr:2,src:'quest'},
  {id:'sg80',s:'equip',ic:17,n:'Sceptre de la voix claire',pr:300,who:2,heal:3,sl:'arme',lv:33,rr:2,src:'quest'},
  {id:'sg81',s:'equip',ic:15,n:'Arc du serment commun',pr:300,who:1,dmg:4,sl:'arme',lv:38,rr:2,src:'quest'},
  {id:'sg82',s:'equip',ic:35,n:'Orbe du serment commun',pr:300,who:[0,1,2,3,4,5],dmg:3,sl:'bijou',lv:38,rr:2,src:'quest'},
  {id:'sg83',s:'equip',ic:12,n:'Lames du serment commun',pr:300,who:4,dmg:4,sl:'arme',lv:38,rr:2,src:'quest'},
  {id:'sg84',s:'equip',ic:12,n:'Épée du serment commun',pr:300,who:5,dmg:4,sl:'arme',lv:38,rr:2,src:'quest'},
  {id:'sg85',s:'equip',ic:47,n:'Médaille du village',pr:300,who:[0,1,2,3,4,5],hp:8,sl:'accessoire',lv:45,rr:2,src:'quest'},
  // V5.0 lot 2 (gel RPG) : 34 entrées, 86 → 120. Kael/Fenn/Aelis : paliers 25 (marchand) et 35 (butin) ; Orion : équipement dédié, paliers 20/30/40 ; signature d’Orion (Q39). Icônes réemployées, exclusifs (who 0 à 3), valeurs pilotes.
  {id:'eq87',s:'equip',ic:12,n:'Lame du vétéran',pr:155,who:0,dmg:3,sl:'arme',lv:25,rr:1,src:'shop'},
  {id:'eq88',s:'equip',ic:18,n:'Cuirasse du capitaine',pr:150,who:0,hp:8,sl:'armure',lv:25,rr:1,src:'shop'},
  {id:'eq89',s:'equip',ic:36,n:'Bracelet de guerre',pr:140,who:0,dmg:2,sl:'bijou',lv:25,rr:1,src:'shop'},
  {id:'eq90',s:'equip',ic:8,n:'Bouclier de la garde',pr:145,who:0,hp:8,sl:'accessoire',lv:25,rr:1,src:'shop'},
  {id:'eq91',s:'equip',ic:13,n:'Épée du champion',pr:260,who:0,dmg:3,sl:'arme',lv:35,rr:2,src:'loot'},
  {id:'eq92',s:'equip',ic:19,n:'Armure du lion d’or',pr:265,who:0,hp:8,sl:'armure',lv:35,rr:2,src:'loot'},
  {id:'eq93',s:'equip',ic:37,n:'Bracelet du conquérant',pr:235,who:0,dmg:2,sl:'bijou',lv:35,rr:2,src:'loot'},
  {id:'eq94',s:'equip',ic:20,n:'Écu du grand maître',pr:250,who:0,hp:8,sl:'accessoire',lv:35,rr:2,src:'loot'},
  {id:'eq95',s:'equip',ic:14,n:'Arc du grand chasseur',pr:155,who:1,dmg:3,sl:'arme',lv:25,rr:1,src:'shop'},
  {id:'eq96',s:'equip',ic:25,n:'Tenue du ranger',pr:145,who:1,hp:6,sl:'armure',lv:25,rr:1,src:'shop'},
  {id:'eq97',s:'equip',ic:7,n:'Bracelet d’archer',pr:140,who:1,dmg:2,sl:'bijou',lv:25,rr:1,src:'shop'},
  {id:'eq98',s:'equip',ic:38,n:'Bottes du traqueur',pr:140,who:1,hp:6,sl:'accessoire',lv:25,rr:1,src:'shop'},
  {id:'eq99',s:'equip',ic:15,n:'Arc de l’aigle',pr:260,who:1,dmg:3,sl:'arme',lv:35,rr:2,src:'loot'},
  {id:'eq100',s:'equip',ic:24,n:'Cuir du maître-archer',pr:245,who:1,hp:6,sl:'armure',lv:35,rr:2,src:'loot'},
  {id:'eq101',s:'equip',ic:37,n:'Bracelet du faucon',pr:230,who:1,dmg:2,sl:'bijou',lv:35,rr:2,src:'loot'},
  {id:'eq102',s:'equip',ic:39,n:'Bottes du vent',pr:235,who:1,hp:6,sl:'accessoire',lv:35,rr:2,src:'loot'},
  {id:'eq103',s:'equip',ic:17,n:'Sceptre de lumière',pr:155,who:2,heal:3,sl:'arme',lv:25,rr:1,src:'shop'},
  {id:'eq104',s:'equip',ic:27,n:'Robe du soleil levant',pr:150,who:2,hp:8,sl:'armure',lv:25,rr:1,src:'shop'},
  {id:'eq105',s:'equip',ic:33,n:'Collier de pleine lune',pr:140,who:2,heal:2,sl:'bijou',lv:25,rr:1,src:'shop'},
  {id:'eq106',s:'equip',ic:48,n:'Livre de prières',pr:140,who:2,heal:2,sl:'accessoire',lv:25,rr:1,src:'shop'},
  {id:'eq107',s:'equip',ic:16,n:'Bâton de vie',pr:260,who:2,heal:3,sl:'arme',lv:35,rr:2,src:'loot'},
  {id:'eq108',s:'equip',ic:30,n:'Cape de la grande prêtresse',pr:245,who:2,hp:8,sl:'armure',lv:35,rr:2,src:'loot'},
  {id:'eq109',s:'equip',ic:35,n:'Collier d’étoile',pr:230,who:2,heal:2,sl:'bijou',lv:35,rr:2,src:'loot'},
  {id:'eq110',s:'equip',ic:49,n:'Grimoire sacré',pr:235,who:2,heal:2,sl:'accessoire',lv:35,rr:2,src:'loot'},
  {id:'eq111',s:'equip',ic:16,n:'Bâton d’écorce runique',pr:150,who:3,dmg:3,sl:'arme',lv:20,rr:1,src:'shop'},
  {id:'eq112',s:'equip',ic:26,n:'Robe de l’érudit',pr:140,who:3,hp:6,sl:'armure',lv:20,rr:1,src:'shop'},
  {id:'eq113',s:'equip',ic:31,n:'Anneau du mage',pr:130,who:3,dmg:2,sl:'bijou',lv:20,rr:1,src:'shop'},
  {id:'eq114',s:'equip',ic:48,n:'Livre d’études',pr:130,who:3,hp:6,sl:'accessoire',lv:20,rr:1,src:'shop'},
  {id:'eq115',s:'equip',ic:17,n:'Sceptre arcanique',pr:255,who:3,dmg:3,sl:'arme',lv:30,rr:2,src:'loot'},
  {id:'eq116',s:'equip',ic:30,n:'Cape de l’arcaniste',pr:240,who:3,hp:6,sl:'armure',lv:30,rr:2,src:'loot'},
  {id:'eq117',s:'equip',ic:32,n:'Anneau d’arcaniste',pr:225,who:3,dmg:2,sl:'bijou',lv:30,rr:2,src:'loot'},
  {id:'eq118',s:'equip',ic:49,n:'Grimoire d’arcane',pr:230,who:3,dmg:2,sl:'accessoire',lv:30,rr:2,src:'loot'},
  {id:'eq119',s:'equip',ic:17,n:'Sceptre de l’Éther',pr:270,who:3,dmg:3,sl:'arme',lv:40,rr:2,src:'loot'},
  {id:'sg119',s:'equip',ic:16,n:'Bâton du serment commun',pr:300,who:3,dmg:4,sl:'arme',lv:38,rr:2,src:'quest'}];
// icône d'un objet ; héros qui peuvent le porter
export const icOf=o=>[o.s||'items',o.ic];
export const whoOf=o=>Array.isArray(o.who)?o.who:[o.who];
export const whoName=o=>whoOf(o).length===HER.length?'Tous les héros':whoOf(o).map(i=>HER[i].n).join(', ');
// V4.12 : ce que regroupe chaque emplacement (4 emplacements gardés pour le pilote : un casque concurrence l'armure, un bouclier les bottes…)
export const SLOT_D={arme:'épées, arcs, bâtons',armure:'armures, tenues, robes, casques, capes',bijou:'anneaux, colliers, bracelets',accessoire:'boucliers, bottes, gants, ceintures, reliques, livres'};
// V4.0 : ts = planche de sol propre au thème (sol_<zone>, tiles5), g = cases de cette planche ; l'eau (4) et la roche (8) restent dans tiles4
// tuiles : 0 herbe 1 fleurs 2 terre 3 sable 4 eau 5 pavés 6 sous-bois 7 dalles
// décors : 0 chêne 1 sapin 2 buisson 3 caillou 4 rocher 5 fleurs 6 souche 7 barrière 8 caisse 9 puits 10 chaumière 11 panneau
export const THEMES=[
 {n:'Prairie',ts:'sol_prairie',g:[0,0,2,2,5,5,1,3,4,7],obs:[0,0,2,3,4,6],water:1},
 {n:'Bois sombre',ts:'sol_bois',g:[0,0,2,3,3,1],obs:[1,1,1,0,2,6,4],water:0},
 {n:'Village',ts:'sol_prairie',g:[1,1,7,7,3,0],obs:[8,8,2,3,0,9],water:0},
 {n:'Plage',ts:'sol_plage',g:[0,1,2,3],obs:[3,4,2,8],water:3},
 {n:'Monts gris',ts:'sol_mont',g:[0,1,2,3],obs:[20,20,21,4,3,19],rock:4,noflower:1,out:[20,21,19,20,4]},
 {n:'Château en ruine',ts:'sol_chateau',g:[0,1,1,3],obs:[12,13,14,15,16,17,18,22],noflower:1,out:[12,13,22,16,14]},
 {n:'Cavernes de cristal',ts:'tiles5',g:[0,0,1,1,5,5,6,2,3,7],obs:[24,25,26,27,28,29],noflower:1,out:[24,25,27,26],cave:1},
 // V4.32 : dalles et obstacles R7-09 / R7-10 (Gemini)
 {n:'Forteresse de braise',ts:'sol_braise',g:[0,0,0,0,5,5,6,6,2,7,3],obs:[30,31,32,33,34,35],noflower:1,out:[30,31,32,30]},
 // V4.42 : sols et obstacles R8 (Gemini), une grande dalle par case. Sols : 0-1 grès, 2 hiéroglyphes, 3-4 sable, 5 pierre sombre, 6-7 dalles d'or
 {n:'Temple des sables',ts:'sol_sables',g:[0,0,1,1,3,3,4,2,5,6,7],obs:[36,37,38,39,40,41,42,43],noflower:1,out:[36,39,40,37,42]},
 // V4.64 : sols et obstacles R9 (Gemini). Sols : 0-1 dalles vert-gris, 2 dalles moussues, 3 ardoise lisse, 4 boue sombre, 5 terre brune, 6 ardoise bleue, 7 planches. Obstacles 44 souche, 45 tronc, 46 éboulis, 47 rocher, 48 muret, 49 racines, 50 statue, 51 arche
 {n:'Marais des âmes',ts:'sol_marais',g:[0,0,1,2,2,3,4,4,5,5,6,7],obs:[44,45,46,47,48,49,50,51],noflower:1,out:[44,47,50,51,49]},
 // V4.67 : sols et obstacles R10 (Gemini). Sols : 0 grès poreux, 1 marbre crème, 2 dalles blanches, 3 briques bicolores, 4 marbre gris, 5 sable doré, 6 dalles à filets d'or, 7 pavés. Obstacles 52 balustrade, 53 éboulis, 54 colonne couchée, 55 aile de pierre, 56 vasque, 57 piédestal, 58 colonne brisée, 59 statue d'ange
 {n:'Citadelle céleste',ts:'sol_celeste',g:[1,1,2,2,4,6,6,5,3,7,0,2],obs:[52,53,54,55,56,57,58,59],noflower:1,out:[52,53,54,57,58,55]},
 // V4.70 : obstacles R11 (Gemini) 60 rocher enneigé, 61 tronc, 62 éboulis, 63 sarcophage, 64 traîneau, 65 muret, 66 pilier, 67 monolithe de glace. V4.69 : sols R11 (Gemini) : 0 et 5 neige, 1 et 6 dalles sombres poudrées, 2 dalles sur terre, 3 pavés sombres, 4 dalles grises, 7 pavés givrés
 {n:'Terres du Givre Éternel',ts:'sol_givre',g:[0,1,1,2,4,5,6,6,3,7,0,4],obs:[60,61,62,63,64,65,66,67],noflower:1,out:[60,62,65,66,67,61]},
 // V4.73 : sols R12 (Gemini, image 2003) : 0 ardoise unie, 1 grandes dalles, 2 mosaïque bordée de pierre claire, 3 ardoise à filet doré, 4 croisée de bandes brunes, 5 gris uni, 6 pavés bleutés, 7 gris usé. Obstacles (2004) 68 mur en ruine, 69 grille de bois, 70 escalier, 71 vasque, 72 coin de mur brisé, 73 balustrade, 74 obélisque sombre, 75 obélisque clair, 76 arche courbe
 {n:'Sanctuaire de l’Éther',ts:'sol_eter',g:[0,0,1,1,3,5,5,6,6,7,2,4],obs:[68,69,70,71,72,73,74,75,76],noflower:1,out:[68,70,73,74,75,76]}];
// V4.1 : décors bas (buisson, caillou, fleurs, souche, barrière, caisses, ossements, coffre, pieux) : ils bloquent le passage mais pas les flèches en cloche de Fenn (sorts `lob`)
export const LOW=new Set([2,3,5,6,7,8,16,17,23,26,28,29,34,35,38,41,44,45,46,48,49,52,53,54,55,60,61,62,63,64,65,68,69,70,71,72,73]); // V4.64 : souche, tronc, éboulis, muret, racines (R9)
// tuiles 8-15 = 2e planche (8 roche, 9 gravier, 10 neige, 11 grotte, 12 dalles, 13 briques, 14 runes, 15 planches) ; décors 12-23 = 2e planche
export const DECO_W=[1.2,1.1,.9,.55,1.1,.8,.75,1,1,1.1,2.2,.7, .62,.62,.6,.7,.9,.85,.8,.5,1,1.1,.62,.95, 1.05,1,.9,.9,1,.9, .86,.72,.8,.82,.74,.98, .66,.78,.98,.6,.8,.86,.95,.8, .66,1,.95,.8,.9,.9,.5,.72, 1.05,.9,.95,.8,.75,.7,.6,.62, 1,1.1,.95,.9,.95,1.05,.6,.62, .95,1.1,.9,.8,.9,1.05,.6,.65,.9]; // V4.64 : 44 à 51 = obstacles R9 (deco6) ; V4.67 : 52 à 59 = obstacles R10 (deco7) ; V4.70 : 60 à 67 = obstacles R11 (deco8) ; V4.73 : 68 à 76 = obstacles R12 (deco9)
export const DEC=d=>d>=68?['deco9',d-68]:d>=60?['deco8',d-60]:d>=52?['deco7',d-52]:d<12?['deco',d]:d<24?['deco2',d-12]:d<30?['deco3',d-24]:d<36?['deco4',d-30]:d<44?['deco5',d-36]:['deco6',d-44],TIL=t=>t<8?['tiles',t]:['tiles2',t-8];
export const DIRS=[[1,0],[0,1],[0,-1],[-1,0]]; // index = direction du sprite : 0 bas-droite 1 bas-gauche 2 haut-droite 3 haut-gauche
export const R=16, CMAX=5;
// V2.3 (proposition Claude, à revoir par ChatGPT) : poussée, combos, étoiles
// V2.4b forge : coût de chaque niveau (1 à 3) ; chaque niveau ajoute +50 % du bonus de base de l'objet
// marchand (V2.6a) : potion de soin, 3 objets différents proposés chaque jour, revente à 50 %
export const POTION={cost:30,max:3}, SHOP_N=3, SELL_K=.5;
// raretés (V2.6d) : commun, rare, épique — multiplient le bonus de l'objet
export const RARE=[{n:'Commun',k:1,c:'#e8dcc0'},{n:'Rare',k:1.5,c:'#6fb6ff'},{n:'Épique',k:2,c:'#c98bff'}];
export const FORGE_COST=[25,60,120], FORGE_STEP=.5;
// cristaux (V4.0b) : amplificateur +30 % (dégâts directs et soins, lanceur sur une case voisine), prisme 70 % des dégâts moyens aux 4 voisines, éteint 2 tours de table
export const AMP=.3, PRISM=.7, PRISM_OFF=2;
// V4.1 : PA non dépensés par un héros : +1 au tour suivant par tranche de 2, au plus +2
export const PA_CARRY={per:2,max:2};
// V4.5c (variante B, choisie par Max et ChatGPT) : un héros qui relance le même sort dans le même tour paie +1 PA à partir du 2e lancer
export const PA_RULE={recast:1};
export const PUSH_DMG=5, COMBO=[1,1,1.15,1.3], STAR_ROUNDS={fight:5,boss:7};

addOrion();addRecruit(NYRA,['for','vit','agi']);addRecruit(LYRIA,['for','int','vit']); // V4.40 : recrutable au niveau 20. En fin de fichier : HER, ATTR et ITEMS doivent exister
// V4.59 : équipement de Nyra (4) et Lyria (5) sans nouvel objet ni nouvelle image : elles portent une partie de ce que portent Fenn et Kael
// (provisoire, en attendant la table d'équipement de ChatGPT). Lyria : tout l'équipement de Kael. Nyra : armures, accessoires et bijoux de Fenn, plus les épées et lames de Kael.
for(const [k,o] of ITEMS.entries()){const w=whoOf(o);if(k>=86||w.length>=HER.length)continue;const add=[]; // V5.0 : les objets 86+ (lot 2) restent exclusifs, jamais prêtés
 if(w.includes(0))add.push(5);
 if(w.includes(1)&&o.sl!=='arme'||w.includes(0)&&o.sl==='arme'&&/Épée|Lame/.test(o.n))add.push(4);
 if(add.length)o.who=[...new Set([...w,...add])].sort((a,b)=>a-b)}
