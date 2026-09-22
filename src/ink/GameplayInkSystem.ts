import { Vec3 } from 'playcanvas';
import type { PaintEvent, TurfSnapshot } from './types';
import { SurfaceFlags, Team } from './types';
import type { PaintSurface } from './PaintSurface';

export interface PaintApplyResult {
  changedCells: number;
  testedCells: number;
  dirtyTilesTouched: number;
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

  /**
   * Samples the authoritative CPU gameplay ink near a world-space point.
   * This projects onto each PaintSurface's own local basis; there is no global XZ ink grid.
   */
  public sampleWorld(
    point: Vec3,
    maxPlaneDistance = 0.4,
    requiredFlags = 0,
    excludedFlags = 0
  ): GameplayInkSample | null {
    let best: GameplayInkSample | null = null;

    for (const surface of this.surfaces.values()) {
      if (requiredFlags !== 0 && (surface.baseFlags & requiredFlags) !== requiredFlags) continue;
      if (excludedFlags !== 0 && (surface.baseFlags & excludedFlags) !== 0) continue;
      const rel = point.clone().sub(surface.center);
      const signedPlaneDistance = rel.dot(surface.normal);
      const planeDistance = Math.abs(signedPlaneDistance);
      if (planeDistance > maxPlaneDistance) continue;

      const u = rel.dot(surface.uAxis) + surface.widthMeters * 0.5;
      const v = rel.dot(surface.vAxis) + surface.heightMeters * 0.5;
      if (u < 0 || v < 0 || u > surface.widthMeters || v > surface.heightMeters) continue;

      const x = Math.min(surface.widthCells - 1, Math.max(0, Math.floor(u / surface.cellSize)));
      const y = Math.min(surface.heightCells - 1, Math.max(0, Math.floor(v / surface.cellSize)));
      const index = surface.index(x, y);
      const candidate: GameplayInkSample = {
        surface,
        owner: surface.ownerGrid[index] as Team,
        flags: surface.flagsGrid[index] ?? surface.baseFlags,
        u,
        v,
        planeDistance
      };

      if (!best || candidate.planeDistance < best.planeDistance) best = candidate;
    }

    return best;
  }

  public apply(event: PaintEvent): PaintApplyResult {
    const surface = this.surfaces.get(event.surfaceId);
    if (!surface) throw new Error(`PaintEvent references unknown surface '${event.surfaceId}'.`);
    if (!(event.radiusU > 0) || !(event.radiusV > 0) || !(event.strength > 0)) {
      return { changedCells: 0, testedCells: 0, dirtyTilesTouched: 0 };
    }

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
