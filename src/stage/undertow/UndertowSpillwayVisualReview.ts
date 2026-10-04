import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_MACRO_COVERAGE,
  undertowT21MacroCoverageErrors
} from './UndertowSpillwayMacroCoverage';

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
  deferredFeatureIds: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds] as const,
  activationBlockers: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers] as const,
  notes:
    'Visual Review v2 combines the current reviewed T21-D geometry with a strictly review-only macro coverage layer. Yellow macro surfaces are XZ-only provisional envelopes with unresolved multi-level Y and must never be promoted to runtime authority by implication.'
});

export function undertowT21VisualReviewErrors(): readonly string[] {
  const errors: string[] = [...undertowT21MacroCoverageErrors()];
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
