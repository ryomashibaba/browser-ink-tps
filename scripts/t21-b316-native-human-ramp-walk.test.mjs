import test from 'node:test';
import assert from 'node:assert/strict';
import {RAMP,LANDING,planB316ActualOriginalRampApproach,
 auditB316RealMovement} from './t21-b316-native-human-ramp-walk.mjs';
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
