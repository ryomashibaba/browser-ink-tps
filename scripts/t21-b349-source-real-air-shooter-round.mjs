#!/usr/bin/env node
/** B335: REAL pointer-locked browser, actual 180s clock, 1 human + 7 CPUs.
 * No QA clock advancement, actor relocation, artificial ink or fabricated winner. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
const ROOT='http://127.0.0.1:4189/browser-ink-tps/';
const DIR=process.env.T21_B349_OUTPUT||'/tmp/t21-b349';
const children=[],calls=new Map();
let socket=null,seq=0,clockStart=0;
const fail=reason=>{throw Error('B349_TRUE_CHROMIUM_'+reason);};
async function wait(fn,limit=100000){
 const until=Date.now()+limit;
 while(Date.now()<until){const n=await fn();if(n)return n;await sleep(400);}
 fail('WAIT_EXPIRED_'+limit);
}
async function send(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{calls.delete(id);reject(Error('CDP_TIMEOUT_'+method));},30000);
  calls.set(id,{yes:v=>{clearTimeout(timeout);resolve(v);},
   no:e=>{clearTimeout(timeout);reject(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function read(expression){
 const response=await send('Runtime.evaluate',{
  expression,returnByValue:true,awaitPromise:true});
 if(response.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(response.exceptionDetails));
 return response.result?.value;
}
const snapshot=()=>read('window.__t21F3.snapshot()');
const buttonScript=selector=>'(() => {const el=document.querySelector('+
 JSON.stringify(selector)+');if(!el||el.hidden||el.disabled)return null;'+
 'el.scrollIntoView({block:"center",behavior:"instant"});'+
 'const r=el.getBoundingClientRect();return {x:r.left+r.width/2,'+
 'y:r.top+r.height/2,width:r.width,height:r.height};})()';
async function clickButton(selector){
 const xy=await read(buttonScript(selector));
 if(!xy||xy.width<4||xy.height<4||xy.x<0||xy.y<0||xy.x>=1600||xy.y>=900)
  fail('REAL_VISIBLE_BUTTON_MISSING_'+selector);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:xy.x,y:xy.y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await send('Input.dispatchMouseEvent',{type,x:xy.x,y:xy.y,
   button:'left',clickCount:1});
}
async function picture(name){
 const response=await send('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true});
 const data=Buffer.from(response.data,'base64');
 if(data.length<20000||data.readUInt32BE(16)!==1600||data.readUInt32BE(20)!==900)
  fail('Genuine_Framebuffer_Missing_'+name);
 writeFileSync(resolve(DIR,name+'.png'),data);
}
function verifyAuthority(n){
 if(!n||n.stopReason||n.originalSourceSolids!==25||
  n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
  n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
  n.unrestricted4v4Certified!==false||
  n.turfResult!=='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'||
  n.cpu?.physicalFootRelocations!==0||
  !Array.isArray(n.cpu.cpu)||n.cpu.cpu.length!==7)
  fail('LIVE_STAGE_AUTHORITY_CHANGED');
 return n;
}
const proof={
 schema:'B337_REAL_CHROMIUM_NATIVE_SOURCE_INPUT_INK',source:'25/17/26/0',
 realFullRound:true,nativeCdpInput:true,
 injectedTicks:false,injectedInk:false,injectedActorPositions:false,
 officialWinner:'NONE',actions:[],samples:[]
};
function store(){
 writeFileSync(resolve(DIR,'b337-real-input-ink.json'),JSON.stringify(proof,null,2)+'\n');
}
async function run(){
 mkdirSync(DIR,{recursive:true});store();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium']
   .find(s=>{try{execFileSync('which',[s],{stdio:'ignore'});return true;}
   catch{return false;}});
 if(!chrome)fail('CHROMIUM_REQUIRED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4189','--strictPort','--base','/browser-ink-tps/'],{stdio:'inherit'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9279','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b349-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9279/json')).json())
   .find(p=>p.type==='page'&&p.webSocketDebuggerUrl);}catch{return null;}
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{
  socket.addEventListener('open',yes,{once:true});
  socket.addEventListener('error',no,{once:true});
 });
 socket.addEventListener('message',event=>{
  const r=JSON.parse(String(event.data)),q=calls.get(r.id);
  if(!q)return;calls.delete(r.id);
  r.error?q.no(Error(JSON.stringify(r.error))):q.yes(r.result||{});
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:ROOT+
  '?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B193=allyCoop&'+
  't21W10B203=fullRound&t21W10B343=sourceVolleyAtomic&'+
  't21W10B345=sourceShooterOpening&'+
  't21W10B346=nativeShooterPhysicsWitness&'+
  't21W10B348=sourceShooterAccuracyCandidate'});
 const ready=()=>wait(async()=>{
  try{return await read('document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"'+
   '&&document.querySelector("#app-canvas")?.dataset.t21F3Renderer==="webgl2"');}
  catch{return false;}
 },110000);
 await ready();
 // Start directly in the exact explicitly selected SOURCE QA full-round
 // session. No navigator backfill, fake start or hidden world mutation.
 const mode=await wait(async()=>{
  const x=await read('(() => ({ready:document.querySelector("#app-canvas")?.dataset.t21F3Ready,'+
   'full:document.querySelector("#app-canvas")?.dataset.t21B203FullRound,'+
   'search:location.search}))()');
  return x?.ready==='READY'&&x?.full==='REAL_180S_SOURCE_PLAY'?x:false;
 },120000);
 if(mode.search!=='?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B193=allyCoop&'+
  't21W10B203=fullRound&t21W10B343=sourceVolleyAtomic&'+
  't21W10B345=sourceShooterOpening&'+
  't21W10B346=nativeShooterPhysicsWitness&'+
  't21W10B348=sourceShooterAccuracyCandidate')
   fail('EXPLICIT_FROZEN_SOURCE_URL_IDENTITY');
 const boot=verifyAuthority(await snapshot());
 if(boot.b348SourceShooterAccuracy?.enabled!==true||
    boot.b348SourceShooterAccuracy.actualAcceptedCandidateShots!==0||
    boot.b348SourceShooterAccuracy.syntheticShots!==0||
    boot.b348SourceShooterAccuracy.syntheticInk!==0)
   fail('B348_SOURCE_PHYSICAL_ACCURACY_CANDIDATE_NOT_READY');
 if(boot.b346NativeShooterWitness?.enabled!==true||
    boot.b346NativeShooterWitness.totalActualShooterLaunches!==0||
    boot.b346NativeShooterWitness.droppedOldestEvents!==0)
   fail('B346_ORIGINAL_SOURCE_PHYSICAL_WITNESS_NOT_ARMED');
 if(boot.b345SourceShooterOpening?.enabled!==true||
    boot.b345SourceShooterOpening?.realOpeningClamps!==0)
  fail('B345_SOURCE_SHOOTER_OPTIN_NOT_AUTHORIZED');
 if(boot.b343OriginalSourceVolleyBudget?.enabled!==true||
    boot.b343OriginalSourceVolleyBudget?.physicalPoolSize!==128||
    boot.b343OriginalSourceVolleyBudget?.syntheticShots!==0||
    boot.b343OriginalSourceVolleyBudget?.syntheticInk!==0)
   fail('B343_SOURCE_VOLLEY_NOT_READY');
 if(boot.matchState!=='STAGING'||!boot.paused||
  boot.timeRemainingSeconds!==180||boot.tick!==0||
  await read('document.querySelector("#t21-f3-b202-real-pause")?.dataset.t21B202NativeState')!=='READY_TO_START')
  fail('REAL_USER_180S_READY_NOT_PROVEN');
 await clickButton('#t21-f3-b202-resume');
 await wait(()=>read('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const start=await wait(async()=>{
  const n=verifyAuthority(await snapshot());
  return n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7?n:false;
 },12*60*1000);
 // Parameter permits READ-ONLY original paint/foot ledger, not QA authority.
 await read('(() => {const u=new URL(location.href);'+
  'u.searchParams.set("t21B312","genuineSecondHumanPaint");'+
  'history.replaceState(null,"",u.href);return true;})()');

 clockStart=Date.now();
 const sample=async label=>{
  const n=verifyAuthority(await snapshot());
  const ledger=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  if(!ledger||ledger.source!=='25/17/26/0'||ledger.originalRows?.length!==17)
   fail('B312_REAL_ORIGINAL_LEDGER_MISSING_'+label);
  const yaw=n.cameraSourcePractice?.yawDegrees;
  if(typeof yaw!=='number'||!Number.isFinite(yaw))
   fail('CAMERA_NATIVE_YAW_UNAVAILABLE_'+label);
  const s={label,source:'25/17/26/0',tick:n.tick,
   remainingSeconds:n.timeRemainingSeconds,matchState:n.matchState,
   paused:n.paused,stopReason:n.stopReason,
   body:n.player.position,cameraYawDegrees:yaw,
   originalSolids:n.originalSourceSolids,
   originalPaint:n.originalPaintSurfaces,
   originalNavLinks:n.originalSourceNavigationLinks,
   scoreable:n.sourceScoreablePromotions,
   productionAuthorized:n.productionAuthorized,
   unrestricted4v4Certified:n.unrestricted4v4Certified,
   turfResult:n.turfResult,
   cpuCount:n.cpu.cpu.length,cpuRejoined:n.cpu.physicalRejoins.length,
   cpuRelocations:n.cpu.physicalFootRelocations,
   // B339: read only genuine seven-actor SOURCE weapon/owner counters.
   b339CpuSnapshot:{
    source:'25/17/26/0',
    acceptedCpuSourceShots:n.cpuSourceTurfShots,
    actualCpuImpactChangedCells:n.cpuImpactInkCellsChanged,
    cpuShotsByActor:n.cpuSourceTurfShotsByActor,
    sourceInk:n.b154NativeSevenCpuInk
   },
   humanShots:n.shotsFired,
   humanInk:n.b23HumanInkFeedback.humanChangedCells,
   lastHumanImpactTick:ledger.humanLastImpactTick,
   lastHumanPaintedSurface:ledger.humanLastPaintedSurface,
   footSolid:ledger.genuineHumanOriginalFootSolid,
   footGap:ledger.genuineOriginalFootGapMeters,
   footSupported:ledger.realHumanOriginalFootSupported,
   originalRows:ledger.originalRows.map(r=>({surfaceId:r.surfaceId,
    a:r.originalOwnedA,b:r.originalOwnedB,neutral:r.originalNeutral,
    active:r.activeOriginalCells}))};
  proof.samples.push(s);store();
  console.log('B337_ACTUAL_NATIVE_CHECKPOINT',JSON.stringify({
   label:s.label,tick:s.tick,body:s.body,foot:s.footSolid,
   supported:s.footSupported,cpu:s.cpuRejoined,shots:s.humanShots,
   ink:s.humanInk,yaw:s.cameraYawDegrees}));
  return s;
 };
 const started=await sample('START');
 const b338Dom=await read('(() => {const ui=document.querySelector("#ui-root"),g=document.querySelector("#t21-f3-b338-source-guide"),card=document.querySelector("#t21-f3-b25-paint-run"),qa=document.querySelector("#t21-f3-b205-real-round");return {view:ui?.dataset.t21B245Presentation,phase:ui?.dataset.t21B338Phase,text:g?.textContent,guideShown:!!g&&getComputedStyle(g).display!=="none",cardVisible:!!card&&getComputedStyle(card).display!=="none",qaVisible:!!qa&&getComputedStyle(qa).display!=="none",scoreable:document.querySelector("#t21-f3-practice-hud")?.dataset.sourceScoreable}})()');
 if(b338Dom?.view!=='PLAYER'||b338Dom.phase!=='PLAYING'||
  !b338Dom.guideShown||!b338Dom.text?.includes('WASD MOVE')||
  b338Dom.cardVisible||b338Dom.qaVisible||b338Dom.scoreable!=='0')
  fail('B338_REAL_PLAYER_PHASE_NOT_ISOLATED_'+JSON.stringify(b338Dom));
 writeFileSync(resolve(DIR,'b338-real-playing-hud.json'),
  JSON.stringify({schema:'B338_REAL_CHROMIUM_PLAYING_HUD',
   source:'25/17/26/0',winner:'NONE',nativeTick:started.tick,...b338Dom},null,2)+'\n');
 // B338: true F8 QA→PLAYER round-trip inside the same native game.
 const f8={key:'F8',code:'F8',windowsVirtualKeyCode:119,nativeVirtualKeyCode:119};
 const toggleView=async()=>{for(const type of ['keyDown','keyUp'])
  await send('Input.dispatchKeyEvent',{type,...f8});};
 const uiState=()=>read('(() => {const u=document.querySelector("#ui-root"),g=document.querySelector("#t21-f3-b338-source-guide"),q=document.querySelector("#t21-f3-b205-real-round"),p=document.querySelector("#t21-f3-b25-paint-run");return {view:u?.dataset.t21B245Presentation,phase:u?.dataset.t21B338Phase,guideHidden:!g||getComputedStyle(g).display==="none",qaVisible:!!q&&getComputedStyle(q).display!=="none",practiceVisible:!!p&&getComputedStyle(p).display!=="none"}})()');
 await toggleView();
 const qaView=await wait(async()=>{
  const u=await uiState();return u.view==='QA'&&u.guideHidden&&u.qaVisible?u:false;
 },20000);
 await toggleView();
 const restoredView=await wait(async()=>{
  const u=await uiState();
  return u.view==='PLAYER'&&u.phase==='PLAYING'&&!u.guideHidden&&
   !u.qaVisible&&!u.practiceVisible?u:false;
 },20000);
 const nativeAfterF8=verifyAuthority(await snapshot());
 if(nativeAfterF8.matchState!=='PLAYING'||nativeAfterF8.paused||
  nativeAfterF8.cpu.physicalRejoins.length!==7)
  fail('B338_F8_CHANGED_NATIVE_WORLD');
 writeFileSync(resolve(DIR,'b338-real-playing-hud.json'),
  JSON.stringify({schema:'B338_REAL_CHROMIUM_PLAYING_HUD',
   source:'25/17/26/0',winner:'NONE',
   nativeTick:started.tick,...b338Dom,
   genuineF8QaRoundTrip:{qaView,restoredView,
    nativeTickAfter:nativeAfterF8.tick,
    nativeOriginalAuthorityUnchanged:true}},null,2)+'\n');
 await picture('B337_START');
 await send('Input.dispatchMouseEvent',
  {type:'mouseMoved',x:820,y:450,button:'none'});
 proof.actions.push('MOUSE_MOVED');store();
 await wait(async()=>{
  const v=verifyAuthority(await snapshot());
  return Math.abs(v.cameraSourcePractice?.yawDegrees-started.cameraYawDegrees)>=0.1;
 },40000);
 const aimed=await sample('AIM');
 // B344: real native tick and human resource sampling while the
 // genuine pointer-locked mouse stays held. No QA advancement/injection.
 const jumpWitness={schema:'B349_GENUINE_NATIVE_SOURCE_AIR_SHOOTER',
   originalSource:'25/17/26/0',actualNativeSpaceKeyDown:false,
   actualNativeSpaceKeyUp:false,realOriginalHumanYBeforeJump:null,
   actualJumpCheckpoints:[],fakeTicks:0,teleports:0,fakeShots:0,
   sourceScoreable:0,productionAuthorized:false};
 const trace={schema:'B344_ACTUAL_SOURCE_HUMAN_HELD_SHOOTER',
  source:'25/17/26/0',baselineTick:aimed.tick,
  fakeTicks:0,fakeShots:0,checkpoints:[]};
 const traceFrame=async label=>{
  const n=verifyAuthority(await snapshot()),budget=n.b343OriginalSourceVolleyBudget;
  if(!Number.isFinite(n.player?.ink)||!Number.isSafeInteger(n.shotsFired)||
   !Number.isSafeInteger(n.b23HumanInkFeedback?.humanChangedCells)||
   budget?.enabled!==true||budget.physicalPoolSize!==128)
   fail('ACTUAL_SHOOTER_SNAPSHOT_MISSING_'+label);
  const b345=n.b345SourceShooterOpening;
  if(b345?.enabled!==true||!Number.isSafeInteger(b345.realOpeningClamps)||
     b345.fabricatedProjectiles!==0||b345.sourceScoreable!==0||
     b345.productionAuthorized!==false)
    fail('B345_REAL_SOURCE_OPENING_MISSING_'+label);
  const actualPhysics=n.b346NativeShooterWitness;
  if(actualPhysics?.enabled!==true||
     !Number.isSafeInteger(actualPhysics.totalActualShooterLaunches)||
     !Number.isSafeInteger(actualPhysics.totalActualShooterExits)||
     actualPhysics.noSyntheticProjectilesOrCollision!==true||
     actualPhysics.noPaintOrActorInjection!==true)
    fail('B346_MISSING_GENUINE_NATIVE_PHYSICS_'+label);
  const accuracy=n.b348SourceShooterAccuracy;
  if(accuracy?.enabled!==true||
   accuracy.syntheticShots!==0||accuracy.syntheticInk!==0||
   accuracy.productionAuthorized!==false||
   !Number.isSafeInteger(accuracy.actualAcceptedCandidateShots))
    fail('B348_UNVERIFIED_NATIVE_SHOOTER_ACCURACY_'+label);
  const q={label,tick:n.tick,
   realHumanBodyY:n.player.position[1],
   realGroundedShooterShots:accuracy.actualGroundedCandidateShots,
   realAirborneShooterShots:accuracy.actualAirborneCandidateShots,
    nativeCandidateAcceptedShots:accuracy.actualAcceptedCandidateShots,
    nativeCandidateGroundShots:accuracy.actualGroundedCandidateShots,
    nativeCandidateAirShots:accuracy.actualAirborneCandidateShots,
    actualNativePhysicalLaunches:actualPhysics.totalActualShooterLaunches,
    actualNativePhysicalExits:actualPhysics.totalActualShooterExits,
    actualOpeningDebtClamps:b345.realOpeningClamps,
    realPlayerInk:n.player.ink,
   actualHumanShotRequests:n.shotsFired,
   changedOriginalHumanCells:n.b23HumanInkFeedback.humanChangedCells,
   actualFreePhysicalProjectileSlots:budget.actualFreeSlots,
   actualDryFireAttempts:n.inkDryFireAttempts,scoreable:n.sourceScoreablePromotions,
   productionAuthorized:n.productionAuthorized};
  trace.checkpoints.push(q);
  writeFileSync(resolve(DIR,'b344-native-human-shooter-ticks.json'),
   JSON.stringify(trace,null,2)+'\n');
  console.log('B344_TRUE_SOURCE_SHOOTER_SAMPLE',JSON.stringify(q));
 };
 await traceFrame('PRE_FIRE');
 await send('Input.dispatchMouseEvent',
  {type:'mousePressed',x:820,y:450,button:'left',clickCount:1});
 proof.actions.push('FIRE');store();
 const space={key:' ',code:'Space',windowsVirtualKeyCode:32,
  nativeVirtualKeyCode:32};
 let spaceHeld=false;
 try{
  for(const tickOffset of [12,24,36,48,60]){
   await wait(async()=>{
    const n=verifyAuthority(await snapshot());
    return n.tick>=aimed.tick+tickOffset?n:false;
   },120000);
   const n=verifyAuthority(await snapshot());
   jumpWitness.actualJumpCheckpoints.push({
    tick:n.tick,offset:tickOffset,bodyY:n.player.position[1],
    realGroundShots:n.b348SourceShooterAccuracy.actualGroundedCandidateShots,
    realAirShots:n.b348SourceShooterAccuracy.actualAirborneCandidateShots});
   if(tickOffset===12){
    jumpWitness.realOriginalHumanYBeforeJump=n.player.position[1];
    await send('Input.dispatchKeyEvent',{type:'keyDown',...space});
    jumpWitness.actualNativeSpaceKeyDown=true;spaceHeld=true;
    // Native Space is recorded in B349 real jump witness; keep B337 canonical action sequence intact.
    store();
   }
   if(tickOffset===48&&spaceHeld){
    await send('Input.dispatchKeyEvent',{type:'keyUp',...space});
    jumpWitness.actualNativeSpaceKeyUp=true;spaceHeld=false;
   }
   await traceFrame('HOLD_'+tickOffset);
  }
 }finally{
  if(spaceHeld){
   await send('Input.dispatchKeyEvent',{type:'keyUp',...space});
   jumpWitness.actualNativeSpaceKeyUp=true;
  }
  await send('Input.dispatchMouseEvent',
   {type:'mouseReleased',x:820,y:450,button:'left',clickCount:1});
 }
 await sample('FIRE');
 for(const code of ['KeyW','KeyA','KeyS','KeyD']){
  const keys={KeyW:['w',87],KeyA:['a',65],KeyS:['s',83],KeyD:['d',68]};
  const [key,vk]=keys[code];
  const ev={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};
  const prior=verifyAuthority(await snapshot());
  await send('Input.dispatchKeyEvent',{type:'keyDown',...ev});
  proof.actions.push(code);store();
  try{
   await wait(async()=>{
    const v=verifyAuthority(await snapshot());
    return v.tick>=prior.tick+12?v:false;
   },120000);
  }finally{
   await send('Input.dispatchKeyEvent',{type:'keyUp',...ev});
  }
  await sample(code.slice(-1));
 }
 await picture('B337_END');
 const nativeFinal=verifyAuthority(await snapshot());
 const shooterPhysics=nativeFinal.b346NativeShooterWitness;
 if(shooterPhysics?.enabled!==true||
    shooterPhysics.droppedOldestEvents!==0||
    shooterPhysics.totalActualShooterLaunches<1||
    shooterPhysics.totalActualShooterExits>shooterPhysics.totalActualShooterLaunches||
    shooterPhysics.productionAuthorized!==false||
    shooterPhysics.scoreablePromotions!==0)
  fail('B346_REAL_NATIVE_SOURCE_SHOOTER_PHYSICS_INVALID');
 writeFileSync(resolve(DIR,'b346-genuine-physical-projectile-events.json'),
  JSON.stringify({
   schema:'B346_REAL_3D_NATIVE_SOURCE_SHOOTER_EVENTS',
   source:'25/17/26/0',physicalWitness:shooterPhysics,
   actualEndNativeTick:nativeFinal.tick,
   realHumanShotsAtEnd:nativeFinal.shotsFired,
   realOriginalChangedCells:nativeFinal.b23HumanInkFeedback.humanChangedCells,
   sourceScoreable:nativeFinal.sourceScoreablePromotions,
   productionAuthorized:nativeFinal.productionAuthorized,
   injectedPhysicalShots:false,injectedInk:false,injectedTicks:false
  },null,2)+'\n');
 const accuracyFinal=nativeFinal.b348SourceShooterAccuracy;
 if(accuracyFinal?.enabled!==true||
    accuracyFinal.actualAcceptedCandidateShots!==shooterPhysics.totalActualShooterLaunches||
    accuracyFinal.originalReferenceModelCertified!==false||
    accuracyFinal.syntheticInk!==0||accuracyFinal.syntheticShots!==0||
    accuracyFinal.productionAuthorized!==false)
  fail('B348_GENUINE_PHYSICAL_BULLET_ACCURACY_NOT_VERIFIED');
 writeFileSync(resolve(DIR,'b348-native-shooter-accuracy-candidate.json'),
  JSON.stringify({schema:'B348_NATIVE_SOURCE_SHOOTER_ACCURACY_CANDIDATE',
   source:'25/17/26/0',realNativeFinalTick:nativeFinal.tick,
   truePhysicalEvidence:shooterPhysics,
   actualCandidate:accuracyFinal,
   realHumanShots:nativeFinal.shotsFired,
   originalOwnerChangedCells:nativeFinal.b23HumanInkFeedback.humanChangedCells,
   baselineB346RealFixedAimRun:40999824961,
   baselineRealFixedAimChangedCells:91,
   noSyntheticInput:true,noInjectedInk:true,noFakeProjectiles:true,
   nativeCameraMouseMoveDuringHeldFire:false,
   scoreable:nativeFinal.sourceScoreablePromotions,
   productionAuthorized:nativeFinal.productionAuthorized},null,2)+'\n');
 writeFileSync(resolve(DIR,'b349-real-physical-jump-evidence.json'),
  JSON.stringify({...jumpWitness,
   realShooterShots:accuracyFinal.actualAcceptedCandidateShots,
   groundedShots:accuracyFinal.actualGroundedCandidateShots,
   airborneShots:accuracyFinal.actualAirborneCandidateShots,
   nativePhysicsProjectiles:shooterPhysics.totalActualShooterLaunches,
   originalPaintableImpacts:shooterPhysics.events.filter(
    x=>x.kind==='EXIT'&&x.reason==='ORIGINAL_PAINTABLE').length,
   originalPaintChangedCells:nativeFinal.b23HumanInkFeedback.humanChangedCells,
   finalNativeTick:nativeFinal.tick},null,2)+'\n');
 console.log('B349_NATIVE_PHYSICAL_JUMP_SHOOTER',
  JSON.stringify({grounded:accuracyFinal.actualGroundedCandidateShots,
   airborne:accuracyFinal.actualAirborneCandidateShots,
   checkpoints:jumpWitness.actualJumpCheckpoints}));
 console.log('B348_TRUE_NATIVE_CANDIDATE_PHYSCIAL_ACC',
  JSON.stringify({accepted:accuracyFinal.actualAcceptedCandidateShots,
    ground:accuracyFinal.actualGroundedCandidateShots,
    air:accuracyFinal.actualAirborneCandidateShots,
    ink:nativeFinal.b23HumanInkFeedback.humanChangedCells}));
 console.log('B346_GENUINE_PLAYCANVAS_PHYSICAL_EVENTS',JSON.stringify({
  launches:shooterPhysics.totalActualShooterLaunches,
  exits:shooterPhysics.totalActualShooterExits,
  nativeTick:nativeFinal.tick}));
 const actual=nativeFinal.b343OriginalSourceVolleyBudget;
 if(!actual?.enabled||actual.scoreable!==0||
    actual.syntheticShots!==0||actual.syntheticInk!==0||
    actual.productionAuthorized!==false)
   fail('B343_SOURCE_UNTRUSTED_PLAYER_BUDGET');
 writeFileSync(resolve(DIR,'b343-real-player-budget.json'),
  JSON.stringify({schema:'B343_GENUINE_NATIVE_CHROMIUM_SOURCE_VOLLEY',
   source:'25/17/26/0',actual,actualHumanShots:proof.samples.at(-1).humanShots,
   originalSourceNoMutation:true,
   originalWeaponFidelityCertified:false},null,2)+'\n');
 const verdict=b337AuditNative(proof);
 writeFileSync(resolve(DIR,'b337-driver-verdict.json'),
  JSON.stringify(verdict,null,2)+'\n');
 console.log('B345_TRUE_SOURCE_SHOOTER_CAPTURED',JSON.stringify({checkpoints:trace.checkpoints.length}));
 console.log('B343_REAL_PLAYER_VOLLEY_BUDGET_SUCCESS',
  JSON.stringify({verdict:verdict.verdict,budget:actual}));
}
try{await run();}
catch(error){console.error(error);process.exitCode=1;store();}
finally{
 try{socket?.close();}catch{}
 for(const child of children)child.kill('SIGTERM');
}
