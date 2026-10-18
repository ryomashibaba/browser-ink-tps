/**
 * W10-A: read-only original-source transition triage.
 *
 * A vertical Rapier ray is NOT a capsule safety proof. A native Recast path
 * is NOT a physical floor proof. Even when BOTH agree, the result remains
 * HOLD until the original-source human KCC trajectory is replayed.
 *
 * Does not change solids, navigation, actors, scoreable masks or production.
 */
import {Vec3} from 'playcanvas';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageVector3} from '../StageDefinition';

export type W10TransitionHold =
  | 'HOLD_NO_RAPIER_ENDPOINT_SUPPORT'
  | 'HOLD_NO_NATIVE_RECAST_PATH'
  | 'HOLD_PENDING_ORIGINAL_KCC_REPLAY';

export interface W10SourceEndpoint {
  readonly point:StageVector3;
  readonly solidId:string|null;
  readonly contactY:number|null;
  readonly verticalErrorMeters:number|null;
  readonly raySupported:boolean;
}
export interface W10SourceTransitionResult {
  readonly from:W10SourceEndpoint;
  readonly to:W10SourceEndpoint;
  readonly nativePathReached:boolean;
  readonly nativeStartSnapMeters:number;
  readonly nativeEndSnapMeters:number;
  readonly hold:W10TransitionHold;
  readonly kccReplayRequired:true;
  readonly kccCertified:false;
  readonly sourcePromoted:false;
  readonly productionAuthorized:false;
}

function probeEndpoint(
 physics:RapierStagePhysics,point:StageVector3
):W10SourceEndpoint{
 const hit=physics.castStageSegment(
  new Vec3(point[0],point[1]+.65,point[2]),
  new Vec3(point[0],point[1]-.65,point[2]),
  'ink-projectile'
 );
 const error=hit?Math.abs(hit.point.y-point[1]):null;
 // A hit is only an endpoint candidate, never the complete walkable route.
 return {point,solidId:hit?.solidId??null,
  contactY:hit?.point.y??null,verticalErrorMeters:error,
  raySupported:error!==null&&error<=.15};
}

/**
 * Inspect only public, already registered frozen-source collision/NavMesh.
 * Never interpret a pass here as terrain authoring permission or safe KCC.
 */
export function auditW10SourceTransition(
 physics:RapierStagePhysics,
 nav:RecastStageNavigation,
 from:StageVector3,
 to:StageVector3
):W10SourceTransitionResult{
 if(![...from,...to].every(Number.isFinite))
  throw Error('W10_SOURCE_AUDIT_NONFINITE_COORDINATE');
 const origin=probeEndpoint(physics,from);
 const target=probeEndpoint(physics,to);
 const path=nav.auditPath(new Vec3(...from),new Vec3(...to));
 const nativePathReached=path.reachedTarget &&
  path.startSnapDistanceMeters<=.25 &&
  path.endSnapDistanceMeters<=.25;
 const hold:W10TransitionHold=
  !origin.raySupported||!target.raySupported
   ?'HOLD_NO_RAPIER_ENDPOINT_SUPPORT':
  !nativePathReached
   ?'HOLD_NO_NATIVE_RECAST_PATH':
   'HOLD_PENDING_ORIGINAL_KCC_REPLAY';
 return {from:origin,to:target,
  nativePathReached,
  nativeStartSnapMeters:path.startSnapDistanceMeters,
  nativeEndSnapMeters:path.endSnapDistanceMeters,
  hold,kccReplayRequired:true,kccCertified:false,
  sourcePromoted:false,productionAuthorized:false};
}
