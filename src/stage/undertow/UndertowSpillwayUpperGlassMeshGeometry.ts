import type {
  StageTriangleMeshGeometry,
  StageVector3
} from '../StageDefinition';

export type UndertowUpperGlassMeshId =
  | 'upper-glass-positive-z'
  | 'upper-glass-negative-z';

export interface UndertowUpperGlassMeshRecord {
  id: UndertowUpperGlassMeshId;
  side: 'POSITIVE_Z' | 'NEGATIVE_Z';
  sourceObject: 'FldObj_Temple01_PntSet_pCube21560_1__Glass01';
  mesh: StageTriangleMeshGeometry;
  projectYMinMeters: 5;
  projectYMaxMeters: 7.5;
  renderGeometryReady: true;
  collisionAuthorityReady: false;
  paintAuthority: 'UNINKABLE';
  confidence: 'HIGH';
  notes: string;
}

const POSITIVE_VERTICES = [[-10.439357,5.91,3.307737],[-10.211092,5.91,3.773354],[-10.347142,6.025,3.378034],[-3.582554,7.41,10.226121],[-3.810818,7.41,9.760505],[-3.72133,7.45,10.178651],[-7.459412,7.41,1.846846],[-7.231148,7.41,2.312462],[-7.320636,7.5,1.894316],[-6.562498,5.91,11.687013],[-6.790763,5.91,11.221397],[-6.701274,6,11.639543],[-10.673073,6,3.537819],[-10.397339,5.91,3.864659],[-10.625603,5.91,3.399043],[-6.375343,6.025,11.479758],[-6.604516,5.91,11.130091],[-6.376252,5.91,11.595707],[-7.693129,7.45,2.076928],[-7.417394,7.41,2.403768],[-7.645659,7.41,1.938152],[-3.348837,7.5,9.99604],[-3.624572,7.41,9.669199],[-3.396307,7.41,10.134816],[-6.170263,5.1,11.494723],[-6.398527,5.1,11.029107],[-6.122793,5.05,11.355947],[-7.237313,6.6,1.737964],[-7.009049,6.6,2.20358],[-7.238222,6.475,1.853913],[-10.419614,5.1,3.298059],[-10.19135,5.1,3.763675],[-10.467085,5,3.436835],[-6.495286,5,11.538558],[-6.584774,5.1,11.120413],[-6.35651,5.1,11.586029],[-10.094592,5.05,3.254224],[-10.005104,5.1,3.67237],[-10.233368,5.1,3.206753],[-3.266423,6.475,9.955637],[-3.402473,6.6,9.560317],[-3.174208,6.6,10.025934],[-2.997554,6.59,9.93933],[-3.225818,6.59,9.473714],[-2.950083,6.5,9.800554],[-6.921882,6.5,1.698831],[-6.832394,6.59,2.116977],[-7.060658,6.59,1.65136],[-6.389404,7.5,1.437788],[-2.417604,7.5,9.539511],[-2.278828,7.41,9.586981],[-6.341933,7.41,1.299011],[-9.029356,6,12.780864],[-13.001155,6,4.679141],[-9.076826,5.91,12.91964],[-13.139931,5.91,4.63167],[-6.651078,5.91,11.152917],[-10.257654,5.91,3.79618],[-7.370833,7.41,2.380941],[-3.764257,7.41,9.737679],[-3.671133,7.41,9.692026],[-7.27771,7.41,2.335289],[-10.350777,5.91,3.841833],[-6.744201,5.91,11.19857],[-9.029356,5,12.780864],[-13.001155,5,4.679141],[-9.076826,5.1,12.91964],[-13.139931,5.1,4.63167],[-10.051665,5.1,3.695196],[-6.445089,5.1,11.051933],[-3.355911,6.6,9.537491],[-6.962487,6.6,2.180754],[-6.538212,5.1,11.097586],[-10.144788,5.1,3.740849],[-2.417604,6.5,9.539511],[-6.389404,6.5,1.437788],[-6.341933,6.59,1.299011],[-2.278828,6.59,9.586981],[-6.878956,6.59,2.139803],[-3.27238,6.59,9.49654],[-2.231358,6.85,9.448205],[-6.203157,6.85,1.346482],[-2.231358,7.15,9.448205],[-6.203157,7.15,1.346482],[-6.332621,6.75,1.294446],[-2.269516,6.75,9.582416],[-6.332621,7.25,1.294446],[-2.269516,7.25,9.582416]] as const;
const POSITIVE_INDICES = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,2,15,18,15,5,18,17,3,15,3,5,15,0,2,20,2,18,20,8,21,48,21,49,48,23,50,21,50,49,21,50,51,49,51,48,49,51,6,48,6,8,48,52,11,53,11,12,53,54,9,52,9,11,52,14,55,12,55,53,12,55,54,53,54,52,53,16,1,56,1,57,56,19,4,58,4,59,58,22,7,60,7,61,60,13,10,62,10,63,62,11,10,12,10,13,12,2,1,15,1,16,15,5,4,18,4,19,18,8,7,21,7,22,21,39,26,29,26,36,29,41,24,39,24,26,39,27,29,38,29,36,38,33,64,32,64,65,32,35,66,33,66,64,33,66,67,64,67,65,64,67,30,65,30,32,65,37,25,68,25,69,68,40,28,70,28,71,70,34,31,72,31,73,72,32,31,33,31,34,33,26,25,36,25,37,36,29,28,39,28,40,39,44,45,74,45,75,74,47,76,45,76,75,45,76,77,75,77,74,75,77,42,74,42,44,74,46,43,78,43,79,78,44,43,45,43,46,45,80,81,82,81,83,82,81,80,84,80,85,84,84,86,81,86,83,81,86,87,83,87,82,83,87,85,82,85,80,82] as const;
const NEGATIVE_VERTICES = [[10.668725,5.91,-3.113173],[10.44046,5.91,-3.578789],[10.57651,6.025,-3.18347],[3.811922,7.41,-10.031557],[4.040187,7.41,-9.565941],[3.950698,7.45,-9.984087],[7.688781,7.41,-1.652282],[7.460516,7.41,-2.117898],[7.550004,7.5,-1.699752],[6.791866,5.91,-11.492449],[7.020131,5.91,-11.026832],[6.930643,6,-11.444978],[10.902442,6,-3.343255],[10.626707,5.91,-3.670095],[10.854971,5.91,-3.204479],[6.604711,6.025,-11.285193],[6.833884,5.91,-10.935527],[6.60562,5.91,-11.401143],[7.922497,7.45,-1.882363],[7.646763,7.41,-2.209204],[7.875027,7.41,-1.743587],[3.578205,7.5,-9.801475],[3.85394,7.41,-9.474635],[3.625676,7.41,-9.940251],[6.399631,5.1,-11.300159],[6.627896,5.1,-10.834543],[6.352161,5.05,-11.161383],[7.466682,6.6,-1.543399],[7.238417,6.6,-2.009016],[7.46759,6.475,-1.659349],[10.648983,5.1,-3.103495],[10.420718,5.1,-3.569111],[10.696453,5,-3.242271],[6.724654,5,-11.343994],[6.814142,5.1,-10.925848],[6.585878,5.1,-11.391465],[10.32396,5.05,-3.059659],[10.234472,5.1,-3.477805],[10.462736,5.1,-3.012189],[3.495791,6.475,-9.761072],[3.631841,6.6,-9.365753],[3.403577,6.6,-9.831369],[3.226922,6.59,-9.744766],[3.455186,6.59,-9.27915],[3.179452,6.5,-9.60599],[7.151251,6.5,-1.504266],[7.061762,6.59,-1.922412],[7.290027,6.59,-1.456796],[6.618772,7.5,-1.243223],[2.646973,7.5,-9.344947],[2.508197,7.41,-9.392417],[6.571301,7.41,-1.104447],[9.258724,6,-12.5863],[13.230523,6,-4.484577],[9.306194,5.91,-12.725076],[13.369299,5.91,-4.437106],[6.880446,5.91,-10.958353],[10.487022,5.91,-3.601616],[7.600201,7.41,-2.186377],[3.993625,7.41,-9.543114],[3.900502,7.41,-9.497462],[7.507078,7.41,-2.140724],[10.580145,5.91,-3.647269],[6.973569,5.91,-11.004006],[9.258724,5,-12.5863],[13.230523,5,-4.484577],[9.306194,5.1,-12.725076],[13.369299,5.1,-4.437106],[10.281033,5.1,-3.500632],[6.674457,5.1,-10.857369],[3.585279,6.6,-9.342927],[7.191856,6.6,-1.986189],[6.767581,5.1,-10.903022],[10.374157,5.1,-3.546285],[2.646973,6.5,-9.344947],[6.618772,6.5,-1.243223],[6.571301,6.59,-1.104447],[2.508197,6.59,-9.392417],[7.108324,6.59,-1.945239],[3.501748,6.59,-9.301976],[2.460726,6.85,-9.253641],[6.432525,6.85,-1.151918],[2.460726,7.15,-9.253641],[6.432525,7.15,-1.151918],[6.561989,6.75,-1.099882],[2.498884,6.75,-9.387852],[6.561989,7.25,-1.099882],[2.498884,7.25,-9.387852]] as const;
const NEGATIVE_INDICES = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,2,15,18,15,5,18,17,3,15,3,5,15,0,2,20,2,18,20,8,21,48,21,49,48,23,50,21,50,49,21,50,51,49,51,48,49,51,6,48,6,8,48,52,11,53,11,12,53,54,9,52,9,11,52,14,55,12,55,53,12,55,54,53,54,52,53,16,1,56,1,57,56,19,4,58,4,59,58,22,7,60,7,61,60,13,10,62,10,63,62,11,10,12,10,13,12,2,1,15,1,16,15,5,4,18,4,19,18,8,7,21,7,22,21,39,26,29,26,36,29,41,24,39,24,26,39,27,29,38,29,36,38,33,64,32,64,65,32,35,66,33,66,64,33,66,67,64,67,65,64,67,30,65,30,32,65,37,25,68,25,69,68,40,28,70,28,71,70,34,31,72,31,73,72,32,31,33,31,34,33,26,25,36,25,37,36,29,28,39,28,40,39,44,45,74,45,75,74,47,76,45,76,75,45,76,77,75,77,74,75,77,42,74,42,44,74,46,43,78,43,79,78,44,43,45,43,46,45,80,81,82,81,83,82,81,80,84,80,85,84,84,86,81,86,83,81,86,87,83,87,82,83,87,85,82,85,80,82] as const;

