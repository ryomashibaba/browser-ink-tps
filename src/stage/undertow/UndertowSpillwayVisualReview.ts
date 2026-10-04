import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';

export const UNDERTOW_T21_VISUAL_REVIEW = Object.freeze({
  id: 'undertow-t21-visual-review-v1',
  routeQuery: 'stageReview=undertow',
  reviewOnly: true,
  sourcePackage: 'UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY',
  activationReady: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady,
  productionStageId: PRODUCTION_STAGE_DEFINITION.metadata.id,
  solidCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.length,
  paintSurfaceCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.length,
  navigationLinkCount: UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks.length,
  deferredFeatureIds: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds] as const,
  activationBlockers: [...UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers] as const,
  notes:
    'Visual review only. It renders the current reviewed T21-D partial blockout without promoting Undertow to production, enabling gameplay, or inventing deferred geometry.'
});

export function undertowT21VisualReviewErrors(): readonly string[] {
  const errors: string[] = [];
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
  if (
    !UNDERTOW_T21_VISUAL_REVIEW.activationBlockers.includes(
      'FULL_STAGE_CONNECTIVITY_QA_PENDING'
    )
  ) {
    errors.push('T21 visual review must retain the full-stage connectivity blocker');
  }
  return errors;
}
