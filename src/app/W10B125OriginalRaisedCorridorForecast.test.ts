import {describe,it,expect} from 'vitest';
import {inspectB124ActualRaisedSourceBoundary as inspect}
 from './W10B124OriginalRaisedSourceBoundary';
describe('W10-B125 original raised Y4.5 narrowing is forecast only, not Rapier fact',()=>{
 const last={x:7.337435245513916,y:5.397088050842285,
  z:45.88499069213867};
 const measure=(offset:number)=>inspect({nativeTick:373,
  actualRapierBody:[last.x,last.y,last.z-offset]});
 it('last actual B124 original source anchor is safely inside',()=>{
  const v=measure(0);expect(v.realFootXZInsideOriginalSlab).toBe(true);
  expect(v.distanceToOriginalSourcePolygonBoundaryMeters).toBeGreaterThan(2);
 });
 it('source model narrowing after 72 more W ticks requires physical verification',()=>{
  const a=measure(24*.08656);
  const b=measure(48*.08656);
  const c=measure(72*.08656);
  expect(a.realFootXZInsideOriginalSlab).toBe(true);
  expect(b.realFootXZInsideOriginalSlab).toBe(true);
  expect(c.realFootXZInsideOriginalSlab).toBe(true);
  expect(a.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(b.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(b.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(c.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(c.distanceToOriginalSourcePolygonBoundaryMeters).toBeGreaterThan(.65);
  expect(c.actualOriginalKccGroundingMustBeVerifiedSeparately).toBe(true);
  expect(c.nextFloorOr4v4Certified).toBe(false);
 });
 it('farther uncontrolled straight-line extrapolation exits immutable source',()=>{
  const o=measure(108*.08656);
  expect(o.realFootXZInsideOriginalSlab).toBe(false);
  expect(o.generatedSourceFloor).toBe(false);
  expect(o.originalAuthority).toEqual([25,17,26,0]);
 });
});
