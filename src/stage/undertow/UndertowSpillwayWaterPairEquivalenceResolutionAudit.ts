import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';
import { UNDERTOW_WATER_KILL_AUTHORITY_AUDIT } from './UndertowSpillwayWaterKillAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-water-pair-equivalence-knowledge-2026-09-28'
);

export const UNDERTOW_WATER_PAIR_EQUIVALENCE_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '14B' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine whether the two mapped internal Undertow water hazards share the same apparent surface height and the same contact-death behavior.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_WATER_PAIR_EQUIVALENCE' as const,
    evidence: Object.freeze({
      id: evidence.id,
      selectedBehavior: 'A_SAME_APPARENT_HEIGHT_AND_DEATH_BEHAVIOR' as const,
      sameApparentVisibleSurfaceHeight: true,
      sameEssentiallyImmediateContactDeathBehavior: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      qualitativePairVisualHeightRelation: true,
      qualitativePairDeathBehaviorRelation: true
    }),
    unresolved: Object.freeze({
      exactSharedVisualWaterWorldY: true,
      exactVisualHeightDelta: true,
      exactSharedKillThresholdWorldY: true,
      exactKillThresholdDelta: true,
      waterVsExteriorFalloutThresholdRelationship: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Qualitative pair equivalence does not supply exact world-Y or metric-threshold equality required for runtime placement.'
    }),
    activationBlockersCleared: [] as const,
    blockersStillRequired: [
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING'
    ] as const,
    confidence: 'HIGH' as const
  });

export function undertowWaterPairEquivalenceResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_WATER_PAIR_EQUIVALENCE_RESOLUTION_AUDIT;
  const visual = UNDERTOW_WATER_VISUAL_PLANE_AUDIT;
  const kill = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.directUserGameplayKnowledgePreferredBeforeCapture ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.redundantCaptureForbiddenWhenKnowledgeSufficient
  ) {
    errors.push('purpose-first / knowledge-first evidence policy drifted');
  }

  if (
    !audit.evidence.sameApparentVisibleSurfaceHeight ||
    !audit.evidence.sameEssentiallyImmediateContactDeathBehavior ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 14B direct gameplay pair-equivalence evidence drifted');
  }

  if (
    !visual.mappedWaterPairQualitativeVisibleHeightRelationResolved ||
    !visual.mappedWaterPairAppearsSameVisibleSurfaceHeight ||
    visual.exactMappedWaterPairHeightDeltaResolved ||
    visual.exactMappedWaterPairHeightDeltaMeters !== null ||
    !kill.mappedWaterPairQualitativeDeathBehaviorRelationResolved ||
    !kill.mappedWaterPairSameEssentiallyImmediateDeathBehavior ||
    kill.exactMappedWaterPairKillThresholdEqualityResolved ||
    kill.exactMappedWaterPairKillThresholdDeltaMeters !== null
  ) {
    errors.push('Pass 14B pair relation did not bind cleanly or over-promoted exact equality');
  }

  if (
    visual.visualPlaneResolved ||
    visual.visualPlaneMeters !== null ||
    kill.killThresholdResolved ||
    kill.killThresholdMeters !== null ||
    kill.waterAndExteriorFallOutShareThresholdResolved ||
    audit.runtimePromotion.authorized ||
    audit.activationBlockersCleared.length !== 0
  ) {
    errors.push('Pass 14B must not promote exact Y or exterior fall-out authority');
  }

  return errors;
}
