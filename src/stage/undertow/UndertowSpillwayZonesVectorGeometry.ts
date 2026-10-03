import type { MetricXZ } from '../measurement/StageMapCalibration';
import {
  UNDERTOW_PDF_ORIGIN_PT,
  UNDERTOW_VECTOR_BLUEPRINT_SOURCE,
  undertowPdfPointToProjectXZ,
  type PdfPoint
} from './UndertowSpillwayVectorBlueprint';

export interface UndertowZoneVectorPolygon {
  id: 'negative-z-zone' | 'positive-z-zone';
  pdfPoints: readonly PdfPoint[];
  metricPoints: readonly MetricXZ[];
  areaSquareMeters: number;
}

export interface UndertowZoneUnderpassPaintRegistration {
  id: 'negative-z-zone-underpass-paint' | 'positive-z-zone-underpass-paint';
  backingSolidId:
    | 'UndertowT21D:glass-underpass-negative-z'
    | 'UndertowT21D:glass-underpass-positive-z';
  projectOuter: readonly MetricXZ[];
  projectHoles: readonly (readonly MetricXZ[])[];
  areaSquareMeters: number;
}

/**
 * Exact public source recovered in Resolution Pass 8.
 *
 * The PDF itself remains external research evidence; only its measured vector
 * coordinates / digest are committed here. CI re-downloads and verifies the
 * source before extracting the vector paths.
 */
export const UNDERTOW_ZONES_VECTOR_SOURCE = Object.freeze({
  author: 'Sunfish',
  stage: 'Undertow Spillway',
  mode: 'Splat Zones',
  updated: '2024-05-06',
  attachmentFileName: '(エリア)マテガイ放水路.pdf',
  attachmentUrl:
    'https://note.com/api/v2/attachments/download/71d47d4e3fe3f2a041aa1af50a6ede14',
  fileBytes: 112898,
  sha256: 'ae2c24c3cc0ed09d5711e229deb7fb6535c3ef6505ea7dead1aca5e69c4d1596',
  pageWidthPoints: 841.92,
  pageHeightPoints: 595.32,
  dashDotStrokeWidthPoints: 0.72,
  drawingSymmetryCenterPdf: [420.96, 297.6] as PdfPoint,
  confidence: 'HIGH' as const
});

/**
 * The dash-dot zone boundary is emitted by the PDF as separate solid vector
 * fragments rather than a PDF dash style. Grouping the 0.72 pt fragments by
 * common support lines recovers these exact six-vertex L-shaped rings.
 */
const NEGATIVE_Z_ZONE_PDF: readonly PdfPoint[] = [
  [368.52, 230.28],
  [426.24, 230.28],
  [426.24, 282.84],
  [390.6, 282.84],
  [390.6, 267.84],
  [368.52, 267.84]
] as const;

const POSITIVE_Z_ZONE_PDF: readonly PdfPoint[] = [
  [415.68, 312.36],
  [451.32, 312.36],
  [451.32, 327.36],
  [473.4, 327.36],
  [473.4, 364.92],
  [415.68, 364.92]
] as const;

function polygonArea(points: readonly MetricXZ[]): number {
  let twiceArea = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [ax, az] = points[i]!;
    const [bx, bz] = points[(i + 1) % points.length]!;
    twiceArea += ax * bz - bx * az;
  }
  return Math.abs(twiceArea) * 0.5;
}

function registeredArea(
  outer: readonly MetricXZ[],
  holes: readonly (readonly MetricXZ[])[]
): number {
  return polygonArea(outer) - holes.reduce((sum, hole) => sum + polygonArea(hole), 0);
}

function vectorPolygon(
  id: UndertowZoneVectorPolygon['id'],
  pdfPoints: readonly PdfPoint[]
): UndertowZoneVectorPolygon {
  const metricPoints = pdfPoints.map(undertowPdfPointToProjectXZ);
  return {
    id,
    pdfPoints,
    metricPoints,
    areaSquareMeters: polygonArea(metricPoints)
  };
}

export const UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS = Object.freeze({
  negativeZ: vectorPolygon('negative-z-zone', NEGATIVE_Z_ZONE_PDF),
  positiveZ: vectorPolygon('positive-z-zone', POSITIVE_Z_ZONE_PDF)
});

/**
 * Exact intersection of the registered zone rings with the already audited
 * project-Y=0 Temple01 underpass footprints. These are derived registration
 * values, not new source geometry. The small A/B area difference is retained:
 * the canonical Turf PDF origin is 0.06 pt from the vector drawing's exact
 * 180-degree Y center, producing a 0.025m project-frame symmetry residual.
 */
const POSITIVE_Z_UNDERPASS_ZONE_OUTER: readonly MetricXZ[] = [
  [-13.062613746944, 5.189246414282],
  [-9.69226446028, 12.052451343762],
  [-7.478946659187, 10.967391625304],
  [-7.24293537139, 10.562928717229],
  [-5.264997394908, 9.593261901722],
  [-4.800721790843, 9.654415278129],
  [-2.76297111837, 8.509890551233],
  [-5.965476378952, 1.704018723815]
] as const;

const POSITIVE_Z_UNDERPASS_ZONE_HOLE: readonly MetricXZ[] = [
  [-11.26028003595, 5.313385951865],
  [-10.394317046212, 5.609601208196],
  [-10.921086707103, 6.30214112853],
  [-11.669286769998, 5.657123106685]
] as const;

const NEGATIVE_Z_UNDERPASS_ZONE_OUTER: readonly MetricXZ[] = [
  [13.085053963059, -5.200266246438],
  [9.714712082513, -12.06345609448],
  [7.478946659187, -10.967391625304],
  [7.24293537139, -10.562928717229],
  [5.264997394908, -9.593261901722],
  [4.800721790843, -9.654415278129],
  [2.76297111837, -8.509890551233],
  [5.965476378952, -1.704018723815]
] as const;

