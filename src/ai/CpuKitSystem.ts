import {
  Color,
  Entity,
  StandardMaterial,
  Vec3,
  type AppBase
} from 'playcanvas';
import type { CpuKitRequest } from '../ai/CpuAgentSystem';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import type { PaintSurface, SurfaceRayHit } from '../ink/PaintSurface';
import {
  PaintEventType,
  PaintSource,
  SurfaceFlags,
  Team
} from '../ink/types';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import type { ProjectileSystem } from '../projectile/ProjectileSystem';
import {
  subWeaponProfile,
  type SpecialWeaponId,
  type SubWeaponId,
  type SubWeaponProfile
} from '../weapons/WeaponKitCatalog';

interface CpuBombSlot {
  active: boolean;
  landed: boolean;
  actorId: string;
  subId: SubWeaponId;
  team: Team.A | Team.B;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  ttl: number;
  fuseSeconds: number;
  entity: Entity;
}

interface CpuScheduledStrike {
  actorId: string;
  team: Team.A | Team.B;
  point: Vec3;
  seconds: number;
}

interface CpuDriftStorm {
  actorId: string;
  team: Team.A | Team.B;
  position: Vec3;
  direction: Vec3;
  seconds: number;
  pulseCooldown: number;
}

export class CpuKitSystem {
  private readonly bombs: CpuBombSlot[] = [];
  private readonly scheduledStrikes: CpuScheduledStrike[] = [];
  private readonly storms: CpuDriftStorm[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly delta = new Vec3();

  public constructor(
    app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly projectiles: ProjectileSystem,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats
  ) {
    this.materialA = makeCpuKitMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeCpuKitMaterial(GAME_CONFIG.visual.teamB);

    for (let i = 0; i < 16; i += 1) {
      const entity = new Entity(`CpuSubWeapon:${i}`);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.materialA,
        castShadows: false,
        receiveShadows: false
      });
      entity.enabled = false;
      app.root.addChild(entity);

      this.bombs.push({
        active: false,
        landed: false,
        actorId: '-',
        subId: 'pulse-bomb',
        team: Team.A,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        ttl: 0,
        fuseSeconds: 0,
        entity
      });
    }

