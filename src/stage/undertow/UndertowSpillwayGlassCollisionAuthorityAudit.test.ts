import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT,
  UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT,
  undertowUpperGlassCollisionAuthorityAuditErrors
} from './UndertowSpillwayGlassCollisionAuthorityAudit';

describe('T21-D upper glass collision authority audit', () => {
  it('freezes the symmetric but mixed BridgeMetal source result', () => {
    expect(undertowUpperGlassCollisionAuthorityAuditErrors()).toEqual([]);
    expect(UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT).toMatchObject({
      bridgeMetalFacesPerSide: 1083,
      bridgeMetalVerticesPerSide: 709,
      bridgeMetalHorizontalLikeFacesPerSide: 335,
      bridgeMetalWallLikeFacesPerSide: 748,
      bridgeMetalModelSpaceMirrorXorVertices: 0,
      glassVisualShellCollisionAuthorityReady: false,
      bridgeMetalCollisionAuthorityReady: false,
      cameraQueryAuthorityReady: false,
      confidence: 'HIGH'
    });
  });

  it('records that the published Temple01 directory has no separate collision asset', () => {
    expect(
      UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.temple01DirectoryEntries
    ).toEqual([
      'Vss_Temple01.mtl',
      'Vss_Temple01.obj',
      'Vss_Temple01_parts',
      'textures'
    ]);
    expect(
      UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
        .separateCollisionAssetPresentInPublishedTemple01Directory
    ).toBe(false);
  });

  it('keeps KiTrix whole-stage projectile raycasts as downstream evidence only', () => {
    expect(UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT).toMatchObject({
      kitrixStageColliderPath: 'KiTrix/SceneKit/StageCollider.swift',
      kitrixBulletSimulatorPath: 'KiTrix/SceneKit/BulletSimulator.swift',
      kitrixStageColliderQueriesWholeStageVisualTree: true,
      kitrixBulletSimulatorUsesStageColliderForProjectileHits: true,
      kitrixStageColliderGameplayAuthorityReady: false
    });
    expect(
      UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT
        .kitrixPublicStageColliderUseSites
    ).toEqual(['KiTrix/SceneKit/BulletSimulator.swift']);
  });

  it('localizes authority gaps independently for all four runtime roles', () => {
    expect(UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT.map((entry) => entry.role))
      .toEqual([
        'PLAYER_COLLISION',
        'PROJECTILE_COLLISION',
        'CAMERA_QUERY',
        'NAVIGATION'
      ]);
    for (const entry of UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT) {
      expect(entry.authorityReady).toBe(false);
      expect(entry.observedEvidence.length).toBeGreaterThan(0);
      expect(entry.insufficientBecause.length).toBeGreaterThan(0);
      expect(entry.minimumAuthoritativeEvidence.length).toBeGreaterThan(0);
    }
    expect(
      UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT.find(
        (entry) => entry.role === 'CAMERA_QUERY'
      )?.activationBlocker
    ).toBe('UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING');
    expect(
      UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT
        .filter((entry) => entry.role !== 'CAMERA_QUERY')
        .every(
          (entry) =>
            entry.activationBlocker === 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
        )
    ).toBe(true);
  });
});
