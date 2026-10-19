#!/usr/bin/env node
/**
 * W10-B32: two SEPARATE, genuine Chromium/PlayCanvas/60Hz physics sessions
 * on the exact same immutable source stage. Reads existing B16 audit files.
 * No synthetic CPU states, RNG seeding claim, reset of real ink, extra
 * original stage solids, teleport, source score or promoted 4v4 winner.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

function fail(id,detail){throw Error('T21_W10B32_'+id+':'+String(detail));}
const [baselineFile,adaptiveFile,outFile]=process.argv.slice(2);
if(!baselineFile||!adaptiveFile||!outFile)
 fail('EXPECTED_TWO_REAL_CHROME_REPORTS','usage: compare fixed.json aware.json out.json');
const read=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
const b33Stable=process.env.T21_W10B33_STABLE==='1';
const a=read(baselineFile),b=read(adaptiveFile);
const finite=(v,name)=>{
 if(typeof v!=='number'||!Number.isFinite(v)||v<0)
  fail('NONFINITE_'+name,JSON.stringify(v));
 return v;
};
const assertFrame=(report,mode)=>{
 if(report.phase!=='W10-B16'||
    report.status!=='PASS_REAL_NATIVE_CPU_AUTONOMOUS_PATROL_AND_SOURCE_TURF'||
    report.naturalCrossTeamMatchStatus!=='HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH'||
    report.realCpuOpponentEngagementCertified!==false||
    report.exactSourceCpuSpawnsPreserved!==true||
    report.userControlledHumanRepositionedForSourceLane!==false||
    report.noCombatTargetTeleport!==true||
    report.naturalSessionUsesRapierAndRecast!==true||
    report.browserFixedTickQa!==true||
    report.realOriginalStageOnly!==true||
    report.audit?.credibleNativeEndpointPairs!==0||
    report.audit?.pairCount!==12||
    report.audit?.physicalActorTeleports!==0||
    report.audit?.sourceScoreablePromotions!==0||
    report.audit?.originalSourceSolids!==25||
    report.audit?.originalPaintSurfaces!==17||
    report.audit?.originalNavLinks!==26||
    report.audit?.productionAuthorized!==false||
    report.audit?.sourcePatrol?.paintAwareModeEnabled!==(mode==='AWARE')||
    report.audit?.sourcePatrol?.paintAwareRouteShortcutsGranted!==0||
    (b33Stable&&report.audit?.sourcePatrol?.stableSourceGoalModeEnabled!==
      (mode==='AWARE')))
  fail('SOURCE_AUTHORITY_'+mode,JSON.stringify(report.audit));
 if(report.checkpoints?.length!==3)
  fail('INSUFFICIENT_REAL_SOURCE_CHECKPOINTS_'+mode,report.checkpoints?.length);
 const ticks=report.checkpoints.map(c=>c.tick);
 if(ticks.some((v,i)=>!Number.isSafeInteger(v)||v<=0||
   (i>0&&v<=ticks[i-1])))
  fail('INVALID_PHYSICS_TICK_SEQUENCE_'+mode,ticks);
 for(const point of report.checkpoints){
  if(point.perCpu?.length!==7||point.perCpu.some(v=>
    !['A1','A2','A3','B1','B2','B3','B4'].includes(v.id)||
    !Array.isArray(v.realPhysicalFoot)||v.realPhysicalFoot.length!==3||
    v.realPhysicalFoot.some(v=>!Number.isFinite(v))))
   fail('NONREAL_SEVEN_CPU_PHYSICAL_FEET_'+mode,point.tick);
 }
 const au=report.audit;
 if(mode==='FIXED'&&(au.sourcePatrol.realPaintAwareGoalsAccepted!==0||
   au.sourcePatrol.actualOriginalInkOwnershipLookups!==0))
  fail('FIXED_SOURCE_LANE_CONTAMINATED',au.sourcePatrol);
 if(mode==='AWARE'&&(
   au.sourcePatrol.realPaintAwareGoalsAccepted<=0||
   au.sourcePatrol.actualOriginalInkOwnershipSampled<=0||
   au.sourcePatrol.paintAwareUnknownInkGoalsAccepted>0||
   au.sourcePatrol.realPaintAwareGoalsAccepted!==
    au.sourcePatrol.paintAwareNonOwnedGoalsAccepted+
    au.sourcePatrol.paintAwareOwnGoalsAccepted+
    au.sourcePatrol.paintAwareUnknownInkGoalsAccepted))
  fail('AWARE_GENUINE_OWNER_GRID_MISSING',au.sourcePatrol);
 const metrics={
  sourceOnly:true,
  browserFixedTickQa:true,
  nativeCpuCount:7,
  checkpoints:ticks,
  sourcePatrolMeters:finite(au.sourcePatrol.travelMeters,'MOBILITY'),
  actualInkCellsChanged:finite(au.inkCellsChanged,'CHANGED_CELLS'),
  actualOriginalPaintShots:finite(au.naturalCpuSourceTurfShots,'SHOTS'),
  actualOriginalPaintImpacts:finite(au.nativeCpuTurfInkImpacts,'IMPACTS'),
  authorizedSourceGoals:finite(au.sourcePatrol.realGoalRequests,'GOALS'),
  authenticatedEnemyPaths:au.credibleNativeEndpointPairs,
  humanAndCpuTeleports:au.physicalActorTeleports,
  authenticTurfScore:'UNAVAILABLE',
  productionAuthorized:false,
  ownerGridLookups:au.sourcePatrol.actualOriginalInkOwnershipLookups,
  actualOwnerGridSamples:au.sourcePatrol.actualOriginalInkOwnershipSampled,
  acceptedOtherOrNeutralGoals:au.sourcePatrol.paintAwareNonOwnedGoalsAccepted,
  acceptedOwnGoals:au.sourcePatrol.paintAwareOwnGoalsAccepted,
  acceptedUnknownGoals:au.sourcePatrol.paintAwareUnknownInkGoalsAccepted,
  stableOriginalGoalMode:au.sourcePatrol.stableSourceGoalModeEnabled,
  samePreviouslyAuthorizedGoalRequests:
   au.sourcePatrol.continuedPreviouslyApprovedGoalRequests,
  midrouteGoalSwitches:au.sourcePatrol.switchedGoalBeforePreviousArrival,
 };
 return metrics;
};
const fixed=assertFrame(a,'FIXED');
const aware=assertFrame(b,'AWARE');
// These are two independent real Chromium sessions. Prior real mouse,
// actor onboarding and wall-clock browser startup may advance a handful
// of genuine physics ticks before the precisely controlled 1080-tick
// checkpoint interval. Do NOT falsely claim absolute tick identity.
const normalizedTicks=x=>x.checkpoints.map(t=>t-x.checkpoints[0]);
const initialTickOffset=aware.checkpoints[0]-fixed.checkpoints[0];
if(JSON.stringify(normalizedTicks(fixed))!==JSON.stringify(normalizedTicks(aware))||
   fixed.checkpoints[1]-fixed.checkpoints[0]!==360||
   fixed.checkpoints[2]-fixed.checkpoints[1]!==360||
   !Number.isSafeInteger(initialTickOffset)||
   Math.abs(initialTickOffset)>12)
 fail('NONMATCHED_NATIVE_TICK_INTERVALS_OR_STARTUP_DRIFT',
  JSON.stringify({fixed:fixed.checkpoints,aware:aware.checkpoints,
   initialTickOffset}));

const dimensions=[
 ['actualInkCellsChanged','Ink cells changed on real source surfaces'],
 ['actualOriginalPaintShots','Accepted original-source paint shots'],
 ['actualOriginalPaintImpacts','Actual original-source paint impacts'],
 ['sourcePatrolMeters','Original-foot source patrol metres'],
 ['authorizedSourceGoals','Native Recast/physical-goal requests']
];
const differences=Object.fromEntries(dimensions.map(([key,label])=>{
 const l=fixed[key],n=aware[key];
 return [key,{label,fixed:l,aware:n,delta:Number((n-l).toFixed(3)),
  ratioToFixed:Number((l>0?n/l:n===0?1:Infinity).toFixed(4))}];
}));
const gates={
 cellOutputAtLeast95PercentOfFixed:
  aware.actualInkCellsChanged>=fixed.actualInkCellsChanged*.95,
 shotOutputAtLeast90PercentOfFixed:
  aware.actualOriginalPaintShots>=fixed.actualOriginalPaintShots*.90,
 physicalPatrolAtLeast90PercentOfFixed:
  aware.sourcePatrolMeters>=fixed.sourcePatrolMeters*.90
};
const productiveEnough=Object.values(gates).every(Boolean);
const verdict=productiveEnough?'ELIGIBLE_FOR_OWNER_GAMEPLAY_REVIEW':
 'RETAIN_FIXED_AS_DEFAULT_WHILE_ADAPTIVE_IS_RESEARCH_OPT_IN';
const result={
 phase:b33Stable?'W10-B33':'W10-B32',
 comparison:b33Stable?
  'FIXED_VS_STABLE_PAINT_AWARE_REAL_ORIGINAL_SOURCE':
  'FIXED_VS_PAINT_AWARE_REAL_ORIGINAL_SOURCE',
 horizon:'MATCHED_720_TICK_CHECKPOINT_INTERVALS_WITH_INITIAL_STARTUP_TICK_DRIFT',
 initialTickOffset,
 tickIntervalsIdentical:true,
 strictAbsoluteNativeTickIdentity:false,
 sameRepoCode:true,independentBrowserSessions:true,
 fixed,aware,differences,gates,verdict,
 effectiveSampleCount:1,
 notAFpsOrStatisticallyControlledClaim:true,
 sourceStageSourceOfTruth:'25_SOLIDS_17_PAINT_26_NAV_0_SCORE',
 naturalCrossTeamPathsCertified:0,
 originBancSetActorNotAuthenticated:true,
 stageOrGameplayGeometryChanged:false,
 productionPromotionAllowed:false
};
writeFileSync(resolve(outFile),JSON.stringify(result,null,2)+'\n');
console.log(b33Stable?'T21_W10B33_STABLE_GOAL_REAL_CHROME_COMPARISON':
 'T21_W10B32_MATCHED_REAL_CHROME_CPU_PATROL_AB_COMPARISON',
 JSON.stringify({fixedTicks:fixed.checkpoints,awareTicks:aware.checkpoints,
  initialTickOffset,tickIntervalsIdentical:true,
  baseline:fixed,paintAware:aware,
  deltas:differences,gates,verdict,
  originalSourceTopologyUnchanged:true}));
