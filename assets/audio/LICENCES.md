# Tactika — licences des musiques, voix et bruitages (V5.01)

Registre complet fichier par fichier : [REGISTRE-LICENCES.csv](REGISTRE-LICENCES.csv) (231 fichiers : musique, bruitages, voix). Régénéré par `python3 tools/audio_registry.py`.

## Ce que le dépôt établit
- Tous les sons ont été **générés avec ElevenLabs** (musiques et bruitages par prompt, voix en synthèse vocale, modèle `eleven_v4`), puis rangés par le workflow du dépôt (catalogue : `SONS.md`). Aucun autre fournisseur n’est mentionné dans SONS.md ni dans NOTES.md (à confirmer par Max).
- Voix : Kael, Fenn, Aelis = voix « Tactika - … » créées dans la bibliothèque du compte ; Orion = Ludovic, Nyra = Dahlia, Lyria = Ophélie ; narration : Mira = Anne-Sophie, Garrick = Baptiste, l'Architecte = Georges (voix de la bibliothèque ElevenLabs, NOTES V4.82).
- Polices : Nunito et Lilita One, licence SIL OFL 1.1 (usage commercial et redistribution autorisés), textes de licence dans `assets/fonts/`.

## Ce que le dépôt ne peut PAS établir (à confirmer par Max avant la commercialisation)
Le champ « droits commerciaux » du CSV est volontairement à **À CONFIRMER** pour chaque fichier. À vérifier :
1. **Formule ElevenLabs au moment de la génération** de chaque lot (25/11, 27/11, 28/11) : l'usage commercial des sons générés dépend de l'abonnement actif à ce moment-là. Conserver les factures / la page d'abonnement avec la date.
2. **Voix de la bibliothèque partagée** (Ludovic, Dahlia, Ophélie, Anne-Sophie, Baptiste, Georges) : chaque voix publique a ses propres conditions (usage commercial, mention, retrait possible par son auteur). Vérifier leur fiche dans le compte ; en cas de doute, remplacer par une voix conçue (« Voice Design ») dont la licence suit l'abonnement.
3. **Musiques** : conserver les identifiants de génération (flow ElevenLabs `97rZARFgripawZTlXj1N`) et les prompts (`AUDIO-V5-MANIFESTE-ELEVENLABS.md` côté studio).
4. **Mentions obligatoires** éventuelles (crédits dans le jeu, page Steam) selon les conditions relevées ci-dessus.
5. Steam demande de déclarer l'usage d'IA générative (contenu pré-généré) : prévoir la déclaration pour l'audio et les images.

Rien n'est supprimé ni remplacé par ce lot : c'est uniquement un registre.
