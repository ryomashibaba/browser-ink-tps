import {describe,expect,it} from 'vitest';
import {b213RealAttackerPreference as p} from './B213NativeCounterfire';
const x=()=>({enabled:true,tick:1000,hitTick:990,attacker:'HUMAN',
 actualLivingEnemyIds:['HUMAN','A1']});
describe('B213 only genuine native attacker counterfire preference',()=>{
 it('prioritizes only previously damaging actual alive enemy',()=>{
  expect(p(x())).toBe('HUMAN');expect(p({...x(),attacker:'A1'})).toBe('A1');
 });
 it('expires after exactly 120 native simulation frames',()=>{
  expect(p({...x(),tick:1110})).toBe('HUMAN');
  expect(p({...x(),tick:1111})).toBeNull();
 });
 it('fails closed on unknown, missing, or inactive attackers',()=>{
  expect(p({...x(),attacker:'B9'})).toBeNull();
  expect(p({...x(),actualLivingEnemyIds:[]})).toBeNull();
  expect(p({...x(),hitTick:-1})).toBeNull();
  expect(p({...x(),enabled:false})).toBeNull();
 });
 it('never synthesizes a hit or changes the original damage event',()=>{
  const before=x(),j=JSON.stringify(before);
  expect(p(before)).toBe('HUMAN');expect(JSON.stringify(before)).toBe(j);
 });
});
