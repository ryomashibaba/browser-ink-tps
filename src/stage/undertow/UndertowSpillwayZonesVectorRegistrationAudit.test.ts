import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT,
  undertowZonesVectorRegistrationAuditErrors
} from './UndertowSpillwayZonesVectorRegistrationAudit';

describe('T21 Undertow Splat Zones vector registration Resolution Pass 7', () => {
  it('records the exact current source but refuses approximate screenshot tracing', () => {
    expect(undertowZonesVectorRegistrationAuditErrors()).toEqual([]);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.source).toMatchObject({
      updated: '2024-05-06',
      sourceIsCurrentPostVer720: true,
      sourcePdfDirectlyVerified: true,
      sourcePdfIsSinglePageVectorDocument: true,
      legendDefinesDashDotEnclosureAsZone: true,
      sourceProvidesExactDrawnZoneBoundary: true
    });
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.toolingBoundary)
      .toMatchObject({
        webCanRenderPdfPage: true,
        webCanExposePdfText: true,
        rawPdfVectorPathAccessibleToRepositoryAutomation: false,
        rasterManualTracingAllowedForAuthorityPromotion: false,
        approximateScreenshotMeasurementAllowedForAuthorityPromotion: false
      });
  });

  it('does not silently reuse the Turf PDF transform across mode-specific geometry', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.crossModeRegistration)
      .toMatchObject({
        currentZonesSharesAuthorAndUpdateDateWithTurf: true,
        currentZonesUsesSameOverallA4DrawingConvention: true,
        currentZonesModeGeometryIsNotIdenticalToTurf: true,
        safeToReuseTurfCoordinateTransformWithoutAnchorVerification: false
      });
  });

  it('keeps useful objective constraints without claiming metric vertices', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.objectiveConstraints)
      .toMatchObject({
        objectiveCount: 2,
        gameWatchReportsZoneSizeUnchangedByVer720Rework: true,
        objectiveSubregionKnownToBePaintable: true,
        exactObjectivePdfVerticesRecovered: false,
        exactObjectiveMetricVerticesRecovered: false,
        exactObjectiveAreaSquareMetersRecovered: false
      });
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.runtimePromotionAuthorized)
      .toBe(false);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.paintSurfacePromotionAuthorized)
      .toBe(false);
  });

  it('localizes the remaining acceptable evidence paths', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.nextAcceptableInputs)
      .toHaveLength(3);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.activationBlockerCleared)
      .toBe(false);
  });
});
