import { Vec3 } from 'playcanvas';
import { SurfaceFlags, Team, type AtlasRect } from './types';

export interface SurfaceRayHit {
  surface: PaintSurface;
  distance: number;
  worldPoint: Vec3;
  u: number;
  v: number;
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
    public readonly tileSizeCells: number
  ) {
    this.uAxis = this.uAxis.clone().normalize();
    this.vAxis = this.vAxis.clone().normalize();
    this.normal = cross(this.uAxis, this.vAxis).normalize();

    this.widthCells = Math.ceil(widthMeters / cellSize);
    this.heightCells = Math.ceil(heightMeters / cellSize);
    const cellCount = this.widthCells * this.heightCells;

    this.ownerGrid = new Int8Array(cellCount);
    this.flagsGrid = new Uint16Array(cellCount);
    this.flagsGrid.fill(baseFlags);
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

  public intersectRay(origin: Vec3, direction: Vec3): SurfaceRayHit | null {
    const denom = this.normal.dot(direction);
    if (Math.abs(denom) < 1e-6) return null;

    const toPlane = this.center.clone().sub(origin);
    const distance = toPlane.dot(this.normal) / denom;
    if (distance <= 0) return null;

    const worldPoint = direction.clone().mulScalar(distance).add(origin);
    const rel = worldPoint.clone().sub(this.center);
    const localUCentered = rel.dot(this.uAxis);
    const localVCentered = rel.dot(this.vAxis);
    const u = localUCentered + this.widthMeters * 0.5;
    const v = localVCentered + this.heightMeters * 0.5;

    const epsilon = 1e-4;
    if (u < -epsilon || v < -epsilon || u > this.widthMeters + epsilon || v > this.heightMeters + epsilon) {
      return null;
    }

    return {
      surface: this,
      distance,
      worldPoint,
      u: Math.min(this.widthMeters, Math.max(0, u)),
      v: Math.min(this.heightMeters, Math.max(0, v))
    };
  }

  private initializeWeights(): void {
    for (let y = 0; y < this.heightCells; y += 1) {
      const remainingV = this.heightMeters - y * this.cellSize;
      const fractionV = Math.min(1, Math.max(0, remainingV / this.cellSize));
      for (let x = 0; x < this.widthCells; x += 1) {
        const remainingU = this.widthMeters - x * this.cellSize;
        const fractionU = Math.min(1, Math.max(0, remainingU / this.cellSize));
        this.scoreWeightGrid[this.index(x, y)] = fractionU * fractionV;
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
