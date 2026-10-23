import {describe,it,expect} from 'vitest';
import {inspectB124ActualRaisedSourceBoundary as inspect}
 from './W10B124OriginalRaisedSourceBoundary';
import {originalRaisedSourceEdgeStatus as edge}
 from './UndertowF3OriginalEdgeGuidance';

const R='UndertowT21D:right-low-team-a';
const witness=(x:number,y:number,z:number)=>inspect({
 nativeTick:500,actualRapierBody:[x,y,z]
});
function input(w:ReturnType<typeof witness>){
 return {
  nativeTick:500,nativeKccGrounded:true,
  realOriginalFootSolidId:R,actualRaisedFootprint:w,
  stageAuthority:[25,17,26,0] as const,
  matchState:'PLAYING' as const,paused:false,stopReason:null,
  activeHuman:true
 };
}
describe('B129 original raised floor edge player guidance (read-only)',()=>{
 it('actual B126 source-supported location is comfortably inside',()=>{
  const w=witness(6.0372467041,5.394600868,38.681964874);
  const a=edge(input(w));
  expect(a.severity).toBe('CLEAR');
  expect(a.originalRaisedFloorEdgeMeters).toBeCloseTo(1.619098,3);
  expect(a.showCaution).toBe(false);
  expect(a.originalGeometryModified).toBe(false);
 });
 it('actual B127 risky endpoint displays proximity, never moves actor',()=>{
  const w=witness(6.2972092628,5.3950791359,36.60326767);
  const a=edge(input(w));
  expect(a.severity).toBe('EDGE_RISK');
  expect(a.originalRaisedFloorEdgeMeters).toBeCloseTo(.47065,3);
  expect(a.showCaution).toBe(true);
  expect(a.playerPhysicsModified).toBe(false);
  expect(a.original4v4Certified).toBe(false);
  expect(a.sourceFloorHoleCertified).toBe(false);
 });
 it('only genuine named KCC support qualifies, not coincident XYZ',()=>{
  const w=witness(6.2972092628,5.3950791359,36.60326767);
  expect(edge({...input(w),nativeKccGrounded:false}).severity).toBe('UNAVAILABLE');
  expect(edge({...input(w),realOriginalFootSolidId:null}).severity).toBe('UNAVAILABLE');
  expect(edge({...input(w),realOriginalFootSolidId:'UndertowT21D:first-drop-landing-positive-z'}).showCaution).toBe(false);
 });
 it('must not show stale QA, out-of-polygon, scoring drift or game stop',()=>{
  const w=witness(6.3,5.395,36.6);
  expect(edge({...input(w),nativeTick:501}).showCaution).toBe(false);
  expect(edge({...input(w),stageAuthority:[25,17,26,1]}).showCaution).toBe(false);
  expect(edge({...input(w),matchState:'TIME_UP'}).showCaution).toBe(false);
  expect(edge({...input(w),paused:true}).showCaution).toBe(false);
  expect(edge({...input(w),stopReason:'STOP'}).showCaution).toBe(false);
  expect(edge({...input(w),activeHuman:false}).showCaution).toBe(false);
  expect(edge(input(witness(6.3,3.895,36.6))).showCaution).toBe(false);
  expect(edge(input(witness(6.3,5.395,20))).showCaution).toBe(false);
 });
});
