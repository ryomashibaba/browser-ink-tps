import RAPIER from '@dimforge/rapier3d-compat';

export async function initializeRapier(): Promise<void> {
  await RAPIER.init();
}

export class RapierStagePhysics {
  public readonly world: RAPIER.World;

  public constructor(stepSeconds: number) {
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
    this.world.timestep = stepSeconds;
    this.buildStaticStage();
  }

  public step(): void {
    this.world.step();
  }

  private buildStaticStage(): void {
    const box = (x: number, y: number, z: number, sx: number, sy: number, sz: number): void => {
      const desc = RAPIER.ColliderDesc.cuboid(sx * 0.5, sy * 0.5, sz * 0.5).setTranslation(x, y, z);
      this.world.createCollider(desc);
    };

    box(0, -0.19, 0, 18.5, 0.4, 14.5);
    box(5.1, 1.30, 1.4, 7.8, 2.25, 5.8);
    box(-6.8, 1.25, 3.3, 1.6, 2.5, 1.6);
    box(-1.2, 0.75, -0.7, 2.3, 1.5, 2.0);
    box(-1.0, 2.25, 4.7, 7.2, 0.32, 1.25);
    box(-6.2, 2.55, -4.82, 8.8, 5.1, 0.18);
    box(0, 0.42, 7.18, 18.6, 0.84, 0.25);
    box(0, 0.42, -7.18, 18.6, 0.84, 0.25);
    box(9.18, 0.42, 0, 0.25, 0.84, 14.6);
    box(-9.18, 0.42, 0, 0.25, 0.84, 14.6);

    const angle = -20 * Math.PI / 180;
    const ramp = RAPIER.ColliderDesc.cuboid(2.6, 0.09, 3.55)
      .setTranslation(5.1, 1.13, -3.25)
      .setRotation({ x: Math.sin(angle * 0.5), y: 0, z: 0, w: Math.cos(angle * 0.5) });
    this.world.createCollider(ramp);
  }
}
