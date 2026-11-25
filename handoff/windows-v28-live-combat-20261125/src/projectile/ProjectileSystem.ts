import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import { cpuWeaponRangeMeters, type CpuAgentSystem, type CpuFireRequest } from '../ai/CpuAgentSystem';
import { f4FlightArrivalTicks } from '../ai/F4FlightLead';
import type { CombatTargetSystem } from '../combat/CombatTargetSystem';
import type { PlayerResources } from '../combat/PlayerResources';
import { GAME_CONFIG } from '../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import type {PlayerMode} from '../player/PlayerController';
import {
  SLOSHER_DROPLETS, SLOSHER_LIFT_FRAMES, aimSlosherHead, slosherCollision, slosherDamage,
  slosherPaintBrush, slosherVelocity, stepSlosherFlight, type SlosherDroplet
} from './SlosherFlight';
import {
  CANOPY_HALF, CANOPY_HP, CANOPY_PELLETS, F4CanopySystem, canopySolid,
  canopyPelletDirection, canopyPelletDamage, cappedCanopyDamage,
  type CanopyHit, type CanopyState
} from './F4Canopy';
import {b343CanLaunchSourceVolley} from './B343OriginalSourceVolleyBudget';
import {sourceNativeMeleePaintFoot,sourceNativeMeleeStampAllowed} from './NativeSourceMeleePaintSupport';
import {b345BoundOpeningCooldown} from './B345SourceShooterOpeningCadence';
import {B346NativeShooterWitness, type B346ShooterExitKind} from './B346NativeShooterWitness';
import {b348CandidateShooterAngles} from './B348SourceShooterAccuracyCandidate';
import {b351RealCpuDamageCue} from './B351SourceHitFeedback';
import {
  brushSwingPhase, collectContactPaint, contactMotion, contactMoveMultiplier, contactPaintSettings,
  type ContactMotion, type GroundTravel
} from './F4ContactWeapon';
import {
  advanceShooterVelocity, aimShooter, SHOOTER_HZ, shooterDamageAtFrame, shooterImpactBrush,
  shooterPaintPattern, shooterSplashBrush, shooterYawDegrees, type ShooterFlight
} from './ShooterFlight';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameFeedback } from '../feedback/GameFeedback';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import type { PaintCoordinator, PaintRequest } from '../ink/PaintCoordinator';
import {sourceRegisteredPaintHitActive,
 sourceRegisteredPaintCellActive,sourceOriginalBlastPaintLineClear,
 type PaintSurface,type SurfaceRayHit} from '../ink/PaintSurface';
import type { RapierStagePhysics } from '../physics/RapierStagePhysics';
import type {StageDefinition} from '../stage/StageDefinition';
import { acceptSaberComponent, saberPlan, saberSweep } from './F4Saber';
import {isT21F4ResearchStage} from '../stage/undertow/UndertowT21F4PhotoRouteReconstruction';
import {
  DEFAULT_WEAPON_ID,
  type BlasterProfile,
  type WeaponId,
  type WeaponProfile,
  type ShooterProfile,
  railCharge,
  weaponProfile,
  F4_SABER_TIMING,
} from '../weapons/WeaponCatalog';

/**
 * Real SOURCE MAIN/CHARGER projectile hit order: physical original Rapier
 * cover wins when nearer. Human/CPU thrown SUBs intentionally keep their
 * tested 6cm near-coplanar paint-plane tolerance while actor/HP contact
 * separately respects strict original cover. Frozen T20 stays unchanged.
 * This reads existing hits only; no stage, actor, ink or score authority.
 */
function originalSourcePaintBeforeRapier(
  paintHit:{readonly distance:number}|null,
  blockerHit:{readonly distance:number}|null,
  nativeSourcePhysical:boolean
):boolean{
  return !!paintHit&&(!blockerHit||
    paintHit.distance<=blockerHit.distance+
      (nativeSourcePhysical?0:
        GAME_CONFIG.worldInteraction.paintSurfacePriorityEpsilonMeters));
}

const F4_CANOPY_PELLET_FLIGHT = { straightFrames: 3, brakeSpeedMetersPerSecond: 64 };

export interface F4SpecialFlight {
  speed: number;
  gravity: number;
  lifeSeconds: number;
  diameter: number;
  directDamage: number;
  blast?: {radius: number; damage: number; paint: number; near?: {radius: number; damage: number}};
  armingFrames?: number;
  damageAtAge?(frame: number): number;
  offset?(frame: number, index: number): readonly [number,number];
  onTerrain?(hit: import('../physics/RapierStagePhysics').StageRayHit): void;
  collisions?: 'stage' | 'all';
}

interface ProjectileSlot {
  f4Special?: {flight: F4SpecialFlight; age: number; index: number; right: Vec3; up: Vec3};
  arrowFlight?: ShooterFlight & { profile: NonNullable<WeaponProfile['arrowFlight']> };
  saber?: {
    component: 'SLASH' | 'WAVE';
    sweeps: { offset: Vec3; radius: number }[];
    ledger: Set<string>;
    resolvedTargets: Set<string>;
    distance: number;
    splashSpacing: number;
    nextSplashDistance: number;
    splashesLeft: number;
    paintWidth: number;
  };
  active: boolean;
  position: Vec3;
  previousPosition: Vec3;
  velocity: Vec3;
  gravity: number;
  ttl: number;
  team: Team.A | Team.B;
  entity: Entity;
  sourceKind: 'HUMAN' | 'CPU';
  sourceId: string;
  /** B152 read-only QA provenance, not a collision/rasterization rule. */
  qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK';
  weaponId: WeaponId;
  damage: number;
  paintRadius: number;
  blastRadius: number;
  blastDamage: number;
  delayedBurstSeconds: number;
  delayedBurstRadius: number;
  delayedBurstDamage: number;
  delayedBurstPaintRadius: number;
  trailPaintRadius: number;
  trailPaintCooldown: number;
  shooterFlight?: ShooterFlight & {
    profile: ShooterProfile;
    distance: number;
    nextSplash: number;
    splashesRemaining: number;
  };
  reservedForVolley?: boolean;
  slosherFlight?: {
    droplet: SlosherDroplet;
    resolvedTargets: Set<string>;
    launchY: number;
    age: number;
    distance: number;
  };
  canopyPellet?: ShooterFlight & {
    index: number;
    distance: number;
    acceptedDamage: Map<string, number>;
  };
  blasterFlight?: ShooterFlight & {
    profile: BlasterProfile;
    distance: number;
    nextSplash: number;
    splashesRemaining: number;
  };
  terrainContactNormal?: Vec3;
  /** B346 local source-only evidence ID; never affects collision or physics. */
  b346LaunchId?:number;
}

interface DelayedBurst {
  source: PaintSource;
  actorId?: string;
  team: Team.A | Team.B;
  point: Vec3;
  seconds: number;
  radius: number;
  damage: number;
  paintRadius: number;
  weaponId: WeaponId;
  contactNormal?: Vec3;
}

interface DirectRayResult {
  point: Vec3;
  paintHit: SurfaceRayHit | null;
  hitCombat: boolean;
}

interface TwinCometsAim {
  muzzle: Vec3;
  forward: Vec3;
  target: Vec3;
  body: Vec3;
  grounded: boolean;
  focused: boolean;
}

interface TwinCometsTick {
  aimTarget: Vec3;
  phase: 'NORMAL' | 'ROLL_LOCK' | 'FOCUSED';
  rollTravel?: GroundTravel;
}

interface SlosherSwing {
  profile: WeaponProfile;
  actor: string;
  team: Team.A | Team.B;
  firstFrame: number;
  next: number;
  reserved: ProjectileSlot[];
  resolvedTargets: Set<string>;
  request?: CpuFireRequest;
}

interface CanopyVolley {
  profile: WeaponProfile;
  team: Team.A | Team.B;
  fireAt: number;
  slots: ProjectileSlot[];
  request?: CpuFireRequest;
}

export class ProjectileSystem {
  private shooterCadence?: Map<string, {
    weaponId: WeaponId;
    shots: number;
    lastFrame: number;
    groundBias: number;
  }>;
  private readonly slots: ProjectileSlot[] = [];
  private pendingSloshes?: Map<string, SlosherSwing>;
  private pendingCanopyVolleys?: Map<string, CanopyVolley>;
  private saberForwardHeld = false;
  private pendingSaberSwings?: Map<string, {
    frame: number;
    charged: boolean;
    lunge: boolean;
    team: Team.A | Team.B;
    profile: WeaponProfile;
    aim: Vec3;
    slashEmitted: boolean;
    slots: [ProjectileSlot, ProjectileSlot];
    request?: CpuFireRequest;
  }>;
  private canopies?: F4CanopySystem;
  private readonly delayedBursts: DelayedBurst[] = [];
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private readonly guardEntity: Entity;
  private readonly delta = new Vec3();
  private readonly queuedCpuShots: CpuFireRequest[] = [];
  private b343SourceVolleyAtomic=false;
  private b343RejectedVolleys=0;
  // Strictly human-selected ORIGINAL SOURCE rounds only. Rank competing
  // paid CPU shots by their LAST ACTUALLY ALLOCATED physical volley.
  // Rotating a request-array offset used to starve an actor when the
  // competing pair changed between native ticks (A/B, then B/C).
  private sourceCpuFairVolleyDispatch=false;
  private sourceCpuPhysicalGrantSerial=0;
  private readonly sourceCpuLastPhysicalGrant=new Map<string,number>();
  private b345SourceShooterOpeningEnabled=false;
  private b345RealOpeningClamps=0;
  private readonly b346ShooterWitness=new B346NativeShooterWitness();
  private b348ShooterCandidateEnabled=false;
  private b348AcceptedHumanShots=0;
  private b348GroundShots=0;
  private b348AirShots=0;
  private b348LastYaw=0;
  private b348LastPitch=0;
  private b351CueOn=false;
  private b351TrueDamageCues=0;
  // F4 nonproduction: real-source physical HUMAN capsule and hit FX
  // remain separate from the strict frozen 25-solid B351 authority.
  private f4PhysicalHitCueOn=false;
  private f4ConfirmedDamageCues=0;
  private f4SpecialSplashHits=0;
  private f4SpecialCueFrame=-1;
  public f4SpecialSplashHitCount():number{return this.f4SpecialSplashHits;}
  private noteF4SpecialDamageCue(point:Vec3,team:Team.A|Team.B):void {
    if(!this.f4PhysicalHitCueOn||team!==this.currentHumanTeam||
       this.f4SpecialCueFrame===this.b367NativeFrame)return;
    this.f4SpecialCueFrame=this.b367NativeFrame;
    this.f4ConfirmedDamageCues++;
    this.feedback.confirmedHumanCpuDamage(team,point,this.currentPlayerWeapon);
  }
  private b367Enabled=false;
  private b367SelectedRealLoadout=false;
  private b367NativeFrame=0;
  private b367RealHumanCpuHits=0;
  private readonly b367PhysicalEvents:Array<{
   sequence:number;nativeFrame:number;botId:string;weaponId:string;
   hpBefore:number;hpAfter:number;actualHpLoss:number;lethalHpZero:boolean
  }>=[];

  private b152OriginalAllyAimProjectilesSpawned=0;
  private b152OriginalAllyAimSurfaceCollisions=0;
  private readonly cpuAimDirection = new Vec3();
  private readonly tempForward = new Vec3();
  private fireCooldown = 0;
  private burstCooldown = 0;
  private burstShotsRemaining = 0;
  private splatlingStoredChargeSeconds = 0;
  private rollPaintCooldown = 0;
  private meleeCooldown = 0;
  private contactHeldFrames = 0;
  private contactMovingFrames = 0;
  private brushSwings?: Map<string, number>;
  private contactHitFrames?: Map<string, number>;
  private chargeSeconds = 0;
  private f4StringerTapPending = false;
  private wasFireHeld = false;
  private dualiesFocusSeconds = 0;
  private guardHp = 100;
  private guardBreakSeconds = 0;
  private readonly currentHumanPosition = new Vec3();
  private readonly currentHumanAimDirection = new Vec3(0, 0, -1);
  private f4DeviceContact?: (from: Vec3,to: Vec3,team: Team.A|Team.B) =>
    {distance:number; damage:(hp:number)=>void} | null;

  private f4Absorption?: (from:Vec3,to:Vec3,shot:{
    id:string;team:Team.A|Team.B;damage:number;consume():boolean;
  })=>{distance:number;accept():boolean}|null;

  public useF4Absorption(query?: ProjectileSystem['f4Absorption']):void {
    this.f4Absorption=query;
  }

  private f4SpecialContact?: NonNullable<ProjectileSystem['f4DeviceContact']>;

  public useF4SpecialContact(query: NonNullable<ProjectileSystem['f4DeviceContact']>): void {
    this.f4SpecialContact = query;
  }

  private findF4ProjectileObjectContact(from:Vec3,to:Vec3,team:Team.A|Team.B) {
    const sub=this.f4DeviceContact?.(from,to,team);
    const special=this.f4SpecialContact?.(from,to,team);
    return special && special.distance < (sub?.distance ?? Infinity) ? special : sub;
  }

  public applyF4GroundWave(center: Vec3, oldRadius: number, radius: number,
    team: Team.A|Team.B, actor: string, accept: (id:string) => number): number {
    if (!this.physics.hasF4WholeResearchTrimesh) return 0;
    let hpLoss = 0;
    const supports=(foot:Vec3)=>{
      const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
      const support=this.physics.castCharacterFootSupport(foot.clone().add(new Vec3(0,offset,0)),offset,'HUMAN');
      return support && (support.normal?.y??0)>=.96 && Math.abs(support.point.y-foot.y)<.12;
    };
    const contact=(foot:Vec3)=>{
      const distance=Math.hypot(foot.x-center.x,foot.z-center.z);
      if(distance+.24<oldRadius||distance-.24>radius||Math.abs(center.y-foot.y)>.16||!supports(foot))return false;
      const start=center.clone().add(new Vec3(0,.18,0));
      const end=foot.clone().add(new Vec3(0,.18,0));
      if(this.physics.castStageSegment(start,end,'ink-projectile'))return false;
      const samples=Math.ceil(distance/.5);
      for(let i=1;i<samples;i++){
        if(!supports(new Vec3().lerp(center,foot,i/samples)))return false;
      }
      return true;
    };
    this.cpuAgents.forEachMapAgent((id,targetTeam,foot,active)=>{
      if(active && team!==targetTeam && this.cpuAgents.f4IsGroundedLife(id) && contact(foot)){
        const damage=accept(id);
        if(damage<=0)return;
        const result=this.cpuAgents.applyProjectileHit({botId:id,guarded:false,point:foot,distance:0},
          damage,actor==='human'?'HUMAN':'CPU',actor);
        hpLoss+=result?.realHpLoss??0;
        if(actor==='human'&&(result?.realHpLoss??0)>0)this.noteF4SpecialDamageCue(foot,team);
      }
    });
    if(this.currentHumanDamageable && this.f4HumanGrounded && team!==this.currentHumanTeam && this.resources.currentHp>0){
      const foot=this.currentHumanPosition.clone().sub(new Vec3(0,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,0));
      if(contact(foot)){
        const damage=accept('human');
        if(damage>0){
          const previous=this.resources.currentHp;
          this.applyF4SubDirectToHuman(foot,team,damage);
          hpLoss+=previous-this.resources.currentHp;
        }
      }
    }
    return hpLoss;
  }

  public useF4DeviceContact(query: NonNullable<ProjectileSystem['f4DeviceContact']>): void {
    this.f4DeviceContact = query;
  }

  public launchF4Special(
    origin: Vec3, direction: Vec3, team: Team.A|Team.B, actor: string,
    weapon: WeaponId, flight: F4SpecialFlight, count = 1
  ): boolean {
    if (!this.physics.hasF4WholeResearchTrimesh || !Number.isInteger(count) || count < 1 || count > 3 ||
        ![origin.x,origin.y,origin.z,direction.x,direction.y,direction.z].every(Number.isFinite) ||
        direction.lengthSq() < 1e-8) return false;
    const slots = this.slots.filter(isFreeProjectileSlot).slice(0,count);
    if (slots.length !== count) return false;
    const forward = direction.clone().normalize();
    const right = new Vec3().cross(Math.abs(forward.y) > .98 ? Vec3.RIGHT : Vec3.UP,forward).normalize();
    const up = new Vec3().cross(forward,right);
    const profile = {...weaponProfile(weapon),shooter:undefined,blaster:undefined,arrowFlight:undefined};
    slots.forEach((slot,index)=>{
      this.spawnProjectile(slot,profile,origin,forward,team,flight.speed,flight.gravity,
        flight.lifeSeconds,flight.diameter,flight.directDamage,0,0,0,0,0,0,0,0,
        actor==='human'?'HUMAN':'CPU',actor,undefined,false,true);
      slot.f4Special={flight,age:0,index,right,up};
    });
    return true;
  }

  public applyF4SpecialSweep(
    start: Vec3, end: Vec3, radius: number, team: Team.A|Team.B, actor: string,
    resolveDamage: (id: string, team: Team.A|Team.B) => number, terrainCover: boolean
  ): number {
    if (!this.physics.hasF4WholeResearchTrimesh) return 0;
    const stage = terrainCover ? this.physics.castStageInkSphere(start,end,radius) : null;
    const limit = stage?.distance ?? start.distance(end);
    const excluded = new Set<string>();
    let hpLoss = 0;
    for (;;) {
      const hit = this.cpuAgents.findNearestCombatHit(start,end,team,{radius,resolvedTargets:excluded});
      if (!hit || hit.distance > limit) break;
      excluded.add(hit.botId);
      if (terrainCover && hit.targetPoint &&
          this.physics.castStageSegment(hit.point,hit.targetPoint,'ink-projectile')) continue;
      const damage = resolveDamage(hit.botId,team===Team.A?Team.B:Team.A);
      if (damage <= 0) continue;
      const result = this.cpuAgents.applyProjectileHit(hit,damage,actor==='human'?'HUMAN':'CPU',actor);
      hpLoss += result?.realHpLoss ?? 0;
      // applyProjectileHit already increments humanCpuDirectHits for this sweep.
      if(actor==='human'&&(result?.realHpLoss??0)>0)this.noteF4SpecialDamageCue(hit.point,team);
    }
    const human = this.findNativeSourceHumanPhysicalHit(start,end,team,radius,terrainCover);
    if (human && human.distance <= limit &&
        (!terrainCover || this.sourceMeleeLineClear(human.point,this.currentHumanPosition))) {
      const damage = resolveDamage('human',this.currentHumanTeam);
      if (damage > 0) {
        const previous = this.resources.currentHp;
        this.applyF4SubDirectToHuman(human.point,team,damage);
        hpLoss += previous-this.resources.currentHp;
      }
    }
    return hpLoss;
  }

  public applyF4SpecialPulse(point: Vec3, team: Team.A|Team.B, actor: string, radius: number,
    damage: number, paint: number, near?: {radius: number; damage: number}): void {
    if (!this.physics.hasF4WholeResearchTrimesh) return;
    if (damage > 0) {
      const before=this.stats.cpuCombatHits;
      this.applyAreaDamage(point,radius,damage,team,undefined,false,undefined,near);
      if(actor==='human'&&team===this.currentHumanTeam&&this.stats.cpuCombatHits>before){
        this.f4SpecialSplashHits+=this.stats.cpuCombatHits-before;
        this.noteF4SpecialDamageCue(point,team);
      }
    }
    if (paint > 0 && radius > 0) this.enqueueF4BurstPaint(point,team,actor,radius,paint,true,PaintEventType.Special);
  }

  public launchF4SprinklerDrop(origin: Vec3,velocity: Vec3,team: Team.A|Team.B,actor?: string, damage=20,paintRadius=.24): boolean {
    const slot = this.slots.find(isFreeProjectileSlot);
    if (!slot || !this.physics.hasF4WholeResearchTrimesh) return false;
    this.spawnProjectile(slot,weaponProfile('rotor-splatling'),origin,velocity,team,
      velocity.length(),20,.75,.075,damage,paintRadius,0,0,0,0,0,0,0,actor?'CPU':'HUMAN',actor??'human');
    return true;
  }

  private currentHumanTeam: Team.A | Team.B = Team.A;
  private currentHumanDamageable = false;
  private f4HumanLifeId:string|null=null;
  private f4HumanGrounded=false;
  /** Fresh real KCC pose before CPU/special callbacks; does not grant hit authority. */
  public syncF4HumanTarget(body:Vec3,team:Team.A|Team.B,alive:boolean,grounded:boolean,lifeId:string):void {
    if(!this.physics.hasF4WholeResearchTrimesh)return;
    this.currentHumanPosition.copy(body);
    this.currentHumanTeam=team;
    this.currentHumanDamageable=alive&&this.resources.currentHp>0;
    this.f4HumanGrounded=grounded&&this.currentHumanDamageable;
    this.f4HumanLifeId=this.currentHumanDamageable?lifeId:null;
  }

  public f4TargetLifeKey(actor:string):string|null {
    if(actor!=='human')return this.cpuAgents.f4ActiveLifeKey(actor);
    return this.currentHumanDamageable&&this.resources.currentHp>0&&this.f4HumanLifeId!==null?
      JSON.stringify(['human',this.f4HumanLifeId]):null;
  }
  private currentHumanGuarding = false;
  // Exact real PlayerController mode; immutable SOURCE 180s only.
  // Default null preserves every T20 and historical opt-in QA hit rule.
  private nativeSourceHumanPhysicalMode:(()=>PlayerMode)|null=null;
  private nativeHumanDamageCueFrame=-1;
  /** Actual SOURCE HUMAN splash HP feedback, at most once per native tick. */
  private nativeSourceHumanSplashCueFrame=-1;
  private playerWeaponId: WeaponId = DEFAULT_WEAPON_ID;

  public constructor(
    private readonly app: AppBase,
    private readonly surfaces: readonly PaintSurface[],
    private readonly physics: RapierStagePhysics,
    private readonly coordinator: PaintCoordinator,
    private readonly resources: PlayerResources,
    private readonly combatTargets: CombatTargetSystem,
    private readonly cpuAgents: CpuAgentSystem,
    private readonly feedback: GameFeedback,
    private readonly stats: PerformanceStats
  ) {
    this.materialA = makeProjectileMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeProjectileMaterial(GAME_CONFIG.visual.teamB);

    for (let i = 0; i < GAME_CONFIG.projectile.poolSize; i += 1) {
      const entity = new Entity('Projectile:' + i);
      entity.addComponent('render', {
        type: 'sphere',
        material: this.materialA,
        castShadows: false,
        receiveShadows: false
      });
      entity.enabled = false;
      this.app.root.addChild(entity);
      this.slots.push({
        active: false,
        position: new Vec3(),
        previousPosition: new Vec3(),
        velocity: new Vec3(),
        gravity: GAME_CONFIG.projectile.gravityMetersPerSecond2,
        ttl: 0,
        team: Team.A,
        entity,
        sourceKind: 'HUMAN',
        sourceId: 'human',
        weaponId: DEFAULT_WEAPON_ID,
        damage: GAME_CONFIG.combat.projectileDamage,
        paintRadius: GAME_CONFIG.projectile.paintRadiusMeters,
        blastRadius: 0,
        blastDamage: 0,
        delayedBurstSeconds: 0,
        delayedBurstRadius: 0,
        delayedBurstDamage: 0,
        delayedBurstPaintRadius: 0,
        trailPaintRadius: 0,
        trailPaintCooldown: 0
      });
    }

    this.guardEntity = new Entity('BrellaGuard');
    this.guardEntity.addComponent('render', {
      type: 'box',
      material: this.materialA,
      castShadows: false,
      receiveShadows: false
    });
    this.guardEntity.setLocalScale(1.65, 1.15, 0.08);
    this.guardEntity.enabled = false;
    this.app.root.addChild(this.guardEntity);

    this.syncWeaponStats();
  }

  /** A true CPU-to-human HP reduction is the only authority for SOURCE
   * damage feedback. Rate-limit only pooled FX/audio, never damage. */
  private confirmNativeHumanDamage(applied:number,contact:Vec3,attacker:Team.A|Team.B):void{
    if(this.nativeSourceHumanPhysicalMode===null||
       !Number.isFinite(applied)||applied<=0||
       this.b367NativeFrame===this.nativeHumanDamageCueFrame)return;
    this.nativeHumanDamageCueFrame=this.b367NativeFrame;
    this.feedback.confirmedNativeHumanDamage(attacker,contact,applied);
  }

  /** A physical contact is not a successful SOURCE player hit unless
   * actual HP was removed (the target may already be splatted). Keep
   * frozen T20 contact-counter semantics unchanged. */
  private recordCpuPlayerDamageHit(hpLoss:number):void{
    if(this.nativeSourceHumanPhysicalMode!==null&&
       (!Number.isFinite(hpLoss)||hpLoss<=0))return;
    this.stats.cpuPlayerHits+=1;
  }

  public get currentPlayerWeapon(): WeaponProfile {
    return weaponProfile(this.playerWeaponId, this.physics?.hasF4WholeResearchTrimesh);
  }
  /** Opt-in genuine SOURCE ONLY. Preserve T20 and normal preview behavior. */
  public enableB343OriginalSourceVolleyBudget(stage:{
    id:string;solids:number;paint:number;nav:number;scoreable:number
  }):void{
    if(stage.id!=='undertow-t21d-partial-connectivity-qa'||
       stage.solids!==25||stage.paint!==17||stage.nav!==26||
       stage.scoreable!==0||this.surfaces.length!==17)
      throw Error('B343_NONORIGINAL_SOURCE_FORBIDDEN');
    this.b343SourceVolleyAtomic=true;
  }
  /** Real canonical 25/17/26/0 SOURCE game only, after the full B343
   * physical-world gate. T20, standalone QA and projectile physics stay
   * unchanged; this only selects which paid real CPU fires first. */
  public enableSourceCpuFairVolleyDispatch():void{
    if(!this.b343SourceVolleyAtomic||this.surfaces.length!==17)
      throw Error('T21_SOURCE_CPU_FAIR_VOLLEY_REQUIRES_ORIGINAL_WORLD');
    this.sourceCpuFairVolleyDispatch=true;
  }
  public b343OriginalSourceVolleyBudgetSnapshot(){
    return {enabled:this.b343SourceVolleyAtomic,
      rejectedVolleys:this.b343RejectedVolleys,
      physicalPoolSize:this.slots.length,
      actualFreeSlots:this.slots.filter(isFreeProjectileSlot).length,
      syntheticShots:0 as const,syntheticInk:0 as const,
      scoreable:0 as const,productionAuthorized:false as const};
  }

