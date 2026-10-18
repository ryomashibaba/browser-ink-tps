/**
 * W10-B22: source-only owner-device exploratory play comparison.
 * Native A → 75% B → Native A2, while REAL gameplay continues.
 * No simulation mutation, bot changes, invented stage routing or scoring.
 * Metrics are local-only until the owner explicitly exports JSON.
 */
export type OwnerQuality='NATIVE'|'PERFORMANCE';
export type OwnerTrialState='IDLE'|'ARMED'|'RUNNING'|'COMPLETE'|'ABORTED';
export interface OwnerTrialFrame {
 inputActive:boolean;
 paused:boolean;
 stopped:boolean;
 physicsTick:number;
 realHumanShots:number;
 cpuInkImpacts:number;
 cpuPatrolMeters:number;
 originalSolids:number;
 originalPaintSurfaces:number;
 originalNavLinks:number;
 scoreablePromotions:number;
 cameraBlocked:boolean;
}
export interface OwnerTrialPhase {
 mode:OwnerQuality;
 label:'NATIVE_A'|'PERFORMANCE_B'|'NATIVE_A2';
 elapsedSeconds:number;
 sampleCount:number;
 medianIntervalMs:number|null;
 p95IntervalMs:number|null;
 p99IntervalMs:number|null;
 estimatedMedianCallbackFps:number|null;
 slowOver50Ms:number;
 longOver250Ms:number;
 cameraBlockedCallbacks:number;
 humanShotsDelta:number;
 cpuInkImpactsDelta:number;
 originalPhysicsTicksDelta:number;
 cpuPatrolMetersDelta:number;
 canvasBackingPixels:[number,number];
}
const labels=['NATIVE_A','PERFORMANCE_B','NATIVE_A2'] as const;
const modes:readonly OwnerQuality[]=['NATIVE','PERFORMANCE','NATIVE'];
export const OWNER_PHASE_MS=12_000;
export const OWNER_WARMUP_MS=2_000;
const MAX_SAMPLES=1200;
function percentile(data:readonly number[],q:number):number|null{
 if(!data.length)return null;
 const sorted=[...data].sort((a,b)=>a-b);
 return Number(sorted[Math.max(0,Math.ceil(sorted.length*q)-1)]!.toFixed(2));
}
export function summarizeOwnerRenderSamples(samples:readonly number[]){
 const valid=samples.filter(x=>Number.isFinite(x)&&x>0&&x<=3000);
 const p50=percentile(valid,.5);
 return {sampleCount:valid.length,medianIntervalMs:p50,
  p95IntervalMs:percentile(valid,.95),p99IntervalMs:percentile(valid,.99),
  estimatedMedianCallbackFps:p50===null?null:Number((1000/p50).toFixed(2)),
  slowOver50Ms:valid.filter(x=>x>50).length,
  longOver250Ms:valid.filter(x=>x>250).length};
}
export class UndertowF3OwnerGpuTrial{
 private state:OwnerTrialState='IDLE';
 private phaseIndex=0;
 private phaseStart=0;
 private lastSampleAt=0;
 private samples:number[]=[];
 private blocked=0;
 private baseline:OwnerTrialFrame|null=null;
 private finished:OwnerTrialPhase[]=[];
 private completedReport:Record<string,unknown>|null=null;
 private stopReason='';
 private currentPixels:[number,number]=[0,0];
 constructor(
  private readonly changeQuality:(next:OwnerQuality)=>void,
  private readonly backingPixels:()=>[number,number]
 ){}
 arm(){
  if(this.state==='RUNNING'||this.state==='ARMED')return false;
  this.changeQuality('NATIVE');
  this.phaseIndex=0;this.phaseStart=0;this.lastSampleAt=0;
  this.samples=[];this.blocked=0;this.baseline=null;
  this.finished=[];this.completedReport=null;this.stopReason='';
  this.state='ARMED';
  return true;
 }
 abort(reason:string){
  if(this.state!=='RUNNING'&&this.state!=='ARMED')return;
  this.changeQuality('NATIVE');
  this.state='ABORTED';
  this.stopReason=reason.slice(0,120);
 }
 frame(now:number,f:OwnerTrialFrame){
  if(this.state==='IDLE'||this.state==='COMPLETE'||this.state==='ABORTED')return;
  if(f.stopped||f.originalSolids!==25||f.originalPaintSurfaces!==17||
   f.originalNavLinks!==26||f.scoreablePromotions!==0){
   this.abort('ORIGINAL_SOURCE_AUTHORITY_OR_SAFE_STOP');return;
  }
  if(!Number.isFinite(now)||now<=0){this.abort('INVALID_WALL_CLOCK');return;}
  if(this.state==='ARMED'){
   if(!f.inputActive||f.paused)return;
   this.state='RUNNING';this.beginPhase(now,f);return;
  }
  if(!f.inputActive||f.paused){
   this.abort('POINTER_UNLOCK_OR_PAUSE_DURING_TRIAL');return;
  }
  const actualPixels=this.backingPixels();
  if(actualPixels[0]!==this.currentPixels[0]||
     actualPixels[1]!==this.currentPixels[1]){
   this.abort('BACKING_BUFFER_CHANGED_DURING_MEASURED_PHASE');return;
  }
  // Include long callbacks up to three seconds as bad performance,
  // never silently hide slow frames from the owner report.
  const dt=now-this.lastSampleAt;
  const elapsed=now-this.phaseStart;
  if(dt>0&&dt<=3000&&elapsed>=OWNER_WARMUP_MS&&
    elapsed<=OWNER_PHASE_MS&&this.samples.length<MAX_SAMPLES)
   this.samples.push(dt);
  if(f.cameraBlocked&&elapsed>=OWNER_WARMUP_MS)this.blocked++;
  this.lastSampleAt=now;
  if(elapsed>=OWNER_PHASE_MS){
   if(this.samples.length<20){
    this.abort('INSUFFICIENT_REAL_RENDER_CALLBACKS');return;
   }
   this.finishPhase(now,f);
   if(this.phaseIndex===2){
    // A2 switched back to NATIVE before it began; do not issue a
    // redundant canvas reconfiguration on the final sampled callback.
    this.state='COMPLETE';
    this.completedReport={
     schema:'T21_W10B22_OWNER_RENDER_PLAY_TRIAL_V1',
     scene:'UNDERTOW_T21_SOURCE_ONLY_UNSCORED',
     type:'EXPLORATORY_REAL_PLAY_ABA_NOT_CONTROLLED',
     metric:'BROWSER_REAL_UPDATE_CALLBACK_INTERVAL_NOT_GPU_EXECUTION_TIME',
     warmupExcludedPerPhaseMs:OWNER_WARMUP_MS,
     attemptedPhaseDurationSeconds:OWNER_PHASE_MS/1000,
     originalSourceAuthority:{solids:25,paintableSurfaces:17,
      navigationLinks:26,scoreableSurfaces:0,activationReady:false},
     productionAuthorized:false,natural4v4Certified:false,
     dataTransferredAutomatically:false,
     limitations:[
      'Player inputs, CPU simulation and scene visibility differ during live play',
      'Callback interval and estimated FPS are not GPU execution time or end-to-end input latency',
      'A/B/A order does not establish causal render quality performance improvement',
      'The user controls whether to save or share the local JSON'
     ],
     phases:this.finished
    };
   }else{
    this.phaseIndex++;
    this.changeQuality(modes[this.phaseIndex]!);
    this.beginPhase(now,f);
   }
  }
 }
 private beginPhase(now:number,f:OwnerTrialFrame){
  this.phaseStart=now;this.lastSampleAt=now;this.samples=[];this.blocked=0;
  this.baseline={...f};
  this.currentPixels=this.backingPixels();
 }
 private finishPhase(now:number,f:OwnerTrialFrame){
  const baseline=this.baseline!;
  const summary=summarizeOwnerRenderSamples(this.samples);
  this.finished.push({
   mode:modes[this.phaseIndex]!,
   label:labels[this.phaseIndex]!,
   elapsedSeconds:Number(((now-this.phaseStart)/1000).toFixed(2)),
   ...summary,cameraBlockedCallbacks:this.blocked,
   humanShotsDelta:f.realHumanShots-baseline.realHumanShots,
   cpuInkImpactsDelta:f.cpuInkImpacts-baseline.cpuInkImpacts,
   originalPhysicsTicksDelta:f.physicsTick-baseline.physicsTick,
   cpuPatrolMetersDelta:Number((f.cpuPatrolMeters-baseline.cpuPatrolMeters).toFixed(2)),
   canvasBackingPixels:[...this.currentPixels]
  });
 }
 snapshot(now=0){
  return {
   status:this.state,mode:modes[this.phaseIndex]!,
   label:labels[this.phaseIndex]!,
   phaseIndex:this.phaseIndex,
   secondsLeft:this.state==='RUNNING'?Math.max(0,
    Math.ceil((OWNER_PHASE_MS-(now-this.phaseStart))/1000)):0,
   phaseCount:this.finished.length,
   complete:this.completedReport!==null,
   stopReason:this.stopReason,
   productionAuthorized:false,
   scoreablePromotions:0,
   sourceOnly:true
  };
 }
 report(){
  return this.completedReport;
 }
}
