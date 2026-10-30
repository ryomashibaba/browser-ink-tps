import {describe,it,expect} from 'vitest';
import {B346NativeShooterWitness} from './B346NativeShooterWitness';
const launch={slotName:'Projectile:1',weaponId:'pulse-sprayer',
 worldPosition:[1,2,3] as const,worldVelocity:[0,0,-28] as const,
 gravity:4,lifeSeconds:1.8,paintRadius:.64};
describe('B346 source-only genuine projectile event witness structure',()=>{
 it('does not fabricate events, tick or physics before opt-in',()=>{
  const a=new B346NativeShooterWitness();
  a.setNativeTick(100);
  expect(a.launch(launch)).toBeUndefined();
  expect(a.snapshot().events).toHaveLength(0);
  expect(a.snapshot().observedNativeTick).toBe(-1);
 });
 it('tracks one distinct launch/exit with actual tick and real hit classification',()=>{
  const a=new B346NativeShooterWitness();a.enable();
  a.setNativeTick(1090);const id=a.launch(launch);
  expect(id).toBe(1);
  a.setNativeTick(1098);
  a.exit(id!,{reason:'ORIGINAL_PAINTABLE',worldPosition:[0,0,2],
   originalPaintSurfaceId:'original-floor'});
  const s=a.snapshot();
  expect(s.totalActualShooterLaunches).toBe(1);
  expect(s.totalActualShooterExits).toBe(1);
  expect(s.events.map(e=>e.kind)).toEqual(['LAUNCH','EXIT']);
  expect(s.events[1]?.nativeTick).toBe(1098);
  expect(s.noPaintOrActorInjection).toBe(true);
 });
 it('follows source 60Hz tick monotonicity, rejects fake backward/native missing',()=>{
  const a=new B346NativeShooterWitness();a.enable();
  expect(()=>a.launch(launch)).toThrow('B346_PHYSICS_TICK_NOT_OBSERVED');
  a.setNativeTick(10);
  expect(()=>a.setNativeTick(9)).toThrow('B346_GENUINE_NATIVE_TICK_REQUIRED');
  expect(()=>a.setNativeTick(NaN)).toThrow('B346_GENUINE_NATIVE_TICK_REQUIRED');
  expect(()=>a.exit(999,{reason:'TTL',worldPosition:[0,0,0],
   originalPaintSurfaceId:null})).toThrow('B346_UNTRUSTED_NATIVE_EXIT');
 });
 it('caps memory without changing real event totals',()=>{
  const a=new B346NativeShooterWitness();a.enable();a.setNativeTick(1);
  for(let i=0;i<260;i++)a.launch(launch);
  const s=a.snapshot();
  expect(s.totalActualShooterLaunches).toBe(260);
  expect(s.events).toHaveLength(256);
  expect(s.droppedOldestEvents).toBe(4);
  a.reset();expect(a.snapshot().totalActualShooterLaunches).toBe(0);
  expect(a.snapshot().enabled).toBe(true);
 });
});
