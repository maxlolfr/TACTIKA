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
