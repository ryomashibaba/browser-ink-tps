/**
 * T21 F3 source-only post-GameplayInk truth, not hit registration or Turf
 * scoring. B23 bullet Impact/WallImpact and B39 human Bomb rasterization
 * are deliberately independent counters: a fired shot, launched bomb,
 * exploded mesh or GPU splat is not automatically changed authoritative ink.
 */
import {PaintEventType,PaintSource,type PaintEvent} from '../ink/types';

export type F3BombOutcome='NEW_CELLS'|'STAMP_ZERO_CHANGE'|'NO_CERTIFIED_STAMP'|'MULTIPLE_UNRESOLVED';
export interface F3HumanInkContact {
 source:'REAL_HUMAN_ORIGINAL_PAINT_EVENT';
 originalSourceOnly:true;
 scoreablePromotionCount:0;
 humanChangedImpactCount:number;
 humanChangedCells:number;
 lastPaintedSurface:string|null;
 lastImpactChangedCells:number;
 lastImpactTick:number|null;
 showPaintConfirmation:boolean;
 elapsedTicks:number|null;
 // Actual HUMAN Bomb events on certified source surfaces only. Unlike
 // B25 practice, B39 never credits a bomb toward projectile-impact goals.
 humanBombStampEvents:number;
 humanBombZeroChangedEvents:number;
 lastBombStampedSurface:string|null;
 lastBombStampTick:number|null;
 humanBombChangedEvents:number;
 humanBombChangedCells:number;
 lastBombPaintedSurface:string|null;
 lastBombChangedCells:number;
 lastBombTick:number|null;
 showBombConfirmation:boolean;
 bombElapsedTicks:number|null;
 humanBombExplosionsObserved:number;
 lastBombOutcome:F3BombOutcome|null;
 lastBombOutcomeTick:number|null;
 lastBombOutcomeStamps:number;
 lastBombOutcomeChangedCells:number;
 showBombOutcome:boolean;
 bombOutcomeElapsedTicks:number|null;
}

export class UndertowF3SourceInkFeedback {
 private count=0;
 private cells=0;
 private lastSurface:string|null=null;
 private lastCells=0;
 private lastTick:number|null=null;
 private bombStamps=0;
 private bombZeroEvents=0;
 private lastBombStampedSurface:string|null=null;
 private lastBombStampTick:number|null=null;
 private bombEvents=0;
 private bombCells=0;
 private lastBombSurface:string|null=null;
 private lastBombCells=0;
 private lastBombTick:number|null=null;
 private explosionCount=0;
 private lastOutcome:F3BombOutcome|null=null;
 private lastOutcomeTick:number|null=null;
 private lastOutcomeStamps=0;
 private lastOutcomeCells=0;
 private readonly confirmationDurationTicks=27; // 0.45s at physical 60Hz

 public accept(event:PaintEvent,changedCells:number){
  if(event.source!==PaintSource.Human||
     !Number.isSafeInteger(changedCells)||changedCells<0)return;
  if(event.type===PaintEventType.Bomb){
   // Count requests separately from actual changed cells, and keep a
   // zero-change stamp from producing visual success feedback.
   this.bombStamps++;
   // A stamp on a source paintable is real even when all owned cells
   // already have this team; it is never proof of a new ink change.
   this.lastBombStampedSurface=event.surfaceId;
   this.lastBombStampTick=event.tick;
   if(changedCells===0){this.bombZeroEvents++;return;}
   if(this.lastBombTick===event.tick)this.lastBombCells+=changedCells;
   else this.lastBombCells=changedCells;
   this.lastBombTick=event.tick;
   this.lastBombSurface=event.surfaceId;
   this.bombEvents++;
   this.bombCells+=changedCells;
   return;
  }
  if((event.type!==PaintEventType.Impact&&
      event.type!==PaintEventType.WallImpact)||changedCells<=0)return;
  if(this.lastTick===event.tick)this.lastCells+=changedCells;
  else this.lastCells=changedCells;
  this.lastTick=event.tick;
  this.lastSurface=event.surfaceId;
  this.count++;
  this.cells+=changedCells;
 }
 /** Called after actual human SubWeaponSystem explosion and same fixed-tick
  * authoritative PaintCoordinator raster; zero stamp is NOT proof of a miss.
  */
 public observeExplosion(tick:number,total:number,oldStamps:number,oldCells:number){
  if(![tick,total,oldStamps,oldCells].every(Number.isSafeInteger)||
     tick<0||total<this.explosionCount||oldStamps<0||oldCells<0||
     oldStamps>this.bombStamps||oldCells>this.bombCells)return;
  const count=total-this.explosionCount;
  this.explosionCount=total;
  if(count===0)return;
  const stamps=this.bombStamps-oldStamps;
  const cells=this.bombCells-oldCells;
  this.lastOutcome=count>1?'MULTIPLE_UNRESOLVED':
   stamps===0?'NO_CERTIFIED_STAMP':
   cells===0?'STAMP_ZERO_CHANGE':'NEW_CELLS';
  this.lastOutcomeTick=tick;
  this.lastOutcomeStamps=stamps;
  this.lastOutcomeCells=cells;
 }
 public snapshot(currentTick:number):F3HumanInkContact{
  const elapsed=this.lastTick===null?null:currentTick-this.lastTick;
  const visible=elapsed!==null&&elapsed>=0&&elapsed<=this.confirmationDurationTicks;
  const bombElapsed=this.lastBombTick===null?null:currentTick-this.lastBombTick;
  const bombVisible=bombElapsed!==null&&bombElapsed>=0&&
   bombElapsed<=this.confirmationDurationTicks;
  const outcomeElapsed=this.lastOutcomeTick===null?null:currentTick-this.lastOutcomeTick;
  const outcomeVisible=outcomeElapsed!==null&&outcomeElapsed>=0&&
   outcomeElapsed<=this.confirmationDurationTicks;
  return {
   source:'REAL_HUMAN_ORIGINAL_PAINT_EVENT',
   originalSourceOnly:true,scoreablePromotionCount:0,
   humanChangedImpactCount:this.count,
   humanChangedCells:this.cells,
   lastPaintedSurface:this.lastSurface,
   lastImpactChangedCells:this.lastCells,
   lastImpactTick:this.lastTick,
   showPaintConfirmation:visible,
   elapsedTicks:elapsed,
   humanBombStampEvents:this.bombStamps,
   humanBombZeroChangedEvents:this.bombZeroEvents,
   lastBombStampedSurface:this.lastBombStampedSurface,
   lastBombStampTick:this.lastBombStampTick,
   humanBombChangedEvents:this.bombEvents,
   humanBombChangedCells:this.bombCells,
   lastBombPaintedSurface:this.lastBombSurface,
   lastBombChangedCells:this.lastBombCells,
   lastBombTick:this.lastBombTick,
   showBombConfirmation:bombVisible,
   bombElapsedTicks:bombElapsed,
   humanBombExplosionsObserved:this.explosionCount,
   lastBombOutcome:this.lastOutcome,
   lastBombOutcomeTick:this.lastOutcomeTick,
   lastBombOutcomeStamps:this.lastOutcomeStamps,
   lastBombOutcomeChangedCells:this.lastOutcomeCells,
   showBombOutcome:outcomeVisible,
   bombOutcomeElapsedTicks:outcomeElapsed
  };
 }
}
