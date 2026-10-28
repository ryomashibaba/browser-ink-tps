/**
 * B264: bounded actual native owned-cell sightline research.
 * Read-only F3L original optical triangles + certified Rapier ray results.
 * Optical intersections (including GLASS) are NOT proof of opaque occlusion,
 * a native painted framebuffer pixel, or original Turf/4v4 authority.
 */
import {b263ScreenWitnessGate} from './B263RealInkScreenWitness';
type Params=Parameters<typeof b263ScreenWitnessGate>;
export const B264_MAX_NATIVE_RAYS=24;
export function b264SourceRayGate(p:Params[0],ctx:Params[1],
 raster:Params[2],hidden:Params[3],qaFocus:Params[4]):boolean{
 return p.get('t21B264')==='inkOpticalRays'&&
  b263ScreenWitnessGate(p,ctx,raster,hidden,qaFocus);
}
export type B264PaintedCellSample=Readonly<{
 surfaceId:string;team:'A'|'B';grid:[number,number];
 world:[number,number,number];screenPx:[number,number,number];
 inFront:boolean;insideViewport:boolean
}>;
export function b264SelectNativeVisibleProjectionSamples(
 samples:readonly B264PaintedCellSample[],
 limit=B264_MAX_NATIVE_RAYS){
 if(!Number.isSafeInteger(limit)||limit<1||limit>B264_MAX_NATIVE_RAYS)
  throw Error('B264_UNBOUNDED_OPTICAL_RAY_BUDGET');
 const inside=samples.filter(s=>s.insideViewport&&s.inFront);
 if(inside.some(s=>!s.surfaceId||!s.world.every(Number.isFinite)||
  !s.screenPx.every(Number.isFinite)))
  throw Error('B264_INVALID_NATIVE_OWNER_SAMPLE');
 const step=Math.max(1,Math.ceil(inside.length/limit));
 return inside.filter((_,i)=>i%step===0).slice(0,limit);
}
type Optical=Readonly<{name:string;kind:string;distanceMeters:number}>|null;
type Physical=Readonly<{solidId:string;distanceMeters:number}>|null;
export function b264ClassifyNativePaintSightline(
 rayLengthMeters:number,optical:Optical,physical:Physical){
 if(!Number.isFinite(rayLengthMeters)||rayLengthMeters<=0||
  (optical&&(!Number.isFinite(optical.distanceMeters)||
    optical.distanceMeters<0||optical.distanceMeters>rayLengthMeters+.001))||
  (physical&&(!Number.isFinite(physical.distanceMeters)||
    physical.distanceMeters<0||physical.distanceMeters>rayLengthMeters+.001)))
  throw Error('B264_INVALID_SOURCE_RAY_DEPTH');
 const toleranceMeters=.08;
 const opticalBeforePaint=!!optical&&
  optical.distanceMeters<rayLengthMeters-toleranceMeters;
 const physicalBeforePaint=!!physical&&
  physical.distanceMeters<rayLengthMeters-toleranceMeters;
 return {rayLengthMeters,
  opticalMaterial:opticalBeforePaint?optical!.name:null,
  opticalKind:opticalBeforePaint?optical!.kind:null,
  opticalDistanceMeters:opticalBeforePaint?optical!.distanceMeters:null,
  physicalSolid:physicalBeforePaint?physical!.solidId:null,
  physicalDistanceMeters:physicalBeforePaint?physical!.distanceMeters:null,
  opticalBeforePaint,physicalBeforePaint,
  // Test is double-sided triangle proximity, not real opacity/GPU depth.
  translucentGlassBlocksPaintCertified:false as const,
  realInkFramebufferVisibilityCertified:false as const,
  originalPhysicsUnchanged:true as const,artAccepted:false as const,
  productionAuthorized:false as const};
}
