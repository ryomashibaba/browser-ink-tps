export enum Team {
  B = -1,
  Neutral = 0,
  A = 1
}

export enum PaintEventType {
  Foot = 'FOOT',
  MidDroplet = 'MID_DROPLET',
  Impact = 'IMPACT',
  WallImpact = 'WALL_IMPACT',
  Bomb = 'BOMB',
  Special = 'SPECIAL',
  Debug = 'DEBUG'
}

export enum PaintSource {
  Human = 'HUMAN',
  Cpu = 'CPU',
  Special = 'SPECIAL',
  Debug = 'DEBUG',
  System = 'SYSTEM'
}

export enum SurfaceFlags {
  Paintable = 1 << 0,
  Swimmable = 1 << 1,
  Scoreable = 1 << 2,
  Wall = 1 << 3,
  Floor = 1 << 4,
  Ramp = 1 << 5,
  SpawnProtected = 1 << 6
}

export interface PaintEvent {
  tick: number;
  source: PaintSource;
  team: Team.A | Team.B;
  surfaceId: string;
  /** local surface coordinate in meters from the lower-left U edge */
  centerU: number;
  /** local surface coordinate in meters from the lower-left V edge */
  centerV: number;
  radiusU: number;
  radiusV: number;
  /** radians, measured in local surface U/V space */
  angle: number;
  type: PaintEventType;
  /** 0..1. T0-T3 uses this primarily as visual wetness. */
  strength: number;
}

export interface AtlasRect {
  x: number;
  y: number;
  width: number;
  height: number;
  atlasSize: number;
  pixelsPerMeter: number;
}

export interface TurfSnapshot {
  areaA: number;
  areaB: number;
  neutralArea: number;
  totalScoreableArea: number;
  percentA: number;
  percentB: number;
}
