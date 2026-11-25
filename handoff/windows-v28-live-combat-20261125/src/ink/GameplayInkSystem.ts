import { Vec3 } from 'playcanvas';
import type { PaintEvent, TurfSnapshot } from './types';
import { SurfaceFlags, Team } from './types';
import type { PaintSurface, SurfaceProjection } from './PaintSurface';

/** Contiguous authority-approved raster cells, including same-team repaint. */
export interface PaintRasterRun {
  row: number;
  startX: number;
  endXExclusive: number;
}

export interface PaintApplyResult {
  paintableRuns: readonly PaintRasterRun[];
  changedCells: number;
  /** Diagnostics only, computed inside the existing authoritative raster. */
  rasterEligibleCells: number;
  rasterAlreadyTeamOwnedCells: number;
  testedCells: number;
  dirtyTilesTouched: number;
  scoreableAreaMeters2Changed: number;
}

export interface GameplayInkSample {
  surface: PaintSurface;
  owner: Team;
  flags: number;
  u: number;
  v: number;
  planeDistance: number;
}

export class GameplayInkSystem {
  private readonly surfaces = new Map<string, PaintSurface>();
  private backedCell:((surface:PaintSurface,u:number,v:number)=>boolean)|null=null;
  private readonly backingCache=new Map<string,Uint8Array>();

  public setPhysicalPaintBacking(
    backing:((surface:PaintSurface,u:number,v:number)=>boolean)|null
  ):void{
    this.backedCell=backing;
    this.backingCache.clear();
  }

  private isPhysicallyBacked(surface:PaintSurface,x:number,y:number,index:number):boolean{
    if(!this.backedCell)return true;
    let cache=this.backingCache.get(surface.id);
    if(!cache){
      cache=new Uint8Array(surface.widthCells*surface.heightCells);
      this.backingCache.set(surface.id,cache);
    }
    if(!cache[index]){
      const u=x*surface.cellSize,v=y*surface.cellSize;
      const u1=Math.min(u+surface.cellSize,surface.widthMeters)-.0001;
      const v1=Math.min(v+surface.cellSize,surface.heightMeters)-.0001;
      cache[index]=this.backedCell(surface,u+.0001,v+.0001)&&
        this.backedCell(surface,u1,v+.0001)&&
        this.backedCell(surface,u+.0001,v1)&&
        this.backedCell(surface,u1,v1)&&
        this.backedCell(surface,(u+u1)*.5,(v+v1)*.5)?1:2;
    }
    return cache[index]===1;
  }
  // Reuse registration order without allocating projected-point objects
  // for distant ink planes in the 60Hz player/7 CPU sampling hot path.
  // Radius is an oversized enclosing sphere, NOT physical paint authority.
  private readonly sampleBounds: Array<{
    surface: PaintSurface; radiusMeters: number
  }> = [];
  // One synchronous 60Hz foot sample uses this for all nearby SOURCE planes.
  // Never expose the scratch; public sampleWorld returns a fresh final value.
  private readonly sampleProjection: SurfaceProjection = {
    u: 0, v: 0, signedPlaneDistance: 0, planeDistance: 0, inside: false
  };
  // One authoritative brush is fully processed before the next. Avoid a new
  // Set for every real CPU/HUMAN ink hit over a continuous 180s match.
  private readonly touchedTilesScratch = new Set<number>();
  private areaA = 0;
  private areaB = 0;
  private totalScoreableArea = 0;

  public registerSurface(surface: PaintSurface): void {
    if (this.surfaces.has(surface.id)) throw new Error(`Duplicate PaintSurface id: ${surface.id}`);
    this.surfaces.set(surface.id, surface);
    // Orthogonal normalized original basis gives rectangle half-diagonal.
    // Add 0.2% + 2cm to cover footprint edge epsilon and float roundoff.
    // A real candidate with plane distance <= requested maxDistance
    // can never lie outside (half-diagonal + maxDistance).
    this.sampleBounds.push({
      surface,
      radiusMeters: Math.hypot(
        surface.widthMeters,surface.heightMeters)*0.501+0.02
    });
    this.totalScoreableArea += surface.scoreableAreaMeters2;
  }

  public getSurface(id: string): PaintSurface | undefined {
    return this.surfaces.get(id);
  }

  public getSurfaces(): readonly PaintSurface[] {
    return [...this.surfaces.values()];
  }

