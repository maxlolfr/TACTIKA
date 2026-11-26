# Tactika — catalogue des sons

Rangement : `musique/` (boucles, victoire, défaite) et `bruitages/` (effets courts). Le jeu choisit le dossier tout seul (`src/audio.js`, `dir()`).
Source : ElevenLabs, flow `97rZARFgripawZTlXj1N`. Tant qu'un fichier manque, le jeu joue un son de secours (table `FALL`).
Pour en ajouter : `tools/audio-urls.txt` (`nom URL` par ligne), puis fusion sur main → le workflow « Récupération des sons ElevenLabs » télécharge, compresse et range.

## Musiques (`musique/`)
| Fichier | Où | Lot |
|---|---|---|
| main_theme | accueil | lot 1 |
| camp | carte | ancien |
| forest | Prairie, Bois | lot 1 |
| coast | Côte dorée | V4.0.3 |
| mountain | Monts gris | V4.0.3 |
| castle | Château en ruine | V4.0.3 |
| cave | Cavernes de cristal | V4.0.2 |
| battle | secours / autres combats | ancien |
| elite_battle | 3e combat des zones 1 à 5 | lot 1 |
| boss | boss des zones 1 à 5 | ancien |
| titan_boss | Titan prismatique | V4.0.3 |
| victory, defeat | fin de combat | ancien |

## Bruitages (`bruitages/`)
| Groupe | Fichiers |
|---|---|
| Héros | slash, smash, guard, bow, arrowhit, heal, buff, poison, kael_charge, aelis_heal |
| Combat | hit, bite, slime, death, critical, push, collision, combo_2, combo_3, trap, dodge, enemy_warning |
| Interface | step, click, turn, coin, levelup, chest_open (V4.0.3), loot_rare (V4.0.3), boss_intro (V4.0.3) |
| Cavernes (V4.0.2) | crystal_amp (cristal turquoise), prism_burst (prisme), beam_charge, beam_fire (rayon du Titan) |
| Monstres des Cavernes (V4.0.3) | golem_smash, spider_bite, bat_shriek, titan_roar (changement de phase), titan_death |
