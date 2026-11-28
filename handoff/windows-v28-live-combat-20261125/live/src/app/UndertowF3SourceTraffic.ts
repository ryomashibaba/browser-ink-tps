import {isT21F4ResearchStage,isT21F4OriginalTerrainStage,buildT21F4PhotoRouteExperiment,
 f4OriginalCorridorEndpoints,hasF4OriginalIngress,t21F4PlayableCorridorGuide}
 from '../stage/undertow/UndertowT21F4PhotoRouteReconstruction';
/**
 * F3 opt-in playable preview traffic: reuse ONLY the eight genuine source
 * spawn feet and frozen existing first-drop + FloorConcrete03 ramp links.
 * No synthetic traversable pad, moving physical feet, scoring, or promotion.
 * Two independent source-side queues preserve the F2 7/7 physical recovery
 * result while the human is controlled by real PlayerInput.
 */
import {Vec3} from 'playcanvas';
import {F4PatrolNavigation,localPatrolProgress,localPatrolCanContinue,type PatrolCandidate,type PatrolInk,type PatrolPoint} from '../ai/F4PatrolNavigation.mjs';
import {recoveringInk} from '../ai/F4CpuRecoveryPolicy.mjs';
import {chooseF4PhysicalSight} from '../ai/F4CpuAttackPolicy.mjs';
import {F4PatrolSurvey} from '../ai/F4PatrolSurvey.mjs';
import type {CrowdAgent} from 'recast-navigation';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {B34_GROUNDED_STALL_TICKS,rankOriginalSourcePatrolGoals,existingOriginalSourceInkOpportunity,prioritizeExistingInFlightSourceGoal,mayReconsiderStalledOriginalGoal,distributeOriginalSourceGoalCoverage} from './UndertowF3PaintAwarePatrol';
import {eligibleB137OriginalAllyRally} from './UndertowF3OriginalAllyRally';
import {rankB169OriginalAdvanceGuardGoals} from './B169OriginalAllyAdvanceGuard';
import {b199ActualAllyCollisionReliefCandidates} from './B199ActualAllyCollisionRelief';
import {chooseB142OriginalAllyStandoff,mayRetainB143OriginalAllyStandoff}
 from './UndertowF3OriginalAllyStandoff';
import {eligibleB150OriginalAllyInk,b150OriginalAllyInkCandidates,
 diversifyB153OriginalAllyInkCandidates,b150OriginalAllyNativeShotReachable,
 b150ActualUnownedAllyPaintAim}
 from './UndertowF3OriginalAllySupportInk';
import {inspectB130OriginalFlatSource} from './W10B130OriginalFlatEdge';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import type {B367NativeCpuState} from './B367RealCpuCombatTimeline';
import {eligibleB192SourceHumanPursuit} from './B192SourceHumanPursuit';
import {b421RealEnemyStandoff,type B421OriginalWeaponLane,type B421StandoffRouteCheck}
 from './B421RealEnemyStandoff';
import {cpuWeaponRangeMeters} from '../ai/CpuAgentSystem';
import {chooseB181OriginalSourceSight} from '../ai/B181OriginalSourceCombatSight';
import {b180OriginalSourceUnownedNeighborAim} from '../ai/B180OriginalSourcePaintOpportunity';
import {weaponProfile,type WeaponId} from '../weapons/WeaponCatalog';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {rankOriginalSourceCombatRetreatGoals,originalSourceCpuWoundedRecoveryActive,originalSourceCpuMayHoldOwnInk,originalSourceRegisteredOwnFoot,originalSourceWoundedHoldNativeFoot} from './OriginalSourceCombatRetreat';
import {proposeB441OriginalFrontline,proposeB441OriginalRampLocalGoals,
 b467MayRetryOriginalBFrontFromRealFoot,
 b468MayRetryDifferentOriginalBGoalAfterRealDwell,
 b468MayReauditInitiallyApprovedOriginalBGoal,
 b470MayAuditRealInkRankedSameSideFront,
 b471MayRequestActualA1SourceOrder}
 from './B441OriginalSourceFrontline';
import {decideB443OriginalFrontHold} from './B443OriginalFrontHold';
import {b450FirstSourceDenial,type B450FailedOriginalGoal}
 from './B450OriginalRouteWitness';
import {B454NativeSourceFootRecorder} from './B454NativeSourceFootTrace';
import {b485MayIssueNativeA1OriginalOrder,
 b485MayDwellAtTrueOriginalA1Arrival} from './B485RealRepeatA1Command';
import {B484TrueNativeA1FollowThrough} from './B484TrueNativeA1FollowThrough';
import {B486NativeSourceEncounterTrace} from './B486NativeSourceEncounterTrace';
import {b487ActualOriginalCrossTeamTopology} from './B487TrueOriginalCrossTeamTopology';
import {b488OriginalCrossTeamGapDecision} from './B488OriginalCrossTeamGapDecision';
import type {CpuQaSourceGoalAuthority} from '../ai/CpuAgentSystem';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,
 UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import type {SourceSpawnPlan}
 from '../stage/undertow/UndertowPhase14QSourceSpawnPlan';
import {planT21F2SourceDropRoutes,type T21F2RoutePlan}
 from '../stage/undertow/UndertowF2SourceDropRoutes';
import {originalNativeLandingFootReprojection,
 originalNativeRampFootReprojection,
 originalNativeRightLowFootReprojection}
 from '../stage/undertow/UndertowOriginalNativeLandingFootReprojection';
import {combatSpacing,rankCombatCandidate} from './F4LocalCombat.mjs';

import {chooseLocalCombatGoal,type F4InkRelation} from './F4LocalCombat.mjs';

// Existing F4 center step approaches from the project's physical jump
// trial (4a52eb81). Whole-mesh Recast and Rapier both recheck these points.
const F4_CENTER_STEP={
 1:{takeoff:[-2.58,0,3.36],upper:[-.55,1.5,2.4],shoulder:[-1.40,1.5,1.84],low:[-3.3,0,4.15]},
 [-1]:{takeoff:[2.85,0,-3.55],upper:[.40,1.5,-2.30],shoulder:[1.40,1.5,-1.84],low:[3.8,0,-4.6]}
} as const;

export interface F3TrafficCpu{
 id:string;team:Team.A|Team.B;position:Vec3;agent:CrowdAgent|null;
 mobilityState:string;thinkRemaining:number;paintRemaining:number;
 fireRemaining:number;jumpCooldownSeconds:number;
 lifeState?:'ACTIVE'|'SPLATTED';hp?:number;weaponId?:WeaponId;
 ink?:number;b213ActualAttackerId?:string|null;b213ActualHitTick?:number;
 f4RecoveringInk?:boolean;
 f4RecoveringHp?:boolean;
}
/** Read-only SOURCE QA observation: a native splat may occur in the
 * projectile phase AFTER traffic.observe() in the same physics tick.
 * Historical F2 rejoin bookkeeping is NOT a live CPU while the actual
 * native actor is SPLATTED (or its life state is unknown).
 * Never clears or adds original navigation/physics authority. */
export function sourceNativeLiveRejoinedCpu(
 cpu:Pick<F3TrafficCpu,'id'|'lifeState'|'hp'|'mobilityState'>,
 genuinePriorRejoins:ReadonlySet<string>
):boolean{
 // A past F2 landing cannot make a dead, HP-zero or currently airborne
 // CPU count as a playable source actor, even before observe() runs.
 return cpu.lifeState==='ACTIVE'&&Number.isFinite(cpu.hp)&&cpu.hp!>0&&
  cpu.mobilityState==='GROUND'&&genuinePriorRejoins.has(cpu.id);
}
/**
 * SOURCE combat may pursue only an actual, independently physically rejoined
 * and living opponent. A prior F2 historical rejoin, unknown lifecycle,
 * zero-HP frame or inactive/falling actor is NOT a live target.
 * Read-only filtering; never fabricates a bot, path, source floor, hit or HP.
 */
export function sourceNativeEligibleOpponentForCombat(
 self:Pick<F3TrafficCpu,'id'|'team'>,
 other:Pick<F3TrafficCpu,
  'id'|'team'|'lifeState'|'mobilityState'|'position'|'hp'>,
 actualSelfFoot:Vec3,originalSide:1|-1,
 genuinePriorRejoins:ReadonlySet<string>
):boolean{
 return other.id!==self.id&&other.team!==self.team&&
  sourceNativeLiveRejoinedCpu(other,genuinePriorRejoins)&&
  other.mobilityState==='GROUND'&&
  Number.isFinite(other.hp)&&other.hp!>0&&
  [other.position.x,other.position.y,other.position.z,
   actualSelfFoot.x,actualSelfFoot.y,actualSelfFoot.z]
   .every(Number.isFinite)&&
  other.position.z*originalSide>=33&&
  // REAL original 3m/4.5m source terraces and existing ramps can have
  // different elevations. Do not veto them before the SAME source-foot,
  // full Recast path, Rapier 30cm support, actor and standoff gates run.
  // Still forbid out-of-source levels or speculative F4 crossing.
  actualSelfFoot.y>=2.7&&actualSelfFoot.y<=5.25&&
  other.position.y>=2.7&&other.position.y<=5.25&&
  Math.abs(other.position.y-actualSelfFoot.y)<=1.75;
}

/** B445 read-only per-CPU audit for existing B441 original SOURCE goals.
 * A denial is not permission to relax physics or invent a link. */
export interface B445RealSourceGoalGate{
 readonly id:string;
 readonly actualOriginalLanding:[number,number,number];
 readonly originalFloorProposals:number;
 inspectedProposals:number;
 rejectedOriginalRapierOrBoundary:number;
 rejectedNativeRecastOrOriginalPath:number;
 /** B446: exact first failure among original Recast gates. */
 rejectedNativeUnreached:number;
 rejectedNativeStartSnap:number;
 rejectedNativeEndSnap:number;
 rejectedNativeIntermediateOriginalSupport:number;
 strictlyApprovedGoals:number;
 readonly approvedOriginalGoals:[number,number,number][];
 runtimeChooseInvocations:number;
 runtimeNoOriginalFrontGoals:number;
 runtimeNearExistingGoal:number;
 runtimeUnsupportedGoalFoot:number;
 runtimeUnsupportedNativePath:number;
 runtimeTrueOriginalGoalRequests:number;
}
/** B446 original-source probe from the current REAL rejoined CPU foot.
 * Never a target grant: changes no navigation, Actor, collision, or clock. */
export interface B446RealFootDryRouteProbe{
 readonly id:string;
 readonly nativeTick:number;
 readonly actualPhysicalFoot:[number,number,number];
 readonly inspectedOriginalGoals:number;
 readonly deniedRapierOrBoundary:number;
 readonly nativeUnreached:number;
 readonly nativeStartSnap:number;
 readonly nativeEndSnap:number;
 readonly nativeIntermediateSupport:number;
 readonly passedAllOriginalChecks:number;
 readonly firstPassingExistingGoal:[number,number,number]|null;
 /** Native B446 success candidates from the same physical CPU foot.
  * Every one already passed the identical original Rapier + full Recast
  * checks, but this list grants NO Actor move and NO navigation authority.
  * B448 alone may later select/reapprove one for real A3. */
 readonly passingExistingGoals:[number,number,number][];
 /** B450 actual B2/B4 first original unsupported samples; never goals. */
 readonly b450FailedOriginalGoals:B450FailedOriginalGoal[];
 readonly probeOnlyNoActorOrGoalWrites:true;
}
export interface F3TrafficSnapshot{
 readonly cpu:readonly {id:string;mobilityState:string;released:boolean;rejoined:boolean;lastMovedTick:number;physicalFoot:[number,number,number];lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';hp:number|null}[];
 readonly physicalFirstDrops:readonly string[];
 readonly physicalRejoins:readonly string[];
 readonly landingCorridorsCleared:readonly string[];
 readonly releasedCpuIds:readonly string[];
 readonly freeCombatEnabled:boolean;
 readonly b93UpperDetours:readonly {actorId:string;linkId:string;phase:string;escapeFoot:StageVector3|null}[];
 readonly b93ExperimentalEnabled:boolean;
 readonly sourcePatrol:{
  readonly auditedTargets:number;
  /** Opt-in B441: REAL source-backed frontline goal attempts; still UNSCORED. */
  readonly b441Enabled:boolean;
  /** Last genuine F4 native/Rapier gate for each live CPU. Research only. */
  readonly f4GuideLastAudit:readonly {
   id:string;index:number;
   actualFoot:[number,number,number];
   goal:[number,number,number];
   nativeReached:boolean;nativeStartSnap:number;nativeEndSnap:number;
   nativePathPoints:number;footSupportSolid:string|null;
   supportGapMeters:number|null;admitted:boolean;
  }[];
  readonly b441ProposalsChecked:number;
  readonly b441StrictGoalsAvailable:number;
  readonly b441ActualGoalRequests:number;
  readonly b441UnsafeOrUnreachableHolds:number;
  readonly b441ClosestApprovedFrontAbsZ:number|null;
  readonly originalRampLocal:{
   readonly approved:number;readonly retained:number;readonly rejected:number;
   readonly active:readonly {id:string;point:[number,number,number]}[];
   readonly crossTeamRoutesAuthorized:false;
  };
  /** B445: original real lower-landing rejection reasons per CPU. */
  readonly b445OriginalFrontlineGates:readonly B445RealSourceGoalGate[];
  readonly b446LivePhysicalFootDryRouteProbes:
   readonly B446RealFootDryRouteProbe[];
  readonly b448A3ResearchEnabled:boolean;
  readonly b448A3FreshLiveOriginalGoalsAuthorized:number;
  readonly b448A3FreshLiveOriginalHolds:number;
  readonly b448A3RealNativeGoalRequests:number;
  /** B467: strictly late B2/B4 ORIGINAL goal trials, NO enemy crossing. */
  readonly b467RealLateFoot:{
   readonly sourceOnlyResearch:boolean;
   readonly genuineNativeRetryAttempts:number;
   readonly rejectedUnchangedOriginalChecks:number;
   readonly strictlyApprovedLateGoals:number;
   readonly actualNativeGoalRequests:number;
   readonly secondDistinctOriginalGoalsApproved:number;
   readonly additionalStrictOriginalCoverageGoalsApproved:number;
   readonly nativeOriginalInkRankedExpansionAttempts:number;
   readonly nativeRetargetWitnesses:readonly {
    id:string;nativeTick:number;actualFoot:[number,number,number];
    previousOriginalGoal:[number,number,number];
    nextOriginalGoal:[number,number,number];
   }[];
   readonly nativeApprovalWitnesses:readonly {
    id:string;nativeTick:number;actualFoot:[number,number,number];
    actualOriginalSolidId:string;sourceGoal:[number,number,number];
   }[];
   readonly opposingRouteCertified:false;
   readonly officialWinner:'NONE';
  };
  readonly b470NativeLocalCoverage:{
   readonly strictlyApprovedAdditionalOriginalGoals:number;
   readonly rankedOwnerGridAuditAttempts:number;
   readonly actualDistinctOriginalGoalRequests:number;
   readonly realNativeRetargetWitnesses:readonly {
    id:string;nativeTick:number;
    actualFoot:[number,number,number];
    previousOriginalGoal:[number,number,number];
    nextOriginalGoal:[number,number,number];
   }[];
   readonly opponentRouteCertified:false;
   readonly scoreableSourcePromotions:0;
  };
  readonly b471TruePlayerOrderedAlly:{
   readonly status:'OFF'|'HOLD'|'REQUESTED'|'MOVING'|'ARRIVED'|'EXPIRED';
   readonly genuineKeyRequests:number;
   readonly strictlyApprovedOriginalGoals:number;
   readonly actualNativeGoalRequests:number;
   readonly rejectedOriginalRoutes:number;
   readonly actualOriginalArrivals:number;
   readonly requestedNativeTick:number|null;
   readonly approvedRealAllyFoot:[number,number,number]|null;
   readonly approvedOriginalGoal:[number,number,number]|null;
   readonly officialWinner:'NONE';
   readonly actorInkScoreClockWrites:0;
  };
  readonly b443NativeGoalRetentions:number;
  readonly b443FirstActualFrontlineArrivals:number;
  readonly b443RotationsAfterDwell:number;
  readonly b443ReleasedUnsafeOrStalled:number;
  /** B442: last ACTUALLY GRANTED B441 goals and physical CPU-foot
   * distance. Read-only observation, not goal attainment certification. */
  readonly b442LastApprovedRealFrontTargets:readonly {
   id:string;
   target:[number,number,number];
   physicalFoot:[number,number,number];
   /** Plan-view diagnostic only, NOT actual original SOURCE goal arrival. */
   distanceXZ:number;
   /** True live CPU foot->already-approved goal metric, all XYZ axes. */
   distance3D:number;
   lastApprovedNativeTick:number;
   originalRegisteredSourceOnly:true;
  }[];
  /** B137: opt-in true HUMAN + friendly A1 source-only tactical rally. */
  readonly b137AllyRallyOptIn:boolean;
  readonly b137RealCandidateChecks:number;
  readonly b137ApprovedNativeRallies:number;
  readonly b137UnsafeOrUnsupportedRallies:number;
  readonly b137MissingSourceFloorProof:number;
  readonly b142OriginalStandoffGoalsApproved:number;
  readonly b142UnsafeStandoffGoalsDenied:number;
  readonly b143ReauthorizedStableStandoffGoals:number;
  readonly b143UnsafeOrStaleGoalHoldsRejected:number;
  readonly b150AllySupportInkOptIn:boolean;
  readonly b169SourceAdvanceGuardChecks:number;
  readonly b169NativeAdvanceGuardTargets:number;
  readonly b169RejectedUnsafeOrUnreachableGoals:number;
  readonly b199ActualCollisionReliefChecks:number;
  readonly b199OriginalNativeReliefGoals:number;
  readonly b199RejectedUnsafeReliefPaths:number;
  readonly b150SourceCandidateSamples:number;
  readonly b150ApprovedInkAims:number;
  /** B153 source-verified A1 aim proposals after rotation. */
  readonly b153DiversifiedAimApprovals:number;
  readonly realGoalRequests:number;
  /** Local combat proposals, not proof of executed Crowd/KCC motion. */
  readonly f4LocalCombatProposals?:Readonly<{attempts:number;candidateCount:number;admitted:number}>;
  readonly heldRequests:number;
  readonly engagementGoalRequests:number;
  /** Native original upper-spawn return, no synthetic respawns. */
  readonly respawnOriginalDetected:number;
  readonly respawnOriginalGoalRequests:number;
  readonly respawnOriginalRejoins:number;
  readonly respawnUnsafeReturnHolds:number;
  readonly respawnPendingCpuIds:readonly string[];
  readonly b192ApprovedHumanCombatGoals:number;
  readonly b192RejectedHumanCombatGoals:number;
  readonly sameSourceEnemyCandidates:number;
  readonly deniedNativeEnemyPaths:number;
  readonly sourceEndpointProbes:number;
  readonly nativeRouteChecks:number;
  readonly nativeRouteRayProbes:number;
  readonly rejectedUnsupportedNativeRoutes:number;
  readonly unauditedPatrolRouteRequests:number;
  readonly rejectedUnsupportedGoals:number;
  readonly deniedUnsupportedEnemyFeet:number;
  readonly travelMeters:number;
  /** Actual 60Hz Rapier-grounded cumulative meters per original CPU. */
  readonly realGroundTravelMetersByActor:Readonly<Record<string,number>>;
  /** B34 real original-foot locomotion and certified Recast goal traces. */
  readonly groundedFreeCombatCpuSamples:number;
  readonly nearlyStationaryGroundedCpuSamples:number;
  readonly requestedGoalDirectMeters:number;
  readonly requestedGoalNativePathMeters:number;
  readonly requestedGoalLongHops:number;
  readonly requestedGoalShortHops:number;
  readonly requestedGoalLengthsSampled:number;
  readonly trulyNewOriginalGoalSelections:number;
  readonly newGoalDirectMeters:number;
  readonly newGoalNativePathMeters:number;
  readonly newGoalShortHops:number;
  readonly newGoalLongHops:number;
  readonly paintAwareModeEnabled:boolean;
  readonly stableSourceGoalModeEnabled:boolean;
  readonly b34StallRecoveryModeEnabled:boolean;
  readonly stalledOriginalGoalReconsiderations:number;
  readonly approvedAlternativeOriginalGoalsAfterStall:number;
  readonly continuedPreviouslyApprovedGoalRequests:number;
  readonly switchedGoalBeforePreviousArrival:number;
  readonly actualOriginalInkOwnershipLookups:number;
  readonly actualOriginalInkOwnershipSampled:number;
  readonly realPaintAwareGoalsAccepted:number;
  readonly paintAwareNonOwnedGoalsAccepted:number;
  readonly paintAwareOwnGoalsAccepted:number;
  readonly paintAwareUnknownInkGoalsAccepted:number;
  readonly paintAwareRouteShortcutsGranted:0;
  readonly attemptsToCrossUnboundUnderpass:0;
  readonly activeTargets:readonly {id:string;position:[number,number,number]}[];
  readonly sourceOnly:true;
  readonly productionAuthorized:false;
 };
 readonly originalSourceLinksUsed:number;
 readonly physicalFootRelocations:0;
 readonly productionAuthorized:false;
}
const RELEASE_AFTER:Readonly<Record<string,string|null>>={
 A1:null,A3:'A1',A2:'A3',
 B4:null,B1:'B4',B3:'B1',B2:'B3'
};
const sourceSides=['positive-z','negative-z'] as const;
export class UndertowF3SourceTraffic implements CpuQaSourceGoalAuthority{
 readonly routePlan:T21F2RoutePlan;
 private readonly egress=new Map<string,StageVector3>();
 private readonly f4GuideByTeam=new Map<Team.A|Team.B,readonly StageVector3[]>();
 private readonly f4OriginalPatrol=new Map<string,{route:readonly [StageVector3,StageVector3];target:0|1}>();
 private readonly f4GuideProgress=new Map<string,number>();
 /** Actual living HUMAN observation for the current F4 native step ONLY. */
 private f4LiveHuman:Readonly<{
  x:number;y:number;z:number;mode:'HUMAN'|'SQUID';tick:number
 }>|null=null;
 private readonly f4GuideLastAudit=new Map<string,{
  id:string;index:number;actualFoot:[number,number,number];
  goal:[number,number,number];
  nativeReached:boolean;nativeStartSnap:number;nativeEndSnap:number;
  nativePathPoints:number;footSupportSolid:string|null;
  supportGapMeters:number|null;admitted:boolean;
 }>();
 private readonly patrolGoals=new Map<string,Vec3[]>();
 private readonly b441FrontGoals=new Map<string,Vec3[]>();
 /** Only genuine original-ramp, native-approved recovery GOALS; never feet. */
 private readonly b441OriginalRampGoal=new Map<string,Vec3>();
 private readonly b441OriginalRampLastAuditTick=new Map<string,number>();
 private b441OriginalRampApprovals=0;
 private b441OriginalRampRetentions=0;
 private b441OriginalRampRejected=0;
 private readonly b445FrontlineGates=new Map<string,B445RealSourceGoalGate>();
 private readonly b446LiveFootProbes=
  new Map<string,B446RealFootDryRouteProbe>();
 /** B454 bounded read-only, 60Hz actual CPU physical foot observations. */
 private readonly b454Trace=new B454NativeSourceFootRecorder();
 private readonly b484A1Trace=new B484TrueNativeA1FollowThrough();
 private readonly b486Encounter=new B486NativeSourceEncounterTrace();
 private b448A3FreshLiveOriginalGoalsAuthorized=0;
 private b448A3FreshLiveOriginalHolds=0;
 private b448A3RealNativeGoalRequests=0;
 /** B467: the INITIAL B446 HOLD is immutable; only LATER true KCC
  * right-low B-foot observations may independently reauthorize a goal. */
 private readonly b467LastLiveRetryTick=new Map<string,number>();
 private readonly b467LiveSourceGoals=new Map<string,{
  nativeTick:number;actualFoot:[number,number,number];
  actualOriginalSolidId:string;sourceGoal:[number,number,number]
 }>();
 private b467LiveRetryAttempts=0;
 private b467LiveRejectedCandidates=0;
 private b467LateOriginalGoalsApproved=0;
 private b467TrueNativeGoalRequests=0;
 private b467SecondDistinctOriginalGoalsApproved=0;
 private b469AdditionalOriginalCoverageGoals=0;
 private b469NativeInkRankedExpansionAttempts=0;
 private readonly b470LastNativeRetry=new Map<string,number>();
 private b470LocalRealAdditionalGoals=0;
 private b470RankedActualGoalAudits=0;
 private b470RealDistinctGoalRequests=0;
 private readonly b470NativeRetargetWitnesses:Array<{
  id:string;nativeTick:number;actualFoot:[number,number,number];
  previousOriginalGoal:[number,number,number];
  nextOriginalGoal:[number,number,number]
 }>=[];
 private readonly b467NativeRetargetWitnesses:Array<{
  id:string;nativeTick:number;actualFoot:[number,number,number];
  previousOriginalGoal:[number,number,number];
  nextOriginalGoal:[number,number,number]
 }>=[];
 /** B442 evidence-only: no steering, Actor, or navigation side effects. */
 private readonly b442LastApprovedFront=new Map<string,{
  target:Vec3;nativeTick:number
 }>();
 private readonly b443OriginalGoalLocks=new Map<string,{
  target:Vec3;firstApprovedTick:number;arrivedSinceTick:number|null
 }>();
 private b443NativeGoalRetentions=0;
 private b443FirstActualFrontlineArrivals=0;
 private b443RotationsAfterDwell=0;
 private b443ReleasedUnsafeOrStalled=0;
 private b441ProposalsChecked=0;
 private b441StrictGoalsAvailable=0;
 private b441ActualGoalRequests=0;
 private b441UnsafeOrUnreachableHolds=0;
 private b441ClosestApprovedFrontAbsZ:number|null=null;
 private readonly patrolIndex=new Map<string,number>();
 /** Real native Rapier KCC rejection streak, NOT inferred stationary time.
  * An alternative may be sought only after 90 denied original 60Hz steps;
  * every new candidate must independently pass strict source+Recast gates.
  * This ledger can NEVER approve a step, original face, or cross-team route. */
 private readonly realKccRejectedSteps=new Map<string,number>();
 /** A failed ALTERNATIVE after 90 genuine Rapier rejects must not cause
  * the original rejected target to be resubmitted on every 0.28s think.
  * Hold briefly (30 advancing native ticks) before another fully audited
  * original route trial. No Actor, path, physics, clock or floor changes. */
 private readonly originalSourceFailedAlternateHold=new Map<string,{
  foot:Vec3;retryAtTick:number
 }>();
 /** Genuine B3 #43667197355 and B2/B4 native actor-contact evidence:
  * accepted <=3cm Rapier foot jitter must not erase repeated KCC
  * refusals. Keep the true B-team foot anchor until >=25cm of
  * actual horizontal progress or an independently authorized original
  * alternative. Never authorizes actor movement, stage or crossing. */
 private readonly realKccBTeamRecoveryAnchor=new Map<string,Vec3>();
 /** Real KCC contact owner, never mere distance-based collision inference. */
 private readonly realKccLastActorBlocker=new Map<string,{
  ownerId:string;nativeTick:number
 }>();
 /** Actual B4 Rapier unsupported-destination witness. Neither original
  * stage nor CPU pose can be changed by this diagnostic source signal. */
 private readonly realKccB4Unsupported=new Map<string,{
  nativeTick:number;foot:Vec3
 }>();
 /** Only true, current B3 native KCC original-floor rejection;
  * it can trigger a new fully verified SAME-RAMP goal, never movement. */
 private readonly realKccB3Unsupported=new Map<string,{
  nativeTick:number;foot:Vec3
 }>();
 /** Genuine SOURCE weapon-ready no-aim and physical-stillness witness;
  * B1-B4 may reuse existing original goals, never fabricate paint or feet. */
 private readonly p2BTeamDroughtFoot=new Map<string,{
  firstStillNativeTick:number;nativeTick:number;foot:Vec3;
  stillAnchor:Vec3;misses:number
 }>();
 private readonly p2BTeamLastFullRouteAuditTick=new Map<string,number>();
 /** Original-source CPU recovery intent; based only on its native HP. */
 private readonly originalSourceRecoveryIntent=new Set<string>();
 private auditedTargets=0;
 private realGoalRequests=0;
 private readonly f4LocalCombatProposals={attempts:0,candidateCount:0,admitted:0};
 private heldRequests=0;
 private engagementGoalRequests=0;
 private b137RealCandidateChecks=0;
 private b169SourceAdvanceGuardChecks=0;
 private b169NativeAdvanceGuardTargets=0;
 private b169RejectedUnsafeOrUnreachableGoals=0;
 private b199ActualCollisionReliefChecks=0;
 private b199OriginalNativeReliefGoals=0;
 private b199RejectedUnsafeReliefPaths=0;
 private b169HumanUpperGrounded=false;
 private b171AllySyncPracticeRunning=false;
 /** Real user C press only, existing SOURCE A1 co-op. */
 private b471AllyOrder:{
  requestedTick:number;goal:Vec3|null;
  realAllyFootAtApproval:Vec3|null
 }|null=null;
 private b471OrderStatus:'OFF'|'HOLD'|'REQUESTED'|'MOVING'|'ARRIVED'|'EXPIRED'='OFF';
 /** Authoritative cause of the LAST genuine B471 decision. A key request
  * is not proof that an original Recast/Rapier route was granted. */
 private b471SourceDecision:
  'NOT_REQUESTED'|'REQUESTED_ORIGINAL_CHECK'|'ORIGINAL_GOAL_GRANTED'|
  'ORIGINAL_ARRIVAL'|'PHYSICAL_SOURCE_HOLD'|
  'NO_VERIFIED_FRESH_SOURCE_TARGET'|'NO_VERIFIED_ORIGINAL_PATH'|
  'ORIGINAL_ARRIVAL_UNSUPPORTED'|'ORIGINAL_PATH_LOST'|
  'SOURCE_ORDER_EXPIRED'='NOT_REQUESTED';
 private b471GenuineKeyRequests=0;
 /** B485 only for true B441 player-C-key: never a fake Crowd order. */
 private b485LastRealB441KeyTick:number|null=null;
 private b471StrictlyApprovedOriginalGoals=0;
 private b471ActualNativeGoalRequests=0;
 private b471RejectedOriginalRoutes=0;
 private b471ActualOriginalArrivals=0;
 /** Last actual original SOURCE A1 C-order arrival: old physical goal
  * and real native tick. This is not a new Crowd navigation request. */
 private b471ArrivedOriginalDwell:{
  goal:Vec3;arrivalTick:number
 }|null=null;
 /** Genuine Recast/Rapier approvals for OWN-center goals with fresh SOURCE
  * neighbor ink. Never a claimed ink impact or official Turf score. */
 private b471ApprovedOriginalNeighborhoodInkGoals=0;
 private b137ApprovedNativeRallies=0;
 private b137UnsafeOrUnsupportedRallies=0;
 private b137MissingSourceFloorProof=0;
 private b142OriginalStandoffGoalsApproved=0;
 private b142UnsafeStandoffGoalsDenied=0;
 private b143ReauthorizedStableStandoffGoals=0;
 private b143UnsafeOrStaleGoalHoldsRejected=0;
 private b150SourceCandidateSamples=0;
 private b150ApprovedInkAims=0;
 private b153DiversifiedAimApprovals=0;
 private b151LastSupportInkProbeTick=-1;
 private b143ApprovedNativeAllyGoal:{
  readonly target:Vec3;readonly humanFoot:Vec3;readonly lastCheckedTick:number
 }|null=null;
 private readonly b137ActualHumanFoot=new Vec3();
 private b137HumanFootValid=false;
 private readonly b192NativeHumanFoot=new Vec3();
 private b192HumanAliveGrounded=false;
 // Real grounded player KCC mode for current SOURCE tactical tick.
 private b192NativeHumanMode:'HUMAN'|'SQUID'='HUMAN';
 private b192HumanTick=-1;
 private b192ApprovedHumanCombatGoals=0;
 private b192RejectedHumanCombatGoals=0;
 private b137NativeTick=-1;
 private sameSourceEnemyCandidates=0;
 private deniedNativeEnemyPaths=0;
 private sourceEndpointProbes=0;
 private nativeRouteChecks=0;
 private nativeRouteRayProbes=0;
 private rejectedUnsupportedNativeRoutes=0;
 private unauditedPatrolRouteRequests=0;
 private rejectedUnsupportedGoals=0;
 private deniedUnsupportedEnemyFeet=0;
 private travelMeters=0;
 private readonly realGroundTravelMetersByActor=new Map<string,number>();
 private groundedFreeCombatCpuSamples=0;
 private nearlyStationaryGroundedCpuSamples=0;
 private requestedGoalDirectMeters=0;
 private requestedGoalNativePathMeters=0;
 private requestedGoalLongHops=0;
 private requestedGoalShortHops=0;
 private requestedGoalLengthsSampled=0;
 private trulyNewOriginalGoalSelections=0;
 private newGoalDirectMeters=0;
 private newGoalNativePathMeters=0;
 private newGoalShortHops=0;
 private newGoalLongHops=0;
 private readonly b34StationarySourceTicks=new Map<string,number>();
 private stalledOriginalGoalReconsiderations=0;
 private approvedAlternativeOriginalGoalsAfterStall=0;
 private continuedPreviouslyApprovedGoalRequests=0;
 private switchedGoalBeforePreviousArrival=0;
 private actualOriginalInkOwnershipLookups=0;
 private actualOriginalInkOwnershipSampled=0;
 private realPaintAwareGoalsAccepted=0;
 private paintAwareNonOwnedGoalsAccepted=0;
 private paintAwareOwnGoalsAccepted=0;
 private paintAwareUnknownInkGoalsAccepted=0;
 private readonly physicallyFalling=new Set<string>();
 private readonly physicallyRejoined=new Set<string>();
 /** A post-splat CPU must earn a NEW native original first drop. */
 private readonly respawnOriginalDrops=new Set<string>();
 private readonly previousLife=new Map<string,'ACTIVE'|'SPLATTED'>();
 private respawnOriginalDetected=0;
 private respawnOriginalGoalRequests=0;
 private respawnOriginalRejoins=0;
 private respawnUnsafeReturnHolds=0;
 private readonly cleared=new Set<string>();
 private readonly released=new Set<string>();
 private readonly previous=new Map<string,string>();
 private readonly previousFeet=new Map<string,Vec3>();
 private readonly lastMoved=new Map<string,number>();
 /** Explicit opt-in; only Recast targets from immutable source links. */
 private readonly b93UpperDetours=new Map<string,{
  linkId:string;sourceGoal:StageVector3;originalLanding:StageVector3;
  upperStart:StageVector3;escapeFoot:StageVector3|null;
  phase:'ESCAPE'|'APPROACH'|'DROP'
 }>();
 private freeCombat=false;
 private f4WholeSupport:((id:string,foot:Vec3)=>boolean)|null=null;
 private f4WholeProjection:((foot:Vec3,point:Readonly<{x:number;y:number;z:number}>)=>boolean)|null=null;
 private readonly f4WholeDrops=new Map<Team.A|Team.B,{approach:Vec3;landing:Vec3}>();
 private readonly f4WholeIngress=new Map<number,readonly StageVector3[]>();
 private readonly f4WholeGoals=new Map<string,{
  point:Vec3;issued:number;local:boolean;bestDistance:number;advanced:number;
  opponent?:string;recovering?:boolean;patrolTrail?:PatrolPoint[];patrolVeto?:boolean
 }>();
 private readonly f4LastSeenOpponent=new Map<string,{id:string;point:Vec3;tick:number}>();
 private readonly f4WholeDirections=new Map<string,number>();
 private readonly f4PatrolNavigation=new F4PatrolNavigation();
 private readonly f4PatrolSurvey=new F4PatrolSurvey();
 private f4PlayableRecovery=false;
 public enableF4PlayableRecovery():void{this.f4PlayableRecovery=true;}

