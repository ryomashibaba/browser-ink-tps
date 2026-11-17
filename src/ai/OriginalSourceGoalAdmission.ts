/**
 * T21 V28 SOURCE-only route admission. A SOURCE-authorized tactical goal
 * must have a complete, layer-aligned native route from the CURRENT Rapier
 * foot before it may be offered to Crowd. None of these Recast observations
 * grants physical travel: every accepted movement still needs Rapier KCC.
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
  readonly endpointErrorMeters:number;
  /** Actual native route vertices, not an invented source path. */
  readonly nativePathPoints:ReadonlyArray<OriginalSourceCpuPoint>;
}
export interface OriginalSourceAdmittedGoal {
  readonly point:OriginalSourceCpuPoint;
  readonly reusedPrevious:boolean;
}
export interface OriginalSourceGoalAdmissionOptions {
  /** Only a still-unrejoined, SOURCE-authorized first-drop from genuine
   * high spawn may use the existing adapter's .25m start projection.
   * All physically rejoined original combat CPU feet remain <=.20m. */
  readonly allowOriginalFirstDropStartSnap?:boolean;
}
const GROUNDED_START_SNAP_METERS=.20;
const FIRST_DROP_START_SNAP_METERS=.25;
const ORIGINAL_GOAL_SNAP_METERS=.22;
const ACTUAL_ROUTE_TERMINAL_METERS=.22;
const RECAST_ENDPOINT_ERROR_METERS=.20;
const MIN_RETAINED_GOAL_DISTANCE_METERS=1.5;
const finitePoint=(p:OriginalSourceCpuPoint):boolean=>
  [p.x,p.y,p.z].every(Number.isFinite);
const distance=(a:OriginalSourceCpuPoint,b:OriginalSourceCpuPoint):number=>
  Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

function reachableOnNativeOriginalMesh(
  foot:OriginalSourceCpuPoint,
  goal:OriginalSourceCpuPoint,
  audit:(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint)=>
    OriginalSourceNativePathEvidence,
  options:OriginalSourceGoalAdmissionOptions
):boolean {
  if(!finitePoint(foot)||!finitePoint(goal))return false;
  const path=audit(foot,goal);
  const native=path.nativePathPoints;
  if(!Array.isArray(native)||!Number.isSafeInteger(path.pointCount)||
     path.pointCount<1||native.length!==path.pointCount||
     !native.every(finitePoint))return false;
  const start=native[0]!,terminal=native[native.length-1]!;
  const maxStart=options.allowOriginalFirstDropStartSnap===true?
    FIRST_DROP_START_SNAP_METERS:GROUNDED_START_SNAP_METERS;
  // auditPath().reachedTarget is relative to the NEAREST PROJECTED
  // endpoint, which can be the wrong floor on a multi-level original stage.
  // Require the actual native start/terminal to align with the true Rapier
  // foot and originally requested SOURCE goal, not merely their projections.
  return path.querySuccess===true&&path.reachedTarget===true&&
    [path.startSnapDistanceMeters,path.endSnapDistanceMeters,
     path.endpointErrorMeters].every(v=>Number.isFinite(v)&&v>=0)&&
    path.startSnapDistanceMeters<=maxStart+1e-6&&
    path.endSnapDistanceMeters<=ORIGINAL_GOAL_SNAP_METERS+1e-6&&
    path.endpointErrorMeters<=RECAST_ENDPOINT_ERROR_METERS+1e-6&&
    distance(start,foot)<=maxStart+1e-6&&
    distance(terminal,goal)<=ACTUAL_ROUTE_TERMINAL_METERS+1e-6;
}

/** Never generate a detour or move an actor. The only fallback is a
 * PREVIOUSLY source-authorized destination, re-audited from this life’s
 * actual CURRENT Rapier foot with the SAME strict layer requirements.
 * A failed fresh and historical goal results in HOLD (null).
 */
export function chooseAuditedOriginalSourceCpuGoal(
  actualFoot:OriginalSourceCpuPoint,
  requested:OriginalSourceCpuPoint,
  previousAuthorized:OriginalSourceCpuPoint|null,
  audit:(from:OriginalSourceCpuPoint,to:OriginalSourceCpuPoint)=>
    OriginalSourceNativePathEvidence,
  options:OriginalSourceGoalAdmissionOptions={}
):OriginalSourceAdmittedGoal|null {
  if(!finitePoint(actualFoot)||!finitePoint(requested))return null;
  if(reachableOnNativeOriginalMesh(actualFoot,requested,audit,options))
    return {point:requested,reusedPrevious:false};
  if(previousAuthorized && finitePoint(previousAuthorized) &&
     distance(previousAuthorized,requested)>.025 &&
     distance(previousAuthorized,actualFoot)>MIN_RETAINED_GOAL_DISTANCE_METERS &&
     reachableOnNativeOriginalMesh(actualFoot,previousAuthorized,audit,options))
    return {point:previousAuthorized,reusedPrevious:true};
  return null;
}
