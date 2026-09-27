import type { StageTriangleMeshGeometry, StageVector3 } from '../StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from './UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';
import { UNDERTOW_UPPER_GLASS_SOURCE_MESHES } from './UndertowSpillwayUpperGlassMeshGeometry';

interface TriangleOrientationSummary {
  triangleCount: number;
  nearHorizontalCount: number;
  upwardNearHorizontalCount: number;
  downwardNearHorizontalCount: number;
  distinctNearHorizontalY: readonly number[];
}

function orientationSummary(
  mesh: StageTriangleMeshGeometry
): TriangleOrientationSummary {
  let nearHorizontalCount = 0;
  let upwardNearHorizontalCount = 0;
  let downwardNearHorizontalCount = 0;
  const yValues = new Set<number>();

  for (let i = 0; i < mesh.indices.length; i += 3) {
    const a = mesh.vertices[mesh.indices[i]!]!;
    const b = mesh.vertices[mesh.indices[i + 1]!]!;
    const c = mesh.vertices[mesh.indices[i + 2]!]!;
    const ab: StageVector3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac: StageVector3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nx = ab[1] * ac[2] - ab[2] * ac[1];
    const ny = ab[2] * ac[0] - ab[0] * ac[2];
    const nz = ab[0] * ac[1] - ab[1] * ac[0];
    const length = Math.hypot(nx, ny, nz);
    if (length === 0) continue;
    const normalizedY = ny / length;
    if (Math.abs(normalizedY) <= 0.98) continue;

    nearHorizontalCount++;
    if (normalizedY > 0) upwardNearHorizontalCount++;
    else downwardNearHorizontalCount++;

    const minY = Math.min(a[1], b[1], c[1]);
    const maxY = Math.max(a[1], b[1], c[1]);
    if (Math.abs(maxY - minY) <= 0.000001) {
      yValues.add(Number(minY.toFixed(3)));
    }
  }

  return {
    triangleCount: mesh.indices.length / 3,
    nearHorizontalCount,
    upwardNearHorizontalCount,
    downwardNearHorizontalCount,
    distinctNearHorizontalY: [...yValues].sort((a, b) => a - b)
  };
}

const positiveGlassOrientation = orientationSummary(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES[0]!.mesh
);
const negativeGlassOrientation = orientationSummary(
  UNDERTOW_UPPER_GLASS_SOURCE_MESHES[1]!.mesh
);

