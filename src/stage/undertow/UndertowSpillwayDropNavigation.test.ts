import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../../config/game/gameConfig';
import {
  UNDERTOW_FIRST_DROP_LINK_AUDIT,
  UNDERTOW_FIRST_DROP_LINK_RECORDS,
  undertowFirstDropLinkErrors,
  undertowFirstDropNavigationLinks
} from './UndertowSpillwayDropNavigation';

describe('T21-D first-drop one-way navigation', () => {
  it('keeps the audited mirrored cell pairs exact', () => {
    expect(undertowFirstDropLinkErrors()).toEqual([]);
    expect(UNDERTOW_FIRST_DROP_LINK_RECORDS).toHaveLength(12);
    expect(UNDERTOW_FIRST_DROP_LINK_AUDIT).toMatchObject({
      linksPerSide: 6,
      rasterStepMeters: 0.125,
      startYProjectMeters: 7.5,
      endYProjectMeters: 3,
      verticalDropMeters: 4.5,
      bidirectional: false,
      confidence: 'HIGH'
    });
  });

  it('creates only unidirectional links using the frozen CPU agent radius', () => {
    const links = undertowFirstDropNavigationLinks();
    expect(links).toHaveLength(12);
    expect(links.every((link) => link.bidirectional === false)).toBe(true);
    expect(
      links.every((link) => link.radiusMeters === GAME_CONFIG.cpu.agentRadiusMeters)
    ).toBe(true);
    expect(links.every((link) => link.start[1] === 7.5)).toBe(true);
    expect(links.every((link) => link.end[1] === 3)).toBe(true);
  });

  it('keeps NEG cell pairs as exact 180-degree model-space mirrors', () => {
    const half = UNDERTOW_FIRST_DROP_LINK_RECORDS.length / 2;
    for (let i = 0; i < half; i += 1) {
      const pos = UNDERTOW_FIRST_DROP_LINK_RECORDS[i]!;
      const neg = UNDERTOW_FIRST_DROP_LINK_RECORDS[i + half]!;
      expect(neg.upperCell).toEqual([-pos.upperCell[0], -pos.upperCell[1]]);
      expect(neg.lowerCell).toEqual([-pos.lowerCell[0], -pos.lowerCell[1]]);
    }
  });
});
