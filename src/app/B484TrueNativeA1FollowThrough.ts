/** B484: 60Hz genuine B471 user-ordered A1 physical follow-through.
 * Read-only: no new target, collision, actor teleport, score or clock. */
export type B484Foot=readonly [number,number,number];
export type B484Status='OFF'|'REQUESTED'|'MOVING'|'ARRIVED'|'HOLD'|'EXPIRED';
export interface B484NativeInput{
 tick:number;foot:B484Foot;mode:string;rejoined:boolean;
 originalSolidId:string|null;existingB471Goal:B484Foot|null;
 keyRequests:number;approvedGoals:number;nativeGoalRequests:number;
 verifiedArrivals:number;status:B484Status;
}
export class B484TrueNativeA1FollowThrough{
 private readonly rows:Array<{
  tick:number;foot:B484Foot;sourceSolidId:string|null;
  distanceXZ:number|null;orderStatus:B484Status;
 }>=[];
 private firstFoot:B484Foot|null=null;
 private lastFoot:B484Foot|null=null;
 private goal:B484Foot|null=null;
 private shortest:number|null=null;
 private footMeters=0;
 private lastTick=-1;
 private keys=0;private approvals=0;private requests=0;
 private arrivals=0;private status:B484Status='OFF';
 private supported=0;private unsupported=0;
 // Per-C-key observation remains independent of lifetime physical history.
 // A second genuine order must not inherit the first order's closest foot.
 private currentOrderFirstFoot:B484Foot|null=null;
 private currentOrderLastFoot:B484Foot|null=null;
 private currentOrderGoal:B484Foot|null=null;
 private currentOrderInitialGoalDistanceXZ:number|null=null;
 private currentOrderClosestGoalDistanceXZ:number|null=null;
 private currentOrderTravelMeters=0;
 private currentOrderRows=0;
 observe(x:B484NativeInput):void{
  if(!Number.isSafeInteger(x.tick)||x.tick<=this.lastTick||
   x.tick<0||x.keyRequests<1||!x.rejoined||x.mode!=='GROUND'||
   !x.foot.every(Number.isFinite)||
   (x.existingB471Goal!==null&&
    (!x.existingB471Goal.every(Number.isFinite)||
     x.existingB471Goal[2]<33))||
   ![x.keyRequests,x.approvedGoals,x.nativeGoalRequests,
     x.verifiedArrivals].every(n=>Number.isSafeInteger(n)&&n>=0)||
   x.verifiedArrivals>x.approvedGoals||
   x.keyRequests<this.keys||x.approvedGoals<this.approvals||
   x.nativeGoalRequests<this.requests||
   x.verifiedArrivals<this.arrivals)return;
  const foot=[...x.foot] as [number,number,number];
  if(x.keyRequests!==this.keys){
   // The request itself is real, but an original goal may be pending/HOLD.
   this.currentOrderFirstFoot=foot;
   this.currentOrderLastFoot=null;
   this.currentOrderGoal=null;
   this.currentOrderInitialGoalDistanceXZ=null;
   this.currentOrderClosestGoalDistanceXZ=null;
   this.currentOrderTravelMeters=0;
   this.currentOrderRows=0;
  }
  if(x.existingB471Goal){
   const approvedGoal=[...x.existingB471Goal] as [number,number,number];
   if(this.currentOrderGoal===null){
    this.currentOrderGoal=approvedGoal;
    this.currentOrderInitialGoalDistanceXZ=Math.hypot(
     foot[0]-approvedGoal[0],foot[2]-approvedGoal[2]);
   }else if(Math.hypot(this.currentOrderGoal[0]-approvedGoal[0],
     this.currentOrderGoal[1]-approvedGoal[1],
     this.currentOrderGoal[2]-approvedGoal[2])>.0001){
    // An unrecorded goal replacement cannot be the same genuine order.
    return;
   }
   this.goal=approvedGoal;
  }
  const currentDist=this.currentOrderGoal?Math.hypot(
   foot[0]-this.currentOrderGoal[0],
   foot[2]-this.currentOrderGoal[2]):null;
  if(currentDist!==null)this.currentOrderClosestGoalDistanceXZ=
   this.currentOrderClosestGoalDistanceXZ===null?currentDist:
   Math.min(this.currentOrderClosestGoalDistanceXZ,currentDist);
  if(this.currentOrderLastFoot)this.currentOrderTravelMeters+=Math.hypot(
   foot[0]-this.currentOrderLastFoot[0],
   foot[1]-this.currentOrderLastFoot[1],
   foot[2]-this.currentOrderLastFoot[2]);
  this.currentOrderFirstFoot??=foot;
  this.currentOrderLastFoot=foot;
  this.currentOrderRows++;
  const dist=this.goal?
   Math.hypot(foot[0]-this.goal[0],foot[2]-this.goal[2]):null;
  if(dist!==null)
   this.shortest=this.shortest===null?dist:Math.min(this.shortest,dist);
  if(this.lastFoot){
   const previous=this.lastFoot;
   this.footMeters+=Math.hypot(foot[0]-previous[0],
    foot[1]-previous[1],foot[2]-previous[2]);
  }
  this.firstFoot??=foot;this.lastFoot=foot;this.lastTick=x.tick;
  this.keys=x.keyRequests;this.approvals=x.approvedGoals;
  this.requests=x.nativeGoalRequests;this.arrivals=x.verifiedArrivals;
  this.status=x.status;
  if(x.originalSolidId?.startsWith('UndertowT21D:'))this.supported++;
  else this.unsupported++;
  if(this.rows.length<1000)this.rows.push({
   tick:x.tick,foot,sourceSolidId:x.originalSolidId,
   distanceXZ:dist,orderStatus:x.status
  });
 }
 summary(){
  if(!this.rows.length)return null;
  const f=this.firstFoot!,l=this.lastFoot!,g=this.goal;
  return {schema:'B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1' as const,
   source:'25/17/26/0' as const,firstTick:this.rows[0]!.tick,
   lastTick:this.lastTick,nativeRows:this.rows.length,
   genuineKeyRequests:this.keys,approvedOriginalGoals:this.approvals,
   actualNativeGoalRequests:this.requests,
   originalB471VerifiedArrivals:this.arrivals,
   firstPhysicalFoot:f,lastPhysicalFoot:l,
   originalApprovedGoal:g,
   currentOrderKeyRequest:this.keys,
   currentOrderNativeRows:this.currentOrderRows,
   currentOrderFirstObservedFoot:this.currentOrderFirstFoot,
   currentOrderApprovedOriginalGoal:this.currentOrderGoal,
   currentOrderInitialGoalDistanceXZ:this.currentOrderInitialGoalDistanceXZ,
   currentOrderClosestPhysicalGoalDistanceXZ:this.currentOrderClosestGoalDistanceXZ,
   currentOrderLastPhysicalGoalDistanceXZ:this.currentOrderGoal?
    Math.hypot(l[0]-this.currentOrderGoal[0],
     l[2]-this.currentOrderGoal[2]):null,
   currentOrderObservedFootTravelMeters:this.currentOrderTravelMeters,
   currentOrderArrivalOnlyFromOriginalB471:true as const,
   initialGoalDistanceXZ:g?Math.hypot(f[0]-g[0],f[2]-g[2]):null,
   closestPhysicalGoalDistanceXZ:this.shortest,
   lastPhysicalGoalDistanceXZ:g?Math.hypot(l[0]-g[0],l[2]-g[2]):null,
   observedFootTravelMeters:this.footMeters,
   originalFloorHitSamples:this.supported,
   missingOriginalFloorHitSamples:this.unsupported,
   finalCommandStatus:this.status,
   commandCausedAllMovementCertified:false as const,
   trueArrivalOnlyFromB471:true as const,
   crossTeamRouteCertified:false as const,
   originalCapsuleRouteCertified:false as const,
   scoreable:0 as const,officialWinner:'NONE' as const,
   actorInkPhysicsClockWrites:0 as const};
 }
 snapshot(){const s=this.summary();return s?{...s,
  rows:this.rows.map(r=>({...r,foot:[...r.foot]}))}:null;}
}
