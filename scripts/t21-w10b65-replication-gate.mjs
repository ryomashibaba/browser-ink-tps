#!/usr/bin/env node
/** W10-B65: independently compare TWO genuine native source A/B pairs.
 * Strictly a QA qualification, never mutate CPU defaults or original sources.
 */
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compareB64NativeInk} from './t21-w10b64-compare-native-ink.mjs';
export function judgeB65IndependentRuns(prior,repeat){
 const a=compareB64NativeInk(prior.fixed,prior.sweep);
 const b=compareB64NativeInk(repeat.fixed,repeat.sweep);
 const enough=(v)=>
  v.candidateForSecondaryIndependentReview===true&&
  v.realSourceInkChangedCellsDelta>=1000&&
  v.sweep.changedCells>=Math.ceil(v.fixed.changedCells*1.5)&&
  v.matched60To120NativeSecondInkChange.extraChangedCells>=100&&
  Math.abs(v.relativePatrolDeltaAt120)<=.05&&
  v.sweep.acceptedLateralOriginalPaintAims>0&&
  v.automaticExperimentalCpuPromotion===false&&
  v.officialWinner==='NONE';
 const both= enough(a)&&enough(b);
 return {
  schema:'T21_W10B65_REPLICATED_GENUINE_SOURCE_CPU_INK_AB_V1',
  source:'TWO_INDEPENDENT_CHROMIUM_130_NATIVE_SECONDS_PER_AIM',
  previousRunGitHubActionsId:39432637747,
  replicaUsesSameGameSourceAuthority:true,
  prior:{fixedCellsAt120:a.fixed.changedCells,
   sweepCellsAt120:a.sweep.changedCells,
   changedCellsDeltaAt120:a.realSourceInkChangedCellsDelta,
   inkChangeDelta60To120:a.matched60To120NativeSecondInkChange.extraChangedCells,
   patrolRelativeDelta:a.relativePatrolDeltaAt120},
  repeat:{fixedCellsAt120:b.fixed.changedCells,
   sweepCellsAt120:b.sweep.changedCells,
   changedCellsDeltaAt120:b.realSourceInkChangedCellsDelta,
   inkChangeDelta60To120:b.matched60To120NativeSecondInkChange.extraChangedCells,
   patrolRelativeDelta:b.relativePatrolDeltaAt120},
  replicatedSubstantiveSourceInkGain:both,
  originalPhysics:25,originalPaintable:17,originalNav:26,
  originalScoreable:0,
  realCrossTeamPathsCertified:0,
  officialOriginalTurfResult:'NONE',
  npcBehaviourChangedOutsideSourceInkAim:false,
  decision:both?
   'QUALIFIED_FOR_SEPARATE_PREVIEW_DEFAULT_REPRODUCTION_QA':
   'REJECT_DEFAULT_INK_AIM_PROMOTION_OR_REPEAT_EVIDENCE',
  defaultCpuSwitched:false,
  original4v4Certified:false,
  productionAuthorized:false
 };
}
const load=(dir,mode)=>JSON.parse(readFileSync(
 join(dir,'w10b64-native-'+mode+'.json'),'utf8'));
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{
  const [prior,repeat]=process.argv.slice(2);
  if(!prior||!repeat)throw Error('B65_REQUIRES_TWO_INDEPENDENT_ARTIFACT_FOLDERS');
  const q=judgeB65IndependentRuns(
   {fixed:load(prior,'FIXED'),sweep:load(prior,'SWEEP')},
   {fixed:load(repeat,'FIXED'),sweep:load(repeat,'SWEEP')});
  console.log('T21_W10B65_SOURCE_A_B_INDEPENDENT_REPLICATION',JSON.stringify(q));
 }catch(e){console.error('T21_W10B65_SAFE_STOP',String(e));process.exitCode=1;}
}
