import {
  UNDERTOW_POST_7_2_REFERENCE_MAPS
} from './UndertowSpillwayReferenceCatalog';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export type UndertowVoidReviewRegionId =
  | 'NEGATIVE_Z_CENTRAL_UNDERCUT'
  | 'POSITIVE_Z_CENTRAL_UNDERCUT'
  | 'RIGHT_LOW_UNDERPASS_CONNECTION';

export type UndertowVoidReviewStatus = 'RESOLVED_TRAVERSABLE_LOWER_LAYER';

export interface UndertowVoidReviewRegion {
  id: UndertowVoidReviewRegionId;
  status: UndertowVoidReviewStatus;
  confidence: 'HIGH';
  evidenceIds: readonly string[];
  notes: string;
}

export interface UndertowVoidAmbiguityAudit {
  sourceVersion: '7.2.0';
  reviewedRegions: readonly UndertowVoidReviewRegion[];
  unresolvedConcreteRegionIds: readonly string[];
  exhaustiveInternalVoidClassification: boolean;
  requestReady: boolean;
  notes: string;
}

export const UNDERTOW_TEMPLE01_VOID_XZ_AUDIT = Object.freeze({
  coarseRasterStepMeters: 0.5,
  fineRasterStepMeters: 0.125,
  enclosedCandidateCount: 6,
  exactWaterCandidateCount: 2,
  largeStageSideExteriorCandidateCount: 2,
  overheadProjectionNonHoleCandidateCount: 2,
  unexplainedInternalCandidateCount: 0,
  largePairFineCellsPerSide: 4377,
  largePairFineAreaSquareMetersPerSide: 68.390625,
  smallPairFineCellsPerSide: 987,
  smallPairFineAreaSquareMetersPerSide: 15.421875,
  largePairMirrorXorCells: 0,
  smallPairMirrorXorCells: 0,
  largePairStageSideCoverageAt030Meters: 0.856,
  floorMetalInteriorHoleCount: 0,
  floorLine05InteriorHoleCount: 0,
  confidence: 'HIGH' as const,
  evidenceIds: [
    'extracted-temple01-geometry',
    'user-turf-vector-blueprint',
    'post-7.2-reference-map'
  ] as const,
  notes:
    'Whole common+Turf Temple01 XZ scanning found six enclosed empty candidates. Two coincide with the exact mapped cyan water pair. The large symmetric pair is predominantly enclosed by StageSide geometry and is not an internal floor hole; the small symmetric pair is produced beside simple Y=1.5 FloorMetal components under high PillarBase/SoundproofPanel projection, and the FloorMetal mesh has zero interior holes. Reverse auditing the Y=1.2 FloorLine05 mesh bordering the large pair also finds zero interior holes. No unexplained internal abyss candidate remains at BLOCKOUT XZ confidence.'
});

/**
 * Review of the internal blank/overlap areas most likely to be mistaken for a
 * fall void in the 2D blueprint.
 *
 * This audit is topology-only. The 1280x720 post-7.2 tactical maps are visual
 * cross-checks and must never inherit the vector blueprint's metric scale.
 */
