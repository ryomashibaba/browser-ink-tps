#!/usr/bin/env node
/**
 * W10-B110: short, genuine-Chrome original-source right-lane INPUT CALIBRATION.
 * Evidence only: NEVER setPosition, synthetic ticks, CPU relocations, NavLinks,
 * source geometry, collision exemptions, match promotion or official scoring.
 * A corridor hit is a *candidate*, NOT proof of a physically blocked A3 route.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {classifyB106,B106_CLASS} from './t21-w10b106-original-contact-classifier.mjs';

const root='http://127.0.0.1:4197/browser-ink-tps/';
const pulseTicks=Number(process.env.T21_B110_RIGHT_PULSE_TICKS??6);
if(!Number.isInteger(pulseTicks)||pulseTicks<1||pulseTicks>10)
 throw Error('B110_BAD_REAL_KEYD_TICKS');
const output=process.env.T21_B110_EVIDENCE_DIR??'/tmp/t21-b110';
// True-keyboard original-stage calibration: never directly set poses.
const qaCase='B105_REAL_BRIEF_CONTACT_RETRY';
// B110 varies ONLY genuine KeyW release after the proven B108 EARLY
// six-tick KeyA compensation. No original player/CPU code changes.
const releaseZ=Number(process.env.T21_B110_RELEASE_Z??64.60);
if(!Number.isFinite(releaseZ)||releaseZ<64.38||releaseZ>64.70)
 throw Error('B110_KEYW_RELEASE_OUTSIDE_BOUNDED_NATIVE_QA');
const correctionPhase=process.env.T21_B110_CORRECTION_PHASE??'EARLY';
if(!['EARLY','LATE'].includes(correctionPhase))
 throw Error('B110_UNKNOWN_REAL_KEYA_PHASE');
// The original real human KeyD pulse is retained; the correction is
// an actual browser KeyA press while natural KeyW locomotion continues.
// Tune timing of a GENUINE CDP KeyA press, not any actor pose.
 // B109 A-trigger 66.0, KeyW releaseZ 64.60: x=-0.151,z=64.067.
 // B105 desired x=-0.046,z=64.040. Vary only lateral start timing.
 const correctionTriggerZ=Number(
  process.env.T21_B110_KEYA_TRIGGER_Z??66.30);
 if(!Number.isFinite(correctionTriggerZ)||
    correctionTriggerZ<65.55||correctionTriggerZ>66.65)
  throw Error('B110_KEYA_TRIGGER_OUTSIDE_BOUNDED_NATIVE_QA');
const correctionTargetX=-.035;
const correctionMaxNativeTicks=6;
const releaseVariant='REAL_KEYW_Z_'+String(releaseZ)+
 '_REAL_KEYA_'+correctionPhase;
const expectedClass=B106_CLASS.TRANSIENT_DIRECT;
const b104Reference=[-0.06472519040107727,63.70650863647461];
const minDistinctDistance=.13;
const children=[],pending=new Map();
let sock,id=0;
const fail=(why,detail)=>{throw Error('B110_'+why+
 (detail===undefined?'':'_'+JSON.stringify(detail)));};
async function until(fn,ms=90000,poll=90){
 const limit=Date.now()+ms;
 while(Date.now()<limit){
  const value=await fn();
  if(value)return value;
  await sleep(poll);
 }
 fail('NATIVE_CHROME_TIMEOUT',{ms});
}
async function cmd(method,params={}){
 if(sock?.readyState!==WebSocket.OPEN)fail('CDP_DISCONNECTED');
 const n=++id;
 return await new Promise((yes,no)=>{
  const timeout=setTimeout(()=>{
   pending.delete(n);no(Error('B110_CDP_TIMEOUT_'+method));
  },25000);
  pending.set(n,{
   yes:response=>{clearTimeout(timeout);yes(response);},
   no:error=>{clearTimeout(timeout);no(error);}
  });
  sock.send(JSON.stringify({id:n,method,params}));
 });
}
async function evaluate(expression){
 const r=await cmd('Runtime.evaluate',
  {expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)fail('CHROME_PAGE_EXCEPTION',r.exceptionDetails);
 return r.result?.value;
}
const w={key:'w',code:'KeyW',windowsVirtualKeyCode:87,
 nativeVirtualKeyCode:87};
const d={key:'d',code:'KeyD',windowsVirtualKeyCode:68,
 nativeVirtualKeyCode:68};
const click=type=>cmd('Input.dispatchMouseEvent',
 {type,x:800,y:450,button:'left',clickCount:1});
function authority(n){
 if(n.stopReason||n.originalSourceSolids!==25||
    n.originalPaintSurfaces!==17||n.originalSourceNavigationLinks!==26||
    n.sourceScoreablePromotions!==0||n.productionAuthorized!==false||
    n.unrestricted4v4Certified!==false||n.cpu?.b93ExperimentalEnabled!==true||
    n.b102OriginalA3Kcc?.enabled!==true||
    n.cpu?.physicalFootRelocations!==0)
  fail('ORIGINAL_SOURCE_AUTHORITY_DRIFT',{
   tick:n.tick,stop:n.stopReason,solids:n.originalSourceSolids,
   paint:n.originalPaintSurfaces,nav:n.originalSourceNavigationLinks,
   score:n.sourceScoreablePromotions,relocations:n.cpu?.physicalFootRelocations
  });
 return n;
}
async function run(){
 mkdirSync(output,{recursive:true});
 const chrome=process.env.T21_CHROME_PATH||
  ['google-chrome-stable','google-chrome','chromium','chromium-browser']
   .find(x=>{try{execFileSync('which',[x],{stdio:'ignore'});return true;}catch{return false;}});
 if(!chrome)fail('CHROME_MISSING');
 const server=spawn('npm',['run','preview','--','--host','127.0.0.1',
  '--port','4197','--strictPort','--base','/browser-ink-tps/'],{stdio:'ignore'});
 children.push(server);
 await until(async()=>{try{return (await fetch(root)).ok;}catch{return false;}},30000,250);
 const browser=spawn(chrome,['--headless=new','--no-sandbox',
  '--disable-dev-shm-usage','--no-first-run','--disable-extensions',
  '--enable-unsafe-swiftshader','--use-angle=swiftshader',
  '--window-size=1600,900','--hide-scrollbars',
  '--remote-debugging-port=9257','--remote-allow-origins=*',
  '--user-data-dir=/tmp/t21-w10b110-cdp-profile','about:blank'],{stdio:'ignore'});
 children.push(browser);
 const tab=await until(async()=>{
  if(browser.exitCode!==null)fail('CHROME_EXITED');
  try{
   return (await (await fetch('http://127.0.0.1:9257/json')).json())
    .find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  }catch{return null;}
 },40000,250);
 sock=new WebSocket(tab.webSocketDebuggerUrl);
 await Promise.race([
  new Promise((ok,no)=>{
   sock.addEventListener('open',ok,{once:true});
   sock.addEventListener('error',no,{once:true});
  }),
  sleep(12000).then(()=>{throw Error('B110_CDP_OPEN_TIMEOUT');})
 ]);
 sock.addEventListener('message',event=>{
  const message=JSON.parse(String(event.data));
  const p=pending.get(message.id);
  if(!p)return;
  pending.delete(message.id);
  if(message.error)p.no(Error(JSON.stringify(message.error)));
  else p.yes(message.result||{});
 });
 await cmd('Page.enable');
 await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',
  {width:1600,height:900,deviceScaleFactor:1,mobile:false});
 await cmd('Page.navigate',{url:root+
  '?t21Play=preview&t21QaDrive=source&t21W10B93=upperDetour&t21W10B102=contactProbe'});
 await until(async()=>await evaluate(`(() => {
  const c=document.querySelector('#app-canvas');
  return c?.dataset.t21F3Ready==='READY'&&c?.dataset.t21F3Renderer==='webgl2';
 })()`),100000,450);
 const snapshot=async()=>authority(await evaluate('window.__t21F3.snapshot()'));
 const boot=await snapshot();
 if(boot.matchState!=='STAGING'||boot.paused)fail('BAD_NATIVE_BOOT');
 await click('mousePressed');await click('mouseReleased');
 await until(async()=>await evaluate(
  'document.pointerLockElement===document.querySelector("#app-canvas")'),20000);
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...w});
 await click('mousePressed');
 const before=await snapshot();
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',...d});
 let atPulse;
 try{
  atPulse=await until(async()=>{
   const n=await snapshot();
   return n.tick>=before.tick+pulseTicks?n:false;
  },45000,90);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...d});
 }
 console.log('T21_B110_TRUE_KEYD_RELEASE',JSON.stringify({
  requestedNativeTicks:pulseTicks,actualNativeTicks:atPulse.tick-before.tick,
  initial:before.player.position,atPulse:atPulse.player.position
 }));
 // B110 genuine *closed-loop* lateral correction. Sample actual Rapier
 // human foot after real KeyD-up at a bounded original upper-lip Z.
 // A single bounded KeyA input changes only native KCC *through*
 // original Chromium Input.dispatchKeyEvent, never setPosition.
 const startCorrection=await until(async()=>{
  const n=await snapshot();
  if(n.stopReason)fail('REAL_PRE_CORRECTION_SESSION_STOP_'+n.stopReason);
  return n.player.position[2]<=correctionTriggerZ?n:false;
 },90000,90);
 const leftKey={key:'a',code:'KeyA',
  windowsVirtualKeyCode:65,nativeVirtualKeyCode:65};
 let correction=null;
 if(startCorrection.player.position[0]>correctionTargetX){
  await cmd('Input.dispatchKeyEvent',{type:'keyDown',...leftKey});
  let lastSample=startCorrection;
  try{
   lastSample=await until(async()=>{
    const n=await snapshot();
    if(n.stopReason)fail('REAL_KEYA_CORRECTION_SESSION_STOP_'+n.stopReason);
    return n.player.position[0]<=correctionTargetX ||
     n.tick>=startCorrection.tick+correctionMaxNativeTicks?n:false;
   },60000,90);
  }finally{
   await cmd('Input.dispatchKeyEvent',{type:'keyUp',...leftKey});
  }
  correction={
   originalChromeKeyA:true,
   actualStartNativeTick:startCorrection.tick,
   actualEndNativeTick:lastSample.tick,
   actualKeyATicks:lastSample.tick-startCorrection.tick,
   actualFirstHumanFoot:startCorrection.player.position,
   actualObservedFinalHumanFoot:lastSample.player.position,
   noTeleports:true,noSyntheticTicks:true,noReverseKeyS:true
  };
 }else{
  correction={originalChromeKeyA:false,
   reason:'REAL_HUMAN_ALREADY_LEFT_OF_TARGET_NO_EXTRA_STEERING',
   actualStartNativeTick:startCorrection.tick,
   actualFirstHumanFoot:startCorrection.player.position};
 }
 console.log('T21_B110_ACTUAL_KEYA_LATERAL_CORRECTION',
  JSON.stringify({phase:correctionPhase,triggerZ:correctionTriggerZ,
   targetX:correctionTargetX,correction}));
 let atWRelease;
 try{
  atWRelease=await until(async()=>{
   const n=await snapshot();
   return n.player.position[2]<=releaseZ?n:false;
  },90000,90);
 }finally{
  await cmd('Input.dispatchKeyEvent',{type:'keyUp',...w});
 }
 const afterKeyup=await snapshot();
 await click('mouseReleased');
 const nearSettled=await until(async()=>{
  const n=await snapshot();
  return n.tick>=before.tick+160?n:false;
 },120000,300);
 const settled=await until(async()=>{
  const n=await snapshot();
  return n.tick>=before.tick+180?n:false;
 },120000,300);
 const [x,y,z]=settled.player.position;
 const drift=Math.hypot(x-nearSettled.player.position[0],
  z-nearSettled.player.position[2]);
 if(drift>.025)fail('HUMAN_NOT_PHYSICALLY_SETTLED',{drift});
 const originallyBlockedA3=[0.2749243676662445,64.00698852539062];
 const separationToBlockedA3=Math.hypot(x-originallyBlockedA3[0],
  z-originallyBlockedA3[1]);
 // These are candidate preconditions calibrated from REAL prior trials;
 // a true collision witness requires the separate full 60Hz A3 KCC test.
 // Broader geometry is ONLY candidate admission.
 // Real Rapier A3 blocker, original alternate NavLink & 7/7 still required.
 // Genuine B105 brief-contact witness was at z≈64.0396;
 // unlike B104 detour witness (z≈63.7065), this admits near-lip human.
 // True Rapier block, no-link direct rejoin and 7/7 still required.
 // Prior B105 safe-direct real human X/Z=(-.045632,64.039604).
// Only a near-B105 real parked foot enters the expensive physics run;
 // this position gate itself NEVER proves contact or direct recovery.
 const rightCandidate=x>=-.12&&x<=-.01&&z>=63.89&&z<=64.135&&
  y>=8.2&&y<=8.6&&separationToBlockedA3<=.7;
 const distinctDistance=Math.hypot(x-b104Reference[0],z-b104Reference[1]);
 const genuinelyDistinct=distinctDistance>=minDistinctDistance;
 const frame=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true})).data||'','base64');
 if(frame.length<10000)fail('SCREENSHOT_INVALID',{bytes:frame.length});
 const proof={
  schema:'T21_W10_B110_TRUE_CHROME_SIDE_KEY_CALIBRATION_V1',
  qualification:'POSITION_CANDIDATE_ONLY_NOT_PHYSICAL_A3_BLOCK_PROOF',
  requestedKeyDTicks:pulseTicks,
  actualKeyDTicks:atPulse.tick-before.tick,
  nativeStartingTick:before.tick,nativeFinalTick:settled.tick,
  firstHumanFoot:before.player.position,
  humanFootAtKeyDRelease:atPulse.player.position,
  humanFootAtKeyWObservedRelease:atWRelease.player.position,
  humanFootAfterKeyWApplied:afterKeyup.player.position,
  humanFootBeforeSettled:nearSettled.player.position,
  physicalSettledHumanFoot:settled.player.position,
  settledDriftMeters:drift,
  horizontalDistanceToPreviouslyBlockedA3Meters:separationToBlockedA3,
  rightBlockerLaneCandidate:rightCandidate,
  releaseVariant,requestedWKeyupZThreshold:releaseZ,
  correctionPhase,correctionTriggerZ,correctionTargetX,
  actualRealKeyACorrection:correction,
  historicB105DirectHumanXZ:[-.045632,64.039604],
  requestedNativeKeyATriggerZ:correctionTriggerZ,
  measuredDistanceFromB105DirectMeters:
   Math.hypot(x+.045632,z-64.039604),
  b104ReferenceRealHumanXZ:b104Reference,actualDistinctDistance:distinctDistance,
  genuinelyDistinct,minDistinctDistance,qaCase,expectedClass,
  actualKeyboardD:true,actualKeyboardW:true,
  actualBrowserPointerLock:true,actualNativeSimulationOnly:true,
  teleportPerformed:false,artificialTickAdvance:0,
  genuineHumanRetreatKeyS:false,
  originalAuthority:[25,17,26,0],
  originalActivationReady:false,original4v4Certified:false,
  normalFixedDefaultUnchanged:true,productionAuthorized:false,
  realA3KccWitnessAtCalibrationTick:settled.b102OriginalA3Kcc,
  screenshot:{name:'b110-native-right-'+pulseTicks+'-ticks.png',
   bytes:frame.length,sha256:createHash('sha256').update(frame).digest('hex')}
 };
 writeFileSync(resolve(output,proof.screenshot.name),frame);
 writeFileSync(resolve(output,'b110-calibration-'+pulseTicks+'.json'),
  JSON.stringify(proof,null,2));
 console.log('T21_B110_REAL_NATIVE_LANE_CALIBRATION_RECORDED',
  JSON.stringify({requestedTicks:pulseTicks,actualTicks:proof.actualKeyDTicks,
   keyupX:atWRelease.player.position[0],keyupZ:atWRelease.player.position[2],
   finalFoot:proof.physicalSettledHumanFoot,
   rightBlockerLaneCandidate:rightCandidate,
   genuinelyDistinct,distinctDistance,releaseVariant,qaCase,
   correctionPhase,correction,
   a3CollisionsObservedAtCalibration:
    settled.b102OriginalA3Kcc?.humanProximateRapierBlocks,
   noPhysicalRouteCertification:true}));
 // W10-B110: geometrically qualified input is only the expensive trial's
 // admission ticket. It is NOT yet a physically blocked A3 route.
 if(!rightCandidate||!genuinelyDistinct){
  writeFileSync(resolve(output,'b110-early-no-candidate.json'),
   JSON.stringify({...proof,qualification:!rightCandidate?
     'REAL_INPUT_CALIBRATION_MISS':'NOT_GENUINELY_DIFFERENT_FROM_B104'},null,2));
  fail('REAL_RIGHT_SOURCE_LANE_NOT_OCCUPIED_OR_CASE_MISMATCH',{
   requestedKeyDTicks:pulseTicks,actualKeyDTicks:proof.actualKeyDTicks,
   settledHumanFoot:settled.player.position,
   releaseVariant,qaCase,correctionPhase,correction,
   distinctDistance,minDistinctDistance,
   rightCandidate,genuinelyDistinct,
   contactQualified:false,realPhysicalRejoinVerified:false});
 }
 console.log('T21_B110_RIGHT_LANE_POSITION_CANDIDATE',
  JSON.stringify({settledHumanFoot:settled.player.position,
   actualKeyDTicks:proof.actualKeyDTicks,
   releaseVariant,qaCase,expectedClass,distinctDistance,genuinelyDistinct,
   correctionPhase,correction,
   originalA3CollisionNotYetCertified:true}));
 let lastTick=settled.tick,lastTickAt=Date.now(),lastLogAt=0;
 const startWall=Date.now(),observations=[];
 const evidenceFile=resolve(output,'b110-partial-real-source-trial.json');
 const classify=(n,ended=false)=>{
  const actualDetour=n.cpu.b93UpperDetours.find(d=>d.actorId==='A3');
  return classifyB106({
   originalAuthority:n.originalSourceSolids===25&&
    n.originalPaintSurfaces===17&&
    n.originalSourceNavigationLinks===26&&
    n.sourceScoreablePromotions===0&&n.productionAuthorized===false,
   original4v4Certified:n.unrestricted4v4Certified,
   teleportPerformed:n.cpu.physicalFootRelocations!==0,
   stopReason:n.stopReason,qualified:rightCandidate&&genuinelyDistinct,
   a3HumanProximateRapierRejections:
    n.b102OriginalA3Kcc?.humanProximateRapierBlocks,
   originalA3DetourLink:actualDetour?.linkId??null,
   sourceFloorEscapeFoot:actualDetour?.escapeFoot??null,
   physicalRejoins:n.cpu.physicalRejoins,
   realA3Rejoined:n.cpu.cpu.find(c=>c.id==='A3')?.rejoined,
   realA2Rejoined:n.cpu.cpu.find(c=>c.id==='A2')?.rejoined,
   freeCombatEnabled:n.cpu.freeCombatEnabled,matchState:n.matchState,
   tick:n.tick,humanFoot:n.player.position,ended
  });
 };
 const save=(n,verdict)=>{
  const detour=n.cpu.b93UpperDetours.find(d=>d.actorId==='A3');
  const result={
   schema:'T21_B110_REAL_RAPIER_CONTACT_GATED_SEVEN_CPU_V1',
   verdict,calibration:proof,qaCase,expectedClass,
   actualRealKeyACorrection:correction,
   observedOutcome:classify(n,
    n.cpu.physicalRejoins.length===7||n.tick>=2400),
   actualOriginalRapierContactTiming:{
    firstNativeTick:n.b102OriginalA3Kcc?.firstHumanProximateBlockTick??null,
    lastNativeTick:n.b102OriginalA3Kcc?.lastHumanProximateBlockTick??null,
    actualNativeRejects:n.b102OriginalA3Kcc?.humanProximateRapierBlocks,
    distinctNativeTicks:n.b102OriginalA3Kcc?.distinctHumanProximateBlockTicks,
    longestConsecutiveNativeTicks:
     n.b102OriginalA3Kcc?.longestHumanProximateBlockStreak
   },
   actualHumanFoot:n.player.position,
   genuineNativeTick:n.tick,actualMatchState:n.matchState,
   actualPhysicalRejoins:n.cpu.physicalRejoins,
   a3OriginalNavLinkDetour:detour??null,
   originalRapierA3Kcc:n.b102OriginalA3Kcc,
   realTimeSamples:observations.slice(-32),
   originalSourceAuthority:[25,17,26,0],
   normalFixedCpuUnchanged:true,artificialTicksAdded:0,
   humanOrCpuTeleportPerformed:false,reverseHumanKeySPressed:false,
   productionAuthorized:false,unrestricted4v4Certified:false
  };
  writeFileSync(evidenceFile,JSON.stringify(result,null,2));
  return result;
 };
 const completed=await until(async()=>{
  const n=await snapshot();
  const foot=n.player.position;
  const drift=Math.hypot(foot[0]-x,foot[2]-z);
  if(drift>.12){
   save(n,'INVALID_HUMAN_MOVED_AFTER_SETTLEMENT');
   fail('PHYSICAL_HUMAN_NOT_PARKED',{drift,settled:[x,y,z],current:foot});
  }
  if(n.cpu.physicalFootRelocations!==0||n.b102OriginalA3Kcc?.enabled!==true){
   save(n,'INVALID_ORIGINAL_SOURCE_KCC_AUTHORITY');
   fail('ORIGINAL_RAPIER_KCC_WITNESS_NOT_ACTIVE');
  }
  if(n.tick>lastTick){lastTick=n.tick;lastTickAt=Date.now();}
  const a3=n.cpu.b93UpperDetours.find(d=>d.actorId==='A3');
  const humanProximateKccBlocks=n.b102OriginalA3Kcc.humanProximateRapierBlocks;
  if(n.cpu.physicalRejoins.length===7){
   const realKcc=n.b102OriginalA3Kcc;
   if(realKcc.humanProximateRapierBlocks>0&&
      (!Number.isSafeInteger(realKcc.firstHumanProximateBlockTick)||
       !Number.isSafeInteger(realKcc.lastHumanProximateBlockTick)||
       realKcc.lastHumanProximateBlockTick<realKcc.firstHumanProximateBlockTick||
       !Number.isSafeInteger(realKcc.longestHumanProximateBlockStreak)||
       realKcc.longestHumanProximateBlockStreak<1)){
    save(n,'REAL_ORIGINAL_RAPIER_TICK_WITNESS_MISSING');
    fail('ACTUAL_CONTACT_NATIVE_TICKS_NOT_GROUNDED',realKcc);
   }
   const observed=classify(n,true);
   if(!observed.certified||observed.classification!==expectedClass){
    save(n,'CLASSIFICATION_MISMATCH_FAIL_CLOSED');
    fail('REAL_NATIVE_OUTCOME_NOT_EXPECTED',{
     qaCase,expectedClass,observedClass:observed.classification,
     originalContactRejections:humanProximateKccBlocks,
     actualOriginalLink:a3?.linkId??null,rejoins:n.cpu.physicalRejoins
    });
   }
   return n;
  }
  if(n.tick>=2400){
   save(n,'SEVEN_GENUINE_CPUS_NOT_REJOINED_BY_TICK_2400');
   fail('ACTUAL_PHYSICAL_SEVEN_CPU_RECOVERY_NOT_COMPLETE',{
    tick:n.tick,rejoined:n.cpu.physicalRejoins,
    originalA3HumanContact:humanProximateKccBlocks
   });
  }
  if(Date.now()-lastTickAt>90000){
   save(n,'REAL_CHROME_NATIVE_CLOCK_STALLED');
   fail('NATIVE_SIMULATION_STALLED',{tick:n.tick});
  }
  if(Date.now()-lastLogAt>20000){
   lastLogAt=Date.now();
   observations.push({
    actualNativeTick:n.tick,
    wallSeconds:Math.round((Date.now()-startWall)/1000),
    actualHumanFoot:foot,physicalRejoins:n.cpu.physicalRejoins.length,
    originalA3HumanProximateRapierBlocks:humanProximateKccBlocks,
    genuineA3OriginalLink:a3?.linkId??null
   });
   save(n,'NATIVE_CONTACT_GATED_TEST_IN_PROGRESS');
   console.log('T21_B110_NATIVE_RAPIER_REJOIN_HEARTBEAT',
    JSON.stringify(observations.at(-1)));
  }
  return false;
 },12*60*1000,550);
 const nativeProof=save(completed,'PASS_REAL_NATIVE_SOURCE_OUTCOME_CLASSIFICATION');
 const endScreen=Buffer.from((await cmd('Page.captureScreenshot',{
  format:'png',captureBeyondViewport:false,fromSurface:true
 })).data||'','base64');
 if(endScreen.length<10000)fail('NO_REAL_FINAL_WEBGL2_SCREENSHOT');
 const imageName='b110-genuine-original-source-right-seven.png';
 writeFileSync(resolve(output,imageName),endScreen);
 nativeProof.screenshot={name:imageName,bytes:endScreen.length,
  sha256:createHash('sha256').update(endScreen).digest('hex')};
 writeFileSync(resolve(output,'b110-genuine-original-source-PASS.json'),
  JSON.stringify(nativeProof,null,2));
 console.log('T21_B110_NATIVE_ORIGINAL_SOURCE_OUTCOME_CLASSIFIED_PASS',
  JSON.stringify({
   qaCase,expectedClass,actualClass:nativeProof.observedOutcome.classification,
   correctionPhase,actualRealKeyACorrection:correction,
   originalRapierA3HumanProximateRejects:
    completed.b102OriginalA3Kcc.humanProximateRapierBlocks,
   originalA3NavLink:nativeProof.a3OriginalNavLinkDetour?.linkId??null,
   firstRealRapierContactTick:
    completed.b102OriginalA3Kcc.firstHumanProximateBlockTick,
   lastRealRapierContactTick:
    completed.b102OriginalA3Kcc.lastHumanProximateBlockTick,
   longestContiguousContactTicks:
    completed.b102OriginalA3Kcc.longestHumanProximateBlockStreak,
   authenticPhysicalRejoins:completed.cpu.physicalRejoins,
   humanFoot:completed.player.position,tick:completed.tick,
   productionAuthorized:false,unrestricted4v4Certified:false
  }));

}
try{await run();}
catch(error){console.error(error);process.exitCode=1;}
finally{sock?.close();for(const p of children)p.kill('SIGTERM');}
