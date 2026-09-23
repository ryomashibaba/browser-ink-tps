import { GAME_CONFIG } from '../config/game/gameConfig';

export type WeaponId = 'pulse-sprayer' | 'needle-smg' | 'arc-blaster';

export interface WeaponProfile {
  id: WeaponId;
  displayName: string;
  shortName: string;
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
}

export const WEAPON_ORDER: readonly WeaponId[] = [
  'pulse-sprayer',
  'needle-smg',
  'arc-blaster'
];

export const WEAPON_PROFILES: Readonly<Record<WeaponId, WeaponProfile>> = {
  'pulse-sprayer': {
    id: 'pulse-sprayer',
    displayName: 'Pulse Sprayer',
    shortName: 'PULSE',
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
    id: 'needle-smg',
    displayName: 'Needle SMG',
    shortName: 'NEEDLE',
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
  'arc-blaster': {
    id: 'arc-blaster',
    displayName: 'Arc Blaster',
    shortName: 'ARC',
    fireIntervalSeconds: 0.48,
    speedMetersPerSecond: 22,
    gravityMetersPerSecond2: 5.2,
    lifeSeconds: 2.0,
    paintRadiusMeters: 1.12,
    visualDiameterMeters: 0.22,
    damage: 70,
    inkCost: 4.6,
    fxScale: 1.75,
    audioPitch: 0.66
  }
};

export const DEFAULT_WEAPON_ID: WeaponId = 'pulse-sprayer';

export function weaponProfile(id: WeaponId): WeaponProfile {
  return WEAPON_PROFILES[id];
}
