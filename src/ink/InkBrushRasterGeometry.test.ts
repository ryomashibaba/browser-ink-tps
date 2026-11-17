import { describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GameplayInkSystem } from './GameplayInkSystem';
import { buildInkBrushRasterQuads, type InkBrushQuad } from './InkBrushRasterGeometry';
import { localMetersToBrushAtlas } from './AtlasCoordinates';
import { PaintSurface } from './PaintSurface';
import { PaintEventType, PaintSource, SurfaceFlags, Team, type PaintEvent } from './types';
import type { StageFootprint } from '../stage/StageFootprint';

function surface(id: string, width = 4, footprint?: StageFootprint): PaintSurface {
  const s = new PaintSurface(
    id, new Vec3(), new Vec3(1, 0, 0), new Vec3(0, 0, -1),
    width, width, 1, SurfaceFlags.Paintable | SurfaceFlags.Floor, 2, footprint
  );
  s.atlasRect = {
    x: 16, y: 32,
    width: Math.ceil(width * 64), height: Math.ceil(width * 64),
    atlasSize: 512, pixelsPerMeter: 64
  };
  return s;
}

function paintEvent(surfaceId: string, overrides: Partial<PaintEvent> = {}): PaintEvent {
  return {
    tick: 1,
    source: PaintSource.Human,
    team: Team.A,
    surfaceId,
    centerU: 1.5,
    centerV: 1.5,
    radiusU: 1.3,
    radiusV: 1.3,
    angle: 0,
    type: PaintEventType.Impact,
    strength: 1,
    ...overrides
  };
}

/**
 * CPU-only oracle for the existing brush fragment math. Uses the actual
 * output vertex UVs, clips and ellipse rejection used by GLSL/WGSL.
 * This is geometry/raster validation, NOT a live WebGL screenshot PASS.
 */
function simulatedFragmentAtLocal(
  s: PaintSurface,
  quads: readonly InkBrushQuad[],
  u: number,
  v: number
): boolean {
  const atlasPoint = localMetersToBrushAtlas(s.atlasRect!, u, v);
  return quads.some((quad) => {
    const x = atlasPoint.x;
    const y = atlasPoint.y;
    if (x < quad.clipMinX || x > quad.clipMaxX ||
        y < quad.clipMinY || y > quad.clipMaxY) return false;

    const left = quad.clipMinX;
    const right = quad.clipMaxX;
    const top = quad.clipMinY;
    const bottom = quad.clipMaxY;
    const fx = (x - left) / (right - left);
    const fy = (bottom - y) / (bottom - top);
    const [bl, br, tr, tl] = quad.vertices;
    const uvX = (bl.uvX * (1 - fx) + br.uvX * fx) * (1 - fy) +
      (tl.uvX * (1 - fx) + tr.uvX * fx) * fy;
    const uvY = (bl.uvY * (1 - fx) + br.uvY * fx) * (1 - fy) +
      (tl.uvY * (1 - fx) + tr.uvY * fx) * fy;
    const px = uvX * 2 - 1;
    const py = uvY * 2 - 1;
    return px * px + py * py <= 1 + 1e-7;
  });
}

function paintAndQuads(s: PaintSurface, event: PaintEvent) {
  const gameplay = new GameplayInkSystem();
  gameplay.registerSurface(s);
  const raster = gameplay.apply(event);
  const quads = buildInkBrushRasterQuads(s, event, raster.paintableRuns);
  return { gameplay, raster, quads };
}

describe('T21 V28 GPU brush / CPU cell-authority geometry (#16)', () => {
  it('never emits fragments inside a neighboring non-paintable raster cell', () => {
    const s = surface('authoritative-floor');
    s.flagsGrid[s.index(1, 1)] = SurfaceFlags.Floor;
    const event = paintEvent(s.id);
    const { raster, quads, gameplay } = paintAndQuads(s, event);
    expect(raster.rasterEligibleCells).toBe(4);
    expect(quads.length).toBeGreaterThan(0);
    expect(raster.paintableRuns.length).toBe(quads.length);

    // Regression target: the old full-GPU ellipse painted this forbidden
    // cell because a nearby cell was paintable.
    for (let y = 1.05; y < 1.95; y += 0.05) {
      for (let x = 1.05; x < 1.95; x += 0.05) {
        expect(simulatedFragmentAtLocal(s, quads, x, y)).toBe(false);
      }
    }
    expect(simulatedFragmentAtLocal(s, quads, 0.5, 1.5)).toBe(true);
    expect(simulatedFragmentAtLocal(s, quads, 2.5, 1.5)).toBe(true);
    expect(s.ownerGrid[s.index(1, 1)]).toBe(Team.Neutral);
    expect(gameplay.snapshot().totalScoreableArea).toBe(1e-9);
  });

  it('preserves rotated brush shading at every authoritative cell center', () => {
    const s = surface('rotated-original-floor', 6);
    s.flagsGrid[s.index(2, 2)] = SurfaceFlags.Floor;
    s.flagsGrid[s.index(3, 3)] = SurfaceFlags.Floor;
    const event = paintEvent(s.id, {
      centerU: 3.0, centerV: 3.0,
      radiusU: 2.4, radiusV: 1.35, angle: Math.PI / 3
    });
    const { raster, quads } = paintAndQuads(s, event);
    expect(raster.rasterEligibleCells).toBeGreaterThan(0);
    for (let y = 0; y < s.heightCells; y += 1) {
      for (let x = 0; x < s.widthCells; x += 1) {
        expect(simulatedFragmentAtLocal(s, quads, x + 0.5, y + 0.5))
          .toBe(s.ownerGrid[s.index(x, y)] === Team.A);
      }
    }
  });

  it('does not bleed into rasterized footprint holes', () => {
    const footprint: StageFootprint = {
      outer: [[0, 0], [4, 0], [4, 4], [0, 4]],
      holes: [[[1, 1], [3, 1], [3, 3], [1, 3]]],
      cellSizeMeters: 1
    };
    const s = surface('original-footprint-hole', 4, footprint);
    const event = paintEvent(s.id, { centerU: 2, centerV: 2, radiusU: 5, radiusV: 5 });
    const { raster, quads } = paintAndQuads(s, event);
    expect(raster.rasterEligibleCells).toBe(12);
    for (let y = 1.05; y < 2.95; y += 0.1) {
      for (let x = 1.05; x < 2.95; x += 0.1) {
        expect(simulatedFragmentAtLocal(s, quads, x, y)).toBe(false);
      }
    }
    expect(simulatedFragmentAtLocal(s, quads, 0.5, 0.5)).toBe(true);
  });

  it('keeps valid same-team wetness refresh runs with no new score', () => {
    const s = surface('unscored-repaint');
    const gameplay = new GameplayInkSystem();
    gameplay.registerSurface(s);
    const event = paintEvent(s.id);
    const first = gameplay.apply(event);
    const second = gameplay.apply({ ...event, tick: 2 });
    expect(first.changedCells).toBeGreaterThan(0);
    expect(second.changedCells).toBe(0);
    expect(second.rasterAlreadyTeamOwnedCells).toBe(first.rasterEligibleCells);
    expect(buildInkBrushRasterQuads(s, event, second.paintableRuns).length)
      .toBeGreaterThan(0);
    expect(gameplay.snapshot()).toMatchObject({ areaA: 0, areaB: 0 });
  });
});