  public enableB345SourceShooterOpening():void{
    if(!this.b343SourceVolleyAtomic||this.surfaces.length!==17)
      throw Error('B345_NONORIGINAL_SOURCE_FORBIDDEN');
    this.b345SourceShooterOpeningEnabled=true;
  }
  public b345SourceShooterOpeningSnapshot(){
    return {enabled:this.b345SourceShooterOpeningEnabled,
      realOpeningClamps:this.b345RealOpeningClamps,
      fabricatedProjectiles:0 as const,
      sourceScoreable:0 as const,
      productionAuthorized:false as const};
  }

  /** B346 source-only read-only trace requires both validated B343/B345. */
  public enableB346NativeShooterWitness():void{
    if(!this.b343SourceVolleyAtomic||
       !this.b345SourceShooterOpeningEnabled||this.surfaces.length!==17)
      throw Error('B346_EXPLICIT_FROZEN_SOURCE_ONLY');
    this.b346ShooterWitness.enable();
  }
  public b346SetRealSourceNativeTick(tick:number):void{
    this.b346ShooterWitness.setNativeTick(tick);
  }
  public b346NativeShooterWitnessSnapshot(){
    return this.b346ShooterWitness.snapshot();
  }

  /** Nonproduction only: requires B343, B345 and real physics B346. */
  public enableB348SourceShooterAccuracyCandidate():void{
   if(!this.b343SourceVolleyAtomic||
      !this.b345SourceShooterOpeningEnabled||
      !this.b346ShooterWitness.snapshot().enabled||
      this.surfaces.length!==17)
    throw Error('B348_NONORIGINAL_SOURCE_ACCURACY_FORBIDDEN');
   this.b348ShooterCandidateEnabled=true;
  }
  public b348SourceShooterAccuracySnapshot(){
   return {enabled:this.b348ShooterCandidateEnabled,
    actualAcceptedCandidateShots:this.b348AcceptedHumanShots,
    actualGroundedCandidateShots:this.b348GroundShots,
    actualAirborneCandidateShots:this.b348AirShots,
    latestActualCandidateYawDegrees:this.b348LastYaw,
    latestActualCandidatePitchDegrees:this.b348LastPitch,
    originalReferenceModelCertified:false as const,
    candidateResearchOnly:true as const,
    syntheticShots:0 as const,syntheticInk:0 as const,
    originalSource:'25/17/26/0' as const,
    productionAuthorized:false as const};
  }

  /** Explicit opt-in B351 source-only, no source geometry change. */
  public enableB351ActualHitCue():void {
    if(!this.b343SourceVolleyAtomic||
      !this.b345SourceShooterOpeningEnabled||
      !this.b346ShooterWitness.snapshot().enabled||
      !this.b348ShooterCandidateEnabled||this.surfaces.length!==17)
      throw Error('B351_SOURCE_ONLY_PRECONDITION');
    this.b351CueOn=true;
  }
  public b351ActualHitCueSnapshot(){
    return {enabled:this.b351CueOn,realDamageCues:this.b351TrueDamageCues,
      source:'25/17/26/0' as const,syntheticHits:0 as const,
      scoreable:0 as const,NintendoVisualCertified:false as const,
      productionAuthorized:false as const};
  }

  /** Nonproduction F4 only. The isolated physical stage is
   * distinct from, and is NOT admitted by, B351's frozen-source gate.
   * Reuse existing physical HP-hit FX after actual human projectile
   * damage; never select a target, write HP, award turf or alter contact.
   */
  public enableF4RealPhysicalHitFeedback(stage:StageDefinition):void{
    if(!isT21F4ResearchStage(stage)||
       stage.paintSurfaces.some(s=>(s.flags&SurfaceFlags.Scoreable)!==0)||
       this.surfaces.length!==17||
       this.nativeSourceHumanPhysicalMode===null||
       this.b351CueOn)
      throw Error('F4_HIT_FEEDBACK_REQUIRES_GENUINE_PHYSICAL_LAB');
    this.f4PhysicalHitCueOn=true;
  }
  public f4RealPhysicalHitFeedbackSnapshot(){
    return {enabled:this.f4PhysicalHitCueOn,
      confirmedPhysicalHumanHitCues:this.f4ConfirmedDamageCues,
      actualHpReductionOnly:true as const,
      syntheticDamage:0 as const,scoreablePromotions:0 as const,
      stage:'UNOFFICIAL_F4_RESEARCH' as const,
      productionAuthorized:false as const};
  }

  /** B367 opt-in only after the genuine B351 physical projectile pipeline.
   * Does not create an encounter, damage, impact, enemy, source floor or score. */
  public enableB367RealCpuLifecycleEvidence():void {
    if(!this.b351CueOn||!this.b343SourceVolleyAtomic||
       this.surfaces.length!==17)
     throw Error('B367_REQUIRES_GENUINE_SOURCE_SHOOTER');
    this.b367Enabled=true;
  }
  public b367RealCpuLifecycleEvidenceSnapshot(){
    return {enabled:this.b367Enabled,
     physicalHumanCpuHpHits:this.b367RealHumanCpuHits,
     events:this.b367PhysicalEvents.map(e=>({...e})),
     source:'25/17/26/0' as const,
     syntheticHits:0 as const,
     actorRelocations:0 as const,
     scoreable:0 as const,
     opponentRoutesCertified:false as const,
     productionAuthorized:false as const};
  }

  /** B384 native 12-weapon SOURCE session: evidence only, never damage.
   * Canonical SOURCE now enables B343 real physical-slot budget FIRST.
   * Accept both only after its separate, canonical-only fair dispatch gate.
   * An isolated B343 shooter QA never gains B384 life authority. */
  public enableB384SelectedSourceCpuLifeWitness(stage:{
    id:string;solids:number;paint:number;nav:number;scoreable:number
  }):void{
    if((this.b343SourceVolleyAtomic&&!this.sourceCpuFairVolleyDispatch)||
       this.surfaces.length!==17||
       stage.id!=='undertow-t21d-partial-connectivity-qa'||
       stage.solids!==25||stage.paint!==17||stage.nav!==26||
       stage.scoreable!==0)
      throw Error('B384_NATIVE_SOURCE_LIFECYCLE_AUTHORITY_HOLD');
    this.b367Enabled=true;
    this.b367SelectedRealLoadout=true;
  }

  /** A genuine resolved HP reduction is the ONLY event author.
   * Shield-only or missed attacks never enter the read-only life ledger.
   * The selected 12-weapon B384 mode also covers native charger rays. */
  private recordB367RealCpuDamage(
    resolved:ReturnType<CpuAgentSystem['applyProjectileHit']>,
    weaponId:WeaponId,expectedBotId:string,sourceKind:'HUMAN'|'CPU'
  ):void{
    if(!this.b367Enabled||sourceKind!=='HUMAN'||
       (!this.b367SelectedRealLoadout&&weaponId!=='pulse-sprayer')||
       !resolved||resolved.realHpLoss<=0||
       resolved.shieldAbsorbed||resolved.botId!==expectedBotId||
       resolved.sourceKind!=='HUMAN')return;
    this.b367RealHumanCpuHits++;
    this.b367PhysicalEvents.push({
      sequence:this.b367RealHumanCpuHits,
      nativeFrame:this.b367NativeFrame,
      botId:resolved.botId,weaponId,
      hpBefore:resolved.hpBefore,hpAfter:resolved.hpAfter,
      actualHpLoss:resolved.realHpLoss,
      lethalHpZero:resolved.lethalHpZero
    });
    if(this.b367PhysicalEvents.length>32)this.b367PhysicalEvents.shift();
  }

  public setPlayerWeapon(id: WeaponId): void {
    if (id === this.playerWeaponId) return;
    this.cancelHumanSlosh();
    this.cancelSaberSwing('human');
    this.discardF4Canopy('human');
    this.playerWeaponId = id;
    this.fireCooldown = Math.max(this.fireCooldown, 0.08);
    this.burstCooldown = 0;
    this.burstShotsRemaining = 0;
    this.splatlingStoredChargeSeconds = 0;
    this.rollPaintCooldown = 0;
    this.meleeCooldown = 0;
    this.clearHumanContactInput();
    this.brushSwings?.delete('human');
    this.contactHitFrames?.delete('human');
    this.chargeSeconds = 0;
    this.f4StringerTapPending = false;
    this.wasFireHeld = false;
    this.dualiesFocusSeconds = 0;
    this.guardEntity.enabled = false;
    this.stats.playerWeaponSwitches += 1;
    this.syncWeaponStats();
    this.feedback.weaponSwitch();
  }

  public notifyDualieDodge(): void {
    const profile = this.currentPlayerWeapon;
    if (profile.weaponClass !== 'DUALIES' || profile.twinComets) return;
    this.dualiesFocusSeconds = 0.62;
  }

  public resetTwinCometsLife(): void {
    if (this.currentPlayerWeapon.twinComets) {
      this.shooterCadence?.delete('human');
      this.fireCooldown = 0;
    }
  }

  /** Real SOURCE pause is not an actual trigger release. Clear an
   * unreleased HUMAN charge before the next native 60Hz step, preventing
   * ghost CHARGER/STRINGER/SPLATANA discharge or SPLATLING burst.
   * Preserve committed bursts, physical projectiles, cooldowns, all
   * original CPU actions and the real round clock. T20 never calls this. */
  public cancelUnreleasedNativeSourceHumanFire(): void {
    if (!this.nativeSourceHumanPhysicalMode) return;
    this.wasFireHeld = false;
    this.cancelHumanSlosh();
    this.cancelSaberSwing('human');
    this.cancelCanopyVolley('human');
    this.canopies?.releaseAttached('human');
    this.clearHumanContactInput();
    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
    if (this.burstShotsRemaining <= 0) {
      this.splatlingStoredChargeSeconds = 0;
      this.stats.playerWeaponChargeRing = 0;
      this.stats.playerWeaponFirstRingPercent = 0;
    }
  }

  public getMovementMultiplier(fireHeld: boolean, secondaryHeld: boolean): number {
    if (this.currentPlayerWeapon.canopy) return this.canopies?.lookup('human')?.phase === 'OPEN' ? 0.74 : 1;
    const { weaponClass, contactWeapon } = this.currentPlayerWeapon;
    if (contactWeapon && fireHeld) {
      if (this.contactHeldFrames < contactWeapon.rollAfterFrames) return 0.84;
      const cost = contactPaintSettings(contactWeapon, this.stats.playerSpeedMetersPerSecond).ink;
      return this.stats.playerInkPercent + 1e-6 >= cost
        ? contactMoveMultiplier(contactWeapon, this.contactMovingFrames) : 0.80;
    }
    if (weaponClass === 'BRUSH' && fireHeld) return 1.15;
    if (weaponClass === 'ROLLER' && fireHeld) return 0.92;
    if (weaponClass === 'CHARGER' && fireHeld) return 0.66;
    if (weaponClass === 'SPLATLING' && fireHeld) return 0.72;
    if (weaponClass === 'SPLATANA' && fireHeld) return 0.82;
    // SOURCE: a physically broken brella is not guarding; holding the
    // shield button must not continue the movement penalty after HP-zero
    // guard break. The frozen T20 movement contract stays unchanged.
    if (weaponClass === 'BRELLA' && secondaryHeld &&
        (this.nativeSourceHumanPhysicalMode===null ||
         (this.guardBreakSeconds<=0&&this.guardHp>0))) return 0.74;
    return 1;
  }

  public clipF4PlayerShooterMuzzle(body:Vec3,muzzle:Vec3):void {
    if(this.physics.hasF4WholeResearchTrimesh && this.currentPlayerWeapon.weaponClass==='SHOOTER')
      muzzle.copy(this.clipF4Muzzle(new Vec3(body.x,muzzle.y,body.z),muzzle));
  }

  /** Clips an experimental special throw to the same physical muzzle path as live shots. */
  public clipF4SpecialMuzzle(body:Vec3,muzzle:Vec3):Vec3 {
    return this.physics.hasF4WholeResearchTrimesh
      ?this.clipF4Muzzle(new Vec3(body.x,muzzle.y,body.z),muzzle).clone()
      :muzzle.clone();
  }

  public solvePlayerLaunchDirection(origin: Vec3, target: Vec3, out = new Vec3()): Vec3 {
    const profile = this.currentPlayerWeapon;
    if (profile.contactWeapon && origin.distance(target) > 1e-4)
      return out.sub2(target, origin).normalize();
    // F4 Rail Charger resolves a straight Rapier-ordered ray. Ballistic
    // elevation here sent that ray above the real crosshair near cover.
    if (this.physics.hasF4WholeResearchTrimesh && profile.weaponClass === 'CHARGER' &&
        origin.distance(target) > 1e-4) return out.sub2(target, origin).normalize();
    if (profile.weaponClass === 'SPLATLING' && profile.shooter?.coast) {
      const stage = chargeStageProgress(profile, this.splatlingStoredChargeSeconds || this.chargeSeconds);
      return this.solveLaunchDirection(origin, target, out, rotorLaunchProfile(profile, stage.first));
    }
    if (profile.arrowFlight) {
      const shot = stringerVolley(profile, this.chargeSeconds, true);
      return this.solveLaunchDirection(origin, target, out, {
        ...profile, speedMetersPerSecond: profile.speedMetersPerSecond * shot.speedMultiplier
      });
    }
    return this.solveLaunchDirection(origin, target, out, profile);
  }

  /** Actual spawned projectiles and original-surface collisions, not paint. */
  public qaOriginalAllyInkProjectilesSnapshot(){
    return {
      spawned:this.b152OriginalAllyAimProjectilesSpawned,
      originalSourceSurfaceCollisions:this.b152OriginalAllyAimSurfaceCollisions
    };
  }

  public reset(): void {
    this.shooterCadence?.clear();
    this.clearHumanContactInput();
    this.brushSwings?.clear();
    this.contactHitFrames?.clear();
    this.f4StringerTapPending = false;
    this.b152OriginalAllyAimProjectilesSpawned=0;
    this.b152OriginalAllyAimSurfaceCollisions=0;
    this.b343RejectedVolleys=0;
    this.sourceCpuPhysicalGrantSerial=0;
    this.sourceCpuLastPhysicalGrant.clear();
    this.b345RealOpeningClamps=0;
    this.b346ShooterWitness.reset();
    this.b348AcceptedHumanShots=0;
    this.b348GroundShots=0;
    this.b348AirShots=0;
    this.b348LastYaw=0;
    this.b348LastPitch=0;
    this.b351TrueDamageCues=0;
    this.b367NativeFrame=0;
    this.nativeHumanDamageCueFrame=-1;
    this.nativeSourceHumanSplashCueFrame=-1;
    this.f4SpecialSplashHits=0;
    this.f4SpecialCueFrame=-1;
    this.f4HumanLifeId=null;
    this.f4HumanGrounded=false;
    this.b367RealHumanCpuHits=0;
    this.b367PhysicalEvents.length=0;
    this.pendingSloshes?.clear();
    this.pendingSaberSwings?.clear();
    this.pendingCanopyVolleys?.clear();
    this.canopies?.reset();
    for (const slot of this.slots) this.deactivate(slot);
    this.delayedBursts.length = 0;
    this.fireCooldown = 0;
    this.burstCooldown = 0;
    this.burstShotsRemaining = 0;
    this.splatlingStoredChargeSeconds = 0;
    this.rollPaintCooldown = 0;
    this.meleeCooldown = 0;
    this.chargeSeconds = 0;
    this.wasFireHeld = false;
    this.dualiesFocusSeconds = 0;
    this.guardEntity.enabled = false;
    this.guardHp = 100;
    this.guardBreakSeconds = 0;
    this.queuedCpuShots.length = 0;
    this.stats.activeProjectiles = 0;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponFirstRingPercent = 0;
    this.stats.playerWeaponChargeRing = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
    this.stats.playerWeaponGuardHp = 100;
    // A new SOURCE round has no live human physical contact until its
    // first authoritative PlayerController/ProjectileSystem fixed tick.
    // Do not reuse previous-round damageability/guarding for a SUB/SPECIAL
    // area event or a CPU ray queued before the first new native tick.
    // The fresh player team, body and aim are written by fixedUpdate.
    if(this.nativeSourceHumanPhysicalMode!==null){
      this.currentHumanDamageable=false;
      this.currentHumanGuarding=false;
    }
  }

  public applyF4SubDirectToHuman(point: Vec3, team: Team.A | Team.B, damage: number): void {
    if (!this.currentHumanDamageable || this.currentHumanTeam === team) return;
    const hpLoss = this.resources.applyDamage(damage);
    this.confirmNativeHumanDamage(hpLoss, point, team);
    this.recordCpuPlayerDamageHit(hpLoss);
  }

  public applyF4SubBlast(point: Vec3, team: Team.A | Team.B, radius: number, damage: number,
    near: { radius: number; damage: number }): void {
    this.applyAreaDamage(point, radius, damage, team, undefined, false, undefined, near);
  }

  public applyExternalAreaDamage(
    point: Vec3,
    radius: number,
    damage: number,
    team: Team.A | Team.B
  ): void {
    this.applyAreaDamage(point, radius, damage, team);
  }

  /** The real 180s SOURCE world has only the existing HUMAN capsule or
   * SQUID sphere. Use the current physical player mode to resolve enemy
   * bombs and their AoE; never change the T20/default hit approximation. */
  public enableNativeSourceHumanPhysicalContact(
    realMode:()=>PlayerMode
  ):void{
    this.nativeSourceHumanPhysicalMode=realMode;
  }

  /** All genuine SOURCE CPU weapons (real main bullet, CHARGER ray and
   * physical SUB) share the same actual HUMAN Rapier capsule / SQUID
   * sphere, current HP and team authority. Never a synthetic player hit.
   * CPU kit runs AFTER ProjectileSystem has captured this tick's KCC. */
  public findF4SubOpponent(from: Vec3, team: Team.A|Team.B, range: number,
    tracked?: string): {id:string;point:Vec3}|null {
    let nearest: {id:string;point:Vec3}|null = null;
    let distance = range;
    const consider = (id:string,point:Vec3) => {
      if (tracked && tracked!==id) return;
      const span = point.distance(from);
      if (span >= distance || (!tracked && this.physics.castStageSegment(from,point,'thrown-sub'))) return;
      distance=span;
      nearest={id,point};
    };
    if (this.currentHumanTeam!==team && this.currentHumanDamageable && this.resources.currentHp>0) {
      const point=this.currentHumanPosition.clone();
      if (this.nativeSourceHumanPhysicalMode?.()==='SQUID') point.y+=PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters;
      consider('human',point);
    }
    this.cpuAgents.forEachMapAgent?.((id,actorTeam,foot,active)=>{
      if (active && actorTeam!==team && this.cpuAgents.isF4DeviceOwnerAlive(id))
        consider(id,foot.clone().add(new Vec3(0,.68,0)));
    });
    return nearest;
  }

  public findNativeSourceHumanPhysicalHit(
    from:Vec3,to:Vec3,sourceTeam:Team.A|Team.B,extraRadius=0,contactCover=true
  ):{distance:number;point:Vec3}|null{
    if(!this.currentHumanDamageable||this.currentHumanTeam===sourceTeam||
       this.resources.currentHp<=0)return null;
    const mode=this.nativeSourceHumanPhysicalMode?.()??'HUMAN';
    const body=this.currentHumanPosition;
    const physical=PLAYER_CHARACTER_PHYSICS;
    const distance=mode==='SQUID'
      ?segmentSphereDistance(from,to,
        new Vec3(body.x,body.y+physical.squidCenterOffsetYMeters,body.z),
        physical.squidRadiusMeters+extraRadius)
      :segmentVerticalCapsuleDistance(from,to,body,
        physical.humanHalfHeightMeters,physical.humanRadiusMeters+extraRadius);
    if (distance === null) return null;
    const point = pointOnSegment(from,to,distance);
    if (extraRadius > 0 && contactCover) {
      const axisY = mode === 'SQUID' ? body.y + physical.squidCenterOffsetYMeters :
        clamp(point.y, body.y - physical.humanHalfHeightMeters, body.y + physical.humanHalfHeightMeters);
      if (this.physics.castStageSegment(point, new Vec3(body.x,axisY,body.z),'ink-projectile')) return null;
    }
    return { distance, point };
  }

  public queueCpuShot(request: CpuFireRequest): void {
    const travel = request.groundTravel;
    this.queuedCpuShots.push({
      sourceId: request.sourceId,
      team: request.team,
      origin: request.origin.clone(),
      bodyPosition: request.bodyPosition.clone(),
      target: request.target.clone(),
      weaponId: request.weaponId,
      charge: request.charge,
      action: request.action,
      groundTravel: travel && { from: travel.from.clone(), to: travel.to.clone() },
      qaSourceAim:request.qaSourceAim,
      sourceFloorPaint:request.sourceFloorPaint,
      f4Opponent:request.f4Opponent,
      sourceInkTransaction:request.sourceInkTransaction
    });
  }

  public solveLaunchDirection(
    origin: Vec3,
    target: Vec3,
    out = new Vec3(),
    profile: WeaponProfile = weaponProfile(DEFAULT_WEAPON_ID)
  ): Vec3 {
    const stagedFlight = profile.shooter ?? profile.arrowFlight;
    if (stagedFlight) return aimShooter(origin, target, out, profile, stagedFlight);
    if (profile.blaster) return out.sub2(target, origin).normalize();
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const horizontalDistance = Math.hypot(dx, dz);
    const speed = profile.speedMetersPerSecond;
    const gravity = profile.gravityMetersPerSecond2;

    if (speed <= 0 || gravity <= 0 || horizontalDistance < 1e-5) {
      out.set(dx, dy, dz);
      return out.lengthSq() > 1e-8 ? out.normalize() : out.set(0, 0, -1);
    }

    const speedSq = speed * speed;
    const discriminant = speedSq * speedSq
      - gravity * (gravity * horizontalDistance * horizontalDistance + 2 * dy * speedSq);

    if (discriminant < 0) {
      out.set(dx, dy, dz);
      return out.lengthSq() > 1e-8 ? out.normalize() : out.set(0, 0, -1);
    }

    const tanTheta = (speedSq - Math.sqrt(discriminant)) / (gravity * horizontalDistance);
    const cosTheta = 1 / Math.sqrt(1 + tanTheta * tanTheta);
    const sinTheta = tanTheta * cosTheta;
    const invHorizontal = 1 / horizontalDistance;

    return out.set(
      dx * invHorizontal * cosTheta,
      sinTheta,
      dz * invHorizontal * cosTheta
    ).normalize();
  }

