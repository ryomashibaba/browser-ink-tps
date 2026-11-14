import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PaintSurface} from '../ink/PaintSurface';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {SurfaceFlags,Team,PaintEventType,PaintSource,type PaintEvent} from '../ink/types';
import {b180OriginalSourcePatchOpportunity as p,
 b180OriginalSourceUnownedNeighborAim}
 from './B180OriginalSourcePaintOpportunity';
const floor=(flags=SurfaceFlags.Paintable|SurfaceFlags.Floor)=>{
 const s=new PaintSurface('actual-registered-source-test',
  new Vec3(),new Vec3(1,0,0),new Vec3(0,0,1),
  4,4,.2,flags,4);
 return s;
};
const sample=(s:PaintSurface,u=2,v=2)=>({
 surface:s,u,v,owner:s.ownerGrid[s.index(
  Math.floor(u/s.cellSize),Math.floor(v/s.cellSize))] as Team,
 flags:s.baseFlags,planeDistance:0
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
 it('accepts OWN center only when real original neighbors are unpainted',()=>{
  const f=floor();f.ownerGrid.fill(Team.A);
  expect(sample(f).owner).toBe(Team.A);
  expect(p(sample(f),Team.A)).toBe(0);
  f.ownerGrid[f.index(12,10)]=Team.Neutral;
  expect(p(sample(f),Team.A)).toBe(1);
  // True neighbors never make an inactive center shootable.
  f.flagsGrid[f.index(10,10)]=0;
  expect(p(sample(f),Team.A)).toBe(0);
  f.flagsGrid[f.index(10,10)]=f.baseFlags;
  f.ownerGrid[f.index(10,10)]=Team.B;
  expect(p(sample(f),Team.A)).toBe(2.25);
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

describe('B180 real-source CPU paints an actual unowned registered cell',()=>{
 it('does not waste a small-radius shot on OWN center with only diagonal neutral paint',()=>{
  const surface=new PaintSurface('UndertowT21D:registered-original-paint',
   new Vec3(0,3,0),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.2,SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
  const ink=new GameplayInkSystem();
  ink.registerSurface(surface);
  surface.ownerGrid.fill(Team.A);
  surface.ownerGrid[surface.index(12,12)]=Team.Neutral;
  const center=surface.localToWorld(2.1,2.1).add(new Vec3(0,.06,0));
  const original=ink.sampleWorld(center,.38,SurfaceFlags.Paintable)!;
  expect(original.owner).toBe(Team.A);
  expect(p(original,Team.A)).toBe(1);
  const before=Array.from(surface.ownerGrid);
  const aim=b180OriginalSourceUnownedNeighborAim(original,Team.A);
  expect(aim).not.toBeNull();
  const projected=surface.projectWorldPoint(aim!);
  expect(projected.u).toBeCloseTo(2.5);
  expect(projected.v).toBeCloseTo(2.5);
  expect(Array.from(surface.ownerGrid)).toEqual(before); // read-only aim
  const event=(u:number,v:number):PaintEvent=>({
   tick:1,source:PaintSource.Cpu,team:Team.A,surfaceId:surface.id,
   centerU:u,centerV:v,radiusU:.38,radiusV:.34,angle:0,
   type:PaintEventType.Impact,strength:1
  });
  expect(ink.apply(event(2.1,2.1)).changedCells).toBe(0);
  expect(ink.apply(event(projected.u,projected.v)).changedCells).toBeGreaterThan(0);
  expect(surface.ownerGrid[surface.index(12,12)]).toBe(Team.A);
  expect(ink.snapshot().percentA).toBe(0); // no official scoring
 });
 it('holds unknown, inactive, wrong-team and unapproved source cells',()=>{
  const s=new PaintSurface('UndertowT21D:registered-original-paint',
   new Vec3(),new Vec3(1,0,0),new Vec3(0,0,1),
   4,4,.2,SurfaceFlags.Paintable|SurfaceFlags.Floor,4);
  s.ownerGrid.fill(Team.A);
  s.ownerGrid[s.index(12,12)]=Team.Neutral;
  const original=sample(s,2.1,2.1);
  expect(b180OriginalSourceUnownedNeighborAim(original,Team.A)).not.toBeNull();
  s.flagsGrid[s.index(12,12)]=0;
  expect(b180OriginalSourceUnownedNeighborAim(original,Team.A)).toBeNull();
  s.flagsGrid[s.index(12,12)]=s.baseFlags;
  expect(b180OriginalSourceUnownedNeighborAim(original,Team.B)).toBeNull();
  s.ownerGrid[s.index(12,12)]=Team.A;
  expect(b180OriginalSourceUnownedNeighborAim(original,Team.A)).toBeNull();
  const wall=floor(SurfaceFlags.Paintable|SurfaceFlags.Wall);
  expect(b180OriginalSourceUnownedNeighborAim(sample(wall),Team.A)).toBeNull();
  const score=floor(SurfaceFlags.Paintable|SurfaceFlags.Scoreable);
  expect(b180OriginalSourceUnownedNeighborAim(sample(score),Team.A)).toBeNull();
 });
});
