// Données du jeu : héros, sorts, monstres, zones, objets, tuiles. Aucune logique ici.
export const SP={
 slash:{snd:'slash',n:'Taillade',ic:0,pa:3,r:[1,1],t:'enemy',dmg:[10,14],fx:0,d:'Coup d’épée au corps à corps'},
 smash:{snd:'kael_charge',n:'Fracas',ic:1,pa:4,r:[1,1],t:'enemy',dmg:[16,21],fx:7,cd:1,shake:1,push:2,d:'Gros coup qui repousse de 2 cases, 1 fois par tour'},
 guard:{snd:'guard',n:'Rempart',ic:2,pa:2,r:[0,0],t:'self',shield:1,fx:7,cd:3,d:'Dégâts reçus ÷2 jusqu’à ton prochain tour'},
 shot:{snd:'bow',n:'Tir',ic:3,pa:3,r:[2,6],t:'enemy',los:1,dmg:[8,12],proj:1,fx:0,d:'Flèche à distance, ligne de vue'},
 volley:{snd:'bow',n:'Volée',ic:4,pa:4,r:[2,5],t:'cell',los:1,zone:1,dmg:[7,10],proj:1,fx:0,cd:2,d:'Touche la case visée et les 4 autour'},
 trap:{snd:'trap',n:'Piège',ic:3,pa:3,r:[1,3],t:'cell',free:1,los:1,cd:3,trap:1,fx:0,d:'Piège sur une case libre : 10 dégâts et −1 PM au premier ennemi qui y entre, 3 tours'},
 revive:{snd:'aelis_heal',n:'Renaissance',ic:5,pa:6,r:[1,4],t:'dead',cd:99,revive:1,fx:4,d:'Relève un héros KO avec 25 % de ses PV, 1 fois par combat'},
 potion:{snd:'aelis_heal',n:'Potion',ic:5,pa:4,r:[0,0],t:'self',potion:1,fx:4,cd:99,d:'Boit une potion du marchand : soigne 40 % des PV max, 1 fois par héros et par combat'},
 boots:{snd:'buff',n:'Bottes ailées',ic:14,pa:2,r:[0,0],t:'self',pmBonus:2,fx:7,cd:3,d:'+2 PM pour ce tour'},
 heal:{snd:'aelis_heal',n:'Soin',ic:5,pa:3,r:[0,4],t:'ally',heal:[13,17],fx:4,cd:1,d:'Soigne un allié (ou toi)'},
 venom:{snd:'poison',n:'Épine',ic:7,pa:3,r:[1,5],t:'enemy',los:1,dmg:[5,7],poison:[4,2],fx:5,d:'Dégâts + poison pendant 2 tours'},
 aura:{snd:'buff',n:'Aura',ic:6,pa:3,r:[0,3],t:'ally',buff:.3,fx:7,cd:3,d:'+30 % de dégâts à un allié, 2 tours'}};
export const HER=[
 {k:'warrior',n:'Kael',cls:'Guerrier',hp:62,init:12,sp:['slash','smash','guard']},
 {k:'archer',n:'Fenn',cls:'Archer',hp:44,init:14,sp:['shot','volley','boots']},
 {k:'healer',n:'Aelis',cls:'Soigneuse',hp:40,init:10,sp:['heal','venom','aura']}];
