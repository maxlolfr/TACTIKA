# Audit localisation — base V5.19

Audit statique, pas de test navigateur exécuté. 836 clés littérales uniques dans i18n.js (7 répétitions identiques), 281 descriptions, 40 quêtes avec trois champs. Le script tools/en-audit.mjs existant visite une sélection d'écrans et ne couvre pas exhaustivement les combats, le scénario ou Cauchemar.

## Points bloquants
- src/save.js normalise toute langue autre que en vers fr.
- src/i18n.js utilise L.on, un dictionnaire EN et une table HTML bilingue ; remplacement de fragments et MutationObserver susceptibles de retraduire le DOM.
- src/story.js choisit les dialogues, boutons et voix via un booléen en ; le scénario est exclu du traducteur DOM.
- src/ui.js contient des chaînes dynamiques FR/EN pour élites et Cauchemar. Reprendre les nouveaux textes après stabilisation Claude.
- sw.js liste explicitement les modules linguistiques.
- index.html précharge des polices Latin ; vérifier couverture CJK et disposition.

## Plan
1. Inventorier les chaînes dynamiques et les écrans de réglages ; réutiliser les tests existants.
2. Langues fr,en,zh-Hans,de,ja,es,ru,pt-BR ; identifiants stables, fallback explicite et voix FR/EN séparées.
3. Traduire les phrases complètes avec variables et balises préservées ; tester les dictionnaires et changements de langue.
4. Tester sauvegardes, cache, DOM, canvas, scénario, mode Cauchemar et affichage mobile.
5. Comparer avec main avant PR ; ne pas fusionner sans contrôles.

## Reprise du 28 novembre 2026

Branche `localization/chatgpt`, travail repris après `c48cb01`. La migration accepte les identifiants persistants `fr`, `en`, `zh-Hans` et `de`. Les valeurs inconnues reviennent au français. Le sélecteur recharge le camp après une écriture réussie et conserve la sélection précédente si l’écriture échoue. La traduction DOM réutilise la source originale d’un nœud déjà traité et surveille aussi les attributs d’accessibilité. Les deux aperçus utilisent la chaîne française entière en l’absence d’équivalent exact. Le remplacement de fragments anglais reste en place.

### Résultats vérifiés

| Contrôle | Résultat |
| --- | --- |
| `npm test` | 281 réussites, dont couverture FR/EN et préservation des balises du tutoriel dans les quatre langues. |
| `tools/smoke.mjs` | Démarrage, camp, plateau de combat, dessin, interface et réparation d’une sauvegarde corrompue. |
| `tools/en-audit.mjs` | Neuf écrans vérifiés dans chaque langue, dont les réglages, la carte, une région et le panneau des sorts en combat. « ⚔ Combat » et le libellé accessible « voir les héros » corrigés. Aucun texte suspect signalé à la dernière exécution. |
| `tools/localization-smoke.mjs` | Chromium, fenêtre 390 × 844. Parcours FR → EN → zh-Hans → DE → FR avec libellés du camp, attribut de langue, persistance après rechargement, niveau, or et première réplique du prologue vérifiés. |

Le détecteur anglais utilise une heuristique lexicale et ne valide pas l’intégralité des écrans. Les scripts navigateur utilisent Playwright et un exécutable Chromium sélectionné via `PW` et `CHROME`.

### Couverture des aperçus

Les deux aperçus couvrent les 40 quêtes avec titre, description et réplique, les cinq cartes du tutoriel, les 23 scènes du scénario (53 répliques), les textes de fin, les noms des 120 équipements et les 61 noms et descriptions de base des sorts et capacités. Le registre de texte simple compte 1 241 entrées EN. Le chinois simplifié et l’allemand couvrent les 1 241 entrées. Les 16 chaînes du Cauchemar ajoutées dans les deux aperçus sont hors du registre anglais, car le jeu gérait déjà leur anglais séparément. Ces chiffres mesurent le recoupement des registres, qui ne recensent pas toutes les chaînes du jeu.

Restent à traduire et vérifier en contexte les autres chaînes composées du combat et du Cauchemar et les écrans secondaires. Les voix des aperçus utilisent l’audio français existant. La police CJK dépend du système durant l’aperçu. Vérifier la lisibilité sur appareils réels et le cache hors connexion avant de retirer le statut « aperçu ».

Pour la revue, examiner en premier la conservation des sauvegardes et le traitement du scénario séparé de la traduction DOM. Reprendre ensuite les chaînes par écran, avec le scénario et le Cauchemar testés séparément. Réactualiser l’inventaire sur la prochaine base de développement avant intégration.

Pour obtenir le delta des registres, lancer `node tools/localization-coverage.mjs --missing`. L’option `--strict` signale toute clé manquante par un code de retour non nul. Ce contrôle ne couvre pas les textes dynamiques et les chaînes absentes du registre de référence.

