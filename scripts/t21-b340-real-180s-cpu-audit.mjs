#!/usr/bin/env node
/** B340: independent 180s real source CPU time series; no causal attribution.
 * B335 original real-time clock, physical and authority gates remain mandatory. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b335VerifyNativeRound} from './t21-b335-real-180s-guard.mjs';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const need=(c,n)=>{if(!c)throw Error('B340_INDEPENDENT_'+n);};
const safe=x=>Number.isSafeInteger(x)&&x>=0;
const keys=x=>x&&typeof x==='object'&&
 Object.keys(x).sort().join(',')===ids.slice().sort().join(',');
const xyz=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const metricKeys=['stampEvents','changedCells','impactEvents','impactChangedCells','footChangedCells'];
function validate(s,i){
 const c=s.b340CpuSource;
 need(c?.originalBoundary==='25/17/26/0'&&
  safe(c.acceptedShotRequests)&&safe(c.actualImpactChangedCells)&&
  c.actualTotalCpuChangedCells===s.cpuInk&&
  keys(c.shotRequestsByActor)&&
  c.acceptedSourcePaint?.source==='REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'&&
  c.acceptedSourcePaint.sourceOnly===true&&
  c.acceptedSourcePaint.originalScoreablePromotions===0&&
  c.acceptedSourcePaint.excludesUnexecutedCpuShotRequests===true&&
  c.acceptedSourcePaint.productionAuthorized===false&&
  keys(c.acceptedSourcePaint.byActor),'ORIGINAL_SOURCE_ACTOR_'+i);
 need(ids.every(id=>{
  const r=c.acceptedSourcePaint.byActor[id];
  return safe(c.shotRequestsByActor[id])&&
   metricKeys.every(k=>safe(r?.[k]))&&
   r.impactChangedCells<=r.changedCells&&
   r.footChangedCells<=r.changedCells&&r.impactEvents<=r.stampEvents;
 }),'GENUINE_OWNER_GRID_'+i);
 const sum=ids.reduce((n,id)=>n+c.shotRequestsByActor[id],0);
 need(sum<=c.acceptedShotRequests,'CPU_SHOT_TOTAL_'+i);
 need(Array.isArray(s.actualCpuFootPositions)&&
  s.actualCpuFootPositions.length===7&&
  ids.every((id,j)=>s.actualCpuFootPositions[j].id===id&&
   xyz(s.actualCpuFootPositions[j].foot)),'ACTUAL_SEVEN_NATIVE_FEET_'+i);
 const recovery=c.realSourceResourceRecovery;
 const sweep=c.realSourceAimCandidates;
 const opportunity=c.realOriginalPaintOpportunity;
 const backfill=c.sourceRealBackfill;
 const pacing=c.sourceNativeBattlePacing;
 need(recovery?.productionAuthorized===false&&
  recovery.zeroSourceScoreable===true&&
  sweep?.originalSourceOnly===true&&
  sweep.newPhysicalSolids===0&&sweep.newNavLinks===0&&
  sweep.newScoreable===0&&
  opportunity?.sourceScoreable===0&&
  backfill?.newNavLinks===0&&backfill?.scoreableSourcePaint===0&&
  backfill?.actorFootWrites===0&&backfill?.fakeShots===0&&
  pacing?.playerAmmoOrCpuShotInjection===0,
  'NONPRODUCTION_REAL_SOURCE_AUTHORITY_'+i);
 return c;
}
export function b340AuditRealSourceCpuRound(w){
 const baseline=b335VerifyNativeRound(w);
 need(baseline.verdict==='PASS_GENUINE_CHROMIUM_180S_TIME_UP'&&
  w.b340TelemetryVersion===1&&w.sourceOriginalUnchanged===true,
  'ORIGINAL_180S_PASS_FIRST');
 const samples=w.samples;
 const totalS=samples.map((s,i)=>validate(s,i));
 const spans=[];
 for(let i=1;i<samples.length;i++){
  const prev=totalS[i-1],cur=totalS[i],p=samples[i-1],q=samples[i];
  need(cur.acceptedShotRequests>=prev.acceptedShotRequests&&
   cur.actualImpactChangedCells>=prev.actualImpactChangedCells&&
   q.cpuInk>=p.cpuInk,'ACTUAL_GLOBAL_NONMONOTONIC_'+i);
  const perActor=ids.map(id=>{
   const pShot=prev.shotRequestsByActor[id],cShot=cur.shotRequestsByActor[id];
   const old=prev.acceptedSourcePaint.byActor[id],
    next=cur.acceptedSourcePaint.byActor[id];
   need(cShot>=pShot&&metricKeys.every(k=>next[k]>=old[k]),
    'ACTOR_NONMONOTONIC_'+id+'_'+i);
   const oldFoot=p.actualCpuFootPositions.find(x=>x.id===id).foot,
    newFoot=q.actualCpuFootPositions.find(x=>x.id===id).foot;
   return {id,shotRequests:cShot-pShot,
    changedOriginalCells:next.changedCells-old.changedCells,
    impactChangedOriginalCells:next.impactChangedCells-old.impactChangedCells,
    footChangedOriginalCells:next.footChangedCells-old.footChangedCells,
    sampledFootDisplacementMeters:Number(Math.hypot(
     ...newFoot.map((v,j)=>v-oldFoot[j])).toFixed(4))};
  });
  const deltaShots=cur.acceptedShotRequests-prev.acceptedShotRequests;
  const impacts=cur.actualImpactChangedCells-prev.actualImpactChangedCells;
  const changes=q.cpuInk-p.cpuInk;
  need(perActor.reduce((n,x)=>n+x.shotRequests,0)<=deltaShots,
   'CPU_UNEXPLAINED_ACTOR_SHOT_TOTAL_'+i);
  spans.push({gameSecondsFrom:(i-1)*30,gameSecondsTo:i*30,
   nativeTickDelta:q.tick-p.tick,acceptedCpuShotRequests:deltaShots,
   actualCpuImpactChangedCells:impacts,actualCpuChangedCells:changes,
   perActor,sourceCpuWithShotRequests:perActor.filter(x=>x.shotRequests>0).length,
   sourceCpuWithChangedCells:perActor.filter(x=>x.changedOriginalCells>0).length,
   classification:deltaShots===0?'NO_ACCEPTED_CPU_SOURCE_SHOT_REQUESTS':
    impacts===0?'SHOTS_WITH_ZERO_CHANGED_CPU_IMPACT_CELLS':
    'SHOTS_AND_CHANGED_CPU_IMPACT_CELLS',
   causeCertified:false,continuousActorPathsCertified:false,
   uniqueTurfCells:false,officialScoreable:0});
 }
 const total=spans.reduce((n,x)=>n+x.actualCpuChangedCells,0);
 need(total===samples.at(-1).cpuInk-samples[0].cpuInk,
  'ACTUAL_CHANGED_CELL_RECONCILIATION');
 return {schema:'B340_GENUINE_NATIVE_180S_CPU_SOURCE_WINDOW_AUDIT',
  verdict:'PASS_GENUINE_CPU_SOURCE_TELEMETRY_OBSERVATION',
  base180s:baseline,originalSource:'25/17/26/0',
  nativeCPUCount:7,sourceWindowSeconds:30,windows:spans,
  paintedCellsTotal:total,scope:'MEASURED_SOURCE_180S_NOT_CAUSAL_PROOF',
  screenshotAuthority:'ACTUAL_CHROMIUM_FRAME',
  shotsMayNotCauseSameIntervalInk:true,
  perActorPaintIncludesFootAndRepainting:true,
  noRealFullPathCertification:true,
  newCpuPolicyOrWeaponBoost:false,originalScoreable:0,
  originalCrossTeamRoutesCertified:'0/12',officialWinner:'NONE',
  gameplayCertified:false,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false,
  rootCauseCertified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 need(typeof dir==='string'&&dir.length>0,'ARG_DIR');
 const w=JSON.parse(readFileSync(join(dir,'b340-real-round.json'),'utf8'));
 const result=b340AuditRealSourceCpuRound(w);
 for(const name of ['B340_START.png','B340_MID.png','B340_TIME_UP.png'])
  need(statSync(join(dir,name)).size>20000,'REAL_FRAME_'+name);
 writeFileSync(join(dir,'b340-independent-verdict.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B340_REAL_180S_CPU_SOURCE_VERDICT',JSON.stringify(result));
}
