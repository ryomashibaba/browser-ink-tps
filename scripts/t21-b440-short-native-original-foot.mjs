#!/usr/bin/env node
/**
 * B440: SHORT TRUE Chromium source-floor human-input gate.
 * Uses the exact previously exercised B419 SECOND-WORLD URL, but is NOT
 * itself a clicked-replay/2x180s proof. Real browser, real 7 CPU first drops,
 * real player KCC, real CDP W-key; no actor/tick/score/navigation writes.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const root='http://127.0.0.1:4298/browser-ink-tps/';
const b441Experiment=process.env.T21_B441_SOURCE_FRONTLINE==='1';
const b448Experiment=b441Experiment&&
 process.env.T21_B448_A3_REAL_ORIGINAL_FRONT==='1';
const query='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B193=allyCoop&t21W10B203=fullRound'+
 (b441Experiment?'&t21W10B441=sourceFrontline':'')+
 (b448Experiment?'&t21W10B448=realA3Front':'');
const nativeFrontObservationTicks=b441Experiment?
 Number(process.env.T21_B441_NATIVE_OBSERVE_TICKS??240):240;
if(!Number.isSafeInteger(nativeFrontObservationTicks)||
 nativeFrontObservationTicks<240||nativeFrontObservationTicks>900)
 throw Error('B442_UNSAFE_NATIVE_OBSERVATION_WINDOW');
const out=process.env.T21_B440_OUT||'/tmp/t21-b440-short-native-foot';
const children=[],pending=new Map();
let ws=null,seq=0;
const fail=(reason)=>{throw Error('B440_SHORT_REAL_NATIVE_HOLD_'+reason)};
const proof={schema:'B440_ORIGINAL_SHORT_CHROMIUM_FOOT_PROOF',
  source:'25/17/26/0',testKind:'SHORT_FRESH_SOURCE_ONLY',
  genuineReplayClickCertified:false,full180sCertified:false,
  realSourceRouteCertified:false,formal4v4Certified:false,
  b441ResearchOnly:b441Experiment,b448A3ResearchOnly:b448Experiment,
  b441NativeEvidence:null,
  officialWinner:'NONE',syntheticInput:false,actorWrites:0,
  scoreWrites:0,nativeClockWrites:0,sourceGeometryWrites:0,
  stage:'NOT_STARTED',before:null,after:null,verdict:'HOLD'};
const save=()=>{mkdirSync(out,{recursive:true});writeFileSync(
 resolve(out,'b440-short-real-original-human-foot.json'),JSON.stringify(proof,null,2)+'\n');};
const until=async(fn,ms=30000,interval=250)=>{
 const deadline=Date.now()+ms;let last='';
 while(Date.now()<deadline){
  try{const v=await fn();if(v)return v;}
  catch(e){last=String(e);if(!last.includes('B440_RETRYABLE'))throw e;}
  await delay(interval);
 }
 fail('TIMEOUT_'+last.slice(0,110));
};
async function cdp(method,params={}){
 const id=++seq;
 return await new Promise((resolve_,reject)=>{
  const guard=setTimeout(()=>{pending.delete(id);reject(Error('B440_CDP_TIMEOUT_'+method));},26000);
  pending.set(id,{ok:r=>{clearTimeout(guard);resolve_(r);},
   bad:e=>{clearTimeout(guard);reject(e);}});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(
  r.exceptionDetails.exception?.description??r.exceptionDetails.text).slice(0,300));
 return r.result?.value;
}
const snap=()=>evaluate('window.__t21F3.snapshot()');
function authority(n){
 if(n?.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
  n.originalSourceNavigationLinks!==26||n.sourceScoreablePromotions!==0||
  n.productionAuthorized!==false||n.unrestricted4v4Certified!==false||
  n.cpu.physicalFootRelocations!==0||n.cpu.cpu.length!==7||n.stopReason)
  fail('SOURCE_OR_NATIVE_ACTORS_AUTHORITY');
}
function foot(n){
 const g=n?.b129OriginalRaisedEdgeGuidance;
 return {sourceOnly:g?.originalSourceOnly===true,
  sourceSchema:g?.schema??null,physicalKccGrounded:g?.kccGroundedObserved===true,
  originalSolid:g?.authenticNamedOriginalSupport??null,
  clearance:g?.originalRaisedFloorEdgeMeters??null};
}
function trueOriginalFoot(f){
 return f.sourceOnly===true&&
  f.sourceSchema==='W10_B130_REGISTERED_ORIGINAL_FLAT_EDGE_HUD_V1'&&
  f.physicalKccGrounded===true&&
  typeof f.originalSolid==='string'&&
  f.originalSolid.startsWith('UndertowT21D:')&&
  Number.isFinite(f.clearance)&&f.clearance>=.65;
}
const origin=()=>evaluate('performance.timeOrigin');
const locked=()=>evaluate('document.pointerLockElement===document.querySelector("#app-canvas")');
async function buttonClick(selector){
 await cdp('Page.bringToFront');
 const location=await evaluate(`(() => {
  const b=document.querySelector(${JSON.stringify(selector)});
  if(!b||b.hidden||b.disabled||getComputedStyle(b).display==='none')return null;
  const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
  const hit=document.elementFromPoint(x,y);
  return {x,y,receives:hit===b||b.contains(hit)};
 })()`);
 if(!location||!location.receives||location.x<0||location.x>1600||
  location.y<0||location.y>900)fail('UNCLICKABLE_REAL_BUTTON_'+selector);
 await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:location.x,y:location.y});
 await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:location.x,y:location.y,button:'left',clickCount:1});
 await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:location.x,y:location.y,button:'left',clickCount:1});
}
async function keyW(){
 const v={key:'w',code:'KeyW',windowsVirtualKeyCode:87,nativeVirtualKeyCode:87};
 const initial=await snap();authority(initial);
 let pressed=false;
 try{
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',...v});pressed=true;
  const after=await until(async()=>{
   await delay(35);
   const n=await snap();authority(n);
   if(n.paused||n.matchState!=='PLAYING')fail('INTERRUPTED_REAL_NATIVE_INPUT');
   return n.tick>=initial.tick+6?n:false;
  },10000,20);
  return after;
 }finally{
  if(pressed)await cdp('Input.dispatchKeyEvent',{type:'keyUp',...v});
 }
}
/** Actual CDP keyboard input and live F3 camera snapshot — never actor/tick writes. */
async function tapSourceCameraKey(key,code,keyCode){
 const v={key,code,windowsVirtualKeyCode:keyCode,nativeVirtualKeyCode:keyCode};
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',...v});
 await cdp('Input.dispatchKeyEvent',{type:'keyUp',...v});
}
async function checkRealSourceCameraControls(){
 const before=await snap();authority(before);
 if(!await locked()||before.matchState!=='PLAYING'||before.paused||
    before.cameraSourcePractice?.sourcePracticeOnly!==true||
    before.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1||
    before.cameraSourcePractice?.sourceAimInvertVertical!==false)
  fail('CAMERA_NOT_ACTUAL_SOURCE_PLAYER_BASELINE');
 const sameWorld=await origin();
 const sameActorIds=before.cpu.cpu.map(x=>x.id).join(',');
 await tapSourceCameraKey(']','BracketRight',221);
 const speed=await snap();authority(speed);
 if(speed.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1.25||
    speed.cameraSourcePractice?.sourceAimInvertVertical!==false)
  fail('CAMERA_REAL_BRACKET_KEY_NOT_APPLIED');
 await tapSourceCameraKey('i','KeyI',73);
 const inverted=await snap();authority(inverted);
 const realToast=await evaluate(`(() => {
   const x=document.querySelector('#t21-f3-source-camera-controls');
   return x?{visible:!x.hidden,content:x.textContent,
    sourceOnly:x.dataset.sourceOnly,gameplayWrites:x.dataset.gameplayWrites,
    productionAuthorized:x.dataset.productionAuthorized}:null;
 })()`);
 if(inverted.cameraSourcePractice?.sourceAimInvertVertical!==true||
    inverted.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1.25||
    realToast?.visible!==true||realToast?.sourceOnly!=='true'||
    realToast.gameplayWrites!=='0'||realToast.productionAuthorized!=='false'||
    !realToast.content.includes('VERTICAL LOOK · INVERTED'))
  fail('CAMERA_REAL_INVERSION_OR_PLAYER_FEEDBACK');
 const picture=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof picture?.data!=='string'||picture.data.length<100)
  fail('CAMERA_REAL_CHROMIUM_SCREENSHOT_MISSING');
 writeFileSync(resolve(out,'source-camera-inverted-real-chromium.png'),
  Buffer.from(picture.data,'base64'));
 await tapSourceCameraKey('\\','Backslash',220);
 const reset=await snap();authority(reset);
 const resetToast=await evaluate(`document.querySelector(
   '#t21-f3-source-camera-controls')?.textContent??null`);
 if(reset.cameraSourcePractice?.sourceAimSensitivityMultiplier!==1||
    reset.cameraSourcePractice?.sourceAimInvertVertical!==false||
    resetToast!=='CAMERA RESET · 1.00x · NORMAL Y'||
    await origin()!==sameWorld||!await locked()||
    reset.cpu.cpu.map(x=>x.id).join(',')!==sameActorIds||
    reset.sourceScoreablePromotions!==0||
    reset.productionAuthorized!==false)
  fail('CAMERA_RESET_OR_ORIGINAL_SOURCE_AUTHORITY');
 proof.realPlayerCameraControls={
  status:'PASS_REAL_CDP_PLAYER_CAMERA_CONTROL_WITH_SCREENSHOT_NOT_ART_PASS',
  originalSameNativeWorld:true,actualKeyboard:true,
  rightBracketSensitivity:speed.cameraSourcePractice.sourceAimSensitivityMultiplier,
  invertYConfirmed:inverted.cameraSourcePractice.sourceAimInvertVertical,
  resetSensitivity:reset.cameraSourcePractice.sourceAimSensitivityMultiplier,
  resetInverted:reset.cameraSourcePractice.sourceAimInvertVertical,
  realToast,realChromiumScreenshot:'source-camera-inverted-real-chromium.png',
  originalGeometryOrActorWrites:0,officialWinner:'NONE',
  productionAuthorized:false,artApproved:false};
 save();
}
async function main(){
 save();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium'].find(x=>{
   try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}
  });
 if(!chrome)fail('CHROMIUM_NOT_INSTALLED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4298','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000);
 const chromeProcess=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9268','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b440-native-short-profile','about:blank'],{stdio:'ignore'});
 children.push(chromeProcess);
 const page=await until(async()=>{
  if(chromeProcess.exitCode!==null)fail('CHROME_TERMINATED');
  try{return (await(await fetch('http://127.0.0.1:9268/json')).json())
   .find(x=>x.type==='page'&&x.webSocketDebuggerUrl);}catch{return null;}
 },45000);
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((ok,bad)=>{
  ws.addEventListener('open',ok,{once:true});
  ws.addEventListener('error',bad,{once:true});
 });
 ws.addEventListener('message',e=>{
  const x=JSON.parse(String(e.data)),p=pending.get(x.id);
  if(!p)return;pending.delete(x.id);
  x.error?p.bad(Error(JSON.stringify(x.error))):p.ok(x.result||{});
 });
 await cdp('Page.enable');await cdp('Runtime.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{
  width:1600,height:900,deviceScaleFactor:1,mobile:false});
 // Reuse this SAME genuine Chromium session to test the actual
 // SOURCE game portal before entering the existing authoritative CPU trial.
 // Portal is optical/navigation only; never edits simulation or actor state.
 await cdp('Page.navigate',{url:root+'play-source.html'});
 const portals=await until(()=>evaluate(`(() => {
  const a=document.querySelector('#play-circuit');
  const b=document.querySelector('#play-combat');
  return document.querySelector('#portal-status')?.dataset.t21PortalReady==='SOURCE_ONLY'&&
   a?.href&&b?.href&&document.querySelector('#play-coop')?.href?
    {circuit:a.href,combat:b.href,
     coop:document.querySelector('#play-coop').href}:null;
 })()`),30000);
 const url=new URL(portals.circuit),opponent=new URL(portals.combat),
  ally=new URL(portals.coop);
 if(url.origin!==new URL(root).origin||url.pathname!==new URL(root).pathname||
  url.searchParams.get('t21W10B384')!=='loadoutCircuit'||
  url.searchParams.get('t21W10B203')!=='fullRound'||
  opponent.searchParams.get('t21W10B192')!=='humanCombat'||
  opponent.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.get('t21W10B193')!=='allyCoop'||
  ally.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.has('t21W10B192')||
  url.searchParams.has('production')||url.searchParams.has('scoreable'))
  fail('PORTAL_SOURCE_DESTINATION_AUTHORITY');
 // Human-facing mode selection must be visible and clickable without
 // scrolling on a 1600x900 game display. Check ACTUAL Chromium layout,
 // not a synthetic CSS/viewport claim. No actor/score/clock writes.
 const realMenuButtons=await evaluate(`(() => {
  const selectors=['#play-circuit','#play-coop','#play-combat'];
  return selectors.map(selector=>{
   const button=document.querySelector(selector);
   const card=button?.closest('.mode');
   const b=button?.getBoundingClientRect();
   const c=card?.getBoundingClientRect();
   return {selector,buttonTop:b?.top??null,buttonBottom:b?.bottom??null,
    cardBottom:c?.bottom??null,buttonWidth:b?.width??null,
    enabled:!!button?.href&&!button?.hasAttribute('disabled')};
  });
 })()`);
 if(!Array.isArray(realMenuButtons)||realMenuButtons.length!==3||
  realMenuButtons.some(v=>!v.enabled||
   !Number.isFinite(v.buttonTop)||v.buttonTop<0||
   !Number.isFinite(v.buttonBottom)||v.buttonBottom>880||
   !Number.isFinite(v.cardBottom)||v.cardBottom>895||
   !Number.isFinite(v.buttonWidth)||v.buttonWidth<160))
  fail('REAL_1600x900_SOURCE_MODE_CHOICE_REQUIRES_SCROLL');
 proof.realSourceModeViewport={
  actualChromium1600x900:true,threeOptionsImmediatelyAccessible:true,
  realMenuButtons,sourceOnly:true,gameplayWrites:0,officialWinner:'NONE'};
 save();
 const portalPicture=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof portalPicture?.data!=='string'||portalPicture.data.length<100)
  fail('PORTAL_REAL_CHROMIUM_SCREENSHOT_MISSING');
 writeFileSync(resolve(out,'source-play-portal-real-chromium.png'),
  Buffer.from(portalPicture.data,'base64'));
 await buttonClick('#play-circuit');
 const clicked=await until(()=>evaluate(`location.search.includes(
  't21W10B384=loadoutCircuit')&&
  location.search.includes('t21W10B203=fullRound')`),20000);
 if(!clicked||new URL(await evaluate('location.href')).pathname!==
    new URL(root).pathname)
  fail('PORTAL_REAL_CDP_CLICK_DID_NOT_START_EXISTING_SOURCE_GAME');
 proof.realSourcePlayPortal={
  verdict:'PASS_ACTUAL_CHROMIUM_PORTAL_TO_REAL_SOURCE_GAME_URL',
  realCdpMouseClick:true,sourceOnly:true,existing12WeaponCircuit:true,
  actualScreenshot:'source-play-portal-real-chromium.png',
  scriptInjectedActors:0,nativeTickWrites:0,officialWinner:'NONE',
  formal4v4Certified:false,productionAuthorized:false};
 save();
 // The existing B441 test retains its original URL and identical native
 // proof thresholds; the portal does not alter those trusted trial inputs.
 await cdp('Page.navigate',{url:root+query});
 await until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),120000);
 if(await evaluate('location.search')!==query)fail('WRONG_SOURCE_URL');
 const modeButton=await evaluate(`(() => {
  const b=document.querySelector('#t21-f3-source-mode-menu-ready');
  return b?{source:b.dataset.originalSourceOnly,
   scoreable:b.dataset.scoreable,
   actors:b.dataset.actorRelocations}:null;
 })()`);
 if(!modeButton||modeButton.source!=='true'||
   modeButton.scoreable!=='0'||modeButton.actors!=='0')
  fail('SOURCE_NATIVE_READY_MODE_MENU_MISSING');
 proof.sourcePlayerModeMenu=modeButton;save();
 const boot=await snap();authority(boot);
 if(boot.matchState!=='STAGING'||boot.cpu.physicalRejoins.length!==0)
  fail('NOT_FRESH_NATIVE_SOURCE_WORLD');
 proof.stage='FRESH_NATIVE_SOURCE';proof.browserOrigin=await origin();save();
 await buttonClick('#t21-f3-b25-start');
 await until(async()=>{
  const n=await snap();authority(n);
  return n.b25SourcePaintRun?.status==='ARMED'?n:false;
 },20000);
 await until(async()=>evaluate(`(() => {
  const b=document.querySelector('#t21-f3-b202-resume');
  const r=b?.getBoundingClientRect();
  const hit=r?document.elementFromPoint(r.x+r.width/2,r.y+r.height/2):null;
  return !!b&&!b.hidden&&!b.disabled&&r&&r.width>0&&r.height>0&&
   (hit===b||b.contains(hit));
 })()`),25000);
 await buttonClick('#t21-f3-b202-resume');
 proof.stage='NATIVE_START_SENT';save();
 // A freshly launched normal SOURCE world independently runs real physics,
 // and MUST naturally physically rejoin all seven original CPU actors.
 let lastRealSourceSample=null, polls=0;
 const ready=await until(async()=>{
  const n=await snap();authority(n);
  const pointer=await locked();
  if(++polls%40===0){
   lastRealSourceSample={tick:n.tick,phase:n.matchState,paused:n.paused,
    joins:n.cpu.physicalRejoins.length,mission:n.b25SourcePaintRun?.status,
    foot:foot(n),body:n.player.position,pointerLocked:pointer};
   proof.lastNativeReadOnlySample=lastRealSourceSample;save();
  }
  if(n.matchState==='TIME_UP')fail('NO_GENUINE_WALK_BEFORE_TIME_UP');
  return pointer&&n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7&&n.player.mode==='HUMAN'&&
   n.b25SourcePaintRun?.status==='RUNNING'&&
   trueOriginalFoot(foot(n))?n:false;
 },360000,350);
 proof.stage='TRUE_SEVEN_CPU_READY';proof.before={
  tick:ready.tick,body:ready.player.position,sourceFoot:foot(ready),
  cpuRejoins:ready.cpu.physicalRejoins.length,shots:ready.shotsFired,
  phase:ready.matchState,pointerLocked:await locked()};save();
 const after=await keyW();authority(after);
 const af=foot(after),bf=proof.before.sourceFoot;
 const old=proof.before.body,newBody=after.player.position;
 const meters=Array.isArray(old)&&Array.isArray(newBody)&&
  [...old,...newBody].every(Number.isFinite)?
  Math.hypot(newBody[0]-old[0],newBody[2]-old[2]):NaN;
 proof.after={tick:after.tick,body:newBody,sourceFoot:af,
  physicalPlanarMeters:meters,nativeTickDelta:after.tick-proof.before.tick,
  cpuRejoins:after.cpu.physicalRejoins.length,shots:after.shotsFired,
  phase:after.matchState,pointerLocked:await locked(),
  browserOrigin:await origin()};save();
 if(!trueOriginalFoot(af)||af.originalSolid!==bf.originalSolid||
  proof.after.pointerLocked!==true||
  proof.after.browserOrigin!==proof.browserOrigin||
  after.matchState!=='PLAYING'||after.paused||
  after.player.mode!=='HUMAN'||after.cpu.physicalRejoins.length!==7||
  after.shotsFired!==proof.before.shots||
  !Number.isSafeInteger(proof.after.nativeTickDelta)||
  proof.after.nativeTickDelta<6||proof.after.nativeTickDelta>36||
  !Number.isFinite(meters)||meters<.10||meters>2.2)
  fail('REAL_NATIVE_INPUT_OR_SOURCE_KCC');
 await checkRealSourceCameraControls();
 if(b441Experiment){
  // B441 has to prove the actual SOURCE CPU goal selector, not merely
  // the candidate generator passing its pure unit tests. No fake route,
  // hostile actor teleport, scoring or certified opposing-team encounter.
  const startPatrol=after.cpu.sourcePatrol;
  if(!startPatrol?.b441Enabled)fail('B441_NOT_ACTUALLY_SELECTED');
  const validateB445=(patrol)=>{
   const entries=patrol?.b445OriginalFrontlineGates;
   if(!Array.isArray(entries)||entries.length!==6||
      new Set(entries.map(x=>x.id)).size!==6)
    fail('B445_MISSING_REAL_CPU_GATE_INVENTORY');
   for(const g of entries){
    if(!['A2','A3','B1','B2','B3','B4'].includes(g.id)||
       !Array.isArray(g.actualOriginalLanding)||
       g.actualOriginalLanding.length!==3||
       !g.actualOriginalLanding.every(Number.isFinite)||
       !Array.isArray(g.approvedOriginalGoals)||
       g.approvedOriginalGoals.length!==g.strictlyApprovedGoals||
       !g.approvedOriginalGoals.every(p=>Array.isArray(p)&&
        p.length===3&&p.every(Number.isFinite)&&
        Math.abs(p[2])>=33)||
       !Number.isSafeInteger(g.originalFloorProposals)||
       !Number.isSafeInteger(g.inspectedProposals)||
       g.inspectedProposals<0||
       g.inspectedProposals>g.originalFloorProposals||
       g.inspectedProposals!==g.rejectedOriginalRapierOrBoundary+
        g.rejectedNativeRecastOrOriginalPath+g.strictlyApprovedGoals||
       g.rejectedNativeRecastOrOriginalPath!==
        g.rejectedNativeUnreached+g.rejectedNativeStartSnap+
        g.rejectedNativeEndSnap+
        g.rejectedNativeIntermediateOriginalSupport||
       g.runtimeChooseInvocations<g.runtimeNoOriginalFrontGoals||
       g.runtimeChooseInvocations<0||g.runtimeTrueOriginalGoalRequests<0)
     fail('B445_FORGED_OR_UNACCOUNTED_CPU_GATE');
   }
   return entries;
  };
  const firstRead={tick:after.tick,patrol:startPatrol,
   b445FirstOriginalGateByCpu:validateB445(startPatrol),
   actors:after.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot,
    rejoined:c.rejoined,lifeState:c.lifeState}))};
  const realApprovedTargets=n=>{
   const targets=n.cpu.sourcePatrol?.b442LastApprovedRealFrontTargets;
   if(!Array.isArray(targets)||targets.length>6)
    fail('B442_NO_REAL_SOURCE_GOAL_WITNESS');
   const seen=new Set();
   const actorMap=new Map(n.cpu.cpu.map(c=>[c.id,c.physicalFoot]));
   for(const v of targets){
    const f=actorMap.get(v.id);
    if(seen.has(v.id)||!f||!Array.isArray(v.target)||
       v.target.length!==3||!v.target.every(Number.isFinite)||
       !Array.isArray(v.physicalFoot)||v.physicalFoot.length!==3||
       !v.physicalFoot.every(Number.isFinite)||
       v.originalRegisteredSourceOnly!==true||
       !Number.isSafeInteger(v.lastApprovedNativeTick)||
       v.lastApprovedNativeTick>n.tick||
       Math.abs(v.target[2])<33||
       ![0,1,2].every(i=>Math.abs(v.physicalFoot[i]-f[i])<.001)||
       !Number.isFinite(v.distanceXZ)||
       Math.abs(v.distanceXZ-
        Math.hypot(v.target[0]-f[0],v.target[2]-f[2]))>.001)
     fail('B442_FAKE_OR_STALE_NATIVE_GOAL_WITNESS');
    seen.add(v.id);
   }
   return targets;
  };
  proof.b441NativeEvidence={phase:'OBSERVING_REAL_CPU',firstRead,
   realFrames:[],source:'25/17/26/0',
   b442TargetObservationOnly:true,
   b442TargetFramesWitnessed:0,
   intendedRealNativeTicks:nativeFrontObservationTicks,
   proposedOnlyNotCapsuleProof:true,actorWrites:0,scoreWrites:0,
   nativeClockWrites:0,naturalOpposingTeamRouteCertified:false,
   verdict:'HOLD'};save();
  const baseline=Object.fromEntries(firstRead.actors.map(a=>[a.id,a.foot]));
  const actual=await until(async()=>{
   const n=await snap();authority(n);
   if(n.paused||n.matchState!=='PLAYING'||
      n.cpu.physicalRejoins.length!==7||await origin()!==proof.browserOrigin)
    fail('B441_SOURCE_INTERRUPTED');
   const approvedGoals=realApprovedTargets(n);
   const data={tick:n.tick,available:n.cpu.sourcePatrol?.b441StrictGoalsAvailable,
    requested:n.cpu.sourcePatrol?.b441ActualGoalRequests,
    frontZ:n.cpu.sourcePatrol?.b441ClosestApprovedFrontAbsZ,
    physicalFeet:n.cpu.cpu.map(c=>({id:c.id,foot:c.physicalFoot,
     rejoined:c.rejoined})),
    b442RealApprovedOriginalGoals:approvedGoals};
   if(proof.b441NativeEvidence.realFrames.length<40&&
     (!proof.b441NativeEvidence.realFrames.length||
      n.tick-proof.b441NativeEvidence.realFrames.at(-1).tick>=24)){
    proof.b441NativeEvidence.realFrames.push(data);
    if(approvedGoals.length)
     proof.b441NativeEvidence.b442TargetFramesWitnessed++;
    save();
   }
   return n.tick>=after.tick+nativeFrontObservationTicks?n:false;
  },600000,500);
  // B454: collect every *actual* native post-KCC B2/B4 foot once,
  // rather than inferring continuous original contact from 24-tick polls.
  // Do not add these large rows to B440 log; save one independent Artifact.
  const b454Native=await evaluate('window.__t21F3.b454OriginalCpuFootTrace()');
  if(b454Native?.schema!=='B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1'||
     b454Native.source!=='25/17/26/0'||
     b454Native.originalKccOrGameWrites!==0||
     b454Native.originalPathAuthorizationChanged!==false||
     b454Native.continuousCapsuleContactCertified!==false||
     b454Native.b2b4FrontlineGoalCertified!==false||
     b454Native.dropped?.B2!==0||b454Native.dropped?.B4!==0||
     !Array.isArray(b454Native.rows?.B2)||
     !Array.isArray(b454Native.rows?.B4)||
     b454Native.rows.B2.length<700||b454Native.rows.B4.length<700||
     await origin()!==proof.browserOrigin)
   fail('B454_FALSE_OR_MISSING_NATIVE_PER_TICK_FOOT_PROVENANCE');
  const b454Report={...b454Native,browserWorldOrigin:proof.browserOrigin,
    originalSourceGeometryWrites:0,actorWrites:0,scoreWrites:0,
    nativeClockWrites:0};
  writeFileSync(resolve(out,'b454-native-b2-b4-physical-60hz.json'),
    JSON.stringify(b454Report,null,2)+'\n');
  proof.b441NativeEvidence.b454FullRatePhysicalFootRecorded={
    B2:b454Native.rows.B2.length,B4:b454Native.rows.B4.length,
    dropped:{...b454Native.dropped},
    continuousKccRouteCertified:false,originalScoreable:0};
  const afterPatrol=actual.cpu.sourcePatrol;
  const observed=actual.cpu.cpu.map(c=>{
   const from=baseline[c.id],p=c.physicalFoot;
   return {id:c.id,from,to:p,
    planarMeters:Array.isArray(from)&&Array.isArray(p)?
     Math.hypot(p[0]-from[0],p[2]-from[2]):null,
    frontAbsZ:Math.abs(p[2]),unchangedRealCpuId:true};
  });
  const actualTargets=realApprovedTargets(actual);
  const rows=proof.b441NativeEvidence.realFrames.flatMap(frame=>
   frame.b442RealApprovedOriginalGoals.map(v=>({
    tick:frame.tick,id:v.id,target:v.target,distanceXZ:v.distanceXZ,
    actualFoot:v.physicalFoot,lastApprovedTick:v.lastApprovedNativeTick
   })));
  // This is evidence of distance to a genuinely requested goal,
  // NOT evidence that the CPU actually crossed the original gap.
  const closestById=Object.fromEntries(
   ['A2','A3','B1','B2','B3','B4'].map(id=>{
    const owned=rows.filter(r=>r.id===id);
    const best=owned.reduce((m,r)=>r.distanceXZ<m? r.distanceXZ:m,
     Number.POSITIVE_INFINITY);
    return [id,{minimumObservedGoalDistanceMeters:
      Number.isFinite(best)?best:null,
     closestObservationCount:owned.length,
     arrivedAtRealGoalInSamples:Number.isFinite(best)&&best<=1.5}];
   }));
  const observedArrivals=Object.values(closestById).filter(x=>
   x.arrivedAtRealGoalInSamples).length;
  proof.b441NativeEvidence={
   ...proof.b441NativeEvidence,phase:'NATIVE_CPU_REAL_WALK_MEASURED',
   b442ActualApprovedNativeTargetsAtFinish:actualTargets,
   b445LastOriginalGateByCpu:validateB445(afterPatrol),
   b446LiveActualCpuFootDryRouteProbes:
    afterPatrol?.b446LivePhysicalFootDryRouteProbes,
   b448A3RealEvidence:{
    enabled:afterPatrol?.b448A3ResearchEnabled,
    actualOriginalGoalsAuthorized:
     afterPatrol?.b448A3FreshLiveOriginalGoalsAuthorized,
    actualNativeGoalRequests:afterPatrol?.b448A3RealNativeGoalRequests,
    deniedUnsafeOrNoFreshProof:afterPatrol?.b448A3FreshLiveOriginalHolds,
    initialNativeFoot:baseline.A3,
    endingNativeFoot:actual.cpu.cpu.find(c=>c.id==='A3')?.physicalFoot,
    noActorPoseOrClockWrites:true,
    crossTeamPathCertified:false,
    formal4v4Certified:false
   },
   b442ClosestRealGoalDistances:closestById,
   b442ObservedUniqueGoalArrivals:observedArrivals,
   b442ArrivalWitnessVerdict:observedArrivals>0?
    'OBSERVED_AT_LEAST_ONE_TRUE_ORIGINAL_FRONT_GOAL_PROXIMITY':
    'HOLD_NO_OBSERVED_TRUE_FRONT_GOAL_ARRIVAL',
   b442Formal4v4Certified:false,
   lastTick:actual.tick,realNativeTicks:actual.tick-after.tick,
   realSevenCpu:true,actualGoalRequests:afterPatrol?.b441ActualGoalRequests,
   strictOriginalGoalsAvailable:afterPatrol?.b441StrictGoalsAvailable,
   closestApprovedFrontAbsZ:afterPatrol?.b441ClosestApprovedFrontAbsZ,
   heldUnsupported:afterPatrol?.b441UnsafeOrUnreachableHolds,
   originalActorFootObservations:observed,
   verdict:afterPatrol?.b441StrictGoalsAvailable>0&&
     afterPatrol?.b441ActualGoalRequests>0?
    'PASS_REAL_FRONT_GOAL_REQUESTS_NOT_CROSSING_OR_COMBAT':
    'HOLD_NO_GENUINE_ORIGINAL_FRONT_GOAL_PROVEN'};
  save();
  if(b448Experiment){
   const evidence=proof.b441NativeEvidence.b448A3RealEvidence;
   const a3=closestById.A3;
   const initial=baseline.A3;
   const end=actual.cpu.cpu.find(c=>c.id==='A3')?.physicalFoot;
   const displacement=Array.isArray(initial)&&Array.isArray(end)?
    Math.hypot(end[0]-initial[0],end[2]-initial[2]):null;
   evidence.nativePlanarDisplacementMeters=displacement;
   evidence.closestOriginalApprovedGoalMeters=
    a3.minimumObservedGoalDistanceMeters;
   evidence.realApprovedGoalSamples=a3.closestObservationCount;
   evidence.verifiedSourceOnlyGoalPass=
    evidence.enabled===true&&
    evidence.actualOriginalGoalsAuthorized===1&&
    evidence.actualNativeGoalRequests>0&&
    a3.closestObservationCount>0&&
    Number.isFinite(displacement)&&displacement>.5;
   if(!evidence.verifiedSourceOnlyGoalPass)
    fail('B448_REAL_A3_NATIVE_ORIGINAL_GOAL_OR_MOVEMENT_HOLD');
  }
  if(proof.b441NativeEvidence.verdict.startsWith('HOLD'))
   fail('B441_NO_REAL_ORIGINAL_FRONT_GOAL_GRANTED');
 }
 proof.verdict=b441Experiment?
  'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING':
  'PASS_FRESH_SOURCE_REAL_HUMAN_KEYW_AND_ORIGINAL_FOOT_NOT_REPLAY';
 proof.stage='TRUE_NATIVE_WALK_SUCCESS';save();
 console.log('B440_TRUE_SOURCE_NATIVE_HUMAN_WALK',JSON.stringify(proof));
}
try{await main();}catch(e){
 proof.verdict='HOLD';proof.error=String(e);save();
 console.error('B440_REAL_SOURCE_HOLD',String(e));process.exitCode=1;
}finally{
 if(ws){try{ws.close();}catch{}}
 for(const child of children.reverse()){
  try{child.kill('SIGTERM');}catch{}
 }
}

