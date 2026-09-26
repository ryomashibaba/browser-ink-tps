import { describe, expect, it } from 'vitest';
import { undertowBlockoutReadiness } from './UndertowSpillwayBlockoutGate';

describe('T21 Undertow blockout readiness gate', () => {
  it('keeps T21-D blocked while critical XZ evidence is unresolved', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.ready).toBe(false);

    expect(gate.missingTraceIds).not.toContain('common-playable-boundary');
    expect(gate.missingTraceIds).not.toContain('team-a-spawn-terrain-outline');
    expect(gate.missingTraceIds).not.toContain('team-b-spawn-terrain-outline');
    expect(gate.missingTraceIds).not.toContain('center-low-floor-outline');
    expect(gate.missingTraceIds).not.toContain('center-small-step-outline');
    expect(gate.missingTraceIds).toContain('glass-underpass-outline');
    expect(gate.missingTraceIds).not.toContain('center-left-slope-footprint');
    expect(gate.missingTraceIds).not.toContain('right-low-floor-outline');
    expect(gate.missingTraceIds).toContain('fall-out-void-kill-boundary');
    expect(gate.missingTraceIds).toEqual([
      'glass-underpass-outline',
      'fall-out-void-kill-boundary'
    ]);

    expect(gate.missingTraceIds).not.toContain('team-a-first-drop-lip');
    expect(gate.missingTraceIds).not.toContain('right-small-drop-edge');
    expect(gate.missingTraceIds).not.toContain('upper-glass-platform-outline');
    expect(gate.missingTraceIds).not.toContain('center-grate-outline');
    expect(gate.missingTraceIds).not.toContain('mapped-water-hazard-polygons');
  });

  it('accepts the remodeled spawn / first-drop / right-low chain for BLOCKOUT', () => {
    const gate = undertowBlockoutReadiness();

    for (const id of [
      'team-a-spawn-floor',
      'team-b-spawn-floor',
      'team-a-first-drop-landing',
      'team-b-first-drop-landing',
      'right-low-floor',
      'right-small-drop-upper',
      'glass-lower-major-floor',
      'glass-overhang-high-reference'
    ]) {
      expect(gate.unresolvedVerticalIds).not.toContain(id);
    }

    expect(gate.unresolvedVerticalRelations).toEqual([]);
  });

  it('has no remaining vertical blocker at BLOCKOUT confidence', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.unresolvedVerticalIds).toEqual([]);
    expect(gate.unresolvedVerticalRelations).toEqual([]);
  });
});
