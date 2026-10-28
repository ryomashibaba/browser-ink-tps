/** B272 — cross-run evidence bridge; do not invent source-world movement.
 * Real B271 native 17-surface optical survey + independent B210 genuine 180s
 * keyboard/mouse KCC play. Different source revisions and different ticks:
 * never use projected pixel coordinates as if frames were simultaneous.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const SRC='25/17/26/0';
const check=(b,s)=>{if(!b)throw Error('B272_'+s)};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const pts=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
const sum=(list,prop)=>list.reduce((n,x)=>n+x[prop],0);
export function b272AuditIndependentNativeEvidence(b271,b210,legs){
 const survey=b271?.report,rows=survey?.sourceStageSurfaceRows;
 check(b271?.schema==='B271_REAL_WEBGL2_NATIVE_ALL_17_SOURCE_REGISTRATION'&&
  b271?.context==='REAL_INK'&&b271?.source===SRC&&
  b271?.genuineOriginalSource===true&&b271?.artAccepted===false&&
  b271?.productionAuthorized===false,'GENUINE_17_SOURCE_EVIDENCE');
 check(survey?.schema==='B271_SEVENTEEN_ORIGINAL_FOOTPRINT_OPTICAL_PHYSICAL_REGISTRATION'&&
  survey?.source===SRC&&survey?.originalUvTriangles===57578&&
  survey?.originalPaintSurfaces===17&&
  survey?.originalRapierSolids===25&&survey?.originalNavLinks===26&&
  survey?.originalScoreables===0&&survey?.navEndpointNotPath===true&&
  survey?.paintedPixelVisibilityNotCertified===true&&
  survey?.officialOriginalConnectivityUncertified===true&&
  survey?.artAccepted===false&&Array.isArray(rows)&&rows.length===17,
  'SEVENTEEN_SOURCE_CONTRACT');
 check(new Set(rows.map(x=>x.surfaceId)).size===17&&
  rows.every(x=>typeof x.surfaceId==='string'&&x.surfaceId.length&&
  Number.isSafeInteger(x.actualOwnerCells)&&x.actualOwnerCells>=0&&
  Number.isSafeInteger(x.sampledActiveProbes)&&
  x.sampledActiveProbes>=1&&x.sampledActiveProbes<=3&&
  Number.isSafeInteger(x.activeFootprintCells)&&x.activeFootprintCells>=1&&
  x.rays?.length===x.sampledActiveProbes&&x.rays.every(ray=>
   pts(ray.nativeWorldMeters)&&finite(ray.rayLengthMeters)&&
   ray.rayLengthMeters>0&&ray.originalOpticalTrianglesScanned===57578&&
   ray.realPaintedPixelVisibilityCertified===false&&
   ray.navEndpointProvesReachability===false)),
  'SOURCE_SURFACE_PROBE_WITNESS');
 check(sum(rows,'actualOwnerCells')===survey.nativeOriginalOwnedCells&&
  survey.nativeOriginalOwnedCells===survey.nativeOriginalOwnedA+
   survey.nativeOriginalOwnedB&&
  survey.nativeOriginalOwnedCells===b271.actualPaintedCells&&
  survey.ownedSurfaces===rows.filter(x=>x.actualOwnerCells>0).length&&
  survey.sampledActiveProbeRays===sum(rows,'sampledActiveProbes')&&
  survey.sampledActiveProbeRays<=51&&
  survey.ownedSurfaces>0&&survey.ownedSurfaces<17&&
  survey.viewportSamples<=survey.sampledActiveProbeRays,
  'ORIGINAL_GRID_ACCOUNTING');
 check(b210?.verdict==='B59_GENUINE_NATIVE_180_SECOND_SOURCE_SESSION_COMPLETE'&&
  b210?.required180SecondsOfNativeMatchClock===true&&
  b210?.actualNativeSecondsElapsed===180&&
  b210?.noArtificialQaTickAdvances===true&&
  b210?.actualBrowserKeyboardMouse===true&&
  b210?.b172ContinuousReal180sHumanParticipation===true&&
  b210?.originalPhysicsTicks>=10800&&
  b210?.sourceAuthority==='25_SOLIDS_17_PAINTABLE_26_LINKS_0_SCOREABLE'&&
  b210?.actualCpuSevenPresent===true&&b210?.actualCpuSourceRejoined===7&&
  b210?.humanAcceptedShots>0&&b210?.realHumanChangedInk>0&&
  b210?.genuineCpuSourceShots>0&&b210?.genuineCpuChangedInk>0&&
  b210?.naturalOpponentPathsCertified===0&&
  b210?.b176TrueOriginalHumanLowerAfter180s===false&&
  Array.isArray(b210?.b176NativeRealKccSourceRoute)&&
  b210.b176NativeRealKccSourceRoute.length===0&&
  b210?.officialWinner==='NONE'&&b210?.originalNintendo4v4Certified===false,
  'INDEPENDENT_GENUINE_180S_KCC_AUTHORITY');
 check(legs?.sourceAuthority==='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'&&
  legs?.noSyntheticTickOrPaint===true&&
  Array.isArray(legs.actualNativePlayerSegments)&&
  legs.actualNativePlayerSegments.length>0&&
  legs.actualNativePlayerSegments.length<=32,
  'REAL_HUMAN_KCC_LEGS');
 let lastBucket=0,totalLegs=0,totalMeters=0,totalShots=0;
 const supports=new Map();
 const spans=[];
 for(const chunk of legs.actualNativePlayerSegments){
  const bucket=chunk.nativeTimeBucket20s;
  check(Number.isSafeInteger(bucket)&&bucket>lastBucket&&
   Number.isSafeInteger(chunk.trueEndTick)&&
   Array.isArray(chunk.actualKccKeyboardMouseLegs)&&
   chunk.actualKccKeyboardMouseLegs.length>0&&
   chunk.actualKccKeyboardMouseLegs.length<=8,'REAL_HUMAN_TICK_ORDER');
  lastBucket=bucket;
  for(const step of chunk.actualKccKeyboardMouseLegs){
   const support=step.verifiedOriginalSupportId;
   check(['KeyW','KeyA','KeyS','KeyD'].includes(step.code)&&
    typeof support==='string'&&support.length>0&&
    step.startTick<step.endTick&&step.endTick<=chunk.trueEndTick&&
    finite(step.actualKccMovementMeters)&&step.actualKccMovementMeters>0&&
    Number.isSafeInteger(step.truePlayerShotDelta)&&
    step.truePlayerShotDelta>=0&&pts(step.actualRapierBody),
    'UNVERIFIED_KCC_NATIVE_WORLD_SEGMENT');
   totalLegs++;totalMeters+=step.actualKccMovementMeters;
   totalShots+=step.truePlayerShotDelta;
   supports.set(support,(supports.get(support)??0)+1);
   spans.push({nativeTimeBucket20s:bucket,code:step.code,
    supportId:support,tickStart:step.startTick,tickEnd:step.endTick,
    realKccMoveMeters:step.actualKccMovementMeters,
    originalRapierBodyWorldMeters:step.actualRapierBody});
  }
 }
 check(totalLegs>=2&&
  totalShots<=b210.humanAcceptedShots&&
  supports.size>=1,'INCONSISTENT_ACTUAL_HUMAN_MOVEMENT');
 const evidence={
  schema:'B272_DISTINCT_RUN_NATIVE_PHYSICAL_PATH_VS_17_SURFACES',
  source:SRC,sourceOriginalTriangles:57578,
  realNativeOriginalPaintSurfaces:rows.length,
  originalSourceSolids:25,originalNavigationLinks:26,scoreable:0,
  realB271OwnedCells:survey.nativeOriginalOwnedCells,
  actuallyPaintedOriginalSurfacesB271:survey.ownedSurfaces,
  sampledOriginalFootprintRays:survey.sampledActiveProbeRays,
  originalOpticalBeforePaintProbeCount:survey.opticalBeforeCount,
  originalRapierBeforePaintProbeCount:survey.physicalBeforeCount,
  actual180sMatchClock:b210.actualNativeSecondsElapsed,
  realHumanKeyboardMouseKccSegments:totalLegs,
  realKeyboardKccTravelMetersSum:+totalMeters.toFixed(3),
  realHumanShotsInMeasuredSegments:totalShots,
  actuallyWitnessedOriginalSupportIds:[...supports].map(([id,count])=>
   ({id,keyboardLegs:count})),
  distinctNativeSupportIdsObserved:supports.size,
  sourceSurfaceOwnerCounts:rows.map(x=>({
   id:x.surfaceId,actualOwnedCells:x.actualOwnerCells,
   originalActiveCells:x.activeFootprintCells,
   opticalBeforeCount:x.rays.filter(z=>z.opticalHitsBeforeSourcePaint>0).length,
   physicalBeforeCount:x.rays.filter(z=>z.physicalBeforeSourcePaint).length
  })),
  genuineDifferentRunRevisionsAndTicks:true,
  originallyUnpaintedSurfacesProvenUnpaintable:false,
  navlinkEndpointIndicatesPath:false,
  originalUvPlacementCorrectCertified:false,
  nonScoreableOriginalSurfaceRoutabilityCertified:false,
  confirmedContinuousCrossSurfaceOriginalRouteCount:0,
  genuineLowerFloorRouteReached:false,
  allSeventeenSourceSurfacesWalkableCertified:false,
  screenPixelInkVisibilityCertified:false,
  originalStageOriginalActorsMappedCertified:false,
  noSyntheticActorOrPaintSamples:true,
  changesToGameplayMade:0,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false,
  motionProvenance:spans
 };
 return evidence;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 check(process.argv.length===6,'CLI_B271_REAL_B210_SESSION_B172_LEGS_OUT');
 const [a,b,c,o]=process.argv.slice(2);
 const result=b272AuditIndependentNativeEvidence(...[a,b,c]
  .map(p=>JSON.parse(readFileSync(p,'utf8'))));
 writeFileSync(o,JSON.stringify(result,null,2));
 console.log('B272_CROSSRUN_NATIVE_ROUTE_EVIDENCE_PASS',JSON.stringify({
  actualSurfaces:result.realNativeOriginalPaintSurfaces,
  ownedSurfaces:result.actuallyPaintedOriginalSurfacesB271,
  localHumanLegs:result.realHumanKeyboardMouseKccSegments,
  supportIds:result.actuallyWitnessedOriginalSupportIds,
  pathToLowerCertified:false,artAccepted:false
 }));
}
