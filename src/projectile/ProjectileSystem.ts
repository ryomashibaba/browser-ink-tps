import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import { PaintEventType, SurfaceFlags, Team } from '../ink/types';
import type { PaintCoordinator, PaintRequest } from '../ink/PaintCoordinator';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';

interface ProjectileSlot {
  active: boolean;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  ttl: number;
  team: Team.A | Team.B;
  entity: Entity;
}

export class ProjectileSystem {
  private readonly slots: ProjectileSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();
  private fireCooldown = 0;

  public constructor(
    private readonly app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly resources: PlayerResources,
    private readonly combatTargets: CombatTargetSystem,
    private readonly stats: PerformanceStats
  ) {
    this.materialA = makeProjectileMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeProjectileMaterial(GAME_CONFIG.visual.teamB);

    for (let i = 0; i < GAME_CONFIG.projectile.poolSize; i += 1) {
      const entity = new Entity('Projectile:' + i);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.materialA,
        castShadows: false,
        receiveShadows: false
      });
      entity.setLocalScale(
        GAME_CONFIG.projectile.visualDiameterMeters,
        GAME_CONFIG.projectile.visualDiameterMeters,
        GAME_CONFIG.projectile.visualDiameterMeters
      );
      entity.enabled = false;
      this.app.root.addChild(entity);
      this.slots.push({
        active: false,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        ttl: 0,
        team: Team.A,
        entity
      });
    }
  }

  public solveLaunchDirection(origin: Vec3, target: Vec3, out = new Vec3()): Vec3 {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const horizontalDistance = Math.hypot(dx, dz);
    const speed = GAME_CONFIG.projectile.speedMetersPerSecond;
    const gravity = GAME_CONFIG.projectile.gravityMetersPerSecond2;

    if (speed <= 0 || gravity <= 0 || horizontalDistance < 1e-5) {
      out.set(dx, dy, dz);
      return out.lengthSq() > 1e-8 ? out.normalize() : out.set(0, 0, -1);
    }

    // Low-arc ballistic solution:
    // tan(theta) = (v^2 - sqrt(v^4 - g(g*x^2 + 2*y*v^2))) / (g*x)
    // This compensates the exact projectile gravity instead of moving the
    // visual crosshair away from the camera's true center ray.
    const speedSq = speed * speed;
    const discriminant = speedSq * speedSq
      - gravity * (gravity * horizontalDistance * horizontalDistance + 2 * dy * speedSq);

    if (discriminant < 0) {
      // Target is outside the current speed/gravity envelope. Preserve a stable,
      // predictable fallback instead of generating NaN velocity.
      out.set(dx, dy, dz);
      return out.lengthSq() > 1e-8 ? out.normalize() : out.set(0, 0, -1);
    }

    const tanTheta = (speedSq - Math.sqrt(discriminant)) / (gravity * horizontalDistance);
    const cosTheta = 1 / Math.sqrt(1 + tanTheta * tanTheta);
    const sinTheta = tanTheta * cosTheta;
    const invHorizontal = 1 / horizontalDistance;

    return out.set(
      dx * invHorizontal * cosTheta,
      sinTheta,
      dz * invHorizontal * cosTheta
    ).normalize();
  }

  public fixedUpdate(
    dt: number,
    fireHeld: boolean,
    muzzlePosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B
  ): void {
    this.fireCooldown -= dt;
    if (fireHeld && this.fireCooldown <= 0 && aimDirection.lengthSq() > 1e-8) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        this.fireCooldown += GAME_CONFIG.projectile.fireIntervalSeconds;
      } else if (this.resources.tryConsumeShotInk()) {
        this.spawnInto(slot, muzzlePosition, aimDirection, team);
        // Preserve the fractional remainder so a 0.105 s cadence does not get
        // rounded up to a permanent 7-fixed-tick interval at 60 Hz.
        this.fireCooldown += GAME_CONFIG.projectile.fireIntervalSeconds;
      } else {
        this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
    } else if (!fireHeld && this.fireCooldown < 0) {
      this.fireCooldown = 0;
    }

    let active = 0;
    for (const slot of this.slots) {
      if (!slot.active) continue;

      slot.previousPosition.copy(slot.position);
      slot.ttl -= dt;
      if (slot.ttl <= 0) {
        this.deactivate(slot);
        continue;
      }

      const previous = slot.position.clone();
      slot.velocity.y -= GAME_CONFIG.projectile.gravityMetersPerSecond2 * dt;
      this.delta.copy(slot.velocity).mulScalar(dt);
      const next = slot.position.clone().add(this.delta);

      const paintHit = this.findNearestSurfaceHit(previous, next);
      const blockerHit = this.physics.castStageSegment(previous, next, 'projectile');
      const combatHit = this.combatTargets.findNearestHit(previous, next, slot.team);
      const paintWins = paintHit && (
        !blockerHit ||
        paintHit.distance <=
          blockerHit.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
      );
      const worldDistance = paintWins
        ? paintHit.distance
        : (blockerHit?.distance ?? Number.POSITIVE_INFINITY);

      if (
        combatHit &&
        combatHit.distance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < worldDistance
      ) {
        this.combatTargets.applyProjectileHit(
          combatHit,
          GAME_CONFIG.combat.projectileDamage
        );
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      if (paintWins) {
        this.enqueueImpact(slot.team, paintHit);
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      if (blockerHit) {
        // T8: non-paintable stage geometry consumes the projectile without
        // fabricating a PaintRequest/PaintEvent.
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      slot.position.copy(next);
      slot.entity.setPosition(slot.position);
      active += 1;
    }
    this.stats.activeProjectiles = active;
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.entity.setPosition(
        slot.previousPosition.x + (slot.position.x - slot.previousPosition.x) * t,
        slot.previousPosition.y + (slot.position.y - slot.previousPosition.y) * t,
        slot.previousPosition.z + (slot.position.z - slot.previousPosition.z) * t
      );
    }
  }

  private spawnInto(
    slot: ProjectileSlot,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    slot.active = true;
    slot.ttl = GAME_CONFIG.projectile.lifeSeconds;
    slot.team = team;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(direction).normalize().mulScalar(GAME_CONFIG.projectile.speedMetersPerSecond);

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) meshInstance.material = team === Team.A ? this.materialA : this.materialB;

    slot.entity.setPosition(origin);
    slot.entity.enabled = true;
  }

  private deactivate(slot: ProjectileSlot): void {
    slot.active = false;
    slot.entity.enabled = false;
  }

  private findNearestSurfaceHit(from: Vec3, to: Vec3): SurfaceRayHit | null {
    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectSegment(from, to);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }

  private enqueueImpact(team: Team.A | Team.B, hit: SurfaceRayHit): void {
    const isWall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
    const request: PaintRequest = {
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u,
      centerV: hit.v,
      radiusU: GAME_CONFIG.projectile.paintRadiusMeters * 1.12,
      radiusV: GAME_CONFIG.projectile.paintRadiusMeters,
      angle: 0,
      type: isWall ? PaintEventType.WallImpact : PaintEventType.Impact,
      strength: 1
    };
    this.coordinator.enqueue(request);
  }
}

function makeProjectileMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.45, rgb[1] * 0.45, rgb[2] * 0.45);
  material.useMetalness = true;
  material.metalness = 0.1;
  material.gloss = 0.88;
  material.update();
  return material;
}
