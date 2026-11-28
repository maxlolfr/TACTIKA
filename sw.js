// Tactika — service worker (V5.01) : le jeu démarre et se joue hors connexion une fois chargé.
// Page, code et styles : réseau d'abord (4 s) puis cache, donc une mise à jour est vue dès qu'on est en ligne.
// Images et sons : cache d'abord, remplis au fil du jeu (les sons sont servis par morceaux, comme le demande <audio>).
// Pour invalider tout le cache après une version : changer VERSION ci-dessous.
const VERSION='5.28',CORE='tactika-core-'+VERSION+'-l10n-17',MEDIA='tactika-media-'+VERSION;
const SHELL=['./','index.html','style.css','home.css','manifest.webmanifest','assets/icon-192.png','assets/icon-512.png','assets/icon-180.png',
 'assets/fonts/nunito-latin-700-normal.woff2','assets/fonts/nunito-latin-800-normal.woff2','assets/fonts/nunito-latin-900-normal.woff2','assets/fonts/lilita-one-latin-400-normal.woff2',
 'src/main.js','src/util.js','src/data.js','src/game.js','src/render.js','src/ambiance.js','src/elites.js','src/gfx.js','src/audio.js','src/save.js','src/savecore.js','src/rules.js','src/turns.js','src/talents.js','src/mastery.js','src/story.js','src/chronicle.js','src/cmrewards.js','src/quests.js','src/locales/nightmare-rewards.js','src/ui.js','src/home.js',
 'src/i18n.js','src/i18n-desc.js','src/i18n-quests.js','src/locales/languages.js','src/locales/tutorials.js','src/locales/battle-tips.js','src/locales/nightmare.js','src/locales/mastery.js','src/locales/talents.js','src/locales/chronicle.js','src/locales/village.js','src/locales/map.js','src/locales/combat-ui.js','src/locales/elites.js','src/locales/save-ui.js','src/locales/interface.js','src/locales/quests.js','src/locales/story.js','src/locales/equipment.js','src/locales/spells.js','src/locales/de.js','src/locales/zh-glossary.js','src/tips.js','src/tips-en.js','assets/atlas.json','assets/village.webp','assets/world1-l.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('tactika-')&&k!==CORE&&k!==MEDIA).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const isMedia=u=>/\/assets\/.*\.(webp|png|jpg|mp3|ogg|woff2)$/.test(u.pathname);
async function ranged(req,res){const h=req.headers.get('range'),m=h&&/bytes=(\d+)-(\d*)/.exec(h);if(!m)return res;
 const b=await res.arrayBuffer(),s=+m[1],e=m[2]?Math.min(+m[2],b.byteLength-1):b.byteLength-1;
 return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':`bytes ${s}-${e}/${b.byteLength}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
async function media(req){const c=await caches.open(MEDIA),key=new Request(req.url);let hit=await c.match(key);
 if(!hit){try{const res=await fetch(key);if(res.ok){await c.put(key,res.clone());hit=res}else return res}catch(e){hit=await (await caches.open(CORE)).match(key);if(!hit)return new Response('',{status:504})}}
 return ranged(req,hit)}
async function shell(req){const c=await caches.open(CORE),key=req.mode==='navigate'?new Request('index.html'):req;
 const net=fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok)c.put(key,r.clone());return r});
 try{return await Promise.race([net,new Promise((_,no)=>setTimeout(no,4000))])}catch(e){const hit=await c.match(key,{ignoreSearch:true});return hit||net.catch(()=>new Response('Hors connexion',{status:503}))}}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(isMedia(u)?media(r):shell(r))});
