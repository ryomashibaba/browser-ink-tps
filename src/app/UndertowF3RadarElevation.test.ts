import {describe,expect,it} from 'vitest';
import {sourceRadarHeightBand as band} from './UndertowF3RadarElevation';
describe('B52 original-source physical foot altitude',()=>{
 it('distinguishes original high pad and low underpass actors',()=>{
  expect(band(8.395,12.5)).toBe('ABOVE');
  expect(band(8.395,4.1)).toBe('BELOW');
  expect(band(8.395,8.4)).toBe('LEVEL');
 });
 it('does not invent height from invalid coordinates',()=>{
  expect(band(10,12)).toBe('LEVEL');
  expect(band(10,8)).toBe('LEVEL');
  expect(band(10,12.001)).toBe('ABOVE');
  expect(band(10,7.999)).toBe('BELOW');
  expect(()=>band(NaN,10)).toThrow();
  expect(()=>band(10,Infinity)).toThrow();
 });
});
