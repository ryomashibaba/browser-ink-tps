import { describe, expect, it } from 'vitest';
import { brushClipRect, localMetersToBrushAtlas } from '../ink/AtlasCoordinates';
import {
  indexInkBrushSurfaces,
  INK_BRUSH_UNIT_CORNERS,
  INK_BRUSH_UNIT_UVS
} from './InkBrushSurfaceIndex';

describe('InkBrushSurfaceIndex (visual GPU lookup only)', () => {
  it('keeps original quad winding and UV order in shared constants', () => {
    expect(INK_BRUSH_UNIT_CORNERS).toEqual([[-1, -1], [1, -1], [1, 1], [-1, 1]]);
    expect(INK_BRUSH_UNIT_UVS).toEqual([[0, 0], [1, 0], [1, 1], [0, 1]]);
  });
  it('returns the identical rect and clip values as the per-event linear path', () => {
    const surfaces = Array.from({ length: 17 }, (_, i) => ({
      id: `source-${i}`,
      atlasRect: {
        x: (i % 4) * 211,
        y: Math.floor(i / 4) * 153,
        width: 180 + i,
        height: 130 + i,
        atlasSize: 2048,
        pixelsPerMeter: 64
      }
    }));
    const index = indexInkBrushSurfaces(surfaces);
    expect(index.size).toBe(17);
    for (const surface of surfaces) {
      const legacyRect = surfaces.find(candidate => candidate.id === surface.id)?.atlasRect;
      const cached = index.get(surface.id);
      expect(cached?.rect).toBe(legacyRect);
      expect(cached?.clip).toEqual(brushClipRect(legacyRect!));
      // The cache only stores clipping metadata, not a second coordinate authority.
      const center = localMetersToBrushAtlas(cached!.rect, 0.75, 1.25);
      expect(center).toEqual(localMetersToBrushAtlas(legacyRect!, 0.75, 1.25));
    }
    expect(index.get('not-registered')).toBeUndefined();
  });

  it('keeps the first duplicate ID just like Array.find, including null', () => {
    const rect = { x: 13, y: 24, width: 9, height: 5, atlasSize: 512, pixelsPerMeter: 16 };
    const index = indexInkBrushSurfaces([
      { id: 'no-rect', atlasRect: null },
      { id: 'no-rect', atlasRect: rect },
      { id: 'first', atlasRect: rect },
      { id: 'first', atlasRect: { ...rect, x: 999 } }
    ]);
    expect(index.get('no-rect')).toBeNull();
    expect(index.get('first')?.rect).toBe(rect);
    expect(index.size).toBe(2);
  });

  it('does not mutate atlas rectangles or paint ownership and remains independent of event order', () => {
    const rect = Object.freeze({ x: 1, y: 2, width: 30, height: 40, atlasSize: 512, pixelsPerMeter: 32 });
    const surface = Object.freeze({ id: 'original', atlasRect: rect });
    const index = indexInkBrushSurfaces([surface]);
    const before = { ...rect };
    for (const id of ['original', 'other', 'original', 'original']) {
      if (id === 'original') expect(index.get(id)?.clip).toEqual(brushClipRect(rect));
      else expect(index.get(id)).toBeUndefined();
    }
    expect(rect).toEqual(before);
  });
});
