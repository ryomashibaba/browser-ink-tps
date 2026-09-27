import { SurfaceFlags } from '../../ink/types';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';
import {
  UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES,
  undertowRequestReadyControlledAuthorityCaptureIds
} from './UndertowSpillwayControlledAuthorityCapturePlan';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';

const UNDERPASS_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z'
] as const;

const REMAINING_ACTIVATION_BLOCKERS = [
  'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
  'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
  'WATER_VISUAL_Y_PENDING',
  'WATER_KILL_THRESHOLD_PENDING',
  'TURF_SCOREABLE_MASK_PENDING',
  'FULL_STAGE_CONNECTIVITY_QA_PENDING'
] as const;

const capture = undertowCaptureEvidence(
  'user-underpass-outside-zone-paint-stills-2026-09-27'
);

const underpassPaintSurfaces =
  UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
    UNDERPASS_RUNTIME_SOLID_IDS.includes(
      surface.backingSolidId as (typeof UNDERPASS_RUNTIME_SOLID_IDS)[number]
    )
  );

export const UNDERTOW_UNDERPASS_PAINT_CAPTURE_RESOLUTION_AUDIT = Object.freeze({
  resolutionPass: '12C' as const,
  auditedAt: '2026-09-27' as const,
  scope: 'CONTROLLED_CURRENT_GAMEPLAY_OUTSIDE_ZONES' as const,
  evidence: Object.freeze({
    id: capture.id,
    filenames: capture.filenames ?? [],
    capturePairCount: 2,
    registeredProbeCount: UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES.length,
    independentlyTestedSideCount: 2,
    ordinaryMainInkPersistsOnBoth: true,
    pairToSignedSideAssignmentRequiredForOutcome: false,
    notes:
      'The user supplied the four stills directly against the marked Pass 12B two-probe request. Both independently registered probes return the same unambiguous PAINTABLE result, so the promotion does not rely on symmetry and does not require choosing which visually mirrored pair is +Z versus -Z.'
  }),
  promotion: Object.freeze({
    runtimeSolidIds: UNDERPASS_RUNTIME_SOLID_IDS,
    authority: 'PAINTABLE' as const,
    wholeAuditedFootprintPaintSurfaceAuthorized: true,
    turfScoreableAuthorized: false,
    collisionOrQueryPromotionAuthorized: false
  }),
  runtimeBoundary: Object.freeze({
    activationReady: false,
    runtimeSolidCount: 21,
    paintSurfaceCount: 17,
    navigationLinkCount: 26,
    turfScoreablePromotionCount: 0,
    activationBlockers: REMAINING_ACTIVATION_BLOCKERS
  }),
  activationBlockerCleared:
    'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING' as const,
  remainingActivationBlockerCount: REMAINING_ACTIVATION_BLOCKERS.length,
  confidence: 'HIGH' as const,
  notes:
    'Resolution Pass 12C closes only the remaining runtime paint-authority blocker. The two full audited underpass walkable footprints are Paintable/Swimmable/Floor with their support holes retained. Scoreability, upper-glass query behavior, water/death placement and final connectivity remain unresolved.'
});

export function undertowUnderpassPaintCaptureResolutionAuditErrors():
  readonly string[] {
  const errors: string[] = [];
  const audit = UNDERTOW_UNDERPASS_PAINT_CAPTURE_RESOLUTION_AUDIT;

  if (
    capture.filenames?.join(',') !==
    ['IMG_6137.jpeg', 'IMG_6136.jpeg', 'IMG_6135.jpeg', 'IMG_6134.jpeg'].join(',')
  ) {
    errors.push('Pass 12C controlled capture filename set drifted');
  }

  if (
    UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES.length !== 2 ||
    undertowRequestReadyControlledAuthorityCaptureIds().length !== 0
  ) {
    errors.push('Pass 12B probe plan must be completed and no longer request-ready');
  }

  if (
    UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount !== 0 ||
    !UNDERTOW_PAINT_AUTHORITY_AUDIT.paintAuthorityComplete
  ) {
    errors.push('Pass 12C must resolve the final two runtime paint-authority records');
  }

  for (const id of UNDERPASS_RUNTIME_SOLID_IDS) {
    const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
      (candidate) => candidate.runtimeSolidId === id
    );
    if (
      record?.authority !== 'PAINTABLE' ||
      record.evidenceClass !== 'CONTROLLED_CURRENT_GAMEPLAY'
    ) {
      errors.push(`${id}: controlled current-gameplay PAINTABLE record missing`);
    }
  }

  if (
    underpassPaintSurfaces.length !== 2 ||
    underpassPaintSurfaces.some(
      (surface) =>
        !surface.footprint ||
        surface.footprint.holes?.length !== 1 ||
        (surface.flags & SurfaceFlags.Paintable) === 0 ||
        (surface.flags & SurfaceFlags.Swimmable) === 0 ||
        (surface.flags & SurfaceFlags.Floor) === 0 ||
        (surface.flags & SurfaceFlags.Scoreable) !== 0
    )
  ) {
    errors.push('resolved whole-underpass PaintSurfaces lost exact footprint or paint-only semantics');
  }

  if (
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.some((surface) =>
      surface.id.includes('zone-underpass-paint')
    )
  ) {
    errors.push('obsolete objective-only underpass PaintSurfaces must be replaced by the whole-footprint pair');
  }

  if (
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady ||
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.length !==
      audit.runtimeBoundary.runtimeSolidCount ||
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.length !==
      audit.runtimeBoundary.paintSurfaceCount ||
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks.length !==
      audit.runtimeBoundary.navigationLinkCount ||
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.join(',') !==
      audit.runtimeBoundary.activationBlockers.join(',')
  ) {
    errors.push('Pass 12C runtime boundary drifted');
  }

  if (
    UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.includes(
      'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING'
    ) ||
    PRODUCTION_STAGE_DEFINITION.metadata.id !== 'inkworks-junction'
  ) {
    errors.push('Pass 12C must clear only the paint-authority blocker while keeping T20 production active');
  }

  return errors;
}
