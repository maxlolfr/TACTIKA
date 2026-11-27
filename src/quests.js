// V4.64 : Q19–Q24 (région 7 braise, région 8 sables) ; le combat reprend les cases brûlantes / dalles piégées de la région. Q25–Q40 : régions 9 à 12 pas encore jouables.
// V4.55 : quêtes scénarisées (carte I, Q01 à Q18 de SCENARIO-TACTIKA.md). Un combat spécial par quête, dans une région déjà ouverte,
// avec un objectif existant (survive / chief / élite / victoire). Récompense unique ; le combat reste rejouable sans bonus.
// z : région · l : niveau ajouté à celui de la région · g : objectif · e : élite · r : 1 = objet garanti · need : héros à recruter
export const QUESTS=[
 {id:'Q01',z:0,l:1,g:'survive',r:0,t:'Marchand disparu',d:'Ezran, le marchand, n’est pas rentré. Sa charrette est cernée sur la route : tiens le temps de le ramener.',c:'Ezran : « Vous venez de sauver bien plus qu’une cargaison. »'},
 {id:'Q02',z:0,l:2,g:'survive',r:0,t:'Ferme assiégée',d:'Des monstres rôdent autour de la ferme. Garrick demande de la tenir jusqu’à l’arrivée des renforts.',c:'Garrick : « Voilà une victoire qui compte. »'},
 {id:'Q03',z:0,l:2,e:'slime',r:1,t:'Étrange gelée',d:'Une gelée anormale absorbe l’Éther dans la prairie. Elyndra veut qu’on l’élimine.',c:'Elyndra : « Cette gelée absorbait l’Éther sans pouvoir le contrôler. »'},
 {id:'Q04',z:1,l:1,r:1,t:'Traces de Fenn',d:'Fenn a laissé des balises dans le bois sombre. Suis-les et dégage le passage.',c:'Fenn : « Je ne suis pas seul à protéger cette forêt. »'},
 {id:'Q05',z:1,l:2,g:'survive',r:0,t:'Dernier arbre',d:'Un jeune arbre sacré est menacé. Protège-le pendant que la sève remonte.',c:'Aelis : « La forêt n’a pas perdu tout espoir. »'},
 {id:'Q06',z:1,l:2,g:'chief',r:1,t:'Meute perdue',d:'Une meute affolée suit un chef. Abats-le pour la libérer.',c:'Fenn : « La meute est libre. »'},
 {id:'Q07',z:2,l:1,r:0,t:'Navire fantôme',d:'Une épave hantée s’est échouée sur la côte. Chasse ce qui la hante.',c:'Mira : « La première tournée est pour moi. »'},
 {id:'Q08',z:2,l:2,g:'survive',r:0,t:'Trésor englouti',d:'La marée découvre un trésor. Tiens la plage le temps de le récupérer.',c:'Ezran : « Et pour une fois, personne ne l’a volé. »'},
 {id:'Q09',z:2,l:2,g:'chief',r:1,t:'Contrebandiers',d:'Une bande pille la côte. Abats leur chef.',c:'Kael : « Quelqu’un d’autre tire les ficelles. »'},
 {id:'Q10',z:3,l:1,g:'survive',r:0,t:'Mineur prisonnier',d:'Un vieil ami de Borin est coincé dans une galerie. Sécurise la sortie.',c:'Borin : « Mon vieil ami est vivant. »'},
 {id:'Q11',z:3,l:2,r:0,t:'Runes anciennes',d:'Des runes affleurent dans la roche. Nettoie les lieux pour qu’Elyndra puisse les étudier.',c:'Elyndra : « Ces runes pourraient changer notre compréhension de l’histoire. »'},
 {id:'Q12',z:3,l:2,e:'golem',r:1,t:'Géant endormi',d:'Un golem se réveille dans les monts. Darius veut qu’on l’arrête avant qu’il ne descende.',c:'Darius : « La force brute ne suffit pas. »'},
 {id:'Q13',z:4,l:1,r:1,t:'Serment brisé',d:'Des soldats déchus errent dans le château. Libère-les de leur serment brisé.',c:'Kael : « Votre serment ne sera pas oublié. »'},
 {id:'Q14',z:4,l:2,g:'survive',r:0,t:'Soldats oubliés',d:'Des sépultures sont profanées. Tiens la position pendant qu’Aelis les apaise.',c:'Aelis : « Cette fois, c’est un silence paisible. »'},
 {id:'Q15',z:4,l:2,g:'chief',r:1,t:'Dernière bannière',d:'Un capitaine garde la dernière bannière de la garde. Abats-le.',c:'Garrick : « Je croyais cette bannière perdue à jamais. »'},
 {id:'Q16',z:5,l:1,e:'qspider',r:1,t:'Araignée de quartz',d:'Une araignée de quartz géante rôde dans les cavernes. Borin en rêve depuis vingt ans.',c:'Borin : « J’en rêvais depuis vingt ans. »'},
 {id:'Q17',z:5,l:2,g:'survive',r:0,t:'Cristaux instables',d:'Des cristaux menacent d’exploser. Tiens le temps de les sécuriser.',c:'Elyndra : « Vous avez évité une catastrophe. »'},
 {id:'Q18',z:5,l:2,need:3,r:1,t:'Recherches interdites',d:'Orion a laissé des archives dans les cavernes. Protège le passage jusqu’à elles.',c:'Orion : « Il est temps de réparer mes erreurs. »'},
 {id:'Q19',z:6,l:1,r:1,t:'Forge éternelle',d:'Des fourneaux oubliés brûlent encore sous la forteresse. Dégage les lieux pour que Borin puisse les rallumer.',c:'Borin : « Quel héritage ! »'},
 {id:'Q20',z:6,l:2,e:'obsid',r:0,t:'Métal vivant',d:'Un chevalier d’obsidienne vit dans le minerai de la forteresse. Orion veut comprendre ce qui l’anime : abats-le.',c:'Orion : « Les possibilités sont extraordinaires. »'},
 {id:'Q21',z:6,l:2,e:'fireel',r:1,t:'Flammes prisonnières',d:'Une flamme vivante est enfermée dans la forteresse. Aelis te demande de la libérer.',c:'Aelis : « Les flammes sont libres. »'},
 {id:'Q22',z:7,l:1,g:'survive',r:1,t:'Tombe interdite',d:'Des vagues de gardiens surgissent d’une tombe scellée. Tiens la position avant que Mira ne reparte avec le trésor.',c:'Mira : « Une histoire à raconter pendant des générations. »'},
 {id:'Q23',z:7,l:2,r:0,t:'Sceptre perdu',d:'Le sceptre d’un ancien roi repose au fond du temple. Ezran veut qu’on nettoie le chemin pour le rapporter.',c:'Ezran : « Cette relique retrouvera sa place dans l’histoire. »'},
 {id:'Q24',z:7,l:2,e:'anubis',r:1,t:'Mémoires du sable',d:'Une sentinelle antique garde les mémoires du temple. Elle ne laissera passer personne.',c:'Aelis : « À nous de ne pas répéter leurs erreurs. »'}];
