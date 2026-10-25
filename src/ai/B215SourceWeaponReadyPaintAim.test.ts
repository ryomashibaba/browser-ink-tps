import {describe,expect,it} from 'vitest';
import {b215ShouldQueryNativePaintCandidate as can}
 from './B215SourceWeaponReadyPaintAim';
describe('B215 original source real 180s CPU paint aim query pacing',()=>{
 it('keeps baseline B75 source FIXED/SWEEP and standard CPU unchanged',()=>{
  expect(can({selectedSourceBattle:false,actualWeaponFireRemaining:10,
   completingActualSplatlingBurst:false})).toBe(true);
 });
 it('uses actual ready-to-fire frames, not fabricated shots',()=>{
  expect(can({selectedSourceBattle:true,actualWeaponFireRemaining:.2,
   completingActualSplatlingBurst:false})).toBe(false);
  expect(can({selectedSourceBattle:true,actualWeaponFireRemaining:0,
   completingActualSplatlingBurst:false})).toBe(true);
  expect(can({selectedSourceBattle:true,actualWeaponFireRemaining:-.01,
   completingActualSplatlingBurst:false})).toBe(true);
 });
 it('preserves real active splatling bursts during cooldown',()=>{
  expect(can({selectedSourceBattle:true,actualWeaponFireRemaining:.3,
   completingActualSplatlingBurst:true})).toBe(true);
 });
 it('fails closed when native weapon timer is invalid',()=>{
  expect(can({selectedSourceBattle:true,actualWeaponFireRemaining:NaN,
   completingActualSplatlingBurst:false})).toBe(false);
 });
});
