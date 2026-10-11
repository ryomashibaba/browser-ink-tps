import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_EXTERIOR_FALLOUT_RELATION_RESOLUTION_AUDIT,
  undertowWaterExteriorFalloutRelationResolutionAuditErrors
} from './UndertowSpillwayWaterExteriorFalloutRelationResolutionAudit';

describe('T21 Resolution Pass 14C water / exterior fall-out relation', () => {
  it('states the purpose and accepts behavior A from direct gameplay knowledge', () => {
    const audit = UNDERTOW_WATER_EXTERIOR_FALLOUT_RELATION_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('approximately the same vertical band');
    expect(audit.evidence.selectedBehavior)
      .toBe('A_APPROXIMATELY_SAME_DEATH_HEIGHT_BAND');
    expect(audit.evidence.sameApproximateDeathHeightBand).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('keeps exact threshold equality and volume identity unresolved', () => {
    const audit = UNDERTOW_WATER_EXTERIOR_FALLOUT_RELATION_RESOLUTION_AUDIT;
    expect(audit.resolved.qualitativeWaterVsExteriorFalloutDeathHeightRelation).toBe(true);
    expect(audit.unresolved.exactSharedKillThreshold).toBe(true);
    expect(audit.unresolved.exactThresholdDelta).toBe(true);
    expect(audit.unresolved.sharedDeathVolumeIdentity).toBe(true);
    expect(audit.unresolved.exactKillWorldY).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.blockersStillRequired).toEqual(['WATER_KILL_THRESHOLD_PENDING']);
  });

  it('passes the Pass 14C authority-boundary audit', () => {
    expect(undertowWaterExteriorFalloutRelationResolutionAuditErrors()).toEqual([]);
  });
});
