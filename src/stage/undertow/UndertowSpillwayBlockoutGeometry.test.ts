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
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids).toHaveLength(21);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces).toHaveLength(5);
    const grates = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.filter(
      (solid) => solid.collisionBehavior === 'GRATE'
    );
    expect(grates).toHaveLength(2);
    expect(grates.every((solid) => solid.id.includes('grate-mesh'))).toBe(true);

    const slopes = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.filter(
      (solid) => solid.id.includes('center-slope-')
    );
    expect(slopes).toHaveLength(4);
    expect(slopes.every((solid) => solid.triangleMesh)).toBe(true);
    expect(slopes.every((solid) => !solid.footprint)).toBe(true);

    const routeRamps = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.filter(
      (solid) => solid.id.includes('right-low-route-ramp-')
    );
    expect(routeRamps).toHaveLength(2);
    expect(routeRamps.every((solid) => solid.triangleMesh)).toBe(true);
    expect(routeRamps.every((solid) => !solid.footprint)).toBe(true);
    expect(routeRamps.every((solid) => solid.projectileBlocker)).toBe(true);
    expect(routeRamps.every((solid) => solid.cameraBlocker)).toBe(true);

    const glassVisuals = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids.filter(
      (solid) => solid.id.includes('upper-glass-') && solid.id.endsWith(':visual')
    );
    expect(glassVisuals).toHaveLength(2);
    expect(glassVisuals.every((solid) => solid.render)).toBe(true);
    expect(glassVisuals.every((solid) => solid.collisionEnabled === false)).toBe(true);
    expect(glassVisuals.every((solid) => solid.navigationEnabled === false)).toBe(true);
    expect(glassVisuals.every((solid) => solid.projectileBlocker === false)).toBe(true);
    expect(glassVisuals.every((solid) => solid.cameraBlocker === false)).toBe(true);
  });

  it('includes only audited one-way drop navigation links', () => {
    const links = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.navigationLinks;
    expect(links).toHaveLength(26);
    expect(links.every((link) => link.bidirectional === false)).toBe(true);
    expect(links.every((link) => link.start[1] === 7.5)).toBe(true);
    expect(links.filter((link) => link.id.startsWith('first-drop-'))).toHaveLength(12);
    expect(
      links.filter((link) => link.id.startsWith('right-small-drop-'))
    ).toHaveLength(14);
    expect(
      links.filter((link) => link.id.startsWith('first-drop-'))
        .every((link) => link.end[1] === 3)
    ).toBe(true);
    expect(
      links.filter((link) => link.id.startsWith('right-small-drop-'))
        .every((link) => link.end[1] === 4.5)
    ).toBe(true);
  });

  it('keeps the audited top elevations while extruding only downward', () => {
    const expectedTopY = new Map<string, number>([
      ['center-low-', 0],
      ['right-low-', 4.5],
      ['glass-underpass-', 0],
      ['spawn-high-', 7.5],
      ['first-drop-landing-', 3],
      ['center-origin-step-top-face:', 1.5],
      ['negative-z-grate-mesh:', 7.4],
      ['positive-z-grate-mesh:', 7.4]
    ]);

    for (const solid of UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids) {
      if (solid.triangleMesh) continue;
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

  it('names source-authority blockers precisely after geometry audits', () => {
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toEqual(expect.arrayContaining([
      'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
      'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
      'WATER_VISUAL_Y_PENDING',
      'WATER_KILL_THRESHOLD_PENDING',
      'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING',
      'TURF_SCOREABLE_MASK_PENDING',
      'FULL_STAGE_CONNECTIVITY_QA_PENDING'
    ]));
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).not.toContain('UPPER_GLASS_SLOPE_RUNTIME_PENDING');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).not.toContain('WATER_KILL_RUNTIME_PENDING');
  });

  it('keeps unresolved or special geometry explicitly deferred', () => {
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds
    ).toEqual(expect.arrayContaining([
      'upper-glass-platform',
      'team-a-water-region',
      'team-b-water-region'
    ]));
  });
});
