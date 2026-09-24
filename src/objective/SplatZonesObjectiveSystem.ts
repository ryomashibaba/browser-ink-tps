import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem } from '../ink/GameplayInkSystem';
import type { PaintSurface } from '../ink/PaintSurface';
import { Team } from '../ink/types';
import type { SplatZonesSnapshot } from '../match/GameMode';
import type { StageDefinition, SplatZoneDefinition } from '../stage/StageDefinition';

interface ZoneCell {
  surface: PaintSurface;
  index: number;
}

export function resolveZoneControl(
  percentA: number,
  percentB: number,
  current: Team
): Team {
  const tuning = GAME_CONFIG.match.splatZones;
  const fractionA = percentA / 100;
  const fractionB = percentB / 100;

  if (
    fractionA >= tuning.captureFraction &&
    fractionA - fractionB >= tuning.captureLeadFraction
  ) return Team.A;

  if (
    fractionB >= tuning.captureFraction &&
    fractionB - fractionA >= tuning.captureLeadFraction
  ) return Team.B;

  if (current === Team.A && fractionA >= tuning.retainFraction) return Team.A;
  if (current === Team.B && fractionB >= tuning.retainFraction) return Team.B;
  return Team.Neutral;
}

export class SplatZonesObjectiveSystem {
  private readonly cells: readonly ZoneCell[];
  private control: Team = Team.Neutral;
  private countA: number = GAME_CONFIG.match.splatZones.initialCount;
  private countB: number = GAME_CONFIG.match.splatZones.initialCount;
  private penaltyA: number = 0;
  private penaltyB: number = 0;
  private percentA: number = 0;
  private percentB: number = 0;

  public constructor(
    gameplayInk: GameplayInkSystem,
    stage: StageDefinition,
    private readonly stats: PerformanceStats
  ) {
    const zone = stage.metadata.splatZones[0];
    if (!zone) throw new Error('Splat Zones requires at least one stage zone definition.');
    this.cells = this.buildCells(gameplayInk, zone);
    if (this.cells.length === 0) throw new Error(`Splat zone '${zone.id}' has no gameplay ink cells.`);
    this.syncStats();
  }

  public reset(): void {
    this.control = Team.Neutral;
    this.countA = GAME_CONFIG.match.splatZones.initialCount;
    this.countB = GAME_CONFIG.match.splatZones.initialCount;
    this.penaltyA = 0;
    this.penaltyB = 0;
    this.percentA = 0;
    this.percentB = 0;
    this.measureControl();
    this.syncStats();
  }

  public fixedUpdate(dt: number, active: boolean): void {
    const previous = this.control;
    this.measureControl();
    this.control = resolveZoneControl(this.percentA, this.percentB, previous);

    if (this.control !== previous && previous !== Team.Neutral) {
      this.applyLossPenalty(previous);
    }

    if (active) {
      if (this.control === Team.A) this.advanceTeam(Team.A, dt);
      if (this.control === Team.B) this.advanceTeam(Team.B, dt);
    }

    this.syncStats();
  }

  public snapshot(): SplatZonesSnapshot {
    return {
      control: this.control,
      percentA: this.percentA,
      percentB: this.percentB,
      countA: this.countA,
      countB: this.countB,
      penaltyA: this.penaltyA,
      penaltyB: this.penaltyB
    };
  }

  public knockoutWinner(): Team {
    if (this.countA <= 0) return Team.A;
    if (this.countB <= 0) return Team.B;
    return Team.Neutral;
  }

  private buildCells(
    gameplayInk: GameplayInkSystem,
    zone: SplatZoneDefinition
  ): ZoneCell[] {
    const surface = gameplayInk.getSurface(zone.surfaceId);
    if (!surface) throw new Error(`Splat zone '${zone.id}' references unknown surface '${zone.surfaceId}'.`);

    const minU = zone.centerU - zone.widthMeters * 0.5;
    const maxU = zone.centerU + zone.widthMeters * 0.5;
    const minV = zone.centerV - zone.heightMeters * 0.5;
    const maxV = zone.centerV + zone.heightMeters * 0.5;
    const minX = Math.max(0, Math.floor(minU / surface.cellSize));
    const maxX = Math.min(surface.widthCells - 1, Math.ceil(maxU / surface.cellSize) - 1);
    const minY = Math.max(0, Math.floor(minV / surface.cellSize));
    const maxY = Math.min(surface.heightCells - 1, Math.ceil(maxV / surface.cellSize) - 1);
    const cells: ZoneCell[] = [];

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const u = (x + 0.5) * surface.cellSize;
        const v = (y + 0.5) * surface.cellSize;
        if (u < minU || u > maxU || v < minV || v > maxV) continue;
        cells.push({ surface, index: surface.index(x, y) });
      }
    }
    return cells;
  }

  private measureControl(): void {
    let a = 0;
    let b = 0;
    for (const cell of this.cells) {
      const owner = cell.surface.ownerGrid[cell.index] as Team;
      if (owner === Team.A) a += 1;
      else if (owner === Team.B) b += 1;
    }
    const total = Math.max(1, this.cells.length);
    this.percentA = a / total * 100;
    this.percentB = b / total * 100;
  }

  private applyLossPenalty(team: Team.A | Team.B): void {
    const tuning = GAME_CONFIG.match.splatZones;
    if (team === Team.A) {
      const progress = tuning.initialCount - this.countA;
      this.penaltyA = Math.max(
        this.penaltyA,
        Math.min(tuning.maxPenalty, progress * tuning.penaltyProgressMultiplier)
      );
      return;
    }
    const progress = tuning.initialCount - this.countB;
    this.penaltyB = Math.max(
      this.penaltyB,
      Math.min(tuning.maxPenalty, progress * tuning.penaltyProgressMultiplier)
    );
  }

  private advanceTeam(team: Team.A | Team.B, dt: number): void {
    const tuning = GAME_CONFIG.match.splatZones;
    if (team === Team.A) {
      if (this.penaltyA > 0) {
        this.penaltyA = Math.max(0, this.penaltyA - tuning.penaltyClearPerSecond * dt);
      } else {
        this.countA = Math.max(0, this.countA - tuning.countPerSecond * dt);
      }
      return;
    }
    if (this.penaltyB > 0) {
      this.penaltyB = Math.max(0, this.penaltyB - tuning.penaltyClearPerSecond * dt);
    } else {
      this.countB = Math.max(0, this.countB - tuning.countPerSecond * dt);
    }
  }

  private syncStats(): void {
    this.stats.zonesControl = this.control === Team.A
      ? 'TEAM A'
      : this.control === Team.B ? 'TEAM B' : 'NEUTRAL';
    this.stats.zonesPercentA = this.percentA;
    this.stats.zonesPercentB = this.percentB;
    this.stats.zonesCountA = this.countA;
    this.stats.zonesCountB = this.countB;
    this.stats.zonesPenaltyA = this.penaltyA;
    this.stats.zonesPenaltyB = this.penaltyB;
  }
}
