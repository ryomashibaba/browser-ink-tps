import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES,
  UNDERTOW_POST_7_2_REFERENCE_MAPS,
  validateUndertowReferenceCatalog
} from './UndertowSpillwayReferenceCatalog';

describe('T21 Undertow source-version guard', () => {
  it('has exactly one post-7.2 reference for all five normal PvP rules', () => {
    expect(validateUndertowReferenceCatalog()).toEqual([]);
    expect(UNDERTOW_POST_7_2_REFERENCE_MAPS).toHaveLength(5);
  });

  it('never treats the isometric 1280x720 web maps as metric-scale authority', () => {
    for (const reference of UNDERTOW_POST_7_2_REFERENCE_MAPS) {
      expect(reference.role).toBe('VISUAL_CROSSCHECK_ONLY');
      expect(reference.widthPixels).toBe(1280);
      expect(reference.heightPixels).toBe(720);
      expect(reference.sourceVersion).toBe('7.2.0');
    }
  });

  it('keeps corrected Undertow directionality, rule-variant, and grate-mechanic evidence scoped separately', () => {
    expect(UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES).toHaveLength(5);
    expect(
      UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES
        .filter((reference) => reference.role === 'CURRENT_DIRECTIONALITY')
        .map((reference) => reference.id)
    ).toEqual([
      'CURRENT_SPAWN_TO_CENTER',
      'CURRENT_RAINMAKER_GRATE_ADVANCE',
      'CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION'
    ]);
    expect(
      UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES
        .find((reference) => reference.id === 'CURRENT_RULE_VARIANTS')
        ?.sourcePage
    ).toBe('https://kamigame.jp/splatoon3/page/230661367210732889.html');
    expect(
      UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES
        .find((reference) => reference.id === 'GENERAL_GRATE_WALKABILITY')
    ).toMatchObject({
      role: 'TERRAIN_MECHANIC',
      stageIdentity: 'SPLATOON_SERIES_GRATE'
    });
    expect(
      UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES
        .filter((reference) => reference.role !== 'TERRAIN_MECHANIC')
        .every((reference) => reference.stageIdentity === 'UNDERTOW_SPILLWAY_MATEGAI')
    ).toBe(true);
  });

  it('rejects the previously misclassified Scorch Gorge evidence pages', () => {
    const pages = UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES.map(
      (reference) => reference.sourcePage
    );
    expect(pages).not.toContain('https://gamerch.com/splatoonwiki-sogo/984847');
    expect(pages).not.toContain(
      'https://kamigame.jp/splatoon3/page/230199164238079467.html'
    );
    expect(pages).not.toContain('https://appmedia.jp/splatoon3/76009214');
  });

  it('contains no Big Run, Tricolor or pre-7.2 reference in the canonical set', () => {
    const combined = UNDERTOW_POST_7_2_REFERENCE_MAPS
      .map((reference) => reference.sourcePage.toLowerCase())
      .join(' ');
    expect(combined).not.toContain('big_run');
    expect(combined).not.toContain('tricolor');
    expect(combined).not.toContain('2.0.0');
    expect(combined).not.toContain('7.1.0');
  });
});
