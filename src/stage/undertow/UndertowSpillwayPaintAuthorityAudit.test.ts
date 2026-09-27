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
      confirmedPaintableCount: 15,
      confirmedUninkableCount: 4,
      unresolvedCount: 2,
      paintAuthorityComplete: false,
      turfScoreabilityEvaluated: false,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS).toHaveLength(21);
  });

  it('keeps only the two whole-underpass solids unresolved', () => {
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds)
      .toEqual([
        'UndertowT21D:glass-underpass-positive-z',
        'UndertowT21D:glass-underpass-negative-z'
      ]);
    expect(UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds)
      .toHaveLength(2);
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


describe('T21-D resolved central slope paint authority', () => {
  it('promotes all four exact central slope solids to PAINTABLE', () => {
    for (const id of [
      'UndertowT21D:center-slope-left-a',
      'UndertowT21D:center-slope-left-b',
      'UndertowT21D:center-slope-right-a',
      'UndertowT21D:center-slope-right-b'
    ]) {
      expect(
        UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
          (record) => record.runtimeSolidId === id
        )
      ).toMatchObject({
        authority: 'PAINTABLE',
        evidenceClass: 'AUTHOR_VECTOR_SEMANTIC'
      });
    }
  });
});


describe('T21-D resolved spawn-high paint authority', () => {
  it('promotes both exact spawn-center-seeded solids from current Turf gameplay evidence', () => {
    for (const id of [
      'UndertowT21D:spawn-high-positive-z',
      'UndertowT21D:spawn-high-negative-z'
    ]) {
      expect(
        UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
          (record) => record.runtimeSolidId === id
        )
      ).toMatchObject({
        authority: 'PAINTABLE',
        evidenceClass: 'PUBLIC_CURRENT_GAMEPLAY'
      });
    }
  });
});


describe('T21-D resolved right-low route-ramp paint authority', () => {
  it('promotes only the exact mirrored route-ramp pair from author-vector semantics', () => {
    for (const id of [
      'UndertowT21D:right-low-route-ramp-positive-z',
      'UndertowT21D:right-low-route-ramp-negative-z'
    ]) {
      expect(
        UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
          (record) => record.runtimeSolidId === id
        )
      ).toMatchObject({
        authority: 'PAINTABLE',
        evidenceClass: 'AUTHOR_VECTOR_SEMANTIC'
      });
    }
  });
});

describe('T21-D resolved first-drop landing paint authority', () => {
  it('promotes only the exact mirrored model-Y=6.0 landing pair from author-vector semantics', () => {
    for (const id of [
      'UndertowT21D:first-drop-landing-positive-z',
      'UndertowT21D:first-drop-landing-negative-z'
    ]) {
      expect(
        UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
          (record) => record.runtimeSolidId === id
        )
      ).toMatchObject({
        authority: 'PAINTABLE',
        evidenceClass: 'AUTHOR_VECTOR_SEMANTIC'
      });
    }
  });
});

