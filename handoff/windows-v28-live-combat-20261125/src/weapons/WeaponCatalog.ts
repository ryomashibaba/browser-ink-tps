import { GAME_CONFIG } from '../config/game/gameConfig';

export type WeaponClass =
  | 'SHOOTER'
  | 'DUALIES'
  | 'CHARGER'
  | 'BLASTER'
  | 'ROLLER'
  | 'BRUSH'
  | 'SLOSHER'
  | 'SPLATLING'
  | 'BRELLA'
  | 'STRINGER'
  | 'SPLATANA';

export type TriggerStyle =
  | 'AUTO'
  | 'SEMI'
  | 'CHARGE_RELEASE'
  | 'ROLLER'
  | 'SPLATLING'
  | 'SPLATANA';

export type WeaponId =
  | 'pulse-sprayer'
  | 'needle-smg'
  | 'twin-comets'
  | 'rail-charger'
  | 'arc-blaster'
  | 'metro-roller'
  | 'dash-brush'
  | 'wave-slosher'
  | 'rotor-splatling'
  | 'canopy-guard'
  | 'chord-stringer'
  | 'ink-saber';

export interface WeaponProfile {
  id: WeaponId;
  weaponClass: WeaponClass;
  classLabel: string;
  displayName: string;
  shortName: string;
  trigger: TriggerStyle;
  fireIntervalSeconds: number;
  speedMetersPerSecond: number;
  gravityMetersPerSecond2: number;
  lifeSeconds: number;
  paintRadiusMeters: number;
  visualDiameterMeters: number;
  damage: number;
  inkCost: number;
  fxScale: number;
  audioPitch: number;
  pelletCount: number;
  spreadDegrees: number;
  chargeSeconds: number;
  firstChargeSeconds: number;
  minChargeSeconds: number;
  chargeDamageMultiplier: number;
  chargeSpeedMultiplier: number;
  chargePaintMultiplier: number;
  burstMaxShots: number;
  burstIntervalSeconds: number;
  blastRadiusMeters: number;
  blastDamage: number;
  rollPaintRadiusMeters: number;
  rollPaintInkCost: number;
  shooter?: ShooterProfile;
  arrowFlight?: StagedFlightProfile & { combatRangeMeters: number };
  blaster?: BlasterProfile;
  charger?: true;
  twinComets?: true;
  slosher?: { recoveryLockSeconds: number };
  canopy?: { recoveryLockSeconds: number };
  contactWeapon?: ContactWeaponProfile;
}

export interface SwingDropletGroup {
  count: number;
  speed: number;
  speedVariation: number;
  spread: number;
  pitch: number;
  damage: number;
  paintRadius: number;
}

export interface ContactWeaponProfile {
  horizontal: readonly SwingDropletGroup[];
  vertical?: readonly SwingDropletGroup[];
  swingRecovery: number;
  verticalRecovery?: number;
  verticalInterval?: number;
  rollAfterFrames: number;
  rollAccelerationFrames: number;
  moveMultiplier: readonly [initial: number, full: number];
  rollHalfWidth: readonly [initial: number, full: number];
  rollInk: readonly [initial: number, full: number];
  rollRecovery: number;
  contactHalfWidth: number;
  contactDamage: number;
}

export interface BlasterProfile {
  recoveryLockSeconds: number;
  straightFrames: number;
  brakeSpeedMetersPerSecond: number;
  footRadius: number;
  splashRadius: number;
  splashStart: number;
  splashSpacing: number;
  maxSplashes: number;
}

export interface StagedFlightProfile {
  straightFrames: number;
  brakeSpeedMetersPerSecond: number;
  coast?: { retainPerFrame: number; gravityMetersPerSecond2: number };
}