  public fixedUpdate(
    dt: number,
    fireHeld: boolean,
    secondaryHeld: boolean,
    muzzlePosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B,
    playerPosition: Vec3,
    playerWeaponEnabled: boolean,
    playerDamageable: boolean,
    groundTravel?: GroundTravel,
    primaryPressed = false,
    twinComets?: TwinCometsTick,
    cpuWeaponEnabled = true,
    saberForwardHeld = false
  ): void {
    this.b367NativeFrame++;
    this.saberForwardHeld = saberForwardHeld;
    const profile = this.currentPlayerWeapon;
    const risingFire = fireHeld && !this.wasFireHeld;
    const fallingFire = !fireHeld && this.wasFireHeld;

    this.fireCooldown = Math.max(-0.5, this.fireCooldown - dt);
    // Additive shooter cadence must not count idle time toward the next
    // burst. F4 uses the same opening clamp as the original SOURCE mode.
    if(risingFire&&playerWeaponEnabled&&
       (profile.weaponClass==='SHOOTER'||
        profile.weaponClass==='DUALIES')&&
       (this.b345SourceShooterOpeningEnabled||
        (this.nativeSourceHumanPhysicalMode!==null&&this.physics.hasF4WholeResearchTrimesh))){
      const bounded=b345BoundOpeningCooldown(this.fireCooldown,dt);
      if(this.b345SourceShooterOpeningEnabled&&bounded>this.fireCooldown)
        this.b345RealOpeningClamps++;
      this.fireCooldown=bounded;
    }
    this.burstCooldown = Math.max(-0.5, this.burstCooldown - dt);
    this.rollPaintCooldown = Math.max(-0.5, this.rollPaintCooldown - dt);
    this.meleeCooldown = Math.max(-0.5, this.meleeCooldown - dt);
    this.dualiesFocusSeconds = Math.max(0, this.dualiesFocusSeconds - dt);
    this.guardBreakSeconds = Math.max(0, this.guardBreakSeconds - dt);

    const guarding =
      profile.weaponClass === 'BRELLA' &&
      !profile.canopy &&
      secondaryHeld &&
      this.guardBreakSeconds <= 0 &&
      this.guardHp > 0 &&
      playerWeaponEnabled;

    if (!guarding && this.guardBreakSeconds <= 0) {
      this.guardHp = Math.min(100, this.guardHp + 28 * dt);
    }
    this.stats.playerWeaponGuarding = guarding;
    this.stats.playerWeaponGuardHp = this.guardHp;
    this.currentHumanTeam = team;
    this.currentHumanPosition.copy(playerPosition);
    this.currentHumanAimDirection.copy(aimDirection);
    this.currentHumanDamageable = playerDamageable;
    this.currentHumanGuarding = guarding;
    this.updateGuardVisual(guarding, team, playerPosition, aimDirection);

    if (profile.canopy) {
      this.stats.playerWeaponChargePercent = 0;
      this.stats.playerWeaponAction = 'READY';
      if (playerWeaponEnabled && playerDamageable && (risingFire || primaryPressed) &&
          fireHeld && this.fireCooldown <= 1e-8 && this.canopies?.lookup('human')?.phase !== 'OPEN') {
        if (this.reserveCanopyVolley(profile, team, 'human', undefined,
          () => this.resources.tryConsumeShotInk(profile.inkCost, profile.canopy!.recoveryLockSeconds))) {
          this.fireCooldown = profile.fireIntervalSeconds;
        } else this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
    } else if (profile.twinComets) {
      this.stats.playerWeaponAction = 'LOCKED';
      if (playerWeaponEnabled && playerDamageable) {
        if (twinComets?.rollTravel) this.paintTwinCometsDodge(twinComets.rollTravel, team);
        if (twinComets?.phase !== 'ROLL_LOCK') {
          this.updateTwinComets(profile, fireHeld, {
            muzzle: muzzlePosition, forward: aimDirection, target: twinComets?.aimTarget ??
              muzzlePosition.clone().add(aimDirection.clone().mulScalar(profile.shooter!.combatRangeMeters)),
            body: playerPosition, grounded: this.stats.playerGrounded,
            focused: twinComets?.phase === 'FOCUSED'
          }, team);
        }
      }
    } else if (profile.contactWeapon) {
      this.stats.playerWeaponAction = 'LOCKED';
      if (playerWeaponEnabled && playerDamageable) {
        this.updateContactWeapon(profile, fireHeld, risingFire || primaryPressed,
          muzzlePosition, aimDirection, team, playerPosition, groundTravel);
      } else {
        this.clearHumanContactInput();
      }
    } else if (playerWeaponEnabled && (!this.physics.hasF4WholeResearchTrimesh ||
        (profile.weaponClass !== 'SPLATANA' && profile.weaponClass !== 'SPLATLING') ||
        (playerDamageable && this.nativeSourceHumanPhysicalMode?.() !== 'SQUID'))) {
      this.updatePlayerWeapon(
        dt,
        profile,
        fireHeld,
        risingFire,
        fallingFire,
        guarding,
        muzzlePosition,
        aimDirection,
        team,
        playerPosition
      );
    } else {
      this.chargeSeconds = 0;
      this.f4StringerTapPending = false;
      this.burstShotsRemaining = 0;
      this.splatlingStoredChargeSeconds = 0;
      this.stats.playerWeaponChargePercent = 0;
      this.stats.playerWeaponChargeRing = 0;
      this.stats.playerWeaponAction = 'LOCKED';
    }

    this.feedback.updateChargeVisual(
      profile,
      team,
      muzzlePosition,
      aimDirection,
      chargeFraction(profile, this.chargeSeconds),
      playerDamageable && fireHeld && isChargeWeaponClass(profile.weaponClass)
    );
    this.wasFireHeld = fireHeld;

    this.processDelayedBursts(dt);
    this.spawnQueuedCpuShots(
      team,
      playerPosition,
      playerDamageable,
      guarding,
      aimDirection
    );
    this.emitPendingSloshes(muzzlePosition, aimDirection, playerPosition,
      playerWeaponEnabled && playerDamageable && this.nativeSourceHumanPhysicalMode?.() !== 'SQUID',
      cpuWeaponEnabled);
    if (this.physics?.hasF4WholeResearchTrimesh) {
      const humanAllowed = playerWeaponEnabled && playerDamageable &&
        this.nativeSourceHumanPhysicalMode?.() !== 'SQUID';
      this.emitSaberSwings(muzzlePosition, playerPosition, humanAllowed, cpuWeaponEnabled);
      this.emitCanopyVolleys(muzzlePosition, aimDirection, playerPosition, humanAllowed, cpuWeaponEnabled);
      this.stepF4Canopies(profile, team, playerPosition, aimDirection,
        fireHeld || secondaryHeld, humanAllowed, cpuWeaponEnabled);
    }

    let active = 0;
    projectile: for (const slot of this.slots) {
      if (!slot.active) continue;

      slot.previousPosition.copy(slot.position);
      // Native SOURCE must resolve the physically remaining fraction of
      // its final 60 Hz tick before TTL retirement. Otherwise a genuine
      // player, CPU or Rapier contact in the last few milliseconds vanishes.
      // Never extend the true lifetime or alter frozen T20 projectile steps.
      const shooterFlight = slot.shooterFlight;
      const blasterFlight = slot.blasterFlight;
      const slosher = slot.slosherFlight;
      const pellet = slot.canopyPellet;
      const sourceLifetime=this.nativeSourceHumanPhysicalMode!==null ||
        shooterFlight !== undefined || blasterFlight !== undefined || slosher !== undefined || pellet !== undefined;
      const flightDt=sourceLifetime?Math.min(dt,Math.max(0,slot.ttl)):dt;
      slot.ttl -= dt;
      slot.trailPaintCooldown -= dt;

      if (slot.ttl <= 0 && (!sourceLifetime || flightDt <= 0)) {
        this.finishProjectile(slot, slot.position, null, 'TTL');
        continue;
      }

      const previous = slot.position.clone();
      const stagedFlight = shooterFlight ?? blasterFlight;
      if (stagedFlight) {
        advanceShooterVelocity(slot.velocity, stagedFlight, stagedFlight.profile);
        this.delta.copy(slot.velocity).mulScalar(flightDt);
      } else if (slot.arrowFlight) {
        advanceShooterVelocity(slot.velocity, slot.arrowFlight, slot.arrowFlight.profile);
        this.delta.copy(slot.velocity).mulScalar(flightDt);
      } else if (slosher) {
        stepSlosherFlight(this.delta, slot.velocity, slosher.droplet, slosher.age, flightDt);
      } else if (pellet) {
        advanceShooterVelocity(slot.velocity, pellet, F4_CANOPY_PELLET_FLIGHT);
        this.delta.copy(slot.velocity).mulScalar(flightDt);
      } else {
        const gravityStep = slot.gravity * flightDt;
        slot.velocity.y -= gravityStep;
        this.delta.copy(slot.velocity).mulScalar(flightDt);
        // Match the ballistic solver with the mean velocity over the sweep.
        if(sourceLifetime&&(slot.sourceKind==='HUMAN'||this.physics.hasF4WholeResearchTrimesh)){
          this.delta.y += gravityStep * flightDt * 0.5;
        }
      }
      const special = slot.f4Special;
      if (special) {
        const {flight, right, up, index} = special;
        const previousAge = special.age++;
        if (flight.offset) {
          const old = flight.offset(previousAge,index);
          const now = flight.offset(special.age,index);
          this.delta.add(right.clone().mulScalar(now[0]-old[0]));
          this.delta.add(up.clone().mulScalar(now[1]-old[1]));
        }
      }
      const next = slot.position.clone().add(this.delta);

      const radii = slosher && slosherCollision(slosher.droplet, ++slosher.age);
      const sloshQuery = slosher && radii ? { radius: radii.actor, resolvedTargets: slosher.resolvedTargets } : undefined;
      const saber = slot.saber;
      const sweep = saber?.sweeps ?? [{ offset: Vec3.ZERO, radius: 0 }];
      const blockerHit = saber
        ? nearestSaberSweep(sweep, previous, next, (from, to, radius) =>
          this.physics.castStageInkSphere(from, to, radius))
        : radii ? this.physics.castStageInkSphere(previous, next, radii.stage)
        : this.physics.castStageSegment(previous, next, 'ink-projectile');
      const saberContact = slot.weaponId === 'ink-saber' && slot.paintRadius <= 0;
      const paintHit = this.physics.hasF4WholeResearchTrimesh
        ? saberContact ? null : this.physics.f4PaintAtStageHit(blockerHit, this.surfaces)
        : this.findNearestSurfaceHit(previous, next);
      // SOURCE pellets respect the nearest registered Rapier blocker.
      // The legacy near-coplanar paint tolerance remains outside SOURCE.
      const paintWins=paintHit&&originalSourcePaintBeforeRapier(
        paintHit,blockerHit,!!this.nativeSourceHumanPhysicalMode
      );
      // In genuine SOURCE combat, actor contact never passes an earlier
      // registered Rapier solid; near-coplanar paint priority is separate.
      // Frozen T20 keeps its historical contact order.
      const worldDistance = this.nativeSourceHumanPhysicalMode
        ? Math.min(paintHit?.distance??Infinity,
          blockerHit?.distance??Infinity)
        : paintWins
          ? paintHit.distance
          : (blockerHit?.distance??Infinity);

      const stageOnly = special?.flight.collisions === "stage";
      const shield = stageOnly ? null : saber
        ? nearestSaberSweep(sweep, previous, next, (from, to, radius) =>
          this.findF4CanopyHit(from, to, slot.team, radius))
        : this.findF4CanopyHit(previous, next, slot.team, radii?.stage);
      for (;;) {
        const actorQuery = (radius: number) => saber
          ? { radius, resolvedTargets: saber.resolvedTargets } : sloshQuery;
        const qaHit = !special && slot.sourceKind === 'HUMAN'
          ? nearestSaberSweep(sweep, previous, next, (from, to, radius) =>
            this.combatTargets.findNearestHit(from, to, slot.team, actorQuery(radius)))
          : null;
        const cpuHit = stageOnly ? null : nearestSaberSweep(sweep, previous, next, (from, to, radius) => {
          const hit = this.cpuAgents.findNearestCombatHit(from, to, slot.team, actorQuery(radius));
          return hit?.targetPoint &&
            this.physics.castStageSegment(hit.point, hit.targetPoint, 'ink-projectile') ? null : hit;
        });
        // The original 180s player is either an actual Rapier HUMAN capsule
        // or a lowered SQUID sphere. CPU MAIN bullets must use the same
        // collision as real thrown SUBs; an HP-zero human cannot absorb a
        // second bullet later in this same native frame.
        const playerHitDistance = (
          !stageOnly && playerDamageable &&
          slot.sourceKind === 'CPU' &&
          slot.team !== team &&
          !slosher?.resolvedTargets.has('human') && !saber?.resolvedTargets.has('human') &&
          (!this.nativeSourceHumanPhysicalMode||this.resources.currentHp>0)
        )
          ? (this.nativeSourceHumanPhysicalMode
            ? nearestSaberSweep(sweep, previous, next, (from, to, radius) =>
                this.findNativeSourceHumanPhysicalHit(from, to, slot.team, radii?.actor ?? radius))?.distance ?? null
            : segmentSphereDistance(
                previous,next,playerPosition,
                GAME_CONFIG.cpu.playerHitRadiusMeters))
          : null;

        let combatDistance = Number.POSITIVE_INFINITY;
        let combatKind: 'QA' | 'CPU' | 'PLAYER' | null = null;
        if (qaHit && qaHit.distance < combatDistance) {
          combatDistance = qaHit.distance;
          combatKind = 'QA';
        }
        if (cpuHit && cpuHit.distance < combatDistance) {
          combatDistance = cpuHit.distance;
          combatKind = 'CPU';
        }
        if (playerHitDistance !== null && playerHitDistance < combatDistance) {
          combatDistance = playerHitDistance;
          combatKind = 'PLAYER';
        }

        const combatWins = combatKind !== null &&
          combatDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < worldDistance;
        const shieldWins = !!shield && shield.distance < worldDistance &&
          (!combatWins || shield.distance <= combatDistance);
        const terminalDistance = shieldWins ? shield.distance : combatWins ? combatDistance : worldDistance;
        const device = stageOnly ? null : this.findF4ProjectileObjectContact(previous,next,slot.team);
        if (!special && this.f4Absorption) {
          const suction = this.f4Absorption(previous,next,{
            team:slot.team,damage:slot.damage,id:slot.entity.name+':'+this.b367NativeFrame,
            consume:()=>{
              if(!slot.active)return false;
              this.deactivate(slot);
              return true;
            }
          });
          if(suction && suction.distance < Math.min(terminalDistance,device?.distance??Infinity) &&
              suction.accept())continue projectile;
        }
        if (device && device.distance < terminalDistance) {
          const damage = shooterFlight
            ? shooterDamageAtFrame(slot.damage,shooterFlight.frame-1+
              device.distance/Math.max(1e-8,this.delta.length()),shooterFlight.profile)
            : pellet ? canopyPelletDamage(pellet.distance+device.distance) :
              special?.flight.damageAtAge?.(special.age) ?? slot.damage;
          device.damage(damage);
          this.finishProjectile(slot,pointOnSegment(previous,next,device.distance),null,'DEVICE');
          continue projectile;
        }
        // SOURCE uses the actual original Rapier/paint/actor collision for
        // this entire 60Hz segment. A trail stamp at "next" BEFORE the hit
        // query used to paint THROUGH a registered wall during the terminal
        // tick (especially genuine CPU SLOSHER shots). Only a physically
        // unobstructed SOURCE segment may issue an in-flight MidDroplet.
        // The proper original paint impact remains handled below; the
        // frozen non-SOURCE trail behavior stays exactly as before.
        const sourceTerminalTrail=this.nativeSourceHumanPhysicalMode!==null&&
          (!!paintHit||!!blockerHit||!!shield||
           (!!combatKind&&
            combatDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters <
             worldDistance));
        if(slot.trailPaintRadius>0&&slot.trailPaintCooldown<=0&&
           !sourceTerminalTrail){
          this.paintWorldStamp(
            slot.team,next,slot.trailPaintRadius*1.15,
            slot.trailPaintRadius*0.62,slot.velocity,1.7,
            PaintEventType.MidDroplet,
            slot.sourceKind==='HUMAN'?PaintSource.Human:PaintSource.Cpu,
            slot.sourceKind==='CPU'?slot.sourceId:undefined
          );
          slot.trailPaintCooldown=0.085;
        }

        if (stagedFlight) {
          this.enqueueFlightSplashes(slot, stagedFlight, previous, next, terminalDistance);
        }
        if (slosher) this.enqueueSlosherMidDrop(slot, previous, next, terminalDistance);
        if (pellet) this.enqueueCanopyPelletDrop(slot, previous, next, terminalDistance);
        if (shieldWins) {
          if (saber) this.enqueueSaberSplashes(slot, previous, next, shield.distance);
          const damage = pellet ? canopyPelletDamage(pellet.distance + shield.distance) :
            shooterFlight ? shooterDamageAtFrame(slot.damage, shooterFlight.frame - 1 +
              shield.distance / Math.max(1e-8, this.delta.length()), shooterFlight.profile) :
            slosher ? slosherDamage(slosher.droplet, slosher.launchY - shield.point.y) :
            blasterFlight ? Math.max(slot.damage,slot.blastDamage) : slot.damage;
          this.damageF4Canopy(shield, damage);
          this.finishProjectile(slot, shield.point, null, 'CANOPY');
          continue projectile;
        }
        if (combatWins) {
          const target = combatKind === 'CPU' ? cpuHit!.botId : combatKind === 'QA' ? 'QA:' + qaHit!.targetId : 'human';
          if (saber && !acceptSaberComponent(saber.ledger, target, saber.component)) {
            saber.resolvedTargets.add(target);
            continue;
          }
          const shotDamage = pellet ? cappedCanopyDamage(
            pellet.acceptedDamage, target, canopyPelletDamage(pellet.distance + combatDistance)) : shooterFlight
            ? shooterDamageAtFrame(slot.damage, shooterFlight.frame - 1 +
              combatDistance / Math.max(1e-8, this.delta.length()), shooterFlight.profile)
            : slosher ? slosherDamage(slosher.droplet,
              slosher.launchY - pointOnSegment(previous, next, combatDistance).y) :
              special?.flight.damageAtAge?.(special.age) ?? slot.damage;
          let combatPoint = next.clone();
          let applied = 0;
          if (pellet && shotDamage <= 0) {
            this.finishProjectile(slot, pointOnSegment(previous,next,combatDistance), null,
              combatKind==='CPU'?'REAL_CPU_HIT':combatKind==='PLAYER'?'REAL_PLAYER_HIT':'QA_TARGET_HIT');
            continue projectile;
          }
          if (combatKind === 'QA' && qaHit) {
            combatPoint = qaHit.point.clone();
            const damage = this.combatTargets.applyProjectileHit(qaHit, shotDamage);
            applied = damage;
            if (damage > 0) slosher?.resolvedTargets.add('QA:' + qaHit.targetId);
          } else if (combatKind === 'CPU' && cpuHit) {
            combatPoint = cpuHit.point.clone();
            // Enemy HP may have absorbed this hit via guard: inspect actual
            // post-damage counter, never treat a ray match as a true hit.
            const beforeHit=this.stats.humanCpuDirectHits;
            const resolved=this.cpuAgents.applyProjectileHit(
               cpuHit,shotDamage,slot.sourceKind,
               slot.sourceKind==='CPU'?slot.sourceId:undefined);
            applied = resolved?.realHpLoss ?? 0;
            if (resolved && resolved.realHpLoss > 0) slosher?.resolvedTargets.add(cpuHit.botId);
            this.recordB367RealCpuDamage(
             resolved,slot.weaponId,cpuHit.botId,slot.sourceKind);
            const originalConfirmedCue=b351RealCpuDamageCue(
             this.b351CueOn,slot.sourceKind,slot.weaponId,beforeHit,
             this.stats.humanCpuDirectHits,this.b367SelectedRealLoadout);
            if(resolved!==null&&resolved.realHpLoss>0&&!resolved.shieldAbsorbed&&
               resolved.botId===cpuHit.botId&&resolved.sourceKind==='HUMAN'&&
               (originalConfirmedCue||this.f4PhysicalHitCueOn)){
              if(originalConfirmedCue)this.b351TrueDamageCues++;
              if(this.f4PhysicalHitCueOn)this.f4ConfirmedDamageCues++;
              this.feedback.confirmedHumanCpuDamage(slot.team,combatPoint,
                weaponProfile(slot.weaponId));
            }
          } else if (combatKind === 'PLAYER') {
            combatPoint = pointOnSegment(previous, next, combatDistance);
            if (guarding && (this.nativeSourceHumanPhysicalMode
              ? this.isNativeSourceGuardBlockingContact(
                  slot,combatPoint,playerPosition,aimDirection)
              : this.isGuardBlocking(slot,playerPosition,aimDirection))) {
              this.guardHp = Math.max(0, this.guardHp - shotDamage);
              this.stats.playerWeaponGuardBlocks += 1;
              this.stats.playerWeaponGuardHp = this.guardHp;
              if (this.guardHp <= 0) {
                this.guardBreakSeconds = 2.5;
                this.guardEntity.enabled = false;
                this.stats.playerWeaponAction = 'GUARD_BREAK';
              }
            } else {
              const hpLoss=this.resources.applyDamage(shotDamage);
              applied = hpLoss;
              if (hpLoss > 0) slosher?.resolvedTargets.add('human');
              this.confirmNativeHumanDamage(hpLoss,combatPoint,slot.team);
              this.recordCpuPlayerDamageHit(hpLoss);
            }
          }
          if (pellet && applied > 0) {
            pellet.acceptedDamage.set(target, (pellet.acceptedDamage.get(target) ?? 0) + shotDamage);
          }

          if (saber) {
            saber.resolvedTargets.add(target);
            continue;
          }
          this.finishProjectile(slot, combatPoint, null,
            combatKind==='CPU'?'REAL_CPU_HIT':
            combatKind==='PLAYER'?'REAL_PLAYER_HIT':'QA_TARGET_HIT');
          continue projectile;
        }
        if (saber) this.enqueueSaberSplashes(slot, previous, next, terminalDistance);
        break;
      }

      slot.terrainContactNormal = blockerHit?.normal;
      if (special && blockerHit) special.flight.onTerrain?.(blockerHit);
      if (paintWins) {
        if (!blasterFlight && !special) this.enqueueImpact(
          slot.team,
          paintHit,
          saber?.paintWidth ?? slot.paintRadius,
          slot.sourceKind === 'HUMAN' ? PaintSource.Human : PaintSource.Cpu,
          slot.sourceKind === 'CPU' ? slot.sourceId : undefined,
          slot.qaSourceAim,
          pellet ? this.canopyPelletBrush(pellet.index, paintHit, slot.velocity) :
          slosher ? slosherPaintBrush(slosher.droplet, paintHit, slot.velocity,
            slosher.distance + paintHit.distance, slosher.launchY - paintHit.worldPoint.y) :
          shooterFlight && shooterImpactBrush(
            paintHit, slot.velocity, shooterFlight.distance + paintHit.distance, shooterFlight.profile
          )
        );
        if (slosher) this.enqueueSlosherWallRunoff(slot, paintHit);
        this.finishProjectile(slot, paintHit.worldPoint, paintHit, 'ORIGINAL_PAINTABLE');
        continue;
      }

      if (blockerHit) {
        this.finishProjectile(slot, blockerHit.point, null, 'ORIGINAL_SOLID');
        continue;
      }

      // An unobstructed SOURCE shot still physically flies through its
      // remaining lifetime before being retired at the reached position.
      if(sourceLifetime&&(slot.ttl<=0 || (blasterFlight && slot.ttl<=1e-8))){
        this.finishProjectile(slot,next,null,'TTL');
        continue;
      }
      if (stagedFlight) stagedFlight.distance += this.delta.length();
      if (slosher) slosher.distance += this.delta.length();
      if (pellet) pellet.distance += this.delta.length();
      slot.position.copy(next);
      slot.entity.setPosition(slot.position);
      active += 1;
    }

    this.stats.activeProjectiles = active;
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.entity.setPosition(
        slot.previousPosition.x + (slot.position.x - slot.previousPosition.x) * t,
        slot.previousPosition.y + (slot.position.y - slot.previousPosition.y) * t,
        slot.previousPosition.z + (slot.position.z - slot.previousPosition.z) * t
      );
    }
  }

