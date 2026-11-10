/**
 * T21 W10 P0: all EIGHT CI688 underpass face-chain seams (four per side)
 * against EVERY archived public exact-source floor triangle candidate.
 *
 * Previous B9/B10 scans only targeted two longer DIFFERENT seam families
 * per side (right-ramp entry and floor01->slope00). This module tests the
 * full four-link CI688 chain per side, without equating those seam IDs with
 * the separate archived eight Recast connectivity gaps.
 *
 * A 3D geometric near-contact is NEVER 7.2.0 Turf collision, Actor Set,
 * a continuous Rapier capsule walk or a Recast connectivity certificate.
 * All candidate lists are study-only, no source assets are fetched.
 */
import type {StageTriangleMeshGeometry,StageVector3}
 from '../StageDefinition';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES}
 from './UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES}
 from './UndertowSpillwaySourceNativeSupplementGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES}
 from './UndertowSpillwaySourceNativePhase1Geometry';
import {UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES}
 from './UndertowSpillwayBroadStaticSourceGeometry';
import {UNDERTOW_T21_SOURCE_BATCH2_MESHES}
 from './UndertowSpillwaySourceBatch2Geometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from './UndertowSpillwayBlockoutGeometry';
import {b218OriginalRouteFaceChainSeams}
 from '../../app/B218OriginalRouteFaceChainSeams';
import {distanceBetweenExactTriangleMeshes}
 from './UndertowW10SourceSeamContactAudit';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Authority='STATIC_MODEL_SOURCE'|'SET_ACTOR_PLACEMENT_UNRESOLVED';
