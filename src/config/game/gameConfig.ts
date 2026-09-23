import { SPLATOON_REFERENCE } from '../reference/splatoonReference';

/**
 * Project-owned values. These may be tuned without rewriting reference data.
 * T4-T7 movement/projectile numbers are original project tuning, not claims
 * about exact Splatoon 3 internal values.
 */
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
  player: {
    humanSpeedMetersPerSecond: 5.2,
    groundAccelerationMetersPerSecond2: 26,
    decelerationMetersPerSecond2: 34,
    gravityMetersPerSecond2: 28,
    maxFallSpeedMetersPerSecond: 24,
    jumpSpeedMetersPerSecond: 8.2,
    humanColliderRadiusMeters: 0.32,
    humanColliderHalfHeightMeters: 0.55,
    squidColliderRadiusMeters: 0.34,
    squidVisualOffsetYMeters: -0.43,
    squidOwnInkSpeedMetersPerSecond: 8.0,
    squidOwnInkAccelerationMetersPerSecond2: 36,
    squidNeutralSpeedMetersPerSecond: 5.2,
    squidEnemyInkSpeedMetersPerSecond: 1.35,
    squidDryAccelerationMetersPerSecond2: 14,
    squidJumpSpeedMetersPerSecond: 8.2,
    squidWallClimbSpeedMetersPerSecond: 5.4,
    squidWallLateralSpeedMetersPerSecond: 4.5,
    wallProbeForwardMeters: 0.48,
    wallProbeHeightOffsetMeters: -0.06,
    wallProbePlaneDistanceMeters: 0.56,
    wallAttachInputThreshold: 0.28,
    wallStickSpeedMetersPerSecond: 1.2,
    squidRollMinSpeedMetersPerSecond: 5.6,
    squidRollSpeedMetersPerSecond: 9.2,
    squidRollUpSpeedMetersPerSecond: 5.1,
    squidRollDurationSeconds: 0.34,
    squidRollTurnGraceSeconds: 0.20,
    squidRollReverseDotThreshold: -0.15,
    surgeMinChargeSeconds: 0.12,
    surgeMaxChargeSeconds: 0.45,
    surgeMinUpSpeedMetersPerSecond: 7.0,
    surgeMaxUpSpeedMetersPerSecond: 10.6,
    surgeAwaySpeedMetersPerSecond: 1.7,
    surgeDurationSeconds: 0.24,
    surgeGravityMetersPerSecond2: 18
  },
  projectile: {
    poolSize: 128,
    fireIntervalSeconds: 0.105,
    speedMetersPerSecond: 28,
    gravityMetersPerSecond2: 4,
    lifeSeconds: 1.8,
    paintRadiusMeters: 0.64,
    visualDiameterMeters: 0.13
  },
  worldInteraction: {
    paintSurfacePriorityEpsilonMeters: 0.06,
    cameraCollisionPaddingMeters: 0.18,
    cameraMinDistanceMeters: 0.12,
    cameraRecoverySharpness: 10
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
