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
/**
 * Bounded CPU submission scratch for one GpuInkAtlas.
 *
 * PlayCanvas 2.22.1 Mesh.update() synchronously copies submitted streams into
 * its VertexBuffer/IndexBuffer (scene/mesh.js: _updateVertexBuffer and
 * _updateIndexBuffer). Reuse is safe ONLY after that same mesh.update() ends.
 * Never share one scratch between two live atlases or retain a returned view
 * across subsequent pack calls. The ordinary no-scratch API stays independent.
 */
export class InkBrushRasterScratch {
  private reserved = 0;
  private storage: Omit<InkBrushGpuBuffers, 'quadCount'> | null = null;

  public get reservedQuads(): number {
    return this.reserved;
  }

  public reserve(requiredQuads: number): Omit<InkBrushGpuBuffers, 'quadCount'> {
    if (!Number.isInteger(requiredQuads) || requiredQuads < 1 ||
        requiredQuads > 16_383) {
      throw new Error('INK_GPU_QUAD_BUDGET_EXCEEDED');
    }
    if (this.storage && requiredQuads <= this.reserved) return this.storage;

    // Grow geometrically: no allocation churn when brush sizes vary within
    // an established workload. 16,383 cap bounds retained bytes to <3 MiB.
    let next = Math.max(16, this.reserved);
    while (next < requiredQuads) next = Math.min(16_383, next * 2);
    this.storage = {
      positions: new Float32Array(next * 12),
      uvs: new Float32Array(next * 8),
      rectMins: new Float32Array(next * 8),
      rectMaxs: new Float32Array(next * 8),
      colors: new Uint8Array(next * 16),
      indices: new Uint16Array(next * 6)
    };
    // Quad topology is independent of brush/team/geometry. Precompute once
    // per growth; the atlas only reads the returned view until mesh.update().
    const indices = this.storage.indices;
    for (let q = 0, i = 0; q < next; q++) {
      const v = q * 4;
      indices[i++] = v;
      indices[i++] = v + 1;
      indices[i++] = v + 2;
      indices[i++] = v;
      indices[i++] = v + 2;
      indices[i++] = v + 3;
    }
    this.reserved = next;
    return this.storage;
  }

  /** Release the retained arrays when this atlas is destroyed. */
  public release(): void {
    this.storage = null;
    this.reserved = 0;
  }
}

export function packInkBrushRasterRuns(
  groups: readonly InkStreamGroup[],
  scratch?: InkBrushRasterScratch
): InkBrushGpuBuffers | null {
  let capacity = 0;
  for (const group of groups) capacity += group.paintableRuns.length;
  if (capacity === 0) return null;
  // The existing FIFO gate promises <= 16,383; reject unsafe bypasses.
  if (capacity > 16_383) throw new Error('INK_GPU_QUAD_BUDGET_EXCEEDED');

  // Accepted row-runs are normally emitted only inside a real brush. Reserve
  // at most one quad per approved run; trim if defensive INK bounds reject it.
  // Reuse one bounded set of underlying TypedArrays across completed
  // GPU submissions. Always return exact-length views for Mesh.set*().
  const saved = scratch?.reserve(capacity);
  const positions = saved?.positions ?? new Float32Array(capacity * 12);
  const uvs = saved?.uvs ?? new Float32Array(capacity * 8);
  const rectMins = saved?.rectMins ?? new Float32Array(capacity * 8);
  const rectMaxs = saved?.rectMaxs ?? new Float32Array(capacity * 8);
  const colors = saved?.colors ?? new Uint8Array(capacity * 16);
  const indices = saved?.indices ?? new Uint16Array(capacity * 6);
  let quadCount = 0;
  let p = 0;
  let uv = 0;
  let rectCursor = 0;
  let colorCursor = 0;
  let indexCursor = 0;

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
    const diameterX = 2 * radiusX;
    const diameterY = 2 * radiusY;
    const scale = atlas.pixelsPerMeter / atlas.atlasSize;
    // These exact divisions and brush bounds are identical for every run.
    const atlasLeft=atlas.x / atlas.atlasSize;
    const atlasBottom=(atlas.y + atlas.height) / atlas.atlasSize;
    const brushMinU=event.centerU-boundU,brushMaxU=event.centerU+boundU;
    const brushMinV=event.centerV-boundV,brushMaxV=event.centerV+boundV;
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

      const minU = Math.max(0, run.startX * surface.cellSize, brushMinU);
      const maxU = Math.min(surface.widthMeters, run.endXExclusive * surface.cellSize, brushMaxU);
      const minV = Math.max(0, run.row * surface.cellSize, brushMinV);
      const maxV = Math.min(surface.heightMeters, (run.row + 1) * surface.cellSize, brushMaxV);
      if (minU >= maxU || minV >= maxV) continue;

      const x0 = atlasLeft + minU * scale;
      const x1 = atlasLeft + maxU * scale;
      const y0 = atlasBottom - maxV * scale;
      const y1 = atlasBottom - minV * scale;

      // Same exact [BL, BR, TR, TL] order as canonical INK quads, but no
      // transient InkBrushVertex/InkBrushQuad instances or geometry list.
      // Each corner reuses one of two X and two Y products. Keep the
      // original arithmetic order (including the unary minus) for exact UVs.
      const dx0 = x0 - centerX, dx1 = x1 - centerX;
      const dy0 = y0 - centerY, dy1 = y1 - centerY;
      const xc0 = dx0 * c, xc1 = dx1 * c;
      const xs0 = -dx0 * s, xs1 = -dx1 * s;
      const ys0 = dy0 * s, ys1 = dy1 * s;
      const yc0 = dy0 * c, yc1 = dy1 * c;
      for (let i = 0; i < 4; i++) {
        const right = i === 1 || i === 2;
        const top = i >= 2;
        const x = right ? x1 : x0;
        const y = top ? y0 : y1;
        positions[p++] = x;
        positions[p++] = y;
        positions[p++] = 0;
        uvs[uv++] = 0.5 + ((right ? xc1 : xc0) - (top ? ys0 : ys1)) / diameterX;
        uvs[uv++] = 0.5 + ((right ? xs1 : xs0) - (top ? yc0 : yc1)) / diameterY;
        rectMins[rectCursor] = x0;
        rectMaxs[rectCursor++] = x1;
        rectMins[rectCursor] = y0;
        rectMaxs[rectCursor++] = y1;
        colors[colorCursor++] = ownerByte;
        colors[colorCursor++] = 255;
        colors[colorCursor++] = wetnessByte;
        colors[colorCursor++] = 255;
      }
      if (!saved) {
        const vertexBase = quadCount * 4;
        indices[indexCursor] = vertexBase;
        indices[indexCursor + 1] = vertexBase + 1;
        indices[indexCursor + 2] = vertexBase + 2;
        indices[indexCursor + 3] = vertexBase;
        indices[indexCursor + 4] = vertexBase + 2;
        indices[indexCursor + 5] = vertexBase + 3;
      }
      indexCursor += 6;
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
