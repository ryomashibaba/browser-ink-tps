import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN,
  undertowWaterControlledCapturePlanErrors
} from './UndertowSpillwayWaterControlledCapturePlan';

describe('T21 Pass 14D exact visual-water Y capture plan', () => {
  it('requests one context-rich side-profile clip from either mirrored water hazard', () => {
    const p = UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN;
    expect(p.status).toBe('REQUEST_READY');
    expect(p.userActionCount).toBe(1);
    expect(p.eitherMappedWaterHazardSufficient).toBe(true);
    expect(p.guidePath).toContain('PASS14D_WATER_VISUAL_Y_CAPTURE_GUIDE.svg');
  });

  it('keeps the purpose scoped to visible-water Y rather than death timing', () => {
    const p = UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN;
    expect(p.purpose).toContain('exact visible-water world Y');
    expect(p.blocks).toEqual(['WATER_VISUAL_Y_PENDING']);
    expect(p.avoid.join(' ')).toContain('death timing is not the purpose');
  });

  it('passes the capture-plan audit', () => {
    expect(undertowWaterControlledCapturePlanErrors()).toEqual([]);
  });
});
