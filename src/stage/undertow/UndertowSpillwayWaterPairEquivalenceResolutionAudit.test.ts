import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_PAIR_EQUIVALENCE_RESOLUTION_AUDIT,
  undertowWaterPairEquivalenceResolutionAuditErrors
} from './UndertowSpillwayWaterPairEquivalenceResolutionAudit';

describe('T21 Resolution Pass 14B mapped-water pair equivalence', () => {
  it('states the purpose and accepts behavior A from direct gameplay knowledge', () => {
    const audit = UNDERTOW_WATER_PAIR_EQUIVALENCE_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('two mapped internal Undertow water hazards');
    expect(audit.evidence.selectedBehavior)
      .toBe('A_SAME_APPARENT_HEIGHT_AND_DEATH_BEHAVIOR');
    expect(audit.evidence.sameApparentVisibleSurfaceHeight).toBe(true);
    expect(audit.evidence.sameEssentiallyImmediateContactDeathBehavior).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('keeps exact shared Y/deltas and exterior fall-out relation unresolved', () => {
    const audit = UNDERTOW_WATER_PAIR_EQUIVALENCE_RESOLUTION_AUDIT;
    expect(audit.resolved.qualitativePairVisualHeightRelation).toBe(true);
    expect(audit.resolved.qualitativePairDeathBehaviorRelation).toBe(true);
    expect(audit.unresolved.exactSharedVisualWaterWorldY).toBe(true);
    expect(audit.unresolved.exactVisualHeightDelta).toBe(true);
    expect(audit.unresolved.exactSharedKillThresholdWorldY).toBe(true);
    expect(audit.unresolved.exactKillThresholdDelta).toBe(true);
    expect(audit.unresolved.waterVsExteriorFalloutThresholdRelationship).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.blockersStillRequired).toEqual([
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING'
    ]);
  });

  it('passes the Pass 14B authority-boundary audit', () => {
    expect(undertowWaterPairEquivalenceResolutionAuditErrors()).toEqual([]);
  });
});
