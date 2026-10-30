#!/usr/bin/env node
/** Verify real B345 SOURCE opening vs fixed genuine B344 7-shot first
 * interval; this is an observed pair of runs, not randomized causal proof. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyB344RealShooter} from './t21-b344-native-shooter-audit.mjs';
const need=(v,k)=>{if(!v)throw Error('B345_SOURCE_'+k);};
export function b345AuditRealSourceOpening(w){
 const base=verifyB344RealShooter(w),xs=w.checkpoints;
 for(let i=0;i<xs.length;i++){
  const s=xs[i];
  need(Number.isSafeInteger(s.actualOpeningDebtClamps)&&
   s.actualOpeningDebtClamps>=0,'REAL_OPENING_COUNTER_'+i);
  if(i)need(s.actualOpeningDebtClamps>=xs[i-1].actualOpeningDebtClamps,
   'MONOTONIC_OPENING_CLAMPS_'+i);
 }
 need(xs[0].actualOpeningDebtClamps===0&&
  xs[1].actualOpeningDebtClamps>=1,'REAL_IDLE_DEBT_BOUND_ON_FIRST_PRESS');
 const [early,...later]=base.perIntervalActualShotRequests;
 need(early>=1&&early<=3&&later.every(x=>x>=1&&x<=3),
  'EARLY_OPENING_OR_HELD_CADENCE_UNCORRECTED');
 need(base.actualHumanShotRequests>=7&&base.actualHumanShotRequests<=13,
  'GENUINE_TOTAL_60_TICK_SHOTS');
 return {schema:'B345_GENUINE_SHOOTER_IDLE_OPENING_COMPARISON',
  verdict:'PASS_SAMPLED_NATIVE_SOURCE_SHOOTER_OPENING_DEBT_BOUNDED',
  baselineB344RealChromiumRun:40997586801,
  realBaselineFirst12TickShots:7,realExperimentFirst12TickShots:early,
  realBaseline60TickShots:15,realExperiment60TickShots:base.actualHumanShotRequests,
  realOpeningClampEvents:xs.at(-1).actualOpeningDebtClamps,
  realExperiment12TickShots:base.perIntervalActualShotRequests,
  realOriginalPaintChangedCells:base.actualOriginalChangedCells,
  originalSource:'25/17/26/0',noSyntheticBulletsOrTicks:true,
  scoreable:0,realOriginalRoutesCertified:'0/12',
  differentRunsNotRandomized:true,NintendoExactRateCertified:false,
  shooterHitRegistrationCertified:false,artAccepted:false,
  productionAuthorized:false,unrestricted4v4Certified:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'PROOF_DIR');
 const w=JSON.parse(readFileSync(join(dir,'b344-native-human-shooter-ticks.json'),'utf8'));
 const v=b345AuditRealSourceOpening(w);
 writeFileSync(join(dir,'b345-independent-opening.json'),JSON.stringify(v,null,2)+'\n');
 console.log('B345_REAL_SOURCE_NATIVE_OPENING_VERDICT',JSON.stringify(v));
}
