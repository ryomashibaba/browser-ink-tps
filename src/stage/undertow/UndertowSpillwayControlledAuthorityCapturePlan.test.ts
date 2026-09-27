import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN,
  UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES,
  undertowControlledAuthorityCapturePlanErrors,
  undertowRequestReadyControlledAuthorityCaptureIds
} from './UndertowSpillwayControlledAuthorityCapturePlan';

describe('T21 Resolution Pass 12B controlled authority capture plan', () => {
  it('requests only the lowest-cost blocker-resolving capture', () => {
    expect(undertowRequestReadyControlledAuthorityCaptureIds()).toEqual([
      'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES'
    ]);

    const ready = UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN.find(
      (capture) => capture.id === 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES'
    );
    expect(ready?.status).toBe('REQUEST_READY');
    expect(ready?.userActionCount).toBe(2);
  });

  it('uses one independently registered outside-Zone probe per underpass side', () => {
    expect(UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES).toHaveLength(2);
    expect(
      new Set(
        UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES.map(
          (probe) => probe.backingSolidId
        )
      ).size
    ).toBe(2);
    expect(
      UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES.every(
        (probe) => probe.minimumClearanceMeters >= 0.35
      )
    ).toBe(true);
  });

  it('keeps glass, water/death, scoreability and final connectivity deferred', () => {
    const deferred = UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN.filter(
      (capture) => capture.id !== 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES'
    );
    expect(deferred).toHaveLength(4);
    expect(deferred.every((capture) => capture.status !== 'REQUEST_READY')).toBe(
      true
    );
    expect(deferred.every((capture) => capture.userActionCount === 0)).toBe(true);
  });

  it('passes the controlled-capture geometry and scope gate', () => {
    expect(undertowControlledAuthorityCapturePlanErrors()).toEqual([]);
  });
});
