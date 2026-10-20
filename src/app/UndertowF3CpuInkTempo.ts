/**
 * W10-B63 — real source-local paint throughput timeline, not a Turf score.
 * Pure read model over B62 genuine 10-second native match observations.
 * Shot requests, changed ink cells and physical Recast stalls are separate.
 */
import type {B62EvidencePoint} from './UndertowF3NativeSessionEvidence';

export interface B63Window {
 fromNativeSecond:number;
 throughNativeSecond:number;
 cpuShots:number;
 newlyChangedCpuCells:number;
 newlyChangedHumanCells:number;
 cpuSplatDelta:number;
 suspectedCpuStallsAtEnd:number;
}
export function sourceCpuInkTempo(pts:readonly B62EvidencePoint[]){
 if(!pts.length)return {status:'NO_OBSERVATIONS' as const,
  officialTurfResult:'NONE' as const,sourceScoreableCells:0 as const,
  sourceOnly:true as const,windows:[] as B63Window[],
  cpuShotWithoutNewInkWindows:0};
 const v=[...pts];
 if(v.some((x,i)=>!Number.isFinite(x.elapsedNativeSeconds)||
    x.elapsedNativeSeconds<0||x.elapsedNativeSeconds>180||
    !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    [x.cpuSourceShots,x.cpuChangedSourceCells,x.humanChangedSourceCells,
     x.cpuSplatCount,x.cpuSuspectedStalls].some(n=>!Number.isSafeInteger(n)||n<0)||
    (i>0&&(x.nativeTick<v[i-1]!.nativeTick||
      x.elapsedNativeSeconds<v[i-1]!.elapsedNativeSeconds||
      x.cpuSourceShots<v[i-1]!.cpuSourceShots||
      x.cpuChangedSourceCells<v[i-1]!.cpuChangedSourceCells||
      x.humanChangedSourceCells<v[i-1]!.humanChangedSourceCells))))
   throw Error('B63_INVALID_OR_NONMONOTONIC_NATIVE_SOURCE_EVIDENCE');
 // Use exactly recorded genuine sample boundaries, never extrapolate data.
 // Combine intervals into at most 30-second contextual bins.
 const windows:B63Window[]=[];
 let start=v[0]!;
 for(let i=1;i<v.length;i++){
  const end=v[i]!;
  const duration=end.elapsedNativeSeconds-start.elapsedNativeSeconds;
  if(duration<30&&i!==v.length-1)continue;
  windows.push({
   fromNativeSecond:start.elapsedNativeSeconds,
   throughNativeSecond:end.elapsedNativeSeconds,
   cpuShots:end.cpuSourceShots-start.cpuSourceShots,
   newlyChangedCpuCells:end.cpuChangedSourceCells-start.cpuChangedSourceCells,
   newlyChangedHumanCells:
    end.humanChangedSourceCells-start.humanChangedSourceCells,
   cpuSplatDelta:end.cpuSplatCount-start.cpuSplatCount,
   suspectedCpuStallsAtEnd:end.cpuSuspectedStalls
  });
  start=end;
 }
 const noNewPaintWithShots=windows.filter(w=>
  w.cpuShots>0&&w.newlyChangedCpuCells===0).length;
 return {
  status:'REAL_SOURCE_ACTIVITY_ONLY' as const,
  sourceOnly:true as const,
  officialTurfResult:'NONE' as const,sourceScoreableCells:0 as const,
  windows,cpuShotWithoutNewInkWindows:noNewPaintWithShots,
  interpretation:noNewPaintWithShots?
   'CPU_FIRED_BUT_NO_ADDITIONAL_SOURCE_INK_CHANGE_IN_SOME_WINDOWS' as const:
   'NO_ZERO_NEW_SOURCE_INK_WINDOWS_WITH_CPU_SHOTS' as const,
  // No assertion of the cause: ownership saturation, geometry blockers,
  // projectile misses and route quality must be examined separately.
  causeOfPaintSlowdown:'UNDETERMINED' as const,
  inferredOriginal4v4:false as const
 };
}
