import {describe,it,expect} from 'vitest';
import {
 B283_HISTORIC_SAFE_B126_POSE,B283_HISTORIC_UNSAFE_B127_POSE,
 screenB283OriginalRegisteredFootprint,screenB283TwoLegHypothesis
} from './B283OriginalSourceSteeringScreen';

describe('B283 original registered source hypothesis: geometry only',()=>{
 it('reproduces genuine B127 native positions against unchanged 25-solid footprint',()=>{
  const a=screenB283OriginalRegisteredFootprint([
   B283_HISTORIC_SAFE_B126_POSE[0],B283_HISTORIC_SAFE_B126_POSE[2]
  ]);
  const b=screenB283OriginalRegisteredFootprint([
   B283_HISTORIC_UNSAFE_B127_POSE[0],B283_HISTORIC_UNSAFE_B127_POSE[2]
  ]);
  expect(a.insideRegisteredFootprint).toBe(true);
  expect(a.holeCount).toBe(3);
  expect(a.edgeClearanceMeters).toBeCloseTo(1.385909,4);
  expect(b.insideRegisteredFootprint).toBe(true);
  expect(b.edgeClearanceMeters).toBeCloseTo(.470656,4);
  expect(b.edgeClearanceMeters).toBeLessThan(.60);
 });
 it('rejects historic unsafe straight continuation without re-running Chrome',()=>{
  const bad=screenB283TwoLegHypothesis(0,-2.0792045);
  expect(bad.minimumOriginalPolygonEdgeMeters).toBeLessThan(.60);
  expect(bad.geometricallyEligibleForRealInputStudy).toBe(false);
  expect(bad.genuineRapierSupportMeasuredHere).toBe(false);
 });
 it('screens lateral-then-forward candidates with all hole-aware samples',()=>{
  const a=screenB283TwoLegHypothesis(-.60,-2.10);
  const b=screenB283TwoLegHypothesis(-.45,-2.55);
  expect(a.geometricallyEligibleForRealInputStudy).toBe(true);
  expect(a.minimumOriginalPolygonEdgeMeters).toBeGreaterThan(.9);
  expect(b.geometricallyEligibleForRealInputStudy).toBe(true);
  expect(b.minimumOriginalPolygonEdgeMeters).toBeGreaterThan(.70);
  expect(a.sampleCount).toBeGreaterThan(100);
  expect(a.originalHoleCount).toBe(3);
  expect(a.originalAuthority).toEqual([25,17,26,0]);
  expect(a.genuineCdpKeyboardInputPerformedHere).toBe(false);
  expect(a.nextDistinctOriginalFloorCertified).toBe(false);
  expect(a.underpassRecastConnected).toBe(false);
  expect(a.originalGameCollisionAuthorityAuthenticated).toBe(false);
  expect(a.originalGameStageIdentityAuthenticated).toBe(false);
  expect(a.productionAuthorized).toBe(false);
  expect(a.unrestricted4v4Certified).toBe(false);
 });
 it('refuses nonfinite and out-of-bounds hypothetical movements',()=>{
  expect(()=>screenB283TwoLegHypothesis(Number.NaN,-2)).toThrow();
  expect(()=>screenB283TwoLegHypothesis(0,-4)).toThrow();
  expect(()=>screenB283TwoLegHypothesis(0,1)).toThrow();
  expect(()=>screenB283OriginalRegisteredFootprint([Infinity,42])).toThrow();
 });
});
