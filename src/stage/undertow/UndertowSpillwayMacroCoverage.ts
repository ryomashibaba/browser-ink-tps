import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export type UndertowMacroCoverageStatus =
  | 'CONFIRMED_GEOMETRY'
  | 'PROVISIONAL_MACRO_GEOMETRY'
  | 'EXISTS_BUT_NOT_IMPLEMENTED'
  | 'INTENTIONAL_VOID_OR_WATER'
  | 'UNRESOLVED';

export interface UndertowMacroCoverageRegion {
  id: string;
  label: string;
  status: UndertowMacroCoverageStatus;
  evidenceIds: readonly string[];
  geometryRefs: readonly string[];
  notes: string;
}

export interface UndertowMacroReviewSurface {
  id: string;
  regionId: string;
  status: 'PROVISIONAL_MACRO_GEOMETRY';
  outer: readonly (readonly [number, number])[];
  holes: readonly (readonly (readonly [number, number])[])[];
  reviewPlaneY: number;
  cellSizeMeters: number;
  yAuthority: 'MULTI_LEVEL_UNRESOLVED';
  notes: string;
}

export interface UndertowMacroReviewOutline {
  id: string;
  regionId: string;
  status: 'UNRESOLVED';
  points: readonly (readonly [number, number])[];
  reviewY: number;
  notes: string;
}

const vectorAndGameplay = [
  'user-turf-vector-blueprint',
  'web-post-7-2-gameplay',
  'user-five-rule-maps'
] as const;
const remodel = ['extracted-temple01-geometry', 'user-turf-vector-blueprint'] as const;
const center = ['user-center-stills', 'user-center-videos', 'web-post-7-2-gameplay'] as const;

/**
 * Whole-stage macro coverage ledger for Visual Review v2.
 *
 * This is deliberately NOT StageDefinition / StageSolid data. The ledger may describe
 * review-only broad XZ envelopes whose height/collision/paint/navigation authority is
 * unresolved. Nothing in this module may be consumed by runtime construction.
 */
