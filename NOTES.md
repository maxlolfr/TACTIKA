- **V4.82 · audio V5 (phase 2 : voix FR/EN et narration)** : 63 répliques de combat (Orion, Nyra, Lyria en FR et EN ; Kael, Fenn, Aelis en EN, leurs 21 FR inchangées), fichiers `v_<héros>_<réplique>.mp3` (FR) et `_en.mp3` (EN), choisis par `save.lang` via `setVoiceLang` (gains uniformes, loudnorm -17 LUFS). Voix : Orion = Ludovic, Nyra = Dahlia, Lyria = Ophélie (bibliothèque ElevenLabs, droits commerciaux à vérifier dans le plan). Sorts d'Orion avec `vx`. Narration parlée pilote : 24 répliques FR + 24 EN (prologue, régions 6, 9, 12 avant et après, épilogue ; Mira = Anne-Sophie, Garrick = Baptiste, Architecte = Georges, les autres = voix des héros), `vo_<scène>_<n>_<fr|en>.mp3`, lecture à chaque réplique, coupée net par « Passer », muette si le son ou le volume voix est à zéro. Reste : bascule de langue dans les réglages, autres scènes, écoute sur appareil réel.
- **V4.81 · audio V5 (phase 1 : musiques et bruitages)** : 8 nouvelles musiques de 90 s (sables, marais, citadelle céleste, givre, sanctuaire, élite carte II, boss final, fin) ajoutées sans toucher aux 19 existantes (`ember` et `boss_map2` conservées) ; 28 bruitages (Orion 7, Nyra 7, Lyria 6, mécaniques de boss et de région, recrutement, talent). Zones carte II routées vers leur musique, élites de la carte II vers `elite2`, boss de la région 12 vers `final_boss`, épilogue vers `ending`, recrutement avec `recruit_hero`. Les sorts d'Orion, Nyra et Lyria ont leur son propre. `FALL` garde un repli pour chaque nouveau nom. Bruitages en mono 44,1 kHz 64 kbit/s, musiques sans recompression. Test ajouté : chaque son déclaré existe, chaque `snd` de sort est connu. Reste de la phase 2 (V4.82) : voix de combat et narration FR/EN.
# Notes du projet Tactika

