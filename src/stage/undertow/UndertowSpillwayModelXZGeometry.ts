import type { MetricXZ } from '../measurement/StageMapCalibration';
import { UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT } from './UndertowSpillwayRemodelGeometryAudit';

export type UndertowModelXZGeometryId =
  | 'center-low-team-a'
  | 'center-low-team-b'
  | 'right-low-team-a'
  | 'right-low-team-b'
  | 'glass-underpass-positive-z'
  | 'glass-underpass-negative-z';

export interface UndertowModelXZPolygon {
  id: UndertowModelXZGeometryId;
  sourceYModelMeters: number;
  sourceYProjectMeters: number;
  modelOuter: readonly MetricXZ[];
  modelHoles: readonly (readonly MetricXZ[])[];
  projectOuter: readonly MetricXZ[];
  projectHoles: readonly (readonly MetricXZ[])[];
  confidence: 'HIGH';
  rasterStepMeters: 0.125;
  simplifyToleranceMeters: 0.15 | 0.2;
  evidenceIds: readonly string[];
  notes: string;
}

const REG = UNDERTOW_TEMPLE01_REMODEL_GEOMETRY_AUDIT.registration;
const SCALE = REG.pdfToModelScale;
const THETA = REG.rotationDegrees * Math.PI / 180;
const COS = Math.cos(THETA);
const SIN = Math.sin(THETA);

export function undertowTemple01ModelXZToProjectXZ(
  point: MetricXZ
): MetricXZ {
  const mx = point[0] - REG.translateX;
  const mz = point[1] - REG.translateZ;
  return [
    (COS * mx + SIN * mz) / SCALE,
    (-SIN * mx + COS * mz) / SCALE
  ];
}

export function undertowProjectXZToTemple01ModelXZ(
  point: MetricXZ
): MetricXZ {
  return [
    SCALE * (COS * point[0] - SIN * point[1]) + REG.translateX,
    SCALE * (SIN * point[0] + COS * point[1]) + REG.translateZ
  ];
}

function mirror180(points: readonly MetricXZ[]): readonly MetricXZ[] {
  return points.map(([x, z]) => [-x, -z] as MetricXZ);
}

function toProject(points: readonly MetricXZ[]): readonly MetricXZ[] {
  return points.map(undertowTemple01ModelXZToProjectXZ);
}

const CENTER_LOW_A_MODEL: readonly MetricXZ[] = [
  [2.938, -6.062],
  [13.438, -6.062],
  [15.438, -6.188],
  [15.688, -6.438],
  [18.062, -4.062],
  [18.062, 1.688],
  [14.562, 1.688],
  [14.562, 3.062],
  [13.438, 3.062],
  [13.438, 1.938],
  [12.938, 1.938],
  [12.938, 1.688],
  [9.812, 1.688],
  [9.812, 1.938],
  [9.188, 1.938],
  [9.188, 1.562],
  [7.312, 1.562],
  [7.312, 1.938],
  [6.688, 1.938],
  [6.688, 1.688],
  [3.562, 1.688],
  [3.562, 1.938],
  [2.938, 1.938]
] as const;

const CENTER_LOW_A_HOLES: readonly (readonly MetricXZ[])[] = [
  [
    [13.688, 0.188],
    [13.688, 2.812],
    [14.312, 2.812],
    [14.312, 0.188]
  ]
] as const;

const RIGHT_LOW_A_MODEL: readonly MetricXZ[] = [
  [-20.062, 49.438],
  [-15.438, 49.438],
  [-15.188, 49.188],
  [-15.188, 40.812],
  [-15.438, 40.812],
  [-15.438, 40.438],
  [-15.062, 40.438],
  [-15.062, 32.938],
  [-9.688, 32.938],
  [-9.688, 33.312],
  [-7.062, 33.312],
  [-7.562, 33.938],
  [-9.688, 33.938],
  [-9.688, 40.438],
  [-6.688, 40.438],
  [-6.688, 43.438],
  [3.062, 43.438],
  [-2.938, 43.562],
  [-2.938, 47.938],
  [6.062, 47.938],
  [6.062, 61.562],
  [-7.562, 61.562],
  [-7.562, 57.062],
  [-19.562, 57.062],
  [-19.562, 49.562]
] as const;

