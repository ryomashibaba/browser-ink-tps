import {Vec3} from 'playcanvas';
import RAPIER from '@dimforge/rapier3d-compat';
import {createConfiguredPlayerCharacterController,PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {beforeAll,describe,expect,it} from 'vitest';
// @ts-ignore pinned RAW used by QA only; browser production tsconfig excludes Node
import {readFileSync,writeFileSync} from 'node:fs';
// @ts-ignore pinned RAW used by QA only; browser production tsconfig excludes Node
import {join} from 'node:path';
declare const process:{env:Record<string,string|undefined>};
import {RapierStagePhysics,initializeRapier}
 from '../physics/RapierStagePhysics';
import {RecastStageNavigation,initializeRecastNavigation}
 from '../navigation/RecastStageNavigation';
import {PerformanceStats} from '../core/PerformanceStats';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {b450FirstSourceDenial} from './B450OriginalRouteWitness';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';

type P=Readonly<{x:number;y:number;z:number}>;
const ids=['B2','B4'] as const;
const foot=(a:readonly number[])=>new Vec3(a[0]!,a[1]!,a[2]!);
const r6=(v:number)=>Number(v.toFixed(6));
const source=process.env.T21_B497_EVIDENCE_DIR;
beforeAll(async()=>Promise.all([initializeRapier(),initializeRecastNavigation()]));
describe('B497 ten unresolved source paths and 50 genuine-size isolated static KCC probes',()=>{
 it.skipIf(!source)('reconstructs authentic rejected paths; counts counterfactual reprojected ray supports without granting goals',()=>{
  const read=(name:string)=>JSON.parse(readFileSync(join(source!,name),'utf8'));
  const data=read('b450-first-original-gap-report.json');
  const fullRate=read('b454-native-b2-b4-physical-60hz.json');
  const topology=read('b487-real-original-16-cross-team-route-audit.json');
  const gap=read('b488-real-original-f4-gap-authority-hold.json');
  expect(data.schema).toBe('B451_REAL_B2_B4_ORIGINAL_CONTACT_GAP_CLASSIFICATION_V2');
  expect(data.originalSource).toBe('25/17/26/0');
  expect(data.browserOrigin).toBe(fullRate.browserWorldOrigin);
  expect([data.actorWrites,data.geometryWrites,data.clockWrites,
   data.scoreWrites,fullRate.actorWrites,
   fullRate.originalSourceGeometryWrites]).toEqual([0,0,0,0,0,0]);
  expect([topology.nativePathReportedPairs,
   topology.nativeCredibleEndpointPairs,
   gap.currentNativeReportedPaths,
   gap.currentNativeCredibleEndpointPairs]).toEqual([0,0,0,0]);
  expect(frozen.activationReady).toBe(false);
  const stage=undertowT21dConnectivityQaStage();
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const origHit=(p:P)=>{
   const h=physics.castStageSegment(
    new Vec3(p.x,p.y+.65,p.z),
    new Vec3(p.x,p.y-.65,p.z),'ink-projectile');
   const gap=h?Math.abs(h.point.y-p.y):null;
   return {solidId:h?.solidId??null,gap,
    supported:!!h&&gap!==null&&gap<=.25&&
      stage.solids.some(s=>s.id===h.solidId)};
  };
  const byActor:Record<string,unknown>={};
  let rawRejectedCount=0,firstPointMatches=0,reprojectedPotential=0,
   stillUnsupported=0,pathWithoutOriginalSubstitute=0;
  const selectedFailures:Array<unknown>=[];
  const allSixtyRoutes:Array<unknown>=[],tenUnresolved:Array<unknown>=[];
  let staticKccChecked=0,staticKccZeroClip=0,staticKccHeld=0,
   routesWithProjectedVerticalJumps=0,
   speedLimitedKccChecked=0,speedLimitedKccWithin=0,
   speedLimitedKccHeld=0;
  for(const id of ids){
   const witness=data.perCpu[id];
   const start=foot(witness.actualPhysicalFoot);
   const realRow=fullRate.rows[id].find((row:{tick:number})=>
    row.tick===witness.nativeTick);
   expect(realRow).toBeDefined();
   // B450's pre-goal foot and B454's same-tick post-move foot are
   // genuinely different read phases. Never overwrite the B450 origin.
   const originalCapturePhaseOffset=start.distance(foot(realRow.foot));
   expect(originalCapturePhaseOffset).toBeGreaterThanOrEqual(0);
   expect(originalCapturePhaseOffset).toBeLessThan(.02);
   const failureRows=witness.rejectedOriginalRoutes as Array<{
    originalGoal:[number,number,number];
    firstDenied:{cause:string;xyz:[number,number,number];
     verticalGapMeters:number;hitSolidId:string;
     leg:number;sample:number;checked:number};
    nativePathPointCount:number;
   }>;
   expect(failureRows).toHaveLength(30);
   let thisActorRecovered=0,thisActorHeld=0,
    firstOriginalPointReprojected=0,
    maxReprojectionMoveXZ=0,
    maxInterpolationYAdjustment=0,
    allActualSampled=0;
   const uniqueReasons:Record<string,number>={};
   for(let k=0;k<failureRows.length;k++){
    const evidence=failureRows[k]!;
    expect(evidence.firstDenied.cause)
     .toBe('NATIVE_PATH_RAPIER_HEIGHT_MISMATCH');
    expect(evidence.firstDenied.hitSolidId)
     .toBe('UndertowT21D:first-drop-landing-negative-z');
    const route=nav.auditPath(start,foot(evidence.originalGoal));
    expect(route.reachedTarget).toBe(true);
    expect(route.pointCount).toBe(evidence.nativePathPointCount);
    expect(route.startSnapDistanceMeters).toBeLessThanOrEqual(.20);
    expect(route.endSnapDistanceMeters).toBeLessThanOrEqual(.20);
    const actualFirst=b450FirstSourceDenial(
     route.nativePathPoints,-1,p=>{
      const s=origHit(p);
      return {supported:s.supported,solidId:s.solidId,
       gapMeters:s.gap};
     });
    expect(actualFirst.cause).toBe(evidence.firstDenied.cause);
    expect(actualFirst.leg).toBe(evidence.firstDenied.leg);
    expect(actualFirst.sample).toBe(evidence.firstDenied.sample);
    expect(actualFirst.xyz).not.toBeNull();
    const pointError=Math.hypot(
     actualFirst.xyz![0]-evidence.firstDenied.xyz[0],
     actualFirst.xyz![1]-evidence.firstDenied.xyz[1],
     actualFirst.xyz![2]-evidence.firstDenied.xyz[2]);
    expect(pointError).toBeLessThan(.001);
    firstPointMatches++;
    const firstP={x:actualFirst.xyz![0],y:actualFirst.xyz![1],
     z:actualFirst.xyz![2]};
    const correctedFirst=nav.auditNavMeshProjection(new Vec3(
     firstP.x,firstP.y,firstP.z));
    const c=correctedFirst.nearestPoint;
    const firstXZ=c?Math.hypot(c.x-firstP.x,c.z-firstP.z):Infinity;
    const firstSupported=!!c&&firstXZ<=.03&&c.z*-1>=33&&
     c.y>=2.5&&c.y<=5.5&&origHit(c).supported;
    if(firstSupported)firstOriginalPointReprojected++;
    const projectedPoints:P[]=[];
    let maxProjectedAdjacentY=0,maxProjectedAdjacent3d=0;
    let tested=0,blocked=0,unsupportedStatic=0,
     liftedY=0,largestXZ=0,firstDeniedAfterReprojection:null|{
       leg:number;part:number;reason:string;raw:P;projected:P|null
     }=null;
    const samples=route.nativePathPoints;
    for(let leg=0;leg+1<samples.length;leg++){
     const a=samples[leg]!,b=samples[leg+1]!;
     const meters=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
     const segments=Math.max(1,Math.ceil(meters/.30));
     for(let j=leg===0?0:1;j<=segments;j++){
      tested++;allActualSampled++;
      const fraction=j/segments;
      const raw={x:a.x+(b.x-a.x)*fraction,
       y:a.y+(b.y-a.y)*fraction,z:a.z+(b.z-a.z)*fraction};
      const projected=nav.auditNavMeshProjection(
       new Vec3(raw.x,raw.y,raw.z));
      const p=projected.nearestPoint;
      const dxz=p?Math.hypot(p.x-raw.x,p.z-raw.z):Infinity;
      const deltaY=p?Math.abs(p.y-raw.y):Infinity;
      if(p){
       const previous=projectedPoints.at(-1);
       if(previous){
        maxProjectedAdjacentY=Math.max(maxProjectedAdjacentY,Math.abs(previous.y-p.y));
        maxProjectedAdjacent3d=Math.max(maxProjectedAdjacent3d,
         Math.hypot(previous.x-p.x,previous.y-p.y,previous.z-p.z));
       }
       projectedPoints.push({x:p.x,y:p.y,z:p.z});
       largestXZ=Math.max(largestXZ,dxz);
       liftedY=Math.max(liftedY,deltaY);}
      const valid=!!p&&dxz<=.03&&
       p.z*-1>=33&&p.y>=2.5&&p.y<=5.5&&
       origHit(p).supported;
      if(!valid){
       blocked++;
       const reason=!p?'NO_NATIVE_PROJECTION':
        dxz>.03?'NATIVE_NEAREST_XZ_OFF_CORRIDOR':
        p.z*-1<33?'OUTSIDE_ORIGINAL_SIDE':
        p.y<2.5||p.y>5.5?'OUTSIDE_ORIGINAL_Y':
        !origHit(p).solidId?'NO_ORIGINAL_RAPIER_SUPPORT':
        'PROJECTED_NAV_FOOT_ABOVE_OR_BELOW_REAL_SOLID';
       uniqueReasons[reason]=(uniqueReasons[reason]??0)+1;
       if(!firstDeniedAfterReprojection)
        firstDeniedAfterReprojection={leg,part:j,reason,raw,
         projected:p?{x:p.x,y:p.y,z:p.z}:null};
      }
     }
    }
    maxReprojectionMoveXZ=Math.max(maxReprojectionMoveXZ,largestXZ);
    maxInterpolationYAdjustment=Math.max(maxInterpolationYAdjustment,liftedY);
    const wouldPass=blocked===0;
    rawRejectedCount++;
    if(maxProjectedAdjacentY>.34)routesWithProjectedVerticalJumps++;
    let staticKcc:null|Record<string,unknown>=null;
    if(wouldPass){
     // Diagnostic-only 25-original-solid world and true CPU-size KCC.
     // The first projected point sets the capsule once; every following
     // step uses the previous PROJECTED point's desired 3D displacement.
     // The resulting capsule foot is accumulated, never reanchored.
     staticKccChecked++;
     const first=projectedPoints[0]!;
     const body=physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
       first.x,first.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,first.z));
     const collider=physics.world.createCollider(RAPIER.ColliderDesc.capsule(
      PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
     physics.step();
     const controller=createConfiguredPlayerCharacterController(physics.world);
     const current={x:first.x,y:first.y,z:first.z};
     let stepClips=0,maxClip=0,maxAccumulated=0,unsupportedFeet=0,
      contactSteps=0,maxRequestedStep=0;
     let firstDirectClip:null|{segment:number;from:P;to:P;
      originalStaticColliders:(string|null)[];clipMeters:number}=null;
     for(let m=1;m<projectedPoints.length;m++){
      const prev=projectedPoints[m-1]!,target=projectedPoints[m]!;
      const wanted={x:target.x-prev.x,y:target.y-prev.y,z:target.z-prev.z};
      maxRequestedStep=Math.max(maxRequestedStep,
       Math.hypot(wanted.x,wanted.y,wanted.z));
      controller.computeColliderMovement(collider,wanted,
       undefined,undefined,(other:RAPIER.Collider)=>
        other.handle!==collider.handle&&
        physics.shouldCharacterCollide(other,'HUMAN'));
      const moved=controller.computedMovement();
      const clip=Math.hypot(wanted.x-moved.x,wanted.y-moved.y,wanted.z-moved.z);
      if(clip>.03){
       stepClips++;
       if(!firstDirectClip){
        const solids:Array<string|null>=[];
        for(let collision=0;collision<controller.numComputedCollisions();collision++){
         const col=controller.computedCollision(collision)?.collider;
         if(col)solids.push(physics.sourceSolidIdForCollider(col));
        }
        firstDirectClip={segment:m,from:prev,to:target,
         originalStaticColliders:solids,clipMeters:r6(clip)};
       }
      }
      maxClip=Math.max(maxClip,clip);
      if(controller.numComputedCollisions()>0)contactSteps++;
      current.x+=moved.x;current.y+=moved.y;current.z+=moved.z;
      maxAccumulated=Math.max(maxAccumulated,Math.hypot(
       current.x-target.x,current.y-target.y,current.z-target.z));
      if(!origHit(current).supported)unsupportedFeet++;
      body.setTranslation({x:current.x,
       y:current.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
       z:current.z},true);
      physics.step();
     }
     const within=stepClips===0&&unsupportedFeet===0&&
      maxAccumulated<=.03&&maxProjectedAdjacentY<=.34;
     if(within)staticKccZeroClip++;else staticKccHeld++;
     staticKcc={testedSteps:projectedPoints.length-1,
      stepClipsOver3cm:stepClips,originalStaticContactSteps:contactSteps,
      unsupportedSimulatedFootSteps:unsupportedFeet,
      largestRequestedStepMeters:r6(maxRequestedStep),
      largestKccClipMeters:r6(maxClip),
      maxCumulativePositionDeviationMeters:r6(maxAccumulated),
      projectedAdjacentYJumpOver034m:maxProjectedAdjacentY>.34,
      isolatedStaticKccWithinDiagnosticThreshold:within,
      firstDirectOver3cmClip:firstDirectClip,
      intendedOneStepEquivalentCpuSpeedMps:r6(maxRequestedStep*60)};
     physics.world.removeCharacterController(controller);
     physics.world.removeRigidBody(body);
     physics.step();
     // B497-speed-control: re-run the SAME projected route in a new
     // isolated CPU capsule, now subdividing each spatial 0.30m sample
     // by the real CPU maximum speed at 60Hz. No real input / AI / actor.
     const microBody=physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
       first.x,first.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,first.z));
     const microCollider=physics.world.createCollider(RAPIER.ColliderDesc.capsule(
      PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),microBody);
     physics.step();
     const microKcc=createConfiguredPlayerCharacterController(physics.world);
     const place={x:first.x,y:first.y,z:first.z};
     const max60HzDisplacement=GAME_CONFIG.cpu.maxSpeedMetersPerSecond/60;
     let simulated60HzSteps=0,microClipsOver1cm=0,microClipsOver3cm=0,
      microStageContactSteps=0,microUnsupportedSteps=0,
      maxMicroAccumulated=0,maxMicroClip=0,maxMicroRequested=0;
     let firstMicroClip:null|{segment:number;substep:number;
      originalStaticColliders:(string|null)[];clipMeters:number}=null;
     for(let segment=1;segment<projectedPoints.length;segment++){
      const prev=projectedPoints[segment-1]!,next=projectedPoints[segment]!;
      const vx=next.x-prev.x,vy=next.y-prev.y,vz=next.z-prev.z;
      const steps=Math.max(1,Math.ceil(
       Math.hypot(vx,vy,vz)/max60HzDisplacement));
      const desired={x:vx/steps,y:vy/steps,z:vz/steps};
      for(let sub=1;sub<=steps;sub++){
       const magnitude=Math.hypot(desired.x,desired.y,desired.z);
       maxMicroRequested=Math.max(maxMicroRequested,magnitude);
       microKcc.computeColliderMovement(microCollider,desired,
        undefined,undefined,(other:RAPIER.Collider)=>
         other.handle!==microCollider.handle&&
         physics.shouldCharacterCollide(other,'HUMAN'));
       const moved=microKcc.computedMovement();
       const clip=Math.hypot(moved.x-desired.x,
        moved.y-desired.y,moved.z-desired.z);
       maxMicroClip=Math.max(maxMicroClip,clip);
       if(clip>.01)microClipsOver1cm++;
       if(clip>.03)microClipsOver3cm++;
       if(microKcc.numComputedCollisions()>0)microStageContactSteps++;
       if(clip>.01&&!firstMicroClip){
        const solids:Array<string|null>=[];
        for(let j=0;j<microKcc.numComputedCollisions();j++){
         const col=microKcc.computedCollision(j)?.collider;
         if(col)solids.push(physics.sourceSolidIdForCollider(col));
        }
        firstMicroClip={segment,substep:sub,
         originalStaticColliders:solids,clipMeters:r6(clip)};
       }
       place.x+=moved.x;place.y+=moved.y;place.z+=moved.z;
       const ideal={x:prev.x+vx*sub/steps,
        y:prev.y+vy*sub/steps,z:prev.z+vz*sub/steps};
       maxMicroAccumulated=Math.max(maxMicroAccumulated,Math.hypot(
        place.x-ideal.x,place.y-ideal.y,place.z-ideal.z));
       if(!origHit(place).supported)microUnsupportedSteps++;
       microBody.setTranslation({x:place.x,
        y:place.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
        z:place.z},true);
       physics.step();
       simulated60HzSteps++;
      }
     }
     const speedLimitedWithin=microClipsOver1cm===0&&
      microUnsupportedSteps===0&&maxMicroAccumulated<=.03;
     speedLimitedKccChecked++;
     if(speedLimitedWithin)speedLimitedKccWithin++;
     else speedLimitedKccHeld++;
     staticKcc.speedBounded60HzProbe={
      source:'same_genuine_projected_original_route',
      sourceCpuMaxSpeedMetersPerSecond:GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
      maxAllowedDeltaMetersPer60HzTick:r6(max60HzDisplacement),
      generatedQa60HzSubsteps:simulated60HzSteps,
      maxRequestedMicroStepMeters:r6(maxMicroRequested),
      microStepsWithKccClipOver1cm:microClipsOver1cm,
      microStepsWithKccClipOver3cm:microClipsOver3cm,
      microStepsWithStaticKccContact:microStageContactSteps,
      microStepsWithoutStrictOriginalFloorSupport:microUnsupportedSteps,
      maxIndividualMicroClipMeters:r6(maxMicroClip),
      maxAccumulatedMicroPathDeviationMeters:r6(maxMicroAccumulated),
      firstClip: firstMicroClip,
      withinQaOnlySpeedBoundedTolerance:speedLimitedWithin,
      thisIsNotCpuAiSteeringOrDynamic7CpuSimulation:true};
     physics.world.removeCharacterController(microKcc);
     physics.world.removeRigidBody(microBody);
     physics.step();
    }
    const missed=firstDeniedAfterReprojection;
    const deniedPoint=missed?.projected;
    const deniedHit=deniedPoint?physics.castStageSegment(
     new Vec3(deniedPoint.x,deniedPoint.y+.65,deniedPoint.z),
     new Vec3(deniedPoint.x,deniedPoint.y-.65,deniedPoint.z),
     'ink-projectile'):null;
    const detail={id,goalIndex:k,originalGoal:evidence.originalGoal,
     originalRecastPathPointCount:route.pointCount,
     resampledPathPointCount:tested,
     projectedRaySupportPass:wouldPass,
     projectedUnsupportedSampleCount:blocked,
     firstUnsupportedProjection:missed?{...missed,
      originalRapierSolidId:deniedHit?.solidId??null,
      originalRapierFloorY:deniedHit?r6(deniedHit.point.y):null,
      verticalDifferenceProjectedNavToOriginalFloor:deniedHit&&deniedPoint?
       r6(deniedPoint.y-deniedHit.point.y):null}:null,
     maxOriginalInterpolatedYToProjectedNavY:r6(liftedY),
     maxAdjacentProjectedNavYChangeMeters:r6(maxProjectedAdjacentY),
     maxAdjacentProjected3dStepMeters:r6(maxProjectedAdjacent3d),
     staticKcc};
    allSixtyRoutes.push(detail);
    if(!wouldPass)tenUnresolved.push(detail);
    if(wouldPass){thisActorRecovered++;reprojectedPotential++;}
    else{thisActorHeld++;stillUnsupported++;}
    if(!c||!firstSupported)pathWithoutOriginalSubstitute++;
    if(selectedFailures.length<12){
     selectedFailures.push({id,goal:k,originalFirstGap:
      r6(evidence.firstDenied.verticalGapMeters),
      firstPointProjectedXZ: c?r6(firstXZ):null,
      firstPointProjectedFloorGap:c?r6(origHit(c).gap??Infinity):null,
      firstPointProjectedSupport:firstSupported,
      originalFirstPathY:r6(firstP.y),
      firstProjectedNavY:c?r6(c.y):null,
      originalPathSamplesChecked:tested,
      projectedUnsupportedSampleCount:blocked,
      wouldPassRayOnlyAfterReprojecting:wouldPass,
      firstDeniedAfterReprojection});
    }
   }
   byActor[id]={originalCapturePhaseOffsetMeters:r6(originalCapturePhaseOffset),
    originalTrueRejectedRoutes:failureRows.length,
    actualFirstDenialsReproduced:failureRows.length,
    firstDeniedRecastReprojectedSupported:firstOriginalPointReprojected,
    counterfactualProjectedAllRaySamplesPass:thisActorRecovered,
    counterfactualProjectedSamplesStillFail:thisActorHeld,
    sampledPathPointsAcrossAllRoutes:allActualSampled,
    worstProjectedSnapXZ:r6(maxReprojectionMoveXZ),
    largestOriginalYVsProjectedY:r6(maxInterpolationYAdjustment),
    projectedRefusalCauses:uniqueReasons};
  }
  const report={schema:'B496_TRUE_B450_REJECTED_ORIGINAL_ROUTE_Y_REPROJECTION_V1',
   originalSource:'25/17/26/0',sourceEvidenceRunId:43140584988,
   originalTrueRejectedRouteCount:rawRejectedCount,
   allSixtyOriginalRouteDiagnostics:allSixtyRoutes,
   tenUnresolvedOriginalRoutes:tenUnresolved,
   totalIsolatedStaticKccPathsTested:staticKccChecked,
   staticKccWithinDiagnosticThreshold:staticKccZeroClip,
   staticKccHeld:staticKccHeld,
   speedLimitedKccPathsDiagnosed:speedLimitedKccChecked,
   speedLimitedKccWithinQaOnlyThreshold:speedLimitedKccWithin,
   speedLimitedKccHeld:speedLimitedKccHeld,
   sourceCpuSpeedMetersPerSecond:GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
   maxSpatialDisplacementFor60HzDiagnosticMeters:r6(
    GAME_CONFIG.cpu.maxSpeedMetersPerSecond/60),
   pathsWithAdjacentProjectedYChangeOver034m:routesWithProjectedVerticalJumps,
   staticKccWorldContainsOtherRealCpuAndHuman:false,
   anyOriginalRouteAuthorityPromoted:false,
   originalRejectionFirstSamplesReproduced:firstPointMatches,
   firstDeniedPointStillUnsupportedAfterProjection:
    pathWithoutOriginalSubstitute,
   counterfactualFullPathRayPasses:reprojectedPotential,
   counterfactualFullPathRayHeld:stillUnsupported,
   actors:byActor,firstTwelveRouteClassifications:selectedFailures,
   strictOriginal025mAuthorizationUnchanged:true,
   nativePathInterpolatedYNeverReplacedInGame:true,
   originalStageOrRecastNavigationChanged:false,
   originalScoreableCellsAdded:0,
   originalCrossTeamRoutesAuthorized:0,
   originalFullSevenCpuCapsuleRouteCertified:false,
   original72CollisionSemanticsCertified:false,
   verdict:'B497_ORIGINAL_TEN_SOURCE_FAILURES_AND_FIFTY_STATIC_KCC_DIAGNOSTIC_HOLD'};
  expect(rawRejectedCount).toBe(60);
  expect(firstPointMatches).toBe(60);
  expect(tenUnresolved).toHaveLength(10);
  expect(staticKccChecked).toBe(50);
  expect(staticKccZeroClip+staticKccHeld).toBe(50);
  expect(speedLimitedKccChecked).toBe(50);
  expect(speedLimitedKccWithin+speedLimitedKccHeld).toBe(50);
  expect(reprojectedPotential+stillUnsupported).toBe(60);
  if(process.env.T21_B497_REPORT_PATH)
   writeFileSync(process.env.T21_B497_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B496_NATIVE_TRUE_REJECTION_Y_DIFFERENTIAL',
   JSON.stringify({schema:report.schema,firstPointMatches,
    tenUnresolved:tenUnresolved.map(x=>({
     id:(x as {id:string}).id,goalIndex:(x as {goalIndex:number}).goalIndex,
     firstFailure:(x as {firstUnsupportedProjection:unknown}).firstUnsupportedProjection
    })),
    staticKccChecked,staticKccZeroClip,staticKccHeld,
    speedLimitedKccChecked,speedLimitedKccWithin,speedLimitedKccHeld,
    routesWithProjectedVerticalJumps,
    firstPointStillUnsupported:pathWithoutOriginalSubstitute,
    wouldPassRayOnly:reprojectedPotential,
    stillUnsupported,actors:byActor,verdict:report.verdict}));
 });
});
