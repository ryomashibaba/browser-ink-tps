#!/usr/bin/env node
/** W10-B64 real same-source FIXED vs optional SWEEP: read-only analysis.
 * Never automatically adopt a CPU variant, change stage masks or report Turf.
 */
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const count=x=>Number.isSafeInteger(x)&&x>=0;
export function compareB64NativeInk(a,b){
 if(a.mode!=='FIXED'||b.mode!=='SWEEP')throw Error('B64_MODE_PAIR_INVALID');
 const observe=r=>{
  if(r.truePhysicsUntil130NativeMatchSeconds!==true||
     r.originalStageAuthority!=='25/17/26/0'||
     r.sourceCpuFixedGoals!==true||
     r.promotedAsNormalCpu!==false||
     r.points.length<7)throw Error('B64_REAL_SOURCE_AUTHORITY_NOT_VERIFIED');
  let previous=null;
  for(const p of r.points){
   if(![p.realPhysicsTick,p.realCpuSourceShots,
     p.realCpuChangedSourceInkCells,p.allSevenCpuOriginalFootRejoined,
     p.trueNativeMatchSeconds,p.sourceInkTargetCandidates,
     p.sourceLateralAimsChosen].every(Number.isFinite)||
     !count(p.realPhysicsTick)||!count(p.realCpuSourceShots)||
     !count(p.realCpuChangedSourceInkCells)||
     p.allSevenCpuOriginalFootRejoined!==7||
     p.trueNativeMatchSeconds<0||p.trueNativeMatchSeconds>135||
     (previous&&(p.realPhysicsTick<previous.realPhysicsTick||
       p.realCpuSourceShots<previous.realCpuSourceShots||
       p.realCpuChangedSourceInkCells<previous.realCpuChangedSourceInkCells||
       p.trueNativeMatchSeconds<previous.trueNativeMatchSeconds)))
    throw Error('B64_NON_NATIVE_OR_NONMONOTONIC_SOURCE_EVIDENCE');
   previous=p;
  }
  if(previous.trueNativeMatchSeconds<120)throw Error('B64_SOURCE_120S_UNVERIFIED');
  if(r.mode==='FIXED'&&r.points.some(p=>
   p.sourceInkTargetCandidates!==0||p.sourceLateralAimsChosen!==0))
   throw Error('B64_FIXED_DEFAULT_NOT_PRESERVED');
  return previous;
 };
 const af=observe(a),bf=observe(b);
 return {
  schema:'T21_W10B64_REAL_ORIGINAL_SOURCE_FIXED_SWEEP_EVIDENCE_V1',
  originalStage:'25_PHYSICS_17_PAINT_26_NAV_0_SCOREABLE',
  sourceCpuFixedRecastGoals:true,
  automaticExperimentalCpuPromotion:false,
  originalNintendo4v4Certified:false,
  officialWinner:'NONE',
  fixed:{shots:af.realCpuSourceShots,changedCells:af.realCpuChangedSourceInkCells,
   trueNativeMatchSeconds:af.trueNativeMatchSeconds},
  sweep:{shots:bf.realCpuSourceShots,changedCells:bf.realCpuChangedSourceInkCells,
   trueNativeMatchSeconds:bf.trueNativeMatchSeconds,
   sampledOriginalPaintCandidates:bf.sourceInkTargetCandidates,
   acceptedLateralOriginalPaintAims:bf.sourceLateralAimsChosen},
  realSourceInkChangedCellsDelta:bf.realCpuChangedSourceInkCells-
   af.realCpuChangedSourceInkCells,
  decision:'HOLD_UNTIL_SECONDARY_REAL_SOURCE_QUALITY_REVIEW',
  warning:'More CPU shots are not proof of ink impact; route and original 4v4 remain HOLD'
 };
}
export function inspectB64Evidence(dir){
 const a=JSON.parse(readFileSync(join(dir,'w10b64-native-FIXED.json'),'utf8'));
 const b=JSON.parse(readFileSync(join(dir,'w10b64-native-SWEEP.json'),'utf8'));
 return compareB64NativeInk(a,b);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{
  const v=inspectB64Evidence(resolve(process.argv[2]??'b64-evidence'));
  console.log('T21_W10B64_REAL_NATIVE_SOURCE_A_B_HOLD',JSON.stringify(v));
 }catch(e){
  console.error('T21_W10B64_EVIDENCE_GATE_FAILED',e);
  process.exitCode=1;
 }
}
