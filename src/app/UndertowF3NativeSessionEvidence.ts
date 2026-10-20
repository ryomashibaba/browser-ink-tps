/**
 * W10-B62: genuine source-local round activity timeline.
 *
 * Read-only; records native source-app snapshots observed during real
 * PlayCanvas simulation. Never simulates a tick, scores Turf, infers a
 * winner, saves private actor coordinates or uploads anything.
 */
export interface B62NativeFrame {
 tick:number;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 timeRemainingSeconds:number;
 paused:boolean;
 stopReason:string|null;
 originalSourceSolids:number;
 originalPaintSurfaces:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified:boolean;
 shotsFired:number;
 b23HumanInkFeedback:{humanChangedCells:number};
 cpuSourceTurfShots:number;
 cpuImpactInkCellsChanged:number;
 cpuSplats:number;
 humanSplats:number;
 humanRespawns:number;
 cpu:{physicalRejoins:readonly string[]};
 cpuContinuity:{suspectedStallCount:number;longestStallSeconds:number};
 sourceFrameQuality:{
  liveUpdateFrames:number;p95Ms:number|null;
  accumulatedDroppedSimulationSeconds:number;
 };
}
export interface B62EvidencePoint {
 readonly nativeTick:number;
 readonly elapsedNativeSeconds:number;
 readonly humanShots:number;
 readonly humanChangedSourceCells:number;
 readonly cpuSourceShots:number;
 readonly cpuChangedSourceCells:number;
 readonly cpuOriginalPhysicalRejoins:number;
 readonly cpuSplatCount:number;
 readonly humanSplatCount:number;
 readonly humanRespawnCount:number;
 readonly cpuSuspectedStalls:number;
 readonly longestCpuStallSeconds:number;
 readonly renderFrameCallbackP95Ms:number|null;
 readonly nativeSimulationDroppedSeconds:number;
}
const properCount=(value:number)=>Number.isSafeInteger(value)&&value>=0;
function statusGate(v:B62NativeFrame){
 if(v.originalSourceSolids!==25||v.originalPaintSurfaces!==17||
   v.originalSourceNavigationLinks!==26||
   v.sourceScoreablePromotions!==0||v.productionAuthorized!==false||
   v.unrestricted4v4Certified!==false)
  throw Error('B62_ORIGINAL_SOURCE_AUTHORITY_GATE');
 const counts=[v.tick,v.shotsFired,v.b23HumanInkFeedback.humanChangedCells,
  v.cpuSourceTurfShots,v.cpuImpactInkCellsChanged,v.cpuSplats,
  v.humanSplats,v.humanRespawns,v.cpuContinuity.suspectedStallCount,
  v.sourceFrameQuality.liveUpdateFrames];
 if(counts.some(v=>!properCount(v))||
    !Number.isFinite(v.timeRemainingSeconds)||
    v.timeRemainingSeconds<0||v.timeRemainingSeconds>180.01||
    v.cpu.physicalRejoins.length>7||
    new Set(v.cpu.physicalRejoins).size!==v.cpu.physicalRejoins.length||
    !Number.isFinite(v.cpuContinuity.longestStallSeconds)||
    v.cpuContinuity.longestStallSeconds<0||
    !Number.isFinite(v.sourceFrameQuality.accumulatedDroppedSimulationSeconds)||
    v.sourceFrameQuality.accumulatedDroppedSimulationSeconds<0||
    (v.sourceFrameQuality.p95Ms!==null&&
     (!Number.isFinite(v.sourceFrameQuality.p95Ms)||
       v.sourceFrameQuality.p95Ms<0)))
  throw Error('B62_INVALID_NATIVE_METRICS');
}
function row(s:B62NativeFrame):B62EvidencePoint{
 return {
  nativeTick:s.tick,
  elapsedNativeSeconds:Number((180-s.timeRemainingSeconds).toFixed(3)),
  humanShots:s.shotsFired,
  humanChangedSourceCells:s.b23HumanInkFeedback.humanChangedCells,
  cpuSourceShots:s.cpuSourceTurfShots,
  cpuChangedSourceCells:s.cpuImpactInkCellsChanged,
  cpuOriginalPhysicalRejoins:s.cpu.physicalRejoins.length,
  cpuSplatCount:s.cpuSplats,
  humanSplatCount:s.humanSplats,
  humanRespawnCount:s.humanRespawns,
  cpuSuspectedStalls:s.cpuContinuity.suspectedStallCount,
  longestCpuStallSeconds:Number(s.cpuContinuity.longestStallSeconds.toFixed(2)),
  renderFrameCallbackP95Ms:s.sourceFrameQuality.p95Ms,
  nativeSimulationDroppedSeconds:
   Number(s.sourceFrameQuality.accumulatedDroppedSimulationSeconds.toFixed(3))
 };
}
export class W10B62NativeSessionEvidence {
 private samples:B62EvidencePoint[]=[];
 private lastObservedTick=-1;
 private completed=false;
 private stopped=false;
 private observedActualPlaying=false;
 private sampleIntervalSeconds=10;
 /** Called only from the existing actual app refresh, no clock ownership. */
 observe(v:B62NativeFrame):void{
  statusGate(v);
  if(v.tick<this.lastObservedTick)
   throw Error('B62_NATIVE_TICK_WENT_BACKWARD');
  this.lastObservedTick=v.tick;
  if(v.stopReason){this.stopped=true;return;}
  if(this.stopped||this.completed)return;
  if(v.matchState==='STAGING')return;
  if(v.matchState==='PLAYING'&&v.paused)return;
  if(v.matchState==='PLAYING')this.observedActualPlaying=true;
  if(v.matchState==='TIME_UP'&&!this.observedActualPlaying)
   throw Error('B62_NO_REAL_PLAYING_OBSERVATION');
  if(v.matchState==='TIME_UP'&&v.timeRemainingSeconds!==0)
   throw Error('B62_FALSE_TIMEUP');
  const p=row(v),last=this.samples[this.samples.length-1];
  if(last&&p.elapsedNativeSeconds<last.elapsedNativeSeconds)
   throw Error('B62_SOURCE_MATCH_CLOCK_ROLLBACK');
  if(last&&[p.humanShots,p.humanChangedSourceCells,
   p.cpuSourceShots,p.cpuChangedSourceCells].some((n,i)=>
    n<[last.humanShots,last.humanChangedSourceCells,
      last.cpuSourceShots,last.cpuChangedSourceCells][i]!))
   throw Error('B62_NATIVE_CUMULATIVE_COUNTER_ROLLBACK');
  if(v.matchState==='PLAYING'&&last&&
     p.elapsedNativeSeconds-last.elapsedNativeSeconds<
      this.sampleIntervalSeconds)return;
  if(v.matchState==='TIME_UP'&&v.tick<10800)
   throw Error('B62_FALSE_180S_TICK_COUNT');
  this.samples.push(p);
  if(v.matchState==='TIME_UP')this.completed=true;
 }
 snapshot(){
  return {
   sampleCount:this.samples.length,
   genuineNativeCompletion:this.completed&&!this.stopped,
   status:this.stopped?'SAFE_STOP' as const:
    this.completed?'COMPLETE' as const:'OBSERVING' as const,
   lastNativeTick:this.lastObservedTick,
   officialWinner:'NONE' as const,scoreableSurfaces:0 as const,
   sourceOriginalActorsAuthenticated:false as const
  };
 }
 /** No private source geometry, actor positions, hardware fingerprint,
  * user-agent, URL, source JSON, GUID or absolute path is ever serialized. */
 report(){
  if(!this.completed||this.stopped||!this.samples.length)
   return null;
  const last=this.samples[this.samples.length-1]!;
  if(last.elapsedNativeSeconds!==180||last.nativeTick<10800)
   return null;
  const timeline=this.samples.map((sample,i)=>{
   const previous=this.samples[Math.max(0,i-1)]!;
   return {
    ...sample,
    changedHumanInkSincePreviousSample:i?
     sample.humanChangedSourceCells-previous.humanChangedSourceCells:0,
    changedCpuInkSincePreviousSample:i?
     sample.cpuChangedSourceCells-previous.cpuChangedSourceCells:0,
    cpuShotsSincePreviousSample:i?
     sample.cpuSourceShots-previous.cpuSourceShots:0
   };
  });
  return {
   schema:'T21_W10B62_REAL_180S_SOURCE_PLAY_EVIDENCE_V1' as const,
   source:'ACTUAL_F3_PLAYCANVAS_RAPIER_RECAST_GAMEPLAY_INK' as const,
   capture:'OWNER_EXPLICIT_BROWSER_DOWNLOAD_ONLY' as const,
   claim:'UNSCORED_SOURCE_LOCAL_PRACTICE_NOT_ORIGINAL_4V4' as const,
   elapsedNativeMatchSeconds:180 as const,
   originalPhysicalSolids:25 as const,
   originalPaintableSurfaces:17 as const,
   originalNavLinks:26 as const,
   officialScoreableSurfaces:0 as const,
   officialWinner:'NONE' as const,
   naturalOpponentRoutesCertified:0 as const,
   originalActorBindingsAuthenticated:false as const,
   activationReady:false as const,
   privateOriginalSourceIncluded:false as const,
   telemetryUploaded:false as const,
   sourceAuthorityPromotions:0 as const,
   nativeObservedPointCount:timeline.length,
   countersAreCumulativePageLoadNotMatchScoring:true as const,
   lastNativeFrame:last,
   timeline
  };
 }
}
