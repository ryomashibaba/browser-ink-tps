import { PerformanceStats } from '../core/PerformanceStats';
import { GameplayInkSystem } from './GameplayInkSystem';
import { GpuInkAtlas } from './GpuInkAtlas';
import { PaintEventType, PaintSource, Team, type PaintEvent } from './types';

export interface PaintRequest {
  source?: PaintSource;
  actorId?: string;
  team: Team.A | Team.B;
  surfaceId: string;
  centerU: number;
  centerV: number;
  radiusU: number;
  radiusV: number;
  angle: number;
  type: PaintEventType;
  strength: number;
}

export interface PaintTickReport {
  humanScoreableAreaMeters2: number;
  cpuScoreableAreaMeters2ByActor: Readonly<Record<string, number>>;
}

export class PaintCoordinator {
  private readonly requests: PaintRequest[] = [];
  public lastEvent: PaintEvent | null = null;

  public constructor(
    private readonly gameplay: GameplayInkSystem,
    private readonly gpu: GpuInkAtlas,
    private readonly stats: PerformanceStats
  ) {}

  public enqueue(request: PaintRequest): void {
    this.requests.push(request);
  }

  public enqueueMany(requests: readonly PaintRequest[]): void {
    this.requests.push(...requests);
  }

  public processTick(tick: number): PaintTickReport {
    if (this.requests.length === 0) {
      return {
        humanScoreableAreaMeters2: 0,
        cpuScoreableAreaMeters2ByActor: Object.freeze({})
      };
    }

    // One immutable event is created once and consumed by both authoritative CPU gameplay ink
    // and persistent GPU visual ink. Neither side recomputes the impact location.
    const batch = this.requests.splice(0, this.requests.length);
    let changedCells = 0;
    let humanScoreableAreaMeters2 = 0;
    const cpuScoreableAreaMeters2ByActor: Record<string, number> = {};
    for (const request of batch) {
      const source = request.source ?? PaintSource.System;
      const event: PaintEvent = Object.freeze({ tick, ...request, source });
      const result = this.gameplay.apply(event);
      changedCells += result.changedCells;
      if (event.source === PaintSource.Human) {
        humanScoreableAreaMeters2 += result.scoreableAreaMeters2Changed;
      } else if (
        event.source === PaintSource.Cpu &&
        event.actorId &&
        result.scoreableAreaMeters2Changed > 0
      ) {
        cpuScoreableAreaMeters2ByActor[event.actorId] =
          (cpuScoreableAreaMeters2ByActor[event.actorId] ?? 0) +
          result.scoreableAreaMeters2Changed;
      }
      this.gpu.queue(event);
      this.lastEvent = event;
      const surface = this.gameplay.getSurface(event.surfaceId);
      if (surface) {
        const world = surface.localToWorld(event.centerU, event.centerV);
        this.stats.lastPaintSurface = event.surfaceId;
        this.stats.lastPaintU = event.centerU;
        this.stats.lastPaintV = event.centerV;
        this.stats.lastPaintWorldX = world.x;
        this.stats.lastPaintWorldY = world.y;
        this.stats.lastPaintWorldZ = world.z;
      }
    }
    this.stats.recordPaint(batch.length, changedCells);
    return {
      humanScoreableAreaMeters2,
      cpuScoreableAreaMeters2ByActor: Object.freeze(cpuScoreableAreaMeters2ByActor)
    };
  }

  public clear(): void {
    this.requests.length = 0;
    this.gameplay.reset();
    this.gpu.clear();
    this.lastEvent = null;
    this.stats.lastPaintSurface = '-';
    this.stats.lastPaintU = Number.NaN;
    this.stats.lastPaintV = Number.NaN;
    this.stats.lastPaintWorldX = Number.NaN;
    this.stats.lastPaintWorldY = Number.NaN;
    this.stats.lastPaintWorldZ = Number.NaN;
  }

  public makeDebugRequest(
    team: Team.A | Team.B,
    surfaceId: string,
    centerU: number,
    centerV: number,
    radius: number,
    angle = 0,
    stretch = 1.0
  ): PaintRequest {
    return {
      source: PaintSource.Debug,
      team,
      surfaceId,
      centerU,
      centerV,
      radiusU: radius * stretch,
      radiusV: radius,
      angle,
      type: PaintEventType.Debug,
      strength: 1
    };
  }
}
