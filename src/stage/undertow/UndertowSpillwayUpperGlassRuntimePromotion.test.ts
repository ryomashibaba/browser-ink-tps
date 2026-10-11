import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import { PerformanceStats } from '../../core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../../navigation/RecastStageNavigation';
import {
  RapierStagePhysics,
  initializeRapier
} from '../../physics/RapierStagePhysics';
import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { undertowT21dConnectivityQaStage } from './UndertowSpillwayConnectivityQa';
import {
  UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES
} from './UndertowSpillwayUpperGlassPhysicsQueryQa';
import {
  UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS
} from './UndertowSpillwayUpperGlassCharacterControllerQa';
import {
  UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D
} from './UndertowSpillwayUpperGlassReconstructionCandidate';
import {
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS,
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAVIGATION_SOLIDS,
  UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS,
  UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT,
  undertowUpperGlassPass15dCollisionSolidId,
  undertowUpperGlassPass15dRuntimeGeometryErrors
} from './UndertowSpillwayUpperGlassRuntimeGeometry';

beforeAll(async () => {
  await Promise.all([
    initializeRapier(),
    initializeRecastNavigation()
  ]);
});

function vec3([x, y, z]: readonly [number, number, number]): Vec3 {
  return new Vec3(x, y, z);
}

describe('T21 Pass 15D upper-glass inert runtime promotion', () => {
  it('keeps production frozen and retains the narrowed upper-glass blockers', () => {
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_COLLISION_AUTHORITY_PENDING');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers
    ).toContain('UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING');
    expect(
      UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT
        .productionStageActivationAuthorized
    ).toBe(false);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT
        .activationBlockersCleared
    ).toEqual([]);
  });

  it('promotes exactly the Pass 15C broad collision subset and the Pass 13A broad nav subset', () => {
    expect(
      UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_TRIANGLE_IDS
    ).toHaveLength(94);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15D_EXCLUDED_THIN_EDGE_FRAME_TRIANGLE_IDS
    ).toEqual([94, 95, 96, 97, 98, 99, 100, 101]);
    expect(
      UNDERTOW_UPPER_GLASS_PASS15D_BROAD_NAV_TRIANGLE_IDS
    ).toEqual(UNDERTOW_UPPER_GLASS_BROAD_NAV_TRIANGLE_IDS);

    expect(UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS).toHaveLength(2);
    expect(UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS).toHaveLength(2);
    for (let i = 0; i < 2; i += 1) {
      expect(
        UNDERTOW_UPPER_GLASS_PASS15D_BROAD_COLLISION_SOLIDS[i]!
          .triangleMesh?.indices
      ).toEqual(
        UNDERTOW_UPPER_GLASS_PASS15C_BROAD_COLLISION_SOLIDS[i]!
          .triangleMesh?.indices
      );
    }
  });

  it('keeps visual, collision/query and navigation as three separate runtime layers with no glass paint authority', () => {
    const solids = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.solids;
    const visuals = solids.filter(
      (solid) => solid.id.includes('upper-glass-') && solid.id.endsWith(':visual')
    );
    const collision = solids.filter(
      (solid) => solid.id.endsWith(':pass15d-broad-collision-query-runtime')
    );
    const navigation = solids.filter(
      (solid) => solid.id.endsWith(':pass15d-broad-navigation-runtime')
    );

    expect(visuals).toHaveLength(2);
    expect(collision).toHaveLength(2);
    expect(navigation).toHaveLength(2);

    expect(visuals.every(
      (solid) =>
        solid.render &&
        solid.collisionEnabled === false &&
        solid.navigationEnabled === false &&
        !solid.projectileBlocker &&
        !solid.cameraBlocker &&
        solid.triangleMesh?.indices.length === 102 * 3
    )).toBe(true);

    expect(collision.every(
      (solid) =>
        !solid.render &&
        solid.collisionEnabled === true &&
        solid.navigationEnabled === false &&
        solid.projectileBlocker &&
        solid.cameraBlocker &&
        solid.triangleMesh?.indices.length === 94 * 3
    )).toBe(true);

    expect(navigation.every(
      (solid) =>
        !solid.render &&
        solid.collisionEnabled === false &&
        solid.navigationEnabled === true &&
        !solid.projectileBlocker &&
        !solid.cameraBlocker &&
        solid.triangleMesh?.indices.length === 46 * 3
    )).toBe(true);

    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.paintSurfaces.some(
        (surface) => surface.id.includes('upper-glass-')
      )
    ).toBe(false);
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds
    ).toContain('upper-glass-thin-edge-frame-boundary');
    expect(
      UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.deferredFeatureIds
    ).not.toContain('upper-glass-platform');
  });

  it('runs all broad projectile/thrown-sub/camera probes against the actual inert T21 package', () => {
    const stage = undertowT21dConnectivityQaStage();
    const physics = new RapierStagePhysics(1 / 60, stage);
    physics.step();

    let hitCount = 0;
    for (const probe of UNDERTOW_UPPER_GLASS_PASS15B_PHYSICS_PROBES) {
      for (const purpose of ['ink-projectile', 'thrown-sub', 'camera'] as const) {
        const hit = physics.castStageSegment(
          vec3(probe.from),
          vec3(probe.to),
          purpose
        );
        expect(hit, `${probe.id} / ${purpose}`).not.toBeNull();
        expect(hit?.solidId).toBe(
          undertowUpperGlassPass15dCollisionSolidId(probe.side)
        );
        hitCount += 1;
      }
    }
    expect(hitCount).toBe(18);
  });

  it('runs both directly verified broad support routes on the actual inert T21 Recast package', () => {
    const stage = undertowT21dConnectivityQaStage();
    const stats = new PerformanceStats();
    const navigation = new RecastStageNavigation(stage, stats);
    expect(stats.cpuNavigationStatus).toBe('READY');

    for (const route of [
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.positiveZ,
      UNDERTOW_UPPER_GLASS_RECONSTRUCTION_SUPPORT_ROUTES_3D.negativeZ
    ]) {
      for (let i = 0; i + 1 < route.length; i += 1) {
        const from = route[i]!;
        const to = route[i + 1]!;
        const result = navigation.auditPath(vec3(from), vec3(to));
        expect(result.startSnapDistanceMeters).toBeLessThan(0.35);
        expect(result.endSnapDistanceMeters).toBeLessThan(0.35);
        expect(result.querySuccess).toBe(true);
        expect(result.reachedTarget).toBe(true);
      }
    }
  });

  it('passes the Pass 15D runtime-authority boundary audit', () => {
    expect(undertowUpperGlassPass15dRuntimeGeometryErrors()).toEqual([]);
    expect(UNDERTOW_UPPER_GLASS_PASS15D_RUNTIME_GEOMETRY_AUDIT).toMatchObject({
      resolutionPass: '15D',
      sourceShellTrianglesPerSide: 102,
      broadCollisionTrianglesPerSide: 94,
      broadNavigationTrianglesPerSide: 46,
      excludedThinEdgeFrameTrianglesPerSide: 8,
      visualLayerRemainsFullSourceShell: true,
      broadCollisionLayerPromotedToInertPackage: true,
      broadNavigationLayerPromotedToInertPackage: true,
      paintAuthorityPromoted: false,
      scoreAuthorityPromoted: false,
      thinEdgeFrameCollisionPromoted: false,
      thinEdgeFrameNavigationPromoted: false,
      wholeGlass01CollisionPromoted: false,
      originalGamePrimitiveIdentityResolved: false,
      originalGamePrimitiveIdentityClaimed: false,
      productionStageActivationAuthorized: false,
      userActionRequiredNow: false
    });
  });
});