    this.syncStats();
  }

  public queue(request: CpuKitRequest): boolean {
    if (request.kind === 'SUB') {
      return this.spawnSub(request);
    }

    this.activateSpecial(
      request.sourceId,
      request.team,
      request.specialId,
      request.position,
      request.target,
      request.direction
    );
    return true;
  }

  public fixedUpdate(dt: number): void {
    this.updateBombs(dt);
    this.updateTripleStrikes(dt);
    this.updateDriftStorms(dt);
    this.syncStats();
  }

  public render(alpha: number): void {
    const t = clamp01(alpha);
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      if (slot.landed) {
        slot.entity.setPosition(slot.position);
        continue;
      }
      slot.entity.setPosition(
        lerp(slot.previousPosition.x, slot.position.x, t),
        lerp(slot.previousPosition.y, slot.position.y, t),
        lerp(slot.previousPosition.z, slot.position.z, t)
      );
    }
  }

  public reset(): void {
    for (const slot of this.bombs) this.deactivateBomb(slot);
    this.scheduledStrikes.length = 0;
    this.storms.length = 0;
    this.syncStats();
  }

  private spawnSub(request: Extract<CpuKitRequest, { kind: 'SUB' }>): boolean {
    const slot = this.bombs.find((candidate) => !candidate.active);
    if (!slot) {
      this.stats.cpuKitPoolDrops += 1;
      return false;
    }

    const profile = subWeaponProfile(request.subId);
    const aim = request.direction.clone();
    if (aim.lengthSq() <= 1e-8) {
      aim.copy(request.target).sub(request.position);
    }
    if (aim.lengthSq() <= 1e-8) aim.set(0, 0.15, -1);
    aim.normalize();

    const origin = request.position.clone();
    origin.y += GAME_CONFIG.cpu.muzzleHeightMeters;

    slot.active = true;
    slot.landed = false;
    slot.actorId = request.sourceId;
    slot.subId = request.subId;
    slot.team = request.team;
    slot.ttl = profile.maxFlightSeconds;
    slot.fuseSeconds = profile.fuseSeconds;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(aim).mulScalar(profile.throwSpeedMetersPerSecond);
    slot.velocity.y += profile.upwardBoostMetersPerSecond;

    const mesh = slot.entity.render?.meshInstances[0];
    if (mesh) {
      mesh.material = request.team === Team.A
        ? this.materialA
        : this.materialB;
    }
    const d = profile.visualDiameterMeters;
    slot.entity.setLocalScale(d, d, d);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;

    this.feedback.subThrow(request.team, origin);
    return true;
  }

  private updateBombs(dt: number): void {
    for (const slot of this.bombs) {
      if (!slot.active) continue;
      const profile = subWeaponProfile(slot.subId);

      slot.previousPosition.copy(slot.position);

      if (slot.landed) {
        slot.fuseSeconds = Math.max(0, slot.fuseSeconds - dt);
        if (slot.fuseSeconds <= 0) this.explodeBomb(slot, profile);
        continue;
      }

      slot.ttl -= dt;
      if (slot.ttl <= 0) {
        this.explodeBomb(slot, profile);
        continue;
      }

      slot.velocity.y -= profile.gravityMetersPerSecond2 * dt;
      this.delta.copy(slot.velocity).mulScalar(dt);
      const next = slot.position.clone().add(this.delta);

      const paintHit = this.findNearestSurfaceHit(slot.position, next);
      const blockerHit = this.physics.castStageSegment(
        slot.position,
        next,
        'projectile'
      );
      const paintWins = paintHit && (
        !blockerHit ||
        paintHit.distance <=
          blockerHit.distance +
          GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters
      );

      if (paintWins && paintHit) {
        this.onBombContact(slot, profile, paintHit.worldPoint);
        continue;
      }
      if (blockerHit) {
        this.onBombContact(slot, profile, blockerHit.point);
        continue;
      }

      slot.position.copy(next);
      slot.entity.setPosition(slot.position);
    }
  }

  private onBombContact(
    slot: CpuBombSlot,
    profile: SubWeaponProfile,
    point: Vec3
  ): void {
    slot.position.copy(point);
    slot.previousPosition.copy(point);
    slot.velocity.set(0, 0, 0);

    if (profile.detonateOnImpact) {
      this.explodeBomb(slot, profile);
      return;
    }

    slot.landed = true;
    slot.entity.setPosition(point);
    this.feedback.subFuse(slot.team, point, slot.fuseSeconds);
  }

  private explodeBomb(
    slot: CpuBombSlot,
    profile: SubWeaponProfile
  ): void {
    this.projectiles.applyExternalAreaDamage(
      slot.position,
      profile.outerDamageRadiusMeters,
      profile.outerDamage,
      slot.team
    );

    if (
      profile.innerExtraDamage > 0 &&
      profile.innerDamageRadiusMeters > 0
    ) {
      this.projectiles.applyExternalAreaDamage(
        slot.position,
        profile.innerDamageRadiusMeters,
        profile.innerExtraDamage,
        slot.team
      );
    }

    this.paintRadial(
      slot.actorId,
      slot.team,
      slot.position,
      Math.max(0.42, profile.paintRadiusMeters * 0.52),
      profile.paintRadiusMeters * 0.58,
      profile.paintRadiusMeters < 1.6 ? 6 : 8,
      PaintEventType.Bomb,
      true
    );
    this.feedback.subBurst(
      slot.team,
      slot.position,
      profile.paintRadiusMeters
    );
    this.stats.cpuSubExplosions += 1;
    this.deactivateBomb(slot);
  }

  private activateSpecial(
    actorId: string,
    team: Team.A | Team.B,
    specialId: SpecialWeaponId,
    position: Vec3,
    target: Vec3,
    direction: Vec3
  ): void {
    switch (specialId) {
      case 'turf-pulse':
        this.activateTurfPulse(actorId, team, position);
        return;
      case 'triple-strike':
        this.activateTripleStrike(actorId, team, target, direction);
        return;
      case 'drift-storm':
        this.activateDriftStorm(actorId, team, position, direction);
        return;
    }
  }

  private activateTurfPulse(
    actorId: string,
    team: Team.A | Team.B,
    position: Vec3
  ): void {
    this.projectiles.applyExternalAreaDamage(
      position,
      GAME_CONFIG.special.pulseDamageRadiusMeters,
      GAME_CONFIG.special.pulseDamage,
      team
    );
    this.paintRadial(
      actorId,
      team,
      position,
      GAME_CONFIG.special.pulsePaintRadiusMeters,
      GAME_CONFIG.special.pulseRingRadiusMeters,
      12,
      PaintEventType.Special,
      false
    );
    this.feedback.specialBurst(
      team,
      position,
      GAME_CONFIG.special.pulseRingRadiusMeters
    );
  }

  private activateTripleStrike(
    actorId: string,
    team: Team.A | Team.B,
    target: Vec3,
    direction: Vec3
  ): void {
    const right = new Vec3(direction.z, 0, -direction.x);
    if (right.lengthSq() <= 1e-6) right.set(1, 0, 0);
    else right.normalize();

    const offsets = [-1.65, 0, 1.65] as const;
    for (let i = 0; i < offsets.length; i += 1) {
      this.scheduledStrikes.push({
        actorId,
        team,
        point: target.clone().add(
          right.clone().mulScalar(offsets[i]!)
        ),
        seconds: 0.72 + i * 0.16
      });
    }
    this.feedback.specialBurst(team, target, 0.72);
  }

  private activateDriftStorm(
    actorId: string,
    team: Team.A | Team.B,
    position: Vec3,
    aimDirection: Vec3
  ): void {
    const direction = new Vec3(
      aimDirection.x,
      0,
      aimDirection.z
    );
    if (direction.lengthSq() <= 1e-6) direction.set(0, 0, -1);
    else direction.normalize();

    const start = position.clone().add(
      direction.clone().mulScalar(1.1)
    );
    this.storms.push({
      actorId,
      team,
      position: start,
      direction,
      seconds: 4.8,
      pulseCooldown: 0
    });
    this.feedback.specialBurst(team, start, 1.15);
  }

  private updateTripleStrikes(dt: number): void {
    for (let i = this.scheduledStrikes.length - 1; i >= 0; i -= 1) {
      const strike = this.scheduledStrikes[i]!;
      strike.seconds -= dt;
      if (strike.seconds > 0) continue;

      this.projectiles.applyExternalAreaDamage(
        strike.point,
        2.15,
        62,
        strike.team
      );
      this.paintRadial(
        strike.actorId,
        strike.team,
        strike.point,
        0.92,
        1.85,
        10,
        PaintEventType.Special,
        false
      );
      this.feedback.specialBurst(
        strike.team,
        strike.point,
        1.85
      );
      this.scheduledStrikes.splice(i, 1);
    }
  }

  private updateDriftStorms(dt: number): void {
    for (let i = this.storms.length - 1; i >= 0; i -= 1) {
      const storm = this.storms[i]!;
      storm.seconds -= dt;
      storm.pulseCooldown -= dt;
      storm.position.add(
        storm.direction.clone().mulScalar(1.45 * dt)
      );

      if (storm.pulseCooldown <= 0) {
        this.projectiles.applyExternalAreaDamage(
          storm.position,
          1.85,
          16,
          storm.team
        );
        this.paintRadial(
          storm.actorId,
          storm.team,
          storm.position,
          0.62,
          1.25,
          8,
          PaintEventType.Special,
          false
        );
        storm.pulseCooldown += 0.38;
      }

      if (storm.seconds <= 0) {
        this.feedback.specialBurst(
          storm.team,
          storm.position,
          1.35
        );
        this.storms.splice(i, 1);
      }
    }
  }

  private paintRadial(
    actorId: string,
    team: Team.A | Team.B,
    center: Vec3,
    paintRadius: number,
    ringRadius: number,
    count: number,
    type: PaintEventType,
    gaugeEligible: boolean
  ): void {
    this.paintWorldStamp(
      actorId,
      team,
      center,
      paintRadius,
      2.0,
      type,
      gaugeEligible
    );

    for (let i = 0; i < count; i += 1) {
      const angle = i * Math.PI * 2 / count;
      const point = center.clone().add(new Vec3(
        Math.cos(angle) * ringRadius,
        0,
        Math.sin(angle) * ringRadius
      ));
      this.paintWorldStamp(
        actorId,
        team,
        point,
        paintRadius * 0.78,
        2.4,
        type,
        gaugeEligible
      );
    }
  }

  private paintWorldStamp(
    actorId: string,
    team: Team.A | Team.B,
    worldPoint: Vec3,
    radius: number,
    maxPlaneDistance: number,
    type: PaintEventType,
    gaugeEligible: boolean
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
      if (
        !projected.inside ||
        projected.planeDistance > maxPlaneDistance
      ) {
        continue;
      }

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
      source: PaintSource.Cpu,
      actorId,
      gaugeEligible,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU: radius,
      radiusV: radius,
      angle: 0,
      type,
      strength: 1
    });
    return true;
  }

  private findNearestSurfaceHit(
    from: Vec3,
    to: Vec3
  ): SurfaceRayHit | null {
    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectSegment(from, to);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }

  private deactivateBomb(slot: CpuBombSlot): void {
    slot.active = false;
    slot.landed = false;
    slot.actorId = '-';
    slot.entity.enabled = false;
  }

  private syncStats(): void {
    let activeBombs = 0;
    for (const slot of this.bombs) {
      if (slot.active) activeBombs += 1;
    }
    this.stats.cpuActiveSubs = activeBombs;
    this.stats.cpuActiveSpecialEffects =
      this.scheduledStrikes.length + this.storms.length;
  }
}

function makeCpuKitMaterial(
  rgb: readonly [number, number, number]
): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(
    rgb[0] * 0.72,
    rgb[1] * 0.72,
    rgb[2] * 0.72
  );
  material.useMetalness = true;
  material.metalness = 0.15;
  material.gloss = 0.82;
  material.update();
  return material;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
