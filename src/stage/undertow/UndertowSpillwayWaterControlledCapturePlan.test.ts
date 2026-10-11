import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN,
  undertowWaterControlledCapturePlanErrors
} from './UndertowSpillwayWaterControlledCapturePlan';

describe('T21 Pass 14D exact visual-water Y capture plan', () => {
  it('cancels the former internal-water capture after the premise is invalidated', () => {
    const p = UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN;
    expect(p.status).toBe('CANCELLED_PREMISE_INVALIDATED');
    expect(p.supersededBy).toBe('14E');
    expect(p.userActionCount).toBe(0);
    expect(p.blocks).toEqual([]);
    expect(p.minimumCapture).toEqual([]);
    expect(p.acceptance).toEqual([]);
    expect(p.guideStatus).toBe('DEPRECATED_DO_NOT_USE');
  });

  it('does not silently convert the dry-location correction into an exterior-water claim', () => {
    expect(UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN.avoid.join(' '))
      .toContain('broader exterior water layout');
  });

  it('passes the cancelled-plan audit', () => {
    expect(undertowWaterControlledCapturePlanErrors()).toEqual([]);
  });
});
