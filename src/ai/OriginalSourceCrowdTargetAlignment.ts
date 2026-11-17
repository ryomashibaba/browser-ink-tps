/**
 * SOURCE-only final check between an ALREADY strict-native-audited goal
 * and the exact projected coordinate handed to Recast Crowd.
 *
 * Unlike a raw closestPoint() success/fallback, this does not authorize
 * path finding or motion. Actual original Rapier support, the complete
 * OriginalSourceGoalAdmission audit, and each physical KCC step are
 * required separately. A different vertical Recast island is HOLD.
 */
export const ORIGINAL_SOURCE_CROWD_GOAL_ALIGNMENT_METERS=0.22;

export interface OriginalSourceCrowdPoint {
  readonly x:number;
  readonly y:number;
  readonly z:number;
}
const finitePoint=(p:OriginalSourceCrowdPoint):boolean=>
  [p.x,p.y,p.z].every(Number.isFinite);

/** No mutation, route creation, snap relocation, or Actor movement. */
export function isAlignedOriginalSourceCrowdTarget(
  strictlyAdmittedOriginalGoal:OriginalSourceCrowdPoint,
  proposedCrowdTarget:OriginalSourceCrowdPoint
):boolean {
  if(!finitePoint(strictlyAdmittedOriginalGoal)||
     !finitePoint(proposedCrowdTarget))return false;
  const dx=proposedCrowdTarget.x-strictlyAdmittedOriginalGoal.x;
  const dy=proposedCrowdTarget.y-strictlyAdmittedOriginalGoal.y;
  const dz=proposedCrowdTarget.z-strictlyAdmittedOriginalGoal.z;
  return Math.hypot(dx,dy,dz)<=
    ORIGINAL_SOURCE_CROWD_GOAL_ALIGNMENT_METERS+1e-6;
}
