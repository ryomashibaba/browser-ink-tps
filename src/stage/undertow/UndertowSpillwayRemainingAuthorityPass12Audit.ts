import { UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT } from './UndertowSpillwayConnectivityQa';
import { UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT } from './UndertowSpillwayGlassCollisionAuthorityAudit';
import { UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT } from './UndertowSpillwayUnderpassPaintResolutionAudit';
import { UNDERTOW_TURF_SCOREABLE_MASK_AUDIT } from './UndertowSpillwayTurfScoreableMaskAudit';
import { UNDERTOW_WATER_VISUAL_PLANE_AUDIT } from './UndertowSpillwayWaterGeometryAudit';
import { UNDERTOW_WATER_KILL_AUTHORITY_AUDIT } from './UndertowSpillwayWaterKillAuthorityAudit';

const EXPECTED_BLOCKERS = [
  'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
  'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
  'WATER_VISUAL_Y_PENDING',
  'WATER_KILL_THRESHOLD_PENDING',
  'UNKNOWN_PAINT_AUTHORITY_SURFACES_PENDING',
  'TURF_SCOREABLE_MASK_PENDING',
  'FULL_STAGE_CONNECTIVITY_QA_PENDING'
] as const;

/**
 * Resolution Pass 12 is deliberately an authority-acquisition closure pass.
 *
 * It records that the three public repositories used by Pass 11 were rechecked
 * at their current default-branch heads on 2026-09-27 and that those heads are
 * still exactly the commits already pinned by the canonical audits. The wider
 * public-gameplay follow-up recovered semantic corroboration only; it did not
 * recover exact current Temple01 collision/query geometry, controlled
 * under-glass paint evidence, normal/Turf placement bodies, or a Turf victory
 * score mask. Therefore this pass MUST NOT promote runtime state.
 */
