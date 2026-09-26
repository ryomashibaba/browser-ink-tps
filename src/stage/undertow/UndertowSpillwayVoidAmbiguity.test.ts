import { describe, expect, it } from 'vitest';
import {
  undertowConcreteVoidCaptureRegionIds,
  undertowVoidAuditErrors,
  UNDERTOW_TEMPLE01_VOID_XZ_AUDIT,
  UNDERTOW_VOID_AMBIGUITY_AUDIT
} from './UndertowSpillwayVoidAmbiguity';

describe('T21-B Undertow internal-void ambiguity audit', () => {
  it('keeps known lower-layer overlaps out of the kill-void class', () => {
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.reviewedRegions.map((item) => item.id))
      .toEqual([
        'NEGATIVE_Z_CENTRAL_UNDERCUT',
        'POSITIVE_Z_CENTRAL_UNDERCUT',
        'RIGHT_LOW_UNDERPASS_CONNECTION'
      ]);

    for (const item of UNDERTOW_VOID_AMBIGUITY_AUDIT.reviewedRegions) {
      expect(item.status).toBe('RESOLVED_TRAVERSABLE_LOWER_LAYER');
      expect(item.confidence).toBe('HIGH');
    }
  });

  it('closes the internal-void classification only after the exhaustive Temple01 XZ audit', () => {
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.exhaustiveInternalVoidClassification)
      .toBe(true);
    expect(undertowConcreteVoidCaptureRegionIds()).toEqual([]);
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.requestReady).toBe(false);
    expect(UNDERTOW_TEMPLE01_VOID_XZ_AUDIT).toMatchObject({
      enclosedCandidateCount: 6,
      exactWaterCandidateCount: 2,
      largeStageSideExteriorCandidateCount: 2,
      overheadProjectionNonHoleCandidateCount: 2,
      unexplainedInternalCandidateCount: 0,
      largePairMirrorXorCells: 0,
      smallPairMirrorXorCells: 0,
      floorMetalInteriorHoleCount: 0,
      floorLine05InteriorHoleCount: 0,
      confidence: 'HIGH'
    });
  });

  it('keeps the completed void audit internally consistent without requesting another capture', () => {
    expect(undertowVoidAuditErrors()).toEqual([]);
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.notes).toContain(
      'no additional internal abyss polygon remains'
    );
  });
});
