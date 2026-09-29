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
    | 'CURRENT_TURF_RETURN'
    | 'CURRENT_SPAWN_TO_CENTER'
    | 'CURRENT_RULE_VARIANTS'
    | 'LEGACY_TURF_SAME_ROUTE_RETURN';
  sourcePage: string;
  sourceVersion: string;
  role:
    | 'CURRENT_DIRECTIONALITY'
    | 'CURRENT_RULE_VARIANT'
    | 'LEGACY_CORROBORATION';
  supports: readonly string[];
}

export const UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES:
  readonly UndertowGameplaySemanticReference[] = [
  {
    id: 'CURRENT_TURF_RETURN',
    sourcePage: 'https://gamerch.com/splatoonwiki-sogo/984847',
    sourceVersion: 'current page updated 2026-05-07 / post-Ver.7.2.0',
    role: 'CURRENT_DIRECTIONALITY',
    supports: [
      'Turf/Zones center-to-own-side return via grate exists'
    ]
  },
  {
    id: 'CURRENT_SPAWN_TO_CENTER',
    sourcePage: 'https://strategywiki.org/wiki/Splatoon_3/Undertow_Spillway',
    sourceVersion: 'current post-Ver.7.2.0 stage guide checked 2026-09-30',
    role: 'CURRENT_DIRECTIONALITY',
    supports: [
      'spawn-side route uses grate access toward the middle overhangs'
    ]
  },
  {
    id: 'CURRENT_RULE_VARIANTS',
    sourcePage: 'https://kamigame.jp/splatoon3/page/230199164238079467.html',
    sourceVersion: 'page updated 2025-03-06 / post-Ver.7.2.0',
    role: 'CURRENT_RULE_VARIANT',
    supports: [
      'Splat Zones terrain matches Turf',
      'Tower Control removes the central grate route',
      'Rainmaker retains a grate-side attack route',
      'Clam Blitz retains a grate-side attack route'
    ]
  },
  {
    id: 'LEGACY_TURF_SAME_ROUTE_RETURN',
    sourcePage: 'https://appmedia.jp/splatoon3/76009214',
    sourceVersion: 'pre-Ver.7.2.0 corroboration only',
    role: 'LEGACY_CORROBORATION',
    supports: [
      'historical Turf explicitly described the grate route for both invasion and return'
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
  for (const reference of UNDERTOW_CURRENT_GRATE_GAMEPLAY_REFERENCES) {
    if (gameplayIds.has(reference.id)) {
      errors.push(`duplicate Undertow grate gameplay reference '${reference.id}'`);
    }
    gameplayIds.add(reference.id);
    if (reference.supports.length === 0) {
      errors.push(`${reference.id}: gameplay semantic reference must declare support scope`);
    }
    if (
      reference.id === 'LEGACY_TURF_SAME_ROUTE_RETURN' &&
      reference.role !== 'LEGACY_CORROBORATION'
    ) {
      errors.push('legacy Turf grate reference must remain corroboration-only');
    }
    if (
      reference.id !== 'LEGACY_TURF_SAME_ROUTE_RETURN' &&
      reference.role === 'LEGACY_CORROBORATION'
    ) {
      errors.push(`${reference.id}: current grate reference cannot be legacy-only`);
    }
  }
  if (gameplayIds.size !== 4) {
    errors.push('Undertow grate gameplay semantic catalog must contain four scoped references');
  }

  return errors;
}
