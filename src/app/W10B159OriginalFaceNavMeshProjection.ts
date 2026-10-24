/** B159 — existing CI688 exact original source faces against the CURRENT,
 * unchanged, NATIVE Recast query and CURRENT registered Rapier static geometry.
 * This is a read-only 42-face centroid probe, not a geometry import/approval.
 * CI691 already failed when the source components were experimentally added.
 */
import {Vec3} from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {
 UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT,
 type UndertowUnderpassRouteRecord
} from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {B158ExactOriginalRouteFaceComparison}
 from './W10B158OriginalSourceFaceRecastMatch';

type P=readonly [number,number,number];
type Projection=ReturnType<RecastStageNavigation['auditNavMeshProjection']>;
type StageHit=ReturnType<RapierStagePhysics['castStageSegment']>;
export interface B159OriginalFaceNavMeshSample {
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 originalComponent:string;
 sourceObject:string;
 faceLocalIndex:number;
 originalSourceFaceCentroid:P;
 nativeProjectionSucceeded:boolean;
 nativeProjectionPoint:P|null;
 nativeProjectionDistanceMeters:number|null;
 nativeProjectionYDifferenceMeters:number|null;
 sameElevationNavMeshWithin035m:boolean;
 originalRapierStaticColliderHit:string|null;
 originalRapierHitHeightDifferenceMeters:number|null;
 exactOriginalFaceRegisteredAsRapierSolid:boolean;
 /** Even a near projected poly could be on some OTHER overlapping mesh. */
 exactFaceNavMeshMembershipCertified:false;
}
export interface B159OriginalFaceNavMeshComponent {
 id:string;
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 sourceObject:string;
 originalFaceCount:number;
 successfulNativeProjectionCount:number;
 nearNavMeshSamples035m:number;
 rayHitRegisteredOriginalSolidCount:number;
 exactSourceComponentColliderHitCount:number;
 smallest3dProjectionDistanceMeters:number|null;
 largest3dProjectionDistanceMeters:number|null;
 sourceFacePlayableOrConnectedCertified:false;
}
export interface B159OriginalFaceNavMeshGate {
 source:'CI688_EXACT_SOURCE_FACES_VS_UNMODIFIED_NATIVE_RECAST_AND_RAPIER';
 originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE';
 sourceOriginalFaceCount:42;
 originalComponentCount:10;
 attemptedRealNavMeshProjectionQueries:42;
 realOriginalStageRayQueries:42;
 nativeNearProjectionThresholdMeters:0.35;
 originalFacesProvidedAsRuntimeNavMeshInputs:false;
 priorCi691ExperimentalFivePerSideInsertionReachedGoal:false;
 samples:readonly B159OriginalFaceNavMeshSample[];
 components:readonly B159OriginalFaceNavMeshComponent[];
 originalSourceFaceKccWalkabilityProven:false;
 originalTwoTeamTraversalCertified:false;
 addedStageGeometry:0;
 addedOffmeshLinks:0;
 addedScoreableRegions:0;
 activationReady:false;
 productionAuthorized:false;
 originalFull4v4Certified:false;
 nextDecision:'RECONCILE_NAVMESH_ISLAND_ADJACENCY_AND_GENUINE_SOURCE_KCC';
}
const point=(x:{x:number;y:number;z:number}|null):P|null=>x?[
 x.x,x.y,x.z
]:null;
const finite=(x:number|null):x is number=>
 typeof x==='number'&&Number.isFinite(x)&&x>=0;
const same=(s:P,hit:StageHit)=>hit?Math.abs(hit.point.y-s[1]):null;

