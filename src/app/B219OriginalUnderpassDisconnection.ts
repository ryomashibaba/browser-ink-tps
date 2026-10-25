/** B219. Diagnose—not authorize—the original Temple01 corridor by
 * cross-referencing B218 exact source 3D face seams with B159 true native
 * Recast nearest-poly and registered Rapier stage observations.
 * Nearest NavMesh projection and ray hits do not prove walkable faces.
 * The CI691 five-component-per-side Recast failure remains binding.
 */
import type {b218OriginalRouteFaceChainSeams}
 from './B218OriginalRouteFaceChainSeams';
import type {B159OriginalFaceNavMeshGate}
 from './W10B159OriginalFaceNavMeshProjection';

export interface B219ObservedFaceComponent {
 readonly id:string;
 readonly side:'POSITIVE_Z'|'NEGATIVE_Z';
 readonly originalFaceCount:number;
 readonly nearNavMeshSamples035m:number;
 readonly rayHitRegisteredOriginalSolidCount:number;
 readonly exactSourceComponentColliderHitCount:number;
}
type B218=ReturnType<typeof b218OriginalRouteFaceChainSeams>;
type B159=Pick<B159OriginalFaceNavMeshGate,
 'source'|'originalAuthority'|'sourceOriginalFaceCount'|
 'originalComponentCount'|'attemptedRealNavMeshProjectionQueries'|
 'realOriginalStageRayQueries'|
 'priorCi691ExperimentalFivePerSideInsertionReachedGoal'|
 'addedStageGeometry'|'addedOffmeshLinks'|'addedScoreableRegions'|
 'originalTwoTeamTraversalCertified'|'productionAuthorized'> & {
 readonly components:readonly B219ObservedFaceComponent[]
};
export type B219SeamClassification=
 'EXACT_ORIGINAL_TRIANGLE_GAP_OVER_30CM'|
 'CLOSE_ORIGINAL_FACES_BUT_SOURCE_NAV_PROJECTION_INCOMPLETE'|
 'CLOSE_SOURCE_FACES_NOT_CERTIFIED_AS_CONNECTED_NAVMESH';