export const MON={
 slime:{snd:'slime',n:'Gelée',s:'slimeN',row:0,hp:24,pm:2,init:8,dmg:[5,8],h:.62,xp:8},
 boar:{snd:'hit',n:'Sanglier',s:'boarN',row:0,hp:32,pm:4,init:11,dmg:[7,10],h:.8,xp:12},
 bat:{snd:'bite',n:'Chauve-souris',s:'batN',row:0,hp:18,pm:5,init:13,dmg:[4,7],h:.72,xp:9,fly:1},
 shroom:{snd:'poison',n:'Champignon',s:'shroomN',row:0,hp:26,pm:2,init:7,dmg:[4,6],r:[1,4],los:1,poison:[3,2],fx:5,h:.95,xp:12},
 wolf:{snd:'bite',n:'Loup',s:'wolfN',row:0,hp:30,pm:5,init:12,dmg:[8,11],h:.8,xp:14},
 skel:{snd:'slash',n:'Squelette',s:'skelN',row:0,hp:40,pm:3,init:9,dmg:[9,13],armor:.2,h:1.2,xp:16},
 crab:{snd:'bite',n:'Crabe',s:'crabN',row:0,hp:34,pm:3,init:9,dmg:[8,11],armor:.15,h:.72,xp:14},
 gull:{snd:'bite',n:'Mouette',s:'gullN',row:0,hp:22,pm:5,init:14,dmg:[6,9],h:.78,xp:12,fly:1},
 golem:{snd:'smash',n:'Golem',s:'golemN',row:0,hp:52,pm:2,init:6,dmg:[11,15],armor:.25,h:1,xp:20},
 goblin:{snd:'slash',n:'Gobelin',s:'goblinN',row:0,hp:30,pm:4,init:13,dmg:[9,12],h:.95,xp:16},
 ghost:{snd:'poison',n:'Fantôme',s:'ghostN',row:0,hp:26,pm:4,init:11,dmg:[7,10],r:[1,3],los:1,fx:5,h:.95,xp:16,fly:1},
 knight:{snd:'slash',n:'Chevalier',s:'monD',row:2,hp:60,pm:3,init:10,dmg:[13,17],armor:.25,h:1.25,xp:30}, // base du boss Chevalier noir
 // V3.5 : trois chevaliers de Max, du plus facile au plus dur (chiffres de départ, non équilibrés)
 knightB:{snd:'slash',n:'Chevalier bleu',s:'knightB',row:0,hp:36,pm:3,init:9,dmg:[8,11],armor:.15,h:1.15,xp:20},
 knightR:{snd:'slash',n:'Chevalier rouge',s:'knightR',row:0,hp:48,pm:3,init:10,dmg:[11,14],armor:.2,h:1.2,xp:28},
 knightN:{snd:'smash',n:'Chevalier sombre',s:'knightN',row:0,hp:62,pm:4,init:12,dmg:[14,18],armor:.25,h:1.28,xp:40},
 // V4.0 région 6 (spec Claude du 26/11, chiffres de départ) ; araignée et chauve-souris : planches provisoires
 crygolem:{snd:'smash',n:'Golem cristallin',s:'crygolem',row:0,hp:56,pm:2,init:6,dmg:[11,15],armor:.25,h:1.05,xp:20},
 qspider:{snd:'bite',n:'Araignée de quartz',s:'qspider',row:0,hp:28,pm:4,init:12,dmg:[6,9],r:[1,3],los:1,slow:1,fx:5,h:.8,xp:16},
 prisbat:{snd:'poison',n:'Chauve-souris prismatique',s:'prisbat',row:0,hp:22,pm:5,init:14,dmg:[6,9],r:[1,3],los:1,fx:5,h:.75,xp:14,fly:1}};
// zones de la carte : 3 combats + 1 boss chacune (ou `fights` : liste propre, le dernier est le boss) ; x,y en % de la carte
// fights : lvl, en (monstres, le 1er est le chef si goal='chief'), cry {a:turquoise, p:violet}, goal, tip (message guidé)
const G6=['crygolem','qspider','prisbat'],[CG,QS,PB]=G6;
export const ZONES=[
 {id:'prairie',n:'Prairie de Lande',x:48,y:77,th:[0,2],lvl:1,pool:['slime','boar'],boss:{k:'slime',s:'roiG',n:'Roi Gelée',hp:3.2,dmg:1.4,h:2.1,summon:{k:'slime',n:2,hp:12,pm:2,dmg:[3,5]}}},
 {id:'bois',n:'Bois sombre',x:33,y:50,th:[1],lvl:4,pool:['bat','wolf','shroom'],boss:{k:'wolf',s:'wolfK',n:'Loup alpha',hp:2.6,dmg:1.4,h:1.45,bs:'howl'}},
 {id:'plage',n:'Côte dorée',x:76,y:53,th:[3],lvl:7,pool:['crab','gull','slime','shroom'],elite:{2:'knightB'},boss:{k:'crab',s:'crabK',n:'Crabe royal',hp:2.8,dmg:1.4,h:1.7,bs:'shell'}},
 {id:'mont',n:'Monts gris',x:34,y:27,th:[4],lvl:10,pool:['golem','gull','wolf','crab'],elite:{1:'knightB',2:'knightR'},boss:{k:'golem',s:'golemK',n:'Golem ancien',hp:2.6,dmg:1.4,h:1.5,bs:'quake'}},
 {id:'chateau',n:'Château en ruine',x:62,y:18,th:[5],lvl:13,pool:['goblin','ghost','skel','goblin'],elite:{0:'knightB',1:'knightR',2:'knightN'},boss:{k:'knight',s:'knightK',n:'Chevalier noir',hp:2.4,dmg:1.3,h:1.35,bs:'rage'}},
 {id:'cristal',n:'Cavernes de cristal',x:14,y:33,th:[6],lvl:16,pool:G6,boss:{k:'crygolem',s:'crygolem',n:'Titan prismatique',hp:3.2,dmg:1.4,h:1.55,bs:'beam'},sheets:['crygolem','qspider','prisbat'],
  fights:[{lvl:16,en:[CG,CG,CG,CG],cry:{a:1},tip:'amp'},{lvl:16,en:[CG,CG,CG,'knightB','knightB'],cry:{a:2}},{lvl:17,en:[CG,CG,QS,QS,QS],cry:{a:2}},
   {lvl:17,en:[CG,CG,QS,QS,QS],cry:{p:1},tip:'prism'},{lvl:18,en:[CG,QS,QS,QS,QS],cry:{a:1,p:1},goal:'chief'},{lvl:18,en:[CG,CG,PB,PB,PB,PB],cry:{a:2}},
   {lvl:19,en:[CG,CG,QS,QS,PB,PB],cry:{p:2},goal:'survive'},{lvl:19,en:[CG,CG,QS,QS,PB,PB],cry:{a:2,p:2}},{lvl:20,en:[QS,CG,CG,QS,PB,PB],cry:{a:2,p:2},goal:'chief'},
   {lvl:20,en:[QS,QS,PB],cry:{a:2,p:2}}]}];
