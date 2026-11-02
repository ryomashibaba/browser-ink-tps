import {describe,expect,it} from 'vitest';
import {Team} from '../ink/types';
import {eligibleB192SourceHumanPursuit as can, type B192HumanCandidate} from './B192SourceHumanPursuit';
const v:B192HumanCandidate={
 enabled:true,nativeTick:100,humanTick:100,cpuId:'B1',cpuTeam:Team.B,
 cpuGrounded:true,cpuRejoined:true,sevenRejoined:true,humanAliveGrounded:true,
 cpuFoot:{x:0,y:4,z:-40},humanFoot:{x:4,y:4,z:-40},
 solids:25,paint:17,links:26,scoreable:0
};
describe('B192 source-only actual HUMAN pursuit',()=>{
 it('accepts real same-side enemy foot proposal (route still unproven)',()=>{
  expect(can(v)).toBe(true);expect(can({...v,cpuId:'B4'})).toBe(true);
 });
 it('refuses the disconnected opposite side and wrong floor',()=>{
  expect(can({...v,humanFoot:{x:4,y:4,z:40}})).toBe(false);
  expect(can({...v,humanFoot:{x:4,y:4,z:-32}})).toBe(false);
  expect(can({...v,humanFoot:{x:4,y:4.5,z:-40}})).toBe(false);
 });
 it('requires actual seven-CPU native rejoin + same-tick grounded alive HUMAN',()=>{
  expect(can({...v,humanTick:99})).toBe(false);
  expect(can({...v,cpuGrounded:false})).toBe(false);
  expect(can({...v,cpuRejoined:false})).toBe(false);
  expect(can({...v,sevenRejoined:false})).toBe(false);
  expect(can({...v,humanAliveGrounded:false})).toBe(false);
 });
 it('rejects bad Actor identities, unknown source and false scoring',()=>{
  expect(can({...v,cpuTeam:Team.A,cpuId:'A1'})).toBe(false);
  expect(can({...v,cpuId:'B9'})).toBe(false);
  expect(can({...v,scoreable:1})).toBe(false);
  expect(can({...v,solids:26})).toBe(false);
  expect(can({...v,enabled:false})).toBe(false);
 });
 it('rejects unreachable distances and invalid live physics',()=>{
  expect(can({...v,humanFoot:{x:11,y:4,z:-40}})).toBe(false);
  expect(can({...v,humanFoot:{x:1,y:4,z:-40}})).toBe(false);
  expect(can({...v,nativeTick:NaN})).toBe(false);
  expect(can({...v,humanFoot:{x:Infinity,y:4,z:-40}})).toBe(false);
 });
});

import {chooseB192OriginalEnemyStandoff as standoff}
 from './B192SourceHumanPursuit';
describe('B192 genuine path-based CPU combat standoff proposal',()=>{
 const actualHuman={x:4,y:4,z:-40};
 const originalRecastPath=[{x:0,y:4,z:-40},
  {x:2,y:4,z:-40},actualHuman];
 it('stops two meters before the living human on the supplied source path',()=>{
  expect(standoff(originalRecastPath,actualHuman))
   .toEqual({x:2,y:4,z:-40});
 });
 it('never targets an occupied real physics capsule or a too-short route',()=>{
  expect(standoff([{x:2.3,y:4,z:-40},actualHuman],actualHuman))
   .toBeNull();
  expect(standoff([],actualHuman)).toBeNull();
 });
 it('refuses unverified cross-gap, vertical or fake path endpoints',()=>{
  expect(standoff([{x:0,y:4,z:-32},{x:2,y:4,z:-32},
   {x:4,y:4,z:-32}],{x:4,y:4,z:-32})).toBeNull();
  expect(standoff([{x:0,y:6,z:-40},{x:2,y:6,z:-40},
   {x:4,y:6,z:-40}],{x:4,y:6,z:-40})).toBeNull();
  expect(standoff(originalRecastPath,{x:8,y:4,z:-40})).toBeNull();
  expect(standoff([{x:0,y:NaN,z:-40},actualHuman],actualHuman))
   .toBeNull();
 });
});
