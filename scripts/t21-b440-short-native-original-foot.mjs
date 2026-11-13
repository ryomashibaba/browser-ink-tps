#!/usr/bin/env node
// P1_USER_APPROVED_NATIVE_INK_LOOP_ONCE_20261113: run the existing same-world real fire -> registered OWN squid refill -> reshoot gate once; no runtime changes.
// B448_APPROVED_NATIVE_A3_ONCE_20261113: execute the pre-existing 720-tick A3 original-frontline gate once; no runtime changes.
// B441_APPROVED_SINGLE_NATIVE_RUN_20261113: one authorized 720-tick, 15-minute max native SOURCE trial; no runtime or stage changes.
/**
 * B440: SHORT TRUE Chromium source-floor human-input gate.
 * B475 B441 variant exercises the actual user-selected SOURCE human combat;
 * the historical non-B441 variant retains its A1 cooperative QA world.
 * This is NOT
 * itself a clicked-replay/2x180s proof. Real browser, real 7 CPU first drops,
 * real player KCC, real CDP W-key; no actor/tick/score/navigation writes.
 */
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {b490ValidateSamePoseFrames,b490LocalComparisonHtml} from './t21-f3l-same-pose-gate.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,isAbsolute,sep,join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const root='http://127.0.0.1:4298/browser-ink-tps/';
const b441Experiment=process.env.T21_B441_SOURCE_FRONTLINE==='1';
const p0NormalHuman=process.env.T21_P0_NORMAL_HUMAN==='1';
// Only a naturally observed physical STOP can authorize a genuine CDP R.
const p0FallROnlyOnce=process.env.T21_P0_KEY_R_FALL_ONCE==='1';
if(p0FallROnlyOnce&&!p0NormalHuman)
 throw Error('P0_FALL_R_REQUIRES_NORMAL_USER_MODE');
const p1RampOnce=p0NormalHuman&&process.env.T21_P1_TRUE_RAMP_WALK_ONCE==='1';
const b490LocalCompare=process.env.T21_B490_LOCAL_F3L_COMPARE_ONCE==='1';
const k3IntegratedSource180=process.env.T21_K3_ONE_REAL_180S==='1';
// Prepared short acceptance mode; enabling it requires individual approval.
// Reuse the K3 real input/ink path, ending after reshoot, never 180s/replay.
const p1InkLoopOnce=process.env.T21_P1_REGISTERED_INK_LOOP_ONCE==='1';
const b491PaidCpuOnce=process.env.T21_B491_CPU_PAID_OWN_ONCE==='1';
if(b491PaidCpuOnce&&(!b441Experiment||p0NormalHuman||
   k3IntegratedSource180||process.env.GITHUB_ACTIONS!=='true'||
   process.platform!=='linux'))
 throw Error('B491_ONLY_ONE_B441_PUBLIC_LINUX_NATIVE_WORLD');
if(p1InkLoopOnce&&(!p0NormalHuman||!p1RampOnce||b441Experiment||
   b490LocalCompare||k3IntegratedSource180||
   process.env.GITHUB_ACTIONS!=='true'||process.platform!=='linux'))
 throw Error('P1_INK_LOOP_REQUIRES_ONE_PUBLIC_LINUX_NORMAL_SOURCE_RAMP');
const p1InputDiagnosticOnce=p0NormalHuman&&
 process.env.T21_P1_INPUT_DIAGNOSTIC_ONCE==='1';
const p1LowerOnce=p0NormalHuman&&
 (process.env.T21_P1_LOWER_EDGE_ONCE==='1'||p1RampOnce||p1InputDiagnosticOnce);

if(p1InkLoopOnce&&(p1InputDiagnosticOnce||p0FallROnlyOnce))
 throw Error('P1_INK_LOOP_CANNOT_COMBINE_DIAGNOSTIC_OR_FALL_R');
if(k3IntegratedSource180&&(!p0NormalHuman||!p1RampOnce||p1InputDiagnosticOnce||
   b441Experiment))throw Error('K3_REQUIRES_NORMAL_P0_AND_TRUE_P1_RAMP');
 // One-shot full replay uses the EXACT real frontline portal mode, which
// includes B448. The ordinary B441 short trial remains unchanged.
const b448Experiment=b441Experiment&&(
 process.env.T21_B448_A3_REAL_ORIGINAL_FRONT==='1'||
 process.env.T21_B441_PROVE_FULL_180S_REPLAY==='1');
// An explicitly selected ONE-SHOT, genuine >3600-tick browser case.
// Ordinary pushes keep the original short real-Chromium smoke.
const proveSourcePracticeExpiry=b441Experiment&&
 process.env.T21_B441_PROVE_60S_EXPIRY==='1';
const proveFullSourceReplay=b441Experiment&&
 process.env.T21_B441_PROVE_FULL_180S_REPLAY==='1';
const proveRealQ=b441Experiment&&process.env.T21_B441_REAL_Q_ONCE==='1';
const proveRealSweep=b441Experiment&&process.env.T21_B441_REAL_SWEEP_ONCE==='1';
const proveRealSweepClear=proveRealSweep&&
 process.env.T21_B441_REAL_SWEEP_CLEAR==='1';
const proveRealCharger=b441Experiment&&process.env.T21_B441_REAL_CHARGER_ONCE==='1';
if([proveFullSourceReplay,proveSourcePracticeExpiry,proveRealQ,
 proveRealSweep,proveRealCharger].filter(Boolean).length>1)
 throw Error('B441_ONE_SHOT_TEST_MODES_MUTUALLY_EXCLUSIVE');
const query='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay'+
 (b441Experiment?'&t21W10B112=humanGround&t21W10B192=humanCombat':
  '&t21W10B193=allyCoop')+'&t21W10B203=fullRound'+
 (b441Experiment?'&t21W10B441=sourceFrontline':'')+
 (b448Experiment?'&t21W10B448=realA3Front':'');
const nativeFrontObservationTicks=b441Experiment?
 Number(process.env.T21_B441_NATIVE_OBSERVE_TICKS??240):240;
if(!Number.isSafeInteger(nativeFrontObservationTicks)||
 nativeFrontObservationTicks<240||nativeFrontObservationTicks>900)
 throw Error('B442_UNSAFE_NATIVE_OBSERVATION_WINDOW');
if(b490LocalCompare){
 const localOut=process.env.T21_B440_OUT;
 if(process.env.GITHUB_ACTIONS==='true'||process.env.CI==='true'||
    !p1RampOnce||b441Experiment||k3IntegratedSource180)
  throw Error('B490_LOCAL_ONLY_ONE_REAL_RAMP_REQUIRED');
 if(!existsSync(new URL('../public/t21-f3g-source/f3l-original-textured.json',
   import.meta.url)))
  throw Error('B490_VERIFIED_F3L_LOCAL_PACK_MISSING');
 if(!localOut||!isAbsolute(localOut)||
    resolve(localOut).startsWith(resolve('.')+sep))
  throw Error('B490_EVIDENCE_OUTPUT_MUST_BE_OUTSIDE_REPO');
}
const out=process.env.T21_B440_OUT||'/tmp/t21-b440-short-native-foot';
const children=[],pending=new Map();
let ws=null,seq=0;
let b490OwnedChromeProfile=null;
const fail=(reason)=>{throw Error('B440_SHORT_REAL_NATIVE_HOLD_'+reason)};
const proof={schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',testKind:'SHORT_FRESH_SOURCE_ONLY',
  genuineReplayClickCertified:false,full180sCertified:false,
  realSourceRouteCertified:false,formal4v4Certified:false,
  b441ResearchOnly:b441Experiment,b448A3ResearchOnly:b448Experiment,
  b441NativeEvidence:null,
  officialWinner:'NONE',syntheticInput:false,actorWrites:0,
  scoreWrites:0,nativeClockWrites:0,sourceGeometryWrites:0,
  stage:'NOT_STARTED',before:null,after:null,verdict:'HOLD'};
const save=()=>{mkdirSync(out,{recursive:true});writeFileSync(
 resolve(out,'b440-short-real-original-human-foot.json'),JSON.stringify(proof,null,2)+'\n');};
const until=async(fn,ms=30000,interval=250)=>{
 const deadline=Date.now()+ms;let last='';
 while(Date.now()<deadline){
  try{const v=await fn();if(v)return v;}
  catch(e){last=String(e);if(!last.includes('B440_RETRYABLE'))throw e;}
  await delay(interval);
 }
 fail('TIMEOUT_'+last.slice(0,110));
};
async function cdp(method,params={}){
 const id=++seq;
 return await new Promise((resolve_,reject)=>{
  const guard=setTimeout(()=>{pending.delete(id);reject(Error('B440_CDP_TIMEOUT_'+method));},26000);
  pending.set(id,{ok:r=>{clearTimeout(guard);resolve_(r);},
   bad:e=>{clearTimeout(guard);reject(e);}});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(
  r.exceptionDetails.exception?.description??r.exceptionDetails.text).slice(0,300));
 return r.result?.value;
}
const snap=()=>evaluate('window.__t21F3.snapshot()');
// Read-only actual page evidence if a real SOURCE navigation fails
// the existing 120s READY gate. No gameplay, stage, clock or actor writes.
async function waitForRealSourceReady(entry,requireWebgl2=true){
 try{
  await until(()=>evaluate(`(() => {
   const c=document.querySelector('#app-canvas');
   return c?.dataset.t21F3Ready==='READY'&&
    (!${requireWebgl2}||c.dataset.t21F3Renderer==='webgl2');
  })()`),120000);
 }catch(error){
  let page;
  try{
   page=await evaluate(`(() => {
    const c=document.querySelector('#app-canvas');
    // Main entrypoint renders a thrown boot exception in #boot-error.
    // Preserve it on the EXISTING READY HOLD, without a new browser run.
    const bootError=document.querySelector('#boot-error');
    let native=null;
    try{
     const s=window.__t21F3?.snapshot?.();
     if(s)native={tick:s.tick,matchState:s.matchState,
      paused:s.paused,stopReason:s.stopReason,
      physicalRejoins:s.cpu?.physicalRejoins?.length??null};
    }catch(e){native={snapshotReadError:String(e).slice(0,180)}}
    return {path:location.pathname,query:location.search,
     documentState:document.readyState,
     documentHidden:document.hidden,focused:document.hasFocus(),
     canvasExists:!!c,nativeReady:c?.dataset.t21F3Ready??null,
     nativeRenderer:c?.dataset.t21F3Renderer??null,
     gameApiExists:!!window.__t21F3,native,
     bootError:bootError?.textContent?.slice(0,2400)??null};
   })()`);
  }catch(readError){page={pageReadError:String(readError).slice(0,240)}}
  proof.realSourceReadyFailure={entry,reason:String(error).slice(0,300),
   page,b441BrowserErrors:proof.b441BrowserErrors??[],
   source:'25/17/26/0',nativeWrites:0,
   stagePromotions:0,officialScoreWrites:0,verdict:'READY_NOT_CERTIFIED'};
  save();
  console.error('B440_REAL_SOURCE_READY_HOLD',
   JSON.stringify(proof.realSourceReadyFailure));
  throw error;
 }
}
function authority(n){
 if(n?.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
  n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
  n.productionAuthorized!==false||n.unrestricted4v4Certified!==false||
  n.cpu.physicalFootRelocations!==0||n.cpu.cpu.length!==7||n.stopReason)
  fail('SOURCE_OR_NATIVE_ACTORS_AUTHORITY');
}
function foot(n){
 const g=n?.b129OriginalRaisedEdgeGuidance;
 return {sourceOnly:g?.originalSourceOnly===true,
  sourceSchema:g?.schema??null,physicalKccGrounded:g?.kccGroundedObserved===true,
  originalSolid:g?.authenticNamedOriginalSupport??null,
  clearance:g?.originalRaisedFloorEdgeMeters??null};
}
function trueOriginalFoot(f){
 return f.sourceOnly===true&&
  f.sourceSchema==='W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1'&&
  f.physicalKccGrounded===true&&
  typeof f.originalSolid==='string'&&
  f.originalSolid.startsWith('UndertowT21D:')&&
  Number.isFinite(f.clearance)&&f.clearance>=.65;
}
const origin=()=>evaluate('performance.timeOrigin');
const locked=()=>evaluate('document.pointerLockElement===document.querySelector("#app-canvas")');
async function buttonClick(selector){
 await cdp('Page.bringToFront');
 const location=await evaluate(`(() => {
  const b=document.querySelector(${JSON.stringify(selector)});
  if(!b||b.hidden||b.disabled||getComputedStyle(b).display==='none')return null;
  const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
  const hit=document.elementFromPoint(x,y);
  return {x,y,receives:hit===b||b.contains(hit)};
 })()`);
 if(!location||!location.receives||location.x<0||location.x>1600||
  location.y<0||location.y>900)fail('UNCLICKABLE_REAL_BUTTON_'+selector);
 await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:location.x,y:location.y});
 await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:location.x,y:location.y,button:'left',clickCount:1});
 await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:location.x,y:location.y,button:'left',clickCount:1});
}
async function keyW(){
 const v={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
 const initial=await snap();authority(initial);
 let pressed=false;
 try{
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',...v});pressed=true;
  const after=await until(async()=>{
   await delay(35);
   const n=await snap();authority(n);
   if(n.paused||n.matchState!=='PLAYING')fail('INTERRUPTED_REAL_NATIVE_INPUT');
   return n.tick>=initial.tick+6?n:false;
  },10000,20);
  return after;
 }finally{
  if(pressed)await cdp('Input.dispatchKeyEvent',{type:'keyUp',...v});
 }
}
/** Actual CDP keyboard input and live F3 camera snapshot — never actor/tick writes. */
async function tapSourceCameraKey(key,code,keyCode){
 const v={key,code,windowsVirtualKeyCode:keyCode,nativeVirtualKeyCode:keyCode};
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',...v});
 await cdp('Input.dispatchKeyEvent',{type:'keyUp',...v});
}
async function checkRealSourceCameraControls(){
 const before=await snap();authority(before);
 if(!await locked()||before.matchState!=='PLAYING'||before.paused||
    before.cameraSourcePractice?.sourcePracticeOnly!==true||
    before.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1||
    before.cameraSourcePractice?.sourceAimInvertVertical!==false)
  fail('CAMERA_NOT_ACTUAL_SOURCE_PLAYER_BASELINE');
 const sameWorld=await origin();
 const sameActorIds=before.cpu.cpu.map(x=>x.id).join(',');
 await tapSourceCameraKey(']','BracketRight',221);
 const speed=await snap();authority(speed);
 if(speed.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1.25||
    speed.cameraSourcePractice?.sourceAimInvertVertical!==false)
  fail('CAMERA_REAL_BRACKET_KEY_NOT_APPLIED');
 await tapSourceCameraKey('i','KeyI',73);
 const inverted=await snap();authority(inverted);
 const realToast=await evaluate(`(() => {
   const x=document.querySelector('#t21-f3-source-camera-controls');
   return x?{visible:!x.hidden,content:x.textContent,
    sourceOnly:x.dataset.sourceOnly,gameplayWrites:x.dataset.gameplayWrites,
    productionAuthorized:x.dataset.productionAuthorized}:null;
 })()`);
 if(inverted.cameraSourcePractice?.sourceAimInvertVertical!==true||
    inverted.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1.25||
    realToast?.visible!==true||realToast?.sourceOnly!=='true'||
    realToast.gameplayWrites!=='0'||realToast.productionAuthorized!=='false'||
    !realToast.content.includes('VERTICAL LOOK · INVERTED'))
  fail('CAMERA_REAL_INVERSION_OR_PLAYER_FEEDBACK');
 const picture=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof picture?.data!=='string'||picture.data.length<100)
  fail('CAMERA_REAL_CHROMIUM_SCREENSHOT_MISSING');
 writeFileSync(resolve(out,'source-camera-inverted-real-chromium.png'),
  Buffer.from(picture.data,'base64'));
 await tapSourceCameraKey('\\','Backslash',220);
 const reset=await snap();authority(reset);
 const resetToast=await evaluate(`document.querySelector(
   '#t21-f3-source-camera-controls')?.textContent??null`);
 if(reset.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1||
    reset.cameraSourcePractice?.sourceAimInvertVertical!==false||
    resetToast!=='CAMERA RESET · 1.00x · NORMAL Y'||
    await origin()!==sameWorld||!await locked()||
    reset.cpu.cpu.map(x=>x.id).join(',')!==sameActorIds||
    reset.sourceScoreablePromotions!==0||
    reset.productionAuthorized!==false)
  fail('CAMERA_RESET_OR_ORIGINAL_SOURCE_AUTHORITY');
 proof.realPlayerCameraControls={
  status:'PASS_REAL_CDP_PLAYER_CAMERA_CONTROL_WITH_SCREENSHOT_NOT_ART_PASS',
  originalSameNativeWorld:true,actualKeyboard:true,
  rightBracketSensitivity:speed.cameraSourcePractice.sourceAimSensitivityMultiplier,
  invertYConfirmed:inverted.cameraSourcePractice.sourceAimInvertVertical,
  resetSensitivity:reset.cameraSourcePractice.sourceAimSensitivityMultiplier,
  resetInverted:reset.cameraSourcePractice.sourceAimInvertVertical,
  realToast,realChromiumScreenshot:'source-camera-inverted-real-chromium.png',
  originalGeometryOrActorWrites:0,officialWinner:'NONE',
  productionAuthorized:false,artApproved:false};
 save();
}

/** B58 separate one-shot: use only genuine CDP mouse/keyboard inputs, and
 * post-PaintCoordinator human projectile counters. Never mutate app state.
 * Prior B139/B413 exact real-world route is a precedent, NOT evidence that
 * this new canonical 60s SOURCE_SWEEP world reached any stage. */
async function b58AttemptActualThreeSurfaceClear({world,start,firstAim}){
 const surface=[
  'UndertowT21D:spawn-high-positive-z:paint',
  'UndertowT21D:first-drop-landing-positive-z:paint',
  'UndertowT21D:right-low-route-ramp-positive-z:paint'
 ];
 const attempt={schema:'T21_B58_TRUE_CANONICAL_SOURCE_SWEEP_PHYSICAL_ROUTE',
  source:'25/17/26/0',phase:'REAL_UPPER_ORIGINAL_KCC',
  evidence:[],verdict:'HOLD',firstPaintCells:firstAim,
  originalSourceWrites:0,actorWrites:0,inkWrites:0,clockWrites:0,
  scoreWrites:0,syntheticKeyboard:false,officialWinner:'NONE',
  threeSurfaceClearCertified:false};
 const persist=()=>writeFileSync(
  resolve(out,'b58-real-full-source-sweep-route.json'),
  JSON.stringify(attempt,null,2)+'\n');
 const guard=async(n)=>{
  authority(n);
  if(await origin()!==world||n.matchState!=='PLAYING'||n.paused||
     !await locked()||n.cpu.physicalRejoins.length!==7||
     n.sourceScoreablePromotions!==0||n.player.hp<=0||
     n.b25SourcePaintRun?.practiceVariant!=='SOURCE_SWEEP'||
     !['RUNNING','CLEAR'].includes(n.b25SourcePaintRun?.status))
   fail('SWEEP_PHYSICAL_NATIVE_WORLD_OR_MISSION_INTERRUPTED');
  return n;
 };
 const add=(phase,n,extra={})=>{
  const run=n.b25SourcePaintRun;
  attempt.phase=phase;
  attempt.evidence.push({phase,nativeTick:n.tick,player:n.player.position,
   realGroundMeters:run.realGroundedTravelMeters,
   realPracticeElapsed:run.elapsedTicks,status:run.status,
   humanNewSourceCells:run.humanChangedImpactCells,
   surfaces:run.sweptOriginalSurfaceCellProgress,
   qualified:run.qualifiedOriginalSweepSurfaces,...extra});
  persist();
 };
 const wrap=x=>((x+540)%360)-180;
 const aim=async(yaw,pitch)=>{
  // Real source CAMERA mouse device events. Physics/camera properties are
  // only READ; no JS camera setter, no synthetic collision or actor step.
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450});
  const before=(await guard(await snap())).cameraSourcePractice;
  if(!Number.isFinite(before?.yawDegrees)||
     !Number.isFinite(before?.pitchDegrees))fail('SWEEP_CAMERA_NATIVE_AIM_MISSING');
  const dx=Math.round(wrap(yaw-before.yawDegrees)/.22);
  const dy=Math.round(-(pitch-before.pitchDegrees)/.18);
  if(Math.abs(dx)>720||Math.abs(dy)>440||
     800+dx<10||800+dx>1590||450+dy<10||450+dy>890||
     pitch< -55||pitch>28)fail('SWEEP_UNSAFE_REAL_CDP_CAMERA_PLAN');
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',
   x:800+dx,y:450+dy});
  const after=(await guard(await snap())).cameraSourcePractice;
  if(Math.abs(wrap(after.yawDegrees-yaw))>3||
     Math.abs(after.pitchDegrees-pitch)>3)
   fail('SWEEP_MOUSE_AIM_DID_NOT_REACH_TRUE_SOURCE_TARGET');
  return {yaw:after.yawDegrees,pitch:after.pitchDegrees};
 };
 const keyData={KeyW:['w',87],KeyS:['s',83],KeyA:['a',65],KeyD:['d',68]};
 const keyHold=async(key,ticks)=>{
  const before=await guard(await snap());
  if(!Number.isSafeInteger(ticks)||ticks<1||ticks>220||
     (key!==null&&!Object.hasOwn(keyData,key)))
   fail('SWEEP_UNSAFE_HUMAN_REAL_KEY_STAGE');
  let pressed=false;
  try{
   if(key){
    const [value,vk]=keyData[key];
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:value,code:key,
     windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
    pressed=true;
   }
   return await until(async()=>{
    const n=await guard(await snap());
    if(n.b25SourcePaintRun.status==='CLEAR'||
       n.tick>=before.tick+ticks)return n;
    return null;
   },180000,120);
  }finally{
   if(pressed){
    const [value,vk]=keyData[key];
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:value,code:key,
     windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
   }
  }
 };
 const burst=async(ticks)=>{
  const before=await guard(await snap());
  let pressed=false;
  try{
   await cdp('Input.dispatchMouseEvent',{type:'mousePressed',
    x:800,y:450,button:'left',buttons:1,clickCount:1});
   pressed=true;
   return await until(async()=>{
    const n=await guard(await snap());
    return n.b25SourcePaintRun.status==='CLEAR'||
     n.tick>=before.tick+ticks?n:null;
   },120000,150);
  }finally{
   if(pressed)await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',
    x:800,y:450,button:'left',buttons:0,clickCount:1});
  }
 };
 // Reuse the previously PASSed native B163 W/S orbit on the upper original
 // ledge. Six full pairs accumulate >=12m on Rapier source geometry.
 for(let i=0;i<12;i++){
  const n=await keyHold(i%2===0?'KeyW':'KeyS',34);
  if(!trueOriginalFoot(foot(n)))
   fail('SWEEP_REAL_ORIGINAL_UPPER_FOOT_LOST');
  add('REAL_UPPER_W_S_'+(i+1),n,{trueOriginalFoot:foot(n)});
  if(n.b25SourcePaintRun.realGroundedTravelMeters>=12&&i%2===1)break;
 }
 const afterUpper=await guard(await snap());
 if(afterUpper.b25SourcePaintRun.realGroundedTravelMeters<12)
  fail('SWEEP_REAL_UPPER_KCC_UNDER_12M');
 // Original B139 native crossing; restore the original physical heading
 // only through real CDP mouse. 200 genuine W ticks includes the first drop.
 await aim(start.cameraSourcePractice.yawDegrees,
  start.cameraSourcePractice.pitchDegrees);
 for(const [name,key,ticks] of [
  ['ORIGINAL_FIRST_DROP','KeyW',200],
  ['ORIGINAL_LOWER_INSET_D','KeyD',12],
  ['ORIGINAL_LOWER_FORWARD','KeyW',18],
  ['ORIGINAL_LOWER_INWARD','KeyA',12],
  ['ORIGINAL_LOWER_COAST',null,60]
 ]){
  const n=await keyHold(key,ticks);
  add('REAL_'+name,n,{originalFoot:foot(n)});
  if(n.b25SourcePaintRun.status==='CLEAR')break;
 }
 const lower=await guard(await snap());
 const pos=lower.player.position,sourceFoot=foot(lower);
 if(!Array.isArray(pos)||pos.length!==3||
    pos[1]<3.5||pos[1]>4.7||
    pos[0]<-1.2||pos[0]>4.8||
    pos[2]<46.8||pos[2]>52.5||
    !sourceFoot.physicalKccGrounded||
    sourceFoot.originalSolid!=='UndertowT21D:first-drop-landing-positive-z')
  fail('SWEEP_REAL_LOWER_AUTHENTIC_SOURCE_FOOT_NOT_REACHED');
 // Compare real post-raster human changes BY exact original surface; old
 // owner-grid samples are not trusted as fresh projectiles in this world.
 const targetPlan=[
  {id:surface[1],aims:[[-14.61,-51.13],[-17,-49],[-12,-50]]},
  {id:surface[2],aims:[[105.05,-18.89],[99,-22],[111,-18],[105,-25],[95,-16]]}
 ];
 for(const target of targetPlan){
  for(const [yaw,pitch] of target.aims){
   const already=(await guard(await snap())).b25SourcePaintRun
    .sweptOriginalSurfaceCellProgress.find(x=>x.surfaceId===target.id)
    ?.changedCells??0;
   if(already>=60)break;
   const actualAim=await aim(yaw,pitch);
   const n=await burst(38);
   const cells=n.b25SourcePaintRun.sweptOriginalSurfaceCellProgress
    .find(x=>x.surfaceId===target.id)?.changedCells??0;
   add('REAL_SOURCE_SHOOT_'+target.id,n,{actualAim,
    requestedNativeHumanInputTicks:38,realOriginalTargetCells:cells,
    targetId:target.id});
   if(n.b25SourcePaintRun.status==='CLEAR')break;
  }
 }
 const final=await guard(await snap());
 add('REAL_FINAL_SOURCE_SWEEP',final);
 const run=final.b25SourcePaintRun;
 attempt.final={tick:final.tick,practice:run,sourceOnly:true,
  genuineSevenCpu:final.cpu.physicalRejoins.length===7,
  originalHumanImpactLedger:
   final.b23HumanInkFeedback.originalImpactChangedCellsBySurface};
 attempt.threeSurfaceClearCertified=run.status==='CLEAR'&&
  run.qualifiedOriginalSweepSurfaces>=3&&run.realGroundedTravelMeters>=12&&
  surface.every(id=>run.sweptOriginalSurfaceCellProgress.some(
   x=>x.surfaceId===id&&x.changedCells>=60));
 attempt.verdict=attempt.threeSurfaceClearCertified?
  'PASS_REAL_CDP_THREE_DIFFERENT_ORIGINAL_SURFACES_AND_12M':
  'HOLD_REAL_SOURCE_SWEEP_QUOTAS_OR_ROUTE_NOT_CLEARED';
 persist();
 if(!attempt.threeSurfaceClearCertified)
  fail('SWEEP_TRUE_THREE_SURFACE_60_EACH_AND_12M_NOT_YET_PROVEN');
 return attempt;
}


/** K3: strictly opt-in continuation of the existing P0/P1 genuine SOURCE
 * trial. A real user world, no synthetic native tick, actor or paint. */
