/** B169 original-source advance guard ranking only. Every physical
 * endpoint and native path is independently revalidated by the caller. */
export type B169Foot=Readonly<{x:number;y:number;z:number}>;
export function rankB169OriginalAdvanceGuardGoals(input:{
 enabled:boolean;allySyncPracticeRunning:boolean;
 /** B196 player-selected A1 co-op: prefer genuine audited near-landing feet. */
 preferPlayableCoopNearGuard?:boolean;
 humanGrounded:boolean;humanActive:boolean;
 realUpperHumanFoot:B169Foot;realLowerA1Foot:B169Foot;
 authoredHumanDropLanding:B169Foot;
 alreadyAuditedOriginalPatrolFeet:readonly B169Foot[];
}):B169Foot[]{
 const {realUpperHumanFoot:h,realLowerA1Foot:a,
  authoredHumanDropLanding:d}=input;
 const valid=(p:B169Foot)=>[p.x,p.y,p.z].every(Number.isFinite);
 if(!input.enabled||!input.allySyncPracticeRunning||
  !input.humanGrounded||!input.humanActive||
  !valid(h)||!valid(a)||!valid(d)||
  h.y<7||h.y>9.5||h.z<33||a.y<2.7||a.y>5.25||
  a.z<33||d.y<2.5||d.y>5.5||d.z<33)return [];
 return input.alreadyAuditedOriginalPatrolFeet.filter(g=>{
  if(!valid(g)||g.y<2.7||g.y>5.25||
   g.z<33||Math.abs(g.y-a.y)>.5)return false;
  const meters=Math.hypot(g.x-d.x,g.z-d.z);
  // Never camp on the real future drop landing or invent a crossing.
  if(meters<2.8||meters>17)return false;
  if(input.preferPlayableCoopNearGuard){
   // B198 repair: real B196 native Chrome failed after A1 stood 0.61m
   // from the arriving human and blocked the ORIGINAL W200 first drop.
   // Use the genuinely observed *upper human foot* and ALREADY AUTHORED
   // original landing only as a conservative EXCLUSION, never as a
   // claimed route/path/authorization. A1 gets no candidate directly in
   // the player's occupied source-side descent ingress strip.
   // The CPU's real goal still needs all unchanged native Recast/Rapier
   // original endpoints and intermediate supports in SourceTraffic.
   const approachX=h.x-d.x,approachZ=h.z-d.z;
   const lengthSquared=approachX*approachX+approachZ*approachZ;
   if(lengthSquared<1)return false;
   const t=((g.x-d.x)*approachX+(g.z-d.z)*approachZ)/lengthSquared;
   const clamped=Math.max(0,Math.min(1,t));
   const dx=g.x-(d.x+clamped*approachX);
   const dz=g.z-(d.z+clamped*approachZ);
   // This is an avoidance corridor only. It does NOT grant any route.
   if(t>=0&&t<=1&&Math.hypot(dx,dz)<1.8)return false;
  }
  return true;
 }).slice().sort((u,v)=>{
  const aDist=Math.hypot(u.x-d.x,u.z-d.z);
  const bDist=Math.hypot(v.x-d.x,v.z-d.z);
  // Original experimental QA retains the prior 5m guard. B194 real
  // player-selected session failed with A1 3.57m away and zero native
  // A1 shots; the existing A1 standoff/ink requires a genuinely near foot.
  // Rank ONLY the same previously audited original patrol feet closer to
  // the real authored landing. Physical Rapier + full Recast proof are
  // still mandatory in SourceTraffic for the chosen candidate.
  // Avoid B196's blindly tight 3m camp; place A1 with room for
  // actual HUMAN KCC collision while retaining pre-audited patrol feet.
  const preferred=input.preferPlayableCoopNearGuard?4:5;
  return Math.abs(aDist-preferred)-Math.abs(bDist-preferred)||
   aDist-bDist||u.x-v.x||u.z-v.z;
 });
}
