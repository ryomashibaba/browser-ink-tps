import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS,
  UNDERTOW_VERTICAL_COMPONENT_AUDIT,
  undertowVerticalEvidenceAuditErrors
} from './UndertowSpillwayVerticalEvidenceAudit';

describe('T21-C Undertow vertical evidence sufficiency audit', () => {
  it('keeps only the center component seeded with current evidence', () => {
    expect(undertowVerticalEvidenceAuditErrors()).toEqual([]);

    const seeded = UNDERTOW_VERTICAL_COMPONENT_AUDIT
      .filter((component) => component.seededAbsoluteY)
      .map((component) => component.id);
    expect(seeded).toEqual(['CENTER_SEEDED']);
  });

  it('groups the complete right-low / underpass / landing chain without inventing absolute Y', () => {
    const rightLow = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'RIGHT_LOW_UNSEEDED'
    );

    expect(rightLow?.nodeIds).toEqual([
      'glass-lower-major-floor',
      'glass-overhang-high-reference',
      'right-low-floor',
      'right-small-drop-upper',
      'team-a-first-drop-landing',
      'team-b-first-drop-landing'
    ]);
    expect(rightLow?.seededAbsoluteY).toBe(false);
  });

  it('keeps spawn, slope-high and grate elevations as separate evidence needs', () => {
    expect(
      UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS.map((need) => need.id)
    ).toEqual([
      'RIGHT_LOW_TO_CENTER_SEED',
      'FIRST_DROP_MAGNITUDE',
      'CENTER_SLOPE_HIGH_TIE',
      'GRATE_Y_TIE'
    ]);
  });

  it('does not treat the provisional first-drop magnitude as an exact graph edge', () => {
    const spawn = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'SPAWN_UNSEEDED'
    );
    const rightLow = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'RIGHT_LOW_UNSEEDED'
    );

    expect(spawn?.nodeIds).toEqual([
      'team-a-spawn-floor',
      'team-b-spawn-floor'
    ]);
    expect(rightLow?.nodeIds).not.toContain('team-a-spawn-floor');
  });
});
