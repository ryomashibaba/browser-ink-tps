import test from 'node:test';
import assert from 'node:assert/strict';
import {b406AuditRealSameSessionFrontier as audit} from './t21-b406-same-session-native-enemy-frontier.mjs';
const ROSTER=['A1','A2','A3','B1','B2','B3','B4'];
function fixture(enemyZ=-55){
 const input={
  schema:'B337_INDEPENDENT_SHORT_SOURCE_INPUT_RESULT',
  verdict:'PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT',
  actualHumanNewShots:9,actualHumanChangedCells:92,
  actualSourceAimSurface:'UndertowT21D:spawn-high-positive-z:paint',
  gameplayCertified:false,unrestricted4v4Certified:false,
  productionAuthorized:false
 };
 return {
  schema:'B405_SINGLE_GENUINE_180S_HUMAN_7CPU_SOURCE',
  source:'25/17/26/0',originalStageUntouched:true,
  injectedTime:false,injectedInk:false,injectedActors:false,
  officialWinner:'NONE',b337ActualNativeInputVerdict:input,
  samples:['AFTER_INPUT','150','120','90','60','30','0'].map((label,i)=>({
   label,tick:i===0?1200:1200+i*1650,
   remainingSeconds:i===0?160:[-1,150,120,90,60,30,0][i],
   matchState:i===6?'TIME_UP':'PLAYING',
   paused:i===6,stopReason:null,
   originalSourceSolids:25,originalPaintSurfaces:17,
   originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
   turfResult:'UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED',
   productionAuthorized:false,unrestricted4v4Certified:false,
   player:[0,8.4,68],humanShots:9,humanChangedCells:92,
   cpuActualChangedCells:200+i*50,
   realCpuSourceShots:80+i,
   humanCpuDirectHits:0,humanCpuDirectSplats:0,
   cpuSplats:0,cpuRespawns:0,cpuPhysicalRelocations:0,
   cpuPhysicalRejoinedCount:7,
   cpuActors:ROSTER.map((id,j)=>({
    id,lifeState:'ACTIVE',hp:100,rejoined:true,
    foot:[j*.2,4,id.startsWith('B')?enemyZ:50]
   })),
   originalHumanFoot:i===6?null:{
    id:'UndertowT21D:spawn-high-positive-z',supported:true,gap:.03
   },
   actualPointerLocked:i!==6
  }))
 };
}
test('same genuine native session 7 frames/28 real B bodies, but no fake CPU HP hit',()=>{
 const r=audit(fixture());
 assert.equal(r.sameGenuineGameSessionHumanAndCpuBodies,true);
 assert.equal(r.sevenRealNativeCheckpoints,7);
 assert.equal(r.allSampledLivingRejoinedOpponentsOutsideB181Optical32m,true);
 assert.ok(r.nearestObservedLivingEnemyHorizontalMeters>120);
 assert.equal(r.nativeHumanCpuProjectileHitCertified,false);
 assert.equal(r.sameActorCpuSplatRespawnChainCertified,false);
 assert.equal(r.naturalOpposingTeamRouteCertified,false);
 assert.equal(r.observedNativeFramesOnlyNotContinuous180s,true);
});
test('within 32m is only a position candidate, NOT physics, ray or hit certification',()=>{
 const r=audit(fixture(48));
 assert.equal(r.anyObservedLivingRejoinedOpponentWithinB181Optical32m,true);
 assert.equal(r.actualOriginalStageRayClearCertified,false);
 assert.equal(r.nativeHumanCpuHpLossCertified,false);
 assert.equal(r.productionAuthorized,false);
});
test('real dead CPU cannot be silently used as a living encounter candidate',()=>{
 const x=fixture(48);
 for(const s of x.samples){
  const c=s.cpuActors.find(c=>c.id==='B1');
  c.lifeState='SPLATTED';c.hp=0;c.rejoined=false;
 }
 const r=audit(x);
 assert.equal(r.observations[0].livingRejoinedOpponents,3);
 assert.equal(r.observations[0].actualFourOpponentBodies.length,4);
 assert.equal(r.naturalOpposingTeamRouteCertified,false);
});
test('different-world provenance, forged body, time or score must fail closed',()=>{
 for(const change of [
  x=>{x.source='25/18/26/0';},
  x=>{x.injectedActors=true;},
  x=>{x.samples[0].cpuActors[4].foot=[NaN,4,48];},
  x=>{x.samples[1].cpuActors[3].id='FAKE_B1';},
  x=>{x.samples[2].originalSourceSolids=26;},
  x=>{x.samples[3].tick=x.samples[2].tick;},
  x=>{x.samples[4].sourceScoreablePromotions=1;},
  x=>{x.samples[5].originalHumanFoot.supported=false;},
  x=>{x.samples[6].matchState='PLAYING';}
 ]){
  const x=fixture();change(x);
  assert.throws(()=>audit(x),/B40[56]_.*HOLD_/);
 }
});
