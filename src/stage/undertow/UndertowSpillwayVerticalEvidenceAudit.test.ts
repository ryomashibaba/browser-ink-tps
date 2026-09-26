import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS,
  UNDERTOW_VERTICAL_COMPONENT_AUDIT,
  undertowVerticalEvidenceAuditErrors
} from './UndertowSpillwayVerticalEvidenceAudit';

describe('T21-C Undertow vertical evidence sufficiency audit', () => {
  it('has no component-structure audit errors', () => {
    expect(undertowVerticalEvidenceAuditErrors()).toEqual([]);
  });

  it('seeds both the center component and the remodeled spawn/right-low component at BLOCKOUT confidence', () => {
    expect(
      UNDERTOW_VERTICAL_COMPONENT_AUDIT
        .filter((component) => component.seededAbsoluteY)
        .map((component) => component.id)
    ).toEqual(['CENTER_SEEDED', 'SPAWN_RIGHT_LOW_SEEDED']);
  });

  it('connects spawn, corrected first-drop landing, right-low and glass references into one exact HIGH component', () => {
    const resolved = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'SPAWN_RIGHT_LOW_SEEDED'
    );
    expect(resolved?.nodeIds).toEqual([
      'glass-lower-major-floor',
      'glass-overhang-high-reference',
      'right-low-floor',
      'right-small-drop-upper',
      'team-a-first-drop-landing',
      'team-a-spawn-floor',
      'team-b-first-drop-landing',
      'team-b-spawn-floor'
    ]);
  });

  it('leaves only slope-high and grate vertical evidence classes unresolved', () => {
    expect(
      UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS.map((need) => need.id)
    ).toEqual([
      'CENTER_SLOPE_HIGH_TIE',
      'GRATE_Y_TIE'
    ]);
  });
});
