import { describe, expect, it } from 'vitest';
import {
  undertowConcreteVoidCaptureRegionIds,
  undertowVoidAuditErrors,
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

  it('does not fabricate an exhaustive no-void conclusion', () => {
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.exhaustiveInternalVoidClassification)
      .toBe(false);
    expect(undertowConcreteVoidCaptureRegionIds()).toEqual([]);
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.requestReady).toBe(false);
  });

  it('requires a concrete mapped ambiguity before another capture can be requested', () => {
    expect(undertowVoidAuditErrors()).toEqual([]);
    expect(UNDERTOW_VOID_AMBIGUITY_AUDIT.notes).toContain(
      'Keep the kill-boundary trace unresolved'
    );
  });
});
