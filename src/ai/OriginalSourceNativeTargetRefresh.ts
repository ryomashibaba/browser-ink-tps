/**
 * W10-B35 isolated CPU original-source crowd steering experiment.
 * Only controls whether to REISSUE an unchanged, already physically
 * audited original-source goal. No generated destinations, KCC approval,
 * collision, NavMesh/Actor placement or production T20 behavior.
 */
export const SOURCE_NATIVE_REFRESH_THINK_CYCLES=4;
export interface PreviousSourceNativeRequest{
 readonly x:number;readonly y:number;readonly z:number;
 readonly repeatedThinkCycles:number;
 readonly sameAgent:boolean;
}
export function shouldReissueOriginalSourceNativeTarget(
 old:PreviousSourceNativeRequest|null,
 goal:Readonly<{x:number;y:number;z:number}>
):boolean{
 if(![goal.x,goal.y,goal.z].every(Number.isFinite))
  throw Error('T21_W10B35_NONFINITE_ORIGINAL_GOAL');
 if(!old||!old.sameAgent)return true;
 if(![old.x,old.y,old.z].every(Number.isFinite)||
   !Number.isSafeInteger(old.repeatedThinkCycles)||
   old.repeatedThinkCycles<0)return true;
 if(Math.hypot(goal.x-old.x,goal.y-old.y,goal.z-old.z)>.025)
  return true;
 return old.repeatedThinkCycles>=SOURCE_NATIVE_REFRESH_THINK_CYCLES-1;
}
