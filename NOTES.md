# Notes du projet Tactika

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
- Nouveaux héros ChatGPT : planches `kael9/fenn9/aelis9` (poses repos, coup, touché, sort, spécial, KO, genou à terre sous 30 % PV, victoire). Marche et dos : `kaelM` et `fennM` (H-04 reçues le 26/11) ; anciennes planches pour Aelis en attendant H-04. Icônes encadrées `tal` (4×4).
- 35 tests.
