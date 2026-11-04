/** B443 genuine original CPU-goal hysteresis.
 * This controls only WHEN to keep already approved native Crowd goals.
 * It does not create routes, alter collision, teleport bodies or award score.
 * Full original-source Recast+Rapier audits remain mandatory at the caller.
 */
export interface B443OriginalHoldResult {
 readonly decision:'KEEP_APPROACH'|'KEEP_DWELL'|'ROTATE_AFTER_DWELL'|
  'RELEASE_STALLED_OR_INVALID';
 readonly arrivedSinceTick:number|null;
}
export function decideB443OriginalFrontHold(
 nativeTick:number,firstApprovedTick:number,
 arrivedSinceTick:number|null,physicalGoalXZDistance:number,
 originalVerifiedGoalCount:number
):B443OriginalHoldResult{
 const release={decision:'RELEASE_STALLED_OR_INVALID' as const,
  arrivedSinceTick:null};
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||
    !Number.isSafeInteger(firstApprovedTick)||firstApprovedTick<0||
    firstApprovedTick>nativeTick||
    (arrivedSinceTick!==null&&
      (!Number.isSafeInteger(arrivedSinceTick)||
       arrivedSinceTick<firstApprovedTick||arrivedSinceTick>nativeTick))||
    !Number.isFinite(physicalGoalXZDistance)||
    physicalGoalXZDistance<0||!Number.isSafeInteger(originalVerifiedGoalCount)||
    originalVerifiedGoalCount<1)return release;
 const near=physicalGoalXZDistance<=1.5;
 const arrival=near?(arrivedSinceTick??nativeTick):arrivedSinceTick;
 if(arrival!==null&&physicalGoalXZDistance<=3){
  if(nativeTick-arrival<120||originalVerifiedGoalCount<2)
   return {decision:'KEEP_DWELL',arrivedSinceTick:arrival};
  return {decision:'ROTATE_AFTER_DWELL',arrivedSinceTick:arrival};
 }
 if(nativeTick-firstApprovedTick<300)
  return {decision:'KEEP_APPROACH',arrivedSinceTick:null};
 return release;
}
