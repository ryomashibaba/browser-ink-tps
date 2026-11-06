#!/usr/bin/env node
/**
 * B440: SHORT TRUE Chromium source-floor human-input gate.
 * B475 B441 variant exercises the actual user-selected SOURCE human combat;
 * the historical non-B441 variant retains its A1 cooperative QA world.
 * This is NOT
 * itself a clicked-replay/2x180s proof. Real browser, real 7 CPU first drops,
 * real player KCC, real CDP W-key; no actor/tick/score/navigation writes.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const root='http://127.0.0.1:4298/browser-ink-tps/';
const b441Experiment=process.env.T21_B441_SOURCE_FRONTLINE==='1';
// One-shot full replay uses the EXACT real frontline portal mode, which
// includes B448. The ordinary B441 short trial remains unchanged.
const b448Experiment=b441Experiment&&(
 process.env.T21_B448_A3_REAL_ORIGINAL_FRONT==='1'||
 process.env.T21_B441_PROVE_FULL_180S_REPLAY==='1');
// An explicitly selected ONE-SHOT, genuine >3600-tick browser case.
// Ordinary pushes keep the original short real-Chromium smoke.
const proveSourcePracticeExpiry=b441Experiment&&
 process.env.T21_B441_PROVE_60S_EXPIRY==='1';
const proveFullSourceReplay=b441Experiment&&
 process.env.T21_B441_PROVE_FULL_180S_REPLAY==='1';
if(proveFullSourceReplay&&proveSourcePracticeExpiry)
 throw Error('B441_ONE_SHOT_FULL_AND_60S_CONFLICT');
const query='?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay'+
 (b441Experiment?'&t21W10B112=humanGround&t21W10B192=humanCombat':
  '&t21W10B193=allyCoop')+'&t21W10B203=fullRound'+
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
     coop:document.querySelector('#play-coop').href,
     frontline:document.querySelector('#play-combat-frontline')?.href}:null;
 })()`),30000);
 const url=new URL(portals.circuit),opponent=new URL(portals.combat),
  ally=new URL(portals.coop),frontline=new URL(portals.frontline);
 if(url.origin!==new URL(root).origin||url.pathname!==new URL(root).pathname||
  url.searchParams.get('t21W10B384')!=='loadoutCircuit'||
  url.searchParams.get('t21W10B203')!=='fullRound'||
  opponent.searchParams.get('t21W10B192')!=='humanCombat'||
  opponent.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.get('t21W10B193')!=='allyCoop'||
  ally.searchParams.get('t21W10B203')!=='fullRound'||
  ally.searchParams.has('t21W10B192')||
  frontline.origin!==url.origin||frontline.pathname!==url.pathname||
  frontline.searchParams.get('t21W10B192')!=='humanCombat'||
  frontline.searchParams.get('t21W10B203')!=='fullRound'||
  frontline.searchParams.get('t21W10B441')!=='sourceFrontline'||
  frontline.searchParams.get('t21W10B448')!=='realA3Front'||
  frontline.searchParams.has('production')||
  frontline.searchParams.has('scoreable')||
  url.searchParams.has('production')||url.searchParams.has('scoreable'))
  fail('PORTAL_SOURCE_DESTINATION_AUTHORITY');
 // Human-facing mode selection must be visible and clickable without
 // scrolling on a 1600x900 game display. Check ACTUAL Chromium layout,
 // not a synthetic CSS/viewport claim. No actor/score/clock writes.
 const realMenuButtons=await evaluate(`(() => {
  const selectors=['#play-circuit','#play-coop',
   '#play-combat','#play-combat-frontline'];
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
 if(!Array.isArray(realMenuButtons)||realMenuButtons.length!==4||
  realMenuButtons.some(v=>!v.enabled||
   !Number.isFinite(v.buttonTop)||v.buttonTop<0||
   !Number.isFinite(v.buttonBottom)||v.buttonBottom>880||
   !Number.isFinite(v.cardBottom)||v.cardBottom>895||
   !Number.isFinite(v.buttonWidth)||v.buttonWidth<160))
  fail('REAL_1600x900_SOURCE_MODE_CHOICE_REQUIRES_SCROLL');
 proof.realSourceModeViewport={
  actualChromium1600x900:true,threeOptionsImmediatelyAccessible:true,
  optionalFrontlineLinkImmediatelyAccessible:true,
  realMenuButtons,sourceOnly:true,gameplayWrites:0,officialWinner:'NONE'};
 save();
 const portalPicture=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof portalPicture?.data!=='string'||portalPicture.data.length<100)
  fail('PORTAL_REAL_CHROMIUM_SCREENSHOT_MISSING');
 writeFileSync(resolve(out,'source-play-portal-real-chromium.png'),
  Buffer.from(portalPicture.data,'base64'));
 // Native keyboard/mouse choice, never DOM-value injection: this proves
 // the human-facing selector and B389 original fresh-world boot jointly.
 const catalog=await evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  return p?{id:p.value,options:[...p.options].map(o=>o.value),
   bottom:p.getBoundingClientRect().bottom}:null;
 })()`);
 if(!catalog||catalog.options.length!==12||
  catalog.id!=='pulse-sprayer'||catalog.options.at(-1)!=='ink-saber'||
  catalog.bottom>880)fail('REAL_SOURCE_LOADOUT_CATALOG_AND_LAYOUT');
 await buttonClick('#source-weapon-preselect');
 for(const [type,key,code,n] of [
  ['keyDown','End','End',35],['keyUp','End','End',35],
  ['keyDown','Enter','Enter',13],['keyUp','Enter','Enter',13]
 ]){
  await cdp('Input.dispatchKeyEvent',{
   type,key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n
  });
 }
 const actualChoice=await until(()=>evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  const a=document.querySelector('#play-circuit');
  const href=a?.href?new URL(a.href):null;
  return p?.value==='ink-saber'&&
   href?.searchParams.get('t21W10B389')==='ink-saber'&&
   localStorage.getItem('t21-source-weapon-selection-v1')==='ink-saber'?
   {value:p.value,safeUrl:a.href}:null;
 })()`),15000);
 if(!actualChoice)fail('REAL_CDP_PLAYER_LOADOUT_CHOICE_NOT_SAVED');
 const loadoutImage=await cdp('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false});
 if(typeof loadoutImage?.data!=='string'||loadoutImage.data.length<100)
  fail('REAL_NATIVE_WEAPON_MENU_IMAGE_MISSING');
 writeFileSync(resolve(out,'source-play-selected-ink-saber.png'),
  Buffer.from(loadoutImage.data,'base64'));
 await buttonClick('#play-circuit');
 const clicked=await until(()=>evaluate(`location.search.includes(
  't21W10B384=loadoutCircuit')&&
  location.search.includes('t21W10B203=fullRound')&&
  location.search.includes('t21W10B389=ink-saber')`),20000);
 if(!clicked||new URL(await evaluate('location.href')).pathname!==
    new URL(root).pathname)
  fail('PORTAL_REAL_CDP_CLICK_DID_NOT_START_EXISTING_SOURCE_GAME');
 // Wait for the genuine PlayCanvas/Rapier world to initialize before
 // querying its snapshot: incomplete boot is not negative weapon evidence.
 await until(()=>evaluate(`document.querySelector('#app-canvas')
  ?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')
  ?.dataset.t21F3Renderer==='webgl2'`),120000);
 const native=await until(async()=>{
  const s=await evaluate('window.__t21F3?.snapshot?.()??null');
  return s?.b361NativePlayerWeapon?.id==='ink-saber'?s:null;
 },30000);
 authority(native);
 if(native.matchState!=='STAGING'||native.b384OpenLoadoutCircuit!==true)
  fail('REAL_NATIVE_PRESELECT_WEAPON_NOT_STAGING');
 proof.realSourcePlayPortal={
  verdict:'PASS_ACTUAL_CDP_SOURCE_LOADOUT_TO_NATIVE_PLAYCANVAS_WEAPON',
  realCdpMouseClick:true,realCdpWeaponKeyboard:true,
  nativeWeaponId:native.b361NativePlayerWeapon.id,
  nativeWeaponDisplay:native.b361NativePlayerWeapon.displayName,
  nativeWeaponInStaging:true,persistedPreference:actualChoice.value,
  sourceOnly:true,existing12WeaponCircuit:true,
  actualScreenshot:'source-play-selected-ink-saber.png',
  scriptInjectedActors:0,nativeTickWrites:0,officialWinner:'NONE',
  formal4v4Certified:false,productionAuthorized:false};
 save();
 // Returning to the portal retains ONLY the selected weapon, never the
 // native actors, ink or game tick from the previous SOURCE world.
 await cdp('Page.navigate',{url:root+'play-source.html'});
 await until(()=>evaluate(`(() => {
  const p=document.querySelector('#source-weapon-preselect');
  const links=['#play-circuit','#play-combat','#play-coop',
   '#play-combat-frontline'].map(q=>document.querySelector(q));
  return document.querySelector('#portal-status')
   ?.dataset.t21PortalReady==='SOURCE_ONLY'&&
   p?.value==='ink-saber'&&links.every(a=>a?.href&&
    new URL(a.href).searchParams.get('t21W10B389')==='ink-saber'&&
    a.dataset.t21SourceInitialWeapon==='ink-saber');
 })()`),30000);
 proof.realSourceAllModeLoadout={
  samePlayerSelectedKitInAllFourLinks:true,
  actualNativeSourcePortal:true,originalModeFlagsPreserved:true,
  changedActorOrInkWrites:0,productionAuthorized:false
 };
 save();
 // In the long user-flow the human now deliberately selects a compatible
 // AUTO weapon: the 45s held-primary projectile test is not valid for
 // Ink Saber (SPLATANA executes its slash only on mouse RELEASE).
 // The historical short B441 case and original Ink Saber portal test stay.
 const fullReplayHumanKit=proveFullSourceReplay?'needle-smg':'ink-saber';
 if(proveFullSourceReplay){
  await buttonClick('#source-weapon-preselect');
  for(const [type,key,code,n] of [
    ['keyDown','Home','Home',36],['keyUp','Home','Home',36],
    ['keyDown','ArrowDown','ArrowDown',40],
    ['keyUp','ArrowDown','ArrowDown',40],
    ['keyDown','Enter','Enter',13],['keyUp','Enter','Enter',13]
  ])await cdp('Input.dispatchKeyEvent',{
   type,key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n
  });
  const choice=await until(()=>evaluate(`(() => {
   const p=document.querySelector('#source-weapon-preselect');
   const links=['#play-circuit','#play-combat','#play-coop',
    '#play-combat-frontline'].map(q=>{
     const a=document.querySelector(q);
     return a?.href?new URL(a.href).searchParams.get('t21W10B389'):null;
   });
   return p?.value==='needle-smg'&&
    links.every(v=>v==='needle-smg')&&
    localStorage.getItem('t21-source-weapon-selection-v1')==='needle-smg'?
    {selected:'needle-smg',linksVerified:4,realKeyboard:true,
     directGameWrites:0}:null;
  })()`),18000,200);
  proof.fullReplayRealHumanPortalWeaponChoice=choice;save();
 }
 await buttonClick('#play-combat-frontline');
 await until(()=>evaluate(`document.querySelector('#app-canvas')
  ?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')
  ?.dataset.t21F3Renderer==='webgl2'`),120000);
 const optionalBoot=await snap();authority(optionalBoot);
 if(optionalBoot.b361NativePlayerWeapon?.id!==fullReplayHumanKit||
    optionalBoot.matchState!=='STAGING')
  fail('FRONTLINE_REAL_SOURCE_PRESELECTED_WEAPON_NOT_APPLIED');
 proof.realSourceAllModeLoadout.frontlineNativeBootWeapon=fullReplayHumanKit;
 save();
 const optionalUI=await evaluate(`(() => {
  const canvas=document.querySelector('#app-canvas');
  const search=new URL(location.href).searchParams;
  return {b192:canvas?.dataset.t21B192HumanCombat,
   b441:canvas?.dataset.t21B441OriginalFrontline,
   b448:canvas?.dataset.t21B448RealA3OriginalGoal,
   route:search.get('t21W10B441'),a3:search.get('t21W10B448'),
   origin:location.origin,path:location.pathname};
 })()`);
 if(optionalBoot.matchState!=='STAGING'||
    optionalBoot.originalSourceSolids!==25||
    optionalBoot.originalPaintSurfaces!==17||
    optionalBoot.originalSourceNavigationLinks!==26||
    optionalBoot.sourceScoreablePromotions!==0||
    optionalBoot.cpu.cpu.length!==7||
    optionalUI.b192!=='REAL_SOURCE_ONLY'||
    optionalUI.b441!=='SOURCE_ONLY_INDEPENDENT_FRONTLINE_RESEARCH'||
    optionalUI.b448!=='STRICT_REAL_CPU_A3_ORIGINAL_GOAL_REAUTHORIZATION'||
    optionalUI.route!=='sourceFrontline'||
    optionalUI.a3!=='realA3Front'||
    optionalUI.origin!==url.origin||optionalUI.path!==url.pathname)
  fail('OPTIONAL_REAL_FRONTLINE_SOURCE_WORLD_AUTHORITY_HOLD');
 const optHud=await until(()=>evaluate(`(() => {
  const root=document.querySelector('#t21-f3-b464-real-cpu-frontline');
  const game=window.__t21F3?.snapshot();
  const patrol=game?.cpu?.sourcePatrol;
  if(!root||!patrol)return null;
  return {state:root.dataset.t21B464State,
   source:root.dataset.t21B464Authority,
   score:root.dataset.t21B464OfficialScoreable,
   routes:root.dataset.t21B464CrossTeamRoutes,
   nativeGoalRequests:root.dataset.t21B464NativeGoalRequests,
   actualRequests:patrol.b441ActualGoalRequests,
   originalArrivals:root.dataset.t21B464OriginalArrivals,
   actualArrivals:patrol.b443FirstActualFrontlineArrivals,
   visible:getComputedStyle(root).display!=='none',
   sourceVerified:game.originalSourceSolids===25&&
    game.originalPaintSurfaces===17&&
    game.originalSourceNavigationLinks===26&&
    game.sourceScoreablePromotions===0,
   noOfficialWinner:root.textContent?.includes('UNSCORED')===true};
 })()`),16000);
 if(optHud.state!=='READY'||optHud.source!=='25/17/26/0'||
    optHud.score!=='0'||optHud.routes!=='0'||
    optHud.nativeGoalRequests!==String(optHud.actualRequests)||
    optHud.originalArrivals!==String(optHud.actualArrivals)||
    !optHud.visible||!optHud.sourceVerified||!optHud.noOfficialWinner)
  fail('REAL_SOURCE_FRONTLINE_PLAYER_HUD_MUST_MATCH_NATIVE_CPU');
 proof.optionalCpuFrontlinePlayerHud=optHud;save();
 proof.optionalCpuFrontlinePortal={
  verdict:'PASS_NATIVE_USER_CLICK_TO_REAL_SOURCE_FRONTLINE_MODE',
  genuineCdpClick:true,realCpuCount:7,source:'25/17/26/0',
  nativeStartState:'STAGING',officialScoreable:0,
  realOpponentCrossSideCertified:false,opponentHitCertified:false,
  productionAuthorized:false,officialWinner:'NONE'};
 save();
 // The explicitly selected FULL REPLAY must continue the REAL world
 // created by the actual user's visible FRONTLINE menu click ABOVE.
 // The old B441-only synthetic research URL is not a canonical portal
 // destination, and cannot acquire an authorized human B389 boot by
 // appending one query parameter. Ordinary short trial is unchanged.
 const fullReplayQuery=proveFullSourceReplay?
  query+'&t21W10B389='+fullReplayHumanKit:query;
 if(!proveFullSourceReplay)
  await cdp('Page.navigate',{url:root+query});
 await until(()=>evaluate(`document.querySelector('#app-canvas')?.dataset.t21F3Ready==='READY'&&
  document.querySelector('#app-canvas')?.dataset.t21F3Renderer==='webgl2'`),120000);
 const actualQuery=await evaluate('location.search');
 if(proveFullSourceReplay){
  const a=new URLSearchParams(actualQuery);
  const expected=new URLSearchParams(fullReplayQuery);
  if([...a.entries()].length!==[...expected.entries()].length||
     [...expected.entries()].some(([k,v])=>
      a.getAll(k).length!==1||a.get(k)!==v))
   fail('FULL_REPLAY_REAL_PORTAL_CANONICAL_MODE_QUERY_HOLD');
 }else if(actualQuery!==query)fail('WRONG_SOURCE_URL');
 if(proveFullSourceReplay){
  const boot=await snap();authority(boot);
  proof.fullReplayActualSourceBoot={
   originalSource:'25/17/26/0',selectedUserKit:fullReplayHumanKit,
   reusedActualClickedFrontlineWorld:true,
   nativeBootKit:boot.b361NativePlayerWeapon?.id??null,
   realNativeTick:boot.tick,matchState:boot.matchState,
   url:await evaluate('location.href'),
   nativeSevenCpuActors:boot.cpu.cpu.length,
   sourceScoreablePromotions:boot.sourceScoreablePromotions,
   originalActorWrites:0,nativeClockWrites:0,scoreWrites:0
  };
  save();
  if(boot.b361NativePlayerWeapon?.id!==fullReplayHumanKit||
     boot.matchState!=='STAGING'||boot.tick!==0||
     boot.cpu.cpu.length!==7||boot.sourceScoreablePromotions!==0)
   fail('FULL_REAL_SELECTED_HUMAN_WEAPON_NATIVE_BOOT_HOLD');
 }
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
 // Real Chrome inspects REAL SOURCE game DOM at READY, without
 // fabricating TIME_UP or any stats. Later 180s ART remains separate.
 const footer=await evaluate(`(() => {
  const modal=document.querySelector('#t21-f3-b59-session-finished');
  const card=modal?.firstElementChild;
  const stats=modal?.querySelector('#t21-f3-b59-scroll-stats');
  const actions=modal?.querySelector('#t21-f3-b59-footer-actions');
  const restart=modal?.querySelector('#t21-f3-b59-restart');
  const change=modal?.querySelector('#t21-f3-source-mode-menu-after-match');
  return {originalScoreable:modal?.dataset.originalScoreable,
   hidden:modal?.hidden===true,
   cardDisplay:card?getComputedStyle(card).display:null,
   statsOverflow:stats?getComputedStyle(stats).overflowY:null,
   footerShrink:actions?getComputedStyle(actions).flexShrink:null,
   restartPinned:!!actions&&actions.contains(restart),
   modePinned:!!actions&&actions.contains(change),
   statsSeparate:!!stats&&!!actions&&!actions.contains(stats)};
 })()`);
 if(footer?.originalScoreable!=='0'||footer.hidden!==true||
    footer.cardDisplay!=='flex'||footer.statsOverflow!=='auto'||
    footer.footerShrink!=='0'||!footer.restartPinned||
    !footer.modePinned||!footer.statsSeparate)
  fail('REAL_SOURCE_REPLAY_AND_MODE_ACTIONS_MUST_BE_PINNED');
 proof.sourceFinishUiLayout=footer;save();
 const boot=await snap();authority(boot);
 if(boot.matchState!=='STAGING'||boot.cpu.physicalRejoins.length!==0)
  fail('NOT_FRESH_NATIVE_SOURCE_WORLD');
 if(b441Experiment){
  const q=new URL(await evaluate('location.href')).searchParams;
  const mode=await evaluate(`document.querySelector('#app-canvas')?.dataset.t21B475RealFrontlineReady`);
  if(q.get('t21W10B192')!=='humanCombat'||q.has('t21W10B193')||
     mode!=='ACTUAL_SOURCE_CLASSIC_PREARM'||
     boot.b214SustainedBattleInk?.enabled!==true||
     boot.b215RealBattleAimPacing?.enabled!==true||
     boot.b216RealNativePaintBackfill?.enabled!==true||
     boot.b367RealCpuLifecycleEvidence?.enabled!==true||
     boot.b474NativeSteeringEvidence?.enabled!==true)
    fail('B475_REAL_PLAYER_MODE_NATIVE_PIPELINES_NOT_ENABLED');
  // B478: native B441-only play does not carry the separate B448 flag.
  // Require genuine B464 DOM at actual READY before expensive 720 tick.
  const b478Hud=await until(()=>evaluate(`(() => {
   const h=document.querySelector('#t21-f3-b464-real-cpu-frontline');
   const n=window.__t21F3?.snapshot?.();
   if(!h||!n)return null;
   return {state:h.dataset.t21B464State,
    source:h.dataset.t21B464Authority,
    requests:h.dataset.t21B464NativeGoalRequests,
    noScore:h.dataset.t21B464OfficialScoreable,
    crossTeam:h.dataset.t21B464CrossTeamRoutes,
    a3OptIn:n.cpu?.sourcePatrol?.b448A3ResearchEnabled,
    a3Requests:n.cpu?.sourcePatrol?.b448A3RealNativeGoalRequests,
    hasB441:n.cpu?.sourcePatrol?.b441Enabled,
    actualNativeTick:n.tick};
  })()`),15000,250);
  const originalHudValid=b478Hud.state==='READY'&&
   b478Hud.source==='25/17/26/0'&&
   b478Hud.requests!=='NOT_VERIFIED'&&
   b478Hud.noScore==='0'&&b478Hud.crossTeam==='0'&&
   b478Hud.hasB441===true;
  if(!originalHudValid)
   fail('B478_REAL_SOURCE_NATIVE_FRONTLINE_HUD_UNAUTHORIZED_OR_STALE');
  if(b448Experiment){
   // Real four-mode FRONTLINE portal explicitly enables B448. Never
   // mislabel it as the historical B441-only native research mode.
   if(b478Hud.a3OptIn!==true||
      !Number.isSafeInteger(b478Hud.a3Requests)||
      b478Hud.a3Requests<0)
    fail('FULL_REAL_CANONICAL_B448_NATIVE_READY_HUD_NOT_PROVEN');
   proof.b478RealB441B448NativeHud={
    ...b478Hud,canonicalUserFrontline:true,
    b448ActuallyEnabled:true,originalSourceResearchOnly:true,
    sourceWrites:0,actorWrites:0,officialWinner:'NONE'};
  }else{
   // Keep the old B441-only absence-of-B448 safety gate unchanged.
   if(b478Hud.a3OptIn!==false||b478Hud.a3Requests!==0)
    fail('B478_B441_ONLY_NATIVE_HUD_UNAUTHORIZED_OR_STALE');
   proof.b478RealB441OnlyNativeHud={
    ...b478Hud,originalSourceResearchOnly:true,
    a3WasNotAuthorized:true,sourceWrites:0,actorWrites:0,
    officialWinner:'NONE'};
  }
  save();
  proof.b475ActualSourceUserCombat={
   realUserCombatMode:true,originalReadyTick:boot.tick,
   realSevenCpuNativeActors:boot.cpu.cpu.length,
   nativeBattleInk:true,realHpWitnessEnabled:true,
   boundedNativeCpuSteering:true,syntheticShots:0,sourceScoreable:0,
   certifiedEnemyRoutes:false,officialWinner:'NONE'};
  save();
 }
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
 let lastRealSourceSample=null, polls=0,highestNativeTick=-1;
 let lastNativeAdvanceAt=Date.now();
 const observeRealPhysicalCpu=async()=>{
  const n=await snap();authority(n);
  const pointer=await locked();
  if(n.tick>highestNativeTick){
   highestNativeTick=n.tick;lastNativeAdvanceAt=Date.now();
  }
  if(++polls%20===0){
   const joined=n.cpu.physicalRejoins;
   const missing=n.cpu.cpu.filter(c=>!joined.includes(c.id));
   lastRealSourceSample={tick:n.tick,phase:n.matchState,paused:n.paused,
    joins:joined.length,originalCpuIds:n.cpu.cpu.map(c=>c.id),
    missingCpu:missing.map(c=>({id:c.id,rejoined:c.rejoined,
     lifeState:c.lifeState,physicalFoot:c.physicalFoot})),
    mission:n.b25SourcePaintRun?.status,
    foot:foot(n),body:n.player.position,pointerLocked:pointer,
    nativeAdvanceAgeMs:Date.now()-lastNativeAdvanceAt};
   proof.lastNativeReadOnlySample=lastRealSourceSample;
   // The B477 in-game cue is independent of this read-only QA sample.
   save();
  }
  if(n.matchState==='TIME_UP')fail('NO_GENUINE_WALK_BEFORE_TIME_UP');
  return pointer&&n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7&&n.player.mode==='HUMAN'&&
   n.b25SourcePaintRun?.status==='RUNNING'&&
   trueOriginalFoot(foot(n))?n:false;
 };
 let ready;
 try{
  ready=await until(observeRealPhysicalCpu,360000,350);
 }catch(error){
  // B477: one strictly bounded extra observation is permitted only after
  // genuine 6/7 original-source rejoin, actual monotonic native clock
  // progress near the prior B476 timeout tick, no native stop/pause and
  // no missed actor replaced. NEVER promote 6/7 or a timeout to PASS.
  const latest=lastRealSourceSample;
  const extension=b441Experiment&&
   String(error).includes('B440_SHORT_REAL_NATIVE_HOLD_TIMEOUT_')&&
   latest?.phase==='STAGING'&&latest.paused===false&&
   latest.joins===6&&latest.mission==='ARMED'&&
   Number.isSafeInteger(latest.tick)&&latest.tick>=1000&&
   latest.nativeAdvanceAgeMs<=30000&&
   Array.isArray(latest.missingCpu)&&latest.missingCpu.length===1;
  proof.b477RealStartupHandoff={
   source:'25/17/26/0',lastNative:latest,reason:String(error),
   extensionPermitted:!!extension,actorWrites:0,scoreWrites:0,
   nativeClockWrites:0,originalRoutesCertified:false};
  save();
  if(!extension)throw error;
  ready=await until(observeRealPhysicalCpu,90000,350);
  proof.b477RealStartupHandoff.native7Of7AfterBoundedExtension=true;
  proof.b477RealStartupHandoff.endNativeTick=ready.tick;
  save();
 }
 if(b441Experiment){
  // B476 is a PLAYER UI check on actual Chrome DOM, not a fake
  // screenshot or model-authored source HUD. Native challenge MUST
  // already be RUNNING after 7 original Rapier CPU joins.
  // B479: the real native tick can reach 7/7 between slow WebGL frames.
  // Wait for the DOM to catch up without modifying native simulation.
  // Save the exact last observed DOM even when the UI never converges.
  let b479Last=null,b479Polls=0;
  let compact;
  try{
   compact=await until(async()=>{
    const observed=await evaluate(`(() => {
   const c=document.querySelector('#t21-f3-b25-paint-run');
   const f=document.querySelector('#t21-f3-b464-real-cpu-frontline');
   const n=window.__t21F3?.snapshot?.();
   if(!c||!f||!n)return null;
   const a=c.getBoundingClientRect(),b=f.getBoundingClientRect();
   return {nativeTick:n.tick,realMission:n.b25SourcePaintRun?.status,
    missionPaint:n.b25SourcePaintRun?.humanChangedImpactCells,
    missionGround:n.b25SourcePaintRun?.realGroundedTravelMeters,
    visible:!c.hidden&&getComputedStyle(c).display!=='none',
    actualB476State:c.dataset.t21B476State,
    compact:c.dataset.t21B476Compact,
    originalSource:c.dataset.t21B476OriginalSource,
    officialWinner:c.dataset.t21B476OfficialWinner,
    b25:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},
    frontline:{left:b.left,right:b.right,top:b.top,bottom:b.bottom},
    actualProgressVisible:
     getComputedStyle(document.querySelector(
      '#t21-f3-b53-objectives')).display!=='none',
    onlyActualPractice:
     document.querySelector('#t21-f3-b53-paint-label')?.textContent,
    realFrontlinePanel:f.dataset.t21B464Authority,
    f8:(()=>{
     const h=document.querySelector('#t21-f3-b245-view-toggle');
     if(!h)return null;
     const s=h.getBoundingClientRect();
     return {left:s.left,right:s.right,top:s.top,bottom:s.bottom,
      visible:getComputedStyle(h).display!=='none'};
    })(),
    nativeTeam:(()=>{
     const t=document.querySelector('#t21-f3-b286-source-team');
     if(!t)return null;
     const r=t.getBoundingClientRect();
     return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      placement:t.dataset.t21B482NativeSourceTeamPlacement,
      visible:!t.hidden&&getComputedStyle(t).display!=='none',
      sourceScoreable:t.dataset.scoreable,
      officialWinner:t.dataset.officialWinner,
      enemyContactCertified:t.dataset.enemyContactCertified,
      realAllyCount:t.dataset.allyActive,
      realEnemyCount:t.dataset.enemyActive};
    })(),
    focusedCssRestoration:!!document.querySelector(
     '#t21-f3-b245-layer-style')?.textContent?.includes(
      '#t21-f3-b25-paint-run[data-t21-b476-compact="true"]')};
  })()`);
    if(!observed)return null;
    b479Last=observed;b479Polls++;
    if(b479Polls%5===0){
     proof.b479LatestNativeDomProbe={
      sample:b479Last,observations:b479Polls,source:'25/17/26/0',
      gameplayWrites:0,scoreWrites:0,artApproved:false};
     save();
    }
    const verified=observed.realMission==='RUNNING'&&observed.visible&&
     observed.actualB476State==='LIVE'&&observed.compact==='true'&&
     observed.originalSource==='25/17/26/0'&&
     observed.officialWinner==='NONE'&&
     observed.realFrontlinePanel==='25/17/26/0'&&
     observed.actualProgressVisible&&
     Number.isFinite(observed.missionGround)&&
     Number.isSafeInteger(observed.missionPaint)&&
     observed.b25.left<=25&&observed.b25.right<=350&&
     observed.b25.right<observed.frontline.left-15&&
     observed.focusedCssRestoration===true&&
     observed.f8?.visible===true&&
     observed.nativeTeam?.visible===true&&
     observed.nativeTeam.placement==='TOP_LEFT'&&
     observed.nativeTeam.left<=30&&observed.nativeTeam.top<=30&&
     observed.nativeTeam.bottom<observed.b25.top-20&&
     observed.nativeTeam.right<observed.frontline.left-20&&
     observed.nativeTeam.sourceScoreable==='0'&&
     observed.nativeTeam.officialWinner==='NONE'&&
     observed.nativeTeam.enemyContactCertified==='false'&&
     observed.nativeTeam.realAllyCount==='3'&&
     observed.nativeTeam.realEnemyCount==='4'&&
     (observed.f8.left>=observed.b25.right+5||
      observed.f8.bottom<=observed.b25.top-5||
      observed.f8.top>=observed.b25.bottom+5)&&
     (observed.f8.left>=observed.frontline.right+5||
      observed.f8.right<=observed.frontline.left-5||
      observed.f8.bottom<=observed.frontline.top-5||
      observed.f8.top>=observed.frontline.bottom+5);
    return verified?observed:null;
   },20000,250);
  }catch(error){
   proof.b479LatestNativeDomProbe={
    sample:b479Last,observations:b479Polls,source:'25/17/26/0',
    reason:String(error),gameplayWrites:0,scoreWrites:0,
    originalRouteGranted:false,artApproved:false};
   save();throw error;
  }
  proof.b479LatestNativeDomProbe={
   sample:compact,observations:b479Polls,source:'25/17/26/0',
   verdict:'PASS_SAME_REAL_NATIVE_GAME_AND_SOURCE_DOM',
   gameplayWrites:0,scoreWrites:0,artApproved:false};
  save();
  if(compact.realMission!=='RUNNING'||!compact.visible||
     compact.actualB476State!=='LIVE'||compact.compact!=='true'||
     compact.originalSource!=='25/17/26/0'||
     compact.officialWinner!=='NONE'||
     compact.realFrontlinePanel!=='25/17/26/0'||
     !compact.actualProgressVisible||
     !Number.isFinite(compact.missionGround)||
     !Number.isSafeInteger(compact.missionPaint)||
     compact.b25.left>25||compact.b25.right>350||
     compact.b25.right>=compact.frontline.left-15)
    fail('B476_REAL_PLAYER_PRACTICE_HUD_OBSCURES_CPU_FRONTLINE');
  proof.b476RealPlayerFocusedObjective={
   ...compact,actualOriginalPlayerNoSyntheticInk:true,
   gameplayWrites:0,scoreable:0,officialWinner:'NONE'};
  save();
 }
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
  // The real player crosshair now reads existing SOURCE ownerGrid,
  // never certifies a bullet hit or creates scored paint. Capture an
  // actual Chromium sight-line after genuine native PLAYING and 7/7.
  const b481=await evaluate(`(() => {
   const n=document.querySelector('#t21-f3-b243-source-aim-line');
   const game=window.__t21F3?.snapshot?.();
   if(!n||!game)return null;
   return {nativeTick:game.tick,
    aimKind:n.dataset.t21B243AimLineKind,
    actualSourceOwner:n.dataset.t21B481OriginalOwner??'OFF',
    originalOwnerTick:n.dataset.t21B481NativeTick??'-1',
    aimingNotImpact:n.dataset.t21B481AimingNotImpact,
    officialWinner:n.dataset.t21B481OfficialWinner,
    displayed:n.textContent,
    sourceScoreable:game.sourceScoreablePromotions,
    productionAuthorized:game.productionAuthorized,
    nativeCpu7:game.cpu?.physicalRejoins?.length};
  })()`);
  if(!b481||!['OFF','OWN','NEUTRAL','OPPONENT'].includes(
      b481.actualSourceOwner)||b481.aimingNotImpact!=='true'||
     b481.officialWinner!=='NONE'||b481.sourceScoreable!==0||
     b481.productionAuthorized!==false||b481.nativeCpu7!==7||
     (b481.actualSourceOwner!=='OFF'&&
      (b481.aimKind!=='SOURCE_PAINT'||
       !b481.displayed.includes('AIM ONLY / UNSCORED'))))
    fail('B481_REAL_SOURCE_CROSSHAIR_OWNER_CANNOT_BE_FABRICATED');
  proof.b481RealSourceAimInkReadOnly={
   ...b481,gameplayWrites:0,certifiedPaintImpacts:0,
   certifiedOriginalOpponentCrossings:0,officialWinner:'NONE'};
  save();
 }
 if(b441Experiment){
  // B475: CDP mouse is real human pointer-locked input, never a scripted
  // projectile, enemy movement, hit, score or simulation clock injection.
  const beforeShot=await snap();authority(beforeShot);
  const pressedAtTick=beforeShot.tick;
  let pressed=false,shot=null,latestRealMouseSample=null;
  try{
   await cdp('Input.dispatchMouseEvent',{
    type:'mousePressed',x:800,y:450,button:'left',buttons:1,clickCount:1});
   pressed=true;
   try{
    shot=await until(async()=>{
     const n=await snap();authority(n);
     const pointerLocked=await locked();
     latestRealMouseSample={
      nativeTick:n.tick,realTickDelta:n.tick-pressedAtTick,
      actualHumanShots:n.shotsFired,realCpuCount:n.cpu.physicalRejoins.length,
      nativeState:n.matchState,paused:n.paused,pointerLocked
     };
     // Genuine SwiftShader may be slow. Original native +6 and real
     // projectile acceptance remain mandatory, never synthesize a shot.
     if(n.tick<pressedAtTick||n.matchState!=='PLAYING'||n.paused||
        !pointerLocked||n.cpu.physicalRejoins.length!==7)
      fail('B475_REAL_NATIVE_MOUSE_INPUT_INTERRUPTED');
     return n.tick>=pressedAtTick+6&&
      n.shotsFired>beforeShot.shotsFired?n:false;
    },45000,250);
   }catch(error){
    proof.b475NativeMouseShotHold={
     source:'25/17/26/0',input:'REAL_CDP_MOUSE_PRESSED',
     firstNativeTick:pressedAtTick,
     initialHumanShots:beforeShot.shotsFired,
     lastObserved:latestRealMouseSample,
     nativeClockWrites:0,actorWrites:0,scoreWrites:0,
     syntheticShots:0,reason:String(error)
    };
    save();throw error;
   }
  }finally{
   if(pressed)await cdp('Input.dispatchMouseEvent',{
    type:'mouseReleased',x:800,y:450,button:'left',buttons:0,clickCount:1});
  }
  if(!shot||shot.paused||shot.matchState!=='PLAYING'||
     !await locked()||shot.b367RealCpuLifecycleEvidence?.enabled!==true||
     shot.shotsFired<=beforeShot.shotsFired||
     shot.sourceScoreablePromotions!==0)
    fail('B475_ACTUAL_PLAYER_POINTER_SHOT_NOT_NATIVE');
  // F3 genuine player feedback acceptance in the SAME real Chromium
  // world. This validates the real B356 reader, not the scripted act of
  // shooting, and never credits a shot as paint or an opponent HP hit.
  proof.b475RealMouseAccepted={
   genuineChromeMouse:true,firstNativeTick:pressedAtTick,
   lastShotNativeTick:shot.tick,previousHumanShots:beforeShot.shotsFired,
   realHumanShots:shot.shotsFired,realCpuCount:shot.cpu.physicalRejoins.length,
   source:'25/17/26/0',actorWrites:0,clockWrites:0,scoreWrites:0,
   cpuHpHitCertified:false,officialWinner:'NONE'
  };
  proof.stage='REAL_MOUSE_SHOT_ACCEPTED_B356_PENDING';save();
  let impactCue;
  try{
   impactCue=await until(async()=>evaluate(`(() => {
   const e=document.querySelector('#t21-f3-b356-real-source-reticle');
   const n=window.__t21F3?.snapshot?.();
   if(!e||!n)return null;
   const mode=e.dataset.t21B356LastRealCueMode??'';
   const eventTick=Number(e.dataset.t21B356LastRealCueNativeTick);
   if(!mode||!Number.isSafeInteger(eventTick))return null;
   return {enabled:e.dataset.t21B356NativeSourceFeedbackEnabled,
    lastMode:mode,lastNativeTick:eventTick,
    gameTick:n.tick,actualShotCount:n.shotsFired,
    humanChangedImpactCount:n.b23HumanInkFeedback?.humanChangedImpactCount,
    lastImpactChangedCells:n.b23HumanInkFeedback?.lastImpactChangedCells,
    genuineHumanCpuHits:n.humanCpuDirectHits,
    sourceSolids:n.originalSourceSolids,
    originalPaint:n.originalPaintSurfaces,
    originalLinks:n.originalSourceNavigationLinks,
    originalScoreable:n.sourceScoreablePromotions,
    actualVisible:!e.hidden&&getComputedStyle(e).display!=='none',
    officialWinner:n.officialWinner??'NONE'};
  })()`),25000,250);
  }catch(error){
   let state=null;
   try{
    state=await evaluate(`(() => {
     const e=document.querySelector('#t21-f3-b356-real-source-reticle');
     const n=window.__t21F3?.snapshot?.();
     return {nativeTick:n?.tick??null,humanShots:n?.shotsFired??null,
      exists:!!e,lastMode:e?.dataset.t21B356LastRealCueMode??null,
      lastCueTick:e?.dataset.t21B356LastRealCueNativeTick??null,
      matchState:n?.matchState??null,paused:n?.paused??null,
      scoreable:n?.sourceScoreablePromotions??null};
    })()`);
   }catch{/* Preserve original timeout and already accepted real shot. */}
   proof.b356NativeHudHold={realShot:proof.b475RealMouseAccepted,
    lastRealDom:state,reason:String(error),nativeClockWrites:0,
    actorWrites:0,scoreWrites:0};save();throw error;
  }
  if(!impactCue||impactCue.enabled!=='true'||
     !['ACTUAL_SHOT_ONLY','REAL_PAINT'].includes(impactCue.lastMode)||
     impactCue.lastNativeTick<pressedAtTick||
     impactCue.lastNativeTick>impactCue.gameTick||
     impactCue.actualShotCount<=beforeShot.shotsFired||
     impactCue.sourceSolids!==25||impactCue.originalPaint!==17||
     impactCue.originalLinks!==26||impactCue.originalScoreable!==0||
     (impactCue.lastMode==='REAL_PAINT'&&
      !(impactCue.humanChangedImpactCount>0&&
        impactCue.lastImpactChangedCells>0)))
    fail('F3_REAL_NATIVE_PLAYER_SHOT_PAINT_CUE_NOT_OBSERVED');
  proof.nativePlayerShotPaintHud={
   ...impactCue,realMouseInput:true,
   paintIsNotCpuHpHit:true,notOfficialScoring:true,
   originalPhysicsAndTickWrites:0,
   appliedOnNormalSourceUrlWithoutB356Experiment:
    !query.includes('t21W10B356='),officialWinner:'NONE'};
  save();
  // B483: genuine real Chromium C key in the SAME B441 human game.
  // Observe pre-existing B471 original Recast/Rapier-approved A1 goal.
  const baselineOrder=shot.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
  if(!baselineOrder||baselineOrder.genuineKeyRequests!==0||
     shot.cpu.sourcePatrol.b137AllyRallyOptIn!==true||
     shot.cpu.sourcePatrol.b150AllySupportInkOptIn!==true)
   fail('B483_TRUE_SOURCE_A1_SUPPORT_NOT_ENABLED');
  await tapSourceCameraKey('c','KeyC',67);
  const realKey=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||
      n.cpu.physicalRejoins.length!==7||!await locked())
    fail('B483_ACTUAL_SOURCE_PLAYER_INTERRUPTED');
   const order=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return order?.genuineKeyRequests>baselineOrder.genuineKeyRequests?
    {n,order}:null;
  },15000,120);
  const realGoal=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.strictlyApprovedOriginalGoals>=1&&
     o?.actualNativeGoalRequests>=1?{n,o}:null;
  },25000,300);
  if(realGoal.o.officialWinner!=='NONE'||
     realGoal.o.actorInkScoreClockWrites!==0||
     realGoal.o.strictlyApprovedOriginalGoals<1||
     realGoal.o.actualNativeGoalRequests<1||
     realGoal.n.sourceScoreablePromotions!==0)
    fail('B483_FALSE_NATIVE_C_KEY_GOAL_CERTIFICATION');
  proof.b483RealPlayerCKeyNativeA1={
   actualChromeKeyC:true,genuineKeyRequests:realKey.order.genuineKeyRequests,
   firstActualNativeTick:realKey.n.tick,
   approvedGoals:realGoal.o.strictlyApprovedOriginalGoals,
   issuedTrueOriginalCrowdGoals:realGoal.o.actualNativeGoalRequests,
   originalAllyFoot:realGoal.o.approvedRealAllyFoot,
   actualSourceGoal:realGoal.o.approvedOriginalGoal,
   goalObservedNativeTick:realGoal.n.tick,
   originalArrivalAlreadyCertified:false,
   originalOpponentRoutesCertified:false,officialWinner:'NONE',
   actorInkScoreClockWrites:0,syntheticCombatWrites:0,
   distinctFromCoopMission:true};
  save();
  // B485: actual first native B471 ARRIVED must precede a second
  // physical player key. Never spam C or overwrite the moving Crowd.
  const firstArrival=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   if(n.paused||n.matchState!=='PLAYING'||
      n.cpu.physicalRejoins.length!==7||!await locked())
    fail('B485_ORIGINAL_PLAYER_INTERRUPTED_BEFORE_ARRIVAL');
   return o?.status==='ARRIVED'&&o.actualOriginalArrivals>=1&&
    o.b485RepeatReady===true?{n,o}:null;
  },60000,200);
  // Real CDP C key UP/DOWN with actual pointer-lock input, no synthetic
  // goal or tick injection. A1's previous B471 status is ARRIVED.
  await tapSourceCameraKey('c','KeyC',67);
  const secondKey=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   if(n.paused||n.matchState!=='PLAYING'||!await locked())
    fail('B485_SECOND_ORIGINAL_PLAYER_INTERRUPTED');
   return o?.genuineKeyRequests===2?{n,o}:null;
  },15000,150);
  // A second audited goal is a separate achievement; if none can pass,
  // retain the genuine HOLD instead of inventing a path or arrival.
  const secondDecision=await until(async()=>{
   const n=await snap();authority(n);
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.strictlyApprovedOriginalGoals>=2&&
    o.actualNativeGoalRequests>=2?{n,o,outcome:'SECOND_ORIGINAL_CROWD_GRANTED'}:
    o?.status==='HOLD'||o?.status==='EXPIRED'?
    {n,o,outcome:'SECOND_ORIGINAL_SAFETY_HOLD'}:null;
  },30000,250);
  if(secondDecision.n.sourceScoreablePromotions!==0||
     secondDecision.o.officialWinner!=='NONE'||
     secondDecision.o.actorInkScoreClockWrites!==0||
     secondKey.o.genuineKeyRequests!==2||
     firstArrival.o.actualOriginalArrivals<1)
    fail('B485_REPEATED_A1_ORDER_AUTHORITY_CORRUPTED');
  proof.b485TrueSecondPlayerA1Command={
   realChromeCKeyCount:2,actualFirstArrivalTick:firstArrival.n.tick,
   firstArrivalOriginalCounter:firstArrival.o.actualOriginalArrivals,
   secondCKeyTick:secondKey.n.tick,
   realNativeSecondOutcome:secondDecision.outcome,
   secondDecisionNativeTick:secondDecision.n.tick,
   actualB471KeyRequests:secondDecision.o.genuineKeyRequests,
   originalApprovedGoalCount:secondDecision.o.strictlyApprovedOriginalGoals,
   actualOriginalCrowdGoalRequests:secondDecision.o.actualNativeGoalRequests,
   secondOriginalGoal:secondDecision.outcome==='SECOND_ORIGINAL_CROWD_GRANTED'?
    secondDecision.o.approvedOriginalGoal:null,
   fakeEnemyHits:0,officialWinner:'NONE',originalCrossTeamCertified:false,
   actorInkPhysicsClockWrites:0
  };
  save();
  proof.b475ActualSourceUserCombat={
   ...proof.b475ActualSourceUserCombat,
   actualChromeMousePressed:true,actualRealSourceWeaponShotCount:
    shot.shotsFired-beforeShot.shotsFired,
   actualShotNativeTick:shot.tick,originalPlayerKccUnchanged:true,
   actualPhysicalCpuPatrol:true,syntheticCombatEvents:0,
   humanCpuHitsNotFabricated:true,
   sourceCpuHitsObservedNotRequired:shot.humanCpuDirectHits,
   officialWinner:'NONE'};
  save();
 }
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
  // B484: 60 Hz genuine post-C-key A1 physics, not a guessed route.
  const b484=await evaluate('window.__t21F3.b484ActualA1CKeyFollowThrough()');
  const b483=proof.b483RealPlayerCKeyNativeA1;
  if(!b484||b484.schema!=='B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1'||
     b484.source!=='25/17/26/0'||b484.nativeRows<100||
     b484.genuineKeyRequests!==2||b484.approvedOriginalGoals<1||
     b484.actualNativeGoalRequests<1||b484.officialWinner!=='NONE'||
     b484.actorInkPhysicsClockWrites!==0||
     b484.crossTeamRouteCertified!==false||
     b484.originalCapsuleRouteCertified!==false||
     b484.commandCausedAllMovementCertified!==false||
     b484.trueArrivalOnlyFromB471!==true||
     // Both C events are genuine; per-order progress must never inherit
     // the first order's near-zero distance on the second actual key.
     b484.currentOrderKeyRequest!==2||
     !Number.isSafeInteger(b484.currentOrderNativeRows)||
     b484.currentOrderNativeRows<1||
     b484.currentOrderNativeRows>=b484.nativeRows||
     b484.currentOrderArrivalOnlyFromOriginalB471!==true||
     !Array.isArray(b484.currentOrderFirstObservedFoot)||
     b484.currentOrderFirstObservedFoot.length!==3||
     !b484.currentOrderFirstObservedFoot.every(Number.isFinite)||
     !Number.isFinite(b484.currentOrderObservedFootTravelMeters)||
     b484.currentOrderObservedFootTravelMeters<0||
     (b484.currentOrderClosestPhysicalGoalDistanceXZ!==null&&
      (!Number.isFinite(b484.currentOrderClosestPhysicalGoalDistanceXZ)||
       b484.currentOrderClosestPhysicalGoalDistanceXZ<0))||
     (b484.currentOrderApprovedOriginalGoal!==null&&
      (!Array.isArray(b484.currentOrderApprovedOriginalGoal)||
       !b484.currentOrderApprovedOriginalGoal.every(Number.isFinite)))||
     !Array.isArray(b484.originalApprovedGoal)||
     !b484.originalApprovedGoal.every((v,i)=>
      Number.isFinite(v)&&Math.abs(v-
       (proof.b485TrueSecondPlayerA1Command.secondOriginalGoal||
        b483.actualSourceGoal)[i])<.001)||
     !Array.isArray(b484.rows)||b484.rows.length!==b484.nativeRows||
     !b484.rows.every((r,i)=>i===0||r.tick===b484.rows[i-1].tick+1))
    fail('B484_ORIGINAL_A1_NATIVE_FOLLOW_THROUGH_HOLD');
  writeFileSync(resolve(out,'b484-real-source-a1-foot-60hz.json'),
   JSON.stringify(b484,null,2)+'\n');
  proof.b484RealNativeA1CKeyFollowThrough={
   ...Object.fromEntries(Object.entries(b484).filter(([k])=>k!=='rows')),
   file:'b484-real-source-a1-foot-60hz.json',
   nativeActorPositionWrites:0,originalRouteAuthorizationChanged:false,
   officialWinner:'NONE'};
  save();
  // The PLAYER sees the same genuine second C-order progress in the
  // existing actual browser HUD. Do not dispatch synthetic DOM events or
  // claim a route/arrival from the UI text alone.
  const playerOrderHud=await until(async()=>evaluate(`(() => {
   const e=document.querySelector('#t21-f3-b141-real-ally');
   const n=window.__t21F3?.snapshot?.();
   const trace=window.__t21F3?.b484ActualA1CKeyFollowThrough?.();
   if(!e||!n||!trace)return null;
   return {nativeTick:n.tick,matchState:n.matchState,paused:n.paused,
    playerVisible:!e.hidden&&getComputedStyle(e).display!=='none',
    text:e.textContent,
    originalRouteClaim:e.dataset.t21B141CertifiedRoute,
    actualOriginalArrivals:e.dataset.t21B471ActualOriginalArrivals,
    genuineRequests:trace.genuineKeyRequests,
    currentOrderKeyRequest:trace.currentOrderKeyRequest,
    currentOrderClosestPhysicalGoalDistanceXZ:
     trace.currentOrderClosestPhysicalGoalDistanceXZ,
    nativeCpuRejoins:n.cpu?.physicalRejoins?.length,
    sourceScoreable:n.sourceScoreablePromotions};
  })()`),20000,250);
  if(playerOrderHud?.matchState!=='PLAYING'||
     playerOrderHud.paused!==false||
     playerOrderHud.playerVisible!==true||
     playerOrderHud.originalRouteClaim!=='false'||
     playerOrderHud.nativeCpuRejoins!==7||
     playerOrderHud.sourceScoreable!==0||
     playerOrderHud.genuineRequests!==2||
     playerOrderHud.currentOrderKeyRequest!==2||
     !playerOrderHud.text?.includes('A1 C ORDER 2 · ')||
     !playerOrderHud.text.includes('verified arrivals total ')||
     !(
      playerOrderHud.text.includes('this order closest ')||
      playerOrderHud.text.includes('original goal pending / HOLD')
     ))
   fail('B484_GENUINE_SECOND_C_ORDER_PLAYER_HUD_NOT_VERIFIED');
  proof.b484RealSecondOrderPlayerHud={
   ...playerOrderHud,
   genuineChromiumPlayerText:true,perOrderCounterFromNativePhysics:true,
   certifiedOfficialEnemyEngagement:false,
   certifiedOriginalCrossTeamPath:false,officialWinner:'NONE'};
  save();
  // B486 independent real 60Hz HUMAN and 3-vs-4 CPU proximity proof.
  // Distance is never shot contact, opponent native path or certified 4v4.
  const b486=await evaluate('window.__t21F3.b486ActualOriginalEnemyDistances()');
  if(!b486||
     b486.schema!=='B486_TRUE_ORIGINAL_NATIVE_60HZ_ENCOUNTER_DISTANCE_V1'||
     b486.source!=='25/17/26/0'||b486.rows<100||
     b486.scoreableOriginalSurfaces!==0||
     b486.officialWinner!=='NONE'||
     b486.noActorNavInkPhysicsClockWrites!==true||
     b486.naturalOpponentRouteCertified!==false||
     b486.actualEnemyHpDamageCertified!==false||
     b486.physicallyCloseIsNotAHit!==true||
     b486.physicallyCloseIsNotANativeRoute!==true||
     !Number.isFinite(b486.nearestHumanToEnemy3dMeters)||
     !Number.isFinite(b486.nearestAllyToEnemy3dMeters)||
     !Array.isArray(b486.rows60Hz)||
     b486.rows60Hz.length!==b486.rows||
     !b486.rows60Hz.every((row,i)=>i===0||
      row.tick===b486.rows60Hz[i-1].tick+1))
    fail('B486_ACTUAL_7CPU_SOURCE_PROXIMITY_EVIDENCE_HOLD');
  writeFileSync(resolve(out,'b486-original-human-7cpu-enemy-distance-60hz.json'),
   JSON.stringify(b486,null,2)+'\n');
  proof.b486TrueSourceNaturalEncounterDistance={
   ...Object.fromEntries(Object.entries(b486).filter(([key])=>
    key!=='rows60Hz')),
   raw:'b486-original-human-7cpu-enemy-distance-60hz.json',
   sourceMotionUntouched:true,enemyContactCertified:false,
   nativeRouteNotGranted:true,officialWinner:'NONE'};
  save();
  // B487: 26 original one-way same-side links cannot be promoted into
  // central access. Query current native Recast for each real 3x4 CPU
  // opposing pair PLUS original human foot to 4 opposing actors.
  const b487=await evaluate(
   'window.__t21F3.b487ActualOriginalCrossTeamTopology()');
  if(!b487||
     b487.schema!=='B487_TRUE_ORIGINAL_NATIVE_CROSS_TEAM_TOPOLOGY_V1'||
     b487.source!=='25/17/26/0'||
     b487.originalOneWayDropLinks!==26||
     b487.originalFirstDropLinks!==12||
     b487.originalRightSmallDropLinks!==14||
     b487.originalExplicitCrossSideLinks!==0||
     b487.totalOriginalNativePathQueries!==16||
     b487.liveOriginalCpuOpposingPairs!==12||
     b487.liveHumanOpponentPairs!==4||
     b487.naturalCrossTeamPathCertified!==false||
     b487.physicalCapsuleRouteCertified!==false||
     b487.full4v4Certified!==false||
     b487.sourceGeometryOrNavMutations!==0||
     b487.botGoalOrActorWrites!==0||
     b487.inkHitScoreOrClockWrites!==0||
     b487.officialWinner!=='NONE'||
     !Array.isArray(b487.pairs)||b487.pairs.length!==16||
     !b487.pairs.every(x=>x.physicalCapsuleRouteCertified===false)||
     Math.abs(b487.nearestHumanEnemy3dMeters-
       b486.nearestHumanToEnemy3dMeters)>.001||
     Math.abs(b487.nearestAllyEnemy3dMeters-
       b486.nearestAllyToEnemy3dMeters)>.001)
   fail('B487_ORIGINAL_CENTRAL_NATIVE_CONNECTIVITY_NOT_GROUNDED');
  writeFileSync(resolve(out,'b487-real-original-16-cross-team-route-audit.json'),
   JSON.stringify(b487,null,2)+'\n');
  proof.b487OriginalCrossTeamTopology={
   ...Object.fromEntries(Object.entries(b487).filter(
    ([key])=>key!=='pairs')),
   fullEvidenceFile:'b487-real-original-16-cross-team-route-audit.json',
   nativeActorKccOrNavChanged:false,officialWinner:'NONE'};
  save();
  // B488: evidence gate applied to the SAME actual 7-CPU native SOURCE
  // as B486/B487. The archived four local gaps on each side have no
  // individual 7.2.0 Turf collision authority. This is NOT a route grant.
  const b488=await evaluate(
   'window.__t21F3.b488OriginalCrossTeamGapDecision()');
  if(!b488||
     b488.schema!=='B488_ORIGINAL_CROSS_TEAM_GAP_AUTHORITY_DECISION_V1'||
     b488.originalSource!=='25/17/26/0'||
     !Number.isSafeInteger(b488.observedNativeTick)||
     b488.observedNativeTick<b487.nativeTick||
     b488.currentNativeOpposingQueries!==16||
     b488.currentNativeReportedPaths!==b487.nativePathReportedPairs||
     b488.currentNativeCredibleEndpointPairs!==
       b487.nativeCredibleEndpointPairs||
     Math.abs(b488.nearestHumanEnemy3dMeters-
       b486.nearestHumanToEnemy3dMeters)>.001||
     Math.abs(b488.nearestAllyEnemy3dMeters-
       b486.nearestAllyToEnemy3dMeters)>.001||
     b488.archivedAuditCompatible!==true||
     b488.archivedUnresolvedLocalGaps!==8||
     b488.archivedUnresolvedGapsPerSide!==4||
     b488.individuallyProvenOriginalGapCollisionFaces!==0||
     b488.candidateRuntimeStagePromotionAuthorized!==false||
     b488.sourceCollisionFlagFor7_2TurfVerified!==false||
     b488.originalCpuCapsuleContinuousTraversalVerified!==false||
     b488.originalFull4v4Certified!==false||
     b488.officialScoreable!==0||
     b488.officialWinner!=='NONE'||
     b488.actorPhysicsNavMeshInkClockScoreWrites!==0||
     !Array.isArray(b488.nextRequiredEvidence)||
     b488.nextRequiredEvidence.length!==4||
     b488.verdict!=='HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING')
   fail('B488_REAL_NATIVE_GAP_SOURCE_AUTHORITY_PROOF_HOLD');
  writeFileSync(resolve(out,'b488-real-original-f4-gap-authority-hold.json'),
   JSON.stringify(b488,null,2)+'\n');
  proof.b488OriginalCentralGapAuthority={
   ...b488,raw:'b488-real-original-f4-gap-authority-hold.json',
   actualBrowserSource:true,collisionAndNavigationWrites:0,
   certifiedNativeEnemyCrossing:false,officialWinner:'NONE'};
  save();
  // B474: require measured original native Crowd requests AND bounded
  // duplicate suppression in THIS true 720-tick browser, not a pure test.
  // This is research behavior only; no original route or hit promotion.
  const steering=actual.b474NativeSteeringEvidence;
  if(!steering||steering.enabled!==true||
     !Number.isSafeInteger(steering.nativeRequestIssued)||
     steering.nativeRequestIssued<1||
     !Number.isSafeInteger(steering.redundantUnchangedRequestsSuppressed)||
     steering.redundantUnchangedRequestsSuppressed<1||
     steering.noExtraNavOrGameplayAuthority!==true||
     steering.sourceOnly!==true||steering.productionAuthorized!==false)
    fail('B474_NATIVE_SOURCE_DUPLICATE_REQUEST_REDUCTION_UNPROVEN');
  proof.b441NativeEvidence.b474TrueNativeCrowdGoalRefresh={...steering,
   actualNativeTick:actual.tick,
   originalCollisionAuthorizationChanged:false,
   scoreableSurfacePromotions:0};
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
   b467RealB2B4LateNativeFootGoalEvidence:
    afterPatrol?.b467RealLateFoot,
   // B470: serialize live gameplay patrol facts, not synthetic targets.
   // These are ownerGrid-ranked, real native reauthorizations only.
   b470RealSameSideInkCoverage:
    afterPatrol?.b470NativeLocalCoverage,
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
 if(proveSourcePracticeExpiry){
  // Same genuinely clicked 180-second Chromium round, AFTER the genuine
  // original 720+ tick proof. No clock/actor/paint/DOM injection.
  // The independent 60s objective must naturally TIME_UP at native 60Hz.
  proof.stage='WAITING_REAL_60S_PRACTICE_EXPIRY';save();
  const expiry=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.cpu.physicalRejoins.length!==7||n.player.hp<=0)
    fail('EXPIRY_OBSERVATION_REAL_MATCH_INTERRUPTED');
   const mission=n.b25SourcePaintRun;
   if(mission?.practiceVariant!=='CLASSIC'||
      !['RUNNING','TIME_UP'].includes(mission.status))
    fail('EXPIRY_NOT_REAL_UNFINISHED_CLASSIC');
   if(n.tick>=10500)
    fail('EXPIRY_NO_60S_IN_NATIVE_MATCH');
   return mission.status==='TIME_UP'&&n.timeRemainingSeconds>0&&
      trueOriginalFoot(foot(n))?n:null;
  },720000,800);
  const originalOrder=expiry.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
  if(originalOrder?.genuineKeyRequests!==2||
     expiry.b25SourcePaintRun.elapsedTicks<3600||
     expiry.timeRemainingSeconds<=0||expiry.matchState!=='PLAYING')
   fail('EXPIRY_NOT_SEPARATE_FROM_180S_ROUND');
  const ready=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.b25SourcePaintRun?.status!=='TIME_UP'||
      n.paused||!await locked()||n.player.hp<=0||
      n.cpu.physicalRejoins.length!==7)
    fail('EXPIRY_C_INPUT_AUTHORITY_INTERRUPTED');
   const o=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   return o?.genuineKeyRequests===2&&o.b485RepeatReady===true&&
    trueOriginalFoot(foot(n))?n:null;
  },30000,250);
  const beforeTick=ready.tick;
  const screenshot=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof screenshot?.data!=='string'||screenshot.data.length<100)
   fail('EXPIRY_REAL_SOURCE_SCREENSHOT_MISSING');
  writeFileSync(resolve(out,'real-practice-60s-timeout-180s-active.png'),
   Buffer.from(screenshot.data,'base64'));
  // Actual pointer-locked Chromium C key, never a test API callback.
  await tapSourceCameraKey('c','KeyC',67);
  const after=await until(async()=>{
   const n=await snap();authority(n);
   if(n.matchState!=='PLAYING'||n.paused||!await locked()||
      n.b25SourcePaintRun?.status!=='TIME_UP'||
      n.cpu.physicalRejoins.length!==7)
    fail('EXPIRY_POST_C_REAL_MATCH_INTERRUPTED');
   const order=n.cpu.sourcePatrol.b471TruePlayerOrderedAlly;
   const acceptance=await evaluate(
    "document.querySelector('#app-canvas')?.dataset.t21B485RealCKeyResult");
   return order?.genuineKeyRequests===3&&
    acceptance==='REAL_ORDER_PENDING_ORIGINAL_RECAST'?
    {n,order,acceptance}:null;
  },15000,180);
  const observable=await until(async()=>{
   const v=await evaluate(`(() => {
   const n=window.__t21F3?.snapshot?.();
   const t=window.__t21F3?.b484ActualA1CKeyFollowThrough?.();
   const h=document.querySelector('#t21-f3-b141-real-ally');
   if(!n||!t||!h)return null;
   return {tick:n.tick,matchState:n.matchState,
    missionStatus:n.b25SourcePaintRun?.status,
    missionElapsed:n.b25SourcePaintRun?.elapsedTicks,
    remainingSeconds:n.timeRemainingSeconds,
    sourceScoreable:n.sourceScoreablePromotions,
    nativeCpuRejoins:n.cpu?.physicalRejoins?.length,
    acceptedOriginalGoals:n.cpu?.sourcePatrol?.
      b471TruePlayerOrderedAlly?.strictlyApprovedOriginalGoals,
    requestCount:n.cpu?.sourcePatrol?.
      b471TruePlayerOrderedAlly?.genuineKeyRequests,
    traceOrder:t.currentOrderKeyRequest,
    traceRows:t.currentOrderNativeRows,
    traceNativeRequests:t.actualNativeGoalRequests,
    traceArrivalOnlyOriginal:t.currentOrderArrivalOnlyFromOriginalB471,
    traceClockWrites:t.actorInkPhysicsClockWrites,
    text:h.textContent,
    visible:!h.hidden&&getComputedStyle(h).display!=='none',
    certifiedRoute:h.dataset.t21B141CertifiedRoute};
  })()`);
   // The app updates the native trace on the following genuine fixed tick.
   // A non-null snapshot is not yet proof that the displayed C order is 3.
   return v?.tick>beforeTick&&v.traceOrder===3&&v.traceRows>=1&&
    v.text?.includes('A1 C ORDER 3 · ')&&
    v.text?.includes(
     '60s PRACTICE TIME UP · 180s SOURCE MATCH CONTINUES')?v:null;
  },15000,250);
  if(!observable||observable.tick<=beforeTick||
     observable.matchState!=='PLAYING'||
     observable.missionStatus!=='TIME_UP'||
     observable.missionElapsed<3600||
     observable.remainingSeconds<=0||
     observable.sourceScoreable!==0||
     observable.nativeCpuRejoins!==7||
     observable.requestCount!==3||
     observable.traceOrder!==3||observable.traceRows<1||
     observable.traceArrivalOnlyOriginal!==true||
     observable.traceClockWrites!==0||
     observable.visible!==true||
     observable.certifiedRoute!=='false'||
     !observable.text?.includes('A1 C ORDER 3 · ')||
     !observable.text.includes(
      '60s PRACTICE TIME UP · 180s SOURCE MATCH CONTINUES'))
   fail('EXPIRY_GENUINE_C_THIRD_ORDER_PLAYER_HUD_NOT_PROVEN');
  proof.realPracticeExpiryLiveC={
   source:'25/17/26/0',sameBrowserOrigin:await origin(),
   naturalObjectiveStatus:expiry.b25SourcePaintRun.status,
   realObjectiveElapsedNativeTicks:expiry.b25SourcePaintRun.elapsedTicks,
   originalPlayerRemainingSecondsAtExpiry:expiry.timeRemainingSeconds,
   realNativeTickBefore:beforeTick,
   realNativeTickAfter:observable.tick,
   thirdGenuineChromiumCKey:true,
   acceptedExistingB471NativeRequest:after.acceptance,
   ...observable,sourceCollisionWrites:0,sourceNavigationWrites:0,
   actorWrites:0,syntheticClockAdvances:0,officialWinner:'NONE',
   opponentNativeCrossingCertified:false,officialTurfScoreCertified:false,
   full180SecondRoundCompletedCertified:false};
  writeFileSync(resolve(out,'real-60s-expiry-third-c-original-180s.json'),
   JSON.stringify(proof.realPracticeExpiryLiveC,null,2)+'\n');
  save();
 }
 if(proveFullSourceReplay){
  // Read-only 180-second native clock, SAME original 7 CPU SOURCE world.
  // No virtual-time tricks, position/tick/actor/ink/score writes, or warps.
  const first=await snap();authority(first);
  const initialOrigin=await origin();
  const initialHref=await evaluate('location.href');
  const weapon=first.b361NativePlayerWeapon?.id;
  const preflightChecks={
   REAL_PLAYING:first.matchState==='PLAYING',
   REAL_UNPAUSED:!first.paused,
   REAL_POINTER_LOCKED:await locked(),
   REAL_7_CPU:first.cpu.physicalRejoins.length===7,
   NO_CPU_RELOCATIONS:first.cpu.physicalFootRelocations===0,
   NATIVE_180_SECOND_CLOCK:first.timeRemainingSeconds<180&&
    first.timeRemainingSeconds>0,
   SAME_SELECTED_HUMAN_KIT:weapon===fullReplayHumanKit,
   EXACT_SELECTED_NATIVE_URL:new URL(initialHref).searchParams.get(
    't21W10B389')===fullReplayHumanKit
  };
  proof.oneShotFullReplayPreflight={
   checks:preflightChecks,observed:{
    source:'25/17/26/0',nativeTick:first.tick,
    remaining:first.timeRemainingSeconds,phase:first.matchState,
    paused:first.paused,cpuRejoins:first.cpu.physicalRejoins.length,
    cpuPhysicalRelocations:first.cpu.physicalFootRelocations,
    realHumanWeapon:weapon,currentUrl:initialHref,
    currentWorldOrigin:initialOrigin
   },actorWrites:0,nativeClockWrites:0,scoreWrites:0
  };
  save();
  const missing=Object.entries(preflightChecks).filter(([,ok])=>!ok)
   .map(([name])=>name);
  if(missing.length)
   fail('FULL_REAL_NATIVE_FIRST_ROUND_PRECONDITION_'+missing.join('_'));
  const full={schema:'T21_ONE_SHOT_REAL_SOURCE_180_REPLAY_V1',
   source:'25/17/26/0',initialOrigin,initialHref,weapon,
   initialTick:first.tick,initialRemaining:first.timeRemainingSeconds,
   nativeClockWrites:0,actorWrites:0,scoreWrites:0,syntheticInput:false,
   officialWinner:'NONE',samples:[],clicked:false,newWorldConfirmed:false};
  proof.oneShotFullReplay=full;
  proof.stage='WAIT_REAL_180_NATIVE_TIME_UP';save();
  let previousTick=first.tick;
  for(const [threshold,label] of [[120,'120'],[60,'60'],[0,'TIME_UP']]){
   let last=null;
   const frame=await until(async()=>{
    const n=await snap();authority(n);
    last={tick:n.tick,remaining:n.timeRemainingSeconds,
     phase:n.matchState,paused:n.paused,
     cpuRejoined:n.cpu.physicalRejoins.length,
     shots:n.shotsFired};
    if(n.tick<previousTick||n.cpu.physicalRejoins.length!==7||
       n.cpu.physicalFootRelocations!==0||
       n.timeRemainingSeconds<0||n.timeRemainingSeconds>180)
     fail('FULL_REAL_NATIVE_SOURCE_TICK_OR_CPU_INVARIANT');
    previousTick=n.tick;
    if(n.timeRemainingSeconds>threshold+.001)return null;
    if(n.matchState!==(threshold===0?'TIME_UP':'PLAYING')||
       (threshold!==0&&n.paused))
     fail('FULL_REAL_NATIVE_CLOCK_PHASE_'+label);
    return n;
   },22*60*1000,1400).catch(error=>{
    full.lastNative=last;full.hold=String(error);save();throw error;
   });
   full.samples.push({label,tick:frame.tick,
    remaining:frame.timeRemainingSeconds,phase:frame.matchState,
    shots:frame.shotsFired,cpuRejoined:frame.cpu.physicalRejoins.length,
    cpuPaint:frame.cpuInkCellsChanged,
    humanPaint:frame.b23HumanInkFeedback?.humanChangedCells??null});
   save();
  }
  const terminal=await snap();authority(terminal);
  full.actualCountdownNativeTicks=
   Math.round((180-first.timeRemainingSeconds)*60)+
   terminal.tick-first.tick;
  if(terminal.matchState!=='TIME_UP'||
     terminal.timeRemainingSeconds!==0||
     full.actualCountdownNativeTicks<10800||
     terminal.cpu.physicalRejoins.length!==7||
     terminal.b361NativePlayerWeapon?.id!==weapon)
   fail('FULL_REAL_TIME_UP_AND_10800_NATIVE_TICKS_NOT_PROVEN');
  proof.stage='REAL_180_TIME_UP_VISIBLE_REPLAY_PENDING';save();
  const visible=await until(async()=>{
   const v=await evaluate(`(() => {
    const modal=document.querySelector('#t21-f3-b59-session-finished');
    const b=document.querySelector('#t21-f3-b59-restart');
    if(!modal||!b)return null;
    const box=b.getBoundingClientRect(),cx=box.left+box.width/2,
     cy=box.top+box.height/2;
    const target=document.elementFromPoint(cx,cy);
    return {modal:!modal.hidden&&getComputedStyle(modal).display!=='none',
     state:modal.dataset.t21B59State,
     button:!b.hidden&&!b.disabled&&getComputedStyle(b).display!=='none',
     hit:target===b||b.contains(target),
     onScreen:box.width>0&&box.height>0&&box.top>=0&&
      box.bottom<=innerHeight,
     mouseUnlocked:document.pointerLockElement===null,
     officialWinner:modal.dataset.t21B59OriginalWinner,
     scoreable:modal.dataset.originalScoreable};
   })()`);
   return v?.modal&&v.state==='FINISHED'&&v.button&&v.hit&&
    v.onScreen&&v.mouseUnlocked&&v.officialWinner==='NONE'&&
    v.scoreable==='0'?v:null;
  },45000,280);
  full.realEndScreen=visible;save();
  const beforeImage=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof beforeImage?.data!=='string'||beforeImage.data.length<100)
   fail('FULL_REAL_180_SCREENSHOT_UNAVAILABLE');
  writeFileSync(resolve(out,'real-180s-time-up-visible-replay.png'),
   Buffer.from(beforeImage.data,'base64'));
  await buttonClick('#t21-f3-b59-restart');
  full.clicked=true;proof.stage='CLICKED_REAL_B59_REPLAY';save();
  let lastPage=null;
  const fresh=await until(async()=>{
   try{
    const v=await evaluate(`(() => {
     const n=window.__t21F3?.snapshot?.();
     return {origin:performance.timeOrigin,href:location.href,
      ready:document.querySelector('#app-canvas')?.dataset.t21F3Ready,
      n:n?{tick:n.tick,phase:n.matchState,
       seconds:n.timeRemainingSeconds,shots:n.shotsFired,
       cpu:n.cpu.cpu.length,joins:n.cpu.physicalRejoins.length,
       kit:n.b361NativePlayerWeapon?.id,
       solids:n.originalSourceSolids,paint:n.originalPaintSurfaces,
       links:n.originalSourceNavigationLinks,
       scoreable:n.sourceScoreablePromotions}:null};
    })()`);
    lastPage=v;
    return v?.origin>initialOrigin&&v.href===initialHref&&
     v.ready==='READY'&&v.n?.tick===0&&
     v.n?.phase==='STAGING'&&v.n?.seconds===180&&
     v.n?.shots===0&&v.n?.cpu===7&&v.n?.joins===0&&
     v.n?.kit===weapon&&v.n?.solids===25&&v.n?.paint===17&&
     v.n?.links===26&&v.n?.scoreable===0?v:null;
   }catch{return null;}
  },150000,500).catch(error=>{
   full.lastReloadProbe=lastPage;full.hold=String(error);save();
   throw error;
  });
  full.secondWorld=fresh;full.newWorldConfirmed=true;
  proof.full180sCertified=true;proof.genuineReplayClickCertified=true;
  proof.testKind='FULL_REAL_180S_FRESH_SOURCE_WORLD_SAME_WEAPON';
  proof.stage='REAL_180_NATIVE_NEW_WORLD_SAME_WEAPON_CERTIFIED';save();
  const afterImage=await cdp('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false});
  if(typeof afterImage?.data!=='string'||afterImage.data.length<100)
   fail('FULL_REAL_REPLAY_NEW_WORLD_SCREENSHOT_UNAVAILABLE');
  writeFileSync(resolve(out,'real-replay-fresh-world-same-weapon.png'),
   Buffer.from(afterImage.data,'base64'));
 }
 proof.verdict=proveFullSourceReplay?
  'PASS_REAL_NATIVE_180S_TIME_UP_REPLAY_NEW_WORLD_SAME_HUMAN_WEAPON':
  b441Experiment?
  'PASS_FRESH_SOURCE_HUMAN_AND_ACTUAL_CPU_FRONT_GOAL_NOT_CROSSING':
  'PASS_FRESH_SOURCE_REAL_HUMAN_KEYW_AND_ORIGINAL_FOOT_NOT_REPLAY';
 if(!proveFullSourceReplay)proof.stage='TRUE_NATIVE_WALK_SUCCESS';
 save();
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

