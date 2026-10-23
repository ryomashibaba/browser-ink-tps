import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const runner=readFileSync('scripts/t21-w10b112-genuine-human-floor-walk.mjs','utf8');
test('B133 native gameplay wait never bypasses source CPU or changes physics',()=>{
 assert.ok(runner.includes("return n.matchState==='PLAYING'?n:false;"));
 assert.ok(runner.includes("n.originalSourceSolids!==25"));
 assert.ok(runner.includes("n.sourceScoreablePromotions!==0"));
 assert.ok(runner.includes("realNativeTickAtPlaying:playing.tick"));
 assert.ok(runner.includes("b132UiWitnesses.length<32"));
 assert.ok(runner.includes("n.b129OriginalRaisedEdgeGuidance?.showCaution===true"));
 assert.ok(!runner.includes("this.matchState='PLAYING'"));
 assert.ok(!runner.includes("qaDriveTicks("));
});
