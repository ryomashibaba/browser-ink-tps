/** B343 real available projectile slots only; no fabricated physics. */
export function b343CanLaunchSourceVolley(free:number,requested:number):boolean{
 return Number.isSafeInteger(free)&&free>=0&&
  Number.isSafeInteger(requested)&&requested>0&&free>=requested;
}
