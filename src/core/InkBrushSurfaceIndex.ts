/**
 * GPU brush-only metadata. Built once after atlas placement, read during
 * every visual brush flush. This never reads or writes CPU paint ownership.
 *
 * Preserve Array.find's first-ID-wins semantics (including a null rect)
 * rather than accidentally changing which surface an event addresses.
 * The atlas rects are allocated once for a GpuInkAtlas lifetime.
 */
export interface InkBrushAtlasRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly atlasSize: number;
  readonly pixelsPerMeter: number;
}

export interface IndexedInkBrushRect<Rect extends InkBrushAtlasRect> {
  readonly rect: Rect;
  readonly clip: Readonly<{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }>;
}

export function indexInkBrushSurfaces<Rect extends InkBrushAtlasRect>(
  surfaces: readonly { readonly id: string; readonly atlasRect: Rect | null }[]
): ReadonlyMap<string, IndexedInkBrushRect<Rect> | null> {
  const index = new Map<string, IndexedInkBrushRect<Rect> | null>();
  for (const surface of surfaces) {
    if (index.has(surface.id)) continue;
    const rect = surface.atlasRect;
    index.set(surface.id, rect ? {
      rect,
      clip: {
        minX: rect.x / rect.atlasSize,
        minY: rect.y / rect.atlasSize,
        maxX: (rect.x + rect.width) / rect.atlasSize,
        maxY: (rect.y + rect.height) / rect.atlasSize
      }
    } : null);
  }
  return index;
}
