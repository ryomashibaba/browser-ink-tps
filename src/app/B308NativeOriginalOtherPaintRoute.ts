/** B308 read-only original 17 PaintSurface native Recast opportunity.
 * A NavMesh query is NEVER proof of a physical human KCC traversal. */
export type B308NativeRouteCandidate={
 surfaceId:string;actualOwnerCells:number;activeFootprintCells:number;
 sourceCellWorld:readonly [number,number,number];
 playerToCellEuclideanMeters:number;
 startSnapDistanceMeters:number|null;endSnapDistanceMeters:number|null;
 nativePathQuerySuccess:boolean;nativePathPointCount:number;
 nativePathEndpointErrorMeters:number|null;nativePathReachesSnappedTarget:boolean;
 strictNativeNavCandidateOnly:boolean;
};
export const B308_BOUNDARY=Object.freeze({
 source:'25/17/26/0',readOnly:true as const,originalSurfaces:17 as const,
 originalRapierSolids:25 as const,originalNavLinks:26 as const,
 originalScoreable:0 as const,recastPathNotHumanKccProof:true as const,
 noSyntheticTravel:true as const,sourceGeometryOrInkEdited:false as const,
 noActorRelocation:true as const,
 official4v4Certified:false as const,artAccepted:false as const,
 productionAuthorized:false as const
});
export function b308NativeRouteOpportunityGate(x:{
 requested:boolean;paused:boolean;locked:boolean;stopped:boolean;
 fullRound:boolean;phase:string;tick:number;shots:number;humanCells:number;
 movedMeters:number;originalActors:boolean;actorsRelocated:number;
 solids:number;paint:number;links:number;scoreable:number;
}){
 return x.requested&&x.paused&&!x.locked&&!x.stopped&&x.fullRound&&
  (x.phase==='STAGING'||x.phase==='PLAYING')&&x.tick>=42&&
  x.shots>=1&&x.humanCells>=1&&x.movedMeters>=.75&&
  x.originalActors&&x.actorsRelocated===0&&x.solids===25&&
  x.paint===17&&x.links===26&&x.scoreable===0;
}
export function b308NativePathIsOnlyCandidate(x:{
 querySuccess:boolean;pointCount:number;startSnap:number;
 endSnap:number;endpointError:number;reachedTarget:boolean
}){
 return x.querySuccess&&x.pointCount>=2&&x.reachedTarget&&
  Number.isFinite(x.startSnap)&&x.startSnap<=.45&&
  Number.isFinite(x.endSnap)&&x.endSnap<=.45&&
  Number.isFinite(x.endpointError)&&x.endpointError<=.6;
}
export function b308SummarizeNativeOriginalSurfaces(
 rows:readonly B308NativeRouteCandidate[],actualOwnedTotal:number){
 if(rows.length!==17||new Set(rows.map(r=>r.surfaceId)).size!==17||
    !Number.isSafeInteger(actualOwnedTotal)||actualOwnedTotal<1||
    rows.some(r=>!r.surfaceId||
      !Number.isSafeInteger(r.actualOwnerCells)||r.actualOwnerCells<0||
      !Number.isSafeInteger(r.activeFootprintCells)||r.activeFootprintCells<1||
      r.actualOwnerCells>r.activeFootprintCells||
      r.sourceCellWorld.length!==3||
      !r.sourceCellWorld.every(Number.isFinite)||
      !Number.isFinite(r.playerToCellEuclideanMeters)||
      r.playerToCellEuclideanMeters<0||
      r.strictNativeNavCandidateOnly!==
       b308NativePathIsOnlyCandidate({
        querySuccess:r.nativePathQuerySuccess,pointCount:r.nativePathPointCount,
        startSnap:r.startSnapDistanceMeters??Infinity,
        endSnap:r.endSnapDistanceMeters??Infinity,
        endpointError:r.nativePathEndpointErrorMeters??Infinity,
        reachedTarget:r.nativePathReachesSnappedTarget
       }))||
    rows.reduce((a,r)=>a+r.actualOwnerCells,0)!==actualOwnedTotal)
   throw Error('B308_GENUINE_SEVENTEEN_SURFACE_NATIVE_ROUTE_EVIDENCE_INVALID');
 const candidates=rows.filter(r=>r.actualOwnerCells===0&&
  r.strictNativeNavCandidateOnly).sort((a,b)=>
   a.playerToCellEuclideanMeters-b.playerToCellEuclideanMeters);
 const painted=rows.filter(r=>r.actualOwnerCells>0);
 return {schema:'B308_NATIVE_SEVENTEEN_ORIGINAL_SURFACE_RECAST_ONLY_OPPORTUNITY',
  originalPaintedSurfaceCount:painted.length,
  originallyUnpaintedSurfaces:17-painted.length,
  currentlyPaintedSurfaceIds:painted.map(x=>x.surfaceId),
  nextUnpaintedNativeNavCandidateCount:candidates.length,
  candidateSourceIds:candidates.map(x=>x.surfaceId),
  noPhysicallyCertifiedOtherSurfaceYet:true,
  originalSurfaceRows:rows,...B308_BOUNDARY};
}
