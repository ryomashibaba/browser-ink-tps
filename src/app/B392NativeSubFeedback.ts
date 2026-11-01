/** B392 — player-facing events observed from the genuine native human
 * SubWeaponSystem counters. No collision, damage, paint, score or control writes.
 */
export interface B392NativeSubFrame {
 trustedSource:boolean;
 playerView:boolean;
 enabled:boolean;
 tick:number;
 matchState:string;
 paused:boolean;
 stopReason:string|null;
 hp:number;
 subName:string;
 throws:number;
 explosions:number;
}
export interface B392NativeSubCue {
 mode:'THROWN'|'DETONATED';
 text:string;
 tick:number;
 throws:number;
 explosions:number;
 gameplayWrites:0;
 scoreable:0;
 cpuHitCertified:false;
}
export class B392NativeSubFeedback {
 private previous:{tick:number;throws:number;explosions:number}|null=null;
 private last:B392NativeSubCue|null=null;
 private visibleThrough=-1;
 public observe(f:B392NativeSubFrame):B392NativeSubCue|null {
  if(!f.trustedSource||!f.playerView||!f.enabled||
     f.matchState!=='PLAYING'||f.paused||!!f.stopReason||
     !Number.isSafeInteger(f.tick)||f.tick<0||
     !Number.isFinite(f.hp)||f.hp<=0||
     !f.subName||f.subName.length>64||
     !Number.isSafeInteger(f.throws)||f.throws<0||
     !Number.isSafeInteger(f.explosions)||f.explosions<0||
     f.explosions>f.throws) {
   this.previous=null;this.last=null;this.visibleThrough=-1;
   return null;
  }
  const prior=this.previous;
  if(prior&&(f.tick<prior.tick||f.throws<prior.throws||
     f.explosions<prior.explosions)) {
   // Starting a new real round or broken provenance never emits an event.
   this.previous={tick:f.tick,throws:f.throws,explosions:f.explosions};
   this.last=null;this.visibleThrough=-1;
   return null;
  }
  if(prior&&(f.throws>prior.throws||f.explosions>prior.explosions)){
   const mode=f.explosions>prior.explosions?'DETONATED':'THROWN';
   this.last={
    mode,text:'REAL SUB '+mode+' · '+f.subName+' · NOT CPU HIT',
    tick:f.tick,throws:f.throws,explosions:f.explosions,
    gameplayWrites:0,scoreable:0,cpuHitCertified:false
   };
   this.visibleThrough=f.tick+90;
  }
  this.previous={tick:f.tick,throws:f.throws,explosions:f.explosions};
  return f.tick<=this.visibleThrough?this.last:null;
 }
}
