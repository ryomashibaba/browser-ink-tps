#!/usr/bin/env node
/** B385: real CDP input -> user-visible B384 switch -> new original SOURCE
 * WebGL2/7 CPU -> native READY 12-weapon selection -> actual KCC/fire ->
 * real 180 second terminal (or honest HOLD). No time, actor, aim, score,
 * Authorized one P2 B441 genuine 180s on 2026-11-14: strict original SOURCE and RAW.
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
// Genuine short native test, no 180s/replay/official result claim.
const shortB415=process.env.T21_B415_SHORT_CANONICAL==='1';
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

async function runApprovedCombatTwinReplay(){
 if(process.env.GITHUB_ACTIONS!=='true'||
    process.platform!=='linux'||
    process.env.T21_P2_COMBAT_TWIN_180_REPLAY_ONCE!=='1')
  fail('P2_ONE_PUBLIC_NATIVE_APPROVAL_REQUIRED');
 report.schema='T21_P2_ONE_REAL_SELECTED_FRONTLINE_COMBAT_TWIN_180_REPLAY';
 report.outcome='HOLD_P2_TRUE_NATIVE_PENDING';
 persist();
 const capture=()=>evalPage(`(()=>{
  const s=window.__t21F3?.snapshot?.();
  if(!s)return null;
  const c=document.querySelector('#app-canvas');
  const f=document.querySelector('#t21-f3-b59-session-finished');
  const r=document.querySelector('#t21-f3-b59-restart');
  const w=document.querySelector('#t21-f3-b378-weapon');
  const rr=r?.getBoundingClientRect();
  return {origin:performance.timeOrigin,search:location.search,
   ready:c?.dataset.t21F3Ready,renderer:c?.dataset.t21F3Renderer,
   phase:s.matchState,paused:s.paused,stop:s.stopReason,
   tick:s.tick,remaining:s.timeRemainingSeconds,
   stage:[s.originalSourceSolids,s.originalPaintSurfaces,
    s.originalSourceNavigationLinks,s.sourceScoreablePromotions],
   cpuBodies:s.cpu?.cpu?.length,cpuRejoined:s.cpu?.physicalRejoins?.length,
   cpuRelocations:s.cpu?.physicalFootRelocations,
   production:s.productionAuthorized,fourvfour:s.unrestricted4v4Certified,
   winner:s.b186RealOriginalHumanCircuit?.officialWinner,
   weapon:s.b361NativePlayerWeapon?.id,
   selected:w?.value,bootKit:w?.dataset.b389NativeReplayKit,
   lock:document.pointerLockElement===c,
   shots:s.shotsFired,ink:s.player?.ink,hp:s.player?.hp,
   humanPaint:s.b23HumanInkFeedback?.humanChangedCells,
   cpuShots:s.cpuSourceTurfShots,
   // Read-only post-raster CPU ink: real accepted GameplayInkSystem cells,
   // not queued shoots, client-predicted turf, fake official score or
   // a newly created paint stamp. Source gameplay is never modified.
   cpuActualChangedCells:s.b154NativeSevenCpuInk?
    s.b154NativeSevenCpuInk.teamAChangedCells+
    s.b154NativeSevenCpuInk.teamBChangedCells:null,
   cpuActualByActor:s.b154NativeSevenCpuInk?.byActor??null,
   // B215 per-CPU weapon-ready aim counts; observational only.
   cpuPaintDecisionByActor:s.b215RealBattleAimPacing?.byActor??null,
   // Accepted per-CPU aim/paid requests are NOT proof of launch or impact.
   // The independent real PaintCoordinator raster above is the ink proof.
   cpuSourceTurfRequestsByActor:
    s.b154NativeSevenCpuInk?.actualAcceptedSourceTurfShotRequests??null,
   cpuRealPatrolTravel:s.cpu?.sourcePatrol?.travelMeters??null,
   // The prior P2 true 180s B1 held at 17 genuine ink requests after
   // 80s, but recorded NO actual foot XYZ / existing source destination.
   // Capture ONLY real post-KCC feet and PRE-EXISTING source-verified
   // patrol/approved goals. These are observations, never actor writes
   // or claims of authorized opposing routes/physical movement.
   cpuActualPhysicalFootByActor:Object.fromEntries(
    (s.cpu?.cpu??[]).map(c=>[c.id,c.physicalFoot??null])),
   cpuExistingPatrolGoalByActor:Object.fromEntries(
    (s.cpu?.sourcePatrol?.activeTargets??[])
     .map(g=>[g.id,g.position])),
   cpuLastApprovedFrontByActor:Object.fromEntries(
    (s.cpu?.sourcePatrol?.b442LastApprovedRealFrontTargets??[])
     .map(g=>[g.id,{
      target:g.target,physicalFoot:g.physicalFoot,
      distanceXZ:g.distanceXZ,lastApprovedNativeTick:g.lastApprovedNativeTick
     }])),
   // These counts are candidate searches, NOT hits, raster ink or
   // proof B1 has escaped the stagnant genuine 180s baseline.
   p2RealFootDenseAimReadout:{
    enabled:s.b216RealNativePaintBackfill?.p2OriginalOuterSelected??false,
    searches:s.b216RealNativePaintBackfill?.p2DenseRealFootSearches??0,
    approvedAimCandidates:
     s.b216RealNativePaintBackfill?.p2DenseRealFootApprovedAims??0
   },
   cpuLives:s.cpu?.cpu?.map(c=>({
    id:c.id,lifeState:c.lifeState,hp:c.hp,rejoined:c.rejoined
   }))??null,
   cpuActualSplats:s.cpuSplats??null,
   cpuActualRespawns:s.cpuRespawns??null,
   finishVisible:!!f&&!f.hidden&&f.style.display!=='none',
   finishState:f?.dataset.t21B59State,
   replayReady:!!r&&!r.hidden&&!r.disabled&&
    !!rr&&rr.width>0&&rr.height>0};
 })()`);
 const originalCombat=(s,tag)=>{
  if(!s||s.stage?.join('/')!=='25/17/26/0'||s.cpuBodies!==7||
     s.cpuRelocations!==0||s.production!==false||
     s.fourvfour!==false||s.winner!=='NONE'||s.stop||
     !Number.isSafeInteger(s.tick)||s.tick<0)
   fail('P2_ORIGINAL_SOURCE_GATE_'+tag,s);
  if(s.p2RealFootDenseAimReadout?.enabled!==true)
   fail('P2_ORIGINAL_AIM_RESEARCH_MODE_NOT_ACTIVE',{
    phase:tag,tick:s.tick,actualP2Mode:s.p2RealFootDenseAimReadout,
    noActorOrScoringWrites:true
   });
  return s;
 };
 const record=(tag,s)=>{
  report.phases.push({phase:tag,provenance:'SAME_REAL_CDP_NATIVE_SOURCE',
   source:'25/17/26/0',artificialTickWrites:0,
   actorTeleports:0,scoreWrites:0,observed:s});
  persist();
 };
 await cmd('Page.navigate',{url:ROOT+'play-source.html'});
 const portal=await until(async()=>{
  const p=await evalPage(`(()=>{
   const status=document.querySelector('#portal-status');
   const select=document.querySelector('#source-weapon-preselect');
   const front=document.querySelector('#play-combat-frontline');
   return {ready:status?.dataset.t21PortalReady,
    selected:select?.value,count:select?.options?.length,
    researchHref:front?.href};
  })()`);
  return p?.ready==='SOURCE_ONLY'&&p.count===12&&
   p.selected==='pulse-sprayer'&&
   p.researchHref&&
   new URL(p.researchHref).searchParams.get('t21W10B441')==='sourceFrontline'&&
   new URL(p.researchHref).searchParams.get('t21W10B448')==='realA3Front'?
    p:false;
 },90000);
 record('P2_TRUE_PORTAL_READY',portal);
 await clickButton('#source-weapon-preselect');
 for(let i=0;i<2;i++){
  await key('rawKeyDown','ArrowDown','ArrowDown',40);
  await key('keyUp','ArrowDown','ArrowDown',40);
 }
 await key('rawKeyDown','Enter','Enter',13);
 await key('keyUp','Enter','Enter',13);
 await key('rawKeyDown','Tab','Tab',9);
 await key('keyUp','Tab','Tab',9);
 const choice=await until(async()=>{
  const p=await evalPage(`(()=>{
   const w=document.querySelector('#source-weapon-preselect');
   const a=document.querySelector('#play-combat-frontline');
   return {weapon:w?.value,href:a?.href};
  })()`);
  return p?.weapon==='twin-comets'&&p.href&&
   new URL(p.href).searchParams.get('t21W10B389')==='twin-comets'&&
   new URL(p.href).searchParams.get('t21W10B441')==='sourceFrontline'&&
   new URL(p.href).searchParams.get('t21W10B448')==='realA3Front'?p:false;
 },25000);
 report.realKeyboardSelect=true;
 record('P2_ACTUAL_TWIN_COMETS_PORTAL_SELECTION',choice);
 await clickButton('#play-combat-frontline');
 const boot=await until(async()=>{
  const n=await capture();
  return n?.ready==='READY'&&n.renderer==='webgl2'&&
   n.phase==='STAGING'&&n.paused&&n.tick===0&&n.remaining===180&&
   n.cpuRejoined===0&&n.weapon==='twin-comets'&&
   n.selected==='twin-comets'&&
   n.bootKit==='VERIFIED_PREGAME_SELECTION'&&
   n.shots===0&&n.ink===100&&n.hp===100?n:false;
 },120000);
 originalCombat(boot,'FIRST_READY');
 const params=new URLSearchParams(boot.search);
 if(params.get('t21W10B192')!=='humanCombat'||
    params.get('t21QaDrive')!=='source'||
    params.get('t21W10B203')!=='fullRound'||
    params.get('t21W10B389')!=='twin-comets'||
    params.get('t21W10B441')!=='sourceFrontline'||
    params.get('t21W10B448')!=='realA3Front'||
    ['t21W10B193','t21W10B384','t21QaInput',
     'scoreable','production'].some(k=>params.has(k)))
   fail('P2_NOT_EXPLICIT_ORIGINAL_FRONTLINE_RESEARCH',boot);
 record('P2_FIRST_SELECTED_FRONTLINE_COMBAT_NEW_WORLD',boot);
 await picture('p2-combat-ready');
 await clickButton('#t21-f3-b202-resume');
 await until(()=>evalPage('document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 const started=await until(async()=>{
  const n=await capture();
  return n?.phase==='PLAYING'&&n.cpuRejoined===7&&n.lock&&
   !n.paused&&n.remaining>0?n:false;
 },300000);
 originalCombat(started,'FIRST_PLAYING');
 report.realPointerLock=true;
 record('P2_FIRST_REAL_SEVEN_CPU_JOIN',started);
 // ONE authorized Chrome world: genuine native clock observations at
 // real elapsed checkpoints. These are READS only; no extra input, tick,
 // collision, source ink, score, HP or virtual player is introduced.
 const actualInkAt=async(elapsedAtLeast)=>{
  const n=await until(async()=>{
   const x=await capture();
   return x?.phase==='PLAYING'&&!x.stop&&!x.paused&&
    x.remaining>0&&180-x.remaining>=elapsedAtLeast?x:false;
  },3900000);
  originalCombat(n,'REAL_INK_AT_LEAST_'+elapsedAtLeast);
  if(!Number.isSafeInteger(n.cpuActualChangedCells)||
     n.cpuActualChangedCells<0||!n.cpuActualByActor||
     !['A1','A2','A3','B1','B2','B3','B4'].every(id=>
       Number.isSafeInteger(n.cpuActualByActor[id]?.changedCells)))
    fail('P2_REAL_POST_RASTER_CPU_INK_MISSING',{
     elapsedAtLeast,tick:n.tick,remaining:n.remaining});
  record('P2_ACTUAL_ORIGINAL_INK_AFTER_'+elapsedAtLeast+'_SECONDS',n);
  return n;
 };
 const ink80=await actualInkAt(80);
 const mid=await until(async()=>{
  const n=await capture();
  return n?.phase==='PLAYING'&&n.remaining<=90&&
   n.remaining>0&&n.tick>started.tick&&!n.stop?n:false;
 },3900000);
 originalCombat(mid,'REAL_90_SECONDS');
 record('P2_TRUE_NATIVE_CLOCK_90_SECONDS',mid);
 const ink120=await actualInkAt(120);
 const ink150=await actualInkAt(150);
 const end=await until(async()=>{
  const n=await capture();
  return n?.phase==='TIME_UP'&&n.remaining===0&&n.paused&&
   !n.lock&&n.finishVisible&&n.finishState==='FINISHED'&&
   n.replayReady&&!n.stop?n:false;
 },3900000);
 originalCombat(end,'FIRST_TRUE_TIME_UP');
 const elapsed=(180-started.remaining)*60+end.tick-started.tick;
 if(elapsed<10800-0.02||elapsed>10805)
  fail('P2_NOT_TRUE_10800_NATIVE_COUNTDOWN',{elapsed,started,end});
 record('P2_REAL_180_SECOND_TIME_UP_AND_VISIBLE_RESULT',end);
 // Compare ACTUAL same-world post-raster cumulative CPU ownership
 // transitions. No positive outcome is required: a zero plateau must
 // remain an honest 0, not a test-helper fabricated performance PASS.
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const totalInk=(n)=>n?.cpuActualChangedCells;
 const checkpoints=[ink80,mid,ink120,ink150,end];
 if(checkpoints.some(n=>
    !Number.isSafeInteger(totalInk(n))||
    !n.cpuActualByActor||!ids.every(id=>
      Number.isSafeInteger(n.cpuActualByActor[id]?.changedCells)))||
    checkpoints.some((n,i)=>
      i>0&&totalInk(n)<totalInk(checkpoints[i-1])))
  fail('P2_POST_RASTER_NATIVE_CUMULATIVE_EVIDENCE_INVALID',
   checkpoints.map(x=>({tick:x.tick,remaining:x.remaining,
    changed:x.cpuActualChangedCells})));
 const byActor=Object.fromEntries(ids.map(id=>{
  const first=ink80.cpuActualByActor[id],last=end.cpuActualByActor[id];
  return [id,{
   originalActualChangedCells80toEnd:last.changedCells-first.changedCells,
   actualImpactChangedCells80toEnd:
    last.impactChangedCells-first.impactChangedCells,
   actualAlreadyTeamOwnedImpacts80toEnd:
    last.originalImpactAlreadyOwnedEvents-first.originalImpactAlreadyOwnedEvents,
   actualNoEligibleImpacts80toEnd:
    last.originalImpactNoEligibleEvents-first.originalImpactNoEligibleEvents,
   actualChangedImpacts80toEnd:
    last.originalImpactChangedEvents-first.originalImpactChangedEvents
  }];
 }));
 const genuineInkComparison={
  source:'25/17/26/0',realBrowser:'Chromium CDP WebGL2',
  nativeFirstTick:ink80.tick,nativeEndTick:end.tick,
  firstActualElapsedSeconds:180-ink80.remaining,
  lastActualElapsedSeconds:180-end.remaining,
  observedOriginalSourceCellsAt80:ink80.cpuActualChangedCells,
  observedOriginalSourceCellsAt90:mid.cpuActualChangedCells,
  observedOriginalSourceCellsAt120:ink120.cpuActualChangedCells,
  observedOriginalSourceCellsAt150:ink150.cpuActualChangedCells,
  observedOriginalSourceCellsAtTimeUp:end.cpuActualChangedCells,
  actualCpuCellChangesAfter80:
   end.cpuActualChangedCells-ink80.cpuActualChangedCells,
  originalSourceCpuByActor:byActor,
  realCpuShotRequestsAt80:ink80.cpuShots,
  realCpuShotRequestsAtTimeUp:end.cpuShots,
  actualPhysicalCpuTravelMetersAt80:ink80.cpuRealPatrolTravel,
  actualPhysicalCpuTravelMetersAtTimeUp:end.cpuRealPatrolTravel,
  realCpuLifeAtTimeUp:end.cpuLives,
  noArtificialClockOrInkOrActors:true,
  sourceScoringCertified:false,originalOpponentRoutesCertified:false
 };
 report.originalSourceInkComparison=genuineInkComparison;
 record('P2_REAL_ORIGINAL_CPU_INK_80S_TO_TIMEUP',genuineInkComparison);
 await picture('p2-combat-timeup');
 await clickButton('#t21-f3-b59-restart');
 const replay=await until(async()=>{
  const n=await capture();
  return n?.origin>boot.origin&&n.phase==='STAGING'&&n.paused&&
   n.tick===0&&n.remaining===180&&n.cpuRejoined===0&&
   n.shots===0&&n.ink===100&&n.hp===100&&
   n.weapon==='twin-comets'&&n.selected==='twin-comets'&&
   n.bootKit==='VERIFIED_PREGAME_SELECTION'&&n.search===boot.search?n:false;
 },120000);
 originalCombat(replay,'REPLAY_TRUE_NEW_WORLD');
 record('P2_CDP_CLICK_NEW_RAPIER_RECAST_SAME_KIT',replay);
 await picture('p2-combat-replay-ready');
 await clickButton('#t21-f3-b202-resume');
 await until(()=>evalPage('document.pointerLockElement===document.querySelector("#app-canvas")'),25000);
 const second=await until(async()=>{
  const n=await capture();
  return n?.phase==='PLAYING'&&n.cpuRejoined===7&&
   !n.paused&&n.lock&&n.weapon==='twin-comets'?n:false;
 },300000);
 originalCombat(second,'SECOND_7CPU');
 record('P2_SECOND_NEW_WORLD_SEVEN_CPU_REJOIN',second);
 await cmd('Input.dispatchMouseEvent',{
  type:'mouseMoved',x:800,y:620,button:'none'});
 await cmd('Input.dispatchMouseEvent',{
  type:'mousePressed',x:800,y:620,button:'left',buttons:1,clickCount:1});
 let fired;
 try{
  fired=await until(async()=>{
   const n=await capture();
   return n?.phase==='PLAYING'&&n.cpuRejoined===7&&
    n.lock&&n.shots>=second.shots+3&&n.ink<second.ink&&!n.stop?n:false;
  },90000);
 }finally{
  await cmd('Input.dispatchMouseEvent',{
   type:'mouseReleased',x:800,y:620,button:'left',buttons:0,clickCount:1});
 }
 originalCombat(fired,'REAL_REPLAY_SHOT');
 record('P2_SECOND_REAL_TWIN_COMETS_PAID_SHOTS',fired);
 await picture('p2-combat-reshoot');
 // A complete 180s/replay is NOT proof B1 resumed genuine paid shots.
 // The prior canonical trial successfully finished but B1 stayed at
 // 17 requests / 588 actual painted cells; fail CLOSED on the target.
 const b1RealShotGain=(end.cpuSourceTurfRequestsByActor?.B1??0)-
  (ink80.cpuSourceTurfRequestsByActor?.B1??0);
 const b1RealCellGain=(end.cpuActualByActor?.B1?.changedCells??0)-
  (ink80.cpuActualByActor?.B1?.changedCells??0);
 report.oneRunEvidence={oldOrigin:boot.origin,newOrigin:replay.origin,
  timeUpTick:end.tick,elapsedNativeCountdownTicks:elapsed,
  firstCpu7:true,secondCpu7:true,newWorldTick:replay.tick,
  replayWeapon:'twin-comets',realSecondShots:fired.shots-second.shots,
  realSecondInkSpend:second.ink-fired.ink,
  source:'25/17/26/0',scoreable:0,winner:'NONE',
  fourvfour:false,actorWrites:0,clockWrites:0,scoreWrites:0,
  mode:'EXPLICIT_B441_B448_ORIGINAL_FRONTLINE_RESEARCH',
  p2OriginalAimSelected:true,
  b1ActualShotRequestsAfter80:b1RealShotGain,
  b1ActualChangedCellsAfter80:b1RealCellGain};
 if(b1RealShotGain<=0||b1RealCellGain<=0)
  fail('P2_B1_TRUE_80_TO_180_SHOT_AND_INK_RECOVERY_NOT_PROVEN',
   report.oneRunEvidence);
 report.outcome='PASS_REAL_SELECTED_FRONTLINE_B1_RECOVERY_180_TIMEUP_TWIN_REPLAY';
 persist();
 console.log('P2_REAL_SOURCE_FRONTLINE_B1_RECOVERY_PASS',
  JSON.stringify(report.oneRunEvidence));
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
  const msg=JSON.parse(String(ev.data));
  // Preserve genuine Chrome boot exceptions; diagnostic only, never a
  // synthetic READY or a change to actor/paint/camera/clock input.
  if(msg.method==='Runtime.exceptionThrown'){
   const details=msg.params?.exceptionDetails;
   const errors=report.browserBootExceptions??=[];
   if(errors.length<6)errors.push({
    text:String(details?.exception?.description??details?.text??'UNKNOWN').slice(0,900),
    line:details?.lineNumber??null,column:details?.columnNumber??null
   });
  }
  const p=pending.get(msg.id);if(!p)return;
  pending.delete(msg.id);msg.error?p.no(Error(JSON.stringify(msg.error))):p.ok(msg.result??{});
 });
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
 if(process.env.T21_P2_COMBAT_TWIN_180_REPLAY_ONCE==='1'){
  await runApprovedCombatTwinReplay();
  return;
 }
 // User starts from actual QA preview, NOT directly invented B384 flags.
 // B386 player launch begins at normal preview with no QA flag.
 await cmd('Page.navigate',{url:ROOT+'?t21Play=preview'});
 // The research branch once timed out before the first READY event with
 // 0 actual inputs. Inspect the REAL page and boot-error text instead
 // of silently calling an ambiguous 120s hang a gameplay regression.
 let initialReady;
 try{
  initialReady=await until(async()=>{
   const x=await evalPage(`(()=>{
    const c=document.querySelector('#app-canvas');
    const e=document.querySelector('#boot-error');
    return {url:location.pathname+location.search,
     documentState:document.readyState,canvasExists:!!c,
     ready:c?.dataset.t21F3Ready??null,
     renderer:c?.dataset.t21F3Renderer??null,
     nativeSnapshotAvailable:!!window.__t21F3?.snapshot,
     bootError:e?.textContent?.slice(0,1200)??null,
     lastNativeStop:c?.dataset.t21F3StopReason??null};
   })()`);
   report.lastRealPreviewBootState=x;
   return x.bootError||(x.ready==='READY'&&x.renderer==='webgl2')?x:false;
  },120000);
 }catch(err){
  try{await picture('b385-original-preview-boot-hold')}catch{/* original HOLD remains */}
  throw err;
 }
 if(initialReady.bootError){
  try{await picture('b385-original-preview-boot-error')}catch{/* retain real error */}
  fail('REAL_INITIAL_PREVIEW_BOOT_EXCEPTION',initialReady);
 }
 report.phases.push({phase:'B385_NATIVE_WEBGL2_PREVIEW_READY',...initialReady});persist();
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
 // In the existing real Chromium B384 READY screen, the human can
 // select authentic A1 local co-op without first opening F8 QA.
 // This is a DISPLAY assertion; do not click and disrupt this 180s trial.
 const readyAlly=await evalPage(`(() => {
  const button=document.querySelector('#t21-f3-ready-real-a1-coop');
  const r=button?.getBoundingClientRect();
  const style=button?getComputedStyle(button):null;
  const ui=document.querySelector('#ui-root');
  return {exists:!!button,text:button?.textContent,
   width:r?.width??0,height:r?.height??0,display:style?.display,
   presentation:ui?.dataset.t21B245Presentation,
   sourceOnly:button?.dataset.originalSourceOnly,
   scoreable:button?.dataset.scoreable,
   actorTeleports:button?.dataset.actorTeleports,
   productionAuthorized:button?.dataset.productionAuthorized};
 })()`);
 if(!readyAlly.exists||readyAlly.width<20||readyAlly.height<15||
    readyAlly.display==='none'||readyAlly.presentation!=='PLAYER'||
    !readyAlly.text?.includes('REAL ALLY A1')||
    readyAlly.sourceOnly!=='true'||readyAlly.scoreable!=='0'||
    readyAlly.actorTeleports!=='0'||
    readyAlly.productionAuthorized!=='false')
  fail('REAL_A1_COOP_READY_CONTROL_NOT_VISIBLE',readyAlly);
 report.phases.push({phase:'REAL_A1_COOP_READY_VISIBLE_SOURCE_ONLY',
  button:readyAlly,actualWorldTick:joined.tick});
 persist();
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
 const b415Read=()=>evalPage(`(()=>{
 const s=window.__t21F3.snapshot(),e=document.querySelector('#t21-f3-hud-practice'),u=document.querySelector('#ui-root');
 return {tick:s.tick,phase:s.matchState,paused:s.paused,shots:s.shotsFired,
 ink:s.player.ink,cells:s.b23HumanInkFeedback.humanChangedCells,
 cpu:s.cpu.physicalRejoins.length,mode:u?.dataset.t21B245Presentation,
 source:[s.originalSourceSolids,s.originalPaintSurfaces,s.originalSourceNavigationLinks,s.sourceScoreablePromotions].join('/'),
 stage:e?.dataset.t21B415CanonicalNativeStage??'OFF',
 observedTick:Number(e?.dataset.t21B415NativeTick??-1),
 text:e?.textContent??'',official:e?.dataset.t21B415OfficialTurfScore,
 scoreable:e?.dataset.t21B415SourceScoreable,
 visible:!!e&&!!e.getClientRects().length};
})()`);
 const beforeB415=shortB415?await until(async()=>{
  const x=await b415Read();
  return x?.stage==='SPEND'&&x.phase==='PLAYING'&&!x.paused&&
   x.shots===0&&x.cpu===7&&x.source==='25/17/26/0'&&
   x.visible&&x.mode==='PLAYER'&&x.text.includes('1/3')&&
   x.official==='false'&&x.observedTick<=x.tick?x:false;
 },30000):null;
 if(shortB415){
  report.phases.push({phase:'REAL_CANONICAL_STAGE_ONE',before:beforeB415});
  // Validate actual B338 geometry on native, unpaused 7-CPU SOURCE.
  // The old 1.45em line clipped its top padding; never infer from
  // complete DOM text that it is actually visible on the PLAYER screen.
  const guide=await evalPage(`(()=>{
   const e=document.querySelector('#t21-f3-b338-source-guide');
   const hud=document.querySelector('#t21-f3-practice-hud');
   if(!e||!hud)return {missing:true};
   const style=getComputedStyle(e),rect=e.getBoundingClientRect();
   return {missing:false,text:e.textContent??'',hidden:e.hidden,
    whiteSpace:style.whiteSpace,maxHeight:style.maxHeight,
    overflowY:style.overflowY,lineHeight:style.lineHeight,
    scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,
    top:rect.top,bottom:rect.bottom,
    hudBottom:hud.getBoundingClientRect().bottom,
    viewportHeight:innerHeight,sourceOnly:true};
  })()`);
  if(guide.missing||guide.hidden||
     guide.whiteSpace!=='normal'||guide.maxHeight!=='none'||
     guide.overflowY==='hidden'||guide.overflowY==='clip'||
     guide.scrollHeight>guide.clientHeight+2||
     guide.hudBottom>guide.viewportHeight*.43||
     !guide.text.includes('WASD MOVE')||
     !guide.text.includes('LMB FIRE')||
     !guide.text.includes('RMB DODGE'))
    fail('B245_GENUINE_SOURCE_PLAYER_CONTROL_TEXT_CLIPPED',guide);
  report.phases.push({phase:'B245_NATIVE_PLAYER_CONTROLS_UNCLIPPED',
   source:'25/17/26/0',cpu:beforeB415.cpu,
   actualSelectedKit:'Twin Comets',guide,
   officialWinner:'NONE',scoreable:0,gameplayWrites:0});
  persist();
  console.log('B245_REAL_NATIVE_CONTROL_TEXT_READABLE_PASS',
   JSON.stringify(guide));
  await picture('b415-real-circuit-before-actual-shot');
  const vState=()=>evalPage(`(()=>{
   const s=window.__t21F3.snapshot(),c=document.querySelector('#app-canvas');
   return {tick:s.tick,shots:s.shotsFired,ink:s.player.ink,
    cpu:s.cpu.physicalRejoins.length,
    source:[s.originalSourceSolids,s.originalPaintSurfaces,
     s.originalSourceNavigationLinks,s.sourceScoreablePromotions].join('/'),
    phase:s.matchState,paused:s.paused,
    optIn:s.b399NativeCameraClearance?.optedIn,
    live:c?.dataset.t21B399NativeAimClearance??'OFF',
    key:c?.dataset.t21B399RealVHotkey??'UNSET',
    vTick:Number(c?.dataset.t21B399RealVHotkeyTick??-1),
    pointerLock:document.pointerLockElement===c,
    playerView:document.querySelector('#ui-root')?.dataset.t21B245Presentation,
    hiddenActors:s.b399NativeCameraClearance?.hiddenActors??[],
    cameraOpticalWitness:s.b399NativeCameraClearance?.cameraOpticalWitness??null};
  })()`);
  const beforeV=await vState();
  if(beforeV.optIn!==false||beforeV.live!=='OFF')
   fail('B399_V_INITIAL_RENDER_NOT_OFF',beforeV);
  // Independent rendered-image proof. Preserve the real fixed camera,
  // 1600x900 Chromium viewport and one native SOURCE world. No new actors,
  // fake navigation, clock injection, pause or score. The actual render
  // needs several natural ticks AFTER a V key, not a stale WebGL frame.
  await picture('b399-real-same-camera-off-before');
  await key('keyDown','v','KeyV',86);await key('keyUp','v','KeyV',86);
  const on=await until(async()=>{const v=await vState();
   return v.optIn===true&&v.live==='SOURCE_RENDER_ONLY'&&v.key==='ON'&&
    v.tick>=beforeV.tick+4?v:false;
  },20000);
  await picture('b399-real-same-camera-on');
  await key('keyDown','v','KeyV',86);await key('keyUp','v','KeyV',86);
  const off=await until(async()=>{const v=await vState();
   return v.optIn===false&&v.live==='OFF'&&v.key==='OFF'&&
    v.tick>=on.tick+4?v:false;
  },20000);
  await picture('b399-real-same-camera-off-after');
  for(const v of [on,off])
   if(v.shots!==beforeV.shots||Math.abs(v.ink-beforeV.ink)>.001||
    v.source!=='25/17/26/0'||v.cpu!==7||v.phase!=='PLAYING'||
    v.paused||!v.pointerLock||v.playerView!=='PLAYER')
    fail('B399_NATIVE_V_STATE_WRITE_OR_DRIFT',{beforeV,v});
  report.phases.push({phase:'B399_TRUE_PLAYER_KEYV_CAMERA_CLEARANCE',
   before:beforeV,on,off,officialWinner:'NONE',scoreable:0,
   pictures:['b399-real-same-camera-off-before.png',
    'b399-real-same-camera-on.png',
    'b399-real-same-camera-off-after.png'],
   actuallyHiddenActorsOn:on.hiddenActors,
   visualEffectMustBeReviewedFromRawPng:true,
   cameraAimWrites:0,inkWrites:0,actorWrites:0,clockWrites:0});
  persist();console.log('B399_REAL_NATIVE_V_ON_OFF_PASS',JSON.stringify({on,off}));
 }
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
  if(shortB415&&q.name==='FIRST_DROP_W200'){
   const after=await until(async()=>{
    const x=await b415Read();
    return x?.stage==='REFILL'&&x.visible&&x.mode==='PLAYER'&&
     x.text.includes('2/3')?x:false;
   },30000);
   if(after.phase!=='PLAYING'||after.paused||after.cpu!==7||
    after.source!=='25/17/26/0'||after.shots-beforeB415.shots<5||
    after.cells<=beforeB415.cells||after.ink>=beforeB415.ink||
    after.official!=='false'||after.scoreable!=='0'||
    after.observedTick<=beforeB415.observedTick||
    after.observedTick>after.tick)
    fail('B415_CANONICAL_STAGE_ONE_TO_TWO_NOT_NATIVE',{beforeB415,after});
   report.phases.push({phase:'B415_REAL_SOURCE_SHOT_SPEND_VISIBLE',
    before:beforeB415,after,foot:record.foot,
    realKeyboard:true,realMouseFire:true,actorWrites:0,
    clockWrites:0,inkWrites:0,sourceScoreable:0,
    full180sCertified:false,ownRefillCertified:false});
   report.outcome='PASS_B415_SHORT_CANONICAL_REAL_SHOOT_TO_REFILL_HUD';
   report.note='Real 1600x900 Chromium; native W200 + mouse fire + 7 CPU; no 180s, OWN refill or 3/3 claim.';
   persist();await picture('b415-real-circuit-after-actual-shot');
   console.log('B415_CANONICAL_NATIVE_STAGE_1_TO_2_PASS',JSON.stringify(after));
   return;
  }
 }
 // B390 native integration: a held D90 may leave the genuine KCC on the
 // registered ramp rather than the registered raised floor. Never count
 // ramp contact as a completed circuit or relax the grounded/source gate.
 // Continue REAL CDP key input for at most 30 native ticks, and stop early
 // only on an actually grounded, registered raised-floor KCC contact.
 let raised=original(await state(),'ACTUAL_RAISED_SOURCE');
 if(raised.b112OriginalHumanGround?.genuineKccGrounded===true&&
    raised.b112OriginalHumanGround.lastOriginalSourceHitId===
     'UndertowT21D:right-low-route-ramp-positive-z'){
   const ramp=raised;
   await key('keyDown','d','KeyD',68);
   try{
     raised=await until(async()=>{
       const s=original(await state(),'REAL_RAMP_FINAL_APPROACH');
       if(s.matchState!=='PLAYING'||s.paused)
         fail('RAMP_EXTENSION_MATCH_NOT_PLAYING',
          {tick:s.tick,matchState:s.matchState,paused:s.paused});
       const foot=s.b112OriginalHumanGround;
       const realRaised=foot?.genuineKccGrounded===true&&
         foot.lastOriginalSourceHitId==='UndertowT21D:right-low-team-a';
       return realRaised||s.tick>=ramp.tick+30?s:false;
     },90000);
   }finally{
     await key('keyUp','d','KeyD',68);
   }
   const record={phase:'REAL_RAMP_TO_RAISED_PHYSICAL_CONTINUATION',
     actualNativeTicks:raised.tick-ramp.tick,
     beforeFoot:ramp.b112OriginalHumanGround.lastOriginalSourceHitId,
     afterFoot:raised.b112OriginalHumanGround?.lastOriginalSourceHitId,
     realKccGrounded:raised.b112OriginalHumanGround?.genuineKccGrounded,
     realSourceRaisedConfirmed:
       raised.b112OriginalHumanGround?.genuineKccGrounded===true&&
       raised.b112OriginalHumanGround.lastOriginalSourceHitId===
       'UndertowT21D:right-low-team-a',
     injectedTicks:0,injectedActorPositions:0,addedGeometry:0};
   report.phases.push(record);persist();
   console.log('B385_REAL_RAMP_CONTINUATION',JSON.stringify(record));
 }
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
 // B368 intentionally hides unrevealed enemy feet in PLAYER view.
 // The old runner waited for those PRIVATE QA values while in PLAYER;
 // that timed out despite a genuine 3/3 native CLEAR. Real F8 only:
 // inspect actual QA DOM, then return to PLAYER before throwing F sub.
 const frontierRead=()=>evalPage('(() => {const e=document.querySelector("#t21-f3-b368-real-enemy-frontier"),u=document.querySelector("#ui-root");return {view:u?.dataset.t21B245Presentation,visible:!!e&&!e.hidden&&getComputedStyle(e).display!=="none",enemy:e?.dataset.nearestCpuId,distance:Number(e?.dataset.nativeHorizontalMeters??-1),count:Number(e?.dataset.cpuPhysicalCount??-1),route:e?.dataset.crossTeamRouteCertified,encounter:e?.dataset.actualEncounterCertified,hit:e?.dataset.projectileHitCertified,actor:e?.dataset.actorRelocations,writes:e?.dataset.gameplayWrites,text:e?.textContent}})()');
 const playerPrivate=await frontierRead();
 if(playerPrivate.view!=='PLAYER'||playerPrivate.visible||
    playerPrivate.enemy!=='REDACTED'||playerPrivate.count!==0||
    !!playerPrivate.text)
  fail('B368_PLAYER_ENEMY_LOCATION_PRIVACY_BROKEN',playerPrivate);
 await key('keyDown','F8','F8',119);
 await key('keyUp','F8','F8',119);
 let frontier;
 try{
  frontier=await until(async()=>{
   const x=await frontierRead();
   return x?.view==='QA'&&x.visible&&x.count===4&&
    x.enemy?.startsWith('B')&&x.distance>0&&
    x.route==='false'&&x.encounter==='false'&&x.hit==='false'&&
    x.actor==='0'&&x.writes==='0'&&
    /NO CROSS-TEAM PATH|NO PATH CERTIFIED/.test(x.text??'')?x:false;
  },45000);
  const actual=original(await state(),'B368_LIVE_QA_NATIVE_MATCH');
  const enemy=actual.cpu.cpu.find(x=>x.id===frontier.enemy);
  if(!enemy||!enemy.rejoined||enemy.lifeState!=='ACTIVE'||
     !Array.isArray(enemy.physicalFoot)||
     Math.abs(frontier.distance-Math.hypot(
       enemy.physicalFoot[0]-actual.player.position[0],
       enemy.physicalFoot[2]-actual.player.position[2]))>2)
   fail('B386_ACTUAL_ENEMY_DISTANCE_MISMATCH',{frontier,enemy,
    nativeTick:actual.tick});
  report.phases.push({phase:'B386_ACTUAL_ENEMY_FRONTIER',
   ...frontier,realCpuFoot:enemy.physicalFoot,
   genuineF8QaOnly:true,certifiedCrossTeamRoute:false,
   certifiedNativeCpuHit:false});persist();
 }finally{
  await key('keyDown','F8','F8',119);
  await key('keyUp','F8','F8',119);
 }
 const privateAgain=await until(async()=>{
  const x=await frontierRead();
  return x?.view==='PLAYER'&&!x.visible&&
   x.enemy==='REDACTED'&&x.count===0&&!x.text?x:false;
 },20000);
 report.phases.push({phase:'B368_REAL_F8_QA_TO_PLAYER_PRIVACY',
  before:playerPrivate,after:privateAgain,
  syntheticEnemyFootDisclosure:0,actorWrites:0,scoreWrites:0});
 persist();
 report.phases.push({phase:'REAL_NATIVE_TWIN_COMETS_ORIGINAL_3OF3',
  actualWeapon:done.b381RealNativeDodge.realWeapon,
  realShots:done.shotsFired,realInk:done.b23HumanInkFeedback.humanChangedCells,
  freshAfterDrop:c.realPostDropHumanImpactChangedCells,
  physicalTravel:c.genuineGroundedTravelMeters,
  actualCpuRejoins:done.cpu.physicalRejoins.length,
  liveHud:hud,officialScoreable:0,winner:'NONE'});
 // B385 true F-key sub-weapon vertical slice. Actual Twin Comets kit
 // equips Snap Bomb (native catalog cost 45 ink); no physics or tank writes.
 const nativeSubReady=await until(async()=>{
  const s=original(await state(),'REAL_NATIVE_SUB_READY');
  if(s.matchState!=='PLAYING'||s.paused||s.player.hp<=0||
     s.b38HumanSub?.enabled!==true||s.b38HumanSub.weapon!=='Snap Bomb'||
     s.b361NativePlayerWeapon?.id!=='twin-comets')
   fail('SOURCE_SUB_NOT_AVAILABLE',{tick:s.tick,sub:s.b38HumanSub,
    weapon:s.b361NativePlayerWeapon,hp:s.player.hp});
  return s.player.ink>=99?s:false;
 },100000);
 const trueSubHud=async()=>evalPage('(() => {const s=window.__t21F3.snapshot(),'+
  'u=document.querySelector("#ui-root"),g=document.querySelector("#t21-f3-b338-source-guide");'+
  'return {tick:s.tick,ink:s.player.ink,throws:s.b38HumanSub?.throws,'+
  'view:u?.dataset.t21B245Presentation,phase:u?.dataset.t21B338Phase,'+
  'text:g?.textContent??"",hidden:!g||g.hidden,'+
  'writes:g?.dataset.t21B338GameplayWrites,'+
  'sub:(()=>{const e=document.querySelector("#t21-f3-b392-native-sub");'+
   'return {visible:!!e&&!e.hidden&&getComputedStyle(e).display!=="none",'+
   'mode:e?.dataset.t21B392Mode??"OFF",'+
   'text:e?.textContent??"",tick:Number(e?.dataset.t21B392NativeTick??-1),'+
   'throws:Number(e?.dataset.t21B392HumanThrows??-1),'+
   'explosions:Number(e?.dataset.t21B392HumanExplosions??-1),'+
   'noWrites:e?.dataset.gameplayWrites,scoreable:e?.dataset.scoreable,'+
   'cpuHit:e?.dataset.cpuHitCertified};})()};})()');
 const readyHud=await until(async()=>{
  const q=await trueSubHud();
  return q?.view==='PLAYER'&&q.phase==='PLAYING'&&!q.hidden&&
   q.writes==='0'&&q.ink>=45&&
   q.throws===nativeSubReady.b38HumanSub.throws&&
   q.text.includes('F SUB Snap Bomb')?q:false;
 },35000);
 const actualFEvents=[];
 for(let i=0;i<2;i++){
  const before=original(await state(),'BEFORE_REAL_F_KEY_'+i);
  if(before.player.ink<45||before.b38HumanSub?.enabled!==true)
   fail('REAL_F_SUB_INSUFFICIENT_NATIVE_INK',{i,ink:before.player.ink});
  await key('keyDown','f','KeyF',70);
  let after;
  try{
   after=await until(async()=>{
    const n=original(await state(),'ACTUAL_F_KEY_NATIVE_THROW_'+i);
    return n.b38HumanSub?.throws===before.b38HumanSub.throws+1?n:false;
   },35000);
  }finally{
   await key('keyUp','f','KeyF',70);
  }
  if(after.shotsFired!==before.shotsFired||
     after.player.ink>=before.player.ink||
     after.b38HumanSub.weapon!=='Snap Bomb')
   fail('REAL_F_SUB_NATIVE_RESOURCE_OR_WEAPON_MISMATCH',{
    before:{tick:before.tick,throws:before.b38HumanSub.throws,
     ink:before.player.ink,shots:before.shotsFired},
    after:{tick:after.tick,throws:after.b38HumanSub.throws,
     ink:after.player.ink,shots:after.shotsFired}});
  const b392Thrown=await until(async()=>{
   const q=await trueSubHud();
   const u=q?.sub;
   return q?.view==='PLAYER'&&q.phase==='PLAYING'&&
    u?.visible===true&&u.mode==='THROWN'&&
    u.throws===after.b38HumanSub.throws&&
    u.text==='REAL SUB THROWN · Snap Bomb · NOT CPU HIT'&&
    u.noWrites==='0'&&u.scoreable==='0'&&u.cpuHit==='false'?u:false;
  },45000);
  actualFEvents.push({nativeTick:after.tick,physicalFKey:true,
   actualThrowsBefore:before.b38HumanSub.throws,
   actualThrowsAfter:after.b38HumanSub.throws,
   actualInkBefore:before.player.ink,actualInkAfter:after.player.ink,
   visibleB392RealThrow:b392Thrown,
   mainShotsUnchanged:true,originalScoreable:0});
 }
 const insufficientHud=await until(async()=>{
  const q=await trueSubHud();
  return q?.view==='PLAYER'&&q.phase==='PLAYING'&&!q.hidden&&
    q.writes==='0'&&q.throws===nativeSubReady.b38HumanSub.throws+2&&
    q.ink<45&&q.text.includes('SUB Snap Bomb · NEED 45 INK')&&
    !q.text.includes('F SUB')?q:false;
 },30000);

 // B393: genuine original SubWeaponSystem explosions and a natural
 // refill must occur during the SAME 180s USER round. Read-only.
 const realDetonations=await until(async()=>{
  const n=original(await state(),'B393_TRUE_NATIVE_SUB_EXPLOSIONS');
  if(n.matchState!=='PLAYING'||n.paused||
     n.b38HumanSub?.weapon!=='Snap Bomb')
   fail('B393_SOURCE_SUB_INTERRUPTED',{tick:n.tick,sub:n.b38HumanSub});
  return n.b38HumanSub.explosions>=
   nativeSubReady.b38HumanSub.explosions+2?n:false;
 },180000);
 const b392Detonated=await until(async()=>{
  const q=await trueSubHud();
  const u=q?.sub;
  return q?.view==='PLAYER'&&q.phase==='PLAYING'&&
   u?.visible===true&&u.mode==='DETONATED'&&
   u.explosions===realDetonations.b38HumanSub.explosions&&
   u.text==='REAL SUB DETONATED · Snap Bomb · NOT CPU HIT'&&
   u.noWrites==='0'&&u.scoreable==='0'&&u.cpuHit==='false'?u:false;
 },45000);

 // B394: inspect actual post-PaintCoordinator human Bomb outcome in the
 // SAME genuine Chrome session. An explosion is not automatically paint,
 // and changed original cells are not official Turf score or CPU hits.
 const realBombInk=await until(async()=>{
  const x=await evalPage(`(()=>{
   const s=window.__t21F3?.snapshot?.(),
    u=document.querySelector('#ui-root'),
    e=document.querySelector('#t21-f3-b394-bomb-source-paint'),
    p=s?.b23HumanInkFeedback;
   return {
    view:u?.dataset.t21B245Presentation,phase:s?.matchState,
    scoreable:s?.sourceScoreablePromotions,
    explosions:s?.b38HumanSub?.explosions,
    tick:s?.tick,
    native:{source:p?.source,original:p?.originalSourceOnly,
     scoreable:p?.scoreablePromotionCount,
     explosions:p?.humanBombExplosionsObserved,
     kind:p?.lastBombOutcome,tick:p?.lastBombOutcomeTick,
     stamps:p?.lastBombOutcomeStamps,cells:p?.lastBombOutcomeChangedCells},
    hud:{visible:!!e&&!e.hidden&&getComputedStyle(e).display!=='none',
     kind:e?.dataset.t21B394Kind??'OFF',text:e?.textContent??'',
     tick:Number(e?.dataset.t21B394NativeTick??-1),
     stamps:Number(e?.dataset.t21B394Stamps??-1),
     cells:Number(e?.dataset.t21B394Cells??-1),
     writes:e?.dataset.gameplayWrites,scoreable:e?.dataset.scoreable,
     cpuHit:e?.dataset.cpuHitCertified}
   };
  })()`);
  const n=x?.native,h=x?.hud;
  if(x?.view!=='PLAYER'||x?.phase!=='PLAYING'||x?.scoreable!==0||
     x?.explosions!==realDetonations.b38HumanSub.explosions||
     n?.source!=='REAL_HUMAN_ORIGINAL_PAINT_EVENT'||
     n.original!==true||n.scoreable!==0||n.explosions!==x.explosions||
     !Number.isSafeInteger(n.tick)||n.tick<0||n.tick>x.tick||
     !Number.isSafeInteger(n.stamps)||n.stamps<0||
     !Number.isSafeInteger(n.cells)||n.cells<0||
     !h?.visible||h.kind!==n.kind||h.tick!==n.tick||
     h.stamps!==n.stamps||h.cells!==n.cells||
     h.writes!=='0'||h.scoreable!=='0'||h.cpuHit!=='false')return false;
  const text={
   NEW_CELLS:n.stamps>0&&n.cells>0?
    'BOMB PAINT · +'+n.cells+' REAL SOURCE CELLS · NOT TURF SCORE':null,
   STAMP_ZERO_CHANGE:n.stamps>0&&n.cells===0?
    'BOMB SOURCE STAMP · 0 NEW CELLS · NOT A MISS':null,
   NO_CERTIFIED_STAMP:n.stamps===0&&n.cells===0?
    'BOMB BURST · NO REGISTERED SOURCE STAMP':null,
   MULTIPLE_UNRESOLVED:'BOMBS BURST · INDIVIDUAL PAINT UNKNOWN'
  }[n.kind]??null;
  return text!==null&&h.text===text?x:false;
 },45000);
 const realBombInkProof={
  phase:'B394_REAL_NATIVE_HUMAN_BOMB_ORIGINAL_PAINT_HUD',
  source:'25/17/26/0',actualTick:realBombInk.tick,
  actualExplosions:realBombInk.explosions,
  nativeOutcome:realBombInk.native,
  visiblePlayerHud:realBombInk.hud,
  actualChangedSourceCells:realBombInk.native.cells,
  actualSourceStamps:realBombInk.native.stamps,
  actualOutcomeKind:realBombInk.native.kind,
  certifiedPositiveSourceChange:realBombInk.native.kind==='NEW_CELLS',
  inferredCpuHit:false,officialTurfScore:0,
  injectedInk:0,injectedTicks:0,gameplayWrites:0
 };
 report.phases.push(realBombInkProof);persist();
 console.log('B394_REAL_NATIVE_BOMB_SOURCE_PAINT_HUD',
  JSON.stringify(realBombInkProof));
 await picture('b394-real-native-bomb-source-paint');
 const naturallyRefilled=await until(async()=>{
  const q=await trueSubHud();
  return q?.view==='PLAYER'&&q.phase==='PLAYING'&&!q.hidden&&
   q.writes==='0'&&q.throws===nativeSubReady.b38HumanSub.throws+2&&
   q.ink>=45&&q.text.includes('F SUB Snap Bomb')?q:false;
 },180000);
 if(realDetonations.b38HumanSub.throws!==
    nativeSubReady.b38HumanSub.throws+2||
    realDetonations.b38HumanSub.explosions!==
    nativeSubReady.b38HumanSub.explosions+2||
    naturallyRefilled.tick<=insufficientHud.tick)
  fail('B393_NATIVE_SUB_OR_REFILL_MISMATCH',{
   before:nativeSubReady.b38HumanSub,
   explosions:realDetonations.b38HumanSub,
   insufficientHud,naturallyRefilled});
 const realSubChain={phase:'B393_NATIVE_TWO_SUB_DETONATIONS_AND_INK_REFILL',
  source:'25/17/26/0',
  observedHumanSubExplosionsBefore:nativeSubReady.b38HumanSub.explosions,
  observedHumanSubExplosionsAfter:realDetonations.b38HumanSub.explosions,
  observedHumanSubThrowsAfter:realDetonations.b38HumanSub.throws,
  nativeDetonationTick:realDetonations.tick,
  visibleB392RealDetonation:b392Detonated,
  trueLowInkHud:insufficientHud,trueRefilledHud:naturallyRefilled,
  realNativePhysicsOnly:true,syntheticInk:0,syntheticSub:0,
  cpuDamageNotInferred:true,paintChangesNotInferred:true,
  originalScoreable:0,officialWinner:'NONE'};
 report.phases.push(realSubChain);persist();
 console.log('B393_REAL_NATIVE_SUB_EXPLOSIONS_REFILL',
  JSON.stringify(realSubChain));
 const proof={phase:'B385_TRUE_NATIVE_F_SUB_TWICE_AND_PLAYER_INK_GATE',
  source:'25/17/26/0',actualWeapon:'twin-comets',
  realKitSub:'Snap Bomb',nativeKitCost:45,
  readyHud,realKeyFThrows:actualFEvents,insufficientHud,
  syntheticNativeTicks:0,syntheticInk:0,syntheticProjectileWrites:0,
  certifiedCpuDamage:false,scoreable:0,productionAuthorized:false};
 report.phases.push(proof);persist();
 console.log('B385_TRUE_NATIVE_F_KEY_SUB_INK_HUD',JSON.stringify(proof));
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
