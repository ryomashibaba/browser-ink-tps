import {
  confidenceAllowedForGeometry,
  exactYForGeometry
} from '../measurement/MeasurementGeometryGate';
import type {
  StageMeasurementEntry,
  SurfaceSemantic,
  XzMeasurement
} from '../measurement/StageMeasurementLedger';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER } from './UndertowSpillwayMeasurementLedger';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT,
  type UndertowModelXZGeometryId
} from './UndertowSpillwayModelXZGeometry';

export type UndertowRuntimeSurfaceDisposition =
  | 'FLAT_POLYGON_READY'
  | 'XZ_NOT_AREA'
  | 'Y_UNRESOLVED'
  | 'NOT_A_SURFACE';

export type UndertowPaintAuthority =
  | 'PAINTABLE'
  | 'UNINKABLE'
  | 'UNKNOWN';

export type UndertowRuntimeCollisionMode =
  | 'SOLID_FLOOR'
  | 'GRATE_FILTERED'
  | 'NONE';

export interface UndertowRuntimeSurfacePlanItem {
  id: string;
  disposition: UndertowRuntimeSurfaceDisposition;
  geometryReady: boolean;
  legacySolidCollisionCompatible: boolean;
  collisionMode: UndertowRuntimeCollisionMode;
  paintAuthority: UndertowPaintAuthority;
  yMeters?: number;
  polygonCount: number;
  notes: string;
}

function polygonCount(xz: XzMeasurement): number {
  if (xz.kind === 'POLYGON') return xz.polygonMeters ? 1 : 0;
  if (xz.kind === 'POLYGON_SET') return xz.polygonSetMeters?.length ?? 0;
  return 0;
}

function paintAuthority(
  semantics: readonly SurfaceSemantic[],
  confidence: StageMeasurementEntry['surface']['confidence']
): UndertowPaintAuthority {
  if (!confidenceAllowedForGeometry(confidence, 'BLOCKOUT')) return 'UNKNOWN';
  if (semantics.includes('PAINTABLE')) return 'PAINTABLE';
  if (
    semantics.includes('UNINKABLE') ||
    semantics.includes('GLASS') ||
    semantics.includes('GRATE') ||
    semantics.includes('WATER') ||
    semantics.includes('KILL')
  ) {
    return 'UNINKABLE';
  }
  return 'UNKNOWN';
}

function classify(entry: StageMeasurementEntry): UndertowRuntimeSurfacePlanItem {
  if (entry.featureKind !== 'SURFACE') {
    return {
      id: entry.id,
      disposition: 'NOT_A_SURFACE',
      geometryReady: false,
      legacySolidCollisionCompatible: false,
      collisionMode: 'NONE',
      paintAuthority: 'UNKNOWN',
      polygonCount: 0,
      notes: 'Only SURFACE entries can become flat footprint solids through this adapter.'
    };
  }

  const count = confidenceAllowedForGeometry(entry.xz.confidence, 'BLOCKOUT')
    ? polygonCount(entry.xz)
    : 0;
  if (count === 0) {
    return {
      id: entry.id,
      disposition: 'XZ_NOT_AREA',
      geometryReady: false,
      legacySolidCollisionCompatible: false,
      collisionMode: 'NONE',
      paintAuthority: paintAuthority(
        entry.surface.semantics,
        entry.surface.confidence
      ),
      polygonCount: 0,
      notes:
        'BLOCKOUT-safe polygon XZ is not available. POINT/POLYLINE/UNRESOLVED entries must not be expanded into convenience slabs.'
    };
  }

  const yMeters = exactYForGeometry(entry.y, 'BLOCKOUT');
  if (yMeters === null) {
    return {
      id: entry.id,
      disposition: 'Y_UNRESOLVED',
      geometryReady: false,
      legacySolidCollisionCompatible: false,
      collisionMode: 'NONE',
      paintAuthority: paintAuthority(
        entry.surface.semantics,
        entry.surface.confidence
      ),
      polygonCount: count,
      notes:
        'The XZ area is known but no single BLOCKOUT-safe absolute Y exists. Multi-elevation envelopes must not be flattened.'
    };
  }

  const grate = entry.surface.semantics.includes('GRATE');
  return {
    id: entry.id,
    disposition: 'FLAT_POLYGON_READY',
    geometryReady: true,
    legacySolidCollisionCompatible: !grate,
    collisionMode: grate ? 'GRATE_FILTERED' : 'SOLID_FLOOR',
    paintAuthority: paintAuthority(
      entry.surface.semantics,
      entry.surface.confidence
    ),
    yMeters,
    polygonCount: count,
    notes: grate
      ? 'The flat XZ/Y geometry is ready. Runtime support must use StageSolid collisionBehavior=GRATE so Human form and thrown subs collide while Squid form and ordinary ink projectiles pass through. It remains intentionally non-compatible with the legacy default SOLID behavior.'
      : 'Exact/HIGH-or-stronger polygon XZ and absolute Y are available for a flat BLOCKOUT solid floor. Paint authority remains independent.'
  };
}

