#!/usr/bin/env node
/** B335: independent verifier, without QA tick/actor/ink injection. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(v,msg)=>{if(!v)throw Error('B335_REAL_180S_'+msg);};
const number=x=>typeof x==='number'&&Number.isFinite(x);
const thresholds=[180,150,120,90,60,30,0];
export function b335VerifyNativeRound(w){
 need(w?.schema==='B335_REAL_CHROMIUM_SOURCE_ROUND'&&
  w.source==='25/17/26/0'&&w.actualCdpUserClick===true&&
  w.injectedTicks===false&&w.injectedInk===false&&
  w.injectedActorPositions===false,'ORIGINAL_SOURCE_ONLY');
 const v=w.samples;
 need(Array.isArray(v)&&v.length===7&&v.every((s,i)=>
  s.thresholdSeconds===thresholds[i]),'SEVEN_CLOCK_SAMPLES');
 const start=v[0],end=v[6];
 need(start.matchState==='PLAYING'&&start.paused===false&&
  number(start.remainingSeconds)&&start.remainingSeconds>149&&
  start.remainingSeconds<=180,'PLAYING_180S_START');
 need(end.matchState==='TIME_UP'&&end.paused===true&&
  end.remainingSeconds===0&&
  Number.isSafeInteger(end.tick)&&Number.isSafeInteger(start.tick)&&
  end.tick-start.tick>=(start.remainingSeconds*60)-12,'NATIVE_TIME_UP');
 need(number(end.wallMs)&&number(start.wallMs)&&
  end.wallMs-start.wallMs>=(start.remainingSeconds-4)*950,
  'TRUE_WALL_CLOCK_ELAPSED');
 for(let i=0;i<7;i++){
  const s=v[i];
  need(s.matchState===(i===6?'TIME_UP':'PLAYING')&&
   (i===6?s.paused===true:s.paused===false)&&s.stopReason===null&&
   Number.isSafeInteger(s.tick)&&number(s.remainingSeconds)&&
   s.remainingSeconds<=s.thresholdSeconds+.2&&s.remainingSeconds>=0&&
   s.originalSolids===25&&s.originalPaint===17&&
   s.originalNavLinks===26&&s.scoreable===0&&
   s.unrestricted4v4Certified===false&&
   s.productionAuthorized===false&&s.officialWinner==='NONE'&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.cpuActors===7&&s.actualCpuRejoined===7&&
   s.cpuRelocations===0&&
   Number.isSafeInteger(s.humanInk)&&s.humanInk>=0&&
   Number.isSafeInteger(s.cpuInk)&&s.cpuInk>=0&&
   Number.isSafeInteger(s.humanShots)&&s.humanShots>=0&&
   Array.isArray(s.actualHumanBody)&&s.actualHumanBody.length===3&&
   s.actualHumanBody.every(number)&&
   Object.hasOwn(s,'originalHumanFootSupport')&&
   number(s.wallMs),'SOURCE_SAMPLE_'+i);
  if(i>0){
   const p=v[i-1];
   need(s.tick>p.tick&&s.remainingSeconds<p.remainingSeconds&&
    s.wallMs>p.wallMs&&s.humanInk>=p.humanInk&&s.cpuInk>=p.cpuInk&&
    s.humanShots>=p.humanShots,'NATIVE_MONOTONIC_'+i);
  }
 }
 return {schema:'B335_INDEPENDENT_180S_RESULT',
  verdict:'PASS_GENUINE_CHROMIUM_180S_TIME_UP',
  realNativeTicks:end.tick-start.tick,realElapsedWallMs:end.wallMs-start.wallMs,
  humanInkAtExpiry:end.humanInk,cpuInkAtExpiry:end.cpuInk,
  milestoneTicks:v.map(x=>[x.thresholdSeconds,x.tick,x.remainingSeconds]),
  winner:'NONE',stage:'25/17/26/0',
  originalCpuCrossTeamRoutes:'0/12',
  artAccepted:false,unrestricted4v4Certified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 need(typeof dir==='string'&&dir.length>0,'ARTIFACT_DIR');
 const w=JSON.parse(readFileSync(join(dir,'b335-real-round.json'),'utf8'));
 const result=b335VerifyNativeRound(w);
 for(const name of ['B335_START.png','B335_MID.png','B335_TIME_UP.png'])
  need(statSync(join(dir,name)).size>20000,'REAL_CHROMIUM_FRAME_'+name);
 writeFileSync(join(dir,'b335-independent-verdict.json'),
  JSON.stringify(result,null,2));
 console.log('B335_REAL_NATIVE_180_SECOND_VERDICT',JSON.stringify(result));
}
