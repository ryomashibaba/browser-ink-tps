/**
 * W10-B25: optional non-scoring 60Hz practice challenge on immutable
 * source-original stage. NO new geometry, NavLink, score surface, spawn,
 * bot goal, damage or original Turf winner. A genuine player paints and
 * travels grounded on an original physical surface to clear a practice run.
 * Animation / render callbacks do not advance the challenge.
 */
export const B25_SOURCE_PAINT_RUN_TICKS=60*60;
export const B25_SOURCE_PAINT_RUN_REQUIRED_CELLS=180;
export const B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS=12;
const MAX_GROUNDED_TRAVEL_PER_TICK=.38;

export type B25RunStatus='IDLE'|'ARMED'|'RUNNING'|'CLEAR'|'TIME_UP'|'ABORTED';
export type B25PracticeFoot=Readonly<{
 x:number;y:number;z:number;grounded:boolean;alive:boolean;
 realPhysicalOriginalStage:boolean;
}>;
export type B25PracticeInk=Readonly<{
 changedHumanImpactCells:number;changedHumanImpactEvents:number;
 sourceOnly:boolean;scoreablePromotionCount:0;
}>;
export type B25PracticeFrame=Readonly<{
 tick:number;paused:boolean;stopReason:string|null;
 inputLocked:boolean;sessionEnded:boolean;
 sourceSolids:number;paintableSurfaces:number;originalNavLinks:number;
 scoreableSurfaces:number;foot:B25PracticeFoot;ink:B25PracticeInk;
}>;

function validFrame(f:B25PracticeFrame){
 return Number.isSafeInteger(f.tick)&&f.tick>=0&&
  f.sourceSolids===25&&f.paintableSurfaces===17&&
  f.originalNavLinks===26&&f.scoreableSurfaces===0&&
  f.ink.sourceOnly&&f.ink.scoreablePromotionCount===0&&
  Number.isSafeInteger(f.ink.changedHumanImpactCells)&&
  f.ink.changedHumanImpactCells>=0&&
  Number.isSafeInteger(f.ink.changedHumanImpactEvents)&&
  f.ink.changedHumanImpactEvents>=0&&
  [f.foot.x,f.foot.y,f.foot.z].every(Number.isFinite);
}
export class UndertowF3SourcePaintRun{
 private status:B25RunStatus='IDLE';
 private startTick=0;
 private lastTick=-1;
 private baseCells=0;
 private baseImpacts=0;
 private actualCells=0;
 private actualImpacts=0;
 private groundedMeters=0;
 private lastFoot:B25PracticeFoot|null=null;
 private abortReason:string|null=null;
 private bestTicks:number|null=null;
 private lastClearTicks:number|null=null;
 private validClears=0;
 private newBest=false;

