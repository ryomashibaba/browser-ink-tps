#!/usr/bin/env node
/** B139: real original 7-CPU game + physically walked lower-floor A1 ally trial. No time,
 * physics, ink, storage, source geometry or CPU configuration injection. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {sampleB140RealSourcePhysicalTrace} from './t21-w10b140-real-physics-sample.mjs';
import {b313ChooseOriginalActiveAim,b313ObservedRealAimMatch}
 from './t21-b313-actual-original-cell-aim.mjs';
import {RAMP,auditB316RealMovement,
 b316CanAttemptOriginalKccWithoutInkPromotion}
 from './t21-b316-native-human-ramp-walk.mjs';
import {b318NativeOriginalRampInterior,b318OriginalQuadPlanarSignedMargin}
 from './t21-b318-original-ramp-interior.mjs';
import {RAMP_SOLID,b320PlanOriginalTrueRampUphill,b320AuditActualNativeRampAscent,
 b320SourceRampCoordinates} from './t21-b320-original-ramp-uphill-kcc.mjs';
import {b321OriginalRampHighSectionPlan,b321AuditTrueOriginalHigherRamp}
 from './t21-b321-real-upper-ramp-kcc.mjs';
import {b322PlanActualOriginalCrest,b322AuditNativeOriginalCrestExit,
 b322AuditRealOriginalPreCrestBackstep,
 UPPER_FLOOR_SOLID} from './t21-b322-original-ramp-crest.mjs';
import {b324AuditGenuineUpperFloor}
 from './t21-b324-original-upper-floor-continuation.mjs';
import {b326AuditExtendedUpperFloor}
 from './t21-b326-extended-original-upper-floor.mjs';
import {b327CheckGenuinePostClearLowerShot}
 from './t21-b327-original-lower-post-clear-shot.mjs';
import {b328Plan,b328AuditStep}
 from './t21-b328-genuine-a1-native-approach.mjs';
import {b330AuditArmedReplayResume}
 from './t21-b330-replay-armed-resume-guard.mjs';
import {b407RunNativeHumanWave}
 from './t21-b407-native-human-wave.mjs';
import {auditB410OneTrueUpperFloorActiveGame}
 from './t21-b410-upper-original-activity-audit.mjs';
import {b411EnableAfterNativeRealClear,b411NativeHudSample}
 from './t21-b411-native-hud-live-driver.mjs';
import {auditB411RealNativeGameplayFocus}
 from './t21-b411-native-active-round-hud-audit.mjs';
import {b412NativeSquidOwnInkRound,b412AuditNativeActualOriginalInkSwim}
 from './t21-b412-native-original-squid-ink-swim.mjs';
import {b413RealOriginalMainFireBurst,b413ObserveNativeRefill,
 b413AuditFullOriginalShotRefillReshot}
 from './t21-b413-native-source-fire-refill-reshoot.mjs';
import {auditB419NativeReplay}
 from './t21-b419-real-full-round-fresh-replay.mjs';
import {auditB430TrueSecond180s}
 from './t21-b430-full-second-source-round.mjs';

const ROOT='http://127.0.0.1:4198/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-w10b139';
// B139: independent true-Chromium runs with identical real input; only
// the native source-backed A1 rally URL flag differs. Never the default.
const variant=process.env.T21_B139_VARIANT;
if(!['FIXED_DEFAULT','ALLY_RALLY','TEAM_COVERAGE'].includes(variant))
 throw Error('B139_EXPLICIT_VARIANT_REQUIRED');
const allyOptIn=variant!=='FIXED_DEFAULT';
const b154TeamCoverage=variant==='TEAM_COVERAGE';
const b162CoopTrial=process.env.T21_B162_REAL_ALLY_SYNC==='1';
// Reuse existing two authentic B162 playthroughs; first READY prearm only.
const b162ReadyPrearm=process.env.T21_B162_READY_PREARM==='1';
const b194ButtonTrial=process.env.T21_B194_REAL_PLAYER_BUTTON==='1';
const b200ReplayTrial=process.env.T21_B200_REAL_REPLAY==='1';
const b201PauseTrial=process.env.T21_B201_REAL_PAUSE_RESUME==='1';
const b202ControlsTrial=process.env.T21_B202_REAL_CONTROLS==='1';
const b203FullRoundTrial=process.env.T21_B203_REAL_FULL_ROUND==='1';
const b316GenuineRampWalk=process.env.T21_B316_GENUINE_RAMP_WALK==='1';
const b318InteriorWalk=process.env.T21_B318_INTERIOR_RAMP_WALK==='1';
const b320UphillStudy=process.env.T21_B320_TRUE_SOURCE_RAMP_UPHILL==='1';
const b321HigherRamp=process.env.T21_B321_TRUE_UPPER_RAMP_KCC==='1';
const b322RealCrest=process.env.T21_B322_TRUE_CREST_EXIT==='1';
const b324UpperFloor=process.env.T21_B324_REAL_UPPER_FLOOR_CONTINUATION==='1';
const b326ExtendedFloor=process.env.T21_B326_EXTENDED_UPPER_FLOOR==='1';
const b409OneRoute180=process.env.T21_B409_ONE_ROUTE_180S==='1';
const b410RealUpperPlay=process.env.T21_B410_LATE_UPPER_HUMAN==='1';
const b411SourceGameplayHud=
 process.env.T21_B411_COMPACT_SOURCE_HUD==='1';
const b412NativeSquidSwim=
 process.env.T21_B412_REAL_ORIGINAL_SQUID_SWIM==='1';
const b413NativeInkLoop=process.env.T21_B413_REAL_SOURCE_INK_LOOP==='1';
const b419RealReplay=process.env.T21_B419_REAL_REPLAY_SECOND_GAME==='1';
const b430FullSecond180=process.env.T21_B430_REAL_SECOND_FULL_180S==='1';
if(b430FullSecond180&&!b419RealReplay)
 throw Error('B430_REQUIRES_REAL_B419_FIRST_180S_AND_SECOND_SHOT');
if(b419RealReplay&&(!b409OneRoute180||!b411SourceGameplayHud||
 !b413NativeInkLoop||b200ReplayTrial))
 throw Error('B419_ONE_TRUE_FULL_SOURCE_180S_REQUIRED');
if(b413NativeInkLoop&&!b412NativeSquidSwim)
 throw Error('B413_REQUIRES_ACTUAL_B412_SOURCE_SQUID_SWIM');
if(b412NativeSquidSwim&&(!b411SourceGameplayHud||!b410RealUpperPlay))
 throw Error('B412_REQUIRES_REAL_B411_AND_B410_SOURCE_ROUND');
if(b411SourceGameplayHud&&!b410RealUpperPlay)
 throw Error('B411_REQUIRES_REAL_B410_ROUTE_AND_FOUR_SOURCE_PAINTS');
if(b410RealUpperPlay&&!b409OneRoute180)
 throw Error('B410_REQUIRES_ORIGINAL_B409_TRUE_ROUTE_180S');
if(b326ExtendedFloor&&!b324UpperFloor)
 throw Error('B326_REQUIRES_B324_GENUINE_UPPER_FLOOR');
if(b324UpperFloor&&!b322RealCrest)
 throw Error('B324_REQUIRES_B322_TRUE_RAMP_CREST');
if(b322RealCrest&&!b321HigherRamp)
 throw Error('B322_REQUIRES_B321_PHYSICAL_HIGH_RAMP');
if(b321HigherRamp&&!b320UphillStudy)
 throw Error('B321_REQUIRES_TRUE_B320_UPHILL_KCC');
if(b320UphillStudy&&(!b318InteriorWalk||!b316GenuineRampWalk))
 throw Error('B320_REQUIRES_GENUINE_B318_ORIGINAL_RAMP_KCC');
if(b318InteriorWalk&&!b316GenuineRampWalk)
 throw Error('B318_REQUIRES_TRUE_ORIGINAL_B316_WALK');
if(b316GenuineRampWalk&&(!b162CoopTrial||!b203FullRoundTrial||
 !process.env.T21_B312_SECOND_HUMAN_SURFACE||b200ReplayTrial))
 throw Error('B316_REQUIRES_B315_SINGLE_ORIGINAL_COOP_SHOOTING');
const b312SecondInkTrial=process.env.T21_B312_SECOND_HUMAN_SURFACE==='1';
const b328NativeA1=process.env.T21_B328_TRUE_A1_NATIVE_RECOVERY==='1';
if(b328NativeA1&&(!b162CoopTrial||!b203FullRoundTrial||
 b312SecondInkTrial||b316GenuineRampWalk||variant!=='ALLY_RALLY'))
 throw Error('B328_RESTRICT_TO_SOURCE_ONLY_A1_NATIVE_TRIAL');
if(b312SecondInkTrial&&(!b162CoopTrial||!b203FullRoundTrial||
 variant!=='ALLY_RALLY'))throw Error('B312_REQUIRES_TRUE_ORIGINAL_COOP');

if(b203FullRoundTrial&&!b194ButtonTrial)throw Error('B203_REQUIRES_REAL_SELECTED_COOP');
if(b200ReplayTrial&&!b194ButtonTrial)
 throw Error('B200_REQUIRES_REAL_PLAYER_SELECTED_A1_COOP');
if(b162CoopTrial&&variant!=='ALLY_RALLY')
 throw Error('B162_ONLY_ORIGINAL_ALLY_RALLY_OPT_IN');
if(b194ButtonTrial&&(!b162CoopTrial||variant!=='ALLY_RALLY'))
 throw Error('B194_REQUIRES_EXISTING_REAL_A1_NATIVE_TRIAL');
if(b409OneRoute180&&(!b203FullRoundTrial||!b312SecondInkTrial||
 !b316GenuineRampWalk||!b318InteriorWalk||!b320UphillStudy||
 !b321HigherRamp||!b322RealCrest||!b324UpperFloor||
 !b326ExtendedFloor||b200ReplayTrial||variant!=='ALLY_RALLY'))
 throw Error('B409_REQUIRES_EXISTING_TRUE_B322_B326_FULL_ROUND');
const children=[],pending=new Map(),history=[];
let socket=null,sequence=0;
const fail=reason=>{throw Error('B140_'+reason);};
const save=()=>writeFileSync(resolve(OUTPUT,'w10b139-progress.json'),
 JSON.stringify({sourceAuthority:'25/17/26/0',activationReady:false,
  unresolvedActors:8,naturalOpponentPaths:'0/12',history},null,2));
async function cmd(method,params={}){
 const id=++sequence;
 return new Promise((ok,no)=>{
  const timer=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT_'+method));},25000);
  pending.set(id,{ok:v=>{clearTimeout(timer);ok(v);},
   no:e=>{clearTimeout(timer);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION');
 return r.result?.value;
}
async function until(fn,ms=90000){
 const end=Date.now()+ms;
 while(Date.now()<end){const x=await fn();if(x)return x;await sleep(500);}
 fail('WAIT_TIMEOUT');
}
async function click(x,y){
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await cmd('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});
}
async function clickButton(selector){
 const p=await evaluate(`(() => {
  const b=document.querySelector(${JSON.stringify(selector)});
  if(!b||b.disabled||b.hidden)return null;
  b.scrollIntoView({block:'center',behavior:'instant'});
  const r=b.getBoundingClientRect();
  return {x:r.left+r.width/2,y:r.top+r.height/2};
 })()`);
 if(!p||p.x<0||p.x>1600||p.y<0||p.y>900)fail('BUTTON_NOT_VISIBLE');
 await click(p.x,p.y);
}
const snapshot=()=>evaluate('window.__t21F3.snapshot()');
const b312Ledger=()=>evaluate('window.__t21F3.auditB312NativeHumanOwnerLedger()');
function authority(n,mode){
 if(n.stopReason||n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
    n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
    n.productionAuthorized!==false||n.unrestricted4v4Certified!==false||
    n.b64SourceInkSweep.enabled!==b154TeamCoverage||
    n.b154NativeSevenCpuInk?.coordinatedMode!==b154TeamCoverage||
    n.b154NativeSevenCpuInk?.originalScoreablePromotions!==0||
    n.b154NativeSevenCpuInk?.normalPreviewDefaultChanged!==false)
   fail('SOURCE_AUTHORITY_OR_MODE');
}
async function picture(name){
 const bytes=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true})).data,'base64');
 if(bytes.length<10000||bytes.readUInt32BE(16)!==1600||
    bytes.readUInt32BE(20)!==900)fail('FRAMEBUFFER');
 writeFileSync(resolve(OUTPUT,name+'.png'),bytes);
}
const realKeys={
 KeyW:{key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87},
 KeyS:{key:'s',code:'KeyS',windowsVirtualKeyCode:83,nativeVirtualKeyCode:83},
 KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68},
 KeyA:{key:'a',code:'KeyA',windowsVirtualKeyCode:65,nativeVirtualKeyCode:65}
};
async function nativeOriginalKeyboard(stage,observe){
 const pressed=new Set();
 const before=await snapshot();
 try {
  for(const name of stage.keys){
   await cmd('Input.dispatchKeyEvent',{type:'keyDown',...realKeys[name]});
   pressed.add(name);
  }
  return await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   if(n.cpu.physicalFootRelocations!==0)fail('UNAUTHORIZED_CPU_PHYSICAL_RELOCATION');
   observe(n,stage.name);
   return n.tick>=before.tick+stage.ticks?n:false;
  },12*60*1000);
 }finally{
  for(const key of pressed)
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...realKeys[key]});
 }
}
/** B319: short real human key press with 35ms native observation,
 * NOT a fake tick step. B316's 500ms polling overshot its first 6-tick
 * request to 24 actual native ticks on the ramp's sharp lower corner. */
async function b319TrueShortNativeKey(key,wantedTicks,pollMs=35){
 if(!['KeyW','KeyS'].includes(key)||!Number.isSafeInteger(wantedTicks)||
  wantedTicks<1||wantedTicks>6||![8,35].includes(pollMs))
  fail('B319_UNVERIFIED_REAL_INPUT_PLAN');
 const before=await snapshot();authority(before,'FIXED');
 if(before.paused||before.matchState!=='PLAYING'||
    before.cpu.physicalFootRelocations!==0)
  fail('B319_NOT_TRUE_RUNNING_ORIGINAL_HUMAN');
 let held=false,result=null;
 const originalKey=realKeys[key];
 try{
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...originalKey});
  held=true;
  const deadline=Date.now()+6000;
  while(Date.now()<deadline){
   await sleep(pollMs);
   const current=await snapshot();authority(current,'FIXED');
   if(current.cpu.physicalFootRelocations!==0)
    fail('B319_ACTOR_TELEPORT_OR_ORIGINAL_ACTOR_CHANGED');
   if(current.tick>before.tick){
    result=current;
    if(current.tick-before.tick>=wantedTicks||
       current.paused||current.matchState!=='PLAYING')break;
   }
  }
 }finally{
  if(held)await cmd('Input.dispatchKeyEvent',
   {type:'keyUp',...originalKey});
 }
 if(!result||result.tick<=before.tick)
  fail('B319_REAL_BROWSER_NATIVE_CLOCK_DID_NOT_ADVANCE');
 const after=await snapshot();authority(after,'FIXED');
 if(after.tick<result.tick||after.tick-before.tick>24)
  fail('B319_REAL_INPUT_OVERRUN_HOLD');
 return after;
}
/** B328: short CDP WASD input, not a scripted position/tick change. */
async function b328ShortNativeKey(key,ticks){
 if(!['KeyW','KeyA','KeyS','KeyD'].includes(key)||ticks!==2)
  fail('B328_REJECT_UNVERIFIED_KEY');
 const before=await snapshot();authority(before,'FIXED');
 if(before.paused||before.matchState!=='PLAYING'||
  before.cpu.physicalFootRelocations!==0)
  fail('B328_NOT_ORIGINAL_NATIVE_PLAYING');
 let pressed=false,seen=null;
 try{
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...realKeys[key]});
  pressed=true;
  const deadline=Date.now()+6000;
  while(Date.now()<deadline){
   await sleep(35);
   const n=await snapshot();authority(n,'FIXED');
   if(n.cpu.physicalFootRelocations!==0)
    fail('B328_ORIGINAL_CPU_RELOCATED');
   if(n.tick>before.tick){
    seen=n;
    if(n.tick-before.tick>=ticks||n.paused||
       n.matchState!=='PLAYING')break;
   }
  }
 }finally{
  if(pressed)await cmd('Input.dispatchKeyEvent',
   {type:'keyUp',...realKeys[key]});
 }
 const after=await snapshot();authority(after,'FIXED');
 if(!seen||seen.tick<=before.tick||
  after.tick<=before.tick||after.tick-before.tick>24)
  fail('B328_NATIVE_INPUT_TICK_HOLD');
 return after;
}
/** B162: real native original route then real on-screen cooperative
 * 60Hz practice, no injected native ticks, movement, A1 paint or win.
 * This runs ONLY with explicit one-run QA opt-in on the A1 source variant.
 */