/**
 * Exact current Temple01 Glass01 visual source meshes for the two central
 * upper-glass structures.
 *
 * This is VISUAL/SOURCE geometry only. Glass01 is not promoted as collision
 * authority: BridgeMetal/support geometry and query semantics remain separate
 * T21-D concerns.
 */
export const UNDERTOW_UPPER_GLASS_SOURCE_MESHES:
  readonly UndertowUpperGlassMeshRecord[] = [
  {
    id: 'upper-glass-positive-z',
    side: 'POSITIVE_Z',
    sourceObject: 'FldObj_Temple01_PntSet_pCube21560_1__Glass01',
    mesh: {
      vertices: POSITIVE_VERTICES,
      indices: POSITIVE_INDICES
    },
    projectYMinMeters: 5,
    projectYMaxMeters: 7.5,
    renderGeometryReady: true,
    collisionAuthorityReady: false,
    paintAuthority: 'UNINKABLE',
    confidence: 'HIGH',
    notes:
      'CI #663: 102 source triangles / 88 compact project-space vertices. Temple01 model-space counterpart XOR is zero.'
  },
  {
    id: 'upper-glass-negative-z',
    side: 'NEGATIVE_Z',
    sourceObject: 'FldObj_Temple01_PntSet_pCube21560_1__Glass01',
    mesh: {
      vertices: NEGATIVE_VERTICES,
      indices: NEGATIVE_INDICES
    },
    projectYMinMeters: 5,
    projectYMaxMeters: 7.5,
    renderGeometryReady: true,
    collisionAuthorityReady: false,
    paintAuthority: 'UNINKABLE',
    confidence: 'HIGH',
    notes:
      'CI #663: exact current Temple01 counterpart. Project-space symmetry is about the registered model-origin point, not project (0,0).'
  }
] as const;

