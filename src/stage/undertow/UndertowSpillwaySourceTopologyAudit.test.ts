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

  it('promotes right-low and underpass from Temple01 while keeping only void unresolved', () => {
    expect(unresolvedUndertowSourceTopologyLimits()).toEqual([
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
      )
    ).toMatchObject({
      status: 'RESOLVED_FROM_TEMPLE01_MODEL',
      safeToUseForBlockout: true
    });

    expect(
      UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
        (item) => item.id === 'internal-void-kill-boundaries'
      )?.status
    ).toBe('REQUIRES_3D_BINDING');
  });

  it('records the model-derived underpass obstacle subtraction and exact mask symmetry', () => {
    const underpass = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'glass-underpass-walkable-outline'
    );
    expect(underpass?.reason).toContain('Pillar/Wall exclusions');
    expect(underpass?.reason).toContain('3863-cell');
    expect(underpass?.reason).toContain('mirror XOR 0 cells');
  });

  it('records why the right-low area cannot be closed from PDF hard lines alone', () => {
    const rightLow = UNDERTOW_SOURCE_TOPOLOGY_LIMITS.find(
      (item) => item.id === 'right-low-floor-partition'
    );
    expect(rightLow?.reason).toContain('Temple01 OBJ');
    expect(rightLow?.reason).toContain('Y=7.5m walkable component');
  });
});
