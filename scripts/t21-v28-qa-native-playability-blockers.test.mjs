import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditSourceRealGameplayBlockers} from './t21-v28-qa-native-playability-blockers.mjs';

const ORIGINAL='25/17/26/0';
const ids=['B2','B4'];
const makeRows=id=>Array.from({length:730},(_,i)=>({
 id,tick:1057+i,
 foot:[i<100?i*.01:1,3.10,id==='B2'?-54:-53],
 life:'ACTIVE',mode:'GROUND',rejoined:true,
 registeredOriginalHit:true,
 originalRapierSolidId:'UndertowT21D:first-drop-landing-negative-z'
}));
function make(){
 const B445=id=>({
  id,originalFloorProposals:32,inspectedProposals:32,
  rejectedNativeRecastOrOriginalPath:30,
  rejectedNativeIntermediateOriginalSupport:30,
  strictlyApprovedGoals:0,runtimeChooseInvocations:44,
  runtimeNoOriginalFrontGoals:44,runtimeTrueOriginalGoalRequests:0
 });
 const B446=id=>({
  id,nativeTick:1066,actualPhysicalFoot:[1,3.1,id==='B2'?-54:-53],
  inspectedOriginalGoals:32,deniedRapierOrBoundary:2,
  nativeIntermediateSupport:30,passedAllOriginalChecks:0,
  probeOnlyNoActorOrGoalWrites:true,
  b450FailedOriginalGoals:Array.from({length:30},(_,i)=>({
   originalGoal:[i*.2,4.502,-45],nativePathPointCount:3,
   firstDenied:{
    cause:'NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',
    xyz:[i*.01,3.28,-53],leg:0,sample:4,checked:5,
    hitSolidId:'UndertowT21D:first-drop-landing-negative-z',
    verticalGapMeters:.25+i*.001
   }
  }))
 });
 const origin=1794898813966.9;
 const proof={
  schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:ORIGINAL,browserOrigin:origin,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0,sourceGeometryWrites:0,
  k2WindowProvenance:{browserOriginEqual:true},
  b441NativeEvidence:{
   b445LastOriginalGateByCpu:ids.map(B445),
   b446LiveActualCpuFootDryRouteProbes:ids.map(B446)
  },
  b487OriginalCrossTeamTopology:{
   source:ORIGINAL,totalOriginalNativePathQueries:16,
   nativePathReportedPairs:0
  },
  qaIssue18RealNativeHpWitness:{
   source:ORIGINAL,actualHumanCpuHitCount:0
  }
 };
 const trace={
  schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1',
  source:ORIGINAL,browserWorldOrigin:origin,
  rows:Object.fromEntries(ids.map(id=>[id,makeRows(id)])),
  dropped:{B2:0,B4:0},originalKccOrGameWrites:0,
  originalPathAuthorizationChanged:false,
  continuousCapsuleContactCertified:false,b2b4FrontlineGoalCertified:false,
  originalSourceGeometryWrites:0,actorWrites:0,scoreWrites:0,
  nativeClockWrites:0
 };
 const actualNativeMotion={
  source:'REAL_SOURCE_RECAST_PROPOSAL_AND_RAPIER_KCC',
  syntheticFootMoves:0,syntheticGoals:0,newSolids:0,
  newNavLinks:0,scoreablePromotions:0,
  byActor:Object.fromEntries(ids.map(id=>[id,{
   crowdNoStep:25,crowdProposals:20,rapierRejected:0,
   rapierAcceptedMoving:100,rapierAcceptedStationary:600,
   rapierActualTeammateSlides:0,offmeshDeferred:0,
   overspeedRejected:0,crowdReanchors:0,
   lastRealFoot:[1,3.1,id==='B2'?-54:-53],
   lastCrowdCandidate:[1,3.1,id==='B2'?-54:-53],
   rejectionCauses:{},lastRejectOwners:[],lastRejectCause:null
  }]))
 };
 return {proof,trace,actualNativeMotion};
}
test('genuine grounded stationary B2/B4 with zero admitted paths reports actual goal veto not pseudo-KCC walk',()=>{
 const {proof,trace,actualNativeMotion}=make();
 const a=auditSourceRealGameplayBlockers(proof,trace,actualNativeMotion);
 assert.equal(a.result,'HOLD_REAL_NATIVE_4V4_AND_HP_CHAIN');
 assert.equal(a.actualCrossTeamNativePathPairs,0);
 assert.equal(a.genuineHumanCpuHpHits,0);
 assert.equal(a.primaryPlayable4v4Gate,'ORIGINAL_OPPOSING_RECAST_CONNECTIVITY_0_OF_16');
 for(const id of ids){
  const x=a.byActor[id];
  assert.equal(x.observedGate,'HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED');
  assert.equal(x.nativeGoalAdmission.runtimeNoOriginalGoal,44);
  assert.equal(x.nativeGoalAdmission.actualNativeSourceGoalRequests,0);
  assert.equal(x.nativeFoot.allRegisteredOriginalFloorSupported,true);
  assert.ok(x.nativeFoot.longestGroundedNearlyStationaryTicks>=600);
  assert.equal(x.trueOriginalFootDryRoute.firstDeniedCauses.NATIVE_PATH_RAPIER_HEIGHT_MISMATCH,30);
  assert.equal(x.trueOriginalFootDryRoute.actuallyWitnessedMinVerticalGapMeters,.25);
  assert.equal(x.trueOriginalFootDryRoute.actuallyWitnessedMaxVerticalGapMeters,.279);
  assert.equal(x.sameRunKccMotion.available,true);
  assert.equal(x.nativeActorTeleports,0);
  assert.equal(x.artificialGoalFixAuthorized,false);
 }
 assert.equal(a.formal4v4Certified,false);
});
test('a real admitted goal changes the per-CPU triage, without claiming game completion',()=>{
 const x=make();const row=x.proof.b441NativeEvidence.b445LastOriginalGateByCpu[0];
 row.strictlyApprovedGoals=2;row.runtimeNoOriginalFrontGoals=0;
 row.runtimeTrueOriginalGoalRequests=40;
 const q=auditSourceRealGameplayBlockers(x.proof,x.trace,x.actualNativeMotion);
 assert.equal(q.byActor.B2.observedGate,'HOLD_GROUNDED_LONG_STALL_CAUSE_UNRESOLVED');
 assert.equal(q.byActor.B4.observedGate,'HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED');
 assert.equal(q.result,'HOLD_REAL_NATIVE_4V4_AND_HP_CHAIN');
});
test('actual CPU KCC counters missing must remain unknown but do not invalidate authentic independent Recast veto',()=>{
 const x=make();
 const q=auditSourceRealGameplayBlockers(x.proof,x.trace);
 assert.equal(q.byActor.B2.sameRunKccMotion.available,false);
 assert.equal(q.byActor.B2.observedGate,'HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED');
 assert.equal(q.cannotInferCauseFromStationaryFootAlone,true);
});
test('native world origin, forged actor changes and scoreable promotions invalidate the comparison',()=>{
 for(const field of ['browserWorldOrigin','actorWrites','nativeClockWrites','originalKccOrGameWrites']){
  const x=make();
  if(field==='browserWorldOrigin')x.trace.browserWorldOrigin++;
  else x.trace[field]=1;
  assert.throws(()=>auditSourceRealGameplayBlockers(x.proof,x.trace,x.actualNativeMotion),
   /QA18_ORIGINAL_NATIVE_CAUSAL_PROVENANCE/);
 }
 const x=make();x.proof.scoreWrites=1;
 assert.throws(()=>auditSourceRealGameplayBlockers(x.proof,x.trace),
  /SOURCE_WORLD_AND_NATIVE_ACTOR_MUTATION_HOLD/);
});
test('missing supported physical feet, absent real dry gate, and native tick gaps never produce positive root cause',()=>{
 for(const kind of ['floor','gap','dry','probeTick','author']){
  const x=make();
  if(kind==='floor')x.trace.rows.B2[80].originalRapierSolidId='FAKE';
  if(kind==='gap')x.trace.rows.B4[80].tick+=5;
  if(kind==='dry')x.proof.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes=[];
  if(kind==='probeTick')
   x.proof.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].nativeTick=2050;
  if(kind==='author')
   x.proof.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].probeOnlyNoActorOrGoalWrites=false;
  assert.throws(()=>auditSourceRealGameplayBlockers(x.proof,x.trace),
   /QA18_ORIGINAL_NATIVE_CAUSAL_PROVENANCE/);
 }
});
test('a fabricated mismatch gap or original collision id is rejected, never grounds geometry promotion',()=>{
 for(const kind of ['gap','solid','cause','goal']){
  const x=make(),r=x.proof.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].b450FailedOriginalGoals[0];
  if(kind==='gap')r.firstDenied.verticalGapMeters=Infinity;
  if(kind==='solid')r.firstDenied.hitSolidId='NEW_CENTRAL_BRIDGE';
  if(kind==='cause')r.firstDenied.cause='';
  if(kind==='goal')r.originalGoal=[1,2,NaN];
  assert.throws(()=>auditSourceRealGameplayBlockers(x.proof,x.trace),/QA18_/);
 }
});
test('near enemy is not automatically a direct HP hit, respawn or full source 4v4',()=>{
 const x=make();
 x.proof.b487OriginalCrossTeamTopology.nativePathReportedPairs=2;
 x.proof.qaIssue18RealNativeHpWitness.actualHumanCpuHitCount=1;
 const q=auditSourceRealGameplayBlockers(x.proof,x.trace);
 assert.equal(q.actualCrossTeamNativePathPairs,2);
 assert.equal(q.genuineHumanCpuHpHits,1);
 assert.equal(q.actualCpuSplatCertified,false);
 assert.equal(q.actual150TickRespawnCertified,false);
 assert.equal(q.originalF4Certified,false);
});

