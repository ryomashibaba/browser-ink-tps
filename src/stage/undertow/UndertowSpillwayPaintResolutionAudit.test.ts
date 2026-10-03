import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PAINT_RESOLUTION_AUDIT,
  undertowPaintResolutionAuditErrors
} from './UndertowSpillwayPaintResolutionAudit';

describe('T21 Undertow paint authority resolution pass', () => {
  it('promotes only the four exact central slope quads', () => {
    expect(undertowPaintResolutionAuditErrors()).toEqual([]);
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.centralSlopeBinding).toMatchObject({
      exactQuadCount: 4,
      fullyContainedQuadCount: 4,
      markerBackgroundClass: 'WHITE_NON_GRAY',
      paintAuthorityResolved: true
    });
    expect(
      UNDERTOW_PAINT_RESOLUTION_AUDIT.centralSlopeBinding.authorizedRuntimeSolidIds
    ).toHaveLength(4);
  });

  it('uses arbitrary-plane Ramp paint surfaces without inventing Turf scoreability', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.runtime).toMatchObject({
      slopePaintSurfaceCount: 4,
      slopePaintSurfacesUseRampFlag: true,
      slopePaintSurfacesUseScoreableFlag: false
    });
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.turfScoreabilityResolved).toBe(false);
  });

  it('keeps the remaining eight paint-authority surfaces unresolved', () => {
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.unresolvedAfterPass.count).toBe(8);
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.activationBlockerCleared).toBe(false);
    expect(UNDERTOW_PAINT_RESOLUTION_AUDIT.unresolvedAfterPass.runtimeSolidIds)
      .toHaveLength(8);
  });
});
