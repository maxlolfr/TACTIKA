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
| `npm test` | 279 réussites, dont couverture FR/EN et préservation des balises du tutoriel dans les quatre langues. |
| `tools/smoke.mjs` | Démarrage, camp, plateau de combat, dessin, interface et réparation d’une sauvegarde corrompue. |
| `tools/en-audit.mjs` | Neuf écrans vérifiés dans chaque langue, dont les réglages, la carte, une région et le panneau des sorts en combat. « ⚔ Combat » et le libellé accessible « voir les héros » corrigés. Aucun texte suspect signalé à la dernière exécution. |
| `tools/localization-smoke.mjs` | Chromium, fenêtre 390 × 844. Parcours FR → EN → zh-Hans → DE → FR avec libellés du camp, attribut de langue, persistance après rechargement, niveau, or et première réplique du prologue vérifiés. |

Le détecteur anglais utilise une heuristique lexicale et ne valide pas l’intégralité des écrans. Les scripts navigateur utilisent Playwright et un exécutable Chromium sélectionné via `PW` et `CHROME`.

### Couverture des aperçus

Les deux aperçus couvrent les 40 quêtes avec titre, description et réplique, les cinq cartes du tutoriel, les 23 scènes du scénario (53 répliques), les textes de fin, les noms des 120 équipements et les 61 noms et descriptions de base des sorts et capacités. Le registre de texte simple compte 1 241 entrées EN. Le chinois en couvre 939 et l’allemand 947. Les 16 chaînes du Cauchemar ajoutées dans les deux aperçus sont hors du registre anglais, car le jeu gérait déjà leur anglais séparément. Ces chiffres mesurent le recoupement des registres, qui ne recensent pas toutes les chaînes du jeu.

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