  /**
   * Samples the authoritative CPU gameplay ink near a world-space point.
   * This projects onto each PaintSurface's own local basis; there is no global XZ ink grid.
   */
  public sampleWorld(
    point: Vec3,
    maxPlaneDistance = 0.4,
    requiredFlags = 0,
    excludedFlags = 0,
    acceptSurface?: (surface: PaintSurface) => boolean
  ): GameplayInkSample | null {
    let bestSurface: PaintSurface | null = null;
    let bestOwner = Team.Neutral;
    let bestFlags = 0;
    let bestU = 0;
    let bestV = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const {surface,radiusMeters} of this.sampleBounds) {
      if (acceptSurface && !acceptSurface(surface)) continue;
      if (requiredFlags !== 0 && (surface.baseFlags & requiredFlags) !== requiredFlags) continue;
      if (excludedFlags !== 0 && (surface.baseFlags & excludedFlags) !== 0) continue;
      // Only cull when the requested plane tolerance is finite and >=0.
      // NaN/Infinity and unusual QA requests keep the old exact
      // projectWorldPoint semantics; never grant paint or alter ownership.
      if (Number.isFinite(maxPlaneDistance) && maxPlaneDistance >= 0) {
        const dx=point.x-surface.center.x;
        const dy=point.y-surface.center.y;
        const dz=point.z-surface.center.z;
        const limit=radiusMeters+maxPlaneDistance;
        if (dx*dx+dy*dy+dz*dz>limit*limit) continue;
      }
      const projected = surface.projectWorldPoint(point, this.sampleProjection);
      if (projected.planeDistance > maxPlaneDistance || !projected.inside) continue;

      const u = Math.min(surface.widthMeters, Math.max(0, projected.u));
      const v = Math.min(surface.heightMeters, Math.max(0, projected.v));
      const x = Math.min(surface.widthCells - 1, Math.max(0, Math.floor(u / surface.cellSize)));
      const y = Math.min(surface.heightCells - 1, Math.max(0, Math.floor(v / surface.cellSize)));
      const index = surface.index(x, y);
      // A continuous footprint may include the point while its raster
      // cell is inactive. That cell cannot grant or mask genuine ground ink.
      const cellFlags = surface.flagsGrid[index] ?? 0;
      if (cellFlags === 0 || (cellFlags & requiredFlags) !== requiredFlags ||
          (cellFlags & excludedFlags) !== 0 ||
          !this.isPhysicallyBacked(surface,x,y,index)) continue;
      if (!bestSurface || projected.planeDistance < bestDistance) {
        bestSurface = surface;
        bestOwner = surface.ownerGrid[index] as Team;
        bestFlags = cellFlags;
        bestU = u;
        bestV = v;
        bestDistance = projected.planeDistance;
      }
    }

