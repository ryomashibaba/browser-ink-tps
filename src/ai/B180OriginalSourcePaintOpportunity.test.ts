import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PaintSurface} from '../ink/PaintSurface';
import {SurfaceFlags,Team} from '../ink/types';
import {b180OriginalSourcePatchOpportunity as p}
 from './B180OriginalSourcePaintOpportunity';
const floor=(flags=SurfaceFlags.Paintable|SurfaceFlags.Floor)=>{
 const s=new PaintSurface('actual-registered-source-test',
  new Vec3(),new Vec3(1,0,0),new Vec3(0,0,1),
  4,4,.2,flags,4);
 return s;
};
const sample=(s:PaintSurface,u=2,v=2)=>({
 surface:s,u,v,owner:Team.Neutral,flags:s.baseFlags,planeDistance:0
});
describe('B180 real source patch aiming only on actual owner grid',()=>{
 it('selects a large unpainted native patch over tiny isolated blank cells',()=>{
  const broad=floor(),isolated=floor();
  isolated.ownerGrid.fill(Team.A);
  isolated.ownerGrid[isolated.index(10,10)]=Team.Neutral;
  expect(p(sample(broad),Team.A)).toBe(9);
  expect(p(sample(isolated),Team.A)).toBe(1);
 });
 it('never aims into inactive or original-scoreable/wall/nonpaintable cells',()=>{
  expect(p(sample(floor(SurfaceFlags.Scoreable|SurfaceFlags.Paintable)),Team.A)).toBe(0);
  expect(p(sample(floor(SurfaceFlags.Paintable|SurfaceFlags.Wall)),Team.A)).toBe(0);
  expect(p(sample(floor(SurfaceFlags.Floor)),Team.A)).toBe(0);
  const f=floor();f.flagsGrid.fill(0);
  expect(p(sample(f),Team.A)).toBe(0);
 });
 it('respects real CPU owners and opposing ink while never claiming Turf score',()=>{
  const f=floor();
  f.ownerGrid.fill(Team.A);
  expect(p(sample(f),Team.A)).toBe(0);
  f.ownerGrid[f.index(10,10)]=Team.B;
  expect(p(sample(f),Team.A)).toBe(1.25);
  // Eight true opposing source cells, each carrying 1.25 opportunity.
  expect(p(sample(f),Team.B)).toBe(10);
 });
});
