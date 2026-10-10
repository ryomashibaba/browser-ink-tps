import RAPIER from '@dimforge/rapier3d-compat';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {
  PLAYER_CHARACTER_PHYSICS,
  createConfiguredPlayerCharacterController
} from '../../player/PlayerCharacterPhysics';
import {RapierStagePhysics} from '../../physics/RapierStagePhysics';

type Foot=Readonly<{x:number;y:number;z:number}>;
export type Phase14JRejoinResult=Readonly<{
  approved:boolean;
  cause:'CONTINUOUS_CLEAR'|'BLOCKED_BY_SOURCE_COLLIDER';
  requestedMeters:number;
  computedMeters:number;
  collisionDeltaMeters:number;
  maximumSpeedMeters:number;
}>;

/**
 * Collision preflight for the tiny T21-only, lower-level CPU handoff correction.
 * It uses the SAME full original-backed static solids as the QA runtime and
 * the SAME HUMAN capsule/KCC shape and Rapier callback as PlayerController.
 * NEVER returns an invented floor, nav link or movement position. The CPU
 * retains authority over the already-proven source-backed Recast target.
 *
 * The exported function also accepts isolated test Rapier worlds with
 * extra obstacles to prove that an actual collider blocks passage.
 */
export function auditPhase14JRapierRejoinStep(
  physics:RapierStagePhysics,from:Foot,to:Foot,dt:number
):Phase14JRejoinResult {
  if(!Number.isFinite(dt)||Math.abs(dt-1/60)>1e-8||
     ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite))
    throw Error('T21_PHASE14J_INVALID_60HZ_OR_POSITION');
  const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
  const requested=Math.hypot(dx,dy,dz);
  const maxSpeed=GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt;
  if(requested>maxSpeed+1e-5)
    throw Error('T21_PHASE14J_OVERSPEED_REJOIN_REQUEST');
  if(requested<1e-8)
    return {approved:true,cause:'CONTINUOUS_CLEAR',requestedMeters:0,
      computedMeters:0,collisionDeltaMeters:0,maximumSpeedMeters:maxSpeed};
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const world=physics.world;
  const body=world.createRigidBody(RAPIER.RigidBodyDesc
    .kinematicPositionBased().setTranslation(from.x,from.y+offset,from.z));
  const collider=world.createCollider(RAPIER.ColliderDesc.capsule(
    PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
    PLAYER_CHARACTER_PHYSICS.humanRadiusMeters
  ),body);
  const controller=createConfiguredPlayerCharacterController(world);
  try{
    controller.computeColliderMovement(collider,{x:dx,y:dy,z:dz},
      undefined,undefined,c=>physics.shouldCharacterCollide(c,'HUMAN'));
    const actual=controller.computedMovement();
    const xzMismatch=Math.hypot(actual.x-dx,actual.z-dz);
    const yMismatch=Math.abs(actual.y-dy);
    const mismatch=Math.hypot(xzMismatch,yMismatch);
    // No wall clipping, no floor-stair/auto-step teleport and no lateral
    // slide disguised as a full-speed step. Small subvoxel KCC tolerances
    // are allowed; all movement remains bound to original-source NavMesh.
    const approved=xzMismatch<=0.022&&yMismatch<=0.09;
    return {
      approved,cause:approved?'CONTINUOUS_CLEAR':'BLOCKED_BY_SOURCE_COLLIDER',
      requestedMeters:requested,
      computedMeters:Math.hypot(actual.x,actual.y,actual.z),
      collisionDeltaMeters:mismatch,maximumSpeedMeters:maxSpeed
    };
  }finally{
    world.removeCharacterController(controller);
    world.removeRigidBody(body);
  }
}
