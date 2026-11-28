export const VILLAGE_TEXTS = {
 'Chaque niveau renforce le bonus de l’objet (+50 %). 3 niveaux au maximum.':['每次强化使装备加成提高50%，最多强化3次。','Jede Aufwertung erhöht den Gegenstandsbonus um 50 %. Maximal 3 Aufwertungen.'],
 'Aucun objet pour l’instant : gagne des combats pour en trouver.':['暂时没有装备，赢得战斗即可获得。','Noch keine Gegenstände. Gewinne Kämpfe, um welche zu finden.'],
 'En réserve (sans effet)':['在背包中（未生效）','In Reserve (ohne Wirkung)'],
 'maximum':['已达上限','Maximum'],
 'Max':['上限','Max.'],
 'Nouveaux objets chaque jour. Les potions se boivent en combat (4 PA, 1 par héros et par combat).':['每天供应新装备。药水可在战斗中饮用（消耗4行动点，每名英雄每场战斗限用1次）。','Jeden Tag gibt es neue Gegenstände. Tränke werden im Kampf getrunken (4 AP, einmal pro Held und Kampf).'],
 'Revente : la moitié du prix et de l’or mis dans la forge.':['出售可收回售价和强化花费的一半。','Beim Verkauf erhältst du die Hälfte des Preises und der Schmiedekosten zurück.'],
 'Tu n’as aucun objet à vendre.':['没有可出售的装备。','Du hast keine Gegenstände zum Verkaufen.'],
 'Tu as déjà tous les objets !':['你已拥有全部装备！','Du besitzt bereits alle Gegenstände!'],
 'La Taverne':['酒馆','Taverne'],
 'Trois contrats par jour, et un défi difficile une fois par jour.':['每天有三份委托，以及一次高难度挑战。','Jeden Tag gibt es drei Aufträge und eine schwierige Tagesherausforderung.'],
 'Contrats du jour':['每日委托','Tagesaufträge'],
 'Récompense à la taverne':['前往酒馆领取奖励','Belohnung in der Taverne'],
 'Contrat terminé':['委托完成','Auftrag abgeschlossen'],
 '✓ Reçu':['✓ 已领取','✓ Erhalten'],
 'Bats un boss (même déjà vaincu)':['击败一名首领（可重复挑战）','Besiege einen Boss (auch einen bereits besiegten)'],
 'Réussi aujourd’hui. Reviens demain !':['今日已完成，明天再来！','Heute abgeschlossen. Komm morgen wieder!'],
 'Plus d’ennemis et plus forts. Récompense : double or, une potion et un objet garanti s’il en reste.':['敌人更多、更强。奖励：双倍金币、一瓶药水，以及一件尚未获得的装备（如有）。','Mehr und stärkere Gegner. Belohnung: doppeltes Gold, ein Trank und ein garantierter Gegenstand, falls noch einer übrig ist.'],
 'Combattre':['战斗','Kämpfen'],
};

export const VILLAGE_UI = {
 'zh-Hans': {
  gold:n=>`${n}金币`, items:(n,total)=>`装备 ${n}/${total}`,
  potion:(n,max)=>`恢复40%生命值 · 持有 ${n}/${max}`,
  quests:(n,total)=>`任务 · ${n}/${total}`,
  wins:n=>`赢得${n}场战斗`, kills:(n,enemy)=>`击败${n}只「${enemy}」`,
  stars:n=>`以3星成绩完成${n}场战斗`,
  reward:(gold,xp)=>`${gold}金币，${xp}经验`,
  challenge:(zone,level)=>`${zone} · ${level}级`,
 },
 de: {
  gold:n=>`${n} Gold`, items:(n,total)=>`${n}/${total} Gegenstände`,
  potion:(n,max)=>`Heilt 40 % der LP · Vorrat ${n}/${max}`,
  quests:(n,total)=>`Aufgaben · ${n}/${total}`,
  wins:n=>`Gewinne ${n} ${n===1?'Kampf':'Kämpfe'}`, kills:(n,enemy)=>`Besiege ${n} Gegner vom Typ „${enemy}“`,
  stars:n=>`Gewinne ${n} ${n===1?'Kampf':'Kämpfe'} mit 3 ★`,
  reward:(gold,xp)=>`${gold} Gold, ${xp} EP`,
  challenge:(zone,level)=>`${zone} · Stufe ${level}`,
 },
};