La branche a intégré la V5.21 (`05c5846`), avec résolution du conflit du service worker. Cette intégration reprend les mises à jour graphiques de la branche principale.

Les deux aperçus couvrent les 21 cartes d’aide de combat, les 12 introductions de boss (dont le texte générique), les trois objectifs de combat avec paramètres et 16 textes du Cauchemar (accès, campagne et annonces). Les tests vérifient la présence des traductions, les balises des cartes et les valeurs des objectifs dynamiques.

L’interface de maîtrise de l’Académie est traduite dans les deux aperçus, avec ses valeurs dynamiques. Le test compare les valeurs affichées pour les trois rangs des 43 sorts couverts. Les coûts, prérequis et effets restent ceux du moteur existant.

Les 18 spécialisations, leurs 90 talents, les 47 variantes de description de sorts, les 40 trophées et toutes les entrées du bestiaire ont une traduction dans les deux aperçus. Les états de l’Académie et les valeurs de la Chronique disposent aussi de textes dynamiques localisés.

L’inventaire affiche dans les deux aperçus des libellés localisés pour les filtres, la capacité, les objets à découvrir et les fiches d’équipement du camp. Les calculs d’équipement et les conditions d’accès sont inchangés.

La forge, le marchand et la taverne ont des textes localisés en chinois simplifié et en allemand, y compris les stocks de potions, les prix, les objectifs des contrats et leurs récompenses. L’aide de combat des réglages est également traduite.

La carte et les fiches de région affichent les niveaux, les compteurs, les jalons, les verrous et les libellés accessibles dans les deux langues. La progression et les conditions d’accès restent celles du moteur existant.

Les infobulles de sorts et les valeurs chiffrées des fiches de combat utilisent également des formats chinois et allemands (coûts, portée, zone, recharge, points de vie et armure). Les statuts standards sont traduits. Les effets propres aux élites et aux champions restent à vérifier.

Les six affixes du Cauchemar et les libellés de sauvegarde sont localisés. Les règles et la valeur des champs sauvegardés sont inchangées. Le registre est complet pour ces deux langues. Les textes construits hors registre, notamment certains enchaînements d’annonces et résultats de combat, restent à vérifier en jeu avant de lever le statut d’aperçu.

Les bilans de combat affichent dans les deux langues les tours, les dégâts, les soins, les héros à terre, les ennemis restants et les renforts attendus. Le contrôle strict du registre passe pour les deux langues. Le parcours Chromium vérifie le dialogue de sauvegarde et le nom d’un ennemi avec l’affixe Explosif dans le bac à sable Cauchemar.

Les annonces de vagues, la durée de survie restante, les avertissements d’explosion et de rayon, le changement de tour et les conseils après une retraite ont des formats localisés. Les tests Chromium rejouent une retraite et vérifient le texte du bilan avec ses compteurs.

## Reprise sur la V5.27

Les huit commits de `main` jusqu’à `af0d47a` sont intégrés. Le chinois simplifié et l’allemand couvrent les deux nouveaux affixes (Spectral et Commandant), la présentation de la campagne sur 12 régions, les 12 trophées et les 8 titres du Cauchemar, ainsi que les libellés des sceaux et les nouvelles annonces de récompense. Les modules de récompenses et de traduction sont inclus dans le cache du service worker.

300 tests Node passent. Le contrôle strict retrouve les 1 241 chaînes du registre anglais dans chaque langue, et le contrôle statique du cache confirme la présence des fichiers et de leurs imports. L’audit de neuf écrans en FR/EN et le parcours des quatre langues à 390 × 844 ont passé dans Chromium sur la V5.26. La V5.27 apporte des visuels HD sans nouveau texte. Le rendu sur téléphone reste à valider.

Sur la V5.27 à 390 × 844, le démarrage hors ligne depuis le cache initial, une image précachée, le camp et les 20 entrées de récompense du Cauchemar ont été vérifiés en chinois simplifié et en allemand. L’atlas est désormais précaché, et les médias du cache principal restent accessibles hors ligne. Ce parcours couvre le démarrage et la Chronique.

Le survol des ennemis et la fiche des boss affichent leurs phases, leurs seuils de vie et le délai avant leurs capacités en chinois simplifié et en allemand. Le bilan localise aussi la récompense pour toutes les vagues éliminées, la confirmation du défi quotidien, la réplique de quête et l’annonce d’une nouvelle zone. Le parcours Chromium simule la charge du rayon du Titan et la victoire après toutes les vagues dans les deux langues.

### Contrôles complémentaires du 29 novembre

