// Audit de la traduction anglaise (V5.01) : node tools/en-audit.mjs  (Chrome + playwright requis, voir tools/smoke.mjs)
// Visite les écrans en français et en anglais et relève les textes suspects du parcours anglais.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const PW=process.env.PW||'/opt/npm-tools/node_modules/playwright/index.mjs',CHROME=process.env.CHROME||'/usr/bin/google-chrome';
const {chromium}=await import(PW);const root=path.resolve(new URL('..',import.meta.url).pathname);
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(p)]||'application/octet-stream'});r.end(d)})}).listen(0);
const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const FR=/[éèêàâçùûôîï«»]|\b(les|des|du|ton|tes|pour|avec|dans|sur|une|niveau|étape|héros|quête|combat|dégâts)\b/i;
const seen=new Map();
const screens=[];
try {
 for(const lang of ['fr','en']){
  const ctx=await b.newContext({viewport:{width:1000,height:520}});
  await ctx.addInitScript(lang=>{
   if(!localStorage.getItem('landeTactique1'))localStorage.setItem('landeTactique1',JSON.stringify({
    v:2,fight:9,lvl:30,xp:0,gold:5000,items:[],z:{prairie:10,bois:10,cote:10,monts:10,chateau:3},
    st:{},up:{},lang,tuto:1,storySeen:{prologue:1,join_orion:1,join_nyra:1,join_lyria:1},
   }));
  },lang);
  const pg=await ctx.newPage();
  pg.setDefaultTimeout(8000);
  const errors=[];
  pg.on('pageerror',error=>errors.push(error.message));
  await pg.goto(`http://localhost:${srv.address().port}/index.html`);
  const click=selector=>pg.locator(selector).first().evaluate(element=>element.click());
  const grab=async (name,selector)=>{
   const loc=pg.locator(selector).first();
   await loc.waitFor();
   const strings=await loc.evaluate(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const out=[];
    for(let node;node=walker.nextNode();){
     const e=node.parentElement;
     if(e?.offsetParent&&e.getClientRects().length&&getComputedStyle(e).visibility==='visible'){
      if(node.textContent.trim())out.push(node.textContent.trim());
     }
    }
    for(const e of root.querySelectorAll('[aria-label],[title],[placeholder]')){
     if(e.getClientRects().length&&getComputedStyle(e).visibility==='visible'){
      for(const a of ['aria-label','title','placeholder'])if(e.getAttribute(a))out.push(e.getAttribute(a));
     }
    }
    return out;
   });
   if(!strings.length)throw new Error('Écran vide : '+lang+' '+name);
   screens.push(lang+' '+name+' ('+strings.length+')');
   if(lang==='en')for(const text of strings)if(FR.test(text)&&!seen.has(text))seen.set(text,name);
  };
  await grab('camp','#camp.on');
  for(const id of ['heros','inventaire','quetes','chronique','reglages']){
   await click(id==='reglages'?'.v-gear':`[data-tab="${id}"]`);
   await grab(id,'#vpanel.on');
   await click('#vpanel .v-x');
  }
  for(const [building,selector] of [['forge','#forge'],['marchand','#shop'],['taverne','#tav'],['talents','#armes']]){
   await click(`.v-bld[data-b="${building}"]`);
   await grab(building,selector+'.on');
   await click(selector+' .ov-back');
  }
  await click('.v-gear');
  await pg.getByRole('button',{name:/💾/}).click();
  await grab('sauvegarde','#sv[open]');
  await pg.locator('#sv').evaluate(dialog=>dialog.close());
  await click('#vpanel .v-x');
  await click('.v-go');
  await grab('carte','#map.on');
  await click('.zone');
  await grab('région','#zsheet.on');
  await click('#zsheet .btn');
  await grab('sorts de combat','#spells');
  await grab('titre du combat','#title');
  await grab('unités et points d’action','#who');
  await grab('aide du combat','#hint');
  await pg.locator('#flee').evaluate(button=>{button.click();button.click()});
  await grab('bilan de retraite','#result.on');
  await click('#result .ractions button');
  await pg.locator('#spells button:enabled').first().waitFor();
  await pg.evaluate(async()=>{
   const {G,hooks}=await import('/src/game.js');
   G.s.units.filter(unit=>unit.team==='m').forEach(unit=>{unit.dead=true;});
   hooks.result(true,false);
  });
  await grab('bilan de victoire','#result.on');
  await click('#result .chest');
  await pg.locator('#result .lootbox .loot').nth(1).waitFor();
  await grab('butin de victoire','#result .lootbox');
  if(errors.length)throw new Error(errors.join('\n'));
  await ctx.close();
 }
} finally {
 await b.close();
 srv.close();
}
console.log('Écrans vérifiés : '+screens.join(', '));
console.log(`${seen.size} texte(s) suspect(s) dans le parcours anglais :`);
for(const [s,t] of seen)console.log(`[${t}] ${s.slice(0,200)}`);
