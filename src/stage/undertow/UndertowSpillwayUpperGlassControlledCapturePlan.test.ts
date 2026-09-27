import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_COMPONENT_PROBES,
  UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN,
  UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES,
  undertowRequestReadyUpperGlassCaptureIds,
  undertowUpperGlassControlledCapturePlanErrors
} from './UndertowSpillwayUpperGlassControlledCapturePlan';

describe('T21 Resolution Pass 13A upper-glass controlled capture plan', () => {
  it('requests only the two-sided player-support route first', () => {
    expect(undertowUpperGlassControlledCapturePlanErrors()).toEqual([]);
    expect(undertowRequestReadyUpperGlassCaptureIds()).toEqual([
      'PLAYER_SUPPORT_COMPONENT_ROUTE'
    ]);
    const request = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
      (capture) => capture.id === 'PLAYER_SUPPORT_COMPONENT_ROUTE'
    );
    expect(request?.status).toBe('REQUEST_READY');
    expect(request?.userActionCount).toBe(2);
    expect(request?.guidePath).toContain('PASS13A_UPPER_GLASS_SUPPORT_CAPTURE_GUIDE.svg');
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

  it('keeps projectile and camera isolation deferred until player support is registered', () => {
    for (const id of [
      'PROJECTILE_GLASS_EDGE_DIFFERENTIAL',
      'CAMERA_GLASS_EDGE_DIFFERENTIAL'
    ] as const) {
      expect(
        UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
          (capture) => capture.id === id
        )?.status
      ).toBe('DEFERRED_UNTIL_PLAYER_SUPPORT_BINDING');
    }
    expect(UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.positiveZ).toHaveLength(3);
    expect(UNDERTOW_UPPER_GLASS_SUPPORT_ROUTES.negativeZ).toHaveLength(3);
  });
});
