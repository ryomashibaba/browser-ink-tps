import {describe,it,expect} from 'vitest';
import {B346NativeShooterWitness} from './B346NativeShooterWitness';
const fixture=(ground:boolean)=>({
 slotName:'Projectile:1',weaponId:'pulse-sprayer',
 worldPosition:[0,8,67] as const,worldVelocity:[0,-10,-28] as const,
 gravity:4,lifeSeconds:1.8,paintRadius:.64,nativeGroundedAtLaunch:ground
});
describe('B349 read-only genuine native shot KCC stance',()=>{
 it('preserves real grounded/airborne state per allocated physical ID',()=>{
  const a=new B346NativeShooterWitness();a.enable();
  a.setNativeTick(100);expect(a.launch(fixture(true))).toBe(1);
  a.setNativeTick(106);expect(a.launch(fixture(false))).toBe(2);
  const e=a.snapshot().events.filter(x=>x.kind==='LAUNCH');
  expect(e.map(x=>x.kind==='LAUNCH'?x.nativeGroundedAtLaunch:null)).toEqual(
   [true,false]);
  expect(a.snapshot().noSyntheticProjectilesOrCollision).toBe(true);
 });
 it('requires actual native clock and explicit witness opt-in',()=>{
  const a=new B346NativeShooterWitness();
  a.setNativeTick(10);expect(a.launch(fixture(false))).toBeUndefined();
  expect(a.snapshot().events).toHaveLength(0);a.enable();
  expect(()=>a.launch(fixture(false))).toThrow('B346_PHYSICS_TICK_NOT_OBSERVED');
 });
});
