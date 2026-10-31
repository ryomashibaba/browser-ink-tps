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
