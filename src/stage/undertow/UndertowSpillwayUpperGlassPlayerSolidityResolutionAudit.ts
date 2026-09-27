import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-upper-glass-player-underside-side-collision-knowledge-2026-09-28'
);

export const UNDERTOW_UPPER_GLASS_PLAYER_SOLIDITY_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13F' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine whether the transparent glass underside and side/edge block the player like ordinary solid geometry.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_PLAYER_UNDERSIDE_SIDE_COLLISION' as const,
    evidence: Object.freeze({
      id: evidence.id,
      undersideBlocksUpwardJump: true,
      sideEdgeBlocksLateralMovement: true,
      topSupportPreviouslyResolved: true,
      broadSolidFromAboveBelowAndSide: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      broadPlayerCollisionBehavior: true
    }),
    unresolved: Object.freeze({
      exactOriginalCollisionPrimitive: true,
      oneForOneDecorativeThinFaceBinding: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Broad player collision behavior is resolved, but exact visible-face versus hidden/simplified primitive binding remains unresolved.'
    }),
    activationBlockersCleared: [] as const,
    confidence: 'HIGH' as const
  });

export function undertowUpperGlassPlayerSolidityResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_PLAYER_SOLIDITY_RESOLUTION_AUDIT;
  const authority = UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT;

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.directUserGameplayKnowledgePreferredBeforeCapture ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.redundantCaptureForbiddenWhenKnowledgeSufficient
  ) {
    errors.push('purpose-first / knowledge-first evidence policy drifted');
  }

  if (
    !audit.evidence.undersideBlocksUpwardJump ||
    !audit.evidence.sideEdgeBlocksLateralMovement ||
    !audit.evidence.topSupportPreviouslyResolved ||
    !audit.evidence.broadSolidFromAboveBelowAndSide ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 13F user-confirmed broad player solidity semantics drifted');
  }

  if (
    !authority.playerStandabilitySemanticResolved ||
    !authority.playerUndersideCollisionBehaviorResolved ||
    !authority.playerUndersideBlocksUpwardPassage ||
    !authority.playerSideEdgeCollisionBehaviorResolved ||
    !authority.playerSideEdgeBlocksLateralPassage ||
    !authority.playerBroadSolidBehaviorResolved ||
    !authority.playerCollisionUserDirectGameplayKnowledgeAccepted ||
    authority.exactPlayerCollisionFaceBindingResolved ||
    authority.runtimePlayerSupportPromotionAuthorized
  ) {
    errors.push('Pass 13F player collision semantics did not bind cleanly or over-promoted runtime authority');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotion.authorized ||
    !audit.unresolved.exactOriginalCollisionPrimitive ||
    !audit.unresolved.oneForOneDecorativeThinFaceBinding
  ) {
    errors.push('Pass 13F must not infer exact source/hidden primitive binding');
  }

  return errors;
}
