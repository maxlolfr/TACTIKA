// Les entrées suivent les identifiants et l'ordre de TIPS dans tips.js.
export const BATTLE_TIPS = {
 'zh-Hans': {
  trap:['<b>陷阱地砖</b><br><b>标有◆的金色地砖</b>会在<b>下一回合开始</b>时触发，造成12%生命值的伤害，并使角色下回合<b>少1移动点</b>。神殿守卫熟悉陷阱，不会触发它们。'],
  curse:['<b>诅咒</b><br><b>木乃伊守卫</b>和<b>哨兵</b>会诅咒被它们击中的目标：<b>受到的治疗降低50%，持续2回合</b>。在被击中前完成治疗，或让受诅咒的英雄撤离。'],
  tomb:['<b>遗忘法老——墓穴诅咒</b><br>生命值<b>低于一半</b>后，法老的攻击伤害提高20%，<b>全队都会遭到诅咒</b>，而且<b>每回合</b>都会出现更多陷阱。让法老的生命值降到一半前，先准备好治疗。'],
  swamp:['<b>沼泽女王——毒孢子</b><br>生命值<b>低于一半</b>后，她的攻击伤害提高20%，<b>全队中毒</b>（每回合4点生命值，持续2回合），并出现<b>两个脆弱的分身</b>。分身一击即倒，赶在它们下毒前消灭它们。她还会制造<b>绿色毒区☣</b>，提前一回合标出。及时离开，以免中毒。'],
  astral:['<b>埃瑟里昂——天界审判</b><br>生命值<b>低于一半</b>后，他的攻击伤害提高20%，获得<b>1移动点</b>，并召出<b>两个脆弱的星界分身</b>。分身一击即倒，消灭它们后再集中攻击埃瑟里昂。他每3回合会<b>传送</b>到受伤最重的英雄身旁，进入下一阶段后改为每2回合。保护好那名英雄。'],
  frost:['<b>冰霜之王——冰冻</b><br>生命值<b>低于一半</b>后，他的攻击伤害提高20%，<b>全队被冰冻</b>（下回合少1移动点），并出现<b>两个脆弱的冰霜碎片</b>。碎片的攻击会使目标减速，尽快消灭它们。每3回合他会撑起<b>冰盾</b>，减免伤害一回合，等冰盾消失再打。生命值低于一半后，地上会出现<b>蓝色裂缝❄</b>，注意避开。'],
  breaker:['<b>原初破坏者——粉碎</b><br>生命值<b>低于一半</b>后，他的攻击伤害提高25%，<b>全队的护甲被击破</b>（受到的伤害提高15%，持续2回合），并出现<b>两个脆弱的以太碎片</b>。每4回合他会<b>跪下</b>：<b>防御崩溃，你的回合内他受到的伤害提高30%</b>。趁机猛攻，碎片一击即可消灭。'],
  lava:['<b>灼热地格</b><br><b>标有▲的红色格子</b>会在<b>下一回合开始</b>时燃烧，扣除格内角色12%的生命值。你有一回合可以离开。火蜥蜴和元素生物不怕火。'],
  pushfire:['<b>推入余烬</b><br><b>黑曜石骑士</b>也怕火。用<b>重击</b>把他推到标有▲的格子，下回合火焰就会烧到他。'],
  forge:['<b>伊格纳罗斯——过热</b><br>生命值<b>低于一半</b>后，他的攻击伤害提高20%，熔炉失控：<b>每回合都会出现更多灼热格子</b>。留好移动和治疗手段。'],
  rage:['<b>黑骑士——狂怒</b><br>生命值<b>低于一半</b>后，他进入狂怒：<b>获得1移动点</b>，攻击伤害<b>提高30%</b>。在打到这个阶段前，备好治疗，让脆弱的英雄撤远。'],
  beam:['<b>棱晶泰坦——射线</b><br>泰坦会<b>标记地面格子</b>，并在自己的下回合向它们发射射线：<b>及时撤走英雄</b>。生命值低于2/3时，射线形成<b>十字形</b>；低于1/3时，<b>被击中的棱晶会炸裂</b>。'],
  quake:['<b>远古魔像——地震</b><br>每3回合，它会击中<b>距离自己3格以内的所有英雄</b>（查看它的资料可知具体回合）。<b>注意躲避：</b>该回合让英雄保持至少4格距离，用芬恩远程攻击。'],
  armor:['<b>护甲</b><br>螃蟹和骑士能减免15%的伤害。芬恩5级解锁的<b>穿甲箭</b>能无视全部护甲。让芬恩待在凯尔身后，并与敌人保持距离。'],
  shroom:['<b>蘑菇怪</b><br>它能从远处攻击（最远4格），并使目标<b>中毒</b>。英雄靠近时，它会后退。用凯尔逼近它，或用芬恩远程瞄准。'],
  tox:['<b>剧毒史莱姆（紫色，☠）</b><br>它的攻击不强，却会让目标<b>中毒</b>：每回合扣2点生命值，持续2回合。用射击或芬恩优先攻击它，或者让艾莉丝治疗全队。'],
  king:['<b>首领——史莱姆王</b><br>生命值降到一半时，它会<b>召唤2只史莱姆</b>。在此之前集中攻击首领，并与剧毒史莱姆保持距离，它们的毒伤会叠加。'],
  amp:['<b>绿松石水晶——增幅器</b><br>英雄在相邻格（虚线轮廓▲）施放技能时，伤害和治疗量<b>提高30%</b>。怪物也能利用它，红色气泡会显示这一点。','水晶会阻挡移动和射击。把怪物推向水晶会引发碰撞。'],
  prism:['<b>紫水晶——棱镜</b><br>用伤害技能攻击棱镜，<b>相邻4格</b>内的单位会受到平均伤害的70%，<b>包括己方英雄</b>。施放前，条纹和◆数字会显示影响范围与伤害。','棱镜随后会熄灭2回合（灰色，⏸）。它可用来攻击躲在障碍物后面的敌人。'],
 },
 de: {
  trap:['<b>Fallenplatten</b><br>Die <b>goldenen Platten mit ◆</b> lösen <b>zu Beginn des nächsten Zugs</b> aus. Sie kosten 12 % der LP und <b>1 BP</b> im nächsten Zug. Die Tempelwächter kennen die Fallen und lösen sie nicht aus.'],
  curse:['<b>Fluch</b><br><b>Mumienwächter</b> und <b>Schildwachen</b> verfluchen getroffene Ziele: <b>50 % weniger erhaltene Heilung für 2 Züge</b>. Heile vor dem Treffer oder bring den verfluchten Helden in Sicherheit.'],
  tomb:['<b>Vergessener Pharao – Fluch der Gruft</b><br>Unter <b>der Hälfte seiner LP</b> verursachen seine Angriffe 20 % mehr Schaden, <b>das ganze Team wird verflucht</b> und <b>in jedem Zug</b> kommen weitere Fallen hinzu. Halte Heilung bereit, bevor du ihn unter die Hälfte bringst.'],
  swamp:['<b>Sumpfkönigin – Giftsporen</b><br>Unter <b>der Hälfte ihrer LP</b> verursacht sie 20 % mehr Schaden, <b>das ganze Team wird vergiftet</b> (4 LP pro Zug für 2 Züge) und <b>zwei schwache Doppelgänger</b> erscheinen. Ein Treffer reicht, um sie auszuschalten. Erledige sie, bevor sie jemanden vergiften. Sie erzeugt auch <b>grüne Giftzonen ☣</b>. Diese werden einen Zug vorher markiert. Verlass sie rechtzeitig.'],
  astral:['<b>Aetherion – Himmlisches Urteil</b><br>Unter <b>der Hälfte seiner LP</b> verursacht er 20 % mehr Schaden, gewinnt <b>1 BP</b> und beschwört <b>zwei schwache Astraldoppelgänger</b>. Ein Treffer reicht gegen sie. Schalte sie aus und konzentriere dich dann auf Aetherion. Er <b>teleportiert sich</b> alle 3 Züge zum am schwersten verwundeten Helden, nach dem Phasenwechsel alle 2 Züge. Beschütze diesen Helden.'],
  frost:['<b>Frostkönig – Vereisung</b><br>Unter <b>der Hälfte seiner LP</b> verursacht er 20 % mehr Schaden, <b>das ganze Team friert ein</b> (−1 BP im nächsten Zug) und <b>zwei schwache Frostsplitter</b> erscheinen. Ihre Treffer verlangsamen. Erledige sie schnell. Alle 3 Züge hebt er einen <b>Eisschild</b>, der für einen Zug den Schaden senkt. Warte, bis der Schild fällt. Unter der Hälfte seiner LP öffnen sich <b>blaue Risse ❄</b> im Boden. Weiche ihnen aus.'],
  breaker:['<b>Urbrecher – Zerschmettern</b><br>Unter <b>der Hälfte seiner LP</b> verursacht er 25 % mehr Schaden, <b>die Rüstung des ganzen Teams zerbricht</b> (+15 % erlittener Schaden für 2 Züge) und <b>zwei schwache Äthersplitter</b> erscheinen. Alle 4 Züge <b>geht er in die Knie</b>. <b>Seine Verteidigung bricht ein, und er erleidet in deinem Zug 30 % mehr Schaden</b>. Nutze diese Gelegenheit. Die Splitter fallen mit einem Treffer.'],
  lava:['<b>Brennende Felder</b><br>Die <b>roten Felder mit ▲</b> entflammen <b>zu Beginn des nächsten Zugs</b> und ziehen Einheiten darauf 12 % der LP ab. Du hast einen Zug Zeit, sie zu verlassen. Salamander und Elementare sind gegen das Feuer immun.'],
  pushfire:['<b>In die Glut stoßen</b><br>Auch der <b>Obsidianritter</b> ist verwundbar. Stoße ihn mit <b>Wuchtschlag</b> auf ein Feld mit ▲, damit er im nächsten Zug verbrennt.'],
  forge:['<b>Ignaros – Überhitzung</b><br>Unter <b>der Hälfte seiner LP</b> verursacht er 20 % mehr Schaden und die Schmiede gerät außer Kontrolle: <b>In jedem Zug brennen mehr Felder</b>. Halte Bewegung und Heilung bereit.'],
  rage:['<b>Schwarzer Ritter – Raserei</b><br>Unter <b>der Hälfte seiner LP</b> gerät er in Raserei: <b>+1 BP</b> und <b>30 % mehr Angriffsschaden</b>. Halte Heilung bereit und bring empfindliche Helden auf Abstand, bevor du diese Schwelle erreichst.'],
  beam:['<b>Prismentitan – Strahl</b><br>Er <b>markiert Felder</b> und beschießt sie in seinem nächsten Zug. <b>Zieh deine Helden vorher von diesen Feldern ab</b>. Unter 2/3 seiner LP bildet der Strahl ein <b>Kreuz</b>. Unter 1/3 <b>zersplittern getroffene Prismen</b>.'],
  quake:['<b>Uralter Golem – Erdbeben</b><br>Alle 3 Züge trifft er <b>alle Helden in höchstens 3 Feldern Entfernung</b>. Sein Profil zeigt den Zug an. <b>Weiche aus:</b> Halte in diesem Zug mindestens 4 Felder Abstand und greife mit Fenn aus der Ferne an.'],
  armor:['<b>Rüstung</b><br>Krabben und Ritter erleiden 15 % weniger Schaden. Fenns <b>Durchschlagender Schuss</b> (Stufe 5) ignoriert jede Rüstung. Stell Fenn hinter Kael und halte Abstand.'],
  shroom:['<b>Pilz</b><br>Er schießt bis zu 4 Felder weit und <b>vergiftet</b> seine Ziele. Steht er neben einem Helden, zieht er sich zurück. Rücke mit Kael an oder nimm ihn mit Fenn ins Visier.'],
  tox:['<b>Giftschleim (violett, ☠)</b><br>Der Treffer ist schwach, <b>vergiftet</b> aber das Ziel: 2 LP pro Zug für 2 Züge. Greife ihn zuerst mit Schuss oder mit Fenn an oder lass Aelis das Team heilen.'],
  king:['<b>Schleimkönig – Boss</b><br>Bei der Hälfte seiner LP <b>ruft er 2 Schleime herbei</b>. Konzentriere bis dahin den Schaden auf ihn und halte Giftschleime auf Abstand. Ihr Gift stapelt sich.'],
  amp:['<b>Türkiser Kristall – Verstärker</b><br>Wirkt ein Held einen Zauber von einem angrenzenden Feld aus (gestrichelte Kontur ▲), steigen Schaden und Heilung um <b>30 %</b>. Auch Monster nutzen den Effekt. Ihre rote Blase zeigt es an.','Der Kristall blockiert Bewegung und Schüsse. Ein Monster, das dagegen gestoßen wird, erleidet einen Zusammenstoß.'],
  prism:['<b>Violetter Kristall – Prisma</b><br>Triff ihn mit einem Schadenszauber. Seine <b>4 Nachbarfelder</b> erleiden 70 % des durchschnittlichen Schadens, <b>auch deine Helden</b>. Die schraffierten Felder und ◆-Zahlen erscheinen vor dem Wirken.','Danach ist das Prisma 2 Züge inaktiv (grau, ⏸). Damit kannst du Gegner hinter Hindernissen treffen.'],
 },
};