Le parcours Chromium à 390 × 844 vérifie dans les deux langues les libellés du Titan, de la surchauffe, de la malédiction du tombeau et du fracas primordial. Ces phases sont déclenchées par le scénario de test.

Le même parcours recharge le jeu hors ligne après avoir visité la mission du Cauchemar en ligne, rouvre cette mission, puis vérifie la victoire localisée via le moteur de fin de combat. Les ennemis sont déclarés vaincus par le scénario de test. Restent à valider une partie jouée tour par tour hors ligne, l’accès aux régions jamais chargées, et le rendu sur téléphone réel.

### Reprise sur la V5.28

La branche intègre la V5.28 de `main` (`765dcbf`), avec les visuels HD de Fenn et la version 5.28 du cache. Les modules de localisation restent précachés.

L’aperçu de visée en chinois simplifié et en allemand affiche les points de vie, les raisons de l’impossibilité de lancer un sort, la portée, les prévisions de dégâts et de soins, la collision, les statuts, le risque de mise à terre et le déclenchement du prisme. Les cibles ont aussi un libellé accessible localisé. Les tests Node vérifient notamment les valeurs de portée et la conservation de la case bloquante. Le scénario Chromium a été étendu à la sélection d’une cible et à la lecture de l’aperçu.

Il reste à contrôler cet écran dans Chromium à 390 × 844 (le binaire local était indisponible lors de cette reprise), puis à vérifier les autres textes dynamiques du plateau et la partie hors ligne tour par tour. Le chinois simplifié et l’allemand restent en aperçu.

### Partie hors ligne et région jamais chargée

Le scénario Chromium du Cauchemar utilise désormais le bouton de fin de tour jusqu’au bilan. Il laisse les ennemis jouer et accepte une victoire ou une défaite produite par les règles du combat. Après le bilan, le parcours recharge la carte hors ligne et tente d’ouvrir le Bois sombre en vérifiant que le sprite `wolfN.webp` est absent des caches.

Un essai isolé du gestionnaire du service worker, avec le réseau coupé et les deux caches vides pour le média demandé, renvoie HTTP 504. Le sprite `wolfN.webp` ne figure pas dans la liste de précache. `zoneAssets` attend les images avant l’initialisation du plateau. Une première visite hors ligne reste donc bloquée si le fichier n’a jamais été mis en cache. Le parcours vérifie le message de chargement de ce cas. Le changement est limité au scénario et à cet audit. Le parcours Chromium reste à exécuter, l’environnement d’exécution étant indisponible lors de cette reprise.

### Déplacement et terrain

L’aperçu d’un déplacement affiche en chinois simplifié et en allemand le coût en points de mouvement, les sorts disponibles depuis la case, le nombre de cibles et l’instruction de confirmation. Le plateau localise aussi les cases infranchissables, dont le mur de glace avec ses points de vie et sa durée restante. Ce lot reprend les traductions du plateau pendant que le contrôle Chromium hors ligne attend un environnement utilisable.

### HUD et tutoriel de combat dans les quatre langues

Le titre du plateau, les points d’action et de mouvement, les points reportés, l’aide du sort sélectionné, les instructions du premier combat et les alertes de terrain utilisent désormais des phrases complètes en français, anglais, chinois simplifié et allemand. La terminologie des boutons et des sorts a été comparée aux valeurs des catalogues. Le test vérifie la conservation des valeurs d’étape, de niveau, de mouvement et de dégâts des pièges dans les quatre langues.

301 tests Node passent. Le contrôle strict reste à 1 241 / 1 241 pour chacun des deux aperçus. Ces contrôles couvrent les catalogues et les formats testés. La validation visuelle de ces nouveaux textes et le parcours Chromium hors ligne restent ouverts, le binaire Chromium étant indisponible dans l’environnement.

La relecture anglaise a remplacé les fragments encore assemblés en français dans les aperçus de déplacement, de visée et de statut par des formats anglais complets (AP, MP et HP). Le test vérifie le coût et le nombre de cibles dans les trois langues traduites. 302 tests Node passent.

### Fermeture des écarts FR/EN en combat

La revue statique a relevé des fragments français en anglais dans les textes dessinés sur le plateau, les états des élites, les fiches des ennemis, les annonces de vagues et le bilan de combat. Les formats anglais préservent désormais les valeurs de bouclier, de poison et de points d’action reportés, les compteurs d’ennemis et de renforts, et les délais des capacités. Le texte source français est conservé pour les événements canvas. L’audit navigateur inclut désormais le titre, le portrait actif, l’aide et le bilan de retraite.

303 tests Node passent. La couverture stricte des catalogues chinois et allemand reste à 1 241 / 1 241. Le scénario navigateur élargi reste à exécuter. Le binaire Chromium attendu est absent de l’environnement, donc la couverture visuelle FR/EN à 100 % n’est pas établie.