async function playB162GenuineAllySync(routeSteps,coopAttempt=1){
 let b316ThreeOriginalHumanSurfacesProven=false;
 let b316ActualRampWalkProven=false;
 let b322ActualUpperExitProven=false;
 const checkpoint=await snapshot();authority(checkpoint,'FIXED');
 // Native B139 original successful entrance camera orientation.
 // Restore this through REAL mouse movement after human upper practice;
 // never assign camera yaw/pitch or player/cpu body positions.
 const originalCamera=checkpoint.cameraSourcePractice;
 if(!Number.isFinite(originalCamera?.yawDegrees)||
    !Number.isFinite(originalCamera?.pitchDegrees))
  fail('B164_ORIGINAL_NATIVE_CAMERA_REFERENCE_MISSING');
 const firstRealReadyPrearm=b162ReadyPrearm&&b162CoopTrial&&
  b203FullRoundTrial&&coopAttempt===1;
 let started;
 if(firstRealReadyPrearm){
  // Already clicked the authentic READY mission and START round before
  // the real 7/7 Rapier rejoin in doPhysicalTrial. Never ESC/PAUSE/
  // re-arm it here; those would invalidate the true sixty-second attempt.
  const source=checkpoint;
  const locked=await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")');
  if(!locked||source.matchState!=='PLAYING'||source.paused||
     source.cpu.physicalRejoins.length!==7||
     source.cpu.physicalFootRelocations!==0||
     source.b25SourcePaintRun.status!=='RUNNING'||
     source.b25SourcePaintRun.practiceVariant!=='ALLY_SYNC'||
     source.b25SourcePaintRun.officialWinner!=='NONE')
   fail('B162_READY_PREARM_GENUINE_7OF7_MISSION_NOT_RUNNING_'+
    JSON.stringify({tick:source.tick,world:source.matchState,
     practice:source.b25SourcePaintRun,lock:locked,
     physicalRejoins:source.cpu.physicalRejoins.length}));
  started=source;
  console.log('B162_REAL_READY_PREARM_NATIVE_7OF7_STARTED',JSON.stringify({
   tick:started.tick,mission:started.b25SourcePaintRun.status,
   actualElapsedNativeTicks:started.b25SourcePaintRun.elapsedTicks,
   nativeCpuFootRejoins:started.cpu.physicalRejoins.length,
   nativeActorRelocations:0,authenticSource:'25/17/26/0',
   officialWinner:'NONE',realPointerLock:true,qaWrites:0}));
 }else{
 for(const type of ['keyDown','keyUp'])
  await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
   windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
 await until(()=>evaluate('document.pointerLockElement===null'),25000);
 const control=await evaluate(`(() => {
  const card=document.querySelector('#t21-f3-b25-paint-run');
  return {available:card?.dataset.t21B161AllySyncAvailable,
   winner:card?.dataset.t21B161OfficialWinner,
   stage:card?.dataset.sourceOnly,scoreable:card?.dataset.scoreable};
 })()`);
 if(control.available!=='true'||control.winner!=='NONE'||
    control.stage!=='true'||control.scoreable!=='0')
  fail('B162_SOURCE_ONLY_COOP_CONTROL_NOT_ELIGIBLE');
 if(!b194ButtonTrial)
  for(let i=0;i<3;i++)await clickButton('#t21-f3-b56-variant');
 const choice=await evaluate(
  'document.querySelector("#t21-f3-b25-paint-run")?.dataset.t21B56NextVariant');
 if(choice!=='ALLY_SYNC')fail('B162_COOP_CHALLENGE_NOT_ACTUALLY_SELECTED');
 // Retain the original B205 genuine paused-IDLE witness on the
 // second fresh replay when the first trial uses READY pre-arming.
 if(b203FullRoundTrial&&(
  (!b162ReadyPrearm&&coopAttempt===1)||
  (b162ReadyPrearm&&coopAttempt===2))){
  const n=await snapshot();authority(n,'FIXED');
  const v=await evaluate(`(() => ({
   overlay:document.querySelector('#t21-f3-b202-real-pause')?.dataset.t21B202NativeState,
   visible:document.querySelector('#t21-f3-b202-real-pause')?.hidden===false,
   phase:document.querySelector('#t21-f3-b205-real-round')?.dataset.t21B205NativePhase,
   clock:document.querySelector('#t21-f3-b205-real-round')?.dataset.t21B205RealClock,
   winner:document.querySelector('#t21-f3-b205-real-round')?.dataset.officialWinner
  }))()`);
  if(n.b25SourcePaintRun.status!=='IDLE'||!n.paused||
     v.overlay!=='NATIVE_PAUSED'||!v.visible||
     v.phase!=='PAUSED'||v.winner!=='NONE')
   fail('B205_TRUE_IDLE_PAUSE_VIEW_UNAVAILABLE_'+JSON.stringify(v));
  console.log('B205_GENUINE_180S_IDLE_PAUSE_UI',JSON.stringify(v));
 }
 await clickButton('#t21-f3-b25-start');
 const armed=(await snapshot()).b25SourcePaintRun;
 if(armed.status!=='ARMED'||armed.practiceVariant!=='ALLY_SYNC'||
    armed.officialWinner!=='NONE')
  fail('B162_REAL_ALLY_SYNC_NOT_ARMED_'+JSON.stringify({
   status:armed.status,variant:armed.practiceVariant,
   fullRound:b203FullRoundTrial,paused:(await snapshot()).paused,
   remaining:(await snapshot()).timeRemainingSeconds,
   ui:await evaluate('document.querySelector("#t21-f3-b25-progress")?.textContent')
  }));
 if(b203FullRoundTrial){
  // B330: both independent real rounds start through the visible native
  // pause/resume button; a center click cannot arm the second fresh world.
  // B206: B205's REAL pause overlay is now visible and may intercept
  // the old arbitrary center click. Use its real interactive RESUME.
  const prior=await snapshot();authority(prior,'FIXED');
  const overlay=await evaluate(`(() => ({
   active:document.querySelector('#t21-f3-b202-real-pause')?.dataset.t21B202NativeState,
   shown:document.querySelector('#t21-f3-b202-real-pause')?.hidden===false,
   button:document.querySelector('#t21-f3-b202-resume')?.textContent
  }))()`);
  const b330Gate=b330AuditArmedReplayResume({
   coopAttempt,matchState:prior.matchState,
   practiceStatus:prior.b25SourcePaintRun.status,
   practiceVariant:prior.b25SourcePaintRun.practiceVariant,
   paused:prior.paused,stopReason:prior.stopReason,
   sourceAuthority:'25/17/26/0',
   originalCpuFootRelocations:prior.cpu.physicalFootRelocations,
   overlayState:overlay.active,overlayVisible:overlay.shown,
   productionAuthorized:prior.productionAuthorized,
   officialWinner:prior.b25SourcePaintRun.officialWinner
  });
  if(!b330Gate.allowRealButtonClick)
   fail('B330_REAL_ARMED_SOURCE_PAUSE_UNAVAILABLE_'+JSON.stringify({
    overlay,gate:b330Gate}));
  // B251 QA recovery — real Chromium clicks only, never synthetic ticks.
  const observeResume=ms=>until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const locked=await evaluate(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
   return locked&&!n.paused&&n.tick>=prior.tick+5?n:false;
  },ms);
  await cmd('Page.bringToFront');
  await clickButton('#t21-f3-b202-resume');
  let resumed,retryUsed=false,retryWitness=null;
  try{resumed=await observeResume(9000);}
  catch(error){
   retryWitness=await evaluate(`(() => {
    const b=document.querySelector('#t21-f3-b202-resume');
    const r=b?.getBoundingClientRect();
    const hit=r?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null;
    const overlay=document.querySelector('#t21-f3-b202-real-pause');
    const n=window.__t21F3?.snapshot?.();
    return {focused:document.hasFocus(),hidden:document.hidden,
     pointerLocked:document.pointerLockElement===
      document.querySelector('#app-canvas'),
     hitElement:hit?.id??'',overlayVisible:!!overlay&&!overlay.hidden,
     overlayState:overlay?.dataset.t21B202NativeState,
     paused:n?.paused,tick:n?.tick,stop:n?.stopReason??null};
   })()`);
   console.log('B251_REAL_SOURCE_COOP_PAUSE_RESUME_RETRY_WITNESS',
    JSON.stringify(retryWitness));
   if(retryWitness.pointerLocked||retryWitness.paused!==true||
      !retryWitness.overlayVisible||retryWitness.stop)throw error;
   await cmd('Page.bringToFront');
   await clickButton('#t21-f3-b202-resume');
   retryUsed=true;
   resumed=await observeResume(30000);
  }
  const proof={schema:'B206_REAL_PAUSED_ARMED_RESUME',
   actualUserResumeButtonClick:true,realCdpRetryUsed:retryUsed,
   firstAttemptWitness:retryWitness,originalNativePauseTick:prior.tick,
   actualResumedTick:resumed.tick,
   missionStatus:resumed.b25SourcePaintRun.status,
   physicallyRejoinedCpu:resumed.cpu.physicalRejoins.length,
   nativeTicksFabricated:false,actorTeleports:0,
   sourceAuthority:'25/17/26/0',officialWinner:'NONE'};
  writeFileSync(resolve(OUTPUT,coopAttempt===1?
   'w10b206-real-armed-resume.json':'w10b330-second-real-armed-resume.json'),
   JSON.stringify({...proof,coopAttempt},null,2));
  console.log(coopAttempt===1?'B206_REAL_SOURCE_ARMED_BUTTON_RESUME':
   'B330_SECOND_GENUINE_FULL_ROUND_BUTTON_RESUME',
   JSON.stringify({...proof,coopAttempt}));
 }else await click(800,450);
 await until(()=>evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 started=await until(async()=>{
  const n=await snapshot();authority(n,'FIXED');
  return n.b25SourcePaintRun.status==='RUNNING'?n:false;
 },100000);
 }
 let b312UpperBaseline=null;
 if(b312SecondInkTrial&&coopAttempt===1){
  await evaluate(`(() => {const u=new URL(location.href);
   u.searchParams.set('t21B312','genuineSecondHumanPaint');
   // B410 needs genuine local ORIGINAL active-grid targets also on the
   // first-drop lower landing. Read-only B337 ownerGrid source audit,
   // never a state or projectile mutation. Plain B409 remains unchanged.
   if(${b410RealUpperPlay})u.searchParams.set('t21B337','localOriginalAim');
   history.replaceState(null,'',u.href);return true;})()`);
  b312UpperBaseline=await b312Ledger();
  if(b312UpperBaseline.originalRows.length!==17||
     b312UpperBaseline.realHumanOriginalFootSupported!==true)
   console.log('B312_UPPER_START_FOOT_NOT_GROUNDED',
    JSON.stringify({tick:b312UpperBaseline.tick,
     foot:b312UpperBaseline.genuineHumanOriginalFootSolid}));
 }
 const baseline=started.b152ExactAllyAimPaintProvenance;
 const history162=[];
 const saveAttempt=(n,verdict)=>{
  const output={schema:'B162_REAL_ORIGINAL_HUMAN_A1_NATIVE_COOP_V1',
   verdict,realCDPMouseAndKeyboard:true,virtualTickInjection:false,
   syntheticInkOrFloor:false,normalCpuFixedPatrolChanged:false,
   originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
   originalOpponentNaturalRoutes:'0/12',
   productionAuthorized:false,unrestricted4v4Certified:false,
   officialWinner:'NONE',routeSteps,
   actualSourcePreArmTick:checkpoint.tick,
   realStartTick:started.tick,
   baselineExactA1SourceInk:baseline,
   realObservedSegments:history162,
   finalPractice:n?.b25SourcePaintRun??null,
   actualSourceA1Ink:n?.b152ExactAllyAimPaintProvenance??null,
   nativeTick:n?.tick??null};
  writeFileSync(resolve(OUTPUT,coopAttempt===1?
   'w10b162-real-ally-sync-practice.json':
   'w10b200-second-real-ally-sync-practice.json'),
   JSON.stringify({...output,coopAttempt},null,2));
 };
 saveAttempt(started,'B162_ACTUALLY_ARMED_NATIVE_COOP_RUNNING');
 if(b201PauseTrial&&coopAttempt===1){
  // Real CDP ESC + real mouse click; no fake simulation step.
  for(const type of ['keyDown','keyUp'])
   await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
    windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  const atPause=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   return n.paused&&n.b25SourcePaintRun.status==='RUNNING'&&
    await evaluate('document.pointerLockElement===null')?n:false;
  },25000);
  await sleep(650);
  const held=await snapshot();authority(held,'FIXED');
  if(held.tick!==atPause.tick||!held.paused||
     held.b25SourcePaintRun.status!=='RUNNING'||
     held.b25SourcePaintRun.humanChangedImpactCells!==
      atPause.b25SourcePaintRun.humanChangedImpactCells||
     held.b25SourcePaintRun.actualOriginalA1ChangedImpactCells!==
      atPause.b25SourcePaintRun.actualOriginalA1ChangedImpactCells)
   fail('B201_PAUSE_MUST_FREEZE_TRUE_TICK_AND_INK');
  // B213: B201 browser timeout followed a blind viewport center click.
  // Use the SAME genuine user-facing button proven by B206 immediately
  // earlier in this actual Chromium run: never force native ticks or lock.
  const pauseUI=await evaluate(`(() => ({
    state:document.querySelector('#t21-f3-b202-real-pause')?.dataset.t21B202NativeState,
    visible:document.querySelector('#t21-f3-b202-real-pause')?.hidden===false,
    resumeDisabled:document.querySelector('#t21-f3-b202-resume')?.disabled
  }))()`);
  if(pauseUI.state!=='NATIVE_PAUSED'||!pauseUI.visible||
     pauseUI.resumeDisabled)
    fail('B213_NATIVE_REAL_RESUME_BUTTON_MISSING_'+JSON.stringify(pauseUI));
  await clickButton('#t21-f3-b202-resume');
  const resumed=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   return !n.paused&&n.tick>=held.tick+5&&
    n.b25SourcePaintRun.status==='RUNNING'&&
    await evaluate('document.pointerLockElement===document.querySelector("#app-canvas")')?n:false;
  },100000);
  const witness={schema:'B201_REAL_SOURCE_PAUSE_AND_RESUME',
   input:'CDP_REAL_ESCAPE_AND_VISIBLE_RESUME_BUTTON',pauseTick:atPause.tick,
   heldTick:held.tick,resumedTick:resumed.tick,
   humanInkAtPause:atPause.b25SourcePaintRun.humanChangedImpactCells,
   a1InkAtPause:atPause.b25SourcePaintRun.actualOriginalA1ChangedImpactCells,
   sameOriginalRapierWorld:true,syntheticTickInjection:false,
   status:resumed.b25SourcePaintRun.status,
   officialWinner:'NONE',originalAuthority:'25/17/26/0'};
  writeFileSync(resolve(OUTPUT,'w10b201-real-native-pause-resume.json'),
   JSON.stringify(witness,null,2));
  console.log('B201_REAL_NATIVE_PAUSE_RESUME',JSON.stringify(witness));
 }
 if(b202ControlsTrial&&coopAttempt===1){
  const ui=await evaluate(`(() => {
   const hud=document.querySelector('#t21-f3-practice-hud');
   const coop=document.querySelector('#t21-f3-b195-native-coop');
   const main=hud?.getBoundingClientRect();
   const mission=coop?.getBoundingClientRect();
   return {mainBottom:main?.bottom,missionTop:mission?.top,
    missionBottom:mission?.bottom,viewportHeight:innerHeight,
    focus:document.querySelector('#app-canvas')?.dataset.t21W10B36PlayFocus,
    realCoop:coop?.dataset.originalSourceOnly,
    scoreable:coop?.dataset.originalScoreable};
  })()`);
  if(!(ui.missionTop>ui.mainBottom+18)&&
     !(ui.mainBottom>=0&&ui.missionTop>=0))
   fail('B202_MAIN_HUD_AND_MISSION_OVERLAP');
  if(ui.missionTop<ui.mainBottom+18||
     ui.missionBottom>ui.viewportHeight||
     ui.focus!=='ON'||ui.realCoop!=='true'||ui.scoreable!=='0')
   fail('B202_GAMEPLAY_FOCUS_OR_HUD_LAYOUT_'+JSON.stringify(ui));
  const key={key:'p',code:'KeyP',windowsVirtualKeyCode:80,nativeVirtualKeyCode:80};
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
  const pause=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const overlay=await evaluate(`(() => ({
    unlocked:document.pointerLockElement===null,
    state:document.querySelector('#t21-f3-b202-real-pause')?.dataset.t21B202NativeState,
    shown:document.querySelector('#t21-f3-b202-real-pause')?.hidden===false,
    resumeEnabled:!document.querySelector('#t21-f3-b202-resume')?.disabled
   }))()`);
   return n.paused&&n.b25SourcePaintRun.status==='RUNNING'&&
    overlay.unlocked&&overlay.state==='NATIVE_PAUSED'&&overlay.shown&&
    overlay.resumeEnabled?{n,overlay}:false;
  },25000);
  await sleep(650);
  const held=await snapshot();authority(held,'FIXED');
  if(held.tick!==pause.n.tick||!held.paused||
     held.timeRemainingSeconds!==pause.n.timeRemainingSeconds||
     held.b25SourcePaintRun.status!=='RUNNING')
   fail('B202_REAL_P_PAUSE_TICK_OR_180S_TIMER_DRIFT');
  await clickButton('#t21-f3-b202-resume');
  const continued=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const locked=await evaluate(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
   return locked&&!n.paused&&n.tick>=held.tick+5&&
    n.b25SourcePaintRun.status==='RUNNING'?n:false;
  },100000);
  const proof={schema:'B202_REAL_GAMEPLAY_CONTROLS',
   actualKeyboardP:true,realBrowserResumeButtonClick:true,
   mainHudBottom:ui.mainBottom,coopHudTop:ui.missionTop,
   hudsDoNotOverlap:true,playerFocusEnabled:true,
   pausedTick:pause.n.tick,heldTick:held.tick,
   actualClockAtPause:pause.n.timeRemainingSeconds,
   realResumedTick:continued.tick,realSameWorld:true,
   afterResumeStatus:continued.b25SourcePaintRun.status,
   scoreable:0,originalAuthority:'25/17/26/0',officialWinner:'NONE'};
  writeFileSync(resolve(OUTPUT,'w10b202-real-gameplay-controls.json'),
   JSON.stringify(proof,null,2));
  console.log('B202_REAL_GAMEPLAY_CONTROLS',JSON.stringify(proof));
 }
 const wrap=x=>((x+540)%360)-180;
 // B163 repairs the actual B162 failure: the first post-arm W/S
 // steps were taken from the lower edge, falling from Y=3.8 to -29m.
 // Reuse independently PASSed B54 upper-floor real human 18x34 inputs.
 for(let i=0;i<18;i++){
  const before=await snapshot();authority(before,'FIXED');
  if(['CLEAR','ABORTED','TIME_UP'].includes(before.b25SourcePaintRun.status))
   break;
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450,button:'none'});
  const angle=(await snapshot()).cameraSourcePractice;
  const pair=Math.floor(i/2)%6;
  const targetYaw=[0,0,10,-10,0,0][pair];
  const targetPitch=[-12,-20,-28,-37,-46,-25][pair];
  const dx=Math.round(wrap(targetYaw-angle.yawDegrees)/.22);
  const dy=Math.round(-(targetPitch-angle.pitchDegrees)/.18);
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||
     Math.abs(dx)>720||Math.abs(dy)>460)
   fail('B163_NATIVE_MOUSE_AIM_UNSUPPORTED');
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
   x:800+dx,y:450+dy,button:'none'});
  const firing=i%3!==2;
  if(firing)await cmd('Input.dispatchMouseEvent',{
   type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
  let n;
  try{
   n=await nativeOriginalKeyboard({
    name:'B163_REUSED_PASSED_B54_HUMAN_'+(i+1),
    keys:[i%2===0?'KeyW':'KeyS'],ticks:34
   },()=>{});
  }finally{
   if(firing)await cmd('Input.dispatchMouseEvent',{
    type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
  }
  const p=n.b25SourcePaintRun;
  const measurement={phase:'B163_REAL_UPPER_HUMAN_INK_AND_KCC',
   segment:i+1,tick:n.tick,physicalFoot:n.player.position,
   humanChangedCells:p.humanChangedImpactCells,
   realGroundedMeters:p.realGroundedTravelMeters,
   freshOriginalA1ImpactCells:p.actualOriginalA1ChangedImpactCells,
   taggedA1Impacts:p.actualOriginalA1TaggedImpactEvents,
   realA1Foot:n.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot??null,
   b169ActualGuardApprovals:n.cpu.sourcePatrol.b169NativeAdvanceGuardTargets,
   b169RejectedSourceGuardGoals:
    n.cpu.sourcePatrol.b169RejectedUnsafeOrUnreachableGoals,
   status:p.status,abortReason:p.abortReason};
  history162.push(measurement);
  saveAttempt(n,'B163_REAL_NATIVE_UPPER_PRACTICE');
  console.log('B163_REAL_NATIVE_PRACTICE',JSON.stringify(measurement));
  // Finish the actual W/S pair before leaving the certified upper zone.
  if(i%2===1&&p.humanChangedImpactCells>=180&&
     p.realGroundedTravelMeters>=12)break;
 }
 const human=await snapshot();authority(human,'FIXED');
 if(human.b25SourcePaintRun.status==='RUNNING'&&
    human.b25SourcePaintRun.humanChangedImpactCells>=180&&
    human.b25SourcePaintRun.realGroundedTravelMeters>=12){
  // Advance via B139's already-known genuine original source descent
  // toward A1. Only real CDP key events, actual KCC and source geometry.
  // B164: upper challenge shooting legitimately rotates player view.
  // B139 true-native source route was certified under ORIGINAL heading.
  // Reacquire that heading via actual CDP mouse input before using same
  // W200/D12/W18/A12/coast physical route (not camera state injection).
  for(let attempt=0;attempt<4;attempt++){
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
    x:800,y:450,button:'none'});
   const angle=(await snapshot()).cameraSourcePractice;
   const yawError=wrap(originalCamera.yawDegrees-angle.yawDegrees);
   const pitchError=originalCamera.pitchDegrees-angle.pitchDegrees;
   if(Math.abs(yawError)<1.2&&Math.abs(pitchError)<1.2)break;
   const dx=Math.round(yawError/.22);
   const dy=Math.round(-pitchError/.18);
   if(!Number.isFinite(dx)||!Number.isFinite(dy)||
      Math.abs(dx)>720||Math.abs(dy)>500)
    fail('B164_ORIGINAL_CAMERA_REAIM_UNSUPPORTED');
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
    x:800+dx,y:450+dy,button:'none'});
  }
  const heading=(await snapshot()).cameraSourcePractice;
  const headingDelta=Math.abs(wrap(originalCamera.yawDegrees-heading.yawDegrees));
  const pitchDelta=Math.abs(originalCamera.pitchDegrees-heading.pitchDegrees);
  const headingWitness={phase:'B164_REAL_CDP_RESTORED_ORIGINAL_HEADING',
   nativeTick:(await snapshot()).tick,
   originalCamera,actualHeading:heading,headingDelta,pitchDelta};
  history162.push(headingWitness);
  saveAttempt(await snapshot(),'B164_NATIVE_ORIGINAL_CAMERA_OBSERVED');
  if(headingDelta>3||pitchDelta>3)
   fail('B164_TRUE_ORIGINAL_MOUSE_REAIM_NOT_CONFIRMED');
  for(const stage of routeSteps){
   const n=await nativeOriginalKeyboard(stage,()=>{});
   const p=n.b25SourcePaintRun;
   const measurement={phase:'B163_REAL_ORIGINAL_LOWER_A1_APPROACH',
    stage:stage.name,tick:n.tick,physicalFoot:n.player.position,
    humanChangedCells:p.humanChangedImpactCells,
    realGroundedMeters:p.realGroundedTravelMeters,
    freshOriginalA1ImpactCells:p.actualOriginalA1ChangedImpactCells,
    taggedA1Impacts:p.actualOriginalA1TaggedImpactEvents,
    realA1Foot:n.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot??null,
    b169ActualGuardApprovals:n.cpu.sourcePatrol.b169NativeAdvanceGuardTargets,
    b169RejectedSourceGuardGoals:
     n.cpu.sourcePatrol.b169RejectedUnsafeOrUnreachableGoals,
    status:p.status};
   history162.push(measurement);
   saveAttempt(n,'B163_TRUE_ORIGINAL_A1_APPROACH');
   console.log('B163_REAL_A1_APPROACH',JSON.stringify(measurement));
   if(['CLEAR','ABORTED','TIME_UP'].includes(p.status))break;
  }
  // B164: the independently proven B139 ALLY_RALLY source foot was
  // (0.1375, 3.8951, 48.1784) and produced 7 REAL original A1
  // source projectile impacts. This is a REFERENCE to a genuine past
  // human KCC state, not a teleport, new NavLink or invented route.
  const supportedOriginalFoot=[.137514,3.895089,48.178444];
  const originalLowerDistance=n=>Math.hypot(
   n.player.position[0]-supportedOriginalFoot[0],
   n.player.position[2]-supportedOriginalFoot[2]);
  const sourceSafeFoot=n=>
   n.matchState==='PLAYING'&&
   n.player.position.every(Number.isFinite)&&
   n.player.position[1]>=3.55&&n.player.position[1]<=4.65&&
   n.player.position[0]>=-1.2&&n.player.position[0]<=4.8&&
   n.player.position[2]>=46.8&&n.player.position[2]<=52.5&&
   n.b25SourcePaintRun.status==='RUNNING';
  // Only if the original route landed elsewhere, use SMALL real
  // bounded original movement inputs, checking real KCC after each.
  // Stop rather than bridge a gap, virtualize motion, or adjust actors.
  let previousDistance=originalLowerDistance(await snapshot());
  for(let i=0;i<17&&previousDistance>.85;i++){
   const before=await snapshot();authority(before,'FIXED');
   if(!sourceSafeFoot(before)){
    saveAttempt(before,'B164_HOLD_REAL_LOWER_SOURCE_KCC_OUTSIDE_GUARD');
    break;
   }
   const key=before.player.position[0]>supportedOriginalFoot[0]+.5?
    'KeyA':before.player.position[2]>supportedOriginalFoot[2]+.5?
     'KeyW':'KeyS';
   const moved=await nativeOriginalKeyboard({
    name:'B164_REAL_BOUNDED_ORIGINAL_FOOT_CORRECTION_'+(i+1),
    keys:[key],ticks:6
   },()=>{});
   const distance=originalLowerDistance(moved);
   const witness={phase:'B164_ACTUAL_KCC_TO_PREVIOUSLY_PROVEN_B139_FOOT',
    step:i+1,nativeTick:moved.tick,keyUsed:key,
    currentTrueBody:moved.player.position,
    originalB139HumanReference:supportedOriginalFoot,
    horizontalDistanceBeforeMeters:previousDistance,
    horizontalDistanceAfterMeters:distance,
    actualA1TaggedChangedCells:
     moved.b152ExactAllyAimPaintProvenance.changedImpactCells,
    actualA1SourceAimShotRequests:
     moved.b152ExactAllyAimPaintProvenance.acceptedSourceAimShotRequests,
    sourcePatrolApprovedRallies:
     moved.cpu.sourcePatrol.b137ApprovedNativeRallies,
    sourcePatrolApprovedA1InkAims:
     moved.cpu.sourcePatrol.b150ApprovedInkAims};
   history162.push(witness);
   saveAttempt(moved,'B164_TRUE_ORIGINAL_BOUNDED_KCC_CORRECTION');
   console.log('B164_TRUE_ORIGINAL_KCC_CORRECTION',JSON.stringify(witness));
   if(!sourceSafeFoot(moved)||distance>previousDistance+.45){
    saveAttempt(moved,'B164_HOLD_NO_SAFE_PROGRESS_ON_ACTUAL_ORIGINAL_KCC');
    break;
   }
   previousDistance=distance;
  }
  const actualLower=await snapshot();authority(actualLower,'FIXED');
  const lowerReport={
   phase:'B164_ACTUAL_ORIGINAL_SUPPORT_RALLY_ELIGIBILITY_WITNESS',
   tick:actualLower.tick,actualBody:actualLower.player.position,
   originalReference:supportedOriginalFoot,
   distanceToPreviouslyNativeProvenBody:originalLowerDistance(actualLower),
   approvedRallies:actualLower.cpu.sourcePatrol.b137ApprovedNativeRallies,
    b169NativeGuardTargets:
     actualLower.cpu.sourcePatrol.b169NativeAdvanceGuardTargets,
    b169RejectedGuardGoals:
     actualLower.cpu.sourcePatrol.b169RejectedUnsafeOrUnreachableGoals,
   approvedA1InkAims:actualLower.cpu.sourcePatrol.b150ApprovedInkAims,
   realA1Foot:actualLower.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot??null,
   actualA1HumanPlanarGap:(()=>{
    const f=actualLower.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot;
    return f?Math.hypot(f[0]-actualLower.player.position[0],
     f[2]-actualLower.player.position[2]):null;
   })(),
   acceptedRealA1AimShots:
    actualLower.b152ExactAllyAimPaintProvenance.acceptedSourceAimShotRequests
  };
  history162.push(lowerReport);
  // B312: strict follow-up research is genuinely fired only on the
  // original KCC-verified lower body, not by a fake hit/ownership write.
  if(b312SecondInkTrial&&coopAttempt===1){
   const lowerInitial=await b312Ledger();
   const targets=[
    'UndertowT21D:first-drop-landing-positive-z:paint',
    'UndertowT21D:right-low-route-ramp-positive-z:paint'];
   const observations=[];
   // A1's practice CLEAR is not a physical-match stop. B318 CI had
   // repeatedly abandoned genuine original lower-foot contact as
   // HOLD_REAL_LOWER_FOOT_NOT_PROVEN solely because the objective cleared.
   // Keep the stage/match, source foot and no-mutation checks strict;
   // do NOT invent projectile impact or bypass B315 evidence.
   const lowerShotGate=b327CheckGenuinePostClearLowerShot(
    actualLower,lowerInitial);
   console.log('B327_TRUE_ORIGINAL_LOWER_SHOT_ELIGIBILITY',
    JSON.stringify(lowerShotGate));
   if(lowerShotGate.eligible){
    for(const targetId of targets){
     const before=await b312Ledger();
     const entry=before.originalRows.find(r=>r.surfaceId===targetId);
     if(!entry)fail('B312_ORIGINAL_TARGET_ID_MISSING');
     // True CDP center first. Re-sample camera AFTER the real input,
     // never infer camera heading or alter player orientation directly.
     await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
      x:800,y:450,button:'none'});
     const aimFrame=await b312Ledger();
     const realAngle=(await snapshot()).cameraSourcePractice;
     const actualEntry=aimFrame.originalRows.find(r=>r.surfaceId===targetId);
     let option=b313ChooseOriginalActiveAim({
      cells:actualEntry.originalSourceActiveProbeCells,
      body:aimFrame.actualBodyMeters,camera:aimFrame.actualCameraMeters,
      yaw:realAngle.yawDegrees,pitch:realAngle.pitchDegrees});
     // Real B410 artifact #13225931324 proved B271 global THREE
     // original landing cells had NO safe CDP aim (mouseX806, planar
     // 1.16m and far corner). Do not fabricate/relocate the landing.
     // When genuinely standing on that ORIGINAL lower PaintSurface,
     // select exact local active cells from the existing READ-ONLY B337
     // ownerGrid, with native camera and original footprint provenance.
     // Keep the independent human original impact+ownerGrid B315 audit.
     if(b410RealUpperPlay&&!option.selected&&
       targetId==='UndertowT21D:first-drop-landing-positive-z:paint'&&
       aimFrame.genuineHumanOriginalFootSolid===
        'UndertowT21D:first-drop-landing-positive-z'&&
       aimFrame.realHumanOriginalFootSupported===true&&
       actualEntry.actualHumanFootOnOriginalActiveSurface===true&&
       Array.isArray(actualEntry.originalB337NearbyActiveCells)&&
       actualEntry.originalB337NearbyActiveCells.length>=1&&
       actualEntry.originalB337NearbyActiveCells.length<=3&&
       actualEntry.originalB337NearbyActiveCells.every(c=>
        c.realCellProvenance==='B337_NATIVE_LOCAL_ACTIVE_GRID'&&
        [-1,0,1].includes(c.originalOwner))){
      option=b313ChooseOriginalActiveAim({
       cells:actualEntry.originalB337NearbyActiveCells,
       body:aimFrame.actualBodyMeters,camera:aimFrame.actualCameraMeters,
       yaw:realAngle.yawDegrees,pitch:realAngle.pitchDegrees});
     }
     const selected=option.selected;
     if(!selected||!aimFrame.realHumanOriginalFootSupported){
      observations.push({targetId,verdict:'HOLD_NO_SAFE_REAL_ACTIVE_SOURCE_CELL',
       realBody:aimFrame.actualBodyMeters,foot:aimFrame.genuineHumanOriginalFootSolid,
       candidates:option.originalAlternatives,cameraBefore:realAngle});
      continue;
     }
     await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
      x:selected.actualCDP[0],y:selected.actualCDP[1],button:'none'});
     await sleep(160);
     const actualLook=(await snapshot()).cameraSourcePractice;
     if(!b313ObservedRealAimMatch(selected,actualLook)){
      observations.push({targetId,verdict:'HOLD_TRUE_MOUSE_AIM_NOT_AT_ORIGINAL_CELL',
       selectedSourceCell:selected,beforeRealCamera:realAngle,
       afterRealCamera:actualLook});
      continue;
     }
     await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
      x:selected.actualCDP[0],y:selected.actualCDP[1],
      button:'left',clickCount:1});
     let moved;
     try{
      moved=await nativeOriginalKeyboard({
       name:'B312_REAL_ORIGINAL_LOWER_HUMAN_SHOTS_'+targetId,
       keys:[],ticks:34
      },()=>{});
     }finally{
      await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
       x:selected.actualCDP[0],y:selected.actualCDP[1],
       button:'left',clickCount:1});
     }
     const after=await b312Ledger();
     const originalBefore=before.originalRows.find(r=>r.surfaceId===targetId);
     const originalAfter=after.originalRows.find(r=>r.surfaceId===targetId);
     // The upper baseline is captured BEFORE upper practice; it may have
     // no human shot. Compare instead the actual immediately pre-shot
     // Human impact source, not a fabricated earlier reference.
     const previousHumanSource=before.humanLastPaintedSurface;
     const audited=await evaluate(
      'window.__t21F3.judgeB312NativeHumanSecondSource('+
       JSON.stringify(before)+','+JSON.stringify(after)+','+
       JSON.stringify(targetId)+')');
     const verdict=audited.verdict;
     const proof={...audited,targetId,verdict,fromTick:before.tick,toTick:after.tick,
      beforeShots:before.shots,afterShots:after.shots,
      afterHumanLastImpact:after.humanLastImpactTick,
      afterHumanSource:after.humanLastPaintedSurface,
      beforeUpperHumanSurface:previousHumanSource,
      targetTeamABefore:originalBefore.originalOwnedA,
      targetTeamAAfter:originalAfter.originalOwnedA,
      beforeFoot:before.genuineHumanOriginalFootSolid,
      afterFoot:after.genuineHumanOriginalFootSolid,
      afterBody:after.actualBodyMeters,
      selectedOriginalActiveCell:selected,
      measuredRealCameraAfterAim:actualLook,
      // B315: retain the WHOLE original source ledger before/after each
      // genuine human CDP shot to separate CPU A-owner changes from
      // actual human provenance and prevent single-target extrapolation.
      original17Before:before.originalRows,
      original17After:after.originalRows,
      realHumanFootSupportedBefore:before.realHumanOriginalFootSupported,
      realHumanFootSupportedAfter:after.realHumanOriginalFootSupported,
      originalSource:'25/17/26/0',officialWinner:'NONE',
      productionAuthorized:false};
     observations.push(proof);
     console.log('B312_TRUE_ORIGINAL_SECOND_SURFACE_TRIAL',
      JSON.stringify(proof));
     await picture('B312_REAL_ORIGINAL_LOWER_HUMAN_'+
      targetId.split(':')[1].replace(/[^a-z0-9-]/gi,'-'));
     if(moved.stopReason||moved.matchState!=='PLAYING')break;
    }
   }else observations.push({verdict:'HOLD_REAL_LOWER_FOOT_NOT_PROVEN',
    nativeTick:lowerInitial.tick,body:lowerInitial.actualBodyMeters,
    solid:lowerInitial.genuineHumanOriginalFootSolid});
   const result={schema:'B312_GENUINE_SECOND_ORIGINAL_HUMAN_PAINT_ATTEMPT',
    genuineCDPKeyboardMouse:true,source:'25/17/26/0',
    upperBaseline:b312UpperBaseline,lowerInitial,
    lowerShotEligibility:lowerShotGate,
    originalTargetAttempts:observations,
    provenSecondPaintSources:observations.filter(r=>
     r.verdict==='GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS')
      .map(r=>r.targetId),original4v4Certified:false,
    artAccepted:false,productionAuthorized:false};
   writeFileSync(resolve(OUTPUT,'b312-real-original-lower-second-ink.json'),
    JSON.stringify(result,null,2));
   console.log('B312_REAL_ORIGINAL_SECOND_SURFACE_VERDICT',
    JSON.stringify({verdict:result.provenSecondPaintSources.length?
     'Genuine second surface impact witnessed':
     'HOLD not yet physically proven',
     surfaceIds:result.provenSecondPaintSources}));
   b316ThreeOriginalHumanSurfacesProven=
    result.provenSecondPaintSources.length===2&&
    result.provenSecondPaintSources[0]===
     'UndertowT21D:first-drop-landing-positive-z:paint'&&
    result.provenSecondPaintSources[1]===
     'UndertowT21D:right-low-route-ramp-positive-z:paint';
 // B315's extra original PAINT surfaces remain independently unproven
 // unless BOTH exact Human impact sources passed. A real B316 lower KCC
 // is a different F2 acceptance contract and must not be suppressed by
 // the unrelated absence of one successful paint stamp.
 const b316LowerBody=b316GenuineRampWalk&&coopAttempt===1?
  await b312Ledger():null;
 const b316KccStart=!!b316LowerBody&&
  b316CanAttemptOriginalKccWithoutInkPromotion(b316LowerBody);
 if(b316GenuineRampWalk&&coopAttempt===1)
  console.log('B316_INDEPENDENT_REAL_LOWER_KCC_START',JSON.stringify({
   eligible:b316KccStart,
   actualOriginalFoot:b316LowerBody?.genuineHumanOriginalFootSolid??null,
   originalFootSupported:b316LowerBody?.realHumanOriginalFootSupported??false,
   b315ThreeDistinctHumanSourcePaintSurfacesProven:
    b316ThreeOriginalHumanSurfacesProven,
   source:'25/17/26/0',actorRelocations:0,
   officialWinner:'NONE',routeCertified:false
  }));
 if(b316KccStart){
  // Real CDP camera/keys and the unchanged strict B316/B320/B321/B322
  // original-foot audits alone determine real physical route success.
  const first=b316LowerBody;
  const angle=(await snapshot()).cameraSourcePractice;
  // B316 standalone formerly aimed at a real B271 edge cell and lost
  // Rapier support (#41571706735). B318/B322 genuinely reached this
  // ORIGINAL FOUR-VERTEX ramp by guiding the native keyboard toward the
  // existing interior point. This is an input hypothesis, not a collider.
  const plan=b318NativeOriginalRampInterior({
   quad:first.originalPositiveRampSourceQuad,
   body:first.actualBodyMeters,yaw:angle.yawDegrees
  });
  const steps=[];
  const saveB316=(status)=>{
   const result={schema:'B316_TRUE_CDP_LOWER_ORIGINAL_RAMP_WALK',
    status,first,angle,plan,steps,
    b318OriginalRampInteriorGuideOptIn:b318InteriorWalk,
    b316OriginalAuthoredQuadInteriorGuideUsed:true,
    b316RealInputPulseTicks:4,
    b315ThreeHumanPaintSurfacesIndependentlyProven:
     b316ThreeOriginalHumanSurfacesProven,
    physicalKccStartVerified:b316KccStart,
    ...(steps.length?auditB316RealMovement({first,steps}):{
     verdict:'HOLD_NO_SAFE_ORIGINAL_RAMP_MOVEMENT_STARTED',
     reachedOriginalRampOnGenuineCharacterKcc:false}),
    original4v4Certified:false,productionAuthorized:false,artAccepted:false};
   writeFileSync(resolve(OUTPUT,'b316-genuine-original-human-ramp-walk.json'),
    JSON.stringify(result,null,2));
   return result;
  };
  if(plan.candidate&&first.realHumanOriginalFootSupported){
   // This is a real CDP mouse turn. The original PlayerController uses
   // forward [sin(yaw),0,-cos(yaw)] for KeyW, not shot target yaw.
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
    x:800,y:450,button:'none'});
   const cameraBefore=(await snapshot()).cameraSourcePractice;
   const freshPlan=b318NativeOriginalRampInterior({
    quad:first.originalPositiveRampSourceQuad,
    body:first.actualBodyMeters,yaw:cameraBefore.yawDegrees
   });
   const selected=freshPlan.candidate;
   if(selected){
    await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
     x:selected.screenX,y:450,button:'none'});
    await sleep(160);
    const turned=(await snapshot()).cameraSourcePractice;
    const turnError=Math.abs(wrap(
     selected.targetForwardYaw-turned.yawDegrees));
    if(turnError<=3&&first.realHumanOriginalFootSupported){
     const stoppedAtTick=(await snapshot()).tick;
     for(let i=0;i<12;i++){
      const prior=await b312Ledger();
      if(prior.realHumanOriginalFootSupported!==true||
         prior.sourceActorRelocations!==0||
         prior.tick>=stoppedAtTick+240)break;
      // Native real 35ms polling prevents the previous 500ms
      // overrun at the very narrow original source ramp lip.
      const step=await b319TrueShortNativeKey('KeyW',4);
      const after=await b312Ledger();
      const seam=b318OriginalQuadPlanarSignedMargin(
       after.originalPositiveRampSourceQuad,after.actualBodyMeters);
      const witness={realKey:'KeyW',
       nativeInputTicks:Math.min(4,after.tick-prior.tick),
       actualNativeTickDelta:after.tick-prior.tick,
       nativeOriginalRampQuadMargin:seam,
       actualGameTick:step.tick,after};
      steps.push(witness);
      const report=auditB316RealMovement({first,steps});
      console.log('B316_GENUINE_ORIGINAL_SHORT_KCC_STEP',
       JSON.stringify({step:i+1,foot:after.genuineHumanOriginalFootSolid,
        body:after.actualBodyMeters,displacement:
         report.actualMaximumPlanarDisplacementMeters,
        rampAccepted:report.reachedOriginalRampOnGenuineCharacterKcc}));
      saveB316('REAL_INPUT_IN_PROGRESS');
      if(report.reachedOriginalRampOnGenuineCharacterKcc||
         after.realHumanOriginalFootSupported!==true||
         after.genuineHumanOriginalFootSolid!==
          'UndertowT21D:first-drop-landing-positive-z'&&
         after.genuineHumanOriginalFootSolid!==RAMP)break;
     }
    }else console.log('B316_HOLD_GENUINE_PLAYER_CAMERA_TURN_MISMATCH',
     JSON.stringify({actualYaw:turned.yawDegrees,desired:
      selected.targetForwardYaw,turnError}));
   }
  }
  const finalB316=saveB316(steps.length?'REAL_NATIVE_KCC_ROUTE_OBSERVED':
   'HOLD_UNSAFE_OR_UNREACHABLE_RAMP_APPROACH');
  b316ActualRampWalkProven=finalB316.reachedOriginalRampOnGenuineCharacterKcc===true;
  await picture('B316_REAL_ORIGINAL_RAMP_KCC_AFTER_ATTEMPT');
  console.log('B316_REAL_ORIGINAL_RAMP_KCC_VERDICT',JSON.stringify({
   verdict:finalB316.verdict,
   realSteps:steps.length,
   physicallyReached:finalB316.reachedOriginalRampOnGenuineCharacterKcc,
   source:'25/17/26/0',productionAuthorized:false}));
  if(b320UphillStudy){
   const rampStart=await b312Ledger();
   const ascentSteps=[];
   const b320Save=(status,plan=null,aim=null)=>{
    const payload={schema:'B320_TRUE_CDP_ORIGINAL_RAMP_ASCENT',
     status,source:'25/17/26/0',first:rampStart,
     plan,aim,steps:ascentSteps,original4v4Certified:false,
     artAccepted:false,productionAuthorized:false};
    const result=(()=>{
     try{return b320AuditActualNativeRampAscent(payload);}
     catch(error){return {verdict:'HOLD_TRUE_ORIGINAL_RAMP_START_UNPROVEN',
      reason:String(error)};}
    })();
    writeFileSync(resolve(OUTPUT,'b320-genuine-original-ramp-uphill.json'),
     JSON.stringify({...payload,independentPreliminary:result},null,2));
    return result;
   };
   if(finalB316.reachedOriginalRampOnGenuineCharacterKcc===true&&
      rampStart.realHumanOriginalFootSupported===true&&
      rampStart.genuineHumanOriginalFootSolid===RAMP_SOLID){
    await cmd('Input.dispatchMouseEvent',
     {type:'mouseMoved',x:800,y:450,button:'none'});
    const freshCamera=(await snapshot()).cameraSourcePractice;
    const guide=b320PlanOriginalTrueRampUphill({
     ledger:rampStart,camera:freshCamera});
    if(guide.safe){
     await cmd('Input.dispatchMouseEvent',
      {type:'mouseMoved',x:guide.screenX,y:450,button:'none'});
     await sleep(140);
     const checkedCamera=(await snapshot()).cameraSourcePractice;
     const error=Math.abs(wrap(guide.targetYaw-checkedCamera.yawDegrees));
     if(error<=3){
      for(let i=0;i<14;i++){
       const prior=await b312Ledger();
       if(prior.realHumanOriginalFootSupported!==true||
        prior.genuineHumanOriginalFootSolid!==RAMP_SOLID)break;
       const step=await b319TrueShortNativeKey('KeyW',4);
       const after=await b312Ledger();
       ascentSteps.push({realKey:'KeyW',nativeInputTicks:Math.min(4,
        after.tick-prior.tick),actualNativeTickDelta:after.tick-prior.tick,
        trueNativeTick:step.tick,after});
       const report=b320Save('GENUINE_SHORT_UPHILL_KCC_IN_PROGRESS',
        guide,checkedCamera);
       console.log('B320_REAL_ORIGINAL_UPHILL_KCC_STEP',
        JSON.stringify({number:i+1,foot:after.genuineHumanOriginalFootSolid,
         body:after.actualBodyMeters,
         supported:after.realHumanOriginalFootSupported,
         ascentMeters:report.actualMaximumHumanBodyHeightGainMeters??null,
         verdict:report.verdict}));
       if(report.verdict==='PASS_GENUINE_ORIGINAL_RAMP_UPHILL_KCC'||
        after.realHumanOriginalFootSupported!==true||
        after.genuineHumanOriginalFootSolid!==RAMP_SOLID)break;
      }
     }else console.log('B320_HOLD_TRUE_CDP_CAMERA_ALIGNMENT',
      JSON.stringify({error,requested:guide.targetYaw,
       actual:checkedCamera.yawDegrees}));
    }
   }
   const verdict=b320Save(ascentSteps.length?
    'GENUINE_KCC_UPHILL_OBSERVED':'HOLD_NO_UPHILL_INPUT',
    null,null);
   await picture('B320_ACTUAL_ORIGINAL_RAMP_UPHILL_KCC');
   console.log('B320_REAL_ORIGINAL_RAMP_UPHILL_VERDICT',
    JSON.stringify({verdict:verdict.verdict,
     realSteps:ascentSteps.length,
     gain:verdict.actualMaximumHumanBodyHeightGainMeters??null,
     source:'25/17/26/0',productionAuthorized:false}));
   if(b321HigherRamp){
    const realStart=await b312Ledger();
    const highSteps=[];
    const baselinePassed=verdict.verdict===
     'PASS_GENUINE_ORIGINAL_RAMP_UPHILL_KCC';
    const saveHigh=(status,aimPlan=null)=>{
     const payload={schema:'B321_TRUE_CDP_UPPER_RAMP_TRAVERSE',
      source:'25/17/26/0',status,
      prerequisiteB320Passed:baselinePassed,
      first:realStart,aimPlan,steps:highSteps,
      productionAuthorized:false,original4v4Certified:false,
      artAccepted:false};
     const report=b321AuditTrueOriginalHigherRamp(payload);
     writeFileSync(resolve(OUTPUT,'b321-true-original-upper-ramp.json'),
      JSON.stringify({...payload,preliminary:report},null,2));
     return report;
    };
    if(baselinePassed&&realStart.realHumanOriginalFootSupported&&
       realStart.genuineHumanOriginalFootSolid===RAMP_SOLID){
     await cmd('Input.dispatchMouseEvent',
      {type:'mouseMoved',x:800,y:450,button:'none'});
     const beforeCamera=(await snapshot()).cameraSourcePractice;
     const target=b321OriginalRampHighSectionPlan({
      ledger:realStart,camera:beforeCamera});
     if(target.safe){
      await cmd('Input.dispatchMouseEvent',
       {type:'mouseMoved',x:target.screenX,y:450,button:'none'});
      await sleep(150);
      const rotated=(await snapshot()).cameraSourcePractice;
      const cameraDelta=Math.abs(wrap(target.targetYaw-rotated.yawDegrees));
      if(cameraDelta<=3){
       for(let i=0;i<14;i++){
        const before=await b312Ledger();
        if(!before.realHumanOriginalFootSupported||
         before.genuineHumanOriginalFootSolid!==RAMP_SOLID)break;
        const stepped=await b319TrueShortNativeKey('KeyW',4);
        const after=await b312Ledger();
        highSteps.push({realKey:'KeyW',nativeInputTicks:Math.min(4,
         after.tick-before.tick),actualNativeTickDelta:after.tick-before.tick,
         trueNativeTick:stepped.tick,after});
        const audit=saveHigh('REAL_ORIGINAL_UPPER_RAMP_KCC_IN_PROGRESS',target);
        console.log('B321_TRUE_ORIGINAL_HIGH_RAMP_STEP',JSON.stringify({
         count:i+1,realNativeTick:after.tick,
         genuineSupport:after.genuineHumanOriginalFootSolid,
         actualBody:after.actualBodyMeters,
         gainedMeters:audit.maximumHeightIncreaseMeters??null,
         verdict:audit.verdict}));
        if(audit.verdict==='PASS_GENUINE_ORIGINAL_RAMP_HIGH_SECTION_KCC'||
         !after.realHumanOriginalFootSupported||
         after.genuineHumanOriginalFootSolid!==RAMP_SOLID)break;
       }
      }else console.log('B321_HOLD_ORIGINAL_REAL_CDP_YAW_MISMATCH',
       JSON.stringify({desired:target.targetYaw,
        actual:rotated.yawDegrees,cameraDelta}));
     }
    }
    const finalHigh=saveHigh(highSteps.length?
     'TRUE_ORIGINAL_HIGH_RAMP_KCC_OBSERVED':
     'HOLD_NOT_YET_PHYSICALLY_ATTEMPTED');
    await picture('B321_TRUE_ORIGINAL_UPPER_RAMP_KCC');
    console.log('B321_FINAL_NATIVE_UPPER_RAMP_RESULT',
     JSON.stringify({verdict:finalHigh.verdict,
      actualKccSteps:highSteps.length,
      physicalHeightGained:finalHigh.maximumHeightIncreaseMeters??0,
      source:'25/17/26/0',artAccepted:false}));

    if(b322RealCrest){
     let first=await b312Ledger();
     const steps=[];
     const qualified=finalHigh.verdict===
      'PASS_GENUINE_ORIGINAL_RAMP_HIGH_SECTION_KCC';
     // On real SwiftShader 35ms CDP polling, one short KeyW sometimes
     // advances ~6 native ticks and skips the >=.32m rise between
     // B322 ramp contact observations. Take ONE genuine KeyS reverse
     // pulse on the already registered ramp to witness the full
     // original physical rise, rather than relax any B322 threshold.
     let realBackstep=null;
     if(qualified&&b410RealUpperPlay&&first.realHumanOriginalFootSupported&&
        first.genuineHumanOriginalFootSolid===RAMP_SOLID){
      const current=b320SourceRampCoordinates(
       first.originalPositiveRampSourceQuad,first.actualBodyMeters);
      if(current.insideSourceQuadXZ&&
         current.originalUphillFraction>=.70&&
         current.originalUphillFraction<.86){
       const old=first;
       const key=await b319TrueShortNativeKey('KeyS',1);
       const next=await b312Ledger();
       const originalBackstep=b322AuditRealOriginalPreCrestBackstep(
        old,next,'KeyS');
       realBackstep={realKey:'KeyS',wantedTicks:1,
        observedTickDelta:next.tick-old.tick,keyTick:key.tick,
        before:old,after:next,originalBackstep};
       writeFileSync(resolve(OUTPUT,'b322-native-real-crest-backstep.json'),
        JSON.stringify({source:'25/17/26/0',...realBackstep},null,2));
       console.log('B322_REAL_ORIGINAL_CREST_PREENTRY',
        JSON.stringify({before:old.actualBodyMeters,
         after:next.actualBodyMeters,tick:next.tick,originalBackstep}));
       if(!originalBackstep)
        fail('B322_REAL_SOURCE_PRECREST_KCC_UNSAFE_OR_UNOBSERVED');
       first=next;
      }
     }
     // B429: B427's last witnessed genuine ramp fraction .8793
     // fell below the unchanged .90 crest requirement; passing B426
     // started farther downhill (.6711 vs .6914). One real short
     // KeyS down-ramp pulse can preserve the missing crest sample.
     // Refine ONLY on native registered SOURCE ramp, never move an
     // actor by writing coordinates or relax the independent B322 gate.
     const refinements=[];
     if(qualified&&b410RealUpperPlay&&realBackstep&&
        first.realHumanOriginalFootSupported&&
        first.genuineHumanOriginalFootSolid===RAMP_SOLID){
      for(let i=0;i<2;i++){
       const before=first;
       const bc=b320SourceRampCoordinates(
        before.originalPositiveRampSourceQuad,before.actualBodyMeters);
       if(!bc.insideSourceQuadXZ||
          bc.originalUphillFraction<.68||
          bc.originalUphillFraction>.77)break;
       const key=await b319TrueShortNativeKey('KeyS',1,8);
       const after=await b312Ledger();
       const ac=b320SourceRampCoordinates(
        before.originalPositiveRampSourceQuad,after.actualBodyMeters);
       const planar=Math.hypot(
        after.actualBodyMeters[0]-before.actualBodyMeters[0],
        after.actualBodyMeters[2]-before.actualBodyMeters[2]);
       const dy=after.actualBodyMeters[1]-before.actualBodyMeters[1];
       const genuine=after.source==='25/17/26/0'&&
        after.realHumanOriginalFootSupported===true&&
        after.genuineHumanOriginalFootSolid===RAMP_SOLID&&
        Number.isFinite(after.genuineOriginalFootGapMeters)&&
        after.genuineOriginalFootGapMeters>=0&&
        after.genuineOriginalFootGapMeters<=.18&&
        after.sourceActorRelocations===0&&
        after.sourceInkRewritten===false&&
        after.playerPositionRewritten===false&&
        after.originalRows?.length===17&&
        after.originalRows.some(r=>
         r.surfaceId===RAMP_SOLID+':paint'&&
         r.actualHumanFootOnOriginalActiveSurface===true)&&
        Number.isSafeInteger(after.tick)&&
        after.tick>before.tick&&after.tick-before.tick<=24&&
        ac.insideSourceQuadXZ&&
        ac.originalUphillFraction>=.60&&
        ac.originalUphillFraction<bc.originalUphillFraction-.015&&
        bc.originalUphillFraction-ac.originalUphillFraction<=.14&&
        planar>=.04&&planar<=.8&&dy>=-.35&&dy<=.10;
       refinements.push({realKey:'KeyS',wantedTicks:1,
        observedTickDelta:after.tick-before.tick,
        fromOriginalFraction:bc.originalUphillFraction,
        toOriginalFraction:ac.originalUphillFraction,
        genuine,before,after,keyTick:key.tick});
       writeFileSync(resolve(OUTPUT,
        'b429-native-original-crest-entry-refinement.json'),
        JSON.stringify({source:'25/17/26/0',refinements},null,2));
       console.log('B429_GENUINE_ORIGINAL_RAMP_ENTRY_REFINEMENT',
        JSON.stringify({index:i+1,from:bc.originalUphillFraction,
         to:ac.originalUphillFraction,tick:after.tick,genuine}));
       if(!genuine)
        fail('B429_REFUSED_NONORIGINAL_RAMP_REFINEMENT');
       first=after;
      }
     }
     const save=(status,plan=null)=>{
      const data={schema:'B322_REAL_NATIVE_CREST_EXIT',
       source:'25/17/26/0',status,first,plan,steps,
       originalSourceRealEntryBackstep:realBackstep,
       additionalGenuineOriginalEntryBacksteps:refinements,
       prerequisiteB321Passed:qualified,productionAuthorized:false,
       original4v4Certified:false,artAccepted:false};
      const independent=b322AuditNativeOriginalCrestExit(data);
      writeFileSync(resolve(OUTPUT,'b322-actual-original-ramp-crest.json'),
       JSON.stringify({...data,independent},null,2));
      return independent;
     };
     if(qualified&&first.realHumanOriginalFootSupported&&
        first.genuineHumanOriginalFootSolid===RAMP_SOLID){
      await cmd('Input.dispatchMouseEvent',
       {type:'mouseMoved',x:800,y:450,button:'none'});
      const camera=(await snapshot()).cameraSourcePractice;
      const plan=b322PlanActualOriginalCrest(first,camera);
      if(plan.safe){
       await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
        x:plan.screenX,y:450,button:'none'});
       await sleep(150);
       const realCamera=(await snapshot()).cameraSourcePractice;
       if(Math.abs(wrap(plan.targetYaw-realCamera.yawDegrees))<=3){
        let phase='RAMP';
        for(let i=0;i<26;i++){
         const before=await b312Ledger();
         if(!before.realHumanOriginalFootSupported||
          ![RAMP_SOLID,UPPER_FLOOR_SOLID].includes(
           before.genuineHumanOriginalFootSolid))break;
         // Real B410 failure: on original ramp fraction .89328 the
         // next 6-tick original KCC sample was already UPPER at .98101.
         // Smaller REAL CDP pulses near the source crest retain the
         // unchanged B322 original-ownerGrid and physical foot gates.
         const crestSource=b320SourceRampCoordinates(
          before.originalPositiveRampSourceQuad,before.actualBodyMeters);
         const fine=b410RealUpperPlay&&phase==='RAMP'&&
          before.genuineHumanOriginalFootSolid===RAMP_SOLID&&
          crestSource.insideSourceQuadXZ&&
          crestSource.originalUphillFraction>=.78;
         const keyTicks=fine?1:2;
         // B424: B418 observed an actual source crest on ramp step 3,
         // but B423 passed to the upper floor before sampling the crest.
         // Observe genuine 60Hz input more often ONLY near the crest.
         // Original collision, height, provenance and owner gates remain.
         const nativePollMs=fine?8:35;
         const actual=await b319TrueShortNativeKey(
          'KeyW',keyTicks,nativePollMs);
         const after=await b312Ledger();
         steps.push({phase,realKey:'KeyW',nativeInputTicks:keyTicks,
          actualPollMs:nativePollMs,
          actualNativeTickDelta:after.tick-before.tick,
          actualTick:actual.tick,after});
         const report=save('REAL_ORIGINAL_CREST_KCC_RUNNING',plan);
         console.log('B322_REAL_ORIGINAL_CREST_KCC_STEP',
          JSON.stringify({i:i+1,phase,body:after.actualBodyMeters,
           solid:after.genuineHumanOriginalFootSolid,
           verdict:report.verdict}));
         // Stop actual B410 if native upper-floor contact occurs before
         // the real ramp crest was sampled. This is HOLD, not PASS.
         if((b410RealUpperPlay&&
             after.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
             !report.crestProven)||
           report.originalUpperFloorReached||
           report.firstUnsupportedNativeStep!==null||
           !after.realHumanOriginalFootSupported||
           ![RAMP_SOLID,UPPER_FLOOR_SOLID].includes(
             after.genuineHumanOriginalFootSolid))break;
         if(report.crestProven)phase='EXIT';
        }
       }else console.log('B322_HOLD_ACTUAL_CDP_CAMERA_HEADING',
        JSON.stringify({actual:realCamera.yawDegrees,
         expected:plan.targetYaw}));
      }else console.log('B322_HOLD_NO_NATIVE_CREST_HEADING',
       JSON.stringify(plan));
     }
     const verdict=save(steps.length?'REAL_PHYSICAL_CREST_ATTEMPT':
      'HOLD_NO_PHYSICAL_CREST_INPUT');
     b322ActualUpperExitProven=verdict.originalUpperFloorReached===true;
     console.log('B322_NATIVE_REAL_CREST_RESULT',JSON.stringify({
      verdict:verdict.verdict,crest:verdict.crestProven,
      nextOriginalFloor:verdict.originalUpperFloorReached,
      steps:steps.length,source:'25/17/26/0'}));

     if(b324UpperFloor){
      const priorB322=JSON.parse(readFileSync(
       resolve(OUTPUT,'b322-actual-original-ramp-crest.json'),'utf8'));
      // Anchor directly to the final genuine B322 KCC witness. Do not
      // insert a screenshot/another snapshot between the two actual paths.
      const firstUpper=steps.at(-1)?.after??await b312Ledger(),stepsUpper=[];
      const saveUpper=status=>{
       const attempt={schema:'B324_REAL_ORIGINAL_UPPER_FLOOR',
        source:'25/17/26/0',status,first:firstUpper,steps:stepsUpper,
        productionAuthorized:false,original4v4Certified:false,
        artAccepted:false};
       const audit=b324AuditGenuineUpperFloor(priorB322,attempt);
       writeFileSync(resolve(OUTPUT,'b324-real-original-upper-floor.json'),
        JSON.stringify({...attempt,preliminary:audit},null,2));
       return audit;
      };
      if(verdict.originalUpperFloorReached===true&&
         firstUpper.realHumanOriginalFootSupported===true&&
         firstUpper.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID){
       for(let i=0;i<8;i++){
        const before=await b312Ledger();
        if(!before.realHumanOriginalFootSupported||
           before.genuineHumanOriginalFootSolid!==UPPER_FLOOR_SOLID)break;
        const press=await b319TrueShortNativeKey('KeyW',2);
        const after=await b312Ledger();
        stepsUpper.push({realKey:'KeyW',nativeInputTicks:2,
         actualNativeTickDelta:after.tick-before.tick,
         actualTick:press.tick,before,after});
        const result=saveUpper('GENUINE_UPPER_FLOOR_NATIVE_INPUT');
        console.log('B324_REAL_ORIGINAL_UPPER_FLOOR_STEP',JSON.stringify({
         i:i+1,body:after.actualBodyMeters,
         nativeFoot:after.genuineHumanOriginalFootSolid,
         verdict:result.verdict}));
        if(result.continuousUpperFloor||
           result.firstUnsupportedStep!==null||
           !after.realHumanOriginalFootSupported||
           after.genuineHumanOriginalFootSolid!==UPPER_FLOOR_SOLID)break;
       }
      }
      const report=saveUpper(stepsUpper.length?
       'REAL_UPPER_FLOOR_KCC_OBSERVED':'HOLD_NO_REAL_UPPER_FLOOR_INPUT');
      console.log('B324_NATIVE_ORIGINAL_UPPER_FLOOR_RESULT',JSON.stringify({
       verdict:report.verdict,supported:report.genuineSupportedNativeSteps??0,
       meters:report.witnessedPlanarMeters??0,
       source:'25/17/26/0',productionAuthorized:false}));
      if(b326ExtendedFloor){
       const priorB324=JSON.parse(readFileSync(
        resolve(OUTPUT,'b324-real-original-upper-floor.json'),'utf8'));
       // Continue from the last actual B324 state, before any framebuffer
       // capture. Never relocate the actor or modify the game clock.
       const nextStart=stepsUpper.at(-1)?.after??firstUpper;
       const extended=[];
       // B418: preserve the FULL independent audit on each actual CDP
       // step, but DO NOT stringify/write 17 original GRID rows after
       // every short KeyW. The previous real native trial showed 3 idle
       // ticks and 0.192m inertial drift between steps 5 and 6 while
       // 0.15m remained the unchanged hard limit. Long synchronous file
       // writes inside the movement chain can cause avoidable gaps.
       // Save the complete native before/after evidence at the end.
       const saveB326=(status,persist=true)=>{
        const data={schema:'B326_NATIVE_SOURCE_UPPER_FLOOR_EXTENSION',
         source:'25/17/26/0',status,first:nextStart,steps:extended,
         productionAuthorized:false,original4v4Certified:false,
         artAccepted:false};
        const verdict=b326AuditExtendedUpperFloor(
         priorB322,priorB324,data);
        if(persist)
         writeFileSync(resolve(OUTPUT,'b326-extended-original-upper-floor.json'),
          JSON.stringify({...data,preliminary:verdict},null,2));
        return verdict;
       };
       if(report.continuousUpperFloor&&
          nextStart.realHumanOriginalFootSupported===true&&
          nextStart.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID){
        for(let i=0;i<8;i++){
         const before=await b312Ledger();
         if(!before.realHumanOriginalFootSupported||
            before.genuineHumanOriginalFootSolid!==UPPER_FLOOR_SOLID)break;
         const pressed=await b319TrueShortNativeKey('KeyW',2);
         const after=await b312Ledger();
         extended.push({realKey:'KeyW',nativeInputTicks:2,
          actualNativeTickDelta:after.tick-before.tick,
          actualTick:pressed.tick,before,after});
         const witness=saveB326('REAL_NATIVE_EXTENSION_OBSERVED',false);
         console.log('B326_ORIGINAL_UPPER_FLOOR_STEP',JSON.stringify({
          step:i+1,body:after.actualBodyMeters,
          nativeFoot:after.genuineHumanOriginalFootSolid,
          verdict:witness.verdict,
          extraMeters:witness.actualAdditionalPlanarMeters??0}));
         if(witness.extendedUpperFloorProven||
            witness.firstUnsupportedStep!==null||
            !after.realHumanOriginalFootSupported||
            after.genuineHumanOriginalFootSolid!==UPPER_FLOOR_SOLID)break;
        }
       }
       const result=saveB326(extended.length?
        'GENUINE_EXTENDED_KCC_INPUT_RECORDED':
        'HOLD_NO_EXTENDED_ORIGINAL_UPPER_FLOOR_INPUT');
       await picture('B326_TRUE_UPPER_FLOOR_EXTENSION');
       console.log('B326_NATIVE_EXTENDED_UPPER_FLOOR_RESULT',
        JSON.stringify({verdict:result.verdict,
         extraMeters:result.actualAdditionalPlanarMeters??0,
         totalVerifiedMeters:result.combinedVerifiedUpperFloorMeters??0,
         source:'25/17/26/0',productionAuthorized:false}));
      }
      // This screenshot cannot interrupt the B324->B326 KCC chain.
      await picture('B324_TRUE_ORIGINAL_UPPER_FLOOR_KCC');
     }
     // Record a true framebuffer without interrupting the B322->B324
     // input chain. B322's independent pass uses native per-step ledgers.
     // When B324 ran, this is a POST-continuation upper-floor screenshot.
     await picture('B322_TRUE_ORIGINAL_RAMP_CREST_EXIT_KCC');
    }

   }
  }
 }
  }
  saveAttempt(actualLower,'B164_GENUINE_LOWER_SOURCE_FOOT_AND_A1_GATE');
  console.log('B164_ACTUAL_SOURCE_STANDOFF_WITNESS',JSON.stringify(lowerReport));
  if(b328NativeA1&&coopAttempt===1){
   await evaluate(`(() => {const u=new URL(location.href);
    u.searchParams.set('t21B312','genuineSecondHumanPaint');
    history.replaceState(null,'',u.href);return true;})()`);
   const steps=[];
   const saveRally=status=>writeFileSync(
    resolve(OUTPUT,'b328-actual-original-human-a1.json'),
    JSON.stringify({schema:'B328_TRUE_NATIVE_A1_RECOVERY',
     source:'25/17/26/0',status,steps,
     realHumanInputOnly:true,sourceRouteCertified:false,
     productionAuthorized:false,original4v4Certified:false},null,2));
   saveRally('ORIGINAL_NATIVE_A1_RESEARCH_STARTED');
   for(let i=0;i<8;i++){
    const before=await snapshot();authority(before,'FIXED');
    if(before.b25SourcePaintRun.status!=='RUNNING'||
       before.matchState!=='PLAYING')break;
    const initial=await b312Ledger();
    const plan=b328Plan(before,initial);
    if(!plan.eligible){
     console.log('B328_HOLD_NO_REAL_SUPPORTED_A1_INPUT',
      JSON.stringify({step:i+1,reason:plan.reason,gap:plan.gap}));
     break;
    }
    await b328ShortNativeKey(plan.key,2);
    const after=await snapshot();authority(after,'FIXED');
    const final=await b312Ledger();
    const audit=b328AuditStep(before,initial,after,final,plan);
    steps.push({before,initial,after,final,plan,audit});
    saveRally('REAL_CDP_INPUT_OBSERVED');
    console.log('B328_REAL_HUMAN_ORIGINAL_A1_KCC_STEP',
     JSON.stringify({step:i+1,key:plan.key,
      humanMeters:audit.actualHumanMeters,
      gapReduced:audit.measuredA1GapReductionMeters,
      verdict:audit.verdict}));
    if(!audit.passes)break;
   }
   saveRally(steps.length?'REAL_NATIVE_MOVEMENT_ATTEMPT':'HOLD_NO_INPUT');
   await picture('B328_REAL_SOURCE_A1_APPROACH');
  }
 }else{
  saveAttempt(human,'B163_HOLD_REAL_HUMAN_OBJECTIVES_UNMET');
  console.log('B163_NATIVE_HUMAN_OBJECTIVE_HOLD',
   JSON.stringify(human.b25SourcePaintRun));
 }
 // A1 may only aim after reaching the genuine player KCC position.
 // Allow native time, not simulated shots, for any delayed source impact.
 let final=await snapshot();
 const settleMax=Math.min(started.tick+3300,final.tick+1200);
 while(final.tick<settleMax&&
       final.b25SourcePaintRun.status==='RUNNING'&&
       final.matchState==='PLAYING'){
  await sleep(500);
  final=await snapshot();authority(final,'FIXED');
  if(final.stopReason)fail('B162_REAL_SOURCE_STOP_'+final.stopReason);
 }
 const run=final.b25SourcePaintRun;
 const ui=await evaluate(`(() => {
  const card=document.querySelector('#t21-f3-b25-paint-run');
  const a=document.querySelector('#t21-f3-b161-ally');
  return {status:card?.dataset.t21B53Status,
   mode:card?.dataset.t21B56ActiveVariant,
   allyCells:a?.dataset.t21B161ActualOriginalA1ChangedInk,
   allyText:a?.textContent,winner:a?.dataset.t21B161OfficialWinner,
   b165Phase:a?.dataset.t21B165Phase,
   b165GenuineClear:a?.dataset.t21B165GenuineClear,
   b165NoWinner:a?.dataset.t21B165OriginalWinner,
   b165Scoreable:a?.dataset.t21B165SourceScoreable,
   b165LiveGuidance:a?.querySelector('#t21-f3-b165-status')?.textContent,
   b166RealAllyStatus:a?.querySelector('#t21-f3-b166-tactics')?.dataset.t21B166Status,
   b166NoInventedRoute:a?.querySelector('#t21-f3-b166-tactics')?.dataset.t21B166DirectIsNotPath,
   b166NoWinner:a?.querySelector('#t21-f3-b166-tactics')?.dataset.t21B166OfficialWinner,
   b168NativeUiStatus:card?.dataset.t21B168DisplayedNativeStatus,
   b168NativeUiTick:card?.dataset.t21B168DisplayedNativeTick,
   b168ClearToastVisible:document.querySelector('#t21-f3-b168-real-practice-clear')?.hidden===false,
   b168ClearToastGenuine:document.querySelector('#t21-f3-b168-real-practice-clear')?.dataset.t21B168GenuineClear,
   scoreable:card?.dataset.scoreable,
   sourceAuthority:card?.dataset.productionAuthority};
 })()`);
 const actualClear=run.status==='CLEAR'&&run.practiceVariant==='ALLY_SYNC'&&
   run.humanChangedImpactCells>=180&&
   run.realGroundedTravelMeters>=12&&
   run.actualOriginalA1ChangedImpactCells>=30&&
   run.actualOriginalA1TaggedImpactEvents>0&&
   run.originalA1CooperativeGoalSatisfied===true&&
   run.officialWinner==='NONE'&&final.sourceScoreablePromotions===0&&
   ui.status==='CLEAR'&&ui.mode==='ALLY_SYNC'&&
   Number(ui.allyCells)>=30&&
   ui.b165Phase==='REAL_COOPERATIVE_CLEAR'&&
   ui.b165GenuineClear==='true'&&
   ui.b165NoWinner==='NONE'&&ui.b165Scoreable==='0'&&
   ui.b165LiveGuidance?.includes('COOPERATIVE PRACTICE CLEAR')&&
   ui.b166RealAllyStatus!==undefined&&
   ui.b166RealAllyStatus!=='OFF'&&
   ui.b166NoInventedRoute==='true'&&ui.b166NoWinner==='NONE'&&
   ui.b168NativeUiStatus==='CLEAR'&&
   Number.isSafeInteger(Number(ui.b168NativeUiTick))&&
   Number(ui.b168NativeUiTick)>0&&
   ui.b168ClearToastVisible===true&&ui.b168ClearToastGenuine==='true'&&
   ui.winner==='NONE'&&
   ui.scoreable==='0'&&ui.sourceAuthority==='NONE';
 saveAttempt(final,actualClear?
  'B162_NATIVE_60HZ_GENUINE_COOPERATIVE_CLEAR':
  'B162_HOLD_REAL_SOURCE_COOPERATIVE_NOT_CLEARED');
 // This F2 CI MUST NOT report success solely because A1 happened to CLEAR.
 // A true B322 upper-floor exit still requires its independent KCC verdict.
 if(b322RealCrest&&!b322ActualUpperExitProven)
  fail('B322_REAL_ORIGINAL_RAMP_UPPER_EXIT_NOT_CERTIFIED');
 if(!actualClear){
  console.error('B162_REAL_SOURCE_COOPERATIVE_HOLD',JSON.stringify({
   humanCells:run.humanChangedImpactCells,
   realGroundMeters:run.realGroundedTravelMeters,
   exactA1InkSinceStart:run.actualOriginalA1ChangedImpactCells,
   taggedA1Impacts:run.actualOriginalA1TaggedImpactEvents,
   nativeA1Foot:final.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot??null,
   b169NativeGuardTargets:final.cpu.sourcePatrol.b169NativeAdvanceGuardTargets,
   b169RejectedGuardGoals:final.cpu.sourcePatrol.b169RejectedUnsafeOrUnreachableGoals,
   b137ApprovedRallies:final.cpu.sourcePatrol.b137ApprovedNativeRallies,
   b150ApprovedInkAims:final.cpu.sourcePatrol.b150ApprovedInkAims,
   status:run.status,abort:run.abortReason,ui}));
  if(b316GenuineRampWalk&&b316ActualRampWalkProven){
   // Keep A1's failed cooperative mission as a distinct genuine HOLD.
   // A source-backed native KCC walk does not depend on two B315 paint hits.
   console.log('B316_REAL_F2_RAMP_PASS_A1_MISSION_STILL_HOLD',
    JSON.stringify({A1Cells:run.actualOriginalA1ChangedImpactCells,
     actualCoopStatus:run.status,b316OriginalRampWalk:true,
     b315ThreePaintSurfacesProven:b316ThreeOriginalHumanSurfacesProven,
     source:'25/17/26/0',officialWinner:'NONE'}));
   return;
  }
  fail('B162_NATIVE_ORIGINAL_ALLY_SYNC_NOT_CLEARED');
 }
 await picture(coopAttempt===1?'W10B162_GENUINE_ORIGINAL_COOPERATIVE_CLEAR':
  'W10B200_SECOND_GENUINE_ORIGINAL_COOPERATIVE_CLEAR');
 console.log('B162_NATIVE_ORIGINAL_ALLY_SYNC_CLEAR',JSON.stringify({
  ticks:run.elapsedTicks,actualHumanInk:run.humanChangedImpactCells,
  realGroundMeters:run.realGroundedTravelMeters,
  actualNewTaggedA1Ink:run.actualOriginalA1ChangedImpactCells,
  sourceA1ImpactEvents:run.actualOriginalA1TaggedImpactEvents,
  officialWinner:'NONE'}));

}
async function doPhysicalTrial(coopAttempt=1){
 const boot=await snapshot();authority(boot,'FIXED');
 // B161: real on-page source-only cooperative challenge is discoverable
 // exclusively with explicit A1 rally + real A1 ink experimental opt-in.
 const b161Option=await evaluate(
  'document.querySelector("#t21-f3-b25-paint-run")?.dataset.t21B161AllySyncAvailable ?? ""');
 const b161Winner=await evaluate(
  'document.querySelector("#t21-f3-b25-paint-run")?.dataset.t21B161OfficialWinner ?? ""');
 if(b161Option!==(allyOptIn?'true':'false')||b161Winner!=='NONE')
  fail('B161_SOURCE_ALLY_SYNC_OPT_IN_OR_TURF_AUTHORITY');

 if(boot.matchState!=='STAGING'||boot.paused!==b203FullRoundTrial||
    (b203FullRoundTrial&&(boot.tick!==0||boot.timeRemainingSeconds!==180))||
    boot.cpu.sourcePatrol.b137AllyRallyOptIn!==allyOptIn||
    boot.b112OriginalHumanGround?.enabled!==(b194ButtonTrial?false:true))
  fail('NOT_REAL_ORIGINAL_7CPU_KCC_BOOT');
 const search=await evaluate('location.search');
 const actualUserUrl=b194ButtonTrial?
  ('?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop'+
   (b203FullRoundTrial?'&t21W10B203=fullRound':'')):
  ('?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
   (allyOptIn?'&t21W10B137=allyRally&t21W10B150=allyInk':'')+
   (b154TeamCoverage?'&t21W10B154=teamCoverage':'')+
   '&t21W10B149=contactTrace');
 if(search!==actualUserUrl)
  fail('INVALID_SOURCE_PRACTICE_URL');
 // B242: full rounds require the real player's explicit ready/start click.
 if(b203FullRoundTrial){
  const ready=await evaluate(`(() => {
   const p=document.querySelector('#t21-f3-b202-real-pause');
   return {state:p?.dataset.t21B202NativeState,visible:!!p&&!p.hidden};
  })()`);
  if(ready.state!=='READY_TO_START'||ready.visible!==true)
   fail('B242_FULL_COOP_ROUND_NOT_READY');
  // In the FIRST full-round genuine B162 trial, arm the actual
  // visible A1 mission BEFORE the real 180-second start. B200's second
  // separate world intentionally retains its older B330 paused-arm
  // verification path in playB162GenuineAllySync.
  if(b162ReadyPrearm&&b162CoopTrial&&coopAttempt===1){
   const beforeMission=await snapshot();authority(beforeMission,'FIXED');
   if(beforeMission.tick!==0||beforeMission.matchState!=='STAGING'||
      !beforeMission.paused||beforeMission.cpu.physicalRejoins.length!==0||
      beforeMission.b25SourcePaintRun.status!=='IDLE')
    fail('B162_READY_PREARM_SOURCE_BOOT_NOT_CLEAN');
   await clickButton('#t21-f3-b25-start');
   const readyMission=await snapshot();authority(readyMission,'FIXED');
   if(readyMission.tick!==0||!readyMission.paused||
      readyMission.b25SourcePaintRun.status!=='ARMED'||
      readyMission.b25SourcePaintRun.practiceVariant!=='ALLY_SYNC'||
      readyMission.b25SourcePaintRun.elapsedTicks!==0||
      readyMission.cpu.physicalRejoins.length!==0||
      readyMission.cpu.physicalFootRelocations!==0)
    fail('B162_READY_PREARM_NOT_AUTHENTIC_'+JSON.stringify({
     tick:readyMission.tick,mission:readyMission.b25SourcePaintRun}));
   console.log('B162_TRUE_READY_A1_MISSION_ARMED_NATIVE_TICK_ZERO',
    JSON.stringify({source:'25/17/26/0',tick:0,
     practiceStatus:'ARMED',realActorRejoins:0,
     realNativeTimeElapsed:0,syntheticCpuWrites:0}));
  }
  await clickButton('#t21-f3-b202-resume');
 }else await click(800,450);
 await until(()=>evaluate('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const started=boot.tick;
 const nativeGameStart=await until(async()=>{
  const n=await snapshot();authority(n,'FIXED');
  if(n.cpu.physicalFootRelocations!==0)fail('ORIGINAL_CPU_FOOT_MOVED_BY_QA');
  return n.matchState==='PLAYING'&&n.cpu.physicalRejoins.length===7&&
    n.cpu.freeCombatEnabled?n:false;
 },12*60*1000);
 const steps=[
  // B120/B123 pre-existing authentic original-source descent: real
  // PlayCanvas camera-relative CDP inputs, never snap or position set.
  {name:'TRUE_SOURCE_FIRST_DROP_W200',keys:['KeyW'],ticks:200},
  {name:'TRUE_SOURCE_LOWER_LANDING_D12',keys:['KeyD'],ticks:12},
  {name:'TRUE_SOURCE_LOWER_FORWARD_W18',keys:['KeyW'],ticks:18},
  // B146: B145 actual lower KCC foot was .442m from the *existing*
  // original polygon boundary, below the .75m safe native rally inset.
  // Real KeyA12 was independently demonstrated on an original floor in
  // B126; transfer is unproven here and measured, never asserted.
  {name:'B146_TRUE_ORIGINAL_INWARD_A12',keys:['KeyA'],ticks:12},
  {name:'B146_TRUE_ORIGINAL_COAST60',keys:[],ticks:60}
 ];
 if(b162CoopTrial){
  // B163: arm on original certified upper floor, BEFORE the first
  // descent; the prior route-then-W/S order caused a genuine fall.
  await playB162GenuineAllySync(steps,coopAttempt);
  return;
 }
 let lastSampleTick=-1000;
 const routeWitness=[];
 const observe=(n,phase,force=false)=>{
  if(force||n.tick-lastSampleTick>=12){
   lastSampleTick=n.tick;
   const sample=sampleB140RealSourcePhysicalTrace(n,phase);
   routeWitness.push(sample);
   history.push(sample);
   if(history.length%12===0)save();
  }
 };
 observe(nativeGameStart,'REAL_7_OF_7_PLAYING',true);
 save(); // Keep genuine 7/7 evidence even if later native input fails.
 // B141: verify the actual opt-in on-screen physical distance indicator
 // in a real WebGL2/pointer-locked browser. The UI remains a pure view:
 // no original route, target, player pose or actor state is manipulated.
 const b141Observed=await until(async()=>{
  const hud=await evaluate(`(() => {
   const el=document.querySelector('#t21-f3-b141-real-ally');
   return el?{visible:!el.hidden&&el.style.display!=='none',
    sourceOnly:el.dataset.t21B141PhysicalOnly,
    scoreable:el.dataset.t21B141Scoreable,
    routeCertified:el.dataset.t21B141CertifiedRoute,
    state:el.dataset.t21B141State,text:el.textContent}:null;
  })()`);
  if(!allyOptIn)return hud===null?{normalFixedNoAllyHud:true}:false;
  return hud?.visible&&hud.sourceOnly==='REAL_RAPIER_AND_KCC'&&
   hud.scoreable==='0'&&hud.routeCertified==='false'&&
   hud.text?.includes('A1')&&hud.state!=='WAITING_7_CPU'?hud:false;
 },40000);
 history.push({b141ActualPointerLockedSourceHud:b141Observed,realNativeTick:nativeGameStart.tick});
 save();
 const beforeMove=await snapshot();
 let firstMouseRelease=false;
 for(const phase of steps){
  if(phase.name==='TRUE_SOURCE_FIRST_DROP_W200'){
   const shotsBefore=(await snapshot()).shotsFired;
   await cmd('Input.dispatchMouseEvent',
    {type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
   const pressStart=await snapshot();
   const untilShot=await until(async()=>{
    const n=await snapshot();authority(n,'FIXED');
    observe(n,'REAL_MOUSE_WITH_WALK');
    return n.tick>=pressStart.tick+33?n:false;
   },100000);
   await cmd('Input.dispatchMouseEvent',
    {type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
   firstMouseRelease=true;
   if(untilShot.shotsFired<=shotsBefore)
    fail('REAL_MOUSE_POINTERLOCK_SHOTS_REQUIRED');
   // The real 33-tick mouse pulse occurs before the W key goes down:
   // keep the complete preverified W200 physical source-descent program.
   // No 167-tick shortening, synthetic game tick, or input substitution.
  }
  const n=await nativeOriginalKeyboard(phase,observe);
  observe(n,phase.name+'_END',true);
  save(); // Record each genuine real-key stage before followup.
 }
 if(!firstMouseRelease)fail('REAL_MOUSE_NOT_RELEASED');
 const routeEnd=await snapshot();
 const continuedUntil=routeEnd.tick+900;
 const settleStart=Date.now();
 let lastTick=routeEnd.tick,lastAdvanceAt=Date.now();
 while(Date.now()-settleStart<25*60*1000){
  await sleep(800);
  const n=await snapshot();authority(n,'FIXED');
  if(n.cpu.physicalFootRelocations!==0)fail('CPU_POSITION_RELOCATION');
  if(n.tick>lastTick){lastAdvanceAt=Date.now();lastTick=n.tick;}
  else if(Date.now()-lastAdvanceAt>90000)
   fail('PHYSICS_NOT_ADVANCING');
  observe(n,'REAL_NATIVE_CPU_A1_FOLLOWUP');
  if(n.tick>=continuedUntil||n.matchState==='TIME_UP')break;
 }
 const final=await snapshot();authority(final,'FIXED');
 observe(final,'FINAL_REAL_SOURCE',true);
 // B160 user-facing REAL seven-CPU changed ink HUD, source-only no winner.
 const b160Live=await evaluate('document.querySelector("#t21-f3-b160-native-ink-live")?.textContent ?? ""');
 const b160Winner=await evaluate('document.querySelector("#t21-f3-b160-native-ink-live")?.dataset.t21B160OfficialWinner ?? ""');
 if(!b160Live.includes('7 CPU REAL INK CHANGES')||
    !b160Live.includes('no winner')||b160Winner!=='NONE')
  fail('B160_REAL_NATIVE_UNSCORED_CPU_INK_UI_MISSING');
 const approved=final.cpu.sourcePatrol.b137ApprovedNativeRallies;
 if(!allyOptIn&&approved!==0)fail('FIXED_SOURCE_GOAL_CONTAMINATED');
 await picture('w10b139-'+variant.toLowerCase()+'-source-physics');
 // B145: actual original LOWER source foot, not merely positive-Z upper
 // source plateau. Native B112 KCC + original floor-gap proof are required.
 const realLower=routeWitness.filter(x=>{
  const footOffset=x.canonicalHumanFootOffsetMeters;
  if(!Number.isFinite(footOffset)||footOffset<=0||footOffset>=2||
     !Array.isArray(x.actualHumanKccBody)||
     !x.actualHumanKccBody.every(Number.isFinite)||
     x.actualHumanKccGrounded!==true||
     typeof x.originalRapierSupportId!=='string'||
     !Number.isFinite(x.originalRapierSourceSupportGapMeters)||
     Math.abs(x.originalRapierSourceSupportGapMeters)>.22)return false;
  const footY=x.actualHumanKccBody[1]-footOffset;
  return footY>=2.7&&footY<=5.25&&x.actualHumanKccBody[2]>=33;
 });
 const meaningful=realLower.length;
 const beforeInward=routeWitness.find(x=>
  x.phase==='TRUE_SOURCE_LOWER_FORWARD_W18_END')??null;
 const afterInward=routeWitness.find(x=>
  x.phase==='B146_TRUE_ORIGINAL_COAST60_END')??null;
 const genuineInnerFoot=realLower.filter(x=>
  x.b146OriginalFlatInside===true&&
  x.b146OriginalFlatVerticalBandWithin22cm===true&&
  Number.isFinite(x.b146OriginalFlatEdgeClearanceMeters)&&
  x.b146OriginalFlatEdgeClearanceMeters>=.75);
 const b146ActualNativeSourceInward={
  bodyBeforeRealKeyA:beforeInward?.actualHumanKccBody??null,
  bodyAfterRealKeyAAndCoast:afterInward?.actualHumanKccBody??null,
  frozenPolygonMarginBeforeKeyA:
   beforeInward?.b146OriginalFlatEdgeClearanceMeters??null,
  frozenPolygonMarginAfterKeyA:
   afterInward?.b146OriginalFlatEdgeClearanceMeters??null,
  genuineLowerInteriorNativeSamples:genuineInnerFoot.length,
  sourceOriginalKccGroundedAfterCoast:
   afterInward?.actualHumanKccGrounded===true,
  originalFlatInsetSafeAtSettle:
   afterInward?.b146OriginalFlatInside===true&&
   afterInward?.b146OriginalFlatVerticalBandWithin22cm===true&&
   Number.isFinite(afterInward?.b146OriginalFlatEdgeClearanceMeters)&&
   afterInward.b146OriginalFlatEdgeClearanceMeters>=.75,
  sourceActorTeleports:0,originalStageAddedSolids:0,
  originalStageAddedNavLinks:0,scoreablePromotions:0,
  actualAllyPhysicalMeetingCertified:false
 };
 const sameLevel=realLower.filter(x=>x.realCpuA1Mobility==='GROUND'&&
  Array.isArray(x.actualA1RapierFoot)&&
  x.actualA1RapierFoot.every(Number.isFinite)&&
  x.actualA1RapierFoot[2]>=33&&
  Math.abs(x.actualHumanKccBody[1]-
   x.canonicalHumanFootOffsetMeters-x.actualA1RapierFoot[1])<=.30);
 const eligibleSameLevel=sameLevel.filter(x=>x.realSeparationXZ>=3&&
  x.realSeparationXZ<=18);
 const realNativeEvidence={
  actualLowerGroundedSampleCount:meaningful,
  actualSameLowerA1FootSampleCount:sameLevel.length,
  actualSameLowerNativeCandidateBandSamples:eligibleSameLevel.length,
  observedA1NativeStandoffGoalApprovals:
   final.cpu.sourcePatrol.b142OriginalStandoffGoalsApproved,
  observedA1RetainedNativeStandoffRequests:
   final.cpu.sourcePatrol.b143ReauthorizedStableStandoffGoals,
  physicalMeetingCertified:false,
  lowerFloorOriginalRayAloneDoesNotCertifyCapsule:true,
  interpretation:meaningful===0?
   'HOLD_NO_REAL_ORIGINAL_LOWER_GROUNDED_KCC_SAMPLES':
   sameLevel.length===0?'HOLD_HUMAN_AND_A1_DIFFERENT_ACTUAL_LOWER_FEET':
   approved===0?'HOLD_NO_ORIGINAL_NATIVE_ALLY_APPROVAL':
   'NATIVE_SOURCE_GOAL_APPROVED_BUT_PHYSICAL_MEETING_UNVERIFIED'
 };
 const evidence={
  schema:'W10_B139_TRUE_ORIGINAL_REAL_CHROME_SOURCE_DESCENT_ALLY_V1',
  variant,
  nativeGameStartedOnlyAfterSevenPhysicalCpuRejoins:true,
  initialRealNativeTick:started,
  nativePlayingTick:nativeGameStart.tick,
  startBeforeRealInputTick:beforeMove.tick,
  actualPhysicalSourceRouteProgram:steps,
  originalB141VisibleAllyUiEvidence:b141Observed,
  endNativeTick:final.tick,
  originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  original4v4Certified:false,activationReady:false,productionAuthorized:false,
  normalFixedPatrolUnmodified:true,
  originalPhysicalCpuRejoins:final.cpu.physicalRejoins,
  cpuFootRelocations:final.cpu.physicalFootRelocations,
  sourceAllyNativeGoalApprovals:approved,
  realOriginalSupportedGroundSamples:meaningful,
  b145NativeOriginalLowerFootEvidence:realNativeEvidence,
  b146ActualNativeSourceInward:b146ActualNativeSourceInward,
  b149ActualNativeHumanA1Contact:final.b149ActualNativeHumanA1Contact,
  interpretation:realNativeEvidence.interpretation,
  actualHumanAndA1RapierFootSamples:routeWitness,
  finalNativePatrol:final.cpu.sourcePatrol,
  b150ActualAllyTurfShots:final.cpu.cpuSourceTurfShotsByActor?.A1??0,
  b150SourceInkCandidates:final.cpu.sourcePatrol.b150SourceCandidateSamples,
  b150VerifiedSourceAimProposals:final.cpu.sourcePatrol.b150ApprovedInkAims,
  b150RealPaintHitsNotInferredFromAimProposals:true,
  b151A1RealProjectileImpactInk:final.b151AllyRealInkImpactEvidence,
  b152ExactOriginalAllyAimPaintProvenance:
   final.b152ExactAllyAimPaintProvenance,
  b154NativeSevenCpuInk:final.b154NativeSevenCpuInk,
  b154SourceInkSweepAuthority:final.b64SourceInkSweep,
  // B155: actual original NavMesh + registered Rapier source-only rays.
  // These observations NEVER certify a continuous original KCC route.
  b155OriginalSourceConnectivityReview:
   final.b155OriginalSourceConnectivityReview,
  b156OriginalUnderpassGapTriage:
   final.b156OriginalUnderpassGapTriage,
  b157OriginalBidirectionalSourceAudit:
   final.b157OriginalBidirectionalSourceAudit,
  b158OriginalSourceFaceRecastMatch:
   final.b158OriginalSourceFaceRecastMatch,
  b159OriginalFaceNavMeshProjection:
   final.b159OriginalFaceNavMeshProjection,
  b160OriginalCpuPaintHudNativeObserved:b160Live,
  b160OriginalCpuPaintHudWinner:b160Winner,
  b161SourceAllySyncOptInEligible:b161Option,
  b161SourcePracticeWinner:b161Winner,
  physicalRallyCompletionCertified:false,
  formalOriginal4v4Certified:false
 };
 writeFileSync(resolve(OUTPUT,'w10b139-'+variant.toLowerCase()+'.json'),
  JSON.stringify(evidence,null,2));
 console.log('B139_REAL_SOURCE_7CPU_KCC_ALLY_COMPARISON',JSON.stringify({
  variant,playingTick:nativeGameStart.tick,
  originalRealInputStages:steps.map(x=>x.name),
  finalTick:final.tick,physicalCpuRejoins:final.cpu.physicalRejoins.length,
  genuineGroundSupportSamples:meaningful,
  sameLowerA1FootSamples:sameLevel.length,
  realLowerInteriorSamples:genuineInnerFoot.length,
  b149NearPhysicalNativeFrames:
   final.b149ActualNativeHumanA1Contact.actualNearNativeFrames,
  b149ActualHumanKccA1Contacts:
   final.b149ActualNativeHumanA1Contact.actualNativeKccA1Contacts,
  b151A1SourceTurfShots:final.cpuSourceTurfShotsByActor?.A1??0,
  b151A1RealImpactInkEvents:
   final.b151AllyRealInkImpactEvidence?.impactEvents??0,
  b151A1RealImpactInkChangedCells:
   final.b151AllyRealInkImpactEvidence?.changedImpactCells??0,
  b152VerifiedAimShotRequests:
   final.b152ExactAllyAimPaintProvenance?.acceptedSourceAimShotRequests??0,
  b152SourceAimProjectilesSpawned:
   final.b152ExactAllyAimPaintProvenance?.spawned??0,
  b152SourceAimRealSurfaceImpacts:
   final.b152ExactAllyAimPaintProvenance?.originalSourceSurfaceCollisions??0,
  b152SourceAimPaintImpactEvents:
   final.b152ExactAllyAimPaintProvenance?.impactEvents??0,
  b152SourceAimChangedCells:
   final.b152ExactAllyAimPaintProvenance?.changedImpactCells??0,
  b154TeamCoverageOptIn:b154TeamCoverage,
  b155ActualRecastAuthorisedEndpointCount:
   final.b155OriginalSourceConnectivityReview.mustReachRecastPaths,
  b155UnverifiedOriginalUnderpassGaps:
   final.b155OriginalSourceConnectivityReview.heldDiagnosticGaps,
  b155OriginalUnderpassStaticRayMisses:
   final.b155OriginalSourceConnectivityReview.diagnosticOriginalRayMisses,
  b156BothUnderpassesPathStoppedShort:
   final.b156OriginalUnderpassGapTriage.bothSidesNativeRecastStoppedShort,
  b159ActualOriginalSourceFaceProjectedNear:
   final.b159OriginalFaceNavMeshProjection.components.reduce(
    (sum,x)=>sum+x.nearNavMeshSamples035m,0),
  b159Original42FaceNativeProjectionByComponent:
   final.b159OriginalFaceNavMeshProjection.components.map(x=>({
    component:x.id,faceCount:x.originalFaceCount,
    nativeProjections:x.successfulNativeProjectionCount,
    nativeNear035m:x.nearNavMeshSamples035m,
    exactRegisteredColliderHits:x.exactSourceComponentColliderHitCount
   })),
  b158NearestExactOriginalSourceFaces:
   final.b158OriginalSourceFaceRecastMatch.comparisons.map(x=>({
    side:x.side,terminal:x.terminal,
    component:x.originalRouteComponentId,
    distanceMeters:x.originalTriangleSpatialDistanceMeters
   })),
  b157ReverseUnderpassNativeSourcePaths:
   final.b157OriginalBidirectionalSourceAudit.sides.map(x=>({
    side:x.side,reverseReached:x.reverseRecastEndpointReached,
    reverseRemainingMeters:x.reverseTerminalRemainingStartMeters,
    forwardOriginalStageRayHit:x.forwardTerminalOriginalStageSolid,
    routeDiagnosis:x.routeDiagnosis
   })),
  b156UnderpassNativeTerminalPoints:
   final.b156OriginalUnderpassGapTriage.sides.map(x=>({
    side:x.side,pathTerminus:x.nativePathTerminal,
    endpointErrorMeters:x.remainingNativeEndpointErrorMeters
   })),
  b154PerActorRealInkChangedCells:
   Object.fromEntries(Object.entries(final.b154NativeSevenCpuInk.byActor)
    .map(([id,v])=>[id,v.changedCells])),
  b154AllSevenCpuInkChangedCells:
   Object.values(final.b154NativeSevenCpuInk.byActor)
    .reduce((sum,v)=>sum+v.changedCells,0),
  b154ConfirmedCpuProjectileInkCells:
   Object.values(final.b154NativeSevenCpuInk.byActor)
    .reduce((sum,v)=>sum+v.impactChangedCells,0),
  originalInsetAfterRealKeyA:b146ActualNativeSourceInward.frozenPolygonMarginAfterKeyA,
  b142StandoffGoalApprovals:
   realNativeEvidence.observedA1NativeStandoffGoalApprovals,
  b143RetainedRequests:
   realNativeEvidence.observedA1RetainedNativeStandoffRequests,
  sourceAllyGoalApprovals:approved,
  interpretation:evidence.interpretation,formal4v4Hold:true
 }));
}
async function run(){
 mkdirSync(OUTPUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||['google-chrome-stable','google-chrome','chromium']
  .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_REQUIRED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4198','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await until(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars','--remote-debugging-port=9258',
  '--remote-allow-origins=*','--user-data-dir=/tmp/t21-w10b81-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9258/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});
  socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',event=>{
  const r=JSON.parse(String(event.data)),p=pending.get(r.id);
  if(!p)return;pending.delete(r.id);r.error?p.no(Error(JSON.stringify(r.error))):p.ok(r.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
   (allyOptIn?'&t21W10B137=allyRally&t21W10B150=allyInk':'')+
   (b154TeamCoverage?'&t21W10B154=teamCoverage':'')+
   '&t21W10B149=contactTrace'});
 const ready=()=>until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),100000);
 await ready();
 if(b194ButtonTrial){
  const visible=await evaluate(`(() => {
   const b=document.querySelector('#t21-f3-b193-ally-coop');
   const r=b?.getBoundingClientRect();
   return {label:b?.textContent,source:document.querySelector('#app-canvas')?.dataset.t21B193Coop,
    top:r?.top,bottom:r?.bottom};
  })()`);
  if(!visible.label?.includes('PLAY WITH REAL ALLY A1')||
     visible.source!=='OFF'||!(visible.top>=0&&visible.bottom<=900))
   fail('B194_PLAYER_BUTTON_NOT_VISIBLE');
  await clickButton('#t21-f3-b193-ally-coop');
  const selected=await until(async()=>{
   try {
    const state=await evaluate(`(() => ({
     url:location.search,loaded:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
     mode:document.querySelector('#app-canvas')?.dataset.t21B193Coop,
     label:document.querySelector('#t21-f3-b193-ally-coop')?.textContent,
     variant:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B56NextVariant,
     sub:window.__t21F3?.snapshot()?.b38HumanSub?.enabled
    }))()`);
    return state.loaded==='READY'&&
     state.url==='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop'
     ?state:false;
   } catch{return false;}
  },100000);
  if(selected.mode!=='REAL_A1_ORIGINAL_SOURCE'||
     !selected.label?.includes('A1 CO-OP ON')||
     selected.variant!=='ALLY_SYNC'||selected.sub!==true)
   fail('B194_PLAYER_MODE_NOT_NATIVE_READY_'+JSON.stringify(selected));
  const proof={realCDPMouseClick:true,initialLabel:visible.label,
   newSourceWorld:selected.url,activeMode:selected.mode,
   actualPreselectedChallenge:selected.variant,realSubWeapon:selected.sub,
   sourceScoreable:0,productionAuthorized:false};
  writeFileSync(resolve(OUTPUT,'w10b194-real-player-coop-entry.json'),
   JSON.stringify(proof,null,2));
  await picture('W10B194_REAL_PLAYER_COOP_BUTTON');
  console.log('B194_USER_BUTTON_REAL_A1_COOP_SELECTED',JSON.stringify(proof));
 }
 if(b203FullRoundTrial){
  await clickButton('#t21-f3-b203-full-round');
  const selected=await until(async()=>{
   try{
    const s=await evaluate(`(() => ({
     url:location.search,ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
     round:document.querySelector('#app-canvas')?.dataset.t21B203FullRound,
     coop:document.querySelector('#app-canvas')?.dataset.t21B193Coop,
     label:document.querySelector('#t21-f3-b203-full-round')?.textContent,
     rejoins:window.__t21F3?.snapshot()?.cpu?.physicalRejoins?.length
    }))()`);
    return s.ready==='READY'&&s.round==='REAL_180S_SOURCE_PLAY'?s:false;
   }catch{return false;}
  },100000);
  if(selected.url!=='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound'||
     selected.coop!=='REAL_A1_ORIGINAL_SOURCE'||selected.rejoins!==0||
     !selected.label?.includes('180s SOURCE ROUND ON'))
   fail('B203_REAL_MODE_SELECTION_FAILED_'+JSON.stringify(selected));
  console.log('B203_REAL_FULL_ROUND_USER_MODE',JSON.stringify(selected));
 }
 await doPhysicalTrial();
 if(b203FullRoundTrial){
  const clear=await snapshot();authority(clear,'FIXED');
  if(clear.matchState!=='PLAYING'||clear.b25SourcePaintRun.status!=='CLEAR'||
     clear.timeRemainingSeconds<=0)fail('B203_ROUND_NOT_PLAYING_AFTER_CLEAR');
  const ui=await evaluate(`(() => ({
   phase:document.querySelector('#t21-f3-b205-real-round')?.dataset.t21B205NativePhase,
   clear:document.querySelector('#t21-f3-b205-real-round')?.dataset.t21B205MissionClear,
   humanInk:Number(document.querySelector('#t21-f3-b205-real-round')?.dataset.t21B205HumanInk),
   text:document.querySelector('#t21-f3-b195-next')?.textContent
  }))()`);
  if(ui.phase!=='PLAYING'||ui.clear!=='true'||
     ui.humanInk!==clear.b23HumanInkFeedback.humanChangedCells||
     !ui.text?.includes('KEEP PLAYING'))
   fail('B205_REAL_180S_AFTER_MISSION_CLEAR_VIEW_'+JSON.stringify(ui));
  const p={key:'p',code:'KeyP',windowsVirtualKeyCode:80,nativeVirtualKeyCode:80};
  for(const type of ['keyDown','keyUp'])
   await cmd('Input.dispatchKeyEvent',{type,...p});
  const paused=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const ui=await evaluate(`(() => ({
    unlocked:document.pointerLockElement===null,
    shown:document.querySelector('#t21-f3-b202-real-pause')?.hidden===false,
    state:document.querySelector('#t21-f3-b202-real-pause')?.dataset.t21B202NativeState
   }))()`);
   return n.paused&&n.b25SourcePaintRun.status==='CLEAR'&&
    ui.unlocked&&ui.shown&&ui.state==='NATIVE_PAUSED'?n:false;
  },25000);
  await sleep(700);
  const held=await snapshot();authority(held,'FIXED');
  if(held.tick!==paused.tick||
     held.timeRemainingSeconds!==paused.timeRemainingSeconds||
     held.b25SourcePaintRun.status!=='CLEAR'||
     held.b23HumanInkFeedback.humanChangedCells!==
      paused.b23HumanInkFeedback.humanChangedCells)
   fail('B203_FULL_ROUND_PAUSE_CLOCK_OR_INK_DRIFT');
  await clickButton('#t21-f3-b202-resume');
  const resumed=await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const locked=await evaluate(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
   return locked&&!n.paused&&n.tick>=held.tick+5&&
    n.matchState==='PLAYING'&&n.b25SourcePaintRun.status==='CLEAR'?n:false;
  },100000);
  const proof={schema:'B203_REAL_FULL_ROUND_AFTER_OBJECTIVE_CLEAR',
   input:'ACTUAL_BUTTON_PLUS_NATIVE_P_AND_RESUME',
   remainingAtPause:paused.timeRemainingSeconds,
   actualPauseTick:paused.tick,heldTick:held.tick,
   genuineResumeTick:resumed.tick,matchState:resumed.matchState,
   objective:resumed.b25SourcePaintRun.status,
   physicallyRejoinedCpu:resumed.cpu.physicalRejoins.length,
   authority:'25/17/26/0',scoreable:0,officialWinner:'NONE',
   syntheticTicks:false,actorTeleports:false};
  writeFileSync(resolve(OUTPUT,'w10b203-real-full-round.json'),
   JSON.stringify(proof,null,2));
  console.log('B203_REAL_FULL_ROUND_NATIVE_PAUSE_AFTER_CLEAR',JSON.stringify(proof));
 }


 if(b409OneRoute180){
  // Continue the SAME authentic B322/B326 real 7-CPU source round,
  // preserving every original source geometry/score and native simulation.
  const evidence={
   schema:'B409_GENUINE_B322_ROUTE_AND_FULL_180S_ONE_SOURCE_GAME',
   source:'25/17/26/0',nativeKeyboardMouse:true,sameBrowserWorld:true,
   syntheticTicks:false,syntheticPlayerOrCpuMoves:false,
   syntheticPaintOrScore:false,originalSourceStageModified:false,
   officialWinner:'NONE',samples:[]
  };
  const persist=()=>writeFileSync(resolve(OUTPUT,'b409-one-original-route-180s.json'),
    JSON.stringify(evidence,null,2)+'\n');
  // B410: interact with the REAL player after the B322 physical original
  // crest. Reuse successful B407 genuine WASD and B408 live ownerGrid mouse
  // retargeting, now on the genuinely reached upper original source floor.
  const b410={
   schema:'B410_GENUINE_NATIVE_LATE_UPPER_FLOOR_ACTIVE_PLAYER',
   source:'25/17/26/0',sameB409BrowserWorld:true,
   syntheticTickWrites:0,syntheticPositionWrites:0,syntheticPaintWrites:0,
   officialWinner:'NONE',waves:[]
  };
  const saveB410=()=>writeFileSync(resolve(OUTPUT,'b410-upper-genuine-live-human-waves.json'),
   JSON.stringify(b410,null,2)+'\n');
  if(b410RealUpperPlay){
   // The already-certified B409 native upper-foot ledger included
   // originalB337NearbyActiveCells=[]: URL-gated read-only local cells.
   // Activate the existing B337 sample AFTER the real physical route,
   // no actor, collision, projectile, ownerGrid or tick change.
   const reader=await evaluate(`(() => {
    const u=new URL(location.href);
    if(u.searchParams.get('t21B312')!=='genuineSecondHumanPaint'||
       u.searchParams.get('t21W10B203')!=='fullRound'||
       (u.searchParams.has('t21B337')&&
        u.searchParams.get('t21B337')!=='localOriginalAim'))
      return 'INVALID_READER_CONTEXT';
    u.searchParams.set('t21B337','localOriginalAim');
    history.replaceState(null,'',u.href);
    return new URL(location.href).searchParams.get('t21B337');
   })()`);
   if(reader!=='localOriginalAim')
    fail('B410_ORIGINAL_OWNERGRID_READ_ONLY_UNAVAILABLE');
   saveB410();
  }
  // B411 F5: enable only after B162 genuine objective CLEAR and actual
  // B322 original upper-floor physical route. Original B168 and B200
  // pre-clear/replay audits remain untouched.
  if(b411SourceGameplayHud)
   await b411EnableAfterNativeRealClear(evaluate,snapshot);
  const b411={
   schema:'B411_REAL_POST_CLEAR_NATIVE_FULL_ROUND_FOCUS',
   source:'25/17/26/0',syntheticTime:false,syntheticInk:false,
   syntheticActors:false,originalScoreable:0,officialWinner:'NONE',
   samples:[]
  };
  const sampleB411=async label=>{
   const row=await b411NativeHudSample(label,evaluate,until);
   b411.samples.push(row);
   writeFileSync(resolve(OUTPUT,'b411-real-native-source-round-hud.json'),
    JSON.stringify(b411,null,2)+'\n');
   console.log('B411_TRUE_SOURCE_NATIVE_GAMEPLAY_HUD',JSON.stringify({
    label,tick:row.tick,remaining:row.remainingSeconds,
    compact:row.b411Compact,toastHidden:row.clearToastHidden,
    practiceCardHidden:row.paintCardHidden,
    replayHidden:row.replayHidden,replayDisabled:row.replayDisabled,
    originalScoreable:row.sourceScoreable,officialWinner:row.officialWinner
   }));
  };
  // Actual native read-only 17-owner-grid playable scoreboard evidence.
  const b417={schema:'B417_TRUE_NATIVE_SOURCE_CELLS',source:'25/17/26/0',
   scoreable:0,winner:'NONE',samples:[]};
  const sampleB417=async label=>{
   const v=await evaluate(`(() => {
    const n=window.__t21F3.snapshot(),s=n.b401NativeLiveSourceInk;
    const h=document.querySelector('#t21-f3-b417-paint-contest');
    const a=document.querySelector('#t21-f3-b417-team-a');
    const b=document.querySelector('#t21-f3-b417-team-b');
    return {tick:n.tick,phase:n.matchState,
     source:[n.originalSourceSolids,n.originalPaintSurfaces,
      n.originalSourceNavigationLinks,n.sourceScoreablePromotions].join('/'),
     winner:n.b25SourcePaintRun.officialWinner,s,
     ui:{visible:!!h&&!h.hidden&&getComputedStyle(h).display!=='none',
      a:h?.dataset.t21B417TeamA,b:h?.dataset.t21B417TeamB,
      n:h?.dataset.t21B417Neutral,
      tick:h?.dataset.t21B417SampleTick,
      source:h?.dataset.t21B417OriginalOnly,
      official:h?.dataset.t21B417OfficialTurfScore,
      label:document.querySelector('#t21-f3-b417-text')?.textContent,
      aBar:a?.style.width,bBar:b?.style.width}};
   })()`);
   b417.samples.push({label,...v});
   writeFileSync(resolve(OUTPUT,'b417-true-native-source-cells-hud.json'),
    JSON.stringify(b417,null,2)+'\n');
   const s=v.s,u=v.ui;
   if(v.source!=='25/17/26/0'||v.winner!=='NONE')
    fail('B417_GAME_SOURCE_CHANGED');
   if(label==='TIME_UP'){
    if(v.phase!=='TIME_UP'||u.visible)
     fail('B417_HUD_VISIBLE_AFTER_TRUE_TIME_UP');
    return;
   }
   const owned=s?.teamA+s?.teamB;
   const percent=n=>Number(n.toFixed(2))+'%';
   if(v.phase!=='PLAYING'||s?.status!=='LIVE_REGISTERED_SOURCE_ONLY'||
      s.originalSourceOnly!==true||s.officialTurfScore!==false||
      s.winner!=='NONE'||s.gameplayWrites!==0||
      s.registeredSurfaces!==17||
      !Number.isSafeInteger(s.sampleNativeTick)||
      s.sampleNativeTick>v.tick||v.tick-s.sampleNativeTick>360||
      ![s.totalActiveCells,s.teamA,s.teamB,s.neutral].every(
       n=>Number.isSafeInteger(n)&&n>=0)||
      s.totalActiveCells===0||
      s.teamA+s.teamB+s.neutral!==s.totalActiveCells||
      !u.visible||u.source!=='true'||u.official!=='false'||
      u.tick!==String(s.sampleNativeTick)||
      u.a!==String(s.teamA)||u.b!==String(s.teamB)||
      u.n!==String(s.neutral)||
      u.label!=='SOURCE PAINTED CELLS · A '+
       s.teamA.toLocaleString('en-US')+' / B '+
       s.teamB.toLocaleString('en-US')+' · UNSCORED'||
      u.aBar!==percent(owned?100*s.teamA/owned:0)||
      u.bBar!==percent(owned?100*s.teamB/owned:0))
    fail('B417_NATIVE_ORIGINAL_OWNER_GRID_HUD_MISMATCH_'+label);
   console.log('B417_REAL_NATIVE_SOURCE_PAINTED_CELL_HUD',JSON.stringify({
    label,tick:v.tick,source:v.source,
    sampledNativeTick:s.sampleNativeTick,A:s.teamA,B:s.teamB,
    neutral:s.neutral,scoreable:0,officialWinner:'NONE'}));
  };
  const sample=async(label,n)=>{
   authority(n,'FIXED');
   const f=n.matchState==='PLAYING'?await b312Ledger():null;
   const s={
    label,tick:n.tick,secondsRemaining:n.timeRemainingSeconds,
    matchState:n.matchState,paused:n.paused,stopReason:n.stopReason,
    browserWorldOrigin:await evaluate('performance.timeOrigin'),
    player:n.player.position,
    originalSourceSolids:n.originalSourceSolids,
    originalPaintSurfaces:n.originalPaintSurfaces,
    originalSourceNavigationLinks:n.originalSourceNavigationLinks,
    scoreable:n.sourceScoreablePromotions,
    productionAuthorized:n.productionAuthorized,
    unrestricted4v4Certified:n.unrestricted4v4Certified,
    turfResult:n.turfResult,
    cpuRelocations:n.cpu.physicalFootRelocations,
    cpuRejoined:n.cpu.physicalRejoins.length,
    cpu:n.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot,
     lifeState:c.lifeState,hp:c.hp,rejoined:c.rejoined})),
    humanShots:n.shotsFired,
    humanPaintCells:n.b23HumanInkFeedback.humanChangedCells,
    cpuSourceShots:n.cpuSourceTurfShots,cpuPaintCells:n.cpuInkCellsChanged,
    humanCpuDirectHits:n.humanCpuDirectHits,
    humanCpuDirectSplats:n.humanCpuDirectSplats,
    genuineOriginalFoot:f?{solid:f.genuineHumanOriginalFootSolid,
     supported:f.realHumanOriginalFootSupported,
     gap:f.genuineOriginalFootGapMeters}:null,
    pointerLocked:await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")')
   };
   evidence.samples.push(s);persist();
   console.log('B409_ORIGINAL_ROUTE_SINGLE_NATIVE_180S',JSON.stringify({
    label,tick:s.tick,remaining:s.secondsRemaining,
    originalFoot:s.genuineOriginalFoot?.solid??null,
    humanShots:s.humanShots,humanCells:s.humanPaintCells,
    cpuShotRequests:s.cpuSourceShots,cpuInkCells:s.cpuPaintCells,
    realHumanEnemyHits:s.humanCpuDirectHits}));
  };
  persist();
  const after=await snapshot();authority(after,'FIXED');
  if(after.matchState!=='PLAYING'||after.paused||
   after.timeRemainingSeconds<=150||after.timeRemainingSeconds>=180||
   after.cpu.physicalRejoins.length!==7)
   fail('B409_ROUTE_NOT_PLAYING_EARLY_ENOUGH_FOR_ONE_180S_GAME');
  await sample('AFTER_ROUTE',after);
  if(b411SourceGameplayHud)await sampleB411('AFTER_ROUTE');
  let b412Evidence=null;
  const b413={
   schema:'B413_AUTHENTIC_ORIGINAL_INK_SPEND_OWN_REFILL_RESUME',
   source:'25/17/26/0',officialWinner:'NONE',originalScoreable:0,
   syntheticResourceWrites:false,syntheticShotWrites:false,
   syntheticTimeWrites:false,syntheticActorWrites:false,
   samples:[],probes:[],pre:null,post:null,
   swimInitialShots:null,swimFinalShots:null,
   hud:{schema:'B414_READ_ONLY_REAL_CHROMIUM_DOM',samples:[]}
  };
  const saveB413=()=>writeFileSync(resolve(OUTPUT,
   'b413-real-original-ink-fire-refill-fire.json'),JSON.stringify(b413,null,2)+'\n');
  const sampleB414=async label=>{
   const data=await evaluate(`(() => {
    const n=window.__t21F3.snapshot();
    const g=document.querySelector('#t21-f3-b414-native-ink');
    const root=document.querySelector('#t21-f3-b195-native-coop');
    return {
     tick:n.tick,phase:n.matchState,paused:n.paused,
     original:[n.originalSourceSolids,n.originalPaintSurfaces,
      n.originalSourceNavigationLinks,n.sourceScoreablePromotions].join('/'),
     winner:n.b25SourcePaintRun.officialWinner,
     cpu:n.cpu.physicalRejoins.length,
     relocated:n.cpu.physicalFootRelocations,
     ink:n.player.ink,mode:n.player.mode,
     recovery:n.playerInkRecoveryState,relation:n.player.inkRelation,
     focused:root?.dataset.t21B411Active,
     scoreable:root?.dataset.originalScoreable,
     hudWinner:root?.dataset.officialWinner,
     visible:g?.hidden===false&&getComputedStyle(g).display!=='none',
     hudInk:Number(g?.dataset.t21B414ActualInk),
     hudMode:g?.dataset.t21B414Mode,
     hudRecovery:g?.dataset.t21B414Recovery,
     renderTick:Number(g?.dataset.t21B414RenderTick),
     text:document.querySelector('#t21-f3-b414-ink-text')?.textContent,
     width:document.querySelector('#t21-f3-b414-ink-fill')?.style.width
    };
   })()`);
   b413.hud.samples.push({label,...data});saveB413();
  };
  for(const remaining of [150,120,90,60,30,0]){
   const next=await until(async()=>{
    const n=await snapshot();authority(n,'FIXED');
    return n.timeRemainingSeconds<=remaining+.001?n:false;
   },10*60*1000);
   await sample(String(remaining),next);
   if(b410RealUpperPlay&&[120,60,30].includes(remaining)){
    try{
     const wave=await b407RunNativeHumanWave({
      remaining,expectedFoot:UPPER_FLOOR_SOLID,
      aimCDP:[800,450],
      send:cmd,read:evaluate,snapshot,
      verifyAuthority:n=>{authority(n,'FIXED');return n;},
      wait:until,b408ActiveAim:true
     });
     b410.waves.push(wave);saveB410();
     console.log('B410_NATIVE_ORIGINAL_UPPER_ACTIVE_PLAYER',JSON.stringify({
      marker:remaining,nativeStart:wave.before.tick,
      nativeEnd:wave.after.tick,
      actualOriginalUpperKccMeters:wave.totalRealKccPlanarMeters,
      liveRetargetedNativeShots:wave.b408Aim?.additionalShots??0,
      authenticUpperPaintSurface:wave.b408Aim?.realLastPaintSurface??null,
      originalHumanChangedCells:wave.b408Aim?.realAddedCells??0,
      originalCpuRejoined:wave.after.sevenCpuRejoined
     }));
    }catch(error){
     b410.hold={marker:remaining,reason:String(error),
      previouslyGenuineWaves:b410.waves.length};
     saveB410();throw error;
    }
   }
   if(remaining===90){
    if(b411SourceGameplayHud)await sampleB411('90');
    if(b411SourceGameplayHud)await sampleB417('90');
    await picture('B409_REAL_ROUTE_MID');
    if(b412NativeSquidSwim){
     const target=b410.waves.find(w=>w.remaining===120)?.b408Aim?.plan;
     if(target?.source!=='25/17/26/0'||
       target.surfaceId!==UPPER_FLOOR_SOLID+':paint'||
       !Array.isArray(target.world))
      fail('B412_NEEDS_REAL_120S_UPPER_NATIVE_INK_TARGET');
     const sourceTrace=resolve(OUTPUT,
      'b412-original-upper-real-own-ink-swim.json');
     // The 120-second CDP pointer coordinates are historical only.
     // B413 asks B408 for a FRESH true native ownerGrid + camera aim.
     const observeB413=async real=>{
      b413.probes.push(real);
      if(b413NativeInkLoop)await sampleB414(real.phase+'_'+(
       real.stage==='REAL_ORIGINAL_NATIVE_CAMERA_ALIGNED'?'BEFORE':'AFTER'));
      saveB413();
      console.log('B413_TRUE_SOURCE_LIVE_FIRE_PROBE',JSON.stringify({
       phase:real.phase,stage:real.stage,body:real.after?.body??real.before?.body,
       inkBefore:real.before?.ink,inkAfter:real.after?.ink,
       shotsBefore:real.before?.shots,shotsAfter:real.after?.shots,
       impact:real.originalLastImpactSurface??null,
       impactTick:real.originalLastImpactTick??null,
       plannedSurface:real.aim?.surfaceId??null,
       plannedCDP:real.aim?.cdp??null
      }));
     };
     if(b413NativeInkLoop){
      b413.pre=await b413RealOriginalMainFireBurst({
       phase:'BEFORE_SQUID',send:cmd,snapshot,ledger:b312Ledger,
       verify:n=>{authority(n,'FIXED');return n;},
       locked:()=>evaluate(
        'document.pointerLockElement===document.querySelector("#app-canvas")'),
       wait:until,onEvidence:observeB413
      });
      saveB413();
      console.log('B413_TRUE_NATIVE_PRE_DIVE_FIRE_COST',
       JSON.stringify({shots:b413.pre.actualShotsPaid,
        inkSpent:b413.pre.sourceInkDifference,tick:b413.pre.after.tick,
        originalSurface:b413.pre.actualOriginalImpactSurface}));
     }
     const squidSnapshot=b413NativeInkLoop?async()=>{
      const n=await snapshot();
      b413ObserveNativeRefill(b413,n);
      return n;
     }:snapshot;
     b412Evidence=await b412NativeSquidOwnInkRound({
      remaining:90,target:target.world,expectedFoot:UPPER_FLOOR_SOLID,
      snapshot:squidSnapshot,ledger:b312Ledger,send:cmd,wait:until,
      locked:()=>evaluate(
       'document.pointerLockElement===document.querySelector("#app-canvas")'),
      verify:n=>{authority(n,'FIXED');return n;},
      onEvidence:async real=>{
       writeFileSync(sourceTrace,JSON.stringify(real,null,2)+'\n');
       if(b413NativeInkLoop){
        const leg=real.legs?.at(-1);
        if(real.lastPhase?.startsWith('GENUINE_NATIVE_LEG_')&&
           leg?.inkRelation==='OWN'&&leg?.locomotion==='SWIM_GROUND'&&
           b413.hud.samples.filter(s=>s.label==='SQUID_OWN').length<8)
         await sampleB414('SQUID_OWN');
        if(real.lastPhase==='HUMAN_NATIVE_RETURNED_ON_ORIGINAL_SOURCE')
         await sampleB414('HUMAN_RETURN');
        saveB413();
       }
      }
     });
     writeFileSync(sourceTrace,JSON.stringify(b412Evidence,null,2)+'\n');
     if(b413NativeInkLoop){
      b413.swimInitialShots=b412Evidence.initial.humanShots;
      b413.swimFinalShots=b412Evidence.final.humanShots;
      b413.post=await b413RealOriginalMainFireBurst({
       phase:'AFTER_SQUID',send:cmd,snapshot,ledger:b312Ledger,
       verify:n=>{authority(n,'FIXED');return n;},
       locked:()=>evaluate(
        'document.pointerLockElement===document.querySelector("#app-canvas")'),
       wait:until,onEvidence:observeB413
      });
      saveB413();
      if(b411SourceGameplayHud)await sampleB417('AFTER_RESHOT');
      // B415: independent actual DOM observation from THIS same Chromium
      // source-only match. Never write stats, scene, ownerGrid, or native tick.
      const b415Hud=await evaluate('(() => { '+
       'const h=document.querySelector("#t21-f3-b195-native-coop"); '+
       'const p=document.querySelector("#t21-f3-b415-ink-loop"); '+
       'const g=document.querySelector("#t21-f3-b414-native-ink"); '+
       'return {stage:p?.dataset.t21B415PracticeStage,'+
       'label:p?.textContent,sourceOnly:p?.dataset.t21B415SourceOnly,'+
       'official:p?.dataset.t21B415OfficialTurfResult,'+
       'compact:h?.dataset.t21B411Active,'+
       'visible:!g?.hidden,gaugeSource:g?.dataset.t21B414RealNativeSource};'+
       '})()');
      const b415Native=await snapshot();
      writeFileSync(resolve(OUTPUT,'b415-real-source-ink-loop-hud.json'),
       JSON.stringify({schema:'B415_NATIVE_REAL_SOURCE_ONLY_PLAY_GOAL',
        source:'25/17/26/0',nativeTick:b415Native.tick,
        sameSessionB413PostTick:b413.post.after.tick,
        actualShots:b415Native.shotsFired,
        actualInk:b415Native.player.ink,
        hud:b415Hud,gameplayWrites:false,officialScorePromoted:false
       },null,2)+'\n');
      if(b415Hud?.stage!=='COMPLETE'||b415Hud?.sourceOnly!=='true'||
         b415Hud?.official!=='false'||b415Hud?.compact!=='true'||
         b415Hud?.visible!==true||b415Hud?.gaugeSource!=='true'||
         !b415Hud?.label?.includes('UNSCORED'))
       fail('B415_NATIVE_REAL_INK_LOOP_HUD_NOT_VERIFIED');
      console.log('B415_REAL_NATIVE_INK_LOOP_GOAL',JSON.stringify({
       stage:b415Hud.stage,label:b415Hud.label,
       trueShots:b415Native.shotsFired,realInk:b415Native.player.ink,
       nativeTick:b415Native.tick,source:'25/17/26/0',
       officialWinner:'NONE',sourceScoreable:0
      }));
      console.log('B413_TRUE_NATIVE_POST_SWIM_RESHOT',
       JSON.stringify({shots:b413.post.actualShotsPaid,
        inkSpent:b413.post.sourceInkDifference,tick:b413.post.after.tick,
        originalSurface:b413.post.actualOriginalImpactSurface,
        realSwimSamples:b413.samples.length}));
     }
     console.log('B412_TRUE_NATIVE_ORIGINAL_SQUID_SWIM',JSON.stringify({
      actualNativeSqModeTick:b412Evidence.actualSqModeTick,
      realOwnInkSwim:b412Evidence.swimObserved,
      actualSquidKccMeters:b412Evidence.totalRealKccMeters,
      sourceSwimLegs:b412Evidence.legs.length,
      restoredHumanMode:b412Evidence.final.mode,
      verifiedOriginalUpperFloor:b412Evidence.final.originalFoot
     }));
     await picture('B412_REAL_ORIGINAL_UPPER_OWN_INK_SWIM');
    }
   }
  }
  const end=await snapshot();authority(end,'FIXED');
  if(end.matchState!=='TIME_UP'||end.timeRemainingSeconds!==0)
   fail('B409_GENUINE_SOURCE_MATCH_NO_REAL_TIME_UP');
  await picture('B409_REAL_ROUTE_TIME_UP');
  if(b411SourceGameplayHud)await sampleB411('TIME_UP');
  if(b411SourceGameplayHud)await sampleB417('TIME_UP');
  if(b413NativeInkLoop)await sampleB414('TIME_UP');
  console.log('B409_ORIGINAL_ROUTE_AND_180S_GENUINE_TIME_UP',
   JSON.stringify({nativeTick:end.tick,
    actualHumanShots:end.shotsFired,
    actualHumanCells:end.b23HumanInkFeedback.humanChangedCells,
    cpuInkCells:end.cpuInkCellsChanged,
    originalWinner:'NONE',scoreable:0}));
  if(b410RealUpperPlay){
   const load=p=>JSON.parse(readFileSync(resolve(OUTPUT,p),'utf8'));
   const route={
    b316:load('b316-genuine-original-human-ramp-walk.json'),
    b312:load('b312-real-original-lower-second-ink.json'),
    b322:load('b322-actual-original-ramp-crest.json'),
    b324:load('b324-real-original-upper-floor.json'),
    b326:load('b326-extended-original-upper-floor.json')
   };
   const r=auditB410OneTrueUpperFloorActiveGame(evidence,route,b410);
   writeFileSync(resolve(OUTPUT,'b410-driver-real-upper-active-verdict.json'),
    JSON.stringify(r,null,2)+'\n');
   console.log('B410_GENUINE_FULL_180S_ORIGINAL_ROUTE_AND_UPPER_SHOOTER',
    JSON.stringify(r));
   if(b411SourceGameplayHud){
    const v=auditB411RealNativeGameplayFocus(b411,r);
    writeFileSync(resolve(OUTPUT,'b411-driver-native-hud-verdict.json'),
     JSON.stringify(v,null,2)+'\n');
    console.log('B411_GENUINE_NATIVE_SOURCE_GAMEPLAY_HUD_RESULT',
     JSON.stringify(v));
    if(b412NativeSquidSwim){
     const squid=b412AuditNativeActualOriginalInkSwim(b412Evidence,r,v);
     writeFileSync(resolve(OUTPUT,'b412-driver-native-squid-verdict.json'),
      JSON.stringify(squid,null,2)+'\n');
     console.log('B412_TRUE_SOURCE_SQUID_SWIM_FULL_180S',
      JSON.stringify(squid));
     if(b413NativeInkLoop){
      const ink=b413AuditFullOriginalShotRefillReshot(b413,r,squid,v,evidence);
      writeFileSync(resolve(OUTPUT,'b413-driver-original-ink-cycle-verdict.json'),
       JSON.stringify(ink,null,2)+'\n');
      console.log('B413_ONE_GENUINE_SOURCE_SHOT_REFILL_RESHOT_180S',
       JSON.stringify(ink));
     }
    }
   }
  }
 }

 if(b419RealReplay){
  // Complete first real 180s THEN click the actual user-facing replay.
  // A new browser page creates the SECOND Rapier/Recast/CPU world.
  const proof={schema:'B419_REAL_NATIVE_ENDSCREEN_TWO_WORLDS',
   clicked:false,syntheticTicks:false,actorWrites:0,scoreWrites:0,
   realEscapeInputSent:false,pointerExitMethod:null,pointerLockReleased:false,
   replayClickDispatched:false,
   replayClickTarget:null,
   navigationProbes:[],
   old:null,boot:null,armed:null,started:null,fired:null};
  const saveB419=()=>writeFileSync(resolve(OUTPUT,'b419-real-second-source-round.json'),
   JSON.stringify(proof,null,2)+'\n');
  const meta=(n,origin,extra={})=>({
   source:[n.originalSourceSolids,n.originalPaintSurfaces,
    n.originalSourceNavigationLinks,n.sourceScoreablePromotions].join('/'),
   origin,phase:n.matchState,tick:n.tick,
   remaining:n.timeRemainingSeconds,paused:n.paused,
   mission:n.b25SourcePaintRun.status,
   winner:n.b25SourcePaintRun.officialWinner,shots:n.shotsFired,
   hp:n.player.hp,ink:n.player.ink,
   cpuCount:n.cpu.cpu.length,rejoins:n.cpu.physicalRejoins.length,
   relocations:n.cpu.physicalFootRelocations,
   scoreable:n.sourceScoreablePromotions,
   prod:n.productionAuthorized,fourvfour:n.unrestricted4v4Certified,
   ...extra});
  const first=await snapshot();authority(first,'FIXED');
  const origin=await evaluate('performance.timeOrigin');
  const ui=await evaluate(`(() => {
   const modal=document.querySelector('#t21-f3-b59-session-finished');
   const el=document.querySelector('#t21-f3-b59-restart');
   return {visible:!!el&&!!modal&&!modal.hidden&&
     getComputedStyle(modal).display!=='none'&&
     getComputedStyle(el).display!=='none',
    disabled:!!el?.disabled,
    realModalFinished:modal?.dataset.t21B59State==='FINISHED',
    locked:document.pointerLockElement===document.querySelector('#app-canvas')};
  })()`);
  proof.old=meta(first,origin,{
   replayVisible:ui.visible&&!ui.disabled&&ui.realModalFinished});
  saveB419();
  if(first.matchState!=='TIME_UP'||first.timeRemainingSeconds!==0||
   !proof.old.replayVisible)fail('B419_NO_REAL_FIRST_ENDSCREEN_REPLAY');
  // Real #41743828860: true 180s TIME_UP, REPLAY visible,
  // but headless browser-level Escape did not unlock pointer capture.
  // First send real CDP Escape; fallback ONLY to the browser-standard
  // pointer lock release (never writes native actor/tick/ink/score).
  if(ui.locked){
   for(const type of ['keyDown','keyUp'])
    await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
     windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
   proof.realEscapeInputSent=true;
   let escaped=false;
   try{
    await until(()=>evaluate('document.pointerLockElement===null'),3500);
    escaped=true;
   }catch(e){
    if(!String(e).includes('B140_WAIT_TIMEOUT'))throw e;
   }
   if(!escaped){
    await evaluate(`(async()=>{
     if(document.pointerLockElement)await document.exitPointerLock();
     return document.pointerLockElement===null;
    })()`);
    await until(()=>evaluate('document.pointerLockElement===null'),10000);
   }
   proof.pointerExitMethod=escaped?'CDP_ESCAPE':'BROWSER_EXIT_POINTER_LOCK';
  }else proof.pointerExitMethod='ALREADY_UNLOCKED';
  proof.pointerLockReleased=await evaluate('document.pointerLockElement===null');
  saveB419();
  if(!proof.pointerLockReleased)fail('B419_BROWSER_POINTER_STILL_LOCKED');
  console.log('B419_ACTUAL_BROWSER_POINTER_RELEASE',JSON.stringify({
   realEscape:proof.realEscapeInputSent,mode:proof.pointerExitMethod,
   trueTimeUpTick:first.tick}));
  // B422 forensic replay: proof.clicked in earlier B419 runs was NOT
  // flushed until AFTER new world READY. So clicked:false on disk could
  // equally mean the real click was dispatched and navigation hung.
  // Record the actual reachable DOM target BEFORE dispatch; persist the
  // real CDP mouse gesture immediately after returning from clickButton.
  proof.replayClickTarget=await evaluate(`(() => {
   const b=document.querySelector('#t21-f3-b59-restart');
   if(!b)return {present:false};
   // The real modal scrolls and its REPLAY can sit below the fold.
   b.scrollIntoView({block:'center',behavior:'instant'});
   const rect=b.getBoundingClientRect();
   const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
   const top=document.elementFromPoint(x,y);
   return {present:true,hidden:b.hidden,disabled:b.disabled,
    inViewport:x>=0&&x<=innerWidth&&y>=0&&y<=innerHeight,
    buttonReceivesPointer:top===b||b.contains(top),
    display:getComputedStyle(b).display,
    pointerEvents:getComputedStyle(b).pointerEvents,
    center:[Number(x.toFixed(2)),Number(y.toFixed(2))]};
  })()`);
  saveB419();
  if(!proof.replayClickTarget?.present||
     proof.replayClickTarget?.hidden||
     proof.replayClickTarget?.disabled||
     !proof.replayClickTarget?.inViewport||
     !proof.replayClickTarget?.buttonReceivesPointer)
   fail('B422_REAL_REPLAY_CLICK_TARGET_BLOCKED');
  await clickButton('#t21-f3-b59-restart');
  proof.clicked=true;
  proof.replayClickDispatched=true;
  saveB419(); // immediately persisted, independent of a new-world boot
  console.log('B422_GENUINE_REPLAY_CLICK_DISPATCHED',JSON.stringify({
   stage:'25/17/26/0',oldTimeOrigin:origin,
   target:proof.replayClickTarget,nativeFirstTimeUpTick:first.tick}));
  const latest={origin:null,url:null,ready:null,load:null,
   canvasPresent:false,realAppPresent:false,
   lastError:null,attempts:0};
  const newPage=await until(async()=>{
   latest.attempts++;
   try{
    const data=await evaluate(`(() => ({
     origin:performance.timeOrigin,url:location.search,
     ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
     load:document.readyState,
     canvasPresent:!!document.querySelector('#app-canvas'),
     realAppPresent:!!window.__t21F3
    }))()`);
    Object.assign(latest,data,{lastError:null});
    // Save only materially changed stage transitions, plus every
    // 20th probe. Never fake stage READY or act on the page state.
    const last=proof.navigationProbes.at(-1);
    if(!last||last.origin!==data.origin||last.ready!==data.ready||
       last.url!==data.url||latest.attempts%20===0){
     proof.navigationProbes.push({...data,probeNumber:latest.attempts});
     if(proof.navigationProbes.length>30)proof.navigationProbes.shift();
     saveB419();
    }
    return data.origin>origin&&data.ready==='READY'?data:false;
   }catch(e){
    latest.lastError=String(e).slice(0,300);
    if(latest.attempts%20===0){
     proof.navigationProbes.push({
      probeNumber:latest.attempts,observationError:latest.lastError});
     if(proof.navigationProbes.length>30)proof.navigationProbes.shift();
     saveB419();
    }
    return false;
   }
  },100000).catch(e=>{
   proof.navigationProbes.push({final:true,
    ...latest,stage:'REPLAY_DISPATCHED_BUT_NEW_WORLD_NOT_READY'});
   saveB419();
   const phase=latest.lastError?'EVALUATE_ERROR':
    latest.origin===null?'NO_BROWSER_PROBE':
    latest.origin===origin?'BROWSER_NOT_NAVIGATED':
    latest.ready!=='READY'?'NAVIGATED_BUT_SOURCE_NOT_READY':
    'UNKNOWN';
   fail('B422_REAL_REPLAY_NEW_WORLD_'+phase);
  });
  const ready=await snapshot();authority(ready,'FIXED');
  proof.boot=meta(ready,newPage.origin,{
   url:newPage.url,pageReady:newPage.ready==='READY'});
  saveB419();
  if(ready.tick!==0||ready.matchState!=='STAGING'||
   ready.cpu.physicalRejoins.length!==0||ready.shotsFired!==0||
   ready.b25SourcePaintRun.status!=='IDLE')
   fail('B419_NEW_NATIVE_SOURCE_NOT_FRESH');
  await picture('B419_REAL_NEW_SOURCE_STAGING');
  await clickButton('#t21-f3-b25-start');
  const armed=await snapshot();authority(armed,'FIXED');
  proof.armed=meta(armed,newPage.origin);
  saveB419();
  if(armed.tick!==0||armed.b25SourcePaintRun.status!=='ARMED')
   fail('B419_SECOND_REAL_MISSION_NOT_ARMED');
  // B426: the first world already uses real Page.bringToFront + CDP
  // resume-click recovery (B206). Apply it to the newly navigated page.
  // B424 RAW proved true fresh boot and mission ARM; START was unobserved.
  // Never inject a synthetic lock, native tick, actor or mission state.
  const secondBrowser=()=>evaluate(`(() => {
   const b=document.querySelector('#t21-f3-b202-resume');
   const r=b?.getBoundingClientRect();
   const x=r?r.left+r.width/2:null,y=r?r.top+r.height/2:null;
   const hit=x===null||y===null?null:document.elementFromPoint(x,y);
   return {focused:document.hasFocus(),hidden:document.hidden,
    pointerLocked:document.pointerLockElement===
     document.querySelector('#app-canvas'),
    buttonPresent:!!b,buttonHidden:b?.hidden??true,
    buttonDisabled:b?.disabled??true,
    buttonReceivesPointer:!!b&&(hit===b||b.contains(hit)),
    overlayState:b?.parentElement?.dataset.t21B202NativeState??null};
  })()`);
  // B428: B426 RAW native tick 648, true locked/paused=false, CPU 4/7
  // and STAGING, with 180s unconsumed. SOURCE STAGING is the physical
  // warmup itself; native PLAYING starts only AFTER the real 7/7 rejoin.
  // Observe authentic resumed native ticks, then genuine round activation.
  const observeSecond=ms=>until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   const locked=await evaluate(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
   return locked&&!n.paused&&n.tick>=30&&
    ['STAGING','PLAYING'].includes(n.matchState)&&
    ['ARMED','RUNNING'].includes(n.b25SourcePaintRun.status)?n:false;
  },ms);
  proof.secondStart={firstClick:false,retryUsed:false,
   before:null,afterFirst:null,onFailure:null};
  await cmd('Page.bringToFront');
  proof.secondStart.before=await secondBrowser();
  saveB419();
  if(!proof.secondStart.before.buttonPresent||
     proof.secondStart.before.buttonHidden||
     proof.secondStart.before.buttonDisabled||
     !proof.secondStart.before.buttonReceivesPointer)
   fail('B426_SECOND_START_REAL_BUTTON_BLOCKED');
  await clickButton('#t21-f3-b202-resume');
  proof.secondStart.firstClick=true;
  saveB419();
  let started;
  try{started=await observeSecond(15000);}
  catch(firstError){
   const n=await snapshot();authority(n,'FIXED');
   proof.secondStart.afterFirst={
    browser:await secondBrowser(),native:meta(n,newPage.origin)};
   saveB419();
   // A second true click is permitted only if the native world never
   // started. Never disturb a live or already-running 180s match.
   if(n.matchState==='STAGING'&&n.tick===0&&n.paused&&
      n.b25SourcePaintRun.status==='ARMED'&&!n.stopReason&&
      !proof.secondStart.afterFirst.browser.pointerLocked){
    await cmd('Page.bringToFront');
    const b=await secondBrowser();
    if(!b.buttonPresent||b.buttonHidden||b.buttonDisabled||
       !b.buttonReceivesPointer)
     fail('B426_SECOND_RETRY_REAL_BUTTON_BLOCKED');
    await clickButton('#t21-f3-b202-resume');
    proof.secondStart.retryUsed=true;
    saveB419();
   }
   try{started=await observeSecond(65000);}
   catch(error){
    const final=await snapshot();authority(final,'FIXED');
    proof.secondStart.onFailure={
     browser:await secondBrowser(),native:meta(final,newPage.origin),
     reason:String(error)};
    saveB419();
    fail('B426_SECOND_ROUND_NATIVE_START_HOLD_'+
     (final.matchState==='STAGING'?'STAGING':
      final.paused?'PAUSED':
      final.b25SourcePaintRun.status!=='RUNNING'?'MISSION_NOT_RUNNING':
      'NO_PROVEN_REAL_START'));
   }
  }
  // B428: genuine second-world native physics now advances even while
  // the round is STAGING; this is an authentic resumed SOURCE world, NOT
  // a claim that the 180s match timer has begun.
  // Wait separately for real 7/7 physical rejoin and PLAYING + RUNNING.
  const actualResumeTick=started.tick;
  proof.secondStart.nativeResumed=meta(started,newPage.origin);
  saveB419();
  try{
   started=await until(async()=>{
    const n=await snapshot();authority(n,'FIXED');
    if(n.stopReason||n.matchState==='TIME_UP')
     fail('B427_REAL_SECOND_MISSION_STOPPED_BEFORE_CPU_REJOIN');
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    return locked&&!n.paused&&n.matchState==='PLAYING'&&
     n.tick>=actualResumeTick&&n.cpu.physicalRejoins.length===7&&
     n.b25SourcePaintRun.status==='RUNNING'?n:false;
   },240000);
  }catch(error){
   const last=await snapshot();authority(last,'FIXED');
   proof.secondStart.onMissionHold={
    native:meta(last,newPage.origin),browser:await secondBrowser(),
    reason:String(error)};
   saveB419();
   fail('B427_SECOND_TRUE_A1_MISSION_REJOIN_OR_POINTER_HOLD');
  }
  proof.started=meta(started,newPage.origin);
  saveB419();
  let held=false;
  try{
   await cmd('Input.dispatchMouseEvent',
    {type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
   held=true;
   await until(async()=>{
    const n=await snapshot();authority(n,'FIXED');
    return n.shotsFired>started.shotsFired&&
     n.player.ink<started.player.ink?n:false;
   },60000);
  }finally{
   if(held)await cmd('Input.dispatchMouseEvent',
    {type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
  }
  const fired=await snapshot();authority(fired,'FIXED');
  proof.fired=meta(fired,newPage.origin);
  saveB419();
  await picture('B419_REAL_SECOND_SOURCE_PLAYER_SHOT');
  const result=auditB419NativeReplay(proof);
  writeFileSync(resolve(OUTPUT,'b419-driver-native-replay-verdict.json'),
   JSON.stringify(result,null,2)+'\n');
  console.log('B419_TRUE_REAL_FRESH_SECOND_SOURCE_MATCH',JSON.stringify(result));
  if(b430FullSecond180){
   // B430: continue this ACTUAL new Rapier/CPU browser world past the
   // genuine B419 second shot. Do not restart, fast-forward, inject ticks,
   // seek or relock the browser. 2x 180s SOURCE play is distinct from a
   // scoreable/full-4v4 Nintendo turf result.
   const two={schema:'B430_TRUE_SECOND_SOURCE_180S',
    base:proof,secondOrigin:newPage.origin,
    syntheticTicks:false,actorWrites:0,scoreWrites:0,nativeClockWrites:0,
    samples:[],secondEndUi:null};
   const saveTwo=()=>writeFileSync(resolve(OUTPUT,
    'b430-two-authentic-source-180s.json'),JSON.stringify(two,null,2)+'\n');
   const sampleTwo=async (label,n)=>{
    authority(n,'FIXED');
    const originNow=await evaluate('performance.timeOrigin');
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    const item={...meta(n,originNow),label,
     cpuSourceShots:n.cpuSourceTurfShots,
     cpuPaintCells:n.cpuInkCellsChanged,
     humanPaintCells:n.b23HumanInkFeedback.humanChangedCells,
     pointerLocked:locked};
    two.samples.push(item);saveTwo();
    console.log('B430_TRUE_SECOND_SOURCE_NATIVE_CLOCK',
     JSON.stringify({label,tick:item.tick,remaining:item.remaining,
      phase:item.phase,realCpu:item.rejoins,
      shots:item.shots,cpuShots:item.cpuSourceShots,
      cpuPaint:item.cpuPaintCells,source:item.source,
      officialWinner:item.winner}));
   };
   saveTwo();
   for(const remaining of [120,60,0]){
    // Poll only the genuine browser snapshot; this wait is NOT gameplay
    // acceleration. Stop on lost focus, CPU removal or source violation.
    const n=await until(async()=>{
     const curr=await snapshot();authority(curr,'FIXED');
     if(curr.stopReason||curr.cpu.physicalRejoins.length!==7||
        curr.cpu.physicalFootRelocations!==0||
        (curr.paused&&curr.matchState!=='TIME_UP')||
        (curr.matchState!=='PLAYING'&&curr.matchState!=='TIME_UP'))
      fail('B430_SECOND_REAL_NATIVE_ROUND_INTERRUPTED');
     return curr.timeRemainingSeconds<=remaining+.001&&
      (remaining===0?curr.matchState==='TIME_UP':
       curr.matchState==='PLAYING')?curr:false;
    },17*60*1000);
    await sampleTwo(remaining===0?'TIME_UP':String(remaining),n);
   }
   const endUi=await until(()=>evaluate(`(() => {
    const modal=document.querySelector('#t21-f3-b59-session-finished');
    const b=document.querySelector('#t21-f3-b59-restart');
    return {visible:!!modal&&!modal.hidden&&
     getComputedStyle(modal).display!=='none',
     realModalFinished:modal?.dataset.t21B59State==='FINISHED',
     buttonVisible:!!b&&!b.hidden&&getComputedStyle(b).display!=='none',
     buttonDisabled:!!b?.disabled};
   })()`).then(x=>x?.visible&&x?.realModalFinished&&
    x?.buttonVisible&&!x.buttonDisabled?x:false),20000);
   two.secondEndUi=endUi;saveTwo();
   await picture('B430_TRUE_SECOND_SOURCE_TIME_UP');
   const audited=auditB430TrueSecond180s(two);
   writeFileSync(resolve(OUTPUT,'b430-driver-two-real-180s-verdict.json'),
    JSON.stringify(audited,null,2)+'\n');
   console.log('B430_TWO_SEPARATE_REAL_SOURCE_180S',JSON.stringify(audited));
  }
 }

 if(b200ReplayTrial){
  // CDP REAL input. Two physically independent ALLY_SYNC CLEARs, then
  // both visible HUD and R-key navigation. Never inject game state/ticks.
  const proof={schema:'B200_REAL_CDP_FRESH_REPLAY_V1',firstClear:null,
   cardReplay:null,secondClear:null,hudReplay:null,keyboardReplay:null,
   sourceAuthority:'25/17/26/0',naturalOpponentPaths:'0/12',
   officialWinner:'NONE',syntheticInput:false,teleportedActors:false};
  const persist=()=>writeFileSync(resolve(OUTPUT,'w10b200-real-replay.json'),
   JSON.stringify(proof,null,2));
  const esc=async()=>{
   for(const type of ['keyDown','keyUp'])
    await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
     windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
   await until(()=>evaluate('document.pointerLockElement===null'),25000);
  };
  const verifyNewWorld=async(origin,via)=>{
   const page=await until(async()=>{try{
    const p=await evaluate(`(() => ({
     origin:performance.timeOrigin,
     ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
     coop:document.querySelector('#app-canvas')?.dataset.t21B193Coop,
     url:location.search,
     variant:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B56NextVariant
    }))()`);
    return p.origin>origin&&p.ready==='READY'&&
      p.coop==='REAL_A1_ORIGINAL_SOURCE'&&
      p.url===('?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop'+
       (b203FullRoundTrial?'&t21W10B203=fullRound':''))&&
      p.variant==='ALLY_SYNC'?p:false;
   }catch{return false;}},100000);
   const n=await snapshot();authority(n,'FIXED');
   if(n.matchState!=='STAGING'||n.cpu.physicalRejoins.length!==0||
      n.cpu.physicalFootRelocations!==0||
      n.b25SourcePaintRun.status!=='IDLE'||n.sourceScoreablePromotions!==0)
    fail('B200_NEW_SOURCE_WORLD_NOT_CLEAN_'+via);
   return {via,previousTimeOrigin:origin,newTimeOrigin:page.origin,
    newWorldTick:n.tick,staging:n.matchState,practiceStatus:n.b25SourcePaintRun.status,
    cpuRejoinsAtBoot:n.cpu.physicalRejoins.length,actorTeleports:n.cpu.physicalFootRelocations};
  };
  const first=await snapshot();authority(first,'FIXED');
  if(first.b25SourcePaintRun.status!=='CLEAR')
   fail('B200_NO_FIRST_GENUINE_CLEAR');
  proof.firstClear={tick:first.tick,
   human:first.b25SourcePaintRun.humanChangedImpactCells,
   grounded:first.b25SourcePaintRun.realGroundedTravelMeters,
   a1:first.b25SourcePaintRun.actualOriginalA1ChangedImpactCells};
  persist();
  await esc();
  const missionCard=await evaluate(`(() => {
   const c=document.querySelector('#t21-f3-b25-paint-run');
   const b=document.querySelector('#t21-f3-b25-start');
   return {replay:c?.dataset.t21B197FreshWorldReplay,
    enabled:!b?.disabled,label:b?.textContent};
  })()`);
  if(missionCard.replay!=='true'||!missionCard.enabled||
     !missionCard.label?.includes('REPLAY REAL A1 CO-OP'))
   fail('B200_MISSION_CARD_REPLAY_UNAVAILABLE');
  const original1=await evaluate('performance.timeOrigin');
  await clickButton('#t21-f3-b25-start');
  proof.cardReplay=await verifyNewWorld(original1,'REAL_CDP_MISSION_CARD_CLICK');
  persist();
  // A second full genuine session, not a screenshot/QA-state substitution.
  await doPhysicalTrial(2);
  const second=await snapshot();authority(second,'FIXED');
  const r=second.b25SourcePaintRun;
  if(r.status!=='CLEAR'||r.humanChangedImpactCells<180||
     r.realGroundedTravelMeters<12||
     r.actualOriginalA1ChangedImpactCells<30||
     r.actualOriginalA1TaggedImpactEvents<1)
   fail('B200_SECOND_SOURCE_ALLY_MISSION_NOT_CLEAR');
  proof.secondClear={tick:second.tick,human:r.humanChangedImpactCells,
   grounded:r.realGroundedTravelMeters,a1:r.actualOriginalA1ChangedImpactCells,
   impacts:r.actualOriginalA1TaggedImpactEvents};
  persist();
  await esc();
  const button=await evaluate(`(() => {
   const b=document.querySelector('#t21-f3-b200-replay');
   const r=b?.getBoundingClientRect();
   return {visible:b?.hidden===false&&b?.style.display!=='none',
    enabled:!b?.disabled,top:r?.top};
  })()`);
  if(!button.visible||!button.enabled||!(button.top>=0&&button.top<900))
   fail('B200_VISIBLE_ENDSCREEN_REPLAY_MISSING');
  await picture('W10B200_REAL_TERMINAL_REPLAY_BUTTON');
  const original2=await evaluate('performance.timeOrigin');
  await clickButton('#t21-f3-b200-replay');
  proof.hudReplay=await verifyNewWorld(original2,'REAL_CDP_TERMINAL_HUD_CLICK');
  persist();
  const original3=await evaluate('performance.timeOrigin');
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'r',code:'KeyR',
   windowsVirtualKeyCode:82,nativeVirtualKeyCode:82});
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'r',code:'KeyR',
   windowsVirtualKeyCode:82,nativeVirtualKeyCode:82});
  proof.keyboardReplay=await verifyNewWorld(original3,'REAL_CDP_KEY_R');
  persist();
  console.log('B200_REAL_TWICE_CLEARED_AND_FRESH_REPLAY',JSON.stringify(proof));
 }
}
try{await run();}catch(err){
 // A rejected Chrome trial still preserves actual early native evidence.
 history.push({fatalNativeError:String(err),nativeOutcome:'UNVERIFIED_AFTER_FAILURE'});
 try{save();}catch{}
 console.error(err);process.exitCode=1;
}
finally{socket?.close();for(const child of children)child.kill('SIGTERM');}
