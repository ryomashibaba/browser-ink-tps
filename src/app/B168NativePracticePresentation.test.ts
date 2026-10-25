import {describe,it,expect} from 'vitest';
import {shouldPresentB168NativePractice as pulse,
 type B168NativePracticeState} from './B168NativePracticePresentation';
const sample=():B168NativePracticeState=>({
 status:'RUNNING',practiceVariant:'ALLY_SYNC',
 humanChangedImpactCells:50,requiredHumanChangedCells:180,
 realGroundedTravelMeters:5,requiredRealGroundedTravelMeters:12,
 actualOriginalA1TaggedImpactEvents:0,
 actualOriginalA1ChangedImpactCells:0,
 routePhase:'NOT_REQUIRED',relayStage:'NOT_REQUIRED'
});
describe('B168 authoritative 60Hz original-source practice view cadence',()=>{
 it('shows real terminal CLEAR immediately, not after the next render',()=>{
  const before=sample(),after={...before,status:'CLEAR' as const,
   actualOriginalA1TaggedImpactEvents:2,
   actualOriginalA1ChangedImpactCells:49};
  expect(pulse(before,after,1749,1748)).toBe(true);
  expect(pulse(before,{...before,status:'ABORTED'},1749,1748)).toBe(true);
  expect(pulse(before,{...before,status:'TIME_UP'},1749,1748)).toBe(true);
 });
 it('caps normal running DOM work at one every six authentic ticks',()=>{
  const x=sample();expect(pulse(x,x,1202,1200)).toBe(false);
  expect(pulse(x,x,1206,1200)).toBe(true);
  expect(pulse(x,x,1201,-1)).toBe(true);
  expect(pulse(x,x,2,4000)).toBe(true);
 });
 it('reacts immediately to real A1 impact paint and achieved goals',()=>{
  const x=sample();
  expect(pulse(x,{...x,actualOriginalA1TaggedImpactEvents:1},1201,1200)).toBe(true);
  expect(pulse(x,{...x,actualOriginalA1ChangedImpactCells:36},1201,1200)).toBe(true);
  expect(pulse(x,{...x,humanChangedImpactCells:180},1201,1200)).toBe(true);
  expect(pulse(x,{...x,realGroundedTravelMeters:12},1201,1200)).toBe(true);
  expect(pulse(x,{...x,routePhase:'RETURN'},1201,1200)).toBe(true);
 });
 it('never manufactures completion while idle, invalid or unchanged',()=>{
  const x=sample();
  expect(pulse(x,{...x,status:'IDLE'},1201,1200)).toBe(false);
  expect(pulse(x,x,-1,1200)).toBe(false);
  expect(pulse(x,x,1201,Infinity)).toBe(false);
  expect(pulse(x,x,1201,1200)).toBe(false);
  expect(x.status).toBe('RUNNING');
 });
});
