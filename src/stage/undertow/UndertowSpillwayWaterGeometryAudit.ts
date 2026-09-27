export const UNDERTOW_WATER_VISUAL_PLANE_AUDIT = Object.freeze({
  runNumber: 663,
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
    notes:
      'The public editor schema knows explicit water actors for several other stages and generic ocean-simulation concepts, but its published Temple01-specific actor class set contains no explicit Water actor and no Temple01 placement file. Class-schema absence is not authority to declare that Temple01 has no water visual; the missing placement/environment data is the relevant gap.'
  }),
  leannySceneMetadataFollowup: Object.freeze({
    repository: 'Leanny/splat3',
    sourceCommit: '7280ff9cde8bb1c5dcef46c700c326471584d2e6',
    sceneRowId: 'Vss_Temple01',
    modelResource: 'Model/Fld_Temple01.bfres',
    exposesWaterVisualY: false,
    exposesTemple01PlacementTransforms: false,
    notes:
      'Published SceneInfo/VersusSceneInfo corroborate the remodeled Temple01 identity and model resource, but do not publish a water-plane height or the stage-layout placement/environment record needed to derive one.'
  }),
  visualPlaneResolved: false,
  visualPlaneMeters: null,
  killThresholdResolved: false,
  confidence: 'HIGH' as const,
  missingAuthoritativeEvidence: [
    'Current 7.2+ Temple01 stage-layout/environment data that identifies the water/abyss visual actor or ocean/effect transform and its world Y.',
    'Or independently registered in-game visual-plane evidence with enough fixed geometry references to recover the plane Y without perspective guessing.'
  ] as const,
  notes:
    'CI #663 found zero obvious named horizontal water-mesh coverage inside the exact mapped cyan hazard polygons. Follow-up public source auditing shows that the available Temple01 OBJ, SceneInfo metadata, and actor-class schema do not expose a visual-water Y or the missing placement/environment transform. WATER_VISUAL_Y_PENDING therefore remains unresolved; no convenience plane is promoted. WATER_KILL_THRESHOLD_PENDING is intentionally a separate blocker and is not evaluated by this audit.'
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
  if (!audit.publicLayoutSchemaFollowup.oceanSimulationSchemaPresent) {
    errors.push('public editor schema no longer records generic ocean-simulation support');
  }
  if (audit.leannySceneMetadataFollowup.exposesWaterVisualY) {
    errors.push('Leanny scene metadata unexpectedly claims water visual Y authority');
  }
  if (audit.leannySceneMetadataFollowup.exposesTemple01PlacementTransforms) {
    errors.push('Leanny scene metadata unexpectedly claims Temple01 placement transforms');
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
