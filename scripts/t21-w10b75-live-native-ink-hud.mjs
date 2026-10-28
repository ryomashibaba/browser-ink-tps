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
import {verifyB179RealNativeResourceProof} from './t21-w10b179-real-resource-economy-gate.mjs';

const ROOT='http://127.0.0.1:4197/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-w10b75';
const mode=process.env.T21_W10B75_AIM||'FIXED';
const b287ReadyOnly=process.env.T21_B287_READY_ONLY==='1';
const b288ActorAb=process.env.T21_B288_ACTOR_AB==='1';
const b289InPlayAb=process.env.T21_B289_INPLAY_ACTOR_AB==='1';
const b179Recovery=process.env.T21_B179_NATIVE_SOURCE_RECOVERY==='1';
const b180Patches=process.env.T21_B180_NATIVE_SOURCE_PATCH_AIM==='1';
const b182NativeSight=process.env.T21_B182_NATIVE_ORIGINAL_COMBAT_SIGHT==='1';
if(b182NativeSight&&mode!=='SWEEP')
 throw Error('B182_REGISTERED_SOURCE_SIGHT_SWEEP_QA_ONLY');
if(b180Patches&&!b179Recovery)
 throw Error('B180_SOURCE_PATCH_AIM_REQUIRES_B178_REAL_INK_RECOVERY');
if(b179Recovery&&mode!=='SWEEP')throw Error('B179_SOURCE_QA_SWEEP_ONLY');
// B96: a completely separate, explicitly opted-in source QA browser run.
// The ordinary B75 FIXED/SWEEP playback still backs away with actual KeyS.
const parkedB96=process.env.T21_W10B96_PARKED==='1';
// B99 exercises an actually different collision-side human lane with
// genuine KeyA+KeyW, never a coordinate relocation or artificial tick.
const b99Left=process.env.T21_W10B99_VARIANT==='LEFT_SHORT';
const b100Right=process.env.T21_W10B99_VARIANT==='RIGHT_SHORT';
if(process.env.T21_W10B99_VARIANT&&!b99Left&&!b100Right)
 throw Error('B100_UNKNOWN_REAL_HUMAN_INPUT_VARIANT');
if(!['FIXED','SWEEP'].includes(mode))throw Error('B75_BAD_MODE');
if(b289InPlayAb&&(!b287ReadyOnly||mode!=='FIXED'))
 throw Error('B289_REQUIRES_GENUINE_180S_READY_NATIVE_FIXED_PATH');
if(b288ActorAb&&!b287ReadyOnly)
 throw Error('B288_ACTOR_AB_REQUIRES_B287_NATIVE_READY_GATE');
if(b287ReadyOnly&&(mode!=='FIXED'||
  process.env.T21_B207_REAL_COMBAT_SELECT!=='1'))
 throw Error('B287_READY_SMOKE_REQUIRES_REAL_FIXED_PLAYER_ROUND');
if(parkedB96&&mode!=='FIXED')throw Error('B96_EXPERIMENT_MUST_KEEP_FIXED_AIM');
if((b99Left||b100Right)&&!parkedB96)
 throw Error('B100_VARIANT_REQUIRES_ORIGINAL_SOURCE_OPTIN');
