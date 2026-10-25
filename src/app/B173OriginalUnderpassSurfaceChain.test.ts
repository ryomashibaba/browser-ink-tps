import {describe,it,expect} from 'vitest';
import {inspectB173ExactSourceChain} from './B173OriginalUnderpassSurfaceChain';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';

describe('B173 complete existing original source face chain, no promoted routes',()=>{
 it('compares only eight actual adjacent pairs from the prior 42 faces',()=>{
  const a=inspectB173ExactSourceChain();
  expect(a.inputOriginalSourceComponents).toBe(10);
  expect(a.inputOriginalSourceTriangles).toBe(42);
  expect(a.links).toHaveLength(8);
  expect(a.links.filter(x=>x.side==='positive-z')).toHaveLength(4);
  expect(a.links.filter(x=>x.side==='negative-z')).toHaveLength(4);
  for(const pair of a.links){
   expect(pair.existingExactSource3dFaceGapMeters).toBeGreaterThanOrEqual(0);
   expect(Number.isFinite(pair.existingExactSource3dFaceGapMeters)).toBe(true);
   expect(pair.originalHumanKccTraversabilityCertified).toBe(false);
   expect(pair.nativeRecastEndpointConnectedCertified).toBe(false);
   expect(pair.noOriginalSourceCollisionPromoted).toBe(true);
   expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.some(x=>x.id===pair.sourceFrom))
    .toBe(true);
   expect(UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.some(x=>x.id===pair.sourceTo))
    .toBe(true);
  }
 });
 it('original mirrored sides preserve every measured source-space separation',()=>{
  const a=inspectB173ExactSourceChain();
  for(let i=0;i<4;i++)
   expect(Math.abs(a.links[i]!.existingExactSource3dFaceGapMeters-
    a.links[i+4]!.existingExactSource3dFaceGapMeters)).toBeLessThan(.00001);
 });
 it('explicitly cannot certify route or change any source gameplay mask',()=>{
  const r=inspectB173ExactSourceChain();
  expect(r.previousNativeExperimentConnected).toBe(false);
  expect(r.originalTwoTeamRouteCertified).toBe(false);
  expect(r.currentOriginalRapierKccSourceTraversalCertified).toBe(false);
  expect(r.originalStageChanged).toBe(false);
  expect(r.newNavLinks).toBe(0);
  expect(r.newScoreable).toBe(0);
  expect(r.productionAuthorized).toBe(false);
 });
});
