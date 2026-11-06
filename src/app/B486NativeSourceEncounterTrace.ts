/** B486 — genuine same-world 60 Hz human/ally/opponent distances.
 * All feet originate from original native Rapier/KCC and seven actual
 * CpuAgentSystem bodies. Distances NEVER certify a Recast crossing,
 * weapon reach, clear line-of-sight, HP damage, or contact.
 * No actor, NavMesh, source geometry, ink, score or clock writes.
 */
export type B486Foot=readonly [number,number,number];
export type B486Cpu=Readonly<{
 id:string;team:'A'|'B';foot:B486Foot;active:boolean;
 grounded:boolean;physicallyRejoined:boolean;
}>;
export interface B486Frame{
 tick:number;source:readonly number[];humanFoot:B486Foot;
 humanAliveGrounded:boolean;cpu:readonly B486Cpu[];
}
export interface B486DistanceRow{
 readonly tick:number;
 readonly humanToNearestEnemyMeters:number;
 readonly closestEnemyId:string;
 readonly closestAllyToEnemyMeters:number;
 readonly closestAllyId:string;
 readonly closestOppositeCpuId:string;
}
const ORIGINAL_IDS=['A1','A2','A3','B1','B2','B3','B4'] as const;
const d=(a:B486Foot,b:B486Foot)=>Math.hypot(
 a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function b486TrueOriginalFrameDistances(
 v:B486Frame
):B486DistanceRow|null{
 if(v.source.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(v.tick)||v.tick<0||
    !v.humanAliveGrounded||!v.humanFoot.every(Number.isFinite)||
    v.cpu.length!==7)return null;
 for(let i=0;i<ORIGINAL_IDS.length;i++){
  const c=v.cpu[i];
  if(!c||c.id!==ORIGINAL_IDS[i]||
     c.team!==(i<3?'A':'B')||!c.active||!c.grounded||
     !c.physicallyRejoined||!c.foot.every(Number.isFinite))return null;
 }
 const a=v.cpu.slice(0,3),b=v.cpu.slice(3,7);
 let enemy='B1',enemyDistance=Infinity;
 for(const x of b){
  const distance=d(v.humanFoot,x.foot);
  if(distance<enemyDistance){enemyDistance=distance;enemy=x.id;}
 }
 let allyId='A1',otherId='B1',cpuDistance=Infinity;
 for(const x of a)for(const y of b){
  const distance=d(x.foot,y.foot);
  if(distance<cpuDistance){
   cpuDistance=distance;allyId=x.id;otherId=y.id;
  }
 }
 return {tick:v.tick,humanToNearestEnemyMeters:enemyDistance,
  closestEnemyId:enemy,closestAllyToEnemyMeters:cpuDistance,
  closestAllyId:allyId,closestOppositeCpuId:otherId};
}
export class B486NativeSourceEncounterTrace{
 private readonly rows:B486DistanceRow[]=[];
 private lastTick=-1;
 private closestHuman=Infinity;private closestCpu=Infinity;
 private human3mSamples=0;private cpu3mSamples=0;
 record(frame:B486Frame):void{
  const r=b486TrueOriginalFrameDistances(frame);
  if(!r||r.tick<=this.lastTick)return;
  this.lastTick=r.tick;
  this.closestHuman=Math.min(this.closestHuman,
   r.humanToNearestEnemyMeters);
  this.closestCpu=Math.min(this.closestCpu,
   r.closestAllyToEnemyMeters);
  if(r.humanToNearestEnemyMeters<=3)this.human3mSamples++;
  if(r.closestAllyToEnemyMeters<=3)this.cpu3mSamples++;
  if(this.rows.length<1000)this.rows.push(r);
 }
 summary(){
  if(!this.rows.length)return null;
  return {
   schema:'B486_TRUE_ORIGINAL_NATIVE_60HZ_ENCOUNTER_DISTANCE_V1' as const,
   source:'25/17/26/0' as const,
   firstNativeTick:this.rows[0]!.tick,
   lastNativeTick:this.lastTick,rows:this.rows.length,
   nearestHumanToEnemy3dMeters:this.closestHuman,
   nearestAllyToEnemy3dMeters:this.closestCpu,
   actualHumanEnemyWithin3mSamples:this.human3mSamples,
   actualCpuEnemyWithin3mSamples:this.cpu3mSamples,
   lastNativeDistances:this.rows[this.rows.length-1],
   physicallyCloseIsNotAHit:true as const,
   physicallyCloseIsNotANativeRoute:true as const,
   actualEnemyHpDamageCertified:false as const,
   naturalOpponentRouteCertified:false as const,
   noActorNavInkPhysicsClockWrites:true as const,
   scoreableOriginalSurfaces:0 as const,
   officialWinner:'NONE' as const
  };
 }
 snapshot(){const s=this.summary();return s?{...s,rows60Hz:this.rows}:null;}
}
