import {describe,expect,it} from 'vitest';
import {sourceRadarHeightBand as band,sourceRadarOffscreenFootMarker as offscreen}
 from './UndertowF3RadarElevation';
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

describe('genuine off-map original ally feet in PLAYER radar',()=>{
 it('keeps visible physical feet unchanged and creates no fake marker',()=>{
  expect(offscreen(0,0,1,2)).toBeNull();
  expect(offscreen(0,0,0,0)).toBeNull();
 });
 it('clamps actual far ally bearings inside existing radar, not a path',()=>{
  const east=offscreen(0,0,90,0)!;
  expect(east.x).toBe(282);expect(east.y).toBe(155);
  expect(east.directMeters).toBe(90);
  expect(east.actualFootOnly).toBe(true);
  expect(east.walkableRouteCertified).toBe(false);
  const north=offscreen(0,0,0,90)!;
  expect(north.y).toBe(18);
  const south=offscreen(0,0,0,-90)!;
  expect(south.y).toBe(273);
  const west=offscreen(0,0,-90,0)!;
  expect(west.x).toBe(18);
  const diagonal=offscreen(0,0,-100,100)!;
  expect(diagonal.x).toBeGreaterThanOrEqual(18);
  expect(diagonal.x).toBeLessThanOrEqual(282);
  expect(diagonal.y).toBeGreaterThanOrEqual(18);
  expect(diagonal.y).toBeLessThanOrEqual(273);
 });
 it('rejects corrupted native coordinates; never silently invents a foot',()=>{
  expect(()=>offscreen(0,0,NaN,0)).toThrow('INVALID_NATIVE_FOOT');
  expect(()=>offscreen(Infinity,0,40,0)).toThrow('INVALID_NATIVE_FOOT');
 });
});
