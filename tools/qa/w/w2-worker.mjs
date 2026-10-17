#!/usr/bin/env node
/**
 * F4E103W2: isolated QA, real KCC and native CPU. No Pointer Lock.
 * Never edit original, push results, authorize source geometry or deploy.
 */
import {randomUUID,createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {existsSync,mkdtempSync,mkdirSync,readFileSync,writeFileSync,readdirSync,renameSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {apply} from './w2-stage-input.mjs';

export const SCHEMA='t21-f4e103w2-real-kcc-no-pointerlock/v1';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
function save(file,data){
 const tmp=file+'.'+process.pid+'.tmp';
 writeFileSync(tmp,JSON.stringify(data,null,2)+'\n');
 renameSync(tmp,file);
}
function stop(child){
 if(!child?.pid)return;
 if(process.platform==='win32'){
  try{spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{timeout:12000,stdio:'ignore',windowsHide:true})}catch{}
 }else try{child.kill('SIGTERM')}catch{}
}
class CDP{
 constructor(url){this.url=url;this.seq=0;this.pending=new Map();this.ws=null}
 async connect(){
  this.ws=new WebSocket(this.url);
  await Promise.race([new Promise((ok,no)=>{
   this.ws.addEventListener('open',ok,{once:true});
   this.ws.addEventListener('error',()=>no(Error('HOLD_W2_CDP_CONNECT_ERROR')),{once:true});
  }),sleep(15000).then(()=>{throw Error('HOLD_W2_CDP_CONNECT_TIMEOUT')})]);
  this.ws.addEventListener('message',event=>{
   let data;try{data=JSON.parse(event.data)}catch{return}
   const p=this.pending.get(data.id);if(!p)return;
   this.pending.delete(data.id);clearTimeout(p.timer);
   data.error?p.reject(Error('HOLD_W2_CDP_'+p.method+' '+data.error.message)):p.resolve(data.result);
  });
  this.ws.addEventListener('close',()=>{
   for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('HOLD_W2_CDP_DISCONNECTED'))}
   this.pending.clear();
  });
 }
 call(method,params={}){
  if(this.ws?.readyState!==WebSocket.OPEN)throw Error('HOLD_W2_CDP_NOT_OPEN');
  const id=++this.seq;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('HOLD_W2_CDP_TIMEOUT_'+method))},20000);
   this.pending.set(id,{resolve,reject,method,timer});
   this.ws.send(JSON.stringify({id,method,params}));
  });
 }
 async eval(expression){
  const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:false});
  if(r?.exceptionDetails)throw Error('HOLD_W2_JS_EXCEPTION_'+r.exceptionDetails.text);
  return r?.result?.value;
 }
 close(){try{this.ws?.close()}catch{}}
}
async function until(fn,ms,label){
 const end=Date.now()+ms;let last='';
 while(Date.now()<end){
  try{const r=await fn();if(r)return r}catch(e){
   last=String(e);if(last.includes('IDENTITY_MISMATCH'))throw e
  }
  await sleep(180);
 }
 throw Error('HOLD_W2_'+label+'_TIMEOUT '+last.slice(0,180));
}
async function preview(sandbox){
 const bin=join(sandbox,'node_modules','vite','bin','vite.js');
 if(!existsSync(bin)||!existsSync(join(sandbox,'dist','index.html')))
  throw Error('HOLD_W2_BUILD_OUTPUT_MISSING');
 const token=randomUUID(),port=5491,base='http://127.0.0.1:'+port+'/';
 writeFileSync(join(sandbox,'dist','F4E103W2_RUN_MARKER.json'),
  JSON.stringify({source:'W2_Q_BUILD_ONLY',runToken:token}));
 const processHandle=spawn(process.execPath,[bin,'preview','--host','127.0.0.1',
  '--port',String(port),'--strictPort'],{cwd:sandbox,shell:false,stdio:'ignore',windowsHide:true});
 try{
  await until(async()=>{
   if(processHandle.exitCode!==null)throw Error('HOLD_W2_PREVIEW_EARLY_EXIT');
   const response=await fetch(base+'F4E103W2_RUN_MARKER.json',{
    signal:AbortSignal.timeout(1200),redirect:'error'});
   if(!response.ok)return false;
   const marker=await response.json();
   if(marker.runToken!==token||marker.source!=='W2_Q_BUILD_ONLY')
    throw Error('HOLD_W2_PREVIEW_IDENTITY_MISMATCH');
   return true;
  },25000,'PREVIEW');
  return {base,processHandle};
 }catch(e){stop(processHandle);throw e}
}
async function chromeConnect(url,{findChrome,selectIsolatedTab},explicit=''){
 const profile=mkdtempSync(join(tmpdir(),'inktps-w2-chrome-'));
 const executable=findChrome(explicit);
 const child=spawn(executable,['--user-data-dir='+profile,'--remote-debugging-port=0',
  '--no-first-run','--no-default-browser-check','--disable-background-networking',
  '--new-window','--window-size=1600,900',url],{stdio:'ignore',windowsHide:false,shell:false});
 let cdp=null;
 try{
  const port=await until(()=>{
   if(child.exitCode!==null)throw Error('HOLD_W2_CHROME_EXITED');
   try{
    const num=Number(readFileSync(join(profile,'DevToolsActivePort'),'utf8').split(/\r?\n/)[0]);
    return Number.isSafeInteger(num)&&num>0?num:false;
   }catch{return false}
  },25000,'CHROME_PORT');
  const websocket=await until(async()=>{
   const response=await fetch('http://127.0.0.1:'+port+'/json/list',{
    redirect:'error',signal:AbortSignal.timeout(1500)});
   if(!response.ok)return null;
   return selectIsolatedTab(await response.json(),url,port)?.webSocketDebuggerUrl??null;
  },20000,'CHROME_TARGET');
  cdp=new CDP(websocket);await cdp.connect();await cdp.call('Runtime.enable');
  await cdp.call('Page.enable');
  return {cdp,child,profile};
 }catch(e){
  cdp?.close();stop(child);
  try{rmSync(profile,{recursive:true,force:true,maxRetries:3})}catch{}
  throw e;
 }
}
const STATE=[
 '(()=>{const a=globalThis.__t21F3;if(!a?.snapshot)return {notReady:true};',
 'const s=a.snapshot();return {notReady:false,phase:s.phase,stageId:s.stageId,',
 'tick:s.tick,paused:s.paused,stopReason:s.stopReason,player:s.player,',
 'canvasReady:document.querySelector("#app-canvas")?.dataset?.t21F3Ready,',
 'originalSourceSolids:s.originalSourceSolids,originalPaintSurfaces:s.originalPaintSurfaces,',
 'originalSourceNavigationLinks:s.originalSourceNavigationLinks,',
 'scoreablePromotions:s.sourceScoreablePromotions,productionAuthorized:s.productionAuthorized,',
 'sourceGeometryChanged:s.sourceGeometryChanged,',
 'qaInput:typeof a.qaDriveTicks==="function",kccApi:typeof a.kccAudit==="function",',
 'crowd:s.humanCrowd?.crowdProjectionAudit??null};})()'
].join('');
function driveExpr(x,y,ticks){
 return '(()=>{const a=globalThis.__t21F3;try{const s=a.qaDriveTicks('+
  [x,y,ticks].join(',')+');return {ok:true,s};}catch(e){return {ok:false,'+
  'error:String(e?.message??e),s:a?.snapshot?.()}}})()';
}
const axes=keys=>({
 x:Number(keys.includes('KeyD'))-Number(keys.includes('KeyA')),
 y:Number(keys.includes('KeyW'))-Number(keys.includes('KeyS'))
});
async function routeDrive(cdp,route,core){
 const boot=await cdp.eval(STATE);
 core.checkSourceAuthority(boot);
 if(!boot.paused||boot.stopReason||!boot.qaInput||!boot.kccApi)
  throw Error('HOLD_W2_QA_ONLY_BOOT_GATES_MISSING');
 const samples=[{tick:boot.tick,pos:boot.player.position}];
 let stopReason=null;
 for(const part of core.segments(route,8)){
  const input=axes(part.keys);
  let remaining=Math.round(part.durationMs*60/1000);
  while(remaining>0){
   const count=Math.min(12,remaining);
   const result=await cdp.eval(driveExpr(input.x,input.y,count));
   remaining-=count;
   if(!Array.isArray(result?.s?.player?.position))
    throw Error('HOLD_W2_QA_NO_PHYSICAL_POSITION');
   samples.push({tick:result.s.tick,pos:result.s.player.position});
   if(!result.ok||result.s.stopReason){
    stopReason=result.s.stopReason??result.error??'HOLD_QA_TICK_ERROR';break;
   }
  }
  if(stopReason)break;
 }
 const audit=await cdp.eval('(()=>globalThis.__t21F3?.kccAudit?.(720)??null)()');
 const last=await cdp.eval(STATE);
 const kcc=core.classifyContactTrace(audit);
 return {route:route.id,stopReason,realKcc:kcc,walk:core.summarizeWalk(samples),
  lastPhysicalPosition:last.player?.position??null,crowd:last.crowd,
  originalStageModified:false,productionAuthorized:false};
}
export async function main({root,project,kit,chromeExe='',routeCount=2}){
 const report={schema:SCHEMA,status:'HOLD_NOT_STARTED',started:new Date().toISOString(),
  buildValidated:false,liveKccObserved:false,liveCrowdObserved:false,
  sourceModified:false,geometryAdded:0,navPromotions:0,scorePromotions:0,
  pointerLockRequested:false,results:[],errors:[]};
 const critical=['src/player/PlayerController.ts','src/app/UndertowF3PlayablePreviewApp.ts',
  'src/stage/undertow/UndertowPhase14QHumanCrowdAnchor.ts',
  'src/app/UndertowF3NativeHumanCrowd.ts'];
 const sourceHashes=critical.map(name=>sha(join(project,name)));
 let server=null,browser=null,runDir=null;
 try{
  if(routeCount!==2)throw Error('HOLD_W2_ONLY_TWO_QA_ROUTES_AUTHORIZED');
  const q=await import(pathToFileURL(join(kit,'q','scripts','q-sandbox-validate.mjs')).href);
  const core=await import(pathToFileURL(join(kit,'scripts','r-core.mjs')).href);
  const b=await import(pathToFileURL(join(kit,'scripts','r-browser.mjs')).href);
  const runs=join(root,'runs');mkdirSync(runs,{recursive:true});
  runDir=mkdtempSync(join(runs,'w2-'));
  const qOut=join(runDir,'Q');
  const build=await q.main(['--project',project,'--output-root',qOut],{enableCrowdAudit:true});
  report.qStatus=build.status;
  if(build.status!=='PASS_ISOLATED_FULL_BUILD_NOT_DEPLOYED')
   throw Error('HOLD_W2_Q_ISOLATED_BUILD_'+build.status);
  const entries=readdirSync(qOut,{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name.startsWith('run-'));
  if(entries.length!==1)throw Error('HOLD_W2_Q_SANDBOX_COUNT');
  const sandbox=join(qOut,entries[0].name,'sandbox');
  report.inputStage=apply({sandbox,original:project});
  const tsc=q.runTypecheck(sandbox);
  if(!tsc.passed)throw Error('HOLD_W2_INPUT_TYPECHECK_'+tsc.stderrTail.slice(-300));
  const finalBuild=q.runBuild(sandbox);
  if(!finalBuild.passed)throw Error('HOLD_W2_INPUT_BUILD_'+finalBuild.stderrTail.slice(-300));
  report.buildValidated=true;
  server=await preview(sandbox);
  const query='?t21Play=preview&t21KccAudit=readOnly&t21QaDrive=source&t21QaInput=deterministic&t21QaPauseOnBoot=1';
  const url=server.base+query;
  browser=await chromeConnect(url,b,chromeExe);
  for(const route of core.ROUTES.slice(0,routeCount)){
   if(report.results.length>0)await browser.cdp.call('Page.navigate',{url});
   await until(async()=>{
    const s=await browser.cdp.eval(STATE);
    return s.notReady||s.canvasReady!=='READY'?false:s;
   },70000,'QA_GAME_READY');
   const result=await routeDrive(browser.cdp,route,core);
   report.results.push(result);
   if(result.realKcc?.status!=='LIVE_KCC_TRACE_OBSERVED_NOT_WALKABILITY_CERTIFIED')
    throw Error('HOLD_W2_LIVE_KCC_NOT_CAPTURED');
  }
  report.liveKccObserved=report.results.length===routeCount;
  report.liveCrowdObserved=report.results.some(r=>r.crowd?.source==='LIVE_CROWD_NAV_PROJECTION_READONLY');
  report.status=report.liveCrowdObserved?'HOLD_LIVE_CROWD_MEASURED_STAGE_CAUSE_UNPROVEN':
   'HOLD_LIVE_KCC_MEASURED_CROWD_CAUSE_UNPROVEN';
 }catch(e){
  report.errors.push(String(e?.message??e).slice(0,1000));
  report.status=report.errors.at(-1).startsWith('HOLD_')?
   report.errors.at(-1).split(' ')[0]:'HOLD_W2_UNEXPECTED_DIAGNOSTIC_ERROR';
 }finally{
  browser?.cdp.close();
  if(browser){stop(browser.child);
   try{rmSync(browser.profile,{recursive:true,force:true,maxRetries:4,retryDelay:100})}catch{}}
  if(server)stop(server.processHandle);
  try{report.sourceModified=critical.some((name,i)=>sha(join(project,name))!==sourceHashes[i])}
  catch{report.sourceModified=true}
  if(report.sourceModified)report.status='CRITICAL_ORIGINAL_GAME_SOURCE_MODIFIED';
  report.finished=new Date().toISOString();
  if(runDir){const trace=join(runDir,'F4E103W2_LOCAL_TRACE.json');save(trace,report);report.localTrace=trace}
  console.log('W2_RESULT',report.status,'ORIGINAL_UNCHANGED',!report.sourceModified);
 }
 return report;
}
