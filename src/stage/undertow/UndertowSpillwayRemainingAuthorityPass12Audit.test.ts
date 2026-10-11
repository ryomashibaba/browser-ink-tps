import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT,
  undertowRemainingAuthorityPass12AuditErrors
} from './UndertowSpillwayRemainingAuthorityPass12Audit';

describe('T21 Resolution Pass 12 remaining-authority acquisition audit', () => {
  it('revalidates the pinned public-source heads without claiming new authority', () => {
    const audit = UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT;

    expect(audit.sourceHeadRevalidation.kitrix.currentMainStillEqualsPinnedCommit).toBe(true);
    expect(audit.sourceHeadRevalidation.leanny.currentMainStillEqualsPinnedCommit).toBe(true);
    expect(audit.sourceHeadRevalidation.mapEditor.currentMainStillEqualsPinnedCommit).toBe(true);
    expect(audit.sourceHeadRevalidation.mapEditor.temple01PlacementFileCountInPublishedTree).toBe(0);
    expect(audit.activationBlockersCleared).toHaveLength(0);
    expect(audit.runtimePromotionAuthorized).toBe(false);
  });

  it('keeps runtime counts and every activation blocker frozen', () => {
    const boundary = UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT.runtimeBoundary;

    expect(boundary.activationReady).toBe(false);
    expect(boundary.runtimeSolidCount).toBe(21);
    expect(boundary.paintSurfaceCount).toBe(17);
    expect(boundary.navigationLinkCount).toBe(26);
    expect(boundary.turfScoreablePromotionCount).toBe(0);
    expect(boundary.activationBlockers).toHaveLength(7);
  });

  it('does not reuse the exhausted Turf PDF or infer missing semantics', () => {
    const results = UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT.acquisitionResults;

    expect(results.wholeUnderpassPaint.publicTurfPdfReused).toBe(false);
    expect(results.wholeUnderpassPaint.remainingUnknownRuntimeSolidCount).toBe(2);
    expect(results.waterAndDeath.visualWaterYMeters).toBeNull();
    expect(results.waterAndDeath.killThresholdMeters).toBeNull();
    expect(results.turfScoreableMask.currentScoreablePromotionCount).toBe(0);
    expect(results.connectivity.convenienceLinkAuthorized).toBe(false);
  });

  it('passes the Pass 12 canonical consistency gate', () => {
    expect(undertowRemainingAuthorityPass12AuditErrors()).toEqual([]);
  });
});
