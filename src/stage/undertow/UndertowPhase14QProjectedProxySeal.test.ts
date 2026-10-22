import {describe,expect,it} from 'vitest';
import {auditPhase14QSourceProjectedProxySeal,
 ORIGINAL_CROWD_POSTSEAL_RESIDUAL_LIMIT_METERS as EPS}
 from './UndertowPhase14QProjectedProxySeal';
const physical={x:0,y:7.5,z:60};
describe('W10-B117 real original NavMesh projection versus passive Crowd proxy',()=>{
 it('accepts source-projected 0.12m lateral foot without lying about actual KCC location',()=>{
  const s={x:.12,y:7.5,z:60};
  const r=auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,originalSourceProjectedFoot:s,
   actualSealedCrowdProxy:{...s},maximumOriginalSourceProjectionMeters:.26
  });
  expect(r.actualHumanToOriginalProjectionMeters).toBeCloseTo(.12);
  expect(r.genuineHumanToProxyHorizontalMeters).toBeCloseTo(.12);
  expect(r.projectedResidualMeters).toBe(0);
  expect(r.restoredToOriginalProjectedFoot).toBe(true);
  expect(r.physicalHumanKccContactCertified).toBe(false);
  expect(r.originalCpuContactCertified).toBe(false);
  expect(r.actorPhysicalPositionModified).toBe(false);
  expect(r.productionAuthorized).toBe(false);
 });
 it('keeps the original .065m true projected-source restoration fence',()=>{
  const projected={x:.1,y:7.5,z:60};
  expect(()=>auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,originalSourceProjectedFoot:projected,
   actualSealedCrowdProxy:{x:.1+EPS+.0001,y:7.5,z:60},
   maximumOriginalSourceProjectionMeters:.26
  })).toThrow('T21_PHASE14Q_CROWD_PROXY_POSTSEAL_UNSAFE');
  const near=auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,originalSourceProjectedFoot:projected,
   actualSealedCrowdProxy:{x:.1+EPS-.0001,y:7.5,z:60},
   maximumOriginalSourceProjectionMeters:.26
  });
  expect(near.projectedResidualMeters).toBeLessThan(EPS);
 });
 it('never relaxes the original 0.26m total source-navmesh projection fence',()=>{
  expect(()=>auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,
   originalSourceProjectedFoot:{x:.26001,y:7.5,z:60},
   actualSealedCrowdProxy:{x:.26001,y:7.5,z:60},
   maximumOriginalSourceProjectionMeters:.26
  })).toThrow('T21_PHASE14Q_HUMAN_FOOT_OFF_ORIGINAL_NAVMESH');
 });
 it('rejects stale/invalid non-source or non-finite witness',()=>{
  expect(()=>auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,
   originalSourceProjectedFoot:{x:NaN,y:7.5,z:60},
   actualSealedCrowdProxy:physical,
   maximumOriginalSourceProjectionMeters:.26
  })).toThrow('T21_PHASE14Q_INVALID_ORIGINAL_SOURCE_PROJECTION_AUDIT');
  expect(()=>auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,
   originalSourceProjectedFoot:physical,
   actualSealedCrowdProxy:physical,
   maximumOriginalSourceProjectionMeters:1
  })).toThrow('T21_PHASE14Q_INVALID_ORIGINAL_SOURCE_PROJECTION_AUDIT');
 });
 it('measures vertical source projection discrepancy separately from horizontal CPU steering',()=>{
  const s={x:0,y:7.70,z:60};
  const v=auditPhase14QSourceProjectedProxySeal({
   physicalHumanFoot:physical,originalSourceProjectedFoot:s,
   actualSealedCrowdProxy:s,
   maximumOriginalSourceProjectionMeters:.26
  });
  expect(v.actualHumanToOriginalProjectionMeters).toBeCloseTo(.2);
  expect(v.genuineHumanToProxyHorizontalMeters).toBe(0);
  expect(v.originalCpuContactCertified).toBe(false);
 });
});
