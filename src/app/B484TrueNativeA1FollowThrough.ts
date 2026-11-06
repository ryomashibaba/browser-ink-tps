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
 observe(x:B484NativeInput):void{
  if(!Number.isSafeInteger(x.tick)||x.tick<=this.lastTick||
   x.tick<0||x.keyRequests<1||!x.rejoined||x.mode!=='GROUND'||
   !x.foot.every(Number.isFinite)||
   (x.existingB471Goal!==null&&
    (!x.existingB471Goal.every(Number.isFinite)||
     x.existingB471Goal[2]<33))||
   ![x.keyRequests,x.approvedGoals,x.nativeGoalRequests,
     x.verifiedArrivals].every(n=>Number.isSafeInteger(n)&&n>=0)||
   x.verifiedArrivals>x.approvedGoals)return;
  const foot=[...x.foot] as [number,number,number];
  if(x.existingB471Goal)
   this.goal=[...x.existingB471Goal] as [number,number,number];
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
