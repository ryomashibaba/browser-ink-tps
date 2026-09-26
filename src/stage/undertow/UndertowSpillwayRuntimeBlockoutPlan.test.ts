import { describe, expect, it } from 'vitest';
import {
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
      collisionReady: true,
      paintAuthority: 'PAINTABLE',
      yMeters: 0,
      polygonCount: 2
    });
    expect(undertowRuntimeSurfacePlanItem('right-low-floor')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      collisionReady: true,
      paintAuthority: 'PAINTABLE',
      yMeters: 4.5,
      polygonCount: 2
    });
  });

  it('keeps geometry and paint authority separate for the underpass', () => {
    expect(undertowRuntimeSurfacePlanItem('upper-glass-underpass')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      collisionReady: true,
      paintAuthority: 'UNKNOWN',
      yMeters: 0,
      polygonCount: 2
    });
  });

  it('keeps known uninkable grate geometry collision-ready without making it paintable', () => {
    expect(undertowRuntimeSurfacePlanItem('negative-z-grate-mesh')).toMatchObject({
      disposition: 'FLAT_POLYGON_READY',
      collisionReady: true,
      paintAuthority: 'UNINKABLE',
      yMeters: 7.4,
      polygonCount: 1
    });
  });

  it('refuses to flatten point-only spawn nodes or multi-elevation spawn envelopes', () => {
    expect(undertowRuntimeSurfacePlanItem('team-a-spawn-floor')).toMatchObject({
      disposition: 'XZ_NOT_AREA',
      collisionReady: false
    });
    expect(undertowRuntimeSurfacePlanItem('team-a-spawn-terrain-region')).toMatchObject({
      disposition: 'Y_UNRESOLVED',
      collisionReady: false
    });
    expect(undertowRuntimeSurfacePlanItem('team-b-spawn-terrain-region')).toMatchObject({
      disposition: 'Y_UNRESOLVED',
      collisionReady: false
    });
  });
});
