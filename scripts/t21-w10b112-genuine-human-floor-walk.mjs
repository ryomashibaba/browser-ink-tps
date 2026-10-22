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
 let later;
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
 try{
  later=await until(async()=>{
   const n=await snapshot();
   if(samples.length===0||n.tick-samples.at(-1).tick>=12)
    samples.push({tick:n.tick,body:n.player.position,
     grounded:n.b112OriginalHumanGround.genuineKccGrounded,
     originalSupport:n.b112OriginalHumanGround.lastOriginalSourceHitId,
     sourceFootprintClass:n.b112OriginalHumanGround.lastOriginalFootprint?.classification??null,
     sourceFootprintIds:n.b112OriginalHumanGround.lastOriginalFootprint?.observedSourceSolidIds??[],
     suspectedDescents:n.b112OriginalHumanGround.suspicionCount});
   return n.tick>=targetTick||(b116Extended&&n.stopReason)?n:false;
  },180000,150);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
 }
 const end=await snapshot();
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
    suspectedDescents:end.b112OriginalHumanGround.suspicionCount});
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
  const nativeOutcome=end.stopReason?'NATIVE_STOP_BEFORE_TARGET':
   !reachedTarget?'NATIVE_TICK_TARGET_NOT_REACHED':
   forwardProgressMeters<20?'LIMITED_FORWARD_PROGRESS':
   actualSuspicionCount>0?'SUSPECTED_UNSUPPORTED_NATIVE_DESCENT':
   !genuineEndpointSourceSupported?'TRUE_KCC_ENDPOINT_SOURCE_UNSUPPORTED':
   'REAL_SUPPORTED_FORWARD_TRAVERSE_GT_20M';
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
    actualSuspicionCount,actuallySourceSupportedAtEnd:genuineEndpointSourceSupported,
    nativeStopReason:end.stopReason,originalAuthority:[25,17,26,0],
    sourceFloorHoleCertified:false,centralPathCertified:false,
    formal4v4Certified:false}));
  // Fail closed when a physical stop or insufficient progress prevents the
  // requested route proof; keep JSON/PNG artifact even on CI failure.
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
