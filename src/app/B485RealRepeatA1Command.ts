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
