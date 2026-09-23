import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CpuAgentSystem, CpuFireRequest } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import { PaintEventType, SurfaceFlags, Team } from '../ink/types';
import type { PaintCoordinator, PaintRequest } from '../ink/PaintCoordinator';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import type { GameFeedback } from '../feedback/GameFeedback';
import {
  DEFAULT_WEAPON_ID,
  type WeaponId,
  type WeaponProfile,
  weaponProfile
} from '../weapons/WeaponCatalog';

interface ProjectileSlot {
  active: boolean;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  ttl: number;
  team: Team.A | Team.B;
  entity: Entity;
  sourceKind: 'HUMAN' | 'CPU';
  sourceId: string;
  weaponId: WeaponId;
}

export class ProjectileSystem {
  private readonly slots: ProjectileSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();
  private readonly queuedCpuShots: CpuFireRequest[] = [];
  private readonly cpuAimDirection = new Vec3();
  private fireCooldown = 0;
  private playerWeaponId: WeaponId = DEFAULT_WEAPON_ID;

  public constructor(
    private readonly app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly resources: PlayerResources,
    private readonly combatTargets: CombatTargetSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly feedback: GameFeedback,
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
        entity,
        sourceKind: 'HUMAN',
        sourceId: 'human',
        weaponId: DEFAULT_WEAPON_ID
      });
    }
    this.syncWeaponStats();
  }

  public get currentPlayerWeapon(): WeaponProfile {
    return weaponProfile(this.playerWeaponId);
  }

  public setPlayerWeapon(id: WeaponId): void {
    if (id === this.playerWeaponId) return;
    this.playerWeaponId = id;
    this.fireCooldown = Math.max(this.fireCooldown, 0.08);
    this.stats.playerWeaponSwitches += 1;
    this.syncWeaponStats();
    this.feedback.weaponSwitch();
  }

  public solvePlayerLaunchDirection(origin: Vec3, target: Vec3, out = new Vec3()): Vec3 {
    return this.solveLaunchDirection(origin, target, out, this.currentPlayerWeapon);
  }

  public reset(): void {
    for (const slot of this.slots) this.deactivate(slot);
    this.fireCooldown = 0;
    this.queuedCpuShots.length = 0;
    this.stats.activeProjectiles = 0;
  }

  public queueCpuShot(request: CpuFireRequest): void {
    this.queuedCpuShots.push({
      sourceId: request.sourceId,
      team: request.team,
      origin: request.origin.clone(),
      target: request.target.clone()
    });
  }

  public solveLaunchDirection(
    origin: Vec3,
    target: Vec3,
    out = new Vec3(),
    profile: WeaponProfile = weaponProfile(DEFAULT_WEAPON_ID)
  ): Vec3 {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const horizontalDistance = Math.hypot(dx, dz);
    const speed = profile.speedMetersPerSecond;
    const gravity = profile.gravityMetersPerSecond2;

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
    team: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean
  ): void {
    const playerProfile = this.currentPlayerWeapon;
    this.fireCooldown -= dt;
    if (fireHeld && this.fireCooldown <= 0 && aimDirection.lengthSq() > 1e-8) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        this.fireCooldown += playerProfile.fireIntervalSeconds;
      } else if (this.resources.tryConsumeShotInk(playerProfile.inkCost)) {
        this.spawnInto(
          slot,
          muzzlePosition,
          aimDirection,
          team,
          'HUMAN',
          'human',
          playerProfile.id
        );
        // Preserve the fractional remainder so a 0.105 s cadence does not get
        // rounded up to a permanent 7-fixed-tick interval at 60 Hz.
        this.fireCooldown += playerProfile.fireIntervalSeconds;
      } else {
        this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
    } else if (!fireHeld && this.fireCooldown < 0) {
      this.fireCooldown = 0;
    }

    this.spawnQueuedCpuShots();

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
      const slotProfile = weaponProfile(slot.weaponId);
      slot.velocity.y -= slotProfile.gravityMetersPerSecond2 * dt;
      this.delta.copy(slot.velocity).mulScalar(dt);
      const next = slot.position.clone().add(this.delta);

      const paintHit = this.findNearestSurfaceHit(previous, next);
      const blockerHit = this.physics.castStageSegment(previous, next, 'projectile');
      const qaHit = slot.sourceKind === 'HUMAN'
        ? this.combatTargets.findNearestHit(previous, next, slot.team)
        : null;
      const cpuHit = this.cpuAgents.findNearestCombatHit(previous, next, slot.team);
      const playerHitDistance = (
        playerDamageable &&
        slot.sourceKind === 'CPU' &&
        slot.team !== team
      )
        ? segmentSphereDistance(
            previous,
            next,
            playerPosition,
            GAME_CONFIG.cpu.playerHitRadiusMeters
          )
        : null;
      const paintWins = paintHit && (
        !blockerHit ||
        paintHit.distance <=
          blockerHit.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
      );
      const worldDistance = paintWins
        ? paintHit.distance
        : (blockerHit?.distance ?? Number.POSITIVE_INFINITY);

      let combatDistance = Number.POSITIVE_INFINITY;
      let combatKind: 'QA' | 'CPU' | 'PLAYER' | null = null;

      if (qaHit && qaHit.distance < combatDistance) {
        combatDistance = qaHit.distance;
        combatKind = 'QA';
      }
      if (cpuHit && cpuHit.distance < combatDistance) {
        combatDistance = cpuHit.distance;
        combatKind = 'CPU';
      }
      if (playerHitDistance !== null && playerHitDistance < combatDistance) {
        combatDistance = playerHitDistance;
        combatKind = 'PLAYER';
      }

      if (
        combatKind &&
        combatDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < worldDistance
      ) {
        if (combatKind === 'QA' && qaHit) {
          this.combatTargets.applyProjectileHit(
            qaHit,
            slotProfile.damage
          );
        } else if (combatKind === 'CPU' && cpuHit) {
          this.cpuAgents.applyProjectileHit(
            cpuHit,
            slotProfile.damage
          );
        } else if (combatKind === 'PLAYER') {
          this.resources.applyDamage(slotProfile.damage);
          this.stats.cpuPlayerHits += 1;
        }
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      if (paintWins) {
        this.enqueueImpact(slot.team, paintHit, slotProfile);
        this.feedback.impact(slot.team, paintHit.worldPoint, slotProfile);
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

  private spawnQueuedCpuShots(): void {
    if (this.queuedCpuShots.length === 0) return;

    for (const request of this.queuedCpuShots) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        continue;
      }

      const cpuProfile = weaponProfile(DEFAULT_WEAPON_ID);
      this.solveLaunchDirection(request.origin, request.target, this.cpuAimDirection, cpuProfile);
      if (this.cpuAimDirection.lengthSq() <= 1e-8) continue;
      this.spawnInto(
        slot,
        request.origin,
        this.cpuAimDirection,
        request.team,
        'CPU',
        request.sourceId,
        DEFAULT_WEAPON_ID
      );
    }
    this.queuedCpuShots.length = 0;
  }

  private spawnInto(
    slot: ProjectileSlot,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    sourceKind: 'HUMAN' | 'CPU',
    sourceId: string,
    weaponId: WeaponId
  ): void {
    const profile = weaponProfile(weaponId);
    slot.active = true;
    slot.ttl = profile.lifeSeconds;
    slot.team = team;
    slot.sourceKind = sourceKind;
    slot.sourceId = sourceId;
    slot.weaponId = weaponId;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(direction).normalize().mulScalar(profile.speedMetersPerSecond);

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) meshInstance.material = team === Team.A ? this.materialA : this.materialB;

    slot.entity.setLocalScale(
      profile.visualDiameterMeters,
      profile.visualDiameterMeters,
      profile.visualDiameterMeters
    );
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;
    this.feedback.shot(team, origin, profile, sourceKind === 'HUMAN');
  }

  private syncWeaponStats(): void {
    const profile = this.currentPlayerWeapon;
    this.stats.playerWeaponId = profile.id;
    this.stats.playerWeaponName = profile.displayName;
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

  private enqueueImpact(
    team: Team.A | Team.B,
    hit: SurfaceRayHit,
    profile: WeaponProfile
  ): void {
    const isWall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
    const request: PaintRequest = {
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u,
      centerV: hit.v,
      radiusU: profile.paintRadiusMeters * 1.12,
      radiusV: profile.paintRadiusMeters,
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


function segmentSphereDistance(
  from: Vec3,
  to: Vec3,
  center: Vec3,
  radius: number
): number | null {
  const segment = to.clone().sub(from);
  const length = segment.length();
  if (length <= 1e-8) return null;
  const direction = segment.mulScalar(1 / length);
  const offset = from.clone().sub(center);
  const b = offset.dot(direction);
  const c = offset.dot(offset) - radius * radius;
  if (c > 0 && b > 0) return null;
  const discriminant = b * b - c;
  if (discriminant < 0) return null;
  const distance = Math.max(0, -b - Math.sqrt(discriminant));
  return distance <= length ? distance : null;
}
