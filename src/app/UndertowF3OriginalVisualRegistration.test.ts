import {describe,it,expect} from 'vitest';
import {Entity,Vec3} from 'playcanvas';
import {originalVisualRegistration,applyOriginalVisualRegistration}
 from './UndertowF3OriginalVisualRegistration';
import {undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';
describe('verified optical-only original model stage placement',()=>{
 const q=new URLSearchParams('t21Play=preview&t21FullSource=review&t21F3Registration=project');
 it('matches actual PlayCanvas vertex transform to existing registered floor frame',()=>{
  const pose=originalVisualRegistration(q)!;expect(pose).not.toBeNull();
  const e=new Entity('OPTICAL_ONLY');applyOriginalVisualRegistration(e,pose);
  for(const [mx,my,mz] of [[0,3,0],[1,6,50],[-8,10.5,40],[12,3,-6],[3,7.5,-47]]){
   const world=e.getWorldTransform().transformPoint(new Vec3(mx,my,mz));
   const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
   expect(world.x).toBeCloseTo(x,4);
   expect(world.y).toBeCloseTo(my-3,4);
   expect(world.z).toBeCloseTo(z,4);
  }
  expect(pose.collidersAdded).toBe(0);
  expect(pose.wholeMapAlignedCertified).toBe(false);
 });
 it('rejects default game and unrelated QA or production parameters',()=>{
  for(const url of [
   't21Play=preview&t21FullSource=review',
   q.toString()+'&t21QaInput=deterministic',
   q.toString()+'&production=1',q.toString()+'&scoreable=1',
   q.toString()+'&t21B257=depthAudit',q.toString()+'&t21B264=inkOpticalRays',
   q.toString()+'&t21B271=register',
   q.toString()+'&t21F3Registration=project'
  ])expect(originalVisualRegistration(new URLSearchParams(url))).toBeNull();
 });
 it('does not make disabled optical entity visible',()=>{
  const e=new Entity('HIDDEN');e.enabled=false;
  applyOriginalVisualRegistration(e,originalVisualRegistration(q)!);
  expect(e.enabled).toBe(false);
 });
});
