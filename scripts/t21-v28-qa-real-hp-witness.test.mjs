import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyRealNativeHpSnapshot} from './t21-v28-qa-real-hp-witness.mjs';

function state(){
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 return {
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  stopReason:null,tick:1793,matchState:'PLAYING',
  cpu:{physicalRejoins:[...ids],cpu:ids.map(id=>({
   id,lifeState:'ACTIVE',hp:100,rejoined:true
  }))},
  humanCpuDirectHits:0,humanCpuDirectSplats:0,cpuSplats:0,
  cpuRespawns:0,humanSplats:0,humanRespawns:0,
  b367RealCpuLifecycleEvidence:{
   enabled:true,source:'25/17/26/0',syntheticHits:0,
   actorRelocations:0,scoreable:0,
   physicalHumanCpuHpHits:0,events:[]
  }
 };
}
test('genuine 7CPU no actual opponent HP => no fake hit/splat/respawn',()=>{
 const v=classifyRealNativeHpSnapshot(state());
 assert.equal(v.verdict,'HOLD_NO_NATIVE_HUMAN_TO_CPU_HP_LOSS_OBSERVED');
 assert.equal(v.actualHumanCpuHitCount,0);
 assert.equal(v.realOpponentHpLossCertified,false);
 assert.equal(v.sameActorSplatCertified,false);
 assert.equal(v.sameActor150TickRespawnCertified,false);
});
test('actual B367 resolved physical projectile HP loss limited PASS only',()=>{
 const n=state();n.humanCpuDirectHits=1;
 n.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
 n.b367RealCpuLifecycleEvidence.events=[{
  sequence:1,nativeFrame:1700,botId:'B2',weaponId:'pulse-sprayer',
  hpBefore:100,hpAfter:70,actualHpLoss:30,lethalHpZero:false
 }];
 const v=classifyRealNativeHpSnapshot(n);
 assert.equal(v.verdict,'PASS_LIMITED_REAL_HUMAN_TO_CPU_HP_LOSS');
 assert.equal(v.actualHpLossEvents[0].botId,'B2');
 assert.equal(v.realOpponentHpLossCertified,true);
 assert.equal(v.sameActorSplatCertified,false);
 assert.equal(v.sameActor150TickRespawnCertified,false);
});
test('HP0 lethal event is NOT same-actor splat or 150-tick respawn by itself',()=>{
 const n=state();n.humanCpuDirectHits=1;n.cpuSplats=1;n.cpuRespawns=1;
 n.humanCpuDirectSplats=1;
 n.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
 n.b367RealCpuLifecycleEvidence.events=[{
  sequence:1,nativeFrame:1600,botId:'B2',weaponId:'pulse-sprayer',
  hpBefore:20,hpAfter:0,actualHpLoss:20,lethalHpZero:true
 }];
 const v=classifyRealNativeHpSnapshot(n);
 assert.equal(v.lethalHpZeroEventObserved,true);
 assert.equal(v.sameActorSplatCertified,false);
 assert.equal(v.sameActor150TickRespawnCertified,false);
});
test('unknown renderer/world state cannot certify a player HP hit',()=>{
 for(const change of [
  {originalSourceSolids:26},{originalPaintSurfaces:16},
  {originalSourceNavigationLinks:27},{sourceScoreablePromotions:1},
  {productionAuthorized:true},{unrestricted4v4Certified:true},
  {matchState:'STAGING'},{stopReason:'PAUSED'}
 ]){
  const n=Object.assign(state(),change);
  assert.equal(classifyRealNativeHpSnapshot(n).realOpponentHpLossCertified,false);
 }
});
test('synthetic-hit or relocated-actor provenance rejects ALL positive events',()=>{
 for(const kind of ['syntheticHits','actorRelocations','scoreable']){
  const n=state();n.b367RealCpuLifecycleEvidence[kind]=1;
  assert.equal(classifyRealNativeHpSnapshot(n).realOpponentHpLossCertified,false);
 }
});
test('negative, impossible, unsupported and shield-only fabricated events fail closed',()=>{
 const bad=[
  {botId:'A1'},{hpAfter:105},{actualHpLoss:999},
  {nativeFrame:1794},{lethalHpZero:true},
  {hpAfter:100},{sequence:-1}
 ];
 for(const change of bad){
  const n=state();n.humanCpuDirectHits=1;
  n.b367RealCpuLifecycleEvidence.physicalHumanCpuHpHits=1;
  n.b367RealCpuLifecycleEvidence.events=[{
   sequence:1,nativeFrame:1700,botId:'B2',weaponId:'pulse-sprayer',
   hpBefore:100,hpAfter:70,actualHpLoss:30,lethalHpZero:false,...change
  }];
  const v=classifyRealNativeHpSnapshot(n);
  assert.equal(v.realOpponentHpLossCertified,false);
 }
});
test('untrusted CPU global splat counter cannot award a specific actor life',()=>{
 const n=state();n.cpuSplats=5;n.cpuRespawns=5;
 const v=classifyRealNativeHpSnapshot(n);
 assert.equal(v.nativeCpuSplatCounter,5);
 assert.equal(v.nativeCpuRespawnCounter,5);
 assert.equal(v.sameActorSplatCertified,false);
 assert.equal(v.sameActor150TickRespawnCertified,false);
});
