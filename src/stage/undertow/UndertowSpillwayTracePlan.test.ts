import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_COMMON_TRACE_PLAN,
  undertowTraceCoverage
} from './UndertowSpillwayTracePlan';

describe('T21-B Undertow common trace plan', () => {
  it('promotes only source-measured XZ traces', () => {
    const coverage = undertowTraceCoverage();
    expect(coverage.measured).toBe(14);
    expect(coverage.total).toBe(18);

    expect(coverage.missingIds).not.toContain('team-a-spawn-terrain-outline');
    expect(coverage.missingIds).not.toContain('team-b-spawn-terrain-outline');
    expect(coverage.missingIds).not.toContain('team-a-first-drop-lip');
    expect(coverage.missingIds).not.toContain('team-b-first-drop-lip');
    expect(coverage.missingIds).not.toContain('mapped-water-hazard-polygons');

    expect(coverage.missingIds).not.toContain('common-playable-boundary');
    expect(coverage.missingIds).not.toContain('upper-glass-platform-outline');
    expect(coverage.missingIds).not.toContain('center-grate-outline');
    expect(coverage.missingIds).not.toContain('right-small-drop-edge');
    expect(coverage.missingIds).toContain('center-low-floor-outline');
    expect(coverage.missingIds).not.toContain('center-small-step-outline');
    expect(coverage.missingIds).not.toContain('center-left-slope-footprint');
    expect(coverage.missingIds).not.toContain('center-right-slope-footprint');
    expect(coverage.missingIds).toContain('fall-out-void-kill-boundary');
  });

  it('does not accidentally mark unresolved gameplay-critical polygons complete', () => {
    const forbidden = [
      'center-low-floor-outline',
      'glass-underpass-outline',
      'right-low-floor-outline',
      'fall-out-void-kill-boundary'
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
