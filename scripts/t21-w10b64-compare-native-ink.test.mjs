import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareB64NativeInk} from './t21-w10b64-compare-native-ink.mjs';
const series=(mode)=>{
 const points=[];
 for(let i=0;i<=6;i++)points.push({
  realPhysicsTick:1100+i*1200,trueNativeMatchSeconds:i*20,
  allSevenCpuOriginalFootRejoined:7,realCpuSourceShots:i*3,
  realCpuChangedSourceInkCells:i*150,
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
 assert.equal(q.decision,'HOLD_UNTIL_SECONDARY_REAL_SOURCE_QUALITY_REVIEW');
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
