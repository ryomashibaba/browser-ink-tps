import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectB444Trial,compareB444RealTrials}
 from './t21-b444-native-front-goal-comparator.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(origin,switching=false){
 const sample=tick=>({tick,physicalFeet:ids.map(id=>({
  id,rejoined:true,foot:[0,4,id[0]==='A'?50:-50]})),
  b442RealApprovedOriginalGoals:['A2','B1','B3'].map(id=>({
   id,target:[switching&&tick>1070?1:0,4,id[0]==='A'?50:-50],
   physicalFoot:[0,4,id[0]==='A'?50:-50],
   distanceXZ:switching&&tick>1070?1:0,
   lastApprovedNativeTick:1060,originalRegisteredSourceOnly:true}))});
 return {schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',b441ResearchOnly:true,officialWinner:'NONE',
  actorWrites:0,scoreWrites:0,nativeClockWrites:0,sourceGeometryWrites:0,
  syntheticInput:false,formal4v4Certified:false,
  realSourceRouteCertified:false,genuineReplayClickCertified:false,
  full180sCertified:false,
  verdict:'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING',
  browserOrigin:origin,b441NativeEvidence:{source:'25/17/26/0',
   realSevenCpu:true,naturalOpposingTeamRouteCertified:false,
   b442Formal4v4Certified:false,actorWrites:0,scoreWrites:0,
   nativeClockWrites:0,proposedOnlyNotCapsuleProof:true,
   realNativeTicks:721,firstRead:{tick:1060},lastTick:1781,
   realFrames:Array.from({length:30},(_,i)=>sample(1062+i*24))}};
}
test('Counts observed source Crowd goal switches without fake official outcome',()=>{
 const a=inspectB444Trial(fixture(10,true));
 assert.equal(a.cpu.A2.observedGoalSwitches,1);
 assert.equal(a.cpu.B1.observedGoalSwitches,1);
 assert.equal(a.countCpuWithin1p5m,3);
 assert.equal(a.formal4v4Certified,false);
 assert.equal(a.cpu.A3.goalSamples,0);
});
test('Requires two distinct authentic browser origins and real arrival retention',()=>{
 assert.match(compareB444RealTrials(fixture(10,true),fixture(20,true)).verdict,/^HOLD_/);
 assert.throws(()=>compareB444RealTrials(fixture(10),fixture(10)),/SAME_BROWSER_WORLD/);
 assert.match(compareB444RealTrials(fixture(10,true),fixture(20,false)).verdict,/^PASS_/);
});
test('Rejects 10 SOURCE, position, tick, CPU, and score forgeries',()=>{
 const changes=[
  d=>d.source='FORGED',d=>d.actorWrites=1,d=>d.officialWinner='TEAM_A',
  d=>d.b441NativeEvidence.realNativeTicks=500,
  d=>d.b441NativeEvidence.realFrames[1].tick=1062,
  d=>d.b441NativeEvidence.realFrames[0].physicalFeet.pop(),
  d=>d.b441NativeEvidence.realFrames[0].b442RealApprovedOriginalGoals[0].target[2]=0,
  d=>d.b441NativeEvidence.realFrames[0].b442RealApprovedOriginalGoals[0].distanceXZ=900,
  d=>d.b441NativeEvidence.realFrames[0].b442RealApprovedOriginalGoals[0].originalRegisteredSourceOnly=false,
  d=>d.b441NativeEvidence.realFrames[0].b442RealApprovedOriginalGoals[0].physicalFoot[0]=100
 ];
 for(const mutate of changes){const x=fixture(1);mutate(x);
  assert.throws(()=>inspectB444Trial(x),/^Error: B444_NATIVE_SOURCE_HOLD_/);
 }
 assert.equal(changes.length,10);
});
