import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT,
  undertowZonesVectorRegistrationAuditErrors
} from './UndertowSpillwayZonesVectorRegistrationAudit';

describe('T21 Undertow Splat Zones vector registration Resolution Pass 8', () => {
  it('pins the recovered current vector source instead of screenshot tracing', () => {
    expect(undertowZonesVectorRegistrationAuditErrors()).toEqual([]);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.source).toMatchObject({
      updated: '2024-05-06',
      fileBytes: 112898,
      sha256: 'ae2c24c3cc0ed09d5711e229deb7fb6535c3ef6505ea7dead1aca5e69c4d1596',
      sourceIsCurrentPostVer720: true,
      rawPdfBytesRecovered: true,
      exactDashDotVectorSupportRecovered: true
    });
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.toolingBoundary)
      .toMatchObject({
        rawPdfVectorPathAccessibleToRepositoryAutomation: true,
        rasterManualTracingAllowedForAuthorityPromotion: false,
        approximateScreenshotMeasurementAllowedForAuthorityPromotion: false
      });
  });

  it('reuses the Turf transform only after numerical common-anchor verification', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.crossModeRegistration)
      .toMatchObject({
        commonAnchorVerificationPerformed: true,
        comparedOuterAnchorCount: 42,
        sharedOuterAnchorCount: 40,
        modeSpecificChangedOuterAnchorCount: 2,
        safeToReuseTurfCoordinateTransformAfterAnchorVerification: true
      });
    expect(
      UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.crossModeRegistration
        .maxSharedOuterAnchorResidualMeters
    ).toBeLessThan(0.00002);
  });

  it('recovers exact six-vertex objective polygons and authorizes only inert paint subregions', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.objectiveConstraints)
      .toMatchObject({
        objectiveCount: 2,
        exactObjectivePdfVerticesRecovered: true,
        exactObjectiveMetricVerticesRecovered: true,
        exactObjectiveAreaSquareMetersRecovered: true,
        verticesPerObjective: 6,
        registeredAgainstProjectY0Underpass: true
      });
    expect(
      UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.objectiveConstraints
        .areaSquareMetersPerObjective
    ).toBeCloseTo(117.29875, 6);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.runtimePromotionAuthorized)
      .toBe(false);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.paintSurfacePromotionAuthorized)
      .toBe(true);
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.activationBlockerCleared)
      .toBe(false);
  });

  it('leaves only the zone-exterior underpass paint evidence gap in this pass', () => {
    expect(UNDERTOW_ZONES_VECTOR_REGISTRATION_AUDIT.nextEvidenceNeeded)
      .toHaveLength(1);
  });
});
