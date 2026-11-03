#!/usr/bin/env node
/**
 * B406: same-session genuine source body distance sampling, NOT a hit or path.
 * Consumes the SAME B405 real Chrome game session seven native checkpoints.
 * B405/B337 independent auditors must certify the input before this audit.
 * Never creates a target, shot, ink, HP, player movement or authorized score.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b405AuditReal180SourceSession} from './t21-b405-single-180s-human-7cpu-audit.mjs';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';

const ENEMIES=['B1','B2','B3','B4'];
const expect=(x,reason)=>{
 if(!x)throw Error('B406_REAL_SAME_SESSION_SOURCE_HOLD_'+reason);
};
const r3=x=>Number(x.toFixed(3));
const realVec=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);

export function b406AuditRealSameSessionFrontier(data){
 const b405=b405AuditReal180SourceSession(data);
 expect(b405.verdict==='PASS_ONE_REAL_NATIVE_180S_7CPU_HUMAN_INPUT_SHOT_INK'&&
  b405.sameNativeCdpGameFromHumanShotUntilTimeUp===true&&
  b405.actualOpponentHpDamageCertified===false&&
  b405.originalOpponentNaturalRouteCertified===false,
  'B405_REAL_SOURCE_INPUT_VERDICT');
 const observations=data.samples.map((s,i)=>{
  expect(realVec(s.player)&&
   Number.isSafeInteger(s.tick)&&
   s.cpuActors.length===7&&
   s.cpuActors.filter(c=>c.rejoined===true).length===
    s.cpuPhysicalRejoinedCount,
   'NATIVE_BODY_AND_ACTUAL_REJOIN_COUNT_'+i);
  const enemy=ENEMIES.map(id=>{
   const c=s.cpuActors.find(c=>c.id===id);
   expect(c&&realVec(c.foot)&&
    Number.isSafeInteger(c.hp)&&
    ['ACTIVE','SPLATTED'].includes(c.lifeState)&&
    typeof c.rejoined==='boolean','ACTUAL_ENEMY_'+id+'_'+i);
   const planar=Math.hypot(c.foot[0]-s.player[0],
    c.foot[2]-s.player[2]);
   const vertical=Math.abs(c.foot[1]-s.player[1]);
   return {
    id,horizontalMeters:r3(planar),verticalMeters:r3(vertical),
    hp:c.hp,lifeState:c.lifeState,rejoined:c.rejoined,
    nativeLivingRejoined:c.lifeState==='ACTIVE'&&c.hp>0&&c.rejoined
   };
  }).sort((a,b)=>a.horizontalMeters-b.horizontalMeters||
   a.id.localeCompare(b.id));
  const live=enemy.filter(x=>x.nativeLivingRejoined);
  return {
   checkpoint:s.label,actualNativeTick:s.tick,
   realRemainingSeconds:s.remainingSeconds,
   realHumanBody:[...s.player],
   actualFourOpponentBodies:enemy,
   livingRejoinedOpponents:live.length,
   nearestLivingRejoinedEnemyId:live[0]?.id??null,
   nearestLivingRejoinedHorizontalMeters:live[0]?.horizontalMeters??null,
   nearestLivingRejoinedVerticalMeters:live[0]?.verticalMeters??null,
   anyLivingRejoinedWithinB181Optical32m:
    live.some(x=>x.horizontalMeters<=32),
   // Real native body locations in the same game, but no real projectile
   // collision, Rapier ray LOS or walkable opposing-team route certified.
   actualNativeRapierSightRayCheckedHere:false,
   humanOpponentProjectileCollisionVerifiedHere:false,
   originalOpponentKccRouteCertifiedHere:false
  };
 });
 const distances=observations.map(x=>
  x.nearestLivingRejoinedHorizontalMeters).filter(x=>x!==null);
 return {
  schema:'B406_ONE_GENUINE_180S_SOURCE_NATIVE_ENEMY_DISTANCE_TIMELINE',
  source:'25/17/26/0',
  b405GameVerdict:b405.verdict,
  sevenRealNativeCheckpoints:observations.length,
  exactFourOriginalOpponentBodiesPerCheckpoint:true,
  sameGenuineGameSessionHumanAndCpuBodies:true,
  nearestObservedLivingEnemyHorizontalMeters:
   distances.length?r3(Math.min(...distances)):null,
  farthestNearestObservedLivingEnemyHorizontalMeters:
   distances.length?r3(Math.max(...distances)):null,
  anyObservedLivingRejoinedOpponentWithinB181Optical32m:
   observations.some(x=>x.anyLivingRejoinedWithinB181Optical32m),
  allSampledLivingRejoinedOpponentsOutsideB181Optical32m:
   distances.length===7&&
   observations.every(x=>x.nearestLivingRejoinedHorizontalMeters>32),
  observations,
  observedNativeFramesOnlyNotContinuous180s:true,
  actualOriginalStageRayClearCertified:false,
  nativeHumanCpuProjectileHitCertified:false,
  nativeHumanCpuHpLossCertified:false,
  sameActorCpuSplatRespawnChainCertified:false,
  naturalOpposingTeamRouteCertified:false,
  sourceScoreablePromotions:0,
  officialWinner:'NONE',
  unrestricted4v4Certified:false,
  productionAuthorized:false,
  gameplayWrites:0
 };
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const folder=process.argv[2];
 expect(typeof folder==='string'&&folder.length>0,'REAL_EVIDENCE_DIR');
 const source=JSON.parse(readFileSync(
  join(folder,'b405-same-original-180s-round.json'),'utf8'));
 const b337=JSON.parse(readFileSync(
  join(folder,'b337-real-input-ink.json'),'utf8'));
 const independentlyValidatedInput=b337AuditNative(b337);
 expect(JSON.stringify(independentlyValidatedInput)===
  JSON.stringify(source.b337ActualNativeInputVerdict),
  'B337_INDEPENDENT_TRUE_INPUT_MATCH');
 const v=b406AuditRealSameSessionFrontier(source);
 const dest=process.argv[3]||
  join(folder,'b406-same-session-native-enemy-frontier.json');
 writeFileSync(dest,JSON.stringify(v,null,2)+'\n');
 console.log('B406_REAL_SAME_GAME_ENEMY_DISTANCE_VERDICT',JSON.stringify({
  sevenCheckpoints:v.sevenRealNativeCheckpoints,
  nearestObservedMeters:v.nearestObservedLivingEnemyHorizontalMeters,
  any32mOpticalCandidate:v.anyObservedLivingRejoinedOpponentWithinB181Optical32m,
  actualHumanEnemyHitCertified:false,
  naturalOpposingRoute:false,
  genuineSameSession:true
 }));
}