export interface ShooterProfile extends StagedFlightProfile {
  combatRangeMeters: number;
  recoveryLockSeconds: number;
  airSpreadDegrees: number;
  groundBiasRecoveryPerFrame: number;
  splashPhaseOrder: readonly number[];
  extraFootShots: readonly number[];
  suppressCycleEndFoot?: true;
  footRadius: number;
  splashRadius: number;
  splashesPerShot: number;
  splashStart: number;
  splashSpacing: number;
  impactNear: readonly [distance: number, radius: number];
  impactMiddle: readonly [distance: number, radius: number];
  impactFar: readonly [distance: number, radius: number];
  impactStretch: number;
  damageFalloffFrames: readonly [start: number, end: number];
}

const BASE = {
  pelletCount: 1,
  spreadDegrees: 0,
  chargeSeconds: 0,
  firstChargeSeconds: 0,
  minChargeSeconds: 0,
  chargeDamageMultiplier: 1,
  chargeSpeedMultiplier: 1,
  chargePaintMultiplier: 1,
  burstMaxShots: 0,
  burstIntervalSeconds: 0,
  blastRadiusMeters: 0,
  blastDamage: 0,
  rollPaintRadiusMeters: 0,
  rollPaintInkCost: 0
} as const;

export const WEAPON_ORDER: readonly WeaponId[] = [
  'pulse-sprayer',
  'needle-smg',
  'twin-comets',
  'rail-charger',
  'arc-blaster',
  'metro-roller',
  'dash-brush',
  'wave-slosher',
  'rotor-splatling',
  'canopy-guard',
  'chord-stringer',
  'ink-saber'
];

