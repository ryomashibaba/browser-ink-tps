/** B346 genuine original 3D projectile SOURCE read-only witness.
 * Only caller in real PlayCanvas ProjectileSystem records physics events.
 * Pure in-memory bounded evidence: NEVER produces a bullet, hit or ink. */
export type B346ShooterExitKind =
 'TTL'|'ORIGINAL_PAINTABLE'|'ORIGINAL_SOLID'|
 'REAL_CPU_HIT'|'REAL_PLAYER_HIT'|'QA_TARGET_HIT';
type V3=readonly [number,number,number];
export interface B346ShooterLaunch {
 kind:'LAUNCH';launchId:number;nativeTick:number;slotName:string;
 weaponId:string;worldPosition:V3;worldVelocity:V3;
 gravity:number;lifeSeconds:number;paintRadius:number;
 /** B349 observed genuine KCC grounded value at native 3D shot spawn. */
 nativeGroundedAtLaunch?:boolean;
}
export interface B346ShooterExit {
 kind:'EXIT';launchId:number;nativeTick:number;
 reason:B346ShooterExitKind;worldPosition:V3;originalPaintSurfaceId:string|null;
}
export type B346ShooterEvent=B346ShooterLaunch|B346ShooterExit;
export class B346NativeShooterWitness{
 private on=false;
 private tick=-1;
 private id=0;
 private launches=0;
 private exits=0;
 private dropped=0;
 private readonly rows:B346ShooterEvent[]=[];
 public enable(){this.on=true;}
 public reset(){
  this.tick=-1;this.id=0;this.launches=0;this.exits=0;
  this.dropped=0;this.rows.length=0;
 }
 public setNativeTick(tick:number){
  if(!this.on)return;
  if(!Number.isSafeInteger(tick)||tick<0||tick<this.tick)
   throw Error('B346_GENUINE_NATIVE_TICK_REQUIRED');
  this.tick=tick;
 }
 private record(e:B346ShooterEvent){
  this.rows.push(e);
  if(this.rows.length>256){this.rows.shift();this.dropped++;}
 }
 public launch(params:Omit<B346ShooterLaunch,'kind'|'launchId'|'nativeTick'>){
  if(!this.on)return undefined;
  if(this.tick<0)throw Error('B346_PHYSICS_TICK_NOT_OBSERVED');
  const launchId=++this.id;
  this.launches++;
  this.record({kind:'LAUNCH',launchId,nativeTick:this.tick,...params});
  return launchId;
 }
 public exit(launchId:number,params:Omit<B346ShooterExit,'kind'|'launchId'|'nativeTick'>){
  if(!this.on)return;
  if(this.tick<0||!Number.isSafeInteger(launchId)||launchId<1||launchId>this.id)
   throw Error('B346_UNTRUSTED_NATIVE_EXIT');
  this.exits++;
  this.record({kind:'EXIT',launchId,nativeTick:this.tick,...params});
 }
 public snapshot(){
  return {enabled:this.on,observedNativeTick:this.tick,
   totalActualShooterLaunches:this.launches,totalActualShooterExits:this.exits,
   droppedOldestEvents:this.dropped,events:this.rows.map(e=>
    e.kind==='LAUNCH'?{...e,worldPosition:[...e.worldPosition],
     worldVelocity:[...e.worldVelocity]}:{...e,worldPosition:[...e.worldPosition]}),
   genuinePlayCanvasProjectileSlotsOnly:true as const,
   noSyntheticProjectilesOrCollision:true as const,
   noPaintOrActorInjection:true as const,
   source:'25/17/26/0' as const,scoreablePromotions:0 as const,
   productionAuthorized:false as const};
 }
}