async function runK3CanonicalOneWorld(actualHref,{inkLoopOnly=false}={}){
 const start=await snap();authority(start);
 const born=await origin(),ids=['A1','A2','A3','B1','B2','B3','B4'];
 const ramp='UndertowT21D:right-low-route-ramp-positive-z';
 const k={schema:inkLoopOnly?'P1_REGISTERED_SOURCE_REAL_INK_LOOP':
  'K3_ONE_GENUINE_CANONICAL_SOURCE_WORLD',
  verdict:'HOLD',source:'25/17/26/0',origin:born,url:actualHref,
  firstNativeTick:start.tick,firstRemaining:start.timeRemainingSeconds,
  humanActions:[],samples:[],cpuImpactDeltas:null,
  actorTeleports:0,syntheticTicks:0,syntheticInk:0,
  scoreablePromotions:0,officialWinner:'NONE',formal4v4:false};
 if(inkLoopOnly)proof.p1RegisteredRampInkLoop=k;
 else proof.k3SingleSourceWorld=k;
 const persist=()=>{proof.stage=(inkLoopOnly?'P1_INK_LOOP_':'K3_')+k.verdict;save();};
 const rampHumanCells=n=>n.b23HumanInkFeedback?.originalImpactChangedCellsBySurface
  ?.find(row=>row.surfaceId===ramp+':paint')?.changedCells??0;
 const firstHumanRampCells=rampHumanCells(start);
 const picture=async(tag)=>{
  if(!inkLoopOnly)return;
  const shot=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  const bytes=Buffer.from(shot?.data??'','base64');
  if(bytes.length<10000||
     bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||
     bytes.readUInt32BE(16)!==1600||bytes.readUInt32BE(20)!==900)
   fail('P1_INK_LOOP_REAL_FRAMEBUFFER_MISSING');
  const file='p1-real-ink-loop-'+tag+'.png';
  writeFileSync(resolve(out,file),bytes);
  k.screenshots??=[];
  k.screenshots.push({file,bytes:bytes.length,
   sha256:createHash('sha256').update(bytes).digest('hex')});persist();
 };
 const readCpu=n=>Object.fromEntries(ids.map(id=>{
  const a=n.b154NativeSevenCpuInk?.byActor?.[id];
  const shots=n.cpuSourceTurfShotsByActor?.[id];
  if(!a||![shots,a.impactEvents,a.impactChangedCells].every(v=>
    Number.isSafeInteger(v)&&v>=0))
   fail('K3_ORIGINAL_CPU_REAL_PAINT_MISSING_'+id);
  return [id,{shots,impacts:a.impactEvents,impactCells:a.impactChangedCells}];
 }));
 /** The native CPU roster persists across genuine SPLATTED/respawn.
  * physicalRejoins counts currently ACTIVE actors, and can temporarily
  * fall below seven without a CPU disappearing. Preserve a genuine 7-actor
  * roster + fully unlocked SOURCE combat; never revive or move actors. */
 const validate=async(n,phase='PLAYING')=>{
  authority(n);
  if(inkLoopOnly){
   const f=n.sourceNativeFloorInkWitness;
   if(n.tick>start.tick+1200||n.tick<start.tick||
      n.sourceNativeHumanInputProjection?.nativeTick!==n.tick||
      f?.sourceOnlyEnabled!==true||f.originalAuthority!=='25/17/26/0'||
      f.actualKccGrounded!==true||f.actualRapierSolidId!==ramp||
      !Number.isFinite(f.actualRapierFootGapMeters)||
      Math.abs(f.actualRapierFootGapMeters)>.12||
      f.floorRuleApplicable!==true||f.inkRelation!==n.player.inkRelation||
      (['OWN','ENEMY'].includes(f.inkRelation)&&
       (f.floorContactVerified!==true||f.sampledBackingSolidId!==ramp)))
    fail('P1_INK_LOOP_NATIVE_TICK_OR_REGISTERED_FLOOR_CONTACT');
  }
  if(await origin()!==born||await evaluate('location.href')!==actualHref||
     n.matchState!==phase||n.cpu.cpu.length!==7||
     n.cpu.freeCombatEnabled!==true||
     n.cpu.physicalFootRelocations!==0||
     (phase==='PLAYING'&&(n.paused||!await locked()))||
     n.b25SourcePaintRun?.officialWinner!=='NONE')
   fail('K3_NATIVE_SOURCE_SAME_WORLD_HOLD_'+phase);
  return n;
 };
 const sample=(tag,n)=>{
  k.samples.push({tag,tick:n.tick,phase:n.matchState,
   remaining:n.timeRemainingSeconds,
   foot:n.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
   grounded:n.nativeKccGrounded,rosterCount:n.cpu.cpu.length,
   nativeFreeCombat:n.cpu.freeCombatEnabled,
   currentActiveRejoins:n.cpu.physicalRejoins.length,
   shots:n.shotsFired,ink:n.player.ink,
   playerImpactCells:n.b23HumanInkFeedback?.humanChangedCells,
   lastRealPlayerPaintSurface:n.b23HumanInkFeedback?.lastPaintedSurface??null,
   relation:n.player.inkRelation,recovery:n.playerInkRecoveryState,
   ...(inkLoopOnly?{floorInk:n.sourceNativeFloorInkWitness,
    humanRampImpactCells:rampHumanCells(n)}:{}),
   actualCpu:readCpu(n)});
  persist();
 };
 if(proof.p1RampNativeProgress?.status!==
     'PASS_REAL_KCC_LANDING_TO_EXISTING_REGISTERED_SOURCE_RAMP'||
    start.matchState!=='PLAYING'||start.paused||!await locked()||
    start.b112OriginalHumanGround?.genuineKccGrounded!==true||
    start.b112OriginalHumanGround?.lastOriginalSourceHitId!==ramp||
    start.b361NativePlayerWeapon?.id!=='needle-smg'||
    start.b38HumanSub?.enabled!==true||
    start.timeRemainingSeconds<125)
  fail('K3_GENUINE_P1_RAMP_NATIVE_USER_MODE_PRECONDITION');
 const firstCpu=readCpu(start);
 k.verdict='PHYSICAL_RAMP_SAME_WORLD_READY';sample('P1_RAMP',start);
 await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450,button:'none'});
 await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:660,button:'none'});
 const aimed=await validate(await snap());
 if(!Number.isFinite(aimed.cameraSourcePractice?.pitchDegrees))
  fail('K3_CAMERA_REAL_POINTER_AIM_UNAVAILABLE');
 let shotScreenY=660;
 const shoot=async(tag,requireFreshOwnerCells=true)=>{
  const before=await validate(await snap());
  if(before.player.mode!=='HUMAN'||before.player.ink<6)
   fail('K3_HUMAN_SHOT_REAL_INK_NOT_AVAILABLE_'+tag);
  const minPaidInk=inkLoopOnly&&
   tag==='REAL_OWNER_INK_SPEND_BEFORE_SQUID_REFILL'?15:1;
  let held=false,accepted=null;
  try{
   await cdp('Input.dispatchMouseEvent',{type:'mousePressed',
    x:800,y:shotScreenY,button:'left',buttons:1,clickCount:1});
   held=true;
   accepted=await until(async()=>{
    const n=await validate(await snap());
    if(n.tick>=before.tick+150)
     fail('K3_REAL_SHOT_AND_PAINT_WINDOW_EXPIRED_'+tag);
    // Initial shots must paint NEW genuine cells. After an authentic
    // SQUID_OWN refill, the same already-blue source ramp can accept
    // paid native bullets without changing any ownership cells.
    // Never invent a second paint impact; prove real shots + paid ink.
    const paidNativeShots=n.shotsFired>=before.shotsFired+3&&
     before.player.ink-n.player.ink>=minPaidInk;
    const paintedNewRealCells=
     n.b23HumanInkFeedback?.humanChangedCells>
      before.b23HumanInkFeedback?.humanChangedCells;
    return paidNativeShots&&
     (!requireFreshOwnerCells||paintedNewRealCells)?n:false;
   },80000,160);
  }finally{
   if(held)await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',
    x:800,y:shotScreenY,button:'left',buttons:0,clickCount:1});
  }
  const after=await validate(await snap());
  k.humanActions.push({tag,from:before.tick,to:after.tick,
   realPlayerShotsVerified:after.shotsFired-before.shotsFired>=3,
   actualShots:after.shotsFired-before.shotsFired,
   paidInk:before.player.ink-accepted.player.ink,
   newPaintCellProofRequired:requireFreshOwnerCells,
   realPaintImpactCells:after.b23HumanInkFeedback.humanChangedCells-
    before.b23HumanInkFeedback.humanChangedCells,
   realOriginalPaintImpactEvents:after.b23HumanInkFeedback?.humanOriginalImpactPaintEvents-
    before.b23HumanInkFeedback?.humanOriginalImpactPaintEvents});
  sample(tag,after);
 };
 await shoot('FIRST_REAL_HUMAN_PAINT_SHOTS');
 await picture('after-first-shot');
 const firstPaint=await validate(await snap());
 // Genuine trials: #42530565403 Shift on stationary NEUTRAL failed;
 // #42536808564 real W moved 1.5m over original ramp but stayed NEUTRAL.
 // Never lengthen that blind walk. Select real ownerGrid Team.A cells
 // supported by original Rapier HUMAN foot instead of a visual guess.
 const readOwn=async()=>{
  const g=await evaluate('window.__t21F3.auditK3NativeOwnRampCells()');
  if(g?.schema!=='K3_READ_ONLY_REAL_PAINT_SURFACE_OWN_GRID'||
     g.rampId!==ramp||g.original!=='25/17/26/0'||
     g.gameplayWrites!==0||g.actorMoves!==0||
     g.paintedCellsInjected!==0||g.scoreablePromotions!==0||
     !Array.isArray(g.verifiedOwnedTargets))
   fail('K3_REAL_NATIVE_OWN_GRID_AUTHORITY_FAIL');
  return g;
 };
 k.nativeOwnGridObservations=[];
 let ownMap=await readOwn();
 k.nativeOwnGridObservations.push(ownMap);
 // First genuine native ownerGrid witness, never a synthetic ink grant.
 k.firstRealNativeOwnerScan={
  tick:ownMap.tick,
  lastActualHumanPaintSurface:
   firstPaint.b23HumanInkFeedback?.lastPaintedSurface??null,
  realOriginalRampOwnedCells:ownMap.actualOwnedCells,
  genuineSupportedOwnedTargets:ownMap.verifiedOwnedTargets.length,
  actualFootOwner:ownMap.actualFootOwner,
  actualFootInkRelation:ownMap.actualNativeInkRelation,
  originalSource:'25/17/26/0'};
 persist();
 // If actual native projectile hits did not leave reachable OWN on the
 // registered ramp, use at most two different *real human mouse aims*.
 // Actual CPU ink grids, collision, actor position and time are not edited.
 for(const y of [755,840]){
  const now=await validate(await snap());
  if(now.player.inkRelation==='OWN'||ownMap.verifiedOwnedTargets.length)break;
  shotScreenY=y;
  await cdp('Input.dispatchMouseEvent',{
   type:'mouseMoved',x:800,y:shotScreenY,button:'none'});
  await shoot('REAL_NATIVE_RAMP_AIM_PAINT_'+y);
  ownMap=await readOwn();
  k.nativeOwnGridObservations.push(ownMap);persist();
 }
 const begin=await validate(await snap());
 if(begin.player.inkRelation!=='OWN'&&!ownMap.verifiedOwnedTargets.length)
  fail('K3_NO_ACTUAL_REACHABLE_OWN_PAINT_ON_REGISTERED_RAMP');
 const beforeOwnerWalk=begin;
 const walk={tag:'REAL_WASD_TO_GENUINE_OWNER_CELL',from:begin.tick,
  before:begin.player.position,realKeyInputs:[],samples:[],
  actorWrites:0,syntheticPaint:0,syntheticTicks:0};
 k.ownerWalkProgress=walk;persist();
 const keys={
  KeyW:{key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87},
  KeyS:{key:'s',code:'KeyS',windowsVirtualKeyCode:83,nativeVirtualKeyCode:83},
  KeyA:{key:'a',code:'KeyA',windowsVirtualKeyCode:65,nativeVirtualKeyCode:65},
  KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68}
 };
 let walkedTicks=0,contact=null;
 for(let step=0;step<12;step++){
  const n=await validate(await snap());
  if(n.player.inkRelation==='OWN'){contact=n;break;}
  const grid=await readOwn();
  k.nativeOwnGridObservations.push(grid);persist();
  const aim=grid.verifiedOwnedTargets[0];
  if(!aim||!Array.isArray(aim.world)||aim.world.length!==3||
     !aim.world.every(Number.isFinite)||
     !Number.isFinite(n.cameraSourcePractice?.yawDegrees)||
     Math.abs(n.cameraSourcePractice.yawDegrees)>5)
   fail('K3_ACTUAL_OWN_RAMP_CELL_OR_NATIVE_YAW_NOT_VERIFIED');
  const dx=aim.world[0]-n.player.position[0];
  const dz=aim.world[2]-n.player.position[2];
  const xDominant=Math.abs(dx)>Math.abs(dz);
  const key=xDominant?(dx>=0?'KeyD':'KeyA'):(dz<=0?'KeyW':'KeyS');
  const distance=xDominant?Math.abs(dx):Math.abs(dz);
  const wantedTicks=Math.min(13,Math.max(4,Math.ceil(distance*12)));
  if(walkedTicks+wantedTicks>80)
   fail('K3_REAL_NATIVE_OWNER_WASD_TICK_BUDGET_EXCEEDED');
  const startTick=n.tick,input=keys[key];
  let pressed=false;
  const record={key,from:startTick,start:n.player.position,
   targetRealOwnedInkWorld:aim.world,targetGrid:aim.grid,
   intendedTicks:wantedTicks};
  walk.realKeyInputs.push(record);persist();
  try{
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',...input});
   pressed=true;
   await until(async()=>{
    const t=await validate(await snap());
    const g=t.b112OriginalHumanGround;
    if(t.player.mode!=='HUMAN'||t.player.hp<=0||
       !t.nativeKccGrounded||g?.genuineKccGrounded!==true||
       g.lastOriginalSourceHitId!==ramp)
     fail('K3_NATIVE_OWNER_MOVE_LOST_ORIGINAL_RAPIER_RAMP_FOOT');
    const elapsed=t.tick-startTick;
    if(walk.samples.length===0||
       t.tick-walk.samples[walk.samples.length-1].tick>=3){
     walk.samples.push({tick:t.tick,
      body:t.player.position,relation:t.player.inkRelation,
      key,actualAxes:t.sourceNativeHumanInputProjection?.nativeInputAxes??null,
      genuineSupport:g.lastOriginalSourceHitId});
     if(walk.samples.length>24)walk.samples.shift();
     persist();
    }
    if(Math.hypot(t.player.position[0]-begin.player.position[0],
       t.player.position[2]-begin.player.position[2])>2.9)
     fail('K3_OWNER_REAL_RAMP_MAX_PHYSICAL_DISPLACEMENT_EXCEEDED');
    return t.player.inkRelation==='OWN'||elapsed>=wantedTicks?t:false;
   },24000,80);
  }finally{
   if(pressed)await cdp('Input.dispatchKeyEvent',{type:'keyUp',...input});
  }
  const after=await validate(await snap());
  record.to=after.tick;record.actualTicks=after.tick-startTick;
  record.after=after.player.position;record.relation=after.player.inkRelation;
  walkedTicks+=record.actualTicks;persist();
  if(after.player.inkRelation==='OWN'){contact=after;break;}
 }
 if(!contact)fail('K3_REAL_WASD_CANNOT_CONTACT_SOURCE_OWN_CELL_WITHIN_SAFE_BOUNDS');
 contact=await validate(await snap());
 if(contact.player.inkRelation!=='OWN'||!contact.nativeKccGrounded||
    contact.b112OriginalHumanGround?.genuineKccGrounded!==true||
    contact.b112OriginalHumanGround?.lastOriginalSourceHitId!==ramp||
    Math.hypot(contact.player.position[0]-begin.player.position[0],
     contact.player.position[2]-begin.player.position[2])>2.9)
  fail('K3_NATIVE_OWN_INK_CONTACT_NOT_STABLE_AFTER_TRUE_KEY_RELEASE');
 walk.to=contact.tick;walk.after=contact.player.position;
 walk.actualOwnRelation=contact.player.inkRelation;
 walk.actualHeldKeyTicks=walkedTicks;k.humanActions.push(walk);
 k.verdict='REAL_NATIVE_OWNER_CONTACT_ON_REGISTERED_RAMP';
 sample('REAL_OWNER_RAMP_CONTACT',contact);
 let diveBefore=await validate(await snap());
 const refillHeadroomLimit=inkLoopOnly?85:98;
 if(diveBefore.player.ink>=refillHeadroomLimit){
  await shoot('REAL_OWNER_INK_SPEND_BEFORE_SQUID_REFILL',!inkLoopOnly);
  diveBefore=await validate(await snap());
 }
 if(diveBefore.player.ink>=refillHeadroomLimit||diveBefore.player.inkRelation!=='OWN')
  fail('K3_REAL_OWN_INK_REFILL_HEADROOM_NOT_PROVEN');
 let shifted=false;
 const refillSamples=[];
 try{
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',
   key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16,nativeVirtualKeyCode:16});
  shifted=true;
  const own=await until(async()=>{
   const n=await validate(await snap());
   k.lastRealSquid={tick:n.tick,mode:n.player.mode,
    inkRelation:n.player.inkRelation,resourceState:n.playerInkRecoveryState,
    ink:n.player.ink,position:n.player.position,
    grounded:n.nativeKccGrounded};
   if(n.tick>diveBefore.tick+150)fail('K3_ACTUAL_OWN_REFILL_WINDOW_EXPIRED');
   const recovering=n.player.mode==='SQUID'&&n.player.inkRelation==='OWN'&&
    n.playerInkRecoveryState==='SQUID_OWN'&&
    n.player.ink>diveBefore.player.ink+1;
   if(!inkLoopOnly)return recovering?n:false;
   if(!recovering){
    if(refillSamples.length)fail('P1_INK_LOOP_OWN_RECOVERY_INTERRUPTED');
    return false;
   }
   const last=refillSamples.at(-1);
   if(last&&n.tick===last.tick)return false;
   if(last&&(n.tick<last.tick||n.player.ink<=last.ink))
    fail('P1_INK_LOOP_REAL_RECOVERY_NOT_INCREASING');
   refillSamples.push({tick:n.tick,ink:n.player.ink,mode:n.player.mode,
    recovery:n.playerInkRecoveryState,relation:n.player.inkRelation,
    floorInk:n.sourceNativeFloorInkWitness});
   k.refillSamples=refillSamples;persist();
   return refillSamples.length>=3?n:false;
  },55000,160);
  k.humanActions.push({tag:'GENUINE_SHIFT_SQUID_OWN_REFILL',
   from:diveBefore.tick,to:own.tick,
   fromInk:diveBefore.player.ink,toInk:own.player.ink,
   recovery:own.playerInkRecoveryState});
  sample('SQUID_OWN',own);
  await picture('own-squid-recovery');
 }finally{
  if(shifted)await cdp('Input.dispatchKeyEvent',{type:'keyUp',
   key:'Shift',code:'ShiftLeft',windowsVirtualKeyCode:16,nativeVirtualKeyCode:16});
 }
 await until(async()=>{
  const n=await validate(await snap());return n.player.mode==='HUMAN'?n:false;
 },20000,180);
 await shoot('ACTUAL_POST_OWN_REFILL_RESHOT',false);
 if(inkLoopOnly){
  const end=await validate(await snap());
  const required=['FIRST_REAL_HUMAN_PAINT_SHOTS',
   'GENUINE_SHIFT_SQUID_OWN_REFILL','ACTUAL_POST_OWN_REFILL_RESHOT'];
  if(end.player.mode!=='HUMAN'||refillSamples.length<3||
     rampHumanCells(end)<=firstHumanRampCells||
     required.some(tag=>!k.humanActions.some(a=>a.tag===tag))||
     k.humanActions.filter(a=>a.tag===required[0]||a.tag===required[2])
      .some(a=>a.realPlayerShotsVerified!==true||a.paidInk<1))
   fail('P1_INK_LOOP_SAME_SOURCE_SHOT_RECOVERY_RESHOT_NOT_PROVEN');
  k.humanRampImpactCellDelta=rampHumanCells(end)-firstHumanRampCells;
  k.finalNativeTick=end.tick;
  k.actualNativeElapsedTicks=end.tick-start.tick;
  sample('HUMAN_REAL_RESHOT',end);
  await picture('human-reshoot');
  if(k.screenshots?.length!==3)
   fail('P1_INK_LOOP_REAL_THREE_PHASE_FRAMES_MISSING');
  k.verdict='PASS_LIMITED_REAL_REGISTERED_SOURCE_FIRE_REFILL_RESHOT';
  proof.verdict=k.verdict;
  proof.testKind='P1_SHORT_SAME_WORLD_REGISTERED_SOURCE_INK_LOOP';
  // No sub, TIME_UP, replay or formal match certification in this mode.
  proof.full180sCertified=false;proof.genuineReplayClickCertified=false;
  persist();
  console.log('P1_REAL_REGISTERED_SOURCE_INK_LOOP',JSON.stringify(k));
  return;
 }
 const preSub=await validate(await snap());
 await tapSourceCameraKey('f','KeyF',70);
 const postSub=await until(async()=>{
  const n=await validate(await snap());
  return n.b38HumanSub?.throws>preSub.b38HumanSub?.throws?n:false;
 },30000,180);
 k.humanActions.push({tag:'REAL_F_KEY_SUB',from:preSub.tick,
  to:postSub.tick,throws:postSub.b38HumanSub.throws-preSub.b38HumanSub.throws});
 sample('GENUINE_SUB',postSub);
 for(const threshold of [120,60,0]){
  let last=null;
  const n=await until(async()=>{
   const actual=await snap();
   // During the final countdown, PLAYING is the expected real native
   // state until the genuine 0-second TIME_UP transition. Do not fail
   // merely because we observed an unfinished 180-second world.
   if(threshold===0&&!['PLAYING','TIME_UP'].includes(actual.matchState))
    fail('K3_INVALID_REAL_NATIVE_ENDGAME_PHASE');
   const current=await validate(actual,
    threshold===0?actual.matchState:'PLAYING');
   last={tick:current.tick,phase:current.matchState,
    remaining:current.timeRemainingSeconds,
    cpu:current.cpu.physicalRejoins.length};
   return current.timeRemainingSeconds<=threshold+.001&&
    (threshold!==0||current.matchState==='TIME_UP')?current:false;
  },24*60*1000,1300).catch(e=>{k.lastNative=last;persist();throw e;});
  sample(threshold===0?'TIME_UP':String(threshold),n);
 }
 const end=await validate(await snap(),'TIME_UP');
 const finalCpu=readCpu(end);
 k.actualNativeElapsedTicks=end.tick-start.tick;
 k.cpuImpactDeltas=Object.fromEntries(ids.map(id=>[id,{
  shotRequests:finalCpu[id].shots-firstCpu[id].shots,
  projectileImpacts:finalCpu[id].impacts-firstCpu[id].impacts,
  impactedOwnerCells:finalCpu[id].impactCells-firstCpu[id].impactCells
 }]));
 if(end.timeRemainingSeconds!==0||
    k.actualNativeElapsedTicks<Math.floor(start.timeRemainingSeconds*60)-3||
    !['FIRST_REAL_HUMAN_PAINT_SHOTS',
      'REAL_WASD_TO_GENUINE_OWNER_CELL',
      'GENUINE_SHIFT_SQUID_OWN_REFILL',
      'ACTUAL_POST_OWN_REFILL_RESHOT','REAL_F_KEY_SUB'].every(tag=>
       k.humanActions.some(action=>action.tag===tag))||
    ids.some(id=>Object.values(k.cpuImpactDeltas[id]).some(v=>v<=0)))
  fail('K3_180S_SAME_NATIVE_WORLD_REAL_SEVEN_CPU_IMPACTS_NOT_PROVEN');
 k.verdict='TRUE_NATIVE_180S_TIME_UP';persist();
 const visible=await until(async()=>evaluate(`(() => {
  const m=document.querySelector('#t21-f3-b59-session-finished');
  const b=document.querySelector('#t21-f3-b59-restart');
  if(!m||!b)return false;
  const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const hit=document.elementFromPoint(x,y);
  return !m.hidden&&m.dataset.t21B59State==='FINISHED'&&
   !b.hidden&&!b.disabled&&r.width>0&&r.height>0&&
   (hit===b||b.contains(hit))&&document.pointerLockElement===null&&
   m.dataset.originalScoreable==='0'&&m.dataset.t21B59OriginalWinner==='NONE';
 })()`),45000,200);
 if(!visible)fail('K3_REAL_END_SCREEN_UNAVAILABLE');
 await buttonClick('#t21-f3-b59-restart');
 k.actualUserReplayClicked=true;persist();
 // Wait for a DIFFERENT page time origin and the SAME canonical URL.
 // A stale old-world CDP response must never be accepted as a new match.
 const replay=await until(async()=>{
  try{
   const n=await evaluate(`(() => {
    const s=window.__t21F3?.snapshot?.();
    return s?{born:performance.timeOrigin,href:location.href,
     ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
     tick:s.tick,phase:s.matchState,seconds:s.timeRemainingSeconds,
     cpu:s.cpu.cpu.length,rejoined:s.cpu.physicalRejoins.length,
     kit:s.b361NativePlayerWeapon?.id,shots:s.shotsFired,
     source:[s.originalSourceSolids,s.originalPaintSurfaces,
      s.originalSourceNavigationLinks,s.sourceScoreablePromotions].join('/')}:
     null;
   })()`);
   return n?.born>born&&n.href===actualHref&&n.ready==='READY'&&
    n.tick===0&&n.phase==='STAGING'&&n.seconds===180&&
    n.cpu===7&&n.rejoined===0&&n.kit==='needle-smg'&&
    n.shots===0&&n.source==='25/17/26/0'?n:false;
  }catch{return false}
 },130000,350);
 k.replayFreshWorld=replay;
 k.verdict='PASS_LIMITED_K3_NATIVE_SINGLE_SOURCE_180S_AND_REAL_REPLAY';
 proof.verdict=k.verdict;
 proof.testKind='K3_GENUINE_CANONICAL_ONE_SOURCE_WORLD';
 proof.stage='K3_INTEGRATED_LIMITED_PASS';save();
 console.log('K3_REAL_NATIVE_CANONICAL_INTEGRATION',JSON.stringify({
  verdict:k.verdict,from:start.tick,to:end.tick,
  cpuInk:k.cpuImpactDeltas,human:k.humanActions,replay,
  source:'25/17/26/0',winner:'NONE'}));
}


/** B490: screenshots are strictly LOCAL, only after genuine physical
 * registered landing->ramp P1. They do NOT certify optical alignment. */
async function b490CaptureLocalSamePosePair(){
 const first=await snap();
 authority(first);
 if(first.texturedSourceF3l?.status!=='READY'||
    first.texturedSourceF3l?.enabled!==true||
    first.texturedSourceF3l?.totalOriginalTriangles!==57578||
    first.b29VerifiedSourcePresentation?.selected!=='F3L_ORIGINAL_UV')
  fail('B490_PINNED_F3L_PACK_NOT_REAL_AND_VISIBLE');
 // Stop the actual native world and release the genuine browser pointer.
 // Do not write a pose, velocity, actor location, tick or camera angle.
 await evaluate('window.__t21F3.pause();document.exitPointerLock?.();true');
 await until(async()=>{
  const n=await snap();
  return n.paused===true&&!(await locked())?n:false;
 },12000,120);
 await delay(450);
 // B491 true SAME-POSE frame capture: pause the REAL SOURCE world, but
 // do not let the large opaque PAUSE menu cover the very ramp/bridge
 // alignment region being inspected. CSS changes visual UI only;
 // native paused/tick, pointer, player/cpu feet, F3L and camera persist.
 // Only the explicitly opt-in local B490 job ever executes this.
 const unobstructed=await evaluate("(() => { const p=document.querySelector('#t21-f3-b202-real-pause'); if(!p||p.hidden||getComputedStyle(p).display==='none')return false; if(document.querySelector('#t21-b490-capture-only-pause-invisible'))return false; const style=document.createElement('style'); style.id='t21-b490-capture-only-pause-invisible'; style.textContent='#t21-f3-b202-real-pause{visibility:hidden!important}'; document.head.appendChild(style); return getComputedStyle(p).visibility==='hidden'; })()");
 if(unobstructed!==true)fail('B490_REAL_PAUSE_MENU_NOT_HIDDEN_FOR_CAPTURE');
 const settle=async()=>{
  await evaluate('new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(()=>ok(true))))');
  await delay(180);
 };
 const png=async()=>{
  const frame=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof frame?.data!=='string')fail('B490_NO_REAL_CHROMIUM_PNG');
  const bytes=Buffer.from(frame.data,'base64');
  if(bytes.length<200||
     bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
   fail('B490_INVALID_REAL_CHROMIUM_PNG');
  return bytes;
 };
 await settle();
 const on=await snap();
 if(on.paused!==true||
    on.b29VerifiedSourcePresentation?.selected!=='F3L_ORIGINAL_UV')
  fail('B490_FROZEN_SOURCE_UV_NOT_PRESENT');
 const originalPng=await png();
 const toggled=await evaluate("(() => { const b=document.querySelector('#t21-f3l-textured'); if(!b||b.hidden||b.disabled)return false; b.click();return true; })()");
 if(toggled!==true)fail('B490_EXISTING_NATIVE_T_CONTROL_NOT_AVAILABLE');
 await settle();
 const registered=await snap();
 const result=b490ValidateSamePoseFrames(on,registered);
 proof.b490FrozenF3lPair={...result,localOnly:true,screenshotsUploaded:false};
 if(result.status!=='PASS_SAME_POSE_CAPTURE_READY'){
  save();fail('B490_FROZEN_PAIR_GUARD_'+result.reason);
 }
 const registeredPng=await png();
 const pngs=[
  {file:'b490-original-uv-same-pose.png',data:originalPng},
  {file:'b490-registered-floor-same-pose.png',data:registeredPng}
 ];
 mkdirSync(out,{recursive:true});
 for(const p of pngs)
  writeFileSync(resolve(out,p.file),p.data,{flag:'wx'});
 // The report has references to local PNGs only. It embeds no original
 // Nintendo OBJ/MTL/texture or pixel data, and cannot contact a server.
 writeFileSync(resolve(out,'B490_LOCAL_COMPARE.html'),
  b490LocalComparisonHtml(result),{flag:'wx'});
 proof.b490FrozenF3lPair={...result,localOnly:true,
  screenshots:pngs.map(p=>({file:p.file,bytes:p.data.length,
   sha256:createHash('sha256').update(p.data).digest('hex')})),
  originalSourceMeshBytesCopied:0,originalTextureBytesCopied:0,
  screenshotsUploaded:false,visualAlignmentCertified:false,
  normalWindowsRenderingCertified:false,
  pauseOverlayHiddenForBothScreenshots:true,
  sourceGameplayUiModified:false,
  localViewer:'B490_LOCAL_COMPARE.html'};
 save();
 // Verify the local evidence set was fully persisted before reporting
 // capture success. This never reads/writes any private original OBJ/PNG.
 if(!['B490_LOCAL_COMPARE.html',...pngs.map(p=>p.file)]
     .every(file=>existsSync(resolve(out,file))))
  fail('B490_LOCAL_CAPTURE_FILES_MISSING_AFTER_WRITE');
 console.log('B490_LOCAL_F3L_REGISTERED_SAME_POSE',JSON.stringify(
  proof.b490FrozenF3lPair));
}

