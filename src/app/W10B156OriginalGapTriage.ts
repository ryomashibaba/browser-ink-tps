/** B156: classify REAL B155 original-route witnesses, without building floors.
 * A two-endpoint Recast projection is not an authored walkable connection.
 * The five stage rays are vertically interpolated diagnostic samples,
 * never a substitute for the original source or real character KCC.
 */
import type {B155SourceConnectivityReview,B155RouteWitness}
 from './W10B155OriginalSourceConnectivityReview';

type Id=B155RouteWitness['id'];
export type B156GapClass=
 'RECAST_PATH_STOPS_SHORT_ENDPOINTS_NEAR_NAVMESH'|
 'RECAST_QUERY_UNAVAILABLE'|'NAVMESH_ENDPOINT_PROJECTION_UNVERIFIED'|
 'RECAST_REACHED_BUT_UNCERTIFIED_PHYSICAL_ROUTE'|
 'UNRESOLVED_WITH_CURRENT_MEASUREMENTS';
export interface B156OriginalGapWitness{
 id:Id;
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 recastClassification:B156GapClass;
 navStartSnapMeters:number|null;
 navGoalSnapMeters:number|null;
 remainingNativeEndpointErrorMeters:number|null;
 nativePathTerminal:readonly [number,number,number]|null;
 originalRegisteredSourceRayMissingAtMidspan:readonly number[];
 originalRegisteredSourceRayVerticalOffsetAt:readonly number[];
 originalStartSolid:string|null;
 originalEndSolid:string|null;
 // Does NOT diagnose missing original geometry, only registered rays.
 originalObjFaceCoverageInvestigated:false;
 realCharacterCapsuleTraverseCertified:false;
 sourceGeometryOrNavLinkApproved:false;
 priority:'ORIGINAL_MIDSPAN_FACE_AND_KCC_SUPPORT_FIRST';
}
export interface B156OriginalGapTriage{
 source:'ORIGINAL_B155_REAL_RECAST_AND_RAPIER_EVIDENCE';
 originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE';
 knownSixAuthoredRecastEndpointPaths:number;
 heldGapCount:2;
 sides:readonly B156OriginalGapWitness[];
 bothSidesNativeRecastStoppedShort:boolean;
 bothSidesSourceMidspanRayNotSupported:boolean;
 // This is a static diagnostic: NO inferred new full source floor.
 exactOriginalTriangleGapProven:false;
 runtimeNavmeshConnectionApproved:false;
 originalScoreableCellApproved:false;
 originalOppositeTeamNaturalRoutes:'0/12';
 original4v4Certified:false;
 productionAuthorized:false;
 nextSourceEvidence:'REGISTERED_MIDSPAN_COLLIDER_VS_PRIVATE_ORIGINAL_OBJ_FACES_AND_REAL_KCC';
}

const finite=(x:number|null):x is number=>
 typeof x==='number'&&Number.isFinite(x)&&x>=0;
