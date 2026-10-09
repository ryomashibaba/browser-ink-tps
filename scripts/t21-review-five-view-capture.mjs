#!/usr/bin/env node
/**
 * T21 VISUAL EVIDENCE ONLY: screenshot actual PlayCanvas review in Chrome.
 *
 * No gameplay/runtime changes. Does NOT approve a five-view Visual Freeze.
 * A screenshot with a blank WebGPU canvas or perspective issue still needs
 * human visual review. On CI without WebGPU/Chrome, write an explicit BLOCKED
 * manifest instead of a fake pass. No third-party npm/browser automation libs.
 */
import { spawn, execFileSync } from 'node:child_process';
import { openSync, closeSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve } from 'node:path';

const destination=process.env.T21_SCREENSHOT_DIR||'/tmp/t21-review-five-view';
const views=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];
const manifest={
  source:'T21 Visual Review ?stageReview=undertow (NOT production)',
  generatedAt:new Date().toISOString(),
  evidenceType:'REAL_BROWSER_SCREENSHOTS_IF_PLAYCANVAS_WEBGPU_OR_WEBGL2_RENDERED',
  authorizesVisualFreeze:false,
  authorizesGameplayOrStageActivation:false,
  status:'BLOCKED',
  reason:null,
  chromium:null,
  url:null,
  screenshots:[]
};
const children=[];
let socket=null;
const waiting=new Map();
let serial=0;
function diagnostic(err){return err instanceof Error?err.message:String(err)}
async function poll(fn,timeout=25_000,interval=300){
  const started=Date.now();let last;
  while(Date.now()-started<timeout){
    try {const result=await fn();if(result)return result;}catch(e){last=e;}
    await sleep(interval);
  }
  throw Error('Timed out checking browser readiness: '+diagnostic(last));
}
async function navigate(url){
  const reply=await command('Page.navigate',{url});
  if(reply.errorText)throw Error('Chrome navigation: '+reply.errorText);
}
function command(method,params={}){
  if(!socket||socket.readyState!==WebSocket.OPEN)throw Error('Chrome DevTools WebSocket disconnected');
  const id=++serial;
  return new Promise((resolve,reject)=>{
    // A GPU crash or stalled Chrome DevTools socket must never hang the PR CI.
    // Every CDP request gets a deadline, independently of readiness polling.
    const deadline=setTimeout(()=>{
      waiting.delete(id);
      reject(Error('CDP_TIMEOUT: '+method+' did not answer within 10000ms'));
    },10_000);
    waiting.set(id,{
      resolve(value){clearTimeout(deadline);resolve(value);},
      reject(error){clearTimeout(deadline);reject(error);}
    });
    try{socket.send(JSON.stringify({id,method,params}));}
    catch(error){clearTimeout(deadline);waiting.delete(id);reject(error);}
  });
}
async function evaluation(expression){
  const response=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(response.exceptionDetails)throw Error('Browser JS exception: '+JSON.stringify(response.exceptionDetails));
  return response.result?.value;
}
try {
  await mkdir(destination,{recursive:true});
  process.stdout.write('T21_CAPTURE_START '+new Date().toISOString()+'\n');
  const chromeCommand=process.env.T21_CHROME_PATH||[
    'google-chrome-stable','google-chrome','chromium','chromium-browser'
  ].find(name=>{
    try{execFileSync('which',[name],{stdio:'ignore'});return true;}catch{return false;}
  });
  if(!chromeCommand)throw Error('CHROME_NOT_FOUND: Chrome/Chromium binary not available on CI runner');
  manifest.chromium=chromeCommand;

  const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4173','--strictPort','--base','/browser-ink-tps/'],{
    // Chrome/Vite error logs may be large: never leave PIPE buffers undrained.
    stdio:'ignore',detached:false
  });
  children.push(server);
  const url='http://127.0.0.1:4173/browser-ink-tps/?stageReview=undertow';
  manifest.url=url;
  await poll(async()=>{const r=await fetch(url);return r.ok;});
  // Explicit cross-check: Pages build uses --base=/browser-ink-tps/.
  // Vite preview MUST use the same base. A SPA index.html fallback on a
  // wrong path can appear HTTP 200 but serve CSS/ES modules as HTML (blank
  // white canvas without boot-error), so verify real assets before Chrome.
  const indexHtml=await (await fetch(url)).text();
  const assetPaths=[...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match=>match[1])
    .filter(p=>p.startsWith('/browser-ink-tps/assets/'));
  if(assetPaths.length<2)
    throw Error('T21_ASSET_PREFLIGHT: index is missing versioned JS/CSS under /browser-ink-tps/');
  manifest.assetPreflight=[];
  for(const assetPath of assetPaths){
    const res=await fetch(new URL(assetPath,url),{signal:AbortSignal.timeout(5000)});
    const type=res.headers.get('content-type')||'';
    const result={path:assetPath,status:res.status,mime:type};
    manifest.assetPreflight.push(result);
    if(!res.ok||type.includes('text/html')||
       (!type.includes('javascript')&&!type.includes('css')))
      throw Error('T21_ASSET_PREFLIGHT: versioned asset failed '+JSON.stringify(result));
  }
  process.stdout.write('T21_ASSET_PREFLIGHT_PASS count='+assetPaths.length+'\\n');

  const chromeLog=resolve(destination,'chrome-startup.log');
  const chromeFd=openSync(chromeLog,'w');
  const chrome=spawn(chromeCommand,[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--no-first-run','--no-default-browser-check','--disable-extensions',
    '--disable-background-networking',
    '--enable-unsafe-webgpu','--enable-features=WebGPU,UnsafeWebGPU',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader','--enable-dawn-features=allow_unsafe_apis',
    '--window-size=1600,900','--hide-scrollbars',
    '--remote-debugging-port=9229','--remote-allow-origins=*',
    '--user-data-dir=/tmp/t21-review-cdp-profile',
    'about:blank'
  ],{stdio:['ignore',chromeFd,chromeFd],detached:false});
  closeSync(chromeFd);
  chrome.on('error',error=>{manifest.chromeSpawnError=diagnostic(error);});
  chrome.on('exit',(code,signal)=>{manifest.chromeExit={code,signal};});
  children.push(chrome);

  process.stdout.write('T21_CAPTURE_BROWSER_START chrome='+chromeCommand+'\n');
  const tab=await poll(async()=>{
    if(chrome.exitCode!==null||chrome.signalCode!==null)
      throw Error('CHROME_EARLY_EXIT: '+JSON.stringify({
        code:chrome.exitCode,signal:chrome.signalCode}));
    let response;
    try{
      response=await fetch('http://127.0.0.1:9229/json',{
        signal:AbortSignal.timeout(2500)
      });
    }catch(error){
      throw Error('CDP_PORT_NOT_READY: '+diagnostic(error));
    }
    if(!response.ok)throw Error('CDP_HTTP_'+response.status);
    const pages=await response.json();
    const found=pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl);
    if(found)return found;
    // Recent headless Chrome versions can start with zero page targets.
    // Create exactly one about:blank tab using Chrome's documented endpoint.
    if(pages.length===0){
      try{
        await fetch('http://127.0.0.1:9229/json/new?about:blank',{
          method:'PUT',signal:AbortSignal.timeout(2500)
        });
      }catch(error){throw Error('CDP_CREATE_TAB: '+diagnostic(error));}
    }
    throw Error('CDP_TARGETS='+JSON.stringify(pages.map(p=>({
      type:p.type,id:p.id,url:p.url,hasSocket:!!p.webSocketDebuggerUrl
    }))).slice(0,1200));
  },35_000);
  manifest.cdpPage={id:tab.id,url:tab.url,type:tab.type};
  socket=new WebSocket(tab.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((done,fail)=>{
      socket.addEventListener('open',done,{once:true});
      socket.addEventListener('error',fail,{once:true});
    }),
    sleep(10_000).then(()=>{throw Error('CDP_CONNECT_TIMEOUT: WebSocket handshake exceeded 10s')})
  ]);
  socket.addEventListener('close',()=>{
    for(const [id,p] of waiting){p.reject(Error('CDP_SOCKET_CLOSED: request '+id));waiting.delete(id);}
  });
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));
    if(!message.id)return;
    const promise=waiting.get(message.id);
    if(!promise)return;
    waiting.delete(message.id);
    if(message.error)promise.reject(Error(JSON.stringify(message.error)));
    else promise.resolve(message.result||{});
  });
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride',{
    width:1600,height:900,deviceScaleFactor:1,mobile:false
  });
  await navigate(url);
  const ready=await poll(async()=>{
    const v=await evaluation(`(() => ({
      loaded: !!document.querySelector('[data-review-view="OVERVIEW"]'),
      panel: !!document.querySelector('#t21-review-panel'),
      error: document.querySelector('#boot-error')?.textContent || '',
      documentReady: document.readyState,
      browserWebGPU: !!navigator.gpu,
      reviewBackend: document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer || 'NOT_BOOTED',
      canvasWidth: document.querySelector('#app-canvas')?.width || 0,
      canvasHeight: document.querySelector('#app-canvas')?.height || 0
    }))()`);
    manifest.lastBrowserProbe=v;
    if(v?.error)throw Error('T21_REVIEW_BOOT_ERROR: '+v.error.slice(0,1200));
    if(v?.loaded&&v.panel&&v.canvasWidth>=800&&v.canvasHeight>=450)return v;
    throw Error('T21_REVIEW_NOT_READY: '+JSON.stringify(v).slice(0,1000));
  },35_000);
  manifest.browserReadiness=ready;
  manifest.rendererBackend=ready.reviewBackend;
  process.stdout.write('T21_CAPTURE_WEBGPU_READY '+JSON.stringify(ready)+'\n');
  const appliedPreset=await evaluation(`(() => {
    const b=document.querySelector('[data-review-preset="THREE_DIMENSIONAL"]');
    if(!b)return false;
    b.click();return b.getAttribute('aria-pressed')==='true';
  })()`);
  if(!appliedPreset)throw Error('T21 3D geometry source review preset failed to activate');
  manifest.layerPreset='THREE_DIMENSIONAL';
  await sleep(1200);

  for(const view of views){
    const selected=await evaluation(`(() => {
      const button=document.querySelector('[data-review-view="${view}"]');
      if(!button)return false;
      button.click();
      return true;
    })()`);
    if(!selected)throw Error('T21 camera viewpoint control missing '+view);
    await sleep(850);
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000)throw Error('Suspiciously small screenshot '+view+': '+bytes.byteLength);
    const name='T21_'+view+'_WEBGPU_REVIEW.png';
    process.stdout.write('T21_CAPTURE_VIEW '+view+' bytes='+bytes.byteLength+'\n');
    await writeFile(resolve(destination,name),bytes);
    manifest.screenshots.push({view,file:name,sizeBytes:bytes.byteLength,renderer:'Chrome screenshot of PlayCanvas '+manifest.rendererBackend+' review canvas and UI',humanVisualApproval:false});
  }
  if(manifest.screenshots.length!==5)throw Error('T21 five-view screenshot count invalid');
  manifest.status='CAPTURED_PENDING_HUMAN_VISUAL_QA';
  manifest.reason='Screenshots exist, but cannot infer correct rendered topology or Visual Freeze automatically.';
 }catch(error){
  manifest.status='BLOCKED';
  manifest.reason=diagnostic(error);
  // The failure image is DIAGNOSTIC ONLY. Never count it among five validated
  // camera screenshots, and never imply renderer/Visual Freeze approval.
  if(socket?.readyState===WebSocket.OPEN){
    try{
      const shot=await command('Page.captureScreenshot',{
        format:'png',captureBeyondViewport:false,fromSurface:true
      });
      const bytes=Buffer.from(shot.data||'','base64');
      if(bytes.byteLength>=2000){
        manifest.debugScreenshot='T21_CAPTURE_BLOCKED_DIAGNOSTIC.png';
        await writeFile(resolve(destination,manifest.debugScreenshot),bytes);
      }
    }catch(captureError){manifest.debugScreenshotError=diagnostic(captureError);}
  }
  try{
    const log=readFileSync(resolve(destination,'chrome-startup.log'),'utf8');
    manifest.chromeStartupTail=log.slice(-3500);
  }catch{}
}finally{
  try {await mkdir(destination,{recursive:true});await writeFile(resolve(destination,'manifest.json'),JSON.stringify(manifest,null,2));}catch(error){process.stderr.write('T21 manifest write: '+diagnostic(error)+'\n')}
  try {socket?.close();}catch{}
  for(const [id,p] of waiting){p.reject(Error('T21 capture cleanup'));waiting.delete(id);}
  for(const child of children.reverse())try {child.kill('SIGKILL');}catch{}
}
process.stdout.write('T21_FIVE_VIEW_CAPTURE '+JSON.stringify({
  status:manifest.status,
  reason:manifest.reason,
  count:manifest.screenshots.length,
  outputDir:destination
})+'\n');
if(manifest.status==='BLOCKED')process.exitCode=1;