export const WEAPON_PROFILES: Readonly<Record<WeaponId, WeaponProfile>> = {
  'pulse-sprayer': {
    ...BASE,
    id: 'pulse-sprayer',
    weaponClass: 'SHOOTER',
    classLabel: 'シューター',
    displayName: 'Pulse Sprayer',
    shortName: 'PULSE',
    trigger: 'AUTO',
    fireIntervalSeconds: GAME_CONFIG.projectile.fireIntervalSeconds,
    speedMetersPerSecond: GAME_CONFIG.projectile.speedMetersPerSecond,
    gravityMetersPerSecond2: GAME_CONFIG.projectile.gravityMetersPerSecond2,
    lifeSeconds: GAME_CONFIG.projectile.lifeSeconds,
    paintRadiusMeters: GAME_CONFIG.projectile.paintRadiusMeters,
    visualDiameterMeters: GAME_CONFIG.projectile.visualDiameterMeters,
    damage: GAME_CONFIG.combat.projectileDamage,
    inkCost: GAME_CONFIG.inkEconomy.inkPerShot,
    fxScale: 1,
    audioPitch: 1
  },
  'needle-smg': {
    ...BASE,
    id: 'needle-smg',
    weaponClass: 'SHOOTER',
    classLabel: 'シューター',
    displayName: 'Needle SMG',
    shortName: 'NEEDLE',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.065,
    speedMetersPerSecond: 32,
    gravityMetersPerSecond2: 3.2,
    lifeSeconds: 1.55,
    paintRadiusMeters: 0.43,
    visualDiameterMeters: 0.095,
    damage: 20,
    inkCost: 0.56,
    fxScale: 0.72,
    audioPitch: 1.34
  },
  'twin-comets': {
    ...BASE,
    id: 'twin-comets',
    weaponClass: 'DUALIES',
    classLabel: 'マニューバー',
    displayName: 'Twin Comets',
    shortName: 'DUAL',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.105,
    speedMetersPerSecond: 29,
    gravityMetersPerSecond2: 3.7,
    lifeSeconds: 1.6,
    paintRadiusMeters: 0.39,
    visualDiameterMeters: 0.09,
    damage: 17,
    inkCost: 0.82,
    fxScale: 0.72,
    audioPitch: 1.15,
    pelletCount: 2,
    spreadDegrees: 2.4
  },
  'rail-charger': {
    ...BASE,
    id: 'rail-charger',
    weaponClass: 'CHARGER',
    classLabel: 'チャージャー',
    displayName: 'Rail Charger',
    shortName: 'CHARGE',
    trigger: 'CHARGE_RELEASE',
    fireIntervalSeconds: 0.18,
    speedMetersPerSecond: 42,
    gravityMetersPerSecond2: 1.4,
    lifeSeconds: 1.5,
    paintRadiusMeters: 0.48,
    visualDiameterMeters: 0.085,
    damage: 42,
    inkCost: 6.2,
    fxScale: 1.15,
    audioPitch: 1.5,
    chargeSeconds: 0.95,
    minChargeSeconds: 0.12,
    chargeDamageMultiplier: 2.85,
    chargeSpeedMultiplier: 1.22,
    chargePaintMultiplier: 1.45
  },
  'arc-blaster': {
    ...BASE,
    id: 'arc-blaster',
    weaponClass: 'BLASTER',
    classLabel: 'ブラスター',
    displayName: 'Arc Blaster',
    shortName: 'BLAST',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.48,
    speedMetersPerSecond: 22,
    gravityMetersPerSecond2: 5.2,
    lifeSeconds: 1.25,
    paintRadiusMeters: 0.92,
    visualDiameterMeters: 0.22,
    damage: 28,
    inkCost: 4.6,
    fxScale: 1.75,
    audioPitch: 0.66,
    blastRadiusMeters: 1.55,
    blastDamage: 42
  },
  'metro-roller': {
    ...BASE,
    id: 'metro-roller',
    weaponClass: 'ROLLER',
    classLabel: 'ローラー',
    displayName: 'Metro Roller',
    shortName: 'ROLLER',
    trigger: 'ROLLER',
    fireIntervalSeconds: 0.58,
    speedMetersPerSecond: 13,
    gravityMetersPerSecond2: 10,
    lifeSeconds: 0.52,
    paintRadiusMeters: 0.74,
    visualDiameterMeters: 0.16,
    damage: 38,
    inkCost: 3.8,
    fxScale: 1.4,
    audioPitch: 0.72,
    pelletCount: 7,
    spreadDegrees: 28,
    rollPaintRadiusMeters: 0.72,
    rollPaintInkCost: 0.48
  },
  'dash-brush': {
    ...BASE,
    id: 'dash-brush',
    weaponClass: 'BRUSH',
    classLabel: 'フデ',
    displayName: 'Dash Brush',
    shortName: 'BRUSH',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.16,
    speedMetersPerSecond: 17,
    gravityMetersPerSecond2: 7.5,
    lifeSeconds: 0.58,
    paintRadiusMeters: 0.34,
    visualDiameterMeters: 0.09,
    damage: 12,
    inkCost: 1.15,
    fxScale: 0.8,
    audioPitch: 1.28,
    pelletCount: 5,
    spreadDegrees: 24
  },
  'wave-slosher': {
    ...BASE,
    id: 'wave-slosher',
    weaponClass: 'SLOSHER',
    classLabel: 'スロッシャー',
    displayName: 'Wave Slosher',
    shortName: 'SLOSH',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.62,
    speedMetersPerSecond: 20,
    gravityMetersPerSecond2: 13,
    lifeSeconds: 1.65,
    paintRadiusMeters: 0.78,
    visualDiameterMeters: 0.18,
    damage: 62,
    inkCost: 5.2,
    fxScale: 1.3,
    audioPitch: 0.82
  },
  'rotor-splatling': {
    ...BASE,
    id: 'rotor-splatling',
    weaponClass: 'SPLATLING',
    classLabel: 'スピナー',
    displayName: 'Rotor Cannon',
    shortName: 'SPIN',
    trigger: 'SPLATLING',
    fireIntervalSeconds: 0.075,
    speedMetersPerSecond: 33,
    gravityMetersPerSecond2: 2.5,
    lifeSeconds: 1.75,
    paintRadiusMeters: 0.38,
    visualDiameterMeters: 0.085,
    damage: 20,
    inkCost: 0.72,
    fxScale: 0.7,
    audioPitch: 1.18,
    chargeSeconds: 1.20,
    firstChargeSeconds: 0.80,
    minChargeSeconds: 0.16,
    burstMaxShots: 36,
    burstIntervalSeconds: 0.075
  },
  'canopy-guard': {
    ...BASE,
    id: 'canopy-guard',
    weaponClass: 'BRELLA',
    classLabel: 'シェルター',
    displayName: 'Canopy Guard',
    shortName: 'BRELLA',
    trigger: 'AUTO',
    fireIntervalSeconds: 0.72,
    speedMetersPerSecond: 24,
    gravityMetersPerSecond2: 5.4,
    lifeSeconds: 0.85,
    paintRadiusMeters: 0.38,
    visualDiameterMeters: 0.10,
    damage: 15,
    inkCost: 4.2,
    fxScale: 1.0,
    audioPitch: 0.9,
    pelletCount: 6,
    spreadDegrees: 18
  },
  'chord-stringer': {
    ...BASE,
    id: 'chord-stringer',
    weaponClass: 'STRINGER',
    classLabel: 'ストリンガー',
    displayName: 'Chord Stringer',
    shortName: 'STRING',
    trigger: 'CHARGE_RELEASE',
    fireIntervalSeconds: 0.30,
    speedMetersPerSecond: 28,
    gravityMetersPerSecond2: 5.8,
    lifeSeconds: 1.6,
    paintRadiusMeters: 0.38,
    visualDiameterMeters: 0.085,
    damage: 30,
    inkCost: 5.0,
    fxScale: 0.9,
    audioPitch: 1.42,
    pelletCount: 3,
    spreadDegrees: 8,
    chargeSeconds: 1.20,
    firstChargeSeconds: 0.50,
    minChargeSeconds: 0.15,
    chargeDamageMultiplier: 35 / 30,
    chargeSpeedMultiplier: 1.28,
    chargePaintMultiplier: 1.20
  },
  'ink-saber': {
    ...BASE,
    id: 'ink-saber',
    weaponClass: 'SPLATANA',
    classLabel: 'ワイパー',
    displayName: 'Ink Saber',
    shortName: 'SABER',
    trigger: 'SPLATANA',
    fireIntervalSeconds: 0.34,
    speedMetersPerSecond: 22,
    gravityMetersPerSecond2: 4.2,
    lifeSeconds: 0.62,
    paintRadiusMeters: 0.46,
    visualDiameterMeters: 0.12,
    damage: 34,
    inkCost: 2.2,
    fxScale: 1.0,
    audioPitch: 1.02,
    chargeSeconds: 0.62,
    minChargeSeconds: 0,
    chargeDamageMultiplier: 2.65,
    chargeSpeedMultiplier: 1.12,
    chargePaintMultiplier: 1.55
  }
};

