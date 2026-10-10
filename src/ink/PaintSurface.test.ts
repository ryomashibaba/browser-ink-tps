import { Vec3 } from 'playcanvas';
import { describe, expect, it } from 'vitest';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintSurface } from './PaintSurface';
import {
  PaintEventType,
  PaintSource,
  SurfaceFlags,
  Team
} from './types';
import type { StageFootprint } from '../stage/StageFootprint';

const scoreableFloor =
  SurfaceFlags.Paintable |
  SurfaceFlags.Swimmable |
  SurfaceFlags.Scoreable |
  SurfaceFlags.Floor;

const footprint: StageFootprint = {
  outer: [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4]
  ],
  holes: [[
    [1, 1],
    [3, 1],
    [3, 3],
    [1, 3]
  ]],
  cellSizeMeters: 1
};

function surface(masked: boolean): PaintSurface {
  return new PaintSurface(
    masked ? 'masked' : 'rect',
    new Vec3(0, 0, 0),
    new Vec3(1, 0, 0),
    new Vec3(0, 0, 1),
    4,
    4,
    1,
    scoreableFloor,
    2,
    masked ? footprint : undefined
  );
}

describe('PaintSurface footprint authority', () => {
  it('uses the same footprint for ray projection, active cells and score area', () => {
    const value = surface(true);

    expect(value.projectWorldPoint(new Vec3(0, 0, 0)).inside).toBe(false);
    expect(value.projectWorldPoint(new Vec3(-1.5, 0, -1.5)).inside).toBe(true);
    expect(value.intersectRay(new Vec3(0, 2, 0), new Vec3(0, -1, 0))).toBeNull();
    expect(value.isCellActive(1, 1)).toBe(false);
    expect(value.flagsGrid[value.index(1, 1)]).toBe(0);
    expect(value.scoreableAreaMeters2).toBe(12);
    expect(value.activeFootprintRectangles).not.toBeNull();
  });

  it('prevents authoritative CPU paint from entering footprint holes', () => {
    const gameplay = new GameplayInkSystem();
    const value = surface(true);
    gameplay.registerSurface(value);

    const result = gameplay.apply({
      tick: 1,
      source: PaintSource.Debug,
      team: Team.A,
      surfaceId: value.id,
      centerU: 2,
      centerV: 2,
      radiusU: 5,
      radiusV: 5,
      angle: 0,
      type: PaintEventType.Debug,
      strength: 1
    });

    expect(result.changedCells).toBe(12);
    expect(value.ownerGrid[value.index(1, 1)]).toBe(Team.Neutral);
    expect(gameplay.snapshot()).toMatchObject({
      areaA: 12,
      totalScoreableArea: 12,
      percentA: 100
    });
  });

  it('preserves the frozen legacy rectangle behavior when no footprint exists', () => {
    const value = surface(false);
    expect(value.scoreableAreaMeters2).toBe(16);
    expect(value.activeFootprintRectangles).toBeNull();
    expect(value.projectWorldPoint(new Vec3(0, 0, 0)).inside).toBe(true);
    expect(value.isCellActive(1, 1)).toBe(true);
  });
});
