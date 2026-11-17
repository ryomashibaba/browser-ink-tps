import {describe,it,expect} from 'vitest';
import {isAlignedOriginalSourceCrowdTarget as aligned,
 ORIGINAL_SOURCE_CROWD_GOAL_ALIGNMENT_METERS as BAND}
 from './OriginalSourceCrowdTargetAlignment';

const approved={x:-4.4,y:4.55,z:-45.7};
describe('T21 V28 strict SOURCE goal versus submitted Recast Crowd target',()=>{
 it('preserves the originally admitted native destination',()=>{
  expect(BAND).toBe(.22);
  for(const actual of [
   approved,
   {...approved,x:approved.x+.05},
   {...approved,y:approved.y+.219},
   {...approved,z:approved.z-.22}
  ])expect(aligned(approved,actual)).toBe(true);
 });
 it('never submits a different original vertical floor or a wrong native endpoint',()=>{
  expect(aligned(approved,{...approved,y:approved.y+.221})).toBe(false);
  expect(aligned(approved,{...approved,y:approved.y+2.4})).toBe(false);
  expect(aligned(approved,{...approved,x:approved.x+.5})).toBe(false);
  expect(aligned(approved,{...approved,z:approved.z+3})).toBe(false);
 });
 it('never turns invalid native projection into a plausible approved movement',()=>{
  expect(aligned(approved,{...approved,x:NaN})).toBe(false);
  expect(aligned(approved,{...approved,y:Infinity})).toBe(false);
  expect(aligned({...approved,z:NaN},approved)).toBe(false);
 });
});
