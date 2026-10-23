import test from 'node:test';
import assert from 'node:assert/strict';
import {B127_STAGES,auditB127} from './t21-w10b127-original-corridor-plan.mjs';
const R='UndertowT21D:right-low-team-a';
const boundary=()=>({realFootXZInsideOriginalSlab:true,
 originalRaisedSourceVerticalBandWithin22cm:true,distanceToOriginalSourcePolygonBoundaryMeters:.9});
function valid(){
 let tick=6;
 const phases=B127_STAGES.map((s,i)=>{
  const start=tick;tick+=i===3?86:s.ticks;
  return {label:s.name,actualCDPKeyboardKeys:s.keys,genuineStartTick:start,
   genuineEndTick:tick,observedOriginalHumanEndingBody:[6,5.4,38.9],
   observedSourceSolid:R,trueKccGrounded:true,
   actualRaisedSourceBoundary:i===3?
    {...boundary(),distanceToOriginalSourcePolygonBoundaryMeters:.035}:boundary()};
 });
 const poll=(tick)=>({tick,originalFloorId:R,nativeKccGrounded:true,
  nativeStopReason:null,registeredRaisedSource:boundary()});
 return {phases,polls:[poll(tick-10),poll(tick)],b124:{completed:true},
  stop:null,suspicions:1,body:[6,5.4,37.5],sourceId:R,
  grounded:true,boundary:boundary()};
}
test('genuine source route success never authorizes production',()=>{
 const v=auditB127(valid());assert.equal(v.supportedSameFloorCorridorContinuation,true);
 assert.equal(v.unrestricted4v4Certified,false);
 assert.equal(v.nextDistinctSourceCertified,false);
});
test('missing real key ticks fail closed',()=>{
 const x=valid();x.phases[12].genuineEndTick-=2;
 assert.equal(auditB127(x).supportedSameFloorCorridorContinuation,false);
});
test('lost KCC source or unsafe original edge fails closed',()=>{
 const x=valid();x.polls[0].nativeKccGrounded=false;
 assert.equal(auditB127(x).supportedSameFloorCorridorContinuation,false);
 const y=valid();y.polls[0].registeredRaisedSource.distanceToOriginalSourcePolygonBoundaryMeters=.5;
 assert.equal(auditB127(y).supportedSameFloorCorridorContinuation,false);
});
test('real new displacement and stop reason are mandatory',()=>{
 const x=valid();x.body=[6,5.4,38.8];
 assert.equal(auditB127(x).supportedSameFloorCorridorContinuation,false);
 x.body=[6,5.4,37.5];x.stop='ORIGINAL_SOURCE_UNSUPPORTED';
 assert.equal(auditB127(x).supportedSameFloorCorridorContinuation,false);
});

test('true ramp-edge arrival does not erase registered B126 replay',()=>{
 const r=auditB127(valid());
 assert.equal(r.priorB126ActuallyReplayed,true);
 assert.equal(r.supportedSameFloorCorridorContinuation,true);
});
test('real 0.470m last source edge remains HOLD with correct replay',()=>{
 const x=valid();
 x.phases[12].actualRaisedSourceBoundary.distanceToOriginalSourcePolygonBoundaryMeters=.47065559;
 x.polls[1].registeredRaisedSource.distanceToOriginalSourcePolygonBoundaryMeters=.47065559;
 x.boundary.distanceToOriginalSourcePolygonBoundaryMeters=.47065559;
 const r=auditB127(x);
 assert.equal(r.priorB126ActuallyReplayed,true);
 assert.equal(r.newEndpointsSupported,false);
 assert.equal(r.everyNativeSampleSupported,false);
 assert.equal(r.supportedSameFloorCorridorContinuation,false);
 assert.equal(r.unrestricted4v4Certified,false);
});
