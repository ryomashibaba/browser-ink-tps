import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyB344RealShooter} from './t21-b344-native-shooter-audit.mjs';
const make=()=>({schema:'B344_ACTUAL_SOURCE_HUMAN_HELD_SHOOTER',
 source:'25/17/26/0',fakeTicks:0,fakeShots:0,baselineTick:100,
 checkpoints:['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60']
 .map((label,i)=>({label,tick:100+i*12,actualHumanShotRequests:i*2,
  changedOriginalHumanCells:i*10,realPlayerInk:100-i*1.9,
  actualFreePhysicalProjectileSlots:128-i,scoreable:0,productionAuthorized:false}))});
test('B344 synthetic fixture validates only audit shape, never original fidelity',()=>{
 const r=verifyB344RealShooter(make());
 assert.equal(r.actualHumanShotRequests,10);
 assert.equal(r.originalShooterCadenceCertified,false);
});
test('B344 rejects source modification, false time/shot, fake score, wrong physical pool',()=>{
 for(const modify of [x=>x.fakeTicks=1,
  x=>x.checkpoints[1].tick=100,
  x=>x.checkpoints[2].actualHumanShotRequests=-1,
  x=>x.checkpoints[3].changedOriginalHumanCells=0,
  x=>x.checkpoints[4].actualFreePhysicalProjectileSlots=129,
  x=>x.checkpoints[5].scoreable=1]){
  const x=make();modify(x);
  assert.throws(()=>verifyB344RealShooter(x),/B344_SOURCE_/);
 }
});
test('B344 no accepted real shooter shot or original paint is HOLD',()=>{
 for(const field of ['actualHumanShotRequests','changedOriginalHumanCells']){
  const x=make();x.checkpoints.forEach(r=>r[field]=0);
  assert.throws(()=>verifyB344RealShooter(x),/B344_SOURCE_/);
 }
});
