#!/usr/bin/env node
/** QA #18: inspect actual B367 SOURCE projectile->CPU HP ledger from a
 * genuine native Chromium snapshot. No writes, simulated hits or 4v4. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const isCount=n=>Number.isSafeInteger(n)&&n>=0;
const enemies=['B1','B2','B3','B4'];
export function classifyRealNativeHpSnapshot(n){
 const provenance=n?.originalSourceSolids===25&&
  n?.originalPaintSurfaces===17&&
  n?.originalSourceNavigationLinks===26&&
  n?.sourceScoreablePromotions===0&&
  n?.productionAuthorized===false&&
  n?.unrestricted4v4Certified===false&&
  n?.stopReason===null&&
  isCount(n?.tick)&&
  n?.matchState==='PLAYING'&&
  Array.isArray(n?.cpu?.cpu)&&n.cpu.cpu.length===7&&
  n.cpu.physicalRejoins?.length===7&&
  n?.b367RealCpuLifecycleEvidence?.source==='25/17/26/0'&&
  n.b367RealCpuLifecycleEvidence.syntheticHits===0&&
  n.b367RealCpuLifecycleEvidence.actorRelocations===0&&
  n.b367RealCpuLifecycleEvidence.scoreable===0;
 const source=n?.b367RealCpuLifecycleEvidence;
 const events=[];
 const countersValid=provenance&&
  [n.humanCpuDirectHits,n.humanCpuDirectSplats,n.cpuSplats,
   n.cpuRespawns,n.humanSplats,n.humanRespawns,
   source?.physicalHumanCpuHpHits].every(isCount);
 if(countersValid&&source?.enabled===true&&
   source.physicalHumanCpuHpHits<=n.humanCpuDirectHits&&
   Array.isArray(source.events)){
  for(const e of source.events){
   if(!isCount(e.sequence)||!isCount(e.nativeFrame)||
      e.sequence===0||e.nativeFrame>n.tick||
      !enemies.includes(e.botId)||
      typeof e.weaponId!=='string'||e.weaponId.length===0||
      ![e.hpBefore,e.hpAfter,e.actualHpLoss].every(Number.isFinite)||
      e.hpBefore<=0||e.hpBefore>100||
      e.hpAfter<0||e.hpAfter>=e.hpBefore||
      e.actualHpLoss<=0||
      Math.abs(e.actualHpLoss-(e.hpBefore-e.hpAfter))>1e-5||
      e.lethalHpZero!==(e.hpAfter===0)){
    return {schema:'T21_V28_QA18_REAL_NATIVE_HP_WITNESS_V1',
     source:'25/17/26/0',verdict:'HOLD_INVALID_REAL_HP_LEDGER',
     currentNativeTick:n.tick,actualHpLossEvents:[],
     realOpponentHpLossCertified:false,
     sameActorSplatCertified:false,sameActor150TickRespawnCertified:false,
     officialWinner:'NONE',scoreable:0};
   }
   events.push({...e});
  }
 }
 const valid=!!countersValid&&source?.enabled===true&&
  source.physicalHumanCpuHpHits<=n.humanCpuDirectHits&&
  Array.isArray(source.events)&&
  events.length===source.events.length&&
  events.every((e,i)=>i===0||
   (e.sequence===events[i-1].sequence+1&&
    e.nativeFrame>=events[i-1].nativeFrame));
 const hpLoss=valid&&events.length>0;
 return {
  schema:'T21_V28_QA18_REAL_NATIVE_HP_WITNESS_V1',
  source:'25/17/26/0',
  verdict:!valid?'HOLD_NATIVE_HP_LEDGER_NOT_AUTHENTIC':
   hpLoss?'PASS_LIMITED_REAL_HUMAN_TO_CPU_HP_LOSS':
   'HOLD_NO_NATIVE_HUMAN_TO_CPU_HP_LOSS_OBSERVED',
  currentNativeTick:isCount(n?.tick)?n.tick:null,
  actualHpLossEvents:valid?events:[],
  actualHumanCpuHitCount:valid?n.humanCpuDirectHits:null,
  nativeCpuSplatCounter:valid?n.cpuSplats:null,
  nativeCpuRespawnCounter:valid?n.cpuRespawns:null,
  realOpponentHpLossCertified:!!hpLoss,
  lethalHpZeroEventObserved:hpLoss&&events.some(e=>e.lethalHpZero),
  sameActorSplatCertified:false,
  sameActor150TickRespawnCertified:false,
  nativeRejoinAfterRespawnCertified:false,
  naturalCrossTeamEngagementCertified:false,
  officialWinner:'NONE',scoreable:0,
  actorClockScoreGeometryWrites:0
 };
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const file=process.argv[2];
 if(!file){console.error('USAGE: node scripts/t21-v28-qa-real-hp-witness.mjs <genuine-native-snapshot.json>');process.exitCode=2;}
 else{
  try{console.log(JSON.stringify(classifyRealNativeHpSnapshot(
   JSON.parse(readFileSync(resolve(file),'utf8'))),null,2));}
  catch(e){console.error(String(e));process.exitCode=2;}
 }
}
