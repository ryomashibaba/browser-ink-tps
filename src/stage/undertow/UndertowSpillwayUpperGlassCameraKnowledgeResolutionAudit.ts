import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { undertowRequestReadyUpperGlassCaptureIds } from './UndertowSpillwayUpperGlassControlledCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-upper-glass-camera-blocking-knowledge-2026-09-28'
);

export const UNDERTOW_UPPER_GLASS_CAMERA_KNOWLEDGE_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13C' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine whether transparent Undertow glass acts as a third-person camera obstacle.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_CAMERA_BLOCKING' as const,
    evidence: Object.freeze({
      id: evidence.id,
      selectedBehavior: 'A_PUSHED_TO_NEAR_SIDE_DOES_NOT_PASS_THROUGH' as const,
      transparentGlassBlocksCamera: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      cameraBlockingBehavior: true
    }),
    unresolved: Object.freeze({
      exactOriginalCameraCollisionPrimitive: true,
      thinEdgeAndFrameBoundaryBinding: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Camera behavior is resolved, but exact source/hidden primitive binding remains unresolved and cannot be inferred from agreement with projectile/player behavior.'
    }),
    activationBlockersCleared: [] as const,
    requestReadyAfterPass: [] as const,
    confidence: 'HIGH' as const
  });

export function undertowUpperGlassCameraKnowledgeResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_CAMERA_KNOWLEDGE_RESOLUTION_AUDIT;

  if (
    !audit.evidence.transparentGlassBlocksCamera ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 13C must retain the user-confirmed A camera behavior without redundant capture');
  }

  if (
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.cameraQueryBehaviorResolved ||
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .cameraTransparentGlassBlocksThirdPersonCamera ||
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .cameraUserDirectGameplayKnowledgeAccepted ||
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .exactCameraCollisionPrimitiveResolved
  ) {
    errors.push('Pass 13C camera semantics did not bind cleanly into the collision authority audit');
  }

  if (
    undertowRequestReadyUpperGlassCaptureIds().length !== 0 ||
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotion.authorized ||
    !audit.unresolved.exactOriginalCameraCollisionPrimitive
  ) {
    errors.push('Pass 13C must retire the behavior question without over-promoting exact camera geometry');
  }

  return errors;
}