export const DEFAULT_WEAPON_ID: WeaponId = 'pulse-sprayer';

// References: Lean's 720 ShooterNormal and ShooterPrecision tables. F4 uses
// the timing, distance and damage-falloff ratios from those references.
// Effective brush radii below are local raster calibrations of the reference
// widths. Full ellipse coverage at those raw widths overpainted this stage.
// Phase order, flight lifetime and CPU engagement distances are provisional.
const F4_SHOOTERS: Readonly<Partial<Record<WeaponId, WeaponProfile>>> = {
  'pulse-sprayer': {
    ...WEAPON_PROFILES['pulse-sprayer'],
    fireIntervalSeconds: 6 / 60,
    speedMetersPerSecond: 2.2 * 60,
    gravityMetersPerSecond2: 0.016 * 60 ** 2,
    spreadDegrees: 5,
    inkCost: 0.92,
    damage: 36,
    lifeSeconds: 48 / 60,
    shooter: {
      combatRangeMeters: 12.5,
      recoveryLockSeconds: 20 / 60,
      straightFrames: 4,
      brakeSpeedMetersPerSecond: 1.4495 * 60,
      airSpreadDegrees: 12,
      groundBiasRecoveryPerFrame: 0.015,
      splashPhaseOrder: [0, 3, 6, 1, 4, 7, 2, 5],
      extraFootShots: [4],
      footRadius: 2.0608 * 0.45,
      splashRadius: 1.472 * 0.44,
      splashesPerShot: 1.5,
      splashStart: 1.2,
      splashSpacing: 9.2,
      impactNear: [0, 1.93 * 0.54],
      impactMiddle: [1.1, 1.93 * 0.54],
      impactFar: [20, 1.71 * 0.54],
      impactStretch: 2.24,
      damageFalloffFrames: [8, 40]
    }
  },
  'needle-smg': {
    ...WEAPON_PROFILES['needle-smg'],
    fireIntervalSeconds: 5 / 60,
    speedMetersPerSecond: 3.92 * 60,
    gravityMetersPerSecond2: 0.016 * 60 ** 2,
    spreadDegrees: 0,
    inkCost: 0.80,
    damage: 28,
    lifeSeconds: 48 / 60,
    shooter: {
      combatRangeMeters: 11.7,
      recoveryLockSeconds: 20 / 60,
      straightFrames: 2,
      brakeSpeedMetersPerSecond: 1.5815 * 60,
      airSpreadDegrees: 0,
      groundBiasRecoveryPerFrame: 0.005,
      splashPhaseOrder: [0, 3, 1, 4, 5, 2],
      extraFootShots: [],
      footRadius: 2.0608 * 0.45,
      splashRadius: 1.472 * 0.50,
      splashesPerShot: 1.5,
      splashStart: 1.15,
      splashSpacing: 9.5,
      impactNear: [0, 2.19 * 0.50],
      impactMiddle: [1.1, 2.19 * 0.50],
      impactFar: [20, 1.77 * 0.50],
      impactStretch: 2.02,
      damageFalloffFrames: [4, 20]
    }
  },
  'twin-comets': {
    ...WEAPON_PROFILES['twin-comets'],
    twinComets: true,
    fireIntervalSeconds: 5 / 60,
    speedMetersPerSecond: 112,
    lifeSeconds: 39 / 60,
    pelletCount: 1,
    spreadDegrees: 2,
    damage: 30,
    inkCost: 0.72,
    shooter: {
      // World size, muzzle offsets, flight and paint dimensions are T21
      // calibrations. Timing, spread and falloff are reference candidates.
      combatRangeMeters: 10.6,
      recoveryLockSeconds: 20 / 60,
      straightFrames: 4,
      brakeSpeedMetersPerSecond: 76,
      airSpreadDegrees: 7.5,
      groundBiasRecoveryPerFrame: 0.01,
      splashPhaseOrder: [0, 3, 6, 2, 5, 1, 4],
      extraFootShots: [1],
      suppressCycleEndFoot: true,
      footRadius: 0.63,
      splashRadius: 0.43,
      splashesPerShot: 1,
      splashStart: 1.05,
      splashSpacing: 5.8,
      impactNear: [0, 0.80],
      impactMiddle: [2.1, 0.74],
      impactFar: [12, 0.62],
      impactStretch: 1.72,
      damageFalloffFrames: [7, 15]
    }
  }
};

