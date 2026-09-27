import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_PAINT_AUTHORITY_AUDIT } from './UndertowSpillwayPaintAuthorityAudit';
import {
  UNDERTOW_VECTOR_BLUEPRINT_SOURCE,
  UNDERTOW_VECTOR_TRACES
} from './UndertowSpillwayVectorBlueprint';

const VECTOR_SOURCE_CLASSES = new Set(
  Object.values(UNDERTOW_VECTOR_TRACES).map((trace) => trace.sourceClass)
);

export const UNDERTOW_TURF_SCOREABLE_MASK_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
  turfRuleMapSourceId: 'user-turf-rule-map',
  turfVectorSourceLabel: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.label,
  scoreableFlagValue: SurfaceFlags.Scoreable,
  currentConfirmedPaintableRuntimeSolidCount:
    UNDERTOW_PAINT_AUTHORITY_AUDIT.confirmedPaintableCount,
  currentUnknownPaintRuntimeSolidCount:
    UNDERTOW_PAINT_AUTHORITY_AUDIT.unresolvedCount,
  currentScoreablePromotionsAuthorized: 0,
  scoreMaskResolved: false,
  paintAuthorityUpstreamComplete:
    UNDERTOW_PAINT_AUTHORITY_AUDIT.paintAuthorityComplete,
  engineRepresentation: Object.freeze({
    stagePaintSurfaceHasWholeSurfaceFlags: true,
    scoreableIsBaseSurfaceFlag: true,
    activeFootprintMasksInactiveCells: true,
    scoreWeightGridUsesActiveFootprintAndEdgeFractionsOnly: true,
    independentPerCellScoreMaskFieldPresent: false,
    currentSchemaCanRepresentOnlyWholeActivePaintSurfaceScoreability: true,
    notes:
      'PaintSurface derives scoreWeightGrid from the active footprint and edge fractions. SurfaceFlags.Scoreable is a base flag for the whole active paint surface; StagePaintSurfaceDefinition exposes no independent victory-score mask.'
  }),
  genericTurfRuleEvidence: Object.freeze({
    splatoon3GroundCoverageRuleConfirmed: true,
    verticalSurfacesDoNotCountRuleCorroborated: true,
    authorityScope: 'RULE_LEVEL_ONLY' as const,
    canPromoteTemple01FacesByItself: false,
    notes:
      'Official Turf War guidance establishes that victory is based on inked ground/territory, and Nintendo guidance for the series explicitly distinguishes vertical surfaces as non-scoring. This does not identify Temple01-specific horizontal exclusions or per-face score boundaries.'
  }),
  vectorSourceEvidence: Object.freeze({
    observedSourceClasses: [...VECTOR_SOURCE_CLASSES].sort(),
    hasExplicitScoreableClass: VECTOR_SOURCE_CLASSES.has('SCOREABLE' as never),
    whiteSourceFaceMeansScoreable: false,
    paintableMeansScoreableByDefinition: false,
    notes:
      'The audited Turf vector source distinguishes hard edges, white source faces, uninkable gray/glass, slope markers, grate mesh, and water. It has no explicit SCOREABLE semantic. White geometry and PAINTABLE authority must not be promoted into victory scoring without score-specific evidence.'
  }),
  publicSchemaFollowup: Object.freeze({
    paintBancFieldObserved: 'IsIncludeVArea',
    exposesTurfVictoryScoreMask: false,
    exposesTemple01PerFaceScoreability: false,
    exposesTemple01ScoreMaskPlacement: false,
    notes:
      'The public stage-layout schema exposes paint-related actor metadata but no Temple01 Turf victory-score mask or per-face scoring classification.'
  }),
  candidateRuntimeSolidIds:
    UNDERTOW_PAINT_AUTHORITY_AUDIT.paintableRuntimeSolidIds,
  candidateStatus: 'HORIZONTAL_PAINTABLE_BUT_SCORE_AUTHORITY_PENDING' as const,
  missingAuthoritativeEvidence: [
    'Current Ver.7.2+ Temple01 Turf victory-score raster/mask, per-face score metadata, or equivalent game data that can be registered to the exact paint surfaces.',
    'Or controlled Turf War scoring evidence that isolates known Temple01 floor regions strongly enough to prove whether their full active footprint contributes to the final team percentage.',
    'If score boundaries cut through an existing paint surface, the runtime representation must split that surface or add an independently audited score mask before SurfaceFlags.Scoreable can be applied.'
  ] as const,
  confidence: 'HIGH' as const,
  notes:
    'TURF_SCOREABLE_MASK_PENDING remains activation-blocking. No current Undertow paint surface receives SurfaceFlags.Scoreable from this audit. UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING is an upstream completeness dependency, but paintability and Turf victory scoring remain separate authorities.'
});

export function undertowTurfScoreableMaskAuditErrors(): readonly string[] {
  const audit = UNDERTOW_TURF_SCOREABLE_MASK_AUDIT;
  const errors: string[] = [];

  if (audit.scoreMaskResolved || audit.currentScoreablePromotionsAuthorized !== 0) {
    errors.push('Turf scoreability must remain unresolved with zero authorized promotions');
  }
  if (audit.paintAuthorityUpstreamComplete) {
    errors.push('score-mask audit unexpectedly claims complete upstream paint authority');
  }
  if (audit.currentConfirmedPaintableRuntimeSolidCount !== 5) {
    errors.push('current confirmed paintable runtime-solid count drifted from five');
  }
  if (audit.currentUnknownPaintRuntimeSolidCount !== 12) {
    errors.push('current unknown paint runtime-solid count drifted from twelve');
  }
  if (
    !audit.engineRepresentation.stagePaintSurfaceHasWholeSurfaceFlags ||
    !audit.engineRepresentation.scoreableIsBaseSurfaceFlag ||
    !audit.engineRepresentation.activeFootprintMasksInactiveCells ||
    !audit.engineRepresentation.scoreWeightGridUsesActiveFootprintAndEdgeFractionsOnly
  ) {
    errors.push('engine score representation evidence drifted');
  }
  if (
    audit.engineRepresentation.independentPerCellScoreMaskFieldPresent ||
    !audit.engineRepresentation.currentSchemaCanRepresentOnlyWholeActivePaintSurfaceScoreability
  ) {
    errors.push('engine unexpectedly claims an independent per-cell score mask');
  }
  if (
    audit.genericTurfRuleEvidence.canPromoteTemple01FacesByItself ||
    audit.vectorSourceEvidence.hasExplicitScoreableClass ||
    audit.vectorSourceEvidence.whiteSourceFaceMeansScoreable ||
    audit.vectorSourceEvidence.paintableMeansScoreableByDefinition
  ) {
    errors.push('generic/vector semantics must not become Temple01 score authority');
  }
  if (
    audit.publicSchemaFollowup.exposesTurfVictoryScoreMask ||
    audit.publicSchemaFollowup.exposesTemple01PerFaceScoreability ||
    audit.publicSchemaFollowup.exposesTemple01ScoreMaskPlacement
  ) {
    errors.push('public schema unexpectedly claims Temple01 Turf score authority');
  }
  if (audit.candidateRuntimeSolidIds.length !== 5) {
    errors.push('scoreability candidate inventory must track exactly five currently confirmed paintable solids');
  }
  if (audit.missingAuthoritativeEvidence.length < 3) {
    errors.push('Turf score-mask evidence gap is not sufficiently localized');
  }

  return errors;
}
