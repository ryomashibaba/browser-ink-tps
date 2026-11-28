import { PerformanceStats } from '../core/PerformanceStats';
import {f4WallContinuationBrushes} from '../stage/F4WallContinuationBrushes.mjs';
import { GameplayInkSystem, type PaintApplyResult, type PaintRasterRun } from './GameplayInkSystem';
import { GpuInkAtlas } from './GpuInkAtlas';
import { PaintEventType, PaintSource, SurfaceFlags, Team, type PaintEvent } from './types';
import type {PaintSurface} from './PaintSurface';

export interface PaintRequest {
  source?: PaintSource;
  actorId?: string;
  /** B152 informational only; forwarded to the immutable PaintEvent. */
  qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK';
  gaugeEligible?: boolean;
  /** Contact travel already sampled this individual physical cell. */
  f4ExactContactCell?: boolean;
  /** F4 natural gauge only: null is invalid launch life; undefined is legacy/immediate paint. */
  f4GaugeLaunchLife?: string|null;
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

// F4 provisional play balance only. Keep hit locations, direction, damage,
// cadence and ink consumption untouched. The CPU raster remains the authority.
function f4PlayableBrush(request: PaintRequest): PaintRequest {
  if (request.f4ExactContactCell) return request;
  if (request.source !== PaintSource.Human && request.source !== PaintSource.Cpu &&
      request.source !== PaintSource.Special) return request;
  if (!Number.isFinite(request.radiusU) || !Number.isFinite(request.radiusV) ||
      request.radiusU <= 0 || request.radiusV <= 0) return request;
  let factor = 1, maxGrowth = 0;
  const playerOwned = request.source === PaintSource.Human ||
    (request.source === PaintSource.Special &&
      (!request.actorId || request.actorId === 'human'));
  switch (request.type) {
    // Keep CPU balance at the integrated values. The player's primary fire
    // already covers its authored projectile pattern; the former blanket
    // 1.5x/1.45x brush growth made that pattern overpaint the floor.
    case PaintEventType.Impact:
    case PaintEventType.MidDroplet:
      if (!playerOwned) {
        factor = request.type === PaintEventType.Impact ? 1.5 : 1.45;
        maxGrowth = request.type === PaintEventType.Impact ? .75 : .65;
      } else { factor = 1.05; maxGrowth = .06; }
      break;
    case PaintEventType.Foot:
      if (!playerOwned) { factor = 1.2; maxGrowth = .15; }
      break;
    case PaintEventType.WallImpact:
      if (!playerOwned) { factor = 1.3; maxGrowth = .4; }
      else { factor = 1.05; maxGrowth = .06; }
      break;
    case PaintEventType.Bomb:
      if (playerOwned) { factor = 1.8; maxGrowth = 1.2; }
      else { factor = 1.55; maxGrowth = 1; }
      break;
    case PaintEventType.Special:
      if (playerOwned) { factor = 2; maxGrowth = .55; }
      else { factor = 1.55; maxGrowth = 1; }
      break;
    default: return request;
  }
  const u = request.radiusU, v = request.radiusV;
  const grow = (r: number) => r + Math.min(r * (factor - 1), maxGrowth);
  // Long narrow charger/trail stamps become wider, never longer.
  return {...request, radiusU: u > 3*v ? u : grow(u),
    radiusV: v > 3*u ? v : grow(v)};
}

export class PaintCoordinator {
  private f4PlayablePaint=false;
  public enableF4PlayablePaint():void{
    this.f4PlayablePaint=true;
    this.gpu.enableF4FullCellRendering();
    this.f4WallAtlas?.enableF4FullCellRendering();
    for(const atlas of this.f4FloorAtlases)atlas.enableF4FullCellRendering();
  }
  private readonly requests: Readonly<PaintRequest>[] = [];
  public lastEvent: PaintEvent | null = null;
  private f4WallAtlas:GpuInkAtlas|null=null;
  public attachF4WallAtlas(atlas:GpuInkAtlas):void{
    if(this.f4WallAtlas)throw Error('F4_WALL_ATLAS_ALREADY_ATTACHED');
    this.f4WallAtlas=atlas;
    // The wall atlas exists only in the provisional native F4 world.
    atlas.enableF4QueueOptimization();
    if(this.f4PlayablePaint)atlas.enableF4FullCellRendering();
  }
  private readonly f4FloorAtlasBySurface=new Map<string,GpuInkAtlas>();
  private readonly f4FloorAtlases=new Set<GpuInkAtlas>();
  public attachF4FloorAtlas(atlas:GpuInkAtlas,surfaces:readonly PaintSurface[]):void{
    if(surfaces.some(s=>!s.id.startsWith('F4ProvisionalFloor:')||this.f4FloorAtlasBySurface.has(s.id)))throw Error('F4_FLOOR_ATLAS_DUPLICATE');
    atlas.enableF4QueueOptimization();
    if(this.f4PlayablePaint)atlas.enableF4FullCellRendering();
    this.f4FloorAtlases.add(atlas);
    for(const s of surfaces)this.f4FloorAtlasBySurface.set(s.id,atlas);
  }
  public detachF4FloorAtlas(atlas:GpuInkAtlas):void{
    this.f4FloorAtlases.delete(atlas);
    for(const [id,a] of this.f4FloorAtlasBySurface)if(a===atlas)this.f4FloorAtlasBySurface.delete(id);
  }
  public flushF4WallAtlas(maxEvents:number):void{
    const flush=(atlas:GpuInkAtlas)=>{
      // Keep normal budget when caught up; drain more queued real paint
      // after bursts. The GPU atlas still enforces its 16-bit quad cap.
      const budget=this.f4PlayablePaint&&Number.isFinite(maxEvents)&&maxEvents>=1?
        Math.max(maxEvents,Math.min(128,Math.ceil(atlas.backlog/2))):maxEvents;
      atlas.flush(budget);
    };
    if(this.f4WallAtlas)flush(this.f4WallAtlas);
    for(const atlas of this.f4FloorAtlases)flush(atlas);
  }
  public detachF4WallAtlas(atlas:GpuInkAtlas):void{
    if(this.f4WallAtlas!==atlas)return;
    this.f4WallAtlas=null;
    for(let i=this.requests.length-1;i>=0;i--)
      if(this.requests[i]!.surfaceId.startsWith('F4ProvisionalWall:'))this.requests.splice(i,1);
  }

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
    const brush = this.f4PlayablePaint&&this.f4FloorAtlases.size ? f4PlayableBrush(request) : request;
    this.requests.push(Object.freeze({ ...brush }));
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
    // Split one authentic brush only after the original tile accepts raster cells.
    // Insert its continuations immediately, retaining opposing-team FIFO order.
    let continuations: Set<Readonly<PaintRequest>>|undefined;
    for (let requestIndex=0;requestIndex<batch.length;requestIndex++) {
      const request=batch[requestIndex]!;
      const source = request.source ?? PaintSource.System;
      // Tick and source authority must not be overridden by extra fields in a
      // structurally compatible but untrusted pooled request.
      const event: PaintEvent = Object.freeze({ ...request, source, tick });
      const result = this.gameplay.apply(event);
      changedCells += result.changedCells;
      if(this.f4WallAtlas&&event.type===PaintEventType.WallImpact&&
         (source===PaintSource.Human||source===PaintSource.Cpu)&&
         event.surfaceId.startsWith('F4ProvisionalWall:')&&result.rasterEligibleCells>0&&
         !continuations?.has(request)){
        const surface=this.gameplay.getSurface(event.surfaceId);
        if(surface){
          const adjacent=f4WallContinuationBrushes(surface,this.gameplay.getSurfaces(),event,
            result.paintableRuns,(s,x,y)=>this.gameplay.isF4WallCellBacked(s,x,y));
          if(adjacent.length){
            const extra=adjacent.map(p=>Object.freeze({...request,...p,gaugeEligible:false}));
            continuations??=new Set();
            for(const item of extra)continuations.add(item);
            batch.splice(requestIndex+1,0,...extra);
          }
        }
      }
      // One genuine floor brush can straddle a new tile or the old SOURCE
      // boundary. Reproject onto neighboring coplanar registered surfaces;
      // each continuation still passes the same live raster/backing authority.
      if(this.f4FloorAtlases.size&&result.rasterEligibleCells>0&&!continuations?.has(request)&&
         !(this.f4PlayablePaint&&request.f4ExactContactCell)&&
         (source===PaintSource.Human||source===PaintSource.Cpu||
          (this.f4PlayablePaint&&source===PaintSource.Special))&&
         (event.type===PaintEventType.Impact||event.type===PaintEventType.Foot||
          event.type===PaintEventType.MidDroplet||(this.f4PlayablePaint&&
          (event.type===PaintEventType.Bomb||event.type===PaintEventType.Special)))){
        const from=this.gameplay.getSurface(event.surfaceId);
        if(from&&!(from.baseFlags&SurfaceFlags.Wall)){
          const center=from.localToWorld(event.centerU,event.centerV);
          const axis=from.uAxis.clone().mulScalar(Math.cos(event.angle)).add(from.vAxis.clone().mulScalar(Math.sin(event.angle)));
          const radius=Math.max(event.radiusU,event.radiusV),extra:Readonly<PaintRequest>[]=[];
          // The old local rectangle gate allows up to radius beyond each
          // of two axes plus 2.5cm plane tolerance. The larger spherical
          // padding is conservative, including rotated and sloped tiles.
          for(const to of this.gameplay.f4NearbyPaintSurfaces(center,Math.SQRT2*radius+.025)){
            if(to===from||(!(to.id.startsWith('F4ProvisionalFloor:'))&&!from.id.startsWith('F4ProvisionalFloor:'))||
               !(to.baseFlags&SurfaceFlags.Paintable)||(to.baseFlags&SurfaceFlags.Wall)||Math.abs(to.normal.dot(from.normal))<.999)continue;
            const p=to.projectWorldPoint(center);
            if(p.planeDistance>.025||p.u < -radius||p.v < -radius||p.u>to.widthMeters+radius||p.v>to.heightMeters+radius)continue;
            extra.push(Object.freeze({...request,surfaceId:to.id,centerU:p.u,centerV:p.v,
             angle:Math.atan2(axis.dot(to.vAxis),axis.dot(to.uAxis))}));
          }
          if(extra.length){continuations??=new Set();for(const item of extra)continuations.add(item);batch.splice(requestIndex+1,0,...extra);}
        }
      }
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
          const atlas=event.surfaceId.startsWith('F4ProvisionalWall:')?this.f4WallAtlas:
            this.f4FloorAtlasBySurface.get(event.surfaceId)??this.gpu;
          atlas?.queue(event, result.paintableRuns);
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
    this.f4WallAtlas?.clear();
    for(const atlas of this.f4FloorAtlases)atlas.clear();
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
