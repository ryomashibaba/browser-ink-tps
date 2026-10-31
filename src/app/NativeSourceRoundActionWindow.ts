/** B377: CPU queued shots and SUB/SPECIAL spend true ink resources during
 * CpuAgentSystem.fixedUpdate. Predict the actual 180s final tick BEFORE
 * CPU combat decisions so no unauthorised request/cost/stat is produced.
 * This leaves all seven native CPU physics and Rapier checks unchanged. */
export function nativeSourceCpuCanStartActionsBeforeTickEnd(input:{
 readonly matchState:string;
 readonly remainingSeconds:number;
 readonly nativeDtSeconds:number;
 readonly stopReason:string|null;
}):boolean{
 if(input.stopReason||!Number.isFinite(input.remainingSeconds)||
    !Number.isFinite(input.nativeDtSeconds)||
    input.nativeDtSeconds<=0)return false;
 return input.matchState==='STAGING'||
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
