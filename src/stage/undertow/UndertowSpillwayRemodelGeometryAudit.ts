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
      'The full exterior contains overlapping/non-walkable layers and has a large p95 residual, so arbitrary global PDF->OBJ projection is not promoted. The four drop lips are separately accepted because their registered lines coincide with the expected local OBJ height-discontinuity contours within the 0.5m audit raster.'
  },
  rawModelY: {
    centerReference: 4.5,
    spawnFloor: 10.5,
    firstDropLanding: 6.0,
    rightSmallDropLower: 7.5
  },
  projectNormalization: {
    modelYAtCanonicalCenterLow: 4.5,
    canonicalCenterLowY: 0,
    modelToProjectYOffset: -4.5
  },
  projectY: {
    centerLow: 0,
    spawnFloor: 6.0,
    firstDropLanding: 1.5,
    rightSmallDropUpper: 6.0,
    rightLow: 3.0
  },
  deltas: {
    firstDropMeters: -4.5,
    rightSmallDropMeters: -3.0,
    firstDropLandingToRightLowMeters: 1.5
  },
  localDiscontinuityResidualsMeters: {
    teamAFirstDrop: [0.017, 0.160] as const,
    teamBFirstDrop: [0.109, 0.142] as const,
    teamARightSmallDrop: [0.163, 0.093] as const,
    teamBRightSmallDrop: [0.071, 0.077] as const
  },
  sideMaterials: {
    upper:
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
    'The registered center reference hits model Y=4.5m and the project canonical center-low reference remains Y=0, so only relative/normalized Y values are promoted.'
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
  if (a.projectNormalization.modelYAtCanonicalCenterLow + a.projectNormalization.modelToProjectYOffset !== 0) {
    errors.push('Temple01 model->project Y normalization no longer maps center-low to zero.');
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

  return errors;
}
