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
const b34Recover=process.env.T21_W10B34_STALL==='1';
const b35Native=process.env.T21_W10B35_NATIVE==='1';
const alignedNative=b34Recover||b35Native;
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
    report.audit?.sourcePatrol?.paintAwareModeEnabled!==(mode==='AWARE'&&!b35Native)||
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
 if(mode==='AWARE'&&!b35Native&&(
   au.sourcePatrol.realPaintAwareGoalsAccepted<=0||
   au.sourcePatrol.actualOriginalInkOwnershipSampled<=0||
   au.sourcePatrol.paintAwareUnknownInkGoalsAccepted>0||
   au.sourcePatrol.realPaintAwareGoalsAccepted!==
    au.sourcePatrol.paintAwareNonOwnedGoalsAccepted+
    au.sourcePatrol.paintAwareOwnGoalsAccepted+
    au.sourcePatrol.paintAwareUnknownInkGoalsAccepted))
  fail('AWARE_GENUINE_OWNER_GRID_MISSING',au.sourcePatrol);
 if(b35Native&&(
   report.b35NativeSourceRetarget?.enabled!==(mode==='AWARE')||
   mode==='AWARE'&&
    report.b35NativeSourceRetarget?.redundantUnchangedRequestsSuppressed<=0))
  fail('SOURCE_CROWD_REFRESH_MODE_NOT_ISOLATED_'+mode,
   JSON.stringify(report.b35NativeSourceRetarget));
 const src=au.sourcePatrol;
 if(!Number.isSafeInteger(src.groundedFreeCombatCpuSamples)||
    !Number.isSafeInteger(src.nearlyStationaryGroundedCpuSamples)||
    src.groundedFreeCombatCpuSamples<=0||
    src.nearlyStationaryGroundedCpuSamples>src.groundedFreeCombatCpuSamples||
    src.trulyNewOriginalGoalSelections<=0||
    src.trulyNewOriginalGoalSelections>src.requestedGoalLengthsSampled||
    src.newGoalShortHops+src.newGoalLongHops>src.trulyNewOriginalGoalSelections||
    !Number.isFinite(src.newGoalNativePathMeters)||
    src.newGoalNativePathMeters<=0||
    !Number.isFinite(src.newGoalDirectMeters)||
    src.newGoalDirectMeters<=0)
  fail('MISSING_REAL_ORIGINAL_MOBILITY_DIAGNOSTICS_'+mode,
   JSON.stringify(src));
 if(b34Recover&&(
  au.sourcePatrol.b34StallRecoveryModeEnabled!==(mode==='AWARE')||
  mode==='AWARE'&&(
   au.sourcePatrol.stalledOriginalGoalReconsiderations<=0||
   au.sourcePatrol.approvedAlternativeOriginalGoalsAfterStall<=0||
   au.sourcePatrol.approvedAlternativeOriginalGoalsAfterStall>
    au.sourcePatrol.stalledOriginalGoalReconsiderations)))
  fail('NO_REAL_RAPIER_APPROVED_STALL_ESCAPE_'+mode,
   JSON.stringify(au.sourcePatrol));
 const metrics={
  sourceOnly:true,
  browserFixedTickQa:true,
  nativeCpuCount:7,
  checkpoints:ticks,
  sourcePatrolMeters:finite(au.sourcePatrol.travelMeters,'MOBILITY'),
  groundedCpuSamples:finite(au.sourcePatrol.groundedFreeCombatCpuSamples,'GROUND_SAMPLES'),
  stationaryGroundedCpuSamples:finite(au.sourcePatrol.nearlyStationaryGroundedCpuSamples,'STATIONARY_GROUND_SAMPLES'),
  originalGoalDirectDistanceMeters:finite(au.sourcePatrol.requestedGoalDirectMeters,'GOAL_DIRECT_METRES'),
  originalGoalNativePathDistanceMeters:finite(au.sourcePatrol.requestedGoalNativePathMeters,'GOAL_NATIVE_METRES'),
  shortOriginalGoalHops:finite(au.sourcePatrol.requestedGoalShortHops,'SHORT_GOAL_HOPS'),
  longOriginalGoalHops:finite(au.sourcePatrol.requestedGoalLongHops,'LONG_GOAL_HOPS'),
  nativeGoalLengthsSampled:finite(au.sourcePatrol.requestedGoalLengthsSampled,'GOAL_LENGTH_SAMPLES'),
  trulyNewOriginalGoalSelections:finite(au.sourcePatrol.trulyNewOriginalGoalSelections,'NEW_SOURCE_GOALS'),
  newGoalDirectMeters:finite(au.sourcePatrol.newGoalDirectMeters,'NEW_GOAL_DIRECT'),
  newGoalNativePathMeters:finite(au.sourcePatrol.newGoalNativePathMeters,'NEW_GOAL_RECAST'),
  newGoalShortHops:finite(au.sourcePatrol.newGoalShortHops,'NEW_SHORT_HOPS'),
  newGoalLongHops:finite(au.sourcePatrol.newGoalLongHops,'NEW_LONG_HOPS'),
  genuineStallReconsiderations:finite(
   au.sourcePatrol.stalledOriginalGoalReconsiderations,'STALL_ATTEMPTS'),
  realCertifiedStallAlternatives:finite(
   au.sourcePatrol.approvedAlternativeOriginalGoalsAfterStall,'STALLED_ORIGINAL_GOALS'),
  physicalStallRecoveryEnabled:au.sourcePatrol.b34StallRecoveryModeEnabled,
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
  b35NativeSourceMode:report.b35NativeSourceRetarget?.enabled??false,
  b35PhysicalOriginalCrowdRequests:finite(
   report.b35NativeSourceRetarget?.nativeRequestIssued??0,'REAL_NATIVE_TARGET_REQUESTS'),
  b35ExactDuplicateRequestsAvoided:finite(
   report.b35NativeSourceRetarget?.redundantUnchangedRequestsSuppressed??0,
   'SUPPRESSED_NATIVE_TARGET_REQUESTS'),
 };
 if(alignedNative){
  const origin=report.b34StartAudit;
  if(report.b34SourceMeasurementStartTick!==1800||
     report.checkpoints[0].tick!==2160||
     !origin||origin.originalSourceSolids!==25||
     origin.originalPaintSurfaces!==17||
     origin.originalNavLinks!==26||
     origin.sourceScoreablePromotions!==0||
     origin.physicalActorTeleports!==0)
   fail('UNALIGNED_REAL_SOURCE_MEASUREMENT_START_'+mode,
    JSON.stringify({start:report.b34SourceMeasurementStartTick,
     ticks:report.checkpoints.map(c=>c.tick)}));
  const original=origin.sourcePatrol;
  // Convert cumulative counters to true IN-WINDOW deltas so different
  // original physical CPU landing/onboarding lengths cannot leak
  // pre-window shots, painting or locomotion into the comparison.
  const entries={
   sourcePatrolMeters:original.travelMeters,
   groundedCpuSamples:original.groundedFreeCombatCpuSamples,
   stationaryGroundedCpuSamples:original.nearlyStationaryGroundedCpuSamples,
   originalGoalDirectDistanceMeters:original.requestedGoalDirectMeters,
   originalGoalNativePathDistanceMeters:original.requestedGoalNativePathMeters,
   shortOriginalGoalHops:original.requestedGoalShortHops,
   longOriginalGoalHops:original.requestedGoalLongHops,
   nativeGoalLengthsSampled:original.requestedGoalLengthsSampled,
   trulyNewOriginalGoalSelections:original.trulyNewOriginalGoalSelections,
   newGoalDirectMeters:original.newGoalDirectMeters,
   newGoalNativePathMeters:original.newGoalNativePathMeters,
   newGoalShortHops:original.newGoalShortHops,
   newGoalLongHops:original.newGoalLongHops,
   genuineStallReconsiderations:original.stalledOriginalGoalReconsiderations,
   realCertifiedStallAlternatives:original.approvedAlternativeOriginalGoalsAfterStall,
   actualInkCellsChanged:origin.inkCellsChanged,
   actualOriginalPaintShots:origin.naturalCpuSourceTurfShots,
   actualOriginalPaintImpacts:origin.nativeCpuTurfInkImpacts,
   authorizedSourceGoals:original.realGoalRequests,
   ownerGridLookups:original.actualOriginalInkOwnershipLookups,
   actualOwnerGridSamples:original.actualOriginalInkOwnershipSampled,
   acceptedOtherOrNeutralGoals:original.paintAwareNonOwnedGoalsAccepted,
   acceptedOwnGoals:original.paintAwareOwnGoalsAccepted,
   acceptedUnknownGoals:original.paintAwareUnknownInkGoalsAccepted,
   samePreviouslyAuthorizedGoalRequests:original.continuedPreviouslyApprovedGoalRequests,
   midrouteGoalSwitches:original.switchedGoalBeforePreviousArrival
  };
  for(const [key,start] of Object.entries(entries)){
   const end=metrics[key];
   metrics[key]=finite(end-start,'B34_NATIVE_IN_WINDOW_'+key);
  }
  metrics.originalWindowStartNativeTick=1800;
  metrics.realSourceWindowTicks=1080;
 }
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
   (alignedNative?initialTickOffset!==0:Math.abs(initialTickOffset)>12))
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
const diagnosticDimensions=[
 ['groundedCpuSamples','Real grounded source-foot CPU observations'],
 ['stationaryGroundedCpuSamples','Near-stationary real original-foot CPU observations'],
 ['originalGoalDirectDistanceMeters','Sum of audited real foot to original goal direct distance'],
 ['originalGoalNativePathDistanceMeters','Sum of native Recast path polyline distance'],
 ['shortOriginalGoalHops','Accepted original goal selections closer than 4m'],
 ['longOriginalGoalHops','Accepted original goal selections farther than 9m'],
 ['nativeGoalLengthsSampled','Accepted actual Recast goal lengths observed'],
 ['trulyNewOriginalGoalSelections','Changed to a different already-audited original source goal'],
 ['newGoalDirectMeters','Direct distance of genuine new goal selections'],
 ['newGoalNativePathMeters','Recast distance of genuine new goal selections'],
 ['newGoalShortHops','Genuinely new source goal hops shorter than 4m'],
 ['newGoalLongHops','Genuinely new source goal hops longer than 9m'],
 ['genuineStallReconsiderations','Real 36-tick stationary old-source goal escape attempts'],
 ['realCertifiedStallAlternatives','Approved different original-source goal after a genuine stall']
];
const diagnostics=Object.fromEntries(diagnosticDimensions.map(([key,label])=>{
 const fixedValue=fixed[key],awareValue=aware[key];
 return [key,{label,fixed:fixedValue,aware:awareValue,
  delta:Number((awareValue-fixedValue).toFixed(3))}];
}));
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
// B34 records differences; it does NOT infer actual cause without a
// controlled original-foot position/route experiment. The ratios are
// grounded only in the two measured separate genuine Chrome sessions.
const safeRatio=(top,bottom)=>bottom>0?Number((top/bottom).toFixed(4)):null;
const mobilityDiagnosticRatios={
 fixedStationaryFraction:safeRatio(fixed.stationaryGroundedCpuSamples,fixed.groundedCpuSamples),
 awareStationaryFraction:safeRatio(aware.stationaryGroundedCpuSamples,aware.groundedCpuSamples),
 fixedNewGoalMeanRecastMeters:safeRatio(fixed.newGoalNativePathMeters,fixed.trulyNewOriginalGoalSelections),
 awareNewGoalMeanRecastMeters:safeRatio(aware.newGoalNativePathMeters,aware.trulyNewOriginalGoalSelections),
 fixedNewGoalMeanDirectMeters:safeRatio(fixed.newGoalDirectMeters,fixed.trulyNewOriginalGoalSelections),
 awareNewGoalMeanDirectMeters:safeRatio(aware.newGoalDirectMeters,aware.trulyNewOriginalGoalSelections),
 fixedShortNewGoalFraction:safeRatio(fixed.newGoalShortHops,fixed.trulyNewOriginalGoalSelections),
 awareShortNewGoalFraction:safeRatio(aware.newGoalShortHops,aware.trulyNewOriginalGoalSelections)
};
const productiveEnough=Object.values(gates).every(Boolean);
const verdict=productiveEnough?'ELIGIBLE_FOR_OWNER_GAMEPLAY_REVIEW':
 'RETAIN_FIXED_AS_DEFAULT_WHILE_ADAPTIVE_IS_RESEARCH_OPT_IN';
