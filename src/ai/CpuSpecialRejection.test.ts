import {describe,expect,it} from 'vitest';
import {restoreRejectedCpuSpecial} from './CpuSpecialRejection';

describe('rejected CPU special is not a fake activation',()=>{
 it('restores earned gauge and both action cooldowns exactly',()=>{
  const before=Object.freeze({
   specialPoints:200, specialDecisionCooldownSeconds:0,
   subCooldownSeconds:1.25
  });
  const after={specialPoints:0,specialDecisionCooldownSeconds:4.5,subCooldownSeconds:2.25};
  restoreRejectedCpuSpecial(after,before);
  expect(after).toEqual(before);
 });
 it('does not alter the source snapshot or create extra gauge',()=>{
  const before=Object.freeze({specialPoints:80,specialDecisionCooldownSeconds:0.15,subCooldownSeconds:0});
  const resources={specialPoints:0,specialDecisionCooldownSeconds:5,subCooldownSeconds:5};
  restoreRejectedCpuSpecial(resources,before);
  expect(resources.specialPoints).toBe(80);
  expect(before.specialPoints).toBe(80);
 });
 it('rejects invalid gauge/cooldown snapshots instead of introducing NaN or negative values',()=>{
  const current={specialPoints:0,specialDecisionCooldownSeconds:1,subCooldownSeconds:2};
  const original={...current};
  expect(()=>restoreRejectedCpuSpecial(current,{...original,specialPoints:NaN})).toThrow('CPU_SPECIAL_INVALID_REJECTION_SNAPSHOT');
  expect(()=>restoreRejectedCpuSpecial(current,{...original,subCooldownSeconds:-1})).toThrow();
  expect(current).toEqual(original);
 });
});
