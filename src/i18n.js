// V4.89 (lot 7a) : anglais de l'interface. Le jeu est écrit en français ; quand save.lang === 'en', les textes affichés
// (DOM et textes flottants du combat) passent par ce dictionnaire : d'abord le texte entier, sinon chaque expression connue
// (de la plus longue à la plus courte, en mots entiers). Les récits et les voix ont leur propre anglais (story.js, audio.js).
// Ajouter une traduction : une ligne "français":"anglais" ; aucune autre modification nécessaire.
import {normalizeLanguage} from './locales/languages.js';
import {ZH_GLOSSARY} from './locales/zh-glossary.js';
import {DE} from './locales/de.js';
import {EN_DESC} from './i18n-desc.js';
import {EN_Q} from './i18n-quests.js';
import {TUTO,TIPS,TIPS_T} from './tips.js';
import {TUTO_EN,TIPS_EN,TIPS_T_EN,BOSS_DEFAULT_EN} from './tips-en.js';
export const EN={
// ---------- camp, menus ----------
"Partir à l’aventure":"Set off on an adventure","Camp":"Camp","Héros":"Heroes","Inventaire":"Inventory","Quêtes":"Quests","Chronique":"Chronicle","Réglages":"Settings",
"Académie":"Academy","Forge":"Forge","Marchand":"Merchant","Taverne":"Tavern","Caserne":"Barracks","Cristal":"Crystal","Cristal de l’Éther":"Ether Crystal","Expéditions":"Expeditions","Revanches":"Rematches",
"Cristal de l’Éther : expéditions, revanches":"Ether Crystal: expeditions, rematches","Entraînement":"Training","Commandement":"Command","Chapitre":"Chapter","Prochaine mission":"Next mission","Dernier combat":"Last battle",
"Aventure terminée":"Adventure complete","Défaite au tour":"Defeat on turn","Ennemis":"Enemies","Équipe":"Team","Tes héros":"Your heroes","Dans l’équipe de combat":"In the battle team","En réserve":"In reserve",
"Le faire entrer à la place de":"Swap in for","Voir la fiche de":"View sheet of","a rejoint le camp : choisis ton équipe":"has joined the camp: choose your team",
"Choisir une spécialisation":"Choose a specialization","Points de caractéristiques à répartir":"Attribute points to spend","Amélioration abordable à la Forge":"Affordable upgrade at the Forge",
"Contrat à réclamer à la Taverne":"Contract reward at the Tavern","Défi du jour disponible":"Daily challenge available","Contrats et défi":"Contracts and challenge",
"Caractéristiques":"Attributes","Points de vie":"Hit points","Puissance":"Power","Critique":"Critical","Esquive":"Dodge","Niveau":"Level","Équipement":"Equipment","Sorts":"Spells","Sorts emportés":"Spells carried","Talents":"Talents",
"Équiper":"Equip","Équiper sur":"Equip on","Retirer":"Remove","Remplacer":"Replace","Ajouter":"Add","Emporter":"Carry","Améliorer":"Upgrade","Acheter":"Buy","Vendre":"Sell","Annuler":"Cancel","Confirmer":"Confirm","Fermer":"Close","Retour":"Back","Choisir":"Choose","Partir":"Go","Affronter":"Fight","Tous":"All","Tout":"All",
"Filtrer par héros":"Filter by hero","Filtrer par emplacement":"Filter by slot","Objet à découvrir":"Item to discover","Objet à découvrir pour":"Item to discover for","Un seul objet à la fois":"One item at a time",
"Touche un emplacement pour changer d’objet.":"Tap a slot to change item.","Touche un objet pour voir son effet. ✓ = équipé.":"Tap an item to see its effect. ✓ = equipped.",
"n’a aucun objet pour cet emplacement. On en gagne en combat ou chez le Marchand.":"has no item for this slot. Win them in battle or buy them from the Merchant.",
"en réserve, sans effet":"in reserve, no effect","sort de talent, toujours emporté":"talent spell, always carried","touche « Remplacer » sur le sort à laisser au camp.":"tap “Replace” on the spell to leave at camp.",
"à répartir · 1 point par niveau et par héros":"to spend · 1 point per level and per hero","Touche encore pour redistribuer":"Tap again to redistribute","Touche encore pour tout effacer":"Tap again to erase everything",
"Au-delà de 10 points dans une caractéristique, chaque point compte pour moitié ; au-delà de 20, pour un quart.":"Beyond 10 points in an attribute, each point counts for half; beyond 20, for a quarter.",
"Rejoue une mission déjà gagnée : XP des monstres, moitié de l’or, 15 % de chance d’objet. Sans limite, sans obligation.":"Replay a mission you already won: monster XP, half the gold, 15% item chance. No limit, no obligation.",
"Rejoue une mission au Cristal, change d'arme ou de talent, puis réessaie.":"Replay a mission at the Crystal, change weapon or talent, then try again.","Rejoue les combats pour 3 ★":"Replay battles for 3 ★",
"Recommencer à zéro":"Start over","Revoir le tutoriel":"Replay the tutorial","💾 Sauvegarde":"💾 Save","Sauvegarde":"Save","Volume musique":"Music volume","Volume bruitages":"Sound effects volume","Volume voix":"Voice volume",
"♪ Musique":"♪ Music","🔊 Sons":"🔊 Sounds","Musique":"Music","Bruitages":"Sound effects","Voix":"Voices","Volume":"Volume","Général":"Master",
"⚡ Animations rapides : oui":"⚡ Fast animations: on","⚡ Animations rapides : non":"⚡ Fast animations: off","✨ Effets réduits : oui":"✨ Reduced effects: on","✨ Effets réduits : non":"✨ Reduced effects: off","🎨 Graphismes : Faible":"🎨 Graphics: Low","🎨 Graphismes : Moyen":"🎨 Graphics: Medium","🎨 Graphismes : Haut":"🎨 Graphics: High",
"🌐 Langue : Français":"🌐 Language: Français","🌐 Langue : English":"🌐 Language: English","🌗 Village":"🌗 Village","Auto":"Auto","Jour":"Day","Soir":"Evening","Nuit":"Night",
"Copie ce code pour garder ta partie (ou la passer sur un autre appareil). Pour restaurer, colle un code puis « Importer ».":"Copy this code to keep your game (or move it to another device). To restore, paste a code then “Import”.",
"Copier":"Copy","Copié !":"Copied!","Importer":"Import","Code invalide : rien n’a été changé.":"Invalid code: nothing was changed.","Sûr ?":"Sure?","Exporte ta partie en fichier ou copie le code pour la garder (ou la passer sur un autre appareil). Pour restaurer, choisis un fichier ou colle un code puis « Importer ».":"Export your game as a file or copy the code to keep it (or move it to another device). To restore, choose a file or paste a code, then tap “Import”.","Exporter (fichier)":"Export (file)","Importer (fichier)":"Import (file)","Copie de secours":"Backup copy","Fichier exporté.":"File exported.","Export impossible : utilise « Copier ».":"Export failed: use “Copy”.","Fichier ou code invalide : rien n’a été changé.":"Invalid file or code: nothing was changed.","Écriture impossible : rien n’a été changé.":"Cannot write: nothing was changed.","Lecture impossible : rien n’a été changé.":"Cannot read the file: nothing was changed.","Aucune copie de secours lisible.":"No readable backup copy.","La copie de secours a été restaurée au démarrage (l’ancienne sauvegarde était abîmée).":"The backup copy was restored at startup (the previous save was damaged).","La sauvegarde était illisible : une nouvelle partie a démarré (l’original est gardé de côté).":"The save was unreadable: a new game started (the original is kept aside).","Écriture impossible sur cet appareil : exporte ta partie maintenant.":"Cannot write on this device: export your game now.",
// ---------- Chronique ----------
"Trophées":"Trophies","Régions":"Regions","Statistiques":"Statistics","Bestiaire":"Bestiary","Collection":"Collection","trophées":"trophies","Trophée":"Trophy",
"Bronze":"Bronze","Argent":"Silver","Or":"Gold","Platine":"Platinum","obtenu le":"earned on","Pas encore découverte":"Not discovered yet","Pas encore rencontré":"Not met yet","créatures découvertes":"creatures discovered",
"équipements découverts (même revendus)":"items discovered (even if sold)","Missions":"Missions","quêtes":"quests","Temps de combat":"Battle time","Combats":"Battles","Victoires / défaites":"Wins / losses","Boss vaincus":"Bosses defeated",
"Ennemis vaincus":"Enemies defeated","Dégâts infligés":"Damage dealt","Soins prodigués":"Healing done","Dégâts subis":"Damage taken","Quêtes terminées":"Quests completed","Missions à 3 ★":"Missions with 3 ★","Héros le plus engagé":"Most used hero","Trios victorieux":"Winning trios",
"Dégâts en un combat":"Damage in one battle","Plus gros coup":"Biggest hit","Ennemis vaincus en un combat":"Enemies defeated in one battle","Victoire la plus rapide (tours)":"Fastest win (turns)","Nouveau record":"New record",
"Comptés depuis la version 4.86 : les combats plus anciens ne sont pas inventés.":"Counted since version 4.86: older battles are not made up.","combats":"battles","Vaincu":"Defeated","Vaincus":"Defeated","Boss de région":"Region boss",
"Encaisse et protège":"Tanks and protects","Contourne et harcèle":"Flanks and harasses","Attaque à distance":"Ranged attacker","Fonce au contact":"Charges in close","Vole au-dessus des obstacles":"Flies over obstacles","Empoisonne":"Poisons","Ralentit":"Slows","Portée":"Range",
"Premier pas":"First step","Gagner un premier combat":"Win a first battle","Aguerri":"Seasoned","Atteindre le niveau 10":"Reach level 10","Atteindre le niveau 30":"Reach level 30","Atteindre le niveau 50":"Reach level 50","Vétéran":"Veteran","Légende":"Legend",
"L’apprenti mage":"The apprentice mage","Recruter Orion":"Recruit Orion","Recruter Nyra":"Recruit Nyra","Recruter Lyria":"Recruit Lyria","Ombre alliée":"Allied shadow","Serment de lumière":"Oath of light",
"Bonne âme":"Kind soul","Terminer 5 quêtes":"Complete 5 quests","Terminer 20 quêtes":"Complete 20 quests","Terminer les 40 quêtes":"Complete all 40 quests","Protecteur des terres":"Protector of the lands","Héros du village":"Village hero",
"Curieux":"Curious","Naturaliste":"Naturalist","Encyclopédie vivante":"Living encyclopedia","Découvrir 10 fiches du bestiaire":"Discover 10 bestiary entries","Découvrir 30 fiches du bestiaire":"Discover 30 bestiary entries","Compléter le bestiaire":"Complete the bestiary",
"Sans bavure":"Flawless","Gagner une mission avec 3 étoiles":"Win a mission with 3 stars","Stratège":"Strategist","Obtenir 3 étoiles dans 30 missions":"Get 3 stars in 30 missions","Perfection":"Perfection","Obtenir 3 étoiles dans les 120 missions":"Get 3 stars in all 120 missions",
"Chasseur":"Hunter","Vaincre 100 ennemis":"Defeat 100 enemies","Défi relevé":"Challenge accepted","Réussir un défi du jour":"Complete a daily challenge","Éclair":"Lightning","Gagner un combat en 3 tours ou moins (hors survie)":"Win a battle in 3 turns or fewer (survival excluded)",
"Fouineur":"Rummager","Collectionneur":"Collector","Trésor complet":"Complete treasure","Découvrir 10 équipements":"Discover 10 items","Découvrir 60 équipements":"Discover 60 items","Découvrir tous les équipements":"Discover every item",
"Premier coup de marteau":"First hammer blow","Améliorer un objet à la Forge":"Upgrade an item at the Forge","Esprit d’équipe":"Team spirit","Gagner avec 5 trios de héros différents":"Win with 5 different hero trios","Maître tacticien":"Master tactician","Gagner avec les 20 trios de héros":"Win with all 20 hero trios",
"Sans une égratignure":"Without a scratch","Vaincre un boss sans perdre de héros":"Defeat a boss without losing a hero","Dernier debout":"Last one standing","Gagner avec un seul héros encore debout":"Win with only one hero still standing",
"Gardien de l’Éther":"Guardian of the Ether","Obtenir tous les autres trophées":"Earn every other trophy","Roi déchu":"Fallen king","Silence des loups":"Silence of the wolves","Pinces brisées":"Broken claws","Colosse abattu":"Colossus felled","Chute du chevalier":"Fall of the knight",
"Lumière du prisme":"Light of the prism","Cœur d’obsidienne":"Obsidian heart","Tombeau scellé":"Sealed tomb","Marais purifié":"Marsh cleansed","Ciel apaisé":"Calmed skies","Fin de l’hiver éternel":"End of the eternal winter","Gardiens de l’Éther":"Guardians of the Ether","Vaincre":"Defeat",
// ---------- carte ----------
"Carte I":"Map I","Carte II":"Map II","Bientôt":"Soon","🔒 Bats le boss précédent":"🔒 Defeat the previous boss","✓ Terminée":"✓ Complete","Région":"Region","Étape":"Stage","Boss":"Boss","niv":"lvl","Niv":"Lvl","étapes, la dernière est le boss · niveaux":"stages, the last is the boss · levels",
"Bats le Titan prismatique, dans les Cavernes de cristal, pour ouvrir la carte II.":"Defeat the Prismatic Titan, in the Crystal Caverns, to open Map II.","Région en préparation : elle arrivera dans une prochaine version.":"Region in progress: it will arrive in a future version.",
"Termine la région précédente (son boss compris) pour ouvrir celle-ci.":"Finish the previous region (its boss included) to open this one.","⛺ Camp":"⛺ Camp","Chargement…":"Loading…","Images introuvables":"Images not found","⏳ Survie":"⏳ Survival","♛ Chef":"♛ Chief",
// ---------- combat ----------
"Fin du tour":"End turn","Fuir":"Flee","Tour ennemi…":"Enemy turn…","Plus rien à faire : tour suivant…":"Nothing left to do: next turn…","Tours précédents":"Previous turns","Tours suivants":"Next turns","Vue entière":"Full view","⤢ Vue entière":"⤢ Full view",
"Objectif du combat":"Battle objective","♛ Objectif : abattre le chef":"♛ Objective: take down the chief","♛ Abats le chef":"♛ Take down the chief","Dernier tour !":"Last turn!","Dernier tour à tenir !":"Last turn to hold!","Dernière vague":"Last wave","Tiens encore":"Hold on for","Renfort":"Reinforcement","Élite !":"Elite!",
"Hors de portée":"Out of range","✓ À portée":"✓ In range","✓ Touché en visant une case voisine":"✓ Hit by aiming at a neighbouring tile","Aucun ennemi dans la zone":"No enemy in the area","aucune cible":"no target","Touche une case":"Tap a tile",
"Aucune cible d’ici : déplace-toi (cases à pastille) ou touche « Fin du tour ».":"No target from here: move (dotted tiles) or tap “End turn”.","Plus aucune action : touche « Fin du tour ».":"No actions left: tap “End turn”.","Touche « Fin du tour ».":"Tap “End turn”.",
"Bien joué ! Touche « Fin du tour ».":"Well played! Tap “End turn”.","Case à pastille : aperçu, retouche pour y aller. Ou choisis un sort.":"Dotted tile: preview, tap again to go there. Or choose a spell.",
"Touche une case bleue pour voir l’aperçu, retouche-la pour y aller.":"Tap a blue tile to preview, tap it again to move there.","Touche une cible, ou retouche le sort pour l’annuler.":"Tap a target, or tap the spell again to cancel it.",
"Choisis une autre cible, ou retouche le sort pour l’annuler.":"Choose another target, or tap the spell again to cancel it.","Touche ton héros pour confirmer, ou retouche le sort pour l’annuler.":"Tap your hero to confirm, or tap the spell again to cancel it.",
"Retouche pour lancer · retouche le sort pour annuler.":"Tap again to cast · tap the spell to cancel.","Retouche au même endroit pour lancer":"Tap the same spot again to cast","Retouche la case pour y aller.":"Tap the tile again to go there.",
"Aucun statut":"No status","Armure":"Armor","Bouclier":"Shield","Brûlure":"Burn","Poison":"Poison","Malédiction":"Curse","Maudit":"Cursed","Enraciné":"Rooted","Provoqué":"Taunted","Rempart":"Rampart","Obstacle":"Obstacle","Eau":"Water","Cases brûlantes":"Burning tiles","Dalles piégées":"Trapped flagstones",
"Rempart : dégâts réduits":"Rampart: damage reduced","Maudit : soins −50 %":"Cursed: healing −50%","enraciné : 1 PM au prochain tour":"rooted: 1 MP next turn","insensible au feu : pas de brûlure":"immune to fire: no burn","soins reçus −50 % pendant 2 tours":"healing received −50% for 2 turns",
"Potion de soin":"Healing potion","+1 potion de soin":"+1 healing potion","Potions":"Potions","Soin":"Heal","Attaque":"Attack","Dégâts":"Damage","Rang":"Rank","Max":"Max","Encore":"Again","Suivant":"Next","Passer":"Skip","Gagne":"Win",
"Maîtrise des sorts":"Spell mastery","Réinitialiser la maîtrise (gratuit":"Reset mastery (free","Touche encore pour rendre les points":"Tap again to refund the points","Disponible dans":"Available in","Active":"Active",
"Une spécialisation par héros, changeable gratuitement ici.":"One specialization per hero, freely changeable here.","Nouveaux sorts : Charge, Tir perforant, Soin collectif !":"New spells: Charge, Piercing Shot, Group Heal!",
// ---------- résultat ----------
"Victoire !":"Victory!","Victoire":"Victory","Défaite":"Defeat","Retraite":"Retreat","Aucun héros KO":"No hero KO","Combat suivant":"Next battle","Affronter le boss":"Face the boss","Réessayer":"Try again","Préparer au camp":"Prepare at camp","Retour à la carte":"Back to the map","Rejouer":"Replay",
"Taverne : récompense à réclamer":"Tavern: reward to claim","Touche le coffre":"Tap the chest","Quête terminée":"Quest complete","Contrat terminé":"Contract complete","récompense à la taverne":"reward at the tavern","Nouvelle zone":"New zone","vaincu !":"defeated!","étape":"stage","gagnée":"won",
"Rien n’est perdu : héros, objets et progression restent acquis.":"Nothing is lost: heroes, items and progress are kept.","Tu as quitté le combat":"You left the battle","héros KO":"heroes KO","ennemi encore debout":"enemy still standing","ennemis encore debout":"enemies still standing",
"Ton équipe est niveau":"Your team is level","ce combat niveau":"this battle is level","Une amélioration est abordable à la Forge.":"An upgrade is affordable at the Forge.","Un héros n’a pas encore de spécialisation.":"A hero has no specialization yet.",
"Rejouer une mission gagnée (Cristal de l’Éther) rapporte XP et or.":"Replaying a won mission (Ether Crystal) earns XP and gold.","or chez le Marchand).":"gold at the Merchant).","défi du jour réussi !":"daily challenge complete!",
"Objectif atteint":"Objective reached","le chef est abattu":"the chief is down","tu as tenu":"you held for","les survivants se replient":"the survivors retreat","Toutes les vagues éliminées : +25 % d’or":"All waves eliminated: +25% gold","🎯 Toutes les vagues éliminées : +25 % d’or":"🎯 All waves eliminated: +25% gold",
"(+50 %, premier 3 ★)":"(+50%, first 3 ★)","PV et dégâts en hausse.":"HP and damage up.","Niveau":"Level","tours":"turns","tour":"turn","dégâts":"damage","soins":"healing","or":"gold",
"Contrats du jour":"Daily contracts","Défi du jour":"Daily challenge","Réclamer":"Claim","✓ Reçu":"✓ Claimed","En cours":"In progress","Trois contrats par jour, et un défi difficile une fois par jour.":"Three contracts a day, and one hard challenge once a day.","Combattre":"Fight",
"Tu as déjà tous les objets !":"You already have every item!","Tu n’as aucun objet à vendre.":"You have no item to sell.","Aucun objet pour l’instant : gagne des combats pour en trouver.":"No items yet: win battles to find some.",
"Chaque niveau renforce le bonus de l’objet (+50 %). 3 niveaux au maximum.":"Each level boosts the item's bonus (+50%). 3 levels at most.","L’Académie":"The Academy",
// ---------- états et événements du combat (textes flottants) ----------
"Critique !":"Critical!","Contre-attaque !":"Counter-attack!","Dernier rempart !":"Last stand!","Contagion":"Contagion","Appel de la meute !":"Call of the pack!","Invocation !":"Summoning!","Repli !":"Retreat!","Combo":"Combo",
"Armure brisée +15 %":"Armor broken +15%","Attaque signature du boss évitée":"Boss signature attack avoided","Aucun chemin libre jusqu’à une case voisine":"No free path to a neighbouring tile","Aucun ennemi collé à toi":"No enemy next to you","Aucun héros à relever ici":"No hero to revive here",
"Bouclier de glace":"Ice shield","Carapace":"Shell","Case occupée ou bloquée":"Tile occupied or blocked","Ce n’est pas un allié":"Not an ally","Chargement du rayon…":"Charging the beam…","Chef":"Chief","Cible invalide":"Invalid target","Défense brisée":"Defense broken","Défense brisée ! +30 %":"Defense broken! +30%",
"Empoisonné":"Poisoned","Gel éternel !":"Eternal frost!","Glyphe posé":"Glyph placed","Hurlement":"Howl","Insensible au feu":"Immune to fire","Jugement céleste !":"Celestial judgment!","Ligne de tir bloquée":"Line of fire blocked","Malédiction du tombeau !":"Curse of the tomb!","Mur brisé !":"Wall broken!",
"Personne ici":"Nobody here","Personne à portée":"Nobody in range","Petite gelée":"Small slime","Phase":"Phase","Piège !":"Trap!","Piège posé":"Trap set","Provocation":"Taunt","Purifié":"Cleansed","Rayon prismatique":"Prismatic beam","Séisme":"Quake","Séisme !":"Quake!",
"Tous les héros à 50 % de PV ou plus":"All heroes at 50% HP or more","Toutes les vagues éliminées":"All waves eliminated","Trop près, portée min.":"Too close, min. range","Téléportation":"Teleport","Téléportation !":"Teleport!","Un obstacle bloque le tir":"An obstacle blocks the shot","Un obstacle haut bloque le tir":"A tall obstacle blocks the shot","cases, portée max.":"tiles, max range.",
"Fureur !":"Fury!","Spores toxiques !":"Toxic spores!","Fracas primordial !":"Primordial crash!","Surchauffe !":"Overheat!","Bouclier −":"Shield −","−1 PM":"−1 MP","Maudit":"Cursed","PV":"HP","PA":"AP","PM":"MP",
// ---------- introduction des boss ----------
"Appelle la meute":"Calls the pack","Se retranche sous sa carapace":"Hides in its shell","Fait trembler le sol":"Shakes the ground","Entre en fureur":"Flies into a rage","Charge un rayon de cristal":"Charges a crystal beam","Embrase la forteresse":"Sets the fortress ablaze",
"Maudit les intrus":"Curses intruders","Empoisonne le marais":"Poisons the marsh","Se téléporte":"Teleports","Se couvre de glace":"Covers itself in ice","Brise toute défense":"Shatters every defense","Un gardien redoutable":"A fearsome guardian",
// ---------- régions et boss ----------
"Prairie de Lande":"Heath Meadow","Bois sombre":"Dark Wood","Côte dorée":"Golden Coast","Monts gris":"Grey Peaks","Château en ruine":"Ruined Castle","Cavernes de cristal":"Crystal Caverns","Forteresse de braise":"Ember Fortress","Temple des sables":"Temple of Sands",
"Marais des âmes":"Marsh of Souls","Citadelle céleste":"Celestial Citadel","Terres du Givre Éternel":"Lands of Eternal Frost","Sanctuaire de l’Éther":"Ether Sanctuary",
"Roi Gelée":"Slime King","Loup alpha":"Alpha Wolf","Crabe royal":"Royal Crab","Golem ancien":"Ancient Golem","Chevalier noir":"Black Knight","Titan prismatique":"Prismatic Titan","Pharaon oublié":"Forgotten Pharaoh","Reine des marécages":"Swamp Queen","Roi du Givre":"Frost King","Briseur primordial":"Primordial Breaker",
// ---------- monstres ----------
"Gelée":"Slime","Sanglier":"Boar","Chauve-souris":"Bat","Champignon":"Mushroom","Loup":"Wolf","Squelette":"Skeleton","Crabe":"Crab","Mouette":"Gull","Golem":"Golem","Gelée toxique":"Toxic slime","Gobelin":"Goblin","Fantôme":"Ghost","Chevalier":"Knight","Chevalier bleu":"Blue knight","Chevalier rouge":"Red knight","Chevalier sombre":"Dark knight",
"Golem cristallin":"Crystal golem","Araignée de quartz":"Quartz spider","Chauve-souris prismatique":"Prismatic bat","Élémentaire de feu":"Fire elemental","Chevalier d’obsidienne":"Obsidian knight","Salamandre de lave":"Lava salamander","Gardien momifié":"Mummified guardian","Scorpion doré":"Golden scorpion","Sentinelle antique":"Ancient sentinel",
"Crapaud venimeux":"Venomous toad","Ent corrompu":"Corrupted ent","Spectre des marais":"Marsh wraith","Gardien céleste":"Celestial guardian","Griffon royal":"Royal griffin","Sentinelle astrale":"Astral sentinel","Double astral":"Astral double","Loup polaire":"Polar wolf","Yéti":"Yeti","Élémentaire de givre":"Frost elemental","Éclat de givre":"Frost shard",
"Aberration d’Éther":"Ether aberration","Chevalier de l’Éther":"Ether knight","Gardien du Sanctuaire":"Sanctuary guardian","Éclat d’éther":"Ether shard","Clone de la Reine":"Queen's clone","élite":"elite","Chef":"Chief",
// ---------- classes, emplacements, raretés, caractéristiques ----------
"Guerrier":"Warrior","Archer":"Archer","Soigneuse":"Healer","Mage":"Mage","Assassin":"Assassin","Paladine":"Paladin","Arme":"Weapon","Bijou":"Jewel","Accessoire":"Accessory","Commun":"Common","Rare":"Rare","Épique":"Epic","Force":"Strength","Intelligence":"Intelligence","Vitalité":"Vitality","Agilité":"Agility",
"épées, arcs, bâtons":"swords, bows, staves","armures, tenues, robes, casques, capes":"armor, outfits, robes, helmets, cloaks","anneaux, colliers, bracelets":"rings, necklaces, bracelets","boucliers, bottes, gants, ceintures, reliques, livres":"shields, boots, gloves, belts, relics, books","tous les héros":"all heroes",
// ---------- spécialisations ----------
"Berserker":"Berserker","Gardien":"Guardian","Briseur":"Breaker","Tireur":"Marksman","Éclaireur":"Scout","Guérisseuse":"Healer","Druide":"Druid","Enchanteresse":"Enchantress","Pyromancien":"Pyromancer","Cryomancien":"Cryomancer","Arcaniste":"Arcanist","Ombre":"Shadow","Venimeuse":"Venomous","Duelliste":"Duelist","Sentinelle":"Sentinel","Justicière":"Justiciar","Luminière":"Lightbringer",
// ---------- sorts ----------
"Taillade":"Slash","Fracas":"Smash","Tir":"Shot","Volée":"Volley","Piège":"Trap","Renaissance":"Rebirth","Potion":"Potion","Bottes ailées":"Winged boots","Bottes":"Boots","Épine":"Thorn","Charge":"Charge","Tir perforant":"Piercing shot","Soin collectif":"Group heal","Flèche toxique":"Toxic arrow","Toxique":"Toxic","Repli acrobatique":"Acrobatic retreat","Repli":"Retreat",
"Flèche glaciale":"Frost arrow","Glaciale":"Frost","Flèche explosive":"Explosive arrow","Explosive":"Explosive","Pluie céleste":"Celestial rain","Pluie":"Rain","Aura":"Aura","Projectile arcanique":"Arcane bolt","Arcane":"Arcane","Flamme":"Flame","Givre":"Frost","Boule de feu":"Fireball","Mur de glace":"Ice wall","Mur":"Wall","Téléportation courte":"Short teleport","Saut":"Leap",
"Affaiblissement":"Weaken","Affaiblir":"Weaken","Explosion":"Explosion","Glyphe":"Glyph","Bouclier magique":"Magic shield","Purification":"Purification","Purif.":"Purif.","Racines":"Roots","Rayon lunaire":"Moonbeam","Rayon":"Beam","Bénédiction ancienne":"Ancient blessing","Bénédiction":"Blessing","Tourbillon":"Whirlwind","Brise-armure":"Armor breaker","Brise":"Break",
"Provoc.":"Taunt","Contre-attaque":"Counter-attack","Contre":"Counter","Rage guerrière":"War rage","Rage":"Rage","Jugement du lion":"Lion's judgment","Jugement":"Judgment","Tempête arcanique":"Arcane storm","Tempête":"Storm","Dague":"Dagger","Frappe de dos":"Backstab","Dos":"Back","Pas d’ombre":"Shadow step","Fumigène":"Smoke bomb","Fumi.":"Smoke",
"Marque":"Mark","Lame double":"Twin blades","Double":"Twin","Esquive active":"Active dodge","Exécution":"Execution","Exécut.":"Exec.","Danse des ombres":"Shadow dance","Danse":"Dance","Marteau":"Hammer","Protection":"Protection","Protec.":"Protect","Lumière":"Light","Interception":"Interception","Intercep.":"Intercept","Purge":"Purge","Impact sacré":"Holy impact","Impact":"Impact",
"Aura défensive":"Defensive aura","Égide":"Aegis","Soin de secours":"Rescue heal","Secours":"Rescue","Serment":"Oath","Bastion":"Bastion",
};
// objets (noms) : ajoutés à part pour garder le dictionnaire lisible
Object.assign(EN,{"Épée courte":"Short sword","Hache de guerre":"War axe","Bouclier rond":"Round shield","Heaume":"Helm","Arc long":"Longbow","Armure de cuir":"Leather armor","Bottes de cuir":"Leather boots","Bâton de saule":"Willow staff","Anneau de rubis":"Ruby ring","Amulette":"Amulet",
"Épée de recrue":"Recruit's sword","Arc du pisteur":"Tracker's bow","Bâton du guérisseur":"Healer's staff","Cuirasse de garde":"Guard's cuirass","Cuir du voyageur":"Traveler's leather","Robe de l’apprentie":"Apprentice's robe","Anneau de vigueur":"Ring of vigor","Bracelet de précision":"Bracelet of precision","Bouclier du rempart":"Rampart shield","Bottes du marcheur":"Walker's boots",
"Gants de combat":"Combat gloves","Grimoire de l’aube":"Grimoire of dawn","Lame d’acier bleu":"Blue steel blade","Épée dorée":"Golden sword","Arc de chasse":"Hunting bow","Arc sylvestre":"Sylvan bow","Bâton d’écorce":"Bark staff","Sceptre cristallin":"Crystal scepter","Cuirasse à épaulières":"Pauldron cuirass","Armure du lion":"Lion armor","Bouclier du lion":"Lion shield",
"Heaume de duelliste":"Duelist's helm","Heaume à plume":"Plumed helm","Heaume du commandant":"Commander's helm","Cuir sombre":"Dark leather","Tenue elfique":"Elven outfit","Robe d’améthyste":"Amethyst robe","Robe de l’aube":"Robe of dawn","Cape de voyage":"Travel cloak","Cape forestière":"Forest cloak","Cape d’archimage":"Archmage's cloak","Anneau de saphir":"Sapphire ring",
"Anneau d’émeraude":"Emerald ring","Collier de lune":"Moon necklace","Collier du soleil":"Sun necklace","Collier de turquoise":"Turquoise necklace","Bracelet clouté":"Studded bracelet","Bracelet d’émeraude":"Emerald bracelet","Bottes ailées d’argent":"Silver winged boots","Bottes ailées dorées":"Golden winged boots","Gantelets d’acier":"Steel gauntlets","Gantelets dorés":"Golden gauntlets",
"Ceinture de cuir":"Leather belt","Ceinture feuillue":"Leafy belt","Ceinture de parade":"Parade belt","Relique de bois":"Wooden relic","Relique d’argent":"Silver relic","Relique ailée":"Winged relic","Livre de voyage":"Travel book","Grimoire violet":"Violet grimoire","Cristal ardent":"Burning crystal","Cristal de glace":"Ice crystal","Emblème ailé":"Winged emblem",
"Lame de l’ombre":"Shadow blade","Lame du crépuscule":"Twilight blade","Cuir des ombres":"Shadow leather","Cape de la nuit":"Night cloak","Bracelet du duelliste":"Duelist's bracelet","Anneau du voile":"Ring of the veil","Bottes du rôdeur":"Prowler's boots","Gants de l’assassin":"Assassin's gloves","Épée du serment":"Oath sword","Épée de l’aurore":"Sword of dawn",
"Cuirasse de la sentinelle":"Sentinel's cuirass","Armure du bastion":"Bastion armor","Collier du serment":"Oath necklace","Collier de la lumière":"Necklace of light","Bouclier de la gardienne":"Guardian's shield","Relique de l’aurore":"Relic of dawn","Lame de l’honneur":"Blade of honor","Sceptre de la voix claire":"Scepter of the clear voice",
"Arc du serment commun":"Bow of the shared oath","Orbe du serment commun":"Orb of the shared oath","Lames du serment commun":"Blades of the shared oath","Épée du serment commun":"Sword of the shared oath","Médaille du village":"Village medal","Lame du vétéran":"Veteran's blade","Cuirasse du capitaine":"Captain's cuirass","Bracelet de guerre":"War bracelet",
"Bouclier de la garde":"Guard shield","Épée du champion":"Champion's sword","Armure du lion d’or":"Golden lion armor","Bracelet du conquérant":"Conqueror's bracelet","Écu du grand maître":"Grand master's shield","Arc du grand chasseur":"Great hunter's bow","Tenue du ranger":"Ranger's outfit","Bracelet d’archer":"Archer's bracelet","Bottes du traqueur":"Stalker's boots",
"Arc de l’aigle":"Eagle bow","Cuir du maître-archer":"Master archer's leather","Bracelet du faucon":"Falcon bracelet","Bottes du vent":"Wind boots","Sceptre de lumière":"Scepter of light","Robe du soleil levant":"Rising sun robe","Collier de pleine lune":"Full moon necklace","Livre de prières":"Prayer book","Bâton de vie":"Staff of life","Cape de la grande prêtresse":"High priestess's cloak",
"Collier d’étoile":"Star necklace","Grimoire sacré":"Sacred grimoire","Bâton d’écorce runique":"Runic bark staff","Robe de l’érudit":"Scholar's robe","Anneau du mage":"Mage's ring","Livre d’études":"Study book","Sceptre arcanique":"Arcane scepter","Cape de l’arcaniste":"Arcanist's cloak","Anneau d’arcaniste":"Arcanist's ring","Grimoire d’arcane":"Arcane grimoire",
"Sceptre de l’Éther":"Ether scepter","Bâton du serment commun":"Staff of the shared oath"});
// V5.01 : compléments relevés par tools/en-audit.mjs (textes composés : le moteur remplace expression par expression, plus longues d'abord)
Object.assign(EN,{"ton équipe":"your team","À faire":"To do","expéditions et revanches":"expeditions and rematches","réserve":"reserve","En réserve (sans effet)":"In reserve (no effect)","en réserve, sans effet":"in reserve, no effect","porté par":"worn by","requis":"required",
"Aucune spécialisation":"No specialization","aucune spécialisation":"no specialization","Choisis une voie pour ce héros.":"Choose a path for this hero.","S’ouvre au niveau 3.":"Opens at level 3.","à choisir":"to choose","disponible":"available",
"points à répartir · 1 point par niveau et par héros":"points to spend · 1 point per level per hero","point à répartir · 1 point par niveau et par héros":"point to spend · 1 point per level per hero","points à répartir":"points to spend","À apprendre":"To learn",
"sort appris au niveau":"spell learned at level","au niveau":"at level","niveau":"level","niveaux":"levels","fois par combat":"time per battle","1 fois par combat":"once per battle",
"objets sur":"items out of","La Forge":"The Forge","Le Marchand":"The Merchant","La Taverne":"The Tavern","Entraînement":"Training","avec":"with","Bonus de soin":"Healing bonus","Bonus de dégâts":"Damage bonus","Bonus de":"Bonus to",
"Nouveaux objets chaque jour. Les potions se boivent en combat (4 PA, 1 par héros et par combat).":"New items every day. Potions are drunk in battle (4 AP, 1 per hero per battle).","Revente : la moitié du prix et de l’or mis dans la forge.":"Resale: half the price and the gold put into the forge.",
"Soigne 40 % des PV · tu en as":"Heals 40 % of HP · you have","Soigne":"Heals","tu en as":"you have","Une spécialisation par héros, changeable gratuitement ici.":"One specialization per hero, freely changeable here.","Ses talents s’ajoutent aux niveaux":"Its talents are added at levels",
"Plus d’ennemis et plus forts. Récompense : double or, une potion et un objet garanti s’il en reste.":"More and tougher enemies. Reward: double gold, a potion and a guaranteed item if any remain.","Réussi aujourd’hui. Reviens demain !":"Done today. Come back tomorrow!",
"points libres sur":"free points out of","point libre sur":"free point out of","1 point tous les 2 niveaux":"1 point every 2 levels","prochain au niveau":"next at level","Rang II : 2 points, rang III : 3 de plus. Impossible de tout maîtriser : choisis. Réinitialisation gratuite.":"Rank II: 2 points, rank III: 3 more. You cannot master everything: choose. Free reset.",
"Réinitialiser la maîtrise (gratuit)":"Reset mastery (free)","Actuel :":"Current:","effet de base":"base effect","case de portée":"tile of range","cases de portée":"tiles of range","et":"and","réduction":"reduction","au lieu de":"instead of","PV du mur":"wall HP","soins":"healing","bouclier":"shield",
"1 fois par combat ·":"once per battle ·","tous les 2 niveaux":"every 2 levels"});
Object.assign(EN,EN_DESC); // V4.90 : descriptions des sorts et des talents
// V5.0 : quêtes, intros de boss, libellés du tutoriel ; les textes à balises (tutoriel, astuces, objectifs) passent par trh() car le
// MutationObserver ne voit que des morceaux de texte entre les balises <b> et <br>.
Object.assign(EN,EN_Q,{"Tutoriel":"Tutorial","Nouveau":"New","Compris !":"Got it!","Un gardien redoutable":BOSS_DEFAULT_EN});
for(const k in TIPS_T)EN[TIPS_T[k]]=TIPS_T_EN[k];
const HTML=new Map();
const zip=(a,b)=>a.forEach((s,i)=>HTML.set(s,b[i]));
zip(TUTO,TUTO_EN);for(const k in TIPS)zip(TIPS[k],TIPS_EN[k]);
export const regHtml=(fr,en)=>{HTML.set(fr,en)};
// V5.10a : PA reportés / gardés (bouton Fin du tour et texte flottant) restaient à moitié en français
Object.assign(EN,{'Langue':'Language','PA reporté':'AP carried over','PA gardés':'AP kept','PA gardé':'AP kept'});
export const trh=s=>language==='en'&&HTML.has(s)?HTML.get(s):s;
// ---------- moteur ----------
let language='fr';
export const TEXT_CATALOGS=Object.freeze({
 en:EN, de:DE, 'zh-Hans':Object.freeze({...ZH_GLOSSARY,
  'Langue':'语言','Partir à l’aventure':'出发冒险','💾 Sauvegarde':'💾 存档',
  '♪ Musique':'♪ 音乐','🔊 Sons':'🔊 声音','Volume musique':'音乐音量',
  'Volume bruitages':'音效音量','Volume voix':'语音音量','Revoir le tutoriel':'重看教程',
  'Recommencer à zéro':'重新开始','Compris !':'明白了！',
  '⚡ Animations rapides : oui':'⚡ 快速动画：开启','⚡ Animations rapides : non':'⚡ 快速动画：关闭',
  '🎨 Graphismes : Faible':'🎨 画质：低','🎨 Graphismes : Moyen':'🎨 画质：中','🎨 Graphismes : Haut':'🎨 画质：高',
  'Copier':'复制','Copié !':'已复制！','Importer':'导入','Exporter (fichier)':'导出文件',
  'Importer (fichier)':'导入文件','Copie de secours':'备份','Fichier exporté.':'文件已导出。',
 }),
});
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
let RX=null;
const EXACT=new Set(['or','Or']); // « or » = la monnaie : texte entier, ou « 340 or » (règle à part), jamais au milieu d'une phrase
function rx(){if(RX)return RX;const keys=Object.keys(EN).filter(k=>k.length>=2&&!EXACT.has(k)).sort((a,b)=>b.length-a.length);
 RX=new RegExp('(?<![\\p{L}\\p{N}])('+keys.map(esc).join('|')+')(?![\\p{L}])','gu');return RX}
