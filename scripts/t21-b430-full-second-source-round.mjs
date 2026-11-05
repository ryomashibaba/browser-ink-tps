#!/usr/bin/env node
/** B430: independent, read-only proof of TWO separate 180s SOURCE rounds.
 * Does not certify scoreable turf, 4v4 opponents, ART or production. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditB419NativeReplay} from './t21-b419-real-full-round-fresh-replay.mjs';
const gate=(x,name)=>{if(!x)throw Error('B430_TRUE_SECOND_180S_HOLD_'+name)};
const isInt=x=>Number.isSafeInteger(x)&&x>=0;
const genuine=s=>s?.source==='25/17/26/0'&&
 s.origin>0&&isInt(s.tick)&&s.cpuCount===7&&s.rejoins===7&&
 s.relocations===0&&s.scoreable===0&&s.winner==='NONE'&&
 s.prod===false&&s.fourvfour===false&&
 isInt(s.shots)&&isInt(s.cpuSourceShots)&&isInt(s.cpuPaintCells)&&
 isInt(s.humanPaintCells)&&Number.isFinite(s.ink)&&
 s.ink>=0&&s.ink<=100;
/** Parse the ACTUAL visible B463 SOURCE history, including its exact
 * signed deltas. JSON/DOM text is observation only, never game evidence
 * for time, score, actor position or native source authorization. */
export function b430ParseRealSourceRoundHistory(text){
 if(typeof text!=='string'||text.length>8192||
    !text.startsWith('PREVIOUS LOCAL SOURCE ROUND • NOT AN OFFICIAL SCORE\n')||
    !text.includes('WINNER NONE'))return null;
 const shots=/^HUMAN SHOTS (\d+) → (\d+) \(([+-]?\d+)\)$/m.exec(text);
 const ink=/^HUMAN INK CELLS (\d+) → (\d+) \(([+-]?\d+)\)$/m.exec(text);
 if(!shots||!ink)return null;
 const a=shots.slice(1).map(Number),b=ink.slice(1).map(Number);
 if(![...a,...b].every(Number.isSafeInteger)||
    a[0]<0||a[1]<0||b[0]<0||b[1]<0||
    a[2]!==a[1]-a[0]||b[2]!==b[1]-b[0])return null;
 return {previousTabHumanShots:a[0],currentRealHumanShots:a[1],
  previousTabHumanInkCells:b[0],currentRealHumanInkCells:b[1]};
}

