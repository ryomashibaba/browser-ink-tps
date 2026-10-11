/**
 * F3F field inventory: exact known static faces vs three kinds of authority.
 * A visible original OBJ triangle is not a valid Rapier/Crowd/paint surface.
 * The stage-level acceptance boundary remains immutable, even if a source
 * geometry appears to fill the empty area in top-down captures.
 */
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import type {StageDefinition} from '../stage/StageDefinition';
import {auditF3eSourceCoverage} from './UndertowF3EOriginalSourceCoverage';

export function auditF3fRuntimePromotionGate(stage:StageDefinition){
 const {manifest}=auditF3eSourceCoverage(stage);
 if(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.runtimePromotionAuthorized!==false||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.offMeshLinkAuthorized!==false||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeInclusionReachedTarget!==false||
    UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeRouteGapAudit.runtimePromotionAuthorized!==false)
  throw Error('T21_F3F_SOURCE_CONNECTEDNESS_NOT_AUTHORIZED');
 return Object.freeze({
  originalSourceVisualOnlyMeshes:manifest.sourceComponents,
  originalSourceVisualOnlyTriangles:manifest.originalTriangles,
  originalVerifiedStaticRouteStudySegments:manifest.visualOnlyUnderpassRouteComponents,
  experimentalRecastPointCount:UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimePointCount,
  experimentalRecastEndpointErrorMeters:UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeEndpointErrorMeters,
  originalNativeWalkableActorBridgeCreated:false as const,
  physSolids:stage.solids.length,
  inkSurfaces:stage.paintSurfaces.length,
  sourceNavigationLinks:stage.navigationLinks?.length??0,
  scoreMaskPromoted:false as const,
  visualOverlayOnly:true as const,
  sourcePromotionBlocked:true as const,
  prodT20Changed:false as const
 });
}
