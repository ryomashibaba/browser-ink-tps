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
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {auditPhase14JRapierRejoinStep} from './UndertowPhase14JCollisionRejoinGate';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageVector3} from '../StageDefinition';

export type W10TransitionHold =
  | 'HOLD_NO_RAPIER_ENDPOINT_SUPPORT'
  | 'HOLD_NO_NATIVE_RECAST_PATH'
  | 'HOLD_STRAIGHT_CHORD_SOURCE_GAP'
  | 'HOLD_STRAIGHT_CHORD_KCC_BLOCKED'
  | 'HOLD_PENDING_ORIGINAL_KCC_REPLAY';

export interface W10SourceEndpoint {
  readonly point:StageVector3;
  readonly solidId:string|null;
  readonly contactY:number|null;
  readonly verticalErrorMeters:number|null;
  readonly raySupported:boolean;
}
/** A straight chord is NOT the computed Recast route. This read-only
 * witness detects untrusted shortcuts; it NEVER certifies path traversal. */
export interface W10SourceChordAudit {
  readonly straightChordOnly:true;
  readonly interiorRayProbes:number;
  readonly firstUnsupportedFraction:number|null;
  readonly sourceGapSamples:number;
  readonly kccStepsAttempted:number;
  readonly kccBlockedSteps:number;
  readonly kccSweepAttempted:boolean;
  readonly fullTrajectoryReplayed:false;
  readonly sourceCertified:false;
}
export interface W10SourceTransitionResult {
  readonly from:W10SourceEndpoint;
  readonly to:W10SourceEndpoint;
  readonly nativePathReached:boolean;
  readonly chord:W10SourceChordAudit;
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

/** Sample the physical source on a straight chord and only attempt the
 * actual HUMAN capsule controller for short, level, fully ray-supported
 * chords. Recast can take a bend, gravity can change foot height, and the
 * historical original-local trajectories are not in public CI: all results
 * remain HOLD. This never alters colliders, Crowd agents, or source points. */
function auditStraightChord(physics:RapierStagePhysics,
 from:StageVector3,to:StageVector3):W10SourceChordAudit{
 const distance=Math.hypot(to[0]-from[0],to[1]-from[1],to[2]-from[2]);
 const segments=Math.max(1,Math.ceil(distance/.16));
 let firstUnsupportedFraction:number|null=null,sourceGapSamples=0;
 const at=(fraction:number):StageVector3=>[
  from[0]+(to[0]-from[0])*fraction,
  from[1]+(to[1]-from[1])*fraction,
  from[2]+(to[2]-from[2])*fraction
 ];
 for(let i=1;i<segments;i++){
  if(!probeEndpoint(physics,at(i/segments)).raySupported){
   sourceGapSamples++;
   if(firstUnsupportedFraction===null)firstUnsupportedFraction=i/segments;
  }
 }
 const shortLevelChord=distance<=3&&Math.abs(to[1]-from[1])<=.20;
 const kccSweepAttempted=shortLevelChord&&sourceGapSamples===0;
 let kccStepsAttempted=0,kccBlockedSteps=0;
 if(kccSweepAttempted){
  const stepMeters=GAME_CONFIG.cpu.maxSpeedMetersPerSecond/60*.60;
  const count=Math.max(1,Math.ceil(distance/stepMeters));
  for(let i=0;i<count;i++){
   const a=at(i/count),b=at((i+1)/count);
   const check=auditPhase14JRapierRejoinStep(physics,
    {x:a[0],y:a[1],z:a[2]},{x:b[0],y:b[1],z:b[2]},1/60);
   kccStepsAttempted++;
   if(!check.approved)kccBlockedSteps++;
  }
 }
 return {straightChordOnly:true,
  interiorRayProbes:segments-1,firstUnsupportedFraction,sourceGapSamples,
  kccStepsAttempted,kccBlockedSteps,kccSweepAttempted,
  fullTrajectoryReplayed:false,sourceCertified:false};
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
 const chord=auditStraightChord(physics,from,to);
 const nativePathReached=path.reachedTarget &&
  path.startSnapDistanceMeters<=.25 &&
  path.endSnapDistanceMeters<=.25;
 const hold:W10TransitionHold=
  !origin.raySupported||!target.raySupported
   ?'HOLD_NO_RAPIER_ENDPOINT_SUPPORT':
  !nativePathReached
   ?'HOLD_NO_NATIVE_RECAST_PATH':
  chord.sourceGapSamples>0
   ?'HOLD_STRAIGHT_CHORD_SOURCE_GAP':
  chord.kccBlockedSteps>0
   ?'HOLD_STRAIGHT_CHORD_KCC_BLOCKED':
   'HOLD_PENDING_ORIGINAL_KCC_REPLAY';
 return {from:origin,to:target,chord,
  nativePathReached,
  nativeStartSnapMeters:path.startSnapDistanceMeters,
  nativeEndSnapMeters:path.endSnapDistanceMeters,
  hold,kccReplayRequired:true,kccCertified:false,
  sourcePromoted:false,productionAuthorized:false};
}
