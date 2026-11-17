import { PerformanceStats } from '../core/PerformanceStats';
import { GameplayInkSystem, type PaintApplyResult, type PaintRasterRun } from './GameplayInkSystem';
import { GpuInkAtlas } from './GpuInkAtlas';
import { PaintEventType, PaintSource, Team, type PaintEvent } from './types';

export interface PaintRequest {
  source?: PaintSource;
  actorId?: string;
  /** B152 informational only; forwarded to the immutable PaintEvent. */
  qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK';
  gaugeEligible?: boolean;
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

/**
 * A full-strength brush overwrite is idempotent only when the *complete*
 * GPU shader input and the actual CPU-authorized row runs agree. This
 * compares adjacent GPU submissions within one tick; no unrelated brush
 * (including an opposing team) may be reordered or dropped.
 */
function sameInkGpuOverwrite(
  before: PaintEvent, beforeRuns: readonly PaintRasterRun[],
  after: PaintEvent, afterRuns: readonly PaintRasterRun[]
): boolean {
  if (before.surfaceId !== after.surfaceId ||
      before.team !== after.team ||
      before.centerU !== after.centerU ||
      before.centerV !== after.centerV ||
      before.radiusU !== after.radiusU ||
      before.radiusV !== after.radiusV ||
      before.angle !== after.angle ||
      before.strength !== after.strength ||
      beforeRuns.length !== afterRuns.length) return false;

  for (let i = 0; i < beforeRuns.length; i += 1) {
    const a = beforeRuns[i]!;
    const b = afterRuns[i]!;
    if (a.row !== b.row || a.startX !== b.startX ||
        a.endXExclusive !== b.endXExclusive) return false;
  }
  return true;
}

export class PaintCoordinator {
  private readonly requests: Readonly<PaintRequest>[] = [];
  public lastEvent: PaintEvent | null = null;

  public constructor(
    private readonly gameplay: GameplayInkSystem,
    private readonly gpu: GpuInkAtlas,
    private readonly stats: PerformanceStats,
    // Optional read-only observation after authoritative CPU rasterization.
    // Unused in every production/T20 coordinator; F3 source practice uses
    // it only for honest human ink visual feedback, never for gameplay.
    private readonly onAcceptedPaint?: (
      event: PaintEvent, changedCells: number, raster: Readonly<PaintApplyResult>
    ) => void
  ) {}

  public enqueue(request: PaintRequest): void {
    // The weapon/projectile side may reuse its request object later in this
    // tick. Capture the actual impact now, rather than painting at its next
    // location after the pooled request has been mutated.
    this.requests.push(Object.freeze({ ...request }));
  }

  public enqueueMany(requests: readonly PaintRequest[]): void {
    // Snapshot each request and avoid the spread-argument limit for long
    // continuous bursts or large scripted paint batches.
    for (const request of requests) this.enqueue(request);
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
    // Identical GPU overwrites from clustered hits in one tick should not
    // grow the renderer backlog. This does not deduplicate CPU ownership,
    // scoring or source diagnostic events.
    let lastQueuedBrush: { event: PaintEvent; runs: readonly PaintRasterRun[] } | null = null;
    let humanScoreableAreaMeters2 = 0;
    const cpuScoreableAreaMeters2ByActor: Record<string, number> = {};
    for (const request of batch) {
      const source = request.source ?? PaintSource.System;
      // Tick and source authority must not be overridden by extra fields in a
      // structurally compatible but untrusted pooled request.
      const event: PaintEvent = Object.freeze({ ...request, source, tick });
      const result = this.gameplay.apply(event);
      changedCells += result.changedCells;
      // Existing QA uses the raster observation to distinguish denied
      // attempts from repaint. Preserve that diagnostic contract; the
      // actual GPU queue and last-accepted UI telemetry remain gated below.
      this.onAcceptedPaint?.(event, result.changedCells, result);
      if (event.source === PaintSource.Cpu) {
        // Count authoritative cell ownership transitions, not just ink
        // requests or projected hits. Includes the legitimate CPU foot.
        this.stats.cpuInkCellsChanged += result.changedCells;
        if (event.type === PaintEventType.Impact ||
            event.type === PaintEventType.WallImpact) {
          this.stats.cpuImpactInkCellsChanged += result.changedCells;
        }
      }
      if (event.source === PaintSource.Human) {
        humanScoreableAreaMeters2 += result.scoreableAreaMeters2Changed;
      } else if (
        event.source === PaintSource.Cpu &&
        event.actorId &&
        event.gaugeEligible !== false &&
        result.scoreableAreaMeters2Changed > 0
      ) {
        cpuScoreableAreaMeters2ByActor[event.actorId] =
          (cpuScoreableAreaMeters2ByActor[event.actorId] ?? 0) +
          result.scoreableAreaMeters2Changed;
      }
      // An event with no authoritative paintable raster cells must not
      // draw a phantom GPU stamp. Repaints on already-owned cells remain
      // eligible for visual wetness, even when changedCells is zero.
      if (result.rasterEligibleCells > 0) {
        if (!lastQueuedBrush || !sameInkGpuOverwrite(
          lastQueuedBrush.event, lastQueuedBrush.runs,
          event, result.paintableRuns
        )) {
          this.gpu.queue(event, result.paintableRuns);
          lastQueuedBrush = { event, runs: result.paintableRuns };
        }
        // Same-team restamps still refresh visual wetness, but denied
        // requests must not masquerade as the last valid paint impact.
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
    this.stats.cpuInkCellsChanged = 0;
    this.stats.cpuImpactInkCellsChanged = 0;
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
