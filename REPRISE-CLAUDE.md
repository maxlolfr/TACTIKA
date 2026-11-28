# REPRISE CLAUDE · Tactika (mot de passe d'une fenêtre à l'autre)
Dernière mise à jour : 28/11/2026, V5.22 (Cauchemar R7–R9 + Spectral / Commandant). Version en ligne : **5.22** (voir le haut de NOTES.md, source de vérité). Prochain lot Cauchemar : R10–R12 (Opus, nouvelle fenêtre).

## Qui / comment
Max (Maxlolgames), français, **pas d'ordinateur, tout depuis l'appli mobile Claude** (Thaïlande). Répondre en français. Autorisation totale sur Tactika : merges, déploiements, « carte blanche », ne pas s'arrêter pour demander « je continue ? ».
**À chaque réponse** : barre de progression visible, estimation de tokens avant ET après, durée estimée, quel modèle Claude est le plus efficace (Sonnet suffit pour le travail répétitif), dire quand une nouvelle fenêtre économiserait des tokens, toujours donner le lien jouable. Générer des sons (ElevenLabs) : demander d'abord (nombre + coût) sauf autorisation explicite ; rapporter le coût après. Les images qu'il envoie doivent être rangées dans le dépôt (art/).

## Objectif en cours : TOUT en HD pour une version Steam
Voir en tête de NOTES.md la section « RESTE À FAIRE · passage 100 % HD ». Résumé :
1. **Fait (19 sprites HD)** : pharaoh griffin frostking breaker sanctguard aetherion queen knightK ignaros obsid salam fireel anubis scorp mummy cguard yeti frostel etherknight etherbeast polarwolf astral ent wraith.
2. **À faire en priorité** : monstres normaux (batN crabN slimeN gullN wolfN boarN goblinN shroomN golemN skelN ghostN toad monA-D qspider prisbat crabK wolfK golemK crygolem knightB/R/N roiG). Demander à Max les planches originales fond magenta (6 poses : i, a, h, s, mort, idle2), puis découper.
3. Ensuite : héros (kael, fenn, aelis, orion, nyra, lyria, warrior, archer, healer et variantes) ; portraits HD déjà dans `art/portraits-heros-v516/` (Lyria paladin, Orion mage, Aelis soigneuse, Kael chevalier, Nyra voleuse, Fenn archer), **pas encore branchés** dans le jeu.
4. Puis décor/interface (tiles, deco, bld, items, equip, spells, fx, icônes, ui, hud2, bg…) : trop petits pour être re-découpés, il faut **écrire pour Max des prompts ChatGPT/Gemini** (prompts complets, numérotés, chacun dans son bloc, taille/poids précisés, dire lequel des deux outils est le meilleur).

## Outil de découpe HD
`python3 tools/cut_boss_hd2.py <nom> <planche.png:CxR> [<planche2>…] --map a,b,c,d,e,f [--dry]`
- Planches de Max à fond magenta, grilles variables (3x2, 2x2, 3x3…). `--map` choisit les cases (ordre i, a, h, s, mort, idle2, comptées planche après planche, ligne par ligne).
- Sans `--map` l'appariement automatique est peu fiable quand les poses diffèrent : regarder d'abord des bandes numérotées ancien/nouveau (`/home/claude/work/show.py`, à recréer si absent), puis fixer le `--map` à la main.
- Écrit `assets/<nom>.webp` (q88, 1400 px) et met à jour `assets/atlas.json`. La taille à l'écran suit la hauteur de la case 0 : un recoupage HD ne change pas la taille en jeu.
- Planches de Max arrivent numérotées dans /mnt/user-data/uploads/ ; copier dans /home/claude/work/ avant de couper. Ranger les originaux en webp sans perte dans `art/originaux-boss-v516*/`.
- Pas de pose « mort » pour queen et breaker (pose basse utilisée). Non utilisées/rangées : breaker_alt, frostking_b, ent_b, golem doré pharaonique, titans.

## Cycle de livraison
`npm test` (265 tests) + `node tools/smoke.mjs` → bump VERSION dans `sw.js` ET `src/home.js` → entrée en tête de NOTES.md → branche → commit (trailers Co-Authored-By + Claude-Session) → push (`git -c push.negotiate=true push -q -u origin <branche>`) → PR via `gh api repos/maxlolfr/tactika/pulls` (GraphQL interdit) → merge `gh api -X PUT .../merge -f merge_method=squash` → vérifier `curl https://maxlolfr.github.io/TACTIKA/src/home.js | grep VERSION`. Règle code : jamais de commentaire `//` au milieu d'une ligne compacte.

## Autres points ouverts
- Son de furie des élites très court (~0,5 s) : proposer de le refaire.
- Dépôt maxlolfr/Game-studio-ai non rattachable dans la dernière session (refusé) : fichiers du studio pas à jour ; redemander l'accord à Max si besoin.
- Sons élites Cauchemar (V5.16) : nm_elite_{drain,regen,venom,fury,prime,boom,blocked}.
