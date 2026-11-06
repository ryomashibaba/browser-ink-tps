/** B483: actual B441 player frontline may direct genuine A1 via the
 * existing B471 real player C key and original Rapier/Recast gates.
 * A command is never an actor move, verified arrival, enemy contact,
 * shortcut over the original F4 gap, or score. */
import {b475RealFrontlineReadyMode} from './B475RealFrontlineReadyChallenge';
export function b483RealFrontlineTeammateCommandSelected(
 p:Pick<URLSearchParams,'get'>
):boolean{return b475RealFrontlineReadyMode(p);}
/** The 60s CLASSIC paint challenge is independent of the genuine
 * 180s source round. A practice TIME_UP is not MATCH TIME_UP, and must
 * not silently disable player-controlled A1 cooperation mid-round.
 * The caller still enforces all native foot, match, life and path gates. */
export function b483ClassicPracticeAllowsLiveA1Order(
 variant:string,status:string
):boolean{
 return variant==='CLASSIC'&&
  (status==='RUNNING'||status==='CLEAR'||status==='TIME_UP');
}
/** Player-visible native C-order feedback. No goal or movement authority.
 * A live Chromium C event may be accepted yet have zero safe real goals.
 * Route/arrival claims come ONLY from B471's original Rapier/Recast gates.
 */
export type B483NativeCOrderDecision=
 'NOT_REQUESTED'|'REQUESTED_ORIGINAL_CHECK'|'ORIGINAL_GOAL_GRANTED'|
 'ORIGINAL_ARRIVAL'|'PHYSICAL_SOURCE_HOLD'|
 'NO_VERIFIED_FRESH_SOURCE_TARGET'|'NO_VERIFIED_ORIGINAL_PATH'|
 'ORIGINAL_ARRIVAL_UNSUPPORTED'|'ORIGINAL_PATH_LOST'|
 'SOURCE_ORDER_EXPIRED';
export function b483OriginalAllyCommandFeedback(input:{
 readonly status:'OFF'|'HOLD'|'REQUESTED'|'MOVING'|'ARRIVED'|'EXPIRED';
 readonly sourceDecision:B483NativeCOrderDecision;
 readonly repeatReady:boolean;readonly nativeTick:number;
 readonly lastRealKeyTick:number|null;readonly genuineKeyRequests:number;
}):{line:string;canRepeatNow:boolean}|null{
 const {status,sourceDecision,repeatReady,nativeTick,lastRealKeyTick,
  genuineKeyRequests}=input;
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||
    !Number.isSafeInteger(genuineKeyRequests)||genuineKeyRequests<0||
    (lastRealKeyTick!==null&&(!Number.isSafeInteger(lastRealKeyTick)||
      lastRealKeyTick<0||lastRealKeyTick>nativeTick)))return null;
 const detail:Record<B483NativeCOrderDecision,string>={
  NOT_REQUESTED:'NO PLAYER C ORDER YET',
  REQUESTED_ORIGINAL_CHECK:'C RECEIVED · CHECKING ORIGINAL GOAL',
  ORIGINAL_GOAL_GRANTED:'REAL ORIGINAL GOAL APPROVED · A1 MOVING',
  ORIGINAL_ARRIVAL:'A1 ARRIVED AT VERIFIED ORIGINAL GOAL',
  PHYSICAL_SOURCE_HOLD:'NO VERIFIED PHYSICAL A1 / PLAYER FOOT',
  NO_VERIFIED_FRESH_SOURCE_TARGET:'NO VERIFIED FRESH INK TARGET',
  NO_VERIFIED_ORIGINAL_PATH:'NO SAFE ORIGINAL RAPIER/RECAST PATH',
  ORIGINAL_ARRIVAL_UNSUPPORTED:'ARRIVAL FOOT SUPPORT NOT VERIFIED',
  ORIGINAL_PATH_LOST:'ORIGINAL SOURCE PATH LOST · ORDER HELD',
  SOURCE_ORDER_EXPIRED:'SOURCE ORDER EXPIRED / A1 UNAVAILABLE'
 };
 const consistent:Record<typeof status,readonly B483NativeCOrderDecision[]>={
  OFF:['NOT_REQUESTED'],
  REQUESTED:['REQUESTED_ORIGINAL_CHECK'],
  MOVING:['ORIGINAL_GOAL_GRANTED'],
  ARRIVED:['ORIGINAL_ARRIVAL'],
  HOLD:['PHYSICAL_SOURCE_HOLD','NO_VERIFIED_FRESH_SOURCE_TARGET',
   'NO_VERIFIED_ORIGINAL_PATH','ORIGINAL_ARRIVAL_UNSUPPORTED','ORIGINAL_PATH_LOST'],
  EXPIRED:['SOURCE_ORDER_EXPIRED']
 };
 if(!consistent[status].includes(sourceDecision)||
    (genuineKeyRequests===0&&status!=='OFF')||
    (genuineKeyRequests>0&&status==='OFF'))return null;
 const terminal=status==='ARRIVED'||status==='HOLD'||status==='EXPIRED';
 const waiting=status==='MOVING'?' · C DISABLED WHILE MOVING':
  status==='REQUESTED'?' · WAIT FOR ORIGINAL DECISION':'';
 const cooldown=terminal&&!repeatReady&&lastRealKeyTick!==null?
  Math.max(0,30-(nativeTick-lastRealKeyTick)):0;
 const repeat=terminal&&repeatReady?' · C REORDER AVAILABLE':
  terminal&&cooldown>0?' · C RETRY IN '+cooldown+' NATIVE TICKS':
  terminal?' · RETRY NEEDS GENUINE SOURCE GATE':'';
 return {line:detail[sourceDecision]+waiting+repeat,
  canRepeatNow:terminal&&repeatReady};
}
export function b483MayRequestTrueFrontlineA1Order(input:{
 selected:boolean;stage:readonly number[];nativeTick:number;
 matchState:string;paused:boolean;stopReason:string|null;
 pointerLocked:boolean;playerHp:number;originalCpuRejoins:number;
 practiceVariant:string;practiceStatus:string;
}):boolean{
 return input.selected&&input.stage.join(',')==='25,17,26,0'&&
  Number.isSafeInteger(input.nativeTick)&&input.nativeTick>0&&
  input.matchState==='PLAYING'&&!input.paused&&
  input.stopReason===null&&input.pointerLocked&&
  Number.isFinite(input.playerHp)&&input.playerHp>0&&
  input.originalCpuRejoins===7&&
  // A 60s challenge CLEAR or TIME_UP never ends a 180s battle. Stop on
  // actual MATCH TIME_UP or native unsafe state, not practice outcome.
  b483ClassicPracticeAllowsLiveA1Order(
   input.practiceVariant,input.practiceStatus);
}
