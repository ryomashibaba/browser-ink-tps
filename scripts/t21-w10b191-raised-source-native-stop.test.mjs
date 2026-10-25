import {test} from 'node:test';
import assert from 'node:assert/strict';
import {b191ActualNativeRaisedOriginalArrival as arrived}
 from './t21-w10b191-raised-source-native-stop.mjs';
const a=()=>({
 tick:421,matchState:'PLAYING',stopReason:null,
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false,
 b183OriginalHumanDescent:{
  originalFirstDropLocalPracticeClear:true,
  actualOriginalRapierLowerLandingId:'UndertowT21D:first-drop-landing-positive-z',
  trueNativeLandingTick:290
 },
 b112OriginalHumanGround:{
  genuineKccGrounded:true,
  lastOriginalSourceHitId:'UndertowT21D:right-low-team-a',
  lastOriginalSourceGapMeters:.025
 }
});
test('real B123-style physical raised floor stops KeyD before 90 tick overshoot',()=>{
 assert.equal(arrived(a(),'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),true);
});
test('must not release movement on ramp, nearby floor or ungrounded foot',()=>{
 const s=a();s.b112OriginalHumanGround.lastOriginalSourceHitId=
  'UndertowT21D:right-low-route-ramp-positive-z';
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
 s.b112OriginalHumanGround.lastOriginalSourceHitId='UndertowT21D:right-low-team-a';
 s.b112OriginalHumanGround.genuineKccGrounded=false;
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
});
test('must not promote a raised source hit without a real positive-Z first-drop',()=>{
 const s=a();s.b183OriginalHumanDescent.originalFirstDropLocalPracticeClear=false;
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
 s.b183OriginalHumanDescent.originalFirstDropLocalPracticeClear=true;
 s.b183OriginalHumanDescent.actualOriginalRapierLowerLandingId=
  'UndertowT21D:first-drop-landing-negative-z';
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
});
test('old evidence and wrong stage never count as current native arrival',()=>{
 const s=a();
 assert.equal(arrived(s,'ACTUAL_KEYW_200_FIRST_DROP'),false);
 s.tick=s.b183OriginalHumanDescent.trueNativeLandingTick;
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
});
test('no endpoint without authentic source KCC distance and frozen mask',()=>{
 const s=a();s.b112OriginalHumanGround.lastOriginalSourceGapMeters=.5;
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
 s.b112OriginalHumanGround.lastOriginalSourceGapMeters=.025;
 s.sourceScoreablePromotions=1;
 assert.equal(arrived(s,'ACTUAL_KEYD_90_ORIGINAL_UPHILL'),false);
});
