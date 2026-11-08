#!/usr/bin/env node
/** B390: real native 180-second continuation of the B384 human 3/3 clear.
 * No injected ticks, time, CPU positions, ink, damage, floor or scoring.
 * Called only by B385's genuine user-started Chromium world. */
import {setTimeout as sleep} from 'node:timers/promises';
import {b413RealOriginalMainFireBurst}
 from './t21-b413-native-source-fire-refill-reshoot.mjs';
import {b412OwnInkDwellVerified}
 from './t21-b412-native-original-squid-ink-swim.mjs';
/**
 * Verify B402 against a SAME-CDP-evaluation native snapshot. The previous
 * checkpoint tick was read before the next Runtime.evaluate and is not a
 * valid upper bound for the later radar render tick.
 * Radar dots are viewport-limited original ownerGrid samples, not a score.
 */
export function b390NativeRadarSampleConsistent(checkpointTick,radar){
 const d=radar?.d;
 return Number.isSafeInteger(checkpointTick)&&checkpointTick>=1&&
   Number.isSafeInteger(radar?.pageNativeTick)&&
   radar.pageNativeTick>=checkpointTick&&
   Number.isSafeInteger(d?.nativeTick)&&d.nativeTick>=1&&
   d.nativeTick<=radar.pageNativeTick&&
   radar.pageNativeTick-d.nativeTick<=180&&
   d.status==='SOURCE_PAINT_SAMPLES'&&
   d.measuredOriginalSurfaces===17&&
   Number.isSafeInteger(d.realTeamADots)&&d.realTeamADots>=0&&
   Number.isSafeInteger(d.realTeamBDots)&&d.realTeamBDots>=0&&
   d.realTeamADots===radar.a&&d.realTeamBDots===radar.b&&
   radar.status===d.status&&radar.tick===d.nativeTick&&
   radar.notScore==='true'&&
   radar.originalSolids==='25'&&radar.originalLinks==='26'&&
   d.sourceScoreable===0&&d.productionAuthorized===false&&
   d.officialWinner==='NONE'&&d.paintWrites===0&&
   d.fullCoverageInferred===false;
}

/** B401 original SOURCE ownership HUD: SAME-CDP snapshot + DOM. The
 * earlier checkpoint is an observed lower bound, not an upper bound: a
 * genuine 60 Hz page advances between separate CDP evaluations. */
export function b390NativeLiveGridConsistent(checkpointTick,live){
 const v=live?.v;
 return Number.isSafeInteger(checkpointTick)&&checkpointTick>=1&&
  Number.isSafeInteger(live?.pageNativeTick)&&
  live.pageNativeTick>=checkpointTick&&
  Number.isSafeInteger(v?.sampleNativeTick)&&v.sampleNativeTick>=1&&
  v.sampleNativeTick<=live.pageNativeTick&&
  live.pageNativeTick-v.sampleNativeTick<=180&&
  v.status==='LIVE_REGISTERED_SOURCE_ONLY'&&
  v.registeredSurfaces===17&&
  Number.isSafeInteger(v.totalActiveCells)&&v.totalActiveCells>0&&
  [v.teamA,v.teamB,v.neutral].every(n=>Number.isSafeInteger(n)&&n>=0)&&
  v.teamA+v.teamB+v.neutral===v.totalActiveCells&&
  v.originalSourceOnly===true&&v.officialTurfScore===false&&
  v.winner==='NONE'&&v.gameplayWrites===0&&
  v.productionAuthorized===false&&
  live.hudStatus===v.status&&live.hudTick===v.sampleNativeTick&&
  live.hudTotal===v.totalActiveCells&&live.hudA===v.teamA&&
  live.hudB===v.teamB&&live.hudN===v.neutral&&
  live.winner==='NONE'&&
  live.text?.includes('LIVE SOURCE GRID')&&
  live.text?.includes('NOT TURF SCORE');
}


/** Real 180s native 7-actor inventory, including a genuinely splatted
 * CPU's return to its EXISTING original one-way first-drop. Only the
 * read-only F3 SourceTraffic evidence may explain a temporarily missing
 * lower-side rejoin. Never invent an actor, route, HP hit or successful
 * fall; every pending return remains unverified until Rapier rejoin. */
export function b390NativeCpuLifeAndOriginalReturnConsistent(
 sourceCpu,nativeRespawns,nativeSplats
){
 const names=['A1','A2','A3','B1','B2','B3','B4'];
 const actors=sourceCpu?.cpu;
 const rejoined=sourceCpu?.physicalRejoins;
 const patrol=sourceCpu?.sourcePatrol;
 const pending=patrol?.respawnPendingCpuIds;
 const nonnegative=n=>Number.isSafeInteger(n)&&n>=0;
 const splatted=Array.isArray(actors)?
  actors.filter(a=>a?.lifeState==='SPLATTED'):[];
 if(!nonnegative(nativeRespawns)||!nonnegative(nativeSplats)||
    nativeSplats<nativeRespawns||
    nativeSplats-nativeRespawns!==splatted.length||
    !Array.isArray(actors)||
    !Array.isArray(rejoined)||!Array.isArray(pending)||
    actors.length!==7||new Set(actors.map(a=>a?.id)).size!==7||
    actors.some(a=>!names.includes(a?.id)||
      !['ACTIVE','SPLATTED'].includes(a?.lifeState)||
      !Number.isFinite(a?.hp)||a.hp<0||a.hp>100||
      typeof a.rejoined!=='boolean')||
    new Set(rejoined).size!==rejoined.length||
    new Set(pending).size!==pending.length||
    [...rejoined,...pending].some(id=>!names.includes(id))||
    ![patrol.respawnOriginalDetected,patrol.respawnOriginalGoalRequests,
      patrol.respawnOriginalRejoins,patrol.respawnUnsafeReturnHolds]
      .every(nonnegative)||
    patrol.respawnOriginalDetected<nativeRespawns||
    patrol.respawnOriginalRejoins>patrol.respawnOriginalDetected||
    patrol.respawnOriginalRejoins>nativeRespawns||
    patrol.respawnOriginalDetected>nativeRespawns||
    rejoined.length+pending.length+splatted.length!==7)return false;
 for(const actor of actors){
  if(rejoined.includes(actor.id)!==actor.rejoined)return false;
  if(actor.lifeState==='SPLATTED'){
   // Real 150-tick absence cannot count as an active lower-side rejoin
   // or a completed original upper-spawn return.
   if(actor.hp!==0||actor.rejoined||pending.includes(actor.id))return false;
   continue;
  }
  if(!actor.rejoined&&!pending.includes(actor.id))return false;
  if(pending.includes(actor.id)===actor.rejoined)return false;
  if(!actor.rejoined&&nativeRespawns===0)return false;
 }
 return sourceCpu.physicalFootRelocations===0;
}