test('QA runner uses the true top-level CPU Rapier/Recast witness, never nested cpu data',async()=>{
 const {readFileSync}=await import('node:fs');
 const runner=readFileSync(new URL('./t21-b440-short-native-original-foot.mjs',
  import.meta.url),'utf8');
 assert.match(runner,
  /auditSourceRealGameplayBlockers\(\s*proof,b454Report,actual\.cpuSourceNativeGroundMotion\?\?null,\s*after\.cpuSourceNativeGroundMotion\?\?null\)/);
 assert.doesNotMatch(runner,/actual\.cpu\?\.cpuSourceNativeGroundMotion/);
});
test('real start/end KCC window counters yield native rejection deltas, not fake movement',()=>{
 const x=make();
 x.proof.k2WindowProvenance.firstTick=1068;
 x.proof.k2WindowProvenance.lastTick=1788;
 const old=structuredClone(x.actualNativeMotion);
 const latest=structuredClone(old);
 latest.byActor.B2.rapierRejected=9;
 latest.byActor.B2.crowdProposals=30;
 const b2=x.proof.b441NativeEvidence.b445LastOriginalGateByCpu[0];
 b2.strictlyApprovedGoals=2;
 b2.runtimeTrueOriginalGoalRequests=12;
 b2.runtimeNoOriginalFrontGoals=0;
 const a=auditSourceRealGameplayBlockers(x.proof,x.trace,latest,old);
 assert.equal(a.byActor.B2.sameRunKccInterval.available,true);
 assert.equal(a.byActor.B2.sameRunKccInterval.intervalNativeTicks,720);
 assert.equal(a.byActor.B2.sameRunKccInterval.genuineNativeCounterDeltas.rapierRejected,9);
 assert.equal(a.byActor.B2.sameRunKccInterval.genuineNativeCounterDeltas.rapierAcceptedMoving,0);
 assert.equal(a.byActor.B2.observedGate,
  'HOLD_ACTUAL_RAPIER_KCC_VETO_WITH_APPROVED_SOURCE_GOAL');
 assert.equal(a.byActor.B2.sameRunKccInterval.actualActorMovementFromCounterAloneCertified,false);
 assert.equal(a.byActor.B4.observedGate,'HOLD_STRICT_ORIGINAL_GOALS_ALL_DENIED');
 assert.equal(a.originalF4Certified,false);
});
test('admitted real source goal but zero native Crowd proposals is separate from KCC refusal',()=>{
 const x=make();
 x.proof.k2WindowProvenance.firstTick=1068;
 x.proof.k2WindowProvenance.lastTick=1788;
 const old=structuredClone(x.actualNativeMotion);
 const newest=structuredClone(old);
 const b2=x.proof.b441NativeEvidence.b445LastOriginalGateByCpu[0];
 b2.strictlyApprovedGoals=1;
 b2.runtimeTrueOriginalGoalRequests=5;b2.runtimeNoOriginalFrontGoals=0;
 const r=auditSourceRealGameplayBlockers(x.proof,x.trace,newest,old);
 assert.equal(r.byActor.B2.observedGate,
  'HOLD_NO_TRUE_CROWD_PROPOSALS_WITH_APPROVED_SOURCE_GOAL');
 assert.equal(r.formal4v4Certified,false);
});
test('unknown previous counters and non-monotonic KCC never pass as real physics evidence',()=>{
 const x=make();x.proof.k2WindowProvenance.firstTick=1068;
 x.proof.k2WindowProvenance.lastTick=1788;
 const old=structuredClone(x.actualNativeMotion);
 const newest=structuredClone(old);
 newest.byActor.B2.crowdNoStep=2;
 const bad=auditSourceRealGameplayBlockers(x.proof,x.trace,newest,old);
 assert.equal(bad.byActor.B2.sameRunKccInterval.available,false);
 assert.match(bad.byActor.B2.sameRunKccInterval.reason,/NONMONOTONIC/);
 const absent=auditSourceRealGameplayBlockers(x.proof,x.trace,newest,null);
 assert.equal(absent.byActor.B2.sameRunKccInterval.available,false);
 assert.equal(absent.byActor.B2.movementImprovedAfterNewCpuCodeCertified,false);
});


