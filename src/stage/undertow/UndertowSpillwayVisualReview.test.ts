import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_MACRO_COVERAGE,
  UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE,
  UNDERTOW_T21_MACRO_REVIEW_SURFACES,
  UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES,
  undertowT21MacroCoverageErrors
} from './UndertowSpillwayMacroCoverage';
import {
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY,
  undertowT21SourceNativeReviewErrors
} from './UndertowSpillwaySourceNativeReviewGeometry';
import {
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY,
  undertowT21SourceNativeSupplementErrors
} from './UndertowSpillwaySourceNativeSupplementGeometry';
import {
  UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES,
  UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY,
  undertowT21SourceNativePhase1Errors
} from './UndertowSpillwaySourceNativePhase1Geometry';
import { UNDERTOW_T21_SOURCE_BATCH2_MESHES, UNDERTOW_T21_SOURCE_BATCH2_SUMMARY, undertowT21SourceBatch2Errors } from './UndertowSpillwaySourceBatch2Geometry';
import { UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES, UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY, undertowT21BroadStaticSourceErrors } from './UndertowSpillwayBroadStaticSourceGeometry';
import { UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES, UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY, undertowT21FlankElevationPhase4Errors } from './UndertowSpillwayFlankElevationPhase4Geometry';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';
import {
  UNDERTOW_T21_VISUAL_REVIEW,
  undertowT21VisualReviewErrors
} from './UndertowSpillwayVisualReview';

