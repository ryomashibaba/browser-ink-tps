import test from 'node:test';
import assert from 'node:assert/strict';
import {b326AuditExtendedUpperFloor}
 from './t21-b326-extended-original-upper-floor.mjs';
import {UPPER_FLOOR_SOLID,UPPER_FLOOR_PAINT}
 from './t21-b322-original-ramp-crest.mjs';
const R='UndertowT21D:right-low-route-ramp-positive-z';
const quad={id:'right-low-route-ramp-positive-z',
 sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
 vertices:[[8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
 [4.142941,3,54.257493],[.855934,3,47.552619]]};
const at=(u,v,tick,solid=R)=>{
 const [ha,hb,la,lb]=quad.vertices;
 const p=lb.map((n,i)=>n+u*(la[i]-n)+v*(hb[i]-n));
 return {source:'25/17/26/0',tick,actualBodyMeters:[p[0],p[1]+.9,p[2]],
  genuineOriginalFootGapMeters:.04,realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:solid,sourceActorRelocations:0,
  sourceInkRewritten:false,playerPositionRewritten:false,
  originalPositiveRampSourceQuad:quad,
  originalRows:[{surfaceId:R+':paint',
   actualHumanFootOnOriginalActiveSurface:solid===R},
   {surfaceId:UPPER_FLOOR_PAINT,
    actualHumanFootOnOriginalActiveSurface:solid===UPPER_FLOOR_SOLID},
   ...Array.from({length:15},(_,i)=>({surfaceId:'other'+i}))]};
};
function fixture(){
 const prior={schema:'B322_REAL_NATIVE_CREST_EXIT',source:'25/17/26/0',
  productionAuthorized:false,original4v4Certified:false,artAccepted:false,
  prerequisiteB321Passed:true,first:at(.419,.66,2100),
  steps:[.73,.8,.86,.92].map((v,i)=>({
   phase:'RAMP',realKey:'KeyW',nativeInputTicks:2,
   actualNativeTickDelta:6,after:at(.43+.02*i,v,2106+i*6)}))};
 prior.steps.push({phase:'EXIT',realKey:'KeyW',
  nativeInputTicks:2,actualNativeTickDelta:6,
  after:at(.5,1.01,2130,UPPER_FLOOR_SOLID)});
 const first=structuredClone(prior.steps.at(-1).after);
 const attempt={schema:'B324_REAL_ORIGINAL_UPPER_FLOOR',
  source:'25/17/26/0',productionAuthorized:false,
  original4v4Certified:false,artAccepted:false,first,
  steps:Array.from({length:5},(_,i)=>{
   const before=structuredClone(first);
   before.tick+=6*i;
   before.actualBodyMeters[0]+=.11*i;
   before.actualBodyMeters[2]-=.03*i;
   const s=structuredClone(before);
   s.tick+=6;s.actualBodyMeters[0]+=.11;
   s.actualBodyMeters[2]-=.03;
   return {realKey:'KeyW',nativeInputTicks:2,
    actualNativeTickDelta:6,before,after:s};
  })};
 return {prior,attempt};
}

function extension(){
 const {prior,attempt}=fixture();
 const first=structuredClone(attempt.steps.at(-1).after);
 const extended={schema:'B326_NATIVE_SOURCE_UPPER_FLOOR_EXTENSION',
  source:'25/17/26/0',productionAuthorized:false,
  original4v4Certified:false,artAccepted:false,first,
  steps:Array.from({length:7},(_,i)=>{
   const before=structuredClone(first);
   before.tick+=6*i;before.actualBodyMeters[0]+=.46*i;
   before.actualBodyMeters[2]-=.11*i;
   const after=structuredClone(before);
   after.tick+=6;after.actualBodyMeters[0]+=.46;
   after.actualBodyMeters[2]-=.11;
   return {realKey:'KeyW',nativeInputTicks:2,
    actualNativeTickDelta:6,before,after};
  })};
 return {prior,attempt,extended};
}
test('original B324 proof plus seven genuine extended steps passes',()=>{
 const d=extension(),x=b326AuditExtendedUpperFloor(
  d.prior,d.attempt,d.extended);
 assert.equal(x.verdict,'PASS_GENUINE_EXTENDED_ORIGINAL_UPPER_FLOOR_KCC');
 assert.ok(x.actualAdditionalPlanarMeters>=2.5);
 assert.ok(x.combinedVerifiedUpperFloorMeters>x.actualPreviousB324Meters);
});
test('unproven B324 cannot authorize extended movement',()=>{
 const d=extension();d.attempt.steps[0].after.realHumanOriginalFootSupported=false;
 assert.equal(b326AuditExtendedUpperFloor(d.prior,d.attempt,d.extended)
  .extendedUpperFloorProven,false);
});
test('short extension and even one true nonoriginal-foot step are HOLD',()=>{
 const d=extension();d.extended.steps.splice(3);
 assert.equal(b326AuditExtendedUpperFloor(d.prior,d.attempt,d.extended)
  .extendedUpperFloorProven,false);
 const e=extension();e.extended.steps[2].after.genuineHumanOriginalFootSolid=R;
 assert.equal(b326AuditExtendedUpperFloor(e.prior,e.attempt,e.extended)
  .extendedUpperFloorProven,false);
});
test('disconnected B324 end and teleport evidence fail closed',()=>{
 const d=extension();d.extended.first.actualBodyMeters[0]+=.5;
 assert.throws(()=>b326AuditExtendedUpperFloor(d.prior,d.attempt,d.extended),
  /TRUE_B324_LAST_NATIVE_BODY_CARRYOVER/);
 const e=extension();e.extended.steps[1].after.sourceActorRelocations=1;
 assert.throws(()=>b326AuditExtendedUpperFloor(e.prior,e.attempt,e.extended),
  /GENUINE_CDPSOURCE_WITNESS/);
});
test('an unobserved drift larger than 15cm is not continuous walking',()=>{
 const d=extension();d.extended.steps[1].before.actualBodyMeters[0]+=.35;
 assert.equal(b326AuditExtendedUpperFloor(d.prior,d.attempt,d.extended)
  .extendedUpperFloorProven,false);
});