  /** SOURCE human grounded melee paints from actual ORIGINAL Rapier foot,
   * This research-branch change is static-build-only: no native Chromium.
   * not the elevated capsule center. Damage, actors, nav and clock unchanged. */
  private sourceHumanGroundMeleePaintFoot(body:Vec3):Vec3|null{
    if(!this.nativeSourceHumanPhysicalMode||
       this.nativeSourceHumanPhysicalMode()!=='HUMAN')return null;
    const hit=this.physics.castCharacterFootSupport(body,
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
    return sourceNativeMeleePaintFoot(body,this.stats.playerGrounded,hit);
  }

  /** Only SOURCE CPU melee: bot.position is the actual Crowd/Rapier
   * FOOT, not the HUMAN capsule center. Check the registered physical
   * support at that exact foot before selecting original ink backing.
   * Missing or displaced support cannot mint paint on another layer. */
  private sourceOriginalCpuMeleePaintFoot(foot:Vec3):Vec3|null{
    if(![foot.x,foot.y,foot.z].every(Number.isFinite))return null;
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const sampleBody=new Vec3(foot.x,foot.y+offset,foot.z);
    const hit=this.physics.castCharacterFootSupport(
      sampleBody,offset,'HUMAN');
    return sourceNativeMeleePaintFoot(sampleBody,true,hit);
  }

  /** Choose only the original Rapier-backed paint surface BEFORE
   * planar ranking. A closer, different layer cannot suppress supported
   * ROLLER / BRUSH / SPLATANA ink. No new collision or scoring grants. */
  private sourceNativeMeleeApprovedSurfaceId(foot:Vec3,target:Vec3):
    string|null{
    if(![foot.x,foot.y,foot.z,target.x,target.y,target.z]
      .every(Number.isFinite))return null;
    const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const hit=this.physics.castCharacterFootSupport(
      new Vec3(target.x,target.y+offset,target.z),offset,'HUMAN');
    if(!hit?.solidId)return null;
    const from=new Vec3(foot.x,foot.y+.08,foot.z);
    const to=new Vec3(hit.point.x,hit.point.y+.08,hit.point.z);
    const block=this.physics.castStageSegment(from,to,'ink-projectile');
    const id=hit.solidId+':paint';
    if(!sourceNativeMeleeStampAllowed(foot,target,id,hit,block?.distance??null))
      return null;
    return this.physics.hasF4WholeResearchTrimesh?
      this.physics.f4PaintAtStageHit(hit,this.surfaces)?.surface.id??null:id;
  }

  private sourceHumanMeleeStampOrigin(origin:Vec3,source:PaintSource):
    Vec3|undefined{
    return this.nativeSourceHumanPhysicalMode&&this.stats.playerGrounded&&
      source===PaintSource.Human?origin:undefined;
  }

  private updatePlayerWeapon(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    risingFire: boolean,
    fallingFire: boolean,
    guarding: boolean,
    muzzlePosition: Vec3,
    aimDirection: Vec3,
    team: Team.A | Team.B,
    playerPosition: Vec3
  ): void {
    this.stats.playerWeaponAction = guarding ? 'GUARD' : 'READY';
    const groundedSourceMelee=this.nativeSourceHumanPhysicalMode!==null&&
      this.stats.playerGrounded&&
      (profile.weaponClass==='ROLLER'||profile.weaponClass==='BRUSH'||
       profile.weaponClass==='SPLATANA')&&(fireHeld||fallingFire);
    const paintOrigin=groundedSourceMelee?
      this.sourceHumanGroundMeleePaintFoot(playerPosition):playerPosition;

    switch (profile.weaponClass) {
      case 'SHOOTER':
        this.updateShooter(profile, fireHeld, muzzlePosition, aimDirection, team, playerPosition);
        break;
      case 'DUALIES':
        this.updateDualies(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'CHARGER':
        this.updateCharger(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team, playerPosition);
        break;
      case 'BLASTER':
        this.updateBlaster(profile, fireHeld, muzzlePosition, aimDirection, team, playerPosition);
        break;
      case 'ROLLER':
        this.updateRoller(profile, fireHeld, risingFire, playerPosition, paintOrigin, aimDirection, team);
        break;
      case 'BRUSH':
        this.updateBrush(profile, fireHeld, playerPosition, paintOrigin, aimDirection, team);
        break;
      case 'SLOSHER':
        this.updateSlosher(profile, fireHeld, muzzlePosition, aimDirection, team);
        break;
      case 'SPLATLING':
        this.updateSplatling(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team);
        break;
      case 'BRELLA':
        this.updateBrella(profile, fireHeld, guarding, muzzlePosition, aimDirection, team);
        break;
      case 'STRINGER':
        this.updateStringer(dt, profile, fireHeld, fallingFire, muzzlePosition, aimDirection, team, playerPosition);
        break;
      case 'SPLATANA':
        this.updateSplatana(dt, profile, fireHeld, fallingFire, playerPosition, paintOrigin, muzzlePosition, aimDirection, team);
        break;
    }
  }

  private updateShooter(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    playerPosition: Vec3
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > (profile.shooter ? 1e-8 : 0)) return;
    if (profile.shooter) {
      // The muzzle can extend into cover when the character hugs a wall.
      // Start the sweep on the near side of that same Rapier contact.
      const physicalOrigin = this.clipF4Muzzle(new Vec3(playerPosition.x, origin.y, playerPosition.z), origin);
      if (this.fireProjectiles(profile, physicalOrigin, direction, team, 1, 0, 0)) {
        if (this.stats.playerGrounded) {
          this.enqueueShooterFoot(profile.shooter, playerPosition, team, 'human');
        }
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = 'AUTO_FIRE';
      } else {
        this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
      return;
    }
    // B348 only the source-validated Pulse Sprayer research candidate.
    // The physical projectile spawning/impact and ink cost stay original.
    const hypothesis=this.b348ShooterCandidateEnabled&&
     profile.id==='pulse-sprayer'
      ?b348CandidateShooterAngles(
        this.b348AcceptedHumanShots+1,this.stats.playerGrounded)
      :null;
    let physicalDirection=direction;
    if(hypothesis){
      const yaw=rotateYaw(direction,hypothesis.yawDegrees);
      const h=Math.hypot(yaw.x,yaw.z);
      const theta=Math.atan2(yaw.y,h)+
       hypothesis.pitchDegrees*Math.PI/180;
      physicalDirection=h>1e-8
       ?new Vec3(yaw.x/h*Math.cos(theta),Math.sin(theta),
          yaw.z/h*Math.cos(theta)).normalize()
       :yaw;
    }
    if (this.fireProjectiles(profile, origin, physicalDirection, team, 1, profile.spreadDegrees, 0)) {
      if(hypothesis){
        this.b348AcceptedHumanShots++;
        if(hypothesis.grounded)this.b348GroundShots++;
        else this.b348AirShots++;
        this.b348LastYaw=hypothesis.yawDegrees;
        this.b348LastPitch=hypothesis.pitchDegrees;
      }
      this.fireCooldown += profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'AUTO_FIRE';
    } else {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
  }

  private updateDualies(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) {
      if (this.dualiesFocusSeconds > 0) this.stats.playerWeaponAction = 'POST_ROLL_FOCUS';
      return;
    }

    const focused = this.dualiesFocusSeconds > 0;
    const spread = focused ? 0.65 : profile.spreadDegrees;
    const cadence = focused ? 0.062 : profile.fireIntervalSeconds;
    if (this.fireProjectiles(profile, origin, direction, team, 2, spread, 0)) {
      this.fireCooldown += cadence;
      this.stats.playerWeaponAction = focused ? 'DUAL_FOCUS' : 'DUAL_FIRE';
    } else {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
  }

  private twinCometsOrdinal(actor: string): number {
    const lastShot = this.shooterCadence?.get(actor);
    return lastShot?.weaponId === 'twin-comets' ? lastShot.shots + 1 : 1;
  }

  private planTwinCometsLaunch(profile: WeaponProfile, aim: TwinCometsAim, actor: string, ordinal: number) {
    const side = ordinal % 2 === 1 ? -1 : 1;
    const forward = flattened(aim.forward);
    const right = new Vec3(-forward.z, 0, forward.x);
    const muzzle = aim.muzzle.clone().add(right.clone().mulScalar(aim.focused ? 0 : side * 0.27));
    const anchor = new Vec3(aim.body.x, aim.muzzle.y, aim.body.z);
    const block = this.physics.castStageSegment(anchor, muzzle, 'ink-projectile');
    if (block) {
      // The obstructed barrel fires into the real near-side contact.
      // The other barrel keeps its own, independently resolved muzzle.
      return { origin: pointOnSegment(anchor, muzzle, Math.max(0, block.distance - 0.015)),
        direction: muzzle.sub(anchor).normalize(), blockedPoint: block.point };
    }
    const target = aim.target.clone().add(right.mulScalar(aim.focused ? 0 : side * 0.24));
    const direction = this.solveLaunchDirection(muzzle, target, new Vec3(), profile);
    const spread = aim.focused ? 0 : aim.grounded ? profile.spreadDegrees : profile.shooter!.airSpreadDegrees;
    return { origin: muzzle, direction: rotateYaw(direction,
      shooterYawDegrees(spread, aim.grounded ? 0.5 : 0.62, actor, ordinal)), blockedPoint: null };
  }

  private launchTwinComets(
    profile: WeaponProfile, aim: TwinCometsAim, team: Team.A | Team.B, actor: string,
    pay?: () => boolean, qaSourceAim?: CpuFireRequest['qaSourceAim']
  ): boolean {
    const slot = this.slots.find(isFreeProjectileSlot);
    if (!slot) {
      this.stats.projectilePoolDrops++;
      return false;
    }
    if (pay && !pay()) return false;
    const shot = this.planTwinCometsLaunch(profile, aim, actor, this.twinCometsOrdinal(actor));
    this.spawnProjectile(slot, profile, shot.origin, shot.direction, team,
      profile.speedMetersPerSecond, profile.gravityMetersPerSecond2, profile.lifeSeconds,
      profile.visualDiameterMeters, profile.damage, profile.paintRadiusMeters,
      0, 0, 0, 0, 0, 0, 0, actor === 'human' ? 'HUMAN' : 'CPU', actor, qaSourceAim, true);
    if (aim.grounded) this.enqueueShooterFoot(profile.shooter!, aim.body, team, actor);
    this.feedback.shot(team, shot.origin, profile, false);
    return true;
  }

  private updateTwinComets(
    profile: WeaponProfile, fireHeld: boolean, aim: TwinCometsAim, team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponAction = aim.focused ? 'POST_ROLL_FOCUS' : 'READY';
    const lastShot = this.shooterCadence?.get('human');
    const cadence = aim.focused ? 4 : 5;
    if (!fireHeld || this.fireCooldown > 1e-8 ||
        (lastShot?.weaponId === profile.id && this.b367NativeFrame - lastShot.lastFrame < cadence)) return;
    if (!this.launchTwinComets(profile, aim, team, 'human',
      () => this.resources.tryConsumeShotInk(profile.inkCost, profile.shooter!.recoveryLockSeconds))) {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      return;
    }
    this.stats.playerWeaponAction = aim.focused ? 'DUAL_FOCUS' : 'DUAL_FIRE';
  }

  public previewTwinCometsAim(aim: TwinCometsAim): Vec3[] {
    const profile = this.currentPlayerWeapon;
    if (!profile.twinComets || !profile.shooter) return [];
    const flightProfile = profile.shooter;
    const next = this.twinCometsOrdinal('human');
    const ordinals = aim.focused ? [next] : next % 2 === 1 ? [next, next + 1] : [next + 1, next];
    return ordinals.map(ordinal => {
      const shot = this.planTwinCometsLaunch(profile, aim, 'human', ordinal);
      if (shot.blockedPoint) return shot.blockedPoint;
      const depth = clamp(Math.hypot(aim.target.x - shot.origin.x, aim.target.z - shot.origin.z), 0.6,
        flightProfile.combatRangeMeters);
      const flight = { frame: 0, free: false };
      const velocity = shot.direction.clone().mulScalar(profile.speedMetersPerSecond);
      const position = shot.origin.clone();
      let traveled = 0;
      while (flight.frame < Math.round(profile.lifeSeconds * SHOOTER_HZ) && traveled < depth) {
        advanceShooterVelocity(velocity, flight, flightProfile);
        const speed = Math.hypot(velocity.x, velocity.z);
        if (speed < 0.01) break;
        const dt = Math.min(1 / SHOOTER_HZ, (depth - traveled) / speed);
        const end = position.clone().add(velocity.clone().mulScalar(dt));
        const hit = this.physics.castStageSegment(position, end, 'ink-projectile');
        if (hit) return hit.point;
        position.copy(end);
        traveled += speed * dt;
      }
      return position;
    });
  }

  private paintTwinCometsDodge(travel: GroundTravel, team: Team.A | Team.B): void {
    const motion = contactMotion(travel);
    if (!motion) return;
    const cells = collectContactPaint(motion, 0.30, this.physics, this.surfaces);
    for (const hit of cells ?? []) this.enqueueF4ContactCell(hit, team, 'human');
  }

  private updateCharger(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    body: Vec3
  ): void {
    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponAction = 'CHARGING_BEAM';
      return;
    }

    if (fallingFire && this.chargeSeconds >= profile.minChargeSeconds && this.fireCooldown <= 0) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      const physicalOrigin = profile.charger
        ? this.clipF4Muzzle(new Vec3(body.x, origin.y, body.z), origin) : origin;
      if (this.fireChargerRay(profile, physicalOrigin, direction, team, charge)) {
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = charge >= 0.98 ? 'FULL_CHARGE_SHOT' : 'PARTIAL_CHARGE_SHOT';
      }
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  private updateBlaster(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    body: Vec3
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > (profile.blaster ? 1e-8 : 0)) return;
    const physicalOrigin = profile.blaster
      ? this.clipF4Muzzle(new Vec3(body.x, origin.y, body.z), origin) : origin;
    if (this.fireProjectiles(profile, physicalOrigin, direction, team, 1, 0, 0)) {
      if (profile.blaster && this.stats.playerGrounded) {
        this.enqueueF4Foot(body, team, 'human', profile.blaster.footRadius);
      }
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'BLAST_SHOT';
    }
  }

  private clearHumanContactInput(): void {
    this.contactHeldFrames = 0;
    this.contactMovingFrames = 0;
  }

  private updateContactWeapon(
    profile: WeaponProfile, fireHeld: boolean, pressed: boolean, muzzle: Vec3,
    aim: Vec3, team: Team.A | Team.B, body: Vec3, travel?: GroundTravel
  ): void {
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld) {
      this.clearHumanContactInput();
      return;
    }
    const contact = profile.contactWeapon!;
    if (pressed) this.clearHumanContactInput();
    this.contactHeldFrames++;
    if (pressed && this.fireCooldown <= 1e-8) {
      const vertical = !!contact.vertical && !this.stats.playerGrounded;
      const recovery = vertical ? contact.verticalRecovery! : contact.swingRecovery;
      if (this.launchContactSwing(profile, muzzle, body, aim, team, 'human', vertical,
        () => this.resources.tryConsumeShotInk(profile.inkCost, recovery))) {
        this.fireCooldown = vertical ? contact.verticalInterval! : profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = vertical ? 'VERTICAL_FLICK'
          : contact.vertical ? 'HORIZONTAL_FLICK' : 'BRUSH_SWIPE';
      }
    }
    if (this.contactHeldFrames <= contact.rollAfterFrames || !travel) {
      this.contactMovingFrames = 0;
      return;
    }
    const motion = contactMotion(travel);
    if (!motion) {
      this.contactMovingFrames = 0;
      return;
    }
    const painted = this.executeContactTravel(profile, motion, team, 'human',
      (cost, recovery) => this.resources.tryConsumeContactInk(cost, recovery));
    if (painted) {
      this.contactMovingFrames++;
      this.stats.playerWeaponAction = 'ROLLING';
    } else {
      this.contactMovingFrames = 0;
    }
  }

  private launchContactSwing(
    profile: WeaponProfile, muzzle: Vec3, body: Vec3, aim: Vec3,
    team: Team.A | Team.B, actor: string, vertical: boolean, pay = () => true
  ): boolean {
    const contact = profile.contactWeapon!;
    const groups = vertical ? contact.vertical! : contact.horizontal;
    const count = groups.reduce((sum, group) => sum + group.count, 0);
    const slots = this.slots.filter(isFreeProjectileSlot).slice(0, count);
    if (slots.length !== count || !pay()) return false;
    const brush = !contact.vertical;
    const ordinal = (this.brushSwings?.get(actor) ?? 0) + 1;
    const phase = brush ? brushSwingPhase(ordinal) : { yaw: 0, foot: false };
    const forward = flattened(aim);
    const directPitch = clamp(Math.asin(clamp(aim.y, -1, 1)) * 180 / Math.PI, -24, 42);
    const origin = this.physics.castStageSegment(body, muzzle, 'ink-projectile') ? body : muzzle;
    let index = 0;
    for (const group of groups) {
      for (let i = 0; i < group.count; i++) {
        const side = group.count > 1 ? 2 * i / (group.count - 1) - 1 : 0;
        const yaw = phase.yaw + side * group.spread;
        const pitch = (directPitch + group.pitch) * Math.PI / 180;
        const direction = rotateYaw(forward, yaw).mulScalar(Math.cos(pitch));
        direction.y = Math.sin(pitch);
        const speed = group.speed + group.speedVariation *
          Math.sin((this.b367NativeFrame + 1) * 12.9898 + index * 78.233);
        const slot = slots[index++]!;
        this.spawnProjectile(slot, profile, origin, direction, team, speed,
          profile.gravityMetersPerSecond2, profile.lifeSeconds, profile.visualDiameterMeters,
          group.damage, group.paintRadius, 0, 0, 0, 0, 0, 0, 0,
          actor === 'human' ? 'HUMAN' : 'CPU', actor);
      }
    }
    if (brush) (this.brushSwings ??= new Map()).set(actor, ordinal);
    if (phase.foot) this.enqueueF4Foot(body, team, actor, 0.34);
    this.feedback.shot(team, origin, profile, true);
    return true;
  }

  private executeContactTravel(
    profile: WeaponProfile, motion: ContactMotion, team: Team.A | Team.B, actor: string,
    pay: (cost: number, recovery: number) => boolean
  ): boolean {
    const contact = profile.contactWeapon!;
    const settings = contactPaintSettings(contact, motion.distance * 60);
    const cells = collectContactPaint(motion, settings.halfWidth, this.physics, this.surfaces);
    if (!cells || !pay(settings.ink, contact.rollRecovery)) return false;
    for (const hit of cells) {
      this.enqueueF4ContactCell(hit, team, actor);
    }
    this.resolveContactDamage(motion, team, actor, profile);
    return true;
  }

  private enqueueF4ContactCell(hit: SurfaceRayHit, team: Team.A | Team.B, actor: string): void {
    // The raster can select only this independently verified cell.
    const radius = hit.surface.cellSize * 0.72;
    this.enqueueF4Stamp(hit, team, actor, PaintEventType.Foot, {
      radiusU: radius, radiusV: radius, angle: 0
    });
  }

  private resolveContactDamage(
    motion: ContactMotion, team: Team.A | Team.B, actor: string, profile: WeaponProfile
  ): void {
    if (this.b367NativeFrame - (this.contactHitFrames?.get(actor) ?? -60) < 13) return;
    const { contactHalfWidth, contactDamage } = profile.contactWeapon!;
    const start = motion.from.clone().add(new Vec3(0, 0.32, 0));
    const end = motion.to.clone().add(new Vec3(0, 0.32, 0))
      .add(motion.forward.clone().mulScalar(0.53));
    for (const offset of [0, -contactHalfWidth, contactHalfWidth]) {
      const shift = motion.lateral.clone().mulScalar(offset);
      const from = start.clone().add(shift);
      const to = end.clone().add(shift);
      if (offset !== 0 && this.physics.castStageSegment(start, from, 'ink-projectile')) continue;
      const block = this.physics.castStageSegment(from, to, 'ink-projectile');
      const cpu = this.cpuAgents.findNearestCombatHit(from, to, team);
      const human = actor === 'human' ? null : this.findNativeSourceHumanPhysicalHit(from, to, team);
      const limit = (block?.distance ?? Infinity) - GAME_CONFIG.combat.hitPriorityEpsilonMeters;
      if (human && human.distance < Math.min(limit, cpu?.distance ?? Infinity)) {
        const damage = this.resources.applyDamage(contactDamage);
        this.confirmNativeHumanDamage(damage, human.point, team);
        this.recordCpuPlayerDamageHit(damage);
        (this.contactHitFrames ??= new Map()).set(actor, this.b367NativeFrame);
        return;
      }
      if (cpu && cpu.distance < limit) {
        const resolved = this.cpuAgents.applyProjectileHit(cpu, contactDamage,
          actor === 'human' ? 'HUMAN' : 'CPU', actor === 'human' ? undefined : actor);
        this.recordB367RealCpuDamage(resolved, profile.id, cpu.botId, actor === 'human' ? 'HUMAN' : 'CPU');
        if (actor === 'human' && resolved && resolved.realHpLoss > 0 && this.f4PhysicalHitCueOn) {
          this.f4ConfirmedDamageCues++;
          this.feedback.confirmedHumanCpuDamage(team, cpu.point, profile);
        }
        (this.contactHitFrames ??= new Map()).set(actor, this.b367NativeFrame);
        return;
      }
    }
  }

  private updateRoller(
    profile: WeaponProfile,
    fireHeld: boolean,
    risingFire: boolean,
    playerPosition: Vec3,
    paintOrigin: Vec3 | null,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;

    if (risingFire && this.fireCooldown <= 0) {
      if (this.resources.tryConsumeShotInk(profile.inkCost)) {
        const airborne = !this.stats.playerGrounded;
        this.rollerFlick(profile, playerPosition, paintOrigin, direction, team, airborne);
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = airborne ? 'VERTICAL_FLICK' : 'HORIZONTAL_FLICK';
      }
    }

    if (
      fireHeld &&
      this.stats.playerSpeedMetersPerSecond > 0.25 &&
      this.rollPaintCooldown <= 0
    ) {
      if (this.resources.tryConsumeShotInk(profile.rollPaintInkCost)) {
        if(paintOrigin)this.paintWorldStamp(
          team,
          paintOrigin,
          profile.rollPaintRadiusMeters * 1.28,
          profile.rollPaintRadiusMeters * 0.72,
          direction,
          0.8,
          PaintEventType.Foot,PaintSource.Human,undefined,
          paintOrigin?this.sourceHumanMeleeStampOrigin(
            paintOrigin,PaintSource.Human):undefined
        );
        if (this.meleeCooldown <= 0) {
          const contact = playerPosition.clone().add(flattened(direction).mulScalar(0.72));
          this.applyMeleeDamage(contact,0.88,38,team,playerPosition,true);
          this.meleeCooldown = 0.18;
        }
        this.rollPaintCooldown = 0.075;
        this.stats.playerWeaponAction = 'ROLLING';
      }
    }
  }

  private updateBrush(
    profile: WeaponProfile,
    fireHeld: boolean,
    playerPosition: Vec3,
    paintOrigin: Vec3 | null,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (!fireHeld || this.fireCooldown > 0) return;
    if (!this.resources.tryConsumeShotInk(profile.inkCost)) {
      this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      return;
    }

    const forward = flattened(direction);
    const center = playerPosition.clone().add(forward.clone().mulScalar(1.05));
    this.applyMeleeDamage(center,1.22,24,team,playerPosition,true);
    if(paintOrigin)this.paintFan(team, paintOrigin, forward, 1.95, 1.35, 5, 0.42, PaintEventType.Impact);
    this.feedback.melee(team, center, profile, 0.82);
    this.fireCooldown = profile.fireIntervalSeconds;
    this.stats.playerWeaponAction = 'BRUSH_SWIPE';
  }

  private updateSlosher(
    profile: WeaponProfile,
    fireHeld: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (profile.slosher) {
      if (this.pendingSloshes?.has('human')) this.stats.playerWeaponAction = 'SLOSH';
      if (fireHeld && this.fireCooldown <= 1e-8 &&
          this.reserveSlosh(profile, team, 'human', undefined,
            () => this.resources.tryConsumeShotInk(profile.inkCost, profile.slosher!.recoveryLockSeconds))) {
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = 'SLOSH';
      } else if (fireHeld && this.fireCooldown <= 1e-8) {
        this.fireCooldown = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
      return;
    }
    if (!fireHeld || this.fireCooldown > 0) return;

    const lobDirection = direction.clone();
    lobDirection.y = Math.max(lobDirection.y, 0.16);
    lobDirection.normalize();

    if (this.fireProjectiles(profile, origin, lobDirection, team, 1, 0, 0, {
      trailPaintRadius: 0.34
    })) {
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'SLOSH';
    }
  }

  private reserveSlosh(
    profile: WeaponProfile, team: Team.A | Team.B, actor: string,
    request?: CpuFireRequest, pay?: () => boolean
  ): boolean {
    const pending = this.pendingSloshes ??= new Map();
    if (pending.has(actor)) return false;
    const reserved = this.slots.filter(isFreeProjectileSlot).slice(0, SLOSHER_DROPLETS.length);
    if (reserved.length !== SLOSHER_DROPLETS.length) {
      this.stats.projectilePoolDrops++;
      return false;
    }
    if (pay && !pay()) return false;
    for (const slot of reserved) slot.reservedForVolley = true;
    pending.set(actor, { profile, actor, team, firstFrame: this.b367NativeFrame + SLOSHER_LIFT_FRAMES,
      next: 0, reserved, resolvedTargets: new Set(), request });
    return true;
  }

  public cancelHumanSlosh(): void {
    const swing = this.pendingSloshes?.get('human');
    if (swing) this.cancelSlosh(swing);
  }

  private cancelSlosh(swing: SlosherSwing): void {
    for (let i = swing.next; i < swing.reserved.length; i++) swing.reserved[i]!.reservedForVolley = false;
    this.pendingSloshes?.delete(swing.actor);
  }

  private emitPendingSloshes(
    muzzle: Vec3, aim: Vec3, humanBody: Vec3, humanAllowed: boolean, cpuAllowed: boolean
  ): void {
    for (const swing of this.pendingSloshes?.values() ?? []) {
      const request = swing.request;
      const cpuFoot = request && cpuAllowed ? this.cpuAgents.getCommittedMainFoot(request) : null;
      if (request ? !cpuFoot : !humanAllowed || this.playerWeaponId !== swing.profile.id) {
        this.cancelSlosh(swing);
        continue;
      }
      const droplet = SLOSHER_DROPLETS[swing.next]!;
      const frame = swing.firstFrame + droplet.releaseFrame;
      if (this.b367NativeFrame < frame) continue;
      if (this.b367NativeFrame !== frame) {
        this.cancelSlosh(swing);
        continue;
      }

      const grounded = request ? true : this.stats.playerGrounded;
      const origin = cpuFoot
        ? cpuFoot.clone().add(new Vec3(0, GAME_CONFIG.cpu.muzzleHeightMeters, 0)) : muzzle;
      const body = cpuFoot ? cpuFoot.clone().add(new Vec3(0, PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters, 0))
        : humanBody;
      const anchor = new Vec3(body.x, origin.y, body.z);
      const launch = this.clipF4Muzzle(anchor, origin);
      const target = request && this.f4CpuLaunchTarget(request,swing.profile,launch);
      if (request && !target) {
        if (swing.next === 0 && request.sourceInkTransaction)
          this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        this.cancelSlosh(swing);
        continue;
      }
      const direction = target ? aimSlosherHead(launch,target,swing.profile.lifeSeconds) : aim;
      const velocity = slosherVelocity(direction, droplet, grounded);
      const slot = swing.reserved[swing.next]!;
      this.spawnProjectile(slot, swing.profile, launch, velocity, swing.team,
        velocity.length(), droplet.gravity, swing.profile.lifeSeconds,
        swing.profile.visualDiameterMeters * (droplet.head ? 1.38 : 0.85),
        droplet.head ? 70 : 50, 0, 0, 0, 0, 0, 0, 0, 0,
        request ? 'CPU' : 'HUMAN', swing.actor, request?.qaSourceAim);
      slot.slosherFlight = { droplet, resolvedTargets: swing.resolvedTargets, launchY: launch.y, age: 0, distance: 0 };
      if (swing.next++ === 0) {
        if (grounded) this.enqueueF4Foot(body, swing.team, swing.actor, 0.43);
        this.feedback.shot(swing.team, launch, swing.profile, true);
        if (request) this.noteActualSourceCpuPhysicalGrant(request, 1);
      }
      if (swing.next === swing.reserved.length) this.pendingSloshes?.delete(swing.actor);
    }
  }

  private enqueueSlosherMidDrop(slot: ProjectileSlot, from: Vec3, to: Vec3, terminal: number): void {
    const flight = slot.slosherFlight!;
    if (flight.droplet.head || flight.droplet.index !== 2 || flight.distance >= 1.05) return;
    const at = 1.05 - flight.distance;
    if (at >= Math.min(from.distance(to), terminal)) return;
    const point = pointOnSegment(from, to, at);
    const hit = this.castF4Paint(point, point.clone().add(new Vec3(0, -1.05, 0)));
    if (hit && (hit.surface.baseFlags & SurfaceFlags.Wall) === 0) {
      this.enqueueF4Stamp(hit, slot.team, slot.sourceId, PaintEventType.MidDroplet, {
        radiusU: 0.37, radiusV: 0.21,
        angle: Math.atan2(slot.velocity.dot(hit.surface.vAxis), slot.velocity.dot(hit.surface.uAxis))
      });
    }
  }

  private enqueueSlosherWallRunoff(slot: ProjectileSlot, wall: SurfaceRayHit): void {
    const { droplet } = slot.slosherFlight!;
    if (droplet.head || droplet.index !== 2 || (wall.surface.baseFlags & SurfaceFlags.Wall) === 0) return;
    const normal = slot.terrainContactNormal;
    if (!normal) return;
    const exposed = wall.worldPoint.clone().add(normal.clone().mulScalar(0.085));
    const hit = this.castF4Paint(exposed, exposed.clone().add(new Vec3(0, -0.95, 0)));
    if (hit && (hit.surface.baseFlags & SurfaceFlags.Wall) === 0) {
      this.enqueueF4Stamp(hit, slot.team, slot.sourceId, PaintEventType.MidDroplet,
        { radiusU: 0.23, radiusV: 0.19, angle: 0 });
    }
  }

  private updateSplatling(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (this.burstShotsRemaining > 0) {
      const stage = chargeStageProgress(profile, this.splatlingStoredChargeSeconds);
      const speedMultiplier = lerp(0.55, 1.0, stage.first);
      const spread = lerp(1.8, 0.8, stage.first);
      const f4Rotor = profile.shooter !== undefined;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.full
        ? 'SPIN_BURST_R2'
        : stage.firstReached ? 'SPIN_BURST_R1' : 'SPIN_BURST_PARTIAL';

      if (this.burstCooldown <= (f4Rotor ? 1e-8 : 0)) {
        // A committed genuine SOURCE SPLATLING burst must not disappear
        // merely because the finite REAL projectile pool is momentarily
        // full. Wait for an actual free slot without consuming ink,
        // inventing a projectile or accruing catch-up fire cadence.
        // Legacy T20 and other non-B343 modes remain unchanged.
        if ((this.b343SourceVolleyAtomic || f4Rotor) &&
            !this.slots.some(isFreeProjectileSlot)) {
          this.burstCooldown = 0;
          return;
        }
        const launch = f4Rotor ? rotorLaunchProfile(profile, stage.first) : profile;
        if (this.fireProjectiles(launch, origin, direction, team, 1, spread, 0, {
          speedMultiplier: f4Rotor ? 1 : speedMultiplier
        })) {
          this.burstShotsRemaining -= 1;
          this.burstCooldown = f4Rotor ? profile.burstIntervalSeconds :
            this.burstCooldown + profile.burstIntervalSeconds;
          if (this.burstShotsRemaining <= 0) {
            this.splatlingStoredChargeSeconds = 0;
            this.stats.playerWeaponChargeRing = 0;
          }
        } else {
          this.burstShotsRemaining = 0;
          this.splatlingStoredChargeSeconds = 0;
          this.stats.playerWeaponChargeRing = 0;
        }
      }
      return;
    }

    if (fireHeld) {
      const slowCharge = profile.shooter &&
        (!this.stats.playerGrounded || this.stats.playerInk < profile.inkCost);
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt * (slowCharge ? 0.25 : 1));
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.firstReached ? 'SPIN_CHARGE_R2' : 'SPIN_CHARGE_R1';
      return;
    }

    if (fallingFire && this.chargeSeconds >= profile.minChargeSeconds) {
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      const firstRingShots = Math.max(3, Math.round(profile.burstMaxShots * 0.5));
      this.burstShotsRemaining = stage.firstReached
        ? Math.round(lerp(firstRingShots, profile.burstMaxShots, stage.second))
        : Math.max(3, Math.round(firstRingShots * stage.first));
      this.splatlingStoredChargeSeconds = this.chargeSeconds;
      this.burstCooldown = profile.shooter ? 4 / 60 : 0;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.full
        ? 'SPIN_RELEASE_R2'
        : stage.firstReached ? 'SPIN_RELEASE_R1' : 'SPIN_RELEASE_PARTIAL';
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  private updateBrella(
    profile: WeaponProfile,
    fireHeld: boolean,
    guarding: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    this.stats.playerWeaponChargePercent = 0;
    if (guarding) {
      this.stats.playerWeaponAction = this.guardBreakSeconds > 0 ? 'GUARD_BREAK' : 'GUARD';
      return;
    }
    if (!fireHeld || this.fireCooldown > 0) return;

    if (this.fireProjectiles(profile, origin, direction, team, profile.pelletCount, profile.spreadDegrees, 0)) {
      this.fireCooldown = profile.fireIntervalSeconds;
      this.stats.playerWeaponAction = 'BRELLA_BURST';
    }
  }

  private reserveCanopyVolley(profile: WeaponProfile, team: Team.A | Team.B, actor: string,
    request?: CpuFireRequest, pay?: () => boolean
  ): boolean {
    const queued = this.pendingCanopyVolleys ??= new Map();
    if (queued.has(actor) || this.canopies?.lookup(actor)?.phase === 'OPEN') return false;
    const slots = this.slots.filter(isFreeProjectileSlot).slice(0, CANOPY_PELLETS.length);
    if (slots.length !== CANOPY_PELLETS.length) {
      this.stats.projectilePoolDrops++;
      return false;
    }
    if (pay && !pay()) return false;
    for (const slot of slots) slot.reservedForVolley = true;
    queued.set(actor, { profile, team, slots, request, fireAt: this.b367NativeFrame + 10 });
    return true;
  }

  private cancelCanopyVolley(actor: string): void {
    const volley = this.pendingCanopyVolleys?.get(actor);
    if (!volley) return;
    for (const slot of volley.slots) slot.reservedForVolley = false;
    this.pendingCanopyVolleys?.delete(actor);
  }

  public discardF4Canopy(actor: string): void {
    this.cancelCanopyVolley(actor);
    this.canopies?.discard(actor);
  }

  private canopySystem(): F4CanopySystem {
    return this.canopies ??= new F4CanopySystem(this.app,this.physics,
      team => team === Team.A ? this.materialA : this.materialB);
  }

  private emitCanopyVolleys(muzzle: Vec3, aim: Vec3, body: Vec3, humanAllowed: boolean, cpuAllowed: boolean): void {
    for (const [actor, volley] of this.pendingCanopyVolleys ?? []) {
      const { profile, team, request } = volley;
      const foot = request && cpuAllowed ? this.cpuAgents.getCommittedMainFoot(request) : null;
      if (request ? !foot : !humanAllowed || this.playerWeaponId !== profile.id) {
        this.cancelCanopyVolley(actor);
        continue;
      }
      if (this.b367NativeFrame < volley.fireAt) continue;
      const actorBody = foot ? foot.clone().add(new Vec3(0,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,0)) : body;
      const weaponOrigin = foot?.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
      const target = request && weaponOrigin && this.f4CpuLaunchTarget(request,profile,weaponOrigin);
      if (request && !target) {
        if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        this.cancelCanopyVolley(actor);
        continue;
      }
      const cpuAim = target && weaponOrigin ? target.clone().sub(weaponOrigin).normalize() : aim;
      const desiredMuzzle = foot
        ? foot.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0)).add(cpuAim.clone().mulScalar(0.45))
        : muzzle;
      const origin = this.clipF4Muzzle(new Vec3(actorBody.x,desiredMuzzle.y,actorBody.z), desiredMuzzle);
      const acceptedDamage = new Map<string, number>();
      for (const [index, sample] of CANOPY_PELLETS.entries()) {
        const slot = volley.slots[index]!;
        this.spawnProjectile(slot, profile, origin, canopyPelletDirection(cpuAim, sample), team,
          profile.speedMetersPerSecond, profile.gravityMetersPerSecond2, profile.lifeSeconds,
          profile.visualDiameterMeters, profile.damage, sample.paint,
          0,0,0,0,0,0,0, request ? 'CPU' : 'HUMAN', actor, request?.qaSourceAim);
        slot.canopyPellet = { index, frame: 0, free: false, distance: 0, acceptedDamage };
      }
      if (request || this.stats.playerGrounded) this.enqueueF4Foot(actorBody,team,actor,0.50);
      this.feedback.shot(team,origin,profile,true);
      if (request) this.noteActualSourceCpuPhysicalGrant(request,CANOPY_PELLETS.length);
      else this.stats.playerWeaponAction = 'BRELLA_BURST';
      const system = this.canopySystem();
      system.noteShot(system.equip(actor,team), this.b367NativeFrame);
      this.pendingCanopyVolleys?.delete(actor);
    }
  }

  private stepF4Canopies(profile: WeaponProfile, team: Team.A | Team.B, body: Vec3, aim: Vec3,
    hold: boolean, humanAllowed: boolean, cpuAllowed: boolean
  ): void {
    if (profile.canopy) {
      const system = this.canopySystem();
      const canopy = system.equip('human',team);
      const travel = system.step(canopy,this.b367NativeFrame,body,flattened(aim),humanAllowed && hold,
        (cost,lock) => this.resources.tryConsumeContactInk(cost,lock));
      if (cpuAllowed) this.applyCanopyMotion(canopy,travel);
      this.stats.playerWeaponGuarding = canopy.phase === 'OPEN';
      this.stats.playerWeaponGuardHp = canopy.phase === 'PURGED' || canopy.phase === 'REGENERATING'
        ? 0 : canopy.hp;
      if (canopy.phase !== 'CLOSED') this.stats.playerWeaponAction = 'CANOPY_' + canopy.phase;
    }
    this.cpuAgents.forEachF4CanopyOwner?.((actor,cpuTeam,foot,facing,alive,wantsHold) => {
      if (!alive) {
        this.discardF4Canopy(actor);
        this.cpuAgents.setF4CanopyOpen(actor,false);
        return;
      }
      const system = this.canopySystem();
      const canopy = system.equip(actor,cpuTeam);
      const cpuBody = foot.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
      const travel = system.step(canopy,this.b367NativeFrame,cpuBody,flattened(facing),cpuAllowed && wantsHold,
        (cost,lock) => this.cpuAgents.tryConsumeF4CanopyInk(actor,cost,lock));
      if (cpuAllowed) this.applyCanopyMotion(canopy,travel);
      this.cpuAgents.setF4CanopyOpen(actor,canopy.phase === 'OPEN');
    });
  }

  private applyCanopyMotion(canopy: CanopyState, travel: ContactMotion | null): void {
    if (!canopySolid(canopy)) return;
    if (travel) {
      const cells = collectContactPaint(travel,0.72,this.physics,this.surfaces);
      for (const hit of cells ?? []) this.enqueueF4ContactCell(hit,canopy.team,canopy.owner);
    }
    const excluded = new Set([...canopy.lastContact].filter(([,frame]) => this.b367NativeFrame - frame < 30)
      .map(([actor]) => actor));
    const right = new Vec3(canopy.forward.z,0,-canopy.forward.x);
    for (const offset of [0,-0.56,0.56]) {
      const middle = canopy.center.clone().add(right.clone().mulScalar(offset));
      const from = middle.clone().sub(canopy.forward.clone().mulScalar((travel?.distance ?? 0) + CANOPY_HALF.z));
      const to = middle.clone().add(canopy.forward.clone().mulScalar(CANOPY_HALF.z));
      const stage = this.physics.castStageSegment(from,to,'ink-projectile');
      const cpu = this.cpuAgents.findNearestCombatHit(from,to,canopy.team,{radius:0.025,resolvedTargets:excluded});
      const human = excluded.has('human') ? null : this.findNativeSourceHumanPhysicalHit(from,to,canopy.team,0.025);
      const clear = stage?.distance ?? Infinity;
      if (human && human.distance < Math.min(clear,cpu?.distance ?? Infinity)) {
        const hp = this.resources.applyDamage(30);
        this.confirmNativeHumanDamage(hp,human.point,canopy.team);
        this.recordCpuPlayerDamageHit(hp);
        if (hp > 0) {
          canopy.lastContact.set('human',this.b367NativeFrame);
          excluded.add('human');
        }
      } else if (cpu && cpu.distance < clear &&
          (!cpu.targetPoint || !this.physics.castStageSegment(cpu.point,cpu.targetPoint,'ink-projectile'))) {
        const resolved = this.cpuAgents.applyProjectileHit(cpu,30,canopy.owner === 'human' ? 'HUMAN' : 'CPU',canopy.owner);
        if (resolved?.realHpLoss) {
          canopy.lastContact.set(cpu.botId,this.b367NativeFrame);
          excluded.add(cpu.botId);
        }
      }
    }
  }

  public findF4CanopyHit(from: Vec3, to: Vec3, team: Team.A | Team.B, radius = 0): CanopyHit | null {
    return this.canopies?.firstHit(from,to,team,radius) ?? null;
  }

  public createF4CanopyCover(from: Vec3, team: Team.A | Team.B,
    damage: number | ((distance: number) => number)): ((to: Vec3) => boolean) | undefined {
    const system = this.canopies;
    const snapshot = system?.coverSnapshot(team);
    if (!system || !snapshot?.length) return undefined;
    const damaged = new Set<CanopyState>();
    return to => {
      const hit = system.firstHit(from,to,team,0,snapshot);
      if (!hit || hit.distance >= from.distance(to)) return true;
      if (!damaged.has(hit.canopy)) {
        damaged.add(hit.canopy);
        this.damageF4Canopy(hit,typeof damage === 'number' ? damage : damage(hit.distance));
      }
      return false;
    };
  }

  public damageF4Canopy(hit: CanopyHit, damage: number): void {
    if (damage <= 0) return;
    const { canopy } = hit;
    this.canopies?.hit(canopy,damage,this.b367NativeFrame);
    if (canopy.owner === 'human') {
      this.stats.playerWeaponGuardBlocks++;
      this.stats.playerWeaponGuardHp = canopy.phase === 'OPEN' ? canopy.hp : 0;
      this.stats.playerWeaponGuarding = canopy.phase === 'OPEN';
      if (canopy.phase === 'BROKEN') this.stats.playerWeaponAction = 'CANOPY_BROKEN';
    } else {
      this.stats.cpuWeaponGuardBlocks++;
    }
  }

  private enqueueCanopyPelletDrop(slot: ProjectileSlot, from: Vec3, to: Vec3, terminal: number): void {
    const flight = slot.canopyPellet!;
    const sample = CANOPY_PELLETS[flight.index]!;
    if (!sample.mid || flight.distance >= 1.65) return;
    const length = 1.65 - flight.distance;
    if (length >= Math.min(from.distance(to),terminal)) return;
    const point = pointOnSegment(from,to,length);
    const hit = this.castF4Paint(point,point.clone().add(new Vec3(0,-1.9,0)));
    if (!hit || (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0) return;
    const width = sample.group === 0 ? 0.31 : 0.19;
    this.enqueueF4Stamp(hit,slot.team,slot.sourceId,PaintEventType.MidDroplet,{
      radiusU:width*1.65,radiusV:width,
      angle:Math.atan2(slot.velocity.dot(hit.surface.vAxis),slot.velocity.dot(hit.surface.uAxis))
    });
  }

  private canopyPelletBrush(index: number, hit: SurfaceRayHit, velocity: Vec3) {
    const sample = CANOPY_PELLETS[index]!;
    return { centerU:hit.u,centerV:hit.v,
      radiusU:sample.paint*(sample.group===0 ? 1.05 : 1.32),radiusV:sample.paint,
      angle:Math.atan2(velocity.dot(hit.surface.vAxis),velocity.dot(hit.surface.uAxis)) };
  }

  private updateStringer(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    body: Vec3
  ): void {
    const f4 = this.physics.hasF4WholeResearchTrimesh;
    if (fireHeld) {
      this.f4StringerTapPending = false;
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      const stage = chargeStageProgress(profile, this.chargeSeconds);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponChargeRing = stage.full ? 2 : stage.firstReached ? 1 : 0;
      this.stats.playerWeaponAction = stage.firstReached ? 'STRING_CHARGE_R2' : 'STRING_CHARGE_R1';
      return;
    }

    // Releasing early still fires the uncharged volley after its windup.
    if (f4 && (fallingFire || this.f4StringerTapPending) && this.chargeSeconds > 0 &&
        this.chargeSeconds + 1e-8 < profile.minChargeSeconds) {
      this.chargeSeconds = Math.min(profile.minChargeSeconds, this.chargeSeconds + dt);
      this.f4StringerTapPending = this.chargeSeconds + 1e-8 < profile.minChargeSeconds;
      if (this.f4StringerTapPending) return;
      fallingFire = true;
    }

    if (
      fallingFire &&
      this.fireCooldown <= 0 &&
      this.chargeSeconds + (f4 ? 1e-8 : 0) >= profile.minChargeSeconds
    ) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      const shot = stringerVolley(profile, this.chargeSeconds, f4);
      const physicalOrigin = f4 ? this.clipF4Muzzle(new Vec3(body.x, origin.y, body.z), origin) : origin;
      if (this.fireProjectiles(profile, physicalOrigin, direction, team, 3, shot.spread, charge, {
        inkCost: shot.inkCost,
        damageMultiplier: shot.directDamage / profile.damage,
        speedMultiplier: shot.speedMultiplier,
        paintMultiplier: shot.paintMultiplier,
        delayedBurstSeconds: shot.fuseSeconds,
        delayedBurstRadius: shot.burstRadius,
        delayedBurstDamage: shot.burstDamage,
        delayedBurstPaintRadius: shot.burstPaintRadius,
        arrowLayout: f4 ? (this.stats.playerGrounded ? 'horizontal' : 'vertical') : undefined
      })) {
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = shot.stage.full
          ? 'EXPLOSIVE_TRISHOT_R2'
          : shot.stage.firstReached ? 'EXPLOSIVE_TRISHOT_R1' : 'TRISHOT';
      }
    }

    this.chargeSeconds = 0;
    this.f4StringerTapPending = false;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponChargeRing = 0;
  }

  private updateSplatana(
    dt: number,
    profile: WeaponProfile,
    fireHeld: boolean,
    fallingFire: boolean,
    playerPosition: Vec3,
    paintOrigin: Vec3 | null,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B
  ): void {
    if (fireHeld) {
      this.chargeSeconds = Math.min(profile.chargeSeconds, this.chargeSeconds + dt);
      this.stats.playerWeaponChargePercent = chargeFraction(profile, this.chargeSeconds) * 100;
      this.stats.playerWeaponAction = 'SABER_CHARGE';
      return;
    }

    if (fallingFire && this.fireCooldown <= 0) {
      const charge = chargeFraction(profile, this.chargeSeconds);
      if (profile === weaponProfile('ink-saber', true)) {
        const charged = this.chargeSeconds + 1e-8 >= profile.chargeSeconds;
        const timing = F4_SABER_TIMING[charged ? 'charged' : 'horizontal'];
        if (this.reserveSaberSwing(profile, team, direction, charged, undefined,
          () => this.resources.tryConsumeShotInk(timing.ink, F4_SABER_TIMING.recovery))) {
          this.fireCooldown = timing.cooldown;
          this.stats.playerWeaponAction = charged ? 'CHARGED_SLASH' : 'QUICK_SLASH';
        }
        this.chargeSeconds = 0;
        this.stats.playerWeaponChargePercent = 0;
        return;
      }
      if (this.resources.tryConsumeShotInk(profile.inkCost)) {
        const forward = flattened(direction);
        const center = playerPosition.clone().add(forward.clone().mulScalar(charge >= 0.62 ? 1.15 : 0.92));
        const meleeDamage = charge >= 0.62 ? 95 : 42;
        const meleeRadius = charge >= 0.62 ? 1.05 : 0.82;
        this.applyMeleeDamage(center,meleeRadius,meleeDamage,team,playerPosition,true);
        if(paintOrigin)this.paintSlash(team, paintOrigin, forward, charge);

        const slot = this.slots.find(isFreeProjectileSlot);
        if (slot) {
          this.spawnProjectile(
            slot,
            profile,
            origin,
            direction,
            team,
            profile.speedMetersPerSecond * lerp(1, profile.chargeSpeedMultiplier, charge),
            profile.gravityMetersPerSecond2,
            profile.lifeSeconds,
            profile.visualDiameterMeters * lerp(1, 1.55, charge),
            lerp(profile.damage, profile.damage * 1.65, charge),
            profile.paintRadiusMeters * lerp(1, profile.chargePaintMultiplier, charge),
            0,
            0,
            0,
            0,
            0,
            0,
            0
          );
        }

        this.feedback.melee(team, center, profile, charge >= 0.62 ? 1.45 : 0.95);
        this.fireCooldown = profile.fireIntervalSeconds;
        this.stats.playerWeaponAction = charge >= 0.62 ? 'CHARGED_SLASH' : 'QUICK_SLASH';
      }
    }

    this.chargeSeconds = 0;
    this.stats.playerWeaponChargePercent = 0;
  }

  public f4SaberLungeVelocity(): Vec3 | undefined {
    const swing = this.pendingSaberSwings?.get('human');
    if (!swing?.lunge) return;
    const nextFrame = this.b367NativeFrame + 1 - swing.frame;
    if (nextFrame < 4 || nextFrame >= 7) return;
    // Three KCC steps at the existing close-contact scale.
    return flattened(swing.aim).mulScalar(21);
  }

  private reserveSaberSwing(
    profile: WeaponProfile, team: Team.A | Team.B, aim: Vec3, charged: boolean,
    request?: CpuFireRequest, pay?: () => boolean
  ): boolean {
    const actor = request?.sourceId ?? 'human';
    const pending = this.pendingSaberSwings ??= new Map();
    if (pending.has(actor) || aim.lengthSq() < 1e-8) return false;

    const [slash, wave] = this.slots.filter(isFreeProjectileSlot).slice(0, 2);
    if (!slash || !wave) {
      this.stats.projectilePoolDrops++;
      return false;
    }
    if (pay && !pay()) return false;
    slash.reservedForVolley = true;
    wave.reservedForVolley = true;
    pending.set(actor, {
      profile, team, charged, request,
      lunge: !request && charged && this.saberForwardHeld && this.stats.playerGrounded,
      frame: this.b367NativeFrame,
      aim: aim.clone().normalize(), slashEmitted: false, slots: [slash, wave]
    });
    return true;
  }

  private cancelSaberSwing(actor: string): void {
    const swing = this.pendingSaberSwings?.get(actor);
    if (!swing) return;
    if (!swing.slashEmitted) swing.slots[0].reservedForVolley = false;
    swing.slots[1].reservedForVolley = false;
    this.pendingSaberSwings?.delete(actor);
  }

  private emitSaberSwings(muzzle: Vec3, humanBody: Vec3, humanAllowed: boolean, cpuAllowed: boolean): void {
    for (const [actor, swing] of this.pendingSaberSwings ?? []) {
      const request = swing.request;
      const foot = request && cpuAllowed ? this.cpuAgents.getCommittedMainFoot(request) : null;
      if (request ? !foot : !humanAllowed || this.playerWeaponId !== swing.profile.id) {
        this.cancelSaberSwing(actor);
        continue;
      }
      const plan = saberPlan(swing.lunge ? 'LUNGE' : swing.charged ? 'CHARGED' : 'HORIZONTAL');
      const frame = this.b367NativeFrame - swing.frame;
      if (frame !== plan.slashStartF && frame !== plan.projectileStartF) continue;
      const slash = frame === plan.slashStartF;
      const desired = foot ? foot.clone().add(new Vec3(0, GAME_CONFIG.cpu.muzzleHeightMeters, 0)) : muzzle;
      const body = foot ?? humanBody;
      const origin = this.clipF4Muzzle(new Vec3(body.x, desired.y, body.z), desired);
      const profile = swing.profile;
      const slot = swing.slots[slash ? 0 : 1];
      this.spawnProjectile(slot, profile, origin, swing.aim, swing.team,
        slash ? 21 : profile.speedMetersPerSecond * (swing.charged ? profile.chargeSpeedMultiplier : 1),
        slash ? 0 : profile.gravityMetersPerSecond2,
        slash ? plan.slashAliveF / 60 : profile.lifeSeconds, slash ? 0.08 : profile.visualDiameterMeters,
        slash ? plan.slashDamage : plan.projectileDamage, slash ? 0 : profile.paintRadiusMeters,
        0, 0, 0, 0, 0, 0, 0, request ? 'CPU' : 'HUMAN', actor, request?.qaSourceAim);
      slot.saber = {
        component: slash ? 'SLASH' : 'WAVE',
        sweeps: saberSweep(plan, swing.aim, profile.paintRadiusMeters, slash),
        ledger: new Set(), resolvedTargets: new Set(), distance: 0,
        splashSpacing: plan.splashIntervalRaw * profile.paintRadiusMeters / 2.2,
        nextSplashDistance: plan.splashIntervalRaw * profile.paintRadiusMeters / 2.2,
        splashesLeft: slash ? 0 : plan.splashMax,
        paintWidth: profile.paintRadiusMeters * plan.burstPaintRadiusRaw / 2.2
      };
      if (slash) {
        swing.slashEmitted = true;
        this.feedback.melee(swing.team, origin, profile, 1);
        if (request) this.noteActualSourceCpuPhysicalGrant(request, 1);
      } else {
        this.pendingSaberSwings?.delete(actor);
        this.feedback.shot(swing.team, origin, profile, !request);
      }
    }
  }

  private rollerFlick(
    profile: WeaponProfile,
    playerPosition: Vec3,
    paintOrigin: Vec3 | null,
    direction: Vec3,
    team: Team.A | Team.B,
    airborne: boolean
  ): void {
    const forward = flattened(direction);
    const center = playerPosition.clone().add(forward.clone().mulScalar(airborne ? 1.65 : 1.25));
    this.applyMeleeDamage(center,airborne ? 1.05 : 1.55,
      airborne ? 72 : 58,team,playerPosition,true);

    if(paintOrigin&&airborne){
      for (let i = 1; i <= 5; i += 1) {
        const point = paintOrigin.clone().add(forward.clone().mulScalar(i * 0.85));
        this.paintWorldStamp(team, point, 0.48, 0.26, forward, 1.2, PaintEventType.Impact);
      }
    }else if(paintOrigin){
      this.paintFan(team, paintOrigin, forward, 2.9, 2.4, 7, 0.58, PaintEventType.Impact);
    }

    this.feedback.melee(team, center, profile, airborne ? 1.15 : 1.45);
  }

  private fireChargerRay(
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    charge: number
  ): boolean {
    const rail = profile.charger ? railCharge(charge) : null;
    if (!this.resources.tryConsumeShotInk(rail?.inkCost ?? profile.inkCost)) return false;

    const range = rail?.range ?? lerp(11, 30, charge);
    const damage = rail?.damage ?? lerp(profile.damage * 0.72, profile.damage * profile.chargeDamageMultiplier, charge);
    const paintRadius = profile.paintRadiusMeters * lerp(0.72, profile.chargePaintMultiplier, charge);
    const result = this.resolveDirectRay(origin, direction, range, team, damage);

    if (rail) {
      this.enqueueRailTrack(origin, result.point, result.paintHit, team, 'human', rail);
    } else if (result.paintHit) {
      this.enqueueChargerLine(team, result.paintHit, direction, paintRadius, charge);
    }

    this.feedback.beam(team, origin, result.point, profile);
    return true;
  }

  private resolveDirectRay(
    origin: Vec3,
    direction: Vec3,
    range: number,
    team: Team.A | Team.B,
    damage: number
  ): DirectRayResult {
    const rayDirection = direction.clone().normalize();
    const end = origin.clone().add(rayDirection.clone().mulScalar(range));

    const blockerHit = this.physics.castStageSegment(origin, end, 'ink-projectile');
    const paintHit = this.physics.hasF4WholeResearchTrimesh
      ? this.physics.f4PaintAtStageHit(blockerHit,this.surfaces)
      : this.findNearestSurfaceHit(origin, end);
    const qaHit = this.combatTargets.findNearestHit(origin, end, team);
    const cpuHit = this.cpuAgents.findNearestCombatHit(origin, end, team);

    // SOURCE human charger paint never passes a nearer original wall.
    const paintWins=paintHit&&originalSourcePaintBeforeRapier(
      paintHit,blockerHit,!!this.nativeSourceHumanPhysicalMode
    );
    // Genuine SOURCE rays must respect the nearest real stage blocker,
    // independent of the small paint/solid visual priority tolerance.
    const worldDistance = this.nativeSourceHumanPhysicalMode
      ? Math.min(paintHit?.distance??range,
        blockerHit?.distance??range)
      : paintWins
        ? paintHit.distance
        : (blockerHit?.distance??range);

    let combatDistance = Number.POSITIVE_INFINITY;
    let combatKind: 'QA' | 'CPU' | null = null;
    if (qaHit && qaHit.distance < combatDistance) {
      combatDistance = qaHit.distance;
      combatKind = 'QA';
    }
    if (cpuHit && cpuHit.distance < combatDistance) {
      combatDistance = cpuHit.distance;
      combatKind = 'CPU';
    }

    const shield = this.findF4CanopyHit(origin,end,team);
    const device = this.findF4ProjectileObjectContact(origin,end,team);
    if (device && device.distance < Math.min(worldDistance,combatDistance,shield?.distance??Infinity)) {
      device.damage(damage);
      return {point:pointOnSegment(origin,end,device.distance),paintHit:null,hitCombat:false};
    }
    if (shield && shield.distance < worldDistance && shield.distance <= combatDistance) {
      this.damageF4Canopy(shield,damage);
      return { point: shield.point, paintHit: null, hitCombat: false };
    }

    if (
      combatKind &&
      combatDistance + GAME_CONFIG.combat.hitPriorityEpsilonMeters < worldDistance
    ) {
      if (combatKind === 'QA' && qaHit) this.combatTargets.applyProjectileHit(qaHit, damage);
      if (combatKind === 'CPU' && cpuHit) {
        const beforeHit=this.stats.humanCpuDirectHits;
        const resolved=this.cpuAgents.applyProjectileHit(cpuHit,damage,'HUMAN');
        // Native CHARGER uses a physical collision-ordered ray, not a
        // projectile slot. Record only its REAL post-shield HP outcome.
        this.recordB367RealCpuDamage(resolved,
         this.currentPlayerWeapon.id,cpuHit.botId,'HUMAN');
        // Confirmed physical HP reduction, not a ray overlap, owns the cue.
        const originalConfirmedCue=b351RealCpuDamageCue(
         this.b351CueOn,'HUMAN',this.currentPlayerWeapon.id,
         beforeHit,this.stats.humanCpuDirectHits,this.b367SelectedRealLoadout);
        if(resolved!==null&&resolved.realHpLoss>0&&!resolved.shieldAbsorbed&&
           resolved.botId===cpuHit.botId&&resolved.sourceKind==='HUMAN'&&
           (originalConfirmedCue||this.f4PhysicalHitCueOn)){
          if(originalConfirmedCue)this.b351TrueDamageCues++;
          if(this.f4PhysicalHitCueOn)this.f4ConfirmedDamageCues++;
          this.feedback.confirmedHumanCpuDamage(team,cpuHit.point,
           this.currentPlayerWeapon);
        }
      }
      return {
        point: origin.clone().add(rayDirection.mulScalar(combatDistance)),
        paintHit: null,
        hitCombat: true
      };
    }

    if (paintWins && paintHit) {
      return { point: paintHit.worldPoint.clone(), paintHit, hitCombat: false };
    }

    if (blockerHit) {
      return { point: blockerHit.point.clone(), paintHit: null, hitCombat: false };
    }

    return { point: end, paintHit: null, hitCombat: false };
  }

  private enqueueChargerLine(
    team: Team.A | Team.B,
    hit: SurfaceRayHit,
    direction: Vec3,
    radius: number,
    charge: number,
    source: PaintSource = PaintSource.Human,
    actorId?: string
  ): void {
    const uDir = direction.dot(hit.surface.uAxis);
    const vDir = direction.dot(hit.surface.vAxis);
    const mag = Math.hypot(uDir, vDir);
    const normalizedU = mag > 1e-5 ? uDir / mag : 1;
    const normalizedV = mag > 1e-5 ? vDir / mag : 0;
    const length = lerp(1.4, 4.2, charge);

    this.coordinator.enqueue({
      source,
      actorId,
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u - normalizedU * length * 0.42,
      centerV: hit.v - normalizedV * length * 0.42,
      radiusU: length * 0.52,
      radiusV: radius * 0.46,
      angle: Math.atan2(normalizedV, normalizedU),
      type: (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0
        ? PaintEventType.WallImpact
        : PaintEventType.Impact,
      strength: 1
    });
  }

  private enqueueRailTrack(
    origin: Vec3, endpoint: Vec3, impact: SurfaceRayHit | null, team: Team.A | Team.B,
    actor: string, rail: ReturnType<typeof railCharge>
  ): void {
    const axis = endpoint.clone().sub(origin);
    const length = axis.length();
    if (length <= 1e-8) return;
    axis.mulScalar(1 / length);
    for (let d = rail.depth * 0.55; d < length; d += rail.spacing) {
      const point = origin.clone().add(axis.clone().mulScalar(d));
      const hit = this.castF4Paint(point, new Vec3(point.x, point.y - 1.8, point.z));
      if (!hit) continue;
      const angle = Math.atan2(axis.dot(hit.surface.vAxis), axis.dot(hit.surface.uAxis));
      this.enqueueF4Stamp(hit, team, actor, PaintEventType.MidDroplet, {
        radiusU: Math.min(rail.depth, d, length - d), radiusV: rail.width, angle
      });
    }
    if (impact) {
      const type = impact.surface.baseFlags & SurfaceFlags.Wall ? PaintEventType.WallImpact : PaintEventType.Impact;
      this.enqueueF4Stamp(impact, team, actor, type, {
        radiusU: rail.impact, radiusV: rail.impact, angle: 0
      });
      if (actor !== 'human') this.stats.cpuProjectilePaintHits += 1;
    }
  }

  private fireProjectiles(
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    count: number,
    spreadDegrees: number,
    charge: number,
    options?: {
      trailPaintRadius?: number;
      delayedBurstSeconds?: number;
      delayedBurstRadius?: number;
      delayedBurstDamage?: number;
      delayedBurstPaintRadius?: number;
      inkCost?: number;
      damageMultiplier?: number;
      speedMultiplier?: number;
      paintMultiplier?: number;
      arrowLayout?: 'horizontal' | 'vertical';
    }
  ): boolean {
    // B343 SOURCE QA: reject a real all-or-nothing volley before ink spend
    // when insufficient physical slots exist. No fabricated paint/shots.
    if(this.b343SourceVolleyAtomic || profile.shooter || profile.blaster || options?.arrowLayout){
      const available=this.slots.filter(isFreeProjectileSlot).length;
      if(!b343CanLaunchSourceVolley(available,count)){
        this.b343RejectedVolleys++;
        return false;
      }
    }
    if (!this.resources.tryConsumeShotInk(
      options?.inkCost ?? profile.inkCost,
      profile.shooter?.recoveryLockSeconds ?? profile.blaster?.recoveryLockSeconds
    )) return false;

    const damageMultiplier = options?.damageMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.72, profile.chargeDamageMultiplier, charge)
        : 1);
    const speedMultiplier = options?.speedMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.88, profile.chargeSpeedMultiplier, charge)
        : 1);
    const paintMultiplier = options?.paintMultiplier ??
      (profile.weaponClass === 'STRINGER'
        ? lerp(0.78, profile.chargePaintMultiplier, charge)
        : 1);

    let spawned = 0;
    for (let i = 0; i < count; i += 1) {
      const slot = this.slots.find((candidate) => isFreeProjectileSlot(candidate));
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        break;
      }

      const offset =
        count <= 1
          ? 0
          : (i / (count - 1) - 0.5) * spreadDegrees;
      const arrow = options?.arrowLayout && stringerArrow(origin, direction, i, spreadDegrees, options.arrowLayout);
      const shotDirection = arrow ? arrow.direction : rotateYaw(direction, offset);

      this.spawnProjectile(
        slot,
        profile,
        arrow ? this.clipF4Muzzle(origin, arrow.origin) : origin,
        shotDirection,
        team,
        profile.speedMetersPerSecond * speedMultiplier,
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * (1 + charge * 0.18),
        profile.damage * damageMultiplier,
        profile.paintRadiusMeters * paintMultiplier,
        profile.blastRadiusMeters,
        profile.blastDamage,
        options?.trailPaintRadius ?? 0,
        options?.delayedBurstSeconds ?? 0,
        options?.delayedBurstRadius ?? 0,
        options?.delayedBurstDamage ?? 0,
        options?.delayedBurstPaintRadius ?? 0
      );
      spawned += 1;
    }

    if (spawned > 0) {
      this.feedback.shot(team, origin, profile, true);
      return true;
    }
    return false;
  }

  private spawnQueuedCpuShots(
    humanTeam: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean,
    guarding: boolean,
    playerAimDirection: Vec3
  ): void {
    if (this.queuedCpuShots.length === 0) return;

    // SOURCE-only: roster order alone starves later actors when just one
    // physical slot is free. Rotating by THIS TICK's request-array index
    // also starves B1 for alternating [A1,B1] / [B1,B2] contenders.
    // A real successful physical launch advances that actor to the back.
    // An unlaunched (pool-full, invalid or stale-life) shot keeps priority.
    // A single real shot also counts, so a subsequent multi-CPU volley
    // cannot be monopolized by the actor that just fired alone.
    const fairSource=this.sourceCpuFairVolleyDispatch&&
      this.queuedCpuShots.every(req=>req.sourceInkTransaction!==undefined);
    const ordered=fairSource&&this.queuedCpuShots.length>1?
      [...this.queuedCpuShots].sort((a,b)=>
        (this.sourceCpuLastPhysicalGrant.get(a.sourceId)??0)-
        (this.sourceCpuLastPhysicalGrant.get(b.sourceId)??0))
      :this.queuedCpuShots;

    for (const request of ordered) {
      // CPU requests were paid in CpuAgentSystem.fixedUpdate. Human CHARGER
      // hitscan resolves earlier in THIS ProjectileSystem.fixedUpdate; a
      // newly splatted CPU must not fire its pre-queued original SOURCE
      // shot after death. This SOURCE-only check leaves normal T20 intact.
      if(request.sourceInkTransaction&&
         !this.cpuAgents.approveQueuedSourceCpuMainShotAtLaunch(request))
        continue;
      const profile = weaponProfile(request.weaponId, this.physics?.hasF4WholeResearchTrimesh);

      if (profile.canopy) {
        if (!this.reserveCanopyVolley(profile, request.team, request.sourceId, request) && request.sourceInkTransaction)
          this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        continue;
      }
      if (profile.slosher) {
        if (!this.reserveSlosh(profile, request.team, request.sourceId, request) && request.sourceInkTransaction) {
          this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        }
        continue;
      }

      if (profile.twinComets) {
        const target = this.f4CpuLaunchTarget(request,profile,request.origin);
        if (!target) {
          if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
          continue;
        }
        const forward = new Vec3().sub2(target, request.origin).normalize();
        const body = request.bodyPosition.clone().add(new Vec3(0, PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters, 0));
        const muzzle = request.origin.clone().add(flattened(forward).mulScalar(0.47));
        const launched = this.launchTwinComets(profile, {
          muzzle, body, forward, target, grounded: true, focused: false
        }, request.team, request.sourceId, undefined, request.qaSourceAim);
        if (launched) this.noteActualSourceCpuPhysicalGrant(request, 1);
        else if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        continue;
      }

      if (profile.weaponClass === 'CHARGER') {
        this.fireCpuChargerRay(
          request,
          profile,
          humanTeam,
          playerPosition,
          playerDamageable,
          guarding,
          playerAimDirection
        );
        continue;
      }

      if (request.action === 'ROLLER_FLICK') {
        this.executeCpuRollerFlick(request, profile);
        continue;
      }
      if (request.action === 'ROLLER_ROLL') {
        this.executeCpuRollerRoll(request, profile);
        continue;
      }
      if (request.action === 'BRUSH_SWIPE') {
        this.executeCpuBrushSwipe(request, profile);
        continue;
      }
      if (request.action === 'STRINGER_RELEASE') {
        this.executeCpuStringerRelease(request, profile);
        continue;
      }
      if (request.action === 'SPLATANA_RELEASE') {
        if (profile !== weaponProfile('ink-saber', true)) {
          this.executeCpuSplatanaRelease(request, profile);
        } else {
          const aim = request.target.clone().sub(request.origin).normalize();
          if (!this.reserveSaberSwing(profile, request.team, aim, request.charge >= 1, request)) {
            this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
          }
        }
        continue;
      }

      const target = this.f4CpuLaunchTarget(request,profile,request.origin);
      if (!target) {
        if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        continue;
      }
      this.solveLaunchDirection(request.origin,target,this.cpuAimDirection,profile);
      if (this.cpuAimDirection.lengthSq() <= 1e-8){
        if(request.sourceInkTransaction)
          this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        continue;
      }

      let direction = this.cpuAimDirection.clone();
      let count = 1;
      let spread = 0;
      let trailPaintRadius = 0;
      let speedMultiplier = 1;

      if (profile.weaponClass === 'DUALIES') {
        count = 2;
        spread = profile.spreadDegrees;
      } else if (
        profile.weaponClass === 'BRELLA' ||
        request.action === 'BRELLA_BURST'
      ) {
        count = profile.pelletCount;
        spread = profile.spreadDegrees;
      } else if (profile.weaponClass === 'SLOSHER') {
        // Preserve the solved ballistic direction to an audited SOURCE
        // floor. Raising it after solving overshoots nearby floor patches.
        // Ordinary combat, legacy CPU shots and human sloshes keep their lob.
        if(!request.sourceFloorPaint){
          direction.y = Math.max(direction.y, 0.16);
          direction.normalize();
        }
        trailPaintRadius = 0.34;
      } else if (profile.weaponClass === 'SPLATLING') {
        spread = 0.8;
        speedMultiplier = 1.0;
      }

      // Native SOURCE 7-CPU volley is paid before human-first physics
      // execution. Reject the ENTIRE volley when fewer physical slots
      // remain: never charge a paid dualies/brella attack for 0 or
      // partially spawned projectiles. Real HUMAN gets first access.
      if(request.sourceInkTransaction&&
         this.slots.filter(isFreeProjectileSlot).length<count){
        this.stats.projectilePoolDrops+=1;
        this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
        continue;
      }
      let spawned = 0;
      for (let i = 0; i < count; i += 1) {
        const slot = this.slots.find(isFreeProjectileSlot);
        if (!slot) {
          this.stats.projectilePoolDrops += 1;
          break;
        }

        const offset =
          count <= 1
            ? 0
            : (i / (count - 1) - 0.5) * spread;
        const shotDirection = rotateYaw(direction, offset);

        this.spawnProjectile(
          slot,
          profile,
          request.origin,
          shotDirection,
          request.team,
          profile.speedMetersPerSecond * speedMultiplier,
          profile.gravityMetersPerSecond2,
          profile.lifeSeconds,
          profile.visualDiameterMeters,
          profile.damage,
          profile.paintRadiusMeters,
          profile.blastRadiusMeters,
          profile.blastDamage,
          trailPaintRadius,
          0,
          0,
          0,
          0,
          'CPU',
          request.sourceId,
          request.qaSourceAim
        );
        spawned += 1;
      }

      if (spawned > 0) {
        this.noteActualSourceCpuPhysicalGrant(request,spawned);
        if (profile.shooter || profile.blaster) {
          const foot = request.bodyPosition;
          const body = new Vec3(foot.x, foot.y + PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters, foot.z);
          if (profile.shooter) {
            this.enqueueShooterFoot(profile.shooter, body, request.team, request.sourceId);
          } else if (profile.blaster) {
            this.enqueueF4Foot(body, request.team, request.sourceId, profile.blaster.footRadius);
          }
        }
        this.feedback.shot(request.team, request.origin, profile, false);
      }
    }

    this.queuedCpuShots.length = 0;
  }

  /** Only completed physical projectile allocation changes SOURCE priority.
   * Never grant a turn to a rejected volley or a hitscan/paint-only effect. */
  private noteActualSourceCpuPhysicalGrant(
    request:CpuFireRequest,spawned:number
  ):void{
    if(!this.sourceCpuFairVolleyDispatch||
       !request.sourceInkTransaction||spawned<=0)return;
    this.sourceCpuLastPhysicalGrant.set(
      request.sourceId,++this.sourceCpuPhysicalGrantSerial);
  }

  private executeCpuRollerFlick(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    if (profile.contactWeapon) {
      this.executeCpuContactSwing(request, profile);
      return;
    }
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(1.25));

    this.applyMeleeDamage(center,1.55,58,request.team,request.origin);
    const originalFoot=request.sourceInkTransaction?
      this.sourceOriginalCpuMeleePaintFoot(request.bodyPosition):null;
    if(!request.sourceInkTransaction||originalFoot)this.paintFan(
      request.team,
      request.bodyPosition,
      forward,
      2.9,
      2.4,
      7,
      0.58,
      PaintEventType.Impact,
      PaintSource.Cpu,
      request.sourceId,
      originalFoot??undefined
    );
    this.feedback.melee(request.team, center, profile, 1.45);
  }

  private executeCpuRollerRoll(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    if (profile.contactWeapon) {
      const motion = request.groundTravel && contactMotion(request.groundTravel);
      const paid = motion && this.executeContactTravel(profile, motion, request.team, request.sourceId,
        (cost, recovery) => this.cpuAgents.tryConsumeF4ContactInk(request, cost, recovery));
      if (!paid) this.cpuAgents.endF4ContactTravel(request.sourceId);
      return;
    }
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const originalFoot=request.sourceInkTransaction?
      this.sourceOriginalCpuMeleePaintFoot(request.bodyPosition):null;
    if(!request.sourceInkTransaction||originalFoot)this.paintWorldStamp(
      request.team,
      request.bodyPosition,
      profile.rollPaintRadiusMeters * 1.28,
      profile.rollPaintRadiusMeters * 0.72,
      forward,
      0.8,
      PaintEventType.Foot,
      PaintSource.Cpu,
      request.sourceId,
      originalFoot??undefined
    );
    const contact = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(0.72));
    this.applyMeleeDamage(contact,0.88,38,request.team,request.origin);
  }

  private executeCpuBrushSwipe(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    if (profile.contactWeapon) {
      this.executeCpuContactSwing(request, profile);
      return;
    }
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone()
      .add(forward.clone().mulScalar(1.05));

    this.applyMeleeDamage(center,1.22,24,request.team,request.origin);
    const originalFoot=request.sourceInkTransaction?
      this.sourceOriginalCpuMeleePaintFoot(request.bodyPosition):null;
    if(!request.sourceInkTransaction||originalFoot)this.paintFan(
      request.team,
      request.bodyPosition,
      forward,
      1.95,
      1.35,
      5,
      0.42,
      PaintEventType.Impact,
      PaintSource.Cpu,
      request.sourceId,
      originalFoot??undefined
    );
    this.feedback.melee(request.team, center, profile, 0.82);
  }

  private executeCpuContactSwing(request: CpuFireRequest, profile: WeaponProfile): void {
    const aim = new Vec3().sub2(request.target, request.origin).normalize();
    const body = request.bodyPosition.clone().add(new Vec3(0, PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters, 0));
    if (!this.launchContactSwing(profile, request.origin, body, aim,
      request.team, request.sourceId, false)) {
      this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
    }
  }

  private f4CpuLaunchTarget(request: CpuFireRequest, profile: WeaponProfile, origin: Vec3): Vec3 | null {
    if (!request.f4Opponent || !(profile.shooter || profile.arrowFlight || profile.blaster || profile.slosher || profile.canopy))
      return request.target;
    const flight = profile.shooter ?? profile.arrowFlight ?? profile.blaster ??
      (profile.canopy ? F4_CANOPY_PELLET_FLIGHT : undefined);
    const dt = 1 / SHOOTER_HZ;
    return this.cpuAgents.aimF4ShotAtLaunch(request,origin,cpuWeaponRangeMeters(profile), target => {
      let start = origin;
      let direction: Vec3;
      const slosherHead = profile.slosher ? SLOSHER_DROPLETS[0]! : null;
      if (profile.twinComets) {
        const forward = target.clone().sub(origin).normalize();
        const muzzle = request.origin.clone().add(flattened(forward).mulScalar(.47));
        const body = request.bodyPosition.clone().add(new Vec3(0,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,0));
        const shot = this.planTwinCometsLaunch(profile,{muzzle,body,forward,target,grounded:true,focused:false},
          request.sourceId,this.twinCometsOrdinal(request.sourceId));
        if (shot.blockedPoint) return null;
        start = shot.origin;
        direction = shot.direction;
      } else if (profile.canopy) {
        const aim = target.clone().sub(origin).normalize();
        start = this.clipF4Muzzle(origin,origin.clone().add(aim.clone().mulScalar(.45)));
        direction = canopyPelletDirection(aim,CANOPY_PELLETS[0]!);
      } else direction = slosherHead ? aimSlosherHead(start,target,profile.lifeSeconds)
        : this.solveLaunchDirection(start,target,new Vec3(),profile);
      const velocity = slosherHead ? slosherVelocity(direction,slosherHead,true)
        : direction.mulScalar(profile.speedMetersPerSecond);
      const step = new Vec3();
      const state = {frame:0,free:false};
      return f4FlightArrivalTicks(start,target,profile.lifeSeconds,frame => {
        if (slosherHead) stepSlosherFlight(step,velocity,slosherHead,frame,dt);
        else if (flight) {
          advanceShooterVelocity(velocity,state,flight);
          step.copy(velocity).mulScalar(dt);
        }
        return step;
      });
    });
  }

  private executeCpuStringerRelease(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const charge = clamp(request.charge, 0, 1);
    const f4 = Boolean(this.physics?.hasF4WholeResearchTrimesh);
    const shot = stringerVolley(profile, charge * profile.chargeSeconds, f4);
    const launch = f4 ? { ...profile, speedMetersPerSecond: profile.speedMetersPerSecond * shot.speedMultiplier } : profile;
    const target = this.f4CpuLaunchTarget(request,launch,request.origin);
    if (!target) {
      if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
      return;
    }
    this.solveLaunchDirection(request.origin,target,this.cpuAimDirection,launch);
    if (this.cpuAimDirection.lengthSq() <= 1e-8) {
      // A paid SOURCE stringer without a valid physical launch vector
      // releases no original projectile and may not consume native ink.
      if(request.sourceInkTransaction)
        this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
      return;
    }

    // One real STRINGER volley always requires three existing physical
    // projectile slots. Do not emit a truncated charged three-arrow
    // pattern while charging full CPU ink for a partial volley.
    if((request.sourceInkTransaction || f4)&&
       this.slots.filter(isFreeProjectileSlot).length<3){
      this.stats.projectilePoolDrops+=1;
      if (request.sourceInkTransaction) this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
      return;
    }
    let spawned = 0;
    for (let i = 0; i < 3; i += 1) {
      const slot = this.slots.find(isFreeProjectileSlot);
      if (!slot) {
        this.stats.projectilePoolDrops += 1;
        break;
      }

      const arrow = f4 && stringerArrow(request.origin, this.cpuAimDirection, i, shot.spread, 'horizontal');
      const direction = arrow ? arrow.direction : rotateYaw(this.cpuAimDirection, (i / 2 - 0.5) * shot.spread);
      this.spawnProjectile(
        slot,
        profile,
        arrow ? this.clipF4Muzzle(request.origin, arrow.origin) : request.origin,
        direction,
        request.team,
        profile.speedMetersPerSecond * shot.speedMultiplier,
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * (1 + charge * 0.18),
        shot.directDamage,
        profile.paintRadiusMeters * shot.paintMultiplier,
        0,
        0,
        0,
        shot.fuseSeconds,
        shot.burstRadius,
        shot.burstDamage,
        shot.burstPaintRadius,
        'CPU',
        request.sourceId
      );
      spawned += 1;
    }

    if (spawned > 0) {
      this.noteActualSourceCpuPhysicalGrant(request,spawned);
      this.feedback.shot(request.team, request.origin, profile, false);
    }
  }

  private executeCpuSplatanaRelease(
    request: CpuFireRequest,
    profile: WeaponProfile
  ): void {
    const charge = clamp(request.charge, 0, 1);
    const forward = flattened(
      request.target.clone().sub(request.bodyPosition)
    );
    const center = request.bodyPosition.clone().add(
      forward.clone().mulScalar(charge >= 0.62 ? 1.15 : 0.92)
    );
    const meleeDamage = charge >= 0.62 ? 95 : 42;
    const meleeRadius = charge >= 0.62 ? 1.05 : 0.82;

    this.applyMeleeDamage(
      center,
      meleeRadius,
      meleeDamage,
      request.team,
      request.origin
    );
    const originalFoot=request.sourceInkTransaction?
      this.sourceOriginalCpuMeleePaintFoot(request.bodyPosition):null;
    if(!request.sourceInkTransaction||originalFoot)this.paintSlash(
      request.team,
      request.bodyPosition,
      forward,
      charge,
      PaintSource.Cpu,
      request.sourceId,
      originalFoot??undefined
    );

    this.solveLaunchDirection(
      request.origin,
      request.target,
      this.cpuAimDirection,
      profile
    );
    const slot = this.slots.find(isFreeProjectileSlot);
    if (slot && this.cpuAimDirection.lengthSq() > 1e-8) {
      this.spawnProjectile(
        slot,
        profile,
        request.origin,
        this.cpuAimDirection,
        request.team,
        profile.speedMetersPerSecond *
          lerp(1, profile.chargeSpeedMultiplier, charge),
        profile.gravityMetersPerSecond2,
        profile.lifeSeconds,
        profile.visualDiameterMeters * lerp(1, 1.55, charge),
        lerp(profile.damage, profile.damage * 1.65, charge),
        profile.paintRadiusMeters *
          lerp(1, profile.chargePaintMultiplier, charge),
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        'CPU',
        request.sourceId
      );
    } else if (!slot) {
      this.stats.projectilePoolDrops += 1;
    }

    this.feedback.melee(
      request.team,
      center,
      profile,
      charge >= 0.62 ? 1.45 : 0.95
    );
  }

  private fireCpuChargerRay(
    request: CpuFireRequest,
    profile: WeaponProfile,
    humanTeam: Team.A | Team.B,
    playerPosition: Vec3,
    playerDamageable: boolean,
    guarding: boolean,
    playerAimDirection: Vec3
  ): void {
    const direction = request.target.clone().sub(request.origin);
    if (direction.lengthSq() <= 1e-8) {
      // The actual CPU charger ray cannot paint or deal damage when
      // origin and target coincide. Return SOURCE-only precharged ink.
      if(request.sourceInkTransaction)
        this.cpuAgents.rollbackUndeliveredSourceCpuMainShot(request);
      return;
    }
    direction.normalize();

    const charge = Math.max(0, Math.min(1, request.charge));
    const rail = profile.charger ? railCharge(charge) : null;
    const range = rail?.range ?? lerp(11, 30, charge);
    const damage = rail?.damage ?? lerp(
      profile.damage * 0.72,
      profile.damage * profile.chargeDamageMultiplier,
      charge
    );
    const paintRadius =
      profile.paintRadiusMeters *
      lerp(0.72, profile.chargePaintMultiplier, charge);
    const end = request.origin.clone().add(direction.clone().mulScalar(range));

    const blockerHit = this.physics.castStageSegment(
      request.origin,
      end,
      'ink-projectile'
    );
    const paintHit = this.physics.hasF4WholeResearchTrimesh
      ? this.physics.f4PaintAtStageHit(blockerHit,this.surfaces)
      : this.findNearestSurfaceHit(request.origin, end);
    const cpuHit = this.cpuAgents.findNearestCombatHit(
      request.origin,
      end,
      request.team
    );
    // The genuine SOURCE CPU CHARGER must not fall back to the old
    // single ball while MAIN and SUB are physical-capsule accurate.
    // Same team, live HP, actual KCC body and ORIGINAL cover apply.
    const playerHitDistance = (
      playerDamageable &&
      request.team !== humanTeam &&
      (!this.nativeSourceHumanPhysicalMode||this.resources.currentHp>0)
    )
      ? (this.nativeSourceHumanPhysicalMode
        ? this.findNativeSourceHumanPhysicalHit(
            request.origin,end,request.team)?.distance??null
        : segmentSphereDistance(
            request.origin,end,playerPosition,
            GAME_CONFIG.cpu.playerHitRadiusMeters))
      : null;

    // SOURCE CPU charger paint obeys the same physical wall-first gate.
    const paintWins=paintHit&&originalSourcePaintBeforeRapier(
      paintHit,blockerHit,!!this.nativeSourceHumanPhysicalMode
    );
    // Genuine SOURCE rays must respect the nearest real stage blocker,
    // independent of the small paint/solid visual priority tolerance.
    const worldDistance = this.nativeSourceHumanPhysicalMode
      ? Math.min(paintHit?.distance??range,
        blockerHit?.distance??range)
      : paintWins
        ? paintHit.distance
        : (blockerHit?.distance??range);

    let combatDistance = Number.POSITIVE_INFINITY;
    let combatKind: 'CPU' | 'PLAYER' | null = null;
    if (cpuHit && cpuHit.distance < combatDistance) {
      combatDistance = cpuHit.distance;
      combatKind = 'CPU';
    }
    if (
      playerHitDistance !== null &&
      playerHitDistance < combatDistance
    ) {
      combatDistance = playerHitDistance;
      combatKind = 'PLAYER';
    }

    let endPoint = end;
    let linePaintHit: SurfaceRayHit | null = null;

    const shield = this.findF4CanopyHit(request.origin,end,request.team);
    const device = this.findF4ProjectileObjectContact(request.origin,end,request.team);
    if (device && device.distance < Math.min(worldDistance,combatDistance,shield?.distance??Infinity)) {
      device.damage(damage);
      endPoint = pointOnSegment(request.origin,end,device.distance);
    } else if (shield && shield.distance < worldDistance && shield.distance <= combatDistance) {
      endPoint = shield.point;
      this.damageF4Canopy(shield,damage);
    } else if (
      combatKind &&
      combatDistance +
        GAME_CONFIG.combat.hitPriorityEpsilonMeters <
        worldDistance
    ) {
      endPoint = pointOnSegment(
        request.origin,
        end,
        combatDistance
      );
      if (combatKind === 'CPU' && cpuHit) {
        this.cpuAgents.applyProjectileHit(cpuHit,damage,'CPU',request.sourceId);
      } else if (combatKind === 'PLAYER') {
        if (
          guarding &&
          (this.nativeSourceHumanPhysicalMode!==null
            ? this.isNativeSourceGuardBlockingIncoming(
                direction,endPoint,playerPosition,playerAimDirection)
            : this.isGuardBlockingPoint(
                request.origin,playerPosition,playerAimDirection))
        ) {
          this.guardHp = Math.max(0, this.guardHp - damage);
          this.stats.playerWeaponGuardBlocks += 1;
          this.stats.playerWeaponGuardHp = this.guardHp;
          if (this.guardHp <= 0) {
            this.guardBreakSeconds = 2.5;
            this.guardEntity.enabled = false;
            this.stats.playerWeaponAction = 'GUARD_BREAK';
          }
        } else {
          const hpLoss=this.resources.applyDamage(damage);
          this.confirmNativeHumanDamage(hpLoss,endPoint,request.team);
          this.recordCpuPlayerDamageHit(hpLoss);
        }
      }
    } else if (paintWins && paintHit) {
      endPoint = paintHit.worldPoint.clone();
      linePaintHit = paintHit;
    } else if (blockerHit) {
      endPoint = blockerHit.point.clone();
    }

    if (rail) {
      this.enqueueRailTrack(request.origin, endPoint, linePaintHit, request.team, request.sourceId, rail);
    } else if (linePaintHit) {
      this.enqueueChargerLine(
        request.team,
        linePaintHit,
        direction,
        paintRadius,
        charge,
        PaintSource.Cpu,
        request.sourceId
      );
    }

    this.feedback.beam(
      request.team,
      request.origin,
      endPoint,
      profile
    );
  }

  private spawnProjectile(
    slot: ProjectileSlot,
    profile: WeaponProfile,
    origin: Vec3,
    direction: Vec3,
    team: Team.A | Team.B,
    speed: number,
    gravity: number,
    life: number,
    visualDiameter: number,
    damage: number,
    paintRadius: number,
    blastRadius: number,
    blastDamage: number,
    trailPaintRadius: number,
    delayedBurstSeconds: number,
    delayedBurstRadius: number,
    delayedBurstDamage: number,
    delayedBurstPaintRadius: number,
    sourceKind: 'HUMAN' | 'CPU' = 'HUMAN',
    sourceId = 'human',
    qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK',
    explicitShooterAim = false,
    f4Special = false
  ): void {
    slot.f4Special = undefined;
    slot.active = true;
    slot.reservedForVolley = false;
    slot.slosherFlight = undefined;
    slot.canopyPellet = undefined;
    slot.ttl = life;
    slot.team = team;
    slot.sourceKind = sourceKind;
    slot.sourceId = sourceId;
    slot.qaSourceAim=sourceKind==='CPU'&&sourceId==='A1'?
      qaSourceAim:undefined;
    if(slot.qaSourceAim==='A1_ORIGINAL_ALLY_SUPPORT_INK')
      this.b152OriginalAllyAimProjectilesSpawned++;
    slot.weaponId = profile.id;
    slot.gravity = gravity;
    slot.damage = damage;
    slot.paintRadius = paintRadius;
    slot.blastRadius = blastRadius;
    slot.blastDamage = blastDamage;
    slot.delayedBurstSeconds = delayedBurstSeconds;
    slot.delayedBurstRadius = delayedBurstRadius;
    slot.delayedBurstDamage = delayedBurstDamage;
    slot.delayedBurstPaintRadius = delayedBurstPaintRadius;
    slot.trailPaintRadius = trailPaintRadius;
    slot.trailPaintCooldown = 0;
    slot.position.copy(origin);
    slot.previousPosition.copy(origin);
    slot.velocity.copy(direction).normalize().mulScalar(speed);
    slot.saber = undefined;
    slot.shooterFlight = undefined;
    slot.arrowFlight = profile.arrowFlight && { frame: 0, free: false, profile: profile.arrowFlight };
    slot.terrainContactNormal = undefined;
    slot.blasterFlight = profile.blaster && {
      profile: profile.blaster, frame: 0, free: false, distance: 0,
      nextSplash: profile.blaster.splashStart, splashesRemaining: profile.blaster.maxSplashes
    };
    if (profile.shooter) {
      const shooter = profile.shooter;
      const cadence = this.shooterCadence ??= new Map();
      const previous = cadence.get(sourceId);
      const sameWeapon = previous?.weaponId === profile.id ? previous : undefined;
      const shots = (sameWeapon?.shots ?? 0) + 1;
      const idleFrames = sameWeapon ? Math.max(0, this.b367NativeFrame - sameWeapon.lastFrame -
        Math.round(profile.fireIntervalSeconds * SHOOTER_HZ)) : 0;
      const bias = Math.max(0.01, (sameWeapon?.groundBias ?? 0.01) -
        idleFrames * shooter.groundBiasRecoveryPerFrame);
      cadence.set(sourceId, {
        weaponId: profile.id, shots, lastFrame: this.b367NativeFrame, groundBias: Math.min(0.25, bias + 0.01)
      });
      const airborne = sourceKind === 'HUMAN' && !this.stats.playerGrounded;
      const yaw = shooterYawDegrees(
        airborne ? shooter.airSpreadDegrees : profile.spreadDegrees,
        airborne ? 0.4 : bias, sourceId, shots
      );
      if (!explicitShooterAim) slot.velocity.copy(rotateYaw(direction, yaw)).mulScalar(speed);
      const pattern = shooterPaintPattern(shooter, shots);
      slot.shooterFlight = {
        profile: shooter, frame: 0, free: false, distance: 0,
        nextSplash: pattern.firstDistance, splashesRemaining: pattern.count
      };
    }
    slot.b346LaunchId=undefined;
    // Only REAL human shooter sphere slots; this never spawns a second bullet.
    if(!f4Special&&sourceKind==='HUMAN'&&sourceId==='human'&&
       profile.weaponClass==='SHOOTER'){
      slot.b346LaunchId=this.b346ShooterWitness.launch({
        slotName:slot.entity.name,weaponId:profile.id,
        worldPosition:[slot.position.x,slot.position.y,slot.position.z],
        worldVelocity:[slot.velocity.x,slot.velocity.y,slot.velocity.z],
        gravity:slot.gravity,lifeSeconds:slot.ttl,paintRadius:slot.paintRadius,
        nativeGroundedAtLaunch:this.stats.playerGrounded
      });
    }

    const meshInstance = slot.entity.render?.meshInstances[0];
    if (meshInstance) meshInstance.material = team === Team.A ? this.materialA : this.materialB;

    slot.entity.setLocalScale(visualDiameter, visualDiameter, visualDiameter);
    slot.entity.setPosition(origin);
    slot.entity.enabled = true;
  }

  private finishProjectile(
    slot: ProjectileSlot,
    point: Vec3,
    paintHit: SurfaceRayHit | null,
    reason:B346ShooterExitKind|'CANOPY'|'DEVICE'='TTL'
  ): void {
    const stageNormal = slot.terrainContactNormal;
    if(slot.b346LaunchId!==undefined){
      if (reason !== 'CANOPY' && reason !== 'DEVICE') this.b346ShooterWitness.exit(slot.b346LaunchId,{
        reason,
        worldPosition:[point.x,point.y,point.z],
        originalPaintSurfaceId:paintHit?.surface.id??null
      });
      slot.b346LaunchId=undefined;
    }
    const profile = weaponProfile(slot.weaponId);
    const paintSource =
      slot.sourceKind === 'HUMAN' ? PaintSource.Human : PaintSource.Cpu;

    const terrain = reason === 'ORIGINAL_PAINTABLE' || reason === 'ORIGINAL_SOLID';
    const special = slot.f4Special;
    if (special) {
      const {flight,age} = special;
      const detonates = terrain || reason === 'REAL_CPU_HIT' || reason === 'REAL_PLAYER_HIT';
      if (detonates && flight.blast && age >= (flight.armingFrames ?? 0)) {
        const blast = flight.blast;
        const center = stageNormal ? point.clone().add(stageNormal.clone().mulScalar(.06)) : point;
        this.applyF4SpecialPulse(center,slot.team,slot.sourceId,blast.radius,blast.damage,blast.paint,blast.near);
      }
    }
    const f4Stringer = slot.weaponId === 'chord-stringer' && this.physics?.hasF4WholeResearchTrimesh;
    if (slot.blasterFlight) {
      if (reason === 'TTL' || terrain) {
        const center = point.clone();
        if (stageNormal) center.add(stageNormal.clone().mulScalar(0.06));
        const scale = terrain ? 0.5 : 1;
        this.applyAreaDamage(center, slot.blastRadius * scale, slot.blastDamage * scale,
          slot.team, undefined, false, slot.sourceKind === 'HUMAN' ? slot.weaponId : undefined);
        this.enqueueF4BurstPaint(center, slot.team, slot.sourceId,
          terrain ? 1.25 : 2.15, terrain ? 0.66 : 0.88, true);
      }
    } else if (slot.blastRadius > 0 && slot.blastDamage > 0) {
      this.applyAreaDamage(point,slot.blastRadius,slot.blastDamage,
        slot.team,undefined,false,
        slot.sourceKind==='HUMAN'?slot.weaponId:undefined);
      this.paintWorldStamp(
        slot.team,
        point,
        slot.blastRadius * 0.72,
        slot.blastRadius * 0.72,
        slot.velocity,
        1.2,
        PaintEventType.Bomb,
        paintSource,
        slot.sourceKind === 'CPU' ? slot.sourceId : undefined
      );
    }

    // SOURCE STRINGER fuses are attached to actual physical contacts:
    // a projectile that simply exhausts its range in open air has not
    // stuck to any real player/CPU or original paintable/solid. Do not
    // create a delayed damage center at an unsupported air position.
    if (slot.delayedBurstSeconds > 0 &&
        (f4Stringer ? terrain : this.nativeSourceHumanPhysicalMode===null||reason!=='TTL')) {
      this.stats.stringerFuses += 1;
      this.feedback.stringerFuse(
        slot.team,
        point,
        slot.delayedBurstSeconds
      );
      this.delayedBursts.push({
        source: paintSource,
        actorId: slot.sourceKind === 'CPU' ? slot.sourceId : undefined,
        team: slot.team,
        point: point.clone(),
        seconds: slot.delayedBurstSeconds,
        radius: slot.delayedBurstRadius,
        damage: slot.delayedBurstDamage,
        paintRadius: slot.delayedBurstPaintRadius,
        weaponId: slot.weaponId,
        contactNormal: f4Stringer ? (stageNormal ?? paintHit?.surface.normal)?.clone() : undefined
      });
    }

    // The only SOURCE terrain impact painting is an accepted original
    // paint-surface contact (enqueueImpact). Projecting a HUMAN shot's
    // TTL/actor/solid endpoint onto a nearby unrelated surface paints
    // phantom ink without an actual impact. Keep frozen T20 unchanged.
    if (this.nativeSourceHumanPhysicalMode===null &&
        !slot.shooterFlight && !slot.blasterFlight && !slot.slosherFlight && !slot.canopyPellet && !paintHit &&
        slot.paintRadius > 0 && slot.sourceKind === 'HUMAN') {
      this.paintWorldStamp(
        slot.team,
        point,
        slot.paintRadius * 0.9,
        slot.paintRadius * 0.7,
        slot.velocity,
        0.52,
        PaintEventType.Impact,
        paintSource
      );
    }

    this.feedback.impact(slot.team, point, profile);
    this.stats.projectileImpacts += 1;
    this.deactivate(slot);
  }

  private processDelayedBursts(dt: number): void {
    for (let i = this.delayedBursts.length - 1; i >= 0; i -= 1) {
      const burst = this.delayedBursts[i]!;
      burst.seconds -= dt;
      if (burst.seconds > 0) continue;

      const center = burst.contactNormal
        ? burst.point.clone().add(burst.contactNormal.clone().mulScalar(0.06))
        : burst.point;
      this.applyAreaDamage(center,burst.radius,burst.damage,
        burst.team,undefined,false,
        burst.source===PaintSource.Human?burst.weaponId:undefined);
      if (burst.contactNormal) {
        this.enqueueF4BurstPaint(center, burst.team, burst.actorId ?? 'human',
          0.85, burst.paintRadius, false);
      } else this.paintWorldStamp(
        burst.team,
        burst.point,
        burst.paintRadius,
        burst.paintRadius,
        new Vec3(1, 0, 0),
        1.0,
        PaintEventType.Bomb,
        burst.source,
        burst.actorId
      );
      this.feedback.stringerBurst(
        burst.team,
        burst.point,
        weaponProfile(burst.weaponId),
        burst.radius
      );
      this.stats.stringerBursts += 1;
      this.delayedBursts.splice(i, 1);
    }
  }

  /** Use ONLY existing original Rapier solid queries to reject melee
   * targets behind registered cover in genuine SOURCE human/CPU play. */
  private sourceMeleeLineClear(from:Vec3,to:Vec3):boolean{
    if(![from.x,from.y,from.z,to.x,to.y,to.z]
      .every(Number.isFinite))return false;
    const distance=from.distance(to);
    if(distance<=1e-8)return true;
    const block=this.physics.castStageSegment(from,to,'ink-projectile');
    // A Rapier hit 1cm before the actual actor body is real wall cover,
    // NOT the actor's own paint-plane backing. Unlike paint stamps,
    // genuine SOURCE melee / explosion HP has no plane-alignment permit.
    // Preserve an unobstructed ray and a stage contact AT/AFTER the
    // physical body, while failing closed on all earlier registered solids.
    return !block||Number.isFinite(block.distance)&&
      block.distance>=distance;
  }

  private applyAreaDamage(
    point: Vec3,
    radius: number,
    damage: number,
    team: Team.A | Team.B,
    sourceMeleeOrigin?:Vec3,
    sourceHumanMelee=false,
    /** Real HUMAN MAIN projectile explosion or STRINGER fuse only. */
    sourceHumanExplosiveWeaponId?:WeaponId,
    near?: { radius: number; damage: number }
  ): void {
    // In the selected 25/17/26/0 physical SOURCE round, real Rapier
    // cover blocks blast HP too, not only melee HP. This reads existing
    // registered solids; it never changes explosion radius, damage,
    // paint, actor positions, or legacy T20 bomb behavior.
    const from=sourceMeleeOrigin??point;
    const canopyCover=this.createF4CanopyCover(from,team,near
      ? distance => distance <= near.radius ? near.damage : damage
      : damage);
    const meleeClear=this.nativeSourceHumanPhysicalMode?
      (body:Vec3)=>this.sourceMeleeLineClear(from,body)&&(canopyCover?.(body)??true):undefined;
    // Only the four canonical 25/17/26/0 physical SOURCE rounds enable
    // the real shared CPU Rapier-capsule hit shape. All other hit modes
    // retain the historical center approximation.
    // CpuAgentSystem increments this ONLY on actual enemy CPU HP loss,
    // after the real capsule/life, team, guard and Rapier cover gates.
    // Its returned hit count can include absorbed guard impacts, so
    // NEVER use that count to authorize a hit confirmation.
    // Historical external/melee consumers may not have a splash-feedback
    // stats fixture. Only genuine SOURCE HUMAN explosive feedback reads it.
    const sourceHumanSplash=this.nativeSourceHumanPhysicalMode!==null&&
      sourceHumanExplosiveWeaponId!==undefined&&
      team===this.currentHumanTeam;
    const realHitsBefore=sourceHumanSplash?this.stats.cpuCombatHits:NaN;
    this.cpuAgents.applyAreaDamage(point,radius,damage,team,meleeClear,
      this.nativeSourceHumanPhysicalMode!==null,
      sourceHumanMelee&&!!meleeClear&&team===this.currentHumanTeam,near);
    if(sourceHumanSplash&&Number.isFinite(realHitsBefore)&&
       this.stats.cpuCombatHits>realHitsBefore&&
       this.nativeSourceHumanSplashCueFrame!==this.b367NativeFrame){
      this.nativeSourceHumanSplashCueFrame=this.b367NativeFrame;
      this.feedback.confirmedHumanCpuDamage(team,point,
        weaponProfile(sourceHumanExplosiveWeaponId));
    }
    if (!near) this.combatTargets.applyAreaDamage(point, radius, damage, team);

    if (
      !this.currentHumanDamageable ||
      team === this.currentHumanTeam ||
      radius <= 0 ||
      damage <= 0
    ) {
      return;
    }

    if(this.nativeSourceHumanPhysicalMode){
      // In the real SOURCE round playerPosition is Rapier BODY center.
      // Adding the CPU-foot +.68m offset moved blast damage ABOVE the
      // human capsule. Test actual 3D blast sphere vs true player shape.
      // Dead players are never damaged again in the same physical tick.
      if(this.resources.currentHp<=0||!nativeSourceHumanInBlast(
        point,radius,this.currentHumanPosition,
        this.nativeSourceHumanPhysicalMode())||
        meleeClear&&!meleeClear(this.currentHumanPosition))return;
    }else{
      // Frozen T20 and historical QA remain byte-for-byte compatible.
      const dx = this.currentHumanPosition.x - point.x;
      const dy = this.currentHumanPosition.y + 0.68 - point.y;
      const dz = this.currentHumanPosition.z - point.z;
      if (dx * dx + dy * dy + dz * dz > radius * radius) return;
    }

    if (near && this.nativeSourceHumanPhysicalMode && nativeSourceHumanInBlast(
      point, near.radius, this.currentHumanPosition, this.nativeSourceHumanPhysicalMode())) {
      damage = near.damage;
    }

    // An actual CPU SUB/SPECIAL explosion centered on the human body
    // has no supported horizontal attack side. Do not grant a free
    // front-shield block solely because the source equals body center.
    // The existing physical radius, true HP and Rapier cover decide it.
    // Frozen T20 retains its historical center-point guard rule.
    const areaDx=point.x-this.currentHumanPosition.x;
    const areaDz=point.z-this.currentHumanPosition.z;
    const sourceAreaHasSide=this.nativeSourceHumanPhysicalMode===null||
      areaDx*areaDx+areaDz*areaDz>1e-8;
    // SOURCE shield protection cannot extend into the physical rear
    // hemisphere for SUB/SPECIAL blast contacts. The legacy point guard
    // accepts dots down to -0.10; keep that tolerance ONLY for frozen T20.
    // No new shield angle or blast radius is inferred from original data.
    // Only query forward when a real guard is active. Native CPU blast
    // and old headless life/cover fixtures do not necessarily carry
    // a human aim vector, and must still apply authentic HP damage.
    const sourceAreaInFront=this.nativeSourceHumanPhysicalMode===null||
      (this.currentHumanGuarding===true&&
       !!this.currentHumanAimDirection&&
       flattened(this.currentHumanAimDirection).dot(
        new Vec3(areaDx,0,areaDz))>0);
    if (
      this.currentHumanGuarding &&
      sourceAreaHasSide &&
      sourceAreaInFront &&
      this.isGuardBlockingPoint(
        point,
        this.currentHumanPosition,
        this.currentHumanAimDirection
      )
    ) {
      this.guardHp = Math.max(0, this.guardHp - damage);
      this.stats.playerWeaponGuardBlocks += 1;
      this.stats.playerWeaponGuardHp = this.guardHp;
      if (this.guardHp <= 0) {
        this.guardBreakSeconds = 2.5;
        this.guardEntity.enabled = false;
        this.stats.playerWeaponAction = 'GUARD_BREAK';
      }
      return;
    }

    const hpLoss=this.resources.applyDamage(damage);
    this.confirmNativeHumanDamage(hpLoss,point,team);
    this.recordCpuPlayerDamageHit(hpLoss);
  }

  private applyMeleeDamage(
    point: Vec3,
    radius: number,
    damage: number,
    team: Team.A | Team.B,
    sourceMeleeOrigin?:Vec3,
    sourceHumanMelee=false
  ): void {
    this.applyAreaDamage(point,radius,damage,team,sourceMeleeOrigin,
      sourceHumanMelee);
  }

  private paintFan(
    team: Team.A | Team.B,
    origin: Vec3,
    forward: Vec3,
    distance: number,
    width: number,
    count: number,
    radius: number,
    type: PaintEventType,
    source: PaintSource = PaintSource.Human,
    actorId?: string,
    verifiedSourceCpuFoot?: Vec3
  ): void {
    const right = new Vec3(-forward.z, 0, forward.x);
    for (let i = 0; i < count; i += 1) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const lateral = (t - 0.5) * width;
      const point = origin.clone()
        .add(forward.clone().mulScalar(distance * (0.72 + 0.18 * Math.abs(t - 0.5))))
        .add(right.clone().mulScalar(lateral));
      this.paintWorldStamp(
        team,
        point,
        radius,
        radius * 0.72,
        forward,
        0.85,
        type,
        source,
        actorId,
        verifiedSourceCpuFoot??this.sourceHumanMeleeStampOrigin(origin,source)
      );
    }
  }

  private paintSlash(
    team: Team.A | Team.B,
    origin: Vec3,
    forward: Vec3,
    charge: number,
    source: PaintSource = PaintSource.Human,
    actorId?: string,
    verifiedSourceCpuFoot?: Vec3
  ): void {
    const length = lerp(1.8, 3.6, charge);
    const width = lerp(0.55, 0.9, charge);
    for (let i = 1; i <= 4; i += 1) {
      const point = origin.clone().add(forward.clone().mulScalar(length * i / 4));
      this.paintWorldStamp(
        team,
        point,
        width,
        width * 0.42,
        forward,
        0.9,
        PaintEventType.Impact,
        source,
        actorId,
        verifiedSourceCpuFoot??this.sourceHumanMeleeStampOrigin(origin,source)
      );
    }
  }

  private paintWorldStamp(
    team: Team.A | Team.B,
    worldPoint: Vec3,
    radiusU: number,
    radiusV: number,
    worldDirection: Vec3,
    maxPlaneDistance: number,
    type: PaintEventType,
    source: PaintSource = PaintSource.Human,
    actorId?: string,
    originalMeleeSourceFoot?: Vec3
  ): boolean {
    let best:
      | {
          surface: PaintSurface;
          u: number;
          v: number;
          planeDistance: number;
        }
      | null = null;

    // SOURCE flight ink is projected from a genuine in-air physical
    // droplet onto nearby paintable faces. A clear projectile SEGMENT
    // alone cannot prove this perpendicular stamp ray is unobstructed:
    // the nearest visible original floor may lie behind a real wall.
    // Keep frozen T20 and ordinary non-flight stamp ranking unchanged.
    const verifyPhysicalSourceTrail=
      typeof this.nativeSourceHumanPhysicalMode==='function'&&
      type===PaintEventType.MidDroplet&&
      (source===PaintSource.Human||source===PaintSource.Cpu);
    // Only grounded SOURCE human melee uses the original foot and
    // physically backed paint ID. All other game modes use the old ranking.
    const sourceSupportedId=originalMeleeSourceFoot
      ?this.sourceNativeMeleeApprovedSurfaceId(originalMeleeSourceFoot,worldPoint)
      :null;
    if(originalMeleeSourceFoot&&!sourceSupportedId)return false;
    for (const surface of this.surfaces) {
      if(sourceSupportedId&&surface.id!==sourceSupportedId)continue;
      if ((surface.baseFlags & SurfaceFlags.Paintable) === 0) continue;
      const projected = surface.projectWorldPoint(worldPoint);
      if (!projected.inside || projected.planeDistance > maxPlaneDistance) continue;
      if(this.physics.hasF4WholeResearchTrimesh&&
         !this.physics.hasF4PaintBacking(surface,projected.u,projected.v))continue;
      // SOURCE-only in-flight ink cannot authorize a paintable face with
      // invalid projection coordinates: NaN compares false to distance
      // thresholds and previously could win the nearest-face ranking.
      if(verifyPhysicalSourceTrail&&
         (!Number.isFinite(projected.u)||
          !Number.isFinite(projected.v)||
          !Number.isFinite(projected.planeDistance)||
          projected.planeDistance<0||
          !sourceRegisteredPaintCellActive(surface,projected.u,projected.v)))
        continue;
      if(verifyPhysicalSourceTrail){
        const face=surface.localToWorld(projected.u,projected.v);
        const meters=worldPoint.distance(face);
        if(![meters,face.x,face.y,face.z].every(Number.isFinite))continue;
        // Share the EXACT existing registered Rapier-cover check with
        // genuine SOURCE human/CPU bomb/SPECIAL stamps. A different
        // original wall 1cm before the target is real cover; only the
        // paint surface's OWN backing can use 6cm face alignment.
        if(meters>1e-8){
          const blocker=this.physics.castStageSegment(
            worldPoint,face,'ink-projectile');
          if(!sourceOriginalBlastPaintLineClear(
            worldPoint,face,surface,blocker))continue;
        }
      }
      if (!best || projected.planeDistance < best.planeDistance) {
        best = {
          surface,
          u: projected.u,
          v: projected.v,
          planeDistance: projected.planeDistance
        };
      }
    }

    if (!best) return false;

    const dir = worldDirection.lengthSq() > 1e-8
      ? worldDirection.clone().normalize()
      : new Vec3(1, 0, 0);
    const du = dir.dot(best.surface.uAxis);
    const dv = dir.dot(best.surface.vAxis);

    this.coordinator.enqueue({
      source,
      actorId,
      team,
      surfaceId: best.surface.id,
      centerU: best.u,
      centerV: best.v,
      radiusU,
      radiusV,
      angle: Math.atan2(dv, du),
      type,
      strength: 1
    });
    return true;
  }

  private updateGuardVisual(
    guarding: boolean,
    team: Team.A | Team.B,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): void {
    this.guardEntity.enabled = guarding;
    if (!guarding) return;

    const forward = flattened(aimDirection);
    const point = playerPosition.clone().add(forward.clone().mulScalar(0.9));
    point.y += 0.48;
    this.guardEntity.setPosition(point);
    const yaw = Math.atan2(forward.x, forward.z) * 180 / Math.PI;
    this.guardEntity.setLocalEulerAngles(0, yaw, 0);

    const meshInstance = this.guardEntity.render?.meshInstances[0];
    if (meshInstance) {
      meshInstance.material = team === Team.A ? this.materialA : this.materialB;
    }
  }

  /** Native SOURCE uses the ACTUAL projectile/body contact, not the
   * previous 60Hz slot position. For a projectile born inside the human
   * capsule the contact can equal its center: infer its incoming side
   * from the real projectile velocity instead of granting a free block.
   * Frozen T20 keeps the original slot-position rule. */
  private isNativeSourceGuardBlockingContact(
    slot: ProjectileSlot,
    contactPoint: Vec3,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): boolean {
    return this.isNativeSourceGuardBlockingIncoming(
      slot.velocity,contactPoint,playerPosition,aimDirection
    );
  }

  /** SOURCE MAIN and CPU CHARGER use the SAME physical contact point.
   * A ray that starts inside the real HUMAN capsule has zero contact
   * offset; only its real incoming direction can establish shield side.
   * Never infer a front-side hit from a centered muzzle position. */
  private isNativeSourceGuardBlockingIncoming(
    incomingVelocity:Vec3,
    contactPoint:Vec3,
    playerPosition:Vec3,
    aimDirection:Vec3
  ):boolean{
    const attackSide=contactPoint.clone().sub(playerPosition);
    attackSide.y=0;
    if(attackSide.lengthSq()<=1e-8){
      attackSide.copy(incomingVelocity).mulScalar(-1);
      attackSide.y=0;
      if(attackSide.lengthSq()<=1e-8)return false;
    }
    // A contact on the rear HALF of the true physical human body is
    // never in front of its shield. Legacy T20's -0.10 tolerance let
    // slightly-rear lateral shots count as blocks. Do not invent a more
    // specific Nintendo guard cone without original geometry evidence.
    if(flattened(aimDirection).dot(attackSide)<=0)return false;
    return this.isGuardBlockingPoint(
      playerPosition.clone().add(attackSide),
      playerPosition,aimDirection
    );
  }

  private isGuardBlocking(
    slot: ProjectileSlot,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): boolean {
    return this.isGuardBlockingPoint(
      slot.position,
      playerPosition,
      aimDirection
    );
  }

  private isGuardBlockingPoint(
    attackerPoint: Vec3,
    playerPosition: Vec3,
    aimDirection: Vec3
  ): boolean {
    if (this.guardBreakSeconds > 0 || this.guardHp <= 0) return false;
    const forward = flattened(aimDirection);
    const toProjectile = attackerPoint.clone().sub(playerPosition);
    toProjectile.y = 0;
    if (toProjectile.lengthSq() <= 1e-8) return true;
    toProjectile.normalize();
    return forward.dot(toProjectile) > -0.10;
  }

  private syncWeaponStats(): void {
    const profile = this.currentPlayerWeapon;
    this.stats.playerWeaponId = profile.id;
    this.stats.playerWeaponName = profile.displayName;
    this.stats.playerWeaponClass = profile.classLabel;
    this.stats.playerWeaponChargePercent = 0;
    this.stats.playerWeaponFirstRingPercent =
      profile.firstChargeSeconds > 0 && profile.chargeSeconds > 0
        ? profile.firstChargeSeconds / profile.chargeSeconds * 100
        : 0;
    this.stats.playerWeaponChargeRing = 0;
    this.stats.playerWeaponAction = 'READY';
    this.stats.playerWeaponGuarding = false;
    this.stats.playerWeaponGuardHp = this.guardHp;
  }

  private deactivate(slot: ProjectileSlot): void {
    slot.f4Special = undefined;
    slot.active = false;
    slot.reservedForVolley = false;
    slot.saber = undefined;
    slot.slosherFlight = undefined;
    slot.canopyPellet = undefined;
    slot.entity.enabled = false;
  }

  private findNearestSurfaceHit(from: Vec3, to: Vec3): SurfaceRayHit | null {
    let best: SurfaceRayHit | null = null;
    for (const surface of this.surfaces) {
      const hit = surface.intersectSegment(from, to);
      // Genuine SOURCE bullets and CHARGER rays may hit only an ACTIVE
      // paint cell. Otherwise a ghost paint-plane stops live physical
      // shots even though gameplay ink cannot be changed there.
      // Still resolve the independent original Rapier solid afterwards.
      // Frozen T20's original plane-first behavior is unchanged.
      if(hit&&(!this.nativeSourceHumanPhysicalMode||
          sourceRegisteredPaintHitActive(surface,hit))&&
          (!best||hit.distance<best.distance))best=hit;
    }
    return best;
  }

  private enqueueImpact(
    team: Team.A | Team.B,
    hit: SurfaceRayHit,
    paintRadius: number,
    source: PaintSource,
    actorId?: string,
    qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK',
    brush?: Pick<PaintRequest, 'centerU' | 'centerV' | 'radiusU' | 'radiusV' | 'angle'>
  ): void {
    const isWall = (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0;
    const request: PaintRequest = {
      source,
      actorId,
      qaSourceAim,
      team,
      surfaceId: hit.surface.id,
      centerU: hit.u,
      centerV: hit.v,
      radiusU: paintRadius * 1.12,
      radiusV: paintRadius,
      angle: 0,
      ...brush,
      type: isWall ? PaintEventType.WallImpact : PaintEventType.Impact,
      strength: 1
    };
    this.coordinator.enqueue(request);
    if(source===PaintSource.Cpu&&actorId==='A1'&&
       qaSourceAim==='A1_ORIGINAL_ALLY_SUPPORT_INK')
      this.b152OriginalAllyAimSurfaceCollisions++;
    if (source === PaintSource.Cpu) this.stats.cpuProjectilePaintHits += 1;
  }

  private enqueueShooterFoot(
    profile: ShooterProfile, body: Vec3, team: Team.A | Team.B, actor: string
  ): void {
    const cadence = this.shooterCadence?.get(actor);
    if (!cadence || !shooterPaintPattern(profile, cadence.shots).foot) return;
    this.enqueueF4Foot(body, team, actor, profile.footRadius);
  }

  private enqueueF4Foot(body: Vec3, team: Team.A | Team.B, actor: string, radius: number): void {
    const support = this.physics.castCharacterFootSupport(
      body, PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters, 'HUMAN'
    );
    if (!sourceNativeMeleePaintFoot(body, true, support)) return;
    const hit = this.physics.f4PaintAtStageHit(support, this.surfaces);
    if (!hit || (hit.surface.baseFlags & SurfaceFlags.Wall) !== 0) return;
    this.enqueueF4Stamp(hit, team, actor, PaintEventType.Foot, {
      radiusU: radius, radiusV: radius, angle: 0
    });
  }

  private clipF4Muzzle(from: Vec3, to: Vec3): Vec3 {
    const cover = this.physics.castStageSegment(from, to, 'ink-projectile');
    return cover ? pointOnSegment(from, to, Math.max(0, cover.distance - 0.02)) : to;
  }

  private enqueueFlightSplashes(
    slot: ProjectileSlot,
    flight: NonNullable<ProjectileSlot['shooterFlight'] | ProjectileSlot['blasterFlight']>,
    from: Vec3, to: Vec3, terminalDistance: number
  ): void {
    const length = from.distance(to);
    const limit = Math.min(length, terminalDistance - 1e-6);
    while (flight.splashesRemaining > 0 && flight.nextSplash <= flight.distance + limit) {
      const point = pointOnSegment(from, to, flight.nextSplash - flight.distance);
      flight.nextSplash += flight.profile.splashSpacing;
      flight.splashesRemaining--;
      // Provisional droplet travel, with limited fall and forward carry.
      // The first physical contact decides whether and where it paints.
      const forward = flattened(slot.velocity);
      const landing = point.clone().add(forward.clone().mulScalar(0.8));
      landing.y -= 10;
      const hit = this.castF4Paint(point, landing);
      if (hit) {
        this.enqueueF4Stamp(hit, slot.team, slot.sourceId, PaintEventType.MidDroplet,
          shooterSplashBrush(hit, point, forward, flight.profile));
      }
    }
  }

  private enqueueF4Stamp(
    hit: SurfaceRayHit, team: Team.A | Team.B, actor: string, type: PaintEventType,
    brush: Pick<PaintRequest, 'radiusU' | 'radiusV' | 'angle'>
  ): void {
    this.coordinator.enqueue({
      source: type === PaintEventType.Special ? PaintSource.Special :
        actor === 'human' ? PaintSource.Human : PaintSource.Cpu,
      actorId: type === PaintEventType.Special || actor !== 'human' ? actor : undefined,
      ...(type === PaintEventType.Special ? {gaugeEligible:false} : {}),
      team, surfaceId: hit.surface.id, centerU: hit.u, centerV: hit.v,
      ...brush, type, strength: 1
    });
  }

  private enqueueSaberSplashes(slot: ProjectileSlot, from: Vec3, to: Vec3, terminal: number): void {
    const blade = slot.saber!;
    const step = Math.min(from.distance(to), terminal);
    const end = blade.distance + step;
    while (blade.splashesLeft > 0 && blade.nextSplashDistance < end) {
      const point = pointOnSegment(from, to, blade.nextSplashDistance - blade.distance);
      const hit = this.castF4Paint(point, point.clone().add(new Vec3(0, -1.05, 0)));
      if (hit) this.enqueueF4Stamp(hit, slot.team, slot.sourceId, PaintEventType.MidDroplet,
        { radiusU: blade.paintWidth * 0.48, radiusV: blade.paintWidth * 0.30,
          angle: Math.atan2(slot.velocity.dot(hit.surface.vAxis), slot.velocity.dot(hit.surface.uAxis)) });
      blade.splashesLeft--;
      blade.nextSplashDistance += blade.splashSpacing;
    }
    blade.distance = end;
  }

  private castF4Paint(from: Vec3, to: Vec3): SurfaceRayHit | null {
    return this.physics.f4PaintAtStageHit(
      this.physics.castStageSegment(from, to, 'ink-projectile'), this.surfaces
    );
  }

  private enqueueF4BurstPaint(
    center: Vec3, team: Team.A | Team.B, actor: string,
    reach: number, radius: number, spray: boolean, type = PaintEventType.Bomb
  ): void {
    for (const surface of this.surfaces) {
      if (!(surface.baseFlags & SurfaceFlags.Paintable)) continue;
      const projected = surface.projectWorldPoint(center);
      if (projected.planeDistance >= reach) continue;
      const span = Math.sqrt(reach ** 2 - projected.planeDistance ** 2);
      if (projected.u < -span || projected.u > surface.widthMeters + span ||
          projected.v < -span || projected.v > surface.heightMeters + span) continue;
      // The blaster throws radial droplets. A stuck arrow has just one
      // small second coat near its impact. All samples need a stage contact.
      for (let i = 0; i < (spray ? 9 : 1); i++) {
        const angle = i * Math.PI / 4;
        const offset = i === 0 ? 0 : span * 0.66;
        const u = projected.u + Math.cos(angle) * offset;
        const v = projected.v + Math.sin(angle) * offset;
        if (!sourceRegisteredPaintCellActive(surface, u, v)) continue;
        const destination = surface.localToWorld(u, v);
        const ray = destination.clone().sub(center);
        if (ray.lengthSq() <= 1e-8) continue;
        destination.add(ray.normalize().mulScalar(0.1));
        const hit = this.castF4Paint(center, destination);
        if (!hit || hit.surface !== surface || hit.distance > reach) continue;
        const size = i === 0 ? radius : radius * 0.58;
        this.enqueueF4Stamp(hit, team, actor, type, {
          radiusU: size, radiusV: size, angle: 0
        });
      }
    }
  }
}

