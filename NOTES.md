# Notes du projet Tactika

## V4.4.1 (26/11/2026) — contrôle des Cavernes
- La carte de visée annonçait « tes héros sont épargnés » même quand la Volée déclenchait un prisme qui touche un héros. Elle liste maintenant tout ce que le prisme touche (bouclier et armure comptés) et signale « héros touché ! ».
- Contour rouge de la Volée redessiné par-dessus les hachures violettes ; chiffres ◆ du prisme placés au-dessus de ceux du sort.
- « Combat suivant » : l'ancien plateau n'est plus dessiné pendant le chargement (erreur d'image possible).

## V4.4 (26/11/2026) — zoom du plateau
- Deux doigts : agrandir jusqu'à ×2,5 ; un doigt qui glisse sur un plateau agrandi : le déplacer ; molette et glisser à la souris ; bouton « Vue entière ».
- **Un appui agit désormais au relâchement** (et pas à l'appui), sans glissement ni second doigt.
- `view` dans render.js (écran = monde × z + x,y), prise en compte par `tapCell`. Le sol est redessiné plus net après le geste, plafonné à 8 millions de pixels.
- Plateau agrandi : la caméra suit le héros qui joue et la cible des sorts. Zoom remis à 1 à chaque combat et à la rotation.
- Testé en émulation tactile Chrome (390×844 et 844×390), pas sur un vrai iPhone ni sur le Magic V5.

## V4.3 (26/11/2026) — P2 du brief de Michel et étiquette des Cavernes
- Déplacements : pastille blanche sur les cases accessibles (l'eau n'en a pas). Appui sur l'eau ou un obstacle : « Eau · infranchissable ».
- Conseil selon l'état réel (PM, PA, recharges, cibles) ; le passage automatique est annoncé par une bannière (1,5 s). Remplace l'ancien message « aucune cible » après déplacement.
- Résultat : « Combat suivant » / « Affronter le boss », « Taverne : récompense à réclamer » si un contrat est prêt, « Retour à la carte ». Récompenses enregistrées avant le choix.
- « Étape 3 sur 4 » partout (accueil, combat, liste de la région) : le boss est la dernière étape.
- Carte : les noms des zones au bord gauche passent sur deux lignes (vérifié en 360, 390, 844 et 1363 de large).
- Camp en 1363×936 comparé : la peinture horizontale laisserait du vide en haut et en bas à la place du vide à droite ; composition inchangée. 69 tests.

## V4.2 (26/11/2026) — P1 du brief de Michel : lire avant de frapper
- **Changement de commande** : avec un sort choisi, 1er appui (ou survol à la souris) = examiner, 2e appui au même endroit (ou même portrait) = lancer. Sorts sur soi : un seul appui. Retoucher le sort annule.
- Cible examinée : silhouette redessinée par-dessus les personnages qui la masquent, case entourée, portrait entouré de blanc. Carte de visée : nom, PV, validité, motif de refus (trop près, hors de portée, allié ou obstacle qui bloque) ou trajet.
- Appuis : le milieu d'une case occupée l'emporte, sinon le dessin de cible le plus proche. Sort de zone : le milieu d'une case libre reste visable.
- Volée : cases oranges = centres autorisés, zone rouge = cases touchées. Un ennemi hors de portée du centre propose un centre voisin. Alliés annoncés épargnés ; prismes montrés à part, seulement ceux que la case examinée déclenche.
- Dégâts réels (`forecast` dans rules.js, mêmes fonctions que la résolution : `power`, `soak`, `healing`) : arc, Aura, combo, cristal, armure, perforation, Rempart, collision, critique à part, « KO garanti / possible / si critique ». Aucun hasard consommé, aucun état modifié (test). La barre du bas dit « de base ».
- Non couvert par la prévision : dégâts de prisme dans le calcul de KO (chiffres ◆ à part), poison au tour suivant.
- Petit écran (375×667) : la carte de visée peut couvrir les rangées du haut du plateau. 69 tests.

## V4.1 (26/11/2026) — retours de Max
- Objectifs annoncés : carte au début des combats « survie » et « chef » (affichée à chaque fois), tours restants sous le titre, bannière à chaque nouveau tour de survie, objectif indiqué dans la liste des combats, « Objectif atteint » à la victoire. La survie est désormais gagnée dès le début du 5e tour (avant, un héros devait encore jouer).
- Tir et Volée passent par-dessus les décors bas (`LOW` dans data.js, champ `lob` des sorts). Arbres, rochers, murs, piliers, cristaux et personnages bloquent toujours. Épine, Piège et les monstres ne changent pas.
- PA reportés (héros) : +1 au tour suivant par tranche de 2 PA non dépensés, au plus +2 (donc 8 PA au maximum), sans cumul. `PA_CARRY` dans data.js, non équilibré.
- Sort choisi + cible hors d'atteinte : 1er appui = aperçu du trajet, 2e appui = déplacement puis sort (`approach` dans rules.js). Portrait en pointillés quand la cible est atteignable ainsi.
- Volants : ils flottaient très haut (0,7 case) et se recouvraient ; vol abaissé à 0,3 et chauves-souris réduites. 3 000 combats simulés : jamais deux unités sur la même case.
- Maître d'armes : un héros à la fois, avec 3 onglets (les 3 étaient présents mais Fenn et Aelis étaient loin sous l'écran). 66 tests.

## V3.7.1 (26/11/2026) — petits défauts
- Les bulles d'attaque montent au-dessus des barres de vie et des autres bulles.
- « Chef squelette a » devient « Chef squelette A ». 54 tests.

## V3.7 (26/11/2026) — qualité maximale et intérieurs
- Demande de Max : garder la qualité maximale. Les décors Gemini sont désormais à leur taille d'origine, WebP qualité 92 (`tools/prep_bg.py`) ; marche des chevaliers en qualité 95. Les images plus anciennes (Prairie et Bois verticaux, Côte et Château horizontaux, village vertical, maître d'armes) sont inchangées.
- Forge, Marchand et Taverne ont leur intérieur peint (G-08 à G-10), voile éclairci.
- Village horizontal remplacé par la même scène en 2528×1696 (coordonnées de `home.js` inchangées).

