import test from 'node:test';
import assert from 'node:assert/strict';
import {RAMP,LANDING,planB316ActualOriginalRampApproach,
 auditB316RealMovement,b316CanAttemptOriginalKccWithoutInkPromotion as canWalk} from './t21-b316-native-human-ramp-walk.mjs';
import {b318NativeOriginalRampInterior,b318OriginalQuadPlanarSignedMargin}
 from './t21-b318-original-ramp-interior.mjs';
const point=[.137,3.895,48.736];
const real=(foot,body=point,tick=1700,ramp=false)=>({
 tick,source:'25/17/26/0',actualBodyMeters:body,
 realHumanOriginalFootSupported:true,
 genuineHumanOriginalFootSolid:foot,sourceActorRelocations:0,
 sourceInkRewritten:false,playerPositionRewritten:false,
 originalRows:Array.from({length:17},(_,i)=>i===0?
  {surfaceId:RAMP+':paint',actualHumanFootOnOriginalActiveSurface:ramp,
   originalSourceActiveProbeCells:[
    {grid:[3,4],world:[.868,3.0019,47.579]},
    {grid:[7,8],world:[8.25,4.48,52.17]}]}:
  {surfaceId:'other-'+i})});
test('B316 picks nearby genuine ramp cell using PlayerController forward -Z',()=>{
 const p=planB316ActualOriginalRampApproach({
  ledger:real(LANDING),camera:{yawDegrees:104.94,pitchDegrees:-18.84}});
 assert.ok(p.candidate);
 assert.ok(Math.abs(p.candidate.targetForwardYaw-32.3)<.5);
 assert.ok(p.candidate.distance<1.5);
 assert.equal(p.candidate.physicallyVerified,false);
});
test('B316 physical ramp PASS requires real short KCC steps and supported active ramp',()=>{
 const first=real(LANDING);
 const steps=[
  {realKey:'KeyW',nativeInputTicks:6,
   after:real(LANDING,[.42,3.89,48.31],1706,false)},
  {realKey:'KeyW',nativeInputTicks:6,
   after:real(RAMP,[.86,3.89,47.62],1712,true)}];
 assert.equal(auditB316RealMovement({first,steps}).verdict,
  'GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS');
 const withoutFoot=structuredClone(steps);
 withoutFoot[1].after.genuineHumanOriginalFootSolid=LANDING;
 assert.equal(auditB316RealMovement({first,steps:withoutFoot}).verdict,
  'HOLD_NO_PHYSICAL_ORIGINAL_RAMP_WALK');
});
test('B316 never accepts actor relocation or fabricated large jump',()=>{
 const first=real(LANDING);
 assert.throws(()=>auditB316RealMovement({first,steps:[{
  realKey:'KeyW',nativeInputTicks:5,
  after:{...real(RAMP,[3.6,3.9,42],1705,true)}}]}));
 assert.throws(()=>auditB316RealMovement({first,steps:[{
  realKey:'KeyW',nativeInputTicks:5,
  after:{...real(RAMP,[.7,3.9,48],1705,true),
   sourceActorRelocations:1}}]}));
});

test('F2 source-grounded B316 walk is independent from unproven B315 ink',()=>{
 const source=real(LANDING);
 // No B315 multi-surface certificate in this genuine KCC ledger fixture:
 // the original body and exact registered lower support are still known.
 assert.equal(canWalk(source),true);
 for(const mutate of [
  x=>{x.source='UNKNOWN';},x=>{x.originalRows=[];},
  x=>{x.realHumanOriginalFootSupported=false;},
  x=>{x.genuineHumanOriginalFootSolid=RAMP;},
  x=>{x.actualBodyMeters=[NaN,3.895,48];},
  x=>{x.sourceActorRelocations=1;},
  x=>{x.sourceInkRewritten=true;},
  x=>{x.playerPositionRewritten=true;}
 ]){
  const damaged=structuredClone(source);mutate(damaged);
  assert.equal(canWalk(damaged),false);
 }
 assert.equal(canWalk(null),false);
 // This start gate is NOT a B316 PASS: unchanged native KCC audit owns it.
 assert.throws(()=>auditB316RealMovement({first:source,steps:[]}));
});

test('B316 standalone candidate: genuine original quad interior is physically uncertified until real KCC',()=>{
 const quad={id:'right-low-route-ramp-positive-z',
  sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
  vertices:[[8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
   [4.142941,3,54.257493],[.855934,3,47.552619]]};
 const first=real(LANDING,[.1367405802,3.8948045,48.73594284]);
 const old=planB316ActualOriginalRampApproach({ledger:first,
  camera:{yawDegrees:104.94,pitchDegrees:-18.84}}).candidate;
 const candidate=b318NativeOriginalRampInterior({
  quad,body:first.actualBodyMeters,yaw:104.94}).candidate;
 assert.ok(old&&candidate?.safe);
 assert.equal(candidate.physicallyCertified,false);
 assert.equal(candidate.pointOnlyNotFootprintOrRoute,true);
 const margin=b318OriginalQuadPlanarSignedMargin(
  quad,candidate.targetSourceInteriorPoint);
 assert.equal(margin.originalQuadInsideXZ,true);
 assert.ok(margin.signedOriginalRampMarginMeters>.3);
 const steps=[{realKey:'KeyW',nativeInputTicks:4,
  after:real(LANDING,[.45,3.895,48.7],1704,false)}];
 assert.equal(auditB316RealMovement({first,steps}).verdict,
  'HOLD_NO_PHYSICAL_ORIGINAL_RAMP_WALK');
 steps.push({realKey:'KeyW',nativeInputTicks:4,
  after:real(RAMP,[1.6879,3.9866,48.7361],1712,true)});
 assert.equal(auditB316RealMovement({first,steps}).verdict,
  'GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS');
});
