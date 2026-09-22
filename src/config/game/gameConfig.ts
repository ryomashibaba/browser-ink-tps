import { SPLATOON_REFERENCE } from '../reference/splatoonReference';

/** Project-owned values. These may be tuned without rewriting reference data. */
export const GAME_CONFIG = Object.freeze({
  simulation: {
    tickRate: SPLATOON_REFERENCE.tickRate,
    maxCatchUpTicksPerFrame: 8,
    maxFrameDeltaSeconds: 0.25
  },
  ink: {
    cellSizeMeters: SPLATOON_REFERENCE.ink.gameplayCellSizeMeters,
    dirtyTileCells: SPLATOON_REFERENCE.ink.dirtyTileCells,
    requestedAtlasSize: SPLATOON_REFERENCE.ink.atlasHigh,
    fallbackAtlasSize: SPLATOON_REFERENCE.ink.atlasFallback,
    atlasGutterPixels: 8,
    preferredPixelsPerMeter: 128,
    maxGpuPaintEventsPerFrame: 2048
  },
  debug: {
    stressBurstSmall: 250,
    stressBurstLarge: 2000,
    defaultBrushRadiusMeters: 1.45
  },
  visual: {
    neutral: [0.24, 0.27, 0.31] as const,
    teamA: [0.02, 0.84, 0.96] as const,
    teamB: [1.0, 0.10, 0.58] as const,
    sky: [0.055, 0.075, 0.098] as const
  }
} as const);
