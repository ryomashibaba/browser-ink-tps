import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS,
  undertowPaintAuthorityAuditErrors
} from './UndertowSpillwayPaintAuthorityAudit';

describe('T21-D Undertow paint authority audit', () => {
  it('accounts for every current runtime solid without guessing unknown paintability', () => {
    expect(undertowPaintAuthorityAuditErrors()).toEqual([]);
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT).toMatchObject({
      runtimeSolidCount: 21,
      confirmedPaintableCount: 5,
      confirmedUninkableCount: 4,
      unresolvedCount: 12,
      paintAuthorityComplete: false,
      turfScoreabilityEvaluated: false,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS).toHaveLength(21);
  });

  it('keeps the exact unresolved component families localized', () => {
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds)
      .toEqual(expect.arrayContaining([
        'UndertowT21D:glass-underpass-positive-z',
        'UndertowT21D:glass-underpass-negative-z',
        'UndertowT21D:spawn-high-positive-z',
        'UndertowT21D:spawn-high-negative-z',
        'UndertowT21D:first-drop-landing-positive-z',
        'UndertowT21D:first-drop-landing-negative-z',
        'UndertowT21D:center-slope-left-a',
        'UndertowT21D:center-slope-left-b',
        'UndertowT21D:center-slope-right-a',
        'UndertowT21D:center-slope-right-b',
        'UndertowT21D:right-low-route-ramp-positive-z',
        'UndertowT21D:right-low-route-ramp-negative-z'
      ]));
  });

  it('does not treat generic PaintBancParam or material names as per-face authority', () => {
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.publicStageSchemaFollowup)
      .toMatchObject({
        temple01PntSetHasPaintBancParam: true,
        exposedPaintBancFields: ['IsIncludeVArea'],
        exposesPerFacePaintability: false,
        exposesTemple01PaintMaskPlacement: false
      });
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.evidenceBoundary.materialNameRule)
      .toContain('never paint authority');
  });

  it('keeps Turf scoreability out of this blocker', () => {
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.turfScoreabilityEvaluated).toBe(false);
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.notes)
      .toContain('TURF_SCOREABLE_MASK_PENDING');
  });
});