 constructor(
  private readonly stage:StageDefinition,private nav:RecastStageNavigation,
  spawns:SourceSpawnPlan,private readonly bots:readonly F3TrafficCpu[],
  private readonly physics?:RapierStagePhysics,
  private readonly sourceInk?:GameplayInkSystem,
  private readonly enablePaintAwarePatrol=false,
  private readonly enableStableSourceGoal=false,
  private readonly enableB34SourceStallRecovery=false,
  private readonly enableB93UpperDetour=false,
  private readonly enableB137OriginalAllyRally=false,
  private readonly enableB150AllySupportInk=false,
  private readonly enableB192HumanCombat=false,
  private readonly enableB199PlayerCoopCollisionRecovery=false,
  private readonly enableB441SourceFrontline=false,
  /** B448 separate research-only, never enabled by B441 alone. */
  private readonly enableB448A3LiveOriginalFront=false,
  /** True ONLY when the real original-source B214 native paint/HP economy is enabled. */
  private readonly enableOriginalSourceBattleRecovery=false
 ){
  this.routePlan=planT21F2SourceDropRoutes(stage,nav,spawns);
  if(isT21F4ResearchStage(stage)&&!isT21F4OriginalTerrainStage(stage)){
   const experiment=buildT21F4PhotoRouteExperiment();
   this.f4GuideByTeam.set(Team.A,
    t21F4PlayableCorridorGuide(experiment.repairs,'POSITIVE_Z'));
   this.f4GuideByTeam.set(Team.B,
    t21F4PlayableCorridorGuide(experiment.repairs,'NEGATIVE_Z'));
  }
  if(bots.length!==7||new Set(bots.map(b=>b.id)).size!==7)
   throw Error('T21_F3_REAL_CPU_INVENTORY_REQUIRED');
  for(const bot of bots){
   const route=this.routeFor(bot.id);
   if(bot.position.distance(new Vec3(...route.start))>.20)
    throw Error('T21_F3_CPU_ORIGINAL_SPAWN_DRIFT_'+bot.id);
   const side=bot.team===Team.A?sourceSides[0]:sourceSides[1];
   const ramp=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>
    p.id==='right-low-ramp-'+side);
   if(ramp?.expectation!=='MUST_REACH')
    throw Error('T21_F3_ORIGINAL_RAMP_MISSING_'+side);
   const start=new Vec3(...route.originalLanding);
   const dest=[ramp.to,ramp.from].find(p=>
    nav.auditPath(start,new Vec3(...p)).reachedTarget&&
    Math.hypot(p[0]-start.x,p[2]-start.z)>2);
   if(!dest)throw Error('T21_F3_SOURCE_EGRESS_UNSUPPORTED_'+bot.id);
   this.egress.set(bot.id,dest);
   // Choose only actual, original source-backed LOWER geometry on this
   // side of the still-unbound underpass. A source authored paint polygon
   // alone does NOT prove traversal; every candidate must pass Recast.
   const sideSign=bot.team===Team.A?1:-1;
   const roots=[...stage.paintSurfaces.map(s=>s.center),
    route.originalLanding,ramp.from,ramp.to,dest];
   const targets:Vec3[]=[];
   for(const point of roots){
    if(point[2]*sideSign<33||point[1]<2.7||point[1]>5.25)
      continue;
    const target=this.nav.closestPoint(new Vec3(...point));
    if(![target.x,target.y,target.z].every(Number.isFinite)||
       Math.hypot(target.x-point[0],target.y-point[1],
         target.z-point[2])>.22)continue;
    const native=this.nav.auditPath(new Vec3(...route.originalLanding),
      new Vec3(target.x,target.y,target.z));
    if(!native.reachedTarget||native.endSnapDistanceMeters>.22||
       native.startSnapDistanceMeters>.22||native.pointCount===0)
      continue;
    if(target.z*sideSign<33||target.y<2.7||target.y>5.25)
      continue;
    if(targets.some(p=>p.distance(new Vec3(target.x,target.y,target.z))<1.6))
      continue;
    // Recast reachability does not imply an existing physical floor.
    if(!this.hasSourceFootSupport(target)){
     this.rejectedUnsupportedGoals++;continue;
    }
    targets.push(new Vec3(target.x,target.y,target.z));
   }
   // Deterministic source-only loop, no new navigation links. The
   // original unbound underpass gap can never be an intermediate goal.
   targets.sort((a,b)=>b.z*sideSign-a.z*sideSign||
     a.x-b.x);
   this.patrolGoals.set(bot.id,targets);
   // B441 is research-only. The ordinary F3 patrol is unchanged. Every
   // proposed coordinate comes from an already REGISTERED original floor,
   // then gets both real SOURCE Rapier + full native Recast verification.
   // Neither a polygon vertex nor a Recast waypoint grants terrain.
   if(this.enableB441SourceFrontline&&this.physics&&bot.id!=='A1'){
    const verified:Vec3[]=[];
    const proposals=proposeB441OriginalFrontline(stage,
      bot.team===Team.A?'A':'B');
    const gate:B445RealSourceGoalGate={
     id:bot.id,actualOriginalLanding:[start.x,start.y,start.z],
     originalFloorProposals:proposals.length,inspectedProposals:0,
     rejectedOriginalRapierOrBoundary:0,
     rejectedNativeRecastOrOriginalPath:0,
     rejectedNativeUnreached:0,rejectedNativeStartSnap:0,
     rejectedNativeEndSnap:0,rejectedNativeIntermediateOriginalSupport:0,
     strictlyApprovedGoals:0,approvedOriginalGoals:[],
     runtimeChooseInvocations:0,runtimeNoOriginalFrontGoals:0,
     runtimeNearExistingGoal:0,runtimeUnsupportedGoalFoot:0,
     runtimeUnsupportedNativePath:0,runtimeTrueOriginalGoalRequests:0
    };
    this.b445FrontlineGates.set(bot.id,gate);
    for(const proposal of proposals){
     gate.inspectedProposals++;
     this.b441ProposalsChecked++;
     const goal=new Vec3(...proposal.point);
     const ray=this.sourceNativeCharacterFootHit(goal);
     const flat=ray?inspectB130OriginalFlatSource({
      nativeTick:0,
      actualRapierBody:[goal.x,goal.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
      actualRapierSupportId:ray.solidId}):null;
     if(!ray||ray.solidId!==proposal.sourceSolidId||
        !flat?.insideRegisteredOriginalXZFootprint||
        !flat.originalFlatVerticalBandWithin22cm||
        flat.distanceToOriginalPolygonBoundaryMeters<.75){
      gate.rejectedOriginalRapierOrBoundary++;
      this.b441UnsafeOrUnreachableHolds++;continue;
     }
     const route=this.nav.auditPath(start,goal);
     // B446: keep every old safety cutoff EXACTLY the same, recording
     // the FIRST rejection reason. The short circuit order is unchanged.
     const nativeFailure=!route.reachedTarget?'UNREACHED':
      route.startSnapDistanceMeters>.20?'START_SNAP':
      route.endSnapDistanceMeters>.20?'END_SNAP':
      !this.hasSourceSupportedRoute(route,sideSign)?'UNSUPPORTED_PATH':null;
     if(nativeFailure){
      gate.rejectedNativeRecastOrOriginalPath++;
      if(nativeFailure==='UNREACHED')gate.rejectedNativeUnreached++;
      else if(nativeFailure==='START_SNAP')gate.rejectedNativeStartSnap++;
      else if(nativeFailure==='END_SNAP')gate.rejectedNativeEndSnap++;
      else gate.rejectedNativeIntermediateOriginalSupport++;
      this.b441UnsafeOrUnreachableHolds++;continue;
     }
     gate.strictlyApprovedGoals++;
     gate.approvedOriginalGoals.push([goal.x,goal.y,goal.z]);
     verified.push(goal);
     this.b441StrictGoalsAvailable++;
     const front=Math.abs(goal.z);
     this.b441ClosestApprovedFrontAbsZ=
      this.b441ClosestApprovedFrontAbsZ===null?front:
       Math.min(this.b441ClosestApprovedFrontAbsZ,front);
     if(verified.length===2)break;
    }
    this.b441FrontGoals.set(bot.id,verified);
   }
   this.patrolIndex.set(bot.id,-1);
   this.auditedTargets+=targets.length;
   this.previous.set(bot.id,bot.mobilityState);
   this.previousLife.set(bot.id,bot.lifeState??'ACTIVE');
   this.previousFeet.set(bot.id,bot.position.clone());
   bot.agent?.resetMoveTarget();
  }
 }

 /** SOURCE-only observed registered HUMAN floor. Bullets passing through
  * a genuine GRATE are not evidence of a hole under a CPU. Never invents
  * a collider, authorizes a route or changes the original stage. */
 private sourceNativeCharacterFootHit(
  foot:Readonly<{x:number;y:number;z:number}>
 ){
  if(!this.physics||![foot.x,foot.y,foot.z].every(Number.isFinite))
   return null;
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const hit=this.physics.castCharacterFootSupport(
   new Vec3(foot.x,foot.y+offset,foot.z),offset,'HUMAN');
  return hit&&Math.abs(hit.point.y-foot.y)<=.25&&
   (this.f4WholeSupport?this.physics.hasF4WholeResearchTrimesh:
    this.stage.solids.some(s=>s.id===hit.solidId))?hit:null;
 }

 /** True registered Rapier support at a SOURCE endpoint, not a whole
  * Recast path/capsule clearance authorization. */
 private hasSourceFootSupport(foot:Readonly<{x:number;y:number;z:number}>):boolean{
  this.sourceEndpointProbes++;
  return this.sourceNativeCharacterFootHit(foot)!==null;
 }

 /** W10-B4: fail closed on any unsupported intermediate Recast waypoint.
  * Applies only after the genuine seven source-backed CPU first drops.
  * Does not create terrain, navigation, or synthetic actor positions.
  * Endpoint ray support is not a complete KCC capsule certificate. */
 private hasSourceSupportedRoute(
  audit:ReturnType<RecastStageNavigation['auditPath']>,sideSign:number,
  actualNativeStart?:Readonly<{x:number;y:number;z:number}>,
  realKccBlockedRecovery=false,
  originalRampHeightBiasOnly=false
 ):boolean{
  this.nativeRouteChecks++;
  const original=audit.nativePathPoints;
  if(!this.physics||original.length===0)return false;
  // The real Rapier KCC foot may differ by <=2cm from Recast's
  // projected start. Genuine 90s B4 on the registered ramp differs by
  // 3.973cm and all six ORIGINAL routes were refused BEFORE any static
  // route sampling. ONLY after 90 genuinely rejected KCC steps, allow
  // <=5cm start projection drift; still use the REAL physical foot as
  // the first point and recheck every original 0.30m support sample.
  // This never changes Recast waypoints, actor motion, source geometry,
  // or the 25cm native Rapier support gap.
  let points:readonly Readonly<{x:number;y:number;z:number}>[]=original;
  if(actualNativeStart){
   const projected=original[0]!;
   const snap=Math.hypot(projected.x-actualNativeStart.x,
    projected.y-actualNativeStart.y,
    projected.z-actualNativeStart.z);
   if(!Number.isFinite(snap)||
      snap>(realKccBlockedRecovery?.05:.02)||
      !this.hasSourceFootSupport(actualNativeStart))return false;
   points=[actualNativeStart,...original.slice(1)];
  }
  const probe=(point:Readonly<{x:number;y:number;z:number}>):boolean=>{
   this.nativeRouteRayProbes++;
   if(![point.x,point.y,point.z].every(Number.isFinite)||
      point.z*sideSign<33||point.y<2.5||point.y>5.5)return false;
   if(this.hasSourceFootSupport(point))return true;
   // An original native Recast polyline LINEAR Y is not its closest
   // original NavMesh Y at the same source XZ. Recover only the pinned
   // mirrored first-drop landing face if genuine HUMAN Rapier floor support
   // at native projected Y is within the unchanged 0.25m threshold.
   // No source position, Actor, NavLink, physical step or scoring changes.
   if(this.nav&&originalNativeLandingFootReprojection(
     this.stage,this.physics!,this.nav,point,
     sideSign===1?1:-1))return true;
   // Only the registered ORIGINAL right-low 4.5m floor; the original
   // Recast/Rapier Y and XZ must agree. No new path or KCC authority.
   if(this.nav&&originalNativeRightLowFootReprojection(
     this.stage,this.physics!,this.nav,point,
     sideSign===1?1:-1))return true;
   // The same straight polyline can also rise well above the exact
   // ORIGINAL FloorConcrete03 slope. Recheck native nearest height
   // against the registered source triangles and the REAL Rapier
   // HUMAN collider at this XZ, not a fabricated slope or bigger gap.
   if(this.nav&&originalNativeRampFootReprojection(
     this.stage,this.physics!,this.nav,point,
     sideSign===1?1:-1))return true;
   // A real B2 Ramp KCC foot remains supported, but Recast can float
   // 25.897cm above original registered ramp collision. Never promote
   // that NAV height as a CPU foot or relax the actual 25cm PHYSICAL
   // support gate. Only one live B2 ramp-local GOAL may use the
   // 3cm-bounded original Rapier height projection for read-only route
   // evaluation. Actual 60Hz shared Rapier KCC still vetoes every step.
   if(!originalRampHeightBiasOnly||!actualNativeStart||
      !realKccBlockedRecovery||!this.enableB441SourceFrontline||
      sideSign!==-1||!this.physics||
      this.sourceNativeCharacterFootHit(actualNativeStart)?.solidId!==
       'UndertowT21D:right-low-route-ramp-negative-z')
     return false;
   const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   const hit=this.physics.castCharacterFootSupport(
    new Vec3(point.x,point.y+offset,point.z),offset,'HUMAN');
   const gap=hit?point.y-hit.point.y:Infinity;
   if(!hit||
      hit.solidId!=='UndertowT21D:right-low-route-ramp-negative-z'||
      gap<=.25||gap>.27)return false;
   const physicalProbe={x:point.x,y:hit.point.y+.24,z:point.z};
   if(point.y-physicalProbe.y<=0||point.y-physicalProbe.y>.03)
    return false;
   return this.sourceNativeCharacterFootHit(physicalProbe)?.solidId===
     hit.solidId;
  };
  if(points.length===1)return probe(points[0]!);
  for(let leg=0;leg+1<points.length;leg++){
   const a=points[leg]!,b=points[leg+1]!;
   const meters=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
   if(!Number.isFinite(meters))return false;
   const segments=Math.max(1,Math.ceil(meters/.30));
   for(let i=leg===0?0:1;i<=segments;i++){
    const f=i/segments;
    if(!probe({x:a.x+(b.x-a.x)*f,
     y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f}))return false;
   }
  }
  return true;
 }

 /** F4: native-source B2/B4 can become stuck ON the registered
  * FloorConcrete03 ramp. On a genuine 36+ Rapier KCC stall, try only
  * existing ramp-internal points. Use existing 5cm real-foot start
  * reconciliation plus full original Recast and 0.30m/.25m Rapier
  * checks. No floor, path, actor, score or original height edits. */
 private tryOriginalRampLocalRecovery(
  id:string,realFoot:Vec3,out:Vec3
 ):boolean{
  if(!this.enableB441SourceFrontline||!this.physics||
     (id!=='B2'&&id!=='B3'&&id!=='B4')||
     (id!=='B3'&&(this.b441FrontGoals.get(id)?.length??0)!==0)||
     this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     this.stage.solids.length!==25||
     this.stage.paintSurfaces.length!==17||
     this.stage.navigationLinks?.length!==26||
     this.stage.paintSurfaces.some(p=>
      (p.flags&SurfaceFlags.Scoreable)!==0))return false;
  const bot=this.bots.find(b=>b.id===id);
  if(!bot||!sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined))
   return false;
  const sourceId='UndertowT21D:right-low-route-ramp-negative-z';
  if(this.sourceNativeCharacterFootHit(realFoot)?.solidId!==sourceId)
   return false;
  const proposals=proposeB441OriginalRampLocalGoals(this.stage,'B');
  if(!proposals.length)return false;
  const prior=this.b441OriginalRampGoal?.get(id);
  // Genuine live native B2/B3/B4 feet reached 0.29-0.69m from
  // original ramp goals. The old 1.2m "arrived" cancels a real
  // in-flight goal before a physical foot gets to its endpoint.
  // Never synthesize arrival from nav projection: require <=30cm.
  if(prior&&realFoot.distance(prior)<=.30)
   this.b441OriginalRampGoal?.delete(id);
  const inFlight=this.b441OriginalRampGoal?.get(id);
  // A true SOURCE in-flight ramp target can itself be physically denied
  // for 90+ genuine Rapier KCC samples while the actor has not moved
  // for 120 native ticks. Retaining it forever prevents alternatives
  // that are ALREADY present on this same authenticated source ramp.
  // Never infer a bad goal from aim drought, Crowd pause or proximity.
  // Retest a distinct EXISTING ramp target only after this evidence.
  const lastRealTravel=this.lastMoved?.get(id);
  const stalledInFlight=!!inFlight&&
   // A second goal cannot immediately inherit the PREVIOUS target's
   // observed KCC denials. Keep the new genuine native goal for at
   // least 120 further 60Hz ticks before a second alternate search.
   // No physical foot, route, collision gate or denial count is changed.
   this.b137NativeTick-
    (this.b441OriginalRampLastAuditTick?.get(id)??-999999)>=120&&
   (this.realKccRejectedSteps.get(id)??0)>=90&&
   Number.isSafeInteger(lastRealTravel)&&lastRealTravel!==undefined&&
   lastRealTravel>0&&
   Number.isSafeInteger(this.b137NativeTick)&&
   this.b137NativeTick>=lastRealTravel+120&&
   this.physicallyRejoined.has(id)&&
   realFoot.distance(inFlight)>.30;
  // True 720-tick SOURCE B2/B4 congestion recovery improved actual
  // 60Hz B4 movement; B3 nevertheless remained grounded on the SAME
  // original ramp, ~0.61-0.64m from B2 for 200+ native ticks.
  // Do not overwrite B3's existing independently approved distant
  // FRONT goal just because a teammate is nearby: only try an already
  // existing ORIGINAL ramp goal when actual KCC foot has stayed still
  // for 120 ticks and that goal has NOT already been reached.
  // This is a candidate-trigger, never a new Recast/Rapier permission.
  const b3InFlightFront=this.b443OriginalGoalLocks?.get(id)?.target;
  const unfinishedB3Front=id!=='B3'||!b3InFlightFront||
   Math.hypot(b3InFlightFront.x-realFoot.x,
    b3InFlightFront.y-realFoot.y,b3InFlightFront.z-realFoot.z)>=1.5;
  // In true #43882733229, B2 stayed physically stationary on the
  // ORIGINAL ramp for 5+ seconds even after B3/B4 moved away. A REAL
  // 120-tick still foot can TRY an existing ramp-local Recast goal
  // without needing an imaginary new actor contact or floor.
  const trulyStationaryB2Ramp=id==='B2'&&
   (this.b441FrontGoals.get(id)?.length??0)===0&&
   !inFlight&&Number.isSafeInteger(lastRealTravel)&&
   lastRealTravel!==undefined&&lastRealTravel>0&&
   this.b137NativeTick-lastRealTravel>=120&&
   this.physicallyRejoined.has(id)&&
   this.hasSourceFootSupport(realFoot);
  const crowdedStationaryOriginalFoot=
   (id==='B2'||id==='B3'||id==='B4')&&unfinishedB3Front&&
   Number.isSafeInteger(lastRealTravel)&&lastRealTravel!==undefined&&
   lastRealTravel>0&&this.b137NativeTick>=lastRealTravel+120&&
   this.bots.some(mate=>{
    if(mate.id===id||mate.team!==bot.team||
       !sourceNativeLiveRejoinedCpu(mate,this.physicallyRejoined)||
       mate.mobilityState!=='GROUND')return false;
    const separation=Math.hypot(
     mate.position.x-realFoot.x,mate.position.z-realFoot.z);
    return Math.abs(mate.position.y-realFoot.y)<.60&&
      separation>=.57&&separation<=1.3;
   });
  // B3's original, genuine unsupported KCC denial remains sufficient.
  // Without it, only the separate physical-foot congestion witness above
  // can trigger a TRY; B3 still must pass the unchanged full route below.
  if(id==='B3'&&!inFlight){
   const witness=this.realKccB3Unsupported?.get(id);
   const trueUnsupported=!!witness&&
      this.b137NativeTick>=witness.nativeTick&&
      this.b137NativeTick-witness.nativeTick<=B34_GROUNDED_STALL_TICKS&&
      realFoot.distance(witness.foot)<=.22;
   if(!trueUnsupported&&!crowdedStationaryOriginalFoot)return false;
  }
  if(!inFlight&&(this.realKccRejectedSteps.get(id)??0)<
      B34_GROUNDED_STALL_TICKS&&!crowdedStationaryOriginalFoot&&
      !trulyStationaryB2Ramp)return false;
  if(!inFlight||stalledInFlight){
   const previous=this.b441OriginalRampLastAuditTick?.get(id)??-999999;
   if(this.b137NativeTick-previous<60)return false;
   this.b441OriginalRampLastAuditTick?.set(id,this.b137NativeTick);
  }
  const options=inFlight&&!stalledInFlight?
   proposals.filter(p=>new Vec3(...p.point).distance(inFlight)<.001):
   [...proposals].filter(p=>!stalledInFlight||
    new Vec3(...p.point).distance(inFlight!)>=1.5).sort((a,b)=>
    Math.abs(new Vec3(...a.point).distance(realFoot)-2.5)-
    Math.abs(new Vec3(...b.point).distance(realFoot)-2.5));
  for(const proposal of options){
   if(proposal.sourceSolidId!==sourceId)continue;
   const goal=new Vec3(...proposal.point);
   // Exclude new close-range candidates, but let an in-flight
   // goal finish its final native-supported step. The same real
   // Recast path, 0.30m original Rapier support and actor-block
   // validation below remain mandatory.
   if(((!inFlight||stalledInFlight)&&goal.distance(realFoot)<1.5)||
      goal.z> -33||
      this.sourceNativeCharacterFootHit(goal)?.solidId!==sourceId)
    continue;
   const route=this.nav.auditPath(realFoot,goal);
   if(!route.reachedTarget||route.startSnapDistanceMeters>.20||
      route.endSnapDistanceMeters>.20||
      !this.hasSourceSupportedRoute(route,-1,realFoot,true,
       id==='B2'&&(trulyStationaryB2Ramp||!!inFlight))||
      this.kccActorBlocksOriginalRoute(id,realFoot,route)){
    this.b441OriginalRampRejected=(this.b441OriginalRampRejected??0)+1;
    continue;
   }
   if(inFlight&&!stalledInFlight)this.b441OriginalRampRetentions=
    (this.b441OriginalRampRetentions??0)+1;
   else{
    this.b441OriginalRampApprovals=(this.b441OriginalRampApprovals??0)+1;
    this.b441OriginalRampGoal?.set(id,goal.clone());
   }
   out.copy(goal);this.realGoalRequests++;
   return true;
  }
  // No alternate passed: do not call a failed route a recovery, and do
  // not erase the formerly verified in-flight destination merely because
  // this one bounded alternate search found no valid original path.
  if(inFlight&&!stalledInFlight)this.b441OriginalRampGoal?.delete(id);
  return false;
 }
 /** B150 source-only real A1 teammate ink support. Real source foot,
  * approved B142/B143 station, same original Rapier solid, original
  * footprint margin and genuinely unowned Paintable cells are mandatory.
  * Never mutate player, bot, NavMesh, stage or scoreable authority.
  */
 chooseSourceAllySupportInkTarget(id:string,realFoot:Vec3,out:Vec3):boolean{
  const bot=this.bots.find(b=>b.id===id);
  const approved=this.b143ApprovedNativeAllyGoal;
  if(!this.enableB150AllySupportInk||
     !this.enableB137OriginalAllyRally||id!=='A1'||
     !bot||bot.team!==Team.A||bot.lifeState==='SPLATTED'||
     bot.mobilityState!=='GROUND'||!bot.agent||
     !this.freeCombat||!this.physicallyRejoined.has('A1')||
     !this.b137HumanFootValid||!this.sourceInk||!this.physics||!approved||
     !bot.weaponId||
     this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     this.stage.solids.length!==25||this.stage.paintSurfaces.length!==17||
     this.stage.navigationLinks?.length!==26||
     this.stage.paintSurfaces.some(s=>(s.flags & SurfaceFlags.Scoreable)!==0))
   return false;
  const human=this.b137ActualHumanFoot;
  if(!eligibleB150OriginalAllyInk({
   nativeTick:this.b137NativeTick,approvedTick:approved.lastCheckedTick,
   cpu:realFoot,human,approvedGoal:approved.target,
   approvedHuman:approved.humanFoot
  }))return false;
  // The previous B150 loop read 5,052 candidates but approved only 3.
  // Avoid repeating 42 genuine CPU/Rapier probes at every 60Hz frame.
  if(this.b137NativeTick-this.b151LastSupportInkProbeTick<8)return false;
  this.b151LastSupportInkProbeTick=this.b137NativeTick;
  const hit=(p:Readonly<{x:number;y:number;z:number}>)=>
   this.sourceNativeCharacterFootHit(p);
  const flat=(p:Vec3,id:string)=>{
   const f=inspectB130OriginalFlatSource({
    nativeTick:this.b137NativeTick,
    actualRapierBody:[p.x,p.y+
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,p.z],
    actualRapierSupportId:id
   });
   return !!f?.insideRegisteredOriginalXZFootprint&&
    f.originalFlatVerticalBandWithin22cm&&
    f.distanceToOriginalPolygonBoundaryMeters>=.75;
  };
  const source=hit(realFoot),humanSource=hit(human);
  if(!source||!humanSource||
     source.solidId!==humanSource.solidId||
     !flat(realFoot,source.solidId)||
     !flat(human,humanSource.solidId))return false;
  const nativeWeaponRange=cpuWeaponRangeMeters(weaponProfile(bot.weaponId, Boolean(this.f4WholeSupport)));
  if(!Number.isFinite(nativeWeaponRange)||nativeWeaponRange<=0)return false;
  const muzzle=new Vec3(realFoot.x,
   realFoot.y+GAME_CONFIG.cpu.muzzleHeightMeters,realFoot.z);
  const candidates=b150OriginalAllyInkCandidates(realFoot,human);
  const diversified=diversifyB153OriginalAllyInkCandidates(
   candidates,this.b150ApprovedInkAims);
  for(const samplePoint of diversified){
   this.b150SourceCandidateSamples++;
   const sample=this.sourceInk.sampleWorld(
    new Vec3(samplePoint.x,samplePoint.y+.10,samplePoint.z),
    .28,SurfaceFlags.Paintable,SurfaceFlags.Wall);
   if(!sample||sample.surface.isScoreable)continue;
   // A1's first genuine impact paints the sampled ownerGrid CENTER.
   // Continue cooperating at a distinct genuinely unpainted cell on
   // the SAME already registered original surface; never shoot OWN.
   const target=b150ActualUnownedAllyPaintAim(sample,bot.team);
   if(!target||![target.x,target.y,target.z].every(Number.isFinite)||
      Math.hypot(target.x-human.x,target.z-human.z)<=2.6)continue;
   const targetHit=hit(target);
   if(!targetHit||targetHit.solidId!==source.solidId||
      Math.abs(targetHit.point.y-target.y)>.22||
      !flat(target,targetHit.solidId))continue;
   // Previously the first valid unowned source grid cell could be
   // OUTSIDE A1's actual equipped range, so CpuAgentSystem rejected it
   // after the selection loop and never tried the next legitimate aim.
   // Reject real original cover too; inspect a different EXISTING cell.
   const firstBlock=this.physics.castStageSegment(
    muzzle,target,'ink-projectile');
   if(!b150OriginalAllyNativeShotReachable(
      realFoot,target,nativeWeaponRange,source.solidId,firstBlock))continue;
   out.copy(target);
   if(this.b150ApprovedInkAims>0)this.b153DiversifiedAimApprovals++;
   this.b150ApprovedInkAims++;
   return true;
  }
  return false;
 }

