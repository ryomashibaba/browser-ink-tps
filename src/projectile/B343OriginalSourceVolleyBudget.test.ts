import {describe,it,expect} from 'vitest';
import {b343CanLaunchSourceVolley as allow} from './B343OriginalSourceVolleyBudget';
describe('B343 real SOURCE volley capacity',()=>{
 it('rejects exhausted or partial physical pool without synthetic slots',()=>{
  expect(allow(0,1)).toBe(false);
  expect(allow(1,2)).toBe(false);
  expect(allow(2,2)).toBe(true);
  expect(allow(128,1)).toBe(true);
 });
 it('fails closed on invalid or fractional resource values',()=>{
  for(const n of [NaN,-1,0,1.5,Infinity])expect(allow(8,n)).toBe(false);
  for(const n of [NaN,-1,1.5,Infinity])expect(allow(n,1)).toBe(false);
 });
 it('real capacity conserves every 1 to 8 shot burst for 0 to 128 slots',()=>{
  for(let f=0;f<=128;f++)
   for(let n=1;n<=8;n++)expect(allow(f,n)).toBe(f>=n);
 });
});
