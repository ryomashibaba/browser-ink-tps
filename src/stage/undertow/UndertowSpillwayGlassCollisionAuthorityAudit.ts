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
  resolutionPass: 9,
  bridgeMetalConnectedComponentsPerSide: 392,
  bridgeMetalComponentSignatureMirrorXor: 0,
  bridgeMetalUniqueStandableComponentResolved: false,
  currentGameplayEvidence: Object.freeze({
    targetIsPostVer720: true,
    glassHighGroundStandabilityConfirmed: true,
    glassHighGroundUsedForPositioningConfirmed: true,
    exactGlass01VsBridgeMetalFaceBindingResolved: false,
    evidenceDates: ['2024-08-29', '2025-09-11', '2026-06-02'] as const,
    notes:
      'Post-Ver.7.2/current strategy sources consistently describe players taking, holding, and dropping from the glass high ground. This establishes a standable/traversable upper structure semantically, but those sources do not identify whether the original-game collision comes from Glass01, BridgeMetal, another collision asset, or a hidden primitive.'
  }),
  playerStandabilitySemanticResolved: true,
  navigationStandabilitySemanticResolved: true,
  exactPlayerCollisionFaceBindingResolved: false,
  exactNavigationFaceBindingResolved: false,
  projectileBehaviorResolved: false,
  cameraQueryBehaviorResolved: false,
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
    'Resolution Pass 9A adds two independent facts without overpromoting them. Current post-Ver.7.2 gameplay evidence confirms that the glass high ground is a standable/traversable position, while CI #728 decomposes the symmetric BridgeMetal visual source into 392 connected components per side with exact mirrored component signatures. Because that decomposition still does not uniquely bind the standable gameplay surface to Glass01 or a BridgeMetal face subset, no player/projectile/camera/nav runtime authority is promoted. The published KiTrix Temple01 directory still exposes no separate collision asset, and downstream KiTrix StageCollider behavior remains non-authoritative for original-game semantics.'
});

export const UNDERTOW_UPPER_GLASS_ROLE_AUTHORITY_AUDIT:
  readonly UndertowUpperGlassRoleAuthorityAudit[] = [
  {
    role: 'PLAYER_COLLISION',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact current Temple01 Glass01 visual shell is available and registered.',
      'Post-Ver.7.2 gameplay/strategy evidence confirms that players can occupy, hold, and drop from the glass high ground.',
      'BridgeMetal is exactly symmetric but decomposes into 392 connected visual components per side rather than one collision shell.',
      'No separate collision asset exists in the published Temple01 directory at the audited KiTrix commit.'
    ],
    insufficientBecause: [
      'Standability resolves the gameplay semantic but not the exact source face or hidden collision primitive responsible for it.',
      'Visual shell membership and material/object names do not identify which faces block player capsules.',
      'BridgeMetal cannot be promoted wholesale or by an arbitrary visual subset without inventing collision.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game collision/query data that identifies the player-blocking faces or collision primitives.',
      'Or controlled in-game collision-boundary evidence registered tightly enough to distinguish Glass01 from the many BridgeMetal subcomponents.'
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
      'Current post-Ver.7.2 gameplay evidence confirms traversal/occupancy of the glass high ground.',
      'The exact source face or primitive carrying that standability is still unresolved.'
    ],
    insufficientBecause: [
      'Navigation may follow proven standability only after the supporting collision surface is bound to exact geometry.',
      'Promoting Glass01 or one of 392 BridgeMetal components from visual proximity alone could create fictional walkable ledges or blockers.'
    ],
    minimumAuthoritativeEvidence: [
      'Authoritative walkability/player-collision data that binds the upper structure to exact source geometry.',
      'Or controlled traversal/contact evidence registered tightly enough to identify the standable source face subset.'
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
  if (
    audit.bridgeMetalConnectedComponentsPerSide !== 392 ||
    audit.bridgeMetalComponentSignatureMirrorXor !== 0 ||
    audit.bridgeMetalUniqueStandableComponentResolved
  ) {
    errors.push('Pass 9A BridgeMetal component decomposition drifted or overclaimed a unique standable source component');
  }
  if (
    !audit.currentGameplayEvidence.targetIsPostVer720 ||
    !audit.currentGameplayEvidence.glassHighGroundStandabilityConfirmed ||
    !audit.currentGameplayEvidence.glassHighGroundUsedForPositioningConfirmed ||
    audit.currentGameplayEvidence.exactGlass01VsBridgeMetalFaceBindingResolved ||
    !audit.playerStandabilitySemanticResolved ||
    !audit.navigationStandabilitySemanticResolved ||
    audit.exactPlayerCollisionFaceBindingResolved ||
    audit.exactNavigationFaceBindingResolved ||
    audit.projectileBehaviorResolved ||
    audit.cameraQueryBehaviorResolved
  ) {
    errors.push('Pass 9A gameplay semantics/source-face authority boundary drifted');
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
