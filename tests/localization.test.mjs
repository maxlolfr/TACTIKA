import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLanguage, LANGUAGES} from '../src/locales/languages.js';
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
