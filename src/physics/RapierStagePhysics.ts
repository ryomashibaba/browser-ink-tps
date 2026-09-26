import RAPIER, { type Collider, type World } from '@dimforge/rapier3d-compat';
import { Quat, Vec3 } from 'playcanvas';
import type { StageDefinition, StageSolidDefinition } from '../stage/StageDefinition';
import { rasterizeStageFootprint } from '../stage/StageFootprint';

export async function initializeRapier(): Promise<void> {
  await RAPIER.init();
}

export type StageQueryPurpose = 'ink-projectile' | 'thrown-sub' | 'camera';
export type StageCharacterMode = 'HUMAN' | 'SQUID';

export interface StageRayHit {
  distance: number;
  point: Vec3;
  collider: Collider;
  solidId: string;
}

export class RapierStagePhysics {
  public readonly world: World;
  private readonly solidByColliderHandle = new Map<number, StageSolidDefinition>();
  private readonly rayDirection = new Vec3();

  public constructor(stepSeconds: number, stage: StageDefinition) {
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
    this.world.timestep = stepSeconds;
    this.buildStaticStage(stage.solids);
  }

  public step(): void {
    this.world.step();
  }

  public castStageSegment(
    from: Vec3,
    to: Vec3,
    purpose: StageQueryPurpose
  ): StageRayHit | null {
    this.rayDirection.copy(to).sub(from);
    const length = this.rayDirection.length();
    if (length <= 1e-8) return null;
    this.rayDirection.mulScalar(1 / length);

    const ray = new RAPIER.Ray(
      { x: from.x, y: from.y, z: from.z },
      { x: this.rayDirection.x, y: this.rayDirection.y, z: this.rayDirection.z }
    );
    const hit = this.world.castRay(
      ray,
      length,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      (collider: Collider) => {
        const solid = this.solidByColliderHandle.get(collider.handle);
        if (!solid) return false;
        return stageSolidBlocksQuery(solid, purpose);
      }
    );
    if (!hit) return null;

    const solid = this.solidByColliderHandle.get(hit.collider.handle);
    if (!solid) return null;

    return {
      distance: hit.timeOfImpact,
      point: new Vec3(
        from.x + this.rayDirection.x * hit.timeOfImpact,
        from.y + this.rayDirection.y * hit.timeOfImpact,
        from.z + this.rayDirection.z * hit.timeOfImpact
      ),
      collider: hit.collider,
      solidId: solid.id
    };
  }

  public shouldCharacterCollide(
    collider: Collider,
    mode: StageCharacterMode
  ): boolean {
    const solid = this.solidByColliderHandle.get(collider.handle);
    if (!solid) return true;
    return stageSolidAllowsCharacterMode(solid, mode);
  }

  private buildStaticStage(solids: readonly StageSolidDefinition[]): void {
    for (const solid of solids) {
      if (!solid.footprint) {
        this.createBoxCollider(solid, solid.size[0], solid.size[2], 0, 0);
        continue;
      }

      const raster = rasterizeStageFootprint(
        solid.size[0],
        solid.size[2],
        solid.footprint
      );
      for (const rect of raster.rectangles) {
        this.createBoxCollider(
          solid,
          rect.widthMeters,
          rect.depthMeters,
          rect.centerU - solid.size[0] * 0.5,
          rect.centerV - solid.size[2] * 0.5
        );
      }
    }
  }

  private createBoxCollider(
    solid: StageSolidDefinition,
    widthMeters: number,
    depthMeters: number,
    localOffsetX: number,
    localOffsetZ: number
  ): void {
    const rotation = solid.rotationEulerDegrees ?? [0, 0, 0];
    const q = new Quat().setFromEulerAngles(rotation[0], rotation[1], rotation[2]);
    const offset = rotateVector(
      new Vec3(localOffsetX, 0, localOffsetZ),
      q
    );
    const desc = RAPIER.ColliderDesc.cuboid(
      widthMeters * 0.5,
      solid.size[1] * 0.5,
      depthMeters * 0.5
    )
      .setTranslation(
        solid.center[0] + offset.x,
        solid.center[1] + offset.y,
        solid.center[2] + offset.z
      )
      .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });

    const collider = this.world.createCollider(desc);
    this.solidByColliderHandle.set(collider.handle, solid);
  }
}


function rotateVector(v: Vec3, q: Quat): Vec3 {
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


export function stageSolidBlocksQuery(
  solid: StageSolidDefinition,
  purpose: StageQueryPurpose
): boolean {
  if (purpose === 'camera') return solid.cameraBlocker;
  if (solid.collisionBehavior === 'GRATE') {
    return purpose === 'thrown-sub';
  }
  return solid.projectileBlocker;
}

export function stageSolidAllowsCharacterMode(
  solid: StageSolidDefinition,
  mode: StageCharacterMode
): boolean {
  if (solid.collisionBehavior !== 'GRATE') return true;
  return mode === 'HUMAN';
}
