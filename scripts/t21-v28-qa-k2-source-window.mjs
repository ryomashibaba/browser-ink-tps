#!/usr/bin/env node
/** Issue #18: read-only diagnosis of genuine B440/K2 native tick provenance.
 * No stage, clock, Actor, ink, projectile, score, or test-runner writes. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const T21_K2_REQUIRED_NATIVE_TICKS=600;

/** Passing the time window proves ONLY elapsed native ticks in the same
 * browser document, not CPU shots, impacts, HP, respawns or 4v4. */
export function t21QaAuditK2LiveWindow({
 firstTick,lastTick,expectedBrowserOrigin,observedBrowserOrigin,
 configuredObservationTicks
}){
 const validTicks=Number.isSafeInteger(firstTick)&&firstTick>=0&&
  Number.isSafeInteger(lastTick)&&lastTick>=0;
 const validOrigins=Number.isFinite(expectedBrowserOrigin)&&
  expectedBrowserOrigin>0&&Number.isFinite(observedBrowserOrigin)&&
  observedBrowserOrigin>0;
 const validConfiguration=Number.isSafeInteger(configuredObservationTicks)&&
  configuredObservationTicks>=0;
 const nativeTickDelta=validTicks?lastTick-firstTick:null;
 const sameBrowserOrigin=validOrigins?
  expectedBrowserOrigin===observedBrowserOrigin:null;
 const reasons=[];
 if(!validConfiguration)reasons.push('HOLD_INVALID_K2_CONFIGURED_TICKS');
 if(!validTicks)reasons.push('HOLD_K2_NATIVE_TICK_EVIDENCE_INVALID');
 else if(nativeTickDelta<=0)reasons.push('HOLD_K2_NO_FORWARD_NATIVE_TICKS');
 else if(nativeTickDelta<T21_K2_REQUIRED_NATIVE_TICKS)
  reasons.push('HOLD_K2_NATIVE_DELTA_BELOW_600');
 if(!validOrigins)reasons.push('HOLD_K2_BROWSER_ORIGIN_UNAVAILABLE');
 else if(!sameBrowserOrigin)reasons.push('HOLD_K2_BROWSER_ORIGIN_CHANGED');
 return {
  schema:'T21_V28_ISSUE18_K2_SAME_LIVE_WINDOW_AUDIT_V1',
  source:'25/17/26/0',
  firstTick:validTicks?firstTick:null,
  lastTick:validTicks?lastTick:null,
  nativeTickDelta,
  configuredObservationTicks:validConfiguration?configuredObservationTicks:null,
  k2RequiredNativeTicks:T21_K2_REQUIRED_NATIVE_TICKS,
  configuredWindowShorterThanK2Minimum:validConfiguration?
   configuredObservationTicks<T21_K2_REQUIRED_NATIVE_TICKS:null,
  browserOriginEqual:sameBrowserOrigin,
  reasons,
  verdict:reasons.length?'HOLD_K2_WINDOW':
   'PASS_LIMITED_SAME_BROWSER_K2_TIME_WINDOW_ONLY',
  eligibleForK2Counters:reasons.length===0,
  realCpuProjectilesCertified:false,
  allSevenCpuImpactInkCertified:false,
  naturalOpponentCombatCertified:false,
  actualHpZeroOr150TickRespawnCertified:false,
  formal4v4Certified:false,
  actorWrites:0,sourceGeometryWrites:0,clockWrites:0,scoreWrites:0
 };
}

/** Historic RAW contains periodic CPU frames, but not the K2 terminal tick
 * or terminal browser origin. Those values must stay UNKNOWN. */
export function t21QaAuditHistoricalB440Proof(proof){
 if(!proof||proof.schema!=='B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF'||
    proof.source!=='25/17/26/0')
  throw Error('ISSUE18_SOURCE_RAW_SCHEMA_OR_AUTHORITY_MISMATCH');
 const native=proof.b441NativeEvidence;
 if(!native||!Number.isSafeInteger(proof.after?.tick)||
    !Number.isSafeInteger(native.intendedRealNativeTicks)||
    !Array.isArray(native.realFrames))
  throw Error('ISSUE18_NATIVE_OBSERVATION_RAW_INCOMPLETE');
 const ticks=native.realFrames.map(v=>v.tick);
 if(!ticks.every(Number.isSafeInteger)||
    ticks.some((tick,i)=>tick<=proof.after.tick||
     (i>0&&tick<=ticks[i-1])))
  throw Error('ISSUE18_NATIVE_OBSERVATION_FRAMES_INVALID');
 const lastRecordedFrameTick=ticks.length?ticks.at(-1):null;
 const exactK2FinalTick=Number.isSafeInteger(proof.k2WindowProvenance?.lastTick)?
  proof.k2WindowProvenance.lastTick:null;
 const requested=native.intendedRealNativeTicks;
 return {
  schema:'T21_V28_ISSUE18_HISTORICAL_B440_RAW_TRIAGE_V1',
  source:'25/17/26/0',
  originalRunVerdict:proof.verdict,
  originalError:proof.error??null,
  k2FirstTick:proof.after.tick,
  configuredObservationTicks:requested,
  k2RequiredNativeTicks:T21_K2_REQUIRED_NATIVE_TICKS,
  configuredWindowShorterThanK2Minimum:
   requested<T21_K2_REQUIRED_NATIVE_TICKS,
  lastRecordedNativeFrameTick:lastRecordedFrameTick,
  latestRecordedSampleDelta:lastRecordedFrameTick===null?null:
   lastRecordedFrameTick-proof.after.tick,
  exactK2FinalTick,
  exactK2FinalBrowserOrigin:proof.k2WindowProvenance?.observedBrowserOrigin??null,
  canIndependentlyDetermineSingleTriggeredClause:
   exactK2FinalTick!==null&&
   typeof proof.k2WindowProvenance?.browserOriginEqual==='boolean',
  finding:requested<T21_K2_REQUIRED_NATIVE_TICKS?
   'HOLD_K2_REQUESTED_WINDOW_TOO_SHORT_FINAL_GATE_CAUSE_NOT_FULLY_SAVED':
   'HOLD_K2_FINAL_GATE_REQUIRES_RAW_PROVENANCE',
  genuinePlayerShots:proof.b475RealMouseAccepted?.realHumanShots??null,
  genuinePlayerImpactChangedCells:
   proof.nativePlayerShotPaintHud?.lastImpactChangedCells??null,
  genuineSevenCpuRejoins:proof.after?.cpuRejoins??null,
  sourceGameplayWasAlteredByObserver:false,
  gameplayPassCertified:false,
  formal4v4Certified:false
 };
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const file=process.argv[2];
 if(!file){
  console.error('USAGE: node scripts/t21-v28-qa-k2-source-window.mjs <real-B440-RAW.json>');
  process.exitCode=2;
 }else{
  try{
   const proof=JSON.parse(readFileSync(resolve(file),'utf8'));
   console.log(JSON.stringify(t21QaAuditHistoricalB440Proof(proof),null,2));
  }catch(error){console.error(String(error));process.exitCode=2;}
 }
}
