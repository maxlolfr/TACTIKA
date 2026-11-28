import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLanguage, LANGUAGES} from '../src/locales/languages.js';
import {SC,OUTRO} from '../src/story.js';
import {STORY_LOCALES,storyLine} from '../src/locales/story.js';
import {TUTO} from '../src/tips.js';
import {QUESTS} from '../src/quests.js';
import {QUEST_TRANSLATIONS} from '../src/locales/quests.js';
import {setLang, tr, trh, TEXT_CATALOGS} from '../src/i18n.js';

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
