import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT,
  undertowPaintResolutionPass10AuditErrors
} from './UndertowSpillwayPaintResolutionPass10Audit';

describe('T21 Undertow paint authority Resolution Pass 10A', () => {
  it('pins the exact author Turf vector source and white-vs-gray slope discrimination', () => {
    expect(undertowPaintResolutionPass10AuditErrors()).toEqual([]);
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.pinnedTurfVectorSource)
      .toMatchObject({
        bytes: 100311,
        sha256: '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f'
      });
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.semanticDiscrimination)
      .toMatchObject({
        knownPaintableCentralSlopeMedianBrightness: 255,
        knownUninkableGlassSlopeMedianBrightness: 191,
        routeRampMedianBrightness: 255,
        routeRampCanonicalDashCountPerSide: 168,
        positiveZDashMidpointInside: 133,
        positiveZDashFullyInside: 126,
        negativeZDashMidpointInside: 126,
        negativeZDashFullyInside: 126,
        canonicalDashWidthPoints: 0.24,
        canonicalDashLengthPoints: 0.96,
        brightnessDistanceToPaintableMedian: 0,
        brightnessDistanceToUninkableMedian: 64,
        bothMirroredRampsResolveToWhiteSlopeClass: true
      });
  });

  it('promotes exactly two mirrored route-ramp paint surfaces and no Scoreable', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.sourceBinding)
      .toMatchObject({
        exactMirroredSourceQuads: 2,
        mirrorXorVertices: 0,
        projectYMinMeters: 3,
        projectYMaxMeters: 4.5,
        paintAuthorityResolved: true
      });
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.runtimePromotion)
      .toMatchObject({
        paintSurfaceCount: 2,
        allPaintable: true,
        allSwimmable: true,
        allRamp: true,
        anyFloor: false,
        anyScoreable: false
      });
  });

  it('leaves four unrelated runtime solids unresolved and keeps the activation blocker', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.currentPaintInventory)
      .toMatchObject({
        confirmedPaintableRuntimeSolidCount: 13,
        unresolvedRuntimeSolidCount: 4,
        activationBlockerCleared: false
      });
    expect(
      UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT.currentPaintInventory
        .unresolvedRuntimeSolidIds
    ).toEqual([
      'UndertowT21D:glass-underpass-positive-z',
      'UndertowT21D:glass-underpass-negative-z',
      'UndertowT21D:first-drop-landing-positive-z',
      'UndertowT21D:first-drop-landing-negative-z'
    ]);
  });
});