function nearestSaberSweep<T extends { distance: number }>(
  sweep: readonly { offset: Vec3; radius: number }[], from: Vec3, to: Vec3,
  cast: (from: Vec3, to: Vec3, radius: number) => T | null
): T | null {
  let best: T | null = null;
  for (const { offset, radius } of sweep) {
    const hit = radius > 0
      ? cast(from.clone().add(offset), to.clone().add(offset), radius) : cast(from, to, radius);
    if (hit && (!best || hit.distance < best.distance)) best = hit;
  }
  return best;
}

function isFreeProjectileSlot(slot: ProjectileSlot): boolean {
  return !slot.active && !slot.reservedForVolley;
}

function makeProjectileMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0], rgb[1], rgb[2]);
  material.emissive = new Color(rgb[0] * 0.45, rgb[1] * 0.45, rgb[2] * 0.45);
  material.useMetalness = true;
  material.metalness = 0.1;
  material.gloss = 0.88;
  material.update();
  return material;
}

function chargeFraction(profile: WeaponProfile, seconds: number): number {
  if (profile.chargeSeconds <= 1e-6) return 0;
  return clamp(seconds / profile.chargeSeconds, 0, 1);
}

function rotorLaunchProfile(profile: WeaponProfile, firstRingProgress: number): WeaponProfile {
  const shooter = profile.shooter;
  if (!shooter?.coast || firstRingProgress >= 1) return profile;
  return {
    ...profile,
    speedMetersPerSecond: profile.speedMetersPerSecond * lerp(0.55, 1, firstRingProgress),
    shooter: {
      ...shooter,
      // A partly charged shot loses horizontal speed sooner. Both the
      // discrete aim solve and the actual sweep use this local curve.
      coast: { ...shooter.coast, retainPerFrame: lerp(0.79, shooter.coast.retainPerFrame, firstRingProgress) }
    }
  };
}

