import test from 'node:test';
import assert from 'node:assert/strict';
import {b313ChooseOriginalActiveAim,b313ObservedRealAimMatch}
 from './t21-b313-actual-original-cell-aim.mjs';
const body=[.13674058,3.89500427,48.73594284];
const camera=[.85674059,5.7755394,54.99608612];
const mk=(i,world)=>({grid:[i,0],world});
test('real landing selects side of same original active surface, not rear nearest',()=>{
 const v=b313ChooseOriginalActiveAim({body,camera,yaw:0,pitch:-12,
  cells:[mk(0,[-.4050101,3.002,52.14609]),
   mk(1,[-.0300101,3.002,46.39609]),
   mk(2,[-1.0300101,3.002,57.89609])]});
 assert.equal(v.selected.index,2);
 assert.equal(v.originalAlternatives[1].safe,false);
 assert.ok(Math.abs(v.selected.targetYaw+33.05)<.2);
 assert.equal(b313ObservedRealAimMatch(v.selected,{
  yawDegrees:v.selected.targetYaw,pitchDegrees:v.selected.targetPitch}),true);
 assert.equal(b313ObservedRealAimMatch(v.selected,{
  yawDegrees:0,pitchDegrees:-12}),false);
});
test('real ramp chooses 111-degree original active cell',()=>{
 const v=b313ChooseOriginalActiveAim({body,camera,yaw:0,pitch:-12,
  cells:[mk(0,[4.6260715,3.75606,49.91386]),
   mk(1,[8.251998,4.48278,52.17346]),
   mk(2,[.86848,3.00190,47.5796])]});
 assert.equal(v.selected.index,1);
 assert.equal(v.originalAlternatives[2].safe,false);
});
test('reject source spoofing and invalid real frames',()=>{
 assert.throws(()=>b313ChooseOriginalActiveAim({
  body,camera,yaw:0,pitch:-12,cells:[]}));
 assert.throws(()=>b313ChooseOriginalActiveAim({
  body,camera:[NaN,0,0],yaw:0,pitch:-12,cells:[mk(0,[1,2,3])]}));
});
