#!/usr/bin/env node
/** B224 real CDP keyboard -> real PlayerInput -> real PlayerController QA. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
const ROOT='http://127.0.0.1:4197/browser-ink-tps/';
const b228=process.env.T21_B228_REGISTERED_UNDERPASS==='1';
const b226=b228||process.env.T21_B226_INNER_SLOPE==='1';
const corridor=b226||process.env.T21_B225_CORRIDOR==='1';
const OUT=process.env.T21_B224_OUT||'/tmp/t21-b224';
const children=[],pending=new Map();
let ws=null,sequence=0;
async function wait(fn,ms=45000,poll=150){
 const until=Date.now()+ms;
 while(Date.now()<until){const v=await fn();if(v)return v;await sleep(poll);}
 throw Error('B224_WAIT_TIMEOUT_'+ms);
}
async function cmd(method,params={}){
 const id=++sequence;
 return new Promise((ok,fail)=>{
  const t=setTimeout(()=>{pending.delete(id);fail(Error('B224_CDP_TIMEOUT_'+method));},20000);
  pending.set(id,{ok:v=>{clearTimeout(t);ok(v);},
   fail:e=>{clearTimeout(t);fail(e);}});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function read(expression){
 const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(r.exceptionDetails)throw Error('B224_PAGE_EXCEPTION_'+JSON.stringify(r.exceptionDetails));
 return r.result?.value;
}
async function key(code,down){
 const char=code==='KeyW'?'w':code==='KeyS'?'s':' ';
 const codeValue=code==='Space'?32:code==='KeyW'?87:83;
 await cmd('Input.dispatchKeyEvent',{
  type:down?'keyDown':'keyUp',code,key:char,
  windowsVirtualKeyCode:codeValue,nativeVirtualKeyCode:codeValue});
}
async function click(){
 for(const type of ['mousePressed','mouseReleased'])
  await cmd('Input.dispatchMouseEvent',{type,x:500,y:330,
   button:'left',clickCount:1});
}
async function scenario(side,direction){
 const url=b228
  ?ROOT+'?t21Qa=b228UnderpassInput&t21B228Source=isolated-ci688'+
    '&side='+side+'&direction=FLOOR_TO_SLOPE'
  :b226
  ?ROOT+'?t21Qa=b226InnerSlopeInput&t21B226Source=isolated-ci688'+
    '&side='+side+'&direction=FLOOR_TO_SLOPE'
  :corridor
  ?ROOT+'?t21Qa=b225OriginalCorridorInput&t21B225Source=isolated-ci688'+
    '&side='+side+'&direction=FLOOR_TO_SLOPE'
  :ROOT+'?t21Qa=b224OriginalGapInput&t21B224Source=isolated-ci688'+
    '&side='+side+'&direction='+direction;
 await cmd('Page.navigate',{url});
 const initial=await wait(async()=>{
  try{const o=await read('window.__t21B224?.snapshot()');
   return o?.ready?o:false;}catch{return false;}
 },90000);
 if(initial.initialSupport===null||!initial.originalSolidsStill25||
    !initial.originalPaintStill17||!initial.originalNavLinksStill26||
    initial.sourceScoreablePromotions!==0||initial.productionAuthorized!==false||
    initial.physicalSolidsInsideQa!==(corridor?30:27)||
    initial.b225CorridorEnabled!==corridor||
    initial.b226Enabled!==b226||initial.b228Enabled!==b228)
  throw Error('B224_B225_SOURCE_BOOT_UNTRUSTED');
 await click();
 await wait(()=>read('document.pointerLockElement===document.querySelector("#app-canvas")'),10000);
 // B224 original source model/project registration rotates the XZ crossing:
 // the authentic target changes X ~-1.278m and Z ~-2.607m.
 // Genuine CDP mouseLook (not QA pose/axis injection) rotates the camera
 // ~-26 degrees so that the existing W/S input points at the actual mesh.
 await cmd('Input.dispatchMouseEvent',{
  type:'mouseMoved',x:381,y:330,button:'none'});
 const oriented=await wait(async()=>{
  const p=await read('window.__t21B224.snapshot()');
  return p&&Math.abs(p.actualCameraYawDegrees+26.12)<4?p:false;
 },6000);
 if(!oriented.pointerLocked)throw Error('B224_MOUSE_LOOK_NO_POINTER_LOCK');
 const w= (side==='POSITIVE_Z')===(direction==='FLOOR_TO_SLOPE');
 const moveKey=w?'KeyW':'KeyS';
 await key(moveKey,true);
 const pre=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  const d=Math.hypot(o.playerPosition[0]-o.start[0],o.playerPosition[2]-o.start[2]);
  return d>=.13&&d<=.75?o:false;
 },7000);
 if(!pre.grounded)throw Error('B224_TAKEOFF_NOT_GROUNDED_'+side+direction);
 await key('Space',true);await key('Space',false);
 const near=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  const d=Math.hypot(o.playerPosition[0]-o.target[0],
   o.playerPosition[2]-o.target[2]);
  return o.successTick!==null||d<.58||o.tick>pre.tick+90?o:false;
 },14000);
 await key(moveKey,false);
 const end=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  return o.stableLandingTick!==null||o.tick>=near.tick+100?o:false;
 },13000);
 let b225SecondLeg=null;
 if(corridor){
  if(end.stableLandingTick===null)
   throw Error('B225_INITIAL_AUTHENTIC_2M_JUMP_NOT_STABLE');
  if(end.currentFootSolid!=='B224_QA_ONLY:underpass-route-slope00-outer-'+
     (side==='POSITIVE_Z'?'positive-z':'negative-z'))
   throw Error('B225_FIRST_LEG_DESTINATION_NO_LONGER_SUPPORTED');
  // Continue from same real PlayerController body. NO respawn.
  // This second segment uses the real held W/S input, *without* another
  // Space command. Rapier's configured physical grounding must decide
  // whether the authentic 0.5186m outer-slope -> FloorConcrete02 seam can
  // be safely walked. The result is evidence, not an assumed PASS.
  const secondLegStart=end;
  await key(moveKey,true);
  const advance=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   // B226 may not stop merely near the model centroid:
   // negative-side CI #40293452614 reached <0.22m but remained supported
   // by the outer slope. Keep REAL W/S pressed until Floor02 truly holds
   // the human capsule. Baseline B225 behavior is unchanged.
   // The source-ramp may still support the capsule even with <0.55m
   // centroid distance. Require exact destination *collider support* in
   // all corridor QA modes, or the bounded 120-native-tick timeout.
   return o.b225FirstNextSupportTick!==null||
     o.tick>=secondLegStart.tick+120?o:false;
  },33000,20);
  await key(moveKey,false);
  let parked=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b225StableNextTick!==null||
     o.tick>=advance.tick+120?o:false;
  },33000);
  const genuineKeyboardBrakeCorrections=[];
  // The B228 strict run #40298370469 reproduces a real issue:
  // native Floor02 support exists, but releasing W/S at full speed lets
  // inertia carry the human outside the ORIGINAL <=0.85m park radius.
  // Only actual keyboard W/S pulses, with NO body set/teleport and NO
  // tolerance change, are permitted as corrections.
  for(let attempt=0;attempt<3&&parked.b225StableNextTick===null&&
      parked.b225FirstNextSupportTick!==null;attempt++){
   const origin=parked.stableLandingPosition??end.stableLandingPosition;
   const goal=parked.b225NextTarget;
   if(!origin||!goal)throw Error('B228_NO_REAL_SOURCE_ORIGIN_FOR_BRAKING');
   const forwardX=goal[0]-origin[0],forwardZ=goal[2]-origin[2];
   const dot=(parked.playerPosition[0]-goal[0])*forwardX+
     (parked.playerPosition[2]-goal[2])*forwardZ;
   const brakingKey=dot>0?
     (moveKey==='KeyW'?'KeyS':'KeyW'):moveKey;
   const beforeCorrection=parked;
   await key(brakingKey,true);
   const close=await wait(async()=>{
    const o=await read('window.__t21B224.snapshot()');
    const d=Math.hypot(o.playerPosition[0]-goal[0],
     o.playerPosition[2]-goal[2]);
    return (o.currentFootSolid===o.b225NextSolid&&o.grounded&&
      d<=.25)?o:o.tick>=beforeCorrection.tick+65?o:false;
   },16000,20);
   await key(brakingKey,false);
   parked=await wait(async()=>{
    const o=await read('window.__t21B224.snapshot()');
    return o.b225StableNextTick!==null||
      o.tick>=close.tick+80?o:false;
   },16000,25);
   genuineKeyboardBrakeCorrections.push({
    side,attempt:attempt+1,brakingKey,
    beforeTick:beforeCorrection.tick,afterTick:parked.tick,
    beforePosition:beforeCorrection.playerPosition,
    closest:parked.b225MinNextErrorMeters,
    stableNativeFloor02:parked.b225StableNextTick!==null,
    totalSpaceInputs:parked.validJumpInputs,
    noRelocations:parked.teleportsAfterQaSpawn===0
   });
  }
  if(genuineKeyboardBrakeCorrections.length)
   console.log('B228_REAL_KEYBOARD_MOMENTUM_CORRECTION',
    JSON.stringify(genuineKeyboardBrakeCorrections));
  b225SecondLeg={sourceAtStart:secondLegStart.currentFootSolid,
   startNativeTick:secondLegStart.tick,advance,parked,
   genuineKeyboardBrakeCorrections,
   physicallyTouchedOriginalFloor02:parked.b225FirstNextSupportTick!==null,
   secondLegStartedTick:parked.b225SecondLegStartedTick,
   noSecondJump:
    parked.b225SecondLegNoJumpInputsAtStart===1&&parked.validJumpInputs===1,
   secondLegGroundedTicks:parked.b225SecondLegGroundedTicks,
   secondLegUngroundedTicks:parked.b225SecondLegUngroundedTicks,
   longestAirborneStreak:parked.b225LongestUngroundedStreak,
   stableFloor02:parked.b225StableNextTick!==null,
   jumpInputs:parked.validJumpInputs,
   stageColliderCollisions:parked.originalColliderContactCount,
   originalSourceSupportOrder:parked.b225NativeSourceSupportOrder,
   noTeleport:parked.teleportsAfterQaSpawn===0};
  console.log('B225_REAL_BROWSER_CONTINUOUS_CORRIDOR',JSON.stringify({
   side,oneActualBody:true,firstJumpStable:end.stableLandingTick!==null,
   secondLegJumpInputCount:parked.validJumpInputs,
   genuineNextFloorContact:b225SecondLeg.physicallyTouchedOriginalFloor02,
   genuineStableNextFloor:b225SecondLeg.stableFloor02,
   nextFloorSupportTick:parked.b225FirstNextSupportTick,
   nextFloorStableTick:parked.b225StableNextTick,
   minSecondTargetErrorMeters:parked.b225MinNextErrorMeters,
   sourceSupportOrder:parked.b225NativeSourceSupportOrder,
   secondLegGroundedTicks:parked.b225SecondLegGroundedTicks,
   secondLegUngroundedTicks:parked.b225SecondLegUngroundedTicks,
   longestAirborneStreak:parked.b225LongestUngroundedStreak,
   originalColliderCollisions:parked.originalColliderContactCount,
   finalBodyPosition:parked.playerPosition}));
 }
 let b226ThirdLeg=null;
 let b228FourthLeg=null;
 let aimAfterInner=null;
 if(b226){
  if(!b225SecondLeg?.stableFloor02)
   throw Error('B226_CANNOT_TRAVERSE_BEFORE_REAL_FLOOR02_STABILITY');
  const beforeThird=b225SecondLeg.parked;
  if(beforeThird.currentFootSolid!==beforeThird.b225NextSolid)
   throw Error('B226_CANNOT_START_OFF_AUTHENTIC_FLOOR02');
  const baseMouseX=381;
  const moveKeyThird=moveKey;
  async function aimAt(point){
   const current=await read('window.__t21B224.snapshot()');
   const dx=point[0]-current.playerPosition[0],
    dz=point[2]-current.playerPosition[2];
   const sign=side==='POSITIVE_Z'?1:-1;
   const desired=Math.atan2(dx*sign,-dz*sign)*180/Math.PI;
   let delta=desired-current.actualCameraYawDegrees;
   while(delta>180)delta-=360;
   while(delta<-180)delta+=360;
   const targetX=Math.round(500+delta/.22);
   // CDP generates true mousemove pixels, no synthetic player axis.
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
    x:targetX,y:330,button:'none'});
   const aimed=await read('window.__t21B224.snapshot()');
   return {desiredYaw:desired,deltaYaw:delta,targetX,
    observedYaw:aimed.actualCameraYawDegrees};
  }
  // Prior recorded mouse was x=381, so relative CDP look must start
  // from that actual pixel. 500 is the viewport center only, not
  // the last event. x=381+delta/.22 gives the intended real movement.
  async function aimFromLast(point,lastMouseX){
   const current=await read('window.__t21B224.snapshot()');
   const dx=point[0]-current.playerPosition[0],
     dz=point[2]-current.playerPosition[2];
   const sign=side==='POSITIVE_Z'?1:-1;
   const desired=Math.atan2(dx*sign,-dz*sign)*180/Math.PI;
   let d=desired-current.actualCameraYawDegrees;
   while(d>180)d-=360;
   while(d< -180)d+=360;
   const x=lastMouseX+Math.round(d/.22);
   if(x<10||x>990)throw Error('B226_REAL_MOUSE_VIEWPORT_LIMIT');
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
    x,y:330,button:'none'});
   const after=await read('window.__t21B224.snapshot()');
   return {x,desired,actual:after.actualCameraYawDegrees};
  }
  const wayAim=await aimFromLast(beforeThird.b226Waypoint,381);
  await key(moveKeyThird,true);
  const waypointApproach=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b226VisitedWaypoint||o.tick>beforeThird.tick+150?o:false;
  },28000);
  await key(moveKeyThird,false);
  const waypointRest=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return (o.grounded&&o.currentFootSolid===o.b225NextSolid&&
      o.b226VisitedWaypoint&&
      o.b226WaypointNearestMeters<.75&&
      o.tick>=waypointApproach.tick+20)||
      o.tick>=waypointApproach.tick+70?o:false;
  },13000);
  const innerAim=await aimFromLast(waypointRest.b226InnerTarget,wayAim.x);
  aimAfterInner=(point)=>aimFromLast(point,innerAim.x);
  await key(moveKeyThird,true);
  const innerApproach=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b226ActualInnerSupportTick!==null||
     o.b226NearestInnerMeters<.45||
     o.tick>=waypointRest.tick+115?o:false;
  },26000,30);
  await key(moveKeyThird,false);
  const innerParked=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b226StableInnerTick!==null||o.tick>=innerApproach.tick+85?o:false;
  },19000);
  b226ThirdLeg={wayAim,waypointApproach,waypointRest,innerAim,
   innerApproach,innerParked,onePlayer:true,
   stableFirstJump:beforeThird.stableLandingTick!==null,
   stableSecondFloor:beforeThird.b225StableNextTick!==null,
   visitedWaypoint:innerParked.b226VisitedWaypoint,
   physicallyTouchedInnerSlope:innerParked.b226ActualInnerSupportTick!==null,
   physicallyStableInnerSlope:innerParked.b226StableInnerTick!==null,
   totalSpaceInputs:innerParked.validJumpInputs,
   noTeleport:innerParked.teleportsAfterQaSpawn===0,
   originalRuntimeContacts:innerParked.originalColliderContactCount};
  console.log('B226_REAL_BROWSER_INNER_SLOPE_CONTINUITY',JSON.stringify({
   side,visitedWaypoint:b226ThirdLeg.visitedWaypoint,
   waypointNearest:innerParked.b226WaypointNearestMeters,
   touchedInnerSlope:b226ThirdLeg.physicallyTouchedInnerSlope,
   stableInnerSlope:b226ThirdLeg.physicallyStableInnerSlope,
   innerSlopeClosestMeters:innerParked.b226NearestInnerMeters,
   observedThirdGroundedTicks:innerParked.b226ThirdLegGroundedTicks,
   observedThirdAirborneTicks:innerParked.b226ThirdLegUngroundedTicks,
   totalSpaceInputs:innerParked.validJumpInputs,
   originalStageCollisions:innerParked.originalColliderContactCount,
   sourceFootChain:innerParked.b225NativeSourceSupportOrder,
   finalPosition:innerParked.playerPosition}));
 }
 if(b228){
  if(!b226ThirdLeg?.physicallyStableInnerSlope||!aimAfterInner)
   throw Error('B228_ORIGINAL_INNER_SOURCE_NOT_STABLE');
  const beforeFourth=b226ThirdLeg.innerParked;
  if(beforeFourth.currentFootSolid!==beforeFourth.b226InnerId||
     !beforeFourth.grounded||beforeFourth.validJumpInputs!==1)
   throw Error('B228_INITIAL_SOURCE_INNER_NOT_PHYSICALLY_GROUNDED');
  const underpassAim=await aimAfterInner(beforeFourth.b228UnderpassTarget);
  await key(moveKey,true);
  const underpassApproach=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b228FirstNativeFootTick!==null||
    o.tick>=beforeFourth.tick+150?o:false;
  },29000,30);
  await key(moveKey,false);
  let underpassRest=await wait(async()=>{
   const o=await read('window.__t21B224.snapshot()');
   return o.b228StableNativeTick!==null||
    o.tick>=underpassApproach.tick+110?o:false;
  },24000);
  const realRegisteredFloorNudges=[];
  // Native original foot may be briefly touched at the source seam.
  // Only short real keyboard W/S pushes can settle the actual body.
  for(let i=0;i<3&&underpassRest.b228StableNativeTick===null&&
      underpassRest.b228FirstNativeFootTick!==null;i++){
   const beforeNudge=underpassRest;
   await key(moveKey,true);
   const nudge=await wait(async()=>{
    const o=await read('window.__t21B224.snapshot()');
    return o.tick>=beforeNudge.tick+8?o:false;
   },5000,15);
   await key(moveKey,false);
   underpassRest=await wait(async()=>{
    const o=await read('window.__t21B224.snapshot()');
    return o.b228StableNativeTick!==null||
     o.tick>=nudge.tick+80?o:false;
   },15000,30);
   realRegisteredFloorNudges.push({
    side,attempt:i+1,fromTick:beforeNudge.tick,endTick:underpassRest.tick,
    actualNativeSourceFootAtEnd:underpassRest.currentFootSolid,
    stableNativeAfterRealKey:underpassRest.b228StableNativeTick!==null,
    actualNativeSupportCount:underpassRest.b228NativeColliderSupportTicks,
    consecutiveNativeRestTicks:underpassRest.b228StableNativeTicks,
    grounded:underpassRest.grounded,
    lastAxis:underpassRest.lastFixedInputAxis,
    targetErrorMeters:Math.hypot(
     underpassRest.playerPosition[0]-underpassRest.b228UnderpassTarget[0],
     underpassRest.playerPosition[2]-underpassRest.b228UnderpassTarget[2]),
    totalSpaceInputs:underpassRest.validJumpInputs,
    actorRelocations:underpassRest.teleportsAfterQaSpawn
   });
  }
  if(realRegisteredFloorNudges.length)
   console.log('B228_REAL_NATIVE_FLOOR_KEYBOARD_SETTLE',
    JSON.stringify(realRegisteredFloorNudges));
  b228FourthLeg={beforeFourth,underpassAim,underpassApproach,underpassRest,
   realRegisteredFloorNudges,
   samePlayer:true,oneSpaceOnly:underpassRest.validJumpInputs===1,
   physicalOriginalUnderpassHit:underpassRest.b228FirstNativeFootTick!==null,
   stableOriginalUnderpass:underpassRest.b228StableNativeTick!==null,
   actualNativeFootId:underpassRest.b228LastNativeFootId,
   sourceToOriginalContact:underpassRest.b228FootTransitionSourceToRegistered,
   startedFromInner:underpassRest.b228WasOnInnerWhenFourthStarted,
   originalContactAlreadyBeforeMove:underpassRest.b228NativeSupportBeforeFourth,
   inputInitialSpaceCount:underpassRest.b228AtFourthJumpInputs,
   afterSpawnTeleports:underpassRest.teleportsAfterQaSpawn};
  console.log('B228_REAL_BROWSER_ORIGINAL_UNDERPASS_REJOIN',JSON.stringify({
   side,samePlayer:true,oneSpaceOnly:b228FourthLeg.oneSpaceOnly,
   startedOnInner:b228FourthLeg.startedFromInner,
   originalCollisionWasAbsentBeforeMove:
    !b228FourthLeg.originalContactAlreadyBeforeMove,
   originalRegisteredFootId:underpassRest.b228UnderpassSolid,
   actualNativeFootId:b228FourthLeg.actualNativeFootId,
   finalActualFootId:underpassRest.currentFootSolid,
   finalActualFixedAxis:underpassRest.lastFixedInputAxis,
   finalActualMoveAxis:underpassRest.inputAxis,
   finalNativeConsecutiveRestTicks:underpassRest.b228StableNativeTicks,
   totalNativeOriginalSupportTicks:underpassRest.b228NativeColliderSupportTicks,
   originalRegisteredFloorNudges:realRegisteredFloorNudges.length,
   finalDistanceMeters:Math.hypot(
    underpassRest.playerPosition[0]-underpassRest.b228UnderpassTarget[0],
    underpassRest.playerPosition[2]-underpassRest.b228UnderpassTarget[2]),
   originalRegisteredFootContact:b228FourthLeg.physicalOriginalUnderpassHit,
   stableGroundedNativeUnderpass:b228FourthLeg.stableOriginalUnderpass,
   firstOriginalGroundedTick:underpassRest.b228FirstNativeFootTick,
   stableOriginalTick:underpassRest.b228StableNativeTick,
   fourthLegGroundedTicks:underpassRest.b228NativeGroundedTicks,
   fourthLegUngroundedTicks:underpassRest.b228NativeUngroundedTicks,
   closestGroundedNativeTargetMeters:
    underpassRest.b228ClosestNativeGroundedErrorMeters,
   footSupportOrder:underpassRest.b225NativeSourceSupportOrder,
   trueSourceToRegisteredRejoin:
    b228FourthLeg.sourceToOriginalContact,
   finalGrounded:underpassRest.grounded,
   finalPlayerPosition:underpassRest.playerPosition,
   postSpawnTeleports:underpassRest.teleportsAfterQaSpawn,
   routeCertification:'0/12',officialWinner:'NONE'}));
 }
 const result={side,direction,oriented,pre,near,end,b225SecondLeg,b226ThirdLeg,b228FourthLeg,
  actualKeydown:true,realPlayerController:true,actorTeleports:0};
 console.log('B224_REAL_BROWSER_SOURCE_JUMP',JSON.stringify({
  side,direction,atTick:end.tick,jumpInputs:end.validJumpInputs,
  firstJumpTick:end.firstJumpTick,successTick:end.successTick,
  initialSupport:end.initialSupport,landingSupport:end.firstLandingSupport,
  minTargetError:end.minimumTargetErrorMeters,collisionsWithOriginal:
   end.originalColliderContactCount,afterLanding:end.grounded,
  nativeWorldPosition:end.playerPosition,
  physicalSourceReach:end.physicallyEnteredTarget,
  stableLandingTick:end.stableLandingTick,
  stableTargetGroundedTicks:end.stableTargetGroundedTicks,
  stableLandingPosition:end.stableLandingPosition,
  closestGroundedTargetErrorMeters:end.closestGroundedTargetErrorMeters}));
 return result;
}
try{
 mkdirSync(OUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)throw Error('B224_NO_CHROME');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},25000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--disable-extensions','--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--remote-debugging-port=9264','--remote-allow-origins=*',
  '--window-size=1000,660','--user-data-dir=/tmp/t21-b224-cdp','about:blank'],
  {stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  try{return (await (await fetch('http://127.0.0.1:9264/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 },35000);
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((resolve,reject)=>{
   ws.addEventListener('open',resolve,{once:true});
   ws.addEventListener('error',reject,{once:true});}),
  sleep(10000).then(()=>{throw Error('B224_WS_TIMEOUT');})
 ]);
 ws.addEventListener('message',evt=>{
  const m=JSON.parse(String(evt.data)),p=pending.get(m.id);if(!p)return;
  pending.delete(m.id);
  if(m.error)p.fail(Error(JSON.stringify(m.error)));else p.ok(m.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1000,height:660,deviceScaleFactor:1,mobile:false});
 const reports=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z']){
  for(const direction of (corridor?['FLOOR_TO_SLOPE']:
       ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR']))
   reports.push(await scenario(side,direction));
 }
 const summary={schema:b228?'B228_REAL_CDP_SOURCE_TO_REGISTERED_UNDERPASS':
  b226?'B226_REAL_CDP_INNER_SLOPE_SOURCE_CONTINUITY':
  corridor?'B225_REAL_CDP_CONTINUOUS_SOURCE_CORRIDOR':
   'B224_REAL_CDP_INPUT_PLAYERCONTROLLER_RAPIER',
  qaOnly:true,productionAuthorized:false,scoreable:0,
  sourceStage25_17_26_0:true,actorTeleportsAfterSpawn:0,
  nativeRealPlayerKeyboard:true,realBrowserWebGL2:true,
  completed:reports.length,
  preciseCenterSuccessCount:reports.filter(x=>x.end.successTick!==null).length,
  stableSourceLandingCount:reports.filter(x=>x.end.stableLandingTick!==null).length,
  secondStageTouched:reports.filter(x=>x.b225SecondLeg?.physicallyTouchedOriginalFloor02).length,
  secondStageStable:reports.filter(x=>x.b225SecondLeg?.stableFloor02).length,
  b226WaypointReached:reports.filter(x=>x.b226ThirdLeg?.visitedWaypoint).length,
  b226InnerSourceTouched:reports.filter(x=>x.b226ThirdLeg?.physicallyTouchedInnerSlope).length,
  b226InnerSourceStable:reports.filter(x=>x.b226ThirdLeg?.physicallyStableInnerSlope).length,
  b228NativeUnderpassTouched:reports.filter(x=>
    x.b228FourthLeg?.physicalOriginalUnderpassHit).length,
  b228NativeUnderpassStable:reports.filter(x=>
    x.b228FourthLeg?.stableOriginalUnderpass).length,
  reports};
 writeFileSync(resolve(OUT,b228?'b228-original-underpass-rejoin.json':
  b226?'b226-inner-slope-source.json':
  corridor?'b225-continuous-native-source-corridor.json':
  'b224-native-input-rapier.json'),JSON.stringify(summary,null,2));
 console.log('B224_REAL_KEYBOARD_FINAL',JSON.stringify({tested:summary.completed,
  physicallyStableLandings:summary.stableSourceLandingCount,
  preciseCenterLandings:summary.preciseCenterSuccessCount,
  sourceStage25_17_26_0:true,officialWinner:'NONE'}));
 if(b228){
  if(summary.completed!==2||summary.stableSourceLandingCount!==2||
     summary.secondStageStable!==2||
     summary.b226InnerSourceStable!==2||
     reports.some(x=>{
      const t=x.b228FourthLeg,p=t?.underpassRest;
      const suffix=x.side==='POSITIVE_Z'?'positive-z':'negative-z';
      const expectedId='UndertowT21D:glass-underpass-'+suffix;
      const chain=['floor-concrete01','slope00-outer',
       'floor-concrete02','slope00-inner'].map(id=>
        'B224_QA_ONLY:underpass-route-'+id+'-'+suffix);
      return !t||!p||t.afterSpawnTeleports!==0||
       !t.oneSpaceOnly||!t.startedFromInner||
       !t.physicalOriginalUnderpassHit||!t.stableOriginalUnderpass||
       !t.sourceToOriginalContact||t.originalContactAlreadyBeforeMove||
       t.actualNativeFootId!==expectedId||
       p.currentFootSolid!==expectedId||
       p.b228NativeGroundedTicks<18||
       p.b228NativeUngroundedTicks!==0||
       p.validJumpInputs!==1||p.b228AtFourthJumpInputs!==1||
       p.b228ClosestNativeGroundedErrorMeters===null||
       p.b228ClosestNativeGroundedErrorMeters>.9||
       !chain.every((id,i)=>p.b225NativeSourceSupportOrder[i]===id);
     }))
   throw Error('B228_REAL_REGISTERED_UNDERPASS_CONTINUITY_REGRESSION');
  // Actual B228 native Chromium CI #40297678361 measured real, stable
  // registered 25-solid underpass foot support on both mirrored sides,
  // with zero airborne ticks after the third stable original source leg.
  console.log('B228_REAL_REGISTERED_UNDERPASS_STABLE_4TH_LEG_GATE_PASS');
  console.log('B228_REAL_SOURCE_TO_REGISTERED_CONTACT_GATE_PASS',
   JSON.stringify({tested:2,realNativeContact:summary.b228NativeUnderpassTouched,
    stableNative:summary.b228NativeUnderpassStable,
    productionAuthorized:false,routeCertification:'0/12'}));
 }else if(b226){
  if(summary.completed!==2||summary.stableSourceLandingCount!==2||
     summary.secondStageStable!==2||
     reports.some(r=>!r.b226ThirdLeg||
       !r.b226ThirdLeg.noTeleport||
       r.b226ThirdLeg.totalSpaceInputs!==1||
       r.b226ThirdLeg.originalRuntimeContacts!==0))
   throw Error('B226_EARLIER_ORIGINAL_SOURCE_GATES_FAILED');
  // B226 run 40293716638 confirmed both real source inner-slope
  // landings. Make the actual physical outcome a strict regression:
  // requiring verified Floor02/inner support and no airborne third leg.
  if(summary.b226WaypointReached!==2||
     summary.b226InnerSourceTouched!==2||
     summary.b226InnerSourceStable!==2||
     reports.some(r=>{
      const q=r.b226ThirdLeg,foot=q?.innerParked;
      const suffix=r.side==='POSITIVE_Z'?'positive-z':'negative-z';
      const chain=['floor-concrete01','slope00-outer',
        'floor-concrete02','slope00-inner']
       .map(id=>'B224_QA_ONLY:underpass-route-'+id+'-'+suffix);
      return !q||!q.visitedWaypoint||
       !q.physicallyTouchedInnerSlope||!q.physicallyStableInnerSlope||
       q.totalSpaceInputs!==1||q.originalRuntimeContacts!==0||
       !q.noTeleport||!foot||
       foot.b226ThirdLegGroundedTicks<18||
       foot.b226ThirdLegUngroundedTicks!==0||
       foot.b226ThirdLegLongestAirborneStreak!==0||
       !chain.every((id,i)=>foot.b225NativeSourceSupportOrder[i]===id);
     }))throw Error('B226_INNER_SLOPE_NATIVE_PHYSICAL_CONTINUITY_FAILED');
  console.log('B226_REAL_INNER_SLOPE_GROUNDED_GATE_PASS');
  console.log('B226_REAL_CORRIDOR_RESULT',JSON.stringify({
   sourceLanding2of2:summary.stableSourceLandingCount,
   nextFloor2of2:summary.secondStageStable,
   waypoint:summary.b226WaypointReached,
   innerSlopeTouch:summary.b226InnerSourceTouched,
   innerSlopeStable:summary.b226InnerSourceStable,
   originalStage:'25/17/26/0',authorized:false}));
 }else if(corridor){
  // The B225 pass certifies actual keyboard action, 2m source jump, and
  // genuine onward probe execution. Whether the 0.5186m seam is walkable
  // must be judged separately from the logged evidence, never faked.
  if(summary.completed!==2||summary.stableSourceLandingCount!==2||
     reports.some(x=>{
       const lane=x.b225SecondLeg;
       const suffix=x.side==='POSITIVE_Z'?'positive-z':'negative-z';
       const chain=['floor-concrete01','slope00-outer','floor-concrete02']
        .map(id=>'B224_QA_ONLY:underpass-route-'+id+'-'+suffix);
       return !lane||!lane.noSecondJump||!lane.noTeleport||
        !lane.physicallyTouchedOriginalFloor02||!lane.stableFloor02||
        lane.stageColliderCollisions!==0||
        lane.secondLegGroundedTicks<18||
        lane.secondLegUngroundedTicks!==0||
        lane.longestAirborneStreak!==0||
        lane.secondLegStartedTick===null||
        !(lane.secondLegStartedTick>x.end.stableLandingTick)||
        !chain.every((id,i)=>lane.originalSourceSupportOrder[i]===id);
     }))
   throw Error('B225_INITIAL_GAP_OR_REAL_SECOND_CONTROL_INVALID');
  console.log('B225_NATIVE_CONTINUOUS_GROUNDED_GATE_PASS');
  console.log('B225_CONTINUOUS_LANE_EVIDENCE',JSON.stringify({
   sides:summary.completed,stableFirstJumps:summary.stableSourceLandingCount,
   realSecondFloorContacts:summary.secondStageTouched,
   realSecondFloorStable:summary.secondStageStable,
   officialWinner:'NONE',routeCertification:'0/12',
   productionAuthorized:false}));
 }else if(summary.stableSourceLandingCount!==4)
  throw Error('B224_REAL_INPUT_STABLE_SOURCE_LANDINGS_NOT_CERTIFIED');
}catch(e){console.error(e);process.exitCode=1;}
finally{ws?.close();for(const child of children)child.kill('SIGTERM');}
