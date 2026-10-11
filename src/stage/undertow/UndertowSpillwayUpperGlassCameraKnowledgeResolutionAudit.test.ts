import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_CAMERA_KNOWLEDGE_RESOLUTION_AUDIT,
  undertowUpperGlassCameraKnowledgeResolutionAuditErrors
} from './UndertowSpillwayUpperGlassCameraKnowledgeResolutionAudit';

describe('T21 Resolution Pass 13C camera knowledge resolution', () => {
  it('accepts behavior A from direct user gameplay knowledge', () => {
    const audit = UNDERTOW_UPPER_GLASS_CAMERA_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.purpose).toContain('third-person camera obstacle');
    expect(audit.evidence.selectedBehavior)
      .toBe('A_PUSHED_TO_NEAR_SIDE_DOES_NOT_PASS_THROUGH');
    expect(audit.evidence.transparentGlassBlocksCamera).toBe(true);
    expect(audit.evidence.directGameplayKnowledgeAccepted).toBe(true);
    expect(audit.evidence.redundantCaptureRequired).toBe(false);
  });

  it('resolves camera behavior but not exact primitive binding', () => {
    const audit = UNDERTOW_UPPER_GLASS_CAMERA_KNOWLEDGE_RESOLUTION_AUDIT;
    expect(audit.resolved.cameraBlockingBehavior).toBe(true);
    expect(audit.unresolved.exactOriginalCameraCollisionPrimitive).toBe(true);
    expect(audit.unresolved.thinEdgeAndFrameBoundaryBinding).toBe(true);
    expect(audit.runtimePromotion.authorized).toBe(false);
    expect(audit.activationBlockersCleared).toEqual([]);
    expect(audit.requestReadyAfterPass).toEqual([]);
  });

  it('passes the Pass 13C authority-boundary audit', () => {
    expect(undertowUpperGlassCameraKnowledgeResolutionAuditErrors()).toEqual([]);
  });
});