function stringerVolley(profile: WeaponProfile, seconds: number, f4: boolean) {
  const stage = chargeStageProgress(profile, seconds);
  const first = f4
    ? clamp((seconds - profile.minChargeSeconds) /
      (profile.firstChargeSeconds - profile.minChargeSeconds), 0, 1)
    : stage.first;
  return {
    stage,
    // 720 StringerNormal uses an 8 degree side angle at minimum and first
    // ring. The residual full-charge angle and F4 ballistic scale are local.
    spread: f4 ? lerp(16, 4, stage.second)
      : stage.firstReached ? lerp(profile.spreadDegrees, 0, stage.second) : profile.spreadDegrees,
    directDamage: lerp(30, 35, first),
    speedMultiplier: stage.firstReached ? lerp(1, profile.chargeSpeedMultiplier, stage.second)
      : f4 ? 1 : lerp(0.78, 1, first),
    paintMultiplier: stage.firstReached ? lerp(1, profile.chargePaintMultiplier, stage.second)
      : lerp(0.88, 1, first),
    inkCost: stage.firstReached ? lerp(6, 8.5, stage.second) : lerp(5, 6, first),
    fuseSeconds: stage.firstReached ? 45 / 60 : 0,
    burstRadius: stage.firstReached ? (f4 ? 2 : lerp(0.78, 1.02, stage.second)) : 0,
    burstDamage: stage.firstReached ? 30 : 0,
    burstPaintRadius: stage.firstReached ? lerp(0.65, 0.90, stage.second) : 0
  };
}

