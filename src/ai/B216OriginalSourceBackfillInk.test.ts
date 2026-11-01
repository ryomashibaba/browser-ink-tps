import {describe,expect,it} from 'vitest';
import {b216OriginalFootBackfillCandidates as candidates,
 b216RealSourcePaintShotLineClear as safeShot}
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
 it('at a genuine reached goal, uses only LIVE native weapon facing to seek original ink',()=>{
  const actualFacing={x:0,y:0,z:-1};
  const c=candidates(foot,foot,actualFacing);
  expect(c).toHaveLength(18);
  // Only a real reached goal gains the B64-established short radius.
  expect(c.filter(x=>x.radiusMeters===1.7)).toHaveLength(6);
  expect(c.filter(x=>x.radiusMeters===2.5)).toHaveLength(6);
  expect(c.filter(x=>x.radiusMeters===3.5)).toHaveLength(6);
  expect(c.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.z)&&
   Math.hypot(x.x-foot.x,x.z-foot.z)<=3.501)).toBe(true);
  expect(c.some(x=>x.z>foot.z)).toBe(true);
  expect(c.some(x=>x.x>foot.x)).toBe(true);
  expect(c.some(x=>x.x<foot.x)).toBe(true);
  expect(c[0]).not.toHaveProperty('navLink');
  expect(c[0]).not.toHaveProperty('sourceScoreable');
  expect(candidates(foot,foot,{x:0,y:0,z:0})).toEqual([]);
  expect(candidates(foot,foot,{x:NaN,y:0,z:-1})).toEqual([]);
  expect(candidates(foot,foot,{x:0,y:0,z:0.01})).toEqual([]);
  expect(candidates(foot,{...foot,z:foot.z+0.5},actualFacing)).toHaveLength(12);
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

describe('B216 genuine registered original-projectile shot vs route authority',()=>{
 const foot={x:1,y:3.1,z:5},target={x:3,y:3.1,z:5};
 const contact=(solidId:string,point:typeof foot)=>({solidId,point});
 const state=()=>({actualFoot:foot,actualTarget:target,
  footSupport:contact('original-a',foot),
  targetSupport:contact('original-b',target),firstStageBlock:null});
 it('allows an unobstructed real cross-solid INK SHOT, not a CPU walk',()=>{
  expect(safeShot(state())).toBe(true);
  expect(safeShot({...state(),targetSupport:contact('original-a',target)}))
    .toBe(true);
 });
 it('refuses missing, distant or forged original Rapier support',()=>{
  expect(safeShot({...state(),footSupport:null})).toBe(false);
  expect(safeShot({...state(),targetSupport:null})).toBe(false);
  expect(safeShot({...state(),footSupport:contact('',foot)})).toBe(false);
  expect(safeShot({...state(),targetSupport:contact('original-b',
   {...target,y:3.6})})).toBe(false);
  expect(safeShot({...state(),actualFoot:{...foot,x:NaN}}))
    .toBe(false);
 });
 it('rejects an original blocking solid between live muzzle and target',()=>{
  const block=contact('original-wall',{x:2,y:3.1,z:5});
  expect(safeShot({...state(),firstStageBlock:block})).toBe(false);
  // A different solid EVEN CLOSE to the target cannot bypass cover.
  expect(safeShot({...state(),firstStageBlock:
   contact('original-wall',{...target,z:5.1})})).toBe(false);
 });
 it('permits only the actual target collider at its observed impact',()=>{
  expect(safeShot({...state(),firstStageBlock:
   contact('original-b',{...target,y:3.15})})).toBe(true);
  expect(safeShot({...state(),firstStageBlock:
   contact('original-b',{...target,z:5.5})})).toBe(false);
 });
});
