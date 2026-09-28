import { SurfaceFlags } from '../../ink/types';
import { UNDERTOW_PAINT_AUTHORITY_AUDIT } from './UndertowSpillwayPaintAuthorityAudit';
import { UNDERTOW_CENTER_SLOPE_SOURCE_MESHES } from './UndertowSpillwaySlopeMeshGeometry';
import { UNDERTOW_RIGHT_LOW_ROUTE_RAMPS } from './UndertowSpillwayRouteRampGeometry';
import {
  UNDERTOW_VECTOR_BLUEPRINT_SOURCE,
  UNDERTOW_VECTOR_TRACES
} from './UndertowSpillwayVectorBlueprint';

const VECTOR_SOURCE_CLASSES = new Set(
  Object.values(UNDERTOW_VECTOR_TRACES).map((trace) => trace.sourceClass)
);

const FLOOR_CANDIDATE_RUNTIME_SOLID_IDS = [
  'UndertowT21D:center-low-team-a',
  'UndertowT21D:center-low-team-b',
  'UndertowT21D:right-low-team-a',
  'UndertowT21D:right-low-team-b',
  'UndertowT21D:center-origin-step-top-face:0',
  'UndertowT21D:first-drop-landing-positive-z',
  'UndertowT21D:first-drop-landing-negative-z',
  'UndertowT21D:spawn-high-positive-z',
  'UndertowT21D:spawn-high-negative-z',
  'UndertowT21D:glass-underpass-positive-z',
  'UndertowT21D:glass-underpass-negative-z'
] as const;

const RAMP_CANDIDATE_RUNTIME_SOLID_IDS = [
  ...UNDERTOW_CENTER_SLOPE_SOURCE_MESHES.map(
    (record) => `UndertowT21D:${record.id}`
  ),
  ...UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.map(
    (record) => `UndertowT21D:${record.id}`
  )
] as const;

const SCOREABILITY_CANDIDATE_IDS = [
  ...FLOOR_CANDIDATE_RUNTIME_SOLID_IDS,
  ...RAMP_CANDIDATE_RUNTIME_SOLID_IDS
] as const;

const TEMPLE01_PAINT_BANC_ACTOR_CLASSES = [
  'Lft_FldObj_Temple01_PntSet',
  'Lft_FldObj_Temple01_VarSet',
  'Lft_FldObj_Temple01_VclSet',
  'Lft_FldObj_Temple01_VglSet',
  'Lft_FldObj_Temple01_VlfSet'
] as const;

