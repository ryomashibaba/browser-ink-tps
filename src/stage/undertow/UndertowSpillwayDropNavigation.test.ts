import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../../config/game/gameConfig';
import {
  UNDERTOW_FIRST_DROP_LINK_AUDIT,
  UNDERTOW_FIRST_DROP_LINK_RECORDS,
  UNDERTOW_RIGHT_SMALL_DROP_LINK_AUDIT,
  UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS,
  undertowDropNavigationErrors,
  undertowDropNavigationLinks,
  undertowFirstDropLinkErrors,
  undertowFirstDropNavigationLinks,
  undertowRightSmallDropNavigationLinks
} from './UndertowSpillwayDropNavigation';

describe('T21-D one-way drop navigation', () => {
  it('keeps the first-drop audited mirrored cell pairs exact', () => {
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

  it('promotes the separate right-small-drop as seven mirrored links per side', () => {
    expect(UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS).toHaveLength(14);
    expect(UNDERTOW_RIGHT_SMALL_DROP_LINK_AUDIT).toMatchObject({
      linksPerSide: 7,
      startYProjectMeters: 7.5,
      endYProjectMeters: 4.5,
      verticalDropMeters: 3,
      bidirectional: false,
      confidence: 'HIGH'
    });
    const links = undertowRightSmallDropNavigationLinks();
    expect(links).toHaveLength(14);
    expect(links.every((link) => link.start[1] === 7.5)).toBe(true);
    expect(links.every((link) => link.end[1] === 4.5)).toBe(true);
  });

  it('creates only one-way links using the frozen CPU agent radius', () => {
    expect(undertowDropNavigationErrors()).toEqual([]);
    const links = undertowDropNavigationLinks();
    expect(links).toHaveLength(26);
    expect(links.every((link) => link.bidirectional === false)).toBe(true);
    expect(
      links.every((link) => link.radiusMeters === GAME_CONFIG.cpu.agentRadiusMeters)
    ).toBe(true);
    expect(new Set(links.map((link) => link.id)).size).toBe(26);
    expect(new Set(links.map((link) => link.userId)).size).toBe(26);
  });

  it('keeps both NEG sets as exact 180-degree model-space mirrors', () => {
    for (const records of [
      UNDERTOW_FIRST_DROP_LINK_RECORDS,
      UNDERTOW_RIGHT_SMALL_DROP_LINK_RECORDS
    ]) {
      const half = records.length / 2;
      for (let i = 0; i < half; i += 1) {
        const pos = records[i]!;
        const neg = records[i + half]!;
        expect(neg.upperCell).toEqual([-pos.upperCell[0], -pos.upperCell[1]]);
        expect(neg.lowerCell).toEqual([-pos.lowerCell[0], -pos.lowerCell[1]]);
      }
    }
  });

  it('retains focused first-drop export behavior', () => {
    const links = undertowFirstDropNavigationLinks();
    expect(links).toHaveLength(12);
    expect(links.every((link) => link.start[1] === 7.5)).toBe(true);
    expect(links.every((link) => link.end[1] === 3)).toBe(true);
  });
});
