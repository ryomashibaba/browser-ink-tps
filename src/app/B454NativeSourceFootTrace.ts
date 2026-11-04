/** B454 read-only 60Hz actual B2/B4 foot + genuine REGISTERED static Rapier ray.
 * This samples AFTER authentic CPU KCC; it never grants a Crowd route.
 * A static ray is not a capsule contact/manifold certificate. */
export type B454Cpu='B2'|'B4';
export interface B454SourceFoot{
 readonly tick:number;readonly id:B454Cpu;
 readonly foot:readonly [number,number,number];
 readonly mode:string;readonly life:string;readonly rejoined:boolean;
 readonly originalRapierSolidId:string|null;
 readonly originalRapierHitY:number|null;
 readonly registeredOriginalHit:boolean;
 readonly absFootToRapierY:number|null;
 readonly withinUnchanged025m:boolean;
 readonly sourceBRegion:boolean;
}
export interface B454Input{
 readonly tick:number;readonly id:B454Cpu;
 readonly foot:readonly [number,number,number];
 readonly mode:string;readonly life:string;readonly rejoined:boolean;
 readonly originalRapierSolidId:string|null;
 readonly originalRapierHitY:number|null;
 readonly registeredOriginalHit:boolean;
}
const finite=(n:number)=>Number.isFinite(n);
export class B454NativeSourceFootRecorder{
 private readonly rows:{B2:B454SourceFoot[];B4:B454SourceFoot[]}={B2:[],B4:[]};
 private readonly dropped:{B2:number;B4:number}={B2:0,B4:0};
 constructor(private readonly capacity=1200){
  if(!Number.isSafeInteger(capacity)||capacity<2)
   throw Error('B454_INVALID_SAMPLE_CAPACITY');
 }
 append(v:B454Input){
  if(!Number.isSafeInteger(v.tick)||v.tick<0||
   !['B2','B4'].includes(v.id)||v.foot.length!==3||
   !v.foot.every(finite)||
   (v.originalRapierHitY!==null&&!finite(v.originalRapierHitY))||
   (v.originalRapierSolidId!==null&&!v.originalRapierSolidId)||
   (v.originalRapierHitY===null)!==(v.originalRapierSolidId===null)||
   (v.registeredOriginalHit&&v.originalRapierSolidId===null))
   throw Error('B454_INVALID_REAL_NATIVE_SOURCE_OBSERVATION');
  const old=this.rows[v.id].at(-1);
  if(old&&v.tick<=old.tick)
   throw Error('B454_NONINCREASING_NATIVE_TICK');
  const y=v.originalRapierHitY;
  const gap=y===null?null:Math.abs(v.foot[1]-y);
  const row:B454SourceFoot={
   tick:v.tick,id:v.id,foot:[...v.foot],
   mode:v.mode,life:v.life,rejoined:v.rejoined,
   originalRapierSolidId:v.originalRapierSolidId,
   originalRapierHitY:y,registeredOriginalHit:v.registeredOriginalHit,
   absFootToRapierY:gap,
   withinUnchanged025m:v.registeredOriginalHit&&gap!==null&&gap<=.25,
   sourceBRegion:v.foot[2]<=-33
  };
  this.rows[v.id].push(row);
  if(this.rows[v.id].length>this.capacity){
   this.rows[v.id].shift();this.dropped[v.id]++;
  }
 }
 snapshot(){
  // Clone so neither CDP nor other diagnostics may mutate live traces.
  return {schema:'B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1' as const,
   source:'25/17/26/0' as const,
   rows:{B2:this.rows.B2.map(v=>({...v,foot:[...v.foot] as
    [number,number,number]})),
    B4:this.rows.B4.map(v=>({...v,foot:[...v.foot] as
    [number,number,number]}))},
   dropped:{...this.dropped},nativePhysicsFootSource:true as const,
   originalKccOrGameWrites:0 as const,
   originalPathAuthorizationChanged:false as const,
   continuousCapsuleContactCertified:false as const,
   b2b4FrontlineGoalCertified:false as const,
   originalWinner:'NONE' as const};
 }
}
