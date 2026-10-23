#!/usr/bin/env node
/**
 * W10-B112: one REAL Chromium/PlayCanvas/WebGL2 + original Rapier KCC
 * human walking witness. Never uses qaDriveTicks, setPosition or fake floors.
 * A limited upper-stage path is NOT certification of the complete map.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {auditB124RealNativeEventBoundedKeyboardPhases}
 from './t21-w10b124-native-event-bounded-keys.mjs';
import {B127_STAGES,B127_LATE_NAMES,auditB127}
 from './t21-w10b127-original-corridor-plan.mjs';
import {auditB132RealBrowserEdgeWitness}
 from './t21-w10b132-real-original-edge-hud-audit.mjs';

const root='http://127.0.0.1:4197/browser-ink-tps/';
const output=process.env.T21_B112_EVIDENCE_DIR??'/tmp/t21-b112';
// B116: this is an independently opted-in *real* prolonged KeyW run;
// the B112-B115 proven 120-tick baseline remains byte-for-byte equivalent.
const requestedNativeTicks=Number(process.env.T21_B116_FORWARD_NATIVE_TICKS??120);
if(!Number.isSafeInteger(requestedNativeTicks)||
   !(requestedNativeTicks===120||
     (requestedNativeTicks>=240&&requestedNativeTicks<=720)))
 throw Error('B116_INVALID_TRUE_FORWARD_TICK_REQUEST');
const b116Extended=requestedNativeTicks>120;
const b121OriginalSteer=process.env.T21_B121_REAL_LANDING_STEER==='source';
const b122OriginalSteer=process.env.T21_B122_REAL_LANDING_STEER==='source';
const b123OriginalRamp=process.env.T21_B123_REAL_RAMP_ASCENT==='source';
// B132: use an existing legitimate Y3-to-Y4.5 real-key route for a
// read-only live DOM warning witness, no altered stage inputs or KCC.
const b132RealEdgeHud=process.env.T21_B132_REAL_EDGE_HUD==='source';
const b124RaisedContinue=process.env.T21_B124_RAISED_ORIGINAL_CONTINUE==='source';
if(b132RealEdgeHud&&(!b123OriginalRamp||requestedNativeTicks!==320))
 throw Error('B132_ONLY_REAL_320_TICK_ORIGINAL_RAMP_PROGRAM');
const b125RaisedCorridor=process.env.T21_B125_ORIGINAL_RAISED_CORRIDOR==='source';
const b126OriginalSteering=process.env.T21_B126_ORIGINAL_RAISED_STEER==='source';
const b127OriginalRoute=process.env.T21_B127_ORIGINAL_NEXT_ROUTE==='source';
if(b121OriginalSteer&&(requestedNativeTicks!==280||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'||b122OriginalSteer))
 throw Error('B121_NATIVE_280_TICK_STEER_REQUIRES_EXCLUSIVE_SOURCE_TRIAL');
if(b122OriginalSteer&&(requestedNativeTicks!==266||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'||b123OriginalRamp))
 throw Error('B122_NATIVE_266_TICK_STEER_REQUIRES_EXCLUSIVE_SOURCE_TRIAL');
if(b123OriginalRamp&&(requestedNativeTicks!==320||
   b121OriginalSteer||b122OriginalSteer||b124RaisedContinue||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'))
 throw Error('B123_ORIGINAL_RAMP_REQUIRES_EXCLUSIVE_NATIVE_320_TICK_TRIAL');
if(b124RaisedContinue&&(requestedNativeTicks!==368||
   b121OriginalSteer||b122OriginalSteer||b123OriginalRamp||
   b125RaisedCorridor||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'))
 throw Error('B124_RAISED_SOURCE_REQUIRES_368_GENUINE_KEYBOARD_TICKS');
if(b125RaisedCorridor&&(requestedNativeTicks!==440||
   b121OriginalSteer||b122OriginalSteer||b123OriginalRamp||
   b124RaisedContinue||b126OriginalSteering||b127OriginalRoute||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'))
 throw Error('B125_RAISED_CORRIDOR_REQUIRES_EXCLUSIVE_440_NATIVE_TICK_BUDGET');
if(b126OriginalSteering&&(requestedNativeTicks!==464||
   b121OriginalSteer||b122OriginalSteer||b123OriginalRamp||
   b124RaisedContinue||b125RaisedCorridor||b127OriginalRoute||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'))
 throw Error('B126_RAISED_STEERING_REQUIRES_EXCLUSIVE_464_NATIVE_TICK_BUDGET');
if(b127OriginalRoute&&(requestedNativeTicks!==488||
   b121OriginalSteer||b122OriginalSteer||b123OriginalRamp||
   b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering||
   process.env.T21_B120_TOUCHDOWN_ONLY==='source'))
 throw Error('B127_SOURCE_NEXT_ROUTE_REQUIRES_EXCLUSIVE_488_TICK_BUDGET');
const b120TouchdownOnly=process.env.T21_B120_TOUCHDOWN_ONLY==='source';
if(b120TouchdownOnly&&requestedNativeTicks!==240)
 throw Error('B120_ORIGINAL_TOUCHDOWN_REQUIRES_240_GENUINE_TICKS');
const b126TrialKeys=new Set(['RAISED_SOURCE_B126_REAL_KEYA_LEFT_12',
 'RAISED_SOURCE_B126_REAL_KEYW_FORWARD_12']);
function b126NativeUnsafe(n){
 const w=n.b124OriginalRaisedRightLowFootprint;
 return !!n.stopReason||
  n.b112OriginalHumanGround?.genuineKccGrounded!==true||
  n.b112OriginalHumanGround?.lastOriginalSourceHitId!==
   'UndertowT21D:right-low-team-a'||
  w?.realFootXZInsideOriginalSlab!==true||
  w.originalRaisedSourceVerticalBandWithin22cm!==true||
  !Number.isFinite(w.distanceToOriginalSourcePolygonBoundaryMeters)||
  w.distanceToOriginalSourcePolygonBoundaryMeters<.60;
}
const children=[];
let sock,id=0;
const pending=new Map();
const fail=(name,extra)=>{throw Error('T21_B112_'+name+
 (extra===undefined?'':'_'+JSON.stringify(extra)));};
async function until(fn,ms=120000,poll=150){
 const limit=Date.now()+ms;
 while(Date.now()<limit){
  const v=await fn();if(v)return v;await sleep(poll);
 }
 fail('TIMEOUT',{ms});
}
async function cmd(method,params={}){
 if(sock?.readyState!==WebSocket.OPEN)fail('CDP_DISCONNECTED');
 const seq=++id;
 return await new Promise((yes,no)=>{
  const timer=setTimeout(()=>{pending.delete(seq);no(Error('T21_B112_CDP_TIMEOUT_'+method));},25000);
  pending.set(seq,{
   yes:value=>{clearTimeout(timer);yes(value);},
   no:err=>{clearTimeout(timer);no(err);}
  });
  sock.send(JSON.stringify({id:seq,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION',r.exceptionDetails);
 return r.result?.value;
}
const key={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
const click=type=>cmd('Input.dispatchMouseEvent',
 {type,x:800,y:450,button:'left',clickCount:1});
function verify(n){
 if((!b116Extended&&n.stopReason)||n.originalSourceSolids!==25||
    n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
    n.unrestricted4v4Certified!==false||n.cpu.physicalFootRelocations!==0)
  fail('SOURCE_AUTHORITY_DRIFT',{tick:n.tick,reason:n.stopReason});
 if(n.b112OriginalHumanGround?.enabled!==true||
    n.b112OriginalHumanGround?.sourceFloorHoleCertified!==false||
    n.b112OriginalHumanGround?.originalStageGeometryModified!==false||
    n.b112OriginalHumanGround?.noActorPositionMutation!==true)
  fail('B112_READ_ONLY_LEDGER_AUTHORITY_MISSING');
 return n;
}
async function run(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_NOT_INSTALLED');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000,250);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9281','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b112-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9281/json')).json())
   .find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  }catch{return null;}
 },60000,250);
 sock=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([new Promise((yes,no)=>{
  sock.addEventListener('open',yes,{once:true});
  sock.addEventListener('error',no,{once:true});
 }),sleep(12000).then(()=>{throw Error('T21_B112_WEBSOCKET_TIMEOUT');})]);
 sock.addEventListener('message',ev=>{
  const data=JSON.parse(String(ev.data)),p=pending.get(data.id);
  if(!p)return;pending.delete(data.id);
  if(data.error)p.no(Error(JSON.stringify(data.error)));
  else p.yes(data.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 // Local download only after genuine CDP click, not automatic.
 await cmd('Page.setDownloadBehavior',{behavior:'allow',downloadPath:output});
 await cmd('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:root+'?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'});
 await until(async()=>await evaluate(`(()=>{
  const c=document.querySelector('#app-canvas');
  return c?.dataset.t21F3Ready==='READY'&&c?.dataset.t21F3Renderer==='webgl2';
 })()`),100000,450);
 const snapshot=async()=>verify(await evaluate('window.__t21F3.snapshot()'));
 const initial=await snapshot();
 if(initial.matchState!=='STAGING')fail('BAD_NATIVE_START');
 await click('mousePressed');await click('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),20000,150);
 const first=await snapshot();
 const targetTick=first.tick+requestedNativeTicks;
 const samples=[];
 const b121ActualPhases=[];
 const b125GenuinePolls=[];
 const b132UiWitnesses=[];
 // Single-page CDP read. This is a rendered HUD snapshot after actual
 // native KCC/Crowd ticks and real keyboard input, not an injected pose.
 const b132PageProbe=()=>evaluate(`(() => {
  const s=window.__t21F3.snapshot();
  const w=s.b129OriginalRaisedEdgeGuidance;
  const el=document.querySelector('#t21-f3-b129-original-edge-coach');
  return {
   actualNativeTick:s.tick,matchState:s.matchState,
   sourceAuthority:[s.originalSourceSolids,s.originalPaintSurfaces,
    s.originalSourceNavigationLinks,s.sourceScoreablePromotions],
   originalUnrestricted4v4:s.unrestricted4v4Certified,
   production:s.productionAuthorized,stop:s.stopReason,
   actualKccGrounded:s.b112OriginalHumanGround.genuineKccGrounded,
   actualOriginalRapierSolid:s.b112OriginalHumanGround.lastOriginalSourceHitId,
   snapshotWarning:w?{
    severity:w.severity,showCaution:w.showCaution,
    distance:w.originalRaisedFloorEdgeMeters,
    source:w.authenticNamedOriginalSupport,nativeTick:w.nativeTick,
    playerPhysicsModified:w.playerPhysicsModified,
    originalGeometryModified:w.originalGeometryModified}:null,
   dom:el?{
    visible:!el.hidden&&el.style.display!=='none'&&
     el.getBoundingClientRect().width>0,
    severity:el.dataset.state,nativeTick:Number(el.dataset.nativeTick),
    distance:Number(el.dataset.sourceEdgeMeters),
    text:el.textContent,officialScoreable:el.dataset.originalScoreable,
    original4v4:el.dataset.original4v4Certified,
    floorHole:el.dataset.originalFloorHoleCertified}:null
  };
 })()`);
 let later;
 const collectNativeFoot=(n,label)=>{
  if((b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)&&(
    !b125GenuinePolls.length||n.tick>b125GenuinePolls.at(-1).tick))
   b125GenuinePolls.push({tick:n.tick,
    actualHumanBody:n.player.position,
    originalFloorId:n.b112OriginalHumanGround.lastOriginalSourceHitId,
    nativeKccGrounded:n.b112OriginalHumanGround.genuineKccGrounded,
    registeredRaisedSource:n.b124OriginalRaisedRightLowFootprint,
    nativeStopReason:n.stopReason});
  if(samples.length===0||n.tick-samples.at(-1).tick>=12||label){
   samples.push({tick:n.tick,body:n.player.position,
    grounded:n.b112OriginalHumanGround.genuineKccGrounded,
    originalSupport:n.b112OriginalHumanGround.lastOriginalSourceHitId,
    sourceFootprintClass:n.b112OriginalHumanGround.lastOriginalFootprint?.classification??null,
    sourceFootprintIds:n.b112OriginalHumanGround.lastOriginalFootprint?.observedSourceSolidIds??[],
    suspectedDescents:n.b112OriginalHumanGround.suspicionCount,
    b120OriginalSourceBoundary:n.b120OriginalSourceBoundary,
    b124OriginalRaisedSourceBoundary:n.b124OriginalRaisedRightLowFootprint,
    b121Phase:label??null});
  }
 };
 if(b121OriginalSteer||b122OriginalSteer||b123OriginalRamp||
    b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute){
  const keys={
   KeyW:{key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87},
   KeyA:{key:'a',code:'KeyA',windowsVirtualKeyCode:65,nativeVirtualKeyCode:65},
   KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68}
  };
  const program=b127OriginalRoute?B127_STAGES:(b123OriginalRamp||b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering)?[
   {name:'FIRST_DROP_GENUINE_FORWARD',keys:['KeyW'],ticks:200},
   {name:'LOWER_LANDING_REAL_KEYD_LATERAL',keys:['KeyD'],ticks:12},
   {name:'LOWER_LANDING_FORWARD',keys:['KeyW'],ticks:18},
   {name:'REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP',keys:['KeyD'],ticks:90},
   ...((b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering)?[
    {name:'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_1',keys:['KeyW'],ticks:24},
    {name:'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_2',keys:['KeyW'],ticks:24}
   ]:[]),
   ...((b125RaisedCorridor||b126OriginalSteering)?[
    {name:'RAISED_SOURCE_CORRIDOR_KEYW_3',keys:['KeyW'],ticks:24},
    {name:'RAISED_SOURCE_CORRIDOR_KEYW_4',keys:['KeyW'],ticks:24},
    {name:'RAISED_SOURCE_CORRIDOR_KEYW_5',keys:['KeyW'],ticks:24}
   ]:[]),
   ...(b126OriginalSteering?[
    {name:'RAISED_SOURCE_B126_REAL_KEYA_LEFT_12',keys:['KeyA'],ticks:12},
    {name:'RAISED_SOURCE_B126_REAL_KEYW_FORWARD_12',keys:['KeyW'],ticks:12}
   ]:[])
  ]:[
   {name:'FIRST_DROP_GENUINE_FORWARD',keys:['KeyW'],ticks:200},
   {name:'LOWER_LANDING_REAL_KEYD_LATERAL',keys:['KeyD'],ticks:12},
   {name:'LOWER_LANDING_FORWARD',keys:['KeyW'],ticks:b122OriginalSteer?18:16},
   {name:'LOWER_LANDING_REAL_KEYA_CORRECTION',keys:['KeyA'],ticks:b122OriginalSteer?16:24},
   {name:'LOWER_LANDING_REAL_FORWARD_AFTER_STEER',keys:['KeyW'],ticks:b122OriginalSteer?20:28}
  ];
  let held=new Set(),native=first;
  try{
   for(const stage of program){
    for(const k of held)if(!stage.keys.includes(k))
     await cmd('Input.dispatchKeyEvent',{type:'keyUp',...keys[k]});
    for(const k of stage.keys)if(!held.has(k))
     await cmd('Input.dispatchKeyEvent',{type:'keyDown',...keys[k]});
    held=new Set(stage.keys);
    const before=native;
    native=await until(async()=>{
     const n=await snapshot();
     collectNativeFoot(n,null);
     const genuinelyReachedOriginalRightLow=
      (b123OriginalRamp||b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)&&
      stage.name==='REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP'&&
      n.b112OriginalHumanGround.genuineKccGrounded===true&&
      n.b112OriginalHumanGround.lastOriginalSourceHitId===
       'UndertowT21D:right-low-team-a';
     return n.tick>=before.tick+stage.ticks||n.stopReason||
      ((b126OriginalSteering&&b126TrialKeys.has(stage.name)||
        b127OriginalRoute&&B127_LATE_NAMES.has(stage.name))&&
       b126NativeUnsafe(n))||
      genuinelyReachedOriginalRightLow?n:false;
    },120000,110);
    collectNativeFoot(native,stage.name);
    if(b132RealEdgeHud){
     const live=await b132PageProbe();
     b132UiWitnesses.push({stage:stage.name,...live});
    }
    b121ActualPhases.push({
     label:stage.name,actualCDPKeyboardKeys:stage.keys,
     genuineStartTick:before.tick,genuineEndTick:native.tick,
     observedOriginalHumanStartingBody:before.player.position,
     observedOriginalHumanEndingBody:native.player.position,
     observedSourceSolid:native.b112OriginalHumanGround.lastOriginalSourceHitId,
     trueKccGrounded:native.b112OriginalHumanGround.genuineKccGrounded,
     actualRegisteredFloor:native.b120OriginalSourceBoundary,
     actualRaisedSourceBoundary:native.b124OriginalRaisedRightLowFootprint,
     stopReason:native.stopReason
    });
    if(native.stopReason||
      ((b126OriginalSteering&&b126TrialKeys.has(stage.name)||
        b127OriginalRoute&&B127_LATE_NAMES.has(stage.name))&&
       b126NativeUnsafe(native)))break;
   }
   later=native;
  }finally{
   for(const k of held)
    await cmd('Input.dispatchKeyEvent',{type:'keyUp',...keys[k]});
  }
 }else{
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
  try{
   later=await until(async()=>{
    const n=await snapshot();
    collectNativeFoot(n,null);
    return n.tick>=targetTick||(b116Extended&&n.stopReason)?n:false;
   },180000,150);
  }finally{
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
  }
 }
 const end=await snapshot();
 if(b132RealEdgeHud){
  b132UiWitnesses.push({stage:'RELEASED_NATIVE_END',...await b132PageProbe()});
  const validation=auditB132RealBrowserEdgeWitness(b132UiWitnesses);
  writeFileSync(resolve(output,'b132-native-original-edge-hud.json'),
   JSON.stringify({schema:'W10_B132_REAL_NATIVE_EDGE_HUD_PROOF_V1',
    originalSourceInput:'REAL_CDP_KEYS_W200_D12_W18_D_UP_TO_SOURCE_RAMP',
    actualBrowserSamples:b132UiWitnesses,validation,
    genuineActorTeleports:0,fabricatedTicks:0,
    officialTurfOrCrossTeamCertified:false},null,2)+'\n');
  console.log('T21_B132_NATIVE_REAL_ORIGINAL_EDGE_HUD',
   JSON.stringify({passed:validation.passed,
    visibleSources:validation.visibleOriginalSupportIds,
    samples:b132UiWitnesses.length,
    nativeLastTick:end.tick,physicsChanged:false,
    official4v4Certified:false}));
  if(!validation.passed)
   fail('B132_REAL_NATIVE_IN_GAME_ORIGINAL_EDGE_HUD_HOLD',validation);
 }
 const footprint=end.b112OriginalHumanGround.lastOriginalFootprint;
 if(!footprint||footprint.nativeTick>end.tick||
    footprint.probes?.length!==5||
    footprint.originalFloorHoleCertified!==false||
    footprint.noActorMutation!==true||
    footprint.genuineCapsuleContactCertified!==false||
    footprint.originalGeometryAdded!==0||
    footprint.probes?.[0]?.name!=='CENTER')
  fail('B114_ACTUAL_RAPIER_FOOTPRINT_NOT_VERIFIED');
 const moved=Math.hypot(
  end.player.position[0]-first.player.position[0],
  end.player.position[2]-first.player.position[2]
 );
 if(moved<.5)fail('GENUINE_PLAYER_DID_NOT_WALK',{moved,from:first.player.position,to:end.player.position});
 const frame=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true
 })).data||'','base64');
 if(frame.length<10000)fail('REAL_SCREENSHOT_EMPTY');
 const evidence={
  schema:'W10_B112_GENUINE_HUMAN_GROUND_SUPPORT_WALK_V1',
  environment:'HEADLESS_CHROME_SOFTWARE_WEBGL2_NOT_OWNER_GPU',
  actualRealChromeWKey:true,sourcePhysicsAuthority:[25,17,26,0],
  firstNativeTick:first.tick,lastNativeTick:end.tick,
  actualNativeHumanStartingBody:first.player.position,
  actualNativeHumanEndingBody:end.player.position,
  actualHorizontalDisplacementMeters:moved,
  samples,actualNativeGroundSupport:end.b112OriginalHumanGround,
  observedSourceFallSuspicionCount:end.b112OriginalHumanGround.suspicionCount,
  actualOriginalFootprintB114:footprint,
  observedMapCoverage:b116Extended?
   'REAL_EXTENDED_FORWARD_SOURCE_ROUTE_ONLY_NOT_FULL_MAP':
   'LIMITED_UPPER_SOURCE_WALK_ONLY',
  anySuspectedFloorHoleProven:false,
  originalSourceGeometryChanged:false,scoreablePromotion:0,
  originalCrossTeamPathsCertified:false,formal4v4Certified:false,
  screenshot:{filename:'b112-real-source-human-walk.png',
   bytes:frame.length,sha256:createHash('sha256').update(frame).digest('hex')}
 };
 writeFileSync(resolve(output,evidence.screenshot.filename),frame);
 writeFileSync(resolve(output,'b112-real-source-foot-walk.json'),JSON.stringify(evidence,null,2));
 if(b116Extended){
  // A genuine early collision/stop is an outcome to preserve, not a pretext
  // for teleporting the player, generating geometry or faking native time.
  if(samples.at(-1)?.tick!==end.tick)
   samples.push({tick:end.tick,body:end.player.position,
    grounded:end.b112OriginalHumanGround.genuineKccGrounded,
    originalSupport:end.b112OriginalHumanGround.lastOriginalSourceHitId,
    sourceFootprintClass:end.b112OriginalHumanGround.lastOriginalFootprint?.classification??null,
    sourceFootprintIds:end.b112OriginalHumanGround.lastOriginalFootprint?.observedSourceSolidIds??[],
    suspectedDescents:end.b112OriginalHumanGround.suspicionCount,
    b120OriginalSourceBoundary:end.b120OriginalSourceBoundary,
   b124OriginalRaisedSourceBoundary:end.b124OriginalRaisedRightLowFootprint});
  const furthestZ=Math.min(...samples.map(p=>p.body[2]));
  const earliestZ=first.player.position[2];
  const forwardProgressMeters=earliestZ-furthestZ;
  const supports=[...new Set(samples.flatMap(p=>[
   ...(p.originalSupport?[p.originalSupport]:[]),...p.sourceFootprintIds
  ]))];
  const sourceTransitions=samples.filter((p,i)=>
   i===0||p.originalSupport!==samples[i-1].originalSupport)
   .map(p=>({tick:p.tick,body:p.body,
    actualOriginalSolidId:p.originalSupport,
    actualFiveRayIds:p.sourceFootprintIds,
    genuineKccGrounded:p.grounded}));
  const reachedTarget=end.tick>=targetTick&&!end.stopReason;
  const actualSuspicionCount=end.b112OriginalHumanGround.suspicionCount;
  const genuineEndpointSourceSupported=
   end.b112OriginalHumanGround.genuineKccGrounded===true&&
   (footprint.nearCenter===true||footprint.nearPerimeter===true);
  const b124NativeRealPhaseAudit=(b124RaisedContinue||b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)?
   auditB124RealNativeEventBoundedKeyboardPhases(
    (b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)?b121ActualPhases.slice(0,6):b121ActualPhases,
    first.tick,(b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)?
     b121ActualPhases[5]?.genuineEndTick:end.tick):null;
  const nativeOutcome=end.stopReason?'NATIVE_STOP_BEFORE_TARGET':
   b124NativeRealPhaseAudit?.completed===true?
    'B124_REAL_EVENT_BOUNDED_NATIVE_PHASES_COMPLETED':
   !reachedTarget?'NATIVE_TICK_TARGET_NOT_REACHED':
   forwardProgressMeters<20?'LIMITED_FORWARD_PROGRESS':
   actualSuspicionCount>0?'SUSPECTED_UNSUPPORTED_NATIVE_DESCENT':
   !genuineEndpointSourceSupported?'TRUE_KCC_ENDPOINT_SOURCE_UNSUPPORTED':
   'REAL_SUPPORTED_FORWARD_TRAVERSE_GT_20M';
  const realCrowdDriftWitness=end.humanCrowd?.b118LastRealCrowdDriftWitness??null;
  const report={
   schema:'W10_B116_GENUINE_FORWARD_SOURCE_SUPPORT_TRANSITIONS_V1',
   environment:'REAL_CHROMIUM_HEADLESS_SWIFTSHADER_NOT_OWNER_GPU',
   trueCDPHeldKeyW:true,requestedNativeTicks,
   firstNativeTick:first.tick,lastNativeTick:end.tick,
   nativeOutcome,stopReason:end.stopReason,
   initialOriginalHumanBody:first.player.position,
   finalOriginalHumanBody:end.player.position,
   actualForwardProgressMeters:forwardProgressMeters,
   genuineOriginalSourceCollidersSeen:supports,
   genuineSourceTransitions:sourceTransitions,
   actualOriginalSourceSamples:samples,
   b121RealKeyboardSteeringPhases:b121ActualPhases,
   b123RealSourceRampGenuineKeyboardPhases:
    b123OriginalRamp?b121ActualPhases:null,
   b124RealRaisedOriginalContinuationPhases:
    b124RaisedContinue?b121ActualPhases:null,
   b124TrueNativeEventBoundedKeyboardPhaseAudit:b124NativeRealPhaseAudit,
   b125ActualNineNativeKeyboardPhases:
    (b125RaisedCorridor||b126OriginalSteering)?b121ActualPhases:null,
   b126ActualNativeKeyboardPhases:b126OriginalSteering?b121ActualPhases:null,
   b127OriginalNativeKeyboardPhases:b127OriginalRoute?b121ActualPhases:null,
   b125AllPolledActualNativeHumanSource:
    (b125RaisedCorridor||b126OriginalSteering||b127OriginalRoute)?b125GenuinePolls:null,
   b124RealRaisedSourceBoundary:end.b124OriginalRaisedRightLowFootprint,
   b123OriginalRampPassiveAgentWithheldNativeTicks:
    end.humanCrowd?.b123OriginalRampPassiveProxyWithheldNativeTicks??0,
   b123LastOriginalRampPassiveProxySourceGuard:
    end.humanCrowd?.b123LastOriginalUphillPassiveAgentGate??null,
   b120LastOriginalSourceBoundary:end.b120OriginalSourceBoundary,
   b120ActualRegisteredSourceBoundarySamples:
    samples.filter(s=>s.b120OriginalSourceBoundary?.schema===
     'W10_B120_REAL_ORIGINAL_FIRST_DROP_POLYGON_WITNESS_V1')
     .map(s=>({tick:s.tick,actualBody:s.body,
      nativeOriginalSupport:s.originalSupport,
      nativeKccGrounded:s.grounded,
      witness:s.b120OriginalSourceBoundary})),
   b118RealOriginalPassiveCrowdPrePostWitness:realCrowdDriftWitness,
   b119LastOriginalFirstDropProxyGate:
    end.humanCrowd?.b119OriginalFirstDropPassiveProxyGate??null,
   b119OriginalFirstDropProxyWithheldNativeTicks:
    end.humanCrowd?.b119FirstDropProxyWithheldNativeTicks??0,
   b119HumanCpuCrowdAvoidanceCertifiedAtLanding:false,
   genuineKccAndOriginalRapierSupportedAtEnd:genuineEndpointSourceSupported,
   actualUnsupportedDescentSuspicionCount:actualSuspicionCount,
   lastMeasuredFiveOriginalRapierRays:footprint,
   authenticUnsupportedDescentSuspicions:end.b112OriginalHumanGround.suspicions,
   originalSourceAuthority:[25,17,26,0],
   originalColliderCreatedByQA:0,
   actorTeleportsByQA:0,
   userReportedHomeAndCentralHolesProven:false,
   centralPathReachCertified:false,
   crossTeamRouteCertified:false,
   formal4v4Certified:false,
   sourceFloorHoleCertified:false
  };
  writeFileSync(resolve(output,'b116-real-forward-original-support-traverse.json'),
   JSON.stringify(report,null,2)+'\n');
  console.log('T21_B116_REAL_CHROME_EXTENDED_FORWARD_SUPPORT_WITNESS',
   JSON.stringify({nativeOutcome,firstTick:first.tick,endTick:end.tick,
    realForwardProgressMeters:forwardProgressMeters,
    actualOriginalSolids:supports,sourceTransitions:sourceTransitions.length,
    b123ActualOriginalRampProxyWithheldNativeTicks:
     end.humanCrowd?.b123OriginalRampPassiveProxyWithheldNativeTicks??0,
    actualSuspicionCount,actuallySourceSupportedAtEnd:genuineEndpointSourceSupported,
    nativeStopReason:end.stopReason,
    b118RealRecastCrowdDriftMeters:realCrowdDriftWitness?.
     postCrowdVsPhysicalHorizontalMeters??null,
    b118ActualNativeProxyMovedMeters:realCrowdDriftWitness?.
     recastIntraTickPassiveProxyDisplacementHorizontalMeters??null,
    b119FirstDropHumanProxyWithheldNativeTicks:
     end.humanCrowd?.b119FirstDropProxyWithheldNativeTicks??0,
    b119ExactOriginalFirstDropGate:
     end.humanCrowd?.b119OriginalFirstDropPassiveProxyGate?.status??null,
    originalAuthority:[25,17,26,0],
    b124ActualOriginalRaisedFootprintInside:
     end.b124OriginalRaisedRightLowFootprint?.realFootXZInsideOriginalSlab??null,
    sourceFloorHoleCertified:false,centralPathCertified:false,
    formal4v4Certified:false}));
  // B127: bounded two more real KeyW phases after genuine B126 steering.
  if(b127OriginalRoute){
   const result=auditB127({
    phases:b121ActualPhases,polls:b125GenuinePolls,
    b124:b124NativeRealPhaseAudit,stop:end.stopReason,
    suspicions:actualSuspicionCount,body:end.player.position,
    sourceId:end.b112OriginalHumanGround.lastOriginalSourceHitId,
    grounded:end.b112OriginalHumanGround.genuineKccGrounded,
    boundary:end.b124OriginalRaisedRightLowFootprint
   });
   writeFileSync(resolve(output,'b127-real-source-narrow-continuation.json'),
    JSON.stringify(result,null,2)+'\n');
   console.log('T21_B127_REAL_SOURCE_NARROW_CORRIDOR',JSON.stringify({
    nativeTick:end.tick,phases:b121ActualPhases.length,
    physicalForwardMeters:result.actualNewForwardZMeters,
    actualXZDisplacement:result.actualNewXZDisplacementMeters,
    minimumActualSourceEdge:result.minimumNewOriginalEdgeMeters,
    finalRealBody:end.player.position,
    passed:result.supportedSameFloorCorridorContinuation,
    distinctSourceOr4v4Certified:false}));
   if(!result.supportedSameFloorCorridorContinuation)
    fail('B127_ORIGINAL_SOURCE_NARROW_CORRIDOR_HOLD',{
     tick:end.tick,reason:end.stopReason,
     phases:b121ActualPhases.length,result});
   return;
  }
  // B126: true CDP left correction and small W continuation from B125.
  // This certifies at most a same-floor turn; NOT a distinct floor or 4v4.
  if(b126OriginalSteering){
   const raised='UndertowT21D:right-low-team-a';
   const phases=b121ActualPhases;
   const baselineNames=['RAISED_SOURCE_CORRIDOR_KEYW_3',
    'RAISED_SOURCE_CORRIDOR_KEYW_4','RAISED_SOURCE_CORRIDOR_KEYW_5'];
   const b125Replay=phases.length===11&&
    b124NativeRealPhaseAudit?.completed===true&&
    phases.slice(6,9).every((p,i)=>
     p.label===baselineNames[i]&&
     p.actualCDPKeyboardKeys?.length===1&&
     p.actualCDPKeyboardKeys[0]==='KeyW'&&
     p.genuineStartTick===phases[i+5]?.genuineEndTick&&
     p.genuineEndTick-p.genuineStartTick>=24&&
     p.observedSourceSolid===raised&&p.trueKccGrounded===true&&
     p.actualRaisedSourceBoundary?.realFootXZInsideOriginalSlab===true&&
     p.actualRaisedSourceBoundary?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.actualRaisedSourceBoundary?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.65);
   const replayEnd=phases[8];
   const baselinePolls=b125GenuinePolls.filter(p=>
    replayEnd&&phases[5]&&p.tick>phases[5].genuineEndTick&&
    p.tick<=replayEnd.genuineEndTick);
   const b125PollsSupported=baselinePolls.length>=5&&
    baselinePolls.every(p=>p.originalFloorId===raised&&
     p.nativeKccGrounded===true&&!p.nativeStopReason&&
     p.registeredRaisedSource?.realFootXZInsideOriginalSlab===true&&
     p.registeredRaisedSource?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.registeredRaisedSource?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.60);
   const turn=phases[9],forward=phases[10];
   const actualNewPolls=b125GenuinePolls.filter(p=>replayEnd&&
    p.tick>replayEnd.genuineEndTick);
   const supported=(p,minimum)=>
    p?.observedSourceSolid===raised&&p.trueKccGrounded===true&&
    p.actualRaisedSourceBoundary?.realFootXZInsideOriginalSlab===true&&
    p.actualRaisedSourceBoundary?.
     originalRaisedSourceVerticalBandWithin22cm===true&&
    p.actualRaisedSourceBoundary?.
     distanceToOriginalSourcePolygonBoundaryMeters>=minimum;
   const steeringActual=turn?.label==='RAISED_SOURCE_B126_REAL_KEYA_LEFT_12'&&
    turn.actualCDPKeyboardKeys?.length===1&&
    turn.actualCDPKeyboardKeys[0]==='KeyA'&&
    turn.genuineStartTick===replayEnd?.genuineEndTick&&
    turn.genuineEndTick-turn.genuineStartTick>=12&&
    supported(turn,.65);
   const forwardActual=forward?.label==='RAISED_SOURCE_B126_REAL_KEYW_FORWARD_12'&&
    forward.actualCDPKeyboardKeys?.length===1&&
    forward.actualCDPKeyboardKeys[0]==='KeyW'&&
    forward.genuineStartTick===turn?.genuineEndTick&&
    forward.genuineEndTick-forward.genuineStartTick>=12&&
    supported(forward,.65);
   const allActualPollsSafe=actualNewPolls.length>=2&&
    actualNewPolls.every(p=>p.originalFloorId===raised&&
     p.nativeKccGrounded===true&&!p.nativeStopReason&&
     p.registeredRaisedSource?.realFootXZInsideOriginalSlab===true&&
     p.registeredRaisedSource?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.registeredRaisedSource?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.60);
   const baselineBody=replayEnd?.observedOriginalHumanEndingBody;
   const turnBody=turn?.observedOriginalHumanEndingBody;
   const trueLeftMeters=baselineBody&&turnBody?
    baselineBody[0]-turnBody[0]:null;
   const trueNewForwardMeters=turnBody?
    turnBody[2]-end.player.position[2]:null;
   const minimumTrueEdge=Math.min(...actualNewPolls.map(p=>
    p.registeredRaisedSource?.
     distanceToOriginalSourcePolygonBoundaryMeters??Infinity));
   const endpoint=end.b124OriginalRaisedRightLowFootprint;
   const passed=b125Replay&&b125PollsSupported&&steeringActual&&
    forwardActual&&allActualPollsSafe&&!end.stopReason&&
    actualSuspicionCount<=1&&genuineEndpointSourceSupported&&
    supported(forward,.65)&&
    Number.isFinite(trueLeftMeters)&&trueLeftMeters>=.15&&
    Number.isFinite(trueNewForwardMeters)&&trueNewForwardMeters>=.35&&
    end.b112OriginalHumanGround.lastOriginalSourceHitId===raised&&
    endpoint?.realFootXZInsideOriginalSlab===true&&
    endpoint.originalRaisedSourceVerticalBandWithin22cm===true&&
    endpoint.distanceToOriginalSourcePolygonBoundaryMeters>=.65;
   const outcome={
    schema:'W10_B126_ACTUAL_NATIVE_ORIGINAL_RAISED_CORRIDOR_STEER_V1',
    actualGenuineCDPKeyboardPhases:phases,
    originalSixPhaseProof:b124NativeRealPhaseAudit,
    ninePhaseB125ReplaySupported:b125Replay&&b125PollsSupported,
    b125ActualBaselinePolls:baselinePolls,
    newAThenWActualNativePolls:actualNewPolls,
    trueLeftCorrectionMeters:trueLeftMeters,
    truePostSteeringForwardMeters:trueNewForwardMeters,
    minimumRealOriginalEdgeMeters:minimumTrueEdge,
    realFinalHumanRapierBody:end.player.position,
    finalKccGrounded:end.b112OriginalHumanGround.genuineKccGrounded,
    finalOriginalRaisedSource: end.b112OriginalHumanGround.lastOriginalSourceHitId,
    finalOriginalPolygonWitness:endpoint,
    actualSuspectedDescentCount:actualSuspicionCount,
    supportedSameSourceTurnAndShortAdvance:passed,
    distinctOriginalFloorCertified:false,
    centralOrCrossTeamRouteCertified:false,
    cpuHumanAvoidanceAtExcludedSourcesCertified:false,
    formal4v4Certified:false,
    originalSourceAuthority:[25,17,26,0],
    originalStageOrNavmeshOrScoreEdited:false,
    physicalHumanOrCpuTeleported:false,
    safetyThresholdsRelaxed:false
   };
   writeFileSync(resolve(output,'b126-real-original-raised-corridor-steering.json'),
    JSON.stringify(outcome,null,2)+'\n');
   console.log('T21_B126_REAL_ORIGINAL_RAISED_CORRIDOR_STEER',
    JSON.stringify({nativeTick:end.tick,phases:phases.length,
     actualLeftMeters:trueLeftMeters,actualNewForwardMeters:trueNewForwardMeters,
     minimumTrueEdge,source:outcome.finalOriginalRaisedSource,
     b125Replay,b125PollsSupported,steeringActual,forwardActual,
     allActualPollsSafe,passed,originalAuthority:[25,17,26,0],
     nextFloorOr4v4Certified:false}));
   if(!passed)fail('B126_ACTUAL_SOURCE_STEERING_HOLD',{
    tick:end.tick,reason:end.stopReason,phases:phases.length,
    b125Replay,b125PollsSupported,steeringActual,forwardActual,
    allActualPollsSafe,trueLeftMeters,trueNewForwardMeters,
    minimumTrueEdge,finalWitness:endpoint});
   return;
  }
  // B125 deliberately ends before the forecast registered raised edge.
  // All contact metrics are actual native KCC/source, not projections.
  if(b125RaisedCorridor){
   const raised='UndertowT21D:right-low-team-a';
   const stages=b121ActualPhases;
   const firstSix=b124NativeRealPhaseAudit?.completed===true;
   const extra=stages.slice(6);
   const start=stages[5]?.observedOriginalHumanEndingBody;
   const displacement=start?Math.hypot(
    end.player.position[0]-start[0],
    end.player.position[2]-start[2]):0;
   const actualPolls=b125GenuinePolls.filter(p=>
    stages[5]&&p.tick>stages[5].genuineEndTick);
   const eachNewPhaseSupported=extra.length===3&&
    extra.every((p,i)=>
     p.label===['RAISED_SOURCE_CORRIDOR_KEYW_3',
      'RAISED_SOURCE_CORRIDOR_KEYW_4',
      'RAISED_SOURCE_CORRIDOR_KEYW_5'][i]&&
     p.actualCDPKeyboardKeys?.length===1&&
     p.actualCDPKeyboardKeys[0]==='KeyW'&&
     p.genuineEndTick-p.genuineStartTick>=24&&
     p.genuineStartTick===stages[i+5]?.genuineEndTick&&
     p.observedSourceSolid===raised&&p.trueKccGrounded===true&&
     p.actualRaisedSourceBoundary?.realFootXZInsideOriginalSlab===true&&
     p.actualRaisedSourceBoundary?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.actualRaisedSourceBoundary?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.65);
   const eachNativePollSupported=actualPolls.length>=5&&
    actualPolls.every(p=>p.originalFloorId===raised&&
     p.nativeKccGrounded===true&&!p.nativeStopReason&&
     p.registeredRaisedSource?.realFootXZInsideOriginalSlab===true&&
     p.registeredRaisedSource?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.registeredRaisedSource?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.6);
   const minimumTrueEdge=Math.min(...actualPolls.map(p=>
    p.registeredRaisedSource?.distanceToOriginalSourcePolygonBoundaryMeters??
     Infinity));
   const endpoint=end.b124OriginalRaisedRightLowFootprint;
   const passed=firstSix&&stages.length===9&&eachNewPhaseSupported&&
    eachNativePollSupported&&!end.stopReason&&
    actualSuspicionCount<=1&&genuineEndpointSourceSupported&&
    end.b112OriginalHumanGround.lastOriginalSourceHitId===raised&&
    endpoint?.realFootXZInsideOriginalSlab===true&&
    endpoint.originalRaisedSourceVerticalBandWithin22cm===true&&
    endpoint.distanceToOriginalSourcePolygonBoundaryMeters>=.65&&
    displacement>=4.5;
   const outcome={schema:'W10_B125_TRUE_NATIVE_RAISED_SOURCE_CORRIDOR_V1',
    actualNativeOriginalKeyboardPhases:stages,
    originalSixPhasesPreviouslyProved:b124NativeRealPhaseAudit,
    allActualNativeSourceObservations:actualPolls,
    allThreeAddedPhysicalW24EndpointsSupported:eachNewPhaseSupported,
    allPolledOriginalNativeKccSupported:eachNativePollSupported,
    shortestActualOriginalEdgeMeters:minimumTrueEdge,
    actualNewNativeDisplacementMeters:displacement,
    realEndpointOriginalNamedSource:
     end.b112OriginalHumanGround.lastOriginalSourceHitId,
    actualRaisedSourcePolygon:endpoint,
    physicallyVerifiedRaisedSourceCorridor:passed,
    originalSourceAuthority:[25,17,26,0],
    originalGeomNavOrScoreChanges:0,physicalHumanOrCpuTeleports:0,
    originalHumanCpuCrowdAvoidanceCertified:false,
    nextDistinctOriginalSourceCertified:false,
    centerRoadOrOpposingRouteCertified:false,
    unrestricted4v4Certified:false};
   writeFileSync(resolve(output,'b125-real-native-raised-source-corridor.json'),
    JSON.stringify(outcome,null,2)+'\n');
   console.log('T21_B125_GENUINE_ORIGINAL_RAISED_CORRIDOR',
    JSON.stringify({nativeTick:end.tick,phases:stages.length,
     newActualDisplacementMeters:displacement,
     nearestRealOriginalEdgeMeters:minimumTrueEdge,
     originalEndpointSource:outcome.realEndpointOriginalNamedSource,
     nativeSamples:actualPolls.length,passed,
     originalSourceAuthority:[25,17,26,0],
     full4v4Certified:false}));
   if(!passed)fail('B125_ACTUAL_ORIGINAL_RAISED_CORRIDOR_HOLD',{
    nativeTick:end.tick,stop:end.stopReason,
    source:outcome.realEndpointOriginalNamedSource,
    boundary:endpoint,displacement,firstSix,
    eachNewPhaseSupported,eachNativePollSupported,
    minimumTrueEdge,phaseEndpoints:extra});
   return;
  }
  // B124: two real W segments CONTINUE the proven original Y4.5
  // raised right-low floor; require retained KCC and original 5-rays.
  // This is only source-floor continuation, never 4v4 authorization.
  if(b124RaisedContinue){
   const raised='UndertowT21D:right-low-team-a';
   const ramp='UndertowT21D:right-low-route-ramp-positive-z';
   const phases=b121ActualPhases;
   const firstFourSourceCorrect=phases.length===6&&
    phases[0]?.observedSourceSolid===
     'UndertowT21D:first-drop-landing-positive-z'&&
    phases[1]?.observedSourceSolid===
     'UndertowT21D:first-drop-landing-positive-z'&&
    phases[2]?.observedSourceSolid===
     'UndertowT21D:first-drop-landing-positive-z'&&
    phases[3]?.observedSourceSolid===raised&&
    phases[3]?.trueKccGrounded===true;
   const continuedPhases=phases.slice(4);
   const continuedSnapshots=samples.filter(p=>
    phases[3]&&p.tick>phases[3].genuineEndTick);
   const everyActualContinuedPhaseSafe=continuedPhases.length===2&&
    continuedPhases.every(p=>p.observedSourceSolid===raised&&
     p.trueKccGrounded===true&&
     p.actualRaisedSourceBoundary?.realFootXZInsideOriginalSlab===true&&
     p.actualRaisedSourceBoundary?.
      originalRaisedSourceVerticalBandWithin22cm===true&&
     p.actualRaisedSourceBoundary?.
      distanceToOriginalSourcePolygonBoundaryMeters>=.4);
   const everyObservedSampleSupported=continuedSnapshots.length>=2&&
    continuedSnapshots.every(p=>p.originalSupport===raised&&
     p.grounded===true&&
     p.b124OriginalRaisedSourceBoundary?.
      realFootXZInsideOriginalSlab===true&&
     p.b124OriginalRaisedSourceBoundary?.
      originalRaisedSourceVerticalBandWithin22cm===true);
   const start=phases[3]?.observedOriginalHumanEndingBody;
   const displacementXZ=start?Math.hypot(
    end.player.position[0]-start[0],
    end.player.position[2]-start[2]):0;
   const sourceSamples=[...new Set(samples.flatMap(p=>
    [p.originalSupport,...(p.sourceFootprintIds??[])].filter(Boolean)))];
   const currentBoundary=end.b124OriginalRaisedRightLowFootprint;
   const observedRamp=sourceSamples.includes(ramp);
   const realKcc=end.b112OriginalHumanGround.genuineKccGrounded===true;
   const lastSource=end.b112OriginalHumanGround.lastOriginalSourceHitId;
   const passed=b124NativeRealPhaseAudit?.completed===true&&
    !end.stopReason&&firstFourSourceCorrect&&
    everyActualContinuedPhaseSafe&&
    everyObservedSampleSupported&&observedRamp&&
    displacementXZ>=1.5&&lastSource===raised&&realKcc&&
    genuineEndpointSourceSupported&&
    currentBoundary?.realFootXZInsideOriginalSlab===true&&
    currentBoundary.originalRaisedSourceVerticalBandWithin22cm===true&&
    currentBoundary.distanceToOriginalSourcePolygonBoundaryMeters>=.55&&
    actualSuspicionCount<=1;
   const record={
    schema:'W10_B124_REAL_NATIVE_RAISED_ORIGINAL_SOURCE_CONTINUATION_V1',
    actualNativeKeyboardPhaseWitnesses:phases,
    strictRealEventBoundedKeyboardPhaseAudit:b124NativeRealPhaseAudit,
    measuredOriginalRightLowRaisedFootprint:end.b124OriginalRaisedRightLowFootprint,
    sampledActualNativeContinuation:continuedSnapshots,
    everyRealNativeContinuationProbeSupported:everyObservedSampleSupported,
    everyRealWPhaseTrueKccAndSourceGrounded:everyActualContinuedPhaseSafe,
    actuallyCoveredDistanceBeyondProvenRampMeters:displacementXZ,
    raisedOriginalSourceId:raised,
    originallyObservedRampId:ramp,
    originalSourceColliderSequence:sourceTransitions,
    raisedFloorContinuationPass:passed,
    realUnsupportedDescentLedger:end.b112OriginalHumanGround.suspicions,
    realNativeStopReason:end.stopReason,
    originalSourceAuthority:[25,17,26,0],
    originalSolidOrNavLinkCreated:0,realHumanActorTeleported:false,
    cpuActorPositionsModified:false,sourcePhysicsModified:false,
    onRampHumanCpuCrowdAvoidanceCertified:false,
    crossTeamNavigationCertified:false,
    completeMapFloorOr4v4Certified:false
   };
   writeFileSync(resolve(output,'b124-real-raised-original-continuation.json'),
    JSON.stringify(record,null,2)+'\n');
   console.log('T21_B124_GENUINE_RAISED_ORIGINAL_SOURCE_CONTINUATION',
    JSON.stringify({nativeTick:end.tick,
     physicalOriginalSource:lastSource,
     originalRaisedSourceBoundaryInside:
      currentBoundary?.realFootXZInsideOriginalSlab,
     lastOriginalRaisedEdgeClearance:
      currentBoundary?.distanceToOriginalSourcePolygonBoundaryMeters,
     realNewPhysicalDistanceMeters:displacementXZ,
     actualContinuationSamples:continuedSnapshots.length,
     genuineEventBoundedKeyboardNativeTicks:
      b124NativeRealPhaseAudit?.measuredActualNativePhaseDurations??null,
     genuinelyKccGrounded:realKcc,
     originallySourceSupported:everyObservedSampleSupported,
     actualNaturalSuspicionCount:actualSuspicionCount,
     passed,fullMap4v4Certified:false,source:[25,17,26,0]}));
   if(!passed)
    fail('B124_REAL_ORIGINAL_RAISED_FLOOR_CONTINUATION_HOLD',{
     nativeTick:end.tick,lastSource,body:end.player.position,
     stop:end.stopReason,displacementXZ,
     currentBoundary,phases,continuedSnapshots});
   return;
  }
  // B123: original Temple01 Y=3.0→4.5 slope is already registered.
  // Require the actual original RAPiER KCC to touch both the named
  // source ramp and the independently registered raised right-low slab.
  // A geometric quad overlap or CDP key alone is not route proof.
  if(b123OriginalRamp){
   const rampId='UndertowT21D:right-low-route-ramp-positive-z';
   const firstDropId='UndertowT21D:first-drop-landing-positive-z';
   const nextId='UndertowT21D:right-low-team-a';
   const observed=[...new Set(samples.flatMap(s=>
    [...(s.originalSupport?[s.originalSupport]:[]),
     ...(s.sourceFootprintIds??[])]))];
   const genuinelyRampContactObserved=observed.includes(rampId);
   const genuinelyLandingContactObserved=observed.includes(firstDropId);
   const genuineNextSourceGrounded=
    end.b112OriginalHumanGround.lastOriginalSourceHitId===nextId&&
    end.b112OriginalHumanGround.genuineKccGrounded===true&&
    (footprint.nearCenter===true||footprint.nearPerimeter===true);
   const actualFootY=end.player.position[1]-.87;
   const originalRaisedFloorY=4.5;
   const matchedY=Math.abs(actualFootY-originalRaisedFloorY)<=.22;
   const correctFourNativePhases=b121ActualPhases.length===4&&
    b121ActualPhases[0].observedSourceSolid===firstDropId&&
    b121ActualPhases[1].observedSourceSolid===firstDropId&&
    b121ActualPhases[2].observedSourceSolid===firstDropId;
   const trueAscended=genuinelyRampContactObserved&&
    genuinelyLandingContactObserved&&
    correctFourNativePhases&&genuineNextSourceGrounded&&
    matchedY&&!end.stopReason&&actualSuspicionCount<=1;
   const rampRecord={
    schema:'W10_B123_GENUINE_ORIGINAL_FIRST_DROP_TO_RIGHT_LOW_RAMP_V1',
    actuallyPerformedNativeKeyboardPhases:b121ActualPhases,
    actualNativeOriginalSources:observed,
    originalRampColliderId:rampId,
    actualOriginalRampPassiveAgentExcludedTicks:
     end.humanCrowd?.b123OriginalRampPassiveProxyWithheldNativeTicks??0,
    originalRampHumanCpuAvoidanceCertified:false,
    physicalOriginalRampContactObserved:genuinelyRampContactObserved,
    originalFirstDropContactObserved:genuinelyLandingContactObserved,
    originalRaisedFloorId:nextId,
    realRapierHumanFootY:actualFootY,originalRaisedFloorY,
    realRapierKccGroundedOnRaisedFloor:genuineNextSourceGrounded,
    terminalRealHumanBody:end.player.position,
    genuineNativeOriginalSourceEvidence:sourceTransitions,
    completeOriginalNativeFloorTrace:
     end.b112OriginalHumanGround,
    originalNaturalDescentSuspicions:actualSuspicionCount,
    actualLowerToRaisedRampAscentVerified:trueAscended,
    originalGeometryModified:false,originalNavmeshModified:false,
    humanOrSevenCpuTeleported:false,scoreablePromoted:0,
    humanCpuPhysicalContactCertified:false,
    crossingToOpposingTeamCertified:false,
    formal4v4Certified:false,
    frozenOriginalSourceAuthority:[25,17,26,0]
   };
   writeFileSync(resolve(output,'b123-real-physical-original-ramp-ascent.json'),
    JSON.stringify(rampRecord,null,2)+'\n');
   console.log('T21_B123_GENUINE_ORIGINAL_FIRST_DROP_RAMP_ASCENT',
    JSON.stringify({realEndNativeTick:end.tick,
     nativeOriginalSources:observed,
     genuineOriginalRampContact:genuinelyRampContactObserved,
     originalRampPassiveProxyWithheldTicks:
      end.humanCrowd?.b123OriginalRampPassiveProxyWithheldNativeTicks??0,
     realRaisedKccGrounded:genuineNextSourceGrounded,
     originalRaisedFloorId:end.b112OriginalHumanGround.lastOriginalSourceHitId,
     realHumanFootY:actualFootY,
     actualNativeSteeringPhases:b121ActualPhases.length,
     actualNaturalDescentSuspicions:actualSuspicionCount,
     genuinelySourceAscended:trueAscended,
     authenticHumanCpuInteractionCertified:false,
     originalFrozenAuthority:[25,17,26,0]}));
   if(!trueAscended)
    fail('B123_GENUINE_ORIGINAL_RAMP_ASCENT_HOLD',{
     nativeTick:end.tick,originalObservedSources:observed,
     genuineOriginalRampContact:genuinelyRampContactObserved,
     actuallyRaisedKccGrounded:genuineNextSourceGrounded,
     physicalBody:end.player.position,
     realHumanFootY:actualFootY,
     genuineOriginalFloor:end.b112OriginalHumanGround.lastOriginalSourceHitId,
     actualStop:end.stopReason,
     actualNativeSteeringPhases:b121ActualPhases
    });
   return;
  }
  // B121: source-grounded real keyboard steering witness. This NEVER
  // approves a route to another solid solely from a successful turn.
  if(b121OriginalSteer||b122OriginalSteer){
   const actualLanding=end.b112OriginalHumanGround.lastOriginalSourceHitId;
   const originalBoundary=end.b120OriginalSourceBoundary;
   const d=b121ActualPhases.find(p=>
    p.label==='LOWER_LANDING_REAL_KEYD_LATERAL');
   const a=b121ActualPhases.find(p=>
    p.label==='LOWER_LANDING_REAL_KEYA_CORRECTION');
   const deltaD=d?d.observedOriginalHumanEndingBody[0]-
    d.observedOriginalHumanStartingBody[0]:null;
   const deltaA=a?a.observedOriginalHumanEndingBody[0]-
    a.observedOriginalHumanStartingBody[0]:null;
   const genuineLeftRight=(deltaD!==null&&deltaA!==null&&
    deltaD>.2&&deltaA<-.2);
   const b122MinimumObservedLandingEdgeClearanceMeters=
    b122OriginalSteer?Math.min(...b121ActualPhases.slice(1).map(p=>
     p.actualRegisteredFloor?.originalFootInsideXZ===true?
      p.actualRegisteredFloor.actualHorizontalDistanceToOriginalPolygonEdgeMeters:
      -1)):null;
   const b122AllActualLowerSourcePhaseChecks=b122OriginalSteer&&
    b121ActualPhases.length===5&&b121ActualPhases.slice(1).every(p=>
     p.observedSourceSolid==='UndertowT21D:first-drop-landing-positive-z'&&
     p.trueKccGrounded===true&&
     p.actualRegisteredFloor?.originalFootInsideXZ===true);
   const genuineSteeringOnOriginal= b121ActualPhases.length===5&&
    reachedTarget&&genuineLeftRight&&genuineEndpointSourceSupported&&
    actualLanding==='UndertowT21D:first-drop-landing-positive-z'&&
    originalBoundary?.originalFootInsideXZ===true&&
    actualSuspicionCount<=1&&
    (!b122OriginalSteer||(b122AllActualLowerSourcePhaseChecks&&
     originalBoundary.actualHorizontalDistanceToOriginalPolygonEdgeMeters>=.35));
   const nextSource=actualLanding&&
    !['UndertowT21D:spawn-high-positive-z',
      'UndertowT21D:first-drop-landing-positive-z'].includes(actualLanding)?
    actualLanding:null;
   const outcome=genuineSteeringOnOriginal?
    'REAL_BOUNDED_STEERING_ON_FIRST_DROP_LANDING_ONLY':
    'REAL_KEYBOARD_STEERING_OR_GROUND_SUPPORT_HOLD';
   const steerReport={
    schema:b122OriginalSteer?
     'W10_B122_TRUE_CHROMIUM_BOUNDED_FIRST_DROP_STEER_V1':
     'W10_B121_TRUE_CHROMIUM_FIRST_DROP_LANDING_STEER_V1',
    b122RevisedNativeSourceInputProgram:b122OriginalSteer?
     ['W200','D12','W18','A16','W20']:null,
    b122AllLowerLandingNativePhaseChecks:
     b122OriginalSteer?b122AllActualLowerSourcePhaseChecks:null,
    b122MinimumObservedLandingEdgeClearanceMeters,
    originalSourceAuthority:[25,17,26,0],
    originalPhysicalHumanKeyWKeyAKeyD:true,
    actuallyObservedNativePhases:b121ActualPhases,
    actualKccFinalBody:end.player.position,
    actualOriginalSourceFloor:actualLanding,
    genuineRegisteredOriginalFootprintAtEnd:originalBoundary,
    physicalKeyDDeltaXMeters:deltaD,physicalKeyADeltaXMeters:deltaA,
    nativeSourceGroundedAtEnd:genuineEndpointSourceSupported,
    genuineNativeUnsupportedDescentEvents:
     end.b112OriginalHumanGround.suspicions,
    actualOriginalSourceSolidTransitions:sourceTransitions,
    observedGenuineLateralKeyDThenKeyA:genuineLeftRight,
    genuineSteeringOnExistingSourceLanding:genuineSteeringOnOriginal,
    nextOriginalFloorReachedAndVerified:nextSource,
    outcome,sourceFloorHoleCertified:false,
    nextRouteCertified:false,humanCpuCollisionCertified:false,
    official4v4Certified:false,actorTeleportPerformed:false,
    originalStageGeometryOrNavmeshModified:false
   };
   writeFileSync(resolve(output,b122OriginalSteer?
     'b122-real-revised-original-steering.json':
     'b121-real-keya-keyd-original-steering.json'),
    JSON.stringify(steerReport,null,2)+'\n');
   console.log(b122OriginalSteer?
    'T21_B122_TRUE_CHROMIUM_REVISED_SOURCE_STEERING':
    'T21_B121_TRUE_CHROMIUM_ORIGINAL_STEERING',JSON.stringify({
    outcome,actuallyNativeTick:end.tick,phases:b121ActualPhases.length,
    keyDRealHorizontalXDelta:deltaD,keyARealHorizontalXDelta:deltaA,
    sourceGroundedAtEnd:genuineEndpointSourceSupported,
    namedSource:actualLanding,originalBoundaryInside:
     originalBoundary?.originalFootInsideXZ,
    nextSource,actualSuspicionCount,sourceHoleCertified:false,
    b122MinimumObservedLandingEdgeClearanceMeters,
    b122AllActualLowerSourcePhaseChecks,
    official4v4Certified:false
   }));
   if(!genuineSteeringOnOriginal)
    fail(b122OriginalSteer?'B122_TRUE_SOURCE_REVISED_STEER_HOLD':
     'B121_TRUE_ORIGINAL_SOURCE_STEER_HOLD',{
     outcome,stopReason:end.stopReason,actualTick:end.tick,
     finalOriginalSource:actualLanding,originalBoundary,
     keyDRealHorizontalXDelta:deltaD,
     keyARealHorizontalXDelta:deltaA
    });
   return;
  }
  // B120 independent limited actual source touchdown QA: releasing real
  // KeyW at native tick 240, BEFORE walking beyond the registered landing.
  // The natural airborne first-drop suspicion is preserved verbatim and
  // expressly not promoted to a complete safe route/collision certificate.
  if(b120TouchdownOnly){
   const boundary=end.b120OriginalSourceBoundary;
   const realLanding=end.b112OriginalHumanGround.lastOriginalSourceHitId;
   const actualGrounded=end.b112OriginalHumanGround.genuineKccGrounded===true;
   const observed=samples.some(s=>
    s.originalSupport==='UndertowT21D:spawn-high-positive-z')&&
    samples.some(s=>s.originalSupport===
     'UndertowT21D:first-drop-landing-positive-z');
   const touchDownPass=reachedTarget&&actualGrounded&&
    realLanding==='UndertowT21D:first-drop-landing-positive-z'&&
    boundary?.originalFootInsideXZ===true&&
    boundary?.originalSourceSolidId===realLanding&&observed&&
    actualSuspicionCount<=1&&
    end.humanCrowd?.b119FirstDropProxyWithheldNativeTicks>0;
   const touchDownReport={
    schema:'W10_B120_REAL_FIRST_DROP_TOUCHDOWN_ONLY_V1',
    nativeTicksActuallyRun:end.tick-first.tick,
    recordedNativeSuspicions:end.b112OriginalHumanGround.suspicions,
    genuineFirstDropLandingKccGrounded:actualGrounded,
    realOriginalFootSupportId:realLanding,
    registeredOriginalBoundary:boundary,
    actualNativeLandingReached:touchDownPass,
    realOriginalSourceEvidence:report.genuineSourceTransitions,
    physicalHumanOrSevenCpuTeleported:false,
    wholeMapOrNextRouteCertified:false,
    firstDropHumanCpuAvoidanceCertified:false,
    missingFloorProven:false,
    originalSourceAuthority:[25,17,26,0]
   };
   writeFileSync(resolve(output,'b120-real-original-first-drop-touchdown.json'),
    JSON.stringify(touchDownReport,null,2)+'\n');
   console.log('T21_B120_ACTUAL_NATIVE_ORIGINAL_FIRST_DROP_TOUCHDOWN',
    JSON.stringify({nativeTick:end.tick,realLanding,actualGrounded,
     insideRegisteredSource:boundary?.originalFootInsideXZ,
     nativeSuspicionCount:actualSuspicionCount,
     b119ExcludedNativeTicks:end.humanCrowd?.
      b119FirstDropProxyWithheldNativeTicks,
     touchdownPass:touchDownPass,
     longerSafeRouteCertified:false,originalSourceAuth:[25,17,26,0]}));
   if(!touchDownPass)
    fail('B120_GENUINE_FIRST_DROP_TOUCHDOWN_HOLD',{
     actualTick:end.tick,stop:end.stopReason,realLanding,
     nativeSuspicionCount:actualSuspicionCount,
     sourceFootprint:boundary,actualGrounded});
   return;
  }
  // Fail closed when a physical stop or insufficient progress prevents the
  // requested route proof; keep JSON/PNG artifact even on CI failure.
  if(b116Extended&&end.stopReason?.startsWith(
      'T21_PHASE14Q_UNBOUNDED_CROWD_DRIFT')&&(
      realCrowdDriftWitness?.schema!==
       'T21_W10_B118_REAL_ORIGINAL_CROWD_DRIFT_V1'||
      realCrowdDriftWitness.unboundedOriginalCrowdDrift!==true||
      realCrowdDriftWitness.existingUnboundedHorizontalFenceMeters!==2))
   fail('B118_ACTUAL_POST_RECAST_CROWD_WITNESS_MISSING',
    {reason:end.stopReason,witness:realCrowdDriftWitness});
  if(!reachedTarget||forwardProgressMeters<20||
     actualSuspicionCount>0||!genuineEndpointSourceSupported)
   fail('B116_GENUINE_FORWARD_ROUTE_HOLD',{nativeOutcome,forwardProgressMeters,
    actualSuspicionCount,genuineEndpointSourceSupported,
    stopReason:end.stopReason,lastTick:end.tick});
  return;
 }
 // W10-B113 actual Chrome Esc, CDP mouse click, and JSON saved to host.
 const esc={key:'Escape',code:'Escape',
  windowsVirtualKeyCode:27,nativeVirtualKeyCode:27};
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...esc});
 await cmd('Input.dispatchKeyEvent',{type:'keyUp',...esc});
 await until(async()=>await evaluate('document.pointerLockElement===null'),20000,150);
 const point=await evaluate(`(()=>{
  const button=document.querySelector('#t21-f3-b113-floor-save');
  const section=document.querySelector('#t21-f3-b113-floor-capture');
  if(!button||!section||button.hidden||section.hidden)return null;
  const r=button.getBoundingClientRect();
  return r.width>50&&r.height>15&&r.left>=0&&r.top>=0&&
   r.right<=window.innerWidth&&r.bottom<=window.innerHeight?
   {x:r.left+r.width/2,y:r.top+r.height/2}:null;
 })()`);
 if(!point)fail('B113_SAVE_BUTTON_NOT_VISIBLE');
 await cmd('Input.dispatchMouseEvent',{
  type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
 await cmd('Input.dispatchMouseEvent',{
  type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
 const saved=await until(async()=>{
  try{
   const name=readdirSync(output).find(n=>
    /^T21_W10B113_ORIGINAL_FLOOR_TRACE_TICK_\d+\.json$/.test(n));
   if(!name)return false;
   const report=JSON.parse(readFileSync(resolve(output,name),'utf-8'));
   return report.schema==='W10_B113_MANUAL_ORIGINAL_FLOOR_TRACE_V1'?
    {name,report}:false;
  }catch{return false;}
 },30000,250);
 const trace=saved.report;
 if(trace.genuineNativeTick<end.tick||
    trace.originalSourceFloorHoleCertified!==false||
    trace.productionAuthorized!==false||
    trace.unrestricted4v4Certified!==false||
    trace.observedOriginalFoot?.noActorPositionMutation!==true||
    trace.observedOriginalFoot?.suspicions?.some(e=>
     e.rayHitDoesNotProveKccCollision!==true||
     !['EDGE_RAY_VISIBLE_BUT_KCC_UNGROUNDED',
       'NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED',
       'FIVE_RAY_WITNESS_NOT_AVAILABLE'].includes(e.unsupportedRayVsKccContext))||
    JSON.stringify(trace.originalSourceAuthority)!=='[25,17,26,0]')
  fail('B113_REAL_BROWSER_DOWNLOAD_INVALID');
 console.log('T21_B113_REAL_CHROME_ONE_CLICK_NATIVE_FLOOR_JSON_PASS',
  JSON.stringify({realCDPEscapeAndMouse:true,download:saved.name,
   genuineNativeTick:trace.genuineNativeTick,
   sourceAuthority:trace.originalSourceAuthority,
   suspectCount:trace.authenticSuspectedDescentEvents,
   originalHoleCertified:false,completeMapCertified:false}));
 console.log('T21_B114_GENUINE_ORIGINAL_CAPSULE_WIDTH_RAY_WITNESS',JSON.stringify({
  actualNativeTick:footprint.nativeTick,realProbeCount:footprint.probes.length,
  sourceRayClassification:footprint.classification,
  actualOriginalSolids:footprint.observedSourceSolidIds,
  originalFloorHoleCertified:false,sourceAuth:[25,17,26,0],
  formal4v4Certified:false
 }));
 console.log('T21_B112_REAL_ORIGINAL_RAPIER_HUMAN_FOOT_WITNESS',JSON.stringify({
  nativeTicks:end.tick-first.tick,horizontalMovedMeters:moved,
  body:end.player.position,
  genuineRaySupportId:end.b112OriginalHumanGround.lastOriginalSourceHitId,
  suspicionCount:end.b112OriginalHumanGround.suspicionCount,
  actualSourceAuthority:[25,17,26,0],completeMapCertified:false
 }));
}
try{await run();}
catch(e){console.error(e);process.exitCode=1;}
finally{sock?.close();for(const p of children)p.kill('SIGTERM');}
