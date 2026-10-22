/**
 * W10-B113: one-click local export of native original-stage human fall witness.
 * Strictly QA-only. Validates read-only original source authority; an event is
 * a *suspected* unsupported descent, never source hole or 4v4 certification.
 */
import type {W10B112HumanGroundLedger} from './W10B112HumanGroundLedger';
export type B113OriginalGroundSnapshot=
 ReturnType<W10B112HumanGroundLedger['snapshot']>;
export type B113HumanFallInput={
 nativeTick:number;
 humanBody:[number,number,number];
 originalSourceSolids:number;
 originalPaintSurfaces:number;
 originalSourceNavigationLinks:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified:boolean;
 matchState:string;
 stopReason:string|null;
 footLedger:B113OriginalGroundSnapshot;
};
export function buildB113NativeFloorTrace(input:B113HumanFallInput){
 const l=input.footLedger;
 if(input.originalSourceSolids!==25||
    input.originalPaintSurfaces!==17||
    input.originalSourceNavigationLinks!==26||
    input.sourceScoreablePromotions!==0||
    input.productionAuthorized!==false||
    input.unrestricted4v4Certified!==false||
    l.enabled!==true||
    l.originalStageGeometryModified!==false||
    l.noActorPositionMutation!==true||
    l.sourceFloorHoleCertified!==false||
    l.formal4v4Certified!==false)
  throw Error('B113_ORIGINAL_SOURCE_AUTHORITY_NOT_VERIFIED');
 if(!Number.isSafeInteger(input.nativeTick)||input.nativeTick<0||
    !input.humanBody.every(Number.isFinite)||
    (l.lastNativeTick!==null&&l.lastNativeTick>input.nativeTick)||
    !Number.isSafeInteger(l.suspicionCount)||
    l.suspicionCount!==l.suspicions.length)
  throw Error('B113_INCONSISTENT_TRUE_NATIVE_FOOT_WITNESS');
 return {
  schema:'W10_B113_MANUAL_ORIGINAL_FLOOR_TRACE_V1' as const,
  classification:l.suspicionCount>0?
   'UNSUPPORTED_DESCENT_SUSPECT_ONLY' as const:
   'NO_UNSUPPORTED_DESCENT_OBSERVED_IN_BOUNDED_WINDOW' as const,
  stage:'T21_ORIGINAL_SOURCE_QA_ONLY' as const,
  genuineNativeTick:input.nativeTick,
  actualHumanBody:[...input.humanBody] as [number,number,number],
  matchState:input.matchState,stopReason:input.stopReason,
  originalSourceAuthority:[25,17,26,0] as const,
  observedOriginalFoot:l,
  authenticSuspectedDescentEvents:l.suspicionCount,
  originalSourceFloorHoleCertified:false as const,
  naturalCrossTeamRouteCertified:false as const,
  unrestricted4v4Certified:false as const,
  productionAuthorized:false as const,
  geometryAdded:0 as const,actorTeleportsByThisTool:0 as const,
  evidenceExport:'EXPLICIT_LOCAL_USER_CLICK_NO_AUTO_UPLOAD' as const
 };
}
