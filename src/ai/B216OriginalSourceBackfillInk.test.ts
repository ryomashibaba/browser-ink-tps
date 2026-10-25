import {describe,expect,it} from 'vitest';
import {b216OriginalFootBackfillCandidates as candidates}
 from './B216OriginalSourceBackfillInk';
const foot={x:0,y:3.1,z:48};
const goal={x:0,y:3.1,z:52};
describe('B216 existing ORIGINAL surface-oriented fallback aim proposals',()=>{
 it('adds 12 bounded local radial candidates without a synthetic path',()=>{
  const c=candidates(foot,goal);expect(c.length).toBe(12);
  expect(c.every(x=>x.radiusMeters>=2.5&&x.radiusMeters<=3.5))
   .toBe(true);
  expect(c.every(x=>Math.hypot(x.x-foot.x,x.z-foot.z)<=3.501))
   .toBe(true);
 });
 it('covers rearward candidates when painted frontal goal is exhausted',()=>{
  const c=candidates(foot,goal);
  expect(c.some(x=>x.z<foot.z)).toBe(true);
  expect(c.some(x=>x.x>foot.x)).toBe(true);
  expect(c.some(x=>x.x<foot.x)).toBe(true);
 });
 it('refuses invalid or missing real source foot heading',()=>{
  expect(candidates(foot,foot)).toEqual([]);
  expect(candidates({...foot,x:NaN},goal)).toEqual([]);
  expect(candidates(foot,{...goal,z:Infinity})).toEqual([]);
 });
 it('does not alter physical actor or original route information',()=>{
  const a=JSON.stringify([foot,goal]),c=candidates(foot,goal);
  expect(JSON.stringify([foot,goal])).toBe(a);
  expect(c[0]).not.toHaveProperty('navLink');
  expect(c[0]).not.toHaveProperty('damage');
  expect(c[0]).not.toHaveProperty('sourceScoreable');
 });
});
