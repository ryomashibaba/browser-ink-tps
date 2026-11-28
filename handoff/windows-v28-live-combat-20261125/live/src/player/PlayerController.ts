import RAPIER, {
  type Collider,
  type KinematicCharacterController,
  type RigidBody
} from '@dimforge/rapier3d-compat';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import type { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import {f4KeepRollIntent,f4AirborneSquidSpeed} from './F4PlayerIntent.mjs';
import {f4ZipReticleWitnessMatches} from './F4ZipReticleAim.mjs';
import {decorateB248Actor,B248_SOURCE_GROUNDED_SQUID_VISUAL_Y_OFFSET_METERS,
 type B248Visual} from '../app/B248SourceActorVisuals';
import { GAME_CONFIG } from '../config/game/gameConfig';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem, GameplayInkSample } from '../ink/GameplayInkSystem';
import type { PaintSurface } from '../ink/PaintSurface';
import { SurfaceFlags, Team } from '../ink/types';
import type { PlayerInput } from '../input/PlayerInput';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import { f4WalkableSupportNormal } from '../stage/F4PhysicalStageSafety.mjs';
import { f4CarryCrestMomentum } from '../stage/F4WallContinuity.mjs';
import type {StagePaintSurfaceDefinition} from '../stage/StageDefinition';
import {
  PLAYER_CHARACTER_PHYSICS,
  createConfiguredPlayerCharacterController
} from './PlayerCharacterPhysics';

export type PlayerMode = 'HUMAN' | 'SQUID';
export type InkRelation = 'OWN' | 'ENEMY' | 'NEUTRAL' | 'NONE';
export type PlayerLocomotionState =
  | 'HUMAN'
  | 'SQUID_DRY'
  | 'SWIM_GROUND'
  | 'SWIM_WALL'
  | 'SQUID_ROLL'
  | 'SURGE_CHARGE'
  | 'SURGE'
  | 'DUALIE_DODGE';

/** In genuine SOURCE play, ownership sampled near the character foot is
 * not proof of physical contact with a registered stage floor. The KCC's
 * just-computed ground contact is authoritative for floor ink effects.
 * Actual sampled OWN wall swimming/charging stays eligible. This does NOT
 * change movement, KCC, surface masks, painting or any stage collider. */
export function nativeSourcePhysicallyContactedInk(
 relation:InkRelation,state:PlayerLocomotionState,grounded:boolean
):InkRelation{
 if(grounded||state==='SWIM_WALL'||state==='SURGE_CHARGE')
  return relation;
 return relation==='OWN'||relation==='ENEMY'?'NONE':relation;
}
/** Letting go of Shift on a real ink wall must not inherit the prior
 * wall-climb drive into uncommanded airborne ascent. Genuine SURGE has its
 * own motion branch and is intentionally unaffected. */
export function nativeSourceWallReleaseVerticalVelocity(
 previousState:PlayerLocomotionState,velocity:number
):number{
 return (previousState==='SWIM_WALL'||previousState==='SURGE_CHARGE')&&
   velocity>0?0:velocity;
}

/** SOURCE-only short pre-landing Space buffer, never a second authority
 * for ground contact. A lock loss or exclusive move consumes the intent. */
export function nativeSourceNextJumpBufferSeconds(
 previous:number,jumpPressed:boolean,dt:number,
 liveInput:boolean,exclusiveAction:boolean
):number{
 if(!liveInput||exclusiveAction)return 0;
 return jumpPressed?0.10:Math.max(0,previous-dt);
}

/** A real SOURCE Space tap can begin a minimum wall surge even when its
 * keyup arrives before the next native physics step. Genuine OWN wall
 * probing still gates the action; frozen T20 keeps held/charged semantics. */
export function nativeSourceWallSurgeRequested(
 jumpHeld:boolean,chargeSeconds:number,jumpPressed:boolean,source:boolean
):boolean{
 return jumpHeld||chargeSeconds>0||(source&&jumpPressed);
}

/** A pre-landing Space press may select the existing squid-roll action on
 * true KCC ground contact, rather than being lost to a normal jump.
 * No roll without current OWN floor and legitimate reverse-turn window. */
export function nativeSourceSquidRollJumpRequested(
 jumpPressed:boolean,source:boolean,bufferSeconds:number
):boolean{
 return jumpPressed||(source&&bufferSeconds>0);
}

/** Real SOURCE only: an optical/nearby paint surface cannot grant
 * OWN/ENEMY resource or squid ground speed when a DIFFERENT registered
 * 25-solid Rapier floor supports the character. No new collision. */
export function nativeSourceInkOnRegisteredFoot(
 relation:InkRelation,grounded:boolean,
 backingSolidId:string|null,supportSolidId:string|null,
 footGapMeters:number|null
):InkRelation{
 if(relation!=='OWN'&&relation!=='ENEMY')return relation;
 if(!grounded||!backingSolidId||!supportSolidId||
    backingSolidId!==supportSolidId||footGapMeters===null||
    !Number.isFinite(footGapMeters)||
    Math.abs(footGapMeters)>.12)return 'NONE';
 return relation;
}

/** SOURCE human steering only: after an ACTUAL Rapier KCC obstruction,
 * stop feeding the PRE-collision horizontal velocity into the next 60Hz
 * acceleration step. Otherwise repeated blocked W input leaves an invisible
 * full-speed drive into the wall, and turning away feels stuck.
 *
 * This is NOT a translation, collision override or artificial acceleration.
 * Only the existing KCC-approved XZ displacement can become next-tick
 * momentum. A 1.6cm discrepancy avoids rounding/slope noise. Genuine
 * roll/surge/dodge/wall-swim impulses keep their original exclusive motion.
 * Legacy T20 and non-colliding SOURCE footsteps remain unchanged.
 */
export function nativeSourceReconcileKccPlanarVelocity(
 velocity:Vec3, accepted:Readonly<{x:number;z:number}>,dt:number,
 computedContacts:number,state:PlayerLocomotionState,source:boolean
):boolean{
 if(!source||!Number.isFinite(dt)||dt<=0||dt>0.05||
    !Number.isSafeInteger(computedContacts)||computedContacts<1||
    (state!=='HUMAN'&&state!=='SQUID_DRY'&&state!=='SWIM_GROUND')||
    ![velocity.x,velocity.z,accepted.x,accepted.z].every(Number.isFinite))
  return false;
 const requestedX=velocity.x*dt,requestedZ=velocity.z*dt;
 if(Math.hypot(requestedX-accepted.x,requestedZ-accepted.z)<=0.016)
  return false;
 const requestedLength=Math.hypot(requestedX,requestedZ);
 // KCC may resolve a penetration, but never allow it to create velocity
 // exceeding actual attempted human propulsion.
 if(requestedLength<1e-6)return false;
 const acceptedLength=Math.hypot(accepted.x,accepted.z);
 const factor=acceptedLength>requestedLength?
  requestedLength/acceptedLength:1;
 velocity.x=accepted.x/dt*factor;
 velocity.z=accepted.z/dt*factor;
 return true;
}

interface OwnWallSample {
  sample: GameplayInkSample;
  outward: Vec3;
  towardAmount: number;
}

type F4ZipResearchLeg = 'OUTBOUND' | 'WALL_CONTACT' | 'ATTACHED' | 'RETURN' | 'LANDING';

interface F4ZipResearchRun {
  leg: F4ZipResearchLeg;
  variant:'reviewed'|'aimed'|'natural';
  returnStartedTick:number|null;
  hookCount:number;
  wallLostTicks:number;
  start: Vec3;
  wallApproach: Vec3;
  wallNormal: Vec3;
  wallColliderHandle: number;
  returnSupportId: string;
  hookDistanceM: number;
  wallContact: Vec3 | null;
  ticks: number;
  stalledTicks: number;
  maxAcceptedStepM: number;
  travelledM: number;
}

