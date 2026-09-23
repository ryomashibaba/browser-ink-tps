import { SurfaceFlags } from '../ink/types';

export type StageVector3 = readonly [number, number, number];
export type StageMaterialKey = 'dark' | 'medium' | 'light' | 'accent';

export interface StageSolidDefinition {
  id: string;
  center: StageVector3;
  size: StageVector3;
  rotationEulerDegrees?: StageVector3;
  material: StageMaterialKey;
  render: boolean;
  projectileBlocker: boolean;
  cameraBlocker: boolean;
}

export interface StagePaintSurfaceDefinition {
  id: string;
  center: StageVector3;
  uAxis: StageVector3;
  vAxis: StageVector3;
  widthMeters: number;
  heightMeters: number;
  flags: SurfaceFlags;
}

export interface StageDefinition {
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
export const TEST_STAGE_DEFINITION: StageDefinition = {
  solids: [
    {
      id: 'MainBase',
      center: [0, -0.19, 0],
      size: [18.5, 0.4, 14.5],
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
      id: 'RailNorth',
      center: [0, 0.42, 7.18],
      size: [18.6, 0.84, 0.25],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailSouth',
      center: [0, 0.42, -7.18],
      size: [18.6, 0.84, 0.25],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailEast',
      center: [9.18, 0.42, 0],
      size: [0.25, 0.84, 14.6],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    },
    {
      id: 'RailWest',
      center: [-9.18, 0.42, 0],
      size: [0.25, 0.84, 14.6],
      material: 'medium',
      render: true,
      projectileBlocker: true,
      cameraBlocker: true
    }
  ],
  paintSurfaces: [
    {
      id: 'main-floor',
      center: [0, 0.03, 0],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 18,
      heightMeters: 14,
      flags: scoreableFloor
    },
    {
      id: 'upper-floor',
      center: [5.1, 2.45, 1.4],
      uAxis: [1, 0, 0],
      vAxis: [0, 0, 1],
      widthMeters: 7.4,
      heightMeters: 5.4,
      flags: scoreableFloor
    },
    {
      id: 'ramp-east',
      center: [5.1, 1.22, -3.25],
      uAxis: [1, 0, 0],
      vAxis: [0, Math.sin(rampAngle), Math.cos(rampAngle)],
      widthMeters: 5.2,
      heightMeters: 7.1,
      flags: scoreableRamp
    },
    {
      id: 'wall-west',
      center: [-6.2, 2.55, -4.7],
      uAxis: [1, 0, 0],
      vAxis: [0, 1, 0],
      widthMeters: 8.4,
      heightMeters: 5.0,
      flags: wall
    }
  ]
};