// Nova Blaster (720 BlasterShort) is a reference candidate. The fuse,
// cadence and droplet spacing are reference timings; effective raster
// radii and flat outer blast damage are F4 gameplay settings.
const F4_ARC_BLASTER: WeaponProfile = {
  ...WEAPON_PROFILES['arc-blaster'],
  fireIntervalSeconds: 40 / 60,
  speedMetersPerSecond: 0.87 * 60,
  lifeSeconds: 11 / 60,
  damage: 125,
  blastRadiusMeters: 3.57,
  blastDamage: 50,
  inkCost: 7.5,
  blaster: {
    recoveryLockSeconds: 55 / 60,
    straightFrames: 7,
    brakeSpeedMetersPerSecond: 0.8484 * 60,
    footRadius: 0.96,
    splashRadius: 0.63,
    splashStart: 1,
    splashSpacing: 1.5,
    maxSplashes: 6
  }
};

const F4_RAIL_CHARGER: WeaponProfile = {
  ...WEAPON_PROFILES['rail-charger'],
  chargeSeconds: 60 / 60,
  charger: true
};

/** 720 ChargerNormal timing and size relationships. Brush widths are
 * calibrated for the F4 raster; the existing hitscan is the beam authority. */
export function railCharge(fraction: number) {
  const charge = Math.min(1, Math.max(0, fraction));
  const full = charge >= 1 - 1e-8;
  const depth = 2.73 + (1.56 - 2.73) * charge;
  const overlap = full ? 0.34 : 0.125 + (0.25 - 0.125) * charge;
  return {
    range: 9.033 + (24.037 - 9.033) * charge,
    damage: full ? 160 : 40 + 40 * charge,
    inkCost: 2.25 + (18 - 2.25) * charge,
    depth,
    width: 0.34 + 0.30 * charge,
    spacing: 2 * depth * (1 - overlap),
    impact: full ? 1.05 : 0.38 + 0.48 * charge
  };
}

