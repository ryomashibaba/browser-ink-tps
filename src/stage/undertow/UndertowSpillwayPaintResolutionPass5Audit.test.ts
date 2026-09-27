import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT,
  undertowPaintResolutionPass5AuditErrors
} from './UndertowSpillwayPaintResolutionPass5Audit';

describe('T21 Undertow paint authority Resolution Pass 5', () => {
  it('promotes exactly the two registered spawn-high components', () => {
    expect(undertowPaintResolutionPass5AuditErrors()).toEqual([]);
    expect(UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.exactSpawnBinding)
      .toMatchObject({
        componentCount: 2,
        modelY: 10.5,
        projectY: 7.5,
        holeCountPerSide: 2,
        mirrorXorCells: 0,
        seededFromVerifiedSpawnCenter: true
      });
    expect(
      UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.authorityPromotion
        .authorizedRuntimeSolidIds
    ).toHaveLength(2);
  });

  it('preserves exact polygon holes and does not invent Scoreable', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.runtimeRepresentation)
      .toMatchObject({
        paintSurfaceCount: 2,
        usesBackingFootprint: true,
        preservesTwoHolesPerSide: true,
        allPaintable: true,
        allSwimmable: true,
        anyScoreable: false
      });
  });

  it('leaves underpass, first-drop landing, and right-low route ramp unresolved', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.unresolvedAfterPass.count)
      .toBe(6);
    expect(
      UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.unresolvedAfterPass.runtimeSolidIds
    ).toHaveLength(6);
    expect(UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.activationBlockerCleared)
      .toBe(false);
    expect(
      UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT.turfScoreabilityIntentionallyDeferred
    ).toBe(true);
  });
});
