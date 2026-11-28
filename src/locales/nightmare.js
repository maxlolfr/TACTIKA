const messages = [
 ['☠ Campagne du Cauchemar','☠ 噩梦战役','☠ Albtraumkampagne'],
 ['Régions 1 à 6 (monstres niveau 50, champions et élites, boss compris ; élites Vampiriques et Venimeuses dès la région 4). Ensuite, les boss pilotes s’éveillent ici, l’un après l’autre.','第1至第6区域的怪物均为50级，含冠军、精英和首领。第4区域起会出现吸血精英和剧毒精英。之后，试炼首领将在这里依次苏醒。','Regionen 1 bis 6 mit Monstern der Stufe 50, Champions und Eliten, einschließlich der Bosse. Ab Region 4 gibt es auch vampirische und giftige Eliten. Danach erwachen hier nacheinander die Pilotbosse.'],
 ['Termine les régions 1 à 6 du Cauchemar','完成噩梦战役的第1至第6区域','Schließe die Albtraumregionen 1 bis 6 ab'],
 ['Réaffronter','再次挑战','Erneut antreten'],
 ['🌅 Revenir au monde de Lande','🌅 返回兰德世界','🌅 Zurück in die Welt von Lande'],
 ['Bac à sable (?cauchemar) : sauvegarde à part, tout est ouvert.','沙盒模式（?cauchemar）：独立存档，全部解锁。','Sandbox (?cauchemar): separater Spielstand, alles freigeschaltet.'],
 ['☠ Le Cauchemar','☠ 噩梦','☠ Der Albtraum'],
 ['Le Cristal montre l’autre face de Lande : les mêmes terres, plus sombres et bien plus dangereuses. Ton équipe, ton or et ton équipement te suivent ; la progression du Cauchemar est gardée à part.','水晶映出兰德的另一面：还是那片土地，却更加阴暗和危险。队伍、金币和装备都会随你前往，噩梦进度单独保存。','Der Kristall zeigt die andere Seite von Lande: dieselben Länder, aber dunkler und weit gefährlicher. Dein Team, dein Gold und deine Ausrüstung kommen mit. Dein Fortschritt im Albtraum wird separat gespeichert.'],
 ['☠ Entrer dans le Cauchemar','☠ 进入噩梦','☠ Den Albtraum betreten'],
 ['🔒 Quelque chose remue dans le Cristal… Termine l’histoire (épilogue) pour l’éveiller.','🔒 水晶里有什么在动……完成剧情直到尾声，就能唤醒它。','🔒 Etwas regt sich im Kristall … Schließe die Geschichte bis zum Epilog ab, um es zu wecken.'],
 ['Missions du Cauchemar','噩梦关卡','Albtraummissionen'],
 ['Gagne un combat du Cauchemar sur la carte pour le rejouer ici.','在地图上赢得一场噩梦战斗，就可以在这里重玩。','Gewinne auf der Karte einen Albtraumkampf, um ihn hier erneut zu spielen.'],
 ['☠ Boss du Cauchemar · deux élites à ses côtés, phase plus tôt','☠ 噩梦首领 · 两名精英随行，更早切换阶段','☠ Albtraumboss · zwei Eliten an seiner Seite, früherer Phasenwechsel'],
 ['☠ Boss du Cauchemar · une élite à ses côtés, phase plus tôt','☠ 噩梦首领 · 一名精英随行，更早切换阶段','☠ Albtraumboss · eine Elite an seiner Seite, früherer Phasenwechsel'],
 ['☠ Cauchemar · un champion, deux élites, ennemis renforcés','☠ 噩梦 · 一名冠军、两名精英，敌人已强化','☠ Albtraum · ein Champion, zwei Eliten, verstärkte Gegner'],
 ['☠ Cauchemar · deux élites, ennemis renforcés','☠ 噩梦 · 两名精英，敌人已强化','☠ Albtraum · zwei Eliten, verstärkte Gegner'],
];

export const nightmareTexts=index=>Object.fromEntries(messages.map(row=>[row[0],row[index]]));
