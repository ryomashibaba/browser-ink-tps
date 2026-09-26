import { SurfaceFlags } from '../ink/types';
import type { StageFootprint } from './StageFootprint';

export type StageVector3 = readonly [number, number, number];
export type StageMaterialKey = 'dark' | 'medium' | 'light' | 'accent';
export type StageSolidCollisionBehavior = 'SOLID' | 'GRATE';

export interface StageTriangleMeshGeometry {
  /** Local-space vertices relative to StageSolidDefinition.center/rotation. */
  vertices: readonly StageVector3[];
  /** Triangle-list indices into vertices. */
  indices: readonly number[];
}

export interface StageSolidDefinition {
  id: string;
  center: StageVector3;
  size: StageVector3;
  rotationEulerDegrees?: StageVector3;
  material: StageMaterialKey;
  render: boolean;
  projectileBlocker: boolean;
  cameraBlocker: boolean;
  /**
   * SOLID is the frozen default. GRATE is semi-solid: Human form and thrown
   * subs collide, while Squid form and ordinary ink projectiles pass through.
   */
  collisionBehavior?: StageSolidCollisionBehavior;
  /**
   * Optional canonical local-XZ footprint for polygonal BLOCKOUT solids.
   * Coordinates use the solid's lower-left local X/Z bounds as (0,0).
   * When absent, the legacy full box remains unchanged.
   */
  footprint?: StageFootprint;
  /**
   * Optional exact local triangle mesh. Mutually exclusive with footprint.
   * Used only when source geometry itself supplies a non-box planar/mesh shape.
   */
  triangleMesh?: StageTriangleMeshGeometry;
}

export interface StagePaintSurfaceDefinition {
  id: string;
  backingSolidId: string;
  center: StageVector3;
  uAxis: StageVector3;
  vAxis: StageVector3;
  widthMeters: number;
  heightMeters: number;
  flags: SurfaceFlags;
}

export interface StageWorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface SplatZoneDefinition {
  id: string;
  surfaceId: string;
  centerU: number;
  centerV: number;
  widthMeters: number;
  heightMeters: number;
}

export interface StageMetadata {
  id: string;
  displayName: string;
  worldBounds: StageWorldBounds;
  teamASpawn: StageVector3;
  teamBSpawn: StageVector3;
  teamASpawnSlots: readonly StageVector3[];
  teamBSpawnSlots: readonly StageVector3[];
  tacticalNodes: readonly StageVector3[];
  splatZones: readonly SplatZoneDefinition[];
}

export interface StageDefinition {
  metadata: StageMetadata;
  solids: readonly StageSolidDefinition[];
  paintSurfaces: readonly StagePaintSurfaceDefinition[];
}

const scoreableFloor =
  SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Scoreable | SurfaceFlags.Floor;
const scoreableRamp =
  SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Scoreable | SurfaceFlags.Ramp;
const wall = SurfaceFlags.Paintable | SurfaceFlags.Swimmable | SurfaceFlags.Wall;

const rampAngle = 20 * Math.PI / 180;

/**
 * T8 world-interaction source of truth.
 *
 * - solids drive both PlayCanvas box rendering (when render=true) and Rapier static collision.
 * - projectile/camera blocker participation is declared here instead of duplicated elsewhere.
 * - PaintSurface definitions remain explicit so the frozen CPU-authoritative U/V basis is unchanged.
 */