export const UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT = Object.freeze({
  resolutionPass: '12' as const,
  auditedAt: '2026-09-27' as const,
  scope: 'LATEST_PUBLIC_AUTHORITY_REVALIDATION' as const,
  sourceHeadRevalidation: Object.freeze({
    kitrix: Object.freeze({
      repository: 'kirakira-dev/KiTrix',
      currentMainHead: '0611f51b35c9736ee986fb2218461e2585b7875e',
      pass11PinnedCommit:
        UNDERTOW_UPPER_GLASS_COLLISION_AUTHORITY_AUDIT.sourceCommit,
      currentMainStillEqualsPinnedCommit: true,
      currentTemple01PublishedAssetFamilies: [
        'Vss_Temple01.obj',
        'Vss_Temple01.mtl',
        'Vss_Temple01_parts',
        'textures'
      ] as const,
      separateOriginalCollisionOrCameraQueryAssetRecovered: false,
      notes:
        'The current KiTrix main tree still exposes the audited Temple01 visual OBJ/MTL/parts/textures path and StageCollider downstream simulator code, but no separate original-game Temple01 collision or camera-query asset was recovered.'
    }),
    leanny: Object.freeze({
      repository: 'Leanny/splat3',
      currentMainHead: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
      pass11PinnedCommit:
        UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.genericDeathLocatorEvidence
          .sourceCommit,
      currentMainStillEqualsPinnedCommit: true,
      latestPublishedSnapshot: '1130' as const,
      temple01ScenePreloadResources: ['Model/Fld_Temple01.bfres'] as const,
      normalOrTurfTemple01PlacementBodyRecovered: false,
      notes:
        'Snapshot 1130 still exposes Vss_Temple01 scene identity/preload metadata and the generic Mpt_PlayerDead definition, but no normal/Turf Temple01 placement body with instance transforms.'
    }),
    mapEditor: Object.freeze({
      repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
      currentMainHead: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
      pass11PinnedCommit:
        UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.publicActorSchemaEvidence
          .sourceCommit,
      currentMainStillEqualsPinnedCommit: true,
      temple01PlacementFileCountInPublishedTree: 0,
      genericPaintAndPlacementSchemasPresent: true,
      temple01SpecificVictoryScoreMaskRecovered: false,
      notes:
        'The current public tree contains generic Temple01 actor classes plus shared placement/paint schemas, but no published Temple01 BCETT/BYML placement body and no Temple01-specific Turf victory-score mask.'
    })
  }),
  acquisitionResults: Object.freeze({
    upperGlass: Object.freeze({
      exactPlayerCollisionBindingRecovered: false,
      exactProjectileCollisionBindingRecovered: false,
      exactCameraQueryBindingRecovered: false,
      exactNavigationBindingRecovered: false,
      controlledBoundaryEvidenceRecovered: false,
      runtimePromotionAuthorized: false,
      remainingEvidenceNeed:
        'Original current Temple01 collision/query data, or controlled post-Ver.7.2 boundary captures registered tightly enough to distinguish Glass01, GlassEdge, BridgeMetal, and any hidden primitive for each query role.'
    }),
    wholeUnderpassPaint: Object.freeze({
      publicTurfPdfReused: false,
      controlledZonesOutsidePaintEvidenceRecovered: false,
      originalPaintMaskOrPerFaceMetadataRecovered: false,
      remainingUnknownRuntimeSolidCount: 2,
      wholeUnderpassPromotionAuthorized: false,
      remainingEvidenceNeed:
        'Controlled current gameplay paint evidence on under-glass floor cells outside the registered Zones intersections, or original paint-mask/per-face metadata registered to the exact underpass footprints.'
    }),
    waterAndDeath: Object.freeze({
      visualWaterYMeters: null,
      killThresholdMeters: null,
      visualWaterYRecovered: false,
      killPlacementRecovered: false,
      genericLocatorPromotedToTemple01Placement: false,
      runtimePromotionAuthorized: false,
      remainingEvidenceNeed:
        'Current normal/Turf Temple01 placement/environment data with transforms, or controlled registered vertical evidence that independently resolves visual Y and death-volume placement.'
    }),
    turfScoreableMask: Object.freeze({
      scoreMaskRecovered: false,
      paintablePromotedToScoreableByInference: false,
      currentScoreablePromotionCount: 0,
      runtimePromotionAuthorized: false,
      remainingEvidenceNeed:
        'Current Temple01 Turf victory-score raster/per-face metadata, or controlled scoring evidence that isolates exact registered floor regions.'
    }),
    connectivity: Object.freeze({
      finalProductionCandidateRecastRunAuthorized: false,
      convenienceLinkAuthorized: false,
      rightLowToUnderpassResolved: false,
      upperGlassNavigationAuthorityResolved: false,
      navigationLinkCountMustRemain: 26,
      remainingEvidenceNeed:
        'Resolve collision/traversal authority first; only then run the final production-candidate Recast QA without guessed links.'
    })
  }),
  runtimeBoundary: Object.freeze({
    activationReady: false,
    runtimeSolidCount: 21,
    paintSurfaceCount: 17,
    navigationLinkCount: 26,
    turfScoreablePromotionCount: 0,
    activationBlockers: EXPECTED_BLOCKERS
  }),
  activationBlockersCleared: [] as const,
  runtimePromotionAuthorized: false,
  confidence: 'HIGH' as const,
  notes:
    'Resolution Pass 12 closes the audited latest-public-source acquisition branches without converting absence of published authority into gameplay assumptions. All seven activation blockers remain. T20 production stays unchanged; T21 remains inert.'
});

