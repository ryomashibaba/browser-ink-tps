import {describe,it,expect} from 'vitest';
import {inspectB124ActualRaisedSourceBoundary as inspect}
 from './W10B124OriginalRaisedSourceBoundary';
// These are geometric forecasts, never native Rapier movement evidence.
const body=[7.512452602386475,5.395108222961426,39.904239654541016] as const;
const witness=(dx:number,dz:number)=>inspect({nativeTick:446,
 actualRapierBody:[body[0]+dx,body[1],body[2]+dz]});
describe('W10-B126 original Team A raised-floor left steering SOURCE forecast',()=>{
 it('preserves the real B125 endpoint and unchanged authoritative floor',()=>{
  const p=witness(0,0);
  expect(p.realFootXZInsideOriginalSlab).toBe(true);
  expect(p.distanceToOriginalSourcePolygonBoundaryMeters).toBeGreaterThan(.8);
  expect(p.actualNamedOriginalSolidId).toBe('UndertowT21D:right-low-team-a');
  expect(p.originalAuthority).toEqual([25,17,26,0]);
  expect(p.generatedSourceFloor).toBe(false);
 });
 it('left geometric correction increases margin vs continuing straight',()=>{
  const baseline=witness(0,0),left=witness(-.65,0);
  const forwardAlone=witness(0,-.8),leftThenForward=witness(-.65,-.8);
  expect(left.realFootXZInsideOriginalSlab).toBe(true);
  expect(left.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(baseline.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(forwardAlone.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeLessThan(baseline.distanceToOriginalSourcePolygonBoundaryMeters);
  expect(leftThenForward.realFootXZInsideOriginalSlab).toBe(true);
  expect(leftThenForward.distanceToOriginalSourcePolygonBoundaryMeters)
   .toBeGreaterThan(.65);
 });
 it('forecasts do not certify contact, another floor or official play',()=>{
  const p=witness(-.65,-.8);
  expect(p.actualOriginalKccGroundingMustBeVerifiedSeparately).toBe(true);
  expect(p.nextFloorOr4v4Certified).toBe(false);
  expect(p.realHumanOrSevenCpuMovedByProbe).toBe(false);
  expect(p.sourceNavmeshModified).toBe(false);
 });
});
