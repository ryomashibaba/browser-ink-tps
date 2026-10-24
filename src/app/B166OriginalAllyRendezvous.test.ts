import {describe,it,expect} from 'vitest';
import {getB166OriginalAllyRendezvous as hint,
 type B166AllyRendezvousInput} from './B166OriginalAllyRendezvous';
const sample=():B166AllyRendezvousInput=>({
 actualNativeTick:1700,sourceStage:[25,17,26,0],
 sourceCoopOptIn:true,matchState:'PLAYING',
 paused:false,stopReason:null,
 human:{position:[.07582,3.895,48.3324],grounded:true,alive:true},
 ally:{id:'A1',physicalFoot:[.6876,3.1,50.0918],physicallyRejoined:true},
 realNewTaggedA1ImpactCells:0,realNewTaggedA1ImpactEvents:0
});
describe('B166 real A1 relative source support hint, never a path',()=>{
 it('correctly compares human KCC body converted to foot with A1 real foot',()=>{
  const v=hint(sample())!;
  expect(v.state).toBe('NEAR_A1_WAIT_FOR_REAL_INK');
  expect(v.actualA1HorizontalSeparationMeters).toBeCloseTo(1.86,1);
  expect(v.createdPathOrFloor).toBe(false);
  expect(v.currentlyApprovedNativeRally).toBe(false);
  expect(v.officialWinner).toBe('NONE');
 });
 it('supports an authentic same-height observed-distance hold, never a route',()=>{
  const s=sample();
  const v=hint(s)!;
  expect(v.state).toBe('NEAR_A1_WAIT_FOR_REAL_INK');
  expect(v.directDistanceDoesNotProveWalkableRoute).toBe(true);
  s.realNewTaggedA1ImpactCells=36;s.realNewTaggedA1ImpactEvents=1;
  expect(hint(s)?.state).toBe('REAL_A1_INK_OBSERVED');
 });
 it('shows no safe-line guidance when high, too distant or ground absent',()=>{
  const a=sample();
  a.human.position=[.075,8.39,65.25];
  expect(hint(a)?.state).toBe('DIFFERENT_ORIGINAL_HEIGHT_BAND');
  a.human.position=[.075,3.895,47.0];
  a.ally!.physicalFoot=[.6876,3.1,50.0918];
  expect(hint(a)?.state).toBe('DISTANT_NO_NATIVE_PATH_PROOF');
  a.human.grounded=false;
  expect(hint(a)?.state).toBe('HUMAN_NOT_GROUNDED');
  a.human.grounded=true;
  a.ally!.physicalFoot=[.075,3.1,47.1];
  expect(hint(a)?.state).toBe('PHYSICALLY_TOO_CLOSE');
 });
 it('requires explicit opt-in and rejects untrusted actor readings',()=>{
  const a=sample();a.sourceCoopOptIn=false;
  expect(hint(a)).toBeNull();a.sourceCoopOptIn=true;
  a.ally!.id='B1';
  expect(()=>hint(a)).toThrow('B166_REAL_ORIGINAL_ACTOR_PROVENANCE_REQUIRED');
  a.ally!.id='A1';a.human.position=[NaN,4,50];
  expect(()=>hint(a)).toThrow('B166_REAL_ORIGINAL_ACTOR_PROVENANCE_REQUIRED');
  a.human.position=[0,4,50];a.sourceStage=[25,17,26,1];
  expect(hint(a)).toBeNull();
 });
});