export function auditB430TrueSecond180s(d){
 gate(d?.schema==='B430_TRUE_SECOND_SOURCE_180S'&&
  d.syntheticTicks===false&&d.actorWrites===0&&d.scoreWrites===0&&
  d.nativeClockWrites===0&&Array.isArray(d.samples)&&d.samples.length===3,
  'PROVENANCE');
 // Re-run B419 independent audit; fake restart, old TIME_UP or shot fails.
 const prior=auditB419NativeReplay(d.base);
 gate(prior.verdict==='PASS_REAL_180S_TO_NATIVE_FRESH_SECOND_ROUND_SHOT'&&
  d.secondOrigin===d.base.boot.origin,'B419_AND_SECOND_ORIGIN');
 const [at120,at60,end]=d.samples;
 // Real B413 2x180s artifact #13383758500: the first PLAYING snapshot
 // arrived at tick 1060 with 179.9166667s remaining, i.e. the native
 // countdown had already consumed 5 genuine 60Hz ticks before observation.
 // Requiring 10800 MORE ticks after that delayed sample falsely rejected
 // genuine end tick 11857 (10797 later). Reconcile actual observed native
 // ticks and the remaining value on the already-authenticated SOURCE clock.
 // No native tick writes, time skips, actor movement or gate relaxation.
 const started=d.base.started;
 const genuineCountdownTicksBeforeFirstPlaying=
  (180-started.remaining)*60;
 const genuineElapsedNativeTicksAfterFirstPlaying=
  end.tick-started.tick;
 const genuineTotalSourceCountdownTicks=
  genuineCountdownTicksBeforeFirstPlaying+
  genuineElapsedNativeTicksAfterFirstPlaying;
 const fullRealCountdown=
  Number.isFinite(genuineCountdownTicksBeforeFirstPlaying)&&
  started.remaining>0&&started.remaining<180&&
  Number.isSafeInteger(genuineElapsedNativeTicksAfterFirstPlaying)&&
  genuineElapsedNativeTicksAfterFirstPlaying>0&&
  genuineTotalSourceCountdownTicks>=10800;
 for(const [s,phase] of [[at120,'PLAYING'],[at60,'PLAYING'],[end,'TIME_UP']]){
  gate(genuine(s)&&s.phase===phase&&s.origin===d.secondOrigin&&
   s.shots>=d.base.fired.shots&&s.tick>d.base.fired.tick&&
   ['RUNNING','CLEAR','TIME_UP'].includes(s.mission),
   'AUTHENTIC_'+(s?.label??phase));
 }
 gate(at120.label==='120'&&at60.label==='60'&&end.label==='TIME_UP'&&
  at120.paused===false&&at60.paused===false&&
  at120.pointerLocked===true&&at60.pointerLocked===true&&
  at120.remaining>117&&at120.remaining<=120.001&&
  at60.remaining>57&&at60.remaining<=60.001&&
  end.remaining===0&&end.paused===true&&
  at120.tick<at60.tick&&at60.tick<end.tick&&
  at120.tick>=d.base.fired.tick&&
  fullRealCountdown&&
  at120.cpuSourceShots<=at60.cpuSourceShots&&
  at60.cpuSourceShots<=end.cpuSourceShots&&
  at120.cpuPaintCells<=at60.cpuPaintCells&&
  at60.cpuPaintCells<=end.cpuPaintCells&&
  end.cpuSourceShots>0&&end.cpuPaintCells>0,
  'NATIVE_SECOND_180S_TIMELINE');
 gate(Array.isArray(d.humanActivity)&&d.humanActivity.length===2,
  'SECOND_NATIVE_HUMAN_ACTIVITY_COUNT');
 for(let i=0;i<2;i++){
  const a=d.humanActivity[i],s=d.samples[i],next=d.samples[i+1];
  gate(a?.label===s.label&&a.origin===d.secondOrigin&&
   a.syntheticInput===false&&a.actorWrites===0&&
   a.scoreWrites===0&&a.nativeClockWrites===0&&
   a.nativeCpuCount===7&&isInt(a.beforeTick)&&
   isInt(a.afterTick)&&a.beforeTick>=s.tick&&
   a.afterTick>a.beforeTick&&a.afterTick<next.tick&&
   isInt(a.beforeShots)&&isInt(a.afterShots)&&
   a.beforeShots>=s.shots&&a.afterShots>=a.beforeShots+3&&
   next.shots>=a.afterShots&&
   Number.isFinite(a.beforeInk)&&a.beforeInk>=5&&
   a.beforeInk<=100&&Number.isFinite(a.afterInk)&&
   a.afterInk>=0&&a.beforeInk-a.afterInk>=1,
   'SECOND_ACTUAL_HUMAN_FIRE_'+s.label);
 }
 gate(d.secondEndUi?.visible===true&&
  d.secondEndUi.realModalFinished===true&&
  d.secondEndUi.buttonVisible===true&&
  d.secondEndUi.buttonDisabled===false,
  'SECOND_TRUE_FINISHED_UI');
 return {schema:'B430_INDEPENDENT_TWO_REAL_SOURCE_180S',
  verdict:'PASS_TWO_REAL_180S_SEPARATE_SOURCE_WORLDS',
  firstTimeUpTick:d.base.old.tick,
  genuineNewBrowserOrigin:d.secondOrigin,
  secondStartedTick:d.base.started.tick,
  secondStartedRemainingSeconds:d.base.started.remaining,
  observedNativeTicksAfterFirstPlaying:
   genuineElapsedNativeTicksAfterFirstPlaying,
  originalSourceCountdownTicksBeforeFirstPlaying:
   genuineCountdownTicksBeforeFirstPlaying,
  verifiedFullOriginalSourceCountdownTicks:
   genuineTotalSourceCountdownTicks,
  secondTimeUpTick:end.tick,
  secondPlayerShots:end.shots,
  secondCpuSourceShotRequests:end.cpuSourceShots,
  secondCpuOriginalPaintedCells:end.cpuPaintCells,
  secondHumanOriginalPaintedCells:end.humanPaintCells,
  fullSecondMatch180s:true,nativeCpuCount:7,
  secondRealLateHumanFireBursts:d.humanActivity.length,
  secondRealLateHumanShots:d.humanActivity.reduce(
   (sum,a)=>sum+a.afterShots-a.beforeShots,0),
  originalSource:'25/17/26/0',officialScoreable:0,officialWinner:'NONE',
  realNaturalEnemyRouteCertified:false,realEnemyHitCertified:false,
  full4v4Certified:false,artAccepted:false,productionAuthorized:false,
  nativeClockWrites:0,actorWrites:0,scoreWrites:0};
}
/** B438: true original HUMAN movement during second fully native round.
 * B430's prior two-real-180s artifact remains a valid independent pass. */
