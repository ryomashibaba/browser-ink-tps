import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {b281AuditNativeAirborneProxyAndLowerSource as audit}
 from './t21-b281-airborne-original-crowd-gate.mjs';
const high='UndertowT21D:spawn-high-positive-z',
 lower='UndertowT21D:first-drop-landing-positive-z';
function sample(tick,hit,grounded,passiveActive,y=8.395){
 return {
  tick,paused:false,stopReason:null,
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  player:{position:[.016,y,57]},
  cpuContinuity:{actors:['A1','A2','A3','B1','B2','B3','B4']
   .map(id=>({id}))},
  b112OriginalHumanGround:{enabled:true,genuineKccGrounded:grounded,
   lastOriginalSourceHitId:hit,lastOriginalSourceGapMeters:grounded?.02:null},
  humanCrowd:{
   active:passiveActive,airborneOrUnverifiableTicks:grounded?0:1,
   sourceNavmeshChanged:false,playerFootMoved:false,
   fakeHumanPhysicalActors:0
  }
 };
}
const good=()=>[
 sample(195,high,true,true,8.395),
 sample(219,null,false,false,7.656),
 sample(243,lower,true,false,3.895)
];
test('B281 certifies source KCC high, truly airborne, original first-drop landing with 7 CPUs',()=>{
 const q=audit(good());
 assert.equal(q.realRapierAirborneSamples,1);
 assert.equal(q.realAirborneSamplesWithPassiveProxy,0);
 assert.equal(q.verifiedGenuineFirstDropLandingTick,243);
 assert.equal(q.verifiedOriginalLandingSourceId,lower);
 assert.equal(q.nativeSevenCpuIdCount,7);
 assert.equal(q.centralUnderpassConnected,false);
 assert.equal(q.unrestricted4v4Certified,false);
 assert.equal(q.productionAuthorized,false);
});
test('B281 blocks a nonphysical crowd steering proxy active while Rapier KCC is airborne',()=>{
 const x=good();
 x[1].humanCrowd.active=true;
 assert.throws(()=>audit(x),/NATIVE_AIRBORNE_EIGHTH_RECAST_PROXY_UNSAFE/);
});
test('B281 refuses false lower landing or no actual airborne sample',()=>{
 const wrong=good();
 wrong[2].b112OriginalHumanGround.genuineKccGrounded=false;
 assert.throws(()=>audit(wrong),/ORIGINAL_FIRST_DROP_LANDING_NOT_GENUINELY_GROUNDED/);
 const stage=good();
 stage[1].b112OriginalHumanGround.genuineKccGrounded=true;
 assert.throws(()=>audit(stage),/NO_OBSERVED_REAL_RAPIER_AIRBORNE_TRANSITION/);
});
test('B281 refuses invented CPU, changed source, game stop and fake actor/mesh flags',()=>{
 const q=good();q[1].cpuContinuity.actors.pop();
 assert.throws(()=>audit(q),/ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING/);
 const s=good();s[0].originalSourceSolids=26;
 assert.throws(()=>audit(s),/ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING/);
 const t=good();t[1].stopReason='UNBOUNDED_CROWD_DRIFT';
 assert.throws(()=>audit(t),/ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING/);
 const p=good();p[1].humanCrowd.fakeHumanPhysicalActors=1;
 assert.throws(()=>audit(p),/ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING/);
});
test('B281 rejects invalid tick ordering, source lower Y and invalid original start',()=>{
 const x=good();x[2].tick=219;
 assert.throws(()=>audit(x),/ORIGINAL_SEVEN_CPU_CROWD_STATE_MISSING/);
 const y=good();y[2].player.position[1]=9;
 assert.throws(()=>audit(y),/FIRST_DROP_ORIGINAL_Y_BAND_NOT_PROVEN/);
 const z=good();z[0].b112OriginalHumanGround.lastOriginalSourceHitId=null;
 assert.throws(()=>audit(z),/ORIGINAL_HIGH_SOURCE_START_MISSING/);
});
