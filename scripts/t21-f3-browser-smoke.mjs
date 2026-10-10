#!/usr/bin/env node
/** F3 real Chrome WebGL2 + trusted keyboard/mouse + framebuffer smoke.
 * Unlike the 60Hz F2 Vitest, this proves that the opt-in browser scene
 * actually boots and that PlayerInput can move/shoot without source mutation.
 * No T21 release, win/scoring or unrestricted 4v4 certification is implied.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';

const ROOT='http://127.0.0.1:4196/browser-ink-tps/';
const OUTPUT=process.env.T21_F3_SHOT_DIR||'/tmp/t21-f3-playable-webgl2';
const children=[],pending=new Map();
let socket=null,sequence=0;
function reject(reason){throw Error('T21_F3_BROWSER_'+reason);}
async function waitUntil(fn,ms=45000){
 const deadline=Date.now()+ms;let reason='';
 while(Date.now()<deadline){
  try{const answer=await fn();if(answer)return answer;}
  catch(e){reason=String(e);}
  await sleep(220);
 }
 reject('TIMEOUT '+reason);
}
async function cmd(method,params={}){
 if(!socket||socket.readyState!==WebSocket.OPEN)
  reject('CDP_NOT_CONNECTED');
 const id=++sequence;
 return await new Promise((ok,no)=>{
  const timeout=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT '+method));},25000);
  pending.set(id,{ok:v=>{clearTimeout(timeout);ok(v);},
   no:e=>{clearTimeout(timeout);no(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)reject('PAGE_EXCEPTION '+JSON.stringify(r.exceptionDetails).slice(0,600));
 return r.result?.value;
}
const key=(type)=>cmd('Input.dispatchKeyEvent',{
 type,key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87
});
const mouse=(type)=>cmd('Input.dispatchMouseEvent',{
 type,x:800,y:450,button:'left',clickCount:1
});
async function screenshot(name){
 const png=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true
 })).data||'','base64');
 if(png.length<10000||png.readUInt32BE(16)!==1600||
    png.readUInt32BE(20)!==900||png.subarray(1,4).toString()!=='PNG')
  reject('BAD_REAL_GPU_FRAMEBUFFER_'+name);
 writeFileSync(resolve(OUTPUT,name+'.png'),png);
 return {name,bytes:png.length,
  sha256:createHash('sha256').update(png).digest('hex')};
}
async function main(){
 mkdirSync(OUTPUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(v=>{try{execFileSync('which',[v],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)reject('CHROME_MISSING');
 const server=spawn('npm',['run','preview','--',
  '--host','127.0.0.1','--port','4196','--strictPort',
  '--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await waitUntil(async()=>{const r=await fetch(ROOT);return r.ok;},30000);
 const browser=spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--disable-background-networking',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9256','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-f3-cdp-profile','about:blank'
 ],{stdio:'ignore'});
 children.push(browser);
 const tab=await waitUntil(async()=>{
  if(browser.exitCode!==null)reject('CHROME_EXITED');
  const r=await fetch('http://127.0.0.1:9256/json');
  return (await r.json()).find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   socket.addEventListener('open',ok,{once:true});
   socket.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('CDP_SOCKET_TIMEOUT');})
 ]);
 socket.addEventListener('message',event=>{
  const response=JSON.parse(String(event.data));
  const waiter=pending.get(response.id);
  if(!waiter)return;
  pending.delete(response.id);
  if(response.error)waiter.no(Error(JSON.stringify(response.error)));
  else waiter.ok(response.result||{});
 });
 await cmd('Page.enable');
 await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false
 });
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'});
 await waitUntil(async()=>{
  const ready=await evaluate(`({
   ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
   renderer:document.querySelector('#app-canvas')?.dataset.t21F3Renderer,
   error:document.querySelector('#boot-error')?.textContent||''
  })`);
  if(ready.error)reject('APP_BOOT '+ready.error.slice(0,1600));
  return ready.ready==='READY'&&ready.renderer==='webgl2';
 },65000);
 const initial=await evaluate('window.__t21F3.snapshot()');
 if(initial.phase!=='F3'||!initial.playableSandbox||
  initial.productionAuthorized!==false||
  initial.visualFreezeApproved!==false||
  initial.sourceScoreablePromotions!==0||
  initial.originalSourceSolids!==25||
  initial.originalPaintSurfaces!==17||
  initial.originalSourceNavigationLinks!==26||
  initial.cpu.originalSourceLinksUsed!==8||
  initial.unrestricted4v4Certified!==false)
  reject('SOURCE_AUTHORITY_OR_STARTUP_DRIFT_'+JSON.stringify(initial));
 const frames=[await screenshot('F3_0_SOURCE_STAGE')];
 await waitUntil(async()=>{
  const s=await evaluate('window.__t21F3.snapshot()');
  if(s.stopReason)reject('PREINPUT_FAIL_CLOSED_'+s.stopReason);
  return s.tick>40?s:false;
 },25000);
 await mouse('mousePressed');await mouse('mouseReleased');
 const locked=await waitUntil(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),12000);
 if(!locked)reject('MOUSE_LOCK_MISSING');
 const before=await evaluate('window.__t21F3.snapshot()');
 await key('keyDown');await sleep(1250);await key('keyUp');
 const after=await evaluate('window.__t21F3.snapshot()');
 const move=Math.hypot(...after.player.position.map((v,i)=>v-before.player.position[i]));
 if(move<.18||move>10||after.stopReason)
  reject('REAL_KEYBOARD_PLAYER_MOVEMENT_FAILED_'+JSON.stringify({move,after}));
 await mouse('mousePressed');
 await sleep(1500);
 await mouse('mouseReleased');
 const fired=await evaluate('window.__t21F3.snapshot()');
 if(fired.shotsFired<=after.shotsFired||fired.stopReason)
  reject('REAL_MOUSE_PROJECTILE_OR_PHYSICS_FAILED_'+JSON.stringify({
   before:after.shotsFired,after:fired.shotsFired,reason:fired.stopReason
  }));
 frames.push(await screenshot('F3_1_REAL_INPUT_AND_INK'));
 const out={status:'PASS_REAL_CHROME',
  revision:process.env.GITHUB_SHA||'unknown',
  renderer:'webgl2',realKeyboardMeters:move,
  originalSourceSolids:25,scoreablePromotions:0,
  realPlayerShotCount:fired.shotsFired,
  cpuFirstDropCount:fired.cpu.physicalFirstDrops.length,
  cpuRejoinCount:fired.cpu.physicalRejoins.length,
  unrestricted4v4Certified:false,
  productionAuthorized:false,frames,
  totalRealTicks:fired.tick};
 writeFileSync(resolve(OUTPUT,'t21-f3-browser-evidence.json'),
  JSON.stringify(out,null,2));
 console.log('T21_F3_REAL_BROWSER_PLAYABLE_PASS',JSON.stringify(out));
}
try{await main();}
catch(err){console.error(err);process.exitCode=1;}
finally{
 socket?.close();
 for(const child of children)child.kill('SIGTERM');
}
