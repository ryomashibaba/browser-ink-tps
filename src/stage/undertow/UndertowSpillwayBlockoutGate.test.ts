import { describe, expect, it } from 'vitest';
import { undertowBlockoutReadiness } from './UndertowSpillwayBlockoutGate';

describe('T21 Undertow blockout readiness gate', () => {
  it('keeps T21-D blocked while critical XZ and Y evidence is unresolved', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.ready).toBe(false);

    expect(gate.missingTraceIds).not.toContain('common-playable-boundary');
    expect(gate.missingTraceIds).not.toContain('center-low-floor-outline');
    expect(gate.missingTraceIds).not.toContain('center-small-step-outline');
    expect(gate.missingTraceIds).toContain('glass-underpass-outline');
    expect(gate.missingTraceIds).not.toContain('center-left-slope-footprint');
    expect(gate.missingTraceIds).toContain('right-low-floor-outline');
    expect(gate.missingTraceIds).toContain('fall-out-void-kill-boundary');

    expect(gate.missingTraceIds).not.toContain('team-a-first-drop-lip');
    expect(gate.missingTraceIds).not.toContain('right-small-drop-edge');
    expect(gate.missingTraceIds).not.toContain('upper-glass-platform-outline');
    expect(gate.missingTraceIds).not.toContain('center-grate-outline');
    expect(gate.missingTraceIds).not.toContain('mapped-water-hazard-polygons');
  });

  it('keeps unresolved spawn and first-drop Y out of T21-D', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.unresolvedVerticalIds).toContain('team-a-spawn-floor');
    expect(gate.unresolvedVerticalIds).toContain('team-b-spawn-floor');
    expect(gate.unresolvedVerticalIds).toContain('team-a-first-drop-landing');
    expect(gate.unresolvedVerticalIds).toContain('team-b-first-drop-landing');

    expect(gate.unresolvedVerticalRelations).toContain(
      'team-a-spawn-floor->team-a-first-drop-landing'
    );
    expect(gate.unresolvedVerticalRelations).toContain(
      'team-b-spawn-floor->team-b-first-drop-landing'
    );
  });

  it('uses BLOCKOUT constraint resolution for known center values but still gates missing vertical seeds', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.unresolvedVerticalIds).not.toContain('center-low-floor');
    expect(gate.unresolvedVerticalIds).not.toContain('center-small-step-top');
    expect(gate.missingTraceIds).not.toContain('center-low-floor-outline');

    expect(gate.unresolvedVerticalIds).toContain('glass-lower-major-floor');
    expect(gate.unresolvedVerticalIds).toContain('glass-overhang-high-reference');
    expect(gate.unresolvedVerticalIds).toContain('center-left-slope-low');
    expect(gate.unresolvedVerticalIds).toContain('center-left-slope-high');
    expect(gate.unresolvedVerticalIds).toContain('negative-z-grate-floor');
    expect(gate.unresolvedVerticalIds).toContain('positive-z-grate-floor');
  });
});
