/** B152 diagnostics only. The origin label is not a substitute for
 * native shot, Rapier collision, PaintRequest, ink rasterization or scoring. */
import {PaintEventType,PaintSource,type PaintEvent} from '../ink/types';

/** Restrict A1 ally-support paint evidence to its tagged REAL weapon hit. */
export function isB152ExactAllySupportInkImpact(event:Pick<
 PaintEvent,'source'|'actorId'|'type'|'qaSourceAim'>):boolean{
 return event.source===PaintSource.Cpu&&event.actorId==='A1'&&
  event.qaSourceAim==='A1_ORIGINAL_ALLY_SUPPORT_INK'&&
  (event.type===PaintEventType.Impact||
   event.type===PaintEventType.WallImpact);
}
