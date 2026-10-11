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
import type {StageDefinition,StageVector3} from '../stage/StageDefinition';
import {Team} from '../ink/types';
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
}
export interface F3TrafficSnapshot{
 readonly cpu:readonly {id:string;mobilityState:string;released:boolean;rejoined:boolean;lastMovedTick:number;physicalFoot:[number,number,number]}[];
 readonly physicalFirstDrops:readonly string[];
 readonly physicalRejoins:readonly string[];
 readonly landingCorridorsCleared:readonly string[];
 readonly releasedCpuIds:readonly string[];
 readonly freeCombatEnabled:boolean;
 readonly sourcePatrol:{
  readonly auditedTargets:number;
  readonly realGoalRequests:number;
  readonly heldRequests:number;
  readonly travelMeters:number;
  readonly attemptsToCrossUnboundUnderpass:0;
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
 private travelMeters=0;
 private readonly physicallyFalling=new Set<string>();
 private readonly physicallyRejoined=new Set<string>();
 private readonly cleared=new Set<string>();
 private readonly released=new Set<string>();
 private readonly previous=new Map<string,string>();
 private readonly previousFeet=new Map<string,Vec3>();
 private readonly lastMoved=new Map<string,number>();
 private freeCombat=false;

 constructor(
  stage:StageDefinition,private readonly nav:RecastStageNavigation,
  spawns:SourceSpawnPlan,private readonly bots:readonly F3TrafficCpu[]
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
    targets.push(new Vec3(target.x,target.y,target.z));
   }
   // Deterministic source-only loop, no new navigation links. The
   // original unbound underpass gap can never be an intermediate goal.
   targets.sort((a,b)=>b.z*sideSign-a.z*sideSign||
     a.x-b.x);
   this.patrolGoals.set(bot.id,targets);
   this.patrolIndex.set(bot.id,0);
   this.auditedTargets+=targets.length;
   this.previous.set(bot.id,bot.mobilityState);
   this.previousFeet.set(bot.id,bot.position.clone());
   bot.agent?.resetMoveTarget();
  }
 }

 chooseSourceGoal(id:string,realFoot:Vec3,out:Vec3):boolean{
  if(!this.freeCombat||!this.physicallyRejoined.has(id)){
   this.heldRequests++;return false;
  }
  const candidates=this.patrolGoals.get(id);
  const bot=this.bots.find(b=>b.id===id);
  if(!bot||!candidates?.length){this.heldRequests++;return false;}
  const sign=bot.team===Team.A?1:-1;
  let index=this.patrolIndex.get(id)??0;
  for(let tries=0;tries<candidates.length;tries++){
   const goal=candidates[index%candidates.length]!;
   index++;
   if(goal.z*sign<33||goal.y<2.7||goal.y>5.25)
    throw Error('T21_F3D_UNAPPROVED_UNDERPASS_CROSSING_GOAL');
   const distance=Math.hypot(realFoot.x-goal.x,realFoot.z-goal.z);
   if(distance<1.5)continue;
   const audit=this.nav.auditPath(realFoot,goal);
   // A valid native target on the wrong unconnected island is not
   // sufficient. Do not use it when real-foot path is unsupported.
   if(!audit.reachedTarget||audit.startSnapDistanceMeters>.25||
      audit.endSnapDistanceMeters>.22)continue;
   this.patrolIndex.set(id,index%candidates.length);
   out.copy(goal);this.realGoalRequests++;return true;
  }
  this.heldRequests++;return false;
 }

 prepare(frame:number):void{
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
    if(bot.mobilityState==='GROUND'&&bot.agent&&frame%18===1)
     bot.agent.requestMoveTarget(this.nav.closestPoint(
      new Vec3(...this.routeFor(bot.id).sourceGoal)));
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
   if(this.freeCombat&&bot.mobilityState==='GROUND'&&step<.18)
    this.travelMeters+=step;
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
   const corridorClear=sameSide.every(r=>
    Math.hypot(bot.position.x-r.originalLanding[0],
      bot.position.z-r.originalLanding[2])>1.55||
    Math.abs(bot.position.y-r.originalLanding[1])>1.05);
   if(corridorClear&&Math.hypot(
      bot.position.x-route.originalLanding[0],
      bot.position.z-route.originalLanding[2])>1.7)
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
   sourcePatrol:{auditedTargets:this.auditedTargets,
    realGoalRequests:this.realGoalRequests,
    heldRequests:this.heldRequests,
    travelMeters:this.travelMeters,
    attemptsToCrossUnboundUnderpass:0,sourceOnly:true,
    productionAuthorized:false},
   originalSourceLinksUsed:this.routePlan.distinctFirstDropLinks,
   physicalFootRelocations:0,productionAuthorized:false
  };
 }
}
