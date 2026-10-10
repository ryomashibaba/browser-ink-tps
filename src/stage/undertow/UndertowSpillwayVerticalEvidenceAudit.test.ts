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

  it('seeds every required vertical component at BLOCKOUT confidence', () => {
    expect(
      UNDERTOW_VERTICAL_COMPONENT_AUDIT.map((component) => ({
        id: component.id,
        seeded: component.seededAbsoluteY,
        blocker: component.blocker
      }))
    ).toEqual([
      { id: 'CENTER_MODEL_SEEDED', seeded: true, blocker: null },
      { id: 'SPAWN_RIGHT_LOW_MODEL_SEEDED', seeded: true, blocker: null },
      { id: 'SLOPE_MODEL_SEEDED', seeded: true, blocker: null },
      { id: 'GRATE_MODEL_SEEDED', seeded: true, blocker: null }
    ]);
  });

  it('has no remaining vertical evidence class for T21-C blockout', () => {
    expect(UNDERTOW_MINIMUM_VERTICAL_EVIDENCE_NEEDS).toEqual([]);
  });
});
