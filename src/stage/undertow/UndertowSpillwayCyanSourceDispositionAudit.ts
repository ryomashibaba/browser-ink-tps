import { UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT } from './UndertowSpillwayInternalWaterSemanticCorrectionAudit';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';

export const UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT = Object.freeze({
  resolutionPass: '14F' as const,
  auditedAt: '2026-09-28' as const,
  purpose:
    'Resolve whether the exact cyan Sunfish polygons require any current normal-PvP runtime surface after Pass 14E revoked their false WATER/KILL binding.' as const,
  evidenceBoundary: Object.freeze({
    pass14EDryTargetCorrectionAccepted:
      UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT
        .directGameplayEvidence.markedPass14DTargetObservedDry,
    currentNormalPvpHazardSummary: 'ABYSS_ONLY' as const,
    currentSymmetricTacticalMapCrossCheckAccepted: true,
    sourcePairStillExact: true,
    teamASourceClass: UNDERTOW_VECTOR_TRACES.teamAWaterRegion.sourceClass,
    teamBSourceClass: UNDERTOW_VECTOR_TRACES.teamBWaterRegion.sourceClass
  }),
  resolution: Object.freeze({
    sourceAnnotationOnlyNoRuntimeSurface: true,
    createInternalWaterSurface: false,
    createInternalWaterKillVolume: false,
    createPaintSurfaceFromCyanAnnotation: false,
    sourcePolygonGeometryRetainedForProvenance: true,
    decorativeOrOffStageWaterLayoutResolved: false,
    exteriorFalloutKillThresholdResolved: false
  }),
  confidence: 'HIGH' as const,
  blockerCleared: 'CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING' as const,
  blockerStillRequired: 'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING' as const,
  userActionRequiredNow: false,
  notes:
    'The result is a runtime disposition, not a claim about why the third-party water-marking layer contains cyan there. One observed target is directly dry, the current stagewide hazard summary lists Abyss rather than Water, and the current map retains the symmetric normal-PvP layout. Therefore the two cyan polygons remain source-plan annotations only. Exterior scenery water, if any, may be reconstructed later as environment art and does not inherit these polygons.'
});

export function undertowCyanSourceDispositionAuditErrors(): readonly string[] {
  const a = UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT;
  const errors: string[] = [];
  if (
    a.resolutionPass !== '14F' ||
    !a.evidenceBoundary.pass14EDryTargetCorrectionAccepted ||
    a.evidenceBoundary.currentNormalPvpHazardSummary !== 'ABYSS_ONLY' ||
    !a.evidenceBoundary.currentSymmetricTacticalMapCrossCheckAccepted
  ) {
    errors.push('Pass 14F evidence boundary drifted');
  }
  if (
    a.evidenceBoundary.teamASourceClass !== 'WATER_CYAN' ||
    a.evidenceBoundary.teamBSourceClass !== 'WATER_CYAN' ||
    !a.evidenceBoundary.sourcePairStillExact
  ) {
    errors.push('Pass 14F must retain the exact cyan source annotations');
  }
  if (
    !a.resolution.sourceAnnotationOnlyNoRuntimeSurface ||
    a.resolution.createInternalWaterSurface ||
    a.resolution.createInternalWaterKillVolume ||
    a.resolution.createPaintSurfaceFromCyanAnnotation ||
    !a.resolution.sourcePolygonGeometryRetainedForProvenance
  ) {
    errors.push('Pass 14F runtime disposition drifted');
  }
  if (
    a.resolution.decorativeOrOffStageWaterLayoutResolved ||
    a.resolution.exteriorFalloutKillThresholdResolved
  ) {
    errors.push('Pass 14F must not overclaim exterior environment or fall-out Y');
  }
  if (
    a.blockerCleared !== 'CYAN_SOURCE_REGION_GAMEPLAY_SEMANTICS_PENDING' ||
    a.blockerStillRequired !== 'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING' ||
    a.userActionRequiredNow
  ) {
    errors.push('Pass 14F blocker transition drifted');
  }
  return errors;
}
