/**
 * B236 original slope01 upper/lower interface audit. Uses B235 real
 * recorded CPU Recast end point (native endpoint grounded on right-low).
 * No invented ramp, new collision, fake link, script pose move.
 */
import {beforeAll,describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {initializeRapier,RapierStagePhysics}
 from '../src/physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../src/navigation/RecastStageNavigation';
import {PLAYER_CHARACTER_PHYSICS as P}
 from '../src/player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {b235ExactSourceSideQaStage}
 from '../src/stage/undertow/B235ExactOriginalSourceEntryQa';
import {b236InspectOriginalSlopeEntrance}
 from '../src/stage/undertow/B236OriginalSlope01IngressAudit';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageVector3}
 from '../src/stage/StageDefinition';

const rightLowTerminal={
 POSITIVE_Z:[5.604740142822266,4.599999904632568,35.83282470703125],
 NEGATIVE_Z:[-5.375261306762695,4.599999904632568,-35.627174377441406]
} as const;
const toVec=(p:readonly[number,number,number])=>new Vec3(...p);
const foot=(world:RapierStagePhysics,v:Vec3)=>{
 const hit=world.castCharacterFootSupport(
  new Vec3(v.x,v.y+P.humanFootOffsetMeters+.06,v.z),
  P.humanFootOffsetMeters,'HUMAN');
 return {id:hit?.solidId??null,surfaceY:hit?.point.y??null,
  heightMismatch:hit?Math.abs(hit.point.y-v.y):null};
};
const originalStage:StageDefinition={
 metadata:{id:'b236-immutable-original25',displayName:'Frozen base F3',
  worldBounds:FROZEN.worldBounds,teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
  teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
  tacticalNodes:[],splatZones:[]},
 solids:FROZEN.solids,paintSurfaces:FROZEN.paintSurfaces,
 navigationLinks:FROZEN.navigationLinks
};
function sourcePoint(x:number,y:number,z:number,side:'POSITIVE_Z'|'NEGATIVE_Z'):Vec3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return new Vec3(px,y-3,pz);
}
beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B236 original high-to-low source ingress geometry and native Recast/Rapier',()=>{
 it('locates exact slope01 upper lip relative to actual right-low CPU Recast terminal',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  const baselineNav=new RecastStageNavigation(originalStage,new PerformanceStats());
  const baselinePhysics=new RapierStagePhysics(1/60,originalStage);
  baselinePhysics.step();
  const result=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const qa=b235ExactSourceSideQaStage(side);
   const nav=new RecastStageNavigation(qa,new PerformanceStats());
   const physics=new RapierStagePhysics(1/60,qa);physics.step();
   const source=b236InspectOriginalSlopeEntrance(side);
   const start=toVec(rightLowTerminal[side]);
   const hi=toVec(source.topFoot),lo=toVec(source.lowFoot);
   const first=sourcePoint(-19.75,3,34.8,side);
   const sourceEntry=sourcePoint(-6,3,21.9,side);
   const routes=[
    {name:'real_registered_right_low_to_source_slope01_upper',
     from:start,to:hi},
    {name:'source_slope01_upper_to_lower',from:hi,to:lo},
    {name:'source_slope01_lower_to_original_floor01',from:lo,to:first},
    {name:'source_floor01_upper_region_to_first_jump_entry',from:first,to:sourceEntry}
   ].map(edge=>{
    const native=nav.auditPath(edge.from,edge.to,.30);
    const projection=nav.auditNavMeshProjection(edge.to);
    return {name:edge.name,
     nativePathReached:native.reachedTarget,
     nativeQuerySuccess:native.querySuccess,
     sourceSnapDistanceMeters:native.startSnapDistanceMeters,
     targetSnapDistanceMeters:native.endSnapDistanceMeters,
     endpointErrorMeters:native.endpointErrorMeters,
     nativePointCount:native.pointCount,
     // Recast reachedTarget alone is NOT an authenticated route:
     // nearest-poly may be more than a metre from exact source foot.
     trustworthySourceFloorNativePath:native.reachedTarget&&
      native.startSnapDistanceMeters<=.30&&
      native.endSnapDistanceMeters<=.30,
     misleadingRecastReachedWithDistantSourceSnap:native.reachedTarget&&
      (native.startSnapDistanceMeters>.30||
       native.endSnapDistanceMeters>.30),
     truePhysicalSourceFoot:foot(physics,edge.from),
     truePhysicalTargetFoot:foot(physics,edge.to),
     targetNativeProjection:projection,
     kccGroundedTraversalActuallyTested:false};
   });
   const sample={
    side,source,qaStageSolids:qa.solids.length,
    actuallyRegisteredRightLowTerminal25:
     foot(baselinePhysics,start),
    actuallyRegisteredRightLowTerminal30:foot(physics,start),
    candidateTopFloor25:foot(baselinePhysics,hi),
    candidateTopSource30:foot(physics,hi),
    candidateLowerFloor25:foot(baselinePhysics,lo),
    candidateLowerSource30:foot(physics,lo),
    rightLowToTopRecast25:baselineNav.auditPath(start,hi,.30),
    routes,
    addedUnoriginalGeometry:0,addedOffMeshLinks:0,
    certifiedKccCPUIngress:false,productionAuthorized:false,
    originalOpposingCPUPaths:'0/12'
   };
   result.push(sample);
  }
  console.log('B236_EXACT_ORIGINAL_RIGHT_LOW_TO_SOURCE_SLOPE01_INGRESS',
   JSON.stringify({results:result,qaOnly:true,source:'CI688_EXACT_ORIGINAL_TRIANGLES_AND_REGISTERED_RIGHT_LOW_POLYGON',
    preexistingActualSevenCpuRightLowRecastTerminals:true,
    actualSevenCpuAutonomousTraversalThisTest:false,
    sourceModelPdfRegistrationNotGloballyTrusted:true,
    originalStage:'25/17/26/0',noInventedPhysicalBridge:true,
    officialWinner:'NONE',productionAuthorized:false}));
  expect(result).toHaveLength(2);
  for(const row of result){
   expect(row.qaStageSolids).toBe(30);
   expect(row.source.candidateNotCertified).toBe(true);
   expect(row.source.dropFromRightLowToSlopeTopMeters).toBeGreaterThan(1.4);
   expect(row.source.dropFromRightLowToSlopeTopMeters).toBeLessThan(1.7);
   expect(row.actuallyRegisteredRightLowTerminal25.id).toBe(
    'UndertowT21D:right-low-team-'+(row.side==='POSITIVE_Z'?'a':'b'));
   expect(row.actuallyRegisteredRightLowTerminal30.id).toBe(
    row.actuallyRegisteredRightLowTerminal25.id);
   expect(row.routes).toHaveLength(4);
   expect(row.routes[0]!.kccGroundedTraversalActuallyTested).toBe(false);
   expect(row.source.closestRightLowPolygonToSlopeTopEdge.distanceMeters)
    .toBeGreaterThan(4.20);
   expect(row.source.closestRightLowPolygonToSlopeTopEdge.distanceMeters)
    .toBeLessThan(4.24);
   expect(row.source.idealConstantMaxCpuSpeedAirborneCenterReachMeters)
    .toBeLessThan(row.source.closestRightLowPolygonToSlopeTopEdge.distanceMeters);
   expect(row.source.idealCenterReachShortOfAuthenticSourceBoundaryMeters)
    .toBeGreaterThan(.90);
   expect(row.candidateTopFloor25.id).toBeNull();
   expect(row.candidateTopSource30.id).toBe(
    'B235_EXACT_CI688_QA:underpass-route-slope01-'+
    (row.side==='POSITIVE_Z'?'positive-z':'negative-z'));
   expect(row.candidateLowerSource30.id).toBe(row.candidateTopSource30.id);
   expect(row.routes[0]!.nativePathReached).toBe(true);
   expect(row.routes[0]!.trustworthySourceFloorNativePath).toBe(false);
   expect(row.routes[0]!.misleadingRecastReachedWithDistantSourceSnap)
    .toBe(true);
   expect(row.routes[0]!.targetSnapDistanceMeters).toBeGreaterThan(1.0);
   expect(row.routes[1]!.nativePathReached).toBe(false);
   expect(row.routes[1]!.trustworthySourceFloorNativePath).toBe(false);
   expect(row.routes[1]!.endpointErrorMeters).toBeGreaterThan(7.0);
   // Later Recast partial positives also snap too far away from the
   // exact FloorConcrete01 source surface to certify an actor route.
   expect(row.routes[2]!.trustworthySourceFloorNativePath).toBe(false);
   expect(row.routes[3]!.trustworthySourceFloorNativePath).toBe(false);
  }
  console.log('B236_STRICT_ORIGINAL_RIGHT_LOW_SLOPE01_INGRESS_BLOCKED',
   JSON.stringify({sides:2,sourceUpperSlopeTrueRapierContact:2,
    frozen25Slope01SourceContact:0,
    exactSourceToRightLowHorizontalGapMeters:
     result.map(x=>x.source.closestRightLowPolygonToSlopeTopEdge.distanceMeters),
    idealFullSpeedCpuBallisticCenterReachMeters:
     result.map(x=>x.source.idealConstantMaxCpuSpeedAirborneCenterReachMeters),
    navFalseReachDueToOneMeterSnap:2,
    nativeSlopeUpperToLowerDisconnected:2,
    actualCpuTraversalsAuthorized:0,
    originalCpuRoutes:'0/12',productionAuthorized:false}));
 },120000);
 it('does not add source geometry to original 25/17/26/0',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
 });
});
