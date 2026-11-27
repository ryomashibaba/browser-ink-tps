import { Vec3 } from 'playcanvas';
import { SurfaceFlags, Team, type AtlasRect } from './types';
import {
  pointInStageFootprint,
  rasterizeStageFootprint,
  type StageFootprint,
  type StageFootprintRect
} from '../stage/StageFootprint';

export interface SurfaceRayHit {
  surface: PaintSurface;
  distance: number;
  worldPoint: Vec3;
  u: number;
  v: number;
}

export interface SurfaceProjection {
  u: number;
  v: number;
  signedPlaneDistance: number;
  planeDistance: number;
  inside: boolean;
}

// The local F4 collider and ink renderer use the same registration envelope.
export const F4_PAINT_PLANE_TOLERANCE = 0.055;
export const F4_PAINT_NORMAL_ALIGNMENT = 0.95;

/** SOURCE-only paint contact: the actual owner-grid/paint raster is
 * authoritative. An intersection with an inactive original-floor cell is
 * not a paint impact and must not intercept a real bullet or crosshair.
 * No change to physics colliders, CPU routing, score or frozen T20. */
/** SOURCE-only actual editable raster cell. A projected footprint may
 * geometrically contain the point but have no active, paintable cell.
 * Used for both live bullet hits and real bomb impact stamp selection. */
export function sourceRegisteredPaintCellActive(
 surface:PaintSurface,u:number,v:number
):boolean{
 // GPU/CPU paint admission also requires the registered surface itself
 // to be paintable; a stray per-cell flag cannot create SOURCE paint.
 if((surface.baseFlags&SurfaceFlags.Paintable)===0||
    !Number.isFinite(u)||!Number.isFinite(v)||
    u<0||v<0||u>surface.widthMeters||v>surface.heightMeters)return false;
 const x=Math.min(surface.widthCells-1,Math.max(0,
  Math.floor(u/surface.cellSize)));
 const y=Math.min(surface.heightCells-1,Math.max(0,
  Math.floor(v/surface.cellSize)));
 return surface.isCellActive(x,y)&&
  ((surface.flagsGrid[surface.index(x,y)]??0)&SurfaceFlags.Paintable)!==0;
}
export function sourceRegisteredPaintHitActive(
 surface:PaintSurface,hit:SurfaceRayHit
):boolean{
 // A ray hit's original registered plane must match the plane being
 // authorized. Coordinates from a different surface are not transferable.
 return hit.surface===surface&&
  Number.isFinite(hit.distance)&&hit.distance>=0&&
  sourceRegisteredPaintCellActive(surface,hit.u,hit.v);
}

/** TRUE SOURCE thrown SUB: 6cm paint-plane/backing-solid registration
 * tolerance exists only for that SAME registered original solid.
 * An unrelated solid in front is actual Rapier cover, never permission
 * to collide/paint through it. Frozen T20 keeps the legacy 6cm tolerance.
 * The caller still runs its authentic thrown-SUB collision and fuse. */
export function sourceThrownSubPaintBeforeRegisteredSolid(
 paintHit:SurfaceRayHit|null,
 blockerHit:{readonly distance:number;readonly solidId?:string}|null,
 nativeSource:boolean,
 legacyCoplanarToleranceMeters:number
):boolean{
 if(!paintHit)return false;
 // Preserve historical non-SOURCE paint-plane priority literally.
 if(!nativeSource)return !blockerHit||
  paintHit.distance<=blockerHit.distance+legacyCoplanarToleranceMeters;
 // The actual SubWeapon/CpuKit findNearestSurfaceHit() already checks
 // the registered paintable cell. Do not independently reconstruct a
 // second, possibly divergent collision witness from this accepted hit.
 if(!Number.isFinite(paintHit.distance)||paintHit.distance<0)return false;
 if(!blockerHit)return true;
 if(!Number.isFinite(blockerHit.distance)||blockerHit.distance<0)return false;
 if(paintHit.distance<=blockerHit.distance)return true;
 // Never treat a different original floor/wall merely within 6cm as
 // the paint backing: a close parallel surface can be true cover.
 return typeof blockerHit.solidId==='string'&&
  paintHit.surface.id===blockerHit.solidId+':paint'&&
  Number.isFinite(legacyCoplanarToleranceMeters)&&
  legacyCoplanarToleranceMeters>=0&&
  paintHit.distance<=blockerHit.distance+legacyCoplanarToleranceMeters;
}

