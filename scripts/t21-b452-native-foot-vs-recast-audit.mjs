#!/usr/bin/env node
/** B452: physically observed B2/B4 native feet vs rejected ORIGINAL
 * Recast path coordinates from ONE genuine Chromium SOURCE world.
 * A read-only comparison is NEVER a continuous 60Hz KCC route certificate.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const hold=s=>{throw Error('B452_REAL_SOURCE_FOOT_TRACE_HOLD_'+s)};
const xyz=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const xzd=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const ids=['A1','A2','A3','B1','B2','B3','B4'];
/** Strictly inspect original native witnesses; does not assign actor goals. */
export function inspectB452NativeFootAgainstRejectedRecast(d){
 const e=d?.b441NativeEvidence;
 if(d?.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
  d.source!=='25/17/26/0'||d.verdict!==
   'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING'||
  d.syntheticInput!==false||d.actorWrites!==0||
  d.sourceGeometryWrites!==0||d.scoreWrites!==0||
  d.nativeClockWrites!==0||d.officialWinner!=='NONE'||
  d.formal4v4Certified!==false||d.b441ResearchOnly!==true||
  !Number.isFinite(d.browserOrigin)||d.browserOrigin<=0||
  e?.source!=='25/17/26/0'||e.realSevenCpu!==true||
  e.naturalOpposingTeamRouteCertified!==false||
  e.b442Formal4v4Certified!==false||
  !integer(e.realNativeTicks)||e.realNativeTicks<720||
  !integer(e.lastTick)||e.lastTick<e.realNativeTicks)
   hold('GENUINE_BROWSER_SOURCE');
 const frames=e.realFrames;
 if(!Array.isArray(frames)||frames.length<10||frames.length>40)
  hold('MISSING_NATIVE_CPU_FOOT_FRAMES');
 let previousTick=-1,maxGap=0;
 for(const f of frames){
  if(!integer(f?.tick)||f.tick<=previousTick||f.tick>e.lastTick||
   !Array.isArray(f.physicalFeet)||f.physicalFeet.length!==7||
   f.physicalFeet.map(x=>x.id).sort().join(',')!==ids.join(',')||
   !f.physicalFeet.every(x=>xyz(x.foot)&&x.rejoined===true))
   hold('ACTUAL_CPU_FOOT_SAMPLES');
  if(previousTick>=0)maxGap=Math.max(maxGap,f.tick-previousTick);
  previousTick=f.tick;
 }
 if(maxGap>120)hold('SOURCE_SAMPLING_TOO_SPARSE');
 const all=e.b446LiveActualCpuFootDryRouteProbes;
 if(!Array.isArray(all)||all.length!==3||
  new Set(all.map(x=>x?.id)).size!==3)
  hold('NATIVE_RECAST_DRY_PROVENANCE');
 const results={};
 for(const id of ['B2','B4']){
  const p=all.find(x=>x.id===id);
  if(!p||!integer(p.nativeTick)||p.nativeTick>e.lastTick||
   !xyz(p.actualPhysicalFoot)||p.actualPhysicalFoot[2]>-33||
   p.probeOnlyNoActorOrGoalWrites!==true||
   !integer(p.inspectedOriginalGoals)||!integer(p.deniedRapierOrBoundary)||
   !integer(p.nativeIntermediateSupport)||!integer(p.passedAllOriginalChecks)||
   !integer(p.nativeUnreached)||!integer(p.nativeStartSnap)||
   !integer(p.nativeEndSnap)||
   p.inspectedOriginalGoals!==p.deniedRapierOrBoundary+
    p.nativeIntermediateSupport+p.passedAllOriginalChecks+
    p.nativeUnreached+p.nativeStartSnap+p.nativeEndSnap||
   !Array.isArray(p.b450FailedOriginalGoals)||
   p.b450FailedOriginalGoals.length!==p.nativeIntermediateSupport||
   p.nativeIntermediateSupport<1)
   hold('B450_SOURCE_OR_DENIAL_COUNT_'+id);
  const denial=p.b450FailedOriginalGoals;
  for(const w of denial){
   const f=w?.firstDenied;
   // Actual measured hit and gap are evidence of a rejected Recast
   // Y discrepancy, NOT permission to accept it as a valid walking route.
   if(!xyz(w?.originalGoal)||w.originalGoal[2]>-33||
    !integer(w.nativePathPointCount)||!f||!xyz(f.xyz)||
    f.cause!=='NATIVE_PATH_RAPIER_HEIGHT_MISMATCH'||
    f.hitSolidId!=='UndertowT21D:first-drop-landing-negative-z'||
    !Number.isFinite(f.verticalGapMeters)||f.verticalGapMeters<=.25||
    f.leg!==0||!integer(f.sample)||!integer(f.checked))
    hold('UNPROVEN_OR_ALTERED_REAL_SOURCE_DENIAL_'+id);
  }
  const footFrames=frames.map(f=>({
   tick:f.tick,
   foot:f.physicalFeet.find(x=>x.id===id).foot
  }));
  if(footFrames.some(f=>f.foot[2]>-33))
   hold('WRONG_ORIGINAL_TEAM_REGION_'+id);
  let nearest=null,observedPlanarMeters=0,maximumSampledStep=0;
  for(let k=0;k<footFrames.length;k++){
   const f=footFrames[k];
   if(k>0){
    const step=xzd(footFrames[k-1].foot,f.foot);
    observedPlanarMeters+=step;
    maximumSampledStep=Math.max(maximumSampledStep,step);
   }
   for(const w of denial){
    const distance=xzd(f.foot,w.firstDenied.xyz);
    if(!nearest||distance<nearest.horizontalMeters){
     nearest={nativeTick:f.tick,physicalFoot:[...f.foot],
      deniedRecastSample:[...w.firstDenied.xyz],
      deniedRecastOriginalSolidId:w.firstDenied.hitSolidId,
      deniedRecastVerticalGapMeters:w.firstDenied.verticalGapMeters,
      horizontalMeters:distance,
      absoluteFootVsRecastYMeters:
       Math.abs(f.foot[1]-w.firstDenied.xyz[1]),
      ticksAfterDryPathInspection:f.tick-p.nativeTick};
    }
   }
  }
  if(!nearest||nearest.ticksAfterDryPathInspection<0)
   hold('NATIVE_CAUSAL_SAMPLE_ORDER_'+id);
  results[id]={realPhysicalFrames:footFrames.length,
   firstPhysicalTick:footFrames[0].tick,
   lastPhysicalTick:footFrames.at(-1).tick,
   firstPhysicalFoot:footFrames[0].foot,
   lastPhysicalFoot:footFrames.at(-1).foot,
   observedSampledPolylineMeters:observedPlanarMeters,
   maxXZBetweenPolledNativeFramesMeters:maximumSampledStep,
   rejectedRecastSamples:denial.length,
   closestMeasuredPhysicalFootToRejectedRecast:nearest,
   observedPhysicalFootWithin20cmOfRejectedRecast:
    nearest.horizontalMeters<=.20,
   sameWorldButNotSameNativeTickAsDryPath:true,
   all60HzPhysicalContactsRecorded:false,
   rejectedRouteKccCertified:false,
   b2b4OriginalGoalGranted:false};
 }
 return {schema:'B452_REAL_CPU_FOOT_VS_DENIED_ORIGINAL_RECAST_V1',
  verdict:'PASS_SAME_WORLD_SAMPLED_PHYSICAL_PROXIMITY_NOT_A_ROUTE_PASS',
  source:'25/17/26/0',browserWorldOrigin:d.browserOrigin,
  allSevenRealCpuPhysicallyRejoined:true,realNativeTicks:e.realNativeTicks,
  observedNativeFrames:frames.length,maxUnobservedNativeTicks:maxGap-1,
  B2B4:results,actorWrites:0,geometryWrites:0,clockWrites:0,
  scoreWrites:0,cpuGoalWrites:0,originalCollisionAuthorizationChanged:false,
  physicalContinuousRouteCertified:false,
  humanCpuOpposingEncounterCertified:false,unrestricted4v4Certified:false,
  winner:'NONE',productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3)hold('REQUIRES_SAME_REAL_BROWSER_JSON');
 const path=resolve(process.argv[2]);
 const report=inspectB452NativeFootAgainstRejectedRecast(
  JSON.parse(readFileSync(path,'utf8')));
 writeFileSync(join(dirname(path),'b452-real-foot-vs-original-recast.json'),
  JSON.stringify(report,null,2)+'\n');
 console.log('B452_REAL_SAME_WORLD_PHYSICAL_FOOT_PARITY',JSON.stringify(report));
}
