import { describe, expect, it } from 'vitest';
import { CpuContinuityMonitor, type CpuContinuitySample } from './CpuContinuityMonitor';

const sample=(overrides: Partial<CpuContinuitySample>={}):CpuContinuitySample=>({
  id:'cpu-a-1',x:0,y:0,z:0,lifeState:'ACTIVE',
  mobilityState:'GROUND',hasAgent:true,expectsMotion:true,...overrides
});
describe('read-only CPU continuity witness',()=>{
  it('flags physical stationary foot only after five real simulation seconds with a distant goal',()=>{
    const probe=new CpuContinuityMonitor();
    for(let i=0;i<298;i++)probe.observe(1/60,[sample()]);
    expect(probe.snapshot().suspectedStallCount).toBe(0);
    for(let i=0;i<4;i++)probe.observe(1/60,[sample()]);
    const report=probe.snapshot();
    expect(report.suspectedStallCount).toBe(1);
    expect(report.longestStallSeconds).toBeGreaterThanOrEqual(5);
    expect(report.actors[0]?.actualTravelMeters).toBe(0);
    expect(report.source).toBe('ACTUAL_CPU_FOOT_QA_ONLY');
  });
  it('excludes valid idle, goal reached, death, jump, and absent crowd agents',()=>{
    for(const opts of [
      {expectsMotion:false},
      {lifeState:'SPLATTED' as const},
      {mobilityState:'JUMP_TRAVEL'},
      {mobilityState:'FIRST_DROP_REJOIN'},
      {hasAgent:false}
    ]){
      const probe=new CpuContinuityMonitor();
      for(let i=0;i<600;i++)probe.observe(1/60,[sample(opts)]);
      expect(probe.snapshot().suspectedStallCount).toBe(0);
    }
  });
  it('uses actual accepted physical positions, clears stall on resumed movement and preserves total travel',()=>{
    const probe=new CpuContinuityMonitor();
    for(let i=0;i<360;i++)probe.observe(1/60,[sample()]);
    expect(probe.snapshot().suspectedStallCount).toBe(1);
    probe.observe(1/60,[sample({x:0.2})]);
    const report=probe.snapshot();
    expect(report.suspectedStallCount).toBe(0);
    expect(report.actors[0]?.actualTravelMeters).toBeCloseTo(0.2);
    expect(report.actors[0]?.peakStationarySeconds).toBeGreaterThan(5);
  });
  it('does not create CPU motion, counts, paint, kit actions, or position mutation',()=>{
    const input=Object.freeze(sample());
    const probe=new CpuContinuityMonitor();
    probe.observe(1/60,[input]);
    expect(input.x).toBe(0);
    expect(probe.snapshot().actors).toHaveLength(1);
    probe.reset();
    expect(probe.snapshot().actors).toHaveLength(0);
  });
  it('drops missing actors and rejects duplicate identities rather than merging witness trails',()=>{
    const probe=new CpuContinuityMonitor();
    probe.observe(1/60,[sample(),sample({id:'cpu-b-1'})]);
    expect(probe.snapshot().actors).toHaveLength(2);
    probe.observe(1/60,[sample()]);
    expect(probe.snapshot().actors).toHaveLength(1);
    expect(()=>probe.observe(1/60,[sample(),sample()])).toThrow('CPU_CONTINUITY_DUPLICATE_ACTOR');
  });
});
