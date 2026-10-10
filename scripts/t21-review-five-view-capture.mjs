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
import { createHash } from 'node:crypto';
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
function command(method,params={},timeoutMs=10_000){
  if(!socket||socket.readyState!==WebSocket.OPEN)throw Error('Chrome DevTools WebSocket disconnected');
  const id=++serial;
  return new Promise((resolve,reject)=>{
    // A GPU crash or stalled Chrome DevTools socket must never hang the PR CI.
    // Every CDP request gets a deadline, independently of readiness polling.
    const deadline=setTimeout(()=>{
      waiting.delete(id);
      reject(Error('CDP_TIMEOUT: '+method+' did not answer within '+timeoutMs+'ms'));
    },timeoutMs);
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
  const urlForView=view=>url+'&reviewPreset=THREE_DIMENSIONAL&reviewView='+view+'&reviewRenderer=webgl2';
  manifest.layerPreset='THREE_DIMENSIONAL';
  manifest.requestedReviewBackend='webgl2';
  manifest.cameraSelection='URL_BOOTSTRAP_NO_BLOCKING_RUNTIME_CLICK';
  const hashSet=new Set();
  for(const view of views){
    await navigate(urlForView(view));
    const ready=await poll(async()=>{
      const state=await evaluation(`(() => ({
        loaded: !!document.querySelector('[data-review-view="OVERVIEW"]'),
        panel: !!document.querySelector('#t21-review-panel'),
        error: document.querySelector('#boot-error')?.textContent || '',
        documentReady: document.readyState,
        browserWebGPU: !!navigator.gpu,
        reviewBackend: document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer || 'NOT_BOOTED',
        reviewView: document.querySelector('#app-canvas')?.dataset.t21ReviewView || '',
        reviewPreset: document.querySelector('#app-canvas')?.dataset.t21ReviewPreset || '',
        canvasWidth: document.querySelector('#app-canvas')?.width || 0,
        canvasHeight: document.querySelector('#app-canvas')?.height || 0
      }))()`);
      manifest.lastBrowserProbe=state;
      if(state?.error)throw Error('T21_REVIEW_BOOT_ERROR: '+state.error.slice(0,1200));
      if(state?.loaded&&state.panel&&state.reviewView===view&&
         state.reviewPreset==='THREE_DIMENSIONAL'&&
         state.reviewBackend==='webgl2'&&
         state.canvasWidth>=800&&state.canvasHeight>=450)return state;
      throw Error('T21_REVIEW_NOT_READY: '+JSON.stringify(state).slice(0,1000));
    },35_000);
    if(!manifest.browserReadiness)manifest.browserReadiness=ready;
    manifest.rendererBackend=ready.reviewBackend;
    process.stdout.write('T21_CAPTURE_RENDERER_READY '+view+' '+ready.reviewBackend+'\\n');
    await sleep(850);
    // CDP screenshot is a graphical browser capture, not any simulated image.
    // The 25s deadline admits slower software SwiftShader rendering.
    const shot=await command('Page.captureScreenshot',{
      format:'png',captureBeyondViewport:false,fromSurface:true
    },25_000);
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_SCREENSHOT_INVALID: '+view+' bytes='+bytes.byteLength);
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    if(width<1200||height<680)throw Error('T21_SCREENSHOT_RESOLUTION: '+view+' '+width+'x'+height);
    const sha256=createHash('sha256').update(bytes).digest('hex');
    if(hashSet.has(sha256))throw Error('T21_SCREENSHOT_DUPLICATE: camera image is bit-identical '+view);
    hashSet.add(sha256);
    const name='T21_'+view+'_WEBGPU_OR_WEBGL2_REVIEW.png';
    await writeFile(resolve(destination,name),bytes);
    manifest.screenshots.push({
      view,file:name,sizeBytes:bytes.byteLength,width,height,
      sha256,renderer:'Chrome screenshot of PlayCanvas '+ready.reviewBackend+
        ' review canvas and UI',humanVisualApproval:false
    });
    process.stdout.write('T21_CAPTURE_VIEW '+view+' size='+bytes.byteLength+'\\n');
  }
  if(manifest.screenshots.length!==5)throw Error('T21 five-view screenshot count invalid');
  // Phase11 seventh shot: actual original 3D proximity candidates overlay.
  // Separate and optional: NEVER increase five-view PASS count or imply
  // source contacts are collision-authorized/connected game paths.
  try{
    await navigate(urlForView('CENTER_SOURCE')+'&reviewTopologyEdges=1&reviewNearestCentral=1');
    const nearestReady=await poll(async()=>{
      const state=await evaluation(`(() => ({
        view:document.querySelector('#app-canvas')?.dataset.t21ReviewView,
        topology:document.querySelector('#app-canvas')?.dataset.t21ReviewTopology,
        nearest:document.querySelector('#app-canvas')?.dataset.t21ReviewNearestCentral,
        backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
      }))()`);
      if(state?.view==='CENTER_SOURCE'&&state.topology==='on'&&
         state.nearest==='on'&&state.backend==='webgl2')return state;
      throw Error('T21_PHASE11_NEAREST_DIAGNOSTIC_NOT_READY '+JSON.stringify(state));
    },25000);
    await sleep(900);
    const shot=await command('Page.captureScreenshot',{
      format:'png',captureBeyondViewport:false,fromSurface:true
    },25000);
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_PHASE11_NEAREST_DIAGNOSTIC_SCREENSHOT_INVALID');
    const file='T21_PHASE11_CENTRAL_NEAREST_SOURCE_DIAGNOSTIC.png';
    await writeFile(resolve(destination,file),bytes);
    manifest.nearestCentralSourceDiagnostic={
      status:'CAPTURED_NOT_GAMEPLAY_PROOF',file,
      bytes:bytes.byteLength,sha256:createHash('sha256').update(bytes).digest('hex'),
      source:'16 original-OBJ nearest candidate triangles; 8 contacts at 0m, 8 at 2.55cm',
      sourceTriangleClipToFootprintGuaranteed:false,
      gameConnectedWalkableCollisionProof:false,renderer:nearestReady.backend
    };
  }catch(error){
    manifest.nearestCentralSourceDiagnostic={status:'BLOCKED',reason:diagnostic(error)};
  }

    // Optional Phase12 ORIGINAL-OBJ source-family samples; independent from mandatory five views.
  try{
    await navigate(urlForView('CENTER_SOURCE')+'&reviewTopologyEdges=1&reviewSourceFamilies=1');
    const ready=await poll(async()=>{
      const state=await evaluation(`(() => ({
        view:document.querySelector('#app-canvas')?.dataset.t21ReviewView,
        families:document.querySelector('#app-canvas')?.dataset.t21ReviewSourceFamilies,
        backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
      }))()`);
      if(state?.view==='CENTER_SOURCE'&&state.families==='on'&&state.backend==='webgl2')return state;
      throw Error('T21_PHASE12_SOURCE_FAMILIES_NOT_READY '+JSON.stringify(state));
    },25000);
    await sleep(900);
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_PHASE12_SOURCE_FAMILIES_BAD_SCREENSHOT');
    const file='T21_PHASE12_CENTRAL_SOURCE_FAMILIES_DIAGNOSTIC.png';
    await writeFile(resolve(destination,file),bytes);
    manifest.phase12SourceFamilyDiagnostic={
      status:'CAPTURED_NOT_GAMEPLAY_PROOF',file,bytes:bytes.byteLength,
      sha256:createHash('sha256').update(bytes).digest('hex'),
      originalSourceFaceSamples:16,originalFullComponentsAdded:0,
      originalVertexIDConnectivityProven:false,renderer:ready.backend
    };
  }catch(error){
    manifest.phase12SourceFamilyDiagnostic={status:'BLOCKED',reason:diagnostic(error)};
  }

  // Optional Phase12C original complete components, 8 original meshes / 70 source
  // triangles. This is never mandatory five-view proof and never a runtime stage.
  try{
    await navigate(urlForView('CENTER_SOURCE')+'&reviewCompleteCentral=1');
    const ready=await poll(async()=>{
      const state=await evaluation(`(() => ({
        view:document.querySelector('#app-canvas')?.dataset.t21ReviewView,
        complete:document.querySelector('#app-canvas')?.dataset.t21ReviewCompleteCentral,
        sourceSamples:document.querySelector('#app-canvas')?.dataset.t21ReviewSourceFamilies,
        backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
      }))()`);
      if(state?.view==='CENTER_SOURCE'&&state.complete==='on'&&
        state.sourceSamples==='off'&&state.backend==='webgl2')return state;
      throw Error('T21_PHASE12C_COMPLETE_ORIGINAL_NOT_READY '+JSON.stringify(state));
    },25000);
    await sleep(850);
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_PHASE12C_COMPLETE_ORIGINAL_SCREENSHOT_INVALID');
    const file='T21_PHASE12C_EIGHT_COMPLETE_SOURCE_COMPONENTS_DIAGNOSTIC.png';
    await writeFile(resolve(destination,file),bytes);
    manifest.phase12CCompleteOriginalDiagnostic={
      status:'CAPTURED_NOT_GAMEPLAY_PROOF',file,bytes:bytes.byteLength,
      sha256:createHash('sha256').update(bytes).digest('hex'),
      sourceCompleteOriginalComponents:8,sourceOriginalTriangles:70,
      defaultDisplayedOriginalFullMeshesStill:124,
      originalGameplayCollisionNavProof:false,renderer:ready.backend
    };
  }catch(error){
    manifest.phase12CCompleteOriginalDiagnostic={status:'BLOCKED',reason:diagnostic(error)};
  }

  // Phase12D recovered full original FloorLine mirrors. This is an optional
  // screenshot; neither the five required views nor gameplay are changed.
  try{
    await navigate(urlForView('CENTER_SOURCE')+'&reviewRecoveredOriginal=1');
    const ready=await poll(async()=>{
      const status=await evaluation(`(() => ({
        view:document.querySelector('#app-canvas')?.dataset.t21ReviewView,
        recovered:document.querySelector('#app-canvas')?.dataset.t21ReviewRecoveredOriginal,
        sample:document.querySelector('#app-canvas')?.dataset.t21ReviewSourceFamilies,
        backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
      }))()`);
      if(status?.view==='CENTER_SOURCE'&&status.recovered==='on'&&
        status.sample==='off'&&status.backend==='webgl2')return status;
      throw Error('T21_PHASE12D_RECOVERED_SOURCE_NOT_READY '+JSON.stringify(status));
    },25000);
    await sleep(900);
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
    const bytes=Buffer.from(shot.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_PHASE12D_SOURCE_CAPTURE_INVALID');
    const file='T21_PHASE12D_RECOVERED_ORIGINAL_FOUR_COMPONENTS_DIAGNOSTIC.png';
    await writeFile(resolve(destination,file),bytes);
    manifest.phase12DRecoveredSourceDiagnostic={status:'CAPTURED_NOT_GAMEPLAY_PROOF',
      file,bytes:bytes.byteLength,sha256:createHash('sha256').update(bytes).digest('hex'),
      recoveredOriginalFullComponents:4,originalSourceTriangles:8,
      defaultSourceCount:124,newPlayableFloorCount:0,renderer:ready.backend};
  }catch(error){
    manifest.phase12DRecoveredSourceDiagnostic={status:'BLOCKED',reason:diagnostic(error)};
  }

  // Phase12E: two separate original-source-only magnified diagnostics.
  // Never counted among 5 ordinary screenshots, no gameplay/Freeze authority.
  manifest.phase12ERecoveredFocusDiagnostics=[];
  for(const side of ['POSITIVE_Z','NEGATIVE_Z']){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewRecoveredFocus='+side);
      const state=await poll(async()=>{
        const value=await evaluation(`(() => ({
          focus:document.querySelector('#app-canvas')?.dataset.t21ReviewRecoveredFocus,
          pieces:document.querySelector('#app-canvas')?.dataset.t21ReviewRecoveredFocusPieces,
          renderer:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset
        }))()`);
        if(value?.focus===side&&value.pieces==='2'&&
           value.renderer==='webgl2'&&value.preset==='FOCUS_ORIGINAL_SOURCE_ONLY')return value;
        throw Error('T21_PHASE12E_FOCUS_NOT_READY '+JSON.stringify(value));
      },25000);
      // Hide only the editor UI panel DURING evidence capture so the small
      // 3D originals are visible without an overlapping menu.
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(750);
      const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
      const bytes=Buffer.from(shot.data||'','base64');
      // An isolated original-only mesh on a uniform background compresses
      // strongly. Check the real PNG signature and IHDR dimensions rather than
      // discarding valid small screenshots using a JPEG-like size threshold.
      const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
      const pngValid=bytes.byteLength>=33&&bytes.subarray(0,8).equals(pngSignature);
      const width=pngValid?bytes.readUInt32BE(16):0;
      const height=pngValid?bytes.readUInt32BE(20):0;
      if(!pngValid||width<640||height<360)
        throw Error('T21_PHASE12E_FOCUSED_ORIGINAL_SCREENSHOT_INVALID_PNG_OR_DIMENSIONS_'+bytes.byteLength+'_'+width+'x'+height);
      const file='T21_PHASE12E_FOCUSED_'+side+'_ORIGINAL_SOURCE.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12ERecoveredFocusDiagnostics.push({
        status:'CAPTURED_NOT_GAMEPLAY_PROOF',side,
        originalSourcePieces:2,
        originalSourceTriangles:4,
        allDefault124OriginalSourceMeshesHiddenForIsolation:true,
        file,bytes:bytes.byteLength,width,height,sha256:createHash('sha256').update(bytes).digest('hex'),
        renderer:state.renderer,authorizesVisualFreeze:false
      });
    }catch(error){
      manifest.phase12ERecoveredFocusDiagnostics.push({status:'BLOCKED',side,reason:diagnostic(error)});
    }
  }

  // Phase12E single-piece optical close-up: individual original components
  // rather than two separated pieces at opposite ends of one view.
  manifest.phase12ESingleOriginalDiagnostics=[];
  for(const face of [60006,61516,61728,62086]){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewRecoveredFace='+face);
      const state=await poll(async()=>{
        const value=await evaluation(`(() => ({
          face:document.querySelector('#app-canvas')?.dataset.t21ReviewRecoveredFocusFace,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewRecoveredFocusPieces,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(value?.face===String(face)&&value.count==='1'&&
           value.preset==='FOCUS_ONE_EXACT_ORIGINAL_SOURCE'&&value.backend==='webgl2')
          return value;
        throw Error('T21_PHASE12E_SINGLE_SOURCE_NOT_READY '+JSON.stringify(value));
      },25000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(700);
      const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
      const bytes=Buffer.from(shot.data||'','base64');
      const sig=Buffer.from([137,80,78,71,13,10,26,10]);
      const png=bytes.length>=33&&bytes.subarray(0,8).equals(sig);
      const width=png?bytes.readUInt32BE(16):0,height=png?bytes.readUInt32BE(20):0;
      if(!png||width<640||height<360)
        throw Error('T21_PHASE12E_SINGLE_SOURCE_PNG_INVALID_'+bytes.length);
      const file='T21_PHASE12E_SINGLE_ORIGINAL_FACE_'+face+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12ESingleOriginalDiagnostics.push({
        status:'CAPTURED_NOT_GAMEPLAY_PROOF',face,onlyOneExactOriginalConnectedComponent:true,
        sourceTriangleCount:2,width,height,file,bytes:bytes.length,
        sha256:createHash('sha256').update(bytes).digest('hex'),
        renderer:state.backend,authorizesVisualFreeze:false
      });
    }catch(error){
      manifest.phase12ESingleOriginalDiagnostics.push({status:'BLOCKED',face,reason:diagnostic(error)});
    }
  }

  // Phase12H: two optional original-only contact comparison photos.
  // These DO NOT contribute to the five mandatory review directions.
  manifest.phase12HOriginalContactDiagnostics=[];
  for(const face of [60006,61728]){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewSourceContacts='+face);
      const state=await poll(async()=>{
        const x=await evaluation(`(() => ({
          face:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12HContacts,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12HPointCount,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          renderer:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(x?.face===String(face)&&x.count==='2'&&
           x.preset==='PHASE12H_SOURCE_CONTACTS_ONLY'&&x.renderer==='webgl2')return x;
        throw Error('T21_PHASE12H_EXACT_SOURCE_NOT_READY '+JSON.stringify(x));
      },25000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(700);
      const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true},25000);
      const bytes=Buffer.from(shot.data||'','base64');
      const valid=bytes.length>33&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const width=valid?bytes.readUInt32BE(16):0,height=valid?bytes.readUInt32BE(20):0;
      if(!valid||width<640||height<360)throw Error('T21_PHASE12H_CONTACT_PNG_INVALID');
      const file='T21_PHASE12H_ORIGINAL_METAL_GLASS_CONTACT_'+face+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12HOriginalContactDiagnostics.push({
        status:'CAPTURED_NOT_GAMEPLAY_PROOF',sourceMinFace:face,exactOriginalMaterialContacts:2,
        preservedOriginalSourceXYZ:true,originalOBJWeldedEdges:0,
        materialLabels:['WallMetal00','Glass01'],file,width,height,bytes:bytes.length,
        sha256:createHash('sha256').update(bytes).digest('hex'),
        authorizesVisualFreeze:false,gameplayAuthority:'NONE'
      });
    }catch(error){
      manifest.phase12HOriginalContactDiagnostics.push({status:'BLOCKED',sourceMinFace:face,reason:diagnostic(error)});
    }
  }

  // Phase12I six pinned original PillarOld00 pieces: 6 together & 3 mirror
  // pairs. All are optional optical evidence, NEVER standard five-view PASS.
  manifest.phase12IOriginalPillarDiagnostics=[];
  for(const choice of ['ALL','12934','12956','13176']){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewBroadPillars='+choice);
      const state=await poll(async()=>{
        const x=await evaluation(`(() => ({
          choice:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12IPillars,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12ICount,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(x?.choice===choice&&x.count===(choice==='ALL'?'6':'2')&&
          x.preset==='PHASE12I_PINNED_ORIGINAL_PILLARS_ONLY'&&x.backend==='webgl2')return x;
        throw Error('T21_PHASE12I_PINNED_SOURCE_CAPTURE_NOT_READY '+JSON.stringify(x));
      },25000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(850);
      const shot=await command('Page.captureScreenshot',{format:'png',
        captureBeyondViewport:false,fromSurface:true},25000);
      const bytes=Buffer.from(shot.data||'','base64');
      const png=bytes.length>33&&bytes.subarray(0,8).equals(
        Buffer.from([137,80,78,71,13,10,26,10]));
      const width=png?bytes.readUInt32BE(16):0,height=png?bytes.readUInt32BE(20):0;
      if(!png||width!==1600||height!==900)throw Error('T21_PHASE12I_ORIGINAL_PILLAR_PNG_INVALID');
      const file='T21_PHASE12I_ORIGINAL_PILLARS_'+choice+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12IOriginalPillarDiagnostics.push({
        status:'CAPTURED_NOT_GAMEPLAY_PROOF',sourceOriginalSelection:choice,
        sourceOriginalFullComponents:choice==='ALL'?6:2,
        originalSourceTriangles:choice==='ALL'?132:44,
        originalSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
        noAddedPlayableFloor:true,noRegisteredDefaultSourceMeshes:true,
        file,sha256:createHash('sha256').update(bytes).digest('hex'),
        width,height,bytes:bytes.byteLength,authorizesVisualFreeze:false
      });
    }catch(error){
      manifest.phase12IOriginalPillarDiagnostics.push({
        status:'BLOCKED',sourceOriginalSelection:choice,reason:diagnostic(error)});
    }
  }

  // Phase12K opt-in only: 4 exact source-only meshes, separately color-coded
  // old structure / original horizontal cut. Not one of mandatory 5 shots.
  manifest.phase12KOriginalNeighborDiagnostics=[];
  for(const choice of ['ALL','OLD','CUT']){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewPillarNeighbors='+choice);
      const state=await poll(async()=>{
        const x=await evaluation(`(() => ({
          choice:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12KNeighbors,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12KCount,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          renderer:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(x?.choice===choice&&x.count===(choice==='ALL'?'4':'2')&&
          x.preset==='PHASE12K_PINNED_ORIGINAL_NEIGHBORS_ONLY'&&x.renderer==='webgl2')return x;
        throw Error('T21_PHASE12K_SOURCE_ONLY_NOT_READY '+JSON.stringify(x));
      },25000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(850);
      const shot=await command('Page.captureScreenshot',{format:'png',
        captureBeyondViewport:false,fromSurface:true},25000);
      const bytes=Buffer.from(shot.data||'','base64');
      const valid=bytes.length>33&&bytes.subarray(0,8).equals(
        Buffer.from([137,80,78,71,13,10,26,10]));
      const width=valid?bytes.readUInt32BE(16):0,height=valid?bytes.readUInt32BE(20):0;
      if(!valid||width!==1600||height!==900)
        throw Error('T21_PHASE12K_SOURCE_PNG_INVALID');
      const file='T21_PHASE12K_ORIGINAL_NEIGHBORS_'+choice+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12KOriginalNeighborDiagnostics.push({
        status:'CAPTURED_NOT_GAMEPLAY_PROOF',selection:choice,
        sourceOriginalComponents:choice==='ALL'?4:2,
        originalSourceTriangles:choice==='ALL'?92:choice==='OLD'?44:48,
        originalSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
        originalCutNotPlayableFloor:true,gameplayAuthority:'NONE',
        defaultReviewMeshesUnchanged:124,authorizesVisualFreeze:false,
        file,sha256:createHash('sha256').update(bytes).digest('hex'),
        width,height,bytes:bytes.byteLength,renderer:state.renderer
      });
    }catch(error){
      manifest.phase12KOriginalNeighborDiagnostics.push({
        status:'BLOCKED',selection:choice,reason:diagnostic(error)});
    }
  }

  // Phase12L context: 6 original I + 4 original K + 4 original L,
  // or only the 4 original L shell pieces. Two opt-in, REAL WebGL2 captures
  // NOT part of mandatory five and NEVER authorizing Visual Freeze.
  manifest.phase12LOriginalContextDiagnostics=[];
  for(const choice of ['CONTEXT','OBJECT']){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewPillarContext='+choice);
      const state=await poll(async()=>{
        const x=await evaluation(`(() => ({
          choice:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12LContext,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12LCount,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(x?.choice===choice&&x.count===(choice==='CONTEXT'?'14':'4')&&
           x.preset==='PHASE12L_ORIGINAL_SOURCE_CONTEXT_ONLY'&&x.backend==='webgl2')
          return x;
        throw Error('T21_PHASE12L_ORIGINAL_CONTEXT_NOT_READY '+JSON.stringify(x));
      },25_000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(850);
      const image=await command('Page.captureScreenshot',{
        format:'png',captureBeyondViewport:false,fromSurface:true
      },25_000);
      const bytes=Buffer.from(image.data||'','base64');
      const png=bytes.length>33&&bytes.subarray(0,8).equals(
        Buffer.from([137,80,78,71,13,10,26,10]));
      const width=png?bytes.readUInt32BE(16):0;
      const height=png?bytes.readUInt32BE(20):0;
      if(!png||width!==1600||height!==900||bytes.length<8000)
        throw Error('T21_PHASE12L_EMPTY_OR_MALFORMED_SOURCE_SCREENSHOT');
      const file='T21_PHASE12L_ORIGINAL_CONTEXT_'+choice+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12LOriginalContextDiagnostics.push({
        status:'CAPTURED_PENDING_HUMAN_VISUAL_QA',
        sourceSelection:choice,sourceComponents:choice==='CONTEXT'?14:4,
        originalSourceTriangles:choice==='CONTEXT'?312:88,
        originalSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
        sourceVisualContextDoesNotProveGameConnectivity:true,
        sourceHorizontalCutsNotPlayableFloors:true,
        frozenDefaultSourceMeshCount:124,
        authorizesVisualFreeze:false,authorizesGameplayOrStageActivation:false,
        file,width,height,bytes:bytes.length,
        sha256:createHash('sha256').update(bytes).digest('hex'),
        renderer:state.backend
      });
    }catch(error){
      manifest.phase12LOriginalContextDiagnostics.push({
        status:'BLOCKED',selection:choice,reason:diagnostic(error),
        authorizesVisualFreeze:false,authorizesGameplayOrStageActivation:false
      });
    }
  }

  // Phase12M: three extra *real* PlayCanvas screenshots independent of
  // the mandatory five views. CONTEXT displays 22 exact originals; RIM/BAND
  // never imply that a flat original source face is a playable roof.
  manifest.phase12MOriginalRimBandDiagnostics=[];
  for(const choice of ['CONTEXT','RIM','BAND']){
    try{
      await navigate(urlForView('CENTER_SOURCE')+'&reviewPillarDetail='+choice);
      const state=await poll(async()=>{
        const v=await evaluation(`(() => ({
          selection:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12MDetail,
          count:document.querySelector('#app-canvas')?.dataset.t21ReviewPhase12MCount,
          preset:document.querySelector('#app-canvas')?.dataset.t21ReviewPreset,
          renderer:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
        }))()`);
        if(v?.selection===choice&&v.count===(choice==='CONTEXT'?'22':'4')&&
           v.preset==='PHASE12M_EXACT_ORIGINAL_SOURCE_DETAIL_ONLY'&&
           v.renderer==='webgl2')return v;
        throw Error('T21_PHASE12M_PINNED_SOURCE_NOT_READY '+JSON.stringify(v));
      },25000);
      await evaluation(`(() => {const p=document.querySelector('#t21-review-panel');if(p)p.style.display='none';return true;})()`);
      await sleep(700);
      const image=await command('Page.captureScreenshot',{
        format:'png',captureBeyondViewport:false,fromSurface:true
      },25000);
      const bytes=Buffer.from(image.data||'','base64');
      const valid=bytes.length>8000&&bytes.subarray(0,8).equals(
        Buffer.from([137,80,78,71,13,10,26,10]));
      const width=valid?bytes.readUInt32BE(16):0;
      const height=valid?bytes.readUInt32BE(20):0;
      if(!valid||width!==1600||height!==900)
        throw Error('T21_PHASE12M_EMPTY_OR_MALFORMED_REAL_SCREENSHOT');
      const file='T21_PHASE12M_ORIGINAL_RIM_BAND_'+choice+'.png';
      await writeFile(resolve(destination,file),bytes);
      manifest.phase12MOriginalRimBandDiagnostics.push({
        status:'CAPTURED_PENDING_HUMAN_VISUAL_QA',selection:choice,
        sourceOriginalComponents:choice==='CONTEXT'?22:4,
        originalSourceTriangles:choice==='CONTEXT'?488:88,
        originalSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
        sourceRimNotPlayableFloor:true,noPhysicalAttachmentAssertion:true,
        frozenDefaultSourceMeshCount:124,gameplayAuthority:'NONE',
        authorizesVisualFreeze:false,authorizesGameplayOrStageActivation:false,
        file,width,height,bytes:bytes.byteLength,
        sha256:createHash('sha256').update(bytes).digest('hex'),
        renderer:state.renderer
      });
    }catch(error){
      manifest.phase12MOriginalRimBandDiagnostics.push({
        status:'BLOCKED',selection:choice,reason:diagnostic(error),
        authorizesVisualFreeze:false,authorizesGameplayOrStageActivation:false
      });
    }
  }

  // Additional optional diagnostic view, deliberately EXCLUDED from the
  // mandatory five-view screenshot count, and never a visual-freeze PASS.
  try{
    await navigate(urlForView('OVERVIEW')+'&reviewTopologyEdges=1');
    const diagnosticReady=await poll(async()=>{
      const state=await evaluation(`(() => ({
        view:document.querySelector('#app-canvas')?.dataset.t21ReviewView,
        topology:document.querySelector('#app-canvas')?.dataset.t21ReviewTopology,
        backend:document.querySelector('#app-canvas')?.dataset.t21ReviewRenderer
      }))()`);
      if(state?.view==='OVERVIEW'&&state.topology==='on'&&state.backend==='webgl2')
        return state;
      throw Error('T21_PHASE10_DIAGNOSTIC_NOT_READY '+JSON.stringify(state));
    },25_000);
    await sleep(800);
    const diag=await command('Page.captureScreenshot',{
      format:'png',captureBeyondViewport:false,fromSurface:true
    },25_000);
    const bytes=Buffer.from(diag.data||'','base64');
    if(bytes.byteLength<8000||bytes.toString('ascii',1,4)!=='PNG')
      throw Error('T21_PHASE10_DIAGNOSTIC_SCREENSHOT_INVALID');
    const file='T21_PHASE10_EDGE_TOPOLOGY_DIAGNOSTIC.png';
    await writeFile(resolve(destination,file),bytes);
    manifest.topologyDiagnostic={
      status:'CAPTURED_NOT_VISUAL_FREEZE',file,
      bytes:bytes.byteLength,
      sha256:createHash('sha256').update(bytes).digest('hex'),
      source:'48 exact-original OBJ source boundary edges, non-welded vs unmatched',
      gameCollisionConnectivityProof:false,renderer:diagnosticReady.backend
    };
  }catch(diagError){
    manifest.topologyDiagnostic={status:'BLOCKED',reason:diagnostic(diagError)};
    // A diagnostic cannot retroactively fail five already captured camera
    // screenshots. It does not change the mandatory 5-view result.
  }

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
