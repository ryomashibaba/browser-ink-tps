import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT
} from './UndertowSpillwayModelXZGeometry';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';

const FIRST_DROP_RUNTIME_SOLID_IDS = [
  'UndertowT21D:first-drop-landing-positive-z',
  'UndertowT21D:first-drop-landing-negative-z'
] as const;

const firstDropGeometry = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
  item.id.startsWith('first-drop-landing-')
);

const firstDropPaintSurfaces =
  UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
    surface.id.includes('first-drop-landing-')
  );

export const UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT = Object.freeze({
  round: '10C' as const,
  scope: 'AUTHOR_TURF_VECTOR_FIRST_DROP_FLAT_PAINT_REGISTRATION' as const,
  pinnedTurfVectorSource: Object.freeze({
    bytes: 100311,
    sha256:
      '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f',
    pageWidthPoints: 841.920044,
    pageHeightPoints: 595.320007,
    updated: '2024-05-06'
  }),
  exactGeometryBinding: Object.freeze({
    componentCount: firstDropGeometry.length,
    sourceModelY: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingModelY,
    projectY: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingProjectY,
    cellsPerSide: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingCellsPerSide,
    areaSquareMetersPerSide:
      UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingAreaSquareMetersPerSide,
    holeCountPerSide:
      UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingHoleCountPerSide,
    mirrorXorCells:
      UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingMirrorXorCells,
    vertexCountPerSide: firstDropGeometry.map((item) => item.projectOuter.length),
    notes:
      'The landing pair remains the exact mirrored model-Y=6.0/project-Y=3.0 walkable components seeded from the independently registered first-drop lips.'
  }),
  authorWhiteClassRegistration: Object.freeze({
    localRegistrationGateMeters: 0.5,
    positiveZ: Object.freeze({
      medianBrightness: 255,
      nearWhiteFraction: 0.931694,
      adjacentGrayMedianBrightness: 191,
      adjacentGrayDarkOrGrayFraction: 1,
      grayOverlapFraction: 0.000000372,
      maxFirstDropLipBoundaryResidualMeters: 0.347272371
    }),
    negativeZ: Object.freeze({
      medianBrightness: 255,
      nearWhiteFraction: 0.95211,
      adjacentGrayMedianBrightness: 191,
      adjacentGrayDarkOrGrayFraction: 1,
      grayOverlapFraction: 0.003083965,
      maxFirstDropLipBoundaryResidualMeters: 0.442577995
    }),
    bothSidesResolveToWhiteFlatPaintClass: true,
    notes:
      'The exact model-derived landing polygons are projected into the pinned current Turf PDF. Both interiors remain decisively white while the immediately adjacent author-gray negative-control rectangles remain median 191 / fully dark-or-gray. Gray overlap stays below 1%, and all first-drop lip boundary residuals stay within the existing 0.5m local registration gate.'
  }),
  runtimePromotion: Object.freeze({
    authorizedRuntimeSolidIds: FIRST_DROP_RUNTIME_SOLID_IDS,
    paintSurfaceCount: firstDropPaintSurfaces.length,
    allPaintable: firstDropPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Paintable) !== 0
    ),
    allSwimmable: firstDropPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Swimmable) !== 0
    ),
    allFloor: firstDropPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Floor) !== 0
    ),
    anyRamp: firstDropPaintSurfaces.some(
      (surface) => (surface.flags & SurfaceFlags.Ramp) !== 0
    ),
    anyScoreable: firstDropPaintSurfaces.some(
      (surface) => (surface.flags & SurfaceFlags.Scoreable) !== 0
    )
  }),
  currentPaintInventory: Object.freeze({
    confirmedPaintableRuntimeSolidCount:
      UNDERTOW_PAINT_AUTHORITY_AUDIT.confirmedPaintableCount,
    confirmedUninkableRuntimeSolidCount:
      UNDERTOW_PAINT_AUTHORITY_AUDIT.confirmedUninkableCount,
    unresolvedRuntimeSolidCount: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
    unresolvedRuntimeSolidIds:
      UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds,
    activationBlockerCleared: false
  }),
  scoreableAuthorityPromoted: false,
  confidence: 'HIGH' as const,
  notes:
    'Resolution Pass 10C promotes exactly the mirrored first-drop landing pair to PAINTABLE. It does not promote the whole underpass remainder and does not infer Turf Scoreable from white/paintable semantics.'
});