export function contractLabel(locale,contract,enemy){
 if(locale==='en'){
  const {k,n}=contract,battles=n===1?'battle':'battles';
  if(k==='win')return `Win ${n} ${battles}`;
  if(k==='kill')return `Defeat ${n} ${n===1?'enemy':'enemies'} of this type: ${enemy}`;
  if(k==='star')return `Win ${n} ${battles} with 3 stars`;
  return 'Defeat a boss. Rematches count.';
 }
 const text=VILLAGE_UI[locale];
 if(!text)return;
 if(contract.k==='win')return text.wins(contract.n);
 if(contract.k==='kill')return text.kills(contract.n,enemy);
 if(contract.k==='star')return text.stars(contract.n);
 return VILLAGE_TEXTS['Bats un boss (même déjà vaincu)'][locale==='de'?1:0];
}

export const COMBAT_HELP = {
 'zh-Hans': '每名英雄有6<span class="pa">行动点</span>（施放技能）和3<span class="pm">移动点</span>（移动格数）。<br>• 每剩余2行动点，下回合多获得1点，最多额外获得2点。<br>• 目标太远时，预览会显示英雄先移动再施放技能。<br>• 齐射：红色区域显示受影响的格子；中心点必须在射程内。<br>• 芬恩的箭可以越过灌木、碎石、树桩和箱子等低矮障碍，但无法越过大树、岩石和墙。<br>• 点选<b style="color:#6ab0ff">蓝色格子</b>查看预览，再点一次即可移动。<br>• 选择技能后，点选目标查看伤害，再点一次即可施放。灰色格子不在视野内，路径被障碍物或角色挡住。<br>• 点击「结束回合」交给下一位行动者。<br>• 双指张开可放大棋盘，拖动可平移（鼠标可用滚轮）。点「全景视图」恢复。<br>• 怪物头顶的红色气泡显示它将攻击谁、造成多少伤害。<br>• 凯尔的重击击退2格。撞上障碍物或其他怪物时，每受阻一格造成5点伤害。<br>• 连击：在同一个敌人行动前，用2或3名英雄攻击它（伤害依次额外提高15%和30%）。<br>• ★ 获胜，★ 无英雄倒地，★ 5回合内获胜（首领战为7回合）。首次获得3星奖励额外50%金币。<br>• 在营地用金币强化装备，最多强化3次。<br>• 在地图上，每个区域有3场战斗，随后是解锁下一区域的首领。可重玩已获胜的战斗来获得经验。',
 de: 'Jeder Held hat 6 <span class="pa">AP</span> für Zauber und 3 <span class="pm">BP</span> für Bewegung.<br>• Je 2 unverbrauchte AP geben im nächsten Zug 1 zusätzlichen AP, höchstens 2.<br>• Ist das Ziel zu weit weg, zeigt die Vorschau, wie der Held vor dem Wirken näher heranrückt.<br>• Salve: Der rote Bereich zeigt die getroffenen Felder. Die Reichweite begrenzt die Position der Mitte.<br>• Fenns Pfeile fliegen über niedrige Hindernisse wie Büsche, Steine, Stümpfe oder Kisten, aber nicht über Bäume, Felsen und Mauern.<br>• Tippe auf ein <b style="color:#6ab0ff">blaues Feld</b> für die Vorschau. Tippe erneut, um dich dorthin zu bewegen.<br>• Wähle einen Zauber und tippe ein Ziel an, um den Schaden zu sehen. Tippe erneut, um den Zauber zu wirken. Graue Felder liegen nicht in Sichtweite, weil Hindernisse oder Figuren den Blick versperren.<br>• Mit „Zug beenden“ kommt die nächste Figur an die Reihe.<br>• Ziehe zwei Finger auseinander, um das Spielfeld zu vergrößern, und wische zum Verschieben. Mit der Maus kannst du das Mausrad nutzen. „Gesamtansicht“ setzt die Ansicht zurück.<br>• Die rote Blase über einem Monster zeigt sein Angriffsziel und den erwarteten Schaden.<br>• Kaels Wuchtschlag stößt 2 Felder zurück. Bei einer Kollision mit einem Hindernis oder Monster entstehen 5 Schaden pro blockiertem Feld.<br>• Kombo: Greife denselben Gegner vor seinem Zug mit 2 oder 3 Helden an (+15 %, dann +30 %).<br>• ★ Sieg, ★ kein Held kampfunfähig, ★ Sieg in 5 Zügen (7 bei Bossen). Die ersten 3 ★ geben 50 % zusätzliches Gold.<br>• In der Schmiede im Lager wertest du Gegenstände mit verdientem Gold auf. Maximal 3 Aufwertungen.<br>• Auf der Karte folgen pro Gebiet auf 3 Kämpfe ein Boss, der das nächste Gebiet öffnet. Wiederhole gewonnene Kämpfe, um EP zu sammeln.',
};
