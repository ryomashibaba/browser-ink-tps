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
 foot:B216SourcePoint,realAuditedGoal:B216SourcePoint,
 nativeWeaponFacing?:B216SourcePoint,
 distanceBand:'LOCAL'|'DISTANT_ORIGINAL_ONLY'='LOCAL'
):readonly B216OriginalCandidate[]{
 if(distanceBand!=='LOCAL'&&distanceBand!=='DISTANT_ORIGINAL_ONLY')return [];
 if(![foot.x,foot.y,foot.z,realAuditedGoal.x,realAuditedGoal.y,
  realAuditedGoal.z].every(Number.isFinite))return [];
 const dx=realAuditedGoal.x-foot.x,dz=realAuditedGoal.z-foot.z;
 const span=Math.hypot(dx,dz);
 if(!Number.isFinite(span))return [];
 // Once the REAL Recast goal is reached, its foot-to-goal vector no
 // longer supplies a heading. Only the already-live CPU weapon facing
 // may orient local paint proposals. No authored fallback direction,
 // new route, collision, target Actor or unverified ink cell is added.
 // Every proposal still requires the caller's actual original-grid
 // ownership sample and registered Rapier foot/shot-line approval.
 const atGoal=span<.40;
 if(atGoal&&(!nativeWeaponFacing||
  ![nativeWeaponFacing.x,nativeWeaponFacing.y,nativeWeaponFacing.z]
   .every(Number.isFinite)||
  Math.hypot(nativeWeaponFacing.x,nativeWeaponFacing.z)<.05))return [];
 const heading=atGoal?
  Math.atan2(nativeWeaponFacing!.z,nativeWeaponFacing!.x):
  Math.atan2(dz,dx);
 const result:B216OriginalCandidate[]=[];
 // The original B64 frontal sweep runs FIRST. At a REAL reached
 // patrol goal its direction disappears, so search the already-existing
 // B64 1.7m short radius as well as B216's 2.5/3.5m lateral/rear
 // candidates. Every location remains just an untrusted proposal until
 // ORIGINAL ownerGrid, Rapier supports, ray and weapon range approve it.
 // No geometry, nav path, actor relocation or firing bypass is created.
 // Research-only OUTER proposals are not accepted aims, paths, ink or hits.
 // The caller must separately verify the real source grid, actual weapon
 // range and both original Rapier support and first blocking ray.
 const radii=distanceBand==='DISTANT_ORIGINAL_ONLY'?
  ([4.5,5.5] as const):
  atGoal?([1.7,2.5,3.5] as const):([2.5,3.5] as const);
 // Preserve the proven six offset proposals while en route. At a
 // genuinely reached native goal B64's foot-to-goal forward vector
 // vanishes, so complete all eight 45-degree directions around the
 // ACTUAL finite weapon-facing vector (including forward and its
 // previously omitted diagonal). These remain UNTRUSTED proposals.
 const offsets=atGoal?
  ([0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,
    -3*Math.PI/4,-Math.PI/2,-Math.PI/4] as const):
  ([Math.PI/2,-Math.PI/2,Math.PI,-3*Math.PI/4,
    3*Math.PI/4,Math.PI/4] as const);
 for(const distance of radii){
  for(const offset of offsets){
   const angle=heading+offset;
   result.push({x:foot.x+distance*Math.cos(angle),y:foot.y+.1,
    z:foot.z+distance*Math.sin(angle),radiusMeters:distance,
    angleRadians:offset});
  }
 }
 return result;
}

/** F3 REAL source-only projectile sight. Two DIFFERENT authentic registered
 * solids may both be valid shooting endpoints: a bullet can cross a
 * physical floor seam even when a CPU has NO certified walkable route.
 * This does NOT certify navigation, target contact, combat damage or scoring.
 * Both supports and first actual original Rapier ray are authoritative. */
export interface B216RegisteredOriginalHit {
 readonly solidId:string;
 readonly point:B216SourcePoint;
}
export function b216RealSourcePaintShotLineClear(x:{
 actualFoot:B216SourcePoint;actualTarget:B216SourcePoint;
 footSupport:B216RegisteredOriginalHit|null;
 targetSupport:B216RegisteredOriginalHit|null;
 firstStageBlock:B216RegisteredOriginalHit|null;
}):boolean{
 const valid=(p:B216SourcePoint)=>[p.x,p.y,p.z].every(Number.isFinite);
 const f=x.footSupport,t=x.targetSupport,b=x.firstStageBlock;
 if(!valid(x.actualFoot)||!valid(x.actualTarget)||
    !f||!t||!f.solidId||!t.solidId||
    !valid(f.point)||!valid(t.point)||
    Math.abs(f.point.y-x.actualFoot.y)>.25||
    Math.abs(t.point.y-x.actualTarget.y)>.25)
   return false;
 // An earlier source collider blocks a real projectile. A hit on the
 // ACTUAL target collider at the requested target is not a wall veto.
 // Registered foot/target solid IDs are deliberately NOT required equal:
 // that condition describes a walking seam, not a physical ink shot.
 return !b||(Boolean(b.solidId)&&b.solidId===t.solidId&&
    valid(b.point)&&Math.hypot(
      b.point.x-x.actualTarget.x,
      b.point.y-x.actualTarget.y,
      b.point.z-x.actualTarget.z)<.22);
}
