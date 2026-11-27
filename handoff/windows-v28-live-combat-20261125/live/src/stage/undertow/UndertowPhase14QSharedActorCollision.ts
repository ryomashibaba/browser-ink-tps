import {isT21F4ResearchStage} from './UndertowT21F4PhotoRouteReconstruction';
import RAPIER, {type Collider,type RigidBody} from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController}
 from '../../player/PlayerCharacterPhysics';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';

/** Exact existing SOURCE CPU kinematic Rapier body dimensions; combat
 * rays must use this SAME body, not the legacy three-sphere estimate.
 * Read-only dimensions: no new collider, geometry, navigation or actor. */
export const ORIGINAL_SOURCE_CPU_CAPSULE=Object.freeze({
  radiusMeters:.29,
  halfHeightMeters:.39,
  centerOffsetMeters:.68
});
export type T21QFoot=Readonly<{x:number;y:number;z:number}>;
export type T21QContactResult=Readonly<{
  source:'ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD';
  approved:boolean;
  cause:'CLEAR'|'DYNAMIC_ACTOR_OR_STAGE_BLOCKER'|'UNSUPPORTED_INITIAL_OVERLAP'|
   'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION';
  requestedMeters:number;
  actualMeters:number;
  horizontalDisagreementMeters:number;
  verticalDisagreementMeters:number;
  colliderOwnerIds:readonly string[];
  realHumanCapsulePresent:boolean;
  proposedActorCapsuleOverlap:boolean;
  originalSourceCollidersIntact:true;
  cpuVisualTeleportPerformed:false;
  originalNavAuthorityOverridden:false;
  productionAuthorized:false;
}>;

export type T21QAirborneContactResult=Readonly<{
  approved:boolean;
  source:'ACTUAL_ORIGINAL_DROP_RAPIER_KCC_FOOT_SHARED_ACTOR_CAPSULE_AUDIT';
  cause:'SOURCE_CONTINUITY_UNVERIFIED'|'SHARED_ACTOR_CAPSULE_INTERSECTS'|'CLEAR';
  playerSourceFootRegistered:true;
  actorCollisionCandidate:string|null;
  cpuFootTeleportPerformed:false;
  sourceGeometryModified:false;
  fullSharedWorldFallingKccProved:false;
  productionAuthorized:false;
}>;

interface ActorBody{
  f4DescentSpeed:number;
  body:RigidBody;
  collider:Collider;
  sourceFoot:T21QFoot;
}

/**
 * Phase14Q / T21-D ONLY. Attach the ACTUAL CpuAgentSystem footprint to the
 * world containing the ACTUAL PlayerController HUMAN collider. This does
 * not alter the CPU's source-backed Recast/Crowd positions.
 *
 * The KCC movement audit below is an actual Rapier world query with
 * PlayerController and other CPUs in the same world: unlike the earlier
 * independent per-CPU fall worlds it is capable of rejecting inter-actor
 * movement. The result is NEVER a license to re-seed, snap, offset a CPU,
 * fabricate a NavMesh target, or claim the physically colliding runtime
 * is enabled. A blocked step must remain blocked until the real CPU/Crowd
 * movement synchronizer can consume it without replaying an offmesh jump.
 */
export class UndertowPhase14QSharedActorCollision{
  private readonly actors=new Map<string,ActorBody>();
  private readonly ownerByHandle=new Map<number,string>();
  private humanSourceFoot:T21QFoot|null=null;
  // A splatted HUMAN retains a known SOURCE foot, but no live Rapier
  // collider: stale coordinates must not block a real CPU move/drop.
  private humanCollisionActive=false;
  // The genuine PlayerController swaps its Rapier shape: SQUID is a
  // radius-0.34m ball, not a radius-0.32m HUMAN capsule. Never approve
  // CPU overlap based on the smaller inactive collider profile.
  private humanColliderMode:'HUMAN'|'SQUID'='HUMAN';
  private readonly f4Research:boolean;
  private readonly kcc;
  private readonly cpuRadius=ORIGINAL_SOURCE_CPU_CAPSULE.radiusMeters;
  private readonly cpuHalfHeight=ORIGINAL_SOURCE_CPU_CAPSULE.halfHeightMeters;
  private readonly cpuCenterOffset=ORIGINAL_SOURCE_CPU_CAPSULE.centerOffsetMeters;

  public constructor(
    private readonly physics:RapierStagePhysics,
    private readonly stage:StageDefinition,
    enabled:boolean
  ){
    this.f4Research=isT21F4ResearchStage(stage);
    if(enabled!==true||stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
      stage.paintSurfaces.length!==17||
      stage.navigationLinks?.length!==26||freeze.activationReady!==false||
      (!this.f4Research&&
       (stage.solids.length!==25||stage.solids!==freeze.solids))||
      stage.paintSurfaces!==freeze.paintSurfaces||
      stage.navigationLinks!==freeze.navigationLinks)
      throw Error('T21_PHASE14Q_NOT_AUTHORIZED_FOR_PRODUCTION');
    this.kcc=createConfiguredPlayerCharacterController(physics.world);
  }

  /** A match restart is not permission to leave ghost kinematic CPU
   * bodies behind. Drop all CPU proxies without touching the real
   * PlayerController body or any frozen source stage collider.
   * The exact real HUMAN foot must be supplied again after restart. */
  public resetActors():void{
    for(const actor of this.actors.values())
      this.physics.world.removeRigidBody(actor.body);
    this.actors.clear();
    this.ownerByHandle.clear();
    this.humanSourceFoot=null;
    this.humanCollisionActive=false;
    this.humanColliderMode='HUMAN';
  }

