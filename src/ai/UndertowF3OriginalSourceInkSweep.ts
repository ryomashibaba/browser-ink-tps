/** W10-B64 — alternative original-source CPU ink ray candidates.
 * Experimental lab only. A sampled target is NOT a traversable path or a
 * guaranteed projectile hit. CPU's real foot/goal and original ink surfaces
 * supply authority; this helper returns ONLY math offsets.
 */
export interface B64SourceAnchor{
 readonly x:number;readonly y:number;readonly z:number;
}
export interface B64NativeAimSample{
 readonly x:number;readonly y:number;readonly z:number;
 readonly angleRadians:number;readonly distanceMeters:number;
}
export function originalGoalInkSweep(
 foot:B64SourceAnchor,goal:B64SourceAnchor
):readonly B64NativeAimSample[]{
 if(![foot.x,foot.y,foot.z,goal.x,goal.y,goal.z].every(Number.isFinite))
  return [];
 const dx=goal.x-foot.x,dz=goal.z-foot.z;
 const span=Math.hypot(dx,dz);
 if(span<1.65)return [];
 const fx=dx/span,fz=dz/span;
 const values:B64NativeAimSample[]=[];
 // Off-axis angles deliberately do not alter Recast goal or actor feet.
 // Avoid behind-foot (unverified) shots and keep within local weapon range.
 for(const d of [2.3,3.0,1.7] as const){
  if(span<d+.15)continue;
  for(const a of [-.63,.63,-1.05,1.05] as const){
   const co=Math.cos(a),si=Math.sin(a);
   const ux=fx*co-fz*si,uz=fz*co+fx*si;
   values.push({x:foot.x+ux*d,
    y:foot.y+(goal.y-foot.y)*(d/span)+.10,
    z:foot.z+uz*d,angleRadians:a,distanceMeters:d});
  }
 }
 return values;
}
