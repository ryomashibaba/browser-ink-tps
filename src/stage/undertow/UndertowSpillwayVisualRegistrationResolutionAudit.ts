import type { StageTriangleMeshGeometry, StageVector3 } from '../StageDefinition';
import { UNDERTOW_VECTOR_BLUEPRINT_SOURCE, UNDERTOW_VECTOR_TRACES } from './UndertowSpillwayVectorBlueprint';
import { UNDERTOW_UPPER_GLASS_SOURCE_MESHES } from './UndertowSpillwayUpperGlassMeshGeometry';

interface UpwardSurfaceComponent {
  triangleCount: number;
  areaSquareMeters: number;
  minY: number;
  maxY: number;
}

function upwardSurfaceComponents(
  mesh: StageTriangleMeshGeometry,
  minNormalY = 0.1
): readonly UpwardSurfaceComponent[] {
  type Tri = {
    id: number;
    indices: readonly [number, number, number];
    area: number;
    normalY: number;
    minY: number;
    maxY: number;
  };

  const triangles: Tri[] = [];
  for (let offset = 0; offset < mesh.indices.length; offset += 3) {
    const ids = [
      mesh.indices[offset]!,
      mesh.indices[offset + 1]!,
      mesh.indices[offset + 2]!
    ] as const;
    const [a, b, c] = ids.map((id) => mesh.vertices[id]!) as unknown as [
      StageVector3,
      StageVector3,
      StageVector3
    ];
    const ab: StageVector3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac: StageVector3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nx = ab[1] * ac[2] - ab[2] * ac[1];
    const ny = ab[2] * ac[0] - ab[0] * ac[2];
    const nz = ab[0] * ac[1] - ab[1] * ac[0];
    const length = Math.hypot(nx, ny, nz);
    if (length === 0) continue;
    triangles.push({
      id: offset / 3,
      indices: ids,
      area: length / 2,
      normalY: ny / length,
      minY: Math.min(a[1], b[1], c[1]),
      maxY: Math.max(a[1], b[1], c[1])
    });
  }

  const selected = triangles.filter((triangle) => triangle.normalY > minNormalY);
  const edgeOwners = new Map<string, number[]>();
  const byId = new Map(selected.map((triangle) => [triangle.id, triangle]));
  for (const triangle of selected) {
    const [a, b, c] = triangle.indices;
    for (const [left, right] of [[a, b], [b, c], [c, a]] as const) {
      const key = left < right ? `${left},${right}` : `${right},${left}`;
      const owners = edgeOwners.get(key) ?? [];
      owners.push(triangle.id);
      edgeOwners.set(key, owners);
    }
  }

  const adjacency = new Map(selected.map((triangle) => [triangle.id, new Set<number>()]));
  for (const owners of edgeOwners.values()) {
    if (owners.length < 2) continue;
    for (const left of owners) {
      for (const right of owners) {
        if (left !== right) adjacency.get(left)!.add(right);
      }
    }
  }

  const seen = new Set<number>();
  const components: UpwardSurfaceComponent[] = [];
  for (const triangle of selected) {
    if (seen.has(triangle.id)) continue;
    const stack = [triangle.id];
    const component: Tri[] = [];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const current = byId.get(id);
      if (!current) continue;
      component.push(current);
      for (const neighbor of adjacency.get(id) ?? []) stack.push(neighbor);
    }
    components.push({
      triangleCount: component.length,
      areaSquareMeters: component.reduce((sum, item) => sum + item.area, 0),
      minY: Math.min(...component.map((item) => item.minY)),
      maxY: Math.max(...component.map((item) => item.maxY))
    });
  }
  return components.sort((a, b) => b.areaSquareMeters - a.areaSquareMeters);
}

const positiveUpward = upwardSurfaceComponents(UNDERTOW_UPPER_GLASS_SOURCE_MESHES[0]!.mesh);
const negativeUpward = upwardSurfaceComponents(UNDERTOW_UPPER_GLASS_SOURCE_MESHES[1]!.mesh);