type Candidate=Readonly<{
 sourceComponentId:string;sourceMaterial:string;side:Side;
 vertices:readonly StageVector3[];
 placementAuthority:Authority;
}>;
type Surface=Readonly<{
 id:string;sourceObject:string;mesh:StageTriangleMeshGeometry;
}>;
export type W10EightSeamCandidateEvidence=Readonly<{
 sourceComponentId:string;sourceMaterial:string;
 placementAuthority:Authority;
 originalTriangleCount:number;
 upstreamGapMeters:number;downstreamGapMeters:number;
 worstEndpointGapMeters:number;
 directPairwiseWithin30cm:boolean;
 overlapsKnownUpstreamEndpoint:boolean;
 overlapsKnownDownstreamEndpoint:boolean;
 independentSourceComponent:boolean;
 originalTurfColliderFlagKnown:false;
 sourceActorPlacementKnown:boolean;
 originalHumanCapsuleRouteCertified:false;
}>;
export type W10EightSeamRow=Readonly<{
 side:Side;seamIndex:0|1|2|3;
 from:string;to:string;
 exactOriginalSourceFaceGapMeters:number;
 candidateOriginalSourceMeshesExamined:number;
 independentStaticPairwiseNearCount:number;
 independentUnplacedPairwiseNearCount:number;
 nearestIndependentStatic:readonly W10EightSeamCandidateEvidence[];
 nearestIndependentUnplaced:readonly W10EightSeamCandidateEvidence[];
 originalVersion72CollisionFlagsCertified:false;
 stageRouteOrNavEnabled:false;
}>;
export function auditW10EightOriginalFaceChainSeams(){
 const b218=b218OriginalRouteFaceChainSeams();
 if(FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||FROZEN.activationReady||
    b218.adjacentSeams!==8||b218.previousAllFiveFaceRecastExperimentSucceeded||
    b218.productionAuthorized)
  throw Error('T21_W10_EIGHT_SEAMS_FROZEN_PROVENANCE_REQUIRED');
 const b9=[
  ...UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
  ...UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
  ...UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,
  ...UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES
 ];
 const candidates:Candidate[]=[];
 const seen=new Set<string>();
 let duplicateSourceIdentities=0;
 for(const m of b9){
  if(!/FloorConcrete|FloorSlope/.test(m.sourceMaterial)||
     m.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY'||
     m.runtimePromotionAuthorized!==false)continue;
  if(seen.has(m.sourceComponentId)){duplicateSourceIdentities++;continue;}
  seen.add(m.sourceComponentId);
  candidates.push({sourceComponentId:m.sourceComponentId,
   sourceMaterial:m.sourceMaterial,side:m.side,vertices:m.vertices,
   placementAuthority:'STATIC_MODEL_SOURCE'});
 }
 const b9Count=candidates.length;
 for(const m of UNDERTOW_T21_SOURCE_BATCH2_MESHES){
  if(!/FloorConcrete|FloorSlope|FloorGrass/.test(m.sourceMaterial)||
     m.authority!=='EXACT_SOURCE_MESH_REVIEW_ONLY'||
     m.runtimePromotionAuthorized!==false||
     !['STATIC_MODEL_SOURCE','SET_ACTOR_PLACEMENT_UNRESOLVED']
       .includes(m.placementAuthority))
   throw Error('T21_W10_EIGHT_SEAMS_INVALID_BATCH2_SOURCE');
  if(seen.has(m.sourceComponentId)){duplicateSourceIdentities++;continue;}
  seen.add(m.sourceComponentId);
  candidates.push({sourceComponentId:m.sourceComponentId,
   sourceMaterial:m.sourceMaterial,side:m.side,vertices:m.vertices,
   placementAuthority:m.placementAuthority});
 }
 if(b9Count!==40||UNDERTOW_T21_SOURCE_BATCH2_MESHES.length!==14||
    candidates.length!==54||duplicateSourceIdentities<0)
  throw Error('T21_W10_EIGHT_SEAMS_SOURCE_INVENTORY_DRIFT');
 const mesh=(points:readonly StageVector3[]):StageTriangleMeshGeometry=>{
  if(points.length<3||points.length%3!==0||
     points.some(p=>p.length!==3||!p.every(Number.isFinite)))
   throw Error('T21_W10_EIGHT_SEAMS_INVALID_EXACT_SOURCE');
  return {vertices:points,indices:points.map((_,i)=>i)};
 };
 const endpoint=(id:string):Surface=>{
  const source=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(x=>x.id===id);
  if(!source)throw Error('T21_W10_EIGHT_SEAMS_MISSING_FACE_'+id);
  return source;
 };
 const rows:W10EightSeamRow[]=b218.seams.map((seam,index)=>{
  const side=seam.side;
  const upstream=endpoint(seam.from),downstream=endpoint(seam.to);
  if(upstream.side!==side||downstream.side!==side)
   throw Error('T21_W10_EIGHT_SEAMS_CROSSED_SOURCE_SIDE');
  const geometric=distanceBetweenExactTriangleMeshes(
   upstream.mesh,downstream.mesh);
  if(Math.abs(geometric-seam.gapMeters)>0.000002)
   throw Error('T21_W10_EIGHT_SEAMS_FACE_DISTANCE_DRIFT');
  const list=candidates.filter(x=>x.side===side).map(c=>{
   const exact=mesh(c.vertices);
   const u=distanceBetweenExactTriangleMeshes(upstream.mesh,exact);
   const d=distanceBetweenExactTriangleMeshes(downstream.mesh,exact);
   if(!Number.isFinite(u)||!Number.isFinite(d)||u<0||d<0)
    throw Error('T21_W10_EIGHT_SEAMS_BAD_SOURCE_DISTANCE');
   const upOverlap=c.sourceComponentId.startsWith(
    upstream.sourceObject+'|')&&u<0.000001;
   const downOverlap=c.sourceComponentId.startsWith(
    downstream.sourceObject+'|')&&d<0.000001;
   return {
    sourceComponentId:c.sourceComponentId,
    sourceMaterial:c.sourceMaterial,
    placementAuthority:c.placementAuthority,
    originalTriangleCount:c.vertices.length/3,
    upstreamGapMeters:Number(u.toFixed(6)),
    downstreamGapMeters:Number(d.toFixed(6)),
    worstEndpointGapMeters:Number(Math.max(u,d).toFixed(6)),
    directPairwiseWithin30cm:u<=.30&&d<=.30,
    overlapsKnownUpstreamEndpoint:upOverlap,
    overlapsKnownDownstreamEndpoint:downOverlap,
    independentSourceComponent:!upOverlap&&!downOverlap,
    originalTurfColliderFlagKnown:false as const,
    sourceActorPlacementKnown:c.placementAuthority==='STATIC_MODEL_SOURCE',
    originalHumanCapsuleRouteCertified:false as const
   };
  }).filter(x=>x.independentSourceComponent)
   .sort((x,y)=>x.worstEndpointGapMeters-y.worstEndpointGapMeters||
     x.upstreamGapMeters+x.downstreamGapMeters-
      y.upstreamGapMeters-y.downstreamGapMeters||
     x.sourceComponentId.localeCompare(y.sourceComponentId));
  const stat=list.filter(x=>x.placementAuthority==='STATIC_MODEL_SOURCE');
  const unresolved=list.filter(x=>
   x.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED');
  return {side,seamIndex:index%4 as 0|1|2|3,
   from:seam.from,to:seam.to,
   exactOriginalSourceFaceGapMeters:seam.gapMeters,
   candidateOriginalSourceMeshesExamined:
    candidates.filter(x=>x.side===side).length,
   independentStaticPairwiseNearCount:
    stat.filter(x=>x.directPairwiseWithin30cm).length,
   independentUnplacedPairwiseNearCount:
    unresolved.filter(x=>x.directPairwiseWithin30cm).length,
   nearestIndependentStatic:stat.slice(0,3),
   nearestIndependentUnplaced:unresolved.slice(0,3),
   originalVersion72CollisionFlagsCertified:false as const,
   stageRouteOrNavEnabled:false as const
  };
 });
 if(rows.length!==8||rows.some(x=>x.candidateOriginalSourceMeshesExamined!==27))
  throw Error('T21_W10_EIGHT_SEAMS_INCOMPLETE_SIDE');
 return {
  source:'CI688_EXACT_TEMPLE01_EIGHT_FACE_CHAIN_SEAMS' as const,
  eightSeamsAreProvenSameAsArchivedRecastEightGaps:false as const,
  numberOfExactSourceFaceSeams:8 as const,
  totalUniqueSourceCandidates:candidates.length,
  previousStaticSourceCandidates:b9Count,
  addedBatch2Candidates:UNDERTOW_T21_SOURCE_BATCH2_MESHES.length,
  sourceDuplicatesExcluded:duplicateSourceIdentities,
  rows,
  remainingEvidence:['7.2.0 Turf collision face/flags',
   'SetActor PntSet active transform/placement',
   'actual full-size HUMAN Rapier KCC and Recast traversal'] as const,
  originalSolids:25 as const,originalPaint:17 as const,
  originalNavLinks:26 as const,originalScoreable:0 as const,
  runtimeGeometryAdded:0 as const,navLinksAdded:0 as const,
  officialGameplayCertified:false as const,
  productionAuthorized:false as const
 };
}
