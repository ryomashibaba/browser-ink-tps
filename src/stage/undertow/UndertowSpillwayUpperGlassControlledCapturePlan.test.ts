import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_COMPONENT_PROBES,
  UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN,
  UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES,
  undertowRequestReadyUpperGlassCaptureIds,
  undertowUpperGlassControlledCapturePlanErrors
} from './UndertowSpillwayUpperGlassControlledCapturePlan';

describe('T21 Resolution Pass 13A upper-glass controlled capture plan', () => {
  it('retires the support route and requests only the two-sided ordinary-projectile test next', () => {
    expect(undertowUpperGlassControlledCapturePlanErrors()).toEqual([]);
    expect(undertowRequestReadyUpperGlassCaptureIds()).toEqual([
      'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
    ]);
    const support = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
      (capture) => capture.id === 'PLAYER_SUPPORT_COMPONENT_ROUTE'
    );
    const projectile = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
      (capture) => capture.id === 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
    );
    expect(support?.status).toBe('RESOLVED');
    expect(projectile?.status).toBe('REQUEST_READY');
    expect(projectile?.userActionCount).toBe(2);
    expect(projectile?.guidePath).toContain('PASS13B_UPPER_GLASS_PROJECTILE_CAPTURE_GUIDE.svg');
  });

  it('tests the three broad components independently on both sides', () => {
    const direct = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
      (probe) => probe.directSupportProbe
    );
    expect(direct).toHaveLength(6);
    expect(direct.filter((probe) => probe.side === 'POSITIVE_Z')).toHaveLength(3);
    expect(direct.filter((probe) => probe.side === 'NEGATIVE_Z')).toHaveLength(3);
    expect(Math.min(...direct.map((probe) => probe.minRoutePointBoundaryClearanceMeters)))
      .toBeGreaterThan(0.6);
  });

  it('keeps the thin edge strip explicitly deferred', () => {
    const thin = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
      (probe) => probe.id === 'THIN_EDGE_STRIP'
    );
    expect(thin).toHaveLength(2);
    expect(thin.every((probe) => !probe.directSupportProbe)).toBe(true);
    expect(Math.max(...thin.map((probe) => probe.minRoutePointBoundaryClearanceMeters)))
      .toBeLessThan(0.1);
  });

  it('keeps camera isolation deferred until the separate projectile test is resolved', () => {
    expect(
      UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
        (capture) => capture.id === 'CAMERA_GLASS_EDGE_DIFFERENTIAL'
      )?.status
    ).toBe('DEFERRED_UNTIL_PROJECTILE_BINDING');
    expect(UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.positiveZ).toHaveLength(3);
    expect(UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.negativeZ).toHaveLength(3);
  });
});
