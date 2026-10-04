import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_MACRO_COVERAGE,
  undertowT21MacroCoverageErrors
} from './UndertowSpillwayMacroCoverage';
import {
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY,
  undertowT21SourceNativeReviewErrors
} from './UndertowSpillwaySourceNativeReviewGeometry';

export const UNDERTOW_T21_VISUAL_REVIEW = Object.freeze({
  id: 'undertow-t21-visual-review-v2',
  routeQuery: 'stageReview=undertow',
  reviewOnly: true,
  sourcePackage: 'UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY',
  activationReady: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady,
  productionStageId: PRODUCTION_STAGE_DEFINITION.metadata.id,
  solidCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.length,
  paintSurfaceCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.length,
  navigationLinkCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks.length,
  macroRegionCount: UNDERTOW_T21_MACRO_COVERAGE.regionCount,
  macroCoverageCounts: UNDERTOW_T21_MACRO_COVERAGE.statusCounts,
  macroProvisionalSurfaceCount: UNDERTOW_T21_MACRO_COVERAGE.provisionalSurfaces.length,
  macroUnresolvedOutlineCount: UNDERTOW_T21_MACRO_COVERAGE.unresolvedOutlines.length,
  sourceNativeReviewMeshCount: UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES.length,
  sourceNativeReviewAreaSquareMeters: UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY.totalSourceAreaSquareMeters,
  deferredFeatureIds: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds] as const,
  activationBlockers: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers] as const,
  notes:
    'Visual Review v2 combines reviewed T21-D geometry, the whole-stage occupancy underlay, provisional macro envelopes, and exact Temple01 source-native review meshes. Source-native mesh shape/Y is exact source data, but Pass18G route membership remains diagnostic and no runtime authority is implied.'
});

export function undertowT21VisualReviewErrors(): readonly string[] {
  const errors: string[] = [
    ...undertowT21MacroCoverageErrors(),
    ...undertowT21SourceNativeReviewErrors()
  ];
  if (!UNDERTOW_T21_VISUAL_REVIEW.reviewOnly) {
    errors.push('T21 visual review must remain review-only');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.activationReady) {
    errors.push('T21 visual review must not make the partial blockout activation-ready');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.productionStageId !== 'inkworks-junction') {
    errors.push('T21 visual review must not replace the T20 production stage');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.solidCount < 1) {
    errors.push('T21 visual review requires reviewed partial geometry');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.paintSurfaceCount < 1) {
    errors.push('T21 visual review requires the reviewed paint-surface subset');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.sourceNativeReviewMeshCount !== 16) {
    errors.push('T21 visual review v2 source-native review mesh inventory drifted');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.macroRegionCount < 1) {
    errors.push('T21 visual review v2 requires a whole-stage macro coverage ledger');
  }
  if (
    UNDERTOW_T21_VISUAL_REVIEW.macroCoverageCounts.PROVISIONAL_MACRO_GEOMETRY < 1
  ) {
    errors.push('T21 visual review v2 requires at least one clearly provisional macro region');
  }
  if (
    !UNDERTOW_T21_VISUAL_REVIEW.activationBlockers.includes(
      'FULL_STAGE_CONNECTIVITY_QA_PENDING'
    )
  ) {
    errors.push('T21 visual review must retain the full-stage connectivity blocker');
  }
  return errors;
}
