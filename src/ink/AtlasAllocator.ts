import type { AtlasRect } from './types';
import type { PaintSurface } from './PaintSurface';

interface Placement {
  surface: PaintSurface;
  width: number;
  height: number;
}

export function allocateSurfaceAtlas(
  surfaces: readonly PaintSurface[],
  atlasSize: number,
  preferredPixelsPerMeter: number,
  gutter: number
): Map<string, AtlasRect> {
  let requestedPpm = preferredPixelsPerMeter;

  while (requestedPpm >= 24) {
    // The GPU color atlas stores one raster of real texels, while the CPU
    // authorizes complete cell rows. A fractional number of texels per cell
    // lets a single GPU pixel straddle an approved/non-paintable boundary.
    // Even half-texel-clamped LINEAR sampling can then read the adjacent
    // approved pixel into a blocked cell. Align *every* registered surface
    // cell boundary to texel edges before packing; retain the existing 0.85
    // fallback progression and never change the CPU grid, footprint or score.
    const ppm = alignedPixelsPerMeter(surfaces, requestedPpm);
    if (ppm === null) break;
    const result = tryPack(surfaces, atlasSize, ppm, gutter);
    if (result) return result;
    requestedPpm = ppm * 0.85;
  }

  throw new Error(`Unable to pack ${surfaces.length} PaintSurfaces into ${atlasSize}x${atlasSize} atlas.`);
}

/**
 * GPU pixel boundaries are integer coordinates in the atlas. For every
 * PaintSurface cell boundary to share one of those coordinates, the number
 * of pixels per cell must be an integer on ALL registered surfaces.
 *
 * SOURCE uses 0.125m/cell; the fallback 128 * 0.85 = 108.8 ppm would
 * instead make 13.6 pixels/cell and allow bilinear bleed at masked cells.
 * Snapping down to 104ppm (13 pixels/cell) fixes that representation
 * mismatch without inventing paintable cells or a GPU authority mask.
 */
function alignedPixelsPerMeter(
  surfaces: readonly PaintSurface[],
  maxPpm: number
): number | null {
  for (let ppm = Math.floor(maxPpm); ppm >= 24; ppm -= 1) {
    if (surfaces.every(surface => {
      const pixelsPerCell = ppm * surface.cellSize;
      return Number.isFinite(pixelsPerCell) &&
        Math.abs(pixelsPerCell - Math.round(pixelsPerCell)) < 1e-7;
    })) return ppm;
  }
  return null;
}

function tryPack(
  surfaces: readonly PaintSurface[],
  atlasSize: number,
  pixelsPerMeter: number,
  gutter: number
): Map<string, AtlasRect> | null {
  const items: Placement[] = surfaces.map((surface) => ({
    surface,
    width: Math.ceil(surface.widthMeters * pixelsPerMeter),
    height: Math.ceil(surface.heightMeters * pixelsPerMeter)
  })).sort((a, b) => b.height - a.height);

  const placements = new Map<string, AtlasRect>();
  let cursorX = gutter;
  let cursorY = gutter;
  let shelfHeight = 0;

  for (const item of items) {
    if (item.width + gutter * 2 > atlasSize || item.height + gutter * 2 > atlasSize) return null;

    if (cursorX + item.width + gutter > atlasSize) {
      cursorX = gutter;
      cursorY += shelfHeight + gutter;
      shelfHeight = 0;
    }

    if (cursorY + item.height + gutter > atlasSize) return null;

    placements.set(item.surface.id, {
      x: cursorX,
      y: cursorY,
      width: item.width,
      height: item.height,
      atlasSize,
      pixelsPerMeter
    });

    cursorX += item.width + gutter;
    shelfHeight = Math.max(shelfHeight, item.height);
  }

  return placements;
}
