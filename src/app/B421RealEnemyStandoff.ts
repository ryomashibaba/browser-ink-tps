/** A SOURCE-only native combat goal PROPOSAL. The caller must re-audit
 * its own existing original Rapier foot, the whole true Recast path,
 * actor clearance and the new goal. No hit, target, nav or Actor is created.
 * The three-argument 2m standoff is preserved for all legacy callers. */
import {chooseB142OriginalAllyStandoff,type B142Foot}
 from './UndertowF3OriginalAllyStandoff';

export interface B421OriginalWeaponLane {
 /** Actual equipped CPU weapon's existing native effective range. */
 readonly nativeWeaponRangeMeters:number;
 /** Same muzzle height as actual CpuAgentSystem.queueCpuWeaponRequest. */
 readonly nativeMuzzleHeightMeters:number;
 /** Existing actor's native hit-sphere height above its actual foot. */
 readonly enemyHitHeightMeters:number;
 /** Use registered ORIGINAL Rapier stage ink-projectile collision only. */
 readonly originalStageRayBlocked:(from:B142Foot,to:B142Foot)=>boolean;
}
export function b421RealEnemyStandoff(
 path:readonly B142Foot[],realEnemyFoot:B142Foot,side:1|-1,
 nativeLane?:B421OriginalWeaponLane
):B142Foot|null{
 const accepted=(x:B142Foot)=>[x.x,x.y,x.z].every(Number.isFinite)&&
  x.z*side>=33&&x.y>=2.7&&x.y<=5.25;
 if(![1,-1].includes(side)||!Array.isArray(path)||path.length<2||
    !accepted(realEnemyFoot)||path.some(x=>!accepted(x)))return null;
 const last=path[path.length-1]!;
 if(Math.hypot(last.x-realEnemyFoot.x,last.y-realEnemyFoot.y,
  last.z-realEnemyFoot.z)>.20)return null;

 // A longer ranged weapon need not approach right into the genuine
 // opponent capsule. Sample ONLY its already-audited Recast polyline,
 // never a straight-line shortcut or a new invented floor waypoint.
 // A genuine stage projectile ray must be open FROM the candidate's
 // native muzzle to the current enemy's hit sphere. No ray = no upgrade.
 if(nativeLane&&
    [nativeLane.nativeWeaponRangeMeters,
     nativeLane.nativeMuzzleHeightMeters,
     nativeLane.enemyHitHeightMeters].every(Number.isFinite)&&
    nativeLane.nativeWeaponRangeMeters>=3.5&&
    nativeLane.nativeMuzzleHeightMeters>.1&&
    nativeLane.enemyHitHeightMeters>.1){
  let pathMeters=0;
  for(let i=1;i<path.length;i++){
   const a=path[i-1]!,b=path[i]!;
   pathMeters+=Math.hypot(a.x-b.x,a.z-b.z);
  }
  const reach=Math.min(8,nativeLane.nativeWeaponRangeMeters*.68,
    pathMeters-.10);
  const aim={x:realEnemyFoot.x,
   y:realEnemyFoot.y+nativeLane.enemyHitHeightMeters,
   z:realEnemyFoot.z};
  for(let behind=Math.floor(reach*2)/2;behind>=2;behind-=.5){
   let remaining=behind;
   let candidate:B142Foot|null=null;
   for(let i=path.length-1;i>0;i--){
    const a=path[i-1]!,b=path[i]!;
    const length=Math.hypot(a.x-b.x,a.z-b.z);
    if(length<=1e-6)continue;
    if(remaining>length+1e-8){remaining-=length;continue;}
    const f=Math.max(0,Math.min(1,remaining/length));
    candidate={x:b.x+(a.x-b.x)*f,
     y:b.y+(a.y-b.y)*f,z:b.z+(a.z-b.z)*f};
    break;
   }
   if(!candidate||!accepted(candidate)||
      Math.abs(candidate.y-realEnemyFoot.y)>.30)continue;
   const d=Math.hypot(candidate.x-realEnemyFoot.x,
     candidate.z-realEnemyFoot.z);
   if(d<1.7||d>nativeLane.nativeWeaponRangeMeters*.90)continue;
   const muzzle={x:candidate.x,
    y:candidate.y+nativeLane.nativeMuzzleHeightMeters,z:candidate.z};
   if(!nativeLane.originalStageRayBlocked(muzzle,aim))return candidate;
  }
 }
 // No LOS-authorized ranged candidate: keep the previously strict
 // standoff only. The real projectile can still be blocked; no fake hit.
 const goal=chooseB142OriginalAllyStandoff(path,realEnemyFoot);
 if(!goal||!accepted(goal))return null;
 const d=Math.hypot(goal.x-realEnemyFoot.x,goal.z-realEnemyFoot.z);
 return d>=1.7&&d<=3.5?goal:null;
}
