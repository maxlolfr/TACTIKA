import {EN, TEXT_CATALOGS} from '../src/i18n.js';

const reference = Object.keys(EN).sort((a,b)=>a.localeCompare(b,'fr'));
const list = process.argv.includes('--missing');
const requireComplete = process.argv.includes('--strict');

for (const id of ['zh-Hans','de']) {
  const catalog = TEXT_CATALOGS[id];
  const missing = reference.filter(key=>!Object.hasOwn(catalog,key));
  console.log(id+': '+(reference.length-missing.length)+' / '+reference.length+' chaînes du registre anglais');
  if (list) for (const key of missing) console.log('  '+JSON.stringify(key));
  if (requireComplete && missing.length) process.exitCode=1;
}
