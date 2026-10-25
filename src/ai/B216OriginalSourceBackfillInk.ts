/**
 * B216: additional SOURCE-ONLY ink aim PROPOSALS when the real B64
 * native patrol-direction floor patches have been exhausted. A proposal
 * is never a playable floor, projectile hit or path; Rapier validates
 * the actual physical floor and projectile sight in the calling app.
 */
export interface B216SourcePoint{readonly x:number;readonly y:number;readonly z:number}
export interface B216OriginalCandidate extends B216SourcePoint{
 readonly radiusMeters:number;readonly angleRadians:number;
}
export function b216OriginalFootBackfillCandidates(
 foot:B216SourcePoint,realAuditedGoal:B216SourcePoint
):readonly B216OriginalCandidate[]{
 if(![foot.x,foot.y,foot.z,realAuditedGoal.x,realAuditedGoal.y,
  realAuditedGoal.z].every(Number.isFinite))return [];
 const dx=realAuditedGoal.x-foot.x,dz=realAuditedGoal.z-foot.z;
 const span=Math.hypot(dx,dz);
 if(!Number.isFinite(span)||span<.40)return [];
 const heading=Math.atan2(dz,dx);
 const result:B216OriginalCandidate[]=[];
 // The original B64 12-angle frontal sweep is kept FIRST. These
 // 12 more local directions include lateral and rearward real ink.
 // Weapon range and original colliders still veto each proposal.
 for(const distance of [2.5,3.5] as const){
  for(const offset of [
   Math.PI/2,-Math.PI/2,Math.PI,-3*Math.PI/4,3*Math.PI/4,
   Math.PI/4
  ] as const){
   const angle=heading+offset;
   result.push({x:foot.x+distance*Math.cos(angle),y:foot.y+.1,
    z:foot.z+distance*Math.sin(angle),radiusMeters:distance,
    angleRadians:offset});
  }
 }
 return result;
}
