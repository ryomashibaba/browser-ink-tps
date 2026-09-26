export const UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT = Object.freeze({
  source: {
    repository: 'kirakira-dev/KiTrix',
    objectPath: 'stages/Vss_Temple01/Vss_Temple01.obj',
    lfsOid: 'sha256:a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
    fileBytes: 43263289,
    vertexCount: 375948,
    activeCommonPlusTurfFaceCount: 70396,
    confidence: 'HIGH' as const,
    notes:
      'Temple01 is the remodeled Undertow Versus model family. The audit parses common Fld_Temple01 plus Turf PntSet geometry only.'
  },
  registration: {
    pdfToModelScale: 0.964211,
    rotationDegrees: 26.1160,
    translateX: -0.0580,
    translateZ: -0.1329,
    trimmedOuterRmsMeters: 0.9570,
    outerP95Meters: 10.2420,
    rasterCellMeters: 0.5,
    locallyVerifiedMaxNearestDiscontinuityMeters: 0.163,
    confidence: 'HIGH' as const,
    notes:
      'The full exterior contains overlapping/non-walkable layers and has a large p95 residual, so arbitrary global PDF->OBJ projection is not promoted. The four drop lips and the central/grate local regions are promoted only where independent local mesh/material checks agree.'
  },
  rawModelY: {
    centerLow: 3.0,
    centerStepTop: 4.5,
    spawnFloor: 10.5,
    firstDropLanding: 6.0,
    rightSmallDropLower: 7.5,
    centerSlopeLow: 1.5,
    centerSlopeHigh: 3.0,
    grateVisualTop: 10.4
  },
  projectNormalization: {
    modelYAtCanonicalCenterLow: 3.0,
    canonicalCenterLowY: 0,
    modelToProjectYOffset: -3.0,
    confidence: 'HIGH' as const,
    notes:
      'The PDF origin face was previously mis-bound as center-low. Temple01 local step probes show that face at model Y=4.5 while the immediately adjacent lower floor is model Y=3.0. The existing +1.5m center-step relation therefore identifies model Y=3.0 as canonical center-low and model Y=4.5 as center-step top.'
  },
  projectY: {
    centerLow: 0,
    centerStepTop: 1.5,
    spawnFloor: 7.5,
    firstDropLanding: 3.0,
    rightSmallDropUpper: 7.5,
    rightLow: 4.5,
    centerSlopeLow: -1.5,
    centerSlopeHigh: 0,
    grateVisualTop: 7.4
  },
  deltas: {
    centerStepMeters: 1.5,
    firstDropMeters: -4.5,
    rightSmallDropMeters: -3.0,
    firstDropLandingToRightLowMeters: 1.5,
    centerSlopeRiseMeters: 1.5
  },
  localDiscontinuityResidualsMeters: {
    teamAFirstDrop: [0.017, 0.160] as const,
    teamBFirstDrop: [0.109, 0.142] as const,
    teamARightSmallDrop: [0.163, 0.093] as const,
    teamBRightSmallDrop: [0.071, 0.077] as const,
    centerStepNearest: [0.040, 0.056, 0.167, 0.263] as const
  },
  localSurfaceEvidence: {
    centerLow:
      'Fld_Temple01_pCube20989_1__FloorConcrete02 / common FloorLine00 at model Y=3.0~3.05 immediately outside the center step',
    centerStepTop:
      'FldObj_Temple01_PntSet_A4_1__FloorConcrete00 at model Y=4.5 on the origin-face side',
    centerSlope:
      'Fld_Temple01_pCube21000_1__FloorSlope00 overlaps both registered central slope footprints and spans model Y=1.5~3.0',
    grate:
      'Fld_Temple01_pPlane157_1__FloorFence00 overlaps both registered grate footprints; target top surface is model Y=10.3~10.4'
  },
  sideMaterials: {
    dropUpper:
      'Fld_Temple01_FloorLine00 / Fld_Temple01_FloorConcrete00',
    firstDropLower: 'Fld_Temple01_FloorConcrete03 @ model Y=6.0',
    rightSmallDropLower: 'Fld_Temple01_FloorConcrete03 @ model Y=7.5'
  },
  evidenceIds: [
    'extracted-temple01-geometry',
    'user-turf-vector-blueprint',
    'user-first-drop-video',
    'user-first-drop-height-stills-2026-09-26'
  ] as const,
  confidence: 'HIGH' as const,
  notes: [
    'Both A/B first-drop lips register to a 10.5 <-> 6.0m model-Y discontinuity.',
    'Both A/B right-small-drop lips register to a 10.5 <-> 7.5m model-Y discontinuity.',
    'The user-observed red-guide-side floor below blue-guide-side floor is reproduced exactly by 6.0m < 7.5m in the remodeled model.',
    'The spawn-center samples hit model Y=10.5m on both sides.',
    'The registered center-step probes show lower floor model Y=3.0 and origin-face/top model Y=4.5; this supersedes the earlier origin-face=center-low binding.',
    'The two central slope footprints locally overlap the common FloorSlope00 surface spanning model Y=1.5~3.0.',
    'The two grate footprints locally overlap the symmetric FloorFence00 surface with target visual top model Y=10.4.',
    'All model-derived values remain HIGH and are excluded from Stable Freeze until independently confirmed.'
  ] as const
});

export function undertowRemodelGeometryAuditErrors(): readonly string[] {
  const a = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT;
  const errors: string[] = [];

  if (a.source.fileBytes !== 43263289) {
    errors.push('Temple01 LFS body size changed from the audited object.');
  }
  if (a.registration.locallyVerifiedMaxNearestDiscontinuityMeters > a.registration.rasterCellMeters) {
    errors.push('Local drop-lip registration exceeds the audit raster cell.');
  }
  if (
    a.projectNormalization.modelYAtCanonicalCenterLow +
      a.projectNormalization.modelToProjectYOffset !== 0
  ) {
    errors.push('Temple01 model->project Y normalization no longer maps center-low to zero.');
  }
  if (a.projectY.centerLow + a.deltas.centerStepMeters !== a.projectY.centerStepTop) {
    errors.push('Center-step normalized Y values are inconsistent.');
  }
  if (a.projectY.spawnFloor + a.deltas.firstDropMeters !== a.projectY.firstDropLanding) {
    errors.push('First-drop normalized Y values are inconsistent.');
  }
  if (a.projectY.rightSmallDropUpper + a.deltas.rightSmallDropMeters !== a.projectY.rightLow) {
    errors.push('Right-small-drop normalized Y values are inconsistent.');
  }
  if (a.projectY.firstDropLanding + a.deltas.firstDropLandingToRightLowMeters !== a.projectY.rightLow) {
    errors.push('Corrected red-lower / blue-lower ordering is inconsistent.');
  }
  if (a.projectY.centerSlopeLow + a.deltas.centerSlopeRiseMeters !== a.projectY.centerSlopeHigh) {
    errors.push('Center slope normalized Y values are inconsistent.');
  }
  if (!(a.rawModelY.centerLow < a.rawModelY.centerStepTop)) {
    errors.push('Center semantic correction must keep the origin-face side above center-low.');
  }

  return errors;
}
