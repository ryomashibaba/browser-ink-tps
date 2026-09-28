import { PRODUCTION_STAGE_DEFINITION } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT } from './UndertowSpillwayCyanSourceDispositionAudit';
import { UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT } from './UndertowSpillwayInternalWaterSemanticCorrectionAudit';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';

export const UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT = Object.freeze({
  resolutionPass: '16A' as const,
  auditedAt: '2026-09-28' as const,
  sourceTarget: 'CURRENT_POST_VER_7_2_NORMAL_PVP' as const,
  purpose:
    'Localize the remaining exterior Abyss fall-out death threshold without inventing a numeric world Y from unrelated geometry, water annotations, or non-versus parameters.' as const,

  horizontalAuthority: Object.freeze({
    hazardTaxonomy: 'ABYSS' as const,
    playableOuterBoundaryTraceId:
      UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.id,
    exactPlayableOuterBoundaryVertexCount:
      UNDERTOW_VECTOR_TRACES.commonPlayableOuterBoundary.metricPoints.length,
    exactExteriorXZEnvelopeResolved: true,
    internalCyanPolygonsUsedAsKillXZ: false,
    notes:
      'The 42-vertex common hard silhouette is valid exterior-XZ authority. Pass 14E/14F explicitly revoke WATER/KILL semantics from the two cyan source polygons.'
  }),

  verticalAuthority: Object.freeze({
    exactFalloutKillYResolved: false,
    killYProjectMeters: null as number | null,
    numericThresholdPromotionAuthorized: false,
    deriveFromLowestPlayableGeometryAuthorized: false,
    deriveFromWorldBoundsAuthorized: false,
    deriveFromCyanAnnotationAuthorized: false,
    deriveFromHistoricalWaterVisualPlaneAuthorized: false,
    currentRuntimeSchemaHasDedicatedFalloutKillY: false,
    notes:
      'The reconstructed playable vertical model supplies floor/slope elevations, not the original fall-out death plane. Choosing a convenient value below the lowest known floor would still invent gameplay timing and fall distance.'
  }),

  publicSchemaFollowup: Object.freeze({
    mapEditorRepository: 'OctoSquiddy/Splatoon-3-Map-Editor' as const,
    mapEditorSourceCommit:
      '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4' as const,
    genericLocatorPlayerPatchAreaSchemaPresent: true,
    genericNoAirFallParameterPresent: true,
    genericNoAirFallParameterDefinesNumericKillY: false,
    temple01LocatorPlayerPatchAreaPlacementRecovered: false,

    leannyRepository: 'Leanny/splat3' as const,
    leannySourceCommit:
      '7280ff9cde8bb1c5dcef46c700c326471584d2e6' as const,
    observedOutOfBoundDownValue: 5.0,
    observedOutOfBoundDownSource:
      'data/parameter/720/misc/spl__LockerConstant.spl__LockerConstant.json' as const,
    observedOutOfBoundDownScope: 'LOCKER_EDITOR_ONLY' as const,
    lockerOutOfBoundApplicableToVersusStageFallout: false,

    temple01NormalModePlacementBodyRecovered:
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT
        .leannySceneMetadataFollowup.normalModePlacementBodyRecovered,
    publicTemple01PlacementRecoverySucceeded:
      UNDERTOW_WATER_VISUAL_PLANE_AUDIT.publicPlacementRecoverySucceeded,
    notes:
      'The public map-editor schema proves a generic LocatorPlayerPatchArea can carry NoAirFall, but publishes no Temple01 normal-PvP placement/transform that would turn it into a death-plane authority. Leanny exposes OutOfBoundDown=5.0 only inside LockerEditor constants; that value is unrelated to versus-stage fall-out and is explicitly rejected.'
  }),

  rejectedNumericShortcuts: Object.freeze([
    'LOWEST_PLAYABLE_SURFACE_Y',
    'WORLD_BOUNDS',
    'CYAN_SOURCE_ANNOTATION',
    'SUPERSEDED_INTERNAL_WATER_Y',
    'LOCKER_EDITOR_OUT_OF_BOUND_DOWN'
  ] as const),

  requiredEvidenceForClosure: Object.freeze([
    'Current post-Ver.7.2 normal-PvP Temple01 stage-layout/BCETT placement or equivalent original-game data that identifies the fall-out/death detector and its world-space transform/threshold.',
    'Or a controlled current-gameplay fall test whose camera/player trajectory is registered to exact Temple01 geometry strongly enough to recover the splat/respawn trigger Y without perspective guessing.'
  ] as const),

  blockerRetained: 'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING' as const,
  blockerCleared: false,
  runtimeKillVolumePromotionAuthorized: false,
  productionStageActivationAuthorized: false,
  userCaptureRequiredNow: false,
  confidence: 'HIGH' as const,
  notes:
    'Pass 16A resolves the shape of the evidence gap, not the missing number. Exterior Abyss XZ is known from the hard silhouette, but no authoritative current Temple01 fall-out Y is published in the audited source paths. The correct runtime action is therefore to keep the blocker and add no kill plane yet.'
});

