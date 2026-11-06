/** A low-HP CPU may seek ACTUAL same-side OWN original ink. This module
 * chooses only previously vetted native patrol indices; it never grants
 * movement, a hit, HP recovery, a source collider or Turf scoring. */
export interface OriginalSourceRetreatCandidate {
 readonly index:number;
 readonly foot:readonly [number,number,number];
 readonly actualOwnOriginalPaintCell:boolean;
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
 x:OriginalSourceRetreatInput, actualOwnOriginalPaintCell:boolean
):boolean{
 // The caller must independently verify both actual registered Rapier foot
 // support and an active native GameplayInkSystem OWN source cell.
 return actualOwnOriginalPaintCell===true&&
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
  return g.foot[2]*sign>=33&&g.foot[1]>=2.7&&g.foot[1]<=5.25&&
   Math.abs(g.foot[1]-x.realFoot[1])<=.30&&behind>=1.5&&behind<=18;
 }).sort((a,b)=>{
  const d=(g:OriginalSourceRetreatCandidate)=>
   Math.hypot(g.foot[0]-x.realFoot[0],g.foot[2]-x.realFoot[2]);
  return d(a)-d(b)||a.index-b.index;
 }).map(g=>g.index);
}
