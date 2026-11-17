/**
 * T21 V28 / STAGE / Issue #13 — registered SOURCE floor-boundary witness.
 *
 * The original 0.125 m source footprint is rasterized to box colliders by
 * RapierStagePhysics. A raster CELL-CENTER is inside the polygon while some
 * of its area may be outside the simplified contour. This read-only audit
 * compares the simplified source polygon and the actual collision raster.
 *
 * A historical "support lost" pair is not a missing-floor certificate.
 * A static ray and a Recast projection are not a moving-player KCC proof.
 * This module does not authorize any new floor, NavLink, paint or scoring.
 */
import { Vec3 } from 'playcanvas';
import type { RapierStagePhysics } from '../../physics/RapierStagePhysics';
import type { RecastStageNavigation } from '../../navigation/RecastStageNavigation';
import { stageSolidCollisionEnabled, type StageDefinition, type StageVector3 } from '../StageDefinition';
import { pointInStageFootprint, rasterizeStageFootprint } from '../StageFootprint';

export const ISSUE13_HISTORICAL_FLOOR_EDGE = Object.freeze({
  source: 'B490 owner Windows ordinary walking; positions rounded to 0.001 m',
  y: 3,
  yMeaning: 'registered first-drop-landing TOP; NOT measured human foot Y',
  from: [-0.910, 3, 46.989] as StageVector3,
  to: [-0.675, 3, 46.629] as StageVector3,
  fromTick: 1355,
  toTick: 1356,
  historicalFirstSupportReported: true,
  historicalSecondSupportReported: false,
  playerCollisionAuthorityCertified: false
});

export interface RegisteredFootprintWitness {
  readonly solidId: string;
  readonly topY: number;
  readonly render: boolean;
  readonly staticCollisionEnabled: boolean;
  readonly navigationEnabled: boolean;
  readonly insideSimplifiedPolygon: boolean;
  readonly insideActualCollisionRaster: boolean;
  readonly rasterCellIndex: readonly [number, number] | null;
}

export interface StageFloorWitness {
  readonly foot: StageVector3;
  readonly registeredAtThisY: readonly RegisteredFootprintWitness[];
  /** Static scene ray, not a player capsule or gameplay floor snap. */
  readonly staticRapierSolidId: string | null;
  readonly staticRapierHitY: number | null;
  /** Native nearest point is not verified connected navigation. */
  readonly recastNearestPoint: StageVector3 | null;
  readonly recastSnapDistanceMeters: number | null;
  readonly originalSourceCollisionSemanticsCertified: false;
}

export interface UndertowRegisteredFloorEdgeResult {
  readonly from: StageFloorWitness;
  readonly to: StageFloorWitness;
  readonly planarStepMeters: number;
  readonly sourceEdgeClassification:
    | 'REGISTERED_RASTER_COVERAGE_ENDS'
    | 'REGISTERED_RASTER_COVERAGE_CONTINUES'
    | 'NO_REGISTERED_START_COVERAGE';
  readonly newFloorAuthorized: false;
  readonly newNavLinkAuthorized: false;
  readonly sourceRouteCertified: false;
  readonly originalPlayerCollisionAuthorityCertified: false;
}

/**
 * EXACT same center-in-polygon raster as the source's Rapier box colliders.
 * Only unrotated registered footprint solids at the requested source top Y
 * participate. Triangle meshes or other levels are never interpreted as
 * automatically supporting the foot.
 */
