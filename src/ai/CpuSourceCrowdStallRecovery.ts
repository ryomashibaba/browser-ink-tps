/** T21 V28 SOURCE-only bounded recovery decision. This helper never moves an
 * actor, grants a path, or bypasses Rapier KCC. All physical/NavMesh checks
 * are independently required by CpuAgentSystem before proxy refresh. */
export interface CpuSourceRecoveryFoot {
  readonly x:number;readonly y:number;readonly z:number;
}
export interface CpuSourceCrowdStallEvidence {
  readonly actualFoot:CpuSourceRecoveryFoot;
  readonly admittedGoal:CpuSourceRecoveryFoot|null;
  /** Read-only continuity of the true post-KCC foot, not Crowd motion. */
  readonly stationarySeconds:number;
  readonly aliveGroundedPhysicallyRejoined:boolean;
  readonly hasCrowdAgent:boolean;
  readonly alreadyRefreshedThisLife:boolean;
  readonly currentSourceTick:number;
  readonly lastPhysicalBlockTick:number|null;
}
/** 72 genuinely sampled original native ticks without planar progress were
 * observed for B4. A SOURCE-only early review after 1.2s may refresh
 * steering; it must never override a real Rapier rejection or route HOLD.
 * The independent five-second CpuContinuityMonitor QA threshold is unchanged. */
export const SOURCE_CROWD_STALL_SECONDS=1.2;
/** Avoid a 60Hz series of costly Recast/Rapier probes after a held audit. */
export const SOURCE_CROWD_RECOVERY_AUDIT_INTERVAL_TICKS=90;
export const SOURCE_CROWD_BLOCK_QUIET_TICKS=300;
export const SOURCE_COMMITTED_WEAPON_STEERING_GRACE_SECONDS=5;
/**
 * Keep short, legitimate spinner charge/burst and active guard untouched.
 * A 5+ second genuine supported-foot idle is NOT itself proof that a shot
 * is over; allow only a separately fully audited Recast steering-proxy
 * refresh while retaining every weapon/ink/HP state. The one-per-life cap,
 * Rapier veto quiet window and strict route admission remain authoritative.
 */
export function deferSourceCrowdSteeringForCommittedWeapon(
  committedWeaponAction:boolean,
  actualStationarySeconds:number
):boolean {
  return committedWeaponAction &&
    (!Number.isFinite(actualStationarySeconds) ||
     actualStationarySeconds<SOURCE_COMMITTED_WEAPON_STEERING_GRACE_SECONDS);
}
const valid=(p:CpuSourceRecoveryFoot)=>[p.x,p.y,p.z].every(Number.isFinite);

/** Refresh after 1.2 seconds of ACTUAL stationary, with a distant
 * previously admitted goal, no recently blocked Rapier/offmesh movement,
 * and no prior refresh in this CPU life. Route and support proof come next. */
export function shouldRefreshStalledOriginalSourceCrowd(
  evidence:CpuSourceCrowdStallEvidence
):boolean {
  if(!evidence.aliveGroundedPhysicallyRejoined||
     !evidence.hasCrowdAgent||evidence.alreadyRefreshedThisLife||
     !Number.isFinite(evidence.stationarySeconds)||
     evidence.stationarySeconds<SOURCE_CROWD_STALL_SECONDS||
     !Number.isSafeInteger(evidence.currentSourceTick)||
     evidence.currentSourceTick<0||
     !valid(evidence.actualFoot)||
     !evidence.admittedGoal||!valid(evidence.admittedGoal))return false;
  if(Math.hypot(
     evidence.actualFoot.x-evidence.admittedGoal.x,
     evidence.actualFoot.y-evidence.admittedGoal.y,
     evidence.actualFoot.z-evidence.admittedGoal.z)<=1.5)return false;
  const blocked=evidence.lastPhysicalBlockTick;
  if(blocked!==null&&(
     !Number.isSafeInteger(blocked)||blocked<0||
     blocked>evidence.currentSourceTick||
     evidence.currentSourceTick-blocked<=SOURCE_CROWD_BLOCK_QUIET_TICKS))
    return false;
  return true;
}
