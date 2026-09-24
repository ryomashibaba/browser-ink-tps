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

  if (current === Team.A) {
    if (fractionB >= tuning.captureFraction) return Team.B;
    if (fractionB >= tuning.neutralizeOpponentFraction) return Team.Neutral;
    return Team.A;
  }

  if (current === Team.B) {
    if (fractionA >= tuning.captureFraction) return Team.A;
    if (fractionA >= tuning.neutralizeOpponentFraction) return Team.Neutral;
    return Team.B;
  }

  if (fractionA >= tuning.captureFraction) return Team.A;
  if (fractionB >= tuning.captureFraction) return Team.B;
  return Team.Neutral;
}

export function calculateZonePenalty(
  startEffectiveCount: number,
  endEffectiveCount: number
): number {
  const tuning = GAME_CONFIG.match.splatZones;
  const progress = Math.max(0, startEffectiveCount - endEffectiveCount);
  if (progress <= 1e-6) return 0;
  const openingBonus =
    Math.abs(startEffectiveCount - tuning.initialCount) <= 1e-6 ? 1 : 0;
  return Math.round(progress * tuning.penaltyProgressMultiplier) + openingBonus;
}

export class SplatZonesObjectiveSystem {
  private readonly cells: readonly ZoneCell[];
  private control: Team = Team.Neutral;
  private pendingPenaltyTeam: Team = Team.Neutral;
  private countA: number = GAME_CONFIG.match.splatZones.initialCount;
  private countB: number = GAME_CONFIG.match.splatZones.initialCount;
  private penaltyA: number = 0;
  private penaltyB: number = 0;
  private controlStartEffectiveA: number = GAME_CONFIG.match.splatZones.initialCount;
  private controlStartEffectiveB: number = GAME_CONFIG.match.splatZones.initialCount;
  private percentA: number = 0;
  private percentB: number = 0;
  private lossAgeA: number = Number.POSITIVE_INFINITY;
  private lossAgeB: number = Number.POSITIVE_INFINITY;

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
    const initial = GAME_CONFIG.match.splatZones.initialCount;
    this.control = Team.Neutral;
    this.pendingPenaltyTeam = Team.Neutral;
    this.countA = initial;
    this.countB = initial;
    this.penaltyA = 0;
    this.penaltyB = 0;
    this.controlStartEffectiveA = initial;
    this.controlStartEffectiveB = initial;
    this.percentA = 0;
    this.percentB = 0;
    this.lossAgeA = Number.POSITIVE_INFINITY;
    this.lossAgeB = Number.POSITIVE_INFINITY;
    this.measureControl();
    this.syncStats();
  }

  public fixedUpdate(dt: number, active: boolean): void {
    if (active) this.advanceLossAges(dt);

    const previous = this.control;
    this.measureControl();
    this.control = resolveZoneControl(this.percentA, this.percentB, previous);

    if (this.control !== previous) {
      this.handleControlTransition(previous, this.control);
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
      penaltyB: this.penaltyB,
      lossAgeA: this.lossAgeA,
      lossAgeB: this.lossAgeB
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

  private advanceLossAges(dt: number): void {
    if (Number.isFinite(this.lossAgeA)) this.lossAgeA += dt;
    if (Number.isFinite(this.lossAgeB)) this.lossAgeB += dt;
  }

  private handleControlTransition(previous: Team, next: Team): void {
    if (previous === Team.A) {
      this.lossAgeA = 0;
      this.pendingPenaltyTeam = Team.A;
    } else if (previous === Team.B) {
      this.lossAgeB = 0;
      this.pendingPenaltyTeam = Team.B;
    }

    if (next === Team.A) {
      if (this.pendingPenaltyTeam === Team.B) {
        this.applyControlPeriodPenalty(Team.B);
      }
      this.pendingPenaltyTeam = Team.Neutral;
      this.controlStartEffectiveA = this.effectiveRemaining(Team.A);
      this.lossAgeA = Number.POSITIVE_INFINITY;
    } else if (next === Team.B) {
      if (this.pendingPenaltyTeam === Team.A) {
        this.applyControlPeriodPenalty(Team.A);
      }
      this.pendingPenaltyTeam = Team.Neutral;
      this.controlStartEffectiveB = this.effectiveRemaining(Team.B);
      this.lossAgeB = Number.POSITIVE_INFINITY;
    }
  }

  private applyControlPeriodPenalty(team: Team.A | Team.B): void {
    const tuning = GAME_CONFIG.match.splatZones;
    if (team === Team.A) {
      const added = calculateZonePenalty(
        this.controlStartEffectiveA,
        this.effectiveRemaining(Team.A)
      );
      this.penaltyA = Math.min(tuning.maxPenalty, this.penaltyA + added);
      return;
    }

    const added = calculateZonePenalty(
      this.controlStartEffectiveB,
      this.effectiveRemaining(Team.B)
    );
    this.penaltyB = Math.min(tuning.maxPenalty, this.penaltyB + added);
  }

  private effectiveRemaining(team: Team.A | Team.B): number {
    return team === Team.A
      ? this.countA + this.penaltyA
      : this.countB + this.penaltyB;
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
    this.stats.zonesLossAgeA = this.lossAgeA;
    this.stats.zonesLossAgeB = this.lossAgeB;
  }
}
