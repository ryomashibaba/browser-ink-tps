import {describe,it,expect} from 'vitest';
import {b486TrueOriginalFrameDistances as sample,
 B486NativeSourceEncounterTrace as Trace} from './B486NativeSourceEncounterTrace';
const frame=()=>({
 tick:1100,source:[25,17,26,0] as readonly number[],
 humanFoot:[0,3,55] as const,humanAliveGrounded:true,
 cpu:['A1','A2','A3','B1','B2','B3','B4'].map((id,i)=>({
  id,team:i<3?'A' as const:'B' as const,
  foot:[i,3,i<3?50:-50] as const,
  active:true,grounded:true,physicallyRejoined:true
 }))
});
describe('B486 genuine original world, seven CPU and human distance witness',()=>{
 it('measures actual 3D feet without asserting natural enemy contact',()=>{
  const s=sample(frame())!;
  expect(s).not.toBeNull();
  expect(s.closestEnemyId).toBe('B1');
  expect(s.humanToNearestEnemyMeters).toBeGreaterThan(100);
  expect(s.closestAllyToEnemyMeters).toBeGreaterThan(100);
  const trace=new Trace();trace.record(frame());
  trace.record({...frame(),tick:1101,
   humanFoot:[3,3,-49] as const});
  const q=trace.snapshot()!;
  expect(q).toMatchObject({rows:2,
   actualHumanEnemyWithin3mSamples:1,
   actualCpuEnemyWithin3mSamples:0,
   physicallyCloseIsNotAHit:true,
   physicallyCloseIsNotANativeRoute:true,
   naturalOpponentRouteCertified:false,
   actualEnemyHpDamageCertified:false,scoreableOriginalSurfaces:0,
   officialWinner:'NONE'});
  expect(q.nearestHumanToEnemy3dMeters).toBeLessThan(3);
 });
 it('rejects fabricated original source or CPU feet',()=>{
  for(const change of [
   {source:[25,17,25,0]},{source:[25,17,26,1]},
   {humanAliveGrounded:false},{tick:-1},{tick:1.5},
   {humanFoot:[NaN,3,50] as const},
   {cpu:frame().cpu.slice(0,6)},
   {cpu:frame().cpu.map((x,i)=>i===2?{...x,id:'A1'}:x)},
   {cpu:frame().cpu.map((x,i)=>i===2?{...x,team:'B' as const}:x)},
   {cpu:frame().cpu.map((x,i)=>i===2?{...x,grounded:false}:x)},
   {cpu:frame().cpu.map((x,i)=>i===2?
    {...x,physicallyRejoined:false}:x)}
  ])expect(sample({...frame(),...change})).toBeNull();
 });
 it('keeps tick and evidence monotonically real',()=>{
  const t=new Trace();
  t.record(frame());
  t.record({...frame(),tick:1100,humanFoot:[3,3,-50]});
  t.record({...frame(),tick:1099,humanFoot:[3,3,-50]});
  expect(t.summary()?.rows).toBe(1);
  expect(t.summary()?.nearestHumanToEnemy3dMeters).toBeGreaterThan(100);
 });
});
