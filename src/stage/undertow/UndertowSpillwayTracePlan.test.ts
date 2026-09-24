import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_COMMON_TRACE_PLAN,
  undertowTraceCoverage
} from './UndertowSpillwayTracePlan';

describe('T21-B Undertow common trace plan', () => {
  it('marks only the two spawn centers as already measured', () => {
    const coverage = undertowTraceCoverage();
    expect(coverage.measured).toBe(2);
    expect(coverage.total).toBe(17);
    expect(coverage.missingIds).toContain('common-playable-boundary');
    expect(coverage.missingIds).toContain('team-a-first-drop-lip');
    expect(coverage.missingIds).toContain('upper-glass-platform-outline');
  });

  it('does not accidentally mark gameplay-critical polygons complete', () => {
    const forbidden = [
      'common-playable-boundary',
      'center-low-floor-outline',
      'upper-glass-platform-outline',
      'glass-underpass-outline',
      'water-kill-boundaries'
    ];
    for (const id of forbidden) {
      expect(UNDERTOW_COMMON_TRACE_PLAN.find((item) => item.id === id)?.status)
        .toBe('UNTRACED');
    }
  });

  it('requires HIGH or stronger evidence before a trace may feed blockout', () => {
    for (const item of UNDERTOW_COMMON_TRACE_PLAN) {
      expect(['HIGH', 'CONFIRMED']).toContain(item.minimumConfidenceForBlockout);
    }
  });
});