const NEGATIVE_Z_UNDERPASS_ZONE_HOLE: readonly MetricXZ[] = [
  [11.26028003595, -5.313385951865],
  [10.394317046212, -5.609601208196],
  [10.921086707103, -6.30214112853],
  [11.669286769998, -5.657123106685]
] as const;

function paintRegistration(
  id: UndertowZoneUnderpassPaintRegistration['id'],
  backingSolidId: UndertowZoneUnderpassPaintRegistration['backingSolidId'],
  projectOuter: readonly MetricXZ[],
  projectHoles: readonly (readonly MetricXZ[])[]
): UndertowZoneUnderpassPaintRegistration {
  return {
    id,
    backingSolidId,
    projectOuter,
    projectHoles,
    areaSquareMeters: registeredArea(projectOuter, projectHoles)
  };
}

export const UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION = Object.freeze({
  negativeZ: paintRegistration(
    'negative-z-zone-underpass-paint',
    'UndertowT21D:glass-underpass-negative-z',
    NEGATIVE_Z_UNDERPASS_ZONE_OUTER,
    [NEGATIVE_Z_UNDERPASS_ZONE_HOLE]
  ),
  positiveZ: paintRegistration(
    'positive-z-zone-underpass-paint',
    'UndertowT21D:glass-underpass-positive-z',
    POSITIVE_Z_UNDERPASS_ZONE_OUTER,
    [POSITIVE_Z_UNDERPASS_ZONE_HOLE]
  )
});

export const UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT = Object.freeze({
  sourceBytes: UNDERTOW_ZONES_VECTOR_SOURCE.fileBytes,
  sourceSha256: UNDERTOW_ZONES_VECTOR_SOURCE.sha256,
  sourcePageWidthPoints: UNDERTOW_ZONES_VECTOR_SOURCE.pageWidthPoints,
  sourcePageHeightPoints: UNDERTOW_ZONES_VECTOR_SOURCE.pageHeightPoints,
  turfPageWidthPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageWidthPoints,
  turfPageHeightPoints: UNDERTOW_VECTOR_BLUEPRINT_SOURCE.pageHeightPoints,
  turfOriginPdf: UNDERTOW_PDF_ORIGIN_PT,
  sharedOuterAnchorCount: 40,
  comparedOuterAnchorCount: 42,
  modeSpecificChangedOuterAnchorCount: 2,
  maxSharedOuterAnchorResidualPoints: 0.000051732471,
  maxSharedOuterAnchorResidualMeters: 0.000010777598,
  exactPdfVertexCountPerZone: 6,
  zoneAreaSquareMeters: UNDERTOW_SPLAT_ZONES_VECTOR_POLYGONS.negativeZ.areaSquareMeters,
  pdfZoneAreaSquarePoints: 2702.5632,
  projectRotationSymmetryResidualMeters: 0.025,
  negativeZRegisteredUnderpassPaintAreaSquareMeters:
    UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.negativeZ.areaSquareMeters,
  positiveZRegisteredUnderpassPaintAreaSquareMeters:
    UNDERTOW_SPLAT_ZONES_UNDERPASS_PAINT_REGISTRATION.positiveZ.areaSquareMeters,
  notes:
    '40/42 Turf exterior hard-edge anchors match the Zones PDF to <=0.000052pt; the two non-matching vertices are the mirrored mode-specific geometry changes. The exact shared coordinate frame is therefore numerically verified rather than assumed.'
});

export function undertowZonesVectorGeometryAuditErrors(): readonly string[] {
  const audit = UNDERTOW_ZONES_VECTOR_GEOMETRY_AUDIT;
  const errors: string[] = [];

  if (
    audit.sourceBytes !== 112898 ||
    audit.sourceSha256 !== 'ae2c24c3cc0ed09d5711e229deb7fb6535c3ef6505ea7dead1aca5e69c4d1596'
  ) {
    errors.push('Sunfish Zones PDF source identity drifted');
  }
  if (
    audit.sourcePageWidthPoints !== audit.turfPageWidthPoints ||
    audit.sourcePageHeightPoints !== audit.turfPageHeightPoints
  ) {
    errors.push('Zones/Turf PDF page frames no longer match');
  }
  if (
    audit.sharedOuterAnchorCount !== 40 ||
    audit.comparedOuterAnchorCount !== 42 ||
    audit.modeSpecificChangedOuterAnchorCount !== 2 ||
    audit.maxSharedOuterAnchorResidualMeters > 0.00002
  ) {
    errors.push('Zones/Turf common-anchor registration drifted');
  }
  if (
    audit.exactPdfVertexCountPerZone !== 6 ||
    Math.abs(audit.zoneAreaSquareMeters - 117.29875) > 1e-6
  ) {
    errors.push('exact Splat-Zone vector polygon geometry drifted');
  }
  if (Math.abs(audit.projectRotationSymmetryResidualMeters - 0.025) > 1e-9) {
    errors.push('canonical project-frame zone symmetry residual drifted');
  }
  if (
    audit.negativeZRegisteredUnderpassPaintAreaSquareMeters <= 0 ||
    audit.positiveZRegisteredUnderpassPaintAreaSquareMeters <= 0 ||
    audit.negativeZRegisteredUnderpassPaintAreaSquareMeters >= audit.zoneAreaSquareMeters ||
    audit.positiveZRegisteredUnderpassPaintAreaSquareMeters >= audit.zoneAreaSquareMeters
  ) {
    errors.push('registered underpass paint intersection is invalid');
  }

  return errors;
}
