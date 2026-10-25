import {describe,it,expect} from 'vitest';
import {b178FootMask,b178FootRelation} from './B178OriginalSourceInkResources';
import {SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSample} from '../ink/GameplayInkSystem';
const ink=(owner:Team,flags=SurfaceFlags.Paintable)=>
 ({owner,surface:{isScoreable:(flags&SurfaceFlags.Scoreable)!==0,
  baseFlags:flags}} as unknown as GameplayInkSample);
describe('B178 actual original non-scoring ink resource policy',()=>{
 it('preserves all production Scoreable ownership selectors',()=>{
  expect(b178FootMask(false)).toBe(SurfaceFlags.Scoreable);
  expect(b178FootRelation(ink(Team.A),Team.A,false)).toBe('OWN');
  expect(b178FootRelation(ink(Team.B),Team.A,false)).toBe('ENEMY');
  expect(b178FootRelation(null,Team.A,false)).toBe('NEUTRAL');
 });
 it('explicit source lab accepts genuine original paintable ownership',()=>{
  expect(b178FootMask(true)).toBe(SurfaceFlags.Paintable);
  expect(b178FootRelation(ink(Team.A),Team.A,true)).toBe('OWN');
  expect(b178FootRelation(ink(Team.B),Team.A,true)).toBe('ENEMY');
  expect(b178FootRelation(ink(Team.Neutral),Team.A,true)).toBe('NEUTRAL');
 });
 it('never derives a resource from an unauthorized scored/wall surface',()=>{
  for(const flags of [
   SurfaceFlags.Paintable|SurfaceFlags.Scoreable,
   SurfaceFlags.Paintable|SurfaceFlags.Wall,SurfaceFlags.Floor
  ])expect(()=>b178FootRelation(ink(Team.A,flags),Team.A,true))
   .toThrow('B178_UNTRUSTED_SCOREABLE_OR_NONPAINTABLE_SOURCE_FOOT');
 });
});