## V5.08 — ambiances des 12 régions + textes du panneau (28/11/2026, brief ChatGPT « excellence 98 »)
- **Nouveau module `src/ambiance.js`** (sans image ajoutée, sprites de lueur pré-rendus) : remplace le prototype V5.05 et les anciennes lucioles génériques. R1 pollen doré + 3 papillons + brise ; R2 feuilles flottantes + lucioles ; R3 écume + embruns ; R4 poussière + vent de montagne ; R5 brume violette/turquoise + poussière spectrale ; R6 scintillements prismatiques (étoiles à 4 branches, teinte qui tourne) ; R8 sable porté par le vent + bande de rafale ; R9 brume rampante + spores ; R10 nuages + plumes ; R11 neige + vent glacial + léger reflet de glace sur la bordure ; R12 particules magiques or/violet + pulsation dorée (anneau tous les 7,5 s) + reflet doré de bordure.
- **Braise retouchée (R7)** : trois classes de braises (étincelle vive, braise, grosse braise lente) qui virent du jaune au rouge en montant, mouvement de vent irrégulier ; lueur de lave en deux fréquences (pulsation irrégulière) + 2 lueurs locales ; **reflets orangés sur la bordure du plateau** (arêtes extérieures des cases, plus vifs côté lave) + 3 reflets qui s'allument par endroits.
- **Contraintes tenues** : opacités faibles (particules ≤ 0,9 sur des sprites de quelques pixels, brumes ≤ 0,11), rien de décisif au-dessus des cases ; « Effets réduits » = 4 à 8 particules par région, pas de papillons, vents, pulsations ni traînées (lueurs fixes) ; aucune règle, aucun équilibrage, aucun contenu touché.
- **Textes tronqués corrigés (panneau de combat)** : libellé de sort « Tir perfo… » (taille de police ajustée au bouton, jusqu'à 6,5 px) ; aide du bas coupée à la 3ᵉ ligne en portrait (3 lignes réservées, défilement au-delà) ; en paysage plein écran, plafond relevé ; en paysage bas (≈ 412 px) le panneau est compacté (bouton Fin du tour, cibles) et défile au besoin, l'aide n'est plus réduite à 3 px. Les chevauchements de monstres : 0 sur 144 combats mesurés.
- **Mesures** (`node tools/ambiances.mjs`, Chrome sans GPU, 12 régions × portrait 412×915, paysage 915×412, presque carré 924×805, normal et Effets réduits, combat 9/10) : 60 i/s partout sauf presque carré (moyenne 59,3, min 55,7 région 6 en rendu logiciel) ; code du jeu ≈ 0,5–0,6 ms/image (région 6 en presque carré : ≈ 10 ms/image **déjà présente en V5.07**, mesurée à 11,3 ms avant ce lot, non modifiée) ; images > 33 ms : 0 % (≤ 1,2 % en presque carré) ; chevauchements 0 ; textes tronqués 0. Mesure réelle sur l'Honor : `?fps`.
- 203 tests + `node tools/smoke.mjs` OK. Captures : 12 régions dans la fiche partagée.

## V5.07 — menu du haut repliable en paysage (28/11/2026, retour de Max sur l'Honor déplié)
- Retour : ♪ 🔊 ⚙ Fuir écrasaient la frise des tours (un seul portrait visible). En paysage (Honor déplié, tablette, PC), ces quatre boutons sont maintenant repliés derrière un bouton ☰ ; un toucher les rouvre (Fuir reste à un geste). Frise : 345 px au lieu de ≈ 160 (presque carré 924×805), 474 px en paysage 915×412 : 6 portraits visibles au lieu d'1. Portrait inchangé (la frise y a sa propre ligne).
- 203 tests + test navigateur OK. Aucune règle touchée.

## V5.06 — finition, lot 4 : audio (28/11/2026)
- **Mesure** EBU R128 des 231 fichiers (sortie : `tools/audio-loudness-v5.06.txt` = fichier, LUFS intégrés, crête vraie, crête). Médianes : musiques -13,5 LUFS, voix -17,4, bruitages -20,7.
- **Musiques** (aucun fichier modifié, gain de lecture `TRIM`) : marais ×1,7 (-18,8 LUFS), sanctuaire ×1,2 (-15,4), givre ×0,9 (-12,1) ; réglages existants conservés (thème, camp, carte II, braise, boss carte II).
- **Bruitages** (`STRIM`, nouveau) : coup reçu ×3,2 (crête -24 dB : presque inaudible jusqu'ici), soin ×2, fracas et esquive ×1,6, jingle de défaite ×1,6 (-19,6 contre -13,1 pour la victoire), mort de boss ×0,85 (crête au-dessus de 0 dB). Le limiteur de sortie empêche la saturation.
- **Voix** d'Orion, Nyra et Lyria égalisées sur Kael/Fenn/Aelis (≈ -15,7 LUFS effectifs, KO un peu plus bas) : Orion « début » ×1,97 et « niveau » ×1,8, le reste ×1,1–1,3.
- Aucun son généré ni remplacé, aucune musique changée. 203 tests + test navigateur OK. Écoute finale par Max sur l'Honor (casque et haut-parleur).

## V5.05 — finition, lot 3 : prototype d'ambiance, Forteresse de braise (28/11/2026) — À VALIDER (Max + ChatGPT)
- Uniquement dans la Forteresse de braise (décor 7) : les lucioles jaunes génériques (décor non prévu, repli par défaut) sont remplacées par **22 braises procédurales** qui montent en vacillant et par une **lueur de lave** qui respire doucement en bas de l'écran (opacité 10–16 %). Aucune image ajoutée.
- Lisibilité : braises minuscules, lueur limitée au bas de l'écran et très transparente. « Effets réduits » : 6 braises, lueur fixe.
- Mesure (même combat, Chrome de test) : 60 i/s avant et après ; code par image 1,02 → 0,56 ms (moins coûteux que les lucioles dessinées en images).
- Les 11 autres régions sont inchangées tant que le prototype n'est pas validé.

## V5.04 — finition, lot 2 : sensations de combat (28/11/2026)
- Effets procéduraux légers (aucune image, aucun son ajoutés), déclenchés par les événements existants des règles : **impact selon le type d'attaque** (arc doré pour le corps à corps, éclat en étoile pour les flèches, halo coloré pour la magie et les sorts d'Orion, vert pour le poison, orange pour la brûlure) ; **blocage** (hexagone bleu quand un bouclier ou une protection encaisse) ; **esquive** (pas de côté + traits de vitesse) ; **soin** (anneau vert et étincelles qui montent) ; **critique** (halo doré + arrêt bref de 70 ms) ; gros coup (≥ 30 % des PV) : arrêt de 45 ms ; **défaite d'un boss** : arrêt de 160 ms, colonne de lumière et onde dorée, puis zoom, secousse et éclats.
- **Récompenses** : l'or et l'XP comptent jusqu'à leur valeur (0,65 s) ; reflet doré qui balaie une fois les objets gagnés.
- « Effets réduits » : pas d'arrêt bref, pas d'étincelles, pas de compteur ni de reflet, éclats réduits. Durée des combats inchangée (l'arrêt bref ne retarde pas les tours).
- Aucune règle, aucun équilibrage, aucun contenu touché. 203 tests + test navigateur OK.

## V5.03 — finition, lot 1 : mesures et lisibilité (28/11/2026)
- **Outils** : `tools/perf.mjs` (chargement, i/s, image la plus longue, % d'images > 33 ms, mémoire, coût du code par image ; portrait 412×915, paysage 915×412, presque carré 924×805 ; Prairie 1 et Forteresse de braise 9) et `tools/shots.mjs` (48 combats, chevauchements d'étiquettes comptés, captures ; `?lis` expose les rectangles).
- **Mesures de départ** (Chrome de test, sans carte graphique) : 60 i/s partout, code du jeu ≈ 0,7–1,1 ms par image (budget 16,7 ms), mémoire JS 5–7 Mo, camp affiché en ≈ 0,6 s en local. Processeur ralenti ×4 : 40–52 i/s en portrait/paysage, ≈ 25 i/s en presque carré, mais le coût vient du rendu de la machine de test (99 % hors code du jeu, inchangé canevas masqué) : à confirmer sur l'Honor avec `?fps`. Essai de résolution adaptative fait puis retiré (aucun gain mesuré).
- **Lisibilité** : barres de vie placées de l'avant vers l'arrière ; si une barre (avec ses icônes d'état) en chevauche une autre, elle remonte d'un cran (4 au plus). Les bulles d'attaque évitent en plus la tête des héros. Mesure sur 47 combats : chevauchements de barres 15 → 0 ; bulles/barres, bulles/bulles, bulles/têtes : 0 avant et après (6 bulles seulement vues au premier tour : à surveiller en jeu).
- Aucune règle, aucun équilibrage, aucun contenu touché.

## V5.02 — correctif cache (28/11/2026)
- Sur l'Honor, après la fusion de la V5.01, le premier combat restait bloqué (panneau des sorts vide + bandeau d'erreur) alors que la V5.01 fonctionne en navigateur de test : le téléphone gardait l'ancien `src/ui.js` de la V5.0 (trh non importé) en cache.
- `sw.js` : code et page toujours revalidés auprès du serveur (`cache:'no-cache'`), installation sans cache HTTP (`cache:'reload'`), VERSION 5.02 = purge des anciens caches.
- Le bandeau d'erreur affiche désormais le message exact (capture d'écran = diagnostic).

## V5.01 (28/11) : robustesse technique (suite de l'audit statique de ChatGPT sur le commit d37e6b5)
Règles respectées : aucun équilibrage, aucune direction artistique, aucun contenu ni musique supprimé ; Cauchemar et héros 3D hors lot ; sauvegardes préservées.
- **Correctif important, présent en V5.0** : `trh` n'était pas importé dans `ui.js` → `ReferenceError` au tutoriel de combat, donc sur **toute partie neuve** (le tutoriel plantait avant l'affichage de l'objectif). Trouvé par le nouveau test de fumée en vrai Chrome, confirmé avec ESLint (`no-undef`, propre sur tout `src/` après correctif).
- **Sauvegarde** (`src/savecore.js` pur + `src/save.js`) : diagnostic de V5.0 = lecture avec `catch` vide (partie neuve silencieuse, puis le `store()` suivant écrasait l'original), écriture avec `catch` vide, aucune copie de secours, validation limitée à `lvl` et `items`, import sans nettoyage. Maintenant : lecture principal → copie de secours (`landeTactique1_bak`) ; texte abîmé gardé à part (`_corrupt`, jamais écrasé) ; secours = état précédent rafraîchi toutes les 45 s (et état de début de session) ; `store()` renvoie vrai/faux, réessaie une fois après avoir libéré `_corrupt`, bandeau FR/EN si l'écriture échoue ; `sanitizeSave` (nombres, objets, clés dangereuses, limite 4 Mo), sans toucher aux champs additifs (`cr`, `ms`, `storySeen`…) ; import validé qui range la partie actuelle en copie de secours (annulable). Réglages → 💾 Sauvegarde : Exporter (fichier .json), Importer (fichier), Importer (code), Copier, Copie de secours.
- **Stabilité** : gestionnaire global d'erreurs (`index.html` : 10 dernières erreurs dans `localStorage.landeErr`, bandeau discret). Tests `tests/stability.test.mjs` : imports nommés résolus, fichiers cités par la page/le CSS/le code présents, boucle de dessin (garde V4.91), `trh`, gestionnaire d'erreurs, service worker, polices. Cause de l'écran noir V4.91 déjà garde-foutée ; la V4.91 n'avait pas vu le `trh` manquant.
- **Hors connexion / PWA** : `sw.js` (coquille pré-chargée, réseau d'abord 4 s pour page/code, cache d'abord pour images et sons, sons servis par morceaux) ; manifeste complété (`id`, `description`, `categories`) ; polices Nunito/Lilita One hébergées (`assets/fonts/`, 88 Ko, licences OFL jointes), Google Fonts retiré.
- **Anglais** : audit automatisé `tools/en-audit.mjs` (partie niveau 30 en anglais, camp, Héros, Inventaire, Quêtes, Chronique, 6 bâtiments, cartes) : 36 textes restaient en français ou mélangés (Académie, Héros, Marchand, quêtes, maîtrise) → compléments dans `i18n.js` ; l'audit ne signale plus que « ⚔ Combat » (identique en anglais). **Non audités** : écrans de combat et bilan, Forge détaillée, Expéditions, narration.
- **Licences audio** : `assets/audio/LICENCES.md` + `REGISTRE-LICENCES.csv` (231 fichiers, généré par `tools/audio_registry.py`). Droits commerciaux « À CONFIRMER » : dépend de la formule ElevenLabs au moment des générations et des conditions de chaque voix de bibliothèque (Max doit vérifier).
- **README** mis à jour. Version 5.01 (`index.html`, `VERSION`, `sw.js`).
- **Tests réellement exécutés** : `npm test` 203 OK (dont 17 sauvegardes, 8 stabilité) ; `node tools/smoke.mjs` en Chrome headless : camp, combat de la prairie (plateau non noir, boucle active, tutoriel), menus, sauvegarde abîmée avec secours, stockage plein, hors connexion (service worker) : tout OK ; audit anglais ci-dessus. **Restent à vérifier** : Honor plié/déplié, iPhone/Safari (service worker, export de fichier), lecture audio hors connexion, partie complète jusqu'à la fin, droits audio.

## V5.0 (28/11) : version de référence
- Contenu : 12 régions / 120 missions, 40 quêtes, 6 héros, 60 sorts, 90 talents, 120 équipements, scénario V2 FR/EN, voix, Chronique (40 trophées), jeu entièrement jouable en anglais (Réglages → 🌐).
- QA finale : 178 tests OK ; 5 formats d'anciennes sauvegardes (V1 à V4.89, dont une abîmée) chargés sans perte ni erreur ; boss au simulateur sur graines neuves (`SEED0=500 PROF=mid`, 96 combats, profil moyen) : R1–R2 8/8, R3–R5 6 à 8/8, R6–R8 5/8, R9–R10 4/8, R11–R12 1/8 (PV restants 76 % → 4–8 %). Courbe voulue par Max (murs de niveau, farm conseillé) ; le bot joue moins bien qu'un humain, le test sur téléphone fait foi.
- Aucune règle de jeu modifiée depuis la V4.91 (numéro de version seulement).

## V4.91 (28/11) : correctif écran noir + lot 7b (fin) — anglais des quêtes, du tutoriel, des astuces de boss
- **`src/i18n-quests.js`** : 40 quêtes (titre, présentation, réplique) ; clés lues dans `quests.js`.
- **`src/tips.js`** (FR, sorti de `ui.js`) + **`src/tips-en.js`** : tutoriel (5), astuces (19), intros de boss (11), aide « Comment jouer ». Objectifs de combat : `GOALS_EN` dans `ui.js`.
- Textes à balises : `trh()` / `regHtml()` dans `i18n.js` (l'observateur ne voit que des morceaux entre `<b>`).
- `tests/tips.test.mjs` : 177 tests OK. QA : 5 formats d'anciennes sauvegardes chargés sans erreur ; simulateur pilote sans changement (aucune règle touchée).
- **Correctif écran noir** (signalé par Max, tous les combats) : en V4.89, le commentaire « anglais de l'interface » avait été collé devant `requestAnimationFrame(draw)` dans `main.js` ; la boucle de dessin ne démarrait plus. Test anti-régression ajouté.

## V4.90 (28/11) : lot 7b (1re partie) — anglais des descriptions de sorts et de talents
- **`src/i18n-desc.js`** (fusionné dans `EN`) : 202 textes (descriptions des 60 sorts et de leurs variantes de talents, 18 spécialisations, 90 talents avec leurs noms). Test : chaque description de sort et de talent a son anglais.
- Correctif : « 2 or 3 » (anglais) n'est plus pris pour la monnaie.
- **Reste du lot 7b** (à faire) : textes des 40 quêtes (titre, présentation, réplique de fin), astuces de boss et du tutoriel (`TIPS`, `HOW`, objectifs dans `ui.js`), effets d'objets composés. Puis QA finale (lot 7) et V5.0.
- 172 tests OK.

## V4.89 (28/11) : lot 7a — anglais de l'interface (menus, combat, noms)
- **`src/i18n.js`** : dictionnaire FR → EN (≈ 560 entrées : camp et menus, Chronique et 40 trophées, carte, combat, bilan, textes flottants, 12 régions et boss, 41 monstres, classes, emplacements, raretés, caractéristiques, 18 spécialisations, sorts, 120 objets). Quand `save.lang === 'en'`, un observateur traduit les textes affichés (texte entier, sinon expression par expression en mots entiers, « 340 or » → « 340 gold ») et les infobulles ; les textes flottants du combat passent par `say()`. Les récits (fenêtre `#story`) gardent leur propre anglais.
- Réglages → Langue : passer en anglais traduit l'écran tout de suite ; revenir au français recharge la page (textes d'origine).
- **Reste en français (lot 7b)** : descriptions longues (sorts, talents, effets d'objets, textes des 40 quêtes, astuces de boss, tutoriel). En anglais elles peuvent mélanger les deux langues d'ici là.
- Garde-fous testés : français inchangé quand la langue est le français ; toute traduction relue reste identique (pas de boucle de l'observateur) ; tous les noms de régions, objets, monstres et trophées ont leur anglais. 171 tests OK. Pas d'essai navigateur (refusé ici) : à vérifier par Max (Réglages → 🌐).

## V4.88 (28/11) : lot 6 polish — introduction des boss, transitions, option « Effets réduits »
- **Carte d'introduction des boss** (`bossCard`, ui.js) : au début de chaque combat de boss (pas en défi du jour), cartouche bleu nuit et or avec portrait, région, nom et une phrase sur son style (« Se téléporte », « Brise toute défense »… sans chiffres). Disparaît seule (2,4 s, 1,4 s en animations rapides) ou d'un toucher ; le combat n'attend pas.
- **Transitions** : fondu de 0,22 s à l'ouverture des écrans (carte, résultat, forge, marchand…).
- **Réglages → « ✨ Effets réduits »** (`save.lowfx`) : 3 particules au lieu de 12 par impact, plus de secousse d'écran, animations CSS coupées (confort et FPS sur petits appareils). `prefers-reduced-motion` respecté.
- Pas de mesure de FPS ni d'essai visuel (navigateur refusé ici) : à juger par Max sur l'Honor. Aucune mécanique touchée. 170 tests OK.

## V4.87 (28/11) : nouvelle carte du monde I (image 2052 de Max), interface des deux cartes harmonisée
- **Image** : `art/carte1/carte1-v2-2052.png` (original 1536×1024, sans perte) → `assets/world1-l.webp` (462 Ko, même poids que la carte II). L'ancienne `assets/world.webp` n'est plus utilisée (gardée).
- **Marqueurs repositionnés** (`x`/`y` des 6 régions de la carte I, en % de l'image) : Prairie 38/74 (prés à côté du village), Bois 21/47 (grand arbre lumineux), Côte 76/55 (plage), Monts 50/20 (route de montagne), Château 77/19 (porte du château), Cavernes 24/26 (grotte de cristal). Niveaux, boss, portraits, étoiles, déblocages et progression inchangés (test).
- **Affichage** : paysage = carte entière 3:2 (aussi large que possible sans dépasser) ; **portrait** (téléphone, tablette, Honor déplié) = carte sur toute la hauteur, défilement latéral, centrée sur la région en cours : aucune déformation, aucune bande. Autour de la carte, fond = la carte elle-même floutée et assombrie (plus de grandes bandes bleues, carte II comprise).
- **Interface commune** (`zoneBtn` dans `ui.js`) : même marqueur sur les deux cartes (portrait du boss 52 px, numéro de région, nom sur cartouche bleu nuit et or, progression et étoiles) ; la carte II affiche maintenant les boss au lieu des numéros. Région verrouillée : message explicatif au toucher. Boutons **Carte I / Carte II côte à côte, en bas au centre** (44 px de haut minimum). Fiche de région en bas d'écran (fixe) même quand la carte défile.
- **Non testé dans un navigateur** (refusé dans cette session) : à vérifier par Max sur l'Honor (plié/déplié, portrait/paysage), iPhone et PC. Aucune mécanique ni équilibrage touchés.
- Tests : 170 OK (nouveau test `V4.87 carte I`).

## V4.86 (28/11) : Chronique — trophées, complétion, statistiques, bilan enrichi, bestiaire, collection (petits ajouts premium avant V5.0)
- **Module `src/chronicle.js`** (logique pure, testée sous Node) ; sauvegarde **additive** `save.cr` (`s` compteurs, `hu` combats par héros, `be` bestiaire, `co` collection, `tri` trios victorieux, `rec` records, `tr` trophées horodatés), nettoyée au chargement (valeurs invalides et ids inconnus retirés). Ancienne sauvegarde : seuls les trophées déductibles de l'état (régions, niveau, recrutements, quêtes, étoiles, objets possédés, forge, défi du jour) sont accordés ; compteurs à zéro, rien d'inventé.
- **40 trophées** (ids stables) : 15 bronze, 15 argent, 9 or, 1 platine « Gardien de l'Éther ». Progression (12 boss, niveaux 10/30/50), exploration (recrutements Orion/Nyra/Lyria, quêtes 5/20/40, défi du jour), maîtrise (3 ★ ×1/30/120, boss sans KO, dernier debout, victoire en 3 tours ou moins, 100 ennemis, trios 5/20), collection (bestiaire 10/30/complet, équipements 10/60/tous, Forge). Notification : ligne dorée dans le coffre de victoire ; hors combat (niveau, quête...), petit bandeau discret au retour au camp. Aucune dépendance de plateforme (adaptateur Steam plus tard).
- **Bilan de combat enrichi** (victoire et défaite, sans pause ni étape en plus) : tours, dégâts, soins, héros marquant (dégâts + soins pendant son tour), nouveaux records (dégâts en un combat, plus gros coup, ennemis vaincus, victoire la plus rapide ; pas de « record » au premier combat). Décompte dans `play()` (turns.js) via `tally`.
- **Écran Chronique** (5e bouton de la barre du camp) : onglets Trophées (compte par rang, date), Régions (complétion % = missions, étoiles, quêtes de la région, boss ; régions non découvertes masquées), Statistiques (temps de combat plafonné à 1 h par combat, victoires/défaites, boss, ennemis, dégâts, soins, quêtes, 3 ★, héros le plus engagé, trios, records), Bestiaire (52 fiches : 40 créatures + 12 boss ; silhouette et « ??? » avant la rencontre, puis portrait de la planche existante, région, capacités sans chiffres, nombre vaincu), Collection (120 équipements, découverts même revendus).
- **Pas fait / limites** : interface en français seulement (comme les autres menus) ; essai navigateur automatisé refusé dans cette session : **à vérifier sur l'Honor** (barre du bas à 5 boutons, grilles du bestiaire et de la collection, portrait et paysage). Aucune mécanique de combat ni équilibrage touchés.
- Tests : 169 OK (nouveau test `V4.86 Chronique`).

## V4.85 (28/11) : lot 5 de la feuille de route V5.0 — jeu nettement plus dur, réglé au simulateur sur des cibles chiffrées
- **Cibles** (taux de victoire du bot au premier essai ; un humain fait mieux) : boss R1–R3 *faible* 50–70 %, *mid* 80–95 %, *opti* 100 % ; R4–R8 25–45 / 60–75 / 85–100 % ; R9–R11 15–30 / 45–60 / 75–90 % ; Briseur (R12) 0–15 / 30–45 / 60–75 %. Missions non-boss : *mid* 75–90 % avec 35–55 % de PV restants, *faible* 45–65 %, *opti* ≈ 100 %. Compositions : pas plus de 25 points sous Kael/Fenn/Aelis.
- **Avant (V4.84)** : *faible* gagnait 8/8 la plupart des boss, *mid* 8/8 partout sauf le Briseur, missions non-boss 100 % avec 50 à 85 % de PV restants.
- **Changé** : `DIFF` (`data.js`, appliqué dans `monUnit`) : PV et dégâts de tous les monstres d'une région ×`DIFF.hp/dmg[zone]` = 1,35 / 1,7 / 1,85 / 1,7 / 1,6 / 1,6 / 1,45 / 1,45 / 1,75 / 1,45 / 1,35 / 1,12 (Prairie plafonnée : région d'apprentissage) ; boss ×`DIFF.boss[zone]` en plus = 1 / .7 / .66 / .7 / .78 / .8 / 1,45 / 1,17 / 1,1 / .91 / .78 / .93 (le Briseur garde ×4,6 / ×1,42 de la V4.84). Quêtes, défis et vagues suivent la région. **Nyra** 40 → 48 PV ; **Lyria** Marteau 11–15 → 13–17, Impact sacré 12–16 → 14–18 (valeurs provisoires depuis la V4.53).
- **Après, graines neuves jamais utilisées au réglage** : boss *mid* (36 graines) R1 100 %, R2 83, R3 81, R4 75, R5 69, R6 58–81, R7 61, R8 67, R9 47, R10 44, R11 42–56, R12 42 % (PV restants 16 à 48 %) ; *opti* (12) 100 % jusqu'à R6, 75–92 % ensuite, R12 75 % ; *faible* (12) R1 100, R2 50, R3 58, R4 17, R5 42, R6 42 %, **R7 à R11 0 %**, R12 8 %. Non-boss R2–R12 (33 missions × 3) : *mid* 90 % (41–58 % de PV), *faible* 67 %, *opti* 99 %.
- **Décision de Max (28/11, 01 h 18) : les murs restent.** Le joueur doit farmer un peu (quêtes secondaires, XP). Cibles *faible* de fin de campagne abandonnées. Constat d'origine : *faible* en fin de campagne (0 % au lieu de 15–45 %). Cause mesurée : un seul niveau de retard coûte 35 à 45 points (même sans retard d'objets : 1/8 à la Citadelle). En vraie partie, rejouer 1 à 3 missions pour regagner le niveau suffit : mur volontaire ou pas, à décider. R4 *faible* 17 % (cible 25–45). Composition Lyria/Nyra/Aelis (aucun tireur) 8 % contre 42 % pour la référence.
- **Compositions** (*mid*, R10 non-boss + boss R10 et R11, 24 combats) : Kael/Fenn/Aelis 42 %, sans Aelis (Kael/Fenn/Orion) 67 %, Kael/Nyra/Fenn 42 %, Lyria/Fenn/Aelis 29 %, Lyria/Nyra/Orion 25 %, Lyria/Nyra/Aelis 8 %.
- **Simulateur** (`tools/sim.mjs`) : profil **`faible`** (1 niveau de retard, objets de boutique avec 6 niveaux de retard mais au moins ceux du niveau 1, sans forge, points répartis ; `LAG=`/`UP=` pour les essais) ; spécialisations de Nyra et Lyria ; le bot ignore les sorts sans dégâts qu'il ne sait pas jouer (plantait avec Nyra) ; Nyra emporte ses sorts de dégâts ; `SEED0=` (graines neuves), `DZ=`, `BZ=`, `DH=`/`DD=` (essais de réglage). Outils de dichotomie `tools/tune.mjs` (monstres d'une région) et `tools/tune-boss.mjs` (boss). Sorties brutes non versionnées.
- **Limites** : le bot joue moins bien qu'un humain (pas de placement défensif, n'utilise ni Fumigène, ni Marque, ni Interception) ; bruit important (±15 points à 24 graines). Test de Max sur l'Honor indispensable. Essai navigateur automatisé refusé dans cette session : seuls les tests Node ont tourné.
- Tests : 168 OK (nouveau test `V4.85 lot 5`).

## V4.84 (28/11) : lot 5 de la feuille de route V5.0 — premier passage d'équilibrage (mesuré)
- **Mesures** (simulateur, graines 1 à 10, un boss par région ; budget respecté par étape) : profil `sous` (sans objet, −2 niveaux) 0/10 partout, `std` (4 objets de départ, périmé depuis les 120 objets) 9/10 aux Monts et aux Sables, **0/10 au Briseur**, `opti` 10/10 puis 9/10. Nouveau profil **`mid`** (`tools/sim.mjs`) : objets de boutique jusqu'au niveau du héros, forge rang 1 ; les profils existants restent inchangés (références comparables).
- **Courbe `mid` avant réglage** (victoires, PV restants) : Prairie 10/10 83 %, Côte 10/10 80 %, Château 10/10 65 %, Braise 10/10 77 %, Marais 10/10 75 %, Citadelle 10/10 71 %, Givre 10/10 66 %, **Briseur 9/10 38 %** : jeu facile pour ce bot partout, seul le boss final tenait la route.
- **Changé** : Briseur primordial PV ×4,2 → ×4,6 et dégâts ×1,35 → ×1,42 (essai ×5 / ×1,5 : trop dur, `mid` 4/10). **Après** : `mid` 6/10 (PV restants 26 %), `opti` 8/10 (40 %). Le bot joue moins bien qu'un humain : valeurs à confirmer par le test de Max sur téléphone.
- **Pas touché** : les 11 autres boss, les monstres ordinaires, les objets, les sorts. Prochaines mesures : milieu de campagne (missions non-boss), compositions, profil `sous` réaliste (le 0/10 est attendu mais sévère).
- Tests : 167 OK.

## V4.83 (28/11) : restes du lot 4 — bouton de langue et bruitages branchés
- **Réglages** : bouton « 🌐 Langue : Français / English » (`save.lang`, validé au chargement, valeur inconnue = français). Il change les récits du scénario et les voix (`setVoiceLang`, appelé aussi au chargement) ; **les menus et descriptions restent en français** (traduction exhaustive hors lot).
- **7 bruitages jamais déclenchés, maintenant branchés** : `ember_eruption`, `sands_trap`, `frost_crack` (un son par tour de zone dangereuse, événement `snd` dans `lavaTick` ; zones toxiques = `poison` existant), `aetherion_shift` (téléportation), `breaker_expose` (Défense brisée), `frost_shield_break` (le bouclier du Roi du Givre tombe, signalé par `shieldBroke` dans `beginTurn`), `talent_unlock` (choix d'une spécialisation). `combo_2/3` et `village_ambience` l'étaient déjà (nom dynamique).
- Test ajouté : chaque son déclaré est déclenché dans le code, chaque zone de sol joue son son. 167 tests OK. Pas d'essai navigateur ni d'écoute sur appareil réel.

## V4.80 (27/11 nuit) : lot 3 de la feuille de route V5.0 — scénario V2 intégré (texte seul)
- **Module `src/story.js`** : 44 répliques FR/EN (prologue, 12 fins de région, scène avant le boss de la région 12, 3 recrutements, épilogue + carte de fin), 4 variantes de repli (Orion absent aux régions 6, 7, 11, 12 ; Lyria absente à la région 10), tout selon `SCENARIO-V2-INTEGRATION-FR-EN.md`. L'Architecte s'appelle « Voix inconnue » avant la région 9.
- **Déclencheurs** : fin de région = première victoire sur le boss uniquement (`first && F.boss`, jamais en farm, quête, défi ni défaite), jouée 2,2 s après l'écran de victoire ; scène avant le boss de la région 12 au lancement du combat ; prologue, recrutements et épilogue à l'entrée du camp (`camp()`). Recrutement réel d'Orion/Lyria fusionné avec les fins des régions 6/10 (scène complète si la région est déjà finie, sinon repli Kael puis scène complète au recrutement).
- **Fenêtre de dialogue** : un toucher (ou Entrée/Espace) avance, « Passer ▶▶ » ferme tout en un geste, file d'attente (jamais deux fenêtres), textes en `textContent`, aucune pause obligatoire, aucun effet sur le combat, les récompenses, l'équipe ou l'inventaire.
- **Sauvegarde** : champ additif `save.storySeen` (ids validés au chargement, ids inconnus ignorés). Ancienne sauvegarde : tout ce qui est déjà derrière est marqué vu, aucune chaîne de scènes passées, la suite se joue normalement ; nouvelle partie / réinitialisation : prologue au premier camp.
- **Langue** : `save.lang === 'en'` affiche l'anglais ; **aucun bouton de langue dans les réglages pour l'instant** (traduction complète des menus et missions hors lot, comme prévu).
- **Pas de voix** (lot 4). Q37–Q40 : textes déjà écrits, non modifiés.
- Tests : 163 (logique de déclenchement, replis, fusions, anciennes sauvegardes, ids invalides). Fenêtre de dialogue testée avec jsdom (4 répliques, passer, anglais, carte de fin, file d'attente) ; **pas de test dans un vrai navigateur** (le lancement de Chrome automatisé a été refusé) : à vérifier sur l'Honor Magic V5, portrait et paysage.

## V4.79 (27/11 nuit) : lot 2 « gel RPG » de la feuille de route V5.0 — 120 équipements
- **Audit** : 60 sorts (10 par héros) et 90 talents (6 héros × 3 voies × 5 paliers) cohérents : aucun sort ou talent orphelin, aucune référence cassée. Trois entrées de `SP` ne sont attribuées à aucun héros (`trap`, `revive`, `potion`) : données historiques inoffensives, conservées. Trou réel : **Orion n'avait ni arme ni armure**, et Kael/Fenn/Aelis n'avaient plus rien entre les niveaux 20 et 45.
- **34 entrées** (`ITEMS` 86 → 120, ids `eq87` à `eq119` + `sg119`, aucune renumérotation) : Kael, Fenn et Aelis 8 chacun (paliers 25 marchand rare, 35 butin épique) ; Orion 9 dédiés (paliers 20 marchand, 30 butin, arme 40 butin « Sceptre de l'Éther ») ; signature d'Orion **Bâton du serment commun** (index 119, lv 38, dégâts +4), offerte par Q39 avec les trois autres (`sig:[81,82,83,84,119]`). Icônes de la planche `equip` réemployées, une seule stat par objet, valeurs pilotes jusqu'au lot 5.
- **Exclusifs** : `who` 0 à 3. La boucle de prêt V4.59 s'arrête maintenant à l'index 85 : les nouveaux objets ne sont jamais prêtés à Nyra ni Lyria.
- **Sauvegarde** : aucun changement de format ; les objets s'ajoutent à la fin. Une partie où Q39 est déjà faite ne reçoit pas rétroactivement le Bâton (la quête reste rejouable sans bonus).
- Tests : 162 (161 + `V5.0 lot 2`), anciens tests bornés aux 86 premiers objets.
- Reste du lot 2 : synergies chiffrées et valeurs définitives au lot 5 (équilibrage). Suite : lot 3, scénario V2.

## V4.78 (27/11 nuit) : Briseur primordial, fenêtre de vulnérabilité
- `BOSS_P.breaker` = [4, 0] : tous les 4 tours le Briseur s'agenouille (« Défense brisée ! +30 % », il ne bouge pas, `sunder` 30 % sur 2 tours, couvre le tour des héros). La phase à 50 % (Fracas, armure brisée équipe, 2 éclats) reste. Astuce `TIPS.breaker` mise à jour. 161 tests OK. Audit des 12 boss : `docs/studio/tactika/AUDIT-BOSS-V4.78.md` du dépôt studio.
- Reste pour le lot 1 de la feuille de route V5.0 : ancrages destructibles d'Aetherion, rupture tactique du bouclier du Roi du Givre, éventuelle 3e phase du Briseur.

## V4.77 (27/11 nuit) : récompenses de Q37 à Q40 vérifiées ; validation ChatGPT de la V4.76
- **Vérification réelle** : l'attribution des objets passe dans `grantQuest` (rules.js, sortie de l'écran de victoire). Essai navigateur bout en bout (victoire forcée par l'écran de résultat) : Q37 donne l'objet 79 ; Q39 donne 81 à 84 ; le stockage local contient les objets et `save.q` ; après rechargement, rien n'a changé ; rejouer Q37 ne redonne rien (`save.q` vaut 1, et `grantQuest` ignore les objets déjà possédés). Test Node pour Q37 à Q40 (aucun doublon, aller-retour JSON, rareté épique, Q36 = un seul objet de butin). 161 tests OK.
- **Validé par ChatGPT (V4.76)** : Q37 à Q40 et les 7 objets signature (obtention exclusive par les quêtes, aucune image maintenant), mécanique actuelle de la Reine des marécages.
- **À intégrer plus tard (améliorations décidées, non codées)** : ancrages destructibles d'Aetherion ; rupture tactique du bouclier du Roi du Givre (par placement) ; un objet signature réellement adapté à Orion (aujourd'hui l'Orbe du serment commun est partagé par les six) ; icônes signature originales ; célébration de Q40 rattachée à l'épilogue du nouveau scénario V2.
- Pas de campagne de simulations ni d'équilibrage pour l'instant.

## V4.76 (27/11 nuit) : mécaniques de boss non codées (valeurs provisoires, pas d'équilibrage)
- **Aetherion** (`astral`, `BOSS_P.astral` = [3, 0]) : **téléportation** à côté du héros le plus blessé tous les 3 tours (tous les 2 tours après sa phase à 50 %), annoncée par le compteur de cycle comme les autres boss ; effets sur la case de départ et d'arrivée, `stepOn` appliqué. Pas d'« ancrages » : le plan directeur ne les décrit pas, non codés.
- **Reine des marécages** (`swamp`) : sous 50 % PV, **zones toxiques** (3 cases vertes ☣ marquées un tour avant, renouvelées chaque tour) : un héros dessus est empoisonné (4 PV × 2 tours), pas de dégâts directs. Réutilise `s.lava` (mode `toxic`), donc l'IA et le rendu des braises.
- **Roi du Givre** (`frost`, `BOSS_P.frost` = [3, 0]) : **bouclier de glace** tous les 3 tours (réduit les dégâts reçus d'un tour, même mécanique que la Carapace du Crabe royal) ; sous 50 % PV, **fissures** (3 cases bleues ❄, mode `cold`) : −6 % PV et −1 PM pour un héros dessus. « À briser par placement » du plan directeur : non fait, le bouclier tombe seul au tour suivant.
- **Correctif** : survoler ou toucher un boss sans cycle (Reine, Aetherion, Roi du Givre, Briseur) plantait `info()` (`BOSS_P[o.bs]` absent) ; il affiche maintenant « phase sous 50 % PV » (`PHASE50`).
- Astuces de combat mises à jour (`TIPS.swamp`, `astral`, `frost`). 160 tests OK (nouveau test des trois mécaniques ; le test R11 remet `bt` à 0). Essai navigateur 844×390 des trois phases de boss sans erreur.

## V4.75 (27/11 nuit) : quêtes Q37 à Q40, objets signature (design proposé par Claude, à valider par Max/ChatGPT)
- **Objets signature** (7, indices 79 à 85 de `ITEMS`, `src:'quest'`, épiques, icônes réutilisées, aucun nouvel art) : ni boutique ni butin (`lootPool` et `shopStock` les excluent), uniquement en récompense. Q37 Lame de l'honneur (Kael, arme, dégâts +4) ; Q38 Sceptre de la voix claire (Aelis, arme, soin +3) ; Q39 Arc (Fenn), Lames (Nyra), Épée (Lyria) du serment commun (dégâts +4) et Orbe du serment commun (bijou, dégâts +3, partagé par les six : Orion n'a pas d'objet exclusif, règle de V4.5x) ; Q40 Médaille du village (accessoire, PV +8, les six).
- **Quêtes** : Q37 Honneur retrouvé (z 5, après le Château, élite chevalier sombre), Q38 Voix intérieure (z 9, après le Marais, élite spectre des marais), Q39 Six destins, un seul serment (z 10, après la Citadelle, Lyria recrutée, objectif chef, 4 objets d'un coup), Q40 Un village pour demain (z 11, après le Sanctuaire : nouveau champ `after`, objectif survie). Champ `sig` = objets garantis (affichés sur l'écran de victoire). Pas de palier de village codé : la quête Q40 est un combat de survie, la « célébration » reste à écrire.
- 159 tests OK (nouveau test V4.75 ; les comptages d'objets et de quêtes passent à 79 + 7 et 40). Essai navigateur 844×390 des quatre quêtes sans erreur ni 404.

## V4.74 (27/11 nuit) : quête Q36 « Dernière lumière » (région 12)
- `Q36` (z 11, niveau 47, objectif survie, objet garanti) : ouverte après les Terres du Givre (même règle que Q31 à Q35). Aucune règle nouvelle. 158 tests OK ; essai navigateur 844×390 sans erreur.
- **Reste** : Q37 Honneur retrouvé (signature Kael), Q38 Voix intérieure (signature Aelis), Q39 Six destins (signatures), Q40 Un village pour demain : elles demandent des objets « signature », des conditions d'arcs de compagnons et des paliers de village, donc de nouvelles règles et une spécification (ChatGPT/Max). Non commencées.

## V4.73 (27/11 nuit) : région 12, Sanctuaire de l'Éther (10 missions, boss Briseur primordial), images du dépôt studio
- **En jeu** : `R12` (carte II, niveaux 46 à 50, ouverte après les Terres du Givre), `THEMES[12]`, fonds `assets/bg/eter.webp` (portrait 1536×2752, image 1998 du studio) et `eter-l.webp` (paysage 2528×1696, image 1997), étoile Gemini effacée par `tools/prep_bg.py` (ils remplacent les anciens fonds 941×1672 et 1536×1024). Musique `castle` / `boss_map2`. Originaux sans perte dans `art/r12/` (`r12-*.webp`), découpe par `tools/prep_r12.py`.
- **Sols** : 8 sols du studio (image 2003) -> `assets/sol_eter.webp`. Le doublon R8 (`r12-sols-gemini-DOUBLON-sables.webp`) n'est plus utilisé. Les dalles 5 et 6 avaient une brume magenta : retirée par le script, bas du bloc reconstitué d'après la dalle 7 (inpainting, léger flou sur l'arête du bas).
- **Obstacles** : 9 objets (image 2004, pas de grille 4×2 : découpe par position) -> `assets/deco9.webp`, indices 68 à 76 (`DEC`, `DECO_W`, `LOW`) : mur en ruine, grille de bois, escalier, vasque, coin de mur, balustrade (bas : 68 à 73) ; obélisque sombre, obélisque clair, arche (hauts).
- **Monstres** (valeurs provisoires) : `etherbeast` Aberration d'Éther (flanc, 64 PV ; poses 0, 1, 3, 2, 4, 5), `etherknight` Chevalier de l'Éther (tank, 74 PV), `sanctguard` Gardien du Sanctuaire (tank, 96 PV, armure .3). Poses 0 à 5 telles quelles pour chevalier et gardien.
- **Briseur primordial** : planche `breaker` = repos A0, attaque A1, touché A2, spécial B2 (à genoux), KO A3, repos 2 B3 (A/B 2×2 : une seule pose de KO et pas de vraie pose « spécial »). `bs:'breaker'` (`bossTurn`) : sous 50 % PV, dégâts ×1,25, **armure brisée sur toute l'équipe** (+15 % de dégâts subis, 2 tours) et, par `summon`, 2 éclats d'éther fragiles (20 PV, planche `etherbeast`). Astuce au combat 10 (`TIPS.breaker`). Hache un peu différente entre A et B : non corrigé.
- **Pas fait** : quêtes Q36–Q40, mécaniques non codées (téléportation Aetherion, zones toxiques Reine, fissures Roi du Givre), équilibrage, polish. Contraste du chevalier noir sur le sol sombre : lisible à l'essai, à confirmer sur l'Honor.
- 158 tests OK (nouveau test R12 ; le test « carte II » attend maintenant 12 zones). Essai navigateur 844×390 et 390×844 (combats 1, 4, boss) sans erreur ni 404. Safari et Honor non testés.

## V4.72 (27/11 nuit) : fonds de la région 12 (Sanctuaire de l'Éther), reçus de Max
- `art/r12/` : originaux sans perte. Fonds en dépôt, **pas encore branchés** (R12 n'existe pas dans `ZONES`) : `assets/bg/eter.webp` (portrait 941×1672, arche brisée dans les nuages, bannières violettes) et `assets/bg/eter-l.webp` (paysage 1536×1024, même arche). Pas d'étoile Gemini à effacer. À ajouter à `BGZ` (render.js) avec l'id `eter` quand R12 sera créée.
- **Sols : planche reçue = doublon du Temple des sables (R8)** : mêmes 8 dalles désertiques/hiéroglyphes que `sol_sables`. Archivée sous `art/r12/r12-sols-gemini-DOUBLON-sables.webp`, non utilisée. Pour R12 : provisoirement `sol_celeste`, ou redemander de vrais sols éthérés.
- **Toujours attendu** : monstres R12 (3×2), Briseur primordial A et B (2×2), obstacles. Puis R12 (10 missions, boss), Q36–Q40.
- Rien de codé côté jeu (aucun test touché).

## V4.71 — Icônes nettes (liste Équipe du camp)
- `icon()` (render.js) : définition selon le ratio de pixels de l'écran (×2 à ×4) + réduction en deux temps avec lissage haute qualité ; taille CSS fixée. Avant : canvas 2× flou sur écran dense (Honor).
- Liste « Équipe » du panneau Commandement : portraits 46 px au lieu de 30. Profite aussi aux onglets héros et à la médaille.
- Reprise nouvelle fenêtre : R12 (Sanctuaire de l'Éther) + quêtes Q36–Q40 à la réception des images (monstres, Briseur primordial A/B, sols, obstacles, fonds portrait/paysage). Non codé : téléportation Aetherion, zones toxiques Reine, fissures Roi du Givre.

## V4.70 (27/11 nuit) : obstacles et fond paysage de la région 11 (Gemini) : R11 complète côté images
- 8 obstacles reçus (`art/r11/r11-obstacles-gemini.webp`, planche 3168 px, échelle .278 pour la même taille que R9/R10) -> `assets/deco8.webp`, obstacles 60 à 67 (`DEC`, `DECO_W`, `LOW` : rocher, tronc, éboulis, sarcophage, traîneau, muret bas ; pilier et monolithe hauts), `THEMES[11].obs`. Fond paysage : 2 versions reçues (`r11-givre-l-A`, `-B`), la B (centre le plus dégagé) est en jeu (`givre-l.webp`, étoile effacée) ; la A reste archivée. Le fond portrait (forêt et porte en ruine) ne montre pas le même lieu que le paysage (palais de glace) : à harmoniser si Max le souhaite.
- 157 tests OK ; essai navigateur 844×390 et 390×844 sans erreur ni 404.

## V4.69 (27/11 nuit) : sols de la région 11 (Gemini)
- 8 sols reçus de Max (`art/r11/r11-sols-gemini.webp`), découpe par `tools/prep_r11.py` -> `assets/sol_givre.webp` (même méthode que R9 et R10) ; `THEMES[11].ts = 'sol_givre'`. Reste provisoire pour R11 : obstacles (Monts gris) et fond paysage (recadrage du fond portrait).

## V4.68 (27/11 nuit) : région 11, Terres du Givre éternel (10 missions, boss Roi du Givre), quêtes Q31 à Q35
- **En jeu** : `R11` (carte II, niveaux 41 à 45, ouverte après la Citadelle), `THEMES[11]`, fond `assets/bg/givre.webp` (portrait, reçu de Max, étoile Gemini effacée) et `givre-l.webp`, musique `mountain` / `boss_map2`. Images reçues le 27/11 (ChatGPT) : loup polaire, yéti, élémentaire de givre (3×2), Roi du Givre A et B (2×2) ; originaux sans perte dans `art/r11/`, découpe par `tools/prep_r11.py`.
- **Provisoire, à remplacer à la réception de Gemini** : sols et obstacles = ceux des Monts gris (`sol_mont`, obstacles 20, 21, 4, 3, 19) ; fond paysage `givre-l.webp` = recadrage 3:2 du fond portrait (bande à 30 % de la hauteur).
- **Monstres** (valeurs provisoires) : `polarwolf` (flanc, 56 PV), `yeti` (tank, 82 PV), `frostel` (tank, ralentit, 66 PV), `frostclone` Éclat de givre (clone fragile 18 PV, planche `frostking`). Poses 0 à 5 telles quelles.
- **Roi du Givre** : planche `frostking` = repos A0, attaque A1, touché A2, spécial B2 (armure fissurée), KO A3, repos 2 B0. `bs:'frost'` : sous 50 % PV, dégâts ×1,2, équipe gelée (−1 PM au tour suivant) et 2 éclats de givre (`summon`). Astuce au combat 10 (`TIPS.frost`). **Pas codé** : fissures et bouclier à briser par placement du plan directeur.
- **Quêtes** : Q31 Expédition perdue (survie), Q32 Feu sous la glace, Q33 Dernier gardien (élite élémentaire de givre, exige Lyria), Q34 Reflets du passé (élite chevalier sombre), Q35 Fragments perdus (survie). Q36–Q40 : région 12 et village.
- 157 tests OK ; essai navigateur 844×390 et 390×844 (combat 4, boss, quête Q33) sans erreur ni 404. Safari et Honor non testés. Pas d'équilibrage ni de polish.
- **Reste** : R12 (Sanctuaire de l'Éther) tout, sols/obstacles/fond paysage de R11, Q36–Q40.

## V4.67 (27/11 nuit) : région 10, Citadelle céleste (10 missions, boss Aetherion), quêtes Q28 à Q30
- **En jeu** : `R10` (carte II, niveaux 36 à 40, ouverte après le Marais), `THEMES[10]` (`sol_celeste`, obstacles 52–59 = `deco7`, `DECO_W`, `DEC`, `LOW` : balustrade, éboulis, colonne couchée, aile de pierre bas), fonds `assets/bg/citadelle.webp` (portrait, original du dépôt studio) et `citadelle-l.webp` (paysage, reçu de Max), `prep_bg.py` (étoile Gemini effacée), musique `castle` / `boss_map2`. Images reçues de Max le 27/11 : gardien céleste, griffon royal, sentinelle astrale (ChatGPT, 3×2), Aetherion A et B (2×2), 8 sols et 8 obstacles (Gemini) ; originaux sans perte dans `art/r10/`, découpe par `tools/prep_r10.py` (même méthode que `prep_r9.py`).
- **Monstres** (valeurs provisoires) : `cguard` Gardien céleste (tank, 70 PV), `griffin` Griffon royal (flanc, vole, 48 PV), `astral` Sentinelle astrale (portée 1–4, 42 PV), `astralclone` Double astral (clone fragile 16 PV, planche `aetherion`). Ordre des poses : gardien et sentinelle 0–5 tel quel, griffon 0, 1, 3, 2, 4, 5.
- **Aetherion** : planche `aetherion` = repos A0, attaque A1, touché A2, spécial B0 (ailes refermées), KO A3, repos 2 B3. `bs:'astral'` (`bossTurn`) : sous 50 % PV, dégâts ×1,2, +1 PM et, par `summon`, 2 doubles astraux. Astuce au combat 10 (`TIPS.astral`). **Pas codé** : téléportation annoncée et ancrages du plan directeur.
- **Quêtes** : Q28 Ailes brisées (survie), Q29 Messager céleste (chef), Q30 Archives astrales (élite sentinelle, exige Lyria recrutée). Q31–Q40 : régions 11 et 12 (images à recevoir).
- 156 tests OK ; essai navigateur 844×390 et 390×844 (combat 4, boss, quête Q30) sans erreur ni 404. Safari et Honor non testés. Pas d'équilibrage ni de polish.

## V4.66 (27/11 nuit) : région 9 terminée côté images (ent, spectre, Reine des marécages)
- **Images reçues de Max le 27/11** (ChatGPT) : ent corrompu et spectre des marais (3×2), Reine A et B (2×2 chacune). Originaux sans perte dans `art/r9/` (`r9-ent-corrompu`, `r9-spectre-marais`, `r9-reine-A`, `r9-reine-B`), découpe par `tools/prep_r9.py` (même script, section ajoutée). Ordre du jeu [repos, attaque, touché, spécial, KO, repos 2] : ent et spectre = poses 0, 1, 3, 2, 4, 5.
- **Reine** : les deux planches n'ont pas de pose KO peinte ; planche `queen` = repos A0, attaque A1, touché B0 (accroupie), spécial A3, KO B0 (accroupie, provisoire), repos 2 B3, même échelle. Pas de planche de marche (glisse). `toadK` supprimé (atlas et fichier).
- **Code** : `MON.ent` (tank, 64 PV), `MON.wraith` (portée 1–3, vole, 30 PV), `MON.queenling` (clone fragile 14 PV, poison 2 × 2, planche `queen`) ; valeurs provisoires. `R9.pool` = crapaud, ent, spectre ; le Fantôme n'est plus utilisé en R9 ; combats 1 à 10 recomposés avec l'ent. Boss `bs:'swamp'` (`bossTurn`) : sous 50 % PV, dégâts ×1,2, **Spores toxiques** (toute l'équipe empoisonnée 4 × 2) et, par `summon`, **2 clones fragiles**. Astuce affichée au combat 10 (`TIPS.swamp`).
- **Pas fait** : zones toxiques au sol (les « zones toxiques » du brief) et planche de KO de la Reine ; pas d'équilibrage ni de polish (consigne de Max).
- 155 tests OK ; essai navigateur 844×390 et 390×844 (combat 2 avec ent et spectre, combat 10 avec la Reine) sans erreur ni 404. Safari et Honor non testés.
- **Reste** : R10 (trois monstres, Aetherion A/B, obstacles), R11, R12 et Q28–Q40, à la réception des images.

## V4.65 (27/11 soir) : région 9, Marais des âmes (partielle), quêtes Q25 à Q27
- **En jeu** : `R9` (carte II, 10 missions, niveaux 31 à 35, ouverte après le Pharaon), thème `THEMES[9]` (`sol_marais`, obstacles 44–51 = `deco6`, `DECO_W`, `LOW`), fond `assets/bg/marais.webp` (portrait, proportions d'origine 2:3, ajusté en « cover ») et `marais-l.webp`, musique `darkwood` / `boss_map2`. Images reçues de Max le 27/11 : crapaud venimeux (ChatGPT), 8 sols et 8 obstacles (Gemini), originaux sans perte dans `art/r9/`, découpe par `tools/prep_r9.py` (même méthode que `prep_r8.py`, étoile Gemini effacée).
- **Monstres** : Crapaud venimeux (`toad`, poison 4×2, ralentit, valeurs provisoires). **Provisoire, à remplacer à la réception des planches** : spectre des marais = Fantôme existant (`ghost`) ; boss « Reine des marécages » = crapaud agrandi (`toadK`, mêmes poses, pas de mécanique propre) ; ent corrompu non codé. Quand les planches Reine A/B arrivent : nouvelle planche boss, changer `R9.boss.s`, ajouter les phases voulues.
- **Quêtes** : Q25 Âmes errantes, Q26 Remède oublié, Q27 Cœur de la forêt (élite champignon) ; Q28–Q40 : régions 10 à 12 (images à recevoir : R10 trois monstres, Aetherion A/B, obstacles ; R11, R12 tout).
- 154 tests OK ; essai navigateur 844×390 et 390×844 (mission, quête, boss) sans erreur. Safari et Honor non testés.

## V4.64 (27/11 soir) : équipement de Nyra et Lyria, quêtes Q19 à Q24
- **Équipement** : `ITEMS` passe de 63 à 79 (eq64–eq79, `TABLE-EQUIPEMENTS-NYRA-LYRIA.md`, ChatGPT). Exclusifs (`who` 4 = Nyra, 5 = Lyria), 2 par emplacement et par héroïne, icônes de la planche `equip` réemployées, paliers 30/35 et 40/45 (palier 1 au marchand, palier 2 au butin), valeurs pilotes de la table. Boucle V4.59 inchangée (le prêt d'objets de Kael/Fenn continue). Le soin des deux colliers/reliques de Lyria s'applique à ses sorts de soin (`heal` → `healB`), jamais à l'absorption. Rien avant le niveau 30 au marchand ni au butin.
- **Quêtes** : Q19–Q21 (Forteresse de braise), Q22–Q24 (Temple des sables) dans `quests.js`. `questFight` reprend maintenant les cases brûlantes / dalles piégées de la région (`Z.fights[3].lava`). Objectifs existants seulement (victoire, survie, élite). Q25–Q40 : régions 9 à 12 absentes de `ZONES` (images à recevoir).
- **Régions 7 et 8** : déjà jouables depuis la campagne (V4.40, V4.42). Régions 9 à 12 et leurs boss : pas de code ni d'images dans le dépôt, rien recréé.
- Mesuré : les quêtes à élite ou à objectif « victoire » alignent 8 ennemis (Q11 à Q24, même règle depuis V4.55), les quêtes de survie 3 + vagues. Rien d'anormal ; à régler dans l'équilibrage global avec les prix des 16 objets.
- Vérifié en navigateur : marchand au niveau 41 (Cuir des ombres de Nyra, icône et prix corrects).
- 153 tests OK, essai navigateur 844×390 (Taverne : 6 nouvelles quêtes visibles, Q24 lancée, dalles piégées actives, aucune erreur).

## V4.63 (27/11 soir) : haut du combat façon maquette Royal Arcane (HUD V2 seulement, `?hud=v1` inchangé)
- `ui.js` (bloc `if(HUD2)`) : logo `#hlogo` (`assets/logo.webp`), flèches `#tlp` / `#tln` qui font défiler la frise `#tl` (cachées si tout tient, grisées aux bouts), boutons ♪ (`.son-m`, coupe la musique) et 🔊 (`.son-s`, coupe les bruitages) en SVG, `#hson` devient ⚙ Réglages (ouvre le panneau des volumes `#hvol`). `style.css`, fin de fichier : titre encadré or, tailles par format (portrait, paysage < 450 px, > 600 px).
- Vérifié en Chromium 390×844, 844×390, 1024×768, 1440×900 : aucune erreur, flèches, coupure de la musique et panneau testés ; 150 tests OK. WebKit/Safari et Honor non testés (portrait : vérifier que logo et titre ne se serrent pas).
- Ne touche ni mécanique, ni sauvegarde, ni équilibrage. Quêtes Q19–Q40 : bloquées tant que les régions 7 à 12 ne sont pas dans `ZONES` (carte II) ; portrait peint UI-07 : facultatif, commandes déjà écrites côté Game-studio-ai.

## V4.39 (27/11) : maîtrise des sorts d'Orion (aperçu)
- `src/mastery.js` : table `MASTERY` par sort (`[type, rang II, rang III]`), réutilisable pour les 6 héros ; seul Orion a des lignes. Spec : `docs/studio/tactika/mecaniques/V4.39-maitrise.md` (studio).
- 1 point tous les 2 niveaux (24 au niveau 50), rang II = 2 points, rang III = 3 de plus. Bonus par rapport au rang I, sans cumul entre rangs. Coûts en PA, recharges et zones inchangés.
- Cumul avec les talents **additif** sur la base du rang I (Givre mordant + rang III = +20 %, Mur 40 % → 60 % avec Glace épaisse). Appliqué une seule fois, dans `mkUnits`. Brûlure jamais touchée ; armure, bouclier et insensibilité au feu restent appliqués après.
- Sorts pas encore appris : pas de point. Remise à zéro gratuite à l'Académie. Sauvegarde : champ facultatif `save.ms` nettoyé par `cleanMast` (idempotent).
- Simulateur : le bot lance désormais le sort du héros (`u.S`, talents et maîtrise compris) au lieu du sort de base ; réglages `LVL=`, `ORSPEC=`, `MAST=non|deg|ctrl`. Les mesures antérieures ne comptaient pas les talents de sorts.

## V4.38 (27/11) : talents d'Orion (aperçu)
- 3 voies à 5 paliers (niveaux 3, 7, 11, 25, 40), valeurs pilotes de ChatGPT, non validées : Pyromancien, Cryomancien, Arcaniste. Choix à l'Académie, une seule voie. Les 3 autres héros gardent 3 paliers.
- Lectures à confirmer : « bonus feu +10 % plafonné » = +10 % fixe sur les dégâts directs de Flamme et Boule de feu (pas la brûlure). « Givre −2 PM, plancher 1 » : boss à −1 ; un −1 reçu ensuite ne réduit pas le gel.
- Paliers sans effet tant que le sort n'est pas appris (Glyphe au niveau 35 pour le palier 25, Tempête au 45 pour le palier 40) : l'Académie le dit.
- Technique : champ de sort `k` (bonus de dégâts), `sp.slow` peut valoir 2, `cleanSp` suit le nombre de héros (3 en jeu normal).
- Pas d'équilibrage mesuré.

## V4.37 (27/11) : les 10 sorts d'Orion et ses 6 sorts emportés (aperçu)
- Sorts connus par niveau (`ORION.learn`) : 3 au départ, puis 5, 10, 15, 20, 25, 35, 45. 6 emportés au plus (`save.load`, choix sur la fiche : « Emporter » puis « Remplacer »). `?apercu=braise&tous` ouvre les 10 pour essayer.
- Mur de glace : case `ice` bloquante (passage et vue), PV = 40 % des PV max d'Orion (**choix à confirmer**), disparaît au début du 2ᵉ tour de table suivant. Un monstre qui ne peut atteindre aucun héros frappe le mur collé à lui. Les renforts n'apparaissent pas dedans.
- Téléportation (ligne de vue exigée, passe par-dessus les décors bas), Affaiblissement (−20 %, aussi sur Séisme et Rayon), Explosion (impossible sans ennemi collé), Glyphe (partage l'emplacement des pièges, disparaît si Orion tombe), Tempête (rayon 2, 1 fois par combat).
- Corrigé : les sorts à distance d'Orion lançaient une flèche (boule de couleur) ; en portrait, 5 boutons ou plus chevauchaient « Fin du tour » (aussi pour les autres héros avec talent + potion) : deux rangées, hauteur réservée pour ne pas masquer le plateau.
- Simulateur : le bot ne joue ni Mur, ni Saut, ni Glyphe ; Explosion, Affaiblissement et Tempête ne sont pas mesurés (niveaux 21 à 25 avec les 6 sorts par défaut). 80 combats de non-régression : chiffres de la V4.35 retrouvés à l'identique après rétablissement de l'ordre des cases des zones.

## V4.36 (27/11) : voix des héros
21 répliques courtes en français (Kael, Fenn, Aelis), dossier `assets/audio/voix/`, détail dans `assets/audio/SONS.md`. `voice()` dans `src/audio.js` (jamais deux voix à la fois, délais anti-répétition, musique baissée), champ `vx` des sorts dans `src/data.js`, curseur « Volume voix ». Pas encore écouté ni essayé sur téléphone. Orion n'a pas de voix.

## V4.35 (27/11) : Orion et équipe de 3 parmi 4 (aperçu seulement)
- `?apercu=braise` : fiche des héros → Orion → « Le faire entrer à la place de… ». Choix gardé dans `save.team` (absent ou abîmé = Kael, Fenn, Aelis). Le village montre l'équipe choisie.
- Orion ajouté par `addOrion()` en aperçu, par les tests et par le simulateur (`TEAM=0,3,2`). Jeu normal : 3 héros, aucun fichier d'Orion chargé.
- 4 sorts (valeurs ChatGPT, non validées) : Projectile arcanique, Flamme (brûlure 3 × 2, sans cumul, sans effet sur les insensibles au feu), Givre (−1 PM), Boule de feu au niveau 5 (60 % autour, alliés épargnés, aperçu exact). Image : `tools/prep_heros.py`. Pose fixe qui glisse. Sons réutilisés.
- Matériel : l'équipe est servie avant la réserve. Orion ne porte que les objets communs à tous.
- Pas encore : ses 6 autres sorts, talents, maîtrise, écran de recrutement, Nyra, Lyria.
- Simulateur (profil std, braise 5/9/10, 8 graines, + 24 combats d'un premier essai braise 1 : 96 au total) : avec Fenn 24/24 (PV 72/41/56 %), Orion à la place de Fenn 23/24 (74/47/66 %), Orion à la place d'Aelis 23/24 (53/37/49 %). Aucune valeur changée.

## V4.34 (27/11) : niveaux des nouveaux sons
D'après les mesures des fichiers publiés : ambiance du village, étoiles et quête remontées ; `map2`, `ember`, `boss_map2` baissées au niveau des autres musiques. Non écouté.

## V4.33 (27/11) : audio, premier lot de la carte II
Musiques `map2` (carte II), `ember` et `boss_map2` (aperçu Braise, à la place des sons provisoires). Bruitages `boss_phase`, `boss_death`, `quest_complete`, `star_earned` ; ambiance `village_ambience` en boucle au village (volume des bruitages). Les musiques des six premières régions ne bougent pas.

## V4.32 (27/11) : vraies images de la région 7 et héros vétérans (aperçu seulement)
- `?apercu=braise` : élémentaire, chevalier d'obsidienne, salamandre, Ignaros (`tools/prep_r7.py`), 8 dalles (`sol_braise` : `TILE_N=8 TILE_W=512 python3 tools/cut_tiles.py r7-09-dalles-gemini-1822.png sol_braise`) et 6 obstacles (`deco4`, 30 à 35 ; charbon et chariot bas). Originaux : studio, `art/tactika/r7-planches/`. Le recolorage provisoire (`PH`) est supprimé.
- Héros vétérans (`tools/prep_heros.py`) : en aperçu dès le niveau 25 (`VET_LVL`), ou tout de suite avec `&veterans`. Pas de marche : pose fixe qui glisse avec le rebond existant.
- Monstres sans planche de marche : ils glissent aussi. Toujours provisoires : musique et sons. Valeurs non validées.

## V4.31 (27/11) : volume réglable, musiques d'origine rétablies
- Réglages : curseurs Musique et Bruitages (0 à 150 %, `landeVol`), niveau à 100 % plus fort qu'avant (musique 0,45 → 0,9, bruitages 0,8 → 1), limiteur en sortie.
- Demande de Max, garder toutes les musiques à leur place : village = thème d'origine ; la nouvelle `village` va à la Taverne ; ancienne `boss` pour Prairie, Bois et Côte, `boss_v2` pour Monts, Château et aperçu Braise.

## Mesures du 27/11 (aucune valeur de jeu changée)
- `sim.mjs` : profil `soin` (tout le catalogue, forge 2, Aelis en Intelligence), `NO_MHEAL=1`, compte des soins lancés.
- 8 graines. Château 10 et Braise 10 : profil `sous` (niveau −2, sans objet ni talent) 0/8 ; `std` 8/8, 55-56 % de PV ; `opti` 8/8, 78-79 %. Survies Château 8 et Braise 8 gagnées par tous.
- Soin collectif : le robot le lance 4 fois contre 73 Soins (24 combats `std`). La mesure ne permet **pas** de juger son cumul.
- Attention : sans `PROF=`, `pilote` joue 5 profils (8 graines × 1 mission = 40 combats).


## V4.30 (27/11) : camp sur écran presque carré (pliant ouvert, tablette)
- Le village horizontal s'affiche dès que la zone à gauche du menu atteint 0,8 fois sa hauteur (avant : 1,2). Cadre utile resserré (860 → 810), plaque Académie décalée.
- Menu de droite plus étroit sous le rapport 7/5 (`--dock`), « Partir à l'aventure » sur une ligne. Écrans larges et téléphone droit inchangés. Signalé par Max sur Magic V5 déplié ; testé au navigateur seulement.

## V4.29 (27/11) : Forteresse de braise, aperçu caché
- Adresse : `?apercu=braise`. Sans elle, rien ne change (`ZONES` : 6 régions). Sauvegarde séparée `landeTactique1_braise`, copiée de la vraie ; la vraie n'est pas écrite (import compris). Carte I considérée terminée, niveau 21 au moins.
- 10 missions (niveaux 21 à 25), `R7` dans data.js. Cases brûlantes (`lavaMark`, `lavaTick`) : marquées un tour à l'avance (▲), 12 % des PV max, Rempart réduit, armure ignorée, un tour sur deux ou chaque tour (missions 6 et 9). Salamandre, élémentaire et Ignaros insensibles ; chevalier d'obsidienne vulnérable (poussée). L'IA évite les cases marquées. Ignaros : surchauffe sous 50 % PV (+20 % dégâts, 2 cases de plus, chaque tour). « Braises à éteindre » du plan : non codé.
- Valeurs **proposées**, à valider. Simulateur, profil standard, 5 graines, 50 combats : 50 victoires ; PV restants de 83 % (mission 1) à 45 % (mission 9), 61 % au boss. Le robot ne joue pas la poussée dans les braises.
- Provisoire : monstres recolorés (`PH`), sols et obstacles du Château, musique des Cavernes, sons existants. Fonds : vraies images R7.

## V4.28 (27/11) : icônes de sorts
- `assets/spells5.webp` (`tools/prep_sorts.py`) : Charge, Tir perforant, Soin collectif (planches RPG-08/09/10 de Max), Piège et Renaissance (pictogrammes). Ressemblance des héros contrôlée à l'œil.

## V4.27 (27/11) : carte II sur écran horizontal
- `assets/world2-l.webp` (image 1800 de Max, 1536×1024), utilisée quand l'écran est horizontal ; repères `lx`,`ly`. La carte I reste verticale partout.

## V4.26 (27/11) : image de la carte II (C2-01)
- `assets/world2.webp` (1024×1536, taille reçue), chargée seulement à l'ouverture de la carte II. Repères recalés (`MAP2`), tracé provisoire retiré.

## V4.25 (27/11) : lot 10, première partie : sélecteur Carte I / Carte II
- Boutons en bas à gauche de l'écran Carte. Carte II verrouillée jusqu'au Titan prismatique (`map2Open`), avec message d'explication.
- Carte II : 6 régions « Bientôt » (`MAP2`, `DOCK` dans data.js), hors de `ZONES` : aucune mission, sauvegarde inchangée.
- Fond provisoire dessiné en CSS. À réception de C2-01 : ajouter `assets/world2.webp` en fond de `#mapbox.m2` et recaler les coordonnées.
- 109 tests ; navigateur automatique en 390×844, 375×667, 905×980, 1280×800, 844×390 (Titan battu ou non). Non vérifié sur vrai téléphone.

## V4.24 (27/11) : lot 9, premier passage d'équilibrage de la carte I
- Un ennemi de plus (aucun PV changé) : Prairie 5 (sanglier), Prairie 10 (gelée toxique), Côte 5 et Côte 10 (crabe).
- 75 combats simulés (chef, survie, boss des 6 mondes). Standard : Côte 5 89 → 84 % de PV restants, Prairie 5 94 → 91 %, Prairie 10 85 → 82 %. La Prairie reste facile. Réglage fin après les tests de Max.

## V4.23 (27/11) : lot 8, finitions des Cavernes
- Courbe : étape 1 = 3 golems (au lieu de 4), étape 2 = 2 golems + 2 chevaliers (au lieu de 3 + 2). Elles étaient plus dures que les étapes 3 à 6. Profil standard : PV restants 36 % → 70 % et 18 % → 67 %.
- Carte d'explication du rayon du Titan à l'étape 10.
- Simulateur : accepte « monde.étape » (ex. `5.0`, dès 0). 49 combats pour ce lot.

## V4.22 (27/11) : 41 équipements (63 objets au total)
- eq23 à eq63 selon la table du studio (`TABLE-EQUIPEMENTS-42.md`), lancés sur demande de Max sans attendre l'arbitrage ChatGPT : les 5 points restent aux valeurs proposées (réglables ensuite). Bouclier de bois (armures case 4) écarté.
- Planche `equip` : 53 icônes à 160 px, 9 colonnes ; étoiles Gemini et restes de gant / ceinture effacés (`tools/prep_equip.py`).
- Correctif : la fiche d'un objet partagé n'est plus écrasée par ses boutons.
- Simulateur : 45 combats (Château 5, 8, 10 ; profils anc, cat, opti) : 45 victoires ; catalogue contre 10 anciens objets : +3 à +7 points de PV restants. Les épiques (niveau 16 à 19) ne sont pas dans les profils anc et cat (niveau 14-15).

## V4.21 (27/11) : musique du Bois sombre
Nouvelle musique de 90 s `darkwood` pour les combats ordinaires du Bois (la Prairie garde `forest`).

## V4.20 (27/11) : musiques du village et des boss
Nouvelles musiques de 90 s `village` et `boss_v2` (boss des zones 1 à 5 ; le Titan garde la sienne). Le thème titre reste à l'ouverture du jeu. Les musiques sont publiées sans recompression et chargées une par une, à la demande.

## V4.19 (27/11) : fonds des Cavernes
G-14 (paysage) et G-15 (portrait) de Gemini, étoile effacée (`tools/unstar.py`, qui garde le dessin sous l’étoile), taille d'origine. Fin du fond provisoire des Monts teinté en violet.

## V4.18 (27/11) : images des Cavernes
Araignée, chauve-souris et Titan définitifs (6 poses + 4 images de marche ou de vol, planche `titan` à part du golem), 6 obstacles ternes (`deco3`, bas : éboulis, chariot, champignons), 7 sols C6-10 v3 (`tiles5` ; la dalle humide est écartée, elle ressemble à de l'eau). Découpe : `tools/prep_cave.py`. Aucune règle de combat changée, hormis les décors bas ci-dessus.

## V4.17 (27/11/2026) : Château en ruine à 10 étapes (lot 7)
- Niveaux 13,13,13,14,14,14,14,15,15,15 ; étape 5 = Chevalier rouge en chef, étape 8 = survie (élite de renfort : Chevalier sombre), étape 10 = Chevalier noir (conseil : Fureur).
- La liste détaillée du monde 5 n'était pas dans le dépôt : formations composées par Claude d'après le plan directeur, à relire par ChatGPT.
- `migrateChateau` (drapeau `h10`). Carte 1 : 60 niveaux sur 60.

## V4.16 (27/11/2026) : Monts gris à 10 étapes (lot 6, liste ChatGPT)
- Niveaux 10,10,10,11,11,11,11,12,12,12 : golems, golems et loups, chevalier bleu, obstacles rocheux, chevalier rouge (chef), formation lourde, rapides soutenant les tanks, **survie** (8e, élite de renfort = chevalier rouge), épreuve de placement, Golem ancien (conseil : Séisme annoncé, évitable à 4 cases ou plus).
- `migrateMonts` (drapeau `m10`). 106 tests. Simulateur : 75 combats ; boss : sous-équipé 0/5 (comme avant), standard 5/5 (40 % PV restants).

## V4.15 (27/11/2026) : Côte dorée à 10 étapes (lot 5, liste ChatGPT)
- Niveaux 7,7,7,8,8,8,8,9,9,9 : introduction à l'armure (conseil Tir perforant), crabes et mouettes, obstacles, mouettes rapides, chevalier bleu (chef), formation de crabes, mixte, **survie à renforts** (8e, élite de renfort = Chevalier bleu ; pas de protection de zone), garde du Crabe royal, Crabe royal.
- `migrateCote` (drapeau `c10`). Test « zones inchangées » déplacé sur les Monts.
- 105 tests. Simulateur : 75 combats (c5, survie 8, boss) : 15/15 victoires aux 3 profils ; sous-équipé : survie 8 PV restants 51 %.

## V4.14 (27/11/2026) : Bois sombre à 10 étapes (lot 4, liste ChatGPT)
- Niveaux 4,4,4,5,5,5,5,6,6,6 : chauves-souris, loups en meute, champignons (conseil), attaques aériennes, chef de meute, mixte, formation (champignons derrière les loups), survie à renforts (8e), épreuve combinée, Loup alpha (+ loup, champignon, chauve-souris).
- `migrateBois` (même règle que la Prairie, drapeau `b10`) : Bois terminé → 10/10, étoiles du boss à l'étape 10.
- Pas de variantes (loup frénétique, champignon toxique) : à décider après test.
- 104 tests. Simulateur : 75 combats (b5, survie 8, boss ; 5 profils) : std 15/15, sous-équipé 11/15.

## V4.13 (27/11/2026) : Prairie plus variée, gelée toxique
- `MON.toxslime` « Gelée toxique » : planche de la gelée recolorée en violet au chargement (`slimeT`, `tint` dans render.js), crâne ☠ au-dessus de sa barre, 24 PV, 3-5 dégâts, poison 2 × 2 tours. Dans `pool` de la Prairie.
- Étapes 1 à 4 inchangées. Étapes 5 à 10 : une ou deux gelées toxiques (chef 5, 6, 7, survie 8, 9, boss 10), conseils affichés une fois (étape 5 : gelée toxique ; étape 10 : Roi Gelée et ses 2 gelées).
- Aucun PV augmenté. 102 tests. Simulateur pilote : 90 combats au total (dont 60 avec des héros trop forts, non représentatifs) ; au niveau de la mission, seule la survie 8 change (PV restants 84 → 74 %).
- `tools/sim.mjs` : missions p5, p8, p10 et niveau des héros = niveau du combat quand il est fixé.

## V4.12 (27/11/2026) : 12 nouveaux équipements (lot 3, table ChatGPT eq11-eq22)
- 22 objets (10 historiques inchangés, index 10-21 = eq11-eq22). Champs : `id`, `s:'equip'` (planche assets/equip.webp, `tools/prep_equip.py`), `lv` requis, `rr` rareté fixe, `src` shop|loot, `who` liste si partagé.
- `gearAll` : choix du joueur puis meilleur objet libre, héros 0→2 : un seul porteur, jamais de doublon. `equip(save,j,i)` transfère, `holder`, `compare(save,j,i)`.
- Revente des nouveaux : 50 % du prix final + 50 % de la forge (pas de ×rareté). Marchand sans objets « loot » ni au-dessus du niveau ; butin (`lootPool`) sans « shop ».
- 101 tests. Simulateur : 60 combats (anc/cat 30, opti avant/après 30) : gain modéré.

## V4.11 (27/11/2026) : trois sorts du niveau 5 (lot 2, spec ChatGPT)
- `HER[].sp5` ouvert à `SP5_LVL`=5 (heroStats donne `lvl`, mkUnits l'ajoute). Kael **Charge** (4 PA, recharge 2, portée 2-3, 8-11) : `chargeDest` = case libre voisine la plus proche en ≤ 2 pas, sans traverser obstacle, eau ni unité ; aucun PM ; jamais d'avance automatique (`approach` renvoie null) ; aperçu du trajet ; amplificateur pris sur la case de départ.
- Fenn **Tir perforant** (4 PA, recharge 2, portée 2-6, 11-14, `pierce:1` = 100 % de l'armure ignorée, une cible, en cloche comme Tir). Distinct du talent Flèche perforante (Tir, 50 %).
- Aelis **Soin collectif** (5 PA, recharge 3, portée 0-3, 7-9 à la cible et aux alliés collés, `splash`) : pas de résurrection, Aura sans effet (elle ne touche que les dégâts). Talent « Lumière bienfaitrice », cristal et équipement de soin s'appliquent.
- 95 tests. Simulateur pilote (loup, monts3, golem, 5 graines, 45 + 45 combats) : léger gain, rien d'excessif.

## V4.10 (27/11/2026) : village vivant (lot 1 de la direction ChatGPT)
- Chat, chien, 2 poules, mésange (posée et en vol), fermier, villageoise, fontaine, banc, bannière, charrette, lanterne, trophée (après une région terminée). `PLACES` dans home.js, images par `tools/prep_vie.py`.
- Poses immobiles et petits gestes (CSS) ; pas de marche. Affichage seul, aucune règle ni récompense.
- Lumière jour / soir / nuit selon l'heure, réglable (`save.sky`, `skyOf`). La peinture d'origine sert de soir.
- Non placés : enclume, étal, mannequin (déjà peints). Pas encore d'ambiance sonore.
- 90 tests ; navigateur automatique 375×667, 430×860, 905×980, 1280×800.

## V4.9 (27/11/2026) : Prairie à 10 étapes (pilote)
- `ZONES[0].fights` : 9 combats + Roi Gelée, niveaux 1 à 3, gelées et sangliers ; étape 5 « abattre le chef », étape 8 survie (5 tours, `waves`).
- Sauvegarde : `migratePrairie` (une fois, `save.p10`). Boss déjà battu = 10/10, ses étoiles passent à l'étape 10, les nouvelles étapes restent rejouables ; sinon étapes gagnées gardées.
- Défi du jour : cristaux seulement dans les Cavernes. Musique « élite » sur les combats à objectif.
- 89 tests ; 60 combats simulés (6 campagnes Prairie) : 100 % de victoires au 1er essai, équipe niveau 4 au boss. Difficulté à juger par Max.

## V4.8e (27/11/2026) : Académie, Forge, Marchand, Taverne (lot 4.7e, partie ergonomie)
- « Retour » (`.ov-back`) reste à l'écran quand la liste défile ; lignes sans débordement horizontal. Colonnes en large déjà présentes, gardées.
- Non refait : ces écrans restent des écrans pleins (pas de passage dans les panneaux du village) ; la Taverne et l'onglet Quêtes partagent déjà la même fonction `quests`.

## V4.8d (27/11/2026) : caractéristiques et Entraînement (lot 4.7c)
- Force (Kael, Fenn) ou Intelligence (Aelis, dégâts et soins) : +1 % par point ; Vitalité : +2 % PV ; Agilité : +0,5 % critique, +0,4 % esquive (plafonds 35 % et 25 %). 10 premiers points entiers, 10 suivants à moitié, puis quart. Valeurs dans `ATTR` (data.js).
- 1 point par niveau et par héros. `save.attr` ne garde que les points placés : absent = tout libre, jeu identique ; répartition invalide = points rendus (`cleanAttr`, idempotent). Redistribution gratuite.
- Simulateur : std répartit en trois, opti tout en attaque. 45 combats avant + 45 après, graines 1 à 5 : effet faible (repère seulement).
- **Écart optimisé/standard à niveau égal (dégâts attendus de l'attaque principale)** : avant la V4.8d, Kael 1,72-1,81, Fenn 1,33, Aelis 1,00 ; après, Kael 1,77-1,91, Fenn 1,37-1,41, Aelis 1,02-1,06. La limite de 1,6 était déjà dépassée pour Kael ; rien d'ancien n'a été retouché (décision de Max/ChatGPT, après ses tests).

## V4.8c (27/11/2026) : menus héros, inventaire, équipement (lot 4.7b de la feuille de route)
- Fiche héros : un emplacement se touche et montre les objets possédés avec la comparaison et « Équiper » ; ⇄ = nombre d'objets en réserve.
- Inventaire : filtres héros et emplacement, ✓ sur les objets équipés, « Voir la fiche ».
- Retour : ‹ revient au panneau d'origine ; le « Retour » de l'Académie, de la Forge et du Marchand rouvre le panneau d'où on venait (le camp si on venait du village).
- Deux colonnes dès que le panneau fait 520 px (requête de conteneur). Aucune règle touchée.

## V4.8b (27/11/2026) : les héros se promènent au village
- Kael va vers la Forge, Fenn vers le Marchand, Aelis fait un petit tour près du feu et du cristal ; pause, retour au poste, attente de 6 à 14 s. Décor seulement.
- Aucune image nouvelle : marches du combat (`walkFrames`, de face en descendant, de dos en montant, miroir vers la gauche). Trajets : `SCENES.*.walk`.
- Le toucher suit le héros et ouvre sa fiche. Pause quand un panneau est ouvert ; pas de promenade avec « réduire les animations ».

## V4.8a (27/11/2026) : six PNJ au village
- Affichage seul, aucune règle touchée. Garrick (Caserne), Mira (Taverne), Borin (Forge), Ezran (Marchand), Darius (Entraînement), Elyndra (Académie).
- `assets/pnj/<nom>.webp` : 4 cases (repos, 2 gestes, salut), préparées par `tools/prep_pnj.py` depuis les découpes du studio. Positions : `SCENES.*.pnj`, taille : `npc`.
- Le salut s'affiche au toucher du bâtiment ; l'écran s'ouvre après 450 ms (190 ms avec les animations rapides). Animations coupées avec « réduire les animations ».

## V4.7a (27/11/2026) : quatre emplacements
- `ITEMS[].sl` : arme, armure, bijou, accessoire. `gear(save,i)` : un objet par emplacement ; seul l'objet équipé compte (`save.eq["héros:emplacement"]`, `save.wpn` ancien encore lu). Sauvegarde non convertie ni effacée.
- `compare(save,j)` : valeurs avant/après, affichées dans la fiche héros et l'inventaire.
- Avec les 10 objets actuels, un seul conflit nouveau : anneau et amulette d'Aelis (bijou). Les profils « sous » et « std » du simulateur sont inchangés ; non relancé.

## V4.6.2 (27/11/2026) : cristal évolutif en portrait
- Village vertical sans cristal (G-18) ; le calque `assets/cry/` sert maintenant dans les deux sens (`SCENES.*.cry`, `ck`).

## V4.6.1 (27/11/2026) : nouveau village et lisibilité
- Village vertical (six bâtiments, cristal peint) et horizontal (sans cristal), préparés avec `tools/prep_bg.py`. Coordonnées « logiques » dans `SCENES` (941×1686 et 1536×1030).
- Entraînement : « bientôt » (V4.7). L'ancien bâtiment Talents devient l'Académie.
- Cristal en paysage : `assets/cry/crystal1..5.webp`, état selon les régions terminées (`crystalState` : 0→1, 1→2, 2-3→3, 4-5→4, 6→5). Découpe : `tools/cut_village.py`.
- Écran droit annoncé très large (≥ 700, tactile, ratio > 1,5 ; ex. « Version pour ordinateur » sur un téléphone) : classe `wide`, interface agrandie par `zoom` (`src/main.js`).
- Forge, Marchand, Taverne : lignes plus opaques, textes plus grands, boutons indisponibles lisibles.

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
- Demande de Max : garder la qualité maximale. Les décors Gemini sont désormais à leur taille d'origine, WebP qualité 92 (`tools/unstar.py`, qui garde le dessin sous l’étoile) ; marche des chevaliers en qualité 95. Les images plus anciennes (Prairie et Bois verticaux, Côte et Château horizontaux, village vertical, maître d'armes) sont inchangées.
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

## V4.5b (27/11/2026, Opus) — IA à rôles (pilote Bois 1)
- `MON[].ai` : `tank` (squelette, crabe, golems, chevaliers) reste à 2 cases au plus d'un monstre fragile et frappe en priorité le héros qui le menace ; `range` (champignon, fantôme, araignée, chauve-souris prismatique) recule une fois par tour s'il est collé, vers une case d'où il tire encore ; `flank` (sanglier, chauve-souris, loup, mouette) contourne vers Fenn ou Aelis s'ils sont joignables.
- Coordination : `s.focus` = dernier héros frappé par un monstre ce tour ; les monstres suivants l'achèvent s'ils l'atteignent. Sans rôle (gelée) : comportement d'avant. `intent()` conserve le recul (annonce honnête). 74 tests.

## V4.5c (27/11/2026) — relance du même sort : +1 PA (variante B)
`PA_RULE.recast` (data.js), `costOf(u,sp)` (rules.js) partout : boutons (pastille orange quand le coût monte), aperçu, approche, robot. `u.casts` remis à zéro par `beginTurn`. Monstres non concernés. Comparatif 81 combats (graines 1–3) : B rallonge Bois 1 (std 3,3 → 4,0 tours) ; A (monstres 6 PA, attaque 3 PA) augmente les dégâts reçus sans rallonger et rend le Loup alpha ingagnable sous-équipé : écartée. `NO_B=1` / `VAR_A=1` dans sim.mjs pour refaire la comparaison. 75 tests.

## V4.5d (27/11/2026) — une arme active par héros
`ITEMS[].w` (épée, hache, arc, bâton), `weaponOf(save,i)` / `equip(save,j)`, `save.wpn` (facultatif, sauvegarde toujours v2). Sans choix : l'arme la plus forte possédée. Bouton « Équiper » dans la fiche du héros (Caserne). Autres objets toujours cumulés ; rareté et forge inchangées. Mesure (opti, 30 + 30 combats) : dégâts infligés −7 à −9 %, durée inchangée. 76 tests.

## V4.5e (27/11/2026) — Loup alpha à deux phases
`boss.summon` généralisé (`sn` nom, `snd` son) : sous 50 % PV, appel de la meute (2 Loups de meute, 28 PV, sans XP, une seule fois) ; ensuite hurlement tous les 2 tours au lieu de 3 (`bossP`). Mesure 60 combats : std 9/10 → 8/10, 5,4 → 6,4 tours, PV restants 62 → 43 % ; sous-équipée 6/10 → 3/10 ; optimisée 10/10, 4,2 → 4,7. 77 tests.

## V4.5f (27/11/2026) — survie à vagues partout, 3e étoile selon l'objectif
- Toute mission « survie » (Bois, Côte, Monts, Château combat 3, Cavernes 7) a des vagues : `defWave(Z,i)` (6 tours, 3 + 1/2/1 élite/2, plafond 6) sauf données propres (`ZONES[].waves`). Une seule élite, l'élite de la zone (chevalier) ou son monstre le plus robuste, au tour 4 ; plus d'élite au départ.
- 3e étoile (`star3`, `STAR3_TXT`) : survie = toutes les vagues ; boss à attaque signature déclenchée (Séisme, Rayon) = ne jamais la subir ; sinon tous les héros debout à 50 % de PV ou plus. La règle des « 5 tours » disparaît. Anciens records gardés.
- XP, rareté, forge : non touchées (lot 3C non nécessaire avant les tests de Max). Golem ancien : déjà un mur avant V4.5 (robot 1/3 en std), à revoir après tests. 51 combats simulés, 77 tests.

## V4.6 (27/11/2026) — quartier général, partie code (aucune nouvelle image)
- **Panneau de commandement** (`cmdPanel`, home.js) : prochaine mission (zone, étape, type, ennemis, niveau de mission et de l'équipe), équipe (PV, arme active), à faire (spécialisation, forge, contrats, défi du jour, potions), dernier combat perdu, accès au Cristal. Colonne à droite en paysage **et sur les écrans larges presque carrés** (`min-width:760px` et ratio ≥ 4/5 : Honor Magic V5 déplié, tablettes) ; en portrait étroit, tiroir ouvert en touchant le bandeau « Chapitre ».
- **Cristal de l'Éther** (provisoire) : portrait = cristal dessiné en CSS sur la place pavée ; paysage = zone cliquable sur le cristal déjà peint de la fontaine. Ouvre **Expéditions** : revanches des boss vaincus, missions gagnées à rejouer (récompenses de rejeu inchangées).
- **Défaite utile** : tour, héros KO, ennemis restants, renforts attendus, conseils factuels (niveau, forge, spécialisation, potions, rejeu), boutons Réessayer / Préparer au camp / Carte. `LAST` (ui.js).
- **Animations rapides** (Réglages, `save.fast`) : `SPEED.k` = 0,5 dans util.js.
- L'Entraînement (6e bâtiment) attend les caractéristiques (V4.7) : pas de bâtiment vide. 77 tests.

## Feuille de route consolidée post-V5.08 — 28/11/2026
Campagne principale complète selon NOTES.md V5.0 ; V5.08 livrée selon notes techniques, V5.09 lancée par Max. Versions suivantes indicatives, à ajuster selon correctifs intermédiaires. Ce tableau prévaut sur les ordres antérieurs.
| Version cible | Lot | Objectif qualité indicatif |
|---|---|---|
| 5.08 | Ambiances 12 régions, terminé selon Claude | 92,5/100 provisoire |
| 5.09 | Ergonomie combat/village/audio, en cours ; validation Honor/iPad avant suite | 94 |
| 5.10 | Cauchemar : prototype puis rejouabilité, récompenses et records | 95 |
| 5.11 | Village vivant : animations, PNJ, évolution, trophées selon faisabilité | 96 |
| 5.12 | Galerie des six héros 3D optimisés, prototype puis intégration | 96,5 |
| 5.13 | Partage volontaire des exploits et cartes de victoire | 97 |
| 5.14 | Polissage graphique intégral, captures avant/après | 98 |
| 5.15 | Micro-frustrations, accessibilité, panel externe proposé 20–30 joueurs | 99 |
| 5.16 / RC | Audit final et préparation commerciale | 98 minimum visé, ambition 100 |
À chaque livraison : rapport version/commit, changements, tests, mesures, captures, limites, reste à faire ; ChatGPT réévalue sur preuves et Max valide. Les notes cibles ne sont pas acquises. RC : campagne complète et durée réelle, équilibre sans supprimer les murs voulus, anglais combat/bilan/forge/expéditions/narration, décision doublage restant, droits des 231 fichiers audio, sauvegardes iOS, hors connexion, FPS physiques Honor/iPhone/iPad et PC avant Steam, packaging boutiques, bande-annonce, site et marketing. Prix cible 14,90 €. Ne pas refaire le contenu déjà intégré. Ne pas interrompre V5.09 ni démarrer Cauchemar avant validation. Sonnet pour ergonomie et tâches répétitives, Opus conseillé pour Cauchemar et 3D. Aucun changement de code demandé par cette note.
