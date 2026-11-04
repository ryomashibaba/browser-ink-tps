import {describe,it,expect,vi} from 'vitest';
import {b450FirstSourceDenial as scan} from './B450OriginalRouteWitness';
const p=(x:number,y=4,z=-45)=>({x,y,z});
describe('B450 first original source denial witness (not authorization)',()=>{
 it('reports actual first 0.30m sampled missing Rapier support',()=>{
  const ray=vi.fn(v=>({supported:v.x<.6,solidId:null,gapMeters:null}));
  const d=scan([p(0),p(1.2)],-1,ray);
  expect(d.cause).toBe('NO_ORIGINAL_RAPIER_SUPPORT');
  expect(d.xyz?.[0]).toBeCloseTo(.6);
  expect(d.leg).toBe(0);expect(d.sample).toBe(2);
  expect(ray).toHaveBeenCalledTimes(3);
 });
 it('does not bypass original side and height constraints',()=>{
  const ray=vi.fn(()=>({supported:true,solidId:'source',gapMeters:0}));
  const d=scan([p(0),p(0,4,-32)],-1,ray);
  expect(d.cause).toBe('OUTSIDE_ORIGINAL_REGION');
  expect(d.xyz?.[2]).toBeGreaterThan(-33);
 });
 it('preserves input and cannot grant a Crowd goal',()=>{
  const pts=[p(0),p(.3),p(.6)],before=JSON.stringify(pts);
  const d=scan(pts,-1,()=>({supported:true,solidId:'source',gapMeters:0}));
  expect(d.cause).toBe('NONE');expect(d.xyz).toBeNull();
  expect(JSON.stringify(pts)).toBe(before);
 });
 it('fail-closes on no path or nonfinite segment',()=>{
  const q=()=>({supported:true,solidId:'source',gapMeters:0});
  expect(scan([],-1,q).cause).toBe('EMPTY_NATIVE_PATH');
  expect(scan([p(0),p(NaN)],-1,q).cause).toBe('INVALID_NATIVE_SEGMENT');
 });
});
