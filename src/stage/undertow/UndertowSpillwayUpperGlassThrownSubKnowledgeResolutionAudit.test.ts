import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_THROWN_SUB_KNOWLEDGE_RESOLUTION_AUDIT,
  undertowUpperGlassThrownSubKnowledgeResolutionAuditErrors
} from './UndertowSpillwayUpperGlassThrownSubKnowledgeResolutionAudit';

describe('T21 Resolution Pass 13D thrown-sub knowledge resolution', () => {
  it('states the pass purpose and accepts direct gameplay knowledge', () => {
    const audit = UNDERTOW_UPPER_GLASS_THROWN_SUB_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('Splash Bomb');
    expect(audit.evidence.selectedBehavior)
      .toBe('A_ORDINARY_SOLID_SURFACE_COLLISION');
    expect(audit.evidence.thrownSubBodyPassesThroughGlass).toBe(false);
    expect(audit.evidence.behavesLikeOrdinaryWallFloorCeiling).toBe(true);
    expect(audit.evidence.directGameplayKnowledgeAccepted).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('keeps explosion propagation and exact primitive identity separate', () => {
    const audit = UNDERTOW_UPPER_GLASS_THROWN_SUB_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.resolved.thrownSubBodyCollisionBehavior).toBe(true);
    expect(audit.unresolved.explosionDamageInkPropagation).toBe(true);
    expect(audit.unresolved.exactOriginalProjectileCollisionPrimitive).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
  });

  it('passes the Pass 13D authority-boundary audit', () => {
    expect(undertowUpperGlassThrownSubKnowledgeResolutionAuditErrors()).toEqual([]);
  });
});
