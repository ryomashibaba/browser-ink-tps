/**
 * B230 original CI688 local-gap *QA-only* CPU locomotion actuator.
 * Not imported by CpuAgentSystem or the live F3 playable route.
 *
 * Uses native Rapier KCC per 60 Hz tick with unchanged CPU speed/accel.
 * Source-specific authorization is restricted to the two original CI688
 * triangle faces on one mirrored side, plus the original 25 solids.
 * No fake Crowd path, NavMesh snap, time-interpolated superjump or teleport.
 */
import RAPIER, {type Collider,type KinematicCharacterController,
 type RigidBody} from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS as PROFILE,
 createConfiguredPlayerCharacterController} from '../player/PlayerCharacterPhysics';
import {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as CI688}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';

export type B230Side='POSITIVE_Z'|'NEGATIVE_Z';
export type B230Direction='FLOOR_TO_SLOPE'|'SLOPE_TO_FLOOR';
export type B230Status=
 'APPROACH'|'AIRBORNE'|'SETTLING'|'SUCCEEDED'|'FAILED';
export interface B230LocalGapPlan {
 side:B230Side;
 direction:B230Direction;
 start:StageVector3;
 target:StageVector3;
 /** Off by default: a QA-only physical local jump request, never gameplay. */
 permitPhysicalLocalJump:boolean;
}
export interface B230NativeSnapshot {
 phase:B230Status; reason:string|null;
 tick:number;realNativeKccSteps:number;
 groundSupportedAtSpawn:boolean;
 launchAtTick:number|null;launchSpeedMetersPerSecond:number|null;
 launchColliderId:string|null;launchGrounded:boolean;
 leftGround:boolean;landedAfterAirborne:boolean;
 firstTargetGroundedTick:number|null;targetGroundedStreak:number;
 maxTargetGroundedStreak:number;closestGroundedTargetMeters:number|null;
 latestFootColliderId:string|null;currentlyGrounded:boolean;
 existing25CollisionIds:readonly string[];
 actorPosition:readonly [number,number,number];
 totalLocalJumpCommands:number;teleportsAfterInitialQaSpawn:0;
 scene:'27_SOLIDS_25_FROZEN_PLUS_2_EXACT_SOURCE';
 stageCounts:'25/17/26/0';
 cpuNavigationPathCertified:false;actualCpuAgentSystemInstantiated:false;
 sourceQaOnly:true;productionAuthorized:false;officialWinner:'NONE';
 accepted:boolean;
}
const DT=1/60;
const SPEED=GAME_CONFIG.cpu.maxSpeedMetersPerSecond;
const ACCEL=GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2;
const G=GAME_CONFIG.player.gravityMetersPerSecond2;
const JUMP=GAME_CONFIG.player.jumpSpeedMetersPerSecond;
const sourceId=(kind:string,side:B230Side)=>
 'B230_QA:underpass-route-'+kind+
 (side==='POSITIVE_Z'?'-positive-z':'-negative-z');
