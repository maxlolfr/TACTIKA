// Emballage web (V5.33) : node packaging/build-web.mjs [--demo] [dossier de sortie]
// Copie uniquement ce qui sert à jouer (index, styles, manifeste, src/, assets/) : pas art/, tools/, tests/, legacy/.
// --demo : fige DEMO=true dans le code copié (régions 1-2, 3 héros, sauvegarde à part, sans ?demo) : démo physique pour un site ou un portail.
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const args=process.argv.slice(2),demo=args.includes('--demo'),out=path.resolve(args.find(a=>!a.startsWith('--'))||path.join(root,'packaging',demo?'www-demo':'www'));
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const FILES=['index.html','style.css','home.css','manifest.webmanifest','sw.js'],DIRS=['src','assets'];
for(const f of FILES)fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const d of DIRS)fs.cpSync(path.join(root,d),path.join(out,d),{recursive:true});
if(demo){const p=path.join(out,'src','data.js'),s=fs.readFileSync(p,'utf8'),k="export const DEMO=!!globalThis.location?.search.includes('demo')&&!PREVIEW";
 if(!s.includes(k))throw new Error('drapeau DEMO introuvable dans src/data.js');fs.writeFileSync(p,s.replace(k,'export const DEMO=!PREVIEW'))}
let n=0,bytes=0;(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else{n++;bytes+=fs.statSync(p).size}}})(out);
console.log(`${demo?'DÉMO':'COMPLET'} : ${n} fichiers, ${(bytes/1048576).toFixed(1)} Mo -> ${out}`);
