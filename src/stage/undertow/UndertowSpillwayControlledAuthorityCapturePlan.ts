import type { MetricXZ } from '../measurement/StageMapCalibration';
import { UNDERTOW_MODEL_XZ_GEOMETRY } from './UndertowSpillwayModelXZGeometry';
import { UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION } from './UndertowSpillwayZonesVectorGeometry';

export type UndertowControlledAuthorityCaptureId =
  | 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES'
  | 'UPPER_GLASS_QUERY_BINDING'
  | 'WATER_DEATH_VERTICAL_PLACEMENT'
  | 'TURF_SCOREABLE_MASK_ISOLATION'
  | 'FINAL_CONNECTIVITY_AFTER_AUTHORITY';

export type UndertowControlledAuthorityCaptureStatus =
  | 'REQUEST_READY'
  | 'DEFERRED_REQUIRES_QUERY_ISOLATION'
  | 'DEFERRED_REQUIRES_VERTICAL_REGISTRATION'
  | 'DEFERRED_REQUIRES_SCORING_ISOLATION'
  | 'DEFERRED_UNTIL_COLLISION_AUTHORITY'
  | 'RESOLVED';

export interface UndertowControlledAuthorityCapture {
  id: UndertowControlledAuthorityCaptureId;
  priority: 1 | 2 | 3 | 4 | 5;
  status: UndertowControlledAuthorityCaptureStatus;
  blocks: readonly string[];
  userActionCount: number;
  purpose: string;
  minimumEvidence: readonly string[];
  acceptance: readonly string[];
  avoid: readonly string[];
}

export interface UndertowUnderpassPaintProbe {
  id: 'positive-z-outside-zone' | 'negative-z-outside-zone';
  backingSolidId:
    | 'UndertowT21D:glass-underpass-positive-z'
    | 'UndertowT21D:glass-underpass-negative-z';
  projectXZ: MetricXZ;
  minimumClearanceMeters: number;
}

function pointInRing(point: MetricXZ, ring: readonly MetricXZ[]): boolean {
  let inside = false;
  const [px, pz] = point;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ix, iz] = ring[i]!;
    const [jx, jz] = ring[j]!;
    const crosses =
      (iz > pz) !== (jz > pz) &&
      px < ((jx - ix) * (pz - iz)) / (jz - iz) + ix;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointInPolygonWithHoles(
  point: MetricXZ,
  outer: readonly MetricXZ[],
  holes: readonly (readonly MetricXZ[])[]
): boolean {
  return pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole));
}

function pointSegmentDistance(
  point: MetricXZ,
  a: MetricXZ,
  b: MetricXZ
): number {
  const [px, pz] = point;
  const [ax, az] = a;
  const [bx, bz] = b;
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSquared = dx * dx + dz * dz;
  if (lengthSquared === 0) return Math.hypot(px - ax, pz - az);
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lengthSquared)
  );
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function pointRingDistance(point: MetricXZ, ring: readonly MetricXZ[]): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (let i = 0; i < ring.length; i++) {
    minimum = Math.min(
      minimum,
      pointSegmentDistance(point, ring[i]!, ring[(i + 1) % ring.length]!)
    );
  }
  return minimum;
}

function pointPolygonBoundaryDistance(
  point: MetricXZ,
  outer: readonly MetricXZ[],
  holes: readonly (readonly MetricXZ[])[]
): number {
  return Math.min(
    pointRingDistance(point, outer),
    ...holes.map((hole) => pointRingDistance(point, hole))
  );
}

const underpassById = new Map(
  UNDERTOW_MODEL_XZ_GEOMETRY
    .filter((item) => item.id.startsWith('glass-underpass-'))
    .map((item) => [item.id, item] as const)
);

export const UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES:
  readonly UndertowUnderpassPaintProbe[] = Object.freeze([
  {
    id: 'positive-z-outside-zone',
    backingSolidId: 'UndertowT21D:glass-underpass-positive-z',
    projectXZ: [-12.994, 4.719] as const,
    minimumClearanceMeters: 0.35
  },
  {
    id: 'negative-z-outside-zone',
    backingSolidId: 'UndertowT21D:glass-underpass-negative-z',
    projectXZ: [6.996, -1.684] as const,
    minimumClearanceMeters: 0.35
  }
]);

