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
 /** Relative opportunity on ACTUAL original owner-grid cells only.
  * Higher means more enemy/neutral paint near an already-vetted goal. */
 neighborhoodOpportunity:number;
 sampledOriginalCells:number;
 sourceOnly:true;pathAuthorized:false;
}
const priorities:Readonly<Record<OriginalPatrolInkPriority,number>>={
 OTHER_TEAM:3,NEUTRAL:2,UNSAMPLED:1,OWN:0
};

/** Actual authoritative GameplayInkSystem ownerGrid only.
 * Uses ORIGINAL patrol goal/physics world positions already vetted in
 * UndertowF3SourceTraffic. Same-surface nearby ownership is used only
 * for coverage priority; sampleWorld is read-only, never event/apply.
 */
export function rankOriginalSourcePatrolGoals(
 goals:readonly Vec3[],team:Team.A|Team.B,ink:GameplayInkSystem,
 startIndex:number
):OriginalPatrolInkRank[]{
 if(!Number.isSafeInteger(startIndex)||startIndex<0)
  throw Error('W10_B31_UNVERIFIED_START_INDEX');
 const count=goals.length;
 const opportunity=(owner:Team):number=>
  owner===team?0:owner===Team.Neutral?2:3;
 return goals.map((goal,index)=>{
  const sample=ink.sampleWorld(
   new Vec3(goal.x,goal.y+.06,goal.z),.38,SurfaceFlags.Paintable);
  const surface=sample?.surface;
  const sourceOnlySurface=!!surface&&
   surface.id.startsWith('UndertowT21D:')&&
   !surface.isScoreable&&
   (surface.baseFlags&SurfaceFlags.Paintable)!==0;
  // The actual GameplayInkSystem sample can hit a masked (inactive)
  // footprint pixel. Such a neutral owner is NOT real paint opportunity.
  // Old test-only mocks have no surface, and preserve their center result.
  const usable=sourceOnlySurface?
   !!sample&&surface.isCellActive(
    Math.min(surface.widthCells-1,Math.floor(sample.u/surface.cellSize)),
    Math.min(surface.heightCells-1,Math.floor(sample.v/surface.cellSize))):
   !surface;
  const center=usable?sample:null;
  const priority:OriginalPatrolInkPriority=center===null?'UNSAMPLED':
   center.owner===team?'OWN':
   center.owner===Team.Neutral?'NEUTRAL':'OTHER_TEAM';
  let total=center?opportunity(center.owner)*2:priorities.UNSAMPLED;
  let weight=center?2:1,activeCells=center?1:0;
  if(sourceOnlySurface&&center){
   // Use the SURFACE's genuine U/V basis (not synthetic XZ turf).
   // Query four additional nearby existing owner-grid cells without
   // adding goals, scoring, paint, traversal or terrain. Only the
   // exact SAME ORIGINAL surface and active mask count as evidence.
   for(const [du,dv] of [[.75,0],[-.75,0],[0,.75],[0,-.75]] as const){
    const neighbor=ink.sampleWorld(new Vec3(
     goal.x+surface.uAxis.x*du+surface.vAxis.x*dv,
     goal.y+.06+surface.uAxis.y*du+surface.vAxis.y*dv,
     goal.z+surface.uAxis.z*du+surface.vAxis.z*dv
    ),.38,SurfaceFlags.Paintable);
    if(!neighbor||neighbor.surface.id!==surface.id||
       (neighbor.flags&SurfaceFlags.Paintable)===0)continue;
    const cx=Math.min(surface.widthCells-1,
      Math.floor(neighbor.u/surface.cellSize));
    const cy=Math.min(surface.heightCells-1,
      Math.floor(neighbor.v/surface.cellSize));
    if(!surface.isCellActive(cx,cy))continue;
    total+=opportunity(neighbor.owner);weight++;activeCells++;
   }
  }
  return {index,priority,rank:priorities[priority],
   neighborhoodOpportunity:total/weight,
   sampledOriginalCells:activeCells,
   sourceOnly:true as const,pathAuthorized:false as const};
 }).sort((a,b)=>b.neighborhoodOpportunity-a.neighborhoodOpportunity||
  b.rank-a.rank||
  ((a.index-startIndex+count)%Math.max(1,count))-
  ((b.index-startIndex+count)%Math.max(1,count)));
}

