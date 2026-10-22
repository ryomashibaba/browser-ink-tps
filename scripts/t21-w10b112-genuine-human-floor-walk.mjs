#!/usr/bin/env node
/**
 * W10-B112: one REAL Chromium/PlayCanvas/WebGL2 + original Rapier KCC
 * human walking witness. Never uses qaDriveTicks, setPosition or fake floors.
 * A limited upper-stage path is NOT certification of the complete map.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';

const root='http://127.0.0.1:4197/browser-ink-tps/';
const output=process.env.T21_B112_EVIDENCE_DIR??'/tmp/t21-b112';
const children=[];
let sock,id=0;
const pending=new Map();
const fail=(name,extra)=>{throw Error('T21_B112_'+name+
 (extra===undefined?'':'_'+JSON.stringify(extra)));};
async function until(fn,ms=120000,poll=150){
 const limit=Date.now()+ms;
 while(Date.now()<limit){
  const v=await fn();if(v)return v;await sleep(poll);
 }
 fail('TIMEOUT',{ms});
}
async function cmd(method,params={}){
 if(sock?.readyState!==WebSocket.OPEN)fail('CDP_DISCONNECTED');
 const seq=++id;
 return await new Promise((yes,no)=>{
  const timer=setTimeout(()=>{pending.delete(seq);no(Error('T21_B112_CDP_TIMEOUT_'+method));},25000);
  pending.set(seq,{
   yes:value=>{clearTimeout(timer);yes(value);},
   no:err=>{clearTimeout(timer);no(err);}
  });
  sock.send(JSON.stringify({id:seq,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION',r.exceptionDetails);
 return r.result?.value;
}
const key={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
const click=type=>cmd('Input.dispatchMouseEvent',
 {type,x:800,y:450,button:'left',clickCount:1});
function verify(n){
 if(n.stopReason||n.originalSourceSolids!==25||
    n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
    n.unrestricted4v4Certified!==false||n.cpu.physicalFootRelocations!==0)
  fail('SOURCE_AUTHORITY_DRIFT',{tick:n.tick,reason:n.stopReason});
 if(n.b112OriginalHumanGround?.enabled!==true||
    n.b112OriginalHumanGround?.sourceFloorHoleCertified!==false||
    n.b112OriginalHumanGround?.originalStageGeometryModified!==false||
    n.b112OriginalHumanGround?.noActorPositionMutation!==true)
  fail('B112_READ_ONLY_LEDGER_AUTHORITY_MISSING');
 return n;
}
async function run(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_NOT_INSTALLED');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000,250);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9281','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b112-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9281/json')).json())
   .find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  }catch{return null;}
 },60000,250);
 sock=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([new Promise((yes,no)=>{
  sock.addEventListener('open',yes,{once:true});
  sock.addEventListener('error',no,{once:true});
 }),sleep(12000).then(()=>{throw Error('T21_B112_WEBSOCKET_TIMEOUT');})]);
 sock.addEventListener('message',ev=>{
  const data=JSON.parse(String(ev.data)),p=pending.get(data.id);
  if(!p)return;pending.delete(data.id);
  if(data.error)p.no(Error(JSON.stringify(data.error)));
  else p.yes(data.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:root+'?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'});
 await until(async()=>await evaluate(`(()=>{
  const c=document.querySelector('#app-canvas');
  return c?.dataset.t21F3Ready==='READY'&&c?.dataset.t21F3Renderer==='webgl2';
 })()`),100000,450);
 const snapshot=async()=>verify(await evaluate('window.__t21F3.snapshot()'));
 const initial=await snapshot();
 if(initial.matchState!=='STAGING')fail('BAD_NATIVE_START');
 await click('mousePressed');await click('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),20000,150);
 const first=await snapshot();
 const targetTick=first.tick+120;
 const samples=[];
 let later;
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...key});
 try{
  later=await until(async()=>{
   const n=await snapshot();
   if(samples.length===0||n.tick-samples.at(-1).tick>=12)
    samples.push({tick:n.tick,body:n.player.position,
     grounded:n.b112OriginalHumanGround.genuineKccGrounded,
     originalSupport:n.b112OriginalHumanGround.lastOriginalSourceHitId,
     suspectedDescents:n.b112OriginalHumanGround.suspicionCount});
   return n.tick>=targetTick?n:false;
  },180000,150);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...key});
 }
 const end=await snapshot();
 const moved=Math.hypot(
  end.player.position[0]-first.player.position[0],
  end.player.position[2]-first.player.position[2]
 );
 if(moved<.5)fail('GENUINE_PLAYER_DID_NOT_WALK',{moved,from:first.player.position,to:end.player.position});
 const frame=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true
 })).data||'','base64');
 if(frame.length<10000)fail('REAL_SCREENSHOT_EMPTY');
 const evidence={
  schema:'W10_B112_GENUINE_HUMAN_GROUND_SUPPORT_WALK_V1',
  environment:'HEADLESS_CHROME_SOFTWARE_WEBGL2_NOT_OWNER_GPU',
  actualRealChromeWKey:true,sourcePhysicsAuthority:[25,17,26,0],
  firstNativeTick:first.tick,lastNativeTick:end.tick,
  actualNativeHumanStartingBody:first.player.position,
  actualNativeHumanEndingBody:end.player.position,
  actualHorizontalDisplacementMeters:moved,
  samples,actualNativeGroundSupport:end.b112OriginalHumanGround,
  observedSourceFallSuspicionCount:end.b112OriginalHumanGround.suspicionCount,
  observedMapCoverage:'LIMITED_UPPER_SOURCE_WALK_ONLY',
  anySuspectedFloorHoleProven:false,
  originalSourceGeometryChanged:false,scoreablePromotion:0,
  originalCrossTeamPathsCertified:false,formal4v4Certified:false,
  screenshot:{filename:'b112-real-source-human-walk.png',
   bytes:frame.length,sha256:createHash('sha256').update(frame).digest('hex')}
 };
 writeFileSync(resolve(output,evidence.screenshot.filename),frame);
 writeFileSync(resolve(output,'b112-real-source-foot-walk.json'),JSON.stringify(evidence,null,2));
 console.log('T21_B112_REAL_ORIGINAL_RAPIER_HUMAN_FOOT_WITNESS',JSON.stringify({
  nativeTicks:end.tick-first.tick,horizontalMovedMeters:moved,
  body:end.player.position,
  genuineRaySupportId:end.b112OriginalHumanGround.lastOriginalSourceHitId,
  suspicionCount:end.b112OriginalHumanGround.suspicionCount,
  actualSourceAuthority:[25,17,26,0],completeMapCertified:false
 }));
}
try{await run();}
catch(e){console.error(e);process.exitCode=1;}
finally{sock?.close();for(const p of children)p.kill('SIGTERM');}
