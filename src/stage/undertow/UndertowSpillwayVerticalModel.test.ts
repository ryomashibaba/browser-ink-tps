import { describe, expect, it } from 'vitest';
import { resolveVerticalConstraints } from '../measurement/VerticalConstraintGraph';
import {
  UNDERTOW_VERTICAL_BANDS,
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

describe('T21-C Undertow vertical reconstruction', () => {
  it('resolves the remodeled spawn / first-drop / right-low chain at BLOCKOUT confidence', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.conflicts).toEqual([]);

    expect(result.values['center-low-floor']).toBe(0);
    expect(result.values['center-small-step-top']).toBe(1.5);
    expect(result.values['center-left-slope-low']).toBe(1.5);
    expect(result.values['center-right-slope-low']).toBe(1.5);

    expect(result.values['team-a-spawn-floor']).toBe(6);
    expect(result.values['team-b-spawn-floor']).toBe(6);
    expect(result.values['team-a-first-drop-landing']).toBe(1.5);
    expect(result.values['team-b-first-drop-landing']).toBe(1.5);
    expect(result.values['right-low-floor']).toBe(3);
    expect(result.values['right-small-drop-upper']).toBe(6);
    expect(result.values['glass-lower-major-floor']).toBe(3);
    expect(result.values['glass-overhang-high-reference']).toBe(6);
  });

  it('resolves the first drop as 4.5m one-way descent instead of the old 1.5/3m candidate pair', () => {
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
  });

  it('resolves the blue/right small drop to 3m and keeps first-drop landing 1.5m below right-low', () => {
    expect(
      UNDERTOW_VERTICAL_RELATIONS.find(
        (relation) =>
          relation.fromId === 'right-low-floor' &&
          relation.toId === 'right-small-drop-upper'
      )
    ).toMatchObject({
      deltaMeters: 3,
      confidence: 'HIGH'
    });

    expect(
      UNDERTOW_VERTICAL_RELATIONS.find(
        (relation) =>
          relation.fromId === 'team-a-first-drop-landing' &&
          relation.toId === 'right-low-floor'
      )
    ).toMatchObject({
      deltaMeters: 1.5,
      confidence: 'HIGH'
    });
  });

  it('keeps only slope-high endpoints and grate elevations unresolved at BLOCKOUT confidence', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.unresolved).toEqual([
      'center-left-slope-high',
      'center-right-slope-high',
      'negative-z-grate-floor',
      'positive-z-grate-floor'
    ]);
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

  it('keeps the broader upper-level hypotheses provisional', () => {
    expect(UNDERTOW_VERTICAL_BANDS.verticalGridMeters).toEqual({
      value: 1.5,
      confidence: 'HIGH'
    });
    expect(UNDERTOW_VERTICAL_BANDS.centerUpperRelativeToLow.confidence).toBe('PROVISIONAL');
    expect(UNDERTOW_VERTICAL_BANDS.raisedHighPlatformCandidate.confidence).toBe('PROVISIONAL');
  });
});
