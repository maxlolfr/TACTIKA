import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLanguage, LANGUAGES} from '../src/locales/languages.js';
import {TROPHIES,BEASTS,beastInfo} from '../src/chronicle.js';
import {SPECS} from '../src/talents.js';
import {ITEMS,SP} from '../src/data.js';
import {EQUIPMENT} from '../src/locales/equipment.js';
import {SC,OUTRO,OUTRO_END} from '../src/story.js';
import {STORY_LOCALES,storyLine} from '../src/locales/story.js';
import {TUTO,TIPS,TIPS_T} from '../src/tips.js';
import {QUESTS} from '../src/quests.js';
import {QUEST_TRANSLATIONS} from '../src/locales/quests.js';
import {AIM_UI, BATTLE_HUD, battleHazard, battleCallout, ENEMY_DETAILS, RESULT_UI} from '../src/locales/combat-ui.js';
import {battleGoal} from '../src/locales/battle-tips.js';
import {regHtml, setLang, tr, trh, EN, TEXT_CATALOGS} from '../src/i18n.js';

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

test('chaque réplique et chaque texte de fin disposent de leurs versions française et anglaise', () => {
  for (const [id,lines] of Object.entries(SC)) {
    for (const [speaker,fr,en] of lines) {
      assert.ok(fr?.trim()&&en?.trim(),`${id} / ${speaker}`);
    }
  }
  for (const [speaker,fr,en] of OUTRO)assert.ok(fr?.trim()&&en?.trim(),speaker);
  assert.ok(OUTRO_END.every(text=>text.trim()));
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

import {VILLAGE_UI,contractLabel} from '../src/locales/village.js';
test('les contrats et récompenses localisés affichent les valeurs du contrat', () => {
 for(const lang of ['zh-Hans','de']){
  for(const k of ['win','kill','star'])assert.match(contractLabel(lang,{k,n:7},'Test'),/7/);
  assert.match(contractLabel(lang,{k:'kill',n:7},'Test'),/Test/);
  assert.match(VILLAGE_UI[lang].reward(125,42),/125.*42/);
  assert.match(VILLAGE_UI[lang].potion(2,5),/40.*2\/5/);
 }
});

import {MOD_IDS,modText} from '../src/elites.js';
import {eliteName} from '../src/locales/elites.js';
test('les huit affixes ont des descriptions localisées et le nom conserve sa lettre de repère', () => {
 for(const lang of ['zh-Hans','de']){
  const descriptions=modText({mods:MOD_IDS},lang);
  assert.equal(descriptions.length,8);
  descriptions.forEach((description,index)=>assert.notEqual(description,modText({mods:MOD_IDS},'fr')[index]));
  const unit={n:'Gelée (Champion : Gardien, Explosif) A',tag:'A',champ:1,mods:['garde','bombe']};
  setLang(lang);
  assert.equal(eliteName(lang,unit,tr),lang==='de'?'Schleim (Champion: Wächter, Explosiv) A':'史莱姆 (冠军: 守护, 爆裂) A');
  assert.equal(unit.n,'Gelée (Champion : Gardien, Explosif) A');
 }
});

test('les deux catalogues couvrent complètement le registre anglais', () => {
 for(const lang of ['zh-Hans','de']){
  const catalog=TEXT_CATALOGS[lang];
  assert.deepEqual(Object.keys(EN).filter(key=>!catalog[key]?.trim()),[],lang);
 }
});

import {CM_TITLES,CM_TROPHIES,tN,tD,titleName} from '../src/cmrewards.js';
test('les nouveaux titres et trophées du Cauchemar sont localisés', () => {
 for (const lang of ['zh-Hans','de']) {
  const save={lang,cm:{t:'eveille',k:{w:1}}};
  for (const reward of [...CM_TITLES,...CM_TROPHIES]) {
   assert.notEqual(tN(save,reward),reward.n,reward.id);
   assert.notEqual(tD(save,reward),reward.d,reward.id);
  }
  assert.equal(titleName(save),lang==='de'?'Der Erwachte':'觉醒者');
 }
});


test('le HUD des quatre langues préserve étape, niveau, coûts et danger', () => {
  const samples = {
    fr:['Étape 4/10','niv. 12','PM 3','dalles dorées'],
    en:['Stage 4/10','lvl 12','3 MP','gold tiles'],
    'zh-Hans':['关卡 4/10','12级','3移动点','金色地砖'],
    de:['Etappe 4/10','Stufe 12','3 BP','Goldene Platten'],
  };
  for (const [id,[stage,level,move,trap]] of Object.entries(samples)) {
    const hud=BATTLE_HUD[id];
    assert.equal(hud.stage(4,10),stage);
    assert.equal(hud.level(12),level);
    assert.equal(hud.points(2,3)[1],move);
    assert.equal(battleHazard(hud,{next:[]},12),'');
    const warning=battleHazard(hud,{next:[{}],trap:true},12);
    assert.ok(warning.includes(trap));
    assert.match(warning,/12\s*%/);
    assert.equal(battleHazard(hud,{next:[{}],cold:true},12),hud.cold);
    assert.equal(battleHazard(hud,{next:[{}],toxic:true},12),hud.toxic);
  }
});


test('les aperçus localisés affichent le coût et le nombre de cibles', () => {
  for (const [id, units] of [['en','MP'], ['zh-Hans','移动点'], ['de','BP']]) {
    const text=AIM_UI[id];
    const summary=text.movePreview(3,text.moveTarget('Arc',2));
    assert.ok(summary.includes(units));
    assert.ok(summary.includes('3'));
    assert.ok(summary.includes('Arc'));
    assert.ok(summary.includes('2'));
    assert.doesNotMatch(summary,/Retouche|aucune cible/);
  }
});


test('les alertes, portraits ennemis et bilans anglais conservent les valeurs', () => {
  setLang('en');
  assert.equal(battleCallout('en','Venin −4 / tour',tr),'Venom −4 per turn');
  assert.equal(battleCallout('en','Bouclier −12',tr),'Shield −12');
  assert.equal(battleCallout('en','+2 PA reporté',tr),'+2 AP carried over');
  assert.equal(battleCallout('en','Drain bloqué',tr),'Life drain blocked');
  assert.equal(ENEMY_DETAILS.en.base(8,20,32,3),'Lvl 8 · 20/32 HP · 3 MP');
  assert.equal(RESULT_UI.en.remaining(1),'1 enemy still standing');
  assert.equal(RESULT_UI.en.remaining(3),'3 enemies still standing');
  setLang('fr');
  assert.equal(battleCallout('fr','Bouclier −12',tr),'Bouclier −12');
});

test('le bilan anglais localise les trophées et le déblocage des boss pilotes', () => {
  assert.equal(RESULT_UI.en.trophy('Gold','First victory'),'Gold trophy: First victory');
  assert.equal(RESULT_UI.en.pilot('Alpha Wolf'),'Pilot boss awakened at the Crystal: Alpha Wolf');
});


test('les contrats anglais couvrent les quatre types et gardent les quantités', () => {
  assert.equal(contractLabel('en',{k:'kill',n:6},'Slime'),'Defeat 6 enemies of this type: Slime');
  assert.equal(contractLabel('en',{k:'win',n:1}),'Win 1 battle');
  assert.equal(contractLabel('en',{k:'star',n:2}),'Win 2 battles with 3 stars');
  assert.equal(contractLabel('en',{k:'boss'}),'Defeat a boss. Rematches count.');
});
