import {Vec3} from 'playcanvas';
import RAPIER from '@dimforge/rapier3d-compat';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController}
 from '../player/PlayerCharacterPhysics';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {beforeAll,describe,expect,it} from 'vitest';
// @ts-ignore Node fixture I/O for isolated CI-only diagnostic
import {readFileSync,writeFileSync} from 'node:fs';
declare const process:{env:Record<string,string|undefined>};
import {PerformanceStats} from '../core/PerformanceStats';
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../navigation/RecastStageNavigation';
import {b218OriginalRouteFaceChainSeams,b218OriginalTriangleMeshSeparation}
 from './B218OriginalRouteFaceChainSeams';
import {rasterizeStageFootprint} from '../stage/StageFootprint';
import {stageSolidCollisionEnabled,stageSolidNavigationEnabled,
 type StageSolidDefinition,type StageTriangleMeshGeometry,
 type StageVector3} from '../stage/StageDefinition';
import {b220SourceTriangleCentroidWitness}
 from './B220OriginalNativeRecastSeamProbe';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT as SOURCE,
 undertowUnderpassRouteStageSolids}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT as ARCHIVE,
 undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {SurfaceFlags} from '../ink/types';

const finite=(n:number)=>Number.isFinite(n)?Number(n.toFixed(6)):null;
const sideOf=(id:string)=>id.endsWith('-negative-z')?'NEGATIVE_Z':'POSITIVE_Z';
type P=readonly [number,number,number];
const vec=(p:P)=>new Vec3(p[0],p[1],p[2]);
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});