export function undertowPaintResolutionPass10CAuditErrors(): readonly string[] {
  const audit = UNDERTOW_PAINT_RESOLUTION_PASS10C_AUDIT;
  const errors: string[] = [];

  if (
    audit.pinnedTurfVectorSource.bytes !== 100311 ||
    audit.pinnedTurfVectorSource.sha256 !==
      '2be10b1c720fd26dbad251b4cf06106daf50f1d45c869a653559b6310cc7c03f'
  ) {
    errors.push('Pass 10C pinned Turf vector source drifted');
  }

  if (
    audit.exactGeometryBinding.componentCount !== 2 ||
    audit.exactGeometryBinding.sourceModelY !== 6 ||
    audit.exactGeometryBinding.projectY !== 3 ||
    audit.exactGeometryBinding.cellsPerSide !== 3746 ||
    audit.exactGeometryBinding.areaSquareMetersPerSide !== 58.53125 ||
    audit.exactGeometryBinding.holeCountPerSide !== 0 ||
    audit.exactGeometryBinding.mirrorXorCells !== 0 ||
    audit.exactGeometryBinding.vertexCountPerSide.some((count) => count !== 8)
  ) {
    errors.push('Pass 10C exact first-drop geometry binding drifted');
  }

  for (const side of [
    audit.authorWhiteClassRegistration.positiveZ,
    audit.authorWhiteClassRegistration.negativeZ
  ]) {
    if (
      side.medianBrightness !== 255 ||
      side.nearWhiteFraction < 0.9 ||
      side.adjacentGrayMedianBrightness !== 191 ||
      side.adjacentGrayDarkOrGrayFraction !== 1 ||
      side.grayOverlapFraction >= 0.01 ||
      side.maxFirstDropLipBoundaryResidualMeters >
        audit.authorWhiteClassRegistration.localRegistrationGateMeters
    ) {
      errors.push('Pass 10C white-vs-gray first-drop registration drifted');
      break;
    }
  }

  if (!audit.authorWhiteClassRegistration.bothSidesResolveToWhiteFlatPaintClass) {
    errors.push('Pass 10C must keep both mirrored first-drop landings in the white flat class');
  }

  if (
    audit.runtimePromotion.paintSurfaceCount !== 2 ||
    !audit.runtimePromotion.allPaintable ||
    !audit.runtimePromotion.allSwimmable ||
    !audit.runtimePromotion.allFloor ||
    audit.runtimePromotion.anyRamp ||
    audit.runtimePromotion.anyScoreable
  ) {
    errors.push('Pass 10C first-drop runtime paint representation drifted');
  }

  for (const id of FIRST_DROP_RUNTIME_SOLID_IDS) {
    const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
      (candidate) => candidate.runtimeSolidId === id
    );
    if (
      !record ||
      record.authority !== 'PAINTABLE' ||
      record.evidenceClass !== 'AUTHOR_VECTOR_SEMANTIC'
    ) {
      errors.push(id + ': Pass 10C paint-authority inventory record missing');
    }
  }

  if (
    audit.currentPaintInventory.confirmedPaintableRuntimeSolidCount !== 15 ||
    audit.currentPaintInventory.confirmedUninkableRuntimeSolidCount !== 4 ||
    audit.currentPaintInventory.unresolvedRuntimeSolidCount !== 2 ||
    audit.currentPaintInventory.unresolvedRuntimeSolidIds.length !== 2 ||
    audit.currentPaintInventory.activationBlockerCleared ||
    audit.scoreableAuthorityPromoted
  ) {
    errors.push('Pass 10C inventory/blocker/Scoreable state drifted');
  }

  return errors;
}
