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
import {b390RunTrue180} from './t21-b390-real-source-timeup.mjs';

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
 // B386 player launch begins at normal preview with no QA flag.
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'});
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

 // The prior 90 native ticks were still STAGING. B183 only trusts real
 // source drop in PLAYING. Seven Rapier/Recast CPUs must rejoin naturally.
 const playing=await until(async()=>{
  const s=original(await state(),'WAIT_REAL_CPU_SEVEN');
  if(s.matchState==='TIME_UP')fail('ROUND_ENDED_BEFORE_NATIVE_ROUTE');
  return s.matchState==='PLAYING'&&s.cpu.physicalRejoins.length===7?s:false;
 },300000);
 const yaw=playing.cameraSourcePractice?.yawDegrees;
 if(!Number.isFinite(yaw)||Math.abs(yaw)>1)
  fail('ORIGINAL_ROUTE_REAL_CAMERA_YAW_DRIFT',{yaw});
 report.phases.push({phase:'ACTUAL_SEVEN_CPU_PLAYING',tick:playing.tick,
  actualNativeCpu:playing.cpu.physicalRejoins.length,body:playing.player.position});
 persist();
 // Already proven with real CDP source input in B366, NOT by altering KCC.
 const stages=[
  {name:'FIRST_DROP_W200',key:'w',code:'KeyW',vk:87,ticks:200},
  {name:'LOWER_RIGHT_D12',key:'d',code:'KeyD',vk:68,ticks:12},
  {name:'LOWER_FORWARD_W18',key:'w',code:'KeyW',vk:87,ticks:18},
  {name:'ORIGINAL_RAMP_D90',key:'d',code:'KeyD',vk:68,ticks:90}
 ];
 for(const q of stages){
  const before=original(await state(),'BEFORE_'+q.name);
  await key('keyDown',q.key,q.code,q.vk);
  let after;
  try{
   if(q.name==='FIRST_DROP_W200')
    await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
     x:800,y:450,button:'left',clickCount:1});
   after=await until(async()=>{
    const x=original(await state(),q.name);
    const raised=q.name==='ORIGINAL_RAMP_D90'&&
     x.b112OriginalHumanGround?.genuineKccGrounded===true&&
     x.b112OriginalHumanGround?.lastOriginalSourceHitId==='UndertowT21D:right-low-team-a';
    return x.tick>=before.tick+q.ticks||raised?x:false;
   },180000);
  }finally{
   if(q.name==='FIRST_DROP_W200')
    await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
     x:800,y:450,button:'left',clickCount:1});
   await key('keyUp',q.key,q.code,q.vk);
  }
  const record={phase:q.name,actualTicks:after.tick-before.tick,
   realBody:after.player.position,
   foot:after.b112OriginalHumanGround?.lastOriginalSourceHitId,
   nativeGrounded:after.b112OriginalHumanGround?.genuineKccGrounded,
   nativeDescent:after.b183OriginalHumanDescent?.status,
   nativeCircuit:after.b186RealOriginalHumanCircuit?.status,
   trueShots:after.shotsFired,trueInk:after.b23HumanInkFeedback.humanChangedCells};
  report.phases.push(record);persist();
  console.log('B385_REAL_ORIGINAL_ROUTE',JSON.stringify(record));
 }
 const raised=original(await state(),'ACTUAL_RAISED_SOURCE');
 const circuit=raised.b186RealOriginalHumanCircuit,
  drop=raised.b183OriginalHumanDescent,
  foot=raised.b112OriginalHumanGround;
 if(raised.shotsFired<=playing.shotsFired||
    raised.b23HumanInkFeedback.humanChangedCells<=
     playing.b23HumanInkFeedback.humanChangedCells)
  fail('NO_REAL_TWIN_COMETS_SHOTS_OR_INK');
 if(drop?.originalFirstDropLocalPracticeClear!==true||
    drop?.actualOriginalRapierLowerLandingId!==
     'UndertowT21D:first-drop-landing-positive-z'||
    circuit?.actualOriginalRampTouched!==true||
    circuit?.actualOriginalRaisedFootColliderId!=='UndertowT21D:right-low-team-a'||
    circuit?.genuineGroundedTravelMeters<2||
    foot?.genuineKccGrounded!==true||
    foot?.lastOriginalSourceHitId!=='UndertowT21D:right-low-team-a')
  fail('ACTUAL_TWIN_COMETS_ORIGINAL_ROUTE_HOLD',
   {drop,circuit,foot,kitMobilityNotAssumedSameAsB343:true});
 // Actual selected Twin Comets W200 fire can already paint >60 fresh
 // cells AFTER genuine B183 landing; real B186 then completes on the
 // authentic raised floor before the mouse-downward phase starts.
 // In that case it is WRONG to require an intermediate 2/3 frame.
 const nativeClearOnArrival=circuit.sourceLocalPlayClear===true&&
  circuit.status==='REAL_LOCAL_CIRCUIT_CLEAR'&&
  circuit.realPostDropHumanImpactChangedCells>=60;
 if(nativeClearOnArrival){
  const already={phase:'ACTUAL_NATIVE_CLEAR_BEFORE_EXTRA_RAMP_FIRE',
   alreadyRealSourceClear:true,
   originalRaisedFoot:circuit.actualOriginalRaisedFootColliderId,
   nativeFreshPostDropCells:circuit.realPostDropHumanImpactChangedCells,
   originalRampContact:circuit.actualOriginalRampTouched,
   validOriginalDrop:drop.originalFirstDropLocalPracticeClear,
   originalGroundedTravel:circuit.genuineGroundedTravelMeters,
   actualShooterShots:raised.shotsFired};
  report.phases.push(already);persist();
  console.log('B385_PHYSICAL_NATIVE_MISSION_ALREADY_CLEAR',JSON.stringify(already));
  await picture('b385-native-original-12-kit-ramp-already-clear');
 }else{
 const ui2=await until(async()=>{
  const u=await evalPage('(() => {const x=document.querySelector("#t21-f3-b183-real-first-drop");return {step:x?.dataset.b371SourceStep,complete:x?.dataset.b372VerifiedCompletedSteps,resources:x?.dataset.b372NativeShooterResources}})()');
  return u?.step==='PAINT'&&u.complete==='2'?u:false;
 },20000);
 if(ui2.resources!=='NOT_MEASURED')
  fail('B384_FAKE_B343_PROJECTILE_BUDGET',ui2);
 await picture('b385-native-original-12-kit-ramp');
 // Actual look down and hold fire on actual original raised KCC foot.
 for(const y of [510,565]){
  const before=original(await state(),'BEFORE_RAISED_FIRE');
  await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:800,y,button:'none'});
  await cmd('Input.dispatchMouseEvent',{type:'mousePressed',
   x:800,y,button:'left',clickCount:1});
  let after;
  try{after=await until(async()=>{
   const z=original(await state(),'REAL_PHYSICAL_RAMP_FIRE');
   return z.tick>=before.tick+42?z:false;
  },100000)}
  finally{await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',
   x:800,y,button:'left',clickCount:1})}
  const shot={phase:'NATIVE_POST_DROP_PHYSICAL_FIRE_'+y,
   shots:after.shotsFired,
   ink:after.b23HumanInkFeedback.humanChangedCells,
   freshCells:after.b186RealOriginalHumanCircuit.realPostDropHumanImpactChangedCells,
   circuit:after.b186RealOriginalHumanCircuit.status};
  report.phases.push(shot);persist();
  console.log('B385_REAL_SOURCE_PAINT',JSON.stringify(shot));
  if(after.b186RealOriginalHumanCircuit.sourceLocalPlayClear)break;
 }
 }
 const done=original(await state(),'NATIVE_SELECTED_SOURCE_GOAL');
 const c=done.b186RealOriginalHumanCircuit;
 if(!c.sourceLocalPlayClear||c.status!=='REAL_LOCAL_CIRCUIT_CLEAR'||
    c.realPostDropHumanImpactChangedCells<60)
  fail('REAL_SELECTED_KIT_SOURCE_INK_HOLD',
   {circuit:c,trueShots:done.shotsFired,
    trueInk:done.b23HumanInkFeedback.humanChangedCells});
 const hud=await until(async()=>{
  const x=await evalPage('(() => {const m=document.querySelector("#t21-f3-b183-real-first-drop"),s=document.querySelector("#t21-f3-b58-source-session");return {step:m?.dataset.b371SourceStep,steps:m?.dataset.b372VerifiedCompletedSteps,resources:m?.dataset.b372NativeShooterResources,notice:m?.textContent,text:s?.querySelector("#t21-f3-b58-counts")?.textContent,shots:Number(s?.dataset.t21B58HumanShotCount??-1),ink:Number(s?.dataset.t21B58HumanChangedInk??-1),score:s?.dataset.t21B58OriginalScoreable,winner:s?.dataset.t21B58OfficialWinner}})()');
  return x?.step==='CLEAR'&&x.steps==='3'&&
   x.text?.includes('REAL LOCAL CLEAR')&&
   x.shots===done.shotsFired&&
   x.ink===done.b23HumanInkFeedback.humanChangedCells?x:false;
 },45000);
 if(hud.resources!=='NOT_MEASURED'||hud.score!=='0'||
    hud.winner!=='NONE'||!hud.notice?.includes('NO TURF WINNER'))
  fail('B384_ACTUAL_LIVE_SOURCE_RECAP_NOT_NONSCORING',hud);
 // B387 actual 60Hz record, displayed separately from current-life goal.
 const round=done.b387RealRoundMilestones;
 if(!round?.valid||round.realClearedLives!==1||!round.currentLifeClear||
    round.lastTrueWeapon!=='twin-comets'||round.lastTruePostDropCells<60||
    round.sourceScoreable!==0||round.officialWinner!=='NONE')
  fail('B387_REAL_NATIVE_ROUND_CLEAR_MISSING',round);
 const roundHud=await until(async()=>{
  const x=await evalPage('(() => {const r=document.querySelector("#t21-f3-b58-source-session");return {clears:r?.dataset.b387VerifiedClears,life:r?.dataset.b387CurrentLife,text:r?.querySelector("#t21-f3-b58-counts")?.textContent}})()');
  return x?.clears==='1'&&x.life==='true'&&
   x.text?.includes('ROUND VERIFIED CLEARS')?x:false;
 },20000);
 report.phases.push({phase:'B387_REAL_NATIVE_ROUND_CLEAR_MEMORY',
  native:round,visibleRoundHud:roundHud,noGameWrites:true});persist();
 // B388: native supported raised-floor KCC means no LIVE unsupported
 // descent warning; the historical B112 suspicion remains in F8 QA.
 const hazard=await until(async()=>{
  const x=await evalPage('(() => {const s=window.__t21F3.snapshot(),u=document.querySelector("#ui-root"),w=document.querySelector("#t21-f3-b113-ground-warning"),r=document.querySelector("#t21-f3-b209-original-ramp-edge");return {view:u?.dataset.t21B245Presentation,ground:s.b112OriginalHumanGround?.genuineKccGrounded,foot:s.b112OriginalHumanGround?.lastOriginalSourceHitId,historical:s.b112OriginalHumanGround?.suspicionCount,warningHidden:!!w&&(w.hidden||getComputedStyle(w).display==="none"),rampState:r?.dataset.t21B209State,rampHidden:!!r&&(r.hidden||getComputedStyle(r).display==="none"),floorHoleCertified:w?.dataset.originalFloorHoleCertified}})()');
  return x?.view==='PLAYER'&&x.ground===true&&
   x.foot==='UndertowT21D:right-low-team-a'&&x.warningHidden&&
   (x.rampState!=='ADJACENT_TO_ORIGINAL_RAMP'||x.rampHidden)&&
   x.floorHoleCertified==='false'?x:false;
 },20000);
 report.phases.push({phase:'B388_NATIVE_PLAYER_HAZARD_UX',
  supportedOriginalFloor:hazard.foot,visibleNativeHud:hazard,
  alteredPhysics:0,alteredOriginalGeometry:0});persist();
 // B386: original CPU positions only; not certified combat contact.
 const frontier=await until(async()=>{
  const x=await evalPage('(() => {const e=document.querySelector("#t21-f3-b368-real-enemy-frontier");return {visible:!!e&&!e.hidden&&getComputedStyle(e).display!=="none",enemy:e?.dataset.nearestCpuId,distance:Number(e?.dataset.nativeHorizontalMeters??-1),count:Number(e?.dataset.cpuPhysicalCount??-1),route:e?.dataset.crossTeamRouteCertified,encounter:e?.dataset.actualEncounterCertified,hit:e?.dataset.projectileHitCertified,actor:e?.dataset.actorRelocations,writes:e?.dataset.gameplayWrites,text:e?.textContent}})()');
  return x?.visible&&x.count===4&&x.enemy?.startsWith('B')&&x.distance>0&&
   x.route==='false'&&x.encounter==='false'&&x.hit==='false'&&
   x.actor==='0'&&x.writes==='0'&&x.text?.includes('NO CROSS-TEAM PATH')?x:false;
 },25000);
 const enemy=done.cpu.cpu.find(x=>x.id===frontier.enemy);
 if(!enemy||!enemy.rejoined||enemy.lifeState!=='ACTIVE'||
    !Array.isArray(enemy.physicalFoot)||
    Math.abs(frontier.distance-Math.hypot(
      enemy.physicalFoot[0]-done.player.position[0],
      enemy.physicalFoot[2]-done.player.position[2]))>2)
  fail('B386_ACTUAL_ENEMY_DISTANCE_MISMATCH',{frontier,enemy});
 report.phases.push({phase:'B386_ACTUAL_ENEMY_FRONTIER',...frontier,
  realCpuFoot:enemy.physicalFoot,certifiedCrossTeamRoute:false,
  certifiedNativeCpuHit:false});persist();
 report.phases.push({phase:'REAL_NATIVE_TWIN_COMETS_ORIGINAL_3OF3',
  actualWeapon:done.b381RealNativeDodge.realWeapon,
  realShots:done.shotsFired,realInk:done.b23HumanInkFeedback.humanChangedCells,
  freshAfterDrop:c.realPostDropHumanImpactChangedCells,
  physicalTravel:c.genuineGroundedTravelMeters,
  actualCpuRejoins:done.cpu.physicalRejoins.length,
  liveHud:hud,officialScoreable:0,winner:'NONE'});
 await picture('b385-native-real-12-kit-local-clear');
 // B390: the same genuine original source world continues to native
 // TIME_UP; unlike B389's already-PASS pause-and-replay mode.
 if(process.env.T21_B390_TRUE_180S==='1'){
  await b390RunTrue180({done,original,state,evalPage,cmd,until,
   fail,report,persist,picture,clickButton});
  return;
 }


 // B389: only genuine CDP Escape & real user click can discard the old
 // session. The new browser world must have 0 ticks/ink/clears and retain
 // precisely the selected existing human kit, not CPU or game state.
 const oldTimeOrigin=await evalPage('performance.timeOrigin');
 await key('keyDown','Escape','Escape',27);
 await key('keyUp','Escape','Escape',27);
 const pauseUi=await until(async()=>{
  const x=await evalPage('(() => {const r=document.querySelector("#t21-f3-b389-new-source-round"),s=window.__t21F3.snapshot();return {unlocked:document.pointerLockElement===null,overlay:document.querySelector("#t21-f3-b202-real-pause")?.dataset.t21B202NativeState,visible:!!r&&!r.hidden&&!r.disabled&&getComputedStyle(r).display!=="none",state:s.matchState,paused:s.paused,weapon:s.b361NativePlayerWeapon.id,tick:s.tick}})()');
  return x?.unlocked&&x.paused&&x.visible&&x.state==='PLAYING'&&
   x.weapon==='twin-comets'?x:false;
 },35000);
 report.phases.push({phase:'B389_REAL_USER_PAUSED_REPLAY_VISIBLE',
  ...pauseUi,originalUserRoundEnded:false});persist();
 await picture('b389-native-source-real-pause-replay');
 await clickButton('#t21-f3-b389-new-source-round');
 const replay=await until(async()=>{
  const x=await evalPage('(() => {const s=window.__t21F3?.snapshot?.(),u=document.querySelector("#app-canvas"),k=document.querySelector("#t21-f3-b378-weapon");return s?{timeOrigin:performance.timeOrigin,search:location.search,ready:u?.dataset.t21F3Ready,world:[s.originalSourceSolids,s.originalPaintSurfaces,s.originalSourceNavigationLinks,s.sourceScoreablePromotions],phase:s.matchState,paused:s.paused,tick:s.tick,time:s.timeRemainingSeconds,realHumanWeapon:s.b381RealNativeDodge.realWeapon,selected:k?.value,bootSource:k?.dataset.b389NativeReplayKit,shots:s.shotsFired,changedHuman:s.b23HumanInkFeedback.humanChangedCells,sourceCpuShots:s.cpuSourceTurfShots,realCpuRejoins:s.cpu.physicalRejoins.length,history:s.b387RealRoundMilestones,scoreable:s.sourceScoreablePromotions,winner:s.b186RealOriginalHumanCircuit?.officialWinner}:null})()');
  return x?.timeOrigin>oldTimeOrigin&&x.ready==='READY'&&
   x.search.endsWith('&t21W10B389=twin-comets')&&x.phase==='STAGING'&&
   x.paused&&x.tick===0&&x.time===180&&
   x.realHumanWeapon==='twin-comets'&&x.selected==='twin-comets'&&
   x.bootSource==='VERIFIED_PREGAME_SELECTION'&&
   x.shots===0&&x.changedHuman===0&&x.sourceCpuShots===0&&
   x.realCpuRejoins===0&&x.history?.realClearedLives===0&&
   x.scoreable===0&&x.winner==='NONE'?x:false;
 },120000);
 if(replay.world.join(',')!=='25,17,26,0')
  fail('B389_FRESH_NATIVE_SOURCE_BOUNDARY_DRIFT',replay);
 report.phases.push({phase:'B389_NEW_B384_REAL_WORLD_ZERO_OLD_STATE',
  ...replay,physicsMovedFromOldWorld:0,historyCopied:0});persist();
 console.log('B389_TRUE_USER_REPLAY_NEW_WORLD',JSON.stringify(replay));
 await picture('b389-real-fresh-same-weapon-ready');
 // A READY screenshot alone does not prove a playable SECOND session.
 // Use a second actual CDP user click, native pointer lock, and genuinely
 // progressed 60Hz frame in the freshly rebuilt source world.
 await clickButton('#t21-f3-b202-resume');
 await until(()=>evalPage('document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 const restarted=await until(async()=>{
  const n=original(await state(),'B389_TRUE_SECOND_WORLD_NATIVE_START');
  if(n.stopReason||!n.b387RealRoundMilestones?.valid||
     n.b387RealRoundMilestones.realClearedLives!==0)
   fail('B389_SECOND_SESSION_NOT_CLEAN',n.b387RealRoundMilestones);
  return !n.paused&&n.tick>=16&&
   n.b361NativePlayerWeapon.id==='twin-comets'&&
   n.sourceScoreablePromotions===0?n:false;
 },90000);
 report.phases.push({phase:'B389_TRUE_SECOND_WORLD_NATIVE_STARTED',
  nativeTick:restarted.tick,actualWeapon:restarted.b361NativePlayerWeapon.id,
  currentSourceRound:restarted.matchState,
  trueCpuBodies:restarted.cpu.cpu.length,
  zeroPreviousLifeClears:restarted.b387RealRoundMilestones.realClearedLives,
  realPointerLocked:true,artificialTicks:0,actorRelocations:0});
 persist();console.log('B389_TRUE_SECOND_WORLD_NATIVE_STARTED',
  JSON.stringify(report.phases.at(-1)));

 report.outcome='PASS_B389_REAL_USER_REPLAY_NEW_NATIVE_180S_WORLD';
 report.note='Genuine source local 3/3 and user-clicked paused replay to clean 180s world confirmed; 12-kit original TIME_UP still not independently tested.';
 persist();console.log('B385_TRUE_NATIVE_SELECTED_KIT_LOCAL_CLEAR',
  JSON.stringify(report.phases.at(-2)));

}
try{await run()}catch(err){report.lastError=String(err);persist();console.error(err);process.exitCode=1}
finally{socket?.close();for(const child of children)child.kill('SIGTERM')}
