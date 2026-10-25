import {describe,expect,it} from 'vitest';
import {b214EligibleSourceBattleInk as ok} from './B214SelectedSourceBattleInk';
const source=()=>new URLSearchParams('t21Play=preview&t21QaDrive=source&'+
 't21W10B183=firstDropPlay&t21W10B192=humanCombat&'+
 't21W10B112=humanGround&t21W10B203=fullRound');
describe('B214 original-source actual player combat ink policy',()=>{
 it('enables only true selected B207 full 180s combat',()=>{
  expect(ok(source())).toBe(true);
 });
 it('forbids normal preview, default source and missing B203',()=>{
  for(const [k,v] of [['t21Play','other'],['t21QaDrive',''],
    ['t21W10B192','off'],['t21W10B203','off']]){
   const p=source();p.set(k,v);expect(ok(p)).toBe(false);
  }
 });
 it('rejects co-op and no source physical-foot witness',()=>{
  const p=source();p.set('t21W10B193','allyCoop');
  expect(ok(p)).toBe(false);
  p.delete('t21W10B193');p.delete('t21W10B112');
  expect(ok(p)).toBe(false);
 });
});
