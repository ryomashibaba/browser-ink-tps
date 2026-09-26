import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN,
  undertowDerivedRuntimeSurfacePlanItem,
  undertowRuntimeSurfacePlanErrors,
  undertowRuntimeSurfacePlanItem
} from './UndertowSpillwayRuntimeBlockoutPlan';

describe('T21-D runtime blockout surface plan', () => {
  it('keeps the construction plan internally consistent', () => {
    expect(undertowRuntimeSurfacePlanErrors()).toEqual([]);
  });

  it('promotes only flat polygon surfaces with BLOCKOUT-safe XZ and Y', () => {
    expect(undertowRuntimeSurfacePlanItem('center-lower-floor')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      geometryReady: true,
      legacySolidCollisionCompatible: true,
      collisionMode: 'SOLID_FLOOR',
      paintAuthority: 'PAINTABLE',
      yMeters: 0,
      polygonCount: 2
    });
    expect(undertowRuntimeSurfacePlanItem('right-low-floor')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      geometryReady: true,
      legacySolidCollisionCompatible: true,
      collisionMode: 'SOLID_FLOOR',
      paintAuthority: 'PAINTABLE',
      yMeters: 4.5,
      polygonCount: 2
    });
  });

  it('keeps geometry and paint authority separate for the underpass', () => {
    expect(undertowRuntimeSurfacePlanItem('upper-glass-underpass')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      geometryReady: true,
      legacySolidCollisionCompatible: true,
      collisionMode: 'SOLID_FLOOR',
      paintAuthority: 'UNKNOWN',
      yMeters: 0,
      polygonCount: 2
    });
  });

  it('keeps grate geometry ready while rejecting the legacy all-purpose solid collider', () => {
    expect(undertowRuntimeSurfacePlanItem('negative-z-grate-mesh')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      geometryReady: true,
      legacySolidCollisionCompatible: false,
      collisionMode: 'GRATE_SPECIAL_REQUIRED',
      paintAuthority: 'UNINKABLE',
      yMeters: 7.4,
      polygonCount: 1
    });
  });

  it('admits only locally anchored spawn subregions as derived collision geometry', () => {
    expect(UNDERTOW_DERIVED_RUNTIME_SURFACE_PLAN).toHaveLength(4);
    expect(undertowDerivedRuntimeSurfacePlanItem('spawn-high-positive-z')).toMatchObject({
      source: 'TEMPLE01_LOCAL_COMPONENT',
      geometryReady: true,
      legacySolidCollisionCompatible: true,
      collisionMode: 'SOLID_FLOOR',
      paintAuthority: 'UNKNOWN',
      yMeters: 7.5,
      polygonCount: 1,
      holeCount: 2
    });
    expect(undertowDerivedRuntimeSurfacePlanItem('spawn-high-negative-z')).toMatchObject({
      yMeters: 7.5,
      holeCount: 2
    });
    expect(
      undertowDerivedRuntimeSurfacePlanItem('first-drop-landing-positive-z')
    ).toMatchObject({
      geometryReady: true,
      legacySolidCollisionCompatible: true,
      collisionMode: 'SOLID_FLOOR',
      paintAuthority: 'UNKNOWN',
      yMeters: 3,
      polygonCount: 1,
      holeCount: 0
    });
    expect(
      undertowDerivedRuntimeSurfacePlanItem('first-drop-landing-negative-z')
    ).toMatchObject({
      yMeters: 3,
      holeCount: 0
    });
  });

  it('refuses to flatten point-only spawn nodes or multi-elevation spawn envelopes', () => {
    expect(undertowRuntimeSurfacePlanItem('team-a-spawn-floor')).toMatchObject({
      disposition: 'XZ_NOT_AREA',
      geometryReady: false
    });
    expect(undertowRuntimeSurfacePlanItem('team-a-spawn-terrain-region')).toMatchObject({
      disposition: 'Y_UNRESOLVED',
      geometryReady: false
    });
    expect(undertowRuntimeSurfacePlanItem('team-b-spawn-terrain-region')).toMatchObject({
      disposition: 'Y_UNRESOLVED',
      geometryReady: false
    });
  });
});
