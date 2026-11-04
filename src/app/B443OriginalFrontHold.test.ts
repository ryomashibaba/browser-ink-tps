import {describe,it,expect} from 'vitest';
import {decideB443OriginalFrontHold as choose}
 from './B443OriginalFrontHold';
describe('B443 actual SOURCE front-goal hysteresis (not geometry authority)',()=>{
 it('keeps original goal while genuinely approaching, then 120 native ticks at arrival',()=>{
  expect(choose(101,100,null,16,2).decision).toBe('KEEP_APPROACH');
  const first=choose(230,100,null,1.4,2);
  expect(first).toEqual({decision:'KEEP_DWELL',arrivedSinceTick:230});
  expect(choose(349,100,230,2.6,2).decision).toBe('KEEP_DWELL');
  expect(choose(350,100,230,2.6,2).decision).toBe('ROTATE_AFTER_DWELL');
  // A sole actual SOURCE point must not induce fake alternation.
  expect(choose(900,100,230,1.4,1).decision).toBe('KEEP_DWELL');
 });
 it('never pins an unreachable far-away goal indefinitely',()=>{
  expect(choose(399,100,null,12,2).decision).toBe('KEEP_APPROACH');
  expect(choose(400,100,null,12,2).decision)
   .toBe('RELEASE_STALLED_OR_INVALID');
  expect(choose(401,100,230,9,2).decision)
   .toBe('RELEASE_STALLED_OR_INVALID');
 });
 it('rejects forged tick, distance and source-candidate counts',()=>{
  for(const c of [
   [-1,0,null,1,2],[10,11,null,1,2],[10,0,-1,1,2],
   [10,0,11,1,2],[10,0,null,-.1,2],
   [10,0,null,Number.NaN,2],[10,0,null,Infinity,2],
   [10,0,null,2,0],[10,0,null,2,1.5]
  ] as [number,number,number|null,number,number][])
   expect(choose(...c).decision).toBe('RELEASE_STALLED_OR_INVALID');
 });
});