/** SOURCE bomb/SPECIAL owner-grid stamps cannot select a PAINT plane
 * behind a DIFFERENT registered Rapier solid. A terminal collision with
 * the plane's OWN backing retains the existing 6cm alignment tolerance.
 * Only the actual registered stage hit is consulted; no source topology,
 * collider, surface/ownerGrid, actor or scoring is authored. */
export function sourceOriginalBlastPaintLineClear(
  origin:Vec3,paintPlanePoint:Vec3,paintSurface:PaintSurface,
  blocker:{readonly distance:number;readonly solidId?:string}|null
):boolean{
 const span=origin.distance(paintPlanePoint);
 if(!Number.isFinite(span))return false;
 if(!blocker)return true;
 if(!Number.isFinite(blocker.distance)||blocker.distance<0)return false;
 // A different ORIGINAL solid is an obstacle even one centimeter
 // before this plane. The former unconditional 2.5cm tolerance leaked
 // live bombs, specials and trails through thin registered walls.
 // A hit at/after the destination plane is not an intervening obstacle.
 if(blocker.distance>=span)return true;
 return typeof blocker.solidId==='string'&&
  paintSurface.id===blocker.solidId+':paint'&&
  blocker.distance>=Math.max(0,span-.06);
}

export class PaintSurface {
  public readonly ownerGrid: Int8Array;
  public readonly flagsGrid: Uint16Array;
  public readonly scoreWeightGrid: Float32Array;
  public readonly dirtyTiles: Uint8Array;
  public readonly tileRevisions: Uint32Array;
  public readonly widthCells: number;
  public readonly heightCells: number;
  public readonly tilesX: number;
  public readonly tilesY: number;
  public readonly normal: Vec3;
  private readonly footprintRects: readonly StageFootprintRect[] | null;
  private readonly activeCellMask: Uint8Array | null;
  public atlasRect: AtlasRect | null = null;

  public constructor(
    public readonly id: string,
    public readonly center: Vec3,
    public readonly uAxis: Vec3,
    public readonly vAxis: Vec3,
    public readonly widthMeters: number,
    public readonly heightMeters: number,
    public readonly cellSize: number,
    public readonly baseFlags: SurfaceFlags,
    public readonly tileSizeCells: number,
    public readonly footprint?: StageFootprint
  ) {
    if (!Number.isFinite(widthMeters) || widthMeters <= 0) throw new Error(`PaintSurface ${id} has invalid width.`);
    if (!Number.isFinite(heightMeters) || heightMeters <= 0) throw new Error(`PaintSurface ${id} has invalid height.`);
    if (!Number.isFinite(cellSize) || cellSize <= 0) throw new Error(`PaintSurface ${id} has invalid cell size.`);
    if (!Number.isInteger(tileSizeCells) || tileSizeCells <= 0) throw new Error(`PaintSurface ${id} has invalid tile size.`);
    if (this.uAxis.lengthSq() < 1e-10 || this.vAxis.lengthSq() < 1e-10) {
      throw new Error(`PaintSurface ${id} has a zero-length basis axis.`);
    }

    this.uAxis = this.uAxis.clone().normalize();
    this.vAxis = this.vAxis.clone().normalize();
    if (Math.abs(this.uAxis.dot(this.vAxis)) > 1e-4) {
      throw new Error(`PaintSurface ${id} basis axes must be orthogonal.`);
    }

    this.normal = cross(this.uAxis, this.vAxis);
    if (this.normal.lengthSq() < 1e-10) throw new Error(`PaintSurface ${id} has an invalid normal.`);
    this.normal.normalize();

    this.widthCells = Math.ceil(widthMeters / cellSize);
    this.heightCells = Math.ceil(heightMeters / cellSize);
    const cellCount = this.widthCells * this.heightCells;

    if (footprint && Math.abs(footprint.cellSizeMeters - cellSize) > 1e-6) {
      throw new Error(
        `PaintSurface ${id} footprint cell size ${footprint.cellSizeMeters}m must match gameplay ink cell size ${cellSize}m.`
      );
    }
    const footprintRaster = footprint
      ? rasterizeStageFootprint(widthMeters, heightMeters, footprint)
      : null;
    if (
      footprintRaster &&
      (footprintRaster.widthCells !== this.widthCells ||
        footprintRaster.depthCells !== this.heightCells)
    ) {
      throw new Error(`PaintSurface ${id} footprint raster dimensions do not match the gameplay grid.`);
    }
    this.activeCellMask = footprintRaster?.active ?? null;
    this.footprintRects = footprintRaster?.rectangles ?? null;

    this.ownerGrid = new Int8Array(cellCount);
    this.flagsGrid = new Uint16Array(cellCount);
    this.flagsGrid.fill(baseFlags);
    if (this.activeCellMask) {
      for (let i = 0; i < cellCount; i += 1) {
        if (this.activeCellMask[i] === 0) this.flagsGrid[i] = 0;
      }
    }
    this.scoreWeightGrid = new Float32Array(cellCount);

    this.tilesX = Math.ceil(this.widthCells / tileSizeCells);
    this.tilesY = Math.ceil(this.heightCells / tileSizeCells);
    this.dirtyTiles = new Uint8Array(this.tilesX * this.tilesY);
    this.tileRevisions = new Uint32Array(this.tilesX * this.tilesY);

    this.initializeWeights();
  }

