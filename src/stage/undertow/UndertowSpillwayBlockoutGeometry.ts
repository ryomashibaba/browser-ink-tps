import { SurfaceFlags } from '../../ink/types';
import type {
  StagePaintSurfaceDefinition,
  StageSolidDefinition,
  StageWorldBounds
} from '../StageDefinition';
import type { StageFootprint, StageFootprintPoint } from '../StageFootprint';
import { exactYForGeometry } from '../measurement/MeasurementGeometryGate';
import type {
  StageMeasurementEntry,
  XzMeasurement
} from '../measurement/StageMeasurementLedger';
import type { MetricXZ } from '../measurement/StageMapCalibration';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER } from './UndertowSpillwayMeasurementLedger';
import {
  UNDERTOW_MODEL_XZ_GEOMETRY,
  type UndertowModelXZPolygon
} from './UndertowSpillwayModelXZGeometry';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export const UNDERTOW_BLOCKOUT_TECHNICAL_SLAB_THICKNESS_METERS = 0.125;
export const UNDERTOW_BLOCKOUT_FOOTPRINT_CELL_METERS = 0.125;

const paintableFloor =
  SurfaceFlags.Paintable |
  SurfaceFlags.Swimmable |
  SurfaceFlags.Floor;

export interface UndertowBlockoutGeometryPackage {
  activationReady: false;
  solids: readonly StageSolidDefinition[];
  paintSurfaces: readonly StagePaintSurfaceDefinition[];
  worldBounds: StageWorldBounds;
  teamASpawnFloorPoint: readonly [number, number, number];
  teamBSpawnFloorPoint: readonly [number, number, number];
  deferredFeatureIds: readonly string[];
  activationBlockers: readonly string[];
  notes: string;
}

interface PolygonSetComponent {
  outerMeters: readonly MetricXZ[];
  holesMeters?: readonly (readonly MetricXZ[])[];
}

interface PolygonComponent {
  id: string;
  outer: readonly MetricXZ[];
  holes: readonly (readonly MetricXZ[])[];
  yMeters: number;
  material: StageSolidDefinition['material'];
  paintable: boolean;
}

function ledgerEntry(id: string): StageMeasurementEntry {
  const entry = UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.find(
    (candidate) => candidate.id === id
  );
  if (!entry) throw new Error(`Missing Undertow ledger entry '${id}'.`);
  return entry;
}

function ledgerPolygonComponents(
  id: string,
  material: StageSolidDefinition['material'],
  paintable: boolean
): readonly PolygonComponent[] {
  const entry = ledgerEntry(id);
  const yMeters = exactYForGeometry(entry.y, 'BLOCKOUT');
  if (yMeters === null) {
    throw new Error(`${id}: BLOCKOUT geometry package requires one absolute Y.`);
  }

  const components = xzPolygonComponents(entry.xz);
  if (components.length === 0) {
    throw new Error(`${id}: BLOCKOUT geometry package requires polygon XZ.`);
  }
  return components.map((component, index) => ({
    id: `${id}:${index}`,
    outer: component.outerMeters,
    holes: component.holesMeters ?? [],
    yMeters,
    material,
    paintable
  }));
}

function xzPolygonComponents(
  xz: XzMeasurement
): readonly PolygonSetComponent[] {
  if (xz.kind === 'POLYGON' && xz.polygonMeters) {
    return [{ outerMeters: xz.polygonMeters, holesMeters: [] }];
  }
  if (xz.kind === 'POLYGON_SET' && xz.polygonSetMeters) {
    return xz.polygonSetMeters;
  }
  return [];
}

function modelComponent(
  item: UndertowModelXZPolygon,
  material: StageSolidDefinition['material'],
  paintable: boolean
): PolygonComponent {
  return {
    id: item.id,
    outer: item.projectOuter,
    holes: item.projectHoles,
    yMeters: item.sourceYProjectMeters,
    material,
    paintable
  };
}

const modelComponents: PolygonComponent[] = [];
for (const item of UNDERTOW_MODEL_XZ_GEOMETRY) {
  if (item.id.startsWith('center-low-')) {
    modelComponents.push(modelComponent(item, 'medium', true));
  } else if (item.id.startsWith('right-low-')) {
    modelComponents.push(modelComponent(item, 'medium', true));
  } else if (item.id.startsWith('glass-underpass-')) {
    modelComponents.push(modelComponent(item, 'dark', false));
  } else if (item.id.startsWith('spawn-high-')) {
    modelComponents.push(modelComponent(item, 'light', false));
  } else if (item.id.startsWith('first-drop-landing-')) {
    modelComponents.push(modelComponent(item, 'light', false));
  }
}

const components: readonly PolygonComponent[] = [
  ...modelComponents,
  ...ledgerPolygonComponents(
    'center-origin-step-top-face',
    'medium',
    true
  )
];

const built = components.map(buildFlatComponent);
const solids = built.map((item) => item.solid);
const paintSurfaces = built.flatMap((item) =>
  item.paintSurface ? [item.paintSurface] : []
);

