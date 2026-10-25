/**
 * B174: evaluate one REAL completed 180s browser/source-lab trial.
 * This consumes measured native CPU projectiles and paint, never makes
 * game decisions. This is an experimental QA pass, NOT official score.
 */
export function verifyB174ActualSourceSweepRound(input){
 const {finalNativeSeconds,realHumanActivityPairs,genuineRejoinedCpu,
  realCpuShotCount,realCpuChangedCells,actualLateralOriginalAimApprovals,
  nativeSweepingEnabled,officialSourceScoreable,actualWinner,
  perActorRealShots,samples}=input;
 const bad=(s)=>{throw Error('B174_UNVERIFIED_REAL_NATIVE_SOURCE_'+s);};
 if(finalNativeSeconds!==180||realHumanActivityPairs!==7||
    genuineRejoinedCpu!==7||nativeSweepingEnabled!==true||
    officialSourceScoreable!==0||actualWinner!=='NONE')bad('GAME_AUTHORITY');
 if(!perActorRealShots||typeof perActorRealShots!=='object'||
    Object.keys(perActorRealShots).length!==7||
    Object.values(perActorRealShots).some(v=>!Number.isSafeInteger(v)||v<0)||
    Object.values(perActorRealShots).reduce((a,b)=>a+b,0)!==realCpuShotCount)
  bad('TRUE_SEVEN_ACTOR_PROJECTILES');
 if(!Array.isArray(samples)||samples.length<8||samples.some((s,i)=>
  !Number.isFinite(s.nativeTick)||!Number.isFinite(s.realElapsedSeconds)||
  !Number.isSafeInteger(s.actualOriginalCpuShots)||
  !Number.isSafeInteger(s.actualOriginalCpuChangedInkCells)||
  !Number.isSafeInteger(s.trueNativeLateralOriginalAimApprovals)||
  s.actualOriginalRejoinedCpu!==7||s.noOriginalScoreable!==true||
  s.exactNativeSourceAimEnabled!==true||
  (i>0&&(s.nativeTick<=samples[i-1].nativeTick||
    s.actualOriginalCpuShots<samples[i-1].actualOriginalCpuShots||
    s.actualOriginalCpuChangedInkCells<
     samples[i-1].actualOriginalCpuChangedInkCells))))
  bad('MONOTONIC_ORIGINAL_CPU_SHOT_PAINT_HISTORY');
 // Real FIXED B172 added only 18 source cells from 60s to 120s.
 // A B175 sustained-play claim must improve AFTER the opening rush,
 // using sampled native changed cells, not merely early CPU bursts.
 const at60=samples.find(s=>s.realElapsedSeconds>=60);
 const at120=samples.find(s=>s.realElapsedSeconds>=120);
 if(!at60||!at120||at120.realElapsedSeconds<=at60.realElapsedSeconds||
    at120.actualOriginalCpuChangedInkCells-
     at60.actualOriginalCpuChangedInkCells<=18)
  bad('NO_TRUE_SOURCE_LATE_60_TO_120_PAINT_PROGRESS');
 if(realCpuShotCount<=112||realCpuChangedCells<=3615||
    actualLateralOriginalAimApprovals<=0||
    samples.at(-1).actualOriginalCpuShots>realCpuShotCount||
    samples.at(-1).actualOriginalCpuChangedInkCells>realCpuChangedCells)
  bad('NO_REAL_SOURCE_CPU_INK_GAIN_OVER_HISTORIC_B172_FIXED');
 return {
  verdict:'B174_ACTUAL_180S_PLAYER_AND_SEVEN_CPU_SOURCE_SWEEP_QA_PASS',
  nativeOriginalMatchSeconds:finalNativeSeconds,
  actualSevenCpuRejoined:genuineRejoinedCpu,
  genuineUserKeyboardMousePairedActions:realHumanActivityPairs,
  actualCpuRealProjectileShots:realCpuShotCount,
  actualCpuTrueOriginalPaintChanges:realCpuChangedCells,
  actualApprovedLateralSourcePaintTargets:actualLateralOriginalAimApprovals,
  originalScoreableSurfaces:officialSourceScoreable,
  officialWinner:'NONE',
  historicalB172FixedCpuShots:112,
  historicalB172FixedCpuChangedInkCells:3615,
  historicalFixedNative60To120NewSourceCells:18,
  native60To120SourceCells:
   at120.actualOriginalCpuChangedInkCells-
    at60.actualOriginalCpuChangedInkCells,
  actualNative60SampleSeconds:at60.realElapsedSeconds,
  actualNative120SampleSeconds:at120.realElapsedSeconds,
  compareCaveat:'HISTORICAL_DIFFERENT_COMMIT_NOT_SAME_SHA_AB',
  actualSourceOnly:true,
  originalPhysicalRoutesNotPromoted:true,
  certifiedOriginalNintendo4v4:false,
  perActorRealShots,
  genuineNativeCpuSamples:samples
 };
}
