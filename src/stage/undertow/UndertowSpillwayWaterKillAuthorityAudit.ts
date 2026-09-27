export const UNDERTOW_WATER_KILL_AUTHORITY_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
  resolutionPass: '11B' as const,
  mappedWaterHazardXzResolved: true,
  internalVoidClassificationResolved: true,
  exteriorPlayableHardSilhouetteResolved: true,
  genericDeathLocatorEvidence: Object.freeze({
    repository: 'Leanny/splat3',
    sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
    locatorRowId: 'Mpt_PlayerDead',
    shapeType: 'Cube',
    targetMaskType: 'ControlledPlayer',
    locatorScale: 1,
    verifiedDataSnapshots: ['720', '800', '920', '1130'] as const,
    definitionStableAcrossVerifiedSnapshots: true,
    stagePlacementResolved: false,
    temple01UsageResolved: false,
    notes:
      'Direct row reads from Leanny LocatorInfo snapshots 720, 800, 920, and 1130 all give Mpt_PlayerDead = Cube / Scale 1 / ControlledPlayer. This verifies the generic locator definition is stable across the audited range, but it still does not expose any Temple01 instance Translate/Rotate/Scale, size after instance scaling, rule-layer membership, or water/fall-out binding.'
  }),
  comparisonLocatorEvidence: Object.freeze({
    locatorRowId: 'Lft_KeepOutPlayer',
    shapeType: 'Cube',
    targetMaskType: 'ControlledPlayer',
    locatorScale: 1,
    notes:
      'Lft_KeepOutPlayer has the same generic LocatorInfo cube/ControlledPlayer shape metadata. Therefore LocatorInfo shape/target fields alone cannot be promoted into death-volume semantics or a kill Y.'
  }),
  sceneMetadataPlacementEvidence: Object.freeze({
    repository: 'Leanny/splat3',
    sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
    sceneRowId: 'Vss_Temple01',
    verifiedSnapshots: ['720', '800', '920', '1130'] as const,
    sceneInfoPreloadResourcesStable: true,
    sceneInfoPreloadResources: ['Model/Fld_Temple01.bfres'] as const,
    versusSceneInfoContainsDeathLocatorPlacement: false,
    versusSceneInfoContainsNormalModeBcettBody: false,
    leagueTypeInfoOnlyReferencesTowerControlModifier: true,
    normalModeMptPlayerDeadPlacementRecovered: false,
    notes:
      'Pass 11B verifies that public Temple01 scene metadata across 720/800/920/1130 contains no normal-mode death-locator placement body. SceneInfo only preloads Fld_Temple01.bfres; VersusSceneInfo is identity/display metadata; LeagueTypeInfo contributes only a Tower-Control modifier reference. None supplies Mpt_PlayerDead Translate/Rotate/Scale.'
  }),
  publicActorSchemaEvidence: Object.freeze({
    repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
    sourceCommit: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
    mptPlayerDeadClassPresent: true,
    placementTransformFields: ['Translate', 'Rotate', 'Scale'] as const,
    placementTransformSchemaPresent: true,
    exposesTemple01Placement: false,
    exposesKillThresholdParameter: false,
    referencedTemple01RuleBinLayer:
      'Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json',
    referencedTemple01RuleBinLayerScope:
      'TOWER_CONTROL_MODIFIER_REFERENCE_ONLY' as const,
    referencedTemple01RuleBinLayerContentsPublished: false,
    notes:
      'The public actor schema includes Mpt_PlayerDead and the shared Mu/SpatialObject schema stores actor Translate/Rotate/Scale. Therefore an actual Temple01 BCETT/BYML instance would be sufficient to bind a death locator geometrically. The audited public repositories expose no Temple01 Mpt_PlayerDead instance body. A metadata reference to a Temple01 Vlf Tower-Control modifier layer exists, but its body is not published there and it is not authority for normal-Turf/water placement.'
  }),
  xzEvidence: Object.freeze({
    exactMappedWaterHazardPair: true,
    unexplainedInternalAbyssCandidates: 0,
    exteriorFallOutBoundaryUsesHardPlayableSilhouette: true,
    notes:
      'The completed XZ audit resolves the two mapped cyan WATER+KILL polygons and excludes additional internal abyss holes. It does not determine the vertical trigger extent or whether water and exterior fall-out share one death volume.'
  }),
  publicTemple01DeathPlacementRecoverySucceeded: false,
  currentGameplayWaterSurfaceContactRelationResolved: true,
  visibleWaterContactCausesEssentiallyImmediateDeath: true,
  largePerceptibleVisualToKillVerticalGapRuledOut: true,
  exactVisualToKillMetricOffsetResolved: false,
  exactVisualToKillMetricOffsetMeters: null,
  waterContactRelationUserDirectGameplayKnowledgeAccepted: true,
  visualWaterYCanDefineKillThreshold: false,
  killThresholdResolved: false,
  killThresholdMeters: null,
  killVolumePlacementResolved: false,
  waterAndExteriorFallOutShareThresholdResolved: false,
  confidence: 'HIGH' as const,
  missingAuthoritativeEvidence: [
    'Current post-Ver.7.2 Temple01 common/normal-rule BCETT or equivalent stage-layout instance for Mpt_PlayerDead or an equivalent player-death locator, including Translate/Rotate/Scale and layer applicability.',
    'Evidence that identifies whether the exact mapped cyan water pair and exterior fall-out use the same vertical death trigger or separate hazard volumes.',
    'Alternatively, controlled current normal-PvP vertical-crossing evidence registered to fixed Temple01 geometry tightly enough to bound the death trigger Y without reusing the unresolved visual-water plane.'
  ] as const,
  notes:
    'Pass 14A adds direct gameplay knowledge that visible-water contact causes essentially immediate death, ruling out a large perceptible vertical separation between the visual surface and water-death trigger. This does not recover either world-Y value or a metric offset. The Pass 11B public-source gap therefore remains: no Temple01 death-locator instance body was recovered, no exact kill Y is promoted, and WATER_KILL_THRESHOLD_PENDING remains activation-blocking independently of WATER_VISUAL_Y_PENDING.'
});