  public get isScoreable(): boolean {
    return (this.baseFlags & SurfaceFlags.Scoreable) !== 0;
  }

  public get scoreableAreaMeters2(): number {
    if (!this.isScoreable) return 0;
    let weightedCells = 0;
    for (let i = 0; i < this.scoreWeightGrid.length; i += 1) {
      weightedCells += this.scoreWeightGrid[i] ?? 0;
    }
    return weightedCells * this.cellSize * this.cellSize;
  }

  public index(x: number, y: number): number {
    return y * this.widthCells + x;
  }

  public tileIndexForCell(x: number, y: number): number {
    const tx = Math.floor(x / this.tileSizeCells);
    const ty = Math.floor(y / this.tileSizeCells);
    return ty * this.tilesX + tx;
  }

  // F4 presentation sampler: footprint is immutable after construction.
  // Owner values are always read live; no ownership or tile-revision cache.
  private f4ActiveCellCount?:number;
  public readF4OwnerGridCounts():{a:number;b:number;n:number;reason:'INK_OUTSIDE_ORIGINAL_FOOTPRINT'|'UNRECOGNIZED_ORIGINAL_OWNER'|null} {
    const owners=this.ownerGrid,mask=this.activeCellMask;
    if(this.f4ActiveCellCount===undefined){
      let count=owners.length;
      if(mask){count=0;for(let i=0;i<owners.length;i++)if(mask[i]!==0)count++;}
      this.f4ActiveCellCount=count;
    }
    let a=0,b=0;
    for(let i=0;i<owners.length;i++){
      const owner=owners[i];
      // Neutral is valid both inside and outside the original footprint.
      if(owner===0)continue;
      if(mask&&mask[i]===0)return {a:0,b:0,n:0,reason:'INK_OUTSIDE_ORIGINAL_FOOTPRINT'};
      if(owner===1)a++;
      else if(owner===-1)b++;
      else return {a:0,b:0,n:0,reason:'UNRECOGNIZED_ORIGINAL_OWNER'};
    }
    return {a,b,n:this.f4ActiveCellCount-a-b,reason:null};
  }

