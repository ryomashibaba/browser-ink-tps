#!/usr/bin/env node
/**
 * W10-B103: short, genuine-Chrome original-source right-lane INPUT CALIBRATION.
 * Evidence only: NEVER setPosition, synthetic ticks, CPU relocations, NavLinks,
 * source geometry, collision exemptions, match promotion or official scoring.
 * A corridor hit is a *candidate*, NOT proof of a physically blocked A3 route.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';

const root='http://127.0.0.1:4197/browser-ink-tps/';
const pulseTicks=Number(process.env.T21_B103_RIGHT_PULSE_TICKS??4);
if(!Number.isInteger(pulseTicks)||pulseTicks<1||pulseTicks>10)
 throw Error('B103_BAD_REAL_KEYD_TICKS');
const output=process.env.T21_B103_EVIDENCE_DIR??'/tmp/t21-b103';
const children=[],pending=new Map();
let sock,id=0;
const fail=(why,detail)=>{throw Error('B103_'+why+
 (detail===undefined?'':'_'+JSON.stringify(detail)));};
async function until(fn,ms=90000,poll=90){
 const limit=Date.now()+ms;
 while(Date.now()<limit){
  const value=await fn();
  if(value)return value;
  await sleep(poll);
 }
 fail('NATIVE_CHROME_TIMEOUT',{ms});
}
async function cmd(method,params={}){
 if(sock?.readyState!==WebSocket.OPEN)fail('CDP_DISCONNECTED');
 const n=++id;
 return await new Promise((yes,no)=>{
  const timeout=setTimeout(()=>{
   pending.delete(n);no(Error('B103_CDP_TIMEOUT_'+method));
  },25000);
  pending.set(n,{
   yes:response=>{clearTimeout(timeout);yes(response);},
   no:error=>{clearTimeout(timeout);no(error);}
  });
  sock.send(JSON.stringify({id:n,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',
  {expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('CHROME_PAGE_EXCEPTION',r.exceptionDetails);
 return r.result?.value;
}
const w={key:'w',code:'KeyW',windowsVirtualKeyCode:87,
 nativeVirtualKeyCode:87};
const d={key:'d',code:'KeyD',windowsVirtualKeyCode:68,
 nativeVirtualKeyCode:68};
const click=type=>cmd('Input.dispatchMouseEvent',
 {type,x:800,y:450,button:'left',clickCount:1});
function authority(n){
 if(n.stopReason||n.originalSourceSolids!==25||
    n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
    n.unrestricted4v4Certified!==false||n.cpu?.b93ExperimentalEnabled!==true||
    n.b102OriginalA3Kcc?.enabled!==true||
    n.cpu?.physicalFootRelocations!==0)
  fail('ORIGINAL_SOURCE_AUTHORITY_DRIFT',{
   tick:n.tick,stop:n.stopReason,solids:n.originalSourceSolids,
   paint:n.originalPaintSurfaces,nav:n.originalSourceNavigationLinks,
   score:n.sourceScoreablePromotions,relocations:n.cpu?.physicalFootRelocations
  });
 return n;
}
async function run(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_MISSING');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000,250);
 const browser=spawn(chrome,['--headless=new','--no-sandbox',
  '--disable-dev-shm-usage','--no-first-run','--disable-extensions',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9257','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-w10b103-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{
   return (await (await fetch('http://127.0.0.1:9257/json')).json())
    .find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  }catch{return null;}
 },40000,250);
 sock=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   sock.addEventListener('open',ok,{once:true});
   sock.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('B103_CDP_OPEN_TIMEOUT');})
 ]);
 sock.addEventListener('message',event=>{
  const message=JSON.parse(String(event.data));
  const p=pending.get(message.id);
  if(!p)return;
  pending.delete(message.id);
  if(message.error)p.no(Error(JSON.stringify(message.error)));
  else p.yes(message.result||{});
 });
 await cmd('Page.enable');
 await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:root+
  '?t21Play=preview&t21QaDrive=source&t21W10B93=upperDetour&t21W10B102=contactProbe'});
 await until(async()=>await evaluate(`(() => {
  const c=document.querySelector('#app-canvas');
  return c?.dataset.t21F3Ready==='READY'&&c?.dataset.t21F3Renderer==='webgl2';
 })()`),100000,450);
 const snapshot=async()=>authority(await evaluate('window.__t21F3.snapshot()'));
 const boot=await snapshot();
 if(boot.matchState!=='STAGING'||boot.paused)fail('BAD_NATIVE_BOOT');
 await click('mousePressed');await click('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...w});
 await click('mousePressed');
 const before=await snapshot();
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...d});
 let atPulse;
 try{
  atPulse=await until(async()=>{
   const n=await snapshot();
   return n.tick>=before.tick+pulseTicks?n:false;
  },45000,90);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...d});
 }
 console.log('T21_B103_TRUE_KEYD_RELEASE',JSON.stringify({
  requestedNativeTicks:pulseTicks,actualNativeTicks:atPulse.tick-before.tick,
  initial:before.player.position,atPulse:atPulse.player.position
 }));
 let atWRelease;
 try{
  atWRelease=await until(async()=>{
   const n=await snapshot();
   return n.player.position[2]<=64.35?n:false;
  },90000,90);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...w});
 }
 const afterKeyup=await snapshot();
 await click('mouseReleased');
 const nearSettled=await until(async()=>{
  const n=await snapshot();
  return n.tick>=before.tick+160?n:false;
 },120000,300);
 const settled=await until(async()=>{
  const n=await snapshot();
  return n.tick>=before.tick+180?n:false;
 },120000,300);
 const [x,y,z]=settled.player.position;
 const drift=Math.hypot(x-nearSettled.player.position[0],
  z-nearSettled.player.position[2]);
 if(drift>.025)fail('HUMAN_NOT_PHYSICALLY_SETTLED',{drift});
 const originallyBlockedA3=[0.2749243676662445,64.00698852539062];
 const separationToBlockedA3=Math.hypot(x-originallyBlockedA3[0],
  z-originallyBlockedA3[1]);
 // These are candidate preconditions calibrated from REAL prior trials;
 // a true collision witness requires the separate full 60Hz A3 KCC test.
 const rightCandidate=x>=-.12&&x<=-.01&&z>=63.5&&z<=64.1&&
  y>=8.2&&y<=8.6&&separationToBlockedA3<=.7;
 const frame=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true})).data||'','base64');
 if(frame.length<10000)fail('SCREENSHOT_INVALID',{bytes:frame.length});
 const proof={
  schema:'T21_W10_B103_TRUE_CHROME_SIDE_KEY_CALIBRATION_V1',
  qualification:'POSITION_CANDIDATE_ONLY_NOT_PHYSICAL_A3_BLOCK_PROOF',
  requestedKeyDTicks:pulseTicks,
  actualKeyDTicks:atPulse.tick-before.tick,
  nativeStartingTick:before.tick,nativeFinalTick:settled.tick,
  firstHumanFoot:before.player.position,
  humanFootAtKeyDRelease:atPulse.player.position,
  humanFootAtKeyWObservedRelease:atWRelease.player.position,
  humanFootAfterKeyWApplied:afterKeyup.player.position,
  humanFootBeforeSettled:nearSettled.player.position,
  physicalSettledHumanFoot:settled.player.position,
  settledDriftMeters:drift,
  horizontalDistanceToPreviouslyBlockedA3Meters:separationToBlockedA3,
  rightBlockerLaneCandidate:rightCandidate,
  actualKeyboardD:true,actualKeyboardW:true,
  actualBrowserPointerLock:true,actualNativeSimulationOnly:true,
  teleportPerformed:false,artificialTickAdvance:0,
  genuineHumanRetreatKeyS:false,
  originalAuthority:[25,17,26,0],
  originalActivationReady:false,original4v4Certified:false,
  normalFixedDefaultUnchanged:true,productionAuthorized:false,
  realA3KccWitnessAtCalibrationTick:settled.b102OriginalA3Kcc,
  screenshot:{name:'b103-native-right-'+pulseTicks+'-ticks.png',
   bytes:frame.length,sha256:createHash('sha256').update(frame).digest('hex')}
 };
 writeFileSync(resolve(output,proof.screenshot.name),frame);
 writeFileSync(resolve(output,'b103-calibration-'+pulseTicks+'.json'),
  JSON.stringify(proof,null,2));
 console.log('T21_B103_REAL_NATIVE_LANE_CALIBRATION_RECORDED',
  JSON.stringify({requestedTicks:pulseTicks,actualTicks:proof.actualKeyDTicks,
   keyupX:atWRelease.player.position[0],keyupZ:atWRelease.player.position[2],
   finalFoot:proof.physicalSettledHumanFoot,
   rightBlockerLaneCandidate:rightCandidate,
   a3CollisionsObservedAtCalibration:
    settled.b102OriginalA3Kcc?.humanProximateRapierBlocks,
   noPhysicalRouteCertification:true}));
}
try{await run();}
catch(error){console.error(error);process.exitCode=1;}
finally{sock?.close();for(const p of children)p.kill('SIGTERM');}