    return bestSurface
      ? { surface: bestSurface, owner: bestOwner, flags: bestFlags,
          u: bestU, v: bestV, planeDistance: bestDistance }
      : null;
  }

  public apply(event: PaintEvent): PaintApplyResult {
    const surface = this.surfaces.get(event.surfaceId);
    if (!surface) throw new Error(`PaintEvent references unknown surface '${event.surfaceId}'.`);
    // A registered surface is not automatically paintable. Reject non-finite
    // brush input before constructing bounds: Infinity could otherwise paint
    // an entire raster, while NaN could produce an untrustworthy visual stamp.
    if (
      (surface.baseFlags & SurfaceFlags.Paintable) === 0 ||
      (event.team !== Team.A && event.team !== Team.B) ||
      !Number.isFinite(event.centerU) ||
      !Number.isFinite(event.centerV) ||
      !Number.isFinite(event.radiusU) ||
      !Number.isFinite(event.radiusV) ||
      !Number.isFinite(event.angle) ||
      !Number.isFinite(event.strength) ||
      !(event.radiusU > 0) ||
      !(event.radiusV > 0) ||
      !(event.strength > 0)
    ) {
      return { changedCells: 0, rasterEligibleCells: 0, rasterAlreadyTeamOwnedCells: 0, testedCells: 0, dirtyTilesTouched: 0, scoreableAreaMeters2Changed: 0, paintableRuns: [] };
    }

    const c = Math.cos(event.angle);
    const s = Math.sin(event.angle);
    const boundU = Math.abs(c) * event.radiusU + Math.abs(s) * event.radiusV;
    const boundV = Math.abs(s) * event.radiusU + Math.abs(c) * event.radiusV;
    const radiusUSq = event.radiusU * event.radiusU;
    const radiusVSq = event.radiusV * event.radiusV;
    // A finite input alone is insufficient: squaring a tiny radius can
    // underflow to zero and squaring a giant radius can overflow. The old
    // inverse then generated 0 * Infinity = NaN, accidentally authorizing
    // raster cells the ellipse did not contain. Fail closed, without
    // creating a substitute stroke or changing real weapon dimensions.
    if (!(radiusUSq > 0) || !(radiusVSq > 0) ||
        !Number.isFinite(radiusUSq) || !Number.isFinite(radiusVSq) ||
        !Number.isFinite(boundU) || !Number.isFinite(boundV) ||
        !Number.isFinite(event.centerU - boundU) ||
        !Number.isFinite(event.centerU + boundU) ||
        !Number.isFinite(event.centerV - boundV) ||
        !Number.isFinite(event.centerV + boundV)) {
      return { changedCells: 0, rasterEligibleCells: 0, rasterAlreadyTeamOwnedCells: 0, testedCells: 0, dirtyTilesTouched: 0, scoreableAreaMeters2Changed: 0, paintableRuns: [] };
    }
    const invRadiusUSq = 1 / radiusUSq;
    const invRadiusVSq = 1 / radiusVSq;

    const minX = Math.max(0, Math.floor((event.centerU - boundU) / surface.cellSize));
    const maxX = Math.min(surface.widthCells - 1, Math.floor((event.centerU + boundU) / surface.cellSize));
    const minY = Math.max(0, Math.floor((event.centerV - boundV) / surface.cellSize));
    const maxY = Math.min(surface.heightCells - 1, Math.floor((event.centerV + boundV) / surface.cellSize));

    if (minX > maxX || minY > maxY) return { changedCells: 0, rasterEligibleCells: 0, rasterAlreadyTeamOwnedCells: 0, testedCells: 0, dirtyTilesTouched: 0, scoreableAreaMeters2Changed: 0, paintableRuns: [] };

    let changedCells = 0;
    let rasterEligibleCells = 0;
    let rasterAlreadyTeamOwnedCells = 0;
    let testedCells = 0;
    let scoreableAreaMeters2Changed = 0;
    const touchedTiles = this.touchedTilesScratch;
    touchedTiles.clear();
    const paintableRuns: PaintRasterRun[] = [];

    for (let y = minY; y <= maxY; y += 1) {
      const cellV = (y + 0.5) * surface.cellSize;
      const dy = cellV - event.centerV;
      let startX = -1;
      for (let x = minX; x <= maxX; x += 1) {
        testedCells += 1;
        const cellU = (x + 0.5) * surface.cellSize;
        const dx = cellU - event.centerU;

        const ellipseU = dx * c + dy * s;
        const ellipseV = -dx * s + dy * c;
        const normalized = ellipseU * ellipseU * invRadiusUSq + ellipseV * ellipseV * invRadiusVSq;
        const index = surface.index(x, y);
        const eligible = Number.isFinite(normalized) && normalized <= 1 &&
          surface.isCellActive(x, y) &&
          (surface.flagsGrid[index]! & SurfaceFlags.Paintable) !== 0 &&
          this.isPhysicallyBacked(surface,x,y,index);
        if (!eligible) {
          if (startX >= 0) {
            paintableRuns.push({ row: y, startX, endXExclusive: x });
            startX = -1;
          }
          continue;
        }
        // Every GPU-drawn cell must come from this authoritative raster.
        // Runs also include same-team cells so wetness may be refreshed.
        if (startX < 0) startX = x;
        rasterEligibleCells += 1;
        const oldOwner = surface.ownerGrid[index] as Team;
        if (oldOwner === event.team) {
          rasterAlreadyTeamOwnedCells += 1;
          continue;
        }

        surface.ownerGrid[index] = event.team;
        changedCells += 1;
        touchedTiles.add(surface.tileIndexForCell(x, y));

        if (surface.isScoreable) {
          const area = (surface.scoreWeightGrid[index] ?? 0) * surface.cellSize * surface.cellSize;
          scoreableAreaMeters2Changed += area;
          if (oldOwner === Team.A) this.areaA -= area;
          else if (oldOwner === Team.B) this.areaB -= area;

          if (event.team === Team.A) this.areaA += area;
          else this.areaB += area;
        }
      }
      if (startX >= 0) {
        paintableRuns.push({ row: y, startX, endXExclusive: maxX + 1 });
      }
    }

    for (const tileIndex of touchedTiles) surface.markTileChanged(tileIndex);
    return {
      changedCells,
      rasterEligibleCells,
      rasterAlreadyTeamOwnedCells,
      testedCells,
      dirtyTilesTouched: touchedTiles.size,
      scoreableAreaMeters2Changed,
      paintableRuns
    };
  }

  public snapshot(): TurfSnapshot {
    const total = Math.max(this.totalScoreableArea, 1e-9);
    return {
      areaA: Math.max(0, this.areaA),
      areaB: Math.max(0, this.areaB),
      neutralArea: Math.max(0, total - this.areaA - this.areaB),
      totalScoreableArea: total,
      percentA: Math.max(0, this.areaA) / total * 100,
      percentB: Math.max(0, this.areaB) / total * 100
    };
  }

  public totalDirtyTiles(): number {
    let result = 0;
    for (const surface of this.surfaces.values()) result += surface.dirtyTileCount();
    return result;
  }

  public reset(): void {
    this.areaA = 0;
    this.areaB = 0;
    for (const surface of this.surfaces.values()) surface.resetOwnership();
  }
}
