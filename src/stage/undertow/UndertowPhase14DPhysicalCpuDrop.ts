import RAPIER, {type RigidBody,type KinematicCharacterController} from '@dimforge/rapier3d-compat';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController} from '../../player/PlayerCharacterPhysics';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';

export type SourceFoot=Readonly<{x:number;y:number;z:number}>;
export interface T21PhysicalCpuFallFrame {
  foot:{x:number;y:number;z:number};
  grounded:boolean;landed:boolean;continuous:boolean;
  stepMeters:number;frame:number;
  runtimeActivationAuthorized:false;
  sourceAuthority:'ORIGINAL_LANDING_COLLIDER_ONLY';
}
/** T21 QA-only; physical KCC alternative to instant Recast offmesh updates.
 * Caller owns original-source backing solid and advances this at EXACTLY 60Hz.
 * DOES NOT connect to the production CPU or change stage/source geometry.
 */
export class UndertowCpuDropBridge {
  private readonly body:RigidBody;
  private readonly ctl:KinematicCharacterController;
  private foot:{x:number;y:number;z:number};
  private speedY=0;
  private frameIndex=0;
  private landed=false;
  constructor(
    private readonly physics:RapierStagePhysics,
    start:SourceFoot,
    private readonly destination:SourceFoot
  ) {
    if(![start.x,start.y,start.z,destination.x,destination.y,destination.z].every(Number.isFinite)||
      start.y<=destination.y+1||
      Math.hypot(start.x-destination.x,start.z-destination.z)>8)
      throw Error('T21_PHASE14D_INVALID_ORIGINAL_DROP_ENDPOINTS');
    this.foot={...start};
    const yOffset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    this.body=physics.world.createRigidBody(RAPIER.RigidBodyDesc
      .kinematicPositionBased().setTranslation(start.x,start.y+yOffset,start.z));
    physics.world.createCollider(RAPIER.ColliderDesc.capsule(
      PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),this.body);
    this.ctl=createConfiguredPlayerCharacterController(physics.world);
  }
  public step(dt:number):T21PhysicalCpuFallFrame {
    if(!Number.isFinite(dt)||Math.abs(dt-1/60)>1e-8)
      throw Error('T21_PHASE14D_60HZ_REQUIRED');
    if(this.landed)return this.result(0,true,true);
    this.speedY=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      this.speedY-GAME_CONFIG.player.gravityMetersPerSecond2*dt);
    const dx=this.destination.x-this.foot.x,dz=this.destination.z-this.foot.z;
    const horizontal=Math.hypot(dx,dz);
    const stepXz=Math.min(horizontal,GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt);
    const x=horizontal>1e-8?dx/horizontal*stepXz:0;
    const z=horizontal>1e-8?dz/horizontal*stepXz:0;
    const collider=this.body.collider(0);
    this.ctl.computeColliderMovement(collider,
      {x,y:this.speedY*dt,z},undefined,undefined,
      c=>this.physics.shouldCharacterCollide(c,'HUMAN'));
    const m=this.ctl.computedMovement(),p=this.body.translation();
    this.body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});
    this.physics.step();
    const newPos=this.body.translation();
    const next={x:newPos.x,
      y:newPos.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:newPos.z};
    const measured=auditPhase14CrowdFrame(this.foot,next,dt);
    this.foot=next;
    this.frameIndex++;
    const grounded=this.ctl.computedGrounded();
    if(grounded&&Math.abs(next.y-this.destination.y)<.14&&
       Math.hypot(next.x-this.destination.x,next.z-this.destination.z)<.6)
       this.landed=true;
    return this.result(measured.travelledMeters,grounded,!measured.suspectedInstantTransition);
  }
  public get completed():boolean{return this.landed;}
  public dispose():void{
    this.physics.world.removeCharacterController(this.ctl);
    this.physics.world.removeRigidBody(this.body);
  }
  private result(meters:number,grounded:boolean,continuous:boolean):T21PhysicalCpuFallFrame{
    return {
      foot:{...this.foot},grounded,landed:this.landed,
      continuous,stepMeters:meters,frame:this.frameIndex,
      runtimeActivationAuthorized:false,
      sourceAuthority:'ORIGINAL_LANDING_COLLIDER_ONLY'
    };
  }
}
