#!/usr/bin/env node
/** B335: REAL pointer-locked browser, actual 180s clock, 1 human + 7 CPUs.
 * No QA clock advancement, actor relocation, artificial ink or fabricated winner. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
import {b405AuditReal180SourceSession} from './t21-b405-single-180s-human-7cpu-audit.mjs';
import {b407RunNativeHumanWave} from './t21-b407-native-human-wave.mjs';
import {b407AuditRealHumanWaves} from './t21-b407-time-distributed-human-audit.mjs';
import {b408AuditLiveOriginalAim} from './t21-b408-native-original-aim-audit.mjs';
import {b313ChooseOriginalActiveAim,b313ObservedRealAimMatch}
 from './t21-b313-actual-original-cell-aim.mjs';
const ROOT='http://127.0.0.1:4198/browser-ink-tps/';
const DIR=process.env.T21_B405_OUTPUT||'/tmp/t21-b405';
const children=[],calls=new Map();
let socket=null,seq=0,clockStart=0;
const fail=reason=>{throw Error('B337_TRUE_CHROMIUM_'+reason);};
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
  '--port','4198','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9267','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b337-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9267/json')).json())
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
  '?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround&t21W10B149=contactTrace'});
 const ready=()=>wait(async()=>{
  try{return await read('document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"'+
   '&&document.querySelector("#app-canvas")?.dataset.t21F3Renderer==="webgl2"');}
  catch{return false;}
 },110000);
 await ready();
 await clickButton('#t21-f3-b193-ally-coop');
 await wait(async()=>{try{return await read(
  'document.querySelector("#app-canvas")?.dataset.t21B193Coop==="REAL_A1_ORIGINAL_SOURCE"'+
  '&&document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"');}
  catch{return false;}},110000);
 await clickButton('#t21-f3-b203-full-round');
 // Require the freshly selected full-round SOURCE world; a stale READY
 // flag from the previous coop page must NOT satisfy this gate.
 const realFullRound=await wait(async()=>{
  try{return await read('(() => ({ready:document.querySelector("#app-canvas")?.dataset.t21F3Ready,'+
   'mode:document.querySelector("#app-canvas")?.dataset.t21B203FullRound,'+
   'search:location.search}))()').then(x=>
    x?.ready==='READY'&&x?.mode==='REAL_180S_SOURCE_PLAY'?x:false);}
  catch{return false;}
 },100000);
 if(realFullRound.ready!=='READY'||
  realFullRound.mode!=='REAL_180S_SOURCE_PLAY'||
  realFullRound.search!=='?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound')
  fail('B335_FULL_ROUND_NEW_WORLD_IDENTITY_UNVERIFIED');
 const boot=verifyAuthority(await snapshot());
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
  'u.searchParams.set("t21B337","localOriginalAim");'+
  'history.replaceState(null,"",u.href);return true;})()');

 clockStart=Date.now();
 const sample=async label=>{
  const n=verifyAuthority(await snapshot());
  const ledger=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  if(!ledger||ledger.source!=='25/17/26/0'||ledger.originalRows?.length!==17)
   fail('B312_REAL_ORIGINAL_LEDGER_MISSING_'+label);
  const yaw=n.cameraSourcePractice?.yawDegrees;
  const pitch=n.cameraSourcePractice?.pitchDegrees;
  if(!Number.isFinite(yaw)||!Number.isFinite(pitch))
   fail('CAMERA_NATIVE_AIM_UNAVAILABLE_'+label);
  const s={label,source:'25/17/26/0',tick:n.tick,
   remainingSeconds:n.timeRemainingSeconds,matchState:n.matchState,
   paused:n.paused,stopReason:n.stopReason,
   body:n.player.position,cameraYawDegrees:yaw,cameraPitchDegrees:pitch,
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
 if(!await read('document.pointerLockElement===document.querySelector("#app-canvas")'))
  fail('ACTUAL_SOURCE_POINTER_LOCK_LOST_AFTER_F8');
 // A horizontal yaw-only mouse move did NOT prove that the original floor
 // was ever under the crosshair (historic B337 Chrome timeout).
 // Retain the real yaw probe but select a REAL B271 original active source
 // cell and observe the genuine mouse pitch before clicking.
 await send('Input.dispatchMouseEvent',
  {type:'mouseMoved',x:820,y:450,button:'none'});
 proof.actions.push('MOUSE_MOVED');store();
 await wait(async()=>{
  const v=verifyAuthority(await snapshot());
  return Math.abs(v.cameraSourcePractice?.yawDegrees-started.cameraYawDegrees)>=0.1;
 },40000);
 await send('Input.dispatchMouseEvent',
  {type:'mouseMoved',x:800,y:450,button:'none'});
 const preAim=verifyAuthority(await snapshot());
 const original=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
 const footId=original?.genuineHumanOriginalFootSolid;
 // The REAL PaintSurface.id comes from buildFlatComponent:
 // `<backingSolidId>:paint`. Navigation-only `paint:<solid>` anchor
 // is NOT an ink ownerGrid surface identity.
 const targetSurface=footId+':paint';
 const row=original?.originalRows?.find(r=>r.surfaceId===targetSurface);
 if(!original||original.source!=='25/17/26/0'||
    original.originalRows?.length!==17||
    original.realHumanOriginalFootSupported!==true||
    original.sourceActorRelocations!==0||
    original.sourceInkRewritten!==false||
    original.playerPositionRewritten!==false||
    footId!==started.footSolid||
    !row?.originalB337NearbyActiveCells?.length)
  fail('NO_GENUINE_ORIGINAL_GROUNDED_ACTIVE_FLOOR_AIM');
 if(preAim.cameraSourcePractice.sourceAimSensitivityMultiplier!==1)
  fail('REAL_CAMERA_SENSITIVITY_NONBASELINE');
 const selected=b313ChooseOriginalActiveAim({
  cells:row.originalB337NearbyActiveCells,
  body:original.actualBodyMeters,camera:original.actualCameraMeters,
  yaw:preAim.cameraSourcePractice.yawDegrees,
  pitch:preAim.cameraSourcePractice.pitchDegrees
 }).selected;
 if(!selected)fail('NO_SAFE_REAL_ORIGINAL_ACTIVE_SOURCE_AIM');
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',
  x:selected.actualCDP[0],y:selected.actualCDP[1],button:'none'});
 await wait(async()=>{
  const a=(await snapshot()).cameraSourcePractice;
  return b313ObservedRealAimMatch(selected,a)?a:false;
 },40000);
 const aimed=await sample('AIM');
 if(!b313ObservedRealAimMatch(selected,{
  yawDegrees:aimed.cameraYawDegrees,
  pitchDegrees:aimed.cameraPitchDegrees
 }))fail('GENUINE_MOUSE_AIM_DRIFTED_FROM_ORIGINAL_CELL');
 proof.originalAimWitness={
  sourceFootId:footId,targetOriginalSurface:targetSurface,
  originalActiveCells:row.originalB337NearbyActiveCells,
  localCellSampleProvenance:'B337_NATIVE_LOCAL_ACTIVE_GRID',
  selectedCell:{grid:selected.grid,world:selected.world},
  actualCameraMeters:original.actualCameraMeters,
  actualBodyMeters:original.actualBodyMeters,
  targetYawDegrees:selected.targetYaw,
  targetPitchDegrees:selected.targetPitch,
  actualCDP:selected.actualCDP,
  observedYawDegrees:aimed.cameraYawDegrees,
  observedPitchDegrees:aimed.cameraPitchDegrees,
  beforeTick:preAim.tick,afterTick:aimed.tick,
  originalRapierFootSupported:true,
  artificialAimOrGameplayWrites:false
 };
 store();
 await send('Input.dispatchMouseEvent',
  {type:'mousePressed',x:selected.actualCDP[0],
   y:selected.actualCDP[1],button:'left',clickCount:1});
 proof.actions.push('FIRE');store();
 try{
  // Separate REAL shot acceptance from original paint impact. A camera
  // alignment or projectile counter alone is not a painted-cell PASS.
  await wait(async()=>{
   const v=verifyAuthority(await snapshot());
   return v.tick>aimed.tick&&v.shotsFired>aimed.humanShots?v:false;
  },45000);
  await wait(async()=>{
   const v=verifyAuthority(await snapshot());
   const ledger=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
   return v.tick>=aimed.tick+20&&
    v.b23HumanInkFeedback.humanChangedCells>started.humanInk&&
    ledger?.humanLastImpactTick>aimed.tick&&
    ledger?.humanLastPaintedSurface===targetSurface?v:false;
  },70000);
 }catch(error){
  // Keep an inspectable real world witness on HOLD, even if the gun fires
  // but no actual original-source paint cell changes.
  const live=verifyAuthority(await snapshot());
  const shotLedger=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  proof.fireHold={
   reason:String(error),nativeTick:live.tick,
   realHumanShots:live.shotsFired,
   realHumanChangedCells:live.b23HumanInkFeedback.humanChangedCells,
   actualHumanLastSource:shotLedger?.humanLastPaintedSurface??null,
   actualHumanLastImpactTick:shotLedger?.humanLastImpactTick??null,
   expectedOriginalSurface:targetSurface,
   pointerLocked:await read('document.pointerLockElement===document.querySelector("#app-canvas")'),
   stage:'25/17/26/0',fakeGameplayWrites:0
  };
  store();
  throw error;
 }finally{
  await send('Input.dispatchMouseEvent',
   {type:'mouseReleased',x:selected.actualCDP[0],
    y:selected.actualCDP[1],button:'left',clickCount:1});
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
 const verdict=b337AuditNative(proof);
 writeFileSync(resolve(DIR,'b337-driver-verdict.json'),
  JSON.stringify(verdict,null,2)+'\n');
 console.log('B337_REAL_NATIVE_SHORT_INPUT_SUCCESS',JSON.stringify(verdict));

 // B405: source-only integrated real SAME 180s world.
 // This starts only AFTER B337's real human mouse aim, actual physical
 // shot/paint hit, and genuine W/A/S/D source foot are certified.
 // Continue this exact pointer-locked CDP session to native TIME_UP,
 // without a new match/actor spawn, QA clocks, scripted enemy HP or ink.
 const b405={
  schema:'B405_SINGLE_GENUINE_180S_HUMAN_7CPU_SOURCE',
  source:'25/17/26/0',
  b337ActualNativeInputVerdict:verdict,
  originalStageUntouched:true,
  injectedTime:false,injectedInk:false,injectedActors:false,
  officialWinner:'NONE',samples:[]
 };
 const saveB405=()=>{
  writeFileSync(resolve(DIR,'b405-same-original-180s-round.json'),
   JSON.stringify(b405,null,2)+'\n');
 };
 const recordB405=async(label,frame)=>{
  const n=verifyAuthority(frame);
  const roster=n.cpu.cpu.map(c=>({
   id:c.id,lifeState:c.lifeState,
   hp:c.hp,rejoined:c.rejoined,
   foot:c.physicalFoot
  }));
  const originalLedger=n.matchState==='PLAYING'?
   await read('window.__t21F3.auditB312NativeHumanOwnerLedger()'):null;
  const row={
   label,tick:n.tick,remainingSeconds:n.timeRemainingSeconds,
   matchState:n.matchState,paused:n.paused,stopReason:n.stopReason,
   originalSourceSolids:n.originalSourceSolids,
   originalPaintSurfaces:n.originalPaintSurfaces,
   originalSourceNavigationLinks:n.originalSourceNavigationLinks,
   sourceScoreablePromotions:n.sourceScoreablePromotions,
   turfResult:n.turfResult,
   productionAuthorized:n.productionAuthorized,
   unrestricted4v4Certified:n.unrestricted4v4Certified,
   player:n.player.position,
   humanShots:n.shotsFired,
   humanChangedCells:n.b23HumanInkFeedback.humanChangedCells,
   cpuActualChangedCells:n.cpuInkCellsChanged,
   realCpuSourceShots:n.cpuSourceTurfShots,
   humanCpuDirectHits:n.humanCpuDirectHits,
   humanCpuDirectSplats:n.humanCpuDirectSplats,
   cpuSplats:n.cpuSplats,cpuRespawns:n.cpuRespawns,
   cpuActors:roster,
   cpuPhysicalRejoinedCount:n.cpu.physicalRejoins.length,
   cpuPhysicalRelocations:n.cpu.physicalFootRelocations,
   originalHumanFoot:originalLedger?{
    id:originalLedger.genuineHumanOriginalFootSolid,
    supported:originalLedger.realHumanOriginalFootSupported,
    gap:originalLedger.genuineOriginalFootGapMeters
   }:null,
   actualPointerLocked:await read(
    'document.pointerLockElement===document.querySelector("#app-canvas")')
  };
  b405.samples.push(row);saveB405();
  console.log('B405_ACTUAL_CONTINUOUS_SOURCE_TIMELINE',JSON.stringify({
   label:row.label,tick:row.tick,remainingSeconds:row.remainingSeconds,
   match:row.matchState,shots:row.humanShots,
   realHumanCells:row.humanChangedCells,
   cpuInk:row.cpuActualChangedCells,cpuRejoined:row.cpuPhysicalRejoinedCount,
   nativeHumanEnemyHits:row.humanCpuDirectHits
  }));
 };
 const b407Enabled=process.env.T21_B407_ACTIVE_WAVES==='1';
 const b408Enabled=process.env.T21_B408_ACTIVE_AIM==='1';
 if(b408Enabled&&!b407Enabled)fail('B408_NEEDS_GENUINE_B407_WAVES');
 const b407={
  schema:'B407_SAME_REAL_180S_TIME_DISTRIBUTED_HUMAN_INPUT',
  source:'25/17/26/0',enabled:b407Enabled,sameB405NativeGame:true,
  injectedTime:false,injectedInk:false,injectedActorPositions:false,
  officialWinner:'NONE',waves:[]
 };
 const saveB407=()=>writeFileSync(resolve(DIR,'b407-real-time-distributed-human.json'),
  JSON.stringify(b407,null,2)+'\n');
 if(b407Enabled)saveB407();
 const afterInput=verifyAuthority(await snapshot());
 if(afterInput.matchState!=='PLAYING'||afterInput.paused||
    afterInput.timeRemainingSeconds<=150||
    afterInput.timeRemainingSeconds>=180||
    afterInput.cpu.physicalRejoins.length!==7)
  fail('B405_NATIVE_START_POST_INPUT_NOT_180S_AND_7_CPU');
 await recordB405('AFTER_INPUT',afterInput);
 for(const remaining of [150,120,90,60,30,0]){
  const next=await wait(async()=>{
   const x=verifyAuthority(await snapshot());
   return x.timeRemainingSeconds<=remaining+.001?x:false;
  },9*60*1000);
  await recordB405(String(remaining),next);
  if(b407Enabled&&remaining>0){
   try {
    const wave=await b407RunNativeHumanWave({
     remaining,expectedFoot:footId,aimCDP:selected.actualCDP,
     send,read,snapshot,verifyAuthority,wait,
     b408ActiveAim:b408Enabled
    });
    b407.waves.push(wave);saveB407();
    console.log('B407_REAL_IN_MATCH_HUMAN_INPUT',JSON.stringify({
     remaining,fromTick:wave.before.tick,toTick:wave.after.tick,
     nativeKccMeters:wave.totalRealKccPlanarMeters,
     genuineAdditionalShots:wave.after.humanShots-wave.before.humanShots,
     actualExtraPaintCells:wave.after.humanChangedCells-wave.before.humanChangedCells
    }));
   }catch(error){
    b407.hold={remaining,reason:String(error),
     nativeObservedWaves:b407.waves.length};saveB407();
    throw error;
   }
  }
  if(remaining===90)await picture('B405_MID');
 }
 const actualTimeUp=verifyAuthority(await snapshot());
 if(actualTimeUp.matchState!=='TIME_UP'||
    actualTimeUp.timeRemainingSeconds!==0)
  fail('B405_NATIVE_TIME_UP_MISSING');
 await picture('B405_TIME_UP');
 const b405Result=b405AuditReal180SourceSession(b405);
 writeFileSync(resolve(DIR,'b405-driver-verdict.json'),
  JSON.stringify(b405Result,null,2)+'\n');
 console.log('B405_ONE_REAL_180S_7CPU_HUMAN_PAINT_SHOOT',
  JSON.stringify(b405Result));
 if(b407Enabled){
  const v=b407AuditRealHumanWaves(b407,b405);
  writeFileSync(resolve(DIR,'b407-driver-verdict.json'),JSON.stringify(v,null,2)+'\n');
  console.log('B407_ONE_REAL_NATIVE_SOURCE_HUMAN_ACTIVE_MATCH',
   JSON.stringify(v));
  if(b408Enabled){
   const newVerdict=b408AuditLiveOriginalAim(b407,b405);
   writeFileSync(resolve(DIR,'b408-driver-verdict.json'),
    JSON.stringify(newVerdict,null,2)+'\n');
   console.log('B408_GENUINE_NATIVE_ACTIVE_ORIGINAL_AIM',
    JSON.stringify(newVerdict));
  }
 }
}
try{await run();}
catch(error){console.error(error);process.exitCode=1;store();}
finally{
 try{socket?.close();}catch{}
 for(const child of children)child.kill('SIGTERM');
}
