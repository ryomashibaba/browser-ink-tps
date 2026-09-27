import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-upper-glass-thrown-sub-solid-collision-knowledge-2026-09-28'
);

export const UNDERTOW_UPPER_GLASS_THROWN_SUB_KNOWLEDGE_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13D' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine whether Splash Bomb and similar thrown-sub bodies pass through transparent Undertow glass or collide with it as an ordinary solid surface.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_THROWN_SUB_BODY_COLLISION' as const,
    evidence: Object.freeze({
      id: evidence.id,
      selectedBehavior: 'A_ORDINARY_SOLID_SURFACE_COLLISION' as const,
      thrownSubBodyPassesThroughGlass: false,
      behavesLikeOrdinaryWallFloorCeiling: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      thrownSubBodyCollisionBehavior: true
    }),
    unresolved: Object.freeze({
      explosionDamageInkPropagation: true,
      exactOriginalProjectileCollisionPrimitive: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Thrown-sub body behavior is resolved, but explosion propagation and exact original collision-primitive binding remain independent.'
    }),
    activationBlockersCleared: [] as const,
    confidence: 'HIGH' as const
  });

export function undertowUpperGlassThrownSubKnowledgeResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_THROWN_SUB_KNOWLEDGE_RESOLUTION_AUDIT;
  const projectile =
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.projectileSemanticEvidence;

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.directUserGameplayKnowledgePreferredBeforeCapture ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.redundantCaptureForbiddenWhenKnowledgeSufficient
  ) {
    errors.push('purpose-first / knowledge-first evidence policy drifted');
  }

  if (
    audit.evidence.thrownSubBodyPassesThroughGlass ||
    !audit.evidence.behavesLikeOrdinaryWallFloorCeiling ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 13D must retain the user-confirmed ordinary-solid thrown-sub behavior');
  }

  if (
    !projectile.thrownSubBodyCollisionResolved ||
    projectile.thrownSubBodyPassesThroughGlass ||
    !projectile.thrownSubTreatsGlassAsOrdinarySolidSurface ||
    !projectile.thrownSubUserDirectGameplayKnowledgeAccepted ||
    projectile.explosionPropagationResolved
  ) {
    errors.push('Pass 13D thrown-sub knowledge did not bind cleanly into projectile authority');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotion.authorized ||
    !audit.unresolved.explosionDamageInkPropagation ||
    !audit.unresolved.exactOriginalProjectileCollisionPrimitive
  ) {
    errors.push('Pass 13D must not infer explosion propagation or exact runtime primitive authority');
  }

  return errors;
}
