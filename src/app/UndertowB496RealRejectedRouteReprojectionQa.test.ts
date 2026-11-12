import {Vec3} from 'playcanvas';
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
import {b450FirstSourceDenial} from './B450OriginalRouteWitness';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';

type P=Readonly<{x:number;y:number;z:number}>;
const ids=['B2','B4'] as const;
const foot=(a:readonly number[])=>new Vec3(a[0]!,a[1]!,a[2]!);
const r6=(v:number)=>Number(v.toFixed(6));
const source=process.env.T21_B496_EVIDENCE_DIR;
beforeAll(async()=>Promise.all([initializeRapier(),initializeRecastNavigation()]));
describe('B496 pinned original B450: 60 actual path denials and Recast-reprojected 0.30m support',()=>{
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
      if(p){largestXZ=Math.max(largestXZ,dxz);
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
   verdict:'REPROJECTED_NAV_RAY_DIFFERENTIAL_ONLY_NOT_KCC_OR_ROUTE_AUTHORITY'};
  expect(rawRejectedCount).toBe(60);
  expect(firstPointMatches).toBe(60);
  expect(reprojectedPotential+stillUnsupported).toBe(60);
  if(process.env.T21_B496_REPORT_PATH)
   writeFileSync(process.env.T21_B496_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B496_NATIVE_TRUE_REJECTION_Y_DIFFERENTIAL',
   JSON.stringify({schema:report.schema,firstPointMatches,
    firstPointStillUnsupported:pathWithoutOriginalSubstitute,
    wouldPassRayOnly:reprojectedPotential,
    stillUnsupported,actors:byActor,verdict:report.verdict}));
 });
});
