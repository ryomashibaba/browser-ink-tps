import {describe,it,expect} from 'vitest';
import {b421RealEnemyStandoff} from './B421RealEnemyStandoff';
const p=(x:number,z=40,y=4)=>({x,y,z});
describe('B421 native physical opponent standoff source-only',()=>{
 it('stops 2 meters before a real CPU on each original side',()=>{
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(4),1)).toEqual(p(2));
  expect(b421RealEnemyStandoff(
   [p(0,-40),p(2,-40),p(4,-40)],p(4,-40),-1)).toEqual(p(2,-40));
 });
 it('never aims the movement into the real opponent capsule',()=>{
  expect(b421RealEnemyStandoff([p(3),p(4)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(6),1)).toBeNull();
 });
 it('refuses fake central connections, nonoriginal height, nonfinite position',()=>{
  expect(b421RealEnemyStandoff(
   [p(0),p(2,32),p(4,-40)],p(4,-40),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(4,-40),1)).toBeNull();
  expect(b421RealEnemyStandoff(
   [p(0),p(2,40,6),p(4)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff(
   [p(0),p(NaN),p(4)],p(4),1)).toBeNull();
 });
});

// Full gameplay batch: SOURCE path + actual weapon reach + native stage cover.
// These are PURE proposal tests, not fabricated runtime enemy encounters.
describe('source-licensed real-weapon engagement positions',()=>{
 const path=[p(0),p(4),p(8),p(12)];
 const weapon={
  nativeWeaponRangeMeters:12,
  nativeMuzzleHeightMeters:1.1,
  enemyHitHeightMeters:.68,
  originalStageRayBlocked:(_from:{x:number},_to:{x:number})=>false
 };
 it('uses an existing Recast path point in real weapon range, not the enemy capsule',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1,weapon)).toEqual(p(4));
  expect(b421RealEnemyStandoff(path.map(q=>p(q.x,-40)),p(12,-40),-1,weapon))
   .toEqual(p(4,-40));
 });
 it('selects a nearer real path point when original Rapier blocks longer sight',()=>{
  const result=b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,originalStageRayBlocked:from=>from.x<6
  });
  expect(result).toEqual(p(6));
 });
 it('does not claim a ranged sight when every source ray is blocked',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,originalStageRayBlocked:()=>true
  })).toEqual(p(10));
 });
 it('preserves the strict 2m melee and legacy behavior',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1)).toEqual(p(10));
  expect(b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,nativeWeaponRangeMeters:2.4
  })).toEqual(p(10));
 });
 it('never invents a path endpoint, crossed side or unverified height',()=>{
  expect(b421RealEnemyStandoff(path,p(13),1,weapon)).toBeNull();
  expect(b421RealEnemyStandoff(path,p(12,-40),1,weapon)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(6,32),p(12)],p(12),1,weapon))
   .toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(6,40,8),p(12)],p(12),1,weapon))
   .toBeNull();
 });
});
