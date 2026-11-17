import { describe, expect, it, vi } from 'vitest';
import { Vec3 } from 'playcanvas';
import { PaintCoordinator, type PaintRequest } from './PaintCoordinator';
import { GameplayInkSystem, type PaintApplyResult } from './GameplayInkSystem';
import { PaintSurface, sourceRegisteredPaintCellActive } from './PaintSurface';
import type { GpuInkAtlas } from './GpuInkAtlas';
import { PaintEventType, PaintSource, SurfaceFlags, Team, type PaintEvent } from './types';
import { PerformanceStats } from '../core/PerformanceStats';

function fixture() {
  const surface = new PaintSurface(
    'original-registered-unscored-ink', new Vec3(),
    new Vec3(1, 0, 0), new Vec3(0, 0, -1),
    6, 4, 1, SurfaceFlags.Paintable | SurfaceFlags.Floor, 2
  );
  const gameplay = new GameplayInkSystem();
  gameplay.registerSurface(surface);
  const stats = new PerformanceStats();
  const gpu = { queue: vi.fn(), clear: vi.fn() } as unknown as GpuInkAtlas;
  const accepted: Array<{ event: PaintEvent; changed: number; result: Readonly<PaintApplyResult> }> = [];
  const coordinator = new PaintCoordinator(gameplay, gpu, stats,
    (event, changed, result) => accepted.push({ event, changed, result }));
  const request = (centerU: number, team: Team.A | Team.B = Team.A): PaintRequest => ({
    source: PaintSource.Human,
    team,
    surfaceId: surface.id,
    centerU,
    centerV: 1.5,
    radiusU: 0.45,
    radiusV: 0.45,
    angle: 0,
    strength: 1,
    type: PaintEventType.Impact
  });
  return { surface, gameplay, stats, gpu, accepted, coordinator, request };
}

