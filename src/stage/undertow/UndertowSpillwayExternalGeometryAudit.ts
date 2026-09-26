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
        'SceneInfo identifies Vss_Temple01 as マテガイ放水路（改修後） and preloads Model/Fld_Temple01.bfres. It also identifies Vss_Nagasaki03 / Fld_Nagasaki03 as チョウザメ造船, so Nagasaki03 must not be used as Undertow geometry.'
    },
    {
      id: 'LEANNY_VERSUSSCENEINFO_1130',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'VersusSceneInfo exposes Vss_Temple01 as the stage-list row used for the remodel. TclSceneName references Vss_Temple00, but this field is not treated as geometry or as permission to substitute the pre-remodel model.'
    },
    {
      id: 'LEANNY_LEAGUETYPEINFO_1130',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'LeagueTypeInfo references rule-layer paths such as Work/Banc/BinLayer/Vss_Temple01_Vlf-ModifiedTowerControl.bcett.json, but the referenced BCETT coordinate payload is not present in the inspected public data.'
    },
    {
      id: 'KITRIX_TEMPLE01_MTL',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'The public Vss_Temple01 material file contains Fld_Temple01_* materials including concrete floors, slopes, glass, pillars and ceiling assets consistent with the current Undertow environment. Material names alone do not expose vertex coordinates.'
    },
    {
      id: 'KITRIX_TEMPLE01_OBJ_LFS',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'Vss_Temple01 OBJ parts exist publicly, but the inspected GitHub paths resolve only to Git LFS pointers in the current audit environment. Until actual OBJ vertex bodies are read and registered to the canonical plan, no XZ/Y value may be promoted.'
    },
    {
      id: 'S3_MAP_EDITOR_TEMPLE01_CLASSES',
      confirmsCurrentStageIdentity: true,
      exposesMetricGeometry: false,
      usableForVerticalPromotion: false,
      notes:
        'Splatoon-3-Map-Editor contains Fld_Temple01 and Lft_FldObj_Temple01_* actor classes, but the inspected repository tree contains no Temple01 stage-layout BYML/BCETT payload with placement coordinates.'
    }
  ];

export const UNDERTOW_EXTERNAL_GEOMETRY_NEXT_TARGET = Object.freeze({
  id: 'TEMPLE01_METRIC_PAYLOAD',
  preferredInputs: [
    'actual Vss_Temple01 OBJ vertex bodies from the public KiTrix LFS objects',
    'actual Vss_Temple01 BCETT/BYML stage-layout payload with Translate coordinates',
    'another independently extracted current Fld_Temple01 mesh/collision representation'
  ] as const,
  blocksUserRecapture: true,
  purpose:
    'Resolve side-of-line floor identity and metric Y from current Temple01 geometry before asking the user for another gameplay capture.'
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

  for (const source of UNDERTOW_EXTERNAL_GEOMETRY_SOURCES) {
    if (source.usableForVerticalPromotion && !source.exposesMetricGeometry) {
      errors.push(`${source.id}: vertical promotion requires metric geometry`);
    }
  }

  return errors;
}