  /** Splatted CPU no longer has an active collision capsule. */
  public removeRealCpuFoot(id:string):void{
    const actor=this.actors.get(id);
    if(!actor)return;
    const handle=actor.collider.handle;
    this.physics.world.removeRigidBody(actor.body);
    this.actors.delete(id);
    this.ownerByHandle.delete(handle);
  }

  public syncRealCpuFoot(id:string,foot:T21QFoot):void{
    this.assertFoot(id,foot);
    let actor=this.actors.get(id);
    if(!actor){
      const body=this.physics.world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
          foot.x,foot.y+this.cpuCenterOffset,foot.z
        )
      );
      const collider=this.physics.world.createCollider(
        RAPIER.ColliderDesc.capsule(this.cpuHalfHeight,this.cpuRadius),body
      );
      actor={body,collider,sourceFoot:{...foot},f4DescentSpeed:0};
      this.actors.set(id,actor);
      this.ownerByHandle.set(collider.handle,id);
    }else{
      // Observation sync only; the actual CPU may have moved through a
      // legitimate first drop in a separate original-source Rapier world.
      // Never use this pose sync as collision correction or movement QA.
      actor.body.setTranslation({
        x:foot.x,y:foot.y+this.cpuCenterOffset,z:foot.z
      },true);
      actor.sourceFoot={...foot};
    }
  }

  /** Read the registered static support at an already synchronized CPU
   * foot. Use the existing SOURCE CPU endpoint band (0.25m); this query
   * grants neither movement nor new collision/paint authority. */
  public sourceFootSupport(id:string,foot:T21QFoot){
    const actor=this.actors.get(id);
    if(!actor||![foot.x,foot.y,foot.z].every(Number.isFinite)||
       Math.hypot(actor.sourceFoot.x-foot.x,actor.sourceFoot.y-foot.y,
         actor.sourceFoot.z-foot.z)>1e-5)
      return null;
    if(this.physics.hasF4WholeResearchTrimesh)
      return this.f4WholeFloorRay(foot)??this.f4CapsuleSupport(actor,foot)??
        this.f4GroundedContactSupport(actor,foot);
    return this.registeredOriginalSourceFootSupport(foot)??
      (this.f4Research?this.f4CapsuleSupport(actor,foot):null);
  }

  private f4WholeFloorRay(foot:T21QFoot){
    const hit=this.physics.castCharacterFootSupport(new Vec3(foot.x,foot.y,foot.z),0,'HUMAN');
    return hit?.normal&&Math.abs(hit.point.y-foot.y)<=.085&&
      hit.normal.y>=Math.cos(PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians)?hit:null;
  }

  public canRejoinF4WholeProjection(foot:T21QFoot,point:T21QFoot):boolean{
    if(!this.physics.hasF4WholeResearchTrimesh||
       Math.hypot(point.x-foot.x,point.z-foot.z)>.26||
       Math.abs(point.y-foot.y)>.45)return false;
    // Detail mesh height can straddle overlapping walkable polygons.
    // Test at physical foot height, on both sides of the XZ projection.
    return !!this.f4WholeFloorRay(foot)&&
      !!this.f4WholeFloorRay({x:point.x,y:foot.y,z:point.z});
  }

  /** Settle a CPU at its existing in-world spawn XZ using the real capsule. */
  public settleF4WholeCpuSpawn(id:string,spawn:T21QFoot):T21QFoot|null{
    if(!this.f4Research||!this.physics.hasF4WholeResearchTrimesh||
       this.hasApproximateSameLayerOverlap(id,spawn))return null;
    this.syncRealCpuFoot(id,spawn);
    const actor=this.actors.get(id)!;
    this.kcc.computeColliderMovement(actor.collider,{x:0,y:-.25,z:0},
      undefined,undefined,collider=>collider.handle!==actor.collider.handle&&
        this.physics.shouldCharacterCollide(collider,'HUMAN'));
    const move=this.kcc.computedMovement();
    const foot={x:spawn.x+move.x,y:spawn.y+move.y,z:spawn.z+move.z};
    if(!this.kcc.computedGrounded()||Math.hypot(move.x,move.z)>.01||
       this.hasApproximateSameLayerOverlap(id,foot)||!this.f4CapsuleSupport(actor,foot)){
      this.removeRealCpuFoot(id);
      return null;
    }
    this.syncRealCpuFoot(id,foot);
    return foot;
  }

  /** Static SOURCE physical support for an observed OR candidate foot.
   * A real Rapier character ray, never a manufactured floor/NavMesh. */
  private registeredOriginalSourceFootSupport(foot:T21QFoot){
    // A true HUMAN/CPU capsule stands on registered GRATE even when
    // ordinary ink bullets pass through it. Never accept a lower slab
    // across the original level gap as current CPU foot support.
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const hit=this.physics.castCharacterFootSupport(
      new Vec3(foot.x,foot.y+offset,foot.z),offset,'HUMAN');
    return hit&&Math.abs(hit.point.y-foot.y)<=.25&&
      this.stage.solids.some(s=>s.id===hit.solidId)?hit:null;
  }

  /** At a seam, the capsule can rest on a face beside its center ray. */
  private f4CapsuleSupport(actor:ActorBody,foot:T21QFoot){
    const hit=this.physics.world.castShape(
      {x:foot.x,y:foot.y+this.cpuCenterOffset,z:foot.z},
      actor.collider.rotation(),{x:0,y:-1,z:0},actor.collider.shape,
      0,.08,false,undefined,undefined,actor.collider,undefined,
      collider=>this.physics.sourceSolidIdForCollider(collider)!==null&&
        this.physics.shouldCharacterCollide(collider,'HUMAN'));
    if(!hit||hit.normal1.y<Math.cos(
       PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians))return null;
    const solidId=this.physics.sourceSolidIdForCollider(hit.collider);
    return solidId?{point:new Vec3(hit.witness1.x,hit.witness1.y,hit.witness1.z),
      solidId}:null;
  }

  /** Use the live capsule's downward KCC contact at a mesh seam where
   * the center ray hits the lower face and the shape cast hits the edge. */
  private f4GroundedContactSupport(actor:ActorBody,foot:T21QFoot){
    this.kcc.computeColliderMovement(actor.collider,{x:0,y:-.5/60,z:0},
      undefined,undefined,collider=>collider.handle!==actor.collider.handle&&
        this.physics.sourceSolidIdForCollider(collider)!==null&&
        this.physics.shouldCharacterCollide(collider,'HUMAN'));
    if(!this.kcc.computedGrounded())return null;
    // Grounded support can persist between the controller's climb and
    // automatic slide limits. The movement KCC still enforces both.
    const minNormalY=Math.cos(PLAYER_CHARACTER_PHYSICS.minSlopeSlideAngleRadians);
    for(let i=0;i<this.kcc.numComputedCollisions();i++){
      const contact=this.kcc.computedCollision(i);
      if(!contact?.collider||contact.normal1.y<minNormalY)continue;
      const p=contact.witness1;
      if(p.y<foot.y-.085||p.y>foot.y+this.cpuRadius||
         Math.hypot(p.x-foot.x,p.z-foot.z)>
           this.cpuRadius+PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters)continue;
      const solidId=this.physics.sourceSolidIdForCollider(contact.collider);
      if(solidId)return {point:new Vec3(p.x,p.y,p.z),solidId};
    }
    return null;
  }

  /** Exact current PlayerController KCC foot, NOT an invented CPU repellor. */
  public syncActualHumanFoot(
    foot:T21QFoot,colliderActive=true,mode:'HUMAN'|'SQUID'='HUMAN'
  ):void{
    if(![foot.x,foot.y,foot.z].every(Number.isFinite))
      throw Error('T21_PHASE14Q_UNTRUSTED_REAL_HUMAN_SOURCE');
    if(mode!=='HUMAN'&&mode!=='SQUID')
      throw Error('T21_PHASE14Q_UNTRUSTED_HUMAN_COLLIDER_MODE');
    this.humanSourceFoot={...foot};
    this.humanCollisionActive=colliderActive;
    this.humanColliderMode=mode;
  }

  /**
   * Safety veto for a genuine independently simulated original-source
   * Rapier FIRST_DROP_FALL candidate BEFORE CpuAgentSystem adopts its
   * physical foot. The first-drop KCC is currently a separate physics
   * world, so this is a conservative true-size capsule overlap check,
   * NOT a claim that both falling KCCs now share one dynamic world.
   */
  auditAirborneSourceFoot(
    id:string,from:T21QFoot,to:T21QFoot,dt:number,
    originalKccContinuous:boolean
  ):T21QAirborneContactResult{
    this.assertFoot(id,from);
    this.assertFoot(id,to);
    if(!Number.isFinite(dt)||Math.abs(dt-1/60)>1e-8)
      throw Error('T21_PHASE14Q_AIRBORNE_EXACT_60HZ_REQUIRED');
    if(!this.humanSourceFoot)
      throw Error('T21_PHASE14Q_REAL_HUMAN_FOOT_NOT_SYNCHRONIZED');
    const actor=this.actors.get(id);
    if(!actor)throw Error('T21_PHASE14Q_MISSING_REAL_CPU_COLLIDER_'+id);
    if(Math.hypot(actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,
       actor.sourceFoot.z-from.z)>.025)
      throw Error('T21_PHASE14Q_AIRBORNE_SOURCE_FOOT_DESYNC');
    const span=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z);
    const dxz=Math.hypot(to.x-from.x,to.z-from.z);
    if(span>.65||dxz>GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt+.04)
      throw Error('T21_PHASE14Q_AIRBORNE_UNVERIFIED_KCC_STEP');
    const candidate=this.overlappingActorId(id,to);
    const cause=!originalKccContinuous?'SOURCE_CONTINUITY_UNVERIFIED':
      candidate?'SHARED_ACTOR_CAPSULE_INTERSECTS':'CLEAR';
    return {
      approved:cause==='CLEAR',
      source:'ACTUAL_ORIGINAL_DROP_RAPIER_KCC_FOOT_SHARED_ACTOR_CAPSULE_AUDIT',
      cause,
      playerSourceFootRegistered:true,
      actorCollisionCandidate:candidate,
      cpuFootTeleportPerformed:false,
      sourceGeometryModified:false,
      fullSharedWorldFallingKccProved:false,
      productionAuthorized:false
    };
  }

  public auditGroundStep(
    id:string,from:T21QFoot,to:T21QFoot,dt:number,
    physicallyRejoinedOriginalGround=false
  ):T21QContactResult{
    this.assertFoot(id,from);
    this.assertFoot(id,to);
    if(!Number.isFinite(dt)||Math.abs(dt-1/60)>1e-8)
      throw Error('T21_PHASE14Q_REQUIRES_EXACT_60HZ');
    if(!this.humanSourceFoot)
      throw Error('T21_PHASE14Q_REAL_HUMAN_FOOT_NOT_SYNCHRONIZED');
    const actor=this.actors.get(id);
    if(!actor)throw Error('T21_PHASE14Q_MISSING_REAL_CPU_COLLIDER_'+id);
    if(Math.hypot(actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,
      actor.sourceFoot.z-from.z)>.025)
      throw Error('T21_PHASE14Q_CPU_SOURCE_FOOT_OUT_OF_SYNC');
    const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
    const wanted=Math.hypot(dx,dy,dz);
    if(wanted>GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt+1e-5)
      throw Error('T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED');
    // Ensure the collision test always originates at the verified CPU pose.
    const p=actor.body.translation();
    if(Math.hypot(p.x-from.x,p.y-this.cpuCenterOffset-from.y,p.z-from.z)>.025)
      throw Error('T21_PHASE14Q_KINEMATIC_BODY_OUT_OF_SYNC');
    const collisionOwners:string[]=[];
    const allowed=(collider:Collider)=>{
      if(collider.handle===actor.collider.handle)return false;
      return this.physics.shouldCharacterCollide(collider,'HUMAN');
    };
    this.kcc.computeColliderMovement(actor.collider,{x:dx,y:dy,z:dz},
      undefined,undefined,allowed);
    const movement=this.kcc.computedMovement();
    for(let i=0;i<this.kcc.numComputedCollisions();i++){
      const col=this.kcc.computedCollision(i)?.collider;
      if(!col)continue;
      const owner=this.ownerByHandle.get(col.handle) ??
        this.physics.sourceSolidIdForCollider(col) ??
        'REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR';
      if(!collisionOwners.includes(owner))collisionOwners.push(owner);
    }
    const errXZ=Math.hypot(movement.x-dx,movement.z-dz);
    const errY=Math.abs(movement.y-dy);
    // A 2.2cm xz allowance is for the original voxel/triangle seams ONLY.
    // Rapier can return an apparently tiny .013m clip against a real
    // PlayerController capsule. An ACTUAL actor collider event always blocks
    // the candidate, independent of movement epsilon.
    const actorContact=collisionOwners.some(owner=>
      owner==='REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR'||
      this.actors.has(owner));
    const clear=errXZ<=.022&&errY<=.09&&!actorContact;
    // Broad pre-existing visual/physical overlap is a fail-closed initial
    // condition; KCC on already interpenetrating bodies cannot certify
    // collision resolution merely by returning an unchanged small step.
    const actorOverlaps=this.hasApproximateSameLayerOverlap(id,from);
    // M3: a candidate ending INSIDE a real HUMAN/CPU capsule must never
    // be committed simply because Rapier returned a movement shorter
    // than the old source-collider tolerance. Validate the FINAL physical
    // footprint as well as the origin and swept KCC contact.
    const destinationOverlaps=this.hasApproximateSameLayerOverlap(id,to);
    // The native Crowd/KCC clearance does not by itself establish a
    // registered ORIGINAL floor under the next visible CPU foot. Once a
    // CPU has genuinely rejoined, forbid walking from proven Rapier floor
    // straight into unsupported air. Never obstruct the separate
    // high-pad FIRST_DROP admission/rejoin, or an already unsupported
    // actor trying to recover toward an existing registered floor.
    const leavesOriginalFloor=physicallyRejoinedOriginalGround&&
      clear&&!actorOverlaps&&!destinationOverlaps&&wanted>1e-5&&
      !this.registeredOriginalSourceFootSupport(to)&&
      !!this.registeredOriginalSourceFootSupport(from);
    const cause=actorOverlaps?'UNSUPPORTED_INITIAL_OVERLAP':
      !clear||destinationOverlaps?'DYNAMIC_ACTOR_OR_STAGE_BLOCKER':
      leavesOriginalFloor?'UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION':'CLEAR';
    return {
      source:'ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD',
      approved:clear&&!actorOverlaps&&!destinationOverlaps&&!leavesOriginalFloor,cause,
      requestedMeters:wanted,
      actualMeters:Math.hypot(movement.x,movement.y,movement.z),
      horizontalDisagreementMeters:errXZ,
      verticalDisagreementMeters:errY,
      colliderOwnerIds:collisionOwners,
      realHumanCapsulePresent:this.humanCollisionActive&&
        this.humanSourceFoot!==null&&
        this.physics.world.bodies.len()>this.actors.size,
      proposedActorCapsuleOverlap:destinationOverlaps,

      originalSourceCollidersIntact:true,
      cpuVisualTeleportPerformed:false,originalNavAuthorityOverridden:false,
      productionAuthorized:false
    };
  }

  /** Both SOURCE teams: use ACTUAL Rapier KCC teammate sliding, never
   * the rejected Crowd endpoint. Same registered original floor, live
   * human/CPU colliders, no added route or actor relocation. */
  public tryOriginalTeammateKccSlideStep(
    id:string,from:T21QFoot,to:T21QFoot,dt:number
  ):T21QFoot|null{
    if(!/^[AB][1-4]$/.test(id)||!Number.isFinite(dt)||
       Math.abs(dt-1/60)>1e-8||!this.humanSourceFoot||
       ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite))
      return null;
    const actor=this.actors.get(id);
    if(!actor||Math.hypot(
      actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,
      actor.sourceFoot.z-from.z)>.025||
      this.hasApproximateSameLayerOverlap(id,from))return null;
    const x=to.x-from.x,y=to.y-from.y,z=to.z-from.z;
    const requested=Math.hypot(x,y,z);
    const sourceFloor=this.registeredOriginalSourceFootSupport(from);
    if(!sourceFloor||requested<.025||
       requested>GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt+1e-5)
      return null;
    const body=actor.body.translation();
    if(Math.hypot(body.x-from.x,body.y-this.cpuCenterOffset-from.y,
       body.z-from.z)>.025)return null;
    this.kcc.computeColliderMovement(actor.collider,{x,y,z},
      undefined,undefined,(collider:Collider)=>
        collider.handle!==actor.collider.handle&&
        this.physics.shouldCharacterCollide(collider,'HUMAN'));
    let teammate=false,otherActor=false;
    for(let i=0;i<this.kcc.numComputedCollisions();i++){
      const collider=this.kcc.computedCollision(i)?.collider;
      if(!collider)continue;
      const owner=this.ownerByHandle.get(collider.handle);
      if(owner&&owner!==id){
        if(owner[0]===id[0])teammate=true;
        else otherActor=true;
      }else if(!owner&&!this.physics.sourceSolidIdForCollider(collider))
        otherActor=true;
    }
    if(!teammate||otherActor)return null;
    const move=this.kcc.computedMovement();
    const distance=Math.hypot(move.x,move.y,move.z);
    const horizontal=Math.hypot(x,z);
    if(![move.x,move.y,move.z].every(Number.isFinite)||
       horizontal<.012||distance<.010||
       distance>requested+.001||
       distance>GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt+1e-5||
       (move.x*x+move.z*z)/horizontal<.005)return null;
    const actual={x:from.x+move.x,y:from.y+move.y,z:from.z+move.z};
    if(Math.abs(actual.y-from.y)>.065||
       this.hasApproximateSameLayerOverlap(id,actual))return null;
    const destination=this.registeredOriginalSourceFootSupport(actual);
    return destination?.solidId===sourceFloor.solidId?actual:null;
  }

  /** SOURCE registered ramp only: shorten a real Crowd downhill proposal to <=2cm
   * and add a Rapier-measured descent, preserving unchanged 0.25m
   * floor support, native KCC, actor collision and speed authority.
   * Returns no actor mutation; caller must independently re-audit. */
  public tryOriginalDownhillKccStep(
    id:string,from:T21QFoot,to:T21QFoot,dt:number
  ):T21QFoot|null{
    if(!Number.isFinite(dt)||
       Math.abs(dt-1/60)>1e-8||
       ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite)||
       !this.actors.has(id)||!this.sourceFootSupport(id,from))return null;
    const limit=GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt;
    const requested=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z);
    const horizontal=Math.hypot(to.x-from.x,to.z-from.z);
    if(requested>limit+1e-5||horizontal<.001)return null;
    const support=this.registeredOriginalSourceFootSupport(from);
    if(support?.solidId!=='UndertowT21D:right-low-route-ramp-negative-z')
      return null;
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const hit=(x:number,y:number,z:number)=>
     this.physics.castCharacterFootSupport(
      new Vec3(x,y+offset,z),offset,'HUMAN');
    const raw=hit(to.x,to.y,to.z);
    const gap=raw?to.y-raw.point.y:NaN;
    if(!raw||raw.solidId!==support.solidId||
       !this.stage.solids.some(q=>q.id===raw.solidId)||
       !Number.isFinite(gap)||gap<=.25||gap>.30)return null;
    const length=Math.min(.02,horizontal);
    const x=from.x+(to.x-from.x)*length/horizontal;
    const z=from.z+(to.z-from.z)*length/horizontal;
    const local=hit(x,to.y,z);
    if(!local||local.solidId!==support.solidId)return null;
    const corrected={x,y:local.point.y+.23,z};
    if(!Number.isFinite(corrected.y)||corrected.y>=from.y||
       from.y-corrected.y>.05||corrected.y>to.y||
       Math.hypot(x-from.x,corrected.y-from.y,z-from.z)>limit+1e-5)
      return null;
    const verified=this.auditGroundStep(id,from,corrected,dt,true);
    return verified.approved?corrected:null;
  }

  /** Genuine P2 native 180s showed B2/B4 Crowd XZ already aligned with
   * the physical foot while Recast Y alone rose 2-3cm above registered
   * ORIGINAL ramp support. A repeated reanchor discarded their actual
   * path before the next genuine Crowd horizontal step. This helper
   * changes no goal, clock, body, stage or navigation path: the candidate
   * preserves native Crowd XZ but retains the *current* Rapier-supported
   * foot Y. Only the original same-solid ray and real 60Hz shared KCC
   * may authorize that candidate. It can return a true zero-motion foot.
   */
  public tryOriginalCrowdHeightMismatchKccStep(
    id:string,from:T21QFoot,to:T21QFoot,dt:number
  ):T21QFoot|null{
    if(!Number.isFinite(dt)||Math.abs(dt-1/60)>1e-8||
       ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite)||
       !this.actors.has(id))return null;
    const rise=to.y-from.y;
    const horizontal=Math.hypot(to.x-from.x,to.z-from.z);
    const requested=Math.hypot(horizontal,rise);
    if(rise<=.008||rise>.04||horizontal>.025||
       requested>GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt+1e-5)
      return null;
    const origin=this.sourceFootSupport(id,from);
    if(origin?.solidId!=='UndertowT21D:right-low-route-ramp-negative-z'||
       this.registeredOriginalSourceFootSupport(to))return null;
    const corrected={x:to.x,y:from.y,z:to.z};
    const destination=this.registeredOriginalSourceFootSupport(corrected);
    if(destination?.solidId!==origin.solidId)return null;
    return this.auditGroundStep(id,from,corrected,dt,true).approved?
      corrected:null;
  }

  /** Follow Crowd's horizontal intent using the shared world's grounded KCC. */
  public tryF4GroundStep(
    id:string,from:T21QFoot,to:T21QFoot,maxDistance:number
  ):(T21QFoot&{kccGrounded:boolean})|null{
    const actor=this.actors.get(id);
    const whole=this.physics.hasF4WholeResearchTrimesh;
    if(!this.f4Research||!actor||
       this.hasApproximateSameLayerOverlap(id,from))return null;
    const supported=!!this.sourceFootSupport(id,from);
    const unsupportedWhole=whole&&!supported;
    if(!supported&&!whole)return null;
    const dx=to.x-from.x,dz=to.z-from.z;
    const distance=Math.hypot(dx,dz);
    const fraction=distance>maxDistance?maxDistance/distance:1;
    // F4 whole-mesh CPUs keep natural gravity after losing genuine Rapier
    // support. Crowd intent cannot add horizontal motion while unsupported.
    // A grounded capsule retains the player's small downward contact bias.
    const descent=whole&&actor.f4DescentSpeed>0?
      Math.min(GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
       actor.f4DescentSpeed+GAME_CONFIG.player.gravityMetersPerSecond2/60):
      unsupportedWhole?Math.min(GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
       GAME_CONFIG.player.gravityMetersPerSecond2/60):.5;
    const collides=(collider:Collider)=>collider.handle!==actor.collider.handle&&
      this.physics.shouldCharacterCollide(collider,'HUMAN');
    this.kcc.computeColliderMovement(actor.collider,
      {x:unsupportedWhole?0:dx*fraction,y:-descent/60,
       z:unsupportedWhole?0:dz*fraction},
      undefined,undefined,collides);
    const move=this.kcc.computedMovement();
    const grounded=this.kcc.computedGrounded();
    const requested=distance*fraction;
    const foot={x:from.x+move.x,y:from.y+move.y,z:from.z+move.z};
    const maxDownStep=unsupportedWhole?
      GAME_CONFIG.player.maxFallSpeedMetersPerSecond/60:
      PLAYER_CHARACTER_PHYSICS.snapToGroundMeters+.025;
    // A vertical-only request can still slide along a real sloped contact.
    // In projection hold the requested XZ budget is zero. Allow only the
    // grounded, downward deflection produced by this capsule sweep.
    const horizontalLimit=unsupportedWhole&&grounded&&move.y<0
      ?descent/60:maxDistance;
    const withinBounds=Math.hypot(move.x,move.z)<=horizontalLimit+1e-5&&
      (!whole||(move.y>=-maxDownStep-.025&&
       move.y<=PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters+.025))&&
      !this.hasApproximateSameLayerOverlap(id,foot);
    const landed=withinBounds&&!!((whole?this.f4WholeFloorRay(foot):
      this.registeredOriginalSourceFootSupport(foot))||this.f4CapsuleSupport(actor,foot));
    const accepted=withinBounds&&(landed||whole&&move.y<0&&
      (unsupportedWhole||this.f4ShortDescentFloor(foot)));
    if(whole&&supported&&actor.f4DescentSpeed===0&&requested>.025&&
       (!accepted||Math.hypot(move.x,move.z)<requested*.20)){
      // The forward KCC sweep can move almost its full budget along a
      // cross-slope but finish without walkable support. Try the same
      // bounded side sweeps as a blocked move, from the unchanged foot.
      let bestForward=requested*.20;
      let best:(T21QFoot&{kccGrounded:boolean})|null=null;
      for(const sign of [-1,1]){
        const sx=.5*dx-sign*.866*dz,sz=sign*.866*dx+.5*dz;
        this.kcc.computeColliderMovement(actor.collider,
          {x:sx*fraction,y:-.5/60,z:sz*fraction},undefined,undefined,collides);
        const side=this.kcc.computedMovement();
        const forward=(side.x*dx+side.z*dz)/distance;
        const next={x:from.x+side.x,y:from.y+side.y,z:from.z+side.z};
        if(forward<=bestForward||Math.hypot(side.x,side.z)>requested+1e-5||
           Math.abs(side.y)>PLAYER_CHARACTER_PHYSICS.snapToGroundMeters||
           this.hasApproximateSameLayerOverlap(id,next)||
           !(this.f4WholeFloorRay(next)||this.f4CapsuleSupport(actor,next)))continue;
        bestForward=forward;
        best={...next,kccGrounded:this.kcc.computedGrounded()};
      }
      if(best)return best;
    }
    if(!accepted)return null;
    if(whole)actor.f4DescentSpeed=landed&&
      (actor.f4DescentSpeed===0||grounded)?0:descent;
    return {...foot,kccGrounded:grounded};
  }

  private f4ShortDescentFloor(foot:T21QFoot):boolean{
    const hit=this.physics.castCharacterFootSupport(new Vec3(foot.x,foot.y,foot.z),0,'HUMAN');
    const gap=hit?foot.y-hit.point.y:Infinity;
    return gap>0&&gap<=PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters+.05&&
      !!hit?.normal&&hit.normal.y>=Math.cos(PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians);
  }

  /** Uses the same registered capsule and collision filter as grounded play. */
  /** Provisional CPU Zipcaster: actual CPU capsule, not the HUMAN profile.
   * Admission is read-only; the caller must own mobility and the real gauge. */
  public probeF4CpuZip(id:string,foot:T21QFoot,direction:readonly [number,number,number],
    target:Vec3){
    const actor=this.actors.get(id);
    if(!this.f4Research||!this.physics.hasF4WholeResearchTrimesh||!actor||
       Math.hypot(actor.sourceFoot.x-foot.x,actor.sourceFoot.y-foot.y,actor.sourceFoot.z-foot.z)>1e-5||
       ![foot.x,foot.y,foot.z,...direction,target.x,target.y,target.z].every(Number.isFinite))return null;
    const support=this.f4WholeFloorRay(foot);
    if(!support)return null;
    const v=(p:Vec3):[number,number,number]=>[p.x,p.y,p.z];
    const start=new Vec3(foot.x,foot.y+this.cpuCenterOffset,foot.z);
    const aim=new Vec3(...direction);
    if(aim.lengthSq()<1e-8)return null;
    aim.normalize();
    const hit=this.physics.castStageSegment(start,start.clone().add(aim.clone().mulScalar(18)),'ink-projectile');
    if(!hit?.normal||hit.solidId!=='T21_F4_LOCAL_F3L_RESEARCH'||hit.distance<1||hit.distance>18)return null;
    const normal=hit.normal.clone().normalize();
    if(normal.dot(aim)>0)normal.mulScalar(-1);
    if(Math.abs(normal.y)>.35)return null;
    normal.y=0;normal.normalize();
    const goal=hit.point.clone().add(normal.clone().mulScalar(this.cpuRadius+.08));
    const sweep=(a:Vec3,b:Vec3)=>this.physics.auditF4HumanCapsuleSegment(a,b,this.cpuHalfHeight,this.cpuRadius,actor.collider);
    if(!sweep(start,goal).clear||!sweep(goal,start).clear)return null;
    const goalFoot=goal.clone();goalFoot.y-=this.cpuCenterOffset;
    const muzzle=goalFoot.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
    if(this.physics.castStageSegment(goal,muzzle,'ink-projectile'))return null;
    const targetDistance=muzzle.distance(target);
    return {start:v(new Vec3(foot.x,foot.y,foot.z)),goal:v(goalFoot),normal:v(normal),
      supportId:support.solidId,colliderHandle:hit.collider.handle,distance:hit.distance,targetDistance,
      targetClear:!this.physics.castStageSegment(muzzle,target,'ink-projectile')};
  }

  public canF4CpuZipReturn(id:string,from:T21QFoot,to:T21QFoot,supportId:string):boolean{
    const actor=this.actors.get(id);
    if(!this.f4Research||!this.physics.hasF4WholeResearchTrimesh||!actor||
       Math.hypot(actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,actor.sourceFoot.z-from.z)>1e-5||
       ![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite)||
       this.f4WholeFloorRay(to)?.solidId!==supportId)return false;
    const a=new Vec3(from.x,from.y+this.cpuCenterOffset,from.z);
    const b=new Vec3(to.x,to.y+this.cpuCenterOffset,to.z);
    return a.distance(b)<=.035||this.physics.auditF4HumanCapsuleSegment(
      a,b,this.cpuHalfHeight,this.cpuRadius,actor.collider).clear;
  }

  /** Actual KCC result only. Caller synchronizes only the returned physical foot. */
  public stepF4CpuZip(id:string,from:T21QFoot,delta:T21QFoot,wallHandle:number,
    normal:readonly [number,number,number],landing:boolean){
    const actor=this.actors.get(id);
    if(!this.f4Research||!this.physics.hasF4WholeResearchTrimesh||!actor||
       ![from.x,from.y,from.z,delta.x,delta.y,delta.z,...normal].every(Number.isFinite)||
       Math.hypot(delta.x,delta.y,delta.z)>14/60+1e-6||
       this.hasApproximateSameLayerOverlap(id,from)||
       Math.hypot(actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,actor.sourceFoot.z-from.z)>1e-5)return null;
    this.kcc.disableSnapToGround();
    this.kcc.disableAutostep();
    try{
      this.kcc.computeColliderMovement(actor.collider,delta,undefined,undefined,
        collider=>collider.handle!==actor.collider.handle&&this.physics.shouldCharacterCollide(collider,'HUMAN'));
      const move=this.kcc.computedMovement();
      const foot={x:from.x+move.x,y:from.y+move.y,z:from.z+move.z};
      if(![foot.x,foot.y,foot.z].every(Number.isFinite)||Math.hypot(move.x,move.y,move.z)>14/60+.03||
         this.hasApproximateSameLayerOverlap(id,foot))return null;
      let wallContact=false;
      for(let i=0;i<this.kcc.numComputedCollisions();i++){
        const hit=this.kcc.computedCollision(i);
        if(hit?.collider?.handle===wallHandle&&hit.normal1.x*normal[0]+hit.normal1.z*normal[2]>.8)wallContact=true;
      }
      const floor=landing&&this.kcc.computedGrounded()?this.f4WholeFloorRay(foot):null;
      return {foot:[foot.x,foot.y,foot.z] as [number,number,number],wallContact,grounded:!!floor,supportId:floor?.solidId??null};
    }finally{
      this.kcc.enableAutostep(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
        PLAYER_CHARACTER_PHYSICS.autostepMinWidthMeters,PLAYER_CHARACTER_PHYSICS.autostepIncludeDynamicBodies);
      this.kcc.enableSnapToGround(PLAYER_CHARACTER_PHYSICS.snapToGroundMeters);
    }
  }

  public moveF4WholeDrop(id:string,from:T21QFoot,delta:T21QFoot){
    const actor=this.actors.get(id);
    if(!this.f4Research||!this.physics.hasF4WholeResearchTrimesh||!actor||
       this.hasApproximateSameLayerOverlap(id,from)||
       Math.hypot(actor.sourceFoot.x-from.x,actor.sourceFoot.y-from.y,
         actor.sourceFoot.z-from.z)>1e-5)return null;
    this.kcc.computeColliderMovement(actor.collider,delta,undefined,undefined,
      collider=>collider.handle!==actor.collider.handle&&
        this.physics.shouldCharacterCollide(collider,'HUMAN'));
    const move=this.kcc.computedMovement();
    const foot={x:from.x+move.x,y:from.y+move.y,z:from.z+move.z};
    if(this.hasApproximateSameLayerOverlap(id,foot))return null;
    const grounded=delta.y<=0&&this.kcc.computedGrounded()&&
      !!(this.f4WholeFloorRay(foot)||this.f4CapsuleSupport(actor,foot));
    if(grounded)actor.f4DescentSpeed=0;
    return {foot,grounded};
  }

  /**
   * F2 opt-in first-drop admission gate. Before detaching an authentic
   * upper Crowd agent into its independent original-source Rapier fall,
   * keep a short free capsule corridor around the lip. Other physical
   * actor feet are OBSERVED in this real shared world: nobody is moved.
   * This is conservative separation/queuing, not geometry invention or
   * permission to pass through an actor during the actual fall.
   */
  public shouldDeferF2FirstDrop(id:string,foot:T21QFoot):boolean{
    this.assertFoot(id,foot);
    if(!this.humanSourceFoot)
      throw Error('T21_F2_DROP_ADMISSION_REQUIRES_REAL_HUMAN');
    const physical=this.actors.get(id);
    if(!physical||Math.hypot(
      physical.sourceFoot.x-foot.x,
      physical.sourceFoot.y-foot.y,
      physical.sourceFoot.z-foot.z)>.025)
      throw Error('T21_F2_DROP_ADMISSION_CPU_FOOT_DESYNC');
    const atRisk=(p:T21QFoot)=>Math.abs(p.y-foot.y)<1.6&&
      Math.hypot(p.x-foot.x,p.z-foot.z)<1.45;
    for(const [otherId,other] of this.actors){
      if(otherId!==id&&atRisk(other.sourceFoot))return true;
    }
    return this.humanCollisionActive&&atRisk(this.humanSourceFoot);
  }

  /** Used for diagnostics; not a correction, and not source NavMesh authority. */
  public approxActorOverlapIds():readonly string[]{
    const out:string[]=[];
    const ids=[...this.actors.keys()];
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
      const a=this.actors.get(ids[i]!)!.sourceFoot,b=this.actors.get(ids[j]!)!.sourceFoot;
      const d=Math.hypot(a.x-b.x,a.z-b.z);
      if(d<this.cpuRadius*2&&Math.abs(a.y-b.y)<1.0)
        out.push(ids[i]!+'/'+ids[j]!);
    }
    return out;
  }

  /** B149 observational identity of the actual in-world A1 Rapier
   * capsule. Recast HUMAN proxy and its position are NOT used. */
  public qaRegisteredRealCpuCapsule(id:string){
    const actor=this.actors.get(id);
    if(!actor)return null;
    const actual=actor.body.translation();
    const foot=actor.sourceFoot;
    return {
      id,foot:{...foot},actualRapierColliderHandle:actor.collider.handle,
      cpuRadiusMeters:this.cpuRadius,
      actualHumanRadiusMeters:this.actualHumanColliderRadius(),
      actualSharedRapierBodyAndFootAgree:
       Math.hypot(actual.x-foot.x,
        actual.y-this.cpuCenterOffset-foot.y,actual.z-foot.z)<.025,
      actualSharedWorld:true,virtualCrowdProxyUsed:false,
      stageSolidsAdded:0,actorPositionWritten:false
    };
  }

  public get cpuColliderCount():number{return this.actors.size;}

  public dispose():void{
    this.resetActors();
    this.physics.world.removeCharacterController(this.kcc);
  }

  private actualHumanColliderRadius():number{
    return this.humanColliderMode==='SQUID'?
      PLAYER_CHARACTER_PHYSICS.squidRadiusMeters:
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters;
  }

  private hasApproximateSameLayerOverlap(id:string,from:T21QFoot):boolean{
    return this.overlappingActorId(id,from)!==null;
  }

  private overlappingActorId(id:string,from:T21QFoot):string|null{
    for(const [otherId,other] of this.actors){
      if(otherId===id)continue;
      if(Math.hypot(other.sourceFoot.x-from.x,other.sourceFoot.z-from.z) <
          this.cpuRadius*2-.01&&
        Math.abs(other.sourceFoot.y-from.y)<1)
        return otherId;
    }
    if(this.humanCollisionActive&&this.humanSourceFoot &&
      Math.hypot(this.humanSourceFoot.x-from.x,
        this.humanSourceFoot.z-from.z)<
          this.cpuRadius+this.actualHumanColliderRadius()-.01&&
      Math.abs(this.humanSourceFoot.y-from.y)<1)
      return 'HUMAN_PLAYER_CONTROLLER';
    return null;
  }

  private assertFoot(id:string,foot:T21QFoot):void{
    if(!/^[AB][1-4]$/.test(id)||
       ![foot.x,foot.y,foot.z].every(Number.isFinite))
      throw Error('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  }
}
