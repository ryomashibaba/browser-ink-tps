import {describe,it,expect} from 'vitest';
import {Team} from '../ink/types';
import {eligibleB137OriginalAllyRally as allow} from './UndertowF3OriginalAllyRally';
const base={
 enabled:true,actorId:'A1',team:Team.A,
 cpuGrounded:true,humanGrounded:true,humanActive:true,
 realCpuFoot:{x:1,y:3,z:48},realHumanFoot:{x:8,y:3,z:48}
};
describe('W10-B137 source-only human/teammate rally, opt-in not an enemy',()=>{
 it('only makes real same-side CPU A1 / human feet eligible for strict native route audits',()=>{
  expect(allow(base)).toBe(true);
  expect(allow({...base,enabled:false})).toBe(false);
  expect(allow({...base,actorId:'A2'})).toBe(false);
  expect(allow({...base,team:Team.B})).toBe(false);
  expect(allow({...base,humanActive:false})).toBe(false);
  expect(allow({...base,cpuGrounded:false})).toBe(false);
  expect(allow({...base,humanGrounded:false})).toBe(false);
 });
 it('rejects central unbound underpass, other heights, unsupported distances',()=>{
  for(const human of [
   {x:8,y:3,z:32.99},{x:8,y:7.6,z:48},
   {x:8,y:3.31,z:48},{x:2,y:3,z:48},
   {x:22,y:3,z:48},{x:NaN,y:3,z:48},
   {x:8,y:3,z:-48}
  ])expect(allow({...base,realHumanFoot:human})).toBe(false);
  expect(allow({...base,realCpuFoot:{x:1,y:2.4,z:48}})).toBe(false);
 });
 it('cannot certify collision or 4v4; stage runtime must authorize later',()=>{
  expect(allow({...base,realHumanFoot:{x:8,y:3,z:48}})).toBe(true);
  // This pure eligibility helper intentionally knows no Recast or Rapier
  // route and cannot authorize a real CPU goal on its own.
  expect('pathAuthorized' in base).toBe(false);
 });
});
