import test from 'node:test';
import assert from 'node:assert/strict';
import {b324AuditGenuineUpperFloor}
 from './t21-b324-original-upper-floor-continuation.mjs';
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
test('continuous original upper floor native KCC is separately proven',()=>{
 const {prior,attempt}=fixture();
 const v=b324AuditGenuineUpperFloor(prior,attempt);
 assert.equal(v.verdict,'PASS_GENUINE_ORIGINAL_UPPER_FLOOR_CONTINUOUS_KCC');
 assert.ok(v.witnessedPlanarMeters>.3);
});
test('single upper floor touchdown cannot be promoted',()=>{
 const {prior,attempt}=fixture();attempt.steps=[];
 assert.equal(b324AuditGenuineUpperFloor(prior,attempt).continuousUpperFloor,false);
});
test('unsupported step or non-original paint surface remains HOLD',()=>{
 const {prior,attempt}=fixture();
 attempt.steps[2].after.realHumanOriginalFootSupported=false;
 assert.equal(b324AuditGenuineUpperFloor(prior,attempt).continuousUpperFloor,false);
 const f=fixture();f.attempt.steps[1].after.originalRows[1]
  .actualHumanFootOnOriginalActiveSurface=false;
 assert.equal(b324AuditGenuineUpperFloor(f.prior,f.attempt)
  .continuousUpperFloor,false);
});
test('tampering with native position or source relocation rejects',()=>{
 const {prior,attempt}=fixture();
 attempt.steps[0].after.sourceActorRelocations=1;
 assert.throws(()=>b324AuditGenuineUpperFloor(prior,attempt),/ACTUAL_NATIVE_INPUT/);
 const f=fixture();f.attempt.first.actualBodyMeters[0]+=1;
 assert.throws(()=>b324AuditGenuineUpperFloor(f.prior,f.attempt),/SAME_B322_TRUE_FLOOR_START/);
});
test('B322 predecessor HOLD cannot promote B324',()=>{
 const {prior,attempt}=fixture();prior.prerequisiteB321Passed=false;
 assert.equal(b324AuditGenuineUpperFloor(prior,attempt).continuousUpperFloor,false);
});

test('real before/after snapshots must agree with native input ticks',()=>{
 const {prior,attempt}=fixture();
 attempt.steps[0].before.tick+=2;
 assert.throws(()=>b324AuditGenuineUpperFloor(prior,attempt),/ACTUAL_NATIVE_INPUT/);
});
test('large idle movement between genuine observations cannot establish a route',()=>{
 const {prior,attempt}=fixture();
 attempt.steps[1].before.actualBodyMeters[0]+=.28;
 assert.equal(b324AuditGenuineUpperFloor(prior,attempt).continuousUpperFloor,false);
});
