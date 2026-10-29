import test from 'node:test';
import assert from 'node:assert/strict';
import {b321OriginalRampHighSectionPlan,b321AuditTrueOriginalHigherRamp}
 from './t21-b321-real-upper-ramp-kcc.mjs';
const root='UndertowT21D:';
const ramp=root+'right-low-route-ramp-positive-z';
const mesh={id:'right-low-route-ramp-positive-z',
 sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
 vertices:[[8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
 [4.142941,3,54.257493],[.855934,3,47.552619]]};
const sample=(u,v,tick)=>{
 const [ha,hb,la,lb]=mesh.vertices;
 const p=lb.map((x,i)=>x+u*(la[i]-x)+v*(hb[i]-x));
 return {source:'25/17/26/0',tick,
  actualBodyMeters:[p[0],p[1]+.913,p[2]],
  realHumanOriginalFootSupported:true,
  genuineHumanOriginalFootSolid:ramp,
  genuineOriginalFootGapMeters:.04,
  sourceActorRelocations:0,sourceInkRewritten:false,
  playerPositionRewritten:false,originalPositiveRampSourceQuad:mesh,
  originalRows:[{surfaceId:ramp+':paint',
   actualHumanFootOnOriginalActiveSurface:true},
  ...Array.from({length:16},(_,i)=>({surfaceId:'orig-'+i}))]};
};
const payload=()=>({schema:'B321_TRUE_CDP_UPPER_RAMP_TRAVERSE',
 source:'25/17/26/0',productionAuthorized:false,
 original4v4Certified:false,artAccepted:false,
 prerequisiteB320Passed:true,first:sample(.31,.25,2007),
 steps:[.37,.46,.57,.66].map((v,i)=>({
  realKey:'KeyW',nativeInputTicks:4,actualNativeTickDelta:6,
  after:sample(.34+i*.02,v,2013+i*6)}))});
test('B321 plans ORIGINAL upper ramp interior from real B320 KCC',()=>{
 const plan=b321OriginalRampHighSectionPlan({ledger:sample(.31,.25,2007),
  camera:{yawDegrees:104}});
 assert.equal(plan.safe,true);
 assert.ok(plan.targetCoord.originalUphillFraction>=.75);
 assert.equal(plan.noRouteOrColliderGenerated,true);
});
test('B321 independent true ramp high section has height gain and continuous support',()=>{
 const p=b321AuditTrueOriginalHigherRamp(payload());
 assert.equal(p.verdict,'PASS_GENUINE_ORIGINAL_RAMP_HIGH_SECTION_KCC');
 assert.equal(p.actuallyRampSupportedSteps,4);
});
test('B321 refuses false upper progress, lost support or altered original actors',()=>{
 const a=payload();a.steps[3].after.genuineHumanOriginalFootSolid=null;
 assert.equal(b321AuditTrueOriginalHigherRamp(a).verdict,
  'HOLD_NO_GENUINE_CONTINUOUS_HIGH_RAMP_KCC');
 const b=payload();b.steps[1].after.sourceActorRelocations=1;
 assert.throws(()=>b321AuditTrueOriginalHigherRamp(b));
 const c=payload();c.prerequisiteB320Passed=false;
 assert.equal(b321AuditTrueOriginalHigherRamp(c).verdict,
  'HOLD_B320_REAL_UPHILL_PREREQUISITE_MISSING');
});
