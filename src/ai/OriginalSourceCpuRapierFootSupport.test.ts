import {describe,it,expect} from 'vitest';
import {hasRegisteredOriginalSourceCpuRapierFootSupport as supported,
 f4PhysicallyPresentCenterTransferTarget as physicalTransfer,
 ORIGINAL_SOURCE_CPU_RAPIER_FOOT_SUPPORT_BAND_METERS}
 from './OriginalSourceCpuRapierFootSupport';

const foot={x:-5.829700946807861,y:4.607137680053711,z:-48.33926010131836};
const id='UndertowT21D:right-low-route-ramp-negative-z';
const registered=[{id}];
const hit=(gap:number,solidId=id)=>({
 point:{...foot,y:foot.y-gap},solidId
});

describe('T21 V28 original SOURCE actual Rapier supported feet',()=>{
 it('uses the already authorized 0.25m Rapier band, not the incorrect 0.20m CPU-only veto',()=>{
  expect(ORIGINAL_SOURCE_CPU_RAPIER_FOOT_SUPPORT_BAND_METERS).toBe(.25);
  for(const gap of [0,.1,.2,.22215840578,.23,.24438563346,.25])
   expect(supported(foot,hit(gap),registered)).toBe(true);
 });
 it('does not grant a new cross-floor surface or different registered solid',()=>{
  for(const gap of [.251,.3,2.8])
   expect(supported(foot,hit(gap),registered)).toBe(false);
  expect(supported(foot,hit(.1,'not-a-source-solid'),registered)).toBe(false);
  expect(supported(foot,hit(.1),[])).toBe(false);
 });
 it('fails closed on an absent, malformed or nonfinite physical witness',()=>{
  expect(supported(foot,null,registered)).toBe(false);
  expect(supported(foot,undefined,registered)).toBe(false);
  expect(supported({...foot,y:NaN},hit(.22),registered)).toBe(false);
  expect(supported(foot,{solidId:id,point:{...foot,y:Infinity}},registered))
   .toBe(false);
  expect(supported(foot,{solidId:'',point:foot},registered)).toBe(false);
 });
 it('does not mistake an original Rapier support witness for a native route/KCC PASS',()=>{
  // This module has neither Recast path input nor KCC move authority.
  // Other strict admission and collision checks must still run.
  expect(supported(foot,hit(.24438563346),registered)).toBe(true);
 });
});

describe('F4 genuine physically synchronized CPU during center transfer',()=>{
 const actual={foot:{x:1,y:1.7,z:-3},
  actualSharedRapierBodyAndFootAgree:true,actualSharedWorld:true,
  virtualCrowdProxyUsed:false};
 const evidence={originalF4:true,mobilityState:'F4_CENTER_TRANSFER',
  registeredPhysicalFlight:true,realFoot:{x:1,y:1.7,z:-3},
  actualCapsule:actual};
 it('admits only the real original-F4 transfer with an agreeing Rapier body',()=>{
  expect(physicalTransfer(evidence)).toBe(true);
  expect(physicalTransfer({...evidence,realFoot:{x:1.02,y:1.7,z:-3}}))
   .toBe(true);
  expect(physicalTransfer({...evidence,realFoot:{x:1.026,y:1.7,z:-3}}))
   .toBe(false);
 });
 it('rejects unrelated, unregistered, ghost, or unsynchronized targets',()=>{
  expect(physicalTransfer({...evidence,originalF4:false})).toBe(false);
  expect(physicalTransfer({...evidence,mobilityState:'JUMP_TRAVEL'})).toBe(false);
  expect(physicalTransfer({...evidence,mobilityState:'GROUND'})).toBe(false);
  expect(physicalTransfer({...evidence,registeredPhysicalFlight:false})).toBe(false);
  expect(physicalTransfer({...evidence,actualCapsule:null})).toBe(false);
  expect(physicalTransfer({...evidence,actualCapsule:{...actual,
   actualSharedRapierBodyAndFootAgree:false}})).toBe(false);
  expect(physicalTransfer({...evidence,actualCapsule:{...actual,
   actualSharedWorld:false}})).toBe(false);
  expect(physicalTransfer({...evidence,actualCapsule:{...actual,
   virtualCrowdProxyUsed:true}})).toBe(false);
  expect(physicalTransfer({...evidence,realFoot:{x:NaN,y:1.7,z:-3}}))
   .toBe(false);
 });
});
