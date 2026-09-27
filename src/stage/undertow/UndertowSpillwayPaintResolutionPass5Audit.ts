import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT
} from './UndertowSpillwayModelXZGeometry';
import {
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';

const SPAWN_RUNTIME_SOLID_IDS = [
  'UndertowT21D:spawn-high-positive-z',
  'UndertowT21D:spawn-high-negative-z'
] as const;

const PASS5_UNRESOLVED_RUNTIME_SOLID_IDS = [
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z',
  'UndertowT21D:first-drop-landing-positive-z',
  'UndertowT21D:first-drop-landing-negative-z',
  'UndertowT21D:right-low-route-ramp-positive-z',
  'UndertowT21D:right-low-route-ramp-negative-z'
] as const;

const spawnGeometry = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
  item.id.startsWith('spawn-high-')
);
const spawnPaintSurfaces =
  UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter((surface) =>
    surface.id.includes('spawn-high-')
  );

export const UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT = Object.freeze({
  round: 5,
  scope: 'CURRENT_TURF_SPAWN_PAINT_REGISTRATION' as const,
  publicEvidence: Object.freeze({
    inikipediaCurrentLayout:
      'Current Undertow layout describes the spawn area as a wide area of turf extending far to the right.',
    kamigameCurrentTurf:
      'Current Turf guide states that Undertow has a broad own-territory area and advises checking the map for leftover uninked ground after respawning.',
    authorityScope:
      'These sources establish current spawn/base ground paint acceptance. They do not by themselves define the full multi-elevation spawn-side envelope, a spawn-protection mask, or Turf Scoreable boundaries.'
  }),
  exactSpawnBinding: Object.freeze({
    componentCount: spawnGeometry.length,
    modelY: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighModelY,
    projectY: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighProjectY,
    cellsPerSide: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighCellsPerSide,
    areaSquareMetersPerSide:
      UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighAreaSquareMetersPerSide,
    holeCountPerSide: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighHoleCountPerSide,
    mirrorXorCells: UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighMirrorXorCells,
    seededFromVerifiedSpawnCenter: true,
    notes:
      'CI #648 derives only the flat model-Y=10.5 component connected to the registered spawn center, with exact mirrored raw-mask symmetry. This avoids treating the full white spawn-side vector envelope as one paint surface.'
  }),
  authorityPromotion: Object.freeze({
    authorizedRuntimeSolidIds: SPAWN_RUNTIME_SOLID_IDS,
    paintAuthorityResolved: true,
    evidenceClass: 'PUBLIC_CURRENT_GAMEPLAY' as const,
    scoreableAuthorityPromoted: false,
    spawnProtectionAuthorityPromoted: false
  }),
  runtimeRepresentation: Object.freeze({
    paintSurfaceCount: spawnPaintSurfaces.length,
    usesBackingFootprint: spawnPaintSurfaces.every((surface) => {
      const backing = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.find(
        (solid) => solid.id === surface.backingSolidId
      );
      return Boolean(backing?.footprint);
    }),
    preservesTwoHolesPerSide: spawnPaintSurfaces.every((surface) => {
      const backing = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.find(
        (solid) => solid.id === surface.backingSolidId
      );
      return backing?.footprint?.holes?.length === 2;
    }),
    allPaintable: spawnPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Paintable) !== 0
    ),
    allSwimmable: spawnPaintSurfaces.every(
      (surface) => (surface.flags & SurfaceFlags.Swimmable) !== 0
    ),
    anyScoreable: spawnPaintSurfaces.some(
      (surface) => (surface.flags & SurfaceFlags.Scoreable) !== 0
    )
  }),
  unresolvedAfterPass: Object.freeze({
    count: PASS5_UNRESOLVED_RUNTIME_SOLID_IDS.length,
    runtimeSolidIds: PASS5_UNRESOLVED_RUNTIME_SOLID_IDS,
    underpass:
      'Resolution Pass 6 confirms a paintable Splat-Zone subregion beneath each glass platform, but the exact current zone boundary is not yet registered to the Temple01 underpass polygons, so whole-floor paint authority remains unresolved.',
    firstDropLanding:
      'Current guides/captures establish traversable/open turf around the drop sequence but do not isolate the exact model-Y=6.0 landing component strongly enough for a face-level paint promotion.',
    rightLowRouteRamp:
      'Current public material confirms that Undertow contains both inkable and uninkable ramps; the exact FloorConcrete03 route ramp still lacks registered paint evidence.'
  }),
  activationBlockerCleared: false,
  turfScoreabilityIntentionallyDeferred: true,
  notes:
    'Resolution Pass 5 promotes only the two exact spawn-center-seeded high-floor components. UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains because six runtime solids are unresolved. Turf Scoreable stays separate even though the current Turf references also discuss point loss from uninked own territory.'
});

export function undertowPaintResolutionPass5AuditErrors(): readonly string[] {
  const audit = UNDERTOW_PAINT_RESOLUTION_PASS5_AUDIT;
  const errors: string[] = [];

  if (
    audit.exactSpawnBinding.componentCount !== 2 ||
    audit.exactSpawnBinding.modelY !== 10.5 ||
    audit.exactSpawnBinding.projectY !== 7.5 ||
    audit.exactSpawnBinding.holeCountPerSide !== 2 ||
    audit.exactSpawnBinding.mirrorXorCells !== 0 ||
    !audit.exactSpawnBinding.seededFromVerifiedSpawnCenter
  ) {
    errors.push('exact spawn-high geometry binding drifted');
  }
  if (
    !audit.authorityPromotion.paintAuthorityResolved ||
    audit.authorityPromotion.authorizedRuntimeSolidIds.length !== 2 ||
    audit.authorityPromotion.scoreableAuthorityPromoted ||
    audit.authorityPromotion.spawnProtectionAuthorityPromoted
  ) {
    errors.push('spawn paint authority promotion scope drifted');
  }
  if (
    audit.runtimeRepresentation.paintSurfaceCount !== 2 ||
    !audit.runtimeRepresentation.usesBackingFootprint ||
    !audit.runtimeRepresentation.preservesTwoHolesPerSide ||
    !audit.runtimeRepresentation.allPaintable ||
    !audit.runtimeRepresentation.allSwimmable ||
    audit.runtimeRepresentation.anyScoreable
  ) {
    errors.push('spawn-high runtime paint representation drifted');
  }
  for (const id of SPAWN_RUNTIME_SOLID_IDS) {
    const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
      (candidate) => candidate.runtimeSolidId === id
    );
    if (
      !record ||
      record.authority !== 'PAINTABLE' ||
      record.evidenceClass !== 'PUBLIC_CURRENT_GAMEPLAY'
    ) {
      errors.push(`${id}: spawn paint authority record drifted`);
    }
  }
  if (audit.unresolvedAfterPass.count !== 6) {
    errors.push('Resolution Pass 5 must leave exactly six unresolved paint solids');
  }
  if (audit.activationBlockerCleared || !audit.turfScoreabilityIntentionallyDeferred) {
    errors.push('paint Pass 5 must preserve activation blocker and defer Turf scoreability');
  }
  return errors;
}
