/**
 * W10-B9. Query only previously exported original Temple01 source triangles
 * for possible bridge evidence at the two longest W10-B8 geometric seams.
 * A visual source component is NOT gameplay collision or route authority.
 *
 * Exact triangles and original identities are preserved; no new mesh is
 * synthesized, promoted, rescaled, rasterized, or uploaded from raw OBJ.
 * Direct source-face distance is a necessary geometrical proximity test,
 * NOT sufficient evidence for playable KCC, nav, direction or scoring.
 */
import type {StageTriangleMeshGeometry,StageVector3} from '../StageDefinition';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS} from './UndertowSpillwayRouteRampGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS} from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES}
 from './UndertowSpillwaySourceNativePhase1Geometry';
import {UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES}
 from './UndertowSpillwaySourceNativeSupplementGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES}
 from './UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES}
 from './UndertowSpillwayBroadStaticSourceGeometry';
import {distanceBetweenExactTriangleMeshes}
 from './UndertowW10SourceSeamContactAudit';
type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Mesh={readonly id:string;readonly sourceComponentId:string;
 readonly sourceMaterial:string;readonly side:Side;
 readonly vertices:readonly StageVector3[];
 readonly authority:'EXACT_SOURCE_MESH_REVIEW_ONLY';
 readonly runtimePromotionAuthorized:false};
