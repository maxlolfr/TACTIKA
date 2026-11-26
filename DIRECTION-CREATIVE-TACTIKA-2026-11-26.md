# TACTIKA — Direction créative proposée, 26 novembre 2026

Base vérifiée : V4.0.5, src/data.js, src/talents.js, assets/atlas.json, src/render.js, src/ui.js, src/audio.js. 6 régions, 30 combats définis, 18 types de monstres, 6 boss, 3 héros, 9 spécialisations, 27 paliers de talents, 83 entrées atlas / 738 cadres. 40 références SFX, présence des MP3 à vérifier. Ne pas confondre cadres atlas et assets effectivement utilisés. README obsolète. Aucun test runtime effectué dans cet audit.

## Direction narrative proposée (à valider)
Les Éclats de l’Éther : un cristal primordial brisé corrompt progressivement le royaume. Kael ancien soldat, Fenn éclaireur, Aelis sensible à l’énergie du cristal. Chevalier noir ancien protecteur corrompu ; Titan prismatique premier indice majeur. Introduire prologue, dialogues courts, journal, bestiaire et révélations post-boss. Préserver le canon existant s’il diverge.

## Campagne proposée
| Région | Niveaux | Monstres | Boss | Mécanique |
|---|---|---|---|---|
| 7 Marais des Murmures | 21–25 | Crapaud toxique, hydre, esprit putride, mandragore | Reine des Marais | Poison et purification |
| 8 Terres du Givre Éternel | 26–30 | Loup polaire, yéti, élémentaire, spectre | Roi du Givre | Glissade et gel |
| 9 Forges de l’Enfer | 31–35 | Salamandre, golem de lave, démon, chevalier incandescent | Ignorath | Lave annoncée |
| 10 Citadelle Céleste | 36–40 | Gardien ailé, griffon, sentinelle solaire, chevalier céleste | Séraphion | Vents et déplacement forcé |
| 11 Nécropole des Âmes | 41–45 | Chevalier spectral, nécromancien, faucheur, liche | Roi Sans Visage | Autels et résurrection |
| 12 Sanctuaire de l’Éther | 46–50 | Aberration, chevalier de l’Éther, gardien primordial, double corrompu | Aetherion | Synthèse et phases |

Cible indicative : 10 combats par nouvelle région, 90 au total. Une région à la fois. Si Citadelle Céleste ou autres éléments déjà prévus dans les notes récentes, réconcilier avant de produire.

## Instructions Claude
1. Lire les notes partagées existantes et vérifier HEAD, données, atlas, fichiers sources réellement utilisés, audio, décors portrait/paysage. Produire un inventaire présent / intégré / provisoire / manquant ; ne pas supprimer les anciens assets sans vérification.
2. V4.0.6–4.1 : stabiliser région 6, ciblage tactile, caméra, sprites de dos, sols, boss Titan, audio ; tests npm test, sauvegardes anciennes, orientation portrait/paysage, mobile Magic V5, objectifs survie/chef, cristaux. Actualiser README. Ne pas modifier de moteur.
3. V4.2 : journal narratif léger et bestiaire, dialogues courts optionnels. Ne pas imposer de longs textes. Préserver la sauvegarde avec migration testée.
4. V4.3 : région 7 pilote : 10 combats, boss et une mécanique nouvelle maximum. Valider équilibrage avant région 8. Les numéros de version sont indicatifs.
5. Pour chaque région, fournir à ChatGPT les commandes artistiques exactes : dimensions, grille, poses, ancrages pieds, fond, noms des fichiers, tuiles, décors vertical et horizontal, icônes et effets. Gemini uniquement pour décors à reprendre, maximum 5 images par lot. Réutiliser les assets avant de commander de nouvelles générations. Fournir aussi liste audio avec statut réel.
6. Garder les 3 héros jusqu’au niveau 50 ; nouvelles spécialisations ou armures visuelles seulement après audit d’équilibrage. Concevoir des combats avec objectifs variés, pas uniquement inflation PV/dégâts. Aucune refonte moteur ou ajout massif de code sans validation.
7. Livrer un compte rendu par version : fichiers modifiés, tests réellement exécutés, bugs restants, captures, commandes artistiques, prochaine petite étape. Ne pas bloquer la commercialisation de la première campagne sur l’intégralité de cette feuille de route.
