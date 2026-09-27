export const UNDERTOW_WATER_VISUAL_PLANE_AUDIT = Object.freeze({
  runNumber: 663,
  resolutionPass: '9B' as const,
  sourceTarget: 'CURRENT_POST_VER_7_2_NORMAL_PVP' as const,
  teamA: Object.freeze({
    vectorPolygonRasterCells: 1954,
    temple01WaterSurfaceCells: 0,
    coverage: 0
  }),
  teamB: Object.freeze({
    vectorPolygonRasterCells: 1953,
    temple01WaterSurfaceCells: 0,
    coverage: 0
  }),
  sourceMeshAudit: Object.freeze({
    source: 'KiTrix Vss_Temple01 common + Turf PntSet OBJ',
    scanHeuristic:
      'Horizontal faces whose object/material names contain Water, Sea, or River.',
    exactMappedWaterPolygonCoverage: 0,
    establishesVisualWaterAbsence: false,
    notes:
      'Zero named-mesh coverage proves that the audited Temple01 OBJ does not expose an obvious named horizontal water surface over the mapped cyan polygons. It does not prove that the original game has no rendered water/abyss effect, because rendering may come from stage-layout actors, environment/ocean simulation, shaders, or resources not represented as an OBJ face.'
  }),
  publicLayoutSchemaFollowup: Object.freeze({
    repository: 'OctoSquiddy/Splatoon-3-Map-Editor',
    sourceCommit: '0e3c66d28b58f7b43df7cdfb6c34514e0ebc1fd4',
    temple01SpecificActorClasses: [
      'Fld_Temple01',
      'Lft_FldObj_Temple01_PntSet',
      'Lft_FldObj_Temple01_VarSet',
      'Lft_FldObj_Temple01_VclSet',
      'Lft_FldObj_Temple01_VglSet',
      'Lft_FldObj_Temple01_VlfSet'
    ] as const,
    temple01SpecificWaterActorClassPresent: false,
    explicitWaterActorExamplesForOtherStages: [
      'Lft_FldObj_Jyoheki03_Water',
      'DObj_FldObj_Section00_Water',
      'DObj_FldObj_Section01_Water',
      'Lft_FldObj_HiagariWater'
    ] as const,
    oceanSimulationSchemaPresent: true,
    placementDataForTemple01PresentInPublishedSchemaRepository: false,
    temple01LiftVariantClassCount: 5,
    temple01LiftVariantClasses: [
      'Lft_FldObj_Temple01_PntSet',
      'Lft_FldObj_Temple01_VarSet',
      'Lft_FldObj_Temple01_VclSet',
      'Lft_FldObj_Temple01_VglSet',
      'Lft_FldObj_Temple01_VlfSet'
    ] as const,
    actorPlacementTransformFields: ['Translate', 'Rotate', 'Scale'] as const,
    actorPlacementTransformSchemaPresent: true,
    referencedTemple01RuleBinLayer:
      'Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json',
    referencedTemple01RuleBinLayerScope:
      'TOWER_CONTROL_MODIFIER_REFERENCE_ONLY' as const,
    referencedTemple01RuleBinLayerContentsPublished: false,
    notes:
      'Resolution Pass 9B exhausts the audited public class-schema path more precisely. The public editor schema knows explicit water actors for several other stages and generic ocean-simulation concepts, but the Temple01-specific class family is Fld_Temple01 plus five Pnt/Var/Vcl/Vgl/Vlf lift variants, with no explicit Temple01 Water class. Mu/SpatialObject placement carries Translate/Rotate/Scale, so an actual Temple01 BCETT instance body would be sufficient to provide a transform if it named the water/effect actor. Public metadata references a Temple01 Vlf Tower-Control modifier BCETT path, but the referenced file body is not published there and that modifier path is not normal-Turf water authority. Class-schema absence therefore remains non-authoritative proof of visual-water absence.'
  }),
  leannySceneMetadataFollowup: Object.freeze({
    repository: 'Leanny/splat3',
    sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
    sceneRowId: 'Vss_Temple01',
    modelResource: 'Model/Fld_Temple01.bfres',
    dataSnapshot: '920',
    preloadResources: ['Model/Fld_Temple01.bfres'] as const,
    preloadContainsExplicitWaterResource: false,
    exposesWaterVisualY: false,
    exposesTemple01PlacementTransforms: false,
    exposesNormalModeBcettBody: false,
    notes:
      'The published 920 SceneInfo row for Vss_Temple01 (remodeled Undertow) preloads Model/Fld_Temple01.bfres and does not expose a water-plane transform or a normal-mode stage-layout body. VersusSceneInfo supplies stage identity metadata, not placement transforms. This narrows the missing authority to the unpublished/current placement-environment data rather than the already-audited visual OBJ.'
  }),
  visualPlaneResolved: false,
  visualPlaneMeters: null,
  killThresholdResolved: false,
  confidence: 'HIGH' as const,
  publicPlacementRecoverySucceeded: false,
  missingAuthoritativeEvidence: [
    'Current post-Ver.7.2 Temple01 common/Turf stage-layout or environment placement body that identifies the water/abyss visual actor, ocean/effect primitive, or equivalent and supplies its Translate/Rotate/Scale/world-Y transform.',
    'Or independently registered current normal-PvP in-game visual-plane evidence with enough fixed Temple01 geometry references to recover the plane Y without perspective guessing.'
  ] as const,
  notes:
    'Resolution Pass 9B closes the public-source discovery branch without inventing a value. CI #663 found zero obvious named horizontal water-mesh coverage inside the exact mapped cyan hazard polygons. The audited current SceneInfo exposes only Fld_Temple01.bfres as the remodeled-stage preload, the public Temple01 actor-class family contains no explicit Water class, and the public schema shows that the missing BCETT instance body would carry Translate/Rotate/Scale if available. WATER_VISUAL_Y_PENDING therefore remains unresolved with visualPlaneMeters=null; WATER_KILL_THRESHOLD_PENDING remains a separate blocker.'
});

