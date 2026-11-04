import test from 'node:test';
import assert from 'node:assert/strict';
import {compareB449TrueA3GoalProgress as audit} from './t21-b449-a3-real-goal-progress.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const goal=[0,4,37.5];
function trial(origin,after,approach=true){
 const frames=Array.from({length:30},(_,i)=>{
  const tick=1062+i*24,foot=[0,3,after&&approach?53.5-i*.5:53.5];
  return {tick,physicalFeet:ids.map(id=>({id,rejoined:true,foot:id==='A3'?foot:[0,3,id[0]==='A'?55:-55]})),
   b442RealApprovedOriginalGoals:after?[{id:'A3',target:goal,
    physicalFoot:foot,distanceXZ:Math.hypot(foot[0]-goal[0],foot[2]-goal[2]),
    lastApprovedNativeTick:1060,originalRegisteredSourceOnly:true}]:[]};
 });
 return {schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',source:'25/17/26/0',
  b441ResearchOnly:true,b448A3ResearchOnly:after,actorWrites:0,
  scoreWrites:0,nativeClockWrites:0,sourceGeometryWrites:0,syntheticInput:false,
  officialWinner:'NONE',formal4v4Certified:false,realSourceRouteCertified:false,
  full180sCertified:false,genuineReplayClickCertified:false,
  verdict:'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING',
  browserOrigin:origin,b441NativeEvidence:{source:'25/17/26/0',realSevenCpu:true,
    naturalOpposingTeamRouteCertified:false,b442Formal4v4Certified:false,
    actorWrites:0,scoreWrites:0,nativeClockWrites:0,
    proposedOnlyNotCapsuleProof:true,
    realNativeTicks:721,firstRead:{tick:1060},lastTick:1781,realFrames:frames,
    b445LastOriginalGateByCpu:[{id:'A3',strictlyApprovedGoals:0}],
    b446LiveActualCpuFootDryRouteProbes:[
     {id:'A3',firstPassingExistingGoal:goal,passedAllOriginalChecks:15,
      actualPhysicalFoot:[0,3,53.5],probeOnlyNoActorOrGoalWrites:true},
     {id:'B2',passedAllOriginalChecks:0},{id:'B4',passedAllOriginalChecks:0}],
    ...(after?{b448A3RealEvidence:{enabled:true,actualOriginalGoalsAuthorized:1,
      actualNativeGoalRequests:10,noActorPoseOrClockWrites:true,
      crossTeamPathCertified:false,formal4v4Certified:false,
      verifiedSourceOnlyGoalPass:true,
      initialNativeFoot:[0,3,53.5],endingNativeFoot:[0,3,approach?48.5:53.5],
      nativePlanarDisplacementMeters:approach?5:0}}:{})}}
}
test('B449 proves actual directional progress, not just a claimed target',()=>{
 const r=audit(trial(111,false),trial(222,true));
 assert.match(r.verdict,/^PASS_/);
 assert.ok(r.verifiedGoalDistanceImprovementMeters>10);
 assert.equal(r.official4v4Certified,false);
});
test('B449 refuses cosmetic motion with unchanged target distance',()=>{
 const r=audit(trial(111,false),trial(222,true,false));
 assert.match(r.verdict,/^HOLD_/);
});
test('B449 refuses forged world, source, goal, and native position',()=>{
 const bad=[
  d=>d.browserOrigin=111,
  d=>d.source='FAKE',
  d=>d.actorWrites=1,
  d=>d.b441NativeEvidence.b448A3RealEvidence.actualOriginalGoalsAuthorized=0,
  d=>d.b441NativeEvidence.b448A3RealEvidence.actualNativeGoalRequests=0,
  d=>d.b441NativeEvidence.b448A3RealEvidence.verifiedSourceOnlyGoalPass=false,
  d=>d.b441NativeEvidence.realFrames[0].b442RealApprovedOriginalGoals[0].target[2]=0,
  d=>d.b441NativeEvidence.realFrames[0].physicalFeet[2].foot[0]=100,
  d=>d.b441NativeEvidence.b448A3RealEvidence.formal4v4Certified=true,
  d=>d.b441NativeEvidence.realNativeTicks=10];
 for(const mutation of bad){const p=trial(111,false),q=trial(222,true);
   mutation(q);assert.throws(()=>audit(p,q));}
 assert.equal(bad.length,10);
});
