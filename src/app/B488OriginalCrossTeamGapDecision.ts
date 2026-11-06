/** B488: source-authority decision for one genuine native B487 observation.
 * This is a READ-ONLY F4 blocker ledger, NOT a navigation authorizer.
 * The 2026-09-30 legacy graph reports eight aggregate local gaps but does
 * not supply collision-certified per-gap mesh IDs for 7.2.0 Turf. Never
 * infer those IDs, add collision, bridge the gap, or promote Turf scoring.
 */
export interface B488LiveNativeBaseline {
 readonly source:string;
 readonly nativeTick:number;
 readonly originalOneWayDropLinks:number;
 readonly originalExplicitCrossSideLinks:number;
 readonly totalOriginalNativePathQueries:number;
 readonly nativePathReportedPairs:number;
 readonly nativeCredibleEndpointPairs:number;
 readonly nearestHumanEnemy3dMeters:number;
 readonly nearestAllyEnemy3dMeters:number;
 readonly naturalCrossTeamPathCertified:boolean;
 readonly physicalCapsuleRouteCertified:boolean;
 readonly officialWinner:string;
}
export interface B488ArchivedCentralGapBaseline {
 readonly localGapCountTotal:number;
 readonly localGapCountPerSide:number;
 readonly strictBridgeThresholdMeters:number;
 readonly strictBridgesAfterFloorLineAndFenceOverlayRemoval:number;
 readonly ordinaryWalkSurfaceRecovered:boolean;
 readonly runtimePromotionAuthorized:boolean;
 readonly offMeshLinkAuthorized:boolean;
}
export function b488OriginalCrossTeamGapDecision(
  live:B488LiveNativeBaseline,
  archive:B488ArchivedCentralGapBaseline
){
 if(live.source!=='25/17/26/0'||
    !Number.isSafeInteger(live.nativeTick)||live.nativeTick<1||
    live.originalOneWayDropLinks!==26||
    live.originalExplicitCrossSideLinks!==0||
    live.totalOriginalNativePathQueries!==16||
    !Number.isSafeInteger(live.nativePathReportedPairs)||
    live.nativePathReportedPairs<0||live.nativePathReportedPairs>16||
    !Number.isSafeInteger(live.nativeCredibleEndpointPairs)||
    live.nativeCredibleEndpointPairs<0||
    live.nativeCredibleEndpointPairs>live.nativePathReportedPairs||
    ![live.nearestHumanEnemy3dMeters,
      live.nearestAllyEnemy3dMeters].every(x=>Number.isFinite(x)&&x>=0)||
    live.naturalCrossTeamPathCertified||
    live.physicalCapsuleRouteCertified||
    live.officialWinner!=='NONE')return null;
 const archivedMatches=archive.localGapCountTotal===8&&
   archive.localGapCountPerSide===4&&
   archive.strictBridgeThresholdMeters===.30&&
   archive.strictBridgesAfterFloorLineAndFenceOverlayRemoval===0&&
   !archive.ordinaryWalkSurfaceRecovered&&
   !archive.runtimePromotionAuthorized&&!archive.offMeshLinkAuthorized;
 // A stale archive or unexpected topology must be surfaced, never treated
 // as new permission to construct the missing original walk surfaces.
 return {
  schema:'B488_ORIGINAL_CROSS_TEAM_GAP_AUTHORITY_DECISION_V1' as const,
  originalSource:'25/17/26/0' as const,
  observedNativeTick:live.nativeTick,
  currentNativeOpposingQueries:16 as const,
  currentNativeReportedPaths:live.nativePathReportedPairs,
  currentNativeCredibleEndpointPairs:live.nativeCredibleEndpointPairs,
  nearestHumanEnemy3dMeters:live.nearestHumanEnemy3dMeters,
  nearestAllyEnemy3dMeters:live.nearestAllyEnemy3dMeters,
  archivedAuditCompatible:archivedMatches,
  archivedUnresolvedLocalGaps:archivedMatches?8:null,
  archivedUnresolvedGapsPerSide:archivedMatches?4:null,
  // No archived source mesh/face IDs are assigned to any of the eight
  // crossings here; aggregate counts are not collision provenance.
  individuallyProvenOriginalGapCollisionFaces:0 as const,
  candidateRuntimeStagePromotionAuthorized:false as const,
  sourceCollisionFlagFor7_2TurfVerified:false as const,
  originalCpuCapsuleContinuousTraversalVerified:false as const,
  originalFull4v4Certified:false as const,
  officialScoreable:0 as const,
  officialWinner:'NONE' as const,
  actorPhysicsNavMeshInkClockScoreWrites:0 as const,
  nextRequiredEvidence:[
   '8 original gap endpoint pairs with mesh/face provenance',
   '7.2.0 Turf collision flags per original gap face',
   'unchanged-radius real Recast plus full Rapier capsule traversal',
   'native opposing CPU/human route, projectile/HP/respawn evidence'
  ] as const,
  verdict:archivedMatches?
   'HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING' as const:
   'HOLD_ARCHIVED_SOURCE_BASELINE_DRIFT' as const
 };
}
