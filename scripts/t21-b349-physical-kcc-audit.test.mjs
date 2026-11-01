import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
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

test('B349 true SOURCE shooting launcher uses the native human-combat circuit, not incompatible allyCoop',()=>{
 const {readFileSync}=fs;
 for(const name of ['t21-b349-source-jump-round.mjs',
  't21-b349-source-real-air-shooter-round.mjs']){
  const source=readFileSync(new URL('./'+name,import.meta.url),'utf8');
  assert.equal(source.includes('t21W10B193=allyCoop'),false);
  assert.equal(source.split('t21W10B192=humanCombat').length-1,2);
  assert.ok(source.includes('t21W10B183=firstDropPlay'));
  assert.ok(source.includes('t21W10B343=sourceVolleyAtomic'));
 }
});

test('B338 real KCC PLAYER guide is verified with the native shooter state in one CDP read',()=>{
 const source=fs.readFileSync(new URL('./t21-b349-source-jump-round.mjs',import.meta.url),'utf8');
 const start=source.indexOf('const traceFrame=async label=>');
 const end=source.indexOf("await traceFrame('PRE_FIRE');",start);
 assert.ok(start>=0&&end>start);
 const active=source.slice(start,end);
 assert.ok(active.includes('const g=document.querySelector("#t21-f3-b338-source-guide");'));
 assert.ok(active.includes('B338_REAL_KCC_HUD_STANCE_MISMATCH_'));
 assert.ok(active.includes("n.b349ActualKccGrounded?'KCC GROUNDED':'KCC AIRBORNE'"));
 assert.ok(active.includes('b338-native-kcc-player-guide.json'));
 assert.ok(!active.includes('await picture('),'do not delay genuine Space key release with a screenshot');
 assert.ok(!active.includes('Input.dispatchKeyEvent'),'the read-only witness cannot inject input');
});
