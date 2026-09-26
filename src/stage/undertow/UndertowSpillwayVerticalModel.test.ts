import { describe, expect, it } from 'vitest';
import { resolveVerticalConstraints } from '../measurement/VerticalConstraintGraph';
import {
  UNDERTOW_VERTICAL_BANDS,
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

describe('T21-C Undertow vertical reconstruction', () => {
  it('resolves the corrected Temple01 vertical model at BLOCKOUT confidence', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.conflicts).toEqual([]);
    expect(result.unresolved).toEqual([]);

    expect(result.values).toMatchObject({
      'center-low-floor': 0,
      'center-small-step-top': 1.5,
      'center-left-slope-low': -1.5,
      'center-left-slope-high': 0,
      'center-right-slope-low': -1.5,
      'center-right-slope-high': 0,
      'negative-z-grate-floor': 7.4,
      'positive-z-grate-floor': 7.4,
      'team-a-spawn-floor': 7.5,
      'team-b-spawn-floor': 7.5,
      'team-a-first-drop-landing': 3,
      'team-b-first-drop-landing': 3,
      'right-low-floor': 4.5,
      'right-small-drop-upper': 7.5,
      'glass-lower-major-floor': 4.5,
      'glass-overhang-high-reference': 7.5
    });
  });

  it('keeps first drop 4.5m and the separate right drop 3.0m', () => {
    const firstDropRelations = UNDERTOW_VERTICAL_RELATIONS.filter(
      (relation) => relation.fromId.includes('spawn-floor') &&
        relation.toId.includes('first-drop-landing')
    );
    expect(firstDropRelations).toHaveLength(2);
    for (const relation of firstDropRelations) {
      expect(relation.deltaMeters).toBe(-4.5);
      expect(relation.candidatesMeters).toBeUndefined();
      expect(relation.confidence).toBe('HIGH');
    }

    expect(
      UNDERTOW_VERTICAL_RELATIONS.find(
        (relation) =>
          relation.fromId === 'right-low-floor' &&
          relation.toId === 'right-small-drop-upper'
      )
    ).toMatchObject({ deltaMeters: 3, confidence: 'HIGH' });
  });

  it('keeps the corrected central slopes below center-low and ending at Y=0', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.values['center-left-slope-low']).toBe(-1.5);
    expect(result.values['center-left-slope-high']).toBe(0);
    expect(result.values['center-right-slope-low']).toBe(-1.5);
    expect(result.values['center-right-slope-high']).toBe(0);
  });

  it('records the grate visual top as HIGH blockout geometry, not Stable-Freeze geometry', () => {
    const grate = UNDERTOW_VERTICAL_NODES.find(
      (node) => node.id === 'negative-z-grate-floor'
    );
    expect(grate?.absolute).toMatchObject({
      yMeters: 7.4,
      confidence: 'HIGH'
    });
    expect(grate?.absolute.notes).toContain('visual top');
  });

  it('keeps HIGH remodel values out of Stable Freeze until independently confirmed', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'STABLE_FREEZE'
    );
    expect(result.values).toEqual({ 'center-low-floor': 0 });
  });

  it('never exposes the slope-marked glass overhang as a single intrinsic flat-platform absolute node', () => {
    const glassNode = UNDERTOW_VERTICAL_NODES.find(
      (node) => node.id === 'glass-overhang-high-reference'
    );
    expect(glassNode?.absolute.yMeters).toBeUndefined();
    expect(glassNode?.absolute.notes).toContain('not a single flat platform Y');
  });

  it('keeps broader upper-level hypotheses provisional', () => {
    expect(UNDERTOW_VERTICAL_BANDS.verticalGridMeters).toEqual({
      value: 1.5,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_VERTICAL_BANDS.centerUpperRelativeToLow.confidence).toBe('PROVISIONAL');
    expect(UNDERTOW_VERTICAL_BANDS.raisedHighPlatformCandidate.confidence).toBe('PROVISIONAL');
  });
});