export function b219TriageOriginalNavmeshSourceFailure(
 b218:B218,b159:B159
){
 if(b218.originalAuthority!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    b218.adjacentSeams!==8||b218.seams.length!==8||
    b218.previousAllFiveFaceRecastExperimentSucceeded!==false||
    b218.nativeTraversalCertified!==false||
    b218.actualKccTraversalCertified!==false||
    b218.inventedStageSolids!==0||b218.navLinksAdded!==0||
    b218.scoreablePromotions!==0||b218.productionAuthorized!==false||
    b159.source!==
      'CI688_EXACT_SOURCE_FACES_VS_UNMODIFIED_NATIVE_RECAST_AND_RAPIER'||
    b159.originalAuthority!==b218.originalAuthority||
    b159.sourceOriginalFaceCount!==42||
    b159.originalComponentCount!==10||
    b159.attemptedRealNavMeshProjectionQueries!==42||
    b159.realOriginalStageRayQueries!==42||
    b159.priorCi691ExperimentalFivePerSideInsertionReachedGoal!==false||
    b159.addedStageGeometry!==0||b159.addedOffmeshLinks!==0||
    b159.addedScoreableRegions!==0||
    b159.originalTwoTeamTraversalCertified!==false||
    b159.productionAuthorized!==false||
    b159.components.length!==10)
  throw Error('B219_REQUIRES_UNMODIFIED_ORIGINAL_SOURCE_NEGATIVE_EVIDENCE');
 const components=new Map(b159.components.map(x=>[x.id,x]));
 if(components.size!==10||
    b159.components.reduce((sum,x)=>sum+x.originalFaceCount,0)!==42||
    b159.components.some(x=>x.originalFaceCount<=0||
      ![x.nearNavMeshSamples035m,x.rayHitRegisteredOriginalSolidCount,
        x.exactSourceComponentColliderHitCount].every(n=>
         Number.isSafeInteger(n)&&n>=0&&n<=x.originalFaceCount)))
  throw Error('B219_SOURCE_FACE_PROJECTION_SAMPLE_CONFLICT');
 const results=b218.seams.map(seam=>{
  const a=components.get(seam.from),b=components.get(seam.to);
  if(!a||!b||a.side!==seam.side||b.side!==seam.side||
     !Number.isFinite(seam.gapMeters)||seam.gapMeters<0||
     seam.nativeConnectedCertified!==false||
     seam.physicalKccCertified!==false)
   throw Error('B219_INVALID_ORIGINAL_SOURCE_GEOMETRIC_PAIR');
  const sourceGeometricSeparation=seam.gapMeters>.3;
  const sourceNavProjectionIncomplete=
   a.nearNavMeshSamples035m<a.originalFaceCount||
   b.nearNavMeshSamples035m<b.originalFaceCount;
  const code:B219SeamClassification=sourceGeometricSeparation?
    'EXACT_ORIGINAL_TRIANGLE_GAP_OVER_30CM':
    sourceNavProjectionIncomplete?
    'CLOSE_ORIGINAL_FACES_BUT_SOURCE_NAV_PROJECTION_INCOMPLETE':
    'CLOSE_SOURCE_FACES_NOT_CERTIFIED_AS_CONNECTED_NAVMESH';
  // Priority means what to INSPECT, not where to create a bridge.
  const priority=sourceGeometricSeparation?0:
   sourceNavProjectionIncomplete?1:2;
  return {
   side:seam.side,from:seam.from,to:seam.to,
   exactSourceGapMeters:seam.gapMeters,
   originalCi688SourceGraphComponents:seam.priorGraphComponents,
   oldSourceGraphComponentsDiffer:
    seam.priorGraphComponents[0]!==seam.priorGraphComponents[1],
   realRecastNearFaceSamples:
    [a.nearNavMeshSamples035m,b.nearNavMeshSamples035m] as const,
   sourceFaceCounts:[a.originalFaceCount,b.originalFaceCount] as const,
   registeredRapierRayHits:
    [a.rayHitRegisteredOriginalSolidCount,
     b.rayHitRegisteredOriginalSolidCount] as const,
   exactComponentColliderRayHits:
    [a.exactSourceComponentColliderHitCount,
     b.exactSourceComponentColliderHitCount] as const,
   diagnosis:code,
   inspectionPriority:priority,
   actualNativePathFound:false as const,
   actualHumanKccTraversalProven:false as const
  };
 });
 const ranked=[...results].sort((a,b)=>a.inspectionPriority-b.inspectionPriority||
  b.exactSourceGapMeters-a.exactSourceGapMeters||
  a.side.localeCompare(b.side));
 return {
  source:'B218_EXACT_TRIANGLE_SEAMS_X_B159_NATIVE_RECAST_RAPIER_OBSERVATIONS' as const,
  originalAuthority:b218.originalAuthority,
  sourceFaces:42 as const,comparedSourceSeams:8 as const,
  registeredOriginalGeometryPreserved:true as const,
  results,priorityRankedSeams:ranked,
  firstCandidateToInspect:ranked[0]??null,
  measuredGeometricGapsOver30cm:
   results.filter(x=>x.diagnosis==='EXACT_ORIGINAL_TRIANGLE_GAP_OVER_30CM').length,
  sourceOriginalRecastNearFaceSamples:
   b159.components.reduce((sum,x)=>sum+x.nearNavMeshSamples035m,0),
  actualRegisteredRapierRayHits:
   b159.components.reduce((sum,x)=>sum+x.rayHitRegisteredOriginalSolidCount,0),
  priorCi691AllComponentsAddedButRecastFailed:true as const,
  originalActorMovementNewlyVerified:false as const,
  originalEnemyNativeFootRoutesCertified:'0/12' as const,
  nativeRecastCorridorCertified:false as const,
  physicalKccCorridorCertified:false as const,
  addedGeometry:0 as const,addedNavLinks:0 as const,
  sourceScoreableAdded:0 as const,productionAuthorized:false as const,
  nextAction:'INSPECT_HIGHEST_PRIORITY_TRUE_SOURCE_GAP_AND_RECAST_NEIGHBORHOOD_BEFORE_ANY_GEOMETRY_CHANGE' as const
 };
}
