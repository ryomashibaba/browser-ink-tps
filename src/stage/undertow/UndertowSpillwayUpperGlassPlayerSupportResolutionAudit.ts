import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import {
  UNDERTOW_UPPER_GLASS_COMPONENT_PROBES,
  UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN,
  undertowRequestReadyUpperGlassCaptureIds
} from './UndertowSpillwayUpperGlassControlledCapturePlan';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';

const capture = undertowCaptureEvidence(
  'user-upper-glass-support-route-videos-2026-09-27'
);

const supportRequest = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
  (entry) => entry.id === 'PLAYER_SUPPORT_COMPONENT_ROUTE'
);
const projectileRequest = UNDERTOW_UPPER_GLASS_CONTROLLED_CAPTURE_PLAN.find(
  (entry) => entry.id === 'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
);

export const UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT =
  Object.freeze({
    resolutionPass: '13A' as const,
    auditedAt: '2026-09-27' as const,
    scope: 'CONTROLLED_PLAYER_SUPPORT_ROUTE' as const,
    evidence: Object.freeze({
      captureId: capture.id,
      filenames: capture.filenames ?? [],
      durationsSeconds: capture.durationsSeconds ?? [],
      independentlyCapturedMirroredSides: 2,
      observedSupportSegmentsSeconds: [
        [21.5, 29.2],
        [10.5, 17.2]
      ] as const,
      broadComponentsPerSideTested: 3,
      seamCrossingsPerSideTested: 2,
      noJumpAssistedSeamCrossingObserved: true,
      thinEdgeStripTested: false
    }),
    resolved: Object.freeze({
      broadPlayerSupportGeometry: true,
      broadNavigationWalkabilityEvidence: true,
      lowerPanelSupport: true,
      connectorSupport: true,
      upperPanelSupport: true
    }),
    unresolved: Object.freeze({
      thinEdgeStripPlayerSupport: true,
      exactOriginalCollisionPrimitiveIdentity: true,
      ordinaryProjectileBinding: true,
      cameraQueryBinding: true
    }),
    runtimePromotion: Object.freeze({
      playerCollisionAuthorized: false,
      navigationAuthorized: false,
      reason:
        'Pass 13A resolves the broad gameplay-support subset but intentionally does not promote the whole Glass01 shell or an untested thin edge/hidden primitive into runtime collision/navigation.'
    }),
    activationBlockersCleared: [] as const,
    nextRequestReady:
      'PROJECTILE_GLASS_EDGE_DIFFERENTIAL' as const,
    confidence: 'HIGH' as const,
    notes:
      'Both mirrored current-layout glass structures independently support continuous traversal across the three broad registered upward Glass01 probe components. This is enough to retire the Pass 13A support request and design a face-localized ordinary-projectile test, but not enough to infer projectile or camera query behavior.'
  });

export function undertowUpperGlassPlayerSupportResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UPPER_GLASS_PLAYER_SUPPORT_RESOLUTION_AUDIT;

  if (
    audit.evidence.filenames.length !== 2 ||
    audit.evidence.durationsSeconds.join(',') !== '29.4,17.233333' ||
    audit.evidence.independentlyCapturedMirroredSides !== 2
  ) {
    errors.push('Pass 13A must retain both independently supplied mirrored-side videos');
  }

  const direct = UNDERTOW_UPPER_GLASS_COMPONENT_PROBES.filter(
    (probe) => probe.directSupportProbe
  );
  if (
    direct.length !== 6 ||
    audit.evidence.broadComponentsPerSideTested !== 3 ||
    audit.evidence.seamCrossingsPerSideTested !== 2 ||
    !audit.evidence.noJumpAssistedSeamCrossingObserved ||
    audit.evidence.thinEdgeStripTested
  ) {
    errors.push('Pass 13A support-route scope drifted from the three broad components per side');
  }

  if (
    supportRequest?.status !== 'RESOLVED' ||
    projectileRequest?.status !== 'REQUEST_READY' ||
    undertowRequestReadyUpperGlassCaptureIds().join(',') !==
      'PROJECTILE_GLASS_EDGE_DIFFERENTIAL'
  ) {
    errors.push('Pass 13A must retire support capture and expose only the projectile test next');
  }

  if (
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .controlledBroadPlayerSupportGeometryResolved ||
    !UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .controlledBroadNavigationWalkabilityEvidenceResolved ||
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .controlledThinEdgeStripPlayerSupportResolved ||
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .runtimePlayerSupportPromotionAuthorized ||
    UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
      .runtimeNavigationPromotionAuthorized
  ) {
    errors.push('Pass 13A collision-authority boundary drifted or over-promoted runtime geometry');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    !audit.unresolved.ordinaryProjectileBinding ||
    !audit.unresolved.cameraQueryBinding ||
    audit.runtimePromotion.playerCollisionAuthorized ||
    audit.runtimePromotion.navigationAuthorized
  ) {
    errors.push('Pass 13A must not clear collision/camera blockers or infer other query roles');
  }

  return errors;
}
