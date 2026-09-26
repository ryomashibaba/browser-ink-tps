import { describe, expect, it } from 'vitest';
import { resolveVerticalConstraints } from '../measurement/VerticalConstraintGraph';
import { UNDERTOW_CAPTURED_CONNECTIONS } from './UndertowSpillwayCaptureTopology';
import { UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER } from './UndertowSpillwayMeasurementLedger';
import { UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT } from './UndertowSpillwayRemodelGeometryAudit';
import { UNDERTOW_SOURCE_TOPOLOGY_LIMITS } from './UndertowSpillwaySourceTopologyAudit';
import {
  UNDERTOW_VERTICAL_NODES,
  UNDERTOW_VERTICAL_RELATIONS
} from './UndertowSpillwayVerticalModel';

describe('T21-C cross-file vertical semantic invariant', () => {
  it('uses the Temple01 audit as the canonical right-low / underpass / glass-reference Y authority', () => {
    const geometry = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT;
    const resolved = resolveVerticalConstraints(
      UNDERTOW_VERTICAL_NODES,
      UNDERTOW_VERTICAL_RELATIONS,
      'BLOCKOUT'
    );

    expect(resolved.conflicts).toEqual([]);
    expect(resolved.values['right-low-floor']).toBe(geometry.projectY.rightLow);
    expect(resolved.values['glass-lower-major-floor']).toBe(geometry.projectY.glassUnderpassFloor);
    expect(resolved.values['glass-overhang-high-reference']).toBe(
      geometry.projectY.glassOverhangHighReference
    );

    const rightLowToUnderpass = UNDERTOW_VERTICAL_RELATIONS.find(
      (relation) =>
        relation.fromId === 'right-low-floor' &&
        relation.toId === 'glass-lower-major-floor'
    );
    const underpassToHigh = UNDERTOW_VERTICAL_RELATIONS.find(
      (relation) =>
        relation.fromId === 'glass-lower-major-floor' &&
        relation.toId === 'glass-overhang-high-reference'
    );

    expect(rightLowToUnderpass).toMatchObject({
      deltaMeters: geometry.deltas.rightLowToGlassUnderpassMeters,
      confidence: 'HIGH'
    });
    expect(rightLowToUnderpass?.evidenceIds).toContain('extracted-temple01-geometry');
    expect(underpassToHigh).toMatchObject({
      deltaMeters: geometry.deltas.glassUnderpassToHighReferenceMeters,
      confidence: 'HIGH'
    });
    expect(underpassToHigh?.evidenceIds).toContain('extracted-temple01-geometry');
  });

  it('keeps capture traversal semantics non-metric', () => {
    const connection = UNDERTOW_CAPTURED_CONNECTIONS.find(
      (item) => item.from === 'RIGHT_LOW' && item.to === 'GLASS_UNDERPASS'
    );

    expect(connection).toMatchObject({
      kind: 'TRAVERSABLE_CONNECTION',
      confidence: 'HIGH'
    });
    expect(connection?.deltaYMeters).toBeUndefined();
    expect(connection?.evidenceIds).not.toContain('extracted-temple01-geometry');
  });

  it('keeps ledger and source-topology wording aligned with the same authority', () => {
    const geometry = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT;
    const rightLow = UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.find(
      (entry) => entry.id === 'right-low-floor'
    );
    const underpass = UNDERTOW_SPILLWAY_MEASUREMENT_LEDGER.entries.find(
      (entry) => entry.id === 'upper-glass-underpass'
    );
    const topology = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'glass-underpass-walkable-outline'
    );

    expect(rightLow?.y).toMatchObject({
      yMeters: geometry.projectY.rightLow,
      confidence: 'HIGH'
    });
    expect(underpass?.y).toMatchObject({
      yMeters: geometry.projectY.glassUnderpassFloor,
      confidence: 'HIGH'
    });
    expect(topology?.reason).toContain('model Y=3.0m');
    expect(topology?.reason).not.toContain('same-height connection');
  });
});
