import type { CrowdAgent } from 'recast-navigation';
import {CpuZipMotion,selectCpuZipHook,type CpuZipCandidate,type CpuZipPhysicalStep} from '../special/F4CpuZipMotion.mjs';
import {cpuSpecialSightRange} from '../special/F4CpuSpecialTactics.mjs';
import {KIT720} from '../special/f4/shared-special-score720-20261125/shared-special-score720.mjs';
import {B234OriginalCpuGapReadinessAudit}
 from './B234OriginalCpuGapReadinessAudit';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import { Color, Entity, StandardMaterial, Vec3, type AppBase } from 'playcanvas';
import {decorateB248Actor} from '../app/B248SourceActorVisuals';
import { PLAYER_CHARACTER_PHYSICS } from '../player/PlayerCharacterPhysics';
import { GAME_CONFIG } from '../config/game/gameConfig';
import { contactMotion, contactMoveMultiplier, contactPaintSettings, type GroundTravel } from '../projectile/F4ContactWeapon';
import type { PerformanceStats } from '../core/PerformanceStats';
import type { GameplayInkSystem, GameplayInkSample } from '../ink/GameplayInkSystem';
import type { PaintCoordinator } from '../ink/PaintCoordinator';
import { PaintEventType, PaintSource, SurfaceFlags, Team } from '../ink/types';
import { CpuTacticalDirector, type CpuRole } from './CpuTacticalDirector';
import { CpuContinuityMonitor, type CpuContinuityReport } from './CpuContinuityMonitor';
import {shouldReissueOriginalSourceNativeTarget}
 from './OriginalSourceNativeTargetRefresh';
import {chooseAuditedOriginalSourceCpuGoal}
 from './OriginalSourceGoalAdmission';
import {hasF4OriginalIngress,isT21F4ResearchStage}
 from '../stage/undertow/UndertowT21F4PhotoRouteReconstruction';
import {isAlignedOriginalSourceCrowdTarget}
 from './OriginalSourceCrowdTargetAlignment';
import {shouldRefreshStalledOriginalSourceCrowd,
 deferSourceCrowdSteeringForCommittedWeapon,
 sourceCrowdSecondRefreshEarned,
 SOURCE_CROWD_STALL_SECONDS,
 SOURCE_CROWD_RECOVERY_AUDIT_INTERVAL_TICKS}
 from './CpuSourceCrowdStallRecovery';
import {hasRegisteredOriginalSourceCpuRapierFootSupport}
 from './OriginalSourceCpuRapierFootSupport';
import {originalGoalInkSweep} from './UndertowF3OriginalSourceInkSweep';
import {b180OriginalSourcePatchOpportunity,
 b180OriginalSourceUnownedNeighborAim}
 from './B180OriginalSourcePaintOpportunity';
import {chooseB181OriginalSourceSight,b182ReuseNativeSight,type B181SightPoint}
 from './B181OriginalSourceCombatSight';
import {b212NativeLead} from './B212MovingNativeProjectileAim';
import {b213RealAttackerPreference} from './B213NativeCounterfire';
import {b215ShouldQueryNativePaintCandidate} from './B215SourceWeaponReadyPaintAim';
import {b420MayLegacyMeleeChase} from './B420SourceMeleePursuitAuthority';
import {b216OriginalFootBackfillCandidates,
 b216OriginalRegisteredVerticalFloorAim,
 b216OriginalUnpaintedGridCandidates} from './B216OriginalSourceBackfillInk';
import {b178FootMask,b178FootRelation,b178SampleRegisteredSourceFoot,b178BoundOriginalCpuPhysicalStep} from './B178OriginalSourceInkResources';
import { restoreRejectedCpuSpecial, type CpuSpecialResourceState } from './CpuSpecialRejection';
import { CPU_ADVANCED_QA_WEAPONS, cpuLoadout } from './CpuLoadoutCatalog';
import { predictF4Lead } from './F4FlightLead';
import { chooseRailRelease, reachablePreference, chooseF4PhysicalSight, reuseF4PhysicalSight } from './F4CpuAttackPolicy.mjs';
import { sameCpuFireLife, unemittedCpuMainDisposition } from './F4CpuCommitment.mjs';
import { F4_SUB_REPEAT, f4SubRecovery } from '../subweapon/F4SubRules';
import { recoveringInk, recoveryAction, shouldThrowCombatSub, mergedRecovery } from './F4CpuRecoveryPolicy.mjs';
import { F4_SABER_TIMING, railCharge, weaponProfile, type WeaponId } from '../weapons/WeaponCatalog';
import {
  specialWeaponProfile,
  subWeaponProfile,
  weaponKit,
  type SpecialWeaponId,
  type SubWeaponId
} from '../weapons/WeaponKitCatalog';
import type { RecastStageNavigation } from '../navigation/RecastStageNavigation';
import type {UndertowPhase14ECpuAdapter} from '../stage/undertow/UndertowPhase14ECpuHandoff';
import type { StageDefinition } from '../stage/StageDefinition';
import {auditPhase14CrowdFrame} from '../stage/undertow/UndertowPhase14CrowdMotionAudit';
import {ORIGINAL_SOURCE_CPU_CAPSULE}
 from '../stage/undertow/UndertowPhase14QSharedActorCollision';

export interface CpuCombatHit {
  botId: string;
  distance: number;
  point: Vec3;
  guarded: boolean;
  targetPoint?: Vec3;
}
/** B367: actual resolved physical projectile → actual CPU HP outcome.
 * Source-only observers may READ this. T20 retains its legacy next-tick
 * splat transition; original F3 now removes an HP-zero actor immediately. */
export interface CpuProjectileHpResult {
  botId:string;sourceKind:'HUMAN'|'CPU';
  hpBefore:number;hpAfter:number;realHpLoss:number;
  shieldAbsorbed:boolean;lethalHpZero:boolean;
}

/** Actual HP hysteresis for provisional CPU recovery. No HP writes. */
export function f4CpuWoundedRecovery(previous:boolean,hp:number,maxHp:number):boolean{
  if(!Number.isFinite(hp)||!Number.isFinite(maxHp)||hp<=0||maxHp<=0||hp>maxHp)return false;
  return previous?hp<maxHp*.65:hp<=maxHp*.35;
}

export type CpuWeaponAction =
  | 'PROJECTILE'
  | 'ROLLER_FLICK'
  | 'ROLLER_ROLL'
  | 'BRUSH_SWIPE'
  | 'BRELLA_BURST'
  | 'STRINGER_RELEASE'
  | 'SPLATANA_RELEASE';

export type CpuKitRequest =
  | {
      kind: 'SUB';
      sourceId: string;
      team: Team.A | Team.B;
      position: Vec3;
      target: Vec3;
      direction: Vec3;
      subId: SubWeaponId;
      /** Existing paid SUB targeting a REAL registered original unowned
       * SOURCE floor cell; not a combat target or new paint authority.
       * A physically thrown bomb still resolves native Rapier collisions. */
      sourceTurfSubAim?: true;
      /** SOURCE-only precharge lock: restore only if this paid SUB never
       * reaches the real physics effect engine and no later ink spend is
       * observed. Never used to waive a death or accepted weapon cooldown. */
      sourceSubRecovery?:{
        lockBefore:number;
        expectedInkAfterCharge:number;
      };
    }
  | {
      kind: 'SPECIAL';
      sourceId: string;
      team: Team.A | Team.B;
      position: Vec3;
      target: Vec3;
      direction: Vec3;
      specialId: SpecialWeaponId;
      /** Internal transaction state; ignored by the accepted effect system. */
      rollbackBefore?: CpuSpecialResourceState;
    };

/** Opt-in T21 only. A rejected physical step NEVER becomes an avatar pose
 * or an implicit Crowd teleport. The caller must handle the fail-closed
 * rejection before further simulation. T20 passes no authority. */
export interface CpuSharedGroundStepAuthority {
  resetActors():void;
  /** Read-only registered static support at the current synchronized CPU foot. */
  sourceFootSupport?(id:string,foot:Readonly<{x:number;y:number;z:number}>):
    {point:Vec3;solidId:string}|null;
  syncActualHumanFoot(foot:Readonly<{x:number;y:number;z:number}>,
    colliderActive?:boolean,mode?:'HUMAN'|'SQUID'):void;
  syncRealCpuFoot(id:string,foot:Readonly<{x:number;y:number;z:number}>):void;
  /** A splatted CPU has no physical capsule; only source-QA shared world. */
  removeRealCpuFoot?(id:string):void;
  /** Real shared-world actor clearance before F2 native offmesh admission. */
  shouldDeferF2FirstDrop?(
    id:string,foot:Readonly<{x:number;y:number;z:number}>
  ):boolean;
  auditAirborneSourceFoot(
    id:string,from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,dt:number,
    originalKccContinuous:boolean
  ):Readonly<{approved:boolean;cause:string;actorCollisionCandidate:string|null}>;
  auditGroundStep(
    id:string,
    from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,
    dt:number,
    physicallyRejoinedOriginalGround?:boolean
  ):Readonly<{approved:boolean;cause:string;colliderOwnerIds:readonly string[]}>;
  /** Same ORIGINAL floor, genuine Rapier KCC teammate contact only. */
  tryOriginalTeammateKccSlideStep?(
    id:string,from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,dt:number
  ):Readonly<{x:number;y:number;z:number}>|null;
  tryOriginalDownhillKccStep?(
    id:string,from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,dt:number
  ):Readonly<{x:number;y:number;z:number}>|null;
  /** Rapier-only support for tiny upward Crowd/nav-height drift on an
   * already registered original ramp; never a new actor or route. */
  tryOriginalCrowdHeightMismatchKccStep?(
    id:string,from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,dt:number
  ):Readonly<{x:number;y:number;z:number}>|null;
  tryF4GroundStep?(
    id:string,from:Readonly<{x:number;y:number;z:number}>,
    to:Readonly<{x:number;y:number;z:number}>,maxDistance:number
  ):Readonly<{x:number;y:number;z:number;kccGrounded:boolean}>|null;
  settleF4WholeCpuSpawn?(id:string,spawn:Readonly<{x:number;y:number;z:number}>):
    Readonly<{x:number;y:number;z:number}>|null;
  moveF4WholeDrop?(id:string,from:Vec3,delta:Readonly<{x:number;y:number;z:number}>):
    {foot:Readonly<{x:number;y:number;z:number}>;grounded:boolean}|null;
  canRejoinF4WholeProjection?(foot:Vec3,point:Readonly<{x:number;y:number;z:number}>):boolean;
  probeF4CpuZip?(id:string,foot:Vec3,direction:readonly [number,number,number],target:Vec3):CpuZipCandidate|null;
  canF4CpuZipReturn?(id:string,from:Vec3,to:Vec3,supportId:string):boolean;
  stepF4CpuZip?(id:string,from:Vec3,delta:Vec3,wallHandle:number,normal:readonly [number,number,number],landing:boolean):CpuZipPhysicalStep|null;
}

/** T21-D / M4 only: restore the physical HUMAN's passive Crowd footprint
 * before/after the native Recast step. Never move the real HUMAN or CPU. */
export interface CpuHumanCrowdFootAuthority {
  /** B280: real Rapier grounded state, not mere Recast closestPoint. */
  syncActualPlayerFoot(foot:Readonly<{x:number;y:number;z:number}>,
    rapierGrounded?:boolean):unknown;
  sealAfterCrowdUpdate(foot:Readonly<{x:number;y:number;z:number}>):unknown;
}

/** F3D ONLY: source-audited destinations. Never edit real Crowd/Rapier feet. */
export interface CpuQaSourceGoalAuthority {
  chooseSourceGoal(id:string,realFoot:Vec3,out:Vec3,localActionsOpen?:boolean):boolean;
  chooseF4WholeDrop?(id:string,realFoot:Vec3):
    {target:Vec3;jumpSpeed:number;center:boolean}|null;
  /** Optional original-source aim, not a new movement or scoring goal. */
  chooseSourceAllySupportInkTarget?(
    id:string,realFoot:Vec3,out:Vec3
  ):boolean;
  /** Actual living SOURCE CPU's current original physical rejoin,
   * never a historical landing from an earlier life. */
  isLiveRejoinedSourceCpu?(id:string):boolean;
  /** Real CPU respawn starts a new SOURCE life before traffic.observe.
   * Invalidate prior physical-rejoin evidence before another bot can aim. */
  onNativeSourceCpuRespawn?(id:string):void;
  /** Report only REAL 60 Hz Rapier KCC decisions for an already-rejoined
   * original CPU. These never grant movement, paint, actor or NavLink. */
  noteRealSourceKccRejectedStep?(
     id:string,actualFoot:Readonly<{x:number;y:number;z:number}>,
     realKccOwners?:readonly string[],realKccCause?:string):void;
  /** Detour explicitly rejected a requested F4 target, not a KCC collision. */
  noteF4NativeGoalRejected?(id:string,actualFoot:Readonly<{x:number;y:number;z:number}>,requestedGoal:Readonly<{x:number;y:number;z:number}>):void;
  noteRealSourceKccApprovedStep?(
    id:string,previousFoot:Readonly<{x:number;y:number;z:number}>,
    acceptedFoot:Readonly<{x:number;y:number;z:number}>):void;
  /** P2 SOURCE ONLY: actual weapon-ready decisions with no verified
   * ink aim. This reports a real current foot, NOT movement permission. */
  noteRealSourcePaintAimDrought?(
    id:string,actualFoot:Readonly<{x:number;y:number;z:number}>,
    consecutiveNoAimDecisions:number):void;
}

export interface CpuFireRequest {
  sourceId: string;
  team: Team.A | Team.B;
  origin: Vec3;
  bodyPosition: Vec3;
  target: Vec3;
  weaponId: WeaponId;
  charge: number;
  action: CpuWeaponAction;
  groundTravel?: GroundTravel;
  /** B152 source-only provenance; never grants weapon or stage authority. */
  qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK';
  /** An already audited SOURCE floor aim, not enemy or path authority. */
  sourceFloorPaint?: true;
  f4Opponent?: { id: string; offsetY: number; life: symbol | null };
  /** Actual physical CPU life at paid request creation; never reused across splat. */
  f4SourceLifeSerial?: number;
  /** SOURCE-only paid main shot awaiting an actual physical projectile
   * slot. Failure to dispatch must restore the same bot's real ink.
   * Not provided by T20 or synthetic requests. */
  sourceInkTransaction?:{
    chargedInkCost:number;
    expectedInkAfterCharge:number;
    originalRecoveryLockSeconds:number;
    /** SOURCE launch was not completed; preserve the real pre-shot cadence. */
    originalFireRemainingSeconds:number;
    /** Restore a paid-but-unlaunched CHARGER/STRINGER charge, or a
     * SPLATLING burst shot, ONLY while the at-queue weapon state still
     * matches its immediately rejected native action. */
    originalWeaponChargeSeconds?:number;
    originalBurstShotsRemaining?:number;
    originalBurstCooldownSeconds?:number;
    /** The 0.85s SOURCE turf target selection throttle is provisional
     * until its paid projectile actually leaves the native muzzle. */
    originalTurfShotCooldownSeconds?:number;
  };
}

type CpuMobilityState =
  | 'GROUND'
  | 'JUMP_PREP'
  | 'JUMP_TRAVEL'
  | 'JUMP_LANDING'
  | 'FIRST_DROP_FALL'
  | 'FIRST_DROP_REJOIN'
  | 'F4_ZIP';

interface CpuJumpCandidate {
  id: string;
  position: Vec3;
  isHuman: boolean;
  score: number;
}

interface CpuBot {
  id: string;
  team: Team.A | Team.B;
  role: CpuRole;
  slot: number;
  agent: CrowdAgent | null;
  entity: Entity;
  previousPosition: Vec3;
  position: Vec3;
  thinkRemaining: number;
  paintRemaining: number;
  fireRemaining: number;
  weaponId: WeaponId;
  weaponChargeSeconds: number;
  weaponBurstShotsRemaining: number;
  weaponBurstCooldown: number;
  weaponRollPaintCooldown: number;
  contactMovingFrames?: number;
  weaponFacing: Vec3;
  weaponGuardHp: number;
  weaponGuardBreakSeconds: number;
  weaponGuarding: boolean;
  f4CanopyHold?: boolean;
  f4CanopyOpen?: boolean;
  guardEntity: Entity;
  hp: number;
  ink: number;
  inkRecoveryLockSeconds: number;
  f4SubRecoverySeconds?: number;
  f4RecoveringInk?: boolean;
  f4RecoveringHp?: boolean;
  hpRecoveryDelaySeconds: number;
  lethalHumanDirect: boolean;
  b213ActualAttackerId:string|null;
  b213ActualHitTick:number;
  lifeState: 'ACTIVE' | 'SPLATTED';
  /** F4 device identity; advances only after a successful physical respawn. */
  f4LifeSerial: number;
  respawnRemainingSeconds: number;
  mobilityState: CpuMobilityState;
  /** T21 QA-only post-offmesh Crowd settlement counters. */
  rejoinElapsedFrames: number;
  rejoinStableFrames: number;
  rejoinRetryCount: number;
  rejoinPhysicalLandingFoot: Vec3;
  jumpMarker: Entity;
  jumpStartPosition: Vec3;
  jumpTargetPosition: Vec3;
  jumpTargetId: string;
  jumpPrepRemaining: number;
  jumpTravelElapsed: number;
  jumpActionRemaining: number;
  jumpCooldownSeconds: number;
  jumpRespawnWindowSeconds: number;
  jumpArcHeight: number;
  subCooldownSeconds: number;
  specialPoints: number;
  specialDecisionCooldownSeconds: number;
}

export class CpuAgentSystem {
  private readonly bots: CpuBot[] = [];
  private readonly pendingShots: CpuFireRequest[] = [];
  private readonly pendingKitRequests: CpuKitRequest[] = [];
  private readonly director: CpuTacticalDirector;
  private readonly materialA: StandardMaterial;
  private readonly materialB: StandardMaterial;
  private b248VisualEnabled=false;
  private b248VisualShown=true;
  private readonly b248VisualByActor=new Map<string,ReturnType<typeof decorateB248Actor>>();
  private readonly goal = new Vec3();
  /** Read-only QA witness; never touches production T20 behavior. */
  private readonly qaContinuity = new CpuContinuityMonitor();
  private readonly qaMotionGoals = new Map<string, Vec3>();
  /** Only previously SOURCE-authorized native destinations may be retained. */
  private readonly sourceLastAdmittedRouteGoal = new Map<string, Vec3>();
  /** A requested Crowd target is NOT the same as a SOURCE-authorized
   * original paint heading. Only record an actual native request with
   * its current Recast agent; KCC veto and target reset clear it. */
  private readonly sourceLiveNativeMotionGoal = new Map<string,{
    agent:CrowdAgent;goal:Vec3
  }>();
  /** A genuine source 1.2-second real-foot stall can refresh passive Recast
   * steering proxy ONCE per native CPU life, never its Rapier capsule. */
  private readonly sourceCrowdRefreshedThisLife=new Set<string>();
  /** Actual original KCC foot/tick at each approved passive Recast reset. */
  private readonly sourceCrowdRecoveryFoot=new Map<string,{
   foot:Vec3;tick:number;count:number
  }>();
  private readonly sourceLastPhysicalBlockedTick=new Map<string,number>();
  /** SOURCE-only: an invalid native projection holds just the passive
   * steering agent while preserving the actual Rapier CPU foot and shots. */
  private readonly sourceCrowdProjectionHold=new Map<string,number>();
  /** Source-only expensive failed recovery probes are bounded to 90 ticks. */
  private readonly sourceLastRecoveryAuditTick=new Map<string,number>();
  private sourceNativeMotionTick=0;
  private b35OptInNativeRefresh=false;
  private b35RealNativeRequests=0;
  private b35DuplicateNativeRequestsSuppressed=0;
  private readonly b35LastNativeTarget=new Map<string,{
   agent:CrowdAgent;goal:Vec3;repeat:number
  }>();
  /** Throttles real QA turf projectiles without altering enemy fire rates. */
  private readonly qaTurfShotCooldown = new Map<string, number>();
  private readonly f4FloorAimMissTick=new Map<string,number>();
  /** Preserve an already selected ORIGINAL paint aim through a genuine
   * charge/burst. Never licenses a new floor, shot, route, or enemy. */
  private readonly sourceCommittedPaintAims = new Map<string,{
    weaponId:WeaponId;target:Vec3
  }>();
  // Read-only: actions that BEGIN at a real supported CPU foot while
  // the native Crowd candidate is rejected. Requests are NOT bullets.
  private readonly blockedSourceActionRows = new Map<string,{
    supportedWindows:number;mainRequests:number;kitRequests:number
  }>();
  /** Observation of native Crowd proposals and real Rapier KCC decisions.
   * These seven SOURCE-only rows never authorize movement, paint or goals. */
  private readonly sourceGroundStepEvidence=new Map<string,{
   crowdNoStep:number;crowdProposals:number;rapierRejected:number;
   rapierAcceptedMoving:number;rapierAcceptedStationary:number;
   rapierActualTeammateSlides:number;
   offmeshDeferred:number;overspeedRejected:number;crowdReanchors:number;
   rejectionCauses:Record<string,number>;
   lastRejectCause:string|null;lastRejectOwners:readonly string[];
   lastRealFoot:[number,number,number];
   lastCrowdCandidate:[number,number,number];
   lastF4KccGrounded?:boolean;
   lastF4KccStepTick?:number;
  }>();
  private readonly qaTurfShotsByActor = new Map<string, number>();
  private b152AcceptedSourceAimShots=0;
  // B64 experimental source-local alternate AIM only. Original FIXED
  // goals and original gameplay authority stay unchanged by default.
  private b64InkAngleSweepEnabled = false;
  private b178RealSourceInkRecovery=false;
  // A real SOURCE CPU, like the human, must cross enemy-painted ORIGINAL
  // floor at enemy-ink speed. Recast Crowd speed and the final Rapier KCC
  // per-tick envelope share this one same-foot, ownerGrid-derived value.
  // No Recast teleport, route, terrain or new ink is ever authorized.
  private readonly b178NativeCpuMovementSpeed=new Map<string,number>();
  /** Recast speed belongs to the current physical CPU's Crowd AGENT, not
   * merely its ID: native first-drop/rejoin can replace the agent while
   * the floor's real ownerGrid speed remains identical. */
  private readonly b178NativeCpuSpeedAgent=new Map<string,CrowdAgent>();
  private b180OriginalPatchAimEnabled=false;
  // Opt-in source-only real collider visibility, never original route authority.
  private b181OriginalCombatStageRay:
    ((from:B181SightPoint,to:B181SightPoint)=>boolean)|null=null;
  /** Isolated 51-solid F4 research ray, NOT the original 25-solid B181 authority. */
  private f4ResearchCombatStageRay:
    ((from:B181SightPoint,to:B181SightPoint)=>boolean)|null=null;
  private b181NativeFrame=0;
  // The real human KCC body's hit shape changes between HUMAN and SQUID.
  // Sight targets must follow the same physical mode as projectile hits.
  private b181NativeHumanColliderMode:'HUMAN'|'SQUID'='HUMAN';
  private readonly b181CachedCombat=new Map<string,{
    frame:number;actorId:string|null;origin:B181SightPoint;target:B181SightPoint|null
  }>();
  private b181ActualStageRays=0;
  private b181ActualSourceOcclusions=0;
  private b181VisibleSelections=0;
  private b212NativeLeadEnabled=false;
  private b212PriorHuman:Vec3|null=null;
  private f4LeadEnabled = false;
  private f4LeadHistory = new Map<string,{
    current: Vec3; previous: Vec3 | null; tick: number; mode: string; life: symbol
  }>();
  private f4LeadTargets = new WeakMap<Vec3,{id: string;offsetY: number;life: symbol | null}>();
  private f4LeadAccepted = 0;
  private readonly f4AimEvidence={currentTarget:0,predictedTarget:0,staleTargetRejected:0,
    outOfRange:0,covered:0};
  public f4AimEvidenceSnapshot(){return {...this.f4AimEvidence};}
  private b212PreviousHuman:Vec3|null=null;
  private b212NativeLeadCandidates=0;
  private b212NativeAimAccepted=0;
  private b212OriginalCoverRejects=0;
  private b213SourceCounterfireEnabled=false;
  private b213RealAttackerDamageEvents=0;
  private b213VisibleRetaliationSelections=0;
  private b215SelectedBattlePaintPacing=false;
  private b215RealWeaponCooldownPaintScansDeferred=0;
  // Per-actor read-only SOURCE battle decisions; never shot/score authority.
  private readonly b215NativeInkDecisionsByActor=new Map<string,{
    weaponReadyPaintChecks:number;approvedPaintAimChecks:number;
    noApprovedPaintAimChecks:number;checksWithoutNativeGoal:number;
    originalStageSightVetoes:number;backfillStageSightVetoes:number;
    insufficientInkMainShotAttempts:number
  }>();
  private b215ReadOnlyInkRow(id:string){
    let row=this.b215NativeInkDecisionsByActor.get(id);
    if(!row){
      row={weaponReadyPaintChecks:0,approvedPaintAimChecks:0,
        noApprovedPaintAimChecks:0,checksWithoutNativeGoal:0,
        originalStageSightVetoes:0,backfillStageSightVetoes:0,
        insufficientInkMainShotAttempts:0};
      this.b215NativeInkDecisionsByActor.set(id,row);
    }
    return row;
  }
  /** Selected ORIGINAL battle only: consecutive real post-raster CPU
   * impacts that did not change any actual source ink cell. This is NEVER
   * deduced from shots, goals, elapsed time or fake owner-grid states. */
  // Only user-selected P2: track consecutive real weapon-ready NO-AIM
  // decisions, not elapsed time or hypothetical paint/actor positions.
  private readonly selectedSourceEmptyAimStreak=new Map<string,number>();
  private selectedSourceDenseSearches=0;
  private selectedSourceDenseApprovedAims=0;
  // Read-only: successful proposals do not certify a paid projectile/ink.
  private selectedSourceVerticalAimSearches=0;
  private selectedSourceVerticalCandidateMatches=0;
  private selectedSourceVerticalSightVetoes=0;
  private selectedSourceVerticalApprovedAims=0;
  private readonly selectedSourceVerticalApprovedByActor=new Map<string,number>();
  private readonly selectedSourcePaintSaturation=new Map<string,{
    unchangedImpacts:number;actualFootAtStart:Vec3
  }>();
  private b216SourceStageAimValidated:
    ((muzzle:B181SightPoint,target:B181SightPoint,
      actualFoot:B181SightPoint)=>boolean)|null=null;
  // P2: separately selected B441 SOURCE only; normal SOURCE stays fixed.
  private p2OuterOriginalBackfill=false;
  private readonly nativeSourceSubScanByActor=new Map<string,{
    nextNativeFrame:number;foot:Vec3}>();
  private nativeSourceSubGridScans=0;
  private nativeSourceSubGridDeferred=0;
  private nativeSourceSubValidAims=0;
  private p2OuterOriginalSearches=0;
  private p2OuterOriginalApprovedAims=0;
  private b216RealOriginalFloorSightChecks=0;
  private b216ApprovedPhysicalSourceAimTargets=0;
  private b216ApprovedReachedGoalShortRadiusAims=0;
  private b216OriginalTurfSightChecks=0;
  private b216OriginalTurfCoverVetoes=0;
  private b182RecheckedStaleNativeSight=0;
  private b182ReusedLiveNativeSight=0;
  private b180SelectedRealSourcePatches=0;
  private b180SelectedRealPatchOpportunity=0;
  private b180OwnedCenterSourcePatchAims=0;
  private b216OwnedCenterSourceBackfillAims=0;
  private b178OwnNativeTicks=0;
  private b178EnemyNativeTicks=0;
  private b178NeutralNativeTicks=0;
  private b179ActualOwnInkRecovered=0;
  private b179ActualOwnRecoverTicks=0;
  private b179ActualEnemyHpLost=0;
  private b64Samples=0;
  private b64CandidatesUnowned=0;
  private b64CandidatesChosen=0;
  private readonly b64NoTargetCooldown = new Map<string,number>();
  private f3dSourceGoals:CpuQaSourceGoalAuthority|null=null;
  private b234OriginalCpuReadiness:B234OriginalCpuGapReadinessAudit|null=null;
  private readonly samplePoint = new Vec3();
  private readonly targetPoint = new Vec3();
  private activeLastTick = false;
  private f4WholeNavigation = false;
  private f4PlayableTactics=false;
  private readonly f4FloorAimMissTick=new Map<string,number>();
  public enableF4PlayableTactics():void{this.f4PlayableTactics=true;}
  private f4CombatVisualFacing=false;
  private readonly f4VisualAimTick=new Map<string,{tick:number;life:number}>();
  /** Render-only opt-in from the existing local visual-polish gate. */
  public enableF4CombatVisualFacing():void {this.f4CombatVisualFacing=true;}
  private f4PhysicalSpecialProbe?: {
    actorId:string;
    step(input:{foot:Vec3;aim:Vec3;team:Team.A|Team.B;weapon:WeaponId;
      hasOpponent:boolean;canStart:boolean;lifeId:string}):boolean;
    cancel():void;
  };
  private readonly f4ZipRuns=new Map<string,{motion:CpuZipMotion;canFire:boolean}>();
  private readonly f4ZipRecovery=new Set<string>();
  private f4NaturalSpecial?:{
    tick():number;
    zipReady(actor:{actorId:string;team:Team.A|Team.B;weapon:WeaponId;lifeId:string}):boolean;
    zipConsume(actor:{actorId:string;team:Team.A|Team.B;weapon:WeaponId;lifeId:string}):boolean;
    zipActivated?(actor:{actorId:string;team:Team.A|Team.B;weapon:WeaponId;lifeId:string},foot:Vec3):void;
    zipEnd(actorId:string):void;
    wantsTick(actorId:string):boolean;
    step(input:{actorId:string;foot:Vec3;aim:Vec3;target:Vec3|null;team:Team.A|Team.B;weapon:WeaponId;hasOpponent:boolean;canStart:boolean;lifeId:string;distance:number|null;hp:number;ink:number;recentHit:boolean;grounded:boolean}):{owns:boolean;activated:boolean};
    cancel(actorId:string):void;
    splat(actor:{actorId:string;team:Team.A|Team.B;weapon:WeaponId;lifeId:string}):void;
  };
  private f4CommittedMainQuery?: (actorId:string)=>boolean;
  public useF4CommittedMainQuery(query:(actorId:string)=>boolean):void {this.f4CommittedMainQuery=query;}
  private hasF4MainWindup(bot:CpuBot):boolean {return this.f4WholeNavigation&&this.f4CommittedMainQuery?.(bot.id)===true;}
  private readonly f4PendingSpawns = new Set<string>();
  private f4FirstSpawn: Vec3 | null = null;
  private f4FirstCpuMoved = false;
  private f4SpawnRetry = 0;
  private readonly f4Drops = new Map<string,{
    target:Vec3;verticalSpeed:number;elapsed:number;center:boolean
  }>();

