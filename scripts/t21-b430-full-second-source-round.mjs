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
  end.tick>=d.base.started.tick+10800&&
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
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];gate(file?.endsWith('.json'),'FILE');
 const r=auditB430TrueSecond180s(JSON.parse(readFileSync(file,'utf8')));
 writeFileSync(resolve(file,'..','b430-independent-two-real-180s-verdict.json'),
  JSON.stringify(r,null,2)+'\n');
 console.log('B430_INDEPENDENT_TWO_REAL_180S',JSON.stringify(r));
}
