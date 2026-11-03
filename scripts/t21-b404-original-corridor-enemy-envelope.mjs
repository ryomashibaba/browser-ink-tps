#!/usr/bin/env node
/** B404: compare two INDEPENDENT genuine-source browser sessions
 * (B322 actual Rapier human route and B340 native CPU source telemetry).
 * These are NOT simultaneous native frames, line of sight, pathfinding,
 * combat, hit, HP, score or 4v4 certification. Read-only evidence. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const B404_B322_PROOFS=[
 [
  "b316-genuine-original-human-ramp-walk.json",
  "0d2135de164ca96a13130e20c83f58a65cf3236bf7b8eb2bcdfe362138680c3a",
  4
 ],
 [
  "b320-genuine-original-ramp-uphill.json",
  "15ac8e68e12500452ac18e1e58b307f7cd855d9e65f329b1f34314cab4a0b68a",
  3
 ],
 [
  "b321-true-original-upper-ramp.json",
  "4c5c8a08749d5ffdb80ca3177bf8c5a3152be7b5cb15f42b4b79057ba46c9ce6",
  5
 ],
 [
  "b322-actual-original-ramp-crest.json",
  "ed6c1021615e57c1bb72ddf59f30b65470acd7f5bb3299c2a17d3dc355b13fa5",
  4
 ],
 [
  "b324-real-original-upper-floor.json",
  "31021e6fb0ba0e063ef0eb3113e39e190d042eb556896b9c4b54d3774ed5f807",
  4
 ],
 [
  "b326-extended-original-upper-floor.json",
  "e7889cd2582f3aa63b4760683c9ac0892a1860ff3411efbaf4e9b808bedf9e76",
  6
 ]
];
const PINNED_B340_SHA='13f68447daca35330959a5eabefc621a3a7a4b19c8766d0a2c48e7dc514e4ab8';
const fail=(v,s)=>{if(!v)throw Error('B404_SOURCE_EVIDENCE_HOLD_'+s);};
const xyz=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const r3=x=>Number(x.toFixed(3));
const allowed=new Set([
 'UndertowT21D:first-drop-landing-positive-z',
 'UndertowT21D:right-low-route-ramp-positive-z',
 'UndertowT21D:right-low-team-a'
]);
const names=['A1','A2','A3','B1','B2','B3','B4'];
export function auditB404IndependentSourceEnvelope(b322,b340){
 fail(Array.isArray(b322)&&b322.length===6&&
  b340?.schema==='B335_REAL_CHROMIUM_SOURCE_ROUND'&&
  b340.source==='25/17/26/0'&&
  b340.actualCdpUserClick===true&&
  b340.b340TelemetryVersion===1&&
  b340.sourceOriginalUnchanged===true&&
  b340.injectedTicks===false&&
  b340.injectedInk===false&&
  b340.injectedActorPositions===false&&
  b340.officialWinner==='NONE'&&
  Array.isArray(b340.samples)&&b340.samples.length===7,
  'TWO_INDEPENDENT_GENUINE_RUNS');
 const cpu=[];
 for(let i=0;i<7;i++){
  const s=b340.samples[i];
  fail(s.thresholdSeconds===[180,150,120,90,60,30,0][i]&&
   Number.isSafeInteger(s.tick)&&s.originalSolids===25&&
   s.originalPaint===17&&s.originalNavLinks===26&&
   s.scoreable===0&&s.productionAuthorized===false&&
   s.unrestricted4v4Certified===false&&
   s.cpuActors===7&&s.actualCpuRejoined===7&&
   s.cpuRelocations===0&&s.officialWinner==='NONE'&&
   s.matchState===(i===6?'TIME_UP':'PLAYING')&&
   Array.isArray(s.actualCpuFootPositions)&&
   s.actualCpuFootPositions.length===7&&
   new Set(s.actualCpuFootPositions.map(c=>c.id)).size===7&&
   names.every(id=>s.actualCpuFootPositions.some(c=>c.id===id))&&
   s.actualCpuFootPositions.every(c=>xyz(c.foot)),
   'B340_NATIVE_OPPONENT_FRAME_'+i);
  for(const c of s.actualCpuFootPositions.filter(c=>c.id.startsWith('B')))
   cpu.push({id:c.id,foot:c.foot,frame:i,tick:s.tick});
 }
 fail(cpu.length===28,'SEVEN_TIMES_FOUR_SOURCE_ENEMIES');
 const path=[],phases=[];
 let lastTick=-1;
 for(let i=0;i<6;i++){
  const d=b322[i],manifest=B404_B322_PROOFS[i];
  fail(d?.source==='25/17/26/0'&&
   d.productionAuthorized===false&&
   d.original4v4Certified===false&&
   Array.isArray(d.steps)&&d.steps.length===manifest[2]&&
   typeof d.schema==='string'&&d.schema.startsWith('B3')&&
   d.first?.source==='25/17/26/0','HUMAN_ORIGINAL_PHASE_'+i);
  const frames=[d.first,...d.steps.map(s=>s.after)];
  for(let j=0;j<frames.length;j++){
   const f=frames[j];
   fail(f?.source==='25/17/26/0'&&
    Number.isSafeInteger(f.tick)&&f.tick>=lastTick&&
    xyz(f.actualBodyMeters)&&f.realHumanOriginalFootSupported===true&&
    allowed.has(f.genuineHumanOriginalFootSolid)&&
    Number.isFinite(f.genuineOriginalFootGapMeters)&&
    f.genuineOriginalFootGapMeters<=.4&&
    f.sourceActorRelocations===0&&
    f.sourceInkRewritten===false&&
    f.playerPositionRewritten===false&&
    f.scoreable===0&&
    f.original4v4Certified===false&&
    f.productionAuthorized===false&&
    Array.isArray(f.originalRows)&&f.originalRows.length===17,
    'REAL_HUMAN_RAPIER_FOOT_'+i+'_'+j);
   path.push({phase:manifest[0],point:j,tick:f.tick,
    xyz:f.actualBodyMeters,foot:f.genuineHumanOriginalFootSolid});
   lastTick=f.tick;
   if(j>0){
    const st=d.steps[j-1];
    fail(st.realKey==='KeyW'&&
     Number.isSafeInteger(st.nativeInputTicks)&&
     st.nativeInputTicks>=1&&st.nativeInputTicks<=4&&
     Number.isSafeInteger(st.actualNativeTickDelta)&&
     st.actualNativeTickDelta>=st.nativeInputTicks,
     'REAL_SHORT_CDP_STEP_'+i+'_'+j);
   }
  }
  phases.push({name:manifest[0],realNativePoints:frames.length,
   startTick:frames[0].tick,endTick:frames.at(-1).tick,
   originalEndSupport:frames.at(-1).genuineHumanOriginalFootSolid});
 }
 fail(path.length===32,'32_NATIVE_FOOT_WITNESSES');
 const comparisons=path.flatMap(p=>cpu.map(c=>({
  d:Math.hypot(p.xyz[0]-c.foot[0],p.xyz[2]-c.foot[2]),
  humanPhase:p.phase,humanTick:p.tick,humanPoint:p.point,
  humanBody:p.xyz,humanSupport:p.foot,
  enemyId:c.id,enemyTick:c.tick,enemyFoot:c.foot
 })));
 comparisons.sort((a,b)=>a.d-b.d);
 const closest=comparisons[0];
 fail(comparisons.length===896&&Number.isFinite(closest.d),
  'CROSS_SESSION_MATH');
 return {
  schema:'B404_DISTINCT_SESSION_ORIGINAL_HUMAN_CORRIDOR_ENEMY_ENVELOPE',
  humanSourceRunId:41571706674,cpuSourceRunId:40988204871,
  realSource:'25/17/26/0',
  humanOriginalObservedFootRecords:path.length,
  enemyOriginalObservedFootRecords:cpu.length,
  crossSessionCombinations:comparisons.length,
  phaseSummary:phases,
  mostOptimisticSampledCrossSessionHorizontalMeters:r3(closest.d),
  closestSampledCombination:{
   humanPhase:closest.humanPhase,humanNativeTick:closest.humanTick,
   humanFoot:closest.humanBody,humanOriginalSupport:closest.humanSupport,
   enemyId:closest.enemyId,enemyNativeTick:closest.enemyTick,
   enemyFoot:closest.enemyFoot
  },
  allCrossSessionSamplePairsOutsideB18132m:
   comparisons.every(p=>p.d>32),
  sameNativeSessionOrTick:false,
  realConcurrentOpponentProximityCertified:false,
  continuousHumanEnemyRangeCertified:false,
  originalStageRayLineClearCertified:false,
  nativeHumanEnemyHitOrHpLossCertified:false,
  opponentNaturalRouteCertified:false,
  officialWinner:'NONE',scoreable:0,
  full4v4Certified:false,productionAuthorized:false,gameplayWrites:0
 };
}
const hex=buf=>createHash('sha256').update(buf).digest('hex');
export function b404AuditPinnedOriginalRunBuffers(humanBuffers,cpuBuffer){
 fail(humanBuffers?.length===6&&
  hex(cpuBuffer)===PINNED_B340_SHA,'PINNED_CPU_ORIGINAL_SHA256');
 const human=humanBuffers.map((b,i)=>{
  fail(hex(b)===B404_B322_PROOFS[i][1],
   'PINNED_HUMAN_KCC_SHA256_'+i);
  return JSON.parse(b.toString('utf8'));
 });
 return {...auditB404IndependentSourceEnvelope(human,
  JSON.parse(cpuBuffer.toString('utf8'))),
  sourceB340RawSha256:PINNED_B340_SHA,
  sourceB322RawSha256:B404_B322_PROOFS.map(([name,sha])=>({name,sha}))
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [humanDir,cpuFile,output]=process.argv.slice(2);
 fail(!!humanDir&&!!cpuFile&&!!output,'ARTIFACT_PATHS');
 const bytes=B404_B322_PROOFS.map(([f])=>readFileSync(humanDir+'/'+f));
 const x=b404AuditPinnedOriginalRunBuffers(bytes,readFileSync(cpuFile));
 writeFileSync(output,JSON.stringify(x,null,2)+'\n');
 console.log('B404_VERIFIED_REAL_SOURCE_CROSS_SESSION_ENVELOPE',
  JSON.stringify({minCrossSessionMeters:x.mostOptimisticSampledCrossSessionHorizontalMeters,
   actualSameTickEncounter:false,
   allSourcePairsOutside32m:x.allCrossSessionSamplePairsOutsideB18132m,
   routesCertified:false}));
}
