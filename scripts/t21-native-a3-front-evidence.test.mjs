import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {auditLiveA3SourceGoalEvidence as audit} from './t21-native-a3-front-evidence.mjs';
const input=()=>({
 source:'25/17/26/0',
 evidence:{enabled:true,actualOriginalGoalsAuthorized:0,
  actualNativeGoalRequests:43,nativePlanarDisplacementMeters:15.82,
  noActorPoseOrClockWrites:true,crossTeamPathCertified:false,
  formal4v4Certified:false},
 initialGate:{id:'A3',strictlyApprovedGoals:2,
  runtimeTrueOriginalGoalRequests:43,
  approvedOriginalGoals:[[3.375599288987395,4.502,37.992506688080205]]},
 observed:{closestObservationCount:20,minimumObservedGoalDistanceMeters:.0984}
});
test('already strictly admitted B445 A3 real goal need not create a fresh B448 goal',()=>{
 const x=input();
 assert.deepEqual(audit(x),{pass:true,basis:'B445_EXISTING_STRICT_SOURCE_GOAL'});
 assert.equal(x.evidence.actualOriginalGoalsAuthorized,0);
});
test('newly authorized B448 goal with true KCC travel is also admitted',()=>{
 const x=input();x.evidence.actualOriginalGoalsAuthorized=1;
 assert.deepEqual(audit(x),{pass:true,basis:'B448_FRESH_STRICT_SOURCE_GOAL'});
});
test('never substitute no original A3 goal or other actor as original authority',()=>{
 for(const f of [
  x=>x.initialGate.strictlyApprovedGoals=0,
  x=>x.initialGate.runtimeTrueOriginalGoalRequests=0,
  x=>x.initialGate.id='B2',
  x=>x.initialGate.approvedOriginalGoals=[]
 ]){const x=input();f(x);assert.equal(audit(x).pass,false);}
});
test('wrong source, fabricated travel or score/cross-team claims are HOLD',()=>{
 for(const f of [
  x=>x.source='26/17/26/0',
  x=>x.evidence.noActorPoseOrClockWrites=false,
  x=>x.evidence.crossTeamPathCertified=true,
  x=>x.evidence.formal4v4Certified=true,
  x=>x.evidence.actualNativeGoalRequests=0,
  x=>x.evidence.nativePlanarDisplacementMeters=.1,
  x=>x.observed.closestObservationCount=0,
  x=>x.observed.minimumObservedGoalDistanceMeters=50
 ]){const x=input();f(x);assert.equal(audit(x).pass,false);}
});
