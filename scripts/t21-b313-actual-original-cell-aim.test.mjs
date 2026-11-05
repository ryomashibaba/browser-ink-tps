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

test('RAW 13394750575: reject impossible -60.98 original landing aim and permit genuine B337 cell',()=>{
 const body=[.6426592469215393,3.895002841949463,50.18156051635742];
 // Reconstructed camera used solely in pure planning regression:
 // real target yaw -34.86 and unreachable real target pitch -60.98.
 const camera=[-.15,5.775637149810791,56.64];
 const primary=b313ChooseOriginalActiveAim({body,camera,
  yaw:9.9,pitch:-28.02,cells:[
   mk(39,[-.40501009926225073,3.002,52.14609375488433]),
   mk(42,[-.030010099262250733,3.002,46.39609375488433]),
   mk(34,[-1.0300100992622507,3.002,57.89609375488433])]});
 assert.equal(primary.selected,null);
 assert.ok(primary.originalAlternatives.some(c=>
  c.targetPitch<-55&&!c.safe));
 const local=b313ChooseOriginalActiveAim({body,camera,
  yaw:9.9,pitch:-28.02,cells:[
   mk(18,[-3.0300100992622507,3.002,52.77109375488433]),
   mk(15,[-3.4050100992622507,3.002,52.14609375488433]),
   mk(22,[-2.5300100992622507,3.002,53.39609375488433])]});
 assert.ok(local.selected);
 assert.ok(local.selected.safe);
 assert.ok(local.selected.targetPitch>=-55&&local.selected.targetPitch<=28);
 assert.equal(b313ObservedRealAimMatch(local.selected,
  {yawDegrees:9.9,pitchDegrees:-28.02}),false);
 assert.equal(b313ObservedRealAimMatch(local.selected,
  {yawDegrees:local.selected.targetYaw,
   pitchDegrees:local.selected.targetPitch}),true);
});
test('real native B313 pitch bounds retain both physical camera directions',()=>{
 const v=b313ChooseOriginalActiveAim({
  body:[0,3.9,0],camera:[0,5,0],yaw:0,pitch:0,
  cells:[mk(1,[1,6,2]),mk(2,[1,-5,1]),mk(3,[0,4,3])]});
 assert.ok(v.originalAlternatives[0].safe);
 assert.ok(v.originalAlternatives[1].targetPitch<-55);
 assert.equal(v.originalAlternatives[1].safe,false);
});
