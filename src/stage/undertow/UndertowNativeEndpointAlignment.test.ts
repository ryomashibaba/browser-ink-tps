import {describe,expect,it} from 'vitest';
import {
 auditUndertowNativeEndpointAlignment,
 type UndertowNativeEndpointEvidence
} from './UndertowNativeEndpointAlignment';

const fixture=():UndertowNativeEndpointEvidence=>({
 requestedTarget:[4,3,9],
 targetRapierSupported:true,
 targetSourceSolidId:'UndertowT21D:first-drop-landing-positive-z',
 recastReachedProjectedTarget:true,
 startSnapDistanceMeters:.05,
 endSnapDistanceMeters:.22,
 projectedEndpointErrorMeters:.23,
 actualTerminal:[4.1,3,9],
 terminalRapierSupported:true,
 terminalSourceSolidId:'UndertowT21D:first-drop-landing-positive-z'
});

describe('Undertow original SOURCE native endpoint guard',()=>{
 it('keeps an aligned registered original endpoint as unverified KCC, not route authority',()=>{
  const result=auditUndertowNativeEndpointAlignment(fixture());
  expect(result.endpointAligned).toBe(true);
  expect(result.reason).toBe('ENDPOINT_ALIGNED_KCC_UNVERIFIED');
  expect(result.distanceToRequestedTargetMeters).toBeCloseTo(.1,8);
  expect(result.fullTrajectoryReplayed).toBe(false);
  expect(result.sourceRouteCertified).toBe(false);
  expect(result.runtimePromotionAuthorized).toBe(false);
 });
 it('refuses an actual terminal farther than the requested source foot even if both projected differences pass',()=>{
  const result=auditUndertowNativeEndpointAlignment({
   ...fixture(),actualTerminal:[4.46,3,9]
  });
  expect(result.reason).toBe('TERMINAL_REQUEST_DISTANCE_TOO_FAR');
  expect(result.endpointAligned).toBe(false);
 });
 it('rejects a wrong underlying Rapier floor with identical visible XYZ',()=>{
  const result=auditUndertowNativeEndpointAlignment({
   ...fixture(),
   terminalSourceSolidId:'UndertowT21D:glass-underpass-positive-z',
   actualTerminal:[4,3,9]
  });
  expect(result.reason).toBe('TERMINAL_SOURCE_ID_MISMATCH');
  expect(result.sourceRouteCertified).toBe(false);
 });
 it('refuses unsupported native terminal despite a Recast path flag',()=>{
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),terminalRapierSupported:false
  }).reason).toBe('NO_TERMINAL_SOURCE_SUPPORT');
 });
 it('refuses large Recast projection distance and projected endpoint error independently',()=>{
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),endSnapDistanceMeters:1.01
  }).reason).toBe('RECAST_ENDPOINT_SNAP_TOO_FAR');
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),projectedEndpointErrorMeters:.61
  }).reason).toBe('RECAST_PATH_TERMINAL_ERROR');
 });
 it('does not confuse a failed path query with a certified endpoint',()=>{
  const evidence={...fixture(),recastReachedProjectedTarget:false};
  const result=auditUndertowNativeEndpointAlignment(evidence);
  expect(result.endpointAligned).toBe(false);
  expect(result.runtimePromotionAuthorized).toBe(false);
 });
 it('fails closed on nonfinite or missing evidence',()=>{
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),actualTerminal:[Number.NaN,3,9]
  }).reason).toBe('INVALID_ENDPOINT_EVIDENCE');
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),actualTerminal:null
  }).reason).toBe('NO_TERMINAL_SOURCE_SUPPORT');
  expect(auditUndertowNativeEndpointAlignment({
   ...fixture(),targetRapierSupported:false
  }).reason).toBe('NO_REQUESTED_SOURCE_SUPPORT');
 });
});