export const UNDERTOW_TURF_SCOREABLE_MASK_AUDIT = Object.freeze({
  sourceVersion: '7.2.0',
  resolutionPass: '17A' as const,
  auditedAt: '2026-09-28' as const,
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

  candidateClassification: Object.freeze({
    totalPaintableCandidates: SCOREABILITY_CANDIDATE_IDS.length,
    floorCandidateCount: FLOOR_CANDIDATE_RUNTIME_SOLID_IDS.length,
    rampCandidateCount: RAMP_CANDIDATE_RUNTIME_SOLID_IDS.length,
    verticalCandidateCount: 0,
    floorRuntimeSolidIds: FLOOR_CANDIDATE_RUNTIME_SOLID_IDS,
    rampRuntimeSolidIds: RAMP_CANDIDATE_RUNTIME_SOLID_IDS,
    allCurrentCandidatesAreGroundOrRamp: true,
    genericVerticalNonScoringRuleEliminatesCandidateCount: 0,
    notes:
      'Pass 17A classifies all seventeen currently paintable reconstruction surfaces by their runtime geometry role: eleven Floor surfaces and six Ramp surfaces. No paintable Wall surface exists in the current T21 candidate inventory. This narrows the scoreability question but does not prove that every floor/ramp contributes to Turf victory percentage.'
  }),

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
      'Generic Turf rules establish ground/territory scoring and corroborate that vertical surfaces do not count. Pass 17A shows that this removes no current T21 candidate because all seventeen paintable candidates are already floors or ramps. It still cannot decide Temple01-specific inclusions, exclusions, or partial score boundaries.'
  }),

  vectorSourceEvidence: Object.freeze({
    observedSourceClasses: [...VECTOR_SOURCE_CLASSES].sort(),
    hasExplicitScoreableClass: VECTOR_SOURCE_CLASSES.has('SCOREABLE' as never),
    whiteSourceFaceMeansScoreable: false,
    paintableMeansScoreableByDefinition: false,
    notes:
      'The audited Turf vector source distinguishes hard edges, white source faces, uninkable gray/glass, slope markers, grate mesh, and the now-source-only cyan annotation. It has no explicit SCOREABLE semantic. White geometry and PAINTABLE authority must not be promoted into victory scoring without score-specific evidence.'
  }),

  publicSchemaFollowup: Object.freeze({
    repository: 'OctoSquiddy/Splatoon-3-Map-Editor' as const,
    sourceCommit:
      '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4' as const,
    paintBancFieldObserved: 'IsIncludeVArea' as const,
    paintBancFieldDefaultValue: false,
    paintBancFieldSerializedWhenTrue: true,
    temple01SpecificActorClassCount:
      TEMPLE01_PAINT_BANC_ACTOR_CLASSES.length,
    temple01SpecificActorClasses: TEMPLE01_PAINT_BANC_ACTOR_CLASSES,
    temple01SpecificClassesExposeField: true,
    fieldSemanticMeaningAsTurfScoreAuthorityResolved: false,
    fieldNameAloneAcceptedAsScoreAuthority: false,
    currentTemple01NormalPvpInstanceValuesRecovered: false,
    currentTemple01PerFaceBindingRecovered: false,
    normalModePlacementBodyRecovered: false,
    exposesTurfVictoryScoreMask: false,
    exposesTemple01PerFaceScoreability: false,
    exposesTemple01ScoreMaskPlacement: false,
    notes:
      'Pass 17A localizes the strongest public schema lead: spl__PaintBancParam contains one boolean, IsIncludeVArea, and all five Temple01 lift-variant actor classes expose it. The schema also shows a false default and serializes the member when true. However, no current normal-PvP Temple01 BCETT/placement body with instance values was recovered, the abbreviation VArea is not assigned a score meaning from its name, and no per-face or raster binding is published. The field therefore remains a candidate source path, not Turf score authority.'
  }),

  candidateRuntimeSolidIds: SCOREABILITY_CANDIDATE_IDS,
  candidateStatus: 'GROUND_OR_RAMP_SCORE_AUTHORITY_PENDING' as const,

  missingAuthoritativeEvidence: [
    'Current post-Ver.7.2 normal-PvP Temple01 stage-layout/BCETT instance data that exposes IsIncludeVArea or equivalent paint-area participation values and can be registered to the exact reconstruction surfaces, together with evidence for the gameplay meaning of that field.',
    'Or controlled current Turf War scoring evidence that isolates known Temple01 floor/ramp regions strongly enough to prove whether each full active footprint contributes to the final team percentage.',
    'If a recovered score boundary cuts through an existing paint surface, the runtime representation must split that surface or add an independently audited score mask before SurfaceFlags.Scoreable can be applied.'
  ] as const,

  blockerRetained: 'TURF_SCOREABLE_MASK_PENDING' as const,
  blockerCleared: false,
  runtimeScoreablePromotionAuthorized: false,
  userCaptureRequiredNow: false,
  confidence: 'HIGH' as const,
  notes:
    'Pass 17A narrows TURF_SCOREABLE_MASK_PENDING without clearing it. Paint authority is complete (17 PAINTABLE / 0 UNKNOWN), and every scoreability candidate is a floor or ramp, but no current Temple01-specific participation value or full-footprint score boundary is authoritative yet. Zero SurfaceFlags.Scoreable promotion remains the correct inert reconstruction state.'
});

