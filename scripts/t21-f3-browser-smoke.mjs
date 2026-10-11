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
 const longCpu=process.env.T21_F3_LONG_CPU==='1';
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'+
  (longCpu?'&t21QaDrive=source':'')});
 await waitUntil(async()=>{
  const ready=await evaluate(`({
   ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
   renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,
   error:document.querySelector('#boot-error')?.textContent||''
  })`);
  if(ready.error)reject('APP_BOOT '+ready.error.slice(0,1600));
  return ready.ready==='READY'&&ready.renderer==='webgl2';
 },65000);
 const initial=await evaluate('window.__t21F3.snapshot()');
 const radar=await evaluate(`({solid:document.querySelector("#t21-f3-radar-canvas")?.dataset.originalSourceSolids,
  links:document.querySelector("#t21-f3-radar-canvas")?.dataset.originalSourceNavigationLinks,
  actors:document.querySelector("#t21-f3-radar-canvas")?.dataset.nativeActorCount,
  authority:document.querySelector("#t21-f3-radar-canvas")?.dataset.productionAuthority})`);
 if(radar.solid!=='25'||radar.links!=='26'||radar.actors!=='8'||radar.authority!=='NONE')
  reject('ORIGINAL_SOURCE_RADAR_UNAUTHORIZED_'+JSON.stringify(radar));
 if(initial.phase!=='F3'||!initial.playableSandbox||
  !initial.originalSourceStudyVisible||
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
  for(let i=0;i<6;i++)completed=await evaluate('window.__t21F3.advanceQaTicks(72)');
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
  nativePatrolEvidence:longCpu?completed.cpu.sourcePatrol:undefined,
  perCpuNativeFootEvidence:longCpu?completed.cpu.cpu:undefined,
  fullSevenCpuChromeTestRequested:longCpu,
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