function stringerArrow(
  origin: Vec3, aim: Vec3, index: number, spread: number, layout: 'horizontal' | 'vertical'
) {
  const forward = aim.clone().normalize();
  const right = new Vec3().cross(forward, Vec3.UP);
  if (right.lengthSq() < 1e-8) right.copy(Vec3.RIGHT);
  right.normalize();
  const axis = layout === 'vertical' ? new Vec3().cross(right, forward).normalize() : right;
  const arrow = index - 1;
  const angle = arrow * spread * Math.PI / 360;
  return {
    origin: origin.clone().add(axis.clone().mulScalar(arrow * 0.4)),
    direction: forward.mulScalar(Math.cos(angle)).add(axis.mulScalar(Math.sin(angle)))
  };
}

function chargeStageProgress(
  profile: WeaponProfile,
  seconds: number
): {
  first: number;
  second: number;
  firstReached: boolean;
  full: boolean;
} {
  const fullSeconds = Math.max(profile.chargeSeconds, 1e-6);
  const firstSeconds = profile.firstChargeSeconds > 0
    ? Math.min(profile.firstChargeSeconds, fullSeconds)
    : fullSeconds;
  const minSeconds = Math.min(profile.minChargeSeconds, firstSeconds);
  const first = clamp(
    (seconds - minSeconds) / Math.max(firstSeconds - minSeconds, 1e-6),
    0,
    1
  );
  const second = firstSeconds < fullSeconds
    ? clamp((seconds - firstSeconds) / (fullSeconds - firstSeconds), 0, 1)
    : 0;
  return {
    first,
    second,
    firstReached: seconds + 1e-6 >= firstSeconds,
    full: seconds + 1e-6 >= fullSeconds
  };
}