export class PlayerController {
  private readonly body: RigidBody;
  private readonly humanCollider: Collider;
  private readonly squidCollider: Collider;
  private activeCollider: Collider;
  private readonly character: KinematicCharacterController;
  private readonly characterCollisionFilter: (collider: Collider) => boolean;
  private readonly entity: Entity;
  private readonly material: StandardMaterial;
  private b248Visual:B248Visual|null=null;
  private readonly velocity = new Vec3();
  private readonly flatForward = new Vec3();
  private readonly right = new Vec3();
  private readonly desired = new Vec3();
  private readonly footPoint = new Vec3();
  private readonly wallProbePoint = new Vec3();
  private readonly wallOutward = new Vec3();
  private readonly position = new Vec3();
  private readonly previousPosition = new Vec3();
  private readonly renderPosition = new Vec3();
  private readonly muzzleOffset = new Vec3();
  private readonly squidRollDirection = new Vec3();
  private readonly weaponDodgeDirection = new Vec3();
  private positionInitialized = false;
  private mode: PlayerMode = 'HUMAN';
  private locomotionState: PlayerLocomotionState = 'HUMAN';
  private inkRelation: InkRelation = 'NONE';
  private grounded = false;
  private saberLungeActive = false;
  private verticalVelocity = 0;
  // SOURCE only: preserve a short pre-landing Space press until real KCC contact.
  private sourceJumpBufferSeconds = 0;
  private team: Team.A | Team.B = Team.A;
  private wallSurfaceId = '-';
  private squidRollRemainingSeconds = 0;
  private squidRollTurnWindowSeconds = 0;
  private surgeRemainingSeconds = 0;
  private surgeChargeSeconds = 0;
  private weaponDodgeStartupSeconds = 0;
  private weaponDodgeRemainingSeconds = 0;
  private weaponDodgeMoveLockSeconds = 0;
  private weaponDodgeShotLockSeconds = 0;
  private weaponDodgeRechargeSeconds = 0;
  private weaponDodgeCharges = 2;
  private weaponDodgeQueued = false;
  private weaponDodgeCompletedEvent = false;
  private twinCometsStance = false;
  private weaponDodgeTravelTick = false;
  private weaponMoveMultiplier = 1;
  private mistSpeedScale = 1;
  private snapToGroundEnabled = true;
  private nativeSourceGroundInkGuard = false;
  private f4ProvisionalControls=false;
  public enableF4ProvisionalControls():void{this.f4ProvisionalControls=true;}
  // Observation only: axes actually consumed by the existing KCC step.
  private readonly f4ConsumedIntent={x:0,y:0,squid:false};
  public readF4ConsumedIntent():Readonly<{x:number;y:number;squid:boolean}>{return this.f4ConsumedIntent;}
  // F4 research-only KCC observation. Never changes the collision solver.
  private f4KccAuditEnabled=false;
  private f4ZipResearch: F4ZipResearchRun | null = null;
  private f4ZipResearchResult: {status:'HOLD'|'RETURNED';reason:string} | null = null;
  private f4LastKccMotion:Readonly<{
    requested:readonly number[];accepted:readonly number[];
    grounded:boolean;contacts:readonly Readonly<{
      colliderHandle:number;solidId:string|null;normal:readonly number[];
    }>[];
  }>|null=null;
  private sourcePaintBackingById:ReadonlyMap<string,string>|null=null;
  private sourceSupportedSolidId:string|null=null;
  private sourceFootGapMeters:number|null=null;
  private readonly sourceFootCastPosition=new Vec3();
  private readonly sourceFloorInkPoint=new Vec3();
  private readonly sourceBackingMatchesSupport=(surface:PaintSurface):boolean=>
    this.sourceSupportedSolidId!==null&&
    (this.physics.hasF4WholeResearchTrimesh?
      (this.sourcePaintBackingById?.has(surface.id)===true||
       (this.f4ProvisionalControls&&
        this.sourceSupportedSolidId==='T21_F4_LOCAL_F3L_RESEARCH'&&
        surface.id.startsWith('F4ProvisionalFloor:')&&
        (surface.baseFlags&SurfaceFlags.Swimmable)!==0&&
        (surface.baseFlags&(SurfaceFlags.Floor|SurfaceFlags.Ramp))!==0&&
        (surface.baseFlags&SurfaceFlags.Wall)===0)):
      this.sourcePaintBackingById?.get(surface.id)===this.sourceSupportedSolidId);

  private static readonly humanRadius = PLAYER_CHARACTER_PHYSICS.humanRadiusMeters;
  private static readonly humanHalfHeight = PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters;
  private static readonly humanFootOffset = PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  private static readonly squidRadius = PLAYER_CHARACTER_PHYSICS.squidRadiusMeters;
  private static readonly squidCenterOffsetY = PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters;

