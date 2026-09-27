import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_WATER_SURFACE_DEATH_RELATION_RESOLUTION_AUDIT,
  undertowWaterSurfaceDeathRelationResolutionAuditErrors
} from './UndertowSpillwayWaterSurfaceDeathRelationResolutionAudit';

describe('T21 Resolution Pass 14A water-surface/death relation', () => {
  it('states the purpose and accepts behavior A from direct gameplay knowledge', () => {
    const audit = UNDERTOW_WATER_SURFACE_DEATH_RELATION_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('qualitative vertical relationship');
    expect(audit.evidence.selectedBehavior)
      .toBe('A_DEATH_ESSENTIALLY_AT_VISIBLE_WATER_CONTACT');
    expect(audit.evidence.visibleWaterContactCausesEssentiallyImmediateDeath).toBe(true);
    expect(audit.evidence.largePerceptibleVerticalGapRuledOut).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('keeps both exact Y values and their metric offset unresolved', () => {
    const audit = UNDERTOW_WATER_SURFACE_DEATH_RELATION_RESOLUTION_AUDIT;
    expect(audit.resolved.qualitativeVisualSurfaceToDeathRelation).toBe(true);
    expect(audit.unresolved.visualWaterWorldY).toBe(true);
    expect(audit.unresolved.killThresholdWorldY).toBe(true);
    expect(audit.unresolved.exactMetricOffset).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
    expect(audit.blockersStillRequired).toEqual([
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING'
    ]);
  });

  it('passes the Pass 14A authority-boundary audit', () => {
    expect(undertowWaterSurfaceDeathRelationResolutionAuditErrors()).toEqual([]);
  });
});
