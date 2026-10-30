#!/usr/bin/env node
/** B341 exact opt-in native comparison, verified B340 fixed-source reference.
 * Observations and deltas only, never a game/4v4/art certification. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b340AuditRealSourceCpuRound} from './t21-b340-real-180s-cpu-audit.mjs';
const need=(v,key)=>{if(!v)throw Error('B341_INDEPENDENT_'+key);};
const keys=['cpuSourceShotRequests','cpuActualImpactChangedCells','cpuChangedCells'];
function validReference(b){
 need(b?.schema==='B341_VERIFIED_B340_FIXED_SOURCE_REFERENCE'&&
  b.originalArtifactId===12949234359&&
  b.originalRealRoundSha256==='13f68447daca35330959a5eabefc621a3a7a4b19c8766d0a2c48e7dc514e4ab8'&&
  b.originalIndependentVerdictSha256==='3724ef21e8128c593aa7db3d4a3a793b9a4fa57269fc1b5e48c73eba3fb7c37b'&&
  b.originalSource==='25/17/26/0'&&b.realNativeTicks===10804&&
  b.b64Enabled===false&&b.b178Enabled===false&&b.b180Enabled===false&&
  b.originalScoreable===0&&b.productionAuthorized===false&&
  b.officialWinner==='NONE'&&b.gameplayCertified===false&&
  b.artAccepted===false,'B340_TRUSTED_FIXED_SOURCE_BASELINE');
 need(keys.every(k=>Array.isArray(b[k])&&b[k].length===6&&
  b[k].every(v=>Number.isSafeInteger(v)&&v>=0))&&
  b.cpuSourceShotRequests.join(',')==='86,6,8,1,1,6'&&
  b.cpuActualImpactChangedCells.join(',')==='3147,35,19,0,0,11'&&
  b.cpuChangedCells.join(',')==='10692,427,493,14,83,64',
  'B340_HISTORIC_WINDOWS_INTEGRITY');
}
export function b341CompareGenuineSourceExperiment(w,baseline){
 validReference(baseline);
 need(w?.schema==='B335_REAL_CHROMIUM_SOURCE_ROUND'&&
  w.b341TelemetryVersion===1&&w.sourceOriginalUnchanged===true&&
  w.samples?.length===7,'SOURCE_AB_REAL_180S_REQUIRED');
 for(let i=0;i<w.samples.length;i++){
  const q=w.samples[i].b341CpuSource;
  need(q?.originalBoundary==='25/17/26/0'&&
   q.realSourceAimCandidates?.enabled===true&&
   q.realSourceResourceRecovery?.enabled===true&&
   q.realOriginalPaintOpportunity?.enabled===true&&
   q.sourceNativeBattlePacing?.enabled===false&&
   q.sourceRealBackfill?.enabled===false&&
   q.realSourceAimCandidates.newNavLinks===0&&
   q.realSourceAimCandidates.newPhysicalSolids===0&&
   q.realSourceAimCandidates.newScoreable===0&&
   q.realOriginalPaintOpportunity.cpuNavUnchanged===true&&
   q.realOriginalPaintOpportunity.productionAuthorized===false,
   'SOURCE_RESEARCH_FLAGS_NOT_EXACT_'+i);
 }
 const validated=b340AuditRealSourceCpuRound({
  ...w,b340TelemetryVersion:1,
  samples:w.samples.map(s=>({...s,b340CpuSource:s.b341CpuSource}))
 });
 need(validated.verdict==='PASS_GENUINE_CPU_SOURCE_TELEMETRY_OBSERVATION'&&
  validated.windows.length===6&&
  validated.originalCrossTeamRoutesCertified==='0/12'&&
  validated.originalScoreable===0&&!validated.productionAuthorized,
  'B340_SOURCE_AUTHORITY_GATE');
 const rows=validated.windows.map((x,i)=>({
  gameSecondsFrom:x.gameSecondsFrom,gameSecondsTo:x.gameSecondsTo,
  fixedBaselineCpuSourceShotRequests:baseline.cpuSourceShotRequests[i],
  actualExperimentalCpuSourceShotRequests:x.acceptedCpuShotRequests,
  shotRequestDelta:x.acceptedCpuShotRequests-baseline.cpuSourceShotRequests[i],
  fixedBaselineImpactChangedCells:baseline.cpuActualImpactChangedCells[i],
  actualExperimentalImpactChangedCells:x.actualCpuImpactChangedCells,
  impactPaintCellDelta:x.actualCpuImpactChangedCells-baseline.cpuActualImpactChangedCells[i],
  fixedBaselineCpuChangedCells:baseline.cpuChangedCells[i],
  actualExperimentalCpuChangedCells:x.actualCpuChangedCells,
  paintChangeCellDelta:x.actualCpuChangedCells-baseline.cpuChangedCells[i],
  sourceActiveShooterCount:x.sourceCpuWithShotRequests,
  sourceActorsWithChangedCells:x.sourceCpuWithChangedCells
 }));
 const sum=(arr,field)=>arr.reduce((v,x)=>v+x[field],0);
 const before=sum(rows,'fixedBaselineCpuSourceShotRequests');
 const after=sum(rows,'actualExperimentalCpuSourceShotRequests');
 const lateBefore=rows.slice(1).reduce((v,x)=>v+x.fixedBaselineCpuSourceShotRequests,0);
 const lateAfter=rows.slice(1).reduce((v,x)=>v+x.actualExperimentalCpuSourceShotRequests,0);
 return {schema:'B341_180S_SOURCE_PATCH_NATIVE_AB',
  verdict:'PASS_GENUINE_SOURCE_ONLY_EXPERIMENT_OBSERVATION',
  baseline:{run:40988204871,artifact:12949234359,
   nativeTicks:baseline.realNativeTicks,source:'25/17/26/0'},
  experiment:{source:'25/17/26/0',
   b64NativeSourceSweep:true,b178SourceOwnerInkRecovery:true,
   b180RealUnpaintedPatchSelection:true,b215WeaponReady:false,
   b216SourceBackfill:false},
  fixedVersusExperimentWindows:rows,
  fullSourceShotRequests:{baseline:before,experiment:after,delta:after-before},
  afterFirst30sSourceShotRequests:{baseline:lateBefore,experiment:lateAfter,
   delta:lateAfter-lateBefore},
  fullCpuActualChangedCells:{baseline:sum(rows,'fixedBaselineCpuChangedCells'),
   experiment:sum(rows,'actualExperimentalCpuChangedCells')},
  notRandomizedNorPerformanceMatched:true,
  strictImprovementNotYetArtOrGameplayPass:true,
  nativeMovementAndSourceCollisionUntouched:true,
  excludesHumanRepositionAndSyntheticTicks:true,
  originalCrossTeamRoutesCertified:'0/12',officialWinner:'NONE',
  scoreable:0,artAccepted:false,gameplayCertified:false,
  unrestricted4v4Certified:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 need(typeof dir==='string'&&dir.length>0,'DIR');
 const w=JSON.parse(readFileSync(join(dir,'b341-real-round.json'),'utf8'));
 const reference=JSON.parse(readFileSync(new URL(
  '../docs/qa/evidence/T21_B341_B340_FIXED_SOURCE_BASELINE.json',
  import.meta.url),'utf8'));
 const result=b341CompareGenuineSourceExperiment(w,reference);
 for(const p of ['B341_START.png','B341_MID.png','B341_TIME_UP.png'])
  need(statSync(join(dir,p)).size>20000,'REAL_SCREENSHOT_'+p);
 writeFileSync(join(dir,'b341-independent-ab-comparison.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B341_ACTUAL_180S_SOURCE_AB_VERDICT',JSON.stringify(result));
}
