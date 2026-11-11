import {describe,it,expect} from 'vitest';
import {decideB443OriginalFrontHold as choose}
 from './B443OriginalFrontHold';
describe('B443 actual SOURCE front-goal hysteresis (no new stage authority)',()=>{
 it('keeps a verified SAME-HEIGHT goal while approaching then rotates after 120 native ticks',()=>{
  expect(choose(101,100,null,16,2,.05).decision).toBe('KEEP_APPROACH');
  expect(choose(230,100,null,1.4,2,.05))
   .toEqual({decision:'KEEP_DWELL',arrivedSinceTick:230});
  expect(choose(349,100,230,2.6,2,.05).decision).toBe('KEEP_DWELL');
  expect(choose(350,100,230,2.6,2,.05).decision).toBe('ROTATE_AFTER_DWELL');
  // A sole actually audited SOURCE goal must not trigger fake rotation.
  expect(choose(900,100,230,1.4,1,.05).decision).toBe('KEEP_DWELL');
 });
 it('never counts a different-height registered floor as an original CPU arrival',()=>{
  // Authentic Temple01 floors occur at Y=3m, 4.5m, 7.5m; overlap
  // on a map is not a physical arrival at that level.
  expect(choose(230,100,null,0,2,1.5))
   .toEqual({decision:'KEEP_APPROACH',arrivedSinceTick:null});
  // Revoke previous dwell credit when true CPU foot leaves goal elevation.
  expect(choose(350,100,230,.2,2,1.5))
   .toEqual({decision:'KEEP_APPROACH',arrivedSinceTick:null});
  // At 300 genuine ticks with no level-matched arrival, release stale lock.
  expect(choose(400,100,null,.2,2,1.5).decision)
   .toBe('RELEASE_STALLED_OR_INVALID');
  expect(choose(230,100,null,1.4,2,.301).decision)
   .toBe('KEEP_APPROACH');
  expect(choose(230,100,null,1.4,2,.30).decision)
   .toBe('KEEP_DWELL');
  expect(choose(350,100,230,.2,2,.2).decision)
   .toBe('ROTATE_AFTER_DWELL');
 });
 it('never pins an unreachable far-away approved SOURCE goal indefinitely',()=>{
  expect(choose(399,100,null,12,2,.1).decision).toBe('KEEP_APPROACH');
  expect(choose(400,100,null,12,2,.1).decision)
   .toBe('RELEASE_STALLED_OR_INVALID');
  expect(choose(401,100,230,9,2,.1).decision)
   .toBe('RELEASE_STALLED_OR_INVALID');
 });
 it('rejects forged tick, distance, height and original candidate counts',()=>{
  for(const args of [
   [-1,0,null,1,2,.1],[10,11,null,1,2,.1],
   [10,0,-1,1,2,.1],[10,0,11,1,2,.1],
   [10,0,null,-.1,2,.1],[10,0,null,Number.NaN,2,.1],
   [10,0,null,Infinity,2,.1],[10,0,null,2,0,.1],
   [10,0,null,2,1.5,.1],[10,0,null,1,2,-.1],
   [10,0,null,1,2,Number.NaN],[10,0,null,1,2,Infinity]
  ] as [number,number,number|null,number,number,number][])
   expect(choose(...args).decision).toBe('RELEASE_STALLED_OR_INVALID');
 });
});
