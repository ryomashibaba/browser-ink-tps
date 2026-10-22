/**
 * W10-B112: READ-ONLY genuine human Rapier floor-support witness.
 *
 * This does not replace original KCC grounded state, authorize hidden floor,
 * alter player movement or decide a Nintendo source-derived death boundary.
 * "SUSPECT" is a reproducible diagnostic pattern, NOT proof of a mesh hole.
 */
import type {B114OriginalFootprint} from './W10B114OriginalFootprintAudit';
export type B112FootSample={
 tick:number;
 /** Native body center from PlayerController / Rapier after physics.step. */
 center:[number,number,number];
 grounded:boolean;
 mode:'HUMAN'|'SQUID';
 sourceSolidId:string|null;
 /** Vertical distance from true capsule foot to original ray hit. */
 sourceSupportGapMeters:number|null;
 /** B114: optional read-only actual capsule-width original Rapier witness. */
 footprint?:B114OriginalFootprint;
};

/**
 * W10-B115: observational diagnosis. A source ray is not a KCC collision.
 * Never assume an edge ray proves a floor or turn it into walkable geometry.
 */
export type B115UnsupportedRayContext=
 'EDGE_RAY_VISIBLE_BUT_KCC_UNGROUNDED'|
 'NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED'|
 'FIVE_RAY_WITNESS_NOT_AVAILABLE';
export function classifyB115UnsupportedRayContext(
 frame:B112FootSample
):B115UnsupportedRayContext{
 if(!frame.footprint)return 'FIVE_RAY_WITNESS_NOT_AVAILABLE';
 return frame.footprint.nearPerimeter?
  'EDGE_RAY_VISIBLE_BUT_KCC_UNGROUNDED':
  'NO_NEAR_ORIGINAL_FOOT_RAY_KCC_UNGROUNDED';
}
function cloneB115Footprint(f:B114OriginalFootprint):B114OriginalFootprint{
 return {...f,originalBody:[...f.originalBody],
  probes:f.probes.map(p=>({...p})),
  observedSourceSolidIds:[...f.observedSourceSolidIds]};
}
export type B112FloorSuspicion={
 status:'SUSPECT_UNSUPPORTED_DESCENT_NOT_PROVEN_FLOOR_HOLE';
 firstUnsupportedNativeTick:number;
 detectedNativeTick:number;
 actualFirstUnsupportedBody:[number,number,number];
 actualDetectedBody:[number,number,number];
 previousSupportedBody:[number,number,number]|null;
 downwardMeters:number;
 /** W10-B115, read-only actual 5-ray context at detection. */
 nativeFootprintAtDetection:B114OriginalFootprint|null;
 unsupportedRayVsKccContext:B115UnsupportedRayContext;
 rayHitDoesNotProveKccCollision:true;
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
  if(s.footprint&&(
    s.footprint.nativeTick!==s.tick||
    s.footprint.mode!==s.mode||
    s.footprint.originalBody.some((value,i)=>value!==s.center[i])||
    s.footprint.probes.length!==5||
    s.footprint.noActorMutation!==true||
    s.footprint.originalGeometryAdded!==0||
    s.footprint.originalFloorHoleCertified!==false))
   throw Error('B114_NATIVE_FOOTPRINT_NOT_ORIGINAL_READ_ONLY');
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
     nativeFootprintAtDetection:s.footprint?
      cloneB115Footprint(s.footprint):null,
     unsupportedRayVsKccContext:classifyB115UnsupportedRayContext(s),
     rayHitDoesNotProveKccCollision:true,
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
   lastOriginalFootprint:this.last?.footprint?
    cloneB115Footprint(this.last.footprint):null,
   genuineKccGrounded:this.last?.grounded??null,
   currentUnsupportedNativeTicks:this.consecutiveUnsupportedTicks,
   observedNativeTicks:this.samples.length,
   actualNativeFeet:this.samples.map(s=>({
    tick:s.tick,body:[...s.center],grounded:s.grounded,mode:s.mode,
    sourceSolidId:s.sourceSolidId,gapMeters:s.sourceSupportGapMeters,
    footprint:s.footprint?cloneB115Footprint(s.footprint):undefined
   })),
   suspicionCount:this.suspicions.length,
   suspicions:this.suspicions.map(e=>({...e,
    actualFirstUnsupportedBody:[...e.actualFirstUnsupportedBody],
    actualDetectedBody:[...e.actualDetectedBody],
    nativeFootprintAtDetection:e.nativeFootprintAtDetection?
     cloneB115Footprint(e.nativeFootprintAtDetection):null,
    realNativeFramesBeforeDetection:e.realNativeFramesBeforeDetection.map(row=>({
     ...row,center:[...row.center] as [number,number,number],
     footprint:row.footprint?cloneB115Footprint(row.footprint):undefined
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
