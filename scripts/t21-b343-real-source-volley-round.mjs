#!/usr/bin/env node
/** B335: REAL pointer-locked browser, actual 180s clock, 1 human + 7 CPUs.
 * No QA clock advancement, actor relocation, artificial ink or fabricated winner. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {b337AuditNative} from './t21-b337-real-input-ink-audit.mjs';
const ROOT='http://127.0.0.1:4195/browser-ink-tps/';
const DIR=process.env.T21_B343_OUTPUT||'/tmp/t21-b343';
const children=[],calls=new Map();
let socket=null,seq=0,clockStart=0;
const fail=reason=>{throw Error('B343_TRUE_CHROMIUM_'+reason);};
async function wait(fn,limit=100000){
 const until=Date.now()+limit;
 while(Date.now()<until){const n=await fn();if(n)return n;await sleep(400);}
 fail('WAIT_EXPIRED_'+limit);
}
async function send(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{calls.delete(id);reject(Error('CDP_TIMEOUT_'+method));},30000);
  calls.set(id,{yes:v=>{clearTimeout(timeout);resolve(v);},
   no:e=>{clearTimeout(timeout);reject(e);}});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function read(expression){
 const response=await send('Runtime.evaluate',{
  expression,returnByValue:true,awaitPromise:true});
 if(response.exceptionDetails)fail('PAGE_EXCEPTION_'+JSON.stringify(response.exceptionDetails));
 return response.result?.value;
}
const snapshot=()=>read('window.__t21F3.snapshot()');
const buttonScript=selector=>'(() => {const el=document.querySelector('+
 JSON.stringify(selector)+');if(!el||el.hidden||el.disabled)return null;'+
 'el.scrollIntoView({block:"center",behavior:"instant"});'+
 'const r=el.getBoundingClientRect();return {x:r.left+r.width/2,'+
 'y:r.top+r.height/2,width:r.width,height:r.height};})()';
async function clickButton(selector){
 const xy=await read(buttonScript(selector));
 if(!xy||xy.width<4||xy.height<4||xy.x<0||xy.y<0||xy.x>=1600||xy.y>=900)
  fail('REAL_VISIBLE_BUTTON_MISSING_'+selector);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:xy.x,y:xy.y,button:'none'});
 for(const type of ['mousePressed','mouseReleased'])
  await send('Input.dispatchMouseEvent',{type,x:xy.x,y:xy.y,
   button:'left',clickCount:1});
}
async function picture(name){
 const response=await send('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true});
 const data=Buffer.from(response.data,'base64');
 if(data.length<20000||data.readUInt32BE(16)!==1600||data.readUInt32BE(20)!==900)
  fail('Genuine_Framebuffer_Missing_'+name);
 writeFileSync(resolve(DIR,name+'.png'),data);
}
function verifyAuthority(n){
 if(!n||n.stopReason||n.originalSourceSolids!==25||
  n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
  n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
  n.unrestricted4v4Certified!==false||
  n.turfResult!=='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'||
  n.cpu?.physicalFootRelocations!==0||
  !Array.isArray(n.cpu.cpu)||n.cpu.cpu.length!==7)
  fail('LIVE_STAGE_AUTHORITY_CHANGED');
 return n;
}
const proof={
 schema:'B337_REAL_CHROMIUM_NATIVE_SOURCE_INPUT_INK',source:'25/17/26/0',
 realFullRound:true,nativeCdpInput:true,
 injectedTicks:false,injectedInk:false,injectedActorPositions:false,
 officialWinner:'NONE',actions:[],samples:[]
};
function store(){
 writeFileSync(resolve(DIR,'b337-real-input-ink.json'),JSON.stringify(proof,null,2)+'\n');
}
async function run(){
 mkdirSync(DIR,{recursive:true});store();
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium']
   .find(s=>{try{execFileSync('which',[s],{stdio:'ignore'});return true;}
   catch{return false;}});
 if(!chrome)fail('CHROMIUM_REQUIRED');
 children.push(spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4195','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'}));
 await wait(async()=>{try{return (await fetch(ROOT)).ok;}catch{return false;}},30000);
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--enable-unsafe-swiftshader',
  '--use-angle=swiftshader','--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9273','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-b343-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await wait(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{return (await (await fetch('http://127.0.0.1:9273/json')).json())
   .find(p=>p.type==='page'&&p.webSocketDebuggerUrl);}catch{return null;}
 });
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((yes,no)=>{
  socket.addEventListener('open',yes,{once:true});
  socket.addEventListener('error',no,{once:true});
 });
 socket.addEventListener('message',event=>{
  const r=JSON.parse(String(event.data)),q=calls.get(r.id);
  if(!q)return;calls.delete(r.id);
  r.error?q.no(Error(JSON.stringify(r.error))):q.yes(r.result||{});
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 // Begin from the actual player's SOURCE page, not a preconfigured QA URL.
 await send('Page.navigate',{url:ROOT+
  '?t21Play=preview&t21QaDrive=source'});
 const ready=()=>wait(async()=>{
  try{return await read('document.querySelector("#app-canvas")?.dataset.t21F3Ready==="READY"'+
   '&&document.querySelector("#app-canvas")?.dataset.t21F3Renderer==="webgl2"');}
  catch{return false;}
 },110000);
 await ready();
 const baseline=await read(`(() => ({
  path:location.pathname,search:location.search,
  button:document.querySelector("#t21-f3-source-shooter-practice")?.textContent,
  mode:document.querySelector("#app-canvas")?.dataset.t21B203FullRound
 }))()`);
 if(baseline?.search!=='?t21Play=preview&t21QaDrive=source'||
    (!baseline.button?.includes('REAL SHOOTER + CPU7')||
     !baseline.button.includes('ORIGINAL DROP / RAMP / INK'))||
    baseline.mode!=='OFF')
  fail('PLAYER_SOURCE_ENTRY_NOT_READY_'+JSON.stringify(baseline));
 // Real CDP mouse click on the user-facing launcher. This creates a
 // fresh native stage and DOES NOT smuggle research flags into the round.
 await clickButton('#t21-f3-source-shooter-practice');
 const selectedSearch='?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B192=humanCombat&'+
  't21W10B112=humanGround&'+
  't21W10B203=fullRound&t21W10B343=sourceVolleyAtomic&'+
  't21W10B345=sourceShooterOpening&'+
  't21W10B346=nativeShooterPhysicsWitness&'+
  't21W10B348=sourceShooterAccuracyCandidate&'+
  't21W10B351=realCpuHitCue&'+
  't21W10B367=realCpuLifecycle&'+
  't21W10B368=physicalEnemyFrontier&'+
  't21W10B355=realInkHud&t21W10B356=realImpactReticle';
 await wait(async()=>{try{return await read('location.search')===selectedSearch;}catch{return false;}},45000);
 await ready();
 // Player-selected source shooter world; no fabricated clock/actor/stage.
 const mode=await wait(async()=>{
  const x=await read('(() => ({ready:document.querySelector("#app-canvas")?.dataset.t21F3Ready,'+
   'full:document.querySelector("#app-canvas")?.dataset.t21B203FullRound,'+
   'search:location.search}))()');
  return x?.ready==='READY'&&x?.full==='REAL_180S_SOURCE_PLAY'?x:false;
 },120000);
 if(mode.search!==selectedSearch)
   fail('EXPLICIT_PLAYER_SELECTED_SOURCE_URL_IDENTITY');
 const boot=verifyAuthority(await snapshot());
 const originalCircuit=boot.b186RealOriginalHumanCircuit;
 const actualDrop=boot.b183OriginalHumanDescent;
 if(originalCircuit?.enabled!==true||
    originalCircuit.sourceLocalPlayClear!==false||
    originalCircuit.actualOriginalRaisedFootColliderId!==null||
    originalCircuit.naturalCrossTeamRouteProven!==false||
    originalCircuit.actualOpponentCombatCertified!==false||
    originalCircuit.sourceScoreablePromotions!==0||
    actualDrop?.enabled!==true||
    actualDrop.originalFirstDropLocalPracticeClear!==false)
  fail('B365_ORIGINAL_SOURCE_CIRCUIT_NOT_PLAYER_ARMED_'+
   JSON.stringify({actualDrop,originalCircuit}));
 const realCpuLifecycle=boot.b367RealCpuLifecycleEvidence;
 if(realCpuLifecycle?.enabled!==true||
    realCpuLifecycle.physicalHumanCpuHpHits!==0||
    realCpuLifecycle.events?.length!==0||
    realCpuLifecycle.syntheticHits!==0||
    realCpuLifecycle.actorRelocations!==0||
    realCpuLifecycle.opponentRoutesCertified!==false||
    realCpuLifecycle.scoreable!==0)
  fail('B367_TRUE_PHYSICAL_DAMAGE_LEDGER_NOT_EMPTY_AT_BOOT_'+
   JSON.stringify(realCpuLifecycle));
 const combatUi=await read('(() => ({source:document.querySelector("#app-canvas")?.dataset.t21B192HumanCombat,'+
  'roster:!!document.querySelector("#t21-f3-b211-real-battle-roster"),'+
  'score:document.querySelector("#t21-f3-b211-real-battle-roster")?.dataset.scoreable,'+
  'routes:document.querySelector("#t21-f3-b211-real-battle-roster")?.dataset.certifiedEnemyRoutes}))()');
 if(combatUi?.source!=='REAL_SOURCE_ONLY'||!combatUi.roster||
    combatUi.score!=='0'||combatUi.routes!=='0')
  fail('REAL_CPU_COMBAT_NOT_SOURCE_GROUNDED_'+JSON.stringify(combatUi));
 // B363: genuine source-only shooter physical angular model.
 // Opening cadence, actual physical launches and true HP hit feedback
 // are carried by existing implementations, not a fake target.
 const fidelity={opening:boot.b345SourceShooterOpening,
  physical:boot.b346NativeShooterWitness,
  accuracy:boot.b348SourceShooterAccuracy,
  hitCue:boot.b351ActualHitCue};
 if(fidelity.opening?.enabled!==true||
    fidelity.physical?.enabled!==true||
    fidelity.physical.totalActualShooterLaunches!==0||
    fidelity.accuracy?.enabled!==true||
    fidelity.accuracy.actualAcceptedCandidateShots!==0||
    fidelity.hitCue?.enabled!==true||
    fidelity.hitCue.realDamageCues!==0||
    fidelity.hitCue.syntheticHits!==0)
  fail('B363_NATIVE_SHOOTER_GUARDS_NOT_ARMED_'+JSON.stringify(fidelity));
 if(boot.b343OriginalSourceVolleyBudget?.enabled!==true||
    boot.b343OriginalSourceVolleyBudget?.physicalPoolSize!==128||
    boot.b343OriginalSourceVolleyBudget?.syntheticShots!==0||
    boot.b343OriginalSourceVolleyBudget?.syntheticInk!==0)
   fail('B343_SOURCE_VOLLEY_NOT_READY');
 if(boot.matchState!=='STAGING'||!boot.paused||
  boot.timeRemainingSeconds!==180||boot.tick!==0||
  await read('document.querySelector("#t21-f3-b202-real-pause")?.dataset.t21B202NativeState')!=='READY_TO_START')
  fail('REAL_USER_180S_READY_NOT_PROVEN');
 await clickButton('#t21-f3-b202-resume');
 await wait(()=>read('document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 const start=await wait(async()=>{
  const n=verifyAuthority(await snapshot());
  return n.matchState==='PLAYING'&&!n.paused&&
   n.cpu.physicalRejoins.length===7?n:false;
 },12*60*1000);
 // Parameter permits READ-ONLY original paint/foot ledger, not QA authority.
 await read('(() => {const u=new URL(location.href);'+
  'u.searchParams.set("t21B312","genuineSecondHumanPaint");'+
  'history.replaceState(null,"",u.href);return true;})()');

 clockStart=Date.now();
 const sample=async label=>{
  const n=verifyAuthority(await snapshot());
  const ledger=await read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  if(!ledger||ledger.source!=='25/17/26/0'||ledger.originalRows?.length!==17)
   fail('B312_REAL_ORIGINAL_LEDGER_MISSING_'+label);
  const yaw=n.cameraSourcePractice?.yawDegrees;
  if(typeof yaw!=='number'||!Number.isFinite(yaw))
   fail('CAMERA_NATIVE_YAW_UNAVAILABLE_'+label);
  const s={label,source:'25/17/26/0',tick:n.tick,
   remainingSeconds:n.timeRemainingSeconds,matchState:n.matchState,
   paused:n.paused,stopReason:n.stopReason,
   body:n.player.position,cameraYawDegrees:yaw,
   originalSolids:n.originalSourceSolids,
   originalPaint:n.originalPaintSurfaces,
   originalNavLinks:n.originalSourceNavigationLinks,
   scoreable:n.sourceScoreablePromotions,
   productionAuthorized:n.productionAuthorized,
   unrestricted4v4Certified:n.unrestricted4v4Certified,
   turfResult:n.turfResult,
   cpuCount:n.cpu.cpu.length,cpuRejoined:n.cpu.physicalRejoins.length,
   cpuRelocations:n.cpu.physicalFootRelocations,
   // B339: read only genuine seven-actor SOURCE weapon/owner counters.
   b339CpuSnapshot:{
    source:'25/17/26/0',
    acceptedCpuSourceShots:n.cpuSourceTurfShots,
    actualCpuImpactChangedCells:n.cpuImpactInkCellsChanged,
    cpuShotsByActor:n.cpuSourceTurfShotsByActor,
    sourceInk:n.b154NativeSevenCpuInk
   },
   humanShots:n.shotsFired,
   humanInk:n.b23HumanInkFeedback.humanChangedCells,
   lastHumanImpactTick:ledger.humanLastImpactTick,
   lastHumanPaintedSurface:ledger.humanLastPaintedSurface,
   footSolid:ledger.genuineHumanOriginalFootSolid,
   footGap:ledger.genuineOriginalFootGapMeters,
   footSupported:ledger.realHumanOriginalFootSupported,
   originalRows:ledger.originalRows.map(r=>({surfaceId:r.surfaceId,
    a:r.originalOwnedA,b:r.originalOwnedB,neutral:r.originalNeutral,
    active:r.activeOriginalCells}))};
  proof.samples.push(s);store();
  console.log('B337_ACTUAL_NATIVE_CHECKPOINT',JSON.stringify({
   label:s.label,tick:s.tick,body:s.body,foot:s.footSolid,
   supported:s.footSupported,cpu:s.cpuRejoined,shots:s.humanShots,
   ink:s.humanInk,yaw:s.cameraYawDegrees}));
  return s;
 };
 const started=await sample('START');
 // B368: physically read the real 7-CPU roster, not an invented target.
 // Native CPU foot coordinates and native human body alone decide distances.
 const b368PhysicalRead=(name,n)=>{
  const enemies=n.cpu.cpu.filter(c=>
   ['B1','B2','B3','B4'].includes(c.id)&&
   c.lifeState==='ACTIVE'&&c.rejoined&&
   c.mobilityState==='GROUND'&&
   c.physicalFoot?.length===3&&c.physicalFoot.every(Number.isFinite))
   .map(c=>({id:c.id,foot:c.physicalFoot,
    hp:c.hp,distanceMeters:Number(Math.hypot(
     c.physicalFoot[0]-n.player.position[0],
     c.physicalFoot[2]-n.player.position[2]).toFixed(3))}))
   .sort((a,b)=>a.distanceMeters-b.distanceMeters||
    a.id.localeCompare(b.id));
  if(enemies.length!==4||!enemies[0]||
    n.cpu.cpu.length!==7||
    n.originalSourceSolids!==25||n.originalPaintSurfaces!==17||
    n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||
    n.cpu.physicalFootRelocations!==0)
   fail('B368_NATIVE_OPPONENT_PHYSICAL_AUTHORITY_HOLD_'+name);
  const value={stage:name,nativeTick:n.tick,
   actualHumanBody:n.player.position,closest:enemies[0],
   allPhysicalEnemies:enemies,realCpuCount:n.cpu.cpu.length,
   generatedOpponentPositions:0,syntheticNavLinks:0,
   actualOpponentRouteCertified:false,shotHitCertified:false,
   officialWinner:'NONE'};
  console.log('B368_REAL_PLAYER_OPPONENT_DISTANCE',JSON.stringify({
   stage:name,tick:n.tick,nearest:value.closest.id,
   genuineHorizontalMeters:value.closest.distanceMeters,
   routeCertified:false}));
  return value;
 };
 const b368Ui=()=>read('(() => {const e=document.querySelector('+
  '"#t21-f3-b368-real-enemy-frontier");return {exists:!!e,'+
  'visible:!!e&&!e.hidden&&getComputedStyle(e).display!=="none",'+
  'actor:e?.dataset.nearestCpuId,distance:Number('+
  'e?.dataset.nativeHorizontalMeters??-1),'+
  'cpuCount:e?.dataset.cpuPhysicalCount,'+
  'score:e?.dataset.sourceScoreable,'+
  'route:e?.dataset.crossTeamRouteCertified,'+
  'hit:e?.dataset.projectileHitCertified,'+
  'writes:e?.dataset.gameplayWrites,'+
  'relocations:e?.dataset.actorRelocations,text:e?.textContent,'+
  'overlapsMission:(()=>{const m=document.querySelector('+
  '"#t21-f3-b183-real-first-drop");if(!e||!m||m.hidden||'+
  'getComputedStyle(m).display==="none")return false;'+
  'const a=e.getBoundingClientRect(),b=m.getBoundingClientRect();'+
  'return a.left<b.right&&a.right>b.left&&'+
  'a.top<b.bottom&&a.bottom>b.top})()}})()');
 // Native CPU positions keep moving between UI render and CDP snapshots.
 // The exact nearest ID can legitimately flip (B1/B2 were 0.040m apart).
 // Verify the HUD's named ACTUAL CPU by id, its true physical distance,
 // and bounded nearest discrepancy, rather than requiring an atomic
 // snapshot that the normal gameplay never exposes.
 const b368HudMatches=(hud,truth)=>{
  const real=truth.allPhysicalEnemies.find(x=>x.id===hud.actor);
  return !!real&&Number.isFinite(hud.distance)&&
   Math.abs(hud.distance-real.distanceMeters)<=1.5&&
   real.distanceMeters-truth.closest.distanceMeters<=1.5;
 };
 const b368Initial=b368PhysicalRead(
  'INITIAL_ORIGINAL_HIGH_SPAWN',verifyAuthority(await snapshot()));
 const b368InitialHud=await b368Ui();
 if(!b368InitialHud.exists||!b368InitialHud.visible||
    !b368HudMatches(b368InitialHud,b368Initial)||
    b368InitialHud.cpuCount!=='4'||b368InitialHud.score!=='0'||
    b368InitialHud.route!=='false'||b368InitialHud.hit!=='false'||
    b368InitialHud.relocations!=='0'||b368InitialHud.writes!=='0'||
    b368InitialHud.overlapsMission!==false||
    !b368InitialHud.text?.includes('NO CROSS-TEAM PATH'))
  fail('B368_NATIVE_PLAYER_HUD_NOT_PHYSICAL_'+
   JSON.stringify({b368Initial,b368InitialHud}));
 // B365 is the genuine B183/B186 SOURCE-local gameplay challenge,
 // integrated with actual B192 CPU combat and B343 physical shooter.
 // The upper-floor start must not silently award lower-floor landing,
 // ramp ascent, human changed ink, opponent hits or any official winner.
 const missionDom=await read('(() => {const e=document.querySelector('+
  '"#t21-f3-b183-real-first-drop");return {exists:!!e,'+
  'hidden:e?.hidden,source:e?.dataset.originalSourceOnly,'+
  'scoring:e?.dataset.scoreablePromotions,'+
  'status:e?.dataset.b186NativeStatus,'+
  'clear:e?.dataset.b186RealLocalPracticeClear,'+
  'actualInk:e?.dataset.b186RealImpactChangedCells,'+
  'text:e?.textContent}})()');
 const startedCircuit=verifyAuthority(await snapshot()).b186RealOriginalHumanCircuit;
 const missionVisible=await read('(() => {const e=document.querySelector('+
  '"#t21-f3-b183-real-first-drop");return !!e&&!e.hidden&&'+
  'getComputedStyle(e).display!=="none"&&'+
  'e.textContent.includes("ORIGINAL FIRST DROP")&&'+
  'e.textContent.includes("NO TURF WINNER")})()');
 if(missionVisible!==true)
  fail('B365_GENUINE_PLAYER_MISSION_NOT_VISIBLE');
 if(!missionDom.exists||missionDom.source!=='true'||
    missionDom.scoring!=='0'||missionDom.clear!=='false'||
    !['WAIT_FIRST_DROP','MOVE_TO_ORIGINAL_RAISED'].includes(missionDom.status)||
    startedCircuit?.sourceLocalPlayClear!==false||
    startedCircuit?.firstActualRaisedGroundedTick!==null)
  fail('B365_SOURCE_CIRCUIT_NATIVE_PLAYER_ISSUE_'+
   JSON.stringify({missionDom,startedCircuit}));
 writeFileSync(resolve(DIR,'b365-real-player-source-circuit-armed.json'),
  JSON.stringify({schema:'B365_TRUE_SOURCE_SHOOTER_CPU_CIRCUIT',
   source:'25/17/26/0',selectedPhysicalShooter:true,
   realCpuCount:started.cpuRejoined,
   realNativeTick:started.tick,
   liveOriginalDrop:actualDrop,
   liveOriginalCircuit:startedCircuit,
   realPlayerHud:missionDom,realMissionVisibleInPlayerMode:missionVisible,
   fabricatedFootOrInk:false,forcedEnemyRoute:false,
   realCircuitCompleted:false,
   crossTeamRouteCertified:false,officialWinner:'NONE'},null,2)+'\n');
 // True original CPU health roster is visible, but opponents remain
 // separated by the uncertified 0/12 natural routes. Never fake damage.
 const cpuRoster=await wait(async()=>{
  const z=await read('(() => {const el=document.querySelector("#t21-f3-b211-real-battle-roster");'+
   'return {visible:!!el&&!el.hidden,rows:el?.dataset.realCpuCount,'+
   'hits:el?.dataset.humanDirectHits,winner:el?.dataset.officialWinner,'+
   'routes:el?.dataset.certifiedEnemyRoutes,encounter:el?.dataset.actualEnemyEncounterCertified,'+
   'text:el?.textContent}})()');
  return z?.visible&&z.rows==='7'&&z.winner==='NONE'&&
   z.routes==='0'&&z.encounter==='false'&&
   z.text?.includes('REAL 1 + 7 · SOURCE COMBAT')&&
   z.text.includes('CROSS-TEAM ROUTES 0/12 HOLD')?z:false;
 },30000);
 writeFileSync(resolve(DIR,'b362-real-original-cpu-combat-roster.json'),
  JSON.stringify({schema:'B362_ACTUAL_1_PLUS_7_SOURCE_COMBAT_SELECTED',
   originalSource:'25/17/26/0',nativeTick:started.tick,
   realCpuRoster:cpuRoster,sourceOnly:true,
   certifiedEnemyRoutes:0,officialWinner:'NONE',
   enemyEncounterCertified:false,productionAuthorized:false},null,2)+'\n');
 const b338Dom=await read('(() => {const ui=document.querySelector("#ui-root"),g=document.querySelector("#t21-f3-b338-source-guide"),card=document.querySelector("#t21-f3-b25-paint-run"),qa=document.querySelector("#t21-f3-b205-real-round");return {view:ui?.dataset.t21B245Presentation,phase:ui?.dataset.t21B338Phase,text:g?.textContent,guideShown:!!g&&getComputedStyle(g).display!=="none",cardVisible:!!card&&getComputedStyle(card).display!=="none",qaVisible:!!qa&&getComputedStyle(qa).display!=="none",scoreable:document.querySelector("#t21-f3-practice-hud")?.dataset.sourceScoreable}})()');
 if(b338Dom?.view!=='PLAYER'||b338Dom.phase!=='PLAYING'||
  !b338Dom.guideShown||!b338Dom.text?.includes('WASD MOVE')||
  b338Dom.cardVisible||b338Dom.qaVisible||b338Dom.scoreable!=='0')
  fail('B338_REAL_PLAYER_PHASE_NOT_ISOLATED_'+JSON.stringify(b338Dom));
 writeFileSync(resolve(DIR,'b338-real-playing-hud.json'),
  JSON.stringify({schema:'B338_REAL_CHROMIUM_PLAYING_HUD',
   source:'25/17/26/0',winner:'NONE',nativeTick:started.tick,...b338Dom},null,2)+'\n');
 // B338: true F8 QA→PLAYER round-trip inside the same native game.
 const f8={key:'F8',code:'F8',windowsVirtualKeyCode:119,nativeVirtualKeyCode:119};
 const toggleView=async()=>{for(const type of ['keyDown','keyUp'])
  await send('Input.dispatchKeyEvent',{type,...f8});};
 const uiState=()=>read('(() => {const u=document.querySelector("#ui-root"),g=document.querySelector("#t21-f3-b338-source-guide"),q=document.querySelector("#t21-f3-b205-real-round"),p=document.querySelector("#t21-f3-b25-paint-run");return {view:u?.dataset.t21B245Presentation,phase:u?.dataset.t21B338Phase,guideHidden:!g||getComputedStyle(g).display==="none",qaVisible:!!q&&getComputedStyle(q).display!=="none",practiceVisible:!!p&&getComputedStyle(p).display!=="none"}})()');
 await toggleView();
 const qaView=await wait(async()=>{
  const u=await uiState();return u.view==='QA'&&u.guideHidden&&u.qaVisible?u:false;
 },20000);
 await toggleView();
 const restoredView=await wait(async()=>{
  const u=await uiState();
  return u.view==='PLAYER'&&u.phase==='PLAYING'&&!u.guideHidden&&
   !u.qaVisible&&!u.practiceVisible?u:false;
 },20000);
 const nativeAfterF8=verifyAuthority(await snapshot());
 if(nativeAfterF8.matchState!=='PLAYING'||nativeAfterF8.paused||
  nativeAfterF8.cpu.physicalRejoins.length!==7)
  fail('B338_F8_CHANGED_NATIVE_WORLD');
 writeFileSync(resolve(DIR,'b338-real-playing-hud.json'),
  JSON.stringify({schema:'B338_REAL_CHROMIUM_PLAYING_HUD',
   source:'25/17/26/0',winner:'NONE',
   nativeTick:started.tick,...b338Dom,
   genuineF8QaRoundTrip:{qaView,restoredView,
    nativeTickAfter:nativeAfterF8.tick,
    nativeOriginalAuthorityUnchanged:true}},null,2)+'\n');
 await picture('B337_START');
 await send('Input.dispatchMouseEvent',
  {type:'mouseMoved',x:820,y:450,button:'none'});
 proof.actions.push('MOUSE_MOVED');store();
 await wait(async()=>{
  const v=verifyAuthority(await snapshot());
  return Math.abs(v.cameraSourcePractice?.yawDegrees-started.cameraYawDegrees)>=0.1;
 },40000);
 const aimed=await sample('AIM');
 await send('Input.dispatchMouseEvent',
  {type:'mousePressed',x:820,y:450,button:'left',clickCount:1});
 proof.actions.push('FIRE');store();
 try{
  await wait(async()=>{
   const v=verifyAuthority(await snapshot());
   return v.tick>=aimed.tick+20&&
    v.shotsFired>started.humanShots&&
    v.b23HumanInkFeedback.humanChangedCells>started.humanInk?v:false;
  },120000);
 }finally{
  await send('Input.dispatchMouseEvent',
   {type:'mouseReleased',x:820,y:450,button:'left',clickCount:1});
 }
 const fired=await sample('FIRE');
 const combatEvidence=verifyAuthority(await snapshot());
 const ledger=combatEvidence.b367RealCpuLifecycleEvidence;
 const battleNotice=await read('(() => {const n=document.querySelector('+
  '"#t21-f3-b367-real-cpu-lifecycle");return {exists:!!n,'+
  'hidden:n?.hidden,state:n?.dataset.t21B367State,'+
  'actor:n?.dataset.t21B367Actor,writes:n?.dataset.t21B367GameWrites,'+
  'scoreable:n?.dataset.originalScoreable,'+
  'route:n?.dataset.nativeEnemyRouteCertified,text:n?.textContent}})()');
 if(!ledger?.enabled||ledger.syntheticHits!==0||
    ledger.actorRelocations!==0||
    ledger.physicalHumanCpuHpHits>combatEvidence.humanCpuDirectHits||
    !battleNotice.exists||battleNotice.writes!=='0'||
    battleNotice.scoreable!=='0'||battleNotice.route!=='false')
  fail('B367_NATIVE_COMBAT_PROVENANCE_DRIFT');
 if(ledger.physicalHumanCpuHpHits===0&&
    (!battleNotice.hidden||battleNotice.actor!=='NONE'||
     battleNotice.state!=='NO_REAL_CPU_HIT'))
  fail('B367_FABRICATED_NATIVE_CPU_HIT_'+JSON.stringify(battleNotice));
 if(ledger.physicalHumanCpuHpHits>0&&
    ledger.events.some(e=>!['B1','B2','B3','B4'].includes(e.botId)||
     e.weaponId!=='pulse-sprayer'||e.actualHpLoss<=0||
     e.hpBefore<=e.hpAfter||e.lethalHpZero!==(e.hpAfter===0)))
  fail('B367_UNVERIFIED_ACTUAL_CPU_HP_EVENT');
 writeFileSync(resolve(DIR,'b367-real-native-cpu-hp-lifecycle.json'),
  JSON.stringify({schema:'B367_ORIGINAL_PHYSICAL_CPU_LIFECYCLE',
   originalSource:'25/17/26/0',nativeTick:combatEvidence.tick,
   realCpuRoster:combatEvidence.cpu.cpu,
   realHumanDirectHits:combatEvidence.humanCpuDirectHits,
   physicalDamageEvents:ledger,
   playerHud:battleNotice,syntheticTarget:false,
   fabricatedEnemyEncounter:false,officialScoreable:0,
   naturalOpponentRoutesCertified:0},null,2)+'\n');
 // B364 is displayed ONLY for actual source CPU center-ray geometry,
 // never for a fabricated enemy or a claimed projectile hit.
 const aimHud=await read(`(() => {
  const e=document.querySelector("#t21-f3-b243-source-aim-line");
  return {shown:!!e&&!e.hidden,mode:e?.dataset.t21B364Mode,
   cpuId:e?.dataset.t21B364CpuId,
   hp:Number(e?.dataset.t21B364RealHp??-1),
   writes:e?.dataset.t21B364GameplayWrites,
   hits:e?.dataset.t21B364ShotHitCertified,
   scoreable:e?.dataset.originalScoreable,
   text:document.querySelector("#t21-f3-b243-source-aim-caption")?.textContent}
 })()`);
 if(!aimHud.shown||
    !['NO_EXACT_CPU_AIM','REAL_CPU_BODY_CENTER_RAY',
     'REAL_CPU_GUARD_CENTER_RAY'].includes(aimHud.mode)||
    aimHud.writes!=='0'||aimHud.hits!=='false'||
    aimHud.scoreable!=='0')
  fail('B364_UNVERIFIED_NATIVE_CROSSHAIR_'+JSON.stringify(aimHud));
 const nativeAim=verifyAuthority(await snapshot());
 if(aimHud.mode==='NO_EXACT_CPU_AIM'&&
    (aimHud.cpuId!=='NONE'||aimHud.hp!==-1))
  fail('B364_FABRICATED_NO_TARGET_ID');
 if(aimHud.mode!=='NO_EXACT_CPU_AIM'){
  const actualCpu=nativeAim.cpu.cpu.find(x=>x.id===aimHud.cpuId);
  if(!actualCpu||actualCpu.lifeState!=='ACTIVE'||
     !actualCpu.rejoined||Math.abs(actualCpu.hp-aimHud.hp)>0.02||
     !aimHud.text.includes('NO HIT GUARANTEE'))
   fail('B364_NATIVE_CROSSHAIR_NOT_ACTUAL_CPU');
 }
 writeFileSync(resolve(DIR,'b364-native-real-cpu-center-crosshair.json'),
  JSON.stringify({schema:'B364_REAL_SOURCE_COMBAT_CROSSHAIR',
   source:'25/17/26/0',nativeTick:nativeAim.tick,
   actualPlayerSelectedCpuCombat:true,reticle:aimHud,
   syntheticTarget:false,forcedEnemyEncounter:false,
   officialScoreable:0,shotHitCertified:false},null,2)+'\n');
 const fidelityAfterFire=verifyAuthority(await snapshot());
 if(fidelityAfterFire.b348SourceShooterAccuracy?.actualAcceptedCandidateShots<1||
    fidelityAfterFire.b346NativeShooterWitness?.totalActualShooterLaunches<1||
    fidelityAfterFire.b348SourceShooterAccuracy.actualAcceptedCandidateShots!==
     fidelityAfterFire.b346NativeShooterWitness.totalActualShooterLaunches||
    fidelityAfterFire.b348SourceShooterAccuracy.originalReferenceModelCertified!==false||
    fidelityAfterFire.b351ActualHitCue?.syntheticHits!==0)
  fail('B363_REAL_PHYSICAL_ACCURACY_OR_HIT_AUTHORITY_MISSING');
 writeFileSync(resolve(DIR,'b363-native-player-shooter-physics.json'),
  JSON.stringify({schema:'B363_REAL_SOURCE_SHOOTER_PHYSICAL_GAMEPLAY',
   source:'25/17/26/0',tick:fidelityAfterFire.tick,
   actualShooterShots:fidelityAfterFire.shotsFired,
   physicalLaunches:fidelityAfterFire.b346NativeShooterWitness.totalActualShooterLaunches,
   physicalGroundShots:fidelityAfterFire.b348SourceShooterAccuracy.actualGroundedCandidateShots,
   physicalAirShots:fidelityAfterFire.b348SourceShooterAccuracy.actualAirborneCandidateShots,
   realCpuHpDamageCue:fidelityAfterFire.b351ActualHitCue,
   realInkChanges:fidelityAfterFire.b23HumanInkFeedback.humanChangedCells,
   originalWeaponFidelityCertified:false,
   inferredEnemyHits:false,forcedEncounter:false,officialScoreable:0},null,2)+'\n');
 // Verify an actual 3D world render has reached the player-facing
 // weapon and paint HUD. No injected ticks, shots or invented score.
 const b361Hud=await wait(async()=>{
  const v=await read(`(() => {
   const e=document.querySelector("#t21-f3-b355-source-ink-readout");
   const ui=document.querySelector("#ui-root");
   const reticle=document.querySelector("#t21-f3-b356-real-source-reticle");
   return {visible:!!e&&!e.hidden,text:e?.textContent??"",
    weapon:e?.dataset.t21B361WeaponId,
    shots:Number(e?.dataset.t21B361HumanShots??-1),
    changes:Number(e?.dataset.t21B361OriginalChanges??-1),
    writes:e?.dataset.t21B361GameplayWrites,
    scoreable:e?.dataset.t21B355OriginalScoreable,
    view:ui?.dataset.t21B245Presentation,
    reticleScoreable:reticle?.dataset.t21B356Scoreable};
  })()`);
  return v?.visible&&v.view==='PLAYER'&&
   v.weapon==='pulse-sprayer'&&v.shots===fired.humanShots&&
   v.changes>=fired.humanInk&&v.writes==='0'&&
   v.scoreable==='0'&&v.reticleScoreable==='0'&&
   v.text.includes('Pulse Sprayer')&&
   v.text.includes('SOURCE INK CHANGES')&&
   v.text.includes('SOURCE / NO SCORE')?v:false;
 },45000);
 writeFileSync(resolve(DIR,'b361-real-player-selected-shooter-hud.json'),
  JSON.stringify({schema:'B361_GENUINE_USER_LAUNCHED_SOURCE_SHOOTER',
   source:'25/17/26/0',baseline,selectedSearch,
   nativeFiredTick:fired.tick,humanRealShots:fired.humanShots,
   originalPaintChangedEvents:fired.humanInk,realHud:b361Hud,
   inferredCpuHit:false,officialScoreable:0,productionAuthorized:false},null,2)+'\n');
 for(const code of ['KeyW','KeyA','KeyS','KeyD']){
  const keys={KeyW:['w',87],KeyA:['a',65],KeyS:['s',83],KeyD:['d',68]};
  const [key,vk]=keys[code];
  const ev={key,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk};
  const prior=verifyAuthority(await snapshot());
  await send('Input.dispatchKeyEvent',{type:'keyDown',...ev});
  proof.actions.push(code);store();
  try{
   await wait(async()=>{
    const v=verifyAuthority(await snapshot());
    return v.tick>=prior.tick+12?v:false;
   },120000);
  }finally{
   await send('Input.dispatchKeyEvent',{type:'keyUp',...ev});
  }
  await sample(code.slice(-1));
 }
 await picture('B337_END');
 const actual=verifyAuthority(await snapshot()).b343OriginalSourceVolleyBudget;
 if(!actual?.enabled||actual.scoreable!==0||
    actual.syntheticShots!==0||actual.syntheticInk!==0||
    actual.productionAuthorized!==false)
   fail('B343_SOURCE_UNTRUSTED_PLAYER_BUDGET');
 writeFileSync(resolve(DIR,'b343-real-player-budget.json'),
  JSON.stringify({schema:'B343_GENUINE_NATIVE_CHROMIUM_SOURCE_VOLLEY',
   source:'25/17/26/0',actual,actualHumanShots:proof.samples.at(-1).humanShots,
   originalSourceNoMutation:true,
   originalWeaponFidelityCertified:false},null,2)+'\n');
 const verdict=b337AuditNative(proof);
 writeFileSync(resolve(DIR,'b337-driver-verdict.json'),
  JSON.stringify(verdict,null,2)+'\n');
 console.log('B343_REAL_PLAYER_VOLLEY_BUDGET_SUCCESS',
  JSON.stringify({verdict:verdict.verdict,budget:actual}));
 // B366: in THIS user-selected native B365 shooter + CPU7 session,
 // actually travel the original B123 25-solid same-team descent/ramp.
 // Neither prior isolated original route nor the player mission UI
 // is sufficient. Only live ordinary pointer-locked real CDP keyboard
 // physics and this same world's B183/B186 witnesses may certify it.
 const route={
  schema:'B366_SAME_NATIVE_B365_ORIGINAL_CIRCUIT',
  source:'25/17/26/0',originalNaturalOpposingRoutesCertified:0,
  playerChosenShooter:true,cpuPhysicalCount:7,
  keyEventsNative:true,syntheticTicks:false,syntheticFoot:false,
  injectedInk:false,addedOriginalSolids:0,actorRelocations:0,
  sourceScoring:0,originalWinner:'NONE',
  distinctOriginalSupports:[],stages:[],
  nativeMissionClear:false,finalOutcome:'NOT_YET_PROVEN'
 };
 const saveRoute=()=>writeFileSync(resolve(DIR,
  'b366-same-session-real-original-circuit.json'),
  JSON.stringify(route,null,2)+'\n');
 const nativeFoot=n=>({
  tick:n.tick,body:n.player.position,
  physicalSourceId:n.b112OriginalHumanGround?.lastOriginalSourceHitId??null,
  physicallyGrounded:n.b112OriginalHumanGround?.genuineKccGrounded??false,
  actualDescent:n.b183OriginalHumanDescent,
  actualCircuit:n.b186RealOriginalHumanCircuit,
  realHumanShots:n.shotsFired,
  originalHumanChangedCells:n.b23HumanInkFeedback.humanChangedCells,
  nativeCpuCount:n.cpu.cpu.length,
  actorRelocations:n.cpu.physicalFootRelocations,
  status:n.matchState,scoreable:n.sourceScoreablePromotions
 });
 const stageCheck=(phase,n)=>{
  route.stages.push({phase,...nativeFoot(n)});
  if(n.b112OriginalHumanGround?.lastOriginalSourceHitId)
   route.distinctOriginalSupports=[...new Set([...route.distinctOriginalSupports,
    n.b112OriginalHumanGround.lastOriginalSourceHitId])];
  route.finalOutcome='MEASURED_ORIGINAL_KEYBOARD_STAGES';
  saveRoute();
  console.log('B366_REAL_NATIVE_ORIGINAL_STAGE',JSON.stringify({
   phase,tick:n.tick,foot:n.b112OriginalHumanGround?.lastOriginalSourceHitId,
   grounded:n.b112OriginalHumanGround?.genuineKccGrounded,
   descent:n.b183OriginalHumanDescent?.status,
   circuit:n.b186RealOriginalHumanCircuit?.status,
   body:n.player.position}));
 };
 saveRoute();
 // Undo the genuine earlier 4.4-degree mouse look using the same real
 // mouse input path. No camera setter, character position reset or warp.
 await send('Input.dispatchMouseEvent',
  {type:'mouseMoved',x:800,y:450,button:'none'});
 const routeStart=verifyAuthority(await snapshot());
 const b368Approach={schema:'B368_REAL_ORIGINAL_PLAYER_TO_CPU_APPROACH',
  source:'25/17/26/0',initial:b368Initial,
  routeStart:b368PhysicalRead('ROUTE_START_HIGH',routeStart),
  stages:[],final:null,actualHorizontalClosingMeters:null,
  minPhysicalSeparationMeters:null,realEncounterCertified:false,
  certifiedOriginalCrossTeamRoutes:0,
  syntheticActorPlacements:0,addedOriginalSourceSolids:0,
  realHumanWASDOnly:true,gameplayWrites:0,officialWinner:'NONE'};
 const writeB368=()=>writeFileSync(resolve(DIR,
  'b368-real-native-enemy-proximity-frontier.json'),
  JSON.stringify(b368Approach,null,2)+'\n');
 writeB368();
 route.start=nativeFoot(routeStart);
 route.nativeYawAtStart=routeStart.cameraSourcePractice?.yawDegrees;
 saveRoute();
 if(Math.abs(route.nativeYawAtStart)>1.0||
    routeStart.b183OriginalHumanDescent?.enabled!==true||
    routeStart.b186RealOriginalHumanCircuit?.enabled!==true)
  fail('B366_REAL_NATIVE_SOURCE_START_INVALID_'+JSON.stringify(route.start));
 const routeSteps=[
  {name:'FIRST_DROP_W200',code:'KeyW',key:'w',vk:87,ticks:200},
  {name:'LOWER_RIGHT_D12',code:'KeyD',key:'d',vk:68,ticks:12},
  {name:'LOWER_FORWARD_W18',code:'KeyW',key:'w',vk:87,ticks:18},
  {name:'ORIGINAL_UPHILL_D90_MAX',code:'KeyD',key:'d',vk:68,ticks:90}
 ];
 for(const step of routeSteps){
  const before=verifyAuthority(await snapshot());
  const ev={key:step.key,code:step.code,
   windowsVirtualKeyCode:step.vk,nativeVirtualKeyCode:step.vk};
  await send('Input.dispatchKeyEvent',{type:'keyDown',...ev});
  try{
   const after=await wait(async()=>{
    const n=verifyAuthority(await snapshot());
    const physicalRaised=step.name==='ORIGINAL_UPHILL_D90_MAX'&&
     n.b112OriginalHumanGround?.genuineKccGrounded===true&&
     n.b112OriginalHumanGround?.lastOriginalSourceHitId===
      'UndertowT21D:right-low-team-a';
    return n.tick>=before.tick+step.ticks||physicalRaised?n:false;
   },180000);
   b368Approach.stages.push(
    b368PhysicalRead(step.name,after));writeB368();
   route.stages.push({phase:step.name,
    realCDPKeyDown:true,beforeTick:before.tick,
    actualPhysicalDurationTicks:after.tick-before.tick,
    ...nativeFoot(after)});
   if(after.b112OriginalHumanGround?.lastOriginalSourceHitId)
    route.distinctOriginalSupports=[...new Set([...route.distinctOriginalSupports,
      after.b112OriginalHumanGround.lastOriginalSourceHitId])];
   route.finalOutcome='MEASURED_ORIGINAL_KEYBOARD_STAGES';
   saveRoute();
   console.log('B366_REAL_NATIVE_ORIGINAL_STAGE',JSON.stringify({
    phase:step.name,tick:after.tick,
    actualTicks:after.tick-before.tick,
    foot:after.b112OriginalHumanGround?.lastOriginalSourceHitId,
    descent:after.b183OriginalHumanDescent?.status,
    circuit:after.b186RealOriginalHumanCircuit?.status,
    body:after.player.position}));
  }finally{
   await send('Input.dispatchKeyEvent',{type:'keyUp',...ev});
  }
 }
 const raised=verifyAuthority(await snapshot());
 const c=raised.b186RealOriginalHumanCircuit;
 route.afterOriginalRamp=nativeFoot(raised);
 route.finalOutcome='HOLD_ORIGINAL_RAMP_OR_DESCENT_UNPROVEN';
 saveRoute();
 if(raised.b183OriginalHumanDescent?.originalFirstDropLocalPracticeClear!==true||
    raised.b183OriginalHumanDescent?.actualOriginalRapierLowerLandingId!==
     'UndertowT21D:first-drop-landing-positive-z'||
    c?.actualOriginalRampTouched!==true||
    c?.actualOriginalRaisedFootColliderId!==
     'UndertowT21D:right-low-team-a'||
    c?.genuineGroundedTravelMeters<2||
    raised.b112OriginalHumanGround?.genuineKccGrounded!==true||
    raised.b112OriginalHumanGround?.lastOriginalSourceHitId!==
     'UndertowT21D:right-low-team-a')
  fail('B366_REAL_GROUNDED_ORIGINAL_CIRCUIT_ROUTE_HOLD_'+
   JSON.stringify(route.afterOriginalRamp));
 await picture('B366_RAISED_ORIGINAL_SOURCE');
 // Fire ONLY the real player weapon from actual raised Rapier KCC pose.
 // We may move the actual mouse to look downward, but NEVER move/aim
 // an opponent or edit paint/HP/physics through test APIs.
 const shotsBefore=nativeFoot(raised);
 route.nativeRaisedStart=shotsBefore;
 for(const angle of [510,565]){
  const before=verifyAuthority(await snapshot());
  await send('Input.dispatchMouseEvent',
   {type:'mouseMoved',x:800,y:angle,button:'none'});
  await send('Input.dispatchMouseEvent',
   {type:'mousePressed',x:800,y:angle,button:'left',clickCount:1});
  let after;
  try{
   after=await wait(async()=>{
    const n=verifyAuthority(await snapshot());
    return n.tick>=before.tick+42?n:false;
   },150000);
  }finally{
   await send('Input.dispatchMouseEvent',
    {type:'mouseReleased',x:800,y:angle,button:'left',clickCount:1});
  }
  route.stages.push({phase:'RAISED_REAL_MOUSE_FIRE_'+angle,
   genuineMouseDown:true,actualNativeFireTicks:after.tick-before.tick,
   ...nativeFoot(after)});
  route.afterNativeSourceInk=nativeFoot(after);
  saveRoute();
  if(after.b186RealOriginalHumanCircuit?.sourceLocalPlayClear===true)break;
 }
 const finished=verifyAuthority(await snapshot()),mission=finished.b186RealOriginalHumanCircuit;
 const b368Final=b368PhysicalRead('POST_REAL_RAMP_AND_INK',finished);
 b368Approach.final=b368Final;
 b368Approach.actualHorizontalClosingMeters=Number((
  b368Initial.closest.distanceMeters-b368Final.closest.distanceMeters).toFixed(3));
 b368Approach.minPhysicalSeparationMeters=Math.min(
  b368Initial.closest.distanceMeters,
  ...b368Approach.stages.map(s=>s.closest.distanceMeters),
  b368Final.closest.distanceMeters);
 writeB368();
 const b368FinalHud=await b368Ui();
 if(!b368FinalHud.exists||!b368FinalHud.visible||
    !b368HudMatches(b368FinalHud,b368Final)||
    b368FinalHud.route!=='false'||b368FinalHud.hit!=='false'||
    b368FinalHud.writes!=='0'||b368FinalHud.relocations!=='0'||
    b368FinalHud.overlapsMission!==false||
    !b368FinalHud.text?.includes('NO CROSS-TEAM PATH'))
  fail('B368_FINAL_PLAYER_HUD_SOURCE_DRIFT_'+
   JSON.stringify({b368Final,b368FinalHud}));
 if(b368Approach.actualHorizontalClosingMeters<10||
    b368Final.closest.distanceMeters<32||
    finished.humanCpuDirectHits!==0||
    finished.b367RealCpuLifecycleEvidence?.physicalHumanCpuHpHits!==0)
  fail('B368_REAL_APPROACH_UNPROVEN_OR_FALSE_ENCOUNTER_'+
   JSON.stringify(b368Approach));
 console.log('B368_REAL_PLAYER_CLOSES_PHYSICAL_ENEMY_DISTANCE',
  JSON.stringify({actualHumanWASDPhysicalClosingMeters:
   b368Approach.actualHorizontalClosingMeters,
   startMeters:b368Initial.closest.distanceMeters,
   finalMeters:b368Final.closest.distanceMeters,
   closestNativeCpu:b368Final.closest.id,
   sourceOriginalPathCertified:false,
   actualHitCertified:false,officialWinner:'NONE'}));
 route.final=nativeFoot(finished);
 route.nativeMissionClear=mission?.sourceLocalPlayClear===true;
 route.finalOutcome=route.nativeMissionClear?
  'PASS_TRUE_SAME_SESSION_DROP_RAMP_AND_ORIGINAL_HUMAN_INK':
  'HOLD_NATIVE_RAISED_FLOOR_FRESH_PAINT_NOT_PROVEN';
 saveRoute();
 await picture('B366_REAL_CIRCUIT_FINAL');
 if(!route.nativeMissionClear||
    mission?.status!=='REAL_LOCAL_CIRCUIT_CLEAR'||
    mission?.realPostDropHumanImpactChangedCells<60||
    finished.sourceScoreablePromotions!==0)
  fail('B366_TRUE_SAME_SESSION_LOCAL_CIRCUIT_NOT_YET_COMPLETE_'+
   JSON.stringify(route.final));
 console.log('B366_TRUE_REAL_SAME_SESSION_SOURCE_CIRCUIT',JSON.stringify({
  verdict:route.finalOutcome,realPaint:mission.realPostDropHumanImpactChangedCells,
  groundedTravel:mission.genuineGroundedTravelMeters,
  originalRaisedFoot:mission.actualOriginalRaisedFootColliderId,
  actualPhysicalShots:finished.shotsFired,
  opponentPathsCertified:0,officialWinner:'NONE'}));
}
try{await run();}
catch(error){console.error(error);process.exitCode=1;store();}
finally{
 try{socket?.close();}catch{}
 for(const child of children)child.kill('SIGTERM');
}
