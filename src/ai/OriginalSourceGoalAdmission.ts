/**
 * T21 V28 SOURCE-only route admission.
 * This checks the genuine Recast path from the current, committed Rapier
 * foot to an already SOURCE-authorized tactical goal. Recast reachability
 * is necessary but NEVER sufficient to move: the existing Rapier KCC must
 * still approve every 60 Hz step. No goal or physical foot is synthesized.
 */
export interface OriginalSourceCpuPoint {
  readonly x:number;readonly y:number;readonly z:number;
}
export interface OriginalSourceNativePathEvidence {
  readonly querySuccess:boolean;
  readonly reachedTarget:boolean;
  readonly pointCount:number;
  readonly startSnapDistanceMeters:number;
  readonly endSnapDistanceMeters:number;
}
export interface OriginalSourceAdmittedGoal {
  readonly point:OriginalSourceCpuPoint;
  readonly reusedPrevious:boolean;
}
// Original high-spawn respawn offmesh admission allows .25m; rejoined
// SOURCE combat paths already have a stricter <=.20m adapter gate.
const MAX_ACTUAL_FOOT_NAV_SNAP_METERS=.25;
const MAX_ORIGINAL_GOAL_NAV_SNAP_METERS=.65;
const MIN_RETAINED_GOAL_DISTANCE_METERS=1.5;
const finitePoint=(p:OriginalSourceCpuPoint):boolean=>
  [p.x,p.y,p.z].every(Number.isFinite);
const distance=(a:OriginalSourceCpuPoint,b:OriginalSourceCpuPoint):number=>
  Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

function reachableOnNativeOriginalMesh(
  foot:OriginalSourceCpuPoint,
  goal:OriginalSourceCpuPoint,
  audit:(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint)=>
    OriginalSourceNativePathEvidence
):boolean {
  if(!finitePoint(foot)||!finitePoint(goal))return false;
  const path=audit(foot,goal);
  return path.querySuccess===true && path.reachedTarget===true &&
    Number.isSafeInteger(path.pointCount) && path.pointCount>0 &&
    Number.isFinite(path.startSnapDistanceMeters) &&
    Number.isFinite(path.endSnapDistanceMeters) &&
    path.startSnapDistanceMeters<=MAX_ACTUAL_FOOT_NAV_SNAP_METERS+1e-6 &&
    path.endSnapDistanceMeters<=MAX_ORIGINAL_GOAL_NAV_SNAP_METERS+1e-6;
}

/**
 * Never invent detours or substitute a snapped other-floor goal.
 * If the current request lacks a complete native route, only a previously
 * SOURCE-authorized goal can be reused, and only after it is re-audited
 * from the CPU's CURRENT physical foot. An already reached old goal is
 * not a fallback. Returned points are values, not KCC permissions.
 */
export function chooseAuditedOriginalSourceCpuGoal(
  actualFoot:OriginalSourceCpuPoint,
  requested:OriginalSourceCpuPoint,
  previousAuthorized:OriginalSourceCpuPoint|null,
  audit:(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint)=>
    OriginalSourceNativePathEvidence
):OriginalSourceAdmittedGoal|null {
  if(!finitePoint(actualFoot)||!finitePoint(requested))return null;
  if(reachableOnNativeOriginalMesh(actualFoot,requested,audit))
    return {point:requested,reusedPrevious:false};
  if(previousAuthorized && finitePoint(previousAuthorized) &&
     distance(previousAuthorized,requested)>.025 &&
     distance(previousAuthorized,actualFoot)>MIN_RETAINED_GOAL_DISTANCE_METERS &&
     reachableOnNativeOriginalMesh(actualFoot,previousAuthorized,audit))
    return {point:previousAuthorized,reusedPrevious:true};
  return null;
}
