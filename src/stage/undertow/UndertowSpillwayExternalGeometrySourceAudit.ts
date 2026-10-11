export type UndertowExternalGeometrySourceId =
  | 'NINTENDO_POST_7_2_UPDATE_HISTORY'
  | 'LEANNY_TEMPLE_STICK_INDEX'
  | 'LEANNY_TEMPLE01_SCENE_METADATA'
  | 'KITRIX_TEMPLE01_OBJ'
  | 'KITRIX_TEMPLE01_RULE_SET_FILTER'
  | 'KITRIX_STAGE_NAME_MAP'
  | 'OCTOSQUIDDY_TEMPLE01_ACTOR_CLASSES';

export type UndertowExternalGeometrySourceStatus =
  | 'CONFIRMED_VERSION_BOUNDARY'
  | 'REJECTED_WRONG_MODE'
  | 'CONFIRMED_REMODEL_IDENTITY'
  | 'BODY_AUDITED_LOCAL_PROMOTION'
  | 'AUDITED_TURF_FILTER'
  | 'REJECTED_NAME_MAP'
  | 'CORROBORATING_SCHEMA_ONLY';

export interface UndertowExternalGeometrySourceAuditEntry {
  id: UndertowExternalGeometrySourceId;
  status: UndertowExternalGeometrySourceStatus;
  canPromoteCanonicalGeometry: boolean;
  confidence: 'CONFIRMED' | 'HIGH' | 'PROVISIONAL';
  facts: readonly string[];
  blocker?: string;
}

