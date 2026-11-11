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
 originalVerifiedGoalCount:number,
 physicalFootToOriginalGoalVerticalMeters:number
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
    physicalGoalXZDistance<0||
    !Number.isFinite(physicalFootToOriginalGoalVerticalMeters)||
    physicalFootToOriginalGoalVerticalMeters<0||
    !Number.isSafeInteger(originalVerifiedGoalCount)||
    originalVerifiedGoalCount<1)return release;
 // Source has real multi-level floors at Y=3.0/4.5/7.5m. A
 // 2D-near CPU on a different certified floor has NOT arrived.
 // Require the existing B470 native floor-height band (<=0.30m)
 // in addition to the original same-side XZ arrival radius.
 const originalFootSameElevation=
  physicalFootToOriginalGoalVerticalMeters<=.30;
 const near=originalFootSameElevation&&physicalGoalXZDistance<=1.5;
 const arrival=!originalFootSameElevation?null:
  near?(arrivedSinceTick??nativeTick):arrivedSinceTick;
 if(arrival!==null&&physicalGoalXZDistance<=3){
  if(nativeTick-arrival<120||originalVerifiedGoalCount<2)
   return {decision:'KEEP_DWELL',arrivedSinceTick:arrival};
  return {decision:'ROTATE_AFTER_DWELL',arrivedSinceTick:arrival};
 }
 if(nativeTick-firstApprovedTick<300)
  return {decision:'KEEP_APPROACH',arrivedSinceTick:null};
 return release;
}
