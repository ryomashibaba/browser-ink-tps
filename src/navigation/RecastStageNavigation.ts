import { Crowd, NavMeshQuery, init as initRecast, type CrowdAgent } from 'recast-navigation';
import { generateSoloNavMesh } from 'recast-navigation/generators';
import { Quat, Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { StageDefinition, StageSolidDefinition } from '../stage/StageDefinition';

export async function initializeRecastNavigation(): Promise<void> {
  await initRecast();
}

export class RecastStageNavigation {
  public readonly crowd: Crowd;
  private readonly query: NavMeshQuery;

  public constructor(
    definition: StageDefinition,
    stats: PerformanceStats
  ) {
    const started = performance.now();
    const { positions, indices } = buildStageTriangleSoup(definition);
    const generated = generateSoloNavMesh(positions, indices, {
      cs: GAME_CONFIG.cpu.navigationCellSizeMeters,
      ch: GAME_CONFIG.cpu.navigationCellHeightMeters,
      walkableSlopeAngle: GAME_CONFIG.cpu.navigationMaxSlopeDegrees,
      walkableHeight: GAME_CONFIG.cpu.navigationWalkableHeightVoxels,
      walkableClimb: GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
      walkableRadius: GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
      maxEdgeLen: 24,
      maxSimplificationError: 1.1,
      minRegionArea: 3,
      mergeRegionArea: 8,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1
    });

    if (!generated.success) {
      stats.cpuNavigationStatus = `FAILED: ${generated.error}`;
      throw new Error(`Recast navmesh generation failed: ${generated.error}`);
    }

    this.query = new NavMeshQuery(generated.navMesh);
    this.crowd = new Crowd(generated.navMesh, {
      maxAgents: GAME_CONFIG.cpu.totalParticipants,
      maxAgentRadius: GAME_CONFIG.cpu.agentRadiusMeters
    });

    stats.cpuNavigationBuildMs = performance.now() - started;
    stats.cpuNavigationStatus = 'READY';
  }

  public addAgent(position: Vec3): CrowdAgent {
    const start = this.closestPoint(position);
    return this.crowd.addAgent(start, {
      radius: GAME_CONFIG.cpu.agentRadiusMeters,
      height: GAME_CONFIG.cpu.agentHeightMeters,
      maxAcceleration: GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2,
      maxSpeed: GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
      collisionQueryRange: GAME_CONFIG.cpu.collisionQueryRangeMeters,
      pathOptimizationRange: GAME_CONFIG.cpu.pathOptimizationRangeMeters,
      separationWeight: GAME_CONFIG.cpu.separationWeight
    });
  }

  public removeAgent(agent: CrowdAgent): void {
    this.crowd.removeAgent(agent);
  }

  public closestPoint(position: Vec3): { x: number; y: number; z: number } {
    const result = this.query.findClosestPoint({
      x: position.x,
      y: position.y,
      z: position.z
    });
    return result.success
      ? result.point
      : { x: position.x, y: position.y, z: position.z };
  }

  public fixedUpdate(dt: number): void {
    this.crowd.update(dt);
  }
}

function buildStageTriangleSoup(
  definition: StageDefinition
): { positions: number[]; indices: number[] } {
  const positions: number[] = [];
  const indices: number[] = [];

  for (const solid of definition.solids) {
    appendBoxSolid(solid, positions, indices);
  }

  return { positions, indices };
}

function appendBoxSolid(
  solid: StageSolidDefinition,
  positions: number[],
  indices: number[]
): void {
  const hx = solid.size[0] * 0.5;
  const hy = solid.size[1] * 0.5;
  const hz = solid.size[2] * 0.5;
  const local = [
    new Vec3(-hx, -hy, -hz),
    new Vec3( hx, -hy, -hz),
    new Vec3( hx, -hy,  hz),
    new Vec3(-hx, -hy,  hz),
    new Vec3(-hx,  hy, -hz),
    new Vec3( hx,  hy, -hz),
    new Vec3( hx,  hy,  hz),
    new Vec3(-hx,  hy,  hz)
  ];
  const euler = solid.rotationEulerDegrees ?? [0, 0, 0];
  const rotation = new Quat().setFromEulerAngles(euler[0], euler[1], euler[2]);
  const center = new Vec3(solid.center[0], solid.center[1], solid.center[2]);
  const base = positions.length / 3;

  for (const point of local) {
    const world = rotate(point, rotation).add(center);
    positions.push(world.x, world.y, world.z);
  }

  const faces = [
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    3, 2, 6, 3, 6, 7,
    0, 5, 1, 0, 4, 5,
    1, 5, 6, 1, 6, 2,
    0, 3, 7, 0, 7, 4
  ];
  for (const index of faces) indices.push(base + index);
}

function rotate(v: Vec3, q: Quat): Vec3 {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return new Vec3(
    ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
  );
}
