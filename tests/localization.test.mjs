import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLanguage, LANGUAGES} from '../src/locales/languages.js';
import {TROPHIES,BEASTS,beastInfo} from '../src/chronicle.js';
import {SPECS} from '../src/talents.js';
import {ITEMS,SP} from '../src/data.js';
import {EQUIPMENT} from '../src/locales/equipment.js';
import {SC,OUTRO} from '../src/story.js';
import {STORY_LOCALES,storyLine} from '../src/locales/story.js';
import {TUTO,TIPS,TIPS_T} from '../src/tips.js';
import {QUESTS} from '../src/quests.js';
import {QUEST_TRANSLATIONS} from '../src/locales/quests.js';
import {battleGoal} from '../src/locales/battle-tips.js';
import {regHtml, setLang, tr, trh, TEXT_CATALOGS} from '../src/i18n.js';

test('les identifiants de langue sont stables et les anciennes sauvegardes restent lisibles', () => {
  assert.deepEqual(LANGUAGES.map(({id}) => normalizeLanguage(id)), ['fr', 'en', 'zh-Hans', 'de']);
  for (const invalid of [undefined, null, 'zh', 'constructor', {}, 1]) {
    assert.equal(normalizeLanguage(invalid), 'fr');
  }
});

test('le français, l’anglais et les deux aperçus utilisent leurs catalogues respectifs', () => {
  for (const [id, text] of [['fr', 'Héros'], ['en', 'Heroes'], ['zh-Hans', '英雄'], ['de', 'Helden']]) {
    setLang(id);
    assert.equal(tr('  Héros\n'), '  '+text+'\n');
    assert.equal(tr('constructor'), 'constructor');
  }
  assert.equal(tr(null), null);
});

test('les aperçus conservent les chaînes françaises complètes en cas de traduction manquante', () => {
  for (const id of ['zh-Hans', 'de']) {
    setLang(id);
    assert.equal(tr('Héros au niveau 9'), 'Héros au niveau 9');
    assert.equal(trh('<b>Héros</b>'), '<b>Héros</b>');
    for (const text of Object.values(TEXT_CATALOGS[id])) {
      assert.ok(text.trim());
      assert.doesNotMatch(text, /[<>\uFFFD]/);
    }
  }
});

test('les cinq cartes du tutoriel sont traduites dans les deux aperçus et gardent leurs balises', () => {
  const tags = text => text.match(/<[^>]+>/g);
  for (const id of ['zh-Hans', 'de']) {
    setLang(id);
    for (const source of TUTO) {
      const translated = trh(source);
      assert.notEqual(translated, source);
      assert.deepEqual(tags(translated), tags(source));
    }
  }
});

test('les quarante quêtes sont traduites des titres aux répliques dans les deux aperçus', () => {
  for (const id of ['zh-Hans', 'de']) {
    setLang(id);
    assert.deepEqual(Object.keys(QUEST_TRANSLATIONS[id]).sort(), QUESTS.map(q=>q.id).sort());
    for (const q of QUESTS) {
      for (const source of [q.t,q.d,q.c]) {
        assert.ok(Object.hasOwn(TEXT_CATALOGS[id],source),q.id);
        assert.notEqual(tr(source),source,q.id);
      }
    }
  }
});

test('les deux aperçus couvrent toutes les scènes et les six personnages de l’épilogue', () => {
  for (const locale of Object.values(STORY_LOCALES)) {
    for (const [id,lines] of Object.entries(SC)) {
      for (const index of lines.keys()) {
        assert.ok(storyLine(locale,id,index)?.trim(),id+' '+index);
      }
      assert.equal(storyLine(locale,id,lines.length),undefined,id);
    }
    assert.deepEqual(Object.keys(locale.outro),OUTRO.map(([name])=>name));
  }
});

test('chaque pièce d’équipement a un nom dans les deux aperçus', () => {
  assert.deepEqual(Object.keys(EQUIPMENT).sort(),ITEMS.map(item=>item.n).sort());
  for (const id of ['zh-Hans','de']) {
    setLang(id);
    for (const {n} of ITEMS) assert.notEqual(tr(n),n);
  }
});

test('les sorts ont tous un nom et une description de base dans les deux aperçus', () => {
  for (const id of ['zh-Hans','de']) {
    setLang(id);
    for (const spell of Object.values(SP)) {
      for (const source of [spell.n,spell.d]) assert.ok(Object.hasOwn(TEXT_CATALOGS[id],source),source);
      assert.notEqual(tr(spell.d),spell.d);
    }
  }
});

test('les astuces de combat et les intros de boss sont traduites avec leurs balises', () => {
  const tags = text => text.match(/<[^>]+>/g);
  for (const id of ['zh-Hans','de']) {
    setLang(id);
    for (const source of Object.values(TIPS).flat()) {
      assert.notEqual(trh(source),source);
      assert.deepEqual(tags(trh(source)),tags(source));
    }
    for (const source of [...Object.values(TIPS_T),'Un gardien redoutable']) {
      assert.ok(tr(source).trim());
      assert.notEqual(tr(source),source);
    }
  }
});

test('les objectifs traduits conservent le nombre de tours et le bonus de vague', () => {
  const fr='<b>Exemple</b><br>Tenir 7 tours<br>+25 %';
  for (const id of ['zh-Hans','de']) {
    setLang(id);
    const goal=battleGoal(id,'waves',7);
    regHtml(fr,undefined,{[id]:goal});
    assert.equal(trh(fr),goal);
    assert.match(goal,/7/);
    assert.match(goal,/25 ?%/);
    assert.deepEqual(goal.match(/<[^>]+>/g),fr.match(/<[^>]+>/g));
    assert.match(battleGoal(id,'survive',9),/9/);
    assert.ok(battleGoal(id,'chief'));
  }
});

import {MASTERY,mastTxt} from '../src/mastery.js';
test('les effets de maîtrise traduits conservent les valeurs des 3 rangs', () => {
  const numbers = text => (text.match(/\d+/g)??[]).sort();
  for (const id of Object.keys(MASTERY)) {
    for (const rank of [1,2,3]) {
      const source=mastTxt(id,rank);
      for (const lang of ['zh-Hans','de']) {
        const translated=mastTxt(id,rank,lang);
        assert.notEqual(translated,source);
        assert.doesNotMatch(translated,/undefined/);
        assert.deepEqual(numbers(translated),numbers(source),id);
      }
    }
  }
});

test('toutes les spécialisations, talents et variantes de sorts ont deux traductions', () => {
  for(const lang of ['zh-Hans','de']){
    const catalog=TEXT_CATALOGS[lang];
    for(const spec of SPECS.flat()){
      for(const key of [spec.n,spec.d])assert.ok(catalog[key]?.trim(),key);
      for(const [name,desc,fx] of spec.t){
        for(const key of [name,desc])assert.ok(catalog[key]?.trim(),key);
        for(const variant of Object.values(fx.sp??{})){
          if(variant.d)assert.ok(catalog[variant.d]?.trim(),variant.d);
        }
      }
    }
  }
});

test('chaque entrée du bestiaire et des trophées est présente dans les deux aperçus', () => {
  const keys=[...BEASTS.map(k=>beastInfo(k).n),...TROPHIES.flatMap(t=>[t.n,t.d])];
  for(const id of ['zh-Hans','de']){
    for(const key of keys)assert.ok(TEXT_CATALOGS[id][key]?.trim(),key);
  }
});
