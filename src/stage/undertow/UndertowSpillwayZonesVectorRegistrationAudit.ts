import { UNDERTOW_UNDERPASS_NAV_AUDIT } from './UndertowSpillwayModelXZGeometry';
import { UNDERTOW_VECTOR_BLUEPRINT_SOURCE } from './UndertowSpillwayVectorBlueprint';
import {
  UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS,
  UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT,
  UNDERTOW_ZONES_VECTOR_SOURCE
} from './UndertowSpillwayZonesVectorGeometry';

export const UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT = Object.freeze({
  round: 8,
  scope: 'CURRENT_SPLAT_ZONES_VECTOR_REGISTRATION' as const,
  source: Object.freeze({
    author: UNDERTOW_ZONES_VECTOR_SOURCE.author,
    mode: UNDERTOW_ZONES_VECTOR_SOURCE.mode,
    stage: UNDERTOW_ZONES_VECTOR_SOURCE.stage,
    updated: UNDERTOW_ZONES_VECTOR_SOURCE.updated,
    fileBytes: UNDERTOW_ZONES_VECTOR_SOURCE.fileBytes,
    sha256: UNDERTOW_ZONES_VECTOR_SOURCE.sha256,
    sourceIsCurrentPostVer720: true,
    sourcePdfDirectlyVerified: true,
    sourcePdfIsSinglePageVectorDocument: true,
    legendDefinesDashDotEnclosureAsZone: true,
    sourceProvidesExactDrawnZoneBoundary: true,
    rawPdfBytesRecovered: true,
    exactDashDotVectorSupportRecovered: true,
    notes:
      'Resolution Pass 8 recovered the actual public Sunfish PDF bytes. The 0.72pt dash-dot boundary is emitted as discrete vector fragments; grouping those fragments by support line recovers two exact six-vertex objective rings without screenshot tracing.'
  }),
  crossModeRegistration: Object.freeze({
    existingTurfPdfPageWidthPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageWidthPoints,
    existingTurfPdfPageHeightPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageHeightPoints,
    existingTurfPointsPerProjectMeter:
      UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pointsPerProjectMeter,
    currentZonesSharesAuthorAndUpdateDateWithTurf: true,
    currentZonesUsesSameOverallA4DrawingConvention: true,
    currentZonesModeGeometryIsNotIdenticalToTurf: true,
    commonAnchorVerificationPerformed: true,
    comparedOuterAnchorCount:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.comparedOuterAnchorCount,
    sharedOuterAnchorCount:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.sharedOuterAnchorCount,
    modeSpecificChangedOuterAnchorCount:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.modeSpecificChangedOuterAnchorCount,
    maxSharedOuterAnchorResidualPoints:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.maxSharedOuterAnchorResidualPoints,
    maxSharedOuterAnchorResidualMeters:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.maxSharedOuterAnchorResidualMeters,
    safeToReuseTurfCoordinateTransformAfterAnchorVerification: true,
    notes:
      '40/42 exterior hard-edge anchors are exact shared coordinates to <=0.000052pt. The two excluded anchors are the mirrored mode-specific geometry changes, so the existing Turf PDF coordinate transform is reused only after this numerical verification.'
  }),
  objectiveConstraints: Object.freeze({
    objectiveCount: 2,
    gameWatchReportsZoneSizeUnchangedByVer720Rework: true,
    currentZonesLocatedInLeftRightCentralPassages: true,
    underpassFloorProjectY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYProjectMeters,
    underpassFloorModelY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYModelMeters,
    objectiveSubregionKnownToBePaintable: true,
    exactObjectivePdfVerticesRecovered: true,
    exactObjectiveMetricVerticesRecovered: true,
    exactObjectiveAreaSquareMetersRecovered: true,
    verticesPerObjective:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.exactPdfVertexCountPerZone,
    areaSquareMetersPerObjective:
      UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.negativeZ.areaSquareMeters,
    projectRotationSymmetryResidualMeters:
      UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT.projectRotationSymmetryResidualMeters,
    registeredAgainstProjectY0Underpass: true,
    notes:
      'Each exact source objective ring is a six-vertex L polygon with 117.29875m² plan area. Only its registered intersection with the audited project-Y=0 underpass floor is promoted as a paint subregion; the whole underpass remains unresolved.'
  }),
  publicDataFallback: Object.freeze({
    temple01SplatZoneInstancePlacementFound: false,
    temple01ObjectiveActorTransformFound: false,
    temple01VAreaInstanceValuesFound: false,
    publicSchemaOnlyHasGenericIsIncludeVArea: true,
    oldTemple00ExactZonePlacementFound: false,
    fallbackNoLongerRequiredForVectorRegistration: true,
    notes:
      'Actor-volume fallback remains unavailable, but it is no longer required for planimetric registration because the exact current public vector source has been recovered.'
  }),
  toolingBoundary: Object.freeze({
    webCanRenderPdfPage: true,
    webCanExposePdfText: true,
    rawPdfVectorPathAccessibleToRepositoryAutomation: true,
    rasterManualTracingAllowedForAuthorityPromotion: false,
    approximateScreenshotMeasurementAllowedForAuthorityPromotion: false,
    notes:
      'GitHub Actions now downloads the public PDF and PyMuPDF extracts its vector fragments. Raster/manual tracing remains forbidden for canonical objective geometry.'
  }),
  runtimePromotionAuthorized: false,
  paintSurfacePromotionAuthorized: true,
  activationBlockerCleared: false,
  nextEvidenceNeeded: [
    'Separate current evidence for project-Y=0 underpass cells outside the registered objective intersections before promoting any remainder of either underpass solid.'
  ] as const,
  notes:
    'Resolution Pass 8 closes the exact current Zones vector-registration gap and authorizes only two inert objective-intersection PaintSurfaces. Production Undertow activation, Turf Scoreable authority, and whole-underpass paint authority remain blocked.'
});

