import RAPIER, { type Collider, type World } from '@dimforge/rapier3d-compat';
import { Quat, Vec3 } from 'playcanvas';
import type { StageDefinition, StageSolidDefinition } from '../stage/StageDefinition';

export async function initializeRapier(): Promise<void> {
  await RAPIER.init();
}

export type StageQueryPurpose = 'projectile' | 'camera';

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
        return purpose === 'projectile' ? solid.projectileBlocker : solid.cameraBlocker;
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

  private buildStaticStage(solids: readonly StageSolidDefinition[]): void {
    for (const solid of solids) {
      const desc = RAPIER.ColliderDesc.cuboid(
        solid.size[0] * 0.5,
        solid.size[1] * 0.5,
        solid.size[2] * 0.5
      ).setTranslation(solid.center[0], solid.center[1], solid.center[2]);

      if (solid.rotationEulerDegrees) {
        const rotation = solid.rotationEulerDegrees;
        const q = new Quat().setFromEulerAngles(rotation[0], rotation[1], rotation[2]);
        desc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      }

      const collider = this.world.createCollider(desc);
      this.solidByColliderHandle.set(collider.handle, solid);
    }
  }
}
