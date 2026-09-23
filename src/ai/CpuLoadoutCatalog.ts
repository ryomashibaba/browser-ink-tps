import { Team } from '../ink/types';
import type { WeaponId } from '../weapons/WeaponCatalog';
import type { CpuRole } from './CpuTacticalDirector';

export interface CpuLoadout {
  weaponId: WeaponId;
  role: CpuRole;
  tacticalLabel: string;
}

const TEAM_A_LOADOUTS: readonly CpuLoadout[] = [
  { weaponId: 'needle-smg', role: 'PAINTER', tacticalLabel: 'mobile painter' },
  { weaponId: 'twin-comets', role: 'SKIRMISHER', tacticalLabel: 'dualie skirmisher' },
  { weaponId: 'wave-slosher', role: 'PAINTER', tacticalLabel: 'lob painter' },
  { weaponId: 'rail-charger', role: 'ANCHOR', tacticalLabel: 'charger anchor' }
];

const TEAM_B_LOADOUTS: readonly CpuLoadout[] = [
  { weaponId: 'pulse-sprayer', role: 'PAINTER', tacticalLabel: 'balanced painter' },
  { weaponId: 'arc-blaster', role: 'SKIRMISHER', tacticalLabel: 'blast skirmisher' },
  { weaponId: 'needle-smg', role: 'PAINTER', tacticalLabel: 'mobile painter' },
  { weaponId: 'rotor-splatling', role: 'ANCHOR', tacticalLabel: 'splatling anchor' }
];

export function cpuLoadout(team: Team.A | Team.B, slot: number): CpuLoadout {
  const table = team === Team.A ? TEAM_A_LOADOUTS : TEAM_B_LOADOUTS;
  return table[slot % table.length] ?? table[0]!;
}

export const CPU_SUPPORTED_WEAPONS: readonly WeaponId[] = [
  'pulse-sprayer',
  'needle-smg',
  'twin-comets',
  'rail-charger',
  'arc-blaster',
  'wave-slosher',
  'rotor-splatling'
];
