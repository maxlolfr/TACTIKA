const AFFIXES = {
 'zh-Hans': {
  berserk:['狂战','生命值低于50%时，伤害 ×1.35。集中火力将其打到半血以下并迅速击倒，或先施加虚弱。'],
  garde:['守护','2格以内的其他友军受到的伤害降低30%。优先击倒它，或将其友军推远。'],
  regen:['再生','回合开始时恢复8%生命值，每场战斗最多恢复40%。灼烧时无法恢复，受诅咒时恢复量减半。'],
  bombe:['爆裂','有英雄进入3格以内时，它会蓄爆、停止移动，并标记周围共9格。它在自己的下回合开始时引爆。及时撤离或先击倒它来解除爆炸。'],
  vamp:['吸血','治疗量为所造成伤害的40%，每场战斗最多恢复50%生命值。灼烧时无法恢复，受诅咒时恢复量减半。'],
  venin:['剧毒','攻击使目标中毒，持续3回合，每回合造成该次攻击伤害的30%。仅保留最强的毒素，可用净化移除。'],
 },
 de: {
  berserk:['Berserker','Unter 50 % LP: Schaden ×1,35. Bring ihn mit konzentriertem Schaden unter die Hälfte und erledige ihn oder schwäche ihn.'],
  garde:['Wächter','Andere Verbündete in bis zu 2 Feldern Entfernung erleiden 30 % weniger Schaden. Besiege ihn zuerst oder stoße seine Verbündeten weg.'],
  regen:['Regenerator','Zu Zugbeginn heilt er 8 % seiner LP, höchstens 40 % pro Kampf. Brennend erhält er keine Heilung, verflucht nur die Hälfte.'],
  bombe:['Explosiv','Bei einem Helden in bis zu 3 Feldern Entfernung lädt er sich auf, bleibt stehen und markiert 9 Felder um sich herum. Er explodiert zu Beginn seines nächsten Zugs. Verlass die Felder oder besiege ihn vorher, um ihn zu entschärfen.'],
  vamp:['Vampirisch','Heilt sich um 40 % seines verursachten Schadens, insgesamt höchstens 50 % seiner LP pro Kampf. Brennend erhält er keine Heilung, verflucht nur die Hälfte.'],
  venin:['Giftig','Seine Treffer vergiften 3 Züge lang. Pro Zug entstehen 30 % des Trefferschadens. Das stärkste Gift bleibt aktiv. Reinigung entfernt es.'],
 },
};

export const eliteAffix=(locale,id)=>AFFIXES[locale]?.[id];

export const ELITE_UI = {
 'zh-Hans': {
  champion:'冠军（2项能力）', title:'冠军', rage:'狂怒：伤害 ×1.35',
  regen:(used,max)=>`已恢复 ${used}/${max}`,
  drain:(used,max)=>`已吸血 ${used}/${max}`,
  primed:'蓄爆完成：下回合引爆', cooldown:n=>`充能中（${n}回合）`,
 },
 de: {
  champion:'Champion (2 Fähigkeiten)', title:'Champion', rage:'RASEREI: Schaden ×1,35',
  regen:(used,max)=>`Regeneriert ${used}/${max}`,
  drain:(used,max)=>`Abgesaugt ${used}/${max}`,
  primed:'AUFGELADEN: explodiert im nächsten Zug', cooldown:n=>`Lädt sich auf (${n} Züge)`,
 },
};

export function eliteName(locale,unit,translate){
 const ui=ELITE_UI[locale];
 if(!ui)return unit.n;
 const tag=unit.tag&&unit.n.endsWith(' '+unit.tag)?' '+unit.tag:'';
 const name=tag?unit.n.slice(0,-tag.length):unit.n;
 if(!unit.mods?.length)return translate(name)+tag;
 const index=name.lastIndexOf(' (');
 if(index<0)return translate(name)+tag;
 const affixes=unit.mods.map(id=>eliteAffix(locale,id)?.[0]??id).join(', ');
 return translate(name.slice(0,index))+' ('+(unit.champ?ui.title+': ':'')+affixes+')'+tag;
}

export const ELITE_TEXTS = {
 'Régénération bloquée':['再生被阻止','Regeneration blockiert'],
 'Drain bloqué':['吸血被阻止','Lebensraub blockiert'],
 'Explosion !':['爆炸！','Explosion!'],
 'Désamorcé !':['已解除爆炸！','Entschärft!'],
 'Élite !':['精英！','Elite!'],
 'Champion !':['冠军！','Champion!'],
};
