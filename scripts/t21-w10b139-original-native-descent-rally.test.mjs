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
  "n.cpu.physicalFootRelocations!==0","originalRapierSupportId",
  "Input.dispatchKeyEvent","Input.dispatchMouseEvent",
  "sampleB140RealSourcePhysicalTrace(n,phase)"])
  assert.ok(s.includes(sample),'Missing genuine native evidence: '+sample);
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
