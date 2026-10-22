import {describe,it,expect} from 'vitest';
import {diagnoseB118RealOriginalCrowdDrift as audit} from
 './UndertowPhase14QRealCrowdDriftWitness';
const p={x:-.17372,y:3.0,z:54.13089};
const projected={x:-.08,y:3.0,z:54.13089};
const before={...projected};
describe('W10-B118 original Recast pre/post native passive Crowd proof',()=>{
 it('retains the true >2m native drift and existing FAIL-CLOSED classification',()=>{
  const after={x:2.24,y:3.0,z:54.13089};
  const w=audit({physicalHumanFoot:p,originalNavmeshProjectedFoot:projected,
   synchronizedProxyBeforeCrowd:before,actualProxyAfterRecast:after});
  expect(w.unboundedOriginalCrowdDrift).toBe(true);
  expect(w.unsafeClassification).toBe('UNBOUNDED_CROWD_DRIFT_NOT_AUTHORIZED');
  expect(w.postCrowdVsPhysicalHorizontalMeters).toBeGreaterThan(2);
  expect(w.recastIntraTickPassiveProxyDisplacementHorizontalMeters).toBeGreaterThan(2);
  expect(w.existingUnboundedHorizontalFenceMeters).toBe(2);
  expect(w.originalProjectionWithin26cm).toBe(true);
  expect(w.beforeCrowdProjectionResidualWithin65mm).toBe(true);
  expect(w.crowdProxyPositionMutatedByWitness).toBe(false);
  expect(w.rapierPlayerMovedByWitness).toBe(false);
  expect(w.originalCpuCrowdPositionMutatedByWitness).toBe(false);
  expect(w.official4v4Certified).toBe(false);
 });
 it('does not mistake a valid original NavMesh projection for native Recast motion',()=>{
  const w=audit({physicalHumanFoot:p,originalNavmeshProjectedFoot:projected,
   synchronizedProxyBeforeCrowd:before,actualProxyAfterRecast:before});
  expect(w.postCrowdVsPhysicalHorizontalMeters).toBeCloseTo(.09372);
  expect(w.recastIntraTickPassiveProxyDisplacement3dMeters).toBe(0);
  expect(w.unboundedOriginalCrowdDrift).toBe(false);
 });
 it('separates original Recast intra-step Y/layer changes from XZ human drift',()=>{
  const w=audit({physicalHumanFoot:p,originalNavmeshProjectedFoot:projected,
   synchronizedProxyBeforeCrowd:before,
   actualProxyAfterRecast:{x:0,y:6,z:54.13089}});
  expect(w.postCrowdVerticalDisplacementMeters).toBe(3);
  expect(w.recastIntraTickPassiveProxyDisplacement3dMeters).toBeGreaterThan(3);
  expect(w.recastIntraTickPassiveProxyDisplacementHorizontalMeters).toBeLessThan(.1);
  expect(w.unboundedOriginalCrowdDrift).toBe(false);
  expect(w.cpuHumanCollisionCertified).toBe(false);
 });
 it('never lets the diagnostic itself accept a bad source projection or repair drift',()=>{
  const w=audit({physicalHumanFoot:p,originalNavmeshProjectedFoot:{...p,x:p.x+1},
   synchronizedProxyBeforeCrowd:before,actualProxyAfterRecast:before});
  expect(w.originalProjectionWithin26cm).toBe(false);
  expect(w.sourceNavmeshModified).toBe(false);
  expect(w.sourceScoreable).toBe(0);
  expect(w.originalSourceSolids).toBe(25);
  expect(w.originalPaintSurfaces).toBe(17);
  expect(w.originalNavLinks).toBe(26);
 });
 it('rejects corrupted or non-finite actual native Crowd evidence',()=>{
  expect(()=>audit({physicalHumanFoot:p,originalNavmeshProjectedFoot:projected,
   synchronizedProxyBeforeCrowd:before,
   actualProxyAfterRecast:{x:NaN,y:3,z:54.13}}))
   .toThrow('T21_W10B118_NONFINITE_REAL_CROWD_WITNESS');
 });
});
