import {describe,it,expect} from 'vitest';
import {hasRegisteredOriginalSourceCpuRapierFootSupport as supported,
 ORIGINAL_SOURCE_CPU_RAPIER_FOOT_SUPPORT_BAND_METERS}
 from './OriginalSourceCpuRapierFootSupport';

const foot={x:-5.829700946807861,y:4.607137680053711,z:-48.33926010131836};
const id='UndertowT21D:right-low-route-ramp-negative-z';
const registered=new Set([id]);
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
  expect(supported(foot,hit(.1),new Set<string>())).toBe(false);
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