export function auditB438SecondRoundWalk(d){
 const old=auditB430TrueSecond180s(d);
 gate(old.fullSecondMatch180s&&Array.isArray(d.humanMovement)&&
  d.humanMovement.length===2,'B438_SECOND_ROUND_WALK_COUNT');
 let meters=0;
 for(let i=0;i<2;i++){
  const m=d.humanMovement[i], s=d.samples[i], n=d.samples[i+1],
   fired=d.humanActivity[i];
  const coords=[...(Array.isArray(m?.from)?m.from:[]),
   ...(Array.isArray(m?.to)?m.to:[])];
  const real=coords.length===6&&coords.every(Number.isFinite)?
   Math.hypot(m.to[0]-m.from[0],m.to[2]-m.from[2]):NaN;
  gate(m?.label===s.label&&m.origin===d.secondOrigin&&
   m.nativeKey==='KeyW'&&m.syntheticInput===false&&
   m.actorWrites===0&&m.scoreWrites===0&&m.nativeClockWrites===0&&
   isInt(m.beforeTick)&&isInt(m.afterTick)&&
   m.beforeTick>=fired.afterTick&&m.afterTick>m.beforeTick&&
   m.afterTick-m.beforeTick<=24&&m.afterTick<n.tick&&
   m.shotsBefore===fired.afterShots&&m.shotsAfter===m.shotsBefore&&
   typeof m.originalFootBefore==='string'&&
   m.originalFootBefore.startsWith('UndertowT21D:')&&
   m.originalFootAfter===m.originalFootBefore&&
   m.supportedBefore===true&&m.supportedAfter===true&&
   m.originalSourceOnlyBefore===true&&m.originalSourceOnlyAfter===true&&
   m.originalWitnessSchemaBefore===
    'W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1'&&
   m.originalWitnessSchemaAfter===
    'W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1'&&
   Number.isFinite(m.sourceBoundaryClearanceBefore)&&
   Number.isFinite(m.sourceBoundaryClearanceAfter)&&
   m.sourceBoundaryClearanceBefore>=.65&&
   m.sourceBoundaryClearanceAfter>=.65&&
   m.beforeMode==='HUMAN'&&m.afterMode==='HUMAN'&&
   m.cpuBefore===7&&m.cpuAfter===7&&
   Number.isFinite(real)&&real>=.10&&real<=2.2&&
   Number.isFinite(m.originalPlanarMeters)&&
   Math.abs(real-m.originalPlanarMeters)<.00001,
   'B438_TRUE_ORIGINAL_SOURCE_KCC_'+s.label);
  meters+=real;
 }
 return {schema:'B438_INDEPENDENT_NATIVE_SECOND_SOURCE_HUMAN_KCC',
  verdict:'PASS_ACTUAL_REPLAY_HUMAN_WALK_IN_SECOND_180S',
  realNativeSourceStrideCount:2,realPlanarMeters:meters,
  secondRoundNativeTimeUpTick:old.secondTimeUpTick,
  secondWorldOrigin:d.secondOrigin,originalSource:'25/17/26/0',
  scoreable:0,officialWinner:'NONE',sourceOrPlayerWrites:0,
  enemyHitCertified:false,opponentRouteCertified:false,
  full4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];gate(file?.endsWith('.json'),'FILE');
 const r=auditB430TrueSecond180s(JSON.parse(readFileSync(file,'utf8')));
 writeFileSync(resolve(file,'..','b430-independent-two-real-180s-verdict.json'),
  JSON.stringify(r,null,2)+'\n');
 console.log('B430_INDEPENDENT_TWO_REAL_180S',JSON.stringify(r));
}
