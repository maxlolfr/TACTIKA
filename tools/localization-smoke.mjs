// PW et CHROME pointent vers Playwright et le binaire Chromium comme pour tools/smoke.mjs.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const {chromium} = await import(process.env.PW || '/opt/npm-tools/node_modules/playwright/index.mjs');
const root = fileURLToPath(new URL('../', import.meta.url));
const types = {'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url,'http://localhost');
  const file = path.join(root,url.pathname==='/'?'index.html':url.pathname);
  try {
    res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.statusCode=404;
    res.end();
  }
}).listen(0,'127.0.0.1');
let browser;
try {
  await new Promise(resolve=>server.once('listening',resolve));
  browser=await chromium.launch({executablePath:process.env.CHROME || '/usr/bin/google-chrome',args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.addInitScript(()=>{
    const key='landeTactique1';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({v:2,fight:1,lvl:8,xp:0,gold:713,items:[],z:{prairie:7},st:{},up:{},lang:'fr',tuto:1,cr:{be:{slime:{k:3}}}}));
  });
  await page.goto('http://127.0.0.1:'+server.address().port);
  const camp=page.locator('.v-go b');
  const labels={fr:'Partir à l’aventure',en:'Set off on an adventure','zh-Hans':'出发冒险',de:'Ins Abenteuer aufbrechen'};
  const prologues={
    fr:'Je ne me souviens plus de la suite de la chanson…',
    en:'I can’t remember the rest of the song…',
    'zh-Hans':'我想不起这首歌的下一句了……',
    de:'Ich weiß nicht mehr, wie das Lied weitergeht …',
  };
  for(const id of ['fr','en','zh-Hans','de','fr']){
    const current=await page.locator('html').getAttribute('lang');
    if(current!==id){
      await page.locator('.v-gear').click();
      const selector=page.locator('select[data-no-translate]');
      await Promise.all([page.waitForEvent('framenavigated',frame=>frame===page.mainFrame()),selector.selectOption(id)]);
    }
    await camp.waitFor();
    assert.equal(await camp.textContent(),labels[id]);
    assert.equal(await page.locator('html').getAttribute('lang'),id);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('landeTactique1')));
    assert.equal(saved.lang,id);
    assert.equal(saved.gold,713);
    assert.equal(saved.lvl,8);
    await page.evaluate(async lang=>{
      const {playStory}=await import('./src/story.js');
      playStory({lang},['prologue']);
    },id);
    const dialogue=page.locator('#story .tx');
    await dialogue.waitFor();
    assert.equal(await dialogue.textContent(),prologues[id]);
    await page.locator('#story .sp').click();
    await dialogue.waitFor({state:'detached'});
    console.log('OK',id,labels[id],'· prologue');
    if(id==='zh-Hans'||id==='de'){
      await page.locator('.v-bld[data-b="talents"]').evaluate(element=>element.click());
      const spell=page.locator('#armes .mrow[data-sp="slash"]');
      await spell.waitFor();
      const zh=id==='zh-Hans';
      const spec=page.locator('#armes .spec').first();
      assert.equal(await spec.locator('.sphd b').textContent(),zh?'狂战士':'Berserker');
      assert.match(await spec.locator('.chain').textContent(),zh?/暴击率从12%提高到22%/:/22 % statt 12 % kritische Trefferchance/);
      assert.match(await spell.textContent(),zh?/当前：基础效果/:/Aktuell: Grundwirkung/);
      await spell.locator('button').click();
      assert.match(await spell.textContent(),zh?/当前：伤害 \+5%/:/Aktuell: \+5 % Schaden/);
      const reset=page.getByRole('button',{name:zh?'免费重置精通':'Beherrschung kostenlos zurücksetzen'});
      await reset.click();
      await page.getByRole('button',{name:zh?'再次点击以返还点数':'Erneut tippen, um die Punkte zurückzuerhalten'}).click();
      assert.match(await spell.textContent(),zh?/当前：基础效果/:/Aktuell: Grundwirkung/);
      await page.locator('#armes .ov-back').click();
      console.log('OK',id,'· maîtrise : rang II et réinitialisation');
      await page.locator('[data-tab="inventaire"]').evaluate(element=>element.click());
      const inventory=page.locator('#vpanel .v-count');
      await inventory.waitFor();
      assert.match(await inventory.textContent(),zh?/装备 0\/120/:/0 von 120 Gegenständen/);
      await page.locator('#vpanel .v-slot').first().click();
      assert.match(await page.locator('#vpanel .v-cols').textContent(),zh?/未发现的装备，适用英雄：/:/Unentdeckter Gegenstand für/);
      await page.locator('#vpanel .v-x').click();
      await page.locator('[data-tab="chronique"]').evaluate(element=>element.click());
      const trophy=page.locator('.ch-tro').first();
      await trophy.waitFor();
      assert.match(await trophy.textContent(),zh?/第一步.*赢得第一场战斗/s:/Erster Schritt.*Gewinne deinen ersten Kampf/s);
      await page.getByRole('button',{name:zh?'怪物图鉴':'Bestiarium',exact:true}).click();
      const discovered=page.locator('.ch-beast:not(.off)').first();
      await discovered.waitFor();
      assert.match(await discovered.textContent(),zh?/史莱姆.*击败次数：3/s:/Schleim.*Besiegt: 3/s);
      await page.locator('#vpanel .v-x').click();
      for(const [building,selector,expected] of [
        ['forge','#forge',zh?/每次强化使装备加成提高50%.*713金币/s:/Jede Aufwertung.*713 Gold/s],
        ['marchand','#shop',zh?/恢复40%生命值 · 持有/:/Heilt 40 % der LP · Vorrat/],
        ['taverne','#tav',zh?/每日委托.*金币，.*经验/s:/Tagesaufträge.*Gold, .*EP/s],
      ]){
        await page.locator(`.v-bld[data-b="${building}"]`).evaluate(element=>element.click());
        const panel=page.locator(selector+'.on');
        await panel.waitFor();
        assert.match(await panel.textContent(),expected);
        await panel.locator('.ov-back').click();
      }
      console.log('OK',id,'· forge, marchand et taverne');
      await page.locator('.v-gear').evaluate(element=>element.click());
      await page.getByRole('button',{name:zh?'💾 存档':'💾 Spielstand'}).click();
      const savePanel=page.locator('#sv[open]');
      await savePanel.waitFor();
      assert.match(await savePanel.textContent(),zh?/导出存档文件或复制代码/:/Exportiere deinen Spielstand als Datei/);
      await savePanel.getByRole('button',{name:zh?'关闭':'Schließen',exact:true}).click();
      await page.locator('#vpanel .v-x').click();
      await page.locator('.v-cry').evaluate(element=>element.click());
      const nightmare=page.locator('.cm-gate');
      await nightmare.waitFor();
      assert.match(await nightmare.textContent(),id==='zh-Hans'?/完成剧情直到尾声/:/Schließe die Geschichte bis zum Epilog ab/);
      await page.locator('#vpanel .v-x').click();
      await page.locator('.v-go').click();
      await page.locator('.zone').first().evaluate(element=>element.click());
      const recap=page.locator('#zsheet.on > small');
      await recap.waitFor();
      assert.match(await recap.textContent(),zh?/共10关，最后一关是首领战/:/10 Etappen, die letzte ist der Bosskampf/);
      await page.locator('#zsheet .btn').nth(7).click();
      const objective=page.locator('#tuto.on p');
      await objective.waitFor();
      assert.match(await objective.textContent(),id==='zh-Hans'?/目标：坚守\d+回合/:/Ziel: \d+ Züge durchhalten/);
      await page.locator('#tuto.on .btn').first().click();
      const spellButton=page.locator('#spells button:enabled').first();
      await spellButton.waitFor();
      await spellButton.evaluate(element=>element.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'})));
      const tooltip=page.locator('#sptip');
      await tooltip.waitFor();
      assert.match(await tooltip.textContent(),zh?/行动点.*伤害/s:/AP.*Schaden/s);
      await spellButton.evaluate(element=>element.dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'})));
      await page.locator('#tl .rg.h canvas').first().evaluate(element=>element.click());
      const character=page.locator('#ufiche');
      await character.waitFor();
      assert.match(await character.textContent(),zh?/生命值.*行动点.*移动点/s:/LP.*AP.*BP/s);
      console.log('OK',id,'· objectif, infobulle de sort et fiche de combat');
      await spellButton.evaluate(button=>button.click());
      const target=page.locator('button.tb').first();
      await target.waitFor();
      assert.match(await target.getAttribute('aria-label'),zh?/\d+\/\d+生命值/:/\d+\/\d+ LP/);
      await target.evaluate(button=>button.click());
      const aim=page.locator('#exc.on');
      await aim.waitFor();
      assert.match(await aim.locator('strong').textContent(),zh?/→ .*生命值/:/→ .*LP/);
      assert.doesNotMatch(await aim.textContent(),/Hors de portée|portée max|Aucun centre|Touché en visant/);
      console.log('OK',id,'· aperçu de visée et nom accessible de la cible');
      await page.locator('#flee').evaluate(button=>{button.click();button.click()});
      const retreat=page.locator('#result.on');
      await retreat.waitFor();
      assert.match(await retreat.textContent(),zh?/你已退出战斗.*0名英雄倒地.*剩余\d+名敌人/s:/Du hast den Kampf verlassen.*0 Helden kampfunfähig.*\d+ Gegner übrig/s);
      const regular=page.url();
      await page.evaluate(()=>{
        const fixture=JSON.parse(localStorage.getItem('landeTactique1'));
        fixture.storySeen={prologue:1,join_orion:1,join_nyra:1,join_lyria:1};
        localStorage.setItem('landeTactique1_cauchemar',JSON.stringify(fixture));
      });
      await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
      await page.goto(regular+'?cauchemar=bombe');
      await camp.waitFor();
      await page.locator('.v-go').click();
      await page.locator('.zone').first().evaluate(element=>element.click());
      await page.locator('#zsheet .btn').nth(1).click();
      const elite=page.locator('#tl .rg.m').filter({has:page.locator('canvas')});
      await elite.first().waitFor();
      const eliteLabels=await elite.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
      assert.ok(eliteLabels.some(label=>label.includes(zh?'爆裂':'Explosiv')),eliteLabels.join(', '));
      await page.evaluate(async()=>{
        const {G,hooks}=await import('/src/game.js');
        const enemy=G.s.units.find(u=>u.team==='m');
        Object.assign(enemy,{boss:true,bs:'beam',ph:2});
        G.s.beam={by:enemy,cells:[]};
        hooks.renderTL();
      });
      await page.locator('#tl .rg.m.b canvas').first().evaluate(canvas=>canvas.click());
      assert.match(await page.locator('#ufiche').textContent(),zh?/阶段 2.*棱晶射线：下回合/s:/Phase 2.*Prismenstrahl im nächsten Zug/s);
      for (const [phase,active,label] of [
        ['forge',false,zh?/低于50%时触发过热/:/Überhitzung unter 50 % LP/],
        ['tomb',true,zh?/诅咒已触发/:/Fluch aktiv/],
        ['breaker',true,zh?/原初粉碎已触发/:/Urzeitlicher Schlag aktiv/],
      ]) {
        await page.evaluate(async({phase,active})=>{
          const {G,hooks}=await import('/src/game.js');
          const enemy=G.s.units.find(u=>u.team==='m');
          Object.assign(enemy,{bs:phase,raged:active});
          G.s.beam=null;
          hooks.renderTL();
        },{phase,active});
        await page.locator('#tl .rg.m.b canvas').first().evaluate(canvas=>canvas.click());
        assert.match(await page.locator('#ufiche').textContent(),label);
      }
      await page.evaluate(async()=>{
        const {G,hooks}=await import('/src/game.js');
        G.s.cleared=true;
        G.s.goal=null;
        hooks.result(true,false);
      });
      assert.match(await page.locator('#result .goalwon').textContent(),zh?/已消灭所有波次.*25%/s:/Alle Wellen besiegt: \+25 % Gold/s);
      console.log('OK',id,'· fiche du Titan et butin des vagues');
      console.log('OK',id,'· sauvegarde et affixe explosif en Cauchemar');
      await page.context().setOffline(true);
      try {
        await page.reload();
        await camp.waitFor();
        await page.locator('.v-go').click();
        await page.locator('.zone').first().evaluate(element=>element.click());
        await page.locator('#zsheet .btn').nth(1).click();
        await elite.first().waitFor();
        const resultTitle=page.locator('#result.on h1');
        let lastTurn=null;
        let turnsPlayed=0;
        for(;turnsPlayed<48;turnsPlayed++){
          const nextTurn=await page.waitForFunction(async previous=>{
            const {G}=await import('/src/game.js');
            if(document.querySelector('#result.on h1'))return 'finished';
            if(G.phase!=='fight'||G.cur?.team!=='h'||!G.endTurnResolve||G.busy)return false;
            const turn=G.s.round+':'+G.turn;
            return turn!==previous?turn:false;
          },lastTurn);
          lastTurn=await nextTurn.jsonValue();
          await nextTurn.dispose();
          if(lastTurn==='finished')break;
          await page.locator('#end').click();
        }
        assert.ok(turnsPlayed>=2,'le combat doit avancer sur plusieurs tours');
        await resultTitle.waitFor();
        assert.match(await resultTitle.textContent(),zh?/胜利|失败|战败/:/Sieg|Niederlage/);
        console.log('OK',id,'· combat du Cauchemar hors ligne joué jusqu’au bilan');

        await page.reload();
        await camp.waitFor();
        await page.locator('.v-go').click();
        const coldRegion=await page.evaluate(async()=>{
          const {G}=await import('/src/game.js');
          const {startFight}=await import('/src/ui.js');
          const {tr}=await import('/src/i18n.js');
          const sprite=new URL('/assets/wolfN.webp',location.href);
          const cached=!!await caches.match(sprite.href);
          await startFight(1,0);
          return {cached,phase:G.phase,feedback:document.getElementById('mapinfo').textContent,
            expected:tr('Images introuvables')+' : '};
        });
        assert.equal(coldRegion.cached,false,'le sprite du Bois sombre doit être absent du cache');
        assert.equal(coldRegion.phase,'camp');
        assert.ok(coldRegion.feedback.startsWith(coldRegion.expected),coldRegion.feedback);
        console.log('OK',id,'· refus de chargement pour une région jamais chargée hors ligne');
      } finally {
        await page.context().setOffline(false);
      }
      await page.goto(regular);
      await camp.waitFor();
    }
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser?.close();
  server.close();
}
