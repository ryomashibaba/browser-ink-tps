import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UNDERPASS_PAINT_CAPTURE_RESOLUTION_AUDIT,
  undertowUnderpassPaintCaptureResolutionAuditErrors
} from './UndertowSpillwayUnderpassPaintCaptureResolutionAudit';

describe('T21 Resolution Pass 12C controlled underpass paint resolution', () => {
  it('accepts both registered outside-Zone probe pairs as current PAINTABLE evidence', () => {
    const audit = UNDERTOW_UNDERPASS_PAINT_CAPTURE_RESOLUTION_AUDIT;
    expect(audit.evidence.capturePairCount).toBe(2);
    expect(audit.evidence.registeredProbeCount).toBe(2);
    expect(audit.evidence.independentlyTestedSideCount).toBe(2);
    expect(audit.evidence.ordinaryMainInkPersistsOnBoth).toBe(true);
    expect(audit.promotion.runtimeSolidIds).toHaveLength(2);
    expect(audit.promotion.authority).toBe('PAINTABLE');
  });

  it('clears only UNKNOWN paint authority and keeps Scoreable unresolved', () => {
    const audit = UNDERTOW_UNDERPASS_PAINT_CAPTURE_RESOLUTION_AUDIT;
    expect(audit.activationBlockerCleared)
      .toBe('UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING');
    expect(audit.remainingActivationBlockerCount).toBe(6);
    expect(audit.promotion.turfScoreableAuthorized).toBe(false);
    expect(audit.runtimeBoundary.turfScoreablePromotionCount).toBe(0);
    expect(audit.runtimeBoundary.activationReady).toBe(false);
  });

  it('passes the Pass 12C runtime and evidence consistency gate', () => {
    expect(undertowUnderpassPaintCaptureResolutionAuditErrors()).toEqual([]);
  });
});
