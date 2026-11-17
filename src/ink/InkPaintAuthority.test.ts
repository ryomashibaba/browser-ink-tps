import { describe, expect, it, vi } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintCoordinator, type PaintRequest } from './PaintCoordinator';
import { PaintSurface } from './PaintSurface';
import type { GpuInkAtlas } from './GpuInkAtlas';
import { PerformanceStats } from '../core/PerformanceStats';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from './types';

function registeredSurface(id: string, flags = SurfaceFlags.Paintable | SurfaceFlags.Floor) {
  return new PaintSurface(
    id,
    new Vec3(),
    new Vec3(1, 0, 0),
    new Vec3(0, 0, -1),
    4, 4, 1, flags, 2
  );
}

function request(surfaceId: string, overrides: Partial<PaintRequest> = {}): PaintRequest & {source:PaintSource} {
  return {
    team: Team.A,
    surfaceId,
    centerU: 1.5,
    centerV: 1.5,
    radiusU: 1.3,
    radiusV: 1.3,
    angle: 0,
    strength: 1,
    type: PaintEventType.Impact,
    ...overrides,
    // Direct GameplayInkSystem.apply requires a guaranteed real source.
    source: PaintSource.Human
  };
}

function harness(surface: PaintSurface) {
  const gameplay = new GameplayInkSystem();
  gameplay.registerSurface(surface);
  const gpu = { queue: vi.fn(), clear: vi.fn() } as unknown as GpuInkAtlas;
  const coordinator = new PaintCoordinator(gameplay, gpu, new PerformanceStats());
  return { gameplay, gpu, coordinator };
}

describe('T21 V28 authoritative ink and visual admission', () => {
  it('paints only active paintable cells, including when a registered footprint cell is excluded', () => {
    const surface = registeredSurface('real-unscored-floor');
    surface.flagsGrid[surface.index(1, 1)] = SurfaceFlags.Floor;
    const { gameplay } = harness(surface);
    const result = gameplay.apply({ ...request(surface.id), tick: 1 });

    // The 1.3m round brush covers five cell centers; one is not paintable.
    expect(result.rasterEligibleCells).toBe(4);
    expect(result.changedCells).toBe(4);
    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.Neutral);
    expect(surface.ownerGrid[surface.index(0, 1)]).toBe(Team.A);
    expect(surface.ownerGrid[surface.index(2, 1)]).toBe(Team.A);
    expect(gameplay.snapshot()).toMatchObject({
      areaA: 0,
      areaB: 0,
      totalScoreableArea: 1e-9,
      percentA: 0,
      percentB: 0
    });
  });

  it('does not paint or emit GPU coverage on a registered but nonpaintable surface', () => {
    const surface = registeredSurface('original-solid-cover', SurfaceFlags.Floor);
    const { gameplay, gpu, coordinator } = harness(surface);
    const stamp = request(surface.id);
    const result = gameplay.apply({ ...stamp, tick: 0 });
    expect(result.changedCells).toBe(0);
    expect(result.rasterEligibleCells).toBe(0);
    coordinator.enqueue(stamp);
    coordinator.processTick(1);
    expect(gpu.queue).not.toHaveBeenCalled();
    expect(surface.ownerGrid.every((owner) => owner === Team.Neutral)).toBe(true);
    expect(gameplay.snapshot().areaA).toBe(0);
  });

  it('keeps valid same-team visual restamps but rejects invalid or blocked brush requests', () => {
    const surface = registeredSurface('original-paint-raster');
    const { gameplay, gpu, coordinator } = harness(surface);
    const stamp = request(surface.id, { radiusU: 0.4, radiusV: 0.4 });

    coordinator.enqueue(stamp);
    coordinator.processTick(1);
    expect(gpu.queue).toHaveBeenCalledTimes(1);
    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.A);

    // The second stamp changes no ownership but still refreshes visible ink.
    coordinator.enqueue(stamp);
    coordinator.processTick(2);
    expect(gpu.queue).toHaveBeenCalledTimes(2);

    // Per-cell authorization and world bounds prevent phantom splashes.
    surface.flagsGrid[surface.index(1, 1)] = SurfaceFlags.Floor;
    coordinator.enqueue(stamp);
    coordinator.enqueue(request(surface.id, { centerU: 100, centerV: 100 }));
    coordinator.processTick(3);
    expect(gpu.queue).toHaveBeenCalledTimes(2);
    expect(gameplay.snapshot().totalScoreableArea).toBe(1e-9);
  });

  it('rejects non-finite brush coordinates, radii, angle and strength without painting', () => {
    const surface = registeredSurface('finite-original-raster');
    const { gameplay, gpu, coordinator } = harness(surface);
    const malformed: Partial<PaintRequest>[] = [
      { centerU: Number.NaN },
      { centerV: Number.POSITIVE_INFINITY },
      { radiusU: Number.POSITIVE_INFINITY },
      { radiusV: Number.NaN },
      { angle: Number.NaN },
      { strength: Number.POSITIVE_INFINITY },
      { radiusU: 0 },
      { strength: 0 }
    ];

    for (const overrides of malformed) {
      const stamp = request(surface.id, overrides);
      const result = gameplay.apply({ ...stamp, tick: 1 });
      expect(result.changedCells).toBe(0);
      expect(result.rasterEligibleCells).toBe(0);
      coordinator.enqueue(stamp);
    }
    coordinator.processTick(2);
    expect(gpu.queue).not.toHaveBeenCalled();
    expect(surface.ownerGrid.every((owner) => owner === Team.Neutral)).toBe(true);
  });
});
