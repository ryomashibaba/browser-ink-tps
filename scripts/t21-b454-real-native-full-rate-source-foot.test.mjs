import test from 'node:test';
import assert from 'node:assert/strict';
import {auditRealB454} from './t21-b454-real-native-full-rate-source-foot.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(){
 const frames=Array.from({length:30},(_,i)=>({tick:1060+i*24,
  physicalFeet:ids.map(id=>({id,foot:id==='B2'?[1,3.1,-53]:
   id==='B4'?[-1,3.1,-52]:[0,3.1,53]}))}));
 const rows=id=>Array.from({length:730},(_,i)=>({
  tick:1055+i,id,foot:id==='B2'?[1,3.1,-53]:[-1,3.1,-52],
  mode:'GROUND',life:'ACTIVE',rejoined:true,
  originalRapierSolidId:'UndertowT21D:first-drop-landing-negative-z',
  originalRapierHitY:3,registeredOriginalHit:true,
  absFootToRapierY:.1,withinUnchanged025m:true,sourceBRegion:true}));
 const dry=id=>({id,nativeIntermediateSupport:1,
  b450FailedOriginalGoals:[{firstDenied:{xyz:id==='B2'?[1,3.28,-53]:
   [-1,3.28,-52],cause:'NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',
   verticalGapMeters:.28}}]});
 const raw={schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',browserOrigin:100,syntheticInput:false,
  officialWinner:'NONE',actorWrites:0,scoreWrites:0,nativeClockWrites:0,
  sourceGeometryWrites:0,formal4v4Certified:false,
  b441NativeEvidence:{source:'25/17/26/0',realSevenCpu:true,
   naturalOpposingTeamRouteCertified:false,b442Formal4v4Certified:false,
   realNativeTicks:720,lastTick:1780,realFrames:frames,
   b446LiveActualCpuFootDryRouteProbes:[dry('B2'),dry('B4')]}};
 const source={schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1',
  source:'25/17/26/0',browserWorldOrigin:100,
  nativePhysicsFootSource:true,originalKccOrGameWrites:0,
  originalSourceGeometryWrites:0,actorWrites:0,scoreWrites:0,
  nativeClockWrites:0,originalPathAuthorizationChanged:false,
  continuousCapsuleContactCertified:false,b2b4FrontlineGoalCertified:false,
  originalWinner:'NONE',dropped:{B2:0,B4:0},
  rows:{B2:rows('B2'),B4:rows('B4')}};
 return {raw,source};
}
test('accepts only complete same-world native ticks without route promotion',()=>{
 const {raw,source}=fixture();const v=auditRealB454(raw,source);
 assert.equal(v.B2B4.B2.missingNativeTicks,0);
 assert.equal(v.B2B4.B2.groundedSourceReadySamples,730);
 assert.equal(v.B2B4.B2.observedGroundedMotionNativeTicks,0);
 assert.equal(v.B2B4.B2.longestGroundedStationaryNativeTicks,729);
 assert.equal(v.B2B4.B2.first120GroundedMeters,0);
 assert.equal(v.B2B4.B2.last120GroundedMeters,0);
 assert.equal(v.B2B4.B4.independentlyMatchedSparseChromePolls,30);
 assert.equal(v.B2B4.B2.fullyContinuousCapsuleContactCertified,false);
 assert.equal(v.originalCollisionSafetyGateChanged,false);
});
test('rejects fake original provenance, missing tick, altered real poll or score',()=>{
 const variants=[
 d=>d.source.browserWorldOrigin=999,
 d=>d.source.rows.B2.splice(30,1),
 d=>d.source.rows.B4[10].registeredOriginalHit=false,
 d=>d.raw.b441NativeEvidence.realFrames[5].physicalFeet[4].foot=[999,3,-40],
 d=>d.source.scoreWrites=1,
 d=>d.source.dropped.B2=1,
 d=>d.source.rows.B2[30].foot=[1,NaN,-53]
 ];
 for(const f of variants){
  const d=fixture();f(d);
  assert.throws(()=>auditRealB454(d.raw,d.source),
   /B454_ORIGINAL_NATIVE_60HZ_SOURCE_HOLD/);
 }
});

test('separates genuine late CPU travel from an actually stationary early foot',()=>{
 const {raw,source}=fixture();
 // Preserve a continuous real-foot-shaped 60Hz sequence and update the
 // independent sparse Chromium observations to match the exact same ticks.
 const rows=source.rows.B2;
 for(let k=300;k<rows.length;k++)
  rows[k].foot=[1+(k-299)*.03,3.1,-53];
 for(const frame of raw.b441NativeEvidence.realFrames){
  const k=frame.tick-1055;
  frame.physicalFeet.find(p=>p.id==='B2').foot=[...rows[k].foot];
 }
 const proof=auditRealB454(raw,source).B2B4.B2;
 assert.equal(proof.groundedSourceReadySamples,730);
 assert.equal(proof.observedGroundedMotionNativeTicks,430);
 assert.equal(proof.longestGroundedStationaryNativeTicks,299);
 assert.equal(proof.first120GroundedMeters,0);
 assert.ok(proof.last120GroundedMeters>3.5);
 assert.ok(proof.witnessedNativeXZPolylineMeters>12);
 assert.equal(proof.originalGoalReachabilityGranted,false);
});


test('no former B446 dry denial is not a mobile certificate without actually submitted original native goals',()=>{
 const {raw,source}=fixture();
 raw.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes=[];
 assert.throws(()=>auditRealB454(raw,source),
  /B454_ORIGINAL_NATIVE_60HZ_SOURCE_HOLD/);
 raw.b441NativeEvidence.b445LastOriginalGateByCpu=[
  {id:'B2',strictlyApprovedGoals:2,runtimeTrueOriginalGoalRequests:44,runtimeNoOriginalFrontGoals:0},
  {id:'B4',strictlyApprovedGoals:2,runtimeTrueOriginalGoalRequests:43,runtimeNoOriginalFrontGoals:0}
 ];
 // Even with genuine SOURCE goals a stationary full-rate actor is NOT
 // moving, and therefore may not take the no-dry-witness branch.
 assert.throws(()=>auditRealB454(raw,source),
  /MOBILE_ORIGINAL_FULL_RATE_PHYSICAL_MOVE_NOT_PROVEN/);
});
