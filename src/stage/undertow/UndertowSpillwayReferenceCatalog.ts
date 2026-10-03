import type { RuleVariantId } from '../measurement/StageMeasurementLedger';

export interface UndertowReferenceMap {
  rule: RuleVariantId;
  sourceVersion: '7.2.0';
  widthPixels: 1280;
  heightPixels: 720;
  sourcePage: string;
  role: 'VISUAL_CROSSCHECK_ONLY';
}

export const UNDERTOW_NINTENDO_7_2_CHANGELOG =
  'https://en-americas-support.nintendo.com/app/answers/detail/a_id/61257/';


export interface UndertowGameplaySemanticReference {
  id:
    | 'CURRENT_SPAWN_TO_CENTER'
    | 'CURRENT_RAINMAKER_GRATE_ADVANCE'
    | 'CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION'
    | 'CURRENT_RULE_VARIANTS'
    | 'GENERAL_GRATE_WALKABILITY';
  sourcePage: string;
  sourceVersion: string;
  stageIdentity: 'UNDERTOW_SPILLWAY_MATEGAI' | 'SPLATOON_SERIES_GRATE';
  role:
    | 'CURRENT_DIRECTIONALITY'
    | 'CURRENT_RULE_VARIANT'
    | 'TERRAIN_MECHANIC';
  supports: readonly string[];
}

export const UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES:
  readonly UndertowGameplaySemanticReference[] = [
  {
    id: 'CURRENT_SPAWN_TO_CENTER',
    sourcePage: 'https://strategywiki.org/wiki/Splatoon_3/Undertow_Spillway',
    sourceVersion: 'current post-Ver.7.2.0 stage guide checked 2026-09-30',
    stageIdentity: 'UNDERTOW_SPILLWAY_MATEGAI',
    role: 'CURRENT_DIRECTIONALITY',
    supports: [
      'spawn-side route reaches the middle overhangs through a grate'
    ]
  },
  {
    id: 'CURRENT_RAINMAKER_GRATE_ADVANCE',
    sourcePage:
      'https://wikiwiki.jp/splatoon3mix/%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8/%E3%83%9E%E3%83%86%E3%82%AC%E3%82%A4%E6%94%BE%E6%B0%B4%E8%B7%AF',
    sourceVersion: 'current Ver.7.2.0 map/guide checked 2026-09-30',
    stageIdentity: 'UNDERTOW_SPILLWAY_MATEGAI',
    role: 'CURRENT_DIRECTIONALITY',
    supports: [
      'post-Ver.7.2.0 Rainmaker route crosses the right-front grate toward the enemy side'
    ]
  },
  {
    id: 'CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION',
    sourcePage: 'https://gamewith.jp/splatoon3/367749',
    sourceVersion: 'page updated 2024-08-29 / post-Ver.7.2.0',
    stageIdentity: 'UNDERTOW_SPILLWAY_MATEGAI',
    role: 'CURRENT_DIRECTIONALITY',
    supports: [
      'post-Ver.7.2.0 Rainmaker checkpoint-to-goal route can proceed over the grate'
    ]
  },
  {
    id: 'CURRENT_RULE_VARIANTS',
    sourcePage: 'https://kamigame.jp/splatoon3/page/230661367210732889.html',
    sourceVersion: 'page updated 2025-03-06 / post-Ver.7.2.0',
    stageIdentity: 'UNDERTOW_SPILLWAY_MATEGAI',
    role: 'CURRENT_RULE_VARIANT',
    supports: [
      'current Undertow/Matagai rule layouts differ by mode',
      'Tower Control retains an own-side high grate position while other roof geometry differs'
    ]
  },
  {
    id: 'GENERAL_GRATE_WALKABILITY',
    sourcePage: 'https://splatoonwiki.org/wiki/Grate',
    sourceVersion: 'current series terrain reference checked 2026-09-30',
    stageIdentity: 'SPLATOON_SERIES_GRATE',
    role: 'TERRAIN_MECHANIC',
    supports: [
      'humanoid-form players can walk on horizontal grates',
      'Undertow Spillway has grated platforms in its Anarchy Battle variants'
    ]
  }
] as const;