function validPlan(stage:StageDefinition,plan:B230LocalGapPlan){
 if(stage.metadata.id!=='b230-exact-source-local-cpu-qa'||
  stage.solids.length!==27||stage.paintSurfaces.length!==17||
  stage.navigationLinks?.length!==26||
  stage.solids.slice(0,25).some((s,i)=>s!==FROZEN.solids[i])||
  stage.paintSurfaces.some((s,i)=>s!==FROZEN.paintSurfaces[i])||
  stage.navigationLinks?.some((s,i)=>s!==FROZEN.navigationLinks[i])||
  FROZEN.solids.length!==25||FROZEN.activationReady!==false)
  throw Error('B230_LIVE_OR_UNTRUSTED_STAGE_REFUSED');
 const floor=sourceId('floor-concrete01',plan.side);
 const slope=sourceId('slope00-outer',plan.side);
 const expected=new Set([floor,slope]);
 for(const solid of stage.solids.slice(25)){
  const provenance=CI688.find(r=>'B230_QA:'+r.id===solid.id);
  if(!expected.has(solid.id)||!provenance||
   provenance.side!==plan.side||
   solid.triangleMesh!==provenance.mesh||
   solid.collisionEnabled!==true||
   solid.navigationEnabled!==false)
   throw Error('B230_NONEXACT_OR_NAV_ENABLED_SOURCE_REFUSED');
  expected.delete(solid.id);
 }
 if(expected.size!==0)throw Error('B230_SOURCE_PAIR_INCOMPLETE');
 if(![...plan.start,...plan.target].every(Number.isFinite)||
  !(Math.hypot(plan.target[0]-plan.start[0],
   plan.target[2]-plan.start[2])>2)||
  Math.hypot(plan.target[0]-plan.start[0],
   plan.target[2]-plan.start[2])>8)
  throw Error('B230_NONLOCAL_OR_INVALID_GOAL_REFUSED');
}
export class B230CpuLocalGapQaActuator {
 private readonly physics:RapierStagePhysics;
 private readonly body:RigidBody;
 private readonly collider:Collider;
 private readonly kcc:KinematicCharacterController;
 private readonly plan:B230LocalGapPlan;
 private readonly sourceId:string;
 private readonly targetId:string;
 private readonly initialSupported:boolean;
 private readonly originalCollisionIds=new Set<string>();
 private grounded=false;
 private speed=0;
 private verticalSpeed=-.5;
 private phase:B230Status='APPROACH';
 private failReason:string|null=null;
 private tickIndex=0;
 private stepCount=0;
 private jumpCommands=0;
 private launchAt:number|null=null;
 private launchSpeed:number|null=null;
 private launchCollider:string|null=null;
 private launchWasGrounded=false;
 private leftGround=false;
 private landedAfterAirborne=false;
 private firstTargetTick:number|null=null;
 private targetStreak=0;
 private maxStreak=0;
 private closestError=Infinity;
 private latestCollider:string|null=null;
 constructor(stage:StageDefinition,plan:B230LocalGapPlan){
  validPlan(stage,plan);
  this.plan=plan;
  this.sourceId=sourceId(plan.direction==='FLOOR_TO_SLOPE'
   ?'floor-concrete01':'slope00-outer',plan.side);
  this.targetId=sourceId(plan.direction==='FLOOR_TO_SLOPE'
   ?'slope00-outer':'floor-concrete01',plan.side);
  this.physics=new RapierStagePhysics(DT,stage);
  this.physics.step();
  this.body=this.physics.world.createRigidBody(
   RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    plan.start[0],plan.start[1]+PROFILE.humanFootOffsetMeters+.06,
    plan.start[2]));
  this.collider=this.physics.world.createCollider(
   RAPIER.ColliderDesc.capsule(
    PROFILE.humanHalfHeightMeters,PROFILE.humanRadiusMeters),this.body);
  this.kcc=createConfiguredPlayerCharacterController(this.physics.world);
  // One initial source QA spawn is allowed. Afterwards only native KCC.
  for(let i=0;i<30;i++){
   this.grounded=this.stepNative(0,-.12,0);
   if(this.grounded)break;
  }
  this.latestCollider=this.footSolid();
  this.initialSupported=this.grounded&&this.latestCollider===this.sourceId;
  if(!this.initialSupported)this.fail('INITIAL_EXACT_SOURCE_GROUND_MISSING');
 }
 private footSolid(){
  const p=this.body.translation();
  return this.physics.castCharacterFootSupport(
   new Vec3(p.x,p.y,p.z),PROFILE.humanFootOffsetMeters,'HUMAN')
   ?.solidId??null;
 }
 private stepNative(dx:number,dy:number,dz:number){
  const before=this.body.translation();
  this.kcc.computeColliderMovement(this.collider,new Vec3(dx,dy,dz),
   undefined,undefined,c=>this.physics.shouldCharacterCollide(c,'HUMAN'));
  for(let i=0;i<this.kcc.numComputedCollisions();i++){
   const c=this.kcc.computedCollision(i)?.collider;
   const id=c?this.physics.sourceSolidIdForCollider(c):null;
   if(id&&FROZEN.solids.some(s=>s.id===id))
    this.originalCollisionIds.add(id);
  }
  const corrected=this.kcc.computedMovement();
  this.body.setNextKinematicTranslation({
   x:before.x+corrected.x,y:before.y+corrected.y,z:before.z+corrected.z
  });
  const grounded=this.kcc.computedGrounded();
  this.physics.step();this.stepCount++;
  return grounded;
 }
 private fail(reason:string){
  this.phase='FAILED';this.failReason=reason;
 }
 public advance():B230NativeSnapshot {
  if(this.phase==='FAILED'||this.phase==='SUCCEEDED')return this.snapshot();
  if(++this.tickIndex>240){this.fail('CPU_LOCAL_JUMP_TIMEOUT');return this.snapshot();}
  const p=this.body.translation();
  const dx=this.plan.target[0]-p.x,dz=this.plan.target[2]-p.z;
  const dist=Math.hypot(dx,dz);
  const targetSpeed=Math.min(SPEED,Math.sqrt(2*ACCEL*dist));
  this.speed=Math.max(0,Math.min(targetSpeed,this.speed+ACCEL*DT));
  const progressed=Math.hypot(p.x-this.plan.start[0],p.z-this.plan.start[2]);
  const takeoffAt=this.plan.direction==='FLOOR_TO_SLOPE'?1.52:2.24;
  if(this.plan.permitPhysicalLocalJump&&this.launchAt===null&&
   progressed>=takeoffAt&&this.grounded){
   this.launchCollider=this.footSolid();
   this.launchWasGrounded=this.grounded;
   if(this.launchCollider!==this.sourceId){
    this.fail('TAKEOFF_NOT_ON_EXACT_CI688_SOURCE');
    return this.snapshot();
   }
   this.jumpCommands++;
   this.verticalSpeed=JUMP;
   this.launchAt=this.tickIndex;
   this.launchSpeed=this.speed;
  }
  this.verticalSpeed=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
   this.verticalSpeed-G*DT);
  this.grounded=this.stepNative(
   (dist>1e-8?dx/dist:0)*this.speed*DT,
   this.verticalSpeed*DT,
   (dist>1e-8?dz/dist:0)*this.speed*DT);
  this.latestCollider=this.footSolid();
  if(this.launchAt!==null&&!this.grounded)this.leftGround=true;
  if(this.leftGround&&this.grounded)this.landedAfterAirborne=true;
  if(this.grounded&&this.verticalSpeed<0)this.verticalSpeed=-.5;
  const after=this.body.translation();
  const error=Math.hypot(after.x-this.plan.target[0],
   after.z-this.plan.target[2]);
  if(this.grounded&&this.latestCollider===this.targetId){
   if(this.launchAt!==null&&this.firstTargetTick===null)
    this.firstTargetTick=this.tickIndex;
   this.closestError=Math.min(this.closestError,error);
   if(error<=.65){
    this.targetStreak++;
    this.maxStreak=Math.max(this.maxStreak,this.targetStreak);
   }else this.targetStreak=0;
  }else this.targetStreak=0;
  if(this.originalCollisionIds.size){
   this.fail('UNRELATED_ORIGINAL_STATIC_COLLISION');
  }else if(this.jumpCommands===1&&this.leftGround&&this.landedAfterAirborne&&
   this.targetStreak>=18){
   this.phase='SUCCEEDED';
  }else if(after.y<-15){
   this.fail('NATIVE_KCC_LEFT_SUPPORTED_WORLD');
  }else this.phase=this.jumpCommands===0?'APPROACH':
   this.landedAfterAirborne?'SETTLING':'AIRBORNE';
  return this.snapshot();
 }
 /**
  * B233 Crowd-controlled source run-up, on the ORIGINAL grounded Rapier
  * body that later jumps. A native Crowd foot is steering input only.
  * It NEVER sets the physical pose, creates a fake link, or authorizes CPU.
  * The jump itself is still the B230 genuine KCC computation.
  */
 public advanceSourceCrowdApproachQa(proposedFoot:Readonly<{x:number;y:number;z:number}>){
  const before=this.body.translation();
  const footY=before.y-PROFILE.humanFootOffsetMeters;
  const position:[number,number,number]=[before.x,footY,before.z];
  const reject=(reason:string)=>{
   this.fail(reason);
   return {approved:false,reason,foot:position,
    nativeKccSteps:this.stepCount,speedMetersPerSecond:this.speed,
    grounded:this.grounded,colliderId:this.latestCollider,
    actualMoveMeters:0};
  };
  if(this.phase!=='APPROACH'||this.launchAt!==null||
    !this.grounded||this.latestCollider!==this.sourceId)
   return reject('B233_PRELAUNCH_NOT_ON_EXACT_ORIGINAL_SOURCE');
  if(![proposedFoot.x,proposedFoot.y,proposedFoot.z].every(Number.isFinite))
   return reject('B233_CROWD_PROPOSAL_NONFINITE');
  const dx=proposedFoot.x-before.x,dz=proposedFoot.z-before.z;
  const dist=Math.hypot(dx,dz);
  if(dist>.30||Math.abs(proposedFoot.y-footY)>.18)
   return reject('B233_CROWD_PROPOSAL_OFF_PHYSICAL_SOURCE');
  if(++this.tickIndex>240)return reject('B233_APPROACH_TIMEOUT');
  this.speed=Math.min(SPEED,Math.sqrt(2*ACCEL*dist),
   this.speed+ACCEL*DT);
  const distance=Math.min(dist,this.speed*DT);
  this.grounded=this.stepNative(
   dist>1e-8?dx/dist*distance:0,-.12,
   dist>1e-8?dz/dist*distance:0);
  this.latestCollider=this.footSolid();
  const after=this.body.translation();
  const moved=Math.hypot(after.x-before.x,after.z-before.z);
  if(!this.grounded||this.latestCollider!==this.sourceId)
   return reject('B233_PRELAUNCH_SOURCE_FOOT_LOST');
  if(this.originalCollisionIds.size)
   return reject('B233_PRELAUNCH_UNRELATED_FROZEN_COLLISION');
  if(moved>SPEED*DT+.001)
   return reject('B233_PRELAUNCH_CPU_SPEED_LIMIT');
  return {approved:true,reason:'B233_GENUINE_CROWD_STEERED_NATIVE_KCC',
   foot:[after.x,after.y-PROFILE.humanFootOffsetMeters,after.z] as [number,number,number],
   nativeKccSteps:this.stepCount,speedMetersPerSecond:this.speed,
   grounded:this.grounded,colliderId:this.latestCollider,
   actualMoveMeters:moved};
 }
 /**
  * B232 native-Crowd *steering candidate*, QA only. This method directly
  * continues the SAME genuine Rapier body that finished the B230 jump.
  * Crowd cannot position or teleport this KCC. It requests an XZ step,
  * bounded by real CPU speed; native Rapier computes the actual movement.
  * On unexpected floor, ghost snap or agent drift the session fails shut.
  */
 public advanceNativeCrowdQa(proposedFoot:Readonly<{x:number;y:number;z:number}>):
  Readonly<{approved:boolean;reason:string;actualFoot:readonly[number,number,number];
   sourceFootId:string|null;nativeGrounded:boolean;crowdDeltaXZ:number;
   actualDeltaXZ:number;driftMeters:number;actualKccStepCount:number}>{
  const before=this.body.translation();
  const oldFoot:[number,number,number]=[
   before.x,before.y-PROFILE.humanFootOffsetMeters,before.z];
  const failed=(reason:string,delta=0,actual=0,drift=Infinity)=>{
   this.fail(reason);
   return {approved:false,reason,
    actualFoot:oldFoot as readonly[number,number,number],
    sourceFootId:this.latestCollider,nativeGrounded:this.grounded,
    crowdDeltaXZ:delta,actualDeltaXZ:actual,driftMeters:drift,
    actualKccStepCount:this.stepCount};
  };
  if(this.phase!=='SUCCEEDED'||this.jumpCommands!==1||
   this.targetStreak<18||!this.grounded||this.latestCollider!==this.targetId)
   return failed('B232_KCC_NOT_ON_PHYSICALLY_CERTIFIED_LANDING');
  if(![proposedFoot.x,proposedFoot.y,proposedFoot.z].every(Number.isFinite))
   return failed('B232_CROWD_NONFINITE_PROPOSAL');
  const delta=Math.hypot(proposedFoot.x-before.x,proposedFoot.z-before.z);
  if(delta>.30||Math.abs(proposedFoot.y-oldFoot[1])>.18)
   return failed('B232_UNTRUSTED_CROWD_DISPLACEMENT',delta);
  const maxStep=SPEED*DT;
  const factor=delta>maxStep?maxStep/delta:1;
  const dx=(proposedFoot.x-before.x)*factor;
  const dz=(proposedFoot.z-before.z)*factor;
  this.grounded=this.stepNative(dx,-.12,dz);
  this.latestCollider=this.footSolid();
  const after=this.body.translation();
  const foot:[number,number,number]=[
   after.x,after.y-PROFILE.humanFootOffsetMeters,after.z];
  const moved=Math.hypot(after.x-before.x,after.z-before.z);
  const drift=Math.hypot(foot[0]-proposedFoot.x,
   foot[1]-proposedFoot.y,foot[2]-proposedFoot.z);
  let reason='NATIVE_RAPIER_CROWD_STEP_APPROVED';
  if(!this.grounded||this.latestCollider!==this.targetId)
   reason='B232_NATIVE_KCC_LOST_ORIGINAL_DESTINATION_FACE';
  else if(this.originalCollisionIds.size)
   reason='B232_NATIVE_KCC_CONTACTED_UNRELATED_25_SOLID';
  else if(drift>.30)
   reason='B232_REAL_PHYSICAL_FOOT_DIVERGED_FROM_CROWD';
  else if(moved>maxStep+.001)
   reason='B232_NATIVE_KCC_EXCEEDED_CPU_SPEED';
  if(reason!=='NATIVE_RAPIER_CROWD_STEP_APPROVED')this.fail(reason);
  return {approved:reason==='NATIVE_RAPIER_CROWD_STEP_APPROVED',
   reason,actualFoot:foot,sourceFootId:this.latestCollider,
   nativeGrounded:this.grounded,crowdDeltaXZ:delta,actualDeltaXZ:moved,
   driftMeters:drift,actualKccStepCount:this.stepCount};
 }
 public snapshot():B230NativeSnapshot{
  const p=this.body.translation();
  return {phase:this.phase,reason:this.failReason,tick:this.tickIndex,
   realNativeKccSteps:this.stepCount,
   groundSupportedAtSpawn:this.initialSupported,
   launchAtTick:this.launchAt,launchSpeedMetersPerSecond:this.launchSpeed,
   launchColliderId:this.launchCollider,launchGrounded:this.launchWasGrounded,
   leftGround:this.leftGround,landedAfterAirborne:this.landedAfterAirborne,
   firstTargetGroundedTick:this.firstTargetTick,
   targetGroundedStreak:this.targetStreak,
   maxTargetGroundedStreak:this.maxStreak,
   closestGroundedTargetMeters:Number.isFinite(this.closestError)?
    this.closestError:null,
   latestFootColliderId:this.latestCollider,currentlyGrounded:this.grounded,
   existing25CollisionIds:[...this.originalCollisionIds].sort(),
   actorPosition:[p.x,p.y,p.z],
   totalLocalJumpCommands:this.jumpCommands,teleportsAfterInitialQaSpawn:0,
   scene:'27_SOLIDS_25_FROZEN_PLUS_2_EXACT_SOURCE',
   stageCounts:'25/17/26/0',cpuNavigationPathCertified:false,
   actualCpuAgentSystemInstantiated:false,
   sourceQaOnly:true,productionAuthorized:false,
   officialWinner:'NONE',
   accepted:this.phase==='SUCCEEDED'};
 }
}