export const UNDERTOW_RUNTIME_SURFACE_PLAN:
  readonly UndertowRuntimeSurfacePlanItem[] =
  UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.map(classify);

export function undertowRuntimeSurfacePlanItem(
  id: string
): UndertowRuntimeSurfacePlanItem {
  const item = UNDERTOW_RUNTIME_SURFACE_PLAN.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown Undertow runtime surface plan id '${id}'.`);
  return item;
}

export function undertowRuntimeSurfacePlanErrors(): readonly string[] {
  const errors: string[] = [];
  for (const item of UNDERTOW_RUNTIME_SURFACE_PLAN) {
    if (item.geometryReady !== (item.disposition === 'FLAT_POLYGON_READY')) {
      errors.push(`${item.id}: geometryReady/disposition mismatch`);
    }
    if (item.disposition === 'FLAT_POLYGON_READY') {
      if (!Number.isFinite(item.yMeters) || item.polygonCount < 1) {
        errors.push(`${item.id}: ready flat surface lacks exact Y or polygon area`);
      }
      if (
        item.collisionMode === 'GRATE_FILTERED' &&
        item.legacySolidCollisionCompatible
      ) {
        errors.push(`${item.id}: grate must never be declared legacy-solid compatible`);
      }
    }
  }

  for (const id of ['team-a-spawn-terrain-region', 'team-b-spawn-terrain-region']) {
    const item = undertowRuntimeSurfacePlanItem(id);
    if (item.disposition !== 'Y_UNRESOLVED') {
      errors.push(`${id}: multi-elevation spawn terrain must never be flattened`);
    }
  }

  if (UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN.length !== 4) {
    errors.push('spawn-side derived runtime plan must contain exactly four locally anchored flat components');
  }
  for (const item of UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN) {
    if (
      !Number.isFinite(item.yMeters) ||
      item.paintAuthority !== 'UNKNOWN' ||
      item.polygonCount !== 1
    ) {
      errors.push(`${item.id}: invalid locally derived runtime surface contract`);
    }
  }
  if (
    UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.spawnHighMirrorXorCells !== 0 ||
    UNDERTOW_SPAWN_FLAT_COMPONENT_AUDIT.firstDropLandingMirrorXorCells !== 0
  ) {
    errors.push('spawn-side locally derived runtime geometry lost exact raw-mask symmetry');
  }

  return errors;
}


export interface UndertowDerivedRuntimeSurfacePlanItem {
  id: UndertowModelXZGeometryId;
  source: 'TEMPLE01_LOCAL_COMPONENT';
  geometryReady: true;
  legacySolidCollisionCompatible: true;
  collisionMode: 'SOLID_FLOOR';
  paintAuthority: 'UNKNOWN';
  yMeters: number;
  polygonCount: 1;
  holeCount: number;
  notes: string;
}

const DERIVED_RUNTIME_GEOMETRY_IDS = new Set<UndertowModelXZGeometryId>([
  'spawn-high-positive-z',
  'spawn-high-negative-z',
  'first-drop-landing-positive-z',
  'first-drop-landing-negative-z'
]);

export const UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN:
  readonly UndertowDerivedRuntimeSurfacePlanItem[] =
  UNDERTOW_MODEL_XZ_GEOMETRY
    .filter((item) => DERIVED_RUNTIME_GEOMETRY_IDS.has(item.id))
    .map((item) => ({
      id: item.id,
      source: 'TEMPLE01_LOCAL_COMPONENT' as const,
      geometryReady: true as const,
      legacySolidCollisionCompatible: true as const,
      collisionMode: 'SOLID_FLOOR' as const,
      paintAuthority: 'UNKNOWN' as const,
      yMeters: item.sourceYProjectMeters,
      polygonCount: 1 as const,
      holeCount: item.projectHoles.length,
      notes:
        'Derived from a locally anchored Temple01 flat component. It may become collision/render geometry at BLOCKOUT confidence, but no paint authority is inferred from geometry alone.'
    }));

export function undertowDerivedRuntimeSurfacePlanItem(
  id: UndertowModelXZGeometryId
): UndertowDerivedRuntimeSurfacePlanItem {
  const item = UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN.find(
    (candidate) => candidate.id === id
  );
  if (!item) throw new Error(`Unknown derived Undertow runtime surface plan id '${id}'.`);
  return item;
}
