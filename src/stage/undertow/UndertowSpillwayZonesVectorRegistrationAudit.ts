import { UNDERTOW_VECTOR_BLUEPRINT_SOURCE } from './UndertowSpillwayVectorBlueprint';
import { UNDERTOW_UNDERPASS_NAV_AUDIT } from './UndertowSpillwayModelXZGeometry';

export const UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT = Object.freeze({
  round: 7,
  scope: 'CURRENT_SPLAT_ZONES_VECTOR_REGISTRATION' as const,
  source: Object.freeze({
    author: 'Sunfish',
    mode: 'Splat Zones',
    stage: 'Undertow Spillway',
    updated: '2024-05-06',
    sourceIsCurrentPostVer720: true,
    sourcePdfDirectlyVerified: true,
    sourcePdfIsSinglePageVectorDocument: true,
    legendDefinesDashDotEnclosureAsZone: true,
    sourceProvidesExactDrawnZoneBoundary: true,
    notes:
      'The current post-rework Sunfish Splat Zones PDF is directly available and the author legend explicitly defines the dash-dot enclosure as the objective zone. The blocker is no longer semantic identification; it is exact coordinate extraction/registration of that vector path.'
  }),
  crossModeRegistration: Object.freeze({
    existingTurfPdfPageWidthPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageWidthPoints,
    existingTurfPdfPageHeightPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageHeightPoints,
    existingTurfPointsPerProjectMeter:
      UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pointsPerProjectMeter,
    currentZonesSharesAuthorAndUpdateDateWithTurf: true,
    currentZonesUsesSameOverallA4DrawingConvention: true,
    currentZonesModeGeometryIsNotIdenticalToTurf: true,
    safeToReuseTurfCoordinateTransformWithoutAnchorVerification: false,
    notes:
      'The current Turf and Zones drawings use the same author/date/A4 convention and visibly preserve common stage anchors, but the mode-specific geometry is not identical. Therefore the Turf PDF transform cannot be silently reused for objective vertices until common anchors are numerically verified in the Zones PDF.'
  }),
  objectiveConstraints: Object.freeze({
    objectiveCount: 2,
    gameWatchReportsZoneSizeUnchangedByVer720Rework: true,
    currentZonesLocatedInLeftRightCentralPassages: true,
    underpassFloorProjectY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYProjectMeters,
    underpassFloorModelY: UNDERTOW_UNDERPASS_NAV_AUDIT.sourceYModelMeters,
    objectiveSubregionKnownToBePaintable: true,
    exactObjectivePdfVerticesRecovered: false,
    exactObjectiveMetricVerticesRecovered: false,
    exactObjectiveAreaSquareMetersRecovered: false,
    notes:
      'The rework comparison reports unchanged Splat Zone size while central access geometry widened. This constrains future recovery but does not establish zone position or metric vertices by itself.'
  }),
  publicDataFallback: Object.freeze({
    temple01SplatZoneInstancePlacementFound: false,
    temple01ObjectiveActorTransformFound: false,
    temple01VAreaInstanceValuesFound: false,
    publicSchemaOnlyHasGenericIsIncludeVArea: true,
    oldTemple00ExactZonePlacementFound: false,
    notes:
      'Broad GitHub/public-source search found Temple01 actor schemas with IsIncludeVArea but no current Splat-Zone objective instance placement/transform payload. No authoritative old Temple00 objective placement was found either.'
  }),
  toolingBoundary: Object.freeze({
    webCanRenderPdfPage: true,
    webCanExposePdfText: true,
    rawPdfVectorPathAccessibleToRepositoryAutomation: false,
    rasterManualTracingAllowedForAuthorityPromotion: false,
    approximateScreenshotMeasurementAllowedForAuthorityPromotion: false,
    notes:
      'The current browsing path can verify/render the PDF but does not expose its vector path bytes to the repo workflow. Manual screenshot tracing would introduce avoidable measurement uncertainty and is intentionally rejected for canonical geometry.'
  }),
  runtimePromotionAuthorized: false,
  paintSurfacePromotionAuthorized: false,
  activationBlockerCleared: false,
  nextAcceptableInputs: [
    'The actual current Sunfish Zones PDF/vector path bytes (or an exact vector export) so the two dash-dot polygons can be extracted in PDF points.',
    'A current Temple01 Splat-Zone actor/volume placement payload with objective transforms.',
    'A pixel-exact current Zones raster whose common anchors are numerically registered to the existing Turf PDF transform, followed by boundary extraction with a recorded residual.'
  ] as const,
  notes:
    'Resolution Pass 7 closes the source-discovery question: the exact current objective drawing exists and has been directly verified, but canonical metric registration is still blocked by vector-coordinate access. No approximate zone polygon is introduced.'
});

