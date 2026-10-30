import test from 'node:test';
import assert from 'node:assert/strict';
import {auditB349TrueGroundAir} from './t21-b349-physical-kcc-audit.mjs';
const sample=()=>{
 const launches=Array.from({length:10},(_,i)=>({
  kind:'LAUNCH',launchId:i+1,nativeTick:100+i*6,
  nativeGroundedAtLaunch:i<5,
  worldVelocity:[i*.1,-10,-28],worldPosition:[0,8,67]}));
 return {
  w:{schema:'B349_TRUE_NATIVE_SPACE_SHOOTER_KCC',source:'25/17/26/0',
   realSpaceKey:true,syntheticShots:false,syntheticInk:false,
   artificialActorMovement:false,originalScoreable:0,
   productionAuthorized:false,realGroundShots:5,realAirShots:5,
   originalNativeTick:200,realSpaceEvents:[
    {kind:'realSpaceDown',tick:124,kccGrounded:true,bodyY:8.2},
    {kind:'realSpaceUp',tick:136,kccGrounded:false,bodyY:9.5},
    {kind:'realKccLanding',tick:190,kccGrounded:true,bodyY:8.2}
   ],nativeShooterLaunches:launches.map(e=>({
    id:e.launchId,tick:e.nativeTick,kccGrounded:e.nativeGroundedAtLaunch,
    worldVelocity:[...e.worldVelocity],worldPosition:[...e.worldPosition]
   }))},
  p:{realNativeFinalTick:200,
   truePhysicalEvidence:{events:launches,totalActualShooterLaunches:10}}
 };
};
test('synthetic B349 fixture validates fields not Nintendo original parity',()=>{
 const {w,p}=sample(),r=auditB349TrueGroundAir(w,p);
 assert.equal(r.nativeAirborneShooterShots,5);
 assert.equal(r.NintendoExactAirSpreadCertified,false);
});
test('fail closed for fake jump, absent KCC air and mismatched physical IDs',()=>{
 for(const mutate of [
  o=>o.w.syntheticShots=true,
  o=>o.w.realSpaceEvents[1].kccGrounded=true,
  o=>o.w.realSpaceEvents[1].bodyY=8.2,
  o=>o.w.nativeShooterLaunches[5].kccGrounded=true,
  // Native Space down was moved after the first recorded airborne
  // launch while the rest of the event sequence remains plausible.
  o=>o.w.realSpaceEvents[0].tick=131,
  // Prevent an independently sampled 3D muzzle position from being
  // silently changed while the physical witness remains unchanged.
  o=>o.w.nativeShooterLaunches[0].worldPosition[2]+=1,
  o=>o.p.truePhysicalEvidence.events[0].worldPosition[1]+=1,
  o=>o.w.realAirShots=0,
  o=>o.p.truePhysicalEvidence.events[0].nativeTick=444
 ]){
  const s=sample();mutate(s);
  assert.throws(()=>auditB349TrueGroundAir(s.w,s.p),/B349_NATIVE_KCC_/);
 }
});