const result={
 phase:b35Native?'W10-B35':b34Recover?'W10-B34':
  b33Stable?'W10-B33':'W10-B32',
 comparison:b35Native?
  'FIXED_SOURCE_ORIGINAL_REPEAT_TARGET_VS_B35_SPARSE_NATIVE_REFRESH':
  b34Recover?
  'FIXED_VS_STALL_RECOVERED_STABLE_ORIGINAL_SOURCE':
  b33Stable?'FIXED_VS_STABLE_PAINT_AWARE_REAL_ORIGINAL_SOURCE':
  'FIXED_VS_PAINT_AWARE_REAL_ORIGINAL_SOURCE',
 horizon:alignedNative?
  'EXACT_NATIVE_TICK_1800_START_AND_REAL_1080_TICK_INCREMENT_ONLY':
  'MATCHED_720_TICK_CHECKPOINT_INTERVALS_WITH_INITIAL_STARTUP_TICK_DRIFT',
 initialTickOffset,
 tickIntervalsIdentical:true,
 strictAbsoluteNativeTickIdentity:alignedNative,
 b34AlignedNativeStartTick:alignedNative?1800:null,
 b34CountersExcludeAllPrewindowSourcePaintAndTravel:alignedNative,
 sameRepoCode:true,independentBrowserSessions:true,
 fixed,aware,differences,diagnostics,mobilityDiagnosticRatios,
 mobilityCauseNotCertified:true,gates,verdict,
 effectiveSampleCount:1,
 notAFpsOrStatisticallyControlledClaim:true,
 sourceStageSourceOfTruth:'25_SOLIDS_17_PAINT_26_NAV_0_SCORE',
 naturalCrossTeamPathsCertified:0,
 originBancSetActorNotAuthenticated:true,
 stageOrGameplayGeometryChanged:false,
 productionPromotionAllowed:false
};
writeFileSync(resolve(outFile),JSON.stringify(result,null,2)+'\n');
console.log(b35Native?'T21_W10B35_REAL_CHROME_SPARSE_NATIVE_TARGET_REFRESH_AB':
 b34Recover?'T21_W10B34_REAL_CHROME_PHYSICAL_STALL_RECOVERY_AB':
 b33Stable?'T21_W10B33_STABLE_GOAL_REAL_CHROME_COMPARISON':
 'T21_W10B32_MATCHED_REAL_CHROME_CPU_PATROL_AB_COMPARISON',
 JSON.stringify({fixedTicks:fixed.checkpoints,awareTicks:aware.checkpoints,
  initialTickOffset,tickIntervalsIdentical:true,
  baseline:fixed,paintAware:aware,
  deltas:differences,diagnostics,mobilityDiagnosticRatios,gates,verdict,
  originalSourceTopologyUnchanged:true}));
