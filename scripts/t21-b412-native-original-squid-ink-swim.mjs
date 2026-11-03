import {setTimeout as nativeSleep} from 'node:timers/promises';
/** B412: one real SOURCE squid dive/own-ink swim in the SAME B410 180s match.
 * Sends ONLY genuine CDP Shift+W/S native key events. No player/actor writes,
 * ink ownership writes, synthetic time, fake enemy, new geometry or Scoreable.
 */
const fail=s=>{throw Error('B412_NATIVE_ORIGINAL_SQUID_SWIM_HOLD_'+s);};
const need=(p,s)=>{if(!p)fail(s);};
const is3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const key=(code,type)=>({
 type,key:code==='ShiftLeft'?'Shift':code==='KeyW'?'w':'s',code,
 windowsVirtualKeyCode:code==='ShiftLeft'?16:code==='KeyW'?87:83,
 nativeVirtualKeyCode:code==='ShiftLeft'?16:code==='KeyW'?87:83
});
const planar=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
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
    return n.tick>=before.tick+(direction==='RETURN_TO_ACTUAL_UPPER_BODY'?3:8)?n:false;
   },20000);
  }finally{await send('Input.dispatchKeyEvent',key(code,'keyUp'));}
  const after=await frame(),ground=await ledger();
  const distance=planar(before.player.position,after.player.position);
  const realTickMin=direction==='RETURN_TO_ACTUAL_UPPER_BODY'?3:8;
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
  // Move toward the REAL already-painted original ownerGrid target from
  // the successful B410 120-second shot (4-5m away, same original floor).
  // Short native pulses and strict foot support, no arbitrary destination.
  for(let i=0;i<10;i++){
   const now=await frame();
   if(evidence.swimObserved&&evidence.legs.some(x=>x.planarMeters>.15))
    break;
   if(planar(now.player.position,initialPos)>5.0)
    fail('TRUE_ORIGINAL_SQUID_NO_SAFE_EXTENDED_MOVE');
   await nativeLeg('KeyW','TOWARD_REAL_120S_PAINT');
  }
  need(evidence.swimObserved,
   'REAL_OWN_PAINT_SWIM_GROUND_NOT_OBSERVED');
  const peak=await frame();
  evidence.peakBody=peak.player.position;
  evidence.peakRelation=peak.player.inkRelation;
  await record('REAL_OWN_INK_SWIM_PEAK_BEFORE_RETURN');
  // Physically return near the real pre-dive pose with natural native S,
  // not a teleport or direct PlayerController position setter.
  for(let i=0;i<12;i++){
   const now=await frame();
   if(planar(now.player.position,initialPos)<=.75)break;
   await nativeLeg('KeyS','RETURN_TO_ACTUAL_UPPER_BODY');
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
 need(returned.matchState==='PLAYING'&&!returned.paused&&
  returned.shotsFired===shots&&returned.cpu.physicalRejoins.length===7&&
  finalGround.realHumanOriginalFootSupported===true&&
  finalGround.genuineHumanOriginalFootSolid===expectedFoot&&
  net<=.95&&await locked(),
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
  Array.isArray(v.legs)&&v.legs.length>=2&&v.legs.length<=22,
  'GENUINE_NATIVE_PLAYER_SQUID_SOURCE_SCOPE');
 let ownSwim=0,meters=0,tick=v.actualSqModeTick;
 for(const leg of v.legs){
  need(['TOWARD_REAL_120S_PAINT','RETURN_TO_ACTUAL_UPPER_BODY'].includes(leg.direction)&&
   (leg.code==='KeyW'||leg.code==='KeyS')&&
   leg.mode==='SQUID'&&
   ['SQUID_DRY','SWIM_GROUND'].includes(leg.locomotion)&&
   ['OWN','ENEMY','NEUTRAL','NONE'].includes(leg.inkRelation)&&
   leg.originalFoot===v.originalFoot&&leg.originalSupport===true&&
   Number.isFinite(leg.genuineGap)&&leg.genuineGap>=0&&leg.genuineGap<=.4&&
   Number.isSafeInteger(leg.fromTick)&&leg.fromTick>=tick&&
   Number.isSafeInteger(leg.toTick)&&leg.toTick>=leg.fromTick+
   (leg.direction==='RETURN_TO_ACTUAL_UPPER_BODY'?3:8)&&
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