export const UNDERTOW_T21_MACRO_COVERAGE_REGIONS:
  readonly UndertowMacroCoverageRegion[] = Object.freeze([
    {
      id: 'team-a-spawn-reviewed-flats',
      label: 'Team A / POS spawn-high + first-drop landing',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: remodel,
      geometryRefs: ['spawn-high-positive-z', 'first-drop-landing-positive-z'],
      notes: 'Exact audited flat components are already rendered by the inert T21-D partial blockout.'
    },
    {
      id: 'team-a-spawn-multilevel-envelope',
      label: 'Team A / POS spawn-side multi-level envelope',
      status: 'PROVISIONAL_MACRO_GEOMETRY',
      evidenceIds: vectorAndGameplay,
      geometryRefs: [UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace.id],
      notes: 'Exact broad XZ white-face envelope is known, but it spans multiple elevations. Visual Review v2 may show the XZ envelope only; it must not be flattened into runtime geometry.'
    },
    {
      id: 'team-a-right-low-route',
      label: 'Team A / POS right-low route + ramp',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...remodel, 'user-right-low-capture-2026-09-25'],
      geometryRefs: ['right-low-team-a', 'right-low-route-ramp-positive-z'],
      notes: 'The audited low-floor component and exact source ramp are already rendered.'
    },
    {
      id: 'team-a-underpass',
      label: 'Team A / POS glass underpass',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...remodel, 'user-underpass-capture-2026-09-25'],
      geometryRefs: ['glass-underpass-positive-z'],
      notes: 'Exact audited roofed floor mask is already rendered; paint/nav authority stays separate.'
    },
    {
      id: 'team-a-upper-glass',
      label: 'Team A / POS upper glass broad shape',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, 'extracted-temple01-geometry'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.positiveZGlassOverhang.id, 'Glass01-positive-z'],
      notes: 'Broad visual shape is confirmed and rendered. Thin-edge/frame collision and camera-query authority remains unresolved separately.'
    },
    {
      id: 'team-a-grate',
      label: 'Team A / POS grate',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, 'user-turf-vector-blueprint'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.positiveZGrateMesh.id],
      notes: 'Exact plan footprint and audited top reference are already rendered.'
    },
    {
      id: 'center-core',
      label: 'Center low floor + +1.5 m step',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, ...remodel],
      geometryRefs: ['center-low-team-a', 'center-low-team-b', 'center-origin-step-top-face'],
      notes: 'Current reviewed center-low components and center step are already rendered.'
    },
    {
      id: 'center-slopes',
      label: 'Center left/right slopes',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, ...remodel],
      geometryRefs: ['center-left-slope', 'center-right-slope', 'FloorSlope00'],
      notes: 'Exact reviewed source slope quads are already rendered.'
    },
    {
      id: 'team-b-grate',
      label: 'Team B / NEG grate',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, 'user-turf-vector-blueprint'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.negativeZGrateMesh.id],
      notes: 'Exact 180-degree counterpart plan footprint is already rendered.'
    },
    {
      id: 'team-b-upper-glass',
      label: 'Team B / NEG upper glass broad shape',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...center, 'extracted-temple01-geometry'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.negativeZGlassOverhang.id, 'Glass01-negative-z'],
      notes: 'Broad visual shape is confirmed and rendered. Thin-edge/frame collision and camera-query authority remains unresolved separately.'
    },
    {
      id: 'team-b-underpass',
      label: 'Team B / NEG glass underpass',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...remodel, 'user-underpass-capture-2026-09-25'],
      geometryRefs: ['glass-underpass-negative-z'],
      notes: 'Exact 180-degree counterpart roofed floor mask is already rendered.'
    },
    {
      id: 'team-b-right-low-route',
      label: 'Team B / NEG right-low route + ramp',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: [...remodel, 'user-right-low-capture-2026-09-25'],
      geometryRefs: ['right-low-team-b', 'right-low-route-ramp-negative-z'],
      notes: 'The audited low-floor component and mirrored exact source ramp are already rendered.'
    },
    {
      id: 'team-b-spawn-multilevel-envelope',
      label: 'Team B / NEG spawn-side multi-level envelope',
      status: 'PROVISIONAL_MACRO_GEOMETRY',
      evidenceIds: vectorAndGameplay,
      geometryRefs: [UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace.id],
      notes: 'Exact broad XZ white-face envelope is known, but it spans multiple elevations. Visual Review v2 may show the XZ envelope only; it must not be flattened into runtime geometry.'
    },
    {
      id: 'team-b-spawn-reviewed-flats',
      label: 'Team B / NEG spawn-high + first-drop landing',
      status: 'CONFIRMED_GEOMETRY',
      evidenceIds: remodel,
      geometryRefs: ['spawn-high-negative-z', 'first-drop-landing-negative-z'],
      notes: 'Exact audited flat components are already rendered by the inert T21-D partial blockout.'
    },
    {
      id: 'center-gameplay-objects',
      label: 'Center pillars + sponge objects',
      status: 'EXISTS_BUT_NOT_IMPLEMENTED',
      evidenceIds: center,
      geometryRefs: ['center-pillars', 'center-sponge'],
      notes: 'Existence is confirmed, but exact footprint/extents are still unresolved and no convenience object geometry is drawn.'
    },
    {
      id: 'raised-high-side-ground-family',
      label: 'Raised/high side-ground family',
      status: 'UNRESOLVED',
      evidenceIds: center,
      geometryRefs: ['raised-high-platform'],
      notes: 'The family is known, but the measurement ledger still records its specific footprints as unresolved. No guessed macro slab is drawn.'
    },
    {
      id: 'upper-glass-thin-edge-frame-boundary',
      label: 'Upper-glass thin-eedge / frame boundary detail',
      status: 'UNRESOLVED',
      evidenceIds: ['extracted-temple01-geometry', 'user-center-videos'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.positiveZGlassOverhang.id, UNDERTOW_VECTOR_TRACES.negativeZGlassOverhang.id],
      notes: 'The broad glass shape is confirmed. Red review outlines only flag the still-unresolved thin-edge/frame authority; they do not mean the whole upper-glass region is missing.'
    },
    {
      id: 'exterior-beyond-hard-silhouette',
      label: 'Exterior beyond the common hard playable silhouette',
      status: 'INTENTIONAL_VOID_OR_WATER',
      evidenceIds: ['user-turf-vector-blueprint', 'web-current-undertow-hazard-summary-2026-09-28'],
      geometryRefs: [UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.id],
      notes: 'Keep black/omitted in review. The exact exterior XZ silhouette is known; the vertical fall-out kill threshold remains unresolved and no runtime kill volume is inferred.'
    }
  ]);

