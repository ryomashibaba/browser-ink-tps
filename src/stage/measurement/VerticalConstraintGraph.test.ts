import { describe, expect, it } from 'vitest';
import {
  exactRelation,
  resolveVerticalConstraints,
  type VerticalNode
} from './VerticalConstraintGraph';

describe('T21 vertical constraint resolver', () => {
  const nodes: readonly VerticalNode[] = [
    {
      id: 'base',
      absolute: { yMeters: 0, confidence: 'CONFIRMED', evidenceIds: ['base'] }
    },
    {
      id: 'high-step',
      absolute: { confidence: 'UNKNOWN', evidenceIds: [] }
    },
    {
      id: 'unknown-chain',
      absolute: { confidence: 'UNKNOWN', evidenceIds: [] }
    }
  ];

  it('propagates HIGH exact relations for blockout only', () => {
    const relation = exactRelation('base', 'high-step', 1.5, 'HIGH', ['step']);
    expect(resolveVerticalConstraints(nodes, [relation], 'BLOCKOUT').values['high-step']).toBe(1.5);
    expect(resolveVerticalConstraints(nodes, [relation], 'STABLE_FREEZE').values['high-step'])
      .toBeUndefined();
  });

  it('does not invent absolute Y from a relation whose chain has no seed', () => {
    const result = resolveVerticalConstraints(
      nodes,
      [exactRelation('high-step', 'unknown-chain', 3, 'HIGH', ['clearance'])],
      'BLOCKOUT'
    );
    expect(result.values['unknown-chain']).toBeUndefined();
  });

  it('reports contradictory exact constraints', () => {
    const conflictNodes: readonly VerticalNode[] = [
      { id: 'a', absolute: { yMeters: 0, confidence: 'CONFIRMED', evidenceIds: ['a'] } },
      { id: 'b', absolute: { yMeters: 2, confidence: 'CONFIRMED', evidenceIds: ['b'] } }
    ];
    const result = resolveVerticalConstraints(
      conflictNodes,
      [exactRelation('a', 'b', 1.5, 'CONFIRMED', ['relation'])],
      'STABLE_FREEZE'
    );
    expect(result.conflicts).toHaveLength(1);
  });
});
