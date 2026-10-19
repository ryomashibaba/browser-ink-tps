#!/usr/bin/env node
/** F3 real Chrome WebGL2 + trusted keyboard/mouse + framebuffer smoke.
 * Unlike the 60Hz F2 Vitest, this proves that the opt-in browser scene
 * actually boots and that PlayerInput can move/shoot without source mutation.
 * No T21 release, win/scoring or unrestricted 4v4 certification is implied.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';

const ROOT='http://127.0.0.1:4196/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-f3-playable-webgl2';
const children=[],pending=new Map();
let socket=null,sequence=0;
function reject(reason){throw Error('T21_F3_BROWSER_'+reason);}
async function waitUntil(fn,ms=45000){
 const deadline=Date.now()+ms;let reason='';
 while(Date.now()<deadline){
  try{const answer=await fn();if(answer)return answer;}
  catch(e){reason=String(e);}
  await sleep(220);
 }
 reject('TIMEOUT '+reason);
}
async function cmd(method,params={}){
 if(!socket||socket.readyState!==WebSocket.OPEN)
  reject('CDP_NOT_CONNECTED');
 const id=++sequence;
 return await new Promise((ok,no)=>{
  const timeout=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT '+method));},25000);
  pending.set(id,{ok:v=>{clearTimeout(timeout);ok(v);},
   no:e=>{clearTimeout(timeout);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)reject('PAGE_EXCEPTION '+JSON.stringify(r.exceptionDetails).slice(0,600));
 return r.result?.value;
}
const key=(type)=>cmd('Input.dispatchKeyEvent',{
 type,key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87
});
const mouse=(type)=>cmd('Input.dispatchMouseEvent',{
 type,x:800,y:450,button:'left',clickCount:1
});
async function screenshot(name){
 const png=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true
 })).data||'','base64');
 if(png.length<10000||png.readUInt32BE(16)!==1600||
    png.readUInt32BE(20)!==900||png.subarray(1,4).toString()!=='PNG')
  reject('BAD_REAL_GPU_FRAMEBUFFER_'+name);
 writeFileSync(resolve(OUTPUT,name+'.png'),png);
 return {name,bytes:png.length,
  sha256:createHash('sha256').update(png).digest('hex')};
}
async function main(){
 mkdirSync(OUTPUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(v=>{try{execFileSync('which',[v],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)reject('CHROME_MISSING');
 const server=spawn('npm',['run','preview','--',
  '--host','127.0.0.1','--port','4196','--strictPort',
  '--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await waitUntil(async()=>{const r=await fetch(ROOT);return r.ok;},30000);
 const browser=spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--disable-background-networking',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9256','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-f3-cdp-profile','about:blank'
 ],{stdio:'ignore'});
 children.push(browser);
 const tab=await waitUntil(async()=>{
  if(browser.exitCode!==null)reject('CHROME_EXITED');
  const r=await fetch('http://127.0.0.1:9256/json');
  return (await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   socket.addEventListener('open',ok,{once:true});
   socket.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('CDP_SOCKET_TIMEOUT');})
 ]);
 socket.addEventListener('message',event=>{
  const response=JSON.parse(String(event.data));
  const waiter=pending.get(response.id);
  if(!waiter)return;
  pending.delete(response.id);
  if(response.error)waiter.no(Error(JSON.stringify(response.error)));
  else waiter.ok(response.result||{});
 });
 await cmd('Page.enable');
 await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false
 });
 const w10b14=process.env.T21_W10B14_RENDER_QA==='1';
 const w10b15=process.env.T21_W10B15_TRUSTED_INPUT==='1';
 const w10b16=process.env.T21_W10B16_NATURAL_AI==='1';
 const w10b21=process.env.T21_W10B21_RENDER_AB==='1';
 if([w10b14,w10b15,w10b16,w10b21].filter(Boolean).length>1)
  reject('CONFLICTING_QA_MODES');
 const kitQa=process.env.T21_F3_CPU_KITS_QA==='1';
 const longCpu=process.env.T21_F3_LONG_CPU==='1'||kitQa||w10b16;
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'+
  ((w10b14||w10b15||w10b21)?'&t21QaDrive=source&t21QaInput=deterministic&'+
   't21KccAudit=readOnly&t21QaPauseOnBoot=1&t21W10B14=render'+
   (w10b15?'&t21W10B15=trustedMouse':''):'')+
  (longCpu?'&t21QaDrive=source':'')+
  (kitQa?'&t21CpuKits=qa':'')+
  (w10b16?'&t21W10B16=sourceAutonomy':'')+
  (w10b21?'&t21W10B21=renderAB&t21W10B26=smartVisibility&t21W10B27=kinetic':'')+
  (process.env.T21_W10B20_PROFILE==='1'?'&t21W10B20=profile':'')+
  (process.env.T21_F3G_EXPECT_WHOLE==='1'?'&t21FullSource=review':'')});
 await waitUntil(async()=>{
  const ready=await evaluate(`({
   ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
   renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,
   error:document.querySelector('#boot-error')?.textContent||''
  })`);
  if(ready.error)reject('APP_BOOT '+ready.error.slice(0,1600));
  return ready.ready==='READY'&&ready.renderer==='webgl2';
 },65000);
 if(w10b21){
  const before=await evaluate('window.__t21F3.snapshot()');
  if(!before.paused||before.tick!==0||before.stopReason||
     before.b21RenderProbe.enabled!==true||
     before.b21RenderProbe.quality!=='NATIVE'||
     before.originalSourceSolids!==25||
     before.originalPaintSurfaces!==17||
     before.originalSourceNavigationLinks!==26||
     before.sourceScoreablePromotions!==0||
     before.cameraSourcePractice.b26AdaptiveVisibility?.enabled!==true||
     before.cameraSourcePractice.b26AdaptiveVisibility?.gameplayGeometryModified!==false||
     before.b27KineticSourceView?.enabled!==true||
     before.b27KineticSourceView.fieldOfViewDegrees!==63)
   reject('W10B21_FROZEN_ORIGINAL_SOURCE_REQUIRED_'+JSON.stringify(before));
  // W10-B28: real Chrome pixel evidence for identical physical scene
  // while switching ONLY between existing source architecture materials.
  if(before.b28OriginalSourceMassing?.mode!=='ARCHITECTURE'||
     before.b28OriginalSourceMassing.visible!==true||
     before.b28OriginalSourceMassing.physicalCollisionAdded!==0||
     before.b28OriginalSourceMassing.navigationAdded!==0||
     before.b28OriginalSourceMassing.scoreableAdded!==0||
     before.b28OriginalSourceMassing.unplacedActorInstancesRecovered!==0)
   reject('W10B28_SOURCE_ARCHITECTURE_NOT_SAFE_'+
    JSON.stringify(before.b28OriginalSourceMassing));
  const pressMassing=async()=>{
   await cmd('Input.dispatchKeyEvent',{
    type:'keyDown',key:'H',code:'KeyH',modifiers:8,
    windowsVirtualKeyCode:72,nativeVirtualKeyCode:72});
   await cmd('Input.dispatchKeyEvent',{
    type:'keyUp',key:'H',code:'KeyH',modifiers:8,
    windowsVirtualKeyCode:72,nativeVirtualKeyCode:72});
  };
  // Normalize the existing F3E button label on the first round trip;
  // architecture A and A2 then have exactly the same UI and camera.
  await pressMassing();await pressMassing();
  const initialMassing=await evaluate('window.__t21F3.snapshot()');
  if(initialMassing.b28OriginalSourceMassing.mode!=='ARCHITECTURE')
   reject('W10B28_INITIAL_ROUNDTRIP_FAILED');
  await sleep(700);
  const architectureA=await screenshot('W10B28_A_ORIGINAL_ARCHITECTURE');
  await pressMassing();
  const ghost=await waitUntil(async()=>{
   const st=await evaluate('window.__t21F3.snapshot()');
   return st.b28OriginalSourceMassing.mode==='HOLOGRAM'?st:false;
  },15000);
  await sleep(700);
  const hologramB=await screenshot('W10B28_B_OPTICAL_HOLOGRAM');
  await pressMassing();
  const restoredArchitecture=await waitUntil(async()=>{
   const st=await evaluate('window.__t21F3.snapshot()');
   return st.b28OriginalSourceMassing.mode==='ARCHITECTURE'?st:false;
  },15000);
  await sleep(700);
  const architectureA2=await screenshot('W10B28_A2_ARCHITECTURE_RESTORED');
  if(architectureA.sha256===hologramB.sha256||
     architectureA.sha256!==architectureA2.sha256||
     ghost.tick!==before.tick||restoredArchitecture.tick!==before.tick||
     JSON.stringify(ghost.player.position)!==JSON.stringify(before.player.position)||
     JSON.stringify(restoredArchitecture.player.position)!==JSON.stringify(before.player.position)||
     restoredArchitecture.originalSourceSolids!==25||
     restoredArchitecture.originalPaintSurfaces!==17||
     restoredArchitecture.originalSourceNavigationLinks!==26||
     restoredArchitecture.sourceScoreablePromotions!==0)
   reject('W10B28_REAL_CHROME_MASSING_NOT_REVERSIBLE_'+
    JSON.stringify({architectureA,hologramB,architectureA2,
     ghost:ghost.b28OriginalSourceMassing}));
  console.log('T21_W10B28_REAL_CHROME_ORIGINAL_MASSING_REVERSIBLE_PASS',
   JSON.stringify({
    sourceOnly:true,realChromeWebGL2:true,
    architectureSHA:architectureA.sha256,hologramSHA:hologramB.sha256,
    restoredIdentical:true,fixedPhysicsTicks:0,
    originalSourceTriangles:before.b28OriginalSourceMassing.originalTriangles,
    originalSolids:25,originalPaintable:17,originalNavLinks:26,
    scoreablePromotions:0,unplacedActorTransformsRecovered:0,
    actualOriginalMaterialsCertified:false
   }));
  const initialPixels=before.b21RenderProbe.canvasPixels;
  if(initialPixels[0]!==1600||initialPixels[1]!==900)
   reject('W10B21_NATIVE_BACKBUFFER_NOT_1600x900_'+JSON.stringify(initialPixels));
  const started=await evaluate('window.__t21F3.startW10B21FrozenRenderProbe()');
  if(!started.active||started.physicsTick!==0)
   reject('W10B21_PROBE_UNARMED_'+JSON.stringify(started));
  const collect=async (label,quality,pixels)=>{
   const observation=await waitUntil(async()=>{
    const a=await evaluate('window.__t21F3.snapshot()');
    if(a.stopReason)reject('W10B21_RENDER_SAFE_STOP_'+a.stopReason);
    const p=a.b21RenderProbe;
    return p.sampleCount>=5?a:false;
   },85000);
   const p=observation.b21RenderProbe;
   if(p.quality!==quality||p.canvasPixels[0]!==pixels[0]||
      p.canvasPixels[1]!==pixels[1]||p.physicsTick!==0||
      !Number.isFinite(p.p50Ms)||!Number.isFinite(p.p95Ms)||
      observation.originalSourceSolids!==25||
      observation.originalPaintSurfaces!==17||
      observation.originalSourceNavigationLinks!==26||
      observation.sourceScoreablePromotions!==0||
      JSON.stringify(observation.player.position)!==JSON.stringify(before.player.position)||
      observation.cameraSourcePractice.yawDegrees!==before.cameraSourcePractice.yawDegrees||
      observation.cameraSourcePractice.pitchDegrees!==before.cameraSourcePractice.pitchDegrees)
    reject('W10B21_NOT_SAME_FROZEN_STAGE_'+JSON.stringify({label,p,original:before.player,now:observation.player}));
   const frame=await screenshot('W10B21_'+label);
   return {quality,renderPixels:p.canvasPixels,measurement:p,frame};
  };
  const fullA=await collect('A_NATIVE_1','NATIVE',[1600,900]);
  const lowSwitch=await evaluate('window.__t21F3.setW10B21FrozenQuality("PERFORMANCE")');
  if(lowSwitch.quality!=='PERFORMANCE'||lowSwitch.canvasPixels[0]!==1200||
     lowSwitch.canvasPixels[1]!==675)
   reject('W10B21_LOW_MODE_BACKBUFFER_FAILED_'+JSON.stringify(lowSwitch));
  const lowB=await collect('B_PERFORMANCE_75','PERFORMANCE',[1200,675]);
  const restored=await evaluate('window.__t21F3.setW10B21FrozenQuality("NATIVE")');
  if(restored.quality!=='NATIVE'||restored.canvasPixels[0]!==1600||
     restored.canvasPixels[1]!==900)
   reject('W10B21_RESTORE_NATIVE_BACKBUFFER_FAILED_'+JSON.stringify(restored));
  const fullA2=await collect('A2_NATIVE_RESTORED','NATIVE',[1600,900]);
  const result={
   status:'PASS_SOURCE_ONLY_REAL_CHROME_SAME_STAGE_ABA',
   fixedPhysicsTicks:0,realChromiumWebGL2:true,
   realViewport:[1600,900],pixelWorkFractionAt75:0.5625,
   originalSolids:25,paintableSurfaces:17,originalNavigationLinks:26,
   scoreableSurfacesPromoted:0,productionAuthorized:false,
   natural4v4Certified:false,measureIsCpuWallTimeNotGpu:true,
   nativeA:fullA,performanceB:lowB,nativeRestoredA:fullA2,
   changesToActualStageGeometry:0,realActorRelocations:0,
   warning:'HEADLESS_SWIFTSHADER_NOT_REAL_USER_GPU_NO_CAUSAL_FPS_CLAIM'
  };
  writeFileSync(resolve(OUTPUT,'w10b21-source-render-aba.json'),
   JSON.stringify(result,null,2));
  console.log('T21_W10B21_REAL_CHROME_RENDER_ABA_PASS',JSON.stringify(result));
  // B22: actual DOM start + browser Pointer Lock + real-frame trial arming.
  // This is only an ABORT/RECOVERY guard, NOT synthetic evidence of
  // 36 seconds of user play or the owner's hardware responsiveness.
  const ownerArm=await evaluate(`(() => {
   const start=document.querySelector('#t21-f3-b22-start');
   const save=document.querySelector('#t21-f3-b22-save');
   if(!start||!save)return {error:'OWNER_CONTROLS_MISSING'};
   if(!save.hidden)return {error:'OWNER_REPORT_PRESENT_BEFORE_RUN'};
   window.__t21F3.resume();
   start.click();
   return window.__t21F3.snapshot().b22OwnerGpuTrial;
  })()`);
  if(ownerArm?.status!=='ARMED')
   reject('W10B22_OWNER_START_CONTROL_NOT_ARMED_'+JSON.stringify(ownerArm));
  await mouse('mousePressed');await mouse('mouseReleased');
  const ownerRunning=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   if(state.stopReason)reject('W10B22_OWNER_REAL_INPUT_STOP_'+state.stopReason);
   return state.b22OwnerGpuTrial.status==='RUNNING'?state:false;
  },25000);
  if(ownerRunning.b22OwnerGpuTrial.sourceOnly!==true||
     ownerRunning.sourceScoreablePromotions!==0||
     ownerRunning.originalSourceSolids!==25||
     ownerRunning.cameraSourcePractice.b26AdaptiveVisibility.enabled!==true)
   reject('W10B22_OWNER_SOURCE_STATE_DRIFT_'+JSON.stringify(ownerRunning));
  // Genuine Chrome KeyQ input, not synthetic shoulder state injection.
  const preManual=ownerRunning.cameraSourcePractice.shoulderSide;
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81});
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81});
  const manual=await evaluate('window.__t21F3.snapshot()');
  if(manual.cameraSourcePractice.shoulderSide===preManual||
     manual.cameraSourcePractice.b26AdaptiveVisibility.manualOverrideSeconds<=0||
     manual.cameraSourcePractice.b26AdaptiveVisibility.physicsCameraBypass!==false||
     manual.sourceScoreablePromotions!==0)
   reject('W10B26_REAL_MANUAL_Q_WINS_OVER_ADAPTIVE_'+
    JSON.stringify(manual.cameraSourcePractice));
  console.log('T21_W10B26_ADAPTIVE_VISIBILITY_GENUINE_CHROME_Q_PRIORITY_PASS',
   JSON.stringify({sourceOnly:true,smartEnabled:true,manualOverride:true,
    nativeStageSolids:25,sourceScoreablePromotions:0,
    automaticSwitchClaimed:false,realBrowserPointerLock:true}));
  await evaluate('document.exitPointerLock()');
  const ownerAborted=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   return state.b22OwnerGpuTrial.status==='ABORTED'?state:false;
  },25000);
  if(ownerAborted.b22OwnerGpuTrial.stopReason!=='POINTER_UNLOCK_OR_PAUSE_DURING_TRIAL'||
     ownerAborted.b22OwnerGpuTrial.complete||
     ownerAborted.sourceScoreablePromotions!==0||
     ownerAborted.b21RenderProbe.quality!=='NATIVE')
   reject('W10B22_OWNER_REAL_POINTER_ABORT_FAILED_'+
    JSON.stringify(ownerAborted.b22OwnerGpuTrial));
  console.log('T21_W10B22_REAL_CHROME_POINTER_TRIAL_SAFE_ABORT_PASS',JSON.stringify({
   realWebGL2:true,uiStart:true,realPointerLockedTrial:true,
   status:ownerAborted.b22OwnerGpuTrial.status,
   nativeRestored:true,sourceSolids:25,sourceScoring:0,
   notOwnerWindowsGpu:true
  }));
  // B25 source-only practice requires a real user start and real pointer
  // ownership. Do not advance a synthetic 60Hz clock to claim success.
  const paintRunArm=await evaluate(`(() => {
   const root=document.querySelector('#t21-f3-b25-paint-run');
   const btn=document.querySelector('#t21-f3-b25-start');
   if(!root||!btn)return {error:'B25_PRACTICE_CONTROLS_NOT_INSTALLED'};
   if(root.dataset.sourceOnly!=='true'||root.dataset.scoreable!=='0'||
      root.dataset.productionAuthority!=='NONE')
    return {error:'B25_SOURCE_ONLY_AUTHORITY_DRIFT'};
   btn.click();
   return window.__t21F3.snapshot().b25SourcePaintRun;
  })()`);
  if(paintRunArm?.status!=='ARMED'||paintRunArm.officialWinner!=='NONE'||
     paintRunArm.physicalStageModifications!==0)
   reject('W10B25_PRACTICE_MUST_ARM_NONSCORING_'+JSON.stringify(paintRunArm));
  await mouse('mousePressed');await mouse('mouseReleased');
  const paintRunLive=await waitUntil(async()=>{
   const st=await evaluate('window.__t21F3.snapshot()');
   if(st.stopReason)reject('W10B25_NATIVE_SOURCE_STOP_'+st.stopReason);
   return st.b25SourcePaintRun.status==='RUNNING'?st:false;
  },25000);
  if(paintRunLive.b25SourcePaintRun.mode!=='OPTIONAL_NONSCORING_SOURCE_PAINT_RUN'||
     paintRunLive.b25SourcePaintRun.cpuPaintingCounted!==false||
     paintRunLive.b25SourcePaintRun.originalTurfScore!=='UNAVAILABLE'||
     paintRunLive.b25SourcePaintRun.officialWinner!=='NONE'||
     paintRunLive.sourceScoreablePromotions!==0||
     paintRunLive.originalSourceSolids!==25||
     paintRunLive.b27KineticSourceView.enabled!==true)
   reject('W10B25_NATIVE_PRACTICE_AUTHORITY_'+JSON.stringify(paintRunLive.b25SourcePaintRun));
  // REAL physical W movement during normal browser updates. Do not feed
  // synthetic QA axes or rewrite player positions.
  await key('keyDown');
  const moving=await waitUntil(async()=>{
   const a=await evaluate('window.__t21F3.snapshot()');
   if(a.stopReason)reject('W10B27_REAL_KCC_SAFE_STOP_'+a.stopReason);
   return a.tick>=paintRunLive.tick+25&&
    a.b27KineticSourceView.acceptedGroundedSteps>=10&&
    a.b27KineticSourceView.fieldOfViewDegrees>=63.3?a:false;
  },70000);
  await key('keyUp');
  const travel=Math.hypot(...moving.player.position.map((v,i)=>
   v-paintRunLive.player.position[i]));
  const pace=moving.b27KineticSourceView;
  if(travel<.2||travel>9||
     pace.fieldOfViewDegrees>69||
     pace.movementControllerModified!==false||
     pace.runtimeCollisionNavOrPaintModified!==false||
     pace.productionAuthorized!==false||
     moving.sourceScoreablePromotions!==0)
   reject('W10B27_REAL_GROUNDED_VISUAL_NOT_ACTUAL_'+
    JSON.stringify({pace,travel}));
  console.log('T21_W10B27_REAL_CHROME_KCC_KINETIC_FOV_PASS',
   JSON.stringify({realMouseLockedMovement:true,
    playerDisplacementMeters:Number(travel.toFixed(3)),
    realOriginalGroundSteps:pace.acceptedGroundedSteps,
    renderLensFovDegrees:pace.fieldOfViewDegrees,
    originalStageSolids:25,scoreablePromotions:0,
    gameplayOrAimChanges:false}));
  await evaluate('document.exitPointerLock()');
  const unlocked=await evaluate('window.__t21F3.snapshot()');
  if(unlocked.b27KineticSourceView.fieldOfViewDegrees!==63)
   reject('W10B27_POINTER_UNLOCK_MUST_INSTANTLY_RESTORE_ORIGINAL_LENS_'+
    JSON.stringify(unlocked.b27KineticSourceView));
  const paintRunAborted=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   return state.b25SourcePaintRun.status==='ABORTED'?state:false;
  },25000);
  if(paintRunAborted.b25SourcePaintRun.abortReason!=='PLAYER_POINTER_UNLOCKED'||
     paintRunAborted.b25SourcePaintRun.officialWinner!=='NONE')
   reject('W10B25_SOURCE_PRACTICE_ABORT_UNSAFE_'+
    JSON.stringify(paintRunAborted.b25SourcePaintRun));
  console.log('T21_W10B25_REAL_CHROME_USER_PRACTICE_ARM_RUN_ABORT_PASS',JSON.stringify({
   sourceOnly:true,realInput:true,nativePhysicsTicks:paintRunLive.tick,
   practiceWasRunning:true,pointerUnlockAborts:true,
   fakeScore:0,natural4v4Certified:false
  }));
  return;
 }
 if(w10b15){
  // Test the REAL DOM, not only the helper's pure formatting.
  const hud=await evaluate(`(() => {
   const e=document.querySelector('#t21-f3-practice-hud');
   const d=document.querySelector('#t21-f3-diagnostics');
   return {found:!!e,sourceScoreable:e?.dataset.sourceScoreable,
    authority:e?.dataset.productionAuthority,closed:!d?.open,
    clock:e?.dataset.clock,text:e?.textContent?.slice(0,350)};
  })()`);
  if(!hud.found||hud.sourceScoreable!=='0'||
     hud.authority!=='NONE'||!hud.closed||
     hud.clock!=='3:00'||!hud.text.includes('NO OFFICIAL RESULT'))
   reject('W10B17_NATIVE_HUD_NOT_READABLE_'+JSON.stringify(hud));
  const witness=()=>evaluate('window.__t21F3.w10B14RenderWitness()');
  const advance=async count=>{
   const result=await evaluate(`(() => {
    try{return {state:window.__t21F3.advanceQaTicks(${count})};}
    catch(error){return {error:String(error)};}
   })()`);
   if(result.error)reject('W10B15_RAPIER_SOURCE_HOLD_'+result.error);
   if(result.state?.stopReason)reject('W10B15_STOP_'+result.state.stopReason);
   return result.state;
  };
  let state=await evaluate('window.__t21F3.startW10B14RenderWitness()');
  if(!state.actualPointerInputRequired||state.cpuRepositionedForIsolatedQa!==true||
     state.sourceSolids!==25||state.sourcePaint!==17||state.sourceLinks!==26||
     state.activationReady!==false||state.naturalEnemyEncounterCertified!==false||
     !state.entityEnabledInHierarchy||state.hp!==100)
   reject('W10B15_SOURCE_SETUP_UNTRUSTED_'+JSON.stringify(state));
  const grounded=await advance(75);
  if(!grounded.player||grounded.stopReason)
   reject('W10B15_GROUND_STEP_FAILED_'+JSON.stringify(grounded));
  const armed=await evaluate('window.__t21F3.armW10B14RealProjectiles()');
  if(!armed.armed||!armed.grounded)
   reject('W10B15_PHYSICAL_PLAYER_UNGROUNDED_'+JSON.stringify(armed));
  // CDP browser-native pointer events. No input.fire flag writes, no
  // CPU-directed launch vector or scripted HP mutation.
  await mouse('mousePressed');await mouse('mouseReleased');
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")'),15000);
  // Real press+release before ANY physics tick: never silently lose
  // a quick mouse tap at 60Hz. The shot must be accepted by the native
  // ProjectileSystem with a genuine pointer-locked browser event.
  const quickBefore=await witness();
  await mouse('mousePressed');await mouse('mouseReleased');
  await advance(1);
  const quickAfter=await witness();
  if(quickAfter.shotsFired<=quickBefore.shotsFired||
     quickAfter.realMouseFireHeld||!quickAfter.pointerLocked||
     quickAfter.sourceSolids!==25||quickAfter.scoreablePromotions!==0)
   reject('W10B19_REAL_QUICK_TAP_LOST_BEFORE_FIXED_TICK_'+
    JSON.stringify({before:quickBefore,after:quickAfter}));
  console.log('T21_W10B19_NATIVE_ONE_TICK_QUICK_TAP_PASS',{
   actualPointerLock:true,pressedAndReleasedBeforePhysics:true,
   acceptedNativeShots:quickAfter.shotsFired-quickBefore.shotsFired,
   sourceScoreablePromotions:0
  });
  // Confirm the optional shoulder control is actual pointer-locked input
  // and never writes a physical actor, stage, CPU foot or score mask.
  const firstView=await evaluate('window.__t21F3.snapshot()');
  if(!firstView.cameraSourcePractice?.sourcePracticeOnly||
     firstView.cameraSourcePractice.shoulderSide!=='RIGHT'||
     firstView.radarVisible!==true)
   reject('W10B18_SOURCE_CAMERA_NOT_ARMED_'+JSON.stringify(firstView.cameraSourcePractice));
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  const left=await evaluate('window.__t21F3.snapshot()');
  if(left.cameraSourcePractice.shoulderSide!=='LEFT'||
     left.cameraSourcePractice.desiredShoulderOffsetMeters>=0||
     left.originalSourceSolids!==25||left.sourceScoreablePromotions!==0)
   reject('W10B18_REAL_Q_SHOULDER_FAILED_'+JSON.stringify(left.cameraSourcePractice));
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  if((await evaluate('window.__t21F3.snapshot()')).cameraSourcePractice.shoulderSide!=='RIGHT')
   reject('W10B18_Q_SHOULDER_RESTORE_FAILED');
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'m',code:'KeyM',
   windowsVirtualKeyCode:77,nativeVirtualKeyCode:77
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'m',code:'KeyM',
   windowsVirtualKeyCode:77,nativeVirtualKeyCode:77
  });
  const radarHidden=await evaluate(`({
    visible:window.__t21F3.snapshot().radarVisible,
    display:document.querySelector('#t21-f3-source-radar')?.style.display
  })`);
  if(radarHidden.visible!==false||radarHidden.display!=='none')
   reject('W10B18_M_HIDE_RADAR_FAILED_'+JSON.stringify(radarHidden));
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'m',code:'KeyM',
   windowsVirtualKeyCode:77,nativeVirtualKeyCode:77
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'m',code:'KeyM',
   windowsVirtualKeyCode:77,nativeVirtualKeyCode:77
  });
  if((await evaluate('window.__t21F3.snapshot()')).radarVisible!==true)
   reject('W10B18_M_RESTORE_RADAR_FAILED');
  console.log('T21_W10B18_REAL_Q_SHOULDER_AND_M_RADAR_PASS',{
   realBrowserPointerLock:true,gameplaySourceOnly:true,
   physicalActorsRelocated:0,originalSolids:25,scoreablePromotion:0
  });
  // Do not let the source gallery hijack gameplay input KeyG.
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'g',code:'KeyG',
   windowsVirtualKeyCode:71,nativeVirtualKeyCode:71
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'g',code:'KeyG',
   windowsVirtualKeyCode:71,nativeVirtualKeyCode:71
  });
  const gallery=await evaluate('window.__t21F3.snapshot().sourceGalleryF3k.selection');
  if(gallery!==-1||!(await witness()).pointerLocked)
   reject('W10B17_GAMEPLAY_G_OPENED_DEBUG_GALLERY_'+gallery);
  let pointer={x:800,y:450},trace=[],aligned=false;
  for(let n=0;n<25;n++){
   const before=await witness();
   const p=before.enemyProjectedScreen;
   if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))
    reject('W10B15_PROJECTED_ENEMY_UNKNOWN_'+JSON.stringify(before));
   const errorX=p.x-800,errorY=p.y-450;
   trace.push({n,screen:p,errorX,errorY});
   if(Math.abs(errorX)<10&&Math.abs(errorY)<14&&p.z>0){
    aligned=true;break;
   }
   const dx=Math.max(-90,Math.min(90,errorX*.38));
   const dy=Math.max(-70,Math.min(70,errorY*.38));
   pointer.x=Math.max(120,Math.min(1480,pointer.x+dx));
   pointer.y=Math.max(100,Math.min(800,pointer.y+dy));
   await cmd('Input.dispatchMouseEvent',{
    type:'mouseMoved',x:pointer.x,y:pointer.y,button:'none'
   });
   await advance(1); // the original real camera sync and real 60Hz physics
  }
  state=await witness();
  console.log('T21_W10B15_REAL_MOUSE_AIM',JSON.stringify({
   aligned,trace,screen:state.enemyProjectedScreen,
   pointerLocked:state.pointerLocked
  }));
  if(!aligned||!state.pointerLocked)
   reject('W10B15_UNASSISTED_AIM_NOT_ALIGNED_'+JSON.stringify({trace,state}));
  const shotsBefore=state.shotsFired,hitsBefore=state.cpuCombatHits;
  await mouse('mousePressed');
  const pressed=await witness();
  if(!pressed.realMouseFireHeld||!pressed.pointerLocked)
   reject('W10B15_TRUSTED_POINTERDOWN_NOT_RECORDED_'+JSON.stringify(pressed));
  let splat=null;
  for(let n=0;n<20;n++){
   await advance(12);
   const now=await witness();
   if(now.lifeState==='SPLATTED'){splat=now;break;}
  }
  await mouse('mouseReleased');
  const released=await witness();
  if(released.realMouseFireHeld)
   reject('W10B15_POINTER_RELEASE_NOT_RECORDED_'+JSON.stringify(released));
  if(!splat||splat.cpuSplats!==1||splat.cpuCombatHits-quickBefore.cpuCombatHits<3||
     splat.shotsFired-quickBefore.shotsFired<3||splat.hp!==0||
     splat.entityEnabledInHierarchy!==false)
   reject('W10B15_MOUSE_NOT_NATIVE_COMBAT_'+JSON.stringify({
    splat,shotsBefore,hitsBefore,trace
   }));
  const deathFrame=await screenshot('W10B15_1_TRUE_MOUSE_CPU_SPLAT');
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'Escape',code:'Escape',
   windowsVirtualKeyCode:27,nativeVirtualKeyCode:27
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'Escape',code:'Escape',
   windowsVirtualKeyCode:27,nativeVirtualKeyCode:27
  });
  await waitUntil(async()=>await evaluate('document.pointerLockElement===null'),12000);
  const padEmpty=await evaluate('window.__t21F3.inspectW10B15NativePad()');
  if(!padEmpty.cameraOnly||padEmpty.physicalActorsMoved!==0||
     padEmpty.productionAuthorized!==false||padEmpty.originalSolids!==25||
     padEmpty.originalPaint!==17||padEmpty.originalLinks!==26||
     padEmpty.cpuState!=='SPLATTED'||padEmpty.cpuEntityEnabled!==false||
     !padEmpty.screen||Math.abs(padEmpty.screen.x-800)>2||
     Math.abs(padEmpty.screen.y-450)>2)
   reject('W10B15_EMPTY_PAD_CAMERA_INVALID_'+JSON.stringify(padEmpty));
  await sleep(300);
  const emptyPadShot=await screenshot('W10B15_2_NATIVE_PAD_BEFORE_RESPAWN');
  let respawn=null;
  for(let n=0;n<20;n++){
   await advance(12);
   const now=await witness();
   if(now.cpuRespawns>=1){respawn=now;break;}
  }
  if(!respawn||respawn.hp!==100||respawn.lifeState!=='ACTIVE'||
     !respawn.entityEnabledInHierarchy||respawn.cpuRespawns!==1||
     respawn.stopReason||respawn.sourceSolids!==25||respawn.sourcePaint!==17||
     respawn.sourceLinks!==26||respawn.activationReady!==false)
   reject('W10B15_REAL_CPU_RESPAWN_BROKEN_'+JSON.stringify(respawn));
  const padFilled=await evaluate('window.__t21F3.inspectW10B15NativePad()');
  if(!padFilled.cameraOnly||padFilled.physicalActorsMoved!==0||
     padFilled.productionAuthorized!==false||
     padFilled.cpuState!=='ACTIVE'||padFilled.cpuEntityEnabled!==true||
     JSON.stringify(padFilled.viewPosition)!==JSON.stringify(padEmpty.viewPosition)||
     JSON.stringify(padFilled.lookAt)!==JSON.stringify(padEmpty.lookAt))
   reject('W10B15_OCCUPIED_PAD_CAMERA_DRIFT_'+JSON.stringify({padEmpty,padFilled}));
  await sleep(300);
  const respawnFrame=await screenshot('W10B15_3_NATIVE_PAD_AFTER_RESPAWN');
  const out={status:'PASS_REAL_CHROME_TRUSTED_MOUSE_INPUT_NATIVE_COMBAT',
   originalStageAuthorityChanged:false,isolatedQaEnemyPlacement:true,
   mousePointerLock:true,unassistedCameraAim:true,
   realPlayerInputFire:true,realProjectileCpuHits:splat.cpuCombatHits-hitsBefore,
   actualPlayerShots:splat.shotsFired-shotsBefore,
   realCpuSplats:1,realCpuRespawns:1,respawnHp:100,
   scoreableSurfacesAuthorized:0,naturalEncounterCertified:false,
   pixelsIndependentlyCertified:false,nativePadCameraOnly:true,
   sourcePixelComparisonPending:true,padEmpty,padFilled,emptyPadShot,
   sourceSolids:25,paintSurfaces:17,
   navLinks:26,productionAuthorized:false,aimTrace:trace,
   stages:[{phase:'SPLAT',state:splat,frame:deathFrame},
    {phase:'RESPAWN',state:respawn,frame:respawnFrame}]};
  writeFileSync(resolve(OUTPUT,'w10b15-trusted-input.json'),
   JSON.stringify(out,null,2));
  console.log('T21_W10B15_REAL_INPUT_PASS',JSON.stringify(out));

  // W10-B18: unlike the paused-state Q wiring check above, prove actual
  // camera displacement while real PlayCanvas renders and Rapier ticks run.
  // Both screenshots use the same ORIGINAL scene; no CPU re-placement.
  const resumed=await evaluate('window.__t21F3.resume()');
  if(resumed.stopReason||resumed.sourceScoreablePromotions!==0)
   reject('W10B18_LIVE_CAMERA_RESUME_HOLD_'+JSON.stringify(resumed));
  await mouse('mousePressed');await mouse('mouseReleased');
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")'),15000);
  const base=await waitUntil(async()=>{
   const a=await evaluate('window.__t21F3.snapshot()');
   if(a.stopReason)reject('W10B18_LIVE_CAMERA_STOP_'+a.stopReason);
   return a.tick>=resumed.tick+12?a:false;
  },70000);
  if(base.cameraSourcePractice.shoulderSide!=='RIGHT'||
     !Number.isFinite(base.cameraSourcePractice.currentCameraDistanceMeters)||
     base.cameraSourcePractice.cameraRaycasts<1)
   reject('W10B18_REAL_CAMERA_NOT_RENDERING_'+JSON.stringify(base.cameraSourcePractice));
  const rightShot=await screenshot('W10B18_0_RIGHT_SHOULDER_LIVE');
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  const leftReal=await waitUntil(async()=>{
   const a=await evaluate('window.__t21F3.snapshot()');
   if(a.stopReason)reject('W10B18_LEFT_SHOULDER_SOURCE_HOLD_'+a.stopReason);
   return a.cameraSourcePractice.shoulderSide==='LEFT'&&
    a.cameraSourcePractice.shoulderOffsetMeters<-.4&&
    a.tick>=base.tick+10?a:false;
  },70000);
  if(leftReal.sourceScoreablePromotions!==0||
     leftReal.originalSourceSolids!==25||
     leftReal.originalPaintSurfaces!==17||
     leftReal.originalSourceNavigationLinks!==26)
   reject('W10B18_CAMERA_STAGE_AUTHORITY_DRIFT');
  const leftShot=await screenshot('W10B18_1_LEFT_SHOULDER_LIVE');
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'q',code:'KeyQ',
   windowsVirtualKeyCode:81,nativeVirtualKeyCode:81
  });
  const restored=await waitUntil(async()=>{
   const a=await evaluate('window.__t21F3.snapshot()');
   if(a.stopReason)reject('W10B18_RETURN_SHOULDER_SOURCE_HOLD_'+a.stopReason);
   return a.cameraSourcePractice.shoulderSide==='RIGHT'&&
    a.cameraSourcePractice.shoulderOffsetMeters>.4&&
    a.tick>=leftReal.tick+10?a:false;
  },70000);
  const restoredShot=await screenshot('W10B18_2_RIGHT_SHOULDER_RESTORED');
  if(rightShot.sha256===leftShot.sha256)
   reject('W10B18_REAL_CAMERA_FRAMES_IDENTICAL');
  // Distinguish live callback interval distribution from GPU frame
  // completion and the fixed-step 60Hz simulation. The exact camera
  // raycast delta verifies one original-stage ray per fixed tick PLUS
  // one per visual callback; the redundant pre-tick ray has been removed.
  const cameraCastDelta=restored.cameraSourcePractice.cameraRaycasts-
   base.cameraSourcePractice.cameraRaycasts;
  const callbackDelta=restored.sourceFrameQuality.liveUpdateFrames-
   base.sourceFrameQuality.liveUpdateFrames;
  const fixedTickDelta=restored.tick-base.tick;
  const measured=restored.sourceFrameQuality;
  if(cameraCastDelta!==callbackDelta+fixedTickDelta||
     measured.sampleCount<5||!Number.isFinite(measured.p95Ms)||
     restored.sourceScoreablePromotions!==0)
   reject('W10B19_LIVE_FRAME_OR_REDUNDANT_CAMERA_CAST_'+JSON.stringify({
    cameraCastDelta,callbackDelta,fixedTickDelta,measured
   }));
  console.log('T21_W10B19_REAL_FRAME_AND_CAMERA_CAST_PASS',JSON.stringify({
   metric:measured.metric,sampleCount:measured.sampleCount,
   p50Ms:measured.p50Ms,p95Ms:measured.p95Ms,p99Ms:measured.p99Ms,
   cameraCastDelta,callbackDelta,fixedTickDelta,
   legacyExtraCameraCastsAvoided:callbackDelta,
   notGpuTime:true,notOwnerWindowsRtxFps:true
  }));
  const cameraResult={
   status:'PASS_REAL_CHROME_LIVE_CAMERA_SHOULDER',
   actualBrowserWebgl2:true,realPlayerPointerLock:true,
   realFixedPhysicsTicks:restored.tick-base.tick,
   initialRightMeters:base.cameraSourcePractice.shoulderOffsetMeters,
   liveLeftMeters:leftReal.cameraSourcePractice.shoulderOffsetMeters,
   restoredRightMeters:restored.cameraSourcePractice.shoulderOffsetMeters,
   originalStageSolids:restored.originalSourceSolids,
   sourceScoreablePromotions:restored.sourceScoreablePromotions,
   physicalCpuRelocations:0,productionAuthorized:false,
   sourceFrameQuality:measured,
   cameraCastDelta,callbackDelta,fixedTickDelta,
   legacyExtraCameraCastsAvoided:callbackDelta,
   quickTapAcceptedShots:quickAfter.shotsFired-quickBefore.shotsFired,
   rightShot,leftShot,restoredShot
  };
  writeFileSync(resolve(OUTPUT,'w10b18-real-chrome-camera.json'),
   JSON.stringify(cameraResult,null,2));
  console.log('T21_W10B18_LIVE_CAMERA_SHOULDER_PASS',
   JSON.stringify(cameraResult));
  return;
 }
 if(w10b14){
  const stages=[];
  const verify=(a,phase)=>{
   if(a.stopReason||a.sourceSolids!==25||a.sourcePaint!==17||
      a.sourceLinks!==26||a.scoreablePromotions!==0||
      a.activationReady!==false||a.originalEnemySpawnCertified!==false||
      a.naturalEnemyEncounterCertified!==false||
      a.humanRepositionedForIsolatedQa!==true||
      a.cpuRepositionedForIsolatedQa!==true||
      a.realProjectileDamage!==true||a.renderComponentPresent!==true||
      a.renderComponentEnabled!==true)
    reject('W10B14_AUTHORITY_OR_COMPONENT_'+phase+' '+JSON.stringify(a));
   return a;
  };
  const pre=verify(await evaluate(
   'window.__t21F3.startW10B14RenderWitness()'),'INITIAL');
  if(pre.lifeState!=='ACTIVE'||pre.hp!==100||
     pre.entityEnabled!==true||pre.entityEnabledInHierarchy!==true||
     pre.cpuSplats!==0||pre.cpuRespawns!==0)
   reject('W10B14_INITIAL_RENDER_NOT_LIVE_'+JSON.stringify(pre));
  stages.push({phase:'BEFORE_SHOTS',witness:pre,
   frame:await screenshot('W10B14_0_CPU_ACTIVE')});
  const groundAttempt=await evaluate(`(() => {
   try {return {state:window.__t21F3.advanceQaTicks(75)};}
   catch(error){return {error:String(error),
    witness:window.__t21F3.w10B14RenderWitness()};}
  })()`);
  if(groundAttempt.error)reject('W10B14_PHYSICAL_GROUND_HOLD_'+
   JSON.stringify(groundAttempt));
  const ground=groundAttempt.state;
  if(ground.stopReason)reject('W10B14_HUMAN_LANDING_'+ground.stopReason);
  const armAttempt=await evaluate(`(() => {
   try{return window.__t21F3.armW10B14RealProjectiles();}
   catch(error){return {armError:String(error)};}
  })()`);
  if(armAttempt.armError)reject('W10B14_SOURCE_ARM_HOLD_'+JSON.stringify({
   error:armAttempt.armError,player:ground.player,
   cpu:await evaluate('window.__t21F3.w10B14RenderWitness()')
  }));
  const armed=verify(armAttempt,'ARMED');
  if(!armed.armed)reject('W10B14_GENUINE_WEAPON_NOT_ARMED');
  let splat=null;
  for(let n=0;n<15;n++){
   const attempted=await evaluate(`(() => {
    try{return {state:window.__t21F3.advanceQaTicks(12)};}
    catch(error){return {error:String(error),
     witness:window.__t21F3.w10B14RenderWitness()};}
   })()`);
   if(attempted.error)reject('W10B14_PROJECTILE_PHYSICS_HOLD_'+JSON.stringify(attempted));
   const progress=attempted.state;
   if(progress.stopReason)reject('W10B14_PROJECTILE_STOP_'+progress.stopReason);
   const now=verify(await evaluate('window.__t21F3.w10B14RenderWitness()'),
    'SHOOTING');
   if(now.lifeState==='SPLATTED'){splat=now;break;}
  }
  if(!splat||splat.entityEnabled!==false||
     splat.entityEnabledInHierarchy!==false||
     splat.cpuSplats!==1||splat.cpuCombatHits<3||
     splat.shotsFired<3||!splat.firstSplatObserved)
   reject('W10B14_NATIVE_CPU_NOT_SPLATTED_'+JSON.stringify(splat));
  stages.push({phase:'SPLATTED',witness:splat,
   frame:await screenshot('W10B14_1_CPU_SPLATTED')});
  let respawn=null;
  for(let n=0;n<20;n++){
   const attempted=await evaluate(`(() => {
    try{return {state:window.__t21F3.advanceQaTicks(12)};}
    catch(error){return {error:String(error),
     witness:window.__t21F3.w10B14RenderWitness()};}
   })()`);
   if(attempted.error)reject('W10B14_RESPAWN_PHYSICS_HOLD_'+JSON.stringify(attempted));
   const progress=attempted.state;
   if(progress.stopReason)reject('W10B14_RESPAWN_STOP_'+progress.stopReason);
   const now=verify(await evaluate('window.__t21F3.w10B14RenderWitness()'),
    'RESPAWNING');
   if(now.cpuRespawns>=1){respawn=now;break;}
  }
  if(!respawn||respawn.lifeState!=='ACTIVE'||respawn.hp!==100||
     respawn.cpuRespawns!==1||respawn.cpuSplats!==1||
     respawn.entityEnabled!==true||
     respawn.entityEnabledInHierarchy!==true||
     respawn.renderComponentPresent!==true||
     respawn.renderComponentEnabled!==true)
   reject('W10B14_CPU_RENDER_NOT_RESTORED_'+JSON.stringify(respawn));
  stages.push({phase:'RESPAWNED',witness:respawn,
   frame:await screenshot('W10B14_2_CPU_RESPAWNED')});
  const result={status:'PASS_REAL_CHROME_RENDER_COMPONENT_LIFECYCLE',
   actualBrowserWebgl2:true,realPlayerProjectileSystem:true,
   controlledQaPlayerPlacement:true,controlledQaCpuPlacement:true,
   cpuTeleportDuringWitness:true,
   naturalEnemyEncounterCertified:false,
   pixelSilhouetteComparisonCertified:false,
   originalTurfScoringCertified:false,productionAuthorized:false,
   stages};
  writeFileSync(resolve(OUTPUT,'w10b14-actual-browser.json'),
   JSON.stringify(result,null,2));
  console.log('T21_W10B14_CHROME_RENDER_LIFECYCLE',JSON.stringify(result));
  return;
 }
 if(process.env.T21_F3G_EXPECT_WHOLE==='1'){
  const whole=await waitUntil(async()=>{
   const s=await evaluate('window.__t21F3.snapshot().fullSource');
   if(s.status==='ERROR'||s.status==='MISSING')
    reject('T21_F3G_FULL_SOURCE_NOT_DISPLAYED_'+JSON.stringify(s));
   return s.status==='READY'&&s.sourceOriginalTriangles>1500?s:null;
  },65000);
  if(whole.realPhysicsAdded!==0||whole.realNavigationLinksAdded!==0||
     whole.productionAuthorized!==false||whole.sourceOnly!==true)
   reject('T21_F3G_WHOLE_SOURCE_GAME_AUTHORITY_DRIFT_'+JSON.stringify(whole));
  console.log('T21_F3G_LIVE_WHOLE_SOURCE',JSON.stringify(whole));
 }
 const initial=await evaluate('window.__t21F3.snapshot()');
 // W10-B23: never show a synthetic enemy hit or Turf score when
 // no actual HUMAN impact has changed authoritative original ink cells.
 const b23Dom=await evaluate(`(() => {
  const e=document.querySelector('#t21-f3-b23-human-ink-confirmation');
  return {present:!!e,original:e?.dataset.originalSourceOnly,
   authority:e?.dataset.productionAuthority,
   scoreable:e?.dataset.scoreablePromotion,hidden:e?.hidden};
 })()`);
 if(!b23Dom.present||b23Dom.original!=='true'||
    b23Dom.authority!=='NONE'||b23Dom.scoreable!=='0'||
    b23Dom.hidden!==true||
    initial.b23HumanInkFeedback?.humanChangedImpactCount!==0||
    initial.b23HumanInkFeedback?.humanChangedCells!==0||
    initial.b23HumanInkFeedback?.scoreablePromotionCount!==0)
  reject('W10B23_NO_FAKE_HUMAN_IMPACT_OR_SCORE_'+
   JSON.stringify({dom:b23Dom,feedback:initial.b23HumanInkFeedback}));
 if(initial.cpuKitQa?.enabled!==kitQa ||
    initial.cpuKitQa?.artificialGaugeArms!==0 ||
    initial.cpuKitQa?.scoreablePromotions!==0 ||
    initial.cpuKitQa?.normalPlaySpecialsCertified!==false)
  reject('F3_QA_KIT_MODE_OR_AUTHORITY_MISMATCH_'+JSON.stringify(initial.cpuKitQa));
 const radar=await evaluate(`({solid:document.querySelector("#t21-f3-radar-canvas")?.dataset.originalSourceSolids,
  links:document.querySelector("#t21-f3-radar-canvas")?.dataset.originalSourceNavigationLinks,
  actors:document.querySelector("#t21-f3-radar-canvas")?.dataset.nativeActorCount,
  authority:document.querySelector("#t21-f3-radar-canvas")?.dataset.productionAuthority})`);
 if(radar.solid!=='25'||radar.links!=='26'||radar.actors!=='8'||radar.authority!=='NONE')
  reject('ORIGINAL_SOURCE_RADAR_UNAUTHORIZED_'+JSON.stringify(radar));
 if(initial.phase!=='F3'||!initial.playableSandbox||
  (!initial.originalSourceStudyVisible&&process.env.T21_F3G_EXPECT_WHOLE!=='1')||
  initial.originalSourceStudy?.sourceComponents!==108||
  initial.originalSourceStudy?.visualOnlyUnderpassRouteComponents!==8||
  initial.originalSourceStudy?.originalSourceVerticalAdditions!==12||
  initial.originalSourceStudy?.originalSourceEdgeLinerAdditions!==4||
  initial.originalSourceStudy?.unresolvedUnderpassOriginalGapMeters!==31.71622721122581||
  initial.originalSourceStudy?.originalTriangles!==672||
  initial.originalSourceStudy?.skippedUnplacedActorComponents!==8||
  initial.originalSourceStudy?.addedPhysicalSolids!==0||
  initial.originalSourceStudy?.addedNavigationLinks!==0||
  initial.originalSourceOpticalStructures!==38||
  !(initial.originalSourceOpticalTriangles>200)||
  initial.productionAuthorized!==false||
  initial.visualFreezeApproved!==false||
  initial.sourceScoreablePromotions!==0||
  initial.originalSourceSolids!==25||
  initial.originalPaintSurfaces!==17||
  initial.originalSourceNavigationLinks!==26||
  initial.cpu.originalSourceLinksUsed!==8||
  initial.unrestricted4v4Certified!==false)
  reject('SOURCE_AUTHORITY_OR_STARTUP_DRIFT_'+JSON.stringify(initial));
 const frames=[await screenshot('F3_0_SOURCE_STAGE')];
 if(process.env.T21_F3I_EXPECT_ENV==='1'){
  const candidate=await evaluate('window.__t21F3.snapshot().environmentF3i');
  if(candidate.status!=='READY'||candidate.stageCoordinatesVerified!==false||
     candidate.actorPlacementsVerified!==false||candidate.stageSolidsAdded!==0||
     candidate.productionAuthorized!==false||candidate.sourceOnly!==true||
     candidate.unplacedActorObjects<1)
   reject('F3I_SOURCE_ENVIRONMENT_AUTHORITY_GATE_'+JSON.stringify(candidate));
  console.log('F3I_REAL_CHROME_ENVIRONMENT',JSON.stringify(candidate));
  if(candidate.candidateTriangles>0){
   if(candidate.visible!==true)
    reject('F3J_SCENIC_SOURCE_DEFAULT_NOT_VISIBLE');
   if(candidate.sourceAssetFamilies<1||
      candidate.topSourceAssetFamilies.length<1)
    reject('F3J_MACRO_FAMILY_LEDGER_MISSING');
   await sleep(300);
   frames.push(await screenshot('F3J_SCENIC_SOURCE_DEFAULT'));
   const hidden=await evaluate(`(() => {
    document.querySelector('#t21-f3i-environment')?.click();
    return window.__t21F3.snapshot();
   })()`);
   if(hidden.environmentF3i.visible||hidden.originalSourceSolids!==25||
      hidden.sourceScoreablePromotions!==0||
      hidden.originalSourceNavigationLinks!==26)
    reject('F3J_BACKGROUND_RENDER_AUTHORITY_CHANGED_'+JSON.stringify(hidden));
   frames.push(await screenshot('F3J_SCENIC_SOURCE_HIDDEN_COMPARE'));
   const shown=await evaluate(`(() => {
    document.querySelector('#t21-f3i-environment')?.click();
    return window.__t21F3.snapshot().environmentF3i.visible;
   })()`);
   if(shown!==true)reject('F3J_BACKGROUND_FAILED_TO_RESTORE');
  }
 }
 if(process.env.T21_F3L_EXPECT_TEXTURES==='1'){
  const ready=await waitUntil(async()=>{
   const t=await evaluate('window.__t21F3.snapshot().texturedSourceF3l');
   if(t.status==='ERROR')reject('F3L_TEXTURED_SOURCE_LOAD_FAILED_'+t.sourceError);
   return t.status==='READY'&&t.totalOriginalTriangles===57578?t:null;
  },120000);
  if(ready.sourceUVOnly!==true||ready.physicsSolidsAdded!==0||
     ready.scoreableSurfacesAdded!==0||ready.instanceMatricesRecovered!==false||
     ready.productionAuthorized!==false||ready.verifiedTextures<8||
     ready.materialGroups<10)
   reject('F3L_TEXTURED_SOURCE_PARITY_OR_AUTHORITY_DRIFT_'+JSON.stringify(ready));
  const before=await evaluate('window.__t21F3.snapshot()');
  if(before.b29VerifiedSourcePresentation.selected!=='F3L_ORIGINAL_UV'||
     before.b29VerifiedSourcePresentation.explicitlyRequestedReview!==true||
     before.b29VerifiedSourcePresentation.newGameplayColliders!==0||
     before.b29VerifiedSourcePresentation.newNavigationLinks!==0||
     before.b29VerifiedSourcePresentation.originalSetActorMatricesRecovered!==false||
     !before.texturedSourceF3l.enabled||before.fullSource.enabled||
     before.originalSourceSolids!==25||before.originalPaintSurfaces!==17||
     before.originalSourceNavigationLinks!==26||before.sourceScoreablePromotions!==0)
   reject('W10B29_PINNED_ORIGINAL_UV_DEFAULT_NOT_VERIFIED_'+
    JSON.stringify(before.b29VerifiedSourcePresentation));
  // Freeze normal gameplay and camera; each screenshot is from real WebGL2.
  await evaluate('window.__t21F3.pause()');
  await sleep(450);
  const originalUv=await screenshot('W10B29_A_PINNED_FULL_SOURCE_UV');
  const flat=await evaluate(`(() => {
   document.querySelector('#t21-f3l-textured')?.click();
   return window.__t21F3.snapshot();
  })()`);
  if(flat.texturedSourceF3l.enabled||!flat.fullSource.enabled||
     flat.b29VerifiedSourcePresentation.selected!=='F3G_FLAT'||
     flat.sourceScoreablePromotions!==0)
   reject('W10B29_MANUAL_FLAT_FALLBACK_NOT_VALID');
  await sleep(450);
  const flatImage=await screenshot('W10B29_B_FLAT_SOURCE');
  const restored=await evaluate(`(() => {
   document.querySelector('#t21-f3l-textured')?.click();
   return window.__t21F3.snapshot();
  })()`);
  if(!restored.texturedSourceF3l.enabled||restored.fullSource.enabled||
     restored.b29VerifiedSourcePresentation.selected!=='F3L_ORIGINAL_UV'||
     restored.originalSourceSolids!==25||restored.originalPaintSurfaces!==17||
     restored.originalSourceNavigationLinks!==26||restored.sourceScoreablePromotions!==0)
   reject('W10B29_ORIGINAL_SOURCE_UV_NOT_RESTORED');
  await sleep(450);
  const restoredImage=await screenshot('W10B29_A2_UV_RESTORED');
  if(originalUv.sha256===flatImage.sha256||
     originalUv.sha256!==restoredImage.sha256)
   reject('W10B29_REAL_WEBGL2_PIXEL_REVERSIBILITY_FAILED_'+
    JSON.stringify({originalUv,flatImage,restoredImage}));
  console.log('T21_W10B29_REAL_CHROME_57578_ORIGINAL_UV_DEFAULT_PASS',
   JSON.stringify({verifiedTriangleCount:57578,
    originalTextureCount:ready.verifiedTextures,
    originalUVsha256:originalUv.sha256,flatSha256:flatImage.sha256,
    restoredUVsha256:restoredImage.sha256,
    screenshotRestorationExact:true,sourceOnly:true,
    originalSolids:25,originalPaintSurfaces:17,originalNavLinks:26,
    sourceScoreablePromotions:0,originalActorMatricesRecovered:false,
    productionAuthorized:false}));
  // B30 source material CUTAWAY is purely visual; no new certified
  // floor, route, actor transform, scored Turf or collision. Use genuine
  // Chrome keyboard (Y) to compare the SAME fixed original UV scene.
  const pressCutaway=async()=>{
   await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'y',code:'KeyY',
    windowsVirtualKeyCode:89,nativeVirtualKeyCode:89});
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'y',code:'KeyY',
    windowsVirtualKeyCode:89,nativeVirtualKeyCode:89});
  };
  await pressCutaway();
  const cutaway=await waitUntil(async()=>{
   const q=await evaluate('window.__t21F3.snapshot()');
   return q.b30SourcePhysicalReadability.mode==='SOURCE_CUTAWAY'?q:false;
  },15000);
  if(!cutaway.b30SourcePhysicalReadability.active||
     cutaway.b30SourcePhysicalReadability.newCollision!==0||
     cutaway.b30SourcePhysicalReadability.newNavigation!==0||
     cutaway.b30SourcePhysicalReadability.scoredTurf!==0||
     cutaway.b30SourcePhysicalReadability.playableSourceFootpathsCertified!==false||
     cutaway.b30SourcePhysicalReadability.fullOriginalSourceTriangles!==57578||
     cutaway.originalSourceSolids!==25||
     cutaway.originalPaintSurfaces!==17||
     cutaway.originalSourceNavigationLinks!==26||
     cutaway.sourceScoreablePromotions!==0)
   reject('W10B30_SOURCE_CUTAWAY_HAS_NO_GAMEPLAY_AUTHORITY_'+
    JSON.stringify(cutaway.b30SourcePhysicalReadability));
  await sleep(450);
  const ghostImage=await screenshot('W10B30_B_SOURCE_CUTAWAY_ACTUAL_FOOT_READABILITY');
  await pressCutaway();
  const uvBack=await waitUntil(async()=>{
   const q=await evaluate('window.__t21F3.snapshot()');
   return q.b30SourcePhysicalReadability.mode==='ORIGINAL_UV'?q:false;
  },15000);
  if(!uvBack.b30SourcePhysicalReadability.active||
     uvBack.tick!==cutaway.tick||
     JSON.stringify(uvBack.player.position)!==JSON.stringify(cutaway.player.position))
   reject('W10B30_PAUSED_PHYSICAL_STATE_CHANGED');
  await sleep(450);
  const returnedUv=await screenshot('W10B30_A2_ORIGINAL_UV_RESTORED');
  if(originalUv.sha256===ghostImage.sha256||
     originalUv.sha256!==returnedUv.sha256)
   reject('W10B30_CHROME_CUTAWAY_NOT_VISUALLY_DISTINCT_AND_REVERSIBLE_'+
    JSON.stringify({originalUv,ghostImage,returnedUv}));
  console.log('T21_W10B30_REAL_CHROME_ORIGINAL_UV_CUTAWAY_UV_PASS',
   JSON.stringify({originalTriangles:57578,sourceOnly:true,
    originalUVsha256:originalUv.sha256,
    cutawaySha256:ghostImage.sha256,
    restoredSha256:returnedUv.sha256,restoredIdentical:true,
    certifiedSolids:25,paintable:17,navLinks:26,
    sourceScoreablePromotion:0,actorTransformsRecovered:false,
    nativeFootpathAdded:false,realGpuBenchmark:false}));
  // Resume full source human+CPU game after screenshot-only frozen compare.
  const resumed=await evaluate('window.__t21F3.resume()');
  if(resumed.paused||resumed.stopReason||
     resumed.originalSourceSolids!==25||resumed.sourceScoreablePromotions!==0)
   reject('W10B29_FROZEN_SOURCE_REVIEW_FAILED_TO_RESUME');
 }
 if(process.env.T21_F3K_EXPECT_GALLERY==='1'){
  const available=await waitUntil(async()=>{
   const g=await evaluate('window.__t21F3.snapshot().sourceGalleryF3k');
   if(g.status==='ERROR')reject('F3K_GALLERY_LOAD_ERROR_'+g.error);
   return g.status==='READY'&&g.totalFamilies===8?g:null;
  },60000);
  if(available.productionAuthorized||available.instanceMatricesRecovered||
     available.realPhysicsAdded!==0||available.originalActorPlacements!==0)
   reject('F3K_UNTRUSTED_STAGE_AUTHORITY');
  for(let i=0;i<2;i++){
   const selected=await evaluate(`(() => {
    document.querySelector('#t21-f3k-gallery')?.click();
    return window.__t21F3.snapshot();
   })()`);
   if(selected.sourceGalleryF3k.selection!==i||
      !selected.paused||selected.originalSourceSolids!==25||
      selected.originalSourceNavigationLinks!==26||
      selected.sourceScoreablePromotions!==0||
      selected.sourceGalleryF3k.productionAuthorized!==false)
    reject('F3K_SOURCE_GALLERY_CHANGED_GAMEPLAY_'+JSON.stringify(selected));
   await sleep(180);
   frames.push(await screenshot('F3K_SOURCE_GALLERY_'+i));
  }
  for(let i=2;i<=8;i++)await evaluate(`document.querySelector('#t21-f3k-gallery')?.click()`);
  const end=await evaluate('window.__t21F3.snapshot()');
  if(end.sourceGalleryF3k.selection!==-1||end.paused!==initial.paused||
     end.originalSourceSolids!==25||end.originalSourceNavigationLinks!==26||
     end.sourceScoreablePromotions!==0)
   reject('F3K_GALLERY_NOT_RETURNED_TO_PLAYER_'+JSON.stringify(end));
 }
 // These camera-only stage survey frames are a direct inspection of
 // genuine original 3D architecture; no game foot, collider or nav moves.
 for(let n=0;n<6;n++){
  const state=await evaluate(`(() => {
    document.querySelector('#t21-f3-source-survey')?.click();
    return window.__t21F3.snapshot();
   })()`);
  if(!state.sourceSurvey?.active||
     state.sourceSurvey.physicalActorRelocations!==0||
     state.originalSourceSolids!==25||
     state.originalSourceStudy.sourceComponents!==108)
   reject('T21_F3E_SURVEY_CAMERA_AUTHORITY_UNSAFE_'+JSON.stringify(state));
  if(n===0||n===3||n===4||n===5){
   await sleep(160);
   frames.push(await screenshot(n===0?'F3E_SOURCE_CENTER_OVERVIEW':
    n===3?'F3E_SOURCE_HIGH_TOPDOWN':
    n===4?'F3F_UNBOUND_UNDERPASS_A':'F3F_UNBOUND_UNDERPASS_B'));
  }
 }
 const returned=await evaluate(`(() => {
  document.querySelector('#t21-f3-source-survey')?.click();
  return window.__t21F3.snapshot();
 })()`);
 if(returned.sourceSurvey?.active||returned.sourceSurvey.view!=='PLAYER'||
    returned.sourceSurvey.physicalActorRelocations!==0)
  reject('T21_F3E_CAMERA_DID_NOT_RETURN_TO_PLAYER');
 await waitUntil(async()=>{
  const s=await evaluate('window.__t21F3.snapshot()');
  if(s.stopReason)reject('PREINPUT_FAIL_CLOSED_'+s.stopReason);
  return s.tick>40?s:false;
 },25000);
 const cpuFootAudit=await evaluate(`({
  continuity:window.__t21F3.snapshot().cpuContinuity,
  visible:document.querySelector('#t21-f3-live')?.textContent?.includes('ACTUAL CPU FOOT')||false
 })`);
 if(cpuFootAudit.continuity?.source!=='ACTUAL_CPU_FOOT_QA_ONLY'||
    !Array.isArray(cpuFootAudit.continuity.actors)||
    cpuFootAudit.continuity.actors.length!==7||
    !Number.isFinite(cpuFootAudit.continuity.longestStallSeconds)||
    !Number.isSafeInteger(cpuFootAudit.continuity.suspectedStallCount)||
    cpuFootAudit.continuity.suspectedStallCount<0||
    !cpuFootAudit.visible)
  reject('CPU_FOOT_QA_NOT_LIVE_IN_REAL_CHROME_'+JSON.stringify(cpuFootAudit));
 console.log('T21_F3_ACTUAL_CPU_FOOT_MONITOR',JSON.stringify({
  source:cpuFootAudit.continuity.source,
  actors:cpuFootAudit.continuity.actors.length,
  suspectedStalls:cpuFootAudit.continuity.suspectedStallCount,
  peakSeconds:cpuFootAudit.continuity.longestStallSeconds,
  statusVisible:cpuFootAudit.visible
 }));
 await mouse('mousePressed');await mouse('mouseReleased');
 const locked=await waitUntil(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),12000);
 if(!locked)reject('MOUSE_LOCK_MISSING');
 const before=await evaluate('window.__t21F3.snapshot()');
 // Headless SwiftShader can stall rendering for more than a wall-clock
 // second. Assert at least 25 REAL simulation ticks while the trusted
 // keyboard key remains pressed; never claim movement failure on 0 ticks.
 await key('keyDown');
 const after=await waitUntil(async()=>{
  const state=await evaluate('window.__t21F3.snapshot()');
  if(state.stopReason)reject('MOVEMENT_SAFE_STOP_'+state.stopReason);
  return state.tick>=before.tick+25?state:false;
 },70000);
 await key('keyUp');
 const move=Math.hypot(...after.player.position.map((v,i)=>v-before.player.position[i]));
 if(move<.18||move>10||after.stopReason)
  reject('REAL_KEYBOARD_PLAYER_MOVEMENT_FAILED_'+JSON.stringify({
   move,simulatedTicks:after.tick-before.tick,after
  }));
 await mouse('mousePressed');
 const fired=await waitUntil(async()=>{
  const state=await evaluate('window.__t21F3.snapshot()');
  if(state.stopReason)reject('PROJECTILE_SAFE_STOP_'+state.stopReason);
  return state.tick>=after.tick+30?state:false;
 },70000);
 await mouse('mouseReleased');
 if(fired.shotsFired<=after.shotsFired||fired.stopReason)
  reject('REAL_MOUSE_PROJECTILE_OR_PHYSICS_FAILED_'+JSON.stringify({
   before:after.shotsFired,after:fired.shotsFired,reason:fired.stopReason
  }));
 // Read-only native signal: count ACTUAL human-authoritative ink, not
 // click count, CPU paint, fake collision or scoreable area.
 const b23=fired.b23HumanInkFeedback;
 if(!b23||b23.source!=='REAL_HUMAN_ORIGINAL_PAINT_EVENT'||
    b23.scoreablePromotionCount!==0||
    b23.originalSourceOnly!==true||
    !Number.isSafeInteger(b23.humanChangedImpactCount)||
    !Number.isSafeInteger(b23.humanChangedCells))
  reject('W10B23_HUMAN_PAINT_PROVENANCE_INVALID_'+JSON.stringify(b23));
 console.log('T21_W10B23_NATIVE_HUMAN_INK_PROVENANCE',JSON.stringify({
  acceptedShots:fired.shotsFired,realHumanChangedImpacts:b23.humanChangedImpactCount,
  actualChangedCells:b23.humanChangedCells,
  noCpuConflation:true,noInventedTurfScore:true
 }));
 frames.push(await screenshot('F3_1_REAL_INPUT_AND_INK'));
 // Full playable preview: unlike short input-only smoke, hold the REAL
 // render-driven 60Hz timeline until all seven native source CPU drops
 // rejoin. Every tick is generated by the real PlayCanvas update callback,
 // not an artificial instantaneous state setter or hidden CPU teleport.
 let completed=fired;
 if(longCpu){
  // In the input smoke, W moves the HUMAN into A3's authentic narrow
  // original-source departure lane. Collision must NOT be disabled to
  // artificially force A3 through a stationary real player. Retreat on
  // ACTUAL physical keyboard input before the full seven-CPU clearance
  // proof, recording both motions to distinguish human-obstructed traffic.
  const blockedHuman=process.env.T21_F3_BLOCKED_HUMAN==='1';
  if(!blockedHuman){
  const retreatFrom=await evaluate('window.__t21F3.snapshot()');
  const retreatKey={key:'s',code:'KeyS',
   windowsVirtualKeyCode:83,nativeVirtualKeyCode:83};
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...retreatKey});
  const retreat=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   if(state.stopReason)reject('HUMAN_RETREAT_UNSAFE_'+state.stopReason);
   return state.tick>=retreatFrom.tick+38?state:false;
  },70000);
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...retreatKey});
  const retreatMeters=Math.hypot(...retreat.player.position.map((v,i)=>
   v-retreatFrom.player.position[i]));
  const a3Start=[-.8030697107315063,67.07270050048828];
  const separation=Math.hypot(retreat.player.position[0]-a3Start[0],
   retreat.player.position[2]-a3Start[1]);
  if(retreatMeters<1.5||separation<1.6)
   reject('REAL_PLAYER_STILL_BLOCKS_SOURCE_CPU_LANE_'+JSON.stringify({
    retreatMeters,separation,retreat
   }));
  console.log('T21_F3B_REAL_PLAYER_CLEARS_SOURCE_LANE',JSON.stringify({
   retreatMeters,separation,retreatTick:retreat.tick,
   physicalSourceOnly:true
  }));
  }
  console.log('T21_F3C_START_NATIVE',JSON.stringify({
   blockedHuman,player:(await evaluate('window.__t21F3.snapshot()')).player,
   avoidance:(await evaluate('window.__t21F3.snapshot()')).humanCrowd
  }));
  // Browser-driven native fixed-step integrator. Genuine Rapier and Recast
  // physics, but without waiting for software-GPU 60fps rendering.
  await cmd('Input.dispatchKeyEvent',{
   type:'keyDown',key:'Escape',code:'Escape',
   windowsVirtualKeyCode:27,nativeVirtualKeyCode:27
  });
  await cmd('Input.dispatchKeyEvent',{
   type:'keyUp',key:'Escape',code:'Escape',
   windowsVirtualKeyCode:27,nativeVirtualKeyCode:27
  });
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===null'),12000);
  await evaluate('window.__t21F3.pause()');
  for(let batch=0;batch<34;batch++){
   completed=await evaluate('window.__t21F3.advanceQaTicks(72)');
   if(batch%3===0||completed.cpu.physicalRejoins.length===7)
    console.log('T21_F3B_NATIVE_BROWSER_PROGRESS',JSON.stringify({
     tick:completed.tick,physicalDrops:completed.cpu.physicalFirstDrops,
     physicalRejoins:completed.cpu.physicalRejoins,
     perCpu:completed.cpu.cpu,stop:completed.stopReason,
     humanFoot:completed.player.position,avoidance:completed.humanCrowd,
     freeCombat:completed.cpu.freeCombatEnabled
    }));
   if(completed.stopReason)
    reject('NATIVE_F3_COLLISION_OR_NAV_STOP_'+completed.stopReason);
   if(completed.cpu.physicalRejoins.length===7&&
      completed.cpu.freeCombatEnabled)break;
  }
  if(completed.cpu.physicalRejoins.length!==7||
     !completed.cpu.freeCombatEnabled)
   reject('NATIVE_F3_SEVEN_ACTOR_INCOMPLETE_'+JSON.stringify({
    tick:completed.tick,drops:completed.cpu.physicalFirstDrops,
    rejoins:completed.cpu.physicalRejoins,actors:completed.cpu.cpu,
    player:completed.player,avoidance:completed.humanCrowd
   }));
  if(kitQa){
   const armed=await evaluate('window.__t21F3.armCpuKitsQa()');
   if(!armed.armed||!armed.artificial||armed.artificialInk!==true||
      armed.kitEnabled!==true||
      armed.authorizedForNormalScoring!==false)
    reject('F3_MANUAL_KIT_QA_NOT_EXPLICIT_'+JSON.stringify(armed));
   console.log('T21_F3_REAL_KIT_QA_MANUALLY_ARMED',JSON.stringify(armed));
   const sub=await evaluate('window.__t21F3.fireCpuKitQa("SUB")');
   if(!sub.requested||!sub.accepted||sub.actor!=='A2'||
      !sub.manualSourceQa||sub.normalEnemyEncounterVerified!==false)
     reject('F3_REAL_FOOT_MANUAL_SUB_QUEUE_FAILED_'+JSON.stringify(sub));
   for(let n=0;n<3;n++)
     completed=await evaluate('window.__t21F3.advanceQaTicks(72)');
   if(completed.stopReason||completed.cpuKitQa.subProjectilesLaunched<1||
      completed.cpuKitQa.manualSubRequests!==1)
     reject('F3_REAL_SUB_EFFECT_NOT_SPAWNED_'+JSON.stringify({
      kit:completed.cpuKitQa,reason:completed.stopReason
     }));
   const special=await evaluate('window.__t21F3.fireCpuKitQa("SPECIAL")');
   if(!special.requested||!special.accepted||special.actor!=='A2'||
      !special.manualSourceQa||special.normalEnemyEncounterVerified!==false)
     reject('F3_REAL_FOOT_MANUAL_SPECIAL_QUEUE_FAILED_'+JSON.stringify(special));
   completed=await evaluate('window.__t21F3.advanceQaTicks(12)');
   if(completed.stopReason||completed.cpuKitQa.manualSpecialRequests!==1||
      completed.cpuKitQa.specialEffectsExecuted<1||
      completed.cpuKitQa.specialPaintRequestsEnqueued<1)
     reject('F3_REAL_SPECIAL_EFFECT_AND_PAINT_NOT_EXECUTED_'+JSON.stringify({
      kit:completed.cpuKitQa,reason:completed.stopReason
     }));
   console.log('T21_F3_MANUAL_KIT_REAL_EFFECT_PASS',JSON.stringify({
      actor:'A2',realFoot:true,artificialGauge:true,artificialInk:true,
      executedSpecials:completed.cpuKitQa.specialEffectsExecuted,
      launchedSubs:completed.cpuKitQa.subProjectilesLaunched,
      enqueuedSpecialPaint:completed.cpuKitQa.specialPaintRequestsEnqueued,
      autonomousEnemyCombatCertified:false,
      scoreablePromotions:completed.sourceScoreablePromotions,
      realOriginalSourceSolids:completed.originalSourceSolids
   }));
  }
  for(let i=0;i<6;i++)completed=await evaluate('window.__t21F3.advanceQaTicks(72)');
  if(kitQa){
   const report=completed.cpuKitQa;
   if(!report?.enabled||report.artificialGaugeArms!==1||
      report.artificialInkRefills!==1||
      report.manualSubRequests!==1||report.manualSpecialRequests!==1||
      report.subProjectilesLaunched<1||report.specialEffectsExecuted<1||
      report.specialPaintRequestsEnqueued<1||
      report.autonomousEncounterVerified!==false||
      report.scoreablePromotions!==0||
      !Number.isSafeInteger(report.cpuSpecialActivations)||
      report.cpuSpecialActivations<0||
      !Number.isSafeInteger(report.cpuSubUses)||report.cpuSubUses<0||
      completed.stopReason||
      completed.originalSourceSolids!==25||
      completed.originalPaintSurfaces!==17||
      completed.originalSourceNavigationLinks!==26)
    reject('F3_REAL_CPU_KIT_ACCOUNTING_OR_STAGE_DRIFT_'+JSON.stringify({
      kit:report,stop:completed.stopReason,
      solids:completed.originalSourceSolids,
      paintSurfaces:completed.originalPaintSurfaces,
      nav:completed.originalSourceNavigationLinks
    }));
   console.log('T21_F3_REAL_CPU_KIT_QA_EVIDENCE',JSON.stringify(report));
  }
  if(w10b16){
   const checkpoints=[];
   for(let batch=1;batch<=15;batch++){
    completed=await evaluate('window.__t21F3.advanceQaTicks(72)');
    if(completed.stopReason||completed.sourceGeometryChanged||
       completed.sourceScoreablePromotions!==0||
       completed.cpu.physicalFootRelocations!==0||
       completed.cpu.physicalRejoins.length!==7||
       completed.originalSourceSolids!==25||
       completed.originalPaintSurfaces!==17||
       completed.originalSourceNavigationLinks!==26)
     reject('W10B16_AUTHORITY_OR_PHYSICAL_CONTINUITY_DRIFT_'+
      JSON.stringify({batch,stop:completed.stopReason,cpu:completed.cpu}));
    if(batch%5===0){
     checkpoints.push({tick:completed.tick,
      perCpu:completed.cpu.cpu.map(({id,physicalFoot,mobilityState})=>({
       id,realPhysicalFoot:physicalFoot,mobilityState})),
      originalSourceShots:completed.cpuSourceTurfShots,
      originalPaintHits:completed.cpuProjectilePaintHits,
      actualInkCellsChanged:completed.cpuInkCellsChanged,
      sourcePatrol:completed.cpu.sourcePatrol});
    }
   }
   const hud=await evaluate(`(() => {
    const e=document.querySelector('#t21-f3-practice-hud');
    const d=document.querySelector('#t21-f3-diagnostics');
    return {scoreable:e?.dataset.sourceScoreable,
      authority:e?.dataset.productionAuthority,
      cpu:e?.dataset.cpuRecovered,
      shots:e?.dataset.cpuTurfShots,
      text:e?.textContent,collapsed:!d?.open};
   })()`);
   if(hud.scoreable!=='0'||hud.authority!=='NONE'||
      hud.cpu!=='7'||hud.shots!==String(completed.cpuSourceTurfShots)||
      !hud.text.includes('NO OFFICIAL RESULT')||!hud.collapsed)
    reject('W10B17_NATIVE_PATROL_HUD_DRIFT_'+JSON.stringify(hud));
   const audit=await evaluate('window.__t21F3.auditW10B16NaturalEnemyAccess()');
   const properPairInventory=audit.pairCount===12&&audit.cpuA.length===3&&
    audit.cpuB.length===4;
   const turfShotCounts=Object.values(audit.cpuSourceTurfShotsByActor||{});
   if(!properPairInventory||audit.syntheticCombatantPlacements!==0||
      audit.physicalActorTeleports!==0||
      audit.originalSourceSolids!==25||
      audit.originalPaintSurfaces!==17||audit.originalNavLinks!==26||
      audit.sourceScoreablePromotions!==0||
      audit.productionAuthorized!==false||
      audit.realEnemyEngagementCertified!==false||
      audit.nativePathIsNotPhysicalKccCertification!==true||
      audit.sourcePatrol.travelMeters<5||
      audit.sourcePatrol.realGoalRequests<7||
      !Number.isFinite(audit.shortestCrossTeamDistanceMeters)||
      audit.naturalCpuSourceTurfShots<1||
      audit.nativeCpuTurfInkImpacts<1||
      audit.inkCellsChanged<1||
      turfShotCounts.reduce((sum,n)=>sum+n,0)!==audit.naturalCpuSourceTurfShots)
     reject('W10B16_NATIVE_AI_ORIGINAL_TURF_NOT_LIVE_'+JSON.stringify(audit));
   if(audit.credibleNativeEndpointPairs===0&&
      audit.status!=='HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH')
     reject('W10B16_NO_PATH_MISCLASSIFIED_'+JSON.stringify(audit));
   if(audit.credibleNativeEndpointPairs>0&&
      audit.status!=='HOLD_NATIVE_ROUTE_REQUIRES_ORIGINAL_KCC_AND_ACTOR_EVIDENCE')
     reject('W10B16_UNPROVEN_PATH_MISCLASSIFIED_'+JSON.stringify(audit));
   const report={
    phase:'W10-B16',status:'PASS_REAL_NATIVE_CPU_AUTONOMOUS_PATROL_AND_SOURCE_TURF',
    naturalCrossTeamMatchStatus:audit.status,
    realCpuOpponentEngagementCertified:false,
    exactSourceCpuSpawnsPreserved:true,
    userControlledHumanRepositionedForSourceLane:false,
    noCombatTargetTeleport:true,
    naturalSessionUsesRapierAndRecast:true,
    browserFixedTickQa:true,
    realOriginalStageOnly:true,
    checkpoints,audit};
   const frame=await screenshot('W10B16_REAL_SEVEN_CPU_NATURAL_PATROL');
   report.frame=frame;
   writeFileSync(resolve(OUTPUT,'w10b16-native-autonomous-real-chrome.json'),
    JSON.stringify(report,null,2));
   console.log('T21_W10B16_NATIVE_SOURCE_AUTONOMY',JSON.stringify({
    status:report.status,encounterHold:audit.status,
    nativeA:audit.cpuA,nativeB:audit.cpuB,realPairs:audit.pairCount,
    nativeCrossRoutes:audit.credibleNativeEndpointPairs,
    nearestGap:audit.shortestCrossTeamDistanceMeters,
    realTurfShots:audit.naturalCpuSourceTurfShots,
    actualInkImpacts:audit.nativeCpuTurfInkImpacts,
    cellsChanged:audit.inkCellsChanged,
    sourcePatrolMeters:audit.sourcePatrol.travelMeters,
    oneBrowserRealCpuFootWitness:true,productionAuthorized:false}));
  }
  // The last deterministic QA tick can submit a brush batch before the
  // asynchronous PlayCanvas postrender pass has disabled its camera.
  // Re-snapshot after a REAL Chrome render, never assert the stale
  // pre-render result from advanceQaTicks().
  const settled=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   if(state.stopReason)reject('W10B20_RENDER_STOP_'+state.stopReason);
   const a=state.sourceGpuAtlasStatus;
   return a?.primed&&!a.cameraEnabled&&a.brushRenderFrames>0?state:false;
  },30000);
  const atlas=settled.sourceGpuAtlasStatus;
  if(!atlas||atlas.sourcePreviewOnly!==true||!atlas.primed||
     atlas.atlasTexturePersistent!==true||
     atlas.unchangedScoreAuthority!==true||
     !Number.isSafeInteger(atlas.idlePostRenderFrames)||
     atlas.idlePostRenderFrames<1||
     completed.originalSourceSolids!==25||
     completed.originalPaintSurfaces!==17||
     completed.originalSourceNavigationLinks!==26||
     completed.sourceScoreablePromotions!==0)
   reject('W10B20_SOURCE_IDLE_ATLAS_AUTHORITY_'+JSON.stringify(atlas));
  if(process.env.T21_W10B20_PROFILE==='1'){
   const phases=settled.b20CpuPhaseProfile;
   if(!phases?.enabled||phases.metric!=='CPU_JS_PHASE_WALL_TIME_NOT_GPU_EXECUTION'||
      !phases.phases.rapierAndHumanKcc?.calls||
      !phases.phases.sevenCpuFixed?.calls||
      !phases.phases.aimProjectilesAndKits?.calls||
      !phases.phases.inkOwnershipTick?.calls||
      !phases.phases.playcanvasRenderSubmission?.calls||
      !phases.phases.inkAtlasMeshBuild?.calls)
    reject('W10B20_SOURCE_PROFILE_INCOMPLETE_'+JSON.stringify(phases));
   // The real WebGL2 graphics pass still occurs only when the atlas is
   // first primed, reset, or actually needs to accept a paint batch.
   if(atlas.brushRenderFrames<1||atlas.cameraEnabled)
    reject('W10B20_NATIVE_PAINT_PERSISTENCE_NOT_PROVEN_'+JSON.stringify(atlas));
   const profile={
    status:'PASS_REAL_CHROME_T21_SOURCE_PROFILE',
    environment:'CI_LINUX_HEADLESS_SWIFTSHADER_NOT_OWNER_WINDOWS_GPU',
    atlas,phases,frameQuality:settled.sourceFrameQuality,
    nativePhysicalCpuInkImpacts:completed.cpuProjectilePaintHits,
    scoreablePromotions:completed.sourceScoreablePromotions,
    originalSolids:completed.originalSourceSolids,
    originalPaint:completed.originalPaintSurfaces,
    originalNavigationLinks:completed.originalSourceNavigationLinks,
    crossTeamNaturalPathCertified:false,productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b20-source-cpu-gpu-atlas-profile.json'),
    JSON.stringify(profile,null,2));
   console.log('T21_W10B20_PROFILE_AND_ATLAS_PASS',JSON.stringify(profile));
  }
  const patrol=completed.cpu.sourcePatrol;
  console.log('T21_F3D_NATIVE_PATROL_COMBAT_EVIDENCE',JSON.stringify({
   tick:completed.tick,paint:completed.cpuPaintRequests,
   shots:completed.cpuShots,splats:completed.cpuSplats,
   time:completed.timeRemainingSeconds,
   matchState:completed.matchState,
   patrol,stop:completed.stopReason
  }));
  if(completed.stopReason||completed.matchState!=='PLAYING'||
     completed.cpuPaintRequests<1)
   reject('NATIVE_F3C_CPU_COMBAT_NOT_LIVE_'+JSON.stringify(completed));
  if(kitQa&&
     (completed.cpuSourceTurfShots<1||
      completed.cpuProjectilePaintHits<1||
      completed.cpuImpactInkCellsChanged<1||
      completed.cpuInkCellsChanged<1||
      (completed.cpuSourceTurfShotsByActor?.B4??0)<1||
      Object.values(completed.cpuSourceTurfShotsByActor||{})
       .reduce((sum,n)=>sum+n,0)!==completed.cpuSourceTurfShots||
      completed.cpuShots<1))
    reject('T21_F3_AUTONOMOUS_ORIGINAL_TURF_FIRE_MISSING_'+JSON.stringify({
      cpuShots:completed.cpuShots,
      actualTurfShots:completed.cpuSourceTurfShots,
      nativeSurfacePaintHits:completed.cpuProjectilePaintHits,
      actualPaintCellColorChanges:completed.cpuInkCellsChanged,
      actualImpactInkColorChanges:completed.cpuImpactInkCellsChanged,
      byActor:completed.cpuSourceTurfShotsByActor,
      physicalCpuFeet:completed.cpu.cpu,
      signedSourcePatrol:patrol
    }));
  if(kitQa)console.log('T21_F3_NATIVE_AUTONOMOUS_TURF_PAINT_PASS',JSON.stringify({
    sourceTurfShots:completed.cpuSourceTurfShots,
    nativePhysicalInkImpacts:completed.cpuProjectilePaintHits,
    actualCpuInkColorChanges:completed.cpuInkCellsChanged,
    actualCpuImpactColorChanges:completed.cpuImpactInkCellsChanged,
    perActorShots:completed.cpuSourceTurfShotsByActor,
    allCpuWeaponShots:completed.cpuShots,
    originalSourceSolids:completed.originalSourceSolids,
    nonScoreablePaintSurfaces:completed.originalPaintSurfaces,
    artificialEnemyTargets:0,
    authenticEnemyCombatCertified:false
  }));
  if(!patrol||patrol.auditedTargets<7||patrol.realGoalRequests<7||
     patrol.travelMeters<5||patrol.attemptsToCrossUnboundUnderpass!==0||
     patrol.productionAuthorized!==false)
   reject('T21_F3D_NO_SOURCE_NATIVE_POSTDROP_PATROL_'+JSON.stringify({
    patrol,realFoot:completed.cpu.cpu
   }));
 }
 if(longCpu)frames.push(await screenshot('F3_2_REAL_SEVEN_CPU_FREE_COMBAT'));
 const out={status:'PASS_REAL_CHROME',
  revision:process.env.GITHUB_SHA||'unknown',
  renderer:'webgl2',realKeyboardMeters:move,
  originalSourceSolids:25,scoreablePromotions:0,
  realPlayerShotCount:fired.shotsFired,
  cpuFirstDropCount:completed.cpu.physicalFirstDrops.length,
  cpuRejoinCount:completed.cpu.physicalRejoins.length,
  realSourceCpuFreeCombat:completed.cpu.freeCombatEnabled,
  nativeBrowserPhysicsQa:longCpu,
  humanBlocksCpuLaneByRealKeyboard:longCpu&&process.env.T21_F3_BLOCKED_HUMAN==='1',
  nativeCpuPaintRequests:longCpu?completed.cpuPaintRequests:undefined,
  nativeCpuShots:longCpu?completed.cpuShots:undefined,
  nativeAutoTurfShots:longCpu?completed.cpuSourceTurfShots:undefined,
  nativeAutoTurfInkImpacts:longCpu?completed.cpuProjectilePaintHits:undefined,
  nativeAutoInkCellsChanged:longCpu?completed.cpuInkCellsChanged:undefined,
  nativeAutoImpactInkCellsChanged:longCpu?completed.cpuImpactInkCellsChanged:undefined,
  nativeAutoShotsByActor:longCpu?completed.cpuSourceTurfShotsByActor:undefined,
  nativePatrolEvidence:longCpu?completed.cpu.sourcePatrol:undefined,
  perCpuNativeFootEvidence:longCpu?completed.cpu.cpu:undefined,
  fullSevenCpuChromeTestRequested:longCpu,
  cpuKitQaEvidence:kitQa?completed.cpuKitQa:{enabled:false,artificialGaugeArms:0},
  cpuKitNormalGameplayCertified:false,
  cpuChromeCertification:longCpu?'SEVEN_SOURCE_REJOINS':'SHORT_INPUT_ONLY',
  realSourcePhysicalCpuTeleports:completed.cpu.physicalFootRelocations,
  sharedActorCollisionUnrestrictedCertified:false,
  unrestricted4v4Certified:false,
  productionAuthorized:false,frames,
  totalRealTicks:completed.tick};
 writeFileSync(resolve(OUTPUT,'t21-f3-browser-evidence.json'),
  JSON.stringify(out,null,2));
 console.log('T21_F3_REAL_BROWSER_PLAYABLE_PASS',JSON.stringify(out));
}
try{await main();}
catch(err){console.error(err);process.exitCode=1;}
finally{
 socket?.close();
 for(const child of children)child.kill('SIGTERM');
}
