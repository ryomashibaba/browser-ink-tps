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
      centerReference: 4.5,
      spawnFloor: 10.5,
      firstDropLanding: 6,
      rightSmallDropLower: 7.5
    });
    expect(a.deltas.firstDropMeters).toBe(-4.5);
    expect(a.deltas.rightSmallDropMeters).toBe(-3);
  });

  it('normalizes model Y against canonical center-low without changing the canonical origin', () => {
    expect(UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY).toEqual({
      centerLow: 0,
      spawnFloor: 6,
      firstDropLanding: 1.5,
      rightSmallDropUpper: 6,
      rightLow: 3
    });
  });

  it('matches the user correction that the red lower-side floor is below the blue lower-side floor', () => {
    const y = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.projectY;
    expect(y.firstDropLanding).toBeLessThan(y.rightLow);
    expect(y.rightLow - y.firstDropLanding).toBe(1.5);
  });

  it('keeps full-exterior registration caveat separate from locally verified drop lips', () => {
    const r = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.registration;
    expect(r.outerP95Meters).toBeGreaterThan(10);
    expect(r.locallyVerifiedMaxNearestDiscontinuityMeters).toBeLessThan(0.2);
  });
});