export function registeredSourceFootprintWitnesses(
  stage: StageDefinition, foot: StageVector3, yToleranceMeters = 0.05
): readonly RegisteredFootprintWitness[] {
  if (!foot.every(Number.isFinite) ||
      !Number.isFinite(yToleranceMeters) || yToleranceMeters < 0) {
    throw new Error('ISSUE13_NONFINITE_SOURCE_SAMPLE');
  }
  const [x, y, z] = foot;
  const records: RegisteredFootprintWitness[] = [];
  for (const solid of stage.solids) {
    const footprint = solid.footprint;
    if (!footprint || solid.triangleMesh ||
        solid.rotationEulerDegrees?.some(angle => angle !== 0)) continue;
    const topY = solid.center[1] + solid.size[1] / 2;
    if (Math.abs(topY - y) > yToleranceMeters) continue;
    const localX = x - (solid.center[0] - solid.size[0] / 2);
    const localZ = z - (solid.center[2] - solid.size[2] / 2);
    const raster = rasterizeStageFootprint(
      solid.size[0], solid.size[2], footprint
    );
    const ix = Math.floor(localX / footprint.cellSizeMeters);
    const iz = Math.floor(localZ / footprint.cellSizeMeters);
    const inCellBounds = ix >= 0 && iz >= 0 &&
      ix < raster.widthCells && iz < raster.depthCells;
    const insideActualCollisionRaster = inCellBounds &&
      raster.active[iz * raster.widthCells + ix] === 1 &&
      stageSolidCollisionEnabled(solid);
    // A simplified polygon can differ slightly from the source/raw mask.
    // Report both values without claiming its outline is exact Phive.
    const insideSimplifiedPolygon = pointInStageFootprint(
      localX, localZ, footprint
    );
    if (!insideActualCollisionRaster && !insideSimplifiedPolygon) continue;
    records.push({
      solidId: solid.id, topY, render: solid.render,
      staticCollisionEnabled: stageSolidCollisionEnabled(solid),
      navigationEnabled: solid.navigationEnabled ??
        stageSolidCollisionEnabled(solid),
      insideSimplifiedPolygon, insideActualCollisionRaster,
      rasterCellIndex: inCellBounds ? [ix, iz] : null
    });
  }
  return records;
}

/**
 * Use the same original Rapier stage and Recast objects as the actual
 * preview world. A narrow vertical ray is observation-only; it cannot infer
 * the original Player/Phive material collision flags.
 */
export function auditUndertowOriginalFloorEdge(
  stage: StageDefinition,
  physics: RapierStagePhysics,
  nav: RecastStageNavigation,
  from: StageVector3,
  to: StageVector3
): UndertowRegisteredFloorEdgeResult {
  const observe = (point: StageVector3): StageFloorWitness => {
    const [x,y,z] = point;
    // Narrow band around the known Y = 3 source top. Does not bridge lower
    // levels and does not substitute a ray for continuous HUMAN KCC motion.
    const hit = physics.castStageSegment(
      new Vec3(x, y + .12, z), new Vec3(x, y - .12, z),
      'ink-projectile'
    );
    const projection = nav.auditNavMeshProjection(new Vec3(x,y,z));
    return {
      foot: point,
      registeredAtThisY: registeredSourceFootprintWitnesses(stage,point),
      staticRapierSolidId: hit?.solidId ?? null,
      staticRapierHitY: hit?.point.y ?? null,
      recastNearestPoint: projection.nearestPoint
        ? [projection.nearestPoint.x,projection.nearestPoint.y,
           projection.nearestPoint.z] : null,
      recastSnapDistanceMeters: projection.distanceMeters,
      originalSourceCollisionSemanticsCertified: false
    };
  };
  const start = observe(from);
  const end = observe(to);
  const hasRaster = (sample: StageFloorWitness) =>
    sample.registeredAtThisY.some(w => w.insideActualCollisionRaster);
  const status = !hasRaster(start) ? 'NO_REGISTERED_START_COVERAGE' :
    hasRaster(end) ? 'REGISTERED_RASTER_COVERAGE_CONTINUES' :
    'REGISTERED_RASTER_COVERAGE_ENDS';
  return {
    from:start,to:end,
    planarStepMeters: Math.hypot(to[0]-from[0],to[2]-from[2]),
    sourceEdgeClassification:status,
    newFloorAuthorized:false,newNavLinkAuthorized:false,
    sourceRouteCertified:false,
    originalPlayerCollisionAuthorityCertified:false
  };
}
