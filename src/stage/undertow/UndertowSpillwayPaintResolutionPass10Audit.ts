import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';
import {
  UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT,
  UNDERTOW_RIGHT_LOW_ROUTE_RAMPS
} from './UndertowSpillwayRouteRampGeometry';

const ROUTE_RAMP_RUNTIME_SOLID_IDS = [
  'UndertowT21D:right-low-route-ramp-positive-z',
  'UndertowT21D:right-low-route-ramp-negative-z'
] as const;

const routeRampPaintSurfaces =
  UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
    surface.id.includes('right-low-route-ramp-')
  );

export const UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT = Object.freeze({
  round: '10A' as const,
  scope: 'AUTHOR_TURF_VECTOR_ROUTE_RAMP_PAINT_REGISTRATION' as const,
  pinnedTurfVectorSource: Object.freeze({
    bytes: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource.bytes,
    sha256: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource.sha256,
    pageWidthPoints:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource.pageWidthPoints,
    pageHeightPoints:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource.pageHeightPoints
  }),
  semanticDiscrimination: Object.freeze({
    knownPaintableCentralSlopeMedianBrightness:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .knownPaintableSlopeMedianBrightness,
    knownUninkableGlassSlopeMedianBrightness:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .knownUninkableGlassSlopeMedianBrightness,
    routeRampMedianBrightness: 255,
    routeRampCanonicalDashCountPerSide:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .routeRampCanonicalDashCountPerSide,
    positiveZDashMidpointInside:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .positiveZDashMidpointInside,
    positiveZDashFullyInside:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .positiveZDashFullyInside,
    negativeZDashMidpointInside:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .negativeZDashMidpointInside,
    negativeZDashFullyInside:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .negativeZDashFullyInside,
    canonicalDashWidthPoints:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .canonicalDashWidthPoints,
    canonicalDashLengthPoints:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .canonicalDashLengthPoints,
    brightnessDistanceToPaintableMedian:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .brightnessDistanceToPaintableMedian,
    brightnessDistanceToUninkableMedian:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.turfVectorSource
        .brightnessDistanceToUninkableMedian,
    bothMirroredRampsResolveToWhiteSlopeClass: true,
    notes:
      'The author vector source is not interpreted as “all ramps are inkable.” The same PDF contains a gray Glass slope-marker class that is explicitly uninkable. Pass 10A distinguishes the exact route-ramp projections from that gray class: both are white-background slope fields matching the already-authorized central paintable class.'
  }),
  sourceBinding: Object.freeze({
    exactSourceObject: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.selectedSourceObject,
    exactSourceMaterial:
      UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.selectedSourceMaterial,
    exactMirroredSourceQuads: UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.length,
    mirrorXorVertices: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.mirrorXorVertices,
    projectYMinMeters: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.projectYMinMeters,
    projectYMaxMeters: UNDERTOW_RIGHT_LOW_ROUTE_RAMP_AUDIT.projectYMaxMeters,
    paintAuthorityResolved: UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.every(
      (record) => record.paintAuthority === 'PAINTABLE'
    )
  }),
  runtimePromotion: Object.freeze({
    authorizedRuntimeSolidIds: ROUTE_RAMP_RUNTIME_SOLID_IDS,
    paintSurfaceCount: routeRampPaintSurfaces.length,
    allPaintable: routeRampPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Paintable) !== 0
    ),
    allSwimmable: routeRampPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Swimmable) !== 0
    ),
    allRamp: routeRampPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Ramp) !== 0
    ),
    anyFloor: routeRampPaintSurfaces.some(
      (surface) => (surface.flags & SurfaceFlags.Floor) !== 0
    ),
    anyScoreable: routeRampPaintSurfaces.some(
      (surface) => (surface.flags & SurfaceFlags.Scoreable) !== 0
    )
  }),
  currentPaintInventory: Object.freeze({
    confirmedPaintableRuntimeSolidCount:
      UNDERTOW_PAINT_AUTHORITY_AUDIT.confirmedPaintableCount,
    unresolvedRuntimeSolidCount: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
    unresolvedRuntimeSolidIds:
      UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds,
    activationBlockerCleared: false
  }),
  notes:
    'Resolution Pass 10A itself promotes exactly the two mirrored right-low route-ramp quads to PAINTABLE. Resolution Pass 10C later promotes the separate first-drop landing pair; whole-underpass remainders and Turf Scoreable remain unresolved. The current inventory therefore has two unresolved solids.'
});