export const BOSS_LINES = {
 'zh-Hans': {
  howl:'召唤狼群',shell:'缩入甲壳',quake:'震动大地',rage:'陷入狂怒',beam:'蓄力水晶射线',
  forge:'点燃堡垒',tomb:'诅咒入侵者',swamp:'使沼泽染毒',astral:'施展传送',frost:'披上寒冰',breaker:'击碎一切防御',
  default:'可怕的守卫',
 },
 de: {
  howl:'Ruft das Rudel',shell:'Zieht sich in den Panzer zurück',quake:'Bringt den Boden zum Beben',
  rage:'Gerät in Raserei',beam:'Lädt einen Kristallstrahl auf',forge:'Setzt die Festung in Brand',
  tomb:'Verflucht Eindringlinge',swamp:'Vergiftet den Sumpf',astral:'Teleportiert sich',
  frost:'Hüllt sich in Eis',breaker:'Durchbricht jede Verteidigung',default:'Ein gefährlicher Wächter',
 },
};

export const BATTLE_GOALS = {
 'zh-Hans': {
  survive:n=>`<b>⏳ 目标：存活${n}回合</b><br>在第${n}回合结束时，至少有一名英雄仍能战斗。也可以通过消灭所有怪物获胜。`,
  chief:'<b>♛ 目标：击败首领</b><br>击倒带有王冠标记的怪物即可立即获胜，即使还有敌人存活。',
  waves:n=>`<b>⏳ 目标：坚守${n}回合</b><br>援军将分批抵达。⚠标记显示下一回合的增援位置。在第${n}回合结束时，至少有一名英雄仍能战斗。<br>★ 消灭所有波次的敌人：获得第3颗星及额外25%金币。`,
 },
 de: {
  survive:n=>`<b>⏳ Ziel: ${n} Züge überleben</b><br>Mindestens ein Held muss bis zum Ende von Zug ${n} kampffähig bleiben. Du kannst auch gewinnen, indem du alle Monster besiegst.`,
  chief:'<b>♛ Ziel: den Anführer besiegen</b><br>Sobald das Monster mit der Krone fällt, gewinnst du sofort. Übrige Gegner spielen dabei keine Rolle.',
  waves:n=>`<b>⏳ Ziel: ${n} Züge durchhalten</b><br>Verstärkung erscheint in Wellen. Die mit ⚠ markierten Felder zeigen, wo sie im nächsten Zug erscheint. Mindestens ein Held muss bis Ende von Zug ${n} kampffähig bleiben.<br>★ Besiege alle Wellen für den 3. Stern und 25 % zusätzliches Gold.`,
 },
};

export function battleGoal(locale,key,turns) {
 const text=BATTLE_GOALS[locale]?.[key];
 return typeof text==='function'?text(turns):text;
}