export function undertowWaterVisualPlaneAuditErrors(): readonly string[] {
  const audit = UNDERTOW_WATER_VISUAL_PLANE_AUDIT;
  const a = audit.teamA;
  const b = audit.teamB;
  const errors: string[] = [];
  if (a.temple01WaterSurfaceCells !== 0 || b.temple01WaterSurfaceCells !== 0) {
    errors.push('water audit unexpectedly contains Temple01 visual-water cells');
  }
  if (audit.sourceMeshAudit.establishesVisualWaterAbsence) {
    errors.push('named OBJ scan must not claim proof that the original visual water is absent');
  }
  if (audit.publicLayoutSchemaFollowup.temple01SpecificWaterActorClassPresent) {
    errors.push('published Temple01 schema unexpectedly claims a stage-specific Water actor');
  }
  if (audit.publicLayoutSchemaFollowup.placementDataForTemple01PresentInPublishedSchemaRepository) {
    errors.push('published schema repository unexpectedly claims Temple01 placement authority');
  }
  if (
    audit.publicLayoutSchemaFollowup.temple01LiftVariantClassCount !== 5 ||
    audit.publicLayoutSchemaFollowup.temple01LiftVariantClasses.length !== 5 ||
    !audit.publicLayoutSchemaFollowup.actorPlacementTransformSchemaPresent ||
    audit.publicLayoutSchemaFollowup.actorPlacementTransformFields.join(',') !==
      'Translate,Rotate,Scale' ||
    audit.publicLayoutSchemaFollowup.referencedTemple01RuleBinLayerScope !==
      'TOWER_CONTROL_MODIFIER_REFERENCE_ONLY' ||
    audit.publicLayoutSchemaFollowup.referencedTemple01RuleBinLayerContentsPublished
  ) {
    errors.push('Pass 9B Temple01 public placement-schema localization drifted');
  }
  if (!audit.publicLayoutSchemaFollowup.oceanSimulationSchemaPresent) {
    errors.push('public editor schema no longer records generic ocean-simulation support');
  }
  if (audit.leannySceneMetadataFollowup.exposesWaterVisualY) {
    errors.push('Leanny scene metadata unexpectedly claims water visual Y authority');
  }
  if (
    audit.leannySceneMetadataFollowup.exposesTemple01PlacementTransforms ||
    audit.leannySceneMetadataFollowup.exposesNormalModeBcettBody ||
    audit.leannySceneMetadataFollowup.preloadContainsExplicitWaterResource ||
    audit.leannySceneMetadataFollowup.preloadResources.length !== 1 ||
    audit.leannySceneMetadataFollowup.preloadResources[0] !==
      'Model/Fld_Temple01.bfres'
  ) {
    errors.push('Leanny current SceneInfo unexpectedly claims Temple01 water/placement authority');
  }
  if (audit.publicPlacementRecoverySucceeded) {
    errors.push('Pass 9B must not claim recovery of unpublished Temple01 water placement');
  }
  if (audit.visualPlaneResolved || audit.visualPlaneMeters !== null) {
    errors.push('water visual plane must remain unresolved after the source-gap audit');
  }
  if (audit.killThresholdResolved) {
    errors.push('water kill threshold must not be inferred from the visual-plane audit');
  }
  if (audit.missingAuthoritativeEvidence.length < 1) {
    errors.push('water visual-Y evidence gap must remain explicitly localized');
  }
  return errors;
}
