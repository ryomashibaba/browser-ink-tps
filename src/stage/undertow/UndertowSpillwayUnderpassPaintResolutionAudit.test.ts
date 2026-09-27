import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT,
  undertowUnderpassPaintResolutionAuditErrors
} from './UndertowSpillwayUnderpassPaintResolutionAudit';

describe('T21 Undertow underpass paint Resolution Pass 6', () => {
  it('confirms a bounded paintable Splat-Zone subregion beneath each glass platform', () => {
    expect(undertowUnderpassPaintResolutionAuditErrors()).toEqual([]);
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.currentModeEvidence)
      .toMatchObject({
        postVer720Layout: true,
        legendDefinesZoneBoundary: true,
        blueprintShowsTwoBoundedZonesUnderCentralGlass: true,
        inikipediaSaysBothZonesUnderGlassAreas: true,
        currentStrategyGuideSaysZonesAreUnderHighPlatformsAndMustBePainted: true,
        objectiveSubregionPaintabilityConfirmed: true
      });
  });

  it('binds that semantic family to the exact mirrored underpass geometry without overpromoting it', () => {
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
        exactZoneFootprintRegisteredToMeters: false,
        zoneEqualsWholeUnderpassFloor: false,
        wholeUnderpassPaintAuthorityResolved: false,
        runtimePromotionAuthorized: false
      });
  });

  it('keeps both runtime underpass solids UNKNOWN until the exact objective polygons are registered', () => {
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.runtimeState)
      .toMatchObject({
        underpassPaintSurfaceCount: 0,
        unresolvedPaintSolidCount: 6,
        underpassRecordsRemainUnknown: true
      });
    expect(UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.activationBlockerCleared)
      .toBe(false);
  });
});
