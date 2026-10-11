import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_PROJECTILE_KNOWLEDGE_RESOLUTION_AUDIT,
  undertowUpperGlassProjectileKnowledgeResolutionAuditErrors
} from './UndertowSpillwayUpperGlassProjectileKnowledgeResolutionAudit';

describe('T21 Resolution Pass 13B ordinary-projectile knowledge resolution', () => {
  it('accepts direct user gameplay knowledge instead of demanding a redundant capture', () => {
    const audit = UNDERTOW_UPPER_GLASS_PROJECTILE_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.evidence.ordinaryMainProjectilePassesThroughGlass).toBe(false);
    expect(audit.evidence.directGameplayKnowledgeAccepted).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('resolves ordinary-main behavior only and advances to camera query', () => {
    const audit = UNDERTOW_UPPER_GLASS_PROJECTILE_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.resolved.ordinaryMainProjectileBehavior).toBe(true);
    expect(audit.unresolved.exactOriginalProjectileCollisionPrimitive).toBe(true);
    expect(audit.unresolved.cameraQueryBehavior).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
    expect(audit.nextRequestReady).toBe('CAMERA_GLASS_EDGE_DIFFERENTIAL');
  });

  it('passes the Pass 13B authority-boundary audit', () => {
    expect(undertowUpperGlassProjectileKnowledgeResolutionAuditErrors()).toEqual([]);
  });
});