  public constructor(
    app: AppBase,
    private readonly physics: RapierStagePhysics,
    private readonly input: PlayerInput,
    private readonly camera: ThirdPersonCamera,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly stats: PerformanceStats
  ) {
    this.body = physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1.15, 4.6)
    );

    this.humanCollider = physics.world.createCollider(
      RAPIER.ColliderDesc.capsule(
        PlayerController.humanHalfHeight,
        PlayerController.humanRadius
      ),
      this.body
    );
    this.squidCollider = physics.world.createCollider(
      RAPIER.ColliderDesc.ball(PlayerController.squidRadius)
        .setTranslation(0, PlayerController.squidCenterOffsetY, 0)
        .setEnabled(false),
      this.body
    );
    this.activeCollider = this.humanCollider;

    this.character = createConfiguredPlayerCharacterController(physics.world);
    this.characterCollisionFilter = (collider: Collider) =>
      this.physics.shouldCharacterCollide(collider, this.mode);

    this.material = new StandardMaterial();
    this.material.useMetalness = true;
    this.material.metalness = 0.16;
    this.material.gloss = 0.72;
    this.updateMaterial();

    this.entity = new Entity('Player');
    this.entity.addComponent('render', {
      type: 'capsule',
      material: this.material,
      castShadows: true,
      receiveShadows: true
    });
    this.entity.setLocalScale(0.72, 0.92, 0.72);
    app.root.addChild(this.entity);
    this.syncAfterPhysics();
  }

  /** Replaces only render primitives on existing SOURCE actor. */
  public enableB248Visual():void {
    if(this.b248Visual)return;
    this.b248Visual=decorateB248Actor(this.entity,
      this.team===Team.A?'A':'B','PLAYER');
    this.b248Visual.setMode(this.mode);
  }

  /** B255 source-only visual study; never alter the real player body. */
  public setB248VisualShown(shown:boolean):void {
    if(!this.b248Visual&&shown)this.enableB248Visual();
    this.b248Visual?.setEnabled(shown);
  }

  /** Current physical hook candidate audit only; no traversal or body movement occurs here. */
  public auditF4ZipGeometry(origin:Vec3,aim:Vec3,rangeM:number,returnAnchor?:Vec3,reticlePoint?:Vec3) {
    const v=(p:Vec3):[number,number,number]=>[p.x,p.y,p.z];
    if(!this.physics.hasF4WholeResearchTrimesh||this.mode!=='HUMAN'||(!this.grounded&&!returnAnchor)||
       ![...v(origin),...v(aim),rangeM].every(Number.isFinite)||
       rangeM<=0||rangeM>64||aim.lengthSq()<1e-8)
      return {status:'HOLD',reason:'ACTUAL_GROUNDED_HUMAN_AND_EXPLICIT_RANGE_REQUIRED'};
    const body=this.getPosition(new Vec3());
    const off=PlayerController.humanFootOffset;
    const anchor=returnAnchor??body;
    const support=this.physics.castCharacterFootSupport(anchor,off,'HUMAN');
    const landingGap=support?anchor.y-off-support.point.y:null;
    const landingSupported=!!support&&!!support.normal&&support.normal.y>=.70&&
      landingGap!==null&&Math.abs(landingGap)<=.10;
    if(!landingSupported)
      return {status:'HOLD',reason:'RETURN_ANCHOR_UNSUPPORTED',body:v(body),landingGap,
        supportId:support?.solidId??null};
    const start=new Vec3(body.x,origin.y,body.z);
    if(start.distance(origin)>1||this.physics.castStageSegment(start,origin,'ink-projectile'))
      return {status:'HOLD',reason:'MUZZLE_NOT_CLEAR',body:v(body)};
    const direction=aim.clone().normalize();
    const hit=this.physics.castStageSegment(origin,origin.clone().add(direction.clone().mulScalar(rangeM)),
      'ink-projectile');
    if(!hit?.normal||hit.distance<=.05||hit.normal.lengthSq()<1e-8)
      return {status:'HOLD',reason:'NO_FIRST_PHYSICAL_HOOK_CONTACT',body:v(body)};
    // The same trimesh can contain multiple intervening walls.
    if(reticlePoint&&!f4ZipReticleWitnessMatches(reticlePoint,hit.point))
      return {status:'HOLD',reason:'MUZZLE_OCCLUDES_RETICLE_HOOK',body:v(body)};
    const normal=hit.normal.clone().normalize();
    if(normal.dot(direction)>0)normal.mulScalar(-1);
    const witness={solidId:hit.solidId,colliderHandle:hit.collider.handle,
      point:v(hit.point),normal:v(normal),distanceM:hit.distance};
    if(Math.abs(normal.y)>.35)
      return {status:'HOLD',reason:'FIRST_CONTACT_NOT_WALL_CANDIDATE',witness};
    const horizontal=new Vec3(normal.x,0,normal.z).normalize();
    const goal=hit.point.clone().add(horizontal.mulScalar(PlayerController.humanRadius+.08));
    const sweep=(a:Vec3,b:Vec3)=>this.physics.auditF4HumanCapsuleSegment(
      a,b,PlayerController.humanHalfHeight,PlayerController.humanRadius,this.humanCollider);
    const outbound=sweep(body,goal),reverse=sweep(goal,anchor);
    const segments=Math.max(1,Math.ceil(body.distance(goal)/.125));
    let firstUnsupported:number[]|null=null;
    for(let i=0;i<=segments;i++){
      const point=new Vec3().lerp(body,goal,i/segments);
      const floor=this.physics.castCharacterFootSupport(point,off,'HUMAN');
      if(!floor?.normal||floor.normal.y<.70||Math.abs(point.y-off-floor.point.y)>.10){
        firstUnsupported=[point.x,point.y-off,point.z];break;
      }
    }
    return {status:'HOLD',reason:!outbound.clear||!reverse.clear?'PHYSICAL_CAPSULE_ROUTE_BLOCKED':
      'ORIGINAL_HOOK_AUTHORITY_AND_LIVE_KCC_UNVERIFIED',
      witness,body:v(body),goal:v(goal),returnLanding:{supported:landingSupported,
        solidId:support?.solidId??null,gapM:landingGap},
      outbound,reverse,groundRoute:{sampleSpacingM:.125,continuousSamples:!firstUnsupported,
        firstUnsupportedFoot:firstUnsupported},originalHookAuthorized:false,liveKccExecuted:false};
  }

  /** Isolated experiment only. Aimed variant uses current physical wall, never original hook authority. */
  public beginF4ZipResearch(origin: Vec3, aim: Vec3,variant:'reviewed'|'aimed'|'natural'='reviewed',reticlePoint?:Vec3): void {
    if(this.f4ZipResearchActive)return;
    this.f4ZipResearch=null;
    this.f4ZipResearchResult={status:'HOLD',reason:'STAND_AT_REVIEWED_APPROACH'};
    const start=this.getPosition();
    if(variant==='reviewed'&&(Math.hypot(start.x-.075,start.z-57.52)>.55||Math.abs(start.y-8.445)>.16))return;
    if(!this.f4KccAuditEnabled){
      this.f4ZipResearchResult={status:'HOLD',reason:'ACTUAL_KCC_CONTACT_AUDIT_REQUIRED'};
      return;
    }
    // 18m is the existing experiment's maximum, not a certified game range.
    const audit=this.auditF4ZipGeometry(origin,aim,variant==='reviewed'?20:18,undefined,
      variant==='natural'?reticlePoint:undefined);
    if(!audit.witness||!audit.goal||!audit.returnLanding?.solidId||
       !audit.outbound?.clear||!audit.reverse?.clear||
       audit.witness.solidId!=='T21_F4_LOCAL_F3L_RESEARCH'){
      this.f4ZipResearchResult={status:'HOLD',reason:audit.reason};
      return;
    }
    const minimum=variant==='reviewed'?15:1;
    if(audit.witness.distanceM<minimum||audit.witness.distanceM>18){
      this.f4ZipResearchResult={status:'HOLD',reason:'RESEARCH_RANGE_OUTSIDE_LIMIT'};
      return;
    }
    const [x,y,z]=audit.goal;
    const [nx,,nz]=audit.witness.normal;
    this.f4ZipResearch={
      leg:'OUTBOUND',variant,start,returnStartedTick:null,hookCount:1,wallLostTicks:0,wallApproach:new Vec3(x,y,z),wallNormal:new Vec3(nx,0,nz).normalize(),
      wallColliderHandle:audit.witness.colliderHandle,returnSupportId:audit.returnLanding.solidId,
      hookDistanceM:audit.witness.distanceM,wallContact:null,ticks:0,stalledTicks:0,
      maxAcceptedStepM:0,travelledM:0
    };
    this.f4ZipResearchResult=null;
    this.velocity.set(0,0,0);
    this.verticalVelocity=0;
    this.sourceJumpBufferSeconds=0;
  }

  public get f4ZipResearchActive(): boolean {return this.f4ZipResearch!==null&&this.f4ZipResearchResult===null;}

  public get f4ZipNaturalActive():boolean {
    return this.f4ZipResearchActive&&this.f4ZipResearch?.variant==='natural';
  }
  public get f4ZipNaturalCanFire():boolean {
    return this.f4ZipNaturalActive&&this.f4ZipResearch?.leg==='ATTACHED';
  }
  public get f4ZipNaturalTicksLeft():number {
    return this.f4ZipNaturalActive?Math.max(0,540-(this.f4ZipResearch?.ticks??0)):0;
  }
  public tryF4ZipNaturalRehook(origin:Vec3,aim:Vec3,reticlePoint?:Vec3):boolean {
    const run=this.f4ZipResearch;
    if(!run||!this.f4ZipNaturalCanFire||run.ticks>=540||run.hookCount>=6)return false;
    const audit=this.auditF4ZipGeometry(origin,aim,18,run.start,reticlePoint);
    if(!audit.witness||!audit.goal||!audit.outbound?.clear||!audit.reverse?.clear||
       audit.returnLanding?.solidId!==run.returnSupportId||
       audit.witness.solidId!=='T21_F4_LOCAL_F3L_RESEARCH'||audit.witness.distanceM<1||
       audit.witness.distanceM>18)return false;
    const goal=new Vec3(...audit.goal);
    if(goal.distance(this.position)<.5)return false;
    const [nx,,nz]=audit.witness.normal;
    run.wallApproach=goal;run.wallNormal=new Vec3(nx,0,nz).normalize();
    run.wallColliderHandle=audit.witness.colliderHandle;run.hookDistanceM=audit.witness.distanceM;
    run.leg='OUTBOUND';run.wallContact=null;run.stalledTicks=0;run.wallLostTicks=0;run.hookCount++;
    return true;
  }
  public requestF4ZipNaturalReturn():void {
    const run=this.f4ZipResearch;
    if(!run||!this.f4ZipNaturalActive||run.returnStartedTick!==null)return;
    const support=this.physics.castCharacterFootSupport(run.start,PlayerController.humanFootOffset,'HUMAN');
    if(!support||support.solidId!==run.returnSupportId||(support.normal?.y??0)<.70||
       Math.abs(run.start.y-PlayerController.humanFootOffset-support.point.y)>.10){
      this.cancelF4ZipResearch('RETURN_ANCHOR_UNSUPPORTED');return;
    }
    if(this.position.distance(run.start)>.035&&!this.physics.auditF4HumanCapsuleSegment(
       this.position,run.start,PlayerController.humanHalfHeight,PlayerController.humanRadius,this.humanCollider).clear){
      this.cancelF4ZipResearch('RETURN_ROUTE_BLOCKED');return;
    }
    run.returnStartedTick=run.ticks;run.stalledTicks=0;
    run.leg=this.position.distance(run.start)<=.035?'LANDING':'RETURN';
  }

  public get f4ZipResearchStatus() {
    return this.f4ZipResearchResult?.status??this.f4ZipResearch?.leg??'READY';
  }

  public f4ZipResearchSnapshot() {
    const run=this.f4ZipResearch;
    const v=(p:Vec3|null)=>p&&[p.x,p.y,p.z];
    return {
      status:this.f4ZipResearchStatus,
      reason:this.f4ZipResearchResult?.reason??null,
      originalHookAuthorized:false,
      variant:run?.variant??null,wallApproach:run?v(run.wallApproach):null,
      hookCount:run?.hookCount??0,ticksLeft:this.f4ZipNaturalTicksLeft,
      hookDistanceM:run?.hookDistanceM??null,
      start:run?v(run.start):null,wallContact:run?v(run.wallContact):null,
      position:v(this.position),grounded:this.grounded,ticks:run?.ticks??0,
      travelledM:run?.travelledM??0,maxAcceptedStepM:run?.maxAcceptedStepM??0
    };
  }

  public resetF4ZipResearch(): void {
    this.f4ZipResearch=null;
    this.f4ZipResearchResult=null;
  }

  public cancelF4ZipResearch(reason:string): void {
    if(this.f4ZipResearchActive)this.f4ZipResearchResult={status:'HOLD',reason};
  }

  private computeF4ZipResearch(dt:number, bodyPosition: {x:number;y:number;z:number}, run:F4ZipResearchRun): void {
    const landing=run.leg==='LANDING';
    this.setSnapToGround(landing);
    const target=run.leg==='OUTBOUND'?run.wallApproach:run.start;
    const movement=run.leg==='WALL_CONTACT'||run.leg==='ATTACHED'?run.wallNormal.clone().mulScalar(-.06):
      landing?new Vec3(0,-.06,0):target.clone().sub(new Vec3(bodyPosition.x,bodyPosition.y,bodyPosition.z));
    const distance=movement.length();
    if(distance>14*dt)movement.mulScalar(14*dt/distance);
    this.computeKccMovement(bodyPosition,movement,dt);
  }

  /** Consume the solved movement only after the real Rapier world has stepped. */
  public observeF4ZipResearch(): void {
    const run=this.f4ZipResearch;
    if(!run||!this.f4ZipResearchActive)return;
    const moved=this.position.distance(this.previousPosition);
    run.ticks++;
    run.travelledM+=moved;
    run.maxAcceptedStepM=Math.max(run.maxAcceptedStepM,moved);
    run.stalledTicks=moved<.004?run.stalledTicks+1:0;
    if(run.leg==='OUTBOUND'&&this.position.distance(run.wallApproach)<.035){
      run.leg='WALL_CONTACT';
    }else if(run.leg==='WALL_CONTACT'){
      const wall=this.f4LastKccMotion?.contacts.some(hit=>
        hit.colliderHandle===run.wallColliderHandle&&
        hit.normal[0]!*run.wallNormal.x+hit.normal[2]!*run.wallNormal.z>.8);
      if(wall&&(run.variant==='reviewed'||this.position.distance(run.wallApproach)<=.22)){
        run.wallContact=this.position.clone();
        run.leg=run.variant==='natural'?'ATTACHED':'RETURN';
        run.stalledTicks=0;
      }else if(this.position.distance(run.wallApproach)>.22){
        this.cancelF4ZipResearch('REVIEWED_WALL_CONTACT_MISSING');
      }
    }else if(run.leg==='ATTACHED'){
      const wall=this.f4LastKccMotion?.contacts.some(hit=>
        hit.colliderHandle===run.wallColliderHandle&&
        hit.normal[0]!*run.wallNormal.x+hit.normal[2]!*run.wallNormal.z>.8);
      run.wallLostTicks=wall&&this.position.distance(run.wallApproach)<=.22?0:run.wallLostTicks+1;
      run.stalledTicks=0;
      if(run.wallLostTicks>=3)this.requestF4ZipNaturalReturn();
    }else if(run.leg==='RETURN'&&this.position.distance(run.start)<.035){
      run.leg='LANDING';
    }else if(run.leg==='LANDING'&&this.grounded){
      const support=this.physics.castCharacterFootSupport(
        this.position,PlayerController.humanFootOffset,'HUMAN');
      this.f4ZipResearchResult=support?.solidId===run.returnSupportId&&
        (support.normal?.y??0)>=.70&&this.position.distance(run.start)<=.12&&
        (run.variant==='reviewed'||Math.abs(this.position.y-PlayerController.humanFootOffset-support.point.y)<=.10)?
        {status:'RETURNED',reason:'KCC_WALL_CONTACT_AND_SUPPORTED_RETURN'}:
        {status:'HOLD',reason:'RETURN_SUPPORT_MISMATCH'};
    }
    if(run.variant==='natural'){
      if(run.returnStartedTick===null&&(run.ticks>=540||run.stalledTicks>=12))this.requestF4ZipNaturalReturn();
      else if(run.returnStartedTick!==null&&(run.stalledTicks>=12||run.ticks-run.returnStartedTick>=210))
        this.cancelF4ZipResearch('KCC_RETURN_BLOCKED_OR_TIMED_OUT');
    }else if(run.stalledTicks>=12||run.ticks>=210)this.cancelF4ZipResearch('KCC_ROUTE_BLOCKED_OR_TIMED_OUT');
  }

  public get canShoot(): boolean {
    return this.mode === 'HUMAN' &&
      this.weaponDodgeStartupSeconds <= 0 &&
      this.weaponDodgeRemainingSeconds <= 0 &&
      this.weaponDodgeShotLockSeconds <= 0;
  }

  public get twinCometsPhase(): 'NORMAL' | 'ROLL_LOCK' | 'FOCUSED' {
    return !this.canShoot ? 'ROLL_LOCK' : this.twinCometsStance ? 'FOCUSED' : 'NORMAL';
  }

  public get weaponDodgeTravelActive(): boolean {
    return this.weaponDodgeTravelTick;
  }

  public releaseTwinCometsStance(): void {
    this.twinCometsStance = false;
  }

  public resetWeaponDodge(): void {
    this.weaponDodgeStartupSeconds = 0;
    this.weaponDodgeRemainingSeconds = 0;
    this.weaponDodgeMoveLockSeconds = 0;
    this.weaponDodgeShotLockSeconds = 0;
    this.weaponDodgeRechargeSeconds = 0;
    this.weaponDodgeCharges = 2;
    this.weaponDodgeQueued = false;
    this.weaponDodgeCompletedEvent = false;
    this.twinCometsStance = false;
    this.weaponDodgeTravelTick = false;
    this.stats.playerWeaponDodgeCharges = 2;
  }

  public get currentMode(): PlayerMode {
    return this.mode;
  }

  public get currentInkRelation(): InkRelation {
    return this.nativeSourceGroundInkGuard
      ? nativeSourcePhysicallyContactedInk(
          this.inkRelation,this.locomotionState,this.grounded)
      : this.inkRelation;
  }

  /** Only true human SOURCE full rounds; all T20 and deterministic QA remain
   * unchanged. This affects resource contact, NOT player steering. */
  public setNativeSourceGroundInkGuard(
    enabled:boolean,paint?:readonly StagePaintSurfaceDefinition[]
  ):void{
    this.nativeSourceGroundInkGuard=enabled;
    this.sourceSupportedSolidId=null;
    this.sourceFootGapMeters=null;
    this.sourcePaintBackingById=null;
    if(!enabled)return;
    if(!paint||paint.length!==17||
       this.gameplayInk.getSurfaces().length!==paint.length)
      throw Error('T21_SOURCE_PAINT_MUST_HAVE_17_BACKINGS');
    const backings=new Map<string,string>();
    for(const p of paint){
      if(!this.gameplayInk.getSurface(p.id)||
         !p.backingSolidId||backings.has(p.id))
        throw Error('T21_SOURCE_INVALID_PAINT_BACKING');
      backings.set(p.id,p.backingSolidId);
    }
    this.sourcePaintBackingById=backings;
  }
  private sourceFloorInk(
    relation:InkRelation,sample:GameplayInkSample|null
  ):InkRelation{
    return nativeSourceInkOnRegisteredFoot(
      relation,this.grounded,
      sample&&this.sourceBackingMatchesSupport(sample.surface)?
        this.sourceSupportedSolidId:null,
      this.sourceSupportedSolidId,this.sourceFootGapMeters);
  }
  /** The KCC's supported SOURCE solid chooses the eligible ink surface
   * before ownership is sampled. Picking the nearest arbitrary surface first
   * can reject legitimate OWN on registered ramp/landing seams, or read
   * ENEMY from a neighboring registered slab. No fallback to other solids. */
  private sampleFootInk():GameplayInkSample|null{
    if(this.nativeSourceGroundInkGuard&&
       (!this.grounded||!this.sourceSupportedSolidId))return null;
    return this.gameplayInk.sampleWorld(
      this.nativeSourceGroundInkGuard?this.sourceFloorInkPoint:this.footPoint,
      this.physics.hasF4WholeResearchTrimesh?.10:.40,
      SurfaceFlags.Swimmable,SurfaceFlags.Wall,
      this.nativeSourceGroundInkGuard?this.sourceBackingMatchesSupport:undefined
    );
  }

  /** Read-only native original Rapier support / registered paint owner.
   * This never changes ink, stage, player, or actual native KCC state. */
  public sourceNativeFloorInkWitness(){
    const surfaceId=this.stats.playerSampleSurface;
    const paintBacking=this.sourcePaintBackingById?.get(surfaceId)??null;
    const footGap=this.sourceFootGapMeters;
    // Keep the original 25-solid witness separate from provisional F4.
    // sampleFootInk already required the live backed cell at actual KCC support.
    const f4FloorContact=this.f4ProvisionalControls&&this.physics.hasF4WholeResearchTrimesh&&
      this.grounded&&this.sourceSupportedSolidId==='T21_F4_LOCAL_F3L_RESEARCH'&&
      footGap!==null&&Number.isFinite(footGap)&&Math.abs(footGap)<=.12&&
      surfaceId.startsWith('F4ProvisionalFloor:')&&
      this.currentInkRelation!=='NONE';
    const verified=this.nativeSourceGroundInkGuard&&this.grounded&&
      paintBacking!==null&&paintBacking===this.sourceSupportedSolidId&&
      footGap!==null&&Number.isFinite(footGap)&&Math.abs(footGap)<=.12;
    const floorRuleApplicable=this.locomotionState!=='SWIM_WALL'&&
      this.locomotionState!=='SURGE_CHARGE';
    return {
      sourceOnlyEnabled:this.nativeSourceGroundInkGuard,
      originalAuthority:'25/17/26/0' as const,
      actualKccGrounded:this.grounded,
      actualRapierSolidId:this.sourceSupportedSolidId,
      actualRapierFootGapMeters:footGap,
      sampledPaintSurfaceId:surfaceId,
      sampledBackingSolidId:paintBacking,
      floorContactVerified:verified,
      provisionalF4FloorContact:f4FloorContact,
      floorRuleApplicable,
      inkRelation:this.currentInkRelation,
      locomotionState:this.locomotionState,
      originalGeometryWrites:0 as const,
      originalPaintWrites:0 as const,
      officialTurfScoreable:0 as const,
      certifiesHumanRoute:false as const
    };
  }

  public requestWeaponDodge(payInk?: () => boolean): boolean {
    if (
      this.mode !== 'HUMAN' ||
      this.weaponDodgeCharges <= 0 ||
      this.weaponDodgeStartupSeconds > 0 ||
      this.weaponDodgeRemainingSeconds > 0 ||
      this.weaponDodgeQueued
    ) {
      return false;
    }
    if (payInk && !payInk()) return false;
    this.weaponDodgeQueued = true;
    return true;
  }

  public consumeWeaponDodgeCompleted(): boolean {
    const started = this.weaponDodgeCompletedEvent;
    this.weaponDodgeCompletedEvent = false;
    return started;
  }

  public setWeaponMoveMultiplier(multiplier: number): void {
    this.weaponMoveMultiplier = clamp(multiplier, 0.45, 1.25);
  }

  public setTeam(team: Team.A | Team.B): void {
    this.team = team;
    this.updateMaterial();
  }

  public setLifecycleActive(active: boolean): void {
    this.entity.enabled = active;
    if (!active) {
      this.twinCometsStance = false;
      this.weaponDodgeTravelTick = false;
      this.humanCollider.setEnabled(false);
      this.squidCollider.setEnabled(false);
      return;
    }

    this.humanCollider.setEnabled(this.mode === 'HUMAN');
    this.squidCollider.setEnabled(this.mode === 'SQUID');
    this.activeCollider = this.mode === 'HUMAN' ? this.humanCollider : this.squidCollider;
  }

  public teleport(position: Vec3): void {
    this.mode = 'HUMAN';
    this.locomotionState = 'HUMAN';
    this.inkRelation = 'NONE';
    this.velocity.set(0, 0, 0);
    this.desired.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.sourceJumpBufferSeconds = 0;
    this.grounded = false;
    this.wallSurfaceId = '-';
    this.squidRollRemainingSeconds = 0;
    this.squidRollTurnWindowSeconds = 0;
    this.surgeRemainingSeconds = 0;
    this.surgeChargeSeconds = 0;
    this.resetWeaponDodge();
    this.saberLungeActive = false;
    this.weaponMoveMultiplier = 1;
    this.setSnapToGround(true);

    this.squidCollider.setEnabled(false);
    this.humanCollider.setEnabled(true);
    this.activeCollider = this.humanCollider;
    this.entity.enabled = true;
    this.entity.setLocalScale(0.72, 0.92, 0.72);
    this.b248Visual?.setMode('HUMAN');

    this.body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
    this.body.setNextKinematicTranslation({ x: position.x, y: position.y, z: position.z });
    this.position.copy(position);
    this.previousPosition.copy(position);
    this.renderPosition.copy(position);
    // Presentation reset only; the actual spawn and colliders above remain authoritative.
    this.camera.resetF4AimTracking?.();
    this.sourceSupportedSolidId=null;
    this.sourceFootGapMeters=null;
    this.footPoint.set(
      position.x,
      position.y - PlayerController.humanFootOffset + 0.06,
      position.z
    );
    this.applyVisualPosition(position);
  }

  public computeFixed(dt: number, twinCometsTrigger?: boolean, saberLunge?: Vec3, mistSpeedScale = 1): void {
    this.mistSpeedScale = mistSpeedScale;
    this.f4ConsumedIntent.x=0;this.f4ConsumedIntent.y=0;this.f4ConsumedIntent.squid=false;
    const bodyPosition = this.body.translation();
    if(this.f4ZipResearchActive&&this.f4ZipResearch){
      this.input.consumeJump();
      if(this.f4ProvisionalControls){
        // Drain only transient locomotion intent. Physically held movement
        // still applies when the actual exclusive KCC traversal ends.
        this.input.consumeMoveAxesForPlayerTick();
        this.input.consumeSquidHeldForPlayerTick();
        this.sourceJumpBufferSeconds=0;
        this.squidRollTurnWindowSeconds=0;
      }
      this.computeF4ZipResearch(dt,bodyPosition,this.f4ZipResearch);
      return;
    }

    this.footPoint.set(
      bodyPosition.x,
      bodyPosition.y - PlayerController.humanFootOffset + 0.06,
      bodyPosition.z
    );
    const groundSample = this.sampleFootInk();
    this.inkRelation = this.relationFor(groundSample);
    if(this.nativeSourceGroundInkGuard)
      this.inkRelation=this.sourceFloorInk(this.inkRelation,groundSample);

    this.camera.getFlatForward(this.flatForward);
    this.right.set(-this.flatForward.z, 0, this.flatForward.x);

    // Short real WASD taps between 60Hz ticks still influence this
    // *existing* genuine KCC step. Stale prestart/lock/death events are
    // discarded by PlayerInput. Legacy T20 uses its unchanged live axes.
    const sourceAxes=this.nativeSourceGroundInkGuard
      ? this.input.consumeMoveAxesForPlayerTick():null;
    const inputX = sourceAxes?sourceAxes.x:this.input.moveX;
    const inputY = sourceAxes?sourceAxes.y:this.input.moveY;
    if(this.f4ProvisionalControls){this.f4ConsumedIntent.x=inputX;this.f4ConsumedIntent.y=inputY;}
    this.desired.set(
      this.right.x * inputX + this.flatForward.x * inputY,
      0,
      this.right.z * inputX + this.flatForward.z * inputY
    );
    if (this.desired.lengthSq() > 1) this.desired.normalize();

    if (this.saberLungeActive && !saberLunge) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    this.saberLungeActive = false;
    const jumpPressed = this.input.consumeJump();
    // The SOURCE input queue captures physical Shift taps that start/end
    // between 60Hz steps. This only chooses HUMAN/SQUID for one *real* KCC
    // step; no extra floor, paint ownership, collision or wall authority.
    const squidHeldForTick=this.nativeSourceGroundInkGuard
      ? this.input.consumeSquidHeldForPlayerTick():this.input.squidHeld;
    if(this.f4ProvisionalControls)this.f4ConsumedIntent.squid=squidHeldForTick;
    // A genuine Space tap one fixed tick before landing used to disappear.
    // Buffered intent can execute ONLY after existing Rapier KCC says grounded.
    // No extra ground/coyote-time/stepping or changes to frozen T20.
    if (this.nativeSourceGroundInkGuard) {
      // A pointer-lock drop makes old Space intent invalid even if the
      // browser has not delivered pointerlockchange yet.
      // Space during exclusive Dualies/dodge, squid-roll or surge cannot
      // become a delayed unrelated grounded jump when that action ends.
      const exclusiveAction=this.weaponDodgeQueued||
        this.weaponDodgeStartupSeconds>0||this.weaponDodgeRemainingSeconds>0||
        this.weaponDodgeMoveLockSeconds>0||
        this.squidRollRemainingSeconds>0||this.surgeRemainingSeconds>0;
      this.sourceJumpBufferSeconds=nativeSourceNextJumpBufferSeconds(
        this.sourceJumpBufferSeconds,jumpPressed,dt,
        this.input.sourceLiveInputAvailable,exclusiveAction);
    }
    this.squidRollTurnWindowSeconds = Math.max(0, this.squidRollTurnWindowSeconds - dt);

    this.weaponDodgeTravelTick = false;
    const dodgeStartupWasActive = this.weaponDodgeStartupSeconds > 0;
    const dodgeRollWasActive = this.weaponDodgeRemainingSeconds > 0;
    const dodgeTimer = (timer: number) => {
      const remaining = timer - dt;
      return twinCometsTrigger !== undefined && remaining < 1e-8 ? 0 : Math.max(0, remaining);
    };
    this.weaponDodgeStartupSeconds = dodgeTimer(this.weaponDodgeStartupSeconds);
    const dodgeMovementStartsThisTick =
      dodgeStartupWasActive && this.weaponDodgeStartupSeconds <= 0;

    if (!dodgeStartupWasActive) {
      this.weaponDodgeRemainingSeconds = dodgeTimer(this.weaponDodgeRemainingSeconds);
    }
    if (
      dodgeRollWasActive &&
      !dodgeStartupWasActive &&
      this.weaponDodgeRemainingSeconds <= 0
    ) {
      this.weaponDodgeCompletedEvent = true;
      this.twinCometsStance = twinCometsTrigger !== undefined;
    }
    if (!dodgeStartupWasActive && !dodgeRollWasActive) {
      this.weaponDodgeMoveLockSeconds = dodgeTimer(this.weaponDodgeMoveLockSeconds);
      this.weaponDodgeShotLockSeconds = dodgeTimer(this.weaponDodgeShotLockSeconds);
    }
    if (this.weaponDodgeRechargeSeconds > 0) {
      this.weaponDodgeRechargeSeconds = dodgeTimer(this.weaponDodgeRechargeSeconds);
      if (this.weaponDodgeRechargeSeconds <= 0) {
        this.weaponDodgeCharges = 2;
        this.stats.playerWeaponDodgeCharges = 2;
      }
    }
    // After the existing locomotion lock, a held trigger can retain the
    // braced stance until the player releases or asks to move/change form.
    if (twinCometsTrigger === undefined ||
        (this.weaponDodgeMoveLockSeconds <= 0 &&
          (!twinCometsTrigger || squidHeldForTick || jumpPressed || this.desired.lengthSq() > 0))) {
      this.twinCometsStance = false;
    }

    if (this.weaponDodgeStartupSeconds > 0) {
      this.setMode('HUMAN');
      this.locomotionState = 'DUALIE_DODGE';
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollTurnWindowSeconds = 0;
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (this.weaponDodgeRemainingSeconds > 0) {
      this.weaponDodgeTravelTick = true;
      if (dodgeMovementStartsThisTick) {
        this.velocity.x = this.weaponDodgeDirection.x * 10.2;
        this.velocity.z = this.weaponDodgeDirection.z * 10.2;
      }
      this.setMode('HUMAN');
      this.locomotionState = 'DUALIE_DODGE';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollTurnWindowSeconds = 0;
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (
      this.weaponDodgeQueued &&
      this.mode === 'HUMAN' &&
      this.weaponDodgeCharges > 0
    ) {
      if (this.desired.lengthSq() > 0.04) {
        this.weaponDodgeDirection.copy(this.desired).normalize();
      } else {
        this.weaponDodgeDirection.copy(this.flatForward).normalize();
      }
      this.velocity.x = 0;
      this.velocity.z = 0;
      if (this.grounded) this.verticalVelocity = 0;

      // Public Splat Dualies reference structure at 60 Hz:
      // 4F startup -> 12F roll -> 4F until fire returns -> +28F post-roll stance.
      this.weaponDodgeStartupSeconds = 4 / 60;
      this.weaponDodgeRemainingSeconds = 12 / 60;
      this.weaponDodgeShotLockSeconds = 4 / 60;
      this.weaponDodgeMoveLockSeconds = 32 / 60;
      this.weaponDodgeCharges -= 1;
      this.twinCometsStance = false;
      this.weaponDodgeRechargeSeconds = 48 / 60;
      this.weaponDodgeQueued = false;
      this.stats.playerWeaponDodges += 1;
      this.stats.playerWeaponDodgeCharges = this.weaponDodgeCharges;
      this.locomotionState = 'DUALIE_DODGE';
      this.setMode('HUMAN');
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (this.weaponDodgeMoveLockSeconds > 0) {
      this.setMode('HUMAN');
      this.locomotionState = 'DUALIE_DODGE';
      // Post-roll firing stance: aim/fire can resume before locomotion does.
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.wallSurfaceId = '-';
      this.setSnapToGround(true);
      this.applyGravity(dt);
    } else if (this.squidRollRemainingSeconds > 0) {
      this.setMode('SQUID');
      this.locomotionState = 'SQUID_ROLL';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollRemainingSeconds = Math.max(0, this.squidRollRemainingSeconds - dt);
      this.applyGravity(dt);
      this.setSnapToGround(false);
    } else if (this.surgeRemainingSeconds > 0) {
      this.setMode('SQUID');
      this.locomotionState = 'SURGE';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.surgeRemainingSeconds = Math.max(0, this.surgeRemainingSeconds - dt);
      this.verticalVelocity -= GAME_CONFIG.player.surgeGravityMetersPerSecond2 * dt;
      this.setSnapToGround(false);
    } else if (squidHeldForTick) {
      this.setMode('SQUID');
      const wall = this.findOwnWallSample(bodyPosition);
      // A wall swim/charge owns its Space semantics; do not carry a floor
      // jump tap into a later unrelated ground contact.
      if (wall) this.sourceJumpBufferSeconds = 0;
      if (wall && nativeSourceWallSurgeRequested(
        this.input.jumpHeld,this.surgeChargeSeconds,jumpPressed,
        this.nativeSourceGroundInkGuard
      )) {
        if (this.input.jumpHeld) {
          this.input.consumeJump();
          this.surgeChargeSeconds = Math.min(
            GAME_CONFIG.player.surgeMaxChargeSeconds,
            this.surgeChargeSeconds + dt
          );
          this.locomotionState = 'SURGE_CHARGE';
          this.wallSurfaceId = wall.sample.surface.id;
          this.inkRelation = 'OWN';
          this.velocity.set(
            -wall.outward.x * GAME_CONFIG.player.wallStickSpeedMetersPerSecond,
            0,
            -wall.outward.z * GAME_CONFIG.player.wallStickSpeedMetersPerSecond
          );
          this.verticalVelocity = 0;
          this.setSnapToGround(false);
        } else {
          this.triggerSurge(wall);
        }
      } else if (wall) {
        this.surgeChargeSeconds = 0;
        this.locomotionState = 'SWIM_WALL';
        this.wallSurfaceId = wall.sample.surface.id;
        this.inkRelation = 'OWN';
        this.applyWallSwim(wall);
        this.setSnapToGround(false);
      } else {
        // Shift is still held, but the real OWN wall probe no longer
        // authorizes swimming. Drop the previous wall-climb drive just as
        // when releasing Shift into HUMAN. Do not create airborne ascent
        // from a missing wall or change genuine SURGE/roll jump impulses.
        if(this.nativeSourceGroundInkGuard&&
           !this.f4CanCarryWallCrest(bodyPosition))
          this.verticalVelocity=nativeSourceWallReleaseVerticalVelocity(
            this.locomotionState,this.verticalVelocity);
        this.surgeChargeSeconds = 0;
        this.wallSurfaceId = '-';
        this.setSnapToGround(true);

        const tuning = GAME_CONFIG.player;
        // In a genuine SOURCE round, nearby painted projection alone cannot
        // grant swim speed while the actual Rapier character is airborne.
        // Use the prior native KCC ground result at this pre-movement tick.
        // Verified wall-swim/surge paths above keep their separate rules.
        const groundInkRelation =
          this.nativeSourceGroundInkGuard && !this.grounded
            ? 'NONE' : this.inkRelation;
        if (groundInkRelation === 'OWN') {
          this.locomotionState = 'SWIM_GROUND';
          if(this.f4ProvisionalControls&&this.squidRollTurnWindowSeconds>0&&
             !f4KeepRollIntent(this.desired,this.squidRollDirection))
            this.squidRollTurnWindowSeconds=0;
          this.captureSquidRollTurnIntent();

          if (nativeSourceSquidRollJumpRequested(
            jumpPressed,this.nativeSourceGroundInkGuard,this.sourceJumpBufferSeconds
          ) && this.grounded && this.squidRollTurnWindowSeconds > 0) {
            this.startSquidRoll();
          } else {
            this.applyHorizontalTarget(
              tuning.squidOwnInkSpeedMetersPerSecond,
              tuning.squidOwnInkAccelerationMetersPerSecond2,
              dt
            );
            this.tryJump(jumpPressed, tuning.squidJumpSpeedMetersPerSecond);
            this.applyGravity(dt);
          }
        } else {
          this.squidRollTurnWindowSeconds = 0;
          this.locomotionState = 'SQUID_DRY';

          if(this.f4ProvisionalControls&&!this.grounded){
            // Do not grant OWN while airborne. Preserve bounded takeoff
            // momentum, with reduced directional acceleration, through the
            // same actual KCC and mist multiplier. Normal release braking
            // and grounded/dry/enemy speed tuning remain unchanged.
            this.applyHorizontalTarget(
              f4AirborneSquidSpeed(tuning.humanSpeedMetersPerSecond,
                tuning.squidOwnInkSpeedMetersPerSecond,this.velocity.x,this.velocity.z),
              tuning.groundAccelerationMetersPerSecond2*.5,dt
            );
          } else if (groundInkRelation === 'ENEMY') {
            this.applyHorizontalTarget(
              tuning.squidEnemyInkSpeedMetersPerSecond,
              tuning.squidDryAccelerationMetersPerSecond2,
              dt
            );
          } else {
            // T9 tuning: Squid form outside any ink keeps Human-equivalent mobility.
            this.applyHorizontalTarget(
              tuning.humanSpeedMetersPerSecond,
              tuning.groundAccelerationMetersPerSecond2,
              dt
            );
          }

          this.tryJump(jumpPressed, tuning.squidJumpSpeedMetersPerSecond);
          this.applyGravity(dt);
        }
      }
    } else {
      if(this.nativeSourceGroundInkGuard)
        this.verticalVelocity=nativeSourceWallReleaseVerticalVelocity(
          this.locomotionState,this.verticalVelocity);
      this.setMode('HUMAN');
      this.locomotionState = 'HUMAN';
      this.wallSurfaceId = '-';
      this.surgeChargeSeconds = 0;
      this.squidRollTurnWindowSeconds = 0;
      this.setSnapToGround(true);

      const tuning = GAME_CONFIG.player;
      // True SOURCE human feet obey enemy ink as well as squid feet.
      // Only actual registered Rapier backing contact can set ENEMY here;
      // an optical nearby slab, air or unrelated PaintSurface cannot slow.
      // Reuse the existing enemy-ink movement tuning, not a fabricated
      // SOURCE-only speed or a new collision/navigation rule.
      const sourceEnemyInk = this.nativeSourceGroundInkGuard &&
        this.grounded && this.inkRelation === 'ENEMY';
      this.applyHorizontalTarget(
        (sourceEnemyInk
          ? tuning.squidEnemyInkSpeedMetersPerSecond
          : tuning.humanSpeedMetersPerSecond) * this.weaponMoveMultiplier,
        sourceEnemyInk
          ? tuning.squidDryAccelerationMetersPerSecond2
          : tuning.groundAccelerationMetersPerSecond2,
        dt
      );
      this.tryJump(jumpPressed, tuning.jumpSpeedMetersPerSecond);
      this.applyGravity(dt);
    }

    if (saberLunge && this.grounded && !squidHeldForTick && !jumpPressed && this.locomotionState === 'HUMAN') {
      this.saberLungeActive = true;
      this.velocity.x = saberLunge.x;
      this.velocity.z = saberLunge.z;
    }
    this.computeKccMovement(bodyPosition,{
      x:this.velocity.x*dt,y:this.verticalVelocity*dt,z:this.velocity.z*dt
    },dt);
    if (this.grounded && this.verticalVelocity < 0) this.verticalVelocity = -0.5;
    this.stats.playerWeaponDodgeCharges = this.weaponDodgeCharges;
  }

  private computeKccMovement(
    bodyPosition:{x:number;y:number;z:number},movement:{x:number;y:number;z:number},dt:number
  ):void {
    this.character.computeColliderMovement(
      this.activeCollider,
      movement,
      undefined,
      undefined,
      this.characterCollisionFilter
    );
    const corrected = this.character.computedMovement();
    this.grounded = this.character.computedGrounded();
    if(this.f4KccAuditEnabled){
      const contacts:{colliderHandle:number;solidId:string|null;normal:number[]}[]=[];
      for(let i=0;i<this.character.numComputedCollisions();i++){
        const hit=this.character.computedCollision(i);
        if(!hit?.collider)continue;
        contacts.push({
          colliderHandle:hit.collider.handle,
          solidId:this.physics.sourceSolidIdForCollider(hit.collider),
          normal:[hit.normal1.x,hit.normal1.y,hit.normal1.z]
        });
      }
      this.f4LastKccMotion={
        requested:[movement.x,movement.y,movement.z],
        accepted:[corrected.x,corrected.y,corrected.z],
        grounded:this.grounded,contacts
      };
    }
    // Actual original Rapier KCC walls / teammates decide next-tick
    // momentum; no XZ motion is added or moved outside a registered solid.
    nativeSourceReconcileKccPlanarVelocity(
      this.velocity,corrected,dt,this.character.numComputedCollisions(),
      this.locomotionState,this.nativeSourceGroundInkGuard
    );

    this.body.setNextKinematicTranslation({
      x: bodyPosition.x + corrected.x,
      y: bodyPosition.y + corrected.y,
      z: bodyPosition.z + corrected.z
    });

  }

  public syncAfterPhysics(dt?: number): void {
    const p = this.body.translation();

    if (!this.positionInitialized) {
      this.position.set(p.x, p.y, p.z);
      this.previousPosition.copy(this.position);
      this.renderPosition.copy(this.position);
      this.positionInitialized = true;
    } else {
      this.previousPosition.copy(this.position);
      this.position.set(p.x, p.y, p.z);
    }

    // Frozen T20 draws at its historical point in the fixed tick.
    // Native SOURCE instead waits for actual post-Rapier speed below:
    // its player pose must not animate using the preceding tick's speed.
    if(!this.nativeSourceGroundInkGuard)
      this.applyVisualPosition(this.position);

    this.stats.playerWorldX = this.position.x;
    this.stats.playerWorldY = this.position.y;
    this.stats.playerWorldZ = this.position.z;
    this.stats.playerMode = this.mode;
    this.stats.playerLocomotionState = this.locomotionState;
    this.stats.playerGrounded = this.grounded;
    this.stats.playerSpeedMetersPerSecond = dt && dt > 0
      ? Math.hypot(
          this.position.x - this.previousPosition.x,
          this.position.z - this.previousPosition.z
        ) / dt
      : 0;
    // Keep the visual body on the SAME real Rapier coordinate; only the
    // native animation speed witness is now from this actual physics step.
    if(this.nativeSourceGroundInkGuard)
      this.applyVisualPosition(this.position);
    // SOURCE resources update immediately after this real Rapier step.
    // The pre-step footPoint was necessary for movement planning, but using
    // its old ink owner here allows one tick of false OWN refill or ENEMY
    // damage after the player already crossed a painted edge or landed.
    // Source-only: sample the *actual* current capsule/ball foot once.
    // Keep wall-swim/surge's independently verified OWN wall contact;
    // they never inherit floor ownership from an unrelated lower slab.
    if(this.nativeSourceGroundInkGuard){
      // Only an existing SOURCE static Rapier collider may provide the
      // real floor contact. Never write KCC, stage, nav or ink here.
      const candidate=this.grounded?this.physics.castCharacterFootSupport(
        this.sourceFootCastPosition.set(p.x,p.y,p.z),
        PlayerController.humanFootOffset,this.mode):null;
      // Never treat a side or ceiling as floor ink; preserve real KCC motion.
      let hit=this.physics.hasF4WholeResearchTrimesh&&
        (!f4WalkableSupportNormal(candidate?.normal?.y,
          PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians)||
         !candidate||Math.abs(p.y-PlayerController.humanFootOffset-candidate.point.y)>.12)?null:candidate;
      // At an actual floor seam, use a real grounded KCC contact, not
      // an invented center floor ray. Restrict its witness to current foot.
      if(!hit&&this.grounded&&this.physics.hasF4WholeResearchTrimesh){
        const radius=this.mode==='SQUID'?PlayerController.squidRadius:PlayerController.humanRadius;
        for(let i=0;i<this.character.numComputedCollisions();i++){
          const c=this.character.computedCollision(i);
          if(!c?.collider||!f4WalkableSupportNormal(c.normal1.y,PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians))continue;
          const id=this.physics.sourceSolidIdForCollider(c.collider),w=c.witness1;
          if(!id||Math.abs(p.y-PlayerController.humanFootOffset-w.y)>.12||
             Math.hypot(w.x-p.x,w.z-p.z)>radius+.075)continue;
          hit={distance:0,point:new Vec3(w.x,w.y,w.z),collider:c.collider,solidId:id,
            normal:new Vec3(c.normal1.x,c.normal1.y,c.normal1.z)};break;
        }
      }
      this.sourceSupportedSolidId=hit?.solidId??null;
      // Read the ink cell at the actual registered Rapier support point.
      // Projecting the elevated capsule/ball foot onto a slope shifts UV
      // downhill/uphill across ink-cell and surface boundaries. Reuse this
      // same post-step point for next tick's movement planning as well.
      // A missing hit clears support above, so stale coordinates cannot
      // grant floor ink. The KCC gap/backing checks remain mandatory.
      if(hit)this.sourceFloorInkPoint.copy(hit.point);
      this.sourceFootGapMeters=hit?
        p.y-PlayerController.humanFootOffset-hit.point.y:null;
      this.footPoint.set(
        p.x,p.y-PlayerController.humanFootOffset+0.06,p.z);
    }
    const debugSample = this.sampleFootInk();
    if(this.nativeSourceGroundInkGuard&&
       this.locomotionState!=='SWIM_WALL'&&
       this.locomotionState!=='SURGE_CHARGE'){
      this.inkRelation=this.sourceFloorInk(this.relationFor(debugSample),debugSample);
    }
    // Ownership cannot survive a real departure from a painted wall for
    // even one resource-update tick. No state/velocity/position change.
    if(this.physics.hasF4WholeResearchTrimesh&&this.wallSurfaceId.startsWith('F4ProvisionalWall:')&&
       (this.locomotionState==='SWIM_WALL'||this.locomotionState==='SURGE_CHARGE')&&
       !this.findOwnWallSample(p))this.inkRelation='NONE';
    this.stats.playerInkRelation = this.currentInkRelation;
    this.stats.playerSampleSurface = debugSample?.surface.id ?? '-';
    this.stats.playerSampleU = debugSample?.u ?? Number.NaN;
    this.stats.playerSampleV = debugSample?.v ?? Number.NaN;
    this.stats.playerCollider = this.mode === 'SQUID' ? 'BALL' : 'CAPSULE';
    this.stats.playerWallSurface = this.wallSurfaceId;
    this.stats.playerSurgeCharge = GAME_CONFIG.player.surgeMaxChargeSeconds > 0
      ? this.surgeChargeSeconds / GAME_CONFIG.player.surgeMaxChargeSeconds
      : 0;
    this.stats.playerSquidRollReady = this.squidRollTurnWindowSeconds > 0;
  }

  public render(alpha: number, out = new Vec3()): Vec3 {
    const t = Math.max(0, Math.min(1, alpha));
    this.renderPosition.set(
      this.previousPosition.x + (this.position.x - this.previousPosition.x) * t,
      this.previousPosition.y + (this.position.y - this.previousPosition.y) * t,
      this.previousPosition.z + (this.position.z - this.previousPosition.z) * t
    );
    this.applyVisualPosition(this.renderPosition, true);
    return out.copy(this.renderPosition);
  }

  /** B149: read computed contacts from the ACTUAL PlayerController Rapier
   * KCC, not from an ambiguous CPU-side owner label. No new contact query. */
  public enableF4KccAudit():void{this.f4KccAuditEnabled=true;}
  public qaF4LastKccMotion(){return this.f4LastKccMotion;}
  public qaActualKccComputedColliderHandles():readonly number[]{
    const out:number[]=[];
    for(let i=0;i<this.character.numComputedCollisions();i++){
      const hit=this.character.computedCollision(i)?.collider;
      if(hit)out.push(hit.handle);
    }
    return out;
  }

  public getPosition(out = new Vec3()): Vec3 {
    return out.copy(this.position);
  }

  public getMuzzlePosition(aimDirection: Vec3, out = new Vec3()): Vec3 {
    out.copy(this.position);
    out.y += this.mode === 'SQUID' ? 0.18 : 0.42;
    this.muzzleOffset.copy(aimDirection).mulScalar(0.58);
    out.add(this.muzzleOffset);
    return out;
  }

  private applyHorizontalTarget(targetSpeed: number, acceleration: number, dt: number): void {
    targetSpeed *= this.mistSpeedScale ?? 1;
    const desiredX = this.desired.x * targetSpeed;
    const desiredZ = this.desired.z * targetSpeed;
    const accel = this.desired.lengthSq() > 0
      ? acceleration
      : GAME_CONFIG.player.decelerationMetersPerSecond2;
    if (this.nativeSourceGroundInkGuard) {
      // Legacy component-wise acceleration could gain sqrt(2) more speed
      // per tick while steering diagonally. SOURCE uses a single planar
      // acceleration budget while preserving all configured top speeds.
      const dx = desiredX - this.velocity.x;
      const dz = desiredZ - this.velocity.z;
      const change = Math.hypot(dx, dz);
      const allowed = accel * dt;
      if (change > allowed && change > 0) {
        const ratio = allowed / change;
        this.velocity.x += dx * ratio;
        this.velocity.z += dz * ratio;
      } else {
        this.velocity.x = desiredX;
        this.velocity.z = desiredZ;
      }
      return;
    }
    this.velocity.x = moveToward(this.velocity.x, desiredX, accel * dt);
    this.velocity.z = moveToward(this.velocity.z, desiredZ, accel * dt);
  }

  private tryJump(jumpPressed: boolean, jumpSpeed: number): void {
    if (!this.grounded ||
        (!jumpPressed &&
         !(this.nativeSourceGroundInkGuard && this.sourceJumpBufferSeconds > 0)))
      return;
    this.verticalVelocity = jumpSpeed;
    this.grounded = false;
    this.sourceJumpBufferSeconds = 0;
  }

  private applyGravity(dt: number): void {
    this.verticalVelocity -= GAME_CONFIG.player.gravityMetersPerSecond2 * dt;
    this.verticalVelocity = Math.max(
      this.verticalVelocity,
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond
    );
  }

  private captureSquidRollTurnIntent(): void {
    if (!this.grounded) return;

    const tuning = GAME_CONFIG.player;
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed < tuning.squidRollMinSpeedMetersPerSecond) return;
    if (this.desired.lengthSq() < 0.25) return;

    const dot = (
      this.velocity.x * this.desired.x +
      this.velocity.z * this.desired.z
    ) / Math.max(speed, 1e-6);

    if (dot > tuning.squidRollReverseDotThreshold) return;

    this.squidRollDirection.copy(this.desired).normalize();
    this.squidRollTurnWindowSeconds = tuning.squidRollTurnGraceSeconds;
  }

  private startSquidRoll(): void {
    const tuning = GAME_CONFIG.player;
    if (this.squidRollDirection.lengthSq() <= 1e-6) return;

    this.velocity.x = this.squidRollDirection.x * tuning.squidRollSpeedMetersPerSecond;
    this.velocity.z = this.squidRollDirection.z * tuning.squidRollSpeedMetersPerSecond;
    this.verticalVelocity = tuning.squidRollUpSpeedMetersPerSecond;
    this.squidRollRemainingSeconds = tuning.squidRollDurationSeconds;
    this.squidRollTurnWindowSeconds = 0;
    this.sourceJumpBufferSeconds = 0;
    this.locomotionState = 'SQUID_ROLL';
    this.grounded = false;
    this.setSnapToGround(false);
  }

  private applyWallSwim(wall: OwnWallSample): void {
    const tuning = GAME_CONFIG.player;
    const tangent = wall.sample.surface.uAxis;
    const lateralAmount = clamp(
      this.desired.x * tangent.x + this.desired.z * tangent.z,
      -1,
      1
    );
    const climbAmount = clamp(wall.towardAmount, 0, 1);

    this.velocity.x =
      tangent.x * lateralAmount * tuning.squidWallLateralSpeedMetersPerSecond -
      wall.outward.x * tuning.wallStickSpeedMetersPerSecond;
    this.velocity.z =
      tangent.z * lateralAmount * tuning.squidWallLateralSpeedMetersPerSecond -
      wall.outward.z * tuning.wallStickSpeedMetersPerSecond;
    this.verticalVelocity = climbAmount * tuning.squidWallClimbSpeedMetersPerSecond;
    this.grounded = false;
  }

  private triggerSurge(wall: OwnWallSample): void {
    const tuning = GAME_CONFIG.player;
    const chargeFraction = clamp(
      Math.max(this.surgeChargeSeconds, tuning.surgeMinChargeSeconds) /
        tuning.surgeMaxChargeSeconds,
      0,
      1
    );
    const upSpeed =
      tuning.surgeMinUpSpeedMetersPerSecond +
      (tuning.surgeMaxUpSpeedMetersPerSecond - tuning.surgeMinUpSpeedMetersPerSecond) *
        chargeFraction;

    this.velocity.x = wall.outward.x * tuning.surgeAwaySpeedMetersPerSecond;
    this.velocity.z = wall.outward.z * tuning.surgeAwaySpeedMetersPerSecond;
    this.verticalVelocity = upSpeed;
    this.surgeChargeSeconds = 0;
    this.surgeRemainingSeconds = tuning.surgeDurationSeconds;
    this.locomotionState = 'SURGE';
    this.wallSurfaceId = '-';
    this.grounded = false;
    this.setSnapToGround(false);
  }

  // Retain existing upward momentum at a real wall lip, never create a
  // new climb impulse. Standard dry squid acceleration/gravity + KCC own
  // the next movement; floor ray is only a gate, not a landing guarantee.
  private f4CanCarryWallCrest(body:{x:number;y:number;z:number}):boolean{
    if(!this.physics.hasF4WholeResearchTrimesh||this.locomotionState!=='SWIM_WALL'||
       !this.wallSurfaceId.startsWith('F4ProvisionalWall:')||this.verticalVelocity<=0||
       !this.input.sourceLiveInputAvailable)return false;
    const surface=this.gameplayInk.getSurface(this.wallSurfaceId);
    if(!surface)return false;
    const center=new Vec3(body.x,body.y+PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters,body.z);
    const signed=surface.projectWorldPoint(center).signedPlaneDistance;
    if(Math.abs(signed)>PlayerController.squidRadius+.20)return false;
    const inward=surface.normal.clone().mulScalar(signed>=0?-1:1);
    const toward=this.desired.dot(inward);
    if(toward<GAME_CONFIG.player.wallAttachInputThreshold)return false;
    const across=center.clone().add(inward.mulScalar(Math.abs(signed)+PlayerController.squidRadius+.14));
    const footY=body.y-PlayerController.humanFootOffset;
    const support=this.physics.castCharacterFootSupport(new Vec3(across.x,footY+.42,across.z),0,'SQUID');
    if(!support)return false;
    const clear=!this.physics.castStageSegment(center,across,'ink-projectile');
    return f4CarryCrestMomentum(support.point.y-footY,support.normal?.y,
      this.verticalVelocity,toward,GAME_CONFIG.player.gravityMetersPerSecond2,clear);
  }

  private findOwnWallSample(bodyPosition: { x: number; y: number; z: number }): OwnWallSample | null {
    if (this.desired.lengthSq() < 0.04) return null;

    const tuning = GAME_CONFIG.player;
    this.wallProbePoint.set(
      bodyPosition.x + this.desired.x * tuning.wallProbeForwardMeters,
      bodyPosition.y + (this.physics.hasF4WholeResearchTrimesh?
        PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters:tuning.wallProbeHeightOffsetMeters),
      bodyPosition.z + this.desired.z * tuning.wallProbeForwardMeters
    );

    const sample = this.gameplayInk.sampleWorld(
      this.wallProbePoint,
      tuning.wallProbePlaneDistanceMeters,
      SurfaceFlags.Swimmable | SurfaceFlags.Wall
    );
    if (!sample || sample.owner !== this.team) return null;

    const relX = bodyPosition.x - sample.surface.center.x;
    const relY = bodyPosition.y - sample.surface.center.y;
    const relZ = bodyPosition.z - sample.surface.center.z;
    const signedSide =
      relX * sample.surface.normal.x +
      relY * sample.surface.normal.y +
      relZ * sample.surface.normal.z;
    const side = signedSide >= 0 ? 1 : -1;
    this.wallOutward.set(
      sample.surface.normal.x * side,
      sample.surface.normal.y * side,
      sample.surface.normal.z * side
    );

    const towardAmount = -(
      this.desired.x * this.wallOutward.x +
      this.desired.z * this.wallOutward.z
    );
    if (towardAmount < tuning.wallAttachInputThreshold) return null;
    if(this.physics.hasF4WholeResearchTrimesh&&sample.surface.id.startsWith('F4ProvisionalWall:')){
      // A nearby painted projection is insufficient. The actual squid
      // center must see the same painted physical wall at capsule reach.
      const from=new Vec3(bodyPosition.x,bodyPosition.y+PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters,bodyPosition.z);
      const target=sample.surface.localToWorld(sample.u,sample.v);
      if(Math.abs(signedSide)>PlayerController.squidRadius+.20||from.distance(target)>.75)return null;
      const end=target.clone().sub(this.wallOutward.clone().mulScalar(.025));
      const physical=this.physics.castStageSegment(from,end,'ink-projectile');
      const wallHit=this.physics.f4PaintAtStageHit(physical,[sample.surface]);
      if(!wallHit||!physical?.normal||Math.abs(physical.normal.y)>.15)return null;
      const actual=this.gameplayInk.sampleWorld(wallHit.worldPoint,.01,
        SurfaceFlags.Swimmable|SurfaceFlags.Wall,0,s=>s===sample.surface);
      if(!actual||actual.owner!==this.team)return null;
    }

    return {
      sample,
      outward: this.wallOutward.clone(),
      towardAmount
    };
  }

  private setMode(nextMode: PlayerMode): void {
    if (nextMode === this.mode) return;
    this.mode = nextMode;

    if (nextMode === 'SQUID') {
      this.humanCollider.setEnabled(false);
      this.squidCollider.setEnabled(true);
      this.activeCollider = this.squidCollider;
      this.entity.setLocalScale(0.86, 0.48, 1.08);
    } else {
      this.squidCollider.setEnabled(false);
      this.humanCollider.setEnabled(true);
      this.activeCollider = this.humanCollider;
      this.entity.setLocalScale(0.72, 0.92, 0.72);
    }
    this.b248Visual?.setMode(nextMode);
  }

  private setSnapToGround(enabled: boolean): void {
    if (enabled === this.snapToGroundEnabled) return;
    this.snapToGroundEnabled = enabled;
    if (enabled) this.character.enableSnapToGround(0.24);
    else this.character.disableSnapToGround();
  }

  private applyVisualPosition(position: Vec3, animated = false): void {
    const time = performance.now() * 0.001;
    const speedRatio = clamp(
      this.stats.playerSpeedMetersPerSecond /
        Math.max(GAME_CONFIG.player.humanSpeedMetersPerSecond, 1e-6),
      0,
      1.4
    );
    const groundedBob = animated && this.grounded && this.mode === 'HUMAN'
      ? Math.sin(time * 13.5) * 0.035 * Math.min(speedRatio, 1)
      : 0;

    // B249: human visual faces camera forward; KCC and projectile ray unchanged.
    this.camera.getFlatForward(this.flatForward);
    this.b248Visual?.setPose(this.flatForward.x,this.flatForward.z,
      animated&&this.grounded&&this.mode==='HUMAN'?
       Math.min(1,speedRatio):0,time*12);
    // In genuine B248 SOURCE PLAYER, grounded squid visuals must meet the
    // actual Rapier foot, not hover above it. The project KCC, 25 source
    // solids and other modes (wall/air/roll/T20) remain unchanged.
    const sourceGroundedSquid=this.mode==='SQUID'&&!!this.b248Visual&&
      this.grounded&&(this.locomotionState==='SWIM_GROUND'||
      this.locomotionState==='SQUID_DRY');
    const visualY=this.mode!=='SQUID'?0:sourceGroundedSquid
      ? B248_SOURCE_GROUNDED_SQUID_VISUAL_Y_OFFSET_METERS
      : GAME_CONFIG.player.squidVisualOffsetYMeters;
    this.entity.setPosition(position.x,position.y+visualY+groundedBob,
      position.z);

    if (this.locomotionState === 'SQUID_ROLL') {
      const duration = Math.max(GAME_CONFIG.player.squidRollDurationSeconds, 1e-6);
      const progress = 1 - clamp(this.squidRollRemainingSeconds / duration, 0, 1);
      this.entity.setLocalScale(0.86, 0.48, 1.08);
      this.entity.setLocalEulerAngles(progress * 360, 0, 0);
      return;
    }

    if (this.mode === 'SQUID') {
      const pulse = animated ? Math.sin(time * 7.2) * 0.035 : 0;
      this.entity.setLocalScale(
        0.86 * (1 + pulse),
        0.48 * (1 - pulse * 0.55),
        1.08 * (1 + pulse * 0.35)
      );
      this.entity.setLocalEulerAngles(0, 0, 0);
      return;
    }

    const step = animated && this.grounded
      ? Math.abs(Math.sin(time * 13.5)) * Math.min(speedRatio, 1)
      : 0;
    const sway = animated && this.grounded
      ? Math.sin(time * 6.75) * Math.min(speedRatio, 1) * 2.8
      : 0;
    this.entity.setLocalScale(
      0.72 * (1 + step * 0.018),
      0.92 * (1 - step * 0.026),
      0.72 * (1 + step * 0.018)
    );
    this.entity.setLocalEulerAngles(0, 0, sway);
  }

  private relationFor(sample: GameplayInkSample | null): InkRelation {
    if (!sample || (sample.flags & SurfaceFlags.Swimmable) === 0) return 'NONE';
    if (sample.owner === this.team) return 'OWN';
    if (sample.owner === Team.Neutral) return 'NEUTRAL';
    return 'ENEMY';
  }

  private updateMaterial(): void {
    const rgb = this.team === Team.A ? GAME_CONFIG.visual.teamA : GAME_CONFIG.visual.teamB;
    this.material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
    this.material.emissive = new Color(rgb[0] * 0.08, rgb[1] * 0.08, rgb[2] * 0.08);
    this.material.update();
  }
}

function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