export const UNDERTOW_T21_MACRO_REVIEW_SURFACES:
  readonly UndertowMacroReviewSurface[] = Object.freeze([
    {
      id: 'review-plan-team-a-spawn-multilevel-envelope',
      regionId: 'team-a-spawn-multilevel-envelope',
      status: 'PROVISIONAL_MACRO_GEOMETRY',
      outer: UNDERTOW_VECTOR_TRACES.positiveZSpawnSideWhiteFace.metricPoints,
      holes: [],
      reviewPlaneY: -1.72,
      cellSizeMeters: 0.5,
      yAuthority: 'MULTI_LEVEL_UNRESOLVED',
      notes: 'Review-only XZ plan layer placed below all currently reviewed floor geometry. The Y placement is deliberately non-authoritative.'
    },
    {
      id: 'review-plan-team-b-spawn-multilevel-envelope',
      regionId: 'team-b-spawn-multilevel-envelope',
      status: 'PROVISIONAL_MACRO_GEOMETRY',
      outer: UNDERTOW_VECTOR_TRACES.negativeZSpawnSideWhiteFace.metricPoints,
      holes: [],
      reviewPlaneY: -1.72,
      cellSizeMeters: 0.5,
      yAuthority: 'MULTI_LEVEL_UNRESOLVED',
      notes: 'Review-only XZ plan layer placed below all currently reviewed floor geometry. The Y placement is deliberately non-authoritative.'
    }
  ]);

export const UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES:
  readonly UndertowMacroReviewOutline[] = Object.freeze([
    {
      id: 'review-outline-team-a-upper-glass-boundary',
      regionId: 'upper-glass-thin-edge-frame-boundary',
      status: 'UNRESOLVED',
      points: UNDERTOW_VECTOR_TRACES.positiveZGlassOverhang.metricPoints,
      reviewY: 7.72,
      notes: 'Review marker only; broad glass geometry is confirmed, final thin-edge/frame authority is not.'
    },
   {
      id: 'review-outline-team-b-upper-glass-boundary',
      regionId: 'upper-glass-thin-edge-frame-boundary',
      status: 'UNRESOLVED',
      points: UNDERTOW_VECTOR_TRACES.negativeZGlassOverhang.metricPoints,
      reviewY: 7.72,
      notes: 'Review marker only; broad glass geometry is confirmed, final thin-edge/frame authority is not.'
    }
  ]);

export const UNDERTOW_T21_MACRO_OUTER_BOUNDARY =
  UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.metricPoints;

const statusCounts: Record<UndertowMacroCoverageStatus, number> = {
  CONFIRMED_GEOMETRY: 0,
  PROVISIONAL_MACRO_GEOMETRY: 0,
  EXISTS_BUT_NOT_IMPLEMENTED: 0,
  INTENTIONAL_VOID_OR_WATER: 0,
  UNRESOLVED: 0
};
for (const region of UNDERTOW_T21_MACRO_COVERAGE_REGIONS) {
  statusCounts[region.status] += 1;
}