export function undertowZonesVectorRegistrationAuditErrors(): readonly string[] {
  const audit = UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT;
  const errors: string[] = [];

  if (
    !audit.source.sourceIsCurrentPostVer720 ||
    !audit.source.sourcePdfDirectlyVerified ||
    !audit.source.sourcePdfIsSinglePageVectorDocument ||
    !audit.source.legendDefinesDashDotEnclosureAsZone ||
    !audit.source.sourceProvidesExactDrawnZoneBoundary
  ) {
    errors.push('current Sunfish Zones source verification drifted');
  }

  if (
    !audit.crossModeRegistration.currentZonesSharesAuthorAndUpdateDateWithTurf ||
    !audit.crossModeRegistration.currentZonesUsesSameOverallA4DrawingConvention ||
    !audit.crossModeRegistration.currentZonesModeGeometryIsNotIdenticalToTurf ||
    audit.crossModeRegistration.safeToReuseTurfCoordinateTransformWithoutAnchorVerification
  ) {
    errors.push('cross-mode PDF registration scope drifted');
  }

  if (
    audit.objectiveConstraints.objectiveCount !== 2 ||
    !audit.objectiveConstraints.gameWatchReportsZoneSizeUnchangedByVer720Rework ||
    !audit.objectiveConstraints.objectiveSubregionKnownToBePaintable ||
    audit.objectiveConstraints.exactObjectivePdfVerticesRecovered ||
    audit.objectiveConstraints.exactObjectiveMetricVerticesRecovered ||
    audit.objectiveConstraints.exactObjectiveAreaSquareMetersRecovered
  ) {
    errors.push('objective constraints must remain useful but non-metric');
  }

  if (
    audit.publicDataFallback.temple01SplatZoneInstancePlacementFound ||
    audit.publicDataFallback.temple01ObjectiveActorTransformFound ||
    audit.publicDataFallback.temple01VAreaInstanceValuesFound ||
    !audit.publicDataFallback.publicSchemaOnlyHasGenericIsIncludeVArea ||
    audit.publicDataFallback.oldTemple00ExactZonePlacementFound
  ) {
    errors.push('public objective-placement fallback search scope drifted');
  }

  if (
    !audit.toolingBoundary.webCanRenderPdfPage ||
    !audit.toolingBoundary.webCanExposePdfText ||
    audit.toolingBoundary.rawPdfVectorPathAccessibleToRepositoryAutomation ||
    audit.toolingBoundary.rasterManualTracingAllowedForAuthorityPromotion ||
    audit.toolingBoundary.approximateScreenshotMeasurementAllowedForAuthorityPromotion
  ) {
    errors.push('vector-access tooling boundary drifted');
  }

  if (
    audit.runtimePromotionAuthorized ||
    audit.paintSurfacePromotionAuthorized ||
    audit.activationBlockerCleared
  ) {
    errors.push('Resolution Pass 7 must not promote approximate objective geometry');
  }

  if (audit.nextAcceptableInputs.length !== 3) {
    errors.push('Zones registration evidence gap is not sufficiently localized');
  }

  return errors;
}
