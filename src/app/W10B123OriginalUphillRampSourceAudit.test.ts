import {describe,it,expect} from 'vitest';
import {auditB123FrozenTemple01UphillSource as audit}
 from './W10B123OriginalUphillRampSourceAudit';
describe('W10-B123 true immutable Temple01 first-drop → right-low source ramp',()=>{
 it('finds original source registered ramp already between lower Y3 and raised Y4.5',()=>{
  const w=audit();
  expect(w.contactGeometryConsistent).toBe(true);
  expect(w.originalLowerFloorY).toBe(3);
  expect(w.originalRaisedFloorY).toBe(4.5);
  expect(w.originalVerticalRiseMeters).toBe(1.5);
  expect(w.rampId).toBe('UndertowT21D:right-low-route-ramp-positive-z');
  expect(w.raisedFloorId).toBe('UndertowT21D:right-low-team-a');
 });
 it('both original ramp low endpoints are strictly WITHIN lower landing geometry',()=>{
  const w=audit();
  expect(w.rampLowEndpointsWithinLowerFloor).toEqual([true,true]);
  for(const d of w.rampLowerEndpointClearancesMeters){
   expect(d).toBeGreaterThan(.05);
   expect(d).toBeLessThan(.09);
  }
 });
 it('both original ramp high endpoints are WITHIN the registered raised slab',()=>{
  const w=audit();
  expect(w.rampHighEndpointsWithinRaisedFloor).toEqual([true,true]);
  for(const d of w.rampRaisedEndpointClearancesMeters)
   expect(d).toBeGreaterThanOrEqual(0);
 });
 it('registered source overlap is never falsely promoted to physical 4v4 certification',()=>{
  const w=audit();
  expect(w.actualRapierHumanTraversalProven).toBe(false);
  expect(w.cpuHumanInteractionCertified).toBe(false);
  expect(w.sourceGeometryOrNavmeshModified).toBe(false);
  expect(w.official4v4Certified).toBe(false);
  expect(w.frozenOriginalAuthority).toEqual([25,17,26,0]);
 });
});
