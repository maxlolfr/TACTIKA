// V5.01 : garde-fous de stabilité (références manquantes, fichiers absents, boucle de dessin). npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url),rd=p=>readFileSync(new URL(p,root),'utf8');
const files=readdirSync(new URL('src/',root)).filter(f=>f.endsWith('.js'));
const src=Object.fromEntries(files.map(f=>[f,rd('src/'+f)]));

// export nommés d'un module, lus dans le texte (export const a=…,b=… ; function ; class ; export {…})
function exportsOf(t){const s=new Set();let m;
 const re1=/export\s+(?:async\s+)?(?:function\*?|class)\s+([\w$]+)/g;while(m=re1.exec(t))s.add(m[1]);
 const re2=/export\s+(?:const|let|var)\s+/g;
 while(m=re2.exec(t)){let i=re2.lastIndex,depth=0,expectName=true,q=null,j=i;
  for(;j<t.length;j++){const c=t[j];
   if(q){if(c==='\\')j++;else if(c===q)q=null;continue}
   if('"\'`'.includes(c)){q=c;continue}
   if('([{'.includes(c)){depth++;continue}
   if(')]}'.includes(c)){depth--;continue}
   if(depth===0&&c===';')break;
   if(depth===0&&c==='\n'&&!/[,=+\-*/&|?:(\[{]\s*$/.test(t.slice(i,j).trimEnd()))break;
   if(depth===0&&c===','){expectName=true;continue}
   if(expectName&&/[\w$]/.test(c)){const n=/^[\w$]+/.exec(t.slice(j))[0];s.add(n);j+=n.length-1;expectName=false}
   else if(expectName&&/\s/.test(c))continue;else if(expectName&&c==='['||c==='{'){expectName=false}}}
 const re3=/export\s*\{([^}]*)\}/g;while(m=re3.exec(t))for(const p of m[1].split(','))if(p.trim())s.add(p.trim().split(/\s+as\s+/).pop());
 return s}
test('chaque import nommé de src/ existe dans le module visé', () => {
 const bad=[];
 for(const f of files){const re=/import\s*\{([^}]*)\}\s*from\s*['"]\.\/([\w.-]+\.js)['"]/g;let m;
  while(m=re.exec(src[f])){const target=m[2];if(!src[target]){bad.push(`${f}: module ${target} absent`);continue}
   const ex=exportsOf(src[target]);for(const p of m[1].split(',')){const n=p.trim().split(/\s+as\s+/)[0];if(n&&!ex.has(n))bad.push(`${f}: « ${n} » non exporté par ${target}`)}}}
 assert.deepEqual(bad,[]);
});
test('V5.01 : ui.js importe trh (le tutoriel plantait au premier combat en V5.0)', () => {
 assert.match(src['ui.js'],/import\s*\{[^}]*\btrh\b[^}]*\}\s*from\s*'\.\/i18n\.js'/);
});
test('fichiers locaux cités par index.html et le manifeste existent', () => {
 const html=rd('index.html'),man=JSON.parse(rd('manifest.webmanifest'));
 const refs=[...html.matchAll(/(?:src|href)="((?!https?:|data:|#)[^"]+)"/g)].map(m=>m[1].split('?')[0]).concat(man.icons.map(i=>i.src),[man.start_url==='./'?'index.html':man.start_url]);
 const miss=[...new Set(refs)].filter(p=>!existsSync(new URL(p,root)));assert.deepEqual(miss,[]);
});
test('images et sons cités en toutes lettres dans le code, le CSS et la page existent', () => {
 const txt=Object.values(src).join('\n')+rd('index.html')+rd('style.css')+rd('home.css');
 const refs=new Set([...txt.matchAll(/assets\/[\w\-./]+\.(?:webp|png|mp3|jpg|svg|woff2)/g)].map(m=>m[0]));
 const miss=[...refs].filter(p=>!existsSync(new URL(p,root)));assert.deepEqual(miss,[]);assert.ok(refs.size>20);
});
test('la boucle de dessin n’est pas neutralisée par un commentaire de fin de ligne', () => {
 for(const f of files)for(const l of src[f].split('\n')){const i=l.indexOf('requestAnimationFrame(');
  if(i>=0){const c=l.indexOf('//');assert.ok(c<0||c>i||/https?:/.test(l.slice(Math.max(0,c-6),c)),f+': '+l.slice(0,120))}}
});
test('un gestionnaire d’erreurs global existe (erreurs signalées, jamais silencieuses)', () => {
 assert.match(src['main.js']+rd('index.html'),/addEventListener\(\s*['"]error['"]|window\.onerror/);
});
test('sw.js : tous les fichiers pré-chargés existent et tous les modules src/ y figurent', () => {
 const sw=rd('sw.js'),shell=eval(/const SHELL=(\[[\s\S]*?\]);/.exec(sw)[1]);
 assert.deepEqual(shell.filter(p=>p!=='./'&&!existsSync(new URL(p,root))),[]);
 assert.deepEqual(files.filter(f=>!shell.includes('src/'+f)),[]);
 assert.match(sw,new RegExp(`VERSION='${/VERSION='([\d.]+)'/.exec(src['home.js'])[1]}'`),'la version du service worker suit celle du jeu');
});
test('plus aucune dépendance réseau obligatoire : polices locales, pas de Google Fonts', () => {
 assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(rd('index.html')+rd('style.css')+rd('home.css')));
 for(const f of ['nunito-latin-700-normal','nunito-latin-800-normal','nunito-latin-900-normal','lilita-one-latin-400-normal'])assert.ok(existsSync(new URL(`assets/fonts/${f}.woff2`,root)),f);
});
