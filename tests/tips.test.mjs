// V5.0 : l'anglais du tutoriel, des astuces, des intros de boss et des 40 quêtes est complet et garde les mêmes balises.
import test from 'node:test';
import assert from 'node:assert/strict';
import {TUTO,TIPS,TIPS_T} from '../src/tips.js';
import {TUTO_EN,TIPS_EN,TIPS_T_EN} from '../src/tips-en.js';
import {QUESTS} from '../src/quests.js';
import {EN_Q,QUESTS_EN_MISSING} from '../src/i18n-quests.js';
import {EN,L,tr,trh} from '../src/i18n.js';
const tags=s=>(s.match(/<[^>]+>/g)||[]).join('');
const nofr=s=>!/[àâçéèêëîïôûùœ«»]/i.test(s.replace(/<[^>]+>/g,''));
test('tutoriel : 5 cartes, mêmes balises, sans français',()=>{
 assert.equal(TUTO_EN.length,TUTO.length);
 TUTO.forEach((f,i)=>{assert.equal(tags(TUTO_EN[i]),tags(f));assert.ok(nofr(TUTO_EN[i]),TUTO_EN[i])})});
test('astuces : toutes les clés, mêmes balises, sans français',()=>{
 assert.deepEqual(Object.keys(TIPS_EN).sort(),Object.keys(TIPS).sort());
 for(const k in TIPS){assert.equal(TIPS_EN[k].length,TIPS[k].length,k);TIPS[k].forEach((f,i)=>{assert.equal(tags(TIPS_EN[k][i]),tags(f),k);assert.ok(nofr(TIPS_EN[k][i]),k)})}});
test('intros de boss : toutes traduites',()=>{assert.deepEqual(Object.keys(TIPS_T_EN).sort(),Object.keys(TIPS_T).sort());for(const k in TIPS_T)assert.ok(nofr(TIPS_T_EN[k]))});
test('40 quêtes traduites (titre, description, réplique)',()=>{
 assert.equal(QUESTS.length,40);assert.deepEqual(QUESTS_EN_MISSING,[]);
 for(const q of QUESTS)for(const f of [q.t,q.d,q.c]){assert.ok(EN_Q[f]&&EN_Q[f]!==f,q.id);assert.ok(nofr(EN_Q[f]),q.id+' : '+EN_Q[f]);assert.equal(EN[f],EN_Q[f])}});
test('tr() et trh() en mode anglais',()=>{
 L.on=true;assert.equal(tr(QUESTS[0].t),'Missing Merchant');assert.equal(trh(TUTO[0]),TUTO_EN[0]);assert.equal(trh(TIPS.trap[0]),TIPS_EN.trap[0]);
 L.on=false;assert.equal(trh(TUTO[0]),TUTO[0])});
// V4.91 : en V4.89-4.90, un commentaire collé devant requestAnimationFrame(draw) désactivait tout le dessin (plateau noir)
import {readFileSync} from 'node:fs';
test('main.js lance bien la boucle de dessin (pas avalée par un commentaire)',()=>{
 const ln=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').split('\n').find(l=>l.includes('requestAnimationFrame(draw)'));
 assert.ok(ln);const i=ln.indexOf('//');assert.ok(i<0||ln.indexOf('requestAnimationFrame(draw)')<i,ln)});
