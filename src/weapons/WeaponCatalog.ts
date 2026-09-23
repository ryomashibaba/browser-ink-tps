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
}

const BASE = {
  pelletCount: 1,
  spreadDegrees: 0,
  chargeSeconds: 0,
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
    chargeSeconds: 1.15,
    minChargeSeconds: 0.16,
    burstMaxShots: 18,
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
    damage: 28,
    inkCost: 4.8,
    fxScale: 0.9,
    audioPitch: 1.42,
    pelletCount: 3,
    spreadDegrees: 13,
    chargeSeconds: 1.20,
    minChargeSeconds: 0.15,
    chargeDamageMultiplier: 1.8,
    chargeSpeedMultiplier: 1.28,
    chargePaintMultiplier: 1.25
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

export function weaponProfile(id: WeaponId): WeaponProfile {
  return WEAPON_PROFILES[id];
}

export function nextWeaponId(id: WeaponId, delta: number): WeaponId {
  const index = WEAPON_ORDER.indexOf(id);
  const safeIndex = index >= 0 ? index : 0;
  const next = (safeIndex + delta % WEAPON_ORDER.length + WEAPON_ORDER.length) % WEAPON_ORDER.length;
  return WEAPON_ORDER[next] ?? DEFAULT_WEAPON_ID;
}
