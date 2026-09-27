import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT,
  undertowUnderpassPaintResolutionAuditErrors
} from './UndertowSpillwayUnderpassPaintResolutionAudit';

describe('T21 Undertow underpass paint Resolution Pass 8', () => {
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

  it('adds only two masked paint surfaces while retaining solid-level UNKNOWN authority', () => {
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.runtimeState)
      .toMatchObject({
        underpassPaintSurfaceCount: 2,
        unresolvedPaintSolidCount: 2,
        underpassRecordsRemainUnknown: true,
        wholeUnderpassStillNotPaintable: true
      });
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.nextEvidenceNeeded)
      .toHaveLength(1);
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.activationBlockerCleared)
      .toBe(false);
  });
});
