import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';

interface BombSlot {
  active: boolean;
  landed: boolean;
  team: Team.A | Team.B;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  ttl: number;
  fuseSeconds: number;
  entity: Entity;
}

export class SubWeaponSystem {
  private readonly bombs: BombSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();

  public constructor(
    app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly resources: PlayerResources,
    private readonly combatTargets: CombatTargetSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats
  ) {
    this.materialA = makeBombMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeBombMaterial(GAME_CONFIG.visual.teamB);

    for (let i = 0; i < 4; i += 1) {
      const entity = new Entity(`PulseBomb:${i}`);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.materialA,
        castShadows: false,
        receiveShadows: false
      });
      const d = GAME_CONFIG.subWeapon.visualDiameterMeters;
      entity.setLocalScale(d, d, d);
      entity.enabled = false;
      app.root.addChild(entity);

      this.bombs.push({
        active: false,
        landed: false,
        team: Team.A,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        ttl: 0,
        fuseSeconds: 0,
        entity
      });
    }
  }

  public tryThrow(
    team: Team.A | Team.B,
    origin: Vec3,
    direction: Vec3
  ): boolean {
    const slot = this.bombs.find((candidate) => !candidate.active);
    if (!slot) return false;
    if (!this.resources.tryConsumeSubInk(GAME_CONFIG.subWeapon.inkCost)) return false;

    const aim = direction.clone().normalize();
    slot.active = true;
    slot.landed = false;
    slot.team = team;
    slot.ttl = GAME_CONFIG.subWeapon.maxFlightSeconds;
    slot.fuseSeconds = GAME_CONFIG.subWeapon.fuseSeconds;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(aim).mulScalar(GAME_CONFIG.subWeapon.throwSpeedMetersPerSecond);
    slot.velocity.y += GAME_CONFIG.subWeapon.upwardBoostMetersPerSecond;

    const mesh = slot.entity.render?.meshInstances[0];
    if (mesh) mesh.material = team === Team.A ? this.materialA : this.materialB;
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;

    this.stats.playerSubThrows += 1;
    this.feedback.subThrow(team, origin);
    return true;
  }

  public fixedUpdate(dt: number): void {
    for (const slot of this.bombs) {
      if (!slot.active) continue;

      slot.previousPosition.copy(slot.position);

      if (slot.landed) {
        slot.fuseSeconds = Math.max(0, slot.fuseSeconds - dt);
        if (slot.fuseSeconds <= 0) this.explode(slot);
        continue;
      }

      slot.ttl -= dt;
      if (slot.ttl <= 0) {
        this.explode(slot);
        continue;
      }

      slot.velocity.y -= GAME_CONFIG.subWeapon.gravityMetersPerSecond2 * dt;
      this.delta.copy(slot.velocity).mulScalar(dt);
      const next = slot.position.clone().add(this.delta);

      const paintHit = this.findNearestSurfaceHit(slot.position, next);
      const blockerHit = this.physics.castStageSegment(slot.position, next, 'projectile');

      const paintWins = paintHit && (
        !blockerHit ||
        paintHit.distance <=
          blockerHit.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
      );

      if (paintWins && paintHit) {
        this.land(slot, paintHit.worldPoint);
        continue;
      }
      if (blockerHit) {
        this.land(slot, blockerHit.point);
        continue;
      }

      slot.position.copy(next);
      slot.entity.setPosition(slot.position);
    }
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      if (slot.landed) {
        slot.entity.setPosition(slot.position);
        continue;
      }
      slot.entity.setPosition(
        slot.previousPosition.x + (slot.position.x - slot.previousPosition.x) * t,
        slot.previousPosition.y + (slot.position.y - slot.previousPosition.y) * t,
        slot.previousPosition.z + (slot.position.z - slot.previousPosition.z) * t
      );
    }
  }

  public reset(): void {
    for (const slot of this.bombs) this.deactivate(slot);
  }

  private land(slot: BombSlot, point: Vec3): void {
    slot.position.copy(point);
    slot.previousPosition.copy(point);
    slot.velocity.set(0, 0, 0);
    slot.landed = true;
    slot.entity.setPosition(point);
    this.feedback.subFuse(slot.team, point, slot.fuseSeconds);
  }

  private explode(slot: BombSlot): void {
    const cfg = GAME_CONFIG.subWeapon;

    // Outer splash + inner extra gives 30 / 100 damage zones without double-count ambiguity.
    this.cpuAgents.applyAreaDamage(
      slot.position,
      cfg.outerDamageRadiusMeters,
      cfg.outerDamage,
      slot.team
    );
    this.combatTargets.applyAreaDamage(
      slot.position,
      cfg.outerDamageRadiusMeters,
      cfg.outerDamage,
      slot.team
    );
    this.cpuAgents.applyAreaDamage(
      slot.position,
      cfg.innerDamageRadiusMeters,
      cfg.innerExtraDamage,
      slot.team
    );
    this.combatTargets.applyAreaDamage(
      slot.position,
      cfg.innerDamageRadiusMeters,
      cfg.innerExtraDamage,
      slot.team
    );

    this.paintExplosion(slot.team, slot.position);
    this.feedback.subBurst(slot.team, slot.position, cfg.paintRadiusMeters);
    this.stats.playerSubExplosions += 1;
    this.deactivate(slot);
  }

  private paintExplosion(team: Team.A | Team.B, center: Vec3): void {
    const cfg = GAME_CONFIG.subWeapon;
    const innerRadius = Math.max(0.5, cfg.paintRadiusMeters * 0.52);
    this.paintWorldStamp(team, center, innerRadius, 2.0);

    const ringRadius = cfg.paintRadiusMeters * 0.58;
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI * 2 / 8;
      const point = center.clone().add(new Vec3(
        Math.cos(angle) * ringRadius,
        0,
        Math.sin(angle) * ringRadius
      ));
      this.paintWorldStamp(team, point, innerRadius * 0.78, 2.2);
    }
  }

  private paintWorldStamp(
    team: Team.A | Team.B,
    worldPoint: Vec3,
    radius: number,
    maxPlaneDistance: number
  ): boolean {
    let best:
      | { surface: PaintSurface; u: number; v: number; planeDistance: number }
      | null = null;

    for (const surface of this.surfaces) {
      if ((surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      const projected = surface.projectWorldPoint(worldPoint);
      if (!projected.inside || projected.planeDistance > maxPlaneDistance) continue;
      if (!best || projected.planeDistance < best.planeDistance) {
        best = {
          surface,
          u: projected.u,
          v: projected.v,
          planeDistance: projected.planeDistance
        };
      }
    }

    if (!best) return false;

    this.coordinator.enqueue({
      source: PaintSource.Human,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU: radius,
      radiusV: radius,
      angle: 0,
      type: PaintEventType.Bomb,
      strength: 1
    });
    return true;
  }

  private findNearestSurfaceHit(from: Vec3, to: Vec3): SurfaceRayHit | null {
    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectSegment(from, to);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }

  private deactivate(slot: BombSlot): void {
    slot.active = false;
    slot.landed = false;
    slot.entity.enabled = false;
  }
}

function makeBombMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.7, rgb[1] * 0.7, rgb[2] * 0.7);
  material.useMetalness = true;
  material.metalness = 0.15;
  material.gloss = 0.82;
  material.update();
  return material;
}