export const UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT:
  readonly UndertowExternalGeometrySourceAuditEntry[] = [
    {
      id: 'NINTENDO_POST_7_2_UPDATE_HISTORY',
      status: 'CONFIRMED_VERSION_BOUNDARY',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH',
      facts: [
        'Nintendo Ver.7.2.0 update history explicitly states that Undertow Spillway terrain changed in all modes.',
        'Later documented Undertow entries through Ver.11.3.0 are bug/rule-behavior fixes rather than another documented terrain redesign.'
      ],
      blocker:
        'Official patch notes establish the documented version boundary, not mesh coordinates; they cannot promote XZ/Y values by themselves.'
    },
    {
      id: 'LEANNY_TEMPLE_STICK_INDEX',
      status: 'REJECTED_WRONG_MODE',
      canPromoteCanonicalGeometry: false,
      confidence: 'CONFIRMED',
      facts: [
        'The page containing Temple_Low / Temple_Mid / Temple_High is titled Salmon Run Pillar Index.',
        'Those images are not normal-PvP floor-height layers and must not seed T21-C Y values.'
      ]
    },
    {
      id: 'LEANNY_TEMPLE01_SCENE_METADATA',
      status: 'CONFIRMED_REMODEL_IDENTITY',
      canPromoteCanonicalGeometry: false,
      confidence: 'CONFIRMED',
      facts: [
        'Leanny commit 458cbf271a161fea78db893aec6ee958e4684121 is explicitly named 7.2.0 update and adds data/mush/720/SceneInfo.json.',
        'That 7.2.0 SceneInfo identifies Vss_Temple01 as マテガイ放水路（改修後）.',
        'Its sequence is Versus and its preload resource is Model/Fld_Temple01.bfres.',
        'Vss_Temple00 is retained separately as the pre-remodel マテガイ放水路 scene.'
      ],
      blocker:
        'Scene metadata proves identity/version intent but contains no mesh vertex coordinates.'
    },
    {
      id: 'KITRIX_TEMPLE01_OBJ',
      status: 'BODY_AUDITED_LOCAL_PROMOTION',
      canPromoteCanonicalGeometry: true,
      confidence: 'HIGH',
      facts: [
        'KiTrix contains stages/Vss_Temple01/Vss_Temple01.obj as a Git LFS object with audited size 43,263,289 bytes.',
        'The GitHub Actions audit successfully retrieved the LFS body and parsed 375,948 vertices.',
        'The common Fld_Temple01 plus Turf PntSet filter produced 70,396 active triangles for local geometry inspection.',
        'Its MTL contains Fld_Temple01 and FldObj_Temple01 material/model names, including PntSet/VarSet/VclSet/VglSet/VlfSet families.',
        'KiTrix Bfres2Obj derives the output folder name by replacing Fld_ with Vss_ on the BFRES input filename.',
        'The converter applies BFRES bone world transforms and then writes X/Y/Z vertex coordinates directly to OBJ without a custom scale or axis swap.',
        'KiTrix StageLoader adds OBJ child nodes directly beneath a new stage node without an extra stage scale, rotation or translation.',
        'The registered first-drop and right-small-drop vector lips matched the expected local OBJ height-discontinuity contours within 0.163m in the 0.5m audit raster.'
      ],
      blocker:
        'Promotion is restricted to locally verified landmarks/drop relations. The full exterior registration has a large p95 residual and must not be used as blanket permission to project arbitrary PDF features onto the OBJ.'
    },
    {
      id: 'KITRIX_TEMPLE01_RULE_SET_FILTER',
      status: 'AUDITED_TURF_FILTER',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH',
      facts: [
        'Temple01 MTL contains five rule-set families: PntSet, VarSet, VclSet, VglSet and VlfSet.',
        'The established Splatoon internal rule-code convention maps cPnt to Turf War, cVar to Splat Zones, cVgl to Rainmaker and cVlf to Tower Control; cVcl denotes Clam Blitz.',
        'The successful Temple01 local audit used common Fld_Temple01 geometry plus PntSet rather than treating every rule-set family as simultaneously active.'
      ],
      blocker:
        'This validates the Turf audit filter, not every rule-specific object activation detail; mode-wide production extraction still requires explicit variant handling.'
    },
    {
      id: 'KITRIX_STAGE_NAME_MAP',
      status: 'REJECTED_NAME_MAP',
      canPromoteCanonicalGeometry: false,
      confidence: 'CONFIRMED',
      facts: [
        'KiTrix StageLoader maps Undertow Spillway to Vss_Nagasaki03 and maps other display names to Vss_Temple00/01.',
        'Leanny SceneInfo independently identifies Vss_Nagasaki03 as Sturgeon Shipyard and Vss_Temple01 as remodeled Undertow Spillway.',
        'The StageLoader display-name map is therefore not trustworthy evidence for stage identity.'
      ]
    },
    {
      id: 'OCTOSQUIDDY_TEMPLE01_ACTOR_CLASSES',
      status: 'CORROBORATING_SCHEMA_ONLY',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH',
      facts: [
        'Splatoon-3-Map-Editor contains actor classes for Fld_Temple01 and Lft_FldObj_Temple01_PntSet/VarSet/VclSet/VglSet/VlfSet.',
        'This independently corroborates that Temple01 has remodel-specific rule-set actor families.'
      ],
      blocker:
        'The public repository exposes actor schemas, not the Undertow Temple01 placement/mesh coordinates required for T21-C.'
    }
  ];

export function undertowExternalGeometrySourceAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const nintendo = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'NINTENDO_POST_7_2_UPDATE_HISTORY'
  );
  const temple01 = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'LEANNY_TEMPLE01_SCENE_METADATA'
  );
  const kitrix = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'KITRIX_TEMPLE01_OBJ'
  );
  const stick = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'LEANNY_TEMPLE_STICK_INDEX'
  );

  if (nintendo?.status !== 'CONFIRMED_VERSION_BOUNDARY') {
    errors.push('Nintendo 7.2+ version boundary must remain explicit');
  }
  if (temple01?.status !== 'CONFIRMED_REMODEL_IDENTITY') {
    errors.push('Temple01 remodel identity must remain confirmed');
  }
  if (kitrix?.status !== 'BODY_AUDITED_LOCAL_PROMOTION' || !kitrix.canPromoteCanonicalGeometry) {
    errors.push('KiTrix Temple01 OBJ must remain locally promotable after the successful body audit');
  }
  if (stick?.status !== 'REJECTED_WRONG_MODE') {
    errors.push('Salmon Run stick index must remain excluded from normal-PvP height reconstruction');
  }
  for (const entry of UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT) {
    if (entry.id !== 'KITRIX_TEMPLE01_OBJ' && entry.canPromoteCanonicalGeometry) {
      errors.push(`${entry.id}: only the locally verified Temple01 OBJ may promote geometry`);
    }
  }
  return errors;
}
