import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {b273InspectNativeKccSample,b273AuditContinuousKeyboardLegs}
 from './t21-b273-real-native-kcc-transition.mjs';
function state(tick,z,y=8.4,hit='UndertowT21D:spawn-high-positive-z'){
 return {paused:false,matchState:'STAGING',stopReason:null,
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  player:{position:[.13,y,z]},tick,b112OriginalHumanGround:{
   enabled:true,genuineKccGrounded:true,
   lastOriginalSourceHitId:hit,lastOriginalSourceGapMeters:0.02}};
}
test('actual two keyboard legs on source high do not certify a new support',()=>{
 const r=b273AuditContinuousKeyboardLegs([
  state(201,68),state(225,66.3),state(249,64.6)]);
 assert.equal(r.actualVerifiedLowerSupportReached,false);
 assert.equal(r.legs.length,2);
 assert.equal(r.original4v4Certified,false);
 assert.equal(r.sourceNotChanged,undefined);
});
test('only native lower grounded original support can certify transition',()=>{
 const x=[state(201,68),state(225,66.2),
 state(249,63.5,5.2,'UndertowT21D:right-low-team-a')];
 const r=b273AuditContinuousKeyboardLegs(x);
 assert.equal(r.actualVerifiedLowerSupportReached,true);
 assert.equal(r.supportedOriginalGroundTransitions.length,1);
 assert.equal(r.productionAuthorized,false);
 const fall=state(249,63.5,5.2,'UndertowT21D:right-low-team-a');
 fall.b112OriginalHumanGround.genuineKccGrounded=false;
 assert.equal(b273AuditContinuousKeyboardLegs([x[0],x[1],fall])
   .actualVerifiedLowerSupportReached,false);
});
test('reject unsupported source and an implausible actor teleport',()=>{
 const a=state(201,68);a.originalSourceSolids=26;
 assert.throws(()=>b273InspectNativeKccSample(a),/ORIGINAL_KCC_STATE_MISSING/);
 assert.throws(()=>b273AuditContinuousKeyboardLegs([
  state(201,68),state(225,15)]),/UNTRUSTED_PHYSICAL_MOVEMENT_JUMP/);
});
test('no fake ground ledger may promote a nav endpoint into support',()=>{
 const a=state(201,68);
 a.b112OriginalHumanGround.enabled=false;
 assert.throws(()=>b273InspectNativeKccSample(a),/GROUND_TELEMETRY_NOT_ENABLED/);
 const s=state(201,68);
 s.b112OriginalHumanGround.lastOriginalSourceHitId='Invented:low';
 assert.equal(b273InspectNativeKccSample(s).supportId,null);
});
