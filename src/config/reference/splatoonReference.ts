/**
 * Canonical reference values inherited from the 2026-09-22 design document.
 * These are REFERENCE values, not a claim that every value is Nintendo-published.
 * Gameplay-specific tuning belongs under src/config/game.
 */
export const SPLATOON_REFERENCE = Object.freeze({
  tickRate: 60,
  tickSeconds: 1 / 60,
  units: {
    duMeters: 0.1,
    fpsReference: 60
  },
  turfWar: {
    teamSize: 4,
    durationSeconds: 180,
    overtime: false
  },
  player: {
    hp: 100,
    runSpeedMetersPerSecond: 5.76,
    swimSpeedMetersPerSecond: 11.52,
    shooterRunSpeedMetersPerSecond: 4.32,
    enemyInkSpeedMetersPerSecond: 1.44,
    baseAccelerationMetersPerSecond2: 36.0,
    actionAccelerationMetersPerSecond2: 72.0
  },
  enemyInk: {
    damagePerSecond: 18,
    maxDamageFromFullHp: 40
  },
  recovery: {
    delaySeconds: 1,
    humanHpPerSecond: 12.6,
    submergedHpPerSecond: 100
  },
  inkTank: {
    capacity: 100,
    submergedEmptyToFullSeconds: 3,
    humanEmptyToFullSeconds: 10,
    shooterRecoveryLockSeconds: 20 / 60
  },
  standardShooter: {
    damageMax: 36,
    damageMin: 18,
    shotIntervalTicks: 6,
    inkPerShotPercent: 0.92,
    projectilePlayerRadiusMeters: 0.285,
    projectileTerrainRadiusMeters: 0.2,
    spreadGroundDegrees: 4.86,
    spreadAirDegrees: 11.66
  },
  ink: {
    gameplayCellSizeMeters: 0.125,
    dirtyTileCells: 16,
    atlasHigh: 4096,
    atlasFallback: 2048
  }
} as const);

export type SplatoonReference = typeof SPLATOON_REFERENCE;
