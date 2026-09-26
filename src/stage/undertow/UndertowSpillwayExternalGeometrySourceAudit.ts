export type UndertowExternalGeometrySourceId =
  | 'LEANNY_TEMPLE_STICK_INDEX'
  | 'LEANNY_TEMPLE01_SCENE_METADATA'
  | 'KITRIX_TEMPLE01_OBJ'
  | 'KITRIX_STAGE_NAME_MAP'
  | 'OCTOSQUIDDY_TEMPLE01_ACTOR_CLASSES';

export type UndertowExternalGeometrySourceStatus =
  | 'REJECTED_WRONG_MODE'
  | 'CONFIRMED_REMODEL_IDENTITY'
  | 'PROMISING_BODY_UNAVAILABLE'
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
        'SceneInfo identifies Vss_Temple01 as マテガイ放水路（改修後）.',
        'Its sequence is Versus and its preload resource is Model/Fld_Temple01.bfres.',
        'Vss_Temple00 is retained separately as the pre-remodel マテガイ放水路 scene.'
      ],
      blocker:
        'Scene metadata proves identity/version intent but contains no mesh vertex coordinates.'
    },
    {
      id: 'KITRIX_TEMPLE01_OBJ',
      status: 'PROMISING_BODY_UNAVAILABLE',
      canPromoteCanonicalGeometry: false,
      confidence: 'HIGH',
      facts: [
        'KiTrix contains stages/Vss_Temple01/Vss_Temple01.obj as a Git LFS object with declared size 43,263,289 bytes.',
        'Its MTL contains Fld_Temple01 and FldObj_Temple01 material/model names, including PntSet/VarSet/VclSet/VglSet/VlfSet families.',
        'KiTrix Bfres2Obj derives the output folder name by replacing Fld_ with Vss_ on the BFRES input filename.',
        'The converter applies BFRES bone world transforms and then writes X/Y/Z vertex coordinates directly to OBJ without a custom scale or axis swap.'
      ],
      blocker:
        'The Git LFS object body is not retrievable in the current audit environment, so no vertex, plane, or floor Y may be promoted from this source yet.'
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
  const temple01 = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'LEANNY_TEMPLE01_SCENE_METADATA'
  );
  const kitrix = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'KITRIX_TEMPLE01_OBJ'
  );
  const stick = UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT.find(
    (entry) => entry.id === 'LEANNY_TEMPLE_STICK_INDEX'
  );

  if (temple01?.status !== 'CONFIRMED_REMODEL_IDENTITY') {
    errors.push('Temple01 remodel identity must remain confirmed');
  }
  if (kitrix?.canPromoteCanonicalGeometry) {
    errors.push('KiTrix LFS geometry must not promote canonical geometry before the OBJ body is audited');
  }
  if (stick?.status !== 'REJECTED_WRONG_MODE') {
    errors.push('Salmon Run stick index must remain excluded from normal-PvP height reconstruction');
  }
  for (const entry of UNDERTOW_EXTERNAL_GEOMETRY_SOURCE_AUDIT) {
    if (entry.canPromoteCanonicalGeometry) {
      errors.push(`${entry.id}: no current external source is promotion-safe`);
    }
  }
  return errors;
}