export const PRODUCTION_STAGE_DEFINITION: StageDefinition = {
  metadata: {
    id: 'inkworks-junction',
    displayName: 'INKWORKS JUNCTION',
    worldBounds: {
      minX: -16.4,
      maxX: 16.4,
      minZ: -12.4,
      maxZ: 12.4
    },
    teamASpawn: [0, 0.95, 10.2],
    teamBSpawn: [0, 0.95, -10.2],
    teamASpawnSlots: [
      [-4.8, 0.12, 9.4],
      [-1.6, 0.12, 9.4],
      [1.6, 0.12, 9.4],
      [4.8, 0.12, 9.4]
    ],
    teamBSpawnSlots: [
      [-4.8, 0.12, -9.4],
      [-1.6, 0.12, -9.4],
      [1.6, 0.12, -9.4],
      [4.8, 0.12, -9.4]
    ],
    tacticalNodes: [
      [-12, 0.12, -8], [-6, 0.12, -8], [0, 0.12, -8], [6, 0.12, -8], [12, 0.12, -8],
      [-13, 0.12, -4], [-7, 0.12, -4], [-2, 0.12, -4], [4, 0.12, -4], [10, 0.12, -4],
      [-12, 0.12, 0], [-6, 0.12, 0], [0, 0.12, 0], [6, 0.12, 0], [12, 0.12, 0],
      [-10, 0.12, 4], [-4, 0.12, 4], [2, 0.12, 4], [7, 0.12, 4], [13, 0.12, 4],
      [-12, 0.12, 8], [-6, 0.12, 8], [0, 0.12, 8], [6, 0.12, 8], [12, 0.12, 8]
    ],
    splatZones: [
      {
        id: 'central-zone',
        surfaceId: 'main-floor',
        centerU: 16,
        centerV: 12,
        widthMeters: 8,
        heightMeters: 6
      }
    ]
  },
  solids: [
    {
      id: 'MainBase',
      center: [0, -0.19, 0],
      size: [32.5, 0.4, 24.5],
      material: 'dark',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'UpperSupport',
      center: [5.1, 1.30, 1.4],
      size: [7.8, 2.25, 5.8],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'LeftPillar',
      center: [-6.8, 1.25, 3.3],
      size: [1.6, 2.5, 1.6],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'CenterBlock',
      center: [-1.2, 0.75, -0.7],
      size: [2.3, 1.5, 2.0],
      material: 'light',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'Bridge',
      center: [-1.0, 2.25, 4.7],
      size: [7.2, 0.32, 1.25],
      material: 'accent',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'WallBacker',
      center: [-6.2, 2.55, -4.82],
      size: [8.8, 5.1, 0.18],
      material: 'dark',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RampCollider',
      center: [5.1, 1.13, -3.25],
      size: [5.2, 0.18, 7.1],
      rotationEulerDegrees: [-20, 0, 0],
      material: 'medium',
      render: false,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'NorthCoverWest',
      center: [-9.2, 0.55, 6.2],
      size: [3.2, 1.1, 2.4],
      material: 'light',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'NorthCoverEast',
      center: [8.8, 0.65, 6.5],
      size: [3.0, 1.3, 2.2],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'SouthCoverWest',
      center: [-8.8, 0.65, -6.5],
      size: [3.0, 1.3, 2.2],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'SouthCoverEast',
      center: [9.2, 0.55, -6.2],
      size: [3.2, 1.1, 2.4],
      material: 'light',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'WestMidCover',
      center: [-11.8, 0.75, 0.6],
      size: [2.4, 1.5, 3.0],
      material: 'dark',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'EastMidCover',
      center: [11.8, 0.75, -0.6],
      size: [2.4, 1.5, 3.0],
      material: 'dark',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'JunctionBlockNorth',
      center: [3.0, 0.60, 3.0],
      size: [2.6, 1.2, 2.4],
      material: 'accent',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'JunctionBlockSouth',
      center: [-3.0, 0.60, -3.0],
      size: [2.6, 1.2, 2.4],
      material: 'accent',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailNorth',
      center: [0, 0.42, 12.18],
      size: [32.6, 0.84, 0.25],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailSouth',
      center: [0, 0.42, -12.18],
      size: [32.6, 0.84, 0.25],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailEast',
      center: [16.18, 0.42, 0],
      size: [0.25, 0.84, 24.6],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailWest',
      center: [-16.18, 0.42, 0],
      size: [0.25, 0.84, 24.6],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    }
  ],
  paintSurfaces: [
    {
      id: 'main-floor',
      backingSolidId: 'MainBase',
      center: [0, 0.03, 0],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 32,
      heightMeters: 24,
      flags: scoreableFloor
    },
    {
      id: 'north-cover-west-top',
      backingSolidId: 'NorthCoverWest',
      center: [-9.2, 1.11, 6.2],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 3.0,
      heightMeters: 2.2,
      flags: scoreableFloor
    },
    {
      id: 'north-cover-east-top',
      backingSolidId: 'NorthCoverEast',
      center: [8.8, 1.31, 6.5],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.8,
      heightMeters: 2.0,
      flags: scoreableFloor
    },
    {
      id: 'south-cover-west-top',
      backingSolidId: 'SouthCoverWest',
      center: [-8.8, 1.31, -6.5],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.8,
      heightMeters: 2.0,
      flags: scoreableFloor
    },
    {
      id: 'south-cover-east-top',
      backingSolidId: 'SouthCoverEast',
      center: [9.2, 1.11, -6.2],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 3.0,
      heightMeters: 2.2,
      flags: scoreableFloor
    },
    {
      id: 'west-mid-cover-top',
      backingSolidId: 'WestMidCover',
      center: [-11.8, 1.51, 0.6],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.2,
      heightMeters: 2.8,
      flags: scoreableFloor
    },
    {
      id: 'east-mid-cover-top',
      backingSolidId: 'EastMidCover',
      center: [11.8, 1.51, -0.6],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.2,
      heightMeters: 2.8,
      flags: scoreableFloor
    },
    {
      id: 'junction-north-top',
      backingSolidId: 'JunctionBlockNorth',
      center: [3.0, 1.21, 3.0],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.4,
      heightMeters: 2.2,
      flags: scoreableFloor
    },
    {
      id: 'junction-south-top',
      backingSolidId: 'JunctionBlockSouth',
      center: [-3.0, 1.21, -3.0],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 2.4,
      heightMeters: 2.2,
      flags: scoreableFloor
    },
    {
      id: 'upper-floor',
      backingSolidId: 'UpperSupport',
      center: [5.1, 2.45, 1.4],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 7.4,
      heightMeters: 5.4,
      flags: scoreableFloor
    },
    {
      id: 'ramp-east',
      backingSolidId: 'RampCollider',
      center: [5.1, 1.22, -3.25],
      uAxis: [1, 0, 0],
      vAxis: [0, Math.sin(rampAngle), Math.cos(rampAngle)],
      widthMeters: 5.2,
      heightMeters: 7.1,
      flags: scoreableRamp
    },
    {
      id: 'wall-west',
      backingSolidId: 'WallBacker',
      center: [-6.2, 2.55, -4.7],
      uAxis: [1, 0, 0],
      vAxis: [0, 1, 0],
      widthMeters: 8.4,
      heightMeters: 5.0,
      flags: wall
    }
  ]
};


/**
 * Legacy alias retained so frozen T8-T12 imports do not need a broad rename.
 * T13 promotes this same canonical geometry to the production-stage contract.
 */
export const TEST_STAGE_DEFINITION = PRODUCTION_STAGE_DEFINITION;
