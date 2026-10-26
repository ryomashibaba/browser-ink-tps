#!/usr/bin/env node
/** B224 real CDP keyboard -> real PlayerInput -> real PlayerController QA. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
const ROOT='http://127.0.0.1:4197/browser-ink-tps/';
const OUT=process.env.T21_B224_OUT||'/tmp/t21-b224';
const children=[],pending=new Map();
let ws=null,sequence=0;
async function wait(fn,ms=45000){
 const until=Date.now()+ms;
 while(Date.now()<until){const v=await fn();if(v)return v;await sleep(150);}
 throw Error('B224_WAIT_TIMEOUT_'+ms);
}
async function cmd(method,params={}){
 const id=++sequence;
 return new Promise((ok,fail)=>{
  const t=setTimeout(()=>{pending.delete(id);fail(Error('B224_CDP_TIMEOUT_'+method));},20000);
  pending.set(id,{ok:v=>{clearTimeout(t);ok(v);},
   fail:e=>{clearTimeout(t);fail(e);}});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function read(expression){
 const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(r.exceptionDetails)throw Error('B224_PAGE_EXCEPTION_'+JSON.stringify(r.exceptionDetails));
 return r.result?.value;
}
async function key(code,down){
 const char=code==='KeyW'?'w':code==='KeyS'?'s':' ';
 const codeValue=code==='Space'?32:code==='KeyW'?87:83;
 await cmd('Input.dispatchKeyEvent',{
  type:down?'keyDown':'keyUp',code,key:char,
  windowsVirtualKeyCode:codeValue,nativeVirtualKeyCode:codeValue});
}
async function click(){
 for(const type of ['mousePressed','mouseReleased'])
  await cmd('Input.dispatchMouseEvent',{type,x:500,y:330,
   button:'left',clickCount:1});
}
async function scenario(side,direction){
 const url=ROOT+'?t21Qa=b224OriginalGapInput&t21B224Source=isolated-ci688'+
  '&side='+side+'&direction='+direction;
 await cmd('Page.navigate',{url});
 const initial=await wait(async()=>{
  try{const o=await read('window.__t21B224?.snapshot()');
   return o?.ready?o:false;}catch{return false;}
 },90000);
 if(initial.initialSupport===null||!initial.originalSolidsStill25||
    !initial.originalPaintStill17||!initial.originalNavLinksStill26||
    initial.sourceScoreablePromotions!==0||initial.productionAuthorized!==false||
    initial.physicalSolidsInsideQa!==27)throw Error('B224_SOURCE_BOOT_UNTRUSTED');
 await click();
 await wait(()=>read('document.pointerLockElement===document.querySelector("#app-canvas")'),10000);
 // B224 original source model/project registration rotates the XZ crossing:
 // the authentic target changes X ~-1.278m and Z ~-2.607m.
 // Genuine CDP mouseLook (not QA pose/axis injection) rotates the camera
 // ~-26 degrees so that the existing W/S input points at the actual mesh.
 await cmd('Input.dispatchMouseEvent',{
  type:'mouseMoved',x:381,y:330,button:'none'});
 const oriented=await wait(async()=>{
  const p=await read('window.__t21B224.snapshot()');
  return p&&Math.abs(p.actualCameraYawDegrees+26.12)<4?p:false;
 },6000);
 if(!oriented.pointerLocked)throw Error('B224_MOUSE_LOOK_NO_POINTER_LOCK');
 const w= (side==='POSITIVE_Z')===(direction==='FLOOR_TO_SLOPE');
 const moveKey=w?'KeyW':'KeyS';
 await key(moveKey,true);
 const pre=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  const d=Math.hypot(o.playerPosition[0]-o.start[0],o.playerPosition[2]-o.start[2]);
  return d>=.13&&d<=.75?o:false;
 },7000);
 if(!pre.grounded)throw Error('B224_TAKEOFF_NOT_GROUNDED_'+side+direction);
 await key('Space',true);await key('Space',false);
 const near=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  const d=Math.hypot(o.playerPosition[0]-o.target[0],
   o.playerPosition[2]-o.target[2]);
  return o.successTick!==null||d<.58||o.tick>pre.tick+90?o:false;
 },14000);
 await key(moveKey,false);
 const end=await wait(async()=>{
  const o=await read('window.__t21B224.snapshot()');
  return o.successTick!==null||o.tick>=near.tick+30?o:false;
 },7000);
 const result={side,direction,oriented,pre,near,end,
  actualKeydown:true,realPlayerController:true,actorTeleports:0};
 console.log('B224_REAL_BROWSER_SOURCE_JUMP',JSON.stringify({
  side,direction,atTick:end.tick,jumpInputs:end.validJumpInputs,
  firstJumpTick:end.firstJumpTick,successTick:end.successTick,
  initialSupport:end.initialSupport,landingSupport:end.firstLandingSupport,
  minTargetError:end.minimumTargetErrorMeters,collisionsWithOriginal:
   end.originalColliderContactCount,afterLanding:end.grounded,
  nativeWorldPosition:end.playerPosition,
  physicalSourceReach:end.physicallyEnteredTarget}));
 return result;
}
try{
 mkdirSync(OUT,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)throw Error('B224_NO_CHROME');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},25000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--disable-extensions','--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--remote-debugging-port=9264','--remote-allow-origins=*',
  '--window-size=1000,660','--user-data-dir=/tmp/t21-b224-cdp','about:blank'],
  {stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  try{return (await (await fetch('http://127.0.0.1:9264/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 },35000);
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((resolve,reject)=>{
   ws.addEventListener('open',resolve,{once:true});
   ws.addEventListener('error',reject,{once:true});}),
  sleep(10000).then(()=>{throw Error('B224_WS_TIMEOUT');})
 ]);
 ws.addEventListener('message',evt=>{
  const m=JSON.parse(String(evt.data)),p=pending.get(m.id);if(!p)return;
  pending.delete(m.id);
  if(m.error)p.fail(Error(JSON.stringify(m.error)));else p.ok(m.result||{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{
  width:1000,height:660,deviceScaleFactor:1,mobile:false});
 const reports=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'])
  for(const direction of ['FLOOR_TO_SLOPE','SLOPE_TO_FLOOR'])
   reports.push(await scenario(side,direction));
 const summary={schema:'B224_REAL_CDP_INPUT_PLAYERCONTROLLER_RAPIER',
  qaOnly:true,productionAuthorized:false,scoreable:0,
  sourceStage25_17_26_0:true,actorTeleportsAfterSpawn:0,
  nativeRealPlayerKeyboard:true,realBrowserWebGL2:true,
  completed:reports.length,
  successCount:reports.filter(x=>x.end.successTick!==null).length,
  reports};
 writeFileSync(resolve(OUT,'b224-native-input-rapier.json'),JSON.stringify(summary,null,2));
 console.log('B224_REAL_KEYBOARD_FINAL',JSON.stringify({tested:summary.completed,
  success:summary.successCount,sourceStage25_17_26_0:true}));
 if(summary.successCount!==4)throw Error('B224_REAL_INPUT_4_OF_4_NOT_CERTIFIED');
}catch(e){console.error(e);process.exitCode=1;}
finally{ws?.close();for(const child of children)child.kill('SIGTERM');}
