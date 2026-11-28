// V5.12.3 : chaque module de src/ doit être du JavaScript valide (une accolade oubliée dans audio.js bloquait tout le jeu en V5.12.2).
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const dir=new URL('../src/',import.meta.url).pathname;
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js')))
 test('syntaxe valide : src/'+f,()=>{const r=spawnSync(process.execPath,['--check',dir+f],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)});