describe('T21 Undertow visual review contract', () => {
  it('exposes reviewed geometry plus review-only macro coverage without promoting T21', () => {
    expect(undertowT21VisualReviewErrors()).toEqual([]);
    expect(undertowT21MacroCoverageErrors()).toEqual([]);
    expect(undertowT21SourceNativeReviewErrors()).toEqual([]);
    expect(undertowT21SourceNativeSupplementErrors()).toEqual([]);
    expect(undertowT21SourceNativePhase1Errors()).toEqual([]);
    expect(undertowT21SourceBatch2Errors()).toEqual([]);
    expect(undertowT21BroadStaticSourceErrors()).toEqual([]);
    expect(undertowT21FlankElevationPhase4Errors()).toEqual([]);
    expect(UNDERTOW_T21_VISUAL_REVIEW).toMatchObject({
      id: 'undertow-t21-visual-review-v2',
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
    expect(UNDERTOW_T21_VISUAL_REVIEW.macroRegionCount).toBe(
      UNDERTOW_T21_MACRO_COVERAGE.regions.length
    );
    expect(UNDERTOW_T21_MACRO_COVERAGE.statusCounts).toEqual({
      CONFIRMED_GEOMETRY: 12,
      PROVISIONAL_MACRO_GEOMETRY: 2,
      EXISTS_BUT_NOT_IMPLEMENTED: 1,
      INTENTIONAL_VOID_OR_WATER: 1,
      UNRESOLVED: 2
    });
    expect(UNDERTOW_T21_MACRO_COVERAGE.regions).toHaveLength(18);
    expect(UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES).toHaveLength(2);
    expect(UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE.outer).toHaveLength(42);
    expect(UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES).toHaveLength(16);
    expect(UNDERTOW_T21_SOURCE_NATIVE_REVIEW_SUMMARY).toMatchObject({
      sourceAuditVersion: 'PASS18C_SOURCE_NATIVE_V1',
      discoveryPass: '18G',
      reviewOnly: true,
      runtimePromotionAuthorized: false,
      meshCount: 16,
      minimumSourceAreaSquareMeters: 8,
      requiresInsideHardSilhouette: true
    });
    expect(UNDERTOW_T21_SOURCE_NATIVE_PHASE1_MESHES).toHaveLength(8);
    expect(UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY).toMatchObject({
      pairCount: 4,
      meshCount: 8,
      reviewOnly: true,
      runtimePromotionAuthorized: false
    });
    expect(UNDERTOW_T21_SOURCE_NATIVE_PHASE1_SUMMARY.totalSourceTriangleAreaSquareMeters).toBeCloseTo(945.7093954966446,5);
    expect(UNDERTOW_T21_VISUAL_REVIEW.sourceNativePhase1Count).toBe(8);
    expect(UNDERTOW_T21_SOURCE_BATCH2_MESHES).toHaveLength(14);
    expect(UNDERTOW_T21_SOURCE_BATCH2_SUMMARY).toMatchObject({
      meshCount:14, pairCount:7, setActorPlacementPendingCount:8,
      reviewOnly:true, runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_VISUAL_REVIEW.sourceBatch2Count).toBe(14);
    expect(UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES).toHaveLength(6);
    expect(UNDERTOW_T21_VISUAL_REVIEW.broadStaticSourceCount).toBe(6);
    expect(UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES).toHaveLength(10);
    expect(UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY).toMatchObject({
      meshCount:10,pairCount:5,reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_VISUAL_REVIEW.flankElevationPhase4Count).toBe(10);
    expect(UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY).toMatchObject({
      meshCount:6,pairCount:3,reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_SOURCE_BATCH2_SUMMARY.sourceAreaSquareMeters).toBeCloseTo(157.9757578473224,8);
    expect(UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_MESHES).toHaveLength(10);
    expect(UNDERTOW_T21_SOURCE_NATIVE_SUPPLEMENT_SUMMARY).toMatchObject({
      pairCount: 5,
      meshCount: 10,
      reviewOnly: true,
      runtimePromotionAuthorized: false
    });
    expect(UNDERTOW_T21_VISUAL_REVIEW.sourceNativeSupplementCount).toBe(10);
    expect(UNDERTOW_T21_VISUAL_REVIEW.sourceNativeReviewMeshCount).toBe(16);
    expect(UNDERTOW_T21_VISUAL_REVIEW.sourceNativeReviewAreaSquareMeters).toBeCloseTo(1017.251633, 5);
    expect(UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE).toMatchObject({
      id: 'whole-stage-xz-occupancy-envelope',
      authority: 'XZ_OCCUPANCY_ONLY_NOT_FLOOR',
      sourceTopologyLimitId: 'internal-void-kill-boundaries',
      cellSizeMeters: 0.5
    });
    expect(UNDERTOW_T21_VISUAL_REVIEW.deferredFeatureIds).toEqual([
      'upper-glass-thin-edge-frame-boundary',
      'team-a-upper-glass-overhang',
      'team-b-upper-glass-overhang',
      'team-a-water-region',
      'team-b-water-region'
    ]);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });

  it('keeps the two spawn-side macro envelopes XZ-only and separate from runtime geometry', () => {
    expect(UNDERTOW_T21_MACRO_REVIEW_SURFACES).toHaveLength(2);
    const positive = UNDERTOW_T21_MACRO_REVIEW_SURFACES.find(
      surface => surface.regionId === 'team-a-spawn-multilevel-envelope'
    );
    const negative = UNDERTOW_T21_MACRO_REVIEW_SURFACES.find(
      surface => surface.regionId === 'team-b-spawn-multilevel-envelope'
    );
    expect(positive?.outer).toEqual(
      UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace.metricPoints
    );
    expect(negative?.outer).toEqual(
      UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace.metricPoints
    );
    expect(
      UNDERTOW_T21_MACRO_REVIEW_SURFACES.every(
        surface =>
          surface.status === 'PROVISIONAL_MACRO_GEOMETRY' &&
          surface.yAuthority === 'MULTI_LEVEL_UNRESOLVED' &&
          surface.reviewPlaneY < -1.6
      )
    ).toBe(true);
    expect(
      UNDERTOW_T21_MACRO_REVIEW_SURFACES.every(
        surface =>
          UNDERTOW_T21_MACRO_OCCUPANCY_ENVELOPE.reviewPlaneY <
          surface.reviewPlaneY
      )
    ).toBe(true);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });

  it('does not reinterpret the legacy cyan source annotations as internal water/void', () => {
    expect(UNDERTOW_T21_MACRO_COVERAGE.sourceOnlyAnnotationIds).toEqual([
      'team-a-water-region',
      'team-b-water-region'
    ]);
    const intentional = UNDERTOW_T21_MACRO_COVERAGE.regions.filter(
      region => region.status === 'INTENTIONAL_VOID_OR_WATER'
    );
    expect(intentional).toHaveLength(1);
    expect(intentional[0]?.id).toBe('exterior-beyond-hard-silhouette');
  });
});
