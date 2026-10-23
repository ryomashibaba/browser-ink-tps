import {describe,it,expect} from 'vitest';
import {inspectB124ActualRaisedSourceBoundary as inspect}
 from './W10B124OriginalRaisedSourceBoundary';
const b126=[6.0372467041015625,5.394600868225098,38.68196487426758] as const;
const at=(dz:number)=>inspect({nativeTick:471,
 actualRapierBody:[b126[0],b126[1],b126[2]+dz]});
describe('B127 original source-only forecast, no physics certification',()=>{
 it('B126 anchor source footprint retains frozen authority',()=>{
  const v=at(0);expect(v.realFootXZInsideOriginalSlab).toBe(true);
  expect(v.distanceToOriginalSourcePolygonBoundaryMeters).toBeGreaterThan(1.5);
  expect(v.originalAuthority).toEqual([25,17,26,0]);
 });
 it('short forward projected positions approach original narrow edge',()=>{
  const a=at(0),b=at(-.6),c=at(-1.2);
  expect(b.realFootXZInsideOriginalSlab).toBe(true);
  expect(c.realFootXZInsideOriginalSlab).toBe(true);
  expect(a.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(b.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(b.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(c.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(c.distanceToOriginalSourcePolygonBoundaryMeters).toBeGreaterThan(.65);
 });
 it('unbounded motion is not certified',()=>{
  expect(at(-4.5).realFootXZInsideOriginalSlab).toBe(false);
  expect(at(-1.2).nextFloorOr4v4Certified).toBe(false);
  expect(at(-1.2).actualOriginalKccGroundingMustBeVerifiedSeparately).toBe(true);
 });
});