export const UNDERTOW_VOID_AMBIGUITY_AUDIT: UndertowVoidAmbiguityAudit = {
  sourceVersion: '7.2.0',
  reviewedRegions: [
    {
      id: 'NEGATIVE_Z_CENTRAL_UNDERCUT',
      status: 'RESOLVED_TRAVERSABLE_LOWER_LAYER',
      confidence: 'HIGH',
      evidenceIds: [
        'post-7.2-reference-map',
        'post-7.2-layout-description',
        'undertow-180-degree-symmetry'
      ],
      notes:
        'Current Ver.7.2.0 references describe the spaces beneath both central high platforms as opened/cut out for traversal. This symmetric counterpart is therefore not a kill void.'
    },
    {
      id: 'POSITIVE_Z_CENTRAL_UNDERCUT',
      status: 'RESOLVED_TRAVERSABLE_LOWER_LAYER',
      confidence: 'HIGH',
      evidenceIds: [
        'post-7.2-reference-map',
        'post-7.2-layout-description',
        'user-underpass-capture-2026-09-25'
      ],
      notes:
        'The current-layout description identifies the central undercut as traversable and the received underpass clip independently demonstrates traversal through this lower layer.'
    },
    {
      id: 'RIGHT_LOW_UNDERPASS_CONNECTION',
      status: 'RESOLVED_TRAVERSABLE_LOWER_LAYER',
      confidence: 'HIGH',
      evidenceIds: [
        'user-right-low-capture-2026-09-25',
        'user-underpass-capture-2026-09-25'
      ],
      notes:
        'Both received clips show continuous traversable route connectivity. This overlap must not be classified as an internal abyss; the clips do not establish equal canonical floor Y.'
    }
  ],
  unresolvedConcreteRegionIds: [],
  exhaustiveInternalVoidClassification: true,
  requestReady: false,
  notes:
    'The Temple01 common+Turf audit now exhaustively classifies all six enclosed XZ empty candidates at BLOCKOUT resolution: two are the already-confirmed cyan water hazards, two are exterior/StageSide space, and two are overhead-projection false positives beside simple floor components with no interior mesh holes. Therefore no additional internal abyss polygon remains. Exterior fall-out XZ uses the exact common playable hard silhouette; the vertical kill threshold remains outside this XZ audit.'
};

const turfReference = UNDERTOW_POST_7_2_REFERENCE_MAPS.find(
  (reference) => reference.rule === 'TURF'
);

export function undertowVoidAuditErrors(): readonly string[] {
  const errors: string[] = [];
  if (!turfReference || turfReference.sourceVersion !== '7.2.0') {
    errors.push('missing current Ver.7.2.0 Turf visual cross-check');
  }
  if (!UNDERTOW_VOID_AMBIGUITY_AUDIT.exhaustiveInternalVoidClassification) {
    errors.push('Temple01 void classification must remain exhaustive after the completed XZ audit');
  }
  const modelAudit = UNDERTOW_TEMPLE01_VOID_XZ_AUDIT;
  if (
    modelAudit.enclosedCandidateCount !==
      modelAudit.exactWaterCandidateCount +
        modelAudit.largeStageSideExteriorCandidateCount +
        modelAudit.overheadProjectionNonHoleCandidateCount ||
    modelAudit.unexplainedInternalCandidateCount !== 0
  ) {
    errors.push('Temple01 enclosed-empty candidate accounting is incomplete');
  }
  if (
    modelAudit.largePairMirrorXorCells !== 0 ||
    modelAudit.smallPairMirrorXorCells !== 0 ||
    modelAudit.floorMetalInteriorHoleCount !== 0 ||
    modelAudit.floorLine05InteriorHoleCount !== 0
  ) {
    errors.push('Temple01 void exclusion audit no longer proves symmetric non-hole candidates');
  }
  if (
    UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.confidence !== 'HIGH' ||
    UNDERTOW_VECTOR_TRACES.teamAWaterRegion.confidence !== 'CONFIRMED' ||
    UNDERTOW_VECTOR_TRACES.teamBWaterRegion.confidence !== 'CONFIRMED'
  ) {
    errors.push('void XZ closure requires the exact exterior silhouette and mapped water pair');
  }
  if (
    UNDERTOW_VOID_AMBIGUITY_AUDIT.requestReady &&
    UNDERTOW_VOID_AMBIGUITY_AUDIT.unresolvedConcreteRegionIds.length === 0
  ) {
    errors.push('capture request cannot be ready without a concrete mapped ambiguity');
  }
  return errors;
}

export function undertowConcreteVoidCaptureRegionIds(): readonly string[] {
  return UNDERTOW_VOID_AMBIGUITY_AUDIT.unresolvedConcreteRegionIds;
}
