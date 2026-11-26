# Tactika

Jeu tactique au tour par tour façon Dofus, en HTML5, pensé pour le mobile (iPhone en portrait).

**Jouer :** https://maxlolfr.github.io/TACTIKA/

## Le jeu (prototype 1)
- 3 héros : Kael (guerrier), Fenn (archer), Aelis (soigneuse), 3 sorts chacun.
- Combats sur grille isométrique : 6 PA pour les sorts, 3 PM pour se déplacer, ligne de vue, critiques, poison, bouclier, bonus.
- Carte du monde avec 5 zones (Prairie, Bois sombre, Côte dorée, Monts gris, Château en ruine), 3 combats + 1 boss par zone.
- XP, niveaux, or, objets ; sauvegarde locale.
- V2.3 : intentions ennemies affichées, poussée (Fracas), combos entre héros, 1 à 3 étoiles par combat, coffre de butin animé.
- Son : moteur Web Audio, sons de secours synthétisés en attendant les fichiers ElevenLabs (`assets/audio/<nom>.mp3`).

## Fichiers
- `index.html` + `style.css` : page du jeu ; `src/` : code en modules ES (données, règles pures, tours, rendu, interface, audio, sauvegarde) ; `tests/` : tests Node des règles (`npm test`) ; `legacy/` : ancienne version en un seul fichier.
- `assets/` : planches détourées en WebP + `atlas.json` (cadres et points d'ancrage des pieds).
- `tools/cut.py` : détourage des planches générées (fond magenta/vert/noir → transparence, découpe, atlas).

## Suite prévue (V2)
Passage au moteur Phaser, code en modules, marche animée, interface bois et parchemin, effets d'ambiance, puis progression façon Dofus (talents, équipement, village, métiers).

maxlolfr · GitHub