 /** Arms only an actual player key during a REAL native ALLY_SYNC round.
  * Does not select a goal or write any actor / ink / clock. */
 b471RequestTruePlayerOriginalAllyCoverage(
  b485StrictActualB441Repeat=false
 ):boolean{
  // The same genuine native A1 cannot own two player-issued ORIGINAL
  // destination checks at once. B193 previously overwrote REQUESTED or
  // MOVING orders on a second *physical* C tap, even after OS autorepeat
  // was removed. Keep that real in-flight command/counters/foot intact;
  // a fresh C press is legal again only after B471 itself has ended it.
  // B441 also retains its independent 30-tick B485 terminal cooldown.
  if(this.b471AllyOrder)return false;
  // Separate B193 ALLY_SYNC retains its identical original B471 flow.
  // Only B441 real player commands enforce a 30-tick completed-order
  // cooldown. A key while MOVING cannot overwrite genuine A1 motion.
  if(b485StrictActualB441Repeat){
   if(!b485MayIssueNativeA1OriginalOrder({
    selected:this.enableB441SourceFrontline&&
     this.enableB137OriginalAllyRally&&this.enableB150AllySupportInk,
    nativeTick:this.b137NativeTick,
    lastRealKeyTick:this.b485LastRealB441KeyTick,
    genuineKeyRequests:this.b471GenuineKeyRequests,
    lastOrder:this.b471OrderStatus
   }))return false;
   this.b485LastRealB441KeyTick=this.b137NativeTick;
  }
  this.b471GenuineKeyRequests++;
  // A new REAL player key ends the prior completed-order dwell. Existing
  // strict repeat and source permissions were checked above.
  this.b471ArrivedOriginalDwell=null;
  const ally=this.bots.find(x=>x.id==='A1');
  const foot=ally?.position;
  const human=this.b137ActualHumanFoot;
  const permitted=!!ally&&!!foot&&!!this.sourceInk&&!!this.physics&&
   b471MayRequestActualA1SourceOrder(this.stage,{
    id:ally.id,team:ally.team===Team.A?'A':'B',
    nativeTick:this.b137NativeTick,
    coOpActuallyRunning:this.b171AllySyncPracticeRunning&&
     this.enableB137OriginalAllyRally&&this.enableB150AllySupportInk,
    actualAllyRejoined:sourceNativeLiveRejoinedCpu(
      ally,this.physicallyRejoined),
     actualAllyActiveGrounded:ally.lifeState==='ACTIVE'&&
      Number.isFinite(ally.hp)&&ally.hp!>0&&
      ally.mobilityState==='GROUND',
    trueHumanAliveGrounded:this.b137HumanFootValid,
    actualAllyFoot:[foot.x,foot.y,foot.z],
    actualHumanFoot:[human.x,human.y,human.z]
   })&&this.hasSourceFootSupport(foot)&&
   this.hasSourceFootSupport(human);
  if(!permitted){
   this.b471OrderStatus='HOLD';
   this.b471SourceDecision='PHYSICAL_SOURCE_HOLD';
   this.b471AllyOrder=null;
   return false;
  }
  this.b471AllyOrder={requestedTick:this.b137NativeTick,
   goal:null,realAllyFootAtApproval:null};
  this.b471OrderStatus='REQUESTED';
  this.b471SourceDecision='REQUESTED_ORIGINAL_CHECK';
  return true;
 }
 b471ReadOnlyAllyCoverageOrder(){
  return {
   status:this.b471OrderStatus,sourceDecision:this.b471SourceDecision,
   genuineKeyRequests:this.b471GenuineKeyRequests,
   b485LastRealB441KeyTick:this.b485LastRealB441KeyTick,
   b485RepeatReady:b485MayIssueNativeA1OriginalOrder({
    selected:this.enableB441SourceFrontline&&
     this.enableB137OriginalAllyRally&&this.enableB150AllySupportInk,
    nativeTick:this.b137NativeTick,
    lastRealKeyTick:this.b485LastRealB441KeyTick,
    genuineKeyRequests:this.b471GenuineKeyRequests,
    lastOrder:this.b471OrderStatus
   }),
   strictlyApprovedOriginalGoals:this.b471StrictlyApprovedOriginalGoals,
   actualNativeGoalRequests:this.b471ActualNativeGoalRequests,
   rejectedOriginalRoutes:this.b471RejectedOriginalRoutes,
   actualOriginalArrivals:this.b471ActualOriginalArrivals,
   approvedOriginalNeighborhoodInkGoals:
    this.b471ApprovedOriginalNeighborhoodInkGoals,
   requestedNativeTick:this.b471AllyOrder?.requestedTick??null,
   approvedRealAllyFoot:this.b471AllyOrder?.realAllyFootAtApproval?
    this.b471AllyOrder.realAllyFootAtApproval.toArray() as [number,number,number]:null,
   approvedOriginalGoal:this.b471AllyOrder?.goal?
    this.b471AllyOrder.goal.toArray() as [number,number,number]:null,
   officialWinner:'NONE' as const,actorInkScoreClockWrites:0 as const
  };
 }
 /** Two teammates may already be moving to the same truly approved
  * original SOURCE foot. Live actual actor positions and still-valid
  * B443 locks are preference only; the next source-goal approval retains
  * the unchanged native Rapier/Recast full-path and Actor collision veto. */
 private actualTeamCoveragePositions(id:string,team:Team.A|Team.B):Vec3[]{
  const existing:Vec3[]=[];
  for(const mate of this.bots){
   if(mate.id===id||mate.team!==team||
      mate.lifeState!=='ACTIVE'||mate.mobilityState!=='GROUND')continue;
   existing.push(mate.position);
   const locked=this.b443OriginalGoalLocks.get(mate.id);
   if(locked)existing.push(locked.target);
  }
  // F1/F2 original same-side teamwork: an actual PLAYER C order is
  // an in-flight, NATIVE-APPROVED destination too, not only A1's current
  // physical foot. Reserve it while A1 is genuinely moving, so A2/A3
  // can prefer other equally useful, already-authored source paint goals.
  // It grants no new route; every chosen CPU goal still goes through the
  // existing per-foot Recast/Rapier veto downstream.
  const a1=this.bots.find(m=>m.id==='A1');
  const actualA1Goal=this.b471AllyOrder?.goal;
  if(team===Team.A&&id!=='A1'&&
     this.b471OrderStatus==='MOVING'&&
     a1?.team===Team.A&&a1.lifeState==='ACTIVE'&&
     a1.mobilityState==='GROUND'&&this.physicallyRejoined.has('A1')&&
     actualA1Goal&&
     [actualA1Goal.x,actualA1Goal.y,actualA1Goal.z].every(Number.isFinite)&&
     actualA1Goal.z>=33)
   existing.push(actualA1Goal);
  return existing;
 }
 /** Only user-selected original SOURCE combat may improve the genuine
  * weapon-distance standoff. Other B421 callers retain the legacy 2m goal.
  * Every candidate still passes the existing Rapier/Recast full-path gate
  * in chooseSourceGoal; an optical ray alone grants NO movement authority. */
 private chooseActualSourceCombatGoal(
  path:Parameters<typeof b421RealEnemyStandoff>[0],
  enemyFoot:Parameters<typeof b421RealEnemyStandoff>[1],
  side:1|-1,bot:F3TrafficCpu,enemyIsActualHuman=false,
  routeCheck?:B421StandoffRouteCheck
 ){
  const physics=this.physics;
  // A B-side SOURCE pursuit target must still be the living, grounded
  // human measured THIS native tick. A previously cached SQUID mode or
  // stale body is not an original-geometry destination or LOS witness.
  if(enemyIsActualHuman&&
     (!this.b192HumanAliveGrounded||
      this.b192HumanTick!==this.b137NativeTick))return null;
  if(!this.enableB192HumanCombat||!physics||!bot.weaponId)
   return b421RealEnemyStandoff(path,enemyFoot,side,undefined,routeCheck);
  const profile=weaponProfile(bot.weaponId, Boolean(this.f4WholeSupport));
  // Ranged source weapon lanes only. Actual melee/roll actions remain
  // bound by the previous true 2m source-foot standoff.
  if(['ROLLER','BRUSH','SPLATANA'].includes(profile.weaponClass))
   return b421RealEnemyStandoff(path,enemyFoot,side,undefined,routeCheck);
  const squid=enemyIsActualHuman&&this.b192NativeHumanMode==='SQUID';
  const humanHitHeight=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+
   (squid?PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters:0);
  const humanHitSample=squid?
   Math.min(.2,PLAYER_CHARACTER_PHYSICS.squidRadiusMeters*.6):.25;
  const cpuHitHeights=GAME_CONFIG.cpu.hitSphereOffsetsMeters;
  const lane:B421OriginalWeaponLane={
   nativeWeaponRangeMeters:cpuWeaponRangeMeters(profile),
   nativeMuzzleHeightMeters:GAME_CONFIG.cpu.muzzleHeightMeters,
   // Match the same live capsule / sphere samples used when firing.
   enemyHitHeightMeters:enemyIsActualHuman?humanHitHeight:cpuHitHeights[1],
   enemyAlternateHitHeightsMeters:enemyIsActualHuman?
    [humanHitHeight+humanHitSample,humanHitHeight-humanHitSample]:
    [cpuHitHeights[2],cpuHitHeights[0]],
   originalStageRayBlocked:(from,to)=>!!physics.castStageSegment(
    new Vec3(from.x,from.y,from.z),
    new Vec3(to.x,to.y,to.z),'ink-projectile')
  };
  return b421RealEnemyStandoff(path,enemyFoot,side,lane,routeCheck);
 }

 /** A CPU walks only as far as a real firing position. The enemy's
  * remaining approach is irrelevant if the actual muzzle ray is clear. */
 private chooseReachableSourceCombatGoal(
  from:Vec3,route:ReturnType<RecastStageNavigation['auditPath']>,
  enemyFoot:Vec3,side:1|-1,bot:F3TrafficCpu,enemyIsActualHuman=false
 ):Vec3|null{
  const goal=this.chooseActualSourceCombatGoal(
   route.nativePathPoints,enemyFoot,side,bot,enemyIsActualHuman,{
    allowPartialFiringLane:!route.reachedTarget,
    admit:candidate=>{
     if(!this.hasSourceFootSupport(candidate))return false;
     const toGoal=this.nav.auditPath(from,new Vec3(candidate.x,candidate.y,candidate.z));
     return toGoal.reachedTarget&&toGoal.startSnapDistanceMeters<=.20&&
      toGoal.endSnapDistanceMeters<=.20&&this.hasSourceSupportedRoute(toGoal,side);
    },
    allowFallback:()=>route.reachedTarget&&this.hasSourceSupportedRoute(route,side)
   });
  return goal?new Vec3(goal.x,goal.y,goal.z):null;
 }

 /** An ORIGINAL goal can be preferred for painting only when true
  * ownerGrid cells, native weapon range, registered floor and the first
  * Rapier projectile blocker all predict a real paint opportunity.
  * This grants no shots, navigation, Actor motion, or official score. */
 private canPaintFromOriginalGoal(bot:F3TrafficCpu,goal:Vec3):boolean{
  if(!this.sourceInk||!this.physics||!bot.weaponId||
     !this.hasSourceFootSupport(goal))return false;
  const range=cpuWeaponRangeMeters(weaponProfile(bot.weaponId, Boolean(this.f4WholeSupport)));
  if(!Number.isFinite(range)||range<1.7)return false;
  const muzzle=new Vec3(goal.x,
   goal.y+GAME_CONFIG.cpu.muzzleHeightMeters,goal.z);
  // Bounded 40 ORIGINAL samples, only used during a live 120+ NO-AIM
  // drought. Every move still needs a separate full native path audit.
  for(const radius of [1.7,2.5,3.5,4.5,5.5]){
   if(radius>range)continue;
   for(let angle=0;angle<8;angle++){
    const theta=angle*Math.PI/4;
    const point=new Vec3(goal.x+radius*Math.cos(theta),
     goal.y+.10,goal.z+radius*Math.sin(theta));
    const sample=this.sourceInk.sampleWorld(point,.28,
     SurfaceFlags.Paintable,SurfaceFlags.Wall);
    if(!sample||!sample.surface.id.startsWith('UndertowT21D:')||
       sample.surface.isScoreable||
       (sample.flags&SurfaceFlags.Paintable)===0)continue;
    const surface=sample.surface;
    const x=Math.floor(sample.u/surface.cellSize);
    const y=Math.floor(sample.v/surface.cellSize);
    if(!surface.isCellActive(x,y))continue;
    const target=sample.owner===bot.team?
     b180OriginalSourceUnownedNeighborAim(sample,bot.team):
     surface.localToWorld(sample.u,sample.v);
    if(!target||![target.x,target.y,target.z].every(Number.isFinite)||
       muzzle.distance(target)>range)continue;
    const support=this.sourceNativeCharacterFootHit(target);
    if(!support||!this.stage.solids.some(s=>s.id===support.solidId)||
       Math.abs(support.point.y-target.y)>.25)continue;
    const block=this.physics.castStageSegment(muzzle,target,'ink-projectile');
    if(block&&(block.solidId!==support.solidId||
       block.point.distance(target)>.22))continue;
    return true;
   }
  }
  return false;
 }

