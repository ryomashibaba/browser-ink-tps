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
    evidenceDates: ['2024-08-29', '2025-09-11', '2026-06-02', '2026-09-27'] as const,
    controlledSupportBroadComponentsPerSide: 3,
    controlledSupportSeamCrossingsPerSide: 2,
    controlledSupportMirroredSidesIndependentlyCaptured: true,
    controlledSupportNoJumpAssistedCrossingObserved: true,
    controlledSupportThinEdgeStripResolved: false,
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
    currentOrdinaryMainProjectileBehaviorResolved: true,
    currentOrdinaryMainProjectilePassesThroughGlass: false,
    userDirectGameplayKnowledgeAccepted: true,
    allProjectileClassesResolved: false,
    runtimeProjectilePromotionAuthorized: false,
    evidenceDates: ['2022-11-30', '2024-08-29', '2026-04-27', '2026-09-28'] as const,
    notes:
      'Nintendo explicitly fixed opposite-side damage through Undertow glass as unintended behavior. Post-Ver.7.2/current sources continue to identify the central position as glass high ground, and a Ver.11 current-stage guide specifically uses the grate edge to pass explosion coverage. Together these resolve the high-level semantic that the glass body is not a generic through-shot surface while grate/edge geometry can remain attack-permissive. They do not identify the exact current collision primitive or resolve every projectile/explosion class.'
  }),
  playerStandabilitySemanticResolved: true,
  navigationStandabilitySemanticResolved: true,
  controlledBroadPlayerSupportGeometryResolved: true,
  controlledBroadNavigationWalkabilityEvidenceResolved: true,
  controlledBroadComponentCountPerSide: 3,
  controlledThinEdgeStripPlayerSupportResolved: false,
  runtimePlayerSupportPromotionAuthorized: false,
  runtimeNavigationPromotionAuthorized: false,
  exactPlayerCollisionFaceBindingResolved: false,
  exactNavigationFaceBindingResolved: false,
  projectileOcclusionSemanticResolved: true,
  exactProjectileCollisionFaceBindingResolved: false,
  projectileBehaviorResolved: false,
  cameraQueryBehaviorResolved: true,
  cameraTransparentGlassBlocksThirdPersonCamera: true,
  cameraUserDirectGameplayKnowledgeAccepted: true,
  exactCameraCollisionPrimitiveResolved: false,
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
    'Resolution Pass 13A adds two user-controlled mirrored-side support routes. The three broad registered upward Glass01 probe components per side are now gameplay-confirmed as player-supporting across both visual seams, but the narrow edge strip and the identity of the original collision primitive remain unresolved. This controlled support evidence is not reused as projectile or camera authority, and no runtime collision/navigation promotion occurs yet.'
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
      'No separate collision asset exists in the published Temple01 directory at the audited KiTrix commit.',
      'Pass 13A supplies two independent mirrored-side continuous routes across the three broad registered Glass01 upward components without a visible support loss at either seam.'
    ],
    insufficientBecause: [
      'Standability resolves the gameplay semantic but not the exact source face or hidden collision primitive responsible for it.',
      'Visual shell membership and material/object names do not identify which faces block player capsules.',
      'BridgeMetal cannot be promoted wholesale or by an arbitrary visual subset without inventing collision.',
      'The narrow upward edge strip was not independently probed, and the controlled route cannot prove whether the original game uses the visible Glass01 triangles or a coincident hidden collision primitive.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game collision/query data that identifies the player-blocking faces or collision primitives.',
      'Pass 13A resolves the broad support geometry needed for continued testing; full-role closure still requires the remaining edge/primitive ambiguity to be bounded before runtime collision promotion.'
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
      'KiTrix StageCollider performs SceneKit segment hit tests against the whole loaded stage visual tree, and BulletSimulator consumes that downstream query.',
      'On 2026-09-28 the user states from direct current-gameplay knowledge that ordinary shots do not pass through Undertow glass at all.'
    ],
    insufficientBecause: [
      'The official historical fix resolves intended glass-vs-opposite-side damage semantics but predates the Ver.7.2 terrain remodel and does not publish the collision primitive.',
      'Current grate-edge attack evidence distinguishes an edge route from the glass body but does not identify which exact Glass01/GlassEdge/BridgeMetal faces block each projectile or explosion class.',
      'KiTrix projectile raycasts are downstream simulator behavior and are not original-game collision authority.',
      'The user knowledge resolves ordinary-main pass-through behavior but not thrown-sub/explosion edge cases or the exact original collision primitive.'
    ],
    minimumAuthoritativeEvidence: [
      'Current original-game projectile collision/query data that binds the upper-glass blocker to exact current faces/primitives.',
      'Ordinary-main behavior is resolved by direct user gameplay knowledge. Remaining closure requires only any additional projectile classes browser-ink-tps actually simulates plus exact runtime-geometry binding; no redundant ordinary-shot capture is needed.'
    ]
  },
  {
    role: 'CAMERA_QUERY',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact Glass01 visual shell is known.',
      'The audited public KiTrix StageCollider use site is BulletSimulator; no camera-query authority is exposed by the Temple01 asset inventory.',
      'On 2026-09-28 the user states from direct gameplay knowledge that the third-person camera is pushed to the near side of transparent Undertow glass and does not pass through it.'
    ],
    insufficientBecause: [
      'Render geometry does not establish camera push-in, occlusion, shoulder-camera, or line-of-sight query semantics.',
      'Projectile raycast behavior cannot be reused as camera-query authority.',
      'The user knowledge resolves transparent-glass camera blocking behavior but not the exact original Glass01/hidden camera-query primitive or every thin-edge/frame boundary.'
    ],
    minimumAuthoritativeEvidence: [
      'Original-game camera collision/query metadata for the structure.',
      'Transparent-glass camera behavior is now resolved by direct user knowledge. Remaining closure is exact geometry/primitive binding at the thin-edge/frame boundary; no redundant broad-glass camera capture is needed.'
    ]
  },
  {
    role: 'NAVIGATION',
    authorityReady: false,
    activationBlocker: 'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
    observedEvidence: [
      'The exact Glass01 mesh is currently exposed as render-only runtime geometry.',
      'Current post-Ver.7.2 gameplay evidence confirms traversal/occupancy of the glass high ground.',
      'Pass 13A confirms the three broad registered Glass01 upward regions are walkable on both mirrored sides, but the narrow edge strip and exact original collision primitive remain unresolved.'
    ],
    insufficientBecause: [
      'Navigation may follow proven standability only after the supporting collision surface is bound to exact geometry.',
      'Promoting the untested thin strip, side faces, or whole Glass01 shell would still create unverified walkable/collision geometry.'
    ],
    minimumAuthoritativeEvidence: [
      'Authoritative walkability/player-collision data that binds the upper structure to exact source geometry.',
      'Pass 13A identifies the broad standable subset; remaining edge/primitive ambiguity must be closed before a final runtime navigation promotion.'
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
    audit.currentGameplayEvidence.controlledSupportBroadComponentsPerSide !== 3 ||
    audit.currentGameplayEvidence.controlledSupportSeamCrossingsPerSide !== 2 ||
    !audit.currentGameplayEvidence.controlledSupportMirroredSidesIndependentlyCaptured ||
    !audit.currentGameplayEvidence.controlledSupportNoJumpAssistedCrossingObserved ||
    audit.currentGameplayEvidence.controlledSupportThinEdgeStripResolved ||
    !audit.playerStandabilitySemanticResolved ||
    !audit.navigationStandabilitySemanticResolved ||
    !audit.controlledBroadPlayerSupportGeometryResolved ||
    !audit.controlledBroadNavigationWalkabilityEvidenceResolved ||
    audit.controlledBroadComponentCountPerSide !== 3 ||
    audit.controlledThinEdgeStripPlayerSupportResolved ||
    audit.runtimePlayerSupportPromotionAuthorized ||
    audit.runtimeNavigationPromotionAuthorized ||
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
    !audit.projectileSemanticEvidence.currentOrdinaryMainProjectileBehaviorResolved ||
    audit.projectileSemanticEvidence.currentOrdinaryMainProjectilePassesThroughGlass ||
    !audit.projectileSemanticEvidence.userDirectGameplayKnowledgeAccepted ||
    audit.projectileSemanticEvidence.allProjectileClassesResolved ||
    audit.projectileSemanticEvidence.runtimeProjectilePromotionAuthorized ||
    audit.projectileBehaviorResolved ||
    !audit.cameraQueryBehaviorResolved ||
    !audit.cameraTransparentGlassBlocksThirdPersonCamera ||
    !audit.cameraUserDirectGameplayKnowledgeAccepted ||
    audit.exactCameraCollisionPrimitiveResolved
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
