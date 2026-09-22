import type { PaintEvent, TurfSnapshot } from './types';
import { Team } from './types';
import type { PaintSurface } from './PaintSurface';

export interface PaintApplyResult {
  changedCells: number;
  testedCells: number;
  dirtyTilesTouched: number;
}

export class GameplayInkSystem {
  private readonly surfaces = new Map<string, PaintSurface>();
  private areaA = 0;
  private areaB = 0;
  private totalScoreableArea = 0;

  public registerSurface(surface: PaintSurface): void {
    if (this.surfaces.has(surface.id)) throw new Error(`Duplicate PaintSurface id: ${surface.id}`);
    this.surfaces.set(surface.id, surface);
    this.totalScoreableArea += surface.scoreableAreaMeters2;
  }

  public getSurface(id: string): PaintSurface | undefined {
    return this.surfaces.get(id);
  }

  public getSurfaces(): readonly PaintSurface[] {
    return [...this.surfaces.values()];
  }

  public apply(event: PaintEvent): PaintApplyResult {
    const surface = this.surfaces.get(event.surfaceId);
    if (!surface) throw new Error(`PaintEvent references unknown surface '${event.surfaceId}'.`);
    if (!(event.radiusU > 0) || !(event.radiusV > 0) || !(event.strength > 0)) {
      return { changedCells: 0, testedCells: 0, dirtyTilesTouched: 0 };
    }

    // Required freeze behavior: sin/cos are computed once per PaintEvent, not per cell.
    const c = Math.cos(event.angle);
    const s = Math.sin(event.angle);
    const boundU = Math.abs(c) * event.radiusU + Math.abs(s) * event.radiusV;
    const boundV = Math.abs(s) * event.radiusU + Math.abs(c) * event.radiusV;
    const invRadiusUSq = 1 / (event.radiusU * event.radiusU);
    const invRadiusVSq = 1 / (event.radiusV * event.radiusV);

    const minX = Math.max(0, Math.floor((event.centerU - boundU) / surface.cellSize));
    const maxX = Math.min(surface.widthCells - 1, Math.floor((event.centerU + boundU) / surface.cellSize));
    const minY = Math.max(0, Math.floor((event.centerV - boundV) / surface.cellSize));
    const maxY = Math.min(surface.heightCells - 1, Math.floor((event.centerV + boundV) / surface.cellSize));

    if (minX > maxX || minY > maxY) return { changedCells: 0, testedCells: 0, dirtyTilesTouched: 0 };

    let changedCells = 0;
    let testedCells = 0;
    const touchedTiles = new Set<number>();

    for (let y = minY; y <= maxY; y += 1) {
      const cellV = (y + 0.5) * surface.cellSize;
      const dy = cellV - event.centerV;
      for (let x = minX; x <= maxX; x += 1) {
        testedCells += 1;
        const cellU = (x + 0.5) * surface.cellSize;
        const dx = cellU - event.centerU;

        const ellipseU = dx * c + dy * s;
        const ellipseV = -dx * s + dy * c;
        const normalized = ellipseU * ellipseU * invRadiusUSq + ellipseV * ellipseV * invRadiusVSq;
        if (normalized > 1) continue;

        const index = surface.index(x, y);
        const oldOwner = surface.ownerGrid[index] as Team;
        if (oldOwner === event.team) continue;

        surface.ownerGrid[index] = event.team;
        changedCells += 1;
        touchedTiles.add(surface.tileIndexForCell(x, y));

        if (surface.isScoreable) {
          const area = (surface.scoreWeightGrid[index] ?? 0) * surface.cellSize * surface.cellSize;
          if (oldOwner === Team.A) this.areaA -= area;
          else if (oldOwner === Team.B) this.areaB -= area;

          if (event.team === Team.A) this.areaA += area;
          else this.areaB += area;
        }
      }
    }

    for (const tileIndex of touchedTiles) surface.markTileChanged(tileIndex);
    return { changedCells, testedCells, dirtyTilesTouched: touchedTiles.size };
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
