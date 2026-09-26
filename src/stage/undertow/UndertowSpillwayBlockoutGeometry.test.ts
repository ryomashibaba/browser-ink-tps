import { describe, expect, it } from 'vitest';
import { SurfaceFlags } from '../../ink/types';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import {
  UNDERTOW_BLOCKOUT_FOOTPRINT_CELL_METERS,
  UNDERTOW_BLOCKOUT_TECHNICAL_SLAB_THICKNESS_METERS,
  UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY,
  undertowPartialBlockoutGeometryErrors
} from './UndertowSpillwayBlockoutGeometry';

describe('T21-D partial Undertow blockout geometry', () => {
  it('remains inert and leaves the frozen T20 production stage selected', () => {
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.length
    ).toBeGreaterThan(0);
  });

  it('contains only the currently safe flat components', () => {
    expect(undertowPartialBlockoutGeometryErrors()).toEqual([]);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids).toHaveLength(11);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces).toHaveLength(5);
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.some(
        (solid) => solid.collisionBehavior === 'GRATE'
      )
    ).toBe(false);
  });

  it('keeps the audited top elevations while extruding only downward', () => {
    const expectedTopY = new Map<string, number>([
      ['center-low-', 0],
      ['right-low-', 4.5],
      ['glass-underpass-', 0],
      ['spawn-high-', 7.5],
      ['first-drop-landing-', 3],
      ['center-origin-step-top-face:', 1.5]
    ]);

    for (const solid of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids) {
      const sourceId = solid.id.replace('UndertowT21D:', '');
      const entry = [...expectedTopY.entries()].find(([prefix]) =>
        sourceId.startsWith(prefix)
      );
      expect(entry, sourceId).toBeDefined();
      const topY = solid.center[1] + solid.size[1] * 0.5;
      expect(topY).toBeCloseTo(entry![1], 8);
      expect(solid.size[1]).toBe(
        UNDERTOW_BLOCKOUT_TECHNICAL_SLAB_THICKNESS_METERS
      );
      expect(solid.footprint?.cellSizeMeters).toBe(
        UNDERTOW_BLOCKOUT_FOOTPRINT_CELL_METERS
      );
    }
  });

  it('creates paint authority only for confirmed PAINTABLE flat floors without inventing Turf scoreability', () => {
    const backingIds = new Set(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.map((solid) => solid.id)
    );
    for (const surface of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces) {
      expect(backingIds.has(surface.backingSolidId)).toBe(true);
      expect((surface.flags & SurfaceFlags.Paintable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Swimmable) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Floor) !== 0).toBe(true);
      expect((surface.flags & SurfaceFlags.Scoreable) !== 0).toBe(false);
    }

    const paintIds = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.map(
      (surface) => surface.id
    );
    expect(paintIds.filter((id) => id.includes('center-low-'))).toHaveLength(2);
    expect(paintIds.filter((id) => id.includes('right-low-'))).toHaveLength(2);
    expect(paintIds.filter((id) => id.includes('center-origin-step-top-face'))).toHaveLength(1);
    expect(paintIds.some((id) => id.includes('glass-underpass-'))).toBe(false);
    expect(paintIds.some((id) => id.includes('spawn-high-'))).toBe(false);
    expect(paintIds.some((id) => id.includes('first-drop-landing-'))).toBe(false);
  });

  it('keeps unresolved or special geometry explicitly deferred', () => {
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds
    ).toEqual(expect.arrayContaining([
      'negative-z-grate-mesh',
      'positive-z-grate-mesh',
      'center-slope',
      'upper-glass-platform',
      'team-a-water-region',
      'team-b-water-region'
    ]));
  });
});
