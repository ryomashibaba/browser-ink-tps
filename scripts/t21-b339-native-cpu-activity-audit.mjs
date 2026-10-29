#!/usr/bin/env node
/** B339 strict causal-boundary audit: original B335 late paint + real B337
 * per-actor native early activity. It does NOT claim a cause or improvement. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
import {b336ReadAndAudit} from './t21-b336-real-gameplay-frontier.mjs';
const requireEvidence=(ok,code)=>{if(!ok)throw Error('B339_SOURCE_CPU_'+code);};
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const safe=n=>Number.isSafeInteger(n)&&n>=0;
function validateCpuFrame(s){
 const x=s?.b339CpuSnapshot;
 requireEvidence(x?.source==='25/17/26/0'&&safe(x.acceptedCpuSourceShots)&&
  safe(x.actualCpuImpactChangedCells),'NATIVE_CPU_SOURCE_COUNTER');
 const per=x.cpuShotsByActor,ink=x.sourceInk;
 requireEvidence(per&&ink?.source==='REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'&&
  ink.excludesUnexecutedCpuShotRequests===true&&
  Object.keys(per).length===7&&Object.keys(ink.byActor??{}).length===7,
  'GENUINE_SEVEN_CPU_PROVENANCE');
 requireEvidence(ids.every(id=>safe(per[id])&&
  ['changedCells','impactChangedCells','footChangedCells','stampEvents',
   'impactEvents'].every(k=>safe(ink.byActor[id]?.[k]))&&
  ink.byActor[id].impactChangedCells<=ink.byActor[id].changedCells&&
  ink.byActor[id].footChangedCells<=ink.byActor[id].changedCells),
  'ORIGINAL_PAINT_ACTOR_COUNTERS');
 const all=Object.values(per).reduce((a,b)=>a+b,0);
 requireEvidence(all<=x.acceptedCpuSourceShots,
  'INDIVIDUAL_CPU_SOURCE_SHOTS_EXCEED_TOTAL');
 return x;
}
export function b339AuditHistoricFrontier(legacy){
 requireEvidence(legacy?.schema==='T21_B336_GENUINE_180S_GAMEPLAY_FRONTIER_AUDIT'&&
  legacy.technical180sVerdict==='PASS_GENUINE_CHROMIUM_180S_TIME_UP'&&
  legacy.source==='25/17/26/0'&&legacy.authority.gameplayCertified===false&&
  legacy.authority.artCertified===false&&
  legacy.authority.crossTeamRoutesCertified==='0/12',
  'ORIGINAL_B335_TRUST_REQUIRED');
 const arr=legacy.activityWindows;
 requireEvidence(Array.isArray(arr)&&arr.length===6&&
  arr.every((x,i)=>x.remainingFromSeconds===180-i*30&&
   x.remainingToSeconds===150-i*30&&safe(x.cpuChangedCellsDelta)&&
   safe(x.humanChangedCellsDelta)),'GENUINE_30S_WINDOWS');
 const total=arr.reduce((n,x)=>n+x.cpuChangedCellsDelta,0);
 requireEvidence(total===11773&&arr[0].cpuChangedCellsDelta===10692,
  'HISTORIC_180S_CPU_PAINT_EVIDENCE_IDENTITY');
 return {
  schema:'B339_ORIGINAL_180S_CPU_ACTIVITY_LATE_FRONTIER',
  provenance:'B335_ACTUAL_180S_SAVED_SHA256_AUDITED_BY_B336',
  real30SecondCpuChangedCellWindows:arr.map(x=>x.cpuChangedCellsDelta),
  totalCpuChangedCells:total,
  first30SecondsSharePercent:Number((100*arr[0].cpuChangedCellsDelta/total).toFixed(2)),
  last30SecondsToFirst30SecondsRatio:Number((arr[5].cpuChangedCellsDelta/arr[0].cpuChangedCellsDelta).toFixed(4)),
  causeIdentified:false,
  cumulativePaintNotUniqueScoreableArea:true,
  savedCheckpointsLackCpuShotTimeSeries:true,
  cpuBlanketWeaponBuffAuthorized:false,
  explanation:'Observed native paint decline alone cannot distinguish exhausted cells, no shots, resource limits, line of sight or actual trajectory.',
  status:'LATE_PAINT_DECAY_CONFIRMED_CAUSE_HOLD',
  source:'25/17/26/0',originalRoutes:'0/12',
  gameplayCertified:false,artAccepted:false,productionAuthorized:false};
}
export function b339AuditNativeEarlyCpu(native){
 const pass=b337AuditNative(native);
 requireEvidence(pass.verdict==='PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT',
  'SHORT_REAL_CHROMIUM_FIRST');
 const start=validateCpuFrame(native.samples[0]),end=validateCpuFrame(native.samples.at(-1));
 const a=native.samples[0],b=native.samples.at(-1);
 requireEvidence(b.tick>a.tick,'NATIVE_CPU_WINDOW_NOT_MOVING');
 for(const s of native.samples)validateCpuFrame(s);
 const byActor=ids.map(id=>{
  let oldShots=-1,oldCells=-1;
  for(const s of native.samples){
   const p=s.b339CpuSnapshot;
   const shots=p.cpuShotsByActor[id],cells=p.sourceInk.byActor[id].changedCells;
   requireEvidence(shots>=oldShots&&cells>=oldCells,
    'NONMONOTONIC_'+id);
   oldShots=shots;oldCells=cells;
  }
  return {id,
   sourceShotRequestsDelta:end.cpuShotsByActor[id]-start.cpuShotsByActor[id],
   originalChangedCellsDelta:end.sourceInk.byActor[id].changedCells-
    start.sourceInk.byActor[id].changedCells};
 });
 const totalShotDelta=end.acceptedCpuSourceShots-start.acceptedCpuSourceShots;
 const cpuImpactChangedDelta=end.actualCpuImpactChangedCells-
  start.actualCpuImpactChangedCells;
 requireEvidence(totalShotDelta>=0&&cpuImpactChangedDelta>=0&&
  byActor.reduce((z,x)=>z+x.sourceShotRequestsDelta,0)<=totalShotDelta,
  'INVALID_CPU_SOURCE_TOTAL_DELTA');
 return {
  schema:'B339_GENUINE_CHROMIUM_EARLY_CPU_SOURCE_ACTIVITY',
  origin:'SAME_GENUINE_B337_CHROMIUM_POINTER_LOCKED_SOURCE_WORLD',
  actualNativeTicks:b.tick-a.tick,
  acceptedSourceCpuWeaponRequestsDelta:totalShotDelta,
  originalImpactChangedCellsDelta:cpuImpactChangedDelta,
  perCpuNativeActor:byActor,
  cpuWithSourceShots:byActor.filter(x=>x.sourceShotRequestsDelta>0).length,
  cpuWithChangedSourceCells:byActor.filter(x=>x.originalChangedCellsDelta>0).length,
  earlyNativeEvidenceOnly:true,late180sCpuShotEvidenceAvailable:false,
  originalRoutes:'0/12',scoreable:0,officialWinner:'NONE',
  gameplayCertified:false,artAccepted:false,productionAuthorized:false,
  status:'EARLY_NATIVE_CPU_ACTIVITY_MEASURED_LATE_CAUSE_HOLD'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [evidence,manifestPath,output,nativePath]=process.argv.slice(2);
 requireEvidence(evidence&&manifestPath&&output,'CLI_ARGUMENTS');
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
 requireEvidence(manifest.sourceRunId===40878994476&&
  manifest.sourceArtifactId===12901783202,'B335_ORIGINAL_MANIFEST');
 const legacy=b336ReadAndAudit(evidence,manifest.realRoundJsonSha256);
 const historic=b339AuditHistoricFrontier(legacy);
 const native=nativePath?b339AuditNativeEarlyCpu(
  JSON.parse(readFileSync(nativePath,'utf8'))):null;
 const full={historic,native,
  noCpuBehaviorChange:true,noTurfScoreOrWinner:true,
  missingLateShotEvidence:true,overallStatus:'B339_CAUSALITY_HOLD'};
 writeFileSync(output,JSON.stringify(full,null,2)+'\n');
 console.log('B339_REAL_CPU_ACTIVITY_FRONTIER',JSON.stringify(full));
}