export const UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT = Object.freeze({
  round: 3,
  scope: 'CURRENT_LAYOUT_VISUAL_REGISTRATION' as const,
  runtimePromotionAuthorized: false,
  activationBlockersCleared: [] as const,
  historicalActivationBlockerCountAtPass: 7,
  sunfishAuthorLegend: Object.freeze({
    sourceLabel: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.label,
    sourceUpdated: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.sourceUpdated,
    postVer720: true,
    lightBlueLegendMeaningJapanese: '水没してしまうところ',
    lightBlueMeaning: 'SUBMERGE_AREA' as const,
    undertowPublishesWithWaterNotationVariant: true,
    undertowPublishesWithoutWaterNotationVariant: true,
    waterSemanticAuthorConfirmed: true,
    numericWaterVisualYProvided: false,
    notes:
      'The blueprint author explicitly defines light blue as an area where the player submerges. This confirms the WATER_CYAN gameplay semantic used by the project, but the drawing remains planimetric and does not provide a rendered water/effect height.'
  }),
  hazardRegistration: Object.freeze({
    teamASourceClass: UNDERTOW_VECTOR_TRACES.teamAWaterRegion.sourceClass,
    teamBSourceClass: UNDERTOW_VECTOR_TRACES.teamBWaterRegion.sourceClass,
    exactXzHazardPolygonsRemainAuthoritative: true,
    gameplaySubmergeSemanticResolved: true,
    publicAbyssTaxonomyIsCompatibleClassification: true,
    renderedSurfaceOrEffectKindResolved: false,
    renderedVisualYResolved: false,
    killThresholdResolved: false,
    notes:
      'Inkipedia classifying Undertow under Abyss is treated as a gameplay hazard taxonomy, not evidence that the author water/submerge annotation is wrong. The remaining blocker is vertical/render/death authority, not XZ hazard semantics.'
  }),
  currentGlassPlatformFamily: Object.freeze({
    exactSourceObject: UNDERTOW_UPPER_GLASS_SOURCE_MESHES[0]!.sourceObject,
    sourceXzFamilyAlreadyRegistered: true,
    currentLayoutGuideCallsStructureUninkableGlass: true,
    currentLayoutGuideCallsStructureTransparentPlatform: true,
    currentLayoutGuideConfirmsPassThroughSpaceBelow: true,
    platformFamilyStandabilitySemanticsResolved: true,
    exactWalkableFaceSubsetResolved: false,
    exactPlayerCollisionFaceSubsetResolved: false,
    exactProjectileCollisionFaceSubsetResolved: false,
    exactCameraQueryFaceSubsetResolved: false,
    navigationPromotionAuthorized: false,
    notes:
      'Current-layout guides independently describe the remodeled structure as uninkable glass / a transparent platform with pass-through space below. This resolves family-level platform semantics. It does not identify which Glass01/BridgeMetal triangles are the player-support collision surface.'
  }),
  glassMeshTopology: Object.freeze({
    positiveUpwardComponents: positiveUpward,
    negativeUpwardComponents: negativeUpward,
    positiveUpwardComponentCount: positiveUpward.length,
    negativeUpwardComponentCount: negativeUpward.length,
    wholeGlassShellIsSingleWalkableSurface: false,
    notes:
      'At normalY > 0.1, each exact Glass01 side decomposes into multiple disconnected upward-facing surface components. Therefore family-level platform semantics cannot be converted into whole-shell collision/navigation.'
  }),
  registrationLimits: Object.freeze({
    tacticalMapsAreMetricAuthority: false,
    publicPerspectiveImagesHaveRegisteredCameraPose: false,
    exactGlassFaceRegistrationAchieved: false,
    numericHazardYRegistrationAchieved: false,
    notes:
      'Public current-layout maps/images are useful topology/semantic corroboration only. Without camera pose or stage-layout transforms they cannot recover exact triangle collision or a numeric hazard plane.'
  }),
  nextResolutionTargets: [
    'Find a current-layout source or capture that shows a player standing/traversing on the registered glass structure with enough landmarks to identify the exact upper Glass01/BridgeMetal support subset.',
    'Find a current-layout hazard view with fixed registered geometry crossing the light-blue XZ polygon so a visual surface/effect Y can be bounded without guessing perspective.',
    'Find death/submerge crossing evidence or a Temple01 Mpt_PlayerDead placement before promoting any kill threshold.'
  ] as const,
  notes:
    'Resolution Pass 3 resolves two semantic ambiguities: WATER_CYAN is author-confirmed submerge semantics, and the current upper-glass family is a transparent/uninkable platform with traversable space below. No face-level collision, navigation, visual hazard Y, or kill threshold is promoted.'
});