const RIGHT_LOW_A_HOLES: readonly (readonly MetricXZ[])[] = [
  [
    [-17.938, 51.062],
    [-17.938, 55.438],
    [-15.812, 55.438],
    [-15.812, 51.062]
  ],
  [
    [2.562, 55.562],
    [2.562, 57.438],
    [4.562, 57.438],
    [4.562, 55.562]
  ],
  [
    [3.062, 58.062],
    [3.062, 59.938],
    [4.562, 59.938],
    [4.562, 58.062]
  ]
] as const;

const GLASS_UNDERPASS_POSITIVE_Z_MODEL: readonly MetricXZ[] = [
  [-14.562, -3.062],
  [-13.438, -3.062],
  [-13.438, -1.938],
  [-12.938, -1.938],
  [-12.938, -1.688],
  [-9.812, -1.688],
  [-9.812, -1.938],
  [-9.312, -1.938],
  [-9.312, -1.438],
  [-7.188, -1.438],
  [-7.188, -1.938],
  [-5.938, -1.688],
  [-6.062, 6.062],
  [-8.312, 6.188],
  [-8.688, 5.938],
  [-10.812, 5.938],
  [-11.188, 6.188],
  [-13.688, 6.188],
  [-13.688, -2.812],
  [-14.312, -2.812],
  [-14.438, -0.438]
] as const;

const GLASS_UNDERPASS_POSITIVE_Z_HOLES: readonly (readonly MetricXZ[])[] = [
  [
    [-12.562, -0.188],
    [-12.188, 0.688],
    [-11.438, 0.312],
    [-12.062, -0.312]
  ]
] as const;

export const UNDERTOW_UNDERPASS_NAV_AUDIT = Object.freeze({
  sourceYModelMeters: 3,
  sourceYProjectMeters: 0,
  rasterStepMeters: 0.125,
  simplifyToleranceMeters: 0.15,
  roofedFloorCellsPerSide: 3951,
  floorObstacleCellsPerSide: 88,
  walkableCellsPerSide: 3863,
  walkableAreaSquareMetersPerSide: 3863 * 0.125 * 0.125,
  walkableAreaSymmetryResidualSquareMeters: 0,
  mirrorXorCells: 0,
  confidence: 'HIGH' as const,
  evidenceIds: [
    'extracted-temple01-geometry',
    'user-turf-vector-blueprint',
    'user-underpass-capture-2026-09-25'
  ] as const,
  notes:
    'CI #631 confirms the positive/negative underpass navigable masks are exact 180-degree counterparts at 0.125m raster resolution after subtracting floor-level Pillar/Wall exclusions.'
});

function polygon(
  id: UndertowModelXZGeometryId,
  sourceYModelMeters: number,
  sourceYProjectMeters: number,
  modelOuter: readonly MetricXZ[],
  modelHoles: readonly (readonly MetricXZ[])[],
  notes: string,
  simplifyToleranceMeters: 0.15 | 0.2 = 0.2
): UndertowModelXZPolygon {
  return {
    id,
    sourceYModelMeters,
    sourceYProjectMeters,
    modelOuter,
    modelHoles,
    projectOuter: toProject(modelOuter),
    projectHoles: modelHoles.map(toProject),
    confidence: 'HIGH',
    rasterStepMeters: 0.125,
    simplifyToleranceMeters,
    evidenceIds: [
      'extracted-temple01-geometry',
      'user-turf-vector-blueprint'
    ],
    notes
  };
}

