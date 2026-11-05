import {setTimeout as nativeSleep} from 'node:timers/promises';
/** B412: one real SOURCE squid dive/own-ink swim in the SAME B410 180s match.
 * Sends ONLY genuine CDP Shift+W/S native key events. No player/actor writes,
 * ink ownership writes, synthetic time, fake enemy, new geometry or Scoreable.
 */
const fail=s=>{throw Error('B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_'+s);};
const need=(p,s)=>{if(!p)fail(s);};
const is3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
// Exact real input codes from PlayerInput: no scripted axis or pose writes.
const KEY_META={
 ShiftLeft:{name:'Shift',vk:16},KeyW:{name:'w',vk:87},
 KeyS:{name:'s',vk:83},KeyA:{name:'a',vk:65},KeyD:{name:'d',vk:68}
};
const key=(code,type)=>({
 type,key:KEY_META[code]?.name,code,
 windowsVirtualKeyCode:KEY_META[code]?.vk,
 nativeVirtualKeyCode:KEY_META[code]?.vk
});
const planar=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
// The physical return acceptance remains <=0.95m. Stop CDP key pulses
// earlier at <=0.85m to avoid native inertia overshooting that same gate.
export function b412NativeReturnReady(position,initialPos){
 need(is3(position)&&is3(initialPos),'ACTUAL_RETURN_COORDINATES_REQUIRED');
 return planar(position,initialPos)<=.85;
}
/** Original W leg is a REAL KCC translation, so its observed horizontal
 * direction is a local estimate of the unchanged camera flat-forward.
 * PlayerController uses right=(-forward.z,forward.x). Choosing a genuine
 * KeyA/KeyD here corrects sideways miss without relaxing the 0.95m gate.
 * Never sets velocity, input axis, player position or source navigation. */
export function b412NativeReturnSteerKey(position,initialPos,realWDelta){
 need(is3(position)&&is3(initialPos)&&
  Array.isArray(realWDelta)&&realWDelta.length===2&&
  realWDelta.every(Number.isFinite),'REAL_NATIVE_STEERING_WITNESS');
 const len=Math.hypot(...realWDelta);
 need(len>.15,'NATIVE_FORWARD_LEG_TOO_SHORT_FOR_STEERING');
 const fx=realWDelta[0]/len,fz=realWDelta[1]/len;
 const dx=initialPos[0]-position[0],dz=initialPos[2]-position[2];
 const forward=dx*fx+dz*fz;
 const right=dx*(-fz)+dz*fx;
 const scores=[
  {code:'KeyW',score:forward},{code:'KeyS',score:-forward},
  {code:'KeyD',score:right},{code:'KeyA',score:-right}
 ];
 scores.sort((a,b)=>b.score-a.score);
 return scores[0].code;
}
/** True original-world W KCC only. A KeyA/KeyD lateral correction
 * cannot serve as the camera's physical flat-forward direction. */
