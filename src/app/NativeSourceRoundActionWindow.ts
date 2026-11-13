/** B377: CPU queued shots and SUB/SPECIAL spend true ink resources during
 * CpuAgentSystem.fixedUpdate. Predict the actual 180s final tick BEFORE
 * CPU combat decisions so no unauthorised request/cost/stat is produced.
 * This leaves all seven native CPU physics and Rapier checks unchanged. */
export function nativeSourceCpuCanStartActionsBeforeTickEnd(input:{
 readonly matchState:string;
 readonly remainingSeconds:number;
 readonly nativeDtSeconds:number;
 readonly stopReason:string|null;
 readonly nativeHumanPrestartLocked?:boolean;
}):boolean{
 if(input.stopReason||!Number.isFinite(input.remainingSeconds)||
    !Number.isFinite(input.nativeDtSeconds)||
    input.nativeDtSeconds<=0)return false;
 return (input.matchState==='STAGING'&&
    !input.nativeHumanPrestartLocked)||
  input.matchState==='PLAYING'&&
   Math.max(0,input.remainingSeconds-input.nativeDtSeconds)>0;
}

/** SOURCE-only real 60Hz actor action authority.
 * Called after physical CPU fixedUpdate and 180s clock transition.
 * Does not simulate, award or move anything; in-flight physics is unchanged.
 */
export function nativeSourceRoundActionWindow(input:{
 readonly matchState:string;
 readonly actualHumanHp:number;
 readonly stopReason:string|null;
}):{readonly cpuCanStartNewActions:boolean;
 readonly humanCanStartNewActions:boolean}{
 const open=(input.matchState==='STAGING'||input.matchState==='PLAYING')&&
  !input.stopReason;
 return {
  cpuCanStartNewActions:open,
  humanCanStartNewActions:open&&Number.isFinite(input.actualHumanHp)&&
   input.actualHumanHp>0
 };
}

/** Real 180s ORIGINAL SOURCE only: attach the EXISTING physical CPU
 * SUB/SPECIAL runtime to user-selected gameplay instead of leaving it
 * permanently QA-only. This is not a grant to populate missing center
 * routes, earn special gauge, modify floor/score or spawn a new enemy.
 * All normal T20, noncanonical source, and deterministic QA are unchanged. */
export function nativeSourceCpuKitRuntimeAuthorized(input:{
 readonly fullRound:boolean;
 readonly canonicalMode:string|null;
 readonly stageId:string;
 readonly solids:number;
 readonly paint:number;
 readonly links:number;
 readonly scoreable:number;
}):boolean{
 return input.fullRound&&
  ['combat','circuit','coop','frontline'].includes(input.canonicalMode??'')&&
  input.stageId==='undertow-t21d-partial-connectivity-qa'&&
  input.solids===25&&input.paint===17&&
  input.links===26&&input.scoreable===0;
}

/** Genuine SOURCE: fatal contact is native tick zero of the 150-tick
 * respawn interval, exactly as native CPU respawn (2.5s at 60Hz).
 * Pauses have no new physics frames and do not advance this count. */
export function nativeSourceHumanRespawnElapsedTicks(
 lethalNativeTick:number,nowNativeTick:number
):number{
 if(!Number.isSafeInteger(lethalNativeTick)||lethalNativeTick<0||
    !Number.isSafeInteger(nowNativeTick)||nowNativeTick<lethalNativeTick)
  throw Error('T21_SOURCE_HUMAN_RESPAWN_INVALID_NATIVE_TICK');
 return nowNativeTick-lethalNativeTick;
}