function rotateYaw(direction: Vec3, degrees: number): Vec3 {
  if (Math.abs(degrees) <= 1e-6) return direction.clone().normalize();
  const radians = degrees * Math.PI / 180;
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return new Vec3(
    direction.x * c - direction.z * s,
    direction.y,
    direction.x * s + direction.z * c
  ).normalize();
}

function flattened(direction: Vec3): Vec3 {
  const result = new Vec3(direction.x, 0, direction.z);
  return result.lengthSq() > 1e-8 ? result.normalize() : result.set(0, 0, -1);
}

export function segmentSphereDistance(
  from: Vec3,
  to: Vec3,
  center: Vec3,
  radius: number
): number | null {
  const segment = to.clone().sub(from);
  const length = segment.length();
  if (length <= 1e-8) return null;
  const direction = segment.mulScalar(1 / length);
  const offset = from.clone().sub(center);
  const b = offset.dot(direction);
  const c = offset.dot(offset) - radius * radius;
  if (c > 0 && b > 0) return null;
  const discriminant = b * b - c;
  if (discriminant < 0) return null;
  const distance = Math.max(0, -b - Math.sqrt(discriminant));
  return distance <= length ? distance : null;
}

/** True Rapier HUMAN capsule: vertical axial half-segment plus two sphere
 * caps. Return FIRST finite collision distance along this genuine flight,
 * rather than approximating a tall player with one small head-height ball. */
function segmentVerticalCapsuleDistance(
  from:Vec3,to:Vec3,body:Vec3,halfHeight:number,radius:number
):number|null{
  const low=new Vec3(body.x,body.y-halfHeight,body.z);
  const high=new Vec3(body.x,body.y+halfHeight,body.z);
  let best:number|null=null;
  for(const cap of [low,high]){
    const d=segmentSphereDistance(from,to,cap,radius);
    if(d!==null&&(best===null||d<best))best=d;
  }
  const dx=to.x-from.x,dz=to.z-from.z;
  const dy=to.y-from.y;
  const length=Math.hypot(dx,dy,dz);
  if(length<=1e-8)return best;
  const fx=from.x-body.x,fz=from.z-body.z;
  const a=dx*dx+dz*dz,c=fx*fx+fz*fz-radius*radius;
  if(c<=0&&from.y>=low.y&&from.y<=high.y)return 0;
  if(a>1e-12){
    const b=2*(fx*dx+fz*dz);
    const disc=b*b-4*a*c;
    if(disc>=0){
      for(const t of [(-b-Math.sqrt(disc))/(2*a),
                      (-b+Math.sqrt(disc))/(2*a)]){
        if(t<0||t>1)continue;
        const y=from.y+dy*t;
        if(y<low.y||y>high.y)continue;
        const d=t*length;
        if(best===null||d<best)best=d;
      }
    }
  }
  return best;
}

/** Sphere/capsule collision uses the SAME dimensions as PlayerController.
 * Radius is explosion radius, not a fabricated actor or scoreable zone. */
function nativeSourceHumanInBlast(
  point:Vec3,radius:number,body:Vec3,mode:PlayerMode
):boolean{
  const physical=PLAYER_CHARACTER_PHYSICS;
  const axisY=mode==='SQUID'
    ?body.y+physical.squidCenterOffsetYMeters:
    Math.max(body.y-physical.humanHalfHeightMeters,
      Math.min(body.y+physical.humanHalfHeightMeters,point.y));
  const effectiveRadius=radius+(mode==='SQUID'
    ?physical.squidRadiusMeters:physical.humanRadiusMeters);
  const dx=point.x-body.x,dy=point.y-axisY,dz=point.z-body.z;
  return dx*dx+dy*dy+dz*dz<=effectiveRadius*effectiveRadius;
}

function pointOnSegment(from: Vec3, to: Vec3, distance: number): Vec3 {
  const direction = to.clone().sub(from);
  const length = direction.length();
  if (length <= 1e-8) return from.clone();
  return from.clone().add(direction.mulScalar(distance / length));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


function isChargeWeaponClass(weaponClass: WeaponProfile['weaponClass']): boolean {
  return weaponClass === 'CHARGER' ||
    weaponClass === 'SPLATLING' ||
    weaponClass === 'STRINGER' ||
    weaponClass === 'SPLATANA';
}
