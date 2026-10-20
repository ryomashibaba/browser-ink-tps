#!/usr/bin/env node
/** B68: Source-only real 180s normal-preview qualification, NEVER deployment.
 * No synthetic ticks or fake ink can satisfy this gate. Both true Chrome
 * sessions must complete with actual native witnesses from the same SHA.
 */
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const assert=(b,reason)=>{if(!b)throw Error('B68_'+reason);};
function audit(x,mode){
 assert(x?.schema==='T21_W10B68_TRUE_180S_NORMAL_PREVIEW_CPU_AIM_V1'&&
   x.mode===mode,'EVIDENCE_MODE_SCHEMA');
 for(const key of ['normalPreviewHasNoQaDrive','actualChromiumPlayCanvasRapierRecast',
  'actualBrowserMouseKeyboard','native180SecondTimeUp',
  'actualRestartButtonAndFreshStaging','sourceGoalMovementFIXED',
  'experimentalCpuAimNotPromotedToDefault'])
  assert(x[key]===true,'MISSING_TRUE_NATIVE_WITNESS_'+key);
 assert(x.sourceOriginalAuthority==='25/17/26/0'&&
  x.originalActorBindingProven===false&&
  x.actualOriginalCrossTeamPathsCertified===0&&
  x.officialWinner==='NONE'&&x.original4v4Certified===false,
  'ORIGINAL_SOURCE_AUTHORITY');
 const e=x.b68VisualEvidence;
 assert(e?.ready==='REAL_180S_READY'&&e.chartVisible===true&&
  e.chartStatus==='REAL_NATIVE_SOURCE_30S_WINDOWS'&&
  e.saveButtonPresent===true&&e.chartRows>=5&&
  e.nativeCpuPhysicalRejoins===7&&e.physicalCpuSuspectedStalls===0&&
  e.nativeB64SourceInkAim===(mode==='SWEEP')&&
  (mode==='FIXED'?e.cpuLateralSourceAims===0:e.cpuLateralSourceAims>10),
  'REAL_END_PANEL_OR_CPU_AIM');
 assert(Number.isSafeInteger(e.sourceCpuShots)&&e.sourceCpuShots>0&&
  Number.isSafeInteger(e.changedOriginalSourceCells)&&
  e.changedOriginalSourceCells>0&&Number.isFinite(e.cpuPatrolMeters)&&
  e.cpuPatrolMeters>=1000&&x.actualFinalNativeSimulationTick>=10800,
  'REAL_NATIVE_PHYSICS_OR_INK_METRICS');
 assert(Array.isArray(x.originalNativeWitnesses)&&
  x.originalNativeWitnesses.length>=9,'MISSING_20S_NATIVE_POINTS');
 const expected=[0,20,40,60,80,100,120,140,160];
 let prior=null;
 for(const target of expected){
  const w=x.originalNativeWitnesses.find(y=>
   Math.abs(y.elapsedMatchSeconds-target)<=1.0);
  assert(w,'NO_ACTUAL_NATIVE_SAMPLE_'+target);
  const z=w.realSevenCpuShots;
  assert(z?.length===7&&z.every(v=>Number.isSafeInteger(v)&&v>=0)&&
   z.reduce((a,b)=>a+b,0)===w.originalCpuShots,
   'SEVEN_ACTUAL_CPU_SHOT_TOTALS');
  assert(w.nativeRejoinedCpu===7&&w.actualSuspectedCpuStalls===0&&
   Number.isFinite(w.realCpuSourcePatrolMeters)&&
   Number.isSafeInteger(w.originalCpuInkChanges)&&
   Number.isSafeInteger(w.originalCpuShots)&&
   w.outputMode===mode&&
   (mode==='FIXED'?w.nativeAcceptedLateralOriginalPaintAims===0:
    w.nativeAcceptedLateralOriginalPaintAims>=0),
   'SOURCE_FIXED_REAL_FOOT_AND_INK_WITNESS');
  if(prior)assert(w.originalCpuShots>=prior.originalCpuShots&&
    w.originalCpuInkChanges>=prior.originalCpuInkChanges&&
    w.realCpuSourcePatrolMeters>=prior.realCpuSourcePatrolMeters&&
    w.tick>prior.tick,'SOURCE_NATIVE_COUNTER_ROLLBACK');
  prior=w;
 }
 assert(e.changedOriginalSourceCells>=prior.originalCpuInkChanges&&
  e.sourceCpuShots>=prior.originalCpuShots,
  'FINAL_INK_LESS_THAN_SOURCE_HISTORY');
 return {end:e,last:prior,byTime:t=>x.originalNativeWitnesses.find(
  y=>Math.abs(y.elapsedMatchSeconds-t)<=1)!};
}
export function qualifyB68NormalPreview(fixed,sweep){
 const a=audit(fixed,'FIXED'),b=audit(sweep,'SWEEP');
 const totalInkDelta=b.end.changedOriginalSourceCells-
  a.end.changedOriginalSourceCells;
 const lateA=a.byTime(120).originalCpuInkChanges-
  a.byTime(60).originalCpuInkChanges;
 const lateB=b.byTime(120).originalCpuInkChanges-
  b.byTime(60).originalCpuInkChanges;
 const relativePatrol=b.end.cpuPatrolMeters/
  a.end.cpuPatrolMeters-1;
 const baseShots=a.end.sourceCpuShots,extraShots=b.end.sourceCpuShots-baseShots;
 const cpuActivity=b.last.realSevenCpuShots.filter(n=>n>0).length;
 const eligible=b.end.changedOriginalSourceCells>=
  a.end.changedOriginalSourceCells*1.5&&totalInkDelta>=1500&&
  lateB-lateA>=100&&Math.abs(relativePatrol)<=.05&&
  extraShots>0&&cpuActivity>=2;
 return {
  schema:'T21_W10B68_180S_NORMAL_PREVIEW_CPU_INK_REVIEW_V1',
  originalStage:'25_SOLIDS_17_PAINT_26_NAV_0_SCOREABLE',
  nativeFullSessionSecondsEach:180,
  sourcePhysicsAndHumanInputPreserved:true,
  originalCrossTeamRoutesCertified:0,
  fixed:{cpuSourceShots:baseShots,changedSourceCells:a.end.changedOriginalSourceCells,
   nativePatrolMeters:a.end.cpuPatrolMeters,
   hostSoftwareRenderCallbackP95Ms:a.end.nativeFrameCallbackP95,
   actualCpuSourceInkAdded60To120:lateA},
  sweep:{cpuSourceShots:b.end.sourceCpuShots,
   changedSourceCells:b.end.changedOriginalSourceCells,
   nativePatrolMeters:b.end.cpuPatrolMeters,
   hostSoftwareRenderCallbackP95Ms:b.end.nativeFrameCallbackP95,
   actualCpuSourceInkAdded60To120:lateB,
   sevenRealLabCpuSourceShooters:cpuActivity},
  comparison:{absoluteChangedSourceCellsDelta:totalInkDelta,
   actualChangedSourceCellsRatio:Number(
    (b.end.changedOriginalSourceCells/
     a.end.changedOriginalSourceCells).toFixed(3)),
   incrementalSourceCells60To120Gain:lateB-lateA,
   relativePatrolMetersDifference:Number(relativePatrol.toFixed(5))},
  secondaryNonproductionPreviewQualityGate:eligible,
  decision:eligible?'QUALIFIED_FOR_OWNER_SIDE_SOURCE_PREVIEW_QUALITY_REVIEW':
   'KEEP_FIXED_SOURCE_PREVIEW_CPU',
  noWinOrScoreIsCertified:true,
  defaultCpuSwitched:false,
  original4v4Certified:false,
  productionAuthorized:false
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{
  const dir=process.argv[2];assert(dir,'ARTIFACT_DIR_REQUIRED');
  const load=m=>JSON.parse(readFileSync(
   join(dir,'w10b68-normal-preview-'+m+'.json'),'utf8'));
  const result=qualifyB68NormalPreview(load('FIXED'),load('SWEEP'));
  console.log('T21_W10B68_TRUE_NORMAL_PREVIEW_COMPARISON',
   JSON.stringify(result));
 }catch(e){console.error('T21_W10B68_FAIL_CLOSED',String(e));process.exitCode=1;}
}
