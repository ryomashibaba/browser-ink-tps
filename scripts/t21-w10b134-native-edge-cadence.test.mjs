import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync('src/app/UndertowF3PlayablePreviewApp.ts','utf8');
const guide=readFileSync('src/app/UndertowF3OriginalEdgeGuidance.ts','utf8');
test('B134: source HUD is redrawn on real fixed KCC steps before stale GPU refresh',()=>{
 const first=code.indexOf('private stepFixed(frame:number,seconds:number)');
 const last=code.indexOf('private update(dt:number)',first);
 assert.ok(first>=0&&last>first);
 const fixed=code.slice(first,last);
 assert.ok(fixed.includes('this.physics.step();'));
 assert.ok(fixed.includes('this.player.syncAfterPhysics(seconds);'));
 const pos=fixed.indexOf('this.b129EdgeCoach.render(trueNativeEdge,');
 assert.ok(pos>fixed.indexOf('this.player.syncAfterPhysics(seconds);'));
 assert.ok(fixed.includes('this.originalEdgeGuidance(frame);'));
 assert.ok(code.includes('private originalEdgeGuidance(nativeTick:number)'));
 assert.ok(code.includes('const b129Edge=this.originalEdgeGuidance(this.clock.tick);'));
 assert.ok(code.includes('this.renderedFrames%12===0')); // heavy HUD still throttled
 assert.equal(code.split('private originalEdgeGuidance(nativeTick:number)').length,2);
 assert.ok(guide.includes("input.nativeKccGrounded===true"));
 assert.ok(guide.includes("input.matchState==='PLAYING'"));
 assert.ok(guide.includes("input.realOriginalFootSolidId===SOURCE"));
 assert.ok(guide.includes("flat.actualNamedOriginalSolidId===input.realOriginalFootSolidId"));
});
test('B134: edge guidance is read-only and anchored to frozen source',()=>{
 const body=code.slice(code.indexOf('private originalEdgeGuidance(nativeTick:number)'),
  code.indexOf('public snapshot(){'));
 assert.ok(body.includes('this.physics.castCharacterFootSupport('));
 assert.ok(body.includes('inspectB130OriginalFlatSource('));
 assert.ok(body.includes('nativeTick'));
 assert.ok(body.includes('stageAuthority:[this.rawStage.solids.length,'));
 assert.ok(!body.includes('teleport('));
 assert.ok(!body.includes('setPosition('));
 assert.ok(!body.includes('advanceQaTicks('));
});