export function b412ObservedNativeForwardW(legs){
 need(Array.isArray(legs)&&legs.length>=1&&legs.length<=22,
  'REAL_NATIVE_KEYW_LEGS_REQUIRED');
 const w=legs.filter(x=>x?.direction==='TOWARD_REAL_120S_PAINT'&&
  x.code==='KeyW').at(-1);
 need(w&&is3(w.from)&&is3(w.to)&&
  Number.isFinite(w.planarMeters)&&w.planarMeters>.15,
  'REAL_NATIVE_KEYW_CALIBRATION_REQUIRED');
 const delta=[w.to[0]-w.from[0],w.to[2]-w.from[2]];
 need(Math.hypot(...delta)>.15&&
  Math.abs(Math.hypot(...delta)-w.planarMeters)<.0001,
  'REAL_NATIVE_KEYW_DELTA_MISMATCH');
 return delta;
}
/** Real Shift-held, key-released SQUID OWN replenishment gate. */
export function b412OwnInkDwellVerified(before,after,foot,solid,shots){
 return before?.player?.mode==='SQUID'&&
  before.player.inkRelation==='OWN'&&
  after?.player?.mode==='SQUID'&&
  after.player.inkRelation==='OWN'&&
  after.playerInkRecoveryState==='SQUID_OWN'&&
  after.b381RealNativeDodge?.realLocomotion==='SWIM_GROUND'&&
  Number.isSafeInteger(before.tick)&&Number.isSafeInteger(after.tick)&&
  after.tick>=before.tick+6&&
  Number.isFinite(before.player.ink)&&Number.isFinite(after.player.ink)&&
  after.player.ink>before.player.ink+.25&&
  is3(before.player.position)&&is3(after.player.position)&&
  planar(before.player.position,after.player.position)<=.5&&
  after.matchState==='PLAYING'&&!after.paused&&!after.stopReason&&
  after.shotsFired===shots&&
  after.cpu?.physicalRejoins?.length===7&&
  after.cpu.physicalFootRelocations===0&&
  after.originalSourceSolids===25&&after.originalPaintSurfaces===17&&
  after.originalSourceNavigationLinks===26&&
  after.sourceScoreablePromotions===0&&
  foot?.source==='25/17/26/0'&&foot.realHumanOriginalFootSupported&&
  foot.genuineHumanOriginalFootSolid===solid&&
  Number.isFinite(foot.genuineOriginalFootGapMeters)&&
  foot.genuineOriginalFootGapMeters>=0&&
  foot.genuineOriginalFootGapMeters<=.4&&
  foot.sourceActorRelocations===0&&
  foot.sourceInkRewritten===false&&
  foot.playerPositionRewritten===false;
}
// B319-style native 35ms observation; the general B139 500ms wait
// overshoots a real SOURCE edge by dozens of 60Hz ticks.
async function nativeUntil(fn,limit=20000){
 const end=Date.now()+limit;
 while(Date.now()<end){
  const v=await fn();if(v)return v;
  await nativeSleep(35);
 }
 fail('REAL_CHROMIUM_NATIVE_WAIT_TIMEOUT');
}
export async function b412NativeSquidOwnInkRound({
 remaining,target,expectedFoot,snapshot,ledger,send,wait,verify,locked,
 onEvidence=async()=>{}
}){
 need(remaining===90,'TRUE_90S_SOURCE_WINDOW');
 need(is3(target)&&expectedFoot==='UndertowT21D:right-low-team-a',
  'TRUE_ORIGINAL_UPPER_PAINT_CELL');
 need([snapshot,ledger,send,wait,verify,locked].every(x=>typeof x==='function'),
  'REAL_NATIVE_CHROMIUM_BRIDGE_REQUIRED');
 const frame=async()=>verify(await snapshot());
 const f=await frame(),land=await ledger();
 need(f.matchState==='PLAYING'&&!f.paused&&!f.stopReason&&
  f.timeRemainingSeconds<=90.001&&f.timeRemainingSeconds>=86&&
  f.player.mode==='HUMAN'&&f.cpu.physicalRejoins.length===7&&
  f.cpu.physicalFootRelocations===0&&
  f.originalSourceSolids===25&&f.originalPaintSurfaces===17&&
  f.originalSourceNavigationLinks===26&&f.sourceScoreablePromotions===0&&
  land.source==='25/17/26/0'&&land.realHumanOriginalFootSupported&&
  land.genuineHumanOriginalFootSolid===expectedFoot&&
  is3(f.player.position)&&await locked(),
  'REAL_UPPER_ORIGINAL_HUMAN_START');
 const initialInk=f.player.inkRelation;
 const initialPos=f.player.position,shots=f.shotsFired;
 const evidence={schema:'B412_TRUE_NATIVE_SQUID_OWN_INK_ON_ORIGINAL_UPPER',
  source:'25/17/26/0',nativeCDP:true,syntheticPlayerMoves:false,
  syntheticTickWrites:false,syntheticInkWrites:false,
  sourceScoreable:0,officialWinner:'NONE',remaining,
  originalFoot:expectedFoot,target,initial:{
   tick:f.tick,body:initialPos,mode:f.player.mode,ink:initialInk,
   humanShots:shots,cpuRejoined:7},legs:[],swimObserved:false};
 const record=async(phase)=>{evidence.lastPhase=phase;await onEvidence(evidence);};
 await record('REAL_ORIGINAL_HUMAN_BEFORE_SHIFT');
 const nativeLeg=async(code,direction)=>{
  const before=await frame();
  need(before.matchState==='PLAYING'&&!before.paused&&await locked()&&
   is3(before.player.position),'NATIVE_KEY_BEFORE_'+direction);
  await send('Input.dispatchKeyEvent',key(code,'keyDown'));
  try{
   await nativeUntil(async()=>{
    const n=await frame();
    return n.tick>=before.tick+
     (direction==='TOWARD_REAL_120S_PAINT'?8:3)?n:false;
   },20000);
  }finally{await send('Input.dispatchKeyEvent',key(code,'keyUp'));}
  const after=await frame(),ground=await ledger();
  const distance=planar(before.player.position,after.player.position);
  const realTickMin=direction==='TOWARD_REAL_120S_PAINT'?8:3;
  const realNativeSupported=after.tick>=before.tick+realTickMin&&after.matchState==='PLAYING'&&
   !after.paused&&after.player.mode==='SQUID'&&
   ['SWIM_GROUND','SQUID_DRY'].includes(
    after.b381RealNativeDodge?.realLocomotion)&&
   ground.source==='25/17/26/0'&&
   ground.realHumanOriginalFootSupported===true&&
   ground.genuineHumanOriginalFootSolid===expectedFoot&&
   Number.isFinite(ground.genuineOriginalFootGapMeters)&&
   ground.genuineOriginalFootGapMeters>=0&&
   ground.genuineOriginalFootGapMeters<=.4&&
   is3(after.player.position)&&distance<=3&&
   after.cpu.physicalFootRelocations===0&&
   after.cpu.physicalRejoins.length===7&&
   after.shotsFired===shots&&await locked();
  if(!realNativeSupported){
   evidence.hold={stage:direction,code,
    before:{tick:before.tick,body:before.player.position,mode:before.player.mode,
     inkRelation:before.player.inkRelation,shots:before.shotsFired},
    after:{tick:after.tick,body:after.player.position,mode:after.player.mode,
     locomotion:after.b381RealNativeDodge?.realLocomotion,
     inkRelation:after.player.inkRelation,shots:after.shotsFired,
     gameState:after.matchState,cpuRejoined:after.cpu.physicalRejoins.length,
     cpuRelocations:after.cpu.physicalFootRelocations},
    ground:{solid:ground.genuineHumanOriginalFootSolid,
     supported:ground.realHumanOriginalFootSupported,
     gap:ground.genuineOriginalFootGapMeters,source:ground.source},
    planarMeters:distance,pointerLocked:await locked()};
   await record('PHYSICAL_SOURCE_HOLD_'+direction);
   fail('REAL_SQUID_KCC_SOURCE_AND_NO_FIRE_'+direction);
  }
  const row={direction,code,fromTick:before.tick,toTick:after.tick,
   from:before.player.position,to:after.player.position,
   planarMeters:distance,mode:after.player.mode,
   locomotion:after.b381RealNativeDodge.realLocomotion,
   inkRelation:after.player.inkRelation,
   originalFoot:ground.genuineHumanOriginalFootSolid,
   originalSupport:ground.realHumanOriginalFootSupported,
   genuineGap:ground.genuineOriginalFootGapMeters,
   humanShots:after.shotsFired,cpuRejoined:after.cpu.physicalRejoins.length};
  evidence.legs.push(row);
  await record('GENUINE_NATIVE_LEG_'+direction+'_'+evidence.legs.length);
  if(row.locomotion==='SWIM_GROUND'&&row.inkRelation==='OWN')
   evidence.swimObserved=true;
  await record('REAL_OWNERGRID_INK_SWIM_WITNESSED');
  return row;
 };
 await send('Input.dispatchKeyEvent',key('ShiftLeft','keyDown'));
 try{
  const n=await nativeUntil(async()=>{
   const x=await frame();
   return x.tick>=f.tick+5&&x.player.mode==='SQUID'?
    x:false;
  },20000);
  need(n.b381RealNativeDodge?.realLocomotion==='SQUID_DRY'||
   n.b381RealNativeDodge?.realLocomotion==='SWIM_GROUND',
   'ACTUAL_NATIVE_SQUID_COLLIDER_MODE');
  evidence.actualSqModeTick=n.tick;
  await record('REAL_RAPIER_SQUID_COLLIDER');
  // Actual B413 aim can face AWAY from the B410 previously painted cell.
  // RAW artifact 13377715385: five genuine W legs moved >5m in the
  // opposite direction, while every original Rapier floor remained safe.
  // Calibrate real flat-forward from a native W KCC leg in THIS world.
  // Then use real WASD to approach only the pre-certified SOURCE cell.
  const calibration=await nativeLeg('KeyW','TOWARD_REAL_120S_PAINT');
  const actualW=[
   calibration.to[0]-calibration.from[0],
   calibration.to[2]-calibration.from[2]
  ];
  need(Math.hypot(...actualW)>.15,
   'REAL_ORIGINAL_FORWARD_CALIBRATION_REQUIRED');
  evidence.outboundForwardWDelta=actualW;
  await record('REAL_SOURCE_FORWARD_CALIBRATED_FOR_PAINT_TARGET');
  for(let i=1;i<10;i++){
   const now=await frame();
   if(evidence.swimObserved&&evidence.legs.some(x=>x.planarMeters>.15))
    break;
   if(planar(now.player.position,initialPos)>5.0){
    evidence.hold={stage:'PAINT_TARGET_APPROACH_SOURCE_PERIMETER',
     body:now.player.position,original:initialPos,target,
     actualDistanceToTargetMeters:planar(now.player.position,target),
     noActorRelocations:true};
    await record('HOLD_ORIGINAL_PAINT_TARGET_REACHABILITY');
    fail('TRUE_ORIGINAL_SQUID_NO_SAFE_EXTENDED_MOVE');
   }
   const direction=b412NativeReturnSteerKey(
    now.player.position,target,actualW);
   await nativeLeg(direction,'TOWARD_REAL_120S_PAINT');
  }
  need(evidence.swimObserved,
   'REAL_OWN_PAINT_SWIM_GROUND_NOT_OBSERVED');
  const peak=await frame();
  evidence.peakBody=peak.player.position;
  evidence.peakRelation=peak.player.inkRelation;
  await record('REAL_OWN_INK_SWIM_PEAK_BEFORE_RETURN');
  // RAW #13395157849: true OWN/SWIM_GROUND at tick6624, but
  // immediate native KeyS returned off OWN by tick6630. Complete
  // real 60Hz refilling before physical steering back; no fake ink.
  const dwellBefore=await frame();
  const dwellAfter=await nativeUntil(async()=>{
   const n=await frame();
   return n.tick>=dwellBefore.tick+8?n:false;
  },20000);
  const dwellFoot=await ledger();
  const refill=b412OwnInkDwellVerified(
   dwellBefore,dwellAfter,dwellFoot,expectedFoot,shots)&&await locked();
  evidence.ownDwell={
   action:'SHIFT_HELD_NO_DIRECTION_KEY',beforeTick:dwellBefore.tick,
   afterTick:dwellAfter.tick,inkBefore:dwellBefore.player.ink,
   inkAfter:dwellAfter.player.ink,
   relationBefore:dwellBefore.player.inkRelation,
   relationAfter:dwellAfter.player.inkRelation,
   recoveryAfter:dwellAfter.playerInkRecoveryState,
   realKccDriftMeters:planar(
    dwellBefore.player.position,dwellAfter.player.position),
   originalFoot:dwellFoot.genuineHumanOriginalFootSolid,
   sourceSupported:dwellFoot.realHumanOriginalFootSupported,
   syntheticInkWrites:0,actorWrites:0,nativeClockWrites:0,
   physicallyVerified:refill};
  await record(refill?'REAL_OWN_SQUID_REFILL_BEFORE_RETURN':
   'HOLD_REAL_SQUID_OWN_REFILL_BEFORE_RETURN');
  need(refill,'REAL_NATIVE_OWN_REFILL_NOT_SUSTAINED');
  // A genuine SOURCE artifact #13307074389 hit a 0.997m closest
  // approach with twelve KeyS-only pulses: lateral residual remained.
  // RAW 13378648373: the last outgoing actual KeyD was accidentally
  // interpreted as forward W, causing post-TIME_UP independent audit FAIL.
  // Calibrate from real native KeyW exclusively; preserve original
  // Rapier/ink/CPU/return-radius gates and use real WASD for the return.
  const realWDelta=b412ObservedNativeForwardW(evidence.legs);
  evidence.returnForwardWDelta=realWDelta;
  await record('REAL_NATIVE_W_DIRECTION_FOR_SAFE_RETURN');
  // Max 18 short authentic pulses. <=22 complete legs with the
  // existing W phase, retaining independent audit hard caps.
  for(let i=0;i<18;i++){
   const now=await frame();
   if(b412NativeReturnReady(now.player.position,initialPos))break;
   const code=b412NativeReturnSteerKey(
    now.player.position,initialPos,realWDelta);
   await nativeLeg(code,code==='KeyS'?
    'RETURN_TO_ACTUAL_UPPER_BODY':'REAL_NATIVE_RETURN_STEER');
  }
  const near=await frame();
  if(!b412NativeReturnReady(near.player.position,initialPos)){
   evidence.hold={stage:'ACTUAL_RETURN_NOT_REACHED',
    original:initialPos,actual:near.player.position,tick:near.tick,
    remainingMeters:planar(near.player.position,initialPos),
    lastNativeInput:evidence.legs.at(-1),
    originalSourceUnchanged:true,acceptanceMeters:.95};
   await record('HOLD_REAL_RETURN_BODY_NOT_REACHED');
   fail('REAL_KCC_RETURN_NOT_REACHED_WITH_NATIVE_STEERING');
  }
 }finally{
  await send('Input.dispatchKeyEvent',key('ShiftLeft','keyUp'));
  await record('NATIVE_SHIFT_RELEASED');
 }
 const returned=await nativeUntil(async()=>{
  const n=await frame();
  return n.player.mode==='HUMAN'&&
   n.b381RealNativeDodge?.realLocomotion==='HUMAN'?n:false;
 },20000);
 const finalGround=await ledger(),net=planar(returned.player.position,initialPos);
 const returnAuthorized=returned.matchState==='PLAYING'&&!returned.paused&&
  returned.shotsFired===shots&&returned.cpu.physicalRejoins.length===7&&
  finalGround.realHumanOriginalFootSupported===true&&
  finalGround.genuineHumanOriginalFootSolid===expectedFoot&&
  net<=.95&&await locked();
 if(!returnAuthorized){
  evidence.hold={stage:'ACTUAL_HUMAN_REENTRY',
   original:initialPos,actual:returned.player.position,
   tick:returned.tick,netReturnMeters:net,acceptanceMeters:.95,
   sourceFoot:finalGround.genuineHumanOriginalFootSolid,
   supported:finalGround.realHumanOriginalFootSupported,
   matchState:returned.matchState,paused:returned.paused,
   shots:returned.shotsFired,cpuRejoined:returned.cpu.physicalRejoins.length};
  await record('HOLD_REAL_HUMAN_REENTRY_OR_SOURCE');
 }
 need(returnAuthorized,
  'REAL_HUMAN_AFTER_SQUID_RETURN_SAME_NATIVE_UPPER_SOURCE');
 evidence.final={tick:returned.tick,body:returned.player.position,
  mode:returned.player.mode,locomotion:returned.b381RealNativeDodge.realLocomotion,
  inkRelation:returned.player.inkRelation,
  humanShots:returned.shotsFired,cpuRejoined:7,
  originalFoot:finalGround.genuineHumanOriginalFootSolid,netReturnMeters:net};
 evidence.totalRealKccMeters=evidence.legs.reduce((a,x)=>a+x.planarMeters,0);
 await record('HUMAN_NATIVE_RETURNED_ON_ORIGINAL_SOURCE');
 need(evidence.totalRealKccMeters>.5,
  'NO_TRUE_SQUID_SOURCE_KCC_TRAVEL');
 return evidence;
}
export function b412AuditNativeActualOriginalInkSwim(v,b410,b411){
 need(b410?.verdict==='PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES'&&
  b411?.verdict==='PASS_UNOBSTRUCTED_REAL_ORIGINAL_180S_GAMEPLAY_AND_POST_TIME_UP_REPLAY'&&
  b410.originalRoundTimeUpTick===b411.realGameTimeUpTick,
  'B410_AND_B411_GENUINE_SAME_SOURCE_GAME_PASS');
 need(v?.schema==='B412_TRUE_NATIVE_SQUID_OWN_INK_ON_ORIGINAL_UPPER'&&
  v.source==='25/17/26/0'&&v.nativeCDP===true&&
  v.syntheticPlayerMoves===false&&v.syntheticTickWrites===false&&
  v.syntheticInkWrites===false&&v.sourceScoreable===0&&
  v.officialWinner==='NONE'&&v.remaining===90&&
  v.originalFoot==='UndertowT21D:right-low-team-a'&&
  is3(v.target)&&is3(v.initial?.body)&&v.initial.mode==='HUMAN'&&
  v.initial.cpuRejoined===7&&
  Number.isSafeInteger(v.actualSqModeTick)&&
  v.actualSqModeTick>v.initial.tick&&v.swimObserved===true&&
  Array.isArray(v.legs)&&v.legs.length>=2&&v.legs.length<=22&&
  Array.isArray(v.returnForwardWDelta)&&
  v.returnForwardWDelta.length===2&&
  v.returnForwardWDelta.every(Number.isFinite)&&
  Array.isArray(v.outboundForwardWDelta)&&
  v.outboundForwardWDelta.length===2&&
  v.outboundForwardWDelta.every(Number.isFinite),
  'GENUINE_NATIVE_PLAYER_SQUID_SOURCE_SCOPE');
 const verifiedW=v.legs.filter(x=>
  x.direction==='TOWARD_REAL_120S_PAINT'&&x.code==='KeyW').at(-1);
 const calibration=v.legs[0];
 need(calibration?.direction==='TOWARD_REAL_120S_PAINT'&&
  calibration.code==='KeyW'&&is3(calibration.from)&&
  is3(calibration.to)&&
  Math.abs(calibration.to[0]-calibration.from[0]-
   v.outboundForwardWDelta[0])<.0001&&
  Math.abs(calibration.to[2]-calibration.from[2]-
   v.outboundForwardWDelta[1])<.0001&&
  Math.hypot(...v.outboundForwardWDelta)>.15,
  'REAL_SOURCE_OUTBOUND_FORWARD_CALIBRATION');
 need(verifiedW&&is3(verifiedW.from)&&is3(verifiedW.to)&&
  Math.abs(verifiedW.to[0]-verifiedW.from[0]-
   v.returnForwardWDelta[0])<.0001&&
  Math.abs(verifiedW.to[2]-verifiedW.from[2]-
   v.returnForwardWDelta[1])<.0001&&
  Math.hypot(...v.returnForwardWDelta)>.15,
  'ACTUAL_NATIVE_FORWARD_VECTOR_MUST_MATCH_OBSERVED_KCC');
 let ownSwim=0,meters=0,tick=v.actualSqModeTick;
 for(const leg of v.legs){
  const outgoing=leg.direction==='TOWARD_REAL_120S_PAINT';
  const returnLeg=leg.direction==='RETURN_TO_ACTUAL_UPPER_BODY';
  const steerLeg=leg.direction==='REAL_NATIVE_RETURN_STEER';
  const trueOutbound=outgoing&&(
   leg===v.legs[0]?leg.code==='KeyW':
    ['KeyW','KeyS','KeyA','KeyD'].includes(leg.code)&&
    b412NativeReturnSteerKey(
     leg.from,v.target,v.outboundForwardWDelta)===leg.code);
  need((trueOutbound||
   returnLeg&&leg.code==='KeyS'||
   steerLeg&&['KeyW','KeyA','KeyD'].includes(leg.code))&&
   (outgoing||b412NativeReturnSteerKey(
    leg.from,v.initial.body,v.returnForwardWDelta)===leg.code)&&
   leg.mode==='SQUID'&&
   ['SQUID_DRY','SWIM_GROUND'].includes(leg.locomotion)&&
   ['OWN','ENEMY','NEUTRAL','NONE'].includes(leg.inkRelation)&&
   leg.originalFoot===v.originalFoot&&leg.originalSupport===true&&
   Number.isFinite(leg.genuineGap)&&leg.genuineGap>=0&&leg.genuineGap<=.4&&
   Number.isSafeInteger(leg.fromTick)&&leg.fromTick>=tick&&
   Number.isSafeInteger(leg.toTick)&&leg.toTick>=leg.fromTick+
   (outgoing?8:3)&&
   is3(leg.from)&&is3(leg.to)&&
   Number.isFinite(leg.planarMeters)&&leg.planarMeters>=0&&leg.planarMeters<=3&&
   Math.abs(planar(leg.from,leg.to)-leg.planarMeters)<.0001&&
   leg.humanShots===v.initial.humanShots&&leg.cpuRejoined===7,
   'AUTHENTIC_CONTINUOUS_SQUID_ORIGINAL_RAPIER_LEG');
  tick=leg.toTick;meters+=leg.planarMeters;
  if(leg.locomotion==='SWIM_GROUND'&&leg.inkRelation==='OWN'&&
   leg.planarMeters>.02)ownSwim++;
 }
 need(ownSwim>0&&Number.isFinite(v.totalRealKccMeters)&&
  Math.abs(v.totalRealKccMeters-meters)<.0001&&meters>.5&&
  v.final?.tick>tick&&v.final.mode==='HUMAN'&&
  v.final.locomotion==='HUMAN'&&v.final.humanShots===v.initial.humanShots&&
  v.final.cpuRejoined===7&&v.final.originalFoot===v.originalFoot&&
  Number.isFinite(v.final.netReturnMeters)&&v.final.netReturnMeters<=.95&&
  is3(v.final.body),'GENUINE_OWN_INK_SWIM_AND_SAFE_HUMAN_RETURN');
 return {
  schema:'B412_INDEPENDENT_SAME_SOURCE_SQUID_SWIM_AND_HUMAN_RETURN',
  verdict:'PASS_REAL_OWN_INK_SWIM_AND_HUMAN_REENTRY_IN_180S_SOURCE_MATCH',
  source:'25/17/26/0',actualOwnInkSwimLegs:ownSwim,
  actualNativeSquidKccMeters:meters,
  genuineHumanRespawnOrOpponentSplatCertified:false,
  actualNativeTimeUpTick:b410.originalRoundTimeUpTick,
  original4PaintSurfaces:b410.genuineDistinctOriginalHumanPaintSurfaces,
  originalScoreable:0,officialWinner:'NONE',
  formal4v4Certified:false,artAccepted:false,productionAuthorized:false
 };
}
