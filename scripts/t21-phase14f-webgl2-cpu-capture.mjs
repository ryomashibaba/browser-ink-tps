#!/usr/bin/env node
/** Chrome/CDP PlayCanvas WebGL2 capture, opt-in Phase14F CPU QA only.
 * Controlled intercept fixture; not proof of actual Recast-to-CPU trigger.
 * Never approves Visual Freeze or T21 runtime activation.
 */
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync, openSync, closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

const dir=process.env.T21_PHASE14F_SHOT_DIR||'/tmp/t21-phase14f-webgl2';
const origin='http://127.0.0.1:4184/browser-ink-tps/';
const pngSig=Buffer.from([137,80,78,71,13,10,26,10]);
const manifest={phase:'14F',status:'BLOCKED',generatedAt:new Date().toISOString(),
  renderer:'CHROME_PLAYCANVAS_WEBGL2',activationAuthorized:false,
  humanVisualFreezeApproved:false,realRecastTriggerValidatedInBrowser:false,
  screenshotData:[],error:null};
let socket=null,serial=0;
const pending=new Map(),children=[];
const err=e=>e instanceof Error?e.message:String(e);
const fail=s=>{throw Error('T21_PHASE14F_'+s);};
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
async function screenshot(side,frame,state){
 if(state?.phase14FOnly!==true||state.frame!==frame||state.renderer!=='webgl2'||
    state.activationAuthorized!==false||state.originalDropTriggerProvenInScene!==false||
    state.cpu?.length!==2||state.paintRequests!==0||state.shootingRequests!==0||
    state.tacticalRetargets!==0)fail('QA_STATE_OR_AUTHORITY_DRIFT');
 if(state.cpu.some(b=>!b.foot.every(Number.isFinite)||!b.visual.every(Number.isFinite)))
   fail('QA_NONFINITE_CPU_RENDER_POSITION');
 const shot=await cmd('Page.captureScreenshot',{
  format:'png',fromSurface:true,captureBeyondViewport:false
 },30000);
 const bytes=Buffer.from(shot.data||'','base64');
 verifyPng(bytes);
 const name='T21_PHASE14F_'+side+'_F'+frame+'.png';
 writeFileSync(resolve(dir,name),bytes);
 manifest.screenshotData.push({
  side,frame,file:name,sha256:createHash('sha256').update(bytes).digest('hex'),
  byteCount:bytes.length,physicalBodies:state.activePhysicalBodies,
  cpu:state.cpu,realWebGL2Screenshot:true,
  humanVisualApproval:false
 });
 console.log('PHASE14F_WEBGL2_CAPTURE '+name+' '+bytes.length);
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
  '--remote-debugging-port=9238','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-phase14f-cdp-profile','about:blank'
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
 const states=[];
 for(const side of ['positive-z','negative-z']){
  await cmd('Page.navigate',{url:origin+'?t21Qa=phase14f&qaSide='+side});
  await poll(async()=>{
   const r=await evalPage('({ready:document.querySelector("#app-canvas")?.dataset.t21Phase14fReady, backend:document.querySelector("#app-canvas")?.dataset.t21Phase14fRenderer, side:document.querySelector("#app-canvas")?.dataset.t21Phase14fSide, error:document.querySelector("#boot-error")?.textContent||"", panel:!!document.querySelector("#t21-phase14f-panel"), width:document.querySelector("#app-canvas")?.width, height:document.querySelector("#app-canvas")?.height})');
   if(r.error)fail('BOOT_ERROR '+r.error.slice(0,1200));
   return r.ready==='READY'&&r.backend==='webgl2'&&r.side===side&&r.panel&&
    r.width===1600&&r.height===900;
  });
  let last=0;const shots=[];
  for(const frame of [0,12,40]){
   const state=await evalPage('window.__t21Phase14F.advance('+(frame-last)+')');
   if(frame===0&&state.activePhysicalBodies!==2)fail('MISSING_TWO_REAL_RAPIER_BRIDGES');
   if(frame===12&&state.cpu.some(b=>b.state!=='FIRST_DROP_FALL'))
    fail('CPU_FALL_ENDED_BEFORE_PHYSICAL_FRAME12');
   if(frame===40&&(state.activePhysicalBodies!==0||
      state.cpu.some(b=>b.state!=='GROUND'||!b.hasCrowd)))
    fail('CPU_GROUND_NAV_RESUME_FAILED');
   await sleep(850);
   shots.push(await screenshot(side,frame,state));
   states.push({side,frame,footY:state.cpu.map(b=>b.foot[1])});
   last=frame;
  }
  const hashes=shots.map(b=>createHash('sha256').update(b).digest('hex'));
  if(new Set(hashes).size!==3)fail('SCREENSHOT_DUPLICATE_'+side);
  const first=states.find(x=>x.side===side&&x.frame===0);
  const end=states.find(x=>x.side===side&&x.frame===40);
  if(first.footY.some((y,i)=>!(y-end.footY[i]>4.3)))
    fail('NO_REAL_PHYSICAL_FOOT_DESCENT_'+side);
 }
 manifest.status='CAPTURED_PENDING_HUMAN_VISUAL_QA';
 console.log('PHASE14F_REAL_WEBGL2_GPU_CAPTURE_PASS',JSON.stringify({
  imageCount:manifest.screenshotData.length,frameStates:states
 }));
}
if(process.argv.includes('--self-test')){
 let rejected=false;try{verifyPng(Buffer.from('NOT_A_PNG'));}catch{rejected=true;}
 if(!rejected)fail('NEGATIVE_PNG_FALSE_PASS');
 console.log('PHASE14F_CAPTURE_NEGATIVE_SELFTEST_PASS');process.exit(0);
}
try{await run();}catch(e){manifest.error=err(e);console.error(e);process.exitCode=1;}
finally{
 mkdirSync(dir,{recursive:true});
 writeFileSync(resolve(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 try{socket?.close();}catch{}
 for(const child of children.reverse())try{child.kill('SIGKILL');}catch{}
}