export const UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN:
  readonly UndertowControlledAuthorityCapture[] = Object.freeze([
  {
    id: 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES',
    priority: 1,
    status: 'RESOLVED',
    blocks: ['UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING'],
    userActionCount: 2,
    purpose:
      'Resolve the only two remaining UNKNOWN paint-authority solids using current gameplay evidence outside the already-authorized Splat-Zone intersections.',
    minimumEvidence: [
      'Capture one short current-layout paint test at each of the two registered probe points.',
      'At each point, show the floor unpainted, fire ordinary ink directly onto the marked floor patch, then hold the camera still long enough to show whether the floor accepts a persistent ink patch.',
      'Keep enough surrounding underpass geometry visible to register the tested patch to the marked guide location.'
    ],
    acceptance: [
      'Each tested patch is visibly outside the exact registered Splat-Zone underpass paint polygon and inside the audited underpass walkable floor.',
      'The result is unambiguous for each side: persistent ordinary ink is visible, or repeated direct hits visibly fail to paint the floor.',
      'Both mirrored runtime solids are tested independently; symmetry alone is not used as paint authority.'
    ],
    avoid: [
      'Testing only inside the Splat-Zone intersections.',
      'Using a bomb/explosion-only result when ordinary ink impact can be shown directly.',
      'Inferring paintability from material names, floor appearance, or the opposite side.',
      'Using the exhausted public Turf PDF as replacement evidence.'
    ]
  },
  {
    id: 'UPPER_GLASS_QUERY_BINDING',
    priority: 2,
    status: 'DEFERRED_REQUIRES_QUERY_ISOLATION',
    blocks: [
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
      'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
    ],
    userActionCount: 0,
    purpose:
      'Bind player/projectile/camera/navigation behavior to exact current Glass01, GlassEdge, BridgeMetal, or hidden-primitives without conflating query roles.',
    minimumEvidence: [
      'A controlled test layout that can isolate exact source-face candidates for player capsule, projectile and camera queries before requesting user footage.'
    ],
    acceptance: [
      'Each query role is independently registered to exact source geometry or a bounded hidden primitive.'
    ],
    avoid: [
      'Promoting the visual Glass01 shell wholesale.',
      'Reusing projectile behavior as camera-query authority.'
    ]
  },
  {
    id: 'WATER_DEATH_VERTICAL_PLACEMENT',
    priority: 3,
    status: 'DEFERRED_REQUIRES_VERTICAL_REGISTRATION',
    blocks: ['CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING', 'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING'],
    userActionCount: 0,
    purpose:
      'Legacy capture id retained: resolve cyan source-region gameplay semantics separately from exterior fall-out death placement, without assuming internal water.',
    minimumEvidence: [
      'Independent current-gameplay or placement evidence for the cyan source regions, plus fixed-reference or placement evidence for exterior fall-out death Y if a numeric threshold is required.'
    ],
    acceptance: [
      'Visual Y and death trigger are each recovered without deriving one from the other.'
    ],
    avoid: [
      'Guessing from generic Mpt_PlayerDead metadata.',
      'Using perspective-only screenshots as metric Y authority.'
    ]
  },
  {
    id: 'TURF_SCOREABLE_MASK_ISOLATION',
    priority: 4,
    status: 'DEFERRED_REQUIRES_SCORING_ISOLATION',
    blocks: ['TURF_SCOREABLE_MASK_PENDING'],
    userActionCount: 0,
    purpose:
      'Recover Temple01 Turf victory scoring authority independently of paintability.',
    minimumEvidence: [
      'A score-specific raster/per-face source or a controlled scoring experiment whose changed region and score delta are independently measurable.'
    ],
    acceptance: [
      'Score contribution is attributable to an exact registered surface region.'
    ],
    avoid: [
      'Treating PAINTABLE as Scoreable.',
      'Reverse-engineering a mask from conflicting public total-area summaries.'
    ]
  },
  {
    id: 'FINAL_CONNECTIVITY_AFTER_AUTHORITY',
    priority: 5,
    status: 'DEFERRED_UNTIL_COLLISION_AUTHORITY',
    blocks: ['FULL_STAGE_CONNECTIVITY_QA_PENDING'],
    userActionCount: 0,
    purpose:
      'Run the final production-candidate Recast only after all traversable collision geometry is authoritatively bound.',
    minimumEvidence: [
      'Resolved upper-glass navigation binding and right-low-to-underpass transition authority.'
    ],
    acceptance: [
      'Final Recast runs against the complete candidate with no convenience bridge or guessed off-mesh link.'
    ],
    avoid: [
      'Running final connectivity on the known partial candidate.',
      'Adding a convenience link to clear DIAGNOSTIC_GAP.'
    ]
  }
]);