export function undertowVisualRegistrationResolutionAuditErrors(): readonly string[] {
  const audit = UNDERTOW_VISUAL_REGISTRATION_RESOLUTION_AUDIT;
  const errors: string[] = [];

  if (audit.runtimePromotionAuthorized || audit.activationBlockersCleared.length !== 0) {
    errors.push('visual registration pass must not authorize runtime promotion or clear blockers');
  }
  if (
    !audit.sunfishAuthorLegend.waterSemanticAuthorConfirmed ||
    audit.sunfishAuthorLegend.lightBlueMeaning !== 'SUBMERGE_AREA' ||
    audit.sunfishAuthorLegend.numericWaterVisualYProvided
  ) {
    errors.push('Sunfish author legend must confirm submerge semantics without inventing numeric water Y');
  }
  if (
    !audit.hazardRegistration.exactXzHazardPolygonsRemainAuthoritative ||
    !audit.hazardRegistration.gameplaySubmergeSemanticResolved ||
    !audit.hazardRegistration.publicAbyssTaxonomyIsCompatibleClassification ||
    audit.hazardRegistration.renderedSurfaceOrEffectKindResolved ||
    audit.hazardRegistration.renderedVisualYResolved ||
    audit.hazardRegistration.killThresholdResolved
  ) {
    errors.push('hazard semantic resolution must remain separate from vertical/render/kill authority');
  }
  if (
    !audit.currentGlassPlatformFamily.platformFamilyStandabilitySemanticsResolved ||
    audit.currentGlassPlatformFamily.exactWalkableFaceSubsetResolved ||
    audit.currentGlassPlatformFamily.exactPlayerCollisionFaceSubsetResolved ||
    audit.currentGlassPlatformFamily.exactProjectileCollisionFaceSubsetResolved ||
    audit.currentGlassPlatformFamily.exactCameraQueryFaceSubsetResolved ||
    audit.currentGlassPlatformFamily.navigationPromotionAuthorized
  ) {
    errors.push('current glass platform family semantics must not become face-level collision/navigation authority');
  }
  if (
    audit.glassMeshTopology.positiveUpwardComponentCount !== 4 ||
    audit.glassMeshTopology.negativeUpwardComponentCount !== 4 ||
    audit.glassMeshTopology.wholeGlassShellIsSingleWalkableSurface
  ) {
    errors.push('exact current Glass01 must remain recognized as multiple upward surface components');
  }
  if (
    audit.registrationLimits.tacticalMapsAreMetricAuthority ||
    audit.registrationLimits.publicPerspectiveImagesHaveRegisteredCameraPose ||
    audit.registrationLimits.exactGlassFaceRegistrationAchieved ||
    audit.registrationLimits.numericHazardYRegistrationAchieved
  ) {
    errors.push('public visual references must not be promoted beyond their registration authority');
  }
  if (audit.historicalActivationBlockerCountAtPass !== 7) {
    errors.push('Resolution Pass 3 historical blocker snapshot must remain seven');
  }

  return errors;
}