export const UNDERTOW_POST_7_2_REFERENCE_MAPS: readonly UndertowReferenceMap[] = [
  {
    rule: 'TURF',
    sourceVersion: '7.2.0',
    widthPixels: 1280,
    heightPixels: 720,
    sourcePage: 'https://splatoonwiki.org/wiki/File:S3_Map_Undertow_Spillway_Turf_War_7.2.0.jpg',
    role: 'VISUAL_CROSSCHECK_ONLY'
  },
  {
    rule: 'ZONES',
    sourceVersion: '7.2.0',
    widthPixels: 1280,
    heightPixels: 720,
    sourcePage: 'https://splatoonwiki.org/wiki/File:S3_Map_Undertow_Spillway_Splat_Zones_7.2.0.jpg',
    role: 'VISUAL_CROSSCHECK_ONLY'
  },
  {
    rule: 'TOWER',
    sourceVersion: '7.2.0',
    widthPixels: 1280,
    heightPixels: 720,
    sourcePage: 'https://splatoonwiki.org/wiki/File:S3_Map_Undertow_Spillway_Tower_Control_7.2.0.jpg',
    role: 'VISUAL_CROSSCHECK_ONLY'
  },
  {
    rule: 'RAINMAKER',
    sourceVersion: '7.2.0',
    widthPixels: 1280,
    heightPixels: 720,
    sourcePage: 'https://splatoonwiki.org/wiki/File:S3_Map_Undertow_Spillway_Rainmaker_7.2.0.jpg',
    role: 'VISUAL_CROSSCHECK_ONLY'
  },
  {
    rule: 'CLAMS',
    sourceVersion: '7.2.0',
    widthPixels: 1280,
    heightPixels: 720,
    sourcePage: 'https://splatoonwiki.org/wiki/File:S3_Map_Undertow_Spillway_Clam_Blitz_7.2.0.jpg',
    role: 'VISUAL_CROSSCHECK_ONLY'
  }
];

/**
 * The in-game tactical-map captures are perspective/isometric references.
 * They are useful for checking topology and rule-specific differences, but the
 * 20 px/m calibration belongs to the user's 3508x2482 rule map and MUST NOT be
 * applied to these 1280x720 images.
 */
export function validateUndertowReferenceCatalog(): string[] {
  const errors: string[] = [];
  const expected: readonly RuleVariantId[] = ['TURF', 'ZONES', 'TOWER', 'RAINMAKER', 'CLAMS'];
  const seen = new Set<RuleVariantId>();

  for (const reference of UNDERTOW_POST_7_2_REFERENCE_MAPS) {
    if (seen.has(reference.rule)) errors.push(`duplicate Undertow reference for ${reference.rule}`);
    seen.add(reference.rule);
    if (reference.sourceVersion !== '7.2.0') {
      errors.push(`${reference.rule}: reference must be Ver.7.2.0`);
    }
    if (!reference.sourcePage.includes('7.2.0')) {
      errors.push(`${reference.rule}: source page does not identify the 7.2.0 map`);
    }
    if (reference.role !== 'VISUAL_CROSSCHECK_ONLY') {
      errors.push(`${reference.rule}: web map must not become the metric scale authority`);
    }
  }

  for (const rule of expected) {
    if (!seen.has(rule)) errors.push(`missing Undertow 7.2.0 reference for ${rule}`);
  }

  const gameplayIds = new Set<string>();
  const forbiddenWrongStagePages = new Set([
    'https://gamerch.com/splatoonwiki-sogo/984847',
    'https://kamigame.jp/splatoon3/page/230199164238079467.html',
    'https://appmedia.jp/splatoon3/76009214'
  ]);
  for (const reference of UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES) {
    if (gameplayIds.has(reference.id)) {
      errors.push(`duplicate Undertow grate gameplay reference '${reference.id}'`);
    }
    gameplayIds.add(reference.id);
    if (reference.supports.length === 0) {
      errors.push(`${reference.id}: gameplay semantic reference must declare support scope`);
    }
    if (forbiddenWrongStagePages.has(reference.sourcePage)) {
      errors.push(`${reference.id}: Scorch Gorge/other-stage source cannot support Undertow semantics`);
    }
    if (
      reference.role !== 'TERRAIN_MECHANIC' &&
      reference.stageIdentity !== 'UNDERTOW_SPILLWAY_MATEGAI'
    ) {
      errors.push(`${reference.id}: stage-specific semantic source must identify Undertow/Matagai`);
    }
    if (
      reference.role === 'TERRAIN_MECHANIC' &&
      reference.stageIdentity !== 'SPLATOON_SERIES_GRATE'
    ) {
      errors.push(`${reference.id}: terrain mechanic source must remain series-scoped`);
    }
  }
  if (gameplayIds.size !== 5) {
    errors.push('Undertow grate gameplay semantic catalog must contain five corrected references');
  }
  for (const id of [
    'CURRENT_SPAWN_TO_CENTER',
    'CURRENT_RAINMAKER_GRATE_ADVANCE',
    'CURRENT_RAINMAKER_GRATE_ADVANCE_CORROBORATION',
    'CURRENT_RULE_VARIANTS',
    'GENERAL_GRATE_WALKABILITY'
  ] as const) {
    if (!gameplayIds.has(id)) errors.push(`missing corrected Undertow grate semantic reference '${id}'`);
  }

  return errors;
}
