import {describe,it,expect} from 'vitest';
import {b348CandidateShooterAngles as sample,B348_REFERENCE_LIMITS} from './B348SourceShooterAccuracyCandidate';
describe('B348 opt-in real source shooter angular candidate, not fake bullets',()=>{
 it('first real shot is perfectly central and later grounded shots vary',()=>{
  const first=sample(1,true);
  expect(first.yawDegrees).toBe(0);
  expect(first.pitchDegrees).toBe(0);
  const angles=Array.from({length:32},(_,i)=>sample(i+1,true));
  expect(new Set(angles.map(x=>x.yawDegrees.toFixed(5))).size).toBeGreaterThan(25);
  for(const x of angles)
   expect(Math.hypot(x.yawDegrees,x.pitchDegrees)).toBeLessThanOrEqual(
    B348_REFERENCE_LIMITS.groundDegrees+1e-10);
  expect(sample(7,true)).toEqual(sample(7,true));
 });
 it('airborne hypothesis has a wider explicit angular envelope',()=>{
  const g=sample(24,true),a=sample(24,false);
  expect(g.maxCandidateDegrees).toBe(4.86);
  expect(a.maxCandidateDegrees).toBe(11.66);
  expect(Math.hypot(a.yawDegrees,a.pitchDegrees)).toBeGreaterThan(
   Math.hypot(g.yawDegrees,g.pitchDegrees));
  expect(a.hypothesisOnly).toBe(true);
 });
 it('rejects fake native event indices and invalid physical stance',()=>{
  for(const value of [NaN,0,-1,1.5,Infinity])
   expect(()=>sample(value,true)).toThrow('B348_INVALID_NATIVE_SHOT_ORDINAL');
  expect(()=>sample(4,null as unknown as boolean)).toThrow(
   'B348_INVALID_NATIVE_SHOT_ORDINAL');
 });
});
