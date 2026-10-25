#!/usr/bin/env node
/** B139: real original 7-CPU game + physically walked lower-floor A1 ally trial. No time,
 * physics, ink, storage, source geometry or CPU configuration injection. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {sampleB140RealSourcePhysicalTrace} from './t21-w10b140-real-physics-sample.mjs';

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
const b194ButtonTrial=process.env.T21_B194_REAL_PLAYER_BUTTON==='1';
const b200ReplayTrial=process.env.T21_B200_REAL_REPLAY==='1';
if(b200ReplayTrial&&!b194ButtonTrial)
 throw Error('B200_REQUIRES_REAL_PLAYER_SELECTED_A1_COOP');
if(b162CoopTrial&&variant!=='ALLY_RALLY')
 throw Error('B162_ONLY_ORIGINAL_ALLY_RALLY_OPT_IN');
if(b194ButtonTrial&&(!b162CoopTrial||variant!=='ALLY_RALLY'))
 throw Error('B194_REQUIRES_EXISTING_REAL_A1_NATIVE_TRIAL');
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
/** B162: real native original route then real on-screen cooperative
 * 60Hz practice, no injected native ticks, movement, A1 paint or win.
 * This runs ONLY with explicit one-run QA opt-in on the A1 source variant.
 */
async function playB162GenuineAllySync(routeSteps,coopAttempt=1){
 const checkpoint=await snapshot();authority(checkpoint,'FIXED');
 // Native B139 original successful entrance camera orientation.
 // Restore this through REAL mouse movement after human upper practice;
 // never assign camera yaw/pitch or player/cpu body positions.
 const originalCamera=checkpoint.cameraSourcePractice;
 if(!Number.isFinite(originalCamera?.yawDegrees)||
    !Number.isFinite(originalCamera?.pitchDegrees))
  fail('B164_ORIGINAL_NATIVE_CAMERA_REFERENCE_MISSING');
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
 await clickButton('#t21-f3-b25-start');
 const armed=(await snapshot()).b25SourcePaintRun;
 if(armed.status!=='ARMED'||armed.practiceVariant!=='ALLY_SYNC'||
    armed.officialWinner!=='NONE')
  fail('B162_REAL_ALLY_SYNC_NOT_ARMED');
 await click(800,450);
 await until(()=>evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 const started=await until(async()=>{
  const n=await snapshot();authority(n,'FIXED');
  return n.b25SourcePaintRun.status==='RUNNING'?n:false;
 },100000);
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
  saveAttempt(actualLower,'B164_GENUINE_LOWER_SOURCE_FOOT_AND_A1_GATE');
  console.log('B164_ACTUAL_SOURCE_STANDOFF_WITNESS',JSON.stringify(lowerReport));
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

 if(boot.matchState!=='STAGING'||boot.paused||
    boot.cpu.sourcePatrol.b137AllyRallyOptIn!==allyOptIn||
    boot.b112OriginalHumanGround?.enabled!==(b194ButtonTrial?false:true))
  fail('NOT_REAL_ORIGINAL_7CPU_KCC_BOOT');
 const search=await evaluate('location.search');
 const actualUserUrl=b194ButtonTrial?
  '?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop':
  ('?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
   (allyOptIn?'&t21W10B137=allyRally&t21W10B150=allyInk':'')+
   (b154TeamCoverage?'&t21W10B154=teamCoverage':'')+
   '&t21W10B149=contactTrace');
 if(search!==actualUserUrl)
  fail('INVALID_SOURCE_PRACTICE_URL');
 await click(800,450);
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
 await doPhysicalTrial();

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
      p.url==='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop'&&
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
