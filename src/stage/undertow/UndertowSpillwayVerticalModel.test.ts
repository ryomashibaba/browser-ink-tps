import { describe, expect, it } from 'vitest';
import { resolveVerticalConstraints } from '../measurement/VerticalConstraintGraph';
import {
  UNDERTOW_VERTICAL_BANDS,
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

describe('T21-C Undertow vertical reconstruction', () => {
  it('resolves only the center small step from the confirmed center-low seed at blockout level', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.conflicts).toEqual([]);
    expect(result.values['center-low-floor']).toBe(0);
    expect(result.values['center-small-step-top']).toBe(1.5);

    expect(result.values['glass-lower-major-floor']).toBeUndefined();
    expect(result.values['glass-overhang-high-reference']).toBeUndefined();
    expect(result.values['team-a-spawn-floor']).toBeUndefined();
    expect(result.values['team-a-first-drop-landing']).toBeUndefined();
  });

  it('resolves the center-side slope endpoints to Y=1.5 but keeps high ends/grates unseeded', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );
    expect(result.values['center-left-slope-low']).toBe(1.5);
    expect(result.values['center-right-slope-low']).toBe(1.5);

    for (const id of [
      'center-left-slope-high',
      'center-right-slope-high',
      'negative-z-grate-floor',
      'positive-z-grate-floor'
    ]) {
      expect(result.values[id]).toBeUndefined();
    }
  });

  it('keeps HIGH vertical relations out of Stable Freeze until independently confirmed', () => {
    const result = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'STABLE_FREEZE'
    );
    expect(result.values).toEqual({ 'center-low-floor': 0 });
  });

  it('keeps first-drop magnitude as candidates rather than an exact relation', () => {
    const firstDropRelations = UNDERTOW_VERTICAL_RELATIONS.filter(
      (relation) => relation.fromId.includes('spawn-floor') &&
        relation.toId.includes('first-drop-landing')
    );
    expect(firstDropRelations).toHaveLength(2);
    for (const relation of firstDropRelations) {
      expect(relation.deltaMeters).toBeUndefined();
      expect(relation.candidatesMeters).toEqual([-1.5, -3]);
      expect(relation.confidence).toBe('PROVISIONAL');
    }
  });

  it('never exposes the slope-marked glass overhang as a flat platform Y', () => {
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