// traduit une chaîne (texte entier d'abord, sinon expression par expression) ; renvoie la chaîne telle quelle en français
export function tr(s){if(language==='fr'||!s||typeof s!=='string')return s;const t=s.trim();if(!t)return s;
 const dict=TEXT_CATALOGS[language];
 if(Object.hasOwn(dict,t))return s.replace(t,()=>dict[t]);
 if(language!=='en')return s;
 if(!/[A-Za-zÀ-ÿ]/.test(t))return s;
 return s.replace(rx(),m=>EN[m]??m).replace(/(\d) or\b(?! \d)/g,'$1 gold')}
const ATTRS=['aria-label','title','placeholder'];
const IGNORE='script,style,#story,[data-no-translate]';
const translated=new WeakMap();
function translateNode(n,key,value,write){
 let last=translated.get(n);
 if(!last){last=new Map();translated.set(n,last)}
 const previous=last.get(key);
 if(previous?.output===value&&previous.language===language)return;
 const source=previous?.output===value?previous.source:value;
 const output=tr(source);
 last.set(key,{source,output,language});
 if(output!==value)write(output);
}
function translateAttribute(n,a){
 if(n.hasAttribute(a))translateNode(n,a,n.getAttribute(a),v=>n.setAttribute(a,v));
}
function walk(n){
 if(n.nodeType===3){
  if(!n.parentElement?.closest(IGNORE))translateNode(n,'text',n.data,v=>{n.data=v});
  return;
 }
 if(n.nodeType!==1||n.closest(IGNORE))return;
 for(const a of ATTRS)translateAttribute(n,a);
 for(const child of n.childNodes)walk(child);
}
let MO=null;
export function setLang(lang){
 language=normalizeLanguage(lang);
 if(typeof document==='undefined')return;
 document.documentElement.lang=language;
 if(MO){MO.disconnect();MO=null}
 walk(document.body);
 if(language==='fr'||typeof MutationObserver==='undefined')return;
 MO=new MutationObserver(records=>{
  for(const m of records){
   if(m.type==='characterData')walk(m.target);
   else if(m.type==='attributes'){
    if(!m.target.closest(IGNORE))translateAttribute(m.target,m.attributeName);
   }else for(const n of m.addedNodes)walk(n);
  }
 });
 MO.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
}
