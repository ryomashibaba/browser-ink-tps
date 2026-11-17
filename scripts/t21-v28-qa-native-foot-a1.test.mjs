import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditRealCpuFootAndAlly} from './t21-v28-qa-native-foot-a1.mjs';

function fixture(){
 const origin=1794896360366.9;
 const raw={schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',browserOrigin:origin,
  error:'Error: B440_SHORT_REAL_NATIVE_HOLD_B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED'};
 const rows=id=>Array.from({length:360},(_,i)=>({
  id,tick:1100+i,foot:[i<15?i*.05:.75,3,id==='B2'?-50:-52],
  mode:'GROUND',life:'ACTIVE',rejoined:true,
  originalRapierSolidId:'UndertowT21D:first-drop-landing-negative-z',
  originalRapierHitY:3,registeredOriginalHit:true
 }));
 const b454={schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1',
  source:'25/17/26/0',rows:{B2:rows('B2'),B4:rows('B4')},
  dropped:{B2:0,B4:0},browserWorldOrigin:origin,
  originalPathAuthorizationChanged:false,
  originalWinner:'NONE',originalSourceGeometryWrites:0,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0};
 const allied=Array.from({length:200},(_,i)=>({
  tick:1100+i,foot:[2,3,52],sourceSolidId:
   'UndertowT21D:first-drop-landing-positive-z'
 }));
 const b484={schema:'B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1',
  source:'25/17/26/0',rows:allied,nativeRows:200,
  genuineKeyRequests:2,currentOrderKeyRequest:2,
  originalB471VerifiedArrivals:2,
  trueArrivalOnlyFromB471:true,
  currentOrderArrivalOnlyFromOriginalB471:true,
  crossTeamRouteCertified:false,originalCapsuleRouteCertified:false,
  currentOrderObservedFootTravelMeters:9.74,
  currentOrderClosestPhysicalGoalDistanceXZ:.675,
  originalFloorHitSamples:200,actorInkPhysicsClockWrites:0,
  officialWinner:'NONE',scoreable:0};
 return {raw,b454,b484};
}
test('genuine 60Hz physically supported yet stationary B2/B4 is a limited quality warning',()=>{
 const {raw,b454,b484}=fixture();
 const v=auditRealCpuFootAndAlly(raw,b454,b484);
 assert.equal(v.realSourceB2B4.B2.exactPerTickRows,360);
 assert.equal(v.realSourceB2B4.B4.allSamplesRegisteredOriginalGround,true);
 assert.equal(v.realSourceB2B4.B2.observedGroundedStationaryOver5Seconds,true);
 assert.equal(v.firstActionableQualityRisk,'ORIGINAL_GROUNDED_CPU_LONG_STATIONARY_WINDOW');
 assert.equal(v.realSourceB2B4.B2.continuousCapsuleRouteCertified,false);
 assert.equal(v.formal4v4Certified,false);
 assert.equal(v.sameActor150TickRespawnCertified,false);
});
test('A1 second C-key native original floor arrival is not causality or full route proof',()=>{
 const {raw,b454,b484}=fixture();
 const v=auditRealCpuFootAndAlly(raw,b454,b484);
 assert.equal(v.sameNativeA1OriginalOrder.registeredOriginalFloorSamples,200);
 assert.equal(v.sameNativeA1OriginalOrder.genuineCKeyRequests,2);
 assert.equal(v.sameNativeA1OriginalOrder.originalB471VerifiedArrivals,2);
 assert.equal(v.sameNativeA1OriginalOrder.completeCommandCausalityCertified,false);
 assert.equal(v.sameNativeA1OriginalOrder.sourceRouteCertified,false);
});
test('missing physical ground hits cannot be silently upgraded to 100 percent support',()=>{
 const {raw,b454,b484}=fixture();
 b454.rows.B4[140].registeredOriginalHit=false;
 const v=auditRealCpuFootAndAlly(raw,b454,b484);
 assert.equal(v.realSourceB2B4.B4.allSamplesRegisteredOriginalGround,false);
 assert.equal(v.realSourceB2B4.B4.nativeOriginalRapierSupportSamples,359);
});
test('invalid original source, world origin or actor state writes fail closed',()=>{
 for(const n of ['source','world','writes']){
  const {raw,b454,b484}=fixture();
  if(n==='source')b484.source='invalid';
  if(n==='world')b454.browserWorldOrigin+=100;
  if(n==='writes')b454.actorWrites=1;
  assert.throws(()=>auditRealCpuFootAndAlly(raw,b454,b484),
   /QA18_INVALID_NATIVE_FOOT_EVIDENCE/);
 }
});
test('missing 60Hz native tick or duplicate rows fail closed',()=>{
 for(const n of ['gap','duplicate']){
  const {raw,b454,b484}=fixture();
  if(n==='gap')b454.rows.B2[200].tick+=3;
  else b454.rows.B4[200].id='B2';
  assert.throws(()=>auditRealCpuFootAndAlly(raw,b454,b484),
   /QA18_INVALID_NATIVE_FOOT_EVIDENCE/);
 }
});
test('B484 HUD expectation mismatch never becomes a GAMEPLAY FAIL certification',()=>{
 const {raw,b454,b484}=fixture();
 const v=auditRealCpuFootAndAlly(raw,b454,b484);
 assert.equal(v.subsequentHudFailure.originalB440RunFailedAtB484PlayerHud,true);
 assert.equal(v.subsequentHudFailure.realDomTextOfFailingFrameSaved,false);
 assert.equal(v.subsequentHudFailure.actualHudRootCauseFullyCertified,false);
});
