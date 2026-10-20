import {test} from 'node:test';
import assert from 'node:assert/strict';
import {qualifyB68NormalPreview} from './t21-w10b68-normal-preview-gate.mjs';
const fixture=(mode,scale=1)=>{
 const b=mode==='SWEEP',shots=b?350:110,paint=b?10500:3700;
 const pts=[0,20,40,60,80,100,120,140,160].map((second,i)=>({
  kind:'NATIVE_20_SECOND_PROGRESS',tick:1057+60*second,
  elapsedMatchSeconds:second,realSevenCpuShots:
   [1,1,1,1,1,1,1].map((_,j)=>{
    const n=Math.floor((shots/7)*second/180);
    return j===0?Math.floor(shots*second/180)-n*6:n;
   }),nativeRejoinedCpu:7,
  realCpuSourcePatrolMeters:100+second*25,
  actualSuspectedCpuStalls:0,
  originalCpuInkChanges:Math.floor(paint*
   (b?second/180:Math.min(second,65)/65)),
  originalCpuShots:Math.floor(shots*second/180),
  nativeAcceptedLateralOriginalPaintAims:b?second:0,
  outputMode:mode
 }));
 return {
  schema:'T21_W10B68_TRUE_180S_NORMAL_PREVIEW_CPU_AIM_V1',
  mode,normalPreviewHasNoQaDrive:true,
  actualChromiumPlayCanvasRapierRecast:true,
  actualBrowserMouseKeyboard:true,native180SecondTimeUp:true,
  actualRestartButtonAndFreshStaging:true,sourceGoalMovementFIXED:true,
  experimentalCpuAimNotPromotedToDefault:true,
  sourceOriginalAuthority:'25/17/26/0',
  originalActorBindingProven:false,
  actualOriginalCrossTeamPathsCertified:0,officialWinner:'NONE',
  original4v4Certified:false,actualFinalNativeSimulationTick:11800,
  originalNativeWitnesses:pts,
  b68VisualEvidence:{
   ready:'REAL_180S_READY',chartVisible:true,
   chartStatus:'REAL_NATIVE_SOURCE_30S_WINDOWS',
   saveButtonPresent:true,chartRows:6,
   nativeCpuPhysicalRejoins:7,physicalCpuSuspectedStalls:0,
   nativeB64SourceInkAim:b,cpuLateralSourceAims:b?170:0,
   sourceCpuShots:shots,changedOriginalSourceCells:paint,
   cpuPatrolMeters:4500*scale,nativeFrameCallbackP95:810}
 };
};
test('two actual preview full runs qualify without CPU rollout',()=>{
 const out=qualifyB68NormalPreview(fixture('FIXED'),fixture('SWEEP'));
 assert.equal(out.secondaryNonproductionPreviewQualityGate,true);
 assert.equal(out.defaultCpuSwitched,false);
 assert.equal(out.original4v4Certified,false);
 assert.equal(out.comparison.absoluteChangedSourceCellsDelta,6800);
});
test('movement regression rejects candidate even with superior ink',()=>{
 const out=qualifyB68NormalPreview(fixture('FIXED'),
  fixture('SWEEP',1.13));
 assert.equal(out.secondaryNonproductionPreviewQualityGate,false);
});
test('faked source score, missing CPU, fabricated timing fail closed',()=>{
 const valid=fixture('FIXED');
 const bad={...valid,sourceOriginalAuthority:'25/17/26/1'};
 assert.throws(()=>qualifyB68NormalPreview(bad,fixture('SWEEP')),
  /ORIGINAL_SOURCE_AUTHORITY/);
 const noCpu=fixture('SWEEP');noCpu.originalNativeWitnesses[4].realSevenCpuShots=[];
 assert.throws(()=>qualifyB68NormalPreview(valid,noCpu),
  /SEVEN_ACTUAL_CPU_SHOT_TOTALS/);
 const missing=fixture('SWEEP');
 missing.originalNativeWitnesses.splice(3,1);
 assert.throws(()=>qualifyB68NormalPreview(valid,missing),
  /MISSING_20S_NATIVE_POINTS|NO_ACTUAL_NATIVE_SAMPLE/);
});
