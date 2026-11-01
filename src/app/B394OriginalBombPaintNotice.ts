/**
 * B394: human bomb original-PaintSurface ink outcome from the existing
 * authoritative post-PaintCoordinator B41 observer, not explosion visuals.
 */
import type {F3HumanInkContact,F3BombOutcome}
 from './UndertowF3SourceInkFeedback';
export interface B394BombFrame{
 trustedSource:boolean;playerView:boolean;subEnabled:boolean;
 tick:number;phase:string;paused:boolean;stopReason:string|null;
 hp:number;humanExplosions:number;ink:Partial<F3HumanInkContact>|null;
}
export interface B394BombCue{
 kind:F3BombOutcome;text:string;tick:number;
 explosions:number;stamps:number;changedCells:number;
 gameplayWrites:0;scoreable:0;cpuHitCertified:false;
}
export class B394OriginalBombPaintNotice{
 private previous:{tick:number;explosions:number}|null=null;
 private cue:B394BombCue|null=null;
 private until=-1;
 private clear(){this.previous=null;this.cue=null;this.until=-1}
 public observe(f:B394BombFrame):B394BombCue|null{
  const x=f.ink;
  if(!f.trustedSource||!f.playerView||!f.subEnabled||
   f.phase!=='PLAYING'||f.paused||!!f.stopReason||
   !Number.isSafeInteger(f.tick)||f.tick<0||
   !Number.isFinite(f.hp)||f.hp<=0||
   !Number.isSafeInteger(f.humanExplosions)||f.humanExplosions<0||
   x?.source!=='REAL_HUMAN_ORIGINAL_PAINT_EVENT'||
   x.originalSourceOnly!==true||x.scoreablePromotionCount!==0||
   !Number.isSafeInteger(x.humanBombExplosionsObserved)||
   x.humanBombExplosionsObserved!==f.humanExplosions){
   this.clear();return null;
  }
  const prev=this.previous;
  if(prev&&(f.tick<prev.tick||f.humanExplosions<prev.explosions)){
   this.clear();
   this.previous={tick:f.tick,explosions:f.humanExplosions};
   return null;
  }
  if(prev&&f.humanExplosions>prev.explosions){
   const kind=x.lastBombOutcome,stamps=x.lastBombOutcomeStamps,
    cells=x.lastBombOutcomeChangedCells;
   this.cue=null;this.until=-1;
   if(x.lastBombOutcomeTick===f.tick&&kind&&
    Number.isSafeInteger(stamps)&&stamps!==undefined&&stamps>=0&&
    Number.isSafeInteger(cells)&&cells!==undefined&&cells>=0){
    let text:string|null=null;
    if(kind==='NEW_CELLS'&&stamps>0&&cells>0)
     text='BOMB PAINT · +'+cells+' REAL SOURCE CELLS · NOT TURF SCORE';
    else if(kind==='STAMP_ZERO_CHANGE'&&stamps>0&&cells===0)
     text='BOMB SOURCE STAMP · 0 NEW CELLS · NOT A MISS';
    else if(kind==='NO_CERTIFIED_STAMP'&&stamps===0&&cells===0)
     text='BOMB BURST · NO REGISTERED SOURCE STAMP';
    else if(kind==='MULTIPLE_UNRESOLVED'&&
      f.humanExplosions-prev.explosions>1)
     text='BOMBS BURST · INDIVIDUAL PAINT UNKNOWN';
    if(text){
     this.cue={kind,text,tick:f.tick,explosions:f.humanExplosions,
      stamps,changedCells:cells,gameplayWrites:0,scoreable:0,
      cpuHitCertified:false};
     this.until=f.tick+120;
    }
   }
  }
  this.previous={tick:f.tick,explosions:f.humanExplosions};
  return f.tick<=this.until?this.cue:null;
 }
}
