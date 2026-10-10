import RAPIER, {type Collider,type RigidBody} from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController}
 from '../../player/PlayerCharacterPhysics';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import type {StageDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';

export type T21QFoot=Readonly<{x:number;y:number;z:number}>;
export type T21QContactResult=Readonly<{
  source:'ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD';
  approved:boolean;
  cause:'CLEAR'|'DYNAMIC_ACTOR_OR_STAGE_BLOCKER'|'UNSUPPORTED_INITIAL_OVERLAP';
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

interface ActorBody{
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
  private readonly kcc;
  private readonly cpuRadius=.29; // Actual CpuAgentSystem capsule render radius
  private readonly cpuHalfHeight=.39;
  private readonly cpuCenterOffset=this.cpuRadius+this.cpuHalfHeight;

  public constructor(
    private readonly physics:RapierStagePhysics,
    private readonly stage:StageDefinition,
    enabled:boolean
  ){
    if(enabled!==true||stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
      stage.solids.length!==25||stage.paintSurfaces.length!==17||
      stage.navigationLinks?.length!==26||freeze.activationReady!==false||
      stage.solids!==freeze.solids||
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
      actor={body,collider,sourceFoot:{...foot}};
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

  /** Exact current PlayerController KCC foot, NOT an invented CPU repellor. */
  public syncActualHumanFoot(foot:T21QFoot):void{
    if(![foot.x,foot.y,foot.z].every(Number.isFinite))
      throw Error('T21_PHASE14Q_UNTRUSTED_REAL_HUMAN_SOURCE');
    this.humanSourceFoot={...foot};
  }

  public auditGroundStep(id:string,from:T21QFoot,to:T21QFoot,dt:number):T21QContactResult{
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
    const cause=actorOverlaps?'UNSUPPORTED_INITIAL_OVERLAP':
      clear&&!destinationOverlaps?'CLEAR':'DYNAMIC_ACTOR_OR_STAGE_BLOCKER';
    return {
      source:'ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD',
      approved:clear&&!actorOverlaps&&!destinationOverlaps,cause,
      requestedMeters:wanted,
      actualMeters:Math.hypot(movement.x,movement.y,movement.z),
      horizontalDisagreementMeters:errXZ,
      verticalDisagreementMeters:errY,
      colliderOwnerIds:collisionOwners,
      realHumanCapsulePresent:this.humanSourceFoot!==null&&
        this.physics.world.bodies.len()>this.actors.size,
      proposedActorCapsuleOverlap:destinationOverlaps,

      originalSourceCollidersIntact:true,
      cpuVisualTeleportPerformed:false,originalNavAuthorityOverridden:false,
      productionAuthorized:false
    };
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

  public get cpuColliderCount():number{return this.actors.size;}

  public dispose():void{
    this.resetActors();
    this.physics.world.removeCharacterController(this.kcc);
  }

  private hasApproximateSameLayerOverlap(id:string,from:T21QFoot):boolean{
    for(const [otherId,other] of this.actors){
      if(otherId===id)continue;
      if(Math.hypot(other.sourceFoot.x-from.x,other.sourceFoot.z-from.z) <
          this.cpuRadius*2-.01&&
        Math.abs(other.sourceFoot.y-from.y)<1)
        return true;
    }
    if(this.humanSourceFoot &&
      Math.hypot(this.humanSourceFoot.x-from.x,
        this.humanSourceFoot.z-from.z)<
          this.cpuRadius+PLAYER_CHARACTER_PHYSICS.humanRadiusMeters-.01&&
      Math.abs(this.humanSourceFoot.y-from.y)<1)
      return true;
    return false;
  }

  private assertFoot(id:string,foot:T21QFoot):void{
    if(!/^[AB][1-4]$/.test(id)||
       ![foot.x,foot.y,foot.z].every(Number.isFinite))
      throw Error('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  }
}
