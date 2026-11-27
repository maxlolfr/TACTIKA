# Tactika — catalogue des sons

Rangement : `musique/` (boucles, victoire, défaite) et `bruitages/` (effets courts). Le jeu choisit le dossier tout seul (`src/audio.js`, `dir()`).
Source : ElevenLabs, flow `97rZARFgripawZTlXj1N`. Tant qu'un fichier manque, le jeu joue un son de secours (table `FALL`).
Pour en ajouter : `tools/audio-urls.txt` (`nom URL` par ligne), puis fusion sur main → le workflow « Récupération des sons ElevenLabs » télécharge et range (musiques sans recompression, bruitages compressés).

## Musiques (`musique/`)
| Fichier | Où | Lot |
|---|---|---|
| main_theme | village (et ouverture du jeu) | lot 1 |
| village | Taverne | V4.20 (qualité d'origine) |
| boss_v2 | boss des Monts gris, du Château (et aperçu Braise) | V4.20 (qualité d'origine) |
| camp | carte | ancien |
| forest | Prairie | lot 1 |
| darkwood | Bois sombre | V4.21 (qualité d'origine) |
| coast | Côte dorée | V4.0.3 |
| mountain | Monts gris | V4.0.3 |
| castle | Château en ruine | V4.0.3 |
| cave | Cavernes de cristal | V4.0.2 |
| battle | secours / autres combats | ancien |
| elite_battle | 3e combat des zones 1 à 5 | lot 1 |
| boss | boss de la Prairie, du Bois et de la Côte | ancien |
| titan_boss | Titan prismatique | V4.0.3 |
| victory, defeat | fin de combat | ancien |
| map2 | carte II | V4.33 |
| ember | Forteresse de braise (aperçu) | V4.33 |
| boss_map2 | boss de la Forteresse de braise (aperçu) ; remplace boss_v2 à cet endroit | V4.33 |

## Bruitages (`bruitages/`)
| Groupe | Fichiers |
|---|---|
| Héros | slash, smash, guard, bow, arrowhit, heal, buff, poison, kael_charge, aelis_heal |
| Combat | hit, bite, slime, death, critical, push, collision, combo_2, combo_3, trap, dodge, enemy_warning |
| Interface | step, click, turn, coin, levelup, chest_open (V4.0.3), loot_rare (V4.0.3), boss_intro (V4.0.3) |
| Cavernes (V4.0.2) | crystal_amp (cristal turquoise), prism_burst (prisme), beam_charge, beam_fire (rayon du Titan) |
| Monstres des Cavernes (V4.0.3) | golem_smash, spider_bite, bat_shriek, titan_roar (changement de phase), titan_death |
| V4.33 | boss_phase (Fureur, Surchauffe), boss_death (mort d'un boss, hors Titan), quest_complete (contrat réclamé), star_earned (étoiles), village_ambience (boucle sous le thème du village) |

## Voix des héros (`voix/`, V4.36)
Fichiers `v_<héros>_<réplique>.mp3`, fichiers d'origine ElevenLabs (modèle `eleven_v4`, une prise). Voix créées dans la bibliothèque : « Tactika - Kael » (aperçu 1, choisi par Max), « Tactika - Fenn » (voix d'homme) et « Tactika - Aelis » (choisies par Claude sans écoute, à valider par Max). Orion n'a pas encore de voix.

| Réplique | Quand | Kael | Fenn | Aelis |
|---|---|---|---|---|
| start | début du combat | En avant ! | Je les vois. | Restons ensemble. |
| sig | attaque signature (60 %) | Prends ça ! (Fracas, Charge) | En pleine cible ! (Volée, Tir perforant) | Que l'Éther frappe ! (Épine) |
| support | soutien (60 %) | Je tiens bon ! (Rempart) | Trop lent ! (Bottes) | Je suis là. (Soin, Soin collectif, Renaissance) |
| hurt | critique ou coup ≥ 25 % des PV max (70 %) | Pas encore… | Aïe, pas mal… | Ça ira… |
| ko | héros KO | Continuez… | Je… décroche. | Pardonnez-moi… |
| win | victoire (un héros debout) | Bien joué, tous ! | Trop facile ! | Tout le monde va bien ? |
| level | victoire avec niveau gagné | Je progresse. | Encore mieux ! | Je le sens. |

Règles (`voice()` dans `src/audio.js`) : jamais deux voix à la fois ; 6 s entre deux voix et 20 s avant la même réplique (sauf début, KO, victoire, niveau) ; musique baissée pendant la voix ; curseur « Volume voix » ; le bouton des bruitages coupe aussi les voix. Volumes égalisés par la table `VTRIM`.
