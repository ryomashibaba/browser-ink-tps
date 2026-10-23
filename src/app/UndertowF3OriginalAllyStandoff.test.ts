import {describe,it,expect} from 'vitest';
import {chooseB142OriginalAllyStandoff as choose}
 from './UndertowF3OriginalAllyStandoff';
describe('B142 source-native real player standoff proposal only',()=>{
 it('keeps A1 outside human capsule on real straight and bent paths',()=>{
  expect(choose([{x:0,y:3,z:48},{x:8,y:3,z:48}],
   {x:8,y:3,z:48})).toEqual({x:6,y:3,z:48});
  expect(choose([{x:0,y:3,z:48},{x:6,y:3,z:48},
   {x:6,y:3,z:51},{x:10,y:3,z:51}],
   {x:10,y:3,z:51})).toEqual({x:8,y:3,z:51});
 });
 it('refuses invalid, too short, nonphysical, snapped and winding paths',()=>{
  const h={x:8,y:3,z:48};
  for(const p of [
   [],[{x:0,y:3,z:48}],
   [{x:7,y:3,z:48},{x:8,y:3,z:48}],
   [{x:0,y:3,z:48},{x:7.79,y:3,z:48}],
   [{x:0,y:3,z:48},{x:8,y:NaN,z:48}],
   [{x:0,y:4,z:48},{x:8,y:4,z:48}],
   [{x:8,y:3,z:49},{x:9,y:3,z:49},{x:8,y:3,z:48}]
  ])expect(choose(p,h)).toBeNull();
 });
 it('is read-only and never creates real physical actor movement',()=>{
  const p=Object.freeze([Object.freeze({x:0,y:3,z:48}),
   Object.freeze({x:8,y:3,z:48})]);
  const h=Object.freeze({x:8,y:3,z:48});
  expect(choose(p,h)).toEqual({x:6,y:3,z:48});
  expect(p[1]).toEqual({x:8,y:3,z:48});
  expect(h).toEqual({x:8,y:3,z:48});
 });
});
