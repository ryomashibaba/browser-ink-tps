import {describe,it,expect} from 'vitest';
import {eligibleB150OriginalAllyInk as eligible,
 b150OriginalAllyInkCandidates as candidates,
 diversifyB153OriginalAllyInkCandidates as diversify}
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
  // B151 probes up to 6 source-local radii × 7 angles, filtering
  // the candidates inside the real human's exclusion area first.
  expect(points.length).toBeGreaterThan(20);
  expect(points.length).toBeLessThanOrEqual(42);
  expect(points.every(p=>p.x<=cpu.x+1e-8)).toBe(true);
  expect(points.every(p=>Math.hypot(p.x-human.x,p.z-human.z)>2.6)).toBe(true);
  expect(cpu.x).toBe(6);expect(human.x).toBe(8);
  expect(candidates(cpu,cpu)).toEqual([]);
 });
});

describe('B153 diversify only already source-proposed directions',()=>{
 const points=Object.freeze([
  Object.freeze({x:1,y:3,z:38}),Object.freeze({x:2,y:3,z:38}),
  Object.freeze({x:3,y:3,z:38})
 ]);
 it('rotates immutable original candidates fairly with repeatable sequence',()=>{
  expect(diversify(points,0)).toEqual(points);
  expect(diversify(points,1)).toEqual([points[1],points[2],points[0]]);
  expect(diversify(points,2)).toEqual([points[2],points[0],points[1]]);
  expect(diversify(points,3)).toEqual(points);
  expect(points[0]?.x).toBe(1);
 });
 it('does not invent or mutate any foot and rejects invalid cursors',()=>{
  expect(diversify(points,-1)).toEqual([]);
  expect(diversify(points,Number.NaN)).toEqual([]);
  expect(diversify([],5)).toEqual([]);
  expect(diversify([points[0]!],5)).toEqual([points[0]]);
  expect(diversify(points,2).every(p=>points.includes(p))).toBe(true);
 });
});
