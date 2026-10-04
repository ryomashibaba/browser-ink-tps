import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_VISUAL_REVIEW,
  undertowT21VisualReviewErrors
} from './UndertowSpillwayVisualReview';

describe('T21 Undertow visual review contract', () => {
  it('exposes reviewed partial geometry without promoting T21', () => {
    expect(undertowT21VisualReviewErrors()).toEqual([]);
    expect(UNDERTOW_T21_VISUAL_REVIEW).toMatchObject({
      id: 'undertow-t21-visual-review-v1',
      routeQuery: 'stageReview=undertow',
      reviewOnly: true,
      activationReady: false,
      productionStageId: 'inkworks-junction'
    });
    expect(UNDERTOW_T21_VISUAL_REVIEW.solidCount).toBe(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.length
    );
    expect(UNDERTOW_T21_VISUAL_REVIEW.paintSurfaceCount).toBe(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.length
    );
    expect(UNDERTOW_T21_VISUAL_REVIEW.navigationLinkCount).toBe(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks.length
    );
    expect(UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds).toEqual([
      'upper-glass-thin-edge-frame-boundary',
      'team-a-upper-glass-overhang',
      'team-b-upper-glass-overhang',
      'team-a-water-region',
      'team-b-water-region'
    ]);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
});
