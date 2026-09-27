import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_PAINT_AUTHORITY_AUDIT,
  UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS
} from './UndertowSpillwayPaintAuthorityAudit';
import {
  UNDERTOW_CENTER_SLOPE_SOURCE_MESHES,
  UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT
} from './UndertowSpillwaySlopeMeshGeometry';
import { UNDERTOW_CENTRAL_SLOPE_MARKERS } from './UndertowSpillwaySlopeMarkers';
import { UNDERTOW_VECTOR_BLUEPRINT_SOURCE } from './UndertowSpillwayVectorBlueprint';

const RESOLVED_SLOPE_IDS = UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map(
  (record) => `UndertowT21D:${record.id}`
);

export const UNDERTOW_PAINT_RESOLUTION_AUDIT = Object.freeze({
  round: 4,
  scope: 'AUTHOR_BLUEPRINT_PAINT_AUTHORITY' as const,
  source: Object.freeze({
    label: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.label,
    updated: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.sourceUpdated,
    legendGrayMeansUninkable: true,
    legendDashMeansSlopeOrRamp: true,
    legendWhiteMeansUnconditionallyPaintable: false,
    notes:
      'The author legend explicitly encodes gray as uninkable and dashed fields as slopes/ramps. Resolution is limited to exact geometry fully bound to a white dashed slope field; ordinary white regions are not blanket-promoted.'
  }),
  centralSlopeBinding: Object.freeze({
    leftMarkerRole: UNDERTOW_CENTRAL_SLOPE_MARKERS.left.role,
    rightMarkerRole: UNDERTOW_CENTRAL_SLOPE_MARKERS.right.role,
    exactSourceObject: UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT.sourceObject,
    exactQuadCount: UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.length,
    fullyContainedQuadCount:
      UNDERTOW_CENTER_SLOPE_SOURCE_MESH_AUDIT.selectedFullyContainedComponentCount,
    markerBackgroundClass: 'WHITE_NON_GRAY' as const,
    paintAuthorityResolved: true,
    authorizedRuntimeSolidIds: RESOLVED_SLOPE_IDS,
    notes:
      'All four selected FloorSlope00 quads are fully contained by the central white dashed slope-marker fields. Because the same author source explicitly marks uninkable floor gray, these bound slope quads are promoted to PAINTABLE.'
  }),
  runtime: Object.freeze({
    slopePaintSurfaceCount:
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.filter(
        (surface) => surface.id.includes('center-slope-')
      ).length,
    slopePaintSurfacesUseRampFlag:
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces
        .filter((surface) => surface.id.includes('center-slope-'))
        .every((surface) => (surface.flags & SurfaceFlags.Ramp) !== 0),
    slopePaintSurfacesUseScoreableFlag:
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces
        .filter((surface) => surface.id.includes('center-slope-'))
        .some((surface) => (surface.flags & SurfaceFlags.Scoreable) !== 0),
    notes:
      'The existing arbitrary-plane PaintSurface basis supports these exact rectangular quads, so authority and runtime representation can be promoted together without flattening the slope.'
  }),
  unresolvedAfterPass: Object.freeze({
    count: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
    runtimeSolidIds: UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedRuntimeSurfaceIds,
    underpassReason:
      'The lower underpass is hidden by the upper projection in the author plan; no face-specific paint class is encoded there.',
    spawnReason:
      'The spawn-side white envelope spans multiple elevations and spawn/protection behavior; white is not blanket paint authority.',
    firstDropLandingReason:
      'The derived Temple01 landing component has no independently bound author paint class.',
    rightLowRampReason:
      'The exact FloorConcrete03 route ramp is geometry-authoritative, but this pass does not promote material names or an unextracted visual dash field into paint authority.'
  }),
  turfScoreabilityResolved: false,
  activationBlockerCleared: false,
  notes:
    'Resolution Pass 4 reduces UNKNOWN runtime paint authority from 12 solids to 8 by promoting only the four exact central slope quads. UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING remains because eight solids are still unresolved; TURF_SCOREABLE_MASK_PENDING remains separate.'
});

export function undertowPaintResolutionAuditErrors(): readonly string[] {
  const audit = UNDERTOW_PAINT_RESOLUTION_AUDIT;
  const errors: string[] = [];

  if (
    !audit.source.legendGrayMeansUninkable ||
    !audit.source.legendDashMeansSlopeOrRamp ||
    audit.source.legendWhiteMeansUnconditionallyPaintable
  ) {
    errors.push('author blueprint paint semantics scope drifted');
  }
  if (
    audit.centralSlopeBinding.exactQuadCount !== 4 ||
    audit.centralSlopeBinding.fullyContainedQuadCount !== 4 ||
    audit.centralSlopeBinding.markerBackgroundClass !== 'WHITE_NON_GRAY' ||
    !audit.centralSlopeBinding.paintAuthorityResolved
  ) {
    errors.push('central slope author/source paint binding drifted');
  }
  if (
    audit.runtime.slopePaintSurfaceCount !== 4 ||
    !audit.runtime.slopePaintSurfacesUseRampFlag ||
    audit.runtime.slopePaintSurfacesUseScoreableFlag
  ) {
    errors.push('central slope runtime paint representation drifted');
  }
  if (audit.unresolvedAfterPass.count !== 8) {
    errors.push('Resolution Pass 4 must leave exactly eight unresolved runtime paint solids');
  }
  for (const id of RESOLVED_SLOPE_IDS) {
    const record = UNDERTOW_RUNTIME_PAINT_AUTHORITY_RECORDS.find(
      (candidate) => candidate.runtimeSolidId === id
    );
    if (
      !record ||
      record.authority !== 'PAINTABLE' ||
      record.evidenceClass !== 'AUTHOR_VECTOR_SEMANTIC'
    ) {
      errors.push(`${id}: resolved central slope paint record drifted`);
    }
  }
  if (audit.turfScoreabilityResolved || audit.activationBlockerCleared) {
    errors.push('paint resolution must not clear Turf scoreability or the remaining paint blocker');
  }
  return errors;
}