function classify(g:B155RouteWitness):B156GapClass{
 if(!g.recastQuerySucceeded)
  return 'RECAST_QUERY_UNAVAILABLE';
 if(!finite(g.recastStartSnapMeters)||!finite(g.recastEndSnapMeters)||
    g.recastStartSnapMeters>0.5||g.recastEndSnapMeters>0.5)
  return 'NAVMESH_ENDPOINT_PROJECTION_UNVERIFIED';
 if(g.recastEndpointReached)
  return 'RECAST_REACHED_BUT_UNCERTIFIED_PHYSICAL_ROUTE';
 if(finite(g.recastEndpointErrorMeters)&&g.recastEndpointErrorMeters>5)
  return 'RECAST_PATH_STOPS_SHORT_ENDPOINTS_NEAR_NAVMESH';
 return 'UNRESOLVED_WITH_CURRENT_MEASUREMENTS';
}
export function triageB156OriginalGaps(
 data:B155SourceConnectivityReview
):B156OriginalGapTriage{
 if(data.source!=='REAL_RECAST_PATH_AND_REGISTERED_ORIGINAL_RAPIER_STAGE_RAYS'||
   data.stage!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
   data.originalNaturalOpponentRoutes!=='0/12'||
   data.activationReady!==false||data.productionAuthorized!==false||
   data.unrestricted4v4Certified!==false||
   data.scoreablePromotions!==0||data.modifiedNavLinks!==false||
   data.modifiedStageGeometry!==false||data.modifiedActorPositions!==false||
   data.actualPlayerKccTraversalCertified!==false||
   data.routes.length!==8||data.heldDiagnosticGaps!==2||
   new Set(data.routes.map(r=>r.id)).size!==8)
  throw Error('B156_ORIGINAL_EVIDENCE_AUTHORITY_MISMATCH');
 const gaps=data.routes.filter(r=>r.type==='DIAGNOSTIC_GAP');
 if(gaps.length!==2||
  !gaps.some(g=>g.id==='right-low-to-underpass-positive-z')||
  !gaps.some(g=>g.id==='right-low-to-underpass-negative-z')||
  data.routes.filter(r=>r.type==='MUST_REACH').length!==6||
  data.mustReachRecastPaths!==
   data.routes.filter(r=>r.type==='MUST_REACH'&&r.recastEndpointReached).length)
  throw Error('B156_UNEXPECTED_AUTHORED_PROBES_OR_RECAST_COUNTS');
 const sides=gaps.map(g=>{
  if(g.status!=='UNVERIFIED_SOURCE_GAP'||g.physicallyCertified!==false||
   g.originalStageRayWitnesses.length!==5||
   g.originalStageRayWitnesses.some((v,i)=>
     Math.abs(v.fraction-i*.25)>1e-9)||
   g.recastPathPoints<0)
   throw Error('B156_INVALID_SOURCE_GAP_WITNESS');
  const missing=g.originalStageRayWitnesses.filter(v=>
   v.fraction>0&&v.fraction<1&&v.originalSolidId===null)
   .map(v=>v.fraction);
  const offset=g.originalStageRayWitnesses.filter(v=>
   v.fraction>0&&v.fraction<1&&
   v.originalSolidId!==null&&v.apparentOriginalSupport===false)
   .map(v=>v.fraction);
  return {
   id:g.id,
   side:g.id.endsWith('positive-z')?'POSITIVE_Z' as const:
    'NEGATIVE_Z' as const,
   recastClassification:classify(g),
   navStartSnapMeters:g.recastStartSnapMeters,
   navGoalSnapMeters:g.recastEndSnapMeters,
   remainingNativeEndpointErrorMeters:g.recastEndpointErrorMeters,
   nativePathTerminal:g.recastPathTerminal??null,
   originalRegisteredSourceRayMissingAtMidspan:missing,
   originalRegisteredSourceRayVerticalOffsetAt:offset,
   originalStartSolid:g.originalStageRayWitnesses[0]?.originalSolidId??null,
   originalEndSolid:g.originalStageRayWitnesses[4]?.originalSolidId??null,
   originalObjFaceCoverageInvestigated:false as const,
   realCharacterCapsuleTraverseCertified:false as const,
   sourceGeometryOrNavLinkApproved:false as const,
   priority:'ORIGINAL_MIDSPAN_FACE_AND_KCC_SUPPORT_FIRST' as const
  };
 });
 return {
  source:'ORIGINAL_B155_REAL_RECAST_AND_RAPIER_EVIDENCE',
  originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  knownSixAuthoredRecastEndpointPaths:data.mustReachRecastPaths,
  heldGapCount:2,
  sides,
  bothSidesNativeRecastStoppedShort:sides.every(s=>
   s.recastClassification==='RECAST_PATH_STOPS_SHORT_ENDPOINTS_NEAR_NAVMESH'),
  bothSidesSourceMidspanRayNotSupported:sides.every(s=>
   s.originalRegisteredSourceRayMissingAtMidspan.length>0||
   s.originalRegisteredSourceRayVerticalOffsetAt.length>0),
  exactOriginalTriangleGapProven:false,
  runtimeNavmeshConnectionApproved:false,
  originalScoreableCellApproved:false,
  originalOppositeTeamNaturalRoutes:'0/12',
  original4v4Certified:false,productionAuthorized:false,
  nextSourceEvidence:'REGISTERED_MIDSPAN_COLLIDER_VS_PRIVATE_ORIGINAL_OBJ_FACES_AND_REAL_KCC'
 };
}
