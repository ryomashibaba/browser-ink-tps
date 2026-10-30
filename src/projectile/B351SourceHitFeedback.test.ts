import {describe,it,expect} from 'vitest';
import {b351RealCpuDamageCue as cue} from './B351SourceHitFeedback';
describe('B351 true human pulse-sprayer CPU damage cue',()=>{
 it('only allows verified HP loss',()=>{
  expect(cue(true,'HUMAN','pulse-sprayer',8,9)).toBe(true);
 });
 it('rejects opt-out, shield, wall, other owner/weapon and false counts',()=>{
  const inputs:[boolean,'HUMAN'|'CPU',string,number,number][]=[
   [false,'HUMAN','pulse-sprayer',8,9],
   [true,'CPU','pulse-sprayer',8,9],
   [true,'HUMAN','metro-roller',8,9],
   [true,'HUMAN','pulse-sprayer',8,8],
   [true,'HUMAN','pulse-sprayer',8,10],
   [true,'HUMAN','pulse-sprayer',-1,0],
   [true,'HUMAN','pulse-sprayer',NaN,1],
   [true,'HUMAN','pulse-sprayer',8,Infinity]
  ];for(const args of inputs)expect(cue(...args)).toBe(false);
 });
});
