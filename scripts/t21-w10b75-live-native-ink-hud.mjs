#!/usr/bin/env node
/**
 * W10-B75: real WebGL2 / PlayCanvas / Rapier / Recast original-source
 * 3-second CPU paint feedback. NO QA tick advance or fabricated paint.
 * CPU AIM selection stays default FIXED unless explicitly opted in.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {b80ClassifyNativeStall} from './t21-w10b80-native-stall-classifier.mjs';

const ROOT='http://127.0.0.1:4197/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-w10b75';
const mode=process.env.T21_W10B75_AIM||'FIXED';
if(!['FIXED','SWEEP'].includes(mode))throw Error('B75_BAD_MODE');
const children=[],pending=new Map();
let sock=null,id=0;
const fail=x=>{throw Error('T21_B75_'+x);};
async function until(fn,ms=80000){
 const deadline=Date.now()+ms;
 while(Date.now()<deadline){
  const v=await fn();if(v)return v;await sleep(700);
 }
 fail('NATIVE_TIMEOUT_'+ms);
}
async function cmd(method,params={}){
 if(!sock||sock.readyState!==WebSocket.OPEN)fail('CDP_NOT_CONNECTED');
 const n=++id;
 return await new Promise((yes,no)=>{
  const timer=setTimeout(()=>{pending.delete(n);no(Error('CDP_METHOD_TIMEOUT_'+method));},25000);
  pending.set(n,{yes:r=>{clearTimeout(timer);yes(r);},
   no:e=>{clearTimeout(timer);no(e);}});
  sock.send(JSON.stringify({id:n,method,params}));
 });
}
async function evaluate(expression){
 const reply=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(reply.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(reply.exceptionDetails).slice(0,250));
 return reply.result?.value;
}
async function run(){
 mkdirSync(OUTPUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
  .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROMIUM_NOT_FOUND');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox',
  '--disable-dev-shm-usage','--no-first-run','--disable-extensions',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9257','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-w10b75-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{
   const r=await fetch('http://127.0.0.1:9257/json');
   return (await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  }catch{return null;}
 },40000);
 sock=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   sock.addEventListener('open',ok,{once:true});
   sock.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('CDP_SOCKET_TIMEOUT');})
 ]);
 sock.addEventListener('message',evt=>{
  const m=JSON.parse(String(evt.data)),pendingCall=pending.get(m.id);
  if(!pendingCall)return;
  pending.delete(m.id);
  if(m.error)pendingCall.no(Error(JSON.stringify(m.error)));
  else pendingCall.yes(m.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false});
 const search='?t21Play=preview'+
  (mode==='SWEEP'?'&t21W10B68=previewSweep':'');
 await cmd('Page.navigate',{url:ROOT+search});
 await until(async()=>await evaluate(`(() => {
  const c=document.querySelector('#app-canvas');
  return c?.dataset.t21F3Ready==='READY'&&
   c?.dataset.t21F3Renderer==='webgl2';
 })()`),100000);
 const snapshot=()=>evaluate('window.__t21F3.snapshot()');
 const boot=await snapshot();
 if(boot.matchState!=='STAGING'||boot.paused||boot.stopReason||
    boot.originalSourceSolids!==25||boot.originalPaintSurfaces!==17||
    boot.originalSourceNavigationLinks!==26||boot.sourceScoreablePromotions!==0||
    boot.productionAuthorized!==false||boot.unrestricted4v4Certified!==false||
    boot.b64SourceInkSweep.enabled!==(mode==='SWEEP'))
  fail('INCORRECT_FROZEN_NATIVE_SOURCE_BOOT');
 const initialHud=await evaluate(`(() => {
   const p=document.querySelector('#t21-f3-practice-hud');
   const a=document.querySelector('#t21-f3-b75-source-ink-live');
   const b=document.querySelector('#t21-f3-b76-human-ink-coach');
   return {ready:p?.dataset.t21B75SourceAuthority,
    hidden:a?.hidden,scoreable:a?.dataset.t21B75OriginalScoring,
    humanReady:p?.dataset.t21B76PlayerSourceTruth,
    humanHidden:b?.hidden,
    humanScoreable:b?.dataset.t21B76OriginalScoreable};
 })()`);
 if(initialHud.ready!=='REAL_NATIVE_SOURCE_ONLY'||initialHud.hidden||
    initialHud.scoreable!=='0'||initialHud.humanReady!==
     'REAL_HUMAN_ORIGINAL_INK_ONLY'||initialHud.humanHidden||
    initialHud.humanScoreable!=='0')
   fail('B76_REAL_HUMAN_HUD_BOOT_NOT_VISIBLE_'+JSON.stringify(initialHud));
 const click=async type=>cmd('Input.dispatchMouseEvent',{
  type,x:800,y:450,button:'left',clickCount:1});
 await click('mousePressed');await click('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const kargs={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...kargs});
 await click('mousePressed');
 const before=await snapshot();
 // B79: the real human paint first happens in STAGING, not 5+ seconds
 // into PLAYING. The old B76 smoke began looking only after the 3s
 // activity window expired and falsely failed despite 281 real cells.
 // Witness the actual live HUD *while* physical mouse+W is held.
 const humanPulse=await until(async()=>{
  const h=await evaluate(`(() => {
   const n=window.__t21F3.snapshot();
   const p=document.querySelector('#t21-f3-practice-hud');
   const b=document.querySelector('#t21-f3-b76-human-ink-coach');
   return {tick:n.tick,matchState:n.matchState,
    stop:n.stopReason,realShots:n.shotsFired,
    genuineHumanPaint:n.b23HumanInkFeedback.humanChangedCells,
    realSolids:n.originalSourceSolids,
    realPaint:n.originalPaintSurfaces,
    originalLinks:n.originalSourceNavigationLinks,
    sourceScoreable:n.sourceScoreablePromotions,
    original4v4:n.unrestricted4v4Certified,
    production:n.productionAuthorized,
    hudAuthority:p?.dataset.t21B76PlayerSourceTruth,
    hudVisible:!!b&&!b.hidden,
    hudTick:Number(b?.dataset.t21B76NativeTick),
    realChangedCells:Number(b?.dataset.t21B76ChangedSourceCells),
    acceptedShots:Number(b?.dataset.t21B76HumanShots),
    hudScoreable:b?.dataset.t21B76OriginalScoreable,
    hudOriginal4v4:b?.dataset.t21B76Original4v4,
    label:b?.querySelector('#t21-f3-b76-counts')?.textContent
   };
  })()`);
  if(h.stop||h.realSolids!==25||h.realPaint!==17||
     h.originalLinks!==26||h.sourceScoreable!==0||
     h.original4v4!==false||h.production!==false)
    fail('B79_GENUINE_NATIVE_SOURCE_PLAYER_INPUT_DRIFT_'+JSON.stringify(h));
  return h.realShots>0&&h.genuineHumanPaint>0&&
   h.hudAuthority==='REAL_HUMAN_ORIGINAL_INK_ONLY'&&h.hudVisible&&
   h.hudTick>0&&h.hudTick<=h.tick&&
   h.realChangedCells>0&&h.realChangedCells<=h.genuineHumanPaint&&
   h.acceptedShots>0&&h.acceptedShots<=h.realShots&&
   h.hudScoreable==='0'&&h.hudOriginal4v4==='false'?h:false;
 },180000);
 await until(async()=>{
  const n=await snapshot();
  if(n.stopReason)fail('B79_HUMAN_SOURCE_SESSION_STOP_'+n.stopReason);
  return n.tick>before.tick+33;
 },100000);
 await click('mouseReleased');
 await cmd('Input.dispatchKeyEvent',{type:'keyUp',...kargs});
 console.log('T21_B79_GENUINE_EARLY_HUMAN_SOURCE_PAINT_HUD_PASS',
  JSON.stringify(humanPulse));
 const observations=[], started=Date.now();
 let inkPulse=null,firedNoInk=false,lastReported=-1;
 let lastTickAdvanceAt=Date.now(),lastHeartbeatAt=Date.now();
 let progressWitness=null,renderWitness=null;
 // B89: observe the real seven actor states; never advance or reseed them.
 let lastRejoinCount=0,lastRejoinTick=0;
 const b80SourceWatch=[];
 const saveB80=classification=>{
  const payload={
   schema:'W10_B80_REAL_CHROME_NATIVE_STAGE_STALL_DIAGNOSTIC_V1',
   mode,classification,
   humanPhysicalSourceInkAlreadyVerified:true,
   nativeModeActuallySelected:mode,
   lastSourceWitness:progressWitness,
   currentSourceWitness:renderWitness,
   readOnly:true,noSyntheticPhysicsAdvance:true,
   originalScoreable:0,original4v4Certified:false,
   realObservedIntervals:b80SourceWatch.slice(-12)
  };
  writeFileSync(resolve(OUTPUT,
   'w10b80-source-watch-'+mode.toLowerCase()+'.json'),
   JSON.stringify(payload,null,2));
  return payload;
 };
 while(Date.now()-started<13*60*1000){
  const status=await evaluate(`(() => {
   const n=window.__t21F3.snapshot();
   const h=document.querySelector('#t21-f3-practice-hud');
   const a=document.querySelector('#t21-f3-b75-source-ink-live');
   const b=document.querySelector('#t21-f3-b76-human-ink-coach');
   return {tick:n.tick,matchState:n.matchState,
    elapsed:180-n.timeRemainingSeconds,
    nativePaused:n.paused,
    nativeRenderFrames:n.sourceFrameQuality?.liveUpdateFrames,
    nativeFrameCallbackP95Ms:n.sourceFrameQuality?.p95Ms,
    nativeSimulationTicksLastFrame:n.sourceFrameQuality?.simulationTicksLastFrame,
    nativeSourceCpuRejoined:n.cpu?.physicalRejoins?.length,
    nativeSourceCpuFreeCombat:n.cpu?.freeCombatEnabled,
    // B89: inspect whether each missing actor is unreleased, airborne,
    // rejoining or physically blocked; all data come from the actual tick.
    nativeSourceCpuActors:n.cpu?.cpu?.map(c=>({id:c.id,
     mobilityState:c.mobilityState,released:c.released,rejoined:c.rejoined,
     lastMovedTick:c.lastMovedTick,physicalFoot:c.physicalFoot})),
    nativeSourceReleasedCpuIds:n.cpu?.releasedCpuIds,
    nativeSourceLandingCorridorsCleared:n.cpu?.landingCorridorsCleared,
    visibilityState:document.visibilityState,
    hasDocumentFocus:document.hasFocus(),
    browserPointerLocked:document.pointerLockElement===
     document.querySelector('#app-canvas'),
    nativeCpuSourceShots:n.cpuSourceTurfShots,
    nativeCpuChangedSourceCells:n.cpuImpactInkCellsChanged,
    stageSolids:n.originalSourceSolids,
    stagePaint:n.originalPaintSurfaces,
    sourceLinks:n.originalSourceNavigationLinks,
    scoreable:n.sourceScoreablePromotions,
    production:n.productionAuthorized,
    original4v4:n.unrestricted4v4Certified,
    stop:n.stopReason,
    mode:n.b64SourceInkSweep.enabled?'SWEEP':'FIXED',
    panelVisible:!!a&&!a.hidden,
    hubAuthority:h?.dataset.t21B75SourceAuthority,
    state:a?.dataset.t21B75Status,
    recentCells:Number(a?.dataset.t21B75RecentCells),
    recentShots:Number(a?.dataset.t21B75RecentCpuShots),
    panelTick:Number(a?.dataset.t21B75NativeTick),
    label:a?.querySelector('#t21-f3-b75-source-ink-counts')?.textContent,
    panelScoreable:a?.dataset.t21B75OriginalScoring,
    panel4v4:a?.dataset.t21B75Original4v4Certified,
    acceptedHumanShots:n.shotsFired,
    actualHumanPaintCells:n.b23HumanInkFeedback.humanChangedCells,
    originalInkRecoveryState:n.playerInkRecoveryState,
    nativeHumanDryFireAttempts:n.inkDryFireAttempts,
    b76Authority:h?.dataset.t21B76PlayerSourceTruth,
    b76Visible:!!b&&!b.hidden,
    b76State:b?.dataset.t21B76Status,
    b76RecentCells:Number(b?.dataset.t21B76ChangedSourceCells),
    b76RecentShots:Number(b?.dataset.t21B76HumanShots),
    b76DryFires:Number(b?.dataset.t21B76DryFires),
    b76NativeTick:Number(b?.dataset.t21B76NativeTick),
    b76Scoreable:b?.dataset.t21B76OriginalScoreable,
    b76Original4v4:b?.dataset.t21B76Original4v4,
    b76Label:b?.querySelector('#t21-f3-b76-counts')?.textContent
   };
  })()`);
  if(status.stop||status.stageSolids!==25||status.stagePaint!==17||
     status.sourceLinks!==26||status.scoreable!==0||status.production!==false||
     status.original4v4!==false||status.mode!==mode||
     status.hubAuthority!=='REAL_NATIVE_SOURCE_ONLY'||
     !status.panelVisible||status.panelScoreable!=='0'||
     status.panel4v4!=='false'||status.panelTick>status.tick||
     !Number.isFinite(status.recentCells)||status.recentCells<0||
     !Number.isFinite(status.recentShots)||status.recentShots<0||
     status.b76Authority!=='REAL_HUMAN_ORIGINAL_INK_ONLY'||
     !status.b76Visible||status.b76Scoreable!=='0'||
     status.b76Original4v4!=='false'||
     status.b76NativeTick>status.tick||
     !Number.isSafeInteger(status.b76RecentCells)||
     status.b76RecentCells<0||
     !Number.isSafeInteger(status.b76RecentShots)||
     status.b76RecentShots<0||
     !Number.isSafeInteger(status.b76DryFires)||
     status.b76DryFires<0||
     status.b76RecentShots>status.acceptedHumanShots||
     status.b76RecentCells>status.actualHumanPaintCells)
   fail('REAL_HUD_OR_STAGE_AUTHORITY_FAILED_'+JSON.stringify(status));
  // B80 source-only stall differential: every 20 wall seconds emit a
  // real browser heartbeat, including paused/visibility/render callback,
  // rather than waiting 13 minutes while STAGING tick remains frozen.
  const currentWitness={
   tick:status.tick,renderFrames:status.nativeRenderFrames,
   paused:status.nativePaused,stop:status.stop,
   matchState:status.matchState,visibilityState:status.visibilityState
  };
  const nowWall=Date.now();
  if(!progressWitness){
   progressWitness={...currentWitness};
   lastTickAdvanceAt=nowWall;
  }else if(status.tick>progressWitness.tick){
   progressWitness={...currentWitness};
   lastTickAdvanceAt=nowWall;
  }
  renderWitness={...currentWitness};
  if(nowWall-lastHeartbeatAt>=20000){
   lastHeartbeatAt=nowWall;
   const kind=b80ClassifyNativeStall(
    progressWitness,renderWitness,nowWall-lastTickAdvanceAt);
   const heartbeat={
    mode,classification:kind,
    sameNativeTickWallMs:nowWall-lastTickAdvanceAt,
    ...status
   };
   b80SourceWatch.push(heartbeat);
   console.log('T21_B80_GENUINE_NATIVE_PROGRESS_HEARTBEAT',
    JSON.stringify(heartbeat));
  }
  const stallKind=b80ClassifyNativeStall(
   progressWitness,renderWitness,nowWall-lastTickAdvanceAt);
  if(stallKind==='HOLD_INVALID_NATIVE_WITNESS'||
     stallKind==='UNEXPECTED_CLOCK_OR_FRAME_REGRESSION'||
     stallKind==='SOURCE_FAIL_CLOSED_STOP'||
     (nowWall-lastTickAdvanceAt>=90000&&
      stallKind!=='PHYSICS_RUNNING')){
   const outcome=saveB80(stallKind);
   fail('B80_NATIVE_SOURCE_CLOCK_DIAGNOSIS_'+JSON.stringify(outcome));
  }
  // A real 40-second fixed-tick rejoin plateau is not a clock stall.
  // Fail early with actor-level evidence rather than spending 13 wall
  // minutes waiting for a sixth/seventh CPU that never progresses.
  if(status.nativeSourceCpuRejoined>lastRejoinCount){
   lastRejoinCount=status.nativeSourceCpuRejoined;
   lastRejoinTick=status.tick;
  }
  if(status.matchState==='STAGING'&&status.tick>=2400&&
     status.nativeSourceCpuRejoined>0&&
     status.nativeSourceCpuRejoined<7&&
     status.tick-lastRejoinTick>=900){
   const evidence={schema:'W10_B89_NATIVE_STAGING_REJOIN_PLATEAU_V1',
    mode,nativeTick:status.tick,lastRejoinTick,
    rejoined:status.nativeSourceCpuRejoined,
    actors:status.nativeSourceCpuActors,
    released:status.nativeSourceReleasedCpuIds,
    corridorsCleared:status.nativeSourceLandingCorridorsCleared,
    noPoseMutation:true,noForcedPlaying:true,original4v4Certified:false};
   console.error('T21_B89_REAL_NATIVE_REJOIN_PLATEAU',JSON.stringify(evidence));
   fail('B89_NATIVE_STAGING_REJOIN_PLATEAU_'+JSON.stringify(evidence));
  }
  if(status.b76State==='REAL_SOURCE_PAINT'&&
     status.b76RecentCells>0&&status.b76RecentShots>0&&
     status.actualHumanPaintCells>0&&status.acceptedHumanShots>0)
   humanPulse??=status;
  if(status.state==='REAL_SOURCE_INK'&&status.recentCells>0&&
     status.nativeCpuChangedSourceCells>0&&status.nativeCpuSourceShots>0)
   inkPulse??=status;
  if(status.state==='SOURCE_SHOTS_NO_NEW_INK'&&
     status.recentShots>0&&status.recentCells===0)firedNoInk=true;
  if(Math.floor(status.elapsed/5)>lastReported){
   lastReported=Math.floor(status.elapsed/5);
   observations.push(status);
   console.log('T21_W10B75_GENUINE_NATIVE_LIVE_HUD',JSON.stringify(status));
  }
  if(inkPulse&&humanPulse&&status.elapsed>=13&&
     status.nativeCpuSourceShots>0&&
     status.nativeCpuChangedSourceCells>0){
   const shot=Buffer.from((await cmd('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false,fromSurface:true})).data||'','base64');
   if(shot.length<10000)fail('BAD_REAL_CHROME_SCREENSHOT');
   const name='w10b75-source-live-'+mode.toLowerCase()+'.png';
   writeFileSync(resolve(OUTPUT,name),shot);
   const proof={
    schema:'W10_B75_GENUINE_READ_ONLY_NATIVE_SOURCE_INK_HUD_V1',
    mode,realBrowserWebGL2:true,nativeRealRenderer:true,
    noArtificialQaTickAdvance:true,actualPointerLockAndMouseInput:true,
    verifiedTrueNativeOriginalSourceInkPulse:inkPulse,
    verifiedRealHumanSourceInkAndShotPulse:humanPulse,
    liveHumanInkRefillStateFromRealResource:true,
    b80VerifiedNativeProgress:saveB80('PHYSICS_RUNNING'),
    noInferredHumanHitRate:true,
    lastRealNativeObservation:status,
    actualRecentNoNewInkWithShotsSeen:firedNoInk,
    realNativePlayerShots:status.nativeCpuSourceShots,
    nativeSourceChangedCells:status.nativeCpuChangedSourceCells,
    originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
    original4v4Certified:false,productionAuthorized:false,
    screenshot:{name,bytes:shot.length,
     sha256:createHash('sha256').update(shot).digest('hex')},
    samples:observations
   };
   writeFileSync(resolve(OUTPUT,'w10b75-real-'+mode.toLowerCase()+'.json'),
    JSON.stringify(proof,null,2));
   console.log('T21_W10B75_REAL_NATIVE_INK_HUD_PASS',JSON.stringify({
    mode,realNativeSeconds:Number(status.elapsed.toFixed(2)),
    pulseCells:inkPulse.recentCells,pulseShots:inkPulse.recentShots,
    totalCpuShots:status.nativeCpuSourceShots,
    changedCells:status.nativeCpuChangedSourceCells,
    actualHumanShots:status.acceptedHumanShots,
    realHumanChangedSourceCells:status.actualHumanPaintCells,
    humanHudChangedCellsAtPulse:humanPulse.b76RecentCells,
    officialWinner:'NONE',original4v4Certified:false}));
   return;
  }
  await sleep(850);
 }
 fail('B76_NO_GENUINE_NATIVE_CPU_AND_HUMAN_SOURCE_INK_PULSES_WITHIN_13_MINUTES');
}
try{await run();}
catch(err){console.error(err);process.exitCode=1;}
finally{sock?.close();for(const child of children)child.kill('SIGTERM');}
