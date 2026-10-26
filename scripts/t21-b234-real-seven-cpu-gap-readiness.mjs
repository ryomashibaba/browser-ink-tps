#!/usr/bin/env node
/** B234 TRUE real Chrome WebGL2 F3 CpuAgentSystem original25 readiness.
 * Never uses browser-side actor setters, source mesh injection, fake ticks.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
const OUT=process.env.T21_B234_OUT||'/tmp/t21-b234';
mkdirSync(OUT,{recursive:true});
const root='http://127.0.0.1:4197/browser-ink-tps/';
const children=[],pending=new Map();
let socket=null,serial=0;
const wait=async(fn,timeout=100000)=>{
 const end=Date.now()+timeout;
 let error='';
 while(Date.now()<end){
  try{const x=await fn();if(x)return x;}catch(e){error=String(e);}
  await sleep(180);
 }
 throw Error('B234_REAL_BROWSER_TIMEOUT '+error);
};
async function cmd(method,params={}){
 const id=++serial;
 return await new Promise((ok,no)=>{
  const timer=setTimeout(()=>{pending.delete(id);no(Error('B234_CDP_TIMEOUT '+method));},30000);
  pending.set(id,{ok:v=>{clearTimeout(timer);ok(v);},
   no:e=>{clearTimeout(timer);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error('B234_PAGE_EXCEPTION '+JSON.stringify(r.exceptionDetails).slice(0,1000));
 return r.result?.value;
}
try{
 const chrome=process.env.T21_CHROME_PATH||
 ['google-chrome','google-chrome-stable','chromium','chromium-browser']
 .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)throw Error('B234_NO_CHROME');
 const srv=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(srv);
 await wait(async()=>{const r=await fetch(root);return r.ok;},45000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1200,800',
  '--remote-debugging-port=9259','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b234-chromium-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  const r=await fetch('http://127.0.0.1:9259/json');
  return (await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([new Promise((ok,no)=>{
  socket.addEventListener('open',ok,{once:true});
  socket.addEventListener('error',no,{once:true});
 }),sleep(12000).then(()=>{throw Error('B234_SOCKET_TIMEOUT');})]);
 socket.addEventListener('message',e=>{
  const data=JSON.parse(String(e.data)),p=pending.get(data.id);
  if(!p)return;pending.delete(data.id);
  if(data.error)p.no(Error(JSON.stringify(data.error)));
  else p.ok(data.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 const url=root+'?t21Play=preview&t21QaDrive=source&t21W10B234=realCpuGapReadiness';
 await cmd('Page.navigate',{url});
 const ready=await wait(async()=>{
  const x=await evaluate(`(()=>{const a=window.__t21F3?.snapshot?.();
   return a?{state:a.matchState,tick:a.tick,paused:a.paused,
    stopped:a.stopReason,stage:a.originalSourceSolids,
    paint:a.originalPaintSurfaces,links:a.originalSourceNavigationLinks,
    browserEnabled:document.querySelector('#app-canvas')?.dataset.t21B234RealCpuGapQa,
    readiness:a.b234RealCpuGapReadiness}:null})()`);
  return x?.readiness?.enabled&&x.readiness?.realCpuObjectsAudited===7?x:false;
 },100000);
 // Separate mere STAGING presence from ACTUAL moving CpuAgentSystem
 // actors. No in-browser actor setters or forced 60Hz ticks.
 const movementWitness=await wait(async()=>{
  const x=await evaluate(`(()=>{const q=window.__t21F3?.snapshot?.();
   return q?{stage:q.matchState,stopped:q.stopReason,
    actual:q.b234RealCpuGapReadiness}:null})()`);
  const a=x?.actual;
  if(!a||a.sampledNativeFrames<180||x.stopped)return false;
  const initial=ready.readiness.actualPhysicalCpuPositions;
  const displacement=a.actualPhysicalCpuPositions.map(now=>{
   const before=initial.find(v=>v.id===now.id);
   return {id:now.id,metres:before?Math.hypot(
    now.foot[0]-before.foot[0],now.foot[1]-before.foot[1],
    now.foot[2]-before.foot[2]):0};
  });
  const moved=displacement.filter(x=>x.metres>.30).length;
  return moved>0?{...x,displacement,moved}:false;
 },115000);
 const r=movementWitness.actual;
 const expected=['A1','A2','A3','B1','B2','B3','B4'];
 const pass=ready.browserEnabled==='FROZEN_25_READ_ONLY'&&
  ready.stage===25&&ready.paint===17&&ready.links===26&&
  r.realCpuObjectsAudited===7&&movementWitness.moved>0&&
  movementWitness.stage==='PLAYING'&&
  r.actualPhysicalCpuPositions?.length===7&&
  r.actualSevenCpuIds?.every((id,i)=>id===expected[i])&&
  r.anchors?.length===8&&r.authenticGapAnchorSupports===0&&
  r.anchors.every(a=>a.directlySupportedByFrozenSource===false&&
   a.navDirectlySupported===false)&&
  r.nativeCrowdAgentsPresent>=1&&r.realCrowdWithPhysicalCpuActors&&
  r.physicallyAuthorizedOriginalGapJumps===0&&!r.handoffAuthorized&&
  r.productionAuthorized===false&&r.officialWinner==='NONE'&&
  r.actorsTeleported===0&&r.extraOriginalCollisionSolids===0&&
  r.newOffmeshLinks===0&&r.originalOpponentRoutesCertified==='0/12'&&
  r.actualPhysicalCpuPositions.every(a=>a.foot.every(Number.isFinite));
 const result={pass,scenario:'REAL_F3_CHROMIUM_SEVEN_NATIVE_CPU_GAP_SOURCE_READINESS',
  ready:{state:ready.state,stage:ready.stage,paint:ready.paint,links:ready.links,
   browserEnabled:ready.browserEnabled},
  liveState:movementWitness.stage,
  actuallyMovedCpuCount:movementWitness.moved,
  genuineCpuDisplacementsMeters:movementWitness.displacement,
  final:r,
  truthfulOutcome:'BLOCKED_MISSING_ORIGINAL_CI688_COLLISION_AND_NAVMESH',
  actualCPUJumpTested:false,realOriginalRoutesCertified:'0/12'};
 writeFileSync(resolve(OUT,'b234-real-chromium-seven-cpu-readiness.json'),
  JSON.stringify(result,null,2));
 console.log('B234_REAL_CHROME_SEVEN_CPU_GAP_READINESS',JSON.stringify(result));
 if(!pass)throw Error('B234_STRICT_REAL_CPU_READINESS_WITNESS_FAILED');
}finally{
 try{socket?.close();}catch{}
 for(const c of children.reverse())try{c.kill('SIGKILL');}catch{}
}
