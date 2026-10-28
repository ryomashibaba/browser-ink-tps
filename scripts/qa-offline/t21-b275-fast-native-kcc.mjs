#!/usr/bin/env node
/** B275: bounded real Chrome/PlayCanvas/Rapier KCC; no stage or time mutation. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {captureB273NativeKccDrop} from './t21-b273-real-native-kcc-transition.mjs';
import {b277InstallKeyEventObserver,b277ReadKeyEventObserver,
 b277CaptureReverseControl}
 from './t21-b277-real-keyboard-diagnostic.mjs';
const root='http://127.0.0.1:4196/browser-ink-tps/';
const output='/tmp/t21-b275-fast-native-kcc';
const children=[],pending=new Map();let socket=null,seq=0;
const fail=s=>{throw Error('B275_'+s)};
async function waitUntil(fn,ms=45000){
 const until=Date.now()+ms;let last='';
 while(Date.now()<until){try{const v=await fn();if(v)return v;}catch(e){last=String(e);}await sleep(220);}
 fail('TIMEOUT_'+last);
}
async function cmd(method,params={}){
 if(!socket||socket.readyState!==WebSocket.OPEN)fail('CDP_OFFLINE');
 return await new Promise((ok,no)=>{
  const id=++seq,t=setTimeout(()=>{pending.delete(id);no(Error('B275_CDP_TIMEOUT_'+method));},25000);
  pending.set(id,{ok:v=>{clearTimeout(t);ok(v);},no:e=>{clearTimeout(t);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(v.exceptionDetails)fail('BROWSER_EXCEPTION_'+JSON.stringify(v.exceptionDetails).slice(0,1200));
 return v.result?.value;
}
async function screenshot(name){
 const data=(await cmd('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false})).data;
 const b=Buffer.from(data||'','base64');
 if(b.length<10000||b.subarray(1,4).toString()!=='PNG'||
    b.readUInt32BE(16)!==1600||b.readUInt32BE(20)!==900)fail('BAD_WEBGL2_SCREEN_'+name);
 writeFileSync(resolve(output,name+'.png'),b);
 return {name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};
}
async function main(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
  .find(v=>{try{execFileSync('which',[v],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_MISSING');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4196','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await waitUntil(async()=>(await fetch(root)).ok,30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--disable-background-networking',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader','--window-size=1600,900',
  '--hide-scrollbars','--remote-debugging-port=9256','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b275-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await waitUntil(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  return (await (await fetch('http://127.0.0.1:9256/json')).json())
    .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 },45000);
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([new Promise((ok,no)=>{
  socket.addEventListener('open',ok,{once:true});
  socket.addEventListener('error',no,{once:true});
 }),sleep(12000).then(()=>{throw Error('B275_CDP_CONNECTION_TIMEOUT');})]);
 socket.addEventListener('message',event=>{
  const packet=JSON.parse(String(event.data)),p=pending.get(packet.id);
  if(!p)return;pending.delete(packet.id);
  if(packet.error)p.no(Error(JSON.stringify(packet.error)));else p.ok(packet.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:root+'?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround&t21FullSource=review'});
 // Real browser-tab activation; do not mutate document.hasFocus or PlayerInput.
 await cmd('Page.bringToFront');
 await waitUntil(async()=>{
  const x=await evaluate("({ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,error:document.querySelector('#boot-error')?.textContent||''})");
  if(x?.error)fail('BOOT_'+x.error.slice(0,500));
  return x?.ready==='READY'&&x.renderer==='webgl2'?x:false;
 },90000);
 let s=await evaluate('window.__t21F3.snapshot()');
 if(s.stopReason||s.originalSourceSolids!==25||s.originalPaintSurfaces!==17||
  s.originalSourceNavigationLinks!==26||s.sourceScoreablePromotions!==0||
  s.productionAuthorized!==false||s.matchState!=='STAGING')fail('UNTRUSTED_NATIVE_SOURCE_BOOT');
 if(s.paused){
  s=await evaluate('window.__t21F3.resume()');
  if(s.paused||s.stopReason)fail('SOURCE_CLOCK_NOT_RESUMED');
 }
 s=await waitUntil(async()=>{
  const x=await evaluate('window.__t21F3.snapshot()');
  if(x.stopReason)fail('NATIVE_STOP_'+x.stopReason);
  return x.tick>=42&&!x.paused&&x.b112OriginalHumanGround?.enabled===true&&
   x.b112OriginalHumanGround?.genuineKccGrounded===true?x:false;
 },100000);
 const readySource={tick:s.tick,body:s.player.position,
  source:s.b112OriginalHumanGround.lastOriginalSourceHitId,authority:'25/17/26/0',
  genuineKccGrounded:s.b112OriginalHumanGround.genuineKccGrounded,
  syntheticActorMotion:false,productionAuthorized:false};
 writeFileSync(resolve(output,'b276-native-source-before-real-input.json'),
  JSON.stringify(readySource,null,2));
 console.log('B275_NATIVE_SOURCE_READY',JSON.stringify(readySource));
 await b277InstallKeyEventObserver(evaluate);
 let trace;
 try{
  trace=await captureB273NativeKccDrop({evaluate,cmd,waitUntil,screenshot,output});
 }catch(error){
  if(String(error).includes('B273_REAL_NATIVE_NO_KCC_MOTION')){
   try{
    const triage=await b277CaptureReverseControl({
     evaluate,cmd,waitUntil,output});
    console.log('B277_REAL_NATIVE_INPUT_DIRECTION_TRIAGE',JSON.stringify({
     classification:triage.classification,
     trustedForwardKeyObserved:triage.originalForwardKeyObserved,
     trustedReverseKeyObserved:triage.originalReverseKeyObserved,
     realReverseMeters:triage.reverseControl.realPhysicalMeters,
     realReentryMeters:triage.returnControl?.realPhysicalMeters??null,
     noRouteCertified:true}));
   }catch(triageError){
    console.error('B277_GENUINE_REVERSE_DIAGNOSTIC_UNAVAILABLE',String(triageError));
    const evidence=await b277ReadKeyEventObserver(evaluate).catch(e=>({
     readError:String(e)}));
    writeFileSync(resolve(output,'b277-native-key-event-triage-unavailable.json'),
     JSON.stringify({originalFailure:String(error),triageFailure:String(triageError),
      events:evidence,source:'25/17/26/0',productionAuthorized:false},null,2));
   }
  }
  throw error;
 }
 const trusted=await b277ReadKeyEventObserver(evaluate);
 if(!trusted.events.some(x=>x.code==='KeyW'&&x.type==='keydown'&&
    x.realTrustedEvent===true&&x.canvasLocked===true&&x.focused===true))
  fail('REAL_MOVEMENT_WITHOUT_TRUSTED_W_KEY_EVENT');
 if(trace.actualFullMotionMeters<.1||trace.actualNativeTickSpan<1||
    trace.b274RealBrowserInput?.afterLocked!==true)fail('UNVERIFIED_PHYSICAL_MOTION');
 const report={status:trace.actualVerifiedLowerSupportReached?'ORIGINAL_LOWER_REACHED':
   'REAL_KCC_MOVED_LOWER_ROUTE_HOLD',
  trueNativeTicks:trace.actualNativeTickSpan,trueKccMeters:trace.actualFullMotionMeters,
  originalSupportIds:[...new Set(trace.legs.map(x=>x.endOriginalSupportId))],
  originalLowerReached:trace.actualVerifiedLowerSupportReached,source:'25/17/26/0',
  observedTrustedForwardKeydowns:trusted.events.filter(x=>x.code==='KeyW'&&
   x.type==='keydown'&&x.realTrustedEvent===true).length,
  artAccepted:false,productionAuthorized:false,official4v4Certified:false};
 writeFileSync(resolve(output,'b275-real-kcc-summary.json'),JSON.stringify(report,null,2));
 console.log('B275_REAL_KCC_RESULT',JSON.stringify(report));
}
async function persistFailureEvidence(error){
 try{
  const online=socket?.readyState===WebSocket.OPEN;
  const browser=online?await evaluate("({canvasExists:!!document.querySelector('#app-canvas'),canvasReady:document.querySelector('#app-canvas')?.dataset.t21F3Ready,renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,hasFocus:document.hasFocus(),hidden:document.hidden,pointerLocked:document.pointerLockElement===document.querySelector('#app-canvas')})").catch(e=>({readError:String(e)})):null;
  const state=online?await evaluate("(() => {const v=window.__t21F3?.snapshot?.();return v?{tick:v.tick,matchState:v.matchState,paused:v.paused,stopReason:v.stopReason,body:v.player?.position,originalSupport:v.b112OriginalHumanGround?.lastOriginalSourceHitId,grounded:v.b112OriginalHumanGround?.genuineKccGrounded,source:[v.originalSourceSolids,v.originalPaintSurfaces,v.originalSourceNavigationLinks,v.sourceScoreablePromotions]}:null})()").catch(e=>({readError:String(e)})):null;
  const diagnostic={
   schema:'B276_NATIVE_BROWSER_FAILURE_EVIDENCE',
   failure:String(error),browser,state,
   originalStageMutated:false,syntheticKeyboard:false,
   original4v4Certified:false,artAccepted:false,
   productionAuthorized:false
  };
  mkdirSync(output,{recursive:true});
  writeFileSync(resolve(output,'b276-real-browser-failure-diagnostic.json'),
   JSON.stringify(diagnostic,null,2));
  console.error('B276_FAILURE_BROWSER_STATE',JSON.stringify(diagnostic));
  if(online&&browser?.renderer==='webgl2')
   await screenshot('B276_REAL_BROWSER_FAILURE').catch(e=>
    console.error('B276_FAILURE_SCREENSHOT_UNAVAILABLE',String(e)));
 }catch(failure){console.error('B276_FAILURE_EVIDENCE_WRITE_ERROR',failure);}
}
try{await main();}
catch(error){await persistFailureEvidence(error);console.error(error);process.exitCode=1;}
finally{socket?.close();for(const child of children)child.kill('SIGTERM');}