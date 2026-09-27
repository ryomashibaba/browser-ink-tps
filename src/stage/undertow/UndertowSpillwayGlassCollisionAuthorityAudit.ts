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
  resolutionPass: '11A' as const,
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
  projectileSemanticEvidence: Object.freeze({
    officialHistoricalIntentSource:
      'Nintendo Splatoon 3 Update History / Ver.2.0.0 bug fix',
    officialHistoricalGlassFloorOppositeSideDamageWasBug: true,
    currentPostVer720GlassHighGroundStillPresent: true,
    currentVer11GrateEdgeAttackPathCorroborated: true,
    ordinaryCrossGlassDamageShouldBeBlocked: true,
    edgeGrateOrAroundGeometryCanStillPermitAttacks: true,
    currentExactProjectileFaceBindingResolved: false,
    allProjectileClassesResolved: false,
    runtimeProjectilePromotionAuthorized: false,
    evidenceDates: ['2022-11-30', '2024-08-29', '2026-04-27'] as const,
    notes:
      'Nintendo explicitly fixed opposite-side damage through Undertow glass as unintended behavior. Post-Ver.7.2/current sources continue to identify the central position as glass high ground, and a Ver.11 current-stage guide specifically uses the grate edge to pass explosion coverage. Together these resolve the high-level semantic that the glass body is not a generic through-shot surface while grate/edge geometry can remain attack-permissive. They do not identify the exact current collision primitive or resolve every projectile/explosion class.'
  }),
  playerStandabilitySemanticResolved: true,
  navigationStandabilitySemanticResolved: true,
  exactPlayerCollisionFaceBindingResolved: false,
  exactNavigationFaceBindingResolved: false,
  projectileOcclusionSemanticResolved: true,
  exactProjectileCollisionFaceBindingResolved: false,
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
    'Resolution Pass 11A keeps the Pass 9A standability/source-binding boundary and adds projectile-semantics evidence. Nintendo historical bug-fix authority establishes that opposite-side damage through Undertow glass was unintended, while post-Ver.7.2/current sources retain the glass high ground and identify the grate edge as an attack-permissive path. This resolves ordinary glass-vs-grate occlusion semantics at behavior level only. Exact Glass01/BridgeMetal/hidden-primitive projectile binding, camera-query authority, player collision binding, and navigation binding remain unresolved; no runtime blocker is promoted from semantics alone.'
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
      'Nintendo Ver.2.0.0 update history states that damaging a player from the opposite side of Undertow glass was a bug, establishing intended glass-side damage occlusion.',
      'Post-Ver.7.2/current strategy evidence continues to identify the central high ground as glass.',
      'A Ver.11 current-stage guide explicitly uses the high-ground grate edge to pass explosion coverage, separating an attack-permissive edge route from the glass body.',
      'KiTrix StageCollider performs SceneKit segment hit tests against the whole loaded stage visual tree, and BulletSimulator consumes that downstream query.'
    ],
    insufficientBecause: [
      'The official historical fix resolves intended glass-vs-opposite-side damage semantics but predates the Ver.7.2 terrain remodel and does not publish the collision primitive.',
      'Current grate-edge attack evidence distinguishes an edge route from the glass body but does not identify which exact Glass01/GlassEdge/BridgeMetal faces block each projectile or explosion class.',
      'KiTrix projectile raycasts are downstream simulator behavior and are not original-game collision authority.'
    ],
    minimumAuthoritativeEvidence: [
      'Current original-game projectile collision/query data that binds the upper-glass blocker to exact current faces/primitives.',
      'Or controlled post-Ver.7.2 shot/pass-through tests registered tightly enough to distinguish Glass01, GlassEdge, grate/fence, and BridgeMetal for the projectile classes browser-ink-tps simulates.'
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
    audit.resolutionPass !== '11A' ||
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
    !audit.projectileOcclusionSemanticResolved ||
    audit.exactProjectileCollisionFaceBindingResolved ||
    !audit.projectileSemanticEvidence.officialHistoricalGlassFloorOppositeSideDamageWasBug ||
    !audit.projectileSemanticEvidence.currentPostVer720GlassHighGroundStillPresent ||
    !audit.projectileSemanticEvidence.currentVer11GrateEdgeAttackPathCorroborated ||
    !audit.projectileSemanticEvidence.ordinaryCrossGlassDamageShouldBeBlocked ||
    !audit.projectileSemanticEvidence.edgeGrateOrAroundGeometryCanStillPermitAttacks ||
    audit.projectileSemanticEvidence.currentExactProjectileFaceBindingResolved ||
    audit.projectileSemanticEvidence.allProjectileClassesResolved ||
    audit.projectileSemanticEvidence.runtimeProjectilePromotionAuthorized ||
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
