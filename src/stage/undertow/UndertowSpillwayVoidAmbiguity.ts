import {
  UNDERTOW_POST_7_2_REFERENCE_MAPS
} from './UndertowSpillwayReferenceCatalog';

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
        'Both received clips show a continuous same-height walking connection. This overlap must not be classified as an internal abyss.'
    }
  ],
  unresolvedConcreteRegionIds: [],
  exhaustiveInternalVoidClassification: false,
  requestReady: false,
  notes:
    'No specific remaining internal blank region can currently be localized strongly enough to justify a new user capture. That does not prove that the internal-void classification is exhaustive. Keep the kill-boundary trace unresolved until a concrete ambiguous region is identified from a current top-down/3D source and can be marked on the user map.'
};

const turfReference = UNDERTOW_POST_7_2_REFERENCE_MAPS.find(
  (reference) => reference.rule === 'TURF'
);

export function undertowVoidAuditErrors(): readonly string[] {
  const errors: string[] = [];
  if (!turfReference || turfReference.sourceVersion !== '7.2.0') {
    errors.push('missing current Ver.7.2.0 Turf visual cross-check');
  }
  if (UNDERTOW_VOID_AMBIGUITY_AUDIT.exhaustiveInternalVoidClassification) {
    errors.push('internal void classification must not be marked exhaustive without complete evidence');
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
