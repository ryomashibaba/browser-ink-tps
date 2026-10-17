import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {patchSources} from './w2-stage-input.mjs';
import {SCHEMA} from './w2-worker.mjs';

const base='413a0acdfdb2b0f74550b653fa78fff9c0f5727d';
const file=path=>execFileSync('git',['show',base+':'+path],{encoding:'utf8'});
test('actual historical public source accepts the exact isolated patch',()=>{
 const player=file('src/input/PlayerInput.ts');
 const app=file('src/app/UndertowF3PlayablePreviewApp.ts');
 const result=patchSources(player,app);
 assert.match(result.player,/T21_QA_AXIS_NOT_AUTHORIZED/);
 assert.match(result.app,/T21_QA_DETERMINISTIC_INPUT_FORBIDDEN/);
 assert.match(result.app,/t21QaPauseOnBoot/);
 assert.match(result.app,/return this.advanceQaTicks\(count\)/);
 assert.doesNotMatch(result.player,/setTranslation\(/);
 assert.doesNotMatch(result.app,/new StageSolid/);
 assert.equal(SCHEMA,'t21-f4e103w2-real-kcc-no-pointerlock/v1');
});
test('the patch rejects ambiguous and changed anchors',()=>{
 const player=file('src/input/PlayerInput.ts');
 const app=file('src/app/UndertowF3PlayablePreviewApp.ts');
 assert.throws(()=>patchSources(player.replace('  private readonly keys = new Set<string>();',''),app),
  /HOLD_W2_ANCHOR_INPUT_FIELD/);
 assert.throws(()=>patchSources(player,app.replace(' private paused=false;','')),
  /HOLD_W2_ANCHOR_APP_PAUSED_BOOT/);
 assert.throws(()=>patchSources(player+'// qaAxis',app),/HOLD_W2_PREVIOUS_QA_INPUT_PATCH_FOUND/);
});
test('no privileged use of QA input in regular source',()=>{
 const player=file('src/input/PlayerInput.ts'),app=file('src/app/UndertowF3PlayablePreviewApp.ts');
 const patch=patchSources(player,app);
 assert.match(patch.app,/qa.get\('t21Play'\)==='preview'/);
 assert.match(patch.app,/qa.get\('t21QaInput'\)==='deterministic'/);
 assert.match(patch.app,/qa.get\('t21KccAudit'\)==='readOnly'/);
 assert.match(patch.app,/!this.paused/);
 assert.match(patch.app,/document.pointerLockElement===this.canvas/);
 assert.match(patch.player,/this\.qaAxis\?\.x/);
});
