import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT,
  undertowRemodelGeometryAuditErrors
} from './UndertowSpillwayRemodelGeometryAudit';

describe('T21-C remodeled Undertow geometry audit', () => {
  it('freezes the audited Temple01 object and local registration quality', () => {
    expect(undertowRemodelGeometryAuditErrors()).toEqual([]);
    expect(UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.source).toMatchObject({
      fileBytes: 43263289,
      vertexCount: 375948,
      activeCommonPlusTurfFaceCount: 70396,
      confidence: 'HIGH'
    });
    expect(
      UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.registration
        .locallyVerifiedMaxNearestDiscontinuityMeters
    ).toBeLessThanOrEqual(0.5);
  });

  it('resolves the first drop to 4.5m and the separate right drop to 3.0m', () => {
    const a = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT;
    expect(a.rawModelY).toEqual({
      centerLow: 3,
      centerStepTop: 4.5,
      spawnFloor: 10.5,
      firstDropLanding: 6,
      rightSmallDropLower: 7.5,
      centerSlopeLow: 1.5,
      centerSlopeHigh: 3,
      grateVisualTop: 10.4
    });
    expect(a.deltas.firstDropMeters).toBe(-4.5);
    expect(a.deltas.rightSmallDropMeters).toBe(-3);
  });

  it('normalizes model Y against canonical center-low without changing the canonical origin', () => {
    expect(UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY).toEqual({
      centerLow: 0,
      centerStepTop: 1.5,
      spawnFloor: 7.5,
      firstDropLanding: 3,
      rightSmallDropUpper: 7.5,
      rightLow: 4.5,
      centerSlopeLow: -1.5,
      centerSlopeHigh: 0,
      grateVisualTop: 7.4
    });
  });

  it('matches the user correction and the corrected center datum', () => {
    const y = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY;
    expect(y.firstDropLanding).toBeLessThan(y.rightLow);
    expect(y.rightLow - y.firstDropLanding).toBe(1.5);
    expect(y.centerStepTop - y.centerLow).toBe(1.5);
    expect(y.spawnFloor).toBe(7.5);
    expect(y.centerSlopeHigh).toBe(y.centerLow);
  });

  it('keeps full-exterior registration caveat separate from locally verified drop lips', () => {
    const r = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.registration;
    expect(r.outerP95Meters).toBeGreaterThan(10);
    expect(r.locallyVerifiedMaxNearestDiscontinuityMeters).toBeLessThan(0.2);
  });
});
