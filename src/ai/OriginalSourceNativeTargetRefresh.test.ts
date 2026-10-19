import {describe,it,expect} from 'vitest';
import {shouldReissueOriginalSourceNativeTarget as fresh,
 SOURCE_NATIVE_REFRESH_THINK_CYCLES} from './OriginalSourceNativeTargetRefresh';
const goal={x:1,y:3,z:41};
describe('W10-B35 experimental native original foot goal refresh',()=>{
 it('requests first and actually changed source goals immediately',()=>{
  expect(fresh(null,goal)).toBe(true);
  expect(fresh({...goal,repeatedThinkCycles:0,sameAgent:true},
   {...goal,x:1.5})).toBe(true);
  expect(fresh({...goal,repeatedThinkCycles:1,sameAgent:false},goal))
   .toBe(true);
 });
 it('suppresses only bounded duplicate native Crowd requests, refreshes every fourth tactical think',()=>{
  expect(SOURCE_NATIVE_REFRESH_THINK_CYCLES).toBe(4);
  for(let count=0;count<3;count++)
   expect(fresh({...goal,repeatedThinkCycles:count,sameAgent:true},goal))
    .toBe(false);
  expect(fresh({...goal,repeatedThinkCycles:3,sameAgent:true},goal))
   .toBe(true);
 });
 it('fails closed on NaN/reused agent and rejects no original goal geometry manipulation',()=>{
  expect(fresh({...goal,repeatedThinkCycles:-1,sameAgent:true},goal))
   .toBe(true);
  expect(fresh({...goal,repeatedThinkCycles:1,sameAgent:true,x:NaN},goal))
   .toBe(true);
  expect(()=>fresh(null,{x:NaN,y:3,z:41}))
   .toThrow('T21_W10B35_NONFINITE_ORIGINAL_GOAL');
 });
});