export function weaponProfile(id: WeaponId, f4Research = false): WeaponProfile {
  if (f4Research && id === 'rotor-splatling') return F4_ROTOR;
  if (f4Research && id === 'chord-stringer') return F4_CHORD;
  if (f4Research && id === 'ink-saber') return F4_SABER;
  if (f4Research && id === 'canopy-guard') return F4_CANOPY_GUARD;
  if (f4Research && id === 'wave-slosher') return F4_WAVE_SLOSHER;
  if (f4Research && id === 'arc-blaster') return F4_ARC_BLASTER;
  if (f4Research && id === 'rail-charger') return F4_RAIL_CHARGER;
  if (f4Research && id === 'metro-roller') return F4_METRO_ROLLER;
  if (f4Research && id === 'dash-brush') return F4_DASH_BRUSH;
  return (f4Research ? F4_SHOOTERS[id] : undefined) ?? WEAPON_PROFILES[id];
}

export const F4_SABER_TIMING = {
  horizontal: { ink: 3, cooldown: 16 / 60 },
  charged: { ink: 6, cooldown: 22 / 60 },
  recovery: 30 / 60
} as const;

const F4_SABER: WeaponProfile = {
  ...WEAPON_PROFILES['ink-saber'],
  chargeSeconds: 16 / 60,
  inkCost: F4_SABER_TIMING.horizontal.ink,
  damage: 30
};

const F4_ROTOR: WeaponProfile = {
  ...WEAPON_PROFILES['rotor-splatling'],
  firstChargeSeconds: 50 / 60,
  chargeSeconds: 75 / 60,
  // Local velocity scale: useful reach beyond the two F4 shooters.
  speedMetersPerSecond: 88,
  gravityMetersPerSecond2: 34,
  lifeSeconds: 54 / 60,
  fireIntervalSeconds: 4 / 60,
  burstIntervalSeconds: 4 / 60,
  // The 144-frame window is exclusive. Partial bursts pay per accepted shot.
  inkCost: 22.5 / 36,
  damage: 30,
  spreadDegrees: 3.3,
  shooter: {
    ...F4_SHOOTERS['pulse-sprayer']!.shooter!,
    combatRangeMeters: 15,
    straightFrames: 8,
    brakeSpeedMetersPerSecond: 88 * 1.5105 / 2.1,
    coast: { retainPerFrame: 0.91, gravityMetersPerSecond2: 34 },
    airSpreadDegrees: 7,
    recoveryLockSeconds: 40 / 60,
    extraFootShots: [],
    splashesPerShot: 1,
    splashRadius: 0.5,
    impactNear: [0, 0.69],
    impactMiddle: [4, 0.69],
    impactFar: [15, 0.65],
    damageFalloffFrames: [11, 19]
  }
};

const F4_CHORD: WeaponProfile = {
  ...WEAPON_PROFILES['chord-stringer'],
  // Local launch scale and lifetime, with the reference min/mid-to-max
  // velocity ratio and the same staged solver for aim and flight.
  speedMetersPerSecond: 26,
  gravityMetersPerSecond2: 12,
  lifeSeconds: 42 / 60,
  chargeSpeedMultiplier: 3.85 / 2.1,
  arrowFlight: {
    straightFrames: 4,
    brakeSpeedMetersPerSecond: 48,
    coast: { retainPerFrame: 0.987, gravityMetersPerSecond2: 12 },
    combatRangeMeters: 24
  }
};

