import test from 'node:test';
import assert from 'node:assert/strict';
import {RAMP_SOLID,RAMP_PAINT,b320SourceRampCoordinates,
 b320PlanOriginalTrueRampUphill,b320AuditActualNativeRampAscent}
 from './t21-b320-original-ramp-uphill-kcc.mjs';
const quad={id:'right-low-route-ramp-positive-z',
 sourceObject:'Fld_Temple01_pCube21569_1__FloorConcrete03',
 vertices:[[8.333487,4.5,52.203114],[5.046481,4.5,45.49824],
 [4.142941,3,54.257493],[.855934,3,47.552619]]};
const pose=(x,y,z,tick=1922,solid=RAMP_SOLID)=>({
 tick,source:'25/17/26/0',actualBodyMeters:[x,y,z],
 realHumanOriginalFootSupported:solid!==null,
 genuineHumanOriginalFootSolid:solid,
 sourceActorRelocations:0,sourceInkRewritten:false,
 playerPositionRewritten:false,originalRows:
 [{surfaceId:RAMP_PAINT,actualHumanFootOnOriginalActiveSurface:solid===RAMP_SOLID},
  ...Array.from({length:16},(_,i)=>({surfaceId:'real-source-'+i}))],
 originalPositiveRampSourceQuad:quad});
const first=pose(1.6678780317,3.981724739,48.71932983);
test('B320 original ramp coordinates identify physical B319 PASS on slope',()=>{
 const c=b320SourceRampCoordinates(quad,first.actualBodyMeters);
 assert.ok(c.insideSourceQuadXZ);
 assert.ok(c.originalUphillFraction>=0&&c.originalUphillFraction<.2);
 const p=b320PlanOriginalTrueRampUphill({ledger:first,
  camera:{yawDegrees:92.19205}});
 assert.equal(p.safe,true);
 assert.ok(p.targetCoordinate.originalUphillFraction>
  p.startCoordinate.originalUphillFraction+.15);
 assert.equal(p.noAddedNavLinkOrCollider,true);
});
const target=(u,v,tick)=>{
 const [hiA,hiB,loA,loB]=quad.vertices;
 const p=loB.map((z,i)=>z+u*(loA[i]-z)+v*(hiB[i]-z));
 return pose(p[0],3.895+.0+1.5*v,p[2],tick);
};
const payload=()=>{
 const p={schema:'B320_TRUE_CDP_ORIGINAL_RAMP_ASCENT',
  source:'25/17/26/0',first,original4v4Certified:false,
  artAccepted:false,productionAuthorized:false,steps:[]};
 for(const [i,v] of [.13,.25,.34].entries()){
  const a=target(.3,v,1928+i*6);
  p.steps.push({realKey:'KeyW',nativeInputTicks:4,
   actualNativeTickDelta:6,after:a});
 }
 return p;
};
test('B320 genuine repeated ramp support, height and uphill fraction PASS',()=>{
 const out=b320AuditActualNativeRampAscent(payload());
 assert.equal(out.verdict,'PASS_GENUINE_ORIGINAL_RAMP_UPHILL_KCC');
 assert.equal(out.supportedNativeRampSteps,3);
});
test('B320 rejects missing true support, partial rise, stage mutations',()=>{
 const a=payload();
 a.steps[2].after.genuineHumanOriginalFootSolid=null;
 a.steps[2].after.realHumanOriginalFootSupported=false;
 assert.equal(b320AuditActualNativeRampAscent(a).verdict,
  'HOLD_UPHILL_PHYSICAL_SUPPORT_OR_ASCENT_NOT_PROVEN');
 const b=payload();b.steps[1].after.sourceActorRelocations=1;
 assert.throws(()=>b320AuditActualNativeRampAscent(b));
 const c=payload();c.steps.pop();c.steps.pop();
 assert.equal(b320AuditActualNativeRampAscent(c).verdict,
  'HOLD_UPHILL_PHYSICAL_SUPPORT_OR_ASCENT_NOT_PROVEN');
});
