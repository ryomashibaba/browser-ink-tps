#!/usr/bin/env node
/** B385: real CDP input -> user-visible B384 switch -> new original SOURCE
 * WebGL2/7 CPU -> native READY 12-weapon selection -> actual KCC/fire ->
 * real 180 second terminal (or honest HOLD). No time, actor, aim, score,
 * camera, projectiles, ink, HP or native step injection.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {createHash} from 'node:crypto';

const ROOT='http://127.0.0.1:4193/browser-ink-tps/';
const OUT=process.env.T21_B385_OUTPUT||'/tmp/t21-b385';
const children=[],pending=new Map(),observations=[];
let socket=null,sequence=0;
const report={schema:'B385_REAL_CHROMIUM_NATIVE_SOURCE_SELECTABLE_ROUND',
 source:'25/17/26/0',artAccepted:false,officialWinner:'NONE',
 naturalOpponentRoutesCertified:0,activationReady:false,
 realUserClicks:0,realKeyboardSelect:false,realPointerLock:false,
 injectedNativeTicks:0,injectedActorPositions:0,injectedInk:0,
 phases:[],outcome:'NOT_RUN'};
function persist(){writeFileSync(resolve(OUT,'b385-native-source.json'),JSON.stringify({...report,observations},null,2)+'\n')}
function fail(message,extra){report.outcome='HOLD_'+message;report.lastError=extra??null;persist();throw Error('B385_'+message+' '+JSON.stringify(extra??{}).slice(0,700))}
async function until(read,ms=90000){
 const end=Date.now()+ms;let err='';
 while(Date.now()<end){try{const v=await read();if(v)return v}catch(e){err=String(e)}
  await sleep(350)}
 fail('TIMEOUT',{ms,lastError:err});
}
async function cmd(method,params={}){
 const id=++sequence;
 return await new Promise((ok,no)=>{
  const timeout=setTimeout(()=>{pending.delete(id);no(Error('CDP_TIMEOUT_'+method))},25000);
  pending.set(id,{ok:r=>{clearTimeout(timeout);ok(r)},no:e=>{clearTimeout(timeout);no(e)}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evalPage(expression){
 const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error('PAGE_EXCEPTION_'+(r.exceptionDetails.exception?.description??r.exceptionDetails.text));
 return r.result?.value;
}
const state=()=>evalPage('window.__t21F3.snapshot()');
const key=async(type,key,code,codeNumber)=>cmd('Input.dispatchKeyEvent',{
 type,key,code,windowsVirtualKeyCode:codeNumber,nativeVirtualKeyCode:codeNumber
});
async function clickAt(x,y,button='left'){
 await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await cmd('Input.dispatchMouseEvent',{type,x,y,button,clickCount:1});
 report.realUserClicks++;
}
async function visible(selector){
 return evalPage(`(()=>{
  const e=document.querySelector(${JSON.stringify(selector)});
  if(!e||e.disabled||e.hidden)return null;
  e.scrollIntoView({block:'center',behavior:'instant'});
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {text:e.textContent,value:e.value,count:e.options?.length,
   x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,
   display:s.display,visibility:s.visibility};
 })()`);
}
async function clickButton(selector){
 const el=await visible(selector);
 if(!el||el.w<5||el.h<5||el.display==='none'||el.visibility==='hidden'||
    !(el.x>0&&el.x<1600&&el.y>0&&el.y<900))fail('INVISIBLE_BUTTON',{selector,el});
 await clickAt(el.x,el.y);return el;
}
async function picture(label){
 const r=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 const png=Buffer.from(r.data??'','base64');
 if(png.length<10000||png.readUInt32BE(16)!==1600||png.readUInt32BE(20)!==900)
  fail('NO_REAL_1600x900_FRAME',{label,size:png.length});
 writeFileSync(resolve(OUT,label+'.png'),png);
 const img={label,bytes:png.length,sha256:createHash('sha256').update(png).digest('hex')};
 report.phases.push({frame:img});persist();
}
function original(s,stage){
 if(!s||s.stopReason||s.originalSourceSolids!==25||
    s.originalPaintSurfaces!==17||s.originalSourceNavigationLinks!==26||
    s.sourceScoreablePromotions!==0||s.productionAuthorized!==false||
    s.unrestricted4v4Certified!==false||s.cpu?.physicalFootRelocations!==0||
    !Array.isArray(s.cpu.cpu)||s.cpu.cpu.length!==7||
    s.b183OriginalHumanDescent?.enabled!==true||
    s.b186RealOriginalHumanCircuit?.enabled!==true||
    s.b186RealOriginalHumanCircuit?.naturalCrossTeamRouteProven!==false||
    s.b186RealOriginalHumanCircuit?.officialWinner!=='NONE'||
    s.b384OpenLoadoutCircuit!==true)
  fail('FROZEN_SOURCE_AUTHORITY',{stage,tick:s?.tick,stop:s?.stopReason,
   source:s&&[s.originalSourceSolids,s.originalPaintSurfaces,s.originalSourceNavigationLinks,s.sourceScoreablePromotions],
   cpuCount:s?.cpu?.cpu?.length,sourceCircuit:s?.b384OpenLoadoutCircuit});
 return s;
}
async function run(){
 mkdirSync(OUT,{recursive:true});persist();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true}catch{return false}});
 if(!chrome)fail('CHROMIUM_MISSING');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4193','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await until(async()=>{try{return (await fetch(ROOT)).ok}catch{return false}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9285','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b385-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXIT');
  try{return (await (await fetch('http://127.0.0.1:9285/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl)}catch{return null}
 },60000);
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});
  socket.addEventListener('error',no,{once:true})});
 socket.addEventListener('message',ev=>{
  const msg=JSON.parse(String(ev.data)),p=pending.get(msg.id);if(!p)return;
  pending.delete(msg.id);msg.error?p.no(Error(JSON.stringify(msg.error))):p.ok(msg.result??{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 // User starts from actual QA preview, NOT directly invented B384 flags.
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview&t21QaDrive=source'});
 await until(()=>evalPage(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),120000);
 const origin=await evalPage('performance.timeOrigin');
 const control=await clickButton('#t21-f3-b384-source-circuit');
 if(!control.text.includes('CHOOSE 1 OF 12 WEAPONS'))fail('BUTTON_LABEL',control);
 const joined=await until(async()=>{
  const v=await evalPage(`(()=>{
   const s=window.__t21F3?.snapshot?.(),c=document.querySelector('#app-canvas');
   return s?{origin:performance.timeOrigin,search:location.search,
    renderer:c?.dataset.t21F3Renderer,ready:c?.dataset.t21F3Ready,
    tick:s.tick,paused:s.paused,matchState:s.matchState,
    original:s.originalSourceSolids+'/'+s.originalPaintSurfaces+'/'+
     s.originalSourceNavigationLinks+'/'+s.sourceScoreablePromotions,
    selected:s.b384OpenLoadoutCircuit}:null;
  })()`);
  return v?.origin>origin&&v?.selected&&v?.ready==='READY'?v:false;
 },120000);
 if(joined.search!=='?t21Play=preview&t21QaDrive=source&'+
  't21W10B112=humanGround&t21W10B183=firstDropPlay&'+
  't21W10B192=humanCombat&t21W10B203=fullRound&'+
  't21W10B384=loadoutCircuit'||joined.tick!==0||!joined.paused||
  joined.matchState!=='STAGING'||joined.original!=='25/17/26/0')
  fail('NOT_FRESH_B384_NATIVE_WORLD',joined);
 const before=original(await state(),'FRESH_SELECTED_SOURCE');
 report.phases.push({phase:'USER_NAVIGATED_TO_NEW_ORIGINAL_SOURCE_WORLD',
  newTimeOrigin:joined.origin,initialTick:joined.tick,
  physicalCpuCount:before.cpu.cpu.length,matchState:before.matchState});persist();
 const select=await visible('#t21-f3-b378-weapon');
 if(!select||select.count!==12||select.value!=='pulse-sprayer')
  fail('REAL_READY_SELECT_NOT_FOUND',select);
 await clickButton('#t21-f3-b378-weapon');
 for(let i=0;i<2;i++){await key('rawKeyDown','ArrowDown','ArrowDown',40);
  await key('keyUp','ArrowDown','ArrowDown',40)}
 await key('rawKeyDown','Enter','Enter',13);await key('keyUp','Enter','Enter',13);
 await key('rawKeyDown','Tab','Tab',9);await key('keyUp','Tab','Tab',9);
 const selected=await until(async()=>{
  const s=original(await state(),'USER_SELECTED_WEAPON');
  const value=await evalPage('document.querySelector("#t21-f3-b378-weapon")?.value');
  return value==='twin-comets'&&s.b381RealNativeDodge.realWeapon==='twin-comets'?s:false;
 },20000);
 if(selected.tick!==0||!selected.paused||selected.timeRemainingSeconds!==180)
  fail('READY_REAL_WORLD_ADVANCED_ON_WEAPON_CHOICE');
 report.realKeyboardSelect=true;
 report.phases.push({phase:'NATIVE_12_CHOICE_UI_SELECTED_TWIN_COMETS',
  actualWeapon:selected.b381RealNativeDodge.realWeapon,unchangedTick:selected.tick});
 await picture('b385-real-native-12-weapon-ready');
 const playGoal=await evalPage(`(()=>{
  const e=document.querySelector('#t21-f3-b183-real-first-drop'),r=e?.getBoundingClientRect();
  return {presentation:document.querySelector('#ui-root')?.dataset.t21B245Presentation,
   goalDisplay:e?getComputedStyle(e).display:null,goalWidth:r?.width??0,
   selectedWeapon:document.querySelector('#t21-f3-b378-weapon')?.value};
 })()`);
 if(playGoal.presentation!=='PLAYER'||playGoal.goalDisplay==='none'||
    playGoal.goalWidth<=10)fail('HIDDEN_SOURCE_GOAL_IN_REAL_PLAYER_VIEW',playGoal);
 await clickButton('#t21-f3-b202-resume');
 await until(()=>evalPage('document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 report.realPointerLock=true;
 const start=await until(async()=>{
  const s=original(await state(),'ACTUAL_POINTER_START');
  return !s.paused&&s.tick>0?s:false;
 },90000);
 await key('keyDown','w','KeyW',87);
 await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
 const played=await until(async()=>{
  const s=original(await state(),'LIVE_KCC_AND_SHOT');
  return s.tick>=start.tick+90&&s.shotsFired>start.shotsFired?s:false;
 },150000);
 await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
 await key('keyUp','w','KeyW',87);
 const moved=Math.hypot(...played.player.position.map((v,i)=>v-start.player.position[i]));
 if(moved<=0.15)fail('NO_REAL_KCC_POSITION_CHANGE',{start:start.player.position,end:played.player.position,moved});
 report.phases.push({phase:'ACTUAL_KCC_AND_TWIN_COMETS_SHOTS',
  movedMeters:moved,shots:played.shotsFired-start.shotsFired,
  sourceInk:played.b23HumanInkFeedback.humanChangedCells,
  currentLifeCircuit:played.b186RealOriginalHumanCircuit.status,
  missionGoal:await evalPage('document.querySelector("#t21-f3-b183-real-first-drop")?.dataset.b371SourceStep')});
 await picture('b385-real-native-playing');
 persist();console.log('B385_ACTUAL_CHROME_NATIVE_INPUT_PASS',JSON.stringify(report.phases.at(-2)));
 // The round must end through the ACTUAL fixed-step clock, not clock injection.
 let previousTick=played.tick,lastProgress=Date.now(),lastSaved=0;
 const startWall=Date.now();
 while(Date.now()-startWall<1150000){
  await sleep(2500);
  const s=original(await state(),'WAIT_NATIVE_180S');
  if(s.tick>previousTick){previousTick=s.tick;lastProgress=Date.now()}
  if(Date.now()-lastProgress>120000)fail('NATIVE_60HZ_STALLED',
   {tick:s.tick,remaining:s.timeRemainingSeconds,paused:s.paused});
  if(Date.now()-lastSaved>20000||s.matchState==='TIME_UP'){
   const x={tick:s.tick,elapsedSeconds:180-s.timeRemainingSeconds,
    stage:s.matchState,cpuRejoined:s.cpu.physicalRejoins.length,
    humanShots:s.shotsFired,humanInk:s.b23HumanInkFeedback.humanChangedCells,
    realCircuit:s.b186RealOriginalHumanCircuit.status};
   observations.push(x);if(observations.length>120)observations.shift();
   lastSaved=Date.now();persist();
   console.log('B385_NATIVE_180S_HEARTBEAT',JSON.stringify(x));
  }
  if(s.matchState==='TIME_UP'){
   if(s.timeRemainingSeconds!==0||s.tick<=played.tick||
      s.sourceScoreablePromotions!==0)fail('FALSE_TIME_UP',s);
   const ui=await evalPage(`(()=>{
    const p=document.querySelector('#t21-f3-b59-session-finished');
    return {display:p?getComputedStyle(p).display:null,
     hidden:p?.hidden,state:p?.dataset.t21B59State,
     winner:p?.dataset.t21B59OriginalWinner,
     score:p?.dataset.b373NoScoring,
     circuit:p?.dataset.b373RealSourceCircuit,
     humanHits:p?.dataset.b373RealHumanCpuHits};
   })()`);
   if(ui.state!=='FINISHED'||ui.winner!=='NONE'||ui.score!=='true'||
      ui.hidden||ui.display==='none')fail('REAL_180S_RECAP_MISSING',ui);
   report.phases.push({phase:'REAL_180S_END',actualTick:s.tick,
    actualSeconds:180,recap:ui,actualHumanInkCells:s.b23HumanInkFeedback.humanChangedCells,
    physicalCircuit:s.b186RealOriginalHumanCircuit.status,
    localCircuitClear:s.b186RealOriginalHumanCircuit.sourceLocalPlayClear});
   await picture('b385-native-180s-unscored-recap');
   report.outcome='PASS_REAL_B384_USER_SELECT_AND_180S_SOURCE_PRACTICE';
   report.note='Only native gameplay/clock and actual session recap certified. Physical 3/3 original ramp/impact clear and natural cross-team encounter remain independently unproven unless observed.';
   persist();console.log('B385_REAL_NATIVE_SOURCE_ROUND_PASS',JSON.stringify(report.phases.at(-2)));
   return;
  }
 }
 fail('NATIVE_180S_TIMEOUT',{last:observations.at(-1)});
}
try{await run()}catch(err){report.lastError=String(err);persist();console.error(err);process.exitCode=1}
finally{socket?.close();for(const child of children)child.kill('SIGTERM')}
