import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectB452NativeFootAgainstRejectedRecast as audit}
 from './t21-b452-native-foot-vs-recast-audit.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(){
 const denial=id=>({originalGoal:[-10,4.5,-40],
  originalGoalSolidId:'UndertowT21D:right-low-team-b',
  nativePathPointCount:4,
  firstDenied:{cause:'NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',
   xyz:id==='B2'?[1.7,3.28,-52.76]:[.1,3.28,-51.87],
   leg:0,sample:4,checked:5,
   hitSolidId:'UndertowT21D:first-drop-landing-negative-z',
   verticalGapMeters:.28}});
 const probe=['A3','B2','B4'].map(id=>({
  id,nativeTick:1067,actualPhysicalFoot:[0,3.1,id==='A3'?53:-53],
  inspectedOriginalGoals:32,deniedRapierOrBoundary:2,
  nativeUnreached:0,nativeStartSnap:0,nativeEndSnap:0,
  nativeIntermediateSupport:id==='A3'?0:1,
  passedAllOriginalChecks:id==='A3'?30:29,
  b450FailedOriginalGoals:id==='A3'?[]:[denial(id)],
  probeOnlyNoActorOrGoalWrites:true}));
 const frames=Array.from({length:30},(_,i)=>({tick:1070+24*i,
  physicalFeet:ids.map(id=>({id,rejoined:true,
   foot:id==='B2'?[1.7-i*.03,3.1,-52.8+i*.02]:
    id==='B4'?[.1-i*.03,3.1,-51.85+i*.02]:
    [0,3.1,id.startsWith('A')?53:-53]}))}));
 return {schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',verdict:
   'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING',
  syntheticInput:false,actorWrites:0,scoreWrites:0,
  nativeClockWrites:0,sourceGeometryWrites:0,officialWinner:'NONE',
  formal4v4Certified:false,b441ResearchOnly:true,
  browserOrigin:12345.5,
  b441NativeEvidence:{source:'25/17/26/0',realSevenCpu:true,
   naturalOpposingTeamRouteCertified:false,b442Formal4v4Certified:false,
   realNativeTicks:720,lastTick:1800,
   realFrames:frames,b446LiveActualCpuFootDryRouteProbes:probe}};
}
test('computes same-world observed real feet without promoting KCC',()=>{
 const d=audit(fixture());assert.equal(d.B2B4.B2.observedPhysicalFootWithin20cmOfRejectedRecast,true);
 assert.equal(d.B2B4.B4.observedPhysicalFootWithin20cmOfRejectedRecast,true);
 assert.equal(d.physicalContinuousRouteCertified,false);
 assert.equal(d.B2B4.B2.all60HzPhysicalContactsRecorded,false);
 assert.equal(d.scoreWrites,0);assert.equal(d.winner,'NONE');
});
test('fails closed for fake provenance, goal authorization, loss of real foot samples',()=>{
 const changes=[
 d=>d.source='26/17/26/0',
 d=>d.scoreWrites=1,
 d=>d.b441NativeEvidence.realSevenCpu=false,
 d=>{d.b441NativeEvidence.realFrames=[]},
 d=>d.b441NativeEvidence.realFrames[1].tick=1070,
 d=>d.b441NativeEvidence.realFrames[1].physicalFeet[4].rejoined=false,
 d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[1]
   .b450FailedOriginalGoals[0].firstDenied.verticalGapMeters=.249,
 d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[1]
   .b450FailedOriginalGoals[0].firstDenied.cause='NO_RAPIER_HIT',
 d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[1]
   .nativeIntermediateSupport=2,
 d=>d.b441NativeEvidence.realFrames[0].physicalFeet[4].foot=[0,3,40]
 ];
 for(const change of changes){
  const d=fixture();change(d);
  assert.throws(()=>audit(d),/B452_REAL_SOURCE_FOOT_TRACE_HOLD/);
 }
});

function fullRoundFixture(){
 const d=fixture();
 d.verdict='PASS_REAL_NATIVE_180S_TIME_UP_REPLAY_NEW_WORLD_SAME_HUMAN_WEAPON';
 d.testKind='FULL_REAL_180S_FRESH_SOURCE_WORLD_SAME_WEAPON';
 d.stage='REAL_180_NATIVE_NEW_WORLD_SAME_WEAPON_CERTIFIED';
 d.full180sCertified=true;
 d.genuineReplayClickCertified=true;
 d.oneShotFullReplay={
  schema:'T21_ONE_SHOT_REAL_SOURCE_180_REPLAY_V1',
  source:'25/17/26/0',initialOrigin:d.browserOrigin,
  clicked:true,newWorldConfirmed:true,actualCountdownNativeTicks:10804,
  weapon:'needle-smg',
  samples:[{label:'120',phase:'PLAYING',remaining:120},
   {label:'60',phase:'PLAYING',remaining:60},
   {label:'TIME_UP',phase:'TIME_UP',remaining:0}],
  realEndScreen:{button:true,mouseUnlocked:true,scoreable:'0'},
  secondWorld:{origin:d.browserOrigin+10,n:{tick:0,phase:'STAGING',
   seconds:180,cpu:7,kit:'needle-smg',
   solids:25,paint:17,links:26,scoreable:0}}
 };
 return d;
}
test('accepts genuine full 180s + replay as same physical SOURCE foot witness',()=>{
 const d=audit(fullRoundFixture());
 assert.equal(d.verdict,'PASS_SAME_WORLD_SAMPLED_PHYSICAL_PROXIMITY_NOT_A_ROUTE_PASS');
 assert.equal(d.physicalContinuousRouteCertified,false);
 assert.equal(d.unrestricted4v4Certified,false);
});
test('never permits spoofed full-run label to bypass B452 native SOURCE gates',()=>{
 const changes=[
  d=>{delete d.oneShotFullReplay},
  d=>{d.full180sCertified=false},
  d=>{d.genuineReplayClickCertified=false},
  d=>{d.oneShotFullReplay.actualCountdownNativeTicks=10799},
  d=>{d.oneShotFullReplay.samples[2].remaining=1},
  d=>{d.oneShotFullReplay.secondWorld.origin=d.browserOrigin},
  d=>{d.oneShotFullReplay.secondWorld.n.kit='ink-saber'},
  d=>{d.oneShotFullReplay.secondWorld.n.scoreable=1},
  d=>{d.b441NativeEvidence.realSevenCpu=false},
  d=>{d.b441NativeEvidence.realFrames=[]},
  d=>{d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[1]
    .b450FailedOriginalGoals[0].firstDenied.verticalGapMeters=.25}
 ];
 for(const f of changes){
  const d=fullRoundFixture();f(d);
  assert.throws(()=>audit(d),/B452_REAL_SOURCE_FOOT_TRACE_HOLD/);
 }
});
