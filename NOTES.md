# Notes du projet Tactika

## V2.4a (26/11/2026) — corrections, camp, impacts
- Direction : `Game-studio-ai/docs/studio/tactika/DIRECTION-PRODUCTION-V2.4.md` (priorités de Max, découpage V2.4a/b/c, pas d'équilibrage fin avant les tests de Max).
- Corrections : détail des étoiles juste (`starList`), fuite pendant une animation (numéro de combat `G.fid` : une ancienne boucle de tours s'arrête, `cast` garde son propre état), `genMap` ne peut plus échouer (plateau dégagé en secours), sauvegarde versionnée (`v:2`) et vérifiée au chargement. Graine liée à l'or gardée (variété des cartes rejouées). 27 tests.
- Camp : 4 bâtiments (`assets/bld.webp`, planche ChatGPT découpée par `cut3.py --scale 0.6` : 0 forge, 1 marchand, 2 maître d'armes, 3 taverne), sous le bouton Carte ; forge active en V2.4b, autres « bientôt ».
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
