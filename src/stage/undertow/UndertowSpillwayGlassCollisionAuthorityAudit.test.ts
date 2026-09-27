import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT,
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
});