const children=[],pending=new Map();
let sock=null,id=0;
const fail=x=>{throw Error('T21_B75_'+x);};
async function until(fn,ms=80000,pollMs=700){
 const deadline=Date.now()+ms;
 while(Date.now()<deadline){
  const v=await fn();if(v)return v;await sleep(pollMs);
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
 const search=b179Recovery?
  '?t21Play=preview&t21QaDrive=source&'+
  't21W10B64=inkAngleSweep&t21W10B178=sourceInkRecovery'+
  (b180Patches?'&t21W10B180=originalUnpaintedPatches':'')+
  (b182NativeSight?'&t21W10B181=originalCombatSight':''):
  '?t21Play=preview'+
  (mode==='SWEEP'?'&t21W10B68=previewSweep':'')+
  (parkedB96?'&t21QaDrive=source&t21W10B93=upperDetour':'')+
  (parkedB96?'&t21W10B102=contactProbe':'');
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
    boot.b64SourceInkSweep.enabled!==(mode==='SWEEP')||
    boot.cpu.b93ExperimentalEnabled!==parkedB96||
    boot.b178SourceInkRecovery?.enabled!==b179Recovery||
    boot.b180OriginalPatchAim?.enabled!==b180Patches||
    boot.b181OriginalCombatSight?.enabled!==b182NativeSight)
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
 if(b99Left||b100Right){
  // Real CDP side-key plus KeyW, never a setPosition, synthetic crowd
  // coordinate, synthetic step, extra original nav link or collision veto.
  const code=b100Right?'KeyD':'KeyA';
  const key=b100Right?'d':'a';
  const virtualKey=b100Right?68:65;
  const sideways={key,code,windowsVirtualKeyCode:virtualKey,
   nativeVirtualKeyCode:virtualKey};
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...sideways});
  let end;
  try{
   end=await until(async()=>{
    const n=await snapshot();
    if(n.stopReason)fail('B100_REAL_SIDEWAYS_SOURCE_INPUT_STOP_'+n.stopReason);
    return n.tick>=before.tick+4?n:false;
   },60000);
  }finally{
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...sideways});
  }
  console.log('T21_B100_NATIVE_REAL_SIDEWAYS_KEYBOARD_LANE',
   JSON.stringify({variant:b100Right?'RIGHT_SHORT':'LEFT_SHORT',
    startTick:before.tick,endTick:end.tick,
    startHumanFoot:before.player.position,endHumanFoot:end.player.position,
    naturalNativeTicks:end.tick-before.tick,
    actualSideKey:code,actualKeyW:true,poseWrittenByQA:false}));
 }
 // B101: stop actual physical KeyW before separately waiting for
 // human ink HUD. Previously that unrelated async check advanced genuine
 // Rapier physics while W stayed held in software WebGL2 (<1 FPS).
 // Only read the real player foot; do not synthesize ticks or change poses.
 let b101EarlyParkedRelease=null;
 if(parkedB96&&!b100Right){
  // B100's genuine right-KeyD successful test used HUD-first KeyW-up.
  // B101 early release remains for the ordinary baseline/left variants.
  const gate=await until(async()=>{
   const n=await snapshot();
   if(n.stopReason||n.originalSourceSolids!==25||
      n.originalPaintSurfaces!==17||
      n.originalSourceNavigationLinks!==26||
      n.sourceScoreablePromotions!==0||
      n.productionAuthorized!==false||
      n.unrestricted4v4Certified!==false||
      n.cpu.b93ExperimentalEnabled!==true)
    fail('B101_ORIGINAL_SOURCE_AUTHORITY_DRIFT_BEFORE_REAL_KEYUP');
   const z=n.player.position[2];
   if(z<63.69)
    fail('B101_REAL_KEYW_LIP_OVERSHOT_BEFORE_RELEASE_'+
     JSON.stringify({tick:n.tick,realHumanFoot:n.player.position}));
   return z<=64.35?n:false;
  },100000,90);
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...kargs});
  b101EarlyParkedRelease=gate;
  const applied=await snapshot();
  console.log('T21_B101_EARLY_NATIVE_POSITION_GATED_REAL_KEYW_RELEASE',
   JSON.stringify({variant:b100Right?'B100_RIGHT_SHORT':
     b99Left?'B99_LEFT_SHORT':'B98_REFERENCE',
    observedNativeTick:gate.tick,realHumanFootAtObservation:gate.player.position,
    firstNativeTickAfterRealCDPKeyup:applied.tick,
    firstHumanFootAfterKeyup:applied.player.position,
    originalSourceOnly:true,actualCDPKeyEvent:true,
    noSyntheticSimulationAdvance:true,
    independentHumanInkHUDStillPending:true}));
 }
 // B79: the real human paint first happens in STAGING, not 5+ seconds
 // into PLAYING. The old B76 smoke began looking only after the 3s
 // activity window expired and falsely failed despite 281 real cells.
 // Witness genuine held-mouse ink while physical W has been released only
 // for opt-in parked-source QA; normal B75 still holds both inputs here.
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
 // B101: independent HUD confirmation must not prolong live KeyW.
 // The ordinary B75 fixed/sweep playback keeps its prior input behavior.
 const realWRelease=parkedB96&&!b100Right?b101EarlyParkedRelease:
  await until(async()=>{
   const n=await snapshot();
   if(n.stopReason)fail('B79_HUMAN_SOURCE_SESSION_STOP_'+n.stopReason);
   if(!parkedB96)return n.tick>before.tick+33?n:false;
   const z=n.player.position[2];
   if(z<63.69)fail('B102_TRUE_W_KEYUP_OVERSHOT_RIGHT_SOURCE_LIP_'+
    JSON.stringify({tick:n.tick,realHumanFoot:n.player.position}));
   return z<=64.35?n:false;
  },100000,parkedB96?90:700);
 if(parkedB96)console.log('T21_B98_REAL_INPUT_POSITION_GATED_KEYUP',
  JSON.stringify({tick:realWRelease.tick,
    realHumanFoot:realWRelease.player.position,realKeyboard:true,
    usedArtificialQaInput:false,earlyBeforeHud:!b100Right,
    sourceContactProbe:b100Right}));
 await click('mouseReleased');
 if(!parkedB96||b100Right)
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...kargs});
 // B96 deliberately retains the HUMAN at the original source lip.
 // Standard B75 still performs the original true-keyboard retreat.
 if(!parkedB96){
 // B90: the extended W+mouse source-ink proof can leave the genuine
 // HUMAN standing directly at the authentic A3 first-drop approach.
 // Unlike B81's shorter input, this holds the original collision lip
 // occupied indefinitely and correctly blocks A3/A2 (5/7). Release
 // the lane using REAL reverse keyboard movement and unchanged Rapier
 // KCC, not a CPU teleport or an artificial STAGING->PLAYING override.
 const reverseStart=await snapshot();
 const back={key:'s',code:'KeyS',windowsVirtualKeyCode:83,nativeVirtualKeyCode:83};
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...back});
 try{
  await until(async()=>{
   const n=await snapshot();
   if(n.stopReason)fail('B90_NATIVE_REVERSE_SOURCE_STOP_'+n.stopReason);
   return n.tick>=reverseStart.tick+60;
  },100000);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...back});
 }
 const reverseEnd=await snapshot();
 const oldFoot=reverseStart.player.position,newFoot=reverseEnd.player.position;
 const actualRetreat=Math.hypot(newFoot[0]-oldFoot[0],newFoot[2]-oldFoot[2]);
 if(actualRetreat<=.20||reverseEnd.originalSourceSolids!==25||
    reverseEnd.originalPaintSurfaces!==17||
    reverseEnd.originalSourceNavigationLinks!==26||
    reverseEnd.sourceScoreablePromotions!==0)
  fail('B90_REAL_HUMAN_LANE_CLEARANCE_NOT_PROVED_'+JSON.stringify({
   actualRetreat,oldFoot,newFoot,sourceSolids:reverseEnd.originalSourceSolids,
   sourcePaint:reverseEnd.originalPaintSurfaces,
   sourceLinks:reverseEnd.originalSourceNavigationLinks}));
 console.log('T21_B90_GENUINE_HUMAN_LANE_CLEARANCE',JSON.stringify({
  actualRetreat,from:oldFoot,to:newFoot,nativeTicks:reverseEnd.tick-reverseStart.tick,
  byRealKeyboard:true,unchangedPhysicalStage:true,
  noCpuWarp:true,noForcedMatchStart:true}));
 }
 console.log('T21_B79_GENUINE_EARLY_HUMAN_SOURCE_PAINT_HUD_PASS',
  JSON.stringify(humanPulse));
 // B102: no genuine KeyA correction after original KeyD; that
 // produced a non-obstructing position in B101, defeating this probe.
 const b101LateralCorrection=null;
 if(parkedB96){
  const settled=await until(async()=>{
   const n=await snapshot();
   if(n.stopReason)fail('B96_STOP_DURING_TRUE_HUMAN_SETTLE_'+n.stopReason);
   if(n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
      n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
      n.productionAuthorized!==false||n.unrestricted4v4Certified!==false||
      !n.cpu.b93ExperimentalEnabled)
     fail('B96_ORIGINAL_SOURCE_AUTHORITY_CHANGED_AT_SETTLE');
   return n.tick>=before.tick+180?n:false;
  },120000);
  const settledHuman=settled.player.position;
  // B97: do not convert ordinary KCC coast into a synthetic fixed pose.
  // Reject a human who never occupied the genuine A3 upper source lip.
  // B92 identified the physically blocked A3 lip from unchanged
  // collision/real-human KCC feet. Reject easy 7/7 success when the
  // real HUMAN has walked past the collision choke instead of testing
  // B95's actual blocked-case autonomous lateral recovery.
  // B98B: immutable B92 provides the A3 physical obstruction foot.
  // Real Chrome frames advance several native ticks together, so the
  // EXACT B92 human coordinate cannot reliably be reproduced with real
  // CDP KeyW/keyUp. Test physically occupying A3's actual source
  // approach capsule, not an invented single-target user coordinate.
  const originalA3BlockedFoot=[0.2749243676662445,64.00698852539062];
  // The real KeyA displacement must be measurably distinct; do not
  // reject genuine 0.076m offsets using the former absolute -0.25 cliff.
  if(b99Left&&(-.1721142679452896-settledHuman[0])<.06)
   fail('B101_LEFT_REAL_HUMAN_INPUT_NOT_DISTINCT_FROM_REFERENCE_'+
    JSON.stringify({settledHuman,referenceHumanX:-.1721142679452896,
     minimumDifferenceMeters:.06}));
  if(b100Right&&
     (settledHuman[0]+.1721142679452896<.06 ||
      settledHuman[0]>.13))
   fail('B101_RIGHT_REAL_HUMAN_INPUT_OUTSIDE_PHYSICAL_OCCUPANCY_LANE_'+
    JSON.stringify({settledHuman,referenceHumanX:-.1721142679452896,
     minimumDifferenceMeters:.06,maximumSourceHumanX:.13}));
  const lipContactDistance=Math.hypot(
   settledHuman[0]-originalA3BlockedFoot[0],
   settledHuman[2]-originalA3BlockedFoot[1]);
  if(lipContactDistance>.70||settledHuman[1]<8.2||
     settledHuman[1]>8.6)
    fail('B98_TRUE_HUMAN_NOT_ON_ORIGINAL_A3_APPROACH_CAPSULE_'+
      JSON.stringify({settledHuman,nativeTick:settled.tick,
       originalA3BlockedFoot,contactDistanceMeters:lipContactDistance,
       source:'B92_ACTUAL_RAPIER_OBSTRUCTION_A3_FOOT'}));
  console.log('T21_B97_REAL_KEYUP_SETTLED_LIP',JSON.stringify({
    realKeyboardW:true,noKeyboardS:true,settledHuman,
    nativeTick:settled.tick,paused:settled.paused,
    renderFrames:settled.sourceFrameQuality?.liveUpdateFrames,
    nativeSourceRejoins:settled.cpu.physicalRejoins.length
  }));
  const observations=[];
  let previousTick=settled.tick,lastTickAt=Date.now();
  const watchingSince=Date.now(),lastReport={wall:0};
  const storePartial=(n,reason,humanParked,detour)=>{
   const witness={
    schema:'W10_B97_UNMODIFIED_NATIVE_WEBGL2_WATCHDOG_V1',
    reason,readOnly:true,realKeyboardInput:true,
    sourceQaVariant:b100Right?'B100_RIGHT_SHORT':
     b99Left?'B99_LEFT_SHORT':'B98_REFERENCE',
    userDidNotPressBackwards:true,realNativeTick:n.tick,
    wallElapsedSeconds:Number(((Date.now()-watchingSince)/1000).toFixed(1)),
    nativeRenderFrames:n.sourceFrameQuality?.liveUpdateFrames,
    sourceFrameQuality:n.sourceFrameQuality,
    paused:n.paused,stop:n.stopReason,matchState:n.matchState,
    realHumanSettledFoot:settledHuman,realHumanFoot:n.player.position,
    humanParkedDeltaMeters:humanParked,
    actualCpuRejoined:n.cpu.physicalRejoins,
    actorFeet:n.cpu.cpu.filter(x=>['A1','A2','A3','B1','B2','B3','B4'].includes(x.id)),
    nativeDetour:detour??null,
    b102OriginalA3Kcc:n.b102OriginalA3Kcc??null,
    originalSource:[n.originalSourceSolids,
      n.originalPaintSurfaces,n.originalSourceNavigationLinks,
      n.sourceScoreablePromotions],
    original4v4Certified:false,productionAuthorized:false,
    observations:observations.slice(-30)
   };
   writeFileSync(resolve(OUTPUT,'b97-partial-parked-native-watch.json'),
    JSON.stringify(witness,null,2));
   return witness;
  };
  const completed=await until(async()=>{
   const n=await snapshot();
   if(n.stopReason||n.originalSourceSolids!==25||
      n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
      n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
      n.unrestricted4v4Certified!==false||
      n.cpu.b93ExperimentalEnabled!==true||
      n.cpu.physicalFootRelocations!==0)
     fail('B96_REAL_CHROME_ORIGINAL_SOURCE_DRIFT_'+JSON.stringify({
      tick:n.tick,stop:n.stopReason,source:n.originalSourceSolids,
      paint:n.originalPaintSurfaces,links:n.originalSourceNavigationLinks,
      relocations:n.cpu.physicalFootRelocations}));
   const h=n.player.position;
   const humanParked=Math.hypot(h[0]-settledHuman[0],
    h[2]-settledHuman[2]);
   if(humanParked>.12)
    fail('B96_HUMAN_MOVED_AFTER_TRUE_SETTLE_'+JSON.stringify({
     tick:n.tick,humanParked,settledHuman,currentHuman:h}));
   const detour=n.cpu.b93UpperDetours.find(x=>x.actorId==='A3');
   if(n.tick>previousTick){previousTick=n.tick;lastTickAt=Date.now();}
   const now=Date.now();
   if(now-lastReport.wall>=20000){
    lastReport.wall=now;
    observations.push({
     wallElapsedSeconds:Number(((now-watchingSince)/1000).toFixed(1)),
     tick:n.tick,rejoins:n.cpu.physicalRejoins.length,
     realCpuFeet:n.cpu.cpu.filter(c=>c.id==='A2'||c.id==='A3'),
     detour,actualHuman:h,matchState:n.matchState,
     nativeRenderFrames:n.sourceFrameQuality?.liveUpdateFrames,
     nativeSimulationTicksLastFrame:
       n.sourceFrameQuality?.simulationTicksLastFrame
    });
    const readOnlyEvidence=storePartial(n,'HEARTBEAT',humanParked,detour);
    console.log('T21_B97_TRUE_CHROME_PARKED_NATIVE_HEARTBEAT',
     JSON.stringify({
      tick:n.tick,wallElapsedSeconds:readOnlyEvidence.wallElapsedSeconds,
      realRenderFrames:readOnlyEvidence.nativeRenderFrames,
      nativeRejoined:readOnlyEvidence.actualCpuRejoined,
      actualA3Foot:readOnlyEvidence.actorFeet.find(a=>a.id==='A3')?.physicalFoot,
      actualA2Foot:readOnlyEvidence.actorFeet.find(a=>a.id==='A2')?.physicalFoot,
      detour,parkedDeltaMeters:humanParked,
      paused:n.paused,stop:n.stopReason
     }));
   }
   if(now-lastTickAt>=90000){
    const diag=storePartial(n,'REAL_NATIVE_CLOCK_STALL_90_SECONDS',
       humanParked,detour);
    fail('B97_REAL_CHROME_NO_NATIVE_TICK_PROGRESS_'+JSON.stringify({
     tick:n.tick,wall:diag.wallElapsedSeconds,
     renderFrames:diag.nativeRenderFrames,paused:n.paused,
     rejoined:diag.actualCpuRejoined,detour}));
   }
   if(parkedB96&&n.b102OriginalA3Kcc?.enabled!==true)
    fail('B102_ORIGINAL_A3_RAPIER_CONTACT_PROBE_NOT_ENABLED');
   if(parkedB96&&n.cpu.physicalRejoins.length===7&&detour&&
      n.b102OriginalA3Kcc.humanProximateRapierBlocks===0)
    fail('B102_RIGHT_DETOUR_WITHOUT_RAPIER_DYNAMIC_CONTACT_PROOF_'+
     JSON.stringify(storePartial(n,'NO_REAL_A3_HUMAN_PROXIMATE_RAPIER_BLOCK',
      humanParked,detour)));
   if(n.cpu.physicalRejoins.length===7&&!detour)
    fail('B98_FALSE_POSITIVE_SEVEN_REJOINS_WITHOUT_REAL_A3_DETOUR_'+
      JSON.stringify(storePartial(n,
       'SEVEN_REJOINED_WITHOUT_LATERAL_DETOUR',humanParked,detour)));
   if(n.tick>=2400&&n.cpu.physicalRejoins.length<7)
    fail('B96_REAL_CHROME_BLOCKED_SEVEN_SOURCE_CPUS_'+JSON.stringify(
     storePartial(n,'ORIGINAL_SOURCE_SEVEN_NOT_REJOINED_BY_TICK_2400',
      humanParked,detour)));
   return n.cpu.physicalRejoins.length===7&&
    n.cpu.freeCombatEnabled===true&&n.matchState==='PLAYING'&&
    detour?.linkId.startsWith('first-drop-positive-z-')&&
    detour?.escapeFoot?.length===3&&
    n.cpu.cpu.find(x=>x.id==='A3')?.rejoined===true&&
    n.cpu.cpu.find(x=>x.id==='A2')?.rejoined===true?{n,detour,humanParked}:false;
  },14*60*1000);
  const n=completed.n;
  const frame=Buffer.from((await cmd('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false,fromSurface:true})).data||'','base64');
  if(frame.length<10000)fail('B96_NO_REAL_WEBGL_SCREENSHOT');
  const screenshot='b96-source-human-parked-native-detour.png';
  writeFileSync(resolve(OUTPUT,screenshot),frame);
  const proof={
   schema:'T21_B96_TRUE_CHROME_HUMAN_STATIONARY_B95_DETOUR_V1',
   sourceQaVariant:b100Right?'B100_RIGHT_SHORT':
     b99Left?'B99_LEFT_SHORT':'B98_REFERENCE',
   realSidewaysKeyAPulse:b99Left,
   realSidewaysKeyDPulse:b100Right,
   b102ActualRapierContact:parkedB96?n.b102OriginalA3Kcc:null,
   b101RealLateralCorrection:b101LateralCorrection,
   chromiumWebGL2:true,realPointerLockedWInput:true,
   artificialQaTicks:0,realHumanRetreatKeyS:false,
   sourceQaOptIn:true,normalFixedDefaultUnchanged:true,
   goalWasOriginalNavLink:completed.detour.linkId,
   sourceSideEscapeFoot:completed.detour.escapeFoot,
   realSevenCpuRejoined:n.cpu.physicalRejoins,
   sourceFirstDropWitnesses:n.cpu.physicalFirstDrops,
   actualHumanInputStoppedFoot:settledHuman,
   realHumanFinalFoot:n.player.position,
   parkedAfterSettlingMeters:completed.humanParked,
   actualNativeTick:n.tick,matchState:n.matchState,
   screenshot:{name:screenshot,bytes:frame.length,
    sha256:createHash('sha256').update(frame).digest('hex')},
   immutableOriginalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINK_0_SCOREABLE',
   original4v4Certified:false,productionAuthorized:false,
   samples:observations
  };
  writeFileSync(resolve(OUTPUT,'b96-real-chrome-parked-detour.json'),
   JSON.stringify(proof,null,2));
  console.log('T21_B96_REAL_CHROME_HUMAN_PARKED_SEVEN_NATIVE_REJOINS_PASS',
   JSON.stringify({
    tick:n.tick,rejoins:n.cpu.physicalRejoins,
    sourceQaVariant:b100Right?'B100_RIGHT_SHORT':
     b99Left?'B99_LEFT_SHORT':'B98_REFERENCE',
    settledHuman,
    detour:completed.detour,parkedAfterSettlingMeters:completed.humanParked,
    b102OriginalA3Kcc:parkedB96?n.b102OriginalA3Kcc:null,
    noHumanRetreat:true,forcedMatchStart:false,original4v4Certified:false
   }));
  return;
 }
 const observations=[], started=Date.now();
 let inkPulse=null,firedNoInk=false,lastReported=-1;
 let lastTickAdvanceAt=Date.now(),lastHeartbeatAt=Date.now();
 let progressWitness=null,renderWitness=null,lastHeartbeatWitness=null;
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
    b179OriginalCpuEconomy:n.b178SourceInkRecovery,
    b180OriginalCpuPatchAim:n.b180OriginalPatchAim,
    b182OriginalCpuSight:n.b181OriginalCombatSight,
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
     status.b179OriginalCpuEconomy?.enabled!==b179Recovery||
     status.b180OriginalCpuPatchAim?.enabled!==b180Patches||
     status.b182OriginalCpuSight?.enabled!==b182NativeSight||
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
   lastHeartbeatWitness={...currentWitness};
   lastTickAdvanceAt=nowWall;
  }else if(status.tick>progressWitness.tick){
   progressWitness={...currentWitness};
   lastTickAdvanceAt=nowWall;
  }
  renderWitness={...currentWitness};
  if(nowWall-lastHeartbeatAt>=20000){
   lastHeartbeatAt=nowWall;
   // B91: a heartbeat compares two distinct observations. Comparing
   // current to a just-updated progress witness reported false NO_TICK
   // even as real native CPU physics advanced between heartbeats.
   // The independent 90-second fail-closed clock gate is not changed.
   const kind=b80ClassifyNativeStall(
    lastHeartbeatWitness??progressWitness,renderWitness,
    nowWall-lastTickAdvanceAt);
   lastHeartbeatWitness={...renderWitness};
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
     (!b179Recovery||status.b179OriginalCpuEconomy?.b179ActuallyRecoveredOwnSourceInk>0)&&
     status.nativeCpuSourceShots>0&&
     status.nativeCpuChangedSourceCells>0){
   const shot=Buffer.from((await cmd('Page.captureScreenshot',{
    format:'png',captureBeyondViewport:false,fromSurface:true})).data||'','base64');
   if(shot.length<10000)fail('BAD_REAL_CHROME_SCREENSHOT');
   const name='w10b75-source-live-'+mode.toLowerCase()+'.png';
   writeFileSync(resolve(OUTPUT,name),shot);
   if(b180Patches&&(
      status.b180OriginalCpuPatchAim?.chosenRealUnpaintedSourcePatches<=0||
      status.b180OriginalCpuPatchAim?.actualRealOwnerGridOpportunitySum<=0))
     fail('B180_NO_REAL_ORIGINAL_OWNER_GRID_PATCH_SELECTED');
   const b179Witness=b179Recovery?verifyB179RealNativeResourceProof({
    trueNativeSeconds:status.elapsed,
    originalStage:[status.stageSolids,status.stagePaint,status.sourceLinks,status.scoreable],
    authenticSevenCpuRejoined:status.nativeSourceCpuRejoined,
    genuineCpuSourceWeaponShots:status.nativeCpuSourceShots,
    genuineSourceInkChangedCells:status.nativeCpuChangedSourceCells,
    actualNativeEconomy:status.b179OriginalCpuEconomy
   }):null;
   if(b179Recovery){
    writeFileSync(resolve(OUTPUT,'w10b179-real-source-resource-recovery.json'),
     JSON.stringify(b179Witness,null,2));
    console.log('B179_NATIVE_REAL_CPU_SOURCE_OWN_INK_RECOVERED',
     JSON.stringify(b179Witness));
   }
   const proof={
    schema:'W10_B75_GENUINE_READ_ONLY_NATIVE_SOURCE_INK_HUD_V1',
    b179ExperimentalRealCpuInkRecovery:b179Witness,
    b180TrueNativeSourcePaintPatchAim:status.b180OriginalCpuPatchAim,
    b182RealNativeSourceSight:status.b182OriginalCpuSight,
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
    b179RealSourceCpuOwnInkRecovery:b179Witness?.actuallyRecoveredOwnSourceInk??null,
    b182RealOriginalStageRays:status.b182OriginalCpuSight?.actualRegisteredStageRays??0,
    b182VisibleEnemies:status.b182OriginalCpuSight?.visibleEnemySelections??0,
    pulseCells:inkPulse.recentCells,pulseShots:inkPulse.recentShots,
    totalCpuShots:status.nativeCpuSourceShots,
    changedCells:status.nativeCpuChangedSourceCells,
    actualHumanShots:status.acceptedHumanShots,
    realHumanChangedSourceCells:status.actualHumanPaintCells,
    humanHudChangedCellsAtPulse:humanPulse.b76RecentCells,
    officialWinner:'NONE',original4v4Certified:false}));
   if(mode==='FIXED'&&process.env.T21_B207_REAL_COMBAT_SELECT==='1'){
    // Genuine CDP UI action AFTER original CPU+HUMAN ink gameplay PASS.
    for(const type of ['keyDown','keyUp'])
     await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
      windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    await until(()=>evaluate('document.pointerLockElement===null'),25000);
    const c=await evaluate(`(() => {
     const b=document.querySelector('#t21-f3-b207-combat-round');
     b?.scrollIntoView({block:'center',behavior:'instant'});
     const r=b?.getBoundingClientRect();
     return {label:b?.textContent,disabled:b?.disabled,
      source:b?.dataset.originalSourceOnly,score:b?.dataset.scoreable,
      paths:b?.dataset.originalOpponentRoutesCertified,
      x:r?.left+r?.width/2,y:r?.top+r?.height/2};
    })()`);
    if(!c.label?.includes('PLAY 180s SOURCE COMBAT')||c.disabled||
       c.source!=='true'||c.score!=='0'||c.paths!=='0'||
       !(c.x>0&&c.x<1600&&c.y>0&&c.y<900))
     fail('B207_SOURCE_COMBAT_BUTTON_UNAVAILABLE_'+JSON.stringify(c));
    const before=await evaluate('performance.timeOrigin');
    await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
     x:c.x,y:c.y,button:'none'});
    for(const type of ['mousePressed','mouseReleased'])
     await cmd('Input.dispatchMouseEvent',{type,x:c.x,y:c.y,
      button:'left',clickCount:1});
    const selected=await until(async()=>{try{
     const x=await evaluate(`(() => {
      const s=window.__t21F3?.snapshot?.(),canvas=document.querySelector('#app-canvas');
      return s?{origin:performance.timeOrigin,
       ready:canvas?.dataset.t21F3Ready,
       combat:canvas?.dataset.t21B192HumanCombat,
       full:canvas?.dataset.t21B203FullRound,
       url:location.search,stage:[s.originalSourceSolids,s.originalPaintSurfaces,
        s.originalSourceNavigationLinks,s.sourceScoreablePromotions],
       cpuRejoins:s.cpu.physicalRejoins.length,
       actorRelocations:s.cpu.physicalFootRelocations,
       matchState:s.matchState,authorized:s.productionAuthorized,
       note:document.querySelector('#t21-f3-b207-source-combat-caveat')?.textContent
      }:null;
     })()`);
     return x?.origin>before&&x.ready==='READY'&&
      x.combat==='REAL_SOURCE_ONLY'&&x.full==='REAL_180S_SOURCE_PLAY'?x:false;
    }catch{return false;}},100000);
    if(selected.url!=='?t21Play=preview&t21QaDrive=source&'+
       't21W10B183=firstDropPlay&t21W10B192=humanCombat&'+
       't21W10B112=humanGround&t21W10B203=fullRound'||
       selected.stage.join('/')!=='25/17/26/0'||
       selected.cpuRejoins!==0||selected.actorRelocations!==0||
       selected.matchState!=='STAGING'||selected.authorized!==false||
       !selected.note?.includes('0/12'))
     fail('B207_NEW_REAL_COMBAT_WORLD_UNTRUSTED_'+JSON.stringify(selected));
    const evidence={schema:'B207_ACTUAL_USER_SELECTED_180S_SOURCE_COMBAT',
     actualVisibleCDPMouseClick:true,newSourceTimeOrigin:selected.origin,
     originalSourceStage:selected.stage.join('/'),
     originalHumanCombatEnabled:true,actual180sSourceMode:true,
     sourceCpuRejoinsAtBoot:0,actorTeleports:0,
     actualOpponentRoutesCertified:'0/12',officialWinner:'NONE',
     nativeEnemyEngagementCertified:false,noTickOrInkInjection:true};
    writeFileSync(resolve(OUTPUT,'w10b207-real-combat-source-select.json'),
     JSON.stringify(evidence,null,2));
    console.log('B207_REAL_180S_COMBAT_WORLD_USER_SELECTED',JSON.stringify(evidence));
    // B242: compare the actual frozen world before the first user click.
    const stableRound=s=>({
     tick:s.tick,phase:s.matchState,time:s.timeRemainingSeconds,
     hp:s.player.hp,ink:s.player.ink,foot:s.player.position,
     shots:s.shotsFired,cpuShots:s.cpuSourceTurfShots,
     humanInk:s.b23HumanInkFeedback.humanChangedCells,
     cpuInk:s.cpuImpactInkCellsChanged,
     cpu:s.cpu.cpu.map(x=>({id:x.id,foot:x.physicalFoot,hp:x.hp,
      life:x.lifeState,mobility:x.mobilityState})),
     relocated:s.cpu.physicalFootRelocations
    });
    const readyBefore=await snapshot();
    for(const type of ['keyDown','keyUp'])
     await cmd('Input.dispatchKeyEvent',{type,key:'p',code:'KeyP',
      windowsVirtualKeyCode:80,nativeVirtualKeyCode:80});
    await sleep(1500);
    const readyAfter=await snapshot();
    const readyUi=await evaluate(`(() => {
     const p=document.querySelector('#t21-f3-b202-real-pause');
     return {visible:!!p&&!p.hidden,state:p?.dataset.t21B202NativeState,
      button:document.querySelector('#t21-f3-b202-resume')?.textContent};
    })()`);
    if(!readyAfter.paused||readyAfter.tick!==0||
       readyAfter.timeRemainingSeconds!==180||
       JSON.stringify(stableRound(readyBefore))!==JSON.stringify(stableRound(readyAfter))||
       readyUi.visible!==true||readyUi.state!=='READY_TO_START'||
       readyUi.button!=='START 180s ROUND')
     fail('B242_FIRST_CLICK_READY_WORLD_ADVANCED_'+JSON.stringify({
      before:stableRound(readyBefore),after:stableRound(readyAfter),ui:readyUi}));
    // B246: prove actual F8 PLAYER <-> QA reversibility on one frozen
    // source READY world. Screenshots are real CDP Chromium framebuffers.
    async function b246Screenshot(name){
     const b=Buffer.from((await cmd('Page.captureScreenshot',
      {format:'png',captureBeyondViewport:false})).data||'','base64');
     if(b.length<10000||b.readUInt32BE(16)!==1600||b.readUInt32BE(20)!==900)
      fail('B246_INVALID_CHROMIUM_FRAME_'+name);
     writeFileSync(resolve(OUTPUT,name+'.png'),b);
     return {file:name+'.png',bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};
    }
    const b246Read=()=>evaluate("(() => {\n const root=document.querySelector('#ui-root');\n const id=x=>document.getElementById(x);\n const visible=x=>{const e=id(x);return !!e&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0;};\n const a=window.__t21F3?.snapshot?.();\n return {view:root?.dataset.t21B245Presentation,inspect:root?.dataset.t21B245Inspect,\n  status:id('t21-f3-hud-state')?.textContent,\n  stage:[a?.originalSourceSolids,a?.originalPaintSurfaces,a?.originalSourceNavigationLinks,a?.sourceScoreablePromotions],\n  tick:a?.tick,paused:a?.paused,remaining:a?.timeRemainingSeconds,\n  renderer:id('app-canvas')?.dataset.t21F3Renderer,\n  playerHud:visible('t21-f3-practice-hud'),\n  fullRoundDiagnostic:visible('t21-f3-b205-real-round'),\n  compactTeam:visible('t21-f3-b286-source-team'),\n  compactAlly:document.querySelector('#t21-f3-b286-source-team')?.dataset.allyActive,\n  compactEnemy:document.querySelector('#t21-f3-b286-source-team')?.dataset.enemyActive,\n  compactRejoining:document.querySelector('#t21-f3-b286-source-team')?.dataset.rejoining,\n  compactNoScore:document.querySelector('#t21-f3-b286-source-team')?.dataset.scoreable,\n  compactNoEnemyContact:document.querySelector('#t21-f3-b286-source-team')?.dataset.enemyContactCertified,\n  compactLabels:document.querySelector('#t21-f3-b286-source-team')?.textContent,\n  compactRadarOverlap:(() => {\n   const c=id('t21-f3-b286-source-team')?.getBoundingClientRect();\n   const r=id('t21-f3-source-radar')?.getBoundingClientRect();\n   return c&&r?Math.max(0,Math.min(c.right,r.right)-Math.max(c.left,r.left))*\n    Math.max(0,Math.min(c.bottom,r.bottom)-Math.max(c.top,r.top)):null;\n  })(),\n  compactCountsSingleLine:(() => {\n   const n=id('t21-f3-b286-team-counts');\n   if(!n)return null;\n   const h=parseFloat(getComputedStyle(n).lineHeight);\n   return Number.isFinite(h)&&n.scrollHeight<=h+2&&\n    n.scrollWidth<=n.clientWidth+2;\n  })(),\n  sessionDiagnostic:visible('t21-f3-b58-source-session'),\n  panel:visible('t21-f3-play-panel'),\n  paintChallenge:visible('t21-f3-b25-paint-run'),\n  descentDiagnostic:visible('t21-f3-b183-real-first-drop'),\n  radar:id('t21-f3-source-radar')?.dataset.t21B52RadarMode,\n  radarVisible:visible('t21-f3-source-radar'),\n  readyButton:visible('t21-f3-b202-resume'),\n  evidenceNodesPreserved:['t21-f3-b205-real-round','t21-f3-b58-source-session','t21-f3-b211-real-battle-roster',\n   't21-f3-b75-source-ink-live','t21-f3-b76-human-ink-coach'].every(x=>!!id(x)),\n  toggle:id('t21-f3-b245-view-toggle')?.textContent\n };\n})()");
    const b246Before=await b246Read();
    if(b246Before.view!=='PLAYER'||b246Before.inspect!=='false'||
       b246Before.status!=='READY · SOURCE ROUND'||
       b246Before.renderer!=='webgl2'||!b246Before.playerHud||
       b246Before.fullRoundDiagnostic||b246Before.sessionDiagnostic||
       b246Before.panel||b246Before.paintChallenge||
       b246Before.descentDiagnostic||b246Before.radar!=='COMPACT'||
       !b246Before.radarVisible||!b246Before.readyButton||
       !b246Before.compactTeam||b246Before.compactAlly!=='0'||
       b246Before.compactEnemy!=='0'||b246Before.compactRejoining!=='7'||
       b246Before.compactNoScore!=='0'||
       b246Before.compactNoEnemyContact!=='false'||
       b246Before.compactRadarOverlap!==0||
       b246Before.compactCountsSingleLine!==true||
       !b246Before.compactLabels?.includes('UNSCORED')||
       !b246Before.evidenceNodesPreserved||
       b246Before.stage.join('/')!=='25/17/26/0'||
       b246Before.tick!==0||b246Before.paused!==true||
       b246Before.remaining!==180)
     fail('B246_REAL_READY_PLAYER_HUD_INCOMPLETE_'+JSON.stringify(b246Before));
    const b246PlayerFrame=await b246Screenshot('b246-source-player-ready');
    const b246F8=async()=> {
     for(const type of ['keyDown','keyUp'])
      await cmd('Input.dispatchKeyEvent',{type,key:'F8',code:'F8',
       windowsVirtualKeyCode:119,nativeVirtualKeyCode:119});
    };
    await b246F8();
    const b246Qa=await b246Read();
    if(b246Qa.view!=='QA'||b246Qa.inspect!=='true'||
       !b246Qa.playerHud||!b246Qa.fullRoundDiagnostic||
       !b246Qa.sessionDiagnostic||!b246Qa.panel||
       !b246Qa.paintChallenge||!b246Qa.descentDiagnostic||
       b246Qa.radar!=='FULL'||b246Qa.compactTeam||
       !b246Qa.evidenceNodesPreserved||
       b246Qa.tick!==0||b246Qa.remaining!==180)
     fail('B246_REAL_READY_QA_RECOVERY_FAILED_'+JSON.stringify(b246Qa));
    const b246QaFrame=await b246Screenshot('b246-source-qa-ready');
    await b246F8();
    const b246Restored=await b246Read();
    if(b246Restored.view!=='PLAYER'||b246Restored.inspect!=='false'||
       b246Restored.status!=='READY · SOURCE ROUND'||
       b246Restored.panel||b246Restored.paintChallenge||
       b246Restored.descentDiagnostic||b246Restored.radar!=='COMPACT'||
       b246Restored.tick!==0||b246Restored.remaining!==180||
       b246Restored.fullRoundDiagnostic||!b246Restored.compactTeam||
       b246Restored.compactRejoining!=='7'||
       b246Restored.compactRadarOverlap!==0||
       b246Restored.compactCountsSingleLine!==true||
       !b246Restored.readyButton||
       JSON.stringify(stableRound(readyAfter))!==
        JSON.stringify(stableRound(await snapshot())))
     fail('B246_F8_RESTORED_WORLD_OR_LAYOUT_CHANGED_'+JSON.stringify(b246Restored));
    const b246RestoredFrame=await b246Screenshot('b246-source-player-restored');
    const b246Evidence={schema:'B246_GENUINE_CHROMIUM_SOURCE_PRESENTATION',
     fixedOriginalAuthority:'25/17/26/0',nativeTickBeforeStart:0,
     noSyntheticTimeOrActors:true,officialWinner:'NONE',
     player:b246Before,qa:b246Qa,restored:b246Restored,
     screenshots:[b246PlayerFrame,b246QaFrame,b246RestoredFrame]};
    writeFileSync(resolve(OUTPUT,'b246-native-player-qa-hud.json'),
     JSON.stringify(b246Evidence,null,2));
    console.log('B246_REAL_CHROMIUM_HUD_DISPLAY_RESTORED',JSON.stringify(b246Evidence));
    // B287: genuine selected 180s READY, paused native tick 0, actual
    // player/QA/F8/restored framebuffer and compact source team checked.
    // Exit BEFORE the costly B250+ optical material A/B and B223 long
    // seven-CPU rejoin. This does not certify later gameplay or art.
    if(b287ReadyOnly){
     const proof={schema:'B287_GENUINE_CHROMIUM_FAST_READY_PLAYER_QA_V1',
      originalSource:[25,17,26,0],realUserClickedSourceCombat:true,
      nativeTick:0,nativeTimeRemaining:180,
      readyPlayerNativeRosterCount:b246Before.compactRejoining,
      readyPlayerAllyCount:b246Before.compactAlly,
      readyPlayerEnemyCount:b246Before.compactEnemy,
      playerQaPlayerRestored:
       b246Before.compactTeam&&!b246Qa.compactTeam&&b246Restored.compactTeam,
      compactPanelAvoidsSourceRadar:
       b246Before.compactRadarOverlap===0&&b246Restored.compactRadarOverlap===0,
      nativeCountsExactlyOneLine:
       b246Before.compactCountsSingleLine&&b246Restored.compactCountsSingleLine,
      originalWorldUnchanged:true,virtualTicksInjected:0,actorRelocations:0,
      scoreablePromotions:0,officialWinner:'NONE',
      photos:b246Evidence.screenshots,
      laterPhysicalMatchCertified:false,artAccepted:false,
      productionAuthorized:false,unrestricted4v4Certified:false};
     writeFileSync(resolve(OUTPUT,'b287-fast-original-player-ready.json'),
      JSON.stringify(proof,null,2));
     console.log('B287_REAL_CHROMIUM_READY_PLAYER_QA_SMOKE_PASS',JSON.stringify(proof));
     if(b288ActorAb){
      // Compare three real render-only variants on SAME genuine paused
      // Chromium WebGL2 native source 25/17/26/0 snapshot & camera.
      const initial=await snapshot();
      const stable=JSON.stringify(stableRound(initial));
      const frames=[{variant:'B248_ORIGINAL',
       frame:await b246Screenshot('b288-actor-a-original')}];
      for(const variant of ['B268_COMPACT','B269_REAR_IDENTITY','B248_ORIGINAL']){
       const change=await evaluate(
        'window.__t21F3.setB288FrozenSourceActorVisual('+JSON.stringify(variant)+')');
       if(change.mode!==variant||change.realActors!==8||
          change.actorBodyRelocations!==0||change.rapierCollidersAdded!==0||
          change.navLinksAdded!==0||change.paintCellsModified!==0||
          change.scoreablePromotions!==0||change.productionAuthorized!==false||
          change.artAccepted!==false||
          change.actualRealCpuIds.join(',')!=='A1,A2,A3,B1,B2,B3,B4')
        fail('B288_NON_NATIVE_RENDER_ONLY_AUTHORITY_'+JSON.stringify(change));
       await sleep(180);
       const frame=await b246Screenshot(
        variant==='B268_COMPACT'?'b288-actor-b-compact':
        variant==='B269_REAR_IDENTITY'?'b288-actor-c-rear-identity':
        'b288-actor-a-restored');
       frames.push({variant,frame});
       if(JSON.stringify(stableRound(await snapshot()))!==stable)
        fail('B288_ACTOR_AB_ACTUAL_NATIVE_WORLD_CHANGED');
      }
      const [original,compact,rear,restore]=frames.map(x=>x.frame.sha256);
      if(original===compact||original===rear||compact===rear||
         original!==restore)
       fail('B288_ACTOR_AB_NATIVE_FRAME_OR_RESTORE_FAILED_'+
        JSON.stringify({original,compact,rear,restore}));
      const evidence={
       schema:'B288_FROZEN_NATIVE_3D_ACTOR_VARIANT_ABCA_V1',
       nativeRenderer:'webgl2',nativeStage:'25/17/26/0',
       sameGenuinePausedCpuPlayerWorld:true,originalNativeTick:0,
       variants:frames,originalFrameRestoredExactly:true,
       actualActorWorldRelocations:0,collidersAdded:0,
       sourceOpticalGeometryModified:0,navLinksAdded:0,
       scoreablePromotions:0,officialWinner:'NONE',
       artAccepted:false,productionAuthorized:false,
       crossTeamNaturalRoutesCertified:'0/12'
      };
      writeFileSync(resolve(OUTPUT,'b288-original-source-actor-abc-a.json'),
       JSON.stringify(evidence,null,2));
      console.log('B288_REAL_CHROMIUM_ACTOR_RENDER_ABCA_PASS',
       JSON.stringify(evidence));
     }
     if(b289InPlayAb){
      // B289: choose actual START 180s by CDP mouse; use genuine
      // 60Hz native KeyW+real bullets, not synthetic snapshots or teleports.
      const ready=await snapshot();
      if(ready.tick!==0||ready.timeRemainingSeconds!==180||!ready.paused)
       fail('B289_ORIGINAL_NATIVE_READY_NOT_STABLE');
      const origin=ready.player.position;
      const chosen=await evaluate(`(() => {
       const b=document.querySelector('#t21-f3-b202-resume');
       const r=b?.getBoundingClientRect();
       return {button:b?.textContent,x:r?.left+r?.width/2,
        y:r?.top+r?.height/2};
      })()`);
      if(!chosen.button?.includes('START 180s')||
         !(chosen.x>0&&chosen.x<1600&&chosen.y>0&&chosen.y<900))
       fail('B289_GENUINE_ROUND_START_UNAVAILABLE');
      await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',
       x:chosen.x,y:chosen.y,button:'none'});
      for(const type of ['mousePressed','mouseReleased'])
       await cmd('Input.dispatchMouseEvent',
        {type,x:chosen.x,y:chosen.y,button:'left',clickCount:1});
      const started=await until(async()=>{
       const s=await snapshot();
       return ['STAGING','PLAYING'].includes(s.matchState)&&
        !s.paused&&s.tick>0?s:false;
      },45000);
      const forward={key:'w',code:'KeyW',windowsVirtualKeyCode:87,
       nativeVirtualKeyCode:87};
      await cmd('Input.dispatchKeyEvent',{type:'keyDown',...forward});
      await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
       x:800,y:450,button:'left',clickCount:1});
      let moved;
      try{
       moved=await until(async()=>{
        const s=await snapshot();
        if(s.stopReason)fail('B289_REAL_NATIVE_KCC_SAFETY_STOP_'+s.stopReason);
        const p=s.player.position;
        const distance=Math.hypot(p[0]-origin[0],p[1]-origin[1],p[2]-origin[2]);
        return ['STAGING','PLAYING'].includes(s.matchState)&&
         s.tick>=started.tick+42&&
         s.shotsFired>=1&&s.b23HumanInkFeedback.humanChangedCells>0&&
         distance>=.3?s:false;
       },120000);
      }finally{
       await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
        x:800,y:450,button:'left',clickCount:1});
       await cmd('Input.dispatchKeyEvent',{type:'keyUp',...forward});
      }
      // B291: genuine original-source paint notice must stay outside the aim zone.
      const b291Notice=await evaluate(`(() => {
       const m=document.querySelector('#t21-f3-b23-human-ink-confirmation');
       const c=document.querySelector('#t21-f3-crosshair');
       if(!m||!c)return {valid:false};
       const r=m.getBoundingClientRect(),a=c.getBoundingClientRect();
       const gap=Number((a.top-r.bottom).toFixed(2));
       return {valid:true,visible:!m.hidden,gapAboveAimPx:gap,
        markerTopCss:getComputedStyle(m).top,
        originalSource:m.dataset.originalSourceOnly==='true',
        scoreablePromotions:m.dataset.scoreablePromotion,
        acceptedHumanPaint:window.__t21F3.snapshot().b23HumanInkFeedback.humanChangedCells};
      })()`);
      if(!b291Notice.valid||b291Notice.gapAboveAimPx<60||
         !b291Notice.originalSource||b291Notice.scoreablePromotions!=='0'||
         b291Notice.acceptedHumanPaint<1)
       fail('B291_REAL_INK_NOTICE_AIM_OBSTRUCTED_'+JSON.stringify(b291Notice));
      writeFileSync(resolve(OUTPUT,'b291-native-ink-notice-aim-clear.json'),
       JSON.stringify({schema:'B291_REAL_INK_NOTICE_AIM_CLEAR',
        ...b291Notice,originalSource:'25/17/26/0',actorRelocations:0,
        scoreablePromotions:0,artAccepted:false,productionAuthorized:false},null,2));
      console.log('B291_REAL_INK_NOTICE_AIM_CLEAR_PASS',JSON.stringify(b291Notice));
      const genuineLive=await b246Screenshot('b289-real-input-live-before-pause');
      for(const type of ['keyDown','keyUp'])
       await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
        windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
      const paused=await until(async()=>{
       const s=await snapshot();
       return s.paused&&['STAGING','PLAYING'].includes(s.matchState)&&
        !s.stopReason&&
        await evaluate('document.pointerLockElement===null')?s:false;
      },30000);
      await sleep(300);
      const still=await snapshot();
      // B290: actual post-input paused STAGING never says READY.
      const b290Hud=await until(async()=>{
       const label=await evaluate(`(() => {
        const s=window.__t21F3?.snapshot?.();
        return {label:document.querySelector('#t21-f3-hud-state')?.textContent,
         nativeTick:s?.tick,paused:s?.paused,
         pauseMode:document.querySelector('#t21-f3-b202-real-pause')
          ?.dataset.t21B202NativeState};
       })()`);
       const expected=still.matchState==='STAGING'?
        'PAUSED · SOURCE REJOIN':'PAUSED';
       return label?.label===expected&&label.nativeTick===still.tick&&
        label.paused===true&&label.pauseMode==='NATIVE_PAUSED'?label:false;
      },12000);
      writeFileSync(resolve(OUTPUT,'b290-native-postplay-hud-phase.json'),
       JSON.stringify({schema:'B290_GENUINE_POST_INPUT_SOURCE_PHASE',
        ...b290Hud,actualNativePhase:still.matchState,
        originalSource:'25/17/26/0',sourceScoreablePromotions:0,
        productionAuthorized:false},null,2));
      console.log('B290_POST_PLAY_SOURCE_HUD_PHASE_PASS',JSON.stringify(b290Hud));
      if(still.tick!==paused.tick||still.cpu.physicalFootRelocations!==0||
         still.originalSourceSolids!==25||still.originalPaintSurfaces!==17||
         still.originalSourceNavigationLinks!==26||
         still.sourceScoreablePromotions!==0||
         still.b23HumanInkFeedback.humanChangedCells<1||
         (still.matchState==='PLAYING'&&still.timeRemainingSeconds>=180))
       fail('B289_NATIVE_PAUSED_SOURCE_CHANGED');
      // URL fragment is an explicit nonproduction research permission,
      // not a game tick or actor write; restore original URL after A/B/C/A.
      const originalUrl=await evaluate('location.href');
      await evaluate(`(() => {const u=new URL(location.href);
       u.searchParams.set('t21B289','nativeInPlayActorArt');
       history.replaceState(null,'',u.href);return true;})()`);
      const cleanStable=JSON.stringify(stableRound(still));
      // UI-only photo mode: hide PAUSE modal without unpausing the world;
      // keep other native player HUD, radar and real scene intact.
      const modal=await evaluate(`(() => {
       const el=document.querySelector('#t21-f3-b202-real-pause');
       if(!el||el.hidden||getComputedStyle(el).display==='none')
        return {valid:false};
       const visibility=el.style.visibility;
       el.style.visibility='hidden';
       return {valid:true,visibility};
      })()`);
      if(!modal.valid)fail('B289_NATIVE_PAUSE_MODAL_UNAVAILABLE');
      try{
       await sleep(170);
       const snaps=[{mode:'B248_ORIGINAL',
        image:await b246Screenshot('b289-native-a-original-after-ink')}];
       for(const variant of ['B268_COMPACT','B269_REAR_IDENTITY','B248_ORIGINAL']){
        const reply=await evaluate(
         'window.__t21F3.setB289RealInPlayActorVisual('+
         JSON.stringify(variant)+','+JSON.stringify(origin)+')');
        if(reply.mode!==variant||reply.visualsOnly!==true||
           reply.existingActors!==8||reply.actorRelocations!==0||
           reply.nativeWorldWrites!==0||reply.scoreablePromotions!==0||
           reply.originalSourceCollidersAdded!==0||
           reply.artAccepted!==false||reply.productionAuthorized!==false||
           reply.actualCpuIds.join(',')!=='A1,A2,A3,B1,B2,B3,B4')
         fail('B289_ART_VARIANT_AUTHORITY_DRIFT_'+JSON.stringify(reply));
        await sleep(190);
        const image=await b246Screenshot(
         variant==='B268_COMPACT'?'b289-native-b-compact-after-ink':
         variant==='B269_REAR_IDENTITY'?'b289-native-c-identity-after-ink':
         'b289-native-a-restored-after-ink');
        snaps.push({mode:variant,image});
        if(JSON.stringify(stableRound(await snapshot()))!==cleanStable)
         fail('B289_NATIVE_PLAYER_CPU_WORLD_CHANGED');
       }
       if(snaps[0].image.sha256===snaps[1].image.sha256||
          snaps[1].image.sha256===snaps[2].image.sha256||
          snaps[0].image.sha256===snaps[2].image.sha256||
          snaps[0].image.sha256!==snaps[3].image.sha256)
        fail('B289_NATIVE_AFTER_INK_ART_ABCA_RASTER_IDENTITY_FAILED');
       const out={schema:'B289_REAL_NATIVE_MOVED_PAINTED_PAUSED_ART_ABCA',
        originalSource:'25/17/26/0',startTick:ready.tick,
        finalTrueNativeTick:still.tick,
        exactNativeRoundPhase:still.matchState,
        nativeTimeRemainingSeconds:still.timeRemainingSeconds,
        realPlayerPositionBefore:origin,
        realPlayerPositionAfter:still.player.position,
        realPlayerShots:still.shotsFired,
        realHumanPaintCells:still.b23HumanInkFeedback.humanChangedCells,
        genuineCpuRejoinedAtFreeze:still.cpu.physicalRejoins.length,
        trueInPlayFrame:genuineLive,identicalFrozenFrames:snaps,
        exactOriginalFramebufferRestored:true,
        actorRelocations:0,addedColliders:0,addedNavLinks:0,
        scoreablePromotions:0,artAccepted:false,
        unrestricted4v4Certified:false,productionAuthorized:false};
       writeFileSync(resolve(OUTPUT,'b289-native-real-ink-actor-art-abca.json'),
        JSON.stringify(out,null,2));
       console.log('B289_REAL_NATIVE_INPLAY_ART_ABCA_PASS',JSON.stringify(out));
        // B293: inspect all real native owner cells, not fabricated ink.
        await evaluate(`(() => {const u=new URL(location.href);
         u.searchParams.set('t21B293','realInkViewport');
         history.replaceState(null,'',u.href);return true;})()`);
        const realInk=await evaluate(
         'window.__t21F3.auditB293ActualInkViewport('+
         JSON.stringify(origin)+')');
        if(realInk.nativeTick!==still.tick||
           realInk.actualHumanPaintCells<1||realInk.actualHumanShots<1||
           realInk.actualOwnerCells<1||
           realInk.registeredSourcePaintRenderMeshes!==17||
           realInk.visibleSourcePaintRenderMeshes!==17||
           realInk.originalStageAuthority!=='25/17/26/0'||
           realInk.framebufferInkVisibilityCertified!==false||
           realInk.scoreablePromotions!==0||
           realInk.nativeWorldEdited!==false)
         fail('B293_NATIVE_INK_VIEWPORT_WITNESS_INVALID_'+JSON.stringify(realInk));
        if(JSON.stringify(stableRound(await snapshot()))!==cleanStable)
         fail('B293_OWNERSHIP_PROJECTION_CHANGED_NATIVE_WORLD');
        await sleep(190);
        const b293Image=await b246Screenshot('b293-real-native-ink-same-frame');
        if(b293Image.sha256!==snaps[0].image.sha256)
         fail('B293_READ_ONLY_AUDIT_CHANGED_REAL_FRAMEBUFFER');
        const report={...realInk,sameFrameNativeBaseline:snaps[0].image,
         researchFramebuffer:b293Image,exactNativeFramebufferRestoration:true};
        writeFileSync(resolve(OUTPUT,'b293-actual-native-ink-viewport.json'),
         JSON.stringify(report,null,2));
        console.log('B293_REAL_NATIVE_INK_VIEWPORT_PASS',JSON.stringify({
         nativeTick:realInk.nativeTick,
         actualOwnerCells:realInk.actualOwnerCells,
         actualHumanPaintCells:realInk.actualHumanPaintCells,
         sampled:realInk.paintSampleCount,inside:realInk.insideScreen,
         behind:realInk.behindCamera,outside:realInk.outsideScreen,
         aim:realInk.nearAim,lower:realInk.lowerScreen,
         source:'25/17/26/0',sameRaster:true}));
       // B292: separate same-native-snapshot A-D-A visual-only trial.
       const dReply=await evaluate('window.__t21F3.setB289RealInPlayActorVisual('+
        JSON.stringify('B292_FLOW_SILHOUETTE')+','+JSON.stringify(origin)+')');
       if(dReply.mode!=='B292_FLOW_SILHOUETTE'||!dReply.visualsOnly||
          dReply.existingActors!==8||dReply.actorRelocations!==0||
          dReply.scoreablePromotions!==0||dReply.artAccepted!==false)
        fail('B292_REAL_RENDER_AUTHORITY_DRIFT');
       await sleep(190);
       const dFrame=await b246Screenshot('b292-flow-organic-inplay');
       if(JSON.stringify(stableRound(await snapshot()))!==cleanStable)
        fail('B292_NATIVE_WORLD_CHANGE');
       const restored=await evaluate('window.__t21F3.setB289RealInPlayActorVisual('+
        JSON.stringify('B248_ORIGINAL')+','+JSON.stringify(origin)+')');
       if(restored.mode!=='B248_ORIGINAL')fail('B292_RESTORE_FAILED');
       await sleep(190);
       const aFrame=await b246Screenshot('b292-flow-baseline-restored');
       if(JSON.stringify(stableRound(await snapshot()))!==cleanStable||
          dFrame.sha256===snaps[0].image.sha256||
          dFrame.sha256===snaps[1].image.sha256||
          dFrame.sha256===snaps[2].image.sha256||
          aFrame.sha256!==snaps[0].image.sha256)
        fail('B292_NATIVE_A_D_A_SOURCE_RASTER_FAILED');
       const b292={schema:'B292_GENUINE_NATIVE_AFTER_INK_A_D_A',
        source:'25/17/26/0',nativeTick:still.tick,
        humanShots:still.shotsFired,
        humanPaintCells:still.b23HumanInkFeedback.humanChangedCells,
        nativePhase:still.matchState,baseline:snaps[0].image,
        flowCandidate:dFrame,baselineRestored:aFrame,
        exactRasterRollback:true,nativeWorldChanges:0,
        addedColliders:0,navLinksAdded:0,scoreablePromotions:0,
        artAccepted:false,productionAuthorized:false};
       writeFileSync(resolve(OUTPUT,'b292-real-inplay-organic-ada.json'),
        JSON.stringify(b292,null,2));
       console.log('B292_NATIVE_REAL_FLOW_A_D_A_PASS',JSON.stringify(b292));
      }finally{
       await evaluate(`(() => {
        const el=document.querySelector('#t21-f3-b202-real-pause');
        if(el)el.style.visibility=${JSON.stringify(modal.visibility)};
        history.replaceState(null,'',${JSON.stringify(originalUrl)});
        return true;})()`);
      }
      if(JSON.stringify(stableRound(await snapshot()))!==cleanStable)
       fail('B289_NATIVE_WORLD_NOT_RESTORED_AFTER_STUDY');
     }
     return;
    }
    // B250: same Chromium camera and paused zero-tick world, with only
    // registered solid material/sky switch. No source/paint/actor writes.
    const b250Before=await snapshot();
    const b250Original=await evaluate(
     'window.__t21F3.setB250StageReadability(false)');
    await sleep(180);
    const b250OriginalShot=await b246Screenshot('b250-original-source-ready');
    const b250Readable=await evaluate(
     'window.__t21F3.setB250StageReadability(true)');
    await sleep(180);
    const b250ReadableShot=await b246Screenshot('b250-readable-source-ready');
    const b250After=await snapshot();
    if(b250Original.enabled!==false||b250Readable.enabled!==true||
       b250Readable.sourceSolids!==25||b250Readable.materialBindings<=0||
       b250Original.renderSolids!==b250Readable.renderSolids||
       b250Original.authority!=='25/17/26/0'||
       b250Readable.authority!=='25/17/26/0'||
       b250OriginalShot.sha256===b250ReadableShot.sha256||
       b250Readable.productionAuthorized!==false||
       b250After.sourceScoreablePromotions!==0||
       JSON.stringify(stableRound(b250Before))!==
        JSON.stringify(stableRound(b250After)))
      fail('B250_RENDER_ONLY_AB_UNTRUSTED_'+
       JSON.stringify({b250Original,b250Readable,b250OriginalShot,b250ReadableShot}));
    const b250Evidence={schema:'B250_GENUINE_CHROMIUM_REGISTERED_SOURCE_AB',
     original:b250Original,readable:b250Readable,
     screenshots:[b250OriginalShot,b250ReadableShot],
     tick:0,actorTeleports:0,source:'25/17/26/0',officialWinner:'NONE'};
    writeFileSync(resolve(OUTPUT,'b250-render-source-ab.json'),
     JSON.stringify(b250Evidence,null,2));
    console.log('B250_REAL_REGISTERED_STAGE_MATERIAL_AB_PASS',
     JSON.stringify(b250Evidence));
    // B251: A/B only the existing pinned optical materials, with
    // B250's physical registered solids, ambient and camera unchanged.
    const b251Before=await snapshot();
    const b251Off=await evaluate('window.__t21F3.setB251OpticalSeparation(false)');
    await sleep(180);
    const b251OriginalFrame=await b246Screenshot('b251-original-optical-ready');
    const b251On=await evaluate('window.__t21F3.setB251OpticalSeparation(true)');
    await sleep(180);
    const b251ReadableFrame=await b246Screenshot('b251-separated-optical-ready');
    // A-B-A recovery: the cosmetic variant is ART HOLD, NOT default.
    const b251Restored=await evaluate(
     'window.__t21F3.setB251OpticalSeparation(false)');
    await sleep(180);
    const b251RestoredFrame=await b246Screenshot('b251-restored-optical-ready');
    const b251After=await snapshot();
    if(b251Off.enabled!==false||b251On.enabled!==true||
       b251Restored.enabled!==false||
       b251OriginalFrame.sha256!==b251RestoredFrame.sha256||
       b251On.existingStructureObjects!==38||
       b251On.existingReferenceBatches<4||
       b251On.materialBindings<42||
       b251On.geometryAdded!==0||b251On.collidersAdded!==0||
       b251On.source!=='25/17/26/0'||
       b251On.certifiedPhysicalStructureAdded!==false||
       b251OriginalFrame.sha256===b251ReadableFrame.sha256||
       JSON.stringify(stableRound(b251Before))!==
        JSON.stringify(stableRound(b251After))||
       b251After.sourceScoreablePromotions!==0)
      fail('B251_PINNED_OPTICAL_MATERIAL_AB_FAILED_'+
       JSON.stringify({b251Off,b251On,b251OriginalFrame,b251ReadableFrame}));
    const b251Evidence={schema:'B251_REAL_CHROMIUM_UNREGISTERED_OPTICAL_AB',
     original:b251Off,separated:b251On,restored:b251Restored,
     frames:[b251OriginalFrame,b251ReadableFrame,b251RestoredFrame],
     artDecision:'HOLD_REVERT_TO_ORIGINAL_AFTER_AB',
     originalPhysics:'25/17/26/0',actorRelocations:0,
     geometryWrites:0,sourceClockBeforeFirstClick:0,officialWinner:'NONE'};
    writeFileSync(resolve(OUTPUT,'b251-optical-separation-ab.json'),
     JSON.stringify(b251Evidence,null,2));
    console.log('B251_REAL_CHROMIUM_PINNED_OPTICAL_AB_PASS',
     JSON.stringify(b251Evidence));
    const readyImage=Buffer.from((await cmd('Page.captureScreenshot',{
     format:'png',captureBeyondViewport:false})).data,'base64');
    writeFileSync(resolve(OUTPUT,'b242-source-round-ready.png'),readyImage);
    async function clickRoundButton(){
     const b=await evaluate(`(() => {
      const b=document.querySelector('#t21-f3-b202-resume');
      const r=b?.getBoundingClientRect();
      return {x:r?.left+r?.width/2,y:r?.top+r?.height/2};
     })()`);
     if(!(b.x>0&&b.x<1600&&b.y>0&&b.y<900))
      fail('B242_START_RESUME_BUTTON_OUTSIDE_VIEW');
     await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:b.x,y:b.y,button:'none'});
     for(const type of ['mousePressed','mouseReleased'])
      await cmd('Input.dispatchMouseEvent',{type,x:b.x,y:b.y,button:'left',clickCount:1});
    }
    async function verifyPausedRound(label){
     await until(async()=>{
      const s=await snapshot();
      return s.paused&&!s.stopReason&&
       await evaluate('document.pointerLockElement===null')?s:false;
     },25000);
     const before=await snapshot();
     await sleep(1200);
     const after=await snapshot();
     if(JSON.stringify(stableRound(before))!==JSON.stringify(stableRound(after)))
      fail('B242_'+label+'_PAUSED_NATIVE_WORLD_CHANGED');
     const p=await evaluate(`(() => {
      const p=document.querySelector('#t21-f3-b202-real-pause');
      return {visible:!!p&&!p.hidden,state:p?.dataset.t21B202NativeState};
     })()`);
     if(p.visible!==true||p.state!=='NATIVE_PAUSED')
      fail('B242_'+label+'_PAUSE_NOT_VISIBLE');
     await clickRoundButton();
     const resumed=await until(async()=>{
      const s=await snapshot();
      return !s.paused&&!s.stopReason&&s.tick>after.tick&&
       await evaluate('document.pointerLockElement===document.querySelector("#app-canvas")')?s:false;
     },30000);
     const origin=await evaluate('performance.timeOrigin');
     if(origin!==selected.origin||resumed.cpu.physicalFootRelocations!==0||
        resumed.sourceScoreablePromotions!==0||resumed.productionAuthorized!==false)
      fail('B242_'+label+'_RESUME_WORLD_OR_AUTHORITY_CHANGED');
     return {label,paused:stableRound(after),resumedTick:resumed.tick,
      sameWorldTimeOrigin:origin,actualUiClick:true};
    }
    // B208: continue from the freshly selected world, with real browser
    // pointer lock, native HUMAN keyboard/mouse and seven ORIGINAL CPU.
    // This proves an actual playable source battle round, not only URL.
    await clickRoundButton();
    await until(()=>evaluate(
     'document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
    for(const type of ['keyDown','keyUp'])
     await cmd('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',
      windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
    const stagingPause=await verifyPausedRound('STAGING_ESCAPE');
    const realStart=await snapshot();
    const key={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
    await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
    await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
     x:800,y:450,button:'left',clickCount:1});
    await until(async()=>{
     const s=await snapshot();
     if(s.stopReason)fail('B208_NEW_SOURCE_PLAYER_KCC_STOP_'+s.stopReason);
     return s.tick>=realStart.tick+42&&s.shotsFired>realStart.shotsFired&&
      s.b23HumanInkFeedback.humanChangedCells>
       realStart.b23HumanInkFeedback.humanChangedCells?s:false;
    },90000);
    await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
     x:800,y:450,button:'left',clickCount:1});
    await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
    // B223 real Chromium 40285688396 timed out at 210s after the
    // B207 world-select PASS. A prior successful B221 run needed ~205s
    // to rejoin 7 CPUs. This is a bounded wall-clock variance allowance,
    // NEVER a fake tick advance, actor relocation or relaxed gameplay gate.
    let b223RejoinPolls=0;
    const realSeven=await until(async()=>{
     const s=await snapshot();
     if(s.stopReason)fail('B208_SOURCE_SEVEN_CPU_ORIGINAL_STOP_'+s.stopReason);
     if(++b223RejoinPolls%24===0)
      console.log('B223_REAL_B207_REJOIN_PROGRESS',JSON.stringify({
       realNativeTick:s.tick,matchState:s.matchState,
       genuinelyRejoined:s.cpu.physicalRejoins.length,
       realSourceInkChanges:s.cpuImpactInkCellsChanged,
       actorRelocations:s.cpu.physicalFootRelocations,
       originalSolids:s.originalSourceSolids,
       originalLinks:s.originalSourceNavigationLinks,
       sourceScoreable:s.sourceScoreablePromotions,
       productionAuthorized:s.productionAuthorized
      }));
     return s.matchState==='PLAYING'&&s.cpu.physicalRejoins.length===7&&
      s.cpuImpactInkCellsChanged>0?s:false;
    },270000);
    // B286: after genuine, untouched source 7-CPU rejoin, the same
    // PLAYER compact status must reflect native lives without score claims.
    // Observe only; never advance virtual ticks, warp CPUs or synthesize HP.
    const b286Live=await until(async()=>{
     const x=await evaluate(`(() => {
      const el=document.querySelector('#t21-f3-b286-source-team');
      const state=window.__t21F3?.snapshot?.();
      return {visible:!!el&&!el.hidden&&getComputedStyle(el).display!=='none',
       view:document.querySelector('#ui-root')?.dataset.t21B245Presentation,
       actualRejoined:state?.cpu?.physicalRejoins?.length,
       actualSource:[state?.originalSourceSolids,state?.originalPaintSurfaces,
        state?.originalSourceNavigationLinks,state?.sourceScoreablePromotions],
       noWarps:state?.cpu?.physicalFootRelocations,
       ally:el?.dataset.allyActive,enemy:el?.dataset.enemyActive,
       rejoining:el?.dataset.rejoining,
       scoreable:el?.dataset.scoreable,
       officialWinner:el?.dataset.officialWinner,
       certifiedEncounter:el?.dataset.enemyContactCertified,
       ownLabel:el?.textContent};
     })()`);
     return x?.visible&&x.view==='PLAYER'&&x.actualRejoined===7&&
      x.rejoining==='0'&&x.scoreable==='0'&&
      x.officialWinner==='NONE'&&x.certifiedEncounter==='false'&&
      x.noWarps===0&&x.actualSource.join('/')==='25/17/26/0'&&
      Number.isInteger(Number(x.ally))&&Number(x.ally)>=0&&Number(x.ally)<=3&&
      Number.isInteger(Number(x.enemy))&&Number(x.enemy)>=0&&Number(x.enemy)<=4&&
      x.ownLabel?.includes('UNSCORED')?x:false;
    },30000);
    writeFileSync(resolve(OUTPUT,'b286-source-real-team-after-rejoin.json'),
     JSON.stringify({schema:'B286_REAL_CHROMIUM_TEAM_AFTER_SEVEN_REJOIN',
      evidence:b286Live,officialWinner:'NONE',virtualTicks:0,
      actorRelocations:0,scoreablePromotions:0},null,2));
    console.log('B286_REAL_CHROMIUM_SOURCE_TEAM_REJOIN_PASS',
     JSON.stringify(b286Live));
    const moved=Math.hypot(
     realSeven.player.position[0]-realStart.player.position[0],
     realSeven.player.position[2]-realStart.player.position[2]);
    if(moved<.20||realSeven.shotsFired<=realStart.shotsFired||
       realSeven.b23HumanInkFeedback.humanChangedCells<=
        realStart.b23HumanInkFeedback.humanChangedCells||
       realSeven.sourceScoreablePromotions!==0||
       realSeven.productionAuthorized!==false||
       realSeven.unrestricted4v4Certified!==false||
       realSeven.cpu.physicalFootRelocations!==0)
     fail('B208_REAL_SOURCE_BATTLE_NATIVE_PLAY_FAILED_'+JSON.stringify({
      moved,shots:realSeven.shotsFired,cpu:realSeven.cpu.physicalRejoins.length,
      cpuInk:realSeven.cpuImpactInkCellsChanged}));
    // B249: true PLAYING after seven existing CPUs physically rejoin. Native
    // human KCC, original impact ink and 25/17/26/0 are still measured.
    const b249Frame=await b246Screenshot('b249-real-native-inplay');
    const b250Active=await evaluate(
      "document.querySelector('#app-canvas')?.dataset.t21B250Readability");
    if(b250Active!=='READABLE')
     fail('B250_REAL_PLAYING_SOURCE_VISUAL_NOT_ACTIVE_'+b250Active);
    const b251Active=await evaluate(
      "document.querySelector('#app-canvas')?.dataset.t21B251OpticalSeparation");
    if(b251Active!=='ORIGINAL')
     fail('B251_ART_HOLD_NATIVE_PLAYING_OPTICS_NOT_RESTORED_'+b251Active);
    const b249Read=await evaluate(`(() => {
      const s=window.__t21F3.snapshot();
      const canvas=document.querySelector('#app-canvas');
      return {visual:canvas?.dataset.t21B248Visual,
       pose:canvas?.dataset.t21B249VisualPose,
       renderer:canvas?.dataset.t21F3Renderer,
       tick:s.tick,paused:s.paused,matchState:s.matchState,
       shots:s.shotsFired,humanInk:s.b23HumanInkFeedback.humanChangedCells,
       nativeCpu:s.cpu.cpu.length,relocations:s.cpu.physicalFootRelocations,
       authority:[s.originalSourceSolids,s.originalPaintSurfaces,
        s.originalSourceNavigationLinks,s.sourceScoreablePromotions],
       realPointerLock:document.pointerLockElement===canvas};
    })()`);
    if(b249Read.visual!=='EIGHT_NATIVE_ACTORS_RENDER_ONLY'||
       b249Read.pose!=='NATIVE_ACTOR_FACING_STRIDE'||
       b249Read.renderer!=='webgl2'||b249Read.tick<=realStart.tick||
       b249Read.paused!==false||b249Read.matchState!=='PLAYING'||
       b249Read.shots<=0||b249Read.humanInk<=0||
       b249Read.nativeCpu!==7||b249Read.relocations!==0||
       !b249Read.realPointerLock||
       b249Read.authority.join('/')!=='25/17/26/0'||
       b249Frame.bytes<100000)
      fail('B249_NATIVE_REAL_GAMEPLAY_FRAME_INVALID_'+JSON.stringify(b249Read));
    const b249Evidence={schema:'B249_REAL_NATIVE_GAMEPLAY_VISUAL',
      screenshot:b249Frame,snapshot:b249Read,
      renderOnly:true,newActors:0,fakeTicks:0,officialWinner:'NONE'};
    writeFileSync(resolve(OUTPUT,'b249-real-native-gameplay-visual.json'),
     JSON.stringify(b249Evidence,null,2));
    console.log('B249_REAL_NATIVE_GAMEPLAY_VISUAL_PASS',
     JSON.stringify(b249Evidence));
    const r211=await evaluate(`(() => {
      const r=document.querySelector('#t21-f3-b211-real-battle-roster');
      return {visible:!!r&&!r.hidden,source:r?.dataset.sourceOnly,
       count:Number(r?.dataset.realCpuCount),score:r?.dataset.scoreable,
       winner:r?.dataset.officialWinner,certified:r?.dataset.actualEnemyEncounterCertified,
       text:r?.textContent??'',tick:Number(r?.dataset.nativeTick)};
    })()`);
    if(!r211.visible||r211.source!=='true'||r211.count!==7||
       r211.score!=='0'||r211.winner!=='NONE'||r211.certified!=='false'||
       !r211.text.includes('A1')||!r211.text.includes('B4')||
       !r211.text.includes('REAL 1 + 7'))
      fail('B211_REAL_NATIVE_ROSTER_NOT_VISIBLE_'+JSON.stringify(r211));
    writeFileSync(resolve(OUTPUT,'w10b211-actual-cpu-life-roster.json'),
     JSON.stringify({nativeTick:realSeven.tick,display:r211,
      realCpuIds:realSeven.cpu.cpu.map(x=>x.id),scoreable:0,
      manufacturedHits:0,officialWinner:'NONE'},null,2));
    console.log('B211_NATIVE_BATTLE_ROSTER_REAL_1_PLUS_7',JSON.stringify(r211));
    const nativeLead=realSeven.b212RealMovingEnemyAim;
    if(!nativeLead||nativeLead.enabled!==true||
       nativeLead.targetTeleports!==0||nativeLead.damageInjected!==0||
       nativeLead.sourceScoreable!==0||nativeLead.opponentRoutesCertified!==0||
       !Number.isSafeInteger(nativeLead.realPhysicalVelocitySamples)||
       !Number.isSafeInteger(nativeLead.actualNativeAimAdjustments)||
       nativeLead.actualNativeAimAdjustments>nativeLead.realPhysicalVelocitySamples)
      fail('B212_NATIVE_SOURCE_AIM_AUTHORITY_'+JSON.stringify(nativeLead));
    console.log('B212_REAL_NATIVE_MOVING_ENEMY_AIM_GATED',JSON.stringify({
     realPhysicalVelocitySamples:nativeLead.realPhysicalVelocitySamples,
     actualNativeAimAdjustments:nativeLead.actualNativeAimAdjustments,
     enemyRoutesCertified:0,actorTeleports:0,officialWinner:'NONE'}));
    const counter=realSeven.b213ActualSourceCounterfire;
    if(!counter||counter.enabled!==true||
       counter.fabricatedShots!==0||counter.fabricatedDamage!==0||
       counter.actorTeleports!==0||counter.originalRoutesCertified!==0||
       counter.originalScoreable!==0||counter.productionAuthorized!==false||
       !Number.isSafeInteger(counter.actualProjectileDamageAttributions)||
       !Number.isSafeInteger(counter.originalSightAcceptedRetaliations)||
       (counter.actualProjectileDamageAttributions===0&&
        counter.originalSightAcceptedRetaliations!==0))
      fail('B213_SOURCE_ACTUAL_HIT_RETALIATION_HOLD_'+JSON.stringify(counter));
    console.log('B213_REAL_NATIVE_COUNTERFIRE_READONLY_WITNESS',JSON.stringify(counter));
    // B214 actual player-selected B207 world only. Verify REAL source
    // owner-grid recovery and patch aim are wired into the same 7 CPU.
    const b214=realSeven.b214SustainedBattleInk,
     r=realSeven.b178SourceInkRecovery,
     p=realSeven.b180OriginalPatchAim,
     a=realSeven.b64SourceInkSweep;
    const marker=await evaluate(
     'document.querySelector("#app-canvas")?.dataset.t21B214NativeBattleInk');
    if(!b214?.enabled||b214.originalScoreable!==0||
       b214.syntheticAmmoAdded!==0||b214.syntheticShotsAdded!==0||
       r?.enabled!==true||r?.zeroSourceScoreable!==true||
       p?.enabled!==true||p?.sourceScoreable!==0||
       a?.enabled!==true||marker!=='REAL_SOURCE_INK_ECONOMY'||
       realSeven.sourceScoreablePromotions!==0||
       realSeven.cpu.physicalFootRelocations!==0)
      fail('B214_REAL_NATIVE_SOURCE_CPU_INK_UNAVAILABLE_'+JSON.stringify({
       b214,r,p,a,marker
      }));
    console.log('B214_GENUINE_SELECTED_SOURCE_CPU_INK_ECONOMY',
     JSON.stringify({genuineSevenCpu:realSeven.cpu.physicalRejoins.length,
      actualNativeOwnerInkRecovered:r.b179ActuallyRecoveredOwnSourceInk,
      originalUnpaintedPatchSelections:p.chosenRealUnpaintedSourcePatches,
      sourceAimSamples:a.candidateSamples,
      scoreable:0,actorTeleports:0,officialWinner:'NONE'}));
    const pacing=realSeven.b215RealBattleAimPacing;
    if(pacing?.enabled!==true||
       !Number.isSafeInteger(pacing.realWeaponCooldownPaintScansDeferred)||
       pacing.realWeaponCooldownPaintScansDeferred<0||
       pacing.playerAmmoOrCpuShotInjection!==0||
       pacing.originalNavLinkWrites!==0||
       pacing.originalScoreableWrites!==0||
       pacing.productionAuthorized!==false)
      fail('B215_NATIVE_REAL_WEAPON_COOLDOWN_PACING_NOT_ARMED_'+
       JSON.stringify(pacing));
    console.log('B215_REAL_SOURCE_CPU_SHOT_READY_PAINT_PACING',JSON.stringify({
       selectedActualPlayerBattle:true,
       trueCooldownBlockedAimQueries:pacing.realWeaponCooldownPaintScansDeferred,
       fabricatedMainWeaponShots:0,
       fabricatedCpuFootPaths:0,officialWinner:'NONE'
    }));
    const backfill=realSeven.b216RealNativePaintBackfill;
    if(!backfill||backfill.enabled!==true||
       !Number.isSafeInteger(backfill.realRapierStageAimChecks)||
       !Number.isSafeInteger(backfill.originalSourceBackfillAims)||
       backfill.realRapierStageAimChecks<
        backfill.originalSourceBackfillAims||
       backfill.actorFootWrites!==0||backfill.newNavLinks!==0||
       backfill.fakeShots!==0||backfill.scoreableSourcePaint!==0||
       backfill.certifiedOpponentRoutes!==0||
       backfill.productionAuthorized!==false)
      fail('B216_NATIVE_ORIGINAL_BACKFILL_NOT_VERIFIED_'+JSON.stringify(backfill));
    console.log('B216_GENUINE_SOURCE_RAPIER_BACKFILL_IN_PLAYER_BATTLE',
      JSON.stringify(backfill));
    // B217 visible, read-only source combat feedback, sourced from
    // native CPU shot requests and REAL changed paint cells independently.
    const live=await evaluate(`(() => {
     const clock=document.querySelector('#t21-f3-b205-real-round');
     return {source:clock?.dataset.t21B217RealSourceOnly,
      shots:clock?.dataset.t21B217SourceCpuShots,
      paint:clock?.dataset.t21B217CpuRealPaintCells,
      lastTick:clock?.dataset.t21B217LatestWindowTick,
      winner:clock?.dataset.t21B217OfficialWinner,
      text:clock?.textContent??''};
    })()`);
    if(live.source!=='true'||live.winner!=='NONE'||
       !Number.isSafeInteger(Number(live.shots))||
       !Number.isSafeInteger(Number(live.paint))||
       Number(live.shots)<0||Number(live.paint)<0||
       !Number.isSafeInteger(Number(live.lastTick))||
       !live.text.includes('CPU ACTIVITY')||
       !live.text.includes('SOURCE CPU SHOTS')||
       !live.text.includes('ENEMY SIGHT')||
       !live.text.includes('NO OFFICIAL WINNER'))
      fail('B217_NATIVE_REAL_COMBAT_HUD_NOT_READONLY_'+JSON.stringify(live));
    console.log('B217_REAL_SOURCE_5S_CPU_ACTIVITY_HUD',JSON.stringify(live));
    // B217 genuine 5-second 60Hz browser proof: one complete
    // native window, not only a newly created DOM field. No QA ticks.
    const b217TrueWindow=await until(async()=>{
      const after=await snapshot();
      if(after.stopReason)
       fail('B217_NATIVE_5S_STOP_'+after.stopReason);
      if(after.matchState!=='PLAYING'||after.paused||
         after.tick<realSeven.tick+300||
         after.cpu.physicalRejoins.length!==7)return false;
      const el=await evaluate(`(() => {
       const c=document.querySelector('#t21-f3-b205-real-round');
       return {lastTick:Number(c?.dataset.t21B217LatestWindowTick),
        shotCount:Number(c?.dataset.t21B217SourceCpuShots),
        paintChanges:Number(c?.dataset.t21B217CpuRealPaintCells),
        text:c?.textContent??''};
      })()`);
      const window=after.b217ActualLivePaintTempo;
      return window&&window.nativeTicks>=300&&
       window.toTick===el.lastTick&&
       el.lastTick<=after.tick&&
       el.text.includes('CPU ACTIVITY · LAST ')?
         {after,el,window}:false;
    },180000);
    const win=b217TrueWindow.window,physical=b217TrueWindow.after;
    if(win.sourceScoreable!==0||
       !Number.isSafeInteger(win.genuineCpuSourceShots)||
       !Number.isSafeInteger(win.actualCpuChangedPaintCells)||
       win.genuineCpuSourceShots<0||
       win.actualCpuChangedPaintCells<0||
       physical.sourceScoreablePromotions!==0||
       physical.cpu.physicalFootRelocations!==0||
       physical.productionAuthorized!==false||
       b217TrueWindow.el.shotCount<realSeven.cpuSourceTurfShots||
       b217TrueWindow.el.paintChanges<realSeven.cpuImpactInkCellsChanged)
      fail('B217_REAL_NATIVE_ACTIVITY_WINDOW_DRIFT_'+JSON.stringify({
       win,el:b217TrueWindow.el
      }));
    const genuineWindow={
      schema:'B217_GENUINE_5S_NATIVE_PLAYER_BATTLE_ACTIVITY',
      actualRealCpuRejoined:physical.cpu.physicalRejoins.length,
      currentTrueNativeTick:physical.tick,
      window:win,realDisplayedCounters:b217TrueWindow.el,
      virtualTicksInjected:false,syntheticInkAdded:false,
      officialWinner:'NONE',originalScoreable:0
    };
    writeFileSync(resolve(OUTPUT,'w10b217-genuine-5s-combat-activity.json'),
     JSON.stringify(genuineWindow,null,2));
    console.log('B217_REAL_5S_NATIVE_CPU_PAINT_TEMPO_PASS',
     JSON.stringify(genuineWindow));
    // Activate a real second Chrome target; no synthetic DOM blur event.
    const focusTab=await cmd('Target.createTarget',{url:'about:blank'});
    try{
     await cmd('Target.activateTarget',{targetId:focusTab.targetId});
     await until(async()=>{const s=await snapshot();return s.paused?s:false;},25000);
     await cmd('Target.activateTarget',{targetId:tab.id});
     await cmd('Page.bringToFront');
    }finally{
     await cmd('Target.closeTarget',{targetId:focusTab.targetId});
    }
    const focusPause=await verifyPausedRound('PLAYING_FOCUS_LOSS');
    // B243: inspect the genuine player-facing reticle, never a fake hit.
    const liveAim=await until(async()=>{
     const x=await evaluate(`(() => {
      const root=document.querySelector('#t21-f3-b243-source-aim-line');
      const caption=document.querySelector('#t21-f3-b243-source-aim-caption');
      return {visible:!!root&&!root.hidden,
       kind:root?.dataset.t21B243AimLineKind,
       certifiedHit:root?.dataset.projectileHitCertified,
       certifiedEnemy:root?.dataset.enemyContactCertified,
       scoreable:root?.dataset.originalScoreable,
       label:caption?.textContent};
     })()`);
     return x.visible?x:false;
    },25000);
    if(!['SOURCE_PAINT','SOURCE_SOLID','NO_REGISTERED_HIT'].includes(liveAim.kind)||
       liveAim.certifiedHit!=='false'||liveAim.certifiedEnemy!=='false'||
       liveAim.scoreable!=='0'||!liveAim.label.includes('NO HIT CLAIM'))
     fail('B243_REAL_SOURCE_AIM_LINE_UNTRUSTED_'+JSON.stringify(liveAim));
    const lifecycle={schema:'B242_REAL_SOURCE_ROUND_READY_PAUSE_RESUME',
     ready:{before:stableRound(readyBefore),after:stableRound(readyAfter),ui:readyUi},
     stagingPause,focusPause,b243LiveAim:liveAim,virtualTicksInjected:false,
     actorRelocations:0,originalStage:'25/17/26/0',officialWinner:'NONE'};
    writeFileSync(resolve(OUTPUT,'b242-real-source-round-lifecycle.json'),
     JSON.stringify(lifecycle,null,2));
    console.log('B242_REAL_SOURCE_ROUND_LIFECYCLE_PASS',JSON.stringify(lifecycle));
    const b218=realSeven.b218OriginalFaceChainSeams;
    if(!b218||b218.originalAuthority!==
       '25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
       b218.adjacentSeams!==8||b218.seams?.length!==8||
       b218.seams.some(x=>!Number.isFinite(x.gapMeters)||
        x.nativeConnectedCertified!==false||
        x.physicalKccCertified!==false)||
       b218.inventedStageSolids!==0||b218.navLinksAdded!==0||
       b218.scoreablePromotions!==0||
       b218.previousAllFiveFaceRecastExperimentSucceeded!==false||
       b218.productionAuthorized!==false)
      fail('B218_EXACT_NATIVE_ORIGINAL_FACE_CHAIN_AUTHORITY_'+
        JSON.stringify(b218));
    console.log('B218_EXACT_ORIGINAL_TEMPLE01_FACE_SEAMS',
      JSON.stringify({seams:b218.seams,widestBySide:b218.widestBySide,
        originalCrossTeamRoutes:'0/12',addedSolids:0,addedLinks:0}));
    const b219=realSeven.b219OriginalUnderpassBlockerTriage;
    if(!b219||b219.originalAuthority!==
       '25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
       b219.results?.length!==8||
       b219.priorityRankedSeams?.length!==8||
       b219.addedGeometry!==0||b219.addedNavLinks!==0||
       b219.sourceScoreableAdded!==0||
       b219.priorCi691AllComponentsAddedButRecastFailed!==true||
       b219.nativeRecastCorridorCertified!==false||
       b219.physicalKccCorridorCertified!==false||
       b219.originalEnemyNativeFootRoutesCertified!=='0/12'||
       b219.productionAuthorized!==false)
      fail('B219_REAL_ORIGINAL_DISCONNECTED_RECAST_TRIAGE_HOLD_'+
       JSON.stringify(b219));
    writeFileSync(resolve(OUTPUT,'w10b219-genuine-original-gap-triage.json'),
     JSON.stringify(b219,null,2));
    console.log('B219_GENUINE_SOURCE_GAP_AND_NATIVE_RECAST_TRIAGE',
      JSON.stringify({first:b219.firstCandidateToInspect,
        gapSeams:b219.measuredGeometricGapsOver30cm,
        realRecastNearFaces:b219.sourceOriginalRecastNearFaceSamples,
        originalRapierHitSamples:b219.actualRegisteredRapierRayHits,
        originalCrossTeamRoutes:'0/12',noExtraGeometry:true}));
    const b220=realSeven.b220ActualNativeSourceSeamProbes;
    if(!b220||b220.originalAuthority!==
        '25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
       b220.actualNativeRecastAuditPathQueries!==8||
       b220.actualNativeNearestProjectionQueries!==16||
       b220.actualOriginalRapierStageRayQueries!==16||
       b220.actualOriginalFacePairs?.length!==8||
       b220.actualOriginalFacePairs.some(x=>
        x.referenceIsSourceTriangleCentroidNotPhysicalActor!==true||
        x.genuineCPUPathTraversalTested!==false||
        x.characterKccPhysicallyTraversed!==false||
        x.gameRouteAuthorized!==false)||
       b220.originalCrossTeamRoutesCertified!=='0/12'||
       b220.physicalKccTraversalCertified!==false||
       b220.addedPhysicsBodies!==0||b220.addedNavLinks!==0||
       b220.addedScoreable!==0||b220.productionAuthorized!==false)
      fail('B220_NATIVE_ORIGINAL_SOURCE_SEAM_RECAST_PHYSICS_AUDIT_'+
       JSON.stringify(b220));
    writeFileSync(resolve(OUTPUT,'w10b220-exact-native-seam-recast-rapier.json'),
     JSON.stringify(b220,null,2));
    console.log('B220_ORIGINAL_RECAST_RAPIER_SEAM_WITNESS',
      JSON.stringify({first:b220.firstPrioritySeam,
       originalSourceSeams:b220.actualOriginalFacePairs.length,
       nativeRecastQueries:8,originalRapierRays:16,
       newNavLinks:0,sourceScoreable:0,crossTeamRoutes:'0/12'}));
    const native={schema:'B208_NATIVE_180S_COMBAT_MODE_PLAYABLE',
     realButtonClick:true,newWorldTimeOrigin:selected.origin,
     humanKccMeters:Number(moved.toFixed(3)),
     truePlayerShots:realSeven.shotsFired,
     humanImpactChangedCells:realSeven.b23HumanInkFeedback.humanChangedCells,
     genuineCpuRejoins:realSeven.cpu.physicalRejoins.length,
     genuineCpuImpactChangedCells:realSeven.cpuImpactInkCellsChanged,
     trueNativeTicks:realSeven.tick,
     stillPlaying:realSeven.matchState,
     actualClockRemaining:realSeven.timeRemainingSeconds,
     actualEnemyEncounterVerified:false,actualSplatVerified:false,
     certifiedOppositeRoutes:'0/12',officialWinner:'NONE',
     originalStage:'25/17/26/0',actorTeleports:0,
     fakeNativeTicks:false,productionAuthorized:false};
    writeFileSync(resolve(OUTPUT,'w10b208-real-selected-source-battle.json'),
     JSON.stringify(native,null,2));
    console.log('B208_REAL_COMBAT_ROUND_HUMAN_AND_7CPU',JSON.stringify(native));
   }
   return;
  }
  await sleep(850);
 }
 fail('B76_NO_GENUINE_NATIVE_CPU_AND_HUMAN_SOURCE_INK_PULSES_WITHIN_13_MINUTES');
}
try{await run();}
catch(err){console.error(err);process.exitCode=1;}
finally{sock?.close();for(const child of children)child.kill('SIGTERM');}
