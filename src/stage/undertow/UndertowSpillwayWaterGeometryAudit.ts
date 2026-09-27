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
  visualPlaneResolved: false,
  killThresholdResolved: false,
  confidence: 'HIGH' as const,
  notes:
    'CI #663 scanned the exact confirmed water polygons against current common+Turf Temple01 horizontal faces whose object/material names contain Water, Sea, or River. Neither side contains a matching horizontal visual-water mesh. Therefore no visual-water Y and no death/kill Y may be inferred from Temple01 geometry.'
});

export function undertowWaterVisualPlaneAuditErrors(): readonly string[] {
  const a = UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamA;
  const b = UNDERTOW_WATER_VISUAL_PLANE_AUDIT.teamB;
  const errors: string[] = [];
  if (a.temple01WaterSurfaceCells !== 0 || b.temple01WaterSurfaceCells !== 0) {
    errors.push('water audit unexpectedly contains Temple01 visual-water cells');
  }
  if (UNDERTOW_WATER_VISUAL_PLANE_AUDIT.visualPlaneResolved) {
    errors.push('water visual plane must remain unresolved after zero-coverage audit');
  }
  if (UNDERTOW_WATER_VISUAL_PLANE_AUDIT.killThresholdResolved) {
    errors.push('water kill threshold must not be inferred from the visual-plane audit');
  }
  return errors;
}
