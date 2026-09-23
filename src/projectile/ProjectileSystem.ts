import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { CpuAgentSystem, CpuFireRequest } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
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
  delayedBurstSeconds: number;
  delayedBurstRadius: number;
  delayedBurstDamage: number;
  delayedBurstPaintRadius: number;
  trailPaintRadius: number;
  trailPaintCooldown: number;
}

interface DelayedBurst {
  source: PaintSource;
  team: Team.A | Team.B;
  point: Vec3;
  seconds: number;
  radius: number;
  damage: number;
  paintRadius: number;
  weaponId: WeaponId;
}

interface DirectRayResult {
  point: Vec3;
  paintHit: SurfaceRayHit | null;
  hitCombat: boolean;
}

export class ProjectileSystem {
  private readonly slots: ProjectileSlot[] = [];
  private readonly delayedBursts: DelayedBurst[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly guardEntity: Entity;
  private readonly delta = new Vec3();
  private readonly queuedCpuShots: CpuFireRequest[] = [];
  private readonly cpuAimDirection = new Vec3();
  private readonly tempForward = new Vec3();
  private fireCooldown = 0;
  private burstCooldown = 0;
  private burstShotsRemaining = 0;
  private splatlingStoredChargeSeconds = 0;
  private rollPaintCooldown = 0;
  private meleeCooldown = 0;
  private chargeSeconds = 0;
  private wasFireHeld = false;
  private dualiesFocusSeconds = 0;
  private guardHp = 100;
  private guardBreakSeconds = 0;
  private readonly currentHumanPosition = new Vec3();
  private readonly currentHumanAimDirection = new Vec3(0, 0, -1);
  private currentHumanTeam: Team.A | Team.B = Team.A;
  private currentHumanDamageable = false;
  private currentHumanGuarding = false;
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
        blastDamage: 0,
        delayedBurstSeconds: 0,
        delayedBurstRadius: 0,
        delayedBurstDamage: 0,
        delayedBurstPaintRadius: 0,
        trailPaintRadius: 0,
        trailPaintCooldown: 0
      });
    }

    this.guardEntity = new Entity('BrellaGuard');
    this.guardEntity.addComponent('render', {
      type: 'box',
      material: this.materialA,
      castShadows: false,
      receiveShadows: false
    });
    this.guardEntity.setLocalScale(1.65, 1.15, 0.08);
    this.guardEntity.enabled = false;
    this.app.root.addChild(this.guardEntity);

    this.syncWeaponStats();
  }

  public get currentPlayerWeapon(): WeaponProfile {
    return weaponProfile(this.playerWeaponId);
  }

  public setPlayerWeapon(id: WeaponId): void {
    if (id === this.playerWeaponId) return;
    this.playerWeaponId = id;
    this.fireCooldown = Math.max(this.fireCooldown, 0.08);
    this.burstCooldown = 0;
    this.burstShotsRemaining = 0;
    this.splatlingStoredChargeSeconds = 0;
    this.rollPaintCooldown = 0;
    this.meleeCooldown = 0;
    this.chargeSeconds = 0;
    this.wasFireHeld = false;
    this.dualiesFocusSeconds = 0;
    this.guardEntity.enabled = false;
    this.stats.playerWeaponSwitches += 1;
    this.syncWeaponStats();
    this.feedback.weaponSwitch();
  }

  public notifyDualieDodge(): void {
    if (this.currentPlayerWeapon.weaponClass !== 'DUALIES') return;
    this.dualiesFocusSeconds = 0.62;
  }

  public getMovementMultiplier(fireHeld: boolean, secondaryHeld: boolean): number {
    const weaponClass = this.currentPlayerWeapon.weaponClass;
    if (weaponClass === 'BRUSH' && fireHeld) return 1.15;
    if (weaponClass === 'ROLLER' && fireHeld) return 0.92;
    if (weaponClass === 'CHARGER' && fireHeld) return 0.66;
    if (weaponClass === 'SPLATLING' && fireHeld) return 0.72;
    if (weaponClass === 'SPLATANA' && fireHeld) return 0.82;
    if (weaponClass === 'BRELLA' && secondaryHeld) return 0.74;
    return 1;
  }

  public solvePlayerLaunchDirection(origin: Vec3, target: Vec3, out = new Vec3()): Vec3 {
    return this.solveLaunchDirection(origin, target, out, this.currentPlayerWeapon);
  }

  public reset(): void {
    for (const slot of this.slots) this.deactivate(slot);
    this.delayedBursts.length = 0;
    this.fireCooldown = 0;
    this.burstCooldown = 0;
    this.burstShotsRemaining = 0;
    this.splatlingStoredChargeSeconds = 0;
    this.rollPaintCooldown = 0;
    this.meleeCooldown = 0;
    this.chargeSeconds = 0;
    this.wasFireHeld = false;
    this.dualiesFocusSeconds = 0;
    this.guardEntity.enabled = false;
    this.guardHp = 100;
    this.guardBreakSeconds = 0;
    this.queuedCpuShots.length = 0;
    this.stats.activeProjectiles = 0;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponFirstRingPercent = 0;
    this.stats.playerWeaponChargeRing = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
    this.stats.playerWeaponGuardHp = 100;
  }

  public queueCpuShot(request: CpuFireRequest): void {
    this.queuedCpuShots.push({
      sourceId: request.sourceId,
      team: request.team,
      origin: request.origin.clone(),
      bodyPosition: request.bodyPosition.clone(),
      target: request.target.clone(),
      weaponId: request.weaponId,
      charge: request.charge,
      action: request.action
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
    playerWeaponEnabled: boolean,
    playerDamageable: boolean
  ): void {
    const profile = this.currentPlayerWeapon;
    const risingFire = fireHeld && !this.wasFireHeld;
    const fallingFire = !fireHeld && this.wasFireHeld;

    this.fireCooldown = Math.max(-0.5, this.fireCooldown - dt);
    this.burstCooldown = Math.max(-0.5, this.burstCooldown - dt);
    this.rollPaintCooldown = Math.max(-0.5, this.rollPaintCooldown - dt);
    this.meleeCooldown = Math.max(-0.5, this.meleeCooldown - dt);
    this.dualiesFocusSeconds = Math.max(0, this.dualiesFocusSeconds - dt);
    this.guardBreakSeconds = Math.max(0, this.guardBreakSeconds - dt);

    const guarding =
      profile.weaponClass === 'BRELLA' &&
      secondaryHeld &&
      this.guardBreakSeconds <= 0 &&
      this.guardHp > 0 &&
      playerWeaponEnabled;

    if (!guarding && this.guardBreakSeconds <= 0) {
      this.guardHp = Math.min(100, this.guardHp + 28 * dt);
    }
    this.stats.playerWeaponGuarding = guarding;
    this.stats.playerWeaponGuardHp = this.guardHp;
    this.currentHumanTeam = team;
    this.currentHumanPosition.copy(playerPosition);
    this.currentHumanAimDirection.copy(aimDirection);
    this.currentHumanDamageable = playerDamageable;
    this.currentHumanGuarding = guarding;
    this.updateGuardVisual(guarding, team, playerPosition, aimDirection);

    if (playerWeaponEnabled) {
      this.updatePlayerWeapon(
        dt,
        profile,
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
      this.splatlingStoredChargeSeconds = 0;
      this.stats.playerWeaponChargePercent = 0;
      this.stats.playerWeaponChargeRing = 0;
      this.stats.playerWeaponAction = 'LOCKED';
    }

    this.feedback.updateChargeVisual(
      profile,
      team,
      muzzlePosition,
      aimDirection,
      chargeFraction(profile, this.chargeSeconds),
      playerDamageable && fireHeld && isChargeWeaponClass(profile.weaponClass)
    );
    this.wasFireHeld = fireHeld;

    this.processDelayedBursts(dt);
    this.spawnQueuedCpuShots(
      team,
      playerPosition,
      playerDamageable,
      guarding,
      aimDirection
    );

    let active = 0;
    for (const slot of this.slots) {
      if (!slot.active) continue;

      slot.previousPosition.copy(slot.position);
      slot.ttl -= dt;
      slot.trailPaintCooldown -= dt;

      if (slot.ttl <= 0) {
        this.finishProjectile(slot, slot.position, null);
        continue;
      }

      const previous = slot.position.clone();
      slot.velocity.y -= slot.gravity * dt;
      this.delta.copy(slot.velocity).mulScalar(dt);
      const next = slot.position.clone().add(this.delta);

      if (slot.trailPaintRadius > 0 && slot.trailPaintCooldown <= 0) {
        this.paintWorldStamp(
          slot.team,
          next,
          slot.trailPaintRadius * 1.15,
          slot.trailPaintRadius * 0.62,
          slot.velocity,
          1.7,
          PaintEventType.MidDroplet,
          slot.sourceKind === 'HUMAN' ? PaintSource.Human : PaintSource.Cpu
        );
        slot.trailPaintCooldown = 0.085;
      }

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
          if (guarding && this.isGuardBlocking(slot, playerPosition, aimDirection)) {
            this.guardHp = Math.max(0, this.guardHp - slot.damage);
            this.stats.playerWeaponGuardBlocks += 1;
            this.stats.playerWeaponGuardHp = this.guardHp;
            if (this.guardHp <= 0) {
              this.guardBreakSeconds = 2.5;
              this.guardEntity.enabled = false;
              this.stats.playerWeaponAction = 'GUARD_BREAK';
            }
          } else {
            this.resources.applyDamage(slot.damage);
            this.stats.cpuPlayerHits += 1;
          }
        }

        this.finishProjectile(slot, combatPoint, null);
        continue;
      }

      if (paintWins) {
        this.enqueueImpact(
          slot.team,
          paintHit,
          slot.paintRadius,
          slot.sourceKind === 'HUMAN' ? PaintSource.Human : PaintSource.Cpu
        );
        this.finishProjectile(slot, paintHit.worldPoint, paintHit);
        continue;
      }

      if (blockerHit) {
        this.finishProjectile(slot, blockerHit.point, null);
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
    this.stats.playerWeaponAction = guarding ? 'GUARD' : 'READY';

    switch (profile.weaponClass) {
      case 'SHOOTER':
        this.updateShooter(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'DUALIES':
        this.updateDualies(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'CHARGER':
        this.updateCharger(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team);
        break;
      case 'BLASTER':
        this.updateBlaster(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'ROLLER':
        this.updateRoller(profile, fireHeld, risingFire, playerPosition, aimDirection, team);
        break;
      case 'BRUSH':
        this.updateBrush(profile, fireHeld, playerPosition, aimDirection, team);
        break;
      case 'SLOSHER':
        this.updateSlosher(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'SPLATLING':
        this.updateSplatling(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team);
        break;
      case 'BRELLA':
        this.updateBrella(profile, fireHeld, guarding, muzzlePosition, aimDirection, team);
        break;
      case 'STRINGER':
        this.updateStringer(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team);
        break;
      case 'SPLATANA':
        this.updateSplatana(dt, profile, fireHeld, fallingFire, playerPosition, muzzlePosition, aimDirection, team);
        break;
    }
  }

  private updateShooter(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) return;
    if (this.fireProjectiles(profile, origin, direction, team, 1, profile.spreadDegrees, 0)) {
      this.fireCooldown += profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'AUTO_FIRE';
    } else {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
  }

  private updateDualies(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) {
      if (this.dualiesFocusSeconds > 0) this.stats.playerWeaponAction = 'POST_ROLL_FOCUS';
      return;
    }

    const focused = this.dualiesFocusSeconds > 0;
    const spread = focused ? 0.65 : profile.spreadDegrees;
    const cadence = focused ? 0.062 : profile.fireIntervalSeconds;
    if (this.fireProjectiles(profile, origin, direction, team, 2, spread, 0)) {
      this.fireCooldown += cadence;
      this.stats.playerWeaponAction = focused ? 'DUAL_FOCUS' : 'DUAL_FIRE';
    } else {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
  }

  private updateCharger(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponAction = 'CHARGING_BEAM';
      return;
    }

    if (fallingFire && this.chargeSeconds >= profile.minChargeSeconds && this.fireCooldown <= 0) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      if (this.fireChargerRay(profile, origin, direction, team, charge)) {
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = charge >= 0.98 ? 'FULL_CHARGE_SHOT' : 'PARTIAL_CHARGE_SHOT';
      }
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  private updateBlaster(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) return;
    if (this.fireProjectiles(profile, origin, direction, team, 1, 0, 0)) {
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'BLAST_SHOT';
    }
  }

  private updateRoller(
    profile: WeaponProfile,
    fireHeld: boolean,
    risingFire: boolean,
    playerPosition: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;

    if (risingFire && this.fireCooldown <= 0) {
      if (this.resources.tryConsumeShotInk(profile.inkCost)) {
        const airborne = !this.stats.playerGrounded;
        this.rollerFlick(profile, playerPosition, direction, team, airborne);
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = airborne ? 'VERTICAL_FLICK' : 'HORIZONTAL_FLICK';
      }
    }

    if (
      fireHeld &&
      this.stats.playerSpeedMetersPerSecond > 0.25 &&
      this.rollPaintCooldown <= 0
    ) {
      if (this.resources.tryConsumeShotInk(profile.rollPaintInkCost)) {
        this.paintWorldStamp(
          team,
          playerPosition,
          profile.rollPaintRadiusMeters * 1.28,
          profile.rollPaintRadiusMeters * 0.72,
          direction,
          0.8,
          PaintEventType.Foot
        );
        if (this.meleeCooldown <= 0) {
          const contact = playerPosition.clone().add(flattened(direction).mulScalar(0.72));
          this.applyMeleeDamage(contact, 0.88, 38, team);
          this.meleeCooldown = 0.18;
        }
        this.rollPaintCooldown = 0.075;
        this.stats.playerWeaponAction = 'ROLLING';
      }
    }
  }

  private updateBrush(
    profile: WeaponProfile,
    fireHeld: boolean,
    playerPosition: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) return;
    if (!this.resources.tryConsumeShotInk(profile.inkCost)) {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      return;
    }

    const forward = flattened(direction);
    const center = playerPosition.clone().add(forward.clone().mulScalar(1.05));
    this.applyMeleeDamage(center, 1.22, 24, team);
    this.paintFan(team, playerPosition, forward, 1.95, 1.35, 5, 0.42, PaintEventType.Impact);
    this.feedback.melee(team, center, profile, 0.82);
    this.fireCooldown = profile.fireIntervalSeconds;
    this.stats.playerWeaponAction = 'BRUSH_SWIPE';
  }

  private updateSlosher(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) return;

    const lobDirection = direction.clone();
    lobDirection.y = Math.max(lobDirection.y, 0.16);
    lobDirection.normalize();

    if (this.fireProjectiles(profile, origin, lobDirection, team, 1, 0, 0, {
      trailPaintRadius: 0.34
    })) {
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'SLOSH';
    }
  }

  private updateSplatling(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (this.burstShotsRemaining > 0) {
      const stage = chargeStageProgress(profile, this.splatlingStoredChargeSeconds);
      const speedMultiplier = lerp(0.55, 1.0, stage.first);
      const spread = lerp(1.8, 0.8, stage.first);
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.full
        ? 'SPIN_BURST_R2'
        : stage.firstReached ? 'SPIN_BURST_R1' : 'SPIN_BURST_PARTIAL';

      if (this.burstCooldown <= 0) {
        if (this.fireProjectiles(profile, origin, direction, team, 1, spread, 0, {
          speedMultiplier
        })) {
          this.burstShotsRemaining -= 1;
          this.burstCooldown += profile.burstIntervalSeconds;
          if (this.burstShotsRemaining <= 0) {
            this.splatlingStoredChargeSeconds = 0;
            this.stats.playerWeaponChargeRing = 0;
          }
        } else {
          this.burstShotsRemaining = 0;
          this.splatlingStoredChargeSeconds = 0;
          this.stats.playerWeaponChargeRing = 0;
        }
      }
      return;
    }

    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.firstReached ? 'SPIN_CHARGE_R2' : 'SPIN_CHARGE_R1';
      return;
    }

    if (fallingFire && this.chargeSeconds >= profile.minChargeSeconds) {
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      const firstRingShots = Math.max(3, Math.round(profile.burstMaxShots * 0.5));
      this.burstShotsRemaining = stage.firstReached
        ? Math.round(lerp(firstRingShots, profile.burstMaxShots, stage.second))
        : Math.max(3, Math.round(firstRingShots * stage.first));
      this.splatlingStoredChargeSeconds = this.chargeSeconds;
      this.burstCooldown = 0;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.full
        ? 'SPIN_RELEASE_R2'
        : stage.firstReached ? 'SPIN_RELEASE_R1' : 'SPIN_RELEASE_PARTIAL';
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  private updateBrella(
    profile: WeaponProfile,
    fireHeld: boolean,
    guarding: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (guarding) {
      this.stats.playerWeaponAction = this.guardBreakSeconds > 0 ? 'GUARD_BREAK' : 'GUARD';
      return;
    }
    if (!fireHeld || this.fireCooldown > 0) return;

    if (this.fireProjectiles(profile, origin, direction, team, profile.pelletCount, profile.spreadDegrees, 0)) {
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'BRELLA_BURST';
    }
  }

  private updateStringer(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.firstReached ? 'STRING_CHARGE_R2' : 'STRING_CHARGE_R1';
      return;
    }

    if (
      fallingFire &&
      this.fireCooldown <= 0 &&
      this.chargeSeconds >= profile.minChargeSeconds
    ) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      const spread = stage.firstReached
        ? lerp(profile.spreadDegrees, 0, stage.second)
        : profile.spreadDegrees;
      const directDamage = lerp(30, 35, stage.first);
      const speedMultiplier = stage.firstReached
        ? lerp(1.0, profile.chargeSpeedMultiplier, stage.second)
        : lerp(0.78, 1.0, stage.first);
      const paintMultiplier = stage.firstReached
        ? lerp(1.0, profile.chargePaintMultiplier, stage.second)
        : lerp(0.88, 1.0, stage.first);
      const inkCost = stage.firstReached
        ? lerp(6.0, 8.5, stage.second)
        : lerp(5.0, 6.0, stage.first);

      if (this.fireProjectiles(profile, origin, direction, team, 3, spread, charge, {
        inkCost,
        damageMultiplier: directDamage / profile.damage,
        speedMultiplier,
        paintMultiplier,
        delayedBurstSeconds: stage.firstReached ? 0.75 : 0,
        delayedBurstRadius: stage.firstReached ? lerp(0.78, 1.02, stage.second) : 0,
        delayedBurstDamage: stage.firstReached ? 30 : 0,
        delayedBurstPaintRadius: stage.firstReached ? lerp(0.65, 0.90, stage.second) : 0
      })) {
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = stage.full
          ? 'EXPLOSIVE_TRISHOT_R2'
          : stage.firstReached ? 'EXPLOSIVE_TRISHOT_R1' : 'TRISHOT';
      }
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponChargeRing = 0;
  }

  private updateSplatana(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    playerPosition: Vec3,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponAction = 'SABER_CHARGE';
      return;
    }

    if (fallingFire && this.fireCooldown <= 0) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      if (this.resources.tryConsumeShotInk(profile.inkCost)) {
        const forward = flattened(direction);
        const center = playerPosition.clone().add(forward.clone().mulScalar(charge >= 0.62 ? 1.15 : 0.92));
        const meleeDamage = charge >= 0.62 ? 95 : 42;
        const meleeRadius = charge >= 0.62 ? 1.05 : 0.82;
        this.applyMeleeDamage(center, meleeRadius, meleeDamage, team);
        this.paintSlash(team, playerPosition, forward, charge);

        const slot = this.slots.find((candidate) => !candidate.active);
        if (slot) {
          this.spawnProjectile(
            slot,
            profile,
            origin,
            direction,
            team,
            profile.speedMetersPerSecond * lerp(1, profile.chargeSpeedMultiplier, charge),
            profile.gravityMetersPerSecond2,
            profile.lifeSeconds,
            profile.visualDiameterMeters * lerp(1, 1.55, charge),
            lerp(profile.damage, profile.damage * 1.65, charge),
            profile.paintRadiusMeters * lerp(1, profile.chargePaintMultiplier, charge),
            0,
            0,
            0,
            0,
            0,
            0,
            0
          );
        }

        this.feedback.melee(team, center, profile, charge >= 0.62 ? 1.45 : 0.95);
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = charge >= 0.62 ? 'CHARGED_SLASH' : 'QUICK_SLASH';
      }
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  private rollerFlick(
    profile: WeaponProfile,
    playerPosition: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    airborne: boolean
  ): void {
    const forward = flattened(direction);
    const center = playerPosition.clone().add(forward.clone().mulScalar(airborne ? 1.65 : 1.25));
    this.applyMeleeDamage(center, airborne ? 1.05 : 1.55, airborne ? 72 : 58, team);

    if (airborne) {
      for (let i = 1; i <= 5; i += 1) {
        const point = playerPosition.clone().add(forward.clone().mulScalar(i * 0.85));
        this.paintWorldStamp(team, point, 0.48, 0.26, forward, 1.2, PaintEventType.Impact);
      }
    } else {
      this.paintFan(team, playerPosition, forward, 2.9, 2.4, 7, 0.58, PaintEventType.Impact);
    }

    this.feedback.melee(team, center, profile, airborne ? 1.15 : 1.45);
  }

  private fireChargerRay(
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    charge: number
  ): boolean {
    if (!this.resources.tryConsumeShotInk(profile.inkCost)) return false;

    const range = lerp(11, 30, charge);
    const damage = lerp(profile.damage * 0.72, profile.damage * profile.chargeDamageMultiplier, charge);
    const paintRadius = profile.paintRadiusMeters * lerp(0.72, profile.chargePaintMultiplier, charge);
    const result = this.resolveDirectRay(origin, direction, range, team, damage);

    if (result.paintHit) {
      this.enqueueChargerLine(team, result.paintHit, direction, paintRadius, charge);
    }

    this.feedback.beam(team, origin, result.point, profile);
    return true;
  }

  private resolveDirectRay(
    origin: Vec3,
    direction: Vec3,
    range: number,
    team: Team.A | Team.B,
    damage: number
  ): DirectRayResult {
    const rayDirection = direction.clone().normalize();
    const end = origin.clone().add(rayDirection.clone().mulScalar(range));

    const paintHit = this.findNearestSurfaceHit(origin, end);
    const blockerHit = this.physics.castStageSegment(origin, end, 'projectile');
    const qaHit = this.combatTargets.findNearestHit(origin, end, team);
    const cpuHit = this.cpuAgents.findNearestCombatHit(origin, end, team);

    const paintWins = paintHit && (
      !blockerHit ||
      paintHit.distance <= blockerHit.distance + GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
    );
    const worldDistance = paintWins
      ? paintHit.distance
      : (blockerHit?.distance ?? range);

    let combatDistance = Number.POSITIVE_INFINITY;
    let combatKind: 'QA' | 'CPU' | null = null;
    if (qaHit && qaHit.distance < combatDistance) {
      combatDistance = qaHit.distance;
      combatKind = 'QA';
    }
    if (cpuHit && cpuHit.distance < combatDistance) {
      combatDistance = cpuHit.distance;
      combatKind = 'CPU';
    }

    if (
      combatKind &&
      combatDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < worldDistance
    ) {
      if (combatKind === 'QA' && qaHit) this.combatTargets.applyProjectileHit(qaHit, damage);
      if (combatKind === 'CPU' && cpuHit) this.cpuAgents.applyProjectileHit(cpuHit, damage);
      return {
        point: origin.clone().add(rayDirection.mulScalar(combatDistance)),
        paintHit: null,
        hitCombat: true
      };
    }

    if (paintWins && paintHit) {
      return { point: paintHit.worldPoint.clone(), paintHit, hitCombat: false };
    }

    if (blockerHit) {
      return { point: blockerHit.point.clone(), paintHit: null, hitCombat: false };
    }

    return { point: end, paintHit: null, hitCombat: false };
  }

  private enqueueChargerLine(
    team: Team.A | Team.B,
    hit: SurfaceRayHit,
    direction: Vec3,
    radius: number,
    charge: number,
    source: PaintSource = PaintSource.Human
  ): void {
    const uDir = direction.dot(hit.surface.uAxis);
    const vDir = direction.dot(hit.surface.vAxis);
    const mag = Math.hypot(uDir, vDir);
    const normalizedU = mag > 1e-5 ? uDir / mag : 1;
    const normalizedV = mag > 1e-5 ? vDir / mag : 0;
    const length = lerp(1.4, 4.2, charge);

    this.coordinator.enqueue({
      source,
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u - normalizedU * length * 0.42,
      centerV: hit.v - normalizedV * length * 0.42,
      radiusU: length * 0.52,
      radiusV: radius * 0.46,
      angle: Math.atan2(normalizedV, normalizedU),
      type: (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0
        ? PaintEventType.WallImpact
        : PaintEventType.Impact,
      strength: 1
    });
  }

  private fireProjectiles(
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    count: number,
    spreadDegrees: number,
    charge: number,
    options?: {
      trailPaintRadius?: number;
      delayedBurstSeconds?: number;
      delayedBurstRadius?: number;
      delayedBurstDamage?: number;
      delayedBurstPaintRadius?: number;
      inkCost?: number;
      damageMultiplier?: number;
      speedMultiplier?: number;
      paintMultiplier?: number;
    }
  ): boolean {
    if (!this.resources.tryConsumeShotInk(options?.inkCost ?? profile.inkCost)) return false;

    const damageMultiplier = options?.damageMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.72, profile.chargeDamageMultiplier, charge)
        : 1);
    const speedMultiplier = options?.speedMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.88, profile.chargeSpeedMultiplier, charge)
        : 1);
    const paintMultiplier = options?.paintMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.78, profile.chargePaintMultiplier, charge)
        : 1);

    let spawned = 0;
    for (let i = 0; i < count; i += 1) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        break;
      }

      const offset =
        count <= 1
          ? 0
          : (i / (count - 1) - 0.5) * spreadDegrees;
      const shotDirection = rotateYaw(direction, offset);

      this.spawnProjectile(
        slot,
        profile,
        origin,
        shotDirection,
        team,
        profile.speedMetersPerSecond * speedMultiplier,
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * (1 + charge * 0.18),
        profile.damage * damageMultiplier,
        profile.paintRadiusMeters * paintMultiplier,
        profile.blastRadiusMeters,
        profile.blastDamage,
        options?.trailPaintRadius ?? 0,
        options?.delayedBurstSeconds ?? 0,
        options?.delayedBurstRadius ?? 0,
        options?.delayedBurstDamage ?? 0,
        options?.delayedBurstPaintRadius ?? 0
      );
      spawned += 1;
    }

    if (spawned > 0) {
      this.feedback.shot(team, origin, profile, true);
      return true;
    }
    return false;
  }

  private spawnQueuedCpuShots(
    humanTeam: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean,
    guarding: boolean,
    playerAimDirection: Vec3
  ): void {
    if (this.queuedCpuShots.length === 0) return;

    for (const request of this.queuedCpuShots) {
      const profile = weaponProfile(request.weaponId);

      if (profile.weaponClass === 'CHARGER') {
        this.fireCpuChargerRay(
          request,
          profile,
          humanTeam,
          playerPosition,
          playerDamageable,
          guarding,
          playerAimDirection
        );
        continue;
      }

      if (request.action === 'ROLLER_FLICK') {
        this.executeCpuRollerFlick(request, profile);
        continue;
      }
      if (request.action === 'ROLLER_ROLL') {
        this.executeCpuRollerRoll(request, profile);
        continue;
      }
      if (request.action === 'BRUSH_SWIPE') {
        this.executeCpuBrushSwipe(request, profile);
        continue;
      }
      if (request.action === 'STRINGER_RELEASE') {
        this.executeCpuStringerRelease(request, profile);
        continue;
      }
      if (request.action === 'SPLATANA_RELEASE') {
        this.executeCpuSplatanaRelease(request, profile);
        continue;
      }

      this.solveLaunchDirection(
        request.origin,
        request.target,
        this.cpuAimDirection,
        profile
      );
      if (this.cpuAimDirection.lengthSq() <= 1e-8) continue;

      let direction = this.cpuAimDirection.clone();
      let count = 1;
      let spread = 0;
      let trailPaintRadius = 0;
      let speedMultiplier = 1;

      if (profile.weaponClass === 'DUALIES') {
        count = 2;
        spread = profile.spreadDegrees;
      } else if (
        profile.weaponClass === 'BRELLA' ||
        request.action === 'BRELLA_BURST'
      ) {
        count = profile.pelletCount;
        spread = profile.spreadDegrees;
      } else if (profile.weaponClass === 'SLOSHER') {
        direction.y = Math.max(direction.y, 0.16);
        direction.normalize();
        trailPaintRadius = 0.34;
      } else if (profile.weaponClass === 'SPLATLING') {
        spread = 0.8;
        speedMultiplier = 1.0;
      }

      let spawned = 0;
      for (let i = 0; i < count; i += 1) {
        const slot = this.slots.find((candidate) => !candidate.active);
        if (!slot) {
          this.stats.projectilePoolDrops += 1;
          break;
        }

        const offset =
          count <= 1
            ? 0
            : (i / (count - 1) - 0.5) * spread;
        const shotDirection = rotateYaw(direction, offset);

        this.spawnProjectile(
          slot,
          profile,
          request.origin,
          shotDirection,
          request.team,
          profile.speedMetersPerSecond * speedMultiplier,
          profile.gravityMetersPerSecond2,
          profile.lifeSeconds,
          profile.visualDiameterMeters,
          profile.damage,
          profile.paintRadiusMeters,
          profile.blastRadiusMeters,
          profile.blastDamage,
          trailPaintRadius,
          0,
          0,
          0,
          0,
          'CPU',
          request.sourceId
        );
        spawned += 1;
      }

      if (spawned > 0) {
        this.feedback.shot(request.team, request.origin, profile, false);
      }
    }

    this.queuedCpuShots.length = 0;
  }

  private executeCpuRollerFlick(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(1.25));

    this.applyMeleeDamage(center, 1.55, 58, request.team);
    this.paintFan(
      request.team,
      request.bodyPosition,
      forward,
      2.9,
      2.4,
      7,
      0.58,
      PaintEventType.Impact,
      PaintSource.Cpu
    );
    this.feedback.melee(request.team, center, profile, 1.45);
  }

  private executeCpuRollerRoll(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    this.paintWorldStamp(
      request.team,
      request.bodyPosition,
      profile.rollPaintRadiusMeters * 1.28,
      profile.rollPaintRadiusMeters * 0.72,
      forward,
      0.8,
      PaintEventType.Foot,
      PaintSource.Cpu
    );
    const contact = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(0.72));
    this.applyMeleeDamage(contact, 0.88, 38, request.team);
  }

  private executeCpuBrushSwipe(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(1.05));

    this.applyMeleeDamage(center, 1.22, 24, request.team);
    this.paintFan(
      request.team,
      request.bodyPosition,
      forward,
      1.95,
      1.35,
      5,
      0.42,
      PaintEventType.Impact,
      PaintSource.Cpu
    );
    this.feedback.melee(request.team, center, profile, 0.82);
  }

  private executeCpuStringerRelease(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    this.solveLaunchDirection(
      request.origin,
      request.target,
      this.cpuAimDirection,
      profile
    );
    if (this.cpuAimDirection.lengthSq() <= 1e-8) return;

    const charge = clamp01(request.charge);
    const chargeSeconds = charge * profile.chargeSeconds;
    const stage = chargeStageProgress(profile, chargeSeconds);
    const spread = stage.firstReached
      ? lerp(profile.spreadDegrees, 0, stage.second)
      : profile.spreadDegrees;
    const directDamage = lerp(30, 35, stage.first);
    const speedMultiplier = stage.firstReached
      ? lerp(1.0, profile.chargeSpeedMultiplier, stage.second)
      : lerp(0.78, 1.0, stage.first);
    const paintMultiplier = stage.firstReached
      ? lerp(1.0, profile.chargePaintMultiplier, stage.second)
      : lerp(0.88, 1.0, stage.first);

    let spawned = 0;
    for (let i = 0; i < 3; i += 1) {
      const slot = this.slots.find((candidate) => !candidate.active);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        break;
      }

      const offset = (i / 2 - 0.5) * spread;
      const direction = rotateYaw(this.cpuAimDirection, offset);
      this.spawnProjectile(
        slot,
        profile,
        request.origin,
        direction,
        request.team,
        profile.speedMetersPerSecond * speedMultiplier,
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * (1 + charge * 0.18),
        directDamage,
        profile.paintRadiusMeters * paintMultiplier,
        0,
        0,
        0,
        stage.firstReached ? 0.75 : 0,
        stage.firstReached ? lerp(0.78, 1.02, stage.second) : 0,
        stage.firstReached ? 30 : 0,
        stage.firstReached ? lerp(0.65, 0.90, stage.second) : 0,
        'CPU',
        request.sourceId
      );
      spawned += 1;
    }

    if (spawned > 0) {
      this.feedback.shot(request.team, request.origin, profile, false);
    }
  }

  private executeCpuSplatanaRelease(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const charge = clamp01(request.charge);
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone().add(
      forward.clone().mulScalar(charge >= 0.62 ? 1.15 : 0.92)
    );
    const meleeDamage = charge >= 0.62 ? 95 : 42;
    const meleeRadius = charge >= 0.62 ? 1.05 : 0.82;

    this.applyMeleeDamage(
      center,
      meleeRadius,
      meleeDamage,
      request.team
    );
    this.paintSlash(
      request.team,
      request.bodyPosition,
      forward,
      charge,
      PaintSource.Cpu
    );

    this.solveLaunchDirection(
      request.origin,
      request.target,
      this.cpuAimDirection,
      profile
    );
    const slot = this.slots.find((candidate) => !candidate.active);
    if (slot && this.cpuAimDirection.lengthSq() > 1e-8) {
      this.spawnProjectile(
        slot,
        profile,
        request.origin,
        this.cpuAimDirection,
        request.team,
        profile.speedMetersPerSecond *
          lerp(1, profile.chargeSpeedMultiplier, charge),
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * lerp(1, 1.55, charge),
        lerp(profile.damage, profile.damage * 1.65, charge),
        profile.paintRadiusMeters *
          lerp(1, profile.chargePaintMultiplier, charge),
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'CPU',
        request.sourceId
      );
    } else if (!slot) {
      this.stats.projectilePoolDrops += 1;
    }

    this.feedback.melee(
      request.team,
      center,
      profile,
      charge >= 0.62 ? 1.45 : 0.95
    );
  }

  private fireCpuChargerRay(
    request: CpuFireRequest,
    profile: WeaponProfile,
    humanTeam: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean,
    guarding: boolean,
    playerAimDirection: Vec3
  ): void {
    const direction = request.target.clone().sub(request.origin);
    if (direction.lengthSq() <= 1e-8) return;
    direction.normalize();

    const charge = Math.max(0, Math.min(1, request.charge));
    const range = lerp(11, 30, charge);
    const damage = lerp(
      profile.damage * 0.72,
      profile.damage * profile.chargeDamageMultiplier,
      charge
    );
    const paintRadius =
      profile.paintRadiusMeters *
      lerp(0.72, profile.chargePaintMultiplier, charge);
    const end = request.origin.clone().add(direction.clone().mulScalar(range));

    const paintHit = this.findNearestSurfaceHit(request.origin, end);
    const blockerHit = this.physics.castStageSegment(
      request.origin,
      end,
      'projectile'
    );
    const cpuHit = this.cpuAgents.findNearestCombatHit(
      request.origin,
      end,
      request.team
    );
    const playerHitDistance = (
      playerDamageable &&
      request.team !== humanTeam
    )
      ? segmentSphereDistance(
          request.origin,
          end,
          playerPosition,
          GAME_CONFIG.cpu.playerHitRadiusMeters
        )
      : null;

    const paintWins = paintHit && (
      !blockerHit ||
      paintHit.distance <=
        blockerHit.distance +
          GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
    );
    const worldDistance = paintWins
      ? paintHit.distance
      : (blockerHit?.distance ?? range);

    let combatDistance = Number.POSITIVE_INFINITY;
    let combatKind: 'CPU' | 'PLAYER' | null = null;
    if (cpuHit && cpuHit.distance < combatDistance) {
      combatDistance = cpuHit.distance;
      combatKind = 'CPU';
    }
    if (
      playerHitDistance !== null &&
      playerHitDistance < combatDistance
    ) {
      combatDistance = playerHitDistance;
      combatKind = 'PLAYER';
    }

    let endPoint = end;
    let linePaintHit: SurfaceRayHit | null = null;

    if (
      combatKind &&
      combatDistance +
        GAME_CONFIG.combat.hitPriorityEpsilonMeters <
        worldDistance
    ) {
      endPoint = pointOnSegment(
        request.origin,
        end,
        combatDistance
      );
      if (combatKind === 'CPU' && cpuHit) {
        this.cpuAgents.applyProjectileHit(cpuHit, damage);
      } else if (combatKind === 'PLAYER') {
        if (
          guarding &&
          this.isGuardBlockingPoint(
            request.origin,
            playerPosition,
            playerAimDirection
          )
        ) {
          this.guardHp = Math.max(0, this.guardHp - damage);
          this.stats.playerWeaponGuardBlocks += 1;
          this.stats.playerWeaponGuardHp = this.guardHp;
          if (this.guardHp <= 0) {
            this.guardBreakSeconds = 2.5;
            this.guardEntity.enabled = false;
            this.stats.playerWeaponAction = 'GUARD_BREAK';
          }
        } else {
          this.resources.applyDamage(damage);
          this.stats.cpuPlayerHits += 1;
        }
      }
    } else if (paintWins && paintHit) {
      endPoint = paintHit.worldPoint.clone();
      linePaintHit = paintHit;
    } else if (blockerHit) {
      endPoint = blockerHit.point.clone();
    }

    if (linePaintHit) {
      this.enqueueChargerLine(
        request.team,
        linePaintHit,
        direction,
        paintRadius,
        charge,
        PaintSource.Cpu
      );
    }

    this.feedback.beam(
      request.team,
      request.origin,
      endPoint,
      profile
    );
  }

  private spawnProjectile(
    slot: ProjectileSlot,
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    speed: number,
    gravity: number,
    life: number,
    visualDiameter: number,
    damage: number,
    paintRadius: number,
    blastRadius: number,
    blastDamage: number,
    trailPaintRadius: number,
    delayedBurstSeconds: number,
    delayedBurstRadius: number,
    delayedBurstDamage: number,
    delayedBurstPaintRadius: number,
    sourceKind: 'HUMAN' | 'CPU' = 'HUMAN',
    sourceId = 'human'
  ): void {
    slot.active = true;
    slot.ttl = life;
    slot.team = team;
    slot.sourceKind = sourceKind;
    slot.sourceId = sourceId;
    slot.weaponId = profile.id;
    slot.gravity = gravity;
    slot.damage = damage;
    slot.paintRadius = paintRadius;
    slot.blastRadius = blastRadius;
    slot.blastDamage = blastDamage;
    slot.delayedBurstSeconds = delayedBurstSeconds;
    slot.delayedBurstRadius = delayedBurstRadius;
    slot.delayedBurstDamage = delayedBurstDamage;
    slot.delayedBurstPaintRadius = delayedBurstPaintRadius;
    slot.trailPaintRadius = trailPaintRadius;
    slot.trailPaintCooldown = 0;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(direction).normalize().mulScalar(speed);

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) meshInstance.material = team === Team.A ? this.materialA : this.materialB;

    slot.entity.setLocalScale(visualDiameter, visualDiameter, visualDiameter);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;
  }

  private finishProjectile(
    slot: ProjectileSlot,
    point: Vec3,
    paintHit: SurfaceRayHit | null
  ): void {
    const profile = weaponProfile(slot.weaponId);
    const paintSource =
      slot.sourceKind === 'HUMAN' ? PaintSource.Human : PaintSource.Cpu;

    if (slot.blastRadius > 0 && slot.blastDamage > 0) {
      this.applyAreaDamage(point, slot.blastRadius, slot.blastDamage, slot.team);
      this.paintWorldStamp(
        slot.team,
        point,
        slot.blastRadius * 0.72,
        slot.blastRadius * 0.72,
        slot.velocity,
        1.2,
        PaintEventType.Bomb,
        paintSource
      );
    }

    if (slot.delayedBurstSeconds > 0) {
      this.stats.stringerFuses += 1;
      this.feedback.stringerFuse(
        slot.team,
        point,
        slot.delayedBurstSeconds
      );
      this.delayedBursts.push({
        source: paintSource,
        team: slot.team,
        point: point.clone(),
        seconds: slot.delayedBurstSeconds,
        radius: slot.delayedBurstRadius,
        damage: slot.delayedBurstDamage,
        paintRadius: slot.delayedBurstPaintRadius,
        weaponId: slot.weaponId
      });
    }

    if (!paintHit && slot.paintRadius > 0 && slot.sourceKind === 'HUMAN') {
      this.paintWorldStamp(
        slot.team,
        point,
        slot.paintRadius * 0.9,
        slot.paintRadius * 0.7,
        slot.velocity,
        0.52,
        PaintEventType.Impact,
        paintSource
      );
    }

    this.feedback.impact(slot.team, point, profile);
    this.stats.projectileImpacts += 1;
    this.deactivate(slot);
  }

  private processDelayedBursts(dt: number): void {
    for (let i = this.delayedBursts.length - 1; i >= 0; i -= 1) {
      const burst = this.delayedBursts[i]!;
      burst.seconds -= dt;
      if (burst.seconds > 0) continue;

      this.applyAreaDamage(burst.point, burst.radius, burst.damage, burst.team);
      this.paintWorldStamp(
        burst.team,
        burst.point,
        burst.paintRadius,
        burst.paintRadius,
        new Vec3(1, 0, 0),
        1.0,
        PaintEventType.Bomb,
        burst.source
      );
      this.feedback.stringerBurst(
        burst.team,
        burst.point,
        weaponProfile(burst.weaponId),
        burst.radius
      );
      this.stats.stringerBursts += 1;
      this.delayedBursts.splice(i, 1);
    }
  }

  private applyAreaDamage(
    point: Vec3,
    radius: number,
    damage: number,
    team: Team.A | Team.B
  ): void {
    this.cpuAgents.applyAreaDamage(point, radius, damage, team);
    this.combatTargets.applyAreaDamage(point, radius, damage, team);

    if (
      !this.currentHumanDamageable ||
      team === this.currentHumanTeam ||
      radius <= 0 ||
      damage <= 0
    ) {
      return;
    }

    const dx = this.currentHumanPosition.x - point.x;
    const dy = this.currentHumanPosition.y + 0.68 - point.y;
    const dz = this.currentHumanPosition.z - point.z;
    if (dx * dx + dy * dy + dz * dz > radius * radius) return;

    if (
      this.currentHumanGuarding &&
      this.isGuardBlockingPoint(
        point,
        this.currentHumanPosition,
        this.currentHumanAimDirection
      )
    ) {
      this.guardHp = Math.max(0, this.guardHp - damage);
      this.stats.playerWeaponGuardBlocks += 1;
      this.stats.playerWeaponGuardHp = this.guardHp;
      if (this.guardHp <= 0) {
        this.guardBreakSeconds = 2.5;
        this.guardEntity.enabled = false;
        this.stats.playerWeaponAction = 'GUARD_BREAK';
      }
      return;
    }

    this.resources.applyDamage(damage);
    this.stats.cpuPlayerHits += 1;
  }

  private applyMeleeDamage(
    point: Vec3,
    radius: number,
    damage: number,
    team: Team.A | Team.B
  ): void {
    this.applyAreaDamage(point, radius, damage, team);
  }

  private paintFan(
    team: Team.A | Team.B,
    origin: Vec3,
    forward: Vec3,
    distance: number,
    width: number,
    count: number,
    radius: number,
    type: PaintEventType,
    source: PaintSource = PaintSource.Human
  ): void {
    const right = new Vec3(-forward.z, 0, forward.x);
    for (let i = 0; i < count; i += 1) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const lateral = (t - 0.5) * width;
      const point = origin.clone()
        .add(forward.clone().mulScalar(distance * (0.72 + 0.18 * Math.abs(t - 0.5))))
        .add(right.clone().mulScalar(lateral));
      this.paintWorldStamp(
        team,
        point,
        radius,
        radius * 0.72,
        forward,
        0.85,
        type,
        source
      );
    }
  }

  private paintSlash(
    team: Team.A | Team.B,
    origin: Vec3,
    forward: Vec3,
    charge: number,
    source: PaintSource = PaintSource.Human
  ): void {
    const length = lerp(1.8, 3.6, charge);
    const width = lerp(0.55, 0.9, charge);
    for (let i = 1; i <= 4; i += 1) {
      const point = origin.clone().add(forward.clone().mulScalar(length * i / 4));
      this.paintWorldStamp(
        team,
        point,
        width,
        width * 0.42,
        forward,
        0.9,
        PaintEventType.Impact,
        source
      );
    }
  }

  private paintWorldStamp(
    team: Team.A | Team.B,
    worldPoint: Vec3,
    radiusU: number,
    radiusV: number,
    worldDirection: Vec3,
    maxPlaneDistance: number,
    type: PaintEventType,
    source: PaintSource = PaintSource.Human
  ): boolean {
    let best:
      | {
          surface: PaintSurface;
          u: number;
          v: number;
          planeDistance: number;
        }
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

    const dir = worldDirection.lengthSq() > 1e-8
      ? worldDirection.clone().normalize()
      : new Vec3(1, 0, 0);
    const du = dir.dot(best.surface.uAxis);
    const dv = dir.dot(best.surface.vAxis);

    this.coordinator.enqueue({
      source,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU,
      radiusV,
      angle: Math.atan2(dv, du),
      type,
      strength: 1
    });
    return true;
  }

  private updateGuardVisual(
    guarding: boolean,
    team: Team.A | Team.B,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): void {
    this.guardEntity.enabled = guarding;
    if (!guarding) return;

    const forward = flattened(aimDirection);
    const point = playerPosition.clone().add(forward.clone().mulScalar(0.9));
    point.y += 0.48;
    this.guardEntity.setPosition(point);
    const yaw = Math.atan2(forward.x, forward.z) * 180 / Math.PI;
    this.guardEntity.setLocalEulerAngles(0, yaw, 0);

    const meshInstance = this.guardEntity.render?.meshInstances[0];
    if (meshInstance) {
      meshInstance.material = team === Team.A ? this.materialA : this.materialB;
    }
  }

  private isGuardBlocking(
    slot: ProjectileSlot,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): boolean {
    return this.isGuardBlockingPoint(
      slot.position,
      playerPosition,
      aimDirection
    );
  }

  private isGuardBlockingPoint(
    attackerPoint: Vec3,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): boolean {
    if (this.guardBreakSeconds > 0 || this.guardHp <= 0) return false;
    const forward = flattened(aimDirection);
    const toProjectile = attackerPoint.clone().sub(playerPosition);
    toProjectile.y = 0;
    if (toProjectile.lengthSq() <= 1e-8) return true;
    toProjectile.normalize();
    return forward.dot(toProjectile) > -0.10;
  }

  private syncWeaponStats(): void {
    const profile = this.currentPlayerWeapon;
    this.stats.playerWeaponId = profile.id;
    this.stats.playerWeaponName = profile.displayName;
    this.stats.playerWeaponClass = profile.classLabel;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponFirstRingPercent =
      profile.firstChargeSeconds > 0 && profile.chargeSeconds > 0
        ? profile.firstChargeSeconds / profile.chargeSeconds * 100
        : 0;
    this.stats.playerWeaponChargeRing = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
    this.stats.playerWeaponGuardHp = this.guardHp;
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
    paintRadius: number,
    source: PaintSource
  ): void {
    const isWall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
    const request: PaintRequest = {
      source,
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

function chargeStageProgress(
  profile: WeaponProfile,
  seconds: number
): {
  first: number;
  second: number;
  firstReached: boolean;
  full: boolean;
} {
  const fullSeconds = Math.max(profile.chargeSeconds, 1e-6);
  const firstSeconds = profile.firstChargeSeconds > 0
    ? Math.min(profile.firstChargeSeconds, fullSeconds)
    : fullSeconds;
  const minSeconds = Math.min(profile.minChargeSeconds, firstSeconds);
  const first = clamp(
    (seconds - minSeconds) / Math.max(firstSeconds - minSeconds, 1e-6),
    0,
    1
  );
  const second = firstSeconds < fullSeconds
    ? clamp((seconds - firstSeconds) / (fullSeconds - firstSeconds), 0, 1)
    : 0;
  return {
    first,
    second,
    firstReached: seconds + 1e-6 >= firstSeconds,
    full: seconds + 1e-6 >= fullSeconds
  };
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

function flattened(direction: Vec3): Vec3 {
  const result = new Vec3(direction.x, 0, direction.z);
  return result.lengthSq() > 1e-8 ? result.normalize() : result.set(0, 0, -1);
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


function isChargeWeaponClass(weaponClass: WeaponProfile['weaponClass']): boolean {
  return weaponClass === 'CHARGER' ||
    weaponClass === 'SPLATLING' ||
    weaponClass === 'STRINGER' ||
    weaponClass === 'SPLATANA';
}
