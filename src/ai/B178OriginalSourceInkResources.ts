/** B178: only genuine GameplayInkSystem source Paintable ownership under
 * a real CPU foot. No made-up score, actors, collision, or time ticks. */
import {SurfaceFlags,Team} from '../ink/types';
import type {GameplayInkSystem,GameplayInkSample} from '../ink/GameplayInkSystem';
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

/** Resolve ownership at the original Rapier support, before choosing a
 * surface. Elevated foot probes shift UV on ramps and can select an
 * unrelated overlapping slab. Missing support never falls back to proximity. */
export function b178SampleRegisteredSourceFoot(
 ink:GameplayInkSystem,
 paint:readonly {id:string;backingSolidId:string}[],
 support:{point:import('playcanvas').Vec3;solidId:string}|null
):GameplayInkSample|null{
 if(!support)return null;
 return ink.sampleWorld(support.point,.4,SurfaceFlags.Paintable,
  SurfaceFlags.Wall|SurfaceFlags.Scoreable,
  surface=>paint.some(p=>p.id===surface.id&&
   p.backingSolidId===support.solidId));
}
