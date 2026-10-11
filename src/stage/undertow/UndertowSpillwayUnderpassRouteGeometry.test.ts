import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT,
  UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
  undertowUnderpassRouteErrors,
  undertowUnderpassRouteStageSolids
} from './UndertowSpillwayUnderpassRouteGeometry';

describe('Undertow Spillway underpass route source geometry', () => {
  it('keeps the exact source-route batch internally valid', () => {
    expect(undertowUnderpassRouteErrors()).toEqual([]);
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENTS).toHaveLength(10);
    expect(undertowUnderpassRouteStageSolids()).toHaveLength(10);
  });

  it('keeps this as source geometry rather than invented off-mesh traversal', () => {
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.newComponentsPerSide).toBe(5);
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.newTrianglesPerSide).toBe(21);
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.strictSourceSurfaceReachable)
      .toBe(false);
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.offMeshLinkAuthorized)
      .toBe(false);
    expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.runtimePromotionAuthorized)
      .toBe(false);
    expect(
      UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeInclusionReachedTarget
    ).toBe(false);
    expect(
      UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT.experimentalRuntimeEndpointErrorMeters
    ).toBeCloseTo(31.71622721122581, 9);
  });

  it('preserves the audited project-Y route bands', () => {
    const ys = UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.flatMap((record) =>
      record.mesh.vertices.map((vertex) => vertex[1])
    );
    expect(Math.min(...ys)).toBeCloseTo(0, 6);
    expect(Math.max(...ys)).toBeCloseTo(2.93, 6);
    expect(ys.some((y) => Math.abs(y - 0.17) <= 0.000001)).toBe(true);
    expect(ys.some((y) => Math.abs(y - 1.5) <= 0.000001)).toBe(true);
  });
});