## V3.6 (26/11/2026) — marche des chevaliers et nouveaux décors
- Marche en 4 images des trois chevaliers (MK-01 à 03) : planches à part `knight{B,R,N}m`, découpées par `tools/cut_walk.py` (calage sur le haut du corps). `frameOf` les utilise pour toute unité de `BS` qui a une planche `<nom>m`. Limite : les images 1 et 3 avancent la même jambe.
- Chevalier sombre : au repos, il était décalé de sa case (ancre faussée par l'épée).
- Décors Gemini : Monts, Côte et Château en vertical ; Prairie, Bois et Monts en horizontal. Chaque zone a `<zone>.webp` (vertical) et `<zone>-l.webp` (écran plus large que haut). Prairie et Bois gardent leur ancienne peinture verticale. `tools/prep_bg.py` efface l'étoile Gemini et réduit l'image.
- Village vertical reçu mais non intégré : Max en prépare un autre. 53 tests.

## V3.5 (26/11/2026) — trois chevaliers
- Demande de Max avec ses 3 planches : bleu (facile), rouge (plus difficile), noir (très difficile, nommé « Chevalier sombre » pour ne pas le confondre avec le boss « Chevalier noir », inchangé).
- `MON.knightB/R/N` : PV 36/48/62, dégâts 8–11 / 11–14 / 14–18 (avant montée selon le niveau). Chiffres de départ, non équilibrés.
- `ZONES[].elite = {combat: chevalier}` : un seul par combat, à la 2e place. Côte dorée combat 3 (bleu) ; Monts gris 2 (bleu) et 3 (rouge) ; Château 1 (bleu), 2 (rouge), 3 (sombre). Défi du jour et contrats inchangés.
- Découpe : `tools/cut_knights.py` (une seule image de course par planche : la marche alterne course et garde). 53 tests.

## V3.4 (26/11/2026) — village en paysage
- Peinture horizontale de Max (VI-02) : `assets/village-paysage.webp` (1536×1024). `home.js` a deux scènes (`SCENES.p` et `SCENES.l`) avec leurs zones, lumières, héros. La scène horizontale sert quand le menu est en colonne et que la zone libre est plus large que haute (téléphone couché, ordinateur) ; sinon la verticale (téléphone droit, Honor déplié, tablette presque carrée).
- Les morceaux de feuillage animés et le soulèvement des bâtiments au toucher reçoivent maintenant leur image (ils étaient vides depuis la V3.1).
- Tente de soins, tente centrale et panneau d'affichage de la peinture : décor seulement.

## V3.3 (26/11/2026) — sols calmes partout
- Planche TU-02 de Max découpée par `tools/cut_tiles.py planche.png tiles4` (accepte maintenant un fond magenta). Les 16 numéros de sol du jeu passent sur `tiles4` (table `T4`), Monts gris et Château compris. Deux herbes tirées au hasard. `tiles`, `tiles2`, `tiles3` ne sont plus chargées (`OLD`).
- Inclut le correctif V3.2.2 ci-dessous, publié dans la même version.

## V3.2.2 (26/11/2026) — village invisible sur écran presque carré
- Capture de Max (Honor déplié, retour au village) : seul le fond flou restait. `fitHome` déduisait le paysage de `largeur > hauteur` ; quand le CSS plaçait quand même le menu en colonne, la zone libre devenait négative et le village n'avait plus de taille.
- La disposition se lit maintenant sur la position réelle du menu, l'échelle ne peut plus être nulle, et un `ResizeObserver` recadre quand la zone change sans événement `resize`.

## V3.2.1 (26/11/2026) — sens des héros
- Bug présent depuis la V2.5a : toutes les planches de héros (`<héros>9` et `<héros>M`) regardent à droite, mais `frameOf` les retournait quand l'unité regardait à droite. Les héros regardaient, marchaient et frappaient à l'opposé. Miroir inversé pour les héros seulement (monstres et boss inchangés).

## V3.2 (26/11/2026) — caméra plus plongeante et nouveaux sols
- Demande de Max (après avoir battu le Roi Gelée) : problème de visibilité, caméra à relever.
- `ISO` passe de .62 à .70 (render.js). En paysage tourné, marge de cadrage 1,22 au lieu de 1,4 : cases d'iPhone couché de 62 px de large (64 avant) mais plus hautes (44 au lieu de 40).
- Planche de 16 tuiles de Max (TU-01) découpée par `tools/cut_tiles.py` → `assets/tiles3.webp` + clé `tiles3`. Utilisées via la table `T3` pour les sols herbe, fleurs, terre, sable, eau, pavés, sous-bois et dalles du village (Prairie, Bois, Village, Plage). Miroir au hasard contre la répétition, herbe légèrement assombrie. Monts gris et Château gardent l'ancienne planche : les nouvelles tuiles correspondantes (neige, cristaux, lave, rose des vents) sont trop chargées une fois répétées.
- Décors du plateau réduits (`DK`, puits et arbres le plus) et personnages à 93 % (`US`). Les décors hors plateau et les règles ne changent pas.

## V2.4b+ (26/11/2026) — retour du test de Max (Honor Magic V5)
- Visée : avec un sort choisi, toucher le dessin ou la barre de vie d'une cible valable la vise même si une autre unité est devant (`tapCell`) ; les portraits de la frise visent aussi (`act()` commun au plateau et à la frise) ; cibles valables entourées d'un halo orange (`shadowBlur`), unités qui les cachent à 40 % d'opacité ; une case non valable n'annule plus le sort (retoucher le sort l'annule). Règles de portée, ligne de vue et PA inchangées (passent toujours par `selCells`/`okTarget`).
- Caméra : `ISO=.62` dans render.js (hauteur de case / largeur, au lieu de 0,5) ; seuls les sols sont étirés en hauteur ; cadrage `TW=min(W/6.3, avail/(9·ISO+1.4), 130)`.
- Netteté : planches des héros redécoupées en double résolution depuis les originaux (`Game-studio-ai/docs/studio/art/tactika/heros` et `v24`) : kaelW/fennX/aelisX `--scale 1`, kaelX 0.898, fennB 1.03, aelisB 0.918, kaelK 1.1 ; ombres violettes effacées sur fennB, aelisB, kaelK. `imageSmoothingQuality='high'`. Les 10 anciennes planches (warrior, archer, healer, kaelF/B/P, fennF/P, aelisF/P) ne sont plus chargées (`OLD` dans render.js) : environ +0,6 Mo pour les héros, −0,65 Mo d'anciennes planches.

## V2.4b (26/11/2026) — forge
- Forge au camp (bâtiment 0) : améliore chaque objet possédé, niveaux 1 à 3, coûts `FORGE_COST` = 25/60/120 or, +50 % du bonus de base par niveau (`FORGE_STEP`, ×2,5 au niveau 3). Règles pures `upgrade/upCost/upLvl/itemVal` (rules.js), utilisées par `heroStats`. Niveaux dans `save.up` (absent = 0 : anciennes sauvegardes intactes). Boutons bloqués pendant l'animation (pas de double achat). 29 tests.
- Images B-01 (forge.png) attendues : marteau animé et badges à brancher à réception.

## V2.4a (26/11/2026) — corrections, camp, impacts
- Direction : `Game-studio-ai/docs/studio/tactika/DIRECTION-PRODUCTION-V2.4.md` (priorités de Max, découpage V2.4a/b/c, pas d'équilibrage fin avant les tests de Max).
- Corrections : détail des étoiles juste (`starList`), fuite pendant une animation (numéro de combat `G.fid` : une ancienne boucle de tours s'arrête, `cast` garde son propre état), `genMap` ne peut plus échouer (plateau dégagé en secours), sauvegarde versionnée (`v:2`) et vérifiée au chargement. Graine liée à l'or gardée (variété des cartes rejouées). 27 tests.
- Camp : 4 bâtiments (`assets/bld.webp`, planche ChatGPT découpée par `cut3.py --scale 0.6` : 0 forge, 1 marchand, 2 maître d'armes, 3 taverne), sous le bouton Carte ; forge active en V2.4b, autres « bientôt ».
- Images ChatGPT (26/11) : KO de Kael `kaelK` (case 0, `--scale 0.55`, ancre au milieu), marche de dos `fennB` (`--scale 0.515`) et `aelisB` (`--scale 0.459`), cycle [1,0,2,3] ; ces deux noms remplacent d'anciennes planches inutilisées. Échelle choisie pour la même hauteur que la pose de face (KO : largeur = hauteur debout). Décors `bg/plage.webp` (nouveau) et `bg/chateau.webp` (remplacé).
- Impacts : flash blanc sur l'unité touchée (`flashT`), zoom bref (`punch`) sur critique, KO et collision, éclats de particules (`burst`) au KO et à la collision, chiffres qui grossissent à l'apparition.

## V2.3 gameplay (26/11/2026)
- Intentions ennemies (bulle « ⚔ dégâts » + trait et losange rouges sur la cible) : `intent()` dans rules.js simule le tour du monstre à blanc, recalculé à chaque `render()` du tour d'un héros (`G.intents`).
- Poussée : Fracas de Kael repousse de 2 cases (`push` dans SP), `pushPlan()`/`push()` ; obstacle, eau, bord ou unité = 5 dégâts par case bloquée (`PUSH_DMG`), l'unité percutée prend 5. Flèche prévue quand Fracas est choisi.
- Combos : `t.hitBy` (héros ayant frappé le monstre depuis son dernier tour), bonus `COMBO` = +15 % / +30 %, remis à zéro dans `beginTurn`.
- Étoiles : `stars()` (victoire, aucun KO, ≤ `STAR_ROUNDS` tours de table) ; `s.round` compté dans turns.js ; meilleur score dans `save.st[zone][combat]` ; premier 3 ★ = +50 % d'or.
- Coffre de butin : `assets/chest_closed.png` et `chest_open.png` (planche ChatGPT 26/11, découpés et alignés sur la même base par `tools/cut_chest.py planche.png 0.5`). Les deux images sont superposées dans `.chest` (pas de chargement à l'ouverture) ; tremblement, rebond à l'ouverture, halo doré tournant, butin ligne par ligne ; sons buff + coin. S'ouvre au toucher ou seul après 3 s.
- Équilibrage : `node tools/sim.mjs 200` joue la campagne (relevé du 26/11 dans `Game-studio-ai/docs/studio/tactika/EQUILIBRAGE-V2.4.md`).
- Chiffres = proposition de Claude validée par Max, spec dans `Game-studio-ai/docs/studio/tactika/mecaniques/V2.3-gameplay.md` (approuvée provisoirement par ChatGPT le 26/11). 25 tests. Intentions « engagées » : à étudier en V2.4 après les tests d'équilibrage.

## État (24/11/2026)
- **Lot 1 fait** (branche `claude-b/tactika-v2-lot1`) : code en modules ES (`src/data,rules,save,audio,render,turns,ui,main.js` + `style.css`), règles testées (`npm test`, Node 22), ancienne version dans `legacy/`. Aucune règle ni visuel changé. Direction créative : voir `Game-studio-ai/docs/studio/tactika/`.
- V2.0 en cours : marche animée, poses, ambiance par zone, interface bois et parchemin, logo et camp. Moteur encore en canvas maison (passage à Phaser à décider).
- Démo privée (artifact Claude) : https://claude.ai/artifact/QpgTozh4PNXivLsHXEGCQ7
- Page des prompts d'images : https://claude.ai/artifact/6UyUv9LBEPf3nggUffkfBH
- **Sons intégrés (25/11/2026)** : les 22 fichiers ElevenLabs (flow 97rZARFgripawZTlXj1N) sont dans `assets/audio/`. Récupérés par le workflow `.github/workflows/audio.yml` (le proxy de Claude bloque elevenlabsusercontent.com) : mettre `nom lien-signé` dans `tools/audio-urls.txt` et pousser ; le workflow télécharge, compresse (bruitages mono 64k, musiques 96k) et supprime la liste.

## Images
- **Refonte (décision de Max, 25/11/2026)** : planches V1 de ChatGPT = références artistiques, non intégrées. Nouvelles planches : 1024×1024, grille 2×2 de cases 512×512, fond magenta #FF00FF uni. Outil de découpe : `tools/cut3.py` (voir son en-tête ; essai à blanc par défaut, `--atlas` pour écrire). Prompts : `Game-studio-ai/docs/studio/tactika/PROMPTS-SPRITES-V2.md`.
- V2.0 intégrées : marche face/dos + poses (KO, victoire, sort, défense) des 3 héros (ChatGPT, 2x2), déplacements des 12 monstres, logo, décor du camp, kit d'interface (`ui`), particules (`parts`).
- Découpe : `tools/cut.py` (planches V1) puis `tools/cut2.py` (planches V2, ajoute à `assets/atlas.json`).
- Directions : face = bas-gauche, dos = haut-gauche ; bas-droite et haut-droite = miroir.
- Index utiles : ui 3/4 emplacement de sort (normal/choisi), 5/7 bouton or (normal/appuyé), 10 bouton bois, 11 barre bois, 12 étoile PA, 13 botte PM, 14 pièce ; parts 0 luciole, 2 feuille, 3 neige, 4 braise, 6 feu follet, 8 viseur, 10 flèche.

## Décisions
- Nom : Tactika. Dépôt séparé (plus rien dans Stepquest).
- Gemini pour décors et sols, ChatGPT pour personnages et texte.
- Fonds : magenta #FF00FF, vert #00FF00 si le sujet contient du violet, noir pour les effets.

## V2 prévue
Phaser + modules, moteur de combat testable, IA par score, intentions ennemies affichées, poussée, terrains, combos, boss à phases, étoiles, talents, village à reconstruire, donjon du jour.

## V2.4c — Roi Gelée (26/11/2026)
- Nouveau sprite `roiG` (planche ChatGPT 3×3 sur fond noir, détourée) : repos, attaque, touché, invocation (pose `s`), KO (reste 1,8 s).
- `rules.summon()` : appelé par `hurt()` une seule fois quand un boss avec `summon` passe à 50 % de PV ou moins sans mourir. 2 Petites gelées (12 PV, 2 PM, 3–5 dégâts, 0 XP) sur les cases libres atteignables les plus proches (moins s'il n'y a pas la place). Elles sont ajoutées à la fin de `s.order` : elles jouent après tout le monde, sans décaler l'index du tour en cours.
- Victoire : il faut aussi battre les gelées invoquées. 31 tests.

## V2.5a — Spécialisations, palier 1 (26/11/2026)
- `src/talents.js` : 9 spécialisations (3 par héros), paliers aux niveaux 3/7/11 ; `DONE=1` = seul le premier palier est codé, les autres sont affichés « à venir ». `talentFx(save,i)` donne les modificateurs (dmgMul, hpMul, healMul, maxPM, sp:{id:{champs remplacés}}).
- `heroStats` renvoie `tal` ; `mkUnits` crée `u.S` (copie modifiée des sorts du héros : SP n'est jamais modifié), `u.dmgMul`, `u.healMul`, `maxPM`. L'interface lit `u.S[id]` (descriptions et portées réelles).
- Ralentissement (`sp.slow`) : drapeau `t.slow`, consommé par `beginTurn` (PM max − 1, non cumulable).
- Sauvegarde : `save.sp=[id|null ×3]`, validée par `cleanSp` (anciennes sauvegardes : aucune spécialisation). Toujours v2.
- Écran du maître d'armes (bâtiment 2 du camp, « Nouveau ! » si niveau ≥ 3 et un héros sans spécialisation).
- Nouveaux héros ChatGPT : planches `kael9/fenn9/aelis9` (poses repos, coup, touché, sort, spécial, KO, genou à terre sous 30 % PV, victoire). Marche et dos : `kaelM`, `fennM`, `aelisM` (H-04 reçues le 26/11) ; les anciennes planches de héros ne sont plus chargées. Icônes encadrées `tal` (4×4).
- 35 tests.
- Boss (26/11) : planches ChatGPT `golemK`, `crabK`, `wolfK` (+ `roiG`, `knightK`), liste `BS` dans render.js : regard à droite (miroir inversé par rapport aux monstres), 6 cases repos/attaque/touché/spécial/KO/repos 2, KO affiché 1,8 s.
- Fond du maître d'armes : `assets/bg/armes.webp` (BG-01).

## V2.5b — Spécialisations, palier 2 (26/11/2026)
- `DONE=2`. Nouveaux champs d'unité : `crit` (0,12 ou 0,22), `guardK` (part des dégâts gardée sous Rempart : 0,5 ou 0,35), `pushDmg` (5 ou 7, transmis par `pushPlan` dans `p.k`, affiché dans l'aperçu de poussée).
- Sorts modifiés via `sp` : Volée `slow`, Bottes `pmBonus:3`, Soin portée 5, Épine `poison:[6,3]`, Aura `buffT:3`, descriptions mises à jour. 38 tests.

## V2.5c — Spécialisations, palier 3 (26/11/2026)
- `DONE=3` : les 27 talents fonctionnent. Champs d'unité : `exec`, `lastStand` (consommé dans `hurt`, événement `saved`), `dodge` (esquive des sorts à dégâts directs dans `applySpell`), `sp.pierce` (6e paramètre `pen` de `hurt`), `sp.spread` (poison contagieux : à la mort, 6×2 aux voisins, sans nouvelle contagion), `sp.all` (Aura sur tous les héros), `tf.add` (sorts ajoutés : `trap`, `revive`, définis dans `SP`).
- Piège : `u.trap={x,y,left:3}` sur Fenn (un seul, décompté dans `beginTurn`), déclenché par `stepOn` après chaque pas (`moveTo` s'arrête dessus) et dans `push` sur les cases traversées. Dessiné au sol (icône chaîne).
- Renaissance : cible `t:'dead'` (`koAt`, `reviveSpot` : case du KO ou voisine libre, sinon sort impossible), 25 % des PV, recharge 99 (affichée « — »). `u.wasKO` : l'étoile « aucun héros KO » reste perdue même après résurrection.
- Sons `trap` et `dodge` ajoutés à `SNDS` (fichiers déjà présents). 41 tests.
- Monstres au nouveau style (26/11) : `slimeN`, `boarN` dans `BS`, 10 cases dans l'atlas (repos, attaque, touché, spécial, KO, repos 2, 4 pas de marche). Badges de forge `badge` (bronze, argent, or, cadenas = jamais amélioré).

## V2.6a → V2.6d (26/11/2026)
- **V2.6a Marchand** : 3 objets non possédés par jour (`shopStock`), achat au prix `pr` (data.js), revente 50 % (+50 % de la forge), potions (30 or, 3 max) : sort `potion` ajouté aux héros si `save.pot>0`, 4 PA, 40 % PV, 1 par héros et par combat, stock commun `S.pot`. Barre de sorts qui rétrécit (5 sorts).
- **V2.6b Taverne** : `contracts(save,day)` 3 contrats tirés une fois par jour (`save.ct`), `ctUpdate` en fin de victoire, `claim`. Défi du jour `dailyFight` (zone la plus avancée, niveau +4, double or, objet garanti, potion), `save.dd`.
- **V2.6c Boss** : `bs` dans ZONES (howl, shell, quake, rage), `bossTurn` au début du tour du boss (turns.js), `bossNext` affiché dans la fiche ennemi.
- **V2.6d** : raretés (`RARE`, `save.rr`, `rollRare`, ×1 / ×1,5 / ×2), objectifs alternatifs dans les zones 2 à 5 : combat 2 = chef (♛, barre dorée, 1,8× PV), combat 3 = survie 4 tours (`s.goal`, `outcome`).

## V3.0a (26/11/2026)
Tutoriel en 5 cartes au premier combat (`save.tuto`, rejouable depuis « Comment jouer » au camp). Export/import de la sauvegarde en code texte (base64) via le bouton « 💾 Sauvegarde » du camp. Reste pour la V3.0 : FR/EN, tests externes, sortie mobile.

## V3.0b (26/11/2026) — lot ciblage de l'audit
`whyNot`/`losBlock` (rules.js) : raison d'une cible indisponible (portée max/min, obstacle, unité qui bloque) avec la même règle que `okTarget` ; case bloquante marquée en rouge 2 s (`G.mark`). Repères A/B/C stables sur les monstres identiques (nom, barre de vie, portrait). Portraits : ordre stable, cliquables même grisés (affichent la raison), `aria-label`. Après un déplacement sans cible : message. Taverne : bouton « Réclamer ». Restent de l'audit : aperçu de déplacement, comparaison d'inclinaison 0,62/0,68, première mission guidée, HUD, chargement par paquets.

## V3.0c (26/11/2026) — retours de Max sur iPhone (paysage, sol, sprites flottants)
- Mode paysage (`style.css`, `min-aspect-ratio:5/4`) : panneau de combat à droite (`--side`), barre du haut à gauche, zones sûres ; version compacte sous 520 px de haut. `layout()` détecte le panneau latéral et centre le plateau dans la place restante.
- Sol : tuiles opaques (plus de 62 %), fond assombri (.34), damier léger, bords sombres nets + liseré clair.
- Ancrage : ombre plus nette et anneau d'équipe (bleu héros, rouge monstres) au pied. Décor toujours opaque ; une unité cachée derrière est redessinée en silhouette (35 %, 60 % si héros actif ou cible).

## V3.0d (26/11/2026) — paysage complété (par-dessus la V3.0c de la PR #35)
- CSS `@media (orientation:landscape)` : panneau de combat en colonne à droite (`--side` 208-310 px), frise en haut du plateau, zones sûres (env left/right/bottom). Camp en deux colonnes (`.col`, transparentes en portrait), forge/marchand/taverne en deux colonnes, carte plus large et défilante, fiche de zone en grille, résultat compact.
- `layout()` (render.js) : mesure le canvas réel, et en paysage **pivote le plateau d'un quart de tour** (`V`) si les cases y gagnent (téléphones : 25 → 64 px sur 844×390 ; ordinateur et pliable déplié restent droits). Les règles ne changent pas : seuls `scr`, `depth`, `lat`, `tapCell`, le sol et le sens des sprites tiennent compte de la vue.
- Recalcul à la rotation (resize + orientationchange, 2e passe à 350 ms). Départ des héros un peu étalé : [13,-3] [14,0] [13,3] (ligne, colonne écran en portrait).
- Essais Playwright : 844×390, 932×430, 667×375, 890×790, 1280×800, 412×900, 790×890 ; touchers justes sur toutes les cases atteignables avant et après rotation.
- Limite : Chrome de test, pas de vraie encoche iOS ni de Safari : à confirmer sur iPhone.
- Sol, compléments : périphérie assombrie en dégradé, cases avec décor bloquant assombries avec ombre, cibles valables cerclées de clair, seuls les monstres volants oscillent.

## V3.0e (26/11/2026) — aperçu de déplacement, première mission, HUD
- Aperçu : 1er toucher sur une case bleue = trajet, fantôme, coût en PM, viseurs sur les ennemis visables de là (`targetsFrom`, pur et testé) ; 2e toucher sur la même case = déplacement (`G.plan`).
- Première mission (Prairie combat 1, tant qu'elle n'est pas gagnée) : 3 Gelées, `guideSetup` garantit un Tir dès le tour 1 et une 2e cible ouvrable en bougeant (testé sur 300 graines) ; conseil par héros sous les sorts, bouton Tir qui pulse.
- HUD : frise sur sa propre ligne en portrait, noms sous les sorts, textes plus courts, hauteur de panneau constante (le plateau passait jusqu'à 32 px dessous sur pliable en portrait). 52 tests.

## V3.1 (26/11/2026) — accueil : village interactif
- Fond `assets/village.webp` (peinture 941×1672 fournie par Max, 309 Ko). `src/home.js` + `home.css` ; positions en pixels de l'image, `fitHome` garde les 5 bâtiments visibles sans défilement.
- Bâtiments → écrans existants : Caserne → onglet Héros, Talents → maître d'armes, Forge, Marchand, Taverne. Héros autour du feu (touchables).
- Barre du haut (portrait, niveau, XP, or, potions, réglages), bandeau de chapitre + « Partir à l'aventure », navigation Camp / Héros / Inventaire / Quêtes. Réglages : musique, sons, sauvegarde, tutoriel, aide, remise à zéro, version.
- Animations CSS (transform/opacity) : lanternes, fenêtres, feux, fumées, eau, feuillages, lucioles, enseignes qui réagissent au toucher, pastilles (forge améliorable, spécialisation libre, contrat ou défi). `prefers-reduced-motion` respecté.
- Règles de combat et format de sauvegarde inchangés. Ancien accueil (cartes héros, grille) supprimé.
- Polices Lilita One / Nunito via Google Fonts (non bloquant, repli système) — non vérifiées en essai (réseau fermé). 52 tests ; Playwright sur 10 formats (enseignes visibles et non recouvertes, chaque bâtiment ouvre son écran, aventure → combat).
- Limite : en paysage la peinture verticale laisse des côtés flous ; une version paysage est commandée (VI-02).

## V4.0 (26/11/2026) — région 6 « Cavernes de cristal » jouable
- Zones à longueur variable : `ZONES[].fights` (lvl, en, cry, goal, tip), `zlen(z)`, `fightSpec()` (rules.js, partagé avec le simulateur), `zoneDone()`. Sauvegarde v2 inchangée (`z.cristal` de 0 à 10).
- Cristaux : `cell.cry` ('a' amplificateur, 'p' prisme, bloquants), `cell.off` (prisme éteint jusqu'au tour de table indiqué). `ampAt` ×1,3 dégâts directs et soins, `prismOn/prismDmg/prismHits/prismFire` (70 % des dégâts moyens aux 4 voisines, alliés compris, éteint 2 tours). Poussée contre un cristal = collision normale. IA : case amplifiée préférée, intention avec bonus (`it.amp`). Les monstres ne visent jamais un prisme.
- Monstres : `crygolem`, `qspider` (attaque `slow`), `prisbat`. Titan prismatique (`bs:'beam'`) : `beamPhase`, `beamCells`, `beamTurn`, `s.beam` (cases hachurées) ; marque, tire au tour suivant, repos ; croix en phase 2 ; prisme qui éclate en phase 3. Le rayon ne touche que les héros.
- Rendu : cristaux C6-09 (`crystals`, dessin par le code en secours), cases amplifiées (tirets + chevron), aperçu du prisme (hachures + « ◆ -N »), sol `tiles5` via `theme.ts`, fond provisoire = Monts teinté.
- Chargement par région : `zoneAssets(F)` ; un seul fond en mémoire ; `icon()` paresseux.
- Aussi : 10 décors refaits (5 zones × 2 sens), bandeaux de contrats `assets/q/`, `tools/cut_flood.py`, `TILE_W` pour `cut_tiles.py`. 62 tests.

## V4.0.1 (26/11/2026) — un sol HD par région
`sol_prairie` (Prairie et Village), `sol_bois`, `sol_plage`, `sol_mont`, `sol_chateau` (planches ChatGPT 2×2, 512 px par tuile, WebP 90), `tiles5` pour les Cavernes. `THEMES[].ts` + `g` = cases de la planche ; l'eau et la roche restent dans `tiles4`. Les sols sont chargés à l'entrée de leur zone et libérés ensuite. Écartées : tuile avec gros rocher (Prairie), dalle sculptée (Château). `cut_tiles.py` : `TILE_W`, `TILE_N`, `TILE_Q`.

## V4.0.2 (26/11/2026) — sons des Cavernes, finitions
- Sons ElevenLabs (lot R6, 968 crédits) : `crystal_amp`, `prism_burst`, `beam_charge`, `beam_fire`, musique `cave` (stéréo, ajoutée au `case` de audio.yml). Secours dans `FALL` tant qu'un fichier manque.
- Niveau 4 : `prismCover` met le dernier monstre à couvert derrière le prisme. Défi du jour des Cavernes avec 1 turquoise + 1 violet.
- Mode test : `?fps` dans l'adresse affiche images/s et le plus long écart entre deux images. 63 tests.

## V4.0.3 (26/11/2026) — lot sonore épique, sons rangés
- Sons rangés : `assets/audio/musique/` et `assets/audio/bruitages/`, catalogue `assets/audio/SONS.md` ; `dir()` dans audio.js ; le workflow audio range tout seul (et fait `apt-get update`, cause de l'échec de la V4.0.2).
- Nouveaux sons (ElevenLabs, 3 736 crédits) : golem_smash, spider_bite, bat_shriek, titan_roar (phases), titan_death, chest_open, loot_rare, boss_intro ; musiques titan_boss, coast (Côte), mountain (Monts), castle (Château). Plus les 5 sons de la V4.0.2 (968 crédits), téléchargés avec ce lot.

## V4.0.4 (26/11/2026) — effets du Titan
Événements `beam` (traits de lumière de l'origine vers chaque case + colonnes, `addBeam`) et `wave` (onde de choc au changement de phase, `addWave`). Aura du Titan plus grande et pulsée pendant la charge (`s.beam.by`). Le prisme qui éclate projette aussi ses traits vers ses 4 voisines. L'ancien effet poison (têtes de mort) n'est plus utilisé pour le rayon ni le prisme.

## V4.0.5 (26/11/2026) — plateau plus grand, plein écran
- Portrait : PA/PM sur la ligne du nom, rangée des cibles flottante au-dessus du panneau (`#tgt` en absolu), marge au-dessus du plateau 1,4 → 1,05 case : cases +21 % sur iPhone (48 → 58 px).
- Paysage : panneau latéral `--side` clamp(178px, 22vw, 236px), marge 1,22 → 1 case.
- Application plein écran : `manifest.webmanifest` (display fullscreen), balises Apple, icônes `assets/icon-*.png`. Sur iPhone : Safari › Partager › « Sur l'écran d'accueil » supprime les barres de Safari.

## Test de prise en main V4.0.5 (26/11/2026) — retour ChatGPT pour Claude

- **Base.** Version publique V4.0.5, Chrome paysage, environ 8 minutes menus compris. Base du dépôt `e44d484` (PR #53), identique sur `main` et `gh-pages` lors de la vérification. Les 63 tests de `npm test` passent sur ce commit.
- **Parcours.** Prairie 1 et 2 gagnées tour 3, 3 étoiles chacune et aucun KO. Prairie 1 donne l’Arc long de Fenn (+2 dégâts), 24 XP et 14 or. Prairie 2 donne 34 XP et 23 or et termine deux contrats. Prairie 3 testée sur le premier tour, puis retraite. Après réclamation du premier contrat à la Taverne et actualisation, niveau 2, 13/120 XP, 65 or et combat 3 disponible. Spécialisations consultées au niveau 1, encore verrouillées.
- **Jouabilité.** Le combat 2 fait travailler ensemble placement, ligne de vue, zone de Fenn, poison et soutien d’Aelis, puis frappe de Kael. « Aelis bloque le tir » explique la contrainte. L’aperçu du déplacement montre la sortie. Conserver ces deux retours complémentaires et les rôles distincts du trio.
- **Priorité 1 · cibles.** Dans Prairie 1, Aelis masque partiellement une Gelée sur le bord droit. Les portraits restent utilisables. Faire ressortir la silhouette et la case de la cible examinée et vérifier sélection du sprite, socle et portrait en mêlée.
- **Priorité 1 · Volée.** Dans Prairie 3, la Gelée B est grisée à six cases, alors qu’une case vide orange plus proche permet de la toucher avec la zone. Prévisualiser le centre et les quatre voisines, indiquer les unités touchées, permettre l’aperçu puis la confirmation au doigt. Vérifier les interactions avec les prismes.
- **Priorité 1 · chiffres.** Tir affiche sa plage de base de 8–12 malgré le butin et Aura. Un tir sous Aura a descendu le Sanglier de 27 à 11 PV. Afficher une plage effective à la cible, en tenant compte des modificateurs vérifiés et en distinguant les effets aléatoires.
- **Priorité 2 · interface.** Prairie 3 : l’eau ressemble aux cases bleues accessibles. Faire varier forme/contour et expliquer l’échec d’un appui. Adapter le conseil à 0 PM, tester le camp sur différentes proportions et clarifier le compteur de combats avec le boss.
- **Suite.** Finir Prairie 3, Roi Gelée et Bois sombre, puis couvrir chevaliers, Cavernes et Titan sur une progression avancée. Tactile et performances restent à mesurer sur appareil. Le [prompt complet pour Claude](TACTIKA-Claude-V4.0.5.prompt) détaille les reproductions, critères de réception et vérifications de non-régression.

## V4.5a (27/11/2026, Opus) — survie à renforts (pilote Bois 3) + simulateur
- `ZONES[].waves[i]` = {turns, cap, start, add:[[tour, n, espèce élite]]} ; `waveSetup/wavePlan/waveTick/waveEmpty` (rules.js). Annonce un tour avant (cases ⚠), arrivée en début de tour, insertion en fin d'ordre, plafond 6, case prise = attente, plateau vide = vague avancée. Élite : PV ×1,5, dégâts ×1,2, anneau doré. XP des renforts ÷2.
- Victoire : tenir 6 tours (les survivants se replient) ou tout éliminer une fois les vagues finies (+25 % d'or). 3e étoile des missions à vagues = toutes les vagues éliminées.
- `tools/sim.mjs pilote [graines] [missions]` : 3 profils (sous/std/opti), graines fixes, dégâts, soins, XP, compteur de combats. 71 tests.
