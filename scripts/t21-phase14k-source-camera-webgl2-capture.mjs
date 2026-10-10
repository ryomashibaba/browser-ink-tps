#!/usr/bin/env node
/** Chrome/CDP PlayCanvas WebGL2 capture of TRUE Phase14K Recast-triggered CPU falls with original source stage rendering.
 * No artificial adapter.observe. Genuine original Crowd -> KCC -> Crowd.
 * Never approves Visual Freeze or T21 runtime activation.
 */
import {spawn, execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {mkdirSync, writeFileSync, openSync, closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

const dir=process.env.T21_PHASE14K_SHOT_DIR||'/tmp/t21-phase14k-webgl2';
const origin='http://127.0.0.1:4184/browser-ink-tps/';
const pngSig=Buffer.from([137,80,78,71,13,10,26,10]);
const manifest={phase:'14K',status:'BLOCKED',generatedAt:new Date().toISOString(),
  renderer:'CHROME_PLAYCANVAS_WEBGL2',activationAuthorized:false,
  humanVisualFreezeApproved:false,realRecastTriggerValidatedInBrowser:false,
  screenshotData:[],error:null};
let socket=null,serial=0;
const pending=new Map(),children=[];
const err=e=>e instanceof Error?e.message:String(e);
const fail=s=>{throw Error('T21_PHASE14K_'+s);};
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
/** Actual Chrome PNG framebuffer: lossless scanline decoding, no mocked pixels.
 * Samples the CPU capsule's cyan/magenta pixels OUTSIDE the top-left HUD.
 * Rejects a blank review canvas, a frozen colored dot, and HUD-only changes.
 */
function measureCpuChromaticEvidence(png,side){
 verifyPng(png);
 let offset=8,width=0,height=0,channels=0,ended=false;
 const idat=[];
 while(offset+12<=png.length){
  const len=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8);
  if(len>30_000_000||offset+12+len>png.length)fail('CORRUPT_GPU_PNG_CHUNK');
  const piece=png.subarray(offset+8,offset+8+len);
  if(type==='IHDR'){
   width=piece.readUInt32BE(0);height=piece.readUInt32BE(4);
   channels=piece[9]===2?3:piece[9]===6?4:0;
   if(piece[8]!==8||piece[12]!==0||!channels)fail('UNSUPPORTED_GPU_PNG_MODE');
  }else if(type==='IDAT')idat.push(piece);
  else if(type==='IEND'){ended=true;break;}
  offset+=12+len;
 }
 if(!ended||idat.length===0||width!==1600||height!==900)
  fail('INCOMPLETE_GPU_PNG_DATA');
 const raw=inflateSync(Buffer.concat(idat),{maxOutputLength:20_000_000});
 const stride=width*channels;
 if(raw.length!==height*(stride+1))fail('GPU_PNG_SCANLINE_SIZE_DRIFT');
 const pixels=new Uint8Array(stride*height);
 let n=0,sumX=0,sumY=0;
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];
  if(filter>4)fail('UNSUPPORTED_GPU_PNG_FILTER');
  const row=y*stride,scan=y*(stride+1)+1;
  for(let i=0;i<stride;i++){
   const a=i>=channels?pixels[row+i-channels]:0;
   const b=y>0?pixels[row-stride+i]:0;
   const c=y>0&&i>=channels?pixels[row-stride+i-channels]:0;
   let p=0;
   if(filter===1)p=a;
   else if(filter===2)p=b;
   else if(filter===3)p=Math.floor((a+b)/2);
   else if(filter===4){
    const val=a+b-c,pa=Math.abs(val-a),pb=Math.abs(val-b),pc=Math.abs(val-c);
    p=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
   }
   pixels[row+i]=(raw[scan+i]+p)&255;
  }
  // Mask out UI overlay (top-left) and edges. Sample 1px every 4px.
  if(y<80||y>=850||y%4!==1)continue;
  for(let x=200;x<1550;x+=4){
   const idx=row+x*channels;
   const r=pixels[idx],g=pixels[idx+1],b=pixels[idx+2];
   const visible=side==='positive-z'
    ?g>105&&b>130&&g>r*1.5&&b>r*1.5
    :r>120&&b>90&&r>g*1.8&&b>g*1.7;
   if(visible){n++;sumX+=x;sumY+=y;}
  }
 }
 if(n<75)fail('CPU_NOT_VISIBLE_IN_REAL_GPU_PNG_'+side+'_PIXELS_'+n);
 return {sampledCpuPixels:n,centerX:sumX/n,centerY:sumY/n,
  actualFramebufferColor:side==='positive-z'?'cyan':'magenta'};
}
async function screenshot(side,tag,state){
 if(state?.phase!=='14K'||state.mode!=='REAL_RECAST_CROWD_UNFORCED'||
    state.renderer!=='webgl2'||state.activationAuthorized!==false||
    state.humanVisualFreezeApproved!==false||state.sourceGeometryPromoted!==false||
    state.stageId!=='undertow-t21d-partial-connectivity-qa'||
    state.cpu?.length!==2||state.paintRequests!==0||state.shootingRequests!==0||
    state.sourceContext?.inputSolids!==25||
    state.sourceContext?.renderedSolids<=0||
    state.sourceContext?.evidenceOnly!==true||
    state.sourceContext?.collisionModified!==false||
    state.sourceContext?.paintModified!==false||
    state.sourceContext?.activationAuthorized!==false||
    state.cameraAudit?.mode!=='SOURCE_RAPIER_CAMERA_QUERY'||
    !state.cameraAudit.position.every(Number.isFinite)||
    !state.cameraAudit.focus.every(Number.isFinite))
    fail('QA_STATE_OR_AUTHORITY_DRIFT');
 if(state.cpu.some(b=>!b.foot.every(Number.isFinite)||
    !b.visual.every(Number.isFinite)||b.deltaMeters>.60))
    fail('CPU_TRANSFORM_MOTION_DISCONTINUITY');
 const shot=await cmd('Page.captureScreenshot',{
  format:'png',fromSurface:true,captureBeyondViewport:false
 },30000);
 const bytes=Buffer.from(shot.data||'','base64');
 verifyPng(bytes);
 const cpuOptics=measureCpuChromaticEvidence(bytes,side);
 const name='T21_PHASE14K_'+side+'_'+tag+'_F'+state.frame+'.png';
 writeFileSync(resolve(dir,name),bytes);
 manifest.screenshotData.push({
  side,tag,frame:state.frame,file:name,
  sha256:createHash('sha256').update(bytes).digest('hex'),
  byteCount:bytes.length,physicalBodies:state.activeRapierBodies,
  cpu:state.cpu,transitions:state.transitions,cpuOptics,
  camera:state.cameraAudit,sourceContext:state.sourceContext,
  realUnforcedRecastCrowd:true,realWebGL2Screenshot:true,
  humanVisualApproval:false
 });
 console.log('PHASE14K_REAL_WEBGL2_CAPTURE '+name+' '+bytes.length);
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
  '--remote-debugging-port=9244','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-phase14k-cdp-profile','about:blank'
 ],{stdio:['ignore',log,log]});closeSync(log);children.push(child);
 const tab=await poll(async()=>{
  if(child.exitCode!==null||child.signalCode!==null)fail('CHROME_EXITED');
  const res=await fetch('http://127.0.0.1:9244/json',{signal:AbortSignal.timeout(2500)});
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
  await cmd('Page.navigate',{url:origin+'?t21Qa=phase14k&qaSide='+side});
  await poll(async()=>{
   const r=await evalPage('({ready:document.querySelector("#app-canvas")?.dataset.t21Phase14kReady, backend:document.querySelector("#app-canvas")?.dataset.t21Phase14kRenderer, side:document.querySelector("#app-canvas")?.dataset.t21Phase14kSide, error:document.querySelector("#boot-error")?.textContent||"", panel:!!document.querySelector("#t21-phase14k-panel"), width:document.querySelector("#app-canvas")?.width, height:document.querySelector("#app-canvas")?.height})');
   if(r.error)fail('BOOT_ERROR '+r.error.slice(0,1200));
   return r.ready==='READY'&&r.backend==='webgl2'&&r.side===side&&r.panel&&
    r.width===1600&&r.height===900;
  },60000);
  const initial=await evalPage('window.__t21Phase14K.snapshot()');
  if(initial.frame!==0||initial.transitionCount!==0||initial.activeRapierBodies!==0)
    fail('REAL_CROWD_SCENE_WAS_PRE_TRIGGERED');
  const shots=[];
  shots.push(await screenshot(side,'0_CROWD_START',initial));
  const trigger=await evalPage('window.__t21Phase14K.advanceUntil("'+id+'","FIRST_DROP_FALL",300)');
  const events=trigger.transitions.filter(t=>t.id===id);
  if(events.length!==1||events[0].physical!==true||
     !(events[0].rawStepMeters>.5)||trigger.activeRapierBodies<1)
    fail('UNFORCED_RECAST_OFFMESH_NOT_CAPTURED_'+side);
  shots.push(await screenshot(side,'1_RECAST_TRIGGER',trigger));
  const falling=await evalPage('window.__t21Phase14K.advance(12)');
  const b=state=>state.cpu.find(c=>c.id===id);
  if(b(falling)?.state!=='FIRST_DROP_FALL'||
     !(b(trigger).foot[1]-b(falling).foot[1]>.3))
    fail('REAL_RAPIER_DROP_NOT_OBSERVED_'+side);
  shots.push(await screenshot(side,'2_PHYSICAL_FALL',falling));
  const rejoin=await evalPage('window.__t21Phase14K.advanceUntil("'+id+'","FIRST_DROP_REJOIN",85)');
  if(b(rejoin)?.hasCrowd!==true||!(b(rejoin).foot[1]<3.3)||
     rejoin.transitions.filter(t=>t.id===id).length!==1)
    fail('REAL_LANDED_CROWD_REJOIN_MISSING_'+side);
  shots.push(await screenshot(side,'3_REJOIN_QUARANTINE',rejoin));
  const ground=await evalPage('window.__t21Phase14K.advanceUntil("'+id+'","GROUND",70)');
  if(b(ground)?.hasCrowd!==true||!(Math.abs(b(ground).foot[1]-3.1)<.2)||
     b(ground).deltaMeters>.6)
    fail('STABLE_SOURCE_LOWER_LAYER_REJOIN_MISSING_'+side);
  shots.push(await screenshot(side,'4_LOWER_NAV_REATTACHED',ground));
  const resumed=await evalPage('window.__t21Phase14K.advance(12)');
  if(b(resumed)?.state!=='GROUND'||resumed.tacticalRetargets<=ground.tacticalRetargets)
    fail('CPU_TACTICAL_THINK_NOT_RESUMED_'+side);
  shots.push(await screenshot(side,'5_TACTICAL_AI_RESUMED',resumed));
  if(new Set(shots.map(x=>createHash('sha256').update(x).digest('hex'))).size!==6)
    fail('REAL_CHROME_FRAMES_IDENTICAL_'+side);
  const views=manifest.screenshotData.filter(e=>e.side===side);
  const start=views.find(e=>e.tag==='0_CROWD_START');
  const middle=views.find(e=>e.tag==='2_PHYSICAL_FALL');
  const end=views.find(e=>e.tag==='4_LOWER_NAV_REATTACHED');
  const totalMove=Math.hypot(...[0,1,2].map(i=>
    end.camera.position[i]-start.camera.position[i]));
  const dropDelta=middle.camera.position[1]-end.camera.position[1];
  if(!start||!middle||!end||!(totalMove>1.5)||
     !Number.isFinite(dropDelta)||!(dropDelta>1.2))
    fail('SOURCE_CAMERA_DID_NOT_TRACK_REAL_PHYSICAL_CPU_'+side+'_'+
      JSON.stringify({totalMove,dropDelta}));
  for(const entry of views){
    if(!entry.camera||!entry.sourceContext||
       entry.sourceContext.inputSolids!==25)
      fail('MISSING_READ_ONLY_SOURCE_CAMERA_EVIDENCE');
  }
  const evidence={side,id,triggerFrame:events[0].frame,rawStepMeters:events[0].rawStepMeters,
    frames:{trigger:trigger.frame,physical:falling.frame,rejoin:rejoin.frame,
      ground:ground.frame,resume:resumed.frame},physicalFootY:b(rejoin).foot[1],
    groundedFootY:b(ground).foot[1],maxVisualStepMeters:b(resumed).deltaMeters,
    verifiedTacticalRetargets:resumed.tacticalRetargets-ground.tacticalRetargets,
    sourceRenderOnlySolids:resumed.sourceContext?.renderedSolids,
    sourceFootprintRectangles:resumed.sourceContext?.footprintRectangles,
    sourceTriangles:resumed.sourceContext?.triangleMeshTriangles,
    cameraTrackingMeters:totalMove,cameraHit:resumed.cameraAudit?.blockedBy,
    noSyntheticObserve:true};
  results.push(evidence);
  console.log('PHASE14K_REAL_CROWD_SIDE_PASS',JSON.stringify(evidence));
 }

 manifest.realRecastTriggerValidatedInBrowser=true;
 manifest.status='CAPTURED_PENDING_HUMAN_VISUAL_QA';
 console.log('PHASE14K_REAL_RECAST_WEBGL2_GPU_CAPTURE_PASS',JSON.stringify({
  imageCount:manifest.screenshotData.length,results
 }));
}
if(process.argv.includes('--self-test')){
 let rejected=false;try{verifyPng(Buffer.from('NOT_A_PNG'));}catch{rejected=true;}
 if(!rejected)fail('NEGATIVE_PNG_FALSE_PASS');
 rejected=false;try{measureCpuChromaticEvidence(Buffer.from('BAD'),'positive-z');}catch{rejected=true;}
 if(!rejected)fail('NEGATIVE_PIXEL_FALSE_PASS');
 console.log('PHASE14K_CAPTURE_NEGATIVE_SELFTEST_PASS');process.exit(0);
}
try{await run();}catch(e){manifest.error=err(e);console.error(e);process.exitCode=1;}
finally{
 mkdirSync(dir,{recursive:true});
 writeFileSync(resolve(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 try{socket?.close();}catch{}
 for(const child of children.reverse())try{child.kill('SIGKILL');}catch{}
}
