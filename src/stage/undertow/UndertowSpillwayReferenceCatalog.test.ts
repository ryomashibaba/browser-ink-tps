import { describe, expect, it } from 'vitest';
import {
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
