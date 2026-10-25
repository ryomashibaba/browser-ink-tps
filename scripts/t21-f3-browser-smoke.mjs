#!/usr/bin/env node
/** F3 real Chrome WebGL2 + trusted keyboard/mouse + framebuffer smoke.
 * Unlike the 60Hz F2 Vitest, this proves that the opt-in browser scene
 * actually boots and that PlayerInput can move/shoot without source mutation.
 * No T21 release, win/scoring or unrestricted 4v4 certification is implied.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {verifyB77OriginalSourceAbaRaster}
 from './t21-w10b77-source-raster-restore.mjs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {auditB72OwnerStoredRound} from './t21-w10b72-stored-round-witness.mjs';

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
 const w10b38=process.env.T21_W10B38_SUB==='1';
 const w10b36=process.env.T21_W10B36_FOCUS==='1';
 const w10b16=process.env.T21_W10B16_NATURAL_AI==='1';
 const w10b50=process.env.T21_W10B50_LANE_ONLY==='1';
 const w10b56=process.env.T21_W10B56_SWITCHBACK==='1';
 const w10b57=process.env.T21_W10B57_PAINT_RELAY==='1';
 const w10b59=process.env.T21_W10B59_FULL_NATIVE_SESSION==='1';
 const b172Active=process.env.T21_B172_ACTIVE_180S==='1';
 const w10b69=process.env.T21_W10B69_ONE_CLICK_PREVIEW==='1';
 const w10b70=process.env.T21_W10B70_REAL_OWNER_STORAGE==='1';
 const w10b68Mode=process.env.T21_W10B68_NORMAL_PREVIEW_AIM??'';
 const w10b68=w10b68Mode==='FIXED'||w10b68Mode==='SWEEP';
 if(w10b68Mode&&!w10b68)
  reject('B68_NORMAL_PREVIEW_MODE_MUST_BE_FIXED_OR_SWEEP');
 if(b172Active&&(!w10b59||w10b68))
  reject('B172_ONLY_REAL_180S_FIXED_SOURCE_SESSION');
 if(w10b68&&!w10b59)
  reject('B68_NEEDS_REAL_180S_NATIVE_SESSION_DRIVER');
 if(w10b70&&(!w10b59||w10b68Mode!=='FIXED'))
  reject('B70_REQUIRES_NORMAL_FIXED_180S_OWNER_PREVIEW');
 const w10b64Mode=process.env.T21_W10B64_SOURCE_INK_AIM??'';
 const w10b64=w10b64Mode==='FIXED'||w10b64Mode==='SWEEP';
 if(w10b64Mode&&!w10b64)reject('B64_UNKNOWN_SOURCE_LAB_MODE');
 if(w10b68&&w10b64)reject('B68_NO_MIXED_QA_EXPERIMENT_MODE');
 if([w10b56,w10b57,w10b59].filter(Boolean).length>1)
  reject('B56_B57_B59_EXCLUSIVE_NATIVE_TRIALS');
 const w10b54=process.env.T21_W10B54_FULL_PRACTICE==='1'||w10b56||w10b57;
 if(w10b54&&(process.env.T21_W10B35_NATIVE==='1'||w10b50))
  reject('W10B54_MUST_USE_FIXED_NATIVE_SOURCE');
 const w10b51=process.env.T21_W10B51_EXACT_S_TICKS==='1';
 const b51Ticks=Number(process.env.T21_W10B51_S_TICKS);
 if(w10b51&&(!w10b16||w10b50||process.env.T21_W10B35_NATIVE==='1'||![38,42].includes(b51Ticks)))
  reject('W10B51_REQUIRES_SOURCE_FIXED_AND_38_OR_42_TICKS');
 if(w10b50&&(!w10b16||process.env.T21_W10B35_NATIVE==='1'||
   process.env.T21_F3_BLOCKED_HUMAN==='1'))
  reject('W10B50_NEEDS_DEFAULT_SOURCE_FIXED_CPU_UNBLOCKED');
 const w10b21=process.env.T21_W10B21_RENDER_AB==='1';
 if([w10b14,w10b15,w10b16,w10b21,w10b54,w10b59,w10b64,w10b69].filter(Boolean).length>1)
  reject('CONFLICTING_QA_MODES');
 const kitQa=process.env.T21_F3_CPU_KITS_QA==='1';
 const longCpu=process.env.T21_F3_LONG_CPU==='1'||kitQa||w10b16;
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'+
  ((w10b14||w10b15||w10b21)?'&t21QaDrive=source&t21QaInput=deterministic&'+
   't21KccAudit=readOnly&t21QaPauseOnBoot=1&t21W10B14=render'+
   (w10b15?'&t21W10B15=trustedMouse':''):'')+
  (longCpu||w10b54||(w10b59&&!w10b68)||w10b64?'&t21QaDrive=source':'')+
  (b172Active?'&t21W10B112=humanGround':'')+
  (w10b68Mode==='SWEEP'?'&t21W10B68=previewSweep':'')+
  (kitQa?'&t21CpuKits=qa':'')+
  (w10b51?'&t21W10B51=exactInputTicks':'')+
  (w10b16?'&t21W10B16=sourceAutonomy'+(process.env.T21_W10B31_INK_AWARE==='1'?'&t21W10B31=inkGoals':'')+(process.env.T21_W10B33_STABLE==='1'?'&t21W10B33=stableGoals':'')+
   (process.env.T21_W10B34_STALL==='1'?'&t21W10B34=stallRecovery':'')+
   (process.env.T21_W10B35_NATIVE==='1'?'&t21W10B35=nativeTargetRefresh':''):'')+
  (w10b21?'&t21W10B21=renderAB&t21W10B26=smartVisibility&t21W10B27=kinetic':'')+
  (w10b36?'&t21W10B36=playFocus':'')+
  (w10b38?'&t21W10B38=humanSub':'')+
  (process.env.T21_W10B20_PROFILE==='1'?'&t21W10B20=profile':'')+
  (process.env.T21_F3G_EXPECT_WHOLE==='1'?'&t21FullSource=review':'')+
  (w10b64Mode==='SWEEP'?'&t21W10B64=inkAngleSweep':'')});
 await waitUntil(async()=>{
  const ready=await evaluate(`({
   ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
   renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,
   error:document.querySelector('#boot-error')?.textContent||''
  })`);
  if(ready.error)reject('APP_BOOT '+ready.error.slice(0,1600));
  return ready.ready==='READY'&&ready.renderer==='webgl2';
 },65000);
 if(w10b69){
  // User-visible QA: independent real CDP physical click, not JS
  // mutation of app internals, gameplay mode, actor path or time.
  // This is an ordinary source preview without t21QaDrive=source.
  const get=()=>evaluate(`(() => {
   const c=document.querySelector('#app-canvas');
   const v=window.__t21F3?.snapshot?.();
   const panel=document.querySelector('#t21-f3-b69-aim-review');
   const b=document.querySelector('#t21-f3-b69-switch');
   return v?{
    url:window.location.search,
    ready:c?.dataset.t21F3Ready,
    aimMode:c?.dataset.t21B69ActiveMode,
    defaultPromoted:c?.dataset.t21B69DefaultCpuPromoted,
    panelVisible:!!panel&&!panel.hidden,
    sourceScoreable:panel?.dataset.t21B69OfficialScoreable,
    buttonText:b?.textContent,buttonNext:b?.dataset.t21B69NextMode,
    originalSolids:v.originalSourceSolids,
    originalPaintable:v.originalPaintSurfaces,
    originalLinks:v.originalSourceNavigationLinks,
    scoreable:v.sourceScoreablePromotions,
    productionAuthorized:v.productionAuthorized,
    original4v4Certified:v.unrestricted4v4Certified,
    sweepEnabled:v.b64SourceInkSweep?.enabled,
    tick:v.tick,stopReason:v.stopReason,
    gpuQuality:v.b21RenderProbe?.quality,
    b70UiState:document.querySelector('#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70Stage,
    b70OptIn:document.querySelector('#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70OwnerOptIn,
    b70SaveDisabled:document.querySelector('#t21-f3-b70-save-compare')?.disabled,
    b70Scoreable:document.querySelector('#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70OfficialScoring,
    b70StoragePresent:sessionStorage.getItem('T21_B70_OPT_IN_SOURCE_CPU_AIM_ROUNDS_V1')!==null
   }:null;
  })()`);
  const validate=(v,mode)=>{
   if(!v||v.ready!=='READY'||v.aimMode!==mode||
      v.defaultPromoted!=='false'||!v.panelVisible||
      v.sourceScoreable!=='0'||v.buttonNext!==(mode==='FIXED'?'SWEEP':'FIXED')||
      v.originalSolids!==25||v.originalPaintable!==17||
      v.originalLinks!==26||v.scoreable!==0||
      v.productionAuthorized!==false||v.original4v4Certified!==false||
      v.sweepEnabled!==(mode==='SWEEP')||
      v.gpuQuality!=='NATIVE'||v.stopReason||
      v.b70UiState!=='NOT_FINISHED'||
      v.b70OptIn!=='REQUIRED'||v.b70SaveDisabled!==true||
      v.b70Scoreable!=='0'||v.b70StoragePresent!==false||
      v.url.includes('t21QaDrive=source'))
    reject('B69_UNTRUSTED_NORMAL_PREVIEW_MODE_'+mode+'_'+JSON.stringify(v));
  };
  const click=async()=>{
   const pos=await evaluate(`(() => {
    const b=document.querySelector('#t21-f3-b69-switch');
    const r=b?.getBoundingClientRect();
    return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null;
   })()`);
   if(!pos||pos.x<=0||pos.y<=0||pos.y>=900)
    reject('B69_NO_ACTUAL_VISIBLE_CPU_SWITCH_BUTTON');
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:pos.x,y:pos.y,
    button:'none'});
   await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:pos.x,y:pos.y,
    button:'left',clickCount:1});
   await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:pos.x,y:pos.y,
    button:'left',clickCount:1});
  };
  const before=await get();validate(before,'FIXED');
  const baselineFrame=await screenshot('W10B69_NORMAL_PREVIEW_FIXED_ONE_CLICK_PANEL');
  await click();
  const sweep=await waitUntil(async()=>{
   const v=await get();
   return v?.aimMode==='SWEEP'&&v.ready==='READY'?v:false;
  },85000);
  validate(sweep,'SWEEP');
  if(!sweep.url.includes('t21W10B68=previewSweep'))
   reject('B69_MANUAL_SWEEP_WAS_NOT_EXPLICITLY_OPTED_IN');
  const sweepFrame=await screenshot('W10B69_EXPLICIT_SWEEP_SOURCE_ONLY_PANEL');
  await click();
  const restored=await waitUntil(async()=>{
   const v=await get();
   return v?.aimMode==='FIXED'&&v.ready==='READY'&&!v.url.includes('t21W10B68')?v:false;
  },85000);
  validate(restored,'FIXED');
  const restoredFrame=await screenshot('W10B69_FIXED_RESTORED_BY_REAL_CLICK');
  const proof={
   verdict:'B69_REAL_NORMAL_PREVIEW_OPT_IN_AND_RETURN_SUCCESS',
   actualPhysicalBrowserClicks:2,realPageReloads:2,
   baseline:before,sweep,restored,frameProof:[
    baselineFrame,sweepFrame,restoredFrame],
   normalPreviewCpuDefaultStayedFixed:true,
   originalPhysics25Paintable17Navigation26Scoreable0:true,
   noScoreOrWinnerOrOriginal4v4:true,
   trueOriginalActorPlacementsAuthenticated:false,
   originalCrossTeamRoutesCertified:0,
   ownerWindowsGpuProven:false
  };
  writeFileSync(resolve(OUTPUT,'w10b69-one-click-normal-preview-source-aim.json'),
   JSON.stringify(proof,null,2));
  console.log('T21_W10B69_REAL_PREVIEW_OPT_IN_AND_RETURN',JSON.stringify(proof));
  return;
 }
 if(w10b64){
  // W10-B64: SAME SHA, EXACT original 25/17/26/0 stage, untouched
  // seven FIXED Recast goals; only native source-ground projectile aim
  // candidate search differs for the explicit experimental SWEEP lane.
  // Both FIXED and SWEEP have actual render-driven 60Hz native ticks.
  // Never force native steps, fake CPU projectiles, set paint ownership
  // or claim an original cross-map enemy encounter.
  const get=()=>evaluate('window.__t21F3.snapshot()');
  const boot=await get();
  if(boot.paused||boot.stopReason||boot.matchState!=='STAGING'||
     boot.originalSourceSolids!==25||
     boot.originalPaintSurfaces!==17||
     boot.originalSourceNavigationLinks!==26||
     boot.sourceScoreablePromotions!==0||
     boot.productionAuthorized!==false||
     boot.b64SourceInkSweep?.enabled!==(w10b64Mode==='SWEEP'))
   reject('B64_SOURCE_BOOT_AUTHORITY_OR_MODE_INVALID');
  await mouse('mousePressed');await mouse('mouseReleased');
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")'),12000);
  const initial=await get();
  await key('keyDown');await mouse('mousePressed');
  await waitUntil(async()=>{
   const now=await get();
   if(now.stopReason)reject('B64_REAL_HUMAN_INPUT_SOURCE_STOP_'+now.stopReason);
   return now.tick>=initial.tick+33;
  },90000);
  await mouse('mouseReleased');await key('keyUp');
  const points=[], wallStart=Date.now();
  let lastNativeSample=-1, lastTick=(await get()).tick;
  let lastProgress=Date.now();
  const until=wallStart+48*60*1000;
  let final=null;
  try{
   while(Date.now()<until){
    await sleep(900);
    const x=await get();
    if(x.tick>lastTick){lastTick=x.tick;lastProgress=Date.now();}
    if(Date.now()-lastProgress>4*60*1000)
     reject('B64_NO_ACTUAL_NATIVE_TICK_PROGRESS');
    if(x.stopReason)reject('B64_NATIVE_STOP_'+x.stopReason);
    if(x.originalSourceSolids!==25||
       x.originalPaintSurfaces!==17||
       x.originalSourceNavigationLinks!==26||
       x.sourceScoreablePromotions!==0||
       x.productionAuthorized!==false||
       x.unrestricted4v4Certified!==false||
       x.b64SourceInkSweep?.enabled!==(w10b64Mode==='SWEEP'))
     reject('B64_SOURCE_AUTHORITY_DRIFT');
    if(x.matchState==='TIME_UP')
     reject('B64_EARLY_FULL_MATCH_END_DURING_130S_STUDY');
    const elapsed=180-x.timeRemainingSeconds;
    const sampleIndex=Math.floor(elapsed/20);
    if(x.matchState==='PLAYING'&&sampleIndex>lastNativeSample){
     lastNativeSample=sampleIndex;
     // B66 diagnostic: public QA CPU IDs only, no original Banc actor IDs,
     // poses, source meshes, hidden transforms or serialized world cells.
     const actorShots=x.cpuSourceTurfShotsByActor;
     const actualShotCounts=actorShots&&typeof actorShots==='object'?
      Object.entries(actorShots).sort(([a],[b])=>a.localeCompare(b))
       .map(([,v])=>v):[];
     if(actualShotCounts.length!==7||
        actualShotCounts.some(v=>!Number.isSafeInteger(v)||v<0)||
        actualShotCounts.reduce((total,v)=>total+v,0)!==x.cpuSourceTurfShots)
      reject('B66_PER_CPU_REAL_SOURCE_SHOT_TOTALS_NOT_NATIVE');
     const row={
      trueNativeMatchSeconds:Number(elapsed.toFixed(3)),
      trueSourceShotsBySevenAnonymousCpu:actualShotCounts,
      realPhysicsTick:x.tick,
      allSevenCpuOriginalFootRejoined:x.cpu.physicalRejoins.length,
      realCpuSourceShots:x.cpuSourceTurfShots,
      realCpuChangedSourceInkCells:x.cpuImpactInkCellsChanged,
      genuineHumanShots:x.shotsFired,
      genuineHumanInk:x.b23HumanInkFeedback.humanChangedCells,
      cpuSourcePatrolMeters:x.cpu.sourcePatrol.travelMeters,
      suspectedPhysicalCpuStalls:x.cpuContinuity.suspectedStallCount,
      sourceInkTargetCandidates:x.b64SourceInkSweep.candidateSamples,
      sourceLateralAimsChosen:x.b64SourceInkSweep.lateralPaintTargetsChosen
     };
     points.push(row);
     console.log('T21_W10B64_TRUE_NATIVE_SOURCE_INK_COMPARISON',
      JSON.stringify({mode:w10b64Mode,...row}));
    }
    if(x.matchState==='PLAYING'&&elapsed>=130){
     final=x;break;
    }
   }
  }finally{
   writeFileSync(resolve(OUTPUT,'w10b64-native-'+w10b64Mode+'.json'),
    JSON.stringify({
     mode:w10b64Mode,wallElapsedMs:Date.now()-wallStart,
     truePhysicsUntil130NativeMatchSeconds:!!final,
     officialWinner:'NONE',naturalCrossTeamPathsCertified:0,
     originalStageAuthority:'25/17/26/0',sourceCpuFixedGoals:true,
     experimentalOnly:true,promotedAsNormalCpu:false,
     originalActorInstanceBindingCertified:false,
     points
    },null,2));
  }
  if(!final)reject('B64_REAL_130S_SOURCE_A_B_HOST_TIMEOUT');
  if(final.cpu.physicalRejoins.length!==7||points.length<7||
     final.cpuSourceTurfShots<=0||
     final.b64SourceInkSweep.enabled!==(w10b64Mode==='SWEEP')||
     (w10b64Mode==='FIXED'&&
      final.b64SourceInkSweep.candidateSamples!==0))
   reject('B64_ACTUAL_SAME_SOURCE_A_B_PRECONDITIONS');
  console.log('T21_W10B64_NATIVE_SOURCE_A_B_130S_COMPLETE',JSON.stringify({
   mode:w10b64Mode,realNativeSeconds:180-final.timeRemainingSeconds,
   physicsTick:final.tick,sourceCpuShotCount:final.cpuSourceTurfShots,
   changedOriginalSourceCells:final.cpuImpactInkCellsChanged,
   actualPhysicalCpuRejoins:final.cpu.physicalRejoins.length,
   labSamples:final.b64SourceInkSweep.candidateSamples,
   experimentalNotAdopted:true,original4v4Certified:false
  }));
  return;
 }
 if(w10b59){
  // B59: ONE uninterrupted, actual headless Chrome/WebGL2 source session
  // until the original 180 seconds have elapsed at the REAL fixed 60Hz.
  // No QA time advance, clock patching, artificial actor/spawn or ink.
  const get=()=>evaluate('window.__t21F3.snapshot()');
  const first=await get();
  if(first.paused||first.stopReason||first.matchState!=='STAGING'||
     first.originalSourceSolids!==25||
     first.originalPaintSurfaces!==17||
     first.originalSourceNavigationLinks!==26||
     first.sourceScoreablePromotions!==0||
     first.productionAuthorized!==false)
    reject('B59_UNTRUSTED_SOURCE_NATIVE_BOOT');
  if(w10b68&&(
     first.b64SourceInkSweep?.enabled!==(w10b68Mode==='SWEEP')||
     first.sourceFrameQuality?.verifiedUserRtxFps!==false||
     first.b21RenderProbe?.quality!=='NATIVE'))
   reject('B68_NORMAL_PREVIEW_SOURCE_OR_DEFAULT_QUALITY_INVALID');
  if(w10b68){
   const url=await evaluate('window.location.search');
   if(url.includes('t21QaDrive=source')||
      (w10b68Mode==='FIXED'&&url.includes('t21W10B68'))||
      (w10b68Mode==='SWEEP'&&!url.includes('t21W10B68=previewSweep')))
    reject('B68_NOT_TRUE_NORMAL_PREVIEW_INPUT_CAMERA_MODE');
  }
  await mouse('mousePressed');await mouse('mouseReleased');
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")'),12000);
  const start=await get();
  // Genuine player-driven walk/fire to give the 3-minute laboratory
  // independently measurable human input; not a scripted teleport.
  await key('keyDown');
  await mouse('mousePressed');
  await waitUntil(async()=>{
   const x=await get();
   if(x.stopReason)reject('B59_NATIVE_INPUT_STOP_'+x.stopReason);
   return x.tick>=start.tick+33;
  },90000);
  await mouse('mouseReleased');
  await key('keyUp');
  const played=await get();
  if(played.shotsFired<=start.shotsFired||
     played.b23HumanInkFeedback.humanChangedCells<=
      start.b23HumanInkFeedback.humanChangedCells)
   reject('B59_NO_REAL_ORIGINAL_SOURCE_PLAYER_PAINT');
  const history=[{
   kind:'INITIAL_HUMAN_NATIVE_W_AND_MOUSE',
   tick:played.tick,originalHumanShots:played.shotsFired,
   humanCells:played.b23HumanInkFeedback.humanChangedCells
  }];
  // B172: real human never teleports or skips physics. Native source
  // floor/KCC is re-probed for every real keyboard leg across 180s.
  const activeHumanPairs=[];
  let lastActiveBucket=0;
  const actualOriginalGround=x=>{
   const f=x?.b112OriginalHumanGround,body=x?.player?.position;
   return x?.matchState==='PLAYING'&&!x?.stopReason&&
    x?.player?.hp>0&&Array.isArray(body)&&body.length===3&&
    body.every(Number.isFinite)&&body[1]>=8.1&&body[1]<=9.6&&
    f?.enabled===true&&f?.genuineKccGrounded===true&&
    typeof f?.lastOriginalSourceHitId==='string'&&
    f.lastOriginalSourceHitId.startsWith('UndertowT21D:')&&
    Number.isFinite(f?.lastOriginalSourceGapMeters)&&
    Math.abs(f.lastOriginalSourceGapMeters)<=.22;
  };
  async function realHumanB172Leg(code){
   const before=await get();
   if(!actualOriginalGround(before))
    reject('B172_NATIVE_ORIGINAL_GROUND_MISSING_BEFORE_'+code);
   const params={key:code==='KeyS'?'s':'w',code,
    windowsVirtualKeyCode:code==='KeyS'?83:87,
    nativeVirtualKeyCode:code==='KeyS'?83:87};
   let after=null;
   await cmd('Input.dispatchKeyEvent',{type:'keyDown',...params});
   try{
    await mouse('mousePressed');
    after=await waitUntil(async()=>{
     const n=await get();
     if(n.stopReason)reject('B172_TRUE_PHYSICS_STOP_'+n.stopReason);
     return n.tick>=before.tick+34?n:false;
    },120000);
   }finally{
    await mouse('mouseReleased');
    await cmd('Input.dispatchKeyEvent',{type:'keyUp',...params});
   }
   if(!actualOriginalGround(after))
    reject('B172_LOST_TRUE_KCC_SOURCE_SUPPORT_'+JSON.stringify({
     code,tick:after?.tick,body:after?.player?.position,
     sourceGround:after?.b112OriginalHumanGround?.lastOriginalSourceHitId}));
   const moved=Math.hypot(
    after.player.position[0]-before.player.position[0],
    after.player.position[2]-before.player.position[2]);
   if(moved<.35||moved>3.6||after.shotsFired<=before.shotsFired)
    reject('B172_REAL_KEY_AND_MOUSE_NOT_APPLIED_'+JSON.stringify({
     code,moved,shots:after.shotsFired-before.shotsFired}));
   return {code,startTick:before.tick,endTick:after.tick,
    actualKccMovementMeters:Number(moved.toFixed(3)),
    truePlayerShotDelta:after.shotsFired-before.shotsFired,
    verifiedOriginalSupportId:
     after.b112OriginalHumanGround.lastOriginalSourceHitId,
    actualRapierBody:after.player.position};
  }
  let lastSample=-1;
  const wallStarted=Date.now();
  // B61: Real SwiftShader's 7-CPU GPU/source run measured 80 native
  // PLAYING seconds over about 22 wall minutes in B59. 22m was a
  // BAD QA budget, not evidence of a gameplay 180-second freeze.
  // Reserve up to 62 wall minutes to reach 180 native PLAYING seconds.
  // Never accelerate clocks, skip PlayCanvas renders, or inject ticks.
  const maxWallMs=62*60*1000;
  const deadline=wallStarted+maxWallMs;
  let lastTrueProgressAt=wallStarted,lastTrueTick=played.tick;
  let lastHostHeartbeat=wallStarted,lastProgressWallMs=wallStarted;
  let terminal=null;
  while(Date.now()<deadline){
   await sleep(800);
   const now=await get();
   if(now.tick>lastTrueTick){
    lastTrueTick=now.tick;
    lastTrueProgressAt=Date.now();
   }
   if(Date.now()-lastTrueProgressAt>4*60*1000)
    reject('B61_NATIVE_PHYSICS_TICK_STALLED_FOUR_HOST_MINUTES');
   if(Date.now()-lastHostHeartbeat>=90*1000){
    lastHostHeartbeat=Date.now();
    const heartbeat={
     kind:'B61_REAL_WALL_LIVENESS_HEARTBEAT',
     hostElapsedMinutes:Number(((Date.now()-wallStarted)/60000).toFixed(2)),
     trueNativeTick:now.tick,
     nativeElapsedPlayingSeconds:Number((180-now.timeRemainingSeconds).toFixed(3)),
     currentNativePhase:now.matchState,
     actualCpuSourceShots:now.cpuSourceTurfShots,
     originalStageSolids:now.originalSourceSolids,
     originalStageLinks:now.originalSourceNavigationLinks,
     actualCpuPhysicalRejoins:now.cpu.physicalRejoins.length
    };
    console.log('T21_W10B61_NATIVE_FULL_MATCH_HEARTBEAT',
     JSON.stringify(heartbeat));
   }
   if(now.stopReason)reject('B59_NATIVE_SIMULATION_STOP_'+now.stopReason);
   if(now.originalSourceSolids!==25||
      now.originalPaintSurfaces!==17||
      now.originalSourceNavigationLinks!==26||
      now.sourceScoreablePromotions!==0||
      now.productionAuthorized!==false||
      now.unrestricted4v4Certified!==false)
    reject('B59_SOURCE_AUTHORITY_DRIFT');
   if(now.matchState==='TIME_UP'){
    if(now.timeRemainingSeconds!==0||now.tick<10800)
     reject('B61_FALSE_END_BEFORE_180_NATIVE_SECONDS');
    terminal=now;break;
   }
   const sample=Math.floor((180-now.timeRemainingSeconds)/20);
   if(now.matchState==='PLAYING'&&sample>lastSample){
    lastSample=sample;
    lastProgressWallMs=Date.now();
    const row={kind:'NATIVE_20_SECOND_PROGRESS',tick:now.tick,
     elapsedMatchSeconds:Number((180-now.timeRemainingSeconds).toFixed(2)),
     realHumanShots:now.shotsFired,
     nativeRejoinedCpu:now.cpu.physicalRejoins.length,
     originalCpuShots:now.cpuSourceTurfShots,
     originalCpuInkChanges:now.cpuImpactInkCellsChanged};
    history.push(row);
    if(w10b68){
     const seven=Object.values(now.cpuSourceTurfShotsByActor??{});
     if(seven.length!==7||
        seven.some(v=>!Number.isSafeInteger(v)||v<0)||
        seven.reduce((a,b)=>a+b,0)!==now.cpuSourceTurfShots)
      reject('B68_NATIVE_SEVEN_CPU_SHOTS_MUST_SUM_TO_REAL_SHOTS');
     const detailed={
      ...row,
      realCpuSourcePatrolMeters:now.cpu.sourcePatrol.travelMeters,
      actualSuspectedCpuStalls:now.cpuContinuity.suspectedStallCount,
      realSevenCpuShots:seven,
      nativeAcceptedLateralOriginalPaintAims:
       now.b64SourceInkSweep.lateralPaintTargetsChosen,
      originalPaintCandidateSamples:
       now.b64SourceInkSweep.candidateSamples,
      humanChangedInkCells:now.b23HumanInkFeedback.humanChangedCells,
      sourceRenderCallbackP95Ms:now.sourceFrameQuality.p95Ms,
      outputMode:w10b68Mode
     };
     history[history.length-1]=detailed;
     console.log('T21_W10B68_NORMAL_PREVIEW_REAL_NATIVE_SOURCE',
      JSON.stringify(detailed));
    }
    console.log('T21_W10B59_NATIVE_SESSION_PROGRESS',JSON.stringify(row));
   }
   if(b172Active&&now.matchState==='PLAYING'&&sample>=1&&
      sample<=7&&sample>lastActiveBucket){
    lastActiveBucket=sample;
    // Only previously proven short upper-floor S34/W34 motions.
    // Keeps user participation alive throughout seven distinct moments.
    const legs=[await realHumanB172Leg('KeyS'),
     await realHumanB172Leg('KeyW')];
    const after=await get();
    const witness={kind:'B172_REAL_NATIVE_HUMAN_CPU_SIMULTANEOUS_PLAY',
     nativeTimeBucket20s:sample,trueEndTick:after.tick,
     actualKccKeyboardMouseLegs:legs,
     genuineSevenCpuRejoined:after.cpu.physicalRejoins.length,
     officialScoreable:after.sourceScoreablePromotions,
     officialWinner:'NONE',fakeTimeOrActorMovement:false};
    activeHumanPairs.push(witness);
    history.push(witness);
    writeFileSync(resolve(OUTPUT,'w10b172-genuine-active-180s.json'),
     JSON.stringify({actualNativePlayerSegments:activeHumanPairs,
      sourceAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
      noSyntheticTickOrPaint:true},null,2));
    console.log('B172_REAL_180S_ACTIVE_PLAYER_SOURCE',JSON.stringify(witness));
   }
  }
  // Write the real history EVEN when no success is proven, for diagnosis.
  writeFileSync(resolve(OUTPUT,'w10b59-source-native-history.json'),
   JSON.stringify({history,
    verificationVersion:'W10_B61_TRUE_60HZ_RENDER_DRIVEN_FULL_NATIVE_MATCH',
    earlierB59Failure:'HOST_TEST_BUDGET_22_MINUTES_EXCEEDED_AT_80.08_NATIVE_SECONDS',
    actualWallMs:Date.now()-wallStarted,
    maxWallMs,lastTrueTick,lastTrueProgressAt,
    lastTrueProgressAgeMs:Date.now()-lastTrueProgressAt,
    lastTwentySecondSampleAgeMs:Date.now()-lastProgressWallMs,
    terminal:terminal?{tick:terminal.tick,timeRemainingSeconds:
     terminal.timeRemainingSeconds,matchState:terminal.matchState}:null},null,2));
  if(!terminal)reject('B61_REAL_180S_NATIVE_TIMEUP_NOT_REACHED_WITHIN_62_MIN_HOST');
  const finalUi=await waitUntil(async()=>{
   const ui=await evaluate(`(() => {
    const finish=document.querySelector('#t21-f3-b59-session-finished');
    const restart=finish?.querySelector('#t21-f3-b59-restart');
    const stat=finish?.querySelector('#t21-f3-b59-final-stats');
    const native=window.__t21F3.snapshot();
    return {visible:finish&&!finish.hidden&&finish.style.display==='flex',
      state:finish?.dataset.t21B59State,
      result:finish?.dataset.t21B59OriginalWinner,
      scoreable:finish?.dataset.originalScoreable,
      restartVisible:restart&&!restart.hidden,
      humanInk:Number(finish?.dataset.t21B59HumanInk),
      cpuRejoined:Number(finish?.dataset.t21B59CpuRejoined),
      text:stat?.textContent??'',
      actualHumanInk:native.b23HumanInkFeedback.humanChangedCells,
      actualCpuRejoined:native.cpu.physicalRejoins.length,
      pointerUnlocked:document.pointerLockElement===null,
      paused:native.paused};
   })()`);
   return ui.visible&&ui.state==='FINISHED'&&
    ui.result==='NONE'&&ui.scoreable==='0'&&
    ui.restartVisible&&ui.pointerUnlocked&&ui.paused&&
    ui.humanInk===ui.actualHumanInk&&
    ui.cpuRejoined===ui.actualCpuRejoined&&
    ui.text.includes('HUMAN')?ui:false;
  },30000);
  let b68VisualEvidence=null;
  if(w10b68){
   const evidence=await evaluate(`(() => {
    const f=document.querySelector('#t21-f3-b59-session-finished');
    const graph=document.querySelector('#t21-f3-b63-source-paint-tempo');
    const save=document.querySelector('#t21-f3-b62-save-evidence');
    const n=window.__t21F3.snapshot();
    return {
     ready:f?.dataset.t21B62NativeEvidenceReady,
     chartVisible:!!graph&&!graph.hidden,
     chartStatus:f?.dataset.t21B63TempoState,
     chartRows:Number(f?.dataset.t21B63Windows),
     chartZeroInkPeriods:Number(f?.dataset.t21B63ZeroInkPeriods),
     saveButtonPresent:!!save,
     nativeCpuPhysicalRejoins:n.cpu.physicalRejoins.length,
     physicalCpuSuspectedStalls:n.cpuContinuity.suspectedStallCount,
     cpuPatrolMeters:n.cpu.sourcePatrol.travelMeters,
     sourceCpuShots:n.cpuSourceTurfShots,
     changedOriginalSourceCells:n.cpuImpactInkCellsChanged,
     nativeB64SourceInkAim:n.b64SourceInkSweep.enabled,
     cpuLateralSourceAims:n.b64SourceInkSweep.lateralPaintTargetsChosen,
     nativeFrameCallbackP95:n.sourceFrameQuality.p95Ms,
     renderedFrames:n.sourceFrameQuality.liveUpdateFrames
    };
   })()`);
   if(evidence.ready!=='REAL_180S_READY'||!evidence.chartVisible||
      evidence.chartStatus!=='REAL_NATIVE_SOURCE_30S_WINDOWS'||
      evidence.chartRows<5||!evidence.saveButtonPresent||
      evidence.nativeCpuPhysicalRejoins!==7||
      evidence.physicalCpuSuspectedStalls!==0||
      evidence.nativeB64SourceInkAim!==(w10b68Mode==='SWEEP')||
      (w10b68Mode==='SWEEP'&&evidence.cpuLateralSourceAims<10)||
      (w10b68Mode==='FIXED'&&evidence.cpuLateralSourceAims!==0))
    reject('B68_FULL_NORMAL_PREVIEW_END_AND_QUALITY_EVIDENCE_FAILED_'+
     JSON.stringify(evidence));
   b68VisualEvidence=evidence;
  }
  const frame=await screenshot('W10B59_ACTUAL_FULL_180S_NATIVE_END');
  if(w10b70){
   // Only after an ACTUAL F3 real full 180-second completion is the
   // explicit B70 button enabled; local values must not have been
   // automatically persisted. User click stores FIXED and navigates to
   // source-only SWEEP. No user data ever leaves this browser tab.
   await evaluate(`(() => {
    document.querySelector('#t21-f3-b70-save-compare')
     ?.scrollIntoView({block:'center',behavior:'instant'});
    return true;
   })()`);
   const owner=await evaluate(`(() => {
    const b=document.querySelector('#t21-f3-b70-save-compare');
    const card=document.querySelector('#t21-f3-b70-owner-local-aim-comparison');
    const rect=b?.getBoundingClientRect();
    return {
     buttonDisabled:b?.disabled,
     buttonText:b?.textContent,
     stage:card?.dataset.t21B70Stage,
     ownerOptIn:card?.dataset.t21B70OwnerOptIn,
     noAutoUpload:card?.dataset.t21B70DataUpload,
     scoreable:card?.dataset.t21B70OfficialScoring,
     storedBefore:sessionStorage.getItem('T21_B70_OPT_IN_SOURCE_CPU_AIM_ROUNDS_V1'),
     position:rect?{x:rect.left+rect.width/2,
      y:rect.top+rect.height/2}:null
    };
   })()`);
   if(owner.buttonDisabled!==false||owner.ownerOptIn!=='REQUIRED'||
      owner.stage!=='REAL_ROUND_AVAILABLE'||owner.noAutoUpload!=='NONE'||
      owner.scoreable!=='0'||owner.storedBefore!==null||
      !owner.position||owner.position.y<0||owner.position.y>900)
    reject('B70_REAL_OWNER_COMPLETE_ROUND_NOT_READY_'+JSON.stringify(owner));
   const pos=owner.position;
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:pos.x,y:pos.y,
    button:'none'});
   await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:pos.x,y:pos.y,
    button:'left',clickCount:1});
   await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:pos.x,y:pos.y,
    button:'left',clickCount:1});
   const next=await waitUntil(async()=>await evaluate(`(() => {
    const snap=window.__t21F3?.snapshot?.();
    const text=sessionStorage.getItem('T21_B70_OPT_IN_SOURCE_CPU_AIM_ROUNDS_V1');
    if(!snap||!text)return null;
    let q;try{q=JSON.parse(text);}catch{return null;}
    return {
     search:location.search,
     stage:snap.matchState,
     realActorRejoins:snap.cpu.physicalRejoins.length,
     sourceOriginalSolids:snap.originalSourceSolids,
     originalPaintable:snap.originalPaintSurfaces,
     originalLinks:snap.originalSourceNavigationLinks,
     scoreable:snap.sourceScoreablePromotions,
     productionAuthorized:snap.productionAuthorized,
     noScore:snap.unrestricted4v4Certified===false,
     optInSweep:snap.b64SourceInkSweep.enabled,
     b70OwnerOptIn:document.querySelector(
      '#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70OwnerOptIn,
     b70DataUpload:document.querySelector(
      '#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70DataUpload,
     b70Stage:document.querySelector(
      '#t21-f3-b70-owner-local-aim-comparison')?.dataset.t21B70Stage,
     b70NextUiMode:document.querySelector(
      '#t21-f3-b69-aim-review')?.dataset.t21B69ActiveMode,
     persistedSourceRawLength:text.length,
     stored:{sessionSchema:q.schema,
      recordSchema:q.fixed?.schema,mode:q.fixed?.mode,
      real180Seconds:q.fixed?.nativeSeconds,
      tick:q.fixed?.nativeTick,sourceInk:q.fixed?.cpuImpactInkChangedCells,
      cpuSourceShots:q.fixed?.cpuSourceShots,
      originalActorCount:q.fixed?.actualSevenCpuRejoined,
      productionAuthorized:q.fixed?.productionAuthorized,
      noScore:q.fixed?.scoreable===0,
      noOriginal4v4:q.fixed?.original4v4Certified===false,
      winner:q.fixed?.officialWinner,
      originalCoordFields:('actorTransform' in (q.fixed??{}))},
     otherNotSaved:q.sweep===null
    };
   })()`),90000);
   const completedB72=auditB72OwnerStoredRound(next);
   if(completedB72.defaultCpuChanged||
      completedB72.original4v4Certified)
    reject('B72_UNAUTHORIZED_CPU_OR_SOURCE_PROMOTION');
   const proof={
    verdict:'B70_REAL_FULL_180S_OWNER_OPTIN_AND_TAB_ONLY_STORAGE_PASS',
    actualNativeFullMatchSeconds:180,
    input:'CHROME_REAL_POINTER_LOCK_W_MOUSE',
    actualNativePhysicsTick:terminal.tick,
    realOwnerOptInPhysicalClicks:1,
    pageReloadIntoOriginalSourceSWEEP:true,
    originalSource25Solids17Paintable26Links0Score:true,
    automaticTelemetryUploaded:false,
    sourceOriginalActorCoordinatesIncluded:false,
    owner,afterUserClick:next,verifiedNativeBrowserStorage:completedB72
   };
   writeFileSync(resolve(OUTPUT,'w10b70-owner-opt-in-real-180s.json'),
    JSON.stringify(proof,null,2));
   console.log('T21_W10B70_REAL_NATIVE_USER_CHOSEN_COMPARE',
    JSON.stringify(proof));
   return;
  }
  // Real CDP click on the visible end-of-session button, NOT an
  // artificial page-navigation JavaScript call.
  const pos=await evaluate(`(() => {
   const r=document.querySelector('#t21-f3-b59-restart').getBoundingClientRect();
   return {x:r.left+r.width/2,y:r.top+r.height/2};
  })()`);
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
   x:pos.x,y:pos.y,button:'none'});
  await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
   x:pos.x,y:pos.y,button:'left',clickCount:1});
  await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
   x:pos.x,y:pos.y,button:'left',clickCount:1});
  const restarted=await waitUntil(async()=>{
   const a=await evaluate(`(() => {
    const x=window.__t21F3?.snapshot?.();
    return x?{state:x.matchState,paused:x.paused,
      originalSolids:x.originalSourceSolids,
      humanShots:x.shotsFired,scoreable:x.sourceScoreablePromotions,
      endHidden:document.querySelector('#t21-f3-b59-session-finished')?.hidden}:null;
   })()`);
   return a?.state==='STAGING'&&a.originalSolids===25&&
    a.scoreable===0&&a.humanShots===0&&a.endHidden===true?a:false;
  },90000);
  if(b172Active&&(activeHumanPairs.length!==7||
     activeHumanPairs.some(s=>s.genuineSevenCpuRejoined!==7)||
     terminal.cpu.physicalRejoins.length!==7))
   reject('B172_GENUINE_180S_PLAYER_CPU_ACTIVITY_NOT_COMPLETE');
  const proof={
   verdict:'B59_GENUINE_NATIVE_180_SECOND_SOURCE_SESSION_COMPLETE',
   required180SecondsOfNativeMatchClock:true,
   verifiedByB61LongRunRetry:true,
   B59Original22MinuteHostBudgetFailed:true,
   B61WallTimeElapsedMs:Date.now()-wallStarted,
   noArtificialQaTickAdvances:true,
   actualBrowserKeyboardMouse:true,
   b172ContinuousReal180sHumanParticipation:b172Active,
   b172RealKeyboardMouseActivityPairs:activeHumanPairs,
   actualCpuSevenPresent:terminal.cpu.cpu.length===7,
   actualCpuSourceRejoined:terminal.cpu.physicalRejoins.length,
   actualNativeSecondsElapsed:180-terminal.timeRemainingSeconds,
   originalPhysicsTicks:terminal.tick,
   humanAcceptedShots:terminal.shotsFired,
   realHumanChangedInk:terminal.b23HumanInkFeedback.humanChangedCells,
   genuineCpuSourceShots:terminal.cpuSourceTurfShots,
   genuineCpuChangedInk:terminal.cpuImpactInkCellsChanged,
   realHumanSplats:terminal.humanSplats,
   realCpuSplats:terminal.cpuSplats,
   sourceAuthority:'25_SOLIDS_17_PAINTABLE_26_LINKS_0_SCOREABLE',
   naturalOpponentPathsCertified:0,
   officialWinner:'NONE',
   originalNintendo4v4Certified:false,
   finalUi,restarted,screenshot:frame,history
  };
  writeFileSync(resolve(OUTPUT,'w10b59-real-180s-native-session.json'),
   JSON.stringify(proof,null,2));
  console.log('T21_W10B59_TRUE_NATIVE_180S_SESSION',JSON.stringify(proof));
  if(w10b68){
   const realHistory=history.filter(x=>x.kind==='NATIVE_20_SECOND_PROGRESS');
   const last=b68VisualEvidence;
   const document={
    schema:'T21_W10B68_TRUE_180S_NORMAL_PREVIEW_CPU_AIM_V1',
    mode:w10b68Mode,
    normalPreviewHasNoQaDrive:true,
    actualChromiumPlayCanvasRapierRecast:true,
    actualBrowserMouseKeyboard:true,
    native180SecondTimeUp:true,
    actualRestartButtonAndFreshStaging:true,
    sourceOriginalAuthority:'25/17/26/0',
    sourceGoalMovementFIXED:true,
    experimentalCpuAimNotPromotedToDefault:true,
    originalActorBindingProven:false,
    actualOriginalCrossTeamPathsCertified:0,
    officialWinner:'NONE',
    original4v4Certified:false,
    b68VisualEvidence:last,
    originalNativeSplatStats:{
     realHumanSplats:terminal.humanSplats,realCpuSplats:terminal.cpuSplats,
     realHumanChangedCells:terminal.b23HumanInkFeedback.humanChangedCells
    },
    originalNativeWitnesses:realHistory,
    actualFinalNativeSimulationTick:terminal.tick,
    originalStageVisualScreenshot:frame
   };
   writeFileSync(resolve(OUTPUT,'w10b68-normal-preview-'+w10b68Mode+'.json'),
    JSON.stringify(document,null,2));
   console.log('T21_W10B68_REAL_NORMAL_PREVIEW_COMPLETE',JSON.stringify({
    mode:w10b68Mode,matchSeconds:180,shots:last.sourceCpuShots,
    genuineSourceCells:last.changedOriginalSourceCells,
    realPatrolMeters:last.cpuPatrolMeters,
    actualCpuSplatCount:terminal.cpuSplats,
    sourceCpuSourceGroundRejoined:last.nativeCpuPhysicalRejoins,
    truePreviewEndAndRestart:true,actualFrameP95Ms:last.nativeFrameCallbackP95,
    officialWinner:'NONE',original4v4Certified:false
   }));
  }
  return;
 }
 if(w10b54){
  // True pointer-locked Chrome movement and weapon firing. This mode NEVER
  // calls source qaDriveTicks, advances paused ticks or injects ink/scoring.
  const original=await evaluate('window.__t21F3.snapshot()');
  if(original.paused||original.stopReason||
     original.originalSourceSolids!==25||original.originalPaintSurfaces!==17||
     original.originalSourceNavigationLinks!==26||
     original.sourceScoreablePromotions!==0||
     original.b25SourcePaintRun.status!=='IDLE')
   reject('B54_UNTRUSTED_NATIVE_SOURCE_START');
  // B56 offers a genuine user-click selection of the separate source-local
  // return-route practice. No invented path, actor or physical destination.
  if(w10b56||w10b57){
   const choice=await evaluate(`(() => {
    const btn=document.querySelector('#t21-f3-b56-variant');
    btn?.click();
    ${w10b57?'btn?.click();':''}
    return document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B56NextVariant;
   })()`);
   if(choice!==(w10b57?'PAINT_RELAY':'SWITCHBACK'))
    reject('B56_B57_REAL_USER_MODE_CHOICE_FAILED');
  }
  const armed=await evaluate("(() => {document.querySelector('#t21-f3-b25-start')?.click();return window.__t21F3.snapshot().b25SourcePaintRun;})()");
  if(armed.status!=='ARMED'||armed.officialWinner!=='NONE'||
     (w10b56&&armed.practiceVariant!=='SWITCHBACK')||
     (w10b57&&armed.practiceVariant!=='PAINT_RELAY'))
   reject('B54_REAL_SOURCE_PRACTICE_NOT_ARMED');
  await mouse('mousePressed');await mouse('mouseReleased');
  await waitUntil(async()=>await evaluate(
   'document.pointerLockElement===document.querySelector("#app-canvas")'),12000);
  const get=()=>evaluate('window.__t21F3.snapshot()');
  const ready=await waitUntil(async()=>{
   const q=await get();
   if(q.stopReason)reject('B54_PHYSICS_FAIL_'+q.stopReason);
   return q.b25SourcePaintRun.status==='RUNNING'?q:false;
  },40000);
  const samples=[],wrap=x=>((x+540)%360)-180;
  async function aim(yaw,pitch){
   // Resetting the CDP mouse coordinate is itself a REAL mouse move and
   // changes the camera. Calibrate only AFTER that native event completes.
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y:450,button:'none'});
   const old=(await get()).cameraSourcePractice;
   const dx=Math.round(wrap(yaw-old.yawDegrees)/.22);
   const dy=Math.round(-(pitch-old.pitchDegrees)/.18);
   if(Math.abs(dx)>720||Math.abs(dy)>460)
    reject('B54_UNSUPPORTED_REAL_MOUSE_RANGE');
   await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:800+dx,y:450+dy,button:'none'});
   const after=(await get()).cameraSourcePractice;
   if(Math.abs(wrap(yaw-after.yawDegrees))>3||Math.abs(pitch-after.pitchDegrees)>3)
    reject('B54_NATIVE_MOUSE_AIM_NOT_REACHED_'+JSON.stringify({old,after,yaw,pitch}));
  }
  for(let n=0;n<18;n++){
   const last=await get();
   if(['CLEAR','TIME_UP','ABORTED'].includes(last.b25SourcePaintRun.status))break;
   if(last.stopReason)reject('B54_REAL_PHYSICS_STOP_'+last.stopReason);
   const pair=Math.floor(n/2)%6;
   await aim([0,0,10,-10,0,0][pair],[-12,-20,-28,-37,-46,-25][pair]);
   const forward=n%2===0,code=forward?'KeyW':'KeyS',key=forward?'w':'s',vk=forward?87:83;
   const param={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};
   await cmd('Input.dispatchKeyEvent',{type:'keyDown',...param});
   const firing=n%3!==2;
   if(firing)await mouse('mousePressed');
   const pre=await get();
   const post=await waitUntil(async()=>{
    const a=await get();
    if(a.stopReason)reject('B54_NATIVE_SOURCE_FOOT_STOP_'+a.stopReason);
    return a.tick>=pre.tick+34||['CLEAR','TIME_UP','ABORTED'].includes(a.b25SourcePaintRun.status)?a:false;
   },85000);
   if(firing)await mouse('mouseReleased');
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...param});
   const run=post.b25SourcePaintRun;
   const step={segment:n+1,tick:post.tick,movement:code,realFiring:firing,
    physicalFoot:post.player.position,camera:post.cameraSourcePractice,
    genuineShotCount:post.shotsFired,changedHumanImpactCells:run.humanChangedImpactCells,
    actualHumanImpactEvents:run.humanImpactEvents,
    genuineRapierGroundMeters:run.realGroundedTravelMeters,
    b56RoutePhase:run.routePhase,b56PhysicalTurnReached:run.routeTurnReached,
    b56PhysicalReturnReached:run.routeReturned,
    b56TrueFromStartMeters:run.routeDistanceFromStartMeters,
    b57RelayLeg:run.relayStage,
    b57RealInkTurnCells:run.relayTurnPaintCells,
    b57RealInkReturnCells:run.relayReturnPaintCells,
    b57LegNewInkCells:run.relayStagePaintCells,
    state:run.status};
   samples.push(step);
   console.log('T21_W10B54_ACTUAL_SOURCE_SEGMENT',JSON.stringify(step));
  }
  const actual=await get(),run=actual.b25SourcePaintRun;
  const pass=run.status==='CLEAR'&&run.humanChangedImpactCells>=180&&
   run.realGroundedTravelMeters>=12&&
   (!w10b56||(run.practiceVariant==='SWITCHBACK'&&
    run.routeTurnReached===true&&run.routeReturned===true))&&
   (!w10b57||(run.practiceVariant==='PAINT_RELAY'&&
    run.relayStage==='COMPLETE'&&run.routeTurnReached===true&&
    run.routeReturned===true&&run.relayTurnPaintCells>=60&&
    run.relayReturnPaintCells-run.relayTurnPaintCells>=60&&
    run.humanChangedImpactCells-run.relayReturnPaintCells>=60));
  // The actual human-visible B53 card must catch up to the true B25
  // CLEAR, showing both goals complete and NO official match winner.
  const visibleClear=pass?await waitUntil(async()=>{
   const ui=await evaluate(`(() => {
    const card=document.querySelector('#t21-f3-b25-paint-run');
    const relay=card?.querySelector('#t21-f3-b57-relay');
    return {relayLeg:relay?.dataset.t21B57Leg,
     relayInk:relay?.dataset.t21B57Cells,
     status:card?.dataset.t21B53Status,
     paint:card?.dataset.t21B53PaintPercent,
     ground:card?.dataset.t21B53GroundPercent,
     next:card?.querySelector('#t21-f3-b53-next')?.textContent,
     progress:card?.querySelector('#t21-f3-b25-progress')?.textContent,
     scoreable:card?.dataset.scoreable,
     authority:card?.dataset.productionAuthority};
   })()`);
   return ui.status==='CLEAR'&&ui.paint==='100'&&ui.ground==='100'&&
    ui.progress?.includes('PRACTICE CLEAR · NOT A MATCH WIN')&&
    ui.next?.includes(w10b57?'THREE REAL PAINT LEGS COMPLETE':
     'TWO REAL OBJECTIVES COMPLETE')&&
    (!w10b57||ui.relayLeg==='COMPLETE')?ui:false;
  },25000):null;
  // B58: additional source-session HUD uses EXACT existing native play
  // snapshot counters; no invented scoring and no 180-second time jump.
  const realSessionHud=pass?await waitUntil(async()=>{
   const pair=await evaluate(`(() => {
    const f=window.__t21F3.snapshot();
    const r=document.querySelector('#t21-f3-b58-source-session');
    return {shots:f.shotsFired,cells:f.b23HumanInkFeedback.humanChangedCells,
      cpuInk:f.cpuImpactInkCellsChanged,cpuRejoined:f.cpu.physicalRejoins.length,
      displayedShots:Number(r?.dataset.t21B58HumanShotCount),
      displayedCells:Number(r?.dataset.t21B58HumanChangedInk),
      displayedCpuInk:Number(r?.dataset.t21B58CpuChangedInk),
      displayedCpuRejoined:Number(r?.dataset.t21B58CpuRejoined),
      officialWinner:r?.dataset.t21B58OfficialWinner,
      scoreable:r?.dataset.t21B58OriginalScoreable,
      label:r?.querySelector('#t21-f3-b58-title')?.textContent,
      nativeRenderer:f.renderer};
   })()`);
   return pair.cells>0&&pair.shots>0&&
    pair.cells===pair.displayedCells&&pair.shots===pair.displayedShots&&
    pair.cpuInk===pair.displayedCpuInk&&
    pair.cpuRejoined===pair.displayedCpuRejoined&&
    pair.officialWinner==='NONE'&&pair.scoreable==='0'&&
    pair.nativeRenderer==='webgl2'?pair:false;
  },25000):null;
  const clearedFrame=pass?await screenshot(
   w10b57?'W10B57_REAL_SOURCE_PAINT_RELAY_CLEAR':
    w10b56?'W10B56_REAL_SOURCE_SWITCHBACK_CLEAR':
          'W10B54_ACTUAL_SOURCE_PRACTICE_CLEAR'):null;
  const report={status:pass?'B54_ACTUAL_CHROME_SOURCE_PRACTICE_CLEAR':
   'B54_ACTUAL_CHROME_SOURCE_PRACTICE_NOT_CLEARED',
   sourceAuthority:'25_PHYSICAL_17_PAINTABLE_26_LINKS_0_SCOREABLE',
   nativeWebgl2:true,realPointerLockedChrome:true,actualCDPKeyboardAndMouse:true,
   noSyntheticMovementOrInk:true,qaPhysicalTickAdvancements:0,
   manualOwnerHumanPlaytest:false,originalGame4v4Certified:false,
   realOriginalHumanShots:actual.shotsFired,practice:run,segments:samples,
   trueHumanVisibleClearCard:visibleClear,
   b58ReadOnlyRealSessionHud:realSessionHud,
   actualRealChromeClearScreenshot:clearedFrame,
   genuineB25DualRequirementsMet:pass,
   b56SwitchbackChallenge:w10b56,
   b57RelayChallenge:w10b57,
   b56GenuineOutboundAndReturn:w10b56?run.routeTurnReached&&run.routeReturned:null,
   originalSolids:actual.originalSourceSolids,
   paintable:actual.originalPaintSurfaces,navLinks:actual.originalSourceNavigationLinks,
   scoreable:actual.sourceScoreablePromotions,originalTurfWinner:'NONE'};
  writeFileSync(resolve(OUTPUT,'w10b54-real-source-full-practice.json'),
   JSON.stringify(report,null,2));
  console.log('T21_W10B54_ACTUAL_FULL_PRACTICE',JSON.stringify(report));
  if(!pass||!visibleClear||!realSessionHud||!clearedFrame||
     actual.originalSourceSolids!==25||
     actual.originalPaintSurfaces!==17||actual.originalSourceNavigationLinks!==26||
     actual.sourceScoreablePromotions!==0||run.officialWinner!=='NONE'||
     run.originalTurfScore!=='UNAVAILABLE')
   reject('B54_TRUE_CHROME_SOURCE_PRACTICE_CLEAR_UNVERIFIED');
  // B55: the first genuine original-source Chrome CLEAR must produce a
  // live-page-only best. Esc and genuine Retry must preserve it unchanged.
  const b55Before=await evaluate(`(() => {
   const card=document.querySelector('#t21-f3-b25-paint-run');
   return {best:card?.dataset.t21B55BestTicks,
    count:card?.dataset.t21B55ClearCount,
    scope:card?.dataset.t21B55RecordScope,
    label:card?.querySelector('#t21-f3-b55-record')?.textContent};
  })()`);
  if(b55Before.best!==String(run.elapsedTicks)||
     b55Before.count!=='1'||
     b55Before.scope!=='CURRENT_BROWSER_SESSION_ONLY'||
     !b55Before.label?.includes('NEW BEST!'))
   reject('B55_ACTUAL_SOURCE_CLEAR_DID_NOT_SET_RECORD');
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',
   code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',
   code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await waitUntil(async()=>await evaluate('document.pointerLockElement===null'),12000);
  const b55Retry=await evaluate(`(() => {
   document.querySelector('#t21-f3-b25-start')?.click();
   const c=document.querySelector('#t21-f3-b25-paint-run');
   return {run:window.__t21F3.snapshot().b25SourcePaintRun,
    best:c?.dataset.t21B55BestTicks,count:c?.dataset.t21B55ClearCount,
    scoreable:c?.dataset.scoreable};
  })()`);
  if(b55Retry.run.status!=='ARMED'||
     b55Retry.run.bestClearElapsedTicks!==run.elapsedTicks||
     b55Retry.run.completedRealPracticeRuns!==1||
     b55Retry.run.newBestOnMostRecentClear!==false||
     b55Retry.best!==String(run.elapsedTicks)||
     b55Retry.count!=='1'||b55Retry.scoreable!=='0'||
     b55Retry.run.officialWinner!=='NONE')
   reject('B55_RETRY_DID_NOT_KEEP_GENUINE_SESSION_BEST_'+JSON.stringify(b55Retry));
  const b55Result={status:'B55_REAL_SOURCE_SESSION_BEST_AND_RETRY_PASS',
   firstRealClearTicks:run.elapsedTicks,
   currentBestTicks:b55Retry.run.bestClearElapsedTicks,
   actualClears:b55Retry.run.completedRealPracticeRuns,
   realHumanInkCells:run.humanChangedImpactCells,
   realOriginalGroundMeters:run.realGroundedTravelMeters,
   trueCdpEscapeAndRetry:true,productionAuthorized:false,
   scoreable:0,officialWinner:'NONE'};
  writeFileSync(resolve(OUTPUT,'w10b55-real-native-practice-retry.json'),
   JSON.stringify(b55Result,null,2));
  console.log('T21_W10B55_REAL_NATIVE_BEST_RETRY',JSON.stringify(b55Result));
  if(w10b56){
   if(run.practiceVariant!=='SWITCHBACK'||!run.routeReturned||
      !run.routeTurnReached||b55Retry.run.practiceVariant!=='SWITCHBACK'||
      b55Retry.run.bestClearElapsedTicks!==run.elapsedTicks||
      b55Retry.run.completedRealPracticeRuns!==1)
    reject('B56_ACTUAL_SOURCE_SWITCHBACK_AND_DISTINCT_RECORD_NOT_PROVEN');
   const result={
    status:'W10B56_REAL_NATIVE_SOURCE_SWITCHBACK_CLEAR_AND_RETRY',
    originalSourceOnly:true,actualBrowserInput:true,
    firstOutboundWitness:samples.find(x=>x.b56PhysicalTurnReached)??null,
    firstReturnWitness:samples.find(x=>x.b56PhysicalReturnReached)??null,
    clearTicks:run.elapsedTicks,humanChangedImpactCells:run.humanChangedImpactCells,
    groundedMeters:run.realGroundedTravelMeters,
    independentMode:run.practiceVariant,sessionBestTicks:b55Retry.run.bestClearElapsedTicks,
    trueNativeEscapeAndRetry:true,scoreable:0,officialWinner:'NONE',
    screenshot:clearedFrame
   };
   writeFileSync(resolve(OUTPUT,'w10b56-real-source-switchback.json'),
    JSON.stringify(result,null,2));
   console.log('T21_W10B56_REAL_SOURCE_SWITCHBACK',JSON.stringify(result));
  }
  if(w10b57){
   const valid=run.practiceVariant==='PAINT_RELAY'&&
    run.relayStage==='COMPLETE'&&run.routeReturned&&
    run.relayTurnPaintCells>=60&&
    run.relayReturnPaintCells-run.relayTurnPaintCells>=60&&
    run.humanChangedImpactCells-run.relayReturnPaintCells>=60&&
    b55Retry.run.practiceVariant==='PAINT_RELAY'&&
    b55Retry.run.bestClearElapsedTicks===run.elapsedTicks&&
    b55Retry.run.completedRealPracticeRuns===1;
   if(!valid)reject('B57_REAL_SOURCE_3_LEG_INK_OR_RETRY_UNPROVEN');
   const witness={
    status:'B57_REAL_CHROME_PAINT_RELAY_3_LEGS_CLEAR',
    actualChromeKeyboardMouse:true,realSourceOnly:true,
    noSyntheticPhysicsOrInk:true,firstOutward:samples.find(v=>
      v.b56PhysicalTurnReached)??null,
    firstReturn:samples.find(v=>v.b56PhysicalReturnReached)??null,
    cumulativeNewHumanCellsAtTurn:run.relayTurnPaintCells,
    cumulativeNewHumanCellsAtReturn:run.relayReturnPaintCells,
    threeIndependentLegNewCells:[
     run.relayTurnPaintCells,
     run.relayReturnPaintCells-run.relayTurnPaintCells,
     run.humanChangedImpactCells-run.relayReturnPaintCells],
    trueGroundMeters:run.realGroundedTravelMeters,
    actualClearTickTime:run.elapsedTicks,
    sessionBestTicks:b55Retry.run.bestClearElapsedTicks,
    currentPageOnly:true,
    humanOwnerWindowsManual:false,scoreable:0,officialWinner:'NONE',
    sourceSolids:25,paintable:17,navLinks:26,screenshot:clearedFrame
   };
   writeFileSync(resolve(OUTPUT,'w10b57-real-source-paint-relay.json'),
    JSON.stringify(witness,null,2));
   console.log('T21_W10B57_REAL_SOURCE_PAINT_RELAY',JSON.stringify(witness));
  }
  return;
 }
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
  // B77: PNG byte SHA is a bad proxy for material reversibility.
  // Exact visual forensic analysis of B76's failed B21 artifact found
  // A/A2 differ in just 258/1,440,000 pixels, all RGB channel deltas
  // <=1, clustered along rasterized text. The intentional hologram
  // differs in >40,000 pixels, with substantial channel differences.
  // Reject anything above a strict one-step quantization budget,
  // and independently demand a MATERIAL B-frame change.
  const realAbaRaster=verifyB77OriginalSourceAbaRaster(
   readFileSync(resolve(OUTPUT,architectureA.name+'.png')),
   readFileSync(resolve(OUTPUT,hologramB.name+'.png')),
   readFileSync(resolve(OUTPUT,architectureA2.name+'.png')));
  if(!realAbaRaster.sourceAppearanceRestored||
     !realAbaRaster.intentionalHologramMaterialChangeVerified||
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
    restoredRasterWithinOneStepQuantization:true,
    fidelity:realAbaRaster,
    restoredIdenticalPNGHash:architectureA.sha256===architectureA2.sha256,
    fixedPhysicsTicks:0,
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
  const b53Armed=await evaluate(`({
    status:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53Status,
    paint:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53PaintPercent,
    ground:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53GroundPercent,
    source:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53SourceObjectives,
    next:document.querySelector('#t21-f3-b53-next')?.textContent
   })`);
  if(b53Armed.status!=='ARMED'||b53Armed.paint!=='0'||
     b53Armed.ground!=='0'||b53Armed.source!=='REAL_HUMAN_INK_AND_RAPIER_GROUND'||
     !b53Armed.next?.includes('180 changed cells'))
   reject('W10B53_ARMED_SOURCE_OBJECTIVES_INVALID_'+JSON.stringify(b53Armed));
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
  const b53Moving=await evaluate(`({
   source:window.__t21F3.snapshot().b25SourcePaintRun,
   paint:Number(document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53PaintPercent),
   ground:Number(document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53GroundPercent),
   next:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53Next
  })`);
  if(b53Moving.source.status!=='RUNNING'||b53Moving.ground<=0||
     b53Moving.ground>100||b53Moving.paint!==0||b53Moving.next!=='PAINT'||
     b53Moving.source.officialWinner!=='NONE')
   reject('W10B53_REAL_GROUND_PROGRESS_INVALID_'+JSON.stringify(b53Moving));
  console.log('T21_W10B53_REAL_CHROME_DUAL_OBJECTIVE_PROGRESS_PASS',
   JSON.stringify({realGroundMeters:b53Moving.source.realGroundedTravelMeters,
    groundPercent:b53Moving.ground,paintPercent:b53Moving.paint,
    actualOriginalPhysicalMovement:true,sourceScoring:0}));
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
  // Chrome dispatches pointerlockchange asynchronously after
  // exitPointerLock(). The genuine event's F3 lens-reset handler is
  // immediate *when dispatched*, but CDP should not race that event.
  const unlocked=await waitUntil(async()=>{
   const view=await evaluate(`({
    pointerLocked:document.pointerLockElement!==null,
    source:window.__t21F3.snapshot().b27KineticSourceView
   })`);
   return !view.pointerLocked&&view.source.fieldOfViewDegrees===63?
    view.source:false;
  },10000);
  if(unlocked.fieldOfViewDegrees!==63)
   reject('W10B27_POINTER_UNLOCK_MUST_RESTORE_ORIGINAL_LENS_'+
    JSON.stringify(unlocked));
  const paintRunAborted=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   return state.b25SourcePaintRun.status==='ABORTED'?state:false;
  },25000);
  const b53Abort=await evaluate(`({
   status:document.querySelector('#t21-f3-b25-paint-run')?.dataset.t21B53Status,
   next:document.querySelector('#t21-f3-b53-next')?.textContent
  })`);
  if(b53Abort.status!=='ABORTED'||!b53Abort.next?.includes('RETRY'))
   reject('W10B53_ABORT_MUST_BE_VISIBLE_'+JSON.stringify(b53Abort));
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
  if(w10b36){
   const focus=await waitUntil(async()=>{
    const view=await evaluate(`({
     mode:document.querySelector('#app-canvas')?.dataset.t21W10B36PlayFocus,
     panelHidden:document.querySelector('#t21-f3-play-panel')?.hidden,
     surveyHidden:document.querySelector('#t21-f3-source-survey')?.hidden,
     idlePracticeHidden:document.querySelector('#t21-f3-b25-paint-run')?.hidden,
     hudVisible:document.querySelector('#t21-f3-practice-hud')?.hidden===false,
     crosshairVisible:document.querySelector('#t21-f3-crosshair')?.hidden===false,
     sourceScoreable:document.querySelector('#t21-f3-practice-hud')?.dataset.sourceScoreable,
     warningTop:document.querySelector('#t21-f3-camera-obstruction')?.style.top,
     radarMode:document.querySelector('#t21-f3-source-radar')?.dataset.t21B52RadarMode,
     radarWidth:document.querySelector('#t21-f3-source-radar')?.style.width,
     radarHeightAuthority:document.querySelector('#t21-f3-source-radar')?.dataset.t21B52HeightAuthority,
     radarActorCount:document.querySelector('#t21-f3-radar-canvas')?.dataset.nativeActorCount,
     radarBands:['t21B52Above','t21B52Level','t21B52Below'].map(k=>Number(document.querySelector('#t21-f3-radar-canvas')?.dataset[k]))
    })`);
    return view.mode==='ON'&&view.panelHidden&&view.surveyHidden&&
     view.idlePracticeHidden&&view.hudVisible&&view.crosshairVisible?view:false;
   },15000);
   if(focus.sourceScoreable!=='0'||focus.warningTop!=='calc(50% + 72px)'||
      focus.radarMode!=='COMPACT'||focus.radarWidth!=='184px'||
      focus.radarHeightAuthority!=='REAL_RAPIER_FOOT_Y_ONLY'||
      focus.radarActorCount!=='8'||focus.radarBands.reduce((x,y)=>x+y,0)!==7)
    reject('W10B36_SOURCE_OVERLAY_OR_AUTHORITY_DRIFT_'+JSON.stringify(focus));
   console.log('T21_W10B36_REAL_CHROME_POINTERLOCK_FOCUS_PASS',JSON.stringify(focus));
  }
  // B37: genuine locked mouse press, deliberately injected DOM cancellation.
  // This checks application handling, NOT a naturally occurring OS cancellation.
  const cancelBefore=await witness();
  await mouse('mousePressed');
  const cancelPressed=await witness();
  if(!cancelPressed.realMouseFireHeld||!cancelPressed.pointerLocked)
   reject('W10B37_NATIVE_PRESS_NOT_HELD_'+JSON.stringify(cancelPressed));
  const cancellation=await evaluate(`(() => {
   const canvas=document.querySelector('#app-canvas');
   const event=new PointerEvent('pointercancel',{bubbles:true,pointerType:'mouse'});
   canvas.dispatchEvent(event);
   return {isTrusted:event.isTrusted,pointerLocked:document.pointerLockElement===canvas};
  })()`);
  await advance(1);
  const cancelAfter=await witness();
  if(cancellation.isTrusted!==false||!cancellation.pointerLocked||
     cancelAfter.realMouseFireHeld||cancelAfter.shotsFired!==cancelBefore.shotsFired||
     cancelAfter.sourceSolids!==25||cancelAfter.sourcePaint!==17||
     cancelAfter.sourceLinks!==26||cancelAfter.activationReady!==false||
     cancelAfter.scoreablePromotions!==0)
   reject('W10B37_CANCELLED_PRESS_EXECUTED_OR_AUTHORITY_DRIFT_'+
    JSON.stringify({cancelBefore,cancelAfter,cancellation}));
  await mouse('mouseReleased');
  const cancelEvidence={
   genuinePointerLockedPress:true,injectedDomCancel:true,naturalOsCancelTested:false,
   cancelledTapProducedShots:cancelAfter.shotsFired-cancelBefore.shotsFired,
   heldFireAfterCancel:cancelAfter.realMouseFireHeld,
   before:cancelBefore,after:cancelAfter,cancellation
  };
  writeFileSync(resolve(OUTPUT,'w10b37-pointer-cancel.json'),JSON.stringify(cancelEvidence,null,2));
  console.log('T21_W10B37_CHROME_INJECTED_CANCEL_PASS',JSON.stringify(cancelEvidence));
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
     !Number.isSafeInteger(splat.humanCpuDirectHits)||
     splat.humanCpuDirectHits<3||splat.humanCpuDirectHits>splat.cpuCombatHits||
     splat.humanCpuDirectSplats!==1||
     splat.shotsFired-quickBefore.shotsFired<3||splat.hp!==0||
     splat.entityEnabledInHierarchy!==false)
   reject('W10B15_MOUSE_NOT_NATIVE_COMBAT_'+JSON.stringify({
    splat,shotsBefore,hitsBefore,trace
   }));
  // Isolated native Chrome encounter, not official natural enemy access.
  const b88=await evaluate(`(() => {
   const m=document.querySelector('#t21-f3-b87-hit-confirmation');
   return {text:m?.textContent,visible:!!m,splat:m?.dataset.t21B88HumanDirectSplats,
    source:m?.dataset.t21B87Source};
  })()`);
  if(!b88.visible||b88.text!=='CPU SPLAT'||b88.splat!=='1'||
     b88.source!=='REAL_HUMAN_DIRECT_DAMAGE_ONLY')
   reject('B88_REAL_CHROME_HUMAN_SPLAT_MARKER_MISSING_'+JSON.stringify(b88));
  console.log('B88_REAL_CHROME_SPLAT_FEEDBACK_PASS',JSON.stringify(b88));
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
  if(w10b36){
   const restored=await waitUntil(async()=>{
    const view=await evaluate(`({
     mode:document.querySelector('#app-canvas')?.dataset.t21W10B36PlayFocus,
     panelVisible:document.querySelector('#t21-f3-play-panel')?.hidden===false,
     surveyVisible:document.querySelector('#t21-f3-source-survey')?.hidden===false,
     practiceVisible:document.querySelector('#t21-f3-b25-paint-run')?.hidden===false,
     nativeStage:window.__t21F3.snapshot().originalSourceSolids,
     scores:window.__t21F3.snapshot().sourceScoreablePromotions,
     radarMode:document.querySelector('#t21-f3-source-radar')?.dataset.t21B52RadarMode,
     radarWidth:document.querySelector('#t21-f3-source-radar')?.style.width
    })`);
    return view.mode==='OFF'&&view.panelVisible&&view.surveyVisible&&
     view.practiceVisible?view:false;
   },15000);
   if(restored.nativeStage!==25||restored.scores!==0||
      restored.radarMode!=='FULL'||restored.radarWidth!=='300px')
    reject('W10B36_UNLOCK_SOURCE_AUTHORITY_DRIFT_'+JSON.stringify(restored));
   console.log('T21_W10B36_REAL_CHROME_FOCUS_RESTORE_PASS',JSON.stringify(restored));
  }
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
   realHumanDirectCpuDamageEvents:splat.humanCpuDirectHits,
   humanAttributedNativeCpuSplats:splat.humanCpuDirectSplats,
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
  if(w10b38){
   // Browser-native, pointer-locked KeyF event enters the existing
   // PlayerInput queue and actual human SubWeaponSystem.
   // No force-spawn, direct weapon method, ink-injection or CPU teleport.
   const initial=await evaluate('window.__t21F3.snapshot()');
   if(!initial.b38HumanSub?.enabled||initial.b38HumanSub.throws!==0||
      initial.b38HumanSub.explosions!==0||
      initial.player.ink<70||initial.sourceScoreablePromotions!==0||
      !initial.b38HumanSub.nativeSourcePhysicsOnly)
    reject('W10B38_REAL_SOURCE_HUMAN_SUB_NOT_READY_'+JSON.stringify({
     sub:initial.b38HumanSub,ink:initial.player.ink,
     scoring:initial.sourceScoreablePromotions
    }));
   await cmd('Input.dispatchKeyEvent',{
    type:'keyDown',key:'f',code:'KeyF',
    windowsVirtualKeyCode:70,nativeVirtualKeyCode:70
   });
   await cmd('Input.dispatchKeyEvent',{
    type:'keyUp',key:'f',code:'KeyF',
    windowsVirtualKeyCode:70,nativeVirtualKeyCode:70
   });
   const thrown=await waitUntil(async()=>{
    const state=await evaluate('window.__t21F3.snapshot()');
    if(state.stopReason)reject('W10B38_REAL_SOURCE_STOP_'+state.stopReason);
    return state.b38HumanSub.throws>=1?state:false;
   },70000);
   if(thrown.b38HumanSub.throws!==1||
      thrown.player.ink>initial.player.ink-69||
      thrown.sourceScoreablePromotions!==0||
      thrown.originalSourceSolids!==25||
      thrown.originalPaintSurfaces!==17||
      thrown.originalSourceNavigationLinks!==26)
    reject('W10B38_NATIVE_REAL_SUB_THROW_INVALID_'+
     JSON.stringify({initial:initial.b38HumanSub,thrown:thrown.b38HumanSub,
      firstInk:initial.player.ink,lastInk:thrown.player.ink}));
   // The subsequent per-tick projectile trajectory, original Rapier
   // cast and delayed blast run through the existing native simulator.
   // Paused QA stepping is NOT evidence of realtime GPU performance.
   const pausedSub=await evaluate('window.__t21F3.pause()');
   if(!pausedSub.paused)reject('W10B38_PAUSED_NATIVE_SUB_STEP_REJECTED');
   let exploded=pausedSub;
   for(let pass=0;pass<5&&exploded.b38HumanSub.explosions<1;pass++){
    exploded=await evaluate('window.__t21F3.advanceQaTicks(72)');
    if(exploded.stopReason)reject('W10B38_NATIVE_BOMB_SOURCE_HOLD_'+exploded.stopReason);
   }
   if(exploded.b38HumanSub.explosions!==1||
      exploded.b38HumanSub.throws!==1||
      exploded.sourceScoreablePromotions!==0||
      exploded.originalSourceSolids!==25||
      exploded.originalPaintSurfaces!==17||
      exploded.originalSourceNavigationLinks!==26||
      exploded.productionAuthorized!==false)
    reject('W10B38_NATIVE_SOURCE_SUB_EXPLOSION_INVALID_'+
     JSON.stringify(exploded.b38HumanSub));
   const bombInk=exploded.b39HumanBombInk;
   if(exploded.b43NativeBombWitnesses?.length!==1)
    reject('W10B43_INITIAL_NATIVE_EXPLOSION_WITNESS_MISSING');
   // This is a POST-GAMEPLAYINK CPU ownership raster result, not a
   // projectile spawn, an animation, a paint request or a GPU-only frame.
   // A bomb with no real authorized changed cells is an honest HOLD.
   if(!bombInk||!bombInk.originalSourceOnly||
      bombInk.humanBombStampEvents<1||
      bombInk.humanBombChangedEvents<1||
      bombInk.humanBombChangedCells<1||
      bombInk.lastBombPaintedSurface===null||
       bombInk.lastBombOutcome!=='NEW_CELLS'||
       bombInk.lastBombOutcomeStamps!==bombInk.humanBombStampEvents||
       bombInk.lastBombOutcomeChangedCells!==bombInk.humanBombChangedCells||
      bombInk.scoreablePromotionCount!==0||
      exploded.b25SourcePaintRun.humanChangedImpactCells!==0)
    reject('W10B39_NATIVE_BOMB_DID_NOT_PAINT_AUTHENTIC_CELLS_'+
     JSON.stringify({bombInk,practice:exploded.b25SourcePaintRun,
      sub:exploded.b38HumanSub}));
   const evidence={
    status:'PASS_REAL_CHROME_KEY_F_NATIVE_SOURCE_SUB_AND_EXPLOSION',
    browserKeyEvent:true,authenticPointerLockedInput:true,
    sourceOnlyPractice:true,
    realHumanSubThrows:exploded.b38HumanSub.throws,
    nativeBombExplosions:exploded.b38HumanSub.explosions,
    humanBombOriginalSurfaceStamps:bombInk.humanBombStampEvents,
    humanBombChangedEvents:bombInk.humanBombChangedEvents,
    humanBombRealChangedCells:bombInk.humanBombChangedCells,
    lastGenuineBombPaintSurface:bombInk.lastBombPaintedSurface,
    noFakeB25ProjectileImpactCredit:true,
    originalPhysicsTicksAdvanced:exploded.tick-thrown.tick,
    sourceOriginalSolids:25,sourcePaintableSurfaces:17,
    originalNavLinks:26,scoreableSurfaces:0,
    noOriginalBancActorEvidence:true,natural4v4Certified:false,
    ownerRtxRealtimeTested:false,productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b38-native-human-sub.json'),
    JSON.stringify(evidence,null,2));
   console.log('T21_W10B38_REAL_CHROME_KEY_F_SOURCE_BOMB_PASS',
    JSON.stringify(evidence));
   // B40: Repeat the SAME real input direction after natural ink refill,
   // then change real pointer-locked mouse pitch for a second independent
   // trajectory. These are observations, not fabricated actor/paint positions.
   // Zero newly owned cells must be reported honestly, never hidden as PASS.
   const originalAim=exploded.cameraSourcePractice;
   const refill=async()=>{
    let state=await evaluate('window.__t21F3.snapshot()');
    for(let n=0;n<12&&state.player.ink<75;n++){
     state=await evaluate('window.__t21F3.advanceQaTicks(72)');
     if(state.stopReason||state.matchState==='TIME_UP')
      reject('W10B40_INK_RECOVERY_SOURCE_HOLD_'+JSON.stringify({
       tick:state.tick,ink:state.player.ink,stop:state.stopReason,
       match:state.matchState}));
    }
    if(state.player.ink<75)
     reject('W10B40_REAL_RESOURCE_REFILL_UNAVAILABLE_'+state.player.ink);
    return state;
   };
   const throwObserved=async(label)=>{
    const before=await refill();
    const oldWitnessCount=before.b43NativeBombWitnesses?.length??0;
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!locked||!before.paused||before.b38HumanSub.throws<1)
     reject('W10B40_NO_NATIVE_POINTERLOCK_'+label);
    await cmd('Input.dispatchKeyEvent',{
     type:'keyDown',key:'f',code:'KeyF',
     windowsVirtualKeyCode:70,nativeVirtualKeyCode:70
    });
    await cmd('Input.dispatchKeyEvent',{
     type:'keyUp',key:'f',code:'KeyF',
     windowsVirtualKeyCode:70,nativeVirtualKeyCode:70
    });
    const accepted=await evaluate('window.__t21F3.advanceQaTicks(1)');
    if(accepted.b38HumanSub.throws!==before.b38HumanSub.throws+1||
       accepted.player.ink>before.player.ink-69)
     reject('W10B40_REAL_KEY_F_THROW_UNCONFIRMED_'+
      JSON.stringify({label,before:before.b38HumanSub,
       accepted:accepted.b38HumanSub,beforeInk:before.player.ink,
       acceptedInk:accepted.player.ink}));
    let resolved=accepted;
    for(let i=0;i<5&&
        resolved.b38HumanSub.explosions===before.b38HumanSub.explosions;i++){
     resolved=await evaluate('window.__t21F3.advanceQaTicks(72)');
     if(resolved.stopReason)reject('W10B40_NATIVE_SOURCE_HOLD_'+resolved.stopReason);
    }
    if(resolved.b38HumanSub.explosions!==before.b38HumanSub.explosions+1||
       resolved.originalSourceSolids!==25||
       resolved.originalPaintSurfaces!==17||
       resolved.originalSourceNavigationLinks!==26||
       resolved.sourceScoreablePromotions!==0||
       resolved.productionAuthorized!==false||
       resolved.b25SourcePaintRun.humanChangedImpactCells!==
        before.b25SourcePaintRun.humanChangedImpactCells)
     reject('W10B40_SOURCE_BOMB_AUTHORITY_DRIFT_'+
      JSON.stringify({label,before:before.b38HumanSub,
       after:resolved.b38HumanSub,paint:resolved.b39HumanBombInk}));
    const witnesses=resolved.b43NativeBombWitnesses;
    if(!Array.isArray(witnesses)||witnesses.length!==oldWitnessCount+1)
     reject('W10B43_MISSING_NATIVE_EXPLOSION_WITNESS_'+label);
    const witness=witnesses[oldWitnessCount];
    const oldInk=before.b39HumanBombInk,newInk=resolved.b39HumanBombInk;
    const changedEvents=newInk.humanBombChangedEvents-oldInk.humanBombChangedEvents;
    const changedCells=newInk.humanBombChangedCells-oldInk.humanBombChangedCells;
    const stamps=newInk.humanBombStampEvents-oldInk.humanBombStampEvents;
    const zeroStamps=newInk.humanBombZeroChangedEvents-
     oldInk.humanBombZeroChangedEvents;
    const outcome=stamps===0?'NO_CERTIFIED_STAMP':
      changedCells===0?'STAMP_ZERO_CHANGE':'NEW_CELLS';
     if(newInk.lastBombOutcome!==outcome||
        newInk.lastBombOutcomeStamps!==stamps||
        newInk.lastBombOutcomeChangedCells!==changedCells||
        newInk.humanBombExplosionsObserved!==resolved.b38HumanSub.explosions)
      reject('W10B41_BOMB_OUTCOME_MISMATCH_'+label);
     if(stamps<0||zeroStamps<0||changedEvents<0||changedCells<0||
       stamps!==changedEvents+zeroStamps||
       (changedEvents===0)!==(changedCells===0)||
       (stamps>0&&(!newInk.lastBombStampedSurface||
        newInk.lastBombStampTick===null)))
     reject('W10B40_INVALID_POST_RASTER_DELTA_'+label);
    if(witness.enqueuedStampSurfaceIds.length!==stamps||
       witness.originalGameCollisionCertified!==false||
       witness.launchId!==resolved.b38HumanSub.throws)
     reject('W10B43_NATIVE_PROJECTION_WITNESS_MISMATCH_'+label);
    return {
     b43NativeExplosionWitness:witness,
     case:label,actualKeyF:true,actualPointerLockedInput:true,
     cameraYawDegrees:before.cameraSourcePractice.yawDegrees,
     cameraPitchDegrees:before.cameraSourcePractice.pitchDegrees,
     originalPlayerPosition:before.player.position,
     inkBefore:before.player.ink,inkAfterThrow:accepted.player.ink,
     throwDelta:1,explosionDelta:1,originalBombStampEvents:stamps,
     originalZeroChangeStampEvents:zeroStamps,
     lastOriginalStampedSurface:stamps>0?newInk.lastBombStampedSurface:null,
     originalChangedBombEvents:changedEvents,
     authoritativeChangedCells:changedCells,
     paintFailureObserved:changedCells===0,
      b41BombOutcome:newInk.lastBombOutcome,
      zeroChangeIsNotProvenPhysicalMiss:true,
     verifiedChangedOriginalSurface:changedEvents>0?
      newInk.lastBombPaintedSurface:null,
     genuinePhysicalTicks:resolved.tick-accepted.tick,
     scoreablePromotions:0,certifiedOriginalSurfaces:17,
     newOriginalPhysicsSolids:0,newNavLinks:0,
     natural4v4Certified:false
    };
   };
   const sameAim=await throwObserved('REPEAT_EXISTING_PAINT_AIM');
   if(Math.abs(sameAim.cameraPitchDegrees-originalAim.pitchDegrees)>0.01||
      Math.abs(sameAim.cameraYawDegrees-originalAim.yawDegrees)>0.01)
    reject('W10B40_REPEATED_AIM_CHANGED_UNEXPECTEDLY');
   await refill();
   // Genuine CDP mouse motion while the original canvas has pointer lock:
   // no direct writes to camera yaw/pitch, projectile direction or stage.
   const lookBefore=await evaluate('window.__t21F3.snapshot()');
   await cmd('Input.dispatchMouseEvent',{
    type:'mouseMoved',x:800,y:450,button:'none'
   });
   await cmd('Input.dispatchMouseEvent',{
    type:'mouseMoved',x:800,y:370,button:'none'
   });
   const lookAfter=await evaluate('window.__t21F3.snapshot()');
   const cameraPitchChange=lookAfter.cameraSourcePractice.pitchDegrees-
    lookBefore.cameraSourcePractice.pitchDegrees;
   if(Math.abs(cameraPitchChange)<5)
    reject('W10B40_REAL_MOUSE_LOOK_UNVERIFIED_'+JSON.stringify({
     before:lookBefore.cameraSourcePractice,
     after:lookAfter.cameraSourcePractice
    }));
   const pitchAim=await throwObserved('REAL_MOUSE_PITCH_VARIANT');
   const varied={
    status:'B40_THREE_NATIVE_BOMB_THROWS_MEASURED_NOT_ALL_PAINT_CERTIFIED',
    baseline:{
     case:'B39_REAL_SOURCE_THROW',
     originalChangedBombEvents:bombInk.humanBombChangedEvents,
     authoritativeChangedCells:bombInk.humanBombChangedCells,
     originalBombStampEvents:bombInk.humanBombStampEvents,
     originalZeroChangeStampEvents:bombInk.humanBombZeroChangedEvents,
     lastOriginalStampedSurface:bombInk.lastBombStampedSurface,
     verifiedChangedOriginalSurface:bombInk.lastBombPaintedSurface,
     originalPlayerPosition:initial.player.position,
     actualKeyF:true
    },
    sameAim,pitchAim,cameraPitchChange,
    keyFThrowTotal:3,nativeExplosionTotal:3,
    zeroChangeIsHonestObservedFailure:true,
    noInjectedPositionOrInk:true,originalSolids:25,
    originalPaintable:17,originalNavLinks:26,officialScoreable:0,
    ownerWindowsGpuUntested:true,natural4v4Certified:false,
    productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b40-real-bomb-conditions.json'),
    JSON.stringify(varied,null,2));
   console.log('T21_W10B40_NATIVE_BOMB_CONDITIONS_OBSERVED',
    JSON.stringify(varied));
   // B42: genuine four-direction mouse input, real KeyF + native physics.
   // This cannot certify physical wall/edge/distance contact elsewhere.
   const b42MoveAndThrow=async(label,dx,dy)=>{
    await refill();
    const before=await evaluate('window.__t21F3.snapshot()');
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!locked||!before.paused||before.stopReason||
       before.sourceScoreablePromotions!==0)
     reject('W10B42_SOURCE_MOUSE_AUTHORITY_'+label);
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800,y:450,button:'none'
    });
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800+dx,y:450+dy,button:'none'
    });
    const after=await evaluate('window.__t21F3.snapshot()');
    const yaw=after.cameraSourcePractice.yawDegrees-
     before.cameraSourcePractice.yawDegrees;
    const pitch=after.cameraSourcePractice.pitchDegrees-
     before.cameraSourcePractice.pitchDegrees;
    if(!Number.isFinite(yaw)||!Number.isFinite(pitch)||
       Math.hypot(yaw,pitch)<5)
     reject('W10B42_NATIVE_MOUSE_ANGLE_NOT_CHANGED_'+
      JSON.stringify({label,yaw,pitch}));
    const trial=await throwObserved(label);
    if(Math.abs(trial.cameraYawDegrees-
       after.cameraSourcePractice.yawDegrees)>.01||
       Math.abs(trial.cameraPitchDegrees-
       after.cameraSourcePractice.pitchDegrees)>.01||
       trial.throwDelta!==1||trial.explosionDelta!==1||
       trial.genuinePhysicalTicks<1||trial.scoreablePromotions!==0)
     reject('W10B42_PHYSICAL_THROW_AUTHORITY_'+label);
    return {name:label,requestedMouseDeltaPixels:{dx,dy},
     measuredYawDeltaDegrees:yaw,measuredPitchDeltaDegrees:pitch,...trial};
   };
   const b42Trials=[
    await b42MoveAndThrow('DOWNWARD_MOUSE_SWEEP',0,115),
    await b42MoveAndThrow('RIGHTWARD_MOUSE_SWEEP',140,0),
    await b42MoveAndThrow('LEFTWARD_MOUSE_SWEEP',-150,0),
    await b42MoveAndThrow('UPWARD_MOUSE_SWEEP',0,-160)
   ];
   const b42Unique=new Set();
   const foot=initial.player.position;
   let stamps=0,zero=0,cells=0;
   for(const trial of b42Trials){
    if(!trial.actualKeyF||!trial.actualPointerLockedInput||
       trial.natural4v4Certified!==false||
       trial.newOriginalPhysicsSolids!==0||trial.newNavLinks!==0||
       !trial.originalPlayerPosition.every(Number.isFinite)||
       Math.hypot(...trial.originalPlayerPosition.map(
        (v,i)=>v-foot[i]))>.1||
       trial.originalBombStampEvents!==
        trial.originalZeroChangeStampEvents+trial.originalChangedBombEvents||
       (trial.authoritativeChangedCells===0)!==
        (trial.originalChangedBombEvents===0)||
       trial.zeroChangeIsNotProvenPhysicalMiss!==true)
     reject('W10B42_INK_OR_ORIGINAL_FOOT_DRIFT_'+trial.name);
    const direction=[trial.cameraYawDegrees,trial.cameraPitchDegrees]
     .map(v=>v.toFixed(1)).join('/');
    if(b42Unique.has(direction))reject('W10B42_DUPLICATE_AIM_'+direction);
    b42Unique.add(direction);
    stamps+=trial.originalBombStampEvents;
    zero+=trial.originalZeroChangeStampEvents;
    cells+=trial.authoritativeChangedCells;
   }
   const b42={
    status:'PASS_FOUR_REAL_SOURCE_LOCAL_AIM_PROBES',
    b40InheritedChangedCells:[bombInk.humanBombChangedCells,
     sameAim.authoritativeChangedCells,pitchAim.authoritativeChangedCells],
    trials:b42Trials,uniqueRealCameraDirections:b42Unique.size,
    addedStamps:stamps,addedZeroChangeStamps:zero,addedNewCells:cells,
    realKeyFThrows:7,nativeExplosions:7,originalSolids:25,
    originalPaintable:17,originalNavLinks:26,scoreable:0,
    sourceDistanceCertified:false,physicalWallEdgeCertified:false,
    originalActorPlacementsCertified:false,natural4v4Certified:false,
    ownerGpuCertified:false,injectedPlayerOrInk:false,
    productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b42-native-source-aim-sweep.json'),
    JSON.stringify(b42,null,2));
   console.log('T21_W10B42_NATIVE_SOURCE_AIM_SWEEP_RECORDED',
    JSON.stringify(b42));
   // B43: join exactly seven real native explosions, chosen contact route,
   // launch/explosion coordinates, and actually enqueued source Paint IDs.
   // Projection is NOT proof of Nintendo-original collider authority.
   const b43All=[
    {case:'FIRST_NATIVE_SOURCE',stamps:bombInk.humanBombStampEvents,
     sourceId:bombInk.lastBombStampedSurface,
     witness:exploded.b43NativeBombWitnesses[0]},
    {case:'REPEAT_SOURCE',stamps:sameAim.originalBombStampEvents,
     sourceId:sameAim.lastOriginalStampedSurface,
     witness:sameAim.b43NativeExplosionWitness},
    {case:'PITCH_VARIANT',stamps:pitchAim.originalBombStampEvents,
     sourceId:pitchAim.lastOriginalStampedSurface,
     witness:pitchAim.b43NativeExplosionWitness},
    ...b42Trials.map(t=>({
     case:t.name,stamps:t.originalBombStampEvents,
     sourceId:t.lastOriginalStampedSurface,
     witness:t.b43NativeExplosionWitness
    }))
   ];
   const b43ContactKinds={PAINT_SURFACE_SEGMENT:0,RAPIER_STAGE_SOLID:0,NONE:0};
   const b43Triggers={CONTACT_IMPACT:0,LANDED_FUSE:0,FLIGHT_TTL:0};
   const b43Samples=[];
   const vec3=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
   for(let i=0;i<b43All.length;i++){
    const t=b43All[i],w=t.witness;
    if(!w||w.launchId!==i+1||!vec3(w.launchPoint)||
       !vec3(w.explosionPoint)||!Number.isSafeInteger(t.stamps)||
       !Array.isArray(w.enqueuedStampSurfaceIds)||
       w.enqueuedStampSurfaceIds.length!==t.stamps||
       w.enqueuedStampSurfaceIds.some(s=>typeof s!=='string'||!s)||
       w.originalGameCollisionCertified!==false||
       !Object.hasOwn(b43ContactKinds,w.contactKind)||
       !Object.hasOwn(b43Triggers,w.trigger))
     reject('W10B43_NATIVE_WITNESS_SOURCE_INVALID_'+t.case);
    const hasContact=w.contactKind!=='NONE';
    if(hasContact!==vec3(w.contactPoint)||
       hasContact!==Boolean(w.contactSourceId)||
       (w.trigger==='CONTACT_IMPACT'&&!hasContact)||
       (w.trigger==='LANDED_FUSE'&&!hasContact)||
       (hasContact&&Math.hypot(...w.explosionPoint.map(
        (v,j)=>v-w.contactPoint[j]))>1e-5)||
       (t.stamps>0&&w.enqueuedStampSurfaceIds.at(-1)!==t.sourceId)||
       (t.stamps===0&&t.sourceId!==null))
     reject('W10B43_CONTACT_VS_PROJECTION_AMBIGUITY_'+t.case);
    b43ContactKinds[w.contactKind]++;
    b43Triggers[w.trigger]++;
    b43Samples.push({case:t.case,nativeWitness:w,
     lastActuallyStampedPaintSurfaceId:t.sourceId,
     enqueuedStamps:t.stamps,
     stampIsNotPhysicalContactProof:true});
   }
   const b43Record={
    status:'PASS_NATIVE_EXPLOSION_CONTACT_AND_PROJECTED_STAMP_WITNESS',
    actualNativeHumanExplosions:b43Samples.length,
    matchedRealHumanKeyFThrows:7,
    actualContactKinds:b43ContactKinds,actualExplosionTriggers:b43Triggers,
    sourceOnlyWitnessSamples:b43Samples,
    originalSolids:25,paintableSurfaces:17,originalNavLinks:26,
    scoreableSurfaces:0,originalGameCollisionCertified:false,
    enqueuedStampNotEqualAuthoritativeOwnerChange:true,
    physicalContactNotProvenFromPaintProjection:true,
    originalActorPlacementsCertified:false,natural4v4Certified:false,
    productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b43-native-bomb-contact-witness.json'),
    JSON.stringify(b43Record,null,2));
   console.log('T21_W10B43_NATIVE_BOMB_CONTACT_WITNESS_PASS',
    JSON.stringify(b43Record));
   // B44: three more REAL pointer-locked mouse + KeyF native throws.
   // Actual fallback and TTL are observed, never forced or assumed.
   const b44New=[
    await b42MoveAndThrow('B44_REVERSE_AIM',600,0),
    await b42MoveAndThrow('B44_HIGH_ARC',0,-230),
    await b42MoveAndThrow('B44_LATERAL_AWAY',-550,0)
   ];
   const allB44=[
    ...b43Samples.map(v=>({label:v.case,w:v.nativeWitness,
     stamps:v.enqueuedStamps})),
    ...b44New.map(v=>({label:v.name,w:v.b43NativeExplosionWitness,
     stamps:v.originalBombStampEvents}))
   ];
   const counts={chosenPaint:0,chosenRapier:0,chosenNone:0,
    withRapierCandidate:0,withDualCandidate:0,flightTtl:0,
    landedFuse:0,contactImpact:0};
   const b44CandidateEvidence=[];
   for(let i=0;i<allB44.length;i++){
    const {label,w,stamps}=allB44[i],c=w?.firstContactCandidates;
    if(!w||w.launchId!==i+1||w.originalGameCollisionCertified!==false||
       !Number.isSafeInteger(w.flightQueryTicks)||w.flightQueryTicks<1||
       !Number.isSafeInteger(w.paintCandidateTicks)||
       !Number.isSafeInteger(w.rapierCandidateTicks)||
       !Number.isSafeInteger(w.dualCandidateTicks)||
       Math.min(w.paintCandidateTicks,w.rapierCandidateTicks,w.dualCandidateTicks)<0||
       Math.max(w.paintCandidateTicks,w.rapierCandidateTicks,
        w.dualCandidateTicks)>w.flightQueryTicks||
       w.dualCandidateTicks>Math.min(w.paintCandidateTicks,w.rapierCandidateTicks)||
       w.enqueuedStampSurfaceIds.length!==stamps)
     reject('W10B44_INVALID_NATIVE_QUERY_WITNESS_'+label);
    if(w.contactKind==='PAINT_SURFACE_SEGMENT')counts.chosenPaint++;
    else if(w.contactKind==='RAPIER_STAGE_SOLID')counts.chosenRapier++;
    else if(w.contactKind==='NONE')counts.chosenNone++;
    else reject('W10B44_UNKNOWN_CONTACT_KIND_'+label);
    if(w.trigger==='FLIGHT_TTL')counts.flightTtl++;
    else if(w.trigger==='LANDED_FUSE')counts.landedFuse++;
    else if(w.trigger==='CONTACT_IMPACT')counts.contactImpact++;
    else reject('W10B44_UNKNOWN_TRIGGER_'+label);
    if(w.rapierCandidateTicks>0)counts.withRapierCandidate++;
    if(w.dualCandidateTicks>0)counts.withDualCandidate++;
    if((w.contactKind==='NONE')!==(c===null)||
       (w.contactKind==='PAINT_SURFACE_SEGMENT'&&c?.paintId!==w.contactSourceId)||
       (w.contactKind==='RAPIER_STAGE_SOLID'&&c?.rapierId!==w.contactSourceId)||
       (c&&(!Number.isFinite(c.priorityEpsilon)||c.priorityEpsilon<0||
        (c.paintId!==null)!==Number.isFinite(c.paintDistance)||
        (c.rapierId!==null)!==Number.isFinite(c.rapierDistance)))||
       (w.contactKind==='PAINT_SURFACE_SEGMENT'&&c?.rapierId!==null&&
        c.paintDistance>c.rapierDistance+c.priorityEpsilon+1e-6)||
       (w.contactKind==='RAPIER_STAGE_SOLID'&&c?.paintId!==null&&
        c.paintDistance<=c.rapierDistance+c.priorityEpsilon))
     reject('W10B44_REAL_NATIVE_CONTACT_PRIORITY_MISMATCH_'+label);
    b44CandidateEvidence.push({case:label,launchId:w.launchId,
     launchPoint:w.launchPoint,explosionPoint:w.explosionPoint,
     contactKind:w.contactKind,contactSourceId:w.contactSourceId,
     trigger:w.trigger,firstContactCandidates:c,
     flightQueryTicks:w.flightQueryTicks,
     paintCandidateTicks:w.paintCandidateTicks,
     rapierCandidateTicks:w.rapierCandidateTicks,
     dualCandidateTicks:w.dualCandidateTicks,stamps});
   }
   const result={
    status:'PASS_REAL_B44_NATIVE_DUAL_QUERY_CANDIDATE_AUDIT',
    humanKeyFThrows:10,nativeExplosions:10,
    oldNativeTraces:7,newRealMouseTrajectories:3,
    counts,traces:b44CandidateEvidence,
    rapierSelectedObserved:counts.chosenRapier>0,
    noContactFlightTtlObserved:counts.flightTtl>0,
    originalGameCollisionCertified:false,
    newPhysicsOrPaintAuthorizations:0,
    originalSolids:25,originalPaintable:17,navLinks:26,scoreable:0,
    normal4v4Certified:false,productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b44-real-native-dual-query.json'),
    JSON.stringify(result,null,2));
   console.log('T21_W10B44_NATIVE_DUAL_QUERY_AUDIT',JSON.stringify(result));
   // B45 samples real original Rapier solid-only rays from the actual
   // native player muzzle. THIS IS STATIC READ-ONLY LINE-OF-SIGHT,
   // NOT proof of a ballistic bomb hit or original game world physics.
   const b45Survey=await evaluate(
    'window.__t21F3.auditB45OriginalColliderRays()');
   if(b45Survey.status!=='B45_READ_ONLY_NATIVE_SOURCE_SOLID_ONLY_RAY_SURVEY'||
      b45Survey.totalOriginalSolids!==25||
      b45Survey.totalOriginalPaintable!==17||
      b45Survey.totalOriginalNavLinks!==26||
      b45Survey.scoreableSurfaces!==0||
      b45Survey.authenticBombCollisionCertified!==false||
      b45Survey.originalGameCollisionCertified!==false||
      b45Survey.productionAuthorized!==false||
      b45Survey.stageGeometryModified!==false||
      b45Survey.tested!==648||
      !Array.isArray(b45Survey.nearestRayCandidates)||
      b45Survey.nearestRayCandidates.length>16||
      b45Survey.nearestRayCandidates.length>
       b45Survey.rapierWins||
      b45Survey.rapierWins<0||
      b45Survey.rapierWins>b45Survey.solidHits)
    reject('W10B45_SOURCE_RAPIER_RAY_SURVEY_AUTHORITY_DRIFT');
   const nonPaintIds=new Set(b45Survey.nonPaintBackedSolidIds);
   const candidateIds=new Set(b45Survey.distinctRapierWinnerIds);
   for(const c of b45Survey.nearestRayCandidates){
    if(!candidateIds.has(c.sourceSolidId)||
       !Number.isFinite(c.solidDistance)||
       c.solidDistance<0||c.solidDistance>30||
       (c.paintSurfaceId===null)!==(c.paintDistance===null)||
       (c.paintDistance!==null&&
        c.paintDistance<=c.solidDistance+0.06)||
       c.solidHasRegisteredPaintBacking===
        nonPaintIds.has(c.sourceSolidId))
     reject('W10B45_FALSE_SOLID_ONLY_RAY_CANDIDATE_'+
      JSON.stringify(c));
   }
   const surveyResult={
    ...b45Survey,
    b44NativePriorRealHumanThrows:10,
    newB45HumanKeyFThrows:0,
    noArtificialBallisticPrediction:true,
    originalSourceOnly:true
   };
   writeFileSync(resolve(OUTPUT,'w10b45-original-solid-only-rays.json'),
    JSON.stringify(surveyResult,null,2));
   console.log('T21_W10B45_ORIGINAL_SOLID_ONLY_RAY_SURVEY',
    JSON.stringify(surveyResult));
   // B45 stage 2: apply real pointer-locked CDP mouse movement toward a
   // read-only short-range Rapier-FIRST ray. Projectile trajectory remains
   // 100% native gravity/fuse; a winning straight line does NOT guarantee
   // a winning actual ballistic bomb.
   const b45Target=b45Survey.nearestRayCandidates.find(c=>
    c.solidDistance<=3&&c.paintSurfaceId===null&&
    c.sourceSolidId.includes('first-drop-landing-negative-z'))??null;
   let b45ActualTrial=null, b45Aim=null;
   if(b45Target){
    await refill();
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!locked)reject('W10B45_NOT_REAL_POINTER_LOCK');
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800,y:450,button:'none'
    });
    const a0=await evaluate('window.__t21F3.snapshot()');
    const wrapYaw=x=>((x+540)%360)-180;
    const diffYaw=wrapYaw(b45Target.yaw-
     a0.cameraSourcePractice.yawDegrees);
    const diffPitch=b45Target.pitch-
     a0.cameraSourcePractice.pitchDegrees;
    const dx=Math.round(diffYaw/.22),dy=Math.round(-diffPitch/.18);
    if(Math.abs(dx)>700||Math.abs(dy)>360)
     reject('W10B45_REAL_MOUSE_TARGET_OUT_OF_BOUNDED_RANGE');
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800+dx,y:450+dy,button:'none'
    });
    let aimed=await evaluate('window.__t21F3.snapshot()');
    let yawErr=wrapYaw(b45Target.yaw-
     aimed.cameraSourcePractice.yawDegrees);
    let pitchErr=b45Target.pitch-
     aimed.cameraSourcePractice.pitchDegrees;
    // One measured physical mouse correction; no writes to camera state.
    if(Math.abs(yawErr)>3||Math.abs(pitchErr)>3){
     await cmd('Input.dispatchMouseEvent',{
      type:'mouseMoved',
      x:800+dx+Math.round(yawErr/.22),
      y:450+dy+Math.round(-pitchErr/.18),button:'none'
     });
     aimed=await evaluate('window.__t21F3.snapshot()');
     yawErr=wrapYaw(b45Target.yaw-
      aimed.cameraSourcePractice.yawDegrees);
     pitchErr=b45Target.pitch-
      aimed.cameraSourcePractice.pitchDegrees;
    }
    const distanceFoot=Math.hypot(...aimed.player.position.map(
     (v,i)=>v-b45Survey.playerFoot[i]));
    if(distanceFoot>.1||
       aimed.originalSourceSolids!==25||
       aimed.originalPaintSurfaces!==17||
       aimed.sourceScoreablePromotions!==0)
     reject('W10B45_NATIVE_FOOT_OR_ORIGINAL_SOURCE_DRIFT');
    const aligned=Math.abs(yawErr)<=7&&Math.abs(pitchErr)<=7;
    b45Aim={sourceTarget:b45Target,
     before:{yaw:a0.cameraSourcePractice.yawDegrees,
      pitch:a0.cameraSourcePractice.pitchDegrees},
     after:{yaw:aimed.cameraSourcePractice.yawDegrees,
      pitch:aimed.cameraSourcePractice.pitchDegrees},
     actualYawErrorDegrees:yawErr,actualPitchErrorDegrees:pitchErr,
     originalFootErrorMeters:distanceFoot,aligned,
     actualPointerLockedMouse:true,syntheticCameraWrites:0};
    if(aligned){
     b45ActualTrial=await throwObserved('B45_REAL_MOUSE_SOURCE_RAPIER_RAY_TARGET');
     if(b45ActualTrial.throwDelta!==1||
        b45ActualTrial.explosionDelta!==1||
        b45ActualTrial.scoreablePromotions!==0)
      reject('W10B45_GENUINE_HUMAN_THROW_AUTHORITY_DRIFT');
    }
   }
   const b45RealResult={
    status:'B45_SOURCE_RAPIER_RAY_REAL_BALLISTIC_TRIAL_RECORDED',
    rayTargetFound:b45Target!==null,
    actualHumanKeyFTrialPerformed:b45ActualTrial!==null,
    realMouseAim:b45Aim,
    actualNativeBombTrial:b45ActualTrial,
    actualRapierSolidContactSelected:
     b45ActualTrial?.b43NativeExplosionWitness?.contactKind===
      'RAPIER_STAGE_SOLID',
    originalGameCollisionCertified:false,
    originalSurfaceAuthority:[25,17,26,0],
    anyArtificialWorldOrProjectileChange:false,
    productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b45-real-targeted-rapier-bomb.json'),
    JSON.stringify(b45RealResult,null,2));
   console.log('T21_W10B45_REAL_TARGETED_RAPIER_BOMB',
    JSON.stringify(b45RealResult));
   // B46: source-only fine scan (pitch <= native camera max 28 degrees)
   // followed by at most ONE genuinely played KeyF throw.
   const b46Scan=b45Survey.b46HighSpawn;
   if(!b46Scan||b46Scan.tested!==132||
      b46Scan.status!=='SOURCE_CAMERA_CLAMPED_HIGH_SPAWN_RAP_TIME'||
      b46Scan.rapierFirst<0||
      b46Scan.boxBottomFaceHits>b46Scan.rapierFirst||
      b46Scan.candidates.length>12||
      b46Scan.actualBombCollisionCertified!==false)
    reject('B46_FINE_SCAN_INVALID');
   const candidate=b46Scan.candidates.find(t=>t.boxBottomFaceCandidate&&
    t.solidDistance<=12)??null;
   let b46Trial=null,realAim=null;
   if(candidate){
    await refill();
    const pointerLocked=await evaluate(
      'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!pointerLocked)reject('B46_REAL_POINTER_LOCK_MISSING');
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800,y:450,button:'none'
    });
    const beforeAim=await evaluate('window.__t21F3.snapshot()');
    const wrap=x=>((x+540)%360)-180;
    const dx=Math.round(wrap(candidate.yaw-
     beforeAim.cameraSourcePractice.yawDegrees)/.22);
    const dy=Math.round(-(candidate.pitch-
     beforeAim.cameraSourcePractice.pitchDegrees)/.18);
    if(Math.abs(dx)>820||Math.abs(dy)>450)
     reject('B46_TARGET_MOUSE_DELTA_TOO_LARGE');
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800+Math.round(dx/2),
     y:450+Math.round(dy/2),button:'none'
    });
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800+dx,y:450+dy,button:'none'
    });
    let aimed=await evaluate('window.__t21F3.snapshot()');
    let yawErr=wrap(candidate.yaw-aimed.cameraSourcePractice.yawDegrees);
    let pitchErr=candidate.pitch-aimed.cameraSourcePractice.pitchDegrees;
    if(Math.abs(yawErr)>2||Math.abs(pitchErr)>2){
     await cmd('Input.dispatchMouseEvent',{
      type:'mouseMoved',x:800+dx+Math.round(yawErr/.22),
      y:450+dy+Math.round(-pitchErr/.18),button:'none'
     });
     aimed=await evaluate('window.__t21F3.snapshot()');
     yawErr=wrap(candidate.yaw-aimed.cameraSourcePractice.yawDegrees);
     pitchErr=candidate.pitch-aimed.cameraSourcePractice.pitchDegrees;
    }
    const footDiff=Math.hypot(...aimed.player.position.map(
      (v,i)=>v-b45Survey.playerFoot[i]));
    if(footDiff>.1||aimed.originalSourceSolids!==25||
       aimed.originalPaintSurfaces!==17||
       aimed.originalSourceNavigationLinks!==26||
       aimed.sourceScoreablePromotions!==0)
      reject('B46_PLAYER_FOOT_OR_SOURCE_DRIFT');
    realAim={candidate,
     nativeCameraYaw:aimed.cameraSourcePractice.yawDegrees,
     nativeCameraPitch:aimed.cameraSourcePractice.pitchDegrees,
     yawError:yawErr,pitchError:pitchErr,sourceFootDiff:footDiff,
     realPointerLockedInput:true,syntheticAimWrites:0};
    if(Math.abs(yawErr)<=4&&Math.abs(pitchErr)<=4){
     b46Trial=await throwObserved('B46_NATIVE_HIGH_SPAWN_BOX_BOTTOM_TRY');
     if(b46Trial.throwDelta!==1||b46Trial.explosionDelta!==1||
       b46Trial.b43NativeExplosionWitness.launchId!==12)
      reject('B46_NATIVE_SUB_THROW_UNVERIFIED');
    }
   }
   const b46={
    status:'B46_SOURCE_HIGH_SPAWN_RAY_AND_NATIVE_BOMB_OBSERVED',
    sourceRayScan:b46Scan,realAim,
    keyFThrown:b46Trial!==null,nativeThrow:b46Trial,
    actuallyChosenRapierCollider:
     b46Trial?.b43NativeExplosionWitness?.contactKind==='RAPIER_STAGE_SOLID',
    originalGameColliderAuthorityCertified:false,
    officialScoreable:0,originalSolids:25,paintable:17,links:26,
    normal4v4Certified:false,
    productionAuthorized:false,
    syntheticCameraOrPhysicsChanges:0
   };
   writeFileSync(resolve(OUTPUT,'w10b46-real-high-spawn-bomb.json'),
    JSON.stringify(b46,null,2));
   console.log('T21_W10B46_REAL_HIGH_SPAWN_BOMB_EVIDENCE',
    JSON.stringify(b46));
   // B47: additional genuine pointer-locked mouse and F-key native
   // player throws. Actual native launch velocities are observed in the
   // QA-only SubWeaponSystem callback; never synthetically applied.
   const b47Extra=[
    await b42MoveAndThrow('B47_TRUE_BALLISTIC_AIM_A',-80,90),
    await b42MoveAndThrow('B47_TRUE_BALLISTIC_AIM_B',40,-130)
   ];
   const b47Replay=await evaluate(
    'window.__t21F3.auditB47NativeBallisticReplay()');
   if(b47Replay.status!=='B47_READONLY_ACTUAL_LAUNCH_NATIVE_PHYSICS_REPLAY'||
      b47Replay.actualNativeThrows!==14||
      b47Replay.samples.length!==14||
      b47Replay.sourceSolids!==25||b47Replay.paintable!==17||
      b47Replay.links!==26||b47Replay.scoreable!==0||
      b47Replay.physicsAndPaintUnmodified!==true||
      b47Extra.some(t=>!t.actualPointerLockedInput||
       t.throwDelta!==1||t.explosionDelta!==1))
    reject('W10B47_TRUE_LAUNCH_SOURCE_AUDIT_INVALID');
   const b47Result={
    status:b47Replay.exactMatches===14?'B47_NATIVE_REPLAY_14_OF_14_PASS':
     'B47_NATIVE_REPLAY_DISCREPANCY_HOLD',
    oldSourceRealKeyFThrows:12,newRealKeyFThrows:2,
    newThrowCases:b47Extra,readonlyReplay:b47Replay,
    rapierActualChosen:b47Replay.samples.some(t=>
     t.realKind==='RAPIER_STAGE_SOLID'),
    originalNintendoCollisionCertified:false,
    noArtificialTrajectoriesOrSourceChanges:true,
    normal4v4Certified:false,productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b47-native-ballistic-traces.json'),
    JSON.stringify(b47Result,null,2));
   console.log('T21_W10B47_NATIVE_BALLISTIC_REPLAY_EVIDENCE',
    JSON.stringify(b47Result));
   if(b47Replay.exactMatches!==14)
    reject('W10B47_NATIVE_BALLISTIC_REPLAY_MISMATCH');
   // B48: preflight on existing native launch origins. Hypothetical
   // launch directions are NEVER assumed to be realizable camera aim.
   const b48Pre=await evaluate(
    'window.__t21F3.auditB48NativeSourceBallisticCandidates()');
   if(b48Pre.status!=='B48_TIME_PARAMETRIZED_SOURCE_MUZZLE_SEARCH'||
      b48Pre.testedNativeTimeSteppedDirections!==578||
      b48Pre.counts.tested!==578||
      b48Pre.counts.nativePaintFirst+
       b48Pre.counts.nativeRapierFirst+
       b48Pre.counts.noContactWithinTtl!==578||
      b48Pre.counts.highSpawnRapierFirst>
       b48Pre.counts.nativeRapierFirst||
      b48Pre.allOriginalSolids!==25||b48Pre.allPaintable!==17||
      b48Pre.navLinks!==26||b48Pre.scoreable!==0||
      b48Pre.thisIsHypotheticalVelocityNotCameraAim!==true||
      b48Pre.actualGamePhysicsModified!==false||
      b48Pre.nearestSourceBallisticRapierCandidates.length>20||
      b48Pre.actualHumanThrowsAddedBySearch!==0)
    reject('W10B48_SOURCE_ONLY_NATIVE_TRAJECTORY_SEARCH_INVALID');
   for(const c of b48Pre.nearestSourceBallisticRapierCandidates){
    if(![12,14].includes(c.actualSourceLaunchId)||
       c.predictedContact.kind!=='RAPIER_STAGE_SOLID'||
       !Number.isInteger(c.predictedContact.flightTick)||
       c.predictedContact.flightTick<1||
       c.predictedContact.flightTick>180||
       c.humanCameraAngleCertified!==false||
       c.actualKeyFContactCertified!==false)
     reject('W10B48_UNSUPPORTED_NATIVE_RAPIER_PREDICTION');
   }
   // The preflight deliberately does not fire an artificial projectile.
   // If a candidate exists, a separate genuine mouse+KeyF trial can be
   // measured and compared to the predicted native outgoing velocity.
   const b48Report={
    status:'B48_READONLY_PRE_FLIGHT_SOURCE_SEARCH_RECORDED',
    preflight:b48Pre,
    realKeyFThrowsTotal:14,additionalActualThrows:0,
    predictedRapierIsNotActualRapier:true,
    productionAuthorized:false,originalCollisionCertified:false
   };
   writeFileSync(resolve(OUTPUT,'w10b48-source-ballistic-preflight.json'),
    JSON.stringify(b48Report,null,2));
   console.log('T21_W10B48_BALLISTIC_PREFLIGHT',JSON.stringify(b48Report));
   // B48: aim at two ACTUAL source-foot candidate velocities using the
   // calibrated NATIVE camera/launch correspondence of real throws
   // #12 and #14. This is a heuristic; we do NOT claim arbitrary native
   // velocity is camera-achievable until true KeyF launch is measured.
   const targetRows=[
    {anchorId:12,yaw:-60,pitch:30,priorCamera:b46.realAim},
    {anchorId:14,yaw:-50,pitch:-20,priorCamera:{
     nativeCameraYaw:b47Extra[1].cameraYawDegrees,
     nativeCameraPitch:b47Extra[1].cameraPitchDegrees}}
   ];
   const b48Actual=[];
   const wrap48=x=>((x+540)%360)-180;
   const radToDeg=180/Math.PI;
   const nativeAngles=v=>{
    const speed=10.5,upward=4.6;
    return {yaw:Math.atan2(v[0],-v[2])*radToDeg,
     pitch:Math.asin(Math.max(-1,Math.min(1,(v[1]-upward)/speed)))*
      radToDeg};
   };
   for(const row of targetRows){
    const pre=b48Pre.nearestSourceBallisticRapierCandidates.find(v=>
     v.actualSourceLaunchId===row.anchorId&&
     v.hypotheticalLaunchYawDegrees===row.yaw&&
     v.hypotheticalLaunchPitchDegrees===row.pitch);
    if(!pre)reject('W10B48_GROUNDED_BALLISTIC_SOURCE_CANDIDATE_MISSING');
    const ref=b47Replay.samples.find(x=>x.launchId===row.anchorId);
    if(!ref||!row.priorCamera||
       !Number.isFinite(row.priorCamera.nativeCameraYaw)||
       !Number.isFinite(row.priorCamera.nativeCameraPitch))
     reject('W10B48_REAL_HUMAN_CAMERA_CALIBRATION_MISSING');
    const nativeRef=nativeAngles(ref.initialNativeVelocity);
    const wantedCameraYaw=wrap48(row.priorCamera.nativeCameraYaw+
     wrap48(row.yaw-nativeRef.yaw));
    const rawWantedPitch=row.priorCamera.nativeCameraPitch+
     row.pitch-nativeRef.pitch;
    const wantedCameraPitch=Math.max(-55,Math.min(28,rawWantedPitch));
    await refill();
    const beforeAim=await evaluate('window.__t21F3.snapshot()');
    const locked=await evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!locked)reject('W10B48_NATIVE_POINTER_LOCK_NOT_HELD');
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800,y:450,button:'none'
    });
    const dx=Math.round(wrap48(wantedCameraYaw-
     beforeAim.cameraSourcePractice.yawDegrees)/.22);
    const dy=Math.round(-(wantedCameraPitch-
     beforeAim.cameraSourcePractice.pitchDegrees)/.18);
    if(Math.abs(dx)>720||Math.abs(dy)>470)
     reject('W10B48_CAMERA_SWEEP_UNREALISTIC_'+row.anchorId);
    await cmd('Input.dispatchMouseEvent',{
     type:'mouseMoved',x:800+dx,y:450+dy,button:'none'
    });
    let aimed=await evaluate('window.__t21F3.snapshot()');
    let ye=wrap48(wantedCameraYaw-aimed.cameraSourcePractice.yawDegrees);
    let pe=wantedCameraPitch-aimed.cameraSourcePractice.pitchDegrees;
    if(Math.abs(ye)>2||Math.abs(pe)>2){
     await cmd('Input.dispatchMouseEvent',{
      type:'mouseMoved',x:800+dx+Math.round(ye/.22),
      y:450+dy+Math.round(-pe/.18),button:'none'
     });
     aimed=await evaluate('window.__t21F3.snapshot()');
     ye=wrap48(wantedCameraYaw-aimed.cameraSourcePractice.yawDegrees);
     pe=wantedCameraPitch-aimed.cameraSourcePractice.pitchDegrees;
    }
    const footDelta=Math.hypot(...aimed.player.position.map(
     (v,i)=>v-b45Survey.playerFoot[i]));
    if(footDelta>.1||Math.abs(ye)>4||Math.abs(pe)>4||
       aimed.originalSourceSolids!==25||
       aimed.originalPaintSurfaces!==17||
       aimed.originalSourceNavigationLinks!==26||
       aimed.sourceScoreablePromotions!==0)
     reject('W10B48_REAL_SOURCE_FOOT_OR_AIM_DRIFT_'+row.anchorId);
    const trial=await throwObserved(
     'B48_ACTUAL_CAMERA_APPROX_CANDIDATE_'+row.anchorId);
    const witness=trial.b43NativeExplosionWitness;
    if(trial.throwDelta!==1||trial.explosionDelta!==1||
       witness.launchId!==14+b48Actual.length+1||
       witness.originalGameCollisionCertified!==false)
     reject('W10B48_REAL_KEY_F_OR_SOURCE_AUTHORITY_'+row.anchorId);
    const actualNative=nativeAngles(witness.initialNativeVelocity);
    const predicted=pre.hypotheticalInitialVelocity;
    b48Actual.push({
     predictedNativeRapierCandidate:pre,
     calibrationFromRealHumanThrow:row.anchorId,
     observedCameraYaw:aimed.cameraSourcePractice.yawDegrees,
     observedCameraPitch:aimed.cameraSourcePractice.pitchDegrees,
     cameraYawErrorDegrees:ye,cameraPitchErrorDegrees:pe,
     cameraPitchClamped:rawWantedPitch!==wantedCameraPitch,
     footDeviationMeters:footDelta,
     achievedNativeOutgoingYaw:actualNative.yaw,
     achievedNativeOutgoingPitch:actualNative.pitch,
     nativeOutgoingYawDeltaFromPrediction:
      wrap48(actualNative.yaw-row.yaw),
     nativeOutgoingPitchDeltaFromPrediction:
      actualNative.pitch-row.pitch,
     launchVelocityDeviationMetersPerSecond:
      Math.hypot(...witness.initialNativeVelocity.map(
       (v,i)=>v-predicted[i])),
     nativeContactActuallyChosen:witness.contactKind,
     actualNativeContactSourceId:witness.contactSourceId,
     actualHumanThrow:trial,
     actualRapierSelected:witness.contactKind==='RAPIER_STAGE_SOLID',
     noSyntheticCameraWrites:true,noProjectileInjection:true});
   }
   const resultB48Real={
    status:'B48_TWO_REAL_CALIBRATED_NATIVE_THROW_TRIALS_RECORDED',
    preflightPredictedRapierCandidates:b48Pre.counts.nativeRapierFirst,
    realNewKeyFThrows:b48Actual.length,allRealThrows:16,
    actualSourceTrials:b48Actual,
    realRapierContactSelectedCount:b48Actual.filter(
     x=>x.actualRapierSelected).length,
    hypotheticalVelocityNotAssumedAchievable:true,
    sourceOriginalSolids:25,originalPaintable:17,
    originalLinks:26,scoreable:0,
    originalNintendoColliderCertified:false,
    productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b48-calibrated-actual-native-keyf.json'),
    JSON.stringify(resultB48Real,null,2));
   console.log('T21_W10B48_CALIBRATED_REAL_KEY_F_THROW',
    JSON.stringify(resultB48Real));
   // B49: repeated genuine Chrome pointer-locked KeyF trials using the
   // SAME observed camera aim as the first truly Rapier-selected bomb #15.
   // No camera-setter, no projectile injection, no physical/paint mutation.
   const b49Baseline=b48Actual[0];
   const b49Witness=b49Baseline.actualHumanThrow.b43NativeExplosionWitness;
   if(!b49Baseline.actualRapierSelected||
      b49Witness.contactKind!=='RAPIER_STAGE_SOLID'||
      b49Witness.contactSourceId!=='UndertowT21D:right-low-team-b'||
      b49Witness.firstContactCandidates?.paintId!==null||
      b49Witness.firstContactCandidates?.rapierId!==b49Witness.contactSourceId)
    reject('W10B49_NO_REAL_RAPIER_POSITIVE_CONTROL');
   const b49Repeats=[];
   const wrap49=x=>((x+540)%360)-180;
   const xyzDifference=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
   const referenceYaw=b49Baseline.observedCameraYaw;
   const referencePitch=b49Baseline.observedCameraPitch;
   for(let i=0;i<3;i++){
    await refill();
    const locked=await evaluate(
      'document.pointerLockElement===document.querySelector("#app-canvas")');
    if(!locked)reject('W10B49_POINTER_LOCK_LOST_'+i);
    await cmd('Input.dispatchMouseEvent',{
      type:'mouseMoved',x:800,y:450,button:'none'
    });
    const before=await evaluate('window.__t21F3.snapshot()');
    if(!before.paused||before.stopReason)
      reject('W10B49_SOURCE_NOT_PAUSED_'+i);
    const dx=Math.round(wrap49(referenceYaw-
      before.cameraSourcePractice.yawDegrees)/.22);
    const dy=Math.round(-(referencePitch-
      before.cameraSourcePractice.pitchDegrees)/.18);
    if(Math.abs(dx)>750||Math.abs(dy)>460)
      reject('W10B49_UNBOUNDED_REAL_MOUSE_'+i);
    await cmd('Input.dispatchMouseEvent',{
      type:'mouseMoved',x:800+dx,y:450+dy,button:'none'
    });
    let aimed=await evaluate('window.__t21F3.snapshot()');
    let yawError=wrap49(referenceYaw-
      aimed.cameraSourcePractice.yawDegrees);
    let pitchError=referencePitch-
      aimed.cameraSourcePractice.pitchDegrees;
    if(Math.abs(yawError)>.1||Math.abs(pitchError)>.1){
      await cmd('Input.dispatchMouseEvent',{
       type:'mouseMoved',x:800+dx+Math.round(yawError/.22),
       y:450+dy+Math.round(-pitchError/.18),button:'none'
      });
      aimed=await evaluate('window.__t21F3.snapshot()');
      yawError=wrap49(referenceYaw-
        aimed.cameraSourcePractice.yawDegrees);
      pitchError=referencePitch-
        aimed.cameraSourcePractice.pitchDegrees;
    }
    const footError=xyzDifference(
      aimed.player.position,b49Baseline.actualHumanThrow.originalPlayerPosition);
    if(footError>.1||Math.abs(yawError)>.4||
       Math.abs(pitchError)>.4||
       aimed.originalSourceSolids!==25||
       aimed.originalPaintSurfaces!==17||
       aimed.originalSourceNavigationLinks!==26||
       aimed.sourceScoreablePromotions!==0||
       aimed.productionAuthorized!==false)
      reject('W10B49_REAL_AIM_FOOT_OR_ORIGINAL_SOURCE_DRIFT_'+i);
    const result=await throwObserved('B49_TRUE_RAPIER_REPEAT_'+(i+1));
    const witness=result.b43NativeExplosionWitness;
    if(!result.actualKeyF||!result.actualPointerLockedInput||
       result.throwDelta!==1||result.explosionDelta!==1||
       witness.launchId!==17+i||
       witness.originalGameCollisionCertified!==false||
       result.originalBombStampEvents!==witness.enqueuedStampSurfaceIds.length)
      reject('W10B49_MISSING_NATIVE_HUMAN_WITNESS_'+i);
    const sameNativeRapierSolid=witness.contactKind==='RAPIER_STAGE_SOLID'&&
      witness.contactSourceId===b49Witness.contactSourceId&&
      witness.firstContactCandidates?.rapierId===b49Witness.contactSourceId&&
      witness.firstContactCandidates?.paintId===null;
    b49Repeats.push({
      repetition:i+1,realNativeThrowId:witness.launchId,
      realMouseYaw:aimed.cameraSourcePractice.yawDegrees,
      realMousePitch:aimed.cameraSourcePractice.pitchDegrees,
      nativeCameraYawError:yawError,nativeCameraPitchError:pitchError,
      originalFootErrorMeters:footError,
      realLaunchVelocity:witness.initialNativeVelocity,
      baselineNativeVelocityDeviationMetersPerSecond:
        xyzDifference(witness.initialNativeVelocity,
          b49Witness.initialNativeVelocity),
      actualContactKind:witness.contactKind,
      actualContactSourceId:witness.contactSourceId,
      actualContactPosition:witness.contactPoint,
      originalRapierContactPositionDeviationMeters:witness.contactPoint?
        xyzDifference(witness.contactPoint,b49Witness.contactPoint):null,
      nativeFlightQueryTicks:witness.flightQueryTicks,
      actualExplosionTrigger:witness.trigger,
      originalStampEvents:result.originalBombStampEvents,
      postGameplayInkNewOwnerCells:result.authoritativeChangedCells,
      sameSourceRapierContactReproduced:sameNativeRapierSolid,
      fullNativeWitness:witness,
      originalNintendoCollisionCertified:false,
      noSyntheticCameraOrProjectileWrites:true
    });
   }
   const b49Success=b49Repeats.filter(t=>
      t.sameSourceRapierContactReproduced);
   const b49Report={
     status:b49Success.length===3?
      'B49_ALL_THREE_NATIVE_SOURCE_RAPIER_REPEATS_CONFIRMED':
      'B49_PARTIAL_NATIVE_SOURCE_RAPIER_REPEAT_OBSERVATIONS',
     actualPositiveControlNativeThrowId:b49Witness.launchId,
     chosenOriginalSolid:b49Witness.contactSourceId,
     baselineNativeContactPoint:b49Witness.contactPoint,
     baselineActualLaunchVelocity:b49Witness.initialNativeVelocity,
     originalBaselineNewOwnerCells:
      b49Baseline.actualHumanThrow.authoritativeChangedCells,
     actualNewHumanKeyFThrows:b49Repeats.length,
     totalNativeHumanKeyFThrows:19,
     chosenRapierRepeatCount:b49Success.length,
     actualNativeRepeats:b49Repeats,
     repeatedNewOwnerCells:b49Repeats.reduce(
      (sum,t)=>sum+t.postGameplayInkNewOwnerCells,0),
     maxOriginalRapierContactPointDeviationMeters:b49Success.length?
      Math.max(...b49Success.map(
       t=>t.originalRapierContactPositionDeviationMeters)):null,
     maxNativeLaunchVelocityDeviationMetersPerSecond:Math.max(
      ...b49Repeats.map(t=>
       t.baselineNativeVelocityDeviationMetersPerSecond)),
     physicalOriginalSolids:25,originalPaintable:17,navLinks:26,
     scoreableSurfaces:0,originalGameCollisionCertified:false,
     cpuStandardPatrolUnmodified:true,
     nativePhysicsAndCameraAlgorithmsUnchanged:true,
     normal4v4Certified:false,productionAuthorized:false
   };
   writeFileSync(resolve(OUTPUT,'w10b49-real-native-rapier-repeatability.json'),
    JSON.stringify(b49Report,null,2));
   console.log('T21_W10B49_REAL_RAPIER_REPEATABILITY',
    JSON.stringify(b49Report));









  }
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
  // B78: the actual B29 original-UV A/B/A source artifact showed the
  // exact SAME 258 max-1-step pixels at x1301..1563, y396..410 as
  // the B28 source artifact. The flat B differed from A in over 1M
  // visible pixels. Verify genuine raster reversibility, never an
  // unstable PNG encoder/hash exact match or rubber-stamped pass.
  const b78UvFidelity=verifyB77OriginalSourceAbaRaster(
   readFileSync(resolve(OUTPUT,originalUv.name+'.png')),
   readFileSync(resolve(OUTPUT,flatImage.name+'.png')),
   readFileSync(resolve(OUTPUT,restoredImage.name+'.png')));
  if(!b78UvFidelity.sourceAppearanceRestored||
     !b78UvFidelity.intentionalHologramMaterialChangeVerified)
   reject('W10B78_REAL_WEBGL2_ORIGINAL_UV_NOT_RESTORED_'+
    JSON.stringify({originalUv,flatImage,restoredImage,
     b78UvFidelity}));
  console.log('T21_W10B29_REAL_CHROME_57578_ORIGINAL_UV_DEFAULT_PASS',
   JSON.stringify({verifiedTriangleCount:57578,
    originalTextureCount:ready.verifiedTextures,
    originalUVsha256:originalUv.sha256,flatSha256:flatImage.sha256,
    restoredUVsha256:restoredImage.sha256,
    screenshotRestorationPixelVerified:true,
    screenshotByteHashExactlyIdentical:
     originalUv.sha256===restoredImage.sha256,
    actualFidelity:b78UvFidelity,sourceOnly:true,
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
 if(w10b51){
  const pre=await evaluate('window.__t21F3.pause()');
  if(!pre.paused||pre.stopReason)reject('W10B51_PAUSE_FAILED');
  const k={key:'s',code:'KeyS',windowsVirtualKeyCode:83,nativeVirtualKeyCode:83};
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...k});
  const post=await evaluate('window.__t21F3.advanceQaTicks('+b51Ticks+')');
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...k});
  const a3=[-.8030697107315063,67.07270050048828];
  const retreat=Math.hypot(...post.player.position.map((v,i)=>v-pre.player.position[i]));
  const lane=Math.hypot(post.player.position[0]-a3[0],post.player.position[2]-a3[1]);
  const result={requestedNativeTicks:b51Ticks,actualNativeTicks:post.tick-pre.tick,
   realCdpKeyS:true,realPointerLockedInput:true,pausedOriginalRapierClock:true,
   pre:{tick:pre.tick,foot:pre.player.position},
   post:{tick:post.tick,foot:post.player.position},
   realRetreatMeters:retreat,realLaneSeparationMeters:lane,
   originalThresholds:{retreat:1.5,lane:1.6},
   margins:{retreat:retreat-1.5,lane:lane-1.6},
   meetsOriginalB35Gate:retreat>=1.5&&lane>=1.6,
   source:{solids:post.originalSourceSolids,paintable:post.originalPaintSurfaces,
    navLinks:post.originalSourceNavigationLinks,scoreable:post.sourceScoreablePromotions},
   noSyntheticPlayerAxis:true,noTeleports:true,noCpuHeuristicChanges:true,
   natural4v4Certified:false,productionAuthorized:false};
  writeFileSync(resolve(OUTPUT,'w10b51-exact-s-'+b51Ticks+'.json'),JSON.stringify(result,null,2));
  console.log('T21_W10B51_EXACT_NATIVE_S_BOUNDARY',JSON.stringify(result));
  if(post.tick-pre.tick!==b51Ticks||post.originalSourceSolids!==25||
     post.originalPaintSurfaces!==17||post.originalSourceNavigationLinks!==26||
     post.sourceScoreablePromotions!==0||!Number.isFinite(retreat)||!Number.isFinite(lane))
   reject('W10B51_NATIVE_PHYSICS_OR_SOURCE_INTEGRITY');
  return;
 }
 if(w10b50){
  // Genuine source-only trusted W + mouse shot + S, with exactly the
  // original B35 1.5m retreat and 1.6m lane clearance thresholds.
  // Unlike long CPU QA, stop here after evidence and independent verdict.
  const origin=await evaluate('window.__t21F3.snapshot()');
  const retreatKey={key:'s',code:'KeyS',
   windowsVirtualKeyCode:83,nativeVirtualKeyCode:83};
  const heldStart=Date.now();
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...retreatKey});
  const stepped=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   if(state.stopReason)reject('B50_NATIVE_RETREAT_STOP_'+state.stopReason);
   return state.tick>=origin.tick+38?state:false;
  },70000);
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...retreatKey});
  const heldMs=Date.now()-heldStart;
  const originalSourceCpuA3=[-.8030697107315063,67.07270050048828];
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const retreatMeters=distance(stepped.player.position,
   origin.player.position);
  const separation=Math.hypot(stepped.player.position[0]-
   originalSourceCpuA3[0],stepped.player.position[2]-
   originalSourceCpuA3[1]);
  const passed=retreatMeters>=1.5&&separation>=1.6;
  const sample=x=>({tick:x.tick,foot:x.player.position,
   sourceSolids:x.originalSourceSolids,
   sourcePaint:x.originalPaintSurfaces,
   sourceNavLinks:x.originalSourceNavigationLinks,
   scoreable:x.sourceScoreablePromotions,stopReason:x.stopReason});
  const report={
   status:passed?'PASS_NATIVE_SOURCE_FIXED_CPU_LANE':
    'FAIL_NATIVE_SOURCE_FIXED_CPU_LANE',
   realFreshChromiumProcess:true,realKeyboardAndPointerLockedShot:true,
   sameOriginalB35PhysicalInputProcedure:true,
   trial:process.env.T21_W10B50_TRIAL||null,
   runId:process.env.GITHUB_RUN_ID||null,
   runAttempt:process.env.GITHUB_RUN_ATTEMPT||null,
   originalA3LaneFootXZ:originalSourceCpuA3,
   thresholdsUnchanged:{retreatMeters:1.5,separationMeters:1.6},
   actualWHeldTicks:after.tick-before.tick,
   actualSHeldTicks:stepped.tick-origin.tick,
   sKeyHeldWallClockMs:heldMs,
   realWMoveMeters:move,
   realProjectileShotCount:fired.shotsFired-after.shotsFired,
   realSRetreatMeters:retreatMeters,
   realA3LaneSeparationMeters:separation,
   margins:{retreat:retreatMeters-1.5,separation:separation-1.6},
   timeline:{startBeforeW:sample(before),afterW:sample(after),
    afterRealMouseShot:sample(fired),beforeS:sample(origin),
    afterS:sample(stepped)},
   originalSolids:stepped.originalSourceSolids,
   originalPaintable:stepped.originalPaintSurfaces,
   originalNavLinks:stepped.originalSourceNavigationLinks,
   scoreableSurfaces:stepped.sourceScoreablePromotions,
   originalCpuHeuristicsChanged:false,sourceGeometryChanged:false,
   original4v4Certified:false,productionAuthorized:false
  };
  writeFileSync(resolve(OUTPUT,'w10b50-independent-native-lane.json'),
   JSON.stringify(report,null,2));
  console.log('T21_W10B50_INDEPENDENT_ORIGINAL_LANE',JSON.stringify(report));
  if(stepped.originalSourceSolids!==25||
    stepped.originalPaintSurfaces!==17||
    stepped.originalSourceNavigationLinks!==26||
    stepped.sourceScoreablePromotions!==0||
    after.tick-before.tick<25||stepped.tick-origin.tick<38||
    !Number.isFinite(retreatMeters)||!Number.isFinite(separation))
   reject('W10B50_ORIGINAL_SOURCE_INTEGRITY_DRIFT');
  if(!passed)reject('W10B50_REAL_SOURCE_CPU_LANE_UNCLEARED');
  return;
 }
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
  // B51: minimum 38 ticks alone does not prove original CPU lane clearance.
  // Real CDP KeyS remains pressed until ACTUAL Rapier player foot clears both
  // unchanged 1.5m retreat and 1.6m A3 separation thresholds.
  const a3Start=[-.8030697107315063,67.07270050048828];
  const nativeClearance=state=>({
   retreatMeters:Math.hypot(...state.player.position.map((v,i)=>
    v-retreatFrom.player.position[i])),
   separation:Math.hypot(state.player.position[0]-a3Start[0],
    state.player.position[2]-a3Start[1])
  });
  const retreat=await waitUntil(async()=>{
   const state=await evaluate('window.__t21F3.snapshot()');
   if(state.stopReason)reject('HUMAN_RETREAT_UNSAFE_'+state.stopReason);
   const metrics=nativeClearance(state);
   if(state.tick>=retreatFrom.tick+38&&
      metrics.retreatMeters>=1.5&&metrics.separation>=1.6)return state;
   if(state.tick>retreatFrom.tick+96)
    reject('B51_HUMAN_STILL_BLOCKS_NATIVE_LANE_AFTER_96_TICKS_'+
     JSON.stringify({heldTicks:state.tick-retreatFrom.tick,...metrics}));
   return false;
  },70000);
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...retreatKey});
  const {retreatMeters,separation}=nativeClearance(retreat);
  if(retreatMeters<1.5||separation<1.6)
   reject('REAL_PLAYER_STILL_BLOCKS_SOURCE_CPU_LANE_'+JSON.stringify({
    retreatMeters,separation,retreat
   }));
  console.log('T21_F3B_REAL_PLAYER_CLEARS_SOURCE_LANE',JSON.stringify({
   retreatMeters,separation,retreatTick:retreat.tick,
   observedNativeSHeldTicks:retreat.tick-retreatFrom.tick,
   originalThresholdsUnchanged:{retreat:1.5,separation:1.6},
   waitedForRealRapierLaneClearance:true,physicalSourceOnly:true
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
   // B34 compare actual 60Hz source-only CPU sessions at a COMMON
   // original physical tick, not drifting independent browser startup.
   let b34StartAudit=null;
   if(process.env.T21_W10B34_ALIGN==='1'){
    const commonTick=1800;
    if(completed.tick>commonTick)
     reject('W10B34_SOURCE_ONBOARDING_EXCEEDS_COMMON_TICK_'+completed.tick);
    while(completed.tick<commonTick){
     const count=Math.min(72,commonTick-completed.tick);
     completed=await evaluate('window.__t21F3.advanceQaTicks('+count+')');
     if(completed.stopReason||completed.originalSourceSolids!==25||
        completed.sourceScoreablePromotions!==0)
      reject('W10B34_REAL_FIXED_TICK_ALIGNMENT_SOURCE_DRIFT');
    }
    if(completed.tick!==commonTick)
     reject('W10B34_NATIVE_START_NOT_MATCHED_'+completed.tick);
    b34StartAudit=await evaluate('window.__t21F3.auditW10B16NaturalEnemyAccess()');
    if(b34StartAudit.originalSourceSolids!==25||
       b34StartAudit.originalPaintSurfaces!==17||
       b34StartAudit.originalNavLinks!==26||
       b34StartAudit.sourceScoreablePromotions!==0||
       b34StartAudit.physicalActorTeleports!==0)
     reject('W10B34_PREWINDOW_NATIVE_SOURCE_AUDIT_DRIFT');
    console.log('T21_W10B34_REAL_SOURCE_MEASUREMENT_START',
     JSON.stringify({nativeTick:completed.tick,
      cumulativePatrolMeters:b34StartAudit.sourcePatrol.travelMeters,
      cumulativeInkCells:b34StartAudit.inkCellsChanged,
      sevenRealOriginalCpu:true,officialSourceScore:0}));
   }
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
   if(process.env.T21_W10B31_INK_AWARE==='1'){
    const src=audit.sourcePatrol;
    if(process.env.T21_W10B34_STALL==='1'&&(
       src.b34StallRecoveryModeEnabled!==true||
       src.stalledOriginalGoalReconsiderations<=0||
       src.approvedAlternativeOriginalGoalsAfterStall<=0||
       src.approvedAlternativeOriginalGoalsAfterStall>
        src.stalledOriginalGoalReconsiderations))
     reject('W10B34_REAL_ORIGINAL_GROUNDED_STALL_ESCAPES_NOT_PROVEN_'+
      JSON.stringify(src));
    if(process.env.T21_W10B33_STABLE==='1'&&(
       src.stableSourceGoalModeEnabled!==true||
       src.continuedPreviouslyApprovedGoalRequests<=0||
       !Number.isSafeInteger(src.switchedGoalBeforePreviousArrival)||
       src.switchedGoalBeforePreviousArrival<0))
     reject('W10B33_CONTINUOUS_ORIGINAL_GOAL_HYSTERESIS_NOT_PROVEN_'+
      JSON.stringify(src));
    if(src.paintAwareModeEnabled!==true||
       src.actualOriginalInkOwnershipLookups<=0||
       src.actualOriginalInkOwnershipSampled<=0||
       src.realPaintAwareGoalsAccepted<=0||
       src.paintAwareRouteShortcutsGranted!==0||
       src.paintAwareNonOwnedGoalsAccepted+src.paintAwareOwnGoalsAccepted+
        src.paintAwareUnknownInkGoalsAccepted!==src.realPaintAwareGoalsAccepted||
       src.attemptsToCrossUnboundUnderpass!==0||
       audit.sourceScoreablePromotions!==0)
     reject('W10B31_REAL_SEVEN_CPU_AUTHORITATIVE_INK_GOALS_INVALID_'+
      JSON.stringify(src));
    console.log('T21_W10B31_REAL_CHROME_SEVEN_CPU_PAINT_AWARE_PATROL_PASS',
     JSON.stringify({nativeOriginalCpu:7,sourceOnly:true,
      actualOwnerGridLookups:src.actualOriginalInkOwnershipLookups,
      actualOwnerGridSamples:src.actualOriginalInkOwnershipSampled,
      stableSourceGoalModeEnabled:src.stableSourceGoalModeEnabled,
      sourceFootStallRecoveryEnabled:src.b34StallRecoveryModeEnabled,
      actualStallReconsiderations:src.stalledOriginalGoalReconsiderations,
      approvedOriginalAlternatives:src.approvedAlternativeOriginalGoalsAfterStall,
      continuedPreviouslyApprovedGoalRequests:
       src.continuedPreviouslyApprovedGoalRequests,
      switchedGoalBeforePreviousArrival:
       src.switchedGoalBeforePreviousArrival,
      physicallyAcceptedRealGoals:src.realPaintAwareGoalsAccepted,
      nonOwnedSourceGoals:src.paintAwareNonOwnedGoalsAccepted,
      alreadyOwnedSourceGoals:src.paintAwareOwnGoalsAccepted,
      unsampledSourceGoals:src.paintAwareUnknownInkGoalsAccepted,
      playerMovementOrTeleportChanged:false,
      syntheticPaths:src.paintAwareRouteShortcutsGranted,
      scoredTurf:0,nativeCrossTeamPaths:audit.credibleNativeEndpointPairs,
      realOriginalFootPatrolMeters:src.travelMeters,
      fakeEnemyEncounter:false,productionAuthorized:false}));
   }
   if(process.env.T21_W10B35_NATIVE==='1'){
    const native=audit.b35NativeSourceRetarget;
    if(!native?.enabled||native.redundantUnchangedRequestsSuppressed<=0||
       native.nativeRequestIssued<=0||
       audit.sourcePatrol.paintAwareModeEnabled||
       audit.sourcePatrol.b34StallRecoveryModeEnabled||
       audit.originalSourceSolids!==25||
       audit.sourceScoreablePromotions!==0)
     reject('W10B35_REAL_CHROME_ORIGINAL_CROWD_REQUESTS_NOT_VERIFIED_'+
      JSON.stringify(native));
    console.log('T21_W10B35_REAL_CHROME_ORIGINAL_NATIVE_DEDUPE_PASS',
     JSON.stringify({...native,sourceOnly:true,
      genuineCpuCount:7,originalSourceSolids:25,scoreable:0}));
   }
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
    b34StartAudit,b34SourceMeasurementStartTick:
     b34StartAudit?1800:null,
    b35NativeSourceRetarget:audit.b35NativeSourceRetarget,
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
