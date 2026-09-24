import { describe, expect, it } from 'vitest';
import { Team } from '../ink/types';
import { zonesResult } from './GameMode';
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
