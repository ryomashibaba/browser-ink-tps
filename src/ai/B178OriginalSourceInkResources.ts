/** B178: only genuine GameplayInkSystem source Paintable ownership under
 * a real CPU foot. No made-up score, actors, collision, or time ticks. */
import {SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSample} from '../ink/GameplayInkSystem';
export type B178InkFootRelation='OWN'|'ENEMY'|'NEUTRAL';
export function b178FootMask(sourceLabOptIn:boolean):SurfaceFlags{
 return sourceLabOptIn?SurfaceFlags.Paintable:SurfaceFlags.Scoreable;
}
export function b178FootRelation(
 sample:Pick<GameplayInkSample,'owner'|'surface'>|null,
 botTeam:Team.A|Team.B,sourceLabOptIn:boolean
):B178InkFootRelation{
 if(!sample)return 'NEUTRAL';
 if(sourceLabOptIn&&
    (sample.surface.isScoreable||
     (sample.surface.baseFlags & SurfaceFlags.Paintable)===0||
     (sample.surface.baseFlags & SurfaceFlags.Wall)!==0))
  throw Error('B178_UNTRUSTED_SCOREABLE_OR_NONPAINTABLE_SOURCE_FOOT');
 if(sample.owner===Team.Neutral)return 'NEUTRAL';
 return sample.owner===botTeam?'OWN':'ENEMY';
}
