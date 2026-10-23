import {describe,it,expect} from 'vitest';
import {auditB123RegisteredOriginalUphillPassiveGuard as audit}
 from './UndertowPhase14QRegisteredUphillPassiveGate';
describe('B123 real native original registered uphill passive-only Crowd safety',()=>{
 it('matches real native tick 256 actual Rapier foot on original right-low ramp',()=>{
  const a=audit({x:1.7537744045257568,
   y:3.067765836715698,z:49.2078742980957});
  expect(a.withheld).toBe(true);
  expect(a.sourceId)
   .toBe('UndertowT21D:right-low-route-ramp-positive-z');
  expect(a.exactOriginalRampInterpolatedYMeters).toBeCloseTo(3.02492426,5);
  expect(a.actualVerticalSourceResidualMeters).toBeLessThan(.05);
  expect(a.physicalRapierHumanChanged).toBe(false);
  expect(a.sevenCpuActorPositionsChanged).toBe(false);
  expect(a.official4v4Certified).toBe(false);
  expect(a.frozenSourceAuthority).toEqual([25,17,26,0]);
 });
 it('does NOT suppress human Crowd on the original lower landing outside ramp',()=>{
  const a=audit({x:.8607550859451294,y:3.0249995040893554,
   z:49.67649841308594});
  expect(a.withheld).toBe(false);
  expect(a.sourceId).toBeNull();
 });
 it('requires actual physical Y to be within original 22cm ramp band',()=>{
  expect(audit({x:1.7537744045257568,y:4.5,z:49.2078742980957})
   .withheld).toBe(false);
 });
 it('source mirror recorded, but only when the real foot occupies that triangle',()=>{
  const a=audit({x:-1.524405, y:3.067,z:-49.013129});
  expect(a.originalOnly).toBe(true);
  expect(a.physicalRapierHumanChanged).toBe(false);
 });
 it('rejects corrupted real foot instead of inventing a proxy',()=>{
  expect(()=>audit({x:NaN,y:3,z:49}))
   .toThrow('T21_B123_NONFINITE_REAL_RAPIER_FOOT');
 });
});
