/** Strict gameplay CPU→real HUMAN goal eligibility, NOT route authority. */
import {Team} from '../ink/types';
import {chooseB142OriginalAllyStandoff, type B142Foot}
 from './UndertowF3OriginalAllyStandoff';
export interface B192HumanCandidate{
 enabled:boolean;nativeTick:number;humanTick:number;
 cpuId:string;cpuTeam:Team.A|Team.B;
 cpuGrounded:boolean;cpuRejoined:boolean;sevenRejoined:boolean;
 humanAliveGrounded:boolean;
 cpuFoot:Readonly<{x:number;y:number;z:number}>;
 humanFoot:Readonly<{x:number;y:number;z:number}>;
 solids:number;paint:number;links:number;scoreable:number;
}
/** Both original source Rapier supports and full Recast path are mandatory
 * after this test. No stage, Actor, NavLink or physical-movement writes. */
export function eligibleB192SourceHumanPursuit(p:B192HumanCandidate):boolean{
 const a=p.cpuFoot,b=p.humanFoot;
 if(!p.enabled||!p.cpuGrounded||!p.cpuRejoined||!p.sevenRejoined||
    !p.humanAliveGrounded||p.solids!==25||p.paint!==17||
    p.links!==26||p.scoreable!==0||
    !Number.isSafeInteger(p.nativeTick)||p.nativeTick<0||
    p.humanTick!==p.nativeTick||
    p.cpuTeam!==Team.B||!['B1','B2','B3','B4'].includes(p.cpuId)||
    ![a.x,a.y,a.z,b.x,b.y,b.z].every(Number.isFinite))
  return false;
 // The genuine A-human must ALREADY be on the true B side; the
 // unresolved underpass is never treated as a free teleport or bridge.
 if(a.z> -33||b.z> -33||a.y<2.7||a.y>5.25||
    b.y<2.7||b.y>5.25||Math.abs(a.y-b.y)>.30)
  return false;
 const d=Math.hypot(a.x-b.x,a.z-b.z);
 return d>=1.7&&d<=10;
}

/** F3 enemy pursuit must stop at an existing native path waypoint,
 * rather than steering into the REAL player's occupied physics capsule.
 * The existing 2m source-path standoff chooser is a proposal only:
 * caller must recheck BOTH Rapier support and actual Recast route before
 * submitting an agent goal, and original CPU projectiles still own hits. */
export function chooseB192OriginalEnemyStandoff(
 path:readonly B142Foot[],realHumanFoot:B142Foot
):B142Foot|null{
 const p=chooseB142OriginalAllyStandoff(path,realHumanFoot);
 if(!p||p.z> -33||p.y<2.7||p.y>5.25||
    realHumanFoot.z> -33||
    Math.abs(p.y-realHumanFoot.y)>.30)return null;
 return p;
}