export function undertowWaterKillAuthorityAuditErrors(): readonly string[] {
  const audit = UNDERTOW_WATER_KILL_AUTHORITY_AUDIT;
  const errors: string[] = [];

  if (!audit.mappedWaterHazardXzResolved || !audit.internalVoidClassificationResolved) {
    errors.push('water kill audit requires the completed XZ hazard/void classification');
  }
  if (
    audit.genericDeathLocatorEvidence.locatorRowId !== 'Mpt_PlayerDead' ||
    audit.genericDeathLocatorEvidence.shapeType !== 'Cube' ||
    audit.genericDeathLocatorEvidence.targetMaskType !== 'ControlledPlayer'
  ) {
    errors.push('generic Mpt_PlayerDead locator evidence drifted');
  }
  if (
    audit.genericDeathLocatorEvidence.stagePlacementResolved ||
    audit.genericDeathLocatorEvidence.temple01UsageResolved
  ) {
    errors.push('generic locator metadata must not claim Temple01 placement authority');
  }
  if (
    !audit.genericDeathLocatorEvidence.definitionStableAcrossVerifiedSnapshots ||
    audit.genericDeathLocatorEvidence.verifiedDataSnapshots.join(',') !==
      '720,800,920,1130'
  ) {
    errors.push('Mpt_PlayerDead cross-snapshot verification drifted');
  }
  if (
    audit.comparisonLocatorEvidence.shapeType !== audit.genericDeathLocatorEvidence.shapeType ||
    audit.comparisonLocatorEvidence.targetMaskType !==
      audit.genericDeathLocatorEvidence.targetMaskType
  ) {
    errors.push('comparison locator no longer demonstrates generic locator-shape ambiguity');
  }
  if (
    audit.resolutionPass !== '11B' ||
    audit.sceneMetadataPlacementEvidence.verifiedSnapshots.join(',') !==
      '720,800,920,1130' ||
    !audit.sceneMetadataPlacementEvidence.sceneInfoPreloadResourcesStable ||
    audit.sceneMetadataPlacementEvidence.sceneInfoPreloadResources.join(',') !==
      'Model/Fld_Temple01.bfres' ||
    audit.sceneMetadataPlacementEvidence.versusSceneInfoContainsDeathLocatorPlacement ||
    audit.sceneMetadataPlacementEvidence.versusSceneInfoContainsNormalModeBcettBody ||
    !audit.sceneMetadataPlacementEvidence.leagueTypeInfoOnlyReferencesTowerControlModifier ||
    audit.sceneMetadataPlacementEvidence.normalModeMptPlayerDeadPlacementRecovered
  ) {
    errors.push('Pass 11B Temple01 death-placement metadata boundary drifted');
  }
  if (
    audit.publicActorSchemaEvidence.exposesTemple01Placement ||
    audit.publicActorSchemaEvidence.exposesKillThresholdParameter ||
    !audit.publicActorSchemaEvidence.placementTransformSchemaPresent ||
    audit.publicActorSchemaEvidence.placementTransformFields.join(',') !==
      'Translate,Rotate,Scale' ||
    audit.publicActorSchemaEvidence.referencedTemple01RuleBinLayerScope !==
      'TOWER_CONTROL_MODIFIER_REFERENCE_ONLY' ||
    audit.publicActorSchemaEvidence.referencedTemple01RuleBinLayerContentsPublished
  ) {
    errors.push('public actor placement-schema boundary drifted');
  }
  if (audit.publicTemple01DeathPlacementRecoverySucceeded) {
    errors.push('Pass 11B must not claim recovery of an unpublished Temple01 death volume');
  }
  if (
    !audit.currentGameplayWaterSurfaceContactRelationResolved ||
    !audit.visibleWaterContactCausesEssentiallyImmediateDeath ||
    !audit.largePerceptibleVisualToKillVerticalGapRuledOut ||
    audit.exactVisualToKillMetricOffsetResolved ||
    audit.exactVisualToKillMetricOffsetMeters !== null ||
    !audit.waterContactRelationUserDirectGameplayKnowledgeAccepted
  ) {
    errors.push('Pass 14A qualitative visual-water/death relationship drifted or overclaimed metric authority');
  }
  if (audit.visualWaterYCanDefineKillThreshold) {
    errors.push('visual water Y must not be reused as kill-threshold authority');
  }
  if (
    audit.killThresholdResolved ||
    audit.killThresholdMeters !== null ||
    audit.killVolumePlacementResolved
  ) {
    errors.push('water kill threshold/volume must remain unresolved');
  }
  if (audit.waterAndExteriorFallOutShareThresholdResolved) {
    errors.push('water and exterior fall-out threshold relationship must remain unresolved');
  }
  if (audit.missingAuthoritativeEvidence.length < 2) {
    errors.push('water kill authority gap is not sufficiently localized');
  }

  return errors;
}
