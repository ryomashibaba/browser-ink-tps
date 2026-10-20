import {describe,it,expect} from 'vitest';
import {originalGoalInkSweep} from './UndertowF3OriginalSourceInkSweep';
describe('W10-B64 original-foot lateral source ink target proposals',()=>{
 it('uses native original source goal orientation and stays near real CPU foot',()=>{
  const a=originalGoalInkSweep({x:0,y:3,z:0},{x:0,y:3,z:9});
  expect(a).toHaveLength(12);
  expect(new Set(a.map(x=>x.angleRadians)).size).toBe(4);
  for(const p of a){
   const d=Math.hypot(p.x,p.z);
   expect(d).toBeCloseTo(p.distanceMeters,7);
   expect(d).toBeLessThanOrEqual(3);
   expect(p.y).toBeCloseTo(3.1);
   expect(p.z).toBeGreaterThan(0);
  }
 });
 it('does not invent aim samples from invalid or too-short goals',()=>{
  expect(originalGoalInkSweep({x:0,y:0,z:0},{x:0,y:0,z:0})).toEqual([]);
  expect(originalGoalInkSweep({x:0,y:0,z:0},{x:Number.NaN,y:0,z:10})).toEqual([]);
  expect(originalGoalInkSweep({x:0,y:0,z:0},{x:1,y:0,z:1})).toEqual([]);
 });
 it('mirrors team sides exactly without requiring guessed actor world positions',()=>{
  const a=originalGoalInkSweep({x:1,y:3,z:7},{x:1,y:3,z:21});
  const b=originalGoalInkSweep({x:1,y:3,z:-7},{x:1,y:3,z:-21});
  expect(a).toHaveLength(b.length);
  for(let i=0;i<a.length;i++){
   expect(a[i]!.x-1).toBeCloseTo(-(b[i]!.x-1),7);
   expect(a[i]!.z).toBeCloseTo(-b[i]!.z,7);
  }
 });
});