export const UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT = Object.freeze({
  round: 2,
  scope: 'PUBLIC_GAMEPLAY_AND_DOCUMENTATION' as const,
  runtimePromotionAuthorized: false,
  activationBlockersCleared: [] as const,
  officialEvidence: Object.freeze({
    nintendoVer720TerrainChange: Object.freeze({
      authority: 'OFFICIAL' as const,
      currentLayoutRelevant: true,
      finding:
        'Nintendo Ver.7.2.0 notes state that Undertow Spillway terrain changed in all modes.',
      resolvesExactCollisionOrHazardGeometry: false
    }),
    nintendoVer200GlassFloorBugfix: Object.freeze({
      authority: 'OFFICIAL' as const,
      currentLayoutRelevant: false,
      finding:
        'Nintendo Ver.2.0.0 notes describe players standing on an Undertow Spillway glass floor while fixing damage passing from the other side.',
      provesUndertowHasPlayerStandableGlassFloorSemanticsHistorically: true,
      provesCurrentTemple01Glass01Identity: false,
      provesCurrentCollisionFaceSubset: false,
      provesProjectileQueryRules: false
    })
  }),
  currentLayoutSecondaryEvidence: Object.freeze({
    inikipediaVer720Remodel: Object.freeze({
      authority: 'SECONDARY_CURRENT_LAYOUT' as const,
      reportsUninkableGlassBelowRightDropLedge: true,
      reportsTunnelBelowSnipeArea: true,
      reportsHazardAsAbyssOnly: true,
      notes:
        'Useful current-layout corroboration, but not original collision/query or actor-placement authority.'
    }),
    inikipediaHazardTaxonomy: Object.freeze({
      distinguishesWaterAndAbyss: true,
      undertowListsWaterHazard: false,
      undertowListsAbyssHazard: true,
      canOverrideAuthorVectorSemantic: false,
      taxonomyIsNotVisualWaterAuthority: true,
      notes:
        'The public wiki uses Abyss as a stage-hazard category. Resolution Pass 3 separately confirms that the Sunfish blueprint author explicitly defines light blue as a submerge area. These statements are different classification scopes and are not treated as a contradiction.'
    }),
    remodelDayCommunityReport: Object.freeze({
      authority: 'COMMUNITY_CURRENT_LAYOUT' as const,
      reportsGlassFloorMovedFartherBack: true,
      canResolveExactSourceMeshIdentity: false,
      notes:
        'A same-day remodel discussion calls the changed structure a glass floor, which supports floor semantics but is not sufficient for source-face collision authority.'
    })
  }),
  exactCurrentGlassMeshFollowup: Object.freeze({
    sourceObject: UNDERTOW_UPPER_GLASS_SOURCE_MESHES[0]!.sourceObject,
    positive: positiveGlassOrientation,
    negative: negativeGlassOrientation,
    playerStandingSurfaceSemanticsCorroborated: true,
    exactPlayerCollisionFaceSubsetResolved: false,
    exactProjectileCollisionFaceSubsetResolved: false,
    exactCameraQueryFaceSubsetResolved: false,
    navigationPromotionAuthorized: false,
    notes:
      'The current Glass01 shell contains multiple upward and downward near-horizontal surfaces at several Y bands. Public evidence that Undertow uses a glass floor therefore does not justify making the entire Glass01 shell collidable or walkable.'
  }),
  hazardSemanticFollowup: Object.freeze({
    authorVectorSourceClassA: UNDERTOW_VECTOR_TRACES.teamAWaterRegion.sourceClass,
    authorVectorSourceClassB: UNDERTOW_VECTOR_TRACES.teamBWaterRegion.sourceClass,
    authorVectorSemanticSaysWaterCyan: true,
    authorLegendExplicitlyDefinesLightBlueAsSubmergeArea: true,
    publicCurrentStageTaxonomySaysAbyssOnly: true,
    taxonomyScopeMismatchResolved: true,
    gameplaySubmergeSemanticResolved: true,
    renderedHazardAppearanceResolved: false,
    visualPlanePromotionAuthorized: false,
    killThresholdPromotionAuthorized: false,
    notes:
      'The post-Ver.7.2 Sunfish source explicitly defines light blue as an area where the player submerges and publishes Undertow variants with and without that water notation. Inkipedia\'s Abyss label is therefore retained only as its gameplay hazard taxonomy, not as a contradiction or visual-plane override. No numeric visual Y or kill Y is promoted.'
  }),
  connectivityCorroboration: Object.freeze({
    publicCurrentLayoutReportsTunnelBelowSnipeArea: true,
    existingCaptureAlreadyProvesUnderpassTraversalTopology: true,
    newOffMeshLinkAuthorized: false,
    notes:
      'The public remodel description corroborates the underpass/tunnel topology already proven by project capture evidence, but it supplies no traversal type or exact right-low-to-underpass connector geometry.'
  }),
  remainingEvidenceBoundary: Object.freeze({
    upperGlass:
      'Need current-layout evidence registered to the exact Glass01/BridgeMetal source that identifies the player/projectile/camera collision subset. Generic glass-floor semantics are now corroborated but not face-resolved.',
    hazardVisual:
      'The WATER_CYAN gameplay/submerge semantic is now author-confirmed. Still need registered current-layout visual evidence or stage-layout/environment placement to determine the rendered hazard surface/effect and any numeric visual Y.',
    killThreshold:
      'Need current-layout death-volume placement or a controlled vertical crossing/death observation registered to fixed geometry.',
    connectivity:
      'Need authoritative connector geometry/traversal semantics for both right-low-to-underpass sides before final production-candidate Recast QA.'
  }),
  notes:
    'Resolution Pass 2 strengthens semantic corroboration without clearing any activation blocker. Resolution Pass 3 supersedes the earlier water-versus-Abyss conflict wording: WATER_CYAN remains author-confirmed submerge semantics, while rendered visual Y remains unresolved. Public gameplay/documentation is still insufficient to safely promote current Glass01 collision, projectile/camera queries, visual hazard Y, kill Y, or a right-low-to-underpass link.'
});