export function undertowPaintResolutionPass10AuditErrors(): readonly string[] {
  const audit = UNDERTOW_PAINT_RESOLUTION_PASS10_AUDIT;
  const errors: string[] = [];

  if (
    audit.pinnedTurfVectorSource.bytes !== 100311 ||
    audit.pinnedTurfVectorSource.sha256 !==
      '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f'
  ) {
    errors.push('Pass 10A pinned Turf vector source drifted');
  }

  if (
    audit.semanticDiscrimination.routeRampCanonicalDashCountPerSide !== 168 ||
    audit.semanticDiscrimination.positiveZDashMidpointInside !== 133 ||
    audit.semanticDiscrimination.positiveZDashFullyInside !== 126 ||
    audit.semanticDiscrimination.negativeZDashMidpointInside !== 126 ||
    audit.semanticDiscrimination.negativeZDashFullyInside !== 126 ||
    audit.semanticDiscrimination.canonicalDashWidthPoints !== 0.24 ||
    audit.semanticDiscrimination.canonicalDashLengthPoints !== 0.96 ||
    audit.semanticDiscrimination.knownPaintableCentralSlopeMedianBrightness !==
      255 ||
    audit.semanticDiscrimination.knownUninkableGlassSlopeMedianBrightness !==
      191 ||
    audit.semanticDiscrimination.routeRampMedianBrightness !== 255 ||
    audit.semanticDiscrimination.brightnessDistanceToPaintableMedian !== 0 ||
    audit.semanticDiscrimination.brightnessDistanceToUninkableMedian !== 64 ||
    !audit.semanticDiscrimination.bothMirroredRampsResolveToWhiteSlopeClass
  ) {
    errors.push('Pass 10A author-vector paint-class discrimination drifted');
  }

  if (
    audit.sourceBinding.exactMirroredSourceQuads !== 2 ||
    audit.sourceBinding.mirrorXorVertices !== 0 ||
    audit.sourceBinding.projectYMinMeters !== 3 ||
    audit.sourceBinding.projectYMaxMeters !== 4.5 ||
    !audit.sourceBinding.paintAuthorityResolved
  ) {
    errors.push('Pass 10A exact route-ramp source binding drifted');
  }

  if (
    audit.runtimePromotion.paintSurfaceCount !== 2 ||
    !audit.runtimePromotion.allPaintable ||
    !audit.runtimePromotion.allSwimmable ||
    !audit.runtimePromotion.allRamp ||
    audit.runtimePromotion.anyFloor ||
    audit.runtimePromotion.anyScoreable
  ) {
    errors.push('Pass 10A route-ramp runtime paint representation drifted');
  }

  for (const id of ROUTE_RAMP_RUNTIME_SOLID_IDS) {
    const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
      (candidate) => candidate.runtimeSolidId === id
    );
    if (
      !record ||
      record.authority !== 'PAINTABLE' ||
      record.evidenceClass !== 'AUTHOR_VECTOR_SEMANTIC'
    ) {
      errors.push(`${id}: Pass 10A paint-authority inventory record missing`);
    }
  }

  if (
    audit.currentPaintInventory.confirmedPaintableRuntimeSolidCount !== 15 ||
    audit.currentPaintInventory.unresolvedRuntimeSolidCount !== 2 ||
    audit.currentPaintInventory.unresolvedRuntimeSolidIds.length !== 2 ||
    audit.currentPaintInventory.activationBlockerCleared
  ) {
    errors.push('Pass 10A current paint inventory/blocker state drifted');
  }

  return errors;
}