 public arm(){
  if(this.status==='ARMED'||this.status==='RUNNING')return false;
  this.status='ARMED';
  this.startTick=0;this.lastTick=-1;this.baseCells=0;this.baseImpacts=0;
  this.actualCells=0;this.actualImpacts=0;this.groundedMeters=0;
  this.lastFoot=null;this.abortReason=null;this.newBest=false;
  // A retry keeps only a real previous in-page practice best.
  return true;
 }
 public abort(reason:string){
  if(this.status==='ARMED'||this.status==='RUNNING'){
   this.status='ABORTED';
   this.abortReason=reason;
   this.lastFoot=null;
  }
 }
 /** Called once after each genuine native 60 Hz Rapier + GameplayInk tick.
  * No synthetic step, no gamepad forcing, no reading from GPU render pixels.
  */
 public observe(f:B25PracticeFrame){
  if(this.status!=='ARMED'&&this.status!=='RUNNING')return this.snapshot();
  if(!validFrame(f)){
   this.abort('SOURCE_AUTHORITY_OR_INVALID_SAMPLE');return this.snapshot();
  }
  if(f.stopReason||f.paused||f.sessionEnded){
   this.abort('SESSION_STOPPED');return this.snapshot();
  }
  if(!f.inputLocked){
   // Initial pointer lock is acquired only after the player explicitly
   // arms practice. Unlock during a running trial invalidates the attempt.
   if(this.status==='RUNNING')this.abort('PLAYER_POINTER_UNLOCKED');
   return this.snapshot();
  }
  if(this.status==='ARMED'){
   if(!f.foot.alive)return this.snapshot();
   this.status='RUNNING';
   this.startTick=f.tick;this.lastTick=f.tick;
   this.baseCells=f.ink.changedHumanImpactCells;
   this.baseImpacts=f.ink.changedHumanImpactEvents;
   this.lastFoot=f.foot;
   return this.snapshot();
  }
  if(f.tick<=this.lastTick){
   this.abort('NON_MONOTONIC_NATIVE_FIXED_TICK');return this.snapshot();
  }
  if(f.ink.changedHumanImpactCells<this.baseCells||
     f.ink.changedHumanImpactEvents<this.baseImpacts){
   this.abort('AUTHORITATIVE_HUMAN_INK_COUNTER_RESET');return this.snapshot();
  }
  // A stopwatch bound to real simulation ticks, not an untrusted RAF
  // timer. If the game stalls, do not pretend 60Hz gameplay happened.
  this.actualCells=f.ink.changedHumanImpactCells-this.baseCells;
  this.actualImpacts=f.ink.changedHumanImpactEvents-this.baseImpacts;
  // No credit for jumping, falling, respawn, teleport or out-of-map.
  // Credit only short, continuous, REAL grounded displacement.
  const old=this.lastFoot;
  if(old&&old.grounded&&old.alive&&old.realPhysicalOriginalStage&&
   f.foot.grounded&&f.foot.alive&&f.foot.realPhysicalOriginalStage&&
   f.tick===this.lastTick+1){
   const dx=f.foot.x-old.x,dz=f.foot.z-old.z,dy=f.foot.y-old.y;
   const xz=Math.hypot(dx,dz);
   if(xz>0&&xz<=MAX_GROUNDED_TRAVEL_PER_TICK&&Math.abs(dy)<.32)
    this.groundedMeters+=xz;
  }
  this.lastFoot=f.foot;this.lastTick=f.tick;
  if(this.actualCells>=B25_SOURCE_PAINT_RUN_REQUIRED_CELLS&&
     this.groundedMeters>=B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS){
   this.status='CLEAR';
   const elapsed=f.tick-this.startTick;
   this.validClears++;this.lastClearTicks=elapsed;
   this.newBest=this.bestTicks===null||elapsed<this.bestTicks;
   if(this.newBest)this.bestTicks=elapsed;
  }else if(f.tick-this.startTick>=B25_SOURCE_PAINT_RUN_TICKS){
   this.status='TIME_UP';
  }
  return this.snapshot();
 }
 public snapshot(){
  const elapsed=this.status==='RUNNING'||this.status==='TIME_UP'||this.status==='CLEAR'?
   Math.min(B25_SOURCE_PAINT_RUN_TICKS,
    Math.max(0,this.lastTick-this.startTick)):0;
  return {
   status:this.status,
   mode:'OPTIONAL_NONSCORING_SOURCE_PAINT_RUN' as const,
   originalStageVerified:true as const,
   gameplaySource:'REAL_HUMAN_AUTHORITATIVE_INK_AND_RAPIER_FOOT' as const,
   allottedTicks:B25_SOURCE_PAINT_RUN_TICKS,
   elapsedTicks:elapsed,
   secondsRemaining:Math.ceil((B25_SOURCE_PAINT_RUN_TICKS-elapsed)/60),
   humanChangedImpactCells:this.actualCells,
   requiredHumanChangedCells:B25_SOURCE_PAINT_RUN_REQUIRED_CELLS,
   humanImpactEvents:this.actualImpacts,
   realGroundedTravelMeters:Number(this.groundedMeters.toFixed(2)),
   requiredRealGroundedTravelMeters:B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS,
   abortReason:this.abortReason,
   bestClearElapsedTicks:this.bestTicks,
   lastClearElapsedTicks:this.lastClearTicks,
   completedRealPracticeRuns:this.validClears,
   newBestOnMostRecentClear:this.newBest,
   practiceRecordScope:'CURRENT_BROWSER_SESSION_ONLY' as const,
   officialRanking:'NONE' as const,
   originalTurfScore:'UNAVAILABLE' as const,
   officialWinner:'NONE' as const,
   sourceScoreablePromotions:0 as const,
   physicalStageModifications:0 as const,
   cpuPaintingCounted:false as const,
   productionAuthorized:false as const,
   trueOriginal4v4Certified:false as const
  };
 }
}