export function undertowTurfScoreableMaskAuditErrors(): readonly string[] {
  const audit = UNDERTOW_TURF_SCOREABLE_MASK_AUDIT;
  const errors: string[] = [];

  if (
    audit.resolutionPass !== '17A' ||
    audit.scoreMaskResolved ||
    audit.currentScoreablePromotionsAuthorized !== 0 ||
    audit.runtimeScoreablePromotionAuthorized
  ) {
    errors.push(
      'Pass 17A Turf scoreability must remain unresolved with zero authorized promotions'
    );
  }

  if (!audit.paintAuthorityUpstreamComplete) {
    errors.push(
      'score-mask audit must recognize that Pass 12C completed upstream paint authority'
    );
  }
  if (audit.currentConfirmedPaintableRuntimeSolidCount !== 17) {
    errors.push(
      'current confirmed paintable runtime-solid count drifted from seventeen'
    );
  }
  if (audit.currentUnknownPaintRuntimeSolidCount !== 0) {
    errors.push(
      'current unknown paint runtime-solid count must remain zero after Pass 12C'
    );
  }

  const classification = audit.candidateClassification;
  if (
    classification.totalPaintableCandidates !== 17 ||
    classification.floorCandidateCount !== 11 ||
    classification.rampCandidateCount !== 6 ||
    classification.verticalCandidateCount !== 0 ||
    !classification.allCurrentCandidatesAreGroundOrRamp ||
    classification.genericVerticalNonScoringRuleEliminatesCandidateCount !== 0
  ) {
    errors.push('Pass 17A floor/ramp candidate classification drifted');
  }

  const candidateIds = new Set(audit.candidateRuntimeSolidIds);
  const paintableIds = new Set(
    UNDERTOW_PAINT_AUTHORITY_AUDIT.paintableRuntimeSolidIds
  );
  if (
    candidateIds.size !== 17 ||
    paintableIds.size !== 17 ||
    [...candidateIds].some((id) => !paintableIds.has(id)) ||
    [...paintableIds].some((id) => !candidateIds.has(id))
  ) {
    errors.push(
      'Pass 17A scoreability candidates must exactly equal the seventeen paint-authorized solids'
    );
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
    !audit.engineRepresentation
      .currentSchemaCanRepresentOnlyWholeActivePaintSurfaceScoreability
  ) {
    errors.push('engine unexpectedly claims an independent per-cell score mask');
  }

  if (
    audit.genericTurfRuleEvidence.canPromoteTemple01FacesByItself ||
    audit.vectorSourceEvidence.hasExplicitScoreableClass ||
    audit.vectorSourceEvidence.whiteSourceFaceMeansScoreable ||
    audit.vectorSourceEvidence.paintableMeansScoreableByDefinition
  ) {
    errors.push(
      'generic/vector semantics must not become Temple01 score authority'
    );
  }

  const schema = audit.publicSchemaFollowup;
  if (
    schema.paintBancFieldObserved !== 'IsIncludeVArea' ||
    schema.paintBancFieldDefaultValue ||
    !schema.paintBancFieldSerializedWhenTrue ||
    schema.temple01SpecificActorClassCount !== 5 ||
    !schema.temple01SpecificClassesExposeField ||
    schema.fieldSemanticMeaningAsTurfScoreAuthorityResolved ||
    schema.fieldNameAloneAcceptedAsScoreAuthority ||
    schema.currentTemple01NormalPvpInstanceValuesRecovered ||
    schema.currentTemple01PerFaceBindingRecovered ||
    schema.normalModePlacementBodyRecovered ||
    schema.exposesTurfVictoryScoreMask ||
    schema.exposesTemple01PerFaceScoreability ||
    schema.exposesTemple01ScoreMaskPlacement
  ) {
    errors.push('Pass 17A public PaintBanc schema authority boundary drifted');
  }

  if (
    schema.temple01SpecificActorClasses.join(',') !==
    'Lft_FldObj_Temple01_PntSet,Lft_FldObj_Temple01_VarSet,Lft_FldObj_Temple01_VclSet,Lft_FldObj_Temple01_VglSet,Lft_FldObj_Temple01_VlfSet'
  ) {
    errors.push('Pass 17A Temple01 PaintBanc actor-class inventory drifted');
  }

  if (
    audit.missingAuthoritativeEvidence.length !== 3 ||
    audit.blockerRetained !== 'TURF_SCOREABLE_MASK_PENDING' ||
    audit.blockerCleared ||
    audit.userCaptureRequiredNow
  ) {
    errors.push('Pass 17A blocker/evidence-gap disposition drifted');
  }

  return errors;
}
