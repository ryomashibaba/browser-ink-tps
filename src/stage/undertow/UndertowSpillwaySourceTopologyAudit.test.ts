import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_SOURCE_TOPOLOGY_LIMITS,
  unresolvedUndertowSourceTopologyLimits
} from './UndertowSpillwaySourceTopologyAudit';

describe('T21-B Undertow vector-source topology limits', () => {
  it('allows the non-flat spawn terrain envelope while refusing a flat-floor interpretation', () => {
    const spawn = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'spawn-side-connected-terrain'
    );
    expect(spawn?.status).toBe('RESOLVED_FROM_VECTOR');
    expect(spawn?.safeToUseForBlockout).toBe(true);
    expect(spawn?.reason).toContain('multiple elevations/transitions');
  });

  it('keeps right-low, underpass and internal void partitioning out of blockout', () => {
    expect(unresolvedUndertowSourceTopologyLimits()).toEqual([
      'right-low-floor-partition',
      'glass-underpass-walkable-outline',
      'internal-void-kill-boundaries'
    ]);
  });

  it('records why the right-low area cannot be closed from PDF hard lines alone', () => {
    const rightLow = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'right-low-floor-partition'
    );
    expect(rightLow?.reason).toContain('same spawn-side and central connected source faces');
  });
});
