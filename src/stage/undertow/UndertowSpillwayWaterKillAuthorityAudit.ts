export const UNDERTOW_WATER_KILL_AUTHORITY_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
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
    stagePlacementResolved: false,
    temple01UsageResolved: false,
    notes:
      'LocatorInfo exposes Mpt_PlayerDead as a generic cube locator targeting the controlled player. This establishes that an explicit player-death locator type exists in the published game metadata, but it does not expose any Temple01 instance transform, size, rule-layer membership, or water/fall-out binding.'
  }),
  comparisonLocatorEvidence: Object.freeze({
    locatorRowId: 'Lft_KeepOutPlayer',
    shapeType: 'Cube',
    targetMaskType: 'ControlledPlayer',
    locatorScale: 1,
    notes:
      'Lft_KeepOutPlayer has the same generic LocatorInfo cube/ControlledPlayer shape metadata. Therefore LocatorInfo shape/target fields alone cannot be promoted into death-volume semantics or a kill Y.'
  }),
  publicActorSchemaEvidence: Object.freeze({
    repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
    sourceCommit: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
    mptPlayerDeadClassPresent: true,
    exposesTemple01Placement: false,
    exposesKillThresholdParameter: false,
    notes:
      'The public actor schema includes Mpt_PlayerDead, but the class exposes no stage-specific placement or kill-threshold parameter. The missing Temple01 BCETT/BYML placement remains the authority gap.'
  }),
  xzEvidence: Object.freeze({
    exactMappedWaterHazardPair: true,
    unexplainedInternalAbyssCandidates: 0,
    exteriorFallOutBoundaryUsesHardPlayableSilhouette: true,
    notes:
      'The completed XZ audit resolves the two mapped cyan WATER+KILL polygons and excludes additional internal abyss holes. It does not determine the vertical trigger extent or whether water and exterior fall-out share one death volume.'
  }),
  visualWaterYCanDefineKillThreshold: false,
  killThresholdResolved: false,
  killThresholdMeters: null,
  killVolumePlacementResolved: false,
  waterAndExteriorFallOutShareThresholdResolved: false,
  confidence: 'HIGH' as const,
  missingAuthoritativeEvidence: [
    'Current 7.2+ Temple01 common/rule-layer BCETT or equivalent stage-layout placement for Mpt_PlayerDead or any equivalent player-death locator, including translation, scale, rotation, and layer applicability.',
    'Evidence that identifies whether the mapped cyan water pair and exterior fall-out use the same vertical death trigger or separate hazard volumes.',
    'Alternatively, controlled in-game vertical-crossing evidence registered to fixed Temple01 geometry tightly enough to bound the death trigger Y without using the unresolved visual water plane.'
  ] as const,
  notes:
    'The horizontal hazard topology is resolved, and public metadata confirms a generic cube-shaped player-death locator type exists. However no current Temple01 placement/transform for that locator is publicly available in the audited sources. Therefore no global kill Y, water kill plane, or death volume is promoted. WATER_KILL_THRESHOLD_PENDING remains activation-blocking independently of WATER_VISUAL_Y_PENDING.'
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
    audit.comparisonLocatorEvidence.shapeType !== audit.genericDeathLocatorEvidence.shapeType ||
    audit.comparisonLocatorEvidence.targetMaskType !==
      audit.genericDeathLocatorEvidence.targetMaskType
  ) {
    errors.push('comparison locator no longer demonstrates generic locator-shape ambiguity');
  }
  if (
    audit.publicActorSchemaEvidence.exposesTemple01Placement ||
    audit.publicActorSchemaEvidence.exposesKillThresholdParameter
  ) {
    errors.push('public actor schema unexpectedly claims Temple01 kill placement/threshold authority');
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
