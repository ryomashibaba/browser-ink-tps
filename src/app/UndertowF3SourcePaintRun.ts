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
export type B56PracticeVariant='CLASSIC'|'SWITCHBACK'|'PAINT_RELAY'|'ALLY_SYNC';
/** Only actual B152 tagged source-aim -> projectile -> original impact ink. */
export const B161_ALLY_REAL_IMPACT_CELLS=30;
export const B57_RELAY_CELLS_PER_LEG=60;
// Relative to the real player's initial original-ground foot, NOT a new
// stage actor, NavLink, navigation destination or Nintendo-authored route.
export const B56_SWITCHBACK_OUT_METERS=1.8;
export const B56_SWITCHBACK_HOME_RADIUS_METERS=.8;

export type B25RunStatus='IDLE'|'ARMED'|'RUNNING'|'CLEAR'|'TIME_UP'|'ABORTED';
export type B25PracticeFoot=Readonly<{
 x:number;y:number;z:number;grounded:boolean;alive:boolean;
 realPhysicalOriginalStage:boolean;
}>;
export type B25PracticeInk=Readonly<{
 changedHumanImpactCells:number;changedHumanImpactEvents:number;
 sourceOnly:boolean;scoreablePromotionCount:0;
}>;
/** Optional for prior run variants. Mandatory A1 native provenance for ALLY_SYNC. */
export type B161AllyPhysicalInk=Readonly<{
 allyId:'A1';qaOptIn:boolean;realOriginalSourceOnly:boolean;
 genuineOriginalA1AimChangedImpactCells:number;
 genuineOriginalA1AimImpactEvents:number;scoreablePromotionCount:0;
}>;
export type B25PracticeFrame=Readonly<{
 tick:number;paused:boolean;stopReason:string|null;
 inputLocked:boolean;sessionEnded:boolean;
 sourceSolids:number;paintableSurfaces:number;originalNavLinks:number;
 scoreableSurfaces:number;foot:B25PracticeFoot;ink:B25PracticeInk;
 ally?:B161AllyPhysicalInk;
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
 private initialRealA1Cells=0;
 private initialRealA1Impacts=0;
 private realA1ChangedImpactCells=0;
 private realA1OriginalImpactEvents=0;
 private groundedMeters=0;
 private lastFoot:B25PracticeFoot|null=null;
 private abortReason:string|null=null;
 private bestTicks:number|null=null;
 private lastClearTicks:number|null=null;
 private validClears=0;
 private newBest=false;
 private variant:B56PracticeVariant='CLASSIC';
 private routeStart:B25PracticeFoot|null=null;
 private routeOutReached=false;
 private routeReturned=false;
 private routeOutAtGroundMeters=0;
 private relayTurnPaintCells=0;
 private relayReturnPaintCells=0;
 private readonly bestByVariant:Record<B56PracticeVariant,number|null>={
  CLASSIC:null,SWITCHBACK:null,PAINT_RELAY:null,ALLY_SYNC:null
 };
 private readonly clearsByVariant:Record<B56PracticeVariant,number>={
  CLASSIC:0,SWITCHBACK:0,PAINT_RELAY:0,ALLY_SYNC:0
 };

 public arm(variant:B56PracticeVariant='CLASSIC'){
  if(this.status==='ARMED'||this.status==='RUNNING'||
     (variant!=='CLASSIC'&&variant!=='SWITCHBACK'&&
      variant!=='PAINT_RELAY'&&variant!=='ALLY_SYNC'))return false;
  this.variant=variant;
  this.status='ARMED';
  this.startTick=0;this.lastTick=-1;this.baseCells=0;this.baseImpacts=0;
  this.actualCells=0;this.actualImpacts=0;this.groundedMeters=0;
  this.initialRealA1Cells=0;this.initialRealA1Impacts=0;
  this.realA1ChangedImpactCells=0;this.realA1OriginalImpactEvents=0;
  this.lastFoot=null;this.abortReason=null;this.newBest=false;
  this.routeStart=null;this.routeOutReached=false;this.routeReturned=false;
  this.routeOutAtGroundMeters=0;
  this.relayTurnPaintCells=0;this.relayReturnPaintCells=0;
  this.bestTicks=this.bestByVariant[this.variant];
  this.validClears=this.clearsByVariant[this.variant];
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
  // B161: no CPU foot ink, generic impacts or shot requests allowed.
  // Only the exact B152 original A1 source paint provenance is eligible.
  const ally=f.ally;
  if(this.variant==='ALLY_SYNC'&&(!ally||
    ally.allyId!=='A1'||ally.qaOptIn!==true||
    ally.realOriginalSourceOnly!==true||
    ally.scoreablePromotionCount!==0||
    !Number.isSafeInteger(ally.genuineOriginalA1AimChangedImpactCells)||
    ally.genuineOriginalA1AimChangedImpactCells<0||
    !Number.isSafeInteger(ally.genuineOriginalA1AimImpactEvents)||
    ally.genuineOriginalA1AimImpactEvents<0)){
   this.abort('ALLY_SYNC_GENUINE_A1_PROVENANCE_REQUIRED');
   return this.snapshot();
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
   if((this.variant==='SWITCHBACK'||this.variant==='PAINT_RELAY')&&
      (!f.foot.grounded||!f.foot.realPhysicalOriginalStage)){
    this.abort('SWITCHBACK_NEEDS_SOURCE_GROUND_START');
    return this.snapshot();
   }
   this.routeStart=f.foot;
   this.status='RUNNING';
   this.startTick=f.tick;this.lastTick=f.tick;
   this.baseCells=f.ink.changedHumanImpactCells;
   this.baseImpacts=f.ink.changedHumanImpactEvents;
   if(this.variant==='ALLY_SYNC'&&ally){
    this.initialRealA1Cells=ally.genuineOriginalA1AimChangedImpactCells;
    this.initialRealA1Impacts=ally.genuineOriginalA1AimImpactEvents;
   }
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
  if(this.variant==='ALLY_SYNC'&&ally){
   if(ally.genuineOriginalA1AimChangedImpactCells<this.initialRealA1Cells||
      ally.genuineOriginalA1AimImpactEvents<this.initialRealA1Impacts){
    this.abort('ALLY_SYNC_A1_PROVENANCE_COUNTER_RESET');
    return this.snapshot();
   }
   this.realA1ChangedImpactCells=
    ally.genuineOriginalA1AimChangedImpactCells-this.initialRealA1Cells;
   this.realA1OriginalImpactEvents=
    ally.genuineOriginalA1AimImpactEvents-this.initialRealA1Impacts;
  }
  const routeMode=this.variant==='SWITCHBACK'||this.variant==='PAINT_RELAY';
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
   // For PAINT_RELAY, a player who has already arrived at the real
   // original-ground turn/return threshold may complete the ink quota
   // while STATIONARY. Untrusted physical deltas still fail closed.
   if(routeMode&&this.routeStart&&
      xz<=MAX_GROUNDED_TRAVEL_PER_TICK&&Math.abs(dy)<.32&&
      (xz>0||this.variant==='PAINT_RELAY')){
     const dist=Math.hypot(f.foot.x-this.routeStart.x,
                           f.foot.z-this.routeStart.z);
     if(!this.routeOutReached&&dist>=B56_SWITCHBACK_OUT_METERS&&
        (this.variant!=='PAINT_RELAY'||
         this.actualCells>=B57_RELAY_CELLS_PER_LEG)){
      this.routeOutReached=true;
      this.routeOutAtGroundMeters=this.groundedMeters;
      if(this.variant==='PAINT_RELAY')
       this.relayTurnPaintCells=this.actualCells;
     }else if(this.routeOutReached&&!this.routeReturned&&
              dist<=B56_SWITCHBACK_HOME_RADIUS_METERS&&
              this.groundedMeters-this.routeOutAtGroundMeters>=
               B56_SWITCHBACK_OUT_METERS-B56_SWITCHBACK_HOME_RADIUS_METERS&&
              (this.variant!=='PAINT_RELAY'||
               this.actualCells-this.relayTurnPaintCells>=
                B57_RELAY_CELLS_PER_LEG)){
      this.routeReturned=true;
      if(this.variant==='PAINT_RELAY')
       this.relayReturnPaintCells=this.actualCells;
     }
   }
   if(routeMode&&xz>MAX_GROUNDED_TRAVEL_PER_TICK){
    this.abort('SWITCHBACK_INVALID_PHYSICAL_DISPLACEMENT');
    return this.snapshot();
   }
  }
  if(routeMode&&old&&
     (!old.grounded||!f.foot.grounded||
      !old.realPhysicalOriginalStage||!f.foot.realPhysicalOriginalStage||
      !old.alive||!f.foot.alive||f.tick!==this.lastTick+1)){
   this.abort('SWITCHBACK_NOT_CONTINUOUS_ORIGINAL_GROUND');
   return this.snapshot();
  }
  this.lastFoot=f.foot;this.lastTick=f.tick;
  if(this.actualCells>=B25_SOURCE_PAINT_RUN_REQUIRED_CELLS&&
     this.groundedMeters>=B25_SOURCE_PAINT_RUN_REQUIRED_GROUNDED_METERS&&
     (this.variant==='CLASSIC'||this.variant==='ALLY_SYNC'||
      this.routeReturned)&&
     (this.variant!=='ALLY_SYNC'||(
      this.realA1ChangedImpactCells>=B161_ALLY_REAL_IMPACT_CELLS&&
      this.realA1OriginalImpactEvents>0))&&
     (this.variant!=='PAINT_RELAY'||
      this.actualCells-this.relayReturnPaintCells>=
       B57_RELAY_CELLS_PER_LEG)){
   this.status='CLEAR';
   const elapsed=f.tick-this.startTick;
   this.clearsByVariant[this.variant]++;
   this.validClears=this.clearsByVariant[this.variant];
   this.lastClearTicks=elapsed;
   this.newBest=this.bestByVariant[this.variant]===null||
    elapsed<this.bestByVariant[this.variant]!;
   if(this.newBest)this.bestByVariant[this.variant]=elapsed;
   this.bestTicks=this.bestByVariant[this.variant];
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
   practiceVariant:this.variant,
   routeTurnReached:this.routeOutReached,
   routeReturned:this.routeReturned,
   routeDistanceFromStartMeters:this.routeStart&&this.lastFoot?
    Number(Math.hypot(this.lastFoot.x-this.routeStart.x,
                      this.lastFoot.z-this.routeStart.z).toFixed(2)):0,
   relayCellsPerLeg:B57_RELAY_CELLS_PER_LEG,
   relayTurnPaintCells:this.relayTurnPaintCells,
   relayReturnPaintCells:this.relayReturnPaintCells,
   relayStage:this.variant!=='PAINT_RELAY'?'NOT_REQUIRED' as const:
    !this.routeOutReached?'OUTBOUND_PAINT' as const:
    !this.routeReturned?'RETURN_PAINT' as const:
    this.status==='CLEAR'?'COMPLETE' as const:'FINISH_PAINT' as const,
   relayStagePaintCells:this.variant!=='PAINT_RELAY'?0:
    !this.routeOutReached?this.actualCells:
    !this.routeReturned?Math.max(0,this.actualCells-this.relayTurnPaintCells):
    Math.max(0,this.actualCells-this.relayReturnPaintCells),
   routeOutMeters:B56_SWITCHBACK_OUT_METERS,
   routeHomeRadiusMeters:B56_SWITCHBACK_HOME_RADIUS_METERS,
   routePhase:this.variant==='CLASSIC'||this.variant==='ALLY_SYNC'?
    'NOT_REQUIRED' as const:
    !this.routeOutReached?'OUTBOUND' as const:
    !this.routeReturned?'RETURN' as const:'COMPLETE' as const,
   mode:'OPTIONAL_NONSCORING_SOURCE_PAINT_RUN' as const,
   originalStageVerified:true as const,
   gameplaySource:'REAL_HUMAN_AUTHORITATIVE_INK_AND_RAPIER_FOOT' as const,
   allottedTicks:B25_SOURCE_PAINT_RUN_TICKS,
   elapsedTicks:elapsed,
   secondsRemaining:Math.ceil((B25_SOURCE_PAINT_RUN_TICKS-elapsed)/60),
   humanChangedImpactCells:this.actualCells,
   requiredHumanChangedCells:B25_SOURCE_PAINT_RUN_REQUIRED_CELLS,
   humanImpactEvents:this.actualImpacts,
   actualOriginalA1ChangedImpactCells:this.realA1ChangedImpactCells,
   actualOriginalA1TaggedImpactEvents:this.realA1OriginalImpactEvents,
   requiredOriginalA1ChangedImpactCells:B161_ALLY_REAL_IMPACT_CELLS,
   originalA1CooperativeGoalSatisfied:this.variant==='ALLY_SYNC'&&
    this.realA1ChangedImpactCells>=B161_ALLY_REAL_IMPACT_CELLS&&
    this.realA1OriginalImpactEvents>0,
   cooperativeModeNeverCertifiesOpponentEngagement:true as const,
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
