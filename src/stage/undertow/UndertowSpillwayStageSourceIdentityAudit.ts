export const UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT = Object.freeze({
  auditedAt: '2026-09-28' as const,
  canonicalCurrentStageRowId: 'Vss_Temple01' as const,
  canonicalCurrentModelResource: 'Model/Fld_Temple01.bfres' as const,
  canonicalCurrentJapaneseLabel: 'マテガイ放水路（改修後）' as const,
  legacyStageRowId: 'Vss_Temple00' as const,
  legacyModelResource: 'Model/Fld_Temple00.bfres' as const,
  legacyJapaneseLabel: 'マテガイ放水路' as const,
  nonUndertowComparison: Object.freeze({
    rowId: 'Vss_Nagasaki03' as const,
    modelResource: 'Model/Fld_Nagasaki03.bfres' as const,
    japaneseLabel: 'チョウザメ造船' as const
  }),
  leannyEvidence: Object.freeze({
    repository: 'Leanny/splat3' as const,
    sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6' as const,
    verifiedSnapshots: ['720', '920', '1130'] as const,
    temple01IdentityStableAcrossSnapshots: true,
    nagasaki03IdentityStableAcrossSnapshots: true
  }),
  kitrixHumanNameMapConflict: Object.freeze({
    repository: 'kirakira-dev/KiTrix' as const,
    sourceCommit: '0611f51b35c9736ee986fb2218461e2585b7875e6' as const,
    stageLoaderMapsUndertowToNagasaki03: true,
    stageLoaderMapsCampTriggerfishToTemple01: true,
    trustedForStageSourceIdentity: false,
    reason:
      'KiTrix StageLoader human-readable stageNameMap conflicts with Leanny game-data SceneInfo. Source identity must follow the game-data row/model binding, not this convenience map.'
  }),
  conclusion: Object.freeze({
    temple01IsCurrentRemodeledUndertow: true,
    nagasaki03IsNotUndertow: true,
    previousTemple01GeometryWorkRequiresRollback: false,
    runtimePromotionAuthorizedByIdentityAudit: false
  }),
  notes:
    'Leanny SceneInfo directly binds Vss_Temple01 to マテガイ放水路（改修後） and Model/Fld_Temple01.bfres in snapshots 720/920/1130; Vss_Nagasaki03 is チョウザメ造船. The conflicting KiTrix StageLoader stageNameMap is therefore treated as a convenience-map bug and not authority.'
});

export function undertowStageSourceIdentityAuditErrors(): readonly string[] {
  const a = UNDERTOW_STAGE_SOURCE_IDENTITY_AUDIT;
  const errors: string[] = [];

  if (
    a.canonicalCurrentStageRowId !== 'Vss_Temple01' ||
    a.canonicalCurrentModelResource !== 'Model/Fld_Temple01.bfres' ||
    a.canonicalCurrentJapaneseLabel !== 'マテガイ放水路（改修後）'
  ) {
    errors.push('current remodeled Undertow source identity drifted');
  }

  if (
    a.nonUndertowComparison.rowId !== 'Vss_Nagasaki03' ||
    a.nonUndertowComparison.japaneseLabel !== 'チョウザメ造船'
  ) {
    errors.push('Nagasaki03 comparison identity drifted');
  }

  if (
    !a.leannyEvidence.temple01IdentityStableAcrossSnapshots ||
    !a.leannyEvidence.nagasaki03IdentityStableAcrossSnapshots ||
    a.leannyEvidence.verifiedSnapshots.join(',') !== '720,920,1130'
  ) {
    errors.push('cross-snapshot source identity evidence is incomplete');
  }

  if (
    !a.kitrixHumanNameMapConflict.stageLoaderMapsUndertowToNagasaki03 ||
    a.kitrixHumanNameMapConflict.trustedForStageSourceIdentity
  ) {
    errors.push('KiTrix convenience-map conflict must remain explicitly non-authoritative');
  }

  if (
    !a.conclusion.temple01IsCurrentRemodeledUndertow ||
    !a.conclusion.nagasaki03IsNotUndertow ||
    a.conclusion.previousTemple01GeometryWorkRequiresRollback ||
    a.conclusion.runtimePromotionAuthorizedByIdentityAudit
  ) {
    errors.push('source identity conclusion drifted or over-promoted runtime authority');
  }

  return errors;
}
