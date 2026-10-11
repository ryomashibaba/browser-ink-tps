import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT,
  undertowPaintResolutionPass10CAuditErrors
} from './UndertowSpillwayPaintResolutionPass10CAudit';

describe('T21 Undertow paint authority Resolution Pass 10C', () => {
  it('pins the current Turf source and exact first-drop white-class registration', () => {
    expect(undertowPaintResolutionPass10CAuditErrors()).toEqual([]);
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.pinnedTurfVectorSource)
      .toMatchObject({
        bytes: 100311,
        sha256: '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f'
      });
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.exactGeometryBinding)
      .toMatchObject({
        componentCount: 2,
        sourceModelY: 6,
        projectY: 3,
        cellsPerSide: 3746,
        areaSquareMetersPerSide: 58.53125,
        holeCountPerSide: 0,
        mirrorXorCells: 0,
        vertexCountPerSide: [8, 8]
      });
  });

  it('separates both exact landing interiors from the adjacent gray class', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.authorWhiteClassRegistration)
      .toMatchObject({
        localRegistrationGateMeters: 0.5,
        positiveZ: {
          medianBrightness: 255,
          nearWhiteFraction: 0.931694,
          adjacentGrayMedianBrightness: 191,
          adjacentGrayDarkOrGrayFraction: 1,
          grayOverlapFraction: 0.000000372,
          maxFirstDropLipBoundaryResidualMeters: 0.347272371
        },
        negativeZ: {
          medianBrightness: 255,
          nearWhiteFraction: 0.95211,
          adjacentGrayMedianBrightness: 191,
          adjacentGrayDarkOrGrayFraction: 1,
          grayOverlapFraction: 0.003083965,
          maxFirstDropLipBoundaryResidualMeters: 0.442577995
        },
        bothSidesResolveToWhiteFlatPaintClass: true
      });
  });

  it('promotes exactly two Floor paint surfaces and no Scoreable', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.runtimePromotion)
      .toMatchObject({
        paintSurfaceCount: 2,
        allPaintable: true,
        allSwimmable: true,
        allFloor: true,
        anyRamp: false,
        anyScoreable: false
      });
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.currentPaintInventory)
      .toMatchObject({
        confirmedPaintableRuntimeSolidCount: 15,
        confirmedUninkableRuntimeSolidCount: 4,
        unresolvedRuntimeSolidCount: 2,
        activationBlockerCleared: false
      });
    expect(
      UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.currentPaintInventory
        .unresolvedRuntimeSolidIds
    ).toEqual([
      'UndertowT21D:glass-underpass-positive-z',
      'UndertowT21D:glass-underpass-negative-z'
    ]);
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT.scoreableAuthorityPromoted)
      .toBe(false);
  });
});