export function undertowPublicGameplayResolutionAuditErrors(): readonly string[] {
  const audit = UNDERTOW_PUBLIC_GAMEPLAY_RESOLUTION_AUDIT;
  const errors: string[] = [];

  if (audit.runtimePromotionAuthorized || audit.activationBlockersCleared.length !== 0) {
    errors.push('public gameplay resolution pass must not authorize runtime promotion or clear blockers');
  }
  if (
    !audit.officialEvidence.nintendoVer200GlassFloorBugfix
      .provesUndertowHasPlayerStandableGlassFloorSemanticsHistorically ||
    audit.officialEvidence.nintendoVer200GlassFloorBugfix
      .provesCurrentTemple01Glass01Identity ||
    audit.officialEvidence.nintendoVer200GlassFloorBugfix
      .provesCurrentCollisionFaceSubset ||
    audit.officialEvidence.nintendoVer200GlassFloorBugfix
      .provesProjectileQueryRules
  ) {
    errors.push('historical official glass-floor evidence scope drifted');
  }

  for (const side of [
    audit.exactCurrentGlassMeshFollowup.positive,
    audit.exactCurrentGlassMeshFollowup.negative
  ]) {
    if (
      side.triangleCount !== 102 ||
      side.nearHorizontalCount !== 24 ||
      side.upwardNearHorizontalCount !== 12 ||
      side.downwardNearHorizontalCount !== 12
    ) {
      errors.push('current Glass01 orientation inventory drifted');
    }
    if (side.distinctNearHorizontalY.length < 5) {
      errors.push('Glass01 must remain recognized as a multi-level shell rather than one flat floor');
    }
  }

  if (
    audit.exactCurrentGlassMeshFollowup.exactPlayerCollisionFaceSubsetResolved ||
    audit.exactCurrentGlassMeshFollowup.exactProjectileCollisionFaceSubsetResolved ||
    audit.exactCurrentGlassMeshFollowup.exactCameraQueryFaceSubsetResolved ||
    audit.exactCurrentGlassMeshFollowup.navigationPromotionAuthorized
  ) {
    errors.push('public floor semantics must not become exact current Glass01 collision/navigation authority');
  }

  if (
    !audit.hazardSemanticFollowup.authorVectorSemanticSaysWaterCyan ||
    !audit.hazardSemanticFollowup.authorLegendExplicitlyDefinesLightBlueAsSubmergeArea ||
    !audit.hazardSemanticFollowup.publicCurrentStageTaxonomySaysAbyssOnly ||
    !audit.hazardSemanticFollowup.taxonomyScopeMismatchResolved ||
    !audit.hazardSemanticFollowup.gameplaySubmergeSemanticResolved ||
    audit.hazardSemanticFollowup.renderedHazardAppearanceResolved ||
    audit.hazardSemanticFollowup.visualPlanePromotionAuthorized ||
    audit.hazardSemanticFollowup.killThresholdPromotionAuthorized
  ) {
    errors.push('author-confirmed submerge semantics must remain separate from unresolved rendered hazard Y/kill authority');
  }

  if (audit.connectivityCorroboration.newOffMeshLinkAuthorized) {
    errors.push('public tunnel corroboration must not authorize a new navigation link');
  }

  if (UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationBlockers.length !== 7) {
    errors.push('Resolution Pass 2 must preserve all seven activation blockers');
  }

  return errors;
}
