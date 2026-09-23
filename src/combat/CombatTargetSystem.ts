import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import { Team } from '../ink/types';

interface CombatTarget {
  id: 'A' | 'B';
  team: Team.A | Team.B;
  hp: number;
  downSeconds: number;
  groundPosition: Vec3;
  entity: Entity;
}

export interface CombatTargetHit {
  targetId: 'A' | 'B';
  distance: number;
  point: Vec3;
}

export class CombatTargetSystem {
  private readonly targets: CombatTarget[];

  public constructor(
    app: AppBase,
    private readonly stats: PerformanceStats
  ) {
    this.targets = [
      this.createTarget(app, 'A', Team.A, new Vec3(-4.0, 0.03, 5.3)),
      this.createTarget(app, 'B', Team.B, new Vec3(4.0, 0.03, 5.3))
    ];
    this.syncStats();
  }

  public reset(): void {
    for (const target of this.targets) {
      target.hp = GAME_CONFIG.combat.targetMaxHp;
      target.downSeconds = 0;
      target.entity.enabled = true;
    }
    this.syncStats();
  }

  public fixedUpdate(dt: number): void {
    for (const target of this.targets) {
      if (target.downSeconds <= 0) continue;
      target.downSeconds = Math.max(0, target.downSeconds - dt);
      if (target.downSeconds === 0) {
        target.hp = GAME_CONFIG.combat.targetMaxHp;
        target.entity.enabled = true;
      }
    }
    this.syncStats();
  }

  public findNearestHit(
    from: Vec3,
    to: Vec3,
    sourceTeam: Team.A | Team.B
  ): CombatTargetHit | null {
    const segment = to.clone().sub(from);
    const length = segment.length();
    if (length <= 1e-8) return null;
    const direction = segment.mulScalar(1 / length);

    let best: CombatTargetHit | null = null;
    for (const target of this.targets) {
      if (
        target.team === sourceTeam ||
        target.downSeconds > 0 ||
        target.hp <= 0
      ) {
        continue;
      }

      for (const yOffset of GAME_CONFIG.combat.targetHitSphereOffsetsMeters) {
        const center = target.groundPosition.clone();
        center.y += yOffset;
        const distance = raySphereDistance(
          from,
          direction,
          length,
          center,
          GAME_CONFIG.combat.targetHitRadiusMeters
        );
        if (distance === null || (best && distance >= best.distance)) continue;

        best = {
          targetId: target.id,
          distance,
          point: from.clone().add(direction.clone().mulScalar(distance))
        };
      }
    }
    return best;
  }

  public applyProjectileHit(hit: CombatTargetHit, damage: number): void {
    const target = this.targets.find((candidate) => candidate.id === hit.targetId);
    if (!target || target.downSeconds > 0 || target.hp <= 0) return;

    target.hp = Math.max(0, target.hp - damage);
    this.stats.combatHits += 1;

    if (target.hp <= 0) {
      target.downSeconds = GAME_CONFIG.combat.targetDownSeconds;
      target.entity.enabled = false;
      this.stats.combatTargetDowns += 1;
    }

    this.syncStats();
  }

  public applyAreaDamage(
    center: Vec3,
    radius: number,
    damage: number,
    sourceTeam: Team.A | Team.B
  ): number {
    if (radius <= 0 || damage <= 0) return 0;
    const radiusSq = radius * radius;
    let hits = 0;

    for (const target of this.targets) {
      if (
        target.team === sourceTeam ||
        target.downSeconds > 0 ||
        target.hp <= 0
      ) {
        continue;
      }

      const dx = target.groundPosition.x - center.x;
      const dy =
        target.groundPosition.y +
        GAME_CONFIG.combat.targetVisualCenterYMeters -
        center.y;
      const dz = target.groundPosition.z - center.z;
      if (dx * dx + dy * dy + dz * dz > radiusSq) continue;

      target.hp = Math.max(0, target.hp - damage);
      this.stats.combatHits += 1;
      hits += 1;

      if (target.hp <= 0) {
        target.downSeconds = GAME_CONFIG.combat.targetDownSeconds;
        target.entity.enabled = false;
        this.stats.combatTargetDowns += 1;
      }
    }

    this.syncStats();
    return hits;
  }

  private createTarget(
    app: AppBase,
    id: 'A' | 'B',
    team: Team.A | Team.B,
    groundPosition: Vec3
  ): CombatTarget {
    const entity = new Entity(`CombatTarget:${id}`);
    const material = makeTargetMaterial(
      team === Team.A ? GAME_CONFIG.visual.teamA : GAME_CONFIG.visual.teamB
    );
    entity.addComponent('render', {
      type: 'capsule',
      material,
      castShadows: true,
      receiveShadows: true
    });
    entity.setLocalScale(0.72, 1.12, 0.72);
    entity.setPosition(
      groundPosition.x,
      groundPosition.y + GAME_CONFIG.combat.targetVisualCenterYMeters,
      groundPosition.z
    );
    app.root.addChild(entity);

    return {
      id,
      team,
      hp: GAME_CONFIG.combat.targetMaxHp,
      downSeconds: 0,
      groundPosition,
      entity
    };
  }

  private syncStats(): void {
    this.stats.targetAHp = this.targets[0]?.hp ?? 0;
    this.stats.targetBHp = this.targets[1]?.hp ?? 0;
  }
}

function raySphereDistance(
  origin: Vec3,
  direction: Vec3,
  maxDistance: number,
  center: Vec3,
  radius: number
): number | null {
  const offset = origin.clone().sub(center);
  const b = offset.dot(direction);
  const c = offset.dot(offset) - radius * radius;

  if (c > 0 && b > 0) return null;
  const discriminant = b * b - c;
  if (discriminant < 0) return null;

  const distance = Math.max(0, -b - Math.sqrt(discriminant));
  return distance <= maxDistance ? distance : null;
}

function makeTargetMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0] * 0.72, rgb[1] * 0.72, rgb[2] * 0.72);
  material.emissive = new Color(rgb[0] * 0.18, rgb[1] * 0.18, rgb[2] * 0.18);
  material.useMetalness = true;
  material.metalness = 0.28;
  material.gloss = 0.82;
  material.update();
  return material;
}