export async function b390RunTrue180({done,original,state,evalPage,cmd,until,
 fail,report,persist,picture,clickButton}){
 const began=Date.now(),maxWallMs=62*60*1000;
 // One explicit P1 milestone: existing real CDP user inputs in the SAME
 // B385 Twin Comets + Snap Bomb + 180s + replay SOURCE world. No fake ink.
 const p1OwnOnce=process.env.T21_P1_OWN_ONCE==='1';
 let p1OwnDone=false;
 let prior=done,final=null,nextSample=20,lastTickWall=began;
 // P1 retry: prove the canonical read-only bridge at the beginning.
 // Failure must HOLD immediately, not waste 90 native source seconds.
 if(p1OwnOnce){
  const live=await evalPage(
   'window.__t21F3.auditB312NativeHumanOwnerLedger()');
  if(live?.source!=='25/17/26/0'||
     live.sourceActorRelocations!==0||live.sourceInkRewritten!==false||
     live.playerPositionRewritten!==false||
     live.originalRows?.length!==17)
   fail('P1_CANONICAL_READ_ONLY_SOURCE_PREFLIGHT');
  report.phases.push({phase:'P1_GENUINE_CANONICAL_READ_ONLY_PREFLIGHT',
   nativeTick:live.tick,originalSurfaces:17,source:live.source,
   noGameplayWrites:true});
  persist();
 }
 const opening={phase:'B390_TRUE_180S_STARTED',tick:done.tick,
  trueTimeRemaining:done.timeRemainingSeconds,
  physicalHumanShots:done.shotsFired,
  actualCpuShots:done.cpuSourceTurfShots,
  nativeHumanWeapon:done.b381RealNativeDodge.realWeapon,
  realPreviousClears:done.b387RealRoundMilestones.realClearedLives,
  fakeTimeOrPositionWrites:0};
 report.phases.push(opening);persist();
 console.log('B390_TRUE_NATIVE_180S_STARTED',JSON.stringify(opening));
 while(Date.now()-began<maxWallMs){
  await sleep(850);
  const n=original(await state(),'B390_TRUE_NATIVE_180S_PROGRESS');
  if(n.tick<prior.tick||n.timeRemainingSeconds>prior.timeRemainingSeconds+.02||
     n.b381RealNativeDodge.realWeapon!=='twin-comets'||
     n.b387RealRoundMilestones?.valid!==true||
     n.b387RealRoundMilestones.realClearedLives!==1||
     n.cpu.physicalFootRelocations!==0)
   fail('B390_SOURCE_180S_AUTHORITY_OR_CLOCK',{
    tick:n.tick,prior:prior.tick,remaining:n.timeRemainingSeconds,
    previousRemaining:prior.timeRemainingSeconds,
    memory:n.b387RealRoundMilestones});
  if(n.tick>prior.tick)lastTickWall=Date.now();
  if(Date.now()-lastTickWall>240000)
   fail('B390_NATIVE_TICK_STALLED',{tick:n.tick});
  if(n.matchState==='TIME_UP'){
   if(n.timeRemainingSeconds!==0||n.tick<10800)
    fail('B390_FALSE_NATIVE_180S',{tick:n.tick,remaining:n.timeRemainingSeconds});
   final=n;break;
  }
  if(n.matchState!=='PLAYING'||n.paused||
     !b390NativeCpuLifeAndOriginalReturnConsistent(
      n.cpu,n.cpuRespawns,n.cpuSplats))
   fail('B390_NATIVE_PLAY_INTERRUPTED',{
    tick:n.tick,state:n.matchState,paused:n.paused,
    rejoined:n.cpu.physicalRejoins.length,
    genuineNativeCpuRespawns:n.cpuRespawns,
    genuineNativeCpuSplats:n.cpuSplats,
    authenticOriginalReturn:n.cpu.sourcePatrol?.respawnPendingCpuIds});
  const elapsed=180-n.timeRemainingSeconds;
  // The previous B385/B390 180s already proved sub + replay. Connect
  // pre-shot, real original OWN squid refill, and re-shot IN THIS WORLD
  // only for the single explicit P1 acceptance. Reuse B412/B413 native
  // proof functions, source ownerGrid and actual Rapier support unchanged.
  if(p1OwnOnce&&!p1OwnDone&&elapsed>=89.5&&elapsed<92){
   const verify=x=>original(x,'P1_SAME_NATIVE_SOURCE');
   const nativeLedger=()=>evalPage(
    'window.__t21F3.auditB312NativeHumanOwnerLedger()');
   const locked=()=>evalPage(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
   const entry=await until(async()=>{
    const x=verify(await state());
    return x.matchState==='PLAYING'&&!x.paused&&
     x.timeRemainingSeconds<=90&&x.timeRemainingSeconds>=88?x:false;
   },12000);
   const origin=await evalPage('performance.timeOrigin');
   const floor='UndertowT21D:right-low-team-a';
   const entryFoot=await nativeLedger();
   if(entryFoot.source!=='25/17/26/0'||
      entryFoot.realHumanOriginalFootSupported!==true||
      entryFoot.genuineHumanOriginalFootSolid!==floor||
      entry.player.mode!=='HUMAN'||!(await locked()))
    fail('P1_SOURCE_UPPER_OR_REAL_POINTER_NOT_READY',{
     tick:entry.tick,foot:entryFoot.genuineHumanOriginalFootSolid,
     mode:entry.player.mode});
   const bridge={send:cmd,snapshot:state,ledger:nativeLedger,
    verify,locked,wait:until};
   const pre=await b413RealOriginalMainFireBurst({
    ...bridge,phase:'BEFORE_SQUID'
   });
   report.p1ActualPreRefillShot=pre;persist();
   // P1: do not force the user to swim AWAY from true OWN ink
   // merely to pass a separate B412 KCC navigation audit. RAW
   // #42440512855: real shot 28, paid ink 22.96, OWN under human foot.
   // Actual Shift-only player input is sufficient for genuine recovery.
   const ownStart=verify(await state());
   const ownFoot=await nativeLedger();
   if(ownStart.player.mode!=='HUMAN'||
      ownStart.player.inkRelation!=='OWN'||
      ownStart.player.ink>=pre.before.ink||
      ownFoot.source!=='25/17/26/0'||
      ownFoot.genuineHumanOriginalFootSolid!==floor||
      ownFoot.realHumanOriginalFootSupported!==true||
      !(await locked()))
    fail('P1_TRUE_OWN_ORIGINAL_FOOT_REQUIRED',{
     source:ownFoot.source,foot:ownFoot.genuineHumanOriginalFootSolid,
     tick:ownStart.tick,relation:ownStart.player.inkRelation,
     ink:ownStart.player.ink});
   const shiftEvent=type=>({
    type,key:'Shift',code:'ShiftLeft',
    windowsVirtualKeyCode:16,nativeVirtualKeyCode:16
   });
   let refill=null;
   await cmd('Input.dispatchKeyEvent',shiftEvent('keyDown'));
   try{
    const squid=await until(async()=>{
     const n=verify(await state());
     return n.player.mode==='SQUID'&&
      n.player.inkRelation==='OWN'&&
      n.playerInkRecoveryState==='SQUID_OWN'&&
      n.b381RealNativeDodge?.realLocomotion==='SWIM_GROUND'?n:false;
    },20000);
    const after=await until(async()=>{
     const n=verify(await state());
     return n.tick>=squid.tick+12?n:false;
    },20000);
    const realFoot=await nativeLedger();
    const verified=b412OwnInkDwellVerified(
     squid,after,realFoot,floor,ownStart.shotsFired)&&await locked();
    const drift=Math.hypot(
     after.player.position[0]-squid.player.position[0],
     after.player.position[2]-squid.player.position[2]);
    refill={source:'25/17/26/0',entryTick:ownStart.tick,
     squidBeginTick:squid.tick,squidAfterTick:after.tick,
     actualInkBefore:squid.player.ink,actualInkAfter:after.player.ink,
     genuineObservedOwnInkGain:after.player.ink-squid.player.ink,
     actualOwnRelation:squid.player.inkRelation,
     actualRecoveryState:after.playerInkRecoveryState,
     originalFoot:realFoot.genuineHumanOriginalFootSolid,
     physicalFootSupported:realFoot.realHumanOriginalFootSupported,
     noDirectionalKeysHeld:true,actualPlayerDriftMeters:drift,
     nativeShotsUnchanged:after.shotsFired===ownStart.shotsFired,
     independentlyVerified:verified,
     syntheticInkWrites:0,syntheticShotWrites:0,
     syntheticClockWrites:0,syntheticActorWrites:0};
    report.p1ActualOwnSquidDwell=refill;persist();
    if(!verified)fail('P1_REAL_OWN_SQUID_RECOVERY_NOT_OBSERVED',refill);
   }finally{
    await cmd('Input.dispatchKeyEvent',shiftEvent('keyUp'));
   }
   const returned=await until(async()=>{
    const n=verify(await state());
    return n.player.mode==='HUMAN'&&
     n.b381RealNativeDodge?.realLocomotion==='HUMAN'?n:false;
   },20000);
   const humanFoot=await nativeLedger();
   const bodyDrift=Math.hypot(
    returned.player.position[0]-ownStart.player.position[0],
    returned.player.position[2]-ownStart.player.position[2]);
   refill={...refill,finalHumanTick:returned.tick,
    finalHumanShots:returned.shotsFired,
    actualOriginalHumanFoot:humanFoot.genuineHumanOriginalFootSolid,
    actualNativeHumanBodyDriftMeters:bodyDrift};
   report.p1ActualOwnSquidDwell=refill;persist();
   if(returned.shotsFired!==ownStart.shotsFired||
      humanFoot.genuineHumanOriginalFootSolid!==floor||
      humanFoot.realHumanOriginalFootSupported!==true||
      bodyDrift>.5||!(await locked()))
    fail('P1_SQUID_TO_HUMAN_ORIGINAL_FOOT_HOLD',refill);
   const post=await b413RealOriginalMainFireBurst({
    ...bridge,phase:'AFTER_SQUID'
   });
   const current=verify(await state());
   const sameWorld=await evalPage('performance.timeOrigin')===origin;
   if(!sameWorld||refill?.independentlyVerified!==true||
      pre.actualShotsPaid<5||post.actualShotsPaid<5||
      pre.actualOriginalImpactEvents<1||post.actualOriginalImpactEvents<1||
      post.before.shots!==refill.finalHumanShots||
      refill.entryTick<pre.after.tick||
      current.tick<post.after.tick||
      current.matchState!=='PLAYING'||current.player.mode!=='HUMAN'||
      current.cpu.physicalRejoins.length!==7)
    fail('P1_REAL_SHOT_OWN_REFILL_RESHOT_SAME_WORLD_HOLD',{
     sameWorld,preShots:pre.actualShotsPaid,
     postShots:post.actualShotsPaid,ownDwell:refill,
     currentTick:current.tick,realCpu:current.cpu.physicalRejoins.length});
   const playerHud=await evalPage(`(()=>{
    const e=document.querySelector('#t21-f3-hud-practice');
    return {stage:e?.dataset.t21B415CanonicalNativeStage??'NOT_VISIBLE',
     text:e?.textContent??'',nativeTick:e?.dataset.t21B415NativeTick??'-1'};
   })()`);
   const p1={phase:'P1_SAME_REAL_SOURCE_PLAYER_SHOT_OWN_REFILL_RESHOT',
    originalSource:'25/17/26/0',oldOrigin:origin,
    samePhysicalBrowserWorld:sameWorld,actualSevenCpuRejoined:7,
    originalFoot:floor,preShotNativeInkSpent:pre.sourceInkDifference,
    preRealHumanShots:pre.actualShotsPaid,
    preOriginalProjectileImpactEvents:pre.actualOriginalImpactEvents,
    actualSquidInkBefore:refill.actualInkBefore,
    actualSquidInkAfter:refill.actualInkAfter,
    genuineOwnInkGain:refill.genuineObservedOwnInkGain,
    ownDwellVerified:refill.independentlyVerified,
    actualStationaryShiftOnlyRecovery:true,
    actualHumanFootDriftMeters:refill.actualNativeHumanBodyDriftMeters,
    postRealHumanShots:post.actualShotsPaid,
    postShotNativeInkSpent:post.sourceInkDifference,
    postOriginalProjectileImpactEvents:post.actualOriginalImpactEvents,
    playerHud,syntheticShotWrites:0,syntheticInkWrites:0,
    syntheticClockWrites:0,syntheticActorWrites:0,scoreable:0,
    officialWinner:'NONE',formal4v4Certified:false};
   report.phases.push(p1);persist();p1OwnDone=true;
   console.log('P1_TRUE_NATIVE_SAME_WORLD_OWN_REFILL_RESHOT',JSON.stringify(p1));
   await picture('p1-same-real-source-own-refill-reshoot');
  }
  if(elapsed>=nextSample){
   // Real native match checkpoint -> actual on-screen live ownership.
   const live=await evalPage(`(() => {
    const s=window.__t21F3?.snapshot?.(),
     h=document.querySelector('#t21-f3-b205-real-round');
    const v=s?.b401NativeLiveSourceInk;
    return {v,pageNativeTick:s?.tick,text:h?.textContent,
     hudStatus:h?.dataset.t21B401SourceStatus,
     hudTick:Number(h?.dataset.t21B401SampleNativeTick),
     hudTotal:Number(h?.dataset.t21B401RegisteredCells),
     hudA:Number(h?.dataset.t21B401TeamACells),
     hudB:Number(h?.dataset.t21B401TeamBCells),
     hudN:Number(h?.dataset.t21B401NeutralCells),
     winner:h?.dataset.t21B401OfficialWinner};
   })()`);
   if(!b390NativeLiveGridConsistent(n.tick,live))
    fail('B401_TRUE_NATIVE_HUD_SOURCE_GRID_MISMATCH',{tick:n.tick,live});
   if(!report.phases.some(x=>x.phase==='B401_REAL_180S_NATIVE_LIVE_GRID')){
    const proof={phase:'B401_REAL_180S_NATIVE_LIVE_GRID',
     nativeTick:n.tick,actualSampleTick:live.v.sampleNativeTick,
     originalSource:'25/17/26/0',
     activeCells:live.v.totalActiveCells,teamA:live.v.teamA,
     teamB:live.v.teamB,neutral:live.v.neutral,
     playerHudMatchesNative:true,officialWinner:'NONE',
     officialScoreable:0,physicsOrInkWrites:0};
    report.phases.push(proof);persist();
    console.log('B401_REAL_NATIVE_LIVE_GRID_HUD_PASS',JSON.stringify(proof));
   }
   const sourceRadar=await evalPage(`(() => {
    const s=window.__t21F3?.snapshot?.();
    const c=document.querySelector('#t21-f3-radar-canvas');
    const d=s?.b402NativeOriginalInkRadar;
    return {d,pageNativeTick:s?.tick,status:c?.dataset.t21B402SourceInk,
     drawFrames:Number(c?.dataset.sourceFrame),
     tick:Number(c?.dataset.t21B402NativeTick),
     a:Number(c?.dataset.t21B402RealADots),
     b:Number(c?.dataset.t21B402RealBDots),
     notScore:c?.dataset.t21B402NotTurfScore,
     originalSolids:c?.dataset.originalSourceSolids,
     originalLinks:c?.dataset.originalSourceNavigationLinks};
   })()`);
   if(!b390NativeRadarSampleConsistent(n.tick,sourceRadar))
       fail('B402_ACTUAL_NATIVE_RADAR_SOURCE_SAMPLES_INVALID',{
     tick:n.tick,sourceRadar});
   if(!report.phases.some(x=>x.phase==='B402_REAL_NATIVE_RADAR_SOURCE_PAINT')){
    const proof={phase:'B402_REAL_NATIVE_RADAR_SOURCE_PAINT',
     nativeTick:n.tick,sourceSampleTick:sourceRadar.d.nativeTick,
     observedOriginalSurfaces:17,realSampledTeamA:sourceRadar.a,
     realSampledTeamB:sourceRadar.b,
     noAreaFillOrInferredCoverage:true,officialWinner:'NONE',
     gameplayWrites:0,newGeometry:0};
    report.phases.push(proof);persist();
    console.log('B402_REAL_NATIVE_SOURCE_INK_RADAR_PASS',
     JSON.stringify(proof));
   }
   const sample={phase:'B390_REAL_20S_CHROME_CHECKPOINT',
    realNativeElapsedSeconds:Number(elapsed.toFixed(3)),tick:n.tick,
    originalHumanWeapon:n.b381RealNativeDodge.realWeapon,
    realHumanShots:n.shotsFired,changedHumanCells:n.b23HumanInkFeedback.humanChangedCells,
    realCpuShots:n.cpuSourceTurfShots,changedCpuCells:n.cpuImpactInkCellsChanged,
    genuineSevenCpuRejoined:n.cpu.physicalRejoins.length,
    nativeCpuRespawns:n.cpuRespawns,nativeCpuSplats:n.cpuSplats,
    nativeSplattedCpuIds:n.cpu.cpu.filter(a=>a.lifeState==='SPLATTED').map(a=>a.id),
    realOriginalReturnPending:n.cpu.sourcePatrol.respawnPendingCpuIds,
    nativeRespawns:n.humanRespawns,
    verifiedPreviousClears:n.b387RealRoundMilestones.realClearedLives,
    originalScoreable:n.sourceScoreablePromotions,
    // B403: age and draw count measured in this native browser checkpoint.
    originalInkRadarNativeAgeTicks:sourceRadar.pageNativeTick-
     sourceRadar.d.nativeTick,
    actualInkRadarDrawFrames:sourceRadar.drawFrames,
    // Recorded from the SAME real source round, not a simulated paint pass.
    originalCpuSightGate:n.b216RealNativePaintBackfill?
     {enabled:n.b216RealNativePaintBackfill.enabled,
      verifiedFrontAndAllyPaintSightChecks:
       n.b216RealNativePaintBackfill.verifiedFrontAndAllyPaintSightChecks,
      sourceBlockedTurfAimsRejected:
       n.b216RealNativePaintBackfill.sourceBlockedTurfAimsRejected,
      realBackfillAims:n.b216RealNativePaintBackfill.originalSourceBackfillAims,
      approvedReachedGoalShortRadiusAims:
       n.b216RealNativePaintBackfill.approvedReachedGoalShortRadiusAims,
      verifiedOwnCenterPatchAims:n.b180OriginalPatchAim?.
       ownedCenterWithTrueUnpaintedNeighborAims,
      verifiedOwnCenterBackfillAims:n.b216RealNativePaintBackfill.
       ownedCenterWithTrueUnpaintedNeighborAims}:null};
   report.phases.push(sample);persist();
   console.log('B390_REAL_20S_NATIVE_CHECKPOINT',JSON.stringify(sample));
   nextSample+=20;
   // CDP mouse event is real player input in the same render-driven world.
   if(n.player.hp>0&&elapsed<170&&
      await evalPage('document.pointerLockElement===document.querySelector("#app-canvas")')){
    await cmd('Input.dispatchMouseEvent',{
     type:'mousePressed',x:800,y:450,button:'left',clickCount:1});
    try{
     await until(async()=>{
      const r=original(await state(),'B390_REAL_HUMAN_MOUSE_HELD');
      return r.tick>=n.tick+12||r.matchState==='TIME_UP'?r:false;
     },90000);
    }finally{
     await cmd('Input.dispatchMouseEvent',{
      type:'mouseReleased',x:800,y:450,button:'left',clickCount:1});
    }
   }
  }
  prior=n;
 }
 if(p1OwnOnce&&!p1OwnDone)
  fail('P1_REQUIRED_OWN_REFILL_RESHOT_NOT_NATIVE_CONFIRMED');
 if(!final)fail('B390_REAL_180S_HOST_TIMEOUT',{
  wallMs:Date.now()-began,lastTick:prior.tick,
  secondsRemaining:prior.timeRemainingSeconds});
 if(!b390NativeCpuLifeAndOriginalReturnConsistent(
    final.cpu,final.cpuRespawns,final.cpuSplats)||final.shotsFired<37||
    final.cpuSourceTurfShots<1||
    final.b387RealRoundMilestones.realClearedLives!==1)
  fail('B390_REAL_CPU_PLAYER_180S_NOT_CONFIRMED',{
   realHumanShots:final.shotsFired,realCpuShots:final.cpuSourceTurfShots,
   physicalRejoins:final.cpu.physicalRejoins.length,
   realClearMemory:final.b387RealRoundMilestones});
 // Final native tick retains the last bounded genuinely live B401 read.
 // This is never a substitute for the separately verified B400 TIME_UP grid.
 const lastLive=final.b401NativeLiveSourceInk;
 if(lastLive?.status!=='LIVE_REGISTERED_SOURCE_ONLY'||
    lastLive.registeredSurfaces!==17||lastLive.sampleNativeTick<1||
    lastLive.sampleNativeTick>final.tick||lastLive.totalActiveCells<1||
    lastLive.teamA+lastLive.teamB+lastLive.neutral!==lastLive.totalActiveCells||
    lastLive.winner!=='NONE'||lastLive.gameplayWrites!==0||
    lastLive.officialTurfScore!==false)
  fail('B401_TRUE_180S_FINAL_LIVE_SOURCE_GRID_INVALID',{
   nativeTick:final.tick,lastLive});
 // Existing SOURCE battle has B214/B215/B216 opted in. The B75 default
 // browser smoke does NOT exercise that authority, so verify the actual
 // native 180s CPU paint sight gate in this already-existing Chrome run.
 // No new CPU shot, paint, native tick, map solid or player input.
 const gated=final.b216RealNativePaintBackfill;
 const checked=gated?.verifiedFrontAndAllyPaintSightChecks;
 const vetoed=gated?.sourceBlockedTurfAimsRejected;
 const acceptedSourceInk=final.cpuImpactInkCellsChanged;
 const shortReached=gated?.approvedReachedGoalShortRadiusAims;
 const ownPatch=final.b180OriginalPatchAim?.
  ownedCenterWithTrueUnpaintedNeighborAims;
 const ownBackfill=gated?.ownedCenterWithTrueUnpaintedNeighborAims;
 const valid=final.b214SustainedBattleInk?.enabled===true&&
   final.b215RealBattleAimPacing?.enabled===true&&
   gated?.enabled===true&&
   Number.isSafeInteger(checked)&&checked>0&&
   Number.isSafeInteger(vetoed)&&vetoed>=0&&vetoed<=checked&&
   Number.isSafeInteger(acceptedSourceInk)&&acceptedSourceInk>0&&
   Number.isSafeInteger(shortReached)&&shortReached>=0&&
   Number.isSafeInteger(gated.originalSourceBackfillAims)&&
   shortReached<=gated.originalSourceBackfillAims&&
   Number.isSafeInteger(ownPatch)&&ownPatch>=0&&
   ownPatch<=final.b180OriginalPatchAim.chosenRealUnpaintedSourcePatches&&
   Number.isSafeInteger(ownBackfill)&&ownBackfill>=0&&
   ownBackfill<=gated.originalSourceBackfillAims&&
   final.sourceScoreablePromotions===0;
 const strictNativePaintGate={
  phase:'B390_TRUE_180S_CPU_SOURCE_SHOT_LINE_OF_SIGHT',
  nativeTick:final.tick,realCpuShots:final.cpuSourceTurfShots,
  realChangedSourceCells:acceptedSourceInk,
  verifiedFrontAndAllyPaintSightChecks:checked??null,
  actualSourceBlockedTurfAimsRejected:vetoed??null,
  originalFloorBackfillSightChecks:gated?.realRapierStageAimChecks??null,
  originalSourceBackfillAims:gated?.originalSourceBackfillAims??null,
  approvedReachedGoalShortRadiusAims:shortReached??null,
  verifiedOwnCenterPatchAims:ownPatch??null,
  verifiedOwnCenterBackfillAims:ownBackfill??null,
  enabled:gated?.enabled??false,valid,
  artificialShots:0,artificialPaint:0,syntheticGround:0,
  navLinksAdded:0,originalSourceScoreable:0,productionAuthorized:false
 };
 report.phases.push(strictNativePaintGate);persist();
 console.log('B390_REAL_NATIVE_CPU_SOURCE_LINE_OF_SIGHT',
  JSON.stringify(strictNativePaintGate));
 // Historical independently completed B395 180s same kit/route:
 // SHA 6cb1a3ff; 745 true CPU shots / 17,388 real changed source cells.
 // NOT a paired A/B experiment, and no such threshold grants source authority.
 const historicalReference={sha:'6cb1a3ff1318e931e67b2104edb57fc3bd7aeb27',
  actualCpuShots:745,changedOriginalSourceCells:17388};
 const currentComparison={phase:'B390_HISTORICAL_NATIVE_CPU_PAINT_COMPARISON',
  historicalReference,
  currentRealCpuShots:final.cpuSourceTurfShots,
  currentChangedOriginalSourceCells:acceptedSourceInk,
  shotDelta:final.cpuSourceTurfShots-historicalReference.actualCpuShots,
  sourceCellDelta:acceptedSourceInk-historicalReference.changedOriginalSourceCells,
  causalAttributionCertified:false,officialTurfScoreCertified:false};
 report.phases.push(currentComparison);persist();
 console.log('B390_HISTORICAL_NATIVE_CPU_PAINT_COMPARISON',
  JSON.stringify(currentComparison));
 if(!valid)fail('B390_REAL_CPU_ORIGINAL_PAINT_GATE_NOT_MEASURED',
  strictNativePaintGate);
 const endUi=await until(async()=>{
  const u=await evalPage('(() => {const s=window.__t21F3.snapshot(),f=document.querySelector("#t21-f3-b59-session-finished"),r=document.querySelector("#t21-f3-b59-restart"),c=document.querySelector("#t21-f3-b205-real-round");return {finished:!!f&&!f.hidden&&f.dataset.t21B59State==="FINISHED",replay:!!r&&!r.hidden&&!r.disabled,replayTitle:r?.textContent,clock:c?.dataset.t21B205RealClock,phase:c?.dataset.t21B205NativePhase,winner:f?.dataset.t21B59OriginalWinner,score:f?.dataset.originalScoreable,shownHumanInk:Number(f?.dataset.t21B59HumanInk),actualHumanInk:s.b23HumanInkFeedback.humanChangedCells,actualCpuRejoined:s.cpu.physicalRejoins.length,shownCpuRejoined:Number(f?.dataset.t21B59CpuRejoined),verifiedClears:Number(f?.dataset.b387VerifiedClears),recap:f?.querySelector("#t21-f3-b59-final-stats")?.textContent,paused:s.paused,pointerUnlocked:document.pointerLockElement===null}})()');
  return u?.finished&&u.replay&&u.clock==='00:00'&&u.phase==='COMPLETE'&&
   u.winner==='NONE'&&u.score==='0'&&
   u.actualHumanInk===u.shownHumanInk&&
   u.actualCpuRejoined===u.shownCpuRejoined&&
   u.verifiedClears===1&&u.recap?.includes('ROUND VERIFIED CLEARS 1')&&
   u.replayTitle?.includes('REPLAY SAME WEAPON')&&
   u.pointerUnlocked&&u.paused?u:false;
 },30000);
 // B395: the native F-key twin-sub round is the real acceptance path:
 // the B210 default round may finish with no player sub-weapon activity.
 // Compare B41's post-PaintCoordinator cumulative bomb ledger against
 // the actual end-screen DOM; never require positive paint from a real
 // source stamp because previously painted ownership can change 0 cells.
 const b395RealEnd=await until(async()=>{
  const u=await evalPage(`(()=>{
   const s=window.__t21F3?.snapshot?.(),
    f=document.querySelector('#t21-f3-b59-session-finished'),
    p=f?.querySelector('#t21-f3-b59-final-stats')?.textContent??'',
    x=s?.b23HumanInkFeedback;
   return {phase:s?.matchState,source:x?.source,
    originalOnly:x?.originalSourceOnly,scoreable:x?.scoreablePromotionCount,
    humanExplosions:s?.b38HumanSub?.explosions,
    b41Explosions:x?.humanBombExplosionsObserved,
    stamps:x?.humanBombStampEvents,changedEvents:x?.humanBombChangedEvents,
    zeroChangedStamps:x?.humanBombZeroChangedEvents,
    changedCells:x?.humanBombChangedCells,
    hudExplosions:f?.dataset.t21B395BombExplosions,
    hudStamps:f?.dataset.t21B395BombStamps,
    hudCells:f?.dataset.t21B395BombCells,
    hudGameWrites:f?.dataset.t21B395GameplayWrites,
    hudScoreable:f?.dataset.t21B395Scoreable,
    hudCpuHit:f?.dataset.t21B395CpuHitCertified,recap:p};
  })()`);
  const ints=[u?.humanExplosions,u?.b41Explosions,u?.stamps,
   u?.changedEvents,u?.zeroChangedStamps,u?.changedCells];
  if(u?.phase!=='TIME_UP'||
     u.source!=='REAL_HUMAN_ORIGINAL_PAINT_EVENT'||
     u.originalOnly!==true||u.scoreable!==0||
     ints.some(x=>!Number.isSafeInteger(x)||x<0)||
     u.humanExplosions<2||u.b41Explosions!==u.humanExplosions||
     u.stamps!==u.changedEvents+u.zeroChangedStamps||
     u.changedCells<u.changedEvents||
     u.hudExplosions!==String(u.b41Explosions)||
     u.hudStamps!==String(u.stamps)||
     u.hudCells!==String(u.changedCells)||
     u.hudGameWrites!=='0'||u.hudScoreable!=='0'||
     u.hudCpuHit!=='false'||!u.recap.includes(
      'HUMAN SUB · '+u.b41Explosions+' native bursts · '+
      u.stamps+' source stamps · '+u.changedCells+' changed original cells'))
   return false;
  return u;
 },30000);
 // B400: one actual 180s finished SOURCE ownerGrid readback.
 // This is NOT a Turf percentage: only 17 registered ink grids are known.
 const originalGrid=await until(async()=>{
  const result=await evalPage(`(() => {
   const s=window.__t21F3?.snapshot?.();
   const root=document.querySelector('#t21-f3-b59-session-finished');
   const panel=document.querySelector('#t21-f3-b400-source-grid-recap');
   const grid=s?.b400RegisteredSourceGrid;
   return {phase:s?.matchState,source:[
     s?.originalSourceSolids,s?.originalPaintSurfaces,
     s?.originalSourceNavigationLinks,s?.sourceScoreablePromotions],
    originalWinner:root?.dataset.t21B59OriginalWinner,
    actual:grid,view:{
     status:root?.dataset.t21B400Status,
     source:root?.dataset.t21B400SourceOnly,
     notTurf:root?.dataset.t21B400NotTurfScore,
     total:Number(root?.dataset.t21B400OriginalGridCells),
     a:Number(root?.dataset.t21B400TeamACells),
     b:Number(root?.dataset.t21B400TeamBCells),
     neutral:Number(root?.dataset.t21B400NeutralCells),
     visible:!!panel&&!panel.hidden,
     label:panel?.textContent
    }};
  })()`);
  const g=result?.actual,v=result?.view;
  return result?.phase==='TIME_UP'&&
   result.source.join('/')==='25/17/26/0'&&
   result.originalWinner==='NONE'&&
   g?.status==='FINAL_REGISTERED_SOURCE_ONLY'&&
   g.observedSurfaces===17&&g.activeOriginalGridCells>0&&
   g.teamACells+g.teamBCells+g.neutralCells===g.activeOriginalGridCells&&
   g.scoreableCells===0&&g.winner==='NONE'&&g.gameplayWrites===0&&
   g.countsAreNotOfficialTurfArea===true&&
   g.productionAuthorized===false&&v?.visible===true&&
   v.status===g.status&&v.source==='true'&&v.notTurf==='true'&&
   v.total===g.activeOriginalGridCells&&v.a===g.teamACells&&
   v.b===g.teamBCells&&v.neutral===g.neutralCells&&
   v.label.includes('NOT A TURF SCORE')&&
   v.label.includes('TEAM A')&&v.label.includes('TEAM B')&&
   v.label.includes('NEUTRAL')?result:false;
 },30000);
 report.phases.push({
  phase:'B400_GENUINE_FINAL_17_SOURCE_GRID_OWNERSHIP',
  nativeTimeUp:true,originalSource:'25/17/26/0',
  realRegisteredCells:originalGrid.actual.activeOriginalGridCells,
  teamA:originalGrid.actual.teamACells,
  teamB:originalGrid.actual.teamBCells,
  neutral:originalGrid.actual.neutralCells,
  actualFinalDomMatches:true,officialWinner:'NONE',
  sourceScoreable:0,nativeGameplayWrites:0
 });
 persist();
 console.log('B400_NATIVE_180S_END_SCREEN_SOURCE_GRID_PASS',
  JSON.stringify(report.phases.at(-1)));
 report.phases.push({
  phase:'B395_REAL_180S_HUMAN_SUB_SOURCE_PAINT_FINAL_RECAP',
  source:'25/17/26/0',
  nativeExplosions:b395RealEnd.b41Explosions,
  realOriginalPaintStamps:b395RealEnd.stamps,
  changedOriginalCells:b395RealEnd.changedCells,
  zeroChangedOriginalStamps:b395RealEnd.zeroChangedStamps,
  exactNativeToPlayerEndDom:true,
  sourceScoreable:0,cpuHitCertified:false,gameplayWrites:0
 });
 persist();
 console.log('B395_REAL_180S_HUMAN_SUB_RESULT',
  JSON.stringify(report.phases.at(-1)));
 const terminal={phase:'B390_GENUINE_180S_TIME_UP',
  realNativeTick:final.tick,realElapsedNativeSeconds:180,
  humanShots:final.shotsFired,humanSourceInk:final.b23HumanInkFeedback.humanChangedCells,
  cpuSourceShots:final.cpuSourceTurfShots,
  cpuSourceInk:final.cpuImpactInkCellsChanged,
  cpuOriginalSightGateChecks:strictNativePaintGate.verifiedFrontAndAllyPaintSightChecks,
  cpuOriginalSourceCoverVetoes:strictNativePaintGate.actualSourceBlockedTurfAimsRejected,
  approvedReachedGoalShortRadiusAims:
   strictNativePaintGate.approvedReachedGoalShortRadiusAims,
  verifiedOwnCenterPatchAims:strictNativePaintGate.verifiedOwnCenterPatchAims,
  verifiedOwnCenterBackfillAims:strictNativePaintGate.verifiedOwnCenterBackfillAims,
  nativeCpuRejoins:final.cpu.physicalRejoins.length,
  nativeCpuRespawns:final.cpuRespawns,
  authenticOriginalReturnPending:final.cpu.sourcePatrol.respawnPendingCpuIds,
  nativeHumanRespawns:final.humanRespawns,
  realMissionClearedLives:final.b387RealRoundMilestones.realClearedLives,
  originalWinner:'NONE',scoreable:0,endUi,
  noInjectedTimeOrActors:true};
 report.phases.push(terminal);persist();
 console.log('B390_TRUE_NATIVE_180S_TIME_UP',JSON.stringify(terminal));
 await picture('b390-true-native-180s-source-timeup');
 const oldOrigin=await evalPage('performance.timeOrigin');
 await clickButton('#t21-f3-b59-restart');
 const replay=await until(async()=>{
  const p=await evalPage('(() => {const s=window.__t21F3?.snapshot?.(),c=document.querySelector("#app-canvas"),w=document.querySelector("#t21-f3-b378-weapon");return s?{origin:performance.timeOrigin,search:location.search,ready:c?.dataset.t21F3Ready,game:s.matchState,paused:s.paused,tick:s.tick,remaining:s.timeRemainingSeconds,stage:[s.originalSourceSolids,s.originalPaintSurfaces,s.originalSourceNavigationLinks,s.sourceScoreablePromotions],weapon:s.b381RealNativeDodge.realWeapon,select:w?.value,proof:w?.dataset.b389NativeReplayKit,shots:s.shotsFired,humanPaint:s.b23HumanInkFeedback.humanChangedCells,cpuShots:s.cpuSourceTurfShots,cpuRejoins:s.cpu.physicalRejoins.length,missionClears:s.b387RealRoundMilestones?.realClearedLives,winner:s.b186RealOriginalHumanCircuit?.officialWinner,radarCanvasPresent:!!document.querySelector("#t21-f3-radar-canvas"),radarSourceInkStatus:s.b402NativeOriginalInkRadar?.status??"OFF",radarPaintStatus:document.querySelector("#t21-f3-radar-canvas")?.dataset.t21B402SourceInk??"OFF",radarPaintTick:Number(document.querySelector("#t21-f3-radar-canvas")?.dataset.t21B402NativeTick??-1),radarADots:Number(document.querySelector("#t21-f3-radar-canvas")?.dataset.t21B402RealADots??0),radarBDots:Number(document.querySelector("#t21-f3-radar-canvas")?.dataset.t21B402RealBDots??0)}:null})()');
  return p?.origin>oldOrigin&&p.search.endsWith('&t21W10B389=twin-comets')&&
   p.ready==='READY'&&p.game==='STAGING'&&p.paused&&
   p.tick===0&&p.remaining===180&&p.stage.join(',')==='25,17,26,0'&&
   p.weapon==='twin-comets'&&p.select==='twin-comets'&&
   p.proof==='VERIFIED_PREGAME_SELECTION'&&
   p.shots===0&&p.humanPaint===0&&p.cpuShots===0&&
   p.cpuRejoins===0&&p.missionClears===0&&p.winner==='NONE'&&
   // Genuine replay must not expose previous-match source ownerGrid ink.
   p.radarCanvasPresent&&p.radarSourceInkStatus==='OFF'&&
   p.radarPaintStatus==='OFF'&&p.radarPaintTick<=0&&
   p.radarADots===0&&p.radarBDots===0?p:false;
 },120000);
 report.phases.push({phase:'B390_REAL_USER_TIMEUP_CLICK_NEW_WORLD',
  ...replay,gameStateInherited:false,realUserClick:true});persist();
 console.log('B390_REAL_TIMEUP_REPLAY',JSON.stringify(replay));
 await picture('b390-real-same-kit-new-180s-ready');
 report.outcome='PASS_B390_TRUE_12_WEAPON_180S_TIMEUP_AND_REPLAY';
 report.note='True native 180s after original 3/3, final 7 CPU, user-clicked TIME_UP same-kit replay. Natural opponent routes, original score, official 4v4 and production HOLD.';
 persist();
 return {terminal,replay};
}
