import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyB315TrueThreeSourceHumanPaint} from
 './t21-b315-verify-native-three-surface-ink.mjs';
const root='UndertowT21D:';
const src=['spawn-high-positive-z:paint',
 'first-drop-landing-positive-z:paint',
 'right-low-route-ramp-positive-z:paint'].map(s=>root+s);
const frame=()=>Array.from({length:17},(_,i)=>({
 surfaceId:src[i]??root+'original-'+i+':paint',
 originalOwnedA:100,originalOwnedB:0,
 originalNeutral:900,activeOriginalCells:1000
}));
const attempt=(target,previous,tick)=>{
 const a=frame(),b=frame();b.find(x=>x.surfaceId===target).originalOwnedA+=9;
 b.find(x=>x.surfaceId===target).originalNeutral-=9;
 return {targetId:target,verdict:'GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS',
  sourceGeometryChanged:false,official4v4Certified:false,
  productionAuthorized:false,artAccepted:false,
  originalHumanPaintSourceBefore:previous,
  originalHumanPaintSourceAfter:target,
  lastHumanImpactOnTarget:true,distinctFromPriorHumanPaintSurface:true,
  beforeNativeTick:tick,afterNativeTick:tick+42,
  realNewShots:6,realHumanChangedCells:9,targetNewTeamACells:9,
  realHumanFootSupportedBefore:true,realHumanFootSupportedAfter:true,
  beforeFoot:root+'first-drop-landing-positive-z',
  afterFoot:root+'first-drop-landing-positive-z',
  original17Before:a,original17After:b,targetTeamABefore:100,
  targetTeamAAfter:109,
  selectedOriginalActiveCell:{originalActiveSourceCell:true,safe:true,
   world:[0,3,50],grid:[2,4],actualCDP:[800,400],
   targetYaw:10,targetPitch:-21},
  measuredRealCameraAfterAim:{yawDegrees:10,pitchDegrees:-21}};
};
const good=()=>({
 schema:'B312_GENUINE_SECOND_ORIGINAL_HUMAN_PAINT_ATTEMPT',
 source:'25/17/26/0',genuineCDPKeyboardMouse:true,
 original4v4Certified:false,artAccepted:false,productionAuthorized:false,
 lowerInitial:{realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:root+'first-drop-landing-positive-z',
  sourceActorRelocations:0,sourceInkRewritten:false,
  playerPositionRewritten:false,humanLastPaintedSurface:src[0],
  humanChangedCells:808,tick:1728,originalRows:frame()},
 originalTargetAttempts:[
  attempt(src[1],src[0],1728),attempt(src[2],src[1],1812)],
 provenSecondPaintSources:[src[1],src[2]]
});
test('B315 genuine distinct original 3 surface event and native owner proof',()=>{
 const a=verifyB315TrueThreeSourceHumanPaint(good());
 assert.equal(a.distinctHumanPaintSurfaceIds.length,3);
 assert.equal(a.original4v4Certified,false);
});
test('B315 refuses CPU-only target growth without real human target event',()=>{
 const x=good();x.originalTargetAttempts[0].lastHumanImpactOnTarget=false;
 assert.throws(()=>verifyB315TrueThreeSourceHumanPaint(x));
});
test('B315 refuses one surface, unsupported body, camera mismatch or absent third source',()=>{
 const x=good();x.originalTargetAttempts[1].originalHumanPaintSourceBefore=src[0];
 assert.throws(()=>verifyB315TrueThreeSourceHumanPaint(x));
 const y=good();y.lowerInitial.realHumanOriginalFootSupported=false;
 assert.throws(()=>verifyB315TrueThreeSourceHumanPaint(y));
 const z=good();z.originalTargetAttempts[0].measuredRealCameraAfterAim.yawDegrees=50;
 assert.throws(()=>verifyB315TrueThreeSourceHumanPaint(z));
 const w=good();w.originalTargetAttempts[0].original17After.pop();
 assert.throws(()=>verifyB315TrueThreeSourceHumanPaint(w));
});