const outer = UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.metricPoints;
const xs = outer.map((point) => point[0]);
const zs = outer.map((point) => point[1]);
const worldBounds: StageWorldBounds = {
  minX: Math.min(...xs),
  maxX: Math.max(...xs),
  minZ: Math.min(...zs),
  maxZ: Math.max(...zs)
};

const spawnA = UNDERTOW_VECTOR_TRACES.positiveZSpawnCenter.metricPoints[0]!;
const spawnB = UNDERTOW_VECTOR_TRACES.negativeZSpawnCenter.metricPoints[0]!;

export const UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY:
  UndertowBlockoutGeometryPackage = Object.freeze({
    activationReady: false as const,
    solids,
    paintSurfaces,
    worldBounds,
    teamASpawnFloorPoint: [spawnA[0], 7.5, spawnA[1]] as const,
    teamBSpawnFloorPoint: [spawnB[0], 7.5, spawnB[1]] as const,
    deferredFeatureIds: [
      'negative-z-grate-mesh',
      'positive-z-grate-mesh',
      'center-slope',
      'upper-glass-platform',
      'team-a-upper-glass-overhang',
      'team-b-upper-glass-overhang',
      'team-a-water-region',
      'team-b-water-region'
    ],
    activationBlockers: [
      'SLOPE_RUNTIME_GEOMETRY_PENDING',
      'UPPER_GLASS_SLOPE_RUNTIME_PENDING',
      'WATER_KILL_RUNTIME_PENDING',
      'GRATE_STAGE_SOLID_BINDING_PENDING',
      'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING',
      'TURF_SCOREABLE_MASK_PENDING',
      'FULL_STAGE_CONNECTIVITY_QA_PENDING'
    ],
    notes:
      'Inert T21-D construction package only. It contains BLOCKOUT-safe flat XZ/Y components and does not replace PRODUCTION_STAGE_DEFINITION. Technical slab thickness is an implementation extrusion below the canonical top Y, not a claimed source measurement.'
  });

function buildFlatComponent(component: PolygonComponent): {
  solid: StageSolidDefinition;
  paintSurface: StagePaintSurfaceDefinition | null;
} {
  const bounds = polygonBounds(component.outer);
  const footprint = localFootprint(
    component.outer,
    component.holes,
    bounds.minX,
    bounds.minZ
  );
  const solidId = `UndertowT21D:${component.id}`;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const centerX = (bounds.minX + bounds.maxX) * 0.5;
  const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
  const thickness = UNDERTOW_BLOCKOUT_TECHNICAL_SLAB_THICKNESS_METERS;

  const solid: StageSolidDefinition = {
    id: solidId,
    center: [centerX, component.yMeters - thickness * 0.5, centerZ],
    size: [width, thickness, depth],
    material: component.material,
    render: true,
    projectileBlocker: true,
    cameraBlocker: true,
    footprint
  };

  if (!component.paintable) {
    return { solid, paintSurface: null };
  }

  const paintSurface: StagePaintSurfaceDefinition = {
    id: `${solidId}:paint`,
    backingSolidId: solidId,
    center: [centerX, component.yMeters + 0.002, centerZ],
    uAxis: [1, 0, 0],
    vAxis: [0, 0, 1],
    widthMeters: width,
    heightMeters: depth,
    flags: paintableFloor
  };

  return { solid, paintSurface };
}

function localFootprint(
  outer: readonly MetricXZ[],
  holes: readonly (readonly MetricXZ[])[],
  minX: number,
  minZ: number
): StageFootprint {
  const toLocal = ([x, z]: MetricXZ): StageFootprintPoint =>
    [x - minX, z - minZ];
  return {
    outer: outer.map(toLocal),
    holes: holes.map((hole) => hole.map(toLocal)),
    cellSizeMeters: UNDERTOW_BLOCKOUT_FOOTPRINT_CELL_METERS
  };
}

function polygonBounds(points: readonly MetricXZ[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  return {
    minX: Math.min(...points.map((point) => point[0])),
    maxX: Math.max(...points.map((point) => point[0])),
    minZ: Math.min(...points.map((point) => point[1])),
    maxZ: Math.max(...points.map((point) => point[1]))
  };
}

export function undertowPartialBlockoutGeometryErrors(): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const solid of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids) {
    if (ids.has(solid.id)) errors.push(`duplicate solid id: ${solid.id}`);
    ids.add(solid.id);
    if (!solid.footprint) errors.push(`${solid.id}: polygon footprint missing`);
    const topY = solid.center[1] + solid.size[1] * 0.5;
    if (!Number.isFinite(topY)) errors.push(`${solid.id}: non-finite top Y`);
  }

  for (const surface of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces) {
    if (!ids.has(surface.backingSolidId)) {
      errors.push(`${surface.id}: backing solid missing`);
    }
    if ((surface.flags & SurfaceFlags.Scoreable) !== 0) {
      errors.push(`${surface.id}: T21-D partial paint must not invent Turf scoreability`);
    }
  }

  if (UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady) {
    errors.push('partial blockout package must remain activation-ineligible');
  }
  return errors;
}