/** A source-owned CENTER can still be a genuine paint opportunity when
 * neighboring ACTIVE owner-grid cells of the SAME ORIGINAL source floor
 * remain neutral/enemy ink. This does not grant physics or Recast movement.
 */
export function existingOriginalSourceInkOpportunity(
 rank:OriginalPatrolInkRank
):boolean{
 if(rank.sourceOnly!==true||rank.pathAuthorized!==false||
    !Number.isSafeInteger(rank.sampledOriginalCells)||
    rank.sampledOriginalCells<1||
    !Number.isFinite(rank.neighborhoodOpportunity)||
    rank.neighborhoodOpportunity<=0)return false;
 if(rank.priority==='NEUTRAL'||rank.priority==='OTHER_TEAM')return true;
 // OWN center requires separately observed, same-surface source neighbors.
 return rank.priority==='OWN'&&rank.sampledOriginalCells>=2;
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

/** B34 experimental source-only true-grounded stall recovery. Only a
 * verified in-flight original goal may be reconsidered. A prolonged
 * physically stationary foot is NOT evidence for a new valid route; all
 * alternate candidate approvals remain in UndertowF3SourceTraffic.
 */
export const B34_GROUNDED_STALL_TICKS=36;
export function mayReconsiderStalledOriginalGoal(
 stillGroundedTicks:number,originalGoalIndex:number,
 sourceFootDistanceToOldGoal:number
):boolean{
 return Number.isSafeInteger(stillGroundedTicks)&&
  stillGroundedTicks>=B34_GROUNDED_STALL_TICKS&&
  Number.isSafeInteger(originalGoalIndex)&&originalGoalIndex>=0&&
  Number.isFinite(sourceFootDistanceToOldGoal)&&
  sourceFootDistanceToOldGoal>=1.5;
}

// One native SOURCE gameplay behavior: CPUs may split coverage rather than
// selecting an identical LIVE teammate goal when the actual original ink
// opportunity is otherwise equal. Existing real source-foot goal lists
// are merely reordered; NO navigation, movement, aim, hit or score is
// authorized here. The original Recast/Rapier full-route gate still owns
// every eventual move request.
export function distributeOriginalSourceGoalCoverage(
 sorted:readonly OriginalPatrolInkRank[],
 originalGoals:readonly Vec3[],
 actualTeammateFeetAndApprovedGoals:readonly Readonly<{
  x:number;y:number;z:number
 }>[],
 separationMeters=2.4
):OriginalPatrolInkRank[]{
 if(!Number.isFinite(separationMeters)||separationMeters<=0||
    sorted.length<2)return [...sorted];
 const realPositions=actualTeammateFeetAndApprovedGoals.filter(p=>
  [p.x,p.y,p.z].every(Number.isFinite));
 if(!realPositions.length)return [...sorted];
 const crowded=(entry:OriginalPatrolInkRank):number=>{
  const g=originalGoals[entry.index];
  if(!g||![g.x,g.y,g.z].every(Number.isFinite))return 1;
  return realPositions.some(p=>
   Math.abs(p.y-g.y)<=.6&&
   Math.hypot(p.x-g.x,p.z-g.z)<separationMeters)?1:0;
 };
 const oldOrder=new Map(sorted.map((item,i)=>[item.index,i]));
 return [...sorted].sort((a,b)=>
  // Never trade away a better actually sampled unscored ink opportunity.
  b.neighborhoodOpportunity-a.neighborhoodOpportunity||
  b.rank-a.rank||
  crowded(a)-crowded(b)||
  (oldOrder.get(a.index)??0)-(oldOrder.get(b.index)??0));
}
