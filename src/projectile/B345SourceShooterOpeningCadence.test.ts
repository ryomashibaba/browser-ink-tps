import {describe,it,expect} from 'vitest';
import {b345BoundOpeningCooldown as bound} from './B345SourceShooterOpeningCadence';
describe('B345 native SHOOTER first-press idle cooldown',()=>{
 it('keeps one genuine 60Hz step but not the accumulated 0.5s',()=>{
  expect(bound(-.5,1/60)).toBeCloseTo(-1/60);
  expect(bound(-.105,1/60)).toBeCloseTo(-1/60);
  expect(bound(-.001,1/60)).toBe(-.001);
  expect(bound(.09,1/60)).toBe(.09);
 });
 it('the standard held-shot additive interval resumes after opening',()=>{
  let cd=bound(-.5,1/60)+.105;
  const ticks=[];
  for(let t=1;t<=60;t++){
   cd=Math.max(-.5,cd-1/60);
   if(cd>0)continue;
   ticks.push(t);cd+=.105;
  }
  expect(ticks.slice(0,3)).toEqual([6,12,18]);
  expect(ticks.length).toBeGreaterThanOrEqual(8);
  expect(ticks.length).toBeLessThanOrEqual(10);
 });
 it('rejects fabricated or missing fixed steps',()=>{
  for(const [cd,dt] of [[NaN,1/60],[-.5,0],
   [-.5,-1],[Infinity,1/60],[-.5,NaN],[-.5,.5]])
   expect(()=>bound(cd,dt)).toThrow('B345_INVALID_NATIVE_STEP');
 });
});
