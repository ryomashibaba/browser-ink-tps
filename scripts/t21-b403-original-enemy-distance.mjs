#!/usr/bin/env node
/** Exact read-only B340 original 180s native 1 human + 7 CPU foot audit. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ORIGINAL_SHA='13f68447daca35330959a5eabefc621a3a7a4b19c8766d0a2c48e7dc514e4ab8';
const TIMES=[180,150,120,90,60,30,0];
const IDS=['A1','A2','A3','B1','B2','B3','B4'];
const check=(v,why)=>{if(!v)throw Error('B403_NATIVE_SOURCE_HOLD_'+why);};
const vec3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const n=x=>Number(x.toFixed(3));
export function b403AuditOriginalEnemyDistance(d){
 check(d?.schema==='B335_REAL_CHROMIUM_SOURCE_ROUND'&&
  d.source==='25/17/26/0'&&d.b340TelemetryVersion===1&&
  d.sourceOriginalUnchanged===true&&d.actualCdpUserClick===true&&
  d.injectedTicks===false&&d.injectedInk===false&&
  d.injectedActorPositions===false&&d.officialWinner==='NONE'&&
  Array.isArray(d.samples)&&d.samples.length===7,'ROUND');
 let prev=-1;
 const frames=[];
 for(let i=0;i<7;i++){
  const s=d.samples[i];
  check(s.thresholdSeconds===TIMES[i]&&
   Number.isSafeInteger(s.tick)&&s.tick>prev&&
   s.originalSolids===25&&s.originalPaint===17&&
   s.originalNavLinks===26&&s.scoreable===0&&
   s.productionAuthorized===false&&s.unrestricted4v4Certified===false&&
   s.cpuActors===7&&s.actualCpuRejoined===7&&
   s.cpuRelocations===0&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.officialWinner==='NONE'&&
   s.matchState===(i===6?'TIME_UP':'PLAYING')&&
   vec3(s.actualHumanBody)&&
   Array.isArray(s.actualCpuFootPositions)&&
   s.actualCpuFootPositions.length===7,'NATIVE_FRAME_'+i);
  check(new Set(s.actualCpuFootPositions.map(c=>c.id)).size===7&&
   IDS.every(id=>s.actualCpuFootPositions.some(c=>c.id===id))&&
   s.actualCpuFootPositions.every(c=>vec3(c.foot)),
   'REAL_ROSTER_AND_FOOTS_'+i);
  if(i<6)check(s.originalHumanFootSupport?.supported===true&&
   s.originalHumanFootSupport.id==='UndertowT21D:spawn-high-positive-z'&&
   Number.isFinite(s.originalHumanFootSupport.gap)&&
   s.originalHumanFootSupport.gap<=.4,'REAL_HUMAN_FOOT_'+i);
  const enemies=s.actualCpuFootPositions
   .filter(c=>c.id.startsWith('B'))
   .map(c=>({id:c.id,
    distance:Math.hypot(c.foot[0]-s.actualHumanBody[0],
     c.foot[2]-s.actualHumanBody[2]),
    height:Math.abs(c.foot[1]-s.actualHumanBody[1])}))
   .sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));
  check(enemies.length===4,'FOUR_REAL_ENEMIES_'+i);
  frames.push({
   remainingSeconds:s.thresholdSeconds,nativeTick:s.tick,
   nearestEnemyId:enemies[0].id,
   nearestHorizontalMeters:n(enemies[0].distance),
   enemies:enemies.map(c=>({id:c.id,
    horizontalMeters:n(c.distance),verticalMeters:n(c.height)})),
   anyWithinB18132m:enemies.some(c=>c.distance<=32)
  });
  prev=s.tick;
 }
 return {schema:'B403_TRUE_7_FRAME_ORIGINAL_ENEMY_FRONTIER',
  rawOriginalRun:40988204871,rawOriginalArtifact:12949234359,
  source:'25/17/26/0',
  sampledMinimumNearestMeters:n(Math.min(...frames.map(x=>x.nearestHorizontalMeters))),
  sampledMaximumNearestMeters:n(Math.max(...frames.map(x=>x.nearestHorizontalMeters))),
  allSevenSamplesOutsideB18132m:frames.every(x=>!x.anyWithinB18132m),
  frames,
  continuous180sCombatRangeCertified:false,
  originalCollisionRayCertified:false,
  realHumanProjectileCpuHitCertified:false,
  realCpuHpLossSplatRespawnCertified:false,
  naturalOpponentRouteCertified:false,
  officialWinner:'NONE',scoreable:0,
  unrestricted4v4Certified:false,productionAuthorized:false,gameplayWrites:0};
}
export function b403AuditPinnedRealBytes(bytes){
 check(createHash('sha256').update(bytes).digest('hex')===ORIGINAL_SHA,
  'ARTIFACT_SHA256');
 return {...b403AuditOriginalEnemyDistance(JSON.parse(bytes.toString('utf8'))),
  sha256Verified:ORIGINAL_SHA};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [from,to]=process.argv.slice(2);
 check(from?.endsWith('.json')&&to?.endsWith('.json'),'INPUT_OUTPUT');
 const result=b403AuditPinnedRealBytes(readFileSync(from));
 writeFileSync(to,JSON.stringify(result,null,2)+'\n');
 console.log('B403_GENUINE_ORIGINAL_ENEMY_DISTANCE',JSON.stringify({
  min:result.sampledMinimumNearestMeters,max:result.sampledMaximumNearestMeters,
  outside32m:result.allSevenSamplesOutsideB18132m,
  realProjectileCpuHit:false}));
}
