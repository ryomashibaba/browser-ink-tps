/** B356 native human aim presentation: a shot is never a confirmed paint
 * impact and a paint impact is never a CPU HP hit. Zero gameplay writes. */
export interface B356RealPaintFrame{
 originalSourceOnly:boolean;scoreablePromotionCount:number;
 humanChangedImpactCount:number;humanChangedCells:number;
 lastImpactTick:number|null;lastImpactChangedCells:number;
}
export interface B356RealReticleFrame{
 enabled:boolean;playerView:boolean;nativeTick:number;
 originalStage:readonly number[];matchState:string;paused:boolean;
 stopReason:string|null;productionAuthorized:boolean;
 unrestricted4v4Certified?:boolean;
 playerHp:number;shotsFired:number;paint:B356RealPaintFrame|null;
}
export type B356ReticleCue={
 mode:'REAL_PAINT'|'ACTUAL_SHOT_ONLY';label:string;nativeTick:number;
 actualImpactTick:number|null;realHumanChangedCells:number;
 trueSourcePaintOnly:true;enemyHitCertified:false;
 physicsWrites:0;scoreable:0;
};
export class B356RealSourceReticle{
 private lastTick=-1;
 private lastShots=0;
 private lastPaintEvents=0;
 private shotUntil=-1;
 public observe(f:B356RealReticleFrame):B356ReticleCue|null{
  const p=f.paint;
  if(!f.enabled||!f.playerView||f.matchState!=='PLAYING'||
   f.paused||!!f.stopReason||f.productionAuthorized!==false||
   f.unrestricted4v4Certified!==false||
   f.originalStage.join(',')!=='25,17,26,0'||!p||
   p.originalSourceOnly!==true||p.scoreablePromotionCount!==0||
   !Number.isSafeInteger(f.nativeTick)||f.nativeTick<0||
   !Number.isSafeInteger(f.shotsFired)||f.shotsFired<0||
   !Number.isFinite(f.playerHp)||f.playerHp<=0||
   !Number.isSafeInteger(p.humanChangedImpactCount)||
   p.humanChangedImpactCount<0||
   !Number.isSafeInteger(p.humanChangedCells)||p.humanChangedCells<0||
   !Number.isSafeInteger(p.lastImpactChangedCells)||
   p.lastImpactChangedCells<0||
   (p.lastImpactTick!==null&&
    (!Number.isSafeInteger(p.lastImpactTick)||p.lastImpactTick<0||
     p.lastImpactTick>f.nativeTick))){
   this.lastTick=-1;this.shotUntil=-1;return null;
  }
  if(this.lastTick>=0&&(f.nativeTick<this.lastTick||
   f.shotsFired<this.lastShots||
   p.humanChangedImpactCount<this.lastPaintEvents)){
   this.lastTick=-1;this.shotUntil=-1;return null;
  }
  if(this.lastTick>=0&&f.shotsFired>this.lastShots)
   this.shotUntil=f.nativeTick+14;
  this.lastTick=f.nativeTick;
  this.lastShots=f.shotsFired;
  this.lastPaintEvents=p.humanChangedImpactCount;
  const impact=p.lastImpactTick;
  if(impact!==null&&p.humanChangedImpactCount>0&&
   p.lastImpactChangedCells>0&&f.nativeTick-impact<=27){
   return {mode:'REAL_PAINT',
    label:'REAL SOURCE INK +'+p.lastImpactChangedCells+
     ' · NOT CPU HIT',nativeTick:f.nativeTick,
    actualImpactTick:impact,realHumanChangedCells:p.lastImpactChangedCells,
    trueSourcePaintOnly:true,enemyHitCertified:false,
    physicsWrites:0,scoreable:0};
  }
  if(f.nativeTick<=this.shotUntil)
   return {mode:'ACTUAL_SHOT_ONLY',
    label:'SHOT FIRED · PAINT UNCONFIRMED',nativeTick:f.nativeTick,
    actualImpactTick:null,realHumanChangedCells:0,
    trueSourcePaintOnly:true,enemyHitCertified:false,
    physicsWrites:0,scoreable:0};
  return null;
 }
}
