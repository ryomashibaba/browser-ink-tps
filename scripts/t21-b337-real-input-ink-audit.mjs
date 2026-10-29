#!/usr/bin/env node
/** B337 independent limited short native Chromium gameplay audit.
 * Sampled original-foot proof is NOT continuous whole-stage traversability.
 */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(v,msg)=>{if(!v)throw Error('B337_SOURCE_GAMEPLAY_'+msg);};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const position=x=>Array.isArray(x)&&x.length===3&&x.every(finite);
const horizontal=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const labels=['START','AIM','FIRE','W','A','S','D'];
export function b337AuditNative(w){
 need(w?.schema==='B337_REAL_CHROMIUM_NATIVE_SOURCE_INPUT_INK'&&
  w.source==='25/17/26/0'&&w.realFullRound===true&&
  w.nativeCdpInput===true&&w.injectedTicks===false&&
  w.injectedInk===false&&w.injectedActorPositions===false&&
  w.officialWinner==='NONE','SOURCE_AND_INPUT_PROVENANCE');
 need(JSON.stringify(w.actions)===JSON.stringify(['MOUSE_MOVED','FIRE','KeyW','KeyA','KeyS','KeyD']),
  'ACTUAL_INPUT_SEQUENCE');
 need(Array.isArray(w.samples)&&w.samples.length===labels.length&&
  w.samples.every((s,i)=>s.label===labels[i]),'SEVEN_NATIVE_INPUT_CHECKPOINTS');
 let prior=null;
 const originalIds=new Set();
 for(let i=0;i<w.samples.length;i++){
  const s=w.samples[i];
  need(s.source==='25/17/26/0'&&s.matchState==='PLAYING'&&
   s.paused===false&&s.stopReason===null&&
   Number.isSafeInteger(s.tick)&&s.tick>=1&&finite(s.remainingSeconds)&&
   s.remainingSeconds>0&&s.remainingSeconds<=180&&
   position(s.body)&&finite(s.cameraYawDegrees)&&
   s.originalSolids===25&&s.originalPaint===17&&
   s.originalNavLinks===26&&s.scoreable===0&&
   s.productionAuthorized===false&&s.unrestricted4v4Certified===false&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.cpuCount===7&&s.cpuRejoined===7&&s.cpuRelocations===0&&
   Number.isSafeInteger(s.humanShots)&&s.humanShots>=0&&
   Number.isSafeInteger(s.humanInk)&&s.humanInk>=0&&
   (s.lastHumanImpactTick===null||Number.isSafeInteger(s.lastHumanImpactTick))&&
   (s.lastHumanPaintedSurface===null||typeof s.lastHumanPaintedSurface==='string')&&
   Array.isArray(s.originalRows)&&s.originalRows.length===17&&
   s.originalRows.every(r=>typeof r.surfaceId==='string'&&r.surfaceId.length>0&&
    [r.a,r.b,r.neutral,r.active].every(n=>Number.isSafeInteger(n)&&n>=0)&&
    r.a+r.b+r.neutral===r.active),'TRUE_SOURCE_SAMPLE_'+s.label);
  const ids=new Set(s.originalRows.map(r=>r.surfaceId));
  need(ids.size===17,'DISTINCT_SOURCE_ROWS_'+s.label);
  if(i===0)for(const id of ids)originalIds.add(id);
  else need([...originalIds].every(id=>ids.has(id)),'IMMUTABLE_SOURCE_IDS_'+s.label);
  if(prior)need(s.tick>=prior.tick&&
   s.remainingSeconds<=prior.remainingSeconds&&
   s.humanShots>=prior.humanShots&&s.humanInk>=prior.humanInk,
   'MONOTONIC_REAL_CLOCK_AND_INK_'+s.label);
  prior=s;
 }
 const [start,aim,fire,wMove,aMove,sMove,dMove]=w.samples;
 need(start.footSupported===true&&typeof start.footSolid==='string'&&
  finite(start.footGap)&&start.footGap<=0.4,'ACTUAL_ORIGINAL_START_FOOT');
 need(Math.abs(aim.cameraYawDegrees-start.cameraYawDegrees)>=0.1,
  'REAL_MOUSE_AIM_CHANGE_MISSING');
 need(fire.tick>aim.tick&&fire.humanShots>start.humanShots&&
  fire.humanInk>start.humanInk&&
  Number.isSafeInteger(fire.lastHumanImpactTick)&&
  fire.lastHumanImpactTick>start.tick&&
  originalIds.has(fire.lastHumanPaintedSurface),
  'REAL_HUMAN_SOURCE_IMPACT_MISSING');
 const moved=horizontal(fire.body,wMove.body);
 need(wMove.tick>fire.tick&&moved>=0.15&&
  wMove.footSupported===true&&typeof wMove.footSolid==='string'&&
  finite(wMove.footGap)&&wMove.footGap<=0.4,
  'REAL_KEYW_GROUNDED_ORIGINAL_DISPLACEMENT');
 need(aMove.tick>wMove.tick&&sMove.tick>aMove.tick&&dMove.tick>sMove.tick,
  'WASD_NATIVE_TICK_ADVANCE');
 return {schema:'B337_INDEPENDENT_SHORT_SOURCE_INPUT_RESULT',
  verdict:'PASS_SAMPLED_NATIVE_INPUT_MOUSE_AIM_HUMAN_INK_ORIGINAL_FOOT',
  nativeTickSpan:dMove.tick-start.tick,
  observedOriginalSupportedWMeters:Number(moved.toFixed(4)),
  actualHumanNewShots:fire.humanShots-start.humanShots,
  actualHumanChangedCells:fire.humanInk-start.humanInk,
  actualCameraYawDeltaDegrees:Number((aim.cameraYawDegrees-start.cameraYawDegrees).toFixed(3)),
  attemptedGenuineKeyboardDirections:['W','A','S','D'],
  fullyContinuousRouteCertified:false,
  naturalOpponentRouteCertified:false,scoreable:0,officialWinner:'NONE',
  gameplayCertified:false,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];
 need(!!dir,'EVIDENCE_DIRECTORY_REQUIRED');
 const w=JSON.parse(readFileSync(join(dir,'b337-real-input-ink.json'),'utf8'));
 const v=b337AuditNative(w);
 for(const file of ['B337_START.png','B337_END.png']){
  const b=readFileSync(join(dir,file));
  need(b.length>20000&&b.readUInt32BE(16)===1600&&b.readUInt32BE(20)===900,
   'REAL_BROWSER_FRAME_'+file);
 }
 writeFileSync(join(dir,'b337-independent-verdict.json'),JSON.stringify(v,null,2)+'\n');
 console.log('B337_GENUINE_SHORT_GAMEPLAY_VERDICT',JSON.stringify(v));
}
