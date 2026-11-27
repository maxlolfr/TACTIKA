# Tactika

Jeu tactique au tour par tour façon Dofus, en HTML5 (aucun moteur externe, modules ES), pensé pour le mobile (téléphone, tablette, pliable) et jouable sur PC. Français et anglais.

**Jouer :** https://maxlolfr.github.io/TACTIKA/ — **version 5.01** (voir `NOTES.md` pour l'historique détaillé).

## Le jeu (V5.0 / V5.01)
- **Campagne** : 12 régions sur deux cartes du monde (120 missions, 12 boss), 40 quêtes, scénario avec scènes et épilogue, voix (combat et narration) FR/EN.
- **6 héros** : Kael, Fenn, Aelis, Orion, Nyra, Lyria — 60 sorts, 90 talents répartis en 18 spécialisations, maîtrise des sorts, caractéristiques, 120 équipements, forge, marchand, taverne (défi du jour).
- **Combat** sur grille isométrique : PA/PM, ligne de vue, poussée, combos, étoiles, mécaniques propres à chaque boss. Difficulté volontairement élevée (murs de niveau, quêtes secondaires et XP pour progresser).
- **Chronique** : 40 trophées, bestiaire (52 fiches), collection d'équipements, statistiques, complétion des régions.
- **Réglages** : langue FR/EN, animations rapides, effets réduits, volumes, **sauvegarde** (export / import par fichier ou par code, copie de secours).

## Sauvegarde (V5.01)
Locale au navigateur (`localStorage`). Lecture sûre : si la sauvegarde est abîmée, la copie de secours est restaurée et l'original est gardé de côté (`landeTactique1_corrupt`). Une erreur d'écriture (stockage plein ou bloqué) est signalée par un bandeau. Réglages → 💾 Sauvegarde : exporter un fichier `.json`, importer un fichier ou un code, restaurer la copie de secours. Toutes les anciennes sauvegardes (V1 à V5.0) restent lisibles.

## Hors connexion
Un service worker (`sw.js`) garde le jeu en cache : après un premier chargement, il démarre sans réseau. Les images et sons se mettent en cache au fil du jeu (un écran jamais visité en ligne peut manquer d'images hors connexion). Les polices (Nunito, Lilita One, licence SIL OFL) sont hébergées dans `assets/fonts/`.

## Fichiers
- `index.html`, `style.css`, `home.css`, `sw.js`, `manifest.webmanifest` : page, styles, hors-connexion, application installable.
- `src/` : code (données, règles pures, tours, rendu, interface, village, audio, sauvegarde `save.js` + `savecore.js`, traductions `i18n*.js`, scénario, quêtes, Chronique).
- `tests/` : tests Node (`npm test`, Node 22) — règles, sauvegardes, stabilité (imports, fichiers, service worker).
- `tools/` : `smoke.mjs` (test de fumée en vrai Chrome), `en-audit.mjs` (audit de la traduction anglaise), `sim.mjs` / `tune*.mjs` (simulateur d'équilibrage), scripts de découpe d'images (Python), `audio_registry.py`.
- `assets/` : images WebP, sons (`assets/audio/`, catalogue `SONS.md`, licences `LICENCES.md`), polices.
- `legacy/` : ancienne version en un seul fichier.

## Vérifier
`npm test` (tests unitaires, sans navigateur) puis `node tools/smoke.mjs` (Chrome et `playwright` requis ; variables `CHROME`, `PW`).

maxlolfr · GitHub