export const UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT = Object.freeze({
  runNumber: 663,
  sourceObject: 'FldObj_Temple01_PntSet_pCube21560_1__Glass01',
  facesPerSide: 102,
  verticesPerSide: 88,
  indicesPerSide: 306,
  projectYMinMeters: 5,
  projectYMaxMeters: 7.5,
  modelSpaceMirrorXorVertices: 0,
  modelSpaceMirrorMissingVertices: 0,
  modelSpaceMirrorExtraVertices: 0,
  registeredSymmetryCenterProjectXZ: [0.11468414426408223, 0.09728214772841207] as const,
  collisionAuthorityReady: false,
  projectRegisteredCenterMirrorToleranceMeters: 0.000002,
  observedRoundedProjectMirrorMaxResidualMeters: 0.0000010013,
  confidence: 'HIGH' as const,
  notes:
    'The source visual shells are exact and symmetric in Temple01 model space. Registration translation means project-origin negation is not the symmetry operator. Collision/projectile/camera behavior is intentionally not inferred from Glass01 visual geometry.'
});

export function undertowUpperGlassSourceMeshErrors(): readonly string[] {
  const errors: string[] = [];
  const [positive, negative] = UNDERTOW_UPPER_GLASS_SOURCE_MESHES;

  for (const record of UNDERTOW_UPPER_GLASS_SOURCE_MESHES) {
    if (record.mesh.vertices.length !== 88) {
      errors.push(`${record.id}: expected 88 compact vertices`);
    }
    if (record.mesh.indices.length !== 306) {
      errors.push(`${record.id}: expected 306 triangle indices`);
    }
    if (record.mesh.indices.length % 3 !== 0) {
      errors.push(`${record.id}: triangle index list is not divisible by three`);
    }
    if (record.mesh.indices.length / 3 !== 102) {
      errors.push(`${record.id}: expected 102 source triangles`);
    }
    const ys = record.mesh.vertices.map((vertex) => vertex[1]);
    if (Math.min(...ys) !== 5 || Math.max(...ys) !== 7.5) {
      errors.push(`${record.id}: project Y range drifted`);
    }
    if (record.collisionAuthorityReady) {
      errors.push(`${record.id}: Glass01 visual mesh must not become collision authority`);
    }
  }

  if (!positive || !negative) return [...errors, 'both upper-glass records are required'];

  const [cx, cz] =
    UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.registeredSymmetryCenterProjectXZ;
  const tolerance =
    UNDERTOW_UPPER_GLASS_SOURCE_MESH_AUDIT.projectRegisteredCenterMirrorToleranceMeters;
  let maxResidual = 0;
  for (const [x, y, z] of positive.mesh.vertices) {
    const mirrored: StageVector3 = [
      2 * cx - x,
      y,
      2 * cz - z
    ];
    let nearest = Number.POSITIVE_INFINITY;
    for (const candidate of negative.mesh.vertices) {
      nearest = Math.min(nearest, distance3(mirrored, candidate));
    }
    maxResidual = Math.max(maxResidual, nearest);
  }
  if (maxResidual > tolerance) {
    errors.push(
      `upper-glass project-space registered-center symmetry residual ${maxResidual} exceeds ${tolerance}`
    );
  }
  return errors;
}

function distance3(a: StageVector3, b: StageVector3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
