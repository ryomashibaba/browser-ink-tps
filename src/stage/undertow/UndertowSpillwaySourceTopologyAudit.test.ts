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

  it('promotes right-low from Temple01 while keeping underpass and void unresolved', () => {
    expect(unresolvedUndertowSourceTopologyLimits()).toEqual([
      'glass-underpass-walkable-outline',
      'internal-void-kill-boundaries'
    ]);

    expect(
      UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
        (item) => item.id === 'right-low-floor-partition'
      )
    ).toMatchObject({
      status: 'RESOLVED_FROM_TEMPLE01_MODEL',
      safeToUseForBlockout: true
    });

    expect(
      UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
        (item) => item.id === 'glass-underpass-walkable-outline'
      )?.status
    ).toBe('PLAN_REGISTERED_POLYGON_UNRESOLVED');

    expect(
      UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
        (item) => item.id === 'internal-void-kill-boundaries'
      )?.status
    ).toBe('REQUIRES_3D_BINDING');
  });

  it('records why the right-low area cannot be closed from PDF hard lines alone', () => {
    const rightLow = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'right-low-floor-partition'
    );
    expect(rightLow?.reason).toContain('Temple01 OBJ');
    expect(rightLow?.reason).toContain('Y=7.5m walkable component');
  });
});
