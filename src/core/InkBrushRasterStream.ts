import { Team, type AtlasRect } from '../ink/types';
import type { InkBrushGpuBuffers } from './InkBrushGpuPacking';

/** Structural, read-only view of an existing INK-authorized paint surface. */
export interface InkStreamSurface {
  readonly id: string;
  readonly atlasRect: AtlasRect | null;
  readonly widthCells: number;
  readonly heightCells: number;
  readonly widthMeters: number;
  readonly heightMeters: number;
  readonly cellSize: number;
}

/** The caller provides the immutable paint event and CPU-authorized row runs. */
export interface InkStreamEvent {
  readonly team: Team.A | Team.B;
  readonly strength: number;
  readonly centerU: number;
  readonly centerV: number;
  readonly radiusU: number;
  readonly radiusV: number;
  readonly angle: number;
}

export interface InkStreamRun {
  readonly row: number;
  readonly startX: number;
  readonly endXExclusive: number;
}

export interface InkStreamGroup {
  readonly surface: InkStreamSurface;
  readonly event: InkStreamEvent;
  readonly paintableRuns: readonly InkStreamRun[];
}

/**
 * GPU-only, allocation-bounded renderer path. Never creates paint authority:
 * the input runs MUST originate from GameplayInkSystem.apply().
 *
 * The algebra and vertex/winding order match InkBrushRasterGeometry.ts and
 * InkBrushGpuPacking.ts exactly. A separate regression test compares all six
 * buffers byte-for-byte against those original implementations; neither
 * INK's canonical geometry generator nor shader is changed by this module.
 *
 * A single pass reserves at most one quad per INK-authorized row-run;
 * any clipped/invalid runs are omitted from the final typed-array views.
 * It removes one quad object, one vertex tuple and four vertex objects per
 * accepted run, while retaining the existing 16,383-quad GPU index budget.
 */
export function packInkBrushRasterRuns(groups: readonly InkStreamGroup[]): InkBrushGpuBuffers | null {
  let capacity = 0;
  for (const group of groups) capacity += group.paintableRuns.length;
  if (capacity === 0) return null;
  // The existing FIFO gate promises <= 16,383; reject unsafe bypasses.
  if (capacity > 16_383) throw new Error('INK_GPU_QUAD_BUDGET_EXCEEDED');

  // Accepted row-runs are normally emitted only inside a real brush. Reserve
  // at most one quad per approved run; trim if defensive INK bounds reject it.
  const positions = new Float32Array(capacity * 12);
  const uvs = new Float32Array(capacity * 8);
  const rectMins = new Float32Array(capacity * 8);
  const rectMaxs = new Float32Array(capacity * 8);
  const colors = new Uint8Array(capacity * 16);
  const indices = new Uint16Array(capacity * 6);
  let quadCount = 0;
  let p = 0;
  let uv = 0;
  let rectCursor = 0;
  let colorCursor = 0;
  let indexCursor = 0;
  let vertexBase = 0;

  for (const { surface, event, paintableRuns } of groups) {
    const atlas = surface.atlasRect;
    if (!atlas) throw new Error(`No atlas allocation for PaintSurface ${surface.id}`);
    if (paintableRuns.length === 0) continue;

    const c = Math.cos(event.angle);
    const s = Math.sin(event.angle);
    const boundU = Math.abs(c) * event.radiusU + Math.abs(s) * event.radiusV;
    const boundV = Math.abs(s) * event.radiusU + Math.abs(c) * event.radiusV;
    const centerX = (atlas.x + event.centerU * atlas.pixelsPerMeter) / atlas.atlasSize;
    const centerY = (atlas.y + atlas.height - event.centerV * atlas.pixelsPerMeter) / atlas.atlasSize;
    const radiusX = event.radiusU * atlas.pixelsPerMeter / atlas.atlasSize;
    const radiusY = event.radiusV * atlas.pixelsPerMeter / atlas.atlasSize;
    const scale = atlas.pixelsPerMeter / atlas.atlasSize;
    if (!(radiusX > 0 && radiusY > 0) ||
        !Number.isFinite(boundU) || !Number.isFinite(boundV) ||
        !Number.isFinite(centerX) || !Number.isFinite(centerY)) continue;

    const ownerByte = event.team === Team.A ? 255 : 0;
    const wetnessByte = Math.round(Math.min(1, Math.max(0, event.strength)) * 255);

    for (const run of paintableRuns) {
      // The INK raster's invalid-run and clipping filters, unchanged.
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

      // Same exact [BL, BR, TR, TL] order as canonical INK quads, but no
      // transient InkBrushVertex/InkBrushQuad instances or geometry list.
      for (let i = 0; i < 4; i++) {
        const x = (i === 1 || i === 2) ? x1 : x0;
        const y = (i >= 2) ? y0 : y1;
        const dx = x - centerX;
        const dy = y - centerY;
        positions[p++] = x;
        positions[p++] = y;
        positions[p++] = 0;
        uvs[uv++] = 0.5 + (dx * c - dy * s) / (2 * radiusX);
        uvs[uv++] = 0.5 + (-dx * s - dy * c) / (2 * radiusY);
        rectMins[rectCursor] = x0;
        rectMaxs[rectCursor++] = x1;
        rectMins[rectCursor] = y0;
        rectMaxs[rectCursor++] = y1;
        colors[colorCursor++] = ownerByte;
        colors[colorCursor++] = 255;
        colors[colorCursor++] = wetnessByte;
        colors[colorCursor++] = 255;
      }
      indices[indexCursor++] = vertexBase;
      indices[indexCursor++] = vertexBase + 1;
      indices[indexCursor++] = vertexBase + 2;
      indices[indexCursor++] = vertexBase;
      indices[indexCursor++] = vertexBase + 2;
      indices[indexCursor++] = vertexBase + 3;
      vertexBase += 4;
      quadCount++;
    }
  }

  if (quadCount === 0) return null;
  return {
    quadCount,
    positions: positions.subarray(0, p),
    uvs: uvs.subarray(0, uv),
    rectMins: rectMins.subarray(0, rectCursor),
    rectMaxs: rectMaxs.subarray(0, rectCursor),
    colors: colors.subarray(0, colorCursor),
    indices: indices.subarray(0, indexCursor)
  };
}
