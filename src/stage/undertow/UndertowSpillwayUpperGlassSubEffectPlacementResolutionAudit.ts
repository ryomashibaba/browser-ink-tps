import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-upper-glass-sub-effect-and-placement-knowledge-2026-09-28'
);

export const UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13E' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine which sub-weapon effects can propagate through transparent Undertow glass and which deployable subs can be placed on the glass surface.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_SUB_EFFECT_AND_PLACEMENT' as const,
    evidence: Object.freeze({
      id: evidence.id,
      crossGlassEffectPassThroughExceptions: ['POISON_MIST', 'POINT_SENSOR'] as const,
      allOtherSubWeaponCrossGlassEffectsBlocked: true,
      poisonMistAndPointSensorAreAreaQueryExceptions: true,
      deployableSubPlacementOnGlassGenerallyAllowed: true,
      deployablePlacementExamples: ['JUMP_BEACON', 'SPRINKLER', 'SPLASH_SHIELD'] as const,
      trapPlacementRequiresPaintableFloor: true,
      trapPlacementOnTransparentGlassAllowed: false,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      subWeaponCrossGlassEffectSemantics: true,
      deployableSubPlacementSemantics: true
    }),
    unresolved: Object.freeze({
      exactOriginalCollisionOrQueryPrimitive: true,
      unrelatedSpecialWeaponPropagation: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Behavioral semantics are resolved, but exact primitive binding remains unresolved and special-weapon behavior is outside this pass.'
    }),
    activationBlockersCleared: [] as const,
    confidence: 'HIGH' as const
  });

export function undertowUpperGlassSubEffectPlacementResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_SUB_EFFECT_PLACEMENT_RESOLUTION_AUDIT;
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
    audit.evidence.crossGlassEffectPassThroughExceptions.join(',') !==
      'POISON_MIST,POINT_SENSOR' ||
    !audit.evidence.allOtherSubWeaponCrossGlassEffectsBlocked ||
    !audit.evidence.poisonMistAndPointSensorAreAreaQueryExceptions ||
    !audit.evidence.deployableSubPlacementOnGlassGenerallyAllowed ||
    audit.evidence.deployablePlacementExamples.join(',') !==
      'JUMP_BEACON,SPRINKLER,SPLASH_SHIELD' ||
    !audit.evidence.trapPlacementRequiresPaintableFloor ||
    audit.evidence.trapPlacementOnTransparentGlassAllowed ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 13E user-confirmed sub-effect/placement semantics drifted');
  }

  if (
    !projectile.subWeaponCrossGlassEffectPropagationResolved ||
    projectile.crossGlassEffectPassThroughExceptions.join(',') !==
      'POISON_MIST,POINT_SENSOR' ||
    !projectile.allOtherSubWeaponCrossGlassEffectsBlocked ||
    !projectile.explosionPropagationResolved ||
    projectile.explosionPropagationScope !== 'SUB_WEAPONS_ONLY' ||
    projectile.specialWeaponPropagationResolved ||
    !projectile.deployableSubPlacementOnGlassGenerallyAllowed ||
    projectile.deployablePlacementExamples.join(',') !==
      'JUMP_BEACON,SPRINKLER,SPLASH_SHIELD' ||
    !projectile.trapPlacementRequiresPaintableFloor ||
    projectile.trapPlacementOnTransparentGlassAllowed ||
    !projectile.subWeaponPlacementSemanticsResolved
  ) {
    errors.push('Pass 13E knowledge did not bind cleanly into upper-glass gameplay semantics');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotion.authorized ||
    !audit.unresolved.exactOriginalCollisionOrQueryPrimitive ||
    !audit.unresolved.unrelatedSpecialWeaponPropagation
  ) {
    errors.push('Pass 13E must not over-promote exact primitive or special-weapon authority');
  }

  return errors;
}
