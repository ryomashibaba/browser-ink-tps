import { describe, expect, it } from 'vitest';
import {
  UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT,
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES,
  undertowUpperGlassSourceMeshErrors,
  undertowUpperGlassVisualStageSolids
} from './UndertowSpillwayUpperGlassMeshGeometry';

describe('T21-D upper glass exact source meshes', () => {
  it('keeps the two exact current Temple01 Glass01 shells', () => {
    expect(undertowUpperGlassSourceMeshErrors()).toEqual([]);
    expect(UNDERTOW_UPPER_GLASS_SOURCE_MESHES).toHaveLength(2);
    for (const record of UNDERTOW_UPPER_GLASS_SOURCE_MESHES) {
      expect(record.mesh.vertices).toHaveLength(88);
      expect(record.mesh.indices).toHaveLength(306);
      expect(record.mesh.indices.length / 3).toBe(102);
      expect(record.projectYMinMeters).toBe(5);
      expect(record.projectYMaxMeters).toBe(7.5);
      expect(record.renderGeometryReady).toBe(true);
      expect(record.collisionAuthorityReady).toBe(false);
      expect(record.paintAuthority).toBe('UNINKABLE');
    }
  });

  it('exposes the exact glass shells as visual-only runtime solids', () => {
    const solids = undertowUpperGlassVisualStageSolids();
    expect(solids).toHaveLength(2);
    for (const solid of solids) {
      expect(solid.render).toBe(true);
      expect(solid.triangleMesh?.indices).toHaveLength(306);
      expect(solid.collisionEnabled).toBe(false);
      expect(solid.navigationEnabled).toBe(false);
      expect(solid.projectileBlocker).toBe(false);
      expect(solid.cameraBlocker).toBe(false);
    }
  });

  it('records exact model-space symmetry without falsely requiring project-origin symmetry', () => {
    expect(UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT).toMatchObject({
      runNumber: 663,
      facesPerSide: 102,
      verticesPerSide: 88,
      modelSpaceMirrorXorVertices: 0,
      modelSpaceMirrorMissingVertices: 0,
      modelSpaceMirrorExtraVertices: 0,
      collisionAuthorityReady: false,
      confidence: 'HIGH'
    });
    expect(
      UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.registeredSymmetryCenterProjectXZ[0]
    ).not.toBe(0);
  });
});
