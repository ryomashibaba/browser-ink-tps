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

  it('keeps right-low and first-drop landing in separate components after the corrective stills', () => {
    const rightLow = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'RIGHT_LOW_UNSEEDED'
    );
    const landing = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'FIRST_DROP_LANDING_UNSEEDED'
    );

    expect(rightLow?.nodeIds).toEqual([
      'glass-lower-major-floor',
      'glass-overhang-high-reference',
      'right-low-floor',
      'right-small-drop-upper'
    ]);
    expect(landing?.nodeIds).toEqual([
      'team-a-first-drop-landing',
      'team-b-first-drop-landing'
    ]);
    expect(rightLow?.nodeIds).not.toContain('team-a-first-drop-landing');
  });

  it('adds an exact landing tie as a separate evidence need', () => {
    expect(
      UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS.map((need) => need.id)
    ).toEqual([
      'RIGHT_LOW_TO_CENTER_SEED',
      'FIRST_DROP_LANDING_EXACT_TIE',
      'FIRST_DROP_MAGNITUDE',
      'CENTER_SLOPE_HIGH_TIE',
      'GRATE_Y_TIE'
    ]);
  });

  it('does not treat the provisional first-drop magnitude as an exact graph edge', () => {
    const spawn = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'SPAWN_UNSEEDED'
    );
    const landing = UNDERTOW_VERTICAL_COMPONENT_AUDIT.find(
      (component) => component.id === 'FIRST_DROP_LANDING_UNSEEDED'
    );

    expect(spawn?.nodeIds).toEqual([
      'team-a-spawn-floor',
      'team-b-spawn-floor'
    ]);
    expect(landing?.nodeIds).not.toContain('team-a-spawn-floor');
  });
});
