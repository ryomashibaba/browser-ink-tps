export type UndertowUpperGlassAuthorityRole =
  | 'PLAYER_COLLISION'
  | 'PROJECTILE_COLLISION'
  | 'CAMERA_QUERY'
  | 'NAVIGATION';

export interface UndertowUpperGlassRoleAuthorityAudit {
  role: UndertowUpperGlassAuthorityRole;
  authorityReady: false;
  activationBlocker:
    | 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
    | 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING';
  observedEvidence: readonly string[];
  insufficientBecause: readonly string[];
  minimumAuthoritativeEvidence: readonly string[];
}

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
  kitrixStageColliderPath: 'KiTrix/SceneKit/StageCollider.swift',
  kitrixBulletSimulatorPath: 'KiTrix/SceneKit/BulletSimulator.swift',
  kitrixStageColliderQueriesWholeStageVisualTree: true,
  kitrixBulletSimulatorUsesStageColliderForProjectileHits: true,
  kitrixPublicStageColliderUseSites: [
    'KiTrix/SceneKit/BulletSimulator.swift'
  ] as const,
  kitrixStageColliderGameplayAuthorityReady: false,
  glassVisualShellCollisionAuthorityReady: false,
  bridgeMetalCollisionAuthorityReady: false,
  cameraQueryAuthorityReady: false,
  confidence: 'HIGH' as const,
  notes:
    'CI #667 shows the central BridgeMetal source is a large mixed floor/wall/support visual mesh, not a uniquely identified gameplay collision shell. The published KiTrix Temple01 directory exposes OBJ/MTL/parts/textures but no separate collision asset. At the audited KiTrix commit, StageCollider raycasts the whole loaded stage visual tree and BulletSimulator uses that helper for its own projectile hits. That is downstream KiTrix simulator behavior, not original Undertow player/projectile/camera collision authority. Therefore neither Glass01 nor BridgeMetal may be promoted from naming, visual geometry, or KiTrix query behavior alone.'
});

export const UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT:
  readonly UndertowUpperGlassRoleAuthorityAudit[] = [
  {
    role: 'PLAYER_COLLISION',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact current Temple01 Glass01 visual shell is available and registered.',
      'BridgeMetal is symmetric but mixes horizontal floor-like faces with wall/support faces.',
      'No separate collision asset exists in the published Temple01 directory at the audited KiTrix commit.'
    ],
    insufficientBecause: [
      'Visual shell membership and material/object names do not identify which faces block player capsules.',
      'BridgeMetal cannot be promoted wholesale without inventing collision on decorative/support faces.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game collision/query data that identifies the player-blocking faces or collision primitives.',
      'Or controlled in-game collision-boundary evidence registered to the source mesh strongly enough to separate Glass01/BridgeMetal subcomponents.'
    ]
  },
  {
    role: 'PROJECTILE_COLLISION',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    observedEvidence: [
      'KiTrix StageCollider performs SceneKit segment hit tests against the whole loaded stage visual tree.',
      'KiTrix BulletSimulator uses StageCollider for its own projectile hit/splat simulation.'
    ],
    insufficientBecause: [
      'KiTrix projectile raycasts are downstream simulator behavior and are not evidence of original Undertow projectile collision rules.',
      'The stage-wide query does not isolate whether Glass01, GlassEdge, WallFence, or BridgeMetal should block each projectile class in browser-ink-tps.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game projectile collision metadata/query data for the upper-glass structure.',
      'Or controlled in-game shot/pass-through evidence that resolves projectile behavior per registered subcomponent.'
    ]
  },
  {
    role: 'CAMERA_QUERY',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact Glass01 visual shell is known.',
      'The audited public KiTrix StageCollider use site is BulletSimulator; no camera-query authority is exposed by the Temple01 asset inventory.'
    ],
    insufficientBecause: [
      'Render geometry does not establish camera push-in, occlusion, shoulder-camera, or line-of-sight query semantics.',
      'Projectile raycast behavior cannot be reused as camera-query authority.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game camera collision/query metadata for the structure.',
      'Or controlled camera-boundary capture around the registered glass/metal structure that resolves which faces affect camera queries.'
    ]
  },
  {
    role: 'NAVIGATION',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact Glass01 mesh is currently exposed as render-only runtime geometry.',
      'No source record identifies the visual shell as a walkable surface or as navigation collision.'
    ],
    insufficientBecause: [
      'Navigation must follow proven walkability/player collision rather than visual mesh presence.',
      'Promoting the shell into Recast from geometry alone could create fictional walkable ledges or blockers.'
    ],
    minimumAuthoritativeEvidence: [
      'Authoritative walkability/player-collision data for the upper structure.',
      'Or controlled traversal/standability evidence registered to the exact source components.'
    ]
  }
] as const;

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
  if (!audit.kitrixStageColliderQueriesWholeStageVisualTree) {
    errors.push('KiTrix StageCollider whole-stage visual query evidence drifted');
  }
  if (!audit.kitrixBulletSimulatorUsesStageColliderForProjectileHits) {
    errors.push('KiTrix BulletSimulator StageCollider evidence drifted');
  }
  if (audit.kitrixStageColliderGameplayAuthorityReady) {
    errors.push('downstream KiTrix StageCollider behavior must not become original gameplay authority');
  }
  if (
    audit.glassVisualShellCollisionAuthorityReady ||
    audit.bridgeMetalCollisionAuthorityReady ||
    audit.cameraQueryAuthorityReady
  ) {
    errors.push('upper-glass collision/camera authority must remain unresolved');
  }

  const expectedRoles: readonly UndertowUpperGlassAuthorityRole[] = [
    'PLAYER_COLLISION',
    'PROJECTILE_COLLISION',
    'CAMERA_QUERY',
    'NAVIGATION'
  ];
  const roles = new Set(UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT.map((entry) => entry.role));
  if (
    roles.size !== expectedRoles.length ||
    expectedRoles.some((role) => !roles.has(role))
  ) {
    errors.push('upper-glass authority audit must cover player/projectile/camera/navigation exactly once');
  }
  for (const entry of UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT) {
    if (entry.authorityReady) {
      errors.push(`${entry.role}: unresolved upper-glass role must not become authority-ready`);
    }
    if (
      entry.observedEvidence.length === 0 ||
      entry.insufficientBecause.length === 0 ||
      entry.minimumAuthoritativeEvidence.length === 0
    ) {
      errors.push(`${entry.role}: evidence gap localization is incomplete`);
    }
    if (
      entry.role === 'CAMERA_QUERY' &&
      entry.activationBlocker !== 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING'
    ) {
      errors.push('CAMERA_QUERY must remain tied to the camera-query activation blocker');
    }
    if (
      entry.role !== 'CAMERA_QUERY' &&
      entry.activationBlocker !== 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING'
    ) {
      errors.push(`${entry.role}: must remain tied to the collision-authority activation blocker`);
    }
  }
  return errors;
}
