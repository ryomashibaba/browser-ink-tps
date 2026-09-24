import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { Team } from '../ink/types';
import {
  calculateZonePenalty,
  resolveZoneControl
} from '../objective/SplatZonesObjectiveSystem';
import { resolveZonesTimeout, zonesResult } from './GameMode';

const noRecentLoss = Number.POSITIVE_INFINITY;

describe('T20 Splat Zones rules', () => {
  it('uses series-style 70% capture and opponent-coverage neutralization', () => {
    expect(resolveZoneControl(70, 10, Team.Neutral)).toBe(Team.A);
    expect(resolveZoneControl(10, 70, Team.Neutral)).toBe(Team.B);
    expect(resolveZoneControl(69, 10, Team.Neutral)).toBe(Team.Neutral);

    expect(resolveZoneControl(20, 49, Team.A)).toBe(Team.A);
    expect(resolveZoneControl(20, 50, Team.A)).toBe(Team.Neutral);
    expect(resolveZoneControl(10, 70, Team.A)).toBe(Team.B);
  });

  it('paces a clean 100-count hold to about 60 seconds', () => {
    expect(GAME_CONFIG.match.splatZones.countPerSecond * 60).toBeCloseTo(100, 6);
    expect(GAME_CONFIG.match.splatZones.penaltyClearPerSecond)
      .toBeCloseTo(GAME_CONFIG.match.splatZones.countPerSecond, 9);
  });

  it('matches documented series-style control-period penalty examples', () => {
    expect(calculateZonePenalty(100, 70)).toBe(24);
    expect(calculateZonePenalty(100, 50)).toBe(39);
    expect(calculateZonePenalty(100, 20)).toBe(61);
    expect(calculateZonePenalty(94, 81)).toBe(10);
  });

  it('starts overtime when the trailing team controls at time expiry', () => {
    const base = {
      percentA: 60,
      percentB: 30,
      penaltyA: 0,
      penaltyB: 0,
      lossAgeA: noRecentLoss,
      lossAgeB: noRecentLoss
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

  it('allows the trailing team to enter overtime during the recent-loss grace', () => {
    const base = {
      control: Team.Neutral,
      percentA: 45,
      percentB: 45,
      penaltyA: 0,
      penaltyB: 0,
      lossAgeB: noRecentLoss
    };
    expect(resolveZonesTimeout(
      { ...base, countA: 30, countB: 20, lossAgeA: 4 },
      false,
      Team.Neutral
    )).toEqual({ kind: 'START_OVERTIME', team: Team.A });
    expect(resolveZonesTimeout(
      { ...base, countA: 30, countB: 20, lossAgeA: 10.1 },
      false,
      Team.Neutral
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
  });

  it('keeps overtime through neutral grace, then ends it or the maximum overtime cap', () => {
    const base = {
      percentA: 45,
      percentB: 45,
      penaltyA: 0,
      penaltyB: 0,
      lossAgeB: noRecentLoss,
      countA: 24,
      countB: 20
    };
    expect(resolveZonesTimeout(
      { ...base, control: Team.Neutral, lossAgeA: 9 },
      true,
      Team.A,
      20
    )).toEqual({ kind: 'CONTINUE' });
    expect(resolveZonesTimeout(
      { ...base, control: Team.Neutral, lossAgeA: 10.1 },
      true,
      Team.A,
      20
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
    expect(resolveZonesTimeout(
      { ...base, control: Team.A, lossAgeA: noRecentLoss },
      true,
      Team.A,
      GAME_CONFIG.match.splatZones.maxOvertimeSeconds
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
  });

  it('ends overtime immediately when the winning team retakes or the overtime team leads', () => {
    const base = {
      percentA: 60,
      percentB: 30,
      penaltyA: 0,
      penaltyB: 0,
      lossAgeA: noRecentLoss,
      lossAgeB: noRecentLoss
    };
    expect(resolveZonesTimeout(
      { ...base, control: Team.B, countA: 24, countB: 20 },
      true,
      Team.A,
      5
    )).toEqual({ kind: 'FINISH', result: 'TEAM B' });
    expect(resolveZonesTimeout(
      { ...base, control: Team.A, countA: 19, countB: 20 },
      true,
      Team.A,
      5
    )).toEqual({ kind: 'FINISH', result: 'TEAM A' });
  });

  it('uses the lower main counter as the regulation winner', () => {
    const base = {
      control: Team.Neutral,
      percentA: 0,
      percentB: 0,
      penaltyA: 0,
      penaltyB: 0,
      lossAgeA: noRecentLoss,
      lossAgeB: noRecentLoss
    };
    expect(zonesResult({ ...base, countA: 42, countB: 58 })).toBe('TEAM A');
    expect(zonesResult({ ...base, countA: 72, countB: 38 })).toBe('TEAM B');
    expect(zonesResult({ ...base, countA: 50, countB: 50 })).toBe('TIE');
  });
});
