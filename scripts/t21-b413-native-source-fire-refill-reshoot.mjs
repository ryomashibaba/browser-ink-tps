import {b408ChooseActiveOriginalCell,b408NativeMouseAligned}
 from './t21-b408-native-original-active-aim.mjs';
/** B413 — authentic human SOURCE shot consumption -> actual OWN-ink squid
 * refill -> human re-shot in ONE B412 real 180-second Chromium game.
 * CDP input + read-only native PlayerResources and original ledger ONLY.
 * Never write actors, PlayerResources, ownerGrid, clock, score or stage.
 */
const error=name=>{throw Error('B413_NATIVE_ORIGINAL_INK_ECONOMY_HOLD_'+name);};
const need=(v,name)=>{if(!v)error(name)};
const num=x=>typeof x==='number'&&Number.isFinite(x);
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const v3=x=>Array.isArray(x)&&x.length===3&&x.every(num);
const SOURCE='25/17/26/0';
const FLOOR='UndertowT21D:right-low-team-a';
const SURFACE=FLOOR+':paint';
function actual(n){
 return {tick:n.tick,time:n.timeRemainingSeconds,phase:n.matchState,
  paused:n.paused,stopReason:n.stopReason,
  body:n.player?.position,mode:n.player?.mode,
  relation:n.player?.inkRelation,ink:n.player?.ink,
  inkRecovery:n.playerInkRecoveryState,shots:n.shotsFired,
  original:[n.originalSourceSolids,n.originalPaintSurfaces,
   n.originalSourceNavigationLinks,n.sourceScoreablePromotions].join('/'),
  cpuRejoined:n.cpu?.physicalRejoins?.length,
  cpuPhysicalRelocations:n.cpu?.physicalFootRelocations,
  sourceOfficialWinner:n.b25SourcePaintRun?.officialWinner};
}
function native(a,mode='HUMAN'){
 need(a?.phase==='PLAYING'&&a.paused===false&&a.stopReason===null&&
  a.original===SOURCE&&a.cpuRejoined===7&&a.cpuPhysicalRelocations===0&&
  num(a.time)&&a.time>60&&a.time<=90.01&&
  v3(a.body)&&nat(a.tick)&&nat(a.shots)&&num(a.ink)&&
  a.ink>=0&&a.ink<=100.001&&a.mode===mode&&
  a.sourceOfficialWinner==='NONE'&&
  ['NONE','OWN','ENEMY','NEUTRAL'].includes(a.relation),
  'TRUE_25_17_26_0_7CPU_ACTIVE_'+mode);
}
export function b413ObserveNativeRefill(trace,snapshot){
 if(!trace||!Array.isArray(trace.samples))error('READ_ONLY_TRACE');
 const x=actual(snapshot);
 native(x,snapshot.player.mode);
 const last=trace.samples.at(-1);
 if(last&&last.tick===x.tick)return x;
 need(!last||x.tick>last.tick,'NATIVE_CHRONOLOGY');
 trace.samples.push(x);
 // 60Hz real native source movement < 15seconds. Never manufacture
 // synthetic intermediate samples, nor extrapolate recovery from speed.
 need(trace.samples.length<=350,'UNBOUNDED_NATIVE_FRAME_SAMPLES');
 return x;
}
const foot=async ledger=>{
 const g=await ledger();
 need(g?.source===SOURCE&&g.realHumanOriginalFootSupported===true&&
  g.genuineHumanOriginalFootSolid===FLOOR&&
  num(g.genuineOriginalFootGapMeters)&&
  g.genuineOriginalFootGapMeters>=0&&g.genuineOriginalFootGapMeters<=.4&&
  g.sourceActorRelocations===0&&g.sourceInkRewritten===false&&
  g.playerPositionRewritten===false,
  'TRUE_ORIGINAL_UPPER_FOOT_AND_NO_WRITES');
 return g;
};
// Read the PaintCoordinator ledger FIRST, and the current native-player
// snapshot SECOND. Both are read-only. A prior B415 run had a real impact
// at tick 6596 but the player snapshot used for the <=after.tick check was
// captured at tick 6593, an invalid cross-source observation order.
export async function b413ReadPostFireNativeSource({snapshot,ledger,verify}){
 need([snapshot,ledger,verify].every(fn=>typeof fn==='function'),
  'READ_ONLY_NATIVE_SNAPSHOT_REQUIRED');
 const ground=await foot(ledger);
 const after=actual(verify(await snapshot()));
 need(nat(after.tick)&&
  (!nat(ground.lastHumanOriginalImpactPaintTick)||
   ground.lastHumanOriginalImpactPaintTick<=after.tick),
  'READ_ONLY_CONTACT_TICK_AHEAD_OF_NATIVE_SNAPSHOT');
 return {after,ground};
}
export async function b413RealOriginalMainFireBurst({
 phase,send,snapshot,ledger,verify,locked,wait,
 onEvidence=async()=>{}
}){
 need(['BEFORE_SQUID','AFTER_SQUID'].includes(phase)&&
  [send,snapshot,ledger,verify,locked,wait,onEvidence].every(
   fn=>typeof fn==='function'),
  'CDP_AUTHENTIC_INPUT_REQUIRED');
 const first=verify(await snapshot());
 native(actual(first));await foot(ledger);
 need(await locked(),'GENUINE_POINTER_LOCK_REQUIRED');
 // B413 can happen many native seconds after B410's previous shot, and
 // B412 moves the real human. Reusing an OLD x/y does NOT prove impact.
 // The existing B408 planner reads current original 17-surface ownerGrid
 // and ACTUAL PlayCanvas camera; it never authors any aim or paint cell.
 await send('Input.dispatchMouseEvent',{
  type:'mouseMoved',x:800,y:450,button:'none'
 });
 const liveFrame=verify(await snapshot());
 const liveGround=await foot(ledger);
 const aim=b408ChooseActiveOriginalCell(liveGround,liveFrame,FLOOR);
 need(aim?.source===SOURCE&&aim.surfaceId===SURFACE&&
  Array.isArray(aim.cdp)&&aim.cdp.length===2&&
  aim.cdp.every(num)&&aim.cdp[0]>=10&&aim.cdp[0]<=1590&&
  aim.cdp[1]>=10&&aim.cdp[1]<=890&&
  aim.simulatedInput===false&&aim.paintWrites===0&&
  aim.actorRelocations===0&&aim.scoreable===0,
  'NO_ACTUAL_LIVE_ORIGINAL_SOURCE_AIM_'+phase);
 await send('Input.dispatchMouseEvent',{
  type:'mouseMoved',x:aim.cdp[0],y:aim.cdp[1],button:'none'
 });
 const observedCamera=await wait(async()=>{
  const n=verify(await snapshot());
  return b408NativeMouseAligned(aim,n.cameraSourcePractice)?
   n.cameraSourcePractice:false;
 },30000);
 const before=actual(verify(await snapshot()));
 native(before);
 const beforeGround=await foot(ledger);
 need(nat(beforeGround.humanOriginalImpactPaintEvents),
  'TRUE_ACCEPTED_ORIGINAL_IMPACT_BASELINE_'+phase);
 const ticks=phase==='BEFORE_SQUID'?78:54;
 await onEvidence({phase,stage:'REAL_ORIGINAL_NATIVE_CAMERA_ALIGNED',
  before,aim,observedCamera,readOnly:true});
 await send('Input.dispatchMouseEvent',{
  type:'mousePressed',x:aim.cdp[0],y:aim.cdp[1],
  button:'left',clickCount:1
 });
 try{
  await wait(async()=>{
   const n=actual(verify(await snapshot()));
   return n.tick>=before.tick+ticks?n:false;
  },30000);
 }finally{
  await send('Input.dispatchMouseEvent',{
   type:'mouseReleased',x:aim.cdp[0],y:aim.cdp[1],
   button:'left',clickCount:1
  });
 }
 const {after,ground}=await b413ReadPostFireNativeSource({snapshot,ledger,verify});
 const contactsBefore=beforeGround.humanOriginalImpactPaintEvents;
 const contactsAfter=ground.humanOriginalImpactPaintEvents;
 const acceptedImpactTick=ground.lastHumanOriginalImpactPaintTick;
 const acceptedImpactSurface=ground.lastHumanOriginalImpactPaintSurface;
 await onEvidence({phase,stage:'REAL_NATIVE_MAIN_FIRE_OBSERVED',
  before,after,aim,observedCamera,
  originalLastImpactSurface:ground.humanLastPaintedSurface,
  originalLastImpactTick:ground.humanLastImpactTick,
  acceptedOriginalContactSurface:acceptedImpactSurface,
  acceptedOriginalContactTick:acceptedImpactTick,
  acceptedOriginalContactsBefore:contactsBefore,
  acceptedOriginalContactsAfter:contactsAfter,
  acceptedOriginalContactChangedCells:ground.lastHumanOriginalImpactPaintChangedCells,
  genuineSupportedFoot:ground.genuineHumanOriginalFootSolid,
  genuineFootGap:ground.genuineOriginalFootGapMeters,
  readOnly:true});
 native(after);
 need(after.tick>=before.tick+ticks&&
  after.shots>=before.shots+5&&
  after.ink<=before.ink-4&&
  before.ink-after.ink<=45&&
  after.inkRecovery==='LOCKED'&&
  await locked(),
  'TRUE_SHOT_COST_PAID_NOT_FAKE_INK_DEPLETION_'+phase);
 // The B23 lastImpactTick only advances when OWNERSHIP cells change.
 // Demand a NEW accepted native PaintCoordinator projectile contact.
 need(nat(contactsAfter)&&contactsAfter>contactsBefore&&
  acceptedImpactSurface===SURFACE&&nat(acceptedImpactTick)&&
  acceptedImpactTick>before.tick&&acceptedImpactTick<=after.tick&&
  nat(ground.lastHumanOriginalImpactPaintChangedCells),
  'TRUE_ACCEPTED_ORIGINAL_UPPER_PROJECTILE_IMPACT_'+phase);
 return {phase,before,after,aim,observedCamera,
  actualCdpMouse:[...aim.cdp],
  liveCdP:true,source:SOURCE,
  actualOriginalImpactSurface:acceptedImpactSurface,
  actualOriginalImpactTick:acceptedImpactTick,
  actualOriginalImpactEvents:contactsAfter-contactsBefore,
  actualOriginalImpactEventsBefore:contactsBefore,
  actualOriginalImpactEventsAfter:contactsAfter,
  actualOriginalImpactChangedCells:ground.lastHumanOriginalImpactPaintChangedCells,
  actualOriginalPaintCoordinatorReadOnly:true,
  sourceInkDifference:before.ink-after.ink,
  actualShotsPaid:after.shots-before.shots,
  syntheticShotWrites:false,syntheticInkWrites:false,
  syntheticClockWrites:false,physicalPlayerRelocation:false,
  actualOriginalUpperSupported:true};
}
export function b413AuditFullOriginalShotRefillReshot(trace,route,swim,ui,round){
 need(route?.verdict==='PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES'&&
  ui?.verdict==='PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY'&&
  swim?.verdict==='PASS_REAL_OWN_INK_SWIM_AND_HUMAN_REENTRY_IN_180S_SOURCE_MATCH'&&
  route.originalRoundTimeUpTick===ui.realGameTimeUpTick&&
  swim.actualNativeTimeUpTick===route.originalRoundTimeUpTick&&
  round?.samples?.at(-1)?.tick===route.originalRoundTimeUpTick&&
  round.samples.at(-1).matchState==='TIME_UP',
  'B409_B410_B411_B412_SAME_180S_SOURCE_PASS');
 need(trace?.schema==='B413_AUTHENTIC_ORIGINAL_INK_SPEND_OWN_REFILL_RESUME'&&
  trace.source===SOURCE&&trace.originalScoreable===0&&
  trace.officialWinner==='NONE'&&
  trace.syntheticResourceWrites===false&&
  trace.syntheticShotWrites===false&&
  trace.syntheticTimeWrites===false&&
  trace.syntheticActorWrites===false&&
  Array.isArray(trace.samples)&&trace.samples.length>=3,
  'REAL_NATIVE_SOURCE_TRACE_ONLY');
 const shots=[trace.pre,trace.post];
 for(let i=0;i<2;i++){
  const v=shots[i],label=i===0?'BEFORE_SQUID':'AFTER_SQUID';
  need(v?.phase===label&&v.source===SOURCE&&v.liveCdP===true&&
   v.syntheticShotWrites===false&&v.syntheticInkWrites===false&&
   v.syntheticClockWrites===false&&
   v.physicalPlayerRelocation===false&&
   v.actualOriginalUpperSupported===true&&
   v.aim?.schema==='B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM'&&
   v.aim.source===SOURCE&&v.aim.surfaceId===SURFACE&&
   v.aim.simulatedInput===false&&v.aim.paintWrites===0&&
   v.aim.actorRelocations===0&&v.aim.scoreable===0&&
   v.aim.actualPaintChangedCellsGuaranteed===false&&
   Array.isArray(v.actualCdpMouse)&&
   v.actualCdpMouse.length===2&&
   v.actualCdpMouse[0]===v.aim.cdp?.[0]&&
   v.actualCdpMouse[1]===v.aim.cdp?.[1]&&
   b408NativeMouseAligned(v.aim,v.observedCamera)&&
   v.actualOriginalImpactSurface===SURFACE&&
   v.actualOriginalPaintCoordinatorReadOnly===true&&
   nat(v.actualOriginalImpactEventsBefore)&&
   nat(v.actualOriginalImpactEventsAfter)&&
   nat(v.actualOriginalImpactEvents)&&
   v.actualOriginalImpactEvents>0&&
   v.actualOriginalImpactEvents===v.actualOriginalImpactEventsAfter-
    v.actualOriginalImpactEventsBefore&&
   nat(v.actualOriginalImpactChangedCells)&&
   nat(v.actualOriginalImpactTick)&&
   v.actualOriginalImpactTick>v.before?.tick&&
   v.actualOriginalImpactTick<=v.after?.tick&&
   v.after.shots-v.before.shots===v.actualShotsPaid&&
   v.actualShotsPaid>=5&&
   Math.abs(v.before.ink-v.after.ink-v.sourceInkDifference)<.0001&&
   v.sourceInkDifference>=4&&
   v.after.inkRecovery==='LOCKED'&&
   v.after.tick>v.before.tick,
   'REAL_PLAYER_SPENT_INK_ON_ORIGINAL_UPPER_'+label);
  native(v.before);native(v.after);
 }
 need(trace.pre.before.shots===round.samples.find(s=>s.label==='90')?.humanShots&&
  trace.pre.after.shots===trace.swimInitialShots&&
  trace.pre.after.tick<=trace.samples[0].tick&&
  trace.post.before.shots===trace.swimFinalShots&&
  trace.post.before.tick>=trace.samples.at(-1).tick&&
  trace.post.after.tick<round.samples.find(s=>s.label==='60').tick&&
  trace.post.after.shots<=round.samples.find(s=>s.label==='60').humanShots&&
  trace.pre.before.ink>trace.pre.after.ink&&
  trace.post.before.ink>trace.post.after.ink,
  'NATIVE_FIRE_REFILL_FIRE_SEQUENCE_ONE_GAME');
 let ownSamples=0,positiveOwnRecovery=0;
 let p=null;
 for(const current of trace.samples){
  native(current,current.mode);
  need(current.mode==='SQUID'||current.mode==='HUMAN','NATIVE_PLAYER_MODE');
  need(!p||current.tick>p.tick,'REAL_60HZ_TIME_ORDER');
  if(current.mode==='SQUID'&&current.relation==='OWN'&&
     current.inkRecovery==='SQUID_OWN'){
   ownSamples++;
   if(p&&p.mode==='SQUID'&&p.relation==='OWN'&&
      p.inkRecovery==='SQUID_OWN'&&current.ink>p.ink)
    positiveOwnRecovery+=current.ink-p.ink;
  }
  p=current;
 }
 need(ownSamples>=2&&positiveOwnRecovery>.25&&
  trace.pre.after.ink<100&&
  trace.post.before.ink>trace.pre.after.ink+.25,
  'GENUINE_OWN_SQUID_TANK_REFILL_NOT_HUMAN_IDLE');
 return {schema:'B413_INDEPENDENT_GENUINE_FIRE_REFILL_FIRE_180S',
  verdict:'PASS_REAL_ORIGINAL_SOURCE_SHOT_INK_CONSUMPTION_SQUID_OWN_RECOVERY_AND_RESHOT',
  source:SOURCE,preShots:trace.pre.actualShotsPaid,
  postShots:trace.post.actualShotsPaid,
  preNativeInkSpent:trace.pre.sourceInkDifference,
  genuineObservedSquidOwnInkGain:positiveOwnRecovery,
  postNativeInkSpent:trace.post.sourceInkDifference,
  genuineOriginalUpperImpactSurface:SURFACE,
  sourceScoreable:0,officialWinner:'NONE',
  full4v4Certified:false,artAccepted:false,productionAuthorized:false,
  trueTimeUpTick:route.originalRoundTimeUpTick};
}
