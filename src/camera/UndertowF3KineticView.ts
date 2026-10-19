/**
 * W10-B27: source-only, visually perceived movement pace.
 *
 * Driven by ACTUAL 60 Hz Rapier KCC actor-foot deltas on the frozen 25
 * original collision solids. No key-state speed inference, teleports,
 * theoretical NavMesh routes, locomotion writes, or stage mutation.
 * Only a bounded camera lens FOV is returned. The original 63-degree
 * camera and every production route remain the default.
 */
export const B27_SOURCE_BASE_FOV_DEGREES=63;
export const B27_SOURCE_MAX_FOV_DEGREES=69;
const MAX_NATIVE_GROUNDED_STEP_METERS=.36;
const BOOST_START_METERS_PER_SECOND=1.25;
const BOOST_FULL_METERS_PER_SECOND=7.5;
const FOV_RISE_SHARPNESS=6.5;
const FOV_FALL_SHARPNESS=12;

export interface SourceKineticFoot{
 tick:number;x:number;y:number;z:number;
 grounded:boolean;alive:boolean;sourceOriginalCollisionOnly:boolean;
}
export class UndertowF3KineticView {
 private lastFoot:SourceKineticFoot|null=null;
 private speedMetersPerSecond=0;
 private targetFov=B27_SOURCE_BASE_FOV_DEGREES;
 private visualFov=B27_SOURCE_BASE_FOV_DEGREES;
 private acceptedGroundedSteps=0;
 private ignoredUncertifiedSteps=0;
 private readonly sourceOnly=true;

 /** Call exactly once after an actual source physics tick. */
 sampleNativeFoot(f:SourceKineticFoot){
  const valid=Number.isSafeInteger(f.tick)&&f.tick>=0&&
   [f.x,f.y,f.z].every(Number.isFinite)&&
   f.grounded&&f.alive&&f.sourceOriginalCollisionOnly;
  if(!valid){
   this.invalidateNativeFoot();return;
  }
  const old=this.lastFoot;
  this.lastFoot={...f};
  if(!old||!old.grounded||!old.alive||!old.sourceOriginalCollisionOnly||
     f.tick!==old.tick+1){
   this.speedMetersPerSecond=0;
   this.targetFov=B27_SOURCE_BASE_FOV_DEGREES;
   this.ignoredUncertifiedSteps++;
   return;
  }
  const dx=f.x-old.x,dy=f.y-old.y,dz=f.z-old.z;
  const horizontal=Math.hypot(dx,dz);
  if(horizontal>MAX_NATIVE_GROUNDED_STEP_METERS||Math.abs(dy)>.30){
   this.speedMetersPerSecond=0;
   this.targetFov=B27_SOURCE_BASE_FOV_DEGREES;
   this.ignoredUncertifiedSteps++;
   return;
  }
  this.acceptedGroundedSteps++;
  this.speedMetersPerSecond=horizontal*60;
  const normalized=Math.max(0,Math.min(1,
   (this.speedMetersPerSecond-BOOST_START_METERS_PER_SECOND)/
   (BOOST_FULL_METERS_PER_SECOND-BOOST_START_METERS_PER_SECOND)));
  // Smoothstep avoids an abrupt shift in apparent view at walking speed.
  const t=normalized*normalized*(3-2*normalized);
  this.targetFov=B27_SOURCE_BASE_FOV_DEGREES+
   (B27_SOURCE_MAX_FOV_DEGREES-B27_SOURCE_BASE_FOV_DEGREES)*t;
 }
 /** Render interval, independent from fixed simulation ticks. */
 advanceVisual(realDeltaSeconds:number,pointerLocked:boolean,paused:boolean){
  if(!pointerLocked||paused)this.targetFov=B27_SOURCE_BASE_FOV_DEGREES;
  if(Number.isFinite(realDeltaSeconds)&&realDeltaSeconds>0){
   const dt=Math.min(realDeltaSeconds,.10);
   const sharpness=this.targetFov>this.visualFov?
    FOV_RISE_SHARPNESS:FOV_FALL_SHARPNESS;
   const alpha=1-Math.exp(-sharpness*dt);
   this.visualFov+=(this.targetFov-this.visualFov)*alpha;
  }
  this.visualFov=Math.max(B27_SOURCE_BASE_FOV_DEGREES,
   Math.min(B27_SOURCE_MAX_FOV_DEGREES,this.visualFov));
  return this.visualFov;
 }
 invalidateNativeFoot(){
  this.lastFoot=null;
  this.speedMetersPerSecond=0;
  this.targetFov=B27_SOURCE_BASE_FOV_DEGREES;
 }
 /** Real game pause/unlock restores fixed source lens without lag. */
 resetVisual(){
  this.invalidateNativeFoot();
  this.visualFov=B27_SOURCE_BASE_FOV_DEGREES;
 }
 snapshot(){
  return {
   sourceOnly:this.sourceOnly,
   input:'REAL_ORIGINAL_GROUNDED_RAPIER_ACTOR_FOOT_ONLY' as const,
   fieldOfViewDegrees:Number(this.visualFov.toFixed(3)),
   targetFovDegrees:Number(this.targetFov.toFixed(3)),
   nativeGroundSpeedMetersPerSecond:
    Number(this.speedMetersPerSecond.toFixed(3)),
   acceptedGroundedSteps:this.acceptedGroundedSteps,
   ignoredUncertifiedSteps:this.ignoredUncertifiedSteps,
   officialTurfScore:'UNAVAILABLE' as const,
   movementControllerModified:false as const,
   weaponAimAssistAdded:false as const,
   stageGeometryModified:false as const,
   runtimeCollisionNavOrPaintModified:false as const,
   productionAuthorized:false as const
  };
 }
}
