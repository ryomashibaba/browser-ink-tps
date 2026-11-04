/** B450: diagnostic read-only first denial along the EXISTING native
 * path sampled every 0.30m, not a second authorization gate. */
export interface B450Point{readonly x:number;readonly y:number;readonly z:number}
export interface B450Ray{readonly supported:boolean;readonly solidId:string|null;readonly gapMeters:number|null}
export interface B450DeniedSample{
 readonly cause:'NONE'|'EMPTY_NATIVE_PATH'|'INVALID_NATIVE_SEGMENT'|
  'OUTSIDE_ORIGINAL_REGION'|'NO_RAPIER_HIT'|
  'NATIVE_PATH_RAPIER_HEIGHT_MISMATCH'|
  'UNREGISTERED_OR_UNSUPPORTED_RAPIER_SOLID';
 readonly xyz:[number,number,number]|null;
 readonly leg:number|null;readonly sample:number|null;
 readonly checked:number;readonly hitSolidId:string|null;
 readonly verticalGapMeters:number|null;
}
export interface B450FailedOriginalGoal{
 readonly originalGoal:[number,number,number];
 readonly originalGoalSolidId:string;
 readonly nativePathPointCount:number;
 readonly firstDenied:B450DeniedSample;
}
export function b450FirstSourceDenial(points:readonly B450Point[],sign:number,
 readRapier:(p:B450Point)=>B450Ray):B450DeniedSample{
 let checked=0;
 const result=(cause:B450DeniedSample['cause'],p:B450Point|null,
  leg:number|null,sample:number|null,ray?:B450Ray):B450DeniedSample=>({
  cause,xyz:p&&[p.x,p.y,p.z].every(Number.isFinite)?
   [p.x,p.y,p.z]:null,leg,sample,checked,
  hitSolidId:ray?.solidId??null,verticalGapMeters:ray?.gapMeters??null
 });
 const probe=(p:B450Point,leg:number,k:number):B450DeniedSample|null=>{
  checked++;
  if(![p.x,p.y,p.z].every(Number.isFinite))
   return result('INVALID_NATIVE_SEGMENT',p,leg,k);
  if(p.z*sign<33||p.y<2.5||p.y>5.5)
   return result('OUTSIDE_ORIGINAL_REGION',p,leg,k);
  const ray=readRapier(p);
  if(ray.supported)return null;
  // The authorizing W10-B4 original gate remains UNCHANGED. B451 only
  // explains whether a rejected sample had actual original Rapier contact.
  // A 0.251m gap is still a DENIAL; it is never rounded down or promoted.
  if(ray.solidId===null)return result('NO_RAPIER_HIT',p,leg,k,ray);
  if(ray.gapMeters!==null&&Number.isFinite(ray.gapMeters)&&
     ray.gapMeters>.25)
   return result('NATIVE_PATH_RAPIER_HEIGHT_MISMATCH',p,leg,k,ray);
  return result('UNREGISTERED_OR_UNSUPPORTED_RAPIER_SOLID',p,leg,k,ray);
 };
 if(points.length===0)return result('EMPTY_NATIVE_PATH',null,null,null);
 if(points.length===1)return probe(points[0]!,0,0)??result('NONE',null,null,null);
 for(let leg=0;leg+1<points.length;leg++){
  const a=points[leg]!,b=points[leg+1]!;
  const meters=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
  if(!Number.isFinite(meters))return result('INVALID_NATIVE_SEGMENT',null,leg,null);
  const segments=Math.max(1,Math.ceil(meters/.30));
  for(let k=leg===0?0:1;k<=segments;k++){
   const f=k/segments,p={x:a.x+(b.x-a.x)*f,
    y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f};
   const denied=probe(p,leg,k);
   if(denied)return denied;
  }
 }
 return result('NONE',null,null,null);
}