  private f4LifeFeedback?: (kind:'splat'|'respawn',team:Team.A|Team.B,position:Vec3)=>void;
  public useF4LifeFeedback(fn:NonNullable<CpuAgentSystem['f4LifeFeedback']>):void {this.f4LifeFeedback=fn;}
  private emitF4LifeFeedback(kind:'splat'|'respawn',bot:CpuBot):void {
    if(!this.f4WholeNavigation||!this.f4LifeFeedback)return;
    try{this.f4LifeFeedback(kind,bot.team,bot.position.clone().add(new Vec3(0,.68,0)));}catch{/* cosmetic only */}
  }
  public constructor(
    private readonly app: AppBase,
    private navigation: RecastStageNavigation,
    private readonly gameplayInk: GameplayInkSystem,
    private readonly coordinator: PaintCoordinator,
    private readonly stats: PerformanceStats,
    private readonly stage: StageDefinition,
    humanTeam: Team.A | Team.B,
    private readonly phase14eFirstDrop?: UndertowPhase14ECpuAdapter,
    private readonly phase14qGroundCollision?: CpuSharedGroundStepAuthority,
    private readonly phase14qHumanCrowd?: CpuHumanCrowdFootAuthority,
    private readonly phase14qF2RecoverableSteps = false
  ) {
    // T20 remains bit-for-bit on the old CPU update path unless an explicit
    // T21-D QA-only runtime adapter is injected. Any other stage FAILS closed.
    if (phase14eFirstDrop &&
        stage.metadata.id !== 'undertow-t21d-partial-connectivity-qa')
      throw new Error('T21_PHASE14E_PRODUCTION_CPU_ADAPTER_FORBIDDEN');
    if(phase14qGroundCollision &&
      (!phase14eFirstDrop ||
       stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'))
      throw Error('T21_PHASE14Q_SHARED_COLLISION_PRODUCTION_FORBIDDEN');
    if(phase14qHumanCrowd&&
      (!phase14eFirstDrop||
       stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'))
      throw Error('T21_PHASE14Q_HUMAN_CROWD_PRODUCTION_FORBIDDEN');
    // F2 is an explicitly opted-in QA reconciliation, never a production
    // collision bypass. The original strict M4 fail-closed path stays default.
    if(this.phase14qF2RecoverableSteps&&
       (!phase14qGroundCollision||!phase14eFirstDrop||
        !phase14qGroundCollision.shouldDeferF2FirstDrop||
        stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'))
      throw Error('T21_F2_REQUIRES_FULL_SOURCE_PHYSICAL_QA');
    this.director = new CpuTacticalDirector(gameplayInk, stage);
    this.materialA = makeCpuMaterial(GAME_CONFIG.visual.teamA);
    this.materialB = makeCpuMaterial(GAME_CONFIG.visual.teamB);
    this.reset(humanTeam);
  }

  /** Startup handoff, before any playable tick in the whole Trimesh. */
  public useF4WholeNavigation(navigation:RecastStageNavigation):void{
    if(this.f4WholeNavigation||this.activeLastTick||
       !isT21F4ResearchStage(this.stage)||
       !this.phase14qGroundCollision?.settleF4WholeCpuSpawn)
      throw Error('T21_F4_WHOLE_CPU_BOOT_REQUIRED');
    for(const bot of this.bots){
      if(bot.agent)this.navigation.removeAgent(bot.agent);
      bot.agent=null;
      bot.entity.enabled=false;
      this.f4PendingSpawns.add(bot.id);
    }
    this.navigation=navigation;
    this.f4WholeNavigation=true;
    // Only the installed local Rapier world may back this counterfire.
    // The frozen SOURCE authorization remains independently gated.
    this.b213SourceCounterfireEnabled=this.f4ResearchCombatStageRay!==null;
    this.syncStats();
  }

  private f4SpawnAgent(bot:CpuBot,slotIndex=bot.slot):{foot:Vec3;agent:CrowdAgent}|null{
    const slots=bot.team===Team.A?this.stage.metadata.teamASpawnSlots:
      this.stage.metadata.teamBSpawnSlots;
    const slot=slots[slotIndex];
    if(!slot)return null;
    const physical=this.phase14qGroundCollision!.settleF4WholeCpuSpawn!(
      bot.id,{x:slot[0],y:slot[1],z:slot[2]});
    if(!physical)return null;
    const foot=new Vec3(physical.x,physical.y,physical.z);
    const projection=this.navigation.auditNavMeshProjection(foot);
    if(!projection.success||projection.distanceMeters===null||
       projection.distanceMeters>.25){
      this.phase14qGroundCollision!.removeRealCpuFoot?.(bot.id);
      return null;
    }
    return {foot,agent:this.navigation.addAgent(foot)};
  }

  private admitF4CpuSpawns():void{
    if(!this.f4PendingSpawns.size||this.f4FirstSpawn&&!this.f4FirstCpuMoved)return;
    if(this.f4SpawnRetry>0){
      this.f4SpawnRetry--;
      return;
    }
    this.f4SpawnRetry=29;
    for(const bot of this.bots){
      if(!this.f4PendingSpawns.has(bot.id))continue;
      const spawn=this.f4SpawnAgent(bot);
      if(!spawn)continue;
      bot.agent=spawn.agent;
      bot.position.copy(spawn.foot);
      bot.previousPosition.copy(spawn.foot);
      bot.entity.setPosition(spawn.foot.x,spawn.foot.y+.68,spawn.foot.z);
      bot.entity.enabled=true;
      this.f4PendingSpawns.delete(bot.id);
      if(!this.f4FirstCpuMoved){
        this.f4FirstSpawn=spawn.foot;
        break;
      }
    }
  }

  private f4VoidCheck?: (footY:number,grounded:boolean)=>boolean;
  public useF4VoidCheck(check:(footY:number,grounded:boolean)=>boolean):void {
    this.f4VoidCheck=check;
  }

  private updateF4Drop(bot:CpuBot,dt:number):boolean{
    let drop=this.f4Drops.get(bot.id);
    if(!drop){
      if(!bot.agent||bot.jumpCooldownSeconds>0)return false;
      const plan=this.f3dSourceGoals?.chooseF4WholeDrop?.(bot.id,bot.position);
      if(!plan||!this.phase14qGroundCollision?.moveF4WholeDrop||
         this.bots.some(other=>{
           const active=this.f4Drops.get(other.id);
           return active&&(plan.center?active.center:!active.center&&other.team===bot.team);
         }))return false;
      drop={target:plan.target,verticalSpeed:plan.jumpSpeed,elapsed:0,center:plan.center};
      this.f4Drops.set(bot.id,drop);
      this.navigation.removeAgent(bot.agent);
      bot.agent=null;
      bot.mobilityState='FIRST_DROP_FALL';
      this.sourceLiveNativeMotionGoal.delete(bot.id);
      this.sourceLastAdmittedRouteGoal.delete(bot.id);
      this.sourceCrowdProjectionHold.delete(bot.id);
    }
    drop.elapsed+=dt;
    drop.verticalSpeed=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      drop.verticalSpeed-GAME_CONFIG.player.gravityMetersPerSecond2*dt);
    const dx=drop.target.x-bot.position.x,dz=drop.target.z-bot.position.z;
    const span=Math.hypot(dx,dz);
    const factor=span>0?Math.min(1,GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt/span):0;
    const result=this.phase14qGroundCollision!.moveF4WholeDrop!(bot.id,
      bot.position,{x:dx*factor,y:drop.verticalSpeed*dt,z:dz*factor});
    if(result){
      const climbed=result.foot.y-bot.position.y;
      if(drop.verticalSpeed>0&&climbed<drop.verticalSpeed*dt*.25)
        drop.verticalSpeed=0;
      bot.position.set(result.foot.x,result.foot.y,result.foot.z);
      this.phase14qGroundCollision!.syncRealCpuFoot(bot.id,bot.position);
      if(!result.grounded){
        if(this.f4VoidCheck?.(bot.position.y,false)){
          // Genuine environmental death, never a human/direct-hit credit.
          bot.hp=0;
          bot.lethalHumanDirect=false;
          this.splatBot(bot);
        }
        return true;
      }
      drop.verticalSpeed=0;
    }
    const landedAtTargetLevel=!!result&&Math.abs(bot.position.y-drop.target.y)<=.28&&
      Math.hypot(bot.position.x-drop.target.x,bot.position.z-drop.target.z)<=.40;
    const abortedOnUsableFloor=drop.elapsed>1.75&&
      !!this.phase14qGroundCollision!.sourceFootSupport?.(bot.id,bot.position);
    if(!landedAtTargetLevel&&!abortedOnUsableFloor)return true;
    const projection=this.navigation.auditNavMeshProjection(bot.position);
    if(!projection.nearestPoint||!projection.success||
       Math.abs(projection.nearestPoint.y-bot.position.y)>.28||
       Math.hypot(projection.nearestPoint.x-bot.position.x,
         projection.nearestPoint.z-bot.position.z)>.34)return true;
    bot.agent=this.navigation.addAgent(bot.position);
    bot.mobilityState='GROUND';
    bot.thinkRemaining=0;
    bot.jumpCooldownSeconds=drop.center&&landedAtTargetLevel?0:1.5;
    this.f4Drops.delete(bot.id);
    this.f4ZipRecovery.delete(bot.id);
    return true;
  }

  /** Decorates seven EXISTING native CPU entities. Render only. */
  public enableB248Visuals():void {
    if(this.b248VisualEnabled)return;
    this.b248VisualEnabled=true;
    for(const bot of this.bots)this.b248VisualByActor.set(
      bot.id,decorateB248Actor(bot.entity,bot.team===Team.A?'A':'B','CPU'));
  }

  /** B255 native source visual only; keep all real CPU bodies and AI. */
  public setB248VisualsShown(shown:boolean):void {
    if(!this.b248VisualEnabled&&shown)this.enableB248Visuals();
    this.b248VisualShown=shown;
    for(const visual of this.b248VisualByActor.values())
      visual.setEnabled(shown);
  }

  /** This is intentionally not a production constructor option. */
  public useF3dOriginalSourceGoals(source:CpuQaSourceGoalAuthority):void{
    if(!this.phase14qF2RecoverableSteps||
       !this.phase14eFirstDrop||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       !this.phase14qGroundCollision)
      throw Error('T21_F3D_SOURCE_TACTICAL_GOALS_NONPRODUCTION_ONLY');
    this.f3dSourceGoals=source;
  }

  /** B234 opt-in on the real 7 CpuBot objects, only with full F3 guards.
   * Deliberately no new jump authority: missing source faces stay missing. */
  public enableB234OriginalGapReadinessReadOnly(physics:RapierStagePhysics):void{
   if(!this.f3dSourceGoals||!this.phase14eFirstDrop||
      !this.phase14qGroundCollision||!this.phase14qF2RecoverableSteps||
      this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
    throw Error('B234_REAL_F3_CPU_READINESS_NOT_AUTHORIZED');
   this.b234OriginalCpuReadiness=
    new B234OriginalCpuGapReadinessAudit(this.stage,physics,this.navigation);
   this.b234ObserveRealCpu();
  }
  public b234OriginalGapReadinessSnapshot(){
   return this.b234OriginalCpuReadiness?.snapshot()??null;
  }
  private b234ObserveRealCpu():void{
   this.b234OriginalCpuReadiness?.observeActualSevenCpu(
    this.bots.map(bot=>({
     id:bot.id,foot:bot.position,lifeState:bot.lifeState,
     mobilityState:bot.mobilityState,
     crowdPosition:bot.agent?.position()??null
    })));
  }
  /** Experimental source-only frozen T21; default keeps original
   * repeated native retarget behavior and production CPU is untouched.
   */
  public enableB35SourceNativeRetargetSuppression():void{
   if(!this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
      !this.phase14qGroundCollision||
      this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
    throw Error('T21_W10B35_PRODUCTION_NATIVE_RETARGET_FORBIDDEN');
   this.b35OptInNativeRefresh=true;
  }
  public b35NativeSourceRetargetSnapshot(){
   return {
    enabled:this.b35OptInNativeRefresh,
    nativeRequestIssued:this.b35RealNativeRequests,
    redundantUnchangedRequestsSuppressed:
     this.b35DuplicateNativeRequestsSuppressed,
    noExtraNavOrGameplayAuthority:true,
    sourceOnly:true,productionAuthorized:false
   };
  }
  public enableB64NativeSourceInkAngleSweep():void{
    if(!this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       !this.phase14qGroundCollision||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||
       this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(p=>(p.flags & SurfaceFlags.Scoreable)!==0))
      throw Error('W10_B64_UNVERIFIED_SOURCE_INK_SWEEP_FORBIDDEN');
    this.b64InkAngleSweepEnabled=true;
  }
  /** Genuine source-lab ONLY: non-scoreable original paint under an actual
   * CPU foot affects recovery using the EXISTING CPU resource rules.
   * The standard scoreable Turf semantics are unaffected.
   */
  public enableB178OriginalSourceInkRecovery():void{
    if(!this.b64InkAngleSweepEnabled||!this.f3dSourceGoals||
       !this.phase14eFirstDrop||!this.phase14qGroundCollision||
       !this.phase14qF2RecoverableSteps||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||
       this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(x=>(x.flags & SurfaceFlags.Scoreable)!==0))
      throw Error('B178_NONORIGINAL_NONSCORING_SOURCE_RECOVERY_FORBIDDEN');
    this.b178RealSourceInkRecovery=true;
  }
  /** B180: explicit-only more useful original-source unpainted patches.
   * Candidate selection only, never changes CPU foot, goal or damage.
   */
  public enableB180OriginalPatchPaintAim():void{
    if(!this.b178RealSourceInkRecovery||!this.b64InkAngleSweepEnabled||
       !this.f3dSourceGoals||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(x=>(x.flags & SurfaceFlags.Scoreable)!==0))
      throw Error('B180_UNVERIFIED_ORIGINAL_PATCH_AIM_NOT_ALLOWED');
    this.b180OriginalPatchAimEnabled=true;
  }
  /** B181: only original registered Rapier cover; no path/hit scoring. */
  public enableB181OriginalSourceCombatSight(
    originalStageRayBlocked:(from:B181SightPoint,to:B181SightPoint)=>boolean
  ):void{
    if(!this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       !this.phase14qGroundCollision||!this.phase14eFirstDrop||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(x=>(x.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('B181_ORIGINAL_SOURCE_COMBAT_SIGHT_FORBIDDEN');
    this.b181OriginalCombatStageRay=originalStageRayBlocked;
    this.b181CachedCombat.clear();
  }
  /** Enable normal paid CPU weapons to SELECT only real visible opponents in
   * the explicitly isolated F4 lab. Reuse the pure B181 candidate
   * selector, not its 25-solid permission, moving-aim or counterfire flags.
   * Every actual bullet, hit and movement is still handled by Rapier/KCC. */
  public enableF4ResearchCpuCombatSight(
    actualResearchStageRayBlocked:(from:B181SightPoint,to:B181SightPoint)=>boolean
  ):void{
    if(!isT21F4ResearchStage(this.stage)||
       !this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       !this.phase14qGroundCollision||!this.phase14eFirstDrop||
       this.b181OriginalCombatStageRay!==null||
       this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('F4_CPU_SIGHT_RESEARCH_STAGE_ONLY');
    this.f4ResearchCombatStageRay=actualResearchStageRayBlocked;
    this.b181CachedCombat.clear();
  }
  public enableB212OriginalPhysicalMovingEnemyAim():void{
    if(!this.b181OriginalCombatStageRay||!this.f3dSourceGoals||
       !this.phase14qF2RecoverableSteps||!this.phase14eFirstDrop||
       !this.phase14qGroundCollision||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('B212_PRODUCTION_ORIGINAL_COMBAT_LEAD_FORBIDDEN');
    this.b212NativeLeadEnabled=true;
  }
  public b212OriginalPhysicalEnemyAimSnapshot(){
    return {enabled:this.b212NativeLeadEnabled,
     realPhysicalVelocitySamples:this.b212NativeLeadCandidates,
     actualNativeAimAdjustments:this.b212NativeAimAccepted,
     originalRapierCoverRejects:this.b212OriginalCoverRejects,
     targetTeleports:0 as const,damageInjected:0 as const,
     opponentRoutesCertified:0 as const,sourceScoreable:0 as const,
     productionAuthorized:false as const};
  }
  /** B213 genuine local source combat only. Original B181 cover stays required. */
  public enableB213SourcePhysicalCounterfire():void{
    if(!this.b212NativeLeadEnabled||!this.b181OriginalCombatStageRay||
       !this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       !this.phase14qGroundCollision||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('B213_UNAUTHORIZED_NATIVE_CPU_COUNTERFIRE');
    this.b213SourceCounterfireEnabled=true;
  }
  public b213SourceCounterfireSnapshot(){
    return {enabled:this.b213SourceCounterfireEnabled,
      actualProjectileDamageAttributions:this.b213RealAttackerDamageEvents,
      originalSightAcceptedRetaliations:this.b213VisibleRetaliationSelections,
      fabricatedShots:0 as const,fabricatedDamage:0 as const,
      actorTeleports:0 as const,originalRoutesCertified:0 as const,
      originalScoreable:0 as const,productionAuthorized:false as const};
  }
  /** B215 reuses B214 genuine B64/B178/B180, never production. */
  public enableB215SourceBattleNativeWeaponReadyPaintPacing():void{
    if(!this.b64InkAngleSweepEnabled||!this.b178RealSourceInkRecovery||
       !this.b180OriginalPatchAimEnabled||!this.b212NativeLeadEnabled||
       !this.b213SourceCounterfireEnabled||
       !this.phase14qF2RecoverableSteps||!this.phase14qGroundCollision||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(x=>(x.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('B215_UNAUTHORIZED_NATIVE_SOURCE_PAINT_PACING');
    this.b215SelectedBattlePaintPacing=true;
  }
  /** Feedback from PaintCoordinator AFTER a genuine original CPU
   * projectile raster. A streak can change only the order of existing
   * safe PAINT candidate checks; it grants NO physical/score/shot access.
   * Default FIXED patrol, T20 and nonselected SOURCE modes are untouched. */
  public observeSelectedSourceOriginalCpuImpact(
    actorId:string,
    outcome:'CHANGED'|'ALREADY_TEAM_OWNED'|
      'NO_ELIGIBLE_CELLS'|'OTHER_ZERO_CHANGE'
  ):void{
    if(!this.b215SelectedBattlePaintPacing||
       !this.b216SourceStageAimValidated||!this.f3dSourceGoals||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
      return;
    const bot=this.bots.find(b=>b.id===actorId);
    if(!bot||!this.sourceCpuMayStartActions(bot))return;
    if(outcome==='CHANGED'){
      this.selectedSourcePaintSaturation.delete(actorId);return;
    }
    // A mixed zero-change raster is ambiguous, not evidence of repeated
    // painting into already-owned or nonpaintable source cells.
    if(outcome!=='ALREADY_TEAM_OWNED'&&
       outcome!=='NO_ELIGIBLE_CELLS')return;
    const old=this.selectedSourcePaintSaturation.get(actorId);
    const footDistance=old?Math.hypot(
      bot.position.x-old.actualFootAtStart.x,
      bot.position.y-old.actualFootAtStart.y,
      bot.position.z-old.actualFootAtStart.z):Infinity;
    const unchangedImpacts=Number.isFinite(footDistance)&&
      footDistance<1.5?old!.unchangedImpacts+1:1;
    this.selectedSourcePaintSaturation.set(actorId,{
      unchangedImpacts:Math.min(16,unchangedImpacts),
      actualFootAtStart:footDistance<1.5?
        old!.actualFootAtStart:bot.position.clone()
    });
  }

  public b215RealSourceBattlePaintPacingSnapshot(){
    return {
      enabled:this.b215SelectedBattlePaintPacing,
      realWeaponCooldownPaintScansDeferred:
       this.b215RealWeaponCooldownPaintScansDeferred,
      byActor:Object.fromEntries(this.bots.map(bot=>[bot.id,{
        ...(this.b215NativeInkDecisionsByActor.get(bot.id)??{
          weaponReadyPaintChecks:0,approvedPaintAimChecks:0,
          noApprovedPaintAimChecks:0,checksWithoutNativeGoal:0,
          originalStageSightVetoes:0,backfillStageSightVetoes:0,
          insufficientInkMainShotAttempts:0
        }),
        weaponId:bot.weaponId,actualInk:bot.ink,
        weaponFireCooldownSeconds:bot.fireRemaining,
        lifeState:bot.lifeState,mobilityState:bot.mobilityState,
        hasRealCrowdAgent:bot.agent!==null,
        hasNativeSourceGoal:this.qaMotionGoals.has(bot.id),
        genuinelyRejoined:this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true
      }])),
      playerAmmoOrCpuShotInjection:0 as const,
      originalNavLinkWrites:0 as const,
      originalScoreableWrites:0 as const,
      productionAuthorized:false as const
    };
  }
  /** Original stage physics decides if each real source aim is reachable
   * by a genuine projectile. This cannot certify a CPU's walking path. */
  public enableB216OriginalSourceFloorSightBackfill(
    sourceStageAimValidated:(muzzle:B181SightPoint,
      target:B181SightPoint,actualFoot:B181SightPoint)=>boolean
  ):void{
    if(!this.b215SelectedBattlePaintPacing||
       !this.b64InkAngleSweepEnabled||!this.b178RealSourceInkRecovery||
       !this.b180OriginalPatchAimEnabled||
       !this.phase14qF2RecoverableSteps||!this.phase14qGroundCollision||
       !this.b181OriginalCombatStageRay||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
       this.stage.navigationLinks?.length!==26||
       this.stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
      throw Error('B216_NONORIGINAL_SOURCE_BACKFILL_FORBIDDEN');
    this.b216SourceStageAimValidated=sourceStageAimValidated;
  }
  /** SOURCE-only research, authorized only after the existing B216
   * real Rapier+range+ownerGrid paint fallback is enabled. It cannot
   * grant navigation, projectile contact, synthetic ink or Turf score. */
  public enableP2OriginalOuterSourceBackfill():void{
   if(!this.b216SourceStageAimValidated||
      !this.b215SelectedBattlePaintPacing||
      !this.b180OriginalPatchAimEnabled||
      !this.phase14qF2RecoverableSteps||
      this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
      this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
      this.stage.navigationLinks?.length!==26||
      this.stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
    throw Error('P2_OUTER_PAINT_ORIGINAL_SOURCE_HOLD');
   this.p2OuterOriginalBackfill=true;
  }
  public b216OriginalSourceBackfillSnapshot(){
    return {
      enabled:this.b216SourceStageAimValidated!==null,
      p2OriginalOuterSelected:this.p2OuterOriginalBackfill,
      p2OriginalOuterSearches:this.p2OuterOriginalSearches,
      p2DenseRealFootSearches:this.selectedSourceDenseSearches,
      p2DenseRealFootApprovedAims:this.selectedSourceDenseApprovedAims,
      verticalSourceAimSearches:this.selectedSourceVerticalAimSearches,
      verticalRegisteredCandidateMatches:this.selectedSourceVerticalCandidateMatches,
      verticalOriginalSightVetoes:this.selectedSourceVerticalSightVetoes,
      verticalOriginalSightApprovedAims:this.selectedSourceVerticalApprovedAims,
      verticalApprovedByActor:Object.fromEntries(
       this.selectedSourceVerticalApprovedByActor??[]),
      verticalPaidShotOrImpactCertified:false as const,
      p2NativeSightApprovedOuterAims:this.p2OuterOriginalApprovedAims,
      p2ActualShotOrInkIncreaseCertified:false as const,
      realRapierStageAimChecks:this.b216RealOriginalFloorSightChecks,
      originalSourceBackfillAims:this.b216ApprovedPhysicalSourceAimTargets,
      ownedCenterWithTrueUnpaintedNeighborAims:
       this.b216OwnedCenterSourceBackfillAims,
      approvedReachedGoalShortRadiusAims:
       this.b216ApprovedReachedGoalShortRadiusAims,
      verifiedFrontAndAllyPaintSightChecks:this.b216OriginalTurfSightChecks,
      sourceBlockedTurfAimsRejected:this.b216OriginalTurfCoverVetoes,
      actualNativeSourceSubGridScans:this.nativeSourceSubGridScans,
      sourceSubGridScansDeferred:this.nativeSourceSubGridDeferred,
      sourceSubOriginalSightApprovedAims:this.nativeSourceSubValidAims,
      actorFootWrites:0 as const,newNavLinks:0 as const,
      fakeShots:0 as const,scoreableSourcePaint:0 as const,
      certifiedOpponentRoutes:0 as const,productionAuthorized:false as const
    };
  }
  public b181OriginalSourceCombatSightSnapshot(){
    return {
      enabled:this.b181OriginalCombatStageRay!==null,
      actualRegisteredStageRays:this.b181ActualStageRays,
      originalCoverRejects:this.b181ActualSourceOcclusions,
      visibleEnemySelections:this.b181VisibleSelections,
      b182RealActorSightCacheRechecks:this.b182RecheckedStaleNativeSight,
      b182FreshNativeSightCacheReuses:this.b182ReusedLiveNativeSight,
      actualEnemyWeaponHitsCertified:false as const,
      opponentNaturalRoutesCertified:false as const,
      sourceScoreablePromotions:0 as const,
      productionAuthorized:false as const
    };
  }
  public b180OriginalPatchAimSnapshot(){
    return {enabled:this.b180OriginalPatchAimEnabled,
      chosenRealUnpaintedSourcePatches:this.b180SelectedRealSourcePatches,
      actualRealOwnerGridOpportunitySum:this.b180SelectedRealPatchOpportunity,
      ownedCenterWithTrueUnpaintedNeighborAims:this.b180OwnedCenterSourcePatchAims,
      cpuNavUnchanged:true as const,sourceScoreable:0 as const,
      productionAuthorized:false as const};
  }
  public b178SourceInkResourceSnapshot(){
    return {enabled:this.b178RealSourceInkRecovery,
      actualOwnPaintFootTicks:this.b178OwnNativeTicks,
      actualEnemyPaintFootTicks:this.b178EnemyNativeTicks,
      actualNeutralFootTicks:this.b178NeutralNativeTicks,
      b179ActuallyRecoveredOwnSourceInk:Number(this.b179ActualOwnInkRecovered.toFixed(6)),
      b179OwnInkNativeRecoveryTicks:this.b179ActualOwnRecoverTicks,
      b179ActuallyLostHpOnEnemySourceInk:Number(this.b179ActualEnemyHpLost.toFixed(6)),
      // Read-only current Recast speed PARAMETERS, not measured motion.
      nativeCpuMaxSpeedByActor:Object.fromEntries(this.bots.map(bot=>
       [bot.id,this.b178NativeCpuMovementSpeed.get(bot.id)??null])),
      zeroSourceScoreable:true as const,productionAuthorized:false as const};
  }
  public b64NativeSourceInkSweepSnapshot(){
    return {
      enabled:this.b64InkAngleSweepEnabled,
      candidateSamples:this.b64Samples,
      unownedRealSourceCandidates:this.b64CandidatesUnowned,
      lateralPaintTargetsChosen:this.b64CandidatesChosen,
      originalSourceOnly:true,
      alternateCpuModeNotPromotedToDefault:true,
      newPhysicalSolids:0,newNavLinks:0,newScoreable:0,
      productionAuthorized:false
    };
  }
  /** Returns actual accepted CPU-foot trajectories, never Crowd suggestions. */
  public qaContinuitySnapshot(): CpuContinuityReport {
    return this.qaContinuity.snapshot();
  }

  /** Read only. A paid request still needs real ProjectileSystem dispatch,
   * registered Rapier collision and PaintCoordinator owner-grid evidence. */
  public blockedSourceActionSnapshot(){
    const byActor:Record<string,{
      supportedWindows:number;mainRequests:number;kitRequests:number
    }>=Object.fromEntries([...this.blockedSourceActionRows]
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([id,row])=>[id,{...row}]));
    return {source:'REGISTERED_RAPIER_FOOT_AFTER_CROWD_VETO' as const,
      byActor,
      supportedWindows:Object.values(byActor).reduce(
        (sum,row)=>sum+row.supportedWindows,0),
      mainRequests:Object.values(byActor).reduce(
        (sum,row)=>sum+row.mainRequests,0),
      kitRequests:Object.values(byActor).reduce(
        (sum,row)=>sum+row.kitRequests,0),
      trueProjectileLaunchesCertified:false as const,
      trueImpactCellsCertified:false as const,
      sourceScoreablePromotions:0 as const,
      newPhysicsOrNavLinks:0 as const};
  }

  /** Per-actor SOURCE 60Hz steering and actual KCC outcomes, no simulation.
   * "Crowd proposal" is NOT a certified physical step. */
  public sourceGroundStepEvidenceSnapshot(){
   const byActor=Object.fromEntries([...this.sourceGroundStepEvidence]
    .sort(([a],[b])=>a.localeCompare(b)).map(([id,row])=>[id,{
     ...row,rejectionCauses:{...row.rejectionCauses},
     lastRejectOwners:[...row.lastRejectOwners],
     lastRealFoot:[...row.lastRealFoot],
     lastCrowdCandidate:[...row.lastCrowdCandidate]
    }]));
   return {source:'REAL_SOURCE_RECAST_PROPOSAL_AND_RAPIER_KCC' as const,
    byActor,syntheticFootMoves:0 as const,syntheticGoals:0 as const,
    newSolids:0 as const,newNavLinks:0 as const,scoreablePromotions:0 as const,
    physicalMotionCertificationFromCounterAlone:false as const};
  }

  private observeSourceGroundStep(
   bot:CpuBot,event:'CROWD'|'KCC_REJECTED'|'KCC_APPROVED'|
    'KCC_TEAMMATE_SLIDE'|'CROWD_REANCHOR'|'OFFMESH_DEFER'|'OVERSPEED',
   candidate:Readonly<{x:number;y:number;z:number;kccGrounded?:boolean}>,
   cause?:string,owners:readonly string[]=[]
  ):void{
   if(!this.phase14qF2RecoverableSteps||
      this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
      this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)!==true||
      !this.sourceGroundStepEvidence)return;
   let row=this.sourceGroundStepEvidence.get(bot.id);
   if(!row){
    row={crowdNoStep:0,crowdProposals:0,rapierRejected:0,
     rapierAcceptedMoving:0,rapierAcceptedStationary:0,
     rapierActualTeammateSlides:0,
     offmeshDeferred:0,overspeedRejected:0,crowdReanchors:0,
     rejectionCauses:{},lastRejectCause:null,lastRejectOwners:[],
     lastRealFoot:[bot.position.x,bot.position.y,bot.position.z],
     lastCrowdCandidate:[bot.position.x,bot.position.y,bot.position.z]};
    this.sourceGroundStepEvidence.set(bot.id,row);
   }
   const d=Math.hypot(candidate.x-bot.position.x,
    candidate.y-bot.position.y,candidate.z-bot.position.z);
   if(event==='CROWD'){
    row.lastCrowdCandidate=[candidate.x,candidate.y,candidate.z];
    const steeringDistance=isT21F4ResearchStage(this.stage)
      ?Math.hypot(candidate.x-bot.position.x,candidate.z-bot.position.z):d;
    if(steeringDistance<=.001)row.crowdNoStep++;
    else row.crowdProposals++;
   }else if(event==='KCC_APPROVED'){
    if(d>.015)row.rapierAcceptedMoving++;
    else row.rapierAcceptedStationary++;
    if(candidate.kccGrounded!==undefined){
     row.lastF4KccGrounded=candidate.kccGrounded;
     row.lastF4KccStepTick=this.sourceNativeMotionTick;
    }
   }else if(event==='KCC_TEAMMATE_SLIDE'){
    row.rapierActualTeammateSlides++;
   }else if(event==='KCC_REJECTED'){
    row.rapierRejected++;
    const reason=cause??'UNSPECIFIED';
    row.rejectionCauses[reason]=(row.rejectionCauses[reason]??0)+1;
    row.lastRejectCause=reason;
    row.lastRejectOwners=owners.slice(0,8);
   }else if(event==='OFFMESH_DEFER')row.offmeshDeferred++;
   else if(event==='OVERSPEED')row.overspeedRejected++;
   else row.crowdReanchors++;
   row.lastRealFoot=event==='KCC_APPROVED'?
     [candidate.x,candidate.y,candidate.z]:
     [bot.position.x,bot.position.y,bot.position.z];
  }

  /** CPU weapon requests accepted for genuine paintable turf, per real actor. */
  public qaTurfShotSnapshot(): Readonly<Record<string, number>> {
    return Object.fromEntries(
      this.bots.map(bot => [bot.id, this.qaTurfShotsByActor.get(bot.id) ?? 0])
    );
  }

  /** Exact accepted ally-aim requests, not physical projectile proof. */
  public qaOriginalAllyInkShotRequests():number{
    return this.b152AcceptedSourceAimShots;
  }

  public reset(humanTeam: Team.A | Team.B): void {
    for(const id of this.f4ZipRuns.keys())this.f4NaturalSpecial?.zipEnd(id);
    this.f4ZipRuns.clear();this.f4ZipRecovery.clear();this.f4Drops.clear();
    this.clearF4LeadHistory();
    this.f4LeadAccepted=0;
    this.f4AimEvidence.currentTarget=this.f4AimEvidence.predictedTarget=
      this.f4AimEvidence.staleTargetRejected=this.f4AimEvidence.outOfRange=this.f4AimEvidence.covered=0;
    this.qaContinuity.reset();
    this.qaMotionGoals.clear();
    this.sourceLastAdmittedRouteGoal.clear();
    this.sourceLiveNativeMotionGoal.clear();
    this.sourceCrowdRefreshedThisLife.clear();
    this.sourceCrowdRecoveryFoot.clear();
    this.sourceLastPhysicalBlockedTick.clear();
    this.sourceCrowdProjectionHold.clear();
    this.sourceLastRecoveryAuditTick.clear();
    this.sourceNativeMotionTick=0;
    this.b35LastNativeTarget.clear();
    this.b35RealNativeRequests=0;
    this.b35DuplicateNativeRequestsSuppressed=0;
    this.qaTurfShotCooldown.clear();
    this.blockedSourceActionRows.clear();
    this.sourceGroundStepEvidence.clear();
    this.sourceCommittedPaintAims.clear();
    this.qaTurfShotsByActor.clear();
    this.b152AcceptedSourceAimShots=0;
    this.b64NoTargetCooldown.clear();
    this.b64Samples=0;
    this.b64CandidatesUnowned=0;
    this.b64CandidatesChosen=0;
    this.b178NativeCpuMovementSpeed.clear();
    this.b178NativeCpuSpeedAgent.clear();
    this.b178OwnNativeTicks=0;
    this.b178EnemyNativeTicks=0;
    this.b178NeutralNativeTicks=0;
    this.b179ActualOwnInkRecovered=0;
    this.b179ActualOwnRecoverTicks=0;
    this.b179ActualEnemyHpLost=0;
    this.b180SelectedRealSourcePatches=0;
    this.b180SelectedRealPatchOpportunity=0;
    this.b180OwnedCenterSourcePatchAims=0;
    this.b216OwnedCenterSourceBackfillAims=0;
    this.b181CachedCombat.clear();
    this.b181NativeFrame=0;
    this.f4VisualAimTick.clear();
    this.b213RealAttackerDamageEvents=0;
    this.b213VisibleRetaliationSelections=0;
    this.b215RealWeaponCooldownPaintScansDeferred=0;
    this.b215NativeInkDecisionsByActor.clear();
    this.selectedSourcePaintSaturation.clear();
    this.selectedSourceEmptyAimStreak.clear();
    this.nativeSourceSubScanByActor.clear();
    this.nativeSourceSubGridScans=0;
    this.nativeSourceSubGridDeferred=0;
    this.nativeSourceSubValidAims=0;
    this.selectedSourceDenseSearches=0;
    this.selectedSourceDenseApprovedAims=0;
    this.selectedSourceVerticalAimSearches=0;
    this.selectedSourceVerticalCandidateMatches=0;
    this.selectedSourceVerticalSightVetoes=0;
    this.selectedSourceVerticalApprovedAims=0;
    this.selectedSourceVerticalApprovedByActor.clear();
    this.b216RealOriginalFloorSightChecks=0;
    this.b216ApprovedPhysicalSourceAimTargets=0;
    this.b216ApprovedReachedGoalShortRadiusAims=0;
    this.b216OriginalTurfSightChecks=0;
    this.b216OriginalTurfCoverVetoes=0;
    this.b181NativeHumanColliderMode='HUMAN';
    this.b181ActualStageRays=0;
    this.b181ActualSourceOcclusions=0;
    this.b181VisibleSelections=0;
    this.b182RecheckedStaleNativeSight=0;
    this.b182ReusedLiveNativeSight=0;
    this.stats.cpuSourceTurfShots = 0;
    this.stats.cpuQaSuspectedStalls = 0;
    this.stats.cpuQaLongestStationarySeconds = 0;
    this.phase14eFirstDrop?.reset();
    this.phase14qGroundCollision?.resetActors();
    for (const bot of this.bots) {
      if (bot.agent) this.navigation.removeAgent(bot.agent);
      bot.entity.destroy();
      bot.jumpMarker.destroy();
      bot.guardEntity.destroy();
    }
    this.bots.length = 0;
    this.pendingShots.length = 0;
    this.pendingKitRequests.length = 0;
    this.stats.cpuTacticalRetargets = 0;
    this.stats.cpuPaintRequests = 0;
    this.stats.cpuShots = 0;
    this.stats.cpuCombatHits = 0;
    this.stats.humanCpuDirectHits = 0;
    this.stats.humanCpuDirectSplats = 0;
    this.stats.cpuSplats = 0;
    this.stats.cpuRespawns = 0;
    this.stats.cpuSuperJumps = 0;
    this.stats.cpuSuperJumpPrep = 0;
    this.stats.cpuSuperJumpAirborne = 0;
    this.stats.cpuSuperJumpLandings = 0;
    this.stats.cpuSuperJumpCancels = 0;
    this.stats.cpuSuperJumpLast = '-';
    this.stats.cpuWeaponGuardBlocks = 0;
    this.stats.cpuAdvancedQa = 'default';
    this.stats.cpuSubUses = 0;
    this.stats.cpuSpecialActivations = 0;
    this.stats.cpuKitLast = '-';
    this.stats.cpuScoreablePaintMeters2 = 0;

    const teamACount = humanTeam === Team.A ? 3 : 4;
    const teamBCount = GAME_CONFIG.cpu.cpuPlayers - teamACount;
    this.spawnTeam(Team.A, teamACount);
    this.spawnTeam(Team.B, teamBCount);
    this.activeLastTick = false;
    this.syncStats();
  }

  public fixedUpdate(
    dt: number,
    matchActive: boolean,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean,
    humanNativeGrounded = true,
    // B377: explicit F3-only last native tick guard. Default true keeps
    // frozen T20 and every existing CPU source caller byte-for-byte active.
    canStartNewCombatActions = true,
    // Physical HUMAN collider existence is independent from targeting:
    // SOURCE diagnostic modes may keep the player alive but not targetable.
    humanPhysicalColliderActive = humanActive,
    humanPhysicalColliderMode:'HUMAN'|'SQUID'='HUMAN'
  ): void {
    if (!matchActive) {
      this.clearF4LeadHistory();
      this.b212PriorHuman=null;
      this.b212PreviousHuman=null;
      this.qaContinuity.reset();
      this.qaMotionGoals.clear();
      this.sourceLiveNativeMotionGoal.clear();
      this.qaTurfShotCooldown.clear();
      this.stats.cpuQaSuspectedStalls = 0;
      this.stats.cpuQaLongestStationarySeconds = 0;
      // Ensure no kinematic body or detached CrowdAgent leaks across matches.
      // This branch only exists for the explicitly injected QA-only adapter.
      if (this.phase14eFirstDrop) {
        for (const bot of this.bots) {
          if(this.f4ZipRuns.has(bot.id)||this.f4ZipRecovery.has(bot.id))continue;
          if (bot.mobilityState === 'FIRST_DROP_FALL') {
            this.phase14eFirstDrop.cancel(bot.id);
            bot.agent = this.navigation.addAgent(bot.position);
            bot.mobilityState = 'GROUND';
          }
        }
      }
      this.pendingKitRequests.length = 0;
      if (this.activeLastTick) {
        for (const bot of this.bots) {
          bot.agent?.resetMoveTarget();
          this.resetCpuWeaponRuntime(bot);
          // T21: preserve source-backed Crowd stabilization across a paused
          // match. Canceling it as a tactical jump would reactivate the unsafe
          // recycled offmesh height before the lower-layer gate passes.
          if (bot.mobilityState !== 'GROUND' &&
              bot.mobilityState !== 'FIRST_DROP_REJOIN'&&!this.f4ZipRuns.has(bot.id)&&!this.f4ZipRecovery.has(bot.id))
            this.cancelCpuJump(bot, true);
        }
      }
      this.activeLastTick = false;
      this.syncStats();
      return;
    }

    this.activeLastTick = true;
    if(this.f3dSourceGoals&&this.phase14qF2RecoverableSteps)
      this.sourceNativeMotionTick++;
    // The same actual 60Hz player collider mode is passed to the shared
    // Rapier actor registration and the SOURCE-only enemy sight query.
    // Legacy T20/QA sight without B181 keeps its old HUMAN aim baseline.
    // Separate F4 51-solid optical sight must reflect the same current
    // real HUMAN capsule / SQUID sphere as projectile contact, and age
    // cached sight at true native ticks. 25-solid B181 remains isolated.
    const nativeSight=this.b181OriginalCombatStageRay!==null||
      this.f4ResearchCombatStageRay!==null;
    this.b181NativeHumanColliderMode=nativeSight?
      humanPhysicalColliderMode:'HUMAN';
    if(nativeSight)this.b181NativeFrame++;
    this.b212PriorHuman=this.b212PreviousHuman;
    this.b212PreviousHuman=(this.b212NativeLeadEnabled||this.f4WholeNavigation)&&humanActive?
      humanPosition.clone():null;
    // Actual player KCC already finished for this tick. Sample before any
    // CPU chooses a target; airborne targets get direct aim, never lead.
    if(this.f4LeadEnabled&&this.f4WholeNavigation){
      this.sampleF4LeadBody('HUMAN',humanActive?humanPosition:null,
        humanNativeGrounded?humanPhysicalColliderMode:humanPhysicalColliderMode+':AIR',
        humanNativeGrounded);
    }
    // The REAL HUMAN PlayerController is at humanPosition. Only the eighth
    // passive Crowd neighbour is moved to its source-backed physical foot.
    // This cannot be applied to production T20 or non-source T21 terrain.
    const liveHumanFoot=(this.phase14qHumanCrowd||this.phase14qGroundCollision)?{
      x:humanPosition.x,
      y:humanPosition.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
      z:humanPosition.z
    }:null;
    if(liveHumanFoot){
      // The physical HUMAN is authoritative even when its passive Crowd
      // neighbour is omitted (e.g. while a real human freely jumps in F3).
      // B280: never attach nonphysical eighth steering proxy during
      // genuine Rapier airborne descent. Preserve ALL seven real CPU
      // agents and original shared Rapier collision regardless.
      if(!this.f4WholeNavigation)
        this.phase14qHumanCrowd?.syncActualPlayerFoot(
          liveHumanFoot,humanActive&&humanNativeGrounded);
      this.phase14qGroundCollision?.syncActualHumanFoot(
        liveHumanFoot,humanPhysicalColliderActive,humanPhysicalColliderMode);
    }

    // T21 QA-only: register actual source-authoritative CPU feet in the
    // PlayerController's original-solid Rapier world before any Crowd step.
    // Observing feet is not teleport authorization or collision resolution.
    if(this.f4WholeNavigation)this.admitF4CpuSpawns();
    if(this.phase14qGroundCollision){
      for(const bot of this.bots){
        if(bot.lifeState==='ACTIVE'&&
           (!this.f4WholeNavigation||!this.f4PendingSpawns.has(bot.id)))
          this.phase14qGroundCollision.syncRealCpuFoot(bot.id,bot.position);
      }
    }

    for (const bot of this.bots) {
      if(this.f4WholeNavigation&&this.f4PendingSpawns.has(bot.id))continue;
      if (bot.lifeState === 'SPLATTED') {
        if(this.f4PhysicalSpecialProbe?.actorId===bot.id)this.f4PhysicalSpecialProbe.cancel();
        bot.respawnRemainingSeconds = Math.max(0, bot.respawnRemainingSeconds - dt);
        // SOURCE runs at exactly 60 Hz with a 2.5s/150-tick respawn.
        // Repeated binary floating subtraction leaves ~4e-15s at tick
        // 150 and used to delay the real CPU for an extra native frame.
        // The tolerance is far below any physical tick; keep frozen T20
        // and non-SOURCE QA's historical timer boundary unchanged.
        if (bot.respawnRemainingSeconds <=
            (this.f3dSourceGoals !== null ? 1e-9 : 0))
          this.respawnBot(bot);
        continue;
      }

      bot.jumpCooldownSeconds = Math.max(0, bot.jumpCooldownSeconds - dt);
      bot.jumpRespawnWindowSeconds = Math.max(0, bot.jumpRespawnWindowSeconds - dt);
      bot.subCooldownSeconds = Math.max(0, bot.subCooldownSeconds - dt);
      bot.specialDecisionCooldownSeconds = Math.max(
        0,
        bot.specialDecisionCooldownSeconds - dt
      );
      bot.previousPosition.copy(bot.position);
      if(this.f4ZipRuns.has(bot.id)){
        if(canStartNewCombatActions)this.tickF4CpuZip(bot,dt,humanTeam,humanPosition,humanActive);
        continue;
      }
      if(this.f4ZipRecovery.has(bot.id)&&!canStartNewCombatActions)continue;
      if(this.f4WholeNavigation&&this.updateF4Drop(bot,dt)){
        if(this.f4PhysicalSpecialProbe?.actorId===bot.id)this.f4PhysicalSpecialProbe.cancel();
        this.f4NaturalSpecial?.cancel(bot.id);
        continue;
      }
      if (bot.mobilityState === 'FIRST_DROP_FALL') {
        const frame=this.phase14eFirstDrop?.advance(bot.id,dt);
        if (!frame||!frame.continuous)
          throw new Error('T21_PHASE14E_CPU_FALL_UNSAFE_FRAME');
        if(this.phase14qGroundCollision){
          const contact=this.phase14qGroundCollision.auditAirborneSourceFoot(
            bot.id,bot.position,frame.foot,dt,frame.continuous
          );
          if(!contact.approved)
            throw Error('T21_PHASE14Q_ACTUAL_FIRST_DROP_ACTOR_CONTACT '+JSON.stringify({
              botId:bot.id,cause:contact.cause,
              collidedWith:contact.actorCollisionCandidate,
              from:[bot.position.x,bot.position.y,bot.position.z],
              actualOriginalKccCandidate:frame.foot,
              unchangedBotVisualFoot:true,
              noRecastTeleport:true,
              activationAuthorized:false
            }));
        }
        bot.position.set(frame.foot.x,frame.foot.y,frame.foot.z);
        if(frame.landed){
          const closest=this.navigation.closestPoint(bot.position);
          if(Math.hypot(
            closest.x-bot.position.x,closest.y-bot.position.y,
            closest.z-bot.position.z)>.65)
            throw new Error('T21_PHASE14E_UNSUPPORTED_NAV_RESUME');
          bot.agent=this.navigation.addAgent(bot.position);
          // This is a landing recovery, not permission to reuse the
          // upper-to-lower Crowd offmesh target. Let it settle at the
          // original source-backed lower landing before tactical retarget.
          bot.agent.resetMoveTarget();
          bot.mobilityState='FIRST_DROP_REJOIN';
          bot.rejoinElapsedFrames=0;
          bot.rejoinStableFrames=0;
          bot.rejoinRetryCount=0;
          bot.rejoinPhysicalLandingFoot.copy(bot.position);
          this.phase14eFirstDrop!.cancel(bot.id);
          // Wait for the reused offmesh Crowd slot to settle before CPU actions.
        }
        continue;
      }

      if (bot.mobilityState === 'FIRST_DROP_REJOIN') {
        if(!this.phase14eFirstDrop||!bot.agent)
          throw new Error('T21_PHASE14H_REJOIN_AGENT_MISSING');
        bot.rejoinElapsedFrames++;
        // F2 can meet an old Detour offmesh Crowd slot that keeps
        // replaying the upper-layer animation after the actual Rapier
        // KCC has landed on the original lower slab. A bounded retry
        // rebuilds ONLY that stale steering agent at the still-approved
        // physical foot. This never moves the CPU, KCC, scene, or stage.
        if(this.phase14qF2RecoverableSteps&&
           bot.rejoinElapsedFrames>50&&
           bot.rejoinStableFrames<3&&
           bot.rejoinRetryCount<2){
          const native=this.navigation.closestPoint(bot.position);
          if(Math.hypot(native.x-bot.position.x,
             native.y-bot.position.y,native.z-bot.position.z)>.20)
            throw Error('T21_F2_REJOIN_PHYSICAL_FOOT_NOT_ON_SOURCE_NAV');
          this.navigation.removeAgent(bot.agent);
          bot.agent=this.navigation.addAgent(bot.position);
          bot.agent.resetMoveTarget();
          bot.rejoinRetryCount++;
          bot.rejoinElapsedFrames=0;
          continue;
        }
        if(bot.rejoinElapsedFrames>(this.phase14qF2RecoverableSteps?180:45)){
          this.navigation.removeAgent(bot.agent);
          bot.agent=null;
          throw new Error('T21_PHASE14H_REJOIN_STABILITY_TIMEOUT '+JSON.stringify({
            botId:bot.id,rejoinRetries:bot.rejoinRetryCount,
            physicalFoot:[bot.position.x,bot.position.y,bot.position.z],
            sourcePhysicalFootPreserved:true
          }));
        }
        continue;
      }

      if (bot.mobilityState === 'JUMP_TRAVEL' || bot.mobilityState === 'JUMP_LANDING') {
        this.updateCpuJumpAirborne(bot, dt);
        continue;
      }

      this.updateResources(bot, dt);
      if (bot.hp <= 0) {
        this.splatBot(bot);
        continue;
      }

      if (bot.mobilityState === 'JUMP_PREP') {
        bot.jumpPrepRemaining = Math.max(0, bot.jumpPrepRemaining - dt);
        if (bot.jumpPrepRemaining <= 0) this.beginCpuJumpTravel(bot);
        continue;
      }

      bot.thinkRemaining -= dt;
      if (bot.thinkRemaining <= 0) {
        // An invalid original Recast projection quarantines ONLY this
        // passive steering proxy. Never reissue movement while the true
        // Rapier foot has not been independently revalidated.
        if(this.phase14qF2RecoverableSteps&&this.f3dSourceGoals&&
           this.sourceCrowdProjectionHold.has(bot.id)){
          bot.thinkRemaining=GAME_CONFIG.cpu.tacticalThinkSeconds;
          continue;
        }
        // A QA source-local patrol must not invoke a jump to an
        // unbound central/high island. Ordinary T20 jump logic is intact.
        const jumpStarted=this.f3dSourceGoals?false:
          this.tryStartTacticalJump(
            bot,humanTeam,humanPosition,humanActive,false
          );

        if (!jumpStarted) {
          let sourceGoal=this.f3dSourceGoals?.chooseSourceGoal(
            bot.id,bot.position,this.goal,this.f4WholeNavigation&&
            !this.f4Drops.has(bot.id)&&!this.f4PendingSpawns.has(bot.id)&&
            !bot.weaponGuarding&&!bot.f4CanopyOpen&&bot.weaponChargeSeconds<=0&&
            bot.weaponBurstShotsRemaining<=0)??false;
          // Distinguish the real SOURCE original goal approval from the
          // final native Crowd endpoint. These are NOT equivalent on a
          // multi-floor Recast mesh; no unapproved projection is submitted.
          let projectedApprovedSourceGoal:Readonly<{
            x:number;y:number;z:number
          }>|null=null;
          let newlyAuditedOriginalSourceGoal=false;
          // Original SOURCE only: a closestPoint projection may be on a
          // disconnected island. A true Recast route from the ACTUAL Rapier
          // foot is necessary before requesting Crowd movement. Keep the
          // existing KCC veto as the sole per-step physical authority.
          if(sourceGoal&&this.phase14qF2RecoverableSteps){
            // A REAL registered Rapier floor supports SOURCE feet with
            // the original <=.25m physical band. Genuine B2/B4 60Hz RAW
            // had .222-.244m on the original ramp: the old independent
            // CPU-only .20m support veto erased all native targets despite
            // true floor support. Never change strict Recast start/goal
            // projections: .20m for rejoined and .25m FIRST_DROP only.
            const rejoined=this.f3dSourceGoals
              ?.isLiveRejoinedSourceCpu?.(bot.id)===true;
            const firstDrop=this.f3dSourceGoals
              ?.isLiveRejoinedSourceCpu?.(bot.id)===false;
            const physical=this.phase14qGroundCollision
              ?.sourceFootSupport?.(bot.id,bot.position);
            const footSupported=this.f4WholeNavigation?!!physical:
              hasRegisteredOriginalSourceCpuRapierFootSupport(
                bot.position,physical,this.stage.solids);
            // The unchanged 25-solid ORIGINAL authorizer rejects any
            // estimated F4 corridor by design. The explicit 51-solid lab
            // instead requires a COMPLETE native path from the ACTUAL CPU
            // Rapier foot to the already checked ramp-guide point. It never
            // writes a body, teleports Crowd, adds links, or skips Rapier KCC.
            // Existing original-source .20/.22m rules remain untouched.
            const admitted=footSupported&&bot.agent?
              (isT21F4ResearchStage(this.stage)?
                (()=>{
                  const path=this.navigation.auditPath(bot.position,this.goal,.35);
                  const first=path.nativePathPoints[0];
                  const last=path.nativePathPoints.at(-1);
                  // The traffic gate verifies that this detail height bias
                  // lies over one Rapier floor. KCC still moves the body.
                  const maxStartSnap=hasF4OriginalIngress(this.stage)&&
                    first&&Math.hypot(first.x-bot.position.x,first.z-bot.position.z)<=.12?.44:.35;
                  const distance=(a:Readonly<{x:number;y:number;z:number}>,
                    b:Readonly<{x:number;y:number;z:number}>)=>
                    Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
                  return path.querySuccess&&path.reachedTarget&&first&&last&&
                    path.pointCount>=2&&
                    path.pointCount===path.nativePathPoints.length&&
                    path.nativePathPoints.every(p=>
                      [p.x,p.y,p.z].every(Number.isFinite))&&
                    (this.f4WholeNavigation&&
                     this.phase14qGroundCollision?.canRejoinF4WholeProjection?.(bot.position,first)||
                     distance(first,bot.position)<=maxStartSnap&&
                     path.startSnapDistanceMeters<=maxStartSnap)&&
                    path.endSnapDistanceMeters<=.35&&
                    path.endpointErrorMeters<=.20&&
                    distance(last,this.goal)<=.35?
                    {point:this.goal,reusedPrevious:false}:null;
                })():
                chooseAuditedOriginalSourceCpuGoal(
                  bot.position,this.goal,
                  rejoined?this.sourceLastAdmittedRouteGoal.get(bot.id)??null:null,
                  (from,to)=>this.navigation.auditPath(
                    new Vec3(from.x,from.y,from.z),
                    new Vec3(to.x,to.y,to.z)
                  ),{allowOriginalFirstDropStartSnap:firstDrop}
                )):null;
            if(admitted){
              this.goal.set(admitted.point.x,admitted.point.y,
                admitted.point.z);
              // The audit validated THIS actual foot -> original point.
              // closestPoint() silently returns the requested coordinate
              // on native query failure. Use the explicit success-bearing
              // projection instead: no false native Crowd target when
              // a second Recast query failed or chose another floor.
              const projected=this.navigation.auditNavMeshProjection(
                this.goal);
              // Actual F4 Chromium witness: existing real photo-route
              // target is Rapier-backed and Recast-reached, yet the final
              // ORIGINAL-only .22m projection discarded B-team (.2286m)
              // and A3 (.2439m). The F4 experimental geometry already
              // uses <=.30m for source goal admission; use that SAME
              // bounded tolerance ONLY for this 51-solid research world.
              // Original 25-solid .22m and real KCC step fences are intact.
              const f4Projection=isT21F4ResearchStage(this.stage);
              const projectionTolerance=f4Projection?.30:.22;
              const distanceToProjected=projected.nearestPoint?
                Math.hypot(projected.nearestPoint.x-this.goal.x,
                  projected.nearestPoint.y-this.goal.y,
                  projected.nearestPoint.z-this.goal.z):Infinity;
              if(projected.success&&projected.nearestPoint&&
                 projected.distanceMeters!==null&&
                 projected.distanceMeters<=projectionTolerance+1e-6&&
                 (f4Projection?
                   distanceToProjected<=projectionTolerance+1e-6:
                   isAlignedOriginalSourceCrowdTarget(
                    this.goal,projected.nearestPoint))){
                projectedApprovedSourceGoal=projected.nearestPoint;
                newlyAuditedOriginalSourceGoal=!admitted.reusedPrevious;
              }else sourceGoal=false;
            }else sourceGoal=false;
          }
          if(sourceGoal||!this.f3dSourceGoals){
            if(!sourceGoal)this.director.chooseGoal({
              team: bot.team,
              role: bot.role,
              slot: bot.slot,
              humanTeam,
              currentPosition: bot.position,
              humanPosition
            }, this.goal);
            const goal = projectedApprovedSourceGoal??
              this.navigation.closestPoint(this.goal);
            if(bot.agent){
              let submit=true;
              if(this.f4WholeNavigation){
               const current=this.sourceLiveNativeMotionGoal.get(bot.id);
               submit=current?.agent!==bot.agent||
                current.goal.distance(new Vec3(goal.x,goal.y,goal.z))>.03;
              }else if(this.b35OptInNativeRefresh&&this.f3dSourceGoals){
               const old=this.b35LastNativeTarget.get(bot.id);
               submit=shouldReissueOriginalSourceNativeTarget(
                old?{x:old.goal.x,y:old.goal.y,z:old.goal.z,
                 repeatedThinkCycles:old.repeat,
                 sameAgent:old.agent===bot.agent}:null,goal);
               if(submit)this.b35LastNativeTarget.set(bot.id,{
                agent:bot.agent,goal:new Vec3(goal.x,goal.y,goal.z),
                repeat:0
               });
               else{
                old!.repeat++;
                this.b35DuplicateNativeRequestsSuppressed++;
               }
              }
              if(submit){
               const accepted=bot.agent.requestMoveTarget(goal);
               if(this.f4WholeNavigation&&accepted===false){
                bot.agent.resetMoveTarget();
                this.sourceLiveNativeMotionGoal.delete(bot.id);
                this.sourceLastAdmittedRouteGoal.delete(bot.id);
                this.b35LastNativeTarget.delete(bot.id);
                this.qaMotionGoals.delete(bot.id);
                this.f3dSourceGoals?.noteF4NativeGoalRejected?.(bot.id,bot.position,goal);
                // Retry at the normal think cadence. The second loop still
                // owns real physical KCC and combat, not this steering proxy.
                bot.thinkRemaining=GAME_CONFIG.cpu.tacticalThinkSeconds;
                continue;
               }
               if(this.f3dSourceGoals&&this.phase14qF2RecoverableSteps&&
                  projectedApprovedSourceGoal)
                this.sourceLiveNativeMotionGoal.set(bot.id,{
                  agent:bot.agent,
                  goal:new Vec3(goal.x,goal.y,goal.z)
                });
               if(this.b35OptInNativeRefresh)
                this.b35RealNativeRequests++;
              }
              // An audited request is NOT a live movement authorization
              // until it has really been passed to this native agent
              // (or that same agent still owns the unchanged live goal).
              const active=this.sourceLiveNativeMotionGoal.get(bot.id);
              if(newlyAuditedOriginalSourceGoal&&active&&
                 active.agent===bot.agent&&
                 Math.hypot(active.goal.x-goal.x,
                   active.goal.y-goal.y,active.goal.z-goal.z)<=.025)
                this.sourceLastAdmittedRouteGoal.set(
                  bot.id,this.goal.clone());
            }
            if (this.phase14qGroundCollision && bot.agent) {
              this.qaMotionGoals.set(bot.id, new Vec3(goal.x, goal.y, goal.z));
            }
            this.stats.cpuTacticalRetargets += 1;
          } else {
            bot.agent?.resetMoveTarget();
            this.b35LastNativeTarget.delete(bot.id);
            this.sourceLiveNativeMotionGoal.delete(bot.id);
            this.qaMotionGoals.delete(bot.id);
            // SOURCE authority or the strict native route has refused a
            // live goal. Drop its historical MOVEMENT fallback as well:
            // the next 0.28s think must obtain a fresh SOURCE-authorized
            // intent, not revive an earlier cleared/unsupported target.
            if(this.f3dSourceGoals)
              this.sourceLastAdmittedRouteGoal.delete(bot.id);
          }
        }

        bot.thinkRemaining += GAME_CONFIG.cpu.tacticalThinkSeconds;
      }
    }

    this.navigation.fixedUpdate(dt);
    // Rapier remains physical authority. Native Recast Crowd can push even
    // an idle 0-speed human neighbour ~.40m in this single update. Seal it
    // immediately so no later CPU action samples the displaced avatar.
    // This does NOT undo any steering already computed by this Crowd step.
    if(liveHumanFoot&&this.phase14qHumanCrowd&&!this.f4WholeNavigation)
      this.phase14qHumanCrowd.sealAfterCrowdUpdate(liveHumanFoot);

    for (const bot of this.bots) {
      if(bot.lifeState==='ACTIVE'&&bot.mobilityState==='FIRST_DROP_REJOIN'){
        if(!bot.agent)throw new Error('T21_PHASE14H_REJOIN_AGENT_MISSING');
        const p=bot.agent.position();
        const d=Math.hypot(p.x-bot.position.x,p.y-bot.position.y,p.z-bot.position.z);
        // Phase14L: Crowd avoidance can spread several simultaneous landing
        // agents by more than the single-agent .65m proximity bound. This is
        // NOT permission to snap the CPU to its Crowd position. Preserve the
        // verified original lower vertical layer and a strict 1.6m maximum
        // candidate envelope; every actual movement still uses original
        // nav projection and the full Rapier HUMAN KCC.
        const sameLayer=Math.abs(p.y-bot.position.y)<=.20&&d<=1.6;
        bot.rejoinStableFrames=sameLayer?bot.rejoinStableFrames+1:0;
        if(bot.rejoinStableFrames>=3){
          // Reused Crowd slots briefly replay an old offmesh animation;
          // never render those out-of-layer positions. Once stable, walk
          // the real physics foot to the source-derived NavMesh position.
          const maxStep=GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt;
          const fraction=Math.min(1,maxStep/Math.max(d,1e-9));
          const nx=bot.position.x+(p.x-bot.position.x)*fraction;
          const ny=bot.position.y+(p.y-bot.position.y)*fraction;
          const nz=bot.position.z+(p.z-bot.position.z)*fraction;
          const closest=this.navigation.closestPoint(new Vec3(nx,ny,nz));
          if(Math.hypot(closest.x-nx,closest.y-ny,closest.z-nz)>.25||
             Math.abs(closest.y-ny)>.20)
            throw new Error('T21_PHASE14H_UNSUPPORTED_REJOIN_SURFACE');
          // A Recast path alone does not prove the HUMAN capsule fits.
          // This QA-only preflight uses all 25 original collision solids,
          // Rapier KCC and the same character profile as the real player.
          const collision=this.phase14eFirstDrop!.validateRejoinStep(
            bot.position,{x:nx,y:ny,z:nz},dt
          );
          if(!collision.approved&&bot.rejoinRetryCount===0){
            // Exactly one original-source lower-layer reseed is permitted.
            // A recycled Recast slot may retain the previous offmesh endpoint
            // and send a real capsule into the 1.5m-high right-low edge.
            // Keep the ACTUAL Rapier-foot-derived visible CPU still: no
            // teleport, no fabricated ramp, no collision bypass.
            this.navigation.removeAgent(bot.agent);
            bot.agent=this.navigation.addAgent(bot.rejoinPhysicalLandingFoot);
            bot.agent.resetMoveTarget();
            bot.rejoinStableFrames=0;
            bot.rejoinRetryCount=1;
            continue;
          }
          if(!collision.approved)
            throw new Error('T21_PHASE14J_REJOIN_BLOCKED_BY_REAL_COLLIDER '+JSON.stringify({
              id:bot.id,from:[bot.position.x,bot.position.y,bot.position.z],
              to:[nx,ny,nz],collision,rejoinFrames:bot.rejoinElapsedFrames,
              stableFrames:bot.rejoinStableFrames,
              originalSourceReseedAttempted:bot.rejoinRetryCount
            }));
          if(this.phase14qGroundCollision){
            const shared=this.phase14qGroundCollision.auditGroundStep(
              bot.id,bot.position,{x:nx,y:ny,z:nz},dt
            );
            if(!shared.approved){
              if(this.phase14qF2RecoverableSteps){
                this.reconcileBlockedT21F2CrowdProxy(bot);
                bot.rejoinStableFrames=0;
                continue;
              }
              bot.agent?.resetMoveTarget();
              throw Error('T21_PHASE14Q_REAL_REJOIN_COLLISION_BLOCKED '+JSON.stringify({
                id:bot.id,sourceFoot:[bot.position.x,bot.position.y,bot.position.z],
                crowdCandidate:[nx,ny,nz],cause:shared.cause,
                colliders:shared.colliderOwnerIds,
                noCpuPoseMutation:true,noRecastTeleport:true
              }));
            }
          }
          bot.position.set(nx,ny,nz);
          this.phase14qGroundCollision?.syncRealCpuFoot(bot.id,bot.position);
          if(d<=maxStep+1e-7){
            bot.mobilityState='GROUND';
            bot.thinkRemaining=Math.min(bot.thinkRemaining,.16);
          }
        }
        continue;
      }
      if (
        bot.lifeState !== 'ACTIVE' ||
        bot.mobilityState !== 'GROUND' ||
        !bot.agent
      ) {
        continue;
      }

      // A single invalid passive Recast projection never moves a real
      // SOURCE CPU or becomes a fatal error for all eight players.
      // Retry the same registered Rapier/native projection at most once
      // per 90 true ticks; never reissue an unaudited movement target.
      if(this.f3dSourceGoals&&this.phase14qF2RecoverableSteps&&
         this.sourceCrowdProjectionHold.has(bot.id)){
        if(this.f4WholeNavigation&&
           !this.phase14qGroundCollision?.sourceFootSupport?.(bot.id,bot.position)){
          // While the passive agent is quarantined, finish a short descent
          // at the real XZ. A paused Detour target cannot suspend gravity.
          const foot=this.phase14qGroundCollision?.tryF4GroundStep?.(
            bot.id,bot.position,bot.position,0);
          if(foot){
            bot.position.set(foot.x,foot.y,foot.z);
            this.phase14qGroundCollision!.syncRealCpuFoot(bot.id,bot.position);
            if(this.f4VoidCheck?.(bot.position.y,foot.kccGrounded)){
              bot.hp=0;bot.lethalHumanDirect=false;this.splatBot(bot);continue;
            }
            if(this.phase14qGroundCollision?.sourceFootSupport?.(bot.id,bot.position))
              this.reconcileBlockedT21F2CrowdProxy(bot);
          }
        }
        const last=this.sourceCrowdProjectionHold.get(bot.id)!;
        if(this.sourceNativeMotionTick-last>=90)
          this.reconcileBlockedT21F2CrowdProxy(bot);
        if(this.sourceCrowdProjectionHold.has(bot.id)){
          bot.agent.resetMoveTarget();
          this.sourceLiveNativeMotionGoal.delete(bot.id);
          this.sourceLastAdmittedRouteGoal.delete(bot.id);
          this.b35LastNativeTarget.delete(bot.id);
          this.continueBlockedOriginalSourceCpuActions(bot,dt,
            humanTeam,humanPosition,humanActive,canStartNewCombatActions);
          continue;
        }
      }
      const p = bot.agent.position();
      const f4Ground=this.f4WholeNavigation||this.phase14qF2RecoverableSteps&&
        isT21F4ResearchStage(this.stage)&&
        this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true;
      this.observeSourceGroundStep(bot,'CROWD',p);
      // F2: the original offmesh event may begin only with a free
      // original-source physical capsule corridor. Other moving CPUs can
      // reach the same lip on adjacent links. Queue that fall by leaving
      // the REAL CPU at its last approved KCC foot and re-anchoring ONLY
      // the ephemeral Recast steering proxy, never its render/physics foot.
      // The authentic link is retried after other bodies clear.
      if(!f4Ground&&this.phase14qF2RecoverableSteps&&
         p.y<bot.position.y-.1&&
         auditPhase14CrowdFrame(bot.position,p,dt).suspectedInstantTransition&&
         this.phase14qGroundCollision!.shouldDeferF2FirstDrop!(
           bot.id,bot.position
         )){
        this.observeSourceGroundStep(bot,'OFFMESH_DEFER',p);
        this.reconcileBlockedT21F2CrowdProxy(bot);
        this.continueBlockedOriginalSourceCpuActions(bot,dt,
          humanTeam,humanPosition,humanActive,canStartNewCombatActions);
        continue;
      }
      // A real Recast offmesh jump is no longer copied into the CPU render
      // position when (and only when) the T21-D QA adapter is injected.
      if(!f4Ground&&this.phase14eFirstDrop?.observe(bot.id,bot.position,p,dt)){
        this.navigation.removeAgent(bot.agent);
        bot.agent=null;
        // Upper-source Crowd target never survives a genuine one-way
        // physical first drop into a DIFFERENT lower native agent.
        this.sourceLiveNativeMotionGoal.delete(bot.id);
        this.sourceLastAdmittedRouteGoal.delete(bot.id);
        bot.mobilityState='FIRST_DROP_FALL';
        continue;
      }
      // A Crowd reattach after KCC landing may jump to a different
      // vertical Recast island. A genuinely REJOINED original SOURCE
      // actor can instead reconcile ONLY its passive steering proxy;
      // the real registered Rapier CPU foot never moves or teleports.
      // Unjoined/strict QA and default T20 keep the former hard stop.
      const proxyFoot=f4Ground?{x:p.x,y:bot.position.y,z:p.z}:p;
      if(this.phase14eFirstDrop &&
          auditPhase14CrowdFrame(bot.position,proxyFoot,dt).suspectedInstantTransition){
        if(this.sourceMayRecoverCrowdDiscontinuity(bot)){
          this.reconcileBlockedT21F2CrowdProxy(bot);
          this.continueBlockedOriginalSourceCpuActions(bot,dt,
            humanTeam,humanPosition,humanActive,canStartNewCombatActions);
          continue;
        }
        this.navigation.removeAgent(bot.agent);
        bot.agent=null;
        throw new Error('T21_PHASE14G_UNSUPPORTED_CROWD_REJOIN_DISCONTINUITY');
      }
      // Native Crowd can temporarily lead the physical foot at an
      // offmesh approach. Consume only a legal per-tick speed envelope;
      // Rapier still approves the exact motion before visible CPU adoption.
      // A true vertical offmesh transition is handled above by the genuine
      // original-source Rapier fall bridge, never by this horizontal clamp.
      let accepted:{x:number;y:number;z:number;kccGrounded?:boolean}=
        {x:p.x,y:p.y,z:p.z};
      if(f4Ground){
        const ground=this.phase14qGroundCollision?.tryF4GroundStep?.(
          bot.id,bot.position,p,dt*(this.b178NativeCpuMovementSpeed.get(bot.id)??
            GAME_CONFIG.cpu.maxSpeedMetersPerSecond));
        if(!ground){
          this.observeSourceGroundStep(bot,'KCC_REJECTED',p,
            'UNSUPPORTED_OR_BLOCKED_F4_GROUND');
          if(this.f4WholeNavigation&&Math.hypot(p.x-bot.position.x,p.z-bot.position.z)>.015)
            this.f3dSourceGoals?.noteRealSourceKccRejectedStep?.(
              bot.id,bot.position,[],'UNSUPPORTED_OR_BLOCKED_F4_GROUND');
          this.reconcileBlockedT21F2CrowdProxy(bot);
          this.continueBlockedOriginalSourceCpuActions(bot,dt,
            humanTeam,humanPosition,humanActive,canStartNewCombatActions);
          continue;
        }
        accepted={...ground};
      }else if(this.phase14qF2RecoverableSteps){
        // A physically supported original SOURCE enemy-ink foot supplies
        // one speed for BOTH the live Recast agent and Rapier-bound motion.
        // The unchanged KCC still vetoes every unsupported destination.
        const sourceSpeed=this.b178RealSourceInkRecovery&&
          this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'
          ?this.b178NativeCpuMovementSpeed.get(bot.id):undefined;
        accepted=b178BoundOriginalCpuPhysicalStep(
          bot.position,accepted,dt,GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
          sourceSpeed);
      }
      // A teammate KCC slide counts only after its true physical foot
      // is committed, not when the Recast Crowd merely proposes a step.
      let realTeammateSlide=false;
      if(this.phase14qGroundCollision&&!f4Ground){
        let shared:ReturnType<CpuSharedGroundStepAuthority['auditGroundStep']>;
        try{
          shared=this.phase14qGroundCollision.auditGroundStep(
            bot.id,bot.position,accepted,dt,
            this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true
          );
        }catch(error){
          if(this.phase14qF2RecoverableSteps&&
             String(error).includes('T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED')){
            this.observeSourceGroundStep(bot,'OVERSPEED',accepted);
            this.reconcileBlockedT21F2CrowdProxy(bot);
            this.continueBlockedOriginalSourceCpuActions(bot,dt,
              humanTeam,humanPosition,humanActive,canStartNewCombatActions);
            continue;
          }
          throw error;
        }
        // The same registered original ramp/KCC authority applies to any
        // genuinely rejoined SOURCE CPU, never by an actor-name exception.
        // Both the measured floor support and the full native KCC must pass.
        if(!shared.approved&&this.phase14qF2RecoverableSteps&&
           shared.cause==='UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION'&&
           this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true){
          const downhill=this.phase14qGroundCollision
           .tryOriginalDownhillKccStep?.(bot.id,bot.position,accepted,dt);
          // Genuine P2 180s B2/B4: Crowd repeatedly requested nearly
          // zero XZ with a +2cm navmesh Y drift above the SAME ramp.
          // Only retain the genuine native XZ and registered Rapier-foot Y;
          // original static support, speed and dynamic KCC must reapprove.
          const candidate=downhill??
            this.phase14qGroundCollision
             .tryOriginalCrowdHeightMismatchKccStep?.(
              bot.id,bot.position,accepted,dt);
          if(candidate){
            const physical=this.phase14qGroundCollision.auditGroundStep(
             bot.id,bot.position,candidate,dt,true);
            if(physical.approved){
              accepted={x:candidate.x,y:candidate.y,z:candidate.z};
              shared=physical;
            }
          }
        }
        // Do not use the original rejected Crowd endpoint. Every genuinely
        // rejoined SOURCE CPU (both teams) may accept only an ACTUAL
        // teammate-contact Rapier KCC slide on its registered floor;
        // the helper rejects human/enemy contacts and unsupported feet.
        if(!shared.approved&&this.phase14qF2RecoverableSteps&&
           shared.cause==='DYNAMIC_ACTOR_OR_STAGE_BLOCKER'&&
           this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true){
          const moved=this.phase14qGroundCollision
           .tryOriginalTeammateKccSlideStep?.(
            bot.id,bot.position,accepted,dt);
          if(moved){
            accepted={x:moved.x,y:moved.y,z:moved.z};
            realTeammateSlide=true;
          }
        }
        if(!shared.approved&&!realTeammateSlide){
          if(this.phase14qF2RecoverableSteps){
            this.observeSourceGroundStep(bot,'KCC_REJECTED',accepted,
             shared.cause,shared.colliderOwnerIds);
            // The original KCC veto is the only stall evidence; never
            // infer a collision from a merely stationary Crowd agent.
            this.f3dSourceGoals?.noteRealSourceKccRejectedStep?.(
               bot.id,bot.position,shared.colliderOwnerIds,shared.cause);
            // This SOURCE destination was denied by genuine Rapier KCC.
            // It must not be resurrected by the subsequent helper's
            // "previously authorized" Recast fallback. SOURCE traffic
            // may choose the same or another goal only with fresh authority;
            // no physical position, KCC, or stationary weapon aim changes.
            this.sourceLastAdmittedRouteGoal.delete(bot.id);
            this.reconcileBlockedT21F2CrowdProxy(bot);
            this.continueBlockedOriginalSourceCpuActions(bot,dt,
              humanTeam,humanPosition,humanActive,canStartNewCombatActions);
            continue;
          }
          // The original strict QA path is intentionally unchanged.
          bot.agent.resetMoveTarget();
          throw Error('T21_PHASE14Q_REAL_CROWD_COLLISION_BLOCKED '+JSON.stringify({
            id:bot.id,sourceFoot:[bot.position.x,bot.position.y,bot.position.z],
            crowdCandidate:[p.x,p.y,p.z],cause:shared.cause,
            colliders:shared.colliderOwnerIds,
            noCpuPoseMutation:true,noRecastTeleport:true
          }));
        }
      }
      this.observeSourceGroundStep(bot,'KCC_APPROVED',accepted);
      this.f3dSourceGoals?.noteRealSourceKccApprovedStep?.(
        bot.id,bot.position,accepted);
      // The real source KCC just approved this registered-floor step.
      this.noteSourceCrowdPhysicallyApprovedTravel(bot,accepted);
      // In a supported F4 step the capsule can finish its skin width
      // above a shallow surface. The contact tool probes the actual
      // support along this KCC-accepted step before spending ink.
      const groundTravel=this.f4WholeNavigation&&
        (bot.weaponId==='metro-roller'||bot.weaponId==='dash-brush')?
        {from:bot.position.clone(),to:new Vec3(accepted.x,accepted.y,accepted.z)}:undefined;
      bot.position.set(accepted.x,accepted.y,accepted.z);
      this.phase14qGroundCollision?.syncRealCpuFoot(bot.id,bot.position);
      if(this.f4WholeNavigation&&accepted.kccGrounded===false&&this.f4VoidCheck?.(bot.position.y,false)){
        bot.hp=0;bot.lethalHumanDirect=false;this.splatBot(bot);continue;
      }
      if(this.f4FirstSpawn&&!this.f4FirstCpuMoved&&
         Math.hypot(bot.position.x-this.f4FirstSpawn.x,
           bot.position.z-this.f4FirstSpawn.z)>=.18)
        this.f4FirstCpuMoved=true;
      if(realTeammateSlide)this.observeSourceGroundStep(
        bot,'KCC_TEAMMATE_SLIDE',accepted);

      bot.paintRemaining -= dt;
      if (bot.paintRemaining <= 0 && canStartNewCombatActions) {
        bot.paintRemaining += GAME_CONFIG.cpu.paintCadenceSeconds;
        this.paintAtBot(bot);
      }

      // Source F3 last 180-second tick: keep genuine Recast/Rapier motion,
      // CPU HP and recovery updates, but NEVER enqueue a projectile/kit
      // after source time expires. The corresponding CPU ink cost, stats
      // and cooldown are charged inside these calls, so dropping their
      // requests later would create phantom shots and wasted ink.
      if (canStartNewCombatActions&&this.sourceCpuMayStartActions(bot)) {
        const probe=this.f4PhysicalSpecialProbe;
        if(probe?.actorId===bot.id){
          const target=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0);
          const origin=bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
          const aim=target?target.clone().sub(origin).normalize():bot.weaponFacing;
          const canStart=!bot.weaponGuarding&&!bot.f4CanopyOpen&&bot.weaponChargeSeconds<=0&&
            bot.weaponBurstShotsRemaining<=0;
          if(probe.step({foot:bot.position,aim,team:bot.team,weapon:bot.weaponId,
            hasOpponent:target!==null,canStart,lifeId:String(bot.f4LifeSerial)}))continue;
        }
        if(this.tickF4NaturalSpecial(bot,humanTeam,humanPosition,humanActive))continue;
        this.updateCpuWeaponsAndKit(
          bot,dt,humanTeam,humanPosition,humanActive,groundTravel);
      }
    }

    if (this.phase14qGroundCollision) {
      this.qaContinuity.observe(dt, this.bots.map(bot => {
        const submitted=this.sourceLiveNativeMotionGoal.get(bot.id);
        const goal=this.f3dSourceGoals&&this.phase14qF2RecoverableSteps?
          (submitted?.agent===bot.agent?submitted.goal:null):
          this.qaMotionGoals.get(bot.id);
        return {
          id: bot.id, x: bot.position.x, y: bot.position.y, z: bot.position.z,
          lifeState: bot.lifeState, mobilityState: bot.mobilityState,
          hasAgent: bot.agent !== null,
          expectsMotion: Boolean(goal && Math.hypot(
            goal.x - bot.position.x, goal.y - bot.position.y, goal.z - bot.position.z
          ) > 1.5)
        };
      }));
      const report = this.qaContinuity.snapshot();
      this.stats.cpuQaSuspectedStalls = report.suspectedStallCount;
      this.stats.cpuQaLongestStationarySeconds = report.longestStallSeconds;
      // A true supported SOURCE CPU can retain a valid Recast destination
      // but remain motionless with no KCC rejection: refresh only its
      // steering proxy once per life, and re-request ONLY source-approved
      // goals on the next think. This cannot grant physical movement.
      if(this.f3dSourceGoals&&this.phase14qF2RecoverableSteps&&
         report.actors.some(a=>
           a.stationarySeconds>=SOURCE_CROWD_STALL_SECONDS))
        this.tryRefreshStalledOriginalSourceCrowd(report);
    }
    if (this.f4LeadEnabled && this.f4WholeNavigation) {
      for (const bot of this.bots) this.sampleF4LeadBody(bot.id,
        bot.lifeState === 'ACTIVE' && bot.hp > 0 && this.liveSourceCombatOpponent(bot) &&
        (bot.mobilityState === 'GROUND'||this.f4ZipRuns.has(bot.id)||this.f4ZipRecovery.has(bot.id)) ? bot.position : null,'CPU',bot.mobilityState==='GROUND');
    }
    this.b234ObserveRealCpu();
    this.syncStats();
  }

  /**
   * Re-anchor ONLY the Recast steering proxy to its existing, verified
   * original-source physical CPU foot after a blocked candidate. This
   * does not move the CPU body, image, or original geometry. A new
   * navigation goal must be requested after the collision clears.
   */
  /**
   * A rejected ORIGINAL-SOURCE Crowd move must keep the real CPU at its
   * last approved Rapier foot. If that unchanged foot STILL has registered
   * static support and the CPU is genuinely rejoined/alive, its ordinary
   * paid weapon/kit decisions may proceed from that physical position.
   * Never let a blocked route create movement, ground, free ink or combat.
   * No effect on T20, unrejoined first-drop CPUs or the last 180s tick.
   */
  /** One natural-special update path for both moving and KCC-blocked grounded CPUs. */
  private tickF4NaturalSpecial(bot:CpuBot,humanTeam:Team.A|Team.B,
    humanPosition:Vec3,humanActive:boolean):boolean {
    const natural=this.f4NaturalSpecial;
    if(!natural)return false;
    if(bot.weaponId==='arc-blaster'){
      const actor={actorId:bot.id,team:bot.team,weapon:bot.weaponId,lifeId:String(bot.f4LifeSerial)};
      const tick=natural.tick();
      if(tick%12===[...bot.id].reduce((n,c)=>n+c.charCodeAt(0),0)%12&&natural.zipReady(actor)&&
         this.tryBeginF4CpuZip(bot,actor,tick,humanTeam,humanPosition,humanActive))return true;
      return false;
    }
    if(!natural.wantsTick(bot.id))return false;
    const sightRange=cpuSpecialSightRange(KIT720[bot.weaponId].special);
    const target=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0,false,sightRange);
    const origin=bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
    const aim=target?target.clone().sub(origin).normalize():bot.weaponFacing;
    const canStart=!bot.weaponGuarding&&!bot.f4CanopyOpen&&bot.weaponChargeSeconds<=0&&bot.weaponBurstShotsRemaining<=0&&!this.hasF4MainWindup(bot);
    const result=natural.step({actorId:bot.id,foot:bot.position,aim,target,team:bot.team,weapon:bot.weaponId,
      hasOpponent:target!==null,canStart,lifeId:String(bot.f4LifeSerial),distance:target?origin.distance(target):null,
      hp:bot.hp,ink:bot.ink,recentHit:bot.b213ActualHitTick>=0&&
        this.b181NativeFrame>=bot.b213ActualHitTick&&this.b181NativeFrame-bot.b213ActualHitTick<=60,
      grounded:bot.mobilityState==='GROUND'});
    if(result.activated){bot.ink=GAME_CONFIG.inkEconomy.capacity;bot.inkRecoveryLockSeconds=0;bot.f4SubRecoverySeconds=0;this.stats.cpuSpecialActivations++;}
    return result.owns;
  }

  private tryBeginF4CpuZip(bot:CpuBot,actor:{actorId:string;team:Team.A|Team.B;weapon:WeaponId;lifeId:string},tick:number,humanTeam:Team.A|Team.B,humanPosition:Vec3,humanActive:boolean):boolean{
    const c=this.phase14qGroundCollision,n=this.f4NaturalSpecial;
    if(!this.f4WholeNavigation||!bot.agent||!n||!c?.probeF4CpuZip||!c.stepF4CpuZip||!c.canF4CpuZipReturn||!c.moveF4WholeDrop||
      !this.sourceCpuMayStartActions(bot)||bot.weaponGuarding||bot.f4CanopyOpen||bot.weaponChargeSeconds>0||bot.weaponBurstShotsRemaining>0||this.hasF4MainWindup(bot))return false;
    const target=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0);
    if(!target)return false;
    const aim=target.clone().sub(bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0)));
    const candidate=selectCpuZipHook({tick,ready:true,canStart:true,grounded:true,hp:bot.hp,direction:[aim.x,aim.y,aim.z],distance:aim.length()},
      ray=>c.probeF4CpuZip!(bot.id,bot.position,ray,target));
    if(!candidate)return false;
    const motion=new CpuZipMotion(candidate,tick,actor.lifeId);
    if(!n.zipConsume(actor))return false;
    this.navigation.removeAgent(bot.agent);bot.agent=null;
    this.sourceLiveNativeMotionGoal.delete(bot.id);this.sourceLastAdmittedRouteGoal.delete(bot.id);
    this.sourceCrowdProjectionHold.delete(bot.id);this.qaMotionGoals.delete(bot.id);this.b181CachedCombat.delete(bot.id);
    bot.mobilityState='F4_ZIP';this.f4ZipRuns.set(bot.id,{motion,canFire:false});
    bot.ink=GAME_CONFIG.inkEconomy.capacity;bot.inkRecoveryLockSeconds=0;bot.f4SubRecoverySeconds=0;
    this.stats.cpuSpecialActivations++;
    // Match the already-connected human Zip cue, only after real admission.
    try{n.zipActivated?.(actor,bot.position);}catch{/* cosmetic only */}
    return true;
  }

  private tickF4CpuZip(bot:CpuBot,dt:number,humanTeam:Team.A|Team.B,humanPosition:Vec3,humanActive:boolean):void{
    const row=this.f4ZipRuns.get(bot.id),n=this.f4NaturalSpecial,c=this.phase14qGroundCollision;
    if(!row||!n||!c?.stepF4CpuZip||!c.canF4CpuZipReturn)return;
    this.advanceCpuWeaponTimers(bot,dt,true);row.canFire=false;
    const result=row.motion.step({tick:n.tick(),lifeId:String(bot.f4LifeSerial),foot:[bot.position.x,bot.position.y,bot.position.z],visible:true,hp:bot.hp},{
      returnClear:(a,b,id)=>c.canF4CpuZipReturn!(bot.id,new Vec3(...a),new Vec3(...b),id),
      move:(delta,hook)=>c.stepF4CpuZip!(bot.id,bot.position,new Vec3(...delta),hook.colliderHandle,hook.normal,row.motion.phase==='LANDING')
    });
    if(result.foot){bot.position.set(...result.foot);c.syncRealCpuFoot(bot.id,bot.position);this.b181CachedCombat.delete(bot.id);}
    if(result.phase==='RETURNED'){
      const p=this.navigation.auditNavMeshProjection(bot.position);
      if(p.success&&p.nearestPoint&&c.canRejoinF4WholeProjection?.(bot.position,p.nearestPoint)){
        bot.agent=this.navigation.addAgent(bot.position);bot.mobilityState='GROUND';bot.thinkRemaining=0;bot.jumpCooldownSeconds=1.5;
        this.f4ZipRuns.delete(bot.id);n.zipEnd(bot.id);return;
      }
    }
    if(result.phase==='RETURNED'||result.phase==='FALL_REQUIRED'||result.phase==='CANCELLED'){
      this.f4ZipRuns.delete(bot.id);n.zipEnd(bot.id);
      if(bot.lifeState!=='ACTIVE'||bot.hp<=0)return;
      this.f4ZipRecovery.add(bot.id);
      this.f4Drops.set(bot.id,{target:bot.position.clone(),verticalSpeed:0,elapsed:0,center:false});
      bot.mobilityState='FIRST_DROP_FALL';return;
    }
    if(result.canFire){
      const target=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0,true);
      const profile=weaponProfile(bot.weaponId,this.f4WholeNavigation);
      const actionable=target!==null&&this.cpuTargetInRange(bot,target,profile);
      row.motion.observeAttachedTarget(n.tick(),actionable);
      row.canFire=actionable;
      if(actionable&&target&&bot.fireRemaining<=0&&this.queueCpuWeaponRequest(bot,target,0)){
        bot.fireRemaining=profile.fireIntervalSeconds;bot.weaponFacing.copy(target).sub(bot.position).normalize();
      }
    }
  }

  private continueBlockedOriginalSourceCpuActions(
    bot:CpuBot,dt:number,humanTeam:Team.A|Team.B,
    humanPosition:Vec3,humanActive:boolean,
    canStartNewCombatActions:boolean
  ):void{
    if(!canStartNewCombatActions||!this.phase14qF2RecoverableSteps||
       !this.f3dSourceGoals||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       !this.sourceCpuMayStartActions(bot))return;
    // The shared-world authority checks current ORIGINAL Rapier support.
    // Independently confirm its registered solid and unchanged <=.25m
    // source-foot band before granting a stationary weapon decision.
    const support=this.phase14qGroundCollision?.sourceFootSupport?.(
      bot.id,bot.position);
    if(!support||(!this.f4WholeNavigation&&
       !this.stage.solids.some(s=>s.id===support.solidId))||
       Math.abs(support.point.y-bot.position.y)>.25)return;
    if(this.tickF4NaturalSpecial(bot,humanTeam,humanPosition,humanActive))return;
    const shotBefore=this.pendingShots.length;
    const kitBefore=this.pendingKitRequests.length;
    this.updateCpuWeaponsAndKit(
      bot,dt,humanTeam,humanPosition,humanActive);
    const previous=this.blockedSourceActionRows.get(bot.id)??{
      supportedWindows:0,mainRequests:0,kitRequests:0};
    previous.supportedWindows++;
    previous.mainRequests+=this.pendingShots.slice(shotBefore)
      .filter(req=>req.sourceId===bot.id).length;
    previous.kitRequests+=this.pendingKitRequests.slice(kitBefore)
      .filter(req=>req.sourceId===bot.id).length;
    this.blockedSourceActionRows.set(bot.id,previous);
  }

  /** True native SOURCE only: after Rapier first-drop rejoin, an
   * unexpected passive Recast snap can be isolated to the steering
   * agent without granting any physical actor/mesh/link authority. */
  private sourceMayRecoverCrowdDiscontinuity(bot:CpuBot):boolean{
    const eligible=this.phase14qF2RecoverableSteps&&!!this.f3dSourceGoals&&
      this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
      !!this.phase14qGroundCollision&&bot.agent!==null&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND';
    if(!eligible)return false;
    if(this.f4WholeNavigation)return true;
    if(this.f3dSourceGoals!.isLiveRejoinedSourceCpu?.(bot.id)===true)
      return true;
    // F4 real Chromium #44631175775: after genuine splats, a CPU can be
    // alive and GROUND at its original high spawn while its last physical
    // rejoin proof has correctly expired. Native Crowd occasionally reuses
    // a different navigation island at that moment; the old strict SOURCE
    // gate killed the entire real match with a *passive proxy* discontinuity.
    // Only the opt-in 51-solid experiment may quarantine/reconcile such a
    // steering proxy, and ONLY while the actual Rapier CPU foot still has
    // independently registered static support. This grants no movement,
    // spawn, offmesh link, opponent access or false rejoin status.
    if(!isT21F4ResearchStage(this.stage))return false;
    const foot=this.phase14qGroundCollision!.sourceFootSupport?.(
      bot.id,bot.position);
    return hasRegisteredOriginalSourceCpuRapierFootSupport(
      bot.position,foot,this.stage.solids);
  }

  private reconcileBlockedT21F2CrowdProxy(bot:CpuBot):void{
    if(!this.phase14qF2RecoverableSteps||!bot.agent)
      throw Error('T21_F2_UNAUTHORIZED_CROWD_RECONCILIATION');
    // A failed Recast closestPoint() can echo the input. That echo is not
    // evidence that this original physical foot is on the native NavMesh.
    // For SOURCE, require a fresh successful native projection AND the
    // unchanged original Rapier support. No new route/mesh is authorized.
    const source=this.f3dSourceGoals!==null&&
      this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa';
    const native=source?
      this.navigation.auditNavMeshProjection(bot.position):null;
    const footSupport=source?
      this.phase14qGroundCollision?.sourceFootSupport?.(
        bot.id,bot.position):null;
    const validSourceFoot=source&&(this.f4WholeNavigation?!!footSupport:
      hasRegisteredOriginalSourceCpuRapierFootSupport(
        bot.position,footSupport,this.stage.solids));
    const f4Ground=this.f4WholeNavigation||isT21F4ResearchStage(this.stage)&&
      this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true;
    const aligned=(point:Readonly<{x:number;y:number;z:number}>)=>
      f4Ground
        ? (this.f4WholeNavigation&&
          this.phase14qGroundCollision?.canRejoinF4WholeProjection?.(bot.position,point))||
          (Math.hypot(point.x-bot.position.x,point.z-bot.position.z)<=.35&&
           Math.abs(point.y-bot.position.y)<=.40)
        : Math.hypot(point.x-bot.position.x,point.y-bot.position.y,
            point.z-bot.position.z)<=.20;
    const observed=native?.nearestPoint;
    const nativeGood=source&&validSourceFoot&&native?.success===true&&
      observed!==null&&observed!==undefined&&
      native.distanceMeters!==null&&
      Number.isFinite(native.distanceMeters)&&
      [observed.x,observed.y,observed.z].every(Number.isFinite)&&
      aligned(observed);
    if(source&&!nativeGood){
      // The real body stays at its last KCC-approved foot. Instead of
      // terminating the entire 180s round, quarantine THIS one passive
      // Crowd proxy until original Recast/Rapier can both be revalidated.
      // Still permit only existing physically supported paid ink actions.
      bot.agent.resetMoveTarget();
      this.sourceCrowdProjectionHold.set(bot.id,this.sourceNativeMotionTick);
      this.sourceLiveNativeMotionGoal.delete(bot.id);
      this.sourceLastAdmittedRouteGoal.delete(bot.id);
      this.b35LastNativeTarget.delete(bot.id);
      bot.thinkRemaining=Math.min(bot.thinkRemaining,.20);
      this.sourceLastPhysicalBlockedTick.set(
        bot.id,this.sourceNativeMotionTick);
      return;
    }
    const nav=source?observed!:this.navigation.closestPoint(bot.position);
    if(![nav.x,nav.y,nav.z].every(Number.isFinite)||!aligned(nav))
      throw Error('T21_F2_PHYSICAL_CPU_OFF_ORIGINAL_NAVMESH');
    this.observeSourceGroundStep(bot,'CROWD_REANCHOR',bot.agent.position());
    bot.agent.teleport(nav);
    bot.agent.resetMoveTarget();
    const anchored=bot.agent.position();
    if(source&&(![anchored.x,anchored.y,anchored.z].every(Number.isFinite)||
       !aligned(anchored))){
      // An internal Recast re-snap after teleport is NOT a physical step.
      // Keep this CPU stationary rather than claiming a successful anchor.
      this.sourceCrowdProjectionHold.set(bot.id,this.sourceNativeMotionTick);
      this.sourceLiveNativeMotionGoal.delete(bot.id);
      this.sourceLastAdmittedRouteGoal.delete(bot.id);
      this.b35LastNativeTarget.delete(bot.id);
      bot.thinkRemaining=Math.min(bot.thinkRemaining,.20);
      this.sourceLastPhysicalBlockedTick.set(
        bot.id,this.sourceNativeMotionTick);
      return;
    }
    const justRecoveredFromHold=this.sourceCrowdProjectionHold.delete(bot.id);
    this.sourceLiveNativeMotionGoal.delete(bot.id);
    // B35's dedup cache is not the live Crowd target: resetMoveTarget
    // discarded the target, so the SAME already-authorized original goal
    // must be submitted at the next real tactical think, not suppressed
    // as an allegedly still-active request. Only this CPU is invalidated.
    this.b35LastNativeTarget.delete(bot.id);
    // Preserve the last original-source INK heading (not an active Crowd
    // movement grant). Clearing this on a blocked Rapier step removed B4's
    // genuine paid paint shots in the seven-CPU integrated regression.
    // B216 separately tries the actual-foot fallback only AFTER the old
    // aim cannot find a trusted unpainted cell. Live navigation is still
    // reset and the stale B35 movement-dedup target stays invalidated.
    const p=bot.agent.position();
    if(!aligned(p))
      throw Error('T21_F2_CROWD_PROXY_REANCHOR_FAILED');
    // The newly revalidated registered foot deserves an actual NEW native
    // route at the next tick; all other KCC-veto retries retain .20s pacing.
    bot.thinkRemaining=Math.min(bot.thinkRemaining,
      justRecoveredFromHold?0:.20);
    // Actual rejected Rapier/offmesh steps are NOT stale Recast stalls.
    // Preserve this real blocker evidence for five native seconds so the
    // separate no-KCC-rejection recovery cannot hide a true collision.
    if(this.f3dSourceGoals)
      this.sourceLastPhysicalBlockedTick.set(
        bot.id,this.sourceNativeMotionTick);
  }

  /** KCC/registered floor is already approved by the genuine native loop.
   * This never moves the real foot. A later distinct 2m trip earns only
   * ONE additional strictly reaudited passive Recast refresh. */
  private noteSourceCrowdPhysicallyApprovedTravel(
   bot:CpuBot,accepted:Readonly<{x:number;y:number;z:number}>
  ):void{
   if(!this.phase14qF2RecoverableSteps||!this.f3dSourceGoals||
      !this.sourceCrowdRefreshedThisLife.has(bot.id))return;
   const prior=this.sourceCrowdRecoveryFoot.get(bot.id);
   if(!prior)return;
   if(sourceCrowdSecondRefreshEarned({
    refreshTick:prior.tick,nowTick:this.sourceNativeMotionTick,
    refreshCount:prior.count,refreshFoot:prior.foot,
    approvedFoot:accepted,realKccApproved:true,
    groundedAndRejoined:bot.lifeState==='ACTIVE'&&
     bot.mobilityState==='GROUND'&&bot.agent!==null&&
     this.f3dSourceGoals.isLiveRejoinedSourceCpu?.(bot.id)===true
   }))
    this.sourceCrowdRefreshedThisLife.delete(bot.id);
  }

  /** SOURCE-only two-per-life physical stall steering recovery.
   * This is NOT triggered by a real KCC veto, unsupported floor, expired
   * goal, high spawn, unjoined life, or a mere Crowd proposal. Never
   * edits CPU real position, physics, stage, ink, weapons or score. */
  private tryRefreshStalledOriginalSourceCrowd(
    report:CpuContinuityReport
  ):void{
    if(!this.phase14qF2RecoverableSteps||!this.f3dSourceGoals||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
      return;
    for(const actual of report.actors){
      // This is earlier than the unchanged five-second read-only QA
      // warning; the standalone SOURCE gate still requires true foot,
      // >=1.2s actual stop and a 300-tick window without a KCC veto.
      if(actual.stationarySeconds<SOURCE_CROWD_STALL_SECONDS)continue;
      const bot=this.bots.find(b=>b.id===actual.id);
      // The genuine SOURCE splatling's charge/burst and shield are active
      // weapon actions, NOT evidence of a broken movement goal. Preserve
      // B4's live paid barrage instead of resetting the Crowd proxy
      // while its weapon is deliberately committed.
      if(bot&&deferSourceCrowdSteeringForCommittedWeapon(
        bot.weaponChargeSeconds>0||
        bot.weaponBurstShotsRemaining>0||
        bot.weaponGuarding,
        actual.stationarySeconds))continue;
      const goal=this.sourceLastAdmittedRouteGoal.get(actual.id);
      const submitted=this.sourceLiveNativeMotionGoal.get(actual.id);
      if(!bot||!shouldRefreshStalledOriginalSourceCrowd({
        actualFoot:bot.position,admittedGoal:goal??null,
        stationarySeconds:actual.stationarySeconds,
        aliveGroundedPhysicallyRejoined:
          this.sourceCpuMayStartActions(bot)&&
          this.f3dSourceGoals.isLiveRejoinedSourceCpu?.(bot.id)===true,
        // A paid ink heading is NOT a live native movement request.
        // Reanchor only a truly submitted target for this same agent.
        hasCrowdAgent:bot.agent!==null&&
          submitted?.agent===bot.agent&&!!goal&&
          Math.hypot(submitted.goal.x-goal.x,
            submitted.goal.y-goal.y,submitted.goal.z-goal.z)<=.22,
        alreadyRefreshedThisLife:
          this.sourceCrowdRefreshedThisLife.has(bot.id),
        currentSourceTick:this.sourceNativeMotionTick,
        lastPhysicalBlockTick:
          this.sourceLastPhysicalBlockedTick.get(bot.id)??null
      }))continue;
      // A missing original route may persist for many frames. Recheck
      // sparingly; a held path MUST NOT provoke a 60Hz audit storm.
      const lastAudit=this.sourceLastRecoveryAuditTick.get(bot.id);
      if(lastAudit!==undefined&&
         this.sourceNativeMotionTick-lastAudit<
           SOURCE_CROWD_RECOVERY_AUDIT_INTERVAL_TICKS)continue;
      this.sourceLastRecoveryAuditTick.set(bot.id,
        this.sourceNativeMotionTick);
      // The Recast nearest polygon cannot certify a floor, and the
      // actual supported Rapier foot must be on the SAME original level.
      const support=this.phase14qGroundCollision
        ?.sourceFootSupport?.(bot.id,bot.position);
      if(!hasRegisteredOriginalSourceCpuRapierFootSupport(
           bot.position,support,this.stage.solids))continue;
      const nav=this.navigation.auditNavMeshProjection(bot.position);
      if(!nav.success||!nav.nearestPoint||
         nav.distanceMeters===null||nav.distanceMeters>.20||
         Math.abs(nav.nearestPoint.y-bot.position.y)>.20)continue;
      // Route is re-proven from this exact real current Rapier foot.
      // The OriginalSourceGoalAdmission layer/endpoint veto stays strict
      // even when a former goal was approved earlier in this life.
      const route=chooseAuditedOriginalSourceCpuGoal(
        bot.position,goal!,null,
        (from,to)=>this.navigation.auditPath(
          new Vec3(from.x,from.y,from.z),
          new Vec3(to.x,to.y,to.z)
        ));
      if(!route||!bot.agent)continue;
      bot.agent.teleport(nav.nearestPoint);
      const anchored=bot.agent.position();
      if(Math.hypot(anchored.x-bot.position.x,
        anchored.y-bot.position.y,anchored.z-bot.position.z)>.20)
        throw Error('T21_V28_CPU_STALL_PROXY_REANCHOR_FAILED');
      bot.agent.resetMoveTarget();
      this.b35LastNativeTarget.delete(bot.id);
      this.sourceLiveNativeMotionGoal.delete(bot.id);
      this.qaMotionGoals.delete(bot.id);
      bot.thinkRemaining=Math.min(
        bot.thinkRemaining,GAME_CONFIG.cpu.tacticalThinkSeconds*.25);
      this.sourceCrowdRefreshedThisLife.add(bot.id);
      const prior=this.sourceCrowdRecoveryFoot.get(bot.id);
      this.sourceCrowdRecoveryFoot.set(bot.id,{
       foot:bot.position.clone(),tick:this.sourceNativeMotionTick,
       count:(prior?.count??0)+1
      });
    }
  }

  public setSplatZonesContext(active: boolean, control: Team): void {
    this.director.setSplatZonesContext(active, control);
  }

  public render(alpha: number): void {
    const t = Math.max(0, Math.min(1, alpha));
    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE') {
        bot.guardEntity.enabled = false;
        continue;
      }

      const x = lerp(bot.previousPosition.x, bot.position.x, t);
      const y = lerp(bot.previousPosition.y, bot.position.y, t);
      const z = lerp(bot.previousPosition.z, bot.position.z, t);

      if (bot.mobilityState === 'JUMP_TRAVEL' || bot.mobilityState === 'JUMP_LANDING') {
        const total =
          GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;
        const elapsed = bot.mobilityState === 'JUMP_TRAVEL'
          ? bot.jumpTravelElapsed
          : GAME_CONFIG.superJump.travelSeconds +
            (GAME_CONFIG.superJump.actionSeconds - bot.jumpActionRemaining);
        const progress = Math.max(0, Math.min(1, elapsed / Math.max(total, 1e-6)));
        bot.entity.setPosition(x, y + 0.68, z);
        bot.entity.setLocalScale(0.50, 1.02, 0.50);
        bot.entity.setLocalEulerAngles(progress * 720, progress * 300, 0);
        this.b248VisualByActor.get(bot.id)?.setPose(
          bot.position.x-bot.previousPosition.x,
          bot.position.z-bot.previousPosition.z,0,0);
        bot.guardEntity.enabled = false;
        continue;
      }

      const dx = bot.position.x - bot.previousPosition.x;
      const dz = bot.position.z - bot.previousPosition.z;
      const moving = bot.mobilityState === 'GROUND'
        ? Math.min(1, Math.hypot(dx, dz) / 0.055)
        : 0;
      const phase = performance.now() * 0.008 + bot.slot * 1.7;
      const bob = Math.sin(phase * 1.8) * 0.025 * moving;
      const squash = Math.abs(Math.sin(phase * 1.8)) * 0.025 * moving;
      bot.entity.setPosition(x, y + 0.68 + bob, z);
      bot.entity.setLocalScale(
        0.58 * (1 + squash),
        0.88 * (1 - squash * 1.35),
        0.58 * (1 + squash)
      );
      bot.entity.setLocalEulerAngles(0, 0, 0);
      // Stride follows actual movement; weapon/body yaw follows recent actual
      // aim instead. Never alter the physical foot, weapon ray or hit volume.
      const aim=this.f4VisualAimTick.get(bot.id);
      const useAim=this.f4CombatVisualFacing&&this.f4WholeNavigation&&
        bot.mobilityState==='GROUND'&&bot.hp>0&&aim!==undefined&&
        aim.life===bot.f4LifeSerial&&this.b181NativeFrame>=aim.tick&&
        this.b181NativeFrame-aim.tick<=12;
      this.b248VisualByActor.get(bot.id)?.setPose(
        useAim?bot.weaponFacing.x:dx,useAim?bot.weaponFacing.z:dz,moving,phase*1.8);
      this.renderCpuGuard(bot, x, y, z);
    }
  }

  /** Only the selected real SOURCE game has physical rejoin proof.
   * An ACTIVE/GROUND high-spawn respawn is not yet a frontline actor.
   * Check BEFORE actual ink/kit spending and again before shot dispatch;
   * default T20 and legacy QA without the adapter hook are unchanged. */
  private sourceCpuMayStartActions(bot:CpuBot|undefined):boolean{
    if(!this.f3dSourceGoals)return true;
    return !!bot&&bot.lifeState==='ACTIVE'&&
      Number.isFinite(bot.hp)&&bot.hp>0&&
      ((this.f4WholeNavigation&&bot.mobilityState==='F4_ZIP'&&this.f4ZipRuns.get(bot.id)?.motion.lifeId===String(bot.f4LifeSerial)&&this.f4ZipRuns.get(bot.id)?.canFire===true)||
       (bot.mobilityState==='GROUND'&&(!this.f3dSourceGoals.isLiveRejoinedSourceCpu||
        this.f3dSourceGoals.isLiveRejoinedSourceCpu(bot.id))));
  }

  /** Only the physical SOURCE projectile engine may roll back a paid
   * native CPU shot that produced NO actual bullet. All T20, manual QA,
   * and CPU kit effects retain their existing resource authority.
   * A genuine later subweapon spend keeps its recovery lock. */
  public rollbackUndeliveredSourceCpuMainShot(request:CpuFireRequest):void{
    if(!this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
      return;
    const tx=request.sourceInkTransaction;
    const bot=this.bots.find(b=>b.id===request.sourceId);
    if(!tx||!bot||!sameCpuFireLife(request,bot)||bot.lifeState!=='ACTIVE'||bot.hp<=0||
       bot.weaponId!==request.weaponId||bot.team!==request.team||
       !Number.isFinite(tx.chargedInkCost)||tx.chargedInkCost<=0||
       Math.abs(tx.chargedInkCost-cpuWeaponInkCost(
        weaponProfile(bot.weaponId, this.f4WholeNavigation),request.action,request.charge))>1e-6)
      return;
    const noLaterSpend=Math.abs(bot.ink-tx.expectedInkAfterCharge)<=1e-6;
    bot.ink=Math.min(GAME_CONFIG.inkEconomy.capacity,
      bot.ink+tx.chargedInkCost);
    if(noLaterSpend){
      bot.inkRecoveryLockSeconds=Math.min(bot.inkRecoveryLockSeconds,
        tx.originalRecoveryLockSeconds);
      // The rejected SOURCE request did not fire. Restore only this
      // unspent attack's cooldown, never a subsequent paid action.
      if(Number.isFinite(tx.originalFireRemainingSeconds)&&
         Number.isFinite(bot.fireRemaining))
        bot.fireRemaining=Math.max(0,Math.min(
          bot.fireRemaining,tx.originalFireRemainingSeconds));
      // The SOURCE projectile pool may reject a charged real volley
      // AFTER the CPU spent its charge or decremented its burst counter.
      // Returning ink alone silently loses a genuine CHARGER/STRINGER
      // charge or one SPLATLING bullet even though nothing was launched.
      // Never overwrite another action or a fresh life: restore only the
      // same living shooter, with no later ink spend and the unchanged
      // post-queue weapon state.
      const profile=weaponProfile(bot.weaponId, this.f4WholeNavigation);
      if(((profile.weaponClass==='CHARGER'&&
           request.action==='PROJECTILE')||
          (profile.weaponClass==='STRINGER'&&
           request.action==='STRINGER_RELEASE'))&&
         Number.isFinite(tx.originalWeaponChargeSeconds)&&
         tx.originalWeaponChargeSeconds!>0&&
         bot.weaponChargeSeconds===0)
        bot.weaponChargeSeconds=tx.originalWeaponChargeSeconds!;
      if(profile.weaponClass==='SPLATLING'&&
         request.action==='PROJECTILE'&&
         Number.isSafeInteger(tx.originalBurstShotsRemaining)&&
         tx.originalBurstShotsRemaining!>0&&
         bot.weaponBurstShotsRemaining===tx.originalBurstShotsRemaining!-1&&
         Number.isFinite(tx.originalBurstCooldownSeconds)&&
         Math.abs(bot.weaponBurstCooldown-
          profile.burstIntervalSeconds)<=1e-6){
        bot.weaponBurstShotsRemaining=tx.originalBurstShotsRemaining!;
        bot.weaponBurstCooldown=tx.originalBurstCooldownSeconds!;
      }
      // Actual SOURCE turf aims currently reserve a new-search cooldown
      // and increment accepted-shot counters BEFORE the physical pool
      // allocates a bullet. An unlaunched, refunded request must not
      // suppress the next genuine paint opportunity for 0.85 seconds.
      // Only undo THIS request if its provisional 0.85s reservation
      // is still present and no later ink spend has intervened.
      if(request.sourceFloorPaint===true&&
         Number.isFinite(tx.originalTurfShotCooldownSeconds)&&
         this.qaTurfShotCooldown.get(bot.id)===0.85&&
         (this.qaTurfShotsByActor.get(bot.id)??0)>0){
        this.qaTurfShotCooldown.set(bot.id,
          tx.originalTurfShotCooldownSeconds!);
        this.qaTurfShotsByActor.set(bot.id,
          (this.qaTurfShotsByActor.get(bot.id)??0)-1);
        this.stats.cpuSourceTurfShots=Math.max(0,
          this.stats.cpuSourceTurfShots-1);
      }
    }
    this.stats.cpuShots=Math.max(0,this.stats.cpuShots-1);
  }

  /**
   * A real HUMAN hitscan shot can splat a CPU AFTER CpuAgentSystem has
   * drained a paid shot but BEFORE ProjectileSystem actually emits it in
   * that same 60 Hz tick. Recheck the original living/rejoined source
   * shooter at the LAST physical launch boundary. No new AI/physics path.
   * Legacy T20 or uncharged practice requests retain their old behavior.
   */
  public approveQueuedSourceCpuMainShotAtLaunch(request:CpuFireRequest):boolean{
    if(!request.sourceInkTransaction||!this.f3dSourceGoals||
       !this.phase14qF2RecoverableSteps||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
      return true;
    const bot=this.bots.find(b=>b.id===request.sourceId);
    if(bot?.team===request.team&&bot.weaponId===request.weaponId&&
       sameCpuFireLife(request,bot)&&this.sourceCpuMayStartActions(bot))return true;
    if(bot?.lifeState==='ACTIVE'&&Number.isFinite(bot.hp)&&bot.hp>0&&
       bot.team===request.team&&bot.weaponId===request.weaponId&&sameCpuFireLife(request,bot)){
      // The physical rejoin was lost, but the original shooter is alive:
      // an unlaunched action does not charge ink or cooldown.
      this.rollbackUndeliveredSourceCpuMainShot(request);
    }else{
      // Actual HP-zero splat retains its normal ink/death penalties.
      // Only its unlaunched shot statistic must be removed.
      this.stats.cpuShots=Math.max(0,this.stats.cpuShots-1);
    }
    return false;
  }

  /** Called only by the physical pending-map cancellation before first emission. */
  public rejectF4UnemittedMain(request:CpuFireRequest):void {
    if(!this.f4WholeNavigation)return;
    const bot=this.bots.find(b=>b.id===request.sourceId);
    const disposition=unemittedCpuMainDisposition(request,bot);
    if(disposition==='REFUND')this.rollbackUndeliveredSourceCpuMainShot(request);
    else if(disposition==='DROP_COUNT')this.stats.cpuShots=Math.max(0,this.stats.cpuShots-1);
  }

  public getCommittedMainFoot(request: CpuFireRequest): Vec3 | null {
    const bot = this.bots.find(candidate => candidate.id === request.sourceId);
    return bot?.lifeState === 'ACTIVE' && bot.hp > 0 && bot.team === request.team &&
      bot.weaponId === request.weaponId && sameCpuFireLife(request,bot) && this.sourceCpuMayStartActions(bot)
      ? bot.position : null;
  }

  public forEachF4CanopyOwner(visit: (id: string, team: Team.A | Team.B, foot: Vec3,
    facing: Vec3, live: boolean, hold: boolean) => void): void {
    if (!this.f4WholeNavigation) return;
    for (const bot of this.bots) {
      if (bot.weaponId === 'canopy-guard') {
        visit(bot.id, bot.team, bot.position, bot.weaponFacing,
          bot.lifeState === 'ACTIVE' && bot.hp > 0,
          bot.f4CanopyHold === true && this.sourceCpuMayStartActions(bot));
      }
    }
  }

  public setF4CanopyOpen(id: string, open: boolean): void {
    const bot = this.bots.find(candidate => candidate.id === id);
    if (bot) bot.f4CanopyOpen = open;
  }

  public tryConsumeF4CanopyInk(id: string, cost: number, lock: number): boolean {
    const bot = this.bots.find(candidate => candidate.id === id);
    if (!bot || bot.weaponId !== 'canopy-guard' || !this.sourceCpuMayStartActions(bot) ||
        !Number.isFinite(bot.ink)||!Number.isFinite(cost)||cost<0||
        bot.ink + 1e-6 < cost) return false;
    const nextLock=mergedRecovery(bot.inkRecoveryLockSeconds,lock);
    if(nextLock===null)return false;
    bot.ink = Math.max(0, bot.ink - cost);
    bot.inkRecoveryLockSeconds = nextLock;
    return true;
  }

  public drainFireRequests(consumer: (request: CpuFireRequest) => void): void {
    for (const request of this.pendingShots) {
      // An F3 source projectile has not left the muzzle until dispatched.
      // A CPU splatted earlier in this native tick cannot fire from its
      // former physical foot; only the frozen T21D practice uses this gate.
      if (this.f3dSourceGoals&&!this.sourceCpuMayStartActions(
        this.bots.find(bot=>bot.id===request.sourceId))){
        // A previously charged, still-ALIVE SOURCE CPU may lose its
        // genuine physical rejoin before dispatch. No real bullet means
        // no spent ink, recovery lock or recorded shot. A splatted CPU
        // keeps the normal death resource penalty; only undo its count.
        const bot=this.bots.find(b=>b.id===request.sourceId);
        if(bot?.lifeState==='ACTIVE'&&bot.hp>0)
          this.rollbackUndeliveredSourceCpuMainShot(request);
        else if(request.sourceInkTransaction&&
                this.phase14qF2RecoverableSteps&&
                this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa')
          this.stats.cpuShots=Math.max(0,this.stats.cpuShots-1);
        continue;
      }
      consumer(request);
    }
    this.pendingShots.length = 0;
  }

  /**
   * Actual SOURCE SPECIAL activation is deferred until CpuKitSystem's
   * native effect phase. An already-queued human projectile or true SUB
   * can splat its owner before that phase within the same 60Hz tick.
   * Recheck living Rapier-rejoined ownership at the LAST effect boundary.
   * Never strip a successfully launched bomb or award fictitious gauge.
   */
  public approveQueuedSourceCpuSpecialAtActivation(
    request:Extract<CpuKitRequest,{kind:'SPECIAL'}>
  ):boolean{
    if(!this.f3dSourceGoals||!this.phase14qF2RecoverableSteps||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa')
      return true;
    const bot=this.bots.find(b=>b.id===request.sourceId);
    if(bot?.team===request.team&&
       weaponKit(bot.weaponId,this.f4SharedBombsEnabled).special===request.specialId&&
       this.sourceCpuMayStartActions(bot))
      return true;
    if(bot?.lifeState==='ACTIVE'&&Number.isFinite(bot.hp)&&bot.hp>0&&
       bot.team===request.team){
      // A still-alive actor lost the current genuine physical rejoin:
      // the never-activated effect keeps none of its reserved gauge.
      this.rollbackRejectedKitRequest(request,'REJOIN_HOLD');
    }else{
      // A real splat keeps the normal retained/forfeited resource amount.
      // An effect not executed is not a CPU special activation.
      this.stats.cpuSpecialActivations=Math.max(0,
        this.stats.cpuSpecialActivations-1);
    }
    return false;
  }

  public drainKitRequests(
    consumer: (request: CpuKitRequest) => boolean
  ): void {
    for (const request of this.pendingKitRequests) {
      // Same native shooter life as the main weapon: a queued sub/special
      // cannot materialize after this real source CPU has been splatted.
      if (this.f3dSourceGoals&&!this.sourceCpuMayStartActions(
        this.bots.find(bot=>bot.id===request.sourceId))){
        // SOURCE only: an unspent SUB/SPECIAL from a still-living but
        // physically unjoined CPU is rejected as an actual failed effect.
        // Never refund the resource penalty of an already splatted actor.
        const bot=this.bots.find(b=>b.id===request.sourceId);
        if(this.phase14qF2RecoverableSteps&&
           this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
           bot?.lifeState==='ACTIVE'&&bot.hp>0&&bot.team===request.team)
          this.rollbackRejectedKitRequest(request,'REJOIN_HOLD');
        continue;
      }
      const accepted = consumer(request);
      if (!accepted) this.rollbackRejectedKitRequest(request);
      else if (this.f4SharedBombsEnabled && request.kind === 'SUB') {
        const bot = this.bots.find(candidate => candidate.id === request.sourceId);
        if (bot) bot.f4SubRecoverySeconds = f4SubRecovery(request.subId);
      }
    }
    this.pendingKitRequests.length = 0;
  }

  public isF4DeviceOwnerAlive(actorId: string): boolean {
    return this.bots.some(bot=>bot.id===actorId && bot.lifeState==='ACTIVE' && bot.hp>0);
  }

  public f4ActiveLifeKey(actorId:string):string|null {
    const bot=this.bots.find(row=>row.id===actorId);
    return bot&&bot.lifeState==='ACTIVE'&&bot.hp>0?
      JSON.stringify([bot.id,bot.f4LifeSerial]):null;
  }

  public f4IsGroundedLife(actorId:string):boolean {
    const bot=this.bots.find(row=>row.id===actorId);
    return !!bot&&bot.lifeState==='ACTIVE'&&bot.hp>0&&bot.mobilityState==='GROUND';
  }

  public isActorActive(actorId: string): boolean {
    const bot = this.bots.find((candidate) => candidate.id === actorId);
    return Boolean(bot && bot.lifeState === 'ACTIVE');
  }

  public addScoreablePaintByActor(
    areaByActor: Readonly<Record<string, number>>
  ): void {
    for (const [actorId, area] of Object.entries(areaByActor)) {
      if (!Number.isFinite(area) || area <= 0) continue;
      this.stats.cpuScoreablePaintMeters2 += area;
      const bot = this.bots.find((candidate) => candidate.id === actorId);
      if (!bot) continue;

      const kit = weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
      const required = specialWeaponProfile(kit.special).requiredPoints;
      bot.specialPoints = Math.min(
        required,
        bot.specialPoints +
          area * GAME_CONFIG.special.pointsPerScoreableSquareMeter
      );
    }
    this.syncStats();
  }

  public resetKitGauges(): void {
    for (const bot of this.bots) {
      bot.specialPoints = 0;
      bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
      bot.specialDecisionCooldownSeconds =
        GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    }
    this.pendingKitRequests.length = 0;
    this.stats.cpuKitLast = '-';
    this.stats.cpuScoreablePaintMeters2 = 0;
    this.syncStats();
  }

  public forceKitQaReady(): boolean {
    let changed = 0;
    for (const bot of this.bots) {
      if (bot.lifeState !== 'ACTIVE') continue;
      const special = weaponKit(bot.weaponId,this.f4SharedBombsEnabled).special;
      bot.specialPoints = specialWeaponProfile(special).requiredPoints;
      bot.specialDecisionCooldownSeconds = 0;
      bot.subCooldownSeconds = 0;
      // This method is explicitly MANUAL QA only: autonomous turf firing may
      // legitimately use all ink before the isolated subweapon effect probe.
      // Record synthetic refills distinctly from earned gameplay resources.
      bot.ink = GAME_CONFIG.inkEconomy.capacity;
      bot.inkRecoveryLockSeconds = 0;
      changed += 1;
    }
    if (changed > 0) {
      this.stats.cpuKitLast = 'QA READY';
      this.syncStats();
      return true;
    }
    return false;
  }

  /**
   * Explicit F3 source QA only: manually dispatch an existing real CPU kit
   * from its actual approved physics foot toward its source-backed patrol
   * target. Never invent an enemy, spawn point, collision or scoring mask.
   * This is manual effects QA, NOT evidence of autonomous combat.
   */
  public queueSourceCpuKitQaAction(actorId: string, kind: 'SUB' | 'SPECIAL'): boolean {
    if (!this.phase14qF2RecoverableSteps ||
        !this.phase14eFirstDrop || !this.phase14qGroundCollision ||
        !this.f3dSourceGoals ||
        this.stage.metadata.id !== 'undertow-t21d-partial-connectivity-qa') {
      throw Error('T21_F3_CPU_KIT_MANUAL_SOURCE_QA_ONLY');
    }
    const bot = this.bots.find(b => b.id === actorId);
    const goal = this.qaMotionGoals.get(actorId);
    if (!bot || !goal || !bot.agent ||
        bot.lifeState !== 'ACTIVE' || bot.mobilityState !== 'GROUND') {
      return false;
    }
    // Target derives from the audited native patrol. Only the CPU's
    // OWN physical pose is used as the launch origin.
    const direction = goal.clone().sub(bot.position);
    if (direction.lengthSq() <= 1e-8) return false;
    direction.normalize();
    const kit = weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
    if (kind === 'SUB') {
      const profile = subWeaponProfile(kit.sub);
      if (bot.ink + 1e-6 < profile.inkCost || bot.subCooldownSeconds > 0) return false;
      const priorRecoveryLock=bot.inkRecoveryLockSeconds;
      bot.ink = Math.max(0, bot.ink - profile.inkCost);
      bot.inkRecoveryLockSeconds = GAME_CONFIG.inkEconomy.recoveryLockSeconds;
      bot.subCooldownSeconds = cpuSubCooldownSeconds(kit.sub, bot.role);
      this.pendingKitRequests.push({
        kind: 'SUB', sourceId: bot.id, team: bot.team,
        position: bot.position.clone(), target: goal.clone(),
        direction, subId: kit.sub,
        sourceSubRecovery:{
          lockBefore:priorRecoveryLock,expectedInkAfterCharge:bot.ink
        }
      });
      this.stats.cpuSubUses += 1;
      this.stats.cpuKitLast = bot.id + ':MANUAL_QA_SUB:' + profile.shortName;
      this.syncStats();
      return true;
    }
    const special = specialWeaponProfile(kit.special);
    if (bot.specialPoints + 1e-6 < special.requiredPoints ||
        bot.specialDecisionCooldownSeconds > 0) return false;
    const rollbackBefore: CpuSpecialResourceState = {
      specialPoints: bot.specialPoints,
      specialDecisionCooldownSeconds: bot.specialDecisionCooldownSeconds,
      subCooldownSeconds: bot.subCooldownSeconds
    };
    this.pendingKitRequests.push({
      kind: 'SPECIAL', sourceId: bot.id, team: bot.team,
      position: bot.position.clone(), target: goal.clone(),
      direction, specialId: kit.special, rollbackBefore
    });
    bot.specialPoints = 0;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.postSpecialDecisionCooldownSeconds;
    bot.subCooldownSeconds = Math.max(bot.subCooldownSeconds,
      GAME_CONFIG.cpu.kit.postSpecialSubLockSeconds);
    this.stats.cpuSpecialActivations += 1;
    this.stats.cpuKitLast = bot.id + ':MANUAL_QA_SPECIAL:' + special.shortName;
    this.syncStats();
    return true;
  }

  public forceSuperJumpQa(
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): boolean {
    for (const bot of this.bots) {
      if (
        bot.lifeState !== 'ACTIVE' ||
        bot.mobilityState !== 'GROUND' ||
        bot.jumpCooldownSeconds > 0
      ) {
        continue;
      }

      if (this.tryStartTacticalJump(
        bot,
        humanTeam,
        humanPosition,
        humanActive,
        true
      )) {
        return true;
      }
    }
    return false;
  }

  public forceAdvancedWeaponQa(): boolean {
    if (this.bots.length === 0) return false;

    this.pendingKitRequests.length = 0;
    let changed = 0;
    for (let i = 0; i < this.bots.length && i < CPU_ADVANCED_QA_WEAPONS.length; i += 1) {
      const bot = this.bots[i]!;
      bot.weaponId = CPU_ADVANCED_QA_WEAPONS[i]!;
      this.resetCpuWeaponRuntime(bot, true);
      this.resetCpuKitState(bot, true);
      bot.fireRemaining = 0;
      changed += 1;
    }

    if (changed > 0) {
      this.stats.cpuAdvancedQa = 'advanced-5';
      this.syncStats();
      return true;
    }
    return false;
  }

  public setF4ContactPracticeLoadout(active: boolean, canopy = false): void {
    if (!this.f4WholeNavigation) return;
    for (const bot of this.bots) {
      if (bot.id !== 'A3' && bot.id !== 'B4') continue;
      const weaponId = active
        ? bot.id === 'A3' ? 'dash-brush' : 'metro-roller'
        : canopy && bot.id === 'B4' ? 'canopy-guard' : cpuLoadout(bot.team, bot.slot).weaponId;
      if (bot.weaponId === weaponId) continue;
      bot.weaponId = weaponId;
      this.resetCpuWeaponRuntime(bot, true);
      this.resetCpuKitState(bot, true);
    }
    this.syncStats();
  }

  public forEachMapAgent(
    visitor: (
      id: string,
      team: Team.A | Team.B,
      position: Vec3,
      active: boolean,
      weaponId: WeaponId
    ) => void
  ): void {
    for (const bot of this.bots) {
      visitor(
        bot.id,
        bot.team,
        bot.position,
        bot.lifeState === 'ACTIVE' &&
          (bot.mobilityState === 'GROUND' || bot.mobilityState === 'JUMP_PREP'||this.f4ZipRuns.has(bot.id)||this.f4ZipRecovery.has(bot.id)),
        bot.weaponId
      );
    }
  }

  public findNearestCombatHit(
    from: Vec3,
    to: Vec3,
    sourceTeam: Team.A | Team.B,
    slosher?: { radius: number; resolvedTargets: ReadonlySet<string> }
  ): CpuCombatHit | null {
    const segment = to.clone().sub(from);
    const length = segment.length();
    if (length <= 1e-8) return null;
    const direction = segment.mulScalar(1 / length);
    const sourcePhysicalCapsule=this.f3dSourceGoals!==null&&
      this.phase14qF2RecoverableSteps&&
      (this.f4WholeNavigation||this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa');

    let best: CpuCombatHit | null = null;
    for (const bot of this.bots) {
      if (
        bot.team === sourceTeam ||
        slosher?.resolvedTargets.has(bot.id) ||
        bot.lifeState !== 'ACTIVE' ||
        (this.f3dSourceGoals !== null &&
         (!this.liveSourceCombatOpponent(bot)||bot.hp<=0)) ||
        isCpuJumpAirborne(bot)
      ) continue;

      if (
        bot.weaponGuarding &&
        bot.weaponGuardBreakSeconds <= 0 &&
        bot.weaponGuardHp > 0 &&
        this.isCpuGuardBlockingPoint(bot, from)
      ) {
        const shieldCenter = bot.position.clone()
          .add(bot.weaponFacing.clone().mulScalar(0.82));
        shieldCenter.y += 0.72;
        const shieldDistance = raySphereDistance(
          from,
          direction,
          length,
          shieldCenter,
          0.82 + (slosher?.radius ?? 0)
        );
        if (
          shieldDistance !== null &&
          (!best || shieldDistance < best.distance)
        ) {
          best = {
            botId: bot.id,
            distance: shieldDistance,
            point: from.clone().add(direction.clone().mulScalar(shieldDistance)),
            guarded: true,
            ...(slosher ? { targetPoint: shieldCenter } : {})
          };
        }
      }

      if(sourcePhysicalCapsule){
        const distance=raySourceCpuCapsuleDistance(
          from,direction,length,bot.position,slosher?.radius);
        if(distance!==null&&(!best||distance<best.distance)){
          const point=from.clone().add(direction.clone().mulScalar(distance));
          const centerY=bot.position.y+ORIGINAL_SOURCE_CPU_CAPSULE.centerOffsetMeters;
          const half=ORIGINAL_SOURCE_CPU_CAPSULE.halfHeightMeters;
          best={
            botId:bot.id,distance,
            point,
            guarded:false,
            ...(slosher ? { targetPoint: new Vec3(bot.position.x,
              clamp(point.y,centerY-half,centerY+half),bot.position.z) } : {})
          };
        }
      }else{
        for (const yOffset of GAME_CONFIG.cpu.hitSphereOffsetsMeters) {
          const center = bot.position.clone();
          center.y += yOffset;
          const distance = raySphereDistance(
            from,
            direction,
            length,
            center,
            GAME_CONFIG.cpu.hitRadiusMeters + (slosher?.radius ?? 0)
          );
          if (distance === null || (best && distance >= best.distance)) continue;
          best = {
            botId: bot.id,
            distance,
            point: from.clone().add(direction.clone().mulScalar(distance)),
            guarded: false,
            ...(slosher ? { targetPoint: center } : {})
          };
        }
      }
    }
    return best;
  }

  public applyProjectileHit(
    hit: CpuCombatHit, damage: number,
    sourceKind: 'HUMAN' | 'CPU' = 'CPU',
    actualCpuAttackerId?:string
  ): CpuProjectileHpResult|null {
    const bot = this.bots.find((candidate) => candidate.id === hit.botId);
    if (
      !bot ||
      bot.lifeState !== 'ACTIVE' ||
      bot.hp <= 0 ||
      isCpuJumpAirborne(bot) ||
      // A SOURCE projectile resolves its collision before HP application.
      // The same current-life physical-rejoin gate used at ray lookup
      // and native SUB/AoE damage must hold HERE as well: a splat/new
      // upper-spawn life or off-floor rejoin cannot accept stale damage.
      // Frozen T20/default projectile semantics stay unchanged.
      (this.f3dSourceGoals !== null &&
       !this.liveSourceCombatOpponent(bot))
    ) return null;
    if(!Number.isFinite(damage)||damage<=0)return null;
    if (hit.guarded && this.absorbCpuGuardDamage(bot, damage))
      return {botId:bot.id,sourceKind,hpBefore:bot.hp,hpAfter:bot.hp,
       realHpLoss:0,shieldAbsorbed:true,lethalHpZero:false};

    const previous = bot.hp;
    bot.hp = Math.max(0, bot.hp - damage);
    bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
    if (bot.hp < previous) {
      this.stats.cpuCombatHits += 1;
      // Guarded shots and CPU-vs-CPU damage are not human hit feedback.
      if (sourceKind === 'HUMAN') this.stats.humanCpuDirectHits += 1;
      // This runs only AFTER actual projectile HP reduction. Shield
      // absorption and surface paint cannot create false retaliation.
      if(this.b213SourceCounterfireEnabled){
        const shooter=sourceKind==='HUMAN'?'HUMAN':
          this.bots.find(b=>b.id===actualCpuAttackerId&&
            b.team!==bot.team&&b.lifeState==='ACTIVE')?.id??null;
        if(shooter){
          bot.b213ActualAttackerId=shooter;
          bot.b213ActualHitTick=this.b181NativeFrame;
          this.b181CachedCombat.delete(bot.id);
          if(this.f4WholeNavigation){
            this.b181CachedCombat.delete(bot.id+':main');
            this.b181CachedCombat.delete(bot.id+':kit');
            this.b181CachedCombat.delete(bot.id+':special');
            bot.thinkRemaining=0;
          }
          this.b213RealAttackerDamageEvents++;
        }
      }
      if (bot.hp === 0) {
        bot.lethalHumanDirect = sourceKind === 'HUMAN';
        // F3 SOURCE: real projectile HP-zero must remove the actual CPU
        // hit-sphere, Rapier actor foot and Crowd agent THIS tick. Otherwise
        // another genuine shot can collide with an already-dead opponent
        // before the following CPU update and falsely absorb a projectile.
        // F3D's existing constructor guard restricts this to the untouched
        // Undertow T21D original-source QA world. T20 remains unchanged.
        if (this.f3dSourceGoals) this.splatBot(bot);
      }
    }
    return {botId:bot.id,sourceKind,hpBefore:previous,hpAfter:bot.hp,
      realHpLoss:previous-bot.hp,shieldAbsorbed:false,
      lethalHpZero:previous>0&&bot.hp===0};
  }

  public applyAreaDamage(
    center: Vec3,
    radius: number,
    damage: number,
    sourceTeam: Team.A | Team.B,
    sourceMeleeTargetClear?: (bodyCenter: Vec3) => boolean,
    /** Canonical SOURCE only: same actual 0.29m-radius, 0.39m-half-height
     * CPU Rapier capsule as the live shared-actor collision system.
     * Optional to preserve the old T20/QA explosion hit contract. */
    nativeSourceCpuCapsuleContact = false,
    sourceHumanDirectMelee = false,
    near?: { radius: number; damage: number }
  ): number {
    if (radius <= 0 || damage <= 0) return 0;
    const radiusSq = radius * radius;
    // A real human swipe, not a SUB/CPU area effect, owns its own hit.
    const humanMelee=nativeSourceCpuCapsuleContact&&
      sourceHumanDirectMelee&&sourceMeleeTargetClear!==undefined;
    let hits = 0;

    for (const bot of this.bots) {
      if (
        bot.team === sourceTeam ||
        bot.lifeState !== 'ACTIVE' ||
        bot.hp <= 0 ||
        isCpuJumpAirborne(bot) ||
        // The SAME current-life physical-rejoin gate as SOURCE MAIN,
        // CHARGER and thrown-SUB direct hits. Blast radius alone is not
        // proof that a high-spawn or FIRST_DROP_REJOIN ghost was a
        // physically present opponent. Every genuine area attack (human
        // bomb, CPU bomb, special and melee) must respect this boundary.
        // Frozen T20/other legacy modes never acquire this extra gate.
        (this.f3dSourceGoals !== null &&
         !this.liveSourceCombatOpponent(bot))
      ) continue;
      const dx = bot.position.x - center.x;
      const dy = bot.position.y + 0.68 - center.y;
      const dz = bot.position.z - center.z;
      let targetDamage = damage;
      if(nativeSourceCpuCapsuleContact){
        // The real 60Hz SOURCE CPU collider is Rapier.capsule(.39,.29),
        // centered at the original Crowd foot +.68m. An explosion is a
        // sphere: contact occurs within (blast radius + capsule radius)
        // of the capsule's vertical central segment. The old one-point
        // test incorrectly missed live FOOT and HEAD contacts.
        const axisDeltaY=Math.max(0,Math.abs(dy)-.39);
        const reach=radius+.29;
        const distanceSq = dx*dx+dz*dz+axisDeltaY*axisDeltaY;
        if(distanceSq>reach*reach)continue;
        if (near && distanceSq <= (near.radius + .29) ** 2) targetDamage = near.damage;
      }else{
        // Frozen T20 and deterministic QA keep the exact old center test.
        if(dx*dx+dy*dy+dz*dz>radiusSq)continue;
      }
      // SOURCE original Rapier wall protection, melee only. All other
      // blast/SUB or legacy callers pass no predicate.
      if(sourceMeleeTargetClear&&!sourceMeleeTargetClear(
        new Vec3(bot.position.x,bot.position.y+0.68,bot.position.z)
      ))continue;

      if (
        bot.weaponGuarding &&
        this.isCpuGuardBlockingPoint(bot, center) &&
        this.absorbCpuGuardDamage(bot, targetDamage)
      ) {
        hits += 1;
        continue;
      }

      const previous = bot.hp;
      bot.hp = Math.max(0, bot.hp - targetDamage);
      bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
      if (bot.hp < previous) {
        this.stats.cpuCombatHits += 1;
        if(humanMelee)this.stats.humanCpuDirectHits += 1;
        if (bot.hp === 0) {
          bot.lethalHumanDirect = humanMelee;
          // Same real F3 source HP lifecycle for native sub/special AoE.
          // One actual dead body must never absorb a second projectile.
          if (this.f3dSourceGoals) this.splatBot(bot);
        }
        hits += 1;
      }
    }
    return hits;
  }

  private spawnTeam(team: Team.A | Team.B, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const slot = this.bots.filter((bot) => bot.team === team).length;
      const start = this.spawnPosition(team, slot);
      const agent = this.navigation.addAgent(start);
      const loadout = cpuLoadout(team, slot);
      const role = loadout.role;

      const entity = new Entity(
        `CPU:${team === Team.A ? 'A' : 'B'}:${slot + 1}:${role}:${loadout.weaponId}`
      );
      entity.addComponent('render', {
        type: 'capsule',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: true,
        receiveShadows: true
      });
      entity.setLocalScale(0.58, 0.88, 0.58);
      entity.setPosition(start.x, start.y + 0.68, start.z);
      this.app.root.addChild(entity);
      if(this.b248VisualEnabled){
         const visual=decorateB248Actor(entity,team===Team.A?'A':'B','CPU');
         visual.setEnabled(this.b248VisualShown);
         this.b248VisualByActor.set(`${team===Team.A?'A':'B'}${slot+1}`,visual);
       }

      const jumpMarker = new Entity(`CPUJumpMarker:${team === Team.A ? 'A' : 'B'}:${slot + 1}`);
      jumpMarker.addComponent('render', {
        type: 'cylinder',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: false,
        receiveShadows: false
      });
      jumpMarker.setLocalScale(0.95, 0.025, 0.95);
      jumpMarker.enabled = false;
      this.app.root.addChild(jumpMarker);

      const guardEntity = new Entity(
        `CPUGuard:${team === Team.A ? 'A' : 'B'}:${slot + 1}`
      );
      guardEntity.addComponent('render', {
        type: 'box',
        material: team === Team.A ? this.materialA : this.materialB,
        castShadows: false,
        receiveShadows: false
      });
      guardEntity.setLocalScale(1.55, 1.05, 0.08);
      guardEntity.enabled = false;
      this.app.root.addChild(guardEntity);

      this.bots.push({
        id: `${team === Team.A ? 'A' : 'B'}${slot + 1}`,
        team,
        role,
        slot,
        agent,
        entity,
        previousPosition: start.clone(),
        position: start.clone(),
        thinkRemaining:
          GAME_CONFIG.cpu.tacticalThinkSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        paintRemaining:
          GAME_CONFIG.cpu.paintCadenceSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        fireRemaining:
          weaponProfile(loadout.weaponId, this.f4WholeNavigation).fireIntervalSeconds *
          ((this.bots.length % GAME_CONFIG.cpu.cpuPlayers) / GAME_CONFIG.cpu.cpuPlayers),
        weaponId: loadout.weaponId,
        weaponChargeSeconds: 0,
        weaponBurstShotsRemaining: 0,
        weaponBurstCooldown: 0,
        weaponRollPaintCooldown: 0,
        weaponFacing: new Vec3(0, 0, team === Team.A ? -1 : 1),
        weaponGuardHp: 100,
        weaponGuardBreakSeconds: 0,
        weaponGuarding: false,
        guardEntity,
        hp: GAME_CONFIG.combat.playerMaxHp,
        ink: GAME_CONFIG.inkEconomy.capacity,
        inkRecoveryLockSeconds: 0,
        hpRecoveryDelaySeconds: 0,
        lethalHumanDirect: false,
        b213ActualAttackerId:null,
        b213ActualHitTick:-1,
        lifeState: 'ACTIVE',
        f4LifeSerial: 1,
        respawnRemainingSeconds: 0,
        mobilityState: 'GROUND',
        rejoinElapsedFrames: 0,
        rejoinStableFrames: 0,
        rejoinRetryCount: 0,
        rejoinPhysicalLandingFoot: start.clone(),
        jumpMarker,
        jumpStartPosition: start.clone(),
        jumpTargetPosition: start.clone(),
        jumpTargetId: '-',
        jumpPrepRemaining: 0,
        jumpTravelElapsed: 0,
        jumpActionRemaining: 0,
        jumpCooldownSeconds: 0,
        jumpRespawnWindowSeconds: 0,
        jumpArcHeight: GAME_CONFIG.superJump.minArcHeightMeters,
        subCooldownSeconds:
          GAME_CONFIG.cpu.kit.spawnSubCooldownBaseSeconds +
          slot * GAME_CONFIG.cpu.kit.spawnSubCooldownPerSlotSeconds,
        specialPoints: 0,
        specialDecisionCooldownSeconds:
          GAME_CONFIG.cpu.kit.spawnSpecialDecisionBaseSeconds +
          slot * GAME_CONFIG.cpu.kit.spawnSpecialDecisionPerSlotSeconds
      });
    }
  }

  private sampleRegisteredSourceFoot(bot:CpuBot){
    if(bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||!bot.agent)
      return null;
    const support=this.phase14qGroundCollision?.sourceFootSupport?.(
      bot.id,bot.position)??null;
    if(this.f4WholeNavigation){
      if(this.f4PlayableTactics&&(!support||Math.abs(support.point.y-bot.position.y)>.25))return null;
      return support?this.gameplayInk.sampleWorld(
        support.point,this.f4PlayableTactics?.055:.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall):null;
    }
    return b178SampleRegisteredSourceFoot(
      this.gameplayInk,this.stage.paintSurfaces,support);
  }

  private updateResources(bot: CpuBot, dt: number): void {
    const mist = this.f4Mist?.(bot.id,bot.team,bot.position.clone().add(new Vec3(0,.68,0)),bot.ink);
    if (mist) bot.ink = Math.max(0,bot.ink-mist.drain);
    bot.inkRecoveryLockSeconds = Math.max(0, bot.inkRecoveryLockSeconds - dt);
    if (bot.f4SubRecoverySeconds) bot.f4SubRecoverySeconds = Math.max(0,bot.f4SubRecoverySeconds - dt);
    bot.hpRecoveryDelaySeconds = Math.max(0, bot.hpRecoveryDelaySeconds - dt);

    this.samplePoint.copy(bot.position);
    this.samplePoint.y += 0.10;
    const usePhysicalInk=this.b178RealSourceInkRecovery||this.f4WholeNavigation;
    const sample = usePhysicalInk
      ?this.sampleRegisteredSourceFoot(bot):this.gameplayInk.sampleWorld(
      this.samplePoint,
      0.48,
      b178FootMask(this.b178RealSourceInkRecovery),
      SurfaceFlags.Wall
    );
    const relation=b178FootRelation(
      sample,bot.team,usePhysicalInk
    );
    if(this.b178RealSourceInkRecovery){
      if(relation==='OWN')this.b178OwnNativeTicks++;
      else if(relation==='ENEMY')this.b178EnemyNativeTicks++;
      else this.b178NeutralNativeTicks++;
    }
    // SOURCE only: the identical *registered Rapier-backed ownerGrid*
    // sample driving enemy HP now also slows a real, grounded CPU.
    // Updating native Crowd speed BEFORE its 60Hz step avoids moving
    // the steering proxy 4.4m/s while accepting only 1.35m/s in KCC.
    // A missing/unsupported painted floor never implies enemy ink.
    if(usePhysicalInk&&this.phase14qF2RecoverableSteps&&
       this.f3dSourceGoals!==null&&
       this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
       bot.agent){
      const baseSpeed=relation==='ENEMY'?
        GAME_CONFIG.player.squidEnemyInkSpeedMetersPerSecond:
        GAME_CONFIG.cpu.maxSpeedMetersPerSecond;
      const contact=bot.contactMovingFrames&&this.f4WholeNavigation?
        weaponProfile(bot.weaponId,true).contactWeapon:undefined;
      const speed=(contact?baseSpeed*contactMoveMultiplier(
        contact,bot.contactMovingFrames!):baseSpeed)*(mist?.speedScale??1);
      if(this.b178NativeCpuMovementSpeed.get(bot.id)!==speed||
         this.b178NativeCpuSpeedAgent.get(bot.id)!==bot.agent){
        bot.agent.updateParameters({maxSpeed:speed});
        this.b178NativeCpuMovementSpeed.set(bot.id,speed);
        this.b178NativeCpuSpeedAgent.set(bot.id,bot.agent);
      }
    }

    if (!mist && bot.inkRecoveryLockSeconds <= 0 && !bot.f4SubRecoverySeconds) {
      const rate = relation === 'OWN'
        ? GAME_CONFIG.cpu.ownInkRecoveryPerSecond
        : GAME_CONFIG.inkEconomy.humanRecoveryPerSecond;
      const actualInkBefore=bot.ink;
      bot.ink = Math.min(GAME_CONFIG.inkEconomy.capacity, bot.ink + rate * dt);
      if(this.b178RealSourceInkRecovery&&relation==='OWN'&&
         bot.ink>actualInkBefore){
        this.b179ActualOwnInkRecovered+=bot.ink-actualInkBefore;
        this.b179ActualOwnRecoverTicks++;
      }
    }

    if (relation === 'ENEMY') {
      // Reaching the enemy-ink HP floor must never turn on passive
      // healing while the real CPU foot is still inside enemy paint.
      // The existing HP limit, damage and post-contact delay stay intact.
      if (bot.hp > GAME_CONFIG.combat.enemyInkMinimumHp) {
        const damage = Math.min(
          GAME_CONFIG.combat.enemyInkDamagePerSecond * dt,
          bot.hp - GAME_CONFIG.combat.enemyInkMinimumHp
        );
        bot.hp -= damage;
        if(this.b178RealSourceInkRecovery)this.b179ActualEnemyHpLost+=damage;
        if (damage > 0) bot.hpRecoveryDelaySeconds = GAME_CONFIG.combat.hpRecoveryDelaySeconds;
      }
    } else if (bot.hp > 0 && bot.hpRecoveryDelaySeconds <= 0) {
      const rate = relation === 'OWN'
        ? GAME_CONFIG.cpu.ownInkHpRecoveryPerSecond
        : GAME_CONFIG.combat.humanHpRecoveryPerSecond;
      bot.hp = Math.min(GAME_CONFIG.combat.playerMaxHp, bot.hp + rate * dt);
    }
    if(this.f4PlayableTactics&&this.f4WholeNavigation){
      bot.f4RecoveringHp=f4CpuWoundedRecovery(bot.f4RecoveringHp===true,bot.hp,GAME_CONFIG.combat.playerMaxHp);
      // Steering reads the same current tank as the later weapon decision.
      bot.f4RecoveringInk=recoveringInk(bot.f4RecoveringInk===true,bot.ink,GAME_CONFIG.inkEconomy.capacity);
    }
  }

  /** SOURCE turf-only SUB target for an otherwise idle real CPU.
   * The cost, cooldown, and ballistic hit/paint are owned by the existing
   * updateCpuKit and CpuKitSystem; this is ONLY an untrusted aim proposal.
   * A valid original Rapier-backed current foot and independently
   * registered target support plus stage first-blocker are mandatory.
   * Never draw target points outside the 17 original source surfaces. */
  private chooseB216OriginalSourceSubPaintAim(bot:CpuBot):Vec3|null{
    if(!this.b215SelectedBattlePaintPacing||
       !this.p2OuterOriginalBackfill||
       !this.phase14qF2RecoverableSteps||
       !this.b216SourceStageAimValidated||
       !this.f3dSourceGoals||
       this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
       !bot.agent||bot.lifeState!=='ACTIVE'||
       bot.mobilityState!=='GROUND'||
       this.f3dSourceGoals.isLiveRejoinedSourceCpu?.(bot.id)!==true)
      return null;
    const support=this.phase14qGroundCollision?.sourceFootSupport?.(
      bot.id,bot.position);
    if(!support||
       !this.stage.solids.some(s=>s.id===support.solidId)||
       Math.abs(support.point.y-bot.position.y)>.25)
      return null;
    // Full raster reads across 17 original paint surfaces are costly.
    // Retry the genuine unpainted-cell search only after 45 native ticks
    // or >=2m of ACTUAL physical movement. No actor/ink mutation here.
    const now=Number.isSafeInteger(this.b181NativeFrame)?
      this.b181NativeFrame:0;
    const last=this.nativeSourceSubScanByActor.get(bot.id);
    if(last&&now<last.nextNativeFrame&&
       Math.hypot(bot.position.x-last.foot.x,
        bot.position.z-last.foot.z)<2){
      this.nativeSourceSubGridDeferred++;
      return null;
    }
    this.nativeSourceSubScanByActor.set(bot.id,{
      nextNativeFrame:now+45,foot:bot.position.clone()
    });
    this.nativeSourceSubGridScans++;
    const candidates=b216OriginalUnpaintedGridCandidates(
      this.gameplayInk.getSurfaces(),bot.position,bot.team,
      GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters,
      GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters);
    for(const target of candidates){
      const distance=Math.sqrt(horizontalDistanceSq(bot.position,target));
      if(distance<GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters||
         distance>GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters)
        continue;
      if(this.b216OriginalSourceTurfSightClear(bot,target)){
       this.nativeSourceSubValidAims++;
       return target;
      }
    }
    return null;
  }

  /** A visible enemy is not an actionable target when every CURRENT
   * real weapon option is out of range or unpaid. In the selected
   * original-source turf round only, let that CPU work on authentic
   * unowned nearby paint rather than reserving its kit aim indefinitely
   * for an opponent beyond the unfinished F4 connection.
   * No invented path, enemy, shot, resource or score is authorized. */
  private sourceTurfHasActionableEnemy(
    bot:CpuBot,target:Vec3
  ):boolean{
    if(this.cpuTargetInRange(bot,target,weaponProfile(bot.weaponId, this.f4WholeNavigation)))
      return true;
    const distance=Math.sqrt(horizontalDistanceSq(bot.position,target));
    const kit=weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
    const sub=subWeaponProfile(kit.sub);
    if(bot.subCooldownSeconds<=0&&bot.ink+1e-6>=sub.inkCost&&
       distance>=GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters&&
       distance<=GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters)
      return true;
    const special=specialWeaponProfile(kit.special);
    return bot.specialPoints+1e-6>=special.requiredPoints&&
      bot.specialDecisionCooldownSeconds<=0&&
      this.shouldUseCpuSpecial(bot,kit.special,distance);
  }

  /** The ORIGINAL source selected battle may choose a real paid bomb
   * instead of one main-weapon shot when actual unpainted floor is
   * reachable. This runs BEFORE the regular main-weapon fire decision:
   * no same-tick main+sub, no invented target, and no more than the
   * existing paid sub cooldown allows. Real enemies always win. */
  private trySourceTurfSubBeforeMain(
    bot:CpuBot,humanTeam:Team.A|Team.B,
    humanPosition:Vec3,humanActive:boolean
  ):boolean{
    if(!this.b215SelectedBattlePaintPacing||
       !this.p2OuterOriginalBackfill||
       !this.phase14qF2RecoverableSteps||
       !this.sourceCpuMayStartActions(bot)||
       bot.weaponGuarding||bot.weaponChargeSeconds>0||
       bot.weaponBurstShotsRemaining>0||
       (this.f4WholeNavigation&&(bot.f4CanopyOpen||this.hasF4MainWindup(bot)))||
       bot.subCooldownSeconds>0)return false;
    const subId=weaponKit(bot.weaponId,this.f4SharedBombsEnabled).sub;
    if(bot.ink+1e-6<subWeaponProfile(subId).inkCost)
      return false;
    // This checks ACTUAL original-stage human/CPU sight, not a fake
    // opponent or a future/unauthorized cross-team route.
    const visibleEnemy=this.chooseCombatTarget(
      bot,humanTeam,humanPosition,humanActive,0);
    if(visibleEnemy){
      // A real visible combatant may be outside this MAIN's range but
      // inside its paid physical SUB range. Launch the existing bomb
      // BEFORE this tick's floor main shot blocks the kit cooldown.
      // Preserve an already-earned SPECIAL and any reachable MAIN.
      const distance=Math.sqrt(horizontalDistanceSq(
        bot.position,visibleEnemy));
      const kit=weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
      const special=specialWeaponProfile(kit.special);
      const specialPreferred=bot.specialPoints+1e-6>=
          special.requiredPoints&&bot.specialDecisionCooldownSeconds<=0&&
          this.shouldUseCpuSpecial(bot,kit.special,distance);
      const genuineSourceEnemy=this.f3dSourceGoals!==null&&
        this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
        !!this.b181OriginalCombatStageRay&&
        this.f3dSourceGoals.isLiveRejoinedSourceCpu?.(bot.id)===true;
      if(genuineSourceEnemy&&!specialPreferred&&
         !this.cpuTargetInRange(bot,visibleEnemy,weaponProfile(bot.weaponId, this.f4WholeNavigation))&&
         distance>=GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters&&
         distance<=GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters){
        const support=this.phase14qGroundCollision?.sourceFootSupport?.(
          bot.id,bot.position);
        if(support&&this.stage.solids.some(s=>s.id===support.solidId)&&
           Math.abs(support.point.y-bot.position.y)<=.25){
          const direction=visibleEnemy.clone().sub(bot.position);
          if(direction.lengthSq()>1e-8){
            direction.normalize();
            return this.queueCpuPaidSub(bot,subId,visibleEnemy,direction);
          }
        }
      }
      if(this.sourceTurfHasActionableEnemy(bot,visibleEnemy))
        return false;
    }
    const target=this.chooseB216OriginalSourceSubPaintAim(bot);
    if(!target)return false;
    const direction=target.clone().sub(bot.position);
    if(direction.lengthSq()<=1e-8)return false;
    direction.normalize();
    return this.queueCpuPaidSub(bot,subId,target,direction,true);
  }

  /** Preserve exactly the former T20/ordinary SOURCE main->kit order
   * unless one existing ORIGINAL foot, actual unowned cell and paid kit
   * all validate. Even blocked Crowd paths remain at real Rapier feet. */
  private updateCpuWeaponsAndKit(
    bot:CpuBot,dt:number,humanTeam:Team.A|Team.B,
    humanPosition:Vec3,humanActive:boolean,groundTravel?:GroundTravel
  ):void{
    // A real reserved volley owns the main action until emitted/cancelled.
    // Keep real weapon timers ticking once; never start another paid action.
    if(this.hasF4MainWindup(bot)){
      const profile=weaponProfile(bot.weaponId,true);
      this.advanceCpuWeaponTimers(bot,dt,Boolean(profile.shooter||profile.blaster||
        profile.contactWeapon||profile.slosher||profile.canopy));
      bot.contactMovingFrames=0;
      return;
    }
    // F4 only: an actual low tank earns a quiet recovery window. Preserve
    // committed charge/burst and allow paid close-defense shots; no forced
    // refill, invented movement or change to the actual recovery rates.
    if(this.f4WholeNavigation&&this.f4ResearchCombatStageRay){
      bot.f4RecoveringInk=recoveringInk(bot.f4RecoveringInk===true,bot.ink,GAME_CONFIG.inkEconomy.capacity);
      if(bot.f4RecoveringInk){
        const profile=weaponProfile(bot.weaponId,true);
        const committed=bot.weaponChargeSeconds>0||bot.weaponBurstShotsRemaining>0;
        const target=committed?null:this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,dt,true);
        const action:CpuWeaponAction=profile.weaponClass==='STRINGER'?'STRINGER_RELEASE':
          profile.weaponClass==='SPLATANA'?'SPLATANA_RELEASE':
          profile.weaponClass==='ROLLER'?'ROLLER_FLICK':
          profile.weaponClass==='BRUSH'?'BRUSH_SWIPE':'PROJECTILE';
        const minCharge=profile.charger?profile.minChargeSeconds/Math.max(1e-6,profile.chargeSeconds):0;
        const mode=recoveryAction({recovering:true,committed,ink:bot.ink,
          minCost:cpuWeaponInkCost(profile,action,minCharge),range:cpuWeaponRangeMeters(profile),
          visible:target!==null,distance:target?this.f4CombatMuzzleDistance(bot,target):Infinity});
        if(mode==='RECOVER'){
          this.advanceCpuWeaponTimers(bot,dt,Boolean(profile.shooter||profile.blaster||
            profile.contactWeapon||profile.slosher||profile.canopy));
          bot.f4CanopyHold=false;
          bot.weaponGuarding=false;
          bot.contactMovingFrames=0;
          return;
        }
        this.updateCpuWeapon(bot,dt,humanTeam,humanPosition,humanActive,groundTravel);
        return; // No optional bomb while reserving actual ink for recovery.
      }
      if(this.tryF4CombatSubBeforeMain(bot,humanTeam,humanPosition,humanActive)){
        this.advanceCpuWeaponTimers(bot,dt);
        bot.contactMovingFrames=0;
        return;
      }
    }
    if(this.trySourceTurfSubBeforeMain(
      bot,humanTeam,humanPosition,humanActive)){
      // A genuine bomb replaces this tick's main shot. Update all the
      // ordinary weapon timers exactly once, not a free extra main shot.
      this.advanceCpuWeaponTimers(bot,dt);
      bot.contactMovingFrames=0;
      return;
    }
    const shotsBefore=this.pendingShots.length;
    this.updateCpuWeapon(bot,dt,humanTeam,humanPosition,humanActive,groundTravel);
    // Even contact travel can queue a main action without a shot timer.
    if(this.f4WholeNavigation&&this.pendingShots.length>shotsBefore)return;
    this.updateCpuKit(bot,humanTeam,humanPosition,humanActive);
  }

  /** A real visible enemy beyond MAIN reach may earn one already supported
   * paid bomb instead of another floor shot. No direct damage or throw physics. */
  private tryF4CombatSubBeforeMain(bot:CpuBot,humanTeam:Team.A|Team.B,
    humanPosition:Vec3,humanActive:boolean):boolean{
    if(!this.f4WholeNavigation||!this.f4SharedBombsEnabled||!this.f4ResearchCombatStageRay||
       !this.sourceCpuMayStartActions(bot)||bot.subCooldownSeconds>0||
       bot.weaponGuarding||bot.f4CanopyOpen||bot.weaponChargeSeconds>0||
       bot.weaponBurstShotsRemaining>0||bot.fireRemaining>1e-8)return false;
    const subId=weaponKit(bot.weaponId,true).sub;
    const cost=subWeaponProfile(subId).inkCost;
    const capacity=GAME_CONFIG.inkEconomy.capacity;
    if(bot.ink-cost<capacity*.25-1e-6||
       !['pulse-bomb','snap-bomb','anchor-bomb','torpedo'].includes(subId))return false;
    const target=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0);
    if(!target)return false;
    const range=cpuWeaponRangeMeters(weaponProfile(bot.weaponId,true));
    const distance=this.f4CombatMuzzleDistance(bot,target);
    if(distance<=range)return false;
    const main=this.chooseCombatTarget(bot,humanTeam,humanPosition,humanActive,0,true);
    if(!shouldThrowCombatSub({subId,visible:true,mainTargetVisible:main!==null,
      committed:false,recovering:bot.f4RecoveringInk===true,ink:bot.ink,cost,capacity,distance,
      mainRange:range,subMin:GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters,
      subMax:GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters}))return false;
    const direction=target.clone().sub(bot.position);
    if(direction.lengthSq()<=1e-8)return false;
    return this.queueCpuPaidSub(bot,subId,target,direction.normalize());
  }

  /** Shared SUB charge transaction: physical bomb pool, ink, cooldown,
   * real collision and rejected-request refund remain unchanged. */
  public useF4NaturalSpecial(natural:NonNullable<CpuAgentSystem['f4NaturalSpecial']>):void {this.f4NaturalSpecial=natural;}
  public f4NaturalActor(actorId:string){
    const bot=this.bots.find(row=>row.id===actorId);
    return bot?{actorId:bot.id,team:bot.team,weapon:bot.weaponId,lifeId:String(bot.f4LifeSerial),
      alive:bot.lifeState==='ACTIVE'&&bot.hp>0}:null;
  }
  public useF4PhysicalSpecialProbe(probe:NonNullable<CpuAgentSystem['f4PhysicalSpecialProbe']>):void {
    this.f4PhysicalSpecialProbe=probe;
  }

  public enableF4SharedBombs(): void {
    this.f4SharedBombsEnabled = true;
  }

  private f4SharedBombsEnabled = false;
  private f4Mist?: (id:string,team:Team.A|Team.B,body:Vec3,ink:number)=>{drain:number;speedScale:number}|undefined;

  public useF4Mist(query: NonNullable<CpuAgentSystem['f4Mist']>):void {
    this.f4Mist=query;
  }

  private queueCpuPaidSub(bot:CpuBot,subId:SubWeaponId,
    target:Vec3,direction:Vec3,originalFloorAim=false):boolean{
    const profile=subWeaponProfile(subId);
    if(bot.subCooldownSeconds>0||
       bot.ink+1e-6<profile.inkCost||
       ![target.x,target.y,target.z,
         direction.x,direction.y,direction.z].every(Number.isFinite)||
       direction.lengthSq()<=1e-8)return false;
    const priorRecoveryLock=bot.inkRecoveryLockSeconds;
    const recovery=this.f4SharedBombsEnabled?f4SubRecovery(subId):GAME_CONFIG.inkEconomy.recoveryLockSeconds;
    const nextLock=this.f4SharedBombsEnabled?mergedRecovery(priorRecoveryLock,recovery):recovery;
    if(this.f4SharedBombsEnabled&&(!Number.isFinite(bot.ink)||!Number.isFinite(profile.inkCost)||
       profile.inkCost<=0||nextLock===null))return false;
    bot.ink=Math.max(0,bot.ink-profile.inkCost);
    bot.inkRecoveryLockSeconds=nextLock!;
    bot.subCooldownSeconds=this.f4SharedBombsEnabled?F4_SUB_REPEAT:cpuSubCooldownSeconds(subId,bot.role);
    this.pendingKitRequests.push({
      kind:'SUB',sourceId:bot.id,team:bot.team,
      position:bot.position.clone(),target:target.clone(),
      direction:direction.clone(),subId,
      sourceTurfSubAim:originalFloorAim&&
        this.b215SelectedBattlePaintPacing&&
        this.f3dSourceGoals&&this.phase14qF2RecoverableSteps&&
        this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'?
        true:undefined,
      sourceSubRecovery:this.f4SharedBombsEnabled || this.f3dSourceGoals&&
        this.phase14qF2RecoverableSteps&&
        this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'?{
          lockBefore:priorRecoveryLock,expectedInkAfterCharge:bot.ink
        }:undefined
    });
    this.stats.cpuSubUses++;
    this.stats.cpuKitLast=`${bot.id}:SUB:${profile.shortName}`;
    return true;
  }

  private updateCpuKit(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): void {
    if(this.f4WholeNavigation&&(bot.f4CanopyOpen||this.hasF4MainWindup(bot)))return;
    if (
      bot.lifeState !== 'ACTIVE' ||
      bot.mobilityState !== 'GROUND' ||
      bot.weaponGuarding ||
      bot.weaponChargeSeconds > 0 ||
      bot.weaponBurstShotsRemaining > 0
    ) {
      return;
    }

    const weapon = weaponProfile(bot.weaponId, this.f4WholeNavigation);
    if (
      weapon.fireIntervalSeconds > 0 &&
      bot.fireRemaining >
        weapon.fireIntervalSeconds *
        GAME_CONFIG.cpu.kit.actionConflictFireIntervalFraction
    ) {
      return;
    }

    // Enemy engagement always outranks turf. In ordinary SOURCE-only
    // battle with NO living visible enemy, a physically grounded CPU
    // may instead spend one real paid SUB on already registered unowned
    // ORIGINAL floor. This is a real thrown Rapier projectile, not a
    // fabricated hit, source actor, free ink or official score.
    // Legacy T20 and SOURCE staging/rejoin paths remain unchanged.
    const visibleEnemy = this.chooseCombatTarget(
      bot,
      humanTeam,
      humanPosition,
      humanActive,
      0
    );
    // Only the selected genuine original-source turf cycle ignores a
    // visible but currently unreachable opponent. Every other mode,
    // including frozen T20 and ordinary kit QA, keeps its old priority.
    const selectedTurfFallback=this.b215SelectedBattlePaintPacing&&
      this.p2OuterOriginalBackfill&&
      this.f3dSourceGoals!==null&&
      this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa';
    const combatTarget=visibleEnemy&&
      (!selectedTurfFallback||
       this.sourceTurfHasActionableEnemy(bot,visibleEnemy))?
      visibleEnemy:null;
    const kit = weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
    const actualSourceSubPaintAim=!combatTarget&&
      bot.subCooldownSeconds<=0&&
      bot.ink+1e-6>=subWeaponProfile(kit.sub).inkCost?
      this.chooseB216OriginalSourceSubPaintAim(bot):null;
    const target=combatTarget??actualSourceSubPaintAim;
    if (!target) return;
    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    const direction = target.clone().sub(bot.position);
    if (direction.lengthSq() <= 1e-8) return;
    direction.normalize();

    const specialProfile = specialWeaponProfile(kit.special);
    const specialReady = !this.f4WholeNavigation &&
      bot.specialPoints + 1e-6 >= specialProfile.requiredPoints;

    if (
      specialReady && !actualSourceSubPaintAim &&
      bot.specialDecisionCooldownSeconds <= 0 &&
      this.shouldUseCpuSpecial(bot, kit.special, distance)
    ) {
      const rollbackBefore: CpuSpecialResourceState = {
        specialPoints: bot.specialPoints,
        specialDecisionCooldownSeconds: bot.specialDecisionCooldownSeconds,
        subCooldownSeconds: bot.subCooldownSeconds
      };
      this.pendingKitRequests.push({
        kind: 'SPECIAL',
        sourceId: bot.id,
        team: bot.team,
        position: bot.position.clone(),
        target: target.clone(),
        direction: direction.clone(),
        specialId: kit.special,
        rollbackBefore
      });
      bot.specialPoints = 0;
      bot.specialDecisionCooldownSeconds =
        GAME_CONFIG.cpu.kit.postSpecialDecisionCooldownSeconds;
      bot.subCooldownSeconds = Math.max(
        bot.subCooldownSeconds,
        GAME_CONFIG.cpu.kit.postSpecialSubLockSeconds
      );
      this.stats.cpuSpecialActivations += 1;
      this.stats.cpuKitLast =
        `${bot.id}:SPECIAL:${specialProfile.shortName}`;
      return;
    }

    if (
      bot.subCooldownSeconds > 0 ||
      distance < GAME_CONFIG.cpu.kit.subMinTargetDistanceMeters ||
      distance > GAME_CONFIG.cpu.kit.subMaxTargetDistanceMeters
    ) {
      return;
    }

    // F4 offensive enemy bombs are admitted only by tryF4CombatSubBeforeMain.
    // The legacy kit fallback must not bypass its actual main-range/sight and
    // reserve-ink checks. Keep utility subs and genuine floor-paint throws.
    if(this.f4WholeNavigation&&combatTarget&&
       ['pulse-bomb','snap-bomb','anchor-bomb','torpedo'].includes(kit.sub))return;
    this.queueCpuPaidSub(bot,kit.sub,target,direction,
      !!actualSourceSubPaintAim&&!combatTarget);
  }

  private rollbackRejectedKitRequest(
    request: CpuKitRequest,reason:'POOL_DROP'|'REJOIN_HOLD'='POOL_DROP'
  ): void {
    const bot = this.bots.find(
      (candidate) => candidate.id === request.sourceId
    );
    if (!bot) return;

    if (request.kind === 'SPECIAL') {
      if (!request.rollbackBefore) {
        throw Error('CPU_SPECIAL_REJECTED_WITHOUT_RESOURCE_SNAPSHOT');
      }
      restoreRejectedCpuSpecial(bot, request.rollbackBefore);
      this.stats.cpuSpecialActivations = Math.max(
        0, this.stats.cpuSpecialActivations - 1
      );
      this.stats.cpuKitLast=bot.id+':SPECIAL:'+
        (reason==='REJOIN_HOLD'?'REJOIN_HOLD':'REJECTED_NO_EFFECT');
      this.syncStats();
      return;
    }

    const profile = subWeaponProfile(request.subId);
    const lockEvidence=request.sourceSubRecovery;
    const noLaterInkSpend=lockEvidence&&
      Number.isFinite(lockEvidence.lockBefore)&&
      Number.isFinite(lockEvidence.expectedInkAfterCharge)&&
      Math.abs(bot.ink-lockEvidence.expectedInkAfterCharge)<=1e-6;
    bot.ink = Math.min(
      GAME_CONFIG.inkEconomy.capacity,
      bot.ink + profile.inkCost
    );
    // The genuine original SOURCE rejected SUB launched no bomb and did
    // not buy a recovery lock, whether the physical rejoin was lost or
    // the real CPU bomb pool was full. Restore only when the SOURCE
    // transaction proves no later paid weapon/kit effect intervened.
    // Legacy T20 has no sourceSubRecovery and retains its normal timing;
    // a real splat never goes through this refund path.
    if(noLaterInkSpend)
      bot.inkRecoveryLockSeconds=Math.min(
        bot.inkRecoveryLockSeconds,lockEvidence.lockBefore);
    bot.subCooldownSeconds=reason==='REJOIN_HOLD'?0:
      GAME_CONFIG.cpu.kit.subPoolRetrySeconds;
    this.stats.cpuSubUses=Math.max(0,this.stats.cpuSubUses-1);
    this.stats.cpuKitLast=
      `${bot.id}:SUB:${profile.shortName}:${reason}`;
  }

  private shouldUseCpuSpecial(
    bot: CpuBot,
    specialId: SpecialWeaponId,
    distance: number
  ): boolean {
    switch (specialId) {
      case 'turf-pulse':
        return (
          distance <= GAME_CONFIG.cpu.kit.turfPulseMaxDistanceMeters ||
          bot.hp <= GAME_CONFIG.cpu.kit.turfPulseLowHpThreshold
        );
      case 'triple-strike':
        return (
          distance >= GAME_CONFIG.cpu.kit.tripleStrikeMinDistanceMeters &&
          distance <= GAME_CONFIG.cpu.kit.tripleStrikeMaxDistanceMeters
        );
      case 'drift-storm':
        return (
          distance >= GAME_CONFIG.cpu.kit.driftStormMinDistanceMeters &&
          distance <= GAME_CONFIG.cpu.kit.driftStormMaxDistanceMeters
        );
    }
    return false;
  }

  /** A charged SOURCE weapon must not silently lose its real burst when
   * another actor paints the chosen cell during charge/cooldown. An old aim
   * is NOT an authority: recheck the live CPU's registered Rapier support,
   * the original non-scoreable paint surface and native stage shot ray
   * before every subsequent shot. No navigation or collision is changed. */
  private revalidateSourceCommittedPaintAim(
    bot:CpuBot,profile:ReturnType<typeof weaponProfile>
  ):Vec3|null{
    const aim=this.sourceCommittedPaintAims.get(bot.id);
    if(!aim||aim.weaponId!==bot.weaponId||
       bot.lifeState!=='ACTIVE'||bot.hp<=0||
       bot.mobilityState!=='GROUND'||!bot.agent)return null;
    if(this.f4WholeNavigation){
      // Whole F4 has no legacy B216 floor-sight opt-in. Revalidate a
      // committed floor aim using its actual support, paint surface and ray.
      const ray=this.f4ResearchCombatStageRay;
      const support=this.phase14qGroundCollision?.sourceFootSupport?.(bot.id,bot.position);
      const paint=this.gameplayInk.sampleWorld(aim.target,.12,SurfaceFlags.Paintable,SurfaceFlags.Wall);
      if(!ray||!support||Math.abs(support.point.y-bot.position.y)>.25||
         !paint||paint.surface.isScoreable||!this.cpuTargetInRange(bot,aim.target,profile))return null;
      const muzzle=bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
      const delta=aim.target.clone().sub(muzzle);
      const distance=delta.length();
      if(!Number.isFinite(distance)||distance<=.12)return null;
      // The aim ends on the floor itself. Check the open segment before
      // contact; actual projectile collision remains authoritative.
      const end=muzzle.clone().add(delta.mulScalar((distance-.08)/distance));
      if(ray(muzzle,end))return null;
      // A committed weapon may finish its paid action, but prefer an
      // independently backed unowned neighbor over a saturated impact.
      if(this.f4PlayableTactics&&paint.owner===bot.team){
        const neighbor=b180OriginalSourceUnownedNeighborAim(paint,bot.team,candidate=>
          this.cpuTargetInRange(bot,candidate,profile)&&
          this.b216OriginalSourceTurfSightClear(bot,candidate)&&
          !!this.gameplayInk.sampleWorld(candidate,.055,SurfaceFlags.Paintable,SurfaceFlags.Wall,
            surface=>surface===paint.surface));
        if(neighbor)return neighbor;
      }
      return aim.target;
    }
    if(!this.b216SourceStageAimValidated||!this.sampleRegisteredSourceFoot(bot))return null;
    const paint=this.gameplayInk.sampleWorld(
      aim.target,.12,SurfaceFlags.Paintable,SurfaceFlags.Wall);
    if(!paint||paint.surface.isScoreable)return null;
    // A charged, actually paid SOURCE splatling/charger may keep its
    // last authentic aim while the normal ownerGrid search has no answer.
    // If its old impact center is NOW fully OWN, prefer a real unowned
    // neighboring CELL of that same original registered PaintSurface.
    // No additional shot, in-place paint, route, physics or score authority.
    if(paint.owner===bot.team){
      const neighbor=b180OriginalSourceUnownedNeighborAim(
       paint,bot.team,candidate=>
        this.cpuTargetInRange(bot,candidate,profile)&&
        this.b216OriginalSourceTurfSightClear(bot,candidate));
      if(neighbor){
        this.sourceCommittedPaintAims.set(bot.id,{
          weaponId:bot.weaponId,target:neighbor.clone()
        });
        return neighbor;
      }
    }
    // No independently valid unowned cell: preserve the previous paid
    // burst/charge target exactly as before, still requiring actual
    // weapon range and registered SOURCE Rapier projectile sight.
    if(!this.cpuTargetInRange(bot,aim.target,profile)||
       !this.b216OriginalSourceTurfSightClear(bot,aim.target))
      return null;
    return aim.target;
  }

  private advanceCpuWeaponTimers(bot:CpuBot,dt:number,fixedCadence=false):void{
    const remaining = bot.fireRemaining - dt;
    bot.fireRemaining = Math.max(0, fixedCadence && remaining < 1e-8 ? 0 : remaining);
    bot.weaponBurstCooldown=Math.max(0,bot.weaponBurstCooldown-dt);
    bot.weaponRollPaintCooldown=Math.max(0,bot.weaponRollPaintCooldown-dt);
    bot.weaponGuardBreakSeconds=Math.max(0,bot.weaponGuardBreakSeconds-dt);
    if(!bot.weaponGuarding&&bot.weaponGuardBreakSeconds<=0)
      bot.weaponGuardHp=Math.min(100,bot.weaponGuardHp+28*dt);
  }

  private updateCpuWeapon(
    bot: CpuBot,
    dt: number,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean,
    groundTravel?: GroundTravel
  ): void {
    const profile = weaponProfile(bot.weaponId, this.f4WholeNavigation);
    this.advanceCpuWeaponTimers(bot,dt,Boolean(
      profile.shooter || profile.blaster || profile.contactWeapon || profile.slosher || profile.canopy));

    // Combat takes priority. F3 source-lab patrols are separated by the
    // original unbound underpass: without a target in weapon range, paint
    // the verified ORIGINAL floor instead of firing imaginary enemy shots.
    const combatTarget = this.chooseCombatTarget(
      bot, humanTeam, humanPosition, humanActive, dt, true
    );
    const canTurfPaint = this.phase14qF2RecoverableSteps &&
      this.phase14qGroundCollision &&
      this.f3dSourceGoals &&
      this.stage.metadata.id === 'undertow-t21d-partial-connectivity-qa' &&
      (profile.weaponClass === 'SHOOTER' ||
       profile.weaponClass === 'DUALIES' ||
       profile.weaponClass === 'BLASTER' ||
       profile.weaponClass === 'SLOSHER' ||
       profile.weaponClass === 'CHARGER' ||
       profile.weaponClass === 'SPLATLING' ||
       // All 12 actual CPU kits must paint their registered original
       // source floor even when no enemy can physically cross F4.
       // Use the EXISTING paid projectile/roller/brush/splatana actions:
       // no automatic walking stamps, synthetic shots or new geometry.
       profile.weaponClass === 'ROLLER' ||
       profile.weaponClass === 'BRUSH' ||
       profile.weaponClass === 'BRELLA' ||
       profile.weaponClass === 'STRINGER' ||
       profile.weaponClass === 'SPLATANA');
    const cooldown = Math.max(0,
      (this.qaTurfShotCooldown.get(bot.id) ?? 0) - dt);
    this.qaTurfShotCooldown.set(bot.id, cooldown);
    const hasCombatInRange = combatTarget !== null &&
      this.cpuTargetInRange(bot, combatTarget, profile);
    // A Splatling may finish its real burst after its first turf shot;
    // throttling may prevent a *new* burst, but must not cancel an active one.
    const finishTurfBurst = profile.weaponClass === 'SPLATLING' &&
      bot.weaponBurstShotsRemaining > 0;
    // B150 opt-in: source-audited close teammate paints nearby true floor.
    // Existing enemy engagement wins; all real projectile logic is reused.
    // B151: A SOURCE AIM IS NOT A SHOT. Don't consume a scarce
    // floor candidate while the genuine weapon fire timer still blocks
    // a projectile; the original actual CPU weapon decides readiness.
    const allyProposal = canTurfPaint && !hasCombatInRange && cooldown <= 0 &&
      bot.fireRemaining <= 0 &&
      this.f3dSourceGoals?.chooseSourceAllySupportInkTarget?.(
       bot.id,bot.position,this.targetPoint)
      ? this.targetPoint.clone() : null;
    // A SOURCE-verified ally suggestion must also be reachable by the
    // actual equipped main weapon; otherwise try the other true floor aims.
    const allyInk=allyProposal&&
      this.cpuTargetInRange(bot,allyProposal,profile)&&
      this.b216OriginalSourceTurfSightClear(bot,allyProposal)?
      allyProposal:null;
    // B215 (opt-in REAL B207): B64/B180 samples actual expensive
    // original ownerGrid cells. Do not scan 7*60 times a second while
    // the REAL main weapon still cannot emit a physical shot. Keep
    // existing source default, genuine co-op and Splatling bursts intact.
    const b215QueryPaint=b215ShouldQueryNativePaintCandidate({
      selectedSourceBattle:this.b215SelectedBattlePaintPacing,
      actualWeaponFireRemaining:bot.fireRemaining,
      completingActualSplatlingBurst:finishTurfBurst
    });
    if(this.b215SelectedBattlePaintPacing&&canTurfPaint&&
       !hasCombatInRange&&cooldown<=0&&!b215QueryPaint)
      this.b215RealWeaponCooldownPaintScansDeferred++;
    // The previous genuine 180s RAW showed CPU shots continuing long
    // after source cells stopped changing. ONLY after eight REAL, same-
    // location zero-change CPU impact rasters, try the existing 360-degree
    // original-foot B216 search FIRST. Otherwise retain the proven fixed
    // patrol/aim order, and always fall back if no safe fresh aim exists.
    const realSaturatedImpacts=
      this.selectedSourcePaintSaturation.get(bot.id)?.unchangedImpacts??0;
    const realImpactSaturation=this.b215SelectedBattlePaintPacing&&
      realSaturatedImpacts>=8&&
      this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true;
    let turfTarget = canTurfPaint && !hasCombatInRange &&
      b215QueryPaint&&(cooldown <= 0 || finishTurfBurst)
      ? allyInk ?? (this.b64InkAngleSweepEnabled?
         (realImpactSaturation?
           this.chooseB216ActualOriginalPaintBackfill(bot,true)??
           // Previous genuine P2 B2/B3: paid shots kept repeating on
           // already-OWN floor, with zero late painted-cell change.
           // Unlike the NO-AIM drought (B1/B4), this live saturation
           // has valid aims but useless impacts. Once every eight REAL
           // no-change impact rasters try the same registered-source
           // exact-cell fallback instead of the same prior own aim.
           // Real SRC support, main weapon range, paid shot and full
           // original Rapier ray are independently re-checked.
           (realSaturatedImpacts%8===0?
             this.chooseB216OriginalUnpaintedGridAim(bot):null)
           :null) ??
         this.chooseB64SourceLateralInkTarget(bot,dt) ??
          this.chooseOriginalSourceTurfTarget(bot)??
          this.chooseB216ActualOriginalPaintBackfill(bot):
         this.chooseOriginalSourceTurfTarget(bot)) : null;
    // A failed old goal-based search may use an existing nearby backed turf
    // cell. After repeated real saturated impacts, permit a fresh patch even
    // when the prior candidate remains valid; never alter movement authority.
    if(this.f4WholeNavigation&&canTurfPaint&&!hasCombatInRange&&
       (!turfTarget||(this.f4PlayableTactics&&realSaturatedImpacts>=8&&!allyInk))&&
       (cooldown<=0||finishTurfBurst)&&bot.weaponChargeSeconds<=0&&
       bot.weaponBurstShotsRemaining<=0){
      const fresh=this.chooseF4NearbyTurfTarget(bot,profile);
      if(fresh)turfTarget=fresh;
    }
    // Charger and splatling already hold an independently source-verified
    // committed floor aim while actually charging/finishing a burst.
    // The P2 drought fallback must not replace that live trajectory.
    // Ordinary SOURCE behavior and all earlier aim priorities stay intact.
    const p2ChargeInProgress=
      (profile.weaponClass==='CHARGER'&&bot.weaponChargeSeconds>0)||
      (profile.weaponClass==='SPLATLING'&&
       (bot.weaponChargeSeconds>0||bot.weaponBurstShotsRemaining>0))||
      // Selected SOURCE STRINGER/SPLATANA have native held charges too;
      // never run expensive dry-grid scans while the shot is charging.
      (this.b215SelectedBattlePaintPacing&&
       (profile.weaponClass==='STRINGER'||
        profile.weaponClass==='SPLATANA')&&bot.weaponChargeSeconds>0);
    // Genuine P2 180s RAW: B1 had 9,913 weapon-ready NO-AIM checks
    // despite full ink and no original sight veto. Sparse source-foot
    // samples can miss a different original unowned floor patch.
    // Once 120 consecutive real weapon-ready choices lack an aim, make
    // only ONE extra bounded search per 30 misses. Every candidate
    // still requires true ownerGrid, weapon range, registered ORIGINAL
    // Rapier foot/target support and unobstructed original shot line.
    // Nothing changes for normal SOURCE or any earlier valid aim.
    if(this.p2OuterOriginalBackfill&&canTurfPaint&&
       !p2ChargeInProgress&&
       !hasCombatInRange&&b215QueryPaint&&
       (cooldown<=0||finishTurfBurst)){
      if(turfTarget){
        this.selectedSourceEmptyAimStreak.delete(bot.id);
        this.f3dSourceGoals?.noteRealSourcePaintAimDrought?.(
         bot.id,bot.position,0);
      }else{
        const misses=Math.min(100000,
         (this.selectedSourceEmptyAimStreak.get(bot.id)??0)+1);
        this.selectedSourceEmptyAimStreak.set(bot.id,misses);
        if(misses>=120&&misses%30===0){
          this.selectedSourceDenseSearches++;
          turfTarget=this.chooseB216ActualOriginalPaintBackfill(
           bot,true,true)??this.chooseB216OriginalUnpaintedGridAim(bot);
          if(turfTarget){
            this.selectedSourceEmptyAimStreak.delete(bot.id);
            this.f3dSourceGoals?.noteRealSourcePaintAimDrought?.(
             bot.id,bot.position,0);
          }else this.f3dSourceGoals?.noteRealSourcePaintAimDrought?.(
           bot.id,bot.position,misses);
        }
      }
    }
    // A STRINGER or SPLATANA needs several true 60Hz ticks to charge.
    // Retain a real floor aim through charge/burst only in the opted-in
    // SOURCE paths or whole F4. Never retain a hidden enemy aim here.
    const selectedSourceChargeWeapon=(this.b215SelectedBattlePaintPacing||this.f4WholeNavigation)&&
      (profile.weaponClass==='STRINGER'||profile.weaponClass==='SPLATANA');
    const chargedSourceWeapon=canTurfPaint&&
      (profile.weaponClass==='CHARGER'||
       profile.weaponClass==='SPLATLING'||selectedSourceChargeWeapon);
    const continuingCharge=bot.weaponChargeSeconds>0||
      (profile.weaponClass==='SPLATLING'&&bot.weaponBurstShotsRemaining>0);
    if(!chargedSourceWeapon||hasCombatInRange){
      this.sourceCommittedPaintAims.delete(bot.id);
    }else{
      // Genuine charged STRINGER/SPLATANA should not turn towards a newly
      // found lateral patch mid-shot. Keep the previous aim only while
      // current ownerGrid, range, original foot and stage ray still pass.
      const preferRetained=continuingCharge&&(selectedSourceChargeWeapon||this.f4WholeNavigation);
      if(preferRetained){
        const retained=this.revalidateSourceCommittedPaintAim(bot,profile);
        if(retained)turfTarget=retained;
      }
      if(turfTarget){
        this.sourceCommittedPaintAims.set(bot.id,{
          weaponId:bot.weaponId,target:turfTarget.clone()
        });
      }else if(continuingCharge){
        // Do not repeat the same physical query if already rejected above.
        turfTarget=preferRetained?null:this.revalidateSourceCommittedPaintAim(bot,profile);
        if(!turfTarget)this.sourceCommittedPaintAims.delete(bot.id);
      }else{
        this.sourceCommittedPaintAims.delete(bot.id);
      }
    }
    // Observe only already-computed real SOURCE weapon-ready decisions.
    // No additional ink, ray, Crowd, geometry or actor operation.
    if(this.b215SelectedBattlePaintPacing&&canTurfPaint&&
       !hasCombatInRange&&b215QueryPaint&&
       (cooldown<=0||finishTurfBurst)){
      const row=this.b215ReadOnlyInkRow(bot.id);
      row.weaponReadyPaintChecks++;
      if(turfTarget)row.approvedPaintAimChecks++;
      else row.noApprovedPaintAimChecks++;
      if(!this.qaMotionGoals.has(bot.id))row.checksWithoutNativeGoal++;
    }
    const target = turfTarget ?? combatTarget;

    if (target) this.updateCpuWeaponFacing(bot, target);
    if (profile.contactWeapon) {
      bot.weaponGuarding = false;
      this.updateCpuContactWeapon(bot, profile, target, hasCombatInRange, groundTravel, this.f4WholeNavigation&&turfTarget!==null);
      return;
    }

    switch (profile.weaponClass) {
      case 'SPLATLING':
        bot.weaponGuarding = false;
        this.updateCpuSplatling(bot, profile, target, dt, turfTarget !== null);
        return;
      case 'CHARGER':
        bot.weaponGuarding = false;
        this.updateCpuCharger(bot, profile, target, dt, turfTarget !== null);
        return;
      case 'ROLLER':
        bot.weaponGuarding = false;
        this.updateCpuRoller(bot, profile, target);
        return;
      case 'BRUSH':
        bot.weaponGuarding = false;
        this.updateCpuBrush(bot, profile, target);
        return;
      case 'BRELLA':
        this.updateCpuBrella(bot, profile, target, hasCombatInRange, this.f4WholeNavigation&&turfTarget!==null);
        return;
      case 'STRINGER':
        bot.weaponGuarding = false;
        this.updateCpuStringer(bot, profile, target, dt, this.f4WholeNavigation&&turfTarget!==null);
        return;
      case 'SPLATANA':
        bot.weaponGuarding = false;
        this.updateCpuSplatana(bot, profile, target, dt, this.f4WholeNavigation&&turfTarget!==null);
        return;
      default:
        bot.weaponGuarding = false;
        bot.weaponChargeSeconds = 0;
        bot.weaponBurstShotsRemaining = 0;
        if (!target || bot.fireRemaining > 0) return;
        if (!this.cpuTargetInRange(bot, target, profile)) return;

        if (this.queueCpuWeaponRequest(bot, target, 0, 'PROJECTILE',
          allyInk&&bot.id==='A1'?'A1_ORIGINAL_ALLY_SUPPORT_INK':undefined,
          turfTarget!==null)) {
          if(allyInk&&bot.id==='A1')this.b152AcceptedSourceAimShots++;
          if (turfTarget) {
            this.recordQaSourceTurfShot(bot);
          }
          bot.fireRemaining = profile.fireIntervalSeconds;
        } else {
          bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
        }
    }
  }

  private updateCpuContactWeapon(
    bot: CpuBot, profile: ReturnType<typeof weaponProfile>, target: Vec3 | null,
    hasCombatInRange: boolean, groundTravel?: GroundTravel, turfShot=false
  ): void {
    const contact = profile.contactWeapon!;
    const motion = groundTravel && contactMotion(groundTravel);
    if (motion) {
      const distance = target ? Math.sqrt(horizontalDistanceSq(bot.position, target)) : Infinity;
      const approaching = target &&
        motion.forward.dot(target.clone().sub(bot.position)) > distance * 0.55;
      const price = contactPaintSettings(contact, motion.distance * 60).ink;
      const reach=contact.vertical ? 1.85 : 1.4;
      const closeContact = hasCombatInRange && approaching &&
        distance > 0.05 && distance <= reach &&
        (!this.f4WholeNavigation||!target||this.f4CombatMuzzleDistance(bot,target)<=reach);
      const turf = !hasCombatInRange && (!target || bot.fireRemaining > 0) && bot.ink > 16
        ? this.gameplayInk.sampleWorld(motion.to, 0.10, SurfaceFlags.Paintable, SurfaceFlags.Wall)
        : null;
      // Do not spend the whole tank rolling on already-owned turf. Keep
      // rolling if a nearby backed cell is still worth painting or fighting.
      const usefulTurf=turf&&(!this.f4PlayableTactics||turf.owner!==bot.team||
        this.f4TurfValue(turf,bot.team,.65)>0);
      if ((closeContact || usefulTurf) && bot.ink + 1e-6 >= price) {
        this.pendingShots.push({
          sourceId: bot.id, team: bot.team, origin: bot.position.clone(),
          bodyPosition: bot.position.clone(), target: (target ?? motion.to).clone(), weaponId: profile.id,
          charge: 0, action: 'ROLLER_ROLL', groundTravel,
          f4SourceLifeSerial: this.f4WholeNavigation ? bot.f4LifeSerial : undefined
        });
        return;
      }
    }
    bot.contactMovingFrames = 0;
    if (target && this.cpuTargetInRange(bot, target, profile) && bot.fireRemaining <= 0 &&
        this.queueCpuWeaponRequest(bot, target, 0, contact.vertical ? 'ROLLER_FLICK' : 'BRUSH_SWIPE',undefined,turfShot)) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  public tryConsumeF4ContactInk(request: CpuFireRequest, cost: number, recovery: number): boolean {
    const bot = this.bots.find(candidate => candidate.id === request.sourceId);
    if (!this.f4WholeNavigation || !bot || bot.team !== request.team ||
        bot.weaponId !== request.weaponId || !sameCpuFireLife(request,bot) ||
        !this.sourceCpuMayStartActions(bot)) return false;
    const nextLock=mergedRecovery(bot.inkRecoveryLockSeconds,recovery);
    if (!Number.isFinite(bot.ink)||!Number.isFinite(cost)||cost<0||
        nextLock===null||bot.ink + 1e-6 < cost) {
      bot.contactMovingFrames = 0;
      return false;
    }
    bot.ink = Math.max(0, bot.ink - cost);
    bot.inkRecoveryLockSeconds = nextLock;
    bot.contactMovingFrames = (bot.contactMovingFrames ?? 0) + 1;
    return true;
  }

  public endF4ContactTravel(actor: string): void {
    const bot = this.bots.find(candidate => candidate.id === actor);
    if (bot) bot.contactMovingFrames = 0;
  }

  private updateCpuRoller(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    if (!target) return;

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    // F3 SOURCE: a target within range is NOT a native Recast path.
    // The ordinary movement tick requests an original-floor-supported
    // goal through SourceTraffic.chooseSourceGoal instead.
    if (b420MayLegacyMeleeChase('ROLLER',!!this.f3dSourceGoals,distance)) {
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }

    if (distance <= 1.45 && bot.weaponRollPaintCooldown <= 0) {
      if (this.queueCpuWeaponRequest(bot, target, 0, 'ROLLER_ROLL')) {
        bot.weaponRollPaintCooldown = 0.075;
      }
      return;
    }

    if (
      distance <= 4.6 &&
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'ROLLER_FLICK')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuBrush(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    if (!target) return;

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    if (b420MayLegacyMeleeChase('BRUSH',!!this.f3dSourceGoals,distance)) {
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }

    if (
      distance <= 2.45 &&
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'BRUSH_SWIPE')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuBrella(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    combatInRange = false, turfShot=false
  ): void {
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    if (profile.canopy) {
      bot.weaponGuarding = false;
      // Release the real canopy when the next attack is ready, unless
      // wounded and under recent actual fire.
      const sinceHit=this.b181NativeFrame-bot.b213ActualHitTick;
      const emergency=bot.hp<=62&&bot.b213ActualHitTick>=0&&sinceHit>=0&&sinceHit<=60;
      bot.f4CanopyHold = combatInRange && bot.ink > 1 &&
        (!this.f4WholeNavigation||bot.fireRemaining>1e-8||emergency);
      if (!bot.f4CanopyOpen && target && bot.fireRemaining <= 0 &&
          this.cpuTargetInRange(bot, target, profile) &&
          this.queueCpuWeaponRequest(bot, target, 0, 'BRELLA_BURST',undefined,turfShot)) {
        bot.fireRemaining = profile.fireIntervalSeconds;
      }
      return;
    }

    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponGuarding = false;
      return;
    }

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    const canGuard =
      bot.weaponGuardBreakSeconds <= 0 &&
      bot.weaponGuardHp > 0 &&
      distance <= 7.6;
    const lowHp = bot.hp <= 62;
    const postShotGuard =
      bot.fireRemaining > profile.fireIntervalSeconds * 0.34;

    bot.weaponGuarding = canGuard && (lowHp || postShotGuard);
    if (bot.weaponGuarding) return;

    if (
      bot.fireRemaining <= 0 &&
      this.queueCpuWeaponRequest(bot, target, 0, 'BRELLA_BURST')
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    }
  }

  private updateCpuStringer(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number, turfShot=false
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }
    if (bot.fireRemaining > 0) return;

    const distance = this.f4WholeNavigation&&!turfShot
      ? this.f4CombatMuzzleDistance(bot,target)
      : Math.sqrt(horizontalDistanceSq(bot.position, target));
    let targetChargeSeconds =
      distance >= 9.5 ? profile.chargeSeconds : profile.firstChargeSeconds;
    if(this.f4WholeNavigation){
      const cost=(seconds:number)=>cpuWeaponInkCost(profile,'STRINGER_RELEASE',
        seconds/Math.max(profile.chargeSeconds,1e-6));
      // Near targets may use a cheaper real minimum-charge volley.
      // Do not downgrade a distant target to an unproven short-range shot.
      if(bot.ink+1e-6<cost(targetChargeSeconds)&&distance<9.5)
        targetChargeSeconds=profile.minChargeSeconds;
      if(bot.ink+1e-6<cost(targetChargeSeconds)){
        bot.weaponChargeSeconds=0;
        return;
      }
    }

    bot.weaponChargeSeconds = Math.min(
      targetChargeSeconds,
      bot.weaponChargeSeconds + dt
    );
    if (bot.weaponChargeSeconds + 1e-6 < targetChargeSeconds) return;

    const charge = targetChargeSeconds / Math.max(profile.chargeSeconds, 1e-6);
    if (
      this.queueCpuWeaponRequest(
        bot,
        target,
        charge,
        'STRINGER_RELEASE',undefined,turfShot
      )
    ) {
      bot.fireRemaining = profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuSplatana(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number, turfShot=false
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    const distance = Math.sqrt(horizontalDistanceSq(bot.position, target));
    if (b420MayLegacyMeleeChase('SPLATANA',!!this.f3dSourceGoals,distance)) {
      // T20 still pursues at its legacy weapon distance; F3 SOURCE
      // requires the same original-floor path used by all other CPUs.
      bot.agent?.requestMoveTarget(this.navigation.closestPoint(target));
    }
    if (bot.fireRemaining > 0) return;

    const closeDistance=this.f4WholeNavigation&&!turfShot
      ? this.f4CombatMuzzleDistance(bot,target):distance;
    let targetChargeSeconds =
      closeDistance <= 2.25 ? profile.chargeSeconds : this.f4WholeNavigation ? 1 / 60 : 0.16;
    if(this.f4WholeNavigation){
      if(bot.ink+1e-6<F4_SABER_TIMING.horizontal.ink){
        bot.weaponChargeSeconds=0;
        return;
      }
      if(bot.ink+1e-6<F4_SABER_TIMING.charged.ink)targetChargeSeconds=1/60;
    }
    bot.weaponChargeSeconds = Math.min(
      targetChargeSeconds,
      bot.weaponChargeSeconds + dt
    );
    if (bot.weaponChargeSeconds + 1e-6 < targetChargeSeconds) return;

    const charge = targetChargeSeconds / Math.max(profile.chargeSeconds, 1e-6);
    if (
      this.queueCpuWeaponRequest(
        bot,
        target,
        charge,
        'SPLATANA_RELEASE',undefined,turfShot
      )
    ) {
      bot.fireRemaining = this.f4WholeNavigation
        ? F4_SABER_TIMING[charge >= 1 ? 'charged' : 'horizontal'].cooldown
        : profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuWeaponFacing(bot: CpuBot, target: Vec3): void {
    bot.weaponFacing.set(
      target.x - bot.position.x,
      0,
      target.z - bot.position.z
    );
    if (bot.weaponFacing.lengthSq() <= 1e-8) {
      bot.weaponFacing.set(0, 0, bot.team === Team.A ? -1 : 1);
    } else {
      bot.weaponFacing.normalize();
      if(this.f4CombatVisualFacing&&this.f4WholeNavigation)
        this.f4VisualAimTick.set(bot.id,{tick:this.b181NativeFrame,life:bot.f4LifeSerial});
    }
  }

  private updateCpuCharger(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number,
    turfShot: boolean
  ): void {
    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    if (bot.fireRemaining > 0) return;

    let release=1;
    if(this.f4WholeNavigation&&profile.charger&&!turfShot){
      const origin=bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
      const decision=chooseRailRelease({
        heldSeconds:bot.weaponChargeSeconds,dt,fullSeconds:profile.chargeSeconds,
        minSeconds:profile.minChargeSeconds,distance:origin.distance(target),ink:bot.ink,
        recentlyHit:bot.b213ActualHitTick>=0&&
          this.b181NativeFrame-bot.b213ActualHitTick>=0&&
          this.b181NativeFrame-bot.b213ActualHitTick<=72
      },railCharge);
      bot.weaponChargeSeconds=decision.heldSeconds;
      if(decision.releaseFraction===null)return;
      release=decision.releaseFraction;
    }else{
      bot.weaponChargeSeconds = Math.min(profile.chargeSeconds,bot.weaponChargeSeconds+dt);
      if (bot.weaponChargeSeconds + 1e-6 < profile.chargeSeconds) return;
    }

    if (this.queueCpuWeaponRequest(
      bot,target,release,'PROJECTILE',undefined,turfShot)) {
      if (turfShot) this.recordQaSourceTurfShot(bot);
      bot.fireRemaining = profile.fireIntervalSeconds;
    } else {
      bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
    }
    bot.weaponChargeSeconds = 0;
  }

  private updateCpuSplatling(
    bot: CpuBot,
    profile: ReturnType<typeof weaponProfile>,
    target: Vec3 | null,
    dt: number,
    turfShot: boolean
  ): void {
    if (bot.weaponBurstShotsRemaining > 0) {
      if (!target || !this.cpuTargetInRange(bot, target, profile)) {
        bot.weaponBurstShotsRemaining = 0;
        bot.weaponChargeSeconds = 0;
        return;
      }
      if (bot.weaponBurstCooldown > (profile.shooter ? 1e-8 : 0)) return;

      if (this.queueCpuWeaponRequest(
      bot,target,1,'PROJECTILE',undefined,turfShot)) {
        if (turfShot) this.recordQaSourceTurfShot(bot);
        bot.weaponBurstShotsRemaining -= 1;
        bot.weaponBurstCooldown = profile.burstIntervalSeconds;
      } else {
        bot.weaponBurstShotsRemaining = 0;
        bot.fireRemaining = GAME_CONFIG.inkEconomy.dryFireRetrySeconds;
      }
      return;
    }

    if (!target || !this.cpuTargetInRange(bot, target, profile)) {
      bot.weaponChargeSeconds = 0;
      return;
    }

    if (bot.fireRemaining > 0) return;

    const affordable=this.f4WholeNavigation
      ? (Number.isFinite(bot.ink)&&Number.isFinite(profile.inkCost)&&profile.inkCost>0
        ? Math.max(0,Math.floor((bot.ink+1e-6)/profile.inkCost)):0)
      : profile.burstMaxShots;
    if(this.f4WholeNavigation&&affordable<1){
      bot.weaponChargeSeconds=0;
      return; // Permit the ordinary low-ink recovery policy.
    }
    const fullBurst = this.f4WholeNavigation && !turfShot && affordable>=profile.burstMaxShots;
    const chargeGoal = fullBurst ? profile.chargeSeconds : profile.firstChargeSeconds;
    bot.weaponChargeSeconds = Math.min(chargeGoal, bot.weaponChargeSeconds + dt);
    if (bot.weaponChargeSeconds + 1e-6 < Math.max(profile.minChargeSeconds, chargeGoal)) {
      return;
    }

    const planned=fullBurst ? profile.burstMaxShots : Math.max(
      3,
      Math.round(profile.burstMaxShots * 0.5)
    );
    bot.weaponBurstShotsRemaining=this.f4WholeNavigation?Math.min(planned,affordable):planned;
    bot.weaponBurstCooldown = profile.shooter ? profile.burstIntervalSeconds : 0;
    bot.weaponChargeSeconds = 0;
    bot.fireRemaining = profile.fireIntervalSeconds;
  }

  /** Log actual weapon requests; caller has already selected paintable turf.
   * Counts are not enemy hits, scoreable paint, or confirmed ink coverage.
   */
  private recordQaSourceTurfShot(bot: CpuBot): void {
    this.qaTurfShotCooldown.set(bot.id, 0.85);
    this.qaTurfShotsByActor.set(
      bot.id, (this.qaTurfShotsByActor.get(bot.id) ?? 0) + 1
    );
    this.stats.cpuSourceTurfShots += 1;
  }

  /** F3 opted-in only: validate an existing native original-floor paint
   * target with the SAME source-foot and projectile-ray authority as B216.
   * This never creates a floor, shot, target or paint cell.
   * Disabled/default T20 behavior is unchanged. */
  private b216OriginalSourceTurfSightClear(bot:CpuBot,target:Vec3):boolean{
    // Whole F4 is no longer the frozen original-solid world. A legacy
    // opt-in validator may be absent; never interpret that as clear sight.
    if(this.f4WholeNavigation){
      const ray=this.f4ResearchCombatStageRay;
      const muzzle=bot.position.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
      const delta=target.clone().sub(muzzle),distance=delta.length();
      if(!ray||!Number.isFinite(distance)||distance<=.12)return false;
      return !ray(muzzle,muzzle.clone().add(delta.mulScalar((distance-.08)/distance)));
    }
    if(!this.b216SourceStageAimValidated)return true;
    const muzzle={x:bot.position.x,
      y:bot.position.y+GAME_CONFIG.cpu.muzzleHeightMeters,
      z:bot.position.z};
    this.b216OriginalTurfSightChecks++;
    if(this.b216SourceStageAimValidated(muzzle,target,bot.position))
      return true;
    this.b216OriginalTurfCoverVetoes++;
    if(this.b215SelectedBattlePaintPacing)
      this.b215ReadOnlyInkRow(bot.id).originalStageSightVetoes++;
    return false;
  }

  private chooseB64SourceLateralInkTarget(bot:CpuBot,dt:number):Vec3|null{
    if(!this.b64InkAngleSweepEnabled||!bot.agent||
       bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND')
      return null;
    const goal=this.qaMotionGoals.get(bot.id);
    if(!goal)return null;
    const cooldown=Math.max(0,
      (this.b64NoTargetCooldown.get(bot.id)??0)-dt);
    this.b64NoTargetCooldown.set(bot.id,cooldown);
    if(cooldown>0)return null;
    const candidates=originalGoalInkSweep(bot.position,goal);
    // B180 is a strict source-only opt-in. Rank ONLY truly unowned,
    // active original ownerGrid patch cells; do not alter physics or nav.
    // The entire original B64 first-valid sample is unchanged otherwise.
    let bestPatch:Vec3|null=null,bestOpportunity=0;
    let bestCenterAlreadyOwned=false;
    for(const candidate of candidates){
      this.samplePoint.set(candidate.x,candidate.y,candidate.z);
      this.b64Samples++;
      const sample=this.gameplayInk.sampleWorld(
        this.samplePoint,.28,SurfaceFlags.Paintable,SurfaceFlags.Wall);
      if(!sample||sample.surface.isScoreable)continue;
      // Real projectiles have a paint footprint, not a one-cell stamp.
      // The already-authorized B180 mode may target an OWN center only
      // where original ownerGrid neighbors provide a genuine opportunity.
      const opportunity=this.b180OriginalPatchAimEnabled?
        b180OriginalSourcePatchOpportunity(sample,bot.team):0;
      if(sample.owner===bot.team&&opportunity<=0)continue;
      if(this.b180OriginalPatchAimEnabled&&opportunity<=0)continue;
      if(sample.owner!==bot.team)this.b64CandidatesUnowned++;
      const currentProfile=weaponProfile(bot.weaponId, this.f4WholeNavigation);
      const ownedNeighbor=this.b180OriginalPatchAimEnabled&&
       sample.owner===bot.team?
       b180OriginalSourceUnownedNeighborAim(sample,bot.team,
        aim=>this.cpuTargetInRange(bot,aim,currentProfile)&&
         (currentProfile.weaponClass!=='BRUSH'||
          horizontalDistanceSq(bot.position,aim)<=2.45*2.45)&&
         this.b216OriginalSourceTurfSightClear(bot,aim)):null;
      // The actual 9-cell patch can contain unowned corners beyond
      // the weapon's real paint radius. Do not shoot at an OWN center.
      if(this.b180OriginalPatchAimEnabled&&sample.owner===bot.team&&
         !ownedNeighbor)continue;
      const sourcePoint=ownedNeighbor??
       sample.surface.localToWorld(sample.u,sample.v);
      // Reject out-of-range genuine paint before choosing it, not AFTER
      // the aim is selected: a nearer audited source pixel may still fire.
      if(!this.cpuTargetInRange(bot,sourcePoint,currentProfile)||
         (currentProfile.weaponClass==='BRUSH'&&
          horizontalDistanceSq(bot.position,sourcePoint)>2.45*2.45))
       continue;
      // B216's already registered native Rapier foot + fire-line veto
      // also applies to the existing frontal B64 source aim. Seek another
      // REAL candidate instead of spending ink into original cover.
      // A candidate selected by the optional predicate has already
      // passed the SAME genuine Rapier sight gate. Normal non-OWN
      // source paint continues to use the existing single ray check.
      if(!ownedNeighbor&&
         !this.b216OriginalSourceTurfSightClear(bot,sourcePoint))continue;
      if(!this.b180OriginalPatchAimEnabled){
        this.b64CandidatesChosen++;
        return sourcePoint;
      }
      if(opportunity>bestOpportunity){
        bestOpportunity=opportunity;
        bestPatch=sourcePoint;
        bestCenterAlreadyOwned=sample.owner===bot.team;
      }
    }
    if(this.b180OriginalPatchAimEnabled&&bestPatch){
      this.b180SelectedRealSourcePatches++;
      this.b180SelectedRealPatchOpportunity+=bestOpportunity;
      if(bestCenterAlreadyOwned)this.b180OwnedCenterSourcePatchAims++;
      this.b64CandidatesChosen++;
      return bestPatch;
    }
    // Avoid 60Hz × 7 × 12 empty ray probes near already-painted source.
    this.b64NoTargetCooldown.set(bot.id,.25);
    return null;
  }

  /** T21 F3 only. Derive the ink aim point from a source-verified paint grid
   * near the real physics foot and an audited native patrol goal. No new
   * geometry, nav links, enemy targets or scoreable turf is introduced. */
  /** Only after B64 + source-goal frontal pixels are exhausted. Never
   * relocate any CPU; all paint pixels, ground and sight are REAL source. */
  private chooseB216ActualOriginalPaintBackfill(
    bot:CpuBot,onlyPhysicalFootFacing=false,
    onlyDenseOriginalFoot=false
  ):Vec3|null{
    if(onlyDenseOriginalFoot&&
       (!onlyPhysicalFootFacing||!this.p2OuterOriginalBackfill))return null;
    if(!this.b216SourceStageAimValidated||!bot.agent||
       bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND')return null;
    // A real CPU whose last Crowd move-goal was rejected may still paint
    // genuine nearby ORIGINAL turf while standing on an ACTUAL supported
    // Rapier foot. Do not fabricate a navigation goal or resume movement.
    // Unknown/rejoin-lost/static-unsupported feet fail closed. The native
    // weapon facing (never a generated heading) orients these AIM proposals.
    let goal=onlyPhysicalFootFacing?
      undefined:this.qaMotionGoals.get(bot.id);
    if(!goal){
      const rejoined=this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)===true;
      // SourceFootSupport already uses the real ORIGINAL Rapier
      // 0.25m band. The previously duplicated 0.22m aim guard
      // rejected the documented stationary B1 foot despite valid
      // original support. Never widen the physical SOURCE authority.
      const support=rejoined?
        this.phase14qGroundCollision?.sourceFootSupport?.(bot.id,bot.position):null;
      if(!support||!support.solidId.startsWith('UndertowT21D:')||
         !Number.isFinite(support.point.y)||
         Math.abs(support.point.y-bot.position.y)>.25||
         !this.stage.solids.some(s=>s.id===support.solidId))return null;
      goal=bot.position; // ONLY ink direction; never a Crowd/nav request
    }
    // A real reached native goal has no forward displacement; use the
    // existing live CPU weapon facing only for SOURCE-verified ink search.
    const proposals=b216OriginalFootBackfillCandidates(
      bot.position,goal,bot.weaponFacing);
    if(proposals.length===0)return null;
    const muzzle={x:bot.position.x,
      y:bot.position.y+GAME_CONFIG.cpu.muzzleHeightMeters,z:bot.position.z};
    const profile=weaponProfile(bot.weaponId, this.f4WholeNavigation);
    // B180's first genuine unowned neighbor need not have a usable
    // source-stage firing line. Backfill is a bounded, weapon-ready fallback:
    // try other ACTIVE cells on the SAME original PaintSurface, not a new
    // projectile, floor, nav link or false HP contact. Reject each candidate
    // through the existing range + registered Rapier first-blocker checks.
    const visibleOwnNeighbor=(sample:GameplayInkSample,
      maxHeightDifference:number,vertical:boolean):Vec3|null=>
      b180OriginalSourceUnownedNeighborAim(sample,bot.team,aim=>{
       if(![aim.x,aim.y,aim.z].every(Number.isFinite)||
          Math.abs(aim.y-bot.position.y)>maxHeightDifference||
          !this.cpuTargetInRange(bot,aim,profile))return false;
       this.b216RealOriginalFloorSightChecks++;
       if(this.b216SourceStageAimValidated!(muzzle,aim,bot.position))
        return true;
       if(vertical)this.selectedSourceVerticalSightVetoes=
        (this.selectedSourceVerticalSightVetoes??0)+1;
       if(this.b215SelectedBattlePaintPacing)
        this.b215ReadOnlyInkRow(bot.id).backfillStageSightVetoes++;
       return false;
      });
    let best:Vec3|null=null,opportunity=0;
    let bestReachedGoalShortRadius=false;
    let bestCenterAlreadyOwned=false;
    let bestWasRegisteredDifferentHeight=false;
    // Only AFTER the pre-existing, locally validated 1.7–3.5m ink
    // search finds no target, inspect bounded 4.5–5.5m ORIGINAL floor
    // paint proposals. All the same native weapon range, ownerGrid,
    // physical foot, Rapier first-blocker and 0-Scoreable checks apply.
    for(const pass of (onlyDenseOriginalFoot?[2]:[0,1])){
     if(pass===1&&(!this.p2OuterOriginalBackfill||best))break;
     const current=pass===0?proposals:
      b216OriginalFootBackfillCandidates(
       bot.position,goal,bot.weaponFacing,
       pass===2?'DENSE_ORIGINAL_ONLY':'DISTANT_ORIGINAL_ONLY');
     if(pass===1)this.p2OuterOriginalSearches++;
     for(const proposed of current){
      this.samplePoint.set(proposed.x,proposed.y,proposed.z);
      const sample=this.gameplayInk.sampleWorld(this.samplePoint,
       .28,SurfaceFlags.Paintable,SurfaceFlags.Wall);
      if(!sample||sample.surface.isScoreable)continue;
      // Compare actual ownerGrid opportunity before querying up to eight
      // costly native Rapier shot rays from the same SOURCE patch.
      const value=b180OriginalSourcePatchOpportunity(sample,bot.team);
      if(value<=opportunity)continue;
      const ownedNeighbor=sample.owner===bot.team?
       visibleOwnNeighbor(sample,.35,false):null;
      if(sample.owner===bot.team&&!ownedNeighbor)continue;
      const candidate=ownedNeighbor??
       sample.surface.localToWorld(sample.u,sample.v);
      if(![candidate.x,candidate.y,candidate.z].every(Number.isFinite)||
         Math.abs(candidate.y-bot.position.y)>.35||
         !this.cpuTargetInRange(
           bot,candidate,weaponProfile(bot.weaponId, this.f4WholeNavigation)))continue;
      // OWN neighbors have already passed the exact live Rapier shot ray
      // in visibleOwnNeighbor. An unowned center still gets its old ray.
      if(!ownedNeighbor){
       this.b216RealOriginalFloorSightChecks++;
       if(!this.b216SourceStageAimValidated(muzzle,candidate,
          bot.position)){
        if(this.b215SelectedBattlePaintPacing)
          this.b215ReadOnlyInkRow(bot.id).backfillStageSightVetoes++;
        continue;
       }
      }
      best=candidate;opportunity=value;
      bestReachedGoalShortRadius=proposed.radiusMeters===1.7;
      bestCenterAlreadyOwned=sample.owner===bot.team;
     }
     // After the SAME-height 128 dense proposals have failed, inspect
     // only ACTUAL existing SOURCE floor planes within a 2m vertical step.
     // B207 180s RAW: B1 moved 286m late but had 4,022 no-aim checks.
     // No nav, Actor movement, shot/ink injection or score granted.
     if(pass===2&&!best){
      this.selectedSourceVerticalAimSearches=
       (this.selectedSourceVerticalAimSearches??0)+1;
      const registeredFloors=this.gameplayInk.getSurfaces();
      for(const proposed of current){
       for(const floor of registeredFloors){
        const vertical=b216OriginalRegisteredVerticalFloorAim(
         floor,{x:proposed.x,y:bot.position.y,z:proposed.z});
        if(!vertical)continue;
        const sample=this.gameplayInk.sampleWorld(
         new Vec3(vertical.x,vertical.y,vertical.z),.28,
         SurfaceFlags.Paintable,SurfaceFlags.Wall,s=>s===floor);
        if(!sample||sample.surface.isScoreable)continue;
        this.selectedSourceVerticalCandidateMatches=
         (this.selectedSourceVerticalCandidateMatches??0)+1;
        const value=b180OriginalSourcePatchOpportunity(sample,bot.team);
        if(value<=opportunity)continue;
        const neighbor=sample.owner===bot.team?
         visibleOwnNeighbor(sample,2,true):null;
        if(sample.owner===bot.team&&!neighbor)continue;
        const candidate=neighbor??floor.localToWorld(sample.u,sample.v);
        if(![candidate.x,candidate.y,candidate.z]
             .every(Number.isFinite)||
           Math.abs(candidate.y-bot.position.y)>2||
           !this.cpuTargetInRange(bot,candidate,
             weaponProfile(bot.weaponId, this.f4WholeNavigation)))continue;
        if(!neighbor){
         this.b216RealOriginalFloorSightChecks++;
         if(!this.b216SourceStageAimValidated(muzzle,candidate,bot.position)){
          this.selectedSourceVerticalSightVetoes=
           (this.selectedSourceVerticalSightVetoes??0)+1;
          if(this.b215SelectedBattlePaintPacing)
           this.b215ReadOnlyInkRow(bot.id).backfillStageSightVetoes++;
          continue;
         }
        }
        best=candidate;opportunity=value;
        bestWasRegisteredDifferentHeight=true;
        bestReachedGoalShortRadius=proposed.radiusMeters===1.7;
        bestCenterAlreadyOwned=sample.owner===bot.team;
       }
      }
     }
     if(pass===1&&best)this.p2OuterOriginalApprovedAims++;
     if(pass===2&&best){
      this.selectedSourceDenseApprovedAims++;
      if(bestWasRegisteredDifferentHeight){
       this.selectedSourceVerticalApprovedAims=
        (this.selectedSourceVerticalApprovedAims??0)+1;
       this.selectedSourceVerticalApprovedByActor?.set(bot.id,
        (this.selectedSourceVerticalApprovedByActor.get(bot.id)??0)+1);
      }
     }
     if(best)break;
    }
    if(best){
      this.b216ApprovedPhysicalSourceAimTargets++;
      // This is an audited AIM, not yet a projectile or changed ink cell.
      if(bestReachedGoalShortRadius)
        this.b216ApprovedReachedGoalShortRadiusAims++;
      if(bestCenterAlreadyOwned)this.b216OwnedCenterSourceBackfillAims++;
    }
    // The prior original patrol heading may still produce a REAL paid
    // paint shot even when Rapier has vetoed walking toward it (B4 W9).
    // Preserve that successful aim FIRST. If no independently verified
    // unowned target exists along it, search only the CPU's actual
    // supported ORIGINAL foot using its real weapon-facing direction.
    // This is a second ink-only attempt; it cannot authorize Crowd motion,
    // change a physical position, fire without cost, or enable score.
    if(!best&&!onlyPhysicalFootFacing&&
       this.qaMotionGoals.has(bot.id))
      return this.chooseB216ActualOriginalPaintBackfill(bot,true);
    return best;
  }

  /** Last P2 drought fallback: exact already-registered source cells,
   * never a new floor, goal or shot. A real LIVE Rapier-supported CPU foot
   * and the existing full native projectile ray must both validate.
   * The 120 misses / every 30 weapon-ready attempts gate lives in
   * updateCpuWeapon; no extra scan on the regular 60Hz hot path. */
  private chooseB216OriginalUnpaintedGridAim(bot:CpuBot):Vec3|null{
    if(!this.p2OuterOriginalBackfill||
       !this.b216SourceStageAimValidated||
       bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||
       !bot.agent||
       this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)!==true)
      return null;
    const support=this.phase14qGroundCollision?.sourceFootSupport?.(
      bot.id,bot.position);
    if(!support||!this.stage.solids.some(s=>s.id===support.solidId)||
       Math.abs(support.point.y-bot.position.y)>.25)
      return null;
    const profile=weaponProfile(bot.weaponId, this.f4WholeNavigation);
    const possible=b216OriginalUnpaintedGridCandidates(
      this.gameplayInk.getSurfaces(),bot.position,bot.team,
      cpuWeaponRangeMeters(profile));
    for(const candidate of possible){
      if(this.cpuTargetInRange(bot,candidate,profile)&&
         this.b216OriginalSourceTurfSightClear(bot,candidate))
       return candidate;
    }
    return null;
  }

  /** Bounded estimate over current backed ownership; this never paints. */
  private f4TurfValue(sample:GameplayInkSample,team:Team.A|Team.B,radius:number):number{
    const surface=sample.surface;
    const stride=Math.max(1,Math.min(8,Math.round(radius*.65/surface.cellSize)));
    const cx=Math.min(surface.widthCells-1,Math.floor(sample.u/surface.cellSize));
    const cy=Math.min(surface.heightCells-1,Math.floor(sample.v/surface.cellSize));
    let value=0,seen=0;
    for(const [dx,dy] of [[0,0],[stride,0],[-stride,0],[0,stride],[0,-stride]]){
      const x=cx+dx!,y=cy+dy!;
      if(x<0||y<0||x>=surface.widthCells||y>=surface.heightCells)continue;
      const u=Math.min(surface.widthMeters-1e-6,(x+.5)*surface.cellSize);
      const v=Math.min(surface.heightMeters-1e-6,(y+.5)*surface.cellSize);
      if(!this.gameplayInk.isCellPhysicallyBackedAt(surface,u,v))continue;
      const owner=surface.ownerGrid[surface.index(x,y)];
      seen++;
      if(owner===Team.Neutral)value+=1;
      else if(owner!==team&&(owner===Team.A||owner===Team.B))value+=2;
    }
    return seen?value/5:0;
  }
  private chooseF4NearbyTurfTarget(bot:CpuBot,profile:ReturnType<typeof weaponProfile>):Vec3|null{
    if(!this.f4WholeNavigation||!this.f4ResearchCombatStageRay||bot.f4RecoveringInk||
       bot.lifeState!=='ACTIVE'||bot.hp<=0||bot.mobilityState!=='GROUND'||!bot.agent||
       !this.f3dSourceGoals?.isLiveRejoinedSourceCpu?.(bot.id)||bot.fireRemaining>0)return null;
    const tick=this.b181NativeFrame,miss=this.f4FloorAimMissTick.get(bot.id);
    if(miss!==undefined&&tick>=miss&&tick-miss<12)return null;
    const support=this.phase14qGroundCollision?.sourceFootSupport?.(bot.id,bot.position);
    if(!support||Math.abs(support.point.y-bot.position.y)>.25)return null;
    const range=cpuWeaponRangeMeters(profile);
    const reach=Math.min(5.5,range*.75,profile.weaponClass==='BRUSH'?2.2:Infinity);
    if(!Number.isFinite(reach)||reach<.8)return null;
    const phase=(Math.floor(tick/30)+bot.id.charCodeAt(bot.id.length-1))%8;
    const points:{target:Vec3;score:number}[]=[],seen=new Set<string>();
    for(const radius of [Math.min(1.7,reach),reach])for(let i=0;i<8;i++){
      const angle=(i+phase/8)*Math.PI/4;
      const probe=new Vec3(support.point.x+radius*Math.cos(angle),
        support.point.y,support.point.z+radius*Math.sin(angle));
      const sample=this.gameplayInk.sampleWorld(probe,.35,SurfaceFlags.Paintable,SurfaceFlags.Wall);
      if(!sample||sample.surface.isScoreable||sample.owner===bot.team)continue;
      const target=sample.surface.localToWorld(sample.u,sample.v);
      if(!this.cpuTargetInRange(bot,target,profile)||Math.abs(target.y-support.point.y)>.55)continue;
      if(this.f4PlayableTactics){
        const s=sample.surface,key=s.id+':'+Math.floor(sample.u/s.cellSize)+':'+Math.floor(sample.v/s.cellSize);
        if(seen.has(key))continue;
        seen.add(key);
        const value=this.f4TurfValue(sample,bot.team,Math.max(.35,profile.paintRadiusMeters));
        if(value<=0)continue;
        points.push({target,score:value*3+(sample.owner===Team.Neutral?1:2)-radius*.08});
      }else points.push({target,score:(sample.owner===Team.Neutral?2:1)+radius*.12});
    }
    points.sort((x,y)=>y.score-x.score);
    for(const {target} of points.slice(0,6)){
      if(this.b216OriginalSourceTurfSightClear(bot,target)){
        this.f4FloorAimMissTick.delete(bot.id);return target;
    }
    }
    this.f4FloorAimMissTick.set(bot.id,tick);
    return null;
  }

  private chooseOriginalSourceTurfTarget(bot: CpuBot): Vec3 | null {
    if (!bot.agent || bot.lifeState !== 'ACTIVE' ||
        bot.mobilityState !== 'GROUND') return null;
    const goal = this.qaMotionGoals.get(bot.id);
    if (!goal) return null;
    const dx = goal.x - bot.position.x;
    const dz = goal.z - bot.position.z;
    const span = Math.hypot(dx, dz);
    if (!Number.isFinite(span) || span < 1.65) return null;
    // BRUSH can only paint with a physical 2.45m swipe: seeking the
    // ordinary 3m original floor first selected an aim it could not fire.
    // Keep all original owner-grid, range and stage-ray checks below.
    const sourceDistances=weaponProfile(bot.weaponId, this.f4WholeNavigation).weaponClass==='BRUSH'
      ?[1.7]:[3.0,2.3,1.7];
    for (const distance of sourceDistances) {
      if (span < distance + 0.25) continue;
      const t = distance / span;
      this.samplePoint.set(
        bot.position.x + dx * t,
        bot.position.y + (goal.y - bot.position.y) * t + 0.10,
        bot.position.z + dz * t
      );
      const sample = this.gameplayInk.sampleWorld(
        this.samplePoint, 0.28, SurfaceFlags.Paintable, SurfaceFlags.Wall
      );
      if (!sample || sample.owner === bot.team ||
          sample.surface.isScoreable) continue;
      const target=sample.surface.localToWorld(sample.u, sample.v);
      // The existing real main-weapon range gate used at FIRE time must
      // also apply while seeking: continue to a nearer real floor patch.
      if(!this.cpuTargetInRange(
        bot,target,weaponProfile(bot.weaponId, this.f4WholeNavigation)))continue;
      if(!this.b216OriginalSourceTurfSightClear(bot,target))continue;
      return target;
    }
    return null;
  }

  private queueCpuWeaponRequest(
    bot: CpuBot,
    target: Vec3,
    charge: number,
    action: CpuWeaponAction = 'PROJECTILE',
    qaSourceAim?: 'A1_ORIGINAL_ALLY_SUPPORT_INK',
    sourceFloorPaint=false
  ): boolean {
    const profile = weaponProfile(bot.weaponId, this.f4WholeNavigation);
    const inkCost = cpuWeaponInkCost(profile, action, charge);
    if(this.f4WholeNavigation&&(!Number.isFinite(bot.ink)||!Number.isFinite(inkCost)||
       inkCost<=0||!Number.isFinite(charge)||charge<0||charge>1||
       ![target.x,target.y,target.z].every(Number.isFinite)))return false;
    if (bot.ink + 1e-6 < inkCost) {
      // A validated aim is NOT a paid projectile. Count an actual main
      // weapon resource denial in the selected SOURCE battle only.
      if(this.b215SelectedBattlePaintPacing&&sourceFloorPaint)
        this.b215ReadOnlyInkRow(bot.id).insufficientInkMainShotAttempts++;
      return false;
    }

    const oldRecoveryLock=bot.inkRecoveryLockSeconds;
    const oldFireRemaining=bot.fireRemaining;
    const oldCharge=bot.weaponChargeSeconds;
    const oldBurstShots=bot.weaponBurstShotsRemaining;
    const oldBurstCooldown=bot.weaponBurstCooldown;
    const recovery =
      profile.shooter?.recoveryLockSeconds ?? profile.blaster?.recoveryLockSeconds ??
      profile.contactWeapon?.swingRecovery ?? profile.slosher?.recoveryLockSeconds ??
      profile.canopy?.recoveryLockSeconds ??
      (this.f4WholeNavigation && action === 'SPLATANA_RELEASE' ? F4_SABER_TIMING.recovery :
        GAME_CONFIG.inkEconomy.recoveryLockSeconds);
    const nextLock=this.f4WholeNavigation?mergedRecovery(oldRecoveryLock,recovery):recovery;
    if(nextLock===null)return false;
    bot.ink = Math.max(0, bot.ink - inkCost);
    bot.inkRecoveryLockSeconds = nextLock;

    const origin = new Vec3(
      bot.position.x,
      bot.position.y + GAME_CONFIG.cpu.muzzleHeightMeters,
      bot.position.z
    );

    this.pendingShots.push({
      sourceId: bot.id,
      team: bot.team,
      origin,
      bodyPosition: bot.position.clone(),
      target: target.clone(),
      f4Opponent: sourceFloorPaint ? undefined : this.f4LeadTargets?.get(target),
      f4SourceLifeSerial: this.f4WholeNavigation ? bot.f4LifeSerial : undefined,
      weaponId: bot.weaponId,
      charge,
      action,
      qaSourceAim,
      sourceFloorPaint:sourceFloorPaint&&this.f3dSourceGoals&&
        this.phase14qF2RecoverableSteps?true:undefined,
      sourceInkTransaction:this.f3dSourceGoals&&
        this.phase14qF2RecoverableSteps?{
          chargedInkCost:inkCost,expectedInkAfterCharge:bot.ink,
          originalRecoveryLockSeconds:oldRecoveryLock,
          originalFireRemainingSeconds:oldFireRemaining,
          originalWeaponChargeSeconds:oldCharge,
          originalBurstShotsRemaining:oldBurstShots,
          originalBurstCooldownSeconds:oldBurstCooldown,
          originalTurfShotCooldownSeconds:sourceFloorPaint?
            this.qaTurfShotCooldown.get(bot.id)??0:undefined
        }:undefined
    });
    this.stats.cpuShots += 1;
    return true;
  }

  // F4 combat only: same physical muzzle and 3D envelope as live sight.
  // Preserve historical horizontal floor-paint and T20 range checks.
  private f4CombatMuzzleDistance(bot:CpuBot,target:Vec3):number {
    return Math.hypot(target.x-bot.position.x,
      target.y-bot.position.y-GAME_CONFIG.cpu.muzzleHeightMeters,
      target.z-bot.position.z);
  }

  private cpuTargetInRange(
    bot: CpuBot,
    target: Vec3,
    profile: ReturnType<typeof weaponProfile>
  ): boolean {
    const range = cpuWeaponRangeMeters(profile);
    return horizontalDistanceSq(bot.position, target) <= range * range;
  }

  public enableF4FlightLead(): void {
    this.f4LeadEnabled = true;
  }

  public clearF4LeadHistory(): void {
    this.f4LeadHistory?.clear();
  }

  public f4FlightLeadCount(): number {
    return this.f4LeadAccepted;
  }

  private sampleF4LeadBody(id: string, position: Vec3 | null, mode: string,predictable=true): void {
    if (!position) {
      this.f4LeadHistory.delete(id);
      return;
    }
    const old = this.f4LeadHistory.get(id);
    const sameTrack=old&&old.mode===mode&&this.b181NativeFrame-old.tick===1;
    const consecutive = predictable&&sameTrack&&
      Math.hypot(position.x-old.current.x,position.z-old.current.z) <= .20 &&
      Math.abs(position.y-old.current.y) <= .12;
    // Motion discontinuity disables extrapolation, not a valid current
    // physical target. Death/respawn clears the track independently.
    this.f4LeadHistory.set(id,{current:position.clone(),previous:consecutive ? old.current : null,
      tick:this.b181NativeFrame,mode,life:sameTrack ? old.life : Symbol(id)});
  }

  public aimF4ShotAtLaunch(request: CpuFireRequest, origin: Vec3, range: number,
    solveFlightTicks: (point: Vec3) => number | null): Vec3 | null {
    const ray = this.f4ResearchCombatStageRay;
    const opponent = request.f4Opponent;
    if (!this.f4LeadEnabled || !ray || !opponent || request.sourceFloorPaint) return request.target;
    const sample = this.f4LeadHistory.get(opponent.id);
    const enemy = opponent.id === 'HUMAN' ? null : this.bots.find(bot=>bot.id===opponent.id);
    if (!sample || opponent.life===null || sample.life !== opponent.life || sample.tick !== this.b181NativeFrame ||
        (opponent.id !== 'HUMAN' && (!enemy || enemy.hp <= 0 || enemy.lifeState !== 'ACTIVE'))){
      this.f4AimEvidence.staleTargetRejected++;return null;
    }
    const offset = new Vec3(0,opponent.offsetY,0);
    const actual = sample.current.clone().add(offset);
    const clear = (from: Vec3, to: Vec3) => !ray(from,to);
    if(!Number.isFinite(range)||range<=0||![actual.x,actual.y,actual.z,origin.x,origin.y,origin.z].every(Number.isFinite)||
       Math.hypot(actual.x-origin.x,actual.y-origin.y,actual.z-origin.z)>range){this.f4AimEvidence.outOfRange++;return null;}
    if(!clear(origin,actual)){this.f4AimEvidence.covered++;return null;}
    const predicted = sample.previous && predictF4Lead(origin,actual,sample.previous.clone().add(offset),
      1,range,solveFlightTicks,clear);
    if (predicted){this.f4LeadAccepted++;this.f4AimEvidence.predictedTarget++;}
    else this.f4AimEvidence.currentTarget++;
    return predicted ?? actual;
  }

  /** Aim adjustment: original Rapier blocker rechecked BEFORE shot. All
   * projectile damage/hits remain in unchanged ProjectileSystem. */
  private b212AimAtMovingNativeActor(
    bot:CpuBot,id:string|null,actual:B181SightPoint,dt:number
  ):Vec3{
    const fixed=new Vec3(actual.x,actual.y,actual.z);
    if (this.f4WholeNavigation && this.f4LeadEnabled) {
      if (id) {
        const sample = this.f4LeadHistory.get(id);
        const body = id === 'HUMAN' ? this.b212PreviousHuman : this.bots.find(e=>e.id===id)?.position;
        // A newly visible actor without a native track must not silently bypass
        // launch validation. Null life is rejected and the paid request refunded.
        if (body) this.f4LeadTargets.set(fixed, {id,offsetY:fixed.y-body.y,life:sample?.life??null});
      }
      return fixed;
    }
    const ray=this.f4WholeNavigation?this.f4ResearchCombatStageRay:
      this.b212NativeLeadEnabled?this.b181OriginalCombatStageRay:null;
    if(!ray||!id)return fixed;
    const weapon=weaponProfile(bot.weaponId, this.f4WholeNavigation);
    if(['CHARGER','ROLLER','BRUSH','SPLATANA'].includes(weapon.weaponClass))
      return fixed;
    const enemy=id==='HUMAN'?null:this.bots.find(b=>b.id===id);
    const now=enemy?.position??this.b212PreviousHuman;
    const prior=enemy?.previousPosition??this.b212PriorHuman;
    if(!now||!prior||enemy&&
       (enemy.lifeState!=='ACTIVE'||enemy.mobilityState!=='GROUND'))
      return fixed;
    const origin={x:bot.position.x,
        y:bot.position.y+GAME_CONFIG.cpu.muzzleHeightMeters,
        z:bot.position.z};
    const candidate=b212NativeLead({
      muzzle:origin,actualBody:actual,
      currentFoot:now,previousFoot:prior,dt,
      projectileSpeed:weapon.speedMetersPerSecond
    });
    if(!candidate)return fixed;
    this.b212NativeLeadCandidates++;
    const predicted=candidate.aim;
    if(!this.cpuTargetInRange(bot,new Vec3(
      predicted.x,predicted.y,predicted.z),weapon))return fixed;
    if(ray(origin,predicted)){
      this.b212OriginalCoverRejects++;return fixed;
    }
    this.b212NativeAimAccepted++;
    return new Vec3(predicted.x,predicted.y,predicted.z);
  }
  /** Both native CPU sight paths (registered Rapier or fixed legacy aim)
   * must agree about an actual SOURCE opponent's CURRENT life and real
   * physical return. No extra shots, actor, floor or stage permission. */
  private liveSourceCombatOpponent(enemy:CpuBot):boolean{
    if(!this.f3dSourceGoals)return true; // frozen T20 behavior
    return Number.isFinite(enemy.hp)&&enemy.hp>0&&
      ((this.f4WholeNavigation&&((enemy.mobilityState==='F4_ZIP'&&this.f4ZipRuns.get(enemy.id)?.motion.lifeId===String(enemy.f4LifeSerial))||(enemy.mobilityState==='FIRST_DROP_FALL'&&this.f4ZipRecovery.has(enemy.id))))||
       (enemy.mobilityState==='GROUND'&&(!this.f3dSourceGoals.isLiveRejoinedSourceCpu||
        this.f3dSourceGoals.isLiveRejoinedSourceCpu(enemy.id))));
  }
  private chooseCombatTarget(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean,
    dt:number,
    nativeMainWeaponOnly=false,
    f4SightLimit?:number
  ): Vec3 | null {
    // Registered original-stage visibility from actual live actor bodies.
    // Use the SAME native muzzle (not a higher optical proxy) as the actual
    // CPU projectile origin. Original Rapier cover still owns every ray.
    // F4 uses its own live 51-solid ray, never the ORIGINAL 25-solid
    // B181 authorization. Both modes select ACTUAL living hit volumes;
    // neither line-of-sight check creates a projectile, hit or movement.
    const combatRay=this.b181OriginalCombatStageRay??
      this.f4ResearchCombatStageRay;
    if(combatRay){
      // In SQUID mode the same real Rapier body is lowered into a .34m
      // sphere; the HUMAN torso center was NOT an actual squid hit.
      // Aim only at the current native physical capsule/sphere interior.
      const squid=this.b181NativeHumanColliderMode==='SQUID';
      const humanHitY=humanPosition.y+
        (squid?PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters:0);
      const humanHitHalfSample=squid?
        Math.min(.2,PLAYER_CHARACTER_PHYSICS.squidRadiusMeters*.6):.25;
      const candidates=[
        ...(humanActive&&humanTeam!==bot.team?
          [{id:'HUMAN',body:{x:humanPosition.x,
            y:humanHitY,z:humanPosition.z},
            // Both SOURCE hit samples stay INSIDE the actual Rapier
            // collider (a HUMAN capsule or lowered SQUID sphere).
            alternateHitPoints:[
              {x:humanPosition.x,y:humanHitY+humanHitHalfSample,z:humanPosition.z},
              {x:humanPosition.x,y:humanHitY-humanHitHalfSample,z:humanPosition.z}
            ]}]:[]),
        ...this.bots.filter(enemy=>
          enemy.id!==bot.id&&enemy.team!==bot.team&&
          enemy.lifeState==='ACTIVE'&&
          this.liveSourceCombatOpponent(enemy))
          .map(enemy=>({id:enemy.id,body:{x:enemy.position.x,
            y:enemy.position.y+.68,z:enemy.position.z},
            // Actual native CPU hit spheres already used by projectile
            // collision: test exposed upper/lower centers only if the
            // ordinary central line is blocked by original Rapier cover.
            alternateHitPoints:[
              {x:enemy.position.x,
                y:enemy.position.y+GAME_CONFIG.cpu.hitSphereOffsetsMeters[2],
                z:enemy.position.z},
              {x:enemy.position.x,
                y:enemy.position.y+GAME_CONFIG.cpu.hitSphereOffsetsMeters[0],
                z:enemy.position.z}
            ]}))
      ];
      const origin={x:bot.position.x,
        y:bot.position.y+GAME_CONFIG.cpu.muzzleHeightMeters,
        z:bot.position.z};
      // B383: the main weapon must not lock on a visible enemy it
      // cannot actually fire at. Kit targeting remains independent:
      // specials/subs retain their previous B181 visibility semantics.
      const maxMainRange=nativeMainWeaponOnly?
        cpuWeaponRangeMeters(weaponProfile(bot.weaponId, this.f4WholeNavigation)):
        this.f4WholeNavigation&&f4SightLimit!==undefined&&Number.isFinite(f4SightLimit)&&f4SightLimit>0?
          Math.min(32,f4SightLimit):32;
      const hitAttacker=b213RealAttackerPreference({
        enabled:this.b213SourceCounterfireEnabled,
        tick:this.b181NativeFrame,hitTick:bot.b213ActualHitTick,
        attacker:bot.b213ActualAttackerId,
        actualLivingEnemyIds:candidates.map(x=>x.id)
      });
      // An actual nearby HUMAN on the registered B-side SOURCE floor
      // becomes a priority for real defenders. The current weapon range,
      // original Rapier line of sight and actual actor lifecycle still
      // authorize every aim. No cross-map pursuit or synthetic hit.
      const nearRealHuman=humanActive&&humanTeam!==bot.team&&
        bot.team===Team.B&&this.f3dSourceGoals!==null&&
        this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
        // The F4 lab's genuine central crossover has opponents at
        // Z near zero. Keep B207's original same-side constraint
        // byte-for-byte, but let B defenders react to a physically nearby
        // human on the separate F4 51-solid research collision stage.
        // Native range, live HP, height and Rapier cover still own the aim.
        (isT21F4ResearchStage(this.stage)||
         (bot.position.z<=-33&&humanPosition.z<=-33))&&
        [humanPosition.x,humanPosition.y,humanPosition.z,
         bot.position.x,bot.position.y,bot.position.z].every(Number.isFinite)&&
        Math.abs(humanPosition.y-bot.position.y)<=2.4&&
        horizontalDistanceSq(bot.position,humanPosition)<=36;
      const preferred=hitAttacker??
        (nearRealHuman||bot.role==='SKIRMISHER'?'HUMAN':null);
      const preferredRange=this.f4WholeNavigation&&hitAttacker?maxMainRange:12;
      const preferredVisibleEnemy=this.f4WholeNavigation?
        reachablePreference(origin,candidates,preferred,Math.min(maxMainRange,preferredRange)):preferred;
      // Keep each real sight envelope independent. Natural special sight
      // must not inherit or overwrite the generic long-range sub/kit lock.
      const cacheKey=this.f4WholeNavigation?bot.id+(nativeMainWeaponOnly?':main':f4SightLimit!==undefined?':special':':kit'):bot.id;
      const old=this.b181CachedCombat.get(cacheKey);
      if(old&&this.b181NativeFrame-old.frame<8&&
         (!preferredVisibleEnemy||old.actorId===preferredVisibleEnemy)){
        if(old.actorId!==null){
          // Current candidates require real living grounded native actors.
          const fresh=this.f4WholeNavigation?
            reuseF4PhysicalSight(old,this.b181NativeFrame,origin,candidates,maxMainRange):
            b182ReuseNativeSight(old,this.b181NativeFrame,origin,candidates,maxMainRange);
          if(fresh){
            // The actor and muzzle can each move less than B182's cache
            // tolerance while a THIN original collider comes between them.
            // Recheck registered Rapier cover BEFORE authorizing a real CPU
            // shot; never treat a cached optical line as current sight.
            this.b181ActualStageRays++;
            if(!combatRay(origin,fresh)){
              this.b182ReusedLiveNativeSight++;
              return this.b212AimAtMovingNativeActor(bot,old.actorId,fresh,dt);
            }
            // A newly covered target must be selected again from current
            // physical actors, not fired at or promoted to a phantom hit.
            this.b181ActualSourceOcclusions++;
            this.b181CachedCombat.delete(cacheKey);
          }
          this.b182RecheckedStaleNativeSight++;
        }else if(candidates.length===0){
          return null;
        }
      }
      const result=this.f4WholeNavigation?
        chooseF4PhysicalSight(origin,candidates,combatRay,preferredVisibleEnemy,
          maxMainRange,hitAttacker?maxMainRange:12):
        chooseB181OriginalSourceSight(origin,candidates,combatRay,
          preferredVisibleEnemy,maxMainRange);
      this.b181ActualStageRays+=result.rays;
      this.b181ActualSourceOcclusions+=result.coverRejects;
      if(result.target)this.b181VisibleSelections++;
      if(hitAttacker&&result.actorId===hitAttacker)
        this.b213VisibleRetaliationSelections++;
      const aim=result.target?new Vec3(
        result.target.x,result.target.y,result.target.z):null;
      this.b181CachedCombat.set(cacheKey,{
        frame:this.b181NativeFrame,actorId:result.actorId,origin,
        target:result.target
      });
      return aim?this.b212AimAtMovingNativeActor(bot,result.actorId,
        {x:aim.x,y:aim.y,z:aim.z},dt):null;
    }
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    let found = false;

    if (humanActive && humanTeam !== bot.team) {
      const distanceSq = horizontalDistanceSq(bot.position, humanPosition);
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        this.targetPoint.copy(humanPosition);
        found = true;
      }
    }

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team === bot.team ||
        candidate.lifeState !== 'ACTIVE' ||
        isCpuJumpAirborne(candidate) ||
        // The fixed-aim SOURCE path is still used by existing practice
        // choices that do not opt into B181 source-stage sight.
        // Do not resurrect an earlier life's body as a combat target.
        !this.liveSourceCombatOpponent(candidate)
      ) {
        continue;
      }
      const distanceSq = horizontalDistanceSq(bot.position, candidate.position);
      if (distanceSq >= bestDistanceSq) continue;
      bestDistanceSq = distanceSq;
      this.targetPoint.copy(candidate.position);
      this.targetPoint.y += 0.68;
      found = true;
    }

    if (!found) return null;

    if (bot.role === 'SKIRMISHER' && humanActive && humanTeam !== bot.team) {
      const humanDistanceSq = horizontalDistanceSq(bot.position, humanPosition);
      if (humanDistanceSq <= GAME_CONFIG.cpu.combatRangeMeters ** 2) {
        this.targetPoint.copy(humanPosition);
      }
    }

    return this.targetPoint;
  }

  private tryStartTacticalJump(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean,
    forced: boolean
  ): boolean {
    if (
      bot.lifeState !== 'ACTIVE' ||
      bot.mobilityState !== 'GROUND' ||
      !bot.agent ||
      bot.jumpCooldownSeconds > 0 ||
      bot.hp < GAME_CONFIG.combat.playerMaxHp * GAME_CONFIG.cpu.superJumpMinHpFraction
    ) {
      return false;
    }

    const respawnRecovery = bot.jumpRespawnWindowSeconds > 0;
    const nearestFriendlyDistance = this.nearestFriendlyDistance(
      bot,
      humanTeam,
      humanPosition,
      humanActive
    );

    let best: CpuJumpCandidate | null = null;

    const consider = (
      id: string,
      position: Vec3,
      isHuman: boolean
    ): void => {
      const snapped = this.navigation.closestPoint(position);
      const target = new Vec3(snapped.x, snapped.y, snapped.z);
      const targetSafe = this.isJumpTargetSafe(
        bot.team,
        target,
        humanTeam,
        humanPosition,
        humanActive
      );
      const score = this.director.scoreSuperJumpCandidate({
        team: bot.team,
        role: bot.role,
        currentPosition: bot.position,
        targetPosition: target,
        respawnRecovery,
        nearestFriendlyDistanceMeters: nearestFriendlyDistance,
        targetSafe,
        targetIsHuman: isHuman
      });

      if (!Number.isFinite(score)) return;
      if (
        !forced &&
        score < GAME_CONFIG.cpu.superJumpDecisionScore
      ) {
        return;
      }

      if (!best || score > best.score) {
        best = { id, position: target, isHuman, score };
      }
    };

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team !== bot.team ||
        candidate.lifeState !== 'ACTIVE' ||
        candidate.mobilityState !== 'GROUND'
      ) {
        continue;
      }
      consider(candidate.id, candidate.position, false);
    }

    if (humanActive && humanTeam === bot.team) {
      consider('HUMAN', humanPosition, true);
    }

    if (!best) {
      if (!forced) return false;

      // QA fallback: use a tactical node well ahead of the CPU when no safe
      // friendly candidate satisfies normal scoring.
      const enemySpawn = bot.team === Team.A
        ? this.stage.metadata.teamBSpawn
        : this.stage.metadata.teamASpawn;
      const fallback = new Vec3(0, enemySpawn[1], enemySpawn[2] * 0.35);
      const snapped = this.navigation.closestPoint(fallback);
      best = {
        id: 'QA_FRONT',
        position: new Vec3(snapped.x, snapped.y, snapped.z),
        isHuman: false,
        score: 999
      };
    }

    this.startCpuJumpPrep(bot, best);
    return true;
  }

  private nearestFriendlyDistance(
    bot: CpuBot,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): number {
    let best = Number.POSITIVE_INFINITY;

    for (const candidate of this.bots) {
      if (
        candidate.id === bot.id ||
        candidate.team !== bot.team ||
        candidate.lifeState !== 'ACTIVE' ||
        candidate.mobilityState !== 'GROUND'
      ) {
        continue;
      }
      best = Math.min(best, Math.sqrt(horizontalDistanceSq(bot.position, candidate.position)));
    }

    if (humanActive && humanTeam === bot.team) {
      best = Math.min(best, Math.sqrt(horizontalDistanceSq(bot.position, humanPosition)));
    }

    return Number.isFinite(best) ? best : 999;
  }

  private isJumpTargetSafe(
    team: Team.A | Team.B,
    target: Vec3,
    humanTeam: Team.A | Team.B,
    humanPosition: Vec3,
    humanActive: boolean
  ): boolean {
    const dangerSq = GAME_CONFIG.cpu.superJumpSafeEnemyRadiusMeters ** 2;

    if (
      humanActive &&
      humanTeam !== team &&
      horizontalDistanceSq(target, humanPosition) < dangerSq
    ) {
      return false;
    }

    for (const enemy of this.bots) {
      if (
        enemy.team === team ||
        enemy.lifeState !== 'ACTIVE' ||
        isCpuJumpAirborne(enemy)
      ) {
        continue;
      }
      if (horizontalDistanceSq(target, enemy.position) < dangerSq) return false;
    }

    return true;
  }

  private startCpuJumpPrep(bot: CpuBot, candidate: CpuJumpCandidate): void {
    if (bot.agent) {
      this.navigation.removeAgent(bot.agent);
      bot.agent = null;
    }

    bot.mobilityState = 'JUMP_PREP';
    bot.jumpTargetId = candidate.id;
    bot.jumpTargetPosition.copy(candidate.position);
    bot.jumpPrepRemaining = GAME_CONFIG.superJump.prepareSeconds;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    this.resetCpuWeaponRuntime(bot);
    bot.jumpMarker.enabled = true;
    bot.jumpMarker.setPosition(
      bot.jumpTargetPosition.x,
      bot.jumpTargetPosition.y + 0.035,
      bot.jumpTargetPosition.z
    );
    this.stats.cpuSuperJumpLast = `${bot.id}->${candidate.id}`;
  }

  private beginCpuJumpTravel(bot: CpuBot): void {
    bot.mobilityState = 'JUMP_TRAVEL';
    bot.jumpStartPosition.copy(bot.position);
    bot.previousPosition.copy(bot.position);
    bot.jumpTravelElapsed = 0;

    const dx = bot.jumpTargetPosition.x - bot.jumpStartPosition.x;
    const dz = bot.jumpTargetPosition.z - bot.jumpStartPosition.z;
    const distance = Math.hypot(dx, dz);
    bot.jumpArcHeight = clamp(
      GAME_CONFIG.superJump.minArcHeightMeters +
        distance * GAME_CONFIG.superJump.arcHeightPerHorizontalMeter,
      GAME_CONFIG.superJump.minArcHeightMeters,
      GAME_CONFIG.superJump.maxArcHeightMeters
    );

    this.stats.cpuSuperJumps += 1;
  }

  private updateCpuJumpAirborne(bot: CpuBot, dt: number): void {
    const total =
      GAME_CONFIG.superJump.travelSeconds + GAME_CONFIG.superJump.actionSeconds;

    if (bot.mobilityState === 'JUMP_TRAVEL') {
      bot.jumpTravelElapsed = Math.min(
        GAME_CONFIG.superJump.travelSeconds,
        bot.jumpTravelElapsed + dt
      );
      const progress = clamp01(bot.jumpTravelElapsed / Math.max(total, 1e-6));
      this.updateCpuJumpPosition(bot, progress);

      if (bot.jumpTravelElapsed >= GAME_CONFIG.superJump.travelSeconds) {
        bot.mobilityState = 'JUMP_LANDING';
        bot.jumpActionRemaining = GAME_CONFIG.superJump.actionSeconds;
      }
      return;
    }

    bot.jumpActionRemaining = Math.max(0, bot.jumpActionRemaining - dt);
    const elapsed =
      GAME_CONFIG.superJump.travelSeconds +
      (GAME_CONFIG.superJump.actionSeconds - bot.jumpActionRemaining);
    const progress = clamp01(elapsed / Math.max(total, 1e-6));
    this.updateCpuJumpPosition(bot, progress);

    if (bot.jumpActionRemaining <= 0) this.finishCpuJump(bot);
  }

  private updateCpuJumpPosition(bot: CpuBot, progress: number): void {
    bot.position.set(
      lerp(bot.jumpStartPosition.x, bot.jumpTargetPosition.x, progress),
      lerp(bot.jumpStartPosition.y, bot.jumpTargetPosition.y, progress) +
        Math.sin(Math.PI * progress) * bot.jumpArcHeight,
      lerp(bot.jumpStartPosition.z, bot.jumpTargetPosition.z, progress)
    );
  }

  private finishCpuJump(bot: CpuBot): void {
    const snapped = this.navigation.closestPoint(bot.jumpTargetPosition);
    const landing = new Vec3(snapped.x, snapped.y, snapped.z);

    bot.position.copy(landing);
    bot.previousPosition.copy(landing);
    bot.agent = this.navigation.addAgent(landing);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpCooldownSeconds = GAME_CONFIG.cpu.superJumpCooldownSeconds;
    bot.jumpRespawnWindowSeconds = 0;
    bot.thinkRemaining = GAME_CONFIG.cpu.tacticalThinkSeconds * 0.35;
    bot.paintRemaining = Math.max(bot.paintRemaining, 0.12);
    bot.fireRemaining = Math.max(bot.fireRemaining, 0.18);
    bot.entity.setLocalEulerAngles(0, 0, 0);
    this.stats.cpuSuperJumpLandings += 1;
  }

  private cancelCpuJump(bot: CpuBot, countCancel: boolean): void {
    if (bot.mobilityState === 'GROUND') return;

    const restore = bot.mobilityState === 'JUMP_TRAVEL' ||
      bot.mobilityState === 'JUMP_LANDING'
      ? bot.jumpStartPosition
      : bot.position;
    const snapped = this.navigation.closestPoint(restore);
    const point = new Vec3(snapped.x, snapped.y, snapped.z);

    if (bot.agent) this.navigation.removeAgent(bot.agent);
    bot.agent = this.navigation.addAgent(point);
    bot.position.copy(point);
    bot.previousPosition.copy(point);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    this.resetCpuWeaponRuntime(bot);
    bot.entity.setLocalEulerAngles(0, 0, 0);

    if (countCancel) this.stats.cpuSuperJumpCancels += 1;
  }

  private resetCpuWeaponRuntime(bot: CpuBot, resetGuard = false): void {
    this.sourceCommittedPaintAims.delete(bot.id);
    this.selectedSourceEmptyAimStreak.delete(bot.id);
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    bot.weaponBurstCooldown = 0;
    bot.weaponRollPaintCooldown = 0;
    bot.contactMovingFrames = 0;
    bot.weaponGuarding = false;
    bot.f4CanopyHold = false;
    bot.f4CanopyOpen = false;
    bot.f4RecoveringInk = false;
    bot.f4RecoveringHp = false;
    bot.guardEntity.enabled = false;
    if (resetGuard) {
      bot.weaponGuardHp = 100;
      bot.weaponGuardBreakSeconds = 0;
    }
  }

  private renderCpuGuard(
    bot: CpuBot,
    x: number,
    y: number,
    z: number
  ): void {
    const enabled =
      bot.weaponId === 'canopy-guard' &&
      bot.weaponGuarding &&
      bot.weaponGuardBreakSeconds <= 0 &&
      bot.weaponGuardHp > 0 &&
      bot.mobilityState === 'GROUND';

    bot.guardEntity.enabled = enabled;
    if (!enabled) return;

    const forward = bot.weaponFacing;
    bot.guardEntity.setPosition(
      x + forward.x * 0.82,
      y + 0.72,
      z + forward.z * 0.82
    );
    const yaw = Math.atan2(forward.x, forward.z) * 180 / Math.PI;
    bot.guardEntity.setLocalEulerAngles(0, yaw, 0);
  }

  private isCpuGuardBlockingPoint(bot: CpuBot, attackerPoint: Vec3): boolean {
    if (
      bot.weaponId !== 'canopy-guard' ||
      !bot.weaponGuarding ||
      bot.weaponGuardBreakSeconds > 0 ||
      bot.weaponGuardHp <= 0
    ) {
      return false;
    }

    const toAttacker = attackerPoint.clone().sub(bot.position);
    toAttacker.y = 0;
    if (toAttacker.lengthSq() <= 1e-8) return true;
    toAttacker.normalize();
    return bot.weaponFacing.dot(toAttacker) > -0.10;
  }

  private absorbCpuGuardDamage(bot: CpuBot, damage: number): boolean {
    if (
      bot.weaponId !== 'canopy-guard' ||
      !bot.weaponGuarding ||
      bot.weaponGuardBreakSeconds > 0 ||
      bot.weaponGuardHp <= 0
    ) {
      return false;
    }

    bot.weaponGuardHp = Math.max(0, bot.weaponGuardHp - damage);
    this.stats.cpuWeaponGuardBlocks += 1;
    if (bot.weaponGuardHp <= 0) {
      bot.weaponGuardBreakSeconds = 2.5;
      bot.weaponGuarding = false;
      bot.guardEntity.enabled = false;
    }
    return true;
  }

  private resetCpuKitState(bot: CpuBot, clearGauge: boolean): void {
    bot.f4SubRecoverySeconds = 0;
    bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    if (clearGauge) bot.specialPoints = 0;
  }

  private resetCpuJumpState(bot: CpuBot): void {
    this.phase14eFirstDrop?.cancel(bot.id);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpArcHeight = GAME_CONFIG.superJump.minArcHeightMeters;
    bot.entity.setLocalEulerAngles(0, 0, 0);
  }

  private paintAtBot(bot: CpuBot): void {
    // Genuine selected SOURCE combat uses paid, physically spawned weapon
    // projectiles and their original registered impact cells for turf.
    // The legacy per-foot paint stamp charges no shot ink: do not let
    // merely walking silently recolor the native OWN/enemy ink resource
    // grid. Keep the T20 and legacy source QA paint behavior untouched.
    if(this.b178RealSourceInkRecovery||this.f4WholeNavigation)return;
    this.samplePoint.copy(bot.position);
    this.samplePoint.y += 0.10;

    // In the explicit frozen Undertow F3 play lab all 17 verified
    // original floor paint surfaces are deliberately NON-SCOREABLE.
    // Requiring Scoreable silently disabled every CPU paint event despite
    // true source-authorized Paintable surfaces being present. Permit only
    // physical ink there; never create points, score weights or new floors.
    // T20 and all other CPU modes preserve the old exact flags.
    const previewSourcePaintableOnly=this.phase14qF2RecoverableSteps&&
      this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa';
    const sample = previewSourcePaintableOnly
      ?this.sampleRegisteredSourceFoot(bot):this.gameplayInk.sampleWorld(
      this.samplePoint,
      0.45,
      previewSourcePaintableOnly
        ?SurfaceFlags.Paintable
        :SurfaceFlags.Paintable | SurfaceFlags.Scoreable,
      SurfaceFlags.Wall
    );
    if (!sample) return;

    this.coordinator.enqueue({
      source: PaintSource.Cpu,
      actorId: bot.id,
      team: bot.team,
      surfaceId: sample.surface.id,
      centerU: sample.u,
      centerV: sample.v,
      radiusU: GAME_CONFIG.cpu.paintRadiusMeters * 1.15,
      radiusV: GAME_CONFIG.cpu.paintRadiusMeters,
      angle: 0,
      type: PaintEventType.Foot,
      strength: 0.85
    });
    this.stats.cpuPaintRequests += 1;
  }

  private splatBot(bot: CpuBot): void {
    this.f4ZipRuns.delete(bot.id);this.f4ZipRecovery.delete(bot.id);this.f4NaturalSpecial?.zipEnd(bot.id);
    this.f4LeadHistory?.delete(bot.id);
    if(this.f4WholeNavigation)this.f4Drops.delete(bot.id);
    if (bot.lifeState === 'SPLATTED') return;
    this.f4NaturalSpecial?.splat({actorId:bot.id,team:bot.team,weapon:bot.weaponId,lifeId:String(bot.f4LifeSerial)});
    this.selectedSourcePaintSaturation.delete(bot.id);
    this.selectedSourceEmptyAimStreak.delete(bot.id);
    this.nativeSourceSubScanByActor.delete(bot.id);
    this.qaMotionGoals.delete(bot.id);
    this.sourceLastAdmittedRouteGoal.delete(bot.id);
    this.sourceLiveNativeMotionGoal.delete(bot.id);
    this.sourceCrowdRefreshedThisLife.delete(bot.id);
    this.sourceCrowdRecoveryFoot?.delete(bot.id);
    this.sourceLastPhysicalBlockedTick.delete(bot.id);
    this.sourceCrowdProjectionHold.delete(bot.id);
    this.sourceLastRecoveryAuditTick.delete(bot.id);
    this.b35LastNativeTarget.delete(bot.id);
    this.sourceCommittedPaintAims.delete(bot.id);
    this.b178NativeCpuMovementSpeed.delete(bot.id);
    this.b178NativeCpuSpeedAgent.delete(bot.id);
    // Only in the original SOURCE game: do not release weapon requests
    // that were queued before a genuine same-tick lethal hit. Keep every
    // surviving teammate's paid real shots/kit actions intact.
    if (this.f3dSourceGoals) {
      for(let i=this.pendingShots.length-1;i>=0;i--)
        if(this.pendingShots[i]!.sourceId===bot.id){
          const req=this.pendingShots.splice(i,1)[0]!;
          // A paid SOURCE request that never left the muzzle must not
          // appear as a fired shot. Do NOT refund the dead actor's ink.
          if(this.phase14qF2RecoverableSteps&&req.sourceInkTransaction)
            this.stats.cpuShots=Math.max(0,this.stats.cpuShots-1);
        }
      for(let i=this.pendingKitRequests.length-1;i>=0;i--)
        if(this.pendingKitRequests[i]!.sourceId===bot.id){
          const req=this.pendingKitRequests.splice(i,1)[0]!;
          // Same-tick lethal HP zero cancels only undelivered effects.
          // Preserve the original splat's special retention/ink penalty.
          if(this.phase14qF2RecoverableSteps){
            if(req.kind==='SUB')
              this.stats.cpuSubUses=Math.max(0,this.stats.cpuSubUses-1);
            else
              this.stats.cpuSpecialActivations=Math.max(
                0,this.stats.cpuSpecialActivations-1);
          }
        }
    }
    this.phase14eFirstDrop?.cancel(bot.id);

    if (bot.agent) {
      this.navigation.removeAgent(bot.agent);
      bot.agent = null;
    }
    this.resetCpuWeaponRuntime(bot, true);
    this.resetCpuJumpState(bot);
    bot.specialPoints *= GAME_CONFIG.special.splatRetention;
    bot.subCooldownSeconds = 0;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.splatSpecialDecisionCooldownSeconds;

    bot.lifeState = 'SPLATTED';
    bot.b213ActualAttackerId=null;
    bot.b213ActualHitTick=-1;
    bot.respawnRemainingSeconds = GAME_CONFIG.match.respawnSeconds;
    bot.entity.enabled = false;
    // Remove only the splatted actor's QA kinematic proxy. The player,
    // 25 genuine solids, paint and NavMesh are never modified.
    this.phase14qGroundCollision?.removeRealCpuFoot?.(bot.id);
    this.stats.cpuSplats += 1;
    this.emitF4LifeFeedback('splat',bot);
    if (bot.lethalHumanDirect) this.stats.humanCpuDirectSplats += 1;
    bot.lethalHumanDirect = false;
  }

  private respawnBot(bot: CpuBot): void {
    this.f4LeadHistory?.delete(bot.id);
    let wholeSpawn=this.f4WholeNavigation?this.f4SpawnAgent(bot):null;
    if(this.f4WholeNavigation&&!wholeSpawn){
      // The preferred pad can stay occupied for the entire round.
      // Reuse an existing team pad, subject to the same KCC and Recast checks.
      const slots=bot.team===Team.A?this.stage.metadata.teamASpawnSlots:
        this.stage.metadata.teamBSpawnSlots;
      for(let i=0;i<slots.length&&!wholeSpawn;i++){
        if(i!==bot.slot)wholeSpawn=this.f4SpawnAgent(bot,i);
      }
    }
    if(this.f4WholeNavigation&&!wholeSpawn){
      bot.respawnRemainingSeconds=.25;
      return;
    }
    this.selectedSourcePaintSaturation.delete(bot.id);
    this.selectedSourceEmptyAimStreak.delete(bot.id);
    this.nativeSourceSubScanByActor.delete(bot.id);
    this.qaMotionGoals.delete(bot.id);
    this.sourceLastAdmittedRouteGoal.delete(bot.id);
    this.sourceLiveNativeMotionGoal.delete(bot.id);
    this.sourceCrowdRefreshedThisLife.delete(bot.id);
    this.sourceCrowdRecoveryFoot?.delete(bot.id);
    this.sourceLastPhysicalBlockedTick.delete(bot.id);
    this.sourceCrowdProjectionHold.delete(bot.id);
    this.sourceLastRecoveryAuditTick.delete(bot.id);
    this.b35LastNativeTarget.delete(bot.id);
    this.sourceCommittedPaintAims.delete(bot.id);
    this.b178NativeCpuMovementSpeed.delete(bot.id);
    this.b178NativeCpuSpeedAgent.delete(bot.id);
    const start = wholeSpawn?.foot??this.spawnPosition(bot.team, bot.slot);
    // CPU fixedUpdate runs all seven actors before traffic.observe.
    // A newborn HIGH-spawn actor cannot inherit the old lower-floor
    // physical rejoin during the intervening native weapon decisions.
    this.f3dSourceGoals?.onNativeSourceCpuRespawn?.(bot.id);
    if (bot.agent) this.navigation.removeAgent(bot.agent);
    bot.agent = wholeSpawn?.agent??this.navigation.addAgent(start);
    bot.position.copy(start);
    bot.previousPosition.copy(start);
    // Native respawn changes the actual CPU foot; register its physical
    // capsule BEFORE the next shared-world Crowd/KCC audit.
    this.phase14qGroundCollision?.syncRealCpuFoot(bot.id,bot.position);
    bot.jumpStartPosition.copy(start);
    bot.jumpTargetPosition.copy(start);
    bot.hp = GAME_CONFIG.combat.playerMaxHp;
    bot.lethalHumanDirect = false;
    bot.b213ActualAttackerId=null;
    bot.b213ActualHitTick=-1;
    bot.ink = GAME_CONFIG.inkEconomy.capacity;
    bot.inkRecoveryLockSeconds = 0;
    bot.hpRecoveryDelaySeconds = 0;
    bot.thinkRemaining = GAME_CONFIG.cpu.tacticalThinkSeconds * 0.25;
    bot.paintRemaining = GAME_CONFIG.cpu.paintCadenceSeconds * 0.5;
    bot.fireRemaining = weaponProfile(bot.weaponId, this.f4WholeNavigation).fireIntervalSeconds * 0.5;
    bot.weaponChargeSeconds = 0;
    bot.weaponBurstShotsRemaining = 0;
    bot.weaponBurstCooldown = 0;
    bot.weaponRollPaintCooldown = 0;
    bot.contactMovingFrames = 0;
    bot.weaponFacing.set(0, 0, bot.team === Team.A ? -1 : 1);
    bot.weaponGuardHp = 100;
    bot.weaponGuardBreakSeconds = 0;
    bot.weaponGuarding = false;
    bot.guardEntity.enabled = false;
    bot.respawnRemainingSeconds = 0;
    bot.lifeState = 'ACTIVE';
    bot.f4LifeSerial += 1;
    this.f4VisualAimTick.delete(bot.id);
    bot.mobilityState = 'GROUND';
    bot.jumpMarker.enabled = false;
    bot.jumpTargetId = '-';
    bot.jumpPrepRemaining = 0;
    bot.jumpTravelElapsed = 0;
    bot.jumpActionRemaining = 0;
    bot.jumpCooldownSeconds = 0;
    bot.jumpRespawnWindowSeconds = GAME_CONFIG.cpu.superJumpRespawnWindowSeconds;
    bot.jumpArcHeight = GAME_CONFIG.superJump.minArcHeightMeters;
    bot.subCooldownSeconds = GAME_CONFIG.cpu.kit.respawnSubCooldownSeconds;
    bot.specialDecisionCooldownSeconds =
      GAME_CONFIG.cpu.kit.respawnSpecialDecisionCooldownSeconds;
    bot.entity.enabled = true;
    bot.entity.setLocalEulerAngles(0, 0, 0);
    bot.entity.setPosition(start.x, start.y + 0.68, start.z);
    this.stats.cpuRespawns += 1;
    this.emitF4LifeFeedback('respawn',bot);
  }

  private spawnPosition(team: Team.A | Team.B, slot: number): Vec3 {
    const slots = team === Team.A
      ? this.stage.metadata.teamASpawnSlots
      : this.stage.metadata.teamBSpawnSlots;
    const fallback = team === Team.A
      ? this.stage.metadata.teamASpawn
      : this.stage.metadata.teamBSpawn;
    const selected = slots[slot] ?? fallback;
    const desired = new Vec3(selected[0], selected[1], selected[2]);
    const snapped = this.navigation.closestPoint(desired);
    return new Vec3(snapped.x, snapped.y, snapped.z);
  }

  private syncStats(): void {
    let teamA = 0;
    let teamB = 0;
    let painter = 0;
    let skirmisher = 0;
    let anchor = 0;
    let alive = 0;
    let jumpPrep = 0;
    let jumpAirborne = 0;
    let weaponCharging = 0;
    let weaponBursting = 0;
    let weaponGuarding = 0;
    let specialReady = 0;
    let specialPercentTotal = 0;
    const loadouts: string[] = [];
    const kits: string[] = [];
    let hpTotal = 0;
    let inkTotal = 0;

    for (const bot of this.bots) {
      if (bot.team === Team.A) teamA += 1;
      else teamB += 1;
      if (bot.role === 'PAINTER') painter += 1;
      else if (bot.role === 'SKIRMISHER') skirmisher += 1;
      else anchor += 1;

      if (bot.lifeState === 'ACTIVE'&&
          (!this.f4WholeNavigation||!this.f4PendingSpawns.has(bot.id))) alive += 1;
      if (bot.mobilityState === 'JUMP_PREP') jumpPrep += 1;
      if (isCpuJumpAirborne(bot)) jumpAirborne += 1;
      if (bot.weaponChargeSeconds > 0) weaponCharging += 1;
      if (bot.weaponBurstShotsRemaining > 0) weaponBursting += 1;
      if (bot.weaponGuarding || bot.f4CanopyOpen) weaponGuarding += 1;
      loadouts.push(`${bot.id}:${weaponProfile(bot.weaponId, this.f4WholeNavigation).shortName}`);
      const kit = weaponKit(bot.weaponId,this.f4SharedBombsEnabled);
      const sub = subWeaponProfile(kit.sub);
      const special = specialWeaponProfile(kit.special);
      const required = Math.max(special.requiredPoints, 1e-6);
      const specialPercent = Math.min(100, bot.specialPoints / required * 100);
      if (bot.specialPoints + 1e-6 >= required) specialReady += 1;
      specialPercentTotal += specialPercent;
      kits.push(
        `${bot.id}:${sub.shortName}/${special.shortName}:${specialPercent.toFixed(0)}%`
      );
      hpTotal += bot.hp;
      inkTotal += bot.ink;
    }

    this.stats.cpuAgents = this.bots.length;
    this.stats.cpuTeamA = teamA;
    this.stats.cpuTeamB = teamB;
    this.stats.cpuRoles = `P${painter} / S${skirmisher} / A${anchor}`;
    this.stats.cpuAlive = alive;
    this.stats.cpuSuperJumpPrep = jumpPrep;
    this.stats.cpuSuperJumpAirborne = jumpAirborne;
    this.stats.cpuLoadouts = loadouts.join(' · ');
    this.stats.cpuWeaponCharging = weaponCharging;
    this.stats.cpuWeaponBursting = weaponBursting;
    this.stats.cpuWeaponGuarding = weaponGuarding;
    this.stats.cpuKits = kits.join(' · ');
    this.stats.cpuSpecialReady = specialReady;
    this.stats.cpuAverageSpecialPercent =
      this.bots.length > 0 ? specialPercentTotal / this.bots.length : 0;
    this.stats.cpuAverageHp = this.bots.length > 0 ? hpTotal / this.bots.length : 0;
    this.stats.cpuAverageInk = this.bots.length > 0 ? inkTotal / this.bots.length : 0;
  }
}

function cpuSubCooldownSeconds(
  subId: SubWeaponId,
  role: CpuRole
): number {
  const base = subId === 'snap-bomb'
    ? GAME_CONFIG.cpu.kit.snapBombCooldownSeconds
    : subId === 'pulse-bomb'
      ? GAME_CONFIG.cpu.kit.pulseBombCooldownSeconds
      : GAME_CONFIG.cpu.kit.anchorBombCooldownSeconds;
  if (role === 'SKIRMISHER') {
    return base * GAME_CONFIG.cpu.kit.skirmisherSubCooldownMultiplier;
  }
  if (role === 'ANCHOR') {
    return base * GAME_CONFIG.cpu.kit.anchorSubCooldownMultiplier;
  }
  return base;
}

function cpuWeaponInkCost(
  profile: ReturnType<typeof weaponProfile>,
  action: CpuWeaponAction,
  charge: number
): number {
  if (action === 'ROLLER_ROLL') return profile.rollPaintInkCost;
  if (profile.charger) return railCharge(charge).inkCost;
  if (action === 'SPLATANA_RELEASE' && profile === weaponProfile('ink-saber', true)) {
    return F4_SABER_TIMING[charge >= 1 ? 'charged' : 'horizontal'].ink;
  }

  if (action === 'STRINGER_RELEASE') {
    const firstRing = profile.chargeSeconds > 0
      ? profile.firstChargeSeconds / profile.chargeSeconds
      : 0;
    if (charge >= firstRing && firstRing < 1) {
      const second = clamp01(
        (charge - firstRing) / Math.max(1 - firstRing, 1e-6)
      );
      return lerp(6.0, 8.5, second);
    }
    const first = firstRing > 0 ? clamp01(charge / firstRing) : clamp01(charge);
    return lerp(5.0, 6.0, first);
  }

  return profile.inkCost;
}

export function cpuWeaponRangeMeters(
  profile: ReturnType<typeof weaponProfile>
): number {
  // Decisions use measured grounded F4 dispatch distances. Keep the
  // shared ballistic aim solver and all non-F4 weapon profiles intact.
  if (profile.shooter) {
    if (profile.id === 'rotor-splatling') return 15;
    if (profile.id === 'pulse-sprayer') return 11;
    if (profile.id === 'needle-smg' || profile.id === 'twin-comets') return 10;
    return profile.shooter.combatRangeMeters;
  }
  if (profile.slosher) return 9;
  if (profile.arrowFlight) return 21;
  switch (profile.weaponClass) {
    case 'CHARGER':
      return 24;
    case 'SPLATLING':
      return 13.5;
    case 'SLOSHER':
      return 10.5;
    case 'BLASTER':
      return 10.0;
    case 'DUALIES':
      return 9.8;
    case 'ROLLER':
      return 4.6;
    case 'BRUSH':
      return 2.45;
    case 'BRELLA':
      return 7.6;
    case 'STRINGER':
      return 15.0;
    case 'SPLATANA':
      return 8.5;
    default:
      return GAME_CONFIG.cpu.combatRangeMeters;
  }
}

function horizontalDistanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function raySphereDistance(
  origin: Vec3,
  direction: Vec3,
  maxDistance: number,
  center: Vec3,
  radius: number
): number | null {
  const offset = origin.clone().sub(center);
  const b = offset.dot(direction);
  const c = offset.dot(offset) - radius * radius;
  if (c > 0 && b > 0) return null;
  const discriminant = b * b - c;
  if (discriminant < 0) return null;
  const distance = Math.max(0, -b - Math.sqrt(discriminant));
  return distance <= maxDistance ? distance : null;
}

/** Ray against the SAME vertically aligned Rapier capsule physically
 * synchronized at SOURCE CPU foot +.68m. Cylinder sides + hemispherical
 * ends; all distances are along the already-normalized real shot ray.
 * Does not create a projectile, actor, damage or terrain authority. */
function raySourceCpuCapsuleDistance(
  from:Vec3,direction:Vec3,length:number,foot:Vec3,extraRadius=0
):number|null{
  const radius=ORIGINAL_SOURCE_CPU_CAPSULE.radiusMeters+extraRadius;
  const half=ORIGINAL_SOURCE_CPU_CAPSULE.halfHeightMeters;
  const middleY=foot.y+ORIGINAL_SOURCE_CPU_CAPSULE.centerOffsetMeters;
  const lowY=middleY-half,highY=middleY+half;
  const x=from.x-foot.x,z=from.z-foot.z;
  const nearY=Math.max(lowY,Math.min(highY,from.y));
  const vertical=from.y-nearY;
  // A real projectile may already be inside a live capsule on this tick.
  if(x*x+z*z+vertical*vertical<=radius*radius)return 0;
  let closest:number|null=null;
  const a=direction.x*direction.x+direction.z*direction.z;
  if(a>1e-12){
    const b=x*direction.x+z*direction.z;
    const c=x*x+z*z-radius*radius;
    const discriminant=b*b-a*c;
    if(discriminant>=0){
      const t=(-b-Math.sqrt(discriminant))/a;
      const hitY=from.y+direction.y*t;
      if(t>=0&&t<=length&&hitY>=lowY&&hitY<=highY)
        closest=t;
    }
  }
  for(const capY of [lowY,highY]){
    const t=raySphereDistance(
      from,direction,length,new Vec3(foot.x,capY,foot.z),radius);
    if(t!==null&&(closest===null||t<closest))closest=t;
  }
  return closest;
}

function isCpuJumpAirborne(bot: CpuBot): boolean {
  return bot.mobilityState === 'JUMP_TRAVEL' ||
    bot.mobilityState === 'JUMP_LANDING';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function makeCpuMaterial(rgb: readonly [number, number, number]): StandardMaterial {
  const material = new StandardMaterial();
  material.diffuse = new Color(rgb[0] * 0.82, rgb[1] * 0.82, rgb[2] * 0.82);
  material.emissive = new Color(rgb[0] * 0.12, rgb[1] * 0.12, rgb[2] * 0.12);
  material.useMetalness = true;
  material.metalness = 0.20;
  material.gloss = 0.76;
  material.update();
  return material;
}