  public isCellActive(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.widthCells || y >= this.heightCells) return false;
    if (!this.activeCellMask) return true;
    return this.activeCellMask[this.index(x, y)] !== 0;
  }

  public get activeFootprintRectangles(): readonly StageFootprintRect[] | null {
    return this.footprintRects;
  }

  public markTileChanged(tileIndex: number): void {
    this.dirtyTiles[tileIndex] = 1;
    this.tileRevisions[tileIndex] = (this.tileRevisions[tileIndex] ?? 0) + 1;
  }

  public dirtyTileCount(): number {
    let count = 0;
    for (let i = 0; i < this.dirtyTiles.length; i += 1) count += this.dirtyTiles[i] ? 1 : 0;
    return count;
  }

  public clearDirtyFlags(): void {
    this.dirtyTiles.fill(0);
  }

  public resetOwnership(): void {
    this.ownerGrid.fill(Team.Neutral);
    this.dirtyTiles.fill(1);
    for (let i = 0; i < this.tileRevisions.length; i += 1) {
      this.tileRevisions[i] = (this.tileRevisions[i] ?? 0) + 1;
    }
  }

  public localToWorld(u: number, v: number, out = new Vec3()): Vec3 {
    const centeredU = u - this.widthMeters * 0.5;
    const centeredV = v - this.heightMeters * 0.5;
    out.copy(this.center);
    out.x += this.uAxis.x * centeredU + this.vAxis.x * centeredV;
    out.y += this.uAxis.y * centeredU + this.vAxis.y * centeredV;
    out.z += this.uAxis.z * centeredU + this.vAxis.z * centeredV;
    return out;
  }

  /**
   * Canonical world -> PaintSurface conversion.
   * Gameplay sampling and hit resolution must use this instead of duplicating basis math.
   */
  public projectWorldPoint(point: Vec3, out?: SurfaceProjection): SurfaceProjection {
    // Original basis projection in scalar form avoids allocating a Vec3
    // for every sampled registered floor. This is a hot path for SOURCE
    // CPU ink searches and the player's authentic Rapier-supported foot.
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const dz = point.z - this.center.z;
    const signedPlaneDistance =
      dx * this.normal.x + dy * this.normal.y + dz * this.normal.z;
    const u = dx * this.uAxis.x + dy * this.uAxis.y +
      dz * this.uAxis.z + this.widthMeters * 0.5;
    const v = dx * this.vAxis.x + dy * this.vAxis.y +
      dz * this.vAxis.z + this.heightMeters * 0.5;
    const epsilon = 1e-4;
    const planeDistance = Math.abs(signedPlaneDistance);
    const inside =
      u >= -epsilon &&
      v >= -epsilon &&
      u <= this.widthMeters + epsilon &&
      v <= this.heightMeters + epsilon &&
      (!this.footprint || pointInStageFootprint(u, v, this.footprint));
    // Only the SOURCE sampling hot path supplies a reusable result.
    // All existing callers still receive an independent projection object.
    if (out) {
      out.u = u;
      out.v = v;
      out.signedPlaneDistance = signedPlaneDistance;
      out.planeDistance = planeDistance;
      out.inside = inside;
      return out;
    }
    return { u, v, signedPlaneDistance, planeDistance, inside };
  }

  public assertCoordinateRoundTrip(tolerance = 1e-5): number {
    const probes: readonly [number, number][] = [
      [0, 0],
      [this.widthMeters, 0],
      [this.widthMeters, this.heightMeters],
      [0, this.heightMeters],
      [this.widthMeters * 0.5, this.heightMeters * 0.5],
      [this.widthMeters * 0.25, this.heightMeters * 0.75]
    ];
    let maxError = 0;

    for (const [u, v] of probes) {
      const projected = this.projectWorldPoint(this.localToWorld(u, v));
      const error = Math.max(
        Math.abs(projected.u - u),
        Math.abs(projected.v - v),
        projected.planeDistance
      );
      maxError = Math.max(maxError, error);
      if (!projected.inside || error > tolerance) {
        throw new Error(
          `PaintSurface ${this.id} coordinate round-trip failed at (${u}, ${v}); error=${error}.`
        );
      }
    }
    return maxError;
  }

  public intersectRay(origin: Vec3, direction: Vec3): SurfaceRayHit | null {
    const denom = this.normal.dot(direction);
    if (Math.abs(denom) < 1e-6) return null;

    // Do not allocate a transient toPlane Vec3 for every actual projectile
    // or sub-weapon ray. Only a genuine forward intersection allocates the
    // hit point that the caller already needs for authoritative physics.
    const toPlaneX = this.center.x - origin.x;
    const toPlaneY = this.center.y - origin.y;
    const toPlaneZ = this.center.z - origin.z;
    const distance = (
      toPlaneX * this.normal.x +
      toPlaneY * this.normal.y +
      toPlaneZ * this.normal.z
    ) / denom;
    if (!(distance > 0) || !Number.isFinite(distance)) return null;

    const worldPoint = new Vec3(
      direction.x * distance + origin.x,
      direction.y * distance + origin.y,
      direction.z * distance + origin.z
    );
    const projected = this.projectWorldPoint(worldPoint);
    if (!projected.inside) return null;

    return {
      surface: this,
      distance,
      worldPoint,
      u: Math.min(this.widthMeters, Math.max(0, projected.u)),
      v: Math.min(this.heightMeters, Math.max(0, projected.v))
    };
  }

  public intersectSegment(from: Vec3, to: Vec3): SurfaceRayHit | null {
    const segment = to.clone().sub(from);
    const length = segment.length();
    if (length <= 1e-8) return null;

    const hit = this.intersectRay(from, segment.mulScalar(1 / length));
    if (!hit || hit.distance > length + 1e-5) return null;
    return hit;
  }

  private initializeWeights(): void {
    for (let y = 0; y < this.heightCells; y += 1) {
      const remainingV = this.heightMeters - y * this.cellSize;
      const fractionV = Math.min(1, Math.max(0, remainingV / this.cellSize));
      for (let x = 0; x < this.widthCells; x += 1) {
        const remainingU = this.widthMeters - x * this.cellSize;
        const fractionU = Math.min(1, Math.max(0, remainingU / this.cellSize));
        const index = this.index(x, y);
        this.scoreWeightGrid[index] = this.isCellActive(x, y)
          ? fractionU * fractionV
          : 0;
      }
    }
  }
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return new Vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}
