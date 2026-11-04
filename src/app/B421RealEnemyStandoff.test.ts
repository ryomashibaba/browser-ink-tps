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
