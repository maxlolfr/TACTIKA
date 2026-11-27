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
 boots:{vx:'support',snd:'buff',n:'Bottes ailées',ic:14,pa:2,r:[0,0],t:'self',pmBonus:2,fx:7,cd:3,d:'+2 PM pour ce tour'},
 heal:{vx:'support',snd:'aelis_heal',n:'Soin',ic:5,pa:3,r:[0,4],t:'ally',heal:[13,17],fx:4,cd:1,d:'Soigne un allié (ou toi)'},
 venom:{vx:'sig',snd:'poison',n:'Épine',ic:7,pa:3,r:[1,5],t:'enemy',los:1,dmg:[5,7],poison:[4,2],fx:5,d:'Dégâts + poison pendant 2 tours'},
 // V4.11 (lot 2, spec ChatGPT) : un nouveau sort par héros au niveau 5 (HER[].sp5)
 charge:{vx:'sig',snd:'kael_charge',n:'Charge',pa:4,r:[2,3],t:'enemy',dmg:[8,11],fx:7,cd:2,charge:1,shake:1,d:'Fonce sur un ennemi à 2 ou 3 cases et le frappe : Kael s’arrête sur une case libre à côté, sans dépenser de PM ni traverser d’obstacle'},
 pshot:{vx:'sig',snd:'bow',n:'Tir perforant',pa:4,r:[2,6],t:'enemy',los:1,lob:1,dmg:[11,14],pierce:1,proj:1,fx:0,cd:2,d:'Flèche qui ignore toute l’armure, une seule cible'},
 mheal:{vx:'support',snd:'aelis_heal',n:'Soin collectif',pa:5,r:[0,3],t:'ally',heal:[7,9],splash:1,fx:4,cd:3,d:'Soigne l’allié visé et les alliés collés à lui (pas de résurrection)'},
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
 storm:{snd:'prism_burst',n:'Tempête arcanique',sn:'Tempête',pa:6,r:[2,5],t:'cell',los:1,zone:2,side:.5,dmg:[23,30],proj:1,orb:'#b98bff',fx:3,cd:99,shake:1,d:'Zone de rayon 2, 50 % autour du centre. Épargne tes héros. 1 fois par combat'}};
export const HER=[
 {k:'warrior',n:'Kael',cls:'Guerrier',hp:62,init:12,sp:['slash','smash','guard'],sp5:'charge'},
 {k:'archer',n:'Fenn',cls:'Archer',hp:44,init:14,sp:['shot','volley','boots'],sp5:'pshot'},
 {k:'healer',n:'Aelis',cls:'Soigneuse',hp:40,init:10,sp:['heal','venom','aura'],sp5:'mheal'}];
export const SP5_LVL=5;
export const TEAM_SIZE=3,DEF_TEAM=[0,1,2];
// V4.33 : Orion, première recrue (niveau 20). PV ≈ 85 % de ceux de Fenn. Ajouté seulement en aperçu (et par les tests et le simulateur) :
// en jeu normal il reste 3 héros. Ses objets : ceux que tous les héros peuvent porter. Talents : à venir.
// learn : sorts appris par niveau (7 au recrutement au niveau 20) ; SLOTS_SP : nombre de sorts emportés au combat
export const SLOTS_SP=6;
export const ALL_SPELLS=typeof location!=='undefined'&&location.search.includes('apercu=braise')&&location.search.includes('tous'); // &tous (aperçu) : les 10 sorts tout de suite
export const ORION={at:20,k:'mage',n:'Orion',cls:'Mage',hp:37,init:11,sp:['arcane','flame','frost'],learn:[['fireball',5],['icewall',10],['blink',15],['weaken',20],['nova',25],['glyph',35],['storm',45]]};
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
 salam:{ai:'flank',snd:'bite',n:'Salamandre de lave',s:'salam',row:0,hp:38,pm:5,init:12,dmg:[9,12],h:.8,xp:20,imm:1}};
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
export const LAVA_DMG=.12; // part des PV max perdue sur une case qui s'embrase
export const PREVIEW=!!globalThis.location?.search.includes('apercu=braise');
ZONES.push(R7);
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
 {id:'eq63',s:'equip',ic:52,n:'Emblème ailé',pr:250,who:[0,1,2],hp:6,sl:'accessoire',lv:19,rr:2,src:'loot'}];
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
 {n:'Forteresse de braise',ts:'sol_braise',g:[0,0,0,0,5,5,6,6,2,7,3],obs:[30,31,32,33,34,35],noflower:1,out:[30,31,32,30]}];
// V4.1 : décors bas (buisson, caillou, fleurs, souche, barrière, caisses, ossements, coffre, pieux) : ils bloquent le passage mais pas les flèches en cloche de Fenn (sorts `lob`)
export const LOW=new Set([2,3,5,6,7,8,16,17,23,26,28,29,34,35]);
// tuiles 8-15 = 2e planche (8 roche, 9 gravier, 10 neige, 11 grotte, 12 dalles, 13 briques, 14 runes, 15 planches) ; décors 12-23 = 2e planche
export const DECO_W=[1.2,1.1,.9,.55,1.1,.8,.75,1,1,1.1,2.2,.7, .62,.62,.6,.7,.9,.85,.8,.5,1,1.1,.62,.95, 1.05,1,.9,.9,1,.9, .86,.72,.8,.82,.74,.98];
export const DEC=d=>d<12?['deco',d]:d<24?['deco2',d-12]:d<30?['deco3',d-24]:['deco4',d-30],TIL=t=>t<8?['tiles',t]:['tiles2',t-8];
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

addOrion(); // V4.40 : recrutable au niveau 20. En fin de fichier : HER, ATTR et ITEMS doivent exister
