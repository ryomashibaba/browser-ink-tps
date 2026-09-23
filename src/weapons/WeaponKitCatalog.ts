import type { WeaponId } from './WeaponCatalog';

export type SubWeaponId =
  | 'pulse-bomb'
  | 'snap-bomb'
  | 'anchor-bomb';

export type SpecialWeaponId =
  | 'turf-pulse'
  | 'triple-strike'
  | 'drift-storm';

export interface SubWeaponProfile {
  id: SubWeaponId;
  displayName: string;
  shortName: string;
  inkCost: number;
  throwSpeedMetersPerSecond: number;
  upwardBoostMetersPerSecond: number;
  gravityMetersPerSecond2: number;
  maxFlightSeconds: number;
  fuseSeconds: number;
  visualDiameterMeters: number;
  paintRadiusMeters: number;
  outerDamageRadiusMeters: number;
  outerDamage: number;
  innerDamageRadiusMeters: number;
  innerExtraDamage: number;
  detonateOnImpact: boolean;
  stickOnContact: boolean;
}

export interface SpecialWeaponProfile {
  id: SpecialWeaponId;
  displayName: string;
  shortName: string;
  requiredPoints: number;
}

export interface WeaponKit {
  sub: SubWeaponId;
  special: SpecialWeaponId;
}

export const SUB_WEAPONS: Readonly<Record<SubWeaponId, SubWeaponProfile>> = {
  'pulse-bomb': {
    id: 'pulse-bomb',
    displayName: 'Pulse Bomb',
    shortName: 'PULSE',
    inkCost: 70,
    throwSpeedMetersPerSecond: 10.5,
    upwardBoostMetersPerSecond: 4.6,
    gravityMetersPerSecond2: 18,
    maxFlightSeconds: 3.0,
    fuseSeconds: 1.0,
    visualDiameterMeters: 0.22,
    paintRadiusMeters: 2.25,
    outerDamageRadiusMeters: 2.4,
    outerDamage: 30,
    innerDamageRadiusMeters: 1.0,
    innerExtraDamage: 70,
    detonateOnImpact: false,
    stickOnContact: false
  },
  'snap-bomb': {
    id: 'snap-bomb',
    displayName: 'Snap Bomb',
    shortName: 'SNAP',
    inkCost: 45,
    throwSpeedMetersPerSecond: 13.5,
    upwardBoostMetersPerSecond: 3.0,
    gravityMetersPerSecond2: 20,
    maxFlightSeconds: 2.4,
    fuseSeconds: 0,
    visualDiameterMeters: 0.17,
    paintRadiusMeters: 1.25,
    outerDamageRadiusMeters: 1.55,
    outerDamage: 35,
    innerDamageRadiusMeters: 0.55,
    innerExtraDamage: 25,
    detonateOnImpact: true,
    stickOnContact: false
  },
  'anchor-bomb': {
    id: 'anchor-bomb',
    displayName: 'Anchor Bomb',
    shortName: 'ANCHOR',
    inkCost: 70,
    throwSpeedMetersPerSecond: 9.0,
    upwardBoostMetersPerSecond: 4.0,
    gravityMetersPerSecond2: 17,
    maxFlightSeconds: 3.2,
    fuseSeconds: 2.0,
    visualDiameterMeters: 0.24,
    paintRadiusMeters: 2.55,
    outerDamageRadiusMeters: 2.65,
    outerDamage: 30,
    innerDamageRadiusMeters: 1.05,
    innerExtraDamage: 70,
    detonateOnImpact: false,
    stickOnContact: true
  }
};

export const SPECIAL_WEAPONS: Readonly<Record<SpecialWeaponId, SpecialWeaponProfile>> = {
  'turf-pulse': {
    id: 'turf-pulse',
    displayName: 'Turf Pulse',
    shortName: 'PULSE',
    requiredPoints: 180
  },
  'triple-strike': {
    id: 'triple-strike',
    displayName: 'Triple Strike',
    shortName: 'STRIKE',
    requiredPoints: 190
  },
  'drift-storm': {
    id: 'drift-storm',
    displayName: 'Drift Storm',
    shortName: 'STORM',
    requiredPoints: 200
  }
};

export const WEAPON_KITS: Readonly<Record<WeaponId, WeaponKit>> = {
  'pulse-sprayer': { sub: 'pulse-bomb', special: 'turf-pulse' },
  'needle-smg': { sub: 'snap-bomb', special: 'drift-storm' },
  'twin-comets': { sub: 'snap-bomb', special: 'turf-pulse' },
  'rail-charger': { sub: 'anchor-bomb', special: 'triple-strike' },
  'arc-blaster': { sub: 'pulse-bomb', special: 'triple-strike' },
  'metro-roller': { sub: 'anchor-bomb', special: 'turf-pulse' },
  'dash-brush': { sub: 'snap-bomb', special: 'drift-storm' },
  'wave-slosher': { sub: 'pulse-bomb', special: 'drift-storm' },
  'rotor-splatling': { sub: 'anchor-bomb', special: 'triple-strike' },
  'canopy-guard': { sub: 'anchor-bomb', special: 'drift-storm' },
  'chord-stringer': { sub: 'pulse-bomb', special: 'triple-strike' },
  'ink-saber': { sub: 'snap-bomb', special: 'turf-pulse' }
};

export function weaponKit(id: WeaponId): WeaponKit {
  return WEAPON_KITS[id];
}

export function subWeaponProfile(id: SubWeaponId): SubWeaponProfile {
  return SUB_WEAPONS[id];
}

export function specialWeaponProfile(id: SpecialWeaponId): SpecialWeaponProfile {
  return SPECIAL_WEAPONS[id];
}
