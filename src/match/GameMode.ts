import { GAME_CONFIG } from '../config/game/gameConfig';
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
  lossAgeA: number;
  lossAgeB: number;
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
  overtimeTeam: Team,
  overtimeElapsedSeconds = 0
): ZonesTimeoutDecision {
  const result = zonesResult(snapshot);
  const tuning = GAME_CONFIG.match.splatZones;

  if (overtime) {
    if (overtimeTeam !== Team.A && overtimeTeam !== Team.B) {
      return { kind: 'FINISH', result };
    }
    if (overtimeElapsedSeconds >= tuning.maxOvertimeSeconds) {
      return { kind: 'FINISH', result };
    }

    const overtaking =
      (overtimeTeam === Team.A && snapshot.countA < snapshot.countB) ||
      (overtimeTeam === Team.B && snapshot.countB < snapshot.countA);
    if (overtaking) {
      return {
        kind: 'FINISH',
        result: overtimeTeam === Team.A ? 'TEAM A' : 'TEAM B'
      };
    }

    const winningTeam = overtimeTeam === Team.A ? Team.B : Team.A;
    if (snapshot.control === winningTeam) {
      return { kind: 'FINISH', result };
    }
    if (snapshot.control === overtimeTeam) {
      return { kind: 'CONTINUE' };
    }

    return zoneLossAge(snapshot, overtimeTeam) < tuning.overtimeGraceSeconds
      ? { kind: 'CONTINUE' }
      : { kind: 'FINISH', result };
  }

  const winnerTeam = teamForResult(result);
  if (winnerTeam === Team.Neutral) {
    if (snapshot.control === Team.A || snapshot.control === Team.B) {
      return { kind: 'START_OVERTIME', team: snapshot.control };
    }
    return { kind: 'FINISH', result: 'TIE' };
  }

  const trailingTeam = winnerTeam === Team.A ? Team.B : Team.A;
  if (snapshot.control === trailingTeam) {
    return { kind: 'START_OVERTIME', team: trailingTeam };
  }
  if (
    snapshot.control === Team.Neutral &&
    zoneLossAge(snapshot, trailingTeam) < tuning.overtimeGraceSeconds
  ) {
    return { kind: 'START_OVERTIME', team: trailingTeam };
  }
  return { kind: 'FINISH', result };
}

export function zoneLossAge(
  snapshot: SplatZonesSnapshot,
  team: Team.A | Team.B
): number {
  return team === Team.A ? snapshot.lossAgeA : snapshot.lossAgeB;
}
