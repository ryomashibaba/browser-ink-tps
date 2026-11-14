/** B154 explicit source-lab-only coordination mode.
 * Combines independent B64 7CPU ink aim and B150 original A1 ally ink.
 * Never changes normal preview or any production application route. */
export function b154OriginalTeamInkOptIn(params:URLSearchParams):boolean{
 return params.get('t21Play')==='preview'&&
  params.get('t21QaDrive')==='source'&&
  params.get('t21W10B137')==='allyRally'&&
  params.get('t21W10B150')==='allyInk'&&
  params.get('t21W10B154')==='teamCoverage';
}


/** Attribute the REAL original-source CPU ink raster, never a requested shot.
 * No extra collision, ink, actor or scoring permission is introduced. */
import type {PaintApplyResult} from '../ink/GameplayInkSystem';
import {PaintEventType,PaintSource,type PaintEvent} from '../ink/types';

export type B154OriginalCpuImpactOutcome =
 'CHANGED'|'ALREADY_TEAM_OWNED'|'NO_ELIGIBLE_CELLS'|'OTHER_ZERO_CHANGE';
export function b154OriginalCpuImpactRasterOutcome(
 event:Pick<PaintEvent,'actorId'|'source'|'surfaceId'|'type'>,
 actual:Pick<PaintApplyResult,
  'changedCells'|'rasterEligibleCells'|'rasterAlreadyTeamOwnedCells'>
):B154OriginalCpuImpactOutcome|null{
 if(event.source!==PaintSource.Cpu||
    !['A1','A2','A3','B1','B2','B3','B4'].includes(event.actorId??'')||
    !event.surfaceId.startsWith('UndertowT21D:')||
    (event.type!==PaintEventType.Impact&&
     event.type!==PaintEventType.WallImpact)||
    ![actual.changedCells,actual.rasterEligibleCells,
      actual.rasterAlreadyTeamOwnedCells].every(v=>
       Number.isSafeInteger(v)&&v>=0))return null;
 if(actual.changedCells>0)return 'CHANGED';
 if(actual.rasterEligibleCells===0)return 'NO_ELIGIBLE_CELLS';
 if(actual.rasterAlreadyTeamOwnedCells>=actual.rasterEligibleCells)
  return 'ALREADY_TEAM_OWNED';
 return 'OTHER_ZERO_CHANGE';
}
