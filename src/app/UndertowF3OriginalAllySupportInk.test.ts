import {describe,it,expect} from 'vitest';
import {eligibleB150OriginalAllyInk as eligible,
 b150OriginalAllyInkCandidates as candidates}
 from './UndertowF3OriginalAllySupportInk';
describe('B150 opt-in real station must precede any source ink aim',()=>{
 const base=()=>({
  nativeTick:1814,approvedTick:1800,
  cpu:{x:6,y:3,z:48},human:{x:8,y:3,z:48},
  approvedGoal:{x:6,y:3,z:48},approvedHuman:{x:8,y:3,z:48}
 });
 it('accepts only recent genuinely separated and stationary original feet',()=>{
  expect(eligible(base())).toBe(true);
  expect(eligible({...base(),nativeTick:1861})).toBe(false);
  expect(eligible({...base(),approvedTick:1815})).toBe(false);
  expect(eligible({...base(),cpu:{x:4,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:7.4,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),human:{x:8.35,y:3,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:6,y:4,z:48}})).toBe(false);
  expect(eligible({...base(),cpu:{x:6,y:3,z:30}})).toBe(false);
 });
 it('samples only away from human without writing actor positions',()=>{
  const cpu=Object.freeze({x:6,y:3,z:48});
  const human=Object.freeze({x:8,y:3,z:48});
  const points=candidates(cpu,human);
  expect(points).toHaveLength(15);
  expect(points.every(p=>p.x<=cpu.x+1e-8)).toBe(true);
  expect(points.every(p=>Math.hypot(p.x-human.x,p.z-human.z)>2.6)).toBe(true);
  expect(cpu.x).toBe(6);expect(human.x).toBe(8);
  expect(candidates(cpu,cpu)).toEqual([]);
 });
});
