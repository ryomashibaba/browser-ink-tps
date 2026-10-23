#!/usr/bin/env node
/** Two uninterrupted render-driven 180s sessions in ONE tab. No time,
 * physics, ink, storage, source geometry or CPU configuration injection. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {captureB70Round,auditB81Storage,auditB81Comparison}
 from './t21-w10b81-comparison-witness.mjs';
import {b80ClassifyNativeStall} from './t21-w10b80-native-stall-classifier.mjs';

const ROOT='http://127.0.0.1:4198/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-w10b81';
const STORAGE='T21_B70_OPT_IN_SOURCE_CPU_AIM_ROUNDS_V1';
// B138: independent true-Chromium runs with identical real input; only
// the native source-backed A1 rally URL flag differs. Never the default.
const variant=process.env.T21_B138_VARIANT;
if(!['FIXED_DEFAULT','ALLY_RALLY'].includes(variant))
 throw Error('B138_EXPLICIT_VARIANT_REQUIRED');
const allyOptIn=variant==='ALLY_RALLY';
const children=[],pending=new Map(),history=[];
let socket=null,sequence=0;
const fail=reason=>{throw Error('B81_'+reason);};
const save=()=>writeFileSync(resolve(OUTPUT,'w10b138-progress.json'),
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
const storage=()=>evaluate(`sessionStorage.getItem('${STORAGE}')`);
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
async function finishRound(mode){
 const boot=await snapshot();authority(boot,mode);
 if(boot.matchState!=='STAGING'||boot.paused||
   boot.cpu?.sourcePatrol?.b137AllyRallyOptIn!==allyOptIn)
  fail('B138_REAL_NATIVE_STAGING_AND_RALLY_FLAG_REQUIRED');
 const route=await evaluate('location.search');
 if(mode!=='FIXED'||route!==('?t21Play=preview'+
   (allyOptIn?'&t21W10B137=allyRally':'')))
  fail('B138_ONLY_STANDARD_FIXED_OR_EXPLICIT_ALLY_RALLY_ALLOWED');
 await click(800,450);
 await until(()=>evaluate('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const start=await snapshot();
 const keys={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...keys});
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
 await until(async()=>{const n=await snapshot();authority(n,mode);return n.tick>=start.tick+33;});
 await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
 await cmd('Input.dispatchKeyEvent',{type:'keyUp',...keys});
 const played=await snapshot();
 if(played.shotsFired<=start.shotsFired||
    played.b23HumanInkFeedback.humanChangedCells<=start.b23HumanInkFeedback.humanChangedCells)
  fail('REAL_HUMAN_PAINT_REQUIRED');
 const began=Date.now();let progressed=began,reported=0;
 let previous={tick:played.tick,renderFrames:played.sourceFrameQuality.liveUpdateFrames};
 while(Date.now()-began<62*60*1000){
  await sleep(800);
  const n=await snapshot();authority(n,mode);
  const browser=await evaluate(`({visibilityState:document.visibilityState,
   hasFocus:document.hasFocus(),pointerLocked:!!document.pointerLockElement})`);
  const current={tick:n.tick,renderFrames:n.sourceFrameQuality.liveUpdateFrames,
   paused:n.paused,matchState:n.matchState,stop:n.stopReason,...browser};
  if(current.tick>previous.tick)progressed=Date.now();
  const classification=b80ClassifyNativeStall(previous,current,Date.now()-progressed);
  if(Date.now()-reported>=20000||n.matchState==='TIME_UP'){
   const row={mode,wallMs:Date.now()-began,...current,classification,
    elapsedSeconds:180-n.timeRemainingSeconds,
    cpuSourceShots:n.cpuSourceTurfShots,cpuChangedCells:n.cpuImpactInkCellsChanged,
    realCpuRejoins:n.cpu.physicalRejoins.length,
     // Dynamic read-only physics evidence, not a Recast HUMAN proxy or
     // a new original Actor/Face export.
     realA1RapierFoot:n.cpu.cpu.find(x=>x.id==='A1')?.physicalFoot,
     realHumanKccBody:n.player.position,
     b137CandidateChecks:n.cpu.sourcePatrol.b137RealCandidateChecks,
     b137NativeApprovals:n.cpu.sourcePatrol.b137ApprovedNativeRallies,
     b137RouteDenials:n.cpu.sourcePatrol.b137UnsafeOrUnsupportedRallies,
     b137MissingSourceSupport:n.cpu.sourcePatrol.b137MissingSourceFloorProof,
     playerShots:n.shotsFired,
     humanPaintCells:n.b23HumanInkFeedback.humanChangedCells};
   history.push(row);save();console.log('B81_NATIVE_HEARTBEAT',JSON.stringify(row));
   reported=Date.now();
  }
  if(n.matchState==='TIME_UP'){
    if(n.cpu.physicalRejoins.length!==7||
       n.cpu.physicalFootRelocations!==0||
       n.cpu.sourcePatrol.b137AllyRallyOptIn!==allyOptIn)
     fail('B138_SEVEN_REAL_REJOINS_NO_WARP_AND_FLAG_REQUIRED');
    const result=captureB70Round(mode,n);
   if(result.cpuSourceShots<=0||result.cpuImpactInkChangedCells<=0)fail('CPU_REAL_PAINT_REQUIRED');
   await until(()=>evaluate(`(() => {
    const f=document.querySelector('#t21-f3-b59-session-finished');
    const b=document.querySelector('#t21-f3-b70-save-compare');
    return f&&!f.hidden&&f.dataset.t21B59State==='FINISHED'&&
     f.dataset.t21B59OriginalWinner==='NONE'&&f.dataset.originalScoreable==='0'&&
     f.dataset.t21B62NativeEvidenceReady==='REAL_180S_READY'&&b&&!b.disabled&&
     document.pointerLockElement===null&&window.__t21F3.snapshot().paused;
   })()`),30000);
   await picture('w10b138-'+variant.toLowerCase()+'-180s');return result;
  }
  if(Date.now()-progressed>=90000||current.tick<previous.tick||
     current.renderFrames<previous.renderFrames)fail('NATIVE_STALL_'+classification);
  previous=current;
 }
 fail('NATIVE_180S_HOST_BUDGET');
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
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'+
   (allyOptIn?'&t21W10B137=allyRally':'')});
 const ready=()=>until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),100000);
 await ready();
 const round=await finishRound('FIXED');
 const final=await snapshot();
 authority(final,'FIXED');
 if(final.matchState!=='TIME_UP'||final.cpu.physicalRejoins.length!==7||
    final.cpu.physicalFootRelocations!==0||
    final.cpu.sourcePatrol.b137AllyRallyOptIn!==allyOptIn)
  fail('B138_UNFINISHED_SOURCE_180S');
 const trace=history.filter(h=>h.realA1RapierFoot?.length===3&&
   h.realHumanKccBody?.length===3).map(h=>({
    realTick:h.tick,actualMatchSeconds:h.elapsedSeconds,
    actualA1RapierFoot:h.realA1RapierFoot,
    actualHumanKccBody:h.realHumanKccBody,
    actualXZSeparationMeters:Math.hypot(
     h.realA1RapierFoot[0]-h.realHumanKccBody[0],
     h.realA1RapierFoot[2]-h.realHumanKccBody[2]),
    b137SourceNativeGoalsApproved:h.b137NativeApprovals,
    b137NativeCandidateChecks:h.b137CandidateChecks,
    b137SourcePathRefusals:h.b137RouteDenials,
    b137OriginalFloorNotEstablished:h.b137MissingSourceSupport,
    liveProjectilesFired:h.playerShots,
    humanRealPaintCells:h.humanPaintCells
   }));
 if(trace.length<2)fail('B138_NO_ACTUAL_PHYSICAL_TRACE');
 const approvals=final.cpu.sourcePatrol.b137ApprovedNativeRallies;
 if(!allyOptIn&&approvals!==0)fail('B138_FIXED_DEFAULT_HAS_RALLY_GOAL');
 const evidence={
  schema:'W10_B138_TRUE_CHROMIUM_RAPIER_A1_ALLY_AB_180S_V1',
  variant,realChromeWebGL2:true,realCDPMouseKeyboard:true,
  natural60HzSimulation:true,actual180sMatchEnd:true,
  testHasNoPositionMutation:true,noSyntheticPhysicsTick:true,
  sourceAuthority:'25_SOLIDS_17_PAINT_26_NAVLINK_0_SCOREABLE',
  liveOppositeSideOriginalPaths:'0/12',
  original4v4Certified:false,activationReady:false,
  productionAuthorized:false,
  actualPhysicalRejoins:final.cpu.physicalRejoins,
  physicalFootRelocations:final.cpu.physicalFootRelocations,
  realSourceAllyGoalsApproved:approvals,
  interpretation:approvals>0?
   'ORIGINAL_NAV_GOAL_APPROVAL_OBSERVED_NOT_RALLY_COMPLETION':
   'HOLD_NO_ORIGINAL_SOURCE_RALLY_GOAL_APPROVED',
  physicalRallyCompletedCertified:false,
  originalFixedPatrolStillDefault:true,
  realPhysicalHumanA1Trace:trace,
  original180sF3Match:round,
  originalNativePatrolAudit:final.cpu.sourcePatrol
 };
 writeFileSync(resolve(OUTPUT,'w10b138-'+variant.toLowerCase()+'.json'),
  JSON.stringify(evidence,null,2));
 console.log('B138_ORIGINAL_REAL_NATIVE_180S_A1_ALLY_AB',JSON.stringify({
  variant,nativeTick:final.tick,realSamples:trace.length,
  actualA1PhysicalRejoins:final.cpu.physicalRejoins.length,
  sourceAllyGoalsApproved:approvals,verdict:evidence.interpretation,
  noPhysicalRelocations:true,formal4v4Hold:true}));

}
try{await run();}catch(err){console.error(err);process.exitCode=1;}
finally{socket?.close();for(const child of children)child.kill('SIGTERM');}