export function undertowRequestReadyControlledAuthorityCaptureIds():
  readonly UndertowControlledAuthorityCaptureId[] {
  return UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN
    .filter((capture) => capture.status === 'REQUEST_READY')
    .sort((a, b) => a.priority - b.priority)
    .map((capture) => capture.id);
}

export function undertowControlledAuthorityCapturePlanErrors():
  readonly string[] {
  const errors: string[] = [];

  if (UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES.length !== 2) {
    errors.push('controlled underpass paint plan must contain exactly two side-specific probes');
  }

  for (const probe of UNDERTOW_UNDERPASS_OUTSIDE_ZONE_PAINT_PROBES) {
    const side = probe.id.startsWith('positive') ? 'positiveZ' : 'negativeZ';
    const geometryId =
      side === 'positiveZ'
        ? 'glass-underpass-positive-z'
        : 'glass-underpass-negative-z';
    const underpass = underpassById.get(geometryId);
    const zoneRegistration =
      UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION[side];

    if (!underpass) {
      errors.push(`${probe.id}: missing audited underpass geometry`);
      continue;
    }

    if (
      !pointInPolygonWithHoles(
        probe.projectXZ,
        underpass.projectOuter,
        underpass.projectHoles
      )
    ) {
      errors.push(`${probe.id}: probe left the audited underpass walkable floor`);
    }

    if (
      pointInPolygonWithHoles(
        probe.projectXZ,
        zoneRegistration.projectOuter,
        zoneRegistration.projectHoles
      )
    ) {
      errors.push(`${probe.id}: probe entered the already-authorized Zone paint region`);
    }

    const clearance = Math.min(
      pointPolygonBoundaryDistance(
        probe.projectXZ,
        underpass.projectOuter,
        underpass.projectHoles
      ),
      pointPolygonBoundaryDistance(
        probe.projectXZ,
        zoneRegistration.projectOuter,
        zoneRegistration.projectHoles
      )
    );

    if (clearance < probe.minimumClearanceMeters) {
      errors.push(
        `${probe.id}: probe clearance ${clearance.toFixed(3)}m fell below ${probe.minimumClearanceMeters.toFixed(2)}m`
      );
    }
  }

  const requestReady = undertowRequestReadyControlledAuthorityCaptureIds();
  if (requestReady.length !== 0) {
    errors.push('resolved Pass 12B underpass paint capture must no longer be request-ready');
  }

  const underpassRequest = UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN.find(
    (capture) => capture.id === 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES'
  );
  if (
    !underpassRequest ||
    underpassRequest.status !== 'RESOLVED' ||
    underpassRequest.userActionCount !== 2 ||
    !underpassRequest.blocks.includes('UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING')
  ) {
    errors.push('underpass controlled capture resolution drifted from the completed Pass 12B scope');
  }

  if (
    UNDERTOW_CONTROLLED_AUTHORITY_CAPTURE_PLAN.some(
      (capture) =>
        capture.id !== 'WHOLE_UNDERPASS_PAINT_OUTSIDE_ZONES' &&
        capture.status === 'REQUEST_READY'
    )
  ) {
    errors.push('higher-cost unresolved authority captures must remain deferred');
  }

  return errors;
}