async function main(){
 save();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium'].find(x=>{
   try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}
  });
 if(!chrome)fail('CHROMIUM_NOT_INSTALLED');
 if(b490LocalCompare){
  if(typeof WebSocket!=='function')fail('B490_NODE_GLOBAL_WEBSOCKET_REQUIRED');
  // Any existing HTTP endpoint here may be a stale/foreign game.
  for(const endpoint of [root,'http://127.0.0.1:9268/json']){
   let occupied=false;
   try{await fetch(endpoint,{signal:AbortSignal.timeout(1200)});
    occupied=true;}catch{/* no existing HTTP endpoint */}
   if(occupied)fail('B490_OWNED_PREVIEW_OR_CDP_PORT_ALREADY_IN_USE');
  }
 }
 // Only B490 uses node.exe + Vite CLI, bypassing Windows npm.cmd spawn.
 // Proven CI B441 still uses the existing npm command and flags.
 const preview=b490LocalCompare?
  spawn(process.execPath,[
   resolve(import.meta.dirname,'../node_modules/vite/bin/vite.js'),
   'preview','--host','127.0.0.1','--port','4298',
   '--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}):
  spawn('npm',['run','preview','--','--host','127.0.0.1',
   '--port','4298','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(preview);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000);
 // Unique owned Chrome profile; do not reuse /tmp on the user's Windows.
 if(b490LocalCompare)
  b490OwnedChromeProfile=mkdtempSync(join(tmpdir(),'t21-b490-chromium-'));
 const chromeProcess=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9268','--remote-allow-origins=*',
  '--user-data-dir='+(b490OwnedChromeProfile??'/tmp/t21-b440-native-short-profile'),
  'about:blank'],{stdio:'ignore'});
 children.push(chromeProcess);
 const page=await until(async()=>{
  if(chromeProcess.exitCode!==null)fail('CHROME_TERMINATED');
  try{return (await(await fetch('http://127.0.0.1:9268/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 },45000);
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((ok,bad)=>{
  ws.addEventListener('open',ok,{once:true});
  ws.addEventListener('error',bad,{once:true});
 });
 ws.addEventListener('message',e=>{
  const x=JSON.parse(String(e.data)),p=pending.get(x.id);
  // One approved B441 browser run captures the actual runtime error.
  // Observational CDP event only: no input, actor or world mutation.
  if((p0NormalHuman||b441Experiment)&&
     (x.method==='Runtime.consoleAPICalled'&&
      x.params?.type==='error'||x.method==='Runtime.exceptionThrown')){
   const errorBucket=p0NormalHuman?'p0BrowserErrors':'b441BrowserErrors';
   proof[errorBucket]??=[];
   if(proof[errorBucket].length<12)proof[errorBucket].push({
    method:x.method,
    arguments:x.params?.args?.map(a=>String(a.description??a.value??a.type).slice(0,450))??[],
    exception:x.params?.exceptionDetails?.exception?.description?.slice(0,700)??null,
    stack:(x.params?.stackTrace?.callFrames??x.params?.exceptionDetails?.stackTrace?.callFrames??[])
     .slice(0,8).map(c=>({functionName:c.functionName,url:c.url,lineNumber:c.lineNumber}))
   });
  }
  if(!p)return;pending.delete(x.id);
  x.error?p.bad(Error(JSON.stringify(x.error))):p.ok(x.result||{});
 });
 await cdp('Page.enable');await cdp('Runtime.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false});
 // Reuse this SAME genuine Chromium session to test the actual
 // SOURCE game portal before entering the existing authoritative CPU trial.
 // Portal is optical/navigation only; never edits simulation or actor state.
 await cdp('Page.navigate',{url:root+'play-source.html'});
 const portals=await until(()=>evaluate(`(() => {
  const a=document.querySelector('#play-circuit');
  const b=document.querySelector('#play-combat');
  return document.querySelector('#portal-status')?.dataset.t21PortalReady==='SOURCE_ONLY'&&
   a?.href&&b?.href&&document.querySelector('#play-coop')?.href?
    {circuit:a.href,combat:b.href,
     coop:document.querySelector('#play-coop').href,
     frontline:document.querySelector('#play-combat-frontline')?.href}:null;
 })()`),30000);
 const url=new URL(portals.circuit),opponent=new URL(portals.combat),
  ally=new URL(portals.coop),frontline=new URL(portals.frontline);
 if(url.origin!==new URL(root).origin||url.pathname!==new URL(root).pathname||
  url.searchParams.get('t21W10B384')!=='loadoutCircuit'||
  url.searchParams.get('t21W10B203')!=='fullRound'||
  opponent.searchParams.get('t21W10B192')!=='humanCombat'||
  opponent.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.get('t21W10B193')!=='allyCoop'||
  ally.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.has('t21W10B192')||
  frontline.origin!==url.origin||frontline.pathname!==url.pathname||
  frontline.searchParams.get('t21W10B192')!=='humanCombat'||
  frontline.searchParams.get('t21W10B203')!=='fullRound'||
  frontline.searchParams.get('t21W10B441')!=='sourceFrontline'||
  frontline.searchParams.get('t21W10B448')!=='realA3Front'||
  frontline.searchParams.has('production')||
  frontline.searchParams.has('scoreable')||
  url.searchParams.has('production')||url.searchParams.has('scoreable'))
  fail('PORTAL_SOURCE_DESTINATION_AUTHORITY');

 if(p0NormalHuman){
  // V18 P0: follow the actual STANDARD SOURCE GAME portal, not B441 QA
  // navigation. A real CDP click starts the same 25/17/26/0 world used
  // by human play. No artificial clock, Actor, ink, stage or nav writes.
  if(k3IntegratedSource180||p1InkLoopOnce){
   // Select the existing Needle SMG through the genuine source portal,
   // never by writing game state or changing an actor/weapon in JS.
   let currentKit=await evaluate(
    "document.querySelector('#source-weapon-preselect')?.value");
   if(currentKit!=='needle-smg'){
    await buttonClick('#source-weapon-preselect');
    for(const [type,key,vk] of [
     ['keyDown','Home',36],['keyUp','Home',36],
     ['keyDown','ArrowDown',40],['keyUp','ArrowDown',40],
     ['keyDown','Enter',13],['keyUp','Enter',13]
    ])await cdp('Input.dispatchKeyEvent',{
     type,key,code:key,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
   }
   portals.circuit=await until(async()=>evaluate(`(() => {
    const s=document.querySelector('#source-weapon-preselect');
    const a=document.querySelector('#play-circuit');
    return s?.value==='needle-smg'&&a?.href&&
     new URL(a.href).searchParams.get('t21W10B389')==='needle-smg'?
     a.href:null;
   })()`),18000,180);
   proof.k3RealPortalWeaponSelection='GENUINE_CDP_USER_SELECT_NEEDLE_SMG';
   save();
  }
  proof.stage='P0_REAL_STANDARD_SOURCE_PORTAL_CLICK';save();
  await buttonClick('#play-circuit');
  await waitForRealSourceReady('PORTAL_CIRCUIT_LEGACY',false);
  const actualHref=await evaluate('location.href');
  const actualUrl=new URL(actualHref);
  if(actualHref!==portals.circuit||
     actualUrl.searchParams.get('t21W10B384')!=='loadoutCircuit'||
     actualUrl.searchParams.has('t21QaInput')||
     actualUrl.searchParams.has('t21FullSource')||
     actualUrl.searchParams.has('production')||
     actualUrl.searchParams.has('scoreable'))
   fail('P0_NONCANONICAL_OR_UNAUTHORIZED_PLAY_URL');
  proof.p0CanonicalUrl=actualHref;
  const boot=await snap();
  proof.p0Boot={tick:boot.tick,phase:boot.matchState,
   stopReason:boot.stopReason,joins:boot.cpu?.physicalRejoins?.length,
   actorIds:boot.cpu?.cpu?.map(c=>c.id),
   solids:boot.originalSourceSolids,paint:boot.originalPaintSurfaces,
   nav:boot.originalSourceNavigationLinks,scoreable:boot.sourceScoreablePromotions};
  save();
  if(boot.stopReason||boot.tick!==0||boot.matchState!=='STAGING'||
     boot.cpu?.cpu?.length!==7||boot.originalSourceSolids!==25||
     boot.originalPaintSurfaces!==17||
     boot.originalSourceNavigationLinks!==26||
     boot.sourceScoreablePromotions!==0)
   fail('P0_REAL_BOOT_AUTHORITY_OR_READY_FAILURE');
  await buttonClick('#t21-f3-b25-start');
  await until(async()=>{
   const n=await snap();
   if(n.stopReason)fail('P0_ARMED_SAFE_STOP_'+n.stopReason);
   return n.b25SourcePaintRun?.status==='ARMED'?n:false;
  },20000);
  await until(()=>evaluate(`(() => {
   const b=document.querySelector('#t21-f3-b202-resume');
   const r=b?.getBoundingClientRect();
   const hit=r?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
   return !!b&&!b.hidden&&!b.disabled&&r?.width>0&&r?.height>0&&
    (hit===b||b.contains(hit));
  })()`),25000);
  await buttonClick('#t21-f3-b202-resume');
  proof.stage='P0_NATIVE_STANDARD_HUMAN_BOOT';save();
  let sampledTick=-30;
  const record=(n,stage)=>{
   const row={stage,tick:n.tick,phase:n.matchState,paused:n.paused,
    stopReason:n.stopReason,remainingSeconds:n.timeRemainingSeconds,
    pointerLocked:undefined,joins:n.cpu?.physicalRejoins?.length??-1,
    rejoinedIds:n.cpu?.physicalRejoins??[],
    actors:n.cpu?.cpu?.map(c=>({
     id:c.id,lifeState:c.lifeState,mobilityState:c.mobilityState,
     rejoined:c.rejoined,physicalFoot:c.physicalFoot
    }))??[],humanFoot:n.player?.position,
    humanGrounded:n.b112OriginalHumanGround?.genuineKccGrounded??null,
    humanOriginalSupport:n.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
    humanSupportGap:n.b112OriginalHumanGround?.lastOriginalSourceGapMeters??null,
    originalStage:[n.originalSourceSolids,n.originalPaintSurfaces,
     n.originalSourceNavigationLinks,n.sourceScoreablePromotions]};
   proof.p0Timeline??=[];
   proof.p0Timeline.push(row);
   if(proof.p0Timeline.length>50)proof.p0Timeline.shift();
   sampledTick=n.tick;save();
   return row;
  };
  const inspect=async(n,stage)=>{
   if(n.tick>=sampledTick+30||n.stopReason)record(n,stage);
   if(n.stopReason){
    proof.p0NativeStop={tick:n.tick,reason:n.stopReason,
     phase:n.matchState,joins:n.cpu?.physicalRejoins?.length,
     humanFoot:n.player?.position,
     humanOriginalSupport:n.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
     originalSourceCount:[n.originalSourceSolids,n.originalPaintSurfaces,
      n.originalSourceNavigationLinks,n.sourceScoreablePromotions]};
    try{
     const shot=await cdp('Page.captureScreenshot',{
      format:'png',captureBeyondViewport:false});
     if(typeof shot?.data==='string'&&shot.data.length>100)
      writeFileSync(resolve(out,'p0-genuine-safe-stop-native.png'),
       Buffer.from(shot.data,'base64'));
    }catch{}
    save();
    if(n.stopReason==='T21_F3_OUTSIDE_AUTHORIZED_PHYSICAL_SOURCE_RESET_REQUIRED'){
     // Verify the stopped old world is never reset. The actual CDP R
     // event must navigate to a NEW, fresh canonical source world.
     const previousOrigin=await origin();
     const previousHref=await evaluate('location.href');
     // Pointer lock must be released by real Escape before a genuine
     // Chromium click on the existing STOP/restart control.
     const escape={key:'Escape',code:'Escape',windowsVirtualKeyCode:27,
      nativeVirtualKeyCode:27};
     await cdp('Input.dispatchKeyEvent',{type:'keyDown',...escape});
     await cdp('Input.dispatchKeyEvent',{type:'keyUp',...escape});
     const stopUi=await until(async()=>{
      return await evaluate(`(() => {
       const b=document.querySelector('#t21-f3-b202-resume');
       const panel=document.querySelector('#t21-f3-b202-pause-overlay');
       const r=b?.getBoundingClientRect();
       const top=r?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
       return b&&r&&r.width>0&&r.height>0&&
        document.pointerLockElement===null&&
        (top===b||b.contains(top))&&
        b.textContent?.includes('NEW WORLD')?
        {label:b.textContent,pause:panel?.dataset.t21B202NativeState}:null;
      })()`);
     },30000,180);
     proof.p0RealStopRecoveryButton=stopUi;save();
     if(p0FallROnlyOnce){
      // Genuine native keyboard after actual STOP and real Escape.
      await cdp('Page.bringToFront');
      const key={key:'r',code:'KeyR',windowsVirtualKeyCode:82,
       nativeVirtualKeyCode:82};
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',...key});
      await cdp('Input.dispatchKeyEvent',{type:'keyUp',...key});
     }else await buttonClick('#t21-f3-b202-resume');
     let lastRecoveryProbe=null;
     const fresh=await until(async()=>{
      try{
       const n=await evaluate(`(() => {
        const s=window.__t21F3?.snapshot?.();
        return s?{origin:performance.timeOrigin,href:location.href,
         ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
         tick:s.tick,phase:s.matchState,stopReason:s.stopReason,
         actors:s.cpu?.cpu?.length,rejoins:s.cpu?.physicalRejoins?.length,
         stage:[s.originalSourceSolids,s.originalPaintSurfaces,
          s.originalSourceNavigationLinks,s.sourceScoreablePromotions]}:null;
       })()`);
       lastRecoveryProbe=n;
       return n?.origin>previousOrigin&&n.href===previousHref&&
        n.ready==='READY'&&n.tick===0&&n.phase==='STAGING'&&
        !n.stopReason&&n.actors===7&&n.rejoins===0&&
        JSON.stringify(n.stage)==='[25,17,26,0]'?n:null;
      }catch{return null;}
     },120000,350).catch(error=>{
      proof.p0RecoveryLastProbe=lastRecoveryProbe;save();throw error;
     });
     if(!fresh||fresh.origin<=previousOrigin||
        fresh.href!==previousHref||fresh.ready!=='READY'||
        fresh.tick!==0||fresh.phase!=='STAGING'||fresh.stopReason||
        fresh.actors!==7||fresh.rejoins!==0||
        JSON.stringify(fresh.stage)!=='[25,17,26,0]')
      fail('P0_REAL_KEYR_FRESH_WORLD_NOT_PROVEN');
     proof.p0FallRecovery={realAction:p0FallROnlyOnce?
      'REAL_CDP_KEY_R_AFTER_AUTHENTIC_SOURCE_FALL_STOP':
      'REAL_CDP_STOP_BUTTON_CLICK',oldWorldWasStopped:true,
      stoppedTick:n.tick,stoppedReason:n.stopReason,
      stoppedCpuRejoins:n.cpu?.physicalRejoins?.length,
      freshWorld:fresh,actorWrites:0,scoreWrites:0,nativeClockWrites:0,
      officialWinner:'NONE',productionAuthorized:false};
     proof.verdict=p0FallROnlyOnce?
      'PASS_REAL_FALL_STOP_KEY_R_NEW_NATIVE_SOURCE_WORLD':
      'PASS_NATIVE_SOURCE_FALL_STOP_AND_CLICK_NEW_WORLD_ONLY';
     proof.p0Verdict=proof.verdict;
     proof.stage='P0_SOURCE_FALL_EXPLICIT_REENTRY';save();
     console.log('P0_SOURCE_FALL_RECOVERY',JSON.stringify(proof.p0FallRecovery));
     return 'RECOVERED';
    }
    fail('P0_GENUINE_SOURCE_SAFE_STOP_'+n.stopReason);
   }
   if(n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
      n.originalSourceNavigationLinks!==26||
      n.sourceScoreablePromotions!==0||n.cpu?.cpu?.length!==7)
    fail('P0_ORIGINAL_SOURCE_AUTHORITY_CHANGED');
  };
  // Owner's failed normal play involved real human movement while the
  // seven CPU actors were still joining. Prior P0 held the human still
  // until 7/7, so it could not reproduce this real input/collision race.
  const earlyKey={key:'w',code:'KeyW',windowsVirtualKeyCode:87,
   nativeVirtualKeyCode:87};
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',...earlyKey});
  let earlyHeld=true;
  proof.p0EarlyUserMovement='REAL_KEYW_DURING_CPU_STAGING_TO_ORIGINAL_EDGE_480_NATIVE_TICKS';save();
  let real;
  try{
   real=await until(async()=>{
   const n=await snap();
   if(n.matchState==='STAGING'&&n.tick>=30){
    const current=n.player?.position;
    const starting=boot.player?.position;
    const distance=current&&starting?
     Math.hypot(current[0]-starting[0],current[2]-starting[2]):Infinity;
    if(distance>.22){
     proof.p0PrestartMovementRegression={tick:n.tick,
      distance,starting,current,stage:'STAGING'};save();
     fail('P0_STAGING_MOVED_HUMAN_BEFORE_SEVEN_CPU');
    }
    proof.p0BlockedStagingRealWVerified=true;
   }
   const outcome=await inspect(n,'CPU_STAGING_REAL_USER_W');
   if(outcome==='RECOVERED')return {recovered:true};
   if(earlyHeld&&n.tick>=480){
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',...earlyKey});
    earlyHeld=false;proof.p0EarlyPlayerWReleasedAtTick=n.tick;
    record(n,'EARLY_NATIVE_W_RELEASED');
    const png=await cdp('Page.captureScreenshot',{
     format:'png',captureBeyondViewport:false});
    if(typeof png?.data==='string'&&png.data.length>100)
     writeFileSync(resolve(out,'p0-early-user-w-original-stage.png'),
      Buffer.from(png.data,'base64'));
   }

   // Native source first-drop is intentionally staggered: 4/7 at tick
   // 720 is observable PROGRESS, not a CPU failure. Wait for the true
   // original physical seven-rejoin event, never free-advance the clock.
   if(n.tick>=2400&&n.cpu?.physicalRejoins?.length!==7){
    proof.p0Verdict='HOLD_REAL_2400_TICKS_WITHOUT_SEVEN_REJOINS';save();
    fail('P0_REAL_SEVEN_CPU_ORIGINAL_ROUTE_NOT_COMPLETED');
   }
   return n.cpu?.physicalRejoins?.length===7&&
      n.matchState==='PLAYING'&&n.paused===false?n:false;
   },540000,280);
  }finally{
   if(earlyHeld)await cdp('Input.dispatchKeyEvent',{
    type:'keyUp',...earlyKey}).catch(()=>{});
  }
  if(real?.recovered)return;
  record(real,'AFTER_GENUINE_SEVEN_NATIVE_REJOINS');
  // Seven authentic drop -> rejoin prerequisites are checked BEFORE any
  // ordinary W movement; no CPU is snapped or unblocked by this script.
  if(real.cpu.physicalRejoins.length!==7||real.matchState!=='PLAYING'||
     real.paused||!await locked()){
   proof.p0Verdict='HOLD_SEVEN_TRUE_PHYSICAL_REJOINS_NOT_PROVEN';
   save();fail('P0_SEVEN_REAL_REJOINS_NOT_PROVEN');
  }
  const key={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
  let held=false;
  try{
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',...key});held=true;
   const target=real.tick+18;
   real=await until(async()=>{
    const n=await snap();await inspect(n,'GENUINE_PLAYER_KEYW');
    return n.tick>=target?n:false;
   },30000,180);
  }finally{
   if(held)await cdp('Input.dispatchKeyEvent',{type:'keyUp',...key});
  }
  record(real,'AFTER_REAL_KEYW');
  const start=proof.p0Timeline?.find(x=>
   x.stage==='AFTER_GENUINE_SEVEN_NATIVE_REJOINS');
  const after=real.player?.position;
  const before=start?.humanFoot;
  const actualMovement=after&&before?
   Math.hypot(after[0]-before[0],after[2]-before[2]):0;
  if(!proof.p0BlockedStagingRealWVerified||actualMovement<.3)
   fail('P0_PRESTART_BLOCK_OR_POSTJOIN_GENUINE_MOVEMENT_NOT_PROVEN');
  proof.p0PostJoinActualHumanTravelMeters=actualMovement;
  if(p1LowerOnce){
   // Keep the SAME real 7-CPU world and advance a real W into the
   // already-authenticated first-drop landing. Never drive into the fall.
   const w={key:'w',code:'KeyW',windowsVirtualKeyCode:87,
    nativeVirtualKeyCode:87};
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',...w});
   let found;
   try{
    found=await until(async()=>{
     const n=await snap();
     if(n.stopReason)fail('P1_FELL_BEFORE_READ_ONLY_WARNING_'+n.stopReason);
     await inspect(n,'P1_TRUE_FIRST_LANDING_EDGE');
     const ui=await evaluate(`(() => {
      const canvas=document.querySelector('#app-canvas');
      const w=document.querySelector('#t21-f3-b113-ground-warning');
      return {state:canvas?.dataset.t21P1LowerLandingEdge,
       meters:canvas?.dataset.t21P1LowerLandingEdgeMeters,
       text:w?.textContent??'',hidden:w?.hidden,
       display:w?.style.display};
     })()`);
     const supported=n.b112OriginalHumanGround?.genuineKccGrounded===true&&
       n.b112OriginalHumanGround?.lastOriginalSourceHitId===
        'UndertowT21D:first-drop-landing-positive-z';
     // Read-only source proof: first safe grounded lower landing inside
     // Z48..51, release the actual W before the lip. The older harness
     // only stopped for a 30-tick-spaced visual warning, which can be
     // skipped; it also expected the obsolete literal "STOP / TURN".
     if(p1RampOnce&&supported&&n.player?.position?.[2]<=51&&
        n.player.position[2]>=48)
      return {n,ui,realPreEdgeWRelease:true};
     if(!p1RampOnce&&supported&&
        ui.state==='REGISTERED_EDGE_NO_NEAR_HEIGHT_NEXT_RAY'&&
        ui.hidden===false&&ui.display==='block'&&
        ui.text.includes('STOP W'))
      return {n,ui};
     if(p1RampOnce&&n.player?.position?.[2]<48)
      fail('P1_REAL_W_OVERSTEPPED_CERTIFIED_PREEDGE_STOP');
     if(n.tick>=real.tick+420)
      fail('P1_NO_NATIVE_GROUNDED_EDGE_WARNING_WITHIN_BOUND');
     return false;
    },150000,120);
   }finally{
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',...w});
   }
   const n=found.n,z=n.player?.position?.[2];
   if(!Number.isFinite(z)||z<46||z>53||
      n.cpu?.physicalRejoins?.length!==7||n.matchState!=='PLAYING')
    fail('P1_LOWER_EDGE_NATIVE_PROVENANCE_INVALID');
   // Preserve native movement time when studying the genuine escape route.
   // A screenshot at this edge would let residual forward velocity drift
   // into the unsupported gap before the real S key is pressed.
   if(!p1RampOnce){
   const png=await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false});
   if(typeof png?.data==='string'&&png.data.length>100)
    writeFileSync(resolve(out,'p1-genuine-lower-edge-warning.png'),
     Buffer.from(png.data,'base64'));
   }
   if(p1RampOnce){
    if(found.realPreEdgeWRelease!==true||
       n.b112OriginalHumanGround?.genuineKccGrounded!==true||
       n.b112OriginalHumanGround?.lastOriginalSourceHitId!==
        'UndertowT21D:first-drop-landing-positive-z'||
       z<48||z>51)
     fail('P1_ACTUAL_SUPPORTED_PREEDGE_W_RELEASE_NOT_PROVEN');
    proof.p1RealSafePreEdgeWRelease={
     tick:n.tick,actualBody:n.player?.position,
     originalSupport:n.b112OriginalHumanGround.lastOriginalSourceHitId,
     nativeGrounded:true,physicalCpuRejoins:n.cpu.physicalRejoins.length,
     actualKeyWReleased:true,warningRequiredBeforeRelease:false,
     originalStage:'25/17/26/0',actorOrColliderWrites:0,stopReason:n.stopReason
    };
    save();
    console.log('P1_REAL_SUPPORTED_W_KEY_RELEASE_BEFORE_LIP',
     JSON.stringify(proof.p1RealSafePreEdgeWRelease));
   }else{
    proof.p1NativeLowerEdge={tick:n.tick,actualBody:n.player?.position,
     grounded:n.b112OriginalHumanGround.genuineKccGrounded,
     actualOriginalId:n.b112OriginalHumanGround.lastOriginalSourceHitId,
     physicalCpuRejoins:n.cpu.physicalRejoins.length,
     ui:found.ui,stopReason:n.stopReason,geometryWrites:0,actorWrites:0};
    save();
    console.log('P1_REAL_LANDING_EDGE_WARNING',
     JSON.stringify(proof.p1NativeLowerEdge));
   }
   if(p1InputDiagnosticOnce){
    // Same true seven-CPU world: one bounded physical CDP D-key.
    // Observe accepted native axes, yaw and real pointer lock, not just
    // body X/Z drift from the earlier W key.
    const start=await snap();
    const k={key:'d',code:'KeyD',
     windowsVirtualKeyCode:68,nativeVirtualKeyCode:68};
    const trace=[{phase:'BEFORE_D',tick:start.tick,body:start.player.position,
     input:start.sourceNativeHumanInputProjection}];
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',...k});
    try{
     await until(async()=>{
      const n=await snap();
      if(n.stopReason)fail('P1_NATIVE_D_DIAGNOSTIC_SAFE_STOP_'+n.stopReason);
      const input=n.sourceNativeHumanInputProjection;
      if(!input||input.nativeTick!==n.tick)
       fail('P1_NATIVE_D_DIAGNOSTIC_SOURCE_WITNESS_MISSING');
      trace.push({phase:'D_HELD',tick:n.tick,body:n.player.position,input});
      if(trace.length>16)trace.splice(1,1);
      return n.tick>=start.tick+12?n:false;
     },25000,100);
    }finally{
     await cdp('Input.dispatchKeyEvent',{type:'keyUp',...k});
    }
    const after=await snap();
    trace.push({phase:'D_RELEASED',tick:after.tick,
     body:after.player.position,input:after.sourceNativeHumanInputProjection});
    const accepted=trace.slice(1,-1).find(t=>
     t.input?.nativeInputAxes[0]===1&&
     t.input.realPointerLockAtSampling===true);
    const delta=[after.player.position[0]-start.player.position[0],
     after.player.position[2]-start.player.position[2]];
    const classification=!accepted?'HOLD_D_NOT_OBSERVED_IN_NATIVE_AXES':
     Math.abs(accepted.input.projectedWorldIntent[0])<.15?
      'HOLD_CAMERA_D_INTENT_POINTS_ALONG_Z':
     Math.abs(delta[0])<.15?
      'HOLD_D_ACCEPTED_BUT_WORLD_X_DISPLACEMENT_UNPROVEN':
     'D_ACCEPTED_AND_WORLD_X_DISPLACEMENT_OBSERVED';
    proof.p1NativeInputDiagnostic={
     classification,trace,actualBodyXZDelta:delta,
     realKeyDDispatched:true,
     nativeHumanTeleportWrites:0,stageGeometryWrites:0,
     sourceAuthority:'25/17/26/0',sourceRampWalkCertified:false,
     officialCrossTeamRouteCertified:false};
    save();
    console.log('P1_REAL_SOURCE_D_KEY_CAMERA_AND_MOVEMENT_WITNESS',
     JSON.stringify(proof.p1NativeInputDiagnostic));
   }
   if(p1RampOnce){
    // Native exact-F3 SOURCE path experiment. The real original landing
    // ends centreward; retreat S toward supported +Z before pressing D.
    // No actor teleport, modified collider, nav link, invented floor,
    // KCC threshold change, view yaw override, synthetic world ticking.
    let begin=await snap();
    const originId='UndertowT21D:first-drop-landing-positive-z';
    const slopeId='UndertowT21D:right-low-route-ramp-positive-z';
    // A genuine held-W release can be sampled at Z50.903 while still
    // grounded on the original landing (#42472564745). D at that Z was
    // never verified. Do not invent a wider passable route: release every
    // key and observe real KCC/coasting into the already-proven band.
    // Never write actor position or run a synthetic physics tick.
    if(begin.player?.position?.[2]>50.8){
     const from=begin.player.position,releaseTick=begin.tick;
     begin=await until(async()=>{
      const n=await snap(),z=n.player?.position?.[2];
      if(n.stopReason||n.matchState!=='PLAYING'||
         n.cpu?.physicalRejoins?.length!==7||
         n.b112OriginalHumanGround?.genuineKccGrounded!==true||
         n.b112OriginalHumanGround?.lastOriginalSourceHitId!==originId)
       fail('P1_REAL_W_RELEASE_COAST_LOST_ORIGINAL_SUPPORT_OR_STOP');
      if(Number.isFinite(z)&&z>=49.3&&z<=50.8)return n;
      if(!Number.isFinite(z)||z<49.3||n.tick>releaseTick+24)
       fail('P1_REAL_W_RELEASE_COAST_DID_NOT_REACH_PROVEN_LANDING');
      return false;
     },20000,60);
     proof.p1OriginalSupportOnlyReleaseCoast={
      releasedAtTick:releaseTick,fromZ:from[2],
      settledAtTick:begin.tick,toZ:begin.player.position[2],
      registeredOriginalFoot:originId,realKccGrounded:true,
      userKeyInputsDuringCoast:0,actorPositionWrites:0
     };
     save();
    }
    const initial=begin.player?.position;
    const keys={
     KeyS:{key:'s',code:'KeyS',windowsVirtualKeyCode:83,nativeVirtualKeyCode:83},
     KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68}
    };
    const trace=[];
    const traceSave=(status,extra={})=>{
     proof.p1RampNativeProgress={
      status,world:'SAME_NATIVE_7_CPU_CANONICAL_SOURCE',
      originalStage:'25/17/26/0',originalLandingId:originId,
      originalRegisteredRampId:slopeId,initial,
      nativeInputKeys:['KeyS','KeyD'],
      nativeActorPositionWrites:0,newFloorOrColliderWrites:0,
      inferredSourceNavLinks:0,fullCrossTeamRouteCertified:false,
      samples:trace,...extra
     };save();
    };
    const beginInput=begin.sourceNativeHumanInputProjection;
    if(!Array.isArray(initial)||begin.matchState!=='PLAYING'||
       begin.cpu.physicalRejoins.length!==7||
       begin.b112OriginalHumanGround?.genuineKccGrounded!==true||
       begin.b112OriginalHumanGround?.lastOriginalSourceHitId!==originId||
       !beginInput?.realPointerLockAtSampling||
       Math.abs(beginInput.yawDegrees)>5){
     traceSave('HOLD_UNVERIFIED_NATIVE_START_OR_YAW',{
      nativeBeginning:begin});fail('P1_TRUE_RAMP_START_NOT_VERIFIED');
    }
    const sample=(n,phase)=>{
     if(n.stopReason){
      traceSave('HOLD_ACTUAL_SOURCE_SAFE_STOP',{stopReason:n.stopReason});
      fail('P1_TRUE_RAMP_SAFE_STOP_'+n.stopReason);
     }
     authority(n);
     if(n.cpu.physicalRejoins.length!==7||n.matchState!=='PLAYING')
      fail('P1_TRUE_RAMP_SEVEN_CPU_OR_PLAYING_LOST');
     const foot=n.b112OriginalHumanGround;
     const position=n.player?.position;
     const input=n.sourceNativeHumanInputProjection;
     const ink=n.sourceNativeFloorInkWitness;
     if(!ink||ink.sourceOnlyEnabled!==true||
        ink.originalAuthority!=='25/17/26/0'||
        ink.originalGeometryWrites!==0||ink.originalPaintWrites!==0||
        ink.officialTurfScoreable!==0||ink.actualKccGrounded!==true)
       fail('P1_REAL_SOURCE_NATIVE_INK_FOOT_WITNESS_MISSING');
     // A neutral or unpainted surface cannot prove actual OWN recharge.
     // But any live OWN/ENEMY floor effect must originate at this actual
     // native Rapier supporting collider, never at a neighboring slab.
     if(ink.floorRuleApplicable&&
        (ink.inkRelation==='OWN'||ink.inkRelation==='ENEMY')&&
        ink.floorContactVerified!==true)
       fail('P1_REAL_SOURCE_INK_BACKING_NOT_SAME_SUPPORT');
     const row={phase,nativeTick:n.tick,position,
      grounded:foot?.genuineKccGrounded??null,
      originalSolid:foot?.lastOriginalSourceHitId??null,
      sourceFootGapMeters:foot?.lastOriginalSourceGapMeters??null,
      inputAxes:input?.nativeInputAxes??null,
      yawDegrees:input?.yawDegrees??null,
      cameraPointerLocked:input?.realPointerLockAtSampling??false,
      nativeDesiredXZ:input?.projectedWorldIntent??null,
      realLocalPlayerCue:n.p1RealLocalRampPlayerCue?.state??'OFF',
      nativeInk:{
       relation:ink.inkRelation,mode:ink.locomotionState,
       actualSupportId:ink.actualRapierSolidId,
       actualFootGapMeters:ink.actualRapierFootGapMeters,
       sampledPaintBackingId:ink.sampledBackingSolidId,
       floorContactVerified:ink.floorContactVerified,
       floorRuleApplicable:ink.floorRuleApplicable
      }};
     if(!trace.some(t=>t.nativeTick===n.tick&&t.phase===phase)){
      trace.push(row);traceSave('IN_PROGRESS');
     }
     if(!foot?.genuineKccGrounded||![originId,slopeId].includes(
       foot.lastOriginalSourceHitId??'')){
      traceSave('HOLD_REAL_KCC_UNSUPPORTED_BEFORE_RAMP',{
       rejectedAt:row});fail('P1_RAMP_LOST_GENUINE_SOURCE_FOOT');
     }
     if(!input?.realPointerLockAtSampling)
      fail('P1_TRUE_RAMP_NATIVE_POINTER_LOCK_LOST');
     return row;
    };
    const press=async(k)=>cdp('Input.dispatchKeyEvent',{type:'keyDown',...k});
    const release=async(k)=>cdp('Input.dispatchKeyEvent',{type:'keyUp',...k});
    // Never request an S backstep when the actual human is already
    // grounded in the tested inner landing (Z>=49.3). The previous
    // acceptance test wrongly required S even at real Z50.557.
    const sCueRequired=initial[2]<49.3;
    let safeRetreat=begin;
    if(sCueRequired){
     const retreatStart=begin.tick;
     await press(keys.KeyS);
     try{
      safeRetreat=await until(async()=>{
       const n=await snap();
       const row=sample(n,'REAL_S_KEY_SAFE_BACKSTEP');
       const accepted=row.inputAxes?.[1]===-1&&
        row.nativeDesiredXZ?.[1]>.7;
       if(n.tick>retreatStart+12&&!accepted)
        fail('P1_TRUE_RAMP_S_KEY_NOT_ACCEPTED');
       if(row.position?.[2]>=49.3)return n;
       if(n.tick>=retreatStart+105||row.position?.[2]>50.8){
        traceSave('HOLD_BACKSTEP_NOT_IN_REGISTERED_LANDING',{last:row});
        fail('P1_TRUE_RAMP_BOUNDED_BACKSTEP_NOT_REACHED');
       }
       return false;
      },38000,90);
     }finally{await release(keys.KeyS)}
    }else traceSave('REGISTERED_LANDING_ALREADY_SAFE_NO_S_REQUIRED',{
     startingZ:initial[2],sCueRequired:false});
    const beforeStrafe=safeRetreat.player.position;
    if(beforeStrafe[0]<-.5||beforeStrafe[0]>.6||
       beforeStrafe[2]<49.3||beforeStrafe[2]>50.8||
       safeRetreat.b112OriginalHumanGround?.lastOriginalSourceHitId!==originId){
     traceSave('HOLD_SAFE_RETREAT_LANDING_NOT_PROVEN',{beforeStrafe});
     fail('P1_RAMP_RETRACED_SOURCE_LANDING_NOT_PROVEN');
    }
    let registeredRamp=null;
    const strafeStart=safeRetreat.tick;
    await press(keys.KeyD);
    try{
     await until(async()=>{
      const n=await snap();
      const row=sample(n,'REAL_D_KEY_TO_PINNED_SOURCE_RAMP');
      const accepted=row.inputAxes?.[0]===1&&
       row.nativeDesiredXZ?.[0]>.7;
      if(n.tick>strafeStart+12&&!accepted)
       fail('P1_TRUE_RAMP_D_KEY_NOT_ACCEPTED');
      if(row.grounded&&row.originalSolid===slopeId&&
         row.position?.[0]>1.25&&
         row.position?.[2]>48&&row.position?.[2]<51.5){
       registeredRamp=n;return true;
      }
      if(row.position?.[0]>3.25||n.tick>strafeStart+115){
       traceSave('HOLD_NO_ACTUAL_SOURCE_RAMP_ENTRY',{last:row});
       fail('P1_RAMP_NOT_REACHED_BEFORE_REGISTERED_PATH_BOUND');
      }
      return false;
     },42000,80);
    }finally{await release(keys.KeyD)}
    if(!registeredRamp)
     fail('P1_RAMP_UNOBSERVED_REAL_RAPIER_GROUNDED_ENTRY');
    const final=registeredRamp.player.position;
    const finalInk=registeredRamp.sourceNativeFloorInkWitness;
    if(!finalInk||finalInk.sourceOnlyEnabled!==true||
       finalInk.actualKccGrounded!==true||
       finalInk.actualRapierSolidId!==slopeId||
       !Number.isFinite(finalInk.actualRapierFootGapMeters)||
       Math.abs(finalInk.actualRapierFootGapMeters)>.12)
      fail('P1_REAL_RAMP_SOURCE_INK_FOOT_SUPPORT_NOT_PROVEN');
    proof.p1OriginalFloorInkWitness={
      lastNativeTick:registeredRamp.tick,
      actualSupportingRamp:finalInk.actualRapierSolidId,
      actualFootGapMeters:finalInk.actualRapierFootGapMeters,
      sampledPaintBackingId:finalInk.sampledBackingSolidId,
      sampledRelation:finalInk.inkRelation,
      matchedPaintIfAny:finalInk.floorContactVerified,
      realNativeRapier:true,sourceSolids:25,paintSurfaces:17,
      navLinks:26,scoreable:0,officialWinner:'NONE',
      ownRechargeOrEnemyDamageNotAutomaticallyCertified:true
    };
    save();
    // Independent, SAME-world route proof must also show the normal
    // SOURCE PLAYER cue at the actual supported S and D stages.
    const sCue=trace.some(x=>x.phase==='REAL_S_KEY_SAFE_BACKSTEP'&&
     x.realLocalPlayerCue==='BACKSTEP_S');
    const dCue=trace.some(x=>x.phase==='REAL_D_KEY_TO_PINNED_SOURCE_RAMP'&&
     x.realLocalPlayerCue==='STRAFE_D');
    const hud=await evaluate(`(() => {
     const w=document.querySelector('#t21-f3-b113-ground-warning');
     const c=document.querySelector('#app-canvas');
     return {text:w?.textContent??'',hidden:w?.hidden,
      display:w?.style.display,phase:c?.dataset.t21P1LocalRampCue};
    })()`);
    if((sCueRequired&&!sCue)||!dCue||hud.hidden!==false||
       hud.display!=='block'||!
       (hud.text.includes('SOURCE LANDING')||
        hud.text.includes('ORIGINAL RAMP FOOT'))){
     traceSave('HOLD_REAL_LOCAL_PLAYER_CUE_NOT_VISIBLE',{
      sCueRequired,sCue,dCue,hud});
     fail('P1_REAL_REQUIRED_REGISTERED_RAMP_PLAYER_CUE_NOT_VISIBLE');
    }
    proof.p1SourceLocalPlayerGuide={
     sCueRequired,sCue,dCue,hud,stage:'25/17/26/0',newColliders:0,
     genuineSourceHumanMovement:true,
     fullStageTraversalCertified:false};
    traceSave('PASS_REAL_KCC_LANDING_TO_EXISTING_REGISTERED_SOURCE_RAMP',{
     originalLandingSample:initial,
     registeredLandingBackstep:beforeStrafe,
     finalNativeBody:final,
     firstNativeTick:begin.tick,lastNativeTick:registeredRamp.tick,
     lastNativeSolid:registeredRamp.b112OriginalHumanGround.lastOriginalSourceHitId,
     actualGrounded:registeredRamp.b112OriginalHumanGround.genuineKccGrounded,
     truePhysicalCpuRejoins:registeredRamp.cpu.physicalRejoins.length,
     stopReason:registeredRamp.stopReason
    });
    const png=await cdp('Page.captureScreenshot',{
     format:'png',captureBeyondViewport:false});
    if(typeof png?.data==='string'&&png.data.length>100)
     writeFileSync(resolve(out,'p1-real-original-landing-to-registered-ramp.png'),
      Buffer.from(png.data,'base64'));
    save();
    if(b490LocalCompare)await b490CaptureLocalSamePosePair();
    console.log('P1_NATIVE_REAL_SOURCE_RAMP_ROUTE',
     JSON.stringify(proof.p1RampNativeProgress));
   }
  }
  if(k3IntegratedSource180||p1InkLoopOnce){
   await runK3CanonicalOneWorld(actualHref,{inkLoopOnly:p1InkLoopOnce});
   return;
  }
  // No physical fall means this one-shot R test remains HOLD, not PASS.
  if(p0FallROnlyOnce)
   fail('P0_NO_ACTUAL_PHYSICAL_FALL_STOP_R_NOT_PROVEN');
  proof.p0Verdict='PASS_CANONICAL_SOURCE_PRESTART_W_BLOCKED_AND_7CPU_POSTJOIN_W';
  proof.stage=p1InputDiagnosticOnce?'P1_REAL_D_KEY_INPUT_WITNESS':
   p1RampOnce?'P1_NATIVE_REGISTERED_LANDING_TO_RAMP':
   p1LowerOnce?'P1_REAL_FIRST_LANDING_EDGE_WARNING':
   'P0_NO_SAFE_STOP_IN_BOUNDED_HEADLESS_PATH';
  proof.verdict=p1InputDiagnosticOnce?'PASS_DIAGNOSTIC_CAPTURED_ROUTE_STILL_HOLD':
   p1RampOnce?'PASS_TRUE_NATIVE_GROUNDED_LANDING_TO_RAMP':
   p1LowerOnce?'PASS_NATIVE_LOWER_EDGE_WARNING_BEFORE_FALL':
   proof.p0Verdict;
  save();
  console.log('P0_REAL_CANONICAL_USER_SOURCE',JSON.stringify({
   verdict:proof.verdict,firstTick:boot.tick,finalTick:real.tick,
   truePhysicalRejoins:real.cpu.physicalRejoins.length,
   stopReason:real.stopReason,realKeyW:true,
   originalStage:'25/17/26/0',personallyPlayed:false,
   normalWindowsRenderingCertified:false}));
  return;
 }

 if(proveRealCharger){
  // Real SOURCE portal: select fourth kit by actual Chrome keyboard,
  // navigate using the visible combat link, charge by held pointer-lock
  // mouse, and only fire on genuine mouse release.
  proof.stage='REAL_CHARGER_SOURCE_PORTAL';save();
  await buttonClick('#source-weapon-preselect');
  for(const [key,vk] of [['Home',36],['ArrowDown',40],
     ['ArrowDown',40],['ArrowDown',40],['Enter',13]]){
   for(const type of ['keyDown','keyUp'])
    await cdp('Input.dispatchKeyEvent',{
     type,key,code:key,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});
  }
  const selected=await until(()=>evaluate(`(() => {
   const p=document.querySelector('#source-weapon-preselect');
   const b=document.querySelector('#play-combat');
   return p?.value==='rail-charger'&&
    new URL(b?.href).searchParams.get('t21W10B389')==='rail-charger'&&
    localStorage.getItem('t21-source-weapon-selection-v1')==='rail-charger';
  })()`),18000,160);
  if(!selected)fail('RAIL_CHARGER_NOT_GENUINELY_SELECTED');
  await buttonClick('#play-combat');
  const boot=await until(async()=>{
   try{
    const n=await evaluate('window.__t21F3?.snapshot?.()??null');
    return n?.matchState==='STAGING'&&
     n.b361NativePlayerWeapon?.id==='rail-charger'?n:null;
   }catch{return null}
  },120000,300);
  authority(boot);
  if(boot.tick!==0||boot.timeRemainingSeconds!==180||
     boot.cpu.physicalRejoins.length!==0)
   fail('CHARGER_FRESH_WORLD_NOT_STAGING');
  const born=await origin();
  await buttonClick('#t21-f3-b25-start');
  await until(async()=>{
   const n=await snap();return n.b25SourcePaintRun?.status==='ARMED'?n:null;
  },20000);
  await buttonClick('#t21-f3-b202-resume');
  const start=await until(async()=>{
   const n=await snap();authority(n);
   return n.matchState==='PLAYING'&&!n.paused&&
    n.cpu.physicalRejoins.length===7&&await locked()&&
    n.b25SourcePaintRun?.status==='RUNNING'?n:null;
  },360000,300);
  if(start.shotsFired!==0||!trueOriginalFoot(foot(start))||
     start.b361NativePlayerWeapon?.id!=='rail-charger'||await origin()!==born)
   fail('CHARGER_NATIVE_7CPU_AND_REAL_HUMAN_NOT_READY');
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:650});
  const before=await snap();authority(before);
  if(before.cameraSourcePractice.pitchDegrees> -30||
     before.cameraSourcePractice.pitchDegrees< -55)
   fail('CHARGER_REAL_MOUSE_NOT_AIMED_AT_ORIGINAL_UPPER_FLOOR');
  const shotImage=async name=>{
   const data=(await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false})).data;
   const buf=Buffer.from(data||'','base64');
   if(buf.length<10000||buf.readUInt32BE(16)!==1600||
     buf.readUInt32BE(20)!==900)fail('CHARGER_NATIVE_SCREENSHOT_HOLD');
   writeFileSync(resolve(out,name),buf);
  };
  await shotImage('real-charger-before.png');
  let hold;
  let down=false;
  try{
   await cdp('Input.dispatchMouseEvent',{type:'mousePressed',
    x:800,y:450,button:'left',buttons:1,clickCount:1});down=true;
   hold=await until(async()=>{
    const n=await snap();authority(n);
    if(n.matchState!=='PLAYING'||n.paused||!await locked()||
       n.cpu.physicalRejoins.length!==7||await origin()!==born)
     fail('CHARGER_REAL_NATIVE_CHARGE_INTERRUPTED');
    return n.tick>=before.tick+70?n:null;
   },105000,160);
   if(hold.shotsFired!==before.shotsFired||
      hold.b23HumanInkFeedback.humanChangedCells!==
       before.b23HumanInkFeedback.humanChangedCells)
    fail('CHARGER_FIRED_WHILE_PHYSICAL_MOUSE_HELD');
   await shotImage('real-charger-charged.png');
  }finally{
   if(down)await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',
    x:800,y:450,button:'left',buttons:0,clickCount:1});
  }
  const after=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.cpu.physicalRejoins.length!==7||await origin()!==born)
    fail('CHARGER_NATIVE_RELEASE_INTERRUPTED');
   return n.shotsFired>hold.shotsFired&&
    n.b23HumanInkFeedback.humanChangedCells>
     hold.b23HumanInkFeedback.humanChangedCells?n:null;
  },60000,130);
  const ledger=after.b23HumanInkFeedback.originalImpactChangedCellsBySurface;
  if(after.shotsFired!==before.shotsFired+1||
     !Array.isArray(ledger)||!ledger.some(v=>
      v.surfaceId==='UndertowT21D:spawn-high-positive-z:paint'&&
      v.changedCells>0)||
     ledger.reduce((n,v)=>n+v.changedCells,0)!==
      after.b23HumanInkFeedback.humanChangedCells||
     after.sourceScoreablePromotions!==0||!trueOriginalFoot(foot(after)))
   fail('CHARGER_REAL_RELEASE_NO_AUTHORITATIVE_SOURCE_IMPACT');
  await shotImage('real-charger-after-paint.png');
  proof.realCharger={
   schema:'F3_CANONICAL_RAIL_CHARGER_REAL_SOURCE_INPUT_V1',
   verdict:'PASS_REAL_CHARGER_HOLD_RELEASE_HUMAN_PAINT',
   source:'25/17/26/0',actualPlayerWeapon:after.b361NativePlayerWeapon.id,
   realMenuKeyboardSelected:true,physicalCpuRejoins:7,
   tickStart:start.tick,tickHeldFrom:before.tick,
   tickChargedTo:hold.tick,tickReleasedPaint:after.tick,
   shotsBefore:before.shotsFired,shotsHeld:hold.shotsFired,
   shotsAfter:after.shotsFired,
   realHumanSourceCells:after.b23HumanInkFeedback.humanChangedCells,
   genuineOriginalImpactLedger:ledger,
   sameWorld:true,officialWinner:'NONE',scoreable:0,
   writes:{actors:0,source:0,ink:0,clock:0,score:0},
   formal4v4Certified:false,
   screenshots:['real-charger-before.png','real-charger-charged.png',
    'real-charger-after-paint.png']};
  writeFileSync(resolve(out,'f3-real-charger.json'),
   JSON.stringify(proof.realCharger,null,2)+'\n');
  proof.stage='REAL_CHARGER_SOURCE_PAINT_PROVEN';
  proof.verdict=proof.realCharger.verdict;save();
  console.log('F3_REAL_CHARGER_HOLD_RELEASE',JSON.stringify(proof.realCharger));
  return;
 }
 if(proveRealSweep){
  // Real player-facing SOURCE_SWEEP ingress in canonical combat, using
  // exactly the same actual CDP clicks, browser world and Rapier actors.
  // This does NOT claim 3-surface CLEAR or official 4v4 score.
  proof.stage='REAL_CANONICAL_COMBAT_SOURCE_SWEEP_PENDING';save();
  await cdp('Page.navigate',{url:portals.combat});
  const boot=await until(async()=>{
   // The actual browser can expose the canvas before SOURCE snapshot
   // is installed. Poll only initial boot; never swallow later authority
   // or physical-source failures.
   try{
    const n=await evaluate('window.__t21F3?.snapshot?.()??null');
    return n?.originalSourceSolids===25&&
     n.originalPaintSurfaces===17&&n.matchState==='STAGING'?n:null;
   }catch{return null;}
  },120000,400);
  authority(boot);
  if(boot.tick!==0||boot.timeRemainingSeconds!==180||
     boot.cpu.cpu.length!==7||boot.cpu.physicalRejoins.length!==0)
   fail('SWEEP_FRESH_ORIGINAL_SOURCE_WORLD_MISSING');
  const world=await origin();
  const camera=boot.cameraSourcePractice?.shoulderSide;
  // Three genuine visible mode-button mouse clicks: CLASSIC ->
  // SWITCHBACK -> PAINT_RELAY -> SOURCE_SWEEP. No JS programmatic click.
  for(let i=0;i<3;i++)await buttonClick('#t21-f3-b56-variant');
  const selected=await evaluate(
   "document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B56NextVariant");
  if(selected!=='SOURCE_SWEEP')fail('SWEEP_GENUINE_PLAYER_MODE_SELECTION_HOLD');
  await buttonClick('#t21-f3-b25-start');
  const armed=await until(async()=>{
   const n=await snap();authority(n);
   return n.b25SourcePaintRun?.status==='ARMED'?n:null;
  },20000);
  if(armed.b25SourcePaintRun.practiceVariant!=='SOURCE_SWEEP'||
     armed.b25SourcePaintRun.elapsedTicks!==0||
     armed.b25SourcePaintRun.originalSweepSurfaces!==0||
     armed.matchState!=='STAGING'||armed.tick!==0)
   fail('SWEEP_ARMED_BEFORE_ACTUAL_START_HOLD');
  await buttonClick('#t21-f3-b202-resume');
  const started=await until(async()=>{
   const n=await snap();authority(n);
   if(n.b25SourcePaintRun?.status==='RUNNING'&&
      (n.matchState!=='PLAYING'||n.cpu.physicalRejoins.length!==7))
    fail('SWEEP_TIMER_BEGAN_WITHOUT_ACTUAL_7_CPU');
   return n.matchState==='PLAYING'&&!n.paused&&
    n.cpu.physicalRejoins.length===7&&await locked()&&
    n.b25SourcePaintRun?.status==='RUNNING'?n:null;
  },360000,350);
  if(started.b25SourcePaintRun.practiceVariant!=='SOURCE_SWEEP'||
     started.b25SourcePaintRun.elapsedTicks>15||
     started.b25SourcePaintRun.originalSweepSurfaces!==0||
     started.b25SourcePaintRun.humanChangedImpactCells!==0||
     await origin()!==world||!trueOriginalFoot(foot(started)))
   fail('SWEEP_TRUE_SEVEN_CPU_START_HANDOFF_INVALID');
  const img=async(name)=>{
   const p=await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false});
   if(typeof p?.data!=='string'||p.data.length<100)
    fail('SWEEP_REAL_CHROMIUM_SCREENSHOT_MISSING');
   writeFileSync(resolve(out,name),Buffer.from(p.data,'base64'));
  };
  await img('source-sweep-real-selected-before-shot.png');
  // Genuine pointer-locked CDP mouse motion: source camera starts at
  // approximately -12 degrees, too flat to contact the original upper
  // spawn paint surface. Physical mouseY +200 pitches toward the floor.
  // Never assign camera yaw/pitch in the game or page.
  const cameraPitchBefore=started.cameraSourcePractice?.pitchDegrees;
  if(!Number.isFinite(cameraPitchBefore))
   fail('SWEEP_NO_ACTUAL_SOURCE_CAMERA_BEFORE_AIM');
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:650});
  const aimed=await snap();authority(aimed);
  const cameraPitchAfter=aimed.cameraSourcePractice?.pitchDegrees;
  if(!Number.isFinite(cameraPitchAfter)||
     cameraPitchAfter>=cameraPitchBefore-10||
     cameraPitchAfter>-30||cameraPitchAfter< -55||
     await origin()!==world||!await locked())
   fail('SWEEP_REAL_CDP_MOUSE_AIM_DID_NOT_FACE_ORIGINAL_FLOOR');
  // No fabricated ink or shot; one held authentic Chrome mouse input.
  // Accept real mouse shot separately from proof of changed owner cells.
  const firstTick=started.tick;
  let held=false,shot;
  try{
   await cdp('Input.dispatchMouseEvent',{type:'mousePressed',
    x:800,y:450,button:'left',buttons:1,clickCount:1});
   held=true;
   shot=await until(async()=>{
    const n=await snap();authority(n);
    if(n.matchState!=='PLAYING'||n.paused||!await locked()||
       n.cpu.physicalRejoins.length!==7)
     fail('SWEEP_REAL_SOURCE_MOUSE_OR_CPU_INTERRUPTED');
    return n.tick>=firstTick+30&&
     n.shotsFired>started.shotsFired&&
     n.b23HumanInkFeedback?.humanChangedCells>0?n:null;
   },90000,250);
  }finally{
   if(held)await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',
    x:800,y:450,button:'left',buttons:0,clickCount:1});
  }
  const after=await until(async()=>{
   const n=await snap();authority(n);
   return n.tick>shot.tick+4?n:null;
  },25000,300);
  const ink=after.b23HumanInkFeedback;
  const raw=ink?.originalImpactChangedCellsBySurface;
  const run=after.b25SourcePaintRun;
  if(!Array.isArray(raw)||
     raw.some(x=>typeof x.surfaceId!=='string'||
      !x.surfaceId.startsWith('UndertowT21D:')||
      !Number.isSafeInteger(x.changedCells)||x.changedCells<0)||
     raw.reduce((sum,x)=>sum+x.changedCells,0)!==ink.humanChangedCells||
     run.practiceVariant!=='SOURCE_SWEEP'||
     !['RUNNING','CLEAR'].includes(run.status)||
     run.elapsedTicks<=0||run.elapsedTicks>=3600||
     run.humanChangedImpactCells!==ink.humanChangedCells||
     ink.humanChangedCells<1||run.originalSweepSurfaces<1||
     run.originalSweepSurfaces!==raw.filter(x=>x.changedCells>0).length||
     run.qualifiedOriginalSweepSurfaces!==
      raw.filter(x=>x.changedCells>=60).length||
     run.sweptOriginalSurfaceCellProgress.reduce(
      (sum,x)=>sum+x.changedCells,0)!==run.humanChangedImpactCells||
     after.shotsFired<=started.shotsFired||
     after.cpu.physicalRejoins.length!==7||
     after.matchState!=='PLAYING'||after.paused||
     await origin()!==world||
     after.cameraSourcePractice?.shoulderSide!==camera||
     after.sourceScoreablePromotions!==0)
   fail('SWEEP_REAL_SOURCE_PAINT_LEDGER_OR_PLAYER_AUTHORITY_INVALID');
  await img('source-sweep-real-after-human-shot.png');
  if(proveRealSweepClear){
   proof.stage='B58_NATIVE_ORIGINAL_UPPER_AND_LOWER_CLEAR_ATTEMPT';save();
   proof.b58TruePhysicalClearAttempt=
    await b58AttemptActualThreeSurfaceClear({
     world,start:started,firstAim:ink.humanChangedCells});
   await img('source-sweep-real-three-surface-clear.png');
   proof.stage='B58_THREE_SURFACE_NATIVE_CLEAR_PASS';save();
  }
  proof.realSweepOneShot={
   schema:'T21_B58_CANONICAL_REAL_CDP_SOURCE_SWEEP_ENTRY_V1',
   verdict:proveRealSweepClear?
    'PASS_REAL_SOURCE_SWEEP_3_SURFACES_60_EACH_AND_12M':
    'PASS_REAL_PLAYER_SOURCE_SWEEP_FIRST_ORIGINAL_HUMAN_PAINT',
   source:'25/17/26/0',actualThreeSurfaceClearCertified:
    proveRealSweepClear&&
     proof.b58TruePhysicalClearAttempt?.threeSurfaceClearCertified===true,
   physicalCpuBefore:0,physicalCpuAfter:after.cpu.physicalRejoins.length,
   realModeClicks:3,selectedRealMode:selected,
   genuinePointerLockedMouseAim:true,
   cameraPitchBefore,cameraPitchAfter,
   readyTick:boot.tick,firstRunTick:started.tick,
   afterShotTick:after.tick,initialSourceCells:0,
   realHumanShots:after.shotsFired-started.shotsFired,
   nativeOriginalHumanChangedCells:ink.humanChangedCells,
   certifiedOriginalSurfaceInk:raw,
   actualPaintedOriginalSurfaces:run.originalSweepSurfaces,
   actualQualifiedOriginalSurfaces:run.qualifiedOriginalSweepSurfaces,
   actualGroundedMeters:run.realGroundedTravelMeters,
   remainingPracticeSeconds:run.secondsRemaining,
   sameBrowserWorld:true,originalCameraShoulderPreserved:true,
   syntheticTicks:0,actorWrites:0,inkWrites:0,scoreWrites:0,
   nativeClockWrites:0,officialWinner:'NONE',formal4v4Certified:false,
   screenshots:proveRealSweepClear?
    ['source-sweep-real-selected-before-shot.png',
     'source-sweep-real-after-human-shot.png',
     'source-sweep-real-three-surface-clear.png']:
    ['source-sweep-real-selected-before-shot.png',
     'source-sweep-real-after-human-shot.png']};
  writeFileSync(resolve(out,'b58-real-source-sweep-once.json'),
   JSON.stringify(proof.realSweepOneShot,null,2)+'\n');
  proof.stage=proveRealSweepClear?'B58_THREE_SURFACE_NATIVE_CLEAR_PASS':
   'REAL_SWEEP_7CPU_AND_FIRST_ORIGINAL_HUMAN_PAINT';
  proof.testKind='REAL_CANONICAL_PLAYER_SOURCE_SWEEP_INPUT';
  proof.verdict=proof.realSweepOneShot.verdict;
  save();
  console.log('B58_REAL_SOURCE_SWEEP_ONE_SHOT',
   JSON.stringify(proof.realSweepOneShot));
  return;
 }
 if(proveRealQ){
  // Validate genuine canonical combat KeyQ independently of F4 B487 HOLD.
  proof.stage='REAL_CANONICAL_COMBAT_Q_PENDING';save();
  await cdp('Page.navigate',{url:portals.combat});
  const first=await until(async()=>{
   try{const n=await snap();return n?.originalSourceSolids===25&&
    n.originalPaintSurfaces===17&&n.matchState==='STAGING'?n:null}
   catch{return null}
  },120000,400);
  authority(first);
  if(first.tick!==0||first.timeRemainingSeconds!==180||
     first.cpu.cpu.length!==7)fail('Q_FRESH_COMBAT_WORLD_INVALID');
  const born=await origin(),kit=first.b361NativePlayerWeapon?.id;
  await buttonClick('#t21-f3-b25-start');
  await until(async()=>{const n=await snap();authority(n);
   return n.b25SourcePaintRun?.status==='ARMED'?n:null;},20000);
  await buttonClick('#t21-f3-b202-resume');
  const started=await until(async()=>{const n=await snap();authority(n);
   return n.matchState==='PLAYING'&&!n.paused&&await locked()&&
    n.cpu.physicalRejoins.length===7&&n.b25SourcePaintRun?.status==='RUNNING'?n:null;
  },360000,500);
  if(started.b25SourcePaintRun?.practiceVariant!=='CLASSIC')
   fail('Q_WRONG_VARIANT');
  // No time/actor/ink writes: actual native 3,600-tick practice TIME_UP.
  const expired=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.cpu.physicalRejoins.length!==7||n.player.hp<=0)
    fail('Q_REAL_NATIVE_MATCH_STOPPED');
   if(['CLEAR','ABORTED'].includes(n.b25SourcePaintRun?.status))
    fail('Q_NO_NATURAL_TIMEOUT');
   return n.b25SourcePaintRun?.status==='TIME_UP'&&
    n.b25SourcePaintRun.elapsedTicks>=3600&&n.timeRemainingSeconds>=60?n:null;
  },900000,900);
  const screenshot=async(file)=>{
   const p=await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false});
   if(typeof p?.data!=='string'||p.data.length<100)fail('Q_MISSING_TRUE_PNG');
   writeFileSync(resolve(out,file),Buffer.from(p.data,'base64'));
  };
  await screenshot('q-true-chromium-before.png');
  const shoulderBefore=expired.cameraSourcePractice?.shoulderSide;
  if(shoulderBefore!=='RIGHT'&&shoulderBefore!=='LEFT')
   fail('Q_REAL_CAMERA_SHOULDER_BEFORE_MISSING');
  const priorOrigin=await origin(),priorTick=expired.tick,
   priorSeconds=expired.timeRemainingSeconds,
   priorCells=expired.b23HumanInkFeedback?.humanChangedCells??0,
   priorCpuIds=expired.cpu.cpu.map(x=>x.id).join(',');
  await tapSourceCameraKey('q','KeyQ',81);
  const observed=await until(async()=>{
   const n=await snap();authority(n);
   const mark=await evaluate(`(() => {
    const c=document.querySelector('#app-canvas');
    return {state:c?.dataset.t21F3QuickPractice,
     tick:c?.dataset.t21F3QuickPracticeTick};
   })()`);
   return mark?.state==='GENUINE_LOCAL_REARM'&&
    n.b25SourcePaintRun?.status==='RUNNING'&&n.tick>priorTick?{n,mark}:null;
  },30000,250);
  const a=observed.n;
  if(priorOrigin!==born||await origin()!==born||a.matchState!=='PLAYING'||
     a.paused||!await locked()||a.cpu.physicalRejoins.length!==7||
     a.cpu.cpu.map(x=>x.id).join(',')!==priorCpuIds||
     a.b361NativePlayerWeapon?.id!==kit||
     a.b25SourcePaintRun.practiceVariant!=='CLASSIC'||
     a.b25SourcePaintRun.humanChangedImpactCells!==0||
     a.b25SourcePaintRun.elapsedTicks>90||
     a.timeRemainingSeconds>priorSeconds+.001||
     a.timeRemainingSeconds<60||a.tick<=priorTick||
     (a.b23HumanInkFeedback?.humanChangedCells??0)<priorCells||
     a.sourceScoreablePromotions!==0)
   fail('Q_NOT_REAL_SAME_WORLD_LOCAL_REARM');
  // A real local retry must not accidentally execute Q's camera toggle.
  // This is input precedence, NOT a claim about the F4 collision HOLD.
  const shoulderAfter=a.cameraSourcePractice?.shoulderSide;
  if(shoulderAfter!==shoulderBefore)
   fail('Q_UNINTENDED_CAMERA_SHOULDER_TOGGLE');
  await screenshot('q-true-chromium-after.png');
  proof.realQOneShot={schema:'T21_REAL_CANONICAL_COMBAT_KEYQ_ONCE',
   verdict:'PASS_REAL_CDP_KEYQ_SAME_SOURCE_WORLD',
   source:'25/17/26/0',realKey:'KeyQ',
   practiceBefore:expired.b25SourcePaintRun.status,
   practiceElapsedBefore:expired.b25SourcePaintRun.elapsedTicks,
   practiceAfter:a.b25SourcePaintRun.status,
   tickBefore:priorTick,tickAfter:a.tick,
   remainingBefore:priorSeconds,remainingAfter:a.timeRemainingSeconds,
   sameBrowserWorld:true,sameSevenCpu:true,
   cameraShoulderBefore:shoulderBefore,cameraShoulderAfter:shoulderAfter,
   cameraShoulderPreserved:true,
   humanCellsBefore:priorCells,humanCellsAfter:a.b23HumanInkFeedback?.humanChangedCells,
   acceptedMarker:observed.mark,actorWrites:0,inkWrites:0,clockWrites:0,
   scoreWrites:0,officialWinner:'NONE',formal4v4Certified:false,
   images:['q-true-chromium-before.png','q-true-chromium-after.png']};
  writeFileSync(resolve(out,'q-real-combat-once.json'),
   JSON.stringify(proof.realQOneShot,null,2)+'\n');
  proof.stage='REAL_Q_ONE_SHOT_PASS';
  proof.testKind='REAL_CANONICAL_COMBAT_KEYQ_ONE_SHOT';
  proof.verdict='PASS_REAL_CDP_KEYQ_SAME_SOURCE_WORLD';
  save();
  console.log('Q_REAL_SOURCE_KEY_ONE_SHOT',JSON.stringify(proof.realQOneShot));
  return;
 }
 // Human-facing mode selection must be visible and clickable without
 // scrolling on a 1600x900 game display. Check ACTUAL Chromium layout,
 // not a synthetic CSS/viewport claim. No actor/score/clock writes.
 const realMenuButtons=await evaluate(`(() => {
  const selectors=['#play-circuit','#play-coop',
   '#play-combat','#play-combat-frontline'];
  return selectors.map(selector=>{
   const button=document.querySelector(selector);
   const card=button?.closest('.mode');
   const b=button?.getBoundingClientRect();
   const c=card?.getBoundingClientRect();
   return {selector,buttonTop:b?.top??null,buttonBottom:b?.bottom??null,
    cardBottom:c?.bottom??null,buttonWidth:b?.width??null,
    enabled:!!button?.href&&!button?.hasAttribute('disabled')};
  });
 })()`);
 if(!Array.isArray(realMenuButtons)||realMenuButtons.length!==4||
  realMenuButtons.some(v=>!v.enabled||
   !Number.isFinite(v.buttonTop)||v.buttonTop<0||
   !Number.isFinite(v.buttonBottom)||v.buttonBottom>880||
   !Number.isFinite(v.cardBottom)||v.cardBottom>895||
   !Number.isFinite(v.buttonWidth)||v.buttonWidth<160))
  fail('REAL_1600x900_SOURCE_MODE_CHOICE_REQUIRES_SCROLL');
 proof.realSourceModeViewport={
  actualChromium1600x900:true,threeOptionsImmediatelyAccessible:true,
  optionalFrontlineLinkImmediatelyAccessible:true,
  realMenuButtons,sourceOnly:true,gameplayWrites:0,officialWinner:'NONE'};
 save();
 const portalPicture=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof portalPicture?.data!=='string'||portalPicture.data.length<100)
  fail('PORTAL_REAL_CHROMIUM_SCREENSHOT_MISSING');
 writeFileSync(resolve(out,'source-play-portal-real-chromium.png'),
  Buffer.from(portalPicture.data,'base64'));
 // Native keyboard/mouse choice, never DOM-value injection: this proves
 // the human-facing selector and B389 original fresh-world boot jointly.
 const catalog=await evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  return p?{id:p.value,options:[...p.options].map(o=>o.value),
   bottom:p.getBoundingClientRect().bottom}:null;
 })()`);
 if(!catalog||catalog.options.length!==12||
  catalog.id!=='pulse-sprayer'||catalog.options.at(-1)!=='ink-saber'||
  catalog.bottom>880)fail('REAL_SOURCE_LOADOUT_CATALOG_AND_LAYOUT');
 await buttonClick('#source-weapon-preselect');
 for(const [type,key,code,n] of [
  ['keyDown','End','End',35],['keyUp','End','End',35],
  ['keyDown','Enter','Enter',13],['keyUp','Enter','Enter',13]
 ]){
  await cdp('Input.dispatchKeyEvent',{
   type,key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n
  });
 }
 const actualChoice=await until(()=>evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  const a=document.querySelector('#play-circuit');
  const href=a?.href?new URL(a.href):null;
  return p?.value==='ink-saber'&&
   href?.searchParams.get('t21W10B389')==='ink-saber'&&
   localStorage.getItem('t21-source-weapon-selection-v1')==='ink-saber'?
   {value:p.value,safeUrl:a.href}:null;
 })()`),15000);
 if(!actualChoice)fail('REAL_CDP_PLAYER_LOADOUT_CHOICE_NOT_SAVED');
 const loadoutImage=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof loadoutImage?.data!=='string'||loadoutImage.data.length<100)
  fail('REAL_NATIVE_WEAPON_MENU_IMAGE_MISSING');
 writeFileSync(resolve(out,'source-play-selected-ink-saber.png'),
  Buffer.from(loadoutImage.data,'base64'));
 await buttonClick('#play-circuit');
 const clicked=await until(()=>evaluate(`location.search.includes(
  't21W10B384=loadoutCircuit')&&
  location.search.includes('t21W10B203=fullRound')&&
  location.search.includes('t21W10B389=ink-saber')`),20000);
 if(!clicked||new URL(await evaluate('location.href')).pathname!==
    new URL(root).pathname)
  fail('PORTAL_REAL_CDP_CLICK_DID_NOT_START_EXISTING_SOURCE_GAME');
 // Wait for the genuine PlayCanvas/Rapier world to initialize before
 // querying its snapshot: incomplete boot is not negative weapon evidence.
 await waitForRealSourceReady('PORTAL_WEAPON_CIRCUIT');
 const native=await until(async()=>{
  const s=await evaluate('window.__t21F3?.snapshot?.()??null');
  return s?.b361NativePlayerWeapon?.id==='ink-saber'?s:null;
 },30000);
 authority(native);
 if(native.matchState!=='STAGING'||native.b384OpenLoadoutCircuit!==true)
  fail('REAL_NATIVE_PRESELECT_WEAPON_NOT_STAGING');
 proof.realSourcePlayPortal={
  verdict:'PASS_ACTUAL_CDP_SOURCE_LOADOUT_TO_NATIVE_PLAYCANVAS_WEAPON',
  realCdpMouseClick:true,realCdpWeaponKeyboard:true,
  nativeWeaponId:native.b361NativePlayerWeapon.id,
  nativeWeaponDisplay:native.b361NativePlayerWeapon.displayName,
  nativeWeaponInStaging:true,persistedPreference:actualChoice.value,
  sourceOnly:true,existing12WeaponCircuit:true,
  actualScreenshot:'source-play-selected-ink-saber.png',
  scriptInjectedActors:0,nativeTickWrites:0,officialWinner:'NONE',
  formal4v4Certified:false,productionAuthorized:false};
 save();
 // Returning to the portal retains ONLY the selected weapon, never the
 // native actors, ink or game tick from the previous SOURCE world.
 await cdp('Page.navigate',{url:root+'play-source.html'});
 await until(()=>evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  const links=['#play-circuit','#play-combat','#play-coop',
   '#play-combat-frontline'].map(q=>document.querySelector(q));
  return document.querySelector('#portal-status')
   ?.dataset.t21PortalReady==='SOURCE_ONLY'&&
   p?.value==='ink-saber'&&links.every(a=>a?.href&&
    new URL(a.href).searchParams.get('t21W10B389')==='ink-saber'&&
    a.dataset.t21SourceInitialWeapon==='ink-saber');
 })()`),30000);
 proof.realSourceAllModeLoadout={
  samePlayerSelectedKitInAllFourLinks:true,
  actualNativeSourcePortal:true,originalModeFlagsPreserved:true,
  changedActorOrInkWrites:0,productionAuthorized:false
 };
 save();
 // In the long user-flow the human now deliberately selects a compatible
 // AUTO weapon: the 45s held-primary projectile test is not valid for
 // Ink Saber (SPLATANA executes its slash only on mouse RELEASE).
 // The historical short B441 case and original Ink Saber portal test stay.
 const fullReplayHumanKit=proveFullSourceReplay?'needle-smg':'ink-saber';
 if(proveFullSourceReplay){
  await buttonClick('#source-weapon-preselect');
  for(const [type,key,code,n] of [
    ['keyDown','Home','Home',36],['keyUp','Home','Home',36],
    ['keyDown','ArrowDown','ArrowDown',40],
    ['keyUp','ArrowDown','ArrowDown',40],
    ['keyDown','Enter','Enter',13],['keyUp','Enter','Enter',13]
  ])await cdp('Input.dispatchKeyEvent',{
   type,key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n
  });
  const choice=await until(()=>evaluate(`(() => {
   const p=document.querySelector('#source-weapon-preselect');
   const links=['#play-circuit','#play-combat','#play-coop',
    '#play-combat-frontline'].map(q=>{
     const a=document.querySelector(q);
     return a?.href?new URL(a.href).searchParams.get('t21W10B389'):null;
   });
   return p?.value==='needle-smg'&&
    links.every(v=>v==='needle-smg')&&
    localStorage.getItem('t21-source-weapon-selection-v1')==='needle-smg'?
    {selected:'needle-smg',linksVerified:4,realKeyboard:true,
     directGameWrites:0}:null;
  })()`),18000,200);
  proof.fullReplayRealHumanPortalWeaponChoice=choice;save();
 }
 await buttonClick('#play-combat-frontline');
 await waitForRealSourceReady('FRONTLINE_BOOT');
 const optionalBoot=await snap();authority(optionalBoot);
 if(optionalBoot.b361NativePlayerWeapon?.id!==fullReplayHumanKit||
    optionalBoot.matchState!=='STAGING')
  fail('FRONTLINE_REAL_SOURCE_PRESELECTED_WEAPON_NOT_APPLIED');
 proof.realSourceAllModeLoadout.frontlineNativeBootWeapon=fullReplayHumanKit;
 save();
 const optionalUI=await evaluate(`(() => {
  const canvas=document.querySelector('#app-canvas');
  const search=new URL(location.href).searchParams;
  return {b192:canvas?.dataset.t21B192HumanCombat,
   b441:canvas?.dataset.t21B441OriginalFrontline,
   b448:canvas?.dataset.t21B448RealA3OriginalGoal,
   route:search.get('t21W10B441'),a3:search.get('t21W10B448'),
   origin:location.origin,path:location.pathname};
 })()`);
 if(optionalBoot.matchState!=='STAGING'||
    optionalBoot.originalSourceSolids!==25||
    optionalBoot.originalPaintSurfaces!==17||
    optionalBoot.originalSourceNavigationLinks!==26||
    optionalBoot.sourceScoreablePromotions!==0||
    optionalBoot.cpu.cpu.length!==7||
    optionalUI.b192!=='REAL_SOURCE_ONLY'||
    optionalUI.b441!=='SOURCE_ONLY_INDEPENDENT_FRONTLINE_RESEARCH'||
    optionalUI.b448!=='STRICT_REAL_CPU_A3_ORIGINAL_GOAL_REAUTHORIZATION'||
    optionalUI.route!=='sourceFrontline'||
    optionalUI.a3!=='realA3Front'||
    optionalUI.origin!==url.origin||optionalUI.path!==url.pathname)
  fail('OPTIONAL_REAL_FRONTLINE_SOURCE_WORLD_AUTHORITY_HOLD');
 const optHud=await until(()=>evaluate(`(() => {
  const root=document.querySelector('#t21-f3-b464-real-cpu-frontline');
  const game=window.__t21F3?.snapshot();
  const patrol=game?.cpu?.sourcePatrol;
  if(!root||!patrol)return null;
  return {state:root.dataset.t21B464State,
   source:root.dataset.t21B464Authority,
   score:root.dataset.t21B464OfficialScoreable,
   routes:root.dataset.t21B464CrossTeamRoutes,
   nativeGoalRequests:root.dataset.t21B464NativeGoalRequests,
   actualRequests:patrol.b441ActualGoalRequests,
   originalArrivals:root.dataset.t21B464OriginalArrivals,
   actualArrivals:patrol.b443FirstActualFrontlineArrivals,
   visible:getComputedStyle(root).display!=='none',
   sourceVerified:game.originalSourceSolids===25&&
    game.originalPaintSurfaces===17&&
    game.originalSourceNavigationLinks===26&&
    game.sourceScoreablePromotions===0,
   noOfficialWinner:root.textContent?.includes('UNSCORED')===true};
 })()`),16000);
 if(optHud.state!=='READY'||optHud.source!=='25/17/26/0'||
    optHud.score!=='0'||optHud.routes!=='0'||
    optHud.nativeGoalRequests!==String(optHud.actualRequests)||
    optHud.originalArrivals!==String(optHud.actualArrivals)||
    !optHud.visible||!optHud.sourceVerified||!optHud.noOfficialWinner)
  fail('REAL_SOURCE_FRONTLINE_PLAYER_HUD_MUST_MATCH_NATIVE_CPU');
 proof.optionalCpuFrontlinePlayerHud=optHud;save();
 proof.optionalCpuFrontlinePortal={
  verdict:'PASS_NATIVE_USER_CLICK_TO_REAL_SOURCE_FRONTLINE_MODE',
  genuineCdpClick:true,realCpuCount:7,source:'25/17/26/0',
  nativeStartState:'STAGING',officialScoreable:0,
  realOpponentCrossSideCertified:false,opponentHitCertified:false,
  productionAuthorized:false,officialWinner:'NONE'};
 save();
 // The explicitly selected FULL REPLAY must continue the REAL world
 // created by the actual user's visible FRONTLINE menu click ABOVE.
 // The old B441-only synthetic research URL is not a canonical portal
 // destination, and cannot acquire an authorized human B389 boot by
 // appending one query parameter. Ordinary short trial is unchanged.
 const fullReplayQuery=proveFullSourceReplay?
  query+'&t21W10B389='+fullReplayHumanKit:query;
 if(!proveFullSourceReplay)
  await cdp('Page.navigate',{url:root+query});
 await waitForRealSourceReady('DIRECT_SOURCE_REOPEN');
 const actualQuery=await evaluate('location.search');
 if(proveFullSourceReplay){
  const a=new URLSearchParams(actualQuery);
  const expected=new URLSearchParams(fullReplayQuery);
  if([...a.entries()].length!==[...expected.entries()].length||
     [...expected.entries()].some(([k,v])=>
      a.getAll(k).length!==1||a.get(k)!==v))
   fail('FULL_REPLAY_REAL_PORTAL_CANONICAL_MODE_QUERY_HOLD');
 }else if(actualQuery!==query)fail('WRONG_SOURCE_URL');
 if(proveFullSourceReplay){
  const boot=await snap();authority(boot);
  proof.fullReplayActualSourceBoot={
   originalSource:'25/17/26/0',selectedUserKit:fullReplayHumanKit,
   reusedActualClickedFrontlineWorld:true,
   nativeBootKit:boot.b361NativePlayerWeapon?.id??null,
   realNativeTick:boot.tick,matchState:boot.matchState,
   url:await evaluate('location.href'),
   nativeSevenCpuActors:boot.cpu.cpu.length,
   sourceScoreablePromotions:boot.sourceScoreablePromotions,
   originalActorWrites:0,nativeClockWrites:0,scoreWrites:0
  };
  save();
  if(boot.b361NativePlayerWeapon?.id!==fullReplayHumanKit||
     boot.matchState!=='STAGING'||boot.tick!==0||
     boot.cpu.cpu.length!==7||boot.sourceScoreablePromotions!==0)
   fail('FULL_REAL_SELECTED_HUMAN_WEAPON_NATIVE_BOOT_HOLD');
 }
 const modeButton=await evaluate(`(() => {
  const b=document.querySelector('#t21-f3-source-mode-menu-ready');
  return b?{source:b.dataset.originalSourceOnly,
   scoreable:b.dataset.scoreable,
   actors:b.dataset.actorRelocations}:null;
 })()`);
 if(!modeButton||modeButton.source!=='true'||
   modeButton.scoreable!=='0'||modeButton.actors!=='0')
  fail('SOURCE_NATIVE_READY_MODE_MENU_MISSING');
 proof.sourcePlayerModeMenu=modeButton;save();
 // Real Chrome inspects REAL SOURCE game DOM at READY, without
 // fabricating TIME_UP or any stats. Later 180s ART remains separate.
 const footer=await evaluate(`(() => {
  const modal=document.querySelector('#t21-f3-b59-session-finished');
  const card=modal?.firstElementChild;
  const stats=modal?.querySelector('#t21-f3-b59-scroll-stats');
  const actions=modal?.querySelector('#t21-f3-b59-footer-actions');
  const restart=modal?.querySelector('#t21-f3-b59-restart');
  const change=modal?.querySelector('#t21-f3-source-mode-menu-after-match');
  return {originalScoreable:modal?.dataset.originalScoreable,
   hidden:modal?.hidden===true,
   cardDisplay:card?getComputedStyle(card).display:null,
   statsOverflow:stats?getComputedStyle(stats).overflowY:null,
   footerShrink:actions?getComputedStyle(actions).flexShrink:null,
   restartPinned:!!actions&&actions.contains(restart),
   modePinned:!!actions&&actions.contains(change),
   statsSeparate:!!stats&&!!actions&&!actions.contains(stats)};
 })()`);
 if(footer?.originalScoreable!=='0'||footer.hidden!==true||
    footer.cardDisplay!=='flex'||footer.statsOverflow!=='auto'||
    footer.footerShrink!=='0'||!footer.restartPinned||
    !footer.modePinned||!footer.statsSeparate)
  fail('REAL_SOURCE_REPLAY_AND_MODE_ACTIONS_MUST_BE_PINNED');
 proof.sourceFinishUiLayout=footer;save();
 const boot=await snap();authority(boot);
 if(boot.matchState!=='STAGING'||boot.cpu.physicalRejoins.length!==0)
  fail('NOT_FRESH_NATIVE_SOURCE_WORLD');
 if(b441Experiment){
  const q=new URL(await evaluate('location.href')).searchParams;
  const mode=await evaluate(`document.querySelector('#app-canvas')?.dataset.t21B475RealFrontlineReady`);
  if(q.get('t21W10B192')!=='humanCombat'||q.has('t21W10B193')||
     mode!=='ACTUAL_SOURCE_CLASSIC_PREARM'||
     boot.b214SustainedBattleInk?.enabled!==true||
     boot.b215RealBattleAimPacing?.enabled!==true||
     boot.b216RealNativePaintBackfill?.enabled!==true||
     boot.b367RealCpuLifecycleEvidence?.enabled!==true||
     boot.b474NativeSteeringEvidence?.enabled!==true)
    fail('B475_REAL_PLAYER_MODE_NATIVE_PIPELINES_NOT_ENABLED');
  // B478: native B441-only play does not carry the separate B448 flag.
  // Require genuine B464 DOM at actual READY before expensive 720 tick.
  const b478Hud=await until(()=>evaluate(`(() => {
   const h=document.querySelector('#t21-f3-b464-real-cpu-frontline');
   const n=window.__t21F3?.snapshot?.();
   if(!h||!n)return null;
   return {state:h.dataset.t21B464State,
    source:h.dataset.t21B464Authority,
    requests:h.dataset.t21B464NativeGoalRequests,
    noScore:h.dataset.t21B464OfficialScoreable,
    crossTeam:h.dataset.t21B464CrossTeamRoutes,
    a3OptIn:n.cpu?.sourcePatrol?.b448A3ResearchEnabled,
    a3Requests:n.cpu?.sourcePatrol?.b448A3RealNativeGoalRequests,
    hasB441:n.cpu?.sourcePatrol?.b441Enabled,
    actualNativeTick:n.tick};
  })()`),15000,250);
  const originalHudValid=b478Hud.state==='READY'&&
   b478Hud.source==='25/17/26/0'&&
   b478Hud.requests!=='NOT_VERIFIED'&&
   b478Hud.noScore==='0'&&b478Hud.crossTeam==='0'&&
   b478Hud.hasB441===true;
  if(!originalHudValid)
   fail('B478_REAL_SOURCE_NATIVE_FRONTLINE_HUD_UNAUTHORIZED_OR_STALE');
  if(b448Experiment){
   // Real four-mode FRONTLINE portal explicitly enables B448. Never
   // mislabel it as the historical B441-only native research mode.
   if(b478Hud.a3OptIn!==true||
      !Number.isSafeInteger(b478Hud.a3Requests)||
      b478Hud.a3Requests<0)
    fail('FULL_REAL_CANONICAL_B448_NATIVE_READY_HUD_NOT_PROVEN');
   proof.b478RealB441B448NativeHud={
    ...b478Hud,canonicalUserFrontline:true,
    b448ActuallyEnabled:true,originalSourceResearchOnly:true,
    sourceWrites:0,actorWrites:0,officialWinner:'NONE'};
  }else{
   // Keep the old B441-only absence-of-B448 safety gate unchanged.
   if(b478Hud.a3OptIn!==false||b478Hud.a3Requests!==0)
    fail('B478_B441_ONLY_NATIVE_HUD_UNAUTHORIZED_OR_STALE');
   proof.b478RealB441OnlyNativeHud={
    ...b478Hud,originalSourceResearchOnly:true,
    a3WasNotAuthorized:true,sourceWrites:0,actorWrites:0,
    officialWinner:'NONE'};
  }
  save();
  proof.b475ActualSourceUserCombat={
   realUserCombatMode:true,originalReadyTick:boot.tick,
   realSevenCpuNativeActors:boot.cpu.cpu.length,
   nativeBattleInk:true,realHpWitnessEnabled:true,
   boundedNativeCpuSteering:true,syntheticShots:0,sourceScoreable:0,
   certifiedEnemyRoutes:false,officialWinner:'NONE'};
  save();
 }
 proof.stage='FRESH_NATIVE_SOURCE';proof.browserOrigin=await origin();save();
 await buttonClick('#t21-f3-b25-start');
 await until(async()=>{
  const n=await snap();authority(n);
  return n.b25SourcePaintRun?.status==='ARMED'?n:false;
 },20000);
 await until(async()=>evaluate(`(() => {
  const b=document.querySelector('#t21-f3-b202-resume');
  const r=b?.getBoundingClientRect();
  const hit=r?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
  return !!b&&!b.hidden&&!b.disabled&&r&&r.width>0&&r.height>0&&
   (hit===b||b.contains(hit));
 })()`),25000);
 await buttonClick('#t21-f3-b202-resume');
 proof.stage='NATIVE_START_SENT';save();
 // A freshly launched normal SOURCE world independently runs real physics,
 // and MUST naturally physically rejoin all seven original CPU actors.
 let lastRealSourceSample=null, polls=0,highestNativeTick=-1;
 let lastNativeAdvanceAt=Date.now();
 const observeRealPhysicalCpu=async()=>{
  const n=await snap();authority(n);
  const pointer=await locked();
  if(n.tick>highestNativeTick){
   highestNativeTick=n.tick;lastNativeAdvanceAt=Date.now();
  }
  if(++polls%20===0){
   const joined=n.cpu.physicalRejoins;
   const missing=n.cpu.cpu.filter(c=>!joined.includes(c.id));
   lastRealSourceSample={tick:n.tick,phase:n.matchState,paused:n.paused,
    joins:joined.length,originalCpuIds:n.cpu.cpu.map(c=>c.id),
    missingCpu:missing.map(c=>({id:c.id,rejoined:c.rejoined,
     lifeState:c.lifeState,physicalFoot:c.physicalFoot})),
    mission:n.b25SourcePaintRun?.status,
    foot:foot(n),body:n.player.position,pointerLocked:pointer,
    nativeAdvanceAgeMs:Date.now()-lastNativeAdvanceAt};
   proof.lastNativeReadOnlySample=lastRealSourceSample;
   // The B477 in-game cue is independent of this read-only QA sample.
   save();
  }
  if(n.matchState==='TIME_UP')fail('NO_GENUINE_WALK_BEFORE_TIME_UP');
  return pointer&&n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7&&n.player.mode==='HUMAN'&&
   n.b25SourcePaintRun?.status==='RUNNING'&&
   trueOriginalFoot(foot(n))?n:false;
 };
 let ready;
 try{
  ready=await until(observeRealPhysicalCpu,360000,350);
 }catch(error){
  // B477: one strictly bounded extra observation is permitted only after
  // genuine 6/7 original-source rejoin, actual monotonic native clock
  // progress near the prior B476 timeout tick, no native stop/pause and
  // no missed actor replaced. NEVER promote 6/7 or a timeout to PASS.
  const latest=lastRealSourceSample;
  const extension=b441Experiment&&
   String(error).includes('B440_SHORT_REAL_NATIVE_HOLD_TIMEOUT_')&&
   latest?.phase==='STAGING'&&latest.paused===false&&
   latest.joins===6&&latest.mission==='ARMED'&&
   Number.isSafeInteger(latest.tick)&&latest.tick>=1000&&
   latest.nativeAdvanceAgeMs<=30000&&
   Array.isArray(latest.missingCpu)&&latest.missingCpu.length===1;
  proof.b477RealStartupHandoff={
   source:'25/17/26/0',lastNative:latest,reason:String(error),
   extensionPermitted:!!extension,actorWrites:0,scoreWrites:0,
   nativeClockWrites:0,originalRoutesCertified:false};
  save();
  if(!extension)throw error;
  ready=await until(observeRealPhysicalCpu,90000,350);
  proof.b477RealStartupHandoff.native7Of7AfterBoundedExtension=true;
  proof.b477RealStartupHandoff.endNativeTick=ready.tick;
  save();
 }
 // Real Chromium KeyR during an active canonical original SOURCE world
 // must not reset or navigate. Reuse THIS B441 7-CPU browser session only.
 if(b441Experiment&&!b448Experiment&&!proveRealQ&&!proveRealSweep&&
    !proveRealCharger&&!proveSourcePracticeExpiry){
  const beforeR=await snap();authority(beforeR);
  const worldBeforeR=await origin(),hrefBeforeR=await evaluate('location.href');
  if(beforeR.matchState!=='PLAYING'||beforeR.paused||
     beforeR.cpu.physicalRejoins.length!==7||!await locked()||
     !trueOriginalFoot(foot(beforeR)))
   fail('R_PLAYING_PRECONDITION_NOT_GENUINE_NATIVE_SOURCE');
  await tapSourceCameraKey('r','KeyR',82);
  const afterR=await until(async()=>{
   const n=await snap();authority(n);
   return n.tick>=beforeR.tick+3?n:null;
  },15000,100);
  if(afterR.matchState!=='PLAYING'||afterR.paused||
     afterR.cpu.physicalRejoins.length!==7||!await locked()||
     await origin()!==worldBeforeR||
     await evaluate('location.href')!==hrefBeforeR||
     afterR.timeRemainingSeconds>beforeR.timeRemainingSeconds||
     afterR.sourceScoreablePromotions!==0)
    fail('R_DURING_REAL_SOURCE_PLAY_CAUSED_RESTART_OR_WORLD_DRIFT');
  proof.realPlayingKeyRBlocked={actualChromiumKeyR:true,
   initialTick:beforeR.tick,afterTick:afterR.tick,
   samePerformanceTimeOrigin:true,sameExactNativeUrl:true,
   physicalCpuRejoins:7,originalSource:'25/17/26/0',
   gameplayContinued:true,scoreablePromotions:0,
   actorPositionWrites:0,nativeClockWrites:0,officialWinner:'NONE',
   certifiedA1ClearReplay:false,certifiedFallStopRecovery:false};
  save();
 }
 if(b441Experiment){
  // B476 is a PLAYER UI check on actual Chrome DOM, not a fake
  // screenshot or model-authored source HUD. Native challenge MUST
  // already be RUNNING after 7 original Rapier CPU joins.
  // B479: the real native tick can reach 7/7 between slow WebGL frames.
  // Wait for the DOM to catch up without modifying native simulation.
  // Save the exact last observed DOM even when the UI never converges.
  let b479Last=null,b479Polls=0;
  let compact;
  try{
   compact=await until(async()=>{
    const observed=await evaluate(`(() => {
   const c=document.querySelector('#t21-f3-b25-paint-run');
   const f=document.querySelector('#t21-f3-b464-real-cpu-frontline');
   const n=window.__t21F3?.snapshot?.();
   if(!c||!f||!n)return null;
   const a=c.getBoundingClientRect(),b=f.getBoundingClientRect();
   return {nativeTick:n.tick,realMission:n.b25SourcePaintRun?.status,
    missionPaint:n.b25SourcePaintRun?.humanChangedImpactCells,
    missionGround:n.b25SourcePaintRun?.realGroundedTravelMeters,
    visible:!c.hidden&&getComputedStyle(c).display!=='none',
    actualB476State:c.dataset.t21B476State,
    compact:c.dataset.t21B476Compact,
    originalSource:c.dataset.t21B476OriginalSource,
    officialWinner:c.dataset.t21B476OfficialWinner,
    b25:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},
    frontline:{left:b.left,right:b.right,top:b.top,bottom:b.bottom},
    actualProgressVisible:
     getComputedStyle(document.querySelector(
      '#t21-f3-b53-objectives')).display!=='none',
    onlyActualPractice:
     document.querySelector('#t21-f3-b53-paint-label')?.textContent,
    realFrontlinePanel:f.dataset.t21B464Authority,
    f8:(()=>{
     const h=document.querySelector('#t21-f3-b245-view-toggle');
     if(!h)return null;
     const s=h.getBoundingClientRect();
     return {left:s.left,right:s.right,top:s.top,bottom:s.bottom,
      visible:getComputedStyle(h).display!=='none'};
    })(),
    nativeTeam:(()=>{
     const t=document.querySelector('#t21-f3-b286-source-team');
     if(!t)return null;
     const r=t.getBoundingClientRect();
     return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      placement:t.dataset.t21B482NativeSourceTeamPlacement,
      visible:!t.hidden&&getComputedStyle(t).display!=='none',
      sourceScoreable:t.dataset.scoreable,
      officialWinner:t.dataset.officialWinner,
      enemyContactCertified:t.dataset.enemyContactCertified,
      realAllyCount:t.dataset.allyActive,
      realEnemyCount:t.dataset.enemyActive};
    })(),
    focusedCssRestoration:!!document.querySelector(
     '#t21-f3-b245-layer-style')?.textContent?.includes(
      '#t21-f3-b25-paint-run[data-t21-b476-compact="true"]')};
  })()`);
    if(!observed)return null;
    b479Last=observed;b479Polls++;
    if(b479Polls%5===0){
     proof.b479LatestNativeDomProbe={
      sample:b479Last,observations:b479Polls,source:'25/17/26/0',
      gameplayWrites:0,scoreWrites:0,artApproved:false};
     save();
    }
    const verified=observed.realMission==='RUNNING'&&observed.visible&&
     observed.actualB476State==='LIVE'&&observed.compact==='true'&&
     observed.originalSource==='25/17/26/0'&&
     observed.officialWinner==='NONE'&&
     observed.realFrontlinePanel==='25/17/26/0'&&
     observed.actualProgressVisible&&
     Number.isFinite(observed.missionGround)&&
     Number.isSafeInteger(observed.missionPaint)&&
     observed.b25.left<=25&&observed.b25.right<=350&&
     observed.b25.right<observed.frontline.left-15&&
     observed.focusedCssRestoration===true&&
     observed.f8?.visible===true&&
     observed.nativeTeam?.visible===true&&
     observed.nativeTeam.placement==='TOP_LEFT'&&
     observed.nativeTeam.left<=30&&observed.nativeTeam.top<=30&&
     observed.nativeTeam.bottom<observed.b25.top-20&&
     observed.nativeTeam.right<observed.frontline.left-20&&
     observed.nativeTeam.sourceScoreable==='0'&&
     observed.nativeTeam.officialWinner==='NONE'&&
     observed.nativeTeam.enemyContactCertified==='false'&&
     observed.nativeTeam.realAllyCount==='3'&&
     observed.nativeTeam.realEnemyCount==='4'&&
     (observed.f8.left>=observed.b25.right+5||
      observed.f8.bottom<=observed.b25.top-5||
      observed.f8.top>=observed.b25.bottom+5)&&
     (observed.f8.left>=observed.frontline.right+5||
      observed.f8.right<=observed.frontline.left-5||
      observed.f8.bottom<=observed.frontline.top-5||
      observed.f8.top>=observed.frontline.bottom+5);
    return verified?observed:null;
   },20000,250);
  }catch(error){
   proof.b479LatestNativeDomProbe={
    sample:b479Last,observations:b479Polls,source:'25/17/26/0',
    reason:String(error),gameplayWrites:0,scoreWrites:0,
    originalRouteGranted:false,artApproved:false};
   save();throw error;
  }
  proof.b479LatestNativeDomProbe={
   sample:compact,observations:b479Polls,source:'25/17/26/0',
   verdict:'PASS_SAME_REAL_NATIVE_GAME_AND_SOURCE_DOM',
   gameplayWrites:0,scoreWrites:0,artApproved:false};
  save();
  if(compact.realMission!=='RUNNING'||!compact.visible||
     compact.actualB476State!=='LIVE'||compact.compact!=='true'||
     compact.originalSource!=='25/17/26/0'||
     compact.officialWinner!=='NONE'||
     compact.realFrontlinePanel!=='25/17/26/0'||
     !compact.actualProgressVisible||
     !Number.isFinite(compact.missionGround)||
     !Number.isSafeInteger(compact.missionPaint)||
     compact.b25.left>25||compact.b25.right>350||
     compact.b25.right>=compact.frontline.left-15)
    fail('B476_REAL_PLAYER_PRACTICE_HUD_OBSCURES_CPU_FRONTLINE');
  proof.b476RealPlayerFocusedObjective={
   ...compact,actualOriginalPlayerNoSyntheticInk:true,
   gameplayWrites:0,scoreable:0,officialWinner:'NONE'};
  save();
 }
 proof.stage='TRUE_SEVEN_CPU_READY';proof.before={
  tick:ready.tick,body:ready.player.position,sourceFoot:foot(ready),
  cpuRejoins:ready.cpu.physicalRejoins.length,shots:ready.shotsFired,
  phase:ready.matchState,pointerLocked:await locked()};save();
 const after=await keyW();authority(after);
 const af=foot(after),bf=proof.before.sourceFoot;
 const old=proof.before.body,newBody=after.player.position;
 const meters=Array.isArray(old)&&Array.isArray(newBody)&&
  [...old,...newBody].every(Number.isFinite)?
  Math.hypot(newBody[0]-old[0],newBody[2]-old[2]):NaN;
 proof.after={tick:after.tick,body:newBody,sourceFoot:af,
  physicalPlanarMeters:meters,nativeTickDelta:after.tick-proof.before.tick,
  cpuRejoins:after.cpu.physicalRejoins.length,shots:after.shotsFired,
  phase:after.matchState,pointerLocked:await locked(),
  browserOrigin:await origin()};save();
 if(!trueOriginalFoot(af)||af.originalSolid!==bf.originalSolid||
  proof.after.pointerLocked!==true||
  proof.after.browserOrigin!==proof.browserOrigin||
  after.matchState!=='PLAYING'||after.paused||
  after.player.mode!=='HUMAN'||after.cpu.physicalRejoins.length!==7||
  after.shotsFired!==proof.before.shots||
  !Number.isSafeInteger(proof.after.nativeTickDelta)||
  proof.after.nativeTickDelta<6||proof.after.nativeTickDelta>36||
  !Number.isFinite(meters)||meters<.10||meters>2.2)
  fail('REAL_NATIVE_INPUT_OR_SOURCE_KCC');
 await checkRealSourceCameraControls();
 if(b441Experiment){
  // The real player crosshair now reads existing SOURCE ownerGrid,
  // never certifies a bullet hit or creates scored paint. Capture an
  // actual Chromium sight-line after genuine native PLAYING and 7/7.
  const b481=await evaluate(`(() => {
   const n=document.querySelector('#t21-f3-b243-source-aim-line');
   const game=window.__t21F3?.snapshot?.();
   if(!n||!game)return null;
   return {nativeTick:game.tick,
    aimKind:n.dataset.t21B243AimLineKind,
    actualSourceOwner:n.dataset.t21B481OriginalOwner??'OFF',
    originalOwnerTick:n.dataset.t21B481NativeTick??'-1',
    aimingNotImpact:n.dataset.t21B481AimingNotImpact,
    officialWinner:n.dataset.t21B481OfficialWinner,
    displayed:n.textContent,
    sourceScoreable:game.sourceScoreablePromotions,
    productionAuthorized:game.productionAuthorized,
    nativeCpu7:game.cpu?.physicalRejoins?.length};
  })()`);
  if(!b481||!['OFF','OWN','NEUTRAL','OPPONENT'].includes(
      b481.actualSourceOwner)||b481.aimingNotImpact!=='true'||
     b481.officialWinner!=='NONE'||b481.sourceScoreable!==0||
     b481.productionAuthorized!==false||b481.nativeCpu7!==7||
     (b481.actualSourceOwner!=='OFF'&&
      (b481.aimKind!=='SOURCE_PAINT'||
       !b481.displayed.includes('AIM ONLY / UNSCORED'))))
    fail('B481_REAL_SOURCE_CROSSHAIR_OWNER_CANNOT_BE_FABRICATED');
  proof.b481RealSourceAimInkReadOnly={
   ...b481,gameplayWrites:0,certifiedPaintImpacts:0,
   certifiedOriginalOpponentCrossings:0,officialWinner:'NONE'};
  save();
 }
 if(b441Experiment){
  // B475: CDP mouse is real human pointer-locked input, never a scripted
  // projectile, enemy movement, hit, score or simulation clock injection.
  const beforeShot=await snap();authority(beforeShot);
  const pressedAtTick=beforeShot.tick;
  let pressed=false,shot=null,latestRealMouseSample=null;
  try{
   await cdp('Input.dispatchMouseEvent',{
    type:'mousePressed',x:800,y:450,button:'left',buttons:1,clickCount:1});
   pressed=true;
   try{
    shot=await until(async()=>{
     const n=await snap();authority(n);
     const pointerLocked=await locked();
     latestRealMouseSample={
      nativeTick:n.tick,realTickDelta:n.tick-pressedAtTick,
      actualHumanShots:n.shotsFired,realCpuCount:n.cpu.physicalRejoins.length,
      nativeState:n.matchState,paused:n.paused,pointerLocked
     };
     // Genuine SwiftShader may be slow. Original native +6 and real
     // projectile acceptance remain mandatory, never synthesize a shot.
     if(n.tick<pressedAtTick||n.matchState!=='PLAYING'||n.paused||
        !pointerLocked||n.cpu.physicalRejoins.length!==7)
      fail('B475_REAL_NATIVE_MOUSE_INPUT_INTERRUPTED');
     return n.tick>=pressedAtTick+6&&
      n.shotsFired>beforeShot.shotsFired?n:false;
    },45000,250);
   }catch(error){
    proof.b475NativeMouseShotHold={
     source:'25/17/26/0',input:'REAL_CDP_MOUSE_PRESSED',
     firstNativeTick:pressedAtTick,
     initialHumanShots:beforeShot.shotsFired,
     lastObserved:latestRealMouseSample,
     nativeClockWrites:0,actorWrites:0,scoreWrites:0,
     syntheticShots:0,reason:String(error)
    };
    save();throw error;
   }
  }finally{
   if(pressed)await cdp('Input.dispatchMouseEvent',{
    type:'mouseReleased',x:800,y:450,button:'left',buttons:0,clickCount:1});
  }
  if(!shot||shot.paused||shot.matchState!=='PLAYING'||
     !await locked()||shot.b367RealCpuLifecycleEvidence?.enabled!==true||
     shot.shotsFired<=beforeShot.shotsFired||
     shot.sourceScoreablePromotions!==0)
    fail('B475_ACTUAL_PLAYER_POINTER_SHOT_NOT_NATIVE');
  // F3 genuine player feedback acceptance in the SAME real Chromium
  // world. This validates the real B356 reader, not the scripted act of
  // shooting, and never credits a shot as paint or an opponent HP hit.
  proof.b475RealMouseAccepted={
   genuineChromeMouse:true,firstNativeTick:pressedAtTick,
   lastShotNativeTick:shot.tick,previousHumanShots:beforeShot.shotsFired,
   realHumanShots:shot.shotsFired,realCpuCount:shot.cpu.physicalRejoins.length,
   source:'25/17/26/0',actorWrites:0,clockWrites:0,scoreWrites:0,
   cpuHpHitCertified:false,officialWinner:'NONE'
  };
  proof.stage='REAL_MOUSE_SHOT_ACCEPTED_B356_PENDING';save();
  let impactCue;
  try{
   impactCue=await until(async()=>evaluate(`(() => {
   const e=document.querySelector('#t21-f3-b356-real-source-reticle');
   const n=window.__t21F3?.snapshot?.();
   if(!e||!n)return null;
   const mode=e.dataset.t21B356LastRealCueMode??'';
   const eventTick=Number(e.dataset.t21B356LastRealCueNativeTick);
   if(!mode||!Number.isSafeInteger(eventTick))return null;
   return {enabled:e.dataset.t21B356NativeSourceFeedbackEnabled,
    lastMode:mode,lastNativeTick:eventTick,
    gameTick:n.tick,actualShotCount:n.shotsFired,
    humanChangedImpactCount:n.b23HumanInkFeedback?.humanChangedImpactCount,
    lastImpactChangedCells:n.b23HumanInkFeedback?.lastImpactChangedCells,
    genuineHumanCpuHits:n.humanCpuDirectHits,
    sourceSolids:n.originalSourceSolids,
    originalPaint:n.originalPaintSurfaces,
    originalLinks:n.originalSourceNavigationLinks,
    originalScoreable:n.sourceScoreablePromotions,
    actualVisible:!e.hidden&&getComputedStyle(e).display!=='none',
    officialWinner:n.officialWinner??'NONE'};
  })()`),25000,250);
  }catch(error){
   let state=null;
   try{
    state=await evaluate(`(() => {
     const e=document.querySelector('#t21-f3-b356-real-source-reticle');
     const n=window.__t21F3?.snapshot?.();
     return {nativeTick:n?.tick??null,humanShots:n?.shotsFired??null,
      exists:!!e,lastMode:e?.dataset.t21B356LastRealCueMode??null,
      lastCueTick:e?.dataset.t21B356LastRealCueNativeTick??null,
      matchState:n?.matchState??null,paused:n?.paused??null,
      scoreable:n?.sourceScoreablePromotions??null};
    })()`);
   }catch{/* Preserve original timeout and already accepted real shot. */}
   proof.b356NativeHudHold={realShot:proof.b475RealMouseAccepted,
    lastRealDom:state,reason:String(error),nativeClockWrites:0,
    actorWrites:0,scoreWrites:0};save();throw error;
  }
  if(!impactCue||impactCue.enabled!=='true'||
     !['ACTUAL_SHOT_ONLY','REAL_PAINT'].includes(impactCue.lastMode)||
     impactCue.lastNativeTick<pressedAtTick||
     impactCue.lastNativeTick>impactCue.gameTick||
     impactCue.actualShotCount<=beforeShot.shotsFired||
     impactCue.sourceSolids!==25||impactCue.originalPaint!==17||
     impactCue.originalLinks!==26||impactCue.originalScoreable!==0||
     (impactCue.lastMode==='REAL_PAINT'&&
      !(impactCue.humanChangedImpactCount>0&&
        impactCue.lastImpactChangedCells>0)))
    fail('F3_REAL_NATIVE_PLAYER_SHOT_PAINT_CUE_NOT_OBSERVED');
  proof.nativePlayerShotPaintHud={
   ...impactCue,realMouseInput:true,
   paintIsNotCpuHpHit:true,notOfficialScoring:true,
   originalPhysicsAndTickWrites:0,
   appliedOnNormalSourceUrlWithoutB356Experiment:
    !query.includes('t21W10B356='),officialWinner:'NONE'};
  save();
  // B483: genuine real Chromium C key in the SAME B441 human game.
  // Observe pre-existing B471 original Recast/Rapier-approved A1 goal.
  const baselineOrder=shot.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
  if(!baselineOrder||baselineOrder.genuineKeyRequests!==0||
     shot.cpu.sourcePatrol.b137AllyRallyOptIn!==true||
     shot.cpu.sourcePatrol.b150AllySupportInkOptIn!==true)
   fail('B483_TRUE_SOURCE_A1_SUPPORT_NOT_ENABLED');
  await tapSourceCameraKey('c','KeyC',67);
  const realKey=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||
      n.cpu.physicalRejoins.length!==7||!await locked())
    fail('B483_ACTUAL_SOURCE_PLAYER_INTERRUPTED');
   const order=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return order?.genuineKeyRequests>baselineOrder.genuineKeyRequests?
    {n,order}:null;
  },15000,120);
  const realGoal=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.strictlyApprovedOriginalGoals>=1&&
     o?.actualNativeGoalRequests>=1?{n,o}:null;
  },25000,300);
  if(realGoal.o.officialWinner!=='NONE'||
     realGoal.o.actorInkScoreClockWrites!==0||
     realGoal.o.strictlyApprovedOriginalGoals<1||
     realGoal.o.actualNativeGoalRequests<1||
     realGoal.n.sourceScoreablePromotions!==0)
    fail('B483_FALSE_NATIVE_C_KEY_GOAL_CERTIFICATION');
  proof.b483RealPlayerCKeyNativeA1={
   actualChromeKeyC:true,genuineKeyRequests:realKey.order.genuineKeyRequests,
   firstActualNativeTick:realKey.n.tick,
   approvedGoals:realGoal.o.strictlyApprovedOriginalGoals,
   issuedTrueOriginalCrowdGoals:realGoal.o.actualNativeGoalRequests,
   originalAllyFoot:realGoal.o.approvedRealAllyFoot,
   actualSourceGoal:realGoal.o.approvedOriginalGoal,
   goalObservedNativeTick:realGoal.n.tick,
   originalArrivalAlreadyCertified:false,
   originalOpponentRoutesCertified:false,officialWinner:'NONE',
   actorInkScoreClockWrites:0,syntheticCombatWrites:0,
   distinctFromCoopMission:true};
  save();
  // B485: actual first native B471 ARRIVED must precede a second
  // physical player key. Never spam C or overwrite the moving Crowd.
  const firstArrival=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   if(n.paused||n.matchState!=='PLAYING'||
      n.cpu.physicalRejoins.length!==7||!await locked())
    fail('B485_ORIGINAL_PLAYER_INTERRUPTED_BEFORE_ARRIVAL');
   return o?.status==='ARRIVED'&&o.actualOriginalArrivals>=1&&
    o.b485RepeatReady===true?{n,o}:null;
  },60000,200);
  // Real CDP C key UP/DOWN with actual pointer-lock input, no synthetic
  // goal or tick injection. A1's previous B471 status is ARRIVED.
  await tapSourceCameraKey('c','KeyC',67);
  const secondKey=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   if(n.paused||n.matchState!=='PLAYING'||!await locked())
    fail('B485_SECOND_ORIGINAL_PLAYER_INTERRUPTED');
   return o?.genuineKeyRequests===2?{n,o}:null;
  },15000,150);
  // A second audited goal is a separate achievement; if none can pass,
  // retain the genuine HOLD instead of inventing a path or arrival.
  const secondDecision=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.strictlyApprovedOriginalGoals>=2&&
    o.actualNativeGoalRequests>=2?{n,o,outcome:'SECOND_ORIGINAL_CROWD_GRANTED'}:
    o?.status==='HOLD'||o?.status==='EXPIRED'?
    {n,o,outcome:'SECOND_ORIGINAL_SAFETY_HOLD'}:null;
  },30000,250);
  if(secondDecision.n.sourceScoreablePromotions!==0||
     secondDecision.o.officialWinner!=='NONE'||
     secondDecision.o.actorInkScoreClockWrites!==0||
     secondKey.o.genuineKeyRequests!==2||
     firstArrival.o.actualOriginalArrivals<1)
    fail('B485_REPEATED_A1_ORDER_AUTHORITY_CORRUPTED');
  proof.b485TrueSecondPlayerA1Command={
   realChromeCKeyCount:2,actualFirstArrivalTick:firstArrival.n.tick,
   firstArrivalOriginalCounter:firstArrival.o.actualOriginalArrivals,
   secondCKeyTick:secondKey.n.tick,
   realNativeSecondOutcome:secondDecision.outcome,
   secondDecisionNativeTick:secondDecision.n.tick,
   actualB471KeyRequests:secondDecision.o.genuineKeyRequests,
   originalApprovedGoalCount:secondDecision.o.strictlyApprovedOriginalGoals,
   actualOriginalCrowdGoalRequests:secondDecision.o.actualNativeGoalRequests,
   secondOriginalGoal:secondDecision.outcome==='SECOND_ORIGINAL_CROWD_GRANTED'?
    secondDecision.o.approvedOriginalGoal:null,
   fakeEnemyHits:0,officialWinner:'NONE',originalCrossTeamCertified:false,
   actorInkPhysicsClockWrites:0
  };
  save();
  proof.b475ActualSourceUserCombat={
   ...proof.b475ActualSourceUserCombat,
   actualChromeMousePressed:true,actualRealSourceWeaponShotCount:
    shot.shotsFired-beforeShot.shotsFired,
   actualShotNativeTick:shot.tick,originalPlayerKccUnchanged:true,
   actualPhysicalCpuPatrol:true,syntheticCombatEvents:0,
   humanCpuHitsNotFabricated:true,
   sourceCpuHitsObservedNotRequired:shot.humanCpuDirectHits,
   officialWinner:'NONE'};
  save();
 }
 if(b441Experiment){
  // B441 has to prove the actual SOURCE CPU goal selector, not merely
  // the candidate generator passing its pure unit tests. No fake route,
  // hostile actor teleport, scoring or certified opposing-team encounter.
  const startPatrol=after.cpu.sourcePatrol;
  if(!startPatrol?.b441Enabled)fail('B441_NOT_ACTUALLY_SELECTED');
  const validateB445=(patrol)=>{
   const entries=patrol?.b445OriginalFrontlineGates;
   if(!Array.isArray(entries)||entries.length!==6||
      new Set(entries.map(x=>x.id)).size!==6)
    fail('B445_MISSING_REAL_CPU_GATE_INVENTORY');
   for(const g of entries){
    if(!['A2','A3','B1','B2','B3','B4'].includes(g.id)||
       !Array.isArray(g.actualOriginalLanding)||
       g.actualOriginalLanding.length!==3||
       !g.actualOriginalLanding.every(Number.isFinite)||
       !Array.isArray(g.approvedOriginalGoals)||
       g.approvedOriginalGoals.length!==g.strictlyApprovedGoals||
       !g.approvedOriginalGoals.every(p=>Array.isArray(p)&&
        p.length===3&&p.every(Number.isFinite)&&
        Math.abs(p[2])>=33)||
       !Number.isSafeInteger(g.originalFloorProposals)||
       !Number.isSafeInteger(g.inspectedProposals)||
       g.inspectedProposals<0||
       g.inspectedProposals>g.originalFloorProposals||
       g.inspectedProposals!==g.rejectedOriginalRapierOrBoundary+
        g.rejectedNativeRecastOrOriginalPath+g.strictlyApprovedGoals||
       g.rejectedNativeRecastOrOriginalPath!==
        g.rejectedNativeUnreached+g.rejectedNativeStartSnap+
        g.rejectedNativeEndSnap+
        g.rejectedNativeIntermediateOriginalSupport||
       g.runtimeChooseInvocations<g.runtimeNoOriginalFrontGoals||
       g.runtimeChooseInvocations<0||g.runtimeTrueOriginalGoalRequests<0)
     fail('B445_FORGED_OR_UNACCOUNTED_CPU_GATE');
   }
   return entries;
  };
  // B489 one existing real 720-tick A3 paint outcome. The native
  // PaintCoordinator's ACCEPTED per-CPU raster outcomes are already
  // recorded by the actual game in B154 (even when coordinatedMode=false).
  // No fake CPU paint, inferred projectile or scoring event is possible.
  const realA3Paint=n=>{
   const actor=n.b154NativeSevenCpuInk?.byActor?.A3;
   const shots=n.cpuSourceTurfShotsByActor?.A3;
   const keys=['stampEvents','changedCells','impactEvents',
    'impactChangedCells','footChangedCells'];
   if(n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
      n.originalSourceNavigationLinks!==26||
      n.sourceScoreablePromotions!==0||
      n.b154NativeSevenCpuInk?.source!==
       'REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'||
      !actor||!keys.every(k=>
       Number.isSafeInteger(actor[k])&&actor[k]>=0)||
      !Number.isSafeInteger(shots)||shots<0||
      actor.impactChangedCells>actor.changedCells||
      actor.footChangedCells>actor.changedCells)
    fail('B489_REAL_A3_ACCEPTED_PAINT_PROVENANCE_UNAVAILABLE');
   return {tick:n.tick,shots,stampEvents:actor.stampEvents,
    changedCells:actor.changedCells,impactEvents:actor.impactEvents,
    impactChangedCells:actor.impactChangedCells,
    footChangedCells:actor.footChangedCells};
  };
  const firstA3Paint=b448Experiment?realA3Paint(after):null;
  // P2 is genuine B441-only player experience. Read-only BEFORE and
  // AFTER snapshots: helper proposal, native accepted aim and an actual
  // projectile/changed ownerGrid are separate and must never be conflated.
  const firstP2Outer=b441Experiment?
   after.b216RealNativePaintBackfill:null;
  if(b441Experiment&&(
    firstP2Outer?.enabled!==true||
    firstP2Outer.p2OriginalOuterSelected!==true||
    !Number.isSafeInteger(firstP2Outer.p2OriginalOuterSearches)||
    !Number.isSafeInteger(firstP2Outer.p2NativeSightApprovedOuterAims)))
   fail('P2_NATIVE_ORIGINAL_OUTER_AIM_NOT_ACTUALLY_ENABLED');
  const firstRead={tick:after.tick,patrol:startPatrol,
   b445FirstOriginalGateByCpu:validateB445(startPatrol),
   actors:after.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot,
    rejoined:c.rejoined,lifeState:c.lifeState}))};
  const realApprovedTargets=n=>{
   const targets=n.cpu.sourcePatrol?.b442LastApprovedRealFrontTargets;
   if(!Array.isArray(targets)||targets.length>6)
    fail('B442_NO_REAL_SOURCE_GOAL_WITNESS');
   const seen=new Set();
   const actorMap=new Map(n.cpu.cpu.map(c=>[c.id,c.physicalFoot]));
   for(const v of targets){
    const f=actorMap.get(v.id);
    if(seen.has(v.id)||!f||!Array.isArray(v.target)||
       v.target.length!==3||!v.target.every(Number.isFinite)||
       !Array.isArray(v.physicalFoot)||v.physicalFoot.length!==3||
       !v.physicalFoot.every(Number.isFinite)||
       v.originalRegisteredSourceOnly!==true||
       !Number.isSafeInteger(v.lastApprovedNativeTick)||
       v.lastApprovedNativeTick>n.tick||
       Math.abs(v.target[2])<33||
       ![0,1,2].every(i=>Math.abs(v.physicalFoot[i]-f[i])<.001)||
       !Number.isFinite(v.distanceXZ)||!Number.isFinite(v.distance3D)||
       Math.abs(v.distanceXZ-
        Math.hypot(v.target[0]-f[0],v.target[2]-f[2]))>.001||
       Math.abs(v.distance3D-
        Math.hypot(v.target[0]-f[0],v.target[1]-f[1],
         v.target[2]-f[2]))>.001||
       v.distance3D+.001<v.distanceXZ)
     fail('B442_FAKE_OR_STALE_NATIVE_GOAL_WITNESS');
    seen.add(v.id);
   }
   return targets;
  };
  proof.b441NativeEvidence={phase:'OBSERVING_REAL_CPU',firstRead,
   realFrames:[],source:'25/17/26/0',
   b442TargetObservationOnly:true,
   b442TargetFramesWitnessed:0,
   intendedRealNativeTicks:nativeFrontObservationTicks,
   proposedOnlyNotCapsuleProof:true,actorWrites:0,scoreWrites:0,
   nativeClockWrites:0,naturalOpposingTeamRouteCertified:false,
   verdict:'HOLD'};save();
  const baseline=Object.fromEntries(firstRead.actors.map(a=>[a.id,a.foot]));
  const actual=await until(async()=>{
   const n=await snap();authority(n);
   if(n.paused||n.matchState!=='PLAYING'||
      n.cpu.physicalRejoins.length!==7||await origin()!==proof.browserOrigin)
    fail('B441_SOURCE_INTERRUPTED');
   const approvedGoals=realApprovedTargets(n);
   const data={tick:n.tick,available:n.cpu.sourcePatrol?.b441StrictGoalsAvailable,
    requested:n.cpu.sourcePatrol?.b441ActualGoalRequests,
    frontZ:n.cpu.sourcePatrol?.b441ClosestApprovedFrontAbsZ,
    physicalFeet:n.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot,
     rejoined:c.rejoined})),
    b442RealApprovedOriginalGoals:approvedGoals};
   if(proof.b441NativeEvidence.realFrames.length<40&&
     (!proof.b441NativeEvidence.realFrames.length||
      n.tick-proof.b441NativeEvidence.realFrames.at(-1).tick>=24)){
    proof.b441NativeEvidence.realFrames.push(data);
    if(approvedGoals.length)
     proof.b441NativeEvidence.b442TargetFramesWitnessed++;
    save();
   }
   return n.tick>=after.tick+nativeFrontObservationTicks?n:false;
  },600000,500);
  // K2: per-actor outcome from the EXISTING genuine PaintCoordinator and
  // actual CPU shot requests, observed in this SAME untouched 7-CPU world.
  // A proposed aim, accepted request, foot ink and projectile-impact ink
  // are separate outcomes; never count one as proof of another.
  const k2Ids=['A1','A2','A3','B1','B2','B3','B4'];
  const k2Read=(n)=>{
    const ink=n.b154NativeSevenCpuInk;
    const shots=n.cpuSourceTurfShotsByActor;
    if(n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
       n.originalSourceNavigationLinks!==26||
       n.sourceScoreablePromotions!==0||n.matchState!=='PLAYING'||
       n.stopReason||n.cpu.physicalRejoins.length!==7||
       ink?.source!=='REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'||
       !shots||!ink.byActor)
      fail('K2_ACTUAL_SEVEN_CPU_PAINT_PROVENANCE_NOT_AVAILABLE');
    const byActor={};
    for(const id of k2Ids){
      const a=ink.byActor[id],shot=shots[id];
      if(!a||![shot,a.stampEvents,a.changedCells,a.impactEvents,
        a.impactChangedCells,a.footChangedCells].every(x=>
         Number.isSafeInteger(x)&&x>=0)||
         a.impactChangedCells+a.footChangedCells>a.changedCells)
        fail('K2_INVALID_OR_MISSING_REAL_CPU_INK_COUNTER_'+id);
      byActor[id]={sourceTurfShotRequests:shot,
       acceptedPaintEvents:a.stampEvents,changedCells:a.changedCells,
       impactEvents:a.impactEvents,
       impactChangedCells:a.impactChangedCells,
       footChangedCells:a.footChangedCells};
    }
    return {tick:n.tick,byActor,
     sourceInkResource:n.b178SourceInkRecovery,
     nativeCpuShots:n.cpuShots,nativeCpuProjectilePaintHits:
      n.cpuProjectilePaintHits,allCpuChangedCells:n.cpuInkCellsChanged,
     cpuImpactChangedCells:n.cpuImpactInkCellsChanged};
  };
  const k2First=k2Read(after),k2Last=k2Read(actual);
  if(k2Last.tick<=k2First.tick||k2Last.tick-k2First.tick<600||
     await origin()!==proof.browserOrigin)
    fail('K2_NOT_SAME_LIVE_NATIVE_OBSERVATION_WINDOW');
  const k2Actors=Object.fromEntries(k2Ids.map(id=>{
    const initial=k2First.byActor[id],final=k2Last.byActor[id];
    const delta=Object.fromEntries(Object.keys(initial).map(k=>
     [k,final[k]-initial[k]]));
    if(Object.values(delta).some(v=>v<0))
      fail('K2_REAL_CPU_COUNTER_WENT_BACKWARDS_'+id);
    return [id,delta];
  }));
  const k2Sum=(name)=>k2Ids.reduce((n,id)=>n+k2Actors[id][name],0);
  const k2TotalImpacts=k2Sum('impactChangedCells');
  const k2TotalPaint=k2Sum('changedCells');
  proof.k2PerActorNativeShotAndInk={
    source:'25/17/26/0',sameUnmodifiedSourceWorld:true,
    originalActorOrColliderWrites:0,syntheticShots:0,
    beforeNativeTick:k2First.tick,afterNativeTick:k2Last.tick,
    nativeTicksObserved:k2Last.tick-k2First.tick,
    byActor:k2Actors,
    actualPaintByActors:k2Ids.filter(id=>k2Actors[id].changedCells>0),
    actualProjectileImpactInkByActors:k2Ids.filter(id=>
     k2Actors[id].impactChangedCells>0),
    realSourceTurfShotRequestActors:k2Ids.filter(id=>
     k2Actors[id].sourceTurfShotRequests>0),
    totalCpuShotRequests:k2Sum('sourceTurfShotRequests'),
    totalCpuAcceptedPaintChangedCells:k2TotalPaint,
    totalCpuActualImpactChangedCells:k2TotalImpacts,
    zeroProjectileInkActors:k2Ids.filter(id=>
     k2Actors[id].impactChangedCells===0),
    verdict:k2Ids.every(id=>k2Actors[id].impactChangedCells>0)?
     'PASS_SEVEN_REAL_CPU_PROJECTILE_INK':
     'HOLD_NOT_ALL_SEVEN_HAVE_REAL_PROJECTILE_INK',
    nativeCountersStart:k2First,nativeCountersEnd:k2Last,
    enemyContactCertified:false,sourceScoreable:0,
    officialWinner:'NONE',formal4v4Certified:false
  };
  save();
  console.log('K2_NATIVE_SEVEN_ACTUAL_CPU_PAINT_OUTCOME',
   JSON.stringify({verdict:proof.k2PerActorNativeShotAndInk.verdict,
    byActor:k2Actors,from:k2First.tick,to:k2Last.tick,
    sourceInkBefore:k2First.sourceInkResource,
    sourceInkAfter:k2Last.sourceInkResource}));
  // B491: one pre-approved, bounded genuine seven-CPU SOURCE world.
  // Compare real PaintCoordinator impact changes and actual CPU resource
  // gains AFTER all seven rejoin. No extra game, virtual tick, actor
  // relocation, ink injection or official score. Existing B441 still
  // runs unchanged when this explicit flag is absent.
  if(b491PaidCpuOnce){
   const start=k2First.sourceInkResource,last=k2Last.sourceInkResource;
   const realIds=k2Ids;
   const ownTicks=last?.actualOwnPaintFootTicks-
    start?.actualOwnPaintFootTicks;
   const recovered=Number((
    last?.b179ActuallyRecoveredOwnSourceInk-
    start?.b179ActuallyRecoveredOwnSourceInk).toFixed(6));
   const refillTicks=last?.b179OwnInkNativeRecoveryTicks-
    start?.b179OwnInkNativeRecoveryTicks;
   const exactZeroFoot=realIds.every(id=>
    k2First.byActor[id]?.footChangedCells===0&&
    k2Last.byActor[id]?.footChangedCells===0&&
    k2Actors[id]?.footChangedCells===0);
   const perActor=realIds.map(id=>({
    id,...k2Actors[id],
    noUnpaidFootStamp:
     k2First.byActor[id]?.footChangedCells===0&&
     k2Last.byActor[id]?.footChangedCells===0
   }));
   const authoritative=k2Last.tick-k2First.tick>=600&&
    k2Last.tick-k2First.tick<=900&&
    start?.enabled===true&&last?.enabled===true&&
    Number.isSafeInteger(ownTicks)&&ownTicks>0&&
    Number.isFinite(recovered)&&recovered>0&&
    Number.isSafeInteger(refillTicks)&&refillTicks>0&&
    k2TotalImpacts>0&&exactZeroFoot&&
    k2Ids.every(id=>k2Actors[id].impactChangedCells>0&&
     k2Actors[id].sourceTurfShotRequests>0)&&
    proof.actorWrites===0&&proof.nativeClockWrites===0&&
    proof.scoreWrites===0&&proof.sourceGeometryWrites===0&&
    proof.full180sCertified===false&&
    await origin()===proof.browserOrigin;
   proof.b491RealCpuPaidOwn={
    schema:'B491_TRUE_CHROMIUM_SEVEN_CPU_PAID_OWN_RECOVERY_V1',
    source:'25/17/26/0',sameOriginalBrowserWorld:true,
    firstNativeTick:k2First.tick,lastNativeTick:k2Last.tick,
    nativeTicks:k2Last.tick-k2First.tick,
    physicalSevenCpuRejoins:actual.cpu.physicalRejoins.length,
    actualAcceptedProjectileCells:k2TotalImpacts,
    cpuRealWeaponShotRequests:k2Sum('sourceTurfShotRequests'),
    ownInkContactNativeTicks:ownTicks,
    actuallyRecoveredOwnSourceInk:recovered,
    ownInkRealRecoveryNativeTicks:refillTicks,
    zeroUnpaidFootStampEvents:exactZeroFoot,
    perActor,originalScoreable:0,officialWinner:'NONE',
    naturalOpponentRouteCertified:false,formal4v4Certified:false,
    replayCertified:false,actorWrites:0,inkWrites:0,
    nativeClockWrites:0,sourceGeometryWrites:0,
    verdict:authoritative?
     'PASS_LIMITED_REAL_7CPU_PAID_IMPACT_OWN_RECOVERY':
     'HOLD_NO_PAID_ORIGINAL_SOURCE_OWN_RECOVERY'};
   save();
   if(!authoritative)fail('B491_REAL_NATIVE_PAID_SEVEN_CPU_OWN_HOLD');
   const image=await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false});
   const bytes=Buffer.from(image?.data??'','base64');
   if(bytes.length<10000||bytes.subarray(0,8).toString('hex')!==
      '89504e470d0a1a0a'||bytes.readUInt32BE(16)!==1600||
      bytes.readUInt32BE(20)!==900)
    fail('B491_NO_REAL_CHROMIUM_FRAMEBUFFER');
   const filename='b491-actual-seven-cpu-paid-source-ink.png';
   writeFileSync(resolve(out,filename),bytes);
   proof.b491RealCpuPaidOwn.screenshot={
    file:filename,width:1600,height:900,
    sha256:createHash('sha256').update(bytes).digest('hex')};
   save();
   console.log('B491_LIMITED_REAL_NATIVE_CPU_PAID_OWN_OUTCOME',
    JSON.stringify(proof.b491RealCpuPaidOwn));
  }
  // B454: collect every *actual* native post-KCC B2/B4 foot once,
  // rather than inferring continuous original contact from 24-tick polls.
  // Do not add these large rows to B440 log; save one independent Artifact.
  const b454Native=await evaluate('window.__t21F3.b454OriginalCpuFootTrace()');
  if(b454Native?.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
     b454Native.source!=='25/17/26/0'||
     b454Native.originalKccOrGameWrites!==0||
     b454Native.originalPathAuthorizationChanged!==false||
     b454Native.continuousCapsuleContactCertified!==false||
     b454Native.b2b4FrontlineGoalCertified!==false||
     b454Native.dropped?.B2!==0||b454Native.dropped?.B4!==0||
     !Array.isArray(b454Native.rows?.B2)||
     !Array.isArray(b454Native.rows?.B4)||
     b454Native.rows.B2.length<700||b454Native.rows.B4.length<700||
     await origin()!==proof.browserOrigin)
   fail('B454_FALSE_OR_MISSING_NATIVE_PER_TICK_FOOT_PROVENANCE');
  const b454Report={...b454Native,browserWorldOrigin:proof.browserOrigin,
    originalSourceGeometryWrites:0,actorWrites:0,scoreWrites:0,
    nativeClockWrites:0};
  writeFileSync(resolve(out,'b454-native-b2-b4-physical-60hz.json'),
    JSON.stringify(b454Report,null,2)+'\n');
  proof.b441NativeEvidence.b454FullRatePhysicalFootRecorded={
    B2:b454Native.rows.B2.length,B4:b454Native.rows.B4.length,
    dropped:{...b454Native.dropped},
    continuousKccRouteCertified:false,originalScoreable:0};
  // B484: 60 Hz genuine post-C-key A1 physics, not a guessed route.
  const b484=await evaluate('window.__t21F3.b484ActualA1CKeyFollowThrough()');
  const b483=proof.b483RealPlayerCKeyNativeA1;
  if(!b484||b484.schema!=='B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1'||
     b484.source!=='25/17/26/0'||b484.nativeRows<100||
     b484.genuineKeyRequests!==2||b484.approvedOriginalGoals<1||
     b484.actualNativeGoalRequests<1||b484.officialWinner!=='NONE'||
     b484.actorInkPhysicsClockWrites!==0||
     b484.crossTeamRouteCertified!==false||
     b484.originalCapsuleRouteCertified!==false||
     b484.commandCausedAllMovementCertified!==false||
     b484.trueArrivalOnlyFromB471!==true||
     // Both C events are genuine; per-order progress must never inherit
     // the first order's near-zero distance on the second actual key.
     b484.currentOrderKeyRequest!==2||
     !Number.isSafeInteger(b484.currentOrderNativeRows)||
     b484.currentOrderNativeRows<1||
     b484.currentOrderNativeRows>=b484.nativeRows||
     b484.currentOrderArrivalOnlyFromOriginalB471!==true||
     !Array.isArray(b484.currentOrderFirstObservedFoot)||
     b484.currentOrderFirstObservedFoot.length!==3||
     !b484.currentOrderFirstObservedFoot.every(Number.isFinite)||
     !Number.isFinite(b484.currentOrderObservedFootTravelMeters)||
     b484.currentOrderObservedFootTravelMeters<0||
     (b484.currentOrderClosestPhysicalGoalDistanceXZ!==null&&
      (!Number.isFinite(b484.currentOrderClosestPhysicalGoalDistanceXZ)||
       b484.currentOrderClosestPhysicalGoalDistanceXZ<0))||
     (b484.currentOrderApprovedOriginalGoal!==null&&
      (!Array.isArray(b484.currentOrderApprovedOriginalGoal)||
       !b484.currentOrderApprovedOriginalGoal.every(Number.isFinite)))||
     !Array.isArray(b484.originalApprovedGoal)||
     !b484.originalApprovedGoal.every((v,i)=>
      Number.isFinite(v)&&Math.abs(v-
       (proof.b485TrueSecondPlayerA1Command.secondOriginalGoal||
        b483.actualSourceGoal)[i])<.001)||
     !Array.isArray(b484.rows)||b484.rows.length!==b484.nativeRows||
     !b484.rows.every((r,i)=>i===0||r.tick===b484.rows[i-1].tick+1))
    fail('B484_ORIGINAL_A1_NATIVE_FOLLOW_THROUGH_HOLD');
  writeFileSync(resolve(out,'b484-real-source-a1-foot-60hz.json'),
   JSON.stringify(b484,null,2)+'\n');
  proof.b484RealNativeA1CKeyFollowThrough={
   ...Object.fromEntries(Object.entries(b484).filter(([k])=>k!=='rows')),
   file:'b484-real-source-a1-foot-60hz.json',
   nativeActorPositionWrites:0,originalRouteAuthorizationChanged:false,
   officialWinner:'NONE'};
  save();
  // The PLAYER sees the same genuine second C-order progress in the
  // existing actual browser HUD. Do not dispatch synthetic DOM events or
  // claim a route/arrival from the UI text alone.
  const playerOrderHud=await until(async()=>evaluate(`(() => {
   const e=document.querySelector('#t21-f3-b141-real-ally');
   const n=window.__t21F3?.snapshot?.();
   const trace=window.__t21F3?.b484ActualA1CKeyFollowThrough?.();
   if(!e||!n||!trace)return null;
   return {nativeTick:n.tick,matchState:n.matchState,paused:n.paused,
    playerVisible:!e.hidden&&getComputedStyle(e).display!=='none',
    text:e.textContent,
    originalRouteClaim:e.dataset.t21B141CertifiedRoute,
    actualOriginalArrivals:e.dataset.t21B471ActualOriginalArrivals,
    genuineRequests:trace.genuineKeyRequests,
    currentOrderKeyRequest:trace.currentOrderKeyRequest,
    currentOrderClosestPhysicalGoalDistanceXZ:
     trace.currentOrderClosestPhysicalGoalDistanceXZ,
    nativeCpuRejoins:n.cpu?.physicalRejoins?.length,
    sourceScoreable:n.sourceScoreablePromotions};
  })()`),20000,250);
  if(playerOrderHud?.matchState!=='PLAYING'||
     playerOrderHud.paused!==false||
     playerOrderHud.playerVisible!==true||
     playerOrderHud.originalRouteClaim!=='false'||
     playerOrderHud.nativeCpuRejoins!==7||
     playerOrderHud.sourceScoreable!==0||
     playerOrderHud.genuineRequests!==2||
     playerOrderHud.currentOrderKeyRequest!==2||
     !playerOrderHud.text?.includes('A1 C ORDER 2 · ')||
     !playerOrderHud.text.includes('verified arrivals total ')||
     !(
      playerOrderHud.text.includes('this order closest ')||
      playerOrderHud.text.includes('original goal pending / HOLD')
     ))
   fail('B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED');
  proof.b484RealSecondOrderPlayerHud={
   ...playerOrderHud,
   genuineChromiumPlayerText:true,perOrderCounterFromNativePhysics:true,
   certifiedOfficialEnemyEngagement:false,
   certifiedOriginalCrossTeamPath:false,officialWinner:'NONE'};
  save();
  // B486 independent real 60Hz HUMAN and 3-vs-4 CPU proximity proof.
  // Distance is never shot contact, opponent native path or certified 4v4.
  // One JS task freezes the browser's native 60Hz state while all three
  // independent READ-ONLY authority queries are taken. Three separate
  // CDP evaluations let real moving CPUs change the nearest distance by
  // >1mm between B486, B487 and B488, falsely failing strict provenance.
  // This does NOT pause/advance the actual native clock or modify an actor.
  const synchronizedOriginal=await evaluate(`(() => {
   const api=window.__t21F3;
   if(!api)return null;
   const b486=api.b486ActualOriginalEnemyDistances();
   const b487=api.b487ActualOriginalCrossTeamTopology();
   const b488=api.b488OriginalCrossTeamGapDecision();
   return {b486,b487,b488};
  })()`);
  if(!synchronizedOriginal)
   fail('B486_B487_B488_SAME_NATIVE_WORLD_NOT_AVAILABLE');
  const {b486,b487,b488}=synchronizedOriginal;
  if(!b486||
     b486.schema!=='B486_TRUE_ORIGINAL_NATIVE_60HZ_ENCOUNTER_DISTANCE_V1'||
     b486.source!=='25/17/26/0'||b486.rows<100||
     b486.scoreableOriginalSurfaces!==0||
     b486.officialWinner!=='NONE'||
     b486.noActorNavInkPhysicsClockWrites!==true||
     b486.naturalOpponentRouteCertified!==false||
     b486.actualEnemyHpDamageCertified!==false||
     b486.physicallyCloseIsNotAHit!==true||
     b486.physicallyCloseIsNotANativeRoute!==true||
     !Number.isFinite(b486.nearestHumanToEnemy3dMeters)||
     !Number.isFinite(b486.nearestAllyToEnemy3dMeters)||
     !Array.isArray(b486.rows60Hz)||
     b486.rows60Hz.length!==b486.rows||
     !b486.rows60Hz.every((row,i)=>i===0||
      row.tick===b486.rows60Hz[i-1].tick+1))
    fail('B486_ACTUAL_7CPU_SOURCE_PROXIMITY_EVIDENCE_HOLD');
  writeFileSync(resolve(out,'b486-original-human-7cpu-enemy-distance-60hz.json'),
   JSON.stringify(b486,null,2)+'\n');
  proof.b486TrueSourceNaturalEncounterDistance={
   ...Object.fromEntries(Object.entries(b486).filter(([key])=>
    key!=='rows60Hz')),
   raw:'b486-original-human-7cpu-enemy-distance-60hz.json',
   sourceMotionUntouched:true,enemyContactCertified:false,
   nativeRouteNotGranted:true,officialWinner:'NONE'};
  save();
  // B487: 26 original one-way same-side links cannot be promoted into
  // central access. Query current native Recast for each real 3x4 CPU
  // opposing pair PLUS original human foot to 4 opposing actors.
  // The B487 native Recast result was captured above in the SAME
  // browser JS task as the real B486 60Hz proximity evidence.
  if(!b487||
     b487.schema!=='B487_TRUE_ORIGINAL_NATIVE_CROSS_TEAM_TOPOLOGY_V1'||
     b487.source!=='25/17/26/0'||
     b486.lastNativeTick!==b487.nativeTick||
     b487.originalOneWayDropLinks!==26||
     b487.originalFirstDropLinks!==12||
     b487.originalRightSmallDropLinks!==14||
     b487.originalExplicitCrossSideLinks!==0||
     b487.totalOriginalNativePathQueries!==16||
     b487.liveOriginalCpuOpposingPairs!==12||
     b487.liveHumanOpponentPairs!==4||
     b487.naturalCrossTeamPathCertified!==false||
     b487.physicalCapsuleRouteCertified!==false||
     b487.full4v4Certified!==false||
     b487.sourceGeometryOrNavMutations!==0||
     b487.botGoalOrActorWrites!==0||
     b487.inkHitScoreOrClockWrites!==0||
     b487.officialWinner!=='NONE'||
     !Array.isArray(b487.pairs)||b487.pairs.length!==16||
     !b487.pairs.every(x=>x.physicalCapsuleRouteCertified===false)||
     Math.abs(b487.nearestHumanEnemy3dMeters-
       b486.nearestHumanToEnemy3dMeters)>.001||
     Math.abs(b487.nearestAllyEnemy3dMeters-
       b486.nearestAllyToEnemy3dMeters)>.001)
   fail('B487_ORIGINAL_CENTRAL_NATIVE_CONNECTIVITY_NOT_GROUNDED');
  writeFileSync(resolve(out,'b487-real-original-16-cross-team-route-audit.json'),
   JSON.stringify(b487,null,2)+'\n');
  proof.b487OriginalCrossTeamTopology={
   ...Object.fromEntries(Object.entries(b487).filter(
    ([key])=>key!=='pairs')),
   fullEvidenceFile:'b487-real-original-16-cross-team-route-audit.json',
   nativeActorKccOrNavChanged:false,officialWinner:'NONE'};
  save();
  // B488: evidence gate applied to the SAME actual 7-CPU native SOURCE
  // as B486/B487. The archived four local gaps on each side have no
  // individual 7.2.0 Turf collision authority. This is NOT a route grant.
  // Retain exact B488 evidence EVEN on FAIL; an unresolved F4 gap
  // remains HOLD, never an implicitly accepted original floor.
  if(b488)writeFileSync(resolve(out,'b488-real-original-f4-gap-authority-hold.json'),
   JSON.stringify(b488,null,2)+'\n');
  if(!b488||
     b488.schema!=='B488_ORIGINAL_CROSS_TEAM_GAP_AUTHORITY_DECISION_V1'||
     b488.originalSource!=='25/17/26/0'||
     !Number.isSafeInteger(b488.observedNativeTick)||
     b488.observedNativeTick!==b487.nativeTick||
     b488.currentNativeOpposingQueries!==16||
     b488.currentNativeReportedPaths!==b487.nativePathReportedPairs||
     b488.currentNativeCredibleEndpointPairs!==
       b487.nativeCredibleEndpointPairs||
     Math.abs(b488.nearestHumanEnemy3dMeters-
       b486.nearestHumanToEnemy3dMeters)>.001||
     Math.abs(b488.nearestAllyEnemy3dMeters-
       b486.nearestAllyToEnemy3dMeters)>.001||
     b488.archivedAuditCompatible!==true||
     b488.archivedUnresolvedLocalGaps!==8||
     b488.archivedUnresolvedGapsPerSide!==4||
     b488.individuallyProvenOriginalGapCollisionFaces!==0||
     b488.candidateRuntimeStagePromotionAuthorized!==false||
     b488.sourceCollisionFlagFor7_2TurfVerified!==false||
     b488.originalCpuCapsuleContinuousTraversalVerified!==false||
     b488.originalFull4v4Certified!==false||
     b488.officialScoreable!==0||
     b488.officialWinner!=='NONE'||
     b488.actorPhysicsNavMeshInkClockScoreWrites!==0||
     !Array.isArray(b488.nextRequiredEvidence)||
     b488.nextRequiredEvidence.length!==4||
     b488.verdict!=='HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING')
   fail('B488_REAL_NATIVE_GAP_SOURCE_AUTHORITY_PROOF_HOLD');
  proof.b488OriginalCentralGapAuthority={
   ...b488,raw:'b488-real-original-f4-gap-authority-hold.json',
   actualBrowserSource:true,collisionAndNavigationWrites:0,
   certifiedNativeEnemyCrossing:false,officialWinner:'NONE'};
  save();
  // B474: require measured original native Crowd requests AND bounded
  // duplicate suppression in THIS true 720-tick browser, not a pure test.
  // This is research behavior only; no original route or hit promotion.
  const steering=actual.b474NativeSteeringEvidence;
  if(!steering||steering.enabled!==true||
     !Number.isSafeInteger(steering.nativeRequestIssued)||
     steering.nativeRequestIssued<1||
     !Number.isSafeInteger(steering.redundantUnchangedRequestsSuppressed)||
     steering.redundantUnchangedRequestsSuppressed<1||
     steering.noExtraNavOrGameplayAuthority!==true||
     steering.sourceOnly!==true||steering.productionAuthorized!==false)
    fail('B474_NATIVE_SOURCE_DUPLICATE_REQUEST_REDUCTION_UNPROVEN');
  proof.b441NativeEvidence.b474TrueNativeCrowdGoalRefresh={...steering,
   actualNativeTick:actual.tick,
   originalCollisionAuthorizationChanged:false,
   scoreableSurfacePromotions:0};
  const afterPatrol=actual.cpu.sourcePatrol;
  if(b441Experiment){
   const late=actual.b216RealNativePaintBackfill;
   if(!late||late.enabled!==true||
      late.p2OriginalOuterSelected!==true||
      !Number.isSafeInteger(late.p2OriginalOuterSearches)||
      !Number.isSafeInteger(late.p2NativeSightApprovedOuterAims)||
      late.p2OriginalOuterSearches<firstP2Outer.p2OriginalOuterSearches||
      late.p2NativeSightApprovedOuterAims<
       firstP2Outer.p2NativeSightApprovedOuterAims||
      late.p2NativeSightApprovedOuterAims>late.p2OriginalOuterSearches||
      actual.cpu.physicalRejoins.length!==7||
      actual.originalSourceSolids!==25||
      actual.originalPaintSurfaces!==17||
      actual.originalSourceNavigationLinks!==26||
      actual.sourceScoreablePromotions!==0)
    fail('P2_TRUE_NATIVE_OUTER_SOURCE_EVIDENCE_INVALID');
   const searches=late.p2OriginalOuterSearches-
    firstP2Outer.p2OriginalOuterSearches;
   const approved=late.p2NativeSightApprovedOuterAims-
    firstP2Outer.p2NativeSightApprovedOuterAims;
   proof.p2OriginalOuterSourceInk={
    schema:'P2_NATIVE_ORIGINAL_OUTER_PAINT_AIM_ACTUAL_WINDOW_V1',
    source:'25/17/26/0',
    genuineNativeBeforeTick:after.tick,genuineNativeAfterTick:actual.tick,
    nativeTickInterval:actual.tick-after.tick,
    actualSevenOriginalCpu:actual.cpu.physicalRejoins.length,
    before:firstP2Outer,after:late,
    delta:{originalOuterSearches:searches,
      nativeRapierAndRangeApprovedAims:approved},
    verdict:approved>0?
     'PASS_REAL_NATIVE_SOURCE_OUTER_AIM_APPROVAL_ONLY_NOT_SHOT':
     searches>0?
      'HOLD_REAL_OUTER_SEARCH_NO_APPROVED_ORIGINAL_AIM':
      'HOLD_NO_ACTUAL_OUTER_SEARCH_IN_SHORT_SESSION',
    realShotAndChangedInkNotAttributedToOuterAim:true,
    gameplayPositionInkClockShotScoreWrites:0,
    originalGeometryOrNavWrites:0,officialScoreable:0,
    formalOpposing4v4Certified:false,officialWinner:'NONE'
   };
   save();
   console.log('P2_ACTUAL_NATIVE_OUTER_SOURCE_AIM',
    JSON.stringify(proof.p2OriginalOuterSourceInk));
  }
  if(b448Experiment){
   const endA3Paint=realA3Paint(actual);
   if(!firstA3Paint||endA3Paint.tick<=firstA3Paint.tick)
    fail('B489_STALE_REAL_A3_PAINT_INTERVAL');
   const keys=['shots','stampEvents','changedCells','impactEvents',
    'impactChangedCells','footChangedCells'];
   const delta=Object.fromEntries(keys.map(k=>[
    k,endA3Paint[k]-firstA3Paint[k]]));
   if(!Object.values(delta).every(v=>
      Number.isSafeInteger(v)&&v>=0))
    fail('B489_NONMONOTONIC_ACTUAL_A3_PAINT_ACCOUNTING');
   const actualInkImpact=delta.impactEvents>0&&
     delta.impactChangedCells>0;
   proof.b489ActualSourceA3Paint={
    schema:'B489_REAL_NATIVE_A3_ACCEPTED_UNSCORED_INK_DELTA_V1',
    authority:'ACTUAL_CPU_A3_PAINT_COORDINATOR_ACCEPTED_OWNERGRID',
    before:firstA3Paint,after:endA3Paint,delta,
    realNativeIntervalTicks:endA3Paint.tick-firstA3Paint.tick,
    actualImpactInkProduced:actualInkImpact,
    verdict:actualInkImpact?
     'PASS_REAL_A3_PROJECTILE_IMPACT_CHANGED_ORIGINAL_INK':
     'HOLD_NO_A3_PROJECTILE_IMPACT_CHANGED_ORIGINAL_INK',
    cpuPoseWrites:0,syntheticShotWrites:0,gameplayInkWrites:0,
    originalStageWrites:0,officialScoreable:0,
    officialWinner:'NONE',crossTeamRouteCertified:false,
    sourcePaintOpportunityNotFormalTurfScore:true
   };
   save();
   console.log('B489_GENUINE_NATIVE_A3_INK_OUTCOME',
    JSON.stringify(proof.b489ActualSourceA3Paint));
  }
  // Original B443 gameplay state from the SAME genuine 7-CPU native world.
  // These are monotonic LIVE counters only, not a fabricated traversal
  // proof. The rotation path still needs native Rapier/Recast checks.
  const b443Before=firstRead.patrol,b443After=actual.cpu.sourcePatrol;
  const b443Keys=['b443NativeGoalRetentions',
   'b443FirstActualFrontlineArrivals',
   'b443RotationsAfterDwell','b443ReleasedUnsafeOrStalled'];
  if(!b443Before||!b443After||
     !b443Keys.every(k=>Number.isSafeInteger(b443Before[k])&&
      b443Before[k]>=0&&Number.isSafeInteger(b443After[k])&&
      b443After[k]>=b443Before[k])||
     b443After.b443NativeGoalRetentions<=
      b443Before.b443NativeGoalRetentions)
   fail('B443_REAL_NATIVE_LOCK_COUNTERS_NOT_GROUNDED');
  proof.b443RealNativeExistingGoalDwell={
   schema:'B443_REAL_NATIVE_SOURCE_GOAL_DWELL_COUNTERS_V1',
   source:'25/17/26/0',
   initialNativeTick:firstRead.tick,finalNativeTick:actual.tick,
   realSevenCpu:actual.cpu.physicalRejoins.length===7,
   before:Object.fromEntries(b443Keys.map(k=>[k,b443Before[k]])),
   after:Object.fromEntries(b443Keys.map(k=>[k,b443After[k]])),
   delta:Object.fromEntries(b443Keys.map(k=>[
    k,b443After[k]-b443Before[k]])),
   fromActualNativeOriginalSourceTraffic:true,
   readOnly:true,stageGeometryWrites:0,actorWrites:0,
   inkWrites:0,clockWrites:0,scoreWrites:0,
   certifiedContinuousCapsuleTraversal:false,
   certifiedOriginalCollisionFlags:false,
   certifiedCrossTeamRoute:false,officialWinner:'NONE',
   verdict:'PASS_REAL_NATIVE_B443_COUNTERS_NOT_CROSSING_CERTIFICATION'
  };
  save();
  const observed=actual.cpu.cpu.map(c=>{
   const from=baseline[c.id],p=c.physicalFoot;
   return {id:c.id,from,to:p,
    planarMeters:Array.isArray(from)&&Array.isArray(p)?
     Math.hypot(p[0]-from[0],p[2]-from[2]):null,
    frontAbsZ:Math.abs(p[2]),unchangedRealCpuId:true};
  });
  const actualTargets=realApprovedTargets(actual);
  const rows=proof.b441NativeEvidence.realFrames.flatMap(frame=>
   frame.b442RealApprovedOriginalGoals.map(v=>({
    tick:frame.tick,id:v.id,target:v.target,distanceXZ:v.distanceXZ,
    distance3D:v.distance3D,
    verticalDifferenceMeters:Math.abs(v.physicalFoot[1]-v.target[1]),
    actualFoot:v.physicalFoot,lastApprovedTick:v.lastApprovedNativeTick
   })));
  // Genuine physically observed 3D foot->approved goal proximity,
  // never just flat-map XZ. Even 3D proximity is not a true KCC route.
  const closestById=Object.fromEntries(
   ['A2','A3','B1','B2','B3','B4'].map(id=>{
    const owned=rows.filter(r=>r.id===id);
    const best=owned.reduce((m,row)=>Math.min(m,row.distance3D),
     Number.POSITIVE_INFINITY);
    const flatBest=owned.reduce((m,row)=>Math.min(m,row.distanceXZ),
     Number.POSITIVE_INFINITY);
    return [id,{minimumObservedGoalDistanceMeters:
      Number.isFinite(best)?best:null,
     minimumObservedGoalDistanceXZ:
      Number.isFinite(flatBest)?flatBest:null,
     closestObservationCount:owned.length,
     xzFalseProximitySamples:owned.filter(row=>
      row.distanceXZ<=1.5&&row.distance3D>1.5).length,
     arrivedAtRealGoalInSamples:Number.isFinite(best)&&best<=1.5,
     originalRegisteredSupportThroughoutRouteCertified:false}];
   }));
  const observedArrivals=Object.values(closestById).filter(x=>
   x.arrivedAtRealGoalInSamples).length;
  const oldXzOnlyProximities=Object.values(closestById).filter(x=>
   x.minimumObservedGoalDistanceXZ!==null&&
   x.minimumObservedGoalDistanceXZ<=1.5).length;
  proof.b441NativeEvidence={
   ...proof.b441NativeEvidence,phase:'NATIVE_CPU_REAL_WALK_MEASURED',
   b442ActualApprovedNativeTargetsAtFinish:actualTargets,
   b445LastOriginalGateByCpu:validateB445(afterPatrol),
   b446LiveActualCpuFootDryRouteProbes:
    afterPatrol?.b446LivePhysicalFootDryRouteProbes,
   b467RealB2B4LateNativeFootGoalEvidence:
    afterPatrol?.b467RealLateFoot,
   // B470: serialize live gameplay patrol facts, not synthetic targets.
   // These are ownerGrid-ranked, real native reauthorizations only.
   b470RealSameSideInkCoverage:
    afterPatrol?.b470NativeLocalCoverage,
   b448A3RealEvidence:{
    enabled:afterPatrol?.b448A3ResearchEnabled,
    actualOriginalGoalsAuthorized:
     afterPatrol?.b448A3FreshLiveOriginalGoalsAuthorized,
    actualNativeGoalRequests:afterPatrol?.b448A3RealNativeGoalRequests,
    deniedUnsafeOrNoFreshProof:afterPatrol?.b448A3FreshLiveOriginalHolds,
    initialNativeFoot:baseline.A3,
    endingNativeFoot:actual.cpu.cpu.find(c=>c.id==='A3')?.physicalFoot,
    noActorPoseOrClockWrites:true,
    crossTeamPathCertified:false,
    formal4v4Certified:false
   },
   b442ClosestRealGoalDistances:closestById,
   b442ObservedUniqueGoalArrivals:observedArrivals,
   b442ObservedUniqueGoalProximities3D:observedArrivals,
   b442OldXZOnlyNearGoalIds:oldXzOnlyProximities,
   b442FalseXZOnlyGoalSamples:rows.filter(row=>
    row.distanceXZ<=1.5&&row.distance3D>1.5).length,
   b442ArrivalWitnessVerdict:observedArrivals>0?
    'OBSERVED_NATIVE_3D_GOAL_PROXIMITY_NOT_KCC_CERTIFIED':
    'HOLD_NO_OBSERVED_NATIVE_3D_GOAL_PROXIMITY',
   b442ProximityIsNotNativeRouteCertification:true,
   b442Formal4v4Certified:false,
   lastTick:actual.tick,realNativeTicks:actual.tick-after.tick,
   realSevenCpu:true,actualGoalRequests:afterPatrol?.b441ActualGoalRequests,
   strictOriginalGoalsAvailable:afterPatrol?.b441StrictGoalsAvailable,
   closestApprovedFrontAbsZ:afterPatrol?.b441ClosestApprovedFrontAbsZ,
   heldUnsupported:afterPatrol?.b441UnsafeOrUnreachableHolds,
   originalActorFootObservations:observed,
   verdict:afterPatrol?.b441StrictGoalsAvailable>0&&
     afterPatrol?.b441ActualGoalRequests>0?
    'PASS_REAL_FRONT_GOAL_REQUESTS_NOT_CROSSING_OR_COMBAT':
    'HOLD_NO_GENUINE_ORIGINAL_FRONT_GOAL_PROVEN'};
  save();
  if(b448Experiment){
   const evidence=proof.b441NativeEvidence.b448A3RealEvidence;
   const a3=closestById.A3;
   const initial=baseline.A3;
   const end=actual.cpu.cpu.find(c=>c.id==='A3')?.physicalFoot;
   const displacement=Array.isArray(initial)&&Array.isArray(end)?
    Math.hypot(end[0]-initial[0],end[2]-initial[2]):null;
   evidence.nativePlanarDisplacementMeters=displacement;
   evidence.closestOriginalApprovedGoalMeters=
    a3.minimumObservedGoalDistanceMeters;
   evidence.realApprovedGoalSamples=a3.closestObservationCount;
   evidence.verifiedSourceOnlyGoalPass=
    evidence.enabled===true&&
    evidence.actualOriginalGoalsAuthorized===1&&
    evidence.actualNativeGoalRequests>0&&
    a3.closestObservationCount>0&&
    Number.isFinite(displacement)&&displacement>.5;
   if(!evidence.verifiedSourceOnlyGoalPass)
    fail('B448_REAL_A3_NATIVE_ORIGINAL_GOAL_OR_MOVEMENT_HOLD');
  }
  if(proof.b441NativeEvidence.verdict.startsWith('HOLD'))
   fail('B441_NO_REAL_ORIGINAL_FRONT_GOAL_GRANTED');
 }
 if(proveSourcePracticeExpiry){
  // Same genuinely clicked 180-second Chromium round, AFTER the genuine
  // original 720+ tick proof. No clock/actor/paint/DOM injection.
  // The independent 60s objective must naturally TIME_UP at native 60Hz.
  proof.stage='WAITING_REAL_60S_PRACTICE_EXPIRY';save();
  const expiry=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.cpu.physicalRejoins.length!==7||n.player.hp<=0)
    fail('EXPIRY_OBSERVATION_REAL_MATCH_INTERRUPTED');
   const mission=n.b25SourcePaintRun;
   if(mission?.practiceVariant!=='CLASSIC'||
      !['RUNNING','TIME_UP'].includes(mission.status))
    fail('EXPIRY_NOT_REAL_UNFINISHED_CLASSIC');
   if(n.tick>=10500)
    fail('EXPIRY_NO_60S_IN_NATIVE_MATCH');
   return mission.status==='TIME_UP'&&n.timeRemainingSeconds>0&&
      trueOriginalFoot(foot(n))?n:null;
  },720000,800);
  const originalOrder=expiry.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
  if(originalOrder?.genuineKeyRequests!==2||
     expiry.b25SourcePaintRun.elapsedTicks<3600||
     expiry.timeRemainingSeconds<=0||expiry.matchState!=='PLAYING')
   fail('EXPIRY_NOT_SEPARATE_FROM_180S_ROUND');
  const ready=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.b25SourcePaintRun?.status!=='TIME_UP'||
      n.paused||!await locked()||n.player.hp<=0||
      n.cpu.physicalRejoins.length!==7)
    fail('EXPIRY_C_INPUT_AUTHORITY_INTERRUPTED');
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.genuineKeyRequests===2&&o.b485RepeatReady===true&&
    trueOriginalFoot(foot(n))?n:null;
  },30000,250);
  const beforeTick=ready.tick;
  const screenshot=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof screenshot?.data!=='string'||screenshot.data.length<100)
   fail('EXPIRY_REAL_SOURCE_SCREENSHOT_MISSING');
  writeFileSync(resolve(out,'real-practice-60s-timeout-180s-active.png'),
   Buffer.from(screenshot.data,'base64'));
  // Actual pointer-locked Chromium C key, never a test API callback.
  await tapSourceCameraKey('c','KeyC',67);
  const after=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.b25SourcePaintRun?.status!=='TIME_UP'||
      n.cpu.physicalRejoins.length!==7)
    fail('EXPIRY_POST_C_REAL_MATCH_INTERRUPTED');
   const order=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   const acceptance=await evaluate(
    "document.querySelector('#app-canvas')?.dataset.t21B485RealCKeyResult");
   return order?.genuineKeyRequests===3&&
    acceptance==='REAL_ORDER_PENDING_ORIGINAL_RECAST'?
    {n,order,acceptance}:null;
  },15000,180);
  const observable=await until(async()=>{
   const v=await evaluate(`(() => {
   const n=window.__t21F3?.snapshot?.();
   const t=window.__t21F3?.b484ActualA1CKeyFollowThrough?.();
   const h=document.querySelector('#t21-f3-b141-real-ally');
   if(!n||!t||!h)return null;
   return {tick:n.tick,matchState:n.matchState,
    missionStatus:n.b25SourcePaintRun?.status,
    missionElapsed:n.b25SourcePaintRun?.elapsedTicks,
    remainingSeconds:n.timeRemainingSeconds,
    sourceScoreable:n.sourceScoreablePromotions,
    nativeCpuRejoins:n.cpu?.physicalRejoins?.length,
    acceptedOriginalGoals:n.cpu?.sourcePatrol?.
      b471TruePlayerOrderedAlly?.strictlyApprovedOriginalGoals,
    requestCount:n.cpu?.sourcePatrol?.
      b471TruePlayerOrderedAlly?.genuineKeyRequests,
    traceOrder:t.currentOrderKeyRequest,
    traceRows:t.currentOrderNativeRows,
    traceNativeRequests:t.actualNativeGoalRequests,
    traceArrivalOnlyOriginal:t.currentOrderArrivalOnlyFromOriginalB471,
    traceClockWrites:t.actorInkPhysicsClockWrites,
    text:h.textContent,
    visible:!h.hidden&&getComputedStyle(h).display!=='none',
    certifiedRoute:h.dataset.t21B141CertifiedRoute};
  })()`);
   // The app updates the native trace on the following genuine fixed tick.
   // A non-null snapshot is not yet proof that the displayed C order is 3.
   return v?.tick>beforeTick&&v.traceOrder===3&&v.traceRows>=1&&
    v.text?.includes('A1 C ORDER 3 · ')&&
    v.text?.includes(
     '60s PRACTICE TIME UP · 180s SOURCE MATCH CONTINUES')?v:null;
  },15000,250);
  if(!observable||observable.tick<=beforeTick||
     observable.matchState!=='PLAYING'||
     observable.missionStatus!=='TIME_UP'||
     observable.missionElapsed<3600||
     observable.remainingSeconds<=0||
     observable.sourceScoreable!==0||
     observable.nativeCpuRejoins!==7||
     observable.requestCount!==3||
     observable.traceOrder!==3||observable.traceRows<1||
     observable.traceArrivalOnlyOriginal!==true||
     observable.traceClockWrites!==0||
     observable.visible!==true||
     observable.certifiedRoute!=='false'||
     !observable.text?.includes('A1 C ORDER 3 · ')||
     !observable.text.includes(
      '60s PRACTICE TIME UP · 180s SOURCE MATCH CONTINUES'))
   fail('EXPIRY_GENUINE_C_THIRD_ORDER_PLAYER_HUD_NOT_PROVEN');
  proof.realPracticeExpiryLiveC={
   source:'25/17/26/0',sameBrowserOrigin:await origin(),
   naturalObjectiveStatus:expiry.b25SourcePaintRun.status,
   realObjectiveElapsedNativeTicks:expiry.b25SourcePaintRun.elapsedTicks,
   originalPlayerRemainingSecondsAtExpiry:expiry.timeRemainingSeconds,
   realNativeTickBefore:beforeTick,
   realNativeTickAfter:observable.tick,
   thirdGenuineChromiumCKey:true,
   acceptedExistingB471NativeRequest:after.acceptance,
   ...observable,sourceCollisionWrites:0,sourceNavigationWrites:0,
   actorWrites:0,syntheticClockAdvances:0,officialWinner:'NONE',
   opponentNativeCrossingCertified:false,officialTurfScoreCertified:false,
   full180SecondRoundCompletedCertified:false};
  writeFileSync(resolve(out,'real-60s-expiry-third-c-original-180s.json'),
   JSON.stringify(proof.realPracticeExpiryLiveC,null,2)+'\n');
  save();
 }
 if(proveFullSourceReplay){
  // Read-only 180-second native clock, SAME original 7 CPU SOURCE world.
  // No virtual-time tricks, position/tick/actor/ink/score writes, or warps.
  const first=await snap();authority(first);
  const initialOrigin=await origin();
  const initialHref=await evaluate('location.href');
  const weapon=first.b361NativePlayerWeapon?.id;
  const preflightChecks={
   REAL_PLAYING:first.matchState==='PLAYING',
   REAL_UNPAUSED:!first.paused,
   REAL_POINTER_LOCKED:await locked(),
   REAL_7_CPU:first.cpu.physicalRejoins.length===7,
   NO_CPU_RELOCATIONS:first.cpu.physicalFootRelocations===0,
   NATIVE_180_SECOND_CLOCK:first.timeRemainingSeconds<180&&
    first.timeRemainingSeconds>0,
   SAME_SELECTED_HUMAN_KIT:weapon===fullReplayHumanKit,
   EXACT_SELECTED_NATIVE_URL:new URL(initialHref).searchParams.get(
    't21W10B389')===fullReplayHumanKit
  };
  proof.oneShotFullReplayPreflight={
   checks:preflightChecks,observed:{
    source:'25/17/26/0',nativeTick:first.tick,
    remaining:first.timeRemainingSeconds,phase:first.matchState,
    paused:first.paused,cpuRejoins:first.cpu.physicalRejoins.length,
    cpuPhysicalRelocations:first.cpu.physicalFootRelocations,
    realHumanWeapon:weapon,currentUrl:initialHref,
    currentWorldOrigin:initialOrigin
   },actorWrites:0,nativeClockWrites:0,scoreWrites:0
  };
  save();
  const missing=Object.entries(preflightChecks).filter(([,ok])=>!ok)
   .map(([name])=>name);
  if(missing.length)
   fail('FULL_REAL_NATIVE_FIRST_ROUND_PRECONDITION_'+missing.join('_'));
  const full={schema:'T21_ONE_SHOT_REAL_SOURCE_180_REPLAY_V1',
   source:'25/17/26/0',initialOrigin,initialHref,weapon,
   initialTick:first.tick,initialRemaining:first.timeRemainingSeconds,
   nativeClockWrites:0,actorWrites:0,scoreWrites:0,syntheticInput:false,
   officialWinner:'NONE',samples:[],clicked:false,newWorldConfirmed:false};
  proof.oneShotFullReplay=full;
  proof.stage='WAIT_REAL_180_NATIVE_TIME_UP';save();
  let previousTick=first.tick;
  for(const [threshold,label] of [[120,'120'],[60,'60'],[0,'TIME_UP']]){
   let last=null;
   const frame=await until(async()=>{
    const n=await snap();authority(n);
    last={tick:n.tick,remaining:n.timeRemainingSeconds,
     phase:n.matchState,paused:n.paused,
     cpuRejoined:n.cpu.physicalRejoins.length,
     shots:n.shotsFired};
    if(n.tick<previousTick||n.cpu.physicalRejoins.length!==7||
       n.cpu.physicalFootRelocations!==0||
       n.timeRemainingSeconds<0||n.timeRemainingSeconds>180)
     fail('FULL_REAL_NATIVE_SOURCE_TICK_OR_CPU_INVARIANT');
    previousTick=n.tick;
    if(n.timeRemainingSeconds>threshold+.001)return null;
    if(n.matchState!==(threshold===0?'TIME_UP':'PLAYING')||
       (threshold!==0&&n.paused))
     fail('FULL_REAL_NATIVE_CLOCK_PHASE_'+label);
    return n;
   },22*60*1000,1400).catch(error=>{
    full.lastNative=last;full.hold=String(error);save();throw error;
   });
   full.samples.push({label,tick:frame.tick,
    remaining:frame.timeRemainingSeconds,phase:frame.matchState,
    shots:frame.shotsFired,cpuRejoined:frame.cpu.physicalRejoins.length,
    cpuPaint:frame.cpuInkCellsChanged,
    humanPaint:frame.b23HumanInkFeedback?.humanChangedCells??null});
   save();
  }
  const terminal=await snap();authority(terminal);
  full.actualCountdownNativeTicks=
   Math.round((180-first.timeRemainingSeconds)*60)+
   terminal.tick-first.tick;
  if(terminal.matchState!=='TIME_UP'||
     terminal.timeRemainingSeconds!==0||
     full.actualCountdownNativeTicks<10800||
     terminal.cpu.physicalRejoins.length!==7||
     terminal.b361NativePlayerWeapon?.id!==weapon)
   fail('FULL_REAL_TIME_UP_AND_10800_NATIVE_TICKS_NOT_PROVEN');
  proof.stage='REAL_180_TIME_UP_VISIBLE_REPLAY_PENDING';save();
  const visible=await until(async()=>{
   const v=await evaluate(`(() => {
    const modal=document.querySelector('#t21-f3-b59-session-finished');
    const b=document.querySelector('#t21-f3-b59-restart');
    if(!modal||!b)return null;
    const box=b.getBoundingClientRect(),cx=box.left+box.width/2,
     cy=box.top+box.height/2;
    const target=document.elementFromPoint(cx,cy);
    return {modal:!modal.hidden&&getComputedStyle(modal).display!=='none',
     state:modal.dataset.t21B59State,
     button:!b.hidden&&!b.disabled&&getComputedStyle(b).display!=='none',
     hit:target===b||b.contains(target),
     onScreen:box.width>0&&box.height>0&&box.top>=0&&
      box.bottom<=innerHeight,
     mouseUnlocked:document.pointerLockElement===null,
     officialWinner:modal.dataset.t21B59OriginalWinner,
     scoreable:modal.dataset.originalScoreable};
   })()`);
   return v?.modal&&v.state==='FINISHED'&&v.button&&v.hit&&
    v.onScreen&&v.mouseUnlocked&&v.officialWinner==='NONE'&&
    v.scoreable==='0'?v:null;
  },45000,280);
  full.realEndScreen=visible;save();
  const beforeImage=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof beforeImage?.data!=='string'||beforeImage.data.length<100)
   fail('FULL_REAL_180_SCREENSHOT_UNAVAILABLE');
  writeFileSync(resolve(out,'real-180s-time-up-visible-replay.png'),
   Buffer.from(beforeImage.data,'base64'));
  await buttonClick('#t21-f3-b59-restart');
  full.clicked=true;proof.stage='CLICKED_REAL_B59_REPLAY';save();
  let lastPage=null;
  const fresh=await until(async()=>{
   try{
    const v=await evaluate(`(() => {
     const n=window.__t21F3?.snapshot?.();
     return {origin:performance.timeOrigin,href:location.href,
      ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
      n:n?{tick:n.tick,phase:n.matchState,
       seconds:n.timeRemainingSeconds,shots:n.shotsFired,
       cpu:n.cpu.cpu.length,joins:n.cpu.physicalRejoins.length,
       kit:n.b361NativePlayerWeapon?.id,
       solids:n.originalSourceSolids,paint:n.originalPaintSurfaces,
       links:n.originalSourceNavigationLinks,
       scoreable:n.sourceScoreablePromotions}:null};
    })()`);
    lastPage=v;
    return v?.origin>initialOrigin&&v.href===initialHref&&
     v.ready==='READY'&&v.n?.tick===0&&
     v.n?.phase==='STAGING'&&v.n?.seconds===180&&
     v.n?.shots===0&&v.n?.cpu===7&&v.n?.joins===0&&
     v.n?.kit===weapon&&v.n?.solids===25&&v.n?.paint===17&&
     v.n?.links===26&&v.n?.scoreable===0?v:null;
   }catch{return null;}
  },150000,500).catch(error=>{
   full.lastReloadProbe=lastPage;full.hold=String(error);save();
   throw error;
  });
  full.secondWorld=fresh;full.newWorldConfirmed=true;
  proof.full180sCertified=true;proof.genuineReplayClickCertified=true;
  proof.testKind='FULL_REAL_180S_FRESH_SOURCE_WORLD_SAME_WEAPON';
  proof.stage='REAL_180_NATIVE_NEW_WORLD_SAME_WEAPON_CERTIFIED';save();
  const afterImage=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof afterImage?.data!=='string'||afterImage.data.length<100)
   fail('FULL_REAL_REPLAY_NEW_WORLD_SCREENSHOT_UNAVAILABLE');
  writeFileSync(resolve(out,'real-replay-fresh-world-same-weapon.png'),
   Buffer.from(afterImage.data,'base64'));
 }
 

proof.verdict=proveFullSourceReplay?
  'PASS_REAL_NATIVE_180S_TIME_UP_REPLAY_NEW_WORLD_SAME_HUMAN_WEAPON':
  b441Experiment?
  'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING':
  'PASS_FRESH_SOURCE_REAL_HUMAN_KEYW_AND_ORIGINAL_FOOT_NOT_REPLAY';
 if(!proveFullSourceReplay)proof.stage='TRUE_NATIVE_WALK_SUCCESS';
 save();
 console.log('B440_TRUE_SOURCE_NATIVE_HUMAN_WALK',JSON.stringify(proof));
}
try{await main();}catch(e){
 // Capture the first shared K3/short-ink native failure, without restarting
 // the round, changing the actor world, or retrying prior certified K1/K2.
 if(k3IntegratedSource180||p1InkLoopOnce){
  try{
   const n=await snap();
   proof[p1InkLoopOnce?'p1InkLoopFirstFailureRealNative':'k3FirstFailureRealNative']={
    firstError:String(e),tick:n.tick,
    phase:n.matchState,remainingSeconds:n.timeRemainingSeconds,
    stopReason:n.stopReason,
    immutableOriginalSource:[
     n.originalSourceSolids,n.originalPaintSurfaces,
     n.originalSourceNavigationLinks,n.sourceScoreablePromotions],
    human:n.player?.position,
    grounded:n.nativeKccGrounded,
    originalRapierSupport:n.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
    nativeCpuActors:n.cpu?.cpu?.map(c=>({
     id:c.id,lifeState:c.lifeState,rejoined:c.rejoined,
     actualFoot:c.physicalFoot
    }))??[],currentlyActiveRejoins:n.cpu?.physicalRejoins?.length??null,
    genuineCombatReleased:n.cpu?.freeCombatEnabled??null,
    actualShots:n.shotsFired,
    realCpuPaint:n.b154NativeSevenCpuInk?.byActor??null,
    readOnly:true,geometryWrites:0,actorWrites:0,scoreWrites:0,clockWrites:0
   };
  }catch(readError){proof.k3ReadOnlyCaptureError=String(readError).slice(0,350);}
  try{
   const frame=await cdp('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false});
   if(typeof frame?.data==='string'&&frame.data.length>100){
    writeFileSync(resolve(out,'k3-first-error-original-native.png'),
     Buffer.from(frame.data,'base64'));
    proof.k3FirstFailurePng='k3-first-error-original-native.png';
   }
  }catch(imageError){proof.k3ScreenshotCaptureError=String(imageError).slice(0,350);}
 }
 proof.verdict='HOLD';proof.error=String(e);save();
 console.error('B440_REAL_SOURCE_HOLD',String(e));process.exitCode=1;
}finally{
 if(ws){try{ws.close();}catch{}}
 for(const child of children.reverse()){
  try{child.kill('SIGTERM');}catch{}
 }
 if(b490OwnedChromeProfile){
  try{rmSync(b490OwnedChromeProfile,{recursive:true,force:true});}
  catch(e){console.error('B490_OWNED_TEMP_PROFILE_CLEANUP_WARNING',String(e));}
 }
}