export function undertowExteriorFalloutThresholdAuditErrors():
  readonly string[] {
  const a = UNDERTOW_EXTERIOR_FALLOUT_THRESHOLD_AUDIT;
  const errors: string[] = [];

  if (
    a.resolutionPass !== '16A' ||
    a.horizontalAuthority.hazardTaxonomy !== 'ABYSS' ||
    a.horizontalAuthority.exactPlayableOuterBoundaryVertexCount !== 42 ||
    !a.horizontalAuthority.exactExteriorXZEnvelopeResolved ||
    a.horizontalAuthority.internalCyanPolygonsUsedAsKillXZ
  ) {
    errors.push('Pass 16A exterior-XZ authority drifted');
  }

  if (
    !UNDERTOW_INTERNAL_WATER_SEMANTIC_CORRECTION_AUDIT
      .supersession.priorInternalWaterPremiseInvalidated ||
    !UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT
      .resolution.sourceAnnotationOnlyNoRuntimeSurface ||
    UNDERTOW_CYAN_SOURCE_DISPOSITION_AUDIT
      .resolution.exteriorFalloutKillThresholdResolved
  ) {
    errors.push('Pass 16A must preserve Pass 14E/14F water/cyan correction');
  }

  if (
    a.verticalAuthority.exactFalloutKillYResolved ||
    a.verticalAuthority.killYProjectMeters !== null ||
    a.verticalAuthority.numericThresholdPromotionAuthorized ||
    a.verticalAuthority.deriveFromLowestPlayableGeometryAuthorized ||
    a.verticalAuthority.deriveFromWorldBoundsAuthorized ||
    a.verticalAuthority.deriveFromCyanAnnotationAuthorized ||
    a.verticalAuthority.deriveFromHistoricalWaterVisualPlaneAuthorized ||
    a.verticalAuthority.currentRuntimeSchemaHasDedicatedFalloutKillY
  ) {
    errors.push('Pass 16A must not invent a fall-out Y or claim an existing runtime field');
  }

  if (
    !a.publicSchemaFollowup.genericLocatorPlayerPatchAreaSchemaPresent ||
    !a.publicSchemaFollowup.genericNoAirFallParameterPresent ||
    a.publicSchemaFollowup.genericNoAirFallParameterDefinesNumericKillY ||
    a.publicSchemaFollowup.temple01LocatorPlayerPatchAreaPlacementRecovered ||
    a.publicSchemaFollowup.observedOutOfBoundDownValue !== 5 ||
    a.publicSchemaFollowup.observedOutOfBoundDownScope !== 'LOCKER_EDITOR_ONLY' ||
    a.publicSchemaFollowup.lockerOutOfBoundApplicableToVersusStageFallout ||
    a.publicSchemaFollowup.temple01NormalModePlacementBodyRecovered ||
    a.publicSchemaFollowup.publicTemple01PlacementRecoverySucceeded
  ) {
    errors.push('Pass 16A public-schema authority boundary drifted');
  }

  if (
    a.rejectedNumericShortcuts.join(',') !==
      'LOWEST_PLAYABLE_SURFACE_Y,WORLD_BOUNDS,CYAN_SOURCE_ANNOTATION,SUPERSEDED_INTERNAL_WATER_Y,LOCKER_EDITOR_OUT_OF_BOUND_DOWN' ||
    a.requiredEvidenceForClosure.length !== 2
  ) {
    errors.push('Pass 16A evidence-gap localization drifted');
  }

  if (
    a.blockerRetained !== 'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING' ||
    a.blockerCleared ||
    a.runtimeKillVolumePromotionAuthorized ||
    a.productionStageActivationAuthorized ||
    a.userCaptureRequiredNow ||
    !UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.includes(
      'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING'
    ) ||
    PRODUCTION_STAGE_DEFINITION.metadata.id !== 'inkworks-junction'
  ) {
    errors.push('Pass 16A must retain the fall-out blocker and frozen production stage');
  }

  return errors;
}
