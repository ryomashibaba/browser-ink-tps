import { undertowCaptureEvidence } from './UndertowSpillwayCaptureEvidence';

const correctionEvidence = undertowCaptureEvidence(
  'user-internal-water-premise-correction-still-2026-09-28'
);

export const UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT =
  Object.freeze({
    resolutionPass: '14E' as const,
    auditedAt: '2026-09-28' as const,
    sourceTarget: 'CURRENT_POST_VER_7_2_NORMAL_PVP' as const,
    purpose:
      'Correct the false promotion of third-party cyan source annotations into confirmed current-gameplay internal water hazards.' as const,
    directGameplayEvidence: Object.freeze({
      id: correctionEvidence.id,
      filename: correctionEvidence.filename,
      markedPass14DTargetObservedDry: true,
      visibleInternalWaterlineAtObservedTarget: false,
      userReportsNoWaterAtRequestedLocation: true
    }),
    sourceProvenanceBoundary: Object.freeze({
      sunfishBlueprintGeometryRetained: true,
      cyanSourceAnnotationRetainedAsSourceFact: true,
      cyanAnnotationGameplayWaterAuthorityAuthorized: false,
      exactCyanPolygonGeometryStillUsableAsSourceGeometry: true,
      currentInkipediaHazardLabel: 'Abyss' as const,
      sunfishPublishesWaterMarkedAndWaterUnmarkedUndertowVariants: true
    }),
    supersession: Object.freeze({
      priorInternalWaterPremiseInvalidated: true,
      pass14AInternalWaterConclusionCurrentAuthority: false,
      pass14BInternalWaterPairConclusionCurrentAuthority: false,
      pass14CWaterVsExteriorConclusionCurrentAuthority: false,
      pass14DInternalWaterCaptureRequestCurrentAuthority: false
    }),
    currentSemantics: Object.freeze({
      internalVisualWaterYApplicable: false,
      internalWaterKillThresholdApplicable: false,
      cyanSourceRegionGameplaySemanticsResolved: false,
      exteriorFalloutKillThresholdResolved: false,
      waterOnlyOutsideStageHypothesisPromoted: false
    }),
    blockerTransition: Object.freeze({
      retired: [
        'WATER_VISUAL_Y_PENDING',
        'WATER_KILL_THRESHOLD_PENDING'
      ] as const,
      added: [
        'CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING',
        'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING'
      ] as const
    }),
    userActionRequiredNow: false,
    runtimePromotionAuthorized: false,
    confidence: 'HIGH' as const,
    notes:
      'IMG_6141 directly disproves the former Pass 14D internal-water target at the observed location. The symmetric cyan source polygon remains useful as plan geometry, but neither cyan polygon may carry WATER/KILL gameplay semantics until independently reclassified. The broader hypothesis that visible water exists only outside the stage is plausible and consistent with current public references, but is intentionally not promoted from one still.'
  });

export function undertowInternalWaterSemanticCorrectionAuditErrors():
  readonly string[] {
  const a = UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT;
  const errors: string[] = [];

  if (
    a.resolutionPass !== '14E' ||
    !a.directGameplayEvidence.markedPass14DTargetObservedDry ||
    a.directGameplayEvidence.visibleInternalWaterlineAtObservedTarget ||
    !a.directGameplayEvidence.userReportsNoWaterAtRequestedLocation
  ) {
    errors.push('Pass 14E direct dry-location correction evidence drifted');
  }
  if (
    !a.sourceProvenanceBoundary.sunfishBlueprintGeometryRetained ||
    !a.sourceProvenanceBoundary.cyanSourceAnnotationRetainedAsSourceFact ||
    a.sourceProvenanceBoundary.cyanAnnotationGameplayWaterAuthorityAuthorized ||
    !a.sourceProvenanceBoundary.exactCyanPolygonGeometryStillUsableAsSourceGeometry
  ) {
    errors.push('Pass 14E must retain source geometry while revoking gameplay-water authority');
  }
  if (
    !a.supersession.priorInternalWaterPremiseInvalidated ||
    a.supersession.pass14AInternalWaterConclusionCurrentAuthority ||
    a.supersession.pass14BInternalWaterPairConclusionCurrentAuthority ||
    a.supersession.pass14CWaterVsExteriorConclusionCurrentAuthority ||
    a.supersession.pass14DInternalWaterCaptureRequestCurrentAuthority
  ) {
    errors.push('Pass 14E supersession boundary drifted');
  }
  if (
    a.currentSemantics.internalVisualWaterYApplicable ||
    a.currentSemantics.internalWaterKillThresholdApplicable ||
    a.currentSemantics.cyanSourceRegionGameplaySemanticsResolved ||
    a.currentSemantics.exteriorFalloutKillThresholdResolved ||
    a.currentSemantics.waterOnlyOutsideStageHypothesisPromoted
  ) {
    errors.push('Pass 14E over-promoted unresolved replacement semantics');
  }
  if (
    a.blockerTransition.retired.join(',') !==
      'WATER_VISUAL_Y_PENDING,WATER_KILL_THRESHOLD_PENDING' ||
    a.blockerTransition.added.join(',') !==
      'CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING,EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING'
  ) {
    errors.push('Pass 14E blocker transition drifted');
  }
  if (a.userActionRequiredNow || a.runtimePromotionAuthorized) {
    errors.push('Pass 14E must not request more water capture or activate T21');
  }
  return errors;
}