export const UNDERTOW_MODEL_XZ_GEOMETRY:
  readonly UndertowModelXZPolygon[] = [
    polygon(
      'center-low-team-a',
      3,
      0,
      CENTER_LOW_A_MODEL,
      CENTER_LOW_A_HOLES,
      'Temple01 Y=3.0m walkable component seeded immediately outside the verified center-step lower side. The contour is a 0.125m raster boundary simplified with <=0.20m RDP tolerance.'
    ),
    polygon(
      'center-low-team-b',
      3,
      0,
      mirror180(CENTER_LOW_A_MODEL),
      CENTER_LOW_A_HOLES.map(mirror180),
      '180-degree counterpart of the independently observed center-low component; the raw raster areas/bounds matched symmetrically.'
    ),
    polygon(
      'glass-underpass-positive-z',
      3,
      0,
      GLASS_UNDERPASS_POSITIVE_Z_MODEL,
      GLASS_UNDERPASS_POSITIVE_Z_HOLES,
      'Temple01 roofed model-Y=3.0 floor beneath the positive-Z glass structure after subtracting floor-level Pillar/Wall exclusions. CI #631 confirms exact 180-degree mask symmetry.',
      0.15
    ),
    polygon(
      'glass-underpass-negative-z',
      3,
      0,
      mirror180(GLASS_UNDERPASS_POSITIVE_Z_MODEL),
      GLASS_UNDERPASS_POSITIVE_Z_HOLES.map(mirror180),
      'Exact 180-degree counterpart of the positive-Z underpass navigable mask; CI #631 mirror XOR is zero cells.',
      0.15
    ),
    polygon(
      'right-low-team-a',
      7.5,
      4.5,
      RIGHT_LOW_A_MODEL,
      RIGHT_LOW_A_HOLES,
      'Temple01 Y=7.5m connected walkable component seeded on the locally verified lower side of the Team A right-small-drop lip.'
    ),
    polygon(
      'right-low-team-b',
      7.5,
      4.5,
      mirror180(RIGHT_LOW_A_MODEL),
      RIGHT_LOW_A_HOLES.map(mirror180),
      '180-degree counterpart of the right-low component; the independent Team B raster extraction matched the same area and mirrored bounds.'
    )
  ];

export function undertowModelXZGeometryAuditErrors(): readonly string[] {
  const errors: string[] = [];
  const byId = new Map(UNDERTOW_MODEL_XZ_GEOMETRY.map((item) => [item.id, item]));

  if (byId.get('center-low-team-a')?.sourceYProjectMeters !== 0) {
    errors.push('center-low model contour must remain on canonical project Y=0');
  }
  if (byId.get('right-low-team-a')?.sourceYProjectMeters !== 4.5) {
    errors.push('right-low model contour must remain on canonical project Y=4.5');
  }
  const underpasses = UNDERTOW_MODEL_XZ_GEOMETRY.filter((item) =>
    item.id.startsWith('glass-underpass-')
  );
  if (
    underpasses.length !== 2 ||
    underpasses.some(
      (item) =>
        item.sourceYModelMeters !== 3 ||
        item.sourceYProjectMeters !== 0 ||
        item.modelHoles.length !== 1 ||
        item.simplifyToleranceMeters !== 0.15
    )
  ) {
    errors.push('glass-underpass contours must remain the two audited model-Y=3.0 / project-Y=0 polygons with one support hole each');
  }
  if (
    UNDERTOW_UNDERPASS_NAV_AUDIT.roofedFloorCellsPerSide -
      UNDERTOW_UNDERPASS_NAV_AUDIT.floorObstacleCellsPerSide !==
    UNDERTOW_UNDERPASS_NAV_AUDIT.walkableCellsPerSide
  ) {
    errors.push('glass-underpass walkable-cell audit no longer balances roofed floor minus obstacles');
  }
  if (
    UNDERTOW_UNDERPASS_NAV_AUDIT.walkableAreaSymmetryResidualSquareMeters !== 0 ||
    UNDERTOW_UNDERPASS_NAV_AUDIT.mirrorXorCells !== 0
  ) {
    errors.push('glass-underpass navigable masks must remain exact 180-degree counterparts');
  }
  if (REG.locallyVerifiedMaxNearestDiscontinuityMeters > 0.5) {
    errors.push('local Temple01 registration no longer satisfies the 0.5m audit raster gate');
  }

  for (const item of UNDERTOW_MODEL_XZ_GEOMETRY) {
    if (item.modelOuter.length < 4 || item.projectOuter.length !== item.modelOuter.length) {
      errors.push(item.id + ': invalid outer contour');
    }
    for (let i = 0; i < item.modelOuter.length; i++) {
      const roundTrip = undertowProjectXZToTemple01ModelXZ(item.projectOuter[i]!);
      const source = item.modelOuter[i]!;
      if (Math.hypot(roundTrip[0] - source[0], roundTrip[1] - source[1]) > 1e-6) {
        errors.push(item.id + ': model/project transform round-trip failed');
        break;
      }
    }
  }

  return errors;
}
