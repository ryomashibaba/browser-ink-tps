/**
 * W10-B31: Source-ONLY paint-aware ranking over a PREEXISTING vetted
 * original-foot patrol candidate array. Ranking grants no navigation,
 * collision, actor placement, ink ownership, score or path authority.
 * Real Recast + Rapier candidate checks remain mandatory downstream.
 */
import {Vec3} from 'playcanvas';
import {Team,SurfaceFlags} from '../ink/types';
import type {GameplayInkSystem} from '../ink/GameplayInkSystem';

export type OriginalPatrolInkPriority='OTHER_TEAM'|'NEUTRAL'|'UNSAMPLED'|'OWN';
export interface OriginalPatrolInkRank{
 index:number;priority:OriginalPatrolInkPriority;rank:number;
 sourceOnly:true;pathAuthorized:false;
}
const priorities:Readonly<Record<OriginalPatrolInkPriority,number>>={
 OTHER_TEAM:3,NEUTRAL:2,UNSAMPLED:1,OWN:0
};

/** Actual authoritative GameplayInkSystem ownerGrid only.
 * Uses ORIGINAL patrol goal/physics world positions already vetted in
 * UndertowF3SourceTraffic. sampleWorld is read-only, never event/apply.
 */
export function rankOriginalSourcePatrolGoals(
 goals:readonly Vec3[],team:Team.A|Team.B,ink:GameplayInkSystem,
 startIndex:number
):OriginalPatrolInkRank[]{
 if(!Number.isSafeInteger(startIndex)||startIndex<0)
  throw Error('W10_B31_UNVERIFIED_START_INDEX');
 const count=goals.length;
 return goals.map((goal,index)=>{
  const sample=ink.sampleWorld(
   new Vec3(goal.x,goal.y+.06,goal.z),.38,SurfaceFlags.Paintable);
  const priority:OriginalPatrolInkPriority=sample===null?'UNSAMPLED':
   sample.owner===team?'OWN':
   sample.owner===Team.Neutral?'NEUTRAL':'OTHER_TEAM';
  return {index,priority,rank:priorities[priority],
   sourceOnly:true as const,pathAuthorized:false as const};
 }).sort((a,b)=>b.rank-a.rank||
  ((a.index-startIndex+count)%Math.max(1,count))-
  ((b.index-startIndex+count)%Math.max(1,count)));
}

/** B33 experimental: original-source goal hysteresis. Keep the PREVIOUSLY
 * Rapier/Recast-approved goal during an actual trip, then rerank ownerGrid
 * after coming within the already established 1.5m arrival radius.
 * This only reorders indices; original physical/nav acceptance remains
 * mandatory on every chooseSourceGoal call.
 */
export function prioritizeExistingInFlightSourceGoal(
 sorted:readonly OriginalPatrolInkRank[],goals:readonly Vec3[],
 activeIndex:number,realFoot:Vec3,arrivalMeters=1.5
):OriginalPatrolInkRank[]{
 const candidate=goals[activeIndex];
 if(!candidate||activeIndex<0||!Number.isSafeInteger(activeIndex)||
    ![realFoot.x,realFoot.y,realFoot.z].every(Number.isFinite))
  return [...sorted];
 const distance=Math.hypot(realFoot.x-candidate.x,realFoot.z-candidate.z);
 if(!Number.isFinite(distance)||distance<arrivalMeters)return [...sorted];
 const entry=sorted.find(e=>e.index===activeIndex);
 return entry?[entry,...sorted.filter(e=>e.index!==activeIndex)]:[...sorted];
}