// nombre de combats d'une zone (le dernier est le boss)
export const zlen=z=>z.fights?z.fights.length:4;
export const ITEMS=[
 {ic:0,n:'Épée courte',pr:60,who:0,dmg:2},{ic:1,n:'Hache de guerre',pr:120,who:0,dmg:3},{ic:4,n:'Bouclier rond',pr:90,who:0,hp:8},{ic:5,n:'Heaume',pr:70,who:0,hp:6},
 {ic:2,n:'Arc long',pr:60,who:1,dmg:2},{ic:6,n:'Armure de cuir',pr:70,who:1,hp:6},{ic:7,n:'Bottes de cuir',pr:50,who:1,hp:4},
 {ic:3,n:'Bâton de saule',pr:60,who:2,heal:3},{ic:8,n:'Anneau de rubis',pr:100,who:2,dmg:2},{ic:9,n:'Amulette',pr:70,who:2,hp:6}];
// tuiles : 0 herbe 1 fleurs 2 terre 3 sable 4 eau 5 pavés 6 sous-bois 7 dalles
// décors : 0 chêne 1 sapin 2 buisson 3 caillou 4 rocher 5 fleurs 6 souche 7 barrière 8 caisse 9 puits 10 chaumière 11 panneau
export const THEMES=[
 {n:'Prairie',g:[0,0,0,1,1,2],obs:[0,0,2,3,4,6],water:1},
 {n:'Bois sombre',g:[6,6,6,0,1],obs:[1,1,1,0,2,6,4],water:0},
 {n:'Village',g:[5,5,7,0,0],obs:[8,8,2,3,0,9],water:0},
 {n:'Plage',g:[3,3,3,3,2],obs:[3,4,2,8],water:3},
 {n:'Monts gris',g:[9,9,10,10,9],obs:[20,20,21,4,3,19],rock:4,noflower:1,out:[20,21,19,20,4]},
 {n:'Château en ruine',g:[12,12,13,11,15,14],obs:[12,13,14,15,16,17,18,22],noflower:1,out:[12,13,22,16,14]},
 {n:'Cavernes de cristal',ts:'tiles5',g:[0,0,8,8,11,11,3,4],obs:[20,21,19,4,3],noflower:1,out:[20,21,19,4],cave:1}];
// tuiles 8-15 = 2e planche (8 roche, 9 gravier, 10 neige, 11 grotte, 12 dalles, 13 briques, 14 runes, 15 planches) ; décors 12-23 = 2e planche
export const DECO_W=[1.2,1.1,.9,.55,1.1,.8,.75,1,1,1.1,2.2,.7, .62,.62,.6,.7,.9,.85,.8,.5,1,1.1,.62,.95];
export const DEC=d=>d<12?['deco',d]:['deco2',d-12],TIL=t=>t<8?['tiles',t]:['tiles2',t-8];
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
export const PUSH_DMG=5, COMBO=[1,1,1.15,1.3], STAR_ROUNDS={fight:5,boss:7};
