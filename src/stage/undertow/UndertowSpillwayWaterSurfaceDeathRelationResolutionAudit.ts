import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import { UNDERTOW_CAPTURE_REQUEST_POLICY } from './UndertowSpillwayEvidenceCapturePlan';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';
import { UNDERTOW_WATER_KILL_AUTHORITY_AUDIT } from './UndertowSpillwayWaterKillAuthorityAudit';

const evidence = undertowCaptureEvidence(
  'user-water-surface-contact-death-knowledge-2026-09-28'
);

export const UNDERTOW_WATER_SURFACE_DEATH_RELATION_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '14A' as const,
    auditedAt: '2026-09-28' as const,
    purpose:
      'Determine the qualitative vertical relationship between the visible water surface and the player-death trigger.' as const,
    scope: 'DIRECT_USER_GAMEPLAY_KNOWLEDGE_WATER_SURFACE_DEATH_RELATION' as const,
    evidence: Object.freeze({
      id: evidence.id,
      selectedBehavior: 'A_DEATH_ESSENTIALLY_AT_VISIBLE_WATER_CONTACT' as const,
      visibleWaterContactCausesEssentiallyImmediateDeath: true,
      largePerceptibleVerticalGapRuledOut: true,
      directGameplayKnowledgeAccepted: true,
      redundantCaptureRequired: false
    }),
    resolved: Object.freeze({
      qualitativeVisualSurfaceToDeathRelation: true
    }),
    unresolved: Object.freeze({
      visualWaterWorldY: true,
      killThresholdWorldY: true,
      exactMetricOffset: true,
      waterVsExteriorFalloutThresholdRelationship: true
    }),
    runtimePromotion: Object.freeze({
      authorized: false,
      reason:
        'Qualitative near-surface death behavior cannot supply the exact metric Y required by runtime geometry/death-volume placement.'
    }),
    activationBlockersCleared: [] as const,
    blockersStillRequired: [
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING'
    ] as const,
    confidence: 'HIGH' as const
  });

export function undertowWaterSurfaceDeathRelationResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_WATER_SURFACE_DEATH_RELATION_RESOLUTION_AUDIT;
  const kill = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;

  if (
    !UNDERTOW_CAPTURE_REQUEST_POLICY.purposeStatementRequired ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.directUserGameplayKnowledgePreferredBeforeCapture ||
    !UNDERTOW_CAPTURE_REQUEST_POLICY.redundantCaptureForbiddenWhenKnowledgeSufficient
  ) {
    errors.push('purpose-first / knowledge-first evidence policy drifted');
  }

  if (
    !audit.evidence.visibleWaterContactCausesEssentiallyImmediateDeath ||
    !audit.evidence.largePerceptibleVerticalGapRuledOut ||
    !audit.evidence.directGameplayKnowledgeAccepted ||
    audit.evidence.redundantCaptureRequired
  ) {
    errors.push('Pass 14A direct gameplay relationship evidence drifted');
  }

  if (
    !kill.currentGameplayWaterSurfaceContactRelationResolved ||
    !kill.visibleWaterContactCausesEssentiallyImmediateDeath ||
    !kill.largePerceptibleVisualToKillVerticalGapRuledOut ||
    kill.exactVisualToKillMetricOffsetResolved ||
    kill.exactVisualToKillMetricOffsetMeters !== null
  ) {
    errors.push('Pass 14A qualitative relation did not bind cleanly into water-kill authority');
  }

  if (
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved ||
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneMeters !== null ||
    kill.killThresholdResolved ||
    kill.killThresholdMeters !== null ||
    kill.visualWaterYCanDefineKillThreshold ||
    audit.runtimePromotion.authorized ||
    audit.activationBlockersCleared.length !== 0
  ) {
    errors.push('Pass 14A must not promote exact visual/kill Y or clear either water blocker');
  }

  return errors;
}