 /** This method is reached only from the P2-only original weapon-ready
  * NO-AIM path. Store real B1 foot evidence without moving the actor. */
 noteRealSourcePaintAimDrought(id:string,
  actualFoot:Readonly<{x:number;y:number;z:number}>,
  consecutiveNoAimDecisions:number):void{
  if(!['B1','B2','B3','B4'].includes(id))return;
  if(consecutiveNoAimDecisions===0){
   this.p2BTeamDroughtFoot.delete(id);return;
  }
  const bot=this.bots.find(b=>b.id===id);
  if(!this.enableB441SourceFrontline||!this.freeCombat||
     !this.sourceInk||!bot||bot.team!==Team.B||
     bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||
     !bot.agent||!this.physicallyRejoined.has(id)||
     !Number.isSafeInteger(this.b137NativeTick)||
     this.b137NativeTick<0||
     !Number.isSafeInteger(consecutiveNoAimDecisions)||
     consecutiveNoAimDecisions<120||
     consecutiveNoAimDecisions%30!==0||
     ![actualFoot.x,actualFoot.y,actualFoot.z].every(Number.isFinite)||
     Math.hypot(bot.position.x-actualFoot.x,
      bot.position.y-actualFoot.y,bot.position.z-actualFoot.z)>.01)return;
  const old=this.p2BTeamDroughtFoot.get(id);
  // A weapon drought alone cannot imply a blocked Crowd/KCC move:
  // retain a 120+ tick stationary witness from genuine post-KCC feet.
  // Any actual >=0.22m displacement or decreasing/out-of-order count
  // starts a NEW physical observation window, not a fake stale stall.
  const samePhysicalStay=!!old&&
   this.b137NativeTick>old.nativeTick&&
   consecutiveNoAimDecisions>old.misses&&
   Math.hypot(old.stillAnchor.x-actualFoot.x,
    old.stillAnchor.y-actualFoot.y,
    old.stillAnchor.z-actualFoot.z)<=.22;
  this.p2BTeamDroughtFoot.set(id,{
   firstStillNativeTick:samePhysicalStay?
    old!.firstStillNativeTick:this.b137NativeTick,
   nativeTick:this.b137NativeTick,
   foot:new Vec3(actualFoot.x,actualFoot.y,actualFoot.z),
   stillAnchor:samePhysicalStay?old!.stillAnchor.clone():
    new Vec3(actualFoot.x,actualFoot.y,actualFoot.z),
   misses:consecutiveNoAimDecisions
  });
 }
 noteF4NativeGoalRejected(id:string,actualFoot:Readonly<{x:number;y:number;z:number}>,
  requestedGoal:Readonly<{x:number;y:number;z:number}>):void{
  const bot=this.bots.find(b=>b.id===id),goal=this.f4WholeGoals.get(id);
  if(!this.f4WholeSupport||!bot?.agent||!goal||goal.patrolVeto||
     bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||!Number.isFinite(bot.hp)||(bot.hp??0)<=0||
     ![actualFoot.x,actualFoot.y,actualFoot.z,requestedGoal.x,requestedGoal.y,requestedGoal.z].every(Number.isFinite)||
     bot.position.distance(new Vec3(actualFoot.x,actualFoot.y,actualFoot.z))>.01||
     goal.point.distance(new Vec3(requestedGoal.x,requestedGoal.y,requestedGoal.z))>.35||
     !this.f4WholeSupport(id,bot.position))return;
  // Only the rejected proposal is avoided; no fake KCC rejection or motion.
  this.f4PatrolNavigation.noteStalled(id,this.b137NativeTick,actualFoot,goal.point);
  goal.patrolVeto=true;
  goal.advanced=Math.min(goal.advanced,this.b137NativeTick-48);
 }
 /** Actual KCC rejected this original CPU's grounded 60Hz motion.
  * No guessed collision or teleported Crowd result can enter this count. */
 noteRealSourceKccRejectedStep(
  id:string,actualFoot:Readonly<{x:number;y:number;z:number}>,
  realKccOwners:readonly string[]=[],realKccCause?:string
 ):void{
  const bot=this.bots.find(b=>b.id===id);
  if(this.f4WholeSupport){
   const goal=this.f4WholeGoals.get(id);
   if(realKccCause==='UNSUPPORTED_OR_BLOCKED_F4_GROUND'&&bot?.agent&&goal&&!goal.patrolVeto&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&(bot.hp??0)>0&&
      [actualFoot.x,actualFoot.y,actualFoot.z].every(Number.isFinite)&&
      bot.position.distance(new Vec3(actualFoot.x,actualFoot.y,actualFoot.z))<=.01&&
      this.f4WholeSupport(id,bot.position)&&
      this.f4PatrolNavigation.noteKccReject(id,this.b137NativeTick,actualFoot,goal.point)){
    goal.patrolVeto=true;
    goal.advanced=Math.min(goal.advanced,this.b137NativeTick-48);
    bot.thinkRemaining=Math.min(bot.thinkRemaining,0);
   }
   return;
  }
  if(!bot||!sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)||
     this.stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
     ![actualFoot.x,actualFoot.y,actualFoot.z].every(Number.isFinite)||
     bot.position.distance(new Vec3(
      actualFoot.x,actualFoot.y,actualFoot.z))>.01||
     !this.hasSourceFootSupport(actualFoot))return;
  this.realKccRejectedSteps.set(id,Math.min(180,
   (this.realKccRejectedSteps.get(id)??0)+1));
  // B1 also needs B2/B3/B4's genuine physical XZ progress witness:
  // a 2.5cm vertical/ramp jitter is not a 25cm real recovery.
  if((id==='B1'||id==='B2'||id==='B3'||id==='B4')&&
     this.enableB441SourceFrontline&&
     this.realKccBTeamRecoveryAnchor){
   const anchor=this.realKccBTeamRecoveryAnchor.get(id);
   // A genuine 25cm advance made in several individually <2.5cm
   // accepted Rapier steps must also clear stale denial history.
   if(!anchor||Math.hypot(
      actualFoot.x-anchor.x,actualFoot.z-anchor.z)>=.25){
    this.realKccRejectedSteps.set(id,1);
    this.realKccLastActorBlocker?.delete(id);
    this.realKccBTeamRecoveryAnchor.set(id,
     new Vec3(actualFoot.x,actualFoot.y,actualFoot.z));
   }
  }
  const owner=realKccOwners.find(otherId=>{
   const other=this.bots.find(b=>b.id===otherId);
   return !!other&&other.id!==id&&other.team===bot.team&&
    sourceNativeLiveRejoinedCpu(other,this.physicallyRejoined);
  });
  if(owner)this.realKccLastActorBlocker?.set(id,{
   ownerId:owner,nativeTick:this.b137NativeTick});
  if(id==='B4'&&this.enableB441SourceFrontline&&
     realKccCause==='UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION'&&
     realKccOwners.length===0)
   this.realKccB4Unsupported?.set(id,{
    nativeTick:this.b137NativeTick,
    foot:new Vec3(actualFoot.x,actualFoot.y,actualFoot.z)});
  else this.realKccB4Unsupported?.delete(id);
  if(id==='B3'&&this.enableB441SourceFrontline&&
     realKccCause==='UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION'&&
     realKccOwners.length===0)
   this.realKccB3Unsupported?.set(id,{
    nativeTick:this.b137NativeTick,
    foot:new Vec3(actualFoot.x,actualFoot.y,actualFoot.z)});
  else this.realKccB3Unsupported?.delete(id);
 }
 /** Genuine KCC denial: do not keep issuing a SOURCE goal whose actual
  * first Recast leg points into the REAL nearby teammate that blocked
  * the physical CPU. No new waypoint or collider-override authority. */
 private kccActorBlocksOriginalRoute(
  id:string,foot:Readonly<{x:number;y:number;z:number}>,
  audit:ReturnType<RecastStageNavigation['auditPath']>
 ):boolean{
  // All seven SOURCE CPUs now use real Rapier teammate sliding.
  // Likewise veto only a truly contacted teammate directly blocking an
  // ORIGINAL candidate; other-side, static and inferred proximity are not
  // obstruction witnesses. No path/actor/geometry authority is added.
  if(!this.enableB441SourceFrontline||
     !/^[AB][1-4]$/.test(id)||
     (this.realKccRejectedSteps.get(id)??0)<B34_GROUNDED_STALL_TICKS)return false;
  const witness=this.realKccLastActorBlocker?.get(id);
  if(!witness||!Number.isSafeInteger(this.b137NativeTick)||
     this.b137NativeTick<witness.nativeTick||
     this.b137NativeTick-witness.nativeTick>120)return false;
  const other=this.bots.find(b=>b.id===witness.ownerId);
  const bot=this.bots.find(b=>b.id===id);
  if(!other||!bot||other.team!==bot.team||
     !sourceNativeLiveRejoinedCpu(other,this.physicallyRejoined)||
     Math.abs(other.position.y-foot.y)>=1)return false;
  const ox=other.position.x-foot.x,oz=other.position.z-foot.z;
  const separation=Math.hypot(ox,oz);
  if(separation<.57||separation>1.5)return false;
  const next=audit.nativePathPoints.find(p=>
   Math.hypot(p.x-foot.x,p.z-foot.z)>.25);
  if(!next)return false;
  const dx=next.x-foot.x,dz=next.z-foot.z;
  const len=Math.hypot(dx,dz);
  if(len<=.25)return false;
  const ahead=(ox*dx+oz*dz)/len;
  const cross=Math.abs(ox*dz-oz*dx)/len;
  return ahead>0&&cross<.70;
 }
 /** Only genuine recent Rapier same-team collision can advance the
  * request for ANOTHER existing certified original SOURCE goal.
  * This is not a static-stage refusal or path authority. */
 private recentRealTeammateKccBlock(id:string):boolean{
  if(!this.enableB441SourceFrontline||
     !/^[AB][1-4]$/.test(id)||
     (this.realKccRejectedSteps.get(id)??0)<B34_GROUNDED_STALL_TICKS)
   return false;
  const witness=this.realKccLastActorBlocker?.get(id);
  if(!witness||!Number.isSafeInteger(this.b137NativeTick)||
     witness.nativeTick>this.b137NativeTick||
     this.b137NativeTick-witness.nativeTick>B34_GROUNDED_STALL_TICKS)
   return false;
  const bot=this.bots.find(x=>x.id===id);
  const other=this.bots.find(x=>x.id===witness.ownerId);
  return !!bot&&!!other&&bot.team===other.team&&
   sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)&&
   sourceNativeLiveRejoinedCpu(other,this.physicallyRejoined)&&
   Math.abs(other.position.y-bot.position.y)<1;
 }
 /** A witnessed unsupported B4 destination only accelerates TRYING
  * another already registered goal; original Recast+Rapier still veto. */
 private recentRealB4UnsupportedOriginalStep(id:string,foot:Vec3):boolean{
  if(id!=='B4'||!this.enableB441SourceFrontline||
     (this.realKccRejectedSteps.get(id)??0)<B34_GROUNDED_STALL_TICKS)
   return false;
  const last=this.realKccB4Unsupported?.get(id);
  const bot=this.bots.find(x=>x.id===id);
  return !!last&&!!bot&&
   sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)&&
   this.b137NativeTick>=last.nativeTick&&
   this.b137NativeTick-last.nativeTick<=B34_GROUNDED_STALL_TICKS&&
   foot.distance(last.foot)<=.22&&
   this.hasSourceFootSupport(foot);
 }
 /** Clear the block streak ONLY after actual Rapier-authorized movement;
  * a successful zero-speed check does not prove the CPU became unstuck. */
 noteRealSourceKccApprovedStep(
  id:string,previousFoot:Readonly<{x:number;y:number;z:number}>,
  acceptedFoot:Readonly<{x:number;y:number;z:number}>
 ):void{
  if(![previousFoot.x,previousFoot.y,previousFoot.z,
    acceptedFoot.x,acceptedFoot.y,acceptedFoot.z].every(Number.isFinite))
   return;
  const stepMeters=Math.hypot(
   previousFoot.x-acceptedFoot.x,
   previousFoot.y-acceptedFoot.y,
   previousFoot.z-acceptedFoot.z);
  // B1-B4: a REAL series of sub-2.5cm Rapier-approved steps can
  // exceed the 25cm horizontal recovery threshold (e.g. enemy-ink
  // movement at 1.35m/s / 60Hz = 2.25cm/tick). The old per-frame
  // 2.5cm gate stopped the cumulative check from EVER running.
  // The anchor exists only after a genuine original-foot KCC rejection;
  // tiny jitter/vertical adjustments and zero-motion calls still cannot
  // erase that episode. Other actors retain the prior 2.5cm rule.
  const anchor=(id==='B1'||id==='B2'||id==='B3'||id==='B4')&&
   this.enableB441SourceFrontline?
   this.realKccBTeamRecoveryAnchor?.get(id):null;
  if(anchor){
   if(stepMeters<=1e-6||Math.hypot(
     acceptedFoot.x-anchor.x,acceptedFoot.z-anchor.z)<.25)return;
  }else if(stepMeters<.025)return;
  this.realKccRejectedSteps.delete(id);
  this.realKccLastActorBlocker?.delete(id);
  this.realKccB4Unsupported?.delete(id);
  this.realKccBTeamRecoveryAnchor?.delete(id);
 }
 /**
  * F4-only live combat: a SOURCE-rejoined CPU should not run past a
  * visible, living opponent merely because the next PHOTO waypoint exists.
  * This interrupts steering ONLY; the normal CPU weapon logic must still
  * pay for/fire a physical projectile and the existing Rapier/KCC veto
  * remains responsible for every subsequent actor step.
  * Never enables the 25-solid ORIGINAL combat authorization in F4.
  */
 private f4LiveCpuFiringLane(bot:F3TrafficCpu,foot:Vec3):boolean{
  return !!this.f4LiveCpuSight(bot,foot)?.target;
 }

 private f4LiveCpuSight(bot:F3TrafficCpu,foot:Vec3,lookBeyondWeapon=false){
  if(!isT21F4ResearchStage(this.stage)||!this.physics||!bot.weaponId||
     !sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)||
     ![foot.x,foot.y,foot.z].every(Number.isFinite))return null;
  const range=cpuWeaponRangeMeters(weaponProfile(bot.weaponId, Boolean(this.f4WholeSupport)));
  if(!Number.isFinite(range)||range<=0)return null;
  // Match CpuAgentSystem's real weapon-range and B181 hit-shape/cover
  // selection exactly. Only the experimental F4 Rapier world supplies
  // the LOS ray; ORIGINAL 25-solid source authorization is untouched.
  const human=bot.team===Team.B&&
   this.f4LiveHuman?.tick===this.b137NativeTick?this.f4LiveHuman:null;
  const humanY=human?
   human.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+
   (human.mode==='SQUID'?
    PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters:0):0;
  const humanHalf=human?.mode==='SQUID'?
   Math.min(.2,PLAYER_CHARACTER_PHYSICS.squidRadiusMeters*.6):.25;
  const candidates=[
   ...this.bots.filter(enemy=>enemy.id!==bot.id&&enemy.team!==bot.team&&
     sourceNativeLiveRejoinedCpu(enemy,this.physicallyRejoined)&&
     [enemy.position.x,enemy.position.y,enemy.position.z]
      .every(Number.isFinite))
    .map(enemy=>({id:enemy.id,
      body:{x:enemy.position.x,y:enemy.position.y+.68,z:enemy.position.z},
      alternateHitPoints:[
       {x:enemy.position.x,
        y:enemy.position.y+GAME_CONFIG.cpu.hitSphereOffsetsMeters[2],
        z:enemy.position.z},
       {x:enemy.position.x,
        y:enemy.position.y+GAME_CONFIG.cpu.hitSphereOffsetsMeters[0],
        z:enemy.position.z}
      ]})),
   ...(human?[{id:'HUMAN',body:{x:human.x,y:humanY,z:human.z},
     alternateHitPoints:[
      {x:human.x,y:humanY+humanHalf,z:human.z},
      {x:human.x,y:humanY-humanHalf,z:human.z}
     ]}]:[])
  ];
  const muzzle={x:foot.x,
   y:foot.y+GAME_CONFIG.cpu.muzzleHeightMeters,z:foot.z};
  const sightRange=lookBeyondWeapon?Math.min(26,Math.max(18,range+6)):range;
  const lastHit=bot.b213ActualHitTick??-1;
  const attacker=lookBeyondWeapon&&lastHit>=0&&Math.abs(this.b137NativeTick-lastHit)<=72?
   bot.b213ActualAttackerId??null:null;
  // Whole F4 navigation and paid main fire share the same 3D sight
  // selector. The older photo-route research keeps its original optics.
  if(this.f4WholeSupport){
   const blocked=(from:Readonly<{x:number;y:number;z:number}>,to:Readonly<{x:number;y:number;z:number}>)=>
    !!this.physics!.castStageSegment(new Vec3(from.x,from.y,from.z),
     new Vec3(to.x,to.y,to.z),'ink-projectile');
   const main=chooseF4PhysicalSight(muzzle,candidates,blocked,attacker,range,range);
   // A distant attacker must not pull a CPU away from a real firing lane.
   // Only search beyond main range if no physically visible main target exists.
   if(!lookBeyondWeapon||main.target||sightRange<=range)return main;
   return chooseF4PhysicalSight(muzzle,candidates,blocked,attacker,sightRange,sightRange);
  }
  return chooseB181OriginalSourceSight(
   muzzle,candidates,(from,to)=>!!this.physics!.castStageSegment(
    new Vec3(from.x,from.y,from.z),
    new Vec3(to.x,to.y,to.z),'ink-projectile'),attacker,sightRange,sightRange);
 }

 /** Sight can inform a Crowd intention outside weapon range; only the paid
  * weapon path may fire. A lost opponent supplies one short-lived last
  * visible point, never its current hidden position. */
 private f4WholeCombatGoal(bot:F3TrafficCpu,foot:Vec3,
  previous:ReturnType<typeof this.f4WholeGoals.get>,localActionsOpen:boolean):
  {point:Vec3|null;opponent:string;recovering:boolean}|null{
  if(!bot.weaponId||!this.physics)return null;
  const range=cpuWeaponRangeMeters(weaponProfile(bot.weaponId, Boolean(this.f4WholeSupport)));
  const sight=this.f4LiveCpuSight(bot,foot,true);
  const visible=!!sight?.target&&!!sight.actorId;
  if(sight?.target&&sight.actorId){
   const p=sight.target;
   this.f4LastSeenOpponent.set(bot.id,{
    id:sight.actorId,point:new Vec3(p.x,p.y,p.z),tick:this.b137NativeTick
   });
  }
  const seen=this.f4LastSeenOpponent.get(bot.id);
  // Rejoin membership alone can lag a genuine splat until observe().
  // Never pursue a dead actor or another life's stale sight position.
  const seenCpu=seen&&seen.id!=='HUMAN'?this.bots.find(b=>b.id===seen.id):null;
  if(!seen||this.b137NativeTick-seen.tick>72||
     (seen.id==='HUMAN'?this.f4LiveHuman?.tick!==this.b137NativeTick:
      !seenCpu||!sourceNativeLiveRejoinedCpu(seenCpu,this.physicallyRejoined))){
   this.f4LastSeenOpponent.delete(bot.id);
   return null;
  }
  const target=seen.point;
  const dx=target.x-foot.x,dz=target.z-foot.z;
  const horizontal=Math.hypot(dx,dz);
  if(horizontal<.2)return null;
  // Steering remains planar, but the firing envelope is measured from
  // the real muzzle to the same physical body sample used by sight.
  const distance=Math.hypot(dx,target.y-foot.y-GAME_CONFIG.cpu.muzzleHeightMeters,dz);
  const recovering=(this.f4PlayableRecovery?bot.f4RecoveringHp===true:
   (bot.hp??100)<=GAME_CONFIG.combat.playerMaxHp*.35||
   (previous?.recovering===true&&(bot.hp??100)<GAME_CONFIG.combat.playerMaxHp*.65))||
   (bot.ink??Infinity)<GAME_CONFIG.inkEconomy.capacity*.18||bot.f4RecoveringInk===true;
  const result=(point:Vec3|null)=>({point,opponent:seen.id,recovering});
  // Use the same physically supported swimmable owner cell as CPU resources.
  const inkRelation=(point:Vec3)=>{
   const floor=this.sourceNativeCharacterFootHit(point);
   const sample=floor&&this.sourceInk?.sampleWorld(floor.point,.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall);
   return !sample?'UNKNOWN':sample.owner===bot.team?'OWN':sample.owner===Team.Neutral?'NEUTRAL':'ENEMY';
  };
  const ownsInk=(point:Vec3)=>this.f4PlayableRecovery?
   this.f4RecoveryOwnFloor(point,bot.team):inkRelation(point)==='OWN';
  if(!visible&&recovering&&ownsInk(foot))return result(null);
  // Combat waypoints used to expire without registering the same lack of
  // real progress as patrol goals. Avoid repeatedly selecting that blocked
  // lane; ordinary Recast/Rapier/KCC admission remains unchanged.
  if(previous?.opponent===seen.id&&previous.recovering===recovering&&
     foot.distance(previous.point)>.35&&!previous.patrolVeto&&
     this.b137NativeTick-previous.advanced>=30)
   this.f4PatrolNavigation.noteStalled(bot.id,this.b137NativeTick,foot,previous.point);
  if(previous?.opponent===seen.id&&previous.recovering===recovering&&!previous.patrolVeto&&
     !this.f4PatrolNavigation.avoids(bot.id,this.b137NativeTick,foot,previous.point)&&
     foot.distance(previous.point)>.35&&this.b137NativeTick-previous.issued<42&&
     this.b137NativeTick-previous.advanced<30)return result(previous.point);

  const forwardX=dx/horizontal,forwardZ=dz/horizontal;
  const spacingPlan=combatSpacing(weaponProfile(bot.weaponId,true).weaponClass,range,distance,visible,recovering);
  if(!spacingPlan)return null;
  const advance=spacingPlan.advance;
  const recentlyHit=(bot.b213ActualHitTick??-1)>=0&&
   Math.abs(this.b137NativeTick-(bot.b213ActualHitTick??-1))<=72;
  const side=bot.id.endsWith('2')||bot.id.endsWith('4')?-1:1;
  const step=Math.min(1.8,Math.max(.65,range*.19));
  const candidates:{point:Vec3;score:number;covered:boolean;localVerified:boolean}[]=[];
  for(const lateral of [side,-side,0]){
   if(advance===0&&lateral===0)continue;
   const point=new Vec3(foot.x+step*(forwardX*advance-forwardZ*lateral),
    foot.y,foot.z+step*(forwardZ*advance+forwardX*lateral));
   const projection=this.nav.auditNavMeshProjection(point);
   const p=projection.nearestPoint;
   if(!p||Math.hypot(p.x-point.x,p.z-point.z)>.25||Math.abs(p.y-foot.y)>.65)continue;
   const floor=this.sourceNativeCharacterFootHit(p);
   if(!floor||Math.abs(floor.point.y-foot.y)>.42||floor.point.distance(foot)<.4)continue;
   const muzzle=floor.point.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0));
   const covered=!!this.physics.castStageSegment(muzzle,target,'ink-projectile');
   // Healthy CPUs keep or regain a real firing lane. Wounded CPUs favor
   // existing cover and owned ink, even if that puts their own gun offline.
   const spacing=Math.hypot(muzzle.x-target.x,muzzle.y-target.y,muzzle.z-target.z);
   const score=rankCombatCandidate({distance:spacing,band:spacingPlan.band,
    covered,ownInk:ownsInk(floor.point),recovering,lateral,recentlyHit})-
    (inkRelation(floor.point)==='ENEMY'?(recovering?3:1.6):0);
   candidates.push({point:new Vec3(p.x,p.y,p.z),score,covered,
    localVerified:projection.success&&projection.distanceMeters!==null&&
     projection.distanceMeters<=.25&&Math.abs(floor.point.y-p.y)<=.12});
  }
  // Reuse this thought's actual F4 NavMesh projections. The frozen original
  // patrol list is concentrated at |Z|>=33, mostly outside the local lane.
  // Never broaden the local lane or bypass a pending nonlocal movement.
  if(localActionsOpen&&visible&&sight?.actorId&&previous?.local&&
     !this.respawnOriginalDrops.has(bot.id)&&this.isLiveRejoinedSourceCpu(bot.id)){
   const nativeCandidates=candidates.filter(c=>c.localVerified&&
    (recovering||!c.covered)&&!this.f4PatrolNavigation.avoids(bot.id,this.b137NativeTick,foot,c.point)).map(c=>c.point);
   const tactical=this.f4AdmitLocalCombat(bot,foot,sight.actorId,range,nativeCandidates,
    target,recovering,recentlyHit);
   if(tactical&&!this.f4PatrolNavigation.avoids(bot.id,this.b137NativeTick,foot,tactical))return result(tactical);
  }
  for(const {point,covered} of candidates.sort((a,b)=>b.score-a.score)){
   if(!recovering&&covered&&visible&&distance<=range)continue;
   if(this.f4PatrolNavigation.avoids(bot.id,this.b137NativeTick,foot,point))continue;
   const walk=this.f4WholeWalkTarget(foot,point);
   if(walk&&!this.f4PatrolNavigation.avoids(bot.id,this.b137NativeTick,foot,walk))return result(walk);
  }
  return visible&&distance<=range?result(null):null;
 }
 private f4AdmitLocalCombat(bot:F3TrafficCpu,foot:Vec3,opponent:string,range:number,
  nativeCandidates:readonly Vec3[],visibleHitPoint:Vec3,recovering:boolean,recentlyHit:boolean):Vec3|null{
  if(!this.physics||!bot.weaponId)return null;
  // Stay on the same local lane, clear of all center transfer and spawn bands.
  const local=(point:Readonly<{x:number;y:number;z:number}>)=>
   Math.sign(point.z)===Math.sign(foot.z)&&Math.abs(point.z)>14&&
   Math.abs(point.z)<36&&Math.abs(point.y-foot.y)<=.18;
  if(!local(foot))return null;
  const enemy=opponent==='HUMAN'?this.f4LiveHuman:
   this.bots.find(candidate=>candidate.id===opponent)?.position;
  const support=this.sourceNativeCharacterFootHit(foot);
  if(!enemy||!support||Math.abs(support.point.y-foot.y)>.12||(support.normal?.y??0)<.97)return null;
  const inkRelation=(point:Vec3):F4InkRelation=>{
   const floor=this.sourceNativeCharacterFootHit(point);
   const ink=floor&&this.sourceInk?.sampleWorld(floor.point,.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall);
   return !ink?'UNKNOWN':ink.owner===bot.team?'OWN':ink.owner===Team.Neutral?'NEUTRAL':'ENEMY';
  };
  // Native projected candidates first; retain old patrol points as fallback
  // only within the original strict lane. No additional projection searches.
  const points:Vec3[]=[];
  for(const point of [...nativeCandidates,...(this.patrolGoals.get(bot.id)??[]).slice(0,16)]){
   if(!local(point)||point.distance(foot)>3.2||point.distance(foot)<.35||
      points.some(p=>p.distance(point)<.12))continue;
   const floor=this.sourceNativeCharacterFootHit(point);
   if(!floor||floor.solidId!==support.solidId||(floor.normal?.y??0)<.97||
      Math.abs(floor.point.y-point.y)>.12)continue;
   points.push(point);
   if(points.length>=16)break;
  }
  const coveredFromEnemy=(point:Vec3)=>!!this.physics!.castStageSegment(
   point.clone().add(new Vec3(0,GAME_CONFIG.cpu.muzzleHeightMeters,0)),
   visibleHitPoint,'ink-projectile');
  const candidates=points.map(point=>({foot:point,existingNativePoint:true as const,
   localTrafficAllowed:true as const,inkRelation:inkRelation(point),
   coveredFromEnemy:coveredFromEnemy(point)}));
  this.f4LocalCombatProposals.attempts++;
  this.f4LocalCombatProposals.candidateCount+=candidates.length;
  const admitted=chooseLocalCombatGoal({
   f4:true,alive:true,grounded:true,rejoined:true,localWalkingAllowed:true,
   centerTransferPending:false,respawnPending:false,currentSupport:true,
   foot,hp:bot.hp,ink:bot.ink,weaponClass:weaponProfile(bot.weaponId,true).weaponClass,
   rangeM:range,enemy:{alive:true,visibleNow:true,foot:enemy,hitPoint:visibleHitPoint},
   muzzleHeight:GAME_CONFIG.cpu.muzzleHeightMeters,inkRelation:inkRelation(foot),
   recovering,recentlyHit
  },candidates,point=>{
   const step=this.f4WholeWalkTarget(foot,new Vec3(point.x,point.y,point.z),true);
   if(!step||!local(step)||step.distance(foot)>1.3)return null;
   const toward=step.clone().sub(foot);
   const head=new Vec3(0,.65,0);
   if(this.physics!.castStageSegment(foot.clone().add(head),step.clone().add(head),'ink-projectile'))return null;
   for(let i=1;i<=4;i++){
    const probe=foot.clone().add(toward.clone().mulScalar(i/4));
    const floor=this.sourceNativeCharacterFootHit(probe);
    if(!floor||floor.solidId!==support.solidId||(floor.normal?.y??0)<.97||
       Math.abs(floor.point.y-probe.y)>.12)return null;
   }
   return {reached:true,staticSupport:true,trafficAllowed:true,step,
    inkRelation:inkRelation(step),coveredFromEnemy:coveredFromEnemy(step)};
  });
  if(admitted)this.f4LocalCombatProposals.admitted++;
  return admitted?new Vec3(admitted.step.x,admitted.step.y,admitted.step.z):null;
 }

 useF4WholeNavigation(nav:RecastStageNavigation,support:(id:string,foot:Vec3)=>boolean,
  projection:(foot:Vec3,point:Readonly<{x:number;y:number;z:number}>)=>boolean,
  positiveIngress:readonly StageVector3[]|null,negativeIngress:readonly StageVector3[]|null):void{
  this.nav=nav;
  this.f4WholeSupport=support;
  this.f4WholeProjection=projection;
  if(positiveIngress)this.f4WholeIngress.set(1,positiveIngress);
  if(negativeIngress)this.f4WholeIngress.set(-1,negativeIngress);
  for(const [team,side] of [[Team.A,'positive-z'],[Team.B,'negative-z']] as const){
   const drop=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>p.id==='first-drop-'+side);
   if(!drop)continue;
   const approach=nav.auditNavMeshProjection(new Vec3(...drop.from)).nearestPoint;
   const landing=nav.auditNavMeshProjection(new Vec3(...drop.to)).nearestPoint;
   if(!approach||!landing||Math.abs(approach.y-drop.from[1])>.25||
      Math.abs(landing.y-drop.to[1])>.25||
      Math.hypot(approach.x-drop.from[0],approach.z-drop.from[2])>.55||
      Math.hypot(landing.x-drop.to[0],landing.z-drop.to[2])>.45||
      !this.sourceNativeCharacterFootHit(approach)||
      !this.sourceNativeCharacterFootHit(landing))continue;
   this.f4WholeDrops.set(team,{
    approach:new Vec3(approach.x,approach.y,approach.z),
    landing:new Vec3(landing.x,landing.y,landing.z)
   });
  }
 }

 private f4WholeWalkTarget(from:Vec3,target:Vec3,shortLeg=false,maxRouteMeters=Infinity):Vec3|null{
  const path=this.nav.auditPath(from,target,.20);
  if(Number.isFinite(maxRouteMeters)){
   if(!path.querySuccess||!path.reachedTarget)return null;
   let length=0;
   for(let i=1;i<path.nativePathPoints.length;i++){
    const a=path.nativePathPoints[i-1]!,b=path.nativePathPoints[i]!;
    length+=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
   }
   if(!Number.isFinite(length)||length>maxRouteMeters)return null;
  }
  const [start]=path.nativePathPoints;
  const goal=path.nativePathPoints.at(-1);
  if(!(path.reachedTarget&&path.pointCount>=2&&start&&goal&&
   (path.startSnapDistanceMeters<=.30||this.f4WholeProjection?.(from,start))&&
   (path.endSnapDistanceMeters<=.25&&this.sourceNativeCharacterFootHit(goal)||
    this.f4WholeProjection?.(target,goal)||
    Math.abs(target.z)<8&&path.endSnapDistanceMeters<=.30&&
    this.sourceNativeCharacterFootHit(goal))))return null;
  if(shortLeg){
   const next=path.nativePathPoints.slice(1).find(p=>Math.hypot(p.x-from.x,p.z-from.z)>.26);
   if(next){
    const span=Math.hypot(next.x-start.x,next.z-start.z);
    const t=Math.min(1,1.15/span);
    const point=new Vec3(start.x+(next.x-start.x)*t,start.y+(next.y-start.y)*t,
     start.z+(next.z-start.z)*t);
    const nav=this.nav.auditNavMeshProjection(point);
    if(nav.nearestPoint&&nav.distanceMeters!==null&&nav.distanceMeters<=.25&&
       this.sourceNativeCharacterFootHit(nav.nearestPoint)){
     const p=nav.nearestPoint;
     return new Vec3(p.x,p.y,p.z);
    }
     // A requested short leg is a physical support gate. Falling through
     // to the distant route endpoint bypasses that gate at ramp seams.
     return null;
   }
  }
  return new Vec3(goal.x,goal.y,goal.z);
 }

 chooseF4WholeDrop(id:string,foot:Vec3):{target:Vec3;jumpSpeed:number;center:boolean}|null{
  const bot=this.bots.find(candidate=>candidate.id===id);
  if(!bot?.agent||!this.f4WholeSupport?.(id,foot))return null;
  const drop=this.f4WholeDrops.get(bot.team);
  if(drop&&Math.abs(foot.y-drop.approach.y)<=.28&&
     Math.hypot(foot.x-drop.approach.x,foot.z-drop.approach.z)<=.33)
   return {target:drop.landing,jumpSpeed:0,center:false};
  const z=Math.abs(foot.z);
  if(z>8&&z<44&&foot.y<3.25){
   const goal=this.f4WholeGoals.get(id);
   if(goal&&!goal.local&&this.b137NativeTick-goal.advanced>=48&&
      (this.b137NativeTick-goal.advanced)%6===0){
    const route=this.nav.auditPath(foot,goal.point,.2);
    const first=route.nativePathPoints[0];
    const to=route.nativePathPoints.slice(1)
     .find(p=>Math.hypot(p.x-foot.x,p.z-foot.z)>.45);
    if(route.reachedTarget&&first&&to&&
       (route.startSnapDistanceMeters<=.30||this.f4WholeProjection?.(foot,first))){
     const span=Math.hypot(to.x-foot.x,to.z-foot.z);
     const t=Math.min(1,1.55/span);
     const probe=new Vec3(foot.x+(to.x-foot.x)*t,
      first.y+(to.y-first.y)*t,foot.z+(to.z-foot.z)*t);
     const projected=this.nav.auditNavMeshProjection(probe);
     const landing=projected.nearestPoint;
     const floor=landing&&this.sourceNativeCharacterFootHit(landing);
     if(landing&&floor&&projected.distanceMeters!==null&&projected.distanceMeters<=.24&&
        Math.abs(floor.point.y-foot.y)<=.62&&
        this.f4WholeWalkTarget(new Vec3(landing.x,landing.y,landing.z),goal.point))
      return {target:new Vec3(landing.x,landing.y,landing.z),
       jumpSpeed:GAME_CONFIG.player.jumpSpeedMetersPerSecond,center:false};
    }
   }
  }
  if(z>8)return null;
  const own=bot.team===Team.A?F4_CENTER_STEP[1]:F4_CENTER_STEP[-1];
  const far=bot.team===Team.A?F4_CENTER_STEP[-1]:F4_CENTER_STEP[1];
  for(const [from,to,exit,jump] of [
   [own.takeoff,own.upper,far.shoulder,true],
   [far.shoulder,far.low,far.takeoff,false]
  ] as const){
   if(foot.distance(new Vec3(...from))>.58)continue;
   const target=new Vec3(...to);
   if(!this.sourceNativeCharacterFootHit(target)||
      !this.f4WholeWalkTarget(target,new Vec3(...exit)))continue;
   return {target,jumpSpeed:jump?10.2:0,center:true};
  }
  return null;
 }

 /** Check actual static floor, support normal and authoritative backed ownership.
  * Used only for live provisional recovery, never to authorize movement. */
 private f4RecoveryOwnFloor(point:Readonly<{x:number;y:number;z:number}>,team:Team.A|Team.B):boolean{
  const floor=this.sourceNativeCharacterFootHit(point);
  const normal=floor?.normal;
  if(!floor||!normal||Math.abs(floor.point.y-point.y)>.12||
     normal.y<Math.cos(PLAYER_CHARACTER_PHYSICS.maxSlopeClimbAngleRadians)-1e-6)return false;
  const sample=this.sourceInk?.sampleWorld(floor.point,.055,SurfaceFlags.Swimmable,SurfaceFlags.Wall,
   s=>Math.abs(s.normal.dot(normal))>=.95);
  return sample?.owner===team;
 }

 /** Prefer a real patch of own ink, rather than a single isolated cell.
  * Center is mandatory. Four nearby floor samples are a bounded tie-break. */
 private f4RecoveryPatchQuality(point:Vec3,team:Team.A|Team.B):number{
  if(!this.f4RecoveryOwnFloor(point,team))return 0;
  let count=1;
  for(const [x,z] of [[.25,0],[-.25,0],[0,.25],[0,-.25]] as const)
   if(this.f4RecoveryOwnFloor(new Vec3(point.x+x,point.y,point.z+z),team))count++;
  return count;
 }

 private chooseF4WholeGoal(id:string,foot:Vec3,out:Vec3,localActionsOpen:boolean):boolean{
  const bot=this.bots.find(candidate=>candidate.id===id);
  if(!bot?.agent||!this.f4WholeSupport?.(id,foot))return false;
  const previous=this.f4WholeGoals.get(id);
  const combat=this.freeCombat?this.f4WholeCombatGoal(bot,foot,previous,localActionsOpen):null;
  if(combat){
   if(!combat.point){
    this.f4WholeGoals.delete(id);
    return false;
   }
   // Do not reset a consecutive real-KCC rejection streak on a retained combat goal.
   if(combat.point!==previous?.point){
    this.f4PatrolNavigation.newGoal(id);
    this.f4WholeGoals.set(id,{point:combat.point,local:true,
     issued:this.b137NativeTick,advanced:this.b137NativeTick,
     bestDistance:foot.distance(combat.point),opponent:combat.opponent,
     recovering:combat.recovering,patrolTrail:[{x:foot.x,y:foot.y,z:foot.z}]});
    this.realGoalRequests++;
   }
   out.copy(combat.point);
   return true;
  }
  // Share the combat recovery hysteresis, including the first low-ink tick.
  // Hold only on actual swimmable own ink in ordinary lanes, never in combat.
  const quietRecovery=recoveringInk(bot.f4RecoveringInk===true,bot.ink??Infinity,GAME_CONFIG.inkEconomy.capacity)||
   (this.f4PlayableRecovery&&bot.f4RecoveringHp===true);
  const recoveryFloor=quietRecovery&&this.freeCombat&&Math.abs(foot.z)>12&&Math.abs(foot.z)<42?
   this.sourceNativeCharacterFootHit(foot):null;
  const holdRecovery=!!recoveryFloor&&(this.f4PlayableRecovery?
   this.f4RecoveryOwnFloor(foot,bot.team):this.sourceInk?.sampleWorld(
   recoveryFloor.point,.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall)?.owner===bot.team);
  const reached=!!previous&&foot.distance(previous.point)<=.35;
  if(reached&&!previous?.opponent)this.f4PatrolNavigation.noteReached(id,this.b137NativeTick,foot);
  // A recovery destination can be repainted during travel. Revalidate
  // its live ownership before retention; resume patrol when healed.
  const retainedRecoveryValid=!this.f4PlayableRecovery||!previous?.recovering||
   (quietRecovery&&this.f4RecoveryOwnFloor(previous.point,bot.team));
  if(previous&&!previous.opponent&&!reached&&retainedRecoveryValid&&
     (previous.local?!holdRecovery&&(!this.f4PlayableRecovery||!quietRecovery||previous.recovering===true)&&
      localPatrolCanContinue(this.b137NativeTick,previous.issued,previous.advanced,previous.patrolVeto):
      this.b137NativeTick-previous.advanced<48)){
   out.copy(previous.point);
   return true;
  }
  // A short local target is still an ordinary Crowd route proposal. If its
  // KCC steps make no measurable progress, let the next native thought pick
  // another supported direction on the same mesh; expiry alone is not a veto.
  const stalledOnRoute=!!previous&&!previous.opponent&&!reached&&
   (previous.patrolVeto===true||this.b137NativeTick-previous.advanced>=48);
  if(stalledOnRoute&&previous)this.f4PatrolNavigation.noteStalled(id,this.b137NativeTick,foot,previous.point);
  this.f4WholeGoals.delete(id);
  const avoids=(point:Vec3)=>this.f4PatrolNavigation.avoids(id,this.b137NativeTick,foot,point);
  const request=(point:Vec3,local:boolean,recovery=false)=>{
   this.f4PatrolNavigation.newGoal(id);
   this.f4WholeGoals.set(id,{point,local,issued:this.b137NativeTick,
    ...(this.f4PlayableRecovery&&recovery?{recovering:true}:{}),
    advanced:this.b137NativeTick,bestDistance:foot.distance(point),
    // Real horizontal progress around bends also counts on ingress routes.
    patrolTrail:[{x:foot.x,y:foot.y,z:foot.z}]});
   out.copy(point);
   this.realGoalRequests++;
   return true;
  };
  const drop=this.f4WholeDrops.get(bot.team);
  if(!stalledOnRoute&&drop&&Math.abs(foot.y-drop.approach.y)<=.4){
   const point=this.f4WholeWalkTarget(foot,drop.approach);
   if(point&&!avoids(point)){
    return request(point,false);
   }
  }
  const side=bot.team===Team.A?-1:1;
  // Prefer existing lower-floor anchors. Detour only supplies the walking
  // corridor; mixed heights and tight corners still go through the KCC.
  const fronts=(this.stage.paintSurfaces??[]).filter(s=>s.id.includes('center-low-'));
  const firstSide=foot.z*side<-7?-side:side;
  const ingress=foot.z*side<0&&Math.abs(foot.z)<44?
   this.f4WholeIngress.get(-side)??[]:[];
  const [slopeBottom,slopeTop,rampUpper,rampLower]=ingress;
  if(!stalledOnRoute&&side===-1&&rampUpper&&rampLower&&
     foot.z<=rampLower[2]+3&&foot.z>rampUpper[2]+.45&&
     foot.y<rampUpper[1]-.15){
   // A1's measured physical approach took the right side of the lower lip.
   // Target that supported foot first to avoid the tight left turn chosen
   // by a direct Recast query to the upper guide point.
   const target=foot.z>22.75?new Vec3(-2.6,.5,22.4):new Vec3(...rampUpper);
   const point=this.f4WholeWalkTarget(foot,target);
   if(point&&!avoids(point))return request(point,false);
  }
  if(!stalledOnRoute&&foot.z>0&&slopeBottom&&slopeTop&&
     foot.z*side>=slopeTop[2]*side-.5&&
     foot.z*side<slopeBottom[2]*side&&Math.abs(foot.y-slopeTop[1])<=.25){
   // F4 RAW A1/A3 approach the positive-Z slope from the side of its
   // raised seam. Detour can report a complete path across that seam.
   // Line up with the existing return guide before aiming down the slope.
   const fraction=(foot.z-slopeTop[2])/(slopeBottom[2]-slopeTop[2]);
   const slopeX=slopeTop[0]+fraction*(slopeBottom[0]-slopeTop[0]);
   const target=Math.abs(foot.x-slopeX)>.75?slopeTop:slopeBottom;
   const point=this.f4WholeWalkTarget(foot,new Vec3(...target));
   if(point&&!avoids(point))return request(point,false);
  }
  const ahead=ingress.filter(p=>Math.abs(p[2])<Math.abs(foot.z)-.5&&
   Math.abs(foot.z)-Math.abs(p[2])<9).reverse();
  const own=bot.team===Team.A?F4_CENTER_STEP[1]:F4_CENTER_STEP[-1];
  const far=bot.team===Team.A?F4_CENTER_STEP[-1]:F4_CENTER_STEP[1];
  const centerLegs=Math.abs(foot.z)<=12?
   [far.shoulder,own.takeoff]:[];
  const allies=this.bots.filter(a=>a.id!==id&&a.team===bot.team&&a.lifeState==='ACTIVE'&&
   a.mobilityState==='GROUND'&&(a.hp??0)>0);
  const reservations=allies.flatMap(a=>{const g=this.f4WholeGoals.get(a.id);return g&&!g.opponent?[g.point]:[];});
  // Live recovery uses one hysteresis state for steering, holding and
  // retained goals. Preserve the broader historical thresholds elsewhere.
  const recovering=this.f4PlayableRecovery?quietRecovery:
   quietRecovery||(bot.ink??Infinity)<GAME_CONFIG.inkEconomy.capacity*.25||
   (bot.hp??Infinity)<GAME_CONFIG.combat.playerMaxHp*.45;
  const options={recovering,reservations};
  const inkAt=(point:Vec3):PatrolInk=>{
   const floor=this.sourceNativeCharacterFootHit(point);
   const sample=floor&&this.sourceInk?.sampleWorld(floor.point,.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall);
   return !sample?'UNKNOWN':sample.owner===bot.team?'OWN':sample.owner===Team.Neutral?'NEUTRAL':'ENEMY';
  };
  // Mandatory ingress/center priorities remain; only rank existing fronts.
  const frontsBySide=[firstSide,-firstSide].flatMap(entry=>
   fronts.filter(s=>Math.sign(s.center[2])===entry).map(s=>s.center));
  const orderedFronts=stalledOnRoute?[]:this.f4PatrolNavigation.rank(id,this.b137NativeTick,foot,
   frontsBySide.map((p,i)=>{const point=new Vec3(...p);return {point,ink:inkAt(point),order:i,index:i};}),
   allies.map(a=>a.position),options).map(r=>[r.point.x,r.point.y,r.point.z] as const);
  // A single flank painter per team can take a short supported neutral
  // side lane near mid, ONLY when no combat goal was admitted. Keep other
  // actors and all ingress/transfer/respawn/recovery authority unchanged.
  if(this.freeCombat&&!recovering&&!stalledOnRoute&&id.endsWith('2')&&
     Math.abs(foot.z)<=10&&!this.respawnOriginalDrops.has(id)&&
     this.isLiveRejoinedSourceCpu(id)&&this.sourceInk){
   const flank:PatrolCandidate<Vec3>[]=[];
   for(const dx of [-3,3,-5,5]){
    const probe=new Vec3(foot.x+dx,foot.y,foot.z+side);
    const projection=this.nav.auditNavMeshProjection(probe),p=projection.nearestPoint;
    if(!projection.success||!p||projection.distanceMeters===null||projection.distanceMeters>.25||
       Math.abs(p.y-foot.y)>.55||Math.abs(p.z)>11)continue;
    const point=new Vec3(p.x,p.y,p.z),support=this.sourceNativeCharacterFootHit(point);
    if(!support||Math.abs(support.point.y-p.y)>.12||avoids(point))continue;
    const ink=inkAt(point);
    if(ink!=='NEUTRAL'&&ink!=='ENEMY')continue;
    const index=flank.length;flank.push({point,ink,order:index,index});
   }
   for(const candidate of this.f4PatrolNavigation.rank(id,this.b137NativeTick,foot,flank,
     allies.map(a=>a.position),options).slice(0,2)){
    const point=this.f4WholeWalkTarget(foot,candidate.point,false,8);
    if(point&&!avoids(point)&&point.distance(candidate.point)<=.25&&
       Math.abs(point.z)<=11&&Math.abs(point.y-foot.y)<=.55&&
       inkAt(point)===candidate.ink)return request(point,true);
   }
  }
  // Preserve measured ingress and center transfer priority before optional survey.
  for(const candidate of stalledOnRoute?[]:[...ahead,...centerLegs]){
   const target=new Vec3(...candidate);
   if(Math.hypot(target.x-foot.x,target.z-foot.z)<.25)continue;
   const point=this.f4WholeWalkTarget(foot,target,Math.abs(foot.z)<44&&Math.abs(foot.z)>8);
   if(!point||avoids(point))continue;
   return request(point,false);
  }
  // After mandatory ingress/center choices, recover on this real own floor.
  // Returning false clears only the ordinary Crowd target; weapon recovery
  // and all real resource rates remain owned by CpuAgentSystem.
  if(holdRecovery)return false;
  // Local recovery across tile boundaries. Keep mandatory ingress and
  // center transfers above unchanged. Sample real supported current owner
  // cells first, project only nearby own-ink candidates, then admit at most
  // two complete native routes. Never grant a movement or refill here.
  if(recovering&&this.freeCombat&&this.sourceInk&&Math.abs(foot.z)>12&&Math.abs(foot.z)<42){
   const ownCandidates:PatrolCandidate<Vec3>[]=[];
   const offsets=[[1,0],[-1,0],[0,1],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]] as const;
   for(const radius of [1.5,3.5]){
    for(const [dx,dz] of offsets){
     const probe=new Vec3(foot.x+radius*dx,foot.y,foot.z+radius*dz);
     if(Math.abs(probe.z)<=12||Math.abs(probe.z)>=42||avoids(probe))continue;
     const floor=this.sourceNativeCharacterFootHit(probe);
     if(!floor||Math.abs(floor.point.y-foot.y)>.42||
        (this.f4PlayableRecovery?!this.f4RecoveryOwnFloor(floor.point,bot.team):
         this.sourceInk.sampleWorld(floor.point,.10,SurfaceFlags.Swimmable,SurfaceFlags.Wall)?.owner!==bot.team))continue;
     const projection=this.nav.auditNavMeshProjection(floor.point),p=projection.nearestPoint;
     if(!projection.success||!p||projection.distanceMeters===null||projection.distanceMeters>.25||
        Math.abs(p.y-floor.point.y)>.12)continue;
     const point=new Vec3(p.x,p.y,p.z);
     if(avoids(point)||point.distance(foot)<.35||(this.f4PlayableRecovery?
        !this.f4RecoveryOwnFloor(point,bot.team):inkAt(point)!=='OWN'))continue;
     const index=ownCandidates.length;ownCandidates.push({point,ink:'OWN',order:index,index});
    }
    if(ownCandidates.length>=(this.f4PlayableRecovery?4:2))break;
   }
   const ranked=this.f4PatrolNavigation.rank(id,this.b137NativeTick,foot,ownCandidates,
    allies.map(a=>a.position),options);
   // Shortlist by existing navigation/team-spacing rank first. At most
   // four candidates get a five-point patch check, two get route queries.
   const ordered=this.f4PlayableRecovery?ranked.slice(0,4).map(c=>({c,quality:this.f4RecoveryPatchQuality(c.point,bot.team)}))
    .filter(r=>r.quality>0).sort((a,b)=>b.quality-a.quality).slice(0,2).map(r=>r.c):ranked.slice(0,2);
   for(const c of ordered){
    const point=this.f4WholeWalkTarget(foot,c.point,false,6);
    if(point&&!avoids(point)&&point.distance(c.point)<=.25&&(this.f4PlayableRecovery?
       this.f4RecoveryOwnFloor(point,bot.team):inkAt(point)==='OWN'))return request(point,true,true);
   }
  }
  // Healthy bots still on their own approach lane should contest the center
  // before repeatedly surveying local unpainted cells. Recovery retains
  // priority, and all candidates still need the existing native route gate.
  const prioritizeFront=!recovering&&foot.z*side<-12;
  const tryFronts=():boolean=>{
   for(const candidate of orderedFronts){
    const target=new Vec3(...candidate);
    if(Math.hypot(target.x-foot.x,target.z-foot.z)<.25)continue;
    const point=this.f4WholeWalkTarget(foot,target,Math.abs(foot.z)<44&&Math.abs(foot.z)>8);
    if(!point||avoids(point))continue;
    return request(point,false);
   }
   return false;
  };
  if(prioritizeFront&&tryFronts())return true;
  // Sparse real owner-grid survey, only on ordinary free patrol away from
  // spawn/center transfers. Existing actual-floor/route/KCC gates remain.
  if(this.freeCombat&&this.sourceInk&&Math.abs(foot.z)>12&&Math.abs(foot.z)<42){
   const current=this.sourceNativeCharacterFootHit(foot);
   const sample=current&&this.sourceInk.sampleWorld(current.point,.10,SurfaceFlags.Paintable,SurfaceFlags.Wall);
   if(sample&&(!recovering||sample.owner!==bot.team)){
    const proposed=this.f4PatrolSurvey.propose(id,this.b137NativeTick,sample.surface,sample.u,sample.v,
     bot.team,SurfaceFlags.Paintable,SurfaceFlags.Wall,Team.Neutral,recovering);
    const verified:PatrolCandidate<Vec3>[]=[];
    for(const [i,candidate] of proposed.entries()){
     const point=sample.surface.localToWorld(candidate.u,candidate.v);
     const projection=this.nav.auditNavMeshProjection(point);
     const p=projection.nearestPoint;
     if(!projection.success||!p||projection.distanceMeters===null||projection.distanceMeters>.25||
        Math.abs(p.y-foot.y)>.65||Math.abs(p.z)<=12||Math.abs(p.z)>=42||avoids(new Vec3(p.x,p.y,p.z)))continue;
     const floor=this.sourceNativeCharacterFootHit(p);
     const live=floor&&this.sourceInk.sampleWorld(floor.point,.10,SurfaceFlags.Paintable,SurfaceFlags.Wall);
     if(!live||live.surface!==sample.surface||
        (recovering?live.owner!==bot.team:live.owner===bot.team))continue;
     verified.push({point:new Vec3(p.x,p.y,p.z),ink:live.owner===bot.team?'OWN':live.owner===Team.Neutral?'NEUTRAL':'ENEMY',
      order:i,index:i});
    }
    for(const candidate of this.f4PatrolNavigation.rank(id,this.b137NativeTick,foot,verified,allies.map(a=>a.position),options).slice(0,2)){
     const point=this.f4WholeWalkTarget(foot,candidate.point,false,8);
     if(point&&!avoids(point)&&point.distance(candidate.point)<=.25&&
        (!this.f4PlayableRecovery||!recovering||this.f4RecoveryOwnFloor(point,bot.team)))
      return request(point,true,recovering);
    }
   }
  }
  if(!prioritizeFront&&tryFronts())return true;
  // Test short native walking targets toward the center first. A target
  // across a drop, another level or without a real floor stays on HOLD.
  const directions=[[0,side],[1,side],[-1,side],[1,0],[-1,0],[0,-side]] as const;
  const first=this.f4WholeDirections.get(id)??0;
  const localCandidates:PatrolCandidate<Vec3>[]=[];
  for(let i=0;i<directions.length;i++){
   const index=(first+i)%directions.length;
   const [x,z]=directions[index]!;
   const candidate=new Vec3(foot.x+x*2,foot.y,foot.z+z*2);
   const projection=this.nav.auditNavMeshProjection(candidate);
   const goal=projection.nearestPoint;
   if(!projection.success||!goal||!this.sourceNativeCharacterFootHit(goal)||
      Math.hypot(goal.x-candidate.x,goal.z-candidate.z)>.28||
      Math.abs(goal.y-foot.y)>.7)continue;
   const point=new Vec3(goal.x,goal.y,goal.z);
   localCandidates.push({point,ink:inkAt(point),order:i,index});
  }
  const rankedLocal=this.f4PatrolNavigation.rank(id,this.b137NativeTick,foot,localCandidates,allies.map(a=>a.position),options);
  // Prefer real forward steps when no front corridor was admitted. Keep
  // the existing rank within each group and permit sideways/backward escape.
  const forward=(p:Vec3)=>(p.z-foot.z)*side>.25;
  const localOrder=prioritizeFront?
   [...rankedLocal.filter(c=>forward(c.point)),...rankedLocal.filter(c=>!forward(c.point))]:rankedLocal;
  for(const candidate of localOrder){
   const point=this.f4WholeWalkTarget(foot,candidate.point);
   if(!point||avoids(point))continue;
   // The Crowd target is only an intention. Each incremental step still
   // needs a same-world Rapier KCC result and capsule support.
   this.f4WholeDirections.set(id,(candidate.index+1)%directions.length);
   return request(point,true);
  }
  return false;
 }

 private chooseF4OriginalCorridorGoal(id:string,foot:Vec3,out:Vec3):boolean{
  const corridors=f4OriginalCorridorEndpoints(this.stage);
  if(!corridors.length||!this.physics||!this.isLiveRejoinedSourceCpu(id))return false;
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const supportAt=(point:Vec3)=>this.physics!.castCharacterFootSupport(
   new Vec3(point.x,point.y+offset,point.z),offset,'HUMAN');
  const current=supportAt(foot);
  if(!current||Math.abs(current.point.y-foot.y)>.18)return false;
  let patrol=this.f4OriginalPatrol.get(id);
  if(!patrol&&hasF4OriginalIngress(this.stage)){
   const side=this.bots.find(bot=>bot.id===id)?.team===Team.A?1:-1;
   const route=corridors.find(([,slope])=>Math.sign(slope[2])===side);
   if(route)patrol={route,target:0};
  }
  if(!patrol){
   for(const route of corridors){
    const at=route.findIndex(point=>foot.distance(new Vec3(...point))<1.25);
    if(at===-1)continue;
    patrol={route,target:at===0?1:0};
    break;
   }
  }
  if(!patrol)return false;
  const target=foot.distance(new Vec3(...patrol.route[patrol.target]))<.55?
   (patrol.target===0?1:0):patrol.target;
  const goal=new Vec3(...patrol.route[target]);
  const path=this.nav.auditPath(foot,goal,.20);
  const support=supportAt(goal);
  const start=path.nativePathPoints[0];
  // At a FloorSlope01 transition the detail mesh can be above the real
  // concrete at the same XZ. Accept that height bias only on the same floor.
  const projectedSupport=start&&path.startSnapDistanceMeters>.30?
   supportAt(new Vec3(start.x,start.y,start.z)):null;
  const sameFloorReentry=hasF4OriginalIngress(this.stage)&&start&&
   path.startSnapDistanceMeters<=.44&&Math.hypot(start.x-foot.x,start.z-foot.z)<=.12&&
   projectedSupport?.solidId===current.solidId&&
   Math.abs(projectedSupport.point.y-current.point.y)<=.05;
  if(!path.reachedTarget||path.pointCount<2||
     (path.startSnapDistanceMeters>.30&&!sameFloorReentry)||
     path.endSnapDistanceMeters>.30||!support||
     Math.abs(support.point.y-goal.y)>.08)return false;
  this.f4OriginalPatrol.set(id,{route:patrol.route,target});
  out.copy(goal);
  this.realGoalRequests++;
  return true;
 }

 chooseSourceGoal(id:string,realFoot:Vec3,out:Vec3,localActionsOpen=false):boolean{
  if(this.f4WholeSupport)return this.chooseF4WholeGoal(id,realFoot,out,localActionsOpen);
  // Post-splat respawn starts at the genuine ORIGINAL upper source spawn.
  // Reuse exactly the F2-assigned one-way offmesh FIRST DROP. The virtual
  // Recast agent gets only a goal; real feet remain under Rapier KCC.
  if(this.respawnOriginalDrops.has(id)){
   // New life cannot inherit a stale previously witnessed frontline goal.
   this.b443OriginalGoalLocks.delete(id);
   this.b442LastApprovedFront.delete(id);
   const bot=this.bots.find(b=>b.id===id);
   // F4's genuine concurrent B-side respawns previously packed four
   // physical capsules into a single narrow high-pad first-drop lip.
   // Queue ONLY new F4 lives per team, ordered by ACTUAL respawn events,
   // until the lead completes another genuine FIRST_DROP_REJOIN.
   // No actor placement, invented link, fall bypass, or score grant.
   if(bot&&isT21F4ResearchStage(this.stage)){
    const lead=[...this.respawnOriginalDrops].find(otherId=>
     this.bots.some(other=>other.id===otherId&&other.team===bot.team));
    if(lead!==id){this.heldRequests++;return false;}
   }
   const route=this.routeFor(id);
   const lower=new Vec3(...route.sourceGoal);
   if(!this.freeCombat||bot?.lifeState!=='ACTIVE'||
      bot.mobilityState!=='GROUND'||!this.hasSourceFootSupport(lower)){
    this.heldRequests++;this.respawnUnsafeReturnHolds++;return false;
   }
   const nav=this.nav.auditPath(realFoot,lower);
   if(!nav.reachedTarget||nav.startSnapDistanceMeters>.25||
      nav.endSnapDistanceMeters>.22||nav.pointCount===0){
    this.heldRequests++;this.respawnUnsafeReturnHolds++;return false;
   }
   out.copy(lower);
   this.realGoalRequests++;this.respawnOriginalGoalRequests++;
   return true;
  }
  if(!this.freeCombat||!this.physicallyRejoined.has(id)){
   this.b443OriginalGoalLocks.delete(id);
   this.b442LastApprovedFront.delete(id);
   this.heldRequests++;return false;
  }
  if(isT21F4OriginalTerrainStage(this.stage)){
   const bot=this.bots.find(candidate=>candidate.id===id);
   // The original-corridor branch precedes the photo guide's combat
   // check. Release its old move target while the native weapon has LOS.
   if(bot&&this.f4LiveCpuFiringLane(bot,realFoot))return false;
  }
  if(this.chooseF4OriginalCorridorGoal(id,realFoot,out))return true;
  // Opt-in F4 experiment: submit short native Crowd goals along the two
  // pre-existing center ramps, never a forced Actor pose or NavLink.
  // CpuAgentSystem's true Recast admission and shared Rapier KCC stay final.
  if((this.f4GuideByTeam?.size??0)>0){
   const bot=this.bots.find(b=>b.id===id);
   const guide=bot?this.f4GuideByTeam.get(bot.team):null;
   if(!bot||bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||
      !guide||!this.physics){this.heldRequests++;return false;}
   // Pause this CPU's route-following while a real opposing CPU is
   // physically visible within its own catalog weapon range. It can
   // resume the SAME photo guide as soon as the actual lane closes.
   // No synthetic goal, damage, hit, collider or teleport is introduced.
   if(this.f4LiveCpuFiringLane(bot,realFoot))return false;
   let next=this.f4GuideProgress.get(id)??0;
   while(next<guide.length){
    const p=guide[next]!;
    const dx=realFoot.x-p[0],dz=realFoot.z-p[2];
    if(Math.hypot(dx,dz)>.40||Math.abs(realFoot.y-p[1])>.28){
     // Avoidance can carry a CPU past the waypoint on the same ramp.
     // Use its actual foot along the outgoing segment to avoid backtracking.
     const following=guide[next+1];
     if(!following)break;
     const sx=following[0]-p[0],sz=following[2]-p[2];
     const t=(dx*sx+dz*sz)/(sx*sx+sz*sz);
     if(!(t>0&&t<=1)||Math.hypot(dx-sx*t,dz-sz*t)>.65||
        Math.abs(realFoot.y-(p[1]+(following[1]-p[1])*t))>.28)break;
    }
    next++;
   }
   this.f4GuideProgress.set(id,next);
   if(next===guide.length){this.heldRequests++;return false;}
   // Triangle centroids are source-identified PHOTO intents, but may
   // sit 0.21-0.25m outside the actually eroded Recast walkable polygon.
   // Move only to a REAL successful native projection within 0.30m,
   // then independently recheck its actual Rapier foot support. No new
   // floor, NavLink, Actor/Crowd teleport, or physics veto bypass.
   const photoGoal=new Vec3(...guide[next]!);
   const projection=this.nav.auditNavMeshProjection(photoGoal);
   const projectValid=projection.success===true&&
      projection.nearestPoint!==null&&
      projection.distanceMeters!==null&&
      projection.distanceMeters<=.30+1e-6;
   const target=projectValid?new Vec3(
    projection.nearestPoint!.x,projection.nearestPoint!.y,
    projection.nearestPoint!.z):photoGoal;
   const native=projectValid?
      this.nav.auditPath(realFoot,target,.35):null;
   const support=projectValid?this.physics.castCharacterFootSupport(new Vec3(
    target.x,target.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
    target.z),PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN'):null;
   const gap=support?Math.abs(support.point.y-target.y):null;
   const admitted=projectValid&&native!==null&&native.reachedTarget&&
      native.startSnapDistanceMeters<=.35&&
      native.endSnapDistanceMeters<=.30&&native.pointCount>0&&
      support!==null&&gap!==null&&gap<=.25;
   this.f4GuideLastAudit.set(id,{
    id,index:next,actualFoot:[realFoot.x,realFoot.y,realFoot.z],
    goal:[target.x,target.y,target.z],
    nativeReached:native?.reachedTarget??false,
    nativeStartSnap:native?.startSnapDistanceMeters??Infinity,
    nativeEndSnap:native?.endSnapDistanceMeters??Infinity,
    nativePathPoints:native?.pointCount??0,
    footSupportSolid:support?.solidId??null,
    supportGapMeters:gap,admitted
   });
   if(!admitted){this.heldRequests++;return false;}
   out.copy(target);this.realGoalRequests++;return true;
  }
  const candidates=this.patrolGoals.get(id);
  const bot=this.bots.find(b=>b.id===id);
  if(!bot||!candidates?.length){this.heldRequests++;return false;}
  const sign=bot.team===Team.A?1:-1;
  // Original F3 combat survival: genuine low native HP -> actual original
  // OWN ink -> safely remain until native regeneration reaches 70% -> resume
  // ordinary combat. No source geometry, real Actor, health, shots or clock
  // are written here. Every move still passes native Rapier/Recast authority.
  // Zero costly ownerGrid lookups for healthy 7/7 CPUs. The selected F3
  // battle must ALREADY use the actual source OWN-ink HP economy (B178).
  // Other SOURCE practice modes and all T20/default games remain untouched.
  if(this.enableB192HumanCombat&&this.enableOriginalSourceBattleRecovery&&
     this.sourceInk&&this.physics&&bot.lifeState==='ACTIVE'&&
     bot.mobilityState==='GROUND'&&this.physicallyRejoined.has(id)&&
     Number.isFinite(bot.hp)&&
     (bot.hp!<=GAME_CONFIG.combat.playerMaxHp*.35||
      this.originalSourceRecoveryIntent.has(id))&&
     this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'){
   const ink=this.sourceInk;
   const source=[
    this.stage.solids.length,this.stage.paintSurfaces.length,
    this.stage.navigationLinks?.length??-1,
    this.stage.paintSurfaces.filter(
     p=>(p.flags&SurfaceFlags.Scoreable)!==0).length
   ] as [number,number,number,number];
   // Use the same real Rapier support/backing and active owner-grid cell
   // as native CPU resources. A nearby OWN surface on a different slab
   // must not send a wounded bot to a false recovery destination.
   const actualOriginalOwnInk=(foot:Vec3)=>
    originalSourceRegisteredOwnFoot(
     ink,this.stage,this.physics!,foot,bot.team);
   // Only CURRENT, living, genuinely grounded original actors may be
   // tactical threats. This registered Rapier ray is a cover *preference*,
   // never a damage, path, actor-spawn or artificial enemy authorization.
   const exposedToRealEnemy=(foot:Vec3):boolean=>{
    const victim=new Vec3(foot.x,
     foot.y+GAME_CONFIG.cpu.hitSphereOffsetsMeters[1],foot.z);
    for(const enemy of this.bots){
     if(enemy.id===id||enemy.team===bot.team||
        enemy.lifeState!=='ACTIVE'||enemy.mobilityState!=='GROUND'||
        !this.physicallyRejoined.has(enemy.id)||!enemy.weaponId||
        !Number.isFinite(enemy.hp)||enemy.hp!<=0)continue;
     const range=Math.min(32,
      cpuWeaponRangeMeters(weaponProfile(enemy.weaponId, Boolean(this.f4WholeSupport))));
     if(Math.hypot(foot.x-enemy.position.x,
        foot.z-enemy.position.z)>range)continue;
     const origin=new Vec3(enemy.position.x,
      enemy.position.y+GAME_CONFIG.cpu.muzzleHeightMeters,
      enemy.position.z);
     if(!this.physics!.castStageSegment(
        origin,victim,'ink-projectile'))return true;
    }
    // Human is never manufactured as a bot. Only its SAME-TICK real KCC
    // grounded foot is evaluated in the existing 32m combat sight envelope.
    if(bot.team===Team.B&&this.b192HumanAliveGrounded&&
       this.b192NativeHumanMode==='HUMAN'&&
       this.b192HumanTick===this.b137NativeTick&&
       Math.hypot(foot.x-this.b192NativeHumanFoot.x,
        foot.z-this.b192NativeHumanFoot.z)<=32){
     const p=this.b192NativeHumanFoot;
     const origin=new Vec3(p.x,
      p.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,p.z);
     if(!this.physics!.castStageSegment(
        origin,victim,'ink-projectile'))return true;
    }
    return false;
   };
   const exposedHere=exposedToRealEnemy(realFoot);
   const recovery={
    source,selectedOriginalCombat:true,activeGroundedRejoined:true,
    team:bot.team===Team.A?'A' as const:'B' as const,
    hp:bot.hp??NaN,maxHp:GAME_CONFIG.combat.playerMaxHp,
    realFoot:[realFoot.x,realFoot.y,realFoot.z] as [number,number,number],
    recoveringFromRealDamage:this.originalSourceRecoveryIntent.has(id),
    originalCandidates:candidates.map((goal,index)=>({
     index,foot:[goal.x,goal.y,goal.z] as [number,number,number],
     actualOwnOriginalPaintCell:actualOriginalOwnInk(goal),
     exposedToRealEnemy:exposedToRealEnemy(goal)
    }))
   };
   if(originalSourceCpuWoundedRecoveryActive(recovery)){
    if(!this.originalSourceRecoveryIntent.has(id)){
     // Discard the previous in-flight frontline preference, not the CPU
     // physical foot. A later normal combat selection must be freshly
     // approved by the existing source-only gates.
     this.b443OriginalGoalLocks.delete(id);
     this.b442LastApprovedFront.delete(id);
     this.originalSourceRecoveryIntent.add(id);
    }
    if(originalSourceCpuMayHoldOwnInk(
       recovery,actualOriginalOwnInk(realFoot),exposedHere)&&
       this.hasSourceFootSupport(realFoot)){
     // closestPoint may echo the submitted foot on a failed Recast query.
     // Require a real nearest-poly observation before holding this goal.
     const projection=this.nav.auditNavMeshProjection(realFoot);
     if(originalSourceWoundedHoldNativeFoot(realFoot,projection)){
      out.copy(realFoot);
      this.realGoalRequests++;
      return true;
     }
    }
    for(const index of rankOriginalSourceCombatRetreatGoals(recovery)){
     const safeGoal=candidates[index];
     if(!safeGoal||!this.hasSourceFootSupport(realFoot)||
        !this.hasSourceFootSupport(safeGoal))continue;
     const native=this.nav.auditPath(realFoot,safeGoal);
     if(!native.reachedTarget||native.pointCount===0||
        native.startSnapDistanceMeters>.20||
        native.endSnapDistanceMeters>.20||
        !this.hasSourceSupportedRoute(native,sign))continue;
     out.copy(safeGoal);
     this.realGoalRequests++;
     return true;
    }
    // No genuine OWN retreat path was certified. Do not fall through to
    // an aggressive player C order, enemy pursuit or forward patrol.
    // Returning false makes CpuAgentSystem reset the native move target;
    // the physical CPU stays under its ordinary Rapier authority and
    // can continue real ink/HP recovery or defend using its weapon.
    // Re-evaluate next tactical tick; never place a new waypoint/ink.
    this.heldRequests++;
    return false;
   }else this.originalSourceRecoveryIntent.delete(id);
  }else this.originalSourceRecoveryIntent.delete(id);
  // A pending true C-key teammate goal remains available once the
  // wounded CPU can safely resume. An actually reachable OWN retreat
  // takes priority over player-directed movement; no actor is moved by
  // this decision and the original Recast/Rapier path gates still apply.
  // Real Chromium B484: user-ordered A1 reached within 0.103m of its
  // ORIGINAL goal but ordinary patrol immediately returned it >3m away.
  // For at most 120 genuine 60Hz ticks after actual B471 arrival, let
  // CpuAgentSystem use its existing resetMoveTarget() instead of issuing
  // a different patrol request. A1 still uses normal real weapons/ink.
  if(id==='A1'&&this.b471ArrivedOriginalDwell){
   const dwell=this.b471ArrivedOriginalDwell;
   const supported=bot.lifeState==='ACTIVE'&&
    bot.mobilityState==='GROUND'&&
    this.physicallyRejoined.has('A1');
   if(supported&&b485MayDwellAtTrueOriginalA1Arrival({
    nativeTick:this.b137NativeTick,arrivalTick:dwell.arrivalTick,
    goal:[dwell.goal.x,dwell.goal.y,dwell.goal.z],
    physicalFoot:[realFoot.x,realFoot.y,realFoot.z],
    originalSource:[this.stage.solids.length,
     this.stage.paintSurfaces.length,
     this.stage.navigationLinks?.length??0,
     this.stage.paintSurfaces.filter(p=>
      (p.flags&SurfaceFlags.Scoreable)!==0).length],
    enabled:this.enableB137OriginalAllyRally&&
     this.enableB150AllySupportInk,
    orderStatus:this.b471OrderStatus,
    practiceRunning:this.b171AllySyncPracticeRunning,
    rejoined:supported,aliveGrounded:supported,
    realFootSupported:this.hasSourceFootSupport(realFoot),
    originalGoalSupported:this.hasSourceFootSupport(dwell.goal)
   }))return false;
   this.b471ArrivedOriginalDwell=null;
  }
  // B471: PLAYER-C-key native co-op. Rank ALREADY-vetted original
  // A1 SOURCE patrol feet by true OwnerGrid ink; never invent a point.
  // Request goal from real A1 foot ONLY after original Recast + Rapier
  // certify both endpoints and every <=0.30m intermediate source point.
  const playerOrder=this.b471AllyOrder;
  // An injured A1 cannot carry out a queued C-key attack/move order
  // simply because no safe OWN retreat route was available this tick.
  // Keep the real order pending until genuine HP recovery ends.
  if(id==='A1'&&playerOrder&&!this.originalSourceRecoveryIntent.has(id)){
   if(this.b137NativeTick-playerOrder.requestedTick>900||
      bot.lifeState!=='ACTIVE'||bot.mobilityState!=='GROUND'||
      !this.physicallyRejoined.has('A1')||
      !this.b171AllySyncPracticeRunning){
    this.b471AllyOrder=null;this.b471OrderStatus='EXPIRED';
    this.b471SourceDecision='SOURCE_ORDER_EXPIRED';
   }else if(this.sourceInk&&this.physics){
    if(!playerOrder.goal){
     // The genuine player-directed A1 also avoids crowding A2/A3's
     // current physically observed feet AND their B443 in-flight ORIGINAL
     // goal locks when native owner-grid opportunities are equal.
     // Stronger real unpainted SOURCE opportunity still wins. The exact
     // existing physical Recast/Rapier approval remains below.
     const ranked=distributeOriginalSourceGoalCoverage(
      rankOriginalSourcePatrolGoals(
       candidates,Team.A,this.sourceInk,0),
      candidates,this.actualTeamCoveragePositions('A1',Team.A));
     let freshEligibleOriginalGoals=0;
     for(const rank of ranked){
      // The center may be already ours while real SAME-SURFACE
      // neighbor owner-grid cells still need ink. Keep original-foot,
      // full-path Rapier/Recast and 0 Scoreable authority unchanged.
      if(!existingOriginalSourceInkOpportunity(rank))continue;
      freshEligibleOriginalGoals++;
      const goal=candidates[rank.index]!;
      if(goal.z<33||goal.y<2.7||goal.y>5.25||
         Math.hypot(goal.x-realFoot.x,
          goal.y-realFoot.y,goal.z-realFoot.z)<2.5||
         !this.hasSourceFootSupport(realFoot)||
         !this.hasSourceFootSupport(goal))continue;
      const path=this.nav.auditPath(realFoot,goal);
      if(!path.reachedTarget||path.startSnapDistanceMeters>.20||
         path.endSnapDistanceMeters>.20||
         !this.hasSourceSupportedRoute(path,1)){
       this.b471RejectedOriginalRoutes++;continue;
      }
      playerOrder.goal=goal.clone();
      playerOrder.realAllyFootAtApproval=realFoot.clone();
      this.b471StrictlyApprovedOriginalGoals++;
      if(rank.priority==='OWN')
       this.b471ApprovedOriginalNeighborhoodInkGoals++;
      this.b471OrderStatus='MOVING';
      this.b471SourceDecision='ORIGINAL_GOAL_GRANTED';break;
     }
     if(!playerOrder.goal){
      this.b471AllyOrder=null;this.b471OrderStatus='HOLD';
      this.b471SourceDecision=freshEligibleOriginalGoals===0?
       'NO_VERIFIED_FRESH_SOURCE_TARGET':'NO_VERIFIED_ORIGINAL_PATH';
     }
    }
    if(playerOrder.goal){
     if(Math.hypot(realFoot.x-playerOrder.goal.x,
         realFoot.z-playerOrder.goal.z)<=1.5){
      // Arrival is TRUE only if the actual same-tick KCC foot and
      // existing source goal are BOTH supported by registered Rapier.
      if(this.hasSourceFootSupport(realFoot)&&
         this.hasSourceFootSupport(playerOrder.goal)&&
         Math.abs(realFoot.y-playerOrder.goal.y)<=.25){
       this.b471ActualOriginalArrivals++;
       this.b471ArrivedOriginalDwell={
        goal:playerOrder.goal.clone(),arrivalTick:this.b137NativeTick
       };
       this.b471OrderStatus='ARRIVED';
       this.b471SourceDecision='ORIGINAL_ARRIVAL';
      }else{
       this.b471RejectedOriginalRoutes++;
       this.b471OrderStatus='HOLD';
       this.b471SourceDecision='ORIGINAL_ARRIVAL_UNSUPPORTED';
      }
      this.b471AllyOrder=null;
      // An actual arrival OR unsupported arrival terminates the current
      // native goal decision. Otherwise the normal patrol below could
      // immediately supersede the genuine C-key order before A1's next
      // 120-tick Rapier-supported dwell check. A false result causes
      // CpuAgentSystem to reset its previous native Crowd target.
      return false;
     }else{
      const path=this.nav.auditPath(realFoot,playerOrder.goal);
      if(this.hasSourceFootSupport(realFoot)&&
         this.hasSourceFootSupport(playerOrder.goal)&&
         path.reachedTarget&&path.startSnapDistanceMeters<=.20&&
         path.endSnapDistanceMeters<=.20&&
         this.hasSourceSupportedRoute(path,1)){
       out.copy(playerOrder.goal);
       this.realGoalRequests++;this.b471ActualNativeGoalRequests++;
       return true;
      }
      this.b471RejectedOriginalRoutes++;
      this.b471AllyOrder=null;this.b471OrderStatus='HOLD';
      this.b471SourceDecision='ORIGINAL_PATH_LOST';
      // Do not replace a failed original path with a different patrol
      // target during this same tactical decision.
      return false;
     }
    }
   }
  }
  // F3-B: in this opt-in source game only, real B-team CPUs can pursue
  // the real grounded HUMAN when the human actually occupies their
  // registered B-side source floor. Recast is a goal, never movement.
  const h=this.b192NativeHumanFoot;
  if(eligibleB192SourceHumanPursuit({
   enabled:this.enableB192HumanCombat,
   nativeTick:this.b137NativeTick,humanTick:this.b192HumanTick,
   cpuId:id,cpuTeam:bot.team,
   cpuGrounded:bot.mobilityState==='GROUND',
   cpuRejoined:this.physicallyRejoined.has(id),
   // The seven real SOURCE CPUs must join before the match starts. Once
   // freeCombat is latched, a subsequent genuine splat must not silence
   // other living, individually rejoined defenders' legal pursuit.
   sevenRejoined:this.freeCombat,
   humanAliveGrounded:this.b192HumanAliveGrounded,
   cpuFoot:realFoot,humanFoot:h,
   solids:this.stage.solids.length,paint:this.stage.paintSurfaces.length,
   links:this.stage.navigationLinks?.length??0,
   scoreable:this.stage.paintSurfaces.filter(
    p=>(p.flags & SurfaceFlags.Scoreable)!==0).length
  })){
   // Live endpoints and a native route locate candidate firing positions.
   // Re-audit the full walk to each candidate before assigning a goal.
   if(this.hasSourceFootSupport(realFoot)&&this.hasSourceFootSupport(h)){
    const route=this.nav.auditPath(realFoot,h);
    if(route.querySuccess&&route.startSnapDistanceMeters<=.20&&
       route.endSnapDistanceMeters<=.20){
     const combatGoal=this.chooseReachableSourceCombatGoal(realFoot,route,h,-1,bot,true);
     if(combatGoal){
      this.patrolIndex.set(id,-1);
      out.copy(combatGoal); // genuine Crowd goal only; no actor pose write
      this.realGoalRequests++;this.engagementGoalRequests++;
      this.b192ApprovedHumanCombatGoals++;
      return true;
     }
    }
   }
   this.b192RejectedHumanCombatGoals++;
  }
  // W10-B1: genuine opponent feet can become tactical destinations ONLY
  // after all seven original physical drops/rejoins. On this frozen source
  // lab the two teams currently remain separated, so no false cross-map
  // engagement is manufactured. Recast supplies a GOAL, never physical
  // movement authority: CpuAgentSystem still validates every actual step
  // with the source Rapier human-size KCC and actor collision gate.
  if(realFoot.z*sign>=33&&realFoot.y>=2.7&&realFoot.y<=5.25){
   const opponents=this.bots.filter(other=>
    sourceNativeEligibleOpponentForCombat(
     bot,other,realFoot,sign,this.physicallyRejoined))
    .map(other=>({other,distance:Math.hypot(
     other.position.x-realFoot.x,other.position.z-realFoot.z)}))
    .filter(candidate=>candidate.distance>=1.7&&candidate.distance<=
     (this.enableB192HumanCombat?18:10))
    .sort((a,b)=>a.distance-b.distance);
   for(const {other} of opponents){
    this.sameSourceEnemyCandidates++;
    if(!this.hasSourceFootSupport(realFoot)||
       !this.hasSourceFootSupport(other.position)){
     this.deniedUnsupportedEnemyFeet++;continue;
    }
    // Both endpoints are actual CPU feet, not hand-authored enemy spawns.
    // A partial native path can offer a firing lane on the CPU's own
    // floor. The candidate must pass a fresh complete audit and clear LOS.
    const native=this.nav.auditPath(realFoot,other.position);
    if(!native.querySuccess||native.startSnapDistanceMeters>.20||
       native.endSnapDistanceMeters>.20){
     this.deniedNativeEnemyPaths++;continue;
    }
    const combatGoal=this.chooseReachableSourceCombatGoal(
     realFoot,native,other.position,sign as 1|-1,bot);
    if(!combatGoal){
     this.rejectedUnsupportedNativeRoutes++;continue;
    }
    this.patrolIndex.set(id,-1);
    out.copy(combatGoal);
    this.realGoalRequests++;
    this.engagementGoalRequests++;
    return true;
   }
  }
  // B171: only actual RUNNING ALLY_SYNC, not baseline ALLY_RALLY.
  // B169: explicit source ally-ink opt-in, while the real human is
   // physically grounded at the original upper area. Reposition real A1
   // toward an EXISTING source patrol foot away from the authored HUMAN
   // first-drop landing, rather than letting A1 wander during the upper
   // human ink challenge. Every actual source Rapier point and all Recast
   // polyline segments must pass again. If none pass, legacy patrol wins.
   if(this.enableB137OriginalAllyRally&&
      this.enableB150AllySupportInk&&id==='A1'&&
      bot.lifeState!=='SPLATTED'&&this.b169HumanUpperGrounded&&
      this.b171AllySyncPracticeRunning){
    this.b169SourceAdvanceGuardChecks++;
    const landing=this.routeFor('HUMAN').originalLanding;
    const goals=rankB169OriginalAdvanceGuardGoals({
     enabled:true,allySyncPracticeRunning:this.b171AllySyncPracticeRunning,
     // B196-198 tight guard failed native human KCC three times.
     // Restore B195-proven 5m guard; react only to actual KCC overlap.
     preferPlayableCoopNearGuard:false,
     humanGrounded:true,humanActive:true,
     realUpperHumanFoot:this.b137ActualHumanFoot,
     realLowerA1Foot:realFoot,
     authoredHumanDropLanding:{x:landing[0],y:landing[1],z:landing[2]},
     alreadyAuditedOriginalPatrolFeet:candidates
    });
    for(const goal of goals){
     // B170: the ranker returns original coordinates, not Vec3 instances.
     // Preserve the EXACT original foot when invoking native Recast/Crowd.
     const sourceGoal=new Vec3(goal.x,goal.y,goal.z);
     if(!this.hasSourceFootSupport(realFoot)||
        !this.hasSourceFootSupport(sourceGoal)){
      this.b169RejectedUnsafeOrUnreachableGoals++;continue;
     }
     const native=this.nav.auditPath(realFoot,sourceGoal);
     if(!native.reachedTarget||native.startSnapDistanceMeters>.20||
        native.endSnapDistanceMeters>.20||
        !this.hasSourceSupportedRoute(native,1)){
      this.b169RejectedUnsafeOrUnreachableGoals++;continue;
     }
     this.patrolIndex.set(id,-1);
     out.copy(sourceGoal);
     this.realGoalRequests++;
     this.b169NativeAdvanceGuardTargets++;
     return true;
    }
   }
   // B199: real player-selected A1 co-op only. B196-B198 native Chrome
   // trapped the human at a genuine 0.6m separation from physical A1,
   // and BOTH actor shots and movement stalled. Offer a DIFFERENT
   // EXISTING original patrol foot outside the actual human's lane.
   // Never reposition actor directly: original native Recast plus Rapier
   // must approve the whole path before CpuAgentSystem can attempt movement.
   if(this.enableB199PlayerCoopCollisionRecovery&&id==='A1'&&
      bot.team===Team.A&&bot.mobilityState==='GROUND'&&
      bot.lifeState!=='SPLATTED'&&this.physics&&
      this.b137HumanFootValid&&this.b171AllySyncPracticeRunning){
    const h=this.b137ActualHumanFoot;
    const safe=b199ActualAllyCollisionReliefCandidates({
     enabled:true,allySyncPracticeRunning:this.b171AllySyncPracticeRunning,
     humanGrounded:true,humanActive:true,cpuRejoined:this.physicallyRejoined.has(id),
     human:h,cpu:realFoot,existingAuditedSourceFeet:candidates
    });
    if(safe.length)this.b199ActualCollisionReliefChecks++;
    for(const candidate of safe){
     const g=new Vec3(candidate.x,candidate.y,candidate.z);
     if(!this.hasSourceFootSupport(g)){
      this.b199RejectedUnsafeReliefPaths++;continue;
     }
     const native=this.nav.auditPath(realFoot,g);
     if(!native.reachedTarget||native.startSnapDistanceMeters>.20||
        native.endSnapDistanceMeters>.20||
        !this.hasSourceSupportedRoute(native,1)){
      this.b199RejectedUnsafeReliefPaths++;continue;
     }
     this.b143ApprovedNativeAllyGoal=null;
     this.patrolIndex.set(id,-1);
     out.copy(g);this.realGoalRequests++;
     this.b199OriginalNativeReliefGoals++;
     return true;
    }
   }
   // B137: A1 may rally to the REAL, same-team human foot in the
  // already reachable source-lower area, after 7 true CPU releases.
  // Unlike legacy patrol (which keeps per-step KCC defense), this dynamic
  // actor-following target requires a full original floor + endpoint +
  // EVERY-intermediate Recast/Rapier source path audit. If any check
  // fails, use the exact unchanged original patrol below.
  if(this.enableB137OriginalAllyRally&&id==='A1'){
   this.b137RealCandidateChecks++;
   const human=this.b137ActualHumanFoot;
   // B143: after an actually source-certified B142 goal, keep A1
   // approaching the old 2m standoff in [1.7,3)m rather than rejoining
   // unrelated patrol when the new B137 >=3m goal gate closes.
   const previous=this.b143ApprovedNativeAllyGoal;
   if(previous){
    const retain=this.b137HumanFootValid&&!!this.physics&&
     bot.team===Team.A&&bot.mobilityState==='GROUND'&&
     bot.lifeState!=='SPLATTED'&&mayRetainB143OriginalAllyStandoff({
      nativeTick:this.b137NativeTick,
      previousApprovedTick:previous.lastCheckedTick,
      realCpuFoot:realFoot,realHumanFoot:human,
      lastApprovedHumanFoot:previous.humanFoot,
      originalGoal:previous.target
     });
    if(retain){
     const sourceFlat=(v:Vec3)=>{
      const hit=this.sourceNativeCharacterFootHit(v);
      return hit?inspectB130OriginalFlatSource({
       nativeTick:this.b137NativeTick,
       actualRapierBody:[v.x,v.y+
        PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,v.z],
       actualRapierSupportId:hit.solidId
      }):null;
     };
     const hasStrictFlat=(v:Vec3)=>{
      const w=sourceFlat(v);
      return !!w?.insideRegisteredOriginalXZFootprint&&
       w.originalFlatVerticalBandWithin22cm&&
       w.distanceToOriginalPolygonBoundaryMeters>=.75;
     };
     if(hasStrictFlat(realFoot)&&hasStrictFlat(human)&&
        hasStrictFlat(previous.target)){
      const toHuman=this.nav.auditPath(realFoot,human);
      const toTarget=this.nav.auditPath(realFoot,previous.target);
      const valid=(audit:typeof toHuman)=>audit.reachedTarget&&
       audit.startSnapDistanceMeters<=.20&&
       audit.endSnapDistanceMeters<=.20&&
       this.hasSourceSupportedRoute(audit,1);
      if(valid(toHuman)&&valid(toTarget)){
       this.patrolIndex.set(id,-1);
       out.copy(previous.target);
       this.realGoalRequests++;
       this.b143ReauthorizedStableStandoffGoals++;
       this.b143ApprovedNativeAllyGoal={
        target:previous.target.clone(),humanFoot:human.clone(),
        lastCheckedTick:this.b137NativeTick
       };
       return true;
      }
     }
    }
    this.b143UnsafeOrStaleGoalHoldsRejected++;
    this.b143ApprovedNativeAllyGoal=null;
   }
   if(this.b137HumanFootValid&&
      eligibleB137OriginalAllyRally({
       enabled:true,actorId:id,team:bot.team,
       cpuGrounded:bot.mobilityState==='GROUND',
       humanGrounded:true,humanActive:true,
       realCpuFoot:realFoot,realHumanFoot:human
      })&&this.physics){
    // Both exact physical endpoint source solids, NOT a paint decal.
    const nativeFootHit=(p:Vec3)=>this.sourceNativeCharacterFootHit(p);
    const botHit=nativeFootHit(realFoot),humanHit=nativeFootHit(human);
    if(botHit&&humanHit){
     const originalFlat=(foot:Vec3,id:string)=>inspectB130OriginalFlatSource({
      nativeTick:this.b137NativeTick,
      actualRapierBody:[foot.x,foot.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,foot.z],
      actualRapierSupportId:id
     });
     const b=originalFlat(realFoot,botHit.solidId);
     const h=originalFlat(human,humanHit.solidId);
     // Foot CENTER must be safely in an actual unmodified polygon,
     // including original holes. This does NOT certify capsule clearance.
     if(b?.insideRegisteredOriginalXZFootprint&&
        b.originalFlatVerticalBandWithin22cm&&
        b.distanceToOriginalPolygonBoundaryMeters>=.75&&
        h?.insideRegisteredOriginalXZFootprint&&
        h.originalFlatVerticalBandWithin22cm&&
        h.distanceToOriginalPolygonBoundaryMeters>=.75){
      const route=this.nav.auditPath(realFoot,human);
      if(route.reachedTarget&&route.startSnapDistanceMeters<=.20&&
         route.endSnapDistanceMeters<=.20&&
         this.hasSourceSupportedRoute(route,1)){
       // B142: never steer native A1 into the REAL human occupied capsule.
       // The path-derived 2m standoff is a proposal, not navigation authority.
       const candidate=chooseB142OriginalAllyStandoff(
        route.nativePathPoints,human);
       const target=candidate?new Vec3(candidate.x,candidate.y,candidate.z):null;
       const hit=target?nativeFootHit(target):null;
       const flat=hit&&target?originalFlat(target,hit.solidId):null;
       if(target&&flat?.insideRegisteredOriginalXZFootprint&&
          flat.originalFlatVerticalBandWithin22cm&&
          flat.distanceToOriginalPolygonBoundaryMeters>=.75){
        const path=this.nav.auditPath(realFoot,target);
        if(path.reachedTarget&&path.startSnapDistanceMeters<=.20&&
           path.endSnapDistanceMeters<=.20&&
           this.hasSourceSupportedRoute(path,1)){
         this.patrolIndex.set(id,-1);
         out.copy(target);
         this.realGoalRequests++;
         this.b137ApprovedNativeRallies++;
         this.b142OriginalStandoffGoalsApproved++;
         this.b143ApprovedNativeAllyGoal={
          target:target.clone(),humanFoot:human.clone(),
          lastCheckedTick:this.b137NativeTick
         };
         return true;
        }
       }
       this.b142UnsafeStandoffGoalsDenied++;
      }
      this.b137UnsafeOrUnsupportedRallies++;
     }else this.b137MissingSourceFloorProof++;
    }else this.b137MissingSourceFloorProof++;
   }
  }
  // B3's two genuine distant front goals can still lead into a Rapier
  // unsupported local leg (true 36s B3: 0.07m, 105 KCC denials).
  // Only a CURRENT witnessed unsupported ramp contact can preempt
  // those goals with another STRICTLY audited registered ramp target.
  if(id==='B3'&&this.tryOriginalRampLocalRecovery(id,realFoot,out))
   return true;
  // B441 opt-in: toward a frontward point on EXISTING original solid.
  // Even after constructor proof, re-check the current true CPU foot to
  // that goal in native Recast, every ~0.30m Rapier segment and endpoint.
  // A failed route always falls through to the legacy proven patrol.
  if(this.enableB441SourceFrontline&&id!=='A1'&&this.physics){
   let fronts=this.b441FrontGoals.get(id)??[];
   const gate=this.b445FrontlineGates.get(id);
   if(gate){
    gate.runtimeChooseInvocations++;
    if(fronts.length===0)gate.runtimeNoOriginalFrontGoals++;
   }
   // B446: one read-only pass from the actual, physically rejoined CPU
   // location, not the cached original landing position. This can expose
   // a strictly supported route that was absent from a landing-origin
   // Recast query; it NEVER promotes that route to a Crowd goal.
   if(fronts.length===0&&!this.b446LiveFootProbes.has(id)&&
      bot.mobilityState==='GROUND'&&bot.lifeState==='ACTIVE'){
    const report:{-readonly [K in keyof B446RealFootDryRouteProbe]:B446RealFootDryRouteProbe[K]}={
     id,nativeTick:this.b137NativeTick,
     actualPhysicalFoot:[realFoot.x,realFoot.y,realFoot.z],
     inspectedOriginalGoals:0,deniedRapierOrBoundary:0,
     nativeUnreached:0,nativeStartSnap:0,nativeEndSnap:0,
     nativeIntermediateSupport:0,passedAllOriginalChecks:0,
     firstPassingExistingGoal:null,passingExistingGoals:[],
     b450FailedOriginalGoals:[],probeOnlyNoActorOrGoalWrites:true
    };
    const proposals=proposeB441OriginalFrontline(this.stage,
     bot.team===Team.A?'A':'B');
    for(const p of proposals){
     report.inspectedOriginalGoals++;
     const goal=new Vec3(...p.point);
     const source=this.sourceNativeCharacterFootHit(goal);
     const flat=source?inspectB130OriginalFlatSource({
      nativeTick:this.b137NativeTick,
      actualRapierBody:[goal.x,goal.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
      actualRapierSupportId:source.solidId}):null;
     if(!source||source.solidId!==p.sourceSolidId||
       !flat?.insideRegisteredOriginalXZFootprint||
       !flat.originalFlatVerticalBandWithin22cm||
       flat.distanceToOriginalPolygonBoundaryMeters<.75||
       !this.hasSourceFootSupport(realFoot)){
      report.deniedRapierOrBoundary++;continue;
     }
     const route=this.nav.auditPath(realFoot,goal);
     if(!route.reachedTarget){
      report.nativeUnreached++;continue;
     }
     if(route.startSnapDistanceMeters>.20){
      report.nativeStartSnap++;continue;
     }
     if(route.endSnapDistanceMeters>.20){
      report.nativeEndSnap++;continue;
     }
     if(!this.hasSourceSupportedRoute(route,sign)){
      report.nativeIntermediateSupport++;
      // B450 only replays REJECTED native routes with identical 0.30m
      // sampling and original Rapier queries. No goal/actor/clock writes.
      if(id==='B2'||id==='B4'){
       const firstDenied=b450FirstSourceDenial(
        route.nativePathPoints,sign,point=>{
         // Classify the denied route using the same existing HUMAN
         // support semantics as the true CPU goal gate.
         const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
         const hit=this.physics!.castCharacterFootSupport(
          new Vec3(point.x,point.y+offset,point.z),offset,'HUMAN');
         const gap=hit?Math.abs(hit.point.y-point.y):null;
         return {supported:!!hit&&gap!==null&&gap<=.25&&
          this.stage.solids.some(s=>s.id===hit.solidId),
          solidId:hit?.solidId??null,gapMeters:gap};
        });
       report.b450FailedOriginalGoals.push({
        originalGoal:[goal.x,goal.y,goal.z],
        originalGoalSolidId:p.sourceSolidId,
        nativePathPointCount:route.nativePathPoints.length,firstDenied
       });
      }
      continue;
     }
     report.passedAllOriginalChecks++;
     // Only store coordinates that ALREADY survived all B446 checks,
     // not arbitrary Nav corners, future actor positions or guessed paint.
     if(report.passingExistingGoals.length<32)
      report.passingExistingGoals.push([goal.x,goal.y,goal.z]);
     if(report.firstPassingExistingGoal===null)
      report.firstPassingExistingGoal=[goal.x,goal.y,goal.z];
    }
    this.b446LiveFootProbes.set(id,report);
   }
   // B448 strict and SEPARATELY selected player FRONTLINE only.
   // The B446 dry route pass observed multiple real SOURCE A3 candidates
   // from the native A3 foot (none from the frozen first-drop landing).
   // Choose among those *same-foot fully checked* original source goals
   // using actual ownerGrid opportunity and real A1/A2 positions/locks.
   // Every chosen candidate is independently rechecked below with the
   // identical Rapier footprint and full 0.30m native Recast route gate.
   // B441 alone cannot enable this. No fake goal or physical teleport.
   if(this.enableB448A3LiveOriginalFront&&id==='A3'&&
      fronts.length===0){
    const dry=this.b446LiveFootProbes.get(id);
    if(dry&&dry.firstPassingExistingGoal&&
       dry.passedAllOriginalChecks>0&&
       dry.passingExistingGoals.length>0&&
       dry.probeOnlyNoActorOrGoalWrites===true&&
       dry.nativeTick===this.b137NativeTick&&
       this.physicallyRejoined.has(id)&&
       bot.mobilityState==='GROUND'&&bot.lifeState==='ACTIVE'){
     const proofPoints=dry.passingExistingGoals.map(p=>new Vec3(...p));
     const ranked=this.sourceInk?
      distributeOriginalSourceGoalCoverage(
       rankOriginalSourcePatrolGoals(
        proofPoints,Team.A,this.sourceInk,0),
       proofPoints,this.actualTeamCoveragePositions('A3',Team.A)):
      null;
     const ordered=ranked?
      ranked.map(row=>proofPoints[row.index]!):proofPoints;
     const proposals=proposeB441OriginalFrontline(this.stage,'A');
     for(const goal of ordered){
      const proposal=proposals.find(p=>
       p.sourceSolidId==='UndertowT21D:right-low-team-a'&&
       Math.hypot(p.point[0]-goal.x,p.point[1]-goal.y,
        p.point[2]-goal.z)<.001);
      if(!proposal||goal.z<33)continue;
      const hit=this.sourceNativeCharacterFootHit(goal);
      const flat=hit?inspectB130OriginalFlatSource({
       nativeTick:this.b137NativeTick,
       actualRapierBody:[goal.x,goal.y+
        PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
       actualRapierSupportId:hit.solidId}):null;
      if(hit?.solidId!==proposal.sourceSolidId||
         !flat?.insideRegisteredOriginalXZFootprint||
         !flat.originalFlatVerticalBandWithin22cm||
         flat.distanceToOriginalPolygonBoundaryMeters<.75||
         !this.hasSourceFootSupport(realFoot)||
         !this.hasSourceFootSupport(goal))continue;
      const route=this.nav.auditPath(realFoot,goal);
      if(!route.reachedTarget||route.startSnapDistanceMeters>.20||
         route.endSnapDistanceMeters>.20||
         !this.hasSourceSupportedRoute(route,sign))continue;
      // Only an existing fully reapproved SOURCE goal, not a new
      // physical path, is submitted to the actual native Crowd agent.
      fronts=[goal];this.b441FrontGoals.set('A3',fronts);
      this.b448A3FreshLiveOriginalGoalsAuthorized++;
      break;
     }
     if(fronts.length===0)this.b448A3FreshLiveOriginalHolds++;
    }else this.b448A3FreshLiveOriginalHolds++;
   }
   // B467: on the EXPLICIT B441 SOURCE-front research path ONLY,
   // retry B2/B4 once they have ACTUALLY traversed the original lower
   // ramp on native Rapier KCC and stand on the registered right-low B
   // floor. Their old first-drop Recast Y-mismatch HOLD is not erased.
   // The late route uses the SAME <=0.20m snap, <=0.25m per-0.30m
   // registered static floor check, untouched Recast and true Crowd.
   // B468: B2/B4 reached the first genuinely granted B-side goal
   // in the same native world. Only after 120 genuine dwell ticks do we
   // recheck a DIFFERENT existing SOURCE candidate from today's REAL
   // Rapier foot. A second goal is never inferred from the first route.
   const nativeLock=this.b443OriginalGoalLocks.get(id);
   let newlyExtendedNativeFront:Vec3|null=null;
   const arrivedSinceTick=nativeLock?.arrivedSinceTick??null;
   const lockedOriginalGoal=nativeLock?[
    nativeLock.target.x,nativeLock.target.y,nativeLock.target.z
   ] as [number,number,number]:null;
   const actualBOriginalLowFloor=
    (id==='B2'||id==='B4')?
     (this.sourceNativeCharacterFootHit(realFoot)?.solidId??null):null;
   // Normal healthy B2/B4 now genuinely reach B441-original goals.
   // They have NO old denied-foot B446 probe, so the old B467-only
   // retry could never expand their ink coverage beyond the initial
   // two goals. Admit a NEW audit scheduler only after a proven B443
   // 120-tick physical dwell on the registered right-low B solid.
   const initialBFrontDwell=(id==='B2'||id==='B4')&&
    b468MayReauditInitiallyApprovedOriginalBGoal(this.stage,{
     id,nativeTick:this.b137NativeTick,
     approvedOriginalGoals:fronts.length,
     initialStrictOriginalGoals:gate?.strictlyApprovedGoals??0,
     arrivedSinceTick,heldGoal:lockedOriginalGoal,
     realFoot:[realFoot.x,realFoot.y,realFoot.z],
     actualOriginalSolidId:actualBOriginalLowFloor,
     lastRetryNativeTick:this.b467LastLiveRetryTick.get(id)??null,
     rejoined:this.physicallyRejoined.has(id),
     active:bot.lifeState==='ACTIVE',
     grounded:bot.mobilityState==='GROUND'
    });
   const mayExtendBFront=initialBFrontDwell||
    b468MayRetryDifferentOriginalBGoalAfterRealDwell({
     id,nativeTick:this.b137NativeTick,
     approvedOriginalGoals:fronts.length,
     originallyAuthorized:this.b467LiveSourceGoals.has(id),
     arrivedSinceTick,heldGoal:lockedOriginalGoal,
     realFoot:[realFoot.x,realFoot.y,realFoot.z]
    });
   if((fronts.length===0||mayExtendBFront)&&
      (id==='B2'||id==='B4')&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'){
    const initial=this.b446LiveFootProbes.get(id);
    const hit=this.sourceNativeCharacterFootHit(realFoot);
    // A previously DENIED foot still needs the existing 60-tick B467
    // proof. The independently proven initial B441 goal uses the
    // physically observed 120-tick B443 dwell route instead. Both
    // branches keep full original Rapier + Recast proposal checks.
    if(initialBFrontDwell||
       b467MayRetryOriginalBFrontFromRealFoot(this.stage,{
        id,nativeTick:this.b137NativeTick,
        firstDeniedNativeTick:initial?.nativeTick??null,
        lastRetryNativeTick:this.b467LastLiveRetryTick.get(id)??null,
        actualOriginalSolidId:hit?.solidId??null,
        foot:[realFoot.x,realFoot.y,realFoot.z],
        rejoined:this.physicallyRejoined.has(id),
        active:bot.lifeState==='ACTIVE',grounded:bot.mobilityState==='GROUND'
       })){
     this.b467LastLiveRetryTick.set(id,this.b137NativeTick);
     this.b467LiveRetryAttempts++;
     const flat=hit?inspectB130OriginalFlatSource({
      nativeTick:this.b137NativeTick,
      actualRapierBody:[realFoot.x,realFoot.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,realFoot.z],
      actualRapierSupportId:hit.solidId
     }):null;
     if(flat?.insideRegisteredOriginalXZFootprint&&
        flat.originalFlatVerticalBandWithin22cm&&
        flat.distanceToOriginalPolygonBoundaryMeters>=.75&&
        this.hasSourceFootSupport(realFoot)){
      // Beyond the two B468 goal waypoints, try genuinely unpainted
      // SOURCE cells first. Ranking reads the ACTUAL source OwnerGrid;
      // it is a preference, NOT a route/geometry or score authorization.
      // The first B467 and second B468 audits are unchanged.
      const originalProposals=proposeB441OriginalFrontline(this.stage,'B');
      let prioritized=originalProposals;
      // B2/B4 both physically reached the SAME original B-side goal
      // in real B441 #42433069608. When the OTHER real B2/B4 already
      // has a B443 APPROVED in-flight goal, do not blindly repeat that
      // first candidate. Prefer another equally useful existing
      // ORIGINAL source-ink proposal, subject to the unchanged full
      // Rapier/Recast checks below. If no alternative is genuinely
      // reachable, keep the old safe first candidate: never fake a
      // route, move an actor, or override a better real ink opportunity.
      const otherB=id==='B2'?'B4':'B2';
      const otherNativeBFront=this.b443OriginalGoalLocks.get(otherB);
      const distributeFirstSourceBGoal=fronts.length===0&&
       !!otherNativeBFront&&this.physicallyRejoined.has(otherB)&&
       this.bots.some(m=>m.id===otherB&&m.team===bot.team&&
        m.lifeState==='ACTIVE'&&m.mobilityState==='GROUND');
      if(this.sourceInk&&(fronts.length>=2||distributeFirstSourceBGoal)){
       const points=originalProposals.map(p=>new Vec3(...p.point));
       const ranked=rankOriginalSourcePatrolGoals(
        points,bot.team,this.sourceInk,0);
       const separated=distributeOriginalSourceGoalCoverage(
        ranked,points,this.actualTeamCoveragePositions(id,bot.team));
       prioritized=separated.map(row=>originalProposals[row.index]!);
       // Older B469 metric is specifically for 3rd/4th goal
       // owner-grid expansion, not the new initial B2/B4 tie-break.
       if(fronts.length>=2)this.b469NativeInkRankedExpansionAttempts++;
      }
      for(const proposal of prioritized){
       const goal=new Vec3(...proposal.point);
       // Revisit of the old original point is NOT a second destination.
       if(fronts.some(previous=>previous.distance(goal)<2.0))continue;
       if(proposal.sourceSolidId!=='UndertowT21D:right-low-team-b'||
          goal.z>-33||!this.hasSourceFootSupport(goal)){
        this.b467LiveRejectedCandidates++;continue;
       }
       const goalHit=this.sourceNativeCharacterFootHit(goal);
       const sourceFlat=goalHit?inspectB130OriginalFlatSource({
        nativeTick:this.b137NativeTick,
        actualRapierBody:[goal.x,goal.y+
         PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
        actualRapierSupportId:goalHit.solidId
       }):null;
       if(goalHit?.solidId!==proposal.sourceSolidId||
          !sourceFlat?.insideRegisteredOriginalXZFootprint||
          !sourceFlat.originalFlatVerticalBandWithin22cm||
          sourceFlat.distanceToOriginalPolygonBoundaryMeters<.75){
        this.b467LiveRejectedCandidates++;continue;
       }
       const native=this.nav.auditPath(realFoot,goal);
       if(!native.reachedTarget||native.startSnapDistanceMeters>.20||
          native.endSnapDistanceMeters>.20||
          !this.hasSourceSupportedRoute(native,-1)){
        this.b467LiveRejectedCandidates++;continue;
       }
       // Another original-native path, now starting at the REAL foot.
       // It authorizes a Crowd GOAL request ONLY, not a capsule-route
       // pass, opposing path, hit, artificial relocation or Turf win.
       const secondDistinct=fronts.length===1;
       fronts=[...fronts,goal];this.b441FrontGoals.set(id,fronts);
       // Retain the first actual-foot witness. A later goal is a NEW
       // strictly audited route, never retrospective approval of it.
       if(!this.b467LiveSourceGoals.has(id))
        this.b467LiveSourceGoals.set(id,{
         nativeTick:this.b137NativeTick,
         actualFoot:[realFoot.x,realFoot.y,realFoot.z],
         actualOriginalSolidId:hit!.solidId,
         sourceGoal:[goal.x,goal.y,goal.z]
        });
       if(secondDistinct)this.b467SecondDistinctOriginalGoalsApproved++;
       if(fronts.length>2)this.b469AdditionalOriginalCoverageGoals++;
       newlyExtendedNativeFront=goal.clone();
       this.b467LateOriginalGoalsApproved++;
       break;
      }
     }else this.b467LiveRejectedCandidates++;
    }
   }
   // B470: expand actual A2/A3/B1/B3 ORIGINAL same-side patrol after
   // genuine B443 120-tick arrival, not after an optical destination or
   // hypothetical cross-team route. B2/B4 keep their proven B467-B469
   // gates untouched. This only runs on the explicit B441 source research.
   if(this.sourceInk&&this.physics&&
      (id==='A2'||id==='A3'||id==='B1'||id==='B3')&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'){
    const realHit=this.sourceNativeCharacterFootHit(realFoot);
    const nativeSide=bot.team===Team.A?'A':'B';
    if(b470MayAuditRealInkRankedSameSideFront(this.stage,{
      id,team:nativeSide,nativeTick:this.b137NativeTick,
      lastRetryNativeTick:this.b470LastNativeRetry.get(id)??null,
      approvedOriginalGoals:fronts.length,
      arrivedSinceTick:nativeLock?.arrivedSinceTick??null,
      realOriginalSolidId:realHit?.solidId??null,
      heldGoal:nativeLock?[
       nativeLock.target.x,nativeLock.target.y,nativeLock.target.z]:null,
      realFoot:[realFoot.x,realFoot.y,realFoot.z]
    })){
     this.b470LastNativeRetry.set(id,this.b137NativeTick);
     const actualFlat=realHit?inspectB130OriginalFlatSource({
      nativeTick:this.b137NativeTick,
      actualRapierBody:[realFoot.x,realFoot.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,realFoot.z],
      actualRapierSupportId:realHit.solidId
     }):null;
     if(actualFlat?.insideRegisteredOriginalXZFootprint&&
        actualFlat.originalFlatVerticalBandWithin22cm&&
        actualFlat.distanceToOriginalPolygonBoundaryMeters>=.75&&
        this.hasSourceFootSupport(realFoot)){
      const proposals=proposeB441OriginalFrontline(this.stage,nativeSide);
      const originalPoints=proposals.map(p=>new Vec3(...p.point));
      const ranked=distributeOriginalSourceGoalCoverage(
       rankOriginalSourcePatrolGoals(
        originalPoints,bot.team,this.sourceInk,0),
       originalPoints,this.actualTeamCoveragePositions(id,bot.team));
      this.b470RankedActualGoalAudits++;
      for(const choice of ranked){
       const candidate=proposals[choice.index]!;
       const goal=new Vec3(...candidate.point);
       // Same exact ORIGINAL source polygon, and a DISTINCT next
       // destination. Never add an unaudited Recast waypoint as terrain.
       if(candidate.sourceSolidId!==realHit!.solidId||
          fronts.some(p=>Math.hypot(p.x-goal.x,p.z-goal.z)<2))continue;
       const goalHit=this.sourceNativeCharacterFootHit(goal);
       const goalFlat=goalHit?inspectB130OriginalFlatSource({
        nativeTick:this.b137NativeTick,
        actualRapierBody:[goal.x,goal.y+
         PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
        actualRapierSupportId:goalHit.solidId
       }):null;
       if(goalHit?.solidId!==candidate.sourceSolidId||
          !goalFlat?.insideRegisteredOriginalXZFootprint||
          !goalFlat.originalFlatVerticalBandWithin22cm||
          goalFlat.distanceToOriginalPolygonBoundaryMeters<.75||
          !this.hasSourceFootSupport(goal))continue;
       const route=this.nav.auditPath(realFoot,goal);
       if(!route.reachedTarget||route.startSnapDistanceMeters>.20||
          route.endSnapDistanceMeters>.20||
          !this.hasSourceSupportedRoute(route,sign))continue;
       fronts=[...fronts,goal];this.b441FrontGoals.set(id,fronts);
       newlyExtendedNativeFront=goal.clone();
       this.b470LocalRealAdditionalGoals++;
       break;
      }
     }
    }
   }
   // P2 B1 can retain a still-valid Recast target while its true Rapier
   // KCC foot has remained static for 120+ ticks with 120+ NO-AIM
   // decisions. It must reconsider a DIFFERENT proven original goal
   // BEFORE B443 reuses that stale in-flight target indefinitely.
   // B1's genuine P2 180s SOURCE ink requests stopped at 17, and the
   // later observed real source goal was missing. Other CPUs could still
   // paint, so never invent B1 ammo, aim, face, actor or teleport.
   // Unlike B2/B4, B1 with no FRONT goal from the landing had no late
   // real-foot admission. Only an observed 120+ weapon-ready NO-AIM
   // streak may trigger another strict ORIGINAL same-side route audit.
   if(bot.team===Team.B&&this.sourceInk&&this.freeCombat&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
      bot.agent&&this.physicallyRejoined.has(id)&&
      fronts.length<4&&
      this.stage.metadata.id==='undertow-t21d-partial-connectivity-qa'&&
      this.stage.solids.length===25&&
      this.stage.paintSurfaces.length===17&&
      this.stage.navigationLinks?.length===26&&
      this.stage.paintSurfaces.every(s=>
       (s.flags&SurfaceFlags.Scoreable)===0)){
    const witness=this.p2BTeamDroughtFoot.get(id);
    if(witness&&witness.misses>=120&&
       this.b137NativeTick-witness.firstStillNativeTick>=120&&
       this.b137NativeTick>=witness.nativeTick&&
       this.b137NativeTick-witness.nativeTick<=40&&
       this.b137NativeTick-(this.p2BTeamLastFullRouteAuditTick.get(id)??-1000)>=120&&
       realFoot.distance(witness.foot)<=.22){
     // No more than one full native route re-audit per 120 real ticks.
     this.p2BTeamLastFullRouteAuditTick.set(id,this.b137NativeTick);
     const realHit=this.sourceNativeCharacterFootHit(realFoot);
     const flat=realHit?inspectB130OriginalFlatSource({
      nativeTick:this.b137NativeTick,
      actualRapierBody:[realFoot.x,realFoot.y+
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,realFoot.z],
      actualRapierSupportId:realHit.solidId
     }):null;
     if(realHit?.solidId==='UndertowT21D:right-low-team-b'&&
        flat?.insideRegisteredOriginalXZFootprint&&
        flat.originalFlatVerticalBandWithin22cm&&
        flat.distanceToOriginalPolygonBoundaryMeters>=.75&&
        this.hasSourceFootSupport(realFoot)){
      const proposals=proposeB441OriginalFrontline(this.stage,'B');
      const candidateFeet=proposals.map(p=>new Vec3(...p.point));
      const ranked=distributeOriginalSourceGoalCoverage(
       rankOriginalSourcePatrolGoals(
        candidateFeet,Team.B,this.sourceInk,0),
       candidateFeet,this.actualTeamCoveragePositions(id,Team.B));
      for(const row of ranked){
       // OWN/sampled with real neutral neighbors is allowed, but never
       // UNSAMPLED or entirely OWN original source paint.
       if(!existingOriginalSourceInkOpportunity(row))continue;
       const proposal=proposals[row.index]!;
       const goal=candidateFeet[row.index]!;
       if(proposal.sourceSolidId!==realHit.solidId||
          goal.z>-33||goal.z< -63||
          goal.distance(realFoot)<2||
          fronts.some(p=>p.distance(goal)<2))continue;
       const hit=this.sourceNativeCharacterFootHit(goal);
       const proof=hit?inspectB130OriginalFlatSource({
        nativeTick:this.b137NativeTick,
        actualRapierBody:[goal.x,goal.y+
         PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,goal.z],
        actualRapierSupportId:hit.solidId
       }):null;
       if(hit?.solidId!==proposal.sourceSolidId||
          !proof?.insideRegisteredOriginalXZFootprint||
          !proof.originalFlatVerticalBandWithin22cm||
          proof.distanceToOriginalPolygonBoundaryMeters<.75||
          !this.hasSourceFootSupport(goal))continue;
       const route=this.nav.auditPath(realFoot,goal);
       if(!route.reachedTarget||
          route.startSnapDistanceMeters>.20||
          route.endSnapDistanceMeters>.20||
          !this.hasSourceSupportedRoute(route,-1))continue;
       fronts=[...fronts,goal];
       this.b441FrontGoals.set(id,fronts);
       // Revalidate the alternative first, THEN replace the former
       // stalled in-flight goal; no lock is dropped for a failed route.
       this.b443OriginalGoalLocks.set(id,{
        target:goal.clone(),firstApprovedTick:this.b137NativeTick,
        arrivedSinceTick:null
       });
       this.b442LastApprovedFront.set(id,{
        target:goal.clone(),nativeTick:this.b137NativeTick
       });
       this.p2BTeamDroughtFoot.delete(id);
       this.patrolIndex.set(id,-1);
       out.copy(goal);
       this.realGoalRequests++;this.b441ActualGoalRequests++;
       return true;
      }
     }
    }
   }

   // Genuine 180s B1-B4 may move yet have 120+ WEAPON-READY
   // NO-AIM results. A B1 with ZERO approved frontline goals still has
   // pre-existing SOURCE patrol feet; the former rescue missed it.
   // Choose only among existing originals. A paintable destination is
   // NOT a guaranteed shot or movement: the real foot and whole route
   // must still pass native Recast/Rapier, including actor obstruction.
   const movingDrought=this.p2BTeamDroughtFoot.get(id);
   const currentFrontLock=this.b443OriginalGoalLocks.get(id);
   const useApprovedFronts=fronts.length>1&&!!currentFrontLock;
   const useOriginalPatrol=fronts.length===0&&!currentFrontLock;
   const originalDroughtGoals=useApprovedFronts?fronts:
     useOriginalPatrol?(this.patrolGoals.get(id)??[]):[];
   const activePatrolIndex=this.patrolIndex.get(id)??-1;
   const currentDroughtGoal=useApprovedFronts?currentFrontLock!.target:
     useOriginalPatrol?originalDroughtGoals[activePatrolIndex]:null;
   // A SOURCE-only CPU may genuinely lose its native movement goal
   // after an earlier path HOLD. A valid 120+ real NO-AIM drought can
   // recover an EXISTING verified patrol, not only replace one.
   if(this.enableB441SourceFrontline&&this.freeCombat&&this.sourceInk&&
      this.physics&&bot.weaponId&&bot.team===Team.B&&
      bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
      this.physicallyRejoined.has(id)&&
      originalDroughtGoals.length>1&&
      (currentDroughtGoal!==null||useOriginalPatrol)&&
      movingDrought&&movingDrought.misses>=120&&
      this.b137NativeTick>=movingDrought.nativeTick&&
      this.b137NativeTick-movingDrought.nativeTick<=40&&
      realFoot.distance(movingDrought.foot)<=.22&&
      this.b137NativeTick-
       (this.p2BTeamLastFullRouteAuditTick.get(id)??-1000)>=120&&
      this.hasSourceFootSupport(realFoot)&&
      (!currentDroughtGoal||
       !this.canPaintFromOriginalGoal(bot,currentDroughtGoal))){
    // Bounded to once per 120 native ticks. Failed candidates neither
    // release the existing target nor modify the physical CPU position.
    this.p2BTeamLastFullRouteAuditTick.set(id,this.b137NativeTick);
    const ranked=distributeOriginalSourceGoalCoverage(
     rankOriginalSourcePatrolGoals(originalDroughtGoals,
      bot.team,this.sourceInk,0),
     originalDroughtGoals,this.actualTeamCoveragePositions(id,bot.team));
    for(const row of ranked){
     const goal=originalDroughtGoals[row.index]!;
     if((currentDroughtGoal&&
         goal.distance(currentDroughtGoal)<2)||
        goal.distance(realFoot)<1.5||goal.z*sign<33||
        !this.hasSourceFootSupport(goal)||
        !this.canPaintFromOriginalGoal(bot,goal))continue;
     const native=this.nav.auditPath(realFoot,goal);
     if(!native.reachedTarget||native.startSnapDistanceMeters>.20||
        native.endSnapDistanceMeters>.20||
        !this.hasSourceSupportedRoute(native,sign,realFoot,true)||
        this.kccActorBlocksOriginalRoute(id,realFoot,native))continue;
     if(useApprovedFronts){
      this.b443OriginalGoalLocks.set(id,{
       target:goal.clone(),firstApprovedTick:this.b137NativeTick,
       arrivedSinceTick:null
      });
      this.b442LastApprovedFront.set(id,{
       target:goal.clone(),nativeTick:this.b137NativeTick
      });
      this.patrolIndex.set(id,-1);
      this.b441ActualGoalRequests++;
     }else{
      // An already-existing patrol candidate is NOT a new B443 front.
      // Preserve the normal native patrol ledger and avoid promoting it.
      this.patrolIndex.set(id,row.index);
     }
     this.p2BTeamDroughtFoot.delete(id);
     out.copy(goal);this.realGoalRequests++;
     return true;
    }
   }
   const lock=this.b443OriginalGoalLocks.get(id);
   let completed:Vec3|null=null;
   // Only genuine B-team 90+ physical KCC rejects can override a still
   // moving FRONT lock, and only with a distinct vetted original target.
   const realTeammateBlock=this.recentRealTeammateKccBlock(id);
   const trueKccStalledFront=!!lock&&this.enableB441SourceFrontline&&
    bot.team===Team.B&&bot.lifeState==='ACTIVE'&&
    bot.mobilityState==='GROUND'&&this.physicallyRejoined.has(id)&&
    fronts.length>=2&&
    ((this.realKccRejectedSteps.get(id)??0)>=90||realTeammateBlock);
   let releasedTrueKccFront:Vec3|null=null;
   // B443: B442 real Chromium showed 8-13 target switches in 30 polls
   // when CPU feet came within 1.5m of the first verified SOURCE goal.
   // Keep an APPROVED goal through approach and for 120 authentic ticks
   // after arrival; only then consider another ORIGINAL same-side goal.
   if(lock&&fronts.some(p=>p.distance(lock.target)<.01)){
    const distance=Math.hypot(
     lock.target.x-realFoot.x,lock.target.z-realFoot.z);
    const decision=decideB443OriginalFrontHold(
     this.b137NativeTick,lock.firstApprovedTick,
     lock.arrivedSinceTick,distance,fronts.length,
     Math.abs(lock.target.y-realFoot.y),
     trueKccStalledFront?(this.realKccRejectedSteps.get(id)??0):0,
     trueKccStalledFront&&realTeammateBlock);
    if(trueKccStalledFront&&
       decision.decision==='RELEASE_STALLED_OR_INVALID'&&
       distance>1.5)
     releasedTrueKccFront=lock.target.clone();
    if(decision.decision==='KEEP_APPROACH'||
       decision.decision==='KEEP_DWELL'||
       decision.decision==='ROTATE_AFTER_DWELL'){
     // B443 previously rechecked Rapier/Recast for KEEP but skipped it
     // for ROTATE: the stale 120-tick dwell could then be falsely
     // recorded as a completed SOURCE goal after support was lost.
     // Use the same original floor/route gate for BOTH outcomes.
     const route=this.nav.auditPath(realFoot,lock.target);
     if(bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
        this.physicallyRejoined.has(id)&&
        lock.target.z*sign>=33&&
        this.hasSourceFootSupport(realFoot)&&
        this.hasSourceFootSupport(lock.target)&&
        route.reachedTarget&&route.startSnapDistanceMeters<=.20&&
        route.endSnapDistanceMeters<=.20&&
        this.hasSourceSupportedRoute(route,sign)&&
        !this.kccActorBlocksOriginalRoute(id,realFoot,route)){
      if(decision.decision==='ROTATE_AFTER_DWELL'){
       completed=lock.target.clone();
       this.b443RotationsAfterDwell++;
      }else{
       if(lock.arrivedSinceTick===null&&
          decision.arrivedSinceTick!==null)
        this.b443FirstActualFrontlineArrivals++;
       lock.arrivedSinceTick=decision.arrivedSinceTick;
       out.copy(lock.target);
       this.b442LastApprovedFront.set(id,{
        target:lock.target.clone(),nativeTick:this.b137NativeTick
       });
       this.b443NativeGoalRetentions++;
       if(id==='A3'&&this.enableB448A3LiveOriginalFront)
        this.b448A3RealNativeGoalRequests++;
       if(this.b467LiveSourceGoals.has(id))
        this.b467TrueNativeGoalRequests++;
       if(gate)gate.runtimeTrueOriginalGoalRequests++;
       this.realGoalRequests++;this.b441ActualGoalRequests++;
       return true;
      }
     }else{
      this.b441UnsafeOrUnreachableHolds++;
      this.b443ReleasedUnsafeOrStalled++;
     }
    }else this.b443ReleasedUnsafeOrStalled++;
    this.b443OriginalGoalLocks.delete(id);
   }
   // After an honest 120-tick dwell, prefer the other previously
   // validated original goal, not an invented adjacent/cover position.
   let goals=completed&&fronts.length>1?
    [...fronts.filter(p=>p.distance(completed)>.01),
     ...fronts.filter(p=>p.distance(completed)<=.01)]:fronts;
   // A genuine KCC-vetoed Crowd target may not simply be resubmitted.
   if(releasedTrueKccFront)
    goals=goals.filter(p=>p.distance(releasedTrueKccFront!)>=2);
   // B470: existing A/B local goals are also prioritized by actual
   // unscored source ink when a native 120-tick dwell really completed.
   if(completed&&fronts.length>2&&this.sourceInk&&
      (id==='A2'||id==='A3'||id==='B1'||id==='B3')){
    const other=goals.filter(p=>p.distance(completed!)>.01);
    const ranked=distributeOriginalSourceGoalCoverage(
     rankOriginalSourcePatrolGoals(other,bot.team,this.sourceInk,0),
     other,this.actualTeamCoveragePositions(id,bot.team));
    goals=[...ranked.map(row=>other[row.index]!),
     ...goals.filter(p=>p.distance(completed!)<=.01)];
   }
   // Once third/fourth original B points are safely audited, use
   // genuine source-ink priority to move toward unpainted areas. Every
   // submitted goal is STILL rechecked by the identical native gates.
   if(completed&&fronts.length>2&&(id==='B2'||id==='B4')&&
      this.b467LiveSourceGoals.has(id)&&this.sourceInk){
    const nonCompleted=goals.filter(p=>p.distance(completed!)>.01);
    const ranked=distributeOriginalSourceGoalCoverage(
     rankOriginalSourcePatrolGoals(nonCompleted,bot.team,this.sourceInk,0),
     nonCompleted,this.actualTeamCoveragePositions(id,bot.team));
    goals=[...ranked.map(row=>nonCompleted[row.index]!),
     ...goals.filter(p=>p.distance(completed!)<=.01)];
   }
   // If an additional ORIGINAL point was just approved from the live
   // current CPU foot, give that fresh audited route one actual try.
   if(newlyExtendedNativeFront&&completed)
    goals=[newlyExtendedNativeFront,
     ...goals.filter(p=>p.distance(newlyExtendedNativeFront!)>.01)];
   for(const goal of goals){
    // Recast goals use true original 3D floor elevation; an XZ-close
    // but vertically separate platform is not an arrival.
    const direct=Math.hypot(goal.x-realFoot.x,
     goal.y-realFoot.y,goal.z-realFoot.z);
    if(direct<1.5){
     if(gate)gate.runtimeNearExistingGoal++;
     continue;
    }
    if(goal.z*sign<33||!this.hasSourceFootSupport(goal)){
     if(gate)gate.runtimeUnsupportedGoalFoot++;
     this.b441UnsafeOrUnreachableHolds++;continue;
    }
    const route=this.nav.auditPath(realFoot,goal);
    if(!route.reachedTarget||route.startSnapDistanceMeters>.20||
        route.endSnapDistanceMeters>.20||
        !this.hasSourceSupportedRoute(route,sign,
         releasedTrueKccFront?realFoot:undefined,
         releasedTrueKccFront!==null)||
        this.kccActorBlocksOriginalRoute(id,realFoot,route)){
     if(gate)gate.runtimeUnsupportedNativePath++;
     this.b441UnsafeOrUnreachableHolds++;continue;
    }
    if(gate)gate.runtimeTrueOriginalGoalRequests++;
    if(id==='A3'&&this.enableB448A3LiveOriginalFront)
     this.b448A3RealNativeGoalRequests++;
    if(this.b467LiveSourceGoals.has(id))
     this.b467TrueNativeGoalRequests++;
    if(completed&&(id==='B2'||id==='B4')&&
       this.b467LiveSourceGoals.has(id)&&
       this.b467NativeRetargetWitnesses.length<16&&
       Math.hypot(goal.x-completed.x,goal.z-completed.z)>=2){
     // Proof of a second REAL Crowd goal request, NOT proof of a
     // capsule walking the route, enemy hit, or source crossing.
     this.b467NativeRetargetWitnesses.push({
      id,nativeTick:this.b137NativeTick,
      actualFoot:[realFoot.x,realFoot.y,realFoot.z],
      previousOriginalGoal:[completed.x,completed.y,completed.z],
      nextOriginalGoal:[goal.x,goal.y,goal.z]
     });
    }
    if(completed&&
       (id==='A2'||id==='A3'||id==='B1'||id==='B3')&&
       Math.hypot(goal.x-completed.x,goal.z-completed.z)>=2){
     this.b470RealDistinctGoalRequests++;
     if(this.b470NativeRetargetWitnesses.length<24)
      this.b470NativeRetargetWitnesses.push({
       id,nativeTick:this.b137NativeTick,
       actualFoot:[realFoot.x,realFoot.y,realFoot.z],
       previousOriginalGoal:[completed.x,completed.y,completed.z],
       nextOriginalGoal:[goal.x,goal.y,goal.z]
      });
    }
    out.copy(goal);
    this.b443OriginalGoalLocks.set(id,{target:goal.clone(),
     firstApprovedTick:this.b137NativeTick,arrivedSinceTick:null});
    // Store a witness only after native route checks truly passed.
    this.b442LastApprovedFront.set(id,{
     target:goal.clone(),nativeTick:this.b137NativeTick
    });
    if(releasedTrueKccFront){
     this.realKccRejectedSteps.delete(id);
     this.realKccBTeamRecoveryAnchor.delete(id);
     this.realKccLastActorBlocker.delete(id);
    }
    this.realGoalRequests++;
    this.b441ActualGoalRequests++;
    return true;
   }
   // Without a verified alternate the physical KCC veto remains.
   if(releasedTrueKccFront){this.heldRequests++;return false;}
  }
  if(this.tryOriginalRampLocalRecovery(id,realFoot,out))return true;
  // A 90+ real KCC-veto stall without ANY safe alternative used to
  // fall back to exactly the blocked native target at the next think.
  // Give teammates/the original Recast Crowd time to clear without
  // fabricating an alternate route or repeatedly paying costly audits.
  // A genuinely moved real foot cancels the hold immediately.
  const noAlternate=this.originalSourceFailedAlternateHold?.get(id);
  if(noAlternate){
   const moved=Math.hypot(realFoot.x-noAlternate.foot.x,
    realFoot.z-noAlternate.foot.z)>=.25;
   if(moved||!Number.isSafeInteger(this.b137NativeTick)||
      this.b137NativeTick>=noAlternate.retryAtTick)
    this.originalSourceFailedAlternateHold?.delete(id);
   else{
    this.heldRequests++;return false;
   }
  }
  const active=this.patrolIndex.get(id)??-1;
  // Unlike the legacy B34 stationary inference, this is triggered only by
  // 90 genuine KCC-denied grounded steps. Ordinary FIXED patrol and F2
  // first drops remain unchanged while physical movement is successful.
  // Compare B1's true Rapier foot with its projected Recast path start without relaxing any support gate.
  // Genuine original 90s Chromium recorded B1/B4 unsupported next
  // source feet and B2/B3 actual real actor blockers. After 90 Rapier
  // denials, B441 research may also attempt a DIFFERENT pre-existing,
  // strictly SOURCE-audited patrol goal. The older B1 no-aim drought
  // remains an additional trigger; no synthetic body/route is created.
  const b1Drought=this.enableB441SourceFrontline&&id==='B1'?
   this.p2BTeamDroughtFoot?.get(id):undefined;
  const b1StalledResearchPatrol=this.enableB441SourceFrontline&&
   id==='B1'&&active>=0&&candidates.length>1&&
   !this.b443OriginalGoalLocks.has(id)&&
   !this.b442LastApprovedFront.has(id)&&
   bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
   !!b1Drought&&b1Drought.misses>=120&&
   this.b137NativeTick-b1Drought.firstStillNativeTick>=120&&
   this.b137NativeTick>=b1Drought.nativeTick&&
   this.b137NativeTick-b1Drought.nativeTick<=40&&
   realFoot.distance(b1Drought.foot)<=.22&&
   this.hasSourceFootSupport(realFoot);
  // Use the SAME real-capsule witness for both original front-lock
  // release and legacy registered-source patrol fallback.
  const actualTeammateBlocked=this.recentRealTeammateKccBlock(id);
  const actualB4UnsupportedBlocked=
   this.recentRealB4UnsupportedOriginalStep(id,realFoot);
  const kccBlockedAlternative=
   active>=0&&candidates.length>1&&
   ((this.realKccRejectedSteps.get(id)??0)>=90||
    actualTeammateBlocked||actualB4UnsupportedBlocked||
    b1StalledResearchPatrol)&&
   bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
   this.physicallyRejoined.has(id)&&
   this.hasSourceFootSupport(realFoot);
  // Persist the same audited destination across the tactical think cadence,
  // instead of jittering between nodes every 0.28 seconds. Only move to
  // another original-source destination after genuinely reaching this one.
  const first=kccBlockedAlternative?
   (active+1)%candidates.length:
   active>=0?active:(id.startsWith('A')?0:1);
  // Optional genuine source gameplay only: rank already vetted candidate
  // endpoints by read-only actual ink ownership. The physical source and
  // Recast audits below are never skipped for a high-ranked point.
  // Unavailable original paint-surface sampling simply defers to the
  // previous deterministic loop: no synthetic paint inference.
  const initialRanks=this.enablePaintAwarePatrol&&this.sourceInk?
   rankOriginalSourcePatrolGoals(candidates,bot.team,this.sourceInk,first):
   null;
  const prior=candidates[active];
  const priorDistance=prior?Math.hypot(
   realFoot.x-prior.x,realFoot.y-prior.y,realFoot.z-prior.z):0;
  const recovering=this.enableB34SourceStallRecovery&&
   this.enablePaintAwarePatrol&&this.enableStableSourceGoal&&
   mayReconsiderStalledOriginalGoal(
    this.b34StationarySourceTicks.get(id)??0,active,priorDistance);
  if(recovering)this.stalledOriginalGoalReconsiderations++;
  const ranked=initialRanks&&this.enableStableSourceGoal&&!recovering?
   prioritizeExistingInFlightSourceGoal(
    initialRanks,candidates,active,realFoot):initialRanks;
  // Genuine F2 90s #43662350239: B4 remained fixed on the SAME
  // registered negative-z ramp after 227 more unsupported next feet,
  // even though the prior height-drift fix greatly reduced denials.
  // Reuse B1's existing same-solid ORIGINAL patrol-goal preference
  // for B3/B4's 90+ genuine KCC denials. No new goal, synthetic waypoint,
  // stage collider or NavLink. Full original Recast/Rapier audits below
  // still own every alternative and each eventual actor step.
  const sameRampKccRecoveryOrder=(()=>{
   // B2 has the same observed 90+ genuine KCC rejection evidence and
   // pre-existing ORIGINAL source patrol feet as B1/B3/B4. It was
   // unnecessarily omitted from the same-solid alternate preference.
   // This affects candidate order only. Native Recast, 0.30m Rapier
   // support, and actual CPU/actor obstruction veto still decide.
   if(!['B1','B2','B3','B4'].includes(id)||
      !this.enableB441SourceFrontline||
      !kccBlockedAlternative||
      (this.realKccRejectedSteps.get(id)??0)<90||
      !this.physics||
      typeof this.physics.castCharacterFootSupport!=='function')
    return null;
   const current=this.sourceNativeCharacterFootHit(realFoot);
   if(!current||!this.stage.solids.some(s=>s.id===current.solidId))
    return null;
   const nearby=candidates.map((goal,index)=>({
    index,goal,distance:goal.distance(realFoot)
   })).filter(row=>row.index!==active&&row.distance>=1.5&&
    this.sourceNativeCharacterFootHit(row.goal)?.solidId===current.solidId
   ).sort((a,b)=>a.distance-b.distance||a.index-b.index)
    .map(row=>row.index);
   if(nearby.length===0)return null;
   const ordinary=Array.from({length:candidates.length},(_,i)=>
    ranked?.[i]?.index??(first+i)%candidates.length);
   return [...nearby,...ordinary.filter(i=>!nearby.includes(i))];
  })();
  if(ranked){
   this.actualOriginalInkOwnershipLookups+=ranked.length;
   this.actualOriginalInkOwnershipSampled+=
    ranked.filter(r=>r.priority!=='UNSAMPLED').length;
  }
  for(let tries=0;tries<candidates.length;tries++){
   const scheduledRank=ranked?.[tries];
   const index=sameRampKccRecoveryOrder?.[tries]??
    (scheduledRank?scheduledRank.index:(first+tries)%candidates.length);
   // The real B1/B4 same-solid route preference must not falsely
   // assign a different original ink-priority row to the selected goal.
   const rank=sameRampKccRecoveryOrder?
    ranked?.find(row=>row.index===index):scheduledRank;
   // B34 can only escape TO A DIFFERENT PRE-EXISTING SOURCE GOAL,
   // physically supported and native-path audited below. The old goal
   // remains the Crowd agent's last requested target if no safe alternate.
   if((recovering||kccBlockedAlternative)&&index===active)continue;
   const goal=candidates[index]!;
   if(goal.z*sign<33||goal.y<2.7||goal.y>5.25)
    throw Error('T21_F3D_UNAPPROVED_UNDERPASS_CROSSING_GOAL');
   const distance=Math.hypot(realFoot.x-goal.x,
    realFoot.y-goal.y,realFoot.z-goal.z);
   if(distance<1.5)continue;
   if(!this.hasSourceFootSupport(goal)){
    this.rejectedUnsupportedGoals++;continue;
   }
   const audit=this.nav.auditPath(realFoot,goal);
   // Native path from the REAL CPU foot, never only from a stored proxy.
   if(!audit.reachedTarget||audit.startSnapDistanceMeters>.25||
      audit.endSnapDistanceMeters>.22)continue;
   // An alternative after a REAL KCC veto must have complete ORIGINAL
   // 0.30m-segment support from the registered physical CPU foot.
   // Original floor and 0.30m route samples still fail closed unchanged.
   const fullRegisteredSupport=this.hasSourceSupportedRoute(
    audit,sign,kccBlockedAlternative?realFoot:undefined,
    kccBlockedAlternative);
   if(kccBlockedAlternative&&!fullRegisteredSupport)continue;
   if(kccBlockedAlternative&&
      this.kccActorBlocksOriginalRoute(id,realFoot,audit))continue;
   // W10-B4 regression finding: rejecting every ray-unsupported Recast
   // polyline also vetoes previously physically traversed W8 source patrol
   // paths (B4 then stopped shooting in the full W9 test). The existing
   // ground movement remains subject to per-frame original human-size
   // Rapier KCC and physical collision. Log uncertain patrol routes but
   // do NOT silently rewrite original native goals or cancel that validated
   // locomotion. New cross-team engagement paths still fail closed above.
   if(!fullRegisteredSupport)
    this.unauditedPatrolRouteRequests++;
   // Observation only: prove the legacy B31 mode repeatedly retargets
   // BEFORE reaching its prior native goal. No Actor position write.
   const oldGoal=active>=0?candidates[active]:undefined;
   const priorInFlight=!!oldGoal&&
    Math.hypot(realFoot.x-oldGoal.x,
     realFoot.y-oldGoal.y,realFoot.z-oldGoal.z)>=1.5;
   if(priorInFlight){
    if(index===active)this.continuedPreviouslyApprovedGoalRequests++;
    else this.switchedGoalBeforePreviousArrival++;
   }
   // B34: measures REAL CPU foot -> PREVERIFIED ORIGINAL goal and
   // actual Recast path vertices. This observes, never authorizes a new
   // route or changes previous destination order.
   const polyline=audit.nativePathPoints;
   let nativeMeters=0;
   for(let i=1;i<polyline.length;i++){
    const prev=polyline[i-1]!,next=polyline[i]!;
    nativeMeters+=Math.hypot(next.x-prev.x,next.y-prev.y,next.z-prev.z);
   }
   if(Number.isFinite(nativeMeters)){
    this.requestedGoalLengthsSampled++;
    this.requestedGoalDirectMeters+=distance;
    this.requestedGoalNativePathMeters+=nativeMeters;
    if(distance<4)this.requestedGoalShortHops++;
    if(distance>9)this.requestedGoalLongHops++;
    // Count genuine DESTINATION CHANGES separately from 0.28s repeated
    // requests to an existing original destination. Recast and Rapier
    // approval remain exactly as before.
    if(index!==active){
     this.trulyNewOriginalGoalSelections++;
     this.newGoalDirectMeters+=distance;
     this.newGoalNativePathMeters+=nativeMeters;
     if(distance<4)this.newGoalShortHops++;
     if(distance>9)this.newGoalLongHops++;
    }
   }
   if(recovering){
    this.approvedAlternativeOriginalGoalsAfterStall++;
    this.b34StationarySourceTicks.set(id,0);
   }
   this.patrolIndex.set(id,index);
   if(b1StalledResearchPatrol)
    this.p2BTeamDroughtFoot.delete(id);
   if(kccBlockedAlternative){
    this.realKccRejectedSteps.delete(id);
    this.realKccBTeamRecoveryAnchor?.delete(id);
   }
   out.copy(goal);this.realGoalRequests++;
   if(rank){
    this.realPaintAwareGoalsAccepted++;
    if(rank.priority==='OWN')this.paintAwareOwnGoalsAccepted++;
    else if(rank.priority==='UNSAMPLED')
     this.paintAwareUnknownInkGoalsAccepted++;
    else this.paintAwareNonOwnedGoalsAccepted++;
   }
   return true;
  }
  // A blocked old goal is never declared physically safe merely because
  // Recast accepted it. If no strict alternate exists, retain the real
  // CPU foot and retry the previous FIXED patrol on the next think cycle.
  if(kccBlockedAlternative){
   // Failed native alternative is NOT proof that the obstruction is gone.
   // Keep the real Actor exactly at its last Rapier-approved foot and
   // delay re-requesting the old rejected goal for only half a second.
   // The next attempt still needs a true original Recast route and KCC.
   if(Number.isSafeInteger(this.b137NativeTick)&&
      this.b137NativeTick>=0)
    this.originalSourceFailedAlternateHold?.set(id,{
     foot:realFoot.clone(),retryAtTick:this.b137NativeTick+30
    });
   this.realKccRejectedSteps.delete(id);
   this.realKccBTeamRecoveryAnchor?.delete(id);
  }
  this.heldRequests++;return false;
 }

 /**
  * B93: research-only original-source retarget after an ACTUAL physical
  * stall near the actual human foot. Recast-path approval is NOT proof of
  * collision-supported traversal. Every candidate step still goes through
  * unchanged shared Rapier KCC; never move CPU pose/colliders here.
  */
 private selectB93UpperDetour(
  bot:F3TrafficCpu,human:Readonly<{x:number;y:number;z:number}>,frame:number
 ):void{
  if(!this.enableB93UpperDetour||this.b93UpperDetours.has(bot.id)||
     this.physicallyRejoined.has(bot.id)||
     bot.mobilityState!=='GROUND'||!bot.agent||
     this.physicallyFalling.has(bot.id))return;
  const last=this.lastMoved.get(bot.id);
  if(last===undefined||frame-last<120||
     Math.abs(bot.position.y-human.y)>1.05)return;
  const humanDist=Math.hypot(bot.position.x-human.x,bot.position.z-human.z);
  if(humanDist>.95||humanDist<.56)return;
  const direction=Math.sign(bot.position.x-human.x);
  if(direction===0)return;
  const side=bot.team===Team.A?'positive-z':'negative-z';
  const original=this.routeFor(bot.id).linkId;
  const candidate=this.stage.navigationLinks
   ?.filter(link=>link.id.startsWith('first-drop-'+side+'-')&&
     link.id!==original&&link.bidirectional===false&&
     link.start[1]===7.5&&link.end[1]===3&&
     (link.start[0]-bot.position.x)*direction>=1.5&&
     Math.hypot(link.start[0]-human.x,link.start[2]-human.z)>3)
   .map(link=>({link,
     drop:this.nav.auditPath(bot.position,new Vec3(...link.end)),
     upper:this.nav.auditPath(bot.position,new Vec3(...link.start))}))
   .filter(x=>x.drop.reachedTarget&&x.upper.reachedTarget&&
     x.drop.startSnapDistanceMeters<=.22&&
     x.drop.endSnapDistanceMeters<=.22&&
     x.upper.startSnapDistanceMeters<=.22&&
     // The immutable HIGH source upper endpoint is 0.326m from the
     // nearest built Recast point in this pinned original geometry.
     // This ONLY validates a native goal probe, NOT a KCC passage.
     x.upper.endSnapDistanceMeters<=.35)
   .sort((a,b)=>
     Math.abs(a.link.start[0]-bot.position.x)-
     Math.abs(b.link.start[0]-bot.position.x)||
     a.link.id.localeCompare(b.link.id))[0]?.link;
  if(!candidate)return;
  // A valid upper endpoint may still start its shortest Recast route
  // by steering into the stationary HUMAN. Try an actual navmesh point
  // sideways/away on the existing high source floor before approaching
  // that endpoint. Every candidate is both Rapier-ray floor-supported
  // and natively path-audited. This is a QA steering goal ONLY, not an
  // authored navigation link or a substitute for a physical KCC step.
  const offsets:[[number,number],[number,number],[number,number],
    [number,number],[number,number]]=[
    [1.5,.4],[1.0,.9],[1.9,.3],[1.4,1.1],[2.2,.7]
   ];
  const escapeFoot:StageVector3|null=(()=>{
   for(const [sideMeters,backMeters] of offsets){
    const wanted=new Vec3(bot.position.x+direction*sideMeters,
     bot.position.y,bot.position.z+
      (bot.position.z>=human.z?1:-1)*backMeters);
    const navFoot=this.nav.closestPoint(wanted);
    if(Math.hypot(navFoot.x-wanted.x,navFoot.y-wanted.y,
      navFoot.z-wanted.z)>.20||
       Math.abs(navFoot.y-bot.position.y)>.20||
       !this.hasSourceFootSupport(navFoot))continue;
    const audit=this.nav.auditPath(bot.position,
     new Vec3(navFoot.x,navFoot.y,navFoot.z));
    if(!audit.reachedTarget||
       audit.startSnapDistanceMeters>.20||
       audit.endSnapDistanceMeters>.20||
       audit.pointCount<2)continue;
    const points=audit.nativePathPoints;
    if(!points.every(p=>Math.abs(p.y-bot.position.y)<.3&&
       Math.hypot(p.x-human.x,p.z-human.z)>.55))continue;
    const first=points[1]!;
    if(Math.hypot(first.x-human.x,first.z-human.z)<
       humanDist-.04)continue;
    // Check intermediate authentic floor, not merely the endpoint.
    let allSupported=true;
    for(let i=1;i<=6;i++){
     const t=i/6;
     if(!this.hasSourceFootSupport({
      x:bot.position.x+(navFoot.x-bot.position.x)*t,
      y:bot.position.y,
      z:bot.position.z+(navFoot.z-bot.position.z)*t
     })){allSupported=false;break;}
    }
    if(allSupported)return [navFoot.x,navFoot.y,navFoot.z] as const;
   }
   return null;
  })();
  this.b93UpperDetours.set(bot.id,{linkId:candidate.id,
   sourceGoal:candidate.end,originalLanding:candidate.end,
   upperStart:candidate.start,escapeFoot,
   phase:escapeFoot?'ESCAPE':'APPROACH'});
 }
 prepare(frame:number,humanFoot?:Readonly<{
  x:number;y:number;z:number;grounded?:boolean;active?:boolean;
  mode?:'HUMAN'|'SQUID';allySyncPracticeRunning?:boolean
 }>):void{
  // Cache only the ACTUAL native input for this fixed step. No foot
  // relocation and no synthetic actor position. Even when all CPUs are
  // released, refresh validity each physical tick before CPU goal choice.
  this.b137NativeTick=frame;
  if(this.f4WholeSupport){this.f4PatrolNavigation.beginTick(frame);this.f4PatrolSurvey.beginTick(frame);}
  // Genuine player foot from THIS 60Hz physics step, never historical
  // pursuit data. F4-only: a dead or airborne HUMAN cannot freeze B CPUs.
  // The pinned original terrain uses its own corridor goals instead of
  // populating the photo guide map. Both use the same live firing check.
  const f4UsesLiveSight=isT21F4OriginalTerrainStage(this.stage)||
   (this.f4GuideByTeam?.size??0)>0;
  this.f4LiveHuman=f4UsesLiveSight&&
   humanFoot?.active===true&&humanFoot.grounded===true&&
   [humanFoot.x,humanFoot.y,humanFoot.z].every(Number.isFinite)?
   {x:humanFoot.x,y:humanFoot.y,z:humanFoot.z,
    mode:humanFoot.mode==='SQUID'?'SQUID':'HUMAN',tick:frame}:null;
  // C orders time out after 900 advancing native ticks, even while
  // genuine low-HP retreat prevents A1 tactical goal selection.
  // Never change physical feet, HP, ink or original route authority.
  const activeA1Order=this.b471AllyOrder;
  if(activeA1Order&&Number.isSafeInteger(frame)&&frame>=0&&
     (!Number.isSafeInteger(activeA1Order.requestedTick)||
      activeA1Order.requestedTick<0||
      frame<activeA1Order.requestedTick||
      frame-activeA1Order.requestedTick>900)){
   this.b471AllyOrder=null;
   this.b471OrderStatus='EXPIRED';
   this.b471SourceDecision='SOURCE_ORDER_EXPIRED';
  }
  this.b137HumanFootValid=false;
  this.b192HumanAliveGrounded=false;
  this.b192NativeHumanMode='HUMAN';
  this.b192HumanTick=-1;
  if(this.enableB192HumanCombat&&
     humanFoot?.active===true&&humanFoot.grounded===true&&
     [humanFoot.x,humanFoot.y,humanFoot.z].every(Number.isFinite)){
   this.b192NativeHumanFoot.set(humanFoot.x,humanFoot.y,humanFoot.z);
   this.b192NativeHumanMode=humanFoot.mode==='SQUID'?'SQUID':'HUMAN';
   this.b192HumanTick=frame;
   this.b192HumanAliveGrounded=true;
  }
  this.b169HumanUpperGrounded=false;
  this.b171AllySyncPracticeRunning=false;
  if(this.enableB137OriginalAllyRally&&
     humanFoot?.grounded===true&&humanFoot.active===true&&
     [humanFoot.x,humanFoot.y,humanFoot.z].every(Number.isFinite)){
   this.b137ActualHumanFoot.set(humanFoot.x,humanFoot.y,humanFoot.z);
   this.b137HumanFootValid=true;
   this.b171AllySyncPracticeRunning=humanFoot.allySyncPracticeRunning===true;
   this.b169HumanUpperGrounded=humanFoot.y>=7&&
    humanFoot.y<=9.5&&humanFoot.z>=33;
  }
  if(this.f4WholeSupport||this.freeCombat)return;
  for(const [id,requires] of Object.entries(RELEASE_AFTER)){
   if(!this.released.has(id)&&
     (requires===null||this.cleared.has(requires)))this.released.add(id);
  }
  for(const bot of this.bots){
   // Once a CPU is physically landed, traffic owns ONLY a native Recast
   // destination. It never writes the CPU's Rapier foot or render pose.
   if(this.physicallyRejoined.has(bot.id)){
    bot.thinkRemaining=900;bot.paintRemaining=900;bot.fireRemaining=900;
    if(this.cleared.has(bot.id))bot.agent?.resetMoveTarget();
    else if(bot.agent&&frame%18===1)
      bot.agent.requestMoveTarget(this.nav.closestPoint(
       new Vec3(...this.egress.get(bot.id)!)));
   }else if(this.released.has(bot.id)){
    bot.thinkRemaining=900;bot.paintRemaining=900;bot.fireRemaining=900;
    bot.jumpCooldownSeconds=900;
    if(bot.mobilityState==='GROUND'&&bot.agent&&frame%18===1){
     if(humanFoot)this.selectB93UpperDetour(bot,humanFoot,frame);
     const detour=this.b93UpperDetours.get(bot.id);
     if(detour?.phase==='ESCAPE'&&detour.escapeFoot&&
        Math.hypot(bot.position.x-detour.escapeFoot[0],
          bot.position.z-detour.escapeFoot[2])<.42)
       detour.phase='APPROACH';
     if(detour?.phase==='APPROACH'&&
        Math.hypot(bot.position.x-detour.upperStart[0],
          bot.position.z-detour.upperStart[2])<0.9)
       detour.phase='DROP';
     const goal=detour?.phase==='ESCAPE'&&detour.escapeFoot?
      detour.escapeFoot:
      detour?.phase==='APPROACH'?detour.upperStart:
      detour?.sourceGoal??this.routeFor(bot.id).sourceGoal;
     bot.agent.requestMoveTarget(this.nav.closestPoint(new Vec3(...goal)));
    }
   }else{
    bot.thinkRemaining=900;bot.paintRemaining=900;bot.fireRemaining=900;
    bot.agent?.resetMoveTarget();
   }
  }
 }

 observe(frame:number):void{
  if(this.f4WholeSupport){
   for(const bot of this.bots){
    if(bot.agent&&bot.lifeState==='ACTIVE'&&bot.mobilityState==='GROUND'&&
       this.f4WholeSupport(bot.id,bot.position)){
     this.physicallyRejoined.add(bot.id);
     this.released.add(bot.id);
     const previous=this.previousFeet.get(bot.id)!;
     if(previous.distance(bot.position)>.015)this.lastMoved.set(bot.id,frame);
     previous.copy(bot.position);
     const goal=this.f4WholeGoals.get(bot.id);
     if(goal&&!goal.patrolVeto){
      const distance=bot.position.distance(goal.point);
      const moved=goal.patrolTrail?localPatrolProgress(goal.patrolTrail,bot.position):false;
      if(distance<goal.bestDistance-.06){
       goal.bestDistance=distance;
       goal.advanced=frame;
      }else if(moved)goal.advanced=frame;
     }
    }else{
     this.physicallyRejoined.delete(bot.id);
     this.f4WholeGoals.delete(bot.id);
     this.f4LastSeenOpponent.delete(bot.id);
    }
   }
   if(this.physicallyRejoined.size===this.bots.length)this.freeCombat=true;
   return;
  }
  for(const bot of this.bots){
   // Native CpuAgentSystem.respawnBot restores the genuine original HIGH
   // spawn after its real 150-tick death countdown. Historical first-drop
   // completion is NOT evidence of this NEW life reaching the lower floor.
   const priorLife=this.previousLife.get(bot.id);
   // A REAL native splat immediately invalidates this actor's former
   // physical first-drop/rejoin proof. An absent CPU is NOT still 7/7.
   if(priorLife==='ACTIVE'&&bot.lifeState==='SPLATTED'){
    this.physicallyRejoined.delete(bot.id);
    this.f4GuideProgress?.delete(bot.id);
    this.f4GuideLastAudit?.delete(bot.id);
    this.originalSourceRecoveryIntent.delete(bot.id);
    this.cleared.delete(bot.id);
    this.physicallyFalling.delete(bot.id);
    this.respawnOriginalDrops.delete(bot.id);
    this.patrolIndex.set(bot.id,-1);
    this.realKccRejectedSteps.delete(bot.id);
    this.originalSourceFailedAlternateHold?.delete(bot.id);
    this.realKccBTeamRecoveryAnchor?.delete(bot.id);
    this.p2BTeamDroughtFoot.delete(bot.id);
    this.p2BTeamLastFullRouteAuditTick.delete(bot.id);
    // A new real life cannot inherit the splatted actor's previously
    // approved tactical destination, or A1's old player C-key order.
    // Leave all surviving teammates' independent source goals intact.
    this.b443OriginalGoalLocks.delete(bot.id);
    this.b442LastApprovedFront.delete(bot.id);
    if(bot.id==='A1'){
     this.b143ApprovedNativeAllyGoal=null;
     // ARRIVED owns a real native dwell even though its order pointer
     // is null. Physical splat must invalidate both live states.
     if(this.b471AllyOrder||this.b471ArrivedOriginalDwell){
      this.b471OrderStatus='HOLD';
      this.b471SourceDecision='PHYSICAL_SOURCE_HOLD';
     }
     this.b471AllyOrder=null;
     this.b471ArrivedOriginalDwell=null;
    }
   }
   if(this.freeCombat&&priorLife==='SPLATTED'&&
      bot.lifeState==='ACTIVE'){
    this.physicallyRejoined.delete(bot.id);
    this.cleared.delete(bot.id);
    this.physicallyFalling.delete(bot.id);
    this.patrolIndex.set(bot.id,-1);
    const originalStart=new Vec3(...this.routeFor(bot.id).start);
    if(bot.mobilityState==='GROUND'&&
       bot.position.distance(originalStart)<=.22){
     this.respawnOriginalDrops.add(bot.id);
     this.respawnOriginalDetected++;
    }else{
     // Non-original respawn feet must not receive an invented route.
     this.respawnOriginalDrops.delete(bot.id);
     this.respawnUnsafeReturnHolds++;
    }
   }
   this.previousLife.set(bot.id,bot.lifeState??'ACTIVE');
   const oldFoot=this.previousFeet.get(bot.id)!;
   const step=oldFoot.distance(bot.position);
   if(step>.015)this.lastMoved.set(bot.id,frame);
   if(this.enableB34SourceStallRecovery&&this.freeCombat&&
      bot.mobilityState==='GROUND'&&step<.18){
    this.b34StationarySourceTicks.set(bot.id,
     step<=.015?Math.min(180,(this.b34StationarySourceTicks.get(bot.id)??0)+1):0);
   }else this.b34StationarySourceTicks.set(bot.id,0);
   if(this.freeCombat&&bot.mobilityState==='GROUND'&&step<.18){
    this.travelMeters+=step;
    if(sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined))
     this.realGroundTravelMetersByActor?.set(bot.id,
      (this.realGroundTravelMetersByActor.get(bot.id)??0)+step);
    this.groundedFreeCombatCpuSamples++;
    if(step<=.015)this.nearlyStationaryGroundedCpuSamples++;
   }
   oldFoot.copy(bot.position);
   const previous=this.previous.get(bot.id);
   if(bot.lifeState==='ACTIVE'&&
      (bot.mobilityState==='FIRST_DROP_FALL'||
       bot.mobilityState==='FIRST_DROP_REJOIN'))
    this.physicallyFalling.add(bot.id);
   else if(bot.lifeState==='SPLATTED')
    this.physicallyFalling.delete(bot.id);
   // A former FIRST_DROP_REJOIN cannot grant a new landing to an actor
   // whose 150-tick splat countdown just ended at the upper spawn.
   if(previous==='FIRST_DROP_REJOIN'&&bot.mobilityState==='GROUND'&&
      bot.lifeState==='ACTIVE'&&priorLife!=='SPLATTED'){
    this.physicallyRejoined.add(bot.id);
    if(this.respawnOriginalDrops.delete(bot.id))
     this.respawnOriginalRejoins++;
   }
   this.previous.set(bot.id,bot.mobilityState);
  }
  for(const bot of this.bots){
   if(!this.physicallyRejoined.has(bot.id)||this.cleared.has(bot.id))
    continue;
   const route=this.routeFor(bot.id);
   const side=bot.team;
   const sameSide=this.routePlan.routes.filter(r=>
    r.actorId!==bot.id &&
    (r.actorId==='HUMAN'?side===Team.A:
     r.actorId.startsWith(side===Team.A?'A':'B')));
   const corridorClear=sameSide.every(r=>{
    const landing=this.b93UpperDetours.get(r.actorId)?.originalLanding??
     r.originalLanding;
    return Math.hypot(bot.position.x-landing[0],
      bot.position.z-landing[2])>1.55||
      Math.abs(bot.position.y-landing[1])>1.05;
   });
   const actualLanding=this.b93UpperDetours.get(bot.id)?.originalLanding??
    route.originalLanding;
   if(corridorClear&&Math.hypot(
      bot.position.x-actualLanding[0],
      bot.position.z-actualLanding[2])>1.7)
      this.cleared.add(bot.id);
  }
  // B454: observe, NEVER steer. This executes after real CpuAgentSystem
  // KCC, on the same native physics tick. Original static Rapier rays
  // only; original source support/route authorization stays unchanged.
  // Normal user preview never pays for these 2 extra rays.
  if(this.enableB441SourceFrontline&&this.freeCombat&&this.physics&&
     this.stage.solids.length===25&&this.stage.paintSurfaces.length===17&&
     this.stage.navigationLinks?.length===26){
   for(const id of ['B2','B4'] as const){
    const bot=this.bots.find(b=>b.id===id)!;
    const foot=bot.position;
    const ray=this.sourceNativeCharacterFootHit(foot);
    this.b454Trace.append({tick:frame,id,
     foot:[foot.x,foot.y,foot.z],
     mode:bot.mobilityState,life:bot.lifeState??'UNKNOWN',
     rejoined:sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined),
     originalRapierSolidId:ray?.solidId??null,
     originalRapierHitY:ray?.point.y??null,
     registeredOriginalHit:!!ray&&
      this.stage.solids.some(s=>s.id===ray.solidId)});
   }
  }
  // B484: after a GENUINE C key, native post-KCC A1 foot every tick.
  // Observation does not grant original path or modify real CPU motion.
  if(this.enableB441SourceFrontline&&this.enableB137OriginalAllyRally&&
    this.enableB150AllySupportInk&&this.freeCombat&&this.physics&&
    this.b471GenuineKeyRequests>0){
   const a1=this.bots.find(b=>b.id==='A1');
   if(a1){
    const foot=a1.position,g=this.b471AllyOrder?.goal;
    const ray=this.sourceNativeCharacterFootHit(foot);
    this.b484A1Trace.observe({
     tick:frame,foot:[foot.x,foot.y,foot.z],mode:a1.mobilityState,
     rejoined:sourceNativeLiveRejoinedCpu(a1,this.physicallyRejoined),
     originalSolidId:ray?.solidId??null,
     existingB471Goal:g?[g.x,g.y,g.z]:null,
     keyRequests:this.b471GenuineKeyRequests,
     approvedGoals:this.b471StrictlyApprovedOriginalGoals,
     nativeGoalRequests:this.b471ActualNativeGoalRequests,
     verifiedArrivals:this.b471ActualOriginalArrivals,
     status:this.b471OrderStatus
    });
   }
  }
  // B486: true post-KCC CPU feet and same-frame actual player Rapier
  // foot; research-only physics DISTANCES, never encounters/route proof.
  if(this.enableB441SourceFrontline&&this.freeCombat&&
     this.physicallyRejoined.size===7&&this.b192HumanAliveGrounded&&
     this.b192HumanTick===frame&&this.stage.solids.length===25&&
     this.stage.paintSurfaces.length===17&&
     this.stage.navigationLinks?.length===26&&
     this.stage.paintSurfaces.every(s=>
      (s.flags&SurfaceFlags.Scoreable)===0)){
   this.b486Encounter.record({
    tick:frame,source:[25,17,26,0],
    humanFoot:[this.b192NativeHumanFoot.x,this.b192NativeHumanFoot.y,
     this.b192NativeHumanFoot.z],
    humanAliveGrounded:true,
    cpu:this.bots.map(bot=>({
     id:bot.id,team:bot.team===Team.A?'A' as const:'B' as const,
     foot:[bot.position.x,bot.position.y,bot.position.z],
     active:bot.lifeState==='ACTIVE',
     grounded:bot.mobilityState==='GROUND',
     physicallyRejoined:sourceNativeLiveRejoinedCpu(
      bot,this.physicallyRejoined)
    }))
   });
  }
  if(this.physicallyRejoined.size===7&&!this.freeCombat){
   this.freeCombat=true;
   for(const bot of this.bots){
    bot.agent?.resetMoveTarget();
    bot.thinkRemaining=Math.min(bot.thinkRemaining,.18);
    bot.paintRemaining=Math.min(bot.paintRemaining,.12);
    bot.fireRemaining=Math.min(bot.fireRemaining,.3);
    bot.jumpCooldownSeconds=0;
   }
  }
 }

 /** W10-B16: read-only O(3x4) native cross-team path probe, called once
  * after source-authentic drop/rejoin. Not a game AI decision or a
  * certificate of collision-supported walkability. */
 auditW10B16NaturalEnemyAccess(){
  if(!this.freeCombat||this.physicallyRejoined.size!==7||
     this.bots.length!==7||this.stage.solids.length!==25||
     this.stage.paintSurfaces.length!==17||
     this.stage.navigationLinks?.length!==26)
   throw Error('T21_W10B16_SEVEN_REAL_ORIGINAL_SOURCE_ACTORS_REQUIRED');
  const active=this.bots.filter(b=>b.mobilityState==='GROUND'&&
   b.lifeState!=='SPLATTED');
  const side=(team:Team.A|Team.B)=>active.filter(b=>b.team===team);
  const a=side(Team.A),b=side(Team.B);
  const pairs=a.flatMap(left=>b.map(right=>{
   const native=this.nav.auditPath(left.position,right.position);
   const realDistance=Math.hypot(
    left.position.x-right.position.x,
    left.position.y-right.position.y,
    left.position.z-right.position.z);
   const credibleNativeEndpoints=native.reachedTarget&&
    native.startSnapDistanceMeters<=.20&&
    native.endSnapDistanceMeters<=.20&&native.pointCount>0;
   return {actors:[left.id,right.id] as [string,string],
    positions:[left.position.toArray(),right.position.toArray()],
    directDistanceMeters:realDistance,
    nativePathReported:native.reachedTarget,
    credibleNativeEndpoints,
    nativeStartSnapMeters:native.startSnapDistanceMeters,
    nativeEndSnapMeters:native.endSnapDistanceMeters,
    nativePointCount:native.pointCount};
  }));
  const credible=pairs.filter(p=>p.credibleNativeEndpoints).length;
  return {
   status:credible===0?'HOLD_NO_CROSS_TEAM_NATIVE_FOOT_PATH':
    'HOLD_NATIVE_ROUTE_REQUIRES_ORIGINAL_KCC_AND_ACTOR_EVIDENCE',
   sourceOnly:true,
   exactNativeCpuFootPairs:true,
   syntheticCombatantPlacements:0,
   cpuA:a.map(x=>x.id),cpuB:b.map(x=>x.id),
   cpuARealFeet:a.map(x=>({id:x.id,foot:x.position.toArray()})),
   cpuBRealFeet:b.map(x=>({id:x.id,foot:x.position.toArray()})),
   pairCount:pairs.length,
   credibleNativeEndpointPairs:credible,
   shortestCrossTeamDistanceMeters:Math.min(
    Infinity,...pairs.map(p=>p.directDistanceMeters)),
   shortestCrossTeamPair:pairs.length?pairs.reduce((u,v)=>
    u.directDistanceMeters<=v.directDistanceMeters?u:v):null,
   pairs,
   originalSourceSolids:this.stage.solids.length,
   originalPaintSurfaces:this.stage.paintSurfaces.length,
   originalNavLinks:this.stage.navigationLinks?.length,
   sourceScoreablePromotions:0,
   physicalActorTeleports:0,
   originSetActorBancAuthenticated:false,
   nativePathIsNotPhysicalKccCertification:true,
   realEnemyEngagementCertified:false,
   productionAuthorized:false
  };
 }
 private routeFor(id:string){
  const route=this.routePlan.routes.find(r=>r.actorId===id);
  if(!route)throw Error('T21_F3_SOURCE_ROUTE_MISSING_'+id);
  return route;
 }
 /** Exact seven physical CPU HP/life states, read at native 60Hz.
  * Avoid building the much larger sourcePatrol QA snapshot every physics tick.
  * No inferred rejoin, teleport, Actor mutation, or opponent route. */
 /** B454 one-shot QA evidence export, research URL only; no actor writes. */
 /** B487 native cross-side audit; real physical CPU feet + actual
  * human KCC foot. On-demand only; never issues a Crowd target.
  * Original link count does NOT independently prove lack of floor paths.
  */
 b487ReadOnlyOriginalCrossTeamConnectivity(){
  if(!this.enableB441SourceFrontline||!this.freeCombat||
     this.physicallyRejoined.size!==7||
     !this.b192HumanAliveGrounded||
     this.bots.length!==7||
     this.stage.solids.length!==25||
     this.stage.paintSurfaces.length!==17||
     this.stage.navigationLinks?.length!==26||
     this.stage.paintSurfaces.some(s=>
      (s.flags&SurfaceFlags.Scoreable)!==0))return null;
  const existing=this.auditW10B16NaturalEnemyAccess();
  const b=this.bots.filter(bot=>bot.team===Team.B);
  const humanPaths=b.map(bot=>{
   const p=this.nav.auditPath(this.b192NativeHumanFoot,bot.position);
   return {actors:['HUMAN',bot.id] as [string,string],
    nativePathReported:p.reachedTarget,
    credibleNativeEndpoints:p.reachedTarget&&p.pointCount>0&&
     p.startSnapDistanceMeters<=.20&&p.endSnapDistanceMeters<=.20,
    nativeStartSnapMeters:p.startSnapDistanceMeters,
    nativeEndSnapMeters:p.endSnapDistanceMeters,
    nativePointCount:p.pointCount};
  });
  const distances=this.b486Encounter.summary();
  if(!distances)return null;
  return b487ActualOriginalCrossTeamTopology({
   originalStage:[25,17,26,0],nativeTick:this.b137NativeTick,
   authenticSevenCpu:true,nativeHumanGrounded:true,
   links:this.stage.navigationLinks,
   pairs:[...existing.pairs.map(p=>({
    actors:p.actors,nativePathReported:p.nativePathReported,
    credibleNativeEndpoints:p.credibleNativeEndpoints,
    nativeStartSnapMeters:p.nativeStartSnapMeters,
    nativeEndSnapMeters:p.nativeEndSnapMeters,
    nativePointCount:p.nativePointCount})),...humanPaths],
   nearestHumanEnemy3dMeters:distances.nearestHumanToEnemy3dMeters,
   nearestAllyEnemy3dMeters:distances.nearestAllyToEnemy3dMeters
  });
 }
 /** B488 uses only the real B487 query and the immutable historical
  * source gap ledger; its result is never a route or collision grant. */
 b488ReadOnlyOriginalCrossTeamGapDecision(){
  const live=this.b487ReadOnlyOriginalCrossTeamConnectivity();
  if(!live)return null;
  return b488OriginalCrossTeamGapDecision(live,
   UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.sourceNativeRouteGapAudit);
 }
 b486ReadOnlyTrueNativeOriginalEncounter(){
  if(!this.enableB441SourceFrontline)return null;
  return this.b486Encounter.snapshot();
 }
 b484RealOriginalA1OrderTrace(){
  if(!this.enableB441SourceFrontline||
     !this.enableB137OriginalAllyRally||!this.enableB150AllySupportInk)
   return null;
  return this.b484A1Trace.snapshot();
 }
 b484RealOriginalA1OrderProgress(){
  if(!this.enableB441SourceFrontline||
     !this.enableB137OriginalAllyRally||!this.enableB150AllySupportInk)
   return null;
  return this.b484A1Trace.summary();
 }
 b454ReadOnlyOriginalNativeFootTrace(){
  if(!this.enableB441SourceFrontline||!this.physics)
   throw Error('B454_ORIGINAL_RESEARCH_OPT_IN_REQUIRED');
  return this.b454Trace.snapshot();
 }
 /** A real 150-tick CPU respawn begins a NEW physical life before
  * traffic.observe. Discard the prior life's landing, teammate orders,
  * and local-source tactical state immediately, without editing any
  * actual CPU foot, NavMesh, stage, shot, paint or HP. */
 onNativeSourceCpuRespawn(id:string):void{
  const bot=this.bots.find(b=>b.id===id);
  if(!bot||bot.lifeState!=='SPLATTED')
   throw Error('T21_F3_SOURCE_RESPAWN_REQUIRES_REAL_SPLATTED_CPU');
  this.physicallyRejoined.delete(id);
  if(this.f4WholeSupport){
   this.f4WholeGoals.delete(id);
   this.f4WholeDirections.delete(id);
   this.f4PatrolNavigation.clear(id);
   this.f4PatrolSurvey.clear(id);
   this.f4LastSeenOpponent.delete(id);
   // A respawn starts a new life: invalidate other actors' old sightings.
   // Their next native thought may reacquire through actual current sight.
   for(const [observer,seen] of this.f4LastSeenOpponent){
    if(seen.id!==id)continue;
    this.f4LastSeenOpponent.delete(observer);
    if(this.f4WholeGoals.get(observer)?.opponent===id)this.f4WholeGoals.delete(observer);
   }
   return;
  }
  this.f4OriginalPatrol?.delete(id);
  this.f4GuideProgress?.delete(id);
  this.f4GuideLastAudit?.delete(id);
  this.physicallyFalling.delete(id);
  this.cleared.delete(id);
  this.respawnOriginalDrops.delete(id);
  this.originalSourceRecoveryIntent.delete(id);
  // A successful native 150-tick respawn starts a DIFFERENT physical
  // life. B446's old-foot dry probe and B467/B470's later-foot grants
  // cannot be inherited by the new high-spawn Actor. Original constructor
  // approvals are stationary SOURCE facts, not a granted NEW-life route:
  // retain only those vetted immutable candidate endpoints. Every actual
  // new movement still needs Recast and Rapier approval.
  this.b446LiveFootProbes.delete(id);
  this.b467LiveSourceGoals.delete(id);
  this.b467LastLiveRetryTick.delete(id);
  this.b470LastNativeRetry.delete(id);
  const initial=this.b445FrontlineGates.get(id);
  if(initial)this.b441FrontGoals.set(id,
   initial.approvedOriginalGoals.map(p=>new Vec3(...p)));
  this.b443OriginalGoalLocks.delete(id);
  this.b442LastApprovedFront.delete(id);
  this.b441OriginalRampGoal?.delete(id);
  this.b441OriginalRampLastAuditTick?.delete(id);
  this.patrolIndex.set(id,-1);
  this.realKccRejectedSteps.delete(id);
  this.originalSourceFailedAlternateHold?.delete(id);
  this.realKccBTeamRecoveryAnchor?.delete(id);
  this.realKccB4Unsupported?.delete(id);
  this.realKccB3Unsupported?.delete(id);
   this.realKccLastActorBlocker?.delete(id);
   this.p2BTeamDroughtFoot.delete(id);
   this.p2BTeamLastFullRouteAuditTick.delete(id);
  if(id==='A1'){
   this.b143ApprovedNativeAllyGoal=null;
   // Genuine 150-tick respawn never inherits the old-life C order
   // nor its completed supported arrival dwell.
   if(this.b471AllyOrder||this.b471ArrivedOriginalDwell){
    this.b471OrderStatus='HOLD';
    this.b471SourceDecision='PHYSICAL_SOURCE_HOLD';
   }
   this.b471AllyOrder=null;
   this.b471ArrivedOriginalDwell=null;
  }
 }
 /** CPU main/kit sight uses the SAME actual-lifecycle + original
  * physical-rejoin fact as traffic, without adding any stage/Actor power. */
 isLiveRejoinedSourceCpu(id:string):boolean{
  const bot=this.bots.find(b=>b.id===id);
  return !!bot&&sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined);
 }
 nativeCpuLifecycleFrames():B367NativeCpuState[]{
  return this.bots.map(b=>({
   id:b.id,
   lifeState:b.lifeState??'UNKNOWN',
   rejoined:sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined),
   hp:Number.isFinite(b.hp)?b.hp!:null
  }));
 }
 /** Read the genuine native SOURCE staging phase without cloning a
  * historical QA telemetry ledger at each 60Hz physics step. */
 nativeSourceFreeCombatEnabled():boolean{
  return this.freeCombat;
 }
 /** Read-only equivalent of snapshot().physicalRejoins.length===7.
  * An old rejoin never counts a genuine current SPLATTED actor as active. */
 nativeSourceAllSevenLiveRejoined():boolean{
  return this.bots.length===7&&this.bots.every(bot=>
   sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined));
 }
 /** Exact same live-rejoined IDs and actor order as snapshot() for
  * true PLAYER READY. Never count SPLATTED/stale rejoin CPU or clone
  * unrelated QA patrol ledgers just to show the seven-actor roster. */
 nativeSourceLiveRejoinedIds():readonly string[]{
  return this.bots.filter(b=>
   sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined)).map(b=>b.id);
 }
 /** Native radar needs only the real 7 actor feet and actual approved
  * patrol goals. The previous every-third-render traffic.snapshot()
  * also cloned unrelated QA ledgers and route audits. No game writes.
  */
 /** Read-only F4 motion witness; legacy original-route arrivals are not F4 progress. */
 f4WholeMotionEvidence(){
  if(!this.f4WholeSupport)return null;
  return {tick:this.b137NativeTick,freeCombat:this.freeCombat,realGoalRequests:this.realGoalRequests,
   cpu:this.bots.map(b=>{const g=this.f4WholeGoals.get(b.id);return {
    id:b.id,foot:[b.position.x,b.position.y,b.position.z],lifeState:b.lifeState,mobilityState:b.mobilityState,
    rejoined:sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined),lastMovedTick:this.lastMoved.get(b.id)??null,
    goal:g?{point:[g.point.x,g.point.y,g.point.z],issued:g.issued,advanced:g.advanced,local:g.local,
     opponent:g.opponent??null,kccVeto:g.patrolVeto===true}:null};})};
 }
 nativeSourceRadarView():{
  cpu:readonly {id:string;physicalFoot:[number,number,number];
   mobilityState:string;rejoined:boolean}[];
  sourcePatrol:{activeTargets:readonly {id:string;
   position:[number,number,number]}[]}
 }{
  return {
   cpu:this.bots.map(b=>({
    id:b.id,mobilityState:b.mobilityState,
    rejoined:sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined),
    physicalFoot:[b.position.x,b.position.y,b.position.z] as
     [number,number,number]
   })),
   sourcePatrol:{activeTargets:this.bots.flatMap(bot=>{
    const index=this.patrolIndex.get(bot.id)??-1;
    const point=this.patrolGoals.get(bot.id)?.[index];
    return index>=0&&point&&
     sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)
     ?[{id:bot.id,position:[point.x,point.y,point.z] as
      [number,number,number]}]:[];
   })}
  };
 }
 snapshot():F3TrafficSnapshot{
  return {
   cpu:this.bots.map(b=>({id:b.id,mobilityState:b.mobilityState,
    released:this.released.has(b.id),
    rejoined:sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined),
    lastMovedTick:this.lastMoved.get(b.id)??0,
    physicalFoot:[b.position.x,b.position.y,b.position.z] as [number,number,number],
     lifeState:b.lifeState??'UNKNOWN',hp:Number.isFinite(b.hp)?b.hp!:null})),
   physicalFirstDrops:[...this.physicallyFalling],
   // An immediate projectile splat can occur after traffic.observe().
   // Show only genuine rejoined AND presently alive original CPUs.
   physicalRejoins:this.bots.filter(b=>
    sourceNativeLiveRejoinedCpu(b,this.physicallyRejoined)).map(b=>b.id),
   landingCorridorsCleared:[...this.cleared],
   releasedCpuIds:[...this.released],
   freeCombatEnabled:this.freeCombat,
   b93UpperDetours:[...this.b93UpperDetours].map(([actorId,v])=>({
    actorId,linkId:v.linkId,phase:v.phase,escapeFoot:v.escapeFoot})),
   b93ExperimentalEnabled:this.enableB93UpperDetour,
   sourcePatrol:{auditedTargets:this.auditedTargets,
    b441Enabled:this.enableB441SourceFrontline,
    f4GuideLastAudit:[...(this.f4GuideLastAudit?.values()??[])],
    b441ProposalsChecked:this.b441ProposalsChecked,
    b441StrictGoalsAvailable:this.b441StrictGoalsAvailable,
    b441ActualGoalRequests:this.b441ActualGoalRequests,
    b441UnsafeOrUnreachableHolds:this.b441UnsafeOrUnreachableHolds,
    b441ClosestApprovedFrontAbsZ:this.b441ClosestApprovedFrontAbsZ,
    originalRampLocal:{
     approved:this.b441OriginalRampApprovals??0,
     retained:this.b441OriginalRampRetentions??0,
     rejected:this.b441OriginalRampRejected??0,
     active:[...(this.b441OriginalRampGoal??new Map<string,Vec3>())]
      .map(([id,goal])=>({id,point:[goal.x,goal.y,goal.z] as
       [number,number,number]})),
     crossTeamRoutesAuthorized:false as const
    },
    b445OriginalFrontlineGates:[...this.b445FrontlineGates.values()]
     .map(v=>({...v,actualOriginalLanding:[...v.actualOriginalLanding] as
       [number,number,number],
      approvedOriginalGoals:v.approvedOriginalGoals.map(p=>
       [...p] as [number,number,number])})),
    b446LivePhysicalFootDryRouteProbes:
     [...this.b446LiveFootProbes.values()].map(v=>({
      ...v,actualPhysicalFoot:[...v.actualPhysicalFoot] as
       [number,number,number],
      firstPassingExistingGoal:v.firstPassingExistingGoal?
       [...v.firstPassingExistingGoal] as [number,number,number]:null
     })),
    b448A3ResearchEnabled:this.enableB448A3LiveOriginalFront,
    b448A3FreshLiveOriginalGoalsAuthorized:
     this.b448A3FreshLiveOriginalGoalsAuthorized,
    b448A3FreshLiveOriginalHolds:this.b448A3FreshLiveOriginalHolds,
    b448A3RealNativeGoalRequests:this.b448A3RealNativeGoalRequests,
    b467RealLateFoot:{
     sourceOnlyResearch:this.enableB441SourceFrontline,
     genuineNativeRetryAttempts:this.b467LiveRetryAttempts,
     rejectedUnchangedOriginalChecks:this.b467LiveRejectedCandidates,
     strictlyApprovedLateGoals:this.b467LateOriginalGoalsApproved,
     actualNativeGoalRequests:this.b467TrueNativeGoalRequests,
     secondDistinctOriginalGoalsApproved:
      this.b467SecondDistinctOriginalGoalsApproved,
     additionalStrictOriginalCoverageGoalsApproved:
      this.b469AdditionalOriginalCoverageGoals,
     nativeOriginalInkRankedExpansionAttempts:
      this.b469NativeInkRankedExpansionAttempts,
     nativeRetargetWitnesses:this.b467NativeRetargetWitnesses.map(w=>({
      id:w.id,nativeTick:w.nativeTick,
      actualFoot:[...w.actualFoot] as [number,number,number],
      previousOriginalGoal:[...w.previousOriginalGoal] as [number,number,number],
      nextOriginalGoal:[...w.nextOriginalGoal] as [number,number,number]
     })),
     nativeApprovalWitnesses:[...this.b467LiveSourceGoals].map(([id,v])=>
      ({id,nativeTick:v.nativeTick,
       actualFoot:[...v.actualFoot] as [number,number,number],
       actualOriginalSolidId:v.actualOriginalSolidId,
       sourceGoal:[...v.sourceGoal] as [number,number,number]})),
     opposingRouteCertified:false as const,officialWinner:'NONE' as const
    },
    b470NativeLocalCoverage:{
     strictlyApprovedAdditionalOriginalGoals:
      this.b470LocalRealAdditionalGoals,
     rankedOwnerGridAuditAttempts:this.b470RankedActualGoalAudits,
     actualDistinctOriginalGoalRequests:
      this.b470RealDistinctGoalRequests,
     realNativeRetargetWitnesses:this.b470NativeRetargetWitnesses.map(w=>({
      id:w.id,nativeTick:w.nativeTick,
      actualFoot:[...w.actualFoot] as [number,number,number],
      previousOriginalGoal:[...w.previousOriginalGoal] as [number,number,number],
      nextOriginalGoal:[...w.nextOriginalGoal] as [number,number,number]
     })),
     opponentRouteCertified:false as const,
     scoreableSourcePromotions:0 as const
    },
    b471TruePlayerOrderedAlly:this.b471ReadOnlyAllyCoverageOrder(),
    b443NativeGoalRetentions:this.b443NativeGoalRetentions,
    b443FirstActualFrontlineArrivals:this.b443FirstActualFrontlineArrivals,
    b443RotationsAfterDwell:this.b443RotationsAfterDwell,
    b443ReleasedUnsafeOrStalled:this.b443ReleasedUnsafeOrStalled,
    b442LastApprovedRealFrontTargets:this.bots.flatMap(bot=>{
     const last=this.b442LastApprovedFront.get(bot.id);
     if(!last||!sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined))
      return [];
     const target=last.target,foot=bot.position;
     return [{
      id:bot.id,
      target:[target.x,target.y,target.z] as [number,number,number],
      physicalFoot:[foot.x,foot.y,foot.z] as [number,number,number],
      distanceXZ:Math.hypot(target.x-foot.x,target.z-foot.z),
      distance3D:Math.hypot(target.x-foot.x,target.y-foot.y,
       target.z-foot.z),
      lastApprovedNativeTick:last.nativeTick,
      originalRegisteredSourceOnly:true as const
     }];
    }),
    b137AllyRallyOptIn:this.enableB137OriginalAllyRally,
    b137RealCandidateChecks:this.b137RealCandidateChecks,
    b137ApprovedNativeRallies:this.b137ApprovedNativeRallies,
    b137UnsafeOrUnsupportedRallies:this.b137UnsafeOrUnsupportedRallies,
    b137MissingSourceFloorProof:this.b137MissingSourceFloorProof,
     b142OriginalStandoffGoalsApproved:this.b142OriginalStandoffGoalsApproved,
     b142UnsafeStandoffGoalsDenied:this.b142UnsafeStandoffGoalsDenied,
     b143ReauthorizedStableStandoffGoals:
      this.b143ReauthorizedStableStandoffGoals,
     b143UnsafeOrStaleGoalHoldsRejected:
      this.b143UnsafeOrStaleGoalHoldsRejected,
    b150AllySupportInkOptIn:this.enableB150AllySupportInk,
    b169SourceAdvanceGuardChecks:this.b169SourceAdvanceGuardChecks,
    b169NativeAdvanceGuardTargets:this.b169NativeAdvanceGuardTargets,
    b169RejectedUnsafeOrUnreachableGoals:
     this.b169RejectedUnsafeOrUnreachableGoals,
    b199ActualCollisionReliefChecks:this.b199ActualCollisionReliefChecks,
    b199OriginalNativeReliefGoals:this.b199OriginalNativeReliefGoals,
    b199RejectedUnsafeReliefPaths:this.b199RejectedUnsafeReliefPaths,
    b150SourceCandidateSamples:this.b150SourceCandidateSamples,
    b150ApprovedInkAims:this.b150ApprovedInkAims,
    b153DiversifiedAimApprovals:this.b153DiversifiedAimApprovals,
    realGoalRequests:this.realGoalRequests,
    ...(this.f4WholeSupport?{f4LocalCombatProposals:{...this.f4LocalCombatProposals}}:{}),
    heldRequests:this.heldRequests,
    engagementGoalRequests:this.engagementGoalRequests,
    respawnOriginalDetected:this.respawnOriginalDetected,
    respawnOriginalGoalRequests:this.respawnOriginalGoalRequests,
    respawnOriginalRejoins:this.respawnOriginalRejoins,
    respawnUnsafeReturnHolds:this.respawnUnsafeReturnHolds,
    respawnPendingCpuIds:[...this.respawnOriginalDrops],
    b192ApprovedHumanCombatGoals:this.b192ApprovedHumanCombatGoals,
    b192RejectedHumanCombatGoals:this.b192RejectedHumanCombatGoals,
    sameSourceEnemyCandidates:this.sameSourceEnemyCandidates,
    deniedNativeEnemyPaths:this.deniedNativeEnemyPaths,
    sourceEndpointProbes:this.sourceEndpointProbes,
    nativeRouteChecks:this.nativeRouteChecks,
    nativeRouteRayProbes:this.nativeRouteRayProbes,
    rejectedUnsupportedNativeRoutes:this.rejectedUnsupportedNativeRoutes,
    unauditedPatrolRouteRequests:this.unauditedPatrolRouteRequests,
    rejectedUnsupportedGoals:this.rejectedUnsupportedGoals,
    deniedUnsupportedEnemyFeet:this.deniedUnsupportedEnemyFeet,
    travelMeters:this.travelMeters,
    realGroundTravelMetersByActor:Object.fromEntries(this.bots.map(bot=>
     [bot.id,this.realGroundTravelMetersByActor?.get(bot.id)??0])),
    groundedFreeCombatCpuSamples:this.groundedFreeCombatCpuSamples,
    nearlyStationaryGroundedCpuSamples:
     this.nearlyStationaryGroundedCpuSamples,
    requestedGoalDirectMeters:this.requestedGoalDirectMeters,
    requestedGoalNativePathMeters:this.requestedGoalNativePathMeters,
    requestedGoalShortHops:this.requestedGoalShortHops,
    requestedGoalLongHops:this.requestedGoalLongHops,
    requestedGoalLengthsSampled:this.requestedGoalLengthsSampled,
    trulyNewOriginalGoalSelections:this.trulyNewOriginalGoalSelections,
    newGoalDirectMeters:this.newGoalDirectMeters,
    newGoalNativePathMeters:this.newGoalNativePathMeters,
    newGoalShortHops:this.newGoalShortHops,
    newGoalLongHops:this.newGoalLongHops,
    paintAwareModeEnabled:this.enablePaintAwarePatrol&&!!this.sourceInk,
    b34StallRecoveryModeEnabled:this.enableB34SourceStallRecovery&&
     this.enablePaintAwarePatrol&&!!this.sourceInk&&this.enableStableSourceGoal,
    stalledOriginalGoalReconsiderations:
     this.stalledOriginalGoalReconsiderations,
    approvedAlternativeOriginalGoalsAfterStall:
     this.approvedAlternativeOriginalGoalsAfterStall,
    stableSourceGoalModeEnabled:this.enablePaintAwarePatrol&&
     !!this.sourceInk&&this.enableStableSourceGoal,
    continuedPreviouslyApprovedGoalRequests:
     this.continuedPreviouslyApprovedGoalRequests,
    switchedGoalBeforePreviousArrival:
     this.switchedGoalBeforePreviousArrival,
    actualOriginalInkOwnershipLookups:this.actualOriginalInkOwnershipLookups,
    actualOriginalInkOwnershipSampled:this.actualOriginalInkOwnershipSampled,
    realPaintAwareGoalsAccepted:this.realPaintAwareGoalsAccepted,
    paintAwareNonOwnedGoalsAccepted:this.paintAwareNonOwnedGoalsAccepted,
    paintAwareOwnGoalsAccepted:this.paintAwareOwnGoalsAccepted,
    paintAwareUnknownInkGoalsAccepted:this.paintAwareUnknownInkGoalsAccepted,
    paintAwareRouteShortcutsGranted:0,
    activeTargets:this.bots.flatMap(bot=>{
     const index=this.patrolIndex.get(bot.id)??-1;
     const point=this.patrolGoals.get(bot.id)?.[index];
     return index>=0&&point&&
      sourceNativeLiveRejoinedCpu(bot,this.physicallyRejoined)
      ?[{id:bot.id,position:[point.x,point.y,point.z] as [number,number,number]}]:[];
    }),
    attemptsToCrossUnboundUnderpass:0,sourceOnly:true,
    productionAuthorized:false},
   originalSourceLinksUsed:this.routePlan.distinctFirstDropLinks,
   physicalFootRelocations:0,productionAuthorized:false
  };
 }
}
