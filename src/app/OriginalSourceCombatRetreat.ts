/** A low-HP CPU may seek ACTUAL same-side OWN original ink. This module
 * chooses only previously vetted native patrol indices; it never grants
 * movement, a hit, HP recovery, a source collider or Turf scoring. */
import {Vec3} from 'playcanvas';
import type {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {SurfaceFlags,Team} from '../ink/types';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition} from '../stage/StageDefinition';
import {b178SampleRegisteredSourceFoot} from '../ai/B178OriginalSourceInkResources';

/** In real SOURCE combat a wounded CPU may choose only OWN ink carried
 * by its actual registered original Rapier support. Nearest optical ink
 * can belong to a different stacked slab or an adjacent ramp raster row.
 * This is a goal preference, not a collision, nav or HP permission. */
export function originalSourceRegisteredOwnFoot(
 ink:GameplayInkSystem,
 stage:StageDefinition,
 physics:Pick<RapierStagePhysics,'castStageSegment'>,
 foot:Vec3,
 team:Team.A|Team.B
):boolean{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0)||
    ![foot.x,foot.y,foot.z].every(Number.isFinite))return false;
 const hit=physics.castStageSegment(
  new Vec3(foot.x,foot.y+.65,foot.z),
  new Vec3(foot.x,foot.y-.65,foot.z),'ink-projectile');
 if(!hit||Math.abs(hit.point.y-foot.y)>.25||
    !stage.solids.some(s=>s.id===hit.solidId))return false;
 const sample=b178SampleRegisteredSourceFoot(
  ink,stage.paintSurfaces,hit);
 return !!sample&&sample.owner===team&&
   sample.surface.id.startsWith('UndertowT21D:')&&
   !sample.surface.isScoreable&&
   (sample.flags&SurfaceFlags.Paintable)!==0;
}

export interface OriginalSourceRetreatCandidate {
 readonly index:number;
 readonly foot:readonly [number,number,number];
 readonly actualOwnOriginalPaintCell:boolean;
 /** True only after real living actor and registered SOURCE Rapier LOS. */
 readonly exposedToRealEnemy?:boolean;
}
export interface OriginalSourceRetreatInput {
 readonly source:readonly [number,number,number,number];
 readonly selectedOriginalCombat:boolean;
 readonly activeGroundedRejoined:boolean;
 readonly team:'A'|'B';
 readonly hp:number;readonly maxHp:number;
 readonly realFoot:readonly [number,number,number];
 readonly originalCandidates:readonly OriginalSourceRetreatCandidate[];
 /** Stateful intent comes only from prior native HP observations. */
 readonly recoveringFromRealDamage?:boolean;
}
export function originalSourceCpuWoundedRecoveryActive(x:OriginalSourceRetreatInput):boolean{
 if(x.source.join(',')!=='25,17,26,0'||!x.selectedOriginalCombat||
    !x.activeGroundedRejoined||!['A','B'].includes(x.team)||
    !Number.isFinite(x.hp)||!Number.isFinite(x.maxHp)||
    x.maxHp<=0||x.hp<=0||x.hp>x.maxHp||
    x.realFoot.length!==3||!x.realFoot.every(Number.isFinite))return false;
 const sign=x.team==='A'?1:-1;
 if(x.realFoot[2]*sign<33||x.realFoot[1]<2.7||x.realFoot[1]>5.25)
   return false;
 // Hysteresis avoids immediately resuming attack at 36% after a single
 // genuine native healing tick. No HP value is assigned by this module.
 return x.recoveringFromRealDamage===true?
   x.hp<x.maxHp*.70:x.hp<=x.maxHp*.35;
}
export function originalSourceCpuMayHoldOwnInk(
 x:OriginalSourceRetreatInput, actualOwnOriginalPaintCell:boolean,
 exposedToRealEnemy=false
):boolean{
 // The caller must independently verify both actual registered Rapier foot
 // support and an active native GameplayInkSystem OWN source cell.
 return actualOwnOriginalPaintCell===true&&!exposedToRealEnemy&&
  originalSourceCpuWoundedRecoveryActive(x);
}
export function rankOriginalSourceCombatRetreatGoals(x:OriginalSourceRetreatInput):number[]{
 if(!originalSourceCpuWoundedRecoveryActive(x))return [];
 const sign=x.team==='A'?1:-1;
 const seen=new Set<number>();
 return x.originalCandidates.filter(g=>{
  if(!Number.isSafeInteger(g.index)||g.index<0||seen.has(g.index)||
     !g.actualOwnOriginalPaintCell||g.foot.length!==3||
     !g.foot.every(Number.isFinite))return false;
  seen.add(g.index);
  const behind=(g.foot[2]-x.realFoot[2])*sign;
  const meters=Math.hypot(
   g.foot[0]-x.realFoot[0],g.foot[2]-x.realFoot[2]);
  // Native original-source cover may be lateral even when no vetted
  // backward patrol foot is reachable. Never chase a forward attack
  // goal, cross the unbound middle, change physical layer, or invent a
  // destination: only existing SOURCE feet reach the path authority.
  return g.foot[2]*sign>=33&&g.foot[1]>=2.7&&g.foot[1]<=5.25&&
   Math.abs(g.foot[1]-x.realFoot[1])<=.30&&
   behind>=-.25&&behind<=18&&meters>=1.5&&meters<=18;
 }).sort((a,b)=>{
  const d=(g:OriginalSourceRetreatCandidate)=>
   Math.hypot(g.foot[0]-x.realFoot[0],g.foot[2]-x.realFoot[2]);
  const backward=(g:OriginalSourceRetreatCandidate)=>
   (g.foot[2]-x.realFoot[2])*sign>=1.5?0:1;
  // Safe cover outranks exposed fire; if equally sheltered, retreat
  // backward before laterally. Physical Recast+Rapier approval stays
  // in the caller, never inferred from sorting or nearest distance.
  return Number(a.exposedToRealEnemy===true)-
   Number(b.exposedToRealEnemy===true)||
   backward(a)-backward(b)||d(a)-d(b)||a.index-b.index;
 }).map(g=>g.index);
}
