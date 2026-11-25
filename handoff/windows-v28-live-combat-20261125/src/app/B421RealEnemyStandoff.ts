/** A SOURCE-only native combat goal PROPOSAL. The caller must re-audit
 * its own existing original Rapier foot, the whole true Recast path,
 * actor clearance and the new goal. No hit, target, nav or Actor is created.
 * The three-argument 2m standoff is preserved for all legacy callers. */
import {chooseB142OriginalAllyStandoff,type B142Foot}
 from './UndertowF3OriginalAllyStandoff';
import {chooseB181OriginalSourceSight} from '../ai/B181OriginalSourceCombatSight';

export interface B421OriginalWeaponLane {
 /** Actual equipped CPU weapon's existing native effective range. */
 readonly nativeWeaponRangeMeters:number;
 /** Same muzzle height as actual CpuAgentSystem.queueCpuWeaponRequest. */
 readonly nativeMuzzleHeightMeters:number;
 /** Existing actor's native hit-sphere height above its actual foot. */
 readonly enemyHitHeightMeters:number;
 /** Other samples inside that same real actor's current collider. */
 readonly enemyAlternateHitHeightsMeters?:readonly number[];
 /** Use registered ORIGINAL Rapier stage ink-projectile collision only. */
 readonly originalStageRayBlocked:(from:B142Foot,to:B142Foot)=>boolean;
}
export interface B421StandoffRouteCheck {
 /** Check support and the complete native path to this firing position. */
 readonly admit:(candidate:B142Foot)=>boolean;
 /** The native route may stop before the opponent; only a clear ranged lane can use it. */
 readonly allowPartialFiringLane?:boolean;
 /** Keep the old full route requirement for a standoff with no clear ray. */
 readonly allowFallback:()=>boolean;
}
export function b421RealEnemyStandoff(
 path:readonly B142Foot[],realEnemyFoot:B142Foot,side:1|-1,
 nativeLane?:B421OriginalWeaponLane,routeCheck?:B421StandoffRouteCheck
):B142Foot|null{
 const accepted=(x:B142Foot)=>[x.x,x.y,x.z].every(Number.isFinite)&&
  x.z*side>=33&&x.y>=2.7&&x.y<=5.25;
 // A native partial corridor can consist of just the actual current
 // foot. This is not a traversable route or permission to move: only the
 // separately re-audited stationary firing lane below may accept it.
 const stationaryPartial=routeCheck?.allowPartialFiringLane===true&&
  nativeLane!==undefined;
 if(![1,-1].includes(side)||!Array.isArray(path)||
    path.length<(stationaryPartial?1:2)||
    !accepted(realEnemyFoot)||path.some(x=>!accepted(x)))return null;
 const last=path[path.length-1]!;
 const reachesEnemy=Math.hypot(last.x-realEnemyFoot.x,last.y-realEnemyFoot.y,
  last.z-realEnemyFoot.z)<=.20;
 if(!reachesEnemy&&!routeCheck?.allowPartialFiringLane)return null;

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
  const opponent={id:'opponent',body:aim,
   alternateHitPoints:nativeLane.enemyAlternateHitHeightsMeters?.map(y=>
    ({...aim,y:realEnemyFoot.y+y}))};
  // For a partial path the terminal point can already be a firing lane.
  const minimumBehind=reachesEnemy?2:0;
  for(let behind=Math.floor(reach*2)/2;behind>=minimumBehind;behind-=.5){
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
   if(!candidate||!accepted(candidate))continue;
   const d=Math.hypot(candidate.x-realEnemyFoot.x,
     candidate.z-realEnemyFoot.z);
   if(d<1.7||d>nativeLane.nativeWeaponRangeMeters*.90)continue;
   const muzzle={x:candidate.x,
    y:candidate.y+nativeLane.nativeMuzzleHeightMeters,z:candidate.z};
   if(chooseB181OriginalSourceSight(muzzle,[opponent],
      nativeLane.originalStageRayBlocked,null,nativeLane.nativeWeaponRangeMeters).target&&
      (!routeCheck||routeCheck.admit(candidate)))return candidate;
  }
  // Recast may return one point (or repeated points) when this actor is
  // already on the only genuine reachable firing tile. A partial route
  // with zero travel is still a legal STATIONARY shot only if the existing
  // full foot-support/path audit and the live Rapier LOS both approve it.
  // Do not relax the original full-route, melee, or no-lane behavior.
  if(stationaryPartial&&pathMeters<=.10){
   const candidate=path[0]!;
   const d=Math.hypot(candidate.x-realEnemyFoot.x,
     candidate.z-realEnemyFoot.z);
   if(d>=1.7&&d<=nativeLane.nativeWeaponRangeMeters*.90){
    const muzzle={x:candidate.x,
     y:candidate.y+nativeLane.nativeMuzzleHeightMeters,z:candidate.z};
    if(chooseB181OriginalSourceSight(muzzle,[opponent],
       nativeLane.originalStageRayBlocked,null,
       nativeLane.nativeWeaponRangeMeters).target&&
       routeCheck!.admit(candidate))return candidate;
   }
  }
 }
 // No LOS-authorized ranged candidate: keep the previously strict
 // standoff only. The real projectile can still be blocked; no fake hit.
 if(!reachesEnemy||(routeCheck&&!routeCheck.allowFallback()))return null;
 let goal=chooseB142OriginalAllyStandoff(path,realEnemyFoot);
 // B142's 30cm SAME-LEVEL preference can suppress all authentic
 // encounters on a verified original ramp. Preserve B142 for flat
 // routes; only when it vetoes an elevated path, use its same 2m-back
 // interpolation on the already-supplied native Recast polyline.
 // Caller must STILL prove the intermediate Rapier support and final
 // native path before submitting this point to the actual Crowd agent.
 if(!goal&&path.length>=2&&
    Math.abs(path[0]!.y-realEnemyFoot.y)<=1.75){
  let remaining=2;
  for(let i=path.length-1;i>0;i--){
   const a=path[i-1]!,b=path[i]!;
   const span=Math.hypot(a.x-b.x,a.z-b.z);
   if(span<=1e-6)continue;
   if(remaining>span){remaining-=span;continue;}
   const t=remaining/span;
   const candidate={x:b.x+(a.x-b.x)*t,
    y:b.y+(a.y-b.y)*t,z:b.z+(a.z-b.z)*t};
   if(accepted(candidate)&&
      Math.abs(candidate.y-realEnemyFoot.y)<=1.75)
    goal=candidate;
   break;
  }
 }
 if(!goal||!accepted(goal))return null;
 const d=Math.hypot(goal.x-realEnemyFoot.x,goal.z-realEnemyFoot.z);
 return d>=1.7&&d<=3.5&&
  Math.abs(goal.y-realEnemyFoot.y)<=1.75&&
  (!routeCheck||routeCheck.admit(goal))?goal:null;
}
