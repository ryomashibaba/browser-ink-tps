import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES, UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY, undertowT21BroadStaticSourceErrors } from './UndertowSpillwayBroadStaticSourceGeometry';
import { UNDERTOW_T21_SOURCE_BATCH2_MESHES, UNDERTOW_T21_SOURCE_BATCH2_SUMMARY, undertowT21SourceBatch2Errors } from './UndertowSpillwaySourceBatch2Geometry';
import {
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY,
  undertowT21SourceNativeSupplementErrors
} from './UndertowSpillwaySourceNativeSupplementGeometry';
import { UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES, UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY, undertowT21SourceNativePhase1Errors } from './UndertowSpillwaySourceNativePhase1Geometry';
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
  broadStaticSourceCount: UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES.length,
  broadStaticSourceAreaSquareMeters: UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.totalSourceAreaSquareMeters,
  sourceBatch2Count: UNDERTOW_T21_SOURCE_BATCH2_MESHES.length,
  sourceBatch2AreaSquareMeters: UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.sourceAreaSquareMeters,
  sourceNativePhase1Count: UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES.length,
  sourceNativePhase1SourceAreaSquareMeters: UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.totalSourceTriangleAreaSquareMeters,
  sourceNativeSupplementCount: UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES.length,
  sourceNativeSupplementAreaSquareMeters: UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY.totalSourceAreaSquareMeters,
  deferredFeatureIds: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds] as const,
  activationBlockers: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers] as const,
  notes:
    'Visual Review v2 combines reviewed T21-D geometry, the whole-stage occupancy underlay, provisional macro envelopes, and 56 Temple01 source-native review meshes (16 base + 10 local + 8 Phase1 + 14 batch2 + 8 large static). Source-native mesh shape/Y is exact source data, but Pass18G route membership remains diagnostic and no runtime authority is implied.'
});

export function undertowT21VisualReviewErrors(): readonly string[] {
  const errors: string[] = [
    ...undertowT21MacroCoverageErrors(),
    ...undertowT21SourceNativeReviewErrors(),
    ...undertowT21SourceNativeSupplementErrors(),
    ...undertowT21SourceNativePhase1Errors(),
    ...undertowT21SourceBatch2Errors(),
    ...undertowT21BroadStaticSourceErrors()
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
  if (UNDERTOW_T21_VISUAL_REVIEW.sourceNativeSupplementCount !== 10) {
    errors.push('T21 visual review supplement must retain five paired source components');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.broadStaticSourceCount !== 8) {
    errors.push('T21 broad static source review must retain four symmetric source floor pairs');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.sourceBatch2Count !== 14) {
    errors.push('T21 source batch2 inventory must remain seven exact symmetric review pairs');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.sourceNativePhase1Count !== 8) {
    errors.push('T21 Phase 1 exact source review inventory must remain four mirrored pairs');
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
