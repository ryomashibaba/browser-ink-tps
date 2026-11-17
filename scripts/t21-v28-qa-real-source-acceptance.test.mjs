import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditRealSourceB440} from './t21-v28-qa-real-source-acceptance.mjs';

const ids=['A1','A2','A3','B1','B2','B3','B4'];
function originalProof(){
 const footprint=delta=>ids.map((id,i)=>({
  id,foot:[i*2+(id==='B4'?0:delta),3,id.startsWith('A')?55:-55],
  rejoined:true
 }));
 return {
  schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',source:'25/17/26/0',
  stage:'OBSERVING_REAL_CPU',verdict:'HOLD',
  actorWrites:0,nativeClockWrites:0,scoreWrites:0,sourceGeometryWrites:0,
  after:{phase:'PLAYING',cpuRejoins:7,tick:1068},
  b475RealMouseAccepted:{realHumanShots:6,genuineChromeMouse:true},
  nativePlayerShotPaintHud:{
   lastMode:'ACTUAL_SHOT_ONLY',lastImpactChangedCells:90,originalScoreable:0
  },
  b441NativeEvidence:{realFrames:[
   {tick:1224,physicalFeet:footprint(0)},
   {tick:1248,physicalFeet:footprint(1)},
   {tick:1272,physicalFeet:footprint(2)},
   {tick:1296,physicalFeet:footprint(3)}
  ]},
  k2WindowProvenance:null,
  k2PerActorNativeShotAndInk:null
 };
}
function withRealK2(p,delta=720){
 p.k2WindowProvenance={firstTick:1068,lastTick:1068+delta,
  nativeTickDelta:delta,browserOriginEqual:true,
  expectedBrowserOrigin:1794892763088.9,
  observedBrowserOrigin:1794892763088.9};
 p.k2PerActorNativeShotAndInk={
  source:'25/17/26/0',sameUnmodifiedSourceWorld:true,
  originalActorOrColliderWrites:0,nativeTicksObserved:delta,
  byActor:Object.fromEntries(ids.map(id=>[id,{
   sourceTurfShotRequests:4,impactChangedCells:7,changedCells:8
  }]))
 };
 return p;
}
test('genuine 240 configured RAW: human paint is not CPU hit nor 600-tick K2',()=>{
 const x=originalProof();x.b441NativeEvidence.intendedRealNativeTicks=240;
 const v=auditRealSourceB440(x);
 assert.equal(v.actual7CpuPlayingRejoined,true);
 assert.equal(v.human.realChromeMouseShots,6);
 assert.equal(v.human.realSourceImpactChangedCells,90);
 assert.equal(v.combat.k2NativeCounterWindowVerified,false);
 assert.equal(v.combat.allSevenProjectileImpactPaintCertified,false);
 assert.equal(v.primaryBlocker,'K2_REAL_600_TICK_SAME_ORIGIN_NOT_PROVEN');
 assert.equal(v.combat.actualOpponentHpDamageCertified,false);
 assert.equal(v.combat.sameActor150NativeTickRespawnCertified,false);
 assert.equal(v.evidenceLimits.formal4v4Certified,false);
});
test('same-world 720 measured and seven actual CPU impact cells stop at opponent HP gate',()=>{
 const v=auditRealSourceB440(withRealK2(originalProof()));
 assert.equal(v.combat.k2MeasuredNativeDelta,720);
 assert.equal(v.combat.k2NativeCounterWindowVerified,true);
 assert.equal(v.combat.actorsWithRealProjectileImpactPaint.length,7);
 assert.equal(v.primaryBlocker,'NATURAL_OPPONENT_HP_SPLAT_RESPAWN_NOT_PROVEN');
 assert.equal(v.combat.actualCpuSplatCertified,false);
});
test('one actual CPU without accepted projectile paint cannot produce 7CPU impact PASS',()=>{
 const x=withRealK2(originalProof());
 x.k2PerActorNativeShotAndInk.byActor.B4.impactChangedCells=0;
 const v=auditRealSourceB440(x);
 assert.equal(v.combat.actorsWithRealProjectileImpactPaint.length,6);
 assert.equal(v.combat.perActor.B4.actualImpactObserved,false);
 assert.equal(v.primaryBlocker,'REAL_SEVEN_CPU_PROJECTILE_IMPACT_NOT_PROVEN');
 assert.equal(v.combat.actorsWithActualSourceTurfShotRequests.length,7);
});
test('599, origin mismatch and missing live time origin are all fail closed',()=>{
 for(const obj of [
  {firstTick:1068,lastTick:1667,nativeTickDelta:599,browserOriginEqual:true,
   expectedBrowserOrigin:1794892763088.9,observedBrowserOrigin:1794892763088.9},
  {firstTick:1068,lastTick:1788,nativeTickDelta:720,browserOriginEqual:false,
   expectedBrowserOrigin:1794892763088.9,observedBrowserOrigin:1794892763089.9},
  {firstTick:1068,lastTick:1788,nativeTickDelta:720}
 ]){
  const x=withRealK2(originalProof());
  x.k2WindowProvenance=obj;
  const v=auditRealSourceB440(x);
  assert.equal(v.combat.k2NativeCounterWindowVerified,false);
  assert.equal(v.primaryBlocker,'K2_REAL_600_TICK_SAME_ORIGIN_NOT_PROVEN');
 }
});
test('real CPU sampled movement and stationary B4 are not certified 60Hz KCC',()=>{
 const v=auditRealSourceB440(originalProof());
 assert.equal(v.nativeCpu.validReadOnlyFootFrames,4);
 assert.equal(v.nativeCpu.sampledMotionByActor.A1.firstToLastPlanarDisplacementMeters,3);
 assert.equal(v.nativeCpu.sampledMotionByActor.B4.firstToLastPlanarDisplacementMeters,0);
 assert.equal(v.nativeCpu.sampledMotionByActor.B4.observedNearStationaryConsecutiveTicks,72);
 assert.deepEqual(v.nativeCpu.nearStationarySampledActors,['B4']);
 assert.equal(v.nativeCpu.full60HzPathCertified,false);
 assert.equal(v.nativeCpu.naturalCrossTeamRouteCertified,false);
});
test('malformed or duplicated native frames do not invent position movement',()=>{
 const x=originalProof();
 x.b441NativeEvidence.realFrames.push({tick:1300,
  physicalFeet:[...x.b441NativeEvidence.realFrames[0].physicalFeet.slice(0,6),
   x.b441NativeEvidence.realFrames[0].physicalFeet[0]]});
 x.b441NativeEvidence.realFrames[1].physicalFeet[0].foot=[NaN,3,55];
 const v=auditRealSourceB440(x);
 assert.equal(v.nativeCpu.validReadOnlyFootFrames,3);
 assert.equal(v.nativeCpu.sampledMotionByActor.A1.fullNativeKccTrajectoryCertified,false);
});
test('observer-owned state writes preempt all ink/CPU certifications',()=>{
 const x=withRealK2(originalProof());
 x.actorWrites=1;
 const v=auditRealSourceB440(x);
 assert.equal(v.noObserverGameWrites,false);
 assert.equal(v.primaryBlocker,'PROTECTED_NATIVE_STATE_WRITES');
 assert.equal(v.combat.k2NativeCounterWindowVerified,false);
});
test('wrong SOURCE schema or authority fails loudly',()=>{
 const x=originalProof();
 assert.throws(()=>auditRealSourceB440({...x,source:'26/17/26/0'}),
  /SOURCE_AUTHORITY_REQUIRED/);
 assert.throws(()=>auditRealSourceB440({...x,schema:'mock'}),
  /SOURCE_AUTHORITY_REQUIRED/);
});
