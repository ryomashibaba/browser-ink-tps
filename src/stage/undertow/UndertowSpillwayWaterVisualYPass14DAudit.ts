import { UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT } from './UndertowSpillwayStageSourceIdentityAudit';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';
import { UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN } from './UndertowSpillwayWaterControlledCapturePlan';

export const UNDERTOW_WATER_VISUAL_Y_PASS14D_AUDIT = Object.freeze({
  resolutionPass: '14D' as const,
  auditedAt: '2026-09-28' as const,
  purpose:
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
    containsUsableRegisteredWaterlineSideProfile: false
  }),
  exactVisualWaterYResolved: false,
  exactVisualWaterYMeters: null,
  sourceOnlyResolutionExhausted: true,
  nextEvidence: UNDERTOW_WATER_CONTROLLED_CAPTURE_PLAN.id,
  requestReady: true,
  runtimePromotionAuthorized: false,
  activationBlockersCleared: [] as const,
  confidence: 'HIGH' as const,
  notes:
    'Pass 14D exhausts the currently available Temple01 OBJ/public-metadata path. Geometry supplies many nearby source-Y ledges but no water-render semantic that selects one. One side-profile gameplay clip is therefore the minimum remaining evidence needed to bind the visible waterline to an exact source Y.'
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
    errors.push('Pass 14D must not select a water Y from ambiguous source ledges');
  }
  if (
    a.existingReceivedCaptures.containsUsableRegisteredWaterlineSideProfile ||
    a.exactVisualWaterYResolved ||
    a.exactVisualWaterYMeters !== null ||
    !a.sourceOnlyResolutionExhausted ||
    !a.requestReady ||
    a.nextEvidence !== 'WATER_VISUAL_Y_SIDE_PROFILE'
  ) {
    errors.push('Pass 14D request-ready state drifted');
  }
  if (
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved ||
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneMeters !== null ||
    a.runtimePromotionAuthorized ||
    a.activationBlockersCleared.length !== 0
  ) {
    errors.push('Pass 14D must not promote visual-water Y before registered gameplay evidence');
  }
  return errors;
}
