/** B485 genuine B441 repeat-C-key command guard.
 * Player may order existing A1 again only AFTER a completed or safely
 * rejected original-source order. Does not compute any AI path, physics,
 * projectile, new goal, hit or score. Only original B471 grants a target.
 */
export type B485TrueAllyOrderState=
 'OFF'|'REQUESTED'|'MOVING'|'ARRIVED'|'HOLD'|'EXPIRED';
export function b485MayIssueNativeA1OriginalOrder(input:Readonly<{
 selected:boolean;nativeTick:number;lastRealKeyTick:number|null;
 genuineKeyRequests:number;lastOrder:B485TrueAllyOrderState;
}>):boolean{
 if(!input.selected||!Number.isSafeInteger(input.nativeTick)||
    input.nativeTick<=0||
    !Number.isSafeInteger(input.genuineKeyRequests)||
    input.genuineKeyRequests<0)return false;
 if(input.genuineKeyRequests===0)
  return input.lastOrder==='OFF'&&input.lastRealKeyTick===null;
 if(!Number.isSafeInteger(input.lastRealKeyTick)||
    input.lastRealKeyTick===null||
    input.lastRealKeyTick<0||
    input.nativeTick-input.lastRealKeyTick<30)return false;
 return input.lastOrder==='ARRIVED'||input.lastOrder==='HOLD'||
  input.lastOrder==='EXPIRED';
}

/** Real player-C A1 original-foot arrival: for 120 native ticks veto
 * replacement patrol ONLY while the previous approved ORIGINAL goal
 * and the real KCC foot still share registered Rapier support.
 * No path/agent/paint/collider/score authority is supplied here. */
export function b485MayDwellAtTrueOriginalA1Arrival(x:Readonly<{
 nativeTick:number;arrivalTick:number;goal:readonly number[];
 physicalFoot:readonly number[];originalSource:readonly number[];
 enabled:boolean;orderStatus:B485TrueAllyOrderState;
 practiceRunning:boolean;rejoined:boolean;aliveGrounded:boolean;
 realFootSupported:boolean;originalGoalSupported:boolean;
}>):boolean{
 if(!x.enabled||!x.practiceRunning||!x.rejoined||
    !x.aliveGrounded||!x.realFootSupported||!x.originalGoalSupported||
    x.orderStatus!=='ARRIVED'||!Number.isSafeInteger(x.nativeTick)||
    !Number.isSafeInteger(x.arrivalTick)||x.arrivalTick<0||
    x.nativeTick<x.arrivalTick||x.nativeTick-x.arrivalTick>=120||
    x.originalSource.length!==4||
    x.originalSource.some((n,i)=>n!==[25,17,26,0][i])||
    x.goal.length!==3||x.physicalFoot.length!==3||
    !x.goal.every(Number.isFinite)||!x.physicalFoot.every(Number.isFinite))
   return false;
 // Length and finiteness have been checked above; TS with
 // noUncheckedIndexedAccess still needs explicit element refinement.
 const gx=x.goal[0]!,gy=x.goal[1]!,gz=x.goal[2]!;
 const fx=x.physicalFoot[0]!,fy=x.physicalFoot[1]!,
  fz=x.physicalFoot[2]!;
 return gz>=33&&Math.abs(fy-gy)<=.25&&
  Math.hypot(fx-gx,fz-gz)<=1.5;
}
