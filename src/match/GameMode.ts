import { Team } from '../ink/types';

export type GameModeId = 'TURF_WAR' | 'SPLAT_ZONES';

export const GAME_MODE_ORDER: readonly GameModeId[] = [
  'TURF_WAR',
  'SPLAT_ZONES'
];

export function gameModeLabel(mode: GameModeId): string {
  return mode === 'SPLAT_ZONES' ? 'Splat Zones' : 'Turf War';
}

export interface SplatZonesSnapshot {
  control: Team;
  percentA: number;
  percentB: number;
  countA: number;
  countB: number;
  penaltyA: number;
  penaltyB: number;
}

export function zonesResult(snapshot: SplatZonesSnapshot): 'TEAM A' | 'TEAM B' | 'TIE' {
  const difference = snapshot.countA - snapshot.countB;
  if (Math.abs(difference) <= 1e-6) return 'TIE';
  return difference < 0 ? 'TEAM A' : 'TEAM B';
}

export function teamForResult(result: 'TEAM A' | 'TEAM B' | 'TIE'): Team {
  if (result === 'TEAM A') return Team.A;
  if (result === 'TEAM B') return Team.B;
  return Team.Neutral;
}
