import { Vec3 } from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import type { PaintSurface } from '../ink/PaintSurface';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import {
  specialWeaponProfile,
  type SpecialWeaponId
} from '../weapons/WeaponKitCatalog';

interface ScheduledStrike {
  team: Team.A | Team.B;
  point: Vec3;
  seconds: number;
}

interface DriftStorm {
  team: Team.A | Team.B;
  position: Vec3;
  direction: Vec3;
  seconds: number;
  pulseCooldown: number;
}

export class SpecialGaugeSystem {
  private points = 0;
  private readyLatched = false;
  private specialId: SpecialWeaponId = 'turf-pulse';
  private readonly scheduledStrikes: ScheduledStrike[] = [];
  private readonly storms: DriftStorm[] = [];

  public constructor(
    private readonly surfaces: readonly PaintSurface[],
    private readonly coordinator: PaintCoordinator,
    private readonly combatTargets: CombatTargetSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats
  ) {
    this.syncStats();
  }

  public setSpecial(id: SpecialWeaponId): void {
    if (id === this.specialId) {
      this.syncStats();
      return;
    }

    const previousRequired = Math.max(
      specialWeaponProfile(this.specialId).requiredPoints,
      1e-6
    );
    const ratio = Math.max(0, Math.min(1, this.points / previousRequired));
    this.specialId = id;
    const nextRequired = specialWeaponProfile(this.specialId).requiredPoints;
    this.points = ratio * nextRequired;
    this.readyLatched = this.points + 1e-6 >= nextRequired;
    this.syncStats();
  }

  public addHumanScoreablePaint(areaMeters2: number): void {
    if (!Number.isFinite(areaMeters2) || areaMeters2 <= 0) return;

    this.stats.playerHumanScoreablePaintMeters2 += areaMeters2;
    const required = specialWeaponProfile(this.specialId).requiredPoints;
    const previous = this.points;
    this.points = Math.min(
      required,
      this.points + areaMeters2 * GAME_CONFIG.special.pointsPerScoreableSquareMeter
    );

    if (
      previous < required &&
      this.points >= required &&
      !this.readyLatched
    ) {
      this.readyLatched = true;
      this.feedback.specialReady();
    }

    this.syncStats();
  }

  public onPlayerSplatted(): void {
    this.points *= GAME_CONFIG.special.splatRetention;
    this.readyLatched = false;
    this.scheduledStrikes.length = 0;
    this.storms.length = 0;
    this.syncStats();
  }

  public tryActivate(
    team: Team.A | Team.B,
    playerPosition: Vec3,
    aimTarget: Vec3,
    aimDirection: Vec3
  ): boolean {
    const profile = specialWeaponProfile(this.specialId);
    if (this.points + 1e-6 < profile.requiredPoints) return false;

    this.points = 0;
    this.readyLatched = false;
    this.stats.playerSpecialActivations += 1;

    switch (this.specialId) {
      case 'turf-pulse':
        this.activateTurfPulse(team, playerPosition);
        break;
      case 'triple-strike':
        this.activateTripleStrike(team, aimTarget, aimDirection);
        break;
      case 'drift-storm':
        this.activateDriftStorm(team, playerPosition, aimDirection);
        break;
    }

    this.syncStats();
    return true;
  }

  public fixedUpdate(dt: number): void {
    for (let i = this.scheduledStrikes.length - 1; i >= 0; i -= 1) {
      const strike = this.scheduledStrikes[i]!;
      strike.seconds -= dt;
      if (strike.seconds > 0) continue;

      this.applySpecialArea(strike.team, strike.point, 2.15, 62);
      this.paintRadial(strike.team, strike.point, 0.92, 1.85, 10);
      this.feedback.specialBurst(strike.team, strike.point, 1.85);
      this.scheduledStrikes.splice(i, 1);
    }

    for (let i = this.storms.length - 1; i >= 0; i -= 1) {
      const storm = this.storms[i]!;
      storm.seconds -= dt;
      storm.pulseCooldown -= dt;
      storm.position.add(storm.direction.clone().mulScalar(1.45 * dt));

      if (storm.pulseCooldown <= 0) {
        this.applySpecialArea(storm.team, storm.position, 1.85, 16);
        this.paintRadial(storm.team, storm.position, 0.62, 1.25, 8);
        storm.pulseCooldown += 0.38;
      }

      if (storm.seconds <= 0) {
        this.feedback.specialBurst(storm.team, storm.position, 1.35);
        this.storms.splice(i, 1);
      }
    }
  }

