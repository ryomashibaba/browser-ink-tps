export type UndertowExternalGeometrySourceId =
  | 'LEANNY_SCENEINFO_1130'
  | 'LEANNY_VERSUSSCENEINFO_1130'
  | 'LEANNY_LEAGUETYPEINFO_1130'
  | 'KITRIX_TEMPLE01_MTL'
  | 'KITRIX_TEMPLE01_OBJ_LFS'
  | 'S3_MAP_EDITOR_TEMPLE01_CLASSES';

export interface UndertowExternalGeometrySource {
  id: UndertowExternalGeometrySourceId;
  confirmsCurrentStageIdentity: boolean;
  exposesMetricGeometry: boolean;
  usableForVerticalPromotion: boolean;
  notes: string;
}

export const UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY = Object.freeze({
  stageLabel: 'マテガイ放水路（改修後）',
  sceneRowId: 'Vss_Temple01',
  modelResource: 'Model/Fld_Temple01.bfres',
  previousSceneRowId: 'Vss_Temple00',
  previousModelResource: 'Model/Fld_Temple00.bfres',
  explicitlyExcludedSceneIds: ['Vss_Nagasaki03'] as const,
  explicitlyExcludedModelResources: ['Model/Fld_Nagasaki03.bfres'] as const
});

export const UNDERTOW_EXTERNAL_GEOMETRY_SOURCES:
  readonly UndertowExternalGeometrySource[] = [
    {
      id: 'LEANNY_SCENEINFO_1130',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'SceneInfo identifies Vss_Temple01 as マテガイ放水路（改修後） and preloads Model/Fld_Temple01.bfres. It also excludes Nagasaki03 by identifying it as Sturgeon Shipyard.'
    },
    {
      id: 'LEANNY_VERSUSSCENEINFO_1130',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'VersusSceneInfo corroborates the Vss_Temple01 remodel row but does not expose metric vertices.'
    },
    {
      id: 'LEANNY_LEAGUETYPEINFO_1130',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'Rule-layer BCETT path references corroborate Temple01 variant structure; path names alone are not coordinate evidence.'
    },
    {
      id: 'KITRIX_TEMPLE01_MTL',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'Temple01 material names corroborate the remodeled environment and Turf PntSet family, but MTL names alone are not metric geometry.'
    },
    {
      id: 'KITRIX_TEMPLE01_OBJ_LFS',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: true,
      usableForVerticalPromotion: true,
      notes:
        'The branch CI successfully retrieved the 43,263,289-byte Git LFS OBJ body and parsed 375,948 vertices. Common Fld_Temple01 plus Turf PntSet produced 70,396 audit triangles. Promotion is restricted to locally registered landmarks/drop discontinuities verified within 0.163m in the 0.5m raster; the full exterior fit is not blanket registration.'
    },
    {
      id: 'S3_MAP_EDITOR_TEMPLE01_CLASSES',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'Temple01 actor classes corroborate the remodel/rule families but expose no stage placement coordinates by themselves.'
    }
  ];

export const UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET = Object.freeze({
  id: 'REMAINING_T21C_EVIDENCE',
  preferredInputs: [
    'Temple01-local evidence for center slope high-end Y',
    'Temple01-local evidence for the two grate elevations',
    'metric lower-layer geometry for right-low / underpass XZ partition',
    'metric evidence for remaining internal fall-out / void boundaries'
  ] as const,
  blocksUserRecapture: false,
  purpose:
    'Finish the remaining T21-C/T21-B gates after the first-drop/right-drop chain was resolved from the remodeled Temple01 OBJ.'
});

export function undertowExternalGeometryAuditErrors(): readonly string[] {
  const errors: string[] = [];

  if (UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY.sceneRowId !== 'Vss_Temple01') {
    errors.push('current Undertow scene row must remain Vss_Temple01');
  }
  if (UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY.modelResource !== 'Model/Fld_Temple01.bfres') {
    errors.push('current Undertow model resource must remain Model/Fld_Temple01.bfres');
  }
  if (!UNDERTOW_CURRENT_STAGE_ASSET_IDENTITY.explicitlyExcludedSceneIds.includes('Vss_Nagasaki03')) {
    errors.push('Vss_Nagasaki03 must stay explicitly excluded from Undertow geometry');
  }

  const promotable = UNDERTOW_EXTERNAL_GEOMETRY_SOURCES.filter(
    (source) => source.usableForVerticalPromotion
  );
  if (
    promotable.length !== 1 ||
    promotable[0]?.id !== 'KITRIX_TEMPLE01_OBJ_LFS' ||
    !promotable[0].exposesMetricGeometry
  ) {
    errors.push('only the audited Temple01 OBJ may promote locally verified vertical geometry');
  }

  for (const source of UNDERTOW_EXTERNAL_GEOMETRY_SOURCES) {
    if (source.usableForVerticalPromotion && !source.exposesMetricGeometry) {
      errors.push(`${source.id}: vertical promotion requires metric geometry`);
    }
  }

  return errors;
}
