import {describe,it,expect} from 'vitest';
import {b212NativeLead as lead,type B212Input} from './B212MovingNativeProjectileAim';
function native():B212Input{return {
 muzzle:{x:0,y:4,z:0},actualBody:{x:0,y:4,z:8},
 currentFoot:{x:0,y:3.32,z:8},previousFoot:{x:-.06,y:3.32,z:8},
 dt:1/60,projectileSpeed:20
};}
describe('B212 original physics only moving enemy aim',()=>{
 it('leads observed native movement, capped and same actual y',()=>{
  const x=lead(native())!;
  expect(x.aim.x).toBeGreaterThan(0);
  expect(x.aim.x).toBeLessThanOrEqual(.85);
  expect(x.aim.y).toBe(4);
  expect(x.travelSeconds).toBe(.30);
 });
 it('does not invent movement from stationary actors',()=>{
  const x=native();x.previousFoot=x.currentFoot;
  expect(lead(x)).toBeNull();
 });
 it('refuses disconnected movement, non-ground deltas or fabricated dt',()=>{
  const a=native();a.previousFoot={x:-10,y:3.32,z:8};
  expect(lead(a)).toBeNull();
  const b=native();b.previousFoot={x:-.06,y:4,z:8};
  expect(lead(b)).toBeNull();
  const c=native();c.dt=0;expect(lead(c)).toBeNull();
  const d=native();d.projectileSpeed=0;expect(lead(d)).toBeNull();
 });
 it('never mutates any actual target foot or adds a hit/damage field',()=>{
  const x=native(),before=JSON.stringify(x),result=lead(x)!;
  expect(JSON.stringify(x)).toBe(before);
  expect(Object.keys(result).sort()).toEqual(['aim','leadMeters','travelSeconds']);
 });
});
