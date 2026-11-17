import { Team } from '../ink/types';

/** Read-only GPU submission data. The authoritative INK raster owns every quad. */
export interface PackedInkVertex {
  readonly x: number;
  readonly y: number;
  readonly uvX: number;
  readonly uvY: number;
}
export interface PackedInkQuad {
  readonly vertices: readonly PackedInkVertex[];
  readonly clipMinX: number;
  readonly clipMinY: number;
  readonly clipMaxX: number;
  readonly clipMaxY: number;
}
export interface PackedInkGroup {
  readonly event: Readonly<{ team: Team.A | Team.B; strength: number }>;
  readonly quads: readonly PackedInkQuad[];
}
export interface InkBrushGpuBuffers {
  readonly quadCount: number;
  readonly positions: Float32Array;
  readonly uvs: Float32Array;
  readonly rectMins: Float32Array;
  readonly rectMaxs: Float32Array;
  readonly colors: Uint8Array;
  readonly indices: Uint16Array;
}

/**
 * Pack the existing INK-authorized row-run quads directly from event groups.
 * No per-quad {quad,event} intermediates and no repeated per-quad strength
 * conversions. Vertex order, winding, UV, clip, wetness and array sizes are
 * exactly the original GpuInkAtlas submission contract. No owner-grid writes.
 * The caller must retain the existing 16,383-quad drain and acceptance gate.
 */
export function packInkBrushGpuGroups(groups: readonly PackedInkGroup[]): InkBrushGpuBuffers | null {
  let count = 0;
  for (const group of groups) count += group.quads.length;
  if (count === 0) return null;

  const positions = new Float32Array(count * 4 * 3);
  const uvs = new Float32Array(count * 4 * 2);
  const rectMins = new Float32Array(count * 4 * 2);
  const rectMaxs = new Float32Array(count * 4 * 2);
  const colors = new Uint8Array(count * 4 * 4);
  const indices = new Uint16Array(count * 6);

  let p = 0;
  let uv = 0;
  let rectCursor = 0;
  let colorCursor = 0;
  let indexCursor = 0;
  let vertexBase = 0;

  for (const { event, quads } of groups) {
    const ownerByte = event.team === Team.A ? 255 : 0;
    const wetnessByte = Math.round(Math.min(1, Math.max(0, event.strength)) * 255);
    for (const quad of quads) {
      for (const vertex of quad.vertices) {
        positions[p++] = vertex.x;
        positions[p++] = vertex.y;
        positions[p++] = 0;

        uvs[uv++] = vertex.uvX;
        uvs[uv++] = vertex.uvY;

        rectMins[rectCursor] = quad.clipMinX;
        rectMaxs[rectCursor++] = quad.clipMaxX;
        rectMins[rectCursor] = quad.clipMinY;
        rectMaxs[rectCursor++] = quad.clipMaxY;

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
    }
  }
  return { quadCount: count, positions, uvs, rectMins, rectMaxs, colors, indices };
}
