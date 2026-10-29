import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyB319GenuineOriginalRampWalk}
 from './t21-b319-audit-real-ramp-kcc-artifact.mjs';
const ramp='UndertowT21D:right-low-route-ramp-positive-z';
const landing='UndertowT21D:first-drop-landing-positive-z';
const start=()=>({tick:1900,source:'25/17/26/0',
 originalRows:Array.from({length:17},(_,i)=>({surfaceId:i===0?
  ramp+':paint':'id-'+i,
  actualHumanFootOnOriginalActiveSurface:false})),
 sourceActorRelocations:0,sourceInkRewritten:false,
 playerPositionRewritten:false,
 actualBodyMeters:[.136,3.895,48.736],
 genuineHumanOriginalFootSolid:landing,
 realHumanOriginalFootSupported:true});
const sample=()=>{
 const first=start();const after=structuredClone(first);
 after.tick=1905;after.actualBodyMeters=[.65,3.895,48.4];
 return {schema:'B316_GENUINE_LOWER_LANDING_TO_RAMP_KCC',
  source:'25/17/26/0',productionAuthorized:false,
  original4v4Certified:false,artAccepted:false,
  stageSolidsChanged:0,exactOriginalActorTeleportCount:0,
  first,b318OriginalRampInteriorGuideOptIn:true,
  plan:{source:'25/17/26/0',candidate:{
   originalFourSourceVertices:true,physicallyCertified:false,
   pointOnlyNotFootprintOrRoute:true}},
  steps:[{realKey:'KeyW',nativeInputTicks:4,
   actualNativeTickDelta:5,
   nativeOriginalRampQuadMargin:{source:'25/17/26/0',
    signedOriginalRampMarginMeters:-.4,certifiedWalkRoute:false,
    originalQuadPhysicalFootProven:false},after}],
  reachedOriginalRampOnGenuineCharacterKcc:false};
};
test('B319 truthful KCC HOLD despite geometric plan and actual movement',()=>{
 const result=classifyB319GenuineOriginalRampWalk(sample());
 assert.equal(result.verdict,'HOLD_ORIGINAL_RAMP_PHYSICAL_SUPPORT_NOT_PROVEN');
 assert.equal(result.observedRealKccSteps,1);
});
test('B319 KCC PASS requires real Rapier ramp solid AND active paint footprint',()=>{
 const r=sample();
 r.steps[0].after.genuineHumanOriginalFootSolid=ramp;
 r.steps[0].after.originalRows[0].actualHumanFootOnOriginalActiveSurface=true;
 r.steps[0].nativeOriginalRampQuadMargin.signedOriginalRampMarginMeters=.23;
 r.reachedOriginalRampOnGenuineCharacterKcc=true;
 assert.equal(classifyB319GenuineOriginalRampWalk(r).verdict,
  'PASS_TRUE_ORIGINAL_RAMP_HUMAN_KCC');
 r.steps[0].after.originalRows[0].actualHumanFootOnOriginalActiveSurface=false;
 assert.throws(()=>classifyB319GenuineOriginalRampWalk(r));
});
test('B319 reject simulated clock and stage mutation',()=>{
 const x=sample();x.steps[0].actualNativeTickDelta=0;
 assert.throws(()=>classifyB319GenuineOriginalRampWalk(x));
 const y=sample();y.steps[0].after.sourceActorRelocations=1;
 assert.throws(()=>classifyB319GenuineOriginalRampWalk(y));
});