export const UNDERTOW_T21_MACRO_COVERAGE = Object.freeze({
  version: 2,
  reviewOnly: true,
  activationReady: false as const,
  regionCount: UNDERTOW_T21_MACRO_COVERAGE_REGIONS.length,
  statusCounts: Object.freeze({ ...statusCounts }),
  regions: UNDERTOW_T21_MACRO_COVERAGE_REGIONS,
  provisionalSurfaces: UNDERTOW_T21_MACRO_REVIEW_SURFACES,
  unresolvedOutlines: UNDERTOW_T21_MACRO_UNRESOLVED_OUTLINES,
  outerBoundary: UNDERTOW_T21_MACRO_OUTER_BOUNDARY,
  sourceOnlyAnnotationIds: [
    UNDERTOW_VECTOR_TRACES.teamAWaterRegion.id,
    UNDERTOW_VECTOR_TRACES.teamBWaterRegion.id
  ] as const,
  notes:
    'Macro Coverage v2 is a visual-review ledger only. Yellow surfaces are broad XZ envelopes with unresolved multi-level Y and must never feed StageDefinition, Rapier, Recast, paint, scoring, or CPU paths. The two legacy cyan source polygons are source annotations, not gameplay water/void.'
});

export function undertowT21MacroCoverageErrors(): readonly string[] {
  const errors: string[] = [];
  if (!UNDERTOW_T21_MACRO_COVERAGE.reviewOnly || UNDERTOW_T21_MACRO_COVERAGE.activationReady) {
    errors.push('macro coverage must remain review-only and activation-ineligible');
  }
  if (UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady) {
    errors.push('macro review must not alter the inert partial blockout activation state');
  }
  if (UNDERTOW_T21_MACRO_OUTER_BOUNDARY.length !== 42) {
    errors.push('macro review outer boundary must remain the audited 42-vertex hard silhouette');
  }
  if (UNDERTOW_T21_MACRO_REVIEW_SURFACES.length !== 2) {
    errors.push('macro review must expose exactly the two mirrored spawn-side provisional envelopes');
  }
  for (const surface of UNDERTOW_T21_MACRO_REVIEW_SURFACES) {
    const region = UNDERTOW_T21_MACRO_COVERAGE_REGIONS.find(candidate => candidate.id === surface.regionId);
    if (!region || region.status !== 'PROVISIONAL_MACRO_GEOMETRY') {
      errors.push(`${surface.id}: provisional surface is not backed by a provisional macro region`);
    }
    if (surface.outer.length < 4 || surface.reviewPlaneY > -1.6) {
      errors.push(`${surface.id}: invalid review-only plan envelope`);
    }
    if (surface.yAuthority !== 'MULTI_LEVEL_UNRESOLVED') {
      errors.push(`${surface.id}: provisional spawn envelope must keep multi-level Y unresolved`);
    }
  }
  for (const status of [
    'CONFIRMED_GEOMETRY',
    'PROVISIONAL_MACRO_GEOMETRY',
    'EXISTS_BUT_NOT_IMPLEMENTED',
    'INTENTIONAL_VOID_OR_WATER',
    'UNRESOLVED'
  ] as const) {
    if (UNDERTOW_T21_MACRO_COVERAGE.statusCounts[status] < 1) {
      errors.push(`macro coverage has no ${status} region`);
    }
  }
  const accidentalInternalWater = UNDERTOW_T21_MACRO_COVERAGE_REGIONS.some(
    region =>
      region.status === 'INTENTIONAL_VOID_OR_WATER' &&
      region.geometryRefs.some(ref =>
        UNDERTOW_T21_MACRO_COVERAGE.sourceOnlyAnnotationIds.includes(
          ref as (typeof UNDERTOW_T21_MACRO_COVERAGE.sourceOnlyAnnotationIds)[number]
        )
      )
  );
  if (accidentalInternalWater) {
    errors.push('legacy cyan source annotations must not return as internal water/void regions');
  }
  return errors;
}