export function undertowRemainingAuthorityPass12AuditErrors():
  readonly string[] {
  const audit = UNDERTOW_REMAINING_AUTHORITY_PASS12_AUDIT;
  const errors: string[] = [];

  if (
    audit.sourceHeadRevalidation.kitrix.currentMainHead !==
      audit.sourceHeadRevalidation.kitrix.pass11PinnedCommit ||
    !audit.sourceHeadRevalidation.kitrix.currentMainStillEqualsPinnedCommit
  ) {
    errors.push('KiTrix current main no longer matches the Pass 11 pinned authority source');
  }
  if (
    audit.sourceHeadRevalidation.leanny.currentMainHead !==
      audit.sourceHeadRevalidation.leanny.pass11PinnedCommit ||
    !audit.sourceHeadRevalidation.leanny.currentMainStillEqualsPinnedCommit ||
    audit.sourceHeadRevalidation.leanny.latestPublishedSnapshot !== '1130'
  ) {
    errors.push('Leanny current main/snapshot no longer matches the Pass 11 pinned authority source');
  }
  if (
    audit.sourceHeadRevalidation.mapEditor.currentMainHead !==
      audit.sourceHeadRevalidation.mapEditor.pass11PinnedCommit ||
    !audit.sourceHeadRevalidation.mapEditor.currentMainStillEqualsPinnedCommit ||
    audit.sourceHeadRevalidation.mapEditor.temple01PlacementFileCountInPublishedTree !== 0
  ) {
    errors.push('Map Editor current public placement boundary drifted from the Pass 12 audit');
  }

  if (
    audit.sourceHeadRevalidation.kitrix
      .separateOriginalCollisionOrCameraQueryAssetRecovered ||
    audit.sourceHeadRevalidation.leanny.normalOrTurfTemple01PlacementBodyRecovered ||
    audit.sourceHeadRevalidation.mapEditor
      .temple01SpecificVictoryScoreMaskRecovered
  ) {
    errors.push('Pass 12 source closure unexpectedly claims newly recovered original authority');
  }

  if (
    audit.acquisitionResults.upperGlass.exactPlayerCollisionBindingRecovered ||
    audit.acquisitionResults.upperGlass.exactProjectileCollisionBindingRecovered ||
    audit.acquisitionResults.upperGlass.exactCameraQueryBindingRecovered ||
    audit.acquisitionResults.upperGlass.exactNavigationBindingRecovered ||
    audit.acquisitionResults.upperGlass.controlledBoundaryEvidenceRecovered ||
    audit.acquisitionResults.upperGlass.runtimePromotionAuthorized
  ) {
    errors.push('Pass 12 must not promote unresolved upper-glass authority');
  }

  if (
    audit.acquisitionResults.wholeUnderpassPaint.publicTurfPdfReused ||
    audit.acquisitionResults.wholeUnderpassPaint
      .controlledZonesOutsidePaintEvidenceRecovered ||
    audit.acquisitionResults.wholeUnderpassPaint
      .originalPaintMaskOrPerFaceMetadataRecovered ||
    audit.acquisitionResults.wholeUnderpassPaint.remainingUnknownRuntimeSolidCount !==
      2 ||
    audit.acquisitionResults.wholeUnderpassPaint.wholeUnderpassPromotionAuthorized
  ) {
    errors.push('Pass 12 must preserve the two whole-underpass UNKNOWN solids');
  }

  if (
    audit.acquisitionResults.waterAndDeath.visualWaterYRecovered ||
    audit.acquisitionResults.waterAndDeath.killPlacementRecovered ||
    audit.acquisitionResults.waterAndDeath.visualWaterYMeters !== null ||
    audit.acquisitionResults.waterAndDeath.killThresholdMeters !== null ||
    audit.acquisitionResults.waterAndDeath
      .genericLocatorPromotedToTemple01Placement ||
    audit.acquisitionResults.waterAndDeath.runtimePromotionAuthorized
  ) {
    errors.push('Pass 12 must not invent water/death placement authority');
  }

  if (
    audit.acquisitionResults.turfScoreableMask.scoreMaskRecovered ||
    audit.acquisitionResults.turfScoreableMask
      .paintablePromotedToScoreableByInference ||
    audit.acquisitionResults.turfScoreableMask.currentScoreablePromotionCount !== 0 ||
    audit.acquisitionResults.turfScoreableMask.runtimePromotionAuthorized
  ) {
    errors.push('Pass 12 must keep Turf Scoreable authority unresolved');
  }

  if (
    audit.acquisitionResults.connectivity.finalProductionCandidateRecastRunAuthorized ||
    audit.acquisitionResults.connectivity.convenienceLinkAuthorized ||
    audit.acquisitionResults.connectivity.rightLowToUnderpassResolved ||
    audit.acquisitionResults.connectivity.upperGlassNavigationAuthorityResolved ||
    audit.acquisitionResults.connectivity.navigationLinkCountMustRemain !== 26
  ) {
    errors.push('Pass 12 must not convenience-fill unresolved connectivity');
  }

  if (
    UNDERTOW_UNDERPASS_PAINT_RESOLUTION_AUDIT.runtimeState
      .underpassRecordsRemainUnknown !== true ||
    UNDERTOW_TURF_SCOREABLE_MASK_AUDIT.currentScoreablePromotionsAuthorized !== 0 ||
    UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved ||
    UNDERTOW_WATER_KILL_AUTHORITY_AUDIT.killThresholdResolved ||
    UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.rightLowToUnderpassResolved ||
    UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.upperGlassNavigationAuthorityResolved
  ) {
    errors.push('Pass 12 disagrees with a prerequisite canonical authority audit');
  }

  if (
    audit.activationBlockersCleared.length !== 0 ||
    audit.runtimePromotionAuthorized
  ) {
    errors.push('Pass 12 must clear no blocker and authorize no runtime promotion');
  }

  return errors;
}
