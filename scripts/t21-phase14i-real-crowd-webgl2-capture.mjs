#!/usr/bin/env node
/** Chrome/CDP PlayCanvas WebGL2 capture of TRUE Phase14I Recast-triggered CPU falls.
 * No artificial adapter.observe. Genuine original Crowd -> KCC -> Crowd.
 * Never approves Visual Freeze or T21 runtime activation.
 */
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync, openSync, closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

const dir=process.env.T21_PHASE14I_SHOT_DIR||'/tmp/t21-phase14i-webgl2';
const origin='http://127.0.0.1:4184/browser-ink-tps/';
const pngSig=Buffer.from([137,80,78,71,13,10,26,10]);
const manifest={phase:'14I',status:'BLOCKED',generatedAt:new Date().toISOString(),
  renderer:'CHROME_PLAYCANVAS_WEBGL2',activationAuthorized:false,
  humanVisualFreezeApproved:false,realRecastTriggerValidatedInBrowser:true,
  screenshotData:[],error:null};
let socket=null,serial=0;
const pending=new Map(),children=[];
const err=e=>e instanceof Error?e.message:String(e);
const fail=s=>{throw Error('T21_PHASE14I_'+s);};
async function poll(callback,timeout=45000){
 const start=Date.now();let last;
 while(Date.now()-start<timeout){
  try{const result=await callback();if(result)return result;}catch(e){last=e;}
  await sleep(250);
 }
 fail('TIMEOUT '+err(last));
}
async function cmd(method,params={},timeout=30000){
 if(!socket||socket.readyState!==WebSocket.OPEN)fail('CDP_SOCKET_UNAVAILABLE');
 const id=++serial;
 return new Promise((ok,no)=>{
  const deadline=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT '+method));},timeout);
  pending.set(id,{ok(value){clearTimeout(deadline);ok(value);},
    no(e){clearTimeout(deadline);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evalPage(expression){
 const answer=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(answer.exceptionDetails)fail('BROWSER_JS_EXCEPTION '+JSON.stringify(answer.exceptionDetails).slice(0,700));
 return answer.result?.value;
}
function verifyPng(bytes){
 if(bytes.length<8000||!bytes.subarray(0,8).equals(pngSig)||
    bytes.readUInt32BE(16)!==1600||bytes.readUInt32BE(20)!==900)
   fail('REAL_BROWSER_PNG_INVALID');
}
async function screenshot(side,tag,state){
 if(state?.phase!=='14I'||state.mode!=='REAL_RECAST_CROWD_UNFORCED'||
    state.renderer!=='webgl2'||state.activationAuthorized!==false||
    state.humanVisualFreezeApproved!==false||state.sourceGeometryPromoted!==false||
    state.stageId!=='undertow-t21d-partial-connectivity-qa'||
    state.cpu?.length!==2||state.paintRequests!==0||state.shootingRequests!==0)
    fail('QA_STATE_OR_AUTHORITY_DRIFT');
 if(state.cpu.some(b=>!b.foot.every(Number.isFinite)||
    !b.visual.every(Number.isFinite)||b.deltaMeters>.60))
    fail('CPU_TRANSFORM_MOTION_DISCONTINUITY');
 const shot=await cmd('Page.captureScreenshot',{
  format:'png',fromSurface:true,captureBeyondViewport:false
 },30000);
 const bytes=Buffer.from(shot.data||'','base64');
 verifyPng(bytes);
 const name='T21_PHASE14I_'+side+'_'+tag+'_F'+state.frame+'.png';
 writeFileSync(resolve(dir,name),bytes);
 manifest.screenshotData.push({
  side,tag,frame:state.frame,file:name,
  sha256:createHash('sha256').update(bytes).digest('hex'),
  byteCount:bytes.length,physicalBodies:state.activeRapierBodies,
  cpu:state.cpu,transitions:state.transitions,
  realUnforcedRecastCrowd:true,realWebGL2Screenshot:true,
  humanVisualApproval:false
 });
 console.log('PHASE14I_REAL_WEBGL2_CAPTURE '+name+' '+bytes.length);
 return bytes;
}

async function run(){
 mkdirSync(dir,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(name=>{try{execFileSync('which',[name],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_NOT_FOUND');
 const preview=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4184',
  '--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(preview);
 await poll(async()=>{const r=await fetch(origin);return r.ok;},25000);
 const html=await(await fetch(origin)).text();
 const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(m=>m[1]).filter(s=>s.startsWith('/browser-ink-tps/assets/'));
 if(assets.length<2)fail('ASSET_PATHS_MISSING');
 for(const path of assets){
  const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(7000)});
  if(!response.ok||(response.headers.get('content-type')||'').includes('text/html'))
   fail('BAD_ASSET_RESPONSE '+path);
 }
 const log=openSync(resolve(dir,'chrome.log'),'w');
 const child=spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--disable-background-networking',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9241','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-phase14i-cdp-profile','about:blank'
 ],{stdio:['ignore',log,log]});closeSync(log);children.push(child);
 const tab=await poll(async()=>{
  if(child.exitCode!==null||child.signalCode!==null)fail('CHROME_EXITED');
  const res=await fetch('http://127.0.0.1:9238/json',{signal:AbortSignal.timeout(2500)});
  const list=await res.json();
  return list.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});
   socket.addEventListener('error',no,{once:true});}),
  sleep(10000).then(()=>{throw Error('CDP_CONNECT_TIMEOUT');})
 ]);
 socket.addEventListener('message',event=>{
  const data=JSON.parse(String(event.data)),item=pending.get(data.id);
  if(!item)return;pending.delete(data.id);
  if(data.error)item.no(Error(JSON.stringify(data.error)));else item.ok(data.result||{});
 });
 socket.addEventListener('close',()=>{for(const p of pending.values())
  p.no(Error('CDP_SOCKET_CLOSED'));pending.clear();});
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false
 });
 const results=[];
 for(const side of ['positive-z','negative-z']){
  const id=side==='positive-z'?'A1':'B1';
  await cmd('Page.navigate',{url:origin+'?t21Qa=phase14i&qaSide='+side});
  await poll(async()=>{
   const r=await evalPage('({ready:document.querySelector("#app-canvas")?.dataset.t21Phase14iReady, backend:document.querySelector("#app-canvas")?.dataset.t21Phase14iRenderer, side:document.querySelector("#app-canvas")?.dataset.t21Phase14iSide, error:document.querySelector("#boot-error")?.textContent||"", panel:!!document.querySelector("#t21-phase14i-panel"), width:document.querySelector("#app-canvas")?.width, height:document.querySelector("#app-canvas")?.height})');
   if(r.error)fail('BOOT_ERROR '+r.error.slice(0,1200));
   return r.ready==='READY'&&r.backend==='webgl2'&&r.side===side&&r.panel&&
    r.width===1600&&r.height===900;
  },60000);
  const initial=await evalPage('window.__t21Phase14I.snapshot()');
  if(initial.frame!==0||initial.transitionCount!==0||initial.activeRapierBodies!==0)
    fail('REAL_CROWD_SCENE_WAS_PRE_TRIGGERED');
  const shots=[];
  shots.push(await screenshot(side,'0_CROWD_START',initial));
  const trigger=await evalPage('window.__t21Phase14I.advanceUntil("'+id+'","FIRST_DROP_FALL",300)');
  const events=trigger.transitions.filter(t=>t.id===id);
  if(events.length!==1||events[0].physical!==true||
     !(events[0].rawStepMeters>.5)||trigger.activeRapierBodies<1)
    fail('UNFORCED_RECAST_OFFMESH_NOT_CAPTURED_'+side);
  shots.push(await screenshot(side,'1_RECAST_TRIGGER',trigger));
  const falling=await evalPage('window.__t21Phase14I.advance(12)');
  const b=state=>state.cpu.find(c=>c.id===id);
  if(b(falling)?.state!=='FIRST_DROP_FALL'||
     !(b(trigger).foot[1]-b(falling).foot[1]>.3))
    fail('REAL_RAPIER_DROP_NOT_OBSERVED_'+side);
  shots.push(await screenshot(side,'2_PHYSICAL_FALL',falling));
  const rejoin=await evalPage('window.__t21Phase14I.advanceUntil("'+id+'","FIRST_DROP_REJOIN",85)');
  if(b(rejoin)?.hasCrowd!==true||!(b(rejoin).foot[1]<3.3)||
     rejoin.transitions.filter(t=>t.id===id).length!==1)
    fail('REAL_LANDED_CROWD_REJOIN_MISSING_'+side);
  shots.push(await screenshot(side,'3_REJOIN_QUARANTINE',rejoin));
  const ground=await evalPage('window.__t21Phase14I.advanceUntil("'+id+'","GROUND",70)');
  if(b(ground)?.hasCrowd!==true||!(Math.abs(b(ground).foot[1]-3.1)<.2)||
     b(ground).deltaMeters>.6)
    fail('STABLE_SOURCE_LOWER_LAYER_REJOIN_MISSING_'+side);
  shots.push(await screenshot(side,'4_LOWER_NAV_REATTACHED',ground));
  const resumed=await evalPage('window.__t21Phase14I.advance(12)');
  if(b(resumed)?.state!=='GROUND'||resumed.tacticalRetargets<=ground.tacticalRetargets)
    fail('CPU_TACTICAL_THINK_NOT_RESUMED_'+side);
  shots.push(await screenshot(side,'5_TACTICAL_AI_RESUMED',resumed));
  if(new Set(shots.map(x=>createHash('sha256').update(x).digest('hex'))).size!==6)
    fail('REAL_CHROME_FRAMES_IDENTICAL_'+side);
  const evidence={side,id,triggerFrame:events[0].frame,rawStepMeters:events[0].rawStepMeters,
    frames:{trigger:trigger.frame,physical:falling.frame,rejoin:rejoin.frame,
      ground:ground.frame,resume:resumed.frame},physicalFootY:b(rejoin).foot[1],
    groundedFootY:b(ground).foot[1],maxVisualStepMeters:b(resumed).deltaMeters,
    verifiedTacticalRetargets:resumed.tacticalRetargets-ground.tacticalRetargets,
    noSyntheticObserve:true};
  results.push(evidence);
  console.log('PHASE14I_REAL_CROWD_SIDE_PASS',JSON.stringify(evidence));
 }

 manifest.status='CAPTURED_PENDING_HUMAN_VISUAL_QA';
 console.log('PHASE14I_REAL_RECAST_WEBGL2_GPU_CAPTURE_PASS',JSON.stringify({
  imageCount:manifest.screenshotData.length,results
 }));
}
if(process.argv.includes('--self-test')){
 let rejected=false;try{verifyPng(Buffer.from('NOT_A_PNG'));}catch{rejected=true;}
 if(!rejected)fail('NEGATIVE_PNG_FALSE_PASS');
 console.log('PHASE14I_CAPTURE_NEGATIVE_SELFTEST_PASS');process.exit(0);
}
try{await run();}catch(e){manifest.error=err(e);console.error(e);process.exitCode=1;}
finally{
 mkdirSync(dir,{recursive:true});
 writeFileSync(resolve(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 try{socket?.close();}catch{}
 for(const child of children.reverse())try{child.kill('SIGKILL');}catch{}
}
