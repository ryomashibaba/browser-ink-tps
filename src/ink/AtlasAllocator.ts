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
  let ppm = preferredPixelsPerMeter;

  while (ppm >= 24) {
    const result = tryPack(surfaces, atlasSize, ppm, gutter);
    if (result) return result;
    ppm *= 0.85;
  }

  throw new Error(`Unable to pack ${surfaces.length} PaintSurfaces into ${atlasSize}x${atlasSize} atlas.`);
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
