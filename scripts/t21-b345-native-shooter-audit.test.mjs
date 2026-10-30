import test from 'node:test';
import assert from 'node:assert/strict';
import {b345AuditRealSourceOpening} from './t21-b345-native-shooter-audit.mjs';
const sample=()=>({schema:'B344_ACTUAL_SOURCE_HUMAN_HELD_SHOOTER',
 source:'25/17/26/0',fakeTicks:0,fakeShots:0,baselineTick:100,
 checkpoints:['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60']
 .map((label,i)=>({label,tick:100+i*12,
  actualHumanShotRequests:i*2,changedOriginalHumanCells:i*10,
  realPlayerInk:100-i*1.9,actualOpeningDebtClamps:i?1:0,
  actualFreePhysicalProjectileSlots:128-i,
  scoreable:0,productionAuthorized:false}))});
test('B345 sample shape acceptance does not certify original game',()=>{
 const v=b345AuditRealSourceOpening(sample());
 assert.equal(v.realExperimentFirst12TickShots,2);
 assert.equal(v.realBaselineFirst12TickShots,7);
 assert.equal(v.NintendoExactRateCertified,false);
});
test('rejects fake native clamp and too many first shots',()=>{
 for(const modify of [x=>x.checkpoints.forEach(v=>v.actualOpeningDebtClamps=0),
 x=>x.checkpoints[1].actualHumanShotRequests=7,
 x=>x.checkpoints[2].actualOpeningDebtClamps=0,
 x=>x.checkpoints[4].tick=100,
 x=>x.checkpoints[5].scoreable=1]){
  const x=sample();modify(x);
  assert.throws(()=>b345AuditRealSourceOpening(x),/B34[45]_SOURCE_/);
 }
});