test('genuine-mobile-shaped same-side 60Hz RAW is a limited movement PASS, never a 4v4 or invented dry-route PASS',()=>{
 const x=make();
 for(const id of ids){
  const rows=x.trace.rows[id];
  for(let i=0;i<rows.length;i++){
   const t=i/(rows.length-1);
   rows[i].foot=[2.7-8.5*t,3.10+1.5*t,
    (id==='B2'?-53.84:-52.79)+16.5*t];
   rows[i].originalRapierSolidId=i<175?
    'UndertowT21D:first-drop-landing-negative-z':i<375?
    'UndertowT21D:right-low-route-ramp-negative-z':
    'UndertowT21D:right-low-team-b';
  }
  const gate=x.proof.b441NativeEvidence.b445LastOriginalGateByCpu
   .find(r=>r.id===id);
  gate.strictlyApprovedGoals=2;
  gate.runtimeNoOriginalFrontGoals=0;
  gate.runtimeTrueOriginalGoalRequests=44;
 }
 x.proof.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes=[];
 const result=auditSourceRealGameplayBlockers(
  x.proof,x.trace,x.actualNativeMotion);
 for(const id of ids){
  const state=result.byActor[id];
  assert.equal(state.observedGate,
   'PASS_LIMITED_REAL_ORIGINAL_SOURCE_FOOT_MOTION_NOT_4V4');
  assert.equal(state.actualSameSideRapierFootMovementObserved,true);
  assert.ok(state.nativeFoot.cumulativeOriginalSourceFootXZTravelMeters>10);
  assert.equal(state.trueOriginalFootDryRoute
   .dryProbeNotProducedBecauseRegisteredOriginalCpuMoved,true);
  assert.equal(state.movementImprovedAfterNewCpuCodeCertified,false);
 }
 assert.equal(result.result,'HOLD_REAL_NATIVE_4V4_AND_HP_CHAIN');
 assert.equal(result.actualCrossTeamNativePathPairs,0);
 assert.equal(result.actual150TickRespawnCertified,false);
 assert.equal(result.formal4v4Certified,false);
});
