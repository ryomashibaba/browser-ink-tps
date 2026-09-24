import { describe, expect, it } from 'vitest';
import { Team } from '../ink/types';
import { resolveZonesTimeout, zonesResult } from './GameMode';
import { resolveZoneControl } from '../objective/SplatZonesObjectiveSystem';

describe('T20 Splat Zones rules', () => {
  it('captures only with sufficient paint and lead', () => {
    expect(resolveZoneControl(70, 10, Team.Neutral)).toBe(Team.A);
    expect(resolveZoneControl(10, 70, Team.Neutral)).toBe(Team.B);
    expect(resolveZoneControl(65, 55, Team.Neutral)).toBe(Team.Neutral);
  });

  it('retains control through a narrow contested state without flicker', () => {
    expect(resolveZoneControl(45, 40, Team.A)).toBe(Team.A);
    expect(resolveZoneControl(40, 45, Team.B)).toBe(Team.B);
    expect(resolveZoneControl(35, 35, Team.A)).toBe(Team.Neutral);
  });

  it('starts overtime only when the trailing team controls at time expiry', () => {
    const base = {
      percentA: 60,
      percentB: 30,
      penaltyA: 0,
      penaltyB: 0
    };
    expect(resolveZonesTimeout(
      { ...base, control: Team.A, countA: 30, countB: 20 },
      false,
      Team.Neutral
    )).toEqual({ kind: 'START_OVERTIME', team: Team.A });
    expect(resolveZonesTimeout(
      { ...base, control: Team.B, countA: 30, countB: 20 },
      false,
      Team.Neutral
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
  });

  it('ends overtime when control is lost or the overtime team takes the lead', () => {
    const base = {
      percentA: 60,
      percentB: 30,
      penaltyA: 0,
      penaltyB: 0
    };
    expect(resolveZonesTimeout(
      { ...base, control: Team.Neutral, countA: 24, countB: 20 },
      true,
      Team.A
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
    expect(resolveZonesTimeout(
      { ...base, control: Team.A, countA: 19, countB: 20 },
      true,
      Team.A
    )).toEqual({ kind: 'FINISH', result: 'TEAM A' });
    expect(resolveZonesTimeout(
      { ...base, control: Team.A, countA: 22, countB: 20 },
      true,
      Team.A
    )).toEqual({ kind: 'CONTINUE' });
  });

  it('uses the lower remaining counter as the winner', () => {
    const base = {
      control: Team.Neutral,
      percentA: 0,
      percentB: 0,
      penaltyA: 0,
      penaltyB: 0
    };
    expect(zonesResult({ ...base, countA: 42, countB: 58 })).toBe('TEAM A');
    expect(zonesResult({ ...base, countA: 72, countB: 38 })).toBe('TEAM B');
    expect(zonesResult({ ...base, countA: 50, countB: 50 })).toBe('TIE');
  });
});
