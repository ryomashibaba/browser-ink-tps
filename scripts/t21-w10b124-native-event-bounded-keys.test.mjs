import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB124RealNativeEventBoundedKeyboardPhases as audit}
 from './t21-w10b124-native-event-bounded-keys.mjs';
const labels=['FIRST_DROP_GENUINE_FORWARD',
 'LOWER_LANDING_REAL_KEYD_LATERAL','LOWER_LANDING_FORWARD',
 'REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP',
 'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_1',
 'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_2'];
const keys=['KeyW','KeyD','KeyW','KeyD','KeyW','KeyW'];
const end=[210,222,240,324,348,372];
const originalRaised='UndertowT21D:right-low-team-a';
const evidence=()=>end.map((stop,i)=>({
 label:labels[i],actualCDPKeyboardKeys:[keys[i]],
 genuineStartTick:i?end[i-1]:6,
 genuineEndTick:stop,
 observedSourceSolid:i>=3?originalRaised:
  'UndertowT21D:first-drop-landing-positive-z',
 trueKccGrounded:true
}));
test('real B124 KCC on raised slab early D90 end 84 ticks is accepted, no invented time',()=>{
 const r=audit(evidence(),6,372);
 assert.equal(r.completed,true);
 assert.deepEqual(r.measuredActualNativePhaseDurations,
  [204,12,18,84,24,24]);
 assert.equal(r.measuredTotalNativeTicks,366);
 assert.equal(r.actualRampCDPKeyDTicks,84);
 assert.equal(r.syntheticTickAdded,false);
 assert.equal(r.playerOrCpuPoseSetByAudit,false);
 assert.equal(r.official4v4Certified,false);
});
test('do not accept early D release without actual different original KCC',()=>{
 const p=evidence();
 p[3].observedSourceSolid='UndertowT21D:right-low-route-ramp-positive-z';
 assert.equal(audit(p,6,372).completed,false);
 p[3].observedSourceSolid=originalRaised;p[3].trueKccGrounded=false;
 assert.equal(audit(p,6,372).completed,false);
});
test('do not accept missing or shortened actual W input, even when point is inside',()=>{
 const p=evidence();p[5].genuineEndTick=371;
 assert.equal(audit(p,6,371).completed,false);
 p[5].genuineEndTick=372;p[4].genuineEndTick=347;
 assert.equal(audit(p,6,372).completed,false);
});
test('do not accept a broken phase boundary or invented incomplete source event',()=>{
 const p=evidence();p[4].genuineStartTick=325;
 assert.equal(audit(p,6,372).completed,false);
 p[4].genuineStartTick=324;p[2].actualCDPKeyboardKeys=['KeyA'];
 assert.equal(audit(p,6,372).completed,false);
});
test('nominal 368-tick budget is NOT evidence for a full physical 368-tick run',()=>{
 const r=audit(evidence(),6,372);
 assert.equal(r.nominalExclusiveTrialBudgetTicks,368);
 assert.equal(r.measuredTotalNativeTicks,366);
 assert.equal(r.originalRaisedSourceEventReached,true);
 assert.equal(r.actualTwoIndependentWKeySegmentsCompleted,true);
});
