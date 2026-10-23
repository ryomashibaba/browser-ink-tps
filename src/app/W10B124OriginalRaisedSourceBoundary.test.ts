import {describe,it,expect} from 'vitest';
import {inspectB124ActualRaisedSourceBoundary as inspect}
 from './W10B124OriginalRaisedSourceBoundary';
describe('W10-B124 existing raised right-low source footprint and actual KCC witness',()=>{
 const b=(tick:number,x:number,y:number,z:number)=>
  inspect({nativeTick:tick,actualRapierBody:[x,y,z]});
 it('contains exactly measured real B123 final tick 326 raised source',()=>{
  const v=b(326,7.330153465270996,5.395140171051025,
   49.8233757019043);
  expect(v.realFootXZInsideOriginalSlab).toBe(true);
  expect(v.actualNamedOriginalSolidId).toBe('UndertowT21D:right-low-team-a');
  expect(v.realHumanFootYMeters).toBeCloseTo(4.525140171,6);
  expect(v.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeCloseTo(.3416171,3);
  expect(v.originalRaisedSourceVerticalBandWithin22cm).toBe(true);
  expect(v.actualOriginalKccGroundingMustBeVerifiedSeparately).toBe(true);
 });
 it('planned W continuation moves inward under original polygon geometry',()=>{
  const start=b(326,7.330153465,5.395140171,49.823375702);
  const near=b(338,7.780153465,5.395140171,48.723375702);
  const deeper=b(350,8.230153465,5.395140171,47.623375702);
  expect(near.realFootXZInsideOriginalSlab).toBe(true);
  expect(deeper.realFootXZInsideOriginalSlab).toBe(true);
  expect(near.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(start.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(deeper.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(near.distanceToOriginalSourcePolygonBoundaryMeters);
 });
 it('flags a real outside-XZ location even at matching raised source Y',()=>{
  expect(b(400,6,5.395,20).realFootXZInsideOriginalSlab).toBe(false);
 });
 it('rejects physically off-layer foot with same XZ point',()=>{
  const v=b(326,7.330153465,3.895140171,49.823375702);
  expect(v.realFootXZInsideOriginalSlab).toBe(true);
  expect(v.originalRaisedSourceVerticalBandWithin22cm).toBe(false);
 });
 it('does not mistake original coordinate membership for physical certification',()=>{
  const v=b(326,7.330153465,5.395140171,49.823375702);
  expect(v.generatedSourceFloor).toBe(false);
  expect(v.realHumanOrSevenCpuMovedByProbe).toBe(false);
  expect(v.sourceNavmeshModified).toBe(false);
  expect(v.nextFloorOr4v4Certified).toBe(false);
  expect(v.originalAuthority).toEqual([25,17,26,0]);
 });
 it('invalid actual 60Hz body or native tick is fail-closed',()=>{
  expect(()=>b(-1,7.3,5.4,49.8))
   .toThrow('T21_B124_FROZEN_NATIVE_SOURCE_AUTHORITY_INVALID');
  expect(()=>b(1,NaN,5.4,49.8))
   .toThrow('T21_B124_FROZEN_NATIVE_SOURCE_AUTHORITY_INVALID');
 });
});
