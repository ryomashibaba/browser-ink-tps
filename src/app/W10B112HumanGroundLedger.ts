/**
 * W10-B112: READ-ONLY genuine human Rapier floor-support witness.
 *
 * This does not replace original KCC grounded state, authorize hidden floor,
 * alter player movement or decide a Nintendo source-derived death boundary.
 * "SUSPECT" is a reproducible diagnostic pattern, NOT proof of a mesh hole.
 */
export type B112FootSample={
 tick:number;
 /** Native body center from PlayerController / Rapier after physics.step. */
 center:[number,number,number];
 grounded:boolean;
 mode:'HUMAN'|'SQUID';
 sourceSolidId:string|null;
 /** Vertical distance from true capsule foot to original ray hit. */
 sourceSupportGapMeters:number|null;
};

export type B112FloorSuspicion={
 status:'SUSPECT_UNSUPPORTED_DESCENT_NOT_PROVEN_FLOOR_HOLE';
 firstUnsupportedNativeTick:number;
 detectedNativeTick:number;
 actualFirstUnsupportedBody:[number,number,number];
 actualDetectedBody:[number,number,number];
 previousSupportedBody:[number,number,number]|null;
 downwardMeters:number;
 /** Measured pre-trigger frames retained across a real respawn. */
 realNativeFramesBeforeDetection:readonly B112FootSample[];
 originalSourceSupportIdAtDetection:null;
 originalStageGeometryModified:false;
 playerPositionChangedByMonitor:false;
};

const HOLD_TICKS=8;
const MIN_DROP_METERS=.18;
const NEAR_SUPPORT_GAP_METERS=.42;
const MAX_SUSPICIONS=12;
const HISTORY=24;
export class W10B112HumanGroundLedger {
 private last:B112FootSample|null=null;
 private lastSupported:B112FootSample|null=null;
 private unsupportedStart:B112FootSample|null=null;
 private consecutiveUnsupportedTicks=0;
 private latched=false;
 private samples:B112FootSample[]=[];
 private suspicions:B112FloorSuspicion[]=[];
 public reset(){
  this.last=null;this.lastSupported=null;this.unsupportedStart=null;
  this.consecutiveUnsupportedTicks=0;this.latched=false;
  this.samples=[];this.suspicions=[];
 }
 /** Respawn must not erase the evidence of an immediately preceding fall. */
 public resetOnRespawn(){
  this.last=null;this.lastSupported=null;this.unsupportedStart=null;
  this.consecutiveUnsupportedTicks=0;this.latched=false;this.samples=[];
  // Genuine actor reset is not a new source hole; retain previous suspects.
 }
 public observe(input:B112FootSample){
  const s:{[K in keyof B112FootSample]:B112FootSample[K]}={
   ...input,center:[...input.center]
  };
  if(!Number.isSafeInteger(s.tick)||s.tick<0||
     !s.center.every(Number.isFinite)||
     (s.sourceSupportGapMeters!==null&&
      !Number.isFinite(s.sourceSupportGapMeters)))
   throw Error('B112_INVALID_NATIVE_FOOT_WITNESS');
  if(this.last!==null&&s.tick<=this.last.tick)
   throw Error('B112_NONMONOTONIC_NATIVE_TICK');
  if(s.sourceSolidId===null&&s.sourceSupportGapMeters!==null||
     s.sourceSolidId!==null&&s.sourceSupportGapMeters===null)
   throw Error('B112_SOURCE_HIT_ID_GAP_MISMATCH');
  this.samples.push(s);
  if(this.samples.length>HISTORY)this.samples.shift();
  const nearSupport=s.sourceSolidId!==null&&
   Math.abs(s.sourceSupportGapMeters??Infinity)<=NEAR_SUPPORT_GAP_METERS;
  if(s.grounded&&nearSupport)this.lastSupported=s;
  // True source support or renewed original KCC grounding ends a candidate.
  if(s.grounded||nearSupport){
   this.unsupportedStart=null;this.consecutiveUnsupportedTicks=0;
   this.latched=false;
  }else{
   if(!this.unsupportedStart)this.unsupportedStart=s;
   this.consecutiveUnsupportedTicks++;
   const drop=this.unsupportedStart.center[1]-s.center[1];
   const physicallyDescending=this.last!==null&&
    s.center[1]<this.last.center[1]-.001;
   if(!this.latched&&this.consecutiveUnsupportedTicks>=HOLD_TICKS&&
      drop>=MIN_DROP_METERS&&physicallyDescending){
    const event:B112FloorSuspicion={
     status:'SUSPECT_UNSUPPORTED_DESCENT_NOT_PROVEN_FLOOR_HOLE',
     firstUnsupportedNativeTick:this.unsupportedStart.tick,
     detectedNativeTick:s.tick,
     actualFirstUnsupportedBody:[...this.unsupportedStart.center],
     actualDetectedBody:[...s.center],
     previousSupportedBody:this.lastSupported?
      [...this.lastSupported.center]:null,
     downwardMeters:Number(drop.toFixed(6)),
     realNativeFramesBeforeDetection:this.samples.map(row=>({
      ...row,center:[...row.center] as [number,number,number]
     })),
     originalSourceSupportIdAtDetection:null,
     originalStageGeometryModified:false,
     playerPositionChangedByMonitor:false
    };
    this.suspicions.push(event);
    if(this.suspicions.length>MAX_SUSPICIONS)this.suspicions.shift();
    this.latched=true;
   }
  }
  this.last=s;
 }
 public snapshot(){
  return {
   enabled:true as const,
   status:'READ_ONLY_ORIGINAL_RAPIER_FOOT_SUPPORT' as const,
   lastNativeTick:this.last?.tick??null,
   lastOriginalSourceHitId:this.last?.sourceSolidId??null,
   lastOriginalSourceGapMeters:this.last?.sourceSupportGapMeters??null,
   genuineKccGrounded:this.last?.grounded??null,
   currentUnsupportedNativeTicks:this.consecutiveUnsupportedTicks,
   observedNativeTicks:this.samples.length,
   actualNativeFeet:this.samples.map(s=>({
    tick:s.tick,body:[...s.center],grounded:s.grounded,mode:s.mode,
    sourceSolidId:s.sourceSolidId,gapMeters:s.sourceSupportGapMeters
   })),
   suspicionCount:this.suspicions.length,
   suspicions:this.suspicions.map(e=>({...e,
    actualFirstUnsupportedBody:[...e.actualFirstUnsupportedBody],
    actualDetectedBody:[...e.actualDetectedBody],
    realNativeFramesBeforeDetection:e.realNativeFramesBeforeDetection.map(row=>({
     ...row,center:[...row.center] as [number,number,number]
    })),
    previousSupportedBody:e.previousSupportedBody?
     [...e.previousSupportedBody]:null
   })),
   noActorPositionMutation:true as const,
   originalStageGeometryModified:false as const,
   sourceFloorHoleCertified:false as const,
   formal4v4Certified:false as const
  };
 }
}