describe('B499 genuine CURRENT 25-solid original Recast/Rapier for all 8 CI688 source seams',()=>{
 it('counts 42 original source face projections and 8 real native seam routes without confusing archive gap identities',()=>{
  const stage=undertowT21dConnectivityQaStage();
  expect(stage.metadata.id).toBe('undertow-t21d-partial-connectivity-qa');
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(stage.paintSurfaces.every(s=>(s.flags&SurfaceFlags.Scoreable)===0))
   .toBe(true);
  const legacy=ARCHIVE.sourceNativeRouteGapAudit;
  expect([legacy.localGapCountTotal,legacy.localGapCountPerSide,
   legacy.strictBridgesAfterFloorLineAndFenceOverlayRemoval])
   .toEqual([8,4,0]);
  expect(legacy.runtimePromotionAuthorized).toBe(false);
  expect(SOURCE.experimentalRuntimeInclusionReachedTarget).toBe(false);
  expect(SOURCE.runtimePromotionAuthorized).toBe(false);
  expect(FACES).toHaveLength(10);
  const distinctSource=new Set(FACES.map(x=>x.id));
  expect(distinctSource.size).toBe(10);
  const activeIds=new Set(stage.solids.map(s=>s.id));
  expect(FACES.every(x=>!activeIds.has('UndertowT21D:'+x.id))).toBe(true);
  const separation=b218OriginalRouteFaceChainSeams();
  expect(separation.adjacentSeams).toBe(8);
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const observe=(p:P)=>{
   const closest=nav.auditNavMeshProjection(vec(p));
   const nearest=closest.nearestPoint;
   const hit=physics.castStageSegment(
    new Vec3(p[0],p[1]+1.2,p[2]),
    new Vec3(p[0],p[1]-1.2,p[2]),'ink-projectile');
   const floor=hit?Math.abs(hit.point.y-p[1]):null;
   return {
    sourcePoint:p,
    nearestNavPoint:nearest?
     [finite(nearest.x),finite(nearest.y),finite(nearest.z)]:null,
    nativeNavProjectionDistanceMeters:finite(closest.distanceMeters??Infinity),
    nativeNav3dProximityWithin035m:
     closest.success&&closest.distanceMeters!==null&&
     closest.distanceMeters<=.35,
    registeredExistingRapierSolidId:hit?.solidId??null,
    registeredFloorY:hit?finite(hit.point.y):null,
    requestedFaceToExistingFloorGapMeters:floor===null?null:finite(floor),
    existingRapierFloorWithin025m:floor!==null&&floor<=.25,
    exactSourceComponentColliderCertified:false
   };
  };
  const originalFaceSamples:Array<Record<string,unknown>>=[];
  const summaries:Record<string,unknown>={};
  for(const face of FACES){
   const mesh=face.mesh;
   let nearby=0,registered=0,within025=0;
   for(let i=0;i<mesh.indices.length;i+=3){
    const a=mesh.vertices[mesh.indices[i]!]!,
     b=mesh.vertices[mesh.indices[i+1]!]!,
     c=mesh.vertices[mesh.indices[i+2]!]!;
    expect([a,b,c].flat().every(Number.isFinite)).toBe(true);
    const centroid:P=[(a[0]+b[0]+c[0])/3,
     (a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    const witness=observe(centroid);
    if(witness.nativeNav3dProximityWithin035m)nearby++;
    if(witness.registeredExistingRapierSolidId)registered++;
    if(witness.existingRapierFloorWithin025m)within025++;
    originalFaceSamples.push({
     sourceComponentId:face.id,sourceOBJ:face.sourceObject,
     sourceMaterial:face.sourceMaterial,side:face.side,
     faceLocalIndex:i/3,
     // Exact ORIGINAL triangle coordinates, not a guessed collision,
     // enable future LOCAL-only comparison to version-matched Phive OBJ.
     sourceTriangleVertices:[a,b,c],...witness
    });
   }
   summaries[face.id]={side:face.side,sourceOBJ:face.sourceObject,
    sourceMaterial:face.sourceMaterial,
    genuineSourceTriangleCount:mesh.indices.length/3,
    nativeNearNavProjectionCentroidsWithin035m:nearby,
    existingRapierRayHitsAtSourceCentroids:registered,
    registeredRapierFloorWithin025mOfSourceCentroids:within025,
    sourceComponentItselfRegisteredForCollision:false
   };
  }
  expect(originalFaceSamples).toHaveLength(42);
  const actualSeams=separation.seams.map((seam,i)=>{
   const left=FACES.find(x=>x.id===seam.from)!;
   const right=FACES.find(x=>x.id===seam.to)!;
   expect(left).toBeDefined();expect(right).toBeDefined();
   expect(sideOf(seam.from)).toBe(seam.side);
   expect(left.side).toBe(right.side);
   const sample=b220SourceTriangleCentroidWitness(left.mesh,right.mesh);
   const first=vec(sample.from),last=vec(sample.to);
   const path=nav.auditPath(first,last,.35);
   const from=observe(sample.from),to=observe(sample.to);
   const credible=path.reachedTarget&&
    path.startSnapDistanceMeters<=.20&&
    path.endSnapDistanceMeters<=.20&&
    path.pointCount>0;
   // Even a true native Recast path cannot establish source-collider
   // authority or a 7.2.0 collision face / KCC; diagnostic only.
   return {
    pairIndex:i,side:seam.side,
    sourceFaceFrom:seam.from,sourceFaceTo:seam.to,
    sourceOBJFrom:left.sourceObject,sourceOBJTo:right.sourceObject,
    sourceMaterialFrom:left.sourceMaterial,
    sourceMaterialTo:right.sourceMaterial,
    exactOriginalTriangleSeparationMeters:seam.gapMeters,
    strictOriginalSeamGapOver030m:seam.gapMeters>.30,
    sourceGraphComponentIds:seam.priorGraphComponents,
    sourceCentroidSeparationMeters:finite(sample.distanceMeters),
    fromOriginalTriangleLocalIndex:sample.fromFaceIndex,
    toOriginalTriangleLocalIndex:sample.toFaceIndex,
    registeredExistingStageSourceFaceColliderCount:0,
    centroidProjections:[from,to],
    genuineRecastAuditPath:{
     querySuccess:path.querySuccess,
     reachedOriginalCentroid:path.reachedTarget,
     startSnapMeters:finite(path.startSnapDistanceMeters),
     endSnapMeters:finite(path.endSnapDistanceMeters),
     reportedPathPoints:path.pointCount,
     endpointErrorMeters:finite(path.endpointErrorMeters),
     credibleProjectedEndpoints:credible
    },
    original7_2TurfCollisionAuthority:false,
    fullCapsuleContinuousSeamTraversalCertified:false,
    crossingPermissionGranted:false
   };
  });
  expect(actualSeams).toHaveLength(8);
  expect(actualSeams.filter(x=>x.side==='POSITIVE_Z')).toHaveLength(4);
  expect(actualSeams.filter(x=>x.side==='NEGATIVE_Z')).toHaveLength(4);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const a=actualSeams.filter(x=>x.side===side);
   expect(a.map(x=>x.exactOriginalTriangleSeparationMeters))
    .toEqual([.17,2.074235,.518559,.518559]);
  }
  const report={
   schema:'B499_REAL_8_CI688_FACE_SEAMS_CURRENT_RECAST_RAPIER_V1',
   originalSource:'25/17/26/0',
   sourceTriangleAuthority:'CI688_EXACT_TEMPLE01_SOURCE_EXPORT',
   previousCi691FiveComponentsPerSideNativeReach:false,
   oldPass18AggregateGaps:8,
   currentCi688ExactSourceFaceSeams:8,
   archivedPass18GapIdsMappedToCi688SourceFacePairs:false,
   oldAggregateAndExactEightSamePhysicalLocationsCertified:false,
   originalSourceFaceComponents:10,
   originalSourceTriangles:42,
   currentRegisteredSourceComponentsFromTheseTen:0,
   sourceFaceCentroidSamples:originalFaceSamples,
   sourceComponentSummaries:summaries,
   realNativeSeamRecastQueries:8,
   originalRapierStageRayQueries:58,
   seamDetails:actualSeams,
   originalStageSolids:25,originalPaintSurfaces:17,
   originalNavLinks:26,originalScoreable:0,
   nativeCrossTeamTraversalCertified:false,
   sourceCollisionFaceFor7_2TurfCertified:false,
   fullOriginalCpuKccCrossingCertified:false,
   newFloorOrNavLinkAdded:0,
   geometryNavPaintAuthorityWrites:0,
   verdict:'REAL_SOURCE_TRIANGLES_VS_CURRENT_STAGE_DIAGNOSTIC_HOLD'
  };
  if(process.env.T21_B499_REPORT_PATH)
   writeFileSync(process.env.T21_B499_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B499_REAL_ORIGINAL_8_SEAM_SOURCE_NATIVE_RECAST_RAPIER',
   JSON.stringify({
    schema:report.schema,
    sourceFaces:report.originalSourceTriangles,
    originalSeamQueries:actualSeams.length,
    separations:actualSeams.map(s=>s.exactOriginalTriangleSeparationMeters),
    componentSummaries:summaries,
    seams:actualSeams.map(s=>({
     side:s.side,from:s.sourceFaceFrom,to:s.sourceFaceTo,
     gap:s.exactOriginalTriangleSeparationMeters,
     path:s.genuineRecastAuditPath,
     centroids:s.centroidProjections
    })),
    verdict:report.verdict
   }));
 });


 it('locates BOTH actual registered-floor endcaps for the original ten-piece F4 underpass before any collision import',()=>{
  const stage=undertowT21dConnectivityQaStage();
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(stage.paintSurfaces.every(x=>
   (x.flags&SurfaceFlags.Scoreable)===0)).toBe(true);
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  // The existing StageFootprint raster is the SAME active mask from which
  // the current physical slab geometry is built. Do not fill its holes
  // with speculative bridge triangles or use an approximate bbox.
  const registeredFlatTop=(s:StageSolidDefinition):StageTriangleMeshGeometry=>{
   if(!s.footprint||!stageSolidCollisionEnabled(s)||
      !stageSolidNavigationEnabled(s))
    throw Error('B500_REGISTERED_SOURCE_FLAT_FOOTPRINT_REQUIRED');
   const polygons=rasterizeStageFootprint(
    s.size[0],s.size[2],s.footprint).rectangles;
   const v:StageVector3[]=[],indices:number[]=[];
   const xbase=s.center[0]-s.size[0]/2;
   const zbase=s.center[2]-s.size[2]/2;
   const y=s.center[1]+s.size[1]/2;
   for(const p of polygons){
    const x0=xbase+p.minU,x1=xbase+p.maxU,
     z0=zbase+p.minV,z1=zbase+p.maxV;
    const begin=v.length;
    v.push([x0,y,z0],[x1,y,z0],[x0,y,z1],[x1,y,z1]);
    indices.push(begin,begin+1,begin+2,begin+1,begin+3,begin+2);
   }
   if(v.length===0)throw Error('B500_EMPTY_REGISTERED_FLOOR');
   return {vertices:v,indices};
  };
  const records=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
   const suffix=side==='POSITIVE_Z'?'positive-z':'negative-z';
   const first=FACES.find(f=>
    f.id==='underpass-route-slope01-'+suffix&&f.side===side);
   const last=FACES.find(f=>
    f.id==='underpass-route-slope00-inner-'+suffix&&f.side===side);
   const entry=stage.solids.find(s=>
    s.id==='UndertowT21D:right-low-route-ramp-'+suffix);
   const exit=stage.solids.find(s=>
    s.id==='UndertowT21D:glass-underpass-'+suffix);
   expect(first).toBeDefined();expect(last).toBeDefined();
   expect(entry?.triangleMesh).toBeDefined();
   expect(exit?.footprint).toBeDefined();
   expect(entry?.center).toEqual([0,0,0]);
   // Read-only current original-solid geometry; no collision/Nav mutations.
   const entryGap=b218OriginalTriangleMeshSeparation(
    first!.mesh,entry!.triangleMesh!);
   const exitRegisteredTop=registeredFlatTop(exit!);
   const exitGap=b218OriginalTriangleMeshSeparation(
    last!.mesh,exitRegisteredTop);
   const centroid=(mesh:StageTriangleMeshGeometry)=>{
    const i=mesh.indices;
    const a=mesh.vertices[i[0]!]!,b=mesh.vertices[i[1]!]!,
     c=mesh.vertices[i[2]!]!;
    return new Vec3(...([0,1,2].map(k=>
     (a[k]!+b[k]!+c[k]!)/3) as [number,number,number]));
   };
   const endProbe=(mesh:StageTriangleMeshGeometry)=>{
    const point=centroid(mesh);
    const navPoint=nav.auditNavMeshProjection(point);
    const hit=physics.castStageSegment(
     new Vec3(point.x,point.y+1.2,point.z),
     new Vec3(point.x,point.y-1.2,point.z),'ink-projectile');
    return {exactSourceCentroid:[point.x,point.y,point.z],
     nativeNearestProjectionMeters:Number.isFinite(
      navPoint.distanceMeters)?navPoint.distanceMeters:null,
     registeredRapierHitSolidId:hit?.solidId??null,
     rapierYGapMeters:hit?Math.abs(hit.point.y-point.y):null,
     sourceColliderItselfRegistered:false};
   };
   expect(Number.isFinite(entryGap)&&entryGap>=0).toBe(true);
   expect(Number.isFinite(exitGap)&&exitGap>=0).toBe(true);
   return {side,originalSourceEntryFace:first!.id,
    originalSourceExitFace:last!.id,
    actualRegisteredEntrySolid:entry!.id,
    actualRegisteredExitSolid:exit!.id,
    entryExactSourceToCurrentPhysicalRampGapMeters:
     Number(entryGap.toFixed(6)),
    exitExactSourceToCurrentPhysicalUnderpassGapMeters:
     Number(exitGap.toFixed(6)),
    exitRegisteredTopTriangles:exitRegisteredTop.indices.length/3,
    entryOriginalCentroidProbe:endProbe(first!.mesh),
    exitOriginalCentroidProbe:endProbe(last!.mesh),
    originalTurfCollisionFlagsProven:false,
    continuousHumanOrCpuKccProven:false,
    originalOpponentRouteAuthorized:false};
  });
  const evidence={
   schema:'T21_V28_F4_B500_TRUE_ORIGINAL_UNDERPASS_ENTRY_EXIT_ENDCAPS',
   source:'25/17/26/0',sourceFaces:10,sourceTriangles:42,
   sides:records,originalStageGeometryWrites:0,
   appendedStageSolids:0,appendedNavLinks:0,scoreable:0,
   original72TurfCollisionAuthorityVerified:false,
   naturalOpposingPathCertified:false,
   verdict:'HOLD_MISSING_7_2_TURF_COLLISION_AND_CONTINUOUS_ROUTE'
  };
  console.log('T21_V28_F4_B500_PHYSICAL_REGISTERED_ENDCAP_GAPS',
   JSON.stringify(evidence));
  expect(stage.solids).toHaveLength(25);
 });

/** F4: real Rapier/production-size HUMAN KCC, eight original CI688
 * triangle seam pairs. This ISOLATED world is deliberately 35 = 25+10
 * solids and is never used as the playable original stage. The ten extra
 * collider faces are unverified for 7.2.0 Turf, and no result can promote
 * runtime collision, nav, paint, scoring, teleport, or formal 4v4.
 * Each route is a fresh 60Hz capsule that starts once at a true source
 * triangle centroid and advances only by bounded KCC translation.
 * A straight centroid-to-centroid trial is not a global path search;
 * failure cannot prove every possible traversable route is impossible. */
 it('actually walks 8 source-exact seams in isolated 60Hz HUMAN capsule and reports first lost support',()=>{
  const original=undertowT21dConnectivityQaStage();
  expect([original.solids.length,original.paintSurfaces.length,
    original.navigationLinks?.length]).toEqual([25,17,26]);
  expect(original.paintSurfaces.every(x=>!x.flags||
    (x.flags&SurfaceFlags.Scoreable)===0)).toBe(true);
  const sourceFaces=undertowUnderpassRouteStageSolids().map(face=>({
   ...face,render:false,navigationEnabled:false
  }));
  expect(sourceFaces).toHaveLength(10);
  expect(sourceFaces.reduce((n,f)=>n+(f.triangleMesh?.indices.length??0)/3,0))
   .toBe(42);
  const isolated={...original,solids:[...original.solids,...sourceFaces]};
  const physics=new RapierStagePhysics(1/60,isolated);
  physics.step();
  const p=PLAYER_CHARACTER_PHYSICS;
  const footSupport=(body:{x:number;y:number;z:number})=>{
   const at=new Vec3(body.x,body.y,body.z);
   const hit=physics.castCharacterFootSupport(at,p.humanFootOffsetMeters,'HUMAN');
   const gap=hit?body.y-p.humanFootOffsetMeters-hit.point.y:null;
   return {id:hit?.solidId??null,gap,
    valid:!!hit&&gap!==null&&Math.abs(gap)<=.12};
  };
  const results:Array<Record<string,unknown>>=[];
  const seams=b218OriginalRouteFaceChainSeams().seams;
  for(const seam of seams){
   const a=FACES.find(face=>face.id===seam.from)!;
   const b=FACES.find(face=>face.id===seam.to)!;
   const witness=b220SourceTriangleCentroidWitness(a.mesh,b.mesh);
   // One initial setup only; do not reseed to target or closest Recast poly.
   const source=witness.from,target=witness.to;
   const body=physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
     source[0],source[1]+p.humanFootOffsetMeters+.05,source[2]));
   const collider=physics.world.createCollider(
    RAPIER.ColliderDesc.capsule(p.humanHalfHeightMeters,p.humanRadiusMeters),
    body);
   const kcc=createConfiguredPlayerCharacterController(physics.world);
   physics.step();
   const initial=footSupport(body.translation());
   const firstSupported=initial.valid;
   let verticalVelocity=0,steps=0,unsupported=0,unsupportedRun=0,
    maxUnsupportedRun=0,maxActualFallMeters=0,stageContacts=0,
    reached=false,lastFootSolid=initial.id;
   let firstMissing:null|{step:number;x:number;y:number;z:number;
    supportId:string|null;gap:number|null}=null;
   let firstSupportSwitch:null|{step:number;from:string|null;to:string|null}=null;
   for(let tick=0;tick<240;tick++){
    const now=body.translation();
    const footY=now.y-p.humanFootOffsetMeters;
    const dx=target[0]-now.x,dz=target[2]-now.z;
    const remaining=Math.hypot(dx,dz);
    const dt=1/60;
    // Same actual player HUMAN speed / gravity / KCC, with a fixed
    // straight-line input. No synthetic up-force, jump, snapping actor
    // to an imagined surface, or automatic recovery after falling.
    const length=Math.min(
     remaining,GAME_CONFIG.player.humanSpeedMetersPerSecond*dt);
    verticalVelocity=Math.max(
     -GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
     verticalVelocity-GAME_CONFIG.player.gravityMetersPerSecond2*dt);
    kcc.computeColliderMovement(collider,{
      x:remaining>1e-8?dx/remaining*length:0,
      y:verticalVelocity*dt,
      z:remaining>1e-8?dz/remaining*length:0
     },undefined,undefined,(other:RAPIER.Collider)=>
      other.handle!==collider.handle&&
      physics.shouldCharacterCollide(other,'HUMAN'));
    const displacement=kcc.computedMovement();
    if(kcc.numComputedCollisions()>0)stageContacts++;
    if(kcc.computedGrounded()&&verticalVelocity<0)
     verticalVelocity=-.5;
    body.setNextKinematicTranslation({
     x:now.x+displacement.x,
     y:now.y+displacement.y,
     z:now.z+displacement.z
    });
    physics.step();
    const moved=body.translation();
    const support=footSupport(moved);
    steps++;
    if(support.id!==lastFootSolid&&!firstSupportSwitch)
     firstSupportSwitch={step:steps,from:lastFootSolid,to:support.id};
    lastFootSolid=support.id;
    if(!support.valid){
     unsupported++;unsupportedRun++;
     maxUnsupportedRun=Math.max(maxUnsupportedRun,unsupportedRun);
     if(!firstMissing)firstMissing={
      step:steps,x:Number(moved.x.toFixed(3)),
      y:Number((moved.y-p.humanFootOffsetMeters).toFixed(3)),
      z:Number(moved.z.toFixed(3)),supportId:support.id,
      gap:support.gap===null?null:Number(support.gap.toFixed(3))
     };
    }else unsupportedRun=0;
    maxActualFallMeters=Math.max(maxActualFallMeters,source[1]-(
     moved.y-p.humanFootOffsetMeters));
    const horizontalRemaining=Math.hypot(target[0]-moved.x,target[2]-moved.z);
    if(horizontalRemaining<=.30&&support.valid&&
       Math.abs((moved.y-p.humanFootOffsetMeters)-target[1])<=.25){
     reached=true;break;
    }
    // A lost footing already >4m below the source is not a recoverable
    // continuous walk by this no-jump player trial.
    if(moved.y-p.humanFootOffsetMeters<Math.min(source[1],target[1])-4)
     break;
   }
   const end=body.translation();
   results.push({side:seam.side,from:seam.from,to:seam.to,
    exactOriginalSourceSeparationMeters:seam.gapMeters,
    centroidSeparationMeters:Number(witness.distanceMeters.toFixed(3)),
    initialRegisteredSupport:initial.id,initialSupportValid:firstSupported,
    bounded60HzSteps:steps,
    originalStageCollisionContacts:stageContacts,
    unsupportedSteps:unsupported,
    maximumUnsupportedConsecutiveSteps:maxUnsupportedRun,
    maxFootFallBelowStartMeters:Number(maxActualFallMeters.toFixed(3)),
    firstLostPhysicalFloor:firstMissing,
    firstPhysicalSupportChange:firstSupportSwitch,
    reachedEndWithRealFootSupport:reached,
    endHorizontalErrorMeters:Number(Math.hypot(
     target[0]-end.x,target[2]-end.z).toFixed(3)),
    originalTurfCollisionCertified:false,
    naturalOpponentRouteCertified:false
   });
   physics.world.removeCharacterController(kcc);
   physics.world.removeRigidBody(body);
   physics.step();
  }
  expect(results).toHaveLength(8);
  expect(results.filter(r=>r.side==='POSITIVE_Z')).toHaveLength(4);
  expect(results.filter(r=>r.side==='NEGATIVE_Z')).toHaveLength(4);
  expect(results.every(r=>Number.isFinite(r.endHorizontalErrorMeters)))
   .toBe(true);
  expect(original.solids).toHaveLength(25);
  expect(original.paintSurfaces).toHaveLength(17);
  expect(original.navigationLinks).toHaveLength(26);
  // Existing B499 artifact is produced by the first genuine-source
  // test. Add the ISOLATED 60Hz KCC measurements to that same report
  // rather than claiming the baseline original stage gained colliders.
  if(process.env.T21_B499_REPORT_PATH){
   const path=process.env.T21_B499_REPORT_PATH;
   const prior=JSON.parse(readFileSync(path,'utf8')) as
    {schema:string;originalSource:string;originalSourceTriangles:number;
     newFloorOrNavLinkAdded:number;nativeCrossTeamTraversalCertified:boolean};
   if(prior.schema!=='B499_REAL_8_CI688_FACE_SEAMS_CURRENT_RECAST_RAPIER_V1'||
      prior.originalSource!=='25/17/26/0'||
      prior.originalSourceTriangles!==42||
      prior.newFloorOrNavLinkAdded!==0||
      prior.nativeCrossTeamTraversalCertified!==false)
    throw Error('F4_ISOLATED_KCC_REPORT_BASELINE_DRIFT');
   writeFileSync(path,JSON.stringify({...prior,
    isolatedOriginalFaceHumanKcc:{
     sampleKind:'STRAIGHT_CENTROID_PAIRS_NOT_GLOBAL_NAVIGATION',
     geometry:'EXACT_CI688_10_TRIMESH_FACES_ISOLATED_ONLY',
     testHz:60,sourceTriangles:42,sourceSeams:8,
     formalOriginalStageChanged:false,
     originalTurfCollisionCertified:false,
     humanNaturalCrossingCertified:false,
     results
    }},null,2)+'\n');
  }
  console.log('F4_EXACT_CI688_EIGHT_SEAM_GENUINE_CAPSULE_KCC_ISOLATED',
   JSON.stringify({
    stage:'ISOLATED_35_SOLIDS_17_PAINT_26_NAVLINKS_ZERO_SCOREABLE',
    originalPlayableSource:'25/17/26/0',
    measuredSourceTriangles:42,simulatedRoutes:results.length,
    testsAreStraightLineNotVerifiedGlobalRoutes:true,
    gameplaySourceWrites:0,additionalRuntimeColliders:0,
    productionPermission:false,originalTurfCollisionCertified:false,
    original4v4Certified:false,rows:results
   }));
 },20000);

});
