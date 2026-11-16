/** B150: source-only A1 ink aim proposals. This never moves actors,
 * creates terrain, authorizes scoreable turf, or proves actual paint.
 */
import type {Vec3} from 'playcanvas';
import type {GameplayInkSample} from '../ink/GameplayInkSystem';
import {Team} from '../ink/types';
import {b180OriginalSourcePatchOpportunity,
 b180OriginalSourceUnownedNeighborAim}
 from '../ai/B180OriginalSourcePaintOpportunity';

export type B150Foot=Readonly<{x:number;y:number;z:number}>;
export function eligibleB150OriginalAllyInk(x:{
 nativeTick:number;approvedTick:number;cpu:B150Foot;human:B150Foot;
 approvedGoal:B150Foot;approvedHuman:B150Foot;
}):boolean{
 const {cpu:a,human:h,approvedGoal:g,approvedHuman:old}=x;
 if(!Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    !Number.isSafeInteger(x.approvedTick)||x.approvedTick<0||
    x.approvedTick>x.nativeTick||x.nativeTick-x.approvedTick>60||
    [a,h,g,old].some(p=>![p.x,p.y,p.z].every(Number.isFinite)||
     p.z<33||p.y<2.7||p.y>5.25))return false;
 const distance=Math.hypot(a.x-h.x,a.z-h.z);
 return distance>=1.7&&distance<=2.45&&
  Math.abs(a.y-h.y)<=.30&&
  Math.hypot(a.x-g.x,a.z-g.z)<=.40&&
  Math.abs(a.y-g.y)<=.22&&
  Math.hypot(h.x-old.x,h.z-old.z)<=.25&&
  Math.abs(h.y-old.y)<=.10&&
  Math.hypot(g.x-h.x,g.z-h.z)>=1.7;
}
/** Directions face AWAY from real human. Samples are NOT shot orders:
 * every result must be checked against actual original paint + Rapier.
 */
export function b150OriginalAllyInkCandidates(
 cpu:B150Foot,human:B150Foot
):readonly B150Foot[]{
 const dx=cpu.x-human.x,dz=cpu.z-human.z,length=Math.hypot(dx,dz);
 if(!Number.isFinite(length)||length<1.7||
    ![cpu.y,human.y].every(Number.isFinite))return [];
 // B151: investigate multiple REAL floor patches on the source side.
 // The previous 15 sparse proposals had 3 approvals but ZERO A1 shots
 // in genuine B150 Chromium. Wider/finer proposals are NOT authority:
 // each must pass the unchanged exact original solid + ink checks.
 const ux=dx/length,uz=dz/length;
 const angles=[0,Math.PI/6,-Math.PI/6,Math.PI/3,-Math.PI/3,
  Math.PI/2,-Math.PI/2];
 const output:B150Foot[]=[];
 for(const radius of [1.2,1.6,2,2.4,2.8,3.2])for(const theta of angles){
  const c=Math.cos(theta),s=Math.sin(theta);
  const x=cpu.x+radius*(ux*c-uz*s);
  const z=cpu.z+radius*(uz*c+ux*s);
  if(Math.hypot(x-human.x,z-human.z)<=2.6)continue;
  output.push({x,y:cpu.y,z});
 }
 return output;
}

/** B153: spread genuine A1 paint attempts across distinct candidate rays.
 * Reordering CANNOT authorize any original floor, aim or scoreable paint.
 * SourceTraffic still validates every rotated candidate using the original
 * human exclusion, ink ownership, Rapier solid and polygon inset gates.
 * The submitted proposals are never edited or promoted to game state.
 */
export function diversifyB153OriginalAllyInkCandidates(
 points:readonly B150Foot[],completedApprovals:number
):readonly B150Foot[]{
 if(!Number.isSafeInteger(completedApprovals)||completedApprovals<0)
  return [];
 if(points.length<=1)return [...points];
 const start=completedApprovals%points.length;
 return [...points.slice(start),...points.slice(0,start)];
}

/** A1 must paint the actual unowned SOURCE grid, not repeatedly aim at a
 * freshly OWN center while real unpainted neighbors remain. Reuse B180's
 * already source-gated, non-scoreable same-surface neighbor resolution.
 * This is ONLY a suggested aim; SourceTraffic independently checks the
 * true Rapier floor, inset, live human clearance and native projectile ray
 * before any paid shot. It never edits cells or supplies a stage path. */
export function b150ActualUnownedAllyPaintAim(
 sample:GameplayInkSample,team:Team.A|Team.B
):Vec3|null{
 if(!sample.surface.id.startsWith('UndertowT21D:')||
    sample.surface.isScoreable||
    b180OriginalSourcePatchOpportunity(sample,team)<=0)return null;
 return sample.owner===team?
   b180OriginalSourceUnownedNeighborAim(sample,team):
   sample.surface.localToWorld(sample.u,sample.v);
}

/** Keep A1 co-op paint suggestions inside the REAL native weapon lane.
 * This is only a read-only filter after original ownerGrid/solid/footprint
 * admission; it does not grant a shot, projectile, hit or ink raster.
 * The first original Rapier blocker may be the certified target floor
 * itself, but never an intervening wall or an earlier hit on that floor. */
export function b150OriginalAllyNativeShotReachable(
 actualCpuFoot:B150Foot,target:B150Foot,
 nativeWeaponRangeMeters:number,originalSolidId:string,
 firstStageBlock:Readonly<{solidId:string;point:B150Foot}>|null
):boolean{
 if(!originalSolidId.startsWith('UndertowT21D:')||
    !Number.isFinite(nativeWeaponRangeMeters)||
    nativeWeaponRangeMeters<=0||
    [actualCpuFoot,target].some(p=>
     ![p.x,p.y,p.z].every(Number.isFinite))||
    Math.hypot(actualCpuFoot.x-target.x,
     actualCpuFoot.z-target.z)>nativeWeaponRangeMeters)return false;
 if(!firstStageBlock)return true;
 const hit=firstStageBlock.point;
 return firstStageBlock.solidId===originalSolidId&&
  [hit.x,hit.y,hit.z].every(Number.isFinite)&&
  Math.hypot(hit.x-target.x,hit.y-target.y,hit.z-target.z)<=.22;
}
