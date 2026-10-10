import { UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT } from './UndertowSpillwayStageSourceIdentityAudit';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';
import { UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN } from './UndertowSpillwayWaterControlledCapturePlan';

export const UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT = Object.freeze({
  resolutionPass: '14D' as const,
  auditedAt: '2026-09-28' as const,
  status: 'SUPERSEDED_BY_14E' as const,
  originalPurpose:
    'Recover exact visible-water world Y from current remodeled Undertow without guessing from global plan registration.' as const,
  sourceIdentity: Object.freeze({
    currentStageRowId: UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT.canonicalCurrentStageRowId,
    modelResource: UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT.canonicalCurrentModelResource,
    confirmedCurrentRemodeledUndertow: true
  }),
  ciSourceScan: Object.freeze({
    runNumber: 837,
    semanticallyNamedWaterSurfaceFound: false,
    fullCoverageBackgroundCandidateModelY: -42,
    fullCoverageBackgroundCandidateProjectY: -45,
    fullCoverageBackgroundCandidateRejectedAsVisualWater: true,
    floorFenceCandidateProjectYRange: [5.8, 5.9] as const,
    floorFenceCoverageTeamA: 0.857216,
    floorFenceCoverageTeamB: 0.820789,
    floorFenceCandidateRejectedAsVisualWaterAuthority: true
  }),
  ciBoundaryLedgeScan: Object.freeze({
    runNumber: 838,
    teamACandidateLevelCount: 72,
    teamBCandidateLevelCount: 71,
    multipleSharedSourceYLevelsRemain: true,
    exactVisualWaterYSelected: false,
    globalPdfToObjTransformTrustedForWaterMetricPlacement: false
  }),
  existingReceivedCaptures: Object.freeze({
    reviewedUnderpassPaintStills: 4,
    reviewedUpperGlassSupportVideos: 2,
    premiseCorrectionStill: 'IMG_6141.jpeg' as const,
    formerMarkedTargetObservedDry: true,
    containsUsableRegisteredWaterlineSideProfile: false
  }),
  exactVisualWaterYResolved: false,
  exactVisualWaterYMeters: null,
  sourceOnlyResolutionExhausted: true,
  premiseInvalidatedByCurrentGameplay: true,
  formerNextEvidence: 'WATER_VISUAL_Y_SIDE_PROFILE' as const,
  nextEvidence: null,
  requestReady: false,
  retiredBlocker: 'WATER_VISUAL_Y_PENDING' as const,
  supersededBy: '14E' as const,
  runtimePromotionAuthorized: false,
  activationBlockersCleared: [] as const,
  confidence: 'HIGH' as const,
  notes:
    'Pass 14D is retained only as history of the source-only investigation. IMG_6141 shows the marked current-gameplay target is dry, so requesting an internal-water side profile would be premise-invalid. Pass 14E retires this request and reclassifies the cyan source regions separately from exterior fall-out.'
});

export function undertowWaterVisualYPass14DAuditErrors(): readonly string[] {
  const a = UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT;
  const errors: string[] = [];

  if (
    !a.sourceIdentity.confirmedCurrentRemodeledUndertow ||
    a.sourceIdentity.currentStageRowId !== 'Vss_Temple01'
  ) {
    errors.push('Pass 14D must remain bound to current remodeled Undertow / Vss_Temple01');
  }
  if (
    a.ciSourceScan.semanticallyNamedWaterSurfaceFound ||
    !a.ciSourceScan.fullCoverageBackgroundCandidateRejectedAsVisualWater ||
    !a.ciSourceScan.floorFenceCandidateRejectedAsVisualWaterAuthority
  ) {
    errors.push('Pass 14D source candidate rejection boundary drifted');
  }
  if (
    !a.ciBoundaryLedgeScan.multipleSharedSourceYLevelsRemain ||
    a.ciBoundaryLedgeScan.exactVisualWaterYSelected ||
    a.ciBoundaryLedgeScan.globalPdfToObjTransformTrustedForWaterMetricPlacement
  ) {
    errors.push('Pass 14D historical source scan must not select an exact water Y');
  }
  if (
    a.status !== 'SUPERSEDED_BY_14E' ||
    !a.existingReceivedCaptures.formerMarkedTargetObservedDry ||
    !a.premiseInvalidatedByCurrentGameplay ||
    a.nextEvidence !== null ||
    a.requestReady ||
    a.supersededBy !== '14E'
  ) {
    errors.push('Pass 14D must remain superseded and request no capture');
  }
  if (
    UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN.status !==
      'CANCELLED_PREMISE_INVALIDATED' ||
    UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN.userActionCount !== 0
  ) {
    errors.push('Pass 14D audit disagrees with the cancelled capture plan');
  }
  if (
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved ||
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneMeters !== null ||
    a.runtimePromotionAuthorized ||
    a.activationBlockersCleared.length !== 0
  ) {
    errors.push('superseded Pass 14D must not promote a visual-water Y');
  }
  return errors;
}
