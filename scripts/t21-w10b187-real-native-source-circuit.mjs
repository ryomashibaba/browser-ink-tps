#!/usr/bin/env node
/**
 * B187: ONE actual Chromium WebGL2/PlayCanvas/Rapier 60Hz gameplay run:
 * real CPU release -> real human KeyW drop -> exact source ramp
 * -> original raised support -> new HUMAN projectile ink -> visible CLEAR.
 * No injected ticks, no actor pose writing, no fake source/CPU/opponent.
 * Source authority remains 25/17/26/0, normal original 4v4 HOLD.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {b189RealSevenCpuSourceRelease}
 from './t21-w10b189-real-cpu-release-gate.mjs';
import {b190NativeCpuStartProgress}
 from './t21-w10b190-native-start-evidence.mjs';
import {b191ActualNativeRaisedOriginalArrival}
 from './t21-w10b191-raised-source-native-stop.mjs';
const root='http://127.0.0.1:4197/browser-ink-tps/';
const output=process.env.T21_B187_EVIDENCE_DIR??
 '/tmp/t21-b187-native-original-circuit';
const children=[],pending=new Map();
let socket=null,nextId=0,latestEvidence=null;
function fail(tag,evidence){
 throw Error('B187_'+tag+(evidence===undefined?'':'_'+JSON.stringify(evidence).slice(0,3500)));
}
async function until(read,ms=120000,poll=130){
 const limit=Date.now()+ms;
 while(Date.now()<limit){
  const result=await read();
  if(result)return result;
  await sleep(poll);
 }
 fail('REAL_NATIVE_TIMEOUT',{ms});
}
async function cmd(method,params={}){
 if(socket?.readyState!==WebSocket.OPEN)fail('CDP_DISCONNECTED');
 const id=++nextId;
 return await new Promise((yes,no)=>{
  const guard=setTimeout(()=>{
   pending.delete(id);no(Error('B187_CDP_TIMEOUT_'+method));
  },25000);
  pending.set(id,{
   yes:r=>{clearTimeout(guard);yes(r);},
   no:e=>{clearTimeout(guard);no(e);}
  });
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const res=await cmd('Runtime.evaluate',{
  expression,returnByValue:true,awaitPromise:true
 });
 if(res.exceptionDetails)fail('PAGE_SCRIPT_EXCEPTION',res.exceptionDetails);
 return res.result?.value;
}
const keys={
 KeyW:{key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87},
 KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68}
};
async function mouse(type){
 await cmd('Input.dispatchMouseEvent',{
  type,x:800,y:450,button:'left',clickCount:1
 });
}
function freeze(s,stage){
 if(s.stopReason||s.originalSourceSolids!==25||
    s.originalPaintSurfaces!==17||
    s.originalSourceNavigationLinks!==26||
    s.sourceScoreablePromotions!==0||
    s.productionAuthorized!==false||
    s.unrestricted4v4Certified!==false||
    s.b183OriginalHumanDescent?.enabled!==true||
    s.b186RealOriginalHumanCircuit?.enabled!==true||
    s.b186RealOriginalHumanCircuit?.sourceScoreablePromotions!==0||
    s.b186RealOriginalHumanCircuit?.naturalCrossTeamRouteProven!==false||
    s.b186RealOriginalHumanCircuit?.officialWinner!=='NONE')
  fail('FROZEN_ORIGINAL_AUTHORITY', {stage,tick:s.tick,stop:s.stopReason});
 return s;
}
async function run(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(bin=>{try{execFileSync('which',[bin],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROMIUM_NOT_INSTALLED');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],
  {stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000,250);
 const browser=spawn(chrome,['--headless=new','--no-sandbox',
  '--disable-dev-shm-usage','--disable-extensions','--no-first-run',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9327','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b187-browser','about:blank'],
  {stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{
   const response=await fetch('http://127.0.0.1:9327/json');
   return (await response.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  }catch{return null;}
 },60000,250);
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   socket.addEventListener('open',ok,{once:true});
   socket.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('B187_CDP_CONNECT_TIMEOUT');})
 ]);
 socket.addEventListener('message',ev=>{
  const data=JSON.parse(String(ev.data)),entry=pending.get(data.id);
  if(!entry)return;
  pending.delete(data.id);
  if(data.error)entry.no(Error(JSON.stringify(data.error)));
  else entry.yes(data.result??{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false
 });
 const route='?t21Play=preview&t21QaDrive=source&'+
  't21W10B112=humanGround&t21W10B183=firstDropPlay';
 await cmd('Page.navigate',{url:root+route});
 await until(async()=>await evaluate(`(()=>{
  const canvas=document.querySelector('#app-canvas');
  return canvas?.dataset.t21F3Ready==='READY'&&
   canvas?.dataset.t21F3Renderer==='webgl2';
 })()`),120000,300);
 const snapshot=async(stage)=>freeze(
  await evaluate('window.__t21F3.snapshot()'),stage);
 const start=await snapshot('ORIGINAL_CHROME_BOOT');
 if(start.matchState!=='STAGING'||start.paused)
  fail('NOT_ORIGINAL_STAGING',{state:start.matchState});
 // B188: this one-way original drop must be retryable by normal page
 // reinitialization, never by source floor, actor or clock mutation.
 const realRetryControl=await evaluate(`(()=>{
  const b=document.querySelector('#t21-f3-b188-retry-source-circuit');
  return b?{
   visible:!b.hidden&&b.getBoundingClientRect().width>0,
   enabled:!b.disabled,sourceOnly:b.dataset.originalSourceOnly,
   scoreable:b.dataset.scoreablePromotions,
   teleport:b.dataset.retryActorTeleport,
   fakeNativeTicks:b.dataset.retryNativeTickInjection
  }:null;
 })()`);
 if(!realRetryControl?.visible||!realRetryControl.enabled||
    realRetryControl.sourceOnly!=='true'||
    realRetryControl.scoreable!=='0'||
    realRetryControl.teleport!=='false'||
    realRetryControl.fakeNativeTicks!=='false')
  fail('B188_SOURCE_CIRCUIT_RETRY_MUST_BE_TRUE_NEW_SESSION',
   realRetryControl);
 console.log('T21_B188_REAL_ORIGINAL_RETRY_BUTTON_VISIBLE',
  JSON.stringify(realRetryControl));
 await mouse('mousePressed');await mouse('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'
 ),20000,150);
 // Do NOT flip match state or synthesize extra ticks. CPU must genuinely
 // fall and rejoin through original Recast/Rapier source first.
 // B189: the previous wait incorrectly used nonexistent
 // snapshot.nativeSourceCpuRejoined / nativeSourceCpuFreeCombat fields.
 // The actual engine publishes cpu.physicalRejoins and cpu.freeCombatEnabled.
 // B190: initialize real evidence BEFORE the long seven-CPU wait.
 // Previously a genuine CPU-release stall/180s TIME_UP had no saved
 // in-browser native stage/actor positions, making the failure opaque.
 const evidence={
  schema:'W10_B190_EARLY_AND_FULL_REAL_NATIVE_ORIGINAL_CIRCUIT_V2',
  nativeSourceStartTick:null,
  cpuRejoinedNaturally:0,
  realSourcePhysicalCpuRelease:null,
  cpuReleaseProgress:[],
  stages:[],sampleHistory:[],
  initialFrozenStage:[25,17,26,0],
  syntheticSimulationTicks:0,actorTeleportsByTest:0,
  extraOriginalSolids:0,extraNavigationLinks:0,officialWinner:'NONE',
  nativeClear:false
 };
 latestEvidence=evidence;
 let physicalRelease=null;
 let lastProgressTick=-Infinity;
 let lastProgressState='';
 const playing=await until(async()=>{
  const s=await snapshot('WAIT_SEVEN_REAL_SOURCE_CPU');
  const progress=b190NativeCpuStartProgress(s);
  // Preserve only distinct genuine 60Hz milestones; source snapshots may
  // be polled repeatedly with no fixed-step advance on slow software GPU.
  if(progress.realNativeTick!==null&&
     (progress.realNativeTick-lastProgressTick>=30||
      progress.matchState!==lastProgressState)){
   evidence.cpuReleaseProgress.push(progress);
   if(evidence.cpuReleaseProgress.length>180)
    evidence.cpuReleaseProgress.shift();
   lastProgressTick=progress.realNativeTick;
   lastProgressState=progress.matchState;
  }
  if(progress.outcome==='GAME_TIMEOUT_NO_CIRCUIT_PROOF')
   fail('REAL_MATCH_ENDED_BEFORE_HUMAN_SOURCE_CIRCUIT',progress);
  if(progress.outcome==='NATIVE_SOURCE_STOP')
   fail('REAL_SOURCE_CPU_RELEASE_STOPPED',progress);
  const witness=b189RealSevenCpuSourceRelease(s);
  if(witness){
   physicalRelease=witness;
   return s;
  }
  return false;
 },480000,350);
 evidence.nativeSourceStartTick=playing.tick;
 evidence.cpuRejoinedNaturally=physicalRelease.actualNativeCpuRejoined;
 evidence.realSourcePhysicalCpuRelease=physicalRelease;
 const collect=(label,s)=>{
  const p=s.player?.position??null;
  const item={label,tick:s.tick,matchState:s.matchState,
   nativeHumanBody:p,originalSupport:s.b112OriginalHumanGround?.
    lastOriginalSourceHitId??null,
   kccGrounded:s.b112OriginalHumanGround?.genuineKccGrounded??false,
   originalDrop:s.b183OriginalHumanDescent?.status,
   originalLowerId:s.b183OriginalHumanDescent?.
    actualOriginalRapierLowerLandingId??null,
   originalRaised:s.b186RealOriginalHumanCircuit?.
    actualOriginalRaisedFootColliderId??null,
   rampTouched:s.b186RealOriginalHumanCircuit?.
    actualOriginalRampTouched??false,
   b186:s.b186RealOriginalHumanCircuit?.status,
   cells:s.b186RealOriginalHumanCircuit?.
    realPostDropHumanImpactChangedCells??null};
  evidence.stages.push(item);
  return item;
 };
 collect('AFTER_ACTUAL_SEVEN_CPU_RELEASE',playing);
 console.log('T21_B189_SEVEN_GENUINE_SOURCE_CPU_RELEASE',
  JSON.stringify({nativeTick:playing.tick,...physicalRelease}));
 const exercise=async(name,pressed,nativeTicks)=>{
  const before=await snapshot(name+'_BEFORE');
  for(const key of pressed)await cmd('Input.dispatchKeyEvent',
   {type:'keyDown',...keys[key]});
  const untilTick=before.tick+nativeTicks;
  let observed=before,previousSample=-Infinity;
  try{
   observed=await until(async()=>{
    const s=await snapshot(name+'_LIVE');
    if(s.tick-previousSample>=12&&evidence.sampleHistory.length<160){
     evidence.sampleHistory.push({
      tick:s.tick,stage:name,
      foot:s.player?.position,
      support:s.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
      grounded:s.b112OriginalHumanGround?.genuineKccGrounded??false,
      lower:s.b183OriginalHumanDescent?.status,
      circuit:s.b186RealOriginalHumanCircuit?.status,
      freshHumanImpactCells:s.b186RealOriginalHumanCircuit?.
       realPostDropHumanImpactChangedCells??null
     });
     previousSample=s.tick;
    }
    if(s.matchState==='TIME_UP')
     fail('REAL_MATCH_TIME_UP_DURING_HUMAN_ORIGINAL_STAGE',{
      stage:name,tick:s.tick,circuit:s.b186RealOriginalHumanCircuit
     });
    // B191: use B123's proven real KCC arrival event to release true KeyD
    // immediately. Holding KeyD for the entire 90-tick maximum after the
    // original named raised collider is reached can walk off a valid floor.
    const reached=b191ActualNativeRaisedOriginalArrival(s,name);
    return reached||s.tick>=untilTick?s:false;
   },180000,110);
  }finally{
   for(const key of pressed)await cmd('Input.dispatchKeyEvent',
    {type:'keyUp',...keys[key]});
  }
  collect(name,observed);
  return observed;
 };
 // B123's already-proven physical original route: W200,D12,W18,D90.
 // All four are standard CDP user keyboard presses on a running game.
 const landing=await exercise('ACTUAL_KEYW_200_FIRST_DROP',['KeyW'],200);
 if(landing.b183OriginalHumanDescent?.status!=='SOURCE_LOWER_LANDED'||
  landing.b183OriginalHumanDescent?.actualOriginalRapierLowerLandingId!==
   'UndertowT21D:first-drop-landing-positive-z'||
  !landing.b183OriginalHumanDescent?.originalFirstDropLocalPracticeClear)
  fail('GENUINE_LOWER_FIRST_DROP_HOLD',collect('LANDING_HOLD',landing));
 // B191: retain the proven B123 keyboard path, with NO shooting
 // between genuine lower-floor landing and named raised-floor arrival.
 // Firing prematurely could spend native human ink before the player
 // actually reaches a paintable raised surface, falsely rejecting play.
 await exercise('ACTUAL_KEYD_12_LOWER_ALIGNMENT',['KeyD'],12);
 await exercise('ACTUAL_KEYW_18_LOWER_ADVANCE',['KeyW'],18);
 let final=await exercise('ACTUAL_KEYD_90_ORIGINAL_UPHILL',['KeyD'],90);
 const reachedNamedOriginalRaised=
  final.b112OriginalHumanGround?.genuineKccGrounded===true&&
  final.b112OriginalHumanGround.lastOriginalSourceHitId===
   'UndertowT21D:right-low-team-a'&&
  final.b186RealOriginalHumanCircuit?.actualOriginalRampTouched===true&&
  ['PAINT_ON_RAISED','REAL_LOCAL_CIRCUIT_CLEAR'].includes(
   final.b186RealOriginalHumanCircuit?.status);
 if(!reachedNamedOriginalRaised){
  fail('ACTUAL_REGISTERED_UPHILL_RAMP_OR_RAISED_FOOT_HOLD',
   collect('TRUE_UPHILL_SOURCE_HOLD',final));
 }
 // Only now is genuine human shooting actually armed; paints must
 // physically hit original Paintable surfaces and CHANGE source cells.
 // No paint requests, ammo, regeneration, pose, or tick fabricated by QA.
 evidence.humanNativeShotStartTick=final.tick;
 await mouse('mousePressed');
 try{
  const fireStartTick=final.tick;
  final=await until(async()=>{
   const s=await snapshot('REAL_RAISED_ORIGINAL_HUMAN_FIRE');
   if(s.matchState==='TIME_UP')
    fail('REAL_MATCH_TIME_UP_DURING_RAISED_SHOOTING',
     {tick:s.tick,circuit:s.b186RealOriginalHumanCircuit});
   return s.b186RealOriginalHumanCircuit?.sourceLocalPlayClear||
    s.tick>=fireStartTick+120?s:false;
  },150000,170);
  collect('TRUE_RAISED_FLOOR_REAL_HUMAN_FIRE',final);
 }finally{await mouse('mouseReleased');}
 const last=await snapshot('END_SOURCE_LOCAL_CIRCUIT');
 const dom=await evaluate(`(()=>{
  const el=document.querySelector('#t21-f3-b183-real-first-drop');
  return el?{
   visible:!el.hidden,state:el.dataset.b186NativeStatus,
   nativeDrop:el.dataset.nativeState,
   trueNativeTick:Number(el.dataset.trueNativeTick),
   physicallyVerifiedCircuit:el.dataset.b186RealLocalPracticeClear,
   changedHumanImpactCells:Number(el.dataset.b186RealImpactChangedCells),
   text:el.textContent
  }:null;
 })()`);
 const c=last.b186RealOriginalHumanCircuit;
 const accepted=c?.sourceLocalPlayClear===true&&
  c.status==='REAL_LOCAL_CIRCUIT_CLEAR'&&
  c.actualOriginalRampColliderId===
   'UndertowT21D:right-low-route-ramp-positive-z'&&
  c.actualOriginalRaisedFootColliderId==='UndertowT21D:right-low-team-a'&&
  c.genuineGroundedTravelMeters>=2&&
  c.realPostDropHumanImpactChangedCells>=60&&
  c.naturalCrossTeamRouteProven===false&&
  c.sourceScoreablePromotions===0&&
  dom?.visible===true&&
  dom.state==='REAL_LOCAL_CIRCUIT_CLEAR'&&
  dom.physicallyVerifiedCircuit==='true'&&
  dom.changedHumanImpactCells>=60&&
  last.b183OriginalHumanDescent?.originalFirstDropLocalPracticeClear===true;
 evidence.finalNativeTick=last.tick;
 evidence.finalRealHumanBody=last.player?.position;
 evidence.finalFirstDrop=last.b183OriginalHumanDescent;
 evidence.finalSourceLocalCircuit=c;
 evidence.realRenderedDom=dom;
 evidence.nativeClear=accepted;
 writeFileSync(resolve(output,'b187-real-native-circuit.json'),
  JSON.stringify(evidence,null,2)+'\n');
 const frame=await cmd('Page.captureScreenshot',{format:'png'});
 if(frame.data)writeFileSync(resolve(output,'b187-real-native-circuit.png'),
  Buffer.from(frame.data,'base64'));
 console.log('T21_B187_REAL_NATIVE_FULL_ORIGINAL_LOCAL_CIRCUIT',
  JSON.stringify({
   accepted,firstDrop:landing.b183OriginalHumanDescent?.status,
   nativeTicks:last.tick-playing.tick,
   ramp:c?.actualOriginalRampTouched,
   raised:c?.actualOriginalRaisedFootColliderId,
   realGroundTravel:c?.genuineGroundedTravelMeters,
   actualHumanImpactChangedCells:c?.realPostDropHumanImpactChangedCells,
   domStatus:dom?.state,official4v4:false
  }));
 if(!accepted)fail('REAL_SOURCE_LOCAL_CIRCUIT_HOLD',{
  originalDrop:last.b183OriginalHumanDescent,
  circuit:c,dom
 });
}
try{await run();}catch(e){
 console.error(e.stack??e);process.exitCode=1;
 // Even a HOLD must preserve the real, partial original-source input,
 // source collider and native KCC observations for subsequent root-cause QA.
 if(latestEvidence){
  latestEvidence.nativeClear=false;
  latestEvidence.failure=String(e.message??e);
  try{
   if(socket?.readyState===WebSocket.OPEN){
    const last=await evaluate('window.__t21F3.snapshot()');
    latestEvidence.lastTrueNativeTick=last?.tick??null;
    latestEvidence.lastTrueHumanBody=last?.player?.position??null;
    latestEvidence.lastActualOriginalSupport=
     last?.b112OriginalHumanGround?.lastOriginalSourceHitId??null;
    latestEvidence.lastB183=last?.b183OriginalHumanDescent??null;
    latestEvidence.lastB186=last?.b186RealOriginalHumanCircuit??null;
    const frame=await cmd('Page.captureScreenshot',{format:'png'});
    if(frame.data)writeFileSync(resolve(output,'b187-real-native-circuit-HOLD.png'),
     Buffer.from(frame.data,'base64'));
   }
  }catch(saveError){
   latestEvidence.snapshotSaveError=String(saveError.message??saveError);
  }
  writeFileSync(resolve(output,'b187-real-native-circuit-HOLD.json'),
   JSON.stringify(latestEvidence,null,2)+'\n');
 }
}finally{
 socket?.close();
 for(const child of children)if(child.exitCode===null)child.kill('SIGTERM');
}
