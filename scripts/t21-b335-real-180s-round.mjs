#!/usr/bin/env node
/** B335: REAL pointer-locked browser, actual 180s clock, 1 human + 7 CPUs.
 * No QA clock advancement, actor relocation, artificial ink or fabricated winner. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {b335VerifyNativeRound} from './t21-b335-real-180s-guard.mjs';
const ROOT='http://127.0.0.1:4199/browser-ink-tps/';
const DIR=process.env.T21_B335_OUTPUT||'/tmp/t21-b335';
const children=[],calls=new Map();
let socket=null,seq=0,clockStart=0;
const fail=reason=>{throw Error('B335_TRUE_CHROMIUM_'+reason);};
async function wait(fn,limit=100000){
 const until=Date.now()+limit;
 while(Date.now()<until){const n=await fn();if(n)return n;await sleep(400);}
 fail('WAIT_EXPIRED_'+limit);
}
async function send(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{calls.delete(id);reject(Error('CDP_TIMEOUT_'+method));},30000);
  calls.set(id,{yes:v=>{clearTimeout(timeout);resolve(v);},
   no:e=>{clearTimeout(timeout);reject(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function read(expression){
 const response=await send('Runtime.evaluate',{
  expression,returnByValue:true,awaitPromise:true});
 if(response.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(response.exceptionDetails));
 return response.result?.value;
}
const snapshot=()=>read('window.__t21F3.snapshot()');
const buttonScript=selector=>'(() => {const el=document.querySelector('+
 JSON.stringify(selector)+');if(!el||el.hidden||el.disabled)return null;'+
 'el.scrollIntoView({block:"center",behavior:"instant"});'+
 'const r=el.getBoundingClientRect();return {x:r.left+r.width/2,'+
 'y:r.top+r.height/2,width:r.width,height:r.height};})()';
async function clickButton(selector){
 const xy=await read(buttonScript(selector));
 if(!xy||xy.width<4||xy.height<4||xy.x<0||xy.y<0||xy.x>=1600||xy.y>=900)
  fail('REAL_VISIBLE_BUTTON_MISSING_'+selector);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:xy.x,y:xy.y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await send('Input.dispatchMouseEvent',{type,x:xy.x,y:xy.y,
   button:'left',clickCount:1});
}
async function picture(name){
 const response=await send('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true});
 const data=Buffer.from(response.data,'base64');
 if(data.length<20000||data.readUInt32BE(16)!==1600||data.readUInt32BE(20)!==900)
  fail('Genuine_Framebuffer_Missing_'+name);
 writeFileSync(resolve(DIR,name+'.png'),data);
}
function verifyAuthority(n){
 if(!n||n.stopReason||n.originalSourceSolids!==25||
  n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
  n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
  n.unrestricted4v4Certified!==false||
  n.turfResult!=='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'||
  n.cpu?.physicalFootRelocations!==0||
  !Array.isArray(n.cpu.cpu)||n.cpu.cpu.length!==7)
  fail('LIVE_STAGE_AUTHORITY_CHANGED');
 return n;
}
const proof={schema:'B335_REAL_CHROMIUM_SOURCE_ROUND',source:'25/17/26/0',
 actualCdpUserClick:true,injectedTicks:false,injectedInk:false,
 injectedActorPositions:false,officialWinner:'NONE',samples:[]};
function store(){writeFileSync(resolve(DIR,'b335-real-round.json'),
 JSON.stringify(proof,null,2));}
async function record(threshold,n){
 verifyAuthority(n);
 const view=await read('(() => ({visible:document.visibilityState,'+
 'locked:document.pointerLockElement===document.querySelector("#app-canvas"),'+
 'hudPhase:document.querySelector("#t21-f3-b205-real-round")?.dataset.t21B205NativePhase,'+
 'performance:performance.now()}))()');
 // B312 is a strictly read-only original 17-owner + actual Rapier foot ray,
 // permitted while playing on the existing 25/17/26 source stage.
 let foot=null;
 if(n.matchState==='PLAYING'&&!n.paused){
  const l=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  if(l?.source!=='25/17/26/0'||l.originalRows?.length!==17)
   fail('GENUINE_SOURCE_FOOT_LEDGER_MISSING');
  foot={id:l.genuineHumanOriginalFootSolid,
   gap:l.genuineOriginalFootGapMeters,supported:l.realHumanOriginalFootSupported};
 }
 const m={thresholdSeconds:threshold,tick:n.tick,
  remainingSeconds:n.timeRemainingSeconds,matchState:n.matchState,
  paused:n.paused,stopReason:n.stopReason,
  originalSolids:n.originalSourceSolids,originalPaint:n.originalPaintSurfaces,
  originalNavLinks:n.originalSourceNavigationLinks,
  scoreable:n.sourceScoreablePromotions,
  productionAuthorized:n.productionAuthorized,
  unrestricted4v4Certified:n.unrestricted4v4Certified,
  officialWinner:'NONE',turfResult:n.turfResult,
  cpuActors:n.cpu.cpu.length,actualCpuRejoined:n.cpu.physicalRejoins.length,
  cpuRelocations:n.cpu.physicalFootRelocations,
  humanInk:n.b23HumanInkFeedback.humanChangedCells,
  cpuInk:n.cpuInkCellsChanged,humanShots:n.shotsFired,
  actualHumanBody:n.player.position,
  originalHumanFootSupport:foot,wallMs:Date.now()-clockStart,
  actualCpuFootPositions:n.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot??null})),
  realWebGL:view};
 proof.samples.push(m);store();
 console.log('B335_REAL_FULL_180S_CHECKPOINT',JSON.stringify({
  threshold,tick:m.tick,remaining:m.remainingSeconds,phase:m.matchState,
  real7Cpu:m.cpuActors,sourceRejoins:m.actualCpuRejoined,
  humanPaint:m.humanInk,cpuPaint:m.cpuInk,
  humanFoot:m.originalHumanFootSupport}));
}
async function run(){
 mkdirSync(DIR,{recursive:true});store();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium']
   .find(s=>{try{execFileSync('which',[s],{stdio:'ignore'});return true;}
   catch{return false;}});
 if(!chrome)fail('CHROMIUM_REQUIRED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4199','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9268','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b335-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9268/json')).json())
   .find(p=>p.type==='page'&&p.webSocketDebuggerUrl);}catch{return null;}
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{
  socket.addEventListener('open',yes,{once:true});
  socket.addEventListener('error',no,{once:true});
 });
 socket.addEventListener('message',event=>{
  const r=JSON.parse(String(event.data)),q=calls.get(r.id);
  if(!q)return;calls.delete(r.id);
  r.error?q.no(Error(JSON.stringify(r.error))):q.yes(r.result||{});
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:ROOT+
  '?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround&t21W10B149=contactTrace'});
 const ready=()=>wait(async()=>{
  try{return await read('document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"'+
   '&&document.querySelector("#app-canvas")?.dataset.t21F3Renderer==="webgl2"');}
  catch{return false;}
 },110000);
 await ready();
 await clickButton('#t21-f3-b193-ally-coop');
 await wait(async()=>{try{return await read(
  'document.querySelector("#app-canvas")?.dataset.t21B193Coop==="REAL_A1_ORIGINAL_SOURCE"'+
  '&&document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"');}
  catch{return false;}},110000);
 await clickButton('#t21-f3-b203-full-round');
 // Require the freshly selected full-round SOURCE world; a stale READY
 // flag from the previous coop page must NOT satisfy this gate.
 const realFullRound=await wait(async()=>{
  try{return await read('(() => ({ready:document.querySelector("#app-canvas")?.dataset.t21F3Ready,'+
   'mode:document.querySelector("#app-canvas")?.dataset.t21B203FullRound,'+
   'search:location.search}))()');}
  catch{return false;}
 },100000);
 if(realFullRound.ready!=='READY'||
  realFullRound.mode!=='REAL_180S_SOURCE_PLAY'||
  realFullRound.search!=='?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound')
  fail('B335_FULL_ROUND_NEW_WORLD_IDENTITY_UNVERIFIED');
 const boot=verifyAuthority(await snapshot());
 if(boot.matchState!=='STAGING'||!boot.paused||
  boot.timeRemainingSeconds!==180||boot.tick!==0||
  await read('document.querySelector("#t21-f3-b202-real-pause")?.dataset.t21B202NativeState')!=='READY_TO_START')
  fail('REAL_USER_180S_READY_NOT_PROVEN');
 await clickButton('#t21-f3-b202-resume');
 await wait(()=>read('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const start=await wait(async()=>{
  const n=verifyAuthority(await snapshot());
  return n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7?n:false;
 },12*60*1000);
 // Parameter permits READ-ONLY original paint/foot ledger, not QA authority.
 await read('(() => {const u=new URL(location.href);'+
  'u.searchParams.set("t21B312","genuineSecondHumanPaint");'+
  'history.replaceState(null,"",u.href);return true;})()');
 clockStart=Date.now();await record(180,start);
 await picture('B335_START');
 // Exactly one real short CDP human firing input, no pose or timer injection.
 await send('Input.dispatchMouseEvent',
  {type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
 await sleep(1250);
 await send('Input.dispatchMouseEvent',
  {type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
 for(const milestone of [150,120,90,60,30,0]){
  const n=await wait(async()=>{
   const v=verifyAuthority(await snapshot());
   return v.timeRemainingSeconds<=milestone+.001?v:false;
  },9*60*1000);
  await record(milestone,n);
  if(milestone===90)await picture('B335_MID');
 }
 const final=verifyAuthority(await snapshot());
 if(final.matchState!=='TIME_UP'||final.timeRemainingSeconds!==0)
  fail('REAL_TIME_UP_NOT_OBSERVED');
 await picture('B335_TIME_UP');
 const verdict=b335VerifyNativeRound(proof);
 writeFileSync(resolve(DIR,'b335-driver-verdict.json'),
  JSON.stringify(verdict,null,2));
 console.log('B335_REAL_180S_TIME_UP',JSON.stringify(verdict));
}
try{await run();}
catch(error){console.error(error);process.exitCode=1;store();}
finally{
 try{socket?.close();}catch{}
 for(const child of children)child.kill('SIGTERM');
}
