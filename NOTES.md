# Notes du projet Tactika

## État (24/11/2026)
- **Lot 1 fait** (branche `claude-b/tactika-v2-lot1`) : code en modules ES (`src/data,rules,save,audio,render,turns,ui,main.js` + `style.css`), règles testées (`npm test`, Node 22), ancienne version dans `legacy/`. Aucune règle ni visuel changé. Direction créative : voir `Game-studio-ai/docs/studio/tactika/`.
- V2.0 en cours : marche animée, poses, ambiance par zone, interface bois et parchemin, logo et camp. Moteur encore en canvas maison (passage à Phaser à décider).
- Démo privée (artifact Claude) : https://claude.ai/artifact/QpgTozh4PNXivLsHXEGCQ7
- Page des prompts d'images : https://claude.ai/artifact/6UyUv9LBEPf3nggUffkfBH
- Sons ElevenLabs générés (flow 97rZARFgripawZTlXj1N) mais pas encore récupérés : il faut les télécharger depuis l'app et les envoyer. Noms attendus : slash smash guard bow arrowhit heal poison buff hit bite slime death step click turn coin levelup victory defeat camp battle boss.

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
