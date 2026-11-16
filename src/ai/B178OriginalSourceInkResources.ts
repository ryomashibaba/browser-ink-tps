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


/** Bound an already native-authorized CPU Crowd step to the same
 * physically registered enemy-ink speed used by real Recast steering.
 * Steep original ramps cannot bypass the slow rate by |dy| > .11m.
 * The actual SOURCE Rapier KCC retains independent final authority. */
export function b178BoundOriginalCpuPhysicalStep(
 from:Readonly<{x:number;y:number;z:number}>,
 proposed:Readonly<{x:number;y:number;z:number}>,
 dt:number,normalMaxSpeed:number,registeredSourceSpeed?:number
):{x:number;y:number;z:number}{
 const dx=proposed.x-from.x,dy=proposed.y-from.y,
  dz=proposed.z-from.z;
 const distance=Math.hypot(dx,dy,dz);
 const enemySlow=registeredSourceSpeed!==undefined&&
  Number.isFinite(registeredSourceSpeed)&&registeredSourceSpeed>0&&
  registeredSourceSpeed<normalMaxSpeed;
 const limit=(enemySlow?registeredSourceSpeed!:normalMaxSpeed)*dt;
 // The old F2 non-enemy path keeps its exact .11m vertical exception.
 if(distance>limit+1e-5&&(enemySlow||Math.abs(dy)<=.11)){
  const fraction=limit/distance;
  return {x:from.x+dx*fraction,
   y:from.y+dy*fraction,z:from.z+dz*fraction};
 }
 return {x:proposed.x,y:proposed.y,z:proposed.z};
}
