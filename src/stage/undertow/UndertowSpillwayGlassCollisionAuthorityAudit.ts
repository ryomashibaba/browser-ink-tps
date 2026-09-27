export const UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT = Object.freeze({
  sourceRepository: 'kirakira-dev/KiTrix',
  sourceCommit: '0611f51b35c9736ee986fb2218461e2585b7875e',
  temple01DirectoryEntries: [
    'Vss_Temple01.mtl',
    'Vss_Temple01.obj',
    'Vss_Temple01_parts',
    'textures'
  ] as const,
  separateCollisionAssetPresentInPublishedTemple01Directory: false,
  bridgeMetalSourceObject:
    'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00',
  bridgeMetalFacesPerSide: 1083,
  bridgeMetalVerticesPerSide: 709,
  bridgeMetalProjectYMinMeters: 4.2,
  bridgeMetalProjectYMaxMeters: 10.5,
  bridgeMetalHorizontalLikeFacesPerSide: 335,
  bridgeMetalWallLikeFacesPerSide: 748,
  bridgeMetalModelSpaceMirrorXorVertices: 0,
  glassVisualShellCollisionAuthorityReady: false,
  bridgeMetalCollisionAuthorityReady: false,
  cameraQueryAuthorityReady: false,
  confidence: 'HIGH' as const,
  notes:
    'CI #667 shows the central BridgeMetal source is a large mixed floor/wall/support visual mesh, not a uniquely identified gameplay collision shell. The published KiTrix Temple01 directory exposes OBJ/MTL/parts/textures but no separate collision asset. Therefore neither Glass01 nor BridgeMetal may be promoted to player/projectile/camera collision authority from naming or visual geometry alone.'
});

export function undertowUpperGlassCollisionAuthorityAuditErrors():
  readonly string[] {
  const audit = UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT;
  const errors: string[] = [];
  if (
    audit.bridgeMetalHorizontalLikeFacesPerSide +
      audit.bridgeMetalWallLikeFacesPerSide !==
    audit.bridgeMetalFacesPerSide
  ) {
    errors.push('BridgeMetal face classification no longer accounts for every audited face');
  }
  if (audit.bridgeMetalModelSpaceMirrorXorVertices !== 0) {
    errors.push('BridgeMetal counterpart source mesh lost exact model-space symmetry');
  }
  if (audit.separateCollisionAssetPresentInPublishedTemple01Directory) {
    errors.push('published Temple01 source inventory unexpectedly claims a collision asset');
  }
  if (
    audit.glassVisualShellCollisionAuthorityReady ||
    audit.bridgeMetalCollisionAuthorityReady ||
    audit.cameraQueryAuthorityReady
  ) {
    errors.push('upper-glass collision/camera authority must remain unresolved');
  }
  return errors;
}
