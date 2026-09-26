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

  return errors;
}
