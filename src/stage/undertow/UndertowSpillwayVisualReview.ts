import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES, UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY, undertowT21HighSourcePhase6Errors } from './UndertowSpillwayHighSourcePhase6Geometry';
import { UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES, UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY, undertowT21Phase7FramedSourceErrors } from './UndertowSpillwayPhase7FramedSourceGeometry';
import { UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES, UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY, undertowT21Phase8OriginalSourceErrors } from './UndertowSpillwayPhase8StaticSourceGeometry';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES, UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY, undertowT21Phase9DownfaceErrors } from './UndertowSpillwayPhase9DownfaceSourceGeometry';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES, UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY, undertowT21VerticalSourcePhase5BErrors } from './UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES, UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY, undertowT21FlankElevationPhase4Errors } from './UndertowSpillwayFlankElevationPhase4Geometry';
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
  phase9DownfaceSourceCount: UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.length,
  phase9DownfaceSourceVertices: UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY.sourceVertexCount,
  phase8StaticSourceCount: UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.length,
  phase8StaticVertexCount: UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY.originalVertexCount,
  phase7FramedSourceCount: UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.length,
  phase7FramedOriginalVertices: UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.sourceVertexCount,
  highSourcePhase6Count: UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.length,
  highSourcePhase6CandidatePairs: UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY.originalSourceCandidatePairs,
  verticalSourcePhase5BCount: UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.length,
  verticalSourcePhase5BSourceAreaSquareMeters: UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY.sourceTriangleAreaSquareMeters,
  flankElevationPhase4Count: UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES.length,
  flankElevationPhase4SourceAreaSquareMeters: UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.sourceTriangleAreaSquareMeters,
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
    'Visual Review v2 combines reviewed T21-D geometry, the whole-stage occupancy underlay, provisional macro envelopes, and 64 original walk-facing source meshes + 12 near-vertical glass/metal/pillar + 2 high original source panels (124 distinct review meshes). High faces do not authorize playable roofs, floor, or collision.. Source-native mesh shape/Y is exact source data, but Pass18G route membership remains diagnostic and no runtime authority is implied.'
});

export function undertowT21VisualReviewErrors(): readonly string[] {
  const errors: string[] = [
    ...undertowT21MacroCoverageErrors(),
    ...undertowT21SourceNativeReviewErrors(),
    ...undertowT21SourceNativeSupplementErrors(),
    ...undertowT21SourceNativePhase1Errors(),
    ...undertowT21SourceBatch2Errors(),
    ...undertowT21BroadStaticSourceErrors(),
    ...undertowT21FlankElevationPhase4Errors(),
    ...undertowT21VerticalSourcePhase5BErrors(),
    ...undertowT21HighSourcePhase6Errors(),
    ...undertowT21Phase7FramedSourceErrors(),
    ...undertowT21Phase8OriginalSourceErrors(),
    ...undertowT21Phase9DownfaceErrors()
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
  if (UNDERTOW_T21_VISUAL_REVIEW.phase9DownfaceSourceCount !== 10) {
    errors.push('T21 Phase9 must preserve 5 original downward-oriented mirror pairs, source-only');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.phase8StaticSourceCount !== 16) {
    errors.push('T21 Phase8 must register exactly 8 central tower + 4 flank supports + 4 edge faces');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.phase7FramedSourceCount !== 20) {
    errors.push('T21 Phase7 must preserve 12 side supports and 8 glass-frame original source faces');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.highSourcePhase6Count !== 2) {
    errors.push('T21 high Phase6 review must retain one original mirrored upper source pair');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.verticalSourcePhase5BCount !== 12) {
    errors.push('T21 vertical Phase5B review must retain six mirrored original static pairs');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.flankElevationPhase4Count !== 10) {
    errors.push('T21 Phase4 review must retain five source-audited left/right mirror pairs');
  }
  if (UNDERTOW_T21_VISUAL_REVIEW.broadStaticSourceCount !== 6) {
    errors.push('T21 broad static source review must retain three new symmetric source floor pairs');
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
