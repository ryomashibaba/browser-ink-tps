import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CpuAgentSystem, CpuFireRequest } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import { PaintEventType, SurfaceFlags, Team } from '../ink/types';
import type { PaintCoordinator, PaintRequest } from '../ink/PaintCoordinator';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
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
  gravity: number;
  ttl: number;
  team: Team.A | Team.B;
  entity: Entity;
  sourceKind: 'HUMAN' | 'CPU';
  sourceId: string;
  weaponId: WeaponId;
  damage: number;
  paintRadius: number;
  blastRadius: number;
  blastDamage: number;
}

export class ProjectileSystem {
  private readonly slots: ProjectileSlot[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();
  private readonly queuedCpuShots: CpuFireRequest[] = [];
  private readonly cpuAimDirection = new Vec3();
  private fireCooldown = 0;
  private burstCooldown = 0;
  private burstShotsRemaining = 0;
  private rollPaintCooldown = 0;
  private chargeSeconds = 0;
  private wasFireHeld = false;
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
      entity.enabled = false;
      this.app.root.addChild(entity);
      this.slots.push({
        active: false,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        gravity: GAME_CONFIG.projectile.gravityMetersPerSecond2,
        ttl: 0,
        team: Team.A,
        entity,
        sourceKind: 'HUMAN',
        sourceId: 'human',
        weaponId: DEFAULT_WEAPON_ID,
        damage: GAME_CONFIG.combat.projectileDamage,
        paintRadius: GAME_CONFIG.projectile.paintRadiusMeters,
        blastRadius: 0,
        blastDamage: 0
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
    this.burstShotsRemaining = 0;
    this.burstCooldown = 0;
    this.chargeSeconds = 0;
    this.wasFireHeld = false;
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
    this.burstCooldown = 0;
    this.burstShotsRemaining = 0;
    this.rollPaintCooldown = 0;
    this.chargeSeconds = 0;
    this.wasFireHeld = false;
    this.queuedCpuShots.length = 0;
    this.stats.activeProjectiles = 0;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
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

    const speedSq = speed * speed;
    const discriminant = speedSq * speedSq
      - gravity * (gravity * horizontalDistance * horizontalDistance + 2 * dy * speedSq);

    if (discriminant < 0) {
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
    secondaryHeld: boolean,
    muzzlePosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean
  ): void {
    const playerProfile = this.currentPlayerWeapon;
    const risingFire = fireHeld && !this.wasFireHeld;
    const fallingFire = !fireHeld && this.wasFireHeld;
    const guarding = playerProfile.weaponClass === 'BRELLA' && secondaryHeld;

    this.fireCooldown = Math.max(-0.5, this.fireCooldown - dt);
    this.burstCooldown = Math.max(-0.5, this.burstCooldown - dt);
    this.rollPaintCooldown = Math.max(-0.5, this.rollPaintCooldown - dt);

    this.stats.playerWeaponGuarding = guarding;
    this.stats.playerWeaponAction = guarding ? 'GUARD' : 'READY';

    if (playerDamageable) {
      this.updatePlayerWeapon(
        dt,
        playerProfile,
        fireHeld,
        risingFire,
        fallingFire,
        guarding,
        muzzlePosition,
        aimDirection,
        team,
        playerPosition
      );
    } else {
      this.chargeSeconds = 0;
      this.burstShotsRemaining = 0;
      this.stats.playerWeaponChargePercent = 0;
      this.stats.playerWeaponAction = 'LOCKED';
    }
    this.wasFireHeld = fireHeld;

    this.spawnQueuedCpuShots();

    let active = 0;
    for (const slot of this.slots) {
      if (!slot.active) continue;

      slot.previousPosition.copy(slot.position);
      slot.ttl -= dt;
      if (slot.ttl <= 0) {
        if (slot.blastRadius > 0) this.applyBlast(slot, slot.position);
        this.deactivate(slot);
        continue;
      }

      const previous = slot.position.clone();
      slot.velocity.y -= slot.gravity * dt;
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
        let combatPoint = next.clone();
        if (combatKind === 'QA' && qaHit) {
          combatPoint = qaHit.point.clone();
          this.combatTargets.applyProjectileHit(qaHit, slot.damage);
        } else if (combatKind === 'CPU' && cpuHit) {
          combatPoint = cpuHit.point.clone();
          this.cpuAgents.applyProjectileHit(cpuHit, slot.damage);
        } else if (combatKind === 'PLAYER') {
          combatPoint = pointOnSegment(previous, next, combatDistance);
          if (guarding) {
            this.stats.playerWeaponGuardBlocks += 1;
          } else {
            this.resources.applyDamage(slot.damage);
            this.stats.cpuPlayerHits += 1;
          }
        }
        if (slot.blastRadius > 0) this.applyBlast(slot, combatPoint);
        this.feedback.impact(slot.team, combatPoint, weaponProfile(slot.weaponId));
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      if (paintWins) {
        this.enqueueImpact(slot.team, paintHit, slot.paintRadius);
        if (slot.blastRadius > 0) this.applyBlast(slot, paintHit.worldPoint);
        this.feedback.impact(slot.team, paintHit.worldPoint, weaponProfile(slot.weaponId));
        this.stats.projectileImpacts += 1;
        this.deactivate(slot);
        continue;
      }

      if (blockerHit) {
        if (slot.blastRadius > 0) this.applyBlast(slot, blockerHit.point);
        this.feedback.impact(slot.team, blockerHit.point, weaponProfile(slot.weaponId));
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

  private updatePlayerWeapon(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    risingFire: boolean,
    fallingFire: boolean,
    guarding: boolean,
    muzzlePosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B,
    playerPosition: Vec3
  ): void {
    if (guarding) {
      this.chargeSeconds = 0;
      this.stats.playerWeaponChargePercent = 0;
      return;
    }

    if (profile.trigger === 'AUTO') {
      this.chargeSeconds = 0;
      this.stats.playerWeaponChargePercent = 0;
      if (fireHeld && this.fireCooldown <= 0) {
        if (this.tryFirePattern(profile, muzzlePosition, aimDirection, team, 0)) {
          this.fireCooldown += profile.fireIntervalSeconds;
          this.stats.playerWeaponAction = 'FIRING';
        } else {
          this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
        }
      }
      return;
    }

    if (profile.trigger === 'ROLLER') {
      this.stats.playerWeaponChargePercent = 0;
      if (risingFire && this.fireCooldown <= 0) {
        if (this.tryFirePattern(profile, muzzlePosition, aimDirection, team, 0)) {
          this.fireCooldown = profile.fireIntervalSeconds;
          this.stats.playerWeaponAction = 'SWING';
        }
      }
      if (
        fireHeld &&
        this.stats.playerSpeedMetersPerSecond > 0.30 &&
        this.rollPaintCooldown <= 0
      ) {
        if (this.paintRollerGround(profile, playerPosition, aimDirection, team)) {
          this.rollPaintCooldown = 0.085;
          this.stats.playerWeaponAction = 'ROLLING';
        }
      }
      return;
    }

    if (profile.trigger === 'SPLATLING') {
      if (this.burstShotsRemaining > 0) {
        this.stats.playerWeaponAction = 'BURST';
        if (this.burstCooldown <= 0) {
          if (this.tryFirePattern(profile, muzzlePosition, aimDirection, team, 0)) {
            this.burstShotsRemaining -= 1;
            this.burstCooldown += profile.burstIntervalSeconds;
          } else {
            this.burstShotsRemaining = 0;
          }
        }
        return;
      }

      if (fireHeld) {
        this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
        this.stats.playerWeaponAction = 'CHARGING';
        this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      } else if (fallingFire && this.chargeSeconds >= profile.minChargeSeconds) {
        const fraction = chargeFraction(profile, this.chargeSeconds);
        this.burstShotsRemaining = Math.max(3, Math.round(profile.burstMaxShots * fraction));
        this.burstCooldown = 0;
        this.chargeSeconds = 0;
        this.stats.playerWeaponChargePercent = 0;
      } else if (!fireHeld) {
        this.chargeSeconds = 0;
        this.stats.playerWeaponChargePercent = 0;
      }
      return;
    }

    if (profile.trigger === 'CHARGE_RELEASE' || profile.trigger === 'SPLATANA') {
      if (fireHeld) {
        this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
        this.stats.playerWeaponAction = 'CHARGING';
        this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
        return;
      }

      if (fallingFire && this.fireCooldown <= 0) {
        const enoughCharge = this.chargeSeconds >= profile.minChargeSeconds;
        const fraction = enoughCharge ? chargeFraction(profile, this.chargeSeconds) : 0;
        if (profile.trigger === 'SPLATANA' || enoughCharge) {
          if (this.tryFirePattern(profile, muzzlePosition, aimDirection, team, fraction)) {
            this.fireCooldown = profile.fireIntervalSeconds;
            this.stats.playerWeaponAction =
              profile.trigger === 'SPLATANA' && fraction >= 0.55 ? 'CHARGED_SLASH' : 'RELEASE';
          }
        }
      }

      if (!fireHeld) {
        this.chargeSeconds = 0;
        this.stats.playerWeaponChargePercent = 0;
      }
    }
  }

  private tryFirePattern(
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    charge: number
  ): boolean {
    if (direction.lengthSq() <= 1e-8) return false;
    if (!this.resources.tryConsumeShotInk(profile.inkCost)) return false;

    const charged = profile.trigger === 'CHARGE_RELEASE' || profile.trigger === 'SPLATANA';
    const damageMultiplier = charged
      ? lerp(1, profile.chargeDamageMultiplier, charge)
      : 1;
    const speedMultiplier = charged
      ? lerp(1, profile.chargeSpeedMultiplier, charge)
      : 1;
    const paintMultiplier = charged
      ? lerp(1, profile.chargePaintMultiplier, charge)
      : 1;
    const spreadScale = profile.weaponClass === 'STRINGER'
      ? lerp(1, 0.18, charge)
      : 1;

    let spawned = 0;
    const pelletCount = Math.max(1, profile.pelletCount);
    for (let i = 0; i < pelletCount; i += 1) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        break;
      }

      const offset = pelletCount <= 1
        ? 0
        : (i / (pelletCount - 1) - 0.5) * profile.spreadDegrees * spreadScale;
      const pelletDirection = rotateYaw(direction, offset);

      this.spawnInto(
        slot,
        origin,
        pelletDirection,
        team,
        'HUMAN',
        'human',
        profile.id,
        profile.speedMetersPerSecond * speedMultiplier,
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * (1 + charge * 0.22),
        profile.damage * damageMultiplier,
        profile.paintRadiusMeters * paintMultiplier,
        profile.blastRadiusMeters,
        profile.blastDamage
      );
      spawned += 1;
    }

    if (spawned > 0) {
      this.feedback.shot(team, origin, profile, true);
      return true;
    }
    return false;
  }

  private paintRollerGround(
    profile: WeaponProfile,
    playerPosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B
  ): boolean {
    if (profile.rollPaintRadiusMeters <= 0) return false;
    if (!this.resources.tryConsumeShotInk(profile.rollPaintInkCost)) return false;

    let best: { surface: PaintSurface; u: number; v: number; distance: number } | null = null;
    for (const surface of this.surfaces) {
      if ((surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      if ((surface.baseFlags & SurfaceFlags.Wall) !== 0) continue;
      const projected = surface.projectWorldPoint(playerPosition);
      if (!projected.inside || projected.planeDistance > 0.72) continue;
      if (!best || projected.planeDistance < best.distance) {
        best = {
          surface,
          u: projected.u,
          v: projected.v,
          distance: projected.planeDistance
        };
      }
    }
    if (!best) return false;

    const heading = Math.atan2(aimDirection.z, aimDirection.x);
    this.coordinator.enqueue({
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU: profile.rollPaintRadiusMeters * 1.25,
      radiusV: profile.rollPaintRadiusMeters * 0.72,
      angle: heading,
      type: PaintEventType.Foot,
      strength: 1
    });
    return true;
  }

  private spawnQueuedCpuShots(): void {
    if (this.queuedCpuShots.length === 0) return;

    const cpuProfile = weaponProfile(DEFAULT_WEAPON_ID);
    for (const request of this.queuedCpuShots) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        continue;
      }

      this.solveLaunchDirection(request.origin, request.target, this.cpuAimDirection, cpuProfile);
      if (this.cpuAimDirection.lengthSq() <= 1e-8) continue;
      this.spawnInto(
        slot,
        request.origin,
        this.cpuAimDirection,
        request.team,
        'CPU',
        request.sourceId,
        DEFAULT_WEAPON_ID,
        cpuProfile.speedMetersPerSecond,
        cpuProfile.gravityMetersPerSecond2,
        cpuProfile.lifeSeconds,
        cpuProfile.visualDiameterMeters,
        cpuProfile.damage,
        cpuProfile.paintRadiusMeters,
        0,
        0
      );
      this.feedback.shot(request.team, request.origin, cpuProfile, false);
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
    weaponId: WeaponId,
    speed: number,
    gravity: number,
    life: number,
    visualDiameter: number,
    damage: number,
    paintRadius: number,
    blastRadius: number,
    blastDamage: number
  ): void {
    slot.active = true;
    slot.ttl = life;
    slot.team = team;
    slot.sourceKind = sourceKind;
    slot.sourceId = sourceId;
    slot.weaponId = weaponId;
    slot.gravity = gravity;
    slot.damage = damage;
    slot.paintRadius = paintRadius;
    slot.blastRadius = blastRadius;
    slot.blastDamage = blastDamage;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(direction).normalize().mulScalar(speed);

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) meshInstance.material = team === Team.A ? this.materialA : this.materialB;

    slot.entity.setLocalScale(visualDiameter, visualDiameter, visualDiameter);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;
  }

  private applyBlast(slot: ProjectileSlot, point: Vec3): void {
    if (slot.blastRadius <= 0 || slot.blastDamage <= 0) return;
    if (slot.sourceKind === 'HUMAN') {
      this.cpuAgents.applyAreaDamage(
        point,
        slot.blastRadius,
        slot.blastDamage,
        slot.team
      );
      this.combatTargets.applyAreaDamage(
        point,
        slot.blastRadius,
        slot.blastDamage,
        slot.team
      );
    }
  }

  private syncWeaponStats(): void {
    const profile = this.currentPlayerWeapon;
    this.stats.playerWeaponId = profile.id;
    this.stats.playerWeaponName = profile.displayName;
    this.stats.playerWeaponClass = profile.classLabel;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
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
    paintRadius: number
  ): void {
    const isWall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
    const request: PaintRequest = {
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u,
      centerV: hit.v,
      radiusU: paintRadius * 1.12,
      radiusV: paintRadius,
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

function chargeFraction(profile: WeaponProfile, seconds: number): number {
  if (profile.chargeSeconds <= 1e-6) return 0;
  return clamp(seconds / profile.chargeSeconds, 0, 1);
}

function rotateYaw(direction: Vec3, degrees: number): Vec3 {
  if (Math.abs(degrees) <= 1e-6) return direction.clone().normalize();
  const radians = degrees * Math.PI / 180;
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return new Vec3(
    direction.x * c - direction.z * s,
    direction.y,
    direction.x * s + direction.z * c
  ).normalize();
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

function pointOnSegment(from: Vec3, to: Vec3, distance: number): Vec3 {
  const direction = to.clone().sub(from);
  const length = direction.length();
  if (length <= 1e-8) return from.clone();
  return from.clone().add(direction.mulScalar(distance / length));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
