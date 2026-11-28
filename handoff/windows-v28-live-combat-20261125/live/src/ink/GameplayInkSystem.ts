import { Vec3 } from 'playcanvas';
import type { PaintEvent, TurfSnapshot } from './types';
import { SurfaceFlags, Team } from './types';
import type { PaintSurface, SurfaceProjection } from './PaintSurface';
import {F4ProvisionalTurf} from './F4ProvisionalTurf.mjs';

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
  /** F4 research only, actual projected ownership transitions. */
  f4ProvisionalProjectedAreaM2Changed?:number;
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
  private f4ProvisionalTurf:F4ProvisionalTurf|null=null;

  public enableF4ProvisionalTurf(requireExtra=false):boolean{
    if(!this.backedCell||this.f4ProvisionalTurf)return false;
    this.f4ProvisionalTurf=new F4ProvisionalTurf([...this.surfaces.values()],
      (s,x,y,index)=>this.isPhysicallyBacked(s,x,y,index),requireExtra);
    return true;
  }
  public scanF4ProvisionalTurf(limit:number,keepGoing:()=>boolean):void{
    this.f4ProvisionalTurf?.scan(limit,keepGoing);
  }
  public readF4ProvisionalTurf(){return this.f4ProvisionalTurf?.read()??null;}
  public finishF4ProvisionalTurf(tick:number){return this.f4ProvisionalTurf?.finish(tick)??null;}

  public setPhysicalPaintBacking(
    backing:((surface:PaintSurface,u:number,v:number)=>boolean)|null
  ):void{
    this.f4ProvisionalTurf=null;
    this.backedCell=backing;
    this.backingCache.clear();
  }

  private isPhysicallyBacked(surface:PaintSurface,x:number,y:number,index:number):boolean{
    // A provisional wall has no paint/ink authority without live mesh backing.
    if(!this.backedCell)return !surface.id.startsWith('F4ProvisionalWall:')&&!surface.id.startsWith('F4ProvisionalFloor:');
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
    this.f4ProvisionalTurf=null;
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

  /** Read-only seam proof; use the very same five-ray raster backing cache. */
  public isF4WallCellBacked(surface:PaintSurface,x:number,y:number):boolean{
    if(!this.backedCell||!surface.id.startsWith('F4ProvisionalWall:')||
       this.surfaces.get(surface.id)!==surface||!Number.isInteger(x)||!Number.isInteger(y)||
       !surface.isCellActive(x,y))return false;
    const index=surface.index(x,y),required=SurfaceFlags.Paintable|SurfaceFlags.Wall;
    return ((surface.flagsGrid[index]??0)&required)===required&&
      this.isPhysicallyBacked(surface,x,y,index);
  }

  /** Boot rollback only; never remove the frozen SOURCE registration. */
  public unregisterF4ProvisionalSurface(surface:PaintSurface):void{
    if((!surface.id.startsWith('F4ProvisionalWall:')&&!surface.id.startsWith('F4ProvisionalFloor:'))||surface.isScoreable||
       this.surfaces.get(surface.id)!==surface)return;
    this.surfaces.delete(surface.id);
    this.backingCache.delete(surface.id);
    const index=this.sampleBounds.findIndex(row=>row.surface===surface);
    if(index>=0)this.sampleBounds.splice(index,1);
    this.f4ProvisionalTurf=null;
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
      // A farther (or tied, later) surface cannot replace the existing best.
      // F4 only: avoid unnecessary backing queries, keep registration order.
      if(this.f4ProvisionalTurf&&bestSurface&&projected.planeDistance>=bestDistance)continue;

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
    const provisional=this.f4ProvisionalTurf;
    // Cache entries describe immutable physical backing, never paint ownership.
    // The same synchronous brush visits one registered surface; reuse its
    // existing cache rather than looking it up again for every covered cell.
    const brushBacking=provisional&&this.backedCell?this.backingCache.get(surface.id):undefined;
    let provisionalDelta=0;
    const touchedTiles = this.touchedTilesScratch;
    touchedTiles.clear();
    const paintableRuns: PaintRasterRun[] = [];

    for (let y = minY; y <= maxY; y += 1) {
      const cellV = (y + 0.5) * surface.cellSize;
      const dy = cellV - event.centerV;
      const dySin = dy * s, dyCos = dy * c;
      let startX = -1;
      // F4: each row is monotonic in X. The first changed cell in a tile
      // already inserts that tile in the same Set order; further changed
      // cells in its horizontal interval need no duplicate lookup/add.
      let nextDirtyTileX = -1;
      for (let x = minX; x <= maxX; x += 1) {
        testedCells += 1;
        const cellU = (x + 0.5) * surface.cellSize;
        const dx = cellU - event.centerU;

        const ellipseU = dx * c + dySin;
        const ellipseV = -dx * s + dyCos;
        const normalized = ellipseU * ellipseU * invRadiusUSq + ellipseV * ellipseV * invRadiusVSq;
        const index = surface.index(x, y);
        const eligible = Number.isFinite(normalized) && normalized <= 1 &&
          surface.isCellActive(x, y) &&
          (surface.flagsGrid[index]! & SurfaceFlags.Paintable) !== 0 &&
          (brushBacking?.[index]===1||
           (brushBacking?.[index]!==2&&this.isPhysicallyBacked(surface,x,y,index)));
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

        if(provisional)provisionalDelta+=provisional.beforeChange(surface,index,oldOwner,event.team);
        surface.ownerGrid[index] = event.team;
        changedCells += 1;
        if (!provisional || x >= nextDirtyTileX) {
          touchedTiles.add(surface.tileIndexForCell(x, y));
          const size=surface.tileSizeCells;
          nextDirtyTileX=Number.isInteger(size)&&size>0? (Math.floor(x/size)+1)*size : x+1;
        }

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
      ...(provisional?{f4ProvisionalProjectedAreaM2Changed:provisionalDelta}:{}),
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
    this.f4ProvisionalTurf=null;
    this.areaA = 0;
    this.areaB = 0;
    for (const surface of this.surfaces.values()) surface.resetOwnership();
  }
}