export function examineB159OriginalSourceFaceProjections(
 stage:StageDefinition,
 nav:Pick<RecastStageNavigation,'auditNavMeshProjection'>,
 physics:Pick<RapierStagePhysics,'castStageSegment'>,
 comparison:B158ExactOriginalRouteFaceComparison,
 sourceFaces:readonly UndertowUnderpassRouteRecord[]=
  UNDERTOW_UNDERPASS_ROUTE_COMPONENTS
):B159OriginalFaceNavMeshGate{
 const ci=UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT;
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
  stage.solids.length!==25||stage.paintSurfaces.length!==17||
  stage.navigationLinks?.length!==26||
  stage.paintSurfaces.some(x=>(x.flags&SurfaceFlags.Scoreable)!==0)||
  comparison.source!=='CI688_ORIGINAL_TRIANGLE_FACES_PLUS_B157_NATIVE_RECAST'||
  comparison.originalStage!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
  comparison.original4v4Certified!==false||
  comparison.productionAuthorized!==false||
  comparison.noNewSourceGeometry!==true||
  comparison.noNewNavLinks!==true||
  comparison.noNewScoreableMask!==true||
  comparison.priorSourceFacesAloneRecastReached!==false||
  ci.experimentalCiRun!==691||
  ci.experimentalRuntimeInclusionReachedTarget!==false||
  ci.offMeshLinkAuthorized!==false||
  ci.runtimePromotionAuthorized!==false||
  sourceFaces.length!==10||
  new Set(sourceFaces.map(x=>x.id)).size!==10||
  sourceFaces.filter(x=>x.side==='POSITIVE_Z').length!==5||
  sourceFaces.filter(x=>x.side==='NEGATIVE_Z').length!==5||
  comparison.comparisons.length!==4)
  throw Error('B159_ORIGINAL_FROZEN_FACE_AUTHORITY_REQUIRED');
 const samples:B159OriginalFaceNavMeshSample[]=[];
 for(const component of sourceFaces){
  const mesh=component.mesh;
  if(mesh.indices.length%3!==0||mesh.indices.length===0)
   throw Error('B159_BAD_ORIGINAL_TRIANGLE_MESH');
  for(let i=0;i<mesh.indices.length;i+=3){
   const a=mesh.vertices[mesh.indices[i]!]!,
    b=mesh.vertices[mesh.indices[i+1]!]!,
    c=mesh.vertices[mesh.indices[i+2]!]!;
   if(!a||!b||!c||![...a,...b,...c].every(Number.isFinite))
    throw Error('B159_INVALID_ORIGINAL_SOURCE_FACE');
   const centroid:P=[(a[0]+b[0]+c[0])/3,
    (a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
   const native:Projection=nav.auditNavMeshProjection(new Vec3(...centroid));
   if(native.success&&(!native.nearestPoint||
     !finite(native.distanceMeters)))
    throw Error('B159_INCONSISTENT_NATIVE_RECAST_PROJECTION');
   const projected=native.success?point(native.nearestPoint):null;
   const d=native.success?native.distanceMeters:null;
   const height=projected?projected[1]-centroid[1]:null;
   // Cast only against the existing registered original Rapier static stage,
   // not extra source triangles or manufactured floor colliders.
   const hit:StageHit=physics.castStageSegment(
    new Vec3(centroid[0],centroid[1]+1.2,centroid[2]),
    new Vec3(centroid[0],centroid[1]-1.2,centroid[2]),
    'ink-projectile');
   const exactId='UndertowT21D:'+component.id;
   samples.push({
    side:component.side,
    originalComponent:component.id,
    sourceObject:component.sourceObject,
    faceLocalIndex:i/3,originalSourceFaceCentroid:centroid,
    nativeProjectionSucceeded:native.success,
    nativeProjectionPoint:projected,
    nativeProjectionDistanceMeters:d,
    nativeProjectionYDifferenceMeters:height,
    sameElevationNavMeshWithin035m:d!==null&&d<=.35&&
     height!==null&&Math.abs(height)<=.35,
    originalRapierStaticColliderHit:hit?.solidId??null,
    originalRapierHitHeightDifferenceMeters:same(centroid,hit),
    exactOriginalFaceRegisteredAsRapierSolid:hit?.solidId===exactId,
    exactFaceNavMeshMembershipCertified:false
   });
  }
 }
 if(samples.length!==42)throw Error('B159_EXPECTED_42_ORIGINAL_SOURCE_FACES');
 const components:B159OriginalFaceNavMeshComponent[]=sourceFaces.map(face=>{
  const points=samples.filter(s=>s.originalComponent===face.id);
  const ds=points.map(s=>s.nativeProjectionDistanceMeters)
   .filter(finite);
  return {
   id:face.id,side:face.side,sourceObject:face.sourceObject,
   originalFaceCount:points.length,
   successfulNativeProjectionCount:ds.length,
   nearNavMeshSamples035m:points.filter(s=>
    s.sameElevationNavMeshWithin035m).length,
   rayHitRegisteredOriginalSolidCount:points.filter(s=>
    s.originalRapierStaticColliderHit!==null).length,
   exactSourceComponentColliderHitCount:points.filter(s=>
    s.exactOriginalFaceRegisteredAsRapierSolid).length,
   smallest3dProjectionDistanceMeters:ds.length?Math.min(...ds):null,
   largest3dProjectionDistanceMeters:ds.length?Math.max(...ds):null,
   sourceFacePlayableOrConnectedCertified:false
  };
 });
 return {
  source:'CI688_EXACT_SOURCE_FACES_VS_UNMODIFIED_NATIVE_RECAST_AND_RAPIER',
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  sourceOriginalFaceCount:42,originalComponentCount:10,
  attemptedRealNavMeshProjectionQueries:42,
  realOriginalStageRayQueries:42,
  nativeNearProjectionThresholdMeters:.35,
  originalFacesProvidedAsRuntimeNavMeshInputs:false,
  priorCi691ExperimentalFivePerSideInsertionReachedGoal:false,
  samples,components,originalSourceFaceKccWalkabilityProven:false,
  originalTwoTeamTraversalCertified:false,addedStageGeometry:0,
  addedOffmeshLinks:0,addedScoreableRegions:0,
  activationReady:false,productionAuthorized:false,
  originalFull4v4Certified:false,
  nextDecision:'RECONCILE_NAVMESH_ISLAND_ADJACENCY_AND_GENUINE_SOURCE_KCC'
 };
}
