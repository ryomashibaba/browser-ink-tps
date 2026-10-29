import test from 'node:test';
import assert from 'node:assert/strict';
import {b322PlanActualOriginalCrest,b322AuditNativeOriginalCrestExit,
 UPPER_FLOOR_SOLID,UPPER_FLOOR_PAINT}
 from './t21-b322-original-ramp-crest.mjs';
const ramp='UndertowT21D:right-low-route-ramp-positive-z';
const quad={id:'right-low-route-ramp-positive-z',
 sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
 vertices:[[8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
 [4.142941,3,54.257493],[.855934,3,47.552619]]};
const at=(u,v,tick,solid=ramp)=>{
 const [ha,hb,la,lb]=quad.vertices;
 const p=lb.map((n,i)=>n+u*(la[i]-n)+v*(hb[i]-n));
 return {source:'25/17/26/0',tick,actualBodyMeters:[p[0],p[1]+.9,p[2]],
  genuineOriginalFootGapMeters:.04,realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:solid,sourceActorRelocations:0,
  sourceInkRewritten:false,playerPositionRewritten:false,
  originalPositiveRampSourceQuad:quad,
  originalRows:[{surfaceId:ramp+':paint',
   actualHumanFootOnOriginalActiveSurface:solid===ramp},
   {surfaceId:UPPER_FLOOR_PAINT,
    actualHumanFootOnOriginalActiveSurface:solid===UPPER_FLOOR_SOLID},
   ...Array.from({length:15},(_,i)=>({surfaceId:'o'+i}))]};
};
const example=()=>{
 const first=at(.419,.66,2100);
 return {schema:'B322_REAL_NATIVE_CRE​ST_EXIT',source:'25/17/26/0',
  productionAuthorized:false,original4v4Certified:false,
  artAccepted:false,prerequisiteB321Passed:true,first,
  steps:[.73,.8,.86,.92].map((v,i)=>({
   phase:'RAMP',realKey:'KeyW',nativeInputTicks:2,
   actualNativeTickDelta:6,after:at(.43+i*.02,v,2106+i*6)}))};
};
test('real source ramp crest plan remains interior and does not prove route',()=>{
 const plan=b322PlanActualOriginalCrest(at(.419,.66,2100),
  {yawDegrees:112});
 assert.equal(plan.safe,true);
 assert.equal(plan.realHumanPathNotInferred,true);
});
test('real genuine ramp crest does not imply high floor KCC',()=>{
 const x=b322AuditNativeOriginalCrestExit(example());
 assert.equal(x.crestProven,true);
 assert.equal(x.originalUpperFloorReached,false);
});
test('true right-low high-floor Rapier contact after crest is separately PASS',()=>{
 const d=example();d.steps.push({phase:'EXIT',realKey:'KeyW',
  nativeInputTicks:2,actualNativeTickDelta:6,
  after:at(.5,1.01,2130,UPPER_FLOOR_SOLID)});
 const x=b322AuditNativeOriginalCrestExit(d);
 assert.equal(x.originalUpperFloorReached,true);
});
test('never count geometry, teleport or unsupported interval as crest',()=>{
 const d=example();d.steps[1].after.realHumanOriginalFootSupported=false;
 assert.equal(b322AuditNativeOriginalCrestExit(d).crestProven,false);
 const e=example();e.steps[1].after.sourceActorRelocations=1;
 assert.throws(()=>b322AuditNativeOriginalCrestExit(e));
 const f=example();f.prerequisiteB321Passed=false;
 assert.equal(b322AuditNativeOriginalCrestExit(f).crestProven,false);
});
