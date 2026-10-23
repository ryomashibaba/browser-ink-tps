/**
 * F3 opt-in playable preview traffic: reuse ONLY the eight genuine source
 * spawn feet and frozen existing first-drop + FloorConcrete03 ramp links.
 * No synthetic traversable pad, moving physical feet, scoring, or promotion.
 * Two independent source-side queues preserve the F2 7/7 physical recovery
 * result while the human is controlled by real PlayerInput.
 */
import {Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {Team} from '../ink/types';
import type {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {rankOriginalSourcePatrolGoals,prioritizeExistingInFlightSourceGoal,mayReconsiderStalledOriginalGoal} from './UndertowF3PaintAwarePatrol';
import {eligibleB137OriginalAllyRally} from './UndertowF3OriginalAllyRally';
import {chooseB142OriginalAllyStandoff,mayRetainB143OriginalAllyStandoff}
 from './UndertowF3OriginalAllyStandoff';
import {inspectB130OriginalFlatSource} from './W10B130OriginalFlatEdge';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import type {CpuQaSourceGoalAuthority} from '../ai/CpuAgentSystem';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import type {SourceSpawnPlan}
 from '../stage/undertow/UndertowPhase14QSourceSpawnPlan';
import {planT21F2SourceDropRoutes,type T21F2RoutePlan}
 from '../stage/undertow/UndertowF2SourceDropRoutes';

export interface F3TrafficCpu{
 id:string;team:Team.A|Team.B;position:Vec3;agent:CrowdAgent|null;
 mobilityState:string;thinkRemaining:number;paintRemaining:number;
 fireRemaining:number;jumpCooldownSeconds:number;
 lifeState?:'ACTIVE'|'SPLATTED';
}
export interface F3TrafficSnapshot{
 readonly cpu:readonly {id:string;mobilityState:string;released:boolean;rejoined:boolean;lastMovedTick:number;physicalFoot:[number,number,number]}[];
 readonly physicalFirstDrops:readonly string[];
 readonly physicalRejoins:readonly string[];
 readonly landingCorridorsCleared:readonly string[];
 readonly releasedCpuIds:readonly string[];
 readonly freeCombatEnabled:boolean;
 readonly b93UpperDetours:readonly {actorId:string;linkId:string;phase:string;escapeFoot:StageVector3|null}[];
 readonly b93ExperimentalEnabled:boolean;
 readonly sourcePatrol:{
  readonly auditedTargets:number;
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
  readonly realGoalRequests:number;
  readonly heldRequests:number;
  readonly engagementGoalRequests:number;
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
 private readonly patrolGoals=new Map<string,Vec3[]>();
 private readonly patrolIndex=new Map<string,number>();
 private auditedTargets=0;
 private realGoalRequests=0;
 private heldRequests=0;
 private engagementGoalRequests=0;
 private b137RealCandidateChecks=0;
 private b137ApprovedNativeRallies=0;
 private b137UnsafeOrUnsupportedRallies=0;
 private b137MissingSourceFloorProof=0;
 private b142OriginalStandoffGoalsApproved=0;
 private b142UnsafeStandoffGoalsDenied=0;
 private b143ReauthorizedStableStandoffGoals=0;
 private b143UnsafeOrStaleGoalHoldsRejected=0;
 private b143ApprovedNativeAllyGoal:{
  readonly target:Vec3;readonly humanFoot:Vec3;readonly lastCheckedTick:number
 }|null=null;
 private readonly b137ActualHumanFoot=new Vec3();
 private b137HumanFootValid=false;
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

 constructor(
  private readonly stage:StageDefinition,private readonly nav:RecastStageNavigation,
  spawns:SourceSpawnPlan,private readonly bots:readonly F3TrafficCpu[],
  private readonly physics?:RapierStagePhysics,
  private readonly sourceInk?:GameplayInkSystem,
  private readonly enablePaintAwarePatrol=false,
  private readonly enableStableSourceGoal=false,
  private readonly enableB34SourceStallRecovery=false,
  private readonly enableB93UpperDetour=false,
  private readonly enableB137OriginalAllyRally=false
 ){
  this.routePlan=planT21F2SourceDropRoutes(stage,nav,spawns);
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
   this.patrolIndex.set(bot.id,-1);
   this.auditedTargets+=targets.length;
   this.previous.set(bot.id,bot.mobilityState);
   this.previousFeet.set(bot.id,bot.position.clone());
   bot.agent?.resetMoveTarget();
  }
 }

 /** Rapier original-source endpoint only; never certifies a KCC route. */
 private hasSourceFootSupport(foot:Readonly<{x:number;y:number;z:number}>):boolean{
  this.sourceEndpointProbes++;
  // Old disposable CI app source predates W10-B3. Without a supplied
  // Rapier authority, refuse every goal; never silently accept a Nav point.
  if(!this.physics)return false;
  const hit=this.physics.castStageSegment(
   new Vec3(foot.x,foot.y+.65,foot.z),
   new Vec3(foot.x,foot.y-.65,foot.z),'ink-projectile');
  return !!hit&&Math.abs(hit.point.y-foot.y)<=.25&&
   this.stage.solids.some(s=>s.id===hit.solidId);
 }

 /** W10-B4: fail closed on any unsupported intermediate Recast waypoint.
  * Applies only after the genuine seven source-backed CPU first drops.
  * Does not create terrain, navigation, or synthetic actor positions.
  * Endpoint ray support is not a complete KCC capsule certificate. */
 private hasSourceSupportedRoute(
  audit:ReturnType<RecastStageNavigation['auditPath']>,sideSign:number
 ):boolean{
  this.nativeRouteChecks++;
  const points=audit.nativePathPoints;
  if(!this.physics||points.length===0)return false;
  const probe=(point:Readonly<{x:number;y:number;z:number}>):boolean=>{
   this.nativeRouteRayProbes++;
   return [point.x,point.y,point.z].every(Number.isFinite)&&
    point.z*sideSign>=33&&point.y>=2.5&&point.y<=5.5&&
    this.hasSourceFootSupport(point);
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

 chooseSourceGoal(id:string,realFoot:Vec3,out:Vec3):boolean{
  if(!this.freeCombat||!this.physicallyRejoined.has(id)){
   this.heldRequests++;return false;
  }
  const candidates=this.patrolGoals.get(id);
  const bot=this.bots.find(b=>b.id===id);
  if(!bot||!candidates?.length){this.heldRequests++;return false;}
  const sign=bot.team===Team.A?1:-1;
  // W10-B1: genuine opponent feet can become tactical destinations ONLY
  // after all seven original physical drops/rejoins. On this frozen source
  // lab the two teams currently remain separated, so no false cross-map
  // engagement is manufactured. Recast supplies a GOAL, never physical
  // movement authority: CpuAgentSystem still validates every actual step
  // with the source Rapier human-size KCC and actor collision gate.
  if(realFoot.z*sign>=33&&realFoot.y>=2.7&&realFoot.y<=5.25){
   const opponents=this.bots.filter(other=>
    other.id!==id&&other.team!==bot.team&&
    other.mobilityState==='GROUND'&&other.lifeState!=='SPLATTED'&&
    other.position.z*sign>=33&&
    Math.abs(other.position.y-realFoot.y)<=.30)
    .map(other=>({other,distance:Math.hypot(
     other.position.x-realFoot.x,other.position.z-realFoot.z)}))
    .filter(candidate=>candidate.distance>=1.7&&candidate.distance<=10)
    .sort((a,b)=>a.distance-b.distance);
   for(const {other} of opponents){
    this.sameSourceEnemyCandidates++;
    if(!this.hasSourceFootSupport(realFoot)||
       !this.hasSourceFootSupport(other.position)){
     this.deniedUnsupportedEnemyFeet++;continue;
    }
    // Both endpoints are actual CPU feet, not hand-authored enemy spawns.
    // Refuse the unbound underpass, snapped cross-height routes and any
    // Recast query that does not arrive at the real opponent position.
    const native=this.nav.auditPath(realFoot,other.position);
    if(!native.reachedTarget||native.startSnapDistanceMeters>.20||
       native.endSnapDistanceMeters>.20){
     this.deniedNativeEnemyPaths++;continue;
    }
    if(!this.hasSourceSupportedRoute(native,sign)){
     this.rejectedUnsupportedNativeRoutes++;continue;
    }
    this.patrolIndex.set(id,-1);
    out.copy(other.position);
    this.realGoalRequests++;
    this.engagementGoalRequests++;
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
      const hit=this.physics!.castStageSegment(
       new Vec3(v.x,v.y+.65,v.z),
       new Vec3(v.x,v.y-.65,v.z),'ink-projectile');
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
    const nativeFootHit=(p:Vec3)=>this.physics!.castStageSegment(
     new Vec3(p.x,p.y+.65,p.z),
     new Vec3(p.x,p.y-.65,p.z),'ink-projectile');
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
  const active=this.patrolIndex.get(id)??-1;
  // Persist the same audited destination across the tactical think cadence,
  // instead of jittering between nodes every 0.28 seconds. Only move to
  // another original-source destination after genuinely reaching this one.
  const first=active>=0?active:(id.startsWith('A')?0:1);
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
   realFoot.x-prior.x,realFoot.z-prior.z):0;
  const recovering=this.enableB34SourceStallRecovery&&
   this.enablePaintAwarePatrol&&this.enableStableSourceGoal&&
   mayReconsiderStalledOriginalGoal(
    this.b34StationarySourceTicks.get(id)??0,active,priorDistance);
  if(recovering)this.stalledOriginalGoalReconsiderations++;
  const ranked=initialRanks&&this.enableStableSourceGoal&&!recovering?
   prioritizeExistingInFlightSourceGoal(
    initialRanks,candidates,active,realFoot):initialRanks;
  if(ranked){
   this.actualOriginalInkOwnershipLookups+=ranked.length;
   this.actualOriginalInkOwnershipSampled+=
    ranked.filter(r=>r.priority!=='UNSAMPLED').length;
  }
  for(let tries=0;tries<candidates.length;tries++){
   const rank=ranked?.[tries];
   const index=rank?rank.index:(first+tries)%candidates.length;
   // B34 can only escape TO A DIFFERENT PRE-EXISTING SOURCE GOAL,
   // physically supported and native-path audited below. The old goal
   // remains the Crowd agent's last requested target if no safe alternate.
   if(recovering&&index===active)continue;
   const goal=candidates[index]!;
   if(goal.z*sign<33||goal.y<2.7||goal.y>5.25)
    throw Error('T21_F3D_UNAPPROVED_UNDERPASS_CROSSING_GOAL');
   const distance=Math.hypot(realFoot.x-goal.x,realFoot.z-goal.z);
   if(distance<1.5)continue;
   if(!this.hasSourceFootSupport(goal)){
    this.rejectedUnsupportedGoals++;continue;
   }
   const audit=this.nav.auditPath(realFoot,goal);
   // Native path from the REAL CPU foot, never only from a stored proxy.
   if(!audit.reachedTarget||audit.startSnapDistanceMeters>.25||
      audit.endSnapDistanceMeters>.22)continue;
   // W10-B4 regression finding: rejecting every ray-unsupported Recast
   // polyline also vetoes previously physically traversed W8 source patrol
   // paths (B4 then stopped shooting in the full W9 test). The existing
   // ground movement remains subject to per-frame original human-size
   // Rapier KCC and physical collision. Log uncertain patrol routes but
   // do NOT silently rewrite original native goals or cancel that validated
   // locomotion. New cross-team engagement paths still fail closed above.
   if(!this.hasSourceSupportedRoute(audit,sign))
    this.unauditedPatrolRouteRequests++;
   // Observation only: prove the legacy B31 mode repeatedly retargets
   // BEFORE reaching its prior native goal. No Actor position write.
   const oldGoal=active>=0?candidates[active]:undefined;
   const priorInFlight=!!oldGoal&&
    Math.hypot(realFoot.x-oldGoal.x,realFoot.z-oldGoal.z)>=1.5;
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
  x:number;y:number;z:number;grounded?:boolean;active?:boolean
 }>):void{
  // Cache only the ACTUAL native input for this fixed step. No foot
  // relocation and no synthetic actor position. Even when all CPUs are
  // released, refresh validity each physical tick before CPU goal choice.
  this.b137NativeTick=frame;
  this.b137HumanFootValid=false;
  if(this.enableB137OriginalAllyRally&&
     humanFoot?.grounded===true&&humanFoot.active===true&&
     [humanFoot.x,humanFoot.y,humanFoot.z].every(Number.isFinite)){
   this.b137ActualHumanFoot.set(humanFoot.x,humanFoot.y,humanFoot.z);
   this.b137HumanFootValid=true;
  }
  if(this.freeCombat)return;
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
  for(const bot of this.bots){
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
    this.groundedFreeCombatCpuSamples++;
    if(step<=.015)this.nearlyStationaryGroundedCpuSamples++;
   }
   oldFoot.copy(bot.position);
   const previous=this.previous.get(bot.id);
   if(bot.mobilityState==='FIRST_DROP_FALL'||
      bot.mobilityState==='FIRST_DROP_REJOIN')
    this.physicallyFalling.add(bot.id);
   if(previous==='FIRST_DROP_REJOIN'&&bot.mobilityState==='GROUND')
    this.physicallyRejoined.add(bot.id);
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
 snapshot():F3TrafficSnapshot{
  return {
   cpu:this.bots.map(b=>({id:b.id,mobilityState:b.mobilityState,
    released:this.released.has(b.id),rejoined:this.physicallyRejoined.has(b.id),
    lastMovedTick:this.lastMoved.get(b.id)??0,
    physicalFoot:[b.position.x,b.position.y,b.position.z] as [number,number,number]})),
   physicalFirstDrops:[...this.physicallyFalling],
   physicalRejoins:[...this.physicallyRejoined],
   landingCorridorsCleared:[...this.cleared],
   releasedCpuIds:[...this.released],
   freeCombatEnabled:this.freeCombat,
   b93UpperDetours:[...this.b93UpperDetours].map(([actorId,v])=>({
    actorId,linkId:v.linkId,phase:v.phase,escapeFoot:v.escapeFoot})),
   b93ExperimentalEnabled:this.enableB93UpperDetour,
   sourcePatrol:{auditedTargets:this.auditedTargets,
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
    realGoalRequests:this.realGoalRequests,
    heldRequests:this.heldRequests,
    engagementGoalRequests:this.engagementGoalRequests,
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
     return index>=0&&point&&this.physicallyRejoined.has(bot.id)
      ?[{id:bot.id,position:[point.x,point.y,point.z] as [number,number,number]}]:[];
    }),
    attemptsToCrossUnboundUnderpass:0,sourceOnly:true,
    productionAuthorized:false},
   originalSourceLinksUsed:this.routePlan.distinctFirstDropLinks,
   physicalFootRelocations:0,productionAuthorized:false
  };
 }
}