export interface W10B9OriginalCandidateWitness {
 readonly side:Side;
 readonly sourceComponentId:string;
 readonly sourceMaterial:string;
 readonly sourceReviewMeshId:string;
 readonly triangleCount:number;
 readonly distanceToUpstreamMeters:number;
 readonly distanceToDownstreamMeters:number;
 readonly combinedDistanceLowerBoundMeters:number;
 readonly maxDistanceToEitherSideMeters:number;
 readonly pairwiseWithinThirtyCentimeters:boolean;
 /** A review component may repeat a face of the already-known seam endpoint.
  * Never rank that overlap as an independent missing floor. */
 readonly overlapsKnownUpstreamSource:boolean;
 readonly overlapsKnownDownstreamSource:boolean;
 readonly independentOriginalSourceCandidate:boolean;
 readonly originalGeometryOnly:true;
 readonly gameplayCollisionAuthorized:false;
 readonly gameplayNavAuthorized:false;
 readonly originalActorSemanticsResolved:false;
 readonly proposedLinkAuthorized:false;
}
export interface W10B9SeamEvidence {
 readonly side:Side;
 readonly seam:'RIGHT_RAMP_TO_ENTRANCE'|'MID_FLOOR_TO_OUTER_SLOPE';
 readonly upstreamId:string;
 readonly downstreamId:string;
 readonly directExact3DSeparationMeters:number;
 readonly originalCandidateCount:number;
 readonly exactOriginalCandidateCount:number;
 readonly closestOriginalCandidates:readonly W10B9OriginalCandidateWitness[];
 readonly closestIndependentCandidates:readonly W10B9OriginalCandidateWitness[];
 readonly knownEndpointSourceOverlapCount:number;
 readonly strictPairwiseCandidateCount:number;
 readonly independentStrictPairwiseCandidateCount:number;
 readonly inferredPhysicalConnection:false;
 readonly newNavLinks:0;
 readonly newPhysicsSolids:0;
 readonly productionAuthorized:false;
}
export interface W10B9SourceCandidateResults {
 readonly seams:readonly W10B9SeamEvidence[];
 readonly originalSourceInventoryCount:number;
 readonly sourceIdentityDuplicatesOmitted:number;
 readonly originalRouteGeometryUnmodified:true;
 readonly frozenRuntimeSolidCount:25;
 readonly frozenRuntimePaintCount:17;
 readonly frozenRuntimeLinkCount:26;
 readonly candidateMeshRuntimePromotionCount:0;
 readonly fullHumanKccCrossingsReplayed:0;
 readonly gameplayCertified:false;
 readonly productionAuthorized:false;
}
function toTriangleSoup(vertices:readonly StageVector3[]):StageTriangleMeshGeometry{
 if(vertices.length<3||vertices.length%3!==0)
  throw Error('W10_B9_SOURCE_TRIANGLE_SOUP_INVALID');
 return {vertices,indices:vertices.map((_,i)=>i)};
}
function sourceFloorEligible(mesh:Mesh):boolean{
 const kind=mesh.sourceMaterial;
 return (kind.includes('FloorConcrete')||kind.includes('FloorSlope'))&&
  mesh.authority==='EXACT_SOURCE_MESH_REVIEW_ONLY'&&
  mesh.runtimePromotionAuthorized===false;
}
function sourceMeshInventory(){
 const input:readonly Mesh[]=[
  ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
  ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
  ...UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,
  ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES
 ];
 // One source component may appear in several review subsets. A second
 // manifestation of the same original component is never a second bridge.
 const encountered=new Set<string>();
 const selected:Mesh[]=[];let duplicates=0;
 for(const mesh of input){
  if(!sourceFloorEligible(mesh))continue;
  if(encountered.has(mesh.sourceComponentId)){duplicates++;continue;}
  encountered.add(mesh.sourceComponentId);selected.push(mesh);
 }
 return {meshes:selected,duplicates};
}
function scanOne(
 side:Side,seam:W10B9SeamEvidence['seam'],
 up:{id:string;sourceObject:string;mesh:StageTriangleMeshGeometry},
 down:{id:string;sourceObject:string;mesh:StageTriangleMeshGeometry},
 inventory:readonly Mesh[]
):W10B9SeamEvidence{
 const direct=distanceBetweenExactTriangleMeshes(up.mesh,down.mesh);
 const examined=inventory.filter(m=>m.side===side);
 const all=examined.map(m=>{
  const source=toTriangleSoup(m.vertices);
  const d1=distanceBetweenExactTriangleMeshes(up.mesh,source);
  const d2=distanceBetweenExactTriangleMeshes(down.mesh,source);
  if(!Number.isFinite(d1)||!Number.isFinite(d2))
   throw Error('W10_B9_NONFINITE_SOURCE_PROXIMITY');
  const overlapsKnownUpstreamSource=
   m.sourceComponentId.startsWith(up.sourceObject+'|')&&d1<.000001;
  const overlapsKnownDownstreamSource=
   m.sourceComponentId.startsWith(down.sourceObject+'|')&&d2<.000001;
  return {
   side,sourceComponentId:m.sourceComponentId,sourceMaterial:m.sourceMaterial,
   sourceReviewMeshId:m.id,triangleCount:m.vertices.length/3,
   distanceToUpstreamMeters:d1,distanceToDownstreamMeters:d2,
   combinedDistanceLowerBoundMeters:d1+d2,
   maxDistanceToEitherSideMeters:Math.max(d1,d2),
   pairwiseWithinThirtyCentimeters:d1<=.30&&d2<=.30,
   overlapsKnownUpstreamSource,overlapsKnownDownstreamSource,
   independentOriginalSourceCandidate:
    !overlapsKnownUpstreamSource&&!overlapsKnownDownstreamSource,
   originalGeometryOnly:true,gameplayCollisionAuthorized:false,
   gameplayNavAuthorized:false,originalActorSemanticsResolved:false,
   proposedLinkAuthorized:false
  } as const;
 }).sort((a,b)=>a.maxDistanceToEitherSideMeters-
     b.maxDistanceToEitherSideMeters||
     a.combinedDistanceLowerBoundMeters-b.combinedDistanceLowerBoundMeters||
     a.sourceComponentId.localeCompare(b.sourceComponentId));
 return {
  side,seam,upstreamId:up.id,downstreamId:down.id,
  directExact3DSeparationMeters:direct,
  originalCandidateCount:examined.length,
  exactOriginalCandidateCount:examined.length,
  closestOriginalCandidates:all.slice(0,8),
  closestIndependentCandidates:
   all.filter(x=>x.independentOriginalSourceCandidate).slice(0,8),
  knownEndpointSourceOverlapCount:
   all.filter(x=>!x.independentOriginalSourceCandidate).length,
  strictPairwiseCandidateCount:all.filter(x=>x.pairwiseWithinThirtyCentimeters).length,
  independentStrictPairwiseCandidateCount:all.filter(x=>
   x.independentOriginalSourceCandidate&&x.pairwiseWithinThirtyCentimeters).length,
  inferredPhysicalConnection:false,newNavLinks:0,newPhysicsSolids:0,
  productionAuthorized:false
 };
}
export function auditW10OriginalGapCandidates():W10B9SourceCandidateResults{
 const inventory=sourceMeshInventory();
 const seams:W10B9SeamEvidence[]=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const ramp=UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(x=>x.side===side);
  const chain=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.filter(x=>x.side===side);
  if(!ramp||chain.length!==5)
   throw Error('W10_B9_ORIGINAL_MIRROR_CHAIN_MISSING');
  seams.push(scanOne(side,'RIGHT_RAMP_TO_ENTRANCE',
   {id:ramp.id,sourceObject:ramp.sourceObject,mesh:ramp.mesh},
   {id:chain[0]!.id,sourceObject:chain[0]!.sourceObject,
    mesh:chain[0]!.mesh},inventory.meshes));
  seams.push(scanOne(side,'MID_FLOOR_TO_OUTER_SLOPE',
   {id:chain[1]!.id,sourceObject:chain[1]!.sourceObject,
    mesh:chain[1]!.mesh},
   {id:chain[2]!.id,sourceObject:chain[2]!.sourceObject,
    mesh:chain[2]!.mesh},inventory.meshes));
 }
 return {seams,originalSourceInventoryCount:inventory.meshes.length,
  sourceIdentityDuplicatesOmitted:inventory.duplicates,
  originalRouteGeometryUnmodified:true,frozenRuntimeSolidCount:25,
  frozenRuntimePaintCount:17,frozenRuntimeLinkCount:26,
  candidateMeshRuntimePromotionCount:0,fullHumanKccCrossingsReplayed:0,
  gameplayCertified:false,productionAuthorized:false};
}
