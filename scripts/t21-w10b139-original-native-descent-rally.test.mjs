import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sampleB140RealSourcePhysicalTrace} from './t21-w10b140-real-physics-sample.mjs';
const s=readFileSync('scripts/t21-w10b139-original-native-descent-rally.mjs','utf8');
const w=readFileSync('.github/workflows/t21-w10b139-original-native-descent-rally.yml','utf8');
test('B139 genuine source-only real keyboard first descent and 7 CPU gating',()=>{
 for(const sample of ["TRUE_SOURCE_FIRST_DROP_W200","TRUE_SOURCE_LOWER_LANDING_D12",
  "TRUE_SOURCE_LOWER_FORWARD_W18","nativeOriginalKeyboard(phase,observe)",
  "n.matchState==='PLAYING'","n.cpu.physicalRejoins.length===7",
  "n.cpu.freeCombatEnabled","b112OriginalHumanGround","actualHumanKccBody",
  "actualA1RapierFoot","actualHumanKccGrounded","t21W10B137=allyRally",
  "n.cpu.physicalFootRelocations!==0",
  "Input.dispatchKeyEvent","Input.dispatchMouseEvent",
  "sampleB140RealSourcePhysicalTrace(n,phase)"])
  assert.ok(s.includes(sample),'Missing genuine native evidence: '+sample);
 const helper=readFileSync('scripts/t21-w10b140-real-physics-sample.mjs','utf8');
 assert.match(helper,/originalRapierSupportId/);
 assert.match(helper,/actualHumanKccBody:\[\.\.\.realHumanBody\]/);
 assert.match(w,/variant: \[FIXED_DEFAULT, ALLY_RALLY\]/);
});
test('B139 makes no synthetic game progress or source authority promotions',()=>{
 for(const forbidden of ["qaDriveTicks(", "teleport(", "setTranslation(", "this.matchState='PLAYING'"])
  assert.ok(!s.includes(forbidden),'Forbidden original source manipulation: '+forbidden);
 for(const strict of ["n.originalSourceSolids!==25","n.originalPaintSurfaces!==17",
  "n.originalSourceNavigationLinks!==26","n.sourceScoreablePromotions!==0",
  "n.productionAuthorized!==false","n.unrestricted4v4Certified!==false"])
  assert.ok(s.includes(strict));
});

test('B145 requires actual lower grounded human KCC AND original source support',()=>{
 const app=readFileSync('src/app/UndertowF3PlayablePreviewApp.ts','utf8');
 const physical=readFileSync('scripts/t21-w10b140-real-physics-sample.mjs','utf8');
 assert.ok(app.includes('canonicalHumanFootOffsetMeters:'));
 assert.ok(app.includes('PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters'));
 assert.ok(physical.includes('originalRapierSourceSupportGapMeters'));
 assert.ok(s.includes('x.actualHumanKccGrounded!==true'));
 assert.ok(s.includes('Math.abs(x.originalRapierSourceSupportGapMeters)>.22'));
 assert.ok(s.includes('footY>=2.7&&footY<=5.25'));
 assert.ok(s.includes('b145NativeOriginalLowerFootEvidence:realNativeEvidence'));
 assert.ok(s.includes("nativeOutcome:'UNVERIFIED_AFTER_FAILURE'"));
 assert.ok(!s.includes('x.actualHumanKccBody[2]>=33).length'));
});

test('B146 genuine physical KeyA then no-input coast on unchanged real source',()=>{
 const app=readFileSync('src/app/UndertowF3PlayablePreviewApp.ts','utf8');
 const sample=readFileSync('scripts/t21-w10b140-real-physics-sample.mjs','utf8');
 assert.ok(s.includes("B146_TRUE_ORIGINAL_INWARD_A12"));
 assert.ok(s.includes("B146_TRUE_ORIGINAL_COAST60"));
 assert.ok(s.includes("KeyA:{key:'a',code:'KeyA'"));
 assert.ok(s.includes("b146ActualNativeSourceInward:b146ActualNativeSourceInward"));
 assert.ok(s.includes("x.b146OriginalFlatEdgeClearanceMeters>=.75"));
 assert.ok(app.includes('b146OriginalLowerFootprint:b146Flat'));
 assert.ok(app.includes('inspectB130OriginalFlatSource({'));
 assert.ok(sample.includes('b146OriginalFlatEdgeClearanceMeters:'));
 for(const forbidden of ['teleport(', 'setTranslation(', 'qaDriveTicks('])
  assert.ok(!s.includes(forbidden),'synthetic physical input forbidden: '+forbidden);
});
