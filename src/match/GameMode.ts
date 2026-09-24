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

export type ZonesTimeoutDecision =
  | { kind: 'CONTINUE' }
  | { kind: 'START_OVERTIME'; team: Team.A | Team.B }
  | { kind: 'FINISH'; result: 'TEAM A' | 'TEAM B' | 'TIE' };

export function resolveZonesTimeout(
  snapshot: SplatZonesSnapshot,
  overtime: boolean,
  overtimeTeam: Team
): ZonesTimeoutDecision {
  const result = zonesResult(snapshot);

  if (overtime) {
    if (overtimeTeam !== Team.A && overtimeTeam !== Team.B) {
      return { kind: 'FINISH', result };
    }
    if (snapshot.control !== overtimeTeam) {
      return { kind: 'FINISH', result };
    }
    const overtaking =
      (overtimeTeam === Team.A && snapshot.countA < snapshot.countB) ||
      (overtimeTeam === Team.B && snapshot.countB < snapshot.countA);
    return overtaking
      ? { kind: 'FINISH', result: overtimeTeam === Team.A ? 'TEAM A' : 'TEAM B' }
      : { kind: 'CONTINUE' };
  }

  const winnerTeam = teamForResult(result);
  if (winnerTeam === Team.Neutral) {
    if (snapshot.control === Team.A || snapshot.control === Team.B) {
      return { kind: 'START_OVERTIME', team: snapshot.control };
    }
    return { kind: 'FINISH', result: 'TIE' };
  }

  const trailingTeam = winnerTeam === Team.A ? Team.B : Team.A;
  return snapshot.control === trailingTeam
    ? { kind: 'START_OVERTIME', team: trailingTeam }
    : { kind: 'FINISH', result };
}
