import { Vec3 } from 'playcanvas';
import type { CpuAgentSystem } from '../ai/CpuAgentSystem';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import type { PaintSurface } from '../ink/PaintSurface';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';

export class SpecialGaugeSystem {
  private points = 0;
  private readyLatched = false;

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

  public addHumanScoreablePaint(areaMeters2: number): void {
    if (!Number.isFinite(areaMeters2) || areaMeters2 <= 0) return;

    this.stats.playerHumanScoreablePaintMeters2 += areaMeters2;
    const previous = this.points;
    this.points = Math.min(
      GAME_CONFIG.special.requiredPoints,
      this.points + areaMeters2 * GAME_CONFIG.special.pointsPerScoreableSquareMeter
    );

    if (
      previous < GAME_CONFIG.special.requiredPoints &&
      this.points >= GAME_CONFIG.special.requiredPoints &&
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
    this.syncStats();
  }

  public tryActivate(team: Team.A | Team.B, playerPosition: Vec3): boolean {
    if (this.points + 1e-6 < GAME_CONFIG.special.requiredPoints) return false;

    this.points = 0;
    this.readyLatched = false;
    this.stats.playerSpecialActivations += 1;

    this.cpuAgents.applyAreaDamage(
      playerPosition,
      GAME_CONFIG.special.pulseDamageRadiusMeters,
      GAME_CONFIG.special.pulseDamage,
      team
    );
    this.combatTargets.applyAreaDamage(
      playerPosition,
      GAME_CONFIG.special.pulseDamageRadiusMeters,
      GAME_CONFIG.special.pulseDamage,
      team
    );

    this.paintPulse(team, playerPosition);
    this.feedback.specialBurst(team, playerPosition, GAME_CONFIG.special.pulseRingRadiusMeters);
    this.syncStats();
    return true;
  }

  public qaFill(): void {
    this.points = GAME_CONFIG.special.requiredPoints;
    this.readyLatched = true;
    this.feedback.specialReady();
    this.syncStats();
  }

  public reset(): void {
    this.points = 0;
    this.readyLatched = false;
    this.stats.playerHumanScoreablePaintMeters2 = 0;
    this.syncStats();
  }

  private paintPulse(team: Team.A | Team.B, center: Vec3): void {
    const cfg = GAME_CONFIG.special;
    this.paintWorldStamp(team, center, cfg.pulsePaintRadiusMeters, 2.0);

    for (let i = 0; i < 12; i += 1) {
      const angle = i * Math.PI * 2 / 12;
      const point = center.clone().add(new Vec3(
        Math.cos(angle) * cfg.pulseRingRadiusMeters,
        0,
        Math.sin(angle) * cfg.pulseRingRadiusMeters
      ));
      this.paintWorldStamp(team, point, cfg.pulsePaintRadiusMeters, 2.2);
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
    const required = Math.max(GAME_CONFIG.special.requiredPoints, 1e-6);
    this.stats.playerSpecialPoints = this.points;
    this.stats.playerSpecialPercent = this.points / required * 100;
    this.stats.playerSpecialReady = this.points + 1e-6 >= required;
  }
}
