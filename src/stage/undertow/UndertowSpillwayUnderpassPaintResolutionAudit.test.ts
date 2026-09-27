import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT,
  undertowUnderpassPaintResolutionAuditErrors
} from './UndertowSpillwayUnderpassPaintResolutionAudit';

describe('T21 Undertow underpass paint Resolution Pass 11C', () => {
  it('keeps the bounded current Splat-Zone paint evidence', () => {
    expect(undertowUnderpassPaintResolutionAuditErrors()).toEqual([]);
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.currentModeEvidence)
      .toMatchObject({
        postVer720Layout: true,
        legendDefinesZoneBoundary: true,
        blueprintShowsTwoBoundedZonesUnderCentralGlass: true,
        objectiveSubregionPaintabilityConfirmed: true
      });
  });

  it('registers exact zone intersections without promoting the whole underpass', () => {
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.exactUnderpassGeometry)
      .toMatchObject({
        componentCount: 2,
        modelY: 3,
        projectY: 0,
        oneSupportHolePerSide: true,
        mirrorXorCells: 0
      });
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.registrationBoundary)
      .toMatchObject({
        underGlassFamilyIdentityResolved: true,
        somePaintableSubregionResolved: true,
        exactZoneFootprintRegisteredToMeters: true,
        exactZoneUnderpassIntersectionRegistered: true,
        objectiveSubregionPaintSurfaceAuthorized: true,
        zoneEqualsWholeUnderpassFloor: false,
        wholeUnderpassPaintAuthorityResolved: false,
        wholeUnderpassRuntimePromotionAuthorized: false
      });
    expect(
      UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.registrationBoundary
        .negativeZRegisteredPaintAreaSquareMeters
    ).toBeGreaterThan(0);
    expect(
      UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.registrationBoundary
        .positiveZRegisteredPaintAreaSquareMeters
    ).toBeGreaterThan(0);
  });

  it('proves the public Turf plan is glass-occluded and cannot classify the hidden whole floor', () => {
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT).toMatchObject({
      round: '11C',
      scope: 'CURRENT_SPLAT_ZONES_PLUS_PUBLIC_TURF_OCCLUSION_CLOSURE'
    });
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.publicTurfPlanClosure)
      .toMatchObject({
        pinnedSource: {
          bytes: 100311,
          sha256: '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f'
        },
        positiveZ: {
          medianBrightness: 191,
          nearWhiteFraction: 0.00968,
          darkOrGrayFraction: 0.99032,
          overlappingExplicitFillCount: 12,
          overlappingExplicitFillColors: [[0.752941, 0.752941, 0.752941]],
          knownGlassOverhangOverlapFraction: 0.772974211,
          distinctWhiteFloorVectorFillRecovered: false,
          topViewOccludedByGlassClass: true
        },
        negativeZ: {
          medianBrightness: 191,
          nearWhiteFraction: 0.005022,
          darkOrGrayFraction: 0.994978,
          overlappingExplicitFillCount: 32,
          overlappingExplicitFillColors: [[0.752941, 0.752941, 0.752941]],
          knownGlassOverhangOverlapFraction: 0.735104783,
          distinctWhiteFloorVectorFillRecovered: false,
          topViewOccludedByGlassClass: true
        },
        wholeUnderpassPaintAuthorityResolvedFromTurfPlan: false,
        runtimePromotionAuthorized: false
      });
  });

  it('adds only two masked paint surfaces while retaining solid-level UNKNOWN authority', () => {
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.runtimeState)
      .toMatchObject({
        underpassPaintSurfaceCount: 2,
        unresolvedPaintSolidCount: 2,
        underpassRecordsRemainUnknown: true,
        wholeUnderpassStillNotPaintable: true
      });
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.nextEvidenceNeeded)
      .toHaveLength(2);
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.activationBlockerCleared)
      .toBe(false);
  });
});
