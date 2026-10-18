/**
 * W10-B10 — independent archived Pass18C original-source candidate scan.
 *
 * B9 searched 40 static reviewed FloorConcrete/FloorSlope meshes. This
 * investigates the seven ADDITIONAL Temple01 source pairs from Batch2,
 * including unresolved FldObj/PntSet placement. Static and placement-unknown
 * meshes NEVER share promotion authority. No synthetic bridging geometry,
 * nav links, colliders, CPU positions, scoring or raw OBJ is authored.
 *
 * A direct gap below .30m is ONLY a geometrical hypothesis. It cannot prove
 * Actor enabled state, walkability, KCC traversal or native Recast links.
 */
import type {StageTriangleMeshGeometry,StageVector3}
 from '../StageDefinition';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES,
 UNDERTOW_T21_SOURCE_BATCH2_SUMMARY}
 from './UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from './UndertowSpillwayRouteRampGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {distanceBetweenExactTriangleMeshes}
 from './UndertowW10SourceSeamContactAudit';
import {auditW10OriginalGapCandidates}
 from './UndertowW10OriginalGapCandidates';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Gap='RIGHT_RAMP_TO_ENTRANCE'|'MID_FLOOR_TO_OUTER_SLOPE';
type Placement='STATIC_MODEL_SOURCE'|'SET_ACTOR_PLACEMENT_UNRESOLVED';
export interface W10B10Candidate{
 readonly side:Side;
 readonly seam:Gap;
 readonly sourceComponentId:string;
 readonly sourceMaterial:string;
 readonly sourceMeshId:string;
 readonly placementAuthority:Placement;
 readonly sourceTriangleCount:number;
 readonly distanceToUpstreamMeters:number;
 readonly distanceToDownstreamMeters:number;
 readonly minimaxDistanceMeters:number;
 readonly geometricallyNearBoth:boolean;
 readonly canPromoteWithoutActorProof:false;
 readonly fullSourceTriangleIdConnectivityProven:false;
 readonly originalRuntimeColliderAuthorized:false;
 readonly nativeNavPathCertified:false;
 readonly future4v4EngagementAuthorized:false;
}
export interface W10B10GapResult{
 readonly side:Side;
 readonly seam:Gap;
 readonly upstreamId:string;
 readonly downstreamId:string;
 readonly originalDirectSeparationMeters:number;
 readonly b9SourceCandidatesInspectedPerSide:number;
 readonly b9IndependentStrictPairwiseCount:number;
 readonly additionalCandidateCount:number;
 readonly staticCandidates:number;
 readonly actorPlacementUnresolvedCandidates:number;
 readonly geometricPairwiseCandidates:number;
 readonly nearestStatic:readonly W10B10Candidate[];
 readonly nearestActorUnresolved:readonly W10B10Candidate[];
 readonly crossingCanBeEnabled:false;
 readonly newRuntimeSolids:0;
 readonly newNavLinks:0;
}
export interface W10B10Result{
 readonly batch2OriginalCandidateCount:14;
 readonly staticSourceCount:6;
 readonly actorPlacementUnresolvedCount:8;
 readonly previousB9SourceCount:40;
 readonly gaps:readonly W10B10GapResult[];
 readonly approvedOriginalGeometryConnections:0;
 readonly crossTeamContactCertified:false;
 readonly originalActorPlacementConfirmed:false;
 readonly sourceEvidenceRawUploaded:false;
 readonly frozenSolids:25;
 readonly frozenPaintSurfaces:17;
 readonly frozenNavLinks:26;
 readonly activationReady:false;
 readonly productionAuthorized:false;
}
function triangles(vertices:readonly StageVector3[]):StageTriangleMeshGeometry{
 if(vertices.length<3||vertices.length%3!==0)
  throw Error('W10B10_UNTRUSTED_SOURCE_TRIANGLE_COUNT');
 return {vertices,indices:vertices.map((_,i)=>i)};
}
function scan(
 side:Side,seam:Gap,
 upstream:{id:string;mesh:StageTriangleMeshGeometry},
 downstream:{id:string;mesh:StageTriangleMeshGeometry},
 prior:ReturnType<typeof auditW10OriginalGapCandidates>['seams'][number]
):W10B10GapResult{
 const originalDirectSeparationMeters=
  distanceBetweenExactTriangleMeshes(upstream.mesh,downstream.mesh);
 const records=UNDERTOW_T21_SOURCE_BATCH2_MESHES
  .filter(m=>m.side===side).map(m=>{
   const mesh=triangles(m.vertices);
   const distanceToUpstreamMeters=
    distanceBetweenExactTriangleMeshes(upstream.mesh,mesh);
   const distanceToDownstreamMeters=
    distanceBetweenExactTriangleMeshes(downstream.mesh,mesh);
   if(!Number.isFinite(distanceToUpstreamMeters)||
      !Number.isFinite(distanceToDownstreamMeters))
    throw Error('W10B10_INVALID_EXACT_SOURCE_DISTANCE');
   return {
    side,seam,sourceComponentId:m.sourceComponentId,
    sourceMaterial:m.sourceMaterial,sourceMeshId:m.id,
    placementAuthority:m.placementAuthority,
    sourceTriangleCount:m.vertices.length/3,
    distanceToUpstreamMeters,distanceToDownstreamMeters,
    minimaxDistanceMeters:Math.max(
     distanceToUpstreamMeters,distanceToDownstreamMeters),
    geometricallyNearBoth:
     distanceToUpstreamMeters<=.30&&distanceToDownstreamMeters<=.30,
    canPromoteWithoutActorProof:false,
    fullSourceTriangleIdConnectivityProven:false,
    originalRuntimeColliderAuthorized:false,
    nativeNavPathCertified:false,future4v4EngagementAuthorized:false
   } as const;
  }).sort((a,b)=>a.minimaxDistanceMeters-b.minimaxDistanceMeters||
    a.sourceComponentId.localeCompare(b.sourceComponentId));
 const staticCandidates=records.filter(r=>
  r.placementAuthority==='STATIC_MODEL_SOURCE');
 const unknownCandidates=records.filter(r=>
  r.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED');
 if(staticCandidates.length!==3||unknownCandidates.length!==4)
  throw Error('W10B10_ORIGINAL_SOURCE_PLACEMENT_COUNTS_DRIFT');
 return {side,seam,upstreamId:upstream.id,downstreamId:downstream.id,
  originalDirectSeparationMeters,
  b9SourceCandidatesInspectedPerSide:prior.originalCandidateCount,
  b9IndependentStrictPairwiseCount:prior.independentStrictPairwiseCandidateCount,
  additionalCandidateCount:records.length,staticCandidates:staticCandidates.length,
  actorPlacementUnresolvedCandidates:unknownCandidates.length,
  geometricPairwiseCandidates:records.filter(x=>x.geometricallyNearBoth).length,
  nearestStatic:staticCandidates.slice(0,3),
  nearestActorUnresolved:unknownCandidates.slice(0,4),
  crossingCanBeEnabled:false,newRuntimeSolids:0,newNavLinks:0};
}
export function auditW10Batch2GapCandidates():W10B10Result{
 const b9=auditW10OriginalGapCandidates();
 const batch=UNDERTOW_T21_SOURCE_BATCH2_MESHES;
 if(batch.length!==14||UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.pairCount!==7||
   b9.originalSourceInventoryCount!==40||
   frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
   frozen.navigationLinks.length!==26||frozen.activationReady)
  throw Error('W10B10_FROZEN_OR_SOURCE_INVENTORY_DRIFT');
 if(batch.some(x=>x.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY'||
   x.runtimePromotionAuthorized||
   !/FloorConcrete|FloorSlope|FloorGrass/.test(x.sourceMaterial)))
  throw Error('W10B10_NOT_ORIGINAL_REVIEW_ONLY_FLOOR_CANDIDATE');
 const prior=(side:Side,seam:Gap)=>{
  const x=b9.seams.find(p=>p.side===side&&p.seam===seam);
  if(!x)throw Error('W10B10_MISSING_B9_CROSS_CHECK');
  return x;
 };
 const gaps:W10B10GapResult[]=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const ramp=UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(x=>x.side===side);
  const chain=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.filter(x=>x.side===side);
  if(!ramp||chain.length!==5)
   throw Error('W10B10_MISSING_ORIGINAL_SOURCE_ROUTE');
  gaps.push(scan(side,'RIGHT_RAMP_TO_ENTRANCE',
   {id:ramp.id,mesh:ramp.mesh},{id:chain[0]!.id,mesh:chain[0]!.mesh},
   prior(side,'RIGHT_RAMP_TO_ENTRANCE')));
  gaps.push(scan(side,'MID_FLOOR_TO_OUTER_SLOPE',
   {id:chain[1]!.id,mesh:chain[1]!.mesh},
   {id:chain[2]!.id,mesh:chain[2]!.mesh},
   prior(side,'MID_FLOOR_TO_OUTER_SLOPE')));
 }
 return {batch2OriginalCandidateCount:14,staticSourceCount:6,
  actorPlacementUnresolvedCount:8,previousB9SourceCount:40,
  gaps,approvedOriginalGeometryConnections:0,
  crossTeamContactCertified:false,originalActorPlacementConfirmed:false,
  sourceEvidenceRawUploaded:false,
  frozenSolids:25,frozenPaintSurfaces:17,frozenNavLinks:26,
  activationReady:false,productionAuthorized:false};
}
