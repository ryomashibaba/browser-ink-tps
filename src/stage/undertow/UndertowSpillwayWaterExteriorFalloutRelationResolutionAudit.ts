import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_WATER_KILL_AUTHORITY_AUDIT } from './UndertowSpillwayWaterKillAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-water-exterior-fallout-qualitative-relation-knowledge-2026-09-28'
);

export const UNDERTOW_WATER_EXTERIOR_FALLOUT_RELATION_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '14C' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine whether exterior stage fall-out and the mapped internal water hazards kill the player in approximately the same vertical band.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_WATER_EXTERIOR_FALLOUT_RELATION' as const,
    evidence: Object.freeze({
      id: evidence.id,
      selectedBehavior: 'A_APPROXIMATELY_SAME_DEATH_HEIGHT_BAND' as const,
      sameApproximateDeathHeightBand: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      qualitativeWaterVsExteriorFalloutDeathHeightRelation: true
    }),
    unresolved: Object.freeze({
      exactSharedKillThreshold: true,
      exactThresholdDelta: true,
      sharedDeathVolumeIdentity: true,
      exactKillWorldY: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Approximate gameplay-height similarity cannot prove one shared death volume or supply an exact numeric threshold.'
    }),
    activationBlockersCleared: [] as const,
    blockersStillRequired: ['WATER_KILL_THRESHOLD_PENDING'] as const,
    confidence: 'HIGH' as const
  });

export function undertowWaterExteriorFalloutRelationResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_WATER_EXTERIOR_FALLOUT_RELATION_RESOLUTION_AUDIT;
  const kill = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.directUserGameplayKnowledgePreferredBeforeCapture ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.redundantCaptureForbiddenWhenKnowledgeSufficient
  ) {
    errors.push('purpose-first / knowledge-first evidence policy drifted');
  }

  if (
    !audit.evidence.sameApproximateDeathHeightBand ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 14C direct gameplay relation evidence drifted');
  }

  if (
    !kill.waterAndExteriorFallOutQualitativeDeathHeightRelationResolved ||
    !kill.waterAndExteriorFallOutAppearSameApproxDeathHeightBand ||
    kill.exactWaterVsExteriorFallOutThresholdDeltaResolved ||
    kill.exactWaterVsExteriorFallOutThresholdDeltaMeters !== null ||
    !kill.waterAndExteriorFallOutRelationUserDirectGameplayKnowledgeAccepted ||
    kill.waterAndExteriorFallOutShareThresholdResolved
  ) {
    errors.push('Pass 14C relation did not bind cleanly or over-promoted exact equality');
  }

  if (
    kill.killThresholdResolved ||
    kill.killThresholdMeters !== null ||
    kill.killVolumePlacementResolved ||
    audit.runtimePromotion.authorized ||
    audit.activationBlockersCleared.length !== 0
  ) {
    errors.push('Pass 14C must not promote an exact kill threshold or death volume');
  }

  return errors;
}
