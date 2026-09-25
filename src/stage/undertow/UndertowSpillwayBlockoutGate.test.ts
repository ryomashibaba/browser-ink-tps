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
    expect(gate.missingTraceIds).toContain('center-left-slope-footprint');
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

  it('recognizes the confirmed center-low Y seed and measured center-low XZ outline', () => {
    const gate = undertowBlockoutReadiness();
    expect(gate.unresolvedVerticalIds).not.toContain('center-low-floor');
    expect(gate.missingTraceIds).not.toContain('center-low-floor-outline');
  });
});
