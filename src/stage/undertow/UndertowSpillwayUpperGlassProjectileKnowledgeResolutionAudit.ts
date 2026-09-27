import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import {
  UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN,
  undertowRequestReadyUpperGlassCaptureIds
} from './UndertowSpillwayUpperGlassControlledCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-upper-glass-ordinary-projectile-knowledge-2026-09-28'
);

export const UNDERTOW_UPPER_GLASS_PROJECTILE_KNOWLEDGE_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13B' as const,
    auditedAt: '2026-09-28' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_ORDINARY_PROJECTILES' as const,
    evidence: Object.freeze({
      id: evidence.id,
      ordinaryMainProjectilePassesThroughGlass: false,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      ordinaryMainProjectileBehavior: true
    }),
    unresolved: Object.freeze({
      thrownSubAndExplosionClasses: true,
      exactOriginalProjectileCollisionPrimitive: true,
      cameraQueryBehavior: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Ordinary-main behavior is resolved, but exact current geometry binding and any separately simulated projectile classes remain outside this evidence.'
    }),
    activationBlockersCleared: [] as const,
    nextRequestReady: 'CAMERA_GLASS_EDGE_DIFFERENTIAL' as const,
    confidence: 'HIGH' as const
  });

export function undertowUpperGlassProjectileKnowledgeResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_PROJECTILE_KNOWLEDGE_RESOLUTION_AUDIT;
  const projectile = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
    (entry) => entry.id === 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
  );
  const camera = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
    (entry) => entry.id === 'CAMERA_GLASS_EDGE_DIFFERENTIAL'
  );

  if (
    projectile?.status !== 'RESOLVED' ||
    projectile.userActionCount !== 0 ||
    camera?.status !== 'REQUEST_READY' ||
    undertowRequestReadyUpperGlassCaptureIds().join(',') !==
      'CAMERA_GLASS_EDGE_DIFFERENTIAL'
  ) {
    errors.push('Pass 13B must retire the redundant projectile capture and expose only camera query next');
  }

  if (
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.projectileSemanticEvidence
      .currentOrdinaryMainProjectileBehaviorResolved ||
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.projectileSemanticEvidence
      .currentOrdinaryMainProjectilePassesThroughGlass ||
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.projectileSemanticEvidence
      .userDirectGameplayKnowledgeAccepted
  ) {
    errors.push('Pass 13B ordinary-main projectile knowledge did not bind into the collision authority audit');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotion.authorized ||
    !audit.unresolved.cameraQueryBehavior
  ) {
    errors.push('Pass 13B must not clear blockers or infer camera/runtime geometry authority');
  }

  return errors;
}
