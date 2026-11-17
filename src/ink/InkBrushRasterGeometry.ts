import type { PaintRasterRun } from './GameplayInkSystem';
import type { PaintSurface } from './PaintSurface';
import type { PaintEvent } from './types';
import { localMetersToBrushAtlas } from './AtlasCoordinates';

/**
 * CPU-approved row runs are the only source of GPU brush geometry.
 * One quad covers a contiguous run, not a full unconstrained ellipse:
 * a non-paintable neighboring cell can never acquire a new atlas pixel.
 */
export interface InkBrushVertex {
  x: number;
  y: number;
  uvX: number;
  uvY: number;
}

export interface InkBrushQuad {
  vertices: readonly [InkBrushVertex, InkBrushVertex, InkBrushVertex, InkBrushVertex];
  clipMinX: number;
  clipMinY: number;
  clipMaxX: number;
  clipMaxY: number;
}

/**
 * Crops the original rotated ellipse to authoritative cell rows.
 * The UV is an affine inverse of the original rotated brush transform;
 * the existing GLSL/WGSL circular discard therefore keeps the real
 * ellipse silhouette even though these quads are axis-aligned.
 *
 * No floor, raster authorization, ownership or scoring is inferred here.
 */
export function buildInkBrushRasterQuads(
  surface: PaintSurface,
  event: PaintEvent,
  runs: readonly PaintRasterRun[]
): InkBrushQuad[] {
  const atlas = surface.atlasRect;
  if (!atlas) throw new Error(`No atlas allocation for PaintSurface ${surface.id}`);
  if (runs.length === 0) return [];

  const c = Math.cos(event.angle);
  const s = Math.sin(event.angle);
  const boundU = Math.abs(c) * event.radiusU + Math.abs(s) * event.radiusV;
  const boundV = Math.abs(s) * event.radiusU + Math.abs(c) * event.radiusV;
  const center = localMetersToBrushAtlas(atlas, event.centerU, event.centerV);
  const radiusX = event.radiusU * atlas.pixelsPerMeter / atlas.atlasSize;
  const radiusY = event.radiusV * atlas.pixelsPerMeter / atlas.atlasSize;
  const scale = atlas.pixelsPerMeter / atlas.atlasSize;

  if (!(radiusX > 0 && radiusY > 0) ||
      !Number.isFinite(boundU) || !Number.isFinite(boundV) ||
      !Number.isFinite(center.x) || !Number.isFinite(center.y)) return [];

  const quads: InkBrushQuad[] = [];
  for (const run of runs) {
    // Fail closed on stale or malformed raster spans.
    if (!Number.isInteger(run.row) || !Number.isInteger(run.startX) ||
        !Number.isInteger(run.endXExclusive) ||
        run.row < 0 || run.row >= surface.heightCells ||
        run.startX < 0 || run.endXExclusive > surface.widthCells ||
        run.startX >= run.endXExclusive) continue;

    const minU = Math.max(0, run.startX * surface.cellSize, event.centerU - boundU);
    const maxU = Math.min(surface.widthMeters, run.endXExclusive * surface.cellSize, event.centerU + boundU);
    const minV = Math.max(0, run.row * surface.cellSize, event.centerV - boundV);
    const maxV = Math.min(surface.heightMeters, (run.row + 1) * surface.cellSize, event.centerV + boundV);
    if (minU >= maxU || minV >= maxV) continue;

    const x0 = (atlas.x / atlas.atlasSize) + minU * scale;
    const x1 = (atlas.x / atlas.atlasSize) + maxU * scale;
    const y0 = (atlas.y + atlas.height) / atlas.atlasSize - maxV * scale;
    const y1 = (atlas.y + atlas.height) / atlas.atlasSize - minV * scale;

    const vertex = (x: number, y: number): InkBrushVertex => {
      const dx = x - center.x;
      const dy = y - center.y;
      return {
        x,
        y,
        uvX: 0.5 + (dx * c - dy * s) / (2 * radiusX),
        uvY: 0.5 + (-dx * s - dy * c) / (2 * radiusY)
      };
    };

    quads.push({
      vertices: [
        vertex(x0, y1),
        vertex(x1, y1),
        vertex(x1, y0),
        vertex(x0, y0)
      ],
      clipMinX: x0,
      clipMinY: y0,
      clipMaxX: x1,
      clipMaxY: y1
    });
  }
  return quads;
}