  public cancelActive(): void {
    this.scheduledStrikes.length = 0;
    this.storms.length = 0;
  }

  public qaFill(): void {
    const required = specialWeaponProfile(this.specialId).requiredPoints;
    this.points = required;
    this.readyLatched = true;
    this.feedback.specialReady();
    this.syncStats();
  }

  public reset(): void {
    this.points = 0;
    this.readyLatched = false;
    this.scheduledStrikes.length = 0;
    this.storms.length = 0;
    this.stats.playerHumanScoreablePaintMeters2 = 0;
    this.syncStats();
  }

  private activateTurfPulse(
    team: Team.A | Team.B,
    playerPosition: Vec3
  ): void {
    this.applySpecialArea(
      team,
      playerPosition,
      GAME_CONFIG.special.pulseDamageRadiusMeters,
      GAME_CONFIG.special.pulseDamage
    );
    this.paintRadial(
      team,
      playerPosition,
      GAME_CONFIG.special.pulsePaintRadiusMeters,
      GAME_CONFIG.special.pulseRingRadiusMeters,
      12
    );
    this.feedback.specialBurst(
      team,
      playerPosition,
      GAME_CONFIG.special.pulseRingRadiusMeters
    );
  }

  private activateTripleStrike(
    team: Team.A | Team.B,
    aimTarget: Vec3,
    aimDirection: Vec3
  ): void {
    const right = new Vec3(aimDirection.z, 0, -aimDirection.x);
    if (right.lengthSq() <= 1e-6) right.set(1, 0, 0);
    else right.normalize();

    const offsets = [-1.65, 0, 1.65] as const;
    for (let i = 0; i < offsets.length; i += 1) {
      const point = aimTarget.clone().add(right.clone().mulScalar(offsets[i]!));
      this.scheduledStrikes.push({
        team,
        point,
        seconds: 0.72 + i * 0.16
      });
    }
    this.feedback.specialBurst(team, aimTarget, 0.72);
  }

  private activateDriftStorm(
    team: Team.A | Team.B,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): void {
    const direction = new Vec3(aimDirection.x, 0, aimDirection.z);
    if (direction.lengthSq() <= 1e-6) direction.set(0, 0, -1);
    else direction.normalize();

    const position = playerPosition.clone().add(direction.clone().mulScalar(1.1));
    this.storms.push({
      team,
      position,
      direction,
      seconds: 4.8,
      pulseCooldown: 0
    });
    this.feedback.specialBurst(team, position, 1.15);
  }

  private applySpecialArea(
    team: Team.A | Team.B,
    point: Vec3,
    radius: number,
    damage: number
  ): void {
    this.cpuAgents.applyAreaDamage(point, radius, damage, team);
    this.combatTargets.applyAreaDamage(point, radius, damage, team);
  }

  private paintRadial(
    team: Team.A | Team.B,
    center: Vec3,
    paintRadius: number,
    ringRadius: number,
    count: number
  ): void {
    this.paintWorldStamp(team, center, paintRadius, 2.0);

    for (let i = 0; i < count; i += 1) {
      const angle = i * Math.PI * 2 / count;
      const point = center.clone().add(new Vec3(
        Math.cos(angle) * ringRadius,
        0,
        Math.sin(angle) * ringRadius
      ));
      this.paintWorldStamp(team, point, paintRadius, 2.4);
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
      source: PaintSource.Special,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU: radius,
      radiusV: radius,
      angle: 0,
      type: PaintEventType.Special,
      strength: 1
    });
    return true;
  }

  private syncStats(): void {
    const profile = specialWeaponProfile(this.specialId);
    const required = Math.max(profile.requiredPoints, 1e-6);
    this.stats.playerSpecialName = profile.displayName;
    this.stats.playerSpecialPoints = this.points;
    this.stats.playerSpecialPercent = this.points / required * 100;
    this.stats.playerSpecialReady = this.points + 1e-6 >= required;
  }
}
