import {
  Color,
  Entity,
  StandardMaterial,
  Vec3,
  type AppBase
} from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { StageDefinition } from '../stage/StageDefinition';

export class SplatZonesVisualFeedback {
  private readonly root = new Entity('T20:SplatZoneOutline');
  private readonly bars: Entity[] = [];
  private readonly neutralMaterial = makeZoneMaterial([0.82, 0.88, 0.92]);
  private readonly teamAMaterial = makeZoneMaterial(GAME_CONFIG.visual.teamA);
  private readonly teamBMaterial = makeZoneMaterial(GAME_CONFIG.visual.teamB);

  public constructor(
    app: AppBase,
    gameplayInk: GameplayInkSystem,
    stage: StageDefinition,
    private readonly stats: PerformanceStats
  ) {
    const zone = stage.metadata.splatZones[0];
    if (!zone) throw new Error('Splat Zones visual requires a zone definition.');
    const surface = gameplayInk.getSurface(zone.surfaceId);
    if (!surface) {
      throw new Error(`Splat Zones visual references unknown surface '${zone.surfaceId}'.`);
    }

    const minU = zone.centerU - zone.widthMeters * 0.5;
    const maxU = zone.centerU + zone.widthMeters * 0.5;
    const minV = zone.centerV - zone.heightMeters * 0.5;
    const maxV = zone.centerV + zone.heightMeters * 0.5;
    const corners = [
      surface.localToWorld(minU, minV),
      surface.localToWorld(maxU, minV),
      surface.localToWorld(maxU, maxV),
      surface.localToWorld(minU, maxV)
    ];

    app.root.addChild(this.root);
    for (let i = 0; i < corners.length; i += 1) {
      const from = corners[i]!;
      const to = corners[(i + 1) % corners.length]!;
      this.bars.push(this.createBar(from, to, i));
    }
    this.root.enabled = false;
  }

  public update(active: boolean): void {
    this.root.enabled = active;
    if (!active) return;

    const material = this.stats.zonesControl === 'TEAM A'
      ? this.teamAMaterial
      : this.stats.zonesControl === 'TEAM B'
        ? this.teamBMaterial
        : this.neutralMaterial;

    for (const bar of this.bars) {
      const meshInstance = bar.render?.meshInstances[0];
      if (meshInstance && meshInstance.material !== material) {
        meshInstance.material = material;
      }
    }
  }

  private createBar(from: Vec3, to: Vec3, index: number): Entity {
    const direction = to.clone().sub(from);
    const horizontalLength = Math.hypot(direction.x, direction.z);
    if (horizontalLength <= 1e-5) {
      throw new Error('Splat Zones visual received a degenerate zone edge.');
    }

    const bar = new Entity(`T20:SplatZoneEdge:${index}`);
    bar.addComponent('render', {
      type: 'box',
      material: this.neutralMaterial,
      castShadows: false,
      receiveShadows: false
    });

    const midpoint = from.clone().add(to).mulScalar(0.5);
    // The current T20 objective is on the canonical main-floor PaintSurface.
    // Keep the marker slightly above gameplay ink to prevent z-fighting.
    bar.setPosition(midpoint.x, midpoint.y + 0.055, midpoint.z);
    bar.setLocalScale(horizontalLength, 0.055, 0.11);
    bar.setEulerAngles(
      0,
      -Math.atan2(direction.z, direction.x) * 180 / Math.PI,
      0
    );
    this.root.addChild(bar);
    return bar;
  }
}

function makeZoneMaterial(
  rgb: readonly [number, number, number]
): StandardMaterial {
  const material = new StandardMaterial();
  const color = new Color(rgb[0], rgb[1], rgb[2]);
  material.diffuse = color;
  material.emissive = new Color(
    Math.min(1, rgb[0] * 0.72),
    Math.min(1, rgb[1] * 0.72),
    Math.min(1, rgb[2] * 0.72)
  );
  material.useMetalness = true;
  material.metalness = 0.05;
  material.gloss = 0.82;
  material.update();
  return material;
}
