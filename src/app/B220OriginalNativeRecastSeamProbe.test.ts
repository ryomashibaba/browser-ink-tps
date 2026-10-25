import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {b220SourceTriangleCentroidWitness,b220AuditOriginalRecastSeamWitnesses}
 from './B220OriginalNativeRecastSeamProbe';
import {b219TriageOriginalNavmeshSourceFailure}
 from './B219OriginalUnderpassDisconnection';
import {b218OriginalRouteFaceChainSeams}
 from './B218OriginalRouteFaceChainSeams';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {B159OriginalFaceNavMeshGate}
 from './W10B159OriginalFaceNavMeshProjection';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition,StageTriangleMeshGeometry}
 from '../stage/StageDefinition';
const b159={
 source:'CI688_EXACT_SOURCE_FACES_VS_UNMODIFIED_NATIVE_RECAST_AND_RAPIER',
 originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
 sourceOriginalFaceCount:42,originalComponentCount:10,
 attemptedRealNavMeshProjectionQueries:42,realOriginalStageRayQueries:42,
 priorCi691ExperimentalFivePerSideInsertionReachedGoal:false,
 addedStageGeometry:0,addedOffmeshLinks:0,addedScoreableRegions:0,
 originalTwoTeamTraversalCertified:false,productionAuthorized:false,
 components:FACES.map(f=>({id:f.id,side:f.side,
 originalFaceCount:f.mesh.indices.length/3,
 nearNavMeshSamples035m:0,rayHitRegisteredOriginalSolidCount:0,
 exactSourceComponentColliderHitCount:0}))
} as unknown as B159OriginalFaceNavMeshGate;
const previous=b219TriageOriginalNavmeshSourceFailure(
 b218OriginalRouteFaceChainSeams(),b159);
const stage={
 metadata:{id:'undertow-t21d-partial-connectivity-qa'},
 solids:Array.from({length:25},(_,i)=>({id:'source-'+i})),
 paintSurfaces:Array.from({length:17},()=>({flags:0})),
 navigationLinks:Array.from({length:26},()=>({}))
} as unknown as StageDefinition;
const stats={paths:0,projections:0,rays:0};
const nav={
 auditNavMeshProjection(v:Vec3){stats.projections++;return {
 success:true,nearestPoint:{x:v.x,y:v.y,z:v.z},distanceMeters:0};},
 auditPath(from:Vec3,to:Vec3){stats.paths++;return {
 querySuccess:true,reachedTarget:false,pointCount:2,
 startSnapDistanceMeters:0,endSnapDistanceMeters:0,
 endpointErrorMeters:8,nativePathPoints:[
  {x:from.x,y:from.y,z:from.z},{x:to.x+8,y:to.y,z:to.z}]
 };}
} as unknown as Pick<RecastStageNavigation,'auditPath'|'auditNavMeshProjection'>;
const physics={
 castStageSegment(){stats.rays++;return null;}
} as unknown as Pick<RapierStagePhysics,'castStageSegment'>;
describe('B220 real original source 8-seam Recast/Rapier read-only witnesses',()=>{
 it('chooses real source triangle centroids, not fabricated feet',()=>{
  const mesh:StageTriangleMeshGeometry={vertices:[
   [0,0,0],[3,0,0],[0,0,3]],indices:[0,1,2]};
  const w=b220SourceTriangleCentroidWitness(mesh,mesh);
  expect(w.distanceMeters).toBe(0);
  expect(w.from).toEqual([1,0,1]);
  expect(w.to).toEqual([1,0,1]);
 });
 it('queries exactly 8 genuine native routes, 16 native projections, 16 stage rays',()=>{
  stats.paths=0;stats.projections=0;stats.rays=0;
  const out=b220AuditOriginalRecastSeamWitnesses(stage,nav,physics,previous);
  expect(out.actualOriginalFacePairs).toHaveLength(8);
  expect(stats.paths).toBe(8);
  expect(stats.projections).toBe(16);
  expect(stats.rays).toBe(16);
  expect(out.actualOriginalFacePairs.every(x=>
   x.referenceIsSourceTriangleCentroidNotPhysicalActor&&
   !x.genuineCPUPathTraversalTested&&!x.gameRouteAuthorized)).toBe(true);
  expect(out.originalCrossTeamRoutesCertified).toBe('0/12');
  expect(out.addedPhysicsBodies).toBe(0);
  expect(out.addedNavLinks).toBe(0);
 });
 it('does not turn Recast native endpoint or ownerless floor into KCC certificate',()=>{
  const x=b220AuditOriginalRecastSeamWitnesses(stage,nav,physics,previous);
  expect(x.actualOriginalFacePairs.every(p=>
   !p.nativeRecast.credibleOriginalSourceEndpoints&&
   !p.bothOriginalEndpointsRapierSupported&&
   p.registeredSourceRapier.every(r=>!r.supportedByExistingRegisteredSource)))
    .toBe(true);
  expect(x.naturalCPUEncounterCertified).toBe(false);
  expect(x.physicalKccTraversalCertified).toBe(false);
  expect(x.productionAuthorized).toBe(false);
 });
 it('fail-closes bad original stage, unauthorized new links and fake nav approval',()=>{
  expect(()=>b220AuditOriginalRecastSeamWitnesses(
   {...stage,solids:[]} as StageDefinition,nav,physics,previous)).toThrow();
  expect(()=>b220AuditOriginalRecastSeamWitnesses(
   stage,nav,physics,{...previous,addedNavLinks:1 as 0})).toThrow();
 });
});
