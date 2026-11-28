export const MAP_TEXTS = {
 'Bientôt':['即将推出','Demnächst'],
 '🔒 Bats le boss précédent':['🔒 击败上一区域的首领','🔒 Besiege den vorherigen Boss'],
 '✓ Terminée':['✓ 已完成','✓ Abgeschlossen'],
 '⏳ Survie':['⏳ 生存','⏳ Überleben'],
 '♛ Chef':['♛ 首领','♛ Anführer'],
 'Bats le Titan prismatique, dans les Cavernes de cristal, pour ouvrir la carte II.':['击败水晶洞窟的棱晶泰坦，即可解锁地图II。','Besiege den Prismentitan in den Kristallhöhlen, um Karte II freizuschalten.'],
 'Région en préparation : elle arrivera dans une prochaine version.':['该区域仍在开发中，将在后续版本推出。','Dieses Gebiet ist in Arbeit und folgt in einer späteren Version.'],
 'Termine la région précédente (son boss compris) pour ouvrir celle-ci.':['完成上一区域并击败其首领，即可解锁此区域。','Schließe das vorherige Gebiet einschließlich seines Bosses ab, um dieses Gebiet freizuschalten.'],
};

export const MAP_UI = {
 'zh-Hans': {
  region:(num,name)=>`区域${num}：${name}`,
  info:(level,gold)=>`${level}级 · ${gold}金币`,
  summary:(count,min,max)=>`共${count}关，最后一关是首领战 · ${min}–${max}级`,
  mission:(i,level,boss)=>`第${i}关${boss?` · 首领 ${boss}`:''} · ${level}级`,
 },
 de: {
  region:(num,name)=>`Region ${num}: ${name}`,
  info:(level,gold)=>`Stufe ${level} · ${gold} Gold`,
  summary:(count,min,max)=>`${count} Etappen, die letzte ist der Bosskampf · Stufen ${min}–${max}`,
  mission:(i,level,boss)=>`Etappe ${i}${boss?` · Boss ${boss}`:''} · Stufe ${level}`,
 },
};