describe('T21 V28 continuous ink request provenance and real feedback', () => {
  it('keeps two earlier projectile impacts where they landed even when one pooled request is reused', () => {
    const { surface, gameplay, gpu, coordinator, accepted, request } = fixture();
    const pooled = request(0.5);
    coordinator.enqueue(pooled);
    pooled.centerU = 2.5;
    pooled.team = Team.B;
    coordinator.enqueue(pooled);
    // Mutating a pooled request again before processTick must not move
    // the previously accepted A/B impacts to this final, invalid location.
    pooled.centerU = 100;
    pooled.team = Team.A;
    coordinator.processTick(84);

    expect(surface.ownerGrid[surface.index(0, 1)]).toBe(Team.A);
    expect(surface.ownerGrid[surface.index(2, 1)]).toBe(Team.B);
    expect(surface.ownerGrid[surface.index(5, 1)]).toBe(Team.Neutral);
    expect(accepted.map(x => [x.event.centerU, x.event.team]))
      .toEqual([[0.5, Team.A], [2.5, Team.B]]);
    expect(accepted.map(x => x.event.tick)).toEqual([84, 84]);
    expect(gpu.queue).toHaveBeenCalledTimes(2);
    const first = vi.mocked(gpu.queue).mock.calls[0]!;
    const second = vi.mocked(gpu.queue).mock.calls[1]!;
    expect(first[0].centerU).toBe(0.5);
    expect(first[1]).toEqual([{ row: 1, startX: 0, endXExclusive: 1 }]);
    expect(second[0].centerU).toBe(2.5);
    expect(second[1]).toEqual([{ row: 1, startX: 2, endXExclusive: 3 }]);
    expect(gameplay.snapshot()).toMatchObject({ areaA: 0, areaB: 0, percentA: 0, percentB: 0 });
  });

  it('snapshots enqueueMany entries before callers reuse their references', () => {
    const { surface, gpu, coordinator, request } = fixture();
    const a = request(1.5);
    const b = request(3.5, Team.B);
    const inputs = [a, b];
    coordinator.enqueueMany(inputs);
    inputs[0] = request(5.5);
    a.centerU = 99;
    b.centerU = 99;
    coordinator.processTick(99);

    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.A);
    expect(surface.ownerGrid[surface.index(3, 1)]).toBe(Team.B);
    expect(surface.ownerGrid[surface.index(5, 1)]).toBe(Team.Neutral);
    expect(vi.mocked(gpu.queue).mock.calls.map(([event]) => event.centerU))
      .toEqual([1.5, 3.5]);
  });

  it('suppresses phantom accepted-ink visuals yet still reports honest same-team restamps', () => {
    const { surface, gameplay, stats, gpu, coordinator, accepted, request } = fixture();
    const valid = request(1.5);
    const disallowed = request(4.5);
    surface.flagsGrid[surface.index(4, 1)] = SurfaceFlags.Floor;

    coordinator.enqueue(valid);
    coordinator.processTick(100);
    const first = coordinator.lastEvent!;
    const firstWorld = [stats.lastPaintWorldX, stats.lastPaintWorldY, stats.lastPaintWorldZ];
    expect(first).not.toBeNull();

    coordinator.enqueue(disallowed);
    coordinator.enqueue(request(100.5));
    coordinator.enqueue({ ...request(1.5), strength: Number.NaN });
    coordinator.processTick(101);
    expect(coordinator.lastEvent).toBe(first);
    expect([stats.lastPaintWorldX, stats.lastPaintWorldY, stats.lastPaintWorldZ]).toEqual(firstWorld);
    // Retain the old diagnostic callback's denied-attempt reporting;
    // only accepted GPU drawing and last-valid-hit UI telemetry are gated.
    expect(accepted).toHaveLength(4);
    expect(accepted.map(x => x.result.rasterEligibleCells)).toEqual([1, 0, 0, 0]);
    expect(gpu.queue).toHaveBeenCalledTimes(1);

    // Same-team repaint changes no owner cell, but does refresh wet ink.
    coordinator.enqueue(valid);
    coordinator.processTick(102);
    expect(accepted.map(x => x.changed)).toEqual([1, 0, 0, 0, 0]);
    expect(accepted.at(-1)?.result.rasterAlreadyTeamOwnedCells).toBe(1);
    expect(coordinator.lastEvent?.tick).toBe(102);
    expect(gpu.queue).toHaveBeenCalledTimes(2);
    expect(gameplay.snapshot().totalScoreableArea).toBe(1e-9);
    expect(gameplay.snapshot().areaA).toBe(0);
  });

  it('retains processTick timing as the sole event clock authority', () => {
    const { coordinator, accepted, request } = fixture();
    coordinator.enqueue({ ...request(1.5), tick: -400 } as PaintRequest);
    coordinator.processTick(202);
    expect(accepted[0]?.event.tick).toBe(202);
  });

  it('coalesces 120 identical same-tick visual overwrites but still performs every authoritative CPU paint request', () => {
    const { surface, gameplay, stats, gpu, accepted, coordinator, request } = fixture();
    for (let n = 0; n < 120; n += 1) {
      coordinator.enqueue({
        ...request(1.5), source: PaintSource.Cpu,
        actorId: n % 2 ? 'A1' : 'A2'
      });
    }
    coordinator.processTick(300);
    expect(accepted).toHaveLength(120);
    expect(accepted.reduce((n, entry) => n + entry.changed, 0)).toBe(1);
    expect(stats.cpuInkCellsChanged).toBe(1);
    expect(gpu.queue).toHaveBeenCalledTimes(1);
    expect(coordinator.lastEvent?.tick).toBe(300);
    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.A);
    expect(gameplay.snapshot()).toMatchObject({ areaA: 0, areaB: 0 });
    // A new tick may legitimately redraw its wetness. The optimization
    // must never cancel all future updates at this approved patch.
    coordinator.enqueue(request(1.5));
    coordinator.processTick(301);
    expect(gpu.queue).toHaveBeenCalledTimes(2);
  });

  it('does not coalesce opposing overwrites, different wetness or disjoint brush positions', () => {
    const { surface, gpu, accepted, coordinator, request } = fixture();
    coordinator.enqueue(request(1.5, Team.A));
    coordinator.enqueue(request(1.5, Team.A)); // redundant GPU stamp
    coordinator.enqueue(request(1.5, Team.B)); // must paint B
    coordinator.enqueue(request(1.5, Team.A)); // must repaint A
    coordinator.enqueue({ ...request(1.5), strength: 0.5 }); // visible wetness differs
    coordinator.enqueue(request(2.5)); // different actual authorized cell
    coordinator.processTick(400);
    expect(gpu.queue).toHaveBeenCalledTimes(5);
    expect(accepted).toHaveLength(6);
    expect(accepted.map(x => x.changed)).toEqual([1, 0, 1, 1, 0, 1]);
    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.A);
    expect(surface.ownerGrid[surface.index(2, 1)]).toBe(Team.A);
  });

  it('rejects underflow and overflow brush radii rather than creating unbounded ownership', () => {
    const { surface, gpu, coordinator, accepted, request } = fixture();
    const malformed = [
      { radiusU: 1e-200 },
      { radiusV: 1e-200 },
      { radiusU: 1e200 },
      { radiusV: 1e200 },
      { centerU: 1e308, radiusU: 1e308 },
      { centerV: -1e308, radiusV: 1e308 }
    ];
    for (const overrides of malformed) coordinator.enqueue({
      ...request(1.5), ...overrides
    });
    coordinator.processTick(500);
    expect(gpu.queue).not.toHaveBeenCalled();
    expect(accepted).toHaveLength(malformed.length);
    expect(accepted.every(x => x.result.rasterEligibleCells === 0)).toBe(true);
    expect([...surface.ownerGrid].every(owner => owner === Team.Neutral)).toBe(true);
    expect(coordinator.lastEvent).toBeNull();
    coordinator.enqueue(request(1.5));
    coordinator.processTick(501);
    expect(surface.ownerGrid[surface.index(1, 1)]).toBe(Team.A);
    expect(gpu.queue).toHaveBeenCalledTimes(1);
  });

  it('does not interpret outside-surface UVs as valid edge paint impacts', () => {
    const { surface } = fixture();
    expect(sourceRegisteredPaintCellActive(surface, 0.5, 0.5)).toBe(true);
    expect(sourceRegisteredPaintCellActive(surface, -0.01, 0.5)).toBe(false);
    expect(sourceRegisteredPaintCellActive(surface, 6.01, 0.5)).toBe(false);
    expect(sourceRegisteredPaintCellActive(surface, 0.5, -0.01)).toBe(false);
    expect(sourceRegisteredPaintCellActive(surface, 0.5, 4.01)).toBe(false);
    expect(sourceRegisteredPaintCellActive(surface, Number.NaN, 1.5)).toBe(false);
    expect(sourceRegisteredPaintCellActive(surface, 6, 4)).toBe(true);
  });
});