const F4_CANOPY_GUARD: WeaponProfile = {
  ...WEAPON_PROFILES['canopy-guard'],
  canopy: { recoveryLockSeconds: 60 / 60 },
  fireIntervalSeconds: 29 / 60,
  speedMetersPerSecond: 109,
  lifeSeconds: 38 / 60,
  pelletCount: 11,
  inkCost: 5.5,
  damage: 16.2
};

const F4_WAVE_SLOSHER: WeaponProfile = {
  ...WEAPON_PROFILES['wave-slosher'],
  slosher: { recoveryLockSeconds: 40 / 60 },
  fireIntervalSeconds: 29 / 60,
  speedMetersPerSecond: 32,
  gravityMetersPerSecond2: 34,
  lifeSeconds: 73 / 60,
  pelletCount: 9,
  inkCost: 7,
  damage: 70
};

// Local tuning in world meters, seconds, HP and tank percent. The group
// structure comes from the weapon brief. Flight and contact values are provisional.
const F4_METRO_ROLLER: WeaponProfile = {
  ...WEAPON_PROFILES['metro-roller'],
  fireIntervalSeconds: 35 / 60,
  gravityMetersPerSecond2: 24,
  lifeSeconds: 36 / 60,
  inkCost: 8.5,
  pelletCount: 13,
  contactWeapon: {
    horizontal: [
      { count: 12, speed: 14.5, speedVariation: 2, spread: 21, pitch: 6, damage: 23, paintRadius: 0.43 },
      { count: 1, speed: 7.5, speedVariation: 0.45, spread: 4, pitch: -9, damage: 16, paintRadius: 0.51 }
    ],
    vertical: [
      { count: 1, speed: 22, speedVariation: 0, spread: 0, pitch: 12, damage: 62, paintRadius: 0.48 },
      { count: 2, speed: 18.4, speedVariation: 0.6, spread: 4, pitch: 6, damage: 32, paintRadius: 0.41 },
      { count: 2, speed: 13.2, speedVariation: 0.6, spread: 8, pitch: -3, damage: 21, paintRadius: 0.37 }
    ],
    swingRecovery: 44 / 60,
    verticalRecovery: 56 / 60,
    verticalInterval: 43 / 60,
    rollAfterFrames: 28,
    rollAccelerationFrames: 84,
    moveMultiplier: [0.80, 1.04],
    rollHalfWidth: [0.47, 0.86],
    rollInk: [0.026, 0.105],
    rollRecovery: 22 / 60,
    contactHalfWidth: 0.44,
    contactDamage: 105
  }
};

const F4_DASH_BRUSH: WeaponProfile = {
  ...WEAPON_PROFILES['dash-brush'],
  fireIntervalSeconds: 6 / 60,
  gravityMetersPerSecond2: 25,
  lifeSeconds: 29 / 60,
  inkCost: 2,
  pelletCount: 3,
  contactWeapon: {
    horizontal: [
      { count: 2, speed: 10, speedVariation: 0.8, spread: 16, pitch: 2, damage: 18, paintRadius: 0.48 },
      { count: 1, speed: 6.4, speedVariation: 0.55, spread: 19, pitch: -7, damage: 14, paintRadius: 0.34 }
    ],
    swingRecovery: 32 / 60,
    rollAfterFrames: 12,
    rollAccelerationFrames: 0,
    moveMultiplier: [1.23, 1.23],
    rollHalfWidth: [0.29, 0.29],
    rollInk: [0.13, 0.13],
    rollRecovery: 22 / 60,
    contactHalfWidth: 0.22,
    contactDamage: 19
  }
};

export function nextWeaponId(id: WeaponId, delta: number): WeaponId {
  const index = WEAPON_ORDER.indexOf(id);
  const safeIndex = index >= 0 ? index : 0;
  const next = (safeIndex + delta % WEAPON_ORDER.length + WEAPON_ORDER.length) % WEAPON_ORDER.length;
  return WEAPON_ORDER[next] ?? DEFAULT_WEAPON_ID;
}
