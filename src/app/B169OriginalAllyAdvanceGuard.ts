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
  return meters>=2.8&&meters<=17;
 }).slice().sort((u,v)=>{
  const aDist=Math.hypot(u.x-d.x,u.z-d.z);
  const bDist=Math.hypot(v.x-d.x,v.z-d.z);
  // Original experimental QA retains the prior 5m guard. B194 real
  // player-selected session failed with A1 3.57m away and zero native
  // A1 shots; the existing A1 standoff/ink requires a genuinely near foot.
  // Rank ONLY the same previously audited original patrol feet closer to
  // the real authored landing. Physical Rapier + full Recast proof are
  // still mandatory in SourceTraffic for the chosen candidate.
  const preferred=input.preferPlayableCoopNearGuard?3:5;
  return Math.abs(aDist-preferred)-Math.abs(bDist-preferred)||
   aDist-bDist||u.x-v.x||u.z-v.z;
 });
}
