import test from 'node:test';
import assert from 'node:assert/strict';
import {compareB447SourceGates as audit} from './t21-b447-source-gate-comparator.mjs';
const ids=['A2','A3','B1','B2','B3','B4'];
function fixture(origin,newVersion){
 const g=ids.map(id=>({id,actualOriginalLanding:[0,3,id[0]==='A'?55:-55],
  originalFloorProposals:32,inspectedProposals:32,
  rejectedOriginalRapierOrBoundary:2,
  rejectedNativeRecastOrOriginalPath:30,strictlyApprovedGoals:0,
  approvedOriginalGoals:[],...(newVersion?{
   rejectedNativeUnreached:30,rejectedNativeStartSnap:0,
   rejectedNativeEndSnap:0,rejectedNativeIntermediateOriginalSupport:0}:{} )}));
 const probe=['A3','B2','B4'].map(id=>({id,nativeTick:1100,
  actualPhysicalFoot:[0,3,id[0]==='A'?50:-50],
  inspectedOriginalGoals:32,deniedRapierOrBoundary:2,
  nativeUnreached:30,nativeStartSnap:0,nativeEndSnap:0,
  nativeIntermediateSupport:0,passedAllOriginalChecks:0,
  firstPassingExistingGoal:null,probeOnlyNoActorOrGoalWrites:true}));
 return {schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',b441ResearchOnly:true,
  verdict:'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING',
  officialWinner:'NONE',syntheticInput:false,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0,
  sourceGeometryWrites:0,formal4v4Certified:false,browserOrigin:origin,
  b441NativeEvidence:{source:'25/17/26/0',realSevenCpu:true,
   naturalOpposingTeamRouteCertified:false,b442Formal4v4Certified:false,
   realNativeTicks:721,lastTick:1781,
   b445LastOriginalGateByCpu:g,
   ...(newVersion?{b446LiveActualCpuFootDryRouteProbes:probe}:{})}};
}
test('B447 compares only original SRC runtime and keeps route certification false',()=>{
 const r=audit(fixture(1,false),fixture(2,true));
 assert.equal(r.perRealCpu.A3.existingOriginalGoalDryPasses,0);
 assert.equal(r.crossTeamRouteCertified,false);
});
test('B447 records hypothetical actual-foot dry pass without granting actor goal',()=>{
 const a=fixture(1,false),b=fixture(2,true);
 const p=b.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0];
 p.nativeUnreached=29;p.passedAllOriginalChecks=1;
 p.firstPassingExistingGoal=[0,4,45];
 const r=audit(a,b);
 assert.equal(r.perRealCpu.A3.existingOriginalGoalDryPasses,1);
 assert.equal(r.formal4v4Certified,false);
});
test('B447 rejects forged source, clock, CPU, world, path and reasons',()=>{
 const mods=[d=>d.source='FAKE',d=>d.actorWrites=1,
  d=>d.browserOrigin=0,
  d=>d.b441NativeEvidence.realNativeTicks=10,
  d=>d.b441NativeEvidence.b445LastOriginalGateByCpu.pop(),
  d=>d.b441NativeEvidence.b445LastOriginalGateByCpu[0].rejectedNativeUnreached=29,
  d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].actualPhysicalFoot[0]=Infinity,
  d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].passedAllOriginalChecks=1,
  d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].nativeTick=3000,
  d=>d.b441NativeEvidence.b446LiveActualCpuFootDryRouteProbes[0].probeOnlyNoActorOrGoalWrites=false];
 for(const mod of mods){const a=fixture(1,false),b=fixture(2,true);
  mod(b);assert.throws(()=>audit(a,b),/B447_SOURCE_GATE_HOLD/);}
 assert.equal(mods.length,10);
 assert.throws(()=>audit(fixture(1,false),fixture(1,true)),/SAME_BROWSER_WORLD/);
});
