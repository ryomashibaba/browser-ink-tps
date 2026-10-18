/**
 * W10-B23 source-only VISUAL confirmation of real human projectile ink.
 * This is not a hit marker for an enemy, a combat kill, or Turf score.
 * Never infer paint from trigger pulls or CPU paint requests: only a
 * HUMAN paint IMPACT whose actual GameplayInkSystem result changed cells.
 */
import {PaintEventType,PaintSource,type PaintEvent} from '../ink/types';

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
}

export class UndertowF3SourceInkFeedback {
 private count=0;
 private cells=0;
 private lastSurface:string|null=null;
 private lastCells=0;
 private lastTick:number|null=null;
 private readonly confirmationDurationTicks=27; // 0.45s at physical 60Hz

 public accept(event:PaintEvent,changedCells:number){
  if(event.source!==PaintSource.Human||
     (event.type!==PaintEventType.Impact&&event.type!==PaintEventType.WallImpact)||
     !Number.isSafeInteger(changedCells)||changedCells<=0)
   return;
  // Several legitimate impacts processed on the same fixed tick
  // are reported together, not mistaken for a single hit or a score.
  if(this.lastTick===event.tick)this.lastCells+=changedCells;
  else this.lastCells=changedCells;
  this.lastTick=event.tick;
  this.lastSurface=event.surfaceId;
  this.count++;
  this.cells+=changedCells;
 }
 public snapshot(currentTick:number):F3HumanInkContact{
  const elapsed=this.lastTick===null?null:currentTick-this.lastTick;
  const visible=elapsed!==null&&elapsed>=0&&elapsed<=this.confirmationDurationTicks;
  return {
   source:'REAL_HUMAN_ORIGINAL_PAINT_EVENT',
   originalSourceOnly:true,scoreablePromotionCount:0,
   humanChangedImpactCount:this.count,
   humanChangedCells:this.cells,
   lastPaintedSurface:this.lastSurface,
   lastImpactChangedCells:this.lastCells,
   lastImpactTick:this.lastTick,
   showPaintConfirmation:visible,
   elapsedTicks:elapsed
  };
 }
}