export function undertowZonesVectorRegistrationAuditErrors(): readonly string[] {
  const audit = UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT;
  const errors: string[] = [];

  if (
    !audit.source.sourceIsCurrentPostVer720 ||
    !audit.source.sourcePdfDirectlyVerified ||
    !audit.source.sourcePdfIsSinglePageVectorDocument ||
    !audit.source.legendDefinesDashDotEnclosureAsZone ||
    !audit.source.sourceProvidesExactDrawnZoneBoundary ||
    !audit.source.rawPdfBytesRecovered ||
    !audit.source.exactDashDotVectorSupportRecovered
  ) {
    errors.push('current Sunfish Zones source/vector recovery drifted');
  }

  if (
    !audit.crossModeRegistration.currentZonesSharesAuthorAndUpdateDateWithTurf ||
    !audit.crossModeRegistration.currentZonesUsesSameOverallA4DrawingConvention ||
    !audit.crossModeRegistration.currentZonesModeGeometryIsNotIdenticalToTurf ||
    !audit.crossModeRegistration.commonAnchorVerificationPerformed ||
    audit.crossModeRegistration.sharedOuterAnchorCount !== 40 ||
    audit.crossModeRegistration.modeSpecificChangedOuterAnchorCount !== 2 ||
    audit.crossModeRegistration.maxSharedOuterAnchorResidualMeters > 0.00002 ||
    !audit.crossModeRegistration.safeToReuseTurfCoordinateTransformAfterAnchorVerification
  ) {
    errors.push('cross-mode PDF registration verification drifted');
  }

  if (
    audit.objectiveConstraints.objectiveCount !== 2 ||
    !audit.objectiveConstraints.gameWatchReportsZoneSizeUnchangedByVer720Rework ||
    !audit.objectiveConstraints.objectiveSubregionKnownToBePaintable ||
    !audit.objectiveConstraints.exactObjectivePdfVerticesRecovered ||
    !audit.objectiveConstraints.exactObjectiveMetricVerticesRecovered ||
    !audit.objectiveConstraints.exactObjectiveAreaSquareMetersRecovered ||
    audit.objectiveConstraints.verticesPerObjective !== 6 ||
    Math.abs(audit.objectiveConstraints.areaSquareMetersPerObjective - 117.29875) > 1e-6 ||
    !audit.objectiveConstraints.registeredAgainstProjectY0Underpass
  ) {
    errors.push('exact objective-vector registration drifted');
  }

  if (
    !audit.toolingBoundary.webCanRenderPdfPage ||
    !audit.toolingBoundary.webCanExposePdfText ||
    !audit.toolingBoundary.rawPdfVectorPathAccessibleToRepositoryAutomation ||
    audit.toolingBoundary.rasterManualTracingAllowedForAuthorityPromotion ||
    audit.toolingBoundary.approximateScreenshotMeasurementAllowedForAuthorityPromotion
  ) {
    errors.push('vector-access tooling boundary drifted');
  }

  if (
    audit.runtimePromotionAuthorized ||
    !audit.paintSurfacePromotionAuthorized ||
    audit.activationBlockerCleared
  ) {
    errors.push('Pass 8 may promote only inert objective paint subregions');
  }

  if (audit.nextEvidenceNeeded.length !== 1) {
    errors.push('remaining underpass paint evidence gap is not localized');
  }

  return errors;
}
