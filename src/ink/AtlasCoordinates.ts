import type { PaintSurface } from './PaintSurface';
import type { AtlasRect } from './types';

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Render-target brush space is top-origin because the atlas RenderTarget uses
 * RENDERTARGET_ORIGIN_TOP. PaintSurface V still grows in canonical local +V.
 */
export function localMetersToBrushAtlas(
  rect: AtlasRect,
  uMeters: number,
  vMeters: number
): NormalizedPoint {
  return {
    x: (rect.x + uMeters * rect.pixelsPerMeter) / rect.atlasSize,
    y: (
      rect.y +
      rect.height -
      vMeters * rect.pixelsPerMeter
    ) / rect.atlasSize
  };
}

/**
 * Brush clipping is performed in the same top-origin render-target space.
 */
export function brushClipRect(rect: AtlasRect): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  return {
    minX: rect.x / rect.atlasSize,
    minY: rect.y / rect.atlasSize,
    maxX: (rect.x + rect.width) / rect.atlasSize,
    maxY: (rect.y + rect.height) / rect.atlasSize
  };
}

/**
 * Surface shaders sample textures with bottom-origin UVs.
 *
 * The atlas allocation/render coordinates above are top-origin, so the Y base
 * must be converted here. The sampled width/height use the exact active
 * PaintSurface pixel span rather than the ceil-packed rect extent.
 */
export function surfaceTextureUvRect(
  surface: PaintSurface,
  rect: AtlasRect
): NormalizedRect {
  return {
    x: rect.x / rect.atlasSize,
    y: 1 - (rect.y + rect.height) / rect.atlasSize,
    width: surface.widthMeters * rect.pixelsPerMeter / rect.atlasSize,
    height: surface.heightMeters * rect.pixelsPerMeter / rect.atlasSize
  };
}

/**
 * Verifies that a local PaintSurface point written in top-origin brush space is
 * sampled by the surface shader at the same texel after top<->bottom conversion.
 */
export function assertAtlasSamplingContract(
  surface: PaintSurface,
  tolerance = 1e-7
): number {
  const rect = surface.atlasRect;
  if (!rect) throw new Error(`Atlas contract: ${surface.id} has no atlas rect.`);
  const sampleRect = surfaceTextureUvRect(surface, rect);
  const probes: readonly [number, number][] = [
    [0, 0],
    [surface.widthMeters, 0],
    [surface.widthMeters, surface.heightMeters],
    [0, surface.heightMeters],
    [surface.widthMeters * 0.5, surface.heightMeters * 0.5],
    [surface.widthMeters * 0.23, surface.heightMeters * 0.71]
  ];

  let maxError = 0;
  for (const [u, v] of probes) {
    const brush = localMetersToBrushAtlas(rect, u, v);
    const normalizedU = surface.widthMeters > 0 ? u / surface.widthMeters : 0;
    const normalizedV = surface.heightMeters > 0 ? v / surface.heightMeters : 0;
    const sampledX = sampleRect.x + normalizedU * sampleRect.width;
    const sampledY = sampleRect.y + normalizedV * sampleRect.height;

    const error = Math.max(
      Math.abs(sampledX - brush.x),
      Math.abs(sampledY - (1 - brush.y))
    );
    maxError = Math.max(maxError, error);
    if (error > tolerance) {
      throw new Error(
        `Atlas contract: ${surface.id} local (${u}, ${v}) samples a different texel; error=${error}.`
      );
    }
  }

  return maxError;
}
