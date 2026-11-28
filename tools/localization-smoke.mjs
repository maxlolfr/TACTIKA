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
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({v:2,fight:1,lvl:8,xp:0,gold:713,items:[],z:{prairie:7},st:{},up:{},lang:'fr',tuto:1}));
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
      await page.locator('.v-cry').evaluate(element=>element.click());
      const nightmare=page.locator('.cm-gate');
      await nightmare.waitFor();
      assert.match(await nightmare.textContent(),id==='zh-Hans'?/完成剧情直到尾声/:/Schließe die Geschichte bis zum Epilog ab/);
      await page.locator('#vpanel .v-x').click();
      await page.locator('.v-go').click();
      await page.locator('.zone').first().evaluate(element=>element.click());
      await page.locator('#zsheet .btn').nth(7).click();
      const objective=page.locator('#tuto.on p');
      await objective.waitFor();
      assert.match(await objective.textContent(),id==='zh-Hans'?/目标：坚守\d+回合/:/Ziel: \d+ Züge durchhalten/);
      console.log('OK',id,'· objectif de survie en vagues');
      await page.reload();
      await camp.waitFor();
    }
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser?.close();
  server.close();
}
