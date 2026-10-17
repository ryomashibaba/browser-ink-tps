import { describe, expect, it, vi } from 'vitest';
import { Vec3 } from 'playcanvas';
import { PaintCoordinator, type PaintRequest } from './PaintCoordinator';
import { GameplayInkSystem } from './GameplayInkSystem';
import { PaintSurface } from './PaintSurface';
import type { GpuInkAtlas } from './GpuInkAtlas';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from './types';
import { PerformanceStats } from '../core/PerformanceStats';

function fixture(){
  const gameplay=new GameplayInkSystem();
  const surface=new PaintSurface(
    'source-authorized-uns cored-floor'.replace('uns cored','unscored'),
    new Vec3(),new Vec3(1,0,0),new Vec3(0,0,-1),
    5,5,0.25,SurfaceFlags.Paintable|SurfaceFlags.Floor,8
  );
  gameplay.registerSurface(surface);
  const stats=new PerformanceStats();
  const gpu={queue:vi.fn(),clear:vi.fn()} as unknown as GpuInkAtlas;
  const coordinator=new PaintCoordinator(gameplay,gpu,stats);
  const req=(type:PaintEventType,team:Team.A|Team.B=Team.A):PaintRequest=>({
    source:PaintSource.Cpu,actorId:'A1',team,surfaceId:surface.id,
    centerU:2.5,centerV:2.5,radiusU:.7,radiusV:.7,
    angle:0,strength:1,type
  });
  return {gameplay,stats,coordinator,req,gpu};
}

describe('authoritative native CPU ink-cell QA witnesses',()=>{
  it('counts actual first-time CPU impact color changes on uns cored source turf',()=>{
    const {gameplay,stats,coordinator,req,gpu}=fixture();
    coordinator.enqueue(req(PaintEventType.Impact));
    coordinator.processTick(1);
    expect(stats.cpuInkCellsChanged).toBeGreaterThan(0);
    expect(stats.cpuImpactInkCellsChanged).toBe(stats.cpuInkCellsChanged);
    expect(gameplay.snapshot().totalScoreableArea).toBe(0);
    expect(gpu.queue).toHaveBeenCalledTimes(1);
    const baseline=stats.cpuImpactInkCellsChanged;
    coordinator.enqueue(req(PaintEventType.Impact));
    coordinator.processTick(2);
    expect(stats.cpuImpactInkCellsChanged).toBe(baseline);
    expect(stats.cpuInkCellsChanged).toBe(baseline);
  });
  it('distinguishes CPU-foot paint, projectile-impact paint and human paint',()=>{
    const {stats,coordinator,req}=fixture();
    coordinator.enqueue(req(PaintEventType.Foot));
    coordinator.processTick(1);
    expect(stats.cpuInkCellsChanged).toBeGreaterThan(0);
    expect(stats.cpuImpactInkCellsChanged).toBe(0);
    const prior=stats.cpuInkCellsChanged;
    coordinator.enqueue({...req(PaintEventType.Impact,Team.B),actorId:'B1'});
    coordinator.processTick(2);
    expect(stats.cpuInkCellsChanged).toBeGreaterThan(prior);
    expect(stats.cpuImpactInkCellsChanged).toBeGreaterThan(0);
    const after=stats.cpuInkCellsChanged;
    coordinator.enqueue({...req(PaintEventType.Impact),source:PaintSource.Human});
    coordinator.processTick(3);
    expect(stats.cpuInkCellsChanged).toBe(after);
  });
  it('resets diagnostic ownership counters only when the ink world is cleared',()=>{
    const {stats,coordinator,req}=fixture();
    coordinator.enqueue(req(PaintEventType.Impact));
    coordinator.processTick(1);
    expect(stats.cpuInkCellsChanged).toBeGreaterThan(0);
    coordinator.clear();
    expect(stats.cpuInkCellsChanged).toBe(0);
    expect(stats.cpuImpactInkCellsChanged).toBe(0);
  });
});
