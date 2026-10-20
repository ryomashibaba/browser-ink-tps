import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareB64NativeInk} from './t21-w10b64-compare-native-ink.mjs';
const series=(mode)=>{
 const points=[];
 for(let i=0;i<=6;i++)points.push({
  realPhysicsTick:1100+i*1200,trueNativeMatchSeconds:i*20,
  allSevenCpuOriginalFootRejoined:7,realCpuSourceShots:i*3,
  realCpuChangedSourceInkCells:i*150,
  cpuSourcePatrolMeters:i*500,suspectedPhysicalCpuStalls:0,
  sourceInkTargetCandidates:mode==='SWEEP'?i*18:0,
  sourceLateralAimsChosen:mode==='SWEEP'?i*2:0
 });
 return {mode,truePhysicsUntil130NativeMatchSeconds:true,
  originalStageAuthority:'25/17/26/0',sourceCpuFixedGoals:true,
  promotedAsNormalCpu:false,points};
};
test('B64 same original source produces measured comparison not CPU auto promotion',()=>{
 const a=series('FIXED'),b=series('SWEEP');
 b.points[6].realCpuChangedSourceInkCells=1000;
 const q=compareB64NativeInk(a,b);
 assert.equal(q.realSourceInkChangedCellsDelta,100);
 assert.equal(q.automaticExperimentalCpuPromotion,false);
 assert.equal(q.decision,'HOLD_PENDING_INDEPENDENT_REPLICATION_AND_DEFAULT_QA');
 assert.equal(q.adoptedToNormalSourcePreview,false);
 assert.equal(q.candidateForSecondaryIndependentReview,true);
 assert.equal(q.matched60To120NativeSecondInkChange.fixed,450);
 assert.equal(q.matched60To120NativeSecondInkChange.sweep,550);
 assert.equal(q.truePatrolMetersAt120.fixed,3000);
 assert.equal(q.officialWinner,'NONE');
});
test('B64 rejects forged source promotion, mode swap and non-monotonic totals',()=>{
 const a=series('FIXED'),b=series('SWEEP');
 assert.throws(()=>compareB64NativeInk(b,a),/MODE_PAIR/);
 a.promotedAsNormalCpu=true;
 assert.throws(()=>compareB64NativeInk(a,b),/AUTHORITY/);
 a.promotedAsNormalCpu=false;
 b.points[5].realCpuChangedSourceInkCells=0;
 assert.throws(()=>compareB64NativeInk(a,b),/NON_NATIVE/);
});

test('B65 original real FOOT travel or stall regression fails closed',()=>{
 const a=series('FIXED'),b=series('SWEEP');
 b.points[6].cpuSourcePatrolMeters=3100;
 assert.equal(compareB64NativeInk(a,b).candidateForSecondaryIndependentReview,true);
 b.points[6].cpuSourcePatrolMeters=3500;
 assert.equal(compareB64NativeInk(a,b).candidateForSecondaryIndependentReview,false);
 b.points[6].cpuSourcePatrolMeters=3100;
 b.points[6].suspectedPhysicalCpuStalls=1;
 assert.throws(()=>compareB64NativeInk(a,b),/STALL/);
});
test('B65 missing time windows and wrong original geometry authority cannot pass',()=>{
 const a=series('FIXED'),b=series('SWEEP');
 a.points.splice(2,1);
 assert.throws(()=>compareB64NativeInk(a,b),/TIME_WINDOWS/);
 const c=series('FIXED');
 c.originalStageAuthority='26/17/26/0';
 assert.throws(()=>compareB64NativeInk(c,b),/AUTHORITY/);
});
