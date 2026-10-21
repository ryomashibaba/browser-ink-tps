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
const children=[],pending=new Map(),history=[];
let socket=null,sequence=0;
const fail=reason=>{throw Error('B81_'+reason);};
const save=()=>writeFileSync(resolve(OUTPUT,'w10b81-progress.json'),
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
 if(boot.matchState!=='STAGING'||boot.paused)fail('FRESH_NATIVE_STAGING_REQUIRED');
 const route=await evaluate('location.search');
 if(route!==(mode==='FIXED'?'?t21Play=preview':
  '?t21Play=preview&t21W10B68=previewSweep'))fail('NORMAL_PREVIEW_ONLY');
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
    realCpuRejoins:n.cpu.physicalRejoins.length};
   history.push(row);save();console.log('B81_NATIVE_HEARTBEAT',JSON.stringify(row));
   reported=Date.now();
  }
  if(n.matchState==='TIME_UP'){
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
   await picture('w10b81-'+mode+'-180s');return result;
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
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'});
 const ready=()=>until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),100000);
 await ready();
 if(await storage()!==null)fail('CLEAN_TAB_REQUIRED');
 const fixed=await finishRound('FIXED');
 if(await storage()!==null)fail('AUTOMATIC_SAVE_FORBIDDEN');
 await clickButton('#t21-f3-b70-save-compare');
 await until(()=>evaluate(`location.search==='?t21Play=preview&t21W10B68=previewSweep'&&
  window.__t21F3?.snapshot?.().matchState==='STAGING'`));
 await ready();
 const firstRaw=await storage();auditB81Storage(firstRaw,{fixed});
 history.push({event:'FIRST_EXPLICIT_CLICK_SAVED_FIXED_RELOADED_SWEEP',fixed});save();
 const sweep=await finishRound('SWEEP');
 if(await storage()!==firstRaw)fail('SWEEP_SAVED_WITHOUT_CLICK');
 await clickButton('#t21-f3-b70-save-compare');
 const ui=await until(()=>evaluate(`(() => {
  const c=document.querySelector('#t21-f3-b70-owner-local-aim-comparison');
  const p=document.querySelector('#t21-f3-b70-comparison');
  if(c?.dataset.t21B70Stage!=='TWO_REAL_COMPLETED_ROUNDS')return null;
  p.scrollIntoView({block:'center',behavior:'instant'});
  const f=document.querySelector('#t21-f3-b59-session-finished');
  const r=p.getBoundingClientRect();
  return {stage:c.dataset.t21B70Stage,fixed:c.dataset.t21B70StoredFixed,
   sweep:c.dataset.t21B70StoredSweep,text:p.textContent,
   visible:!p.hidden&&!f.hidden&&r.height>0&&r.top>=0&&r.bottom<=900,
   disabled:document.querySelector('#t21-f3-b70-save-compare').disabled,search:location.search};
 })()`));
 const raw=await storage();
 const comparison=auditB81Comparison(ui,raw,{fixed,sweep});
 authority(await snapshot(),'SWEEP');
 await picture('w10b81-two-real-rounds-comparison');
 // Refresh comparison is idempotent and does not silently start a new match.
 await clickButton('#t21-f3-b70-save-compare');
 if(await storage()!==raw||(await snapshot()).matchState!=='TIME_UP')fail('REFRESH_CHANGED_ROUND');
 await clickButton('#t21-f3-b70-clear-comparison');
 if(await storage()!==null||!await evaluate(`document.querySelector('#t21-f3-b70-comparison').hidden`))
  fail('CLEAR_NOT_EFFECTIVE');
 const proof={verdict:'B81_TWO_REAL_NATIVE_180S_SAME_TAB_COMPARISON_PASS',
  fixed,sweep,comparison,ui,physicalSaveClicks:2,explicitClearVerified:true,
  sourceAuthority:'25/17/26/0',
  unresolvedActorBindings:8,naturalOpponentPaths:'0/12',activationReady:false,
  windowsHardwareGpuCertified:false};
 writeFileSync(resolve(OUTPUT,'w10b81-comparison.json'),JSON.stringify(proof,null,2));
 console.log('B81_TWO_NATIVE_ROUNDS_PASS',JSON.stringify(proof));
}
try{await run();}catch(err){console.error(err);process.exitCode=1;}
finally{socket?.close();for(const child of children)child.kill('SIGTERM');}
