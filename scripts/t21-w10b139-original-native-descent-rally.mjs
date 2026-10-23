#!/usr/bin/env node
/** B139: real original 7-CPU game + physically walked lower-floor A1 ally trial. No time,
 * physics, ink, storage, source geometry or CPU configuration injection. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {sampleB140RealSourcePhysicalTrace} from './t21-w10b140-real-physics-sample.mjs';

const ROOT='http://127.0.0.1:4198/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-w10b139';
// B139: independent true-Chromium runs with identical real input; only
// the native source-backed A1 rally URL flag differs. Never the default.
const variant=process.env.T21_B139_VARIANT;
if(!['FIXED_DEFAULT','ALLY_RALLY'].includes(variant))
 throw Error('B139_EXPLICIT_VARIANT_REQUIRED');
const allyOptIn=variant==='ALLY_RALLY';
const children=[],pending=new Map(),history=[];
let socket=null,sequence=0;
const fail=reason=>{throw Error('B140_'+reason);};
const save=()=>writeFileSync(resolve(OUTPUT,'w10b139-progress.json'),
 JSON.stringify({sourceAuthority:'25/17/26/0',activationReady:false,
  unresolvedActors:8,naturalOpponentPaths:'0/12',history},null,2));
async function cmd(method,params={}){
 const id=++sequence;
 return new Promise((ok,no)=>{
  const timer=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT_'+method));},25000);
  pending.set(id,{ok:v=>{clearTimeout(timer);ok(v);},
   no:e=>{clearTimeout(timer);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION');
 return r.result?.value;
}
async function until(fn,ms=90000){
 const end=Date.now()+ms;
 while(Date.now()<end){const x=await fn();if(x)return x;await sleep(500);}
 fail('WAIT_TIMEOUT');
}
async function click(x,y){
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await cmd('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});
}
async function clickButton(selector){
 const p=await evaluate(`(() => {
  const b=document.querySelector(${JSON.stringify(selector)});
  if(!b||b.disabled||b.hidden)return null;
  b.scrollIntoView({block:'center',behavior:'instant'});
  const r=b.getBoundingClientRect();
  return {x:r.left+r.width/2,y:r.top+r.height/2};
 })()`);
 if(!p||p.x<0||p.x>1600||p.y<0||p.y>900)fail('BUTTON_NOT_VISIBLE');
 await click(p.x,p.y);
}
const snapshot=()=>evaluate('window.__t21F3.snapshot()');
function authority(n,mode){
 if(n.stopReason||n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
    n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
    n.productionAuthorized!==false||n.unrestricted4v4Certified!==false||
    n.b64SourceInkSweep.enabled!==(mode==='SWEEP'))fail('SOURCE_AUTHORITY_OR_MODE');
}
async function picture(name){
 const bytes=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true})).data,'base64');
 if(bytes.length<10000||bytes.readUInt32BE(16)!==1600||
    bytes.readUInt32BE(20)!==900)fail('FRAMEBUFFER');
 writeFileSync(resolve(OUTPUT,name+'.png'),bytes);
}
const realKeys={
 KeyW:{key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87},
 KeyD:{key:'d',code:'KeyD',windowsVirtualKeyCode:68,nativeVirtualKeyCode:68}
};
async function nativeOriginalKeyboard(stage,observe){
 const pressed=new Set();
 const before=await snapshot();
 try {
  for(const name of stage.keys){
   await cmd('Input.dispatchKeyEvent',{type:'keyDown',...realKeys[name]});
   pressed.add(name);
  }
  return await until(async()=>{
   const n=await snapshot();authority(n,'FIXED');
   if(n.cpu.physicalFootRelocations!==0)fail('UNAUTHORIZED_CPU_PHYSICAL_RELOCATION');
   observe(n,stage.name);
   return n.tick>=before.tick+stage.ticks?n:false;
  },12*60*1000);
 }finally{
  for(const key of pressed)
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...realKeys[key]});
 }
}
async function doPhysicalTrial(){
 const boot=await snapshot();authority(boot,'FIXED');
 if(boot.matchState!=='STAGING'||boot.paused||
    boot.cpu.sourcePatrol.b137AllyRallyOptIn!==allyOptIn||
    boot.b112OriginalHumanGround?.enabled!==true)
  fail('NOT_REAL_ORIGINAL_7CPU_KCC_BOOT');
 const search=await evaluate('location.search');
 if(search!==('?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
   (allyOptIn?'&t21W10B137=allyRally':'')))
  fail('INVALID_SOURCE_PRACTICE_URL');
 await click(800,450);
 await until(()=>evaluate('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const started=boot.tick;
 const nativeGameStart=await until(async()=>{
  const n=await snapshot();authority(n,'FIXED');
  if(n.cpu.physicalFootRelocations!==0)fail('ORIGINAL_CPU_FOOT_MOVED_BY_QA');
  return n.matchState==='PLAYING'&&n.cpu.physicalRejoins.length===7&&
    n.cpu.freeCombatEnabled?n:false;
 },12*60*1000);
 const steps=[
  // B120/B123 pre-existing authentic original-source descent: real
  // PlayCanvas camera-relative CDP inputs, never snap or position set.
  {name:'TRUE_SOURCE_FIRST_DROP_W200',keys:['KeyW'],ticks:200},
  {name:'TRUE_SOURCE_LOWER_LANDING_D12',keys:['KeyD'],ticks:12},
  {name:'TRUE_SOURCE_LOWER_FORWARD_W18',keys:['KeyW'],ticks:18}
 ];
 let lastSampleTick=-1000;
 const routeWitness=[];
 const observe=(n,phase,force=false)=>{
  if(force||n.tick-lastSampleTick>=12){
   lastSampleTick=n.tick;
   const sample=sampleB140RealSourcePhysicalTrace(n,phase);
   routeWitness.push(sample);
   history.push(sample);
   if(history.length%12===0)save();
  }
 };
 observe(nativeGameStart,'REAL_7_OF_7_PLAYING',true);
 // B141: verify the actual opt-in on-screen physical distance indicator
 // in a real WebGL2/pointer-locked browser. The UI remains a pure view:
 // no original route, target, player pose or actor state is manipulated.
 const b141Observed=await until(async()=>{
  const hud=await evaluate(`(() => {
   const el=document.querySelector('#t21-f3-b141-real-ally');
   return el?{visible:!el.hidden&&el.style.display!=='none',
    sourceOnly:el.dataset.t21B141PhysicalOnly,
    scoreable:el.dataset.t21B141Scoreable,
    routeCertified:el.dataset.t21B141CertifiedRoute,
    state:el.dataset.t21B141State,text:el.textContent}:null;
  })()`);
  if(!allyOptIn)return hud===null?{normalFixedNoAllyHud:true}:false;
  return hud?.visible&&hud.sourceOnly==='REAL_RAPIER_AND_KCC'&&
   hud.scoreable==='0'&&hud.routeCertified==='false'&&
   hud.text?.includes('A1')&&hud.state!=='WAITING_7_CPU'?hud:false;
 },40000);
 history.push({b141ActualPointerLockedSourceHud:b141Observed,realNativeTick:nativeGameStart.tick});
 save();
 const beforeMove=await snapshot();
 let firstMouseRelease=false;
 for(const phase of steps){
  if(phase.name==='TRUE_SOURCE_FIRST_DROP_W200'){
   const shotsBefore=(await snapshot()).shotsFired;
   await cmd('Input.dispatchMouseEvent',
    {type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
   const pressStart=await snapshot();
   const untilShot=await until(async()=>{
    const n=await snapshot();authority(n,'FIXED');
    observe(n,'REAL_MOUSE_WITH_WALK');
    return n.tick>=pressStart.tick+33?n:false;
   },100000);
   await cmd('Input.dispatchMouseEvent',
    {type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
   firstMouseRelease=true;
   if(untilShot.shotsFired<=shotsBefore)
    fail('REAL_MOUSE_POINTERLOCK_SHOTS_REQUIRED');
   // The real 33-tick mouse pulse occurs before the W key goes down:
   // keep the complete preverified W200 physical source-descent program.
   // No 167-tick shortening, synthetic game tick, or input substitution.
  }
  const n=await nativeOriginalKeyboard(phase,observe);
  observe(n,phase.name+'_END',true);
 }
 if(!firstMouseRelease)fail('REAL_MOUSE_NOT_RELEASED');
 const routeEnd=await snapshot();
 const continuedUntil=routeEnd.tick+900;
 const settleStart=Date.now();
 let lastTick=routeEnd.tick,lastAdvanceAt=Date.now();
 while(Date.now()-settleStart<25*60*1000){
  await sleep(800);
  const n=await snapshot();authority(n,'FIXED');
  if(n.cpu.physicalFootRelocations!==0)fail('CPU_POSITION_RELOCATION');
  if(n.tick>lastTick){lastAdvanceAt=Date.now();lastTick=n.tick;}
  else if(Date.now()-lastAdvanceAt>90000)
   fail('PHYSICS_NOT_ADVANCING');
  observe(n,'REAL_NATIVE_CPU_A1_FOLLOWUP');
  if(n.tick>=continuedUntil||n.matchState==='TIME_UP')break;
 }
 const final=await snapshot();authority(final,'FIXED');
 observe(final,'FINAL_REAL_SOURCE',true);
 const approved=final.cpu.sourcePatrol.b137ApprovedNativeRallies;
 if(!allyOptIn&&approved!==0)fail('FIXED_SOURCE_GOAL_CONTAMINATED');
 await picture('w10b139-'+variant.toLowerCase()+'-source-physics');
 const meaningful=routeWitness.filter(x=>x.actualHumanKccGrounded&&
  x.actualA1RapierFoot?.length===3&&
  x.actualHumanKccBody[2]>=33).length;
 const evidence={
  schema:'W10_B139_TRUE_ORIGINAL_REAL_CHROME_SOURCE_DESCENT_ALLY_V1',
  variant,
  nativeGameStartedOnlyAfterSevenPhysicalCpuRejoins:true,
  initialRealNativeTick:started,
  nativePlayingTick:nativeGameStart.tick,
  startBeforeRealInputTick:beforeMove.tick,
  actualPhysicalSourceRouteProgram:steps,
  originalB141VisibleAllyUiEvidence:b141Observed,
  endNativeTick:final.tick,
  originalSource:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalOppositeSideNaturalPaths:'0/12',
  original4v4Certified:false,activationReady:false,productionAuthorized:false,
  normalFixedPatrolUnmodified:true,
  originalPhysicalCpuRejoins:final.cpu.physicalRejoins,
  cpuFootRelocations:final.cpu.physicalFootRelocations,
  sourceAllyNativeGoalApprovals:approved,
  realOriginalSupportedGroundSamples:meaningful,
  interpretation:approved>0?
   'NATIVE_SOURCE_ALLY_DESTINATION_APPROVED_NOT_PHYSICAL_ARRIVAL':
   'HOLD_ORIGINAL_SOURCE_ALLY_DESTINATION_NOT_APPROVED',
  actualHumanAndA1RapierFootSamples:routeWitness,
  finalNativePatrol:final.cpu.sourcePatrol,
  physicalRallyCompletionCertified:false,
  formalOriginal4v4Certified:false
 };
 writeFileSync(resolve(OUTPUT,'w10b139-'+variant.toLowerCase()+'.json'),
  JSON.stringify(evidence,null,2));
 console.log('B139_REAL_SOURCE_7CPU_KCC_ALLY_COMPARISON',JSON.stringify({
  variant,playingTick:nativeGameStart.tick,
  originalRealInputStages:steps.map(x=>x.name),
  finalTick:final.tick,physicalCpuRejoins:final.cpu.physicalRejoins.length,
  genuineGroundSupportSamples:meaningful,sourceAllyGoalApprovals:approved,
  interpretation:evidence.interpretation,formal4v4Hold:true
 }));
}
async function run(){
 mkdirSync(OUTPUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||['google-chrome-stable','google-chrome','chromium']
  .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_REQUIRED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4198','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await until(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars','--remote-debugging-port=9258',
  '--remote-allow-origins=*','--user-data-dir=/tmp/t21-w10b81-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9258/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});
  socket.addEventListener('error',no,{once:true});});
 socket.addEventListener('message',event=>{
  const r=JSON.parse(String(event.data)),p=pending.get(r.id);
  if(!p)return;pending.delete(r.id);r.error?p.no(Error(JSON.stringify(r.error))):p.ok(r.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
   (allyOptIn?'&t21W10B137=allyRally':'')});
 const ready=()=>until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),100000);
 await ready();
 await doPhysicalTrial();
}
try{await run();}catch(err){console.error(err);process.exitCode=1;}
finally{socket?.close();for(const child of children)child.kill('SIGTERM');}